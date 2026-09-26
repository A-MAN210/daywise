import { useState } from "react";
import type { FormEvent } from "react";
import {
  UtensilsCrossed,
  Plus,
  Trash2,
  Calendar,
  Flame,
  Droplet,
  Coffee,
  Sun,
  Sunset,
  Moon,
  Cookie,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AppState, FoodLogItem, MealType } from "@/types/tracker";

interface FoodTrackerViewProps {
  state: AppState;
  updateState: (updater: (state: AppState) => AppState) => void;
  setActiveTab: (tab: string) => void;
}

export function FoodTrackerView({ state, updateState }: FoodTrackerViewProps) {
  const todayStr = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  
  // Add meal form state
  const [mealType, setMealType] = useState<MealType>("breakfast");
  const [foodName, setFoodName] = useState("");
  const [calories, setCalories] = useState("");
  const [notes, setNotes] = useState("");
  const [mealTime, setMealTime] = useState("");

  const allFoodLogs = state.foodLogs || [];
  const currentLogs = allFoodLogs.filter((item) => item.date === selectedDate);

  // Water tracker for selected date
  const waterLogs = state.waterLogs || [];
  const currentWater = waterLogs.find((w) => w.date === selectedDate)?.glasses || 0;

  const handleUpdateWater = (newGlasses: number) => {
    const safeGlasses = Math.max(0, Math.min(newGlasses, 16));
    updateState((prev) => {
      const existing = prev.waterLogs || [];
      const filtered = existing.filter((w) => w.date !== selectedDate);
      return {
        ...prev,
        waterLogs: [...filtered, { date: selectedDate, glasses: safeGlasses }],
      };
    });
  };

  const handleAddFood = (e: FormEvent) => {
    e.preventDefault();
    if (!foodName.trim()) return;

    const newItem: FoodLogItem = {
      id: Math.random().toString(36).slice(2, 10),
      date: selectedDate,
      type: mealType,
      name: foodName.trim(),
      calories: calories ? parseInt(calories, 10) : undefined,
      notes: notes.trim() || undefined,
      time: mealTime || new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    };

    updateState((prev) => ({
      ...prev,
      foodLogs: [newItem, ...(prev.foodLogs || [])],
    }));

    setFoodName("");
    setCalories("");
    setNotes("");
    setMealTime("");
  };

  const handleDeleteFood = (id: string) => {
    updateState((prev) => ({
      ...prev,
      foodLogs: (prev.foodLogs || []).filter((item) => item.id !== id),
    }));
  };

  // Shift date helper
  const shiftDate = (days: number) => {
    const d = new Date(selectedDate + "T12:00:00");
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().slice(0, 10));
  };

  // Group meals
  const breakfastItems = currentLogs.filter((i) => i.type === "breakfast");
  const lunchItems = currentLogs.filter((i) => i.type === "lunch");
  const dinnerItems = currentLogs.filter((i) => i.type === "dinner");
  const snackDrinkItems = currentLogs.filter((i) => i.type === "snack" || i.type === "drink");

  const totalCalories = currentLogs.reduce((sum, item) => sum + (item.calories || 0), 0);

  const getMealHeader = (type: MealType) => {
    switch (type) {
      case "breakfast":
        return { label: "Breakfast", icon: Sun, color: "text-[#E67E22] bg-[#FDF2E9]" };
      case "lunch":
        return { label: "Lunch", icon: UtensilsCrossed, color: "text-[#27AE60] bg-[#EAFAF1]" };
      case "dinner":
        return { label: "Dinner", icon: Sunset, color: "text-[#8E44AD] bg-[#F4ECF7]" };
      case "drink":
        return { label: "Drinks", icon: Coffee, color: "text-[#2980B9] bg-[#EBF5FB]" };
      case "snack":
        return { label: "Snacks", icon: Cookie, color: "text-[#D35400] bg-[#FBEEE6]" };
    }
  };

  const isToday = selectedDate === todayStr;
  const prettyDateStr = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(selectedDate + "T12:00:00"));

  return (
    <div className="space-y-6">
      {/* Header with Date Navigator */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#6D5DFB]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#6D5DFB]" />
            Nourishment & Habits
          </div>
          <h1 className="font-display text-[32px] font-extrabold leading-none tracking-[-0.055em] text-[#26243A] sm:text-[38px]">
            Daily Food Intake
          </h1>
          <p className="mt-2.5 max-w-[620px] text-sm leading-6 text-[#88859D]">
            Track your meals separately as Breakfast, Lunch, Dinner, plus extra drinks & snacks. Mindful nutrition fuels your best work.
          </p>
        </div>

        {/* Date Selector Navigation */}
        <div className="flex items-center gap-2 rounded-2xl border border-[#E9E8F2] bg-white p-1.5 shadow-sm">
          <button
            onClick={() => shiftDate(-1)}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-[#77748F] hover:bg-[#F6F4FF] hover:text-[#6D5DFB]"
            aria-label="Previous day"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2 px-2 text-xs font-extrabold text-[#26243A]">
            <Calendar className="h-3.5 w-3.5 text-[#6D5DFB]" />
            <span>{isToday ? `Today (${prettyDateStr})` : prettyDateStr}</span>
          </div>
          <button
            onClick={() => shiftDate(1)}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-[#77748F] hover:bg-[#F6F4FF] hover:text-[#6D5DFB]"
            aria-label="Next day"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          {!isToday && (
            <button
              onClick={() => setSelectedDate(todayStr)}
              className="ml-1 rounded-lg bg-[#F1EFFF] px-2 py-1 text-[10px] font-extrabold text-[#6D5DFB] hover:bg-[#E7E3FF]"
            >
              Today
            </button>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#E9E8F2] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#A09DB7]">Meals Logged</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#F1EFFF] text-[#6D5DFB]">
              <UtensilsCrossed className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-[#26243A]">{currentLogs.length}</div>
          <div className="mt-1 text-xs text-[#8E8B9E]">
            {breakfastItems.length > 0 ? "✓ Breakfast" : "· Breakfast pending"} · {lunchItems.length > 0 ? "✓ Lunch" : "· Lunch pending"}
          </div>
        </div>

        <div className="rounded-2xl border border-[#E9E8F2] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#A09DB7]">Estimated Calories</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FFF2DE] text-[#E67E22]">
              <Flame className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-[#26243A]">
            {totalCalories > 0 ? `${totalCalories} kcal` : "Tracked clean"}
          </div>
          <div className="mt-1 text-xs text-[#8E8B9E]">
            Across {currentLogs.filter((i) => i.calories).length} quantified items
          </div>
        </div>

        {/* Hydration Tracker */}
        <div className="rounded-2xl border border-[#E9E8F2] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#A09DB7]">Hydration</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#E8F4FD] text-[#2980B9]">
              <Droplet className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <div className="text-2xl font-extrabold text-[#26243A]">
              {currentWater} <span className="text-sm font-bold text-[#8E8B9E]">/ 8 glasses ({(currentWater * 0.25).toFixed(1)}L)</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleUpdateWater(currentWater - 1)}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#E9E8F2] text-xs font-extrabold hover:bg-[#F6F4FF]"
                title="Decrease 1 glass"
              >
                -
              </button>
              <button
                onClick={() => handleUpdateWater(currentWater + 1)}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#6D5DFB] text-xs font-extrabold text-white hover:bg-[#5949E8]"
                title="Add 1 glass"
              >
                +
              </button>
            </div>
          </div>
          <div className="mt-3 flex gap-1">
            {Array.from({ length: 8 }, (_, i) => (
              <div
                key={i}
                onClick={() => handleUpdateWater(i + 1)}
                className={`h-2 flex-1 rounded-full cursor-pointer transition ${
                  i < currentWater ? "bg-[#3498DB]" : "bg-[#EDF2F7]"
                }`}
                title={`Set to ${i + 1} glasses`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Food Logger Form + Daily Breakdown */}
      <div className="grid gap-6 lg:grid-cols-[1.1fr_1.9fr]">
        {/* Left: Quick Log Food Form */}
        <div className="rounded-3xl border border-[#E9E8F2] bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F6F4FF] text-[#6D5DFB]">
              <UtensilsCrossed className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-extrabold text-[#26243A]">Log Meal or Drink</h2>
              <p className="text-xs text-[#8E8B9E]">Add to {prettyDateStr}</p>
            </div>
          </div>

          <form onSubmit={handleAddFood} className="mt-5 space-y-4">
            {/* Meal Category Selectors */}
            <div>
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#A09DB7]">
                Meal Category
              </label>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {(["breakfast", "lunch", "dinner", "snack", "drink"] as MealType[]).map((type) => {
                  const info = getMealHeader(type);
                  const Icon = info.icon;
                  const isSelected = mealType === type;
                  return (
                    <button
                      type="button"
                      key={type}
                      onClick={() => setMealType(type)}
                      className={`flex items-center gap-1.5 rounded-xl border p-2 text-left text-xs font-bold transition ${
                        isSelected
                          ? "border-[#6D5DFB] bg-[#F1EFFF] text-[#6D5DFB]"
                          : "border-[#ECEAF3] bg-[#FAFAFD] text-[#6D6A82] hover:bg-[#F5F4FA]"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span className="capitalize">{type}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Meal Name Input */}
            <div>
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#A09DB7]">
                What did you eat or drink?
              </label>
              <input
                type="text"
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                placeholder="e.g. Scrambled eggs, sourdough & avocado"
                className="mt-1.5 h-11 w-full rounded-xl border border-[#E3E1ED] bg-[#FAFAFD] px-3.5 text-xs outline-none focus:border-[#6D5DFB] focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#A09DB7]">
                  Calories (optional)
                </label>
                <input
                  type="number"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  placeholder="e.g. 420"
                  className="mt-1.5 h-11 w-full rounded-xl border border-[#E3E1ED] bg-[#FAFAFD] px-3.5 text-xs outline-none focus:border-[#6D5DFB] focus:bg-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#A09DB7]">
                  Time of Day
                </label>
                <input
                  type="text"
                  value={mealTime}
                  onChange={(e) => setMealTime(e.target.value)}
                  placeholder="e.g. 8:30 AM"
                  className="mt-1.5 h-11 w-full rounded-xl border border-[#E3E1ED] bg-[#FAFAFD] px-3.5 text-xs outline-none focus:border-[#6D5DFB] focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#A09DB7]">
                Notes / Ingredients
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Low sodium, high protein, felt energized"
                className="mt-1.5 h-11 w-full rounded-xl border border-[#E3E1ED] bg-[#FAFAFD] px-3.5 text-xs outline-none focus:border-[#6D5DFB] focus:bg-white"
              />
            </div>

            <Button
              type="submit"
              className="h-11 w-full rounded-xl bg-[#6D5DFB] text-xs font-extrabold text-white shadow-md hover:bg-[#5949E8]"
            >
              <Plus className="mr-1.5 h-4 w-4" /> Save Meal Entry
            </Button>
          </form>

          {/* Quick Presets */}
          <div className="mt-6 border-t border-[#F0EEF6] pt-4">
            <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#A09DB7]">
              <Sparkles className="h-3.5 w-3.5 text-[#F4BC56]" />
              Quick Common Items
            </div>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {[
                { name: "Oatmeal with berries", type: "breakfast" as MealType, cal: 320 },
                { name: "Green smoothie", type: "drink" as MealType, cal: 180 },
                { name: "Quinoa salad bowl", type: "lunch" as MealType, cal: 480 },
                { name: "Grilled chicken / tofu wrap", type: "lunch" as MealType, cal: 520 },
                { name: "Roasted vegetables & rice", type: "dinner" as MealType, cal: 450 },
                { name: "Almonds & walnuts", type: "snack" as MealType, cal: 200 },
                { name: "Herbal chamomile tea", type: "drink" as MealType, cal: 5 },
              ].map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => {
                    setFoodName(preset.name);
                    setMealType(preset.type);
                    setCalories(String(preset.cal));
                  }}
                  className="rounded-lg border border-[#EAE8F2] bg-[#FAF9FF] px-2.5 py-1 text-[11px] font-bold text-[#64607D] hover:border-[#6D5DFB] hover:text-[#6D5DFB]"
                >
                  + {preset.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Daily Breakdown by Meal Categories */}
        <div className="space-y-4">
          {[
            { type: "breakfast" as MealType, title: "Breakfast", icon: Sun, items: breakfastItems, color: "text-[#E67E22] bg-[#FDF2E9]" },
            { type: "lunch" as MealType, title: "Lunch", icon: UtensilsCrossed, items: lunchItems, color: "text-[#27AE60] bg-[#EAFAF1]" },
            { type: "dinner" as MealType, title: "Dinner", icon: Sunset, items: dinnerItems, color: "text-[#8E44AD] bg-[#F4ECF7]" },
            { type: "snack" as MealType, title: "Drinks & Snacks", icon: Cookie, items: snackDrinkItems, color: "text-[#D35400] bg-[#FBEEE6]" },
          ].map((section) => {
            const Icon = section.icon;
            return (
              <div key={section.title} className="rounded-3xl border border-[#E9E8F2] bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between border-b border-[#F2F1F8] pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className={`flex h-8 w-8 items-center justify-center rounded-xl ${section.color}`}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <h3 className="font-display text-base font-extrabold text-[#26243A]">{section.title}</h3>
                      <p className="text-[11px] text-[#A09DB7]">
                        {section.items.length === 0 ? "No items logged yet" : `${section.items.length} logged`}
                      </p>
                    </div>
                  </div>
                  {section.items.length > 0 && (
                    <span className="text-xs font-bold text-[#6D5DFB]">
                      {section.items.reduce((s, i) => s + (i.calories || 0), 0)} kcal
                    </span>
                  )}
                </div>

                {section.items.length === 0 ? (
                  <div className="py-4 text-center text-xs text-[#AAA7BD]">
                    No {section.title.toLowerCase()} recorded for this date.
                  </div>
                ) : (
                  <div className="mt-3 divide-y divide-[#F6F5FB]">
                    {section.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between py-2.5 text-xs">
                        <div className="min-w-0 flex-1 pr-3">
                          <div className="font-extrabold text-[#26243A]">{item.name}</div>
                          <div className="flex items-center gap-2 text-[11px] text-[#9390A7]">
                            {item.time && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" /> {item.time}
                              </span>
                            )}
                            {item.notes && <span>· {item.notes}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {item.calories && (
                            <span className="rounded-md bg-[#FFF7ED] px-2 py-0.5 text-[10px] font-extrabold text-[#D35400]">
                              {item.calories} kcal
                            </span>
                          )}
                          <button
                            onClick={() => handleDeleteFood(item.id)}
                            className="text-[#D0CEDB] hover:text-[#E96E58]"
                            title="Delete entry"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
