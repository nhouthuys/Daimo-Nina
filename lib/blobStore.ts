import { get, put } from "@vercel/blob";

/**
 * True when Blob storage can be used: either the classic BLOB_READ_WRITE_TOKEN
 * is set, or the store is connected via OIDC (Vercel then sets BLOB_STORE_ID
 * and injects short-lived OIDC credentials automatically — no static token
 * needed, and @vercel/blob picks it up on its own).
 */
export function isBlobConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
}

/**
 * Everything in this store is private (the project's store is configured
 * that way — `access: "public"` is rejected outright). Reading it back
 * therefore always goes through the authenticated `get()` helper, never a
 * plain `fetch()` of a blob URL.
 */
const BLOB_ACCESS = "private" as const;

/** Reads a small JSON blob by exact pathname, or null if it doesn't exist yet. Server-only. */
export async function readJsonBlob<T>(pathname: string): Promise<T | null> {
  const result = await get(pathname, { access: BLOB_ACCESS });
  if (!result || !result.stream) return null;
  const text = await new Response(result.stream).text();
  return JSON.parse(text) as T;
}

/** Overwrites a small JSON blob at a fixed pathname. Server-only. */
export async function writeJsonBlob(pathname: string, data: unknown): Promise<void> {
  await put(pathname, JSON.stringify(data), {
    access: BLOB_ACCESS,
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}
