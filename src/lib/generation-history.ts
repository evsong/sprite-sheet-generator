const STORAGE_KEY = "spriteforge-gen-history";
const MAX_ENTRIES = 10;

export interface HistoryEntry {
  prompt: string;
  style: string;
  frameCount: number;
  targetSize: number;
  thumbnail?: string;
  timestamp: number;
}

export function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveHistory(entry: HistoryEntry): void {
  const list = loadHistory();
  list.unshift(entry);
  if (list.length > MAX_ENTRIES) list.length = MAX_ENTRIES;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function createThumbnail(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, 128, 128);
      resolve(canvas.toDataURL("image/jpeg", 0.6));
    };
    img.src = dataUrl;
  });
}
