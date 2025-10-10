import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface Props {
    title: string,
    onPressBack: () => void,
    onPressMenu: () => void
}
export default function HeaderPanel({ title, onPressBack, onPressMenu }: Props) {
    return (
        <View className='w-full h-12 flex-row justify-between items-center px-4 border-b border-gray-300 bg-[#27548A]'>
            <TouchableOpacity >
                <Ionicons name="menu" size={24} color="white" onPress={onPressMenu} />
            </TouchableOpacity>
            <Text className='text-stone-50'>{title}</Text>
            <TouchableOpacity>
                <Ionicons name="log-out-outline" size={24} color="white" onPress={onPressBack} />
            </TouchableOpacity>
        </View>
    )
}
