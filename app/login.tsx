import { useAuth } from '@/contexts/AuthContext';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { FetchError } from 'ofetch';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const mascotSource = {
  idle: require('@/assets/images/ram-small.png'),
  loading: require('@/assets/images/PixVerse-V5-ram-read.gif'),
  error: require('@/assets/images/PixVerse-V5-ram-sad.gif'),
};

export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const auth = useAuth();

  const mascotState = loading ? 'loading' : message && !message.includes('กำลัง') ? 'error' : 'idle';

  const handleLogin = async () => {
    if (!username || !password) {
      setMessage('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน');
      return;
    }
    setIsLoading(true);
    setMessage('กำลังตรวจสอบข้อมูล...');
    try {
      await auth.login(username, password);
      setIsLoading(false);
      router.push('/subject');
    } catch (error: any) {
      if (error instanceof FetchError) {
        if (error.response?.status === 401) {
          setMessage(error.response._data.detail ?? 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
        } else {
          setMessage('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
        }
      } else {
        setMessage('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={{ flex: 1, backgroundColor: '#183B4E' }}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Hero ── */}
        <View style={styles.hero}>
          <View style={styles.mascotCircle}>
            <Image style={styles.mascotImage} source={mascotSource[mascotState]} />
          </View>
          <Text style={styles.appName}>EzRam</Text>
          <Text style={styles.appTagline}>English Practice Game</Text>
        </View>

        {/* ── Card ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Welcome back</Text>
          <Text style={styles.cardSub}>Sign in to continue playing</Text>

          {/* Username */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Username</Text>
            <View style={[styles.inputField, username.length > 0 && styles.inputFilled]}>
              <Ionicons name="person-outline" size={18} color="#183B4E" style={{ opacity: 0.4 }} />
              <TextInput
                style={styles.textInput}
                placeholder="Enter your username"
                placeholderTextColor="#94a3b8"
                value={username}
                onChangeText={(v) => { setUsername(v); setMessage(''); }}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={[styles.inputField, password.length > 0 && styles.inputFilled]}>
              <Ionicons name="lock-closed-outline" size={18} color="#183B4E" style={{ opacity: 0.4 }} />
              <TextInput
                style={styles.textInput}
                placeholder="Enter your password"
                placeholderTextColor="#94a3b8"
                value={password}
                onChangeText={(v) => { setPassword(v); setMessage(''); }}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>
          </View>

          {/* Error message */}
          {message !== '' && !message.includes('กำลัง') && (
            <View style={styles.errorBox}>
              <Ionicons name="warning-outline" size={16} color="#dc2626" />
              <Text style={styles.errorText}>{message}</Text>
            </View>
          )}

          {/* Sign In button */}
          <TouchableOpacity
            style={[styles.signInBtn, loading && styles.signInBtnDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <ActivityIndicator size="small" color="#183B4E" />
                <Text style={styles.signInBtnTextDisabled}>Signing in...</Text>
              </View>
            ) : (
              <Text style={styles.signInBtnText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Register */}
          <View style={styles.registerRow}>
            <Text style={styles.registerMuted}>Don&apos;t have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/lab/regis')} disabled={loading}>
              <Text style={styles.registerLink}>Register here</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  // Hero
  hero: {
    backgroundColor: '#183B4E',
    paddingTop: 72,
    paddingBottom: 36,
    alignItems: 'center',
    gap: 10,
  },
  mascotCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(252,198,29,0.15)',
    borderWidth: 3,
    borderColor: 'rgba(252,198,29,0.35)',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  mascotImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  appName: {
    fontSize: 28,
    fontWeight: '900',
    color: 'white',
    letterSpacing: 0.5,
  },
  appTagline: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: 0.3,
  },
  // Card
  card: {
    flex: 1,
    backgroundColor: '#f7f5e8',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 28,
    paddingBottom: 40,
    gap: 14,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#183B4E',
  },
  cardSub: {
    fontSize: 13,
    color: 'rgba(24,59,78,0.5)',
    marginTop: -8,
    marginBottom: 4,
  },
  // Input
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: '#183B4E',
    opacity: 0.45,
  },
  inputField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  inputFilled: {
    borderColor: '#cbd5e1',
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#183B4E',
  },
  // Error
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fee2e2',
    borderWidth: 1.5,
    borderColor: '#fca5a5',
    borderRadius: 10,
    padding: 12,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: '#dc2626',
  },
  // Sign In button
  signInBtn: {
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#FCC61D',
    alignItems: 'center',
    shadowColor: '#FCC61D',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
    marginTop: 4,
  },
  signInBtnDisabled: {
    backgroundColor: '#e2e8f0',
    shadowOpacity: 0,
    elevation: 0,
  },
  signInBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#183B4E',
  },
  signInBtnTextDisabled: {
    fontSize: 16,
    fontWeight: '700',
    color: '#94a3b8',
  },
  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(24,59,78,0.12)',
  },
  dividerText: {
    fontSize: 12,
    color: 'rgba(24,59,78,0.3)',
  },
  // Register
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerMuted: {
    fontSize: 13,
    color: 'rgba(24,59,78,0.45)',
  },
  registerLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#183B4E',
    textDecorationLine: 'underline',
  },
});
