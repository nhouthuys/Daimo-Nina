export type PostFormat = "article" | "image" | "carousel" | "video";

export type PostStatus = "draft" | "scheduled" | "published";

/** Visual theme used by the generated graphics: badge label, gradient and accent differ per category. */
export type GraphicCategory = "tip" | "client" | "hiring";

export const GRAPHIC_CATEGORY_LABELS: Record<GraphicCategory, string> = {
  tip: "Process tip",
  client: "Client story",
  hiring: "Hiring",
};

export interface CarouselSlide {
  id: string;
  caption: string;
  imageUrl?: string;
}

export interface Post {
  id: string;
  format: PostFormat;
  title: string;
  content: string;
  imageUrl?: string;
  slides?: CarouselSlide[];
  /** Manually attached images, for formats ("article", "video") with no dedicated image field of their own. */
  images?: string[];
  /** Visual theme applied to imageUrl/slides, kept so a manual regeneration stays consistent. */
  graphicCategory?: GraphicCategory;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  status: PostStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * What the "Générer avec l'IA" box asks for. Any `existing*` field that's
 * non-empty is kept exactly as-is; the AI only ever writes what's left blank.
 */
export interface RegenerateRequest {
  theme?: string;
  format?: PostFormat;
  referenceImageUrl?: string;
  existingTitle?: string;
  existingContent?: string;
  existingImageUrl?: string;
  existingImages?: string[];
}

export const FORMAT_LABELS: Record<PostFormat, string> = {
  article: "Article",
  image: "Image + texte",
  carousel: "Carrousel",
  video: "Vidéo",
};

export const FORMAT_COLORS: Record<PostFormat, { bg: string; text: string; dot: string }> = {
  article: { bg: "bg-daimo-blue/10", text: "text-daimo-blue", dot: "bg-daimo-blue" },
  image: { bg: "bg-daimo-lightblue/10", text: "text-daimo-lightblue", dot: "bg-daimo-lightblue" },
  carousel: { bg: "bg-daimo-green/10", text: "text-daimo-green", dot: "bg-daimo-green" },
  video: { bg: "bg-daimo-purple/10", text: "text-daimo-purple", dot: "bg-daimo-purple" },
};
