import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { checkQuota, recordUsage } from "@/lib/ai-quota";

type Action = "variants" | "recolor" | "upscale" | "extend-frames";

const PROXY_URL = process.env.GEMINI_PROXY_URL || "https://code.newcli.com/gemini";
const PROXY_TOKEN = process.env.GEMINI_PROXY_TOKEN;

async function geminiImageToImage(imageBase64: string, prompt: string): Promise<string | null> {
  const res = await fetch(
    `${PROXY_URL}/v1beta/models/gemini-3-pro-image:generateContent`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PROXY_TOKEN}`,
        "Content-Type": "application/json",
        "User-Agent": "SpriteForge/1.0",
      },
      body: JSON.stringify({
        contents: [{
          role: "user",
          parts: [
            { inlineData: { mimeType: "image/png", data: imageBase64 } },
            { text: prompt },
          ],
        }],
        generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
      }),
    }
  );

  if (!res.ok) throw new Error(await res.text());

  const json = await res.json();
  const parts = json.candidates?.[0]?.content?.parts;
  const imagePart = parts?.find((p: { inlineData?: unknown }) => p.inlineData);
  if (!imagePart?.inlineData) return null;

  return imagePart.inlineData.data;
}

export async function POST(req: NextRequest) {
  try {
    const { action, imageBase64, prompt, count } = await req.json() as {
      action: Action;
      imageBase64: string;
      prompt?: string;
      count?: number;
    };

    if (!action || !imageBase64) {
      return NextResponse.json({ error: "action and imageBase64 required" }, { status: 400 });
    }

    if (!PROXY_TOKEN) {
      return NextResponse.json({ error: "AI not configured" }, { status: 503 });
    }

    // Auth + quota
    const session = await auth();
    const userId = session?.user?.id;
    const tier = (session?.user as Record<string, unknown> | undefined)?.tier as string ?? "FREE";
    const frameCount = Math.min(count || 1, 8);

    if (userId) {
      const quota = await checkQuota(userId, tier);
      if (!quota.allowed) {
        return NextResponse.json({ error: `Daily limit reached (${quota.used}/${quota.limit})` }, { status: 429 });
      }
    }

    const raw = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const images: string[] = [];

    const promptMap: Record<string, string> = {
      variants: prompt || "Create a variation of this game sprite with a different pose, keep the same character and art style, transparent background",
      recolor: prompt || "Recolor this sprite with a completely different color palette, keep the same pose and shape, transparent background",
      upscale: "Upscale this image to higher resolution, preserve all details and pixel art style exactly, transparent background",
      "extend-frames": prompt || "Create the next animation frame for this game sprite, maintain consistent style and character, transparent background",
    };

    const iterations = action === "extend-frames" ? frameCount
      : action === "variants" ? Math.min(count || 3, 4)
      : 1;

    for (let i = 0; i < iterations; i++) {
      const p = action === "extend-frames"
        ? `${promptMap[action]}, frame ${i + 1} of ${frameCount}`
        : promptMap[action];

      const b64 = await geminiImageToImage(raw, p);
      if (!b64) {
        return NextResponse.json({ error: "AI failed to generate image" }, { status: 502 });
      }
      images.push(`data:image/png;base64,${b64}`);
    }

    if (userId) {
      await recordUsage(userId, images.length);
    }

    return NextResponse.json({ images });
  } catch (e) {
    console.error("AI transform error:", e);
    return NextResponse.json({ error: "Transform failed" }, { status: 500 });
  }
}
