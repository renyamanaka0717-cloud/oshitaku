import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { HeaderBar } from '@/components/HeaderBar';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { SectionHeader } from '@/components/SectionHeader';
import { EmptyState } from '@/components/EmptyState';
import { ExpandableCard } from '@/components/ExpandableCard';
import { AddEventModal } from '@/features/calendar/components/AddEventModal';
import { useActiveChild } from '@/features/child/store';
import { useCalendarStore } from '@/features/calendar/store';
import { ColorPalette, hardShadow, outlineWidth, radius, spacing, useTheme } from '@/theme';
import { formatJapaneseDate, parseDateKey } from '@/utils/date';
import { goBack } from '@/utils/navigation';

export default function CalendarSettings() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const child = useActiveChild();
  const events = useCalendarStore((s) => s.events);
  const load = useCalendarStore((s) => s.load);
  const createEvent = useCalendarStore((s) => s.createEvent);
  const updateEvent = useCalendarStore((s) => s.updateEvent);
  const deleteEvent = useCalendarStore((s) => s.deleteEvent);

  const [addModalVisible, setAddModalVisible] = useState(false);

  useEffect(() => {
    if (child) load(child.id);
  }, [child, load]);

  return (
    <Screen>
      <HeaderBar
        title="カレンダー設定"
        onBack={goBack}
        right={
          <Pressable style={styles.addButton} onPress={() => setAddModalVisible(true)}>
            <AppText variant="caption" color={colors.white}>
              ＋ 追加
            </AppText>
          </Pressable>
        }
      />

      <View style={styles.section}>
        <SectionHeader title="たのしみな予定" icon="📅" />
        {events.length === 0 ? (
          <EmptyState icon="📅" message="まだ予定が登録されていません" />
        ) : (
          events.map((event) => (
            <ExpandableCard
              key={event.id}
              summary={
                <>
                  <AppText style={styles.summaryIcon}>{event.icon}</AppText>
                  <AppText variant="body" style={styles.summaryName} numberOfLines={1}>
                    {event.title}
                  </AppText>
                  <AppText variant="caption" color={colors.textMuted}>
                    {formatJapaneseDate(parseDateKey(event.date))}
                  </AppText>
                </>
              }
            >
              <View style={styles.row}>
                <TextInput
                  value={event.icon}
                  onChangeText={(v) => updateEvent(event.id, { icon: v })}
                  style={styles.iconInput}
                  maxLength={2}
                />
                <TextInput
                  value={event.title}
                  onChangeText={(v) => updateEvent(event.id, { title: v })}
                  style={styles.nameInput}
                />
              </View>
              <TextInput
                value={event.date}
                onChangeText={(v) => updateEvent(event.id, { date: v })}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textMuted}
                style={styles.dateInput}
              />
              <Button label="削除" variant="danger" size="md" onPress={() => deleteEvent(event.id)} />
            </ExpandableCard>
          ))
        )}
      </View>

      <AddEventModal
        visible={addModalVisible}
        onSave={(input) => createEvent(input)}
        onClose={() => setAddModalVisible(false)}
      />
    </Screen>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    addButton: {
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.md,
      borderRadius: radius.round,
      backgroundColor: colors.primary,
      borderWidth: outlineWidth - 1,
      borderColor: colors.black,
      borderBottomWidth: outlineWidth + hardShadow.offsetSm,
      borderRightWidth: outlineWidth + hardShadow.offsetSm,
    },
    section: {
      gap: spacing.sm,
    },
    summaryIcon: {
      fontSize: 20,
    },
    summaryName: {
      flex: 1,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    iconInput: {
      width: 44,
      textAlign: 'center',
      backgroundColor: colors.surfaceAlt,
      borderRadius: radius.sm,
      padding: spacing.sm,
      fontSize: 18,
      color: colors.text,
    },
    nameInput: {
      flex: 1,
      minWidth: 0,
      backgroundColor: colors.surfaceAlt,
      borderRadius: radius.sm,
      padding: spacing.sm,
      fontSize: 16,
      color: colors.text,
    },
    dateInput: {
      backgroundColor: colors.surfaceAlt,
      borderRadius: radius.sm,
      padding: spacing.sm,
      fontSize: 14,
      color: colors.text,
    },
  });
}
