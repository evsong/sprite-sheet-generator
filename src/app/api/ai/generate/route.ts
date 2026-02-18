import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { checkQuota, recordUsage } from "@/lib/ai-quota";

const API_URL = process.env.GEMINI_FREE_API_URL || "https://gemini-api.inspiredjinyao.com";
const API_KEY = process.env.GEMINI_FREE_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const { prompt, style, count } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    if (!API_KEY) {
      return NextResponse.json({ error: "AI generation not configured" }, { status: 503 });
    }

    const frameCount = Math.min(count || 1, 10);

    // Check auth + quota
    const session = await auth();
    const userId = session?.user?.id;
    const tier = (session?.user as Record<string, unknown> | undefined)?.tier as string ?? "FREE";

    if (userId) {
      const quota = await checkQuota(userId, tier);
      if (!quota.allowed) {
        return NextResponse.json(
          { error: `Daily limit reached (${quota.used}/${quota.limit}). Upgrade for more.` },
          { status: 429 }
        );
      }
    }

    const images: string[] = [];

    for (let i = 0; i < frameCount; i++) {
      const framePrompt = frameCount > 1
        ? `${prompt}, frame ${i + 1} of ${frameCount} animation sequence, ${style || "pixel art"} style, game sprite, transparent background`
        : `${prompt}, ${style || "pixel art"} style, game sprite, transparent background`;

      const res = await fetch(`${API_URL}/v1/images/generations`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gemini-3-pro-image",
          prompt: framePrompt,
          response_format: "b64_json",
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        return NextResponse.json({ error: `AI API error: ${err}` }, { status: 502 });
      }

      const json = await res.json();
      const b64 = json.data?.[0]?.b64_json;
      if (!b64) {
        return NextResponse.json({ error: "No image returned" }, { status: 502 });
      }
      images.push(`data:image/png;base64,${b64}`);
    }

    // Record usage
    if (userId) {
      await recordUsage(userId, frameCount);
    }

    return NextResponse.json({ images });
  } catch (e) {
    console.error("AI generation error:", e);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
