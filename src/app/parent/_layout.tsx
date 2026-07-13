import { Stack } from 'expo-router';

// PIN gate temporarily disabled — see git history to restore it
// (child/home.tsx also links directly to /parent/dashboard while this is off).
export default function ParentLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
