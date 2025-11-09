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
    // Handle back button press
    router.push("/game");
}

/* ---------- Helpers ---------- */
const formatDateLabel = (date: Date | null, short = false): string => {
    if (!date) return '';
    const options: Intl.DateTimeFormatOptions = short
        ? { month: 'short', day: 'numeric' }
        : { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('th-TH', options);
};
const getStartOfDay = (d: Date): Date => {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
};
const getEndOfDay = (d: Date): Date => {
    const x = new Date(d);
    x.setHours(23, 59, 59, 999);
    return x;
};
// normalize a local-day boundary to UTC ISO without shifting the represented local day
const toUtcBoundary = (d: Date, isEnd = false) => {
    const local = new Date(d);
    if (isEnd) local.setHours(23, 59, 59, 999);
    else local.setHours(0, 0, 0, 0);
    const utc = new Date(local.getTime() - local.getTimezoneOffset() * 60000);
    return utc.toISOString();
};
// YYYY-MM-DD (สำหรับ backend /api/answers/history)
const toYmd = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
// web date <-> string
const toDateInputValue = (d: Date) => toYmd(d);
const fromDateInputValue = (v: string) => {
    const [y, m, d] = v.split('-').map(Number);
    return new Date(y, m - 1, d);
};
// safe JSON parse that accepts object/string
const safeParse = <T,>(v: any): T | undefined => {
    if (v == null) return undefined;
    if (typeof v === 'object') return v as T;
    if (typeof v === 'string') {
        try { return JSON.parse(v) as T; } catch { return undefined; }
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
const getRange = (key: QuickRange): { start: Date; end: Date } => {
    const t0 = getStartOfDay(new Date());
    const t1 = getEndOfDay(new Date());
    if (key === 'today') return { start: t0, end: t1 };
    if (key === '7d') return { start: getStartOfDay(addDays(t0, -6)), end: t1 };   // รวมวันนี้
    if (key === '30d') return { start: getStartOfDay(addDays(t0, -29)), end: t1 }; // รวมวันนี้
    return { start: t0, end: t1 };
};

export default function AnswerHistoryScreen() {
    const todayStart = useMemo(() => getStartOfDay(new Date()), []);
    const todayEnd = useMemo(() => getEndOfDay(new Date()), []);

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

    const auth = useAuth();
    const repos = useRepositories(auth.accessToken).current;

    /* ---------- Auto-fix swapped dates ---------- */
    useEffect(() => {
        if (startDate && endDate && startDate > endDate) {
            setEndDate(getEndOfDay(startDate));
        }
    }, [startDate, endDate]);

    /* ---------- Apply default quick range once ---------- */
    useEffect(() => {
        // ensure state stays in sync at mount
        const { start, end } = getRange('today');
        setStartDate(start);
        setEndDate(end);
        setQuickRange('today');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /* ---------- Data fetch ---------- */
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
                // summary: ISO UTC boundaries
                const apiStartDateISO = startDate ? toUtcBoundary(startDate, false) : undefined;
                const apiEndDateISO = endDate ? toUtcBoundary(endDate, true) : undefined;

                // history: YYYY-MM-DD
                const startYmd = startDate ? toYmd(startDate) : undefined;
                const endYmd = endDate ? toYmd(endDate) : undefined;
                const nextEndYmd = endDate ? toYmd(addDays(endDate, 1)) : undefined; // รวมวันสุดท้าย

                const gameV2Repo = repos.gamev2;

                const [summaryData, historyData] = await Promise.all([
                    gameV2Repo.fetchAnswerSummary({
                        answered_date__gte: startYmd,
                        answered_date__lte: endYmd,
                    }),
                    gameV2Repo.fetchAnswerHistory({
                        start_date: startYmd,
                        end_date: nextEndYmd,
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

                // ---- History (support multiple shapes)
                const rawList: any[] = Array.isArray(historyData)
                    ? historyData
                    : (historyData?.results ?? historyData?.users_studentanswer ?? []);

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
        return () => { aborted = true; };
    }, [startDate, endDate]);

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
        if (event.type === 'dismissed') { hideDatePicker(); return; }
        if (event.type === 'set' && selectedDate) {
            if (showPicker === 'start') setStartDate(getStartOfDay(selectedDate));
            else if (showPicker === 'end') setEndDate(getEndOfDay(selectedDate));
            setQuickRange('custom'); // ผู้ใช้แก้เอง → custom
            hideDatePicker();
        }
    };

    const clearDateFilter = () => {
        setStartDate(null);
        setEndDate(null);
        setQuickRange('custom');
    };

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

        const value = (showPicker === 'start' ? startDate : endDate) || new Date();
        const maximumDate = (showPicker === 'start' ? endDate : new Date()) || new Date();
        const minimumDate = showPicker === 'end' && startDate ? startDate : undefined;

        if (Platform.OS === 'web') {
            return (
                <Modal visible transparent animationType="fade" onRequestClose={hideDatePicker}>
                    <View className="flex-1 items-center justify-center bg-black/50">
                        <View className="items-center rounded-xl bg-white p-5 shadow-md">
                            {/* DOM input: NativeWind ไม่กินกับ DOM → ใช้ style ปกติ */}
                            <input
                                type="date"
                                value={toDateInputValue(value)}
                                max={maximumDate ? toDateInputValue(maximumDate) : undefined}
                                min={minimumDate ? toDateInputValue(minimumDate) : undefined}
                                onChange={(e) => {
                                    const picked = fromDateInputValue(e.currentTarget.value);
                                    if (showPicker === 'start') setStartDate(getStartOfDay(picked));
                                    else setEndDate(getEndOfDay(picked));
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
                            <TouchableOpacity onPress={hideDatePicker} className="mt-4 rounded-md bg-indigo-50 px-5 py-2">
                                <Text className="text-indigo-600">Close</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            );
        }

        return (
            <DateTimePicker
                value={value}
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
                <Text className="mt-1 text-gray-500">Preparing repositories...</Text>
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
                <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
                <Text className="mt-3 text-lg font-bold text-red-600">เกิดข้อผิดพลาด</Text>
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
                    {/* Placeholder for alignment */}
                </Box>

                <View className="flex-row items-center gap-2 mt-4 px-4 pb-3">
                    <TouchableOpacity onPress={showStartDatePicker} className="flex-1 flex-row items-center justify-center gap-2 rounded-lg border border-gray-300 bg-gray-100 px-3 py-2.5">
                        <Ionicons name="calendar-outline" size={18} color="#4b5563" />
                        <Text className="text-sm text-gray-700">
                            {startDate ? formatDateLabel(startDate, true) : 'Start Date'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={showEndDatePicker} className="flex-1 flex-row items-center justify-center gap-2 rounded-lg border border-gray-300 bg-gray-100 px-3 py-2.5">
                        <Ionicons name="calendar-outline" size={18} color="#4b5563" />
                        <Text className="text-sm text-gray-700">
                            {endDate ? formatDateLabel(endDate, true) : 'End Date'}
                        </Text>
                    </TouchableOpacity>

                    {(startDate || endDate) && (
                        <TouchableOpacity onPress={clearDateFilter} className="items-center justify-center p-2">
                            <Ionicons name="close-circle" size={20} color="#6b7280" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Quick Ranges */}
                <View className="mt-3 flex-row items-center justify-center gap-2">
                    {([
                        { key: 'today', label: 'Today' },
                        { key: '7d', label: '7 Days' },
                        { key: '30d', label: '30 Days' },
                    ] as { key: QuickRange; label: string }[]).map(({ key, label }) => {
                        const active = quickRange === key;
                        return (
                            <TouchableOpacity
                                key={key}
                                onPress={() => applyQuickRange(key)}
                                className={[
                                    'rounded-full border px-3 py-1.5',
                                    active ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300 bg-white',
                                ].join(' ')}
                            >
                                <Text className={active ? 'font-semibold text-white' : 'text-gray-700'}>
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
                        <Text className="text-sm font-medium text-gray-500">Total</Text>
                        <Text className="text-2xl font-extrabold text-gray-800">{totalAnswers}</Text>
                    </View>
                    <View className="flex-1 items-center rounded-lg bg-green-100 p-3">
                        <Text className="text-sm font-medium text-green-700">Correct</Text>
                        <Text className="text-2xl font-extrabold text-green-800">{correctAnswers}</Text>
                    </View>
                    <View className="flex-1 items-center rounded-lg bg-red-100 p-3">
                        <Text className="text-sm font-medium text-red-700">Incorrect</Text>
                        <Text className="text-2xl font-extrabold text-red-800">{incorrectAnswers}</Text>
                    </View>
                </View>
                <View className="flex-row items-center justify-between rounded-lg bg-blue-100 p-3">
                    <Text className="text-sm font-medium text-blue-700">Accuracy Rate</Text>
                    <Text className="text-lg font-extrabold text-blue-800">{accuracyRate}%</Text>
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
                    contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16 }}
                    ListEmptyComponent={
                        <View className="mt-10 items-center">
                            <Text className="text-lg text-gray-500">No answers found for this period.</Text>
                        </View>
                    }
                />
            )}

            {/* Date Picker */}
            {renderDateTimePicker()}
        </SafeAreaView>
    );
}
