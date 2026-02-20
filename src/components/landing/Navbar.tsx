"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { UserMenu } from "@/components/auth/UserMenu";

export function Navbar() {
  const pathname = usePathname();
  const isEditor = pathname?.startsWith("/editor");
  const [menuOpen, setMenuOpen] = useState(false);

  const links = ["Product", "Editor", "Features", "Pricing"];

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

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-5">
          {links.map((label) => (
            <a
              key={label}
              href={label === "Editor" ? "/editor" : `#${label.toLowerCase()}`}
              className="transition-colors duration-150 hover:text-[var(--text)]"
              style={{
                fontSize: "11px",
                fontWeight: 500,
                color: isEditor && label === "Editor" ? "var(--text)" : "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              {label}
            </a>
          ))}
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

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col justify-center gap-1 p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className="block w-4 h-px bg-white transition-transform" style={menuOpen ? { transform: "rotate(45deg) translate(2px, 2px)" } : {}} />
          <span className="block w-4 h-px bg-white transition-opacity" style={{ opacity: menuOpen ? 0 : 1 }} />
          <span className="block w-4 h-px bg-white transition-transform" style={menuOpen ? { transform: "rotate(-45deg) translate(2px, -2px)" } : {}} />
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div
          className="md:hidden flex flex-col gap-4 px-6 py-4"
          style={{ background: "rgba(5,5,5,0.96)", borderBottom: "1px solid var(--border)" }}
        >
          {links.map((label) => (
            <a
              key={label}
              href={label === "Editor" ? "/editor" : `#${label.toLowerCase()}`}
              onClick={() => setMenuOpen(false)}
              style={{
                fontSize: "12px",
                fontWeight: 500,
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              {label}
            </a>
          ))}
          <Link
            href="/editor"
            onClick={() => setMenuOpen(false)}
            className="inline-flex items-center justify-center"
            style={{
              height: "30px",
              fontSize: "11px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              borderRadius: "2px",
              background: "var(--text)",
              color: "#000",
              border: "1px solid var(--text)",
            }}
          >
            Launch Editor
          </Link>
        </div>
      )}
    </nav>
  );
}
