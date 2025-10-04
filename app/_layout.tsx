import { Stack } from "expo-router";

import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { AuthProvider } from "@/contexts/AuthContext";
import '@/global.css';

export default function RootLayout() {
  return (
    <GluestackUIProvider>
      <AuthProvider>
        <Stack>
          <Stack.Screen name="lab/testComponent" options={{ headerShown: false }} />
          <Stack.Screen name="lab/gameMunMun" options={{ headerShown: false }} />
          <Stack.Screen name="lab/loginScreen" options={{ headerShown: false }} />
          <Stack.Screen name="home" options={{ headerShown: false }} />
        </Stack>
      </AuthProvider>
    </GluestackUIProvider>
  )
}
