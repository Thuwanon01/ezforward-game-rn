import ChoiceBox from '@/components/lab/ChoiceBox';
import ExplanationPanel from '@/components/lab/ExplanationPanel';
import QuestionBox from '@/components/lab/QuestionBox';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';

const questionText = "What is the capital of France?";

export default function testComponent() {
    const [helperStatus, setHelperStatus] = useState({ "eliminate": false, "double": false, "change": false })
    const [explanationStatus, setExplanationStatus] = useState(false)
    const [correctAnswer, setCorrectAnswer] = useState("A. will take")
    const [correctExplanation, setCorrectExplanation] = useState("Good answer this is explanation for the correct answer, Like like like for long")
    const [incorrectAnswer, setIncorrectAnswer] = useState("B. is taking")
    const [incorrectExplanation, setIncorrectExplanation] = useState("Also Good answer but this is explanation for the incorrect answer, Like like like for long")
    const [explanation, setExplanation] = useState("Just explanation for plain text hahahahahahahahahaha")
    const [status, setStatus] = useState('wait');

    
    useEffect(() => {
        let timer: any //ตั้งเป็น any ไว้ไม่ให้มันแดง error
        if (status === 'reading') {
          timer = setTimeout(() => {
            setStatus('wait'); // กลับเป็น wait หลังครบ 5 วิ
          }, 5000);
        }
        return () => {
          if (timer) clearTimeout(timer);
        };
      }, [status]);
    
      // สร้างฟังก์ชันที่จะส่งลงไปให้ QuestionBox
      const handleQuestionPress = () => {
        if (status === 'wait') {
          setStatus('reading');
        }
      };

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
                <QuestionBox 
                        question={questionText} 
                        status={status}
                        onPressQuestion={handleQuestionPress}
                      />
                      <ChoiceBox text='4.will be' status="wait" />
                      <ChoiceBox text='4.will be' status="wait" />
                      <ChoiceBox text='4.will be' status="wait" />
                      <ChoiceBox text='4.will be' status="wait" />
                
            </View>

            {/* Components for use */}
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