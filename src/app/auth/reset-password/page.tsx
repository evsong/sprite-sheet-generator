"use client";

import { useState } from "react";
import Link from "next/link";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/auth/forgot-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
    setSent(true);
    setLoading(false);
  };

  const inputStyle = { height: "42px", padding: "0 14px", background: "var(--bg)", border: "1px solid var(--border)", color: "#fff", fontSize: "14px" };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
      <div className="w-full max-w-[420px] mx-4">
        <Link href="/auth/signin" className="flex items-center justify-center gap-2.5" style={{ marginBottom: "20px" }}>
          <svg viewBox="0 0 20 20" fill="none" width="24" height="24">
            <rect width="20" height="20" fill="#fff" />
            <rect x="4" y="4" width="5" height="5" fill="#000" />
            <rect x="11" y="4" width="5" height="5" fill="#000" />
            <rect x="4" y="11" width="5" height="5" fill="#000" />
            <rect x="11" y="11" width="5" height="5" fill="#06B6D4" />
          </svg>
          <span className="text-white" style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "16px", letterSpacing: "0.06em" }}>SPRITEFORGE</span>
        </Link>

        <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", padding: "40px" }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "24px", fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "6px" }}>
            Reset Password
          </h1>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-muted)", marginBottom: "24px" }}>
            Enter your email to receive a reset link
          </p>

          {sent ? (
            <div>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "#22C55E", marginBottom: "16px" }}>
                If an account exists with that email, we sent a reset link.
              </p>
              <Link href="/auth/signin" style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--cyan)" }}>← Back to sign in</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" className="w-full outline-none placeholder:text-[#333]" style={inputStyle} />
              </div>
              <button type="submit" disabled={loading} className="cursor-pointer disabled:opacity-50"
                style={{ height: "42px", background: "#fff", color: "#000", border: "1px solid #fff", fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
              <Link href="/auth/signin" className="text-center" style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-muted)" }}>← Back to sign in</Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
