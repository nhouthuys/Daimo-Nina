import { Post } from "./types";

export interface SendPostEmailResult {
  ok: boolean;
  error?: string;
}

/** Sends a post's content and generated visuals to a review inbox. Server returns 501 if RESEND_API_KEY isn't configured. */
export async function sendPostEmail(post: Post, to: string): Promise<SendPostEmailResult> {
  try {
    const res = await fetch("/api/send-post-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to,
        title: post.title,
        content: post.content,
        format: post.format,
        date: post.date,
        time: post.time,
        imageUrl: post.imageUrl,
        slides: post.slides?.map((s) => ({ caption: s.caption, imageUrl: s.imageUrl })),
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, error: data.error || "Échec de l'envoi." };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "Impossible de contacter le serveur." };
  }
}
