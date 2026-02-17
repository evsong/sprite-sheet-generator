import Link from "next/link";
import { UserMenu } from "@/components/auth/UserMenu";

export function Navbar() {
  return (
    <nav className="fixed top-4 left-4 right-4 z-50 flex items-center justify-between px-6 py-3 rounded-xl bg-[#0D0D0D]/80 backdrop-blur-md border border-[#1E1E1E]">
      <Link href="/" className="flex items-center gap-2 cursor-pointer">
        <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
          <rect x="2" y="2" width="12" height="12" rx="2" fill="#06B6D4" />
          <rect x="18" y="2" width="12" height="12" rx="2" fill="#F59E0B" />
          <rect x="2" y="18" width="12" height="12" rx="2" fill="#22C55E" />
          <rect x="18" y="18" width="12" height="12" rx="2" fill="#06B6D4" opacity="0.5" />
        </svg>
        <span className="font-[family-name:var(--font-display)] font-bold text-lg tracking-tight text-white">
          SpriteForge
        </span>
      </Link>

      <div className="hidden md:flex items-center gap-6">
        <a href="#features" className="text-sm text-[#A0A0A0] hover:text-white transition-colors duration-200 cursor-pointer">
          Features
        </a>
        <a href="#pricing" className="text-sm text-[#A0A0A0] hover:text-white transition-colors duration-200 cursor-pointer">
          Pricing
        </a>
        <a href="#how-it-works" className="text-sm text-[#A0A0A0] hover:text-white transition-colors duration-200 cursor-pointer">
          How It Works
        </a>
      </div>

      <div className="flex items-center gap-3">
        <UserMenu />
        <Link
          href="/editor"
          className="px-4 py-2 text-sm font-semibold text-black bg-[#22C55E] rounded-lg hover:brightness-110 transition-all duration-200 cursor-pointer"
        >
          Open Editor
        </Link>
      </div>
    </nav>
  );
}
