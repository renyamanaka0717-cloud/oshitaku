import { create } from 'zustand';
import { NotificationSetting } from '@/db/models';
import { notificationSettingRepository } from '@/db/repositories';
import { syncNotificationSchedule } from './service';

type NotificationState = {
  childId: string | null;
  setting: NotificationSetting | null;
  load: (childId: string) => Promise<void>;
  update: (
    childName: string,
    patch: Partial<
      Pick<
        NotificationSetting,
        'morningEnabled' | 'morningTime' | 'eveningEnabled' | 'eveningTime' | 'reminderEnabled' | 'reminderMinutesAfter'
      >
    >
  ) => Promise<void>;
};

export const useNotificationStore = create<NotificationState>((set, get) => ({
  childId: null,
  setting: null,

  load: async (childId: string) => {
    const setting = await notificationSettingRepository.getNotificationSetting(childId);
    set({ childId, setting });
  },

  update: async (childName, patch) => {
    const childId = get().childId;
    if (!childId) return;
    const setting = await notificationSettingRepository.updateNotificationSetting(childId, patch);
    set({ setting });
    await syncNotificationSchedule(childId, childName, setting);
  },
}));
