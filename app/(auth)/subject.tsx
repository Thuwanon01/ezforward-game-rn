import { Subject } from '@/apis/types';
import { Button, ButtonText } from '@/components/ui/button';
import { ChevronDownIcon } from '@/components/ui/icon';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
    Select,
    SelectBackdrop,
    SelectContent,
    SelectDragIndicator,
    SelectDragIndicatorWrapper,
    SelectIcon,
    SelectInput,
    SelectItem,
    SelectPortal,
    SelectTrigger,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import useRepositories from '@/hooks/useRepositories';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, Text, View } from 'react-native';

export default function SelectSubjectPage() {
    const auth = useAuth();
    const repos = useRepositories(auth.accessToken).current;
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [myLevel, setMyLevel] = useState<string[]>([]);
    const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
    const [selectedTopic, setSelectedTopic] = useState<string[]>([]);
    const [questionQuantity, setQuestionQuantity] = useState(10);

    const handleSubmitSelection = async (
        selectedSubject: string | null,
        questionQuantity: number,
        myLevel: string[],
        selectedTopic: string[],
    ) => {
        console.log("handleSubmitSelection", selectedSubject, questionQuantity, myLevel, selectedTopic);
        // const response = await repos.gamev2.fetchCustomQuiz({
        //     subject: selectedSubject as string,
        //     quiz_limit: questionQuantity,
        //     quiz_level: myLevel,
        //     quiz_topic: selectedTopic,
        // });
        await AsyncStorage.setItem('selectedSubject', selectedSubject as string);
        await AsyncStorage.setItem('questionQuantity', questionQuantity.toString());
        await AsyncStorage.setItem('myLevel', myLevel.join(','));
        await AsyncStorage.setItem('selectedTopic', selectedTopic.join(','));
        // console.log("response from selection subject", response);
    }


    useEffect(() => {
        const setup = async () => {
            const subjects = await repos.gamev2.fetchSubjects()
            console.log("Subjects", subjects)
            setSubjects(subjects)
        }
        setup()
    }, [])

    return (
        <View className='flex-1  items-center bg-[#fffac9ff]'>
            <View>
                <Image
                    source={require('@/assets/images/ram-small.png')} // path รูปภาพ
                    className=" self-center" // กำหนดขนาดและระยะห่าง
                />

                <Text
                    className='text-2xl font-bold text-center text-gray-800 mb-4'>
                    Select your subject and level
                </Text>
            </View>

            {/* เลือกวิชา */}
            <Select onValueChange={(value) => setSelectedSubject(value)}  >
                <SelectTrigger variant="outline" size="md">
                    <SelectInput placeholder="Select Subject" />
                    <SelectIcon className="mr-3" as={ChevronDownIcon} />
                </SelectTrigger>
                <SelectPortal>
                    <SelectBackdrop />
                    <SelectContent>
                        <SelectDragIndicatorWrapper>
                            <SelectDragIndicator />
                        </SelectDragIndicatorWrapper>
                        {subjects.map((subject) => (
                            <SelectItem key={subject.gid} label={subject.name} value={subject.gid} />
                        ))}
                    </SelectContent>
                </SelectPortal>
            </Select>

            {/* เลือกหัวข้อและระดับ */}
            <View>
                {/* เลือกหัวข้อ */}
                <View className='flex-row flex-wrap mt-4 justify-center'>
                    {subjects.find(sub =>
                        sub.gid === selectedSubject)?.topics.map((topic) =>
                            <Button
                                variant="solid"
                                size="xs"
                                action="primary"
                                onPress={() => {
                                    setSelectedTopic(prev => {
                                        console.log(selectedTopic);
                                        if (prev.includes(topic.gid)) {
                                            return prev.filter(t => t !== topic.gid);
                                        } else {
                                            return [...prev, topic.gid];
                                        }

                                    })
                                }}
                                className="mt-4 mx-2 rounded-2xl"
                                style={{
                                    backgroundColor: selectedTopic.includes(topic.gid)
                                        ? '#FCC61D' : '#27548A', // Change color based on isPressed
                                    flexBasis: '35%',
                                }}>
                                <ButtonText
                                    className='text-white'
                                    style={{
                                        color: selectedTopic.includes(topic.gid)
                                            ? 'black' : 'white',
                                    }} >{topic.name}</ButtonText>
                            </Button>)}
                </View>


                {/* เลือกระดับ */}
                <View className='flex-row flex-wrap mt-4 justify-center'>
                    {subjects.find(sub =>
                        sub.gid === selectedSubject)?.levels.map((level) =>
                            <Button
                                variant="solid"
                                size="xs"
                                action="primary hover=true"
                                onPress={() => {
                                    setMyLevel(prev => {
                                        console.log(myLevel);
                                        if (prev.includes(level.gid)) {
                                            return prev.filter(l => l !== level.gid);
                                        } else {
                                            return [...prev, level.gid];
                                        }
                                    })
                                }}
                                className="mt-4 ml-2 rounded-2xl"
                                style={{
                                    backgroundColor: myLevel.includes(level.gid)
                                        ? '#FCC61D' : '#27548A', // Change color based on isPressed

                                }}>
                                <ButtonText
                                    className='text-white'
                                    style={{
                                        color: myLevel.includes(level.gid)
                                            ? 'black' : 'white',
                                    }}>{level.name}</ButtonText>
                            </Button>)}
                </View>
            </View>

            {/* เลือกจำนวนข้อสอบ */}
            {/* <View className='mt-4 justify-center items-center'>
                <Text className='text-2xl font-bold text-center text-gray-800'>
                    Number of questions
                </Text>
                <Input className='mt-2 w-20 rounded-3xl '>
                    <InputField
                        placeholder="10"
                        value={questionQuantity.toString()}
                        onChange={(e) => {
                            const value = e.nativeEvent.text;
                            const numericValue = parseInt(value, 10);
                            if (!isNaN(numericValue)) {
                                setQuestionQuantity(numericValue);
                            } else {
                                setQuestionQuantity(0); // or any default value you prefer
                            }
                            console.log(questionQuantity);
                        }}

                    />
                </Input>
            </View> */}

            <Button
                variant="solid"
                size="md"
                action="primary hover=true"
                className='mt-6 px-10 py-3 rounded-3xl bg-[#FCC61D]'
                onPress={() => {
                    handleSubmitSelection(
                        selectedSubject,
                        questionQuantity,
                        myLevel,
                        selectedTopic,

                    );
                    router.push('/game')
                }}>
                <ButtonText className='text-xl text-black'>Play</ButtonText>
            </Button>
        </View>

    )
}

