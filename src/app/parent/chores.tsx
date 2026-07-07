import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { HeaderBar } from '@/components/HeaderBar';
import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { SectionHeader } from '@/components/SectionHeader';
import { EmptyState } from '@/components/EmptyState';
import { ExpandableCard } from '@/components/ExpandableCard';
import { useActiveChild } from '@/features/child/store';
import { useChoresStore } from '@/features/chores/store';
import { usePointsStore } from '@/features/points/store';
import { ColorPalette, radius, spacing, useTheme } from '@/theme';

export default function ChoresSettings() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const child = useActiveChild();
  const chores = useChoresStore((s) => s.chores);
  const load = useChoresStore((s) => s.load);
  const createChore = useChoresStore((s) => s.createChore);
  const updateChore = useChoresStore((s) => s.updateChore);
  const deleteChore = useChoresStore((s) => s.deleteChore);
  const history = usePointsStore((s) => s.history);

  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🧹');
  const [pointValue, setPointValue] = useState('10');

  useEffect(() => {
    if (child) load(child.id);
  }, [child, load]);

  const handleAdd = async () => {
    if (!name.trim()) return;
    await createChore({ name: name.trim(), icon, pointValue: Number(pointValue) || 0 });
    setName('');
    setPointValue('10');
  };

  const completionHistory = useMemo(
    () => history.filter((h) => h.type === 'chore_complete'),
    [history]
  );

  return (
    <Screen>
      <HeaderBar title="おてつだい設定" onBack={() => router.back()} />

      <View style={styles.section}>
        <SectionHeader title="おてつだい一覧" icon="🧹" />
        {chores.map((chore) => (
          <ExpandableCard
            key={chore.id}
            summary={
              <>
                <AppText style={styles.summaryIcon}>{chore.icon}</AppText>
                <AppText variant="body" style={styles.summaryName} numberOfLines={1}>
                  {chore.name}
                </AppText>
                <AppText variant="caption" color={colors.primaryDark}>
                  +{chore.pointValue}pt
                </AppText>
              </>
            }
          >
            <View style={styles.row}>
              <TextInput
                value={chore.icon}
                onChangeText={(v) => updateChore(chore.id, { icon: v })}
                style={styles.iconInput}
                maxLength={2}
              />
              <TextInput
                value={chore.name}
                onChangeText={(v) => updateChore(chore.id, { name: v })}
                style={styles.nameInput}
              />
              <TextInput
                value={String(chore.pointValue)}
                onChangeText={(v) => updateChore(chore.id, { pointValue: Number(v.replace(/[^0-9]/g, '')) || 0 })}
                style={styles.pointInput}
                keyboardType="number-pad"
              />
            </View>
            <Button label="削除" variant="danger" size="md" onPress={() => deleteChore(chore.id)} />
          </ExpandableCard>
        ))}

        <Card style={styles.addCard}>
          <AppText variant="subtitle">おてつだいを追加</AppText>
          <View style={styles.row}>
            <TextInput value={icon} onChangeText={setIcon} style={styles.iconInput} maxLength={2} />
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="おてつだいの名前"
              placeholderTextColor={colors.textMuted}
              style={styles.nameInput}
            />
            <TextInput
              value={pointValue}
              onChangeText={setPointValue}
              style={styles.pointInput}
              keyboardType="number-pad"
            />
          </View>
          <Button label="追加する" onPress={handleAdd} disabled={!name.trim()} />
        </Card>
      </View>

      <View style={styles.section}>
        <SectionHeader title="完了履歴" icon="🧾" />
        {completionHistory.length === 0 ? (
          <EmptyState icon="🧾" message="まだ完了履歴はありません" />
        ) : (
          completionHistory.map((h) => (
            <Card key={h.id} style={styles.historyRow}>
              <AppText>{h.note}</AppText>
              <AppText color={colors.primaryDark}>+{h.amount}pt</AppText>
            </Card>
          ))
        )}
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
      backgroundColor: colors.surfaceAlt,
      borderRadius: radius.sm,
      padding: spacing.sm,
      fontSize: 16,
      color: colors.text,
    },
    pointInput: {
      width: 64,
      textAlign: 'center',
      backgroundColor: colors.surfaceAlt,
      borderRadius: radius.sm,
      padding: spacing.sm,
      fontSize: 16,
      color: colors.text,
    },
    addCard: {
      gap: spacing.sm,
    },
    historyRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
  });
}
