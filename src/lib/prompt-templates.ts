export interface PromptTemplate {
  id: string;
  name: string;
  prompt: string;
  defaultFrames: number;
  icon: string;
}

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  { id: "walk", name: "Walk Cycle", prompt: "character walking animation, side view, full stride cycle", defaultFrames: 6, icon: "🚶" },
  { id: "attack", name: "Attack", prompt: "character attack slash animation, wind-up to follow-through", defaultFrames: 4, icon: "⚔️" },
  { id: "idle", name: "Idle", prompt: "character subtle idle breathing animation, gentle movement", defaultFrames: 4, icon: "🧍" },
  { id: "run", name: "Run Cycle", prompt: "character running animation, full sprint stride cycle", defaultFrames: 8, icon: "🏃" },
  { id: "explosion", name: "Explosion", prompt: "explosion VFX effect, expanding fireball to dissipating smoke", defaultFrames: 6, icon: "💥" },
  { id: "coin", name: "Coin Spin", prompt: "spinning coin, smooth 360 degree rotation", defaultFrames: 8, icon: "🪙" },
  { id: "chest", name: "Chest Open", prompt: "treasure chest opening animation, lid swinging open with glow", defaultFrames: 4, icon: "📦" },
  { id: "death", name: "Death", prompt: "character defeat animation, falling and fading out", defaultFrames: 5, icon: "💀" },
];

export function getOptimalGrid(frameCount: number): { rows: number; cols: number } {
  const layouts: Record<number, [number, number]> = {
    1: [1, 1], 2: [1, 2], 3: [1, 3], 4: [2, 2],
    5: [2, 3], 6: [2, 3], 7: [2, 4], 8: [2, 4],
    9: [3, 3], 10: [2, 5],
  };
  const [rows, cols] = layouts[frameCount] ?? [Math.ceil(frameCount / 4), 4];
  return { rows, cols };
}

export function buildSystemPrompt(userPrompt: string, frameCount: number, style: string): string {
  const { rows, cols } = getOptimalGrid(frameCount);
  return [
    `Create a sprite sheet with exactly ${frameCount} animation frames arranged in a ${rows}×${cols} grid (${rows} rows, ${cols} columns).`,
    `Each frame must be exactly the same size. Frames flow left-to-right, top-to-bottom.`,
    `Keep consistent character proportions and art style across all frames.`,
    `${style} style, suitable for game engine import.`,
    `Use a solid checkerboard gray-white background behind the character.`,
    `DO NOT add labels, numbers, borders, or any text between frames.`,
    ``,
    `User request: ${userPrompt}`,
  ].join("\n");
}
