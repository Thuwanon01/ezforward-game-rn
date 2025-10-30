import { Button, ButtonText } from '@/components/ui/button';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import React from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
interface Props {
    title: string
    onPressBack: () => void
    onPressMenu: () => void
    openMenu: boolean
}
export default function HeaderPanel({ title, onPressBack, onPressMenu, openMenu }: Props) {

    const goToStudentGraph = () => {
        router.push('/studentGraph');
    }
    const goToSettings = () => {
        router.push('/subject');
    }

    return (
        <View className='w-full h-12 flex-row justify-between items-center px-4 border-b border-gray-300 bg-[#27548A]'>
            <TouchableOpacity >
                <Ionicons name="construct" size={24} color="white" onPress={onPressMenu} />
            </TouchableOpacity>
            <Text className='text-stone-50'>{title}</Text>
            <TouchableOpacity>
                <Ionicons name="log-out-outline" size={24} color="white" onPress={onPressBack} />
            </TouchableOpacity>
            <Modal visible={openMenu} animationType="fade" >
                <Text>Menu is Open</Text>
                <Button variant="solid" size="md" action="primary" onPress={onPressMenu}>
                    <ButtonText>Close Menu</ButtonText>
                </Button>
                <Button
                    variant="solid"
                    size="md"
                    action="primary"
                    onPress={goToStudentGraph}>
                    <ButtonText>Go to Student Graph</ButtonText>
                </Button>
                <Button variant="solid" size="md" action="primary" onPress={goToSettings}>
                    <ButtonText>Go to Settings</ButtonText>
                </Button>
            </Modal>
        </View>
    )
}
