/** Shared tier utilities for SpriteForge */

export type TierName = "FREE" | "PRO" | "TEAM";

export interface TierLimits {
  aiGenerationsPerDay: number;
  maxSpritesPerSheet: number;
  exportFormatsAll: boolean;
  engineSync: boolean;
  normalMaps: boolean;
  compression: boolean;
  codeSnippets: boolean;
}

export const TIER_LIMITS: Record<TierName, TierLimits> = {
  FREE: {
    aiGenerationsPerDay: 1,
    maxSpritesPerSheet: 64,
    exportFormatsAll: false,
    engineSync: false,
    normalMaps: false,
    compression: false,
    codeSnippets: false,
  },
  PRO: {
    aiGenerationsPerDay: 10,
    maxSpritesPerSheet: Infinity,
    exportFormatsAll: true,
    engineSync: true,
    normalMaps: true,
    compression: true,
    codeSnippets: true,
  },
  TEAM: {
    aiGenerationsPerDay: 500,
    maxSpritesPerSheet: Infinity,
    exportFormatsAll: true,
    engineSync: true,
    normalMaps: true,
    compression: true,
    codeSnippets: true,
  },
};

/** Returns true for PRO or TEAM tier */
export function isPro(tier: TierName | string | undefined | null): boolean {
  return tier === "PRO" || tier === "TEAM";
}

/** Extract tier from NextAuth session object */
export function getTierFromSession(session: { user?: Record<string, unknown> } | null | undefined): TierName {
  const tier = (session?.user as Record<string, unknown> | undefined)?.tier as string | undefined;
  if (tier === "PRO" || tier === "TEAM") return tier;
  return "FREE";
}

/** Get limits for a given tier */
export function getLimits(tier: TierName | string | undefined | null): TierLimits {
  const t = (tier === "PRO" || tier === "TEAM") ? tier : "FREE";
  return TIER_LIMITS[t];
}
