import { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, TextInput, View } from 'react-native';
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
import { useRewardsStore } from '@/features/rewards/store';
import { usePointsStore } from '@/features/points/store';
import { pickRewardImage } from '@/features/rewards/imagePicker';
import { ColorPalette, radius, spacing, useTheme } from '@/theme';

export default function RewardsSettings() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const child = useActiveChild();
  const rewards = useRewardsStore((s) => s.rewards);
  const load = useRewardsStore((s) => s.load);
  const createReward = useRewardsStore((s) => s.createReward);
  const updateReward = useRewardsStore((s) => s.updateReward);
  const deleteReward = useRewardsStore((s) => s.deleteReward);
  const history = usePointsStore((s) => s.history);

  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🎁');
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState('50');
  const [imageUri, setImageUri] = useState<string | null>(null);

  useEffect(() => {
    if (child) load(child.id);
  }, [child, load]);

  const handleAdd = async () => {
    if (!name.trim()) return;
    const pointCost = Number(cost) || 0;
    await createReward({ name: name.trim(), icon, description: description.trim(), imageUri, pointCost });
    setName('');
    setDescription('');
    setCost('50');
    setImageUri(null);
  };

  const handlePickImageForNew = async () => {
    const uri = await pickRewardImage();
    if (uri) setImageUri(uri);
  };

  const handlePickImageForExisting = async (rewardId: string) => {
    const uri = await pickRewardImage();
    if (uri) updateReward(rewardId, { imageUri: uri });
  };

  const exchangeHistory = useMemo(
    () => history.filter((h) => h.type === 'reward_exchange'),
    [history]
  );

  return (
    <Screen>
      <HeaderBar title="ごほうび設定" onBack={() => router.back()} />

      <View style={styles.section}>
        <SectionHeader title="ごほうび一覧" icon="🎁" />
        {rewards.map((reward) => (
          <ExpandableCard
            key={reward.id}
            summary={
              <>
                <View style={styles.summaryImageBox}>
                  {reward.imageUri ? (
                    <Image source={{ uri: reward.imageUri }} style={styles.image} resizeMode="cover" />
                  ) : (
                    <AppText style={styles.summaryImagePlaceholder}>{reward.icon}</AppText>
                  )}
                </View>
                <AppText variant="body" style={styles.summaryName} numberOfLines={1}>
                  {reward.name}
                </AppText>
                <AppText variant="caption" color={colors.primaryDark}>
                  {reward.pointCost}pt
                </AppText>
              </>
            }
          >
            <View style={styles.row}>
              <Pressable onPress={() => handlePickImageForExisting(reward.id)} style={styles.imageBox}>
                {reward.imageUri ? (
                  <Image source={{ uri: reward.imageUri }} style={styles.image} resizeMode="cover" />
                ) : (
                  <AppText style={styles.imagePlaceholder}>{reward.icon}</AppText>
                )}
              </Pressable>
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
            </View>
            <TextInput
              value={reward.description}
              onChangeText={(v) => updateReward(reward.id, { description: v })}
              placeholder="説明（任意）"
              placeholderTextColor={colors.textMuted}
              style={styles.descriptionInput}
            />
            <Button label="削除" variant="danger" size="md" onPress={() => deleteReward(reward.id)} />
          </ExpandableCard>
        ))}

        <Card style={styles.addCard}>
          <AppText variant="subtitle">ごほうびを追加</AppText>
          <View style={styles.row}>
            <Pressable onPress={handlePickImageForNew} style={styles.imageBox}>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
              ) : (
                <AppText style={styles.imagePlaceholder}>{icon}</AppText>
              )}
            </Pressable>
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
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="説明（任意）"
            placeholderTextColor={colors.textMuted}
            style={styles.descriptionInput}
          />
          <Button label="追加する" onPress={handleAdd} disabled={!name.trim()} />
        </Card>
      </View>

      <View style={styles.section}>
        <SectionHeader title="交換履歴" icon="🧾" />
        {exchangeHistory.length === 0 ? (
          <EmptyState icon="🧾" message="まだ交換履歴はありません" />
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

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    section: {
      gap: spacing.sm,
    },
    card: {
      gap: spacing.sm,
    },
    summaryImageBox: {
      width: 32,
      height: 32,
      borderRadius: radius.sm,
      backgroundColor: colors.surfaceAlt,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    summaryImagePlaceholder: {
      fontSize: 16,
    },
    summaryName: {
      flex: 1,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    imageBox: {
      width: 44,
      height: 44,
      borderRadius: radius.sm,
      backgroundColor: colors.surfaceAlt,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    image: {
      width: '100%',
      height: '100%',
    },
    imagePlaceholder: {
      fontSize: 20,
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
    costInput: {
      width: 64,
      textAlign: 'center',
      backgroundColor: colors.surfaceAlt,
      borderRadius: radius.sm,
      padding: spacing.sm,
      fontSize: 16,
      color: colors.text,
    },
    descriptionInput: {
      backgroundColor: colors.surfaceAlt,
      borderRadius: radius.sm,
      padding: spacing.sm,
      fontSize: 14,
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
