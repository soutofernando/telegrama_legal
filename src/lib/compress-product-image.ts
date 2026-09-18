const MAX_EDGE_PX = 800;
const WEBP_QUALITY = 0.82;

/**
 * Reduz dimensões e converte para WebP antes do upload (menos storage/banda no Supabase).
 */
export async function compressProductImage(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const longest = Math.max(bitmap.width, bitmap.height);
  const scale = longest > MAX_EDGE_PX ? MAX_EDGE_PX / longest : 1;
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("Não foi possível processar a imagem.");
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Falha ao comprimir imagem."))),
      "image/webp",
      WEBP_QUALITY,
    );
  });

  const baseName = file.name.replace(/\.[^.]+$/i, "") || "produto";
  return new File([blob], `${baseName}.webp`, { type: "image/webp" });
}
