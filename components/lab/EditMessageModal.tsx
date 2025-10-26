import React, { useEffect, useState } from 'react';
import { Modal, SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { XMarkIcon } from 'react-native-heroicons/solid';

interface Props {
    isVisible: boolean;
    onClose: () => void;
    onSave: (newText: string) => void;
    initialText: string;
}

export default function EditMessageModal({ isVisible, onClose, onSave, initialText }: Props) {
    const [text, setText] = useState(initialText);

    // อัปเดต state เมื่อ initialText เปลี่ยน
    useEffect(() => {
        setText(initialText);
    }, [initialText]);

    const handleSave = () => {
        if (text.trim()) {
            onSave(text.trim());
        }
    };

    return (
        <Modal animationType="fade" transparent={true} visible={isVisible} onRequestClose={onClose}>
            <SafeAreaView className="flex-1 justify-center items-center bg-black/50">
                <View className="w-4/5 max-w-md bg-white rounded-2xl p-6 shadow-xl">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-xl font-bold text-gray-800">แก้ไขข้อความ</Text>
                        <TouchableOpacity onPress={onClose} className="p-1">
                            <XMarkIcon size={24} color="#333" />
                        </TouchableOpacity>
                    </View>

                    <TextInput
                        value={text}
                        onChangeText={setText}
                        className="bg-gray-100 p-3 rounded-lg text-base border border-gray-300 mb-6"
                        autoFocus={true}
                    />

                    <View className="flex-row justify-end space-x-3">
                        <TouchableOpacity
                            onPress={onClose}
                            className="bg-gray-200 px-6 py-2 rounded-lg"
                        >
                            <Text className="font-bold text-gray-700">ยกเลิก</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleSave}
                            className="bg-blue-500 px-6 py-2 rounded-lg"
                        >
                            <Text className="font-bold text-white">บันทึก</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        </Modal>
    );
}