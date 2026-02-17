"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Registration failed");
      setLoading(false);
      return;
    }
    await signIn("credentials", { email, password, callbackUrl: "/editor" });
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

  return (
    <div
      className="min-h-screen flex items-center justify-center relative"
      style={{ background: "var(--bg)" }}
    >
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative w-full max-w-[420px] mx-4">
        <Link href="/" className="flex items-center justify-center gap-2.5" style={{ marginBottom: "48px" }}>
          <svg viewBox="0 0 20 20" fill="none" width="24" height="24">
            <rect width="20" height="20" fill="#fff" />
            <rect x="4" y="4" width="5" height="5" fill="#000" />
            <rect x="11" y="4" width="5" height="5" fill="#000" />
            <rect x="4" y="11" width="5" height="5" fill="#000" />
            <rect x="11" y="11" width="5" height="5" fill="#06B6D4" />
          </svg>
          <span
            className="text-white"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "16px",
              letterSpacing: "0.06em",
            }}
          >
            SPRITEFORGE
          </span>
        </Link>

        <div
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            padding: "40px",
          }}
        >
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "24px",
              fontWeight: 700,
              color: "#fff",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              marginBottom: "6px",
            }}
          >
            Create Account
          </h1>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              color: "var(--text-muted)",
              marginBottom: "32px",
            }}
          >
            Start creating sprite sheets for free
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label style={labelStyle}>Name <span style={{ color: "var(--text-muted)", opacity: 0.5 }}>(optional)</span></label>
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full outline-none placeholder:text-[#333]"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "var(--cyan)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
            </div>

            <div>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full outline-none placeholder:text-[#333]"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "var(--cyan)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
            </div>

            <div>
              <label style={labelStyle}>Password</label>
              <input
                type="password"
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full outline-none placeholder:text-[#333]"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "var(--cyan)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
            </div>

            {error && (
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "#EF4444" }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="cursor-pointer disabled:opacity-50"
              style={{
                height: "42px",
                background: "#fff",
                color: "#000",
                border: "1px solid #fff",
                fontSize: "12px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                transition: "all 0.12s",
                marginTop: "4px",
              }}
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>
        </div>

        <p
          className="text-center mt-6"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            color: "var(--text-muted)",
          }}
        >
          Already have an account?{" "}
          <Link
            href="/auth/signin"
            className="hover:underline"
            style={{ color: "var(--cyan)" }}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
