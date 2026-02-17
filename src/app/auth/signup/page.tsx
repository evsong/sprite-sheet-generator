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

  const inputStyle = "w-full py-2.5 px-3 bg-[#111] border border-[#1E1E1E] rounded-lg text-[12px] text-white placeholder-[#555] outline-none focus:border-[#333]";

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center">
      <div className="w-full max-w-sm bg-[#0D0D0D] border border-[#1E1E1E] rounded-xl p-8">
        <h1 className="font-[family-name:var(--font-heading)] text-xl text-white text-center mb-2">
          Create account
        </h1>
        <p className="text-[12px] text-[#666] text-center mb-6 font-[family-name:var(--font-mono)]">
          Start creating sprite sheets for free
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input type="text" placeholder="Name (optional)" value={name} onChange={e => setName(e.target.value)} className={inputStyle} />
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className={inputStyle} required />
          <input type="password" placeholder="Password (min 6 chars)" value={password} onChange={e => setPassword(e.target.value)} className={inputStyle} required minLength={6} />
          {error && <p className="text-[11px] text-red-400">{error}</p>}
          <button type="submit" disabled={loading} className="w-full py-2.5 px-4 bg-white text-black border border-white rounded-lg text-[12px] font-semibold hover:bg-gray-100 transition-colors duration-150 cursor-pointer disabled:opacity-50">
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <p className="text-[11px] text-[#555] text-center mt-5 font-[family-name:var(--font-mono)]">
          Already have an account? <Link href="/auth/signin" className="text-white hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
