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
