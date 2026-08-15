import {
  dailyTaskLogRepository,
  dayCompletionRepository,
  notificationSettingRepository,
  pointHistoryRepository,
  pointRuleRepository,
} from '@/db/repositories';
import { Child } from '@/db/models';
import { minutesUntil, todayArrivalTime } from '@/utils/date';
import { notifyCompletionNow } from '@/features/notifications/service';
import { usePointsStore } from '@/features/points/store';
import { useStreakStore } from '@/features/home/streakStore';

function refreshPoints() {
  usePointsStore.getState().refresh().catch(() => {});
  useStreakStore.getState().refresh().catch(() => {});
}

export type AwardResult = {
  pointsAwarded: number;
  completed: boolean;
  perfectDay?: {
    bonusPoints: number;
  };
};

async function isAllChecked(childId: string, date: string, kind: 'morning_task' | 'evening_task' | 'item', taskIds: string[]) {
  if (taskIds.length === 0) return false;
  const logs = await dailyTaskLogRepository.listLogsForDate(childId, date, kind);
  const checkedIds = new Set(logs.filter((l) => l.checked).map((l) => l.refId));
  return taskIds.every((id) => checkedIds.has(id));
}

async function awardPerfectDayBonus(child: Child, date: string): Promise<{ bonusPoints: number }> {
  const rule = await pointRuleRepository.getPointRule(child.id);

  await pointHistoryRepository.addPointHistory({
    childId: child.id,
    date,
    type: 'perfect_day_bonus',
    amount: rule.perfectDayBonus,
    note: '朝＋夜パーフェクト達成',
  });

  notifyCompletionNow('パーフェクトな一日！✨', `${child.name}さん、朝も夜もばっちりだったね！`).catch(() => {});

  return { bonusPoints: rule.perfectDayBonus };
}

export async function evaluateMorning(
  child: Child,
  date: string,
  morningTaskIds: string[]
): Promise<AwardResult> {
  const result: AwardResult = { pointsAwarded: 0, completed: false };
  const allChecked = await isAllChecked(child.id, date, 'morning_task', morningTaskIds);
  if (!allChecked) return result;

  const completionBefore = await dayCompletionRepository.getDayCompletion(child.id, date);
  if (completionBefore?.morningCompleted) return result;

  const rule = await pointRuleRepository.getPointRule(child.id);
  const now = new Date();
  const remaining = minutesUntil(todayArrivalTime(child.schoolArrivalTimes), now);
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

  result.completed = true;

  if (completionBefore?.eveningCompleted) {
    const bonus = await awardPerfectDayBonus(child, date);
    result.perfectDay = bonus;
    result.pointsAwarded += bonus.bonusPoints;
  }

  notifyCompletionNow('朝のおしたく完了！☀️', `${child.name}さん、よくできました！`).catch(() => {});
  refreshPoints();

  return result;
}

export async function evaluateEvening(
  child: Child,
  date: string,
  eveningTaskIds: string[]
): Promise<AwardResult> {
  const result: AwardResult = { pointsAwarded: 0, completed: false };
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

  result.completed = true;

  if (completionBefore?.morningCompleted) {
    const bonus = await awardPerfectDayBonus(child, date);
    result.perfectDay = bonus;
    result.pointsAwarded += bonus.bonusPoints;
  }

  notifyCompletionNow('夜のおしたく完了！🌙', `${child.name}さん、よくできました！`).catch(() => {});
  refreshPoints();

  return result;
}

export async function evaluateNoForgottenItems(
  child: Child,
  date: string,
  itemIds: string[]
): Promise<AwardResult> {
  const result: AwardResult = { pointsAwarded: 0, completed: false };
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
  refreshPoints();
  return result;
}
