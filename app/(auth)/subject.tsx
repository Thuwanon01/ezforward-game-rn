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

function isEnglishSubject(s: Subject): boolean {
    return s.name.trim().toLowerCase() === 'english';
}

export default function SelectSubjectPage() {
    const auth = useAuth();
    const repos = useRepositories(auth.accessToken).current;
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [myLevel, setMyLevel] = useState<string[]>([]);
    const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
    const [selectedTopic, setSelectedTopic] = useState<string[]>([]);
    const [questionQuantity, setQuestionQuantity] = useState(10);
    const [subjectsReady, setSubjectsReady] = useState(false);

    /** แสดงใน dropdown เฉพาะวิชา English (ชื่อตรงกับที่ API ส่ง) */
    const englishSubjectsOnly = subjects.filter(isEnglishSubject);

    const selectedSubjectLabel =
        englishSubjectsOnly.find((s) => s.gid === selectedSubject)?.name ?? undefined;

    const canPlay =
        subjectsReady &&
        selectedSubject != null &&
        selectedTopic.length > 0 &&
        myLevel.length > 0;

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
        let cancelled = false;
        const setup = async () => {
            try {
                const list = await repos.gamev2.fetchSubjects();
                if (cancelled) return;
                console.log('Subjects', list);
                setSubjects(list);
                const english = list.filter(isEnglishSubject);
                if (english.length > 0) {
                    setSelectedSubject(english[0].gid);
                }
            } finally {
                if (!cancelled) setSubjectsReady(true);
            }
        };
        setup();
        return () => {
            cancelled = true;
        };
    }, []);

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

            {/* เลือกวิชา — controlled + auto English หลังโหลดจาก API (key ให้ label ตรงกับค่าเริ่มหลัง fetch) */}
            <Select
                key={selectedSubject ?? 'pending-subject'}
                selectedValue={selectedSubject}
                selectedLabel={selectedSubjectLabel}
                onValueChange={(value) => setSelectedSubject(value)}
                placeholder="Select Subject"
            >
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
                        {englishSubjectsOnly.map((subject) => (
                            <SelectItem key={subject.gid} label={subject.name} value={subject.gid} />
                        ))}
                    </SelectContent>
                </SelectPortal>
            </Select>

            {/* เลือกหัวข้อและระดับ */}
            <View>
                {/* เลือกหัวข้อ */}
                <View className='flex-row flex-wrap mt-4 justify-center'>
                    {englishSubjectsOnly.find(sub =>
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
                    {englishSubjectsOnly.find(sub =>
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
                className={
                    canPlay
                        ? 'mt-6 px-10 py-3 rounded-3xl bg-[#FCC61D]'
                        : 'mt-6 px-10 py-3 rounded-3xl bg-gray-400'
                }
                style={!canPlay ? { opacity: 1 } : undefined}
                isDisabled={!canPlay}
                onPress={() => {
                    if (!canPlay || selectedSubject == null) return;
                    handleSubmitSelection(
                        selectedSubject,
                        questionQuantity,
                        myLevel,
                        selectedTopic,

                    );
                    router.push('/game')
                }}>
                <ButtonText
                    className={
                        canPlay ? 'text-xl text-black' : 'text-xl text-gray-200'
                    }
                >
                    Play
                </ButtonText>
            </Button>
        </View>

    )
}

