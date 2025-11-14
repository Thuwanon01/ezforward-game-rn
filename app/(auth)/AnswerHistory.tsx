import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    LayoutAnimation,
    Modal,
    Platform,
    Pressable,
    SafeAreaView,
    Text,
    TouchableOpacity,
    UIManager,
    View,
} from 'react-native';

import AnswerHistoryItem from '@/components/lab/AnswerHistoryItem';
import AnswerHistoryPagination from '@/components/lab/AnswerHistoryPagination';
import { Box } from '@/components/ui/box/index.web';
import { Heading } from '@/components/ui/heading/index.web';
import { useAuth } from '@/contexts/AuthContext';
import useRepositories from '@/hooks/useRepositories';
import { router } from 'expo-router';

/* ---------- Types ---------- */
interface Choice {
    graph_id: string;
    is_correct: boolean;
    related_to: any[];
    choice_text: string;
    answer_explanation: string;
}
interface QuestionData {
    choices: Choice[];
    graph_id: string;
    quiz_text: string;
    related_to: any[];
}
interface StudentAnswer {
    id: number;
    answered_at: string;
    student_id: number;
    question: string | QuestionData;
    selected_choice: string | Choice;
    question_gid: string;
    answer_gid: string;
    time_taken_ms: number;
    time_read_answer_ms: number;
    use_helper: string;
    choice_cutting: string;
    is_correct: boolean;
    learning_plan_id: number;
    graph_update: string;
    parsedQuestion?: QuestionData;
    parsedSelectedChoice?: Choice;
}

/* ---------- Android layout animation ---------- */
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const handleBackPress = () => {
    router.push('/game');
};

/* ---------- Helpers ---------- */

const isValidDate = (d: any): d is Date =>
    d instanceof Date && !Number.isNaN(d.getTime());

const formatDateLabel = (date: Date | null, short = false): string => {
    if (!date || !isValidDate(date)) return '';
    const options: Intl.DateTimeFormatOptions = short
        ? { month: 'short', day: 'numeric' }
        : { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('th-TH', options);
};

// YYYY-MM-DD สำหรับ backend
const toYmd = (d?: Date | null): string | undefined => {
    if (!d || !isValidDate(d)) return undefined;
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

// web date <-> string
const toDateInputValue = (d?: Date | null): string => {
    if (!d || !isValidDate(d)) return '';
    return toYmd(d)!;
};

const fromDateInputValue = (v: string): Date | null => {
    if (!v) return null;
    const parts = v.split('-');
    if (parts.length !== 3) return null;
    const [y, m, d] = parts.map(Number);
    if (!y || !m || !d) return null;
    const dt = new Date(y, m - 1, d);
    return isValidDate(dt) ? dt : null;
};

// safe JSON parse
const safeParse = <T,>(v: any): T | undefined => {
    if (v == null) return undefined;
    if (typeof v === 'object') return v as T;
    if (typeof v === 'string') {
        try {
            return JSON.parse(v) as T;
        } catch {
            return undefined;
        }
    }
    return undefined;
};

/* ---------- Quick Range ---------- */
type QuickRange = 'custom' | 'today' | '7d' | '30d';

const addDays = (d: Date, delta: number) => {
    const x = new Date(d);
    x.setDate(x.getDate() + delta);
    return x;
};

// ใช้แค่ “วัน” ไม่สนเวลา
const getRange = (key: QuickRange): { start: Date; end: Date } => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (key === 'today') {
        return { start: today, end: today };
    }

    if (key === '7d') {
        const start = addDays(today, -6); // รวมวันนี้
        return { start, end: today };
    }

    if (key === '30d') {
        const start = addDays(today, -29); // รวมวันนี้
        return { start, end: today };
    }

    return { start: today, end: today };
};

export default function AnswerHistoryScreen() {
    // default = today
    const todayStart = useMemo(() => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }, []);

    const todayEnd = useMemo(() => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }, []);

    const [startDate, setStartDate] = useState<Date | null>(todayStart);
    const [endDate, setEndDate] = useState<Date | null>(todayEnd);

    const [answers, setAnswers] = useState<StudentAnswer[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedAnswerId, setExpandedAnswerId] = useState<number | null>(null);
    const [showPicker, setShowPicker] = useState<null | 'start' | 'end'>(null);

    const [totalAnswers, setTotalAnswers] = useState(0);
    const [correctAnswers, setCorrectAnswers] = useState(0);
    const [incorrectAnswers, setIncorrectAnswers] = useState(0);
    const [accuracyRate, setAccuracyRate] = useState(0);

    const [quickRange, setQuickRange] = useState<QuickRange>('today');

    // Pagination
    const [page, setPage] = useState<number>(1);
    const [initialTotalPages, setInitialTotalPages] = useState<number | null>(null);

    const totalPages: number = initialTotalPages ?? 1;

    const auth = useAuth();
    const repos = useRepositories(auth.accessToken).current;

    /* ---------- Auto-fix swapped dates ---------- */
    useEffect(() => {
        if (
            startDate &&
            endDate &&
            isValidDate(startDate) &&
            isValidDate(endDate) &&
            startDate > endDate
        ) {
            setEndDate(startDate);
        }
    }, [startDate, endDate]);

    /* ---------- Apply default quick range once ---------- */
    useEffect(() => {
        const { start, end } = getRange('today');
        setStartDate(start);
        setEndDate(end);
        setQuickRange('today');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /* ---------- Reset pagination when date range changes ---------- */
    useEffect(() => {
        setPage(1);
        setInitialTotalPages(null);
    }, [startDate, endDate]);

    /* ---------- Data fetch (summary + paginated history) ---------- */
    useEffect(() => {
        let aborted = false;

        const fetchDataAndProcess = async () => {
            if (!repos || !repos.gamev2) {
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const startYmd = toYmd(startDate);
                const endYmd = toYmd(endDate);

                const gameV2Repo = repos.gamev2;

                const [summaryData, historyData] = await Promise.all([
                    gameV2Repo.fetchAnswerSummary({
                        answered_date__gte: startYmd,
                        answered_date__lte: endYmd,
                    }),
                    gameV2Repo.fetchAnswerHistory({
                        start_date: startYmd,
                        end_date: endYmd,
                        page: String(page),
                    }),
                ]);

                if (aborted) return;

                // ---- Summary
                const total = summaryData?.total ?? 0;
                const correct = summaryData?.correct ?? 0;
                const incorrect = total - correct;
                const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

                setTotalAnswers(total);
                setCorrectAnswers(correct);
                setIncorrectAnswers(incorrect);
                setAccuracyRate(accuracy);

                // ---- History
                const rawList: any[] = Array.isArray(historyData)
                    ? historyData
                    : historyData?.results ??
                    historyData?.users_studentanswer ??
                    [];

                const parsed = rawList.map((a: any) => {
                    const parsedQ = safeParse<QuestionData>(a.question);
                    const parsedChoice = safeParse<Choice>(a.selected_choice);
                    return {
                        ...a,
                        parsedQuestion: parsedQ,
                        parsedSelectedChoice: parsedChoice,
                    } as StudentAnswer;
                });

                setAnswers(parsed);

                // ---- Pagination meta
                setInitialTotalPages((prev) => {
                    if (prev !== null) return prev;

                    const totalCount: number =
                        (Array.isArray(historyData)
                            ? historyData.length
                            : historyData?.count) ?? rawList.length ?? 0;

                    const pageSize: number =
                        rawList.length > 0 ? rawList.length : 20;

                    const computed =
                        totalCount > 0 ? Math.ceil(totalCount / pageSize) : 1;

                    console.log('[pagination] initial totalPages =', computed);
                    return computed;
                });
            } catch (err: any) {
                if (!aborted) {
                    console.error('Failed fetch history:', err);
                    setError(err?.message ?? 'Error fetching data.');
                    setAnswers([]);
                }
            } finally {
                if (!aborted) setLoading(false);
            }
        };

        fetchDataAndProcess();
        return () => {
            aborted = true;
        };
    }, [startDate, endDate, page, repos]);

    /* ---------- Quick range actions ---------- */
    const applyQuickRange = (key: QuickRange) => {
        const { start, end } = getRange(key);
        setQuickRange(key);
        setStartDate(start);
        setEndDate(end);
    };

    /* ---------- Date pickers ---------- */
    const showStartDatePicker = () => setShowPicker('start');
    const showEndDatePicker = () => setShowPicker('end');
    const hideDatePicker = () => setShowPicker(null);

    const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        if (event.type === 'dismissed') {
            hideDatePicker();
            return;
        }
        if (event.type === 'set' && selectedDate) {
            const d = new Date(
                selectedDate.getFullYear(),
                selectedDate.getMonth(),
                selectedDate.getDate(),
            );
            if (!isValidDate(d)) {
                hideDatePicker();
                return;
            }

            if (showPicker === 'start') {
                setStartDate(d);
            } else if (showPicker === 'end') {
                setEndDate(d);
            }

            setQuickRange('custom');
            hideDatePicker();
        }
    };

    // Clear → reset เป็น Today (ไม่ให้มี null / invalid)
    const clearDateFilter = () => {
        const { start, end } = getRange('today');
        setStartDate(start);
        setEndDate(end);
        setQuickRange('today');
    };

    /* ---------- Expand item ---------- */
    const handleToggleDetails = useCallback((id: number) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedAnswerId((prev) => (prev === id ? null : id));
    }, []);

    const renderItem = useCallback(
        ({ item }: { item: StudentAnswer }) => (
            <AnswerHistoryItem
                item={item}
                isExpanded={expandedAnswerId === item.id}
                onToggleDetails={handleToggleDetails}
            />
        ),
        [expandedAnswerId, handleToggleDetails],
    );

    const renderDateTimePicker = () => {
        if (!showPicker) return null;

        const value =
            (showPicker === 'start' ? startDate : endDate) || new Date();
        const maximumDate =
            (showPicker === 'start' ? endDate : new Date()) || new Date();
        const minimumDate =
            showPicker === 'end' && startDate ? startDate : undefined;

        if (Platform.OS === 'web') {
            return (
                <Modal
                    visible
                    transparent
                    animationType="fade"
                    onRequestClose={hideDatePicker}
                >
                    <View className="flex-1 items-center justify-center bg-black/50">
                        <View className="items-center rounded-xl bg-white p-5 shadow-md">
                            <input
                                type="date"
                                value={toDateInputValue(value)}
                                max={toDateInputValue(maximumDate)}
                                min={minimumDate ? toDateInputValue(minimumDate) : undefined}
                                onChange={(e) => {
                                    const picked = fromDateInputValue(e.currentTarget.value);
                                    if (!picked) return;
                                    if (showPicker === 'start') {
                                        setStartDate(picked);
                                    } else {
                                        setEndDate(picked);
                                    }
                                    setQuickRange('custom');
                                }}
                                style={{
                                    fontSize: 16,
                                    padding: 8,
                                    borderRadius: 8,
                                    border: '1px solid #d1d5db',
                                    width: 240,
                                    outline: 'none',
                                }}
                            />
                            <TouchableOpacity
                                onPress={hideDatePicker}
                                className="mt-4 rounded-md bg-indigo-50 px-5 py-2"
                            >
                                <Text className="text-indigo-600">Close</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            );
        }

        return (
            <DateTimePicker
                value={isValidDate(value) ? value : new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                onChange={onDateChange}
                maximumDate={maximumDate}
                minimumDate={minimumDate}
            />
        );
    };

    /* ---------- Render: repo prep guard ---------- */
    if (!repos || !repos.gamev2) {
        return (
            <SafeAreaView className="flex-1 items-center justify-center bg-gray-100">
                <ActivityIndicator size="large" color="#2563eb" />
                <Text className="mt-1 text-gray-500">
                    Preparing repositories...
                </Text>
            </SafeAreaView>
        );
    }

    /* ---------- Render: loading/error ---------- */
    if (loading && answers.length === 0 && !error) {
        return (
            <SafeAreaView className="flex-1 items-center justify-center bg-gray-100">
                <ActivityIndicator size="large" color="#2563eb" />
                <Text className="mt-1 text-gray-500">Loading history...</Text>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView className="flex-1 items-center justify-center bg-gray-100 px-4">
                <Ionicons
                    name="alert-circle-outline"
                    size={48}
                    color="#ef4444"
                />
                <Text className="mt-3 text-lg font-bold text-red-600">
                    เกิดข้อผิดพลาด
                </Text>
                <Text className="mt-1 text-center text-gray-600">{error}</Text>
            </SafeAreaView>
        );
    }

    /* ---------- Render: main ---------- */
    return (
        <SafeAreaView className="flex-1 bg-gray-100">
            {/* Header & Filters */}
            <View className="border-b border-gray-100 bg-white p-0">
                <Box className="flex-row items-center justify-between px-4 py-3 bg-white shadow">
                    <Pressable onPress={handleBackPress} className="p-2">
                        <Ionicons name="arrow-back" size={24} color="black" />
                    </Pressable>
                    <Heading size="lg">Answer History</Heading>
                    <View className="w-8" />
                </Box>

                <View className="mt-4 flex-row items-center gap-2 px-4 pb-3">
                    <TouchableOpacity
                        onPress={showStartDatePicker}
                        className="flex-1 flex-row items-center justify-center gap-2 rounded-lg border border-gray-300 bg-gray-100 px-3 py-2.5"
                    >
                        <Ionicons
                            name="calendar-outline"
                            size={18}
                            color="#4b5563"
                        />
                        <Text className="text-sm text-gray-700">
                            {startDate
                                ? formatDateLabel(startDate, true)
                                : 'Start Date'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={showEndDatePicker}
                        className="flex-1 flex-row items-center justify-center gap-2 rounded-lg border border-gray-300 bg-gray-100 px-3 py-2.5"
                    >
                        <Ionicons
                            name="calendar-outline"
                            size={18}
                            color="#4b5563"
                        />
                        <Text className="text-sm text-gray-700">
                            {endDate
                                ? formatDateLabel(endDate, true)
                                : 'End Date'}
                        </Text>
                    </TouchableOpacity>

                    {(startDate || endDate) && (
                        <TouchableOpacity
                            onPress={clearDateFilter}
                            className="items-center justify-center p-2"
                        >
                            <Ionicons
                                name="close-circle"
                                size={20}
                                color="#6b7280"
                            />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Quick Ranges */}
                <View className="mt-3 flex-row items-center justify-center gap-2">
                    {(
                        [
                            { key: 'today', label: 'Today' },
                            { key: '7d', label: '7 Days' },
                            { key: '30d', label: '30 Days' },
                        ] as { key: QuickRange; label: string }[]
                    ).map(({ key, label }) => {
                        const active = quickRange === key;
                        return (
                            <TouchableOpacity
                                key={key}
                                onPress={() => applyQuickRange(key)}
                                className={[
                                    'rounded-full border px-3 py-1.5',
                                    active
                                        ? 'border-indigo-600 bg-indigo-600'
                                        : 'border-gray-300 bg-white',
                                ].join(' ')}
                            >
                                <Text
                                    className={
                                        active
                                            ? 'font-semibold text-white'
                                            : 'text-gray-700'
                                    }
                                >
                                    {label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                    {quickRange !== 'custom' && (
                        <TouchableOpacity
                            onPress={() => setQuickRange('custom')}
                            className="rounded-full border border-gray-300 bg-white px-3 py-1.5"
                        >
                            <Text className="text-gray-700">Custom</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Summary */}
            <View className="space-y-3 border-b border-gray-200 bg-white p-4">
                <View className="flex-row justify-between gap-2">
                    <View className="flex-1 items-center rounded-lg bg-gray-100 p-3">
                        <Text className="text-sm font-medium text-gray-500">
                            Total
                        </Text>
                        <Text className="text-2xl font-extrabold text-gray-800">
                            {totalAnswers}
                        </Text>
                    </View>
                    <View className="flex-1 items-center rounded-lg bg-green-100 p-3">
                        <Text className="text-sm font-medium text-green-700">
                            Correct
                        </Text>
                        <Text className="text-2xl font-extrabold text-green-800">
                            {correctAnswers}
                        </Text>
                    </View>
                    <View className="flex-1 items-center rounded-lg bg-red-100 p-3">
                        <Text className="text-sm font-medium text-red-700">
                            Incorrect
                        </Text>
                        <Text className="text-2xl font-extrabold text-red-800">
                            {incorrectAnswers}
                        </Text>
                    </View>
                </View>
                <View className="flex-row items-center justify-between rounded-lg bg-blue-100 p-3">
                    <Text className="text-sm font-medium text-blue-700">
                        Accuracy Rate
                    </Text>
                    <Text className="text-lg font-extrabold text-blue-800">
                        {accuracyRate}%
                    </Text>
                </View>
            </View>

            {/* Inline loader */}
            {loading && (
                <View className="py-3">
                    <ActivityIndicator size="small" color="#2563eb" />
                </View>
            )}

            {/* List */}
            {!loading && (
                <FlatList
                    data={answers}
                    renderItem={renderItem}
                    keyExtractor={(item) => String(item.id)}
                    contentContainerStyle={{
                        paddingHorizontal: 16,
                        paddingTop: 16,
                        paddingBottom: 16,
                    }}
                    ListEmptyComponent={
                        <View className="mt-10 items-center">
                            <Text className="text-lg text-gray-500">
                                No answers found for this period.
                            </Text>
                        </View>
                    }
                />
            )}

            {/* Pagination bar (ใช้ component แยก) */}
            <AnswerHistoryPagination
                page={page}
                totalPages={totalPages}
                loading={loading}
                onChangePage={setPage}
            />

            {/* Date Picker */}
            {renderDateTimePicker()}
        </SafeAreaView>
    );
}
