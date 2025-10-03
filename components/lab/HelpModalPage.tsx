import Change from '@/assets/images/helper-icons/changeColor.svg';
import Double from '@/assets/images/helper-icons/doubleColor.svg';
import Eliminate from '@/assets/images/helper-icons/eliminateColor.svg';
import React from "react";
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
    title: string
    subtitle: string
    isVisible: boolean
    onPressPlay: () => void
    onClose: () => void
    imageName: "eliminate" | "double" | "change"
}


export default function HelpModalPage({
    title,
    subtitle,
    isVisible,
    onPressPlay,
    onClose,
    imageName,
}: Props) {

    return (
        <Modal visible={isVisible} transparent animationType="fade">
            <Pressable style={styles.overlay} onPress={onClose}>
                <View style={styles.modalBox}>
                    
                    {/* ใช้ expo-image */}
                    {/* <Image source={images[imageName]} style={[styles.iconColor, { tintColor: 'rgb(222, 169, 84)' }]} contentFit="contain" /> */}
                    {imageName === 'eliminate' 
                                ? <Eliminate className={`w-[128] h-[128]`} />
                                : imageName === 'double'
                                ? <Double className={`w-[128] h-[128] stroke-[#DDA853] `} />
                                : <Change className={`w-[128] h-[128] stroke-[#DDA853] `} />}

                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.subtitle}>{subtitle}</Text>

                    <TouchableOpacity onPress={onPressPlay} style={styles.button}>
                        <Text style={styles.textStyle}>Play</Text>
                    </TouchableOpacity>
                </View>
            </Pressable>
        </Modal>
    )
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.4)",
    },
    modalBox: {
        
        backgroundColor: "rgb(255, 253, 232)",
        borderRadius: 20,
        padding: 20,
        alignItems: "center",
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        marginTop: 10,
        color: "rgb(25, 60, 79)",
    },
    subtitle: {
        fontSize: 16,
        marginVertical: 10,
        textAlign: "center",
    },
    button: {
        marginTop: 20,
        paddingHorizontal: 40,
        borderRadius: 50,
        backgroundColor: "rgb(252, 197, 30)",
    },
    textStyle: {
        padding: 10,
        fontWeight: "bold",
        fontSize: 20,
        color: "white",
        textShadowColor: "rgba(0, 0, 0, 0.75)",
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 3,
    },
    iconColor: {
        width: 200,
        height: 200,
    }
})
