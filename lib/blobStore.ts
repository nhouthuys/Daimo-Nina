import { list, put } from "@vercel/blob";

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
