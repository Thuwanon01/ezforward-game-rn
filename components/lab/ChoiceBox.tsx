import * as Speech from 'expo-speech'
import { StyleSheet, Text, TouchableOpacity } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'

interface Prop {
  text: string
  status: 'correct' | 'incorrect' | undefined | 'wait'
  onPress?: () => void
  disabled?: boolean
}

export default function ChoiceBox({ text, status, onPress, disabled }: Prop) {
  const speak = () => {
    Speech.stop()
    const isThai = /[\u0E00-\u0E7F]/.test(text) // regex เช็คอักษรไทย
    const lang = isThai ? 'th-TH' : 'en-US'
    Speech.speak(text, { language: lang })
  }

  // Single tap: แค่พูดออกเสียง
  const singleTap = Gesture.Tap()
<<<<<<< HEAD
    .onStart(speak)
=======
    .onEnd(() => {
      speak()
    })
>>>>>>> 7d90cc5b3ad5bbfce7fcf82ba3452af60c6f28fb

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
     bgColor = "green"
     fontColor = "white"}
  else if (status === "incorrect") { 
    bgColor = "red" 
    fontColor = "white"}
  else if (disabled) { bgColor = "lightgrey" }

  return (
<<<<<<< HEAD
    <GestureDetector  gesture={Gesture.Exclusive(doubleTap, singleTap)}>
      <TouchableOpacity style ={[styles.boxChoice, {backgroundColor: color}]}>
        <Text style={styles.textChoice}>{text}</Text>
      </TouchableOpacity> 
    </GestureDetector >
=======
    <GestureDetector gesture={gesture}>
      <View style={[styles.boxChoice, { backgroundColor: bgColor }]}>
        <Text style={[styles.textChoice,{color: fontColor}]}>{text}</Text>
      </View>
    </GestureDetector>
>>>>>>> 7d90cc5b3ad5bbfce7fcf82ba3452af60c6f28fb
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
