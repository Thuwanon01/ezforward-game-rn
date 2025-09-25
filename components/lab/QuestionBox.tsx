import * as Speech from 'expo-speech';
import React, { useEffect } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';


// สำหรับเปลี่ยนรูปภาพตามสถานะที่โดนรับมา

const imagesSource = {
  wait: require('../../assets/images/ram.png'),
  reading: require('../../assets/images/PixVerse-V5-ram-read.gif'),
  good: require('../../assets/images/PixVerse-V5-ram-happy.gif'),
  bad: require('../../assets/images/PixVerse-V5-ram-sad.gif'),
};

// component QuestionBox จะรับ props 2 ตัวคือ question (ข้อความคำถาม) และ status (สถานะของรูปภาพ)

export default function QuestionBox({ question, status }: { question: string, status: string }) {

  // ใช้ useEffect เฝ้ามอง status ที่รับค่าเข้ามา
  useEffect(() => {
    // ถ้า status รับค่ามาเป็น "reading" ให้เริ่มอ่านคำถาม
    if (status === 'reading') {
      // สั่งให้อ่านคำถามโดยใช้ expo-speech
      Speech.speak(question, { language: 'en-Us' });
    }
    // Cleanup function: ถ้า component ถูกปิดกลางคัน ให้หยุดพูด
    return () => {
      Speech.stop();
    };
  }, [status]); // Effect นี้จะทำงานใหม่ทุกครั้งที่ prop 'status' เปลี่ยนค่า

  return (
    <View style={styles.container}>
      <View style={styles.parentBox}>
        <Text style={styles.questionText}>{question}</Text>
        <View>
          <Image
            style={styles.absoluteChild}
            source={imagesSource[status as keyof typeof imagesSource]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#fffac9ff',
  },
  parentBox: {
    width: 356,
    height: 225,
    backgroundColor: '#FCC61D', // สีเหลือง
    justifyContent: 'center',
    alignItems: 'center',
    // กำหนดให้เป็น relative เพื่อให้ตัวลูกอ้างอิงตำแหน่งจากกล่องนี้
    position: 'relative',
    borderWidth: 1,
    borderRadius: 20,
    boxShadow: '0 4px 8px rgba(178, 178, 178, 1)',
    marginTop: 20,
    borderColor: 'grey'
  },
  questionText: {
    color: '#183B4E',
    fontSize: 20,
    fontWeight: '600',
    padding: 10,
    textAlign: 'center'
  },
  absoluteChild: {
    width: 104,
    height: 134,
    boxShadow: '0 4px 8px rgba(178, 178, 178, 1)',
    // --- จุดสำคัญอยู่ตรงนี้ ---
    position: 'absolute', // ทำให้ Component นี้ลอยได้
    bottom: -113,             // ห่างจากขอบล่างของ parentBox -113 pixels
    right: -203.5          // ห่างจากขอบขวาของ parentBox -203.5 pixels
  },
});
