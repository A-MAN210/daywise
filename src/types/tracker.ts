export type MealType = "breakfast" | "lunch" | "dinner" | "snack" | "drink";

export type FoodLogItem = {
  id: string;
  date: string; // YYYY-MM-DD
  type: MealType;
  name: string;
  calories?: number;
  time?: string;
  notes?: string;
};

export type WaterLog = {
  date: string;
  glasses: number;
};

export type AppCategory = "Productive" | "Social" | "Entertainment" | "Communication" | "Utility";

export type DetailedScreenLog = {
  id: string;
  date: string;
  app: string;
  hours: number;
  minutes: number;
  category: AppCategory;
  opensCount?: number;
};

export type CoreValue = {
  id: string;
  title: string;
  desc: string;
};

export type AspirationItem = {
  id: string;
  text: string;
  completed: boolean;
};

export type VisionMissionState = {
  vision: string;
  mission: string;
  identityStatement: string;
  coreValues: CoreValue[];
  fiveYearAspirations: AspirationItem[];
  updatedAt: string;
};

export type TargetScope = "yearly" | "monthly" | "weekly" | "daily";

export type TargetItem = {
  id: string;
  title: string;
  scope: TargetScope;
  category?: string;
  targetValue?: number;
  currentValue?: number;
  unit?: string;
  deadline?: string;
  completed: boolean;
  assignedDate?: string; // YYYY-MM-DD for daily targets
  createdAt: string;
};

export type ScheduledReminder = {
  id: string;
  title: string;
  time: string; // "08:00"
  type: "habit" | "task" | "planning" | "health";
  enabled: boolean;
  message: string;
};

export type Habit = { id: string; name: string; color: string; done: string[] };
export type Task = { id: string; title: string; tag: string; time: string; done: boolean; targetId?: string };
export type VersionEntry = { id: string; date: string; createdAt: string; text: string; audioDuration?: number };
export type MoodEntry = { score: number; note: string; date: string };
export type ScreenLog = { id: string; date: string; minutes: number; app: string };
export type Challenge = { id: string; name: string; description: string; totalDays: number; completed: number[]; accent: string };
export type FinanceEntry = { id: string; title: string; category: string; amount: number; type: "in" | "out" };
export type HealthLog = { id: string; label: string; value: string; unit: string; date: string };
export type GoalItem = { id: string; title: string; detail: string; progress: number; color: string };

export type AppState = {
  habits: Habit[];
  tasks: Task[];
  journal: VersionEntry[];
  tomorrow: VersionEntry[];
  moods: MoodEntry[];
  screenLogs: ScreenLog[];
  detailedScreenLogs?: DetailedScreenLog[];
  foodLogs?: FoodLogItem[];
  waterLogs?: WaterLog[];
  visionMission?: VisionMissionState;
  targets?: TargetItem[];
  reminders?: ScheduledReminder[];
  finance: FinanceEntry[];
  health: HealthLog[];
  goals: GoalItem[];
  challenge: Challenge;
  usualScreenMinutes: number;
};
