import React from 'react'
import { Image, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

interface Props {
    title: string
    subtitle: string
    icon: string
    isVisible: boolean
    onPressPlay: () => void
    onClose: () => void
    imageName: 'image1' | 'image2' | 'image3'
}



export default function HelpModalPage({ title, subtitle, icon, isVisible, onPressPlay, onClose, imageName }: Props) {

    const imageSource =
        imageName === 'image1'
            ? require('../assets/image1.png')
            : imageName === 'image2'
                ? require('../assets/image2.png')
                : require('../assets/image3.png')

    return (
        <Modal
            visible={isVisible}
            transparent
            animationType="fade"
        >
            <Pressable style={styles.overlay} onPress={onClose}>
                <View style={styles.modalBox}>
                    {/* Icon */}
                    <Image source={icon as any} style={styles.icon} />

                    {/* Title */}
                    <Text style={styles.title}>{title}</Text>

                    {/* Subtitle */}
                    <Text style={styles.subtitle}>{subtitle}</Text>

                    {/* Play Button */}
                    <TouchableOpacity onPress={onPressPlay} style={styles.button} >
                        <Text style={styles.textStyle}>Play</Text>
                    </TouchableOpacity>


                </View>
            </Pressable>
        </Modal >
    )
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.4)', // dimmed background
    },
    modalBox: {
        width: "30%",
        height: "75%",
        backgroundColor: 'rgb(255, 253, 232)',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 40,
        fontWeight: 'bold',
        marginTop: 10,
        color: "rgb(25, 60, 79)"
    },
    subtitle: {
        fontSize: 18,
        marginVertical: 10,
        textAlign: 'center',
    },
    icon: {
        marginBottom: 20,
    },
    button: {
        marginTop: 20,
        paddingHorizontal: 40,
        borderRadius: 50,
        backgroundColor: ' rgb(252, 197, 30)',

    },
    textStyle: {
        padding: 10,
        fontWeight: "bold",
        fontSize: 28,
        color: "white",
        textShadowColor: "rgba(0, 0, 0, 0.75)", // shadow color
        textShadowOffset: { width: 2, height: 2 }, // shadow direction
        textShadowRadius: 3,
        justifyContent: "center",
        alignItems: "center"
    }
})
