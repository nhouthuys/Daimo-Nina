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

async function callAi(format: PostFormat, theme?: string, guidelines?: string): Promise<GeneratedContent> {
  let res: Response;
  try {
    res = await fetch("/api/generate-post", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ format, theme, guidelines }),
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
 */
export async function generateContentSmart(format: PostFormat, theme?: string, guidelines?: string): Promise<GeneratedContent> {
  return callAi(format, theme, guidelines);
}
