import { Button, ButtonText } from '@/components/ui/button';
import { Image } from 'expo-image';
import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface Props {
  correctAnswer: string
  correctExplanation: string
  incorrectAnswer: string
  incorrectExplanation: string
  explanation: string
  helperStatus: { "eliminate": boolean, "double": boolean, "change": boolean }
  explanationStatus: boolean

}

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
      <View className="flex-row justify-between m-[16]">
        <TouchableOpacity onPress={() => alert('heyyyy')}>
          <Image
            source={require('assets/images/Vector.svg')}
            style={{ width: 28, height: 28, marginLeft: 32 }}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => alert('two')}>
          <Image
            source={require('assets/images/double.svg')}
            style={{ width: 28, height: 28 }} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => alert('xxxxxxxx')}>
          <Image
            source={require('assets/images/changeChoice.svg')}
            style={{ width: 28, height: 28 }} />
        </TouchableOpacity>
        <Button
          variant="solid"
          size="lg"
          action="primary"
          className="mr-[32] bg-[#FCC61D] rounded-3xl px-[32]">
          <ButtonText className='text-white font-bold text-3xl'>Next</ButtonText>
        </Button>
      </View>
    </View>
  )
}



{/* <Image source={require('assets/images/downArrow.svg')} style={{width:28, height:28 }} />
                <Image source={require('assets/images/upArrow.svg')} style={{width:28, height:28 }} /> */}

