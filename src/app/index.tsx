import { useEffect } from 'react';
import { View } from 'react-native';
import { Redirect } from 'expo-router';
import { useChildStore } from '@/features/child/store';
import { colors } from '@/theme';

export default function Index() {
  const { loaded, children, load } = useChildStore();

  useEffect(() => {
    load();
  }, [load]);

  if (!loaded) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  if (children.length === 0) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/child/home" />;
}
