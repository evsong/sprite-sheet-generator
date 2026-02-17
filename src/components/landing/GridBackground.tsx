"use client";

import { useEffect } from "react";

export function GridBackground() {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      document.documentElement.style.setProperty("--mx", e.clientX + "px");
      document.documentElement.style.setProperty("--my", e.clientY + "px");
    };
    document.addEventListener("mousemove", handler);
    return () => document.removeEventListener("mousemove", handler);
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{
        zIndex: -1,
        backgroundSize: "40px 40px",
        backgroundImage:
          "linear-gradient(to right, rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.025) 1px, transparent 1px)",
        maskImage:
          "radial-gradient(circle 600px at var(--mx, 50%) var(--my, 50%), black 0%, transparent 100%)",
        WebkitMaskImage:
          "radial-gradient(circle 600px at var(--mx, 50%) var(--my, 50%), black 0%, transparent 100%)",
      }}
    />
  );
}
