/**
 * Smart Folder Scanner
 *
 * Uses the File System Access API (webkitGetAsEntry) to recursively
 * scan dropped directories and extract image files with their folder
 * groupings. Subfolder names become the `group` field on SpriteItem,
 * enabling auto-creation of animation sequences from folder structure.
 */

export interface ScannedFile {
  file: File;
  /** Relative path from root drop (e.g. "walk/frame-01.png") */
  relativePath: string;
  /** Immediate parent folder name, used as group identifier */
  group: string;
}

/**
 * Check whether a DataTransfer contains directory entries.
 */
export function hasDirectoryEntries(dataTransfer: DataTransfer): boolean {
  if (!dataTransfer.items) return false;
  for (let i = 0; i < dataTransfer.items.length; i++) {
    const item = dataTransfer.items[i];
    if (item.kind === "file") {
      const entry = item.webkitGetAsEntry?.();
      if (entry?.isDirectory) return true;
    }
  }
  return false;
}

/**
 * Scan a DataTransfer for all image files, recursively entering directories.
 * Returns files annotated with their folder group.
 *
 * If the drop contains only flat files (no directories), each file gets
 * an empty group string. If directories are present, the immediate subfolder
 * name is used as the group.
 */
export async function scanDataTransfer(dataTransfer: DataTransfer): Promise<ScannedFile[]> {
  const results: ScannedFile[] = [];
  const entries: FileSystemEntry[] = [];

  // Collect all top-level entries
  if (dataTransfer.items) {
    for (let i = 0; i < dataTransfer.items.length; i++) {
      const item = dataTransfer.items[i];
      if (item.kind === "file") {
        const entry = item.webkitGetAsEntry?.();
        if (entry) {
          entries.push(entry);
        }
      }
    }
  }

  // If no entries via webkitGetAsEntry, fall back to flat file list
  if (entries.length === 0) {
    const files = dataTransfer.files;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (isImageFile(file.name)) {
        results.push({ file, relativePath: file.name, group: "" });
      }
    }
    return results;
  }

  // Process entries recursively
  for (const entry of entries) {
    if (entry.isFile) {
      const file = await entryToFile(entry as FileSystemFileEntry);
      if (file && isImageFile(file.name)) {
        results.push({ file, relativePath: file.name, group: "" });
      }
    } else if (entry.isDirectory) {
      const dirResults = await scanDirectory(entry as FileSystemDirectoryEntry, entry.name, entry.name);
      results.push(...dirResults);
    }
  }

  return results;
}

async function scanDirectory(
  dirEntry: FileSystemDirectoryEntry,
  rootName: string,
  currentPath: string,
): Promise<ScannedFile[]> {
  const results: ScannedFile[] = [];
  const entries = await readAllEntries(dirEntry);

  for (const entry of entries) {
    const entryPath = `${currentPath}/${entry.name}`;
    if (entry.isFile) {
      const file = await entryToFile(entry as FileSystemFileEntry);
      if (file && isImageFile(file.name)) {
        // Group is the immediate parent folder name
        // For top-level dir files, group is the dir name
        // For nested files, group is the deepest subfolder
        const pathParts = entryPath.split("/");
        // Use the subfolder directly under root as group
        // e.g., "character/walk/frame-01.png" -> group = "walk"
        // e.g., "character/idle.png" -> group = "character"
        const group = pathParts.length > 2 ? pathParts[pathParts.length - 2] : rootName;
        results.push({
          file,
          relativePath: entryPath,
          group,
        });
      }
    } else if (entry.isDirectory) {
      const subResults = await scanDirectory(entry as FileSystemDirectoryEntry, rootName, entryPath);
      results.push(...subResults);
    }
  }

  return results;
}

function readAllEntries(dirEntry: FileSystemDirectoryEntry): Promise<FileSystemEntry[]> {
  return new Promise((resolve, reject) => {
    const reader = dirEntry.createReader();
    const allEntries: FileSystemEntry[] = [];

    const readBatch = () => {
      reader.readEntries(
        (entries) => {
          if (entries.length === 0) {
            // Sort entries by name for consistent ordering
            allEntries.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
            resolve(allEntries);
          } else {
            allEntries.push(...entries);
            readBatch(); // Continue reading (readEntries may return partial results)
          }
        },
        reject,
      );
    };

    readBatch();
  });
}

function entryToFile(fileEntry: FileSystemFileEntry): Promise<File | null> {
  return new Promise((resolve) => {
    fileEntry.file(
      (file) => resolve(file),
      () => resolve(null),
    );
  });
}

const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".bmp"]);

function isImageFile(name: string): boolean {
  const ext = name.slice(name.lastIndexOf(".")).toLowerCase();
  return IMAGE_EXTENSIONS.has(ext);
}

/**
 * Given a list of scanned files with groups, determine which groups
 * should be treated as animation sequences. A group with 2+ files
 * whose names follow a numeric pattern is a sequence candidate.
 */
export function detectSequenceGroups(files: ScannedFile[]): Map<string, ScannedFile[]> {
  const groups = new Map<string, ScannedFile[]>();
  for (const f of files) {
    if (!f.group) continue;
    if (!groups.has(f.group)) groups.set(f.group, []);
    groups.get(f.group)!.push(f);
  }

  // Only return groups with 2+ files (likely animation sequences)
  const sequences = new Map<string, ScannedFile[]>();
  for (const [group, groupFiles] of groups) {
    if (groupFiles.length >= 2) {
      // Sort by numeric suffix in filename for proper frame ordering
      groupFiles.sort((a, b) => {
        const numA = extractTrailingNumber(a.file.name);
        const numB = extractTrailingNumber(b.file.name);
        if (numA !== null && numB !== null) return numA - numB;
        return a.file.name.localeCompare(b.file.name, undefined, { numeric: true });
      });
      sequences.set(group, groupFiles);
    }
  }

  return sequences;
}

function extractTrailingNumber(filename: string): number | null {
  const base = filename.replace(/\.[^.]+$/, "");
  const match = base.match(/(\d+)$/);
  return match ? parseInt(match[1], 10) : null;
}
