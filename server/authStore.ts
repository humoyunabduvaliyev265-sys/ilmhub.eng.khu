import fs from "fs";
import path from "path";
import crypto from "crypto";

export type UserRole = "admin" | "user";

export interface StoredUser {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  passwordHash: string;
  level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  xp: number;
  streak: number;
  lessonsCompleted: number;
  testsCompleted: number;
  wordsLearned: number;
  sentencesChecked: number;
  correctAnswers: number;
  incorrectAnswers: number;
  status: "active" | "inactive";
  createdAt: string;
  lastLoginAt: string | null;
}

export type SafeUser = Omit<StoredUser, "passwordHash">;

const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

// In-memory token store: token -> { userId: string; expiresAt: number }
const SESSIONS = new Map<string, { userId: string; expiresAt: number }>();
const SESSION_DURATION_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, originalHash] = storedHash.split(":");
    if (!salt || !originalHash) return false;
    const computedHash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
    return crypto.timingSafeEqual(
      Buffer.from(computedHash, "hex"),
      Buffer.from(originalHash, "hex")
    );
  } catch {
    return false;
  }
}

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadUsers(): StoredUser[] {
  ensureDataDir();
  if (!fs.existsSync(USERS_FILE)) {
    const adminUser: StoredUser = {
      id: "usr-admin-humoyun",
      username: "humoyun_fjx",
      fullName: "Khumoyun (Admin)",
      role: "admin",
      passwordHash: hashPassword("admin123"),
      level: "B2",
      xp: 250,
      streak: 3,
      lessonsCompleted: 8,
      testsCompleted: 4,
      wordsLearned: 35,
      sentencesChecked: 12,
      correctAnswers: 28,
      incorrectAnswers: 2,
      status: "active",
      createdAt: new Date().toISOString(),
      lastLoginAt: null,
    };
    saveUsers([adminUser]);
    return [adminUser];
  }

  try {
    const content = fs.readFileSync(USERS_FILE, "utf-8");
    const parsed = JSON.parse(content);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const adminUser: StoredUser = {
        id: "usr-admin-humoyun",
        username: "humoyun_fjx",
        fullName: "Khumoyun (Admin)",
        role: "admin",
        passwordHash: hashPassword("admin123"),
        level: "B2",
        xp: 250,
        streak: 3,
        lessonsCompleted: 8,
        testsCompleted: 4,
        wordsLearned: 35,
        sentencesChecked: 12,
        correctAnswers: 28,
        incorrectAnswers: 2,
        status: "active",
        createdAt: new Date().toISOString(),
        lastLoginAt: null,
      };
      saveUsers([adminUser]);
      return [adminUser];
    }
    return parsed;
  } catch {
    return [];
  }
}

function saveUsers(users: StoredUser[]): void {
  ensureDataDir();
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
}

export function toSafeUser(user: StoredUser): SafeUser {
  const { passwordHash: _hash, ...safe } = user;
  return safe;
}

export function findUserByUsername(username: string): StoredUser | null {
  const users = loadUsers();
  const normalized = username.trim().toLowerCase();
  return users.find((u) => u.username.toLowerCase() === normalized) || null;
}

export function findUserById(id: string): StoredUser | null {
  const users = loadUsers();
  return users.find((u) => u.id === id) || null;
}

export function getAllUsers(): SafeUser[] {
  const users = loadUsers();
  return users.map(toSafeUser);
}

export function createUser(data: {
  username: string;
  fullName: string;
  password: string;
  role?: UserRole;
  level?: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
}): SafeUser {
  const users = loadUsers();
  const normalized = data.username.trim().toLowerCase();

  if (users.some((u) => u.username.toLowerCase() === normalized)) {
    throw new Error(`Username "${data.username}" is already taken.`);
  }

  const newUser: StoredUser = {
    id: `usr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    username: data.username.trim(),
    fullName: data.fullName.trim() || data.username.trim(),
    role: data.role || "user",
    passwordHash: hashPassword(data.password),
    level: data.level || "A1",
    xp: 50,
    streak: 1,
    lessonsCompleted: 0,
    testsCompleted: 0,
    wordsLearned: 0,
    sentencesChecked: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    status: "active",
    createdAt: new Date().toISOString(),
    lastLoginAt: null,
  };

  users.push(newUser);
  saveUsers(users);
  return toSafeUser(newUser);
}

export function updateUser(
  id: string,
  updates: Partial<{
    fullName: string;
    role: UserRole;
    level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
    status: "active" | "inactive";
    password?: string;
  }>
): SafeUser {
  const users = loadUsers();
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) {
    throw new Error("User not found.");
  }

  const user = users[index];

  // Safeguard: Do not allow deactivating or demoting the primary admin account
  if (user.username === "humoyun_fjx") {
    if (updates.status === "inactive") {
      throw new Error("The primary Admin account (humoyun_fjx) cannot be deactivated.");
    }
    if (updates.role && updates.role !== "admin") {
      throw new Error("The primary Admin account (humoyun_fjx) must remain an Admin.");
    }
  }

  if (updates.fullName !== undefined) user.fullName = updates.fullName.trim();
  if (updates.role !== undefined) user.role = updates.role;
  if (updates.level !== undefined) user.level = updates.level;
  if (updates.status !== undefined) user.status = updates.status;
  if (updates.password && updates.password.trim().length >= 4) {
    user.passwordHash = hashPassword(updates.password.trim());
  }

  users[index] = user;
  saveUsers(users);
  return toSafeUser(user);
}

export function resetUserPassword(userId: string, newPassword: string): void {
  if (!newPassword || newPassword.trim().length < 4) {
    throw new Error("New password must be at least 4 characters long.");
  }
  const users = loadUsers();
  const user = users.find((u) => u.id === userId);
  if (!user) throw new Error("User not found.");

  user.passwordHash = hashPassword(newPassword.trim());
  saveUsers(users);
}

export function deleteUser(id: string): void {
  const users = loadUsers();
  const user = users.find((u) => u.id === id);
  if (!user) throw new Error("User not found.");

  if (user.username === "humoyun_fjx") {
    throw new Error("The primary Admin account (humoyun_fjx) cannot be deleted.");
  }

  const filtered = users.filter((u) => u.id !== id);
  saveUsers(filtered);

  // Invalidate any active session for this user
  for (const [token, session] of SESSIONS.entries()) {
    if (session.userId === id) {
      SESSIONS.delete(token);
    }
  }
}

export function updateUserStats(
  id: string,
  stats: Partial<{
    xp: number;
    streak: number;
    level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
    lessonsCompleted: number;
    testsCompleted: number;
    wordsLearned: number;
    sentencesChecked: number;
    correctAnswers: number;
    incorrectAnswers: number;
  }>
): SafeUser {
  const users = loadUsers();
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) {
    throw new Error("User not found.");
  }

  const user = users[index];
  if (stats.xp !== undefined) user.xp = stats.xp;
  if (stats.streak !== undefined) user.streak = stats.streak;
  if (stats.level !== undefined) user.level = stats.level;
  if (stats.lessonsCompleted !== undefined) user.lessonsCompleted = stats.lessonsCompleted;
  if (stats.testsCompleted !== undefined) user.testsCompleted = stats.testsCompleted;
  if (stats.wordsLearned !== undefined) user.wordsLearned = stats.wordsLearned;
  if (stats.sentencesChecked !== undefined) user.sentencesChecked = stats.sentencesChecked;
  if (stats.correctAnswers !== undefined) user.correctAnswers = stats.correctAnswers;
  if (stats.incorrectAnswers !== undefined) user.incorrectAnswers = stats.incorrectAnswers;

  users[index] = user;
  saveUsers(users);
  return toSafeUser(user);
}

export function recordUserLogin(id: string): void {
  const users = loadUsers();
  const user = users.find((u) => u.id === id);
  if (user) {
    user.lastLoginAt = new Date().toISOString();
    saveUsers(users);
  }
}

// Session management
export function createSession(userId: string): string {
  const token = crypto.randomBytes(32).toString("hex");
  SESSIONS.set(token, {
    userId,
    expiresAt: Date.now() + SESSION_DURATION_MS,
  });
  return token;
}

export function getSessionUser(token: string): SafeUser | null {
  if (!token) return null;
  const session = SESSIONS.get(token);
  if (!session) return null;

  if (Date.now() > session.expiresAt) {
    SESSIONS.delete(token);
    return null;
  }

  const user = findUserById(session.userId);
  if (!user || user.status === "inactive") {
    SESSIONS.delete(token);
    return null;
  }

  return toSafeUser(user);
}

export function destroySession(token: string): void {
  if (token) {
    SESSIONS.delete(token);
  }
}
