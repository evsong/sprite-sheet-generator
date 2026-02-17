import Link from "next/link";
import { useEditorStore } from "@/stores/editor-store";
import { exportSpriteSheet } from "@/lib/exporter";
import { exportProject, importProject } from "@/lib/project";
import { UserMenu } from "@/components/auth/UserMenu";
import { useSession } from "next-auth/react";
import { useCallback, useRef, useState } from "react";

export function EditorToolbar() {
  const zoom = useEditorStore((s) => s.zoom);
  const setZoom = useEditorStore((s) => s.setZoom);
  const sprites = useEditorStore((s) => s.sprites);
  const bins = useEditorStore((s) => s.bins);
  const packingConfig = useEditorStore((s) => s.packingConfig);
  const animation = useEditorStore((s) => s.animation);
  const clearSprites = useEditorStore((s) => s.clearSprites);
  const loadProjectAction = useEditorStore((s) => s.loadProject);
  const openFileRef = useRef<HTMLInputElement>(null);
  const { data: session } = useSession();
  const tier = (session?.user as Record<string, unknown> | undefined)?.tier as string ?? "FREE";
  const isPaid = tier === "PRO" || tier === "TEAM";
  const [cloudSaving, setCloudSaving] = useState(false);

  const handleExport = useCallback(() => {
    if (bins.length === 0) return;
    exportSpriteSheet(bins, sprites, packingConfig);
  }, [bins, sprites, packingConfig]);

  const handleNew = useCallback(() => {
    if (sprites.length > 0 && !confirm("Start a new project? Unsaved changes will be lost.")) return;
    clearSprites();
    useEditorStore.setState({
      animation: { frames: [], fps: 12, playing: false, currentFrame: 0, mode: "loop", onionSkin: false },
    });
  }, [sprites.length, clearSprites]);

  const handleSave = useCallback(() => {
    exportProject(sprites, packingConfig, animation);
  }, [sprites, packingConfig, animation]);

  const handleOpen = useCallback(async (file: File) => {
    try {
      const data = await importProject(file);
      loadProjectAction(data);
    } catch (e) {
      alert(`Failed to open project: ${(e as Error).message}`);
    }
  }, [loadProjectAction]);

  const handleCloudSave = useCallback(async () => {
    if (!isPaid || sprites.length === 0) return;
    setCloudSaving(true);
    try {
      const name = prompt("Project name:", "Untitled") || "Untitled";
      const fd = new FormData();
      fd.append("name", name);
      fd.append("config", JSON.stringify({ packingConfig, animation: { frames: animation.frames, fps: animation.fps, mode: animation.mode } }));

      // Convert sprite images to blobs and attach
      for (const sprite of sprites) {
        if (sprite.image) {
          const canvas = document.createElement("canvas");
          canvas.width = sprite.width;
          canvas.height = sprite.height;
          const ctx = canvas.getContext("2d")!;
          ctx.drawImage(sprite.image, 0, 0);
          const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), "image/png"));
          fd.append(`sprite-${sprite.name}.png`, blob);
          fd.append(`meta-${sprite.name}.png`, JSON.stringify({ id: sprite.id, name: sprite.name, width: sprite.width, height: sprite.height, trimmed: sprite.trimmed, isAi: sprite.isAi }));
        }
      }

      const res = await fetch("/api/projects", { method: "POST", body: fd });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Save failed");
      }
    } catch {
      alert("Failed to save to cloud");
    } finally {
      setCloudSaving(false);
    }
  }, [isPaid, sprites, packingConfig, animation]);

  return (
    <div className="h-10 bg-[#0D0D0D] border-b border-[#1E1E1E] flex items-center px-3 gap-1 shrink-0">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-1.5 mr-3 cursor-pointer">
        <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
          <rect x="2" y="2" width="12" height="12" rx="2" fill="#06B6D4" />
          <rect x="18" y="2" width="12" height="12" rx="2" fill="#F59E0B" />
          <rect x="2" y="18" width="12" height="12" rx="2" fill="#22C55E" />
          <rect x="18" y="18" width="12" height="12" rx="2" fill="#06B6D4" opacity="0.5" />
        </svg>
        <span className="font-[family-name:var(--font-display)] text-xs font-bold text-white">
          SpriteForge
        </span>
      </Link>

      <div className="w-px h-5 bg-[#1E1E1E]" />

      {/* File ops */}
      <div className="flex items-center gap-0.5 ml-2">
        <button
          title="New (⌘N)"
          onClick={handleNew}
          className="p-1.5 rounded hover:bg-[#1A1A1A] text-[#A0A0A0] hover:text-white transition-colors duration-150 cursor-pointer"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
        <button
          title="Open (⌘O)"
          onClick={() => openFileRef.current?.click()}
          className="p-1.5 rounded hover:bg-[#1A1A1A] text-[#A0A0A0] hover:text-white transition-colors duration-150 cursor-pointer"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 19V5a2 2 0 012-2h4l2 2h4a2 2 0 012 2v2M5 19l2.5-7h9l2.5 7H5z" />
          </svg>
        </button>
        <button
          title="Save (⌘S)"
          onClick={handleSave}
          className="p-1.5 rounded hover:bg-[#1A1A1A] text-[#A0A0A0] hover:text-white transition-colors duration-150 cursor-pointer"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2zM17 21v-8H7v8M7 3v5h8" />
          </svg>
        </button>
        {isPaid && (
          <button
            title="Save to Cloud"
            onClick={handleCloudSave}
            disabled={cloudSaving || sprites.length === 0}
            className="p-1.5 rounded hover:bg-[#1A1A1A] text-[#06B6D4] hover:text-[#22D3EE] transition-colors duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {cloudSaving ? (
              <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 11-6.219-8.56" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 16V8M8 12l4-4 4 4" />
                <path d="M20 16.7A4.5 4.5 0 0017.5 8h-1.1A7 7 0 104 14.9" />
              </svg>
            )}
          </button>
        )}
        <input
          ref={openFileRef}
          type="file"
          accept=".spriteforge"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleOpen(file);
            e.target.value = "";
          }}
        />
      </div>

      <div className="w-px h-5 bg-[#1E1E1E] mx-1" />

      {/* Undo/Redo */}
      <div className="flex items-center gap-0.5">
        <button title="Undo (⌘Z)" className="p-1.5 rounded hover:bg-[#1A1A1A] text-[#666] cursor-pointer">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7v6h6M3 13a9 9 0 0118 0 9 9 0 01-9 9 9 9 0 01-7.5-4" />
          </svg>
        </button>
        <button title="Redo (⌘⇧Z)" className="p-1.5 rounded hover:bg-[#1A1A1A] text-[#666] cursor-pointer">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 7v6h-6M21 13a9 9 0 00-18 0 9 9 0 009 9 9 9 0 007.5-4" />
          </svg>
        </button>
      </div>

      <div className="w-px h-5 bg-[#1E1E1E] mx-1" />

      {/* Zoom */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setZoom(Math.max(0.25, zoom - 0.25))}
          className="p-1.5 rounded hover:bg-[#1A1A1A] text-[#A0A0A0] hover:text-white transition-colors duration-150 cursor-pointer"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35M8 11h6" />
          </svg>
        </button>
        <span className="font-[family-name:var(--font-mono)] text-[10px] text-[#A0A0A0] w-8 text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => setZoom(Math.min(4, zoom + 0.25))}
          className="p-1.5 rounded hover:bg-[#1A1A1A] text-[#A0A0A0] hover:text-white transition-colors duration-150 cursor-pointer"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35M11 8v6M8 11h6" />
          </svg>
        </button>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Sprite count */}
      <span className="font-[family-name:var(--font-mono)] text-[10px] text-[#666] mr-3">
        {sprites.length} sprites
      </span>

      {/* Export */}
      <button
        onClick={handleExport}
        disabled={bins.length === 0}
        className="px-3 py-1.5 text-xs font-semibold text-black bg-[#22C55E] rounded-md hover:brightness-110 transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Export
      </button>

      <div className="w-px h-5 bg-[#1E1E1E] mx-1" />

      <UserMenu />
    </div>
  );
}
