import React, { useState, useEffect, useCallback } from "react";
import {
  UserProfile,
  CEFRLevel,
  MistakeRecord,
  ActiveAppTab,
  UserAccount,
} from "./types";
import { Navbar } from "./components/Navbar";
import { SentenceChecker } from "./components/SentenceChecker";
import { DailyChallengeView } from "./components/DailyChallengeView";
import { VocabularyVault } from "./components/VocabularyVault";
import { GrammarMaster } from "./components/GrammarMaster";
import { QuizView } from "./components/QuizView";
import { ProfileStatsModal } from "./components/ProfileStatsModal";
import { LoginView } from "./components/LoginView";
import { AdminPanelView } from "./components/AdminPanelView";
import { Sparkles, Loader2 } from "lucide-react";

const STORAGE_TOKEN_KEY = "ilmhub_english_token";
const STORAGE_PROFILE_KEY = "ilmhub_english_profile";
const STORAGE_MISTAKES_KEY = "ilmhub_english_mistakes";

const DEFAULT_PROFILE: UserProfile = {
  name: "KHUMOYUN",
  level: "A1",
  xp: 0,
  streak: 1,
  lessonsCompleted: 0,
  testsCompleted: 0,
  wordsLearned: 0,
  correctAnswers: 0,
  incorrectAnswers: 0,
  sentencesChecked: 0,
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_TOKEN_KEY);
    } catch {
      return null;
    }
  });
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  const [activeTab, setActiveTab] = useState<ActiveAppTab>("checker");

  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);

  const [mistakes, setMistakes] = useState<MistakeRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_MISTAKES_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Check auth session on startup
  useEffect(() => {
    const verifyExistingToken = async () => {
      const savedToken = localStorage.getItem(STORAGE_TOKEN_KEY);
      if (!savedToken) {
        setAuthLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${savedToken}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setCurrentUser(data.user);
            setToken(savedToken);
            // Sync user profile state
            setProfile({
              id: data.user.id,
              username: data.user.username,
              role: data.user.role,
              name: data.user.fullName || data.user.username,
              level: data.user.level || "A1",
              xp: data.user.xp || 0,
              streak: data.user.streak || 1,
              lessonsCompleted: data.user.lessonsCompleted || 0,
              testsCompleted: data.user.testsCompleted || 0,
              wordsLearned: data.user.wordsLearned || 0,
              sentencesChecked: data.user.sentencesChecked || 0,
              correctAnswers: data.user.correctAnswers || 0,
              incorrectAnswers: data.user.incorrectAnswers || 0,
            });
          } else {
            localStorage.removeItem(STORAGE_TOKEN_KEY);
            setToken(null);
            setCurrentUser(null);
          }
        } else {
          localStorage.removeItem(STORAGE_TOKEN_KEY);
          setToken(null);
          setCurrentUser(null);
        }
      } catch (err) {
        console.error("Auth check failed:", err);
      } finally {
        setAuthLoading(false);
      }
    };

    verifyExistingToken();
  }, []);

  // Save mistakes to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_MISTAKES_KEY, JSON.stringify(mistakes));
  }, [mistakes]);

  // Sync profile stats to server when profile changes
  const syncProfileToServer = useCallback(
    async (updatedProfile: UserProfile) => {
      if (!token || !currentUser) return;
      try {
        await fetch("/api/auth/profile", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            xp: updatedProfile.xp,
            streak: updatedProfile.streak,
            level: updatedProfile.level,
            lessonsCompleted: updatedProfile.lessonsCompleted,
            testsCompleted: updatedProfile.testsCompleted,
            wordsLearned: updatedProfile.wordsLearned,
            sentencesChecked: updatedProfile.sentencesChecked,
            correctAnswers: updatedProfile.correctAnswers,
            incorrectAnswers: updatedProfile.incorrectAnswers,
          }),
        });
      } catch (err) {
        console.error("Failed to sync profile to server:", err);
      }
    },
    [token, currentUser]
  );

  // Handle Login Success
  const handleLoginSuccess = (newToken: string, user: UserAccount) => {
    localStorage.setItem(STORAGE_TOKEN_KEY, newToken);
    setToken(newToken);
    setCurrentUser(user);
    setProfile({
      id: user.id,
      username: user.username,
      role: user.role,
      name: user.fullName || user.username,
      level: user.level || "A1",
      xp: user.xp || 0,
      streak: user.streak || 1,
      lessonsCompleted: user.lessonsCompleted || 0,
      testsCompleted: user.testsCompleted || 0,
      wordsLearned: user.wordsLearned || 0,
      sentencesChecked: user.sentencesChecked || 0,
      correctAnswers: user.correctAnswers || 0,
      incorrectAnswers: user.incorrectAnswers || 0,
    });
    // If admin, they can start on checker or admin
    setActiveTab(user.role === "admin" ? "admin" : "checker");
  };

  // Handle Logout
  const handleLogout = async () => {
    if (token) {
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch {
        // Ignore network errors on logout
      }
    }
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    setToken(null);
    setCurrentUser(null);
    setActiveTab("checker");
  };

  // Handle Level Change
  const handleChangeLevel = (newLevel: CEFRLevel) => {
    setProfile((prev) => {
      const next = { ...prev, level: newLevel };
      syncProfileToServer(next);
      return next;
    });
  };

  // Handle adding XP points
  const handleAddXP = (amount: number) => {
    setProfile((prev) => {
      const next = { ...prev, xp: prev.xp + amount };
      syncProfileToServer(next);
      return next;
    });
  };

  // Sentence checked handler
  const handleSentenceChecked = () => {
    setProfile((prev) => {
      const next = {
        ...prev,
        sentencesChecked: (prev.sentencesChecked || 0) + 1,
        xp: prev.xp + 5,
      };
      syncProfileToServer(next);
      return next;
    });
  };

  // Save manual mistake
  const handleSaveMistake = (mistake: Omit<MistakeRecord, "id" | "timestamp">) => {
    const record: MistakeRecord = {
      id: `mistake-${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...mistake,
    };
    setMistakes((prev) => [record, ...prev]);
    handleAddXP(5);
  };

  // Daily Challenge completed
  const handleCompleteChallenge = (xpGained: number) => {
    setProfile((prev) => {
      const next = {
        ...prev,
        streak: prev.streak + 1,
        lessonsCompleted: prev.lessonsCompleted + 1,
        xp: prev.xp + xpGained,
      };
      syncProfileToServer(next);
      return next;
    });
  };

  // Vocabulary word learned
  const handleWordLearned = (_word: string) => {
    setProfile((prev) => {
      const next = {
        ...prev,
        wordsLearned: prev.wordsLearned + 1,
        xp: prev.xp + 10,
      };
      syncProfileToServer(next);
      return next;
    });
  };

  // Quiz answer recorded
  const handleRecordAnswer = (isCorrect: boolean) => {
    setProfile((prev) => {
      const next = {
        ...prev,
        correctAnswers: prev.correctAnswers + (isCorrect ? 1 : 0),
        incorrectAnswers: prev.incorrectAnswers + (isCorrect ? 0 : 1),
        xp: prev.xp + (isCorrect ? 10 : 2),
      };
      syncProfileToServer(next);
      return next;
    });
  };

  // Quiz completed
  const handleCompleteTest = () => {
    setProfile((prev) => {
      const next = {
        ...prev,
        testsCompleted: prev.testsCompleted + 1,
        xp: prev.xp + 25,
      };
      syncProfileToServer(next);
      return next;
    });
  };

  // Reset all progress
  const handleResetProgress = () => {
    setProfile(DEFAULT_PROFILE);
    setMistakes([]);
    localStorage.removeItem(STORAGE_PROFILE_KEY);
    localStorage.removeItem(STORAGE_MISTAKES_KEY);
    if (token) {
      syncProfileToServer(DEFAULT_PROFILE);
    }
  };

  // 1. Loading Splash while checking saved session
  if (authLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500 flex items-center justify-center text-white mb-4 shadow-lg ring-4 ring-indigo-500/10 animate-pulse">
          <Sparkles className="w-7 h-7 text-amber-300" />
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-zinc-700 dark:text-zinc-300">
          <Loader2 className="w-4 h-4 animate-spin text-indigo-600 dark:text-indigo-400" />
          <span>Verifying secure session...</span>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated: Show Secure Login Screen from the beginning
  if (!currentUser || !token) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  // 3. Authenticated: Render Main Application with Role Controls
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        profile={profile}
        currentUser={currentUser}
        activeTab={activeTab}
        onSelectTab={(tab) => {
          // If non-admin tries to access admin, fallback to checker
          if (tab === "admin" && currentUser.role !== "admin") {
            setActiveTab("checker");
          } else {
            setActiveTab(tab);
          }
        }}
        onChangeLevel={handleChangeLevel}
        onOpenSettings={() => setIsProfileModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden">
        {activeTab === "checker" && (
          <SentenceChecker
            level={profile.level}
            onSaveMistake={handleSaveMistake}
            onSentenceChecked={handleSentenceChecked}
          />
        )}

        {activeTab === "challenge" && (
          <DailyChallengeView
            level={profile.level}
            onCompleteChallenge={handleCompleteChallenge}
          />
        )}

        {activeTab === "vocab" && (
          <VocabularyVault
            level={profile.level}
            onWordLearned={handleWordLearned}
          />
        )}

        {activeTab === "grammar" && (
          <GrammarMaster
            level={profile.level}
            onAddXP={handleAddXP}
          />
        )}

        {activeTab === "quiz" && (
          <QuizView
            level={profile.level}
            onRecordAnswer={handleRecordAnswer}
            onCompleteTest={handleCompleteTest}
          />
        )}

        {/* Private Admin Panel: only accessible to Admin users */}
        {activeTab === "admin" && currentUser.role === "admin" && (
          <AdminPanelView token={token} currentAdmin={currentUser} />
        )}
      </main>

      {/* Profile & Stats Modal */}
      <ProfileStatsModal
        profile={profile}
        mistakes={mistakes}
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onUpdateName={(name) => setProfile((prev) => ({ ...prev, name }))}
        onChangeLevel={handleChangeLevel}
        onClearMistakes={() => setMistakes([])}
        onResetProgress={handleResetProgress}
      />
    </div>
  );
}

