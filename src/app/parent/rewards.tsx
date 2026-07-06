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
import { useRewardsStore } from '@/features/rewards/store';
import { usePointsStore } from '@/features/points/store';
import { colors, radius, spacing } from '@/theme';

export default function RewardsSettings() {
  const child = useActiveChild();
  const rewards = useRewardsStore((s) => s.rewards);
  const load = useRewardsStore((s) => s.load);
  const createReward = useRewardsStore((s) => s.createReward);
  const updateReward = useRewardsStore((s) => s.updateReward);
  const deleteReward = useRewardsStore((s) => s.deleteReward);
  const history = usePointsStore((s) => s.history);

  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🎁');
  const [cost, setCost] = useState('50');

  useEffect(() => {
    if (child) load(child.id);
  }, [child, load]);

  const handleAdd = async () => {
    if (!name.trim()) return;
    const pointCost = Number(cost) || 0;
    await createReward({ name: name.trim(), icon, pointCost });
    setName('');
    setCost('50');
  };

  const exchangeHistory = history.filter((h) => h.type === 'reward_exchange');

  return (
    <Screen>
      <HeaderBar title="ごほうび設定" onBack={() => router.back()} />

      <View style={styles.section}>
        <SectionHeader title="ごほうび一覧" icon="🎁" />
        {rewards.map((reward) => (
          <Card key={reward.id} style={styles.row}>
            <TextInput
              value={reward.icon}
              onChangeText={(v) => updateReward(reward.id, { icon: v })}
              style={styles.iconInput}
              maxLength={2}
            />
            <TextInput
              value={reward.name}
              onChangeText={(v) => updateReward(reward.id, { name: v })}
              style={styles.nameInput}
            />
            <TextInput
              value={String(reward.pointCost)}
              onChangeText={(v) => updateReward(reward.id, { pointCost: Number(v.replace(/[^0-9]/g, '')) || 0 })}
              style={styles.costInput}
              keyboardType="number-pad"
            />
            <Button label="削除" variant="danger" onPress={() => deleteReward(reward.id)} />
          </Card>
        ))}

        <Card style={styles.addCard}>
          <AppText variant="subtitle">ごほうびを追加</AppText>
          <View style={styles.row}>
            <TextInput value={icon} onChangeText={setIcon} style={styles.iconInput} maxLength={2} />
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="ごほうびの名前"
              placeholderTextColor={colors.textMuted}
              style={styles.nameInput}
            />
            <TextInput
              value={cost}
              onChangeText={setCost}
              style={styles.costInput}
              keyboardType="number-pad"
            />
          </View>
          <Button label="追加する" onPress={handleAdd} disabled={!name.trim()} />
        </Card>
      </View>

      <View style={styles.section}>
        <SectionHeader title="交換履歴" icon="🧾" />
        {exchangeHistory.length === 0 ? (
          <AppText variant="body" color={colors.textMuted}>
            まだ交換履歴はありません
          </AppText>
        ) : (
          exchangeHistory.map((h) => (
            <Card key={h.id} style={styles.historyRow}>
              <AppText>{h.note}</AppText>
              <AppText color={colors.danger}>{h.amount}pt</AppText>
            </Card>
          ))
        )}
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
  nameInput: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    padding: spacing.sm,
    fontSize: 16,
    color: colors.text,
  },
  costInput: {
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
