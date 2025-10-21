import React from 'react';
import { Modal, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';

interface Props {
    isVisible: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
}

export default function ConfirmationModal({ isVisible, onClose, onConfirm, title, message }: Props) {
    return (
        <Modal animationType="fade" transparent={true} visible={isVisible} onRequestClose={onClose}>
            <SafeAreaView className="flex-1 justify-center items-center bg-black/50">
                <View className="w-4/5 max-w-md bg-white rounded-2xl p-6 shadow-xl">
                    <Text className="text-xl font-bold text-gray-800 mb-2">{title}</Text>
                    <Text className="text-base text-gray-600 mb-6">{message}</Text>
                    <View className="flex-row justify-end space-x-3">
                        <TouchableOpacity
                            onPress={onClose}
                            className="bg-gray-200 px-6 py-2 rounded-lg"
                        >
                            <Text className="font-bold text-gray-700">ยกเลิก</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={onConfirm}
                            className="bg-red-500 px-6 py-2 rounded-lg"
                        >
                            <Text className="font-bold text-white">ยืนยัน</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        </Modal>
    );
}