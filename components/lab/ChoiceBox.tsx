import * as Speech from 'expo-speech';
import React, { useRef } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const ALPHA_LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];

interface Prop {
  text: string
  status: 'correct' | 'incorrect' | undefined | 'wait'
  onPress?: () => void
  disabled?: boolean
  index?: number
}

const DOUBLE_TAP_MS = 400;

export default function ChoiceBox({ text, status, onPress, disabled, index }: Prop) {
  const lastWebTapRef = useRef(0);

  const speak = () => {
    Speech.stop();
    const isThai = /[\u0E00-\u0E7F]/.test(text);
    const lang = isThai ? 'th-TH' : 'en-US';
    Speech.speak(text, { language: lang });
  };

  const handleWebPress = () => {
    if (disabled) return;
    const now = Date.now();
    if (now - lastWebTapRef.current < DOUBLE_TAP_MS) {
      lastWebTapRef.current = 0;
      speak();
      onPress?.();
    } else {
      lastWebTapRef.current = now;
      speak();
    }
  };

  const singleTap = Gesture.Tap().onEnd(() => { speak(); });

  const doubleTap = Gesture.Tap()
    .maxDuration(400)
    .numberOfTaps(2)
    .onEnd(() => {
      if (onPress) {
        speak();
        onPress();
      }
    });

  const gesture = disabled
    ? Gesture.Tap().enabled(false)
    : Gesture.Exclusive(doubleTap, singleTap);

  const isCorrect = status === 'correct';
  const isIncorrect = status === 'incorrect';

  const alphaLabel = index !== undefined ? (ALPHA_LABELS[index] ?? String(index + 1)) : null;

  const cardStyle = [
    styles.card,
    isCorrect && styles.cardCorrect,
    isIncorrect && styles.cardIncorrect,
    disabled && !isCorrect && !isIncorrect && styles.cardDisabled,
  ];

  const alphaStyle = [
    styles.alpha,
    isCorrect && styles.alphaCorrect,
    isIncorrect && styles.alphaIncorrect,
  ];

  const inner = (
    <View style={cardStyle}>
      {alphaLabel !== null && (
        <View style={alphaStyle}>
          <Text style={styles.alphaText}>{alphaLabel}</Text>
        </View>
      )}
      <Text style={styles.choiceText}>{text}</Text>
    </View>
  );

  if (Platform.OS === 'web') {
    return (
      <TouchableOpacity onPress={handleWebPress} disabled={disabled} activeOpacity={0.8}>
        {inner}
      </TouchableOpacity>
    );
  }

  return (
    <GestureDetector gesture={gesture}>
      <TouchableOpacity activeOpacity={0.8}>
        {inner}
      </TouchableOpacity>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#e8e4c8',
    marginHorizontal: 20,
    marginVertical: 5,
  },
  cardCorrect: {
    backgroundColor: '#d1fae5',
    borderColor: '#34d399',
  },
  cardIncorrect: {
    backgroundColor: '#fee2e2',
    borderColor: '#f87171',
  },
  cardDisabled: {
    opacity: 0.45,
  },
  alpha: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#183B4E',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  alphaCorrect: {
    backgroundColor: '#10b981',
  },
  alphaIncorrect: {
    backgroundColor: '#ef4444',
  },
  alphaText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '700',
  },
  choiceText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#183B4E',
    flex: 1,
  },
});
