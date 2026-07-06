import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { NotificationSetting } from '@/db/models';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

function tagFor(childId: string, kind: string) {
  return `oshitaku-${childId}-${kind}`;
}

async function cancelByTag(childId: string, kind: string) {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const tag = tagFor(childId, kind);
  await Promise.all(
    scheduled
      .filter((n) => n.content.data?.tag === tag)
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier))
  );
}

async function scheduleDaily(
  childId: string,
  kind: string,
  time: string,
  title: string,
  body: string
) {
  await cancelByTag(childId, kind);
  const [hour, minute] = time.split(':').map(Number);
  await Notifications.scheduleNotificationAsync({
    content: { title, body, data: { tag: tagFor(childId, kind) } },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

export async function syncNotificationSchedule(
  childId: string,
  childName: string,
  setting: NotificationSetting
): Promise<void> {
  if (Platform.OS === 'web') return;
  const granted = await requestNotificationPermission();
  if (!granted) return;

  if (setting.morningEnabled) {
    await scheduleDaily(
      childId,
      'morning',
      setting.morningTime,
      'おしたくの時間だよ！☀️',
      `${childName}さん、朝のおしたくをはじめよう！`
    );
  } else {
    await cancelByTag(childId, 'morning');
  }

  if (setting.eveningEnabled) {
    await scheduleDaily(
      childId,
      'evening',
      setting.eveningTime,
      '夜のおしたくの時間だよ🌙',
      `${childName}さん、明日のじゅんびをしよう！`
    );
  } else {
    await cancelByTag(childId, 'evening');
  }

  if (setting.reminderEnabled) {
    const [hour, minute] = setting.morningTime.split(':').map(Number);
    const totalMinutes = hour * 60 + minute + setting.reminderMinutesAfter;
    const remHour = Math.floor(totalMinutes / 60) % 24;
    const remMinute = totalMinutes % 60;
    await cancelByTag(childId, 'reminder');
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'わすれものない？📝',
        body: `${childName}さん、おしたくが終わっているか確認してね`,
        data: { tag: tagFor(childId, 'reminder') },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: remHour,
        minute: remMinute,
      },
    });
  } else {
    await cancelByTag(childId, 'reminder');
  }
}

export async function notifyCompletionNow(title: string, body: string): Promise<void> {
  if (Platform.OS === 'web') return;
  const granted = await requestNotificationPermission();
  if (!granted) return;
  await Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: null,
  });
}
