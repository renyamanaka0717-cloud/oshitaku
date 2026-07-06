import { useEffect, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { HeaderBar } from '@/components/HeaderBar';
import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { SectionHeader } from '@/components/SectionHeader';
import { useActiveChild } from '@/features/child/store';
import {
  createEveningTask,
  createMorningTask,
  deleteEveningTask,
  deleteMorningTask,
  listEveningTasks,
  listMorningTasks,
  updateEveningTask,
  updateMorningTask,
} from '@/db/repositories/taskRepository';
import { EveningTask, MorningTask } from '@/db/models';
import { colors, radius, spacing } from '@/theme';

export default function TasksSettings() {
  const child = useActiveChild();
  const [morningTasks, setMorningTasks] = useState<MorningTask[]>([]);
  const [eveningTasks, setEveningTasks] = useState<EveningTask[]>([]);
  const [morningLabel, setMorningLabel] = useState('');
  const [eveningLabel, setEveningLabel] = useState('');

  const reload = async (childId: string) => {
    const [m, e] = await Promise.all([listMorningTasks(childId), listEveningTasks(childId)]);
    setMorningTasks(m);
    setEveningTasks(e);
  };

  useEffect(() => {
    if (child) reload(child.id);
  }, [child]);

  if (!child) return null;

  return (
    <Screen>
      <HeaderBar title="朝・夜タスク" onBack={() => router.back()} />

      <View style={styles.section}>
        <SectionHeader title="朝のタスク" icon="☀️" />
        {morningTasks.map((task) => (
          <Card key={task.id} style={styles.row}>
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
            <Button label="削除" variant="danger" onPress={() => deleteMorningTask(task.id).then(() => reload(child.id))} />
          </Card>
        ))}
        <View style={styles.row}>
          <TextInput
            value={morningLabel}
            onChangeText={setMorningLabel}
            placeholder="新しいタスク"
            placeholderTextColor={colors.textMuted}
            style={styles.labelInput}
          />
          <Button
            label="追加"
            onPress={async () => {
              if (!morningLabel.trim()) return;
              await createMorningTask({ childId: child.id, label: morningLabel.trim(), icon: '✅' });
              setMorningLabel('');
              reload(child.id);
            }}
            disabled={!morningLabel.trim()}
          />
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeader title="夜のタスク" icon="🌙" />
        {eveningTasks.map((task) => (
          <Card key={task.id} style={styles.row}>
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
            <Button label="削除" variant="danger" onPress={() => deleteEveningTask(task.id).then(() => reload(child.id))} />
          </Card>
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

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
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
  },
  labelInput: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    padding: spacing.sm,
    fontSize: 16,
    color: colors.text,
  },
});
