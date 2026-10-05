import { CarouselSlide, GraphicCategory, PostFormat } from "./types";
import { GeneratedContent } from "./generate";

interface AiResponse {
  title?: string;
  content?: string;
  slides?: string[] | null;
  category?: string;
  highlight?: string;
  error?: string;
}

const CATEGORIES: GraphicCategory[] = ["tip", "client", "hiring"];

function toGeneratedContent(ai: { title: string; content: string } & AiResponse, format: PostFormat): GeneratedContent {
  const category = CATEGORIES.includes(ai.category as GraphicCategory) ? (ai.category as GraphicCategory) : "client";
  const slides: CarouselSlide[] | undefined =
    format === "carousel" && Array.isArray(ai.slides) && ai.slides.length > 0
      ? ai.slides.filter((s): s is string => typeof s === "string" && s.trim() !== "").map((caption) => ({ id: crypto.randomUUID(), caption }))
      : undefined;

  return {
    title: ai.title,
    content: ai.content,
    slides,
    category,
    highlight: typeof ai.highlight === "string" && ai.highlight ? ai.highlight : "Contact the Daïmo team →",
    hashtag: "",
  };
}

export interface GenerateContentOptions {
  /** Topic or free-text guidance for whatever the AI ends up writing itself. */
  theme?: string;
  /** User-editable override for block 1 (brand identity & writing rules). */
  brandPrompt?: string;
  /** User-editable override for block 2 (this format's guidance). */
  formatGuidance?: string;
  /** A photo to ground the post in (vision input). */
  referenceImageUrl?: string;
  /** A title already typed by the human: kept verbatim, not regenerated. */
  existingTitle?: string;
  /** Content already typed by the human: kept verbatim, not regenerated. */
  existingContent?: string;
}

async function callAi(format: PostFormat, options: GenerateContentOptions): Promise<GeneratedContent> {
  const { theme, brandPrompt, formatGuidance, referenceImageUrl, existingTitle, existingContent } = options;
  let res: Response;
  try {
    res = await fetch("/api/generate-post", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        format,
        theme,
        brandPrompt,
        formatGuidance,
        imageUrl: referenceImageUrl,
        existingTitle,
        existingContent,
      }),
    });
  } catch {
    throw new Error("Impossible de contacter le serveur de génération (problème réseau).");
  }
  const data = (await res.json().catch(() => ({}))) as AiResponse;
  if (!res.ok) {
    throw new Error(data.error || "La génération IA a échoué.");
  }
  if (typeof data.title !== "string" || typeof data.content !== "string") {
    throw new Error("Réponse invalide de l'IA.");
  }
  return toGeneratedContent(data as { title: string; content: string } & AiResponse, format);
}

/**
 * Generates post content via the Claude API. No local fallback: if
 * ANTHROPIC_API_KEY isn't configured on the server, or the call fails, this
 * throws a descriptive error instead of silently degrading.
 *
 * `existingTitle`/`existingContent`, when set, are kept verbatim in the
 * result instead of being written by the AI — only the fields the human left
 * blank are actually generated. `referenceImageUrl`, when given, is sent to
 * Claude as a vision input so it can ground the post in that photo.
 */
export async function generateContentSmart(
  format: PostFormat,
  options: GenerateContentOptions = {}
): Promise<GeneratedContent> {
  return callAi(format, options);
}
