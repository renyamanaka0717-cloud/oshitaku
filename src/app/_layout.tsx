import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { MochiyPopOne_400Regular } from '@expo-google-fonts/mochiy-pop-one';
import { ZenMaruGothic_700Bold, ZenMaruGothic_900Black } from '@expo-google-fonts/zen-maru-gothic';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useChildStore } from '@/features/child/store';
import { useAuthStore } from '@/features/auth/store';
import { useAutoSync } from '@/features/sync/useAutoSync';
import { lightColors, ThemeProvider, useTheme } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

function RootLayoutInner() {
  const { colors, scheme } = useTheme();
  useAutoSync();
  return (
    <SafeAreaProvider>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}
      />
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const [fontsLoaded] = useFonts({
    MochiyPopOne_400Regular,
    ZenMaruGothic_700Bold,
    ZenMaruGothic_900Black,
  });

  useEffect(() => {
    // Load the child list here (not just in index.tsx) so it's populated
    // before ANY route renders, including a hard reload that lands
    // directly on a deep route like /child/home rather than "/".
    useAuthStore.getState().load();
    useChildStore
      .getState()
      .load()
      .then(() => setReady(true));
  }, []);

  useEffect(() => {
    if (ready && fontsLoaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [ready, fontsLoaded]);

  if (!ready || !fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: lightColors.background }} />;
  }

  return (
    <ThemeProvider>
      <RootLayoutInner />
    </ThemeProvider>
  );
}
