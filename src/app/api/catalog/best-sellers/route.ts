import { NextResponse } from "next/server";
import { getBestSellers } from "@/lib/data/best-sellers";

/** 30 minutes — aligned with client polling */
export const revalidate = 1800;

export async function GET() {
  try {
    const items = await getBestSellers(6);
    return NextResponse.json(
      { items, updatedAt: new Date().toISOString() },
      {
        headers: {
          "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
        },
      },
    );
  } catch {
    return NextResponse.json({ items: [], updatedAt: null }, { status: 500 });
  }
}
