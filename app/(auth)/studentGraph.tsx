import { Student, StudentKnowledgeGraph, bottomLayerTopicNode, topLayerTopicNode } from '@/apis/types';
import {
    Avatar,
    AvatarFallbackText
} from '@/components/ui/avatar';
import { Box } from '@/components/ui/box';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useAuth } from '@/contexts/AuthContext';
import useRepositories from '@/hooks/useRepositories';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import {
    LayoutAnimation,
    Platform,
    SafeAreaView,
    TouchableOpacity,
    UIManager,
    View,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function studentGraph() {


    const auth = useAuth()
    const repos = useRepositories(auth.accessToken).current;

    const [totalPlayedQuestions, setTotalPlayedQuestions] = React.useState(0);
    const [totalCorrectAnswers, setTotalCorrectAnswers] = React.useState(0);
    const [totalIncorrectAnswers, setTotalIncorrectAnswers] = React.useState(0);
    const [studentDB, setStudentDB] = React.useState<Student>({ name: '', db_id: '' });
    const [studentKnowledgeGraph, setStudentKnowledgeGraph] = React.useState<StudentKnowledgeGraph[]>([]);
    const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});
    const toggle = (id: string) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
    };

    useEffect(() => {
        let cancelled = false;

        const pad = (n: number) => String(n).padStart(2, '0');
        const toYmd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
        const today = new Date();
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);

        const run = async () => {
            try {
                const [summary, graph] = await Promise.all([
                    repos.gamev2.fetchAnswerSummary({
                        answered_date__gte: toYmd(thirtyDaysAgo),
                        answered_date__lte: toYmd(today),
                    }),
                    repos.gamev2.fetchStudentGraph(),
                ]);

                if (cancelled) return;

                setTotalPlayedQuestions(summary.total);
                setTotalCorrectAnswers(summary.correct);
                setTotalIncorrectAnswers(summary.incorrect);
                setStudentDB(graph.student);
                setStudentKnowledgeGraph(graph.student_knowledge_graph);
            } catch (error) {
                if (!cancelled) console.error('Failed to load student graph:', error);
            }
        };

        run();
        return () => { cancelled = true; };
    }, []);

    const handleBackPress = () => {
        // Handle back button press
        router.push("/game");
    }

    const renderBottomLeaf = (item: bottomLayerTopicNode) => (
        <View
            key={item.graph_id}
            className="mb-2 ml-1 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2.5"
        >
            <View className="flex-row items-start justify-between gap-2">
                <Text className="flex-1 text-sm leading-5 text-gray-800">
                    {item.knowledge}
                </Text>
                <View className="rounded-full border border-blue-200 bg-white px-2 py-0.5">
                    <Text className="text-xs font-semibold text-blue-800">{item.score}</Text>
                </View>
            </View>
        </View>
    );

    const renderSubRow = (sub: topLayerTopicNode) => {
        if (sub.child) {
            const open = !!expanded[sub.graph_id];
            return (
                <View
                    key={sub.graph_id}
                    className="mb-2 border-l-2 border-indigo-200 pl-3"
                >
                    <TouchableOpacity
                        onPress={() => toggle(sub.graph_id)}
                        activeOpacity={0.7}
                        className="flex-row items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5"
                    >
                        <View className="flex-1 flex-row items-center gap-2 pr-2">
                            <Ionicons
                                name={open ? 'chevron-down' : 'chevron-forward'}
                                size={18}
                                color="#4f46e5"
                            />
                            <Text className="flex-1 text-sm font-semibold text-gray-800">
                                {sub.topic}
                            </Text>
                        </View>
                        <View className="rounded-full bg-indigo-100 px-2 py-0.5">
                            <Text className="text-xs font-semibold text-indigo-800">{sub.score}</Text>
                        </View>
                    </TouchableOpacity>
                    {open && (
                        <View className="mt-2 pl-1">
                            {sub.child.map((leaf) => renderBottomLeaf(leaf))}
                        </View>
                    )}
                </View>
            );
        }

        return (
            <View
                key={sub.graph_id}
                className="mb-2 ml-1 flex-row items-center justify-between border-l-2 border-gray-200 py-2 pl-3 pr-1"
            >
                <Text className="flex-1 text-sm text-gray-700">
                    {sub.knowledge}
                </Text>
                <View className="rounded-full bg-gray-100 px-2 py-0.5">
                    <Text className="text-xs font-semibold text-gray-700">{sub.score}</Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-100">
            <ScrollView className="flex-1 bg-gray-100">
                {/* Header with back button */}
                <View className="border-b border-gray-100 bg-white p-0">
                    <Box className="flex-row items-center justify-between px-4 py-3 bg-white shadow">
                        <Pressable onPress={handleBackPress} className="p-2">
                            <Ionicons name="arrow-back" size={24} color="black" />
                        </Pressable>
                        <Heading size="lg">Student Knowledge Graph</Heading>
                        <View className="w-8" /> {/* Placeholder for alignment */}
                    </Box>
                </View>

                {/* Card Avatar whose info */}
                <Card className="mx-4 mt-4 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                    <Box className="flex-row">
                        <Avatar className="mr-4">
                            <AvatarFallbackText>Bing</AvatarFallbackText>
                        </Avatar>
                        <VStack className='mb-4'>
                            <Heading size="md" className="">
                                {studentDB.name}
                            </Heading>
                            <Text size="xs">Student Id: {studentDB.db_id}</Text>
                        </VStack>

                    </Box>
                </Card>

                {/* Summary — aligned with AnswerHistory stat row */}
                <View className="mx-4 mt-4 space-y-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                    <View className="flex-row justify-between gap-2">
                        <View className="flex-1 items-center rounded-lg bg-gray-100 p-3">
                            <Text className="text-sm font-medium text-gray-500">
                                Total
                            </Text>
                            <Text className="text-2xl font-extrabold text-gray-800">
                                {totalPlayedQuestions}
                            </Text>
                        </View>
                        <View className="flex-1 items-center rounded-lg bg-green-100 p-3">
                            <Text className="text-sm font-medium text-green-700">
                                Correct
                            </Text>
                            <Text className="text-2xl font-extrabold text-green-800">
                                {totalCorrectAnswers}
                            </Text>
                        </View>
                        <View className="flex-1 items-center rounded-lg bg-red-100 p-3">
                            <Text className="text-sm font-medium text-red-700">
                                Incorrect
                            </Text>
                            <Text className="text-2xl font-extrabold text-red-800">
                                {totalIncorrectAnswers}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Card list student graph */}
                <Card className="mx-4 mt-4 mb-8 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                    <Box>
                        <VStack className="mb-4">
                            <Heading size="md">
                                Learning Topics
                            </Heading>
                            <Text size="xs" className="text-gray-500">
                                Explore your learning topics
                            </Text>
                        </VStack>
                        <View>
                            {studentKnowledgeGraph.map((topic) => {
                                const topicOpen = !!expanded[topic.graph_id];
                                return (
                                    <View
                                        key={topic.graph_id}
                                        className="mb-3 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
                                    >
                                        <TouchableOpacity
                                            onPress={() => toggle(topic.graph_id)}
                                            activeOpacity={0.7}
                                            className="flex-row items-center justify-between border-b border-gray-100 bg-gray-50 px-4 py-3"
                                        >
                                            <View className="flex-1 flex-row items-center gap-2 pr-2">
                                                <Ionicons
                                                    name={topicOpen ? 'chevron-down' : 'chevron-forward'}
                                                    size={20}
                                                    color="#4f46e5"
                                                />
                                                <Text className="flex-1 text-base font-semibold text-gray-800">
                                                    {topic.topic}
                                                </Text>
                                            </View>
                                            <View className="rounded-full bg-indigo-100 px-2.5 py-1">
                                                <Text className="text-xs font-semibold text-indigo-800">
                                                    {topic.score}
                                                </Text>
                                            </View>
                                        </TouchableOpacity>
                                        {topicOpen && (
                                            <View className="bg-white px-3 py-3">
                                                {topic.child.map((sub) => renderSubRow(sub))}
                                            </View>
                                        )}
                                    </View>
                                );
                            })}
                        </View>
                    </Box>
                </Card>

            </ScrollView>
        </SafeAreaView>


    )
}


