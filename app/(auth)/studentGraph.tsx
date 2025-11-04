import { Student, StudentKnowledgeGraph } from '@/apis/types';
import {
    Avatar,
    AvatarFallbackText
} from '@/components/ui/avatar';
import { Box } from '@/components/ui/box';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useAuth } from '@/contexts/AuthContext';
import useRepositories from '@/hooks/useRepositories';
import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { List } from 'react-native-paper';

export default function studentGraph() {

    const auth = useAuth()
    const repos = useRepositories(auth.accessToken).current;

    const [totalPlayedQuestions, setTotalPlayedQuestions] = React.useState(0);
    const [totalCorrectAnswers, setTotalCorrectAnswers] = React.useState(0);
    const [totalIncorrectAnswers, setTotalIncorrectAnswers] = React.useState(0);
    const [studentDB, setStudentDB] = React.useState<Student>({ name: '', db_id: '' });
    const [studentKnowledgeGraph, setStudentKnowledgeGraph] = React.useState<StudentKnowledgeGraph[]>([]);
    const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});
    const toggle = (id: string) =>
        setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

    useEffect(() => {
        // Fetch student graph data here if needed
        fetchAnswerSummary();
        fetchStudentGraph();
    }, []);

    const fetchAnswerSummary = async () => {
        const summary = await repos.gamev2.fetchAnswerSummary({
            answered_date__gte: "2025-09-01",
            answered_date__lte: "2025-10-15"
        })
        console.log("total played", summary.total);
        setTotalPlayedQuestions(summary.total);
        setTotalCorrectAnswers(summary.correct);
        setTotalIncorrectAnswers(summary.incorrect);
    }
    const fetchStudentGraph = async () => {
        const graph = await repos.gamev2.fetchStudentGraph();
        console.log("student graph", graph);
        setStudentDB(graph.student);
        setStudentKnowledgeGraph(graph.student_knowledge_graph);
    }

    return (
        <ScrollView className="flex-1 bg-gray-100">
            {/* Card Avatar whose info */}
            <Card className="p-6 rounded-xl mx-8 mt-4">
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

            {/* Card total summary */}
            <Card className="p-6 rounded-xl mx-8 mt-4">
                <Box className="flex-row items-center">
                    <View className="mr-4 justify-center items-center">
                        <VStack className='items-start'>
                            <Text size="xs">Total Played: {totalPlayedQuestions}</Text>
                            <Text size="xs">Total Correct: {totalCorrectAnswers}</Text>
                            <Text size="xs">Total Incorrect: {totalIncorrectAnswers}</Text>
                        </VStack>
                    </View>
                    <View className="flex-1 flex-row justify-end">
                        <Ionicons name="book-outline" size={48} color="black" className="mr-4" />
                    </View>
                </Box>
            </Card>

            {/* Card show how many topic have played */}
            <Card className="p-6 rounded-xl mx-8 mt-4">
                <Box className="flex-row items-center">
                    <View className="mr-4">
                        <VStack className='mb-4'>
                            <Heading size="md" className="">
                                Knowledge Graph
                            </Heading>
                            <Text size="xs">Explore your learning topics</Text>
                        </VStack>
                    </View>
                    <View className="flex-1 flex-row justify-end">
                        <Ionicons name="school-outline" size={48} color="black" className="mr-4" />
                    </View>
                </Box>
            </Card>

            {/* Card list student graph */}
            <Card className="p-6 rounded-xl mx-8 mt-4 mb-8">
                <Box>
                    <Heading size="md" className="mb-4">
                        Learning Topics
                    </Heading>
                    <View>
                        <List.Section>
                            {studentKnowledgeGraph.map(topic => (
                                // <View className='flex-row'>
                                <List.Accordion
                                    key={topic.graph_id}
                                    title={
                                        <Text>
                                            ({topic.score}) {topic.topic}
                                        </Text>}
                                    expanded={expanded[topic.graph_id]}
                                    onPress={() => toggle(topic.graph_id)}
                                >
                                    {/* <View> */}
                                    {(topic.child).map(sub => (
                                        sub.child ? (
                                            <List.Accordion
                                                key={sub.graph_id}
                                                title={
                                                    <Text>
                                                        ({sub.score}) {sub.topic}
                                                    </Text>
                                                }
                                                expanded={expanded[sub.graph_id]}
                                                onPress={() => toggle(sub.graph_id)}
                                                style={{
                                                    marginLeft: 12,
                                                    borderLeftWidth: 2,
                                                    borderLeftColor: '#ccc', // สีเทาอ่อน
                                                    paddingLeft: 12,
                                                }}
                                            >
                                                {sub.child.map((item, i) => (
                                                    <List.Item
                                                        key={i}
                                                        title={
                                                            <Text>
                                                                ({item.score}) {item.knowledge}
                                                            </Text>
                                                        }
                                                        style={{
                                                            marginLeft: 40,
                                                            borderLeftWidth: 2,
                                                            borderLeftColor: '#ccc', // สีเทาอ่อน
                                                            paddingLeft: 12,
                                                        }}
                                                    />
                                                ))}
                                            </List.Accordion>
                                        ) : (
                                            <List.Item
                                                key={sub.graph_id}
                                                // title={sub.knowledge}
                                                title={`(${sub.score}) ${sub.knowledge}`}
                                                style={{ marginLeft: 12 }}
                                            />
                                        )
                                    ))}
                                    {/* </View> */}
                                </List.Accordion>
                                // </View>
                            ))}

                        </List.Section>
                    </View>
                </Box>
            </Card>

        </ScrollView>


    )
}



