import { useEffect } from 'react';
import { Stack, usePathname, router } from 'expo-router';
import { useParentAuthStore } from '@/features/parent/store';

export default function ParentLayout() {
  const { isUnlocked, loaded, load, lock } = useParentAuthStore();
  const pathname = usePathname();

  useEffect(() => {
    load();
    // Require the PIN again every time parent mode is freshly entered.
    lock();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const isGate = pathname === '/parent';
    if (!isUnlocked && !isGate) {
      router.replace('/parent');
    }
  }, [isUnlocked, loaded, pathname]);

  return <Stack screenOptions={{ headerShown: false }} />;
}
