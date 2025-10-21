import React, { useState } from 'react';
import { Alert, FlatList, Modal, SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { PencilIcon, TrashIcon, XMarkIcon } from 'react-native-heroicons/solid';
import ConfirmationModal from './ConfirmationModal';
import EditMessageModal from './EditMessageModal';


interface Props {
    isVisible: boolean;
    onClose: () => void;
    onSelect: (message: string) => void;
    messages: string[];
    onUpdateMessages: (newMessages: string[]) => void;
}

export default function PremadeMessagesModal({ isVisible, onClose, onSelect, messages, onUpdateMessages }: Props) {
    const [newMessage, setNewMessage] = useState('');

    // --- เพิ่ม State สำหรับจัดการ Modal แก้ไข ---
    const [isEditModalVisible, setEditModalVisible] = useState(false);
    const [editingMessage, setEditingMessage] = useState({ index: -1, text: '' });

    // เพิ่ม State สำหรับ Modal ยืนยันการลบ
    const [isConfirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
    const [deletingIndex, setDeletingIndex] = useState(-1);

    const handleAdd = () => {
        if (!newMessage.trim()) return;
        if (messages.includes(newMessage.trim())) {
            Alert.alert("ข้อความซ้ำ", "มีข้อความนี้อยู่ในรายการแล้ว");
            return;
        }
        const updatedMessages = [...messages, newMessage.trim()];
        onUpdateMessages(updatedMessages);
        setNewMessage('');
    };

    // --- แก้ไข handleEdit ให้เปิด Modal ใหม่ ---
    const handleEdit = (indexToEdit: number) => {
        setEditingMessage({ index: indexToEdit, text: messages[indexToEdit] });
        setEditModalVisible(true);
    };

    // --- สร้างฟังก์ชันสำหรับบันทึกการแก้ไข ---
    const handleSaveEdit = (newText: string) => {
        const updatedMessages = [...messages];
        updatedMessages[editingMessage.index] = newText;
        onUpdateMessages(updatedMessages);
        setEditModalVisible(false); // ปิด Modal
    };

    // handleDelete ให้เปิด ConfirmationModal
    const handleDelete = (indexToDelete: number) => {
        setDeletingIndex(indexToDelete);
        setConfirmDeleteVisible(true);
    };

    // พิ่มฟังก์ชันยืนยันการลบ
    const confirmDelete = () => {
        const updatedMessages = messages.filter((_, index) => index !== deletingIndex);
        onUpdateMessages(updatedMessages);
        setConfirmDeleteVisible(false); // ปิด Modal
    };

    const renderItem = ({ item, index }: { item: string, index: number }) => (
        <View className="flex-row items-center bg-gray-100 p-3 rounded-lg mb-2">
            <TouchableOpacity onPress={() => onSelect(item)} className="flex-1 mr-2">
                <Text className="text-base text-gray-800">{item}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleEdit(index)} className="p-2">
                <PencilIcon size={20} color="#6b7280" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(index)} className="p-2">
                <TrashIcon size={20} color="#ef4444" />
            </TouchableOpacity>
        </View>
    );

    return (
        <>
            <Modal animationType="slide" transparent={false} visible={isVisible} onRequestClose={onClose}>
                <SafeAreaView className="flex-1 bg-white">
                    <View className="flex-1 p-5">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-2xl font-bold text-gray-800">เลือกหรือจัดการข้อความ</Text>
                            <TouchableOpacity onPress={onClose} className="p-1">
                                <XMarkIcon size={30} color="#333" />
                            </TouchableOpacity>
                        </View>

                        <View className="flex-row mb-4">
                            <TextInput
                                placeholder="เพิ่มข้อความใหม่..."
                                value={newMessage}
                                onChangeText={setNewMessage}
                                className="flex-1 bg-gray-200 p-3 rounded-lg text-base border border-gray-300"
                            />
                            <TouchableOpacity onPress={handleAdd} className="bg-blue-500 justify-center items-center px-4 ml-2 rounded-lg">
                                <Text className="text-white font-bold text-base">เพิ่ม</Text>
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={messages}
                            renderItem={renderItem}
                            keyExtractor={(_, index) => index.toString()}
                            showsVerticalScrollIndicator={false}
                        />
                    </View>
                </SafeAreaView>
            </Modal>

            {/* --- เรียกใช้ EditMessageModal ที่นี่ --- */}
            <EditMessageModal
                isVisible={isEditModalVisible}
                onClose={() => setEditModalVisible(false)}
                onSave={handleSaveEdit}
                initialText={editingMessage.text}
            />

            {/* เพิ่ม ConfirmationModal ที่นี่ */}
            <ConfirmationModal
                isVisible={isConfirmDeleteVisible}
                onClose={() => setConfirmDeleteVisible(false)}
                onConfirm={confirmDelete}
                title="ยืนยันการลบ"
                message="คุณต้องการลบข้อความนี้ใช่หรือไม่?"
            />
        </>
    );
}