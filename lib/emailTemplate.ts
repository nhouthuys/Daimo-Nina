const FORMAT_LABELS: Record<string, string> = {
  article: "Article",
  image: "Image + texte",
  carousel: "Carrousel",
};

export interface EmailPostInput {
  title: string;
  content: string;
  format: string;
  date: string;
  time: string;
  imageUrl?: string;
  slides?: { caption: string; imageUrl?: string }[];
}

export interface EmailAttachment {
  filename: string;
  content: string;
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function dataUrlToAttachment(dataUrl: string, filename: string): EmailAttachment | null {
  const match = dataUrl.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!match) return null;
  const [, ext, base64] = match;
  return { filename: `${filename}.${ext}`, content: base64 };
}

/** Builds the subject/html/attachments for a post review email, shared by the on-demand and scheduled senders. */
export function buildPostEmail(post: EmailPostInput): { subject: string; html: string; attachments: EmailAttachment[] } {
  const attachments: EmailAttachment[] = [];
  const remoteImages: { label: string; url: string }[] = [];

  if (post.imageUrl) {
    if (post.imageUrl.startsWith("data:")) {
      const attachment = dataUrlToAttachment(post.imageUrl, "image");
      if (attachment) attachments.push(attachment);
    } else {
      remoteImages.push({ label: "Image", url: post.imageUrl });
    }
  }

  if (post.slides) {
    post.slides.forEach((slide, i) => {
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
    post.slides && post.slides.length > 0
      ? `<ol>${post.slides.map((s) => `<li>${escapeHtml(s.caption)}</li>`).join("")}</ol>`
      : "";

  const remoteImagesHtml = remoteImages
    .map((img) => `<p><strong>${escapeHtml(img.label)}</strong> : <a href="${img.url}">${img.url}</a></p>`)
    .join("");

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <p style="color:#76818e; font-size:12px; text-transform:uppercase; letter-spacing:0.05em;">
        Post à vérifier avant publication sur LinkedIn
      </p>
      <h2 style="color:#394e9d; margin-top:4px;">${escapeHtml(post.title)}</h2>
      <p style="color:#76818e; font-size:13px;">
        ${FORMAT_LABELS[post.format] ?? post.format} · Programmé le ${escapeHtml(post.date)} à ${escapeHtml(post.time)}
      </p>
      <div style="white-space: pre-wrap; line-height:1.5;">${escapeHtml(post.content)}</div>
      ${slidesHtml}
      ${remoteImagesHtml}
      ${attachments.length > 0 ? `<p style="color:#76818e; font-size:13px;">Le(s) visuel(s) généré(s) sont en pièce jointe.</p>` : ""}
      <p style="color:#76818e; font-size:12px; margin-top:24px;">
        Ce post n'est pas publié automatiquement. Vérifiez-le puis publiez-le vous-même sur LinkedIn.
      </p>
    </div>
  `;

  return { subject: `[Daïmo LinkedIn] Post à vérifier — ${post.title}`, html, attachments };
}
