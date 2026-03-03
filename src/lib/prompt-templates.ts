export type GenerationMode = "sequence" | "atlas";

export interface PromptTemplate {
  id: string;
  name: string;
  prompt: string;
  defaultFrames: number;
  icon: string;
  mode: GenerationMode;
}

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  // Sequence (animation) templates
  { id: "walk", name: "Walk Cycle", prompt: "character walking animation, side view, full stride cycle", defaultFrames: 6, icon: "🚶", mode: "sequence" },
  { id: "attack", name: "Attack", prompt: "character attack slash animation, wind-up to follow-through", defaultFrames: 4, icon: "⚔️", mode: "sequence" },
  { id: "idle", name: "Idle", prompt: "character subtle idle breathing animation, gentle movement", defaultFrames: 4, icon: "🧍", mode: "sequence" },
  { id: "run", name: "Run Cycle", prompt: "character running animation, full sprint stride cycle", defaultFrames: 8, icon: "🏃", mode: "sequence" },
  { id: "explosion", name: "Explosion", prompt: "explosion VFX effect, expanding fireball to dissipating smoke", defaultFrames: 6, icon: "💥", mode: "sequence" },
  { id: "coin", name: "Coin Spin", prompt: "spinning coin, smooth 360 degree rotation", defaultFrames: 8, icon: "🪙", mode: "sequence" },
  { id: "chest", name: "Chest Open", prompt: "treasure chest opening animation, lid swinging open with glow", defaultFrames: 4, icon: "📦", mode: "sequence" },
  { id: "death", name: "Death", prompt: "character defeat animation, falling and fading out", defaultFrames: 5, icon: "💀", mode: "sequence" },
  // Atlas (icon set) templates
  { id: "potions", name: "Potion Set", prompt: "set of different magic potions, various flask shapes and liquid colors (red health, blue mana, green poison, yellow speed)", defaultFrames: 4, icon: "🧪", mode: "atlas" },
  { id: "weapons", name: "Weapon Set", prompt: "collection of medieval weapons, each visually distinct (sword, axe, mace, bow)", defaultFrames: 4, icon: "🗡️", mode: "atlas" },
  { id: "elements", name: "Elemental Icons", prompt: "set of elemental magic icons, each representing a different element (fire, water, earth, lightning)", defaultFrames: 4, icon: "🔥", mode: "atlas" },
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

export function buildSystemPrompt(
  userPrompt: string,
  frameCount: number,
  style: string,
  mode: GenerationMode = "sequence",
): string {
  const { rows, cols } = getOptimalGrid(frameCount);

  const baseRules = [
    `Create a sprite sheet with exactly ${frameCount} ${mode === "sequence" ? "animation frames" : "items"} arranged in a ${rows}×${cols} grid (${rows} rows, ${cols} columns).`,
    `Each cell must be exactly the same size.`,
    `${style} style, suitable for game engine import.`,
    `Use a solid checkerboard gray-white background behind each ${mode === "sequence" ? "frame" : "item"}.`,
    `DO NOT add labels, numbers, borders, or any text between cells.`,
  ];

  const modeRules =
    mode === "sequence"
      ? [
          `Frames flow left-to-right, top-to-bottom representing a continuous animation sequence.`,
          `Keep STRICTLY consistent character proportions, colors, and features across all frames.`,
          `Ensure smooth motion transition between consecutive frames.`,
        ]
      : [
          `Each grid cell MUST contain a DISTINCT and UNIQUE item based on the theme.`,
          `Maximize the variety between items — different shapes, colors, and designs — while maintaining the same art style.`,
          `Do NOT create an animation sequence. These are separate, independent assets with no visual continuity between them.`,
        ];

  return [...baseRules, ...modeRules, ``, `User request: ${userPrompt}`].join("\n");
}
