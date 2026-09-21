export type PostFormat = "article" | "image" | "carousel";

export type PostStatus = "draft" | "scheduled" | "published";

/** Visual theme used by the generated graphics: badge label, gradient and accent differ per category. */
export type GraphicCategory = "tip" | "client" | "hiring";

export const GRAPHIC_CATEGORY_LABELS: Record<GraphicCategory, string> = {
  tip: "Process tip",
  client: "Client story",
  hiring: "Hiring",
};

/** Background source for a generated visual: an illustrated brand template, or a real photo with people. */
export type VisualStyle = "template" | "photo";

export const VISUAL_STYLE_LABELS: Record<VisualStyle, string> = {
  template: "Type PowerPoint",
  photo: "Photo avec des personnes",
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
  /** Visual theme applied to imageUrl/slides, kept so a manual regeneration stays consistent. */
  graphicCategory?: GraphicCategory;
  /** Which background source the generator used, kept so a manual regeneration stays consistent. */
  visualStyle?: VisualStyle;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  status: PostStatus;
  createdAt: string;
  updatedAt: string;
}

export const FORMAT_LABELS: Record<PostFormat, string> = {
  article: "Article",
  image: "Image + texte",
  carousel: "Carrousel",
};

export const FORMAT_COLORS: Record<PostFormat, { bg: string; text: string; dot: string }> = {
  article: { bg: "bg-daimo-blue/10", text: "text-daimo-blue", dot: "bg-daimo-blue" },
  image: { bg: "bg-daimo-lightblue/10", text: "text-daimo-lightblue", dot: "bg-daimo-lightblue" },
  carousel: { bg: "bg-daimo-green/10", text: "text-daimo-green", dot: "bg-daimo-green" },
};
