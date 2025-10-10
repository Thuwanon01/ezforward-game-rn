
import { Redirect } from 'expo-router';

export default function Index() {
  // สั่งให้ Redirect หรือ "ส่งต่อ" ผู้ใช้ไปยังหน้า /login ทันที
  return <Redirect href="/login" />;
}