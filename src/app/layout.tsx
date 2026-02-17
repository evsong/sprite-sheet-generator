import type { Metadata } from "next";
import { Providers } from "@/components/auth/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "SpriteForge — AI-Powered Sprite Sheet Generator",
  description: "Free online sprite sheet generator with AI sprite creation, MaxRects bin packing, transparent trimming, animation preview, and multi-engine export for Phaser, PixiJS, Unity, and Godot.",
  keywords: "sprite sheet generator, sprite sheet maker, texture packer, AI sprite generator, game development, pixel art, spritesheet, free texture packer alternative",
  openGraph: {
    title: "SpriteForge — AI-Powered Sprite Sheet Generator",
    description: "Generate, pack, and export sprite sheets for any game engine. Free online tool with AI sprite creation.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
