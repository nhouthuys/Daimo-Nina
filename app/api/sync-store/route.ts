import { NextRequest, NextResponse } from "next/server";
import { isBlobConfigured, readJsonBlob, writeJsonBlob } from "@/lib/blobStore";
import { STORE_PATHNAME, SyncedState } from "@/lib/syncStore";

export const runtime = "nodejs";

/**
 * The server-side mirror of posts + review email. This is the single source
 * of truth across devices: every browser pulls it on load and pushes to it
 * on every change (see lib/syncStore.ts), so two people/computers stay in
 * sync instead of each keeping its own silently diverging localStorage copy.
 * The scheduled sender also reads it, since it has no access to any browser.
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

/** Called on load by every browser, so they all start from the same state. */
export async function GET() {
  if (!isBlobConfigured()) {
    return NextResponse.json({ state: null });
  }
  try {
    const state = await readJsonBlob<SyncedState>(STORE_PATHNAME);
    return NextResponse.json({ state });
  } catch (err) {
    console.error("sync-store read error:", err);
    return NextResponse.json({ state: null });
  }
}
