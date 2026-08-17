import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { HeaderBar } from '@/components/HeaderBar';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { ExpandableCard } from '@/components/ExpandableCard';
import { DayTypePicker } from '@/features/parent/components/DayTypePicker';
import { AddTaskModal } from '@/features/parent/components/AddTaskModal';
import { useActiveChild } from '@/features/child/store';
import {
  createMorningTask,
  deleteMorningTask,
  listMorningTasks,
  moveMorningTask,
  updateMorningTask,
} from '@/db/repositories/taskRepository';
import { MorningTask } from '@/db/models';
import { ColorPalette, hardShadow, outlineWidth, radius, spacing, useTheme } from '@/theme';
import { goBack } from '@/utils/navigation';

export default function MorningTasksSettings() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const child = useActiveChild();
  const [morningTasks, setMorningTasks] = useState<MorningTask[]>([]);
  const [addModalVisible, setAddModalVisible] = useState(false);

  const reload = async (childId: string) => {
    setMorningTasks(await listMorningTasks(childId));
  };

  useEffect(() => {
    if (child) reload(child.id);
  }, [child]);

  if (!child) return null;

  return (
    <Screen>
      <HeaderBar
        title="朝のタスク"
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
        {morningTasks.map((task, index) => (
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
                      moveMorningTask(child.id, task.id, 'up').then(() => reload(child.id));
                    }}
                    disabled={index === 0}
                    hitSlop={4}
                  >
                    <AppText style={[styles.reorderArrow, index === 0 ? styles.reorderDisabled : null]}>▲</AppText>
                  </Pressable>
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation();
                      moveMorningTask(child.id, task.id, 'down').then(() => reload(child.id));
                    }}
                    disabled={index === morningTasks.length - 1}
                    hitSlop={4}
                  >
                    <AppText
                      style={[
                        styles.reorderArrow,
                        index === morningTasks.length - 1 ? styles.reorderDisabled : null,
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
                onChangeText={(v) => updateMorningTask(task.id, { icon: v }).then(() => reload(child.id))}
                style={styles.iconInput}
                maxLength={2}
              />
              <TextInput
                value={task.label}
                onChangeText={(v) => updateMorningTask(task.id, { label: v }).then(() => reload(child.id))}
                style={styles.labelInput}
              />
            </View>
            <DayTypePicker
              value={task.daysOfWeek}
              onChange={(days) => updateMorningTask(task.id, { daysOfWeek: days }).then(() => reload(child.id))}
            />
            <Button label="削除" variant="danger" size="md" onPress={() => deleteMorningTask(task.id).then(() => reload(child.id))} />
          </ExpandableCard>
        ))}
      </View>

      <AddTaskModal
        visible={addModalVisible}
        onSave={async ({ label, icon, daysOfWeek }) => {
          await createMorningTask({ childId: child.id, label, icon, daysOfWeek });
          reload(child.id);
        }}
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
