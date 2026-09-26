import { useState, useEffect } from "react";
import {
  Bell,
  Sparkles,
  Check,
  X,
  Volume2,
  Clock,
  Plus,
  Trash2,
  ShieldCheck,
  AlertTriangle,
  Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AppState, ScheduledReminder } from "@/types/tracker";

interface NotificationsRemindersModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: AppState;
  updateState: (updater: (state: AppState) => AppState) => void;
}

const DEFAULT_REMINDERS: ScheduledReminder[] = [
  {
    id: "r1",
    title: "Morning Kickstart & Focus Targets",
    time: "08:00",
    type: "task",
    enabled: true,
    message: "Aman, review your top 3 daily targets and start your deep work block.",
  },
  {
    id: "r2",
    title: "Midday Hydration & Movement",
    time: "13:00",
    type: "health",
    enabled: true,
    message: "Time for a water check and 15-minute posture reset.",
  },
  {
    id: "r3",
    title: "Phone Usage Boundary Nudge",
    time: "17:30",
    type: "habit",
    enabled: true,
    message: "Guard your evening attention. Avoid endless social app scrolling.",
  },
  {
    id: "r4",
    title: "Evening Target Planning & Wind-Down",
    time: "21:30",
    type: "planning",
    enabled: true,
    message: "Set tomorrow's targets before you rest. Sleep with a quiet mind.",
  },
];

const MOTIVATIONAL_PROMPTS = [
  "Aman, make the promise small, then keep it without compromise.",
  "You do not rise to the level of your goals; you fall to the level of your daily systems.",
  "The work you do when nobody is watching is what shapes everything else.",
  "One deep focus session can salvage and elevate an entire day.",
  "Rest is a responsibility, not a luxury. Wind down on purpose tonight.",
];

export function NotificationsRemindersModal({
  isOpen,
  onClose,
  state,
  updateState,
}: NotificationsRemindersModalProps) {
  const [notificationPermission, setNotificationPermission] = useState<string>("default");
  const [testNotificationSent, setTestNotificationSent] = useState(false);

  // New reminder form
  const [newTitle, setNewTitle] = useState("");
  const [newTime, setNewTime] = useState("10:00");
  const [newMsg, setNewMsg] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const reminders = state.reminders || DEFAULT_REMINDERS;

  useEffect(() => {
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if ("Notification" in window) {
      try {
        const perm = await Notification.requestPermission();
        setNotificationPermission(perm);
        if (perm === "granted") {
          sendBrowserNotification("Notifications Active! 🚀", "DayWise will keep you on track with your tasks and goals, Aman.");
        }
      } catch (err) {
        console.warn("Could not request notification permission:", err);
      }
    }
  };

  const sendBrowserNotification = (title: string, body: string) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, {
        body,
        icon: "/favicon.ico",
      });
    }
  };

  const handleSendTestNotification = () => {
    const randomQuote = MOTIVATIONAL_PROMPTS[Math.floor(Math.random() * MOTIVATIONAL_PROMPTS.length)];
    if (notificationPermission === "granted") {
      sendBrowserNotification("DayWise Motivation ⚡", randomQuote);
    }
    setTestNotificationSent(true);
    setTimeout(() => setTestNotificationSent(false), 4000);
  };

  const handleToggleReminder = (id: string) => {
    updateState((prev) => {
      const existing = prev.reminders || DEFAULT_REMINDERS;
      return {
        ...prev,
        reminders: existing.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)),
      };
    });
  };

  const handleDeleteReminder = (id: string) => {
    updateState((prev) => {
      const existing = prev.reminders || DEFAULT_REMINDERS;
      return {
        ...prev,
        reminders: existing.filter((r) => r.id !== id),
      };
    });
  };

  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newReminder: ScheduledReminder = {
      id: Math.random().toString(36).slice(2, 10),
      title: newTitle.trim(),
      time: newTime,
      type: "task",
      enabled: true,
      message: newMsg.trim() || `Time to complete: ${newTitle.trim()}`,
    };

    updateState((prev) => ({
      ...prev,
      reminders: [newReminder, ...(prev.reminders || DEFAULT_REMINDERS)],
    }));

    setNewTitle("");
    setNewMsg("");
    setShowAddForm(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4">
      <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl border border-[#E9E8F2] bg-white p-6 shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#F0EEF6] pb-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FFF5D9] text-[#CA921A]">
              <Bell className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-display text-xl font-extrabold text-[#26243A]">
                Task Notifications & Reminders
              </h2>
              <p className="text-xs text-[#8E8B9E]">Timely alerts and motivational nudges for Aman</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-[#A09DB7] hover:bg-[#F6F4FF]"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* System Permission Banner */}
        <div className="mt-5 rounded-2xl border border-[#E9E8F2] bg-[#FAF9FD] p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-extrabold text-[#26243A]">
                <Volume2 className="h-4 w-4 text-[#6D5DFB]" />
                <span>Browser Push Notifications:</span>
                <span
                  className={`rounded-md px-2 py-0.5 text-[10px] font-extrabold capitalize ${
                    notificationPermission === "granted"
                      ? "bg-[#E8F8F0] text-[#27AE60]"
                      : "bg-[#FFF0EC] text-[#E96E58]"
                  }`}
                >
                  {notificationPermission}
                </span>
              </div>
              <p className="text-[11px] text-[#8E8B9E] mt-1">
                Receive proactive reminders even when you switch tabs or work elsewhere.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {notificationPermission !== "granted" ? (
                <Button
                  onClick={requestPermission}
                  className="h-9 rounded-xl bg-[#6D5DFB] px-3.5 text-xs font-bold text-white hover:bg-[#5949E8]"
                >
                  Enable Alerts
                </Button>
              ) : (
                <Button
                  onClick={handleSendTestNotification}
                  className="h-9 rounded-xl border border-[#E0DDF0] bg-white px-3.5 text-xs font-bold text-[#6D5DFB] hover:bg-[#F6F4FF]"
                >
                  {testNotificationSent ? "✓ Test Sent" : "Test Notification"}
                </Button>
              )}
            </div>
          </div>

          {testNotificationSent && (
            <div className="mt-3 rounded-xl bg-[#E8F8F0] p-2.5 text-xs font-bold text-[#27AE60] flex items-center gap-2">
              <Check className="h-4 w-4" />
              <span>Notification triggered! If permitted, you'll see a native browser pop-up.</span>
            </div>
          )}
        </div>

        {/* Motivational Prompt of the Day */}
        <div className="mt-5 rounded-2xl bg-[#292741] p-4 text-white">
          <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-widest text-[#F4BC56]">
            <Sparkles className="h-3.5 w-3.5" /> Motivational Reminder
          </div>
          <p className="mt-2 text-xs leading-5 text-[#E3E0F3]">
            "{MOTIVATIONAL_PROMPTS[0]}"
          </p>
        </div>

        {/* Scheduled Reminders List */}
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-[#26243A]">Scheduled Daily Nudges</h3>
            <button
              onClick={() => setShowAddForm((p) => !p)}
              className="flex items-center gap-1 text-xs font-extrabold text-[#6D5DFB] hover:underline"
            >
              <Plus className="h-3.5 w-3.5" /> Add Reminder
            </button>
          </div>

          {showAddForm && (
            <form onSubmit={handleAddReminder} className="mt-3 rounded-2xl border border-[#ECEAF5] bg-[#FAF9FD] p-4 space-y-3">
              <div>
                <label className="text-[10px] font-extrabold uppercase text-[#8E8B9E]">Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Read 20 pages before bed"
                  className="mt-1 h-9 w-full rounded-xl border border-[#E0DDF0] bg-white px-3 text-xs outline-none focus:border-[#6D5DFB]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-extrabold uppercase text-[#8E8B9E]">Time</label>
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="mt-1 h-9 w-full rounded-xl border border-[#E0DDF0] bg-white px-3 text-xs outline-none focus:border-[#6D5DFB]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-extrabold uppercase text-[#8E8B9E]">Nudge Text</label>
                  <input
                    type="text"
                    value={newMsg}
                    onChange={(e) => setNewMsg(e.target.value)}
                    placeholder="Brief reminder message"
                    className="mt-1 h-9 w-full rounded-xl border border-[#E0DDF0] bg-white px-3 text-xs outline-none focus:border-[#6D5DFB]"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="rounded-xl px-3 py-1.5 text-xs font-bold text-[#8E8B9E]"
                >
                  Cancel
                </button>
                <Button type="submit" className="h-8 rounded-xl bg-[#6D5DFB] px-3 text-xs font-bold text-white">
                  Save Reminder
                </Button>
              </div>
            </form>
          )}

          <div className="mt-3 space-y-2.5">
            {reminders.map((rem) => (
              <div
                key={rem.id}
                className={`flex items-center justify-between rounded-2xl border p-3.5 transition ${
                  rem.enabled ? "border-[#ECEAF5] bg-white" : "border-transparent bg-[#F5F4FA] opacity-65"
                }`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <button
                    onClick={() => handleToggleReminder(rem.id)}
                    className={`flex h-6 w-11 items-center rounded-full p-1 transition ${
                      rem.enabled ? "bg-[#6D5DFB]" : "bg-[#D8D5E5]"
                    }`}
                  >
                    <div
                      className={`h-4 w-4 rounded-full bg-white transition-transform ${
                        rem.enabled ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-[#26243A] truncate">{rem.title}</span>
                      <span className="flex items-center gap-1 rounded bg-[#F1EFFF] px-1.5 py-0.5 text-[10px] font-extrabold text-[#6D5DFB]">
                        <Clock className="h-3 w-3" /> {rem.time}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#8E8B9E] truncate mt-0.5">{rem.message}</div>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteReminder(rem.id)}
                  className="text-[#D0CEDB] hover:text-[#E96E58] ml-2 p-1"
                  title="Remove"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-6 flex justify-end border-t border-[#F0EEF6] pt-4">
          <Button
            onClick={onClose}
            className="h-10 rounded-xl bg-[#6D5DFB] px-5 text-xs font-extrabold text-white hover:bg-[#5949E8]"
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
