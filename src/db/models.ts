export type Child = {
  id: string;
  name: string;
  avatarEmoji: string;
  avatarColor: string;
  schoolArrivalTime: string; // "HH:MM"
  sortOrder: number;
  createdAt: string;
};

export type Subject = {
  id: string;
  childId: string;
  name: string;
  color: string;
  createdAt: string;
};

export type Item = {
  id: string;
  childId: string;
  name: string;
  icon: string;
  createdAt: string;
};

export type SubjectItemLink = {
  id: string;
  subjectId: string;
  itemId: string;
};

// day of week: 0 = Sunday ... 6 = Saturday
export type TimetableEntry = {
  id: string;
  childId: string;
  dayOfWeek: number;
  period: number;
  subjectId: string;
};

export type MorningTask = {
  id: string;
  childId: string;
  label: string;
  icon: string;
  sortOrder: number;
};

export type EveningTask = {
  id: string;
  childId: string;
  label: string;
  icon: string;
  sortOrder: number;
};

export type ChecklistKind = 'morning_task' | 'evening_task' | 'item';

export type DailyTaskLog = {
  id: string;
  childId: string;
  date: string; // YYYY-MM-DD
  kind: ChecklistKind;
  refId: string;
  checked: boolean;
  checkedAt: string | null;
};

export type DayCompletion = {
  id: string;
  childId: string;
  date: string;
  morningCompleted: boolean;
  morningCompletedAt: string | null;
  morningOnTime: boolean;
  eveningCompleted: boolean;
  eveningCompletedAt: string | null;
  noForgottenItems: boolean;
  awardedRules: string[]; // point rule keys already awarded for this date
};

export type Reward = {
  id: string;
  childId: string;
  name: string;
  icon: string;
  pointCost: number;
  isActive: boolean;
  createdAt: string;
};

export type PointHistoryType =
  | 'morning_complete'
  | 'evening_complete'
  | 'on_time'
  | 'no_forgotten_items'
  | 'reward_exchange'
  | 'manual_adjust';

export type PointHistory = {
  id: string;
  childId: string;
  date: string;
  type: PointHistoryType;
  amount: number;
  note: string;
  createdAt: string;
};

export type StampKind = 'normal' | 'rare';

export type Stamp = {
  id: string;
  childId: string;
  date: string;
  kind: StampKind;
  stampType: string;
  source: 'morning' | 'evening';
  createdAt: string;
};

export type NotificationSetting = {
  childId: string;
  morningEnabled: boolean;
  morningTime: string;
  eveningEnabled: boolean;
  eveningTime: string;
  reminderEnabled: boolean;
  reminderMinutesAfter: number;
};

export type PointRule = {
  childId: string;
  morningComplete: number;
  eveningComplete: number;
  onTime: number;
  noForgottenItems: number;
};
