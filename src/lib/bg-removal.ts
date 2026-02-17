import { pipeline, env, type RawImage } from "@huggingface/transformers";

// Use CDN for WASM/ONNX backends in browser
env.allowLocalModels = false;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let segmenter: any = null;
let loading = false;

type ProgressCallback = (progress: { status: string; progress?: number }) => void;

async function getSegmenter(onProgress?: ProgressCallback) {
  if (segmenter) return segmenter;
  if (loading) {
    // Wait for in-flight load
    while (loading) await new Promise((r) => setTimeout(r, 100));
    return segmenter!;
  }
  loading = true;
  onProgress?.({ status: "loading", progress: 0 });
  segmenter = await pipeline("image-segmentation", "briaai/RMBG-1.4", {
    progress_callback: (p: { status: string; progress?: number }) => {
      onProgress?.(p);
    },
  });
  loading = false;
  onProgress?.({ status: "ready", progress: 100 });
  return segmenter;
}

export async function removeBackground(
  image: HTMLImageElement,
  onProgress?: ProgressCallback
): Promise<{ image: HTMLImageElement; blob: Blob }> {
  const seg = await getSegmenter(onProgress);
  onProgress?.({ status: "processing" });

  const results = (await seg(image.src)) as Array<{ mask: RawImage; label: string }>;
  const mask = results[0]?.mask;
  if (!mask) throw new Error("No mask returned from segmentation model");

  // Draw original + apply mask as alpha
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(image, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const maskData = mask.data as Uint8Array;

  // Resize mask to match image if needed
  if (maskData.length === imageData.data.length / 4) {
    for (let i = 0; i < maskData.length; i++) {
      imageData.data[i * 4 + 3] = maskData[i];
    }
  } else {
    // Mask is different size — scale it
    const maskCanvas = document.createElement("canvas");
    maskCanvas.width = mask.width;
    maskCanvas.height = mask.height;
    const maskCtx = maskCanvas.getContext("2d")!;
    const maskImgData = maskCtx.createImageData(mask.width, mask.height);
    for (let i = 0; i < maskData.length; i++) {
      maskImgData.data[i * 4] = maskData[i];
      maskImgData.data[i * 4 + 1] = maskData[i];
      maskImgData.data[i * 4 + 2] = maskData[i];
      maskImgData.data[i * 4 + 3] = 255;
    }
    maskCtx.putImageData(maskImgData, 0, 0);

    // Scale mask to image size
    const scaledCanvas = document.createElement("canvas");
    scaledCanvas.width = canvas.width;
    scaledCanvas.height = canvas.height;
    const scaledCtx = scaledCanvas.getContext("2d")!;
    scaledCtx.drawImage(maskCanvas, 0, 0, canvas.width, canvas.height);
    const scaledData = scaledCtx.getImageData(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < imageData.data.length / 4; i++) {
      imageData.data[i * 4 + 3] = scaledData.data[i * 4]; // R channel = mask value
    }
  }

  ctx.putImageData(imageData, 0, 0);

  const blob = await new Promise<Blob>((resolve) =>
    canvas.toBlob((b) => resolve(b!), "image/png")
  );

  const newImg = new Image();
  await new Promise<void>((resolve) => {
    newImg.onload = () => resolve();
    newImg.src = URL.createObjectURL(blob);
  });

  onProgress?.({ status: "done", progress: 100 });
  return { image: newImg, blob };
}
