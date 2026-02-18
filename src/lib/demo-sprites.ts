const DEMO_SPRITES = [
  { name: "knight", w: 64, h: 64, isAi: true, src: "/examples/knight.png" },
  { name: "mage", w: 64, h: 64, isAi: true, src: "/examples/mage.png" },
  { name: "slime", w: 64, h: 64, isAi: true, src: "/examples/slime.png" },
  { name: "dragon", w: 64, h: 64, isAi: true, src: "/examples/dragon.png" },
  { name: "treasure", w: 48, h: 48, isAi: true, src: "/examples/treasure.png" },
  { name: "potion", w: 32, h: 32, isAi: true, src: "/examples/potion.png" },
  { name: "sword", w: 32, h: 32, isAi: true, src: "/examples/sword.png" },
  { name: "skeleton", w: 64, h: 64, isAi: true, src: "/examples/skeleton.png" },
  { name: "fairy", w: 48, h: 48, isAi: true, src: "/examples/fairy.png" },
  { name: "mushroom", w: 48, h: 48, isAi: true, src: "/examples/mushroom.png" },
  ...Array.from({ length: 10 }, (_, i) => ({
    name: `fireball-${String(i + 1).padStart(2, "0")}`,
    w: 64, h: 64, isAi: true,
    src: `/examples/mage-fireball/frame-${String(i + 1).padStart(2, "0")}.png`,
    isAnimation: true,
  })),
];

type DemoSprite = { id: string; name: string; file: null; image: HTMLImageElement; width: number; height: number; trimmed: boolean; isAi: boolean; isAnimation?: boolean };

export function loadDemoSprites(): Promise<DemoSprite[]> {
  return Promise.all(
    DEMO_SPRITES.map(
      (s) =>
        new Promise<DemoSprite>((resolve) => {
          const img = new Image();
          img.onload = () =>
            resolve({ id: crypto.randomUUID(), name: s.name, file: null, image: img, width: s.w, height: s.h, trimmed: false, isAi: s.isAi, isAnimation: "isAnimation" in s ? true : undefined });
          img.src = s.src;
        })
    )
  );
}
