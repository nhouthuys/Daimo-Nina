import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { readJsonBlob, writeJsonBlob } from "@/lib/blobStore";
import { STORE_PATHNAME, SyncedState } from "@/lib/syncStore";
import { buildPostEmail } from "@/lib/emailTemplate";

export const runtime = "nodejs";

const SENT_LOG_PATHNAME = "daimo-sent-log.json";

/** Map of post id -> ISO date it was last emailed, so a post is never sent twice. */
type SentLog = Record<string, string>;

function todayInBrussels(): string {
  // en-CA formats as YYYY-MM-DD, which is what post.date uses.
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Brussels" }).format(new Date());
}

/**
 * Triggered daily by Vercel Cron (see vercel.json). Emails any post that's
 * programmed for today and hasn't been sent yet, to the configured review
 * address, then marks it sent. Runs once a day (Hobby plan's cron minimum
 * interval), so delivery lands sometime that morning rather than at the
 * post's exact scheduled time.
 */
export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ sent: 0, skipped: 0, note: "Synchronisation non configurée (BLOB_READ_WRITE_TOKEN)." });
  }

  const store = await readJsonBlob<SyncedState>(STORE_PATHNAME);
  if (!store || !store.posts || store.posts.length === 0) {
    return NextResponse.json({ sent: 0, skipped: 0, note: "Aucun post synchronisé." });
  }
  if (!store.reviewEmail) {
    return NextResponse.json({ sent: 0, skipped: 0, note: "Aucun email de vérification configuré." });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ sent: 0, skipped: 0, note: "Envoi non configuré (RESEND_API_KEY)." });
  }

  const today = todayInBrussels();
  const sentLog = (await readJsonBlob<SentLog>(SENT_LOG_PATHNAME)) ?? {};

  const due = store.posts.filter(
    (post) => post.status === "scheduled" && post.date === today && sentLog[post.id] !== today
  );

  if (due.length === 0) {
    return NextResponse.json({ sent: 0, skipped: 0, note: "Rien de programmé aujourd'hui." });
  }

  const resend = new Resend(apiKey);
  const from = process.env.RESEND_FROM || "Daïmo Marketing <onboarding@resend.dev>";
  let sent = 0;
  let skipped = 0;

  for (const post of due) {
    try {
      const { subject, html, attachments } = buildPostEmail({
        title: post.title,
        content: post.content,
        format: post.format,
        date: post.date,
        time: post.time,
        imageUrl: post.imageUrl,
        slides: post.slides?.map((s) => ({ caption: s.caption, imageUrl: s.imageUrl })),
      });
      const result = await resend.emails.send({
        from,
        to: [store.reviewEmail],
        subject,
        html,
        attachments: attachments.length > 0 ? attachments : undefined,
      });
      if (result.error) {
        console.error("cron send-post error:", post.id, result.error);
        skipped++;
        continue;
      }
      sentLog[post.id] = today;
      sent++;
    } catch (err) {
      console.error("cron send-post error:", post.id, err);
      skipped++;
    }
  }

  if (sent > 0) {
    await writeJsonBlob(SENT_LOG_PATHNAME, sentLog);
  }

  return NextResponse.json({ sent, skipped });
}
