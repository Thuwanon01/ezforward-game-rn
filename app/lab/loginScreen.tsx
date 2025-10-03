import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';


{/* กำหนด URL ของ API หลังบ้าน */ }
const API_URL = ''; // กำหนด URL ของ API หลังบ้าน
let isLoading: any //ตั้งเป็น any ไว้ไม่ให้มันแดง error
export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  {/* ฟังก์ชันสำหรับจัดการการเข้าสู่ระบบ */ }
  {/* เชื่อมต่อ API จริง */ }
  const handleLogin = async () => {
    if (!username || !password) {
      setMessage('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน');
      return;
    }

    setIsLoading(true);
    setMessage('กำลังตรวจสอบข้อมูล...');

    try {
      // ยิง POST Request ไปยัง API หลังบ้าน เพื่อขอ Token
      const response = await axios.post(API_URL, {
        username: username,
        password: password
      });

      // ถ้าสำเร็จ (response.status === 200-299)
      const { access, refresh } = response.data;
      console.log('Login Successful, Access Token:', access);

      // นำ Token ไปเก็บไว้ใน AsyncStorage
      await AsyncStorage.setItem('accessToken', access);
      await AsyncStorage.setItem('refreshToken', refresh);

      setIsLoading(false);
      setMessage('เข้าสู่ระบบสำเร็จ! กำลังไปยังหน้าหลัก...');

      // รอ 1 วินาที เมื่อครบ 1 วินาที ให้ไปยังหน้าหลัก
      setTimeout(() => {
        router.replace('/lab/gameMunMun'); // ใช้ replace เพื่อไม่ให้ผู้ใช้กด back กลับมาหน้า login ได้
      }, 1000);

    } catch (error) {
      // ถ้าเกิดข้อผิดพลาด (เช่น รหัสผ่านผิด, server ล่ม)
      setIsLoading(false);
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 401) {
          setMessage('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
        } else {
          setMessage(`เกิดข้อผิดพลาด: ${error.response.status}`);
        }
      } else {
        setMessage('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
      }
    }
  };

  const handleRegister = () => {
    router.push('/lab/register' as any); // ไปยังหน้าลงทะเบียน
  };

  return (
    <View className='flex-1 justify-center items-center bg-gray-100'>
      <View className='w-full px-8'>
        <Text className='text-4xl font-bold text-center text-gray-800 mb-10'>
          Login
        </Text>
        <TextInput
          className='bg-white p-4 rounded-lg w-full text-lg mb-6 border border-gray-300'
          placeholder='Username'
          value={username}
          onChangeText={setUsername}
          autoCapitalize='none' // ปิดตัวพิมพ์ใหญ่อัตโนมัติ
          autoCorrect={false} // ปิดการแก้ไขอัตโนมัติ
        />
        <TextInput
          className='bg-white p-4 rounded-lg w-full text-lg mb-6 border border-gray-300'
          placeholder='Password'
          secureTextEntry={true} // ซ่อนรหัสผ่าน
          value={password}
          onChangeText={setPassword}
          autoCapitalize='none'
          autoCorrect={false}
        />
        {message && (
          <Text className='text-center text-red-500 mb-4'>
            {message}
          </Text>
        )}

        {isLoading && <ActivityIndicator size='large' color='#3b82f6' className='mb-4' />}

        <TouchableOpacity
          onPress={handleLogin}
          disabled={isLoading}
          className={`p-4 rounded-lg ${isLoading ? 'bg-gray-400' : 'bg-green-500'}`}
        ><Text className="text-white text-lg font-bold text-center">
            Sign In
          </Text>
        </TouchableOpacity>

        <View className="flex-row justify-center mt-6">
          <Text className="text-gray-500">Don't have an account? </Text>
          <TouchableOpacity onPress={handleRegister} disabled={isLoading}>
            <Text className="text-blue-500 font-bold">Register here</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
