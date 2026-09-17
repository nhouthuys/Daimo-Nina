import { generateContent, pickWeightedFormat } from "./generate";
import { generatePostGraphic } from "./graphic";
import { Post, VisualStyle } from "./types";

function pickVisualStyle(): VisualStyle {
  return Math.random() < 0.6 ? "template" : "photo";
}

/**
 * Produces a full, ready-to-review post: real generated copy (title + content,
 * or slide captions for a carousel) plus a real generated graphic — headline and
 * highlight drawn on either the brand template or a real photo background — for
 * formats that need one. All slides of a carousel share the same category/theme
 * and visual style so the set reads as one consistent design.
 */
export async function createGeneratedPost(date: string, time: string, customTheme?: string): Promise<Post> {
  const format = pickWeightedFormat();
  const generated = generateContent(format, customTheme);
  const visualStyle = pickVisualStyle();
  const now = new Date().toISOString();

  const post: Post = {
    id: crypto.randomUUID(),
    format,
    title: generated.title,
    content: generated.content,
    slides: generated.slides,
    graphicCategory: generated.category,
    visualStyle,
    date,
    time,
    status: "draft",
    createdAt: now,
    updatedAt: now,
  };

  if (format === "image") {
    post.imageUrl = await generatePostGraphic({
      category: generated.category,
      headline: generated.title,
      highlight: generated.highlight,
      visual: visualStyle,
    });
  }

  if (format === "carousel" && post.slides) {
    const slideCount = post.slides.length;
    post.slides = await Promise.all(
      post.slides.map(async (slide, i) => ({
        ...slide,
        imageUrl: await generatePostGraphic({
          category: generated.category,
          headline: slide.caption,
          slideIndex: i + 1,
          slideCount,
          visual: visualStyle,
        }),
      }))
    );
  }

  return post;
}
