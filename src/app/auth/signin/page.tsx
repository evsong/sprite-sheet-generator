"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password");
    } else {
      window.location.href = "/editor";
    }
  };

  const inputStyle = "w-full py-2.5 px-3 bg-[#111] border border-[#1E1E1E] rounded-lg text-[12px] text-white placeholder-[#555] outline-none focus:border-[#333]";
  const btnStyle = "w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#1A1A1A] border border-[#1E1E1E] rounded-lg text-[12px] text-white hover:bg-[#222] transition-colors duration-150 cursor-pointer";

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center">
      <div className="w-full max-w-sm bg-[#0D0D0D] border border-[#1E1E1E] rounded-xl p-8">
        <h1 className="font-[family-name:var(--font-heading)] text-xl text-white text-center mb-2">
          Sign in to SpriteForge
        </h1>
        <p className="text-[12px] text-[#666] text-center mb-6 font-[family-name:var(--font-mono)]">
          Save projects, unlock PRO features
        </p>

        <form onSubmit={handleSubmit} className="space-y-3 mb-4">
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className={inputStyle} required />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className={inputStyle} required />
          {error && <p className="text-[11px] text-red-400">{error}</p>}
          <button type="submit" disabled={loading} className={`${btnStyle} !bg-white !text-black !border-white disabled:opacity-50`}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-[#1E1E1E]" />
          <span className="text-[10px] text-[#444] font-[family-name:var(--font-mono)]">OR</span>
          <div className="flex-1 h-px bg-[#1E1E1E]" />
        </div>

        <button onClick={() => signIn("github", { callbackUrl: "/editor" })} className={btnStyle}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
          Continue with GitHub
        </button>

        <p className="text-[11px] text-[#555] text-center mt-5 font-[family-name:var(--font-mono)]">
          No account? <Link href="/auth/signup" className="text-white hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
