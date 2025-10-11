import { Stack } from "expo-router";

import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { AuthProvider } from "@/contexts/AuthContext";
import '@/global.css';

export default function RootLayout() {
  return (
    <GluestackUIProvider>
      <AuthProvider>
        <Stack>
          <Stack.Screen name="login" options={{ headerShown: false }} />
          
          {/* <Stack.Screen name="home" options={{ headerShown: false }} /> */}
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        </Stack>
      </AuthProvider>
    </GluestackUIProvider>
  )
}
