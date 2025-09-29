import React, { useState } from 'react';
import { Text, View } from 'react-native';
import HelpModalPage from './HelpModalPage';
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
  onPress: () => void
}



export default function ExplanationPanel({ correctAnswer, correctExplanation, incorrectAnswer,
  incorrectExplanation, explanation, helperStatus, explanationStatus, onPress }: Props) {
  const [openExplanation, setOpenExplanation] = useState(false)
  const [openHelper, setOpenHelper] = useState({ 'eliminate': false, 'double': false, 'change': false })


  const toggleExplanation = () => {
    openExplanation ? setOpenExplanation(false) : setOpenExplanation(true)
  }
  console.log(openExplanation)

  return (
    //All box of footer
    <View className='bg-[#27548A] rounded-t-xl'>

      {/* Condition to show pop-up arrow */}
      {explanationStatus && <View className="flex-row justify-center mt-[12]">

        {openExplanation ? <IconButton iconImage='downArrow' onPress={toggleExplanation} isDisable={false} /> : <IconButton iconImage='upArrow' onPress={toggleExplanation} isDisable={false} />}

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
        <IconButton iconImage='eliminateIcon' isDisable={helperStatus['eliminate']} onPress={() => setOpenHelper({ 'eliminate': true, 'double': false, 'change': false })} />
        <IconButton iconImage='doubleIcon' isDisable={helperStatus['double']} onPress={() => setOpenHelper({ 'eliminate': false, 'double': true, 'change': false })} />
        <IconButton iconImage='changeIcon' isDisable={helperStatus['change']} onPress={() => setOpenHelper({ 'eliminate': false, 'double': false, 'change': true })} />
        <TextButton text='Next' onPress={onPress} />
      </View>

      {/* Modal page */}
      <HelpModalPage title='Eliminate' subtitle='Eliminate 2 wrong answers' isVisible={openHelper['eliminate']}
        onPressPlay={() => { }} onClose={() => setOpenHelper({ 'eliminate': false, 'double': false, 'change': false })} imageName='eliminate' ></HelpModalPage>
      <HelpModalPage title='Double Chance' subtitle='Get 2 choices to answer' isVisible={openHelper['double']}
        onPressPlay={() => { }} onClose={() => setOpenHelper({ 'eliminate': false, 'double': false, 'change': false })} imageName='double' ></HelpModalPage>
      <HelpModalPage title='Change Question' subtitle='Change to a new question' isVisible={openHelper['change']}
        onPressPlay={() => { }} onClose={() => setOpenHelper({ 'eliminate': false, 'double': false, 'change': false })} imageName='change' ></HelpModalPage>
    </View>

  )
}



{/* <Image source={require('assets/images/downArrow.svg')} style={{width:28, height:28 }} />
                <Image source={require('assets/images/upArrow.svg')} style={{width:28, height:28 }} /> */}

