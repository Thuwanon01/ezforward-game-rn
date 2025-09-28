import { Image } from 'expo-image';
import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import IconButton from './IconButton';
import TextButton from './TextButton';

interface Props {
  correctAnswer: string
  correctExplanation: string
  incorrectAnswer: string
  incorrectExplanation: string
  explanation: string
  helperStatus: { "eliminate": boolean, "double": boolean, "change": boolean }
  explanationStatus: boolean
}

const eliminateIcon = require('@/assets/images/helper-icons/eliminate.svg');
const doubleIcon = require('@/assets/images/helper-icons/double.svg');
const changeIcon = require('@/assets/images/helper-icons/change-question.svg');

export default function ExplanationPanel({ correctAnswer, correctExplanation, incorrectAnswer,
  incorrectExplanation, explanation, helperStatus, explanationStatus }: Props) {
    const [openExplanation, setOpenExplanation] = useState(false)

    const toggleExplanation = () =>{
      openExplanation ? setOpenExplanation(false) : setOpenExplanation(true)
    }

  return (
    //All box of footer
    <View className='bg-[#27548A] rounded-t-xl'>

      {/* Condition to show pop-up arrow */}
      {explanationStatus && <View className="flex-row justify-center mt-[12]">
        <TouchableOpacity onPress={toggleExplanation}>
          {openExplanation ? <Image source={require('assets/images/downArrow.svg')} style={{ width: 28, height: 28 }} /> : 
          <Image source={require('assets/images/upArrow.svg')} style={{ width: 28, height: 28 }} />}
        </TouchableOpacity>
      </View>}

      {/* Text explanation */}
      {openExplanation && <View className="m-[16]">
        <View>
          <Text className="text-red-700">{correctAnswer}</Text>
          <Text className="text-white">{`  - ${correctExplanation}`}</Text>
          <Text className="text-green-700">{incorrectAnswer}</Text>
          <Text className="text-white">{`  - ${incorrectExplanation}`}</Text>
          <View className='h-[8]'></View>
          <Text className="text-white font-bold ">{explanation}</Text>
        </View>
      </View>}
      
      {/* Icon and button  */}
      <View className="flex-row justify-between my-[16] mx-[40]">
        <IconButton iconImage={eliminateIcon} isDisable={helperStatus['eliminate']} onPress={()=>{}}/>
        <IconButton iconImage={doubleIcon} isDisable={helperStatus['double']} onPress={()=>{}}/>
        <IconButton iconImage={changeIcon} isDisable={helperStatus['change']} onPress={()=>{}}/>
        <TextButton text='Next' onPress={()=>alert('TextButton')}  />
      </View>
    </View>
  )
}



{/* <Image source={require('assets/images/downArrow.svg')} style={{width:28, height:28 }} />
                <Image source={require('assets/images/upArrow.svg')} style={{width:28, height:28 }} /> */}

