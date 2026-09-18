import React, { useState } from "react";
import {
  Sparkles,
  Lock,
  User,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  ArrowRight,
  KeyRound,
  CheckCircle2,
  X,
  Copy,
  Check,
  ShieldAlert,
} from "lucide-react";
import { UserAccount } from "../types";

interface LoginViewProps {
  onLoginSuccess: (token: string, user: UserAccount) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Admin Security Code Modal State
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [securityCode, setSecurityCode] = useState("");
  const [securityCodeError, setSecurityCodeError] = useState<string | null>(null);
  const [isAdminRevealed, setIsAdminRevealed] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed. Please check your credentials.");
      }

      onLoginSuccess(data.token, data.user);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during login.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySecurityCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (securityCode.trim() === "123") {
      setIsAdminRevealed(true);
      setSecurityCodeError(null);
    } else {
      setSecurityCodeError("Incorrect security code. Please enter the valid code.");
      setIsAdminRevealed(false);
    }
  };

  const handleAutoFillAndClose = () => {
    setUsername("humoyun_fjx");
    setPassword("admin123");
    setError(null);
    setIsAdminModalOpen(false);
  };

  const handleCopyText = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-indigo-50/20 to-zinc-100 dark:from-zinc-950 dark:via-indigo-950/20 dark:to-zinc-900 flex flex-col justify-center items-center p-4 transition-colors">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500 text-white shadow-lg mb-4 ring-4 ring-indigo-500/10">
            <Sparkles className="w-8 h-8 text-amber-300" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
            ILMHUB ENGLISH
          </h1>
          <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-1 uppercase tracking-wider">
            Created by KHUMOYUN
          </p>
          <p className="text-sm text-zinc-700 dark:text-zinc-300 mt-2">
            Sign in to continue your personalized English learning journey
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-xl p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div
                id="login-error-alert"
                className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 text-xs font-medium flex items-start gap-2.5 animate-in fade-in"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                <span className="flex-1">{error}</span>
              </div>
            )}

            {/* Username */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="login-username-input"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  required
                  autoFocus
                  autoCapitalize="none"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="login-password-input"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                />
                <button
                  type="button"
                  id="toggle-password-visibility-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold text-sm shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In to ILMHUB</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Admin Login Section (Credentials hidden by default) */}
          <div className="mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              id="admin-login-btn"
              onClick={() => {
                setIsAdminModalOpen(true);
                setSecurityCode("");
                setSecurityCodeError(null);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-zinc-200 dark:border-zinc-700/80 hover:border-indigo-300 dark:hover:border-indigo-600 bg-zinc-50/70 dark:bg-zinc-800/40 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 text-zinc-700 dark:text-zinc-200 text-xs font-bold transition-all shadow-2xs"
            >
              <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Admin Login</span>
            </button>

            <p className="text-center text-[11px] text-zinc-700 dark:text-zinc-300 mt-3">
              Students receive login credentials directly from the instructor.
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-zinc-700 dark:text-zinc-300 mt-6">
          © {new Date().getFullYear()} ILMHUB ENGLISH. Protected by Secure Authentication.
        </p>
      </div>

      {/* Admin Verification Modal */}
      {isAdminModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-50">
                    Admin Verification
                  </h3>
                  <p className="text-xs text-zinc-700 dark:text-zinc-300">
                    Enter security code to access admin
                  </p>
                </div>
              </div>
              <button
                type="button"
                id="close-admin-modal-btn"
                onClick={() => setIsAdminModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!isAdminRevealed ? (
              /* Security Code Input Form */
              <form onSubmit={handleVerifySecurityCode} className="space-y-4 mt-4">
                {securityCodeError && (
                  <div
                    id="security-code-error"
                    className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 text-xs font-semibold flex items-center gap-2"
                  >
                    <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
                    <span>{securityCodeError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                    Security Code
                  </label>
                  <input
                    type="password"
                    id="security-code-input"
                    value={securityCode}
                    onChange={(e) => {
                      setSecurityCode(e.target.value);
                      if (securityCodeError) setSecurityCodeError(null);
                    }}
                    placeholder="Enter security code"
                    autoFocus
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm font-mono tracking-widest text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                  <p className="text-[11px] text-zinc-700 dark:text-zinc-300 mt-1.5">
                    Authorized administrators only.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsAdminModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    id="submit-security-code-btn"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors"
                  >
                    <span>Verify Code</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            ) : (
              /* Admin Credentials Revealed */
              <div className="space-y-4 mt-4 animate-in fade-in">
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>Security Code Verified! Admin credentials revealed:</span>
                </div>

                <div className="space-y-2.5 p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80">
                  {/* Username Display */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                      Username:
                    </span>
                    <div className="flex items-center gap-1.5">
                      <code
                        id="revealed-admin-username"
                        className="px-2 py-0.5 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 font-bold text-xs text-indigo-600 dark:text-indigo-400"
                      >
                        humoyun_fjx
                      </code>
                      <button
                        type="button"
                        onClick={() => handleCopyText("humoyun_fjx", "user")}
                        className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                        title="Copy Username"
                      >
                        {copiedField === "user" ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Password Display */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                      Password:
                    </span>
                    <div className="flex items-center gap-1.5">
                      <code
                        id="revealed-admin-password"
                        className="px-2 py-0.5 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 font-bold text-xs text-indigo-600 dark:text-indigo-400 font-mono"
                      >
                        admin123
                      </code>
                      <button
                        type="button"
                        onClick={() => handleCopyText("admin123", "pass")}
                        className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                        title="Copy Password"
                      >
                        {copiedField === "pass" ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <button
                    type="button"
                    id="autofill-admin-btn"
                    onClick={handleAutoFillAndClose}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Auto-fill & Sign In</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAdminRevealed(false);
                      setSecurityCode("");
                      setIsAdminModalOpen(false);
                    }}
                    className="w-full py-1.5 text-center text-xs text-zinc-700 dark:text-zinc-300 hover:underline"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
