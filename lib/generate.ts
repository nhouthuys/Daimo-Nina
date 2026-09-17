import { CarouselSlide, GraphicCategory, PostFormat } from "./types";

interface Topic {
  name: string; // ex: "la gestion des factures"
  painPoint: string; // ex: "Des heures perdues chaque semaine en saisie manuelle."
  benefit: string; // ex: "un traitement automatisé en quelques clics"
  stat: string; // full sentence, used inside body copy — ex: "jusqu'à 70% de temps gagné sur le traitement"
  statShort: string; // punchy standalone phrase for the graphic's highlight pill — ex: "-70% de temps de traitement"
  hashtag: string;
}

const TOPICS: Topic[] = [
  {
    name: "la gestion des factures",
    painPoint: "Des heures perdues chaque semaine en saisie manuelle.",
    benefit: "un traitement automatisé en quelques clics",
    stat: "jusqu'à 70% de temps gagné sur le traitement",
    statShort: "70% de temps gagné",
    hashtag: "#Facturation",
  },
  {
    name: "l'onboarding des nouveaux clients",
    painPoint: "Des informations éparpillées entre emails, fichiers Excel et notes volantes.",
    benefit: "un parcours fluide et traçable de bout en bout",
    stat: "une mise en route deux fois plus rapide",
    statShort: "2x plus rapide",
    hashtag: "#OnboardingClient",
  },
  {
    name: "le suivi des stocks",
    painPoint: "Des ruptures ou des surstocks difficiles à anticiper.",
    benefit: "une visibilité en temps réel sur tous vos flux",
    stat: "moins de 2% d'écarts de stock",
    statShort: "<2% d'écarts de stock",
    hashtag: "#SupplyChain",
  },
  {
    name: "la conformité RGPD",
    painPoint: "Des process manuels impossibles à auditer sereinement.",
    benefit: "une traçabilité automatique de chaque étape",
    stat: "des audits deux fois plus rapides",
    statShort: "Audits 2x plus rapides",
    hashtag: "#RGPD",
  },
  {
    name: "la relation client",
    painPoint: "Des demandes qui se perdent entre plusieurs outils.",
    benefit: "un point d'entrée unique, connecté à vos systèmes",
    stat: "un taux de satisfaction client en hausse de 30%",
    statShort: "+30% de satisfaction client",
    hashtag: "#RelationClient",
  },
  {
    name: "la gestion des congés et absences",
    painPoint: "Des tableaux partagés jamais à jour et des validations par email.",
    benefit: "une demande, une validation, une mise à jour automatique du planning",
    stat: "zéro double saisie pour les équipes RH",
    statShort: "Zéro double saisie RH",
    hashtag: "#RH",
  },
  {
    name: "le reporting mensuel",
    painPoint: "Des heures passées à copier des chiffres d'un outil à l'autre.",
    benefit: "des tableaux de bord générés automatiquement",
    stat: "un reporting prêt en quelques minutes au lieu de plusieurs jours",
    statShort: "Reporting en quelques minutes",
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

interface HiringRole {
  title: string; // ex: "Consultant·e Process IT"
  mission: string;
  profile: string;
  hashtag: string;
}

const HIRING_ROLES: HiringRole[] = [
  {
    title: "Consultant·e Process IT",
    mission: "accompagner nos clients dans la digitalisation de leurs process métier",
    profile: "vous aimez comprendre un métier en profondeur avant de proposer une solution",
    hashtag: "#Recrutement",
  },
  {
    title: "Développeur·se intégration",
    mission: "connecter les outils de nos clients entre eux pour fluidifier leurs flux",
    profile: "vous êtes à l'aise pour jongler entre plusieurs technologies et API",
    hashtag: "#DevJobs",
  },
  {
    title: "Chef·fe de projet digitalisation",
    mission: "piloter des projets de transformation de bout en bout, avec des équipes terrain",
    profile: "vous savez fédérer des équipes autour d'un objectif commun",
    hashtag: "#Recrutement",
  },
  {
    title: "Business Analyst",
    mission: "cartographier les process existants et identifier les meilleurs leviers d'automatisation",
    profile: "vous avez l'œil pour repérer ce qui ralentit une organisation",
    hashtag: "#BusinessAnalyst",
  },
];

const HIRING_TITLES = [
  "On recrute : {role}",
  "Daïmo agrandit son équipe : {role}",
  "{role}, ça vous parle ?",
  "Rejoignez l'équipe Daïmo en tant que {role}",
];

const HIRING_BODIES = [
  "Chez Daïmo, notre {role} va {mission}. On cherche quelqu'un pour qui {profile}.\n\nEnvie de nous rejoindre ? Envoyez-nous votre CV, on en discute. 📩",
  "Nouvelle opportunité chez Daïmo : {role}.\n\nVotre mission : {mission}. Le profil qu'on recherche : {profile}.\n\nCandidature ouverte dès maintenant. 🚀",
  "On cherche notre futur·e {role} pour {mission}.\n\nSi {profile}, ce poste est pour vous. Parlons-en ! 🤝",
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

function fillHiring(template: string, role: HiringRole): string {
  return template
    .replaceAll("{role}", role.title)
    .replaceAll("{mission}", role.mission)
    .replaceAll("{profile}", role.profile);
}

export interface GeneratedContent {
  title: string;
  content: string;
  slides?: CarouselSlide[];
  hashtag: string;
  category: GraphicCategory;
  /** Short, punchy line drawn on the generated graphic (stat, CTA…). */
  highlight: string;
}

export function pickWeightedFormat(): PostFormat {
  const roll = Math.random();
  if (roll < 0.55) return "image";
  if (roll < 0.85) return "carousel";
  return "article";
}

function pickCategory(): GraphicCategory {
  const roll = Math.random();
  if (roll < 0.25) return "hiring";
  return roll < 0.62 ? "tip" : "client";
}

function generateHiring(format: PostFormat): GeneratedContent {
  const role = pick(HIRING_ROLES);
  const title = fillHiring(pick(HIRING_TITLES), role);
  const highlight = "Postulez dès maintenant →";

  if (format === "carousel") {
    const slides: CarouselSlide[] = [
      { id: crypto.randomUUID(), caption: title },
      { id: crypto.randomUUID(), caption: `Votre mission : ${capitalize(role.mission)}.` },
      { id: crypto.randomUUID(), caption: `Le profil recherché : ${role.profile}.` },
      { id: crypto.randomUUID(), caption: "Une équipe à taille humaine, des projets concrets." },
      { id: crypto.randomUUID(), caption: "Envoyez-nous votre CV → on en discute ! 📩" },
    ];
    const content = `On recrute un·e ${role.title} chez Daïmo. ${role.hashtag} #Recrutement`;
    return { title, content, slides, hashtag: role.hashtag, category: "hiring", highlight };
  }

  const content =
    format === "article" ? fillHiring(pick(HIRING_BODIES), role) : `${title}. ${fillHiring(pick(HIRING_BODIES), role)}`;
  return { title, content, hashtag: role.hashtag, category: "hiring", highlight };
}

export function generateContent(format: PostFormat): GeneratedContent {
  const category = pickCategory();
  if (category === "hiring") return generateHiring(format);

  const topic = pick(TOPICS);
  const title = fill(pick(TITLE_TEMPLATES), topic);
  const highlight = topic.statShort;

  if (format === "article") {
    const content = [
      fill(pick(ARTICLE_INTROS), topic),
      fill(pick(ARTICLE_BODIES), topic),
      fill(pick(ARTICLE_CTAS), topic),
    ].join("\n\n");
    return { title, content, hashtag: topic.hashtag, category, highlight };
  }

  if (format === "image") {
    const content = fill(pick(IMAGE_CAPTIONS), topic) + ` ${topic.hashtag} #ProcessIT`;
    return { title, content, hashtag: topic.hashtag, category, highlight };
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
  return { title, content, slides, hashtag: topic.hashtag, category, highlight };
}

