import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

interface RequestBody {
  format: "article" | "image" | "carousel";
  theme?: string;
  guidelines?: string;
}

const SYSTEM_PROMPT = `You write LinkedIn posts for Daïmo, a Belgian process/IT consulting company (tagline: "Allied to process IT") that helps organizations digitize and automate their business processes.

Rules:
- Write in English.
- Never use a dash or hyphen as punctuation (no "-", no em dash, no en dash). Use a comma, colon, or period instead. (Hyphens inside real compound words are fine, e.g. "end-to-end".)
- Keep a professional but approachable, genuine tone. No corporate fluff, no empty superlatives.
- Do not invent specific facts, client names, or statistics you were not given. If you don't have real specifics for the topic, keep the copy general rather than making numbers up.
- Output ONLY a single JSON object, no markdown code fences, no commentary before or after it.

JSON shape:
{
  "title": string,
  "content": string,
  "slides": string[] or null,
  "category": "tip" or "client" or "hiring",
  "highlight": string
}

Field notes:
- "title": short headline, also shown on the generated graphic.
- "content": the LinkedIn post text (the caption for image/article formats; a short intro sentence for a carousel).
- "slides": ONLY for the "carousel" format, 4 to 6 short slide captions, the first one restating the title. Use null for other formats.
- "category": "tip" for a process/product tip, "client" for a client story or company news, "hiring" for recruitment.
- "highlight": a short punchy line (max about 6 words) shown on the graphic, e.g. a benefit or call to action.`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "AI generation is not configured (missing ANTHROPIC_API_KEY)." }, { status: 501 });
  }

  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { format, theme, guidelines } = body;
  if (format !== "article" && format !== "image" && format !== "carousel") {
    return NextResponse.json({ error: "Invalid format." }, { status: 400 });
  }

  const userLines = [
    `Format: ${format}`,
    theme
      ? `Topic: ${theme}`
      : "Topic: pick an interesting, plausible topic yourself about Daïmo's business (process automation, IT consulting, digitalization, client work, hiring, or company culture).",
    guidelines ? `Writing guidelines to follow: ${guidelines}` : "",
    "Write the post now, as the JSON object described in your instructions.",
  ].filter(Boolean);

  const client = new Anthropic({ apiKey });

  try {
    const response = await client.messages.create({
      model: "claude-opus-5",
      max_tokens: 4096,
      output_config: { effort: "medium" },
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userLines.join("\n") }],
    });

    let text = "";
    for (const block of response.content) {
      if (block.type === "text") text += block.text;
    }
    if (!text) {
      return NextResponse.json({ error: "No text in AI response." }, { status: 502 });
    }

    const cleaned = text
      .trim()
      .replace(/^```(?:json)?/i, "")
      .replace(/```\s*$/, "")
      .trim();

    let parsed: unknown;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ error: "AI response was not valid JSON." }, { status: 502 });
    }

    if (
      typeof parsed !== "object" ||
      parsed === null ||
      typeof (parsed as Record<string, unknown>).title !== "string" ||
      typeof (parsed as Record<string, unknown>).content !== "string"
    ) {
      return NextResponse.json({ error: "Malformed AI response." }, { status: 502 });
    }

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("AI post generation failed:", err);
    return NextResponse.json({ error: "AI generation failed." }, { status: 502 });
  }
}
