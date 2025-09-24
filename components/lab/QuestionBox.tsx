import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <View style={styles.parentBox}>
        <Text>นี่คือกล่องแม่ (Parent)</Text>
        <View style={styles.absoluteChild}>
          <Text style={styles.childText}>ลอยอยู่!</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  parentBox: {
    width: 300,
    height: 300,
    backgroundColor: '#f0f0f0', // สีเทา
    justifyContent: 'center',
    alignItems: 'center',
    // กำหนดให้เป็น relative เพื่อให้ลูกอ้างอิงตำแหน่งจากกล่องนี้
    position: 'relative',
    borderWidth: 1,
    borderColor: 'grey'
  },
  absoluteChild: {
    width: 80,
    height: 80,
    backgroundColor: '#e74c3c', // สีแดง
    justifyContent: 'center',
    alignItems: 'center',
    // --- จุดสำคัญอยู่ตรงนี้ ---
    position: 'absolute', // ทำให้ Component นี้ลอยได้
    top: 10,             // ห่างจากขอบบนของ parentBox 10 pixels
    right: 10,           // ห่างจากขอบขวาของ parentBox 10 pixels
  },
  childText: {
    color: '#fff',
    fontWeight: 'bold',
  }
});
