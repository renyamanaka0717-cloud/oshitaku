import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { HeaderBar } from '@/components/HeaderBar';
import { AppText } from '@/components/AppText';
import { PinPad } from '@/components/PinPad';
import { useParentAuthStore } from '@/features/parent/store';
import { colors, spacing } from '@/theme';

const PIN_LENGTH = 4;

export default function ParentGate() {
  const { hasPin, loaded, load, setPin, verifyPin } = useParentAuthStore();
  const [pin, setPinValue] = useState('');
  const [confirmPin, setConfirmPin] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    load();
  }, [load]);

  if (!loaded) return null;

  const handleDigit = async (digit: string) => {
    setError(false);
    const next = (pin + digit).slice(0, PIN_LENGTH);
    setPinValue(next);
    if (next.length === PIN_LENGTH) {
      if (!hasPin) {
        if (confirmPin === null) {
          setConfirmPin(next);
          setPinValue('');
        } else if (confirmPin === next) {
          await setPin(next);
          router.replace('/parent/dashboard');
        } else {
          setError(true);
          setConfirmPin(null);
          setPinValue('');
        }
      } else {
        const ok = await verifyPin(next);
        if (ok) {
          router.replace('/parent/dashboard');
        } else {
          setError(true);
          setPinValue('');
        }
      }
    }
  };

  const handleDelete = () => setPinValue((p) => p.slice(0, -1));

  const title = !hasPin
    ? confirmPin === null
      ? 'あんしょう番号をつくろう'
      : 'もう一度入力してね'
    : 'あんしょう番号を入力';

  return (
    <Screen contentStyle={styles.content}>
      <HeaderBar title="保護者モード" onBack={() => router.back()} />
      <AppText variant="subtitle" style={styles.title}>
        {title}
      </AppText>
      {error ? (
        <AppText variant="body" color={colors.danger} style={styles.title}>
          あんしょう番号が違います
        </AppText>
      ) : null}
      <PinPad value={pin} length={PIN_LENGTH} onPress={handleDigit} onDelete={handleDelete} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    gap: spacing.xl,
  },
  title: {
    textAlign: 'center',
  },
});
