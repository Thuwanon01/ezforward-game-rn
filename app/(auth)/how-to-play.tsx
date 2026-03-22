import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  LayoutAnimation,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

function SectionTitle({ children }: { children: string }) {
  return (
    <Text className="text-base font-bold text-[#183B4E] mt-4 mb-1.5">
      {children}
    </Text>
  );
}

function Bullet({ children }: { children: string }) {
  return (
    <Text className="text-[#183B4E]/90 text-sm leading-5 pl-1 mb-1.5">
      • {children}
    </Text>
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
    <SafeAreaView className="flex-1 bg-[#fffac9]" edges={["top"]}>
      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{
          paddingTop: 6,
          paddingBottom: 12,
        }}
        showsVerticalScrollIndicator={detailsOpen}
        keyboardShouldPersistTaps="handled"
      >
        <Text className="text-xl font-bold text-center text-[#183B4E] mb-0.5">
          วิธีเล่น GameMunMun
        </Text>
        <Text className="text-center text-[#183B4E]/70 text-xs mb-3">
          สรุปการกดในหน้าเกม — อ่านครั้งเดียวพอเข้าใจ
        </Text>

        {/* กล่องเด่น: เฉพาะการเล่นหลัก + การกด */}
        <View className="rounded-2xl border-2 border-[#FCC61D] bg-[#FFFDE8] px-3.5 py-3 shadow-md shadow-[#183B4E]/10">
          <Text className="text-center text-sm font-extrabold text-[#183B4E] mb-2.5">
            การกดในหน้าเกม (สำคัญที่สุด)
          </Text>

          <View className="border-t border-[#183B4E]/15 pt-2 mb-2">
            <Text className="text-xs font-bold text-[#27548A] mb-0.5">
              แถบด้านบน
            </Text>
            <Text className="text-xs text-[#183B4E] leading-5">
              แสดงคะแนนที่ตอบถูกในรอบนี้ / จำนวนข้อทั้งหมดในชุด (เช่น 3/10)
            </Text>
          </View>

          <View className="border-t border-[#183B4E]/15 pt-2 mb-2">
            <Text className="text-xs font-bold text-[#27548A] mb-0.5">
              กล่องคำถาม
            </Text>
            <Text className="text-xs text-[#183B4E] leading-5">
              แตะครั้งใดก็ได้ → อ่านคำถามออกเสียง + แอนิเมชันตัวมาสคอต (ไม่ใช่แบบ “สองครั้งเพื่อตอบ”)
            </Text>
          </View>

          <View className="border-t border-[#183B4E]/15 pt-2 mb-2">
            <Text className="text-xs font-bold text-[#27548A] mb-0.5">
              ตัวเลือกคำตอบ
            </Text>
            <Text className="text-xs text-[#183B4E] leading-5">
              แตะ 1 ครั้ง → อ่านข้อความตัวเลือกนั้นอย่างเดียว{"\n"}
              แตะ 2 ครั้งติดกัน → อ่านแล้วส่งคำตอบ{"\n"}
              <Text className="text-[#183B4E]/75">
                (บนเว็บ: กดซ้ำภายใน ~0.4 วินาที นับเป็นคู่กับครั้งแรก)
              </Text>
            </Text>
          </View>

          <View className="border-t border-[#183B4E]/15 pt-2 mb-2">
            <Text className="text-xs font-bold text-[#27548A] mb-0.5">
              หลังตอบแล้ว
            </Text>
            <Text className="text-xs text-[#183B4E] leading-5">
              ดูผลถูก/ผิดและคำอธิบายด้านล่าง → กด “Next” ไปข้อถัดไป
            </Text>
          </View>

          <View className="border-t border-[#183B4E]/15 pt-2 mb-2">
            <Text className="text-xs font-bold text-[#27548A] mb-0.5">
              จบชุดข้อ
            </Text>
            <Text className="text-xs text-[#183B4E] leading-5">
              ป๊อปอัปสรุปรอบ → “Continue playing” หรือ “Back to select subject”
            </Text>
          </View>

          <View className="border-t border-[#183B4E]/15 pt-2">
            <Text className="text-xs font-bold text-[#27548A] mb-0.5">
              ตัวช่วย (Helper)
            </Text>
            <Text className="text-xs text-[#183B4E] leading-5">
              ใช้ได้เพียง 1 ครั้งต่อ 1 รอบ (หนึ่งชุดข้อ) — ตอนนี้เปิด “Eliminate”
              : แตะไอคอน → ยืนยันในหน้าต่าง → ตัดตัวเลือกผิดออก 2 ข้อ
            </Text>
          </View>
        </View>

        {/* Dropdown: รายละเอียดที่เหลือ */}
        <TouchableOpacity
          onPress={toggleDetails}
          activeOpacity={0.85}
          className="mt-3 flex-row items-center justify-between rounded-xl border border-[#183B4E]/25 bg-white px-3 py-3"
        >
          <Text className="text-sm font-semibold text-[#183B4E] flex-1 pr-2">
            รายละเอียดเพิ่มเติม (เส้นทางแอป · ประวัติ · กราฟ)
          </Text>
          <Ionicons
            name={detailsOpen ? "chevron-up" : "chevron-down"}
            size={22}
            color="#183B4E"
          />
        </TouchableOpacity>

        {detailsOpen ? (
          <View className="mt-2 rounded-xl border border-[#183B4E]/15 bg-white/90 px-3 py-2 mb-2">
            <SectionTitle>เส้นทางหลังเข้าสู่ระบบ</SectionTitle>
            <Bullet children="หลังล็อกอินมาที่หน้านี้ก่อน — กดปุ่มด้านล่างจอไปเลือกวิชา" />
            <Bullet children="หน้าเลือกวิชา: เลือกวิชา หัวข้อ ระดับ — แตะปุ่มเดิมอีกครั้งเพื่อยกเลิก" />
            <Bullet children="กด “Play” เพื่อเข้าเกม" />
            <Bullet children="เมนูประแจ: Student Graph, Answer History, Settings — แตะพื้นหลังมืดหรือ Close ปิดเมนู" />
            <Bullet children="ไอคอนออกจากระบบด้านขวาบน → กลับหน้าเข้าสู่ระบบ" />

            <SectionTitle>Answer History — สรุปที่ควรรู้</SectionTitle>
            <Bullet children="สรุปตามช่วงวันที่: Total, Correct, Incorrect และ Accuracy Rate" />
            <Bullet children="กรองวันที่ / ปุ่มลัด Today · 7 Days · 30 Days · Custom — รายการด้านล่างและตัวเลขสรุปจะตามช่วงนั้น" />
            <Bullet children="แตะแถวประวัติเพื่อขยายรายละเอียด — มีเปลี่ยนหน้าเมื่อมีหลายหน้า" />

            <SectionTitle>Student Graph — สรุปที่ควรรู้</SectionTitle>
            <Bullet children="การ์ดสรุป: จำนวนข้อที่เล่นและถูก-ผิดโดยรวม" />
            <Bullet children="Learning Topics: แตะหัวข้อเพื่อขยาย — ตัวเลขคือคะแนนในแต่ละระดับ" />
            <Bullet children="ปุ่มย้อนกลับ → กลับหน้าเกม" />
          </View>
        ) : null}
      </ScrollView>

      <View
        className="border-t border-[#183B4E]/15 bg-[#fffac9] px-4 pt-3"
        style={{ paddingBottom: Math.max(insets.bottom, 12) }}
      >
        <TouchableOpacity
          onPress={() => router.replace("/subject")}
          className="py-3.5 rounded-full bg-[#FCC61D] items-center border border-[#183B4E]/20"
        >
          <Text className="text-base font-bold text-[#183B4E]">
            เข้าใจแล้ว — ไปเลือกวิชา
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
