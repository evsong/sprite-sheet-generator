/**
 * Client-side pixel-art upscaling via nearest-neighbor interpolation.
 * Preserves crisp pixel edges — the correct approach for pixel art.
 */

export async function upscaleNearest(
  image: HTMLImageElement,
  factor = 2,
): Promise<{ image: HTMLImageElement; blob: Blob }> {
  const w = image.naturalWidth * factor;
  const h = image.naturalHeight * factor;

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  // Nearest-neighbor: disable all smoothing
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(image, 0, 0, w, h);

  const dataUrl = canvas.toDataURL("image/png");
  const binary = atob(dataUrl.split(",")[1]);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const blob = new Blob([bytes], { type: "image/png" });

  const newImg = new Image();
  await new Promise<void>((resolve) => { newImg.onload = () => resolve(); newImg.src = dataUrl; });
  return { image: newImg, blob };
}
