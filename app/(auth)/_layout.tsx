import { useAuth } from "@/contexts/AuthContext";
import { Slot, useRouter } from 'expo-router';
import React, { useEffect, useState } from "react";
import { Text } from 'react-native';


export default function AuthLayout() {
  const auth = useAuth();
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const setup = async () => {
      const success = await auth.autoLogin()
      if (!success) {
        router.replace('/login')
        return
      }
      setLoading(false)
    }

    if (!auth.user) {
      setup();
    } else {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) {
    return <Text>Loading...</Text>
  }

  return (
    <Slot />
  )
}
