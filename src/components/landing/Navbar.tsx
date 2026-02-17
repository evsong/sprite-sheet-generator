import Link from "next/link";
import { UserMenu } from "@/components/auth/UserMenu";

export function Navbar() {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm"
      style={{
        height: "var(--nav-h)",
        background: "rgba(5,5,5,0.92)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div
        className="h-full flex items-center justify-between"
        style={{ maxWidth: "var(--container)", margin: "0 auto", padding: "0 24px" }}
      >
        <Link href="/" className="flex items-center gap-2 cursor-pointer">
          <svg viewBox="0 0 20 20" fill="none" width="20" height="20">
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
              fontSize: "14px",
              letterSpacing: "0.06em",
            }}
          >
            SPRITEFORGE
          </span>
        </Link>

        <div className="flex items-center gap-5">
          <a
            href="#features"
            className="transition-colors duration-150 hover:text-[var(--text)]"
            style={{
              fontSize: "11px",
              fontWeight: 500,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Features
          </a>
          <a
            href="#pricing"
            className="transition-colors duration-150 hover:text-[var(--text)]"
            style={{
              fontSize: "11px",
              fontWeight: 500,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Pricing
          </a>
          <a
            href="#how-it-works"
            className="transition-colors duration-150 hover:text-[var(--text)]"
            style={{
              fontSize: "11px",
              fontWeight: 500,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Docs
          </a>
          <UserMenu />
          <Link
            href="/editor"
            className="inline-flex items-center hover:bg-white cursor-pointer"
            style={{
              height: "30px",
              padding: "0 14px",
              fontSize: "11px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              borderRadius: "2px",
              background: "var(--text)",
              color: "#000",
              border: "1px solid var(--text)",
              transition: "all 0.12s",
            }}
          >
            Launch Editor
          </Link>
        </div>
      </div>
    </nav>
  );
}
