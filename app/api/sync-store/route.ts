import { NextRequest, NextResponse } from "next/server";
import { isBlobConfigured, writeJsonBlob } from "@/lib/blobStore";
import { STORE_PATHNAME } from "@/lib/syncStore";

export const runtime = "nodejs";

/**
 * Mirrors the browser's localStorage state (posts + review email) to Blob
 * storage so the scheduled sender (which runs server-side, with no access to
 * the browser) can see what's programmed. Called in the background on every
 * change; failures are non-fatal, the app works from localStorage regardless.
 */
export async function POST(req: NextRequest) {
  if (!isBlobConfigured()) {
    return NextResponse.json(
      { error: "La synchronisation n'est pas configurée (base Blob non connectée à ce projet)." },
      { status: 501 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  try {
    await writeJsonBlob(STORE_PATHNAME, body);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("sync-store error:", err);
    const detail = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Échec de la synchronisation : ${detail}` }, { status: 502 });
  }
}
