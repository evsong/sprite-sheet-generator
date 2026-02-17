import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { checkQuota, recordUsage } from "@/lib/ai-quota";

type Action = "variants" | "recolor" | "upscale" | "extend-frames";

export async function POST(req: NextRequest) {
  try {
    const { action, imageBase64, prompt, count } = await req.json() as {
      action: Action;
      imageBase64: string; // data:image/png;base64,... or raw base64
      prompt?: string;
      count?: number;
    };

    if (!action || !imageBase64) {
      return NextResponse.json({ error: "action and imageBase64 required" }, { status: 400 });
    }

    const apiKey = process.env.STABILITY_API_KEY;
    if (!apiKey) {
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

    // Strip data URL prefix if present
    const raw = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const imgBuffer = Buffer.from(raw, "base64");

    const images: string[] = [];

    if (action === "upscale") {
      const fd = new FormData();
      fd.append("image", new Blob([imgBuffer], { type: "image/png" }), "sprite.png");
      fd.append("output_format", "png");

      const res = await fetch("https://api.stability.ai/v2beta/stable-image/upscale/conservative", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, Accept: "image/png" },
        body: fd,
      });

      if (!res.ok) {
        const err = await res.text();
        return NextResponse.json({ error: `Upscale failed: ${err}` }, { status: 502 });
      }

      const buf = await res.arrayBuffer();
      images.push(`data:image/png;base64,${Buffer.from(buf).toString("base64")}`);
    } else {
      // variants, recolor, extend-frames all use image-to-image
      const promptMap: Record<string, string> = {
        variants: prompt || "game sprite variation, same character different pose, transparent background",
        recolor: prompt || "same sprite recolored with different color palette, transparent background",
        "extend-frames": prompt || "next frame in animation sequence, game sprite, transparent background",
      };

      for (let i = 0; i < (action === "extend-frames" ? frameCount : (action === "variants" ? Math.min(count || 3, 4) : 1)); i++) {
        const fd = new FormData();
        fd.append("image", new Blob([imgBuffer], { type: "image/png" }), "sprite.png");
        fd.append("prompt", action === "extend-frames"
          ? `${promptMap[action]}, frame ${i + 1} of ${frameCount}`
          : promptMap[action]);
        fd.append("output_format", "png");
        fd.append("strength", action === "recolor" ? "0.5" : "0.65");
        fd.append("mode", "image-to-image");

        const res = await fetch("https://api.stability.ai/v2beta/stable-image/generate/sd3", {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}`, Accept: "image/png" },
          body: fd,
        });

        if (!res.ok) {
          const err = await res.text();
          return NextResponse.json({ error: `AI error: ${err}` }, { status: 502 });
        }

        const buf = await res.arrayBuffer();
        images.push(`data:image/png;base64,${Buffer.from(buf).toString("base64")}`);
      }
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
