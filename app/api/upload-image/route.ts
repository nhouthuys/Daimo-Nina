import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { isBlobConfigured } from "@/lib/blobStore";

export const runtime = "nodejs";

const MAX_SIZE_BYTES = 10 * 1024 * 1024;

/**
 * Uploads a user-provided image (e.g. downloaded from a stock library like
 * Artlist) to Blob storage and returns a URL on this app's own domain that
 * serves it back (see app/api/blob-image/[...path]/route.ts), so it can be
 * pasted into the same "photo déjà existante" field that already accepts any
 * URL. The underlying blob itself is private (this project's store rejects
 * public blobs outright) — the proxy route is what makes the link directly
 * viewable in <img> tags, emails, and anywhere else a plain URL is needed.
 */
export async function POST(req: NextRequest) {
  if (!isBlobConfigured()) {
    return NextResponse.json(
      { error: "L'upload n'est pas configuré (base Blob non connectée à ce projet)." },
      { status: 501 }
    );
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Aucun fichier reçu." }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Le fichier doit être une image." }, { status: 400 });
  }
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "Image trop volumineuse (max 10 Mo)." }, { status: 400 });
  }

  try {
    const extension = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
    const pathname = `uploads/${crypto.randomUUID()}.${extension}`;
    await put(pathname, file, {
      access: "private",
      addRandomSuffix: false,
      contentType: file.type,
    });
    return NextResponse.json({ ok: true, url: `/api/blob-image/${pathname}` });
  } catch (err) {
    console.error("upload-image error:", err);
    const detail = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Échec de l'upload : ${detail}` }, { status: 502 });
  }
}
