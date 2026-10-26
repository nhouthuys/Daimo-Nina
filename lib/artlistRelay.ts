import { GraphicCategory } from "./types";

/**
 * Automatic Artlist visual pipeline: the app queues a request whenever a post
 * needs a visual and no human-provided photo exists (see lib/autoGenerate.ts);
 * a separate, periodically-woken Claude session (with Artlist's MCP connector
 * attached) drains the queue and writes results here. Two files, one writer
 * each, to avoid the two-writer race a shared file would have: the app only
 * ever appends to the queue, the relay session only ever appends to results.
 */

export const ARTLIST_QUEUE_PATHNAME = "daimo-nina/artlist-queue.json";
export const ARTLIST_RESULTS_PATHNAME = "daimo-nina/artlist-results.json";

export type ArtlistVisualKind = "image" | "video";

export type ArtlistVisualTarget = { type: "main" } | { type: "slide"; slideId: string };

export interface ArtlistVisualRequest {
  requestId: string;
  postId: string;
  title: string;
  category: GraphicCategory;
  highlight: string;
  kind: ArtlistVisualKind;
  target: ArtlistVisualTarget;
  requestedAt: string;
}

export interface ArtlistVisualResult {
  requestId: string;
  status: "done" | "error";
  resultUrl?: string;
  error?: string;
  completedAt: string;
}

/**
 * Queues an automatic Artlist visual request: fire-and-forget, never blocks
 * post creation/editing even if sync isn't configured or the call fails.
 */
export async function queueArtlistVisual(request: Omit<ArtlistVisualRequest, "requestedAt">): Promise<void> {
  try {
    await fetch("/api/artlist-queue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
  } catch {
    // Best-effort: a missing Artlist visual never blocks the post itself.
  }
}

/** Polls for Artlist results so the UI can offer to apply one once ready. */
export async function fetchArtlistResults(): Promise<ArtlistVisualResult[]> {
  try {
    const res = await fetch("/api/artlist-result", { cache: "no-store" });
    if (!res.ok) return [];
    const data = (await res.json()) as { results?: ArtlistVisualResult[] };
    return data.results ?? [];
  } catch {
    return [];
  }
}
