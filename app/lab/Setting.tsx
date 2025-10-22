import { Button, ButtonText } from '@/components/ui/button';
import { useSetting } from '@/contexts/SettingContext';
import React from 'react';
import { Text, View } from 'react-native';

export default function SettingPage() {
    const settingCtx = useSetting()

    return (
        <View >
            <Text>{settingCtx.setting.soundEnable.toString()}</Text>
            <Text>{settingCtx.setting.gameLevel}</Text>
            <Button
                variant="solid"
                size="md"
                action="primary"
                onPress={() => settingCtx.set({ soundEnable: true })}>
                <ButtonText>Sound On</ButtonText>
            </Button>
            <Button
                onPress={() => settingCtx.set({ soundEnable: false })}>
                <ButtonText>Sound Off</ButtonText>
            </Button>
            <Button
                onPress={() => settingCtx.set({ gameLevel: 5 })}>
                <ButtonText>SetLevel to 5</ButtonText>
            </Button>
            <Button
                onPress={() => settingCtx.set({ gameLevel: 1 })}>
                <ButtonText>SetLevel to 1</ButtonText>
            </Button>

        </View>
    );
};


