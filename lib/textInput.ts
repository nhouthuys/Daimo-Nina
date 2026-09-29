import { GraphicCategory } from "./types";

/**
 * Distinguishes a short theme/topic from a finished post the user already
 * wrote, so a text input field can serve both without forcing every paste
 * through the AI for a rewrite. Deliberately simple (length + structure),
 * not a classifier: a long or multi-sentence input reads as finished copy.
 */
export function isFinishedText(input: string): boolean {
  const trimmed = input.trim();
  if (trimmed.length > 220) return true;
  const sentenceCount = (trimmed.match(/[.!?](\s|$)/g) ?? []).length;
  return sentenceCount >= 2;
}

/** Turns the first line/sentence of a finished text into a short image headline. */
export function deriveTitleFromText(text: string): string {
  const firstLine = text.split(/\n+/)[0].trim();
  const sentenceMatch = firstLine.match(/^(.{10,100}?[.!?])(\s|$)/);
  const candidate = (sentenceMatch ? sentenceMatch[1] : firstLine).replace(/[.!?]+$/, "").trim();
  if (candidate.length <= 90) return candidate || "Update";
  return `${candidate.slice(0, 87).trim()}…`;
}

/** Splits a finished text into carousel slides: by paragraph, or by sentence if there's only one. */
export function splitTextIntoSlides(text: string, max = 6): string[] {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  const chunks = paragraphs.length > 1 ? paragraphs : text.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);
  return (chunks.length > 0 ? chunks : [text.trim()]).slice(0, max);
}

export function guessCategory(text: string): GraphicCategory {
  const normalized = text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
  if (/(hiring|recrut|job|poste|career|carriere)/.test(normalized)) return "hiring";
  return "client";
}
