import React, { useState } from "react";
import { CEFRLevel, MistakeRecord } from "../types";
import { speakEnglishText } from "../utils/speech";
import {
  CheckCircle2,
  AlertTriangle,
  Volume2,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  BookOpen,
  BookmarkPlus,
  Loader2,
} from "lucide-react";

interface SentenceCheckerProps {
  level: CEFRLevel;
  onSaveMistake: (mistake: Omit<MistakeRecord, "id" | "timestamp">) => void;
  onSentenceChecked?: () => void;
}

interface AnalysisResult {
  hasMistake: boolean;
  original: string;
  corrected: string;
  explanation: string;
  naturalAlternative: string;
  uzbekExplanation?: string;
  mistakeType?: string;
}

export const SentenceChecker: React.FC<SentenceCheckerProps> = ({
  level,
  onSaveMistake,
  onSentenceChecked,
}) => {
  const [inputSentence, setInputSentence] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const sampleSentences = [
    "I am go to school yesterday and see my friend.",
    "I very like watching action movies on weekend.",
    "She don't know the answer of this question.",
    "I am living here since five years.",
  ];

  const handleCheck = async (sentenceToCheck?: string) => {
    const text = sentenceToCheck || inputSentence;
    if (!text.trim() || loading) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setSaved(false);

    try {
      const res = await fetch("/api/sentence-correction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sentence: text.trim(), level }),
      });

      if (!res.ok) {
        throw new Error("Could not check sentence. Please try again.");
      }

      const data: AnalysisResult = await res.json();
      setResult(data);
      if (onSentenceChecked) {
        onSentenceChecked();
      }
    } catch (err: any) {
      setError(err.message || "Failed to analyze sentence.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCorrected = () => {
    if (!result?.corrected) return;
    navigator.clipboard.writeText(result.corrected);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveToTracker = () => {
    if (!result || saved) return;
    onSaveMistake({
      original: result.original,
      corrected: result.corrected,
      explanation: result.explanation,
      topic: result.mistakeType || "Grammar",
    });
    setSaved(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/70 dark:border-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Instant Sentence Correction Engine</span>
        </div>
        <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
          Test & Polish Any Sentence
        </h2>
        <p className="text-sm text-zinc-700 dark:text-zinc-300 mt-1">
          Type or paste any English sentence. Coach Khumoyun will analyze grammar, prepositions, tenses, and natural native alternatives for your level ({level}).
        </p>
      </div>

      {/* Input Card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs mb-6">
        <textarea
          id="sentence-checker-input"
          value={inputSentence}
          onChange={(e) => setInputSentence(e.target.value)}
          placeholder="e.g. Yesterday I go to school and see my friend..."
          rows={3}
          className="w-full p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 placeholder-zinc-700 dark:placeholder-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
        />

        <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-zinc-700 dark:text-zinc-300 font-medium">Try an example:</span>
            {sampleSentences.map((sample, idx) => (
              <button
                key={idx}
                id={`sample-sentence-${idx}`}
                onClick={() => {
                  setInputSentence(sample);
                  handleCheck(sample);
                }}
                className="text-xs px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 transition-colors truncate max-w-[200px]"
                title={sample}
              >
                "{sample.slice(0, 24)}..."
              </button>
            ))}
          </div>

          <button
            id="check-sentence-submit-btn"
            onClick={() => handleCheck()}
            disabled={!inputSentence.trim() || loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-sm shadow-xs transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Checking...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Check Sentence</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-sm">
          {error}
        </div>
      )}

      {/* Result Card */}
      {result && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800 mb-5">
            <div className="flex items-center gap-2">
              {result.hasMistake ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 text-amber-700 dark:text-amber-400 text-xs font-bold">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Mistake Detected & Corrected
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Great! Completely Natural & Accurate
                </span>
              )}

              {result.mistakeType && (
                <span className="text-xs px-2.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium">
                  {result.mistakeType}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => speakEnglishText(result.corrected)}
                className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 hover:text-zinc-700 dark:text-zinc-300 dark:hover:text-zinc-300 transition-colors"
                title="Listen to native pronunciation"
              >
                <Volume2 className="w-4 h-4" />
              </button>

              <button
                onClick={handleCopyCorrected}
                className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 hover:text-zinc-700 dark:text-zinc-300 dark:hover:text-zinc-300 transition-colors"
                title="Copy corrected sentence"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Side by Side or Stacked Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/70 dark:border-rose-900/40">
              <span className="text-[11px] uppercase tracking-wider font-bold text-rose-700 dark:text-rose-400 block mb-1">
                Original Input
              </span>
              <p className="text-sm font-mono text-zinc-800 dark:text-zinc-200">
                {result.original}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-900/40">
              <span className="text-[11px] uppercase tracking-wider font-bold text-emerald-700 dark:text-emerald-400 block mb-1">
                Corrected Native English
              </span>
              <p className="text-sm font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                {result.corrected}
              </p>
            </div>
          </div>

          {/* Explanation Section */}
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 mb-1">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                Coach's Explanation
              </h4>
              <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                {result.explanation}
              </p>
            </div>

            {/* Natural Alternative */}
            {result.naturalAlternative && (
              <div className="p-3.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-900/40">
                <span className="text-xs font-bold text-indigo-800 dark:text-indigo-300 block mb-1">
                  💡 Natural Native Phrasing:
                </span>
                <p className="text-zinc-800 dark:text-zinc-200 text-sm font-medium">
                  "{result.naturalAlternative}"
                </p>
              </div>
            )}

            {/* Uzbek Clarification */}
            {result.uzbekExplanation && (
              <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30">
                <span className="text-xs font-bold text-amber-800 dark:text-amber-300 block mb-1">
                  🇺🇿 O'zbekcha Izoh:
                </span>
                <p className="text-zinc-700 dark:text-zinc-300 text-xs leading-relaxed">
                  {result.uzbekExplanation}
                </p>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-5 mt-6 border-t border-zinc-100 dark:border-zinc-800">
            <button
              id="save-mistake-btn"
              onClick={handleSaveToTracker}
              disabled={saved}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border transition-colors ${
                saved
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800"
                  : "border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
              }`}
            >
              {saved ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Saved to Mistakes Log (+5 XP)</span>
                </>
              ) : (
                <>
                  <BookmarkPlus className="w-3.5 h-3.5" />
                  <span>Add to Mistakes Review</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                setInputSentence("");
                setResult(null);
              }}
              className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Check Another Sentence</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
