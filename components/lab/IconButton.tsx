import DownArrow from '@/assets/images/downArrow.svg';
import Change from '@/assets/images/helper-icons/change-question.svg';
import Double from '@/assets/images/helper-icons/double.svg';
import Eliminate from '@/assets/images/helper-icons/eliminate.svg';
import UpArrow from '@/assets/images/upArrow.svg';
import React from 'react';
import { TouchableOpacity } from 'react-native';

interface Props {
    iconImage: string
    isDisable: boolean
    onPress: () => void
}

export default function IconButton({ iconImage, isDisable, onPress }: Props) {


    return (
        <TouchableOpacity onPress={onPress} className='justify-center'>

            {iconImage === 'eliminateIcon'
                ? <Eliminate className={`w-[28] h-[28] opacity-${isDisable ? 50 : 100}`} />
                : iconImage === 'doubleIcon'
                    ? <Double className={`w-[28] h-[28] opacity-${isDisable ? 50 : 100}`} />
                    : iconImage === 'changeIcon'
                        ? <Change className={`w-[28] h-[28] opacity-${isDisable ? 50 : 100}`} />
                        : iconImage === 'upArrow'
                            ? <UpArrow className={`w-[28] h-[28] `} />
                            : <DownArrow className={`w-[28] h-[28] `} />
            }

        </TouchableOpacity>

    )
}

