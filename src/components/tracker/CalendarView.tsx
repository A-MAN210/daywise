import { useState, useMemo } from "react";
import type { FormEvent } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  Tag,
  AlertCircle,
  CheckCircle2,
  Bell,
  BellRing,
  Trash2,
  Edit2,
  Check,
  X,
  ListTodo,
  Sparkles,
  Calendar as CalendarIcon,
  Volume2,
  Filter,
  CheckSquare,
  Square,
  Flame,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type {
  AppState,
  CalendarEvent,
  CalendarEventCategory,
  CalendarEventPriority,
  EventChecklistItem,
} from "@/types/tracker";
import { playChime } from "@/utils/notificationAudio";

interface CalendarViewProps {
  state: AppState;
  updateState: (updater: (state: AppState) => AppState) => void;
  setActiveTab: (tab: string) => void;
}

const CATEGORIES: { label: CalendarEventCategory; color: string; bg: string; text: string }[] = [
  { label: "Meeting", color: "#6D5DFB", bg: "bg-[#F1EFFF]", text: "text-[#6D5DFB]" },
  { label: "Work", color: "#3B82F6", bg: "bg-[#EFF6FF]", text: "text-[#2563EB]" },
  { label: "Personal", color: "#10B981", bg: "bg-[#ECFDF5]", text: "text-[#059669]" },
  { label: "Deadline", color: "#EF4444", bg: "bg-[#FEF2F2]", text: "text-[#DC2626]" },
  { label: "Health", color: "#14B8A6", bg: "bg-[#F0FDFA]", text: "text-[#0D9488]" },
  { label: "Reminder", color: "#F59E0B", bg: "bg-[#FFFBEB]", text: "text-[#D97706]" },
  { label: "Task", color: "#8B5CF6", bg: "bg-[#F5F3FF]", text: "text-[#7C3AED]" },
  { label: "Celebration", color: "#EC4899", bg: "bg-[#FDF2F8]", text: "text-[#DB2777]" },
  { label: "Focus", color: "#6366F1", bg: "bg-[#EEF2FF]", text: "text-[#4F46E5]" },
];

function getCategoryMeta(category: CalendarEventCategory) {
  return (
    CATEGORIES.find((c) => c.label === category) || {
      label: category,
      color: "#6D5DFB",
      bg: "bg-[#F1EFFF]",
      text: "text-[#6D5DFB]",
    }
  );
}

function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function CalendarView({ state, updateState, setActiveTab }: CalendarViewProps) {
  const today = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => formatDateKey(today), [today]);

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(todayStr);
  const [viewMode, setViewMode] = useState<"month" | "upcoming">("month");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");

  // Modal state for Add/Edit Event
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [eventDate, setEventDate] = useState(selectedDateStr);
  const [isAllDay, setIsAllDay] = useState(false);
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("11:00");
  const [category, setCategory] = useState<CalendarEventCategory>("Meeting");
  const [priority, setPriority] = useState<CalendarEventPriority>("normal");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderTiming, setReminderTiming] = useState<
    "at_time" | "15_min_before" | "1_hour_before" | "morning_of" | "1_day_before"
  >("morning_of");

  // Checklist builder inside modal
  const [checklist, setChecklist] = useState<EventChecklistItem[]>([]);
  const [newChecklistText, setNewChecklistText] = useState("");
  const [testNotificationFeedback, setTestNotificationFeedback] = useState<string | null>(null);

  const events = useMemo(() => state.events || [], [state.events]);

  // Month navigation helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = currentDate.toLocaleString("default", { month: "long" });

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const jumpToToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDateStr(formatDateKey(now));
  };

  // Calendar month days calculation
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 is Sunday
    const daysInMonth = lastDayOfMonth.getDate();

    const days: { dateStr: string; dayNumber: number; isCurrentMonth: boolean; isToday: boolean }[] = [];

    // Prev month padding
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const d = prevMonthLastDay - i;
      const date = new Date(year, month - 1, d);
      days.push({
        dateStr: formatDateKey(date),
        dayNumber: d,
        isCurrentMonth: false,
        isToday: formatDateKey(date) === todayStr,
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const str = formatDateKey(date);
      days.push({
        dateStr: str,
        dayNumber: i,
        isCurrentMonth: true,
        isToday: str === todayStr,
      });
    }

    // Next month padding to complete 35 or 42 cells
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const date = new Date(year, month + 1, i);
      days.push({
        dateStr: formatDateKey(date),
        dayNumber: i,
        isCurrentMonth: false,
        isToday: formatDateKey(date) === todayStr,
      });
    }

    return days;
  }, [year, month, todayStr]);

  // Events map by date
  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    events.forEach((ev) => {
      const existing = map.get(ev.date) || [];
      existing.push(ev);
      map.set(ev.date, existing);
    });
    return map;
  }, [events]);

  // Events for selected date
  const selectedDayEvents = useMemo(() => {
    let list = eventsByDate.get(selectedDateStr) || [];
    if (categoryFilter !== "All") {
      list = list.filter((e) => e.category === categoryFilter);
    }
    return [...list].sort((a, b) => {
      if (a.allDay && !b.allDay) return -1;
      if (!a.allDay && b.allDay) return 1;
      return (a.time || "").localeCompare(b.time || "");
    });
  }, [eventsByDate, selectedDateStr, categoryFilter]);

  // Today's events with active reminders
  const todayEvents = useMemo(() => {
    return (eventsByDate.get(todayStr) || []).filter((e) => e.reminderEnabled);
  }, [eventsByDate, todayStr]);

  // Upcoming events
  const upcomingEvents = useMemo(() => {
    return events
      .filter((e) => e.date >= todayStr)
      .sort((a, b) => (a.date === b.date ? (a.time || "").localeCompare(b.time || "") : a.date.localeCompare(b.date)));
  }, [events, todayStr]);

  // Open modal for new event
  const handleOpenAddModal = (dateToUse?: string) => {
    setEditingEvent(null);
    setTitle("");
    setEventDate(dateToUse || selectedDateStr);
    setIsAllDay(false);
    setStartTime("10:00");
    setEndTime("11:00");
    setCategory("Meeting");
    setPriority("normal");
    setLocation("");
    setDescription("");
    setReminderEnabled(true);
    setReminderTiming("morning_of");
    setChecklist([]);
    setNewChecklistText("");
    setTestNotificationFeedback(null);
    setIsModalOpen(true);
  };

  // Open modal to edit existing event
  const handleOpenEditModal = (event: CalendarEvent) => {
    setEditingEvent(event);
    setTitle(event.title);
    setEventDate(event.date);
    setIsAllDay(!!event.allDay);
    setStartTime(event.time || "10:00");
    setEndTime(event.endTime || "11:00");
    setCategory(event.category);
    setPriority(event.priority || "normal");
    setLocation(event.location || "");
    setDescription(event.description || "");
    setReminderEnabled(event.reminderEnabled !== false);
    setReminderTiming(event.reminderTiming || "morning_of");
    setChecklist(event.checklist || []);
    setNewChecklistText("");
    setTestNotificationFeedback(null);
    setIsModalOpen(true);
  };

  const handleAddChecklistItem = () => {
    if (!newChecklistText.trim()) return;
    setChecklist((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).slice(2, 9),
        title: newChecklistText.trim(),
        completed: false,
      },
    ]);
    setNewChecklistText("");
  };

  const handleRemoveChecklistItem = (id: string) => {
    setChecklist((prev) => prev.filter((item) => item.id !== id));
  };

  const handleToggleChecklistItemInInspector = (eventId: string, checklistId: string) => {
    updateState((prev) => {
      const curEvents = prev.events || [];
      return {
        ...prev,
        events: curEvents.map((ev) => {
          if (ev.id !== eventId) return ev;
          const updatedChecklist = (ev.checklist || []).map((c) =>
            c.id === checklistId ? { ...c, completed: !c.completed } : c
          );
          return { ...ev, checklist: updatedChecklist };
        }),
      };
    });
  };

  const handleToggleEventCompleted = (eventId: string) => {
    updateState((prev) => {
      const curEvents = prev.events || [];
      return {
        ...prev,
        events: curEvents.map((ev) => (ev.id === eventId ? { ...ev, isCompleted: !ev.isCompleted } : ev)),
      };
    });
  };

  const handleDeleteEvent = (eventId: string) => {
    updateState((prev) => ({
      ...prev,
      events: (prev.events || []).filter((e) => e.id !== eventId),
    }));
  };

  const handleSaveEvent = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const payload: CalendarEvent = {
      id: editingEvent ? editingEvent.id : Math.random().toString(36).slice(2, 11),
      title: title.trim(),
      date: eventDate,
      time: isAllDay ? undefined : startTime,
      endTime: isAllDay ? undefined : endTime,
      allDay: isAllDay,
      category,
      priority,
      location: location.trim() || undefined,
      description: description.trim() || undefined,
      checklist: checklist.length > 0 ? checklist : undefined,
      reminderEnabled,
      reminderTiming,
      isCompleted: editingEvent ? editingEvent.isCompleted : false,
      createdAt: editingEvent ? editingEvent.createdAt : new Date().toISOString(),
    };

    updateState((prev) => {
      const curEvents = prev.events || [];
      if (editingEvent) {
        return {
          ...prev,
          events: curEvents.map((item) => (item.id === editingEvent.id ? payload : item)),
        };
      } else {
        return {
          ...prev,
          events: [...curEvents, payload],
        };
      }
    });

    // If reminder is enabled and date is today, trigger test chime and browser notification
    if (reminderEnabled) {
      playChime();
    }

    setIsModalOpen(false);
  };

  const handleTestReminder = () => {
    playChime();
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification(`DayWise Reminder: ${title || "Important Event"}`, {
          body: `Scheduled for ${eventDate} at ${isAllDay ? "All day" : startTime}. Don't forget your tasks!`,
          icon: "/favicon.ico",
        });
        setTestNotificationFeedback("✓ Notification & sound triggered successfully!");
      } else {
        Notification.requestPermission().then((perm) => {
          if (perm === "granted") {
            new Notification(`DayWise Reminder: ${title || "Important Event"}`, {
              body: `Scheduled for ${eventDate} at ${isAllDay ? "All day" : startTime}. Don't forget your tasks!`,
              icon: "/favicon.ico",
            });
            setTestNotificationFeedback("✓ Notification enabled & sent!");
          } else {
            setTestNotificationFeedback("⚠️ Sound chime played. Browser notifications blocked in settings.");
          }
        });
      }
    } else {
      setTestNotificationFeedback("✓ Gentle audio chime played!");
    }
  };

  // Format date readable
  const selectedDateFormatted = useMemo(() => {
    try {
      const parts = selectedDateStr.split("-").map(Number);
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      return new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }).format(d);
    } catch {
      return selectedDateStr;
    }
  }, [selectedDateStr]);

  const isTodaySelected = selectedDateStr === todayStr;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#6D5DFB]">
            <CalendarDays className="h-4 w-4" />
            <span>Interactive Calendar & Reminders</span>
          </div>
          <h1 className="font-display text-[32px] font-extrabold leading-none tracking-[-0.05em] text-[#26243A] sm:text-[40px]">
            Schedule & Reminders
          </h1>
          <p className="mt-2.5 max-w-[660px] text-sm leading-6 text-[#88859D]">
            Add details for any particular events and get reminders on that exact day so you never miss a task or
            commitment.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            onClick={jumpToToday}
            variant="outline"
            className="h-10 rounded-xl border-[#E4E1F0] bg-white px-3.5 text-xs font-bold text-[#26243A] hover:bg-[#F8F7FD]"
          >
            Today
          </Button>

          <div className="flex rounded-xl border border-[#E4E1F0] bg-white p-1">
            <button
              onClick={() => setViewMode("month")}
              className={`rounded-lg px-3 py-1 text-xs font-extrabold transition ${
                viewMode === "month" ? "bg-[#6D5DFB] text-white shadow-xs" : "text-[#77748F] hover:text-[#26243A]"
              }`}
            >
              Month Grid
            </button>
            <button
              onClick={() => setViewMode("upcoming")}
              className={`rounded-lg px-3 py-1 text-xs font-extrabold transition ${
                viewMode === "upcoming" ? "bg-[#6D5DFB] text-white shadow-xs" : "text-[#77748F] hover:text-[#26243A]"
              }`}
            >
              Upcoming ({upcomingEvents.length})
            </button>
          </div>

          <Button
            onClick={() => handleOpenAddModal(selectedDateStr)}
            className="h-10 rounded-xl bg-[#6D5DFB] px-4 text-xs font-extrabold text-white shadow-[0_8px_18px_rgba(109,93,251,0.22)] hover:bg-[#5949E8]"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Add Event
          </Button>
        </div>
      </div>

      {/* Today's Active Reminders Alert Box */}
      {todayEvents.length > 0 && (
        <div className="rounded-2xl border border-[#FFD9B5] bg-[#FFF8ED] p-4 text-[#8C4A10]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FFE4C4] text-[#D97706]">
                <BellRing className="h-5 w-5 animate-bounce" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#D97706]">
                    Today's Reminders Active
                  </span>
                  <span className="rounded-full bg-[#FFE4C4] px-2 py-0.5 text-[10px] font-extrabold text-[#8C4A10]">
                    {todayEvents.length} {todayEvents.length === 1 ? "Event" : "Events"} Today
                  </span>
                </div>
                <div className="mt-1 text-sm font-bold text-[#26243A]">
                  {todayEvents.map((e) => e.title).join(" · ")}
                </div>
                <div className="mt-0.5 text-xs text-[#9B6B37]">
                  All scheduled alerts for today will remind you so you don't forget any other tasks.
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSelectedDateStr(todayStr);
                  playChime();
                }}
                className="rounded-xl bg-[#D97706] px-3.5 py-2 text-xs font-extrabold text-white shadow-xs hover:bg-[#B45309]"
              >
                View Today's Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Calendar Section */}
      <div className="grid gap-6 lg:grid-cols-[1.35fr_0.85fr]">
        {/* Left Column: Calendar Grid or Upcoming List */}
        <div className="rounded-3xl border border-[#E9E8F2] bg-white p-5 shadow-[0_8px_24px_rgba(48,44,88,0.03)] sm:p-6">
          {viewMode === "month" ? (
            <>
              {/* Month Navigation Header */}
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F1EFFF] text-[#6D5DFB]">
                    <CalendarIcon className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="font-display text-2xl font-extrabold tracking-[-0.04em] text-[#26243A]">
                      {monthName} {year}
                    </h2>
                    <p className="text-xs text-[#8E8B9E]">Select any date to view and manage its events</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={prevMonth}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E9E8F2] text-[#6D6A82] hover:bg-[#F6F4FF] hover:text-[#6D5DFB]"
                    aria-label="Previous month"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={nextMonth}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E9E8F2] text-[#6D6A82] hover:bg-[#F6F4FF] hover:text-[#6D5DFB]"
                    aria-label="Next month"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Day of Week Headers */}
              <div className="mb-2 grid grid-cols-7 text-center text-[11px] font-extrabold uppercase tracking-wider text-[#A09DB7]">
                <span>Sun</span>
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                {calendarDays.map((cell, idx) => {
                  const dayEvents = eventsByDate.get(cell.dateStr) || [];
                  const isSelected = cell.dateStr === selectedDateStr;
                  const hasEvents = dayEvents.length > 0;
                  const hasUrgent = dayEvents.some((e) => e.priority === "urgent");

                  return (
                    <button
                      key={`${cell.dateStr}-${idx}`}
                      onClick={() => setSelectedDateStr(cell.dateStr)}
                      className={`group relative flex min-h-[76px] flex-col rounded-2xl p-2 text-left transition sm:min-h-[92px] ${
                        isSelected
                          ? "bg-[#6D5DFB] text-white shadow-[0_8px_18px_rgba(109,93,251,0.25)] ring-2 ring-[#6D5DFB]"
                          : cell.isToday
                          ? "border-2 border-[#6D5DFB]/40 bg-[#F7F5FF] text-[#26243A]"
                          : cell.isCurrentMonth
                          ? "border border-[#F0EEF6] bg-white text-[#26243A] hover:border-[#6D5DFB]/40 hover:bg-[#FAF9FD]"
                          : "border border-transparent bg-[#FAFAFC] text-[#C1BED0]"
                      }`}
                    >
                      {/* Day Number Header */}
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-extrabold ${
                            isSelected
                              ? "text-white"
                              : cell.isToday
                              ? "text-[#6D5DFB]"
                              : cell.isCurrentMonth
                              ? "text-[#26243A]"
                              : "text-[#B9B6C8]"
                          }`}
                        >
                          {cell.dayNumber}
                        </span>

                        {cell.isToday && !isSelected && (
                          <span className="rounded-full bg-[#6D5DFB] px-1.5 py-0.2 text-[8px] font-black uppercase text-white">
                            Today
                          </span>
                        )}

                        {hasUrgent && (
                          <span
                            className={`h-2 w-2 rounded-full ${isSelected ? "bg-white" : "bg-[#EF4444]"}`}
                            title="Urgent event"
                          />
                        )}
                      </div>

                      {/* Event Dots & Mini Preview */}
                      <div className="mt-1 flex-1 space-y-1 overflow-hidden">
                        {dayEvents.slice(0, 2).map((ev) => {
                          const meta = getCategoryMeta(ev.category);
                          return (
                            <div
                              key={ev.id}
                              className={`truncate rounded px-1 py-0.5 text-[9px] font-extrabold leading-tight ${
                                isSelected ? "bg-white/20 text-white" : `${meta.bg} ${meta.text}`
                              }`}
                            >
                              {ev.time ? `${ev.time} ` : ""}
                              {ev.title}
                            </div>
                          );
                        })}

                        {dayEvents.length > 2 && (
                          <div
                            className={`text-[9px] font-bold ${
                              isSelected ? "text-white/80" : "text-[#8E8B9E]"
                            }`}
                          >
                            +{dayEvents.length - 2} more
                          </div>
                        )}
                      </div>

                      {/* Reminder indicator bell */}
                      {dayEvents.some((e) => e.reminderEnabled) && (
                        <div className="mt-auto flex items-center justify-end">
                          <Bell
                            className={`h-2.5 w-2.5 ${isSelected ? "text-white/80" : "text-[#D97706]"}`}
                          />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            /* Upcoming Agenda View */
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#F0EEF6] pb-3">
                <h3 className="font-display text-xl font-extrabold text-[#26243A]">Upcoming Events & Tasks</h3>
                <span className="text-xs font-bold text-[#8E8B9E]">{upcomingEvents.length} events scheduled</span>
              </div>

              {upcomingEvents.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F6F4FF] text-[#6D5DFB]">
                    <CalendarDays className="h-6 w-6" />
                  </div>
                  <h4 className="mt-3 text-sm font-extrabold text-[#26243A]">No upcoming events scheduled</h4>
                  <p className="mt-1 text-xs text-[#8E8B9E]">
                    Add upcoming deadlines, meetings, or tasks to receive automated reminders.
                  </p>
                  <Button
                    onClick={() => handleOpenAddModal(todayStr)}
                    className="mt-4 h-9 rounded-xl bg-[#6D5DFB] px-4 text-xs font-extrabold text-white"
                  >
                    <Plus className="mr-1 h-3.5 w-3.5" /> Schedule Event
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingEvents.map((ev) => {
                    const meta = getCategoryMeta(ev.category);
                    const isTodayEv = ev.date === todayStr;
                    return (
                      <div
                        key={ev.id}
                        className={`flex flex-col justify-between gap-3 rounded-2xl border p-4 transition sm:flex-row sm:items-center ${
                          isTodayEv
                            ? "border-[#FFD9B5] bg-[#FFFBF5]"
                            : "border-[#ECEAF5] bg-white hover:border-[#6D5DFB]/30"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold ${
                              isTodayEv ? "bg-[#FFE4C4] text-[#B45309]" : `${meta.bg} ${meta.text}`
                            }`}
                          >
                            <CalendarDays className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-extrabold text-[#26243A]">{ev.title}</span>
                              <span
                                className={`rounded-md px-2 py-0.5 text-[10px] font-extrabold ${meta.bg} ${meta.text}`}
                              >
                                {ev.category}
                              </span>
                              {ev.priority === "urgent" && (
                                <span className="rounded-md bg-[#FEE2E2] px-1.5 py-0.5 text-[9px] font-black text-[#DC2626]">
                                  URGENT
                                </span>
                              )}
                              {isTodayEv && (
                                <span className="rounded-md bg-[#FEF3C7] px-1.5 py-0.5 text-[9px] font-black text-[#D97706]">
                                  DUE TODAY
                                </span>
                              )}
                            </div>

                            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-[#8E8B9E]">
                              <span className="flex items-center gap-1 font-bold text-[#45425E]">
                                <CalendarIcon className="h-3.5 w-3.5 text-[#6D5DFB]" /> {ev.date}
                              </span>
                              <span className="flex items-center gap-1 font-semibold">
                                <Clock className="h-3.5 w-3.5" /> {ev.allDay ? "All Day" : ev.time || "No time"}
                              </span>
                              {ev.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3.5 w-3.5" /> {ev.location}
                                </span>
                              )}
                            </div>

                            {ev.description && (
                              <p className="mt-1 text-xs text-[#6D6A82] line-clamp-1">{ev.description}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <button
                            onClick={() => {
                              setSelectedDateStr(ev.date);
                              setViewMode("month");
                            }}
                            className="rounded-xl border border-[#ECEAF5] bg-white px-3 py-1.5 text-xs font-bold text-[#6D5DFB] hover:bg-[#F6F4FF]"
                          >
                            View Day
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(ev)}
                            className="rounded-xl p-1.5 text-[#8E8B9E] hover:bg-[#F6F4FF] hover:text-[#6D5DFB]"
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Selected Day Inspector & Task Schedule */}
        <div className="flex flex-col gap-5">
          {/* Day Inspector Card */}
          <div className="rounded-3xl border border-[#E9E8F2] bg-white p-5 shadow-[0_8px_24px_rgba(48,44,88,0.03)] sm:p-6">
            <div className="flex items-center justify-between border-b border-[#F0EEF6] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#6D5DFB]">
                    {isTodaySelected ? "TODAY'S SCHEDULE" : "SELECTED DAY"}
                  </span>
                  {isTodaySelected && (
                    <span className="rounded-full bg-[#E8F8F0] px-2 py-0.5 text-[9px] font-extrabold text-[#27AE60]">
                      Active
                    </span>
                  )}
                </div>
                <h3 className="mt-1 font-display text-lg font-extrabold text-[#26243A]">
                  {selectedDateFormatted}
                </h3>
              </div>

              <Button
                onClick={() => handleOpenAddModal(selectedDateStr)}
                size="sm"
                className="h-8 rounded-xl bg-[#6D5DFB] px-3 text-xs font-bold text-white hover:bg-[#5949E8]"
              >
                <Plus className="mr-1 h-3.5 w-3.5" /> Add
              </Button>
            </div>

            {/* Category Filter Pills */}
            <div className="mt-4 flex flex-wrap gap-1.5">
              <button
                onClick={() => setCategoryFilter("All")}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-extrabold transition ${
                  categoryFilter === "All"
                    ? "bg-[#292741] text-white"
                    : "bg-[#F5F4FA] text-[#77748F] hover:bg-[#EBE9F5]"
                }`}
              >
                All ({eventsByDate.get(selectedDateStr)?.length || 0})
              </button>
              {CATEGORIES.slice(0, 5).map((cat) => (
                <button
                  key={cat.label}
                  onClick={() => setCategoryFilter(cat.label)}
                  className={`rounded-lg px-2 py-1 text-[10px] font-extrabold transition ${
                    categoryFilter === cat.label
                      ? `${cat.bg} ${cat.text} ring-1 ring-current`
                      : "bg-[#FAF9FD] text-[#8E8B9E] hover:bg-[#F1EFFF]"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Events for this day */}
            <div className="mt-4 space-y-3">
              {selectedDayEvents.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#E0DDF0] bg-[#FAF9FD] p-6 text-center">
                  <CalendarDays className="mx-auto h-8 w-8 text-[#B0ACC5]" />
                  <p className="mt-2 text-xs font-extrabold text-[#26243A]">No events scheduled for this day</p>
                  <p className="mt-0.5 text-[11px] text-[#8E8B9E]">
                    Add events, meetings, or deadlines with customizable reminders.
                  </p>
                  <button
                    onClick={() => handleOpenAddModal(selectedDateStr)}
                    className="mt-3 inline-flex items-center gap-1 rounded-xl bg-[#6D5DFB] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#5949E8]"
                  >
                    <Plus className="h-3.5 w-3.5" /> Schedule Event on This Day
                  </button>
                </div>
              ) : (
                selectedDayEvents.map((ev) => {
                  const meta = getCategoryMeta(ev.category);
                  const isDone = !!ev.isCompleted;

                  return (
                    <div
                      key={ev.id}
                      className={`rounded-2xl border p-4 transition ${
                        isDone
                          ? "border-[#EFEFF5] bg-[#FBFBFC] opacity-75"
                          : ev.priority === "urgent"
                          ? "border-[#FECACA] bg-[#FEF2F2]/60"
                          : "border-[#ECEAF5] bg-white shadow-xs"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5">
                          <button
                            onClick={() => handleToggleEventCompleted(ev.id)}
                            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border-2 transition ${
                              isDone
                                ? "border-[#27AE60] bg-[#27AE60] text-white"
                                : "border-[#D0CEDB] hover:border-[#6D5DFB]"
                            }`}
                            title={isDone ? "Mark Pending" : "Mark Completed"}
                          >
                            {isDone && <Check className="h-3 w-3 stroke-[3]" />}
                          </button>

                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h4
                                className={`text-sm font-extrabold ${
                                  isDone ? "text-[#8E8B9E] line-through" : "text-[#26243A]"
                                }`}
                              >
                                {ev.title}
                              </h4>
                              <span
                                className={`rounded px-1.5 py-0.5 text-[9px] font-extrabold ${meta.bg} ${meta.text}`}
                              >
                                {ev.category}
                              </span>
                              {ev.priority === "urgent" && (
                                <span className="rounded bg-[#FEE2E2] px-1.5 py-0.5 text-[9px] font-black text-[#DC2626]">
                                  URGENT
                                </span>
                              )}
                            </div>

                            <div className="mt-1 flex flex-wrap items-center gap-2.5 text-[11px] text-[#8E8B9E]">
                              <span className="flex items-center gap-1 font-bold text-[#45425E]">
                                <Clock className="h-3 w-3 text-[#6D5DFB]" />
                                {ev.allDay ? "All Day" : `${ev.time}${ev.endTime ? ` - ${ev.endTime}` : ""}`}
                              </span>
                              {ev.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3 text-[#A09DB7]" />
                                  {ev.location}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Event actions */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditModal(ev)}
                            className="rounded-lg p-1 text-[#AAA7BD] hover:bg-[#F1EFFF] hover:text-[#6D5DFB]"
                            title="Edit Event"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(ev.id)}
                            className="rounded-lg p-1 text-[#AAA7BD] hover:bg-[#FFF0EC] hover:text-[#E96E58]"
                            title="Delete Event"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Description / Notes */}
                      {ev.description && (
                        <p className="mt-2 rounded-xl bg-[#FAF9FD] p-2.5 text-xs leading-5 text-[#55526D]">
                          {ev.description}
                        </p>
                      )}

                      {/* Checklist / Subtasks inside event so user doesn't forget details */}
                      {ev.checklist && ev.checklist.length > 0 && (
                        <div className="mt-3 border-t border-[#F2F0F8] pt-2.5">
                          <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#A09DB7]">
                            Tasks for this event ({ev.checklist.filter((c) => c.completed).length}/{ev.checklist.length})
                          </div>
                          <div className="mt-1.5 space-y-1">
                            {ev.checklist.map((item) => (
                              <button
                                key={item.id}
                                onClick={() => handleToggleChecklistItemInInspector(ev.id, item.id)}
                                className="flex w-full items-center gap-2 rounded-lg px-1.5 py-1 text-left text-xs font-semibold text-[#45425E] hover:bg-[#F6F4FF]"
                              >
                                {item.completed ? (
                                  <CheckSquare className="h-3.5 w-3.5 text-[#27AE60]" />
                                ) : (
                                  <Square className="h-3.5 w-3.5 text-[#B6B3C6]" />
                                )}
                                <span className={item.completed ? "text-[#9E9BAE] line-through" : ""}>
                                  {item.title}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Reminder status badge */}
                      {ev.reminderEnabled && (
                        <div className="mt-3 flex items-center justify-between rounded-xl bg-[#FFF9EE] px-2.5 py-1.5 text-[11px] font-bold text-[#A8660B]">
                          <span className="flex items-center gap-1.5">
                            <Bell className="h-3.5 w-3.5 text-[#D97706]" />
                            <span>
                              Reminder:{" "}
                              {ev.reminderTiming === "morning_of"
                                ? "Morning of this day (9:00 AM)"
                                : ev.reminderTiming === "at_time"
                                ? "At event start time"
                                : ev.reminderTiming === "15_min_before"
                                ? "15 minutes before"
                                : ev.reminderTiming === "1_hour_before"
                                ? "1 hour before"
                                : "1 day before"}
                            </span>
                          </span>
                          <button
                            onClick={() => {
                              playChime();
                              if ("Notification" in window && Notification.permission === "granted") {
                                new Notification(`Reminder: ${ev.title}`, {
                                  body: `Scheduled for ${ev.date} at ${ev.time || "All day"}`,
                                });
                              }
                            }}
                            className="text-[10px] font-extrabold underline hover:text-[#78350F]"
                          >
                            Test Alert
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Daily Alignment Card */}
          <div className="rounded-3xl border border-[#E9E8F2] bg-[#292741] p-5 text-white shadow-md">
            <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-widest text-[#F4BC56]">
              <Sparkles className="h-3.5 w-3.5" /> Never Forget a Task
            </div>
            <h4 className="mt-2 font-display text-lg font-extrabold text-white">
              Event Reminders on DayWise
            </h4>
            <p className="mt-1 text-xs leading-5 text-[#C7C3DE]">
              Every event you create on a specific date will automatically notify you through audio chimes and native
              push alerts on that day so you stay completely on schedule.
            </p>
            <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-xs">
              <span className="text-[#A29EBA]">Total events logged: {events.length}</span>
              <button
                onClick={() => setActiveTab("tasks")}
                className="flex items-center gap-1 font-bold text-[#F4BC56] hover:underline"
              >
                Go to Tasks queue <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add / Edit Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-[#E9E8F2] bg-white p-6 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#F0EEF6] pb-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F1EFFF] text-[#6D5DFB]">
                  <CalendarDays className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-display text-xl font-extrabold text-[#26243A]">
                    {editingEvent ? "Edit Event Details" : "Add Particular Event"}
                  </h3>
                  <p className="text-xs text-[#8E8B9E]">Set details and automated reminders on this day</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl p-1.5 text-[#A09DB7] hover:bg-[#F6F4FF]"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveEvent} className="mt-5 space-y-4">
              {/* Event Title */}
              <div>
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#8E8B9E]">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Quarterly Strategy Meeting, Doctor Appointment, Project Launch"
                  className="mt-1 h-10 w-full rounded-xl border border-[#E0DDF0] bg-white px-3 text-xs font-semibold outline-none focus:border-[#6D5DFB]"
                />
              </div>

              {/* Date & All-Day Toggle */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#8E8B9E]">
                    Particular Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="mt-1 h-10 w-full rounded-xl border border-[#E0DDF0] bg-white px-3 text-xs font-semibold outline-none focus:border-[#6D5DFB]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#8E8B9E]">
                    Duration Type
                  </label>
                  <div className="mt-1 flex h-10 items-center justify-between rounded-xl border border-[#E0DDF0] bg-[#FAF9FD] px-3">
                    <span className="text-xs font-bold text-[#26243A]">All-Day Event</span>
                    <input
                      type="checkbox"
                      checked={isAllDay}
                      onChange={(e) => setIsAllDay(e.target.checked)}
                      className="h-4 w-4 rounded accent-[#6D5DFB]"
                    />
                  </div>
                </div>
              </div>

              {/* Start & End Times (if not all day) */}
              {!isAllDay && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#8E8B9E]">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="mt-1 h-10 w-full rounded-xl border border-[#E0DDF0] bg-white px-3 text-xs font-semibold outline-none focus:border-[#6D5DFB]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#8E8B9E]">
                      End Time (Optional)
                    </label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="mt-1 h-10 w-full rounded-xl border border-[#E0DDF0] bg-white px-3 text-xs font-semibold outline-none focus:border-[#6D5DFB]"
                    />
                  </div>
                </div>
              )}

              {/* Category & Priority */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#8E8B9E]">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as CalendarEventCategory)}
                    className="mt-1 h-10 w-full rounded-xl border border-[#E0DDF0] bg-white px-3 text-xs font-semibold outline-none focus:border-[#6D5DFB]"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.label} value={c.label}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#8E8B9E]">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as CalendarEventPriority)}
                    className="mt-1 h-10 w-full rounded-xl border border-[#E0DDF0] bg-white px-3 text-xs font-semibold outline-none focus:border-[#6D5DFB]"
                  >
                    <option value="normal">Normal</option>
                    <option value="important">Important</option>
                    <option value="urgent">Urgent / Critical</option>
                  </select>
                </div>
              </div>

              {/* Location or Meeting Link */}
              <div>
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#8E8B9E]">
                  Location or Meeting URL (Optional)
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Conference Room B, Google Meet, City Office"
                  className="mt-1 h-10 w-full rounded-xl border border-[#E0DDF0] bg-white px-3 text-xs font-semibold outline-none focus:border-[#6D5DFB]"
                />
              </div>

              {/* Description / Notes */}
              <div>
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#8E8B9E]">
                  Event Details & Notes
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Key context, agenda, or specific preparation instructions..."
                  className="mt-1 w-full rounded-xl border border-[#E0DDF0] bg-white p-3 text-xs font-medium outline-none focus:border-[#6D5DFB]"
                />
              </div>

              {/* Subtasks / Checklist builder so user doesn't forget any tasks for this event */}
              <div className="rounded-2xl border border-[#ECEAF5] bg-[#FAF9FD] p-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#26243A]">
                    <ListTodo className="h-4 w-4 text-[#6D5DFB]" />
                    <span>Tasks & Checklist for this Event</span>
                  </div>
                  <span className="text-[10px] text-[#8E8B9E]">Don't forget sub-tasks</span>
                </div>

                <div className="mt-2.5 flex gap-2">
                  <input
                    type="text"
                    value={newChecklistText}
                    onChange={(e) => setNewChecklistText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddChecklistItem();
                      }
                    }}
                    placeholder="Add a task (e.g. Bring slides, Send email)"
                    className="h-8 flex-1 rounded-xl border border-[#E0DDF0] bg-white px-3 text-xs outline-none focus:border-[#6D5DFB]"
                  />
                  <button
                    type="button"
                    onClick={handleAddChecklistItem}
                    className="rounded-xl bg-[#6D5DFB] px-3 text-xs font-bold text-white hover:bg-[#5949E8]"
                  >
                    Add
                  </button>
                </div>

                {checklist.length > 0 && (
                  <div className="mt-2.5 space-y-1.5">
                    {checklist.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-xl bg-white px-3 py-1.5 text-xs"
                      >
                        <span className="font-semibold text-[#26243A]">{item.title}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveChecklistItem(item.id)}
                          className="text-[#B0ACC5] hover:text-[#E96E58]"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Remind me on that particular day configuration */}
              <div className="rounded-2xl border border-[#FFD9B5] bg-[#FFFBF5] p-4 text-[#8C4A10]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FFE4C4] text-[#D97706]">
                      <Bell className="h-4 w-4" />
                    </span>
                    <div>
                      <div className="text-xs font-extrabold text-[#26243A]">
                        Remind me on this particular day
                      </div>
                      <div className="text-[10px] text-[#8E8B9E]">
                        Sends notifications & audio chime on {eventDate}
                      </div>
                    </div>
                  </div>

                  <input
                    type="checkbox"
                    checked={reminderEnabled}
                    onChange={(e) => setReminderEnabled(e.target.checked)}
                    className="h-5 w-5 rounded accent-[#6D5DFB]"
                  />
                </div>

                {reminderEnabled && (
                  <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <div>
                      <label className="text-[10px] font-extrabold uppercase text-[#8C4A10]">
                        Reminder Timing
                      </label>
                      <select
                        value={reminderTiming}
                        onChange={(e) =>
                          setReminderTiming(
                            e.target.value as
                              | "at_time"
                              | "15_min_before"
                              | "1_hour_before"
                              | "morning_of"
                              | "1_day_before"
                          )
                        }
                        className="mt-1 h-9 w-full rounded-xl border border-[#FFE4C4] bg-white px-2.5 text-xs font-semibold text-[#26243A] outline-none"
                      >
                        <option value="morning_of">Morning of the day (9:00 AM)</option>
                        <option value="at_time">At event start time</option>
                        <option value="15_min_before">15 minutes before</option>
                        <option value="1_hour_before">1 hour before</option>
                        <option value="1_day_before">1 day before (Eve reminder)</option>
                      </select>
                    </div>

                    <div className="flex items-end">
                      <Button
                        type="button"
                        onClick={handleTestReminder}
                        variant="outline"
                        className="h-9 w-full rounded-xl border-[#FFE4C4] bg-white text-xs font-bold text-[#D97706] hover:bg-[#FFE4C4]/40"
                      >
                        <Volume2 className="mr-1.5 h-3.5 w-3.5" /> Test Reminder Alert
                      </Button>
                    </div>
                  </div>
                )}

                {testNotificationFeedback && (
                  <div className="mt-2 text-xs font-bold text-[#27AE60]">
                    {testNotificationFeedback}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 border-t border-[#F0EEF6] pt-4">
                <Button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  variant="outline"
                  className="h-10 rounded-xl border-[#E0DDF0] px-4 text-xs font-bold text-[#77748F]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="h-10 rounded-xl bg-[#6D5DFB] px-5 text-xs font-extrabold text-white shadow-xs hover:bg-[#5949E8]"
                >
                  {editingEvent ? "Save Changes" : "Create Event & Reminder"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
