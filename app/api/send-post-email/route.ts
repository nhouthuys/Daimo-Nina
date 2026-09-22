import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { buildPostEmail, EmailPostInput } from "@/lib/emailTemplate";

export const runtime = "nodejs";

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

interface SendPostEmailBody extends EmailPostInput {
  to: string;
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

  const { subject, html, attachments } = buildPostEmail(body);
  const resend = new Resend(apiKey);
  const from = process.env.RESEND_FROM || "Daïmo Marketing <onboarding@resend.dev>";

  try {
    const result = await resend.emails.send({
      from,
      to: [body.to],
      subject,
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
