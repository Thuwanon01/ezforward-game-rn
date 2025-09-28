import React, { useState } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import HeaderPanel from './HeaderPanel'
import HelpModalPage from './HelpModalPage'

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
            <HelpModalPage title='Change Question' subtitle='เปลี่ยนคำถามปัจจุบันเป็นคำถามใหม่ทันที' icon='reload' isVisible={modalVisible} onPressPlay={() => { }} onClose={closeModal} />
            <View className=''>
                <TouchableOpacity onPress={openModal}> play </TouchableOpacity>

            </View>

        </View>
    )
}


const styles = StyleSheet.create({})