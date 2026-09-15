import { generateContent, pickWeightedFormat } from "./generate";
import { generatePostGraphic } from "./graphic";
import { Post } from "./types";

/**
 * Produces a full, ready-to-review post: real generated copy (title + content,
 * or slide captions for a carousel) plus a real generated graphic — headline and
 * highlight drawn on an on-brand canvas background — for formats that need one.
 * Everything runs locally in the browser, no external API involved, so this only
 * works client-side. All slides of a carousel share the same category/theme so
 * the set reads as one consistent design instead of a random grab-bag of colors.
 */
export async function createGeneratedPost(date: string, time: string): Promise<Post> {
  const format = pickWeightedFormat();
  const generated = generateContent(format);
  const now = new Date().toISOString();

  const post: Post = {
    id: crypto.randomUUID(),
    format,
    title: generated.title,
    content: generated.content,
    slides: generated.slides,
    graphicCategory: generated.category,
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
        }),
      }))
    );
  }

  return post;
}
