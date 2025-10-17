import {
    Button,
    ButtonText
} from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import { Input, InputField } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import useRepositories from '@/hooks/useRepositories';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function Page() {
    const [text, setText] = useState('')
    const [res, setRes] = useState('')
    const [show, setShow] = useState(false)

    const auth = useAuth()
    const repos = useRepositories(auth.accessToken).current;

    const items = ['a', 'b', 'c', 'd', 'e', 'f']

    const sendToLLM = async () => {
        const response = await repos.llm.generateText(text)
        setRes(response)
    }

    useEffect(() => {
        console.log("useEffect jaaaaa")
        sendToLLM()
    }, [])

    return (
        <View className='px-3 py-2 flex-1 h-full'>
            <Text className='text-center text-2xl mb-3'>Test LLM</Text>

            {/* Condition Render */}
            {show && <Text>Showing</Text>}
            {show ? <Text>Show</Text> : <Text>Hide jaaa</Text>}

            {/* Loop Rendering */}
            {items.map((item, index) => (
                <Text key={index}>{item}</Text>
            ))}

            <Button onPress={() => setShow(!show)} className='mt-2' variant="solid" size="sm" action="positive">
                <ButtonText>Show</ButtonText>
            </Button>

            <Divider />
            <Text style={styles.text}>{res}</Text>

            <View className='flex-1'></View>

            <Input
                variant="outline"
                size="md"
            >
                <InputField value={text} onChangeText={setText} placeholder="Enter Text here..." />
            </Input>
            <Button onPress={sendToLLM} className='mt-2' variant="solid" size="sm" action="positive">
                <ButtonText>Send</ButtonText>
            </Button>
        </View>
    )
}

const styles = StyleSheet.create({
    text: {
        fontSize: 30,
        color: 'red'
    }
})