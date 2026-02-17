import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { checkQuota, recordUsage } from "@/lib/ai-quota";

export async function POST(req: NextRequest) {
  try {
    const { prompt, style, count } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const apiKey = process.env.STABILITY_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "AI generation not configured" }, { status: 503 });
    }

    const frameCount = Math.min(count || 1, 8);

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

      const res = await fetch("https://api.stability.ai/v2beta/stable-image/generate/sd3", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: "image/png",
        },
        body: (() => {
          const fd = new FormData();
          fd.append("prompt", framePrompt);
          fd.append("output_format", "png");
          fd.append("aspect_ratio", "1:1");
          return fd;
        })(),
      });

      if (!res.ok) {
        const err = await res.text();
        return NextResponse.json({ error: `AI API error: ${err}` }, { status: 502 });
      }

      const buffer = await res.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      images.push(`data:image/png;base64,${base64}`);
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
