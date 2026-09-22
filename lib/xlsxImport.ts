import { readSheet } from "read-excel-file/browser";
import { CarouselSlide, GraphicCategory, Post, PostFormat } from "./types";
import { pickWeightedFormat } from "./generate";
import { generateContentSmart } from "./aiGenerate";
import { generatePostGraphic } from "./graphic";

/** How the "Thème/contenu" cell should be turned into the post's actual copy. */
export type EntryType = "text" | "theme" | "ai";

export interface ParsedCalendarEntry {
  date: string; // YYYY-MM-DD
  theme: string;
  format: PostFormat;
  formatSpecified: boolean;
  videoNote: boolean;
  type: EntryType;
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

function mapFormat(cell: unknown): { format: PostFormat; formatSpecified: boolean; videoNote: boolean } {
  const text = normalize(cellToText(cell));
  if (!text) return { format: "article", formatSpecified: false, videoNote: false };
  if (text.includes("carrousel") || text.includes("carousel")) return { format: "carousel", formatSpecified: true, videoNote: false };
  if (text.includes("video")) return { format: "article", formatSpecified: true, videoNote: true };
  if (text.includes("photo")) return { format: "image", formatSpecified: true, videoNote: false };
  return { format: "article", formatSpecified: true, videoNote: false };
}

/**
 * "Texte": the cell already holds the finished post copy, use it as-is.
 * "Thème": the cell names a topic, the tool writes a full post around it.
 * "IA": the tool decides everything; the cell (if any) is only a loose hint.
 * Unrecognized or empty values default to "theme", the previous behavior.
 */
function mapType(cell: unknown): EntryType {
  const text = normalize(cellToText(cell));
  if (text === "texte" || text === "text") return "text";
  if (text === "ia" || text === "ai") return "ai";
  return "theme";
}

function guessCategory(text: string): GraphicCategory {
  const normalized = normalize(text);
  if (/(hiring|recrut|job|poste|career|carriere)/.test(normalized)) return "hiring";
  return "client";
}

/** Turns the first line/sentence of a finished text into a short image headline. */
function deriveTitleFromText(text: string): string {
  const firstLine = text.split(/\n+/)[0].trim();
  const sentenceMatch = firstLine.match(/^(.{10,100}?[.!?])(\s|$)/);
  const candidate = (sentenceMatch ? sentenceMatch[1] : firstLine).replace(/[.!?]+$/, "").trim();
  if (candidate.length <= 90) return candidate || "Update";
  return `${candidate.slice(0, 87).trim()}…`;
}

/** Splits a finished text into carousel slides: by paragraph, or by sentence if there's only one. */
function splitTextIntoSlides(text: string, max = 6): string[] {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  const chunks = paragraphs.length > 1 ? paragraphs : text.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);
  return (chunks.length > 0 ? chunks : [text.trim()]).slice(0, max);
}

/**
 * Reads a calendar spreadsheet entirely client-side (the file never leaves the
 * browser) and extracts one entry per row that has a theme filled in. Column
 * matching is header-name based (Semaine/Week, Thème.../Theme..., Format, Type),
 * so it tolerates columns being reordered, and works whether "Semaine" is stored
 * as text ("du 21/09/2026") or as a real date cell.
 */
export async function parseCalendarFile(file: File): Promise<ParsedCalendarEntry[]> {
  const rows = (await readSheet(file)) as unknown[][];

  let headerRowIndex = -1;
  let dateCol = -1;
  let themeCol = -1;
  let formatCol = -1;
  let typeCol = -1;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    for (let c = 0; c < row.length; c++) {
      const header = normalize(cellToText(row[c]));
      if (!header) continue;
      if (header.includes("semaine") || header === "week") dateCol = c;
      else if (header.includes("theme")) themeCol = c;
      else if (header === "format") formatCol = c;
      else if (header === "type") typeCol = c;
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
    const { format, formatSpecified, videoNote } =
      formatCol !== -1 ? mapFormat(row[formatCol]) : { format: "article" as PostFormat, formatSpecified: false, videoNote: false };
    const type = typeCol !== -1 ? mapType(row[typeCol]) : "theme";
    entries.push({ date, theme, format, formatSpecified, videoNote, type });
  }

  return entries;
}

function withVideoNote(content: string, videoNote: boolean): string {
  return videoNote
    ? `${content}\n\nFormat planned in the calendar: video. This tool doesn't generate video, to be produced and published separately.`
    : content;
}

/**
 * Turns parsed spreadsheet rows into full posts, including real generated
 * visuals (same pipeline as "Générer un post"). Runs client-side, so this only
 * works in the browser. Behavior depends on each row's "Type":
 * - "text": the sheet cell is the finished copy, used as-is, only the image
 *   is generated for it.
 * - "theme": the cell names a topic, a full post is generated around it (same
 *   engine as the "Proposez un thème" field).
 * - "ai": the tool picks everything; the cell, if not empty, is used as a
 *   loose hint, and the format is picked freely when the sheet didn't specify
 *   one for that row.
 */
export async function buildPostsFromEntries(entries: ParsedCalendarEntry[], guidelines?: string): Promise<Post[]> {
  const now = new Date().toISOString();
  const posts: Post[] = [];

  for (const entry of entries) {
    const format = entry.type === "ai" && !entry.formatSpecified ? pickWeightedFormat() : entry.format;

    let title: string;
    let content: string;
    let slideCaptions: string[] | undefined;
    let category: GraphicCategory;
    let highlight: string;

    if (entry.type === "text") {
      title = deriveTitleFromText(entry.theme);
      content = entry.theme;
      category = guessCategory(entry.theme);
      highlight = "Contact the Daïmo team →";
      if (format === "carousel") slideCaptions = splitTextIntoSlides(entry.theme);
    } else {
      const customTheme = entry.type === "theme" ? entry.theme : entry.theme || undefined;
      const generated = await generateContentSmart(format, customTheme, guidelines);
      title = generated.title;
      content = generated.content;
      slideCaptions = generated.slides?.map((s) => s.caption);
      category = generated.category;
      highlight = generated.highlight;
    }

    const post: Post = {
      id: crypto.randomUUID(),
      format,
      title,
      content: withVideoNote(content, entry.videoNote),
      graphicCategory: category,
      visualStyle: "template",
      date: entry.date,
      time: "09:00",
      status: "draft",
      createdAt: now,
      updatedAt: now,
    };

    if (format === "image") {
      post.imageUrl = await generatePostGraphic({ category, headline: title, highlight, visual: "template" });
    }

    if (format === "carousel" && slideCaptions && slideCaptions.length > 0) {
      const slideCount = slideCaptions.length;
      post.slides = await Promise.all(
        slideCaptions.map(
          async (caption, i): Promise<CarouselSlide> => ({
            id: crypto.randomUUID(),
            caption,
            imageUrl: await generatePostGraphic({ category, headline: caption, slideIndex: i + 1, slideCount, visual: "template" }),
          })
        )
      );
    }

    posts.push(post);
  }

  return posts;
}
