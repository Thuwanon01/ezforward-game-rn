import { useRouter } from 'expo-router';
import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

const SuccessPage = () => {
    const router = useRouter();

    const handleGoToSubject = () => {
        router.push('/subject');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Success!</Text>
            <Text style={styles.message}>Your action was successful.</Text>
            <View style={styles.buttonContainer}>
                <Button title="Go to Subject Page" onPress={handleGoToSubject} color="#4F46E5" />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 12,
    },
    message: {
        fontSize: 18,
        color: '#374151',
        marginBottom: 32,
        textAlign: 'center',
    },
    buttonContainer: {
        width: '100%',
        maxWidth: 300,
    },
});

export default SuccessPage;