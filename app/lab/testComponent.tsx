import ExplanationPanel from '@/components/lab/ExplanationPanel';
import { Button, ButtonText } from '@/components/ui/button';
import React, { useState } from 'react';
import { Text, View } from 'react-native';

export default function testComponent() {
    const [helperStatus, setHelperStatus] = useState({ "eliminate": false, "double": false, "change": false })
    const [explanationStatus, setExplanationStatus] = useState(false)
    const [correctAnswer, setCorrectAnswer] = useState("A. will take")
    const [correctExplanation, setCorrectExplanation] = useState("Good answer this is explanation for the correct answer, Like like like for long")
    const [incorrectAnswer, setIncorrectAnswer] = useState("B. is taking")
    const [incorrectExplanation, setIncorrectExplanation] = useState("Also Good answer but this is explanation for the incorrect answer, Like like like for long")
    const [explanation, setExplanation] = useState("Just explanation for plain text hahahahahahahahahaha")

    const toggleExplanation = () => {
        setExplanationStatus(!explanationStatus)
    }

    const setHelperUsed = (helpType: string) => {
        helpType === 'eliminate' ? setHelperStatus(current => { return { ...current, 'eliminate': true } })
            : helpType === 'double'
                ? setHelperStatus(current => { return { ...current, 'double': true } })
                : setHelperStatus(current => { return { ...current, 'change': true } })
    }

    return (
        <View className='flex-1'>

            {/* for test components */}
            <View className='flex-1'>
                <Text>testComponent</Text>
                <Button variant="solid" size="md" action="primary" className="bg-sky-500 mt-[12]" onPress={toggleExplanation}>
                    <ButtonText>Click for answer</ButtonText>
                </Button>
                <Button variant="solid" size="md" action="primary" className="bg-red-500 mt-[12]" onPress={() => setHelperUsed('eliminate')}>
                    <ButtonText>Click for use eliminate</ButtonText>
                </Button>
                <Button variant="solid" size="md" action="primary" className="bg-green-500 mt-[12]" onPress={() => setHelperUsed('double')}>
                    <ButtonText>Click for use double</ButtonText>
                </Button>
                <Button variant="solid" size="md" action="primary" className="bg-yellow-500 mt-[12]" onPress={() => setHelperUsed('change')}>
                    <ButtonText>Click for use change</ButtonText>
                </Button>
                <Button variant="solid" size="md" action="primary" className="bg-black mt-[12]" onPress={() => setHelperStatus({ "eliminate": false, "double": false, "change": false })}>
                    <ButtonText>Click for use refresh helper</ButtonText>
                </Button>
            </View>

            {/* Components for use */}
            <ExplanationPanel
                correctAnswer={correctAnswer}
                correctExplanation={correctExplanation}
                incorrectAnswer={incorrectAnswer}
                incorrectExplanation={incorrectExplanation}
                explanation={explanation}
                helperStatus={helperStatus}
                explanationStatus={explanationStatus}
                onPress={()=>{}} />
        </View>
    )
}