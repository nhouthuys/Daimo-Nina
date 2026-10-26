import { NextRequest, NextResponse } from "next/server";
import { isBlobConfigured, readJsonBlob, writeJsonBlob } from "@/lib/blobStore";
import { ARTLIST_QUEUE_PATHNAME, ArtlistVisualRequest } from "@/lib/artlistRelay";

export const runtime = "nodejs";

function isRelayAuthorized(req: NextRequest): boolean {
  const secret = process.env.ARTLIST_RELAY_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

/** Called by the app itself whenever a post needs an Artlist visual (same-origin, no auth needed). */
export async function POST(req: NextRequest) {
  if (!isBlobConfigured()) {
    return NextResponse.json({ error: "Synchronisation non configurée (Blob)." }, { status: 501 });
  }

  let body: ArtlistVisualRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  if (!body.requestId || !body.postId || !body.title || !body.category || !body.kind || !body.target) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const existing = (await readJsonBlob<ArtlistVisualRequest[]>(ARTLIST_QUEUE_PATHNAME)) ?? [];
  const next = [
    ...existing.filter((r) => r.requestId !== body.requestId),
    { ...body, requestedAt: new Date().toISOString() },
  ];
  await writeJsonBlob(ARTLIST_QUEUE_PATHNAME, next);

  return NextResponse.json({ ok: true });
}

/** Called by the relay Claude session to fetch pending work. Requires ARTLIST_RELAY_SECRET. */
export async function GET(req: NextRequest) {
  if (!isRelayAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  if (!isBlobConfigured()) {
    return NextResponse.json({ error: "Synchronisation non configurée (Blob)." }, { status: 501 });
  }
  const queue = (await readJsonBlob<ArtlistVisualRequest[]>(ARTLIST_QUEUE_PATHNAME)) ?? [];
  return NextResponse.json({ queue });
}
