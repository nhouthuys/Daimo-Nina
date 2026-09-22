import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

const FORMAT_LABELS: Record<string, string> = {
  article: "Article",
  image: "Image + texte",
  carousel: "Carrousel",
};

interface SlideInput {
  caption: string;
  imageUrl?: string;
}

interface SendPostEmailBody {
  to: string;
  title: string;
  content: string;
  format: string;
  date: string;
  time: string;
  imageUrl?: string;
  slides?: SlideInput[];
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function dataUrlToAttachment(dataUrl: string, filename: string): { filename: string; content: string } | null {
  const match = dataUrl.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!match) return null;
  const [, ext, base64] = match;
  return { filename: `${filename}.${ext}`, content: base64 };
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "L'envoi par email n'est pas configuré (RESEND_API_KEY manquante)." },
      { status: 501 }
    );
  }

  let body: SendPostEmailBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  if (!body.to || !isValidEmail(body.to)) {
    return NextResponse.json({ error: "Adresse email de destination manquante ou invalide." }, { status: 400 });
  }
  if (!body.title || !body.content) {
    return NextResponse.json({ error: "Post incomplet (titre ou contenu manquant)." }, { status: 400 });
  }

  const attachments: { filename: string; content: string }[] = [];
  const remoteImages: { label: string; url: string }[] = [];

  if (body.imageUrl) {
    if (body.imageUrl.startsWith("data:")) {
      const attachment = dataUrlToAttachment(body.imageUrl, "image");
      if (attachment) attachments.push(attachment);
    } else {
      remoteImages.push({ label: "Image", url: body.imageUrl });
    }
  }

  if (body.slides) {
    body.slides.forEach((slide, i) => {
      if (!slide.imageUrl) return;
      if (slide.imageUrl.startsWith("data:")) {
        const attachment = dataUrlToAttachment(slide.imageUrl, `slide-${i + 1}`);
        if (attachment) attachments.push(attachment);
      } else {
        remoteImages.push({ label: `Slide ${i + 1}`, url: slide.imageUrl });
      }
    });
  }

  const slidesHtml =
    body.slides && body.slides.length > 0
      ? `<ol>${body.slides.map((s) => `<li>${escapeHtml(s.caption)}</li>`).join("")}</ol>`
      : "";

  const remoteImagesHtml = remoteImages
    .map((img) => `<p><strong>${escapeHtml(img.label)}</strong> : <a href="${img.url}">${img.url}</a></p>`)
    .join("");

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <p style="color:#76818e; font-size:12px; text-transform:uppercase; letter-spacing:0.05em;">
        Post à vérifier avant publication sur LinkedIn
      </p>
      <h2 style="color:#394e9d; margin-top:4px;">${escapeHtml(body.title)}</h2>
      <p style="color:#76818e; font-size:13px;">
        ${FORMAT_LABELS[body.format] ?? body.format} · Programmé le ${escapeHtml(body.date)} à ${escapeHtml(body.time)}
      </p>
      <div style="white-space: pre-wrap; line-height:1.5;">${escapeHtml(body.content)}</div>
      ${slidesHtml}
      ${remoteImagesHtml}
      ${attachments.length > 0 ? `<p style="color:#76818e; font-size:13px;">Le(s) visuel(s) généré(s) sont en pièce jointe.</p>` : ""}
      <p style="color:#76818e; font-size:12px; margin-top:24px;">
        Ce post n'est pas publié automatiquement. Vérifiez-le puis publiez-le vous-même sur LinkedIn.
      </p>
    </div>
  `;

  const resend = new Resend(apiKey);
  const from = process.env.RESEND_FROM || "Daïmo Marketing <onboarding@resend.dev>";

  try {
    const result = await resend.emails.send({
      from,
      to: [body.to],
      subject: `[Daïmo LinkedIn] Post à vérifier — ${body.title}`,
      html,
      attachments: attachments.length > 0 ? attachments : undefined,
    });

    if (result.error) {
      console.error("Resend error:", result.error);
      return NextResponse.json({ error: result.error.message || "Échec de l'envoi." }, { status: 502 });
    }

    return NextResponse.json({ ok: true, id: result.data?.id });
  } catch (err) {
    console.error("send-post-email error:", err);
    return NextResponse.json({ error: "Échec de l'envoi de l'email." }, { status: 502 });
  }
}
