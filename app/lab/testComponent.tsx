
import ExplanationPanel from '@/components/lab/ExplanationPanel';
import React, { useState } from 'react';
import { Text, View } from 'react-native';


export default function testComponent() {
    const [helperStatus, setHelperStatus] = useState({"eliminate":false,"double":false,"change":false})
    const [explanationStatus, setExplanationStatus] = useState(true)
    const [correctAnswer, setCorrectAnswer] = useState("A. will take")
    const [correctExplanation, setCorrectExplanation] = useState("Good answer this is explanation for the correct answer, Like like like for long")
    const [incorrectAnswer, setIncorrectAnswer] = useState("B. is taking")
    const [incorrectExplanation, setIncorrectExplanation] = useState("Also Good answer but this is explanation for the incorrect answer, Like like like for long")
    const [explanation, setExplanation] = useState("Just explanation for plain text hahahahahahahahahaha")


    return (
        <View className='flex-1'>


            <View className='flex-1'>
                <Text>testComponent</Text>

            </View>
            <ExplanationPanel 
                correctAnswer={correctAnswer} 
                correctExplanation={correctExplanation} 
                incorrectAnswer={incorrectAnswer} 
                incorrectExplanation={incorrectExplanation} 
                explanation={explanation} 
                helperStatus={helperStatus} 
                explanationStatus={explanationStatus} />
            
            
            



        </View>
    )
}