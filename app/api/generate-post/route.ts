import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

interface RequestBody {
  format: "article" | "image" | "carousel" | "video";
  theme?: string;
  guidelines?: string;
}

const BASE_SYSTEM_PROMPT = `You write LinkedIn posts for Daïmo, a Belgian process/IT consulting company (tagline: "Allied to process IT") that helps organizations digitize and automate their business processes.

Brand voice:
- Professional but approachable and genuine. No corporate fluff, no empty superlatives, no buzzword soup.
- Confident and concrete: back claims with what was actually done, not with adjectives.
- Never invent specific facts, client names, or statistics you were not given. If you don't have real specifics for the topic, keep the copy general rather than making numbers up.

Writing rules:
- Write in English.
- Never use a dash or hyphen as punctuation (no "-", no em dash, no en dash). Use a comma, colon, or period instead. (Hyphens inside real compound words are fine, e.g. "end-to-end".)
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
- "category": which of Daïmo's three graphic templates this post uses, which also fixes its color theme: "tip" (blue/light blue) for a process or product tip, "client" (blue/green) for a client story or company news, "hiring" (purple/pink) for recruitment. Pick whichever best matches the post's substance.
- "highlight": a short punchy line (max about 6 words) shown on the graphic, e.g. a benefit or call to action.`;

/**
 * Per-format guidance, appended to the base system prompt. Each format renders
 * its text very differently downstream (a headline burned onto a template
 * image vs. a plain LinkedIn caption vs. one line per carousel slide), so the
 * length and structure constraints below are real limits from lib/graphic.ts's
 * canvas rendering, not stylistic suggestions.
 */
const FORMAT_GUIDANCE: Record<"article" | "image" | "carousel" | "video", string> = {
  article: `Format: article. This post is text only, no image accompanies it.
- "title": a headline shown above the text (not drawn on any graphic), up to about 12 words.
- "content": 3 to 5 short paragraphs: a hook, real context or substance, a closing call to action.
- "slides": null.`,
  image: `Format: image. This post pairs a short caption with one generated graphic.
- "title": drawn directly on the graphic as large text that wraps to at most 4 lines. Keep it to ONE short punchy phrase, ideally under 8 words: it must read at a glance on a template banner, not as a full sentence.
- "content": the caption shown below the image on LinkedIn, separate from the title. 1 to 3 sentences.
- "slides": null.`,
  carousel: `Format: carousel. "slides" holds 4 to 6 captions, each drawn as the ONLY text on its own square slide image (max 5 wrapped lines, so keep every slide under about 15 words).
- "title": restates the first slide's message, shown above the carousel.
- "slides": the first slide restates the title; the rest build the argument slide by slide, one short idea each.
- "content": a short intro sentence, shown as the post's own caption on LinkedIn, separate from the slides.`,
  video: `Format: video. This post accompanies a video the user will film and attach separately; you do not generate or describe the video itself.
- "content": the caption that runs under the video. LinkedIn shows only its first ~2 lines before "see more", so open with a real hook, then a short script style intro of what the video covers.
- "title": a short internal label for the calendar, not shown publicly.
- "slides": null.`,
};

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
  if (format !== "article" && format !== "image" && format !== "carousel" && format !== "video") {
    return NextResponse.json({ error: "Invalid format." }, { status: 400 });
  }

  const userLines = [
    theme
      ? `Topic: ${theme}`
      : "Topic: pick an interesting, plausible topic yourself about Daïmo's business (process automation, IT consulting, digitalization, client work, hiring, or company culture).",
    guidelines ? `Writing guidelines to follow: ${guidelines}` : "",
    "Write the post now, as the JSON object described in your instructions.",
  ].filter(Boolean);

  const client = new Anthropic({ apiKey });
  const system = `${BASE_SYSTEM_PROMPT}\n\n${FORMAT_GUIDANCE[format]}`;

  try {
    const response = await client.messages.create({
      model: "claude-opus-5-5",
      max_tokens: 4096,
      output_config: { effort: "medium" },
      system,
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
