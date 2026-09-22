import { CarouselSlide, GraphicCategory, PostFormat } from "./types";
import { GeneratedContent, generateContent } from "./generate";

interface AiResponse {
  title: string;
  content: string;
  slides?: string[] | null;
  category?: string;
  highlight?: string;
}

const CATEGORIES: GraphicCategory[] = ["tip", "client", "hiring"];

function toGeneratedContent(ai: AiResponse, format: PostFormat): GeneratedContent {
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

async function callAi(format: PostFormat, theme?: string, guidelines?: string): Promise<GeneratedContent | null> {
  try {
    const res = await fetch("/api/generate-post", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ format, theme, guidelines }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as AiResponse;
    if (typeof data.title !== "string" || typeof data.content !== "string") return null;
    return toGeneratedContent(data, format);
  } catch {
    return null;
  }
}

/**
 * Generates post content, preferring the real Claude API (which can actually
 * follow arbitrary writing guidelines) and transparently falling back to the
 * local template engine when the API isn't configured or the call fails, so
 * the app keeps working either way.
 */
export async function generateContentSmart(format: PostFormat, theme?: string, guidelines?: string): Promise<GeneratedContent> {
  const ai = await callAi(format, theme, guidelines);
  if (ai) return ai;
  return generateContent(format, theme);
}
