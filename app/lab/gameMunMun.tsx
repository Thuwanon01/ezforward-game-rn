import { NewQuizChoice, QuizAnswerResponse, RandomQuizResponse } from '@/apis/types';
import { fetchRandomQuestion, fetchSubmitAnswer } from '@/apis/wordgame';
import ChoiceBox from '@/components/lab/ChoiceBox';
import ExplanationPanel from '@/components/lab/ExplanationPanel';
import HeaderPanel from '@/components/lab/HeaderPanel';
import QuestionBox from '@/components/lab/QuestionBox';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';



export default function testComponent() {
  const [helperStatus, setHelperStatus] = useState({ "eliminate": false, "double": false, "change": false })
  const [explanationStatus, setExplanationStatus] = useState(false)
  const [correctAnswer, setCorrectAnswer] = useState("A. will take")
  const [correctExplanation, setCorrectExplanation] = useState("Good answer this is explanation for the correct answer, Like like like for long")
  const [incorrectAnswer, setIncorrectAnswer] = useState("B. is taking")
  const [incorrectExplanation, setIncorrectExplanation] = useState("Also Good answer but this is explanation for the incorrect answer, Like like like for long")
  const [explanation, setExplanation] = useState("Just explanation for plain text hahahahahahahahahaha")
  const [status, setStatus] = useState('wait');
  const [question, setQuestion] = useState<RandomQuizResponse | null>(null);
  const [choices, setChoices] = useState<NewQuizChoice[]>([]);
  const [answer, setAnswer] = useState<QuizAnswerResponse | null>(null);
  const [isSelected, setIsSelected] = useState(false);
  const [gameState, setGameState] = useState<'wait' | 'correct' | 'incorrect'>('wait');

  useEffect(() => {
    fetchData();
  }, []);

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
  const fetchData = async () => {
    const questionData = await fetchRandomQuestion();
    console.log('Fetched question data:', questionData);
    setQuestion(questionData);
    setChoices(questionData.choicelist.map(choice => ({ ...choice, is_selected: false })));
    setStatus('wait'); // เริ่มต้นด้วยสถานะ wait
    setGameState('wait');
  }
  const handleSubmitAnswer = async (choiceId: number, index: number) => {
    if (!question) return;
    setExplanationStatus(true)
    const answerData = await fetchSubmitAnswer(question.id, choiceId);
    console.log('Fetched answer data:', answerData);
    setAnswer(answerData);
    const newChoices = [...choices];
    newChoices[index].is_selected = true;
    setChoices(newChoices);
    if (answerData.choices.find(choice => choice.id === choiceId)?.is_correct) {
      setGameState('correct');
      setStatus('correct');
    } else {
      setGameState('incorrect');
      setStatus('incorrect');
    }
  }
  const handleSelectChoice = (choiceId: number) => {
    if (isSelected) return; // ถ้าเลือกไปแล้วไม่ให้เลือกซ้ำ
    if (choices.find(choice => choice.id === choiceId)?.is_selected && answer?.choices.find(choice => choice.id === choiceId)?.is_correct) return ("correct")
    else if (choices.find(choice => choice.id === choiceId)?.is_selected && !answer?.choices.find(choice => choice.id === choiceId)?.is_correct) return ("incorrect")
    else { return ("wait") }




  }

  return (
    <View className='flex-1'>

      {/* for test components */}
      <View className='flex-1'>
        <HeaderPanel title={'GameMunMun'} onPressBack={() => { }} onPressMenu={() => { }} ></HeaderPanel>
        <QuestionBox
          question={question?.text || 'Loading question...'}
          status={status}
          onPressQuestion={handleQuestionPress}
        />
        <View >
          {choices.map((choice, index) => (
            <ChoiceBox key={index} text={choice.text} status={handleSelectChoice(choice.id)} onPress={() => { handleSubmitAnswer(choice.id, index) }} disabled={gameState !== 'wait'} />
          ))}
        </View>

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
        onPress={fetchData} />

    </View>
  )
}