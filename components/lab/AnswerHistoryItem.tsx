import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Markdown from 'react-native-markdown-display';

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
    question: string;
    selected_choice: string;
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

const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', { month: 'short', day: 'numeric' });
};

const formatTime = (ms: number): string => {
    if (!ms || ms <= 0) return '-';
    const seconds = Math.round(ms / 1000);
    return `${seconds}s`;
};

interface Props {
    item: StudentAnswer;
    isExpanded: boolean;
    onToggleDetails: (id: number) => void;
}

const AnswerHistoryItem: React.FC<Props> = React.memo(({ item, isExpanded, onToggleDetails }) => {
    const correctChoice = item.parsedQuestion?.choices?.find((c) => c.is_correct);
    const explanation = item.parsedSelectedChoice?.answer_explanation ?? '';
    const explanationShort =
        explanation && explanation.length > 100 ? `${explanation.substring(0, 100)}...` : explanation;

    return (
        <View style={[styles.card, { borderLeftColor: item.is_correct ? '#22c55e' : '#ef4444' }]}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Ionicons
                        name={item.is_correct ? 'checkmark-circle' : 'close-circle'}
                        size={24}
                        color={item.is_correct ? '#22c55e' : '#ef4444'}
                    />
                    <Text style={[styles.statusText, { color: item.is_correct ? '#16a34a' : '#ef4444' }]}>
                        {item.is_correct ? 'Correct' : 'Incorrect'}
                    </Text>
                </View>
                <Text style={styles.headerDate}>{formatDate(item.answered_at)}</Text>
            </View>

            {/* Body */}
            <View style={styles.body}>
                {!!item.parsedQuestion?.quiz_text && (
                    <Text style={styles.titleText}>คำถาม: {item.parsedQuestion.quiz_text}</Text>
                )}

                {!!item.parsedSelectedChoice?.choice_text && (
                    <Text style={styles.text}>
                        คำตอบของคุณ:{' '}
                        <Text style={[styles.bold, { color: item.is_correct ? '#16a34a' : '#ef4444' }]}>
                            {item.parsedSelectedChoice.choice_text}
                        </Text>
                    </Text>
                )}

                {!item.is_correct && !!correctChoice?.choice_text && (
                    <Text style={styles.text}>
                        คำตอบที่ถูก:{' '}
                        <Text style={[styles.bold, { color: '#16a34a' }]}>{correctChoice.choice_text}</Text>
                    </Text>
                )}

                <Text style={styles.subText}>เวลาที่ใช้: {formatTime(item.time_taken_ms)}</Text>

                {/* Explanation (collapsed) */}
                {!!explanation && !isExpanded && (
                    <View style={styles.explainBox}>
                        {Platform.OS === 'web' ? (
                            <Text style={styles.explainText}>{explanationShort}</Text>
                        ) : (
                            <Markdown style={markdownStyles}>{explanationShort}</Markdown>
                        )}
                    </View>
                )}

                {/* Expanded */}
                {isExpanded && (
                    <View style={styles.expanded}>
                        <Text style={styles.expandTitle}>คำอธิบาย:</Text>
                        {!!explanation && (
                            <View style={styles.explainBox}>
                                {Platform.OS === 'web' ? (
                                    <Text style={styles.explainText}>{explanation}</Text>
                                ) : (
                                    <Markdown style={markdownStyles}>{explanation}</Markdown>
                                )}
                            </View>
                        )}
                    </View>
                )}
            </View>

            {/* Footer action */}
            <TouchableOpacity onPress={() => onToggleDetails(item.id)} style={styles.footerBtn}>
                <Text style={styles.footerBtnText}>{isExpanded ? 'Show less' : 'Show more details'}</Text>
                <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={16} color="#2563eb" />
            </TouchableOpacity>
        </View>
    );
});

export default AnswerHistoryItem;

/* ---------- Styles ---------- */
const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
        marginBottom: 12,
        overflow: 'hidden',
        borderLeftWidth: 4,
    },
    header: {
        padding: 16,
        backgroundColor: '#f9fafb',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomColor: '#e5e7eb',
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', columnGap: 8 },
    statusText: { fontWeight: '600' },
    headerDate: { fontSize: 12, color: '#6b7280' },

    body: { padding: 16, rowGap: 6 },
    titleText: { fontSize: 16, fontWeight: '600', color: '#374151' },
    text: { fontSize: 15, color: '#4b5563' },
    bold: { fontWeight: '700' },
    subText: { fontSize: 13, color: '#6b7280', marginTop: 4 },

    expanded: {
        marginTop: 12,
        paddingTop: 12,
        borderTopColor: '#e5e7eb',
        borderTopWidth: StyleSheet.hairlineWidth,
        rowGap: 8,
    },
    expandTitle: { fontSize: 16, fontWeight: '700', color: '#374151' },

    explainBox: {
        marginTop: 4,
        padding: 12,
        backgroundColor: '#eff6ff',
        borderRadius: 8,
        borderColor: '#bfdbfe',
        borderWidth: 1,
    },
    explainText: { fontSize: 15, color: '#374151' },

    footerBtn: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        backgroundColor: '#f3f4f6',
        borderTopColor: '#e5e7eb',
        borderTopWidth: StyleSheet.hairlineWidth,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        columnGap: 6,
    },
    footerBtnText: { fontSize: 14, fontWeight: '600', color: '#2563eb' },
});

/* Markdown styles (native only) */
const markdownStyles = StyleSheet.create({
    body: { fontSize: 15, color: '#374151' },
    strong: { fontWeight: 'bold', color: '#1f2937' },
    code_inline: {
        backgroundColor: '#e5e7eb',
        color: '#111827',
        paddingHorizontal: 4,
        paddingVertical: 1,
        borderRadius: 4,
        fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    },
});
