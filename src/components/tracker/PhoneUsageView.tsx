import { useState } from "react";
import type { FormEvent } from "react";
import {
  Smartphone,
  Plus,
  Trash2,
  PieChart,
  Clock,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  TrendingDown,
  TrendingUp,
  Sliders,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AppState, DetailedScreenLog, AppCategory } from "@/types/tracker";

interface PhoneUsageViewProps {
  state: AppState;
  updateState: (updater: (state: AppState) => AppState) => void;
  setActiveTab: (tab: string) => void;
}

const COMMON_APPS = [
  { name: "YouTube", category: "Entertainment" as AppCategory, color: "#FF0000" },
  { name: "Instagram", category: "Social" as AppCategory, color: "#E1306C" },
  { name: "WhatsApp", category: "Communication" as AppCategory, color: "#25D366" },
  { name: "Slack", category: "Productive" as AppCategory, color: "#4A154B" },
  { name: "VS Code / IDE", category: "Productive" as AppCategory, color: "#007ACC" },
  { name: "Chrome / Browser", category: "Utility" as AppCategory, color: "#4285F4" },
  { name: "Twitter / X", category: "Social" as AppCategory, color: "#1DA1F2" },
  { name: "Kindle / Books", category: "Productive" as AppCategory, color: "#FF9900" },
  { name: "Notion", category: "Productive" as AppCategory, color: "#000000" },
  { name: "Spotify / Music", category: "Entertainment" as AppCategory, color: "#1DB954" },
];

export function PhoneUsageView({ state, updateState }: PhoneUsageViewProps) {
  const todayStr = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  // Form state
  const [appName, setAppName] = useState("YouTube");
  const [customAppName, setCustomAppName] = useState("");
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("30");
  const [category, setCategory] = useState<AppCategory>("Entertainment");
  const [opensCount, setOpensCount] = useState("");
  const [targetLimitHours, setTargetLimitHours] = useState(
    state.usualScreenMinutes ? (state.usualScreenMinutes / 60).toFixed(1) : "2.5"
  );

  const logs = state.detailedScreenLogs || [];
  const currentLogs = logs.filter((log) => log.date === selectedDate);

  const totalMinutes = currentLogs.reduce(
    (sum, log) => sum + log.hours * 60 + log.minutes,
    0
  );
  const totalHoursFormatted = `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`;

  const targetMinutes = parseFloat(targetLimitHours) * 60 || 150;
  const isOverLimit = totalMinutes > targetMinutes;
  const limitDifference = Math.abs(totalMinutes - targetMinutes);

  // Add App Usage handler
  const handleAddLog = (e: FormEvent) => {
    e.preventDefault();
    const finalName = appName === "Custom" ? customAppName.trim() : appName;
    if (!finalName) return;

    const parsedHours = parseInt(hours, 10) || 0;
    const parsedMinutes = parseInt(minutes, 10) || 0;
    if (parsedHours === 0 && parsedMinutes === 0) return;

    const newLog: DetailedScreenLog = {
      id: Math.random().toString(36).slice(2, 10),
      date: selectedDate,
      app: finalName,
      hours: parsedHours,
      minutes: parsedMinutes,
      category,
      opensCount: opensCount ? parseInt(opensCount, 10) : undefined,
    };

    updateState((prev) => {
      const existing = prev.detailedScreenLogs || [];
      return {
        ...prev,
        detailedScreenLogs: [newLog, ...existing],
        // Also keep legacy screenLogs in sync for summary views
        screenLogs: [
          { id: newLog.id, date: selectedDate, minutes: parsedHours * 60 + parsedMinutes, app: finalName },
          ...prev.screenLogs.filter((s) => s.id !== newLog.id),
        ],
      };
    });

    setMinutes("30");
    setHours("");
    setCustomAppName("");
    setOpensCount("");
  };

  const handleDeleteLog = (id: string) => {
    updateState((prev) => ({
      ...prev,
      detailedScreenLogs: (prev.detailedScreenLogs || []).filter((l) => l.id !== id),
      screenLogs: prev.screenLogs.filter((s) => s.id !== id),
    }));
  };

  const handleUpdateLimit = (newLimit: number) => {
    updateState((prev) => ({
      ...prev,
      usualScreenMinutes: Math.round(newLimit * 60),
    }));
  };

  // Category breakdown
  const categoryTotals: Record<AppCategory, number> = {
    Productive: 0,
    Social: 0,
    Entertainment: 0,
    Communication: 0,
    Utility: 0,
  };

  currentLogs.forEach((log) => {
    const mins = log.hours * 60 + log.minutes;
    categoryTotals[log.category] = (categoryTotals[log.category] || 0) + mins;
  });

  const productiveMins = categoryTotals.Productive;
  const distractingMins = categoryTotals.Social + categoryTotals.Entertainment;
  const totalAnalyzed = productiveMins + distractingMins || 1;
  const productiveRatio = Math.round((productiveMins / totalAnalyzed) * 100);

  const getCategoryColor = (cat: AppCategory) => {
    switch (cat) {
      case "Productive":
        return "bg-[#2ECC71] text-white";
      case "Social":
        return "bg-[#E74C3C] text-white";
      case "Entertainment":
        return "bg-[#9B59B6] text-white";
      case "Communication":
        return "bg-[#3498DB] text-white";
      case "Utility":
        return "bg-[#95A5A6] text-white";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#6D5DFB]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#6D5DFB]" />
            Attention & Focus Audit
          </div>
          <h1 className="font-display text-[32px] font-extrabold leading-none tracking-[-0.055em] text-[#26243A] sm:text-[38px]">
            Detailed Phone Usage
          </h1>
          <p className="mt-2.5 max-w-[620px] text-sm leading-6 text-[#88859D]">
            Track which apps you use and for how many hours each day. Understand your digital habits and protect your highest-focus windows.
          </p>
        </div>

        {/* Daily Target Setting Badge */}
        <div className="flex items-center gap-3 rounded-2xl border border-[#E9E8F2] bg-white p-3 shadow-xs">
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#A09DB7]">Daily Cap Target</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="12"
                value={targetLimitHours}
                onChange={(e) => {
                  setTargetLimitHours(e.target.value);
                  const val = parseFloat(e.target.value);
                  if (val > 0) handleUpdateLimit(val);
                }}
                className="w-14 rounded-lg border border-[#E0DDF0] px-1.5 py-0.5 text-xs font-extrabold text-[#26243A]"
              />
              <span className="text-xs font-bold text-[#8E8B9E]">hours/day</span>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Screen Time */}
        <div className="rounded-2xl border border-[#E9E8F2] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#A09DB7]">Total Today</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#F1EFFF] text-[#6D5DFB]">
              <Smartphone className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-[#26243A]">{totalHoursFormatted}</div>
          <div className="mt-1 flex items-center gap-1 text-xs">
            {isOverLimit ? (
              <span className="flex items-center font-bold text-[#E74C3C]">
                <TrendingUp className="mr-1 h-3.5 w-3.5" />
                {Math.round(limitDifference)}m over limit
              </span>
            ) : (
              <span className="flex items-center font-bold text-[#27AE60]">
                <TrendingDown className="mr-1 h-3.5 w-3.5" />
                {Math.round(limitDifference)}m under budget
              </span>
            )}
          </div>
        </div>

        {/* Productive vs Distracting */}
        <div className="rounded-2xl border border-[#E9E8F2] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#A09DB7]">Productive Ratio</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#E8F8F0] text-[#2ECC71]">
              <ShieldCheck className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-[#26243A]">{productiveRatio}%</div>
          <div className="mt-1 text-xs text-[#8E8B9E]">
            {Math.floor(productiveMins / 60)}h {productiveMins % 60}m high-value work
          </div>
        </div>

        {/* Apps Count */}
        <div className="rounded-2xl border border-[#E9E8F2] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#A09DB7]">Tracked Apps</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FFF5D9] text-[#CA921A]">
              <PieChart className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-[#26243A]">{currentLogs.length} apps</div>
          <div className="mt-1 text-xs text-[#8E8B9E]">Detailed duration breakdown</div>
        </div>

        {/* Pickups / Opens */}
        <div className="rounded-2xl border border-[#E9E8F2] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#A09DB7]">Total Opens / Pickups</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#EBF5FB] text-[#3498DB]">
              <Sliders className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-[#26243A]">
            {currentLogs.reduce((sum, l) => sum + (l.opensCount || 0), 0) || "—"}
          </div>
          <div className="mt-1 text-xs text-[#8E8B9E]">Direct checks throughout day</div>
        </div>
      </div>

      {/* Main Grid: Form Logger + Detailed Usage Breakdown */}
      <div className="grid gap-6 lg:grid-cols-[1.1fr_1.9fr]">
        {/* Logger Form */}
        <div className="rounded-3xl border border-[#E9E8F2] bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F6F4FF] text-[#6D5DFB]">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-extrabold text-[#26243A]">Log App Usage</h2>
              <p className="text-xs text-[#8E8B9E]">Specify hours & minutes spent</p>
            </div>
          </div>

          <form onSubmit={handleAddLog} className="mt-5 space-y-4">
            {/* Quick App Select */}
            <div>
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#A09DB7]">
                Select Application
              </label>
              <select
                value={appName}
                onChange={(e) => {
                  const val = e.target.value;
                  setAppName(val);
                  const matched = COMMON_APPS.find((a) => a.name === val);
                  if (matched) setCategory(matched.category);
                }}
                className="mt-1.5 h-11 w-full rounded-xl border border-[#E3E1ED] bg-[#FAFAFD] px-3.5 text-xs font-bold text-[#26243A] outline-none focus:border-[#6D5DFB]"
              >
                {COMMON_APPS.map((app) => (
                  <option key={app.name} value={app.name}>
                    {app.name} ({app.category})
                  </option>
                ))}
                <option value="Custom">+ Other App...</option>
              </select>
            </div>

            {appName === "Custom" && (
              <div>
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#A09DB7]">
                  Custom App Name
                </label>
                <input
                  type="text"
                  value={customAppName}
                  onChange={(e) => setCustomAppName(e.target.value)}
                  placeholder="e.g. Duolingo, Chess.com, Figma"
                  className="mt-1.5 h-11 w-full rounded-xl border border-[#E3E1ED] bg-[#FAFAFD] px-3.5 text-xs outline-none focus:border-[#6D5DFB]"
                />
              </div>
            )}

            {/* Hours & Minutes inputs */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#A09DB7]">
                  Hours
                </label>
                <input
                  type="number"
                  min="0"
                  max="24"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  placeholder="0"
                  className="mt-1.5 h-11 w-full rounded-xl border border-[#E3E1ED] bg-[#FAFAFD] px-3.5 text-xs outline-none focus:border-[#6D5DFB]"
                />
              </div>
              <div>
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#A09DB7]">
                  Minutes
                </label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  placeholder="30"
                  className="mt-1.5 h-11 w-full rounded-xl border border-[#E3E1ED] bg-[#FAFAFD] px-3.5 text-xs outline-none focus:border-[#6D5DFB]"
                />
              </div>
            </div>

            {/* Category Select */}
            <div>
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#A09DB7]">
                App Category
              </label>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {(["Productive", "Social", "Entertainment", "Communication", "Utility"] as AppCategory[]).map(
                  (cat) => (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`rounded-xl border p-2 text-center text-xs font-bold transition ${
                        category === cat
                          ? "border-[#6D5DFB] bg-[#F1EFFF] text-[#6D5DFB]"
                          : "border-[#ECEAF3] bg-[#FAFAFD] text-[#6D6A82] hover:bg-[#F5F4FA]"
                      }`}
                    >
                      {cat}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Opens Count */}
            <div>
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#A09DB7]">
                Times Opened (optional)
              </label>
              <input
                type="number"
                min="0"
                value={opensCount}
                onChange={(e) => setOpensCount(e.target.value)}
                placeholder="e.g. 14 pickups"
                className="mt-1.5 h-11 w-full rounded-xl border border-[#E3E1ED] bg-[#FAFAFD] px-3.5 text-xs outline-none focus:border-[#6D5DFB]"
              />
            </div>

            <Button
              type="submit"
              className="h-11 w-full rounded-xl bg-[#6D5DFB] text-xs font-extrabold text-white shadow-md hover:bg-[#5949E8]"
            >
              <Plus className="mr-1.5 h-4 w-4" /> Save App Usage
            </Button>
          </form>
        </div>

        {/* Right: Usage Breakdown & Category Distribution */}
        <div className="space-y-5">
          {/* Category Distribution Bar */}
          <div className="rounded-3xl border border-[#E9E8F2] bg-white p-6 shadow-xs">
            <h3 className="font-display text-base font-extrabold text-[#26243A]">
              Usage Pattern by Category
            </h3>
            <div className="mt-4 flex h-3 w-full overflow-hidden rounded-full bg-[#F0EFF5]">
              {totalMinutes === 0 ? (
                <div className="w-full bg-[#E5E3ED]" />
              ) : (
                Object.entries(categoryTotals).map(([cat, mins]) => {
                  if (mins === 0) return null;
                  const pct = (mins / totalMinutes) * 100;
                  return (
                    <div
                      key={cat}
                      className={getCategoryColor(cat as AppCategory)}
                      style={{ width: `${pct}%` }}
                      title={`${cat}: ${Math.round(pct)}% (${Math.floor(mins / 60)}h ${mins % 60}m)`}
                    />
                  );
                })
              )}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5 text-xs">
              {Object.entries(categoryTotals).map(([cat, mins]) => (
                <div key={cat} className="rounded-xl bg-[#FAF9FD] p-2 text-center">
                  <div className="text-[10px] font-bold text-[#8E8B9E]">{cat}</div>
                  <div className="mt-0.5 text-sm font-extrabold text-[#26243A]">
                    {mins > 0 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : "0m"}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* List of Tracked Apps Today */}
          <div className="rounded-3xl border border-[#E9E8F2] bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#F0EEF6] pb-3">
              <h3 className="font-display text-base font-extrabold text-[#26243A]">
                Ranked App Consumption
              </h3>
              <span className="text-xs font-bold text-[#6D5DFB]">{totalHoursFormatted} total</span>
            </div>

            {currentLogs.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#AAA7BD]">
                No app usage recorded yet for today. Use the form to log your time.
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {currentLogs
                  .sort((a, b) => b.hours * 60 + b.minutes - (a.hours * 60 + a.minutes))
                  .map((log) => {
                    const logMins = log.hours * 60 + log.minutes;
                    const pctOfTotal = totalMinutes > 0 ? Math.round((logMins / totalMinutes) * 100) : 0;
                    return (
                      <div key={log.id} className="rounded-2xl border border-[#F2F1F8] p-3.5 hover:bg-[#FAF9FD] transition">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <span className="font-extrabold text-sm text-[#26243A]">{log.app}</span>
                            <span className={`rounded-md px-2 py-0.5 text-[9px] font-extrabold ${getCategoryColor(log.category)}`}>
                              {log.category}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-extrabold text-[#26243A]">
                              {log.hours > 0 ? `${log.hours}h ` : ""}
                              {log.minutes}m
                            </span>
                            <span className="text-[10px] font-bold text-[#8E8B9E]">({pctOfTotal}%)</span>
                            <button
                              onClick={() => handleDeleteLog(log.id)}
                              className="text-[#D0CEDB] hover:text-[#E96E58]"
                              title="Delete record"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Progress Bar of App Time */}
                        <div className="mt-2.5 h-1.5 w-full rounded-full bg-[#F0EEF6]">
                          <div
                            className="h-1.5 rounded-full bg-[#6D5DFB]"
                            style={{ width: `${Math.min(pctOfTotal, 100)}%` }}
                          />
                        </div>

                        {log.opensCount && (
                          <div className="mt-1.5 text-[10px] font-medium text-[#9E9AB3]">
                            Checked {log.opensCount} times today
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
