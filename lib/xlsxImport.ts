import { readSheet } from "read-excel-file/browser";
import { CarouselSlide, GraphicCategory, Post, PostFormat } from "./types";
import { generatePostGraphic } from "./graphic";

export interface ParsedCalendarEntry {
  date: string; // YYYY-MM-DD
  theme: string;
  format: PostFormat;
  videoNote: boolean;
}

function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

function cellToText(cell: unknown): string {
  if (cell == null) return "";
  if (cell instanceof Date) return cell.toISOString();
  return String(cell).trim();
}

/** Parses "du 21/09/2026", "21/09/2026" or a real Date cell into YYYY-MM-DD. */
function parseDateCell(cell: unknown): string | null {
  if (cell instanceof Date) {
    const y = cell.getUTCFullYear();
    const m = String(cell.getUTCMonth() + 1).padStart(2, "0");
    const d = String(cell.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  const text = cellToText(cell);
  const match = text.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (!match) return null;
  const [, day, month, year] = match;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function mapFormat(cell: unknown): { format: PostFormat; videoNote: boolean } {
  const text = normalize(cellToText(cell));
  if (text.includes("carrousel") || text.includes("carousel")) return { format: "carousel", videoNote: false };
  if (text.includes("video")) return { format: "article", videoNote: true };
  if (text.includes("photo")) return { format: "image", videoNote: false };
  return { format: "article", videoNote: false };
}

function guessCategory(theme: string): GraphicCategory {
  const text = normalize(theme);
  if (/(hiring|recrut|job|poste|career|carriere)/.test(text)) return "hiring";
  return "client";
}

/**
 * Reads a calendar spreadsheet entirely client-side (the file never leaves the
 * browser) and extracts one entry per row that has a theme filled in. Column
 * matching is header-name based (Semaine/Week, Thème.../Theme..., Format), so it
 * tolerates columns being reordered, and works whether "Semaine" is stored as
 * text ("du 21/09/2026") or as a real date cell.
 */
export async function parseCalendarFile(file: File): Promise<ParsedCalendarEntry[]> {
  const rows = (await readSheet(file)) as unknown[][];

  let headerRowIndex = -1;
  let dateCol = -1;
  let themeCol = -1;
  let formatCol = -1;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    for (let c = 0; c < row.length; c++) {
      const header = normalize(cellToText(row[c]));
      if (!header) continue;
      if (header.includes("semaine") || header === "week") dateCol = c;
      else if (header.includes("theme")) themeCol = c;
      else if (header === "format") formatCol = c;
    }
    if (dateCol !== -1 && themeCol !== -1) {
      headerRowIndex = i;
      break;
    }
  }

  if (headerRowIndex === -1) {
    throw new Error(
      'Colonnes "Semaine" et "Thème/contenu" introuvables dans ce fichier. Vérifiez qu\'elles existent bien, avec ces en-têtes.'
    );
  }

  const entries: ParsedCalendarEntry[] = [];
  for (let i = headerRowIndex + 1; i < rows.length; i++) {
    const row = rows[i];
    const theme = cellToText(row[themeCol]);
    if (!theme) continue;
    const date = parseDateCell(row[dateCol]);
    if (!date) continue;
    const { format, videoNote } = formatCol !== -1 ? mapFormat(row[formatCol]) : { format: "article" as PostFormat, videoNote: false };
    entries.push({ date, theme, format, videoNote });
  }

  return entries;
}

function buildDraftBody(theme: string, format: PostFormat): { content: string; slides?: string[] } {
  if (format === "carousel") {
    return {
      content: `🚧 Carousel to complete: walk through "${theme}", step by step.`,
      slides: [
        theme,
        `Slide to complete: introduce "${theme}".`,
        "Slide to complete: what's the key point or benefit?",
        "Slide to complete: an example or a result?",
        "Want to talk about it? Contact the Daïmo team →",
      ],
    };
  }
  return { content: `🚧 Draft to complete: share your update about "${theme}".` };
}

/**
 * Turns parsed spreadsheet rows into full posts, including real generated
 * visuals (same pipeline as "Générer un post"). Runs client-side, so this only
 * works in the browser.
 */
export async function buildPostsFromEntries(entries: ParsedCalendarEntry[]): Promise<Post[]> {
  const now = new Date().toISOString();
  const posts: Post[] = [];

  for (const entry of entries) {
    const category = guessCategory(entry.theme);
    const { content: draftContent, slides: draftSlides } = buildDraftBody(entry.theme, entry.format);
    const content = entry.videoNote
      ? `${draftContent}\n\nFormat planned in the calendar: video. This tool doesn't generate video, to be produced and published separately.`
      : draftContent;
    const highlight = "Contact the Daïmo team →";

    const post: Post = {
      id: crypto.randomUUID(),
      format: entry.format,
      title: entry.theme,
      content,
      graphicCategory: category,
      visualStyle: "template",
      date: entry.date,
      time: "09:00",
      status: "draft",
      createdAt: now,
      updatedAt: now,
    };

    if (entry.format === "image") {
      post.imageUrl = await generatePostGraphic({
        category,
        headline: entry.theme,
        highlight,
        visual: "template",
      });
    }

    if (entry.format === "carousel" && draftSlides) {
      const slideCount = draftSlides.length;
      post.slides = await Promise.all(
        draftSlides.map(
          async (caption, i): Promise<CarouselSlide> => ({
            id: crypto.randomUUID(),
            caption,
            imageUrl: await generatePostGraphic({
              category,
              headline: caption,
              slideIndex: i + 1,
              slideCount,
              visual: "template",
            }),
          })
        )
      );
    }

    posts.push(post);
  }

  return posts;
}
