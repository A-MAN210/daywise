import { useState } from "react";
import type { FormEvent } from "react";
import {
  Compass,
  Sparkles,
  Edit3,
  Check,
  Plus,
  Trash2,
  Target,
  Award,
  BookMarked,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AppState, VisionMissionState, CoreValue, AspirationItem } from "@/types/tracker";

interface VisionMissionViewProps {
  state: AppState;
  updateState: (updater: (state: AppState) => AppState) => void;
  setActiveTab: (tab: string) => void;
}

const DEFAULT_VISION_MISSION: VisionMissionState = {
  vision:
    "To build enduring digital solutions with uncompromising clarity, cultivate intellectual mastery, and live each day with unwavering discipline, purpose, and inner peace.",
  mission:
    "I show up each day with focus and intention. I prioritize craft over distraction, health over temporary comfort, and continuous compounding progress toward the life I respect.",
  identityStatement:
    "I am Aman — an architect of my own daily discipline. I do not negotiate with my highest standards, and I make promises to myself that I consistently keep.",
  coreValues: [
    {
      id: "v1",
      title: "Relentless Consistency",
      desc: "Small, daily non-negotiables compound into extraordinary results over time.",
    },
    {
      id: "v2",
      title: "Deep Clarity",
      desc: "Filter through the noise. Focus exclusively on the few levers that genuinely move the needle.",
    },
    {
      id: "v3",
      title: "Health as the Foundation",
      desc: "Mental clarity and physical vitality govern every other achievement in life.",
    },
    {
      id: "v4",
      title: "Craft & Intellectual Rigor",
      desc: "Build things of genuine utility and beauty with pride in execution.",
    },
  ],
  fiveYearAspirations: [
    { id: "a1", text: "Achieve deep technical mastery and lead impactful engineering systems.", completed: false },
    { id: "a2", text: "Maintain optimal physical health, strength, and daily restorative routines.", completed: false },
    { id: "a3", text: "Establish financial sovereignty and independent wealth creation.", completed: false },
    { id: "a4", text: "Nurture meaningful bonds with family, friends, and high-integrity collaborators.", completed: false },
  ],
  updatedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
};

export function VisionMissionView({ state, updateState }: VisionMissionViewProps) {
  const currentVM: VisionMissionState = state.visionMission || DEFAULT_VISION_MISSION;

  const [isEditing, setIsEditing] = useState(false);
  const [vision, setVision] = useState(currentVM.vision);
  const [mission, setMission] = useState(currentVM.mission);
  const [identityStatement, setIdentityStatement] = useState(currentVM.identityStatement);

  // New Core Value Form
  const [newValueTitle, setNewValueTitle] = useState("");
  const [newValueDesc, setNewValueDesc] = useState("");
  const [showAddValue, setShowAddValue] = useState(false);

  // New Aspiration Form
  const [newAspiration, setNewAspiration] = useState("");

  const handleSaveStatements = () => {
    updateState((prev) => ({
      ...prev,
      visionMission: {
        ...(prev.visionMission || currentVM),
        vision: vision.trim(),
        mission: mission.trim(),
        identityStatement: identityStatement.trim(),
        updatedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      },
    }));
    setIsEditing(false);
  };

  const handleAddCoreValue = (e: FormEvent) => {
    e.preventDefault();
    if (!newValueTitle.trim()) return;

    const val: CoreValue = {
      id: Math.random().toString(36).slice(2, 10),
      title: newValueTitle.trim(),
      desc: newValueDesc.trim() || "Guiding operating principle",
    };

    updateState((prev) => {
      const vm = prev.visionMission || currentVM;
      return {
        ...prev,
        visionMission: {
          ...vm,
          coreValues: [...vm.coreValues, val],
        },
      };
    });

    setNewValueTitle("");
    setNewValueDesc("");
    setShowAddValue(false);
  };

  const handleDeleteCoreValue = (id: string) => {
    updateState((prev) => {
      const vm = prev.visionMission || currentVM;
      return {
        ...prev,
        visionMission: {
          ...vm,
          coreValues: vm.coreValues.filter((v) => v.id !== id),
        },
      };
    });
  };

  const handleAddAspiration = (e: FormEvent) => {
    e.preventDefault();
    if (!newAspiration.trim()) return;

    const item: AspirationItem = {
      id: Math.random().toString(36).slice(2, 10),
      text: newAspiration.trim(),
      completed: false,
    };

    updateState((prev) => {
      const vm = prev.visionMission || currentVM;
      return {
        ...prev,
        visionMission: {
          ...vm,
          fiveYearAspirations: [...vm.fiveYearAspirations, item],
        },
      };
    });

    setNewAspiration("");
  };

  const handleToggleAspiration = (id: string) => {
    updateState((prev) => {
      const vm = prev.visionMission || currentVM;
      return {
        ...prev,
        visionMission: {
          ...vm,
          fiveYearAspirations: vm.fiveYearAspirations.map((a) =>
            a.id === id ? { ...a, completed: !a.completed } : a
          ),
        },
      };
    });
  };

  const handleDeleteAspiration = (id: string) => {
    updateState((prev) => {
      const vm = prev.visionMission || currentVM;
      return {
        ...prev,
        visionMission: {
          ...vm,
          fiveYearAspirations: vm.fiveYearAspirations.filter((a) => a.id !== id),
        },
      };
    });
  };

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#6D5DFB]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#6D5DFB]" />
            North Star & Manifesto
          </div>
          <h1 className="font-display text-[32px] font-extrabold leading-none tracking-[-0.055em] text-[#26243A] sm:text-[38px]">
            Vision & Mission
          </h1>
          <p className="mt-2.5 max-w-[620px] text-sm leading-6 text-[#88859D]">
            A dedicated sanctuary to write, view, and update your personal Vision, Mission, and Core Values. Read this when making difficult decisions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <Button
              onClick={handleSaveStatements}
              className="h-11 rounded-xl bg-[#27AE60] px-4 text-xs font-extrabold text-white shadow-md hover:bg-[#219653]"
            >
              <Check className="mr-1.5 h-4 w-4" /> Save Statements
            </Button>
          ) : (
            <Button
              onClick={() => setIsEditing(true)}
              className="h-11 rounded-xl bg-[#6D5DFB] px-4 text-xs font-extrabold text-white shadow-md hover:bg-[#5949E8]"
            >
              <Edit3 className="mr-1.5 h-4 w-4" /> Edit Vision & Mission
            </Button>
          )}
        </div>
      </div>

      {/* Hero Banner: Identity Statement */}
      <div className="relative overflow-hidden rounded-[26px] bg-[#292741] p-6 text-white sm:p-8">
        <div className="relative z-10 max-w-[760px]">
          <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#F4BC56]">
            <Sparkles className="h-4 w-4" /> Who I Am Becoming · Aman's Standard
          </div>

          {isEditing ? (
            <textarea
              value={identityStatement}
              onChange={(e) => setIdentityStatement(e.target.value)}
              rows={3}
              className="mt-4 w-full rounded-2xl border border-white/20 bg-white/10 p-3 text-lg font-bold leading-relaxed text-white outline-none focus:border-[#F4BC56]"
              placeholder="Your identity statement..."
            />
          ) : (
            <h2 className="mt-4 font-display text-2xl font-extrabold leading-relaxed tracking-[-0.04em] text-white sm:text-3xl">
              "{currentVM.identityStatement}"
            </h2>
          )}

          <div className="mt-4 text-xs font-semibold text-[#B9B5DB]">
            Last updated: {currentVM.updatedAt}
          </div>
        </div>
      </div>

      {/* Main Dual Cards: Vision & Mission */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Vision Card */}
        <div className="rounded-3xl border border-[#E9E8F2] bg-white p-7 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F1EFFF] text-[#6D5DFB]">
              <Compass className="h-5 w-5" />
            </span>
            <div>
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#A09DB7]">Long-Term Horizon</div>
              <h3 className="font-display text-xl font-extrabold text-[#26243A]">Personal Vision</h3>
            </div>
          </div>

          <div className="mt-5">
            {isEditing ? (
              <textarea
                value={vision}
                onChange={(e) => setVision(e.target.value)}
                rows={5}
                className="w-full rounded-2xl border border-[#E0DDF0] bg-[#FAF9FD] p-4 text-sm leading-6 text-[#26243A] outline-none focus:border-[#6D5DFB] focus:bg-white"
                placeholder="What is your long-term destination? Who do you seek to become?"
              />
            ) : (
              <p className="whitespace-pre-wrap text-sm leading-7 font-medium text-[#4D4966]">
                {currentVM.vision}
              </p>
            )}
          </div>
          <div className="mt-6 flex items-center gap-1.5 text-[11px] font-bold text-[#6D5DFB]">
            <Target className="h-3.5 w-3.5" /> What the future looks like when you win
          </div>
        </div>

        {/* Mission Card */}
        <div className="rounded-3xl border border-[#E9E8F2] bg-white p-7 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FFF5D9] text-[#CA921A]">
              <Award className="h-5 w-5" />
            </span>
            <div>
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#A09DB7]">Daily Compass</div>
              <h3 className="font-display text-xl font-extrabold text-[#26243A]">Daily Mission</h3>
            </div>
          </div>

          <div className="mt-5">
            {isEditing ? (
              <textarea
                value={mission}
                onChange={(e) => setMission(e.target.value)}
                rows={5}
                className="w-full rounded-2xl border border-[#E0DDF0] bg-[#FAF9FD] p-4 text-sm leading-6 text-[#26243A] outline-none focus:border-[#6D5DFB] focus:bg-white"
                placeholder="How do you operate on a daily basis? What principles guide your actions today?"
              />
            ) : (
              <p className="whitespace-pre-wrap text-sm leading-7 font-medium text-[#4D4966]">
                {currentVM.mission}
              </p>
            )}
          </div>
          <div className="mt-6 flex items-center gap-1.5 text-[11px] font-bold text-[#CA921A]">
            <ShieldCheck className="h-3.5 w-3.5" /> How you operate today regardless of how you feel
          </div>
        </div>
      </div>

      {/* Core Values Section */}
      <div className="rounded-3xl border border-[#E9E8F2] bg-white p-7 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#F0EEF6] pb-4">
          <div>
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#A09DB7]">
              Immutable Standards
            </div>
            <h3 className="font-display text-xl font-extrabold text-[#26243A]">Core Values</h3>
          </div>
          <button
            onClick={() => setShowAddValue((p) => !p)}
            className="flex items-center gap-1 rounded-xl bg-[#F1EFFF] px-3 py-1.5 text-xs font-extrabold text-[#6D5DFB] hover:bg-[#E7E3FF]"
          >
            <Plus className="h-3.5 w-3.5" /> Add Core Value
          </button>
        </div>

        {showAddValue && (
          <form onSubmit={handleAddCoreValue} className="mt-4 rounded-2xl bg-[#FAF9FD] p-4 border border-[#EBE8F4] space-y-3">
            <div>
              <label className="text-[10px] font-extrabold uppercase text-[#8E8B9E]">Value Title</label>
              <input
                type="text"
                value={newValueTitle}
                onChange={(e) => setNewValueTitle(e.target.value)}
                placeholder="e.g. Radical Candor, Unhurried Discipline"
                className="mt-1 h-9 w-full rounded-xl border border-[#E0DDF0] bg-white px-3 text-xs outline-none focus:border-[#6D5DFB]"
              />
            </div>
            <div>
              <label className="text-[10px] font-extrabold uppercase text-[#8E8B9E]">Description / Definition</label>
              <input
                type="text"
                value={newValueDesc}
                onChange={(e) => setNewValueDesc(e.target.value)}
                placeholder="What does living this value look like?"
                className="mt-1 h-9 w-full rounded-xl border border-[#E0DDF0] bg-white px-3 text-xs outline-none focus:border-[#6D5DFB]"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddValue(false)}
                className="rounded-xl px-3 py-1.5 text-xs font-bold text-[#8E8B9E]"
              >
                Cancel
              </button>
              <Button type="submit" className="h-8 rounded-xl bg-[#6D5DFB] px-3 text-xs font-bold text-white">
                Save Value
              </Button>
            </div>
          </form>
        )}

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {currentVM.coreValues.map((value, idx) => (
            <div
              key={value.id}
              className="relative rounded-2xl border border-[#F0EEF6] bg-[#FAFAFD] p-4 hover:border-[#DEDBF0] transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#6D5DFB] text-[10px] font-extrabold text-white">
                    0{idx + 1}
                  </span>
                  <h4 className="font-extrabold text-sm text-[#26243A]">{value.title}</h4>
                </div>
                <button
                  onClick={() => handleDeleteCoreValue(value.id)}
                  className="text-[#D0CEDB] hover:text-[#E96E58]"
                  title="Remove value"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="mt-2 text-xs leading-5 text-[#736F8A]">{value.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 5-Year Aspirations */}
      <div className="rounded-3xl border border-[#E9E8F2] bg-white p-7 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#F0EEF6] pb-4">
          <div>
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#A09DB7]">
              Long-Range Milestones
            </div>
            <h3 className="font-display text-xl font-extrabold text-[#26243A]">5-Year Aspirations</h3>
          </div>
          <span className="text-xs font-bold text-[#6D5DFB]">
            {currentVM.fiveYearAspirations.filter((a) => a.completed).length} / {currentVM.fiveYearAspirations.length} fulfilled
          </span>
        </div>

        <form onSubmit={handleAddAspiration} className="mt-4 flex gap-2">
          <input
            type="text"
            value={newAspiration}
            onChange={(e) => setNewAspiration(e.target.value)}
            placeholder="Add a milestone aspiration for your next chapter..."
            className="h-10 flex-1 rounded-xl border border-[#E0DDF0] bg-[#FAF9FD] px-3.5 text-xs outline-none focus:border-[#6D5DFB] focus:bg-white"
          />
          <Button type="submit" className="h-10 rounded-xl bg-[#6D5DFB] px-4 text-xs font-bold text-white">
            <Plus className="mr-1 h-3.5 w-3.5" /> Add
          </Button>
        </form>

        <div className="mt-4 space-y-2.5">
          {currentVM.fiveYearAspirations.map((item) => (
            <div
              key={item.id}
              className={`flex items-center justify-between rounded-xl border p-3 transition ${
                item.completed ? "border-transparent bg-[#F5FCF7]" : "border-[#F0EEF6] bg-white"
              }`}
            >
              <div
                onClick={() => handleToggleAspiration(item.id)}
                className="flex items-center gap-3 cursor-pointer flex-1"
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition ${
                    item.completed ? "border-[#27AE60] bg-[#27AE60] text-white" : "border-[#D0CEDB]"
                  }`}
                >
                  {item.completed && <Check className="h-3 w-3" strokeWidth={3} />}
                </span>
                <span className={`text-xs font-bold ${item.completed ? "line-through text-[#A09DB7]" : "text-[#26243A]"}`}>
                  {item.text}
                </span>
              </div>
              <button
                onClick={() => handleDeleteAspiration(item.id)}
                className="text-[#D0CEDB] hover:text-[#E96E58] ml-2"
                title="Remove"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
