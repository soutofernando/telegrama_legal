import { NextRequest, NextResponse } from "next/server";

/** Remove cookies Supabase (sb-*) quando o header ficar grande (HTTP 431). */
export async function GET(request: NextRequest) {
  const redirectTo = request.nextUrl.searchParams.get("redirect") ?? "/";
  const target = new URL(redirectTo, request.url);

  const response = NextResponse.redirect(target);

  for (const { name } of request.cookies.getAll()) {
    if (name.startsWith("sb-")) {
      response.cookies.set(name, "", { path: "/", maxAge: 0 });
    }
  }

  return response;
}
