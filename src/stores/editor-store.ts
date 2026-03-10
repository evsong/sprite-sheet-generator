import { create } from "zustand";
import type { GenerationMode } from "@/lib/prompt-templates";

export interface PivotPoint {
  x: number; // 0..1 normalized (0.5 = center)
  y: number;
}

export interface SpriteItem {
  id: string;
  name: string;
  file: File | null;
  image: HTMLImageElement | null;
  width: number;
  height: number;
  trimmed: boolean;
  trimRect?: { x: number; y: number; w: number; h: number };
  sourceSize?: { w: number; h: number };
  isAi: boolean;
  mode?: GenerationMode;
  /** Folder/group name for sprites imported via directory drop */
  group?: string;
  pivot: PivotPoint;
  tags?: Record<string, string>;
}

export interface PackedRect {
  spriteId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rot: boolean;
  /** Index of the bin/page this rect belongs to (for multi-atlas) */
  binIndex: number;
}

export interface PackedBin {
  width: number;
  height: number;
  rects: PackedRect[];
}

export interface PackingConfig {
  maxWidth: number;
  maxHeight: number;
  padding: number;
  border: number;
  pot: boolean;
  allowRotation: boolean;
  trimTransparency: boolean;
  exportFormat: string;
  /** Maximum number of atlas pages (0 = unlimited) */
  maxPages: number;
}

export interface AnimationState {
  frames: string[]; // sprite IDs in order
  fps: number;
  playing: boolean;
  currentFrame: number;
  mode: "loop" | "pingpong";
  onionSkin: boolean;
}

export type AiStage = "generating" | "splitting" | "removing-bg" | "done";

export interface AiProgress {
  active: boolean;
  total: number;
  completed: number;
  prompt: string;
  error?: string;
  stage?: AiStage;
  stageLabel?: string;
  startedAt?: number;
}

export type EditorTab = "frames" | "assets";

export type DiffViewMode = "side-by-side" | "overlay";

export interface DiffState {
  active: boolean;
  before: ImageData | null;
  after: ImageData | null;
  diff: ImageData | null;
  viewMode: DiffViewMode;
  mismatchCount: number;
}

interface EditorState {
  sprites: SpriteItem[];
  bins: PackedBin[];
  activeBin: number;
  selectedSpriteId: string | null;
  packingConfig: PackingConfig;
  animation: AnimationState;
  zoom: number;
  aiProgress: AiProgress | null;
  activeTab: EditorTab;

  // Pivot edit mode
  pivotEditMode: boolean;
  setPivotEditMode: (on: boolean) => void;

  // Filename pattern for auto-tagging
  filenamePattern: string;
  autoTagOnImport: boolean;
  setFilenamePattern: (pattern: string) => void;
  setAutoTagOnImport: (on: boolean) => void;

  // Atlas diff state
  diffState: DiffState;
  setDiffState: (state: Partial<DiffState>) => void;
  clearDiff: () => void;

  // Sprite actions
  addSprites: (sprites: SpriteItem[]) => void;
  removeSprite: (id: string) => void;
  reorderSprites: (fromIndex: number, toIndex: number) => void;
  selectSprite: (id: string | null) => void;
  clearSprites: () => void;

  updateSprite: (id: string, updates: Partial<SpriteItem>) => void;

  // Packing actions
  setBins: (bins: PackedBin[]) => void;
  setActiveBin: (index: number) => void;
  updatePackingConfig: (config: Partial<PackingConfig>) => void;

  // Animation actions
  setAnimationFrames: (frames: string[]) => void;
  addToAnimation: (spriteId: string) => void;
  removeFromAnimation: (index: number) => void;
  reorderAnimationFrames: (fromIndex: number, toIndex: number) => void;
  setFps: (fps: number) => void;
  togglePlaying: () => void;
  setCurrentFrame: (frame: number) => void;
  setAnimationMode: (mode: "loop" | "pingpong") => void;
  toggleOnionSkin: () => void;

  // UI state
  aiModalOpen: boolean;
  setAiModalOpen: (open: boolean) => void;
  setAiProgress: (progress: AiProgress | null) => void;
  setActiveTab: (tab: EditorTab) => void;
  lastAiParams: { prompt: string; style: string; frameCount: number; targetSize: number; mode: import("@/lib/prompt-templates").GenerationMode } | null;
  setLastAiParams: (params: EditorState["lastAiParams"]) => void;

  // Project
  loadProject: (data: { sprites: SpriteItem[]; packingConfig: PackingConfig; animation: Partial<AnimationState> }) => void;

  // Zoom
  setZoom: (zoom: number) => void;
}

const DEFAULT_DIFF_STATE: DiffState = {
  active: false,
  before: null,
  after: null,
  diff: null,
  viewMode: "side-by-side",
  mismatchCount: 0,
};

export const useEditorStore = create<EditorState>((set) => ({
  sprites: [],
  bins: [],
  activeBin: 0,
  selectedSpriteId: null,
  packingConfig: {
    maxWidth: 512,
    maxHeight: 512,
    padding: 2,
    border: 0,
    pot: true,
    allowRotation: false,
    trimTransparency: true,
    exportFormat: "json",
    maxPages: 0,
  },
  animation: {
    frames: [],
    fps: 12,
    playing: false,
    currentFrame: 0,
    mode: "loop",
    onionSkin: false,
  },
  zoom: 1,
  aiModalOpen: false,
  aiProgress: null,
  activeTab: "frames",
  lastAiParams: null,

  // Pivot edit mode
  pivotEditMode: false,
  setPivotEditMode: (on) => set({ pivotEditMode: on }),

  // Filename pattern
  filenamePattern: "(?<name>.+?)[-_](?<index>\\d+)",
  autoTagOnImport: true,
  setFilenamePattern: (pattern) => set({ filenamePattern: pattern }),
  setAutoTagOnImport: (on) => set({ autoTagOnImport: on }),

  // Atlas diff
  diffState: { ...DEFAULT_DIFF_STATE },
  setDiffState: (state) =>
    set((s) => ({ diffState: { ...s.diffState, ...state } })),
  clearDiff: () => set({ diffState: { ...DEFAULT_DIFF_STATE } }),

  addSprites: (newSprites) =>
    set((s) => ({ sprites: [...s.sprites, ...newSprites] })),

  removeSprite: (id) =>
    set((s) => ({ sprites: s.sprites.filter((sp) => sp.id !== id) })),

  reorderSprites: (fromIndex, toIndex) =>
    set((s) => {
      const arr = [...s.sprites];
      const [moved] = arr.splice(fromIndex, 1);
      arr.splice(toIndex, 0, moved);
      return { sprites: arr };
    }),

  selectSprite: (id) => set({ selectedSpriteId: id }),

  updateSprite: (id, updates) =>
    set((s) => ({
      sprites: s.sprites.map((sp) => (sp.id === id ? { ...sp, ...updates } : sp)),
    })),

  clearSprites: () => set({ sprites: [], bins: [], activeBin: 0 }),

  setBins: (bins) => set({ bins }),
  setActiveBin: (index) => set({ activeBin: index }),
  updatePackingConfig: (config) =>
    set((s) => ({ packingConfig: { ...s.packingConfig, ...config } })),

  setAnimationFrames: (frames) =>
    set((s) => ({ animation: { ...s.animation, frames } })),
  addToAnimation: (spriteId) =>
    set((s) => ({ animation: { ...s.animation, frames: [...s.animation.frames, spriteId] } })),
  removeFromAnimation: (index) =>
    set((s) => {
      const frames = [...s.animation.frames];
      frames.splice(index, 1);
      const currentFrame = Math.min(s.animation.currentFrame, Math.max(0, frames.length - 1));
      return { animation: { ...s.animation, frames, currentFrame } };
    }),
  reorderAnimationFrames: (fromIndex, toIndex) =>
    set((s) => {
      const frames = [...s.animation.frames];
      const [moved] = frames.splice(fromIndex, 1);
      frames.splice(toIndex, 0, moved);
      return { animation: { ...s.animation, frames } };
    }),
  setFps: (fps) =>
    set((s) => ({ animation: { ...s.animation, fps } })),
  togglePlaying: () =>
    set((s) => ({ animation: { ...s.animation, playing: !s.animation.playing } })),
  setCurrentFrame: (frame) =>
    set((s) => ({ animation: { ...s.animation, currentFrame: frame } })),
  setAnimationMode: (mode) =>
    set((s) => ({ animation: { ...s.animation, mode } })),
  toggleOnionSkin: () =>
    set((s) => ({ animation: { ...s.animation, onionSkin: !s.animation.onionSkin } })),

  setZoom: (zoom) => set({ zoom }),
  setAiModalOpen: (open) => set({ aiModalOpen: open }),
  setAiProgress: (progress) => set({ aiProgress: progress }),
  setLastAiParams: (params) => set({ lastAiParams: params }),
  setActiveTab: (tab) => set({ activeTab: tab, activeBin: 0 }),
  loadProject: (data) =>
    set({
      sprites: data.sprites,
      packingConfig: data.packingConfig,
      animation: {
        frames: data.animation.frames ?? [],
        fps: data.animation.fps ?? 12,
        playing: false,
        currentFrame: 0,
        mode: data.animation.mode ?? "loop",
        onionSkin: false,
      },
      bins: [],
      activeBin: 0,
      selectedSpriteId: null,
    }),
}));

// Expose store for dev tools
if (typeof window !== "undefined") {
  (window as unknown as Record<string, unknown>).__editorStore = useEditorStore;
}
