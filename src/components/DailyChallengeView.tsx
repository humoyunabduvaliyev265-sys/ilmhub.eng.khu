import React, { useState, useEffect } from "react";
import { CEFRLevel } from "../types";
import { speakEnglishText } from "../utils/speech";
import {
  Calendar,
  Sparkles,
  CheckCircle2,
  XCircle,
  Award,
  ArrowRight,
  RotateCcw,
  Volume2,
  Loader2,
  BookOpen,
  HelpCircle,
} from "lucide-react";

interface DailyChallengeProps {
  level: CEFRLevel;
  onCompleteChallenge: (xpGained: number) => void;
}

interface ChallengeTask {
  id: string;
  type: "vocabulary" | "grammar" | "correction" | "conversation";
  instruction: string;
  question?: string;
  options?: string[];
  correctIndex?: number;
  explanation?: string;
  uzbekHint?: string;
  incorrectSentence?: string;
  correctSentence?: string;
  prompt?: string;
  sampleResponse?: string;
}

interface ChallengeData {
  title: string;
  theme: string;
  tasks: ChallengeTask[];
}

export const DailyChallengeView: React.FC<DailyChallengeProps> = ({
  level,
  onCompleteChallenge,
}) => {
  const [loading, setLoading] = useState(true);
  const [challenge, setChallenge] = useState<ChallengeData | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [correctionInput, setCorrectionInput] = useState("");
  const [speakingInput, setSpeakingInput] = useState("");
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadChallenge = async () => {
    setLoading(true);
    setError(null);
    setCurrentStep(0);
    setSelectedOption(null);
    setCorrectionInput("");
    setSpeakingInput("");
    setIsAnswerSubmitted(false);
    setIsCorrect(null);
    setScore(0);
    setIsCompleted(false);

    try {
      const res = await fetch("/api/daily-challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level }),
      });

      if (!res.ok) {
        throw new Error("Failed to load daily challenge.");
      }

      const data: ChallengeData = await res.json();
      setChallenge(data);
    } catch (err: any) {
      setError(err.message || "Failed to load challenge.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChallenge();
  }, [level]);

  const currentTask = challenge?.tasks?.[currentStep];

  const handleSelectOption = (idx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(idx);
  };

  const handleSubmitStep = () => {
    if (!currentTask || isAnswerSubmitted) return;

    if (currentTask.type === "vocabulary" || currentTask.type === "grammar") {
      const correct = selectedOption === currentTask.correctIndex;
      setIsCorrect(correct);
      if (correct) setScore((prev) => prev + 1);
    } else if (currentTask.type === "correction") {
      // Fuzzy match or non-empty attempt
      const userText = correctionInput.trim().toLowerCase();
      const target = (currentTask.correctSentence || "").trim().toLowerCase();
      const correct = userText === target || userText.length > 5;
      setIsCorrect(correct);
      if (correct) setScore((prev) => prev + 1);
    } else if (currentTask.type === "conversation") {
      setIsCorrect(true);
      setScore((prev) => prev + 1);
    }

    setIsAnswerSubmitted(true);
  };

  const handleNextStep = () => {
    if (!challenge) return;

    if (currentStep + 1 < challenge.tasks.length) {
      setCurrentStep((prev) => prev + 1);
      setSelectedOption(null);
      setCorrectionInput("");
      setSpeakingInput("");
      setIsAnswerSubmitted(false);
      setIsCorrect(null);
    } else {
      setIsCompleted(true);
      onCompleteChallenge(50); // Award 50 XP
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
        <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">
          Generating Today's English Challenge...
        </h3>
        <p className="text-xs text-zinc-700 dark:text-zinc-300 mt-1">
          Tailored to your CEFR {level} level by Coach Khumoyun
        </p>
      </div>
    );
  }

  if (error || !challenge || !challenge.tasks || challenge.tasks.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center p-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs my-8">
        <XCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h3 className="font-bold text-zinc-900 dark:text-zinc-100">Challenge Unavailable</h3>
        <p className="text-xs text-zinc-700 dark:text-zinc-300 mt-1 mb-4">{error || "Please try again."}</p>
        <button
          onClick={loadChallenge}
          className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 text-amber-800 dark:text-amber-300 text-xs font-semibold mb-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>Daily English Challenge</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
            {challenge.title || "Daily English Workout"}
          </h2>
          <p className="text-xs text-zinc-700 dark:text-zinc-300">
            Theme: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{challenge.theme}</span> · Level: {level}
          </p>
        </div>

        <button
          onClick={loadChallenge}
          className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
          title="Regenerate challenge"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>New Set</span>
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-2 rounded-full mb-6 overflow-hidden">
        <div
          className="bg-indigo-600 h-full transition-all duration-300 rounded-full"
          style={{ width: `${((currentStep + (isCompleted ? 1 : 0)) / challenge.tasks.length) * 100}%` }}
        />
      </div>

      {/* Challenge Completed State */}
      {isCompleted ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 text-center shadow-sm">
          <div className="w-16 h-16 bg-amber-100 dark:bg-amber-950/60 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-600 dark:text-amber-400">
            <Award className="w-9 h-9" />
          </div>
          <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
            Daily Challenge Complete!
          </h3>
          <p className="text-sm text-zinc-700 dark:text-zinc-300 mt-2 max-w-md mx-auto">
            Awesome effort, Khumoyun! You completed today's 4-part training session.
          </p>

          <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto my-6">
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
              <span className="text-xs text-zinc-700 dark:text-zinc-300 font-medium block">Score</span>
              <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                {score} / {challenge.tasks.length}
              </span>
            </div>
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-900">
              <span className="text-xs text-indigo-700 dark:text-indigo-300 font-medium block">XP Earned</span>
              <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">+50 XP</span>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={loadChallenge}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-xs transition-colors"
            >
              Practice Another Set
            </button>
          </div>
        </div>
      ) : (
        /* Active Task Card */
        currentTask && (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
            {/* Task Meta */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-100 dark:border-zinc-800 text-xs">
              <span className="font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Task {currentStep + 1} of {challenge.tasks.length}: {currentTask.type}
              </span>
              <span className="text-zinc-700 dark:text-zinc-300">{currentTask.instruction}</span>
            </div>

            {/* Task Type 1 & 2: Multiple Choice (Vocab & Grammar) */}
            {(currentTask.type === "vocabulary" || currentTask.type === "grammar") && (
              <div>
                <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-4">
                  {currentTask.question}
                </h3>

                <div className="space-y-2.5 mb-6">
                  {currentTask.options?.map((opt, idx) => {
                    const isSelected = selectedOption === idx;
                    const isTarget = isAnswerSubmitted && idx === currentTask.correctIndex;
                    const isWrongSelection = isAnswerSubmitted && isSelected && !isTarget;

                    return (
                      <button
                        key={idx}
                        id={`challenge-opt-${idx}`}
                        onClick={() => handleSelectOption(idx)}
                        disabled={isAnswerSubmitted}
                        className={`w-full text-left p-3.5 rounded-xl border text-sm font-medium transition-all flex items-center justify-between ${
                          isTarget
                            ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 text-emerald-900 dark:text-emerald-100"
                            : isWrongSelection
                            ? "bg-rose-50 dark:bg-rose-950/30 border-rose-400 text-rose-900 dark:text-rose-100"
                            : isSelected
                            ? "bg-indigo-50 dark:bg-indigo-950/30 border-indigo-500 text-indigo-900 dark:text-indigo-100"
                            : "border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 text-zinc-800 dark:text-zinc-200"
                        }`}
                      >
                        <span>{opt}</span>
                        {isTarget && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />}
                        {isWrongSelection && <XCircle className="w-4 h-4 text-rose-600 shrink-0 ml-2" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Task Type 3: Sentence Correction */}
            {currentTask.type === "correction" && (
              <div>
                <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 block mb-1">
                  Spot & Fix the Mistake:
                </span>
                <div className="p-3.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/70 dark:border-rose-900/40 text-sm font-mono text-zinc-900 dark:text-zinc-100 mb-4">
                  "{currentTask.incorrectSentence}"
                </div>

                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Your corrected sentence:
                </label>
                <input
                  type="text"
                  id="challenge-correction-input"
                  value={correctionInput}
                  onChange={(e) => setCorrectionInput(e.target.value)}
                  disabled={isAnswerSubmitted}
                  placeholder="Type the corrected sentence..."
                  className="w-full p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />

                {isAnswerSubmitted && (
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs mb-4">
                    <span className="font-bold text-emerald-800 dark:text-emerald-300">Expected:</span>{" "}
                    <span className="font-mono text-zinc-800 dark:text-zinc-200">{currentTask.correctSentence}</span>
                  </div>
                )}
              </div>
            )}

            {/* Task Type 4: Conversation Prompt */}
            {currentTask.type === "conversation" && (
              <div>
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 block mb-1">
                  Speaking & Fluency Prompt:
                </span>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-3">
                  "{currentTask.prompt}"
                </h3>

                <textarea
                  id="challenge-speaking-input"
                  value={speakingInput}
                  onChange={(e) => setSpeakingInput(e.target.value)}
                  disabled={isAnswerSubmitted}
                  placeholder="Write your answer in English or try speaking it out loud..."
                  rows={3}
                  className="w-full p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />

                {isAnswerSubmitted && currentTask.sampleResponse && (
                  <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 text-xs mb-4">
                    <span className="font-bold text-indigo-800 dark:text-indigo-300">Sample Native Response:</span>{" "}
                    <p className="text-zinc-700 dark:text-zinc-300 mt-1">{currentTask.sampleResponse}</p>
                  </div>
                )}
              </div>
            )}

            {/* Explanation / Uzbek Tip Box after answer */}
            {isAnswerSubmitted && (
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-xs space-y-2 mb-5">
                {currentTask.explanation && (
                  <div>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">Explanation:</span>{" "}
                    <span className="text-zinc-700 dark:text-zinc-300">{currentTask.explanation}</span>
                  </div>
                )}
                {currentTask.uzbekHint && (
                  <div className="text-amber-800 dark:text-amber-300">
                    <span className="font-bold">🇺🇿 O'zbekcha Maslahat:</span> {currentTask.uzbekHint}
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-2">
              {!isAnswerSubmitted ? (
                <button
                  id="challenge-submit-step-btn"
                  onClick={handleSubmitStep}
                  disabled={
                    (currentTask.type === "vocabulary" || currentTask.type === "grammar") && selectedOption === null
                  }
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-semibold text-sm shadow-xs transition-colors"
                >
                  Check Answer
                </button>
              ) : (
                <button
                  id="challenge-next-step-btn"
                  onClick={handleNextStep}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-xs transition-colors"
                >
                  <span>{currentStep + 1 < challenge.tasks.length ? "Next Task" : "Finish Challenge"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )
      )}
    </div>
  );
};
