import DownArrow from '@/assets/images/downArrow.svg';
import Change from '@/assets/images/helper-icons/change-question.svg';
import Double from '@/assets/images/helper-icons/double.svg';
import Eliminate from '@/assets/images/helper-icons/eliminate.svg';
import UpArrow from '@/assets/images/upArrow.svg';
import { CheckIcon } from "react-native-heroicons/solid";
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

interface Props {
    iconImage: string
    isDisable: boolean
    onPress: () => void
    /** True when this lifeline was activated on the current question. */
    used?: boolean
}

export default function IconButton({ iconImage, isDisable, onPress, used }: Props) {
    const dimmed = isDisable && !used;
    const iconClass = `w-[28] h-[28] ${dimmed ? "opacity-35" : "opacity-100"}`;

    const icon =
        iconImage === 'eliminateIcon' ? (
            <Eliminate className={iconClass} />
        ) : iconImage === 'doubleIcon' ? (
            <Double className={iconClass} />
        ) : iconImage === 'changeIcon' ? (
            <Change className={iconClass} />
        ) : iconImage === 'upArrow' ? (
            <UpArrow className="w-[28] h-[28]" />
        ) : (
            <DownArrow className="w-[28] h-[28]" />
        );

    const isHelperIcon =
        iconImage === 'eliminateIcon' ||
        iconImage === 'doubleIcon' ||
        iconImage === 'changeIcon';

    return (
        <View className="relative justify-center">
            <TouchableOpacity
                onPress={onPress}
                disabled={isDisable}
                className="justify-center"
                activeOpacity={isDisable ? 1 : 0.7}
            >
                {icon}
            </TouchableOpacity>
            {isHelperIcon && used && (
                <View className="absolute -right-0.5 -bottom-0.5 w-[18px] h-[18px] rounded-full bg-emerald-500 items-center justify-center border border-white">
                    <CheckIcon color="white" size={12} />
                </View>
            )}
        </View>
    );
}

