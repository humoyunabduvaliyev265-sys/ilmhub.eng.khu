import React, { useState } from "react";
import { UserProfile, MistakeRecord, CEFRLevel } from "../types";
import { CEFR_LEVEL_DETAILS } from "../data/constants";
import {
  X,
  User,
  Flame,
  Award,
  BookOpen,
  Trophy,
  Target,
  CheckCircle,
  RotateCcw,
  Sparkles,
  Trash2,
} from "lucide-react";

interface ProfileStatsModalProps {
  profile: UserProfile;
  mistakes: MistakeRecord[];
  isOpen: boolean;
  onClose: () => void;
  onUpdateName: (newName: string) => void;
  onChangeLevel: (lvl: CEFRLevel) => void;
  onClearMistakes: () => void;
  onResetProgress: () => void;
}

export const ProfileStatsModal: React.FC<ProfileStatsModalProps> = ({
  profile,
  mistakes,
  isOpen,
  onClose,
  onUpdateName,
  onChangeLevel,
  onClearMistakes,
  onResetProgress,
}) => {
  if (!isOpen) return null;

  const [nameInput, setNameInput] = useState(profile.name);
  const [isEditingName, setIsEditingName] = useState(false);
  const [showMistakesTab, setShowMistakesTab] = useState(false);

  const totalAnswers = profile.correctAnswers + profile.incorrectAnswers;
  const accuracy = totalAnswers > 0 ? Math.round((profile.correctAnswers / totalAnswers) * 100) : 100;

  const levels: CEFRLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

  const handleSaveName = () => {
    if (nameInput.trim()) {
      onUpdateName(nameInput.trim());
      setIsEditingName(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-zinc-900 dark:text-zinc-100">
                Learner Profile & Learning Stats
              </h3>
              <p className="text-xs text-zinc-700 dark:text-zinc-300">
                ILMHUB ENGLISH by KHUMOYUN
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 hover:text-zinc-700 dark:text-zinc-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card */}
        <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-black text-lg flex items-center justify-center shadow-xs">
              {profile.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="text-sm font-bold p-1 border border-indigo-400 rounded-md bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                  />
                  <button
                    onClick={handleSaveName}
                    className="text-xs px-2.5 py-1 bg-indigo-600 text-white rounded-md font-semibold"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-base text-zinc-900 dark:text-zinc-100">
                    {profile.name}
                  </h4>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                  >
                    Edit
                  </button>
                </div>
              )}
              <p className="text-xs text-zinc-700 dark:text-zinc-300">
                Current Level: <span className="font-bold text-zinc-800 dark:text-zinc-200">{profile.level}</span> ({CEFR_LEVEL_DETAILS[profile.level].title})
              </p>
            </div>
          </div>

          {/* CEFR Level Selector */}
          <div className="flex items-center gap-1 bg-zinc-200/80 dark:bg-zinc-700/60 p-1 rounded-xl">
            {levels.map((lvl) => (
              <button
                key={lvl}
                onClick={() => onChangeLevel(lvl)}
                className={`text-xs px-2.5 py-1 rounded-lg font-bold transition-all ${
                  profile.level === lvl
                    ? "bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                    : "text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Switcher: Stats vs Mistake Tracker */}
        <div className="flex gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-2 mb-4 text-xs font-semibold">
          <button
            onClick={() => setShowMistakesTab(false)}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              !showMistakesTab
                ? "bg-indigo-600 text-white"
                : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            Performance Overview
          </button>
          <button
            onClick={() => setShowMistakesTab(true)}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              showMistakesTab
                ? "bg-indigo-600 text-white"
                : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            <span>Mistakes Review Log</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200">
              {mistakes.length}
            </span>
          </button>
        </div>

        {/* Stats Grid */}
        {!showMistakesTab ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30">
                <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-semibold mb-1">
                  <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
                  <span>Streak</span>
                </div>
                <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  {Math.max(1, profile.streak)} Days
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-900/30">
                <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-400 font-semibold mb-1">
                  <Award className="w-4 h-4" />
                  <span>Total XP</span>
                </div>
                <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  {profile.xp}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/30">
                <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold mb-1">
                  <Target className="w-4 h-4" />
                  <span>Quiz Accuracy</span>
                </div>
                <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  {accuracy}%
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700">
                <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300 font-semibold mb-1">
                  <CheckCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Sentences Checked</span>
                </div>
                <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  {profile.sentencesChecked || 0}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700">
                <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300 font-semibold mb-1">
                  <BookOpen className="w-4 h-4" />
                  <span>Words Learned</span>
                </div>
                <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  {profile.wordsLearned}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700">
                <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300 font-semibold mb-1">
                  <Trophy className="w-4 h-4" />
                  <span>Tests Passed</span>
                </div>
                <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  {profile.testsCompleted}
                </span>
              </div>
            </div>

            {/* Level Roadmap */}
            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-700">
              <h5 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-2">
                CEFR Learning Roadmap
              </h5>
              <div className="grid grid-cols-6 gap-1 text-center text-xs">
                {levels.map((lvl, idx) => {
                  const currentIdx = levels.indexOf(profile.level);
                  const isPast = idx < currentIdx;
                  const isCurrent = idx === currentIdx;

                  return (
                    <div
                      key={lvl}
                      className={`p-2 rounded-lg border font-bold ${
                        isCurrent
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : isPast
                          ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                          : "border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
                      }`}
                    >
                      <div>{lvl}</div>
                      <div className="text-[10px] font-normal opacity-80">
                        {isCurrent ? "Active" : isPast ? "Done" : "Next"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* Mistakes Review Log */
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-zinc-700 dark:text-zinc-300 pb-2">
              <span>Review your past grammatical errors & polish them:</span>
              {mistakes.length > 0 && (
                <button
                  onClick={onClearMistakes}
                  className="flex items-center gap-1 text-rose-600 hover:underline"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </button>
              )}
            </div>

            {mistakes.length === 0 ? (
              <div className="p-8 text-center text-zinc-700 dark:text-zinc-300 text-xs bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200 dark:border-zinc-700">
                <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="font-semibold text-zinc-800 dark:text-zinc-200">No mistakes logged yet!</p>
                <p className="mt-1">
                  Mistakes captured during chat or sentence checks will appear here for spaced repetition.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                {mistakes.map((m) => (
                  <div
                    key={m.id}
                    className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/40 text-xs space-y-1"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-mono text-rose-700 dark:text-rose-400 line-through">
                        ✗ {m.original}
                      </span>
                      {m.topic && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 font-medium text-zinc-700 dark:text-zinc-300">
                          {m.topic}
                        </span>
                      )}
                    </div>
                    <div className="font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                      ✓ {m.corrected}
                    </div>
                    <p className="text-zinc-700 dark:text-zinc-300 font-sans pt-1">
                      {m.explanation}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="pt-6 mt-6 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <button
            onClick={() => {
              if (confirm("Reset your learner profile and start fresh?")) {
                onResetProgress();
                onClose();
              }
            }}
            className="text-xs text-rose-600 hover:underline font-medium"
          >
            Reset Progress
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
