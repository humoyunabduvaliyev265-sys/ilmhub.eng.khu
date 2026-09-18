import React from "react";
import { UserProfile, CEFRLevel, ActiveAppTab, UserAccount } from "../types";
import { CEFR_LEVEL_DETAILS } from "../data/constants";
import {
  Sparkles,
  Flame,
  Award,
  Settings,
  CheckCircle2,
  Calendar,
  BookOpen,
  GraduationCap,
  Trophy,
  Shield,
  LogOut,
  User,
} from "lucide-react";

interface NavbarProps {
  profile: UserProfile;
  currentUser: UserAccount;
  activeTab: ActiveAppTab;
  onSelectTab: (tab: ActiveAppTab) => void;
  onChangeLevel: (lvl: CEFRLevel) => void;
  onOpenSettings: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  profile,
  currentUser,
  activeTab,
  onSelectTab,
  onChangeLevel,
  onOpenSettings,
  onLogout,
}) => {
  const levels: CEFRLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-zinc-900/95 backdrop-blur border-b border-zinc-200 dark:border-zinc-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Brand & Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onSelectTab("checker")}
              className="flex items-center gap-2 text-left group focus:outline-none"
              id="brand-logo-btn"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500 flex items-center justify-center text-white font-black shadow-sm group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 text-amber-300" />
              </div>
              <div className="leading-tight">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base tracking-tight text-zinc-900 dark:text-zinc-50">
                    ILMHUB ENGLISH
                  </span>
                  <span className="text-[10px] uppercase tracking-wider font-bold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded">
                    AI COACH
                  </span>
                </div>
                <div className="text-[11px] text-zinc-700 dark:text-zinc-300 font-medium">
                  by KHUMOYUN
                </div>
              </div>
            </button>

            {/* Level Quick Selector */}
            <div className="hidden md:flex items-center gap-1 ml-4 pl-4 border-l border-zinc-200 dark:border-zinc-800">
              <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 mr-1">Level:</span>
              <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-lg">
                {levels.map((lvl) => {
                  const isCurrent = profile.level === lvl;
                  return (
                    <button
                      key={lvl}
                      id={`level-btn-${lvl}`}
                      onClick={() => onChangeLevel(lvl)}
                      className={`text-xs px-2 py-1 rounded-md font-semibold transition-all ${
                        isCurrent
                          ? "bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                          : "text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100"
                      }`}
                      title={`${lvl}: ${CEFR_LEVEL_DETAILS[lvl].title} - ${CEFR_LEVEL_DETAILS[lvl].desc}`}
                    >
                      {lvl}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* User Progress Stats & Profile & Logout */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Streak */}
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/50 text-amber-700 dark:text-amber-400 text-xs font-semibold"
              title="Daily Learning Streak"
            >
              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>{Math.max(1, profile.streak)}d</span>
            </div>

            {/* XP Points */}
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/50 text-indigo-700 dark:text-indigo-400 text-xs font-semibold"
              title="Total XP Earned"
            >
              <Award className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>{profile.xp} XP</span>
            </div>

            {/* User Account / Role Pill */}
            <button
              id="settings-profile-btn"
              onClick={onOpenSettings}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-xs font-medium transition-colors"
              title="View Learning Profile & Stats"
            >
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-[10px]">
                {currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : currentUser.username.charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:inline font-semibold max-w-[90px] truncate">
                {currentUser.fullName || currentUser.username}
              </span>
              {currentUser.role === "admin" && (
                <span className="text-[10px] font-extrabold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 px-1 py-0.5 rounded">
                  Admin
                </span>
              )}
            </button>

            {/* Logout Button */}
            <button
              id="logout-btn"
              onClick={onLogout}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold transition-colors"
              title="Log Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto no-scrollbar py-2 border-t border-zinc-100 dark:border-zinc-800/80 text-xs sm:text-sm">
          <button
            id="nav-checker-tab"
            onClick={() => onSelectTab("checker")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${
              activeTab === "checker"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Sentence Checker</span>
          </button>

          <button
            id="nav-challenge-tab"
            onClick={() => onSelectTab("challenge")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${
              activeTab === "challenge"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Daily Challenge</span>
          </button>

          <button
            id="nav-vocab-tab"
            onClick={() => onSelectTab("vocab")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${
              activeTab === "vocab"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Vocabulary</span>
          </button>

          <button
            id="nav-grammar-tab"
            onClick={() => onSelectTab("grammar")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${
              activeTab === "grammar"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Grammar Rules</span>
          </button>

          <button
            id="nav-quiz-tab"
            onClick={() => onSelectTab("quiz")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${
              activeTab === "quiz"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Practice Quiz</span>
          </button>

          {/* Admin Panel Tab - Only for Admin */}
          {currentUser.role === "admin" && (
            <button
              id="nav-admin-tab"
              onClick={() => onSelectTab("admin")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold whitespace-nowrap transition-colors ${
                activeTab === "admin"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/50"
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Admin Panel</span>
              <span className="text-[10px] px-1 py-0.2 rounded bg-purple-200 dark:bg-purple-900 text-purple-800 dark:text-purple-200 font-black">
                ADMIN
              </span>
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};

