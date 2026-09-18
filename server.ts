import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import {
  findUserByUsername,
  verifyPassword,
  createSession,
  destroySession,
  getSessionUser,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  resetUserPassword,
  updateUserStats,
  recordUserLogin,
  toSafeUser,
} from "./server/authStore";

const PORT = 3000;

let aiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Resilient model caller with automatic fallback if a model experiences 503/429
async function callGeminiWithFallback(params: {
  contents: any;
  config?: any;
}) {
  const ai = getGemini();
  const models = ["gemini-flash-latest", "gemini-3.8-flash", "gemini-3.1-flash-lite"];
  let lastError: any = null;

  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: params.config,
      });

      if (response && response.text) {
        return response;
      }
    } catch (err: any) {
      console.warn(`[Gemini Warning] Model "${model}" failed:`, err?.message || err);
      lastError = err;
      // Continue to next fallback model
    }
  }

  throw lastError || new Error("All Gemini models failed to respond.");
}

const SYSTEM_INSTRUCTION = `You are "ILMHUB ENGLISH AI COACH", an encouraging and fluent Native English Language Coach created for ILMHUB ENGLISH by KHUMOYUN.

Your primary goal is to help the learner improve English through natural, interactive conversation.

===========================================================
CORE COMMUNICATION RULES
===========================================================
1. ALWAYS communicate in English during normal conversation.
2. If the learner makes a grammar, vocabulary, spelling, word-choice, or natural-phrasing mistake, correct it at the VERY BEGINNING of your response using this exact structure:

💡 Quick Correction:
"[incorrect sentence or phrase]" → "[correct sentence or phrase]"

Brief explanation: [explain the mistake in simple, encouraging language]

[Then continue the conversation naturally in a new paragraph]

3. Do not correct tiny insignificant slips that do not affect communication unless they are useful for learning.
4. Never embarrass or criticize the learner. Be encouraging, friendly, patient, and supportive.
5. Keep normal conversational responses concise: approximately 2–5 sentences unless the learner asks for a detailed explanation.
6. End most conversational responses with an open-ended question that encourages the learner to continue speaking.
7. If the learner's level is A1 or A2, and "useUzbekExplanationsForBeginners" is requested or the learner asks in Uzbek, provide a brief Uzbek translation/clarification of key corrections or concepts when helpful.

===========================================================
LEVEL ADAPTATION
===========================================================
Adapt your language strictly to the learner's CEFR level:
- A1: Very simple vocabulary, short sentences, basic grammar, frequent encouragement.
- A2: Simple everyday English, slightly longer sentences, basic explanations.
- B1: Natural conversational English, moderate vocabulary, useful corrections.
- B2: More advanced vocabulary, natural expressions, nuanced corrections.
- C1: Advanced vocabulary, idioms, sophisticated phrasing, detailed language awareness.
- C2: Near-native natural English, advanced nuance, register and style awareness.

===========================================================
CONVERSATION MODES & ROLEPLAY
===========================================================
Adapt to the requested mode (Free Conversation, Daily English, Travel English, School English, Job Interview, Business English, IELTS Practice, Speaking Practice, Grammar Practice, Vocabulary Practice, Debate, Storytelling, Roleplay, Beginner Conversation, Advanced Conversation).
For Roleplay (e.g., restaurant waiter, airport agent, interviewer, hotel receptionist), stay in character and maintain realistic conversational dialogue with natural corrections.

Brand identity: ILMHUB ENGLISH by KHUMOYUN.`;

async function startServer() {
  const app = express();
  app.use(express.json());

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Auth Helpers
  function extractToken(req: express.Request): string | null {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      return authHeader.slice(7).trim();
    }
    return null;
  }

  function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({ error: "Authentication token required. Please log in." });
    }
    const user = getSessionUser(token);
    if (!user) {
      return res.status(401).json({ error: "Session expired or invalid. Please log in again." });
    }
    (req as any).user = user;
    (req as any).token = token;
    next();
  }

  function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
    requireAuth(req, res, () => {
      const user = (req as any).user;
      if (!user || user.role !== "admin") {
        return res.status(403).json({ error: "Access denied. Administrator privileges required." });
      }
      next();
    });
  }

  // --- Auth Endpoints ---

  // Login endpoint
  app.post("/api/auth/login", (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password || typeof username !== "string" || typeof password !== "string") {
        return res.status(400).json({ error: "Username and password are required." });
      }

      const storedUser = findUserByUsername(username);
      if (!storedUser) {
        return res.status(401).json({ error: "Invalid username or password." });
      }

      if (storedUser.status === "inactive") {
        return res.status(403).json({
          error: "This account has been deactivated. Please contact the administrator (humoyun_fjx).",
        });
      }

      const isValid = verifyPassword(password, storedUser.passwordHash);
      if (!isValid) {
        return res.status(401).json({ error: "Invalid username or password." });
      }

      recordUserLogin(storedUser.id);
      const token = createSession(storedUser.id);
      const safeUser = toSafeUser(storedUser);

      res.json({
        token,
        user: safeUser,
      });
    } catch (err: any) {
      console.error("Login error:", err);
      res.status(500).json({ error: err.message || "Login failed." });
    }
  });

  // Verify session / Get current user
  app.get("/api/auth/me", requireAuth, (req, res) => {
    const user = (req as any).user;
    res.json({ user });
  });

  // Logout endpoint
  app.post("/api/auth/logout", (req, res) => {
    const token = extractToken(req);
    if (token) {
      destroySession(token);
    }
    res.json({ status: "ok" });
  });

  // Update learner profile stats (synced to persistent account)
  app.put("/api/auth/profile", requireAuth, (req, res) => {
    try {
      const user = (req as any).user;
      const { xp, streak, level, lessonsCompleted, testsCompleted, wordsLearned, sentencesChecked, correctAnswers, incorrectAnswers } = req.body;

      const updated = updateUserStats(user.id, {
        xp,
        streak,
        level,
        lessonsCompleted,
        testsCompleted,
        wordsLearned,
        sentencesChecked,
        correctAnswers,
        incorrectAnswers,
      });

      res.json({ user: updated });
    } catch (err: any) {
      console.error("Profile update error:", err);
      res.status(500).json({ error: err.message || "Failed to update profile stats." });
    }
  });

  // --- Admin Endpoints ---

  // Get all users
  app.get("/api/admin/users", requireAdmin, (_req, res) => {
    try {
      const users = getAllUsers();
      res.json({ users });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to fetch users." });
    }
  });

  // Create new user (Admin only)
  app.post("/api/admin/users", requireAdmin, (req, res) => {
    try {
      const { username, fullName, password, role, level } = req.body;
      if (!username || typeof username !== "string" || username.trim().length < 3) {
        return res.status(400).json({ error: "Username must be at least 3 characters long." });
      }
      if (!password || typeof password !== "string" || password.trim().length < 4) {
        return res.status(400).json({ error: "Password must be at least 4 characters long." });
      }

      // Check username regex: alphanumeric, underscores, hyphens
      if (!/^[a-zA-Z0-9_-]+$/.test(username.trim())) {
        return res.status(400).json({ error: "Username may only contain letters, numbers, hyphens, and underscores." });
      }

      const created = createUser({
        username: username.trim(),
        fullName: fullName || username.trim(),
        password: password.trim(),
        role: role === "admin" ? "admin" : "user",
        level: level || "A1",
      });

      res.status(201).json({ user: created });
    } catch (err: any) {
      res.status(400).json({ error: err.message || "Failed to create user." });
    }
  });

  // Update existing user (Admin only)
  app.put("/api/admin/users/:id", requireAdmin, (req, res) => {
    try {
      const { id } = req.params;
      const { fullName, role, level, status, password } = req.body;

      const updated = updateUser(id, {
        fullName,
        role,
        level,
        status,
        password,
      });

      res.json({ user: updated });
    } catch (err: any) {
      res.status(400).json({ error: err.message || "Failed to update user." });
    }
  });

  // Reset user password (Admin only)
  app.post("/api/admin/reset-password", requireAdmin, (req, res) => {
    try {
      const { userId, newPassword } = req.body;
      if (!userId || !newPassword) {
        return res.status(400).json({ error: "User ID and new password are required." });
      }

      resetUserPassword(userId, newPassword);
      res.json({ status: "ok", message: "Password updated successfully." });
    } catch (err: any) {
      res.status(400).json({ error: err.message || "Failed to reset password." });
    }
  });

  // Delete user (Admin only)
  app.delete("/api/admin/users/:id", requireAdmin, (req, res) => {
    try {
      const { id } = req.params;
      deleteUser(id);
      res.json({ status: "ok", message: "User account deleted." });
    } catch (err: any) {
      res.status(400).json({ error: err.message || "Failed to delete user." });
    }
  });

  // Dedicated Sentence Correction endpoint
  app.post("/api/sentence-correction", async (req, res) => {
    try {
      const { sentence, level = "A1" } = req.body;
      if (!sentence || typeof sentence !== "string" || !sentence.trim()) {
        return res.status(400).json({ error: "Sentence is required." });
      }

      const prompt = `Analyze and correct this English sentence written by a CEFR ${level} learner:
"${sentence.trim()}"

Provide a JSON object strictly matching this schema:
{
  "hasMistake": boolean,
  "original": string,
  "corrected": string,
  "explanation": string,
  "naturalAlternative": string,
  "uzbekExplanation": string,
  "mistakeType": string (e.g. "Grammar: Past Tense", "Vocabulary Collocation", "Preposition", "Word Order", "Punctuation", "None")
}`;

      const response = await callGeminiWithFallback({
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.3,
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json(parsed);
    } catch (error: any) {
      console.error("Sentence correction error:", error);
      res.status(500).json({ error: error.message || "Failed to check sentence." });
    }
  });

  // Daily Challenge endpoint (1 vocab, 1 grammar, 1 conversation, 1 sentence correction)
  app.post("/api/daily-challenge", async (req, res) => {
    try {
      const { level = "A1" } = req.body;

      const prompt = `Create a motivating 4-part Daily English Challenge for a CEFR ${level} learner in JSON format.
Strictly return a JSON object with this structure:
{
  "title": string,
  "theme": string,
  "tasks": [
    {
      "id": "vocab",
      "type": "vocabulary",
      "instruction": string,
      "question": string,
      "options": string[],
      "correctIndex": number,
      "explanation": string,
      "uzbekHint": string
    },
    {
      "id": "grammar",
      "type": "grammar",
      "instruction": string,
      "question": string,
      "options": string[],
      "correctIndex": number,
      "explanation": string,
      "uzbekHint": string
    },
    {
      "id": "sentence_correction",
      "type": "correction",
      "instruction": string,
      "incorrectSentence": string,
      "correctSentence": string,
      "explanation": string
    },
    {
      "id": "speaking_prompt",
      "type": "conversation",
      "instruction": string,
      "prompt": string,
      "sampleResponse": string
    }
  ]
}`;

      const response = await callGeminiWithFallback({
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.7,
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json(parsed);
    } catch (error: any) {
      console.error("Daily challenge error:", error);
      res.status(500).json({ error: error.message || "Failed to generate daily challenge." });
    }
  });

  // Vocabulary generator endpoint
  app.post("/api/vocabulary", async (req, res) => {
    try {
      const { topic = "Daily Life", level = "A1", count = 8 } = req.body;

      const prompt = `Generate ${count} useful, practical English vocabulary words for a ${level} level learner about the topic "${topic}".
Include Uzbek translation and natural collocations.
Return a JSON array of objects with schema:
[
  {
    "word": string,
    "uzbekMeaning": string,
    "partOfSpeech": string (e.g. "noun", "verb", "adjective", "adverb"),
    "phonetic": string (e.g. "/.../"),
    "exampleSentence": string,
    "collocation": string,
    "usageTip": string
  }
]`;

      const response = await callGeminiWithFallback({
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.6,
        },
      });

      const parsed = JSON.parse(response.text || "[]");
      res.json({ words: parsed, topic, level });
    } catch (error: any) {
      console.error("Vocabulary error:", error);
      res.status(500).json({ error: error.message || "Failed to generate vocabulary." });
    }
  });

  // Grammar exercise / lesson endpoint
  app.post("/api/grammar-lesson", async (req, res) => {
    try {
      const { topic = "Present Simple", level = "A1" } = req.body;

      const prompt = `Create a concise, clear grammar lesson and 3 practice quiz questions on "${topic}" for a ${level} English learner.
Return a JSON object with this schema:
{
  "title": string,
  "level": string,
  "formula": string (e.g. "Subject + Verb(s) + Object"),
  "explanation": string,
  "uzbekExplanation": string,
  "examples": string[],
  "commonMistakes": [
    { "incorrect": string, "correct": string, "reason": string }
  ],
  "quiz": [
    {
      "question": string,
      "options": string[],
      "correctIndex": number,
      "explanation": string
    }
  ]
}`;

      const response = await callGeminiWithFallback({
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.5,
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json(parsed);
    } catch (error: any) {
      console.error("Grammar error:", error);
      res.status(500).json({ error: error.message || "Failed to generate grammar lesson." });
    }
  });

  // Quiz / Test Creator endpoint
  app.post("/api/quiz", async (req, res) => {
    try {
      const { level = "A1", count = 5, mode = "mixed" } = req.body;

      const prompt = `Generate an interactive English test with ${count} questions for a CEFR ${level} learner.
Question category: ${mode} (mix of grammar, vocabulary, collocations, natural phrasing, reading).
Return a JSON object:
{
  "level": "${level}",
  "questions": [
    {
      "id": number,
      "category": string,
      "question": string,
      "options": string[],
      "correctIndex": number,
      "explanation": string,
      "uzbekTip": string
    }
  ]
}`;

      const response = await callGeminiWithFallback({
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.5,
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json(parsed);
    } catch (error: any) {
      console.error("Quiz error:", error);
      res.status(500).json({ error: error.message || "Failed to generate quiz." });
    }
  });

  // Vite middleware in dev; static file serving in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ILMHUB English Coach server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Server startup error:", err);
  process.exit(1);
});
