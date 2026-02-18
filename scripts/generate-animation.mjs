import fs from "fs";
import path from "path";

const API_BASE = "https://code.newcli.com/gemini/v1beta/models";
const MODEL = "gemini-2.0-flash-preview-image-generation";
const OUT_DIR = path.resolve("public/examples/mage-fireball");

const FRAMES = [
  "frame 1: mage standing idle, staff held upright, calm pose, preparing to cast",
  "frame 2: mage raises staff slightly, faint orange glow appears at staff tip",
  "frame 3: mage pulls staff back, small fireball forming at the tip, sparks visible",
  "frame 4: mage winds up, fireball grows larger and brighter at staff tip",
  "frame 5: mage begins forward thrust, fireball fully formed, intense glow",
  "frame 6: mage thrusts staff forward, fireball launches from staff tip",
  "frame 7: fireball flying forward mid-air, mage in follow-through pose, trail of sparks",
  "frame 8: fireball further away, expanding slightly, mage recovering stance",
  "frame 9: fireball impact explosion, bright flash, mage standing back",
  "frame 10: explosion dissipating into embers and smoke, mage returns to idle",
];

fs.mkdirSync(OUT_DIR, { recursive: true });

for (let i = 0; i < FRAMES.length; i++) {
  const desc = FRAMES[i];
  const prompt = `Pixel art game sprite, 64x64, transparent background, fantasy mage character in dark blue robe casting fireball spell. Animation sequence ${desc}. Consistent character design across all frames, side view, clean pixel art style.`;

  console.log(`Generating frame ${i + 1}/10...`);
  try {
    const res = await fetch(`${API_BASE}/${MODEL}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
      }),
    });

    if (!res.ok) {
      console.error(`  Failed: ${res.status} ${await res.text()}`);
      continue;
    }

    const json = await res.json();
    const parts = json.candidates?.[0]?.content?.parts || [];
    const imgPart = parts.find((p) => p.inlineData);

    if (!imgPart) {
      console.error(`  No image in response for frame ${i + 1}`);
      continue;
    }

    const b64 = imgPart.inlineData.data;
    const mime = imgPart.inlineData.mimeType || "image/png";
    const ext = mime.includes("jpeg") || mime.includes("jpg") ? "jpg" : "png";
    fs.writeFileSync(path.join(OUT_DIR, `frame-${String(i + 1).padStart(2, "0")}.${ext}`), Buffer.from(b64, "base64"));
    console.log(`  Saved frame-${String(i + 1).padStart(2, "0")}.${ext}`);
  } catch (e) {
    console.error(`  Error: ${e.message}`);
  }
}
console.log("Done!");
