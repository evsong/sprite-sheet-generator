import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { checkQuota, recordUsage } from "@/lib/ai-quota";
import { buildSystemPrompt, getOptimalGrid } from "@/lib/prompt-templates";

const PROXY_URL = process.env.GEMINI_PROXY_URL || "https://code.newcli.com/gemini";
const PROXY_TOKEN = process.env.GEMINI_PROXY_TOKEN;

export async function POST(req: NextRequest) {
  try {
    const { prompt, style, count } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    if (!PROXY_TOKEN) {
      return NextResponse.json({ error: "AI generation not configured" }, { status: 503 });
    }

    const frameCount = Math.min(count || 1, 10);

    // Auth + quota
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

    const systemPrompt = buildSystemPrompt(prompt, frameCount, style || "pixel art");
    const { rows, cols } = getOptimalGrid(frameCount);

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
          contents: [{ role: "user", parts: [{ text: systemPrompt }] }],
          generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      console.error("Gemini API error:", err);
      return NextResponse.json({ error: `AI API error: ${res.status}` }, { status: 502 });
    }

    const json = await res.json();
    const parts = json.candidates?.[0]?.content?.parts;
    if (!parts) {
      return NextResponse.json({ error: "No response from AI" }, { status: 502 });
    }

    const imagePart = parts.find((p: { inlineData?: unknown }) => p.inlineData);
    if (!imagePart?.inlineData) {
      return NextResponse.json({ error: "No image returned" }, { status: 502 });
    }

    const { mimeType, data } = imagePart.inlineData;
    const spriteSheet = `data:${mimeType || "image/png"};base64,${data}`;

    if (userId) {
      await recordUsage(userId, 1);
    }

    return NextResponse.json({ spriteSheet, frameCount, gridCols: cols, gridRows: rows });
  } catch (e) {
    console.error("AI generation error:", e);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
