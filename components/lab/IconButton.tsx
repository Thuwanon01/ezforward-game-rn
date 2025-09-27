import { Image } from 'expo-image';
import React, { useEffect, useState } from 'react';
import { TouchableOpacity } from 'react-native';

interface Props {
    svgPath: 'eliminateIcon' | 'doubleIcon' | 'changeIcon';
    isDisable: boolean
    onPress: () => void
}

export default function IconButton({ svgPath, isDisable, onPress }: Props) {
    const [iconColor, setIconColor] = useState('white')

    useEffect(() => {
        isDisable ? setIconColor('gray') : setIconColor('white')
    }, [isDisable])

    const icon =
        svgPath === 'eliminateIcon'
            ? require('assets/images/Vector.svg')
            : svgPath === 'doubleIcon'
                ? require('assets/images/double.svg')
                : require('assets/images/changeChoice.svg'); // default = changeIcon

    return (
        <TouchableOpacity onPress={onPress} className='justify-center'>
            <Image
                source={icon}
                style={{ width: 28, height: 28, tintColor: iconColor }}
            />
        </TouchableOpacity>

    )
}

