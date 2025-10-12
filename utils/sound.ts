import { Audio } from 'expo-av';

const sounds = {
    'yessound.mp3': require('../assets/sounds/yessound.mp3'),
    'alarm.mp3': require('../assets/sounds/alarm.mp3'),
}

export async function playSound(soundName: "yessound.mp3" | "alarm.mp3") {
    try {
        const { sound } = await Audio.Sound.createAsync(
            sounds[soundName]
        )
        await sound.playAsync()
    } catch (error) {
        console.error("Error playing sound:", error)
    }
}
