
import ChoiceBox from '@/components/lab/ChoiceBox';
import React from 'react';
import { View } from 'react-native';

export default function testComponent() {

    return (
        <View className='flex-1'>
            <ChoiceBox text='1.will take' status="correct" ></ChoiceBox>
            <ChoiceBox text='2.will come' status="incorrect"></ChoiceBox>
            <ChoiceBox text='3.will go' status="wait"></ChoiceBox>
            <ChoiceBox text='4.will be' status="wait"></ChoiceBox>
        </View>
    )
}