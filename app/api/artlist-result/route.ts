import { NextRequest, NextResponse } from "next/server";
import { isBlobConfigured, readJsonBlob, writeJsonBlob } from "@/lib/blobStore";
import { ARTLIST_RESULTS_PATHNAME, ArtlistVisualResult } from "@/lib/artlistRelay";

export const runtime = "nodejs";

function isRelayAuthorized(req: NextRequest): boolean {
  const secret = process.env.ARTLIST_RELAY_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

/** Called by the relay Claude session once it has generated (or failed to generate) a visual. Requires ARTLIST_RELAY_SECRET. */
export async function POST(req: NextRequest) {
  if (!isRelayAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  if (!isBlobConfigured()) {
    return NextResponse.json({ error: "Synchronisation non configurée (Blob)." }, { status: 501 });
  }

  let body: ArtlistVisualResult;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  if (!body.requestId || !body.status) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const existing = (await readJsonBlob<ArtlistVisualResult[]>(ARTLIST_RESULTS_PATHNAME)) ?? [];
  const next = [
    ...existing.filter((r) => r.requestId !== body.requestId),
    { ...body, completedAt: body.completedAt || new Date().toISOString() },
  ];
  await writeJsonBlob(ARTLIST_RESULTS_PATHNAME, next);

  return NextResponse.json({ ok: true });
}

/** Called by the browser to poll for ready results (same-origin, no auth needed). */
export async function GET() {
  if (!isBlobConfigured()) {
    return NextResponse.json({ results: [] });
  }
  const results = (await readJsonBlob<ArtlistVisualResult[]>(ARTLIST_RESULTS_PATHNAME)) ?? [];
  return NextResponse.json({ results });
}
