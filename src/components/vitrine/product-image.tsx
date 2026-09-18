"use client";

import Image from "next/image";
import { useState } from "react";
import { Gift } from "lucide-react";

function canUseNextImage(src: string): boolean {
  if (!src?.trim()) return false;
  if (src.startsWith("/")) return true;
  try {
    const url = new URL(src);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function ProductImage({
  src,
  alt,
  fill,
  width,
  height,
  className,
  sizes,
  priority,
}: {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    canUseNextImage(src) ? "loading" : "error",
  );

  if (!canUseNextImage(src) || status === "error") {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-primary-soft via-white to-secondary-soft text-primary ${className ?? ""} ${fill ? "absolute inset-0" : ""}`}
        style={
          !fill && width && height
            ? { width, height }
            : undefined
        }
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/80 shadow-sm">
          <Gift className="h-6 w-6" strokeWidth={1.75} aria-hidden />
        </div>
        <span className="max-w-[85%] truncate px-2 text-center text-[10px] font-semibold uppercase tracking-wide text-muted">
          ECRI
        </span>
      </div>
    );
  }

  return (
    <>
      {status === "loading" && (
        <div
          className={`animate-pulse bg-gradient-to-br from-neutral-100 to-neutral-50 ${fill ? "absolute inset-0" : ""}`}
          aria-hidden
        />
      )}
      <Image
        src={src}
        alt={alt}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        className={`${className ?? ""} ${status === "loading" ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}
        sizes={sizes}
        priority={priority}
        onLoad={() => setStatus("ready")}
        onError={() => setStatus("error")}
      />
    </>
  );
}
