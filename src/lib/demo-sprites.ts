const DEMO_SPRITES = [
  // Independent assets → mode: "atlas"
  { name: "knight", w: 64, h: 64, isAi: true, src: "/examples/knight.png", mode: "atlas" as const },
  { name: "mage", w: 64, h: 64, isAi: true, src: "/examples/mage.png", mode: "atlas" as const },
  { name: "slime", w: 64, h: 64, isAi: true, src: "/examples/slime.png", mode: "atlas" as const },
  { name: "dragon", w: 64, h: 64, isAi: true, src: "/examples/dragon.png", mode: "atlas" as const },
  { name: "treasure", w: 48, h: 48, isAi: true, src: "/examples/treasure.png", mode: "atlas" as const },
  { name: "potion", w: 32, h: 32, isAi: true, src: "/examples/potion.png", mode: "atlas" as const },
  { name: "sword", w: 32, h: 32, isAi: true, src: "/examples/sword.png", mode: "atlas" as const },
  { name: "skeleton", w: 64, h: 64, isAi: true, src: "/examples/skeleton.png", mode: "atlas" as const },
  { name: "fairy", w: 48, h: 48, isAi: true, src: "/examples/fairy.png", mode: "atlas" as const },
  { name: "mushroom", w: 48, h: 48, isAi: true, src: "/examples/mushroom.png", mode: "atlas" as const },
  // Animation sequence → mode: "sequence"
  { name: "fireball-01", w: 64, h: 64, isAi: true, src: "/examples/fireball/frame-01.png", mode: "sequence" as const },
  { name: "fireball-02", w: 64, h: 64, isAi: true, src: "/examples/fireball/frame-02.png", mode: "sequence" as const },
  { name: "fireball-03", w: 64, h: 64, isAi: true, src: "/examples/fireball/frame-03.png", mode: "sequence" as const },
  { name: "fireball-04", w: 64, h: 64, isAi: true, src: "/examples/fireball/frame-04.png", mode: "sequence" as const },
  { name: "fireball-05", w: 64, h: 64, isAi: true, src: "/examples/fireball/frame-05.png", mode: "sequence" as const },
  { name: "fireball-06", w: 64, h: 64, isAi: true, src: "/examples/fireball/frame-06.png", mode: "sequence" as const },
];

type DemoSprite = { id: string; name: string; file: null; image: HTMLImageElement; width: number; height: number; trimmed: boolean; isAi: boolean; isAnimation?: boolean; mode?: "sequence" | "atlas" };

export function loadDemoSprites(): Promise<DemoSprite[]> {
  return Promise.all(
    DEMO_SPRITES.map(
      (s) =>
        new Promise<DemoSprite>((resolve) => {
          const img = new Image();
          img.onload = () =>
            resolve({ id: crypto.randomUUID(), name: s.name, file: null, image: img, width: s.w, height: s.h, trimmed: false, isAi: s.isAi, isAnimation: "isAnimation" in s ? true : undefined, mode: s.mode });
          img.src = s.src;
        })
    )
  );
}
