import Mustache from "mustache";
import type { PackedBin, SpriteItem } from "@/stores/editor-store";
import { getFormatById } from "./export-formats";

// ── Canvas rendering ──────────────────────────────────────────────

export function renderBinToCanvas(bin: PackedBin, sprites: SpriteItem[]): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = bin.width;
  canvas.height = bin.height;
  const ctx = canvas.getContext("2d")!;

  bin.rects.forEach((rect) => {
    const sprite = sprites.find((s) => s.id === rect.spriteId);
    if (!sprite?.image) return;

    ctx.save();
    if (rect.rot) {
      ctx.translate(rect.x + rect.height, rect.y);
      ctx.rotate(Math.PI / 2);
    }

    if (sprite.trimmed && sprite.trimRect) {
      const tr = sprite.trimRect;
      ctx.drawImage(
        sprite.image,
        tr.x, tr.y, tr.w, tr.h,
        rect.rot ? 0 : rect.x, rect.rot ? 0 : rect.y,
        rect.width, rect.height
      );
    } else {
      ctx.drawImage(
        sprite.image,
        rect.rot ? 0 : rect.x, rect.rot ? 0 : rect.y,
        rect.width, rect.height
      );
    }
    ctx.restore();
  });

  return canvas;
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), "image/png");
  });
}

function addWatermark(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.save();
  ctx.font = "bold 10px 'JetBrains Mono', monospace";
  ctx.fillStyle = "rgba(255,255,255,0.25)";
  ctx.textAlign = "right";
  ctx.textBaseline = "bottom";
  ctx.fillText("Made with SpriteForge", canvas.width - 4, canvas.height - 4);
  ctx.restore();
}

// ── Template context builder (adapted from free-tex-packer-core) ──

function buildTemplateContext(bin: PackedBin, sprites: SpriteItem[], imageName: string) {
  const rects = bin.rects.map((r, index) => {
    const sprite = sprites.find((s) => s.id === r.spriteId);
    const name = sprite?.name ?? r.spriteId;
    const trimmed = sprite?.trimmed ?? false;
    const sss = trimmed && sprite?.trimRect
      ? { x: sprite.trimRect.x, y: sprite.trimRect.y, w: sprite.trimRect.w, h: sprite.trimRect.h }
      : { x: 0, y: 0, w: r.width, h: r.height };
    const ss = trimmed && sprite?.sourceSize
      ? { w: sprite.sourceSize.w, h: sprite.sourceSize.h }
      : { w: r.width, h: r.height };

    // Pre-computed values for special templates
    const offsetX = sss.x + sss.w / 2 - ss.w / 2;  // Cocos2d offsetLeft
    const offsetY = ss.h / 2 - (sss.y + sss.h / 2); // Cocos2d offsetRight
    const mirrorY = bin.height - r.y - r.height;      // Unity Y-flip
    const escapedName = name.replace(/%/g, "%25").replace(/#/g, "%23")
      .replace(/:/g, "%3A").replace(/;/g, "%3B").replace(/\\/g, "-").replace(/\//g, "-");

    return {
      name,
      cssName: name.replace(/[^a-zA-Z0-9_-]/g, "-"),
      escapedName,
      frame: { x: r.x, y: r.y, w: r.width, h: r.height, hw: r.width / 2, hh: r.height / 2 },
      spriteSourceSize: sss,
      sourceSize: ss,
      rotated: r.rot,
      trimmed,
      first: index === 0,
      last: index === bin.rects.length - 1,
      index,
      subId: index + 2,
      offsetX, offsetY, mirrorY,
      "&lbrace": "{", "&rbrace": "}",
    };
  });

  return {
    rects,
    config: {
      imageName: `${imageName}.png`,
      imageFile: `${imageName}.png`,
      imageWidth: bin.width,
      imageHeight: bin.height,
      format: "RGBA8888",
      scale: 1,
      base64Export: false,
    },
    appInfo: { displayName: "SpriteForge", version: "1.0", url: "https://spriteforge.dev" },
    loadSteps: bin.rects.length + 2,
  };
}

function renderTemplate(bin: PackedBin, sprites: SpriteItem[], imageName: string, formatId: string): { content: string; ext: string } {
  const fmt = getFormatById(formatId);
  if (!fmt) return { content: "{}", ext: "json" };
  const ctx = buildTemplateContext(bin, sprites, imageName);
  const content = Mustache.render(fmt.template, ctx);
  return { content, ext: fmt.fileExt };
}

// ── Code snippets ─────────────────────────────────────────────────

export function generateCodeSnippet(format: string, imageName: string): string {
  const snippets: Record<string, string> = {
    pixijs: `// PixiJS\nimport { Assets } from 'pixi.js';\nconst sheet = await Assets.load('${imageName}.json');\nconst sprite = new PIXI.Sprite(sheet.textures['frameName']);\napp.stage.addChild(sprite);`,
    phaser: `// Phaser 3\nthis.load.atlas('${imageName}', '${imageName}.png', '${imageName}.json');\n// In create():\nthis.add.sprite(400, 300, '${imageName}', 'frameName');`,
    unity: `// Unity C#\nSprite[] sprites = Resources.LoadAll<Sprite>("${imageName}");\nGetComponent<SpriteRenderer>().sprite = sprites[0];`,
    godot: `# Godot GDScript\nvar atlas = load("res://${imageName}.tres")\n$Sprite2D.texture = atlas`,
    css: `<!-- HTML + CSS -->\n<link rel="stylesheet" href="${imageName}.css">\n<div class="sprite sprite-frameName"></div>`,
    spine: `// Spine Runtime\nvar atlas = new spine.TextureAtlas('${imageName}.atlas');\nvar skeleton = new spine.Skeleton(skeletonData);`,
    starling: `// Starling\nvar atlas:TextureAtlas = new TextureAtlas(Texture.fromBitmap(bitmap), XML(atlasXml));\nvar image:Image = new Image(atlas.getTexture("frameName"));`,
    cocos2d: `// Cocos2d\nauto cache = SpriteFrameCache::getInstance();\ncache->addSpriteFramesWithFile("${imageName}.plist");\nauto sprite = Sprite::createWithSpriteFrameName("frameName");`,
    unreal: `// Unreal Paper2D\n// Import ${imageName}.paper2dsprites via Content Browser\n// Create Paper2D Sprite from imported atlas`,
  };
  return snippets[format] ?? `// Load ${imageName}.json and ${imageName}.png`;
}

// ── Main export ───────────────────────────────────────────────────

export async function exportSpriteSheet(
  bins: PackedBin[],
  sprites: SpriteItem[],
  config: { exportFormat: string; trimTransparency: boolean },
  projectName = "spritesheet",
  options?: { watermark?: boolean }
): Promise<void> {
  if (bins.length === 0) return;

  const applyWatermark = options?.watermark ?? true;

  if (bins.length === 1) {
    const canvas = renderBinToCanvas(bins[0], sprites);
    if (applyWatermark) addWatermark(canvas);
    const pngBlob = await canvasToBlob(canvas);
    const { content, ext } = renderTemplate(bins[0], sprites, projectName, config.exportFormat);
    const snippet = generateCodeSnippet(config.exportFormat, projectName);

    downloadBlob(pngBlob, `${projectName}.png`);
    downloadBlob(new Blob([content], { type: "text/plain" }), `${projectName}.${ext}`);
    downloadBlob(new Blob([snippet], { type: "text/plain" }), `${projectName}.usage.txt`);
  } else {
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();

    for (let i = 0; i < bins.length; i++) {
      const suffix = `-${i}`;
      const name = `${projectName}${suffix}`;
      const canvas = renderBinToCanvas(bins[i], sprites);
      if (applyWatermark) addWatermark(canvas);
      const pngBlob = await canvasToBlob(canvas);
      const { content, ext } = renderTemplate(bins[i], sprites, name, config.exportFormat);

      zip.file(`${name}.png`, pngBlob);
      zip.file(`${name}.${ext}`, content);
    }

    zip.file(`${projectName}.usage.txt`, generateCodeSnippet(config.exportFormat, projectName));
    const zipBlob = await zip.generateAsync({ type: "blob" });
    downloadBlob(zipBlob, `${projectName}.zip`);
  }
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
