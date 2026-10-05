import { pickWeightedFormat, GeneratedContent } from "./generate";
import { generateContentSmart } from "./aiGenerate";
import { generatePostGraphic } from "./graphic";
import { Post, PostFormat } from "./types";
import { deriveTitleFromText, guessCategory, isFinishedText, splitTextIntoSlides } from "./textInput";

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

export interface CreatePostOptions {
  /** A topic, or a free-text hint for whatever the AI ends up writing itself. */
  customTheme?: string;
  /** Keeps the format the caller already chose instead of rerolling it. */
  forcedFormat?: PostFormat;
  /** User-editable override for prompt block 1 (brand identity & writing rules). */
  brandPrompt?: string;
  /** User-editable override for prompt block 2, keyed by format; only the entry for the format actually used here is sent. */
  formatGuidance?: Record<PostFormat, string>;
  /** A photo the user already has: Claude sees it (vision input) while writing the post, and it becomes the post's own image/attachment — see below. */
  referenceImageUrl?: string;
  /** A title already typed into the form: kept exactly as given instead of being written by the AI. */
  existingTitle?: string;
  /** Content already typed into the form: kept exactly as given instead of being written by the AI. */
  existingContent?: string;
  /** The "image" format's image, if the human already set one: kept as the post's image instead of generating a fresh template graphic. */
  existingImageUrl?: string;
  /** "article"/"video"'s attached images, if the human already added some: kept as-is instead of being replaced by `referenceImageUrl`. */
  existingImages?: string[];
}

/**
 * Produces a full, ready-to-review post: real generated copy (title + content,
 * or slide captions for a carousel — via the Claude API when configured, the
 * local template engine otherwise) plus a real generated graphic — headline and
 * highlight drawn on either the brand template or a real photo background — for
 * formats that need one. All slides of a carousel share the same category/theme
 * and visual style so the set reads as one consistent design.
 *
 * Any of `existingTitle`/`existingContent`/`existingImageUrl`/`existingImages`
 * that the human already filled in are kept as-is: the AI only ever writes
 * the fields that were actually left blank.
 */
export async function createGeneratedPost(date: string, time: string, options: CreatePostOptions = {}): Promise<Post> {
  const {
    customTheme,
    forcedFormat,
    brandPrompt,
    formatGuidance,
    referenceImageUrl,
    existingTitle,
    existingContent,
    existingImageUrl,
    existingImages,
  } = options;
  const format = forcedFormat ?? pickWeightedFormat();
  const generated =
    customTheme && isFinishedText(customTheme)
      ? contentFromFinishedText(customTheme, format)
      : await generateContentSmart(format, {
          theme: customTheme,
          brandPrompt,
          formatGuidance: formatGuidance?.[format],
          referenceImageUrl,
          existingTitle,
          existingContent,
        });
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
    post.imageUrl = existingImageUrl
      ? existingImageUrl
      : referenceImageUrl
        ? referenceImageUrl
        : await generatePostGraphic({
            category: generated.category,
            headline: generated.title,
            highlight: generated.highlight,
          });
  }

  if (format === "article" || format === "video") {
    if (existingImages && existingImages.length > 0) {
      post.images = existingImages;
    } else if (referenceImageUrl) {
      post.images = [referenceImageUrl];
    }
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
