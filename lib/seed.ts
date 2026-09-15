import { Post } from "./types";
import { toISODate } from "./date";

function dateInCurrentMonth(day: number): string {
  const now = new Date();
  return toISODate(new Date(now.getFullYear(), now.getMonth(), day));
}

export function buildSeedPosts(): Post[] {
  const now = new Date().toISOString();
  return [
    {
      id: "seed-1",
      format: "article",
      title: "Pourquoi automatiser vos process métier en 2026",
      content:
        "Chez Daïmo, on accompagne les entreprises qui veulent gagner du temps sur leurs process. Dans cet article, on partage 3 leviers concrets pour démarrer.",
      date: dateInCurrentMonth(3),
      time: "09:00",
      status: "scheduled",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "seed-2",
      format: "image",
      title: "Bienvenue à notre nouvelle recrue !",
      content:
        "L'équipe Daïmo s'agrandit 🎉 Toute l'équipe souhaite la bienvenue à notre nouveau consultant process IT.",
      imageUrl: "",
      date: dateInCurrentMonth(9),
      time: "11:30",
      status: "scheduled",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "seed-3",
      format: "carousel",
      title: "5 signes qu'il est temps de digitaliser vos process",
      content: "Un carrousel en 5 slides pour identifier les signaux d'alerte dans votre organisation.",
      slides: [
        { id: "s1", caption: "1. Vos équipes perdent du temps sur des tâches répétitives" },
        { id: "s2", caption: "2. L'information circule mal entre les services" },
        { id: "s3", caption: "3. Vous manquez de visibilité sur vos indicateurs clés" },
        { id: "s4", caption: "4. Les erreurs manuelles se répètent" },
        { id: "s5", caption: "5. Daïmo peut vous aider → contactez-nous" },
      ],
      date: dateInCurrentMonth(17),
      time: "14:00",
      status: "draft",
      createdAt: now,
      updatedAt: now,
    },
  ];
}
