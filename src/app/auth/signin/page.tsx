"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";

type Mode = "password" | "magic";

export default function SignInPage() {
  const [mode, setMode] = useState<Mode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) setError("Invalid email or password");
    else window.location.href = "/editor";
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setError("");
    setLoading(true);
    try {
      const res = await signIn("resend", { email: email.trim(), redirect: false });
      if (res?.ok) window.location.href = "/auth/verify";
      else { setError("Failed to send login link"); setLoading(false); }
    } catch {
      setError("Network error"); setLoading(false);
    }
  };

  const labelStyle = {
    display: "block" as const,
    fontFamily: "var(--font-mono)",
    fontSize: "10px",
    color: "var(--text-muted)",
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em",
    marginBottom: "6px",
  };

  const inputStyle = {
    height: "42px",
    padding: "0 14px",
    background: "var(--bg)",
    border: "1px solid var(--border)",
    color: "#fff",
    fontSize: "14px",
    transition: "border-color 0.15s",
  };

  const tabStyle = (active: boolean) => ({
    flex: 1,
    padding: "8px 0",
    background: "transparent",
    border: "none",
    borderBottom: active ? "2px solid var(--cyan)" : "2px solid transparent",
    color: active ? "#fff" : "var(--text-muted)",
    fontFamily: "var(--font-mono)",
    fontSize: "11px",
    textTransform: "uppercase" as const,
    letterSpacing: "0.06em",
    cursor: "pointer" as const,
    transition: "all 0.15s",
  });

  return (
    <div className="min-h-screen flex items-center justify-center relative" style={{ background: "var(--bg)" }}>
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
      }} />

      <div className="relative w-full max-w-[420px] mx-4">
        <Link href="/" className="flex items-center justify-center gap-2.5" style={{ marginBottom: "48px" }}>
          <svg viewBox="0 0 20 20" fill="none" width="24" height="24">
            <rect width="20" height="20" fill="#fff" />
            <rect x="4" y="4" width="5" height="5" fill="#000" />
            <rect x="11" y="4" width="5" height="5" fill="#000" />
            <rect x="4" y="11" width="5" height="5" fill="#000" />
            <rect x="11" y="11" width="5" height="5" fill="#06B6D4" />
          </svg>
          <span className="text-white" style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "16px", letterSpacing: "0.06em" }}>
            SPRITEFORGE
          </span>
        </Link>

        <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", padding: "40px" }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "24px", fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "6px" }}>
            Sign In
          </h1>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-muted)", marginBottom: "24px" }}>
            Save projects, unlock PRO features
          </p>

          {/* Tabs */}
          <div className="flex" style={{ borderBottom: "1px solid var(--border)", marginBottom: "24px" }}>
            <button style={tabStyle(mode === "password")} onClick={() => { setMode("password"); setError(""); }}>Password</button>
            <button style={tabStyle(mode === "magic")} onClick={() => { setMode("magic"); setError(""); }}>Magic Link</button>
          </div>

          {mode === "password" ? (
            <form onSubmit={handlePassword} className="flex flex-col gap-4">
              <div>
                <label style={labelStyle}>Email</label>
                <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required
                  className="w-full outline-none placeholder:text-[#333]" style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "var(--cyan)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border)")} />
              </div>
              <div>
                <label style={labelStyle}>Password</label>
                <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required
                  className="w-full outline-none placeholder:text-[#333]" style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "var(--cyan)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border)")} />
              </div>
              {error && <p style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "#EF4444" }}>{error}</p>}
              <button type="submit" disabled={loading} className="cursor-pointer disabled:opacity-50"
                style={{ height: "42px", background: "#fff", color: "#000", border: "1px solid #fff", fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", transition: "all 0.12s", marginTop: "4px" }}>
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleMagicLink} className="flex flex-col gap-4">
              <div>
                <label style={labelStyle}>Email</label>
                <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required
                  className="w-full outline-none placeholder:text-[#333]" style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "var(--cyan)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border)")} />
              </div>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-muted)" }}>
                No password needed. We&apos;ll email you a login link.
              </p>
              {error && <p style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "#EF4444" }}>{error}</p>}
              <button type="submit" disabled={loading} className="cursor-pointer disabled:opacity-50"
                style={{ height: "42px", background: "#fff", color: "#000", border: "1px solid #fff", fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", transition: "all 0.12s" }}>
                {loading ? "Sending..." : "Send Magic Link"}
              </button>
            </form>
          )}

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1" style={{ height: "1px", background: "var(--border)" }} />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>or</span>
            <div className="flex-1" style={{ height: "1px", background: "var(--border)" }} />
          </div>

          {/* GitHub */}
          <button onClick={() => signIn("github", { callbackUrl: "/editor" })}
            className="w-full flex items-center justify-center gap-2.5 cursor-pointer"
            style={{ height: "42px", background: "transparent", border: "1px solid var(--border)", color: "var(--text-dim)", fontSize: "12px", fontWeight: 500, letterSpacing: "0.02em", transition: "all 0.12s" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--text-muted)"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-dim)"; }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            Continue with GitHub
          </button>
        </div>

        <p className="text-center mt-6" style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-muted)" }}>
          No account?{" "}
          <Link href="/auth/signup" className="hover:underline" style={{ color: "var(--cyan)" }}>Create one</Link>
        </p>
      </div>
    </div>
  );
}
