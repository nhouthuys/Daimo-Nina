import { pickWeightedFormat, GeneratedContent } from "./generate";
import { generateContentSmart } from "./aiGenerate";
import { generatePostGraphic } from "./graphic";
import { Post, PostFormat, VisualStyle } from "./types";
import { deriveTitleFromText, guessCategory, isFinishedText, splitTextIntoSlides } from "./textInput";

function pickVisualStyle(): VisualStyle {
  return Math.random() < 0.6 ? "template" : "photo";
}

/** A theme field can hold a finished post instead of a topic — use it as-is, no AI rewrite, same as the Excel "Texte" type. */
function contentFromFinishedText(text: string, format: PostFormat): GeneratedContent {
  const category = guessCategory(text);
  return {
    title: deriveTitleFromText(text),
    content: text,
    slides:
      format === "carousel"
        ? splitTextIntoSlides(text).map((caption) => ({ id: crypto.randomUUID(), caption }))
        : undefined,
    hashtag: "",
    category,
    highlight: "Contact the Daïmo team →",
  };
}

/**
 * Produces a full, ready-to-review post: real generated copy (title + content,
 * or slide captions for a carousel — via the Claude API when configured, the
 * local template engine otherwise) plus a real generated graphic — headline and
 * highlight drawn on either the brand template or a real photo background — for
 * formats that need one. All slides of a carousel share the same category/theme
 * and visual style so the set reads as one consistent design.
 *
 * `forcedFormat`, when given, keeps the format the caller already chose (e.g.
 * regenerating a post whose format is set in the editor) instead of rerolling it.
 */
export async function createGeneratedPost(
  date: string,
  time: string,
  customTheme?: string,
  guidelines?: string,
  forcedFormat?: PostFormat
): Promise<Post> {
  const format = forcedFormat ?? pickWeightedFormat();
  const generated =
    customTheme && isFinishedText(customTheme)
      ? contentFromFinishedText(customTheme, format)
      : await generateContentSmart(format, customTheme, guidelines);
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
