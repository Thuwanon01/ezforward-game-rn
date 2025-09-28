import type { ImageSource } from 'expo-image';
import { Image } from 'expo-image';
import React from 'react';
import { TouchableOpacity } from 'react-native';

interface Props {
    iconImage: string | ImageSource
    isDisable: boolean
    onPress: () => void
}

export default function IconButton({ iconImage, isDisable, onPress }: Props) {
    return (
        <TouchableOpacity onPress={onPress} className='justify-center'>
            <Image
                source={iconImage}
                style={{
                    width: 28, 
                    height: 28, 
                    opacity: isDisable ? 0.5 : 1
                }}
            />
        </TouchableOpacity>

    )
}

