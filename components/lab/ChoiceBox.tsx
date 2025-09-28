import * as Speech from 'expo-speech'
import { StyleSheet, Text, TouchableOpacity } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
interface Prop {
  text: string
  status:"correct" | "incorrect" | "wait" | "inactive"
}

export default function ChoiceBox({text, status,}:Prop) {

  const speak = () =>{
     Speech.stop()
     Speech.speak(text,{language:'eng-ENG'})  
  }

  const singleTap = Gesture.Tap()
    .onStart(speak)

  const doubleTap = Gesture.Tap()
    .maxDuration(250)
    .numberOfTaps(2)
    .onStart(() => {alert("2tap")})

  const isCorrect = status === "correct"
  let color = "white"
  if (status === "correct"){
    color="green"
  } else if (status === "incorrect"){
    color="red"
  } else if (status === "inactive"){
    color="gray"
  }
  return (
    <GestureDetector  gesture={Gesture.Exclusive(doubleTap, singleTap)}>
      <TouchableOpacity style ={[styles.boxChoice, {backgroundColor: color}]}>
        <Text style={styles.textChoice}>{text}</Text>
      </TouchableOpacity> 
    </GestureDetector >
  )
}

const styles = StyleSheet.create({
  boxChoice:{
    borderWidth:2,
    borderRadius:10,
    borderColor:"lightblue",
    margin:10,
    padding:10,
    alignItems:"center"
    
  },
  textChoice:{
    fontSize:20,
    fontWeight:"bold"
  }
})