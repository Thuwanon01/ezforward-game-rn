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
import { List } from 'react-native-paper';

const topics = [
    {
        id: 'grammar',
        title: 'Grammar Topics',
        children: [
            {
                id: 'aux',
                title: 'Auxiliary Verbs',
                items: ['Can / Could', 'May / Might', 'Should / Ought to'],
            },
            {
                id: 'passive',
                title: 'Passive Voice',
                items: ['Be + V3', 'Get + V3'],
            },
            {
                id: 'conditional',
                title: 'Conditionals',
                items: ['If + Present → will + Base Verb'],
            },
        ],
    },
    {
        id: 'vocab',
        title: 'Vocabulary',
        children: [
            {
                id: 'syn',
                title: 'Synonyms',
                items: ['Happy - Joyful', 'Big - Large'],
            },
            {
                id: 'ant',
                title: 'Antonyms',
                items: ['Hot - Cold', 'Rich - Poor'],
            },
        ],
    },
];



export default function studentGraph() {

    const auth = useAuth()
    const repos = useRepositories(auth.accessToken).current;

    const [totalPlayedQuestions, setTotalPlayedQuestions] = React.useState(0);
    const [totalCorrectAnswers, setTotalCorrectAnswers] = React.useState(0);
    const [totalIncorrectAnswers, setTotalIncorrectAnswers] = React.useState(0);

    const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});

    const toggle = (id: string) =>
        setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

    useEffect(() => {
        // Fetch student graph data here if needed
        fetchAnswerSummary();

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

    return (
        <View className="flex-1 bg-gray-100">
            {/* Card Avatar whose info */}
            <Card className="p-6 rounded-xl mx-8 mt-4">
                <Box className="flex-row">
                    <Avatar className="mr-4">
                        <AvatarFallbackText>Bing</AvatarFallbackText>
                    </Avatar>
                    <VStack className='mb-4'>
                        <Heading size="md" className="">
                            Bing
                        </Heading>
                        <Text size="xs">Student Id: 22-bing</Text>
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
                            {topics.map(topic => (
                                <List.Accordion
                                    key={topic.id}
                                    title={topic.title}
                                    expanded={expanded[topic.id]}
                                    onPress={() => toggle(topic.id)}
                                >
                                    {topic.children.map(sub => (
                                        <List.Accordion
                                            key={sub.id}
                                            title={sub.title}
                                            expanded={expanded[sub.id]}
                                            onPress={() => toggle(sub.id)}
                                            style={{ marginLeft: 12 }}
                                        >
                                            {sub.items.map((item, i) => (
                                                <List.Item key={i} title={item} />
                                            ))}
                                        </List.Accordion>
                                    ))}
                                </List.Accordion>
                            ))}
                        </List.Section>
                    </View>
                </Box>
            </Card>
        </View>


    )
}



