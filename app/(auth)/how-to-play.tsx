import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface MechCardProps {
  icon: string;
  iconBg: string;
  title: string;
  desc: string;
  highlight?: boolean;
  tag?: string;
}

function MechCard({ icon, iconBg, title, desc, highlight, tag }: MechCardProps) {
  return (
    <View style={[styles.mechCard, highlight && styles.mechCardHighlight]}>
      <View style={[styles.mechIconWrap, { backgroundColor: iconBg }]}>
        <Text style={styles.mechIcon}>{icon}</Text>
      </View>
      <View style={styles.mechContent}>
        <Text style={styles.mechTitle}>{title}</Text>
        <Text style={styles.mechDesc}>{desc}</Text>
        {tag && (
          <View style={styles.mechTag}>
            <Text style={styles.mechTagText}>{tag}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

export default function HowToPlayScreen() {
  const insets = useSafeAreaInsets();
  const [detailsOpen, setDetailsOpen] = useState(false);

  const toggleDetails = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setDetailsOpen((v) => !v);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#183B4E' }} edges={["top"]}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerMascot}>
          <Image
            source={require('@/assets/images/ram-small.png')}
            style={styles.headerMascotImg}
          />
        </View>
        <View>
          <Text style={styles.headerTitle}>วิธีเล่น GameMunMun</Text>
          <Text style={styles.headerSub}>อ่านครั้งเดียวพอเข้าใจ</Text>
        </View>
      </View>

      {/* ── Body ── */}
      <View style={styles.body}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.sectionLabel}>การกดในหน้าเกม</Text>

          <MechCard
            icon="📊"
            iconBg="#fef9c3"
            title="แถบคะแนนด้านบน"
            desc="แสดงคะแนนที่ตอบถูก / จำนวนข้อทั้งหมด เช่น 3/10"
          />
          <MechCard
            icon="🔊"
            iconBg="#fef9c3"
            title="กล่องคำถาม"
            desc="แตะ 1 ครั้ง → อ่านออกเสียง + แอนิเมชันมาสคอต"
          />
          <MechCard
            icon="👆"
            iconBg="rgba(252,198,29,0.2)"
            title="ตัวเลือกคำตอบ"
            desc={"แตะ 1 ครั้ง → อ่านออกเสียง\nแตะ 2 ครั้งติดกัน → ส่งคำตอบ"}
            highlight
            tag="สำคัญที่สุด"
          />
          <MechCard
            icon="✅"
            iconBg="#dcfce7"
            title="หลังตอบแล้ว"
            desc='ดูผลถูก/ผิดและคำอธิบายใต้ตัวเลือก → กด "Next" ไปข้อถัดไป'
          />
          <MechCard
            icon="🎉"
            iconBg="#ede9fe"
            title="จบชุดข้อ"
            desc="ป๊อปอัปสรุปรอบ → เล่นต่อ หรือ กลับเลือกวิชา"
          />
          <MechCard
            icon="✂️"
            iconBg="#fee2e2"
            title="ตัวช่วย Eliminate"
            desc="ใช้ได้ 1 ครั้งต่อรอบ — แตะไอคอน → ยืนยัน → ตัดตัวเลือกผิด 2 ข้อ"
          />

          {/* Details toggle */}
          <TouchableOpacity
            onPress={toggleDetails}
            activeOpacity={0.85}
            style={[styles.detailsToggle, detailsOpen && styles.detailsToggleOpen]}
          >
            <Text style={styles.detailsToggleText}>
              รายละเอียดเพิ่มเติม (เส้นทางแอป · ประวัติ · กราฟ)
            </Text>
            <Ionicons
              name={detailsOpen ? "chevron-up" : "chevron-down"}
              size={18}
              color="rgba(24,59,78,0.45)"
            />
          </TouchableOpacity>

          {detailsOpen && (
            <View style={styles.detailsBody}>
              <View>
                <Text style={styles.detailSectionTitle}>เส้นทางหลังเข้าสู่ระบบ</Text>
                <Text style={styles.detailBullet}>• หลังล็อกอินมาที่หน้านี้ก่อน — กดปุ่มด้านล่างจอไปเลือกวิชา</Text>
                <Text style={styles.detailBullet}>• หน้าเลือกวิชา: เลือกวิชา หัวข้อ ระดับ — แตะปุ่มเดิมอีกครั้งเพื่อยกเลิก</Text>
                <Text style={styles.detailBullet}>• เมนูประแจ: Student Graph · Answer History · Settings</Text>
                <Text style={styles.detailBullet}>• ไอคอนออกจากระบบด้านขวาบน → กลับหน้าเข้าสู่ระบบ</Text>
              </View>
              <View>
                <Text style={styles.detailSectionTitle}>Answer History</Text>
                <Text style={styles.detailBullet}>• สรุปตามช่วงวันที่: Total, Correct, Incorrect และ Accuracy Rate</Text>
                <Text style={styles.detailBullet}>• ปุ่มลัด Today · 7 Days · 30 Days · Custom</Text>
                <Text style={styles.detailBullet}>• แตะแถวประวัติเพื่อขยายรายละเอียด</Text>
              </View>
              <View>
                <Text style={styles.detailSectionTitle}>Student Graph</Text>
                <Text style={styles.detailBullet}>• การ์ดสรุปจำนวนข้อที่เล่นและถูก-ผิดโดยรวม</Text>
                <Text style={styles.detailBullet}>• Learning Topics: แตะหัวข้อเพื่อขยายดูคะแนนแต่ละระดับ</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* ── Footer CTA ── */}
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <TouchableOpacity
            onPress={() => router.replace("/subject")}
            style={styles.ctaBtn}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaBtnText}>เข้าใจแล้ว — ไปเลือกวิชา  ▶</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#183B4E',
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  headerMascot: {
    width: 52, height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(252,198,29,0.15)',
    borderWidth: 2,
    borderColor: 'rgba(252,198,29,0.35)',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerMascotImg: {
    width: 48, height: 48, borderRadius: 24,
  },
  headerTitle: {
    fontSize: 18, fontWeight: '800', color: 'white',
  },
  headerSub: {
    fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 2,
  },
  body: {
    flex: 1,
    backgroundColor: '#f7f5e8',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 8,
    gap: 10,
  },
  sectionLabel: {
    fontSize: 10, fontWeight: '700', letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#183B4E', opacity: 0.4,
    marginBottom: 2,
  },
  // Mechanic card
  mechCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    borderWidth: 1.5,
    borderColor: '#e8e4c8',
  },
  mechCardHighlight: {
    backgroundColor: '#fffbeb',
    borderColor: '#FCC61D',
    borderWidth: 2,
  },
  mechIconWrap: {
    width: 40, height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  mechIcon: { fontSize: 20 },
  mechContent: { flex: 1 },
  mechTitle: {
    fontSize: 13, fontWeight: '700', color: '#183B4E', marginBottom: 3,
  },
  mechDesc: {
    fontSize: 12, color: 'rgba(24,59,78,0.6)', lineHeight: 18,
  },
  mechTag: {
    marginTop: 6,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(252,198,29,0.25)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  mechTagText: {
    fontSize: 10, fontWeight: '700', color: '#183B4E',
  },
  // Details toggle
  detailsToggle: {
    backgroundColor: 'white',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailsToggleOpen: {
    borderColor: '#FCC61D',
    backgroundColor: '#fffbeb',
  },
  detailsToggleText: {
    flex: 1,
    fontSize: 13, fontWeight: '600', color: '#183B4E',
    paddingRight: 8,
  },
  detailsBody: {
    backgroundColor: 'white',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    padding: 16,
    gap: 14,
  },
  detailSectionTitle: {
    fontSize: 12, fontWeight: '700', color: '#183B4E',
    marginBottom: 6,
  },
  detailBullet: {
    fontSize: 12, color: 'rgba(24,59,78,0.65)', lineHeight: 20,
    marginBottom: 2,
  },
  // Footer
  footer: {
    backgroundColor: '#f7f5e8',
    borderTopWidth: 1,
    borderTopColor: 'rgba(24,59,78,0.1)',
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  ctaBtn: {
    backgroundColor: '#FCC61D',
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: '#FCC61D',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  ctaBtnText: {
    fontSize: 15, fontWeight: '800', color: '#183B4E',
  },
});
