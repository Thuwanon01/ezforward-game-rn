import { Subject } from '@/apis/types';
import { useAuth } from '@/contexts/AuthContext';
import useRepositories from '@/hooks/useRepositories';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

const LEVEL_DESC: Record<string, string> = {
    a1: 'Beginner',
    a2: 'Elementary',
    b1: 'Intermediate',
    b2: 'Upper-Int',
    c1: 'Advanced',
    c2: 'Mastery',
};

function isEnglishSubject(s: Subject): boolean {
    return s.name.trim().toLowerCase() === 'english';
}

export default function SelectSubjectPage() {
    const auth = useAuth();
    const repos = useRepositories(auth.accessToken).current;
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [myLevel, setMyLevel] = useState<string | null>(null);
    const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
    const [questionQuantity] = useState(10);
    const [subjectsReady, setSubjectsReady] = useState(false);

    const canPlay =
        subjectsReady &&
        selectedSubject != null &&
        selectedTopic != null &&
        myLevel != null;

    const currentSubject = subjects.find((s) => s.gid === selectedSubject) ?? null;

    const handleSubmitSelection = async (
        subjectGid: string | null,
        qty: number,
        levelGid: string | null,
        topicGid: string | null,
    ) => {
        await AsyncStorage.setItem('selectedSubject', subjectGid as string);
        await AsyncStorage.setItem('questionQuantity', qty.toString());
        await AsyncStorage.setItem('myLevel', levelGid ?? '');
        await AsyncStorage.setItem('selectedTopic', topicGid ?? '');
    };

    useEffect(() => {
        let cancelled = false;
        const setup = async () => {
            try {
                const list = await repos.gamev2.fetchSubjects();
                if (cancelled) return;
                setSubjects(list);
                const english = list.filter(isEnglishSubject);
                if (english.length > 0) setSelectedSubject(english[0].gid);
            } catch (error) {
                if (!cancelled) console.error('Failed to load subjects:', error);
            } finally {
                if (!cancelled) setSubjectsReady(true);
            }
        };
        setup();
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <View style={{ flex: 1, backgroundColor: '#183B4E' }}>
            {/* ── Dark Header ── */}
            <View style={{ paddingTop: 56, paddingBottom: 28, alignItems: 'center', paddingHorizontal: 24 }}>
                <Text style={{ fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: 4 }}>
                    Choose Your Subject
                </Text>
                <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
                    Select topic and level to start playing
                </Text>
            </View>

            {/* ── White Card Body ── */}
            <View style={{ flex: 1, backgroundColor: '#f7f5e8', borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden' }}>
                <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

                    {/* Subject Tabs */}
                    <Text style={styles.sectionLabel}>Subject</Text>
                    <View style={styles.tabRow}>
                        {subjects.map((s) => (
                            <TouchableOpacity
                                key={s.gid}
                                onPress={() => {
                                    setSelectedSubject(s.gid);
                                    setSelectedTopic(null);
                                    setMyLevel(null);
                                }}
                                style={[
                                    styles.tab,
                                    selectedSubject === s.gid && styles.tabActive,
                                ]}
                            >
                                <Text style={[
                                    styles.tabText,
                                    selectedSubject === s.gid && styles.tabTextActive,
                                ]}>
                                    {s.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Topic Pills */}
                    <Text style={[styles.sectionLabel, { marginTop: 20 }]}>Topic</Text>
                    <View style={styles.pillRow}>
                        {currentSubject?.topics.map((topic) => {
                            const isChosen = selectedTopic === topic.gid;
                            const locked = selectedTopic !== null && !isChosen;
                            return (
                                <TouchableOpacity
                                    key={topic.gid}
                                    disabled={locked}
                                    onPress={() => setSelectedTopic((prev) => prev === topic.gid ? null : topic.gid)}
                                    style={[
                                        styles.pill,
                                        isChosen && styles.pillSelected,
                                        locked && styles.pillLocked,
                                    ]}
                                >
                                    <Text style={[
                                        styles.pillText,
                                        isChosen && styles.pillTextSelected,
                                        locked && styles.pillTextLocked,
                                    ]}>
                                        {isChosen ? `${topic.name} ✓` : topic.name}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Level Grid */}
                    <Text style={[styles.sectionLabel, { marginTop: 20 }]}>Level</Text>
                    <View style={styles.levelGrid}>
                        {currentSubject?.levels.map((level) => {
                            const isChosen = myLevel === level.gid;
                            const locked = myLevel !== null && !isChosen;
                            return (
                                <TouchableOpacity
                                    key={level.gid}
                                    disabled={locked}
                                    onPress={() => setMyLevel((prev) => prev === level.gid ? null : level.gid)}
                                    style={[
                                        styles.levelCard,
                                        isChosen && styles.levelCardSelected,
                                        locked && styles.levelCardLocked,
                                    ]}
                                >
                                    <Text style={[styles.levelBadge, isChosen && { color: '#183B4E' }]}>
                                        {level.name}{isChosen ? ' ✓' : ''}
                                    </Text>
                                    <Text style={styles.levelDesc}>
                                        {LEVEL_DESC[level.gid] ?? ''}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Reset Button */}
                    {(selectedTopic !== null || myLevel !== null) && (
                        <TouchableOpacity
                            onPress={() => { setSelectedTopic(null); setMyLevel(null); }}
                            style={styles.resetBtn}
                        >
                            <Text style={styles.resetText}>↺  Reset selection</Text>
                        </TouchableOpacity>
                    )}

                    {/* Play Button */}
                    <TouchableOpacity
                        disabled={!canPlay}
                        onPress={async () => {
                            if (!canPlay || selectedSubject == null) return;
                            await handleSubmitSelection(selectedSubject, questionQuantity, myLevel, selectedTopic);
                            router.push('/game');
                        }}
                        style={[styles.playBtn, !canPlay && styles.playBtnDisabled]}
                    >
                        <Text style={[styles.playBtnText, !canPlay && styles.playBtnTextDisabled]}>
                            ▶  Play Now
                        </Text>
                    </TouchableOpacity>

                </ScrollView>
            </View>
        </View>
    );
}

const styles = {
    sectionLabel: {
        fontSize: 11,
        fontWeight: '700' as const,
        letterSpacing: 1,
        textTransform: 'uppercase' as const,
        color: '#183B4E',
        opacity: 0.45,
        marginBottom: 10,
    },
    tabRow: {
        flexDirection: 'row' as const,
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 4,
        gap: 4,
        shadowColor: '#183B4E',
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: 'center' as const,
    },
    tabActive: {
        backgroundColor: '#183B4E',
    },
    tabText: {
        fontSize: 13,
        fontWeight: '600' as const,
        color: '#183B4E',
        opacity: 0.4,
    },
    tabTextActive: {
        color: '#fff',
        opacity: 1,
    },
    pillRow: {
        flexDirection: 'row' as const,
        flexWrap: 'wrap' as const,
        gap: 8,
    },
    pill: {
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 20,
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#e2e8f0',
    },
    pillSelected: {
        backgroundColor: '#FCC61D',
        borderColor: '#FCC61D',
    },
    pillLocked: {
        backgroundColor: '#f1f5f9',
        borderColor: '#f1f5f9',
    },
    pillText: {
        fontSize: 13,
        fontWeight: '600' as const,
        color: '#183B4E',
    },
    pillTextSelected: {
        color: '#183B4E',
    },
    pillTextLocked: {
        color: '#94a3b8',
    },
    levelGrid: {
        flexDirection: 'row' as const,
        flexWrap: 'wrap' as const,
        gap: 8,
    },
    levelCard: {
        width: '30%' as const,
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 8,
        alignItems: 'center' as const,
        borderWidth: 2,
        borderColor: '#e2e8f0',
    },
    levelCardSelected: {
        borderColor: '#FCC61D',
        backgroundColor: '#fffbeb',
    },
    levelCardLocked: {
        opacity: 0.35,
    },
    levelBadge: {
        fontSize: 15,
        fontWeight: '800' as const,
        color: '#183B4E',
    },
    levelDesc: {
        fontSize: 10,
        color: '#94a3b8',
        marginTop: 2,
    },
    resetBtn: {
        marginTop: 20,
        paddingVertical: 11,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: '#cbd5e1',
        borderStyle: 'dashed' as const,
        alignItems: 'center' as const,
    },
    resetText: {
        fontSize: 13,
        fontWeight: '500' as const,
        color: '#94a3b8',
    },
    playBtn: {
        marginTop: 16,
        paddingVertical: 16,
        borderRadius: 16,
        backgroundColor: '#FCC61D',
        alignItems: 'center' as const,
        shadowColor: '#FCC61D',
        shadowOpacity: 0.4,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
    },
    playBtnDisabled: {
        backgroundColor: '#e2e8f0',
        shadowOpacity: 0,
        elevation: 0,
    },
    playBtnText: {
        fontSize: 17,
        fontWeight: '800' as const,
        color: '#183B4E',
        letterSpacing: 0.3,
    },
    playBtnTextDisabled: {
        color: '#94a3b8',
    },
};
