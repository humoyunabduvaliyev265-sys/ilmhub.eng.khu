import React, { useState } from "react";
import { CEFRLevel } from "../types";
import {
  Trophy,
  Sparkles,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Loader2,
  ArrowRight,
  HelpCircle,
  Award,
  Target,
} from "lucide-react";

interface QuizViewProps {
  level: CEFRLevel;
  onRecordAnswer: (isCorrect: boolean) => void;
  onCompleteTest: () => void;
}

interface QuizQuestion {
  id: number;
  category: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  uzbekTip?: string;
}

export const QuizView: React.FC<QuizViewProps> = ({
  level,
  onRecordAnswer,
  onCompleteTest,
}) => {
  const [questionCount, setQuestionCount] = useState(5);
  const [quizMode, setQuizMode] = useState("mixed");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startQuiz = async () => {
    setLoading(true);
    setError(null);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswerChecked(false);
    setCorrectCount(0);
    setIsFinished(false);

    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level, count: questionCount, mode: quizMode }),
      });

      if (!res.ok) throw new Error("Failed to generate test.");
      const data = await res.json();
      if (!data.questions || data.questions.length === 0) {
        throw new Error("No questions returned.");
      }
      setQuestions(data.questions);
    } catch (err: any) {
      setError(err.message || "Could not load test.");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckAnswer = () => {
    if (selectedOption === null || isAnswerChecked) return;

    const currentQ = questions[currentIndex];
    const isCorrect = selectedOption === currentQ.correctIndex;

    setIsAnswerChecked(true);
    if (isCorrect) {
      setCorrectCount((prev) => prev + 1);
    }
    onRecordAnswer(isCorrect);
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerChecked(false);
    } else {
      setIsFinished(true);
      onCompleteTest();
    }
  };

  const currentQ = questions[currentIndex];

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/70 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-1">
            <Trophy className="w-3.5 h-3.5" />
            <span>Interactive Level Test & Quiz</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
            Test Your English Proficiency ({level})
          </h2>
          <p className="text-xs text-zinc-700 dark:text-zinc-300">
            One question at a time with instant feedback, explanations, and accuracy tracking.
          </p>
        </div>

        {questions.length > 0 && !isFinished && (
          <button
            onClick={startQuiz}
            className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restart</span>
          </button>
        )}
      </div>

      {/* Setup screen if not started yet */}
      {questions.length === 0 && !loading && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xs text-center">
          <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-950/60 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-600 dark:text-indigo-400">
            <Target className="w-8 h-8" />
          </div>

          <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100 mb-2">
            Configure Your English Test
          </h3>
          <p className="text-xs text-zinc-700 dark:text-zinc-300 max-w-sm mx-auto mb-6">
            Coach Khumoyun will prepare questions matching your CEFR {level} level.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto mb-6 text-left text-xs">
            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Number of Questions:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[5, 10].map((count) => (
                  <button
                    key={count}
                    onClick={() => setQuestionCount(count)}
                    className={`py-2 px-3 rounded-lg border font-semibold text-center transition-colors ${
                      questionCount === count
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    {count} Questions
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Category:
              </label>
              <select
                value={quizMode}
                onChange={(e) => setQuizMode(e.target.value)}
                className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
              >
                <option value="mixed">Mixed (Grammar & Vocab)</option>
                <option value="grammar">Grammar Focus</option>
                <option value="vocabulary">Vocabulary & Collocations</option>
                <option value="natural">Natural English Phrasing</option>
              </select>
            </div>
          </div>

          <button
            id="start-quiz-btn"
            onClick={startQuiz}
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-sm transition-colors"
          >
            Start Test Now
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center min-h-[300px] text-center p-6">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
            Generating {questionCount} Test Questions...
          </h3>
          <p className="text-xs text-zinc-700 dark:text-zinc-300 mt-1">
            Setting up mixed challenges for CEFR {level}
          </p>
        </div>
      )}

      {/* Active Question */}
      {!loading && questions.length > 0 && !isFinished && currentQ && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
          {/* Progress bar */}
          <div className="flex items-center justify-between text-xs text-zinc-700 dark:text-zinc-300 mb-2 font-semibold">
            <span>
              Question {currentIndex + 1} of {questions.length}
            </span>
            <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
              {currentQ.category}
            </span>
          </div>
          <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full mb-6 overflow-hidden">
            <div
              className="bg-indigo-600 h-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>

          <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-4">
            {currentQ.question}
          </h3>

          {/* Options */}
          <div className="space-y-2.5 mb-6">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrectTarget = isAnswerChecked && idx === currentQ.correctIndex;
              const isWrongSelection = isAnswerChecked && isSelected && !isCorrectTarget;

              return (
                <button
                  key={idx}
                  id={`quiz-opt-${idx}`}
                  onClick={() => {
                    if (!isAnswerChecked) setSelectedOption(idx);
                  }}
                  disabled={isAnswerChecked}
                  className={`w-full text-left p-3.5 rounded-xl border text-sm font-medium transition-all flex items-center justify-between ${
                    isCorrectTarget
                      ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 text-emerald-900 dark:text-emerald-100"
                      : isWrongSelection
                      ? "bg-rose-50 dark:bg-rose-950/30 border-rose-400 text-rose-900 dark:text-rose-100"
                      : isSelected
                      ? "bg-indigo-50 dark:bg-indigo-950/30 border-indigo-500 text-indigo-900 dark:text-indigo-100"
                      : "border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 text-zinc-800 dark:text-zinc-200"
                  }`}
                >
                  <span>{opt}</span>
                  {isCorrectTarget && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />}
                  {isWrongSelection && <XCircle className="w-4 h-4 text-rose-600 shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>

          {/* Explanation Banner */}
          {isAnswerChecked && (
            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/70 border border-zinc-200 dark:border-zinc-700 text-xs space-y-1.5 mb-5">
              <div>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">
                  {selectedOption === currentQ.correctIndex ? "✓ Correct!" : "✗ Incorrect."}
                </span>{" "}
                <span className="text-zinc-700 dark:text-zinc-300">{currentQ.explanation}</span>
              </div>
              {currentQ.uzbekTip && (
                <div className="text-amber-800 dark:text-amber-300 font-medium">
                  🇺🇿 {currentQ.uzbekTip}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            {!isAnswerChecked ? (
              <button
                id="quiz-check-btn"
                onClick={handleCheckAnswer}
                disabled={selectedOption === null}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-semibold text-sm shadow-xs transition-colors"
              >
                Submit Answer
              </button>
            ) : (
              <button
                id="quiz-next-btn"
                onClick={handleNext}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-xs transition-colors"
              >
                <span>{currentIndex + 1 < questions.length ? "Next Question" : "See Final Score"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Finished Summary */}
      {isFinished && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 text-center shadow-sm">
          <div className="w-16 h-16 bg-amber-100 dark:bg-amber-950/60 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-600 dark:text-amber-400">
            <Trophy className="w-9 h-9" />
          </div>

          <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
            Test Finished!
          </h3>
          <p className="text-sm text-zinc-700 dark:text-zinc-300 mt-1">
            Great practice session, Khumoyun! Here is your test performance:
          </p>

          <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto my-6">
            <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
              <span className="text-xs text-zinc-700 dark:text-zinc-300 font-medium block">Score</span>
              <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {correctCount} / {questions.length}
              </span>
            </div>
            <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-900">
              <span className="text-xs text-indigo-700 dark:text-indigo-300 font-medium block">Accuracy</span>
              <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {Math.round((correctCount / questions.length) * 100)}%
              </span>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => {
                setQuestions([]);
                setIsFinished(false);
              }}
              className="px-5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm font-semibold text-zinc-700 dark:text-zinc-200 transition-colors"
            >
              Choose Another Test
            </button>
            <button
              onClick={startQuiz}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-xs transition-colors"
            >
              Retake Test
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
