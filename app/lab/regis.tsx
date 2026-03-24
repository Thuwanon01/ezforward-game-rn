import { useRouter } from "expo-router";
import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function RegisContactScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: '#183B4E' }}>
      {/* ── Hero ── */}
      <View style={styles.hero}>
        <View style={styles.mascotCircle}>
          <Image
            source={require("@/assets/images/ram-small.png")}
            style={styles.mascotImage}
          />
        </View>
        <Text style={styles.heroTitle}>Registration</Text>
        <Text style={styles.heroSub}>EzRam — English Practice Game</Text>
      </View>

      {/* ── Card ── */}
      <View style={styles.card}>
        {/* Info box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>📋</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle}>Contact EZFORWARD Team</Text>
            <Text style={styles.infoDesc}>
              Online registration is not available in the app yet.{"\n"}
              Please contact the EZFORWARD team to request an account or ask about access — they will help you get set up.
            </Text>
          </View>
        </View>

        {/* Notice */}
        <View style={styles.noticeBox}>
          <Text style={styles.noticeText}>
            🔒  บัญชีผู้ใช้จะได้รับจากทีมงาน EZFORWARD เท่านั้น
          </Text>
        </View>

        {/* Back button */}
        <TouchableOpacity
          onPress={() => router.replace("/login")}
          style={styles.backBtn}
          activeOpacity={0.85}
        >
          <Text style={styles.backBtnText}>← Back to Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: '#183B4E',
    paddingTop: 80,
    paddingBottom: 36,
    alignItems: 'center',
    gap: 10,
  },
  mascotCircle: {
    width: 96, height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(252,198,29,0.15)',
    borderWidth: 3,
    borderColor: 'rgba(252,198,29,0.35)',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  mascotImage: {
    width: 86, height: 86, borderRadius: 43,
  },
  heroTitle: {
    fontSize: 26, fontWeight: '900', color: 'white', letterSpacing: 0.5,
  },
  heroSub: {
    fontSize: 13, color: 'rgba(255,255,255,0.45)',
  },
  card: {
    flex: 1,
    backgroundColor: '#f7f5e8',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 28,
    gap: 16,
  },
  infoBox: {
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#e8e4c8',
    padding: 16,
    flexDirection: 'row',
    gap: 14,
    alignItems: 'flex-start',
  },
  infoIcon: {
    fontSize: 28,
    marginTop: 2,
  },
  infoTitle: {
    fontSize: 15, fontWeight: '700', color: '#183B4E',
    marginBottom: 6,
  },
  infoDesc: {
    fontSize: 13, color: 'rgba(24,59,78,0.65)', lineHeight: 20,
  },
  noticeBox: {
    backgroundColor: 'rgba(252,198,29,0.15)',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(252,198,29,0.4)',
    padding: 12,
  },
  noticeText: {
    fontSize: 13, fontWeight: '600', color: '#183B4E',
    textAlign: 'center',
  },
  backBtn: {
    marginTop: 4,
    paddingVertical: 15,
    borderRadius: 16,
    backgroundColor: '#183B4E',
    alignItems: 'center',
  },
  backBtnText: {
    fontSize: 15, fontWeight: '700', color: 'white',
  },
});
