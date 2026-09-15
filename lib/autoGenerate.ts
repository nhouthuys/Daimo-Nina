import { buildGeneratedPost } from "./generate";
import { generateBackgroundImage } from "./backgroundImage";
import { Post } from "./types";

/**
 * Produces a full, ready-to-review post: real generated copy (title + content,
 * or slide captions for a carousel) plus a real generated background image for
 * formats that need one. Everything runs locally in the browser — no external
 * API is called — so this only works client-side.
 */
export function createGeneratedPost(date: string, time: string): Post {
  const post = buildGeneratedPost(date, time);

  if (post.format === "image") {
    post.imageUrl = generateBackgroundImage(1200, 630);
  }

  if (post.format === "carousel" && post.slides) {
    post.slides = post.slides.map((slide) => ({
      ...slide,
      imageUrl: generateBackgroundImage(1080, 1080),
    }));
  }

  return post;
}
