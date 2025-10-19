import * as Speech from 'expo-speech';
import React, { useEffect } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';


// สำหรับเปลี่ยนรูปภาพตามสถานะที่โดนรับมา

const imagesSource = {
  wait: require('../../assets/images/ram.png'),
  reading: require('../../assets/images/PixVerse-V5-ram-read.gif'),
  correct: require('../../assets/images/PixVerse-V5-ram-happy.gif'),
  incorrect: require('../../assets/images/PixVerse-V5-ram-sad.gif'),
};

// component QuestionBox จะรับ props 2 ตัวคือ question (ข้อความคำถาม) และ status (สถานะของรูปภาพ)

export default function QuestionBox({ question, status, onPressQuestion, questionIndex }:
  { question: string, status: string, onPressQuestion: () => void, questionIndex?: number }) {

  // ใช้ useEffect เฝ้ามอง status ที่รับค่าเข้ามา
  useEffect(() => {
    // ถ้า status รับค่ามาเป็น "reading" ให้เริ่มอ่านคำถาม
    if (status === 'reading') {
      // สั่งให้อ่านคำถามโดยใช้ expo-speech
      const isThai = /[\u0E00-\u0E7F]/.test(question);
      const lang = isThai ? 'th-TH' : 'en-US';

      Speech.speak(question, { language: lang });
    }
    // Cleanup function: จะทำงานเมื่อ status เปลี่ยน หรือ component ถูกปิด
    return () => {
      Speech.stop();
    };
  }, [status]); // Effect นี้จะทำงานใหม่ทุกครั้งที่ prop 'status' เปลี่ยนค่า

  return (
    <TouchableOpacity className='QuestionBox' style={styles.container} onPress={onPressQuestion}>
      <View style={styles.parentBox}>
        {/* เอา TouchableOpacity มาครอบ Text แล้วผูกกับ onPressQuestion */}
        <View style={{ position: 'absolute', top: 10, left: 10 }}>
          <Text style={{ fontSize: 16, fontWeight: '500', color: '#183B4E' }}>
            {questionIndex !== undefined ? `Question ${questionIndex}` : ''}
          </Text>
        </View>
        <Text style={styles.questionText}>{question}</Text>
        <View>
          <Image
            style={styles.absoluteChild}
            source={imagesSource[status as keyof typeof imagesSource]}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 40
    // backgroundColor: '#fffac9ff',
  },
  parentBox: {
    width: '100%',
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
