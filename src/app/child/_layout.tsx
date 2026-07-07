import { Stack } from 'expo-router';
import { useActiveChild } from '@/features/child/store';
import { useChildData } from '@/features/child/useChildData';

export default function ChildLayout() {
  const child = useActiveChild();
  useChildData(child?.id);

  return <Stack screenOptions={{ headerShown: false }} />;
}
