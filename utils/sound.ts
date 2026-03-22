import { createAudioPlayer, type AudioPlayer } from 'expo-audio';

type SoundName = 'yessound.mp3' | 'alarm.mp3';

const sources = {
    'yessound.mp3': require('../assets/sounds/yessound.mp3'),
    'alarm.mp3': require('../assets/sounds/alarm.mp3'),
} as const;

const players: Partial<Record<SoundName, AudioPlayer>> = {};

export async function playSound(soundName: SoundName) {
    try {
        if (!players[soundName]) {
            players[soundName] = createAudioPlayer(sources[soundName]);
        }
        const player = players[soundName]!;
        await player.seekTo(0);
        player.play();
    } catch (error) {
        console.error('Error playing sound:', error);
    }
}
