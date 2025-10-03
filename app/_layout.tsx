import { Stack } from "expo-router";

import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import '@/global.css';

export default function RootLayout() {
  return (
    <GluestackUIProvider>
      <Stack>
        <Stack.Screen name="lab/testComponent" options={{headerShown:false}}/>
        <Stack.Screen name="lab/gameMunMun" options={{headerShown:false}}/>
        <Stack.Screen name="/lab/loginScreen" options={{headerShown:false}}/>
      </Stack>

    </GluestackUIProvider>
  )
}
