import { useEditorStore, SpriteItem } from "@/stores/editor-store";
import { removeBackground } from "@/lib/bg-removal";
import { useCallback, useRef, useState } from "react";

export function SpriteList() {
  const sprites = useEditorStore((s) => s.sprites);
  const selectedSpriteId = useEditorStore((s) => s.selectedSpriteId);
  const selectSprite = useEditorStore((s) => s.selectSprite);
  const removeSprite = useEditorStore((s) => s.removeSprite);
  const addSprites = useEditorStore((s) => s.addSprites);
  const reorderSprites = useEditorStore((s) => s.reorderSprites);
  const addToAnimation = useEditorStore((s) => s.addToAnimation);
  const setAnimationFrames = useEditorStore((s) => s.setAnimationFrames);
  const updateSprite = useEditorStore((s) => s.updateSprite);
  const setAiModalOpen = useEditorStore((s) => s.setAiModalOpen);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; spriteId: string } | null>(null);
  const [processingBg, setProcessingBg] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [sidebarDragOver, setSidebarDragOver] = useState(false);

  const handleFileUpload = useCallback(
    (files: FileList) => {
      const imageFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
      if (imageFiles.length === 0) return;
      const newSprites: SpriteItem[] = [];
      let loaded = 0;
      imageFiles.forEach((file) => {
        const img = new Image();
        img.onload = () => {
          newSprites.push({
            id: crypto.randomUUID(),
            name: file.name.replace(/\.[^.]+$/, ""),
            file,
            image: img,
            width: img.naturalWidth,
            height: img.naturalHeight,
            trimmed: false,
            isAi: false,
          });
          loaded++;
          if (loaded === imageFiles.length) {
            addSprites(newSprites);
          }
        };
        img.src = URL.createObjectURL(file);
      });
    },
    [addSprites]
  );

  const handleRemoveBg = useCallback(
    async (spriteId: string) => {
      const sprite = sprites.find((s) => s.id === spriteId);
      if (!sprite?.image || processingBg) return;
      setProcessingBg(spriteId);
      try {
        const result = await removeBackground(sprite.image);
        updateSprite(spriteId, {
          image: result.image,
          width: result.image.naturalWidth,
          height: result.image.naturalHeight,
          file: new File([result.blob], `${sprite.name}-nobg.png`, { type: "image/png" }),
        });
      } catch (err) {
        console.error("Background removal failed:", err);
      } finally {
        setProcessingBg(null);
      }
    },
    [sprites, processingBg, updateSprite]
  );

  const handleContextMenu = (e: React.MouseEvent, spriteId: string) => {
    e.preventDefault();
    selectSprite(spriteId);
    setContextMenu({ x: e.clientX, y: e.clientY, spriteId });
  };

  return (
    <div
      className={`w-56 bg-[#0D0D0D] border-r border-[#1E1E1E] flex flex-col shrink-0 ${sidebarDragOver ? "ring-1 ring-inset ring-[#06B6D4]/40" : ""}`}
      onDragOver={(e) => {
        // Only handle file drags, not internal reorder
        if (e.dataTransfer.types.includes("Files")) {
          e.preventDefault();
          setSidebarDragOver(true);
        }
      }}
      onDragLeave={(e) => {
        if (e.currentTarget.contains(e.relatedTarget as Node)) return;
        setSidebarDragOver(false);
      }}
      onDrop={(e) => {
        if (e.dataTransfer.files.length > 0) {
          e.preventDefault();
          e.stopPropagation();
          setSidebarDragOver(false);
          handleFileUpload(e.dataTransfer.files);
        }
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#1E1E1E]">
        <span className="font-[family-name:var(--font-mono)] text-[10px] text-[#666] uppercase tracking-wider">
          Sprites
        </span>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="text-[10px] font-[family-name:var(--font-mono)] text-[#F59E0B] hover:text-[#FBBF24] transition-colors duration-150 cursor-pointer"
        >
          + Add
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/png,image/webp,image/gif,image/jpeg"
          className="hidden"
          onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
        />
      </div>

      {/* Sprite list */}
      <div className="flex-1 overflow-y-auto">
        {sprites.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-4 text-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M12 8v8M8 12h8" />
            </svg>
            <p className="text-[10px] text-[#666] mt-2 font-[family-name:var(--font-mono)]">
              Drop images here or click + Add
            </p>
          </div>
        ) : (
          sprites.map((sprite, index) => (
            <div
              key={sprite.id}
              draggable
              onDragStart={(e) => {
                setDragIndex(index);
                e.dataTransfer.effectAllowed = "move";
                e.dataTransfer.setData("text/plain", ""); // needed for Firefox
              }}
              onDragOver={(e) => {
                if (dragIndex === null) return;
                e.preventDefault();
                setDragOverIndex(index);
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (dragIndex !== null && dragIndex !== index) {
                  reorderSprites(dragIndex, index);
                }
                setDragIndex(null);
                setDragOverIndex(null);
              }}
              onDragEnd={() => {
                setDragIndex(null);
                setDragOverIndex(null);
              }}
              onClick={() => selectSprite(sprite.id)}
              onContextMenu={(e) => handleContextMenu(e, sprite.id)}
              className={`flex items-center gap-2 px-3 py-1.5 cursor-grab active:cursor-grabbing transition-colors duration-100 ${
                selectedSpriteId === sprite.id
                  ? "bg-[#1A1A1A] border-l-2 border-[#06B6D4]"
                  : "border-l-2 border-transparent hover:bg-[#111]"
              } ${dragOverIndex === index && dragIndex !== index ? "border-t border-t-[#06B6D4]" : ""} ${
                dragIndex === index ? "opacity-40" : ""
              }`}
            >
              {/* Thumbnail */}
              <div className="w-8 h-8 rounded bg-[#1A1A1A] border border-[#1E1E1E] flex items-center justify-center shrink-0 overflow-hidden relative">
                {sprite.image && (
                  <canvas
                    ref={(canvas) => {
                      if (canvas && sprite.image) {
                        const ctx = canvas.getContext("2d");
                        if (ctx) {
                          canvas.width = 28;
                          canvas.height = 28;
                          const scale = Math.min(28 / sprite.width, 28 / sprite.height);
                          const w = sprite.width * scale;
                          const h = sprite.height * scale;
                          ctx.clearRect(0, 0, 28, 28);
                          ctx.drawImage(sprite.image, (28 - w) / 2, (28 - h) / 2, w, h);
                        }
                      }
                    }}
                    width={28}
                    height={28}
                  />
                )}
                {processingBg === sprite.id && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-[#F59E0B] border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>

              {/* Name + size */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-[11px] text-[#A0A0A0] truncate">
                    {sprite.name}
                  </span>
                  {sprite.isAi && (
                    <span className="font-[family-name:var(--font-mono)] text-[7px] text-[#F59E0B] bg-[#F59E0B]/10 px-1 rounded shrink-0">
                      AI
                    </span>
                  )}
                </div>
                <span className="font-[family-name:var(--font-mono)] text-[9px] text-[#666]">
                  {sprite.width}×{sprite.height}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* AI Generate button */}
      <div className="p-2 border-t border-[#1E1E1E]">
        <button
          onClick={() => setAiModalOpen(true)}
          className="w-full py-2 text-[11px] font-[family-name:var(--font-mono)] font-semibold text-[#F59E0B] border border-[#F59E0B]/20 rounded-md hover:bg-[#F59E0B]/5 transition-colors duration-200 cursor-pointer"
        >
          + Generate New...
        </button>
      </div>

      {/* Context menu */}
      {contextMenu && (
        <>
          <div className="fixed inset-0 z-[199]" onClick={() => setContextMenu(null)} />
          <div
            className="fixed z-[200] bg-[#0D0D0D] border border-[#1E1E1E] rounded-lg py-1 min-w-[160px]"
            style={{
              left: contextMenu.x,
              top: contextMenu.y,
              boxShadow: "0 4px 6px -1px rgba(0,0,0,0.5), 0 2px 4px -1px rgba(0,0,0,0.3), 0 12px 32px rgba(0,0,0,0.6)",
            }}
          >
            {/* AI actions */}
            {[
              { label: "AI Variants", key: "⌘⇧V" },
              { label: "AI Recolor", key: "⌘⇧C" },
              { label: "AI Upscale 2×", key: "⌘⇧U" },
              { label: "AI Extend Frames", key: "⌘⇧E" },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => setContextMenu(null)}
                className="flex items-center justify-between w-full px-3 py-1.5 text-[10px] font-[family-name:var(--font-mono)] text-[#F59E0B] hover:bg-[#F59E0B]/5 transition-colors duration-100 cursor-pointer"
              >
                <span>{item.label}</span>
                {item.key && <span className="text-[8px] text-[#666] ml-4">{item.key}</span>}
              </button>
            ))}
            <button
              onClick={() => {
                handleRemoveBg(contextMenu.spriteId);
                setContextMenu(null);
              }}
              disabled={processingBg !== null}
              className="flex items-center justify-between w-full px-3 py-1.5 text-[10px] font-[family-name:var(--font-mono)] text-[#F59E0B] hover:bg-[#F59E0B]/5 transition-colors duration-100 cursor-pointer disabled:opacity-40"
            >
              <span>{processingBg ? "Removing BG..." : "AI Remove BG"}</span>
            </button>

            <div className="h-px bg-[#1E1E1E] my-1" />

            {/* Animation actions */}
            <button
              onClick={() => {
                addToAnimation(contextMenu.spriteId);
                setContextMenu(null);
              }}
              className="flex items-center justify-between w-full px-3 py-1.5 text-[10px] font-[family-name:var(--font-mono)] text-[#06B6D4] hover:bg-[#06B6D4]/5 transition-colors duration-100 cursor-pointer"
            >
              <span>Add to Animation</span>
              <span className="text-[8px] text-[#666] ml-4">⌘⇧A</span>
            </button>
            <button
              onClick={() => {
                setAnimationFrames(sprites.map((s) => s.id));
                setContextMenu(null);
              }}
              className="flex items-center justify-between w-full px-3 py-1.5 text-[10px] font-[family-name:var(--font-mono)] text-[#06B6D4] hover:bg-[#06B6D4]/5 transition-colors duration-100 cursor-pointer"
            >
              <span>Add All to Animation</span>
            </button>

            <div className="h-px bg-[#1E1E1E] my-1" />

            {/* Standard actions */}
            {[
              { label: "Duplicate", key: "⌘D", action: () => {} },
              { label: "Rename", key: "F2", action: () => {} },
              {
                label: "Delete",
                key: "⌫",
                action: () => {
                  removeSprite(contextMenu.spriteId);
                  setContextMenu(null);
                },
                danger: true,
              },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  item.action();
                  setContextMenu(null);
                }}
                className={`flex items-center justify-between w-full px-3 py-1.5 text-[10px] font-[family-name:var(--font-mono)] transition-colors duration-100 cursor-pointer ${
                  item.danger
                    ? "text-red-400 hover:bg-red-400/5"
                    : "text-[#A0A0A0] hover:bg-[#1A1A1A] hover:text-white"
                }`}
              >
                <span>{item.label}</span>
                <span className="text-[8px] text-[#666] ml-4">{item.key}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
