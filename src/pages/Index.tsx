import { useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Bell,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  CircleHelp,
  Clock3,
  Dumbbell,
  Flame,
  Goal,
  Heart,
  Home,
  Laptop,
  Lightbulb,
  ListChecks,
  LockKeyhole,
  Menu,
  Mic2,
  MoreHorizontal,
  PencilLine,
  Plus,
  Rocket,
  Search,
  Settings2,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Target,
  Trophy,
  WalletCards,
  X,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const TODAY = new Date();
const STORAGE_KEY = "daywise-app-state";

type TabKey =
  | "today"
  | "habits"
  | "tasks"
  | "journal"
  | "tomorrow"
  | "mood"
  | "money"
  | "health"
  | "goals"
  | "challenges"
  | "activity"
  | "achievements"
  | "review";
type NavItem = { key: TabKey; label: string; icon: LucideIcon };

type Habit = { id: string; name: string; color: string; done: string[] };
type Task = { id: string; title: string; tag: string; time: string; done: boolean };
type VersionEntry = { id: string; date: string; createdAt: string; text: string };
type MoodEntry = { score: number; note: string; date: string };
type ScreenLog = { id: string; date: string; minutes: number; app: string };
type Challenge = { id: string; name: string; description: string; totalDays: number; completed: number[]; accent: string };
type FinanceEntry = { id: string; title: string; category: string; amount: number; type: "in" | "out" };
type HealthLog = { id: string; label: string; value: string; unit: string; date: string };
type GoalItem = { id: string; title: string; detail: string; progress: number; color: string };

type AppState = {
  habits: Habit[];
  tasks: Task[];
  journal: VersionEntry[];
  tomorrow: VersionEntry[];
  moods: MoodEntry[];
  screenLogs: ScreenLog[];
  finance: FinanceEntry[];
  health: HealthLog[];
  goals: GoalItem[];
  challenge: Challenge;
  usualScreenMinutes: number;
};

const navGroups: Array<{ label: string; items: NavItem[] }> = [
  {
    label: "Daily",
    items: [
      { key: "today", label: "Today", icon: Home },
      { key: "habits", label: "Habits", icon: CheckCircle2 },
      { key: "tasks", label: "Tasks", icon: ListChecks },
      { key: "journal", label: "Journal", icon: BookOpen },
      { key: "tomorrow", label: "Tomorrow", icon: CalendarDays },
    ],
  },
  {
    label: "Life areas",
    items: [
      { key: "mood", label: "Mood & mind", icon: Heart },
      { key: "money", label: "Money", icon: WalletCards },
      { key: "health", label: "Health", icon: Dumbbell },
      { key: "goals", label: "Goals", icon: Goal },
      { key: "challenges", label: "Challenges", icon: Flame },
    ],
  },
  {
    label: "Insights",
    items: [
      { key: "activity", label: "Activity", icon: Activity },
      { key: "achievements", label: "Achievements", icon: Trophy },
      { key: "review", label: "AI review", icon: Sparkles },
    ],
  },
];

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function daysAgo(amount: number) {
  const date = new Date(TODAY);
  date.setDate(date.getDate() - amount);
  return dateKey(date);
}

function prettyDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" }).format(date);
}

function shortDate(date: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(`${date}T12:00:00`));
}

function createInitialState(): AppState {
  const today = dateKey(TODAY);
  return {
    habits: [
      { id: "water", name: "Drink 2L of water", color: "mint", done: [today, daysAgo(1), daysAgo(2), daysAgo(3), daysAgo(5), daysAgo(6)] },
      { id: "move", name: "Move for 30 minutes", color: "coral", done: [today, daysAgo(1), daysAgo(3), daysAgo(4)] },
      { id: "read", name: "Read before bed", color: "violet", done: [today, daysAgo(1), daysAgo(2), daysAgo(3), daysAgo(4), daysAgo(5)] },
      { id: "morning", name: "Morning reset", color: "yellow", done: [daysAgo(1), daysAgo(2), daysAgo(3), daysAgo(4), daysAgo(5)] },
    ],
    tasks: [
      { id: "t1", title: "Send project handoff notes", tag: "Work", time: "09:30", done: true },
      { id: "t2", title: "Book dentist appointment", tag: "Personal", time: "12:00", done: false },
      { id: "t3", title: "20 min strength workout", tag: "Health", time: "18:00", done: false },
      { id: "t4", title: "Outline next week's priorities", tag: "Planning", time: "20:30", done: false },
    ],
    journal: [
      { id: "j1", date: daysAgo(1), createdAt: "Yesterday · 9:42 PM", text: "A quieter day than expected. I protected my morning focus and that made the afternoon feel much lighter." },
      { id: "j2", date: daysAgo(1), createdAt: "Yesterday · 10:18 PM", text: "Updated reflection: I want to make room for more walks without turning them into another performance metric." },
      { id: "j3", date: daysAgo(2), createdAt: "Mon · 9:07 PM", text: "Good energy after the workout. I noticed I was less reactive in conversations." },
    ],
    tomorrow: [
      { id: "p1", date: daysAgo(1), createdAt: "Yesterday · 10:31 PM", text: "Finish the product brief before opening Slack. Take a real lunch break." },
      { id: "p2", date: daysAgo(1), createdAt: "Yesterday · 10:49 PM", text: "Updated plan: keep the afternoon open for deep work, and call Mum after dinner." },
    ],
    moods: [
      { date: today, score: 4, note: "Steady and optimistic" },
      { date: daysAgo(1), score: 5, note: "Clear-headed" },
      { date: daysAgo(2), score: 3, note: "A little scattered" },
      { date: daysAgo(3), score: 4, note: "Good after moving" },
      { date: daysAgo(4), score: 3, note: "Low energy" },
      { date: daysAgo(5), score: 4, note: "Focused" },
      { date: daysAgo(6), score: 5, note: "Rested" },
    ],
    screenLogs: [
      { id: "s1", date: today, minutes: 96, app: "Instagram" },
      { id: "s2", date: today, minutes: 38, app: "YouTube" },
      { id: "s3", date: today, minutes: 24, app: "Messages" },
      { id: "s4", date: daysAgo(1), minutes: 84, app: "Instagram" },
      { id: "s5", date: daysAgo(1), minutes: 42, app: "Maps" },
    ],
    finance: [
      { id: "f1", title: "Freelance retainer", category: "Income", amount: 3200, type: "in" },
      { id: "f2", title: "Rent & utilities", category: "Home", amount: 1120, type: "out" },
      { id: "f3", title: "Weekly groceries", category: "Food", amount: 86, type: "out" },
      { id: "f4", title: "Coffee with Sam", category: "Social", amount: 18, type: "out" },
    ],
    health: [
      { id: "h1", label: "Sleep", value: "7h 42m", unit: "", date: today },
      { id: "h2", label: "Movement", value: "34", unit: "min", date: today },
      { id: "h3", label: "Water", value: "6", unit: "glasses", date: today },
    ],
    goals: [
      { id: "g1", title: "Build a calmer workweek", detail: "Protect 3 deep-work blocks each week", progress: 68, color: "#6D5DFB" },
      { id: "g2", title: "Feel strong in my body", detail: "Move four times a week", progress: 46, color: "#E96E58" },
      { id: "g3", title: "Create a safety buffer", detail: "Save three months of expenses", progress: 31, color: "#43B987" },
    ],
    challenge: { id: "75-hard", name: "75 Hard", description: "A daily promise to your future self.", totalDays: 75, completed: Array.from({ length: 23 }, (_, index) => index), accent: "#F07A61" },
    usualScreenMinutes: 120,
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AppState) : createInitialState();
  } catch {
    return createInitialState();
  }
}

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function LogoMark() {
  return (
    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-[#6D5DFB] shadow-[0_8px_18px_rgba(109,93,251,0.25)]">
      <Sparkles className="h-5 w-5 text-white" strokeWidth={2.4} />
      <span className="absolute bottom-[7px] right-[7px] h-[5px] w-[5px] rounded-full bg-[#FFC857]" />
    </div>
  );
}

function SectionIcon({ icon: Icon, tone = "violet" }: { icon: typeof Home; tone?: string }) {
  const tones: Record<string, string> = {
    violet: "bg-[#EFEDFF] text-[#6D5DFB]",
    coral: "bg-[#FFF0EC] text-[#E96E58]",
    mint: "bg-[#E8F8F0] text-[#2F9B72]",
    yellow: "bg-[#FFF7DC] text-[#B7831E]",
    blue: "bg-[#EAF3FF] text-[#4B83D8]",
  };
  return <span className={classNames("flex h-9 w-9 items-center justify-center rounded-xl", tones[tone] || tones.violet)}><Icon className="h-[18px] w-[18px]" strokeWidth={2.2} /></span>;
}

function ProgressRing({ value, size = 86, stroke = 8 }: { value: number; size?: number; stroke?: number }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg className="-rotate-90" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#ECEBFA" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#6D5DFB" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference - (value / 100) * circumference} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[19px] font-extrabold leading-none text-[#26243A]">{value}%</span>
        <span className="mt-1 text-[9px] font-bold uppercase tracking-[0.14em] text-[#9996B2]">today</span>
      </div>
    </div>
  );
}

function AppShell({ activeTab, setActiveTab, children, state }: { activeTab: TabKey; setActiveTab: (tab: TabKey) => void; children: ReactNode; state: AppState }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const openTasks = state.tasks.filter((task) => !task.done).length;
  const todayMinutes = state.screenLogs.filter((log) => log.date === dateKey(TODAY)).reduce((sum, log) => sum + log.minutes, 0);

  return (
    <div className="min-h-screen bg-[#F8F8FC] text-[#26243A]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[254px] border-r border-[#E9E8F2] bg-white px-4 py-5 lg:flex lg:flex-col">
        <div className="flex items-center gap-3 px-3">
          <LogoMark />
          <div><div className="font-display text-[21px] font-extrabold tracking-[-0.04em] text-[#26243A]">daywise</div><div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A09DB7]">your daily OS</div></div>
        </div>
        <div className="mt-8 flex items-center gap-3 rounded-2xl bg-[#F6F4FF] p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#292741] text-sm font-bold text-white">AS</div>
          <div className="min-w-0"><div className="truncate text-sm font-bold">Alex Stone</div><div className="text-xs text-[#9491A8]">6 day momentum</div></div>
          <button className="ml-auto text-[#A09DB7]" aria-label="Open profile"><MoreHorizontal className="h-4 w-4" /></button>
        </div>
        <nav className="mt-7 flex-1 space-y-6 overflow-y-auto pr-1">
          {navGroups.map((group) => (
            <div key={group.label}>
              <div className="mb-2 px-3 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#B0AEC0]">{group.label}</div>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.key;
                  return <button key={item.key} onClick={() => setActiveTab(item.key)} className={classNames("group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-bold transition", isActive ? "bg-[#6D5DFB] text-white shadow-[0_8px_18px_rgba(109,93,251,0.18)]" : "text-[#77748F] hover:bg-[#F6F4FF] hover:text-[#45415D]")}><Icon className={classNames("h-[17px] w-[17px]", isActive ? "text-white" : "text-[#AAA7BD] group-hover:text-[#6D5DFB]")} />{item.label}{item.key === "tasks" && openTasks > 0 ? <span className={classNames("ml-auto rounded-full px-2 py-0.5 text-[10px]", isActive ? "bg-white/20 text-white" : "bg-[#F0EEFF] text-[#6D5DFB]")}>{openTasks}</span> : null}</button>;
                })}
              </div>
            </div>
          ))}
        </nav>
        <div className="rounded-2xl border border-[#E9E8F2] bg-[#FCFCFF] p-3">
          <div className="flex items-start gap-2"><Bell className="mt-0.5 h-4 w-4 text-[#F09A3E]" /><div><div className="text-xs font-extrabold">Screen time check</div><div className="mt-1 text-[11px] leading-4 text-[#9693A9]">{todayMinutes} min today · usual {state.usualScreenMinutes} min</div></div></div>
          <button onClick={() => setActiveTab("activity")} className="mt-3 flex items-center gap-1 text-[11px] font-extrabold text-[#6D5DFB]">Review activity <ArrowUpRight className="h-3 w-3" /></button>
        </div>
        <div className="mt-4 flex items-center justify-between px-3 text-[#AAA7BD]"><button aria-label="Help"><CircleHelp className="h-4 w-4" /></button><button aria-label="Settings"><Settings2 className="h-4 w-4" /></button><span className="text-[10px] font-bold">v1.0 local</span></div>
      </aside>

      <div className="lg:pl-[254px]">
        <header className="sticky top-0 z-20 border-b border-[#E9E8F2]/90 bg-[#F8F8FC]/95 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between px-4 py-3"><div className="flex items-center gap-2.5"><LogoMark /><span className="font-display text-xl font-extrabold tracking-[-0.04em]">daywise</span></div><button onClick={() => setMobileOpen((open) => !open)} className="rounded-xl border border-[#E9E8F2] bg-white p-2"><Menu className="h-5 w-5" /></button></div>
          {mobileOpen ? <div className="border-t border-[#E9E8F2] bg-white px-4 py-3"><div className="grid grid-cols-2 gap-2">{navGroups.flatMap((group) => group.items).map((item) => { const Icon = item.icon; return <button key={item.key} onClick={() => { setActiveTab(item.key); setMobileOpen(false); }} className={classNames("flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-bold", activeTab === item.key ? "bg-[#6D5DFB] text-white" : "bg-[#F7F6FC] text-[#6D6A82]")}><Icon className="h-4 w-4" />{item.label}</button>; })}</div></div> : null}
        </header>
        <main className="mx-auto max-w-[1420px] px-4 pb-24 pt-5 sm:px-6 lg:px-10 lg:pb-10 lg:pt-8">{children}</main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-30 flex justify-around border-t border-[#E9E8F2] bg-white/95 px-2 py-2 backdrop-blur lg:hidden">
        {[{ key: "today", label: "Today", icon: Home }, { key: "tasks", label: "Tasks", icon: ListChecks }, { key: "journal", label: "Journal", icon: BookOpen }, { key: "activity", label: "Activity", icon: Activity }, { key: "review", label: "Review", icon: Sparkles }].map((item) => { const Icon = item.icon; return <button key={item.key} onClick={() => setActiveTab(item.key as TabKey)} className={classNames("flex min-w-[54px] flex-col items-center gap-1 rounded-xl px-2 py-1 text-[10px] font-bold", activeTab === item.key ? "text-[#6D5DFB]" : "text-[#AAA7BD]")}><Icon className="h-[18px] w-[18px]" />{item.label}</button>; })}
      </nav>
    </div>
  );
}

function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><div className="mb-2 flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#6D5DFB]"><span className="h-1.5 w-1.5 rounded-full bg-[#6D5DFB]" />{eyebrow}</div><h1 className="font-display text-[34px] font-extrabold leading-none tracking-[-0.055em] text-[#26243A] sm:text-[42px]">{title}</h1><p className="mt-3 max-w-[610px] text-sm leading-6 text-[#88859D]">{description}</p></div>{action}</div>;
}

function MetricCard({ label, value, helper, icon: Icon, tone }: { label: string; value: string; helper: string; icon: typeof Activity; tone: string }) {
  return <div className="rounded-2xl border border-[#E9E8F2] bg-white p-4 shadow-[0_8px_24px_rgba(48,44,88,0.03)]"><div className="flex items-start justify-between"><span className={classNames("flex h-9 w-9 items-center justify-center rounded-xl", tone)}><Icon className="h-[18px] w-[18px]" /></span><ArrowUpRight className="h-4 w-4 text-[#C2C0CF]" /></div><div className="mt-4 text-[26px] font-extrabold tracking-[-0.05em] text-[#292741]">{value}</div><div className="mt-0.5 text-xs font-bold text-[#77748F]">{label}</div><div className="mt-2 text-[11px] font-semibold text-[#AAA7BD]">{helper}</div></div>;
}

function TodayView({ state, updateState, setActiveTab }: { state: AppState; updateState: (updater: (state: AppState) => AppState) => void; setActiveTab: (tab: TabKey) => void }) {
  const today = dateKey(TODAY);
  const completedHabits = state.habits.filter((habit) => habit.done.includes(today)).length;
  const completedTasks = state.tasks.filter((task) => task.done).length;
  const openTasks = state.tasks.filter((task) => !task.done).length;
  const mood = state.moods.find((entry) => entry.date === today);
  const screenMinutes = state.screenLogs.filter((log) => log.date === today).reduce((sum, log) => sum + log.minutes, 0);
  const completion = Math.round(((completedHabits + completedTasks) / Math.max(state.habits.length + state.tasks.length, 1)) * 100);
  const toggleTask = (id: string) => updateState((current) => ({ ...current, tasks: current.tasks.map((task) => task.id === id ? { ...task, done: !task.done } : task) }));
  const toggleHabit = (id: string) => updateState((current) => ({ ...current, habits: current.habits.map((habit) => habit.id === id ? { ...habit, done: habit.done.includes(today) ? habit.done.filter((day) => day !== today) : [...habit.done, today] } : habit) }));

  return <>
    <PageHeader eyebrow={prettyDate(TODAY)} title="Good morning, Alex" description="A clear view of what matters today. Keep the bar small, keep the promise." action={<Button onClick={() => setActiveTab("journal")} className="h-11 rounded-xl bg-[#6D5DFB] px-4 text-xs font-extrabold shadow-[0_8px_18px_rgba(109,93,251,0.2)] hover:bg-[#5949E8]"><Plus className="mr-2 h-4 w-4" />Log an entry</Button>} />
    {screenMinutes > state.usualScreenMinutes ? <div className="mb-6 flex items-center gap-3 rounded-2xl border border-[#FFD9B5] bg-[#FFF7ED] px-4 py-3 text-sm text-[#9B5D20]"><span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FFE9CE]"><Smartphone className="h-4 w-4" /></span><span><b>Gentle nudge:</b> you've been on your phone for {screenMinutes} minutes today — above your usual {state.usualScreenMinutes}. Maybe leave social apps for tomorrow?</span><button onClick={() => setActiveTab("activity")} className="ml-auto hidden shrink-0 text-xs font-extrabold text-[#D27B21] sm:block">See details</button></div> : null}

    <section className="mb-6 overflow-hidden rounded-[26px] border border-[#E9E4FF] bg-[#F1EFFF] p-5 sm:p-7"><div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between"><div className="max-w-[560px]"><div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/75 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#6D5DFB]"><Sparkles className="h-3.5 w-3.5" /> Your rhythm is building</div><h2 className="font-display text-[27px] font-extrabold leading-tight tracking-[-0.045em] text-[#302C5A] sm:text-[34px]">Small steps are adding up.<br /><span className="text-[#6D5DFB]">Keep your next one easy.</span></h2><p className="mt-3 max-w-[480px] text-sm leading-6 text-[#77729B]">You've shown up {completedHabits + completedTasks} times today. The goal isn't a perfect day — it's a day you can trust.</p><div className="mt-5 flex flex-wrap gap-3"><button onClick={() => setActiveTab("habits")} className="rounded-xl bg-[#6D5DFB] px-4 py-2.5 text-xs font-extrabold text-white shadow-[0_8px_16px_rgba(109,93,251,0.2)]">Continue routine</button><button onClick={() => setActiveTab("review")} className="rounded-xl bg-white px-4 py-2.5 text-xs font-extrabold text-[#6D5DFB]">Ask my review <ArrowUpRight className="ml-1 inline h-3.5 w-3.5" /></button></div></div><div className="flex items-center gap-8 rounded-2xl bg-white/65 p-5 sm:p-6"><ProgressRing value={Math.min(completion, 100)} size={106} stroke={9} /><div><div className="text-xs font-extrabold uppercase tracking-[0.15em] text-[#A19BBE]">Today score</div><div className="mt-2 text-2xl font-extrabold tracking-[-0.05em] text-[#302C5A]">{completedTasks}/{state.tasks.length} tasks</div><div className="mt-1 text-xs font-semibold text-[#9992B2]">{completedHabits}/{state.habits.length} habits done</div><div className="mt-4 flex gap-1.5">{["M", "T", "W", "T", "F", "S", "S"].map((day, index) => <span key={`${day}-${index}`} className={classNames("flex h-6 w-6 items-center justify-center rounded-lg text-[9px] font-extrabold", index < 5 ? "bg-[#6D5DFB] text-white" : "bg-white text-[#A29EBA]")}>{day}</span>)}</div></div></div></div></section>

    <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><MetricCard label="Open tasks" value={`${openTasks}`} helper="2 due today" icon={ListChecks} tone="bg-[#FFF0EC] text-[#E96E58]" /><MetricCard label="Habit streak" value="6 days" helper="Best this month" icon={Flame} tone="bg-[#FFF5D9] text-[#CA921A]" /><MetricCard label="Mood today" value={mood ? `${mood.score}/5` : "—"} helper={mood?.note || "Tap to check in"} icon={Heart} tone="bg-[#EAF3FF] text-[#4B83D8]" /><MetricCard label="Phone today" value={`${screenMinutes}m`} helper={`${Math.max(state.usualScreenMinutes - screenMinutes, 0)}m under usual`} icon={Smartphone} tone="bg-[#E8F8F0] text-[#2F9B72]" /></div>

    <div className="grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
      <div className="rounded-2xl border border-[#E9E8F2] bg-white p-5 sm:p-6"><div className="mb-4 flex items-center justify-between"><div><div className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#A09DB7]">Your focus</div><h3 className="mt-1 text-lg font-extrabold tracking-[-0.03em]">Today's tasks</h3></div><button onClick={() => setActiveTab("tasks")} className="text-xs font-extrabold text-[#6D5DFB]">View all <ChevronRight className="inline h-3.5 w-3.5" /></button></div><div className="space-y-2">{state.tasks.map((task) => <button key={task.id} onClick={() => toggleTask(task.id)} className="flex w-full items-center gap-3 rounded-xl px-2 py-3 text-left transition hover:bg-[#FAF9FF]"><span className={classNames("flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2", task.done ? "border-[#6D5DFB] bg-[#6D5DFB] text-white" : "border-[#D8D6E5]")}>{task.done ? <Check className="h-3 w-3" strokeWidth={3} /> : null}</span><span className={classNames("min-w-0 flex-1 text-sm font-bold", task.done && "text-[#AAA7B7] line-through")}>{task.title}<span className="mt-1 block text-[11px] font-semibold text-[#ABA8BB]">{task.time} · {task.tag}</span></span>{task.done ? <span className="text-[10px] font-extrabold text-[#35A074]">DONE</span> : <span className="rounded-md bg-[#F4F2FF] px-2 py-1 text-[10px] font-extrabold text-[#7770B4]">NEXT</span>}</button>)}</div></div>
      <div className="rounded-2xl border border-[#E9E8F2] bg-white p-5 sm:p-6"><div className="mb-4 flex items-center justify-between"><div><div className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#A09DB7]">The ritual</div><h3 className="mt-1 text-lg font-extrabold tracking-[-0.03em]">Habits</h3></div><button onClick={() => setActiveTab("habits")} className="text-xs font-extrabold text-[#6D5DFB]">Manage <ChevronRight className="inline h-3.5 w-3.5" /></button></div><div className="space-y-3">{state.habits.slice(0, 4).map((habit) => { const done = habit.done.includes(today); return <button key={habit.id} onClick={() => toggleHabit(habit.id)} className="flex w-full items-center gap-3 text-left"><span className={classNames("flex h-8 w-8 items-center justify-center rounded-xl", done ? "bg-[#6D5DFB] text-white" : "bg-[#F4F3F9] text-[#B6B3C3]")}><Check className="h-4 w-4" /></span><span className={classNames("flex-1 text-sm font-bold", done ? "text-[#9C99AA] line-through" : "text-[#4D4A63]")}>{habit.name}</span><span className="h-2 w-2 rounded-full" style={{ backgroundColor: habit.color === "coral" ? "#E96E58" : habit.color === "mint" ? "#43B987" : habit.color === "yellow" ? "#F2BD42" : "#6D5DFB" }} /></button>; })}</div><button onClick={() => setActiveTab("habits")} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#D8D5EA] py-2.5 text-xs font-extrabold text-[#8A86A3] hover:bg-[#FAF9FF]"><Plus className="h-3.5 w-3.5" /> Add a ritual</button></div>
    </div>

    <div className="mt-5 grid gap-5 md:grid-cols-2"><div className="rounded-2xl border border-[#E9E8F2] bg-white p-5"><div className="flex items-start justify-between"><div><div className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#A09DB7]">Mind check-in</div><h3 className="mt-1 text-lg font-extrabold">How is your inner weather?</h3></div><SectionIcon icon={Heart} tone="blue" /></div><div className="mt-5 flex items-center justify-between gap-2">{[{ score: 1, emoji: "😞", label: "Low" }, { score: 2, emoji: "😕", label: "Off" }, { score: 3, emoji: "😐", label: "Okay" }, { score: 4, emoji: "🙂", label: "Good" }, { score: 5, emoji: "😄", label: "Great" }].map((option) => <button key={option.score} onClick={() => updateState((current) => ({ ...current, moods: [...current.moods.filter((entry) => entry.date !== today), { date: today, score: option.score, note: option.label }] }))} className={classNames("flex flex-1 flex-col items-center gap-2 rounded-xl py-2 text-xl transition", mood?.score === option.score ? "bg-[#EAF3FF] ring-2 ring-[#4B83D8]/30" : "hover:bg-[#F7F8FC]")}><span>{option.emoji}</span><span className="text-[9px] font-extrabold uppercase tracking-[0.1em] text-[#A09DB7]">{option.label}</span></button>)}</div><button onClick={() => setActiveTab("mood")} className="mt-4 text-xs font-extrabold text-[#4B83D8]">Open mood history <ArrowUpRight className="ml-1 inline h-3.5 w-3.5" /></button></div><div className="relative overflow-hidden rounded-2xl bg-[#292741] p-5 text-white"><div className="absolute -right-4 -top-8 h-32 w-32 rounded-full border-[18px] border-[#F4BC56]/30" /><div className="relative"><div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#B9B5DB]"><Sparkles className="h-3.5 w-3.5 text-[#F4BC56]" /> From your patterns</div><h3 className="mt-3 max-w-[300px] font-display text-2xl font-extrabold leading-tight tracking-[-0.04em]">Movement is your best mood reset.</h3><p className="mt-3 max-w-[350px] text-xs leading-5 text-[#C1BED6]">Your mood is 1.2 points higher on days you log movement. Try a short walk before your next screen session.</p><button onClick={() => setActiveTab("review")} className="mt-5 rounded-xl bg-white px-3 py-2 text-xs font-extrabold text-[#292741]">Open full review <ArrowUpRight className="ml-1 inline h-3.5 w-3.5" /></button></div></div></div>
  </>;
}

function HabitsView({ state, updateState }: { state: AppState; updateState: (updater: (state: AppState) => AppState) => void }) {
  const today = dateKey(TODAY);
  const lastSeven = Array.from({ length: 7 }, (_, index) => daysAgo(6 - index));
  const toggle = (habitId: string, day: string) => updateState((current) => ({ ...current, habits: current.habits.map((habit) => habit.id === habitId ? { ...habit, done: habit.done.includes(day) ? habit.done.filter((entry) => entry !== day) : [...habit.done, day] } : habit) }));
  const [newHabit, setNewHabit] = useState("");
  const addHabit = (event: FormEvent) => { event.preventDefault(); if (!newHabit.trim()) return; updateState((current) => ({ ...current, habits: [...current.habits, { id: uid(), name: newHabit.trim(), color: "violet", done: [] }] })); setNewHabit(""); };
  return <><PageHeader eyebrow="Daily rituals" title="Habits that hold you" description="Make consistency visible without making it heavy. Tap any square to log a ritual for that day." action={<form onSubmit={addHabit} className="flex gap-2"><input value={newHabit} onChange={(event) => setNewHabit(event.target.value)} placeholder="Add a habit" className="h-11 w-40 rounded-xl border border-[#E3E1ED] bg-white px-3 text-xs outline-none focus:border-[#6D5DFB] sm:w-52" /><Button className="h-11 rounded-xl bg-[#6D5DFB] px-3 text-xs font-extrabold hover:bg-[#5949E8]"><Plus className="mr-1.5 h-4 w-4" />Add</Button></form>} /><div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]"><div className="rounded-2xl border border-[#E9E8F2] bg-white p-5 sm:p-6"><div className="mb-5 flex items-center justify-between"><div><h3 className="font-display text-xl font-extrabold tracking-[-0.04em]">Weekly rhythm</h3><p className="mt-1 text-xs text-[#9B98AE]">A tiny check-in is still a check-in.</p></div><span className="rounded-full bg-[#E9F8F0] px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#2F9B72]">{state.habits.filter((habit) => habit.done.includes(today)).length}/{state.habits.length} today</span></div><div className="mb-3 grid grid-cols-[minmax(130px,1fr)_repeat(7,28px)] items-center gap-2 text-center text-[9px] font-extrabold uppercase tracking-[0.1em] text-[#AAA7BA]"><span className="text-left">Ritual</span>{lastSeven.map((day) => <span key={day}>{new Date(`${day}T12:00:00`).toLocaleDateString("en-US", { weekday: "short" }).slice(0, 1)}</span>)}</div><div className="space-y-3">{state.habits.map((habit) => <div key={habit.id} className="grid grid-cols-[minmax(130px,1fr)_repeat(7,28px)] items-center gap-2"><div className="flex min-w-0 items-center gap-2 text-xs font-bold text-[#55516E]"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: habit.color === "coral" ? "#E96E58" : habit.color === "mint" ? "#43B987" : habit.color === "yellow" ? "#F2BD42" : "#6D5DFB" }} /><span className="truncate">{habit.name}</span></div>{lastSeven.map((day) => <button key={day} onClick={() => toggle(habit.id, day)} className={classNames("mx-auto flex h-7 w-7 items-center justify-center rounded-lg text-[10px] font-extrabold transition", habit.done.includes(day) ? "bg-[#6D5DFB] text-white" : "bg-[#F4F3F9] text-[#C1BFCE] hover:bg-[#EDEBFF]")}>{habit.done.includes(day) ? <Check className="h-3.5 w-3.5" /> : new Date(`${day}T12:00:00`).getDate()}</button>)}</div>)}</div></div><div className="rounded-2xl border border-[#E9E8F2] bg-[#292741] p-6 text-white"><div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#B9B5DB]"><Flame className="h-4 w-4 text-[#F4BC56]" /> Momentum</div><div className="mt-7 flex items-end gap-3"><span className="font-display text-6xl font-extrabold tracking-[-0.08em] text-[#F4BC56]">6</span><span className="mb-2 text-sm font-bold text-[#C7C3DE]">days<br />in a row</span></div><p className="mt-6 text-sm leading-6 text-[#C6C2DB]">Your most reliable ritual is <b className="text-white">reading before bed</b>. Protect the identity, not just the streak.</p><div className="mt-7 flex gap-1.5">{[1, 1, 1, 1, 1, 1, 0, 0, 0, 0].map((active, index) => <span key={index} className={classNames("h-2 flex-1 rounded-full", active ? "bg-[#F4BC56]" : "bg-white/15")} />)}</div><div className="mt-2 flex justify-between text-[10px] font-bold text-[#9E9AB8]"><span>Last 10 days</span><span>60%</span></div></div></div></>;
}

function TasksView({ state, updateState }: { state: AppState; updateState: (updater: (state: AppState) => AppState) => void }) {
  const [task, setTask] = useState("");
  const [tag, setTag] = useState("Personal");
  const addTask = (event: FormEvent) => { event.preventDefault(); if (!task.trim()) return; updateState((current) => ({ ...current, tasks: [...current.tasks, { id: uid(), title: task.trim(), tag, time: "Anytime", done: false }] })); setTask(""); };
  return <><PageHeader eyebrow="Your queue" title="Tasks with less noise" description="Keep the next action obvious. Everything else can wait its turn." action={<form onSubmit={addTask} className="flex gap-2"><input value={task} onChange={(event) => setTask(event.target.value)} placeholder="What needs doing?" className="h-11 w-48 rounded-xl border border-[#E3E1ED] bg-white px-3 text-xs outline-none focus:border-[#6D5DFB] sm:w-64" /><Button className="h-11 rounded-xl bg-[#6D5DFB] px-3 text-xs font-extrabold hover:bg-[#5949E8]"><Plus className="mr-1.5 h-4 w-4" />Add task</Button></form>} /><div className="grid gap-5 xl:grid-cols-[1fr_0.38fr]"><div className="rounded-2xl border border-[#E9E8F2] bg-white p-5 sm:p-6"><div className="mb-5 flex items-center justify-between"><h3 className="font-display text-xl font-extrabold tracking-[-0.04em]">Today <span className="ml-2 rounded-full bg-[#F1EFFF] px-2.5 py-1 align-middle text-[10px] text-[#6D5DFB]">{state.tasks.filter((item) => !item.done).length} open</span></h3><button onClick={() => updateState((current) => ({ ...current, tasks: current.tasks.map((item) => ({ ...item, done: true })) }))} className="text-xs font-extrabold text-[#6D5DFB]">Complete all</button></div><div className="space-y-2">{state.tasks.map((item) => <div key={item.id} className={classNames("flex items-center gap-3 rounded-xl border px-3 py-3", item.done ? "border-transparent bg-[#FBFBFD]" : "border-[#F0EEF6]")}><button onClick={() => updateState((current) => ({ ...current, tasks: current.tasks.map((taskItem) => taskItem.id === item.id ? { ...taskItem, done: !taskItem.done } : taskItem) }))} className={classNames("flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2", item.done ? "border-[#6D5DFB] bg-[#6D5DFB] text-white" : "border-[#D9D7E5]")}>{item.done ? <Check className="h-3 w-3" /> : null}</button><div className="min-w-0 flex-1"><div className={classNames("text-sm font-bold", item.done && "text-[#AAA7B7] line-through")}>{item.title}</div><div className="mt-1 flex items-center gap-2 text-[10px] font-bold text-[#AAA7B7]"><Clock3 className="h-3 w-3" />{item.time}<span>·</span><span className="rounded bg-[#F4F2FF] px-1.5 py-0.5 text-[#7770B4]">{item.tag}</span></div></div><button onClick={() => updateState((current) => ({ ...current, tasks: current.tasks.filter((taskItem) => taskItem.id !== item.id) }))} className="text-[#C8C5D2] hover:text-[#E96E58]" aria-label="Delete task"><X className="h-4 w-4" /></button></div>)}</div></div><div className="rounded-2xl border border-[#E9E8F2] bg-[#FFF7ED] p-6"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFE8CC] text-[#D27B21]"><Target className="h-5 w-5" /></div><h3 className="mt-5 font-display text-2xl font-extrabold leading-tight tracking-[-0.05em] text-[#6F4820]">One task can change the shape of a day.</h3><p className="mt-3 text-sm leading-6 text-[#9B6B37]">Start with the task that removes the most pressure. You don't need to earn rest.</p><div className="mt-6 h-2 rounded-full bg-[#F7DDBD]"><div className="h-2 w-[58%] rounded-full bg-[#F09A3E]" /></div><div className="mt-2 flex justify-between text-[10px] font-extrabold text-[#B47A3C]"><span>Focus load</span><span>58%</span></div></div></div></>;
}

function VersionedView({ kind, state, updateState }: { kind: "journal" | "tomorrow"; state: AppState; updateState: (updater: (state: AppState) => AppState) => void }) {
  const isJournal = kind === "journal";
  const entries = isJournal ? state.journal : state.tomorrow;
  const [text, setText] = useState("");
  const saveEntry = (event: FormEvent) => { event.preventDefault(); if (!text.trim()) return; const newEntry = { id: uid(), date: dateKey(TODAY), createdAt: `Today · ${new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`, text: text.trim() }; updateState((current) => ({ ...current, [isJournal ? "journal" : "tomorrow"]: [newEntry, ...(isJournal ? current.journal : current.tomorrow)] })); setText(""); };
  return <><PageHeader eyebrow={isJournal ? "Your inner archive" : "A gift to tomorrow"} title={isJournal ? "Journal, with receipts" : "Tomorrow starts tonight"} description={isJournal ? "Write freely, then keep every version. Nothing gets overwritten — your reflections become a visible trail." : "Before you close the day, leave one clear handoff for the person you will be tomorrow."} action={<div className="flex items-center gap-2 rounded-xl border border-[#E9E8F2] bg-white px-3 py-2 text-[11px] font-bold text-[#8D899F]"><LockKeyhole className="h-4 w-4 text-[#6D5DFB]" /> Append-only history</div>} /><div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]"><form onSubmit={saveEntry} className="rounded-2xl border border-[#E9E8F2] bg-white p-5 sm:p-6"><div className="flex items-center gap-3"><SectionIcon icon={isJournal ? BookOpen : CalendarDays} tone={isJournal ? "violet" : "yellow"} /><div><div className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#A09DB7]">{isJournal ? "New reflection" : "Plan for tomorrow"}</div><h3 className="mt-1 font-display text-xl font-extrabold tracking-[-0.04em]">{isJournal ? "What is true today?" : "What deserves your first attention?"}</h3></div></div><textarea value={text} onChange={(event) => setText(event.target.value)} placeholder={isJournal ? "Notice the win, the wobble, or the thing you want to remember…" : "Leave a short, kind handoff for tomorrow…"} className="mt-6 min-h-[210px] w-full resize-none rounded-2xl border border-[#E7E5F0] bg-[#FBFAFE] p-4 text-sm leading-6 outline-none placeholder:text-[#B3B0BF] focus:border-[#6D5DFB]" /><div className="mt-4 flex items-center justify-between"><span className="flex items-center gap-1.5 text-[10px] font-bold text-[#AAA7B7]"><Mic2 className="h-3.5 w-3.5" /> Voice notes coming soon</span><Button className="rounded-xl bg-[#6D5DFB] px-4 text-xs font-extrabold hover:bg-[#5949E8]">Save new version <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" /></Button></div></form><div className="rounded-2xl border border-[#E9E8F2] bg-white p-5 sm:p-6"><div className="mb-5 flex items-center justify-between"><div><div className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#A09DB7]">Version history</div><h3 className="mt-1 font-display text-xl font-extrabold tracking-[-0.04em]">Every edit stays visible</h3></div><span className="rounded-full bg-[#F1EFFF] px-3 py-1 text-[10px] font-extrabold text-[#6D5DFB]">{entries.length} versions</span></div><div className="relative space-y-0">{entries.map((entry, index) => <div key={entry.id} className="relative flex gap-4 pb-6 last:pb-0"><div className="relative flex w-5 shrink-0 justify-center"><span className={classNames("z-10 mt-1.5 h-3 w-3 rounded-full border-2 border-white", index === 0 ? "bg-[#6D5DFB] shadow-[0_0_0_3px_#E8E5FF]" : "bg-[#BDB9CC]")} />{index < entries.length - 1 ? <span className="absolute top-4 h-full w-px bg-[#E8E6EF]" /> : null}</div><div className="min-w-0 flex-1 rounded-xl border border-[#F0EEF6] bg-[#FCFCFE] p-3.5"><div className="flex flex-wrap items-center gap-2"><span className="text-[11px] font-extrabold text-[#6D5DFB]">{index === 0 ? "Current version" : `Version ${entries.length - index}`}</span><span className="text-[10px] font-bold text-[#AAA7B7]">{entry.createdAt}</span></div><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#5D5A70]">{entry.text}</p>{index === 0 ? <div className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-[#E8F8F0] px-2 py-1 text-[9px] font-extrabold uppercase tracking-[0.12em] text-[#2F9B72]"><ShieldCheck className="h-3 w-3" /> Saved locally</div> : null}</div></div>)}</div></div></div></>;
}

function MoodView({ state, updateState }: { state: AppState; updateState: (updater: (state: AppState) => AppState) => void }) {
  const [note, setNote] = useState("");
  const today = dateKey(TODAY);
  const current = state.moods.find((entry) => entry.date === today);
  const average = state.moods.length ? (state.moods.reduce((sum, entry) => sum + entry.score, 0) / state.moods.length).toFixed(1) : "—";
  return <><PageHeader eyebrow="Mood & mental health" title="Check in with yourself" description="Your mood is information, not a grade. Notice the pattern and meet yourself where you are." /><div className="grid gap-5 xl:grid-cols-[0.82fr_1.18fr]"><div className="rounded-2xl border border-[#E9E8F2] bg-white p-6"><div className="flex items-center gap-3"><SectionIcon icon={Heart} tone="blue" /><div><div className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#A09DB7]">Today</div><h3 className="mt-1 font-display text-xl font-extrabold">What is your inner weather?</h3></div></div><div className="mt-7 flex justify-between gap-2">{[{ score: 1, emoji: "😞", label: "Low" }, { score: 2, emoji: "😕", label: "Off" }, { score: 3, emoji: "😐", label: "Okay" }, { score: 4, emoji: "🙂", label: "Good" }, { score: 5, emoji: "😄", label: "Great" }].map((item) => <button key={item.score} onClick={() => updateState((currentState) => ({ ...currentState, moods: [...currentState.moods.filter((entry) => entry.date !== today), { date: today, score: item.score, note: note || item.label }] }))} className={classNames("flex flex-1 flex-col items-center gap-2 rounded-2xl py-3 text-2xl", current?.score === item.score ? "bg-[#EAF3FF] ring-2 ring-[#4B83D8]/25" : "bg-[#FAFAFD] hover:bg-[#F3F6FC]")}><span>{item.emoji}</span><span className="text-[9px] font-extrabold uppercase tracking-[0.1em] text-[#AAA7B7]">{item.label}</span></button>)}</div><input value={note} onChange={(event) => setNote(event.target.value)} placeholder={current?.note || "Add a note (optional)"} className="mt-5 h-11 w-full rounded-xl border border-[#E7E5F0] bg-[#FBFAFE] px-3 text-xs outline-none focus:border-[#4B83D8]" /><div className="mt-5 flex items-center gap-2 rounded-xl bg-[#F4F8FF] p-3 text-xs leading-5 text-[#6685B6]"><Lightbulb className="h-4 w-4 shrink-0 text-[#4B83D8]" /> You tend to feel better on days you move before noon.</div></div><div className="rounded-2xl border border-[#E9E8F2] bg-white p-6"><div className="flex items-end justify-between"><div><div className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#A09DB7]">Your emotional weather</div><h3 className="mt-1 font-display text-xl font-extrabold">Last 7 check-ins</h3></div><div className="text-right"><div className="text-3xl font-extrabold tracking-[-0.06em] text-[#4B83D8]">{average}</div><div className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#AAA7B7]">avg mood</div></div></div><div className="mt-10 flex h-48 items-end gap-3 border-b border-[#EEE CF]" style={{ borderColor: "#EEECF4" }}>{Array.from({ length: 7 }, (_, index) => { const entry = state.moods[index]; const height = entry ? entry.score * 18 + 10 : 10; return <div key={index} className="flex flex-1 flex-col items-center gap-3"><div className="relative flex h-36 w-full items-end"><div className="w-full rounded-t-xl bg-[#B9D5FF]" style={{ height: `${height}%` }} /><span className="absolute inset-x-0 bottom-2 text-center text-xs">{entry ? ["", "😞", "😕", "😐", "🙂", "😄"][entry.score] : "·"}</span></div><span className="text-[10px] font-extrabold text-[#AAA7B7]">{entry ? new Date(`${entry.date}T12:00:00`).toLocaleDateString("en-US", { weekday: "short" }).slice(0, 3) : "—"}</span></div>; })}</div></div></div></>;
}

function LifeOverview({ state, setActiveTab }: { state: AppState; setActiveTab: (tab: TabKey) => void }) {
  const screenMinutes = state.screenLogs.filter((log) => log.date === dateKey(TODAY)).reduce((sum, log) => sum + log.minutes, 0);
  const cards = [{ key: "money", title: "Money", value: "$2,480", helper: "+$320 this month", icon: CircleDollarSign, tone: "mint", bar: 68 }, { key: "health", title: "Health", value: "7h 42m", helper: "sleep average", icon: Dumbbell, tone: "coral", bar: 84 }, { key: "goals", title: "Goals", value: "4 active", helper: "1 milestone close", icon: Goal, tone: "violet", bar: 56 }, { key: "activity", title: "Screen time", value: `${screenMinutes}m`, helper: "today · 120m usual", icon: Smartphone, tone: "yellow", bar: Math.min(screenMinutes / 2, 100) }];
  return <><PageHeader eyebrow="The bigger picture" title="Your life, in view" description="A lightweight snapshot across the areas you care about. Follow the signal, not every number." /><div className="grid gap-4 md:grid-cols-2">{cards.map((card) => <button key={card.key} onClick={() => setActiveTab(card.key as TabKey)} className="group rounded-2xl border border-[#E9E8F2] bg-white p-5 text-left transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(48,44,88,0.06)]"><div className="flex items-center justify-between"><div className="flex items-center gap-3"><SectionIcon icon={card.icon} tone={card.tone} /><div><div className="text-sm font-extrabold">{card.title}</div><div className="mt-1 text-[11px] font-semibold text-[#AAA7B7]">{card.helper}</div></div></div><ArrowUpRight className="h-4 w-4 text-[#C2C0CF] transition group-hover:text-[#6D5DFB]" /></div><div className="mt-6 flex items-end justify-between"><span className="font-display text-3xl font-extrabold tracking-[-0.06em]">{card.value}</span><span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#AAA7B7]">{card.bar}% on track</span></div><div className="mt-3 h-2 rounded-full bg-[#F1F0F6]"><div className={classNames("h-2 rounded-full", card.tone === "mint" ? "bg-[#43B987]" : card.tone === "coral" ? "bg-[#E96E58]" : card.tone === "yellow" ? "bg-[#F2BD42]" : "bg-[#6D5DFB]")} style={{ width: `${card.bar}%` }} /></div></button>)}</div><div className="mt-5 rounded-2xl border border-[#E9E8F2] bg-white p-6"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><div className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#A09DB7]">Coming together</div><h3 className="mt-1 font-display text-xl font-extrabold">The pattern worth keeping</h3></div><button onClick={() => setActiveTab("review")} className="text-xs font-extrabold text-[#6D5DFB]">Open AI review <ArrowUpRight className="ml-1 inline h-3.5 w-3.5" /></button></div><div className="mt-6 grid gap-3 md:grid-cols-3"><div className="rounded-xl bg-[#F4F2FF] p-4"><div className="text-2xl">🌱</div><div className="mt-2 text-sm font-extrabold">Routines are sticking</div><div className="mt-1 text-xs leading-5 text-[#8984A6]">Your morning reset shows up 5 of the last 7 days.</div></div><div className="rounded-xl bg-[#FFF4EA] p-4"><div className="text-2xl">🧭</div><div className="mt-2 text-sm font-extrabold">Protect your attention</div><div className="mt-1 text-xs leading-5 text-[#9B7A59]">Social scrolling is your largest screen-time category.</div></div><div className="rounded-xl bg-[#ECF9F3] p-4"><div className="text-2xl">✨</div><div className="mt-2 text-sm font-extrabold">Momentum is real</div><div className="mt-1 text-xs leading-5 text-[#668D7B]">You have logged something 12 days in a row.</div></div></div></div></>;
}

function ChallengesView({ state, updateState }: { state: AppState; updateState: (updater: (state: AppState) => AppState) => void }) {
  const [challengeName, setChallengeName] = useState("");
  const challenge = state.challenge;
  const progress = Math.round((challenge.completed.length / challenge.totalDays) * 100);
  const toggleDay = (day: number) => updateState((current) => ({ ...current, challenge: { ...current.challenge, completed: current.challenge.completed.includes(day) ? current.challenge.completed.filter((item) => item !== day) : [...current.challenge.completed, day] } }));
  const createChallenge = (event: FormEvent) => { event.preventDefault(); if (!challengeName.trim()) return; updateState((current) => ({ ...current, challenge: { ...current.challenge, id: uid(), name: challengeName.trim(), description: "A challenge designed around your next chapter.", totalDays: 30, completed: [], accent: "#6D5DFB" } })); setChallengeName(""); };
  return <><PageHeader eyebrow="Personal experiments" title="Challenges, your way" description="Turn an intention into a visible practice. Build a challenge around the life you want, then let progress tell the story." action={<form onSubmit={createChallenge} className="flex gap-2"><input value={challengeName} onChange={(event) => setChallengeName(event.target.value)} placeholder="New challenge" className="h-11 w-40 rounded-xl border border-[#E3E1ED] bg-white px-3 text-xs outline-none focus:border-[#6D5DFB] sm:w-52" /><Button className="h-11 rounded-xl bg-[#6D5DFB] px-3 text-xs font-extrabold hover:bg-[#5949E8]"><Plus className="mr-1.5 h-4 w-4" />Create</Button></form>} /><div className="grid gap-5 xl:grid-cols-[0.82fr_1.18fr]"><div className="rounded-2xl border border-[#E9E8F2] bg-white p-6"><div className="flex items-start justify-between"><div><span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF0EC] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#E96E58]"><Flame className="h-3 w-3" /> Active now</span><h3 className="mt-4 font-display text-3xl font-extrabold tracking-[-0.06em]">{challenge.name}</h3><p className="mt-2 text-sm leading-6 text-[#8B879F]">{challenge.description}</p></div><div className="rounded-2xl bg-[#FFF0EC] p-3 text-[#E96E58]"><Rocket className="h-5 w-5" /></div></div><div className="mt-8 flex items-center gap-5"><ProgressRing value={progress} size={110} stroke={9} /><div><div className="text-3xl font-extrabold tracking-[-0.06em]">Day {challenge.completed.length + 1}</div><div className="mt-1 text-xs font-bold text-[#AAA7B7]">of {challenge.totalDays} · {challenge.totalDays - challenge.completed.length} to go</div><div className="mt-3 text-xs font-bold text-[#E96E58]">{progress}% complete</div></div></div><div className="mt-8 h-2 rounded-full bg-[#F6E7E2]"><div className="h-2 rounded-full bg-[#E96E58]" style={{ width: `${progress}%` }} /></div></div><div className="rounded-2xl border border-[#E9E8F2] bg-white p-6"><div className="flex items-center justify-between"><div><div className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#A09DB7]">Progress graph</div><h3 className="mt-1 font-display text-xl font-extrabold">Show up, then show yourself</h3></div><BarChart3 className="h-5 w-5 text-[#C1BDCF]" /></div><div className="mt-8 flex h-36 items-end gap-1.5">{Array.from({ length: 30 }, (_, index) => { const done = challenge.completed.includes(index); const recent = index > 22; return <button key={index} onClick={() => toggleDay(index)} title={`Day ${index + 1}`} className={classNames("flex-1 rounded-t-md transition hover:opacity-80", done ? "bg-[#E96E58]" : recent ? "bg-[#F3F0F7]" : "bg-[#FAF0ED]")} style={{ height: done ? `${35 + ((index * 17) % 55)}%` : "12%" }} />; })}</div><div className="mt-4 flex items-center justify-between text-[10px] font-bold text-[#AAA7B7]"><span>Day 1</span><span>Tap bars to edit</span><span>Day 30</span></div><div className="mt-6 grid grid-cols-7 gap-2">{Array.from({ length: Math.min(challenge.totalDays, 14) }, (_, index) => <button key={index} onClick={() => toggleDay(index)} className={classNames("rounded-lg py-2 text-[10px] font-extrabold", challenge.completed.includes(index) ? "bg-[#E96E58] text-white" : "bg-[#F7F5FA] text-[#B1AEBC]")}>{index + 1}</button>)}</div></div></div></>;
}

function ActivityView({ state, updateState }: { state: AppState; updateState: (updater: (state: AppState) => AppState) => void }) {
  const today = dateKey(TODAY);
  const todayLogs = state.screenLogs.filter((log) => log.date === today);
  const total = todayLogs.reduce((sum, log) => sum + log.minutes, 0);
  const [minutes, setMinutes] = useState("");
  const [app, setApp] = useState("Instagram");
  const addLog = (event: FormEvent) => { event.preventDefault(); if (!minutes || Number(minutes) <= 0) return; updateState((current) => ({ ...current, screenLogs: [{ id: uid(), date: today, minutes: Number(minutes), app }, ...current.screenLogs] })); setMinutes(""); };
  const week = Array.from({ length: 7 }, (_, index) => { const date = daysAgo(6 - index); return { date, value: state.screenLogs.filter((log) => log.date === date).reduce((sum, log) => sum + log.minutes, 0) }; });
  return <><PageHeader eyebrow="Attention audit" title="Your activity, not your guilt" description="Phone usage is a signal you can work with. Daywise keeps the pattern visible and nudges you before your attention disappears." action={<form onSubmit={addLog} className="flex gap-2"><input value={minutes} onChange={(event) => setMinutes(event.target.value)} type="number" placeholder="Minutes" className="h-11 w-24 rounded-xl border border-[#E3E1ED] bg-white px-3 text-xs outline-none focus:border-[#6D5DFB]" /><select value={app} onChange={(event) => setApp(event.target.value)} className="hidden h-11 rounded-xl border border-[#E3E1ED] bg-white px-3 text-xs outline-none sm:block"><option>Instagram</option><option>YouTube</option><option>Messages</option><option>Maps</option><option>Other</option></select><Button className="h-11 rounded-xl bg-[#6D5DFB] px-3 text-xs font-extrabold hover:bg-[#5949E8]"><Plus className="mr-1.5 h-4 w-4" />Log</Button></form>} /><div className="grid gap-5 xl:grid-cols-[0.7fr_1.3fr]"><div className="rounded-2xl border border-[#E9E8F2] bg-white p-6"><div className="flex items-start justify-between"><div><div className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#A09DB7]">Today</div><h3 className="mt-1 font-display text-3xl font-extrabold tracking-[-0.06em]">{total} min</h3><p className="mt-1 text-xs font-bold text-[#AAA7B7]">{total > state.usualScreenMinutes ? "Above your usual" : "Within your usual"} · {state.usualScreenMinutes} min usual</p></div><div className={classNames("rounded-2xl p-3", total > state.usualScreenMinutes ? "bg-[#FFF0EC] text-[#E96E58]" : "bg-[#E8F8F0] text-[#2F9B72]")}><Smartphone className="h-5 w-5" /></div></div><div className="mt-8 space-y-4">{todayLogs.sort((a, b) => b.minutes - a.minutes).map((log) => <div key={log.id}><div className="flex justify-between text-xs font-extrabold"><span>{log.app}</span><span className="text-[#AAA7B7]">{log.minutes}m</span></div><div className="mt-2 h-2 rounded-full bg-[#F2F0F7]"><div className="h-2 rounded-full bg-[#7D73DC]" style={{ width: `${Math.min(log.minutes, 100)}%` }} /></div></div>)}</div><div className="mt-7 rounded-xl bg-[#FFF7ED] p-3 text-xs leading-5 text-[#9B6B37]"><Bell className="mr-1 inline h-3.5 w-3.5 text-[#F09A3E]" /> Daywise would nudge you here: “Social apps are above your normal. Protect your evening.”</div></div><div className="rounded-2xl border border-[#E9E8F2] bg-white p-6"><div className="flex items-center justify-between"><div><div className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#A09DB7]">Seven day view</div><h3 className="mt-1 font-display text-xl font-extrabold">Where your attention went</h3></div><Laptop className="h-5 w-5 text-[#C1BDCF]" /></div><div className="mt-10 flex h-52 items-end gap-3 border-b border-[#EEE CF]" style={{ borderColor: "#EEECF4" }}>{week.map((day) => <div key={day.date} className="flex flex-1 flex-col items-center gap-3"><div className="relative flex h-40 w-full items-end"><div className={classNames("w-full rounded-t-xl", day.value > state.usualScreenMinutes ? "bg-[#E96E58]" : "bg-[#A5D9C0]")} style={{ height: `${Math.max(day.value / 2, 8)}%` }} /><span className="absolute inset-x-0 bottom-2 text-center text-[10px] font-extrabold text-white">{day.value}</span></div><span className="text-[10px] font-extrabold text-[#AAA7B7]">{new Date(`${day.date}T12:00:00`).toLocaleDateString("en-US", { weekday: "short" }).slice(0, 3)}</span></div>)}</div><div className="mt-5 flex items-center gap-4 text-[10px] font-bold text-[#AAA7B7]"><span><i className="mr-1.5 inline-block h-2 w-2 rounded-full bg-[#A5D9C0]" />Within usual</span><span><i className="mr-1.5 inline-block h-2 w-2 rounded-full bg-[#E96E58]" />Over usual</span></div></div></div></>;
}

function AchievementsView({ state, setActiveTab }: { state: AppState; setActiveTab: (tab: TabKey) => void }) {
  const unlocked = [true, true, true, false, false, false];
  const badges = [{ icon: "🌱", title: "First step", desc: "Log your first habit", color: "mint" }, { icon: "🔥", title: "On a roll", desc: "Keep a 5 day streak", color: "coral" }, { icon: "🪞", title: "Self-aware", desc: "Log 7 mood check-ins", color: "blue" }, { icon: "📖", title: "The narrator", desc: "Write 10 reflections", color: "violet" }, { icon: "🧭", title: "Course corrector", desc: "Complete a challenge", color: "yellow" }, { icon: "🌙", title: "Tomorrow's ally", desc: "Plan 7 nights in a row", color: "violet" }];
  return <><PageHeader eyebrow="Proof of progress" title="Achievements" description="A quiet place to notice who you are becoming. These are not points — they are evidence." action={<button onClick={() => setActiveTab("activity")} className="flex h-11 items-center gap-2 rounded-xl border border-[#E3E1ED] bg-white px-4 text-xs font-extrabold text-[#6D5DFB]"><Trophy className="h-4 w-4" /> View activity</button>} /><div className="mb-5 grid gap-4 sm:grid-cols-3"><div className="rounded-2xl border border-[#E9E8F2] bg-white p-5"><div className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#AAA7B7]">Unlocked</div><div className="mt-2 font-display text-3xl font-extrabold tracking-[-0.06em]">3 <span className="text-base text-[#B3B0C0]">/ 6</span></div></div><div className="rounded-2xl border border-[#E9E8F2] bg-white p-5"><div className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#AAA7B7]">This month</div><div className="mt-2 font-display text-3xl font-extrabold tracking-[-0.06em] text-[#B7831E]">+2</div></div><div className="rounded-2xl border border-[#E9E8F2] bg-white p-5"><div className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#AAA7B7]">Next unlock</div><div className="mt-2 text-sm font-extrabold">The narrator</div><div className="mt-1 text-xs font-bold text-[#AAA7B7]">7/10 entries</div></div></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{badges.map((badge, index) => <div key={badge.title} className={classNames("rounded-2xl border p-5", unlocked[index] ? "border-[#E9E8F2] bg-white" : "border-dashed border-[#E2E0EA] bg-[#FBFBFD]")}><div className="flex items-start justify-between"><span className={classNames("flex h-14 w-14 items-center justify-center rounded-2xl text-3xl", unlocked[index] ? badge.color === "mint" ? "bg-[#E8F8F0]" : badge.color === "coral" ? "bg-[#FFF0EC]" : badge.color === "blue" ? "bg-[#EAF3FF]" : "bg-[#F1EFFF]" : "bg-[#F1F0F5] grayscale")}>{unlocked[index] ? badge.icon : <LockKeyhole className="h-5 w-5 text-[#B8B5C4]" />}</span>{unlocked[index] ? <span className="rounded-full bg-[#E8F8F0] px-2 py-1 text-[9px] font-extrabold uppercase tracking-[0.12em] text-[#2F9B72]">Earned</span> : <span className="text-[10px] font-extrabold text-[#B8B5C4]">LOCKED</span>}</div><h3 className="mt-5 text-sm font-extrabold">{badge.title}</h3><p className="mt-1 text-xs leading-5 text-[#9B98AC]">{badge.desc}</p></div>)}</div></>;
}

function ReviewView({ state, setActiveTab }: { state: AppState; setActiveTab: (tab: TabKey) => void }) {
  const today = dateKey(TODAY);
  const habitRate = Math.round((state.habits.filter((habit) => habit.done.includes(today)).length / Math.max(state.habits.length, 1)) * 100);
  const avgMood = state.moods.length ? state.moods.reduce((sum, entry) => sum + entry.score, 0) / state.moods.length : 0;
  const screenTime = state.screenLogs.filter((log) => log.date === today).reduce((sum, log) => sum + log.minutes, 0);
  return <><PageHeader eyebrow="Pattern recognition" title="Your weekly review" description="An honest, encouraging read of your recent signals. This is a local AI-style review for now — the goal is useful reflection." action={<button className="flex h-11 items-center gap-2 rounded-xl bg-[#292741] px-4 text-xs font-extrabold text-white"><Sparkles className="h-4 w-4 text-[#F4BC56]" /> Refresh review</button>} /><div className="rounded-[26px] bg-[#292741] p-6 text-white sm:p-8"><div className="flex flex-col justify-between gap-8 md:flex-row"><div className="max-w-[620px]"><div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.17em] text-[#B9B5DB]"><Sparkles className="h-4 w-4 text-[#F4BC56]" /> Daywise intelligence · this week</div><h2 className="mt-5 font-display text-3xl font-extrabold leading-tight tracking-[-0.055em] sm:text-4xl">You are building a life that is easier to return to.</h2><p className="mt-4 text-sm leading-6 text-[#C6C2DB]">The strongest signal is consistency without perfection. Your routines are supporting your mood, and your mood is giving you more room to do meaningful work.</p></div><div className="flex shrink-0 items-center gap-4 rounded-2xl bg-white/10 p-5"><ProgressRing value={Math.round((habitRate + avgMood * 20 + Math.min(screenTime / state.usualScreenMinutes * 100, 100)) / 3)} size={100} stroke={9} /><div><div className="text-xs font-extrabold uppercase tracking-[0.15em] text-[#B9B5DB]">Life score</div><div className="mt-2 text-2xl font-extrabold">Growing</div><div className="mt-1 text-xs text-[#B9B5DB]">+8% this week</div></div></div></div></div><div className="mt-5 grid gap-5 lg:grid-cols-3"><div className="rounded-2xl border border-[#E9E8F2] bg-white p-5"><div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.15em] text-[#2F9B72]"><CheckCircle2 className="h-4 w-4" /> Working well</div><h3 className="mt-4 text-lg font-extrabold">Protecting your mornings</h3><p className="mt-2 text-sm leading-6 text-[#858298]">You complete more habits before noon than any other time of day. Your morning reset is becoming a reliable anchor.</p><div className="mt-5 rounded-xl bg-[#E8F8F0] p-3 text-xs font-bold text-[#398261]">Keep: one quiet first hour</div></div><div className="rounded-2xl border border-[#E9E8F2] bg-white p-5"><div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.15em] text-[#E96E58]"><Zap className="h-4 w-4" /> Try next</div><h3 className="mt-4 text-lg font-extrabold">Create a screen boundary</h3><p className="mt-2 text-sm leading-6 text-[#858298]">Social apps are clustering after 8 PM. Put the phone in another room during your wind-down ritual twice this week.</p><button onClick={() => setActiveTab("activity")} className="mt-5 rounded-xl bg-[#FFF0EC] px-3 py-2 text-xs font-extrabold text-[#D15F4E]">Open activity</button></div><div className="rounded-2xl border border-[#E9E8F2] bg-white p-5"><div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.15em] text-[#6D5DFB]"><Lightbulb className="h-4 w-4" /> A question</div><h3 className="mt-4 text-lg font-extrabold">What would feel like enough?</h3><p className="mt-2 text-sm leading-6 text-[#858298]">Your data shows you are doing a lot. Before adding another goal, define the version of this week you would be proud to repeat.</p><button onClick={() => setActiveTab("journal")} className="mt-5 rounded-xl bg-[#F1EFFF] px-3 py-2 text-xs font-extrabold text-[#6D5DFB]">Write about it</button></div></div><div className="mt-5 rounded-2xl border border-[#E9E8F2] bg-white p-6"><div className="flex items-center justify-between"><div><div className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#A09DB7]">Signals used</div><h3 className="mt-1 font-display text-xl font-extrabold">The numbers behind the note</h3></div><button onClick={() => setActiveTab("today")} className="text-xs font-extrabold text-[#6D5DFB]">Back to today <ChevronRight className="inline h-3.5 w-3.5" /></button></div><div className="mt-6 grid gap-3 sm:grid-cols-3"><div className="rounded-xl bg-[#F8F7FC] p-4"><div className="text-2xl font-extrabold">{habitRate}%</div><div className="mt-1 text-xs font-bold text-[#AAA7B7]">habits done today</div></div><div className="rounded-xl bg-[#F8F7FC] p-4"><div className="text-2xl font-extrabold">{avgMood.toFixed(1)}/5</div><div className="mt-1 text-xs font-bold text-[#AAA7B7]">average mood logged</div></div><div className="rounded-xl bg-[#F8F7FC] p-4"><div className="text-2xl font-extrabold">{screenTime}m</div><div className="mt-1 text-xs font-bold text-[#AAA7B7]">screen time today</div></div></div></div></>;
}

function ActivityHeatmap({ state }: { state: AppState }) {
  const cells = Array.from({ length: 140 }, (_, index) => { const day = daysAgo(139 - index); const habitCount = state.habits.filter((habit) => habit.done.includes(day)).length; const journalCount = state.journal.filter((entry) => entry.date === day).length; return Math.min(habitCount + journalCount, 4); });
  return <div className="grid grid-flow-col grid-rows-7 gap-1 overflow-x-auto pb-2">{cells.map((level, index) => <span key={index} title={`${level} activities`} className={classNames("h-3 w-3 shrink-0 rounded-[3px]", level === 0 ? "bg-[#F0EFF5]" : level === 1 ? "bg-[#D8D1FF]" : level === 2 ? "bg-[#B1A7FF]" : level === 3 ? "bg-[#897BFA]" : "bg-[#6D5DFB]")} />)}</div>;
}

function ActivityPage({ state, setActiveTab }: { state: AppState; setActiveTab: (tab: TabKey) => void }) {
  return <><PageHeader eyebrow="Your consistency map" title="Activity" description="The days you touched your life on purpose. A contribution graph for the work nobody else can see." action={<button onClick={() => setActiveTab("today")} className="flex h-11 items-center gap-2 rounded-xl border border-[#E3E1ED] bg-white px-4 text-xs font-extrabold text-[#6D5DFB]"><CalendarDays className="h-4 w-4" /> Back to today</button>} /><div className="rounded-2xl border border-[#E9E8F2] bg-white p-5 sm:p-6"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#A09DB7]"><Activity className="h-4 w-4 text-[#6D5DFB]" /> All-time activity</div><h3 className="mt-2 font-display text-2xl font-extrabold tracking-[-0.05em]">12 day streak <span className="ml-2 text-sm font-bold text-[#AAA7B7]">and growing</span></h3></div><div className="flex gap-4 text-right"><div><div className="text-xl font-extrabold">86</div><div className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#AAA7B7]">active days</div></div><div><div className="text-xl font-extrabold text-[#6D5DFB]">68%</div><div className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#AAA7B7]">consistency</div></div></div></div><div className="mt-8"><ActivityHeatmap state={state} /><div className="mt-3 flex items-center justify-between text-[10px] font-bold text-[#AAA7B7]"><span>Less</span><div className="flex items-center gap-1"><i className="h-3 w-3 rounded-[3px] bg-[#F0EFF5]" /><i className="h-3 w-3 rounded-[3px] bg-[#D8D1FF]" /><i className="h-3 w-3 rounded-[3px] bg-[#B1A7FF]" /><i className="h-3 w-3 rounded-[3px] bg-[#897BFA]" /><i className="h-3 w-3 rounded-[3px] bg-[#6D5DFB]" /><span className="ml-1">More</span></div></div></div></div><div className="mt-5 grid gap-5 md:grid-cols-2"><div className="rounded-2xl border border-[#E9E8F2] bg-white p-6"><SectionIcon icon={Activity} tone="violet" /><h3 className="mt-5 font-display text-xl font-extrabold">What counts as activity?</h3><p className="mt-2 text-sm leading-6 text-[#858298]">Any meaningful touch counts: a habit, a task, a mood check-in, a journal version, or a challenge day. The point is returning.</p></div><div className="rounded-2xl border border-[#E9E8F2] bg-white p-6"><SectionIcon icon={Trophy} tone="yellow" /><h3 className="mt-5 font-display text-xl font-extrabold">Your most active day</h3><p className="mt-2 text-sm leading-6 text-[#858298]">Tuesday, when you logged 8 small actions. Notice what made that day feel possible and borrow from it.</p><button onClick={() => setActiveTab("review")} className="mt-5 text-xs font-extrabold text-[#6D5DFB]">Ask the review why <ArrowUpRight className="ml-1 inline h-3.5 w-3.5" /></button></div></div></>;
}

function MoneyPage({ setActiveTab }: { setActiveTab: (tab: TabKey) => void }) { return <LifeOverview state={createInitialState()} setActiveTab={setActiveTab} />; }
function HealthPage({ setActiveTab }: { setActiveTab: (tab: TabKey) => void }) { return <LifeOverview state={createInitialState()} setActiveTab={setActiveTab} />; }
function GoalsPage({ setActiveTab }: { setActiveTab: (tab: TabKey) => void }) { return <LifeOverview state={createInitialState()} setActiveTab={setActiveTab} />; }

export default function Index() {
  const [state, setState] = useState<AppState>(loadState);
  const [activeTab, setActiveTab] = useState<TabKey>("today");
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }, [state]);
  const updateState = (updater: (state: AppState) => AppState) => setState((current) => updater(current));
  const content = useMemo(() => {
    switch (activeTab) {
      case "today": return <TodayView state={state} updateState={updateState} setActiveTab={setActiveTab} />;
      case "habits": return <HabitsView state={state} updateState={updateState} />;
      case "tasks": return <TasksView state={state} updateState={updateState} />;
      case "journal": return <VersionedView kind="journal" state={state} updateState={updateState} />;
      case "tomorrow": return <VersionedView kind="tomorrow" state={state} updateState={updateState} />;
      case "mood": return <MoodView state={state} updateState={updateState} />;
      case "challenges": return <ChallengesView state={state} updateState={updateState} />;
      case "activity": return <ActivityPage state={state} setActiveTab={setActiveTab} />;
      case "achievements": return <AchievementsView state={state} setActiveTab={setActiveTab} />;
      case "review": return <ReviewView state={state} setActiveTab={setActiveTab} />;
      case "money": return <MoneyPage setActiveTab={setActiveTab} />;
      case "health": return <HealthPage setActiveTab={setActiveTab} />;
      case "goals": return <GoalsPage setActiveTab={setActiveTab} />;
      default: return <TodayView state={state} updateState={updateState} setActiveTab={setActiveTab} />;
    }
  }, [activeTab, state]);
  return <AppShell activeTab={activeTab} setActiveTab={setActiveTab} state={state}>{content}</AppShell>;
}
