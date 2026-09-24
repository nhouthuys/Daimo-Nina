import { list, put } from "@vercel/blob";

/**
 * True when Blob storage can be used: either the classic BLOB_READ_WRITE_TOKEN
 * is set, or the store is connected via OIDC (Vercel then sets BLOB_STORE_ID
 * and injects short-lived OIDC credentials automatically — no static token
 * needed, and @vercel/blob picks it up on its own).
 */
export function isBlobConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
}

/** Reads a small JSON blob by exact pathname, or null if it doesn't exist yet. Server-only. */
export async function readJsonBlob<T>(pathname: string): Promise<T | null> {
  const { blobs } = await list({ prefix: pathname, limit: 1 });
  const blob = blobs.find((b) => b.pathname === pathname);
  if (!blob) return null;
  const res = await fetch(blob.url, { cache: "no-store" });
  if (!res.ok) return null;
  return (await res.json()) as T;
}

/** Overwrites a small JSON blob at a fixed pathname. Server-only. */
export async function writeJsonBlob(pathname: string, data: unknown): Promise<void> {
  await put(pathname, JSON.stringify(data), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}
