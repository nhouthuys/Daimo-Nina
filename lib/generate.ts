import { CarouselSlide, Post, PostFormat } from "./types";

interface Topic {
  name: string; // ex: "la gestion des factures"
  painPoint: string; // ex: "Des heures perdues chaque semaine en saisie manuelle."
  benefit: string; // ex: "un traitement automatisé en quelques clics"
  stat: string; // ex: "jusqu'à 70% de temps gagné"
  hashtag: string;
}

const TOPICS: Topic[] = [
  {
    name: "la gestion des factures",
    painPoint: "Des heures perdues chaque semaine en saisie manuelle.",
    benefit: "un traitement automatisé en quelques clics",
    stat: "jusqu'à 70% de temps gagné sur le traitement",
    hashtag: "#Facturation",
  },
  {
    name: "l'onboarding des nouveaux clients",
    painPoint: "Des informations éparpillées entre emails, fichiers Excel et post-its.",
    benefit: "un parcours fluide et traçable de bout en bout",
    stat: "une mise en route deux fois plus rapide",
    hashtag: "#OnboardingClient",
  },
  {
    name: "le suivi des stocks",
    painPoint: "Des ruptures ou des surstocks difficiles à anticiper.",
    benefit: "une visibilité en temps réel sur tous vos flux",
    stat: "moins de 2% d'écarts de stock",
    hashtag: "#SupplyChain",
  },
  {
    name: "la conformité RGPD",
    painPoint: "Des process manuels impossibles à auditer sereinement.",
    benefit: "une traçabilité automatique de chaque étape",
    stat: "des audits deux fois plus rapides",
    hashtag: "#RGPD",
  },
  {
    name: "la relation client",
    painPoint: "Des demandes qui se perdent entre plusieurs outils.",
    benefit: "un point d'entrée unique, connecté à vos systèmes",
    stat: "un taux de satisfaction client en hausse de 30%",
    hashtag: "#RelationClient",
  },
  {
    name: "la gestion des congés et absences",
    painPoint: "Des tableaux partagés jamais à jour et des validations par email.",
    benefit: "une demande, une validation, une mise à jour automatique du planning",
    stat: "zéro double saisie pour les équipes RH",
    hashtag: "#RH",
  },
  {
    name: "le reporting mensuel",
    painPoint: "Des heures passées à copier des chiffres d'un outil à l'autre.",
    benefit: "des tableaux de bord générés automatiquement",
    stat: "un reporting prêt en quelques minutes au lieu de plusieurs jours",
    hashtag: "#DataDriven",
  },
];

const ARTICLE_INTROS = [
  "{painPoint} Chez Daïmo, on voit ce constat presque toutes les semaines chez nos clients pour {topic}.",
  "On l'entend souvent : « on n'a pas le temps de digitaliser {topic}, on est déjà débordés ». {painPoint}",
  "{painPoint} C'est le point de départ de beaucoup de nos missions autour de {topic}.",
];

const ARTICLE_BODIES = [
  "Notre approche est simple : partir des irritants du terrain, puis mettre en place {benefit}. Résultat chez nos clients : {stat}.",
  "Concrètement, on cartographie le process existant avec les équipes, puis on automatise ce qui peut l'être pour obtenir {benefit}. Résultat mesuré chez nos clients : {stat}.",
  "On commence toujours petit : un pilote sur un périmètre restreint, pour arriver rapidement à {benefit}. Chez nos derniers clients, ça s'est traduit par {stat}.",
];

const ARTICLE_CTAS = [
  "Et vous, où en êtes-vous sur {topic} ? On en discute ? 👇",
  "Vous vous reconnaissez dans ce constat ? Parlons-en.",
  "Ce sujet vous concerne ? L'équipe Daïmo est disponible pour en discuter.",
];

const IMAGE_CAPTIONS = [
  "{topicCap}, sans la charge manuelle. {benefitCap}. {stat}. 💡",
  "On a aidé un client à repenser {topic}. {benefitCap} → {stat}. 🚀",
  "{painPoint} Notre réponse : {benefitCap}. {stat}. ⚙️",
];

const TITLE_TEMPLATES = [
  "{topicCap} : le levier caché de votre croissance",
  "3 minutes pour repenser {topic}",
  "{topicCap}, encore un frein pour vos équipes ?",
  "Comment on a transformé {topic} chez un client",
  "{topicCap} : {stat}",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function fill(template: string, topic: Topic): string {
  return template
    .replaceAll("{topic}", topic.name)
    .replaceAll("{topicCap}", capitalize(topic.name))
    .replaceAll("{painPoint}", topic.painPoint)
    .replaceAll("{benefit}", topic.benefit)
    .replaceAll("{benefitCap}", capitalize(topic.benefit))
    .replaceAll("{stat}", topic.stat);
}

export interface GeneratedContent {
  title: string;
  content: string;
  slides?: CarouselSlide[];
  hashtag: string;
}

export function pickWeightedFormat(): PostFormat {
  const roll = Math.random();
  if (roll < 0.55) return "image";
  if (roll < 0.85) return "carousel";
  return "article";
}

export function generateContent(format: PostFormat): GeneratedContent {
  const topic = pick(TOPICS);
  const title = fill(pick(TITLE_TEMPLATES), topic);

  if (format === "article") {
    const content = [
      fill(pick(ARTICLE_INTROS), topic),
      fill(pick(ARTICLE_BODIES), topic),
      fill(pick(ARTICLE_CTAS), topic),
    ].join("\n\n");
    return { title, content, hashtag: topic.hashtag };
  }

  if (format === "image") {
    const content = fill(pick(IMAGE_CAPTIONS), topic) + ` ${topic.hashtag} #ProcessIT`;
    return { title, content, hashtag: topic.hashtag };
  }

  // carousel
  const slides: CarouselSlide[] = [
    { id: crypto.randomUUID(), caption: title },
    { id: crypto.randomUUID(), caption: capitalize(topic.painPoint) },
    { id: crypto.randomUUID(), caption: `Notre approche : ${topic.benefit}.` },
    { id: crypto.randomUUID(), caption: `Résultat : ${topic.stat}.` },
    { id: crypto.randomUUID(), caption: "Envie d'en discuter ? Contactez l'équipe Daïmo →" },
  ];
  const content = `Un carrousel pour explorer ${topic.name} et comment y remédier. ${topic.hashtag} #ProcessIT`;
  return { title, content, slides, hashtag: topic.hashtag };
}

export function buildGeneratedPost(date: string, time: string): Post {
  const format = pickWeightedFormat();
  const generated = generateContent(format);
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    format,
    title: generated.title,
    content: generated.content,
    slides: generated.slides,
    date,
    time,
    status: "draft",
    createdAt: now,
    updatedAt: now,
  };
}
