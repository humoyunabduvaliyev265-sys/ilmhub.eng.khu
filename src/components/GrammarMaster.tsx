import React, { useState, useEffect } from "react";
import { CEFRLevel } from "../types";
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Loader2,
} from "lucide-react";

interface GrammarMasterProps {
  level: CEFRLevel;
  onAddXP: (amount: number) => void;
}

interface CommonMistake {
  incorrect: string;
  correct: string;
  reason: string;
}

interface MiniQuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface GrammarLessonData {
  title: string;
  level: string;
  formula: string;
  explanation: string;
  uzbekExplanation: string;
  examples: string[];
  commonMistakes: CommonMistake[];
  quiz: MiniQuizQuestion[];
}

const COMMON_GRAMMAR_TOPICS: Record<CEFRLevel, string[]> = {
  A1: ["Present Simple", "To Be (am/is/are)", "Basic Prepositions (in/on/at)", "Articles (a/an/the)"],
  A2: ["Past Simple (regular & irregular)", "Present Continuous", "Comparatives & Superlatives", "Modals (can/could/should)"],
  B1: ["Present Perfect vs Past Simple", "First & Second Conditionals", "Passive Voice Basics", "Gerunds vs Infinitives"],
  B2: ["Third Conditional & Mixed", "Reported Speech", "Relative Clauses (defining/non-defining)", "Future Continuous & Perfect"],
  C1: ["Inversion for Emphasis", "Subjunctive Mood", "Participle Clauses", "Advanced Cleft Sentences"],
  C2: ["Nuanced Modal Collocations", "Idiomatic Prepositional Verbs", "Complex Register Shifts", "Ellipsis and Substitution"],
};

export const GrammarMaster: React.FC<GrammarMasterProps> = ({
  level,
  onAddXP,
}) => {
  const defaultTopics = COMMON_GRAMMAR_TOPICS[level] || COMMON_GRAMMAR_TOPICS.A1;
  const [selectedTopic, setSelectedTopic] = useState(defaultTopics[0]);
  const [customTopic, setCustomTopic] = useState("");
  const [lesson, setLesson] = useState<GrammarLessonData | null>(null);
  const [loading, setLoading] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<Record<number, boolean>>({});

  const fetchLesson = async (topic: string) => {
    setLoading(true);
    setQuizAnswers({});
    setQuizSubmitted({});

    try {
      const res = await fetch("/api/grammar-lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, level }),
      });

      if (!res.ok) throw new Error("Could not load grammar lesson.");
      const data: GrammarLessonData = await res.json();
      setLesson(data);
    } catch (err) {
      console.error("Grammar lesson error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLesson(selectedTopic);
  }, [selectedTopic, level]);

  const handleSelectQuizOption = (qIdx: number, optIdx: number) => {
    if (quizSubmitted[qIdx]) return;
    setQuizAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleSubmitQuizQuestion = (qIdx: number) => {
    if (quizAnswers[qIdx] === undefined || !lesson) return;
    setQuizSubmitted((prev) => ({ ...prev, [qIdx]: true }));

    const isCorrect = quizAnswers[qIdx] === lesson.quiz[qIdx].correctIndex;
    if (isCorrect) {
      onAddXP(10);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/70 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-1">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Grammar Rules & Exercises</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
            Formulas, Explanations & Mini Practice
          </h2>
          <p className="text-xs text-zinc-700 dark:text-zinc-300">
            Learn grammar step-by-step with zero confusion for CEFR level {level}.
          </p>
        </div>

        <button
          onClick={() => fetchLesson(selectedTopic)}
          className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Topics Selector Pill Bar */}
      <div className="mb-6">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
          {defaultTopics.map((topic) => (
            <button
              key={topic}
              onClick={() => {
                setSelectedTopic(topic);
                setCustomTopic("");
              }}
              className={`text-xs px-3.5 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors ${
                selectedTopic === topic && !customTopic
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-indigo-300"
              }`}
            >
              {topic}
            </button>
          ))}
        </div>

        {/* Custom topic input */}
        <div className="mt-2 flex gap-2">
          <input
            type="text"
            id="custom-grammar-topic-input"
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
            placeholder="Or type any grammar topic (e.g. Used to vs Would)..."
            className="flex-1 text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-700 dark:placeholder-zinc-300 focus:outline-none"
          />
          <button
            id="custom-grammar-topic-btn"
            onClick={() => {
              if (customTopic.trim()) fetchLesson(customTopic.trim());
            }}
            disabled={!customTopic.trim() || loading}
            className="px-4 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold hover:opacity-90 disabled:opacity-50"
          >
            Study Topic
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] text-center p-6">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
            Formulating Grammar Guide...
          </h3>
          <p className="text-xs text-zinc-700 dark:text-zinc-300 mt-1">
            Analyzing formulas, typical errors, and creating practice questions
          </p>
        </div>
      ) : (
        lesson && (
          <div className="space-y-6">
            {/* Rule & Formula Banner */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100">
                  {lesson.title}
                </h3>
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/70">
                  CEFR {lesson.level}
                </span>
              </div>

              {/* Formula Block */}
              {lesson.formula && (
                <div className="p-3.5 rounded-xl bg-zinc-900 dark:bg-zinc-950 text-white font-mono text-sm mb-4 flex items-center gap-2">
                  <span className="text-xs uppercase tracking-wider text-indigo-400 font-bold">
                    Formula:
                  </span>
                  <span className="font-semibold text-zinc-100">{lesson.formula}</span>
                </div>
              )}

              {/* Explanations */}
              <div className="space-y-3 text-sm">
                <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  {lesson.explanation}
                </p>

                {lesson.uzbekExplanation && (
                  <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 text-xs">
                    <span className="font-bold text-amber-800 dark:text-amber-300 block mb-0.5">
                      🇺🇿 O'zbekcha Tushuntirish:
                    </span>
                    <p className="text-zinc-700 dark:text-zinc-300">{lesson.uzbekExplanation}</p>
                  </div>
                )}
              </div>

              {/* Examples */}
              {lesson.examples && lesson.examples.length > 0 && (
                <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                    Practical Examples:
                  </h4>
                  <ul className="space-y-1.5 text-sm">
                    {lesson.examples.map((ex, i) => (
                      <li key={i} className="flex items-start gap-2 text-zinc-800 dark:text-zinc-200">
                        <span className="text-indigo-600 font-bold">•</span>
                        <span>{ex}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Common Mistakes Card */}
            {lesson.commonMistakes && lesson.commonMistakes.length > 0 && (
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs">
                <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Common Mistakes to Avoid
                </h4>

                <div className="space-y-3">
                  {lesson.commonMistakes.map((mistake, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs space-y-1.5"
                    >
                      <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
                        <span className="text-rose-700 dark:text-rose-400 line-through">
                          ✗ {mistake.incorrect}
                        </span>
                        <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                          ✓ {mistake.correct}
                        </span>
                      </div>
                      <p className="text-zinc-700 dark:text-zinc-300 font-sans">
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200">Why:</span>{" "}
                        {mistake.reason}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Interactive Mini Quiz */}
            {lesson.quiz && lesson.quiz.length > 0 && (
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs">
                <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 mb-4">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  Mini Practice Test
                </h4>

                <div className="space-y-6">
                  {lesson.quiz.map((q, qIdx) => {
                    const selected = quizAnswers[qIdx];
                    const submitted = quizSubmitted[qIdx];
                    const isCorrect = selected === q.correctIndex;

                    return (
                      <div key={qIdx} className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-700">
                        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
                          {qIdx + 1}. {q.question}
                        </p>

                        <div className="space-y-2 mb-3">
                          {q.options.map((opt, optIdx) => {
                            const isChosen = selected === optIdx;
                            const isCorrectOpt = optIdx === q.correctIndex;

                            return (
                              <button
                                key={optIdx}
                                onClick={() => handleSelectQuizOption(qIdx, optIdx)}
                                disabled={submitted}
                                className={`w-full text-left p-3 rounded-lg border text-xs font-medium transition-colors flex items-center justify-between ${
                                  submitted && isCorrectOpt
                                    ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-200"
                                    : submitted && isChosen && !isCorrectOpt
                                    ? "bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-800 dark:text-rose-200"
                                    : isChosen
                                    ? "bg-indigo-50 dark:bg-indigo-950/30 border-indigo-500 text-indigo-900 dark:text-indigo-100"
                                    : "border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                                }`}
                              >
                                <span>{opt}</span>
                                {submitted && isCorrectOpt && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                                {submitted && isChosen && !isCorrectOpt && <XCircle className="w-4 h-4 text-rose-600" />}
                              </button>
                            );
                          })}
                        </div>

                        {!submitted ? (
                          <button
                            onClick={() => handleSubmitQuizQuestion(qIdx)}
                            disabled={selected === undefined}
                            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-semibold text-xs transition-colors"
                          >
                            Check
                          </button>
                        ) : (
                          <div className="p-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-xs text-zinc-700 dark:text-zinc-300">
                            <span className="font-bold text-zinc-900 dark:text-zinc-100">
                              {isCorrect ? "Correct! (+10 XP)" : "Incorrect."}
                            </span>{" "}
                            {q.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        )
      )}
    </div>
  );
};
