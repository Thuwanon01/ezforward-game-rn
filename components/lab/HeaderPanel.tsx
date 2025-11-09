import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import React from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
interface Props {
    title: string
    onPressBack: () => void
    onPressMenu: () => void
    openMenu: boolean
}
export default function HeaderPanel({ title, onPressBack, onPressMenu, openMenu }: Props) {

    const goToStudentGraph = () => {
        router.push('/studentGraph');
    }
    const goToAnswerHistory = () => {
        router.push('/AnswerHistory');
    }
    const goToSettings = () => {
        router.push('/subject');
    }

    return (
        <View className='w-full h-12 flex-row justify-between items-center px-4 border-b border-gray-300 bg-[#27548A]'>
            <TouchableOpacity >
                <Ionicons name="construct" size={24} color="white" onPress={onPressMenu} />
            </TouchableOpacity>
            <Text className='text-stone-50'>{title}</Text>
            <TouchableOpacity>
                <Ionicons name="log-out-outline" size={24} color="white" onPress={onPressBack} />
            </TouchableOpacity>
            {(() => {
                const {
                    Animated,
                    Dimensions,
                    TouchableWithoutFeedback,
                    Pressable,
                    StyleSheet,
                } = require('react-native');

                const screenWidth = Dimensions.get('window').width;
                const panelWidth = Math.min(320, screenWidth * 0.85);

                function SlidingMenu({
                    visible,
                    onClose,
                }: {
                    visible: boolean;
                    onClose: () => void;
                }) {
                    const translateX = React.useRef(new Animated.Value(-panelWidth)).current;

                    React.useEffect(() => {
                        Animated.timing(translateX, {
                            toValue: visible ? 0 : -panelWidth,
                            duration: 300,
                            useNativeDriver: true,
                            easing: Animated.Easing ? Animated.Easing.out(Animated.Easing.ease) : undefined,
                        }).start();
                    }, [visible, panelWidth]);

                    return (
                        <Modal transparent visible={visible} animationType="none">
                            <View style={styles.overlay}>
                                <Animated.View
                                    style={[
                                        styles.panel,
                                        { width: panelWidth, transform: [{ translateX }] },
                                    ]}>
                                    <Text style={styles.title}>{title}</Text>

                                    <Pressable
                                        style={styles.item}
                                        onPress={() => {
                                            onClose();
                                            goToStudentGraph();
                                        }}>
                                        <Text style={styles.itemText}>📈 Student Graph</Text>
                                    </Pressable>

                                    <Pressable
                                        style={styles.item}
                                        onPress={() => {
                                            onClose();
                                            goToAnswerHistory();
                                        }}>
                                        <Text style={styles.itemText}>📈 Answer History</Text>
                                    </Pressable>

                                    <Pressable
                                        style={styles.item}
                                        onPress={() => {
                                            onClose();
                                            goToSettings();
                                        }}>
                                        <Text style={styles.itemText}>⚙️ Settings</Text>
                                    </Pressable>

                                    <Pressable style={[styles.item, styles.close]} onPress={onClose}>
                                        <Text style={[styles.itemText, styles.closeText]}>Close</Text>
                                    </Pressable>
                                </Animated.View>

                                {/* tappable backdrop to close */}
                                <TouchableWithoutFeedback onPress={onClose}>
                                    <View style={styles.backdrop} />
                                </TouchableWithoutFeedback>
                            </View>
                        </Modal>
                    );
                }

                const styles = StyleSheet.create({
                    overlay: {
                        flex: 1,
                        flexDirection: 'row',
                        backgroundColor: 'rgba(0,0,0,0.35)',
                    },
                    panel: {
                        height: '100%',
                        backgroundColor: '#fff',
                        paddingTop: 48,
                        paddingHorizontal: 16,
                        shadowColor: '#000',
                        shadowOffset: { width: 2, height: 0 },
                        shadowOpacity: 0.25,
                        shadowRadius: 8,
                        elevation: 10,
                    },
                    title: {
                        color: '#27548A',
                        fontWeight: '700',
                        fontSize: 18,
                        marginBottom: 12,
                    },
                    item: {
                        paddingVertical: 12,
                        paddingHorizontal: 8,
                        borderRadius: 8,
                        marginBottom: 8,
                    },
                    itemText: {
                        color: '#27548A',
                        fontSize: 16,
                    },
                    close: {
                        backgroundColor: '#27548A',
                        alignItems: 'center',
                        marginTop: 12,
                    },
                    closeText: {
                        color: '#fff',
                        fontWeight: '600',
                    },
                    backdrop: {
                        flex: 1,
                    },
                });

                return <SlidingMenu visible={openMenu} onClose={onPressMenu} />;
            })()}
        </View>
    )
}
