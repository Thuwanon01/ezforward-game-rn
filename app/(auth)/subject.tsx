import { Subject } from '@/apis/types';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import useRepositories from '@/hooks/useRepositories';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function SubjectPage() {
    const auth = useAuth();
    const repos = useRepositories(auth.accessToken).current;
    const [subjects, setSubjects] = useState<Subject[]>([]);

    useEffect(() => {
        const setup = async () => {
            const subjects = await repos.gamev2.fetchSubjects()
            console.log("Subjects", subjects)
            setSubjects(subjects)
        }
        setup()
    }, [])

    return (
        <View>
            <Text>Select Subject</Text>
            <Text>{JSON.stringify(subjects)}</Text>
            <Button onPress={() => {
                router.push('/game')
            }}>Play</Button>
        </View>
    )
}

const styles = StyleSheet.create({})