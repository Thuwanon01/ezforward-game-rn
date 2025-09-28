import type { QuizAnswerResponse, RandomQuizResponse } from '@/apis/types';
import { fetchRandomQuestion, fetchSubmitAnswer } from '@/apis/wordgame';
import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

export default function ApiDemoPage() {
  const [question, setQuestion] = useState<RandomQuizResponse | null>(null);
  const [answer, setAnswer] = useState<QuizAnswerResponse | null>(null);

  const handleFetchQuestion = async () => {
    try {
      const questionData = await fetchRandomQuestion();
      setQuestion(questionData);
      setAnswer(null);
      console.log('API Response - Question:', questionData);
    } catch (error) {
      console.error('API Error:', error);
    }
  };

  const handleSubmitAnswer = async (choiceId: number) => {
    if (!question) return;
    try {
      const answerData = await fetchSubmitAnswer(question.id, choiceId);
      setAnswer(answerData);
      console.log('API Response - Answer:', answerData);
    } catch (error) {
      console.error('API Error:', error);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>Quiz API Demo</Text>

      <TouchableOpacity
        onPress={handleFetchQuestion}
        style={{ backgroundColor: '#007AFF', padding: 15, borderRadius: 8, marginBottom: 20 }}
      >
        <Text style={{ color: 'white', textAlign: 'center' }}>Fetch Random Question</Text>
      </TouchableOpacity>

      {question && (
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 16, marginBottom: 10 }}>{question.text}</Text>
          <Text style={{ fontSize: 12, color: '#666', marginBottom: 15 }}>
            Type: {question.type} | ID: {question.id}
          </Text>

          {question.choicelist.map((choice, index) => (
            <TouchableOpacity
              key={choice.id}
              onPress={() => handleSubmitAnswer(choice.id)}
              style={{
                backgroundColor: '#f0f0f0',
                padding: 10,
                marginVertical: 5,
                borderRadius: 5
              }}
            >
              <Text>{String.fromCharCode(65 + index)}. {choice.text}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {answer && (
        <View>
          <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>
            Correct Answer: {answer.word}
          </Text>
          <Text style={{ marginBottom: 15 }}>{answer.explanation}</Text>

          {answer.choices.map((choice, index) => (
            <View key={choice.id} style={{ marginVertical: 5 }}>
              <Text style={{ fontWeight: choice.is_correct ? 'bold' : 'normal' }}>
                {String.fromCharCode(65 + index)}. {choice.text} {choice.is_correct ? '✓' : '✗'}
              </Text>
              <Text style={{ fontSize: 12, color: '#666' }}>{choice.explanation}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
