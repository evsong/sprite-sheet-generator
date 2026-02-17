import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Editor — SpriteForge",
  description: "Pack, preview, and export sprite sheets with the SpriteForge editor.",
};

export default function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
