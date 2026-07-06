import { create } from 'zustand';
import { Child, MorningTask } from '@/db/models';
import { dailyTaskLogRepository, taskRepository } from '@/db/repositories';
import { evaluateMorning, AwardResult } from '@/features/points/rules';
import { todayKey } from '@/utils/date';

type MorningState = {
  childId: string | null;
  date: string;
  tasks: MorningTask[];
  checked: Record<string, boolean>;
  isLoading: boolean;
  load: (childId: string) => Promise<void>;
  toggle: (child: Child, taskId: string) => Promise<AwardResult | null>;
  isComplete: () => boolean;
};

export const useMorningStore = create<MorningState>((set, get) => ({
  childId: null,
  date: todayKey(),
  tasks: [],
  checked: {},
  isLoading: false,

  load: async (childId: string) => {
    set({ isLoading: true });
    const date = todayKey();
    const dayOfWeek = new Date().getDay();
    const [allTasks, logs] = await Promise.all([
      taskRepository.listMorningTasks(childId),
      dailyTaskLogRepository.listLogsForDate(childId, date, 'morning_task'),
    ]);
    const tasks = allTasks.filter((t) => t.daysOfWeek.includes(dayOfWeek));
    const checked: Record<string, boolean> = {};
    for (const log of logs) checked[log.refId] = log.checked;
    set({ childId, date, tasks, checked, isLoading: false });
  },

  toggle: async (child: Child, taskId: string) => {
    const { childId, date, checked } = get();
    if (!childId) return null;
    const nextChecked = !checked[taskId];
    await dailyTaskLogRepository.setChecked({
      childId,
      date,
      kind: 'morning_task',
      refId: taskId,
      checked: nextChecked,
    });
    set({ checked: { ...checked, [taskId]: nextChecked } });

    if (nextChecked) {
      const taskIds = get().tasks.map((t) => t.id);
      return evaluateMorning(child, date, taskIds);
    }
    return null;
  },

  isComplete: () => {
    const { tasks, checked } = get();
    return tasks.length > 0 && tasks.every((t) => checked[t.id]);
  },
}));
