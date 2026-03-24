import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import React from 'react';
import {
    Animated,
    Dimensions,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';

interface Props {
    title: string
    onPressBack: () => void
    onPressMenu: () => void
    openMenu: boolean
    sessionScore?: number
    sessionTotal?: number
}

const screenWidth = Dimensions.get('window').width;
const panelWidth = Math.min(320, screenWidth * 0.85);

interface MenuProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    onLogout: () => void;
}

function SlidingMenu({ visible, onClose, title, onLogout }: MenuProps) {
    const translateX = React.useRef(new Animated.Value(-panelWidth)).current;

    React.useEffect(() => {
        Animated.timing(translateX, {
            toValue: visible ? 0 : -panelWidth,
            duration: 300,
            useNativeDriver: true,
        }).start();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible]);

    const goToStudentGraph = () => { router.push('/studentGraph'); };
    const goToAnswerHistory = () => { router.push('/AnswerHistory'); };
    const goToSettings = () => { router.push('/subject'); };

    return (
        <Modal transparent visible={visible} animationType="none">
            <View style={menuStyles.overlay}>
                <Animated.View style={[menuStyles.panel, { width: panelWidth, transform: [{ translateX }] }]}>
                    <Text style={menuStyles.title}>{title}</Text>
                    <Text style={menuStyles.subtitle}>EzRam Game</Text>
                    <View style={menuStyles.divider} />

                    <Pressable style={menuStyles.item} onPress={() => { onClose(); goToStudentGraph(); }}>
                        <View style={[menuStyles.itemIcon, { backgroundColor: '#f0f9ff' }]}>
                            <Text style={{ fontSize: 18 }}>📈</Text>
                        </View>
                        <View>
                            <Text style={menuStyles.itemText}>Student Graph</Text>
                            <Text style={menuStyles.itemSub}>View your progress</Text>
                        </View>
                    </Pressable>

                    <Pressable style={menuStyles.item} onPress={() => { onClose(); goToAnswerHistory(); }}>
                        <View style={[menuStyles.itemIcon, { backgroundColor: '#f0fdf4' }]}>
                            <Text style={{ fontSize: 18 }}>📋</Text>
                        </View>
                        <View>
                            <Text style={menuStyles.itemText}>Answer History</Text>
                            <Text style={menuStyles.itemSub}>Review past answers</Text>
                        </View>
                    </Pressable>

                    <Pressable style={menuStyles.item} onPress={() => { onClose(); goToSettings(); }}>
                        <View style={[menuStyles.itemIcon, { backgroundColor: '#fefce8' }]}>
                            <Text style={{ fontSize: 18 }}>⚙️</Text>
                        </View>
                        <View>
                            <Text style={menuStyles.itemText}>Change Subject</Text>
                            <Text style={menuStyles.itemSub}>Pick a new topic</Text>
                        </View>
                    </Pressable>

                    <Pressable style={menuStyles.item} onPress={() => { onClose(); onLogout(); }}>
                        <View style={[menuStyles.itemIcon, { backgroundColor: '#fef2f2' }]}>
                            <Text style={{ fontSize: 18 }}>🚪</Text>
                        </View>
                        <View>
                            <Text style={[menuStyles.itemText, { color: '#ef4444' }]}>Log Out</Text>
                            <Text style={menuStyles.itemSub}>Sign out of account</Text>
                        </View>
                    </Pressable>

                    <Pressable style={menuStyles.closeBtn} onPress={onClose}>
                        <Text style={menuStyles.closeBtnText}>Close</Text>
                    </Pressable>
                </Animated.View>

                <TouchableWithoutFeedback onPress={onClose}>
                    <View style={menuStyles.backdrop} />
                </TouchableWithoutFeedback>
            </View>
        </Modal>
    );
}

export default function HeaderPanel({ title, onPressBack, onPressMenu, openMenu, sessionScore = 0, sessionTotal = 10 }: Props) {
    const progressPercent = sessionTotal > 0 ? Math.min(100, (sessionScore / sessionTotal) * 100) : 0;

    return (
        <View style={{ backgroundColor: '#183B4E' }}>
            <View style={styles.topBar}>
                <TouchableOpacity onPress={onPressMenu} style={styles.iconBtn}>
                    <Ionicons name="menu" size={20} color="white" />
                </TouchableOpacity>
                <Text style={styles.title}>{title}</Text>
                <TouchableOpacity onPress={onPressBack} style={styles.iconBtn}>
                    <Ionicons name="power" size={20} color="white" />
                </TouchableOpacity>
            </View>

            <View style={styles.progressWrap}>
                <View style={styles.progressBg}>
                    <View style={[styles.progressFill, { width: `${progressPercent}%` as any }]} />
                    <View style={styles.progressTextWrap}>
                        <Text style={styles.progressText}>{sessionScore} / {sessionTotal}</Text>
                    </View>
                </View>
            </View>

            <SlidingMenu visible={openMenu} onClose={onPressMenu} title={title} onLogout={onPressBack} />
        </View>
    );
}

const styles = StyleSheet.create({
    topBar: {
        paddingTop: 48,
        paddingBottom: 12,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    iconBtn: {
        width: 36,
        height: 36,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    progressWrap: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    progressBg: {
        height: 28,
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderRadius: 999,
        overflow: 'hidden',
        position: 'relative',
    },
    progressFill: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        backgroundColor: '#FCC61D',
        borderRadius: 999,
    },
    progressTextWrap: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },
    progressText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#183B4E',
    },
});

const menuStyles = StyleSheet.create({
    overlay: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'rgba(0,0,0,0.45)',
    },
    panel: {
        height: '100%',
        backgroundColor: '#fff',
        paddingTop: 48,
        paddingHorizontal: 16,
        paddingBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 10,
    },
    title: {
        color: '#183B4E',
        fontWeight: '800',
        fontSize: 18,
        marginBottom: 2,
    },
    subtitle: {
        color: '#94a3b8',
        fontSize: 12,
        marginBottom: 24,
    },
    divider: {
        height: 1,
        backgroundColor: '#f1f5f9',
        marginBottom: 16,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 12,
        marginBottom: 4,
    },
    itemIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    itemText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#334155',
    },
    itemSub: {
        fontSize: 11,
        color: '#94a3b8',
    },
    closeBtn: {
        marginTop: 'auto',
        paddingVertical: 12,
        backgroundColor: '#183B4E',
        borderRadius: 12,
        alignItems: 'center',
    },
    closeBtnText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
    backdrop: {
        flex: 1,
    },
});
