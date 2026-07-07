import { useMemo, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { HeaderBar } from '@/components/HeaderBar';
import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { useActiveChild, useChildStore } from '@/features/child/store';
import { WEEKDAY_LABELS_JA } from '@/utils/date';
import { ColorPalette, radius, spacing, useTheme } from '@/theme';

export default function ScheduleSettings() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const child = useActiveChild();
  const updateChild = useChildStore((s) => s.updateChild);
  const [draft, setDraft] = useState<Record<number, string>>({});

  if (!child) return null;

  const times = { ...child.schoolArrivalTimes, ...draft };

  const handleChange = (day: number, value: string) => {
    setDraft((d) => ({ ...d, [day]: value }));
  };

  const handleCommit = (day: number, value: string) => {
    const time = /^\d{1,2}:\d{2}$/.test(value) ? value : child.schoolArrivalTimes[day] ?? '08:20';
    updateChild(child.id, { schoolArrivalTimes: { ...child.schoolArrivalTimes, [day]: time } });
    setDraft((d) => {
      const next = { ...d };
      delete next[day];
      return next;
    });
  };

  return (
    <Screen>
      <HeaderBar title="時間設定" onBack={() => router.back()} />

      <AppText variant="caption" color={colors.textMuted}>
        曜日ごとに登校時間を設定できます
      </AppText>

      <View style={styles.list}>
        {WEEKDAY_LABELS_JA.map((label, day) => (
          <Card key={day} style={styles.row}>
            <AppText variant="subtitle" style={styles.dayLabel}>
              {label}曜日
            </AppText>
            <TextInput
              value={times[day] ?? ''}
              onChangeText={(v) => handleChange(day, v)}
              onEndEditing={(e) => handleCommit(day, e.nativeEvent.text)}
              style={styles.timeInput}
              placeholder="08:20"
              placeholderTextColor={colors.textMuted}
            />
          </Card>
        ))}
      </View>
    </Screen>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    list: {
      gap: spacing.sm,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    dayLabel: {
      flex: 1,
    },
    timeInput: {
      backgroundColor: colors.surfaceAlt,
      borderRadius: radius.sm,
      padding: spacing.sm,
      fontSize: 16,
      color: colors.text,
      width: 90,
      textAlign: 'center',
    },
  });
}
