import { STORAGE_BUCKET } from "@/lib/constants";

export function productImagePathFromUrl(imagemUrl: string): string | null {
  const marker = `/storage/v1/object/public/${STORAGE_BUCKET}/`;
  const index = imagemUrl.indexOf(marker);
  if (index === -1) return null;
  return decodeURIComponent(imagemUrl.slice(index + marker.length));
}
