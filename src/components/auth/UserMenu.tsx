"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

export function UserMenu() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);

  if (status === "loading") {
    return <div className="w-8 h-8 rounded-full bg-[#1A1A1A] animate-pulse" />;
  }

  if (!session?.user) {
    return (
      <Link
        href="/auth/signin"
        className="px-3 py-1.5 text-[11px] font-[family-name:var(--font-mono)] text-[#A0A0A0] border border-[#1E1E1E] rounded-lg hover:text-white hover:border-[#333] transition-colors duration-150 cursor-pointer"
      >
        Sign in
      </Link>
    );
  }

  const tier = (session.user as Record<string, unknown>).tier as string ?? "FREE";

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 cursor-pointer"
      >
        {session.user.image ? (
          <img
            src={session.user.image}
            alt=""
            className="w-7 h-7 rounded-full border border-[#1E1E1E]"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-[#06B6D4] flex items-center justify-center text-[10px] font-bold text-black">
            {session.user.name?.[0]?.toUpperCase() ?? "?"}
          </div>
        )}
        <span className="hidden md:inline text-[11px] text-[#A0A0A0] font-[family-name:var(--font-mono)]">
          {session.user.name?.split(" ")[0]}
        </span>
        {tier !== "FREE" && (
          <span className="text-[8px] font-[family-name:var(--font-mono)] font-bold text-[#F59E0B] bg-[#F59E0B]/10 px-1.5 py-0.5 rounded">
            {tier}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[99]" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-[100] w-48 bg-[#0D0D0D] border border-[#1E1E1E] rounded-lg py-1 shadow-xl">
            <div className="px-3 py-2 border-b border-[#1E1E1E]">
              <p className="text-[11px] text-white truncate">{session.user.name}</p>
              <p className="text-[9px] text-[#666] font-[family-name:var(--font-mono)] truncate">{session.user.email}</p>
            </div>
            <Link href="/settings" onClick={() => setOpen(false)}
              className="block w-full text-left px-3 py-2 text-[11px] text-[#A0A0A0] hover:text-white hover:bg-[#1A1A1A] transition-colors duration-100 font-[family-name:var(--font-mono)]">
              Settings
            </Link>
            <Link href="/settings" onClick={() => setOpen(false)}
              className="block w-full text-left px-3 py-2 text-[11px] text-[#A0A0A0] hover:text-white hover:bg-[#1A1A1A] transition-colors duration-100 font-[family-name:var(--font-mono)] border-b border-[#1E1E1E]">
              Billing
            </Link>
            <button
              onClick={() => { signOut({ callbackUrl: "/" }); setOpen(false); }}
              className="w-full text-left px-3 py-2 text-[11px] text-[#A0A0A0] hover:text-white hover:bg-[#1A1A1A] transition-colors duration-100 cursor-pointer font-[family-name:var(--font-mono)]"
            >
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
