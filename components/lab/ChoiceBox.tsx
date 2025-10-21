import * as Speech from 'expo-speech';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Markdown from "react-native-markdown-display";

interface Prop {
  text: string
  status: 'correct' | 'incorrect' | undefined | 'wait'
  onPress?: () => void
  disabled?: boolean
  correctExplanation?: string
  incorrectExplanation?: string
}

export default function ChoiceBox({ text, status, onPress, disabled, correctExplanation, incorrectExplanation }: Prop) {
  const speak = () => {
    Speech.stop()
    const isThai = /[\u0E00-\u0E7F]/.test(text) // regex เช็คอักษรไทย
    const lang = isThai ? 'th-TH' : 'en-US'
    Speech.speak(text, { language: lang })
  }

  // Single tap: แค่พูดออกเสียง
  const singleTap = Gesture.Tap()
    .onEnd(() => {
      speak()
    })

  // Double tap: run onPress
  const doubleTap = Gesture.Tap()
    .maxDuration(400)
    .numberOfTaps(2)
    .onEnd(() => {
      if (onPress) {
        speak()
        onPress()
      }
    })

  const gesture =
    disabled
      ? Gesture.Tap().enabled(false) // dummy gesture ปิดการทำงาน
      : Gesture.Exclusive(doubleTap, singleTap)


  // กำหนดสีพื้นหลังตามสถานะ
  const isCorrect = status === "correct"
  let bgColor = "white" // สีพื้นหลังเริ่มต้น
  let fontColor = "black"
  if (isCorrect) {
    bgColor = "#9DFF9F"
    fontColor = "black"
  }
  else if (status === "incorrect") {
    bgColor = "#FFB3B3"
    fontColor = "black"
  }
  else if (disabled) { bgColor = "lightgrey" }

  return (
    <GestureDetector gesture={gesture}>
      <TouchableOpacity style={[styles.boxChoice, { backgroundColor: bgColor }]}>
        <Text style={[styles.textChoice, { color: fontColor }]}>{text}</Text>
        {status === "correct" ?
          <Markdown style={markdownStyles}>{correctExplanation}</Markdown>
          : status === "incorrect" ? (
            <Markdown style={markdownStyles}>{incorrectExplanation}</Markdown>
          ) : null}
      </TouchableOpacity>
    </GestureDetector>
  )
}

const styles = StyleSheet.create({
  boxChoice: {
    borderWidth: 2,
    borderRadius: 10,
    borderColor: 'lightblue',
    margin: 10,
    padding: 10,
    alignItems: 'center',
  },
  textChoice: {
    fontSize: 20,
    fontWeight: 'bold',
  },
})

const markdownStyles = StyleSheet.create({
  body: {
    color: "black",
  },
  code_inline: {
    borderWidth: 1,
    borderColor: "#FCC61D",
    backgroundColor: "#FCC61D",
    padding: 8,
    borderRadius: 4,
    lineHeight: 40,
  },
});
