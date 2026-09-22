export interface UploadImageResult {
  ok: boolean;
  url?: string;
  error?: string;
}

/** Uploads an image file to Blob storage and returns its public URL. Server returns 501 if BLOB_READ_WRITE_TOKEN isn't configured. */
export async function uploadImage(file: File): Promise<UploadImageResult> {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload-image", { method: "POST", body: formData });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, error: data.error || "Échec de l'upload." };
    }
    return { ok: true, url: data.url };
  } catch {
    return { ok: false, error: "Impossible de contacter le serveur." };
  }
}
