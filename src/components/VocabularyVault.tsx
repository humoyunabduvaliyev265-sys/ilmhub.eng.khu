import React, { useState, useEffect } from "react";
import { CEFRLevel, VocabWord } from "../types";
import { CONVERSATION_TOPICS } from "../data/constants";
import { speakEnglishText } from "../utils/speech";
import {
  BookOpen,
  Volume2,
  Check,
  Plus,
  Sparkles,
  RotateCcw,
  Loader2,
  Search,
} from "lucide-react";

interface VocabularyVaultProps {
  level: CEFRLevel;
  onWordLearned: (word: string) => void;
}

export const VocabularyVault: React.FC<VocabularyVaultProps> = ({
  level,
  onWordLearned,
}) => {
  const [selectedTopic, setSelectedTopic] = useState("Daily Life");
  const [words, setWords] = useState<VocabWord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [learnedSet, setLearnedSet] = useState<Set<string>>(new Set());

  const fetchVocabulary = async (topic = selectedTopic) => {
    setLoading(true);
    try {
      const res = await fetch("/api/vocabulary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, level, count: 8 }),
      });

      if (!res.ok) throw new Error("Failed to load vocabulary.");
      const data = await res.json();
      setWords(data.words || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVocabulary(selectedTopic);
  }, [selectedTopic, level]);

  const handleLearnToggle = (word: string) => {
    const updated = new Set(learnedSet);
    if (updated.has(word)) {
      updated.delete(word);
    } else {
      updated.add(word);
      onWordLearned(word);
    }
    setLearnedSet(updated);
  };

  const filteredWords = words.filter(
    (w) =>
      w.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.uzbekMeaning.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.collocation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/70 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-1">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Vocabulary Builder</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
            Collocations & Thematic Word Vault
          </h2>
          <p className="text-xs text-zinc-700 dark:text-zinc-300">
            Learn words with natural collocations, Uzbek meanings, and pronunciation for level {level}.
          </p>
        </div>

        <button
          id="vocab-refresh-btn"
          onClick={() => fetchVocabulary()}
          disabled={loading}
          className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>New Words</span>
        </button>
      </div>

      {/* Controls Bar: Topic selector & Search */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
            Select Topic:
          </label>
          <select
            id="vocab-topic-select"
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
          >
            {CONVERSATION_TOPICS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
            Filter Cards:
          </label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-zinc-700 dark:text-zinc-300" />
            <input
              type="text"
              id="vocab-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by word, collocation, or Uzbek..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] text-center p-6">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
            Generating Curated Words for "{selectedTopic}"...
          </h3>
          <p className="text-xs text-zinc-700 dark:text-zinc-300 mt-1">
            Calculating collocations and native example sentences
          </p>
        </div>
      ) : (
        /* Word Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredWords.map((item, idx) => {
            const isLearned = learnedSet.has(item.word);

            return (
              <div
                key={idx}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-800 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100">
                          {item.word}
                        </h3>
                        <button
                          onClick={() => speakEnglishText(item.word)}
                          className="p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 hover:text-zinc-700 dark:text-zinc-300 dark:hover:text-zinc-300 transition-colors"
                          title="Pronounce word"
                        >
                          <Volume2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                          {item.partOfSpeech}
                        </span>
                        {item.phonetic && (
                          <span className="text-xs font-mono text-zinc-700 dark:text-zinc-300">
                            {item.phonetic}
                          </span>
                        )}
                      </div>
                    </div>

                    <span className="text-xs font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-200/70 dark:border-amber-900/40">
                      🇺🇿 {item.uzbekMeaning}
                    </span>
                  </div>

                  {/* Collocation */}
                  {item.collocation && (
                    <div className="mb-3 p-2.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-900/30 text-xs">
                      <span className="font-bold text-indigo-800 dark:text-indigo-300 block mb-0.5">
                        🔗 Common Collocation:
                      </span>
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                        {item.collocation}
                      </span>
                    </div>
                  )}

                  {/* Example Sentence */}
                  <div className="text-xs text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800/60 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 mb-4">
                    <div className="flex items-center justify-between text-zinc-700 dark:text-zinc-300 mb-1">
                      <span className="font-medium">Example:</span>
                      <button
                        onClick={() => speakEnglishText(item.exampleSentence)}
                        className="hover:text-zinc-700 dark:hover:text-zinc-300"
                        title="Listen to sentence"
                      >
                        <Volume2 className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="italic text-zinc-800 dark:text-zinc-200">
                      "{item.exampleSentence}"
                    </p>
                  </div>
                </div>

                {/* Footer buttons */}
                <div className="flex items-center justify-between gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <button
                    onClick={() => handleLearnToggle(item.word)}
                    className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                      isLearned
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800"
                        : "border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    {isLearned ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Learned (+10 XP)</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Mark as Learned</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => speakEnglishText(`${item.word}. ${item.collocation}. ${item.exampleSentence}`)}
                    className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                    title="Listen to word, collocation, and example"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Listen All</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
