import { NextRequest, NextResponse } from "next/server";
import { get } from "@vercel/blob";

export const runtime = "nodejs";

/**
 * Serves a privately-stored blob (uploaded photos — see
 * app/api/upload-image/route.ts) back as a plain, directly-linkable file.
 * This project's Blob store rejects public blobs outright, so this proxy is
 * what makes an uploaded image usable in <img> tags, emails sent to a
 * reviewer, etc. Intentionally unauthenticated, same trust level the blob
 * had when it really was public: anyone with the link (an exact, random
 * upload pathname) can view it, which is also required for review emails to
 * keep rendering images for a recipient who never logs into the tool.
 */
const UPLOADS_PREFIX = "uploads/";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const pathname = path.join("/");

  // Only ever serve what the upload route itself wrote (uploads/<uuid>.<ext>).
  // Without this check, this route would let anyone fetch *any* blob in the
  // store by guessing its path — including daimo-store.json, which holds
  // every post. Reject path traversal explicitly too, belt and suspenders.
  if (!pathname.startsWith(UPLOADS_PREFIX) || pathname.includes("..")) {
    return new NextResponse("Not found", { status: 404 });
  }

  const result = await get(pathname, { access: "private" }).catch(() => null);
  if (!result || !result.stream) {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(result.stream, {
    headers: {
      "Content-Type": result.blob.contentType || "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
