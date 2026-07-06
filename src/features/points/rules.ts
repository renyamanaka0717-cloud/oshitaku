import {
  dailyTaskLogRepository,
  dayCompletionRepository,
  notificationSettingRepository,
  pointHistoryRepository,
  pointRuleRepository,
  stampRepository,
} from '@/db/repositories';
import { Child } from '@/db/models';
import { minutesUntil } from '@/utils/date';
import { computeStreak } from '@/utils/streak';
import { notifyCompletionNow } from '@/features/notifications/service';
import { usePointsStore } from '@/features/points/store';
import { useStampsStore } from '@/features/stamps/store';
import { useStreakStore } from '@/features/home/streakStore';

const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100];

function refreshPointsAndStamps() {
  usePointsStore.getState().refresh().catch(() => {});
  useStampsStore.getState().refresh().catch(() => {});
  useStreakStore.getState().refresh().catch(() => {});
}

export type AwardResult = {
  pointsAwarded: number;
  gotStamp: boolean;
  stampKind: 'normal' | 'rare' | null;
  stampType?: string;
  perfectDay?: {
    bonusPoints: number;
    specialStampType: string;
  };
};

async function isAllChecked(childId: string, date: string, kind: 'morning_task' | 'evening_task' | 'item', taskIds: string[]) {
  if (taskIds.length === 0) return false;
  const logs = await dailyTaskLogRepository.listLogsForDate(childId, date, kind);
  const checkedIds = new Set(logs.filter((l) => l.checked).map((l) => l.refId));
  return taskIds.every((id) => checkedIds.has(id));
}

async function awardPerfectDayBonus(
  child: Child,
  date: string,
  morningOnTime: boolean,
  eveningOnTime: boolean
): Promise<{ bonusPoints: number; specialStampType: string }> {
  const rule = await pointRuleRepository.getPointRule(child.id);

  await pointHistoryRepository.addPointHistory({
    childId: child.id,
    date,
    type: 'perfect_day_bonus',
    amount: rule.perfectDayBonus,
    note: '朝＋夜パーフェクト達成',
  });

  let specialStampType: string;
  if (morningOnTime && eveningOnTime) {
    specialStampType = 'ontime_crown';
  } else {
    const completions = await dayCompletionRepository.listRecentCompletions(child.id, 400);
    const streak = computeStreak(completions);
    specialStampType = STREAK_MILESTONES.includes(streak) ? 'streak' : 'perfect';
  }

  const stamp = await stampRepository.addStamp({
    childId: child.id,
    date,
    kind: 'special',
    source: 'perfect',
    stampType: specialStampType,
  });

  notifyCompletionNow('パーフェクトな一日！✨', `${child.name}さん、朝も夜もばっちりだったね！`).catch(() => {});

  return { bonusPoints: rule.perfectDayBonus, specialStampType: stamp.stampType };
}

export async function evaluateMorning(
  child: Child,
  date: string,
  morningTaskIds: string[]
): Promise<AwardResult> {
  const result: AwardResult = { pointsAwarded: 0, gotStamp: false, stampKind: null };
  const allChecked = await isAllChecked(child.id, date, 'morning_task', morningTaskIds);
  if (!allChecked) return result;

  const completionBefore = await dayCompletionRepository.getDayCompletion(child.id, date);
  if (completionBefore?.morningCompleted) return result;

  const rule = await pointRuleRepository.getPointRule(child.id);
  const now = new Date();
  const remaining = minutesUntil(child.schoolArrivalTime, now);
  const onTime = remaining >= 0;

  await dayCompletionRepository.updateDayCompletion(child.id, date, {
    morningCompleted: true,
    morningCompletedAt: now.toISOString(),
    morningOnTime: onTime,
  });

  await pointHistoryRepository.addPointHistory({
    childId: child.id,
    date,
    type: 'morning_complete',
    amount: rule.morningComplete,
    note: '朝のおしたく完了',
  });
  result.pointsAwarded += rule.morningComplete;

  if (onTime) {
    await pointHistoryRepository.addPointHistory({
      childId: child.id,
      date,
      type: 'on_time',
      amount: rule.onTime,
      note: '時間内達成',
    });
    result.pointsAwarded += rule.onTime;
  }

  const morningStampKind = onTime ? 'rare' : 'normal';
  const stamp = await stampRepository.addStamp({
    childId: child.id,
    date,
    kind: morningStampKind,
    source: 'morning',
  });
  result.gotStamp = true;
  result.stampKind = morningStampKind;
  result.stampType = stamp.stampType;

  if (completionBefore?.eveningCompleted) {
    const bonus = await awardPerfectDayBonus(child, date, onTime, completionBefore.eveningOnTime);
    result.perfectDay = bonus;
    result.pointsAwarded += bonus.bonusPoints;
  }

  notifyCompletionNow('朝のおしたく完了！☀️', `${child.name}さん、よくできました！`).catch(() => {});
  refreshPointsAndStamps();

  return result;
}

export async function evaluateEvening(
  child: Child,
  date: string,
  eveningTaskIds: string[]
): Promise<AwardResult> {
  const result: AwardResult = { pointsAwarded: 0, gotStamp: false, stampKind: null };
  const allChecked = await isAllChecked(child.id, date, 'evening_task', eveningTaskIds);
  if (!allChecked) return result;

  const completionBefore = await dayCompletionRepository.getDayCompletion(child.id, date);
  if (completionBefore?.eveningCompleted) return result;

  const rule = await pointRuleRepository.getPointRule(child.id);
  const notificationSetting = await notificationSettingRepository.getNotificationSetting(child.id);
  const now = new Date();
  const onTime = minutesUntil(notificationSetting.eveningTime, now) >= 0;

  await dayCompletionRepository.updateDayCompletion(child.id, date, {
    eveningCompleted: true,
    eveningCompletedAt: now.toISOString(),
    eveningOnTime: onTime,
  });

  await pointHistoryRepository.addPointHistory({
    childId: child.id,
    date,
    type: 'evening_complete',
    amount: rule.eveningComplete,
    note: '夜のおしたく完了',
  });
  result.pointsAwarded += rule.eveningComplete;

  if (onTime) {
    await pointHistoryRepository.addPointHistory({
      childId: child.id,
      date,
      type: 'on_time',
      amount: rule.onTime,
      note: '時間内達成',
    });
    result.pointsAwarded += rule.onTime;
  }

  const eveningStampKind = onTime ? 'rare' : 'normal';
  const stamp = await stampRepository.addStamp({
    childId: child.id,
    date,
    kind: eveningStampKind,
    source: 'evening',
  });
  result.gotStamp = true;
  result.stampKind = eveningStampKind;
  result.stampType = stamp.stampType;

  if (completionBefore?.morningCompleted) {
    const bonus = await awardPerfectDayBonus(child, date, completionBefore.morningOnTime, onTime);
    result.perfectDay = bonus;
    result.pointsAwarded += bonus.bonusPoints;
  }

  notifyCompletionNow('夜のおしたく完了！🌙', `${child.name}さん、よくできました！`).catch(() => {});
  refreshPointsAndStamps();

  return result;
}

export async function evaluateNoForgottenItems(
  child: Child,
  date: string,
  itemIds: string[]
): Promise<AwardResult> {
  const result: AwardResult = { pointsAwarded: 0, gotStamp: false, stampKind: null };
  if (itemIds.length === 0) return result;
  const allChecked = await isAllChecked(child.id, date, 'item', itemIds);
  if (!allChecked) return result;

  const completion = await dayCompletionRepository.getDayCompletion(child.id, date);
  if (completion?.noForgottenItems) return result;

  const rule = await pointRuleRepository.getPointRule(child.id);
  await dayCompletionRepository.updateDayCompletion(child.id, date, {
    noForgottenItems: true,
  });
  await pointHistoryRepository.addPointHistory({
    childId: child.id,
    date,
    type: 'no_forgotten_items',
    amount: rule.noForgottenItems,
    note: '忘れ物ゼロ',
  });
  result.pointsAwarded += rule.noForgottenItems;
  refreshPointsAndStamps();
  return result;
}
