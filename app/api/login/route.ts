import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, expectedAuthToken, sha256Hex } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const expected = await expectedAuthToken();
  if (!expected) {
    return NextResponse.json(
      { error: "La connexion n'est pas configurée (APP_PASSWORD manquant côté serveur)." },
      { status: 501 }
    );
  }

  let body: { password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }
  if (!body.password) {
    return NextResponse.json({ error: "Mot de passe requis." }, { status: 400 });
  }

  const submittedHash = await sha256Hex(body.password);
  if (submittedHash !== expected) {
    return NextResponse.json({ error: "Mot de passe incorrect." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(AUTH_COOKIE_NAME, expected, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
