import { Tier } from "@prisma/client";

export const TIER_LIMITS = {
  [Tier.FREE]: {
    aiGenerationsPerDay: 3,
    maxSprites: 20,
    exportFormats: ["json", "css"] as const,
    cloudSave: false,
    watermark: true,
    codeSnippets: false,
    onionSkin: false,
  },
  [Tier.PRO]: {
    aiGenerationsPerDay: 50,
    maxSprites: 200,
    exportFormats: ["json", "css", "pixijs", "phaser", "unity", "godot"] as const,
    cloudSave: true,
    watermark: false,
    codeSnippets: true,
    onionSkin: true,
  },
  [Tier.TEAM]: {
    aiGenerationsPerDay: Infinity,
    maxSprites: Infinity,
    exportFormats: ["json", "css", "pixijs", "phaser", "unity", "godot"] as const,
    cloudSave: true,
    watermark: false,
    codeSnippets: true,
    onionSkin: true,
  },
} as const;

export type TierLimits = (typeof TIER_LIMITS)[Tier];
