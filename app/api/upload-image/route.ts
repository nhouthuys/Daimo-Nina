import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { isBlobConfigured } from "@/lib/blobStore";

export const runtime = "nodejs";

const MAX_SIZE_BYTES = 10 * 1024 * 1024;

/**
 * Uploads a user-provided image (e.g. downloaded from a stock library like
 * Artlist) to Blob storage and returns its public URL, so it can be pasted
 * into the same "photo déjà existante" field that already accepts any URL.
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
    const blob = await put(`uploads/${crypto.randomUUID()}.${extension}`, file, {
      access: "public",
      addRandomSuffix: false,
      contentType: file.type,
    });
    return NextResponse.json({ ok: true, url: blob.url });
  } catch (err) {
    console.error("upload-image error:", err);
    return NextResponse.json({ error: "Échec de l'upload." }, { status: 502 });
  }
}
