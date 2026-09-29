import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_BRAND_PROMPT, DEFAULT_FORMAT_GUIDANCE, JSON_CONTRACT } from "@/lib/promptDefaults";

export const runtime = "nodejs";

interface RequestBody {
  format: "article" | "image" | "carousel" | "video";
  theme?: string;
  guidelines?: string;
  /** User-editable override for block 1 (brand identity & writing rules). Falls back to DEFAULT_BRAND_PROMPT when empty. */
  brandPrompt?: string;
  /** User-editable override for block 2 (this format's guidance). Falls back to DEFAULT_FORMAT_GUIDANCE[format] when empty. */
  formatGuidance?: string;
}

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

  const { format, theme, guidelines, brandPrompt, formatGuidance } = body;
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
  const system = [
    brandPrompt?.trim() || DEFAULT_BRAND_PROMPT,
    JSON_CONTRACT,
    formatGuidance?.trim() || DEFAULT_FORMAT_GUIDANCE[format],
  ].join("\n\n");

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
