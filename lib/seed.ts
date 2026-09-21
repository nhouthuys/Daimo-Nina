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

// Sourced from the calendrier LinkedIn (Calendrier_LinkedIn.xlsx) fourni : thèmes, dates et
// formats prévus. Le détail réel de chaque sujet (mission AFCN, approche BBS, "Long Gakki",
// salon à Ecolys…) n'est connu que de Daïmo : chaque post est donc préparé comme un brouillon
// à compléter, plutôt que rempli avec un texte générique qui sonnerait faux ou inventé.
const CALENDAR_ENTRIES: CalendarEntry[] = [
  {
    date: "2026-09-21",
    format: "article",
    category: "client",
    title: "Notre mission pour l'AFCN",
    content:
      "🚧 Brouillon à compléter : décrivez ici la mission menée pour l'AFCN (contexte, enjeux, résultat).\n\nStatut indiqué dans votre calendrier : à valider.",
  },
  {
    date: "2026-10-05",
    format: "carousel",
    category: "tip",
    title: "Notre approche BBS",
    content: "🚧 Carrousel à compléter : présentez votre approche BBS, étape par étape.",
    slides: [
      "Notre approche BBS",
      "Slide à compléter : en quoi consiste votre approche BBS ?",
      "Slide à compléter : quels bénéfices concrets pour vos clients ?",
      "Slide à compléter : un exemple ou un résultat chez un client ?",
      "Envie d'en discuter ? Contactez l'équipe Daïmo →",
    ],
  },
  {
    date: "2026-10-12",
    format: "image",
    category: "tip",
    title: "Long Gakki",
    content: "🚧 Brouillon à compléter : précisez le sujet exact autour de « Long Gakki » pour ce post.",
  },
  {
    date: "2026-10-19",
    format: "article",
    category: "client",
    title: "Daïmo fête ses 5 ans !",
    content:
      "🎉 Cette année, Daïmo fête ses 5 ans !\n\n🚧 Brouillon à compléter : le message que vous voulez partager pour cet anniversaire (rétrospective, remerciements à l'équipe et aux clients…).",
    note: "Format prévu au calendrier : vidéo. Cet outil ne génère pas de vidéo, à produire et publier séparément.",
  },
  {
    date: "2026-11-09",
    format: "image",
    category: "client",
    title: "Retrouvez-nous au salon à Ecolys",
    content:
      "🚧 Brouillon à compléter : dates du salon, emplacement de votre stand, ce que les visiteurs peuvent y découvrir.",
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
    const highlight = "Contactez l'équipe Daïmo →";
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
