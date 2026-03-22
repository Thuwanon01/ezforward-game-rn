import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { FetchError } from 'ofetch';
import React, { useState } from 'react';
import { ActivityIndicator, Image, Text, TextInput, TouchableOpacity, View } from 'react-native';


{/* กำหนด URL ของ API หลังบ้าน */ }
const API_URL = 'https://job8001.dobybot.com/users/api/token/'; // กำหนด URL ของ API หลังบ้าน

export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const auth = useAuth();

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
      await auth.login(username, password);
      setIsLoading(false);
      setMessage('เข้าสู่ระบบสำเร็จ! กำลังไปยังหน้าหลัก...');
      router.push("/subject");
    } catch (error: any) {
      if (error instanceof FetchError) {
        console.log(error.response)
        if (error.response?.status == 401) {
          setMessage(error.response._data.detail)
        }
        else {
          setMessage('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
          console.error('Network Error or CORS issue:', error);
        }
      } else {
        setMessage('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = () => {
    router.push("/lab/regis");
  };

  return (
    <View className='flex-1 justify-center items-center bg-[#fffac9ff]'>
      <View className='h-full w-full px-8'>
        <Image
          source={require('@/assets/images/ram-small.png')} // path รูปภาพ
          className="w-32 h-32 mb-8 self-center" // กำหนดขนาดและระยะห่าง
        />
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

        {loading && <ActivityIndicator size='large' color='#3b82f6' className='mb-4' />}

        <TouchableOpacity
          onPress={handleLogin}
          disabled={loading}
          className={`p-4 rounded-lg ${loading ? 'bg-gray-400' : 'bg-green-500'}`}
        >
          <Text className="text-white text-lg font-bold text-center">
            Sign In
          </Text>
        </TouchableOpacity>

        <View className="flex-row justify-center mt-6">
          <Text className="text-gray-500">Don't have an account? </Text>
          <TouchableOpacity onPress={handleRegister} disabled={loading}>
            <Text className="text-blue-500 font-bold">Register here</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
