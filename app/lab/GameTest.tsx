import HeaderPanel from '@/components/lab/HeaderPanel'
import HelpModalPage from '@/components/lab/HelpModalPage'
import { useState } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
export default function GameTest() {
    const [modalVisible, setModalVisible] = useState(false)

    const openModal = () => {
        setModalVisible(true)
    }
    const closeModal = () => {
        setModalVisible(false)
    }

    return (
        <View>
            <HeaderPanel title='GameTest' onPressBack={() => { }} onPressMenu={() => { }} />
            <HelpModalPage title={'ChangeQuestion'} subtitle={'เปลี่ยนคำถามปัจจุบันเป็นคำถามใหม่ทันที'} isVisible={modalVisible} onPressPlay={() => { }} onClose={closeModal} imageName='double'></HelpModalPage>
            <View className=''>
                <TouchableOpacity onPress={openModal}> play </TouchableOpacity>

            </View>

        </View>
    )
}


const styles = StyleSheet.create({})