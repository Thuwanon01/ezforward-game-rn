import * as Speech from 'expo-speech';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const imagesSource = {
  wait: require('../../assets/images/ram.png'),
  reading: require('../../assets/images/PixVerse-V5-ram-read.gif'),
  correct: require('../../assets/images/PixVerse-V5-ram-happy.gif'),
  incorrect: require('../../assets/images/PixVerse-V5-ram-sad.gif'),
};

export default function QuestionBox({ question, status, onPressQuestion, questionIndex }:
  { question: string, status: string, onPressQuestion: () => void, questionIndex?: number }) {

  const handlePress = () => {
    Speech.stop();
    const isThai = /[\u0E00-\u0E7F]/.test(question);
    const lang = isThai ? 'th-TH' : 'en-US';
    Speech.speak(question, { language: lang });
    onPressQuestion();
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.9}>
      {questionIndex !== undefined && (
        <Text style={styles.qIndex}>Question {questionIndex}</Text>
      )}
      <View style={styles.card}>
        <Text style={styles.questionText}>{question}</Text>

        {/* Mascot circle — overflows bottom-right of card */}
        <View style={styles.mascotCircle}>
          <Image
            style={styles.mascotImage}
            source={imagesSource[status as keyof typeof imagesSource]}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 44,
  },
  qIndex: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: '#183B4E',
    opacity: 0.45,
    marginBottom: 8,
  },
  card: {
    width: '100%',
    minHeight: 140,
    backgroundColor: '#FCC61D',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 16,
    paddingRight: 60,
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#FCC61D',
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    overflow: 'visible',
  },
  questionText: {
    color: '#183B4E',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 26,
    textAlign: 'center',
  },
  mascotCircle: {
    position: 'absolute',
    right: -8,
    bottom: -32,
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'white',
    borderWidth: 3,
    borderColor: '#FCC61D',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  mascotImage: {
    width: '100%',
    height: '100%',
    borderRadius: 36,
  },
});
