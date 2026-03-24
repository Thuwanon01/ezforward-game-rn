import { Button, ButtonText } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import useRepositories from '@/hooks/useRepositories'
import React from 'react'
import { Text, View } from 'react-native'


export default function GetAnswerHistory() {
    const auth = useAuth()
    const repos = useRepositories(auth.accessToken).current;

    const onPress = async () => {

        const summary = await repos.gamev2.fetchAnswerSummary({
            answered_date__gte: "2025-10-01",
            answered_date__lte: "2025-10-31"
        })
        console.log(summary)
        alert('ok, check console')
    }
    return (
        <View>
            <Text>getAnswerHistory</Text>
            <Button variant="solid" size="md" action="primary" onPress={onPress}>
                <ButtonText>GET</ButtonText>
            </Button>
        </View>
    )
}

