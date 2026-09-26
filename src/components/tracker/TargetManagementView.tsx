import { useState } from "react";
import type { FormEvent } from "react";
import {
  Target,
  Plus,
  Check,
  Trash2,
  Calendar,
  Moon,
  Sparkles,
  TrendingUp,
  Award,
  Clock,
  ArrowRight,
  CheckCircle2,
  X,
  Sliders,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AppState, TargetItem, TargetScope } from "@/types/tracker";

interface TargetManagementViewProps {
  state: AppState;
  updateState: (updater: (state: AppState) => AppState) => void;
  setActiveTab: (tab: string) => void;
}

const DEFAULT_TARGETS: TargetItem[] = [
  // Yearly
  {
    id: "yt-1",
    title: "Complete core architecture certification & master systems design",
    scope: "yearly",
    category: "Career",
    targetValue: 100,
    currentValue: 35,
    unit: "%",
    completed: false,
    createdAt: "2026-01-01",
  },
  {
    id: "yt-2",
    title: "Read 24 deep non-fiction books & document learnings",
    scope: "yearly",
    category: "Mind",
    targetValue: 24,
    currentValue: 14,
    unit: "books",
    completed: false,
    createdAt: "2026-01-01",
  },
  // Monthly
  {
    id: "mt-1",
    title: "Publish 2 in-depth technical breakdowns / case studies",
    scope: "monthly",
    category: "Growth",
    targetValue: 2,
    currentValue: 1,
    unit: "articles",
    completed: false,
    createdAt: "2026-09-01",
  },
  {
    id: "mt-2",
    title: "Zero late screen days (all devices parked by 9:30 PM)",
    scope: "monthly",
    category: "Health",
    targetValue: 25,
    currentValue: 18,
    unit: "days",
    completed: false,
    createdAt: "2026-09-01",
  },
  // Weekly
  {
    id: "wt-1",
    title: "Complete 4 strength workouts & 10,000 daily steps",
    scope: "weekly",
    category: "Fitness",
    targetValue: 4,
    currentValue: 3,
    unit: "sessions",
    completed: false,
    createdAt: "2026-09-21",
  },
  {
    id: "wt-2",
    title: "Ship the DayWise tracker full enhancement package",
    scope: "weekly",
    category: "Product",
    targetValue: 100,
    currentValue: 85,
    unit: "%",
    completed: false,
    createdAt: "2026-09-21",
  },
  // Daily
  {
    id: "dt-1",
    title: "Deep focus: 3 hours uninterrupted coding & design",
    scope: "daily",
    category: "Priority",
    completed: true,
    assignedDate: new Date().toISOString().slice(0, 10),
    createdAt: "2026-09-25",
  },
  {
    id: "dt-2",
    title: "Drink 2.5L water & log healthy meals",
    scope: "daily",
    category: "Health",
    completed: true,
    assignedDate: new Date().toISOString().slice(0, 10),
    createdAt: "2026-09-25",
  },
  {
    id: "dt-3",
    title: "Evening review & sleep targets plan",
    scope: "daily",
    category: "Review",
    completed: false,
    assignedDate: new Date().toISOString().slice(0, 10),
    createdAt: "2026-09-25",
  },
];

export function TargetManagementView({ state, updateState }: TargetManagementViewProps) {
  const [activeScope, setActiveScope] = useState<TargetScope>("daily");
  const [showSleepModal, setShowSleepModal] = useState(false);
  
  // New target form
  const [targetTitle, setTargetTitle] = useState("");
  const [targetCategory, setTargetCategory] = useState("Priority");
  const [targetValue, setTargetValue] = useState("");
  const [unit, setUnit] = useState("");

  // Sleep planning form for tomorrow
  const [sleepTasks, setSleepTasks] = useState([
    { title: "Review top 3 morning priorities", selected: true },
    { title: "Morning hydration & 20m movement", selected: true },
    { title: "Deep work block on core milestone", selected: true },
  ]);
  const [customTomorrowTask, setCustomTomorrowTask] = useState("");

  const allTargets = state.targets || DEFAULT_TARGETS;
  const todayStr = new Date().toISOString().slice(0, 10);

  // Daily comparison analytics
  const dailyTargets = allTargets.filter(
    (t) => t.scope === "daily" && (t.assignedDate === todayStr || !t.assignedDate)
  );
  const completedDailyCount = dailyTargets.filter((t) => t.completed).length;
  const totalDailyCount = dailyTargets.length || 1;
  const dailyCompletionRate = Math.round((completedDailyCount / totalDailyCount) * 100);

  // All completed tasks from state.tasks for today
  const generalTasks = state.tasks || [];
  const completedGeneralTasks = generalTasks.filter((t) => t.done).length;

  const handleToggleTarget = (id: string) => {
    updateState((prev) => {
      const existing = prev.targets || DEFAULT_TARGETS;
      return {
        ...prev,
        targets: existing.map((t) =>
          t.id === id ? { ...t, completed: !t.completed } : t
        ),
      };
    });
  };

  const handleDeleteTarget = (id: string) => {
    updateState((prev) => {
      const existing = prev.targets || DEFAULT_TARGETS;
      return {
        ...prev,
        targets: existing.filter((t) => t.id !== id),
      };
    });
  };

  const handleAddTarget = (e: FormEvent) => {
    e.preventDefault();
    if (!targetTitle.trim()) return;

    const newTarget: TargetItem = {
      id: Math.random().toString(36).slice(2, 10),
      title: targetTitle.trim(),
      scope: activeScope,
      category: targetCategory,
      targetValue: targetValue ? parseFloat(targetValue) : undefined,
      currentValue: targetValue ? 0 : undefined,
      unit: unit.trim() || undefined,
      completed: false,
      assignedDate: activeScope === "daily" ? todayStr : undefined,
      createdAt: todayStr,
    };

    updateState((prev) => ({
      ...prev,
      targets: [newTarget, ...(prev.targets || DEFAULT_TARGETS)],
    }));

    setTargetTitle("");
    setTargetValue("");
    setUnit("");
  };

  // Submit Evening / Before Sleep Planning
  const handleSaveTomorrowPlan = () => {
    const tomorrowStr = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
    const selected = sleepTasks.filter((t) => t.selected);

    const newDailyTargets: TargetItem[] = selected.map((t) => ({
      id: Math.random().toString(36).slice(2, 10),
      title: t.title,
      scope: "daily",
      category: "Priority",
      completed: false,
      assignedDate: tomorrowStr,
      createdAt: todayStr,
    }));

    // Also add to state.tomorrow version history if desired
    updateState((prev) => {
      const existingTargets = prev.targets || DEFAULT_TARGETS;
      const tomorrowNotes = selected.map((s) => `• ${s.title}`).join("\n");
      const newTomorrowEntry = {
        id: Math.random().toString(36).slice(2, 10),
        date: todayStr,
        createdAt: `Planned tonight at ${new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`,
        text: `🌙 Tomorrow's Focus Targets:\n${tomorrowNotes}`,
      };

      return {
        ...prev,
        targets: [...newDailyTargets, ...existingTargets],
        tomorrow: [newTomorrowEntry, ...(prev.tomorrow || [])],
      };
    });

    setShowSleepModal(false);
  };

  const filteredTargets = allTargets.filter((t) => t.scope === activeScope);

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#6D5DFB]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#6D5DFB]" />
            Execution & Strategy
          </div>
          <h1 className="font-display text-[32px] font-extrabold leading-none tracking-[-0.055em] text-[#26243A] sm:text-[38px]">
            Goal & Target Management
          </h1>
          <p className="mt-2.5 max-w-[620px] text-sm leading-6 text-[#88859D]">
            Manage Yearly, Monthly, Weekly, and Daily targets. Plan ahead before sleep and compare completed daily work against assigned targets.
          </p>
        </div>

        {/* Before Sleep Prompt Button */}
        <button
          onClick={() => setShowSleepModal(true)}
          className="flex items-center gap-2.5 rounded-2xl bg-[#292741] px-5 py-3 text-xs font-extrabold text-white shadow-lg hover:bg-[#343152] transition"
        >
          <Moon className="h-4 w-4 text-[#F4BC56]" />
          <span>🌙 Plan Tomorrow's Targets (Before Sleep)</span>
        </button>
      </div>

      {/* Daily Completed Work vs Assigned Targets Scorecard */}
      <div className="relative overflow-hidden rounded-[26px] border border-[#E8E4FF] bg-gradient-to-br from-[#F5F3FF] via-[#FAF9FF] to-white p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#6D5DFB]/10 px-3 py-1 text-[11px] font-extrabold text-[#6D5DFB]">
              <Sparkles className="h-3.5 w-3.5" />
              Day's Completed Work vs Assigned Targets
            </div>
            <h2 className="mt-3 font-display text-2xl font-extrabold text-[#26243A] sm:text-3xl">
              {completedDailyCount} of {dailyTargets.length} Daily Targets Completed
            </h2>
            <p className="mt-2 max-w-[520px] text-sm text-[#736F8A] leading-relaxed">
              Tracking your execution velocity against what you assigned to yourself today. Plus {completedGeneralTasks} broader tasks checked off.
            </p>
          </div>

          <div className="flex items-center gap-6 rounded-2xl bg-white p-5 border border-[#ECEAF5] shadow-xs">
            <div className="relative flex h-20 w-20 items-center justify-center">
              <svg className="-rotate-90" width={80} height={80} viewBox="0 0 80 80">
                <circle cx={40} cy={40} r={34} fill="none" stroke="#ECEBFA" strokeWidth={7} />
                <circle
                  cx={40}
                  cy={40}
                  r={34}
                  fill="none"
                  stroke="#6D5DFB"
                  strokeWidth={7}
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 34}
                  strokeDashoffset={2 * Math.PI * 34 - (dailyCompletionRate / 100) * (2 * Math.PI * 34)}
                />
              </svg>
              <span className="absolute font-extrabold text-base text-[#26243A]">{dailyCompletionRate}%</span>
            </div>
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#A09DB7]">Velocity</div>
              <div className="text-xl font-extrabold text-[#26243A]">
                {dailyCompletionRate >= 80 ? "Supercharged 🔥" : dailyCompletionRate >= 50 ? "Steady Rhythm ⚡" : "In Progress ⏳"}
              </div>
              <div className="text-xs text-[#8E8B9E] mt-0.5">{dailyTargets.length - completedDailyCount} remaining targets</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scope Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E9E8F2] pb-3">
        {(["daily", "weekly", "monthly", "yearly"] as TargetScope[]).map((scope) => {
          const isActive = activeScope === scope;
          const count = allTargets.filter((t) => t.scope === scope).length;
          return (
            <button
              key={scope}
              onClick={() => setActiveScope(scope)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-extrabold capitalize transition ${
                isActive
                  ? "bg-[#6D5DFB] text-white shadow-sm"
                  : "bg-white text-[#77748F] border border-[#E9E8F2] hover:bg-[#F6F4FF]"
              }`}
            >
              <span>{scope} Targets</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  isActive ? "bg-white/20 text-white" : "bg-[#F1EFFF] text-[#6D5DFB]"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Target Content Area: Form + List */}
      <div className="grid gap-6 lg:grid-cols-[1.1fr_1.9fr]">
        {/* Form: Add Target for Active Scope */}
        <div className="rounded-3xl border border-[#E9E8F2] bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F1EFFF] text-[#6D5DFB]">
              <Target className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-display text-lg font-extrabold capitalize text-[#26243A]">
                Add {activeScope} Target
              </h3>
              <p className="text-xs text-[#8E8B9E]">Set high-signal milestones</p>
            </div>
          </div>

          <form onSubmit={handleAddTarget} className="mt-5 space-y-4">
            <div>
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#A09DB7]">
                Target Description
              </label>
              <input
                type="text"
                value={targetTitle}
                onChange={(e) => setTargetTitle(e.target.value)}
                placeholder={
                  activeScope === "daily"
                    ? "e.g. Ship v1.2 release, 50 pushups"
                    : activeScope === "weekly"
                    ? "e.g. Complete 5 coding modules"
                    : activeScope === "monthly"
                    ? "e.g. Run 100km total, save $1,500"
                    : "e.g. Launch SaaS product, achieve $10k MRR"
                }
                className="mt-1.5 h-11 w-full rounded-xl border border-[#E3E1ED] bg-[#FAFAFD] px-3.5 text-xs outline-none focus:border-[#6D5DFB] focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#A09DB7]">
                  Category Tag
                </label>
                <select
                  value={targetCategory}
                  onChange={(e) => setTargetCategory(e.target.value)}
                  className="mt-1.5 h-11 w-full rounded-xl border border-[#E3E1ED] bg-[#FAFAFD] px-3 text-xs font-bold text-[#26243A] outline-none focus:border-[#6D5DFB]"
                >
                  <option value="Priority">Priority</option>
                  <option value="Health">Health & Fitness</option>
                  <option value="Career">Career & Craft</option>
                  <option value="Mind">Mind & Reading</option>
                  <option value="Finance">Finance</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#A09DB7]">
                  Target Metric (Optional)
                </label>
                <input
                  type="number"
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                  placeholder="e.g. 100"
                  className="mt-1.5 h-11 w-full rounded-xl border border-[#E3E1ED] bg-[#FAFAFD] px-3.5 text-xs outline-none focus:border-[#6D5DFB] focus:bg-white"
                />
              </div>
            </div>

            {targetValue && (
              <div>
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#A09DB7]">
                  Metric Unit
                </label>
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="e.g. hours, %, books, sessions"
                  className="mt-1.5 h-11 w-full rounded-xl border border-[#E3E1ED] bg-[#FAFAFD] px-3.5 text-xs outline-none focus:border-[#6D5DFB]"
                />
              </div>
            )}

            <Button
              type="submit"
              className="h-11 w-full rounded-xl bg-[#6D5DFB] text-xs font-extrabold text-white shadow-md hover:bg-[#5949E8]"
            >
              <Plus className="mr-1.5 h-4 w-4" /> Save {activeScope} Target
            </Button>
          </form>
        </div>

        {/* Target Items List */}
        <div className="rounded-3xl border border-[#E9E8F2] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#F0EEF6] pb-3">
            <h3 className="font-display text-base font-extrabold capitalize text-[#26243A]">
              Active {activeScope} Targets
            </h3>
            <span className="text-xs font-bold text-[#6D5DFB]">
              {filteredTargets.filter((t) => t.completed).length} / {filteredTargets.length} Completed
            </span>
          </div>

          {filteredTargets.length === 0 ? (
            <div className="py-10 text-center text-xs text-[#AAA7BD]">
              No {activeScope} targets set yet. Add one to anchor your focus.
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {filteredTargets.map((item) => (
                <div
                  key={item.id}
                  className={`rounded-2xl border p-4 transition ${
                    item.completed ? "border-transparent bg-[#F5FCF7]" : "border-[#ECEAF5] bg-white hover:bg-[#FAFAFD]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div
                      onClick={() => handleToggleTarget(item.id)}
                      className="flex items-start gap-3 cursor-pointer flex-1 min-w-0"
                    >
                      <span
                        className={`flex h-6 w-6 mt-0.5 shrink-0 items-center justify-center rounded-full border-2 transition ${
                          item.completed
                            ? "border-[#27AE60] bg-[#27AE60] text-white"
                            : "border-[#D0CEDB] hover:border-[#6D5DFB]"
                        }`}
                      >
                        {item.completed && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div
                          className={`text-sm font-extrabold leading-snug ${
                            item.completed ? "line-through text-[#A09DB7]" : "text-[#26243A]"
                          }`}
                        >
                          {item.title}
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-[10px] font-bold text-[#8E8B9E]">
                          <span className="rounded bg-[#F1EFFF] px-1.5 py-0.5 text-[#6D5DFB]">
                            {item.category || activeScope}
                          </span>
                          {item.assignedDate && <span>· Assigned for {item.assignedDate}</span>}
                          {item.targetValue && (
                            <span>
                              · Goal: {item.targetValue} {item.unit}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteTarget(item.id)}
                      className="text-[#D0CEDB] hover:text-[#E96E58] p-1"
                      title="Delete target"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Evening Sleep Planning Modal */}
      {showSleepModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-3xl border border-[#E9E8F2] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#F0EEF6] pb-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#292741] text-[#F4BC56]">
                  <Moon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-display text-lg font-extrabold text-[#26243A]">
                    Before-Sleep Target Planning
                  </h3>
                  <p className="text-xs text-[#8E8B9E]">Lock in tomorrow's focus before you rest</p>
                </div>
              </div>
              <button
                onClick={() => setShowSleepModal(false)}
                className="rounded-xl p-1.5 text-[#A09DB7] hover:bg-[#F6F4FF]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4">
              <p className="text-xs text-[#6F6B86] leading-relaxed">
                Tomorrow begins tonight. Select or add 3 vital targets to commit to when you wake up:
              </p>

              <div className="mt-4 space-y-2">
                {sleepTasks.map((task, idx) => (
                  <div
                    key={idx}
                    onClick={() =>
                      setSleepTasks((prev) =>
                        prev.map((t, i) => (i === idx ? { ...t, selected: !t.selected } : t))
                      )
                    }
                    className={`flex items-center gap-3 rounded-2xl border p-3 cursor-pointer transition ${
                      task.selected
                        ? "border-[#6D5DFB] bg-[#F6F4FF] text-[#26243A]"
                        : "border-[#ECEAF5] bg-white text-[#8E8B9E]"
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                        task.selected ? "border-[#6D5DFB] bg-[#6D5DFB] text-white" : "border-[#D0CEDB]"
                      }`}
                    >
                      {task.selected && <Check className="h-3 w-3" />}
                    </span>
                    <span className="text-xs font-extrabold flex-1">{task.title}</span>
                  </div>
                ))}
              </div>

              {/* Add custom tomorrow task */}
              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={customTomorrowTask}
                  onChange={(e) => setCustomTomorrowTask(e.target.value)}
                  placeholder="Add custom task for tomorrow..."
                  className="h-9 flex-1 rounded-xl border border-[#E0DDF0] px-3 text-xs outline-none focus:border-[#6D5DFB]"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!customTomorrowTask.trim()) return;
                    setSleepTasks((prev) => [...prev, { title: customTomorrowTask.trim(), selected: true }]);
                    setCustomTomorrowTask("");
                  }}
                  className="rounded-xl bg-[#F1EFFF] px-3 text-xs font-bold text-[#6D5DFB] hover:bg-[#E7E3FF]"
                >
                  + Add
                </button>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t border-[#F0EEF6] pt-4">
              <button
                onClick={() => setShowSleepModal(false)}
                className="rounded-xl px-4 py-2 text-xs font-extrabold text-[#77748F] hover:bg-[#F8F8FC]"
              >
                Close
              </button>
              <Button
                onClick={handleSaveTomorrowPlan}
                className="h-10 rounded-xl bg-[#292741] px-5 text-xs font-extrabold text-white shadow-md hover:bg-[#39365B]"
              >
                🌙 Commit to Tomorrow's Targets
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
