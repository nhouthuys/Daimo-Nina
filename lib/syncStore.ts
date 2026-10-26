import { Post } from "./types";

/** Pathname of the server-side mirror of the browser's posts + review email, used by the scheduled sender. */
export const STORE_PATHNAME = "daimo-store.json";

export interface SyncedState {
  posts: Post[];
  reviewEmail: string;
}

/** Pushes the current posts/review email to Blob storage in the background. Never throws; sync is best-effort. */
export async function pushSyncedState(state: SyncedState): Promise<void> {
  try {
    await fetch("/api/sync-store", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state),
    });
  } catch {
    // Best-effort: the app runs fully from localStorage regardless.
  }
}

/**
 * Fetches the server's state on load, so every device starts from the same
 * posts/review email instead of its own, silently diverging localStorage
 * copy. Returns null when sync isn't configured, nothing's been pushed yet,
 * or the request fails — callers then keep whatever localStorage already has.
 */
export async function fetchSyncedState(): Promise<SyncedState | null> {
  try {
    const res = await fetch("/api/sync-store", { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as { state?: SyncedState | null };
    return data.state ?? null;
  } catch {
    return null;
  }
}
