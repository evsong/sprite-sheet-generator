"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function NewPasswordForm() {
  const token = useSearchParams().get("token");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!token) return (
    <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", padding: "40px", maxWidth: "420px" }}>
      <p style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "#EF4444", marginBottom: "12px" }}>Invalid or missing reset token.</p>
      <Link href="/auth/reset-password" style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--cyan)" }}>Request a new reset link</Link>
    </div>
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    const res = await fetch("/api/auth/reset-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, password }) });
    const data = await res.json();
    setLoading(false);
    if (res.ok) setDone(true);
    else setError(data.error || "Failed");
  };

  const inputStyle = { height: "42px", padding: "0 14px", background: "var(--bg)", border: "1px solid var(--border)", color: "#fff", fontSize: "14px" };

  return (
    <div className="w-full max-w-[420px] mx-4">
      <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", padding: "40px" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "24px", fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "24px" }}>
          New Password
        </h1>
        {done ? (
          <div>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "#22C55E", marginBottom: "16px" }}>Password updated successfully.</p>
            <Link href="/auth/signin" style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--cyan)" }}>Sign in →</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>New Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} placeholder="Min 6 characters" className="w-full outline-none placeholder:text-[#333]" style={inputStyle} />
            </div>
            {error && <p style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "#EF4444" }}>{error}</p>}
            <button type="submit" disabled={loading} className="cursor-pointer disabled:opacity-50"
              style={{ height: "42px", background: "#fff", color: "#000", border: "1px solid #fff", fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {loading ? "Updating..." : "Set New Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function NewPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
      <Suspense>
        <NewPasswordForm />
      </Suspense>
    </div>
  );
}
