import {
  dailyTaskLogRepository,
  dayCompletionRepository,
  pointHistoryRepository,
  pointRuleRepository,
  stampRepository,
} from '@/db/repositories';
import { Child } from '@/db/models';
import { minutesUntil } from '@/utils/date';
import { notifyCompletionNow } from '@/features/notifications/service';
import { usePointsStore } from '@/features/points/store';
import { useStampsStore } from '@/features/stamps/store';
import { useStreakStore } from '@/features/home/streakStore';

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
};

async function isAllChecked(childId: string, date: string, kind: 'morning_task' | 'evening_task' | 'item', taskIds: string[]) {
  if (taskIds.length === 0) return false;
  const logs = await dailyTaskLogRepository.listLogsForDate(childId, date, kind);
  const checkedIds = new Set(logs.filter((l) => l.checked).map((l) => l.refId));
  return taskIds.every((id) => checkedIds.has(id));
}

export async function evaluateMorning(
  child: Child,
  date: string,
  morningTaskIds: string[]
): Promise<AwardResult> {
  const result: AwardResult = { pointsAwarded: 0, gotStamp: false, stampKind: null };
  const allChecked = await isAllChecked(child.id, date, 'morning_task', morningTaskIds);
  if (!allChecked) return result;

  const completion = await dayCompletionRepository.getDayCompletion(child.id, date);
  if (completion?.morningCompleted) return result;

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

  const stamp = await stampRepository.addStamp({
    childId: child.id,
    date,
    kind: onTime ? 'rare' : 'normal',
    source: 'morning',
  });
  result.gotStamp = true;
  result.stampKind = onTime ? 'rare' : 'normal';
  result.stampType = stamp.stampType;

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

  const completion = await dayCompletionRepository.getDayCompletion(child.id, date);
  if (completion?.eveningCompleted) return result;

  const rule = await pointRuleRepository.getPointRule(child.id);
  await dayCompletionRepository.updateDayCompletion(child.id, date, {
    eveningCompleted: true,
    eveningCompletedAt: new Date().toISOString(),
  });

  await pointHistoryRepository.addPointHistory({
    childId: child.id,
    date,
    type: 'evening_complete',
    amount: rule.eveningComplete,
    note: '夜のおしたく完了',
  });
  result.pointsAwarded += rule.eveningComplete;

  const stamp = await stampRepository.addStamp({
    childId: child.id,
    date,
    kind: 'normal',
    source: 'evening',
  });
  result.gotStamp = true;
  result.stampKind = 'normal';
  result.stampType = stamp.stampType;

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
