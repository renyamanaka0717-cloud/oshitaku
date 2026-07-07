import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { HeaderBar } from '@/components/HeaderBar';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { ExpandableCard } from '@/components/ExpandableCard';
import { WeekdayChips } from '@/features/parent/components/WeekdayChips';
import { useActiveChild } from '@/features/child/store';
import {
  createEveningTask,
  deleteEveningTask,
  listEveningTasks,
  moveEveningTask,
  updateEveningTask,
} from '@/db/repositories/taskRepository';
import { EveningTask } from '@/db/models';
import { ColorPalette, radius, spacing, useTheme } from '@/theme';

export default function EveningTasksSettings() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const child = useActiveChild();
  const [eveningTasks, setEveningTasks] = useState<EveningTask[]>([]);
  const [eveningLabel, setEveningLabel] = useState('');

  const reload = async (childId: string) => {
    setEveningTasks(await listEveningTasks(childId));
  };

  useEffect(() => {
    if (child) reload(child.id);
  }, [child]);

  if (!child) return null;

  return (
    <Screen>
      <HeaderBar title="夜のタスク" onBack={() => router.back()} />

      <View style={styles.section}>
        {eveningTasks.map((task, index) => (
          <ExpandableCard
            key={task.id}
            summary={
              <>
                <AppText style={styles.summaryIcon}>{task.icon}</AppText>
                <AppText variant="body" style={styles.summaryLabel} numberOfLines={1}>
                  {task.label}
                </AppText>
                <View style={styles.reorderCol}>
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation();
                      moveEveningTask(child.id, task.id, 'up').then(() => reload(child.id));
                    }}
                    disabled={index === 0}
                    hitSlop={4}
                  >
                    <AppText style={[styles.reorderArrow, index === 0 ? styles.reorderDisabled : null]}>▲</AppText>
                  </Pressable>
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation();
                      moveEveningTask(child.id, task.id, 'down').then(() => reload(child.id));
                    }}
                    disabled={index === eveningTasks.length - 1}
                    hitSlop={4}
                  >
                    <AppText
                      style={[
                        styles.reorderArrow,
                        index === eveningTasks.length - 1 ? styles.reorderDisabled : null,
                      ]}
                    >
                      ▼
                    </AppText>
                  </Pressable>
                </View>
              </>
            }
          >
            <View style={styles.row}>
              <TextInput
                value={task.icon}
                onChangeText={(v) => updateEveningTask(task.id, { icon: v }).then(() => reload(child.id))}
                style={styles.iconInput}
                maxLength={2}
              />
              <TextInput
                value={task.label}
                onChangeText={(v) => updateEveningTask(task.id, { label: v }).then(() => reload(child.id))}
                style={styles.labelInput}
              />
            </View>
            <WeekdayChips
              value={task.daysOfWeek}
              onChange={(days) => updateEveningTask(task.id, { daysOfWeek: days }).then(() => reload(child.id))}
            />
            <Button label="削除" variant="danger" size="md" onPress={() => deleteEveningTask(task.id).then(() => reload(child.id))} />
          </ExpandableCard>
        ))}
        <View style={styles.row}>
          <TextInput
            value={eveningLabel}
            onChangeText={setEveningLabel}
            placeholder="新しいタスク"
            placeholderTextColor={colors.textMuted}
            style={styles.labelInput}
          />
          <Button
            label="追加"
            onPress={async () => {
              if (!eveningLabel.trim()) return;
              await createEveningTask({ childId: child.id, label: eveningLabel.trim(), icon: '✅' });
              setEveningLabel('');
              reload(child.id);
            }}
            disabled={!eveningLabel.trim()}
          />
        </View>
      </View>
    </Screen>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    section: {
      gap: spacing.sm,
    },
    card: {
      gap: spacing.sm,
    },
    summaryIcon: {
      fontSize: 20,
    },
    summaryLabel: {
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
    labelInput: {
      flex: 1,
      backgroundColor: colors.surfaceAlt,
      borderRadius: radius.sm,
      padding: spacing.sm,
      fontSize: 16,
      color: colors.text,
    },
    reorderCol: {
      alignItems: 'center',
      gap: 2,
    },
    reorderArrow: {
      fontSize: 14,
      color: colors.textMuted,
      padding: 2,
    },
    reorderDisabled: {
      opacity: 0.25,
    },
  });
}
