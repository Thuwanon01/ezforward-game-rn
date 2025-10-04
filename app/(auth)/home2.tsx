import { useAuth } from '@/contexts/AuthContext';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function Home() {
    const auth = useAuth();
    console.log("Home", auth);

    return (
        <View>
            <Text>Home 2</Text>
            <Text>User: {auth.user ? auth.user.username : 'Not logged in'}</Text>
        </View>
    )
}

const styles = StyleSheet.create({})