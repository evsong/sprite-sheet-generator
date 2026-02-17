import fs from "fs";
import path from "path";

const API_URL = "https://gemini-api.inspiredjinyao.com";
const API_KEY = "e0c944b93d0f062fbd82d9328089f2c2";
const OUT_DIR = path.resolve("public/examples");

const sprites = [
  { name: "knight", prompt: "medieval knight character idle pose, pixel art style, game sprite, transparent background, 64x64" },
  { name: "mage", prompt: "wizard mage character casting spell, pixel art style, game sprite, transparent background, 64x64" },
  { name: "slime", prompt: "cute green slime monster, pixel art style, game sprite, transparent background, 64x64" },
  { name: "dragon", prompt: "small red dragon enemy, pixel art style, game sprite, transparent background, 64x64" },
  { name: "treasure", prompt: "golden treasure chest, pixel art style, game item sprite, transparent background, 64x64" },
  { name: "potion", prompt: "red health potion bottle, pixel art style, game item sprite, transparent background, 64x64" },
  { name: "sword", prompt: "glowing magic sword weapon, pixel art style, game item sprite, transparent background, 64x64" },
  { name: "skeleton", prompt: "skeleton warrior enemy with shield, pixel art style, game sprite, transparent background, 64x64" },
  { name: "fairy", prompt: "tiny glowing fairy companion, pixel art style, game sprite, transparent background, 64x64" },
  { name: "mushroom", prompt: "cute mushroom creature, pixel art style, game sprite, transparent background, 64x64" },
];

fs.mkdirSync(OUT_DIR, { recursive: true });

for (const { name, prompt } of sprites) {
  console.log(`Generating ${name}...`);
  try {
    const res = await fetch(`${API_URL}/v1/images/generations`, {
      method: "POST",
      headers: { Authorization: `Bearer ${API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "gemini-3-pro-image", prompt, response_format: "b64_json" }),
    });
    if (!res.ok) { console.error(`  Failed: ${res.status} ${await res.text()}`); continue; }
    const json = await res.json();
    const b64 = json.data?.[0]?.b64_json;
    if (!b64) { console.error(`  No image data for ${name}`); continue; }
    const ext = b64.startsWith("/9j/") ? "jpg" : "png";
    fs.writeFileSync(path.join(OUT_DIR, `${name}.${ext}`), Buffer.from(b64, "base64"));
    console.log(`  Saved ${name}.${ext}`);
  } catch (e) { console.error(`  Error: ${e.message}`); }
}
console.log("Done!");
