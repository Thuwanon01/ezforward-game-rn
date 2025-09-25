import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';



export default function QuestionBox({ question }: { question: string }) {
  return (
    <View style={styles.container}>
      <View style={styles.parentBox}>
        <Text style={styles.questionText}>{question}</Text>
        <View>
          <Image style={styles.absoluteChild}
            source={require('../../assets/images/ram.png')}
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
  childText: {
    color: '#fff',
    fontWeight: 'bold',
  }
});
