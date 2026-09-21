import { CarouselSlide, GraphicCategory, Post, PostFormat } from "./types";
import { generatePostGraphic } from "./graphic";

interface CalendarEntry {
  date: string; // YYYY-MM-DD
  format: PostFormat;
  category: GraphicCategory;
  title: string;
  content: string;
  slides?: string[];
  note?: string;
}

// Sourced from the client's own LinkedIn planning spreadsheet (Calendrier_LinkedIn.xlsx):
// themes, dates and planned formats. The real specifics of each topic (AFCN mission, BBS
// approach, "Long Gakki", the Ecolys trade show…) are only known to Daïmo, so each post is
// prepared as a clearly-marked draft rather than filled with generic text that would sound
// made up.
const CALENDAR_ENTRIES: CalendarEntry[] = [
  {
    date: "2026-09-21",
    format: "article",
    category: "client",
    title: "Our mission for the AFCN",
    content:
      "🚧 Draft to complete: describe the mission carried out for the AFCN (context, challenges, outcome).\n\nStatus shown in your calendar: to be validated.",
  },
  {
    date: "2026-10-05",
    format: "carousel",
    category: "tip",
    title: "Our BBS approach",
    content: "🚧 Carousel to complete: walk through your BBS approach, step by step.",
    slides: [
      "Our BBS approach",
      "Slide to complete: what does your BBS approach involve?",
      "Slide to complete: what concrete benefits for your clients?",
      "Slide to complete: an example or result from a client?",
      "Want to talk about it? Contact the Daïmo team →",
    ],
  },
  {
    date: "2026-10-12",
    format: "image",
    category: "tip",
    title: "Long Gakki",
    content: "🚧 Draft to complete: specify the exact subject around “Long Gakki” for this post.",
  },
  {
    date: "2026-10-19",
    format: "article",
    category: "client",
    title: "Daïmo turns 5!",
    content:
      "🎉 This year, Daïmo turns 5!\n\n🚧 Draft to complete: the message you want to share for this anniversary (retrospective, thanks to the team and clients…).",
    note: "Format planned in the calendar: video. This tool doesn't generate video, to be produced and published separately.",
  },
  {
    date: "2026-11-09",
    format: "image",
    category: "client",
    title: "Come see us at the Ecolys trade show",
    content:
      "🚧 Draft to complete: trade show dates, your booth location, what visitors can discover there.",
  },
];

/**
 * Builds the initial calendar from the themes/dates/formats provided in the client's
 * own planning spreadsheet. Titles and visuals are ready; body copy is left as a
 * clearly-marked draft since the real specifics of each topic are only known to Daïmo.
 * Visual generation runs client-side, so this only works in the browser.
 */
export async function buildCalendarSeedPosts(): Promise<Post[]> {
  const now = new Date().toISOString();
  const posts: Post[] = [];

  for (const entry of CALENDAR_ENTRIES) {
    const highlight = "Contact the Daïmo team →";
    const post: Post = {
      id: crypto.randomUUID(),
      format: entry.format,
      title: entry.title,
      content: entry.note ? `${entry.content}\n\n${entry.note}` : entry.content,
      graphicCategory: entry.category,
      visualStyle: "template",
      date: entry.date,
      time: "09:00",
      status: "draft",
      createdAt: now,
      updatedAt: now,
    };

    if (entry.format === "image") {
      post.imageUrl = await generatePostGraphic({
        category: entry.category,
        headline: entry.title,
        highlight,
        visual: "template",
      });
    }

    if (entry.format === "carousel" && entry.slides) {
      const slideCount = entry.slides.length;
      const slides: CarouselSlide[] = await Promise.all(
        entry.slides.map(async (caption, i) => ({
          id: crypto.randomUUID(),
          caption,
          imageUrl: await generatePostGraphic({
            category: entry.category,
            headline: caption,
            slideIndex: i + 1,
            slideCount,
            visual: "template",
          }),
        }))
      );
      post.slides = slides;
    }

    posts.push(post);
  }

  return posts;
}
