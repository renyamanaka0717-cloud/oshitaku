import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
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

  useEffect(() => {
    // Load the child list here (not just in index.tsx) so it's populated
    // before ANY route renders, including a hard reload that lands
    // directly on a deep route like /child/home rather than "/".
    useAuthStore.getState().load();
    useChildStore
      .getState()
      .load()
      .then(() => setReady(true))
      .finally(() => SplashScreen.hideAsync().catch(() => {}));
  }, []);

  if (!ready) {
    return <View style={{ flex: 1, backgroundColor: lightColors.background }} />;
  }

  return (
    <ThemeProvider>
      <RootLayoutInner />
    </ThemeProvider>
  );
}
