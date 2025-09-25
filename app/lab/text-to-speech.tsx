import QuestionBox from "@/components/lab/QuestionBox";
import React, { useEffect, useState } from "react";
import { Button, StyleSheet, Text, View } from "react-native";

const questionText = "What is the capital of France?";

export default function TextToSpeechPage() {
  // สร้าง state และ timer logic ไว้ที่ Component หลัก
  const [status, setStatus] = useState('wait');

  useEffect(() => {
    let timer: any
    if (status === 'reading') {
      timer = setTimeout(() => {
        setStatus('wait'); // กลับเป็น wait หลังครบ 5 วิ
      }, 5000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [status]);

  // สร้างฟังก์ชันที่จะส่งลงไปให้ QuestionBox
  const handleQuestionPress = () => {
    if (status === 'wait') {
      setStatus('reading');
    }
  };

  return (
    
    <View style={styles.container}>
      <QuestionBox 
        question={questionText} 
        status={status}
        onPressQuestion={handleQuestionPress}
      />

      {/* กลุ่มปุ่มทดสอบ */}
      <View style={styles.controlsContainer}>
        <Text style={styles.controlTitle}>Test Panel</Text>

        {/* ปุ่ม Good */}
        <View style={styles.buttonWrapper}>
          <Button 
            title="Good"
            onPress={() => setStatus('good')}
            color="#2ecc71"
          />
        </View>

        {/* ปุ่ม Bad */}
        <View style={styles.buttonWrapper}>
          <Button 
            title="Bad"
            onPress={() => setStatus('bad')}
            color="#e74c3c"
          />
        </View>

        {/* ปุ่ม Wait */}
        <View style={styles.buttonWrapper}>
          <Button 
            title="Wait"
            onPress={() => setStatus('wait')}
          />
        </View>
      </View>
    </View>
  );
}

// เพิ่ม Styles สำหรับ Layout และปุ่ม
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fffac9ff', // ใช้เป็นสีพื้นหลังเดียวกับ QuestionBox เพื่อไม่ใหห้พื้นหลังพัง
  },
  controlsContainer: {
    justifyContent: 'center',
    marginTop: 150, // ระยะห่างจากรูปภาพของ QuestionBox
    width: '60%',   // กำหนดความกว้างของกลุ่มปุ่ม
    padding: 20,
    borderWidth: 1,
    borderColor: '#fffac9ff', // ใช้เป็นสีพื้นหลังเดียวกับ QuestionBox เพื่อไม่ใหห้พื้นหลังพัง
    borderRadius: 10,
    backgroundColor: '#fffac9ff' // ใช้เป็นสีพื้นหลังเดียวกับ QuestionBox เพื่อไม่ใหห้พื้นหลังพัง
  },
  controlTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  buttonWrapper: {
    marginBottom: 10, // ระยะห่างระหว่างแต่ละปุ่ม
  },
});