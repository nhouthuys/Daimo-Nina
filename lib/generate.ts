import { CarouselSlide, GraphicCategory, PostFormat } from "./types";

export interface GeneratedContent {
  title: string;
  content: string;
  slides?: CarouselSlide[];
  hashtag: string;
  category: GraphicCategory;
  /** Short, punchy line drawn on the generated graphic (stat, CTA…). */
  highlight: string;
}

export function pickWeightedFormat(): PostFormat {
  const roll = Math.random();
  if (roll < 0.55) return "image";
  if (roll < 0.85) return "carousel";
  return "article";
}
