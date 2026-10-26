import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, expectedAuthToken } from "@/lib/auth";

export async function proxy(req: NextRequest) {
  const expected = await expectedAuthToken();
  if (!expected) return NextResponse.next(); // APP_PASSWORD not set: no gate, same as today

  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (token === expected) return NextResponse.next();

  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("next", req.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!api|login|_next/static|_next/image|favicon\\.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico)$).*)"],
};
