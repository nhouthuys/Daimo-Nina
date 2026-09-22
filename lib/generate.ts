import { CarouselSlide, GraphicCategory, PostFormat } from "./types";

interface Topic {
  name: string; // ex: "invoice management"
  painPoint: string; // ex: "Hours lost every week on manual data entry."
  benefit: string; // ex: "automated processing in just a few clicks"
  stat: string; // full sentence, used inside body copy — ex: "up to 70% time saved on processing"
  statShort: string; // punchy standalone phrase for the graphic's highlight pill — ex: "70% time saved"
  hashtag: string;
}

const TOPICS: Topic[] = [
  {
    name: "invoice management",
    painPoint: "Hours lost every week on manual data entry.",
    benefit: "automated processing in just a few clicks",
    stat: "up to 70% time saved on processing",
    statShort: "70% time saved",
    hashtag: "#Invoicing",
  },
  {
    name: "new client onboarding",
    painPoint: "Information scattered across emails, spreadsheets, and sticky notes.",
    benefit: "a smooth, end-to-end traceable journey",
    stat: "onboarding twice as fast",
    statShort: "2x faster",
    hashtag: "#ClientOnboarding",
  },
  {
    name: "inventory tracking",
    painPoint: "Stockouts or overstocking that are hard to predict.",
    benefit: "real-time visibility across all your flows",
    stat: "less than 2% stock discrepancies",
    statShort: "<2% stock discrepancies",
    hashtag: "#SupplyChain",
  },
  {
    name: "GDPR compliance",
    painPoint: "Manual processes that are impossible to audit with confidence.",
    benefit: "automatic traceability at every step",
    stat: "audits twice as fast",
    statShort: "Audits 2x faster",
    hashtag: "#GDPR",
  },
  {
    name: "customer relationships",
    painPoint: "Requests that get lost between multiple tools.",
    benefit: "a single entry point, connected to your systems",
    stat: "customer satisfaction up 30%",
    statShort: "+30% customer satisfaction",
    hashtag: "#CustomerExperience",
  },
  {
    name: "leave and absence management",
    painPoint: "Shared spreadsheets that are never up to date and approvals stuck in email.",
    benefit: "one request, one approval, an automatically updated schedule",
    stat: "zero double data entry for HR teams",
    statShort: "Zero double entry for HR",
    hashtag: "#HR",
  },
  {
    name: "monthly reporting",
    painPoint: "Hours spent copying numbers from one tool to another.",
    benefit: "dashboards generated automatically",
    stat: "a report ready in minutes instead of days",
    statShort: "Reports ready in minutes",
    hashtag: "#DataDriven",
  },
];

const ARTICLE_INTROS = [
  "{painPoint} At Daïmo, we see this almost every week with our clients around {topic}.",
  "We hear it a lot: ‘we don't have time to digitize {topic}, we're already stretched thin.’ {painPoint}",
  "{painPoint} That's the starting point for a lot of our work on {topic}.",
];

const ARTICLE_BODIES = [
  "Our approach is simple: start from the friction on the ground, then put in place {benefit}. Result for our clients: {stat}.",
  "In practice, we map the existing process with the teams, then automate what can be automated to get {benefit}. Measured result for our clients: {stat}.",
  "We always start small: a pilot on a limited scope, to quickly reach {benefit}. For our latest clients, that meant {stat}.",
];

const ARTICLE_CTAS = [
  "Where do you stand on {topic}? Let's talk about it 👇",
  "Does this sound familiar? Let's talk.",
  "Is this relevant to you? The Daïmo team is happy to discuss it.",
];

const IMAGE_CAPTIONS = [
  "{topicCap}, without the manual workload. {benefitCap}. {statCap}. 💡",
  "We helped a client rethink {topic}. {benefitCap} → {stat}. 🚀",
  "{painPoint} Our answer: {benefitCap}. {statCap}. ⚙️",
];

const TITLE_TEMPLATES = [
  "{topicCap}: the hidden lever for your growth",
  "3 minutes to rethink {topic}",
  "{topicCap}, still a bottleneck for your teams?",
  "How we helped a client transform {topic}",
  "{topicCap}: {stat}",
];

interface HiringRole {
  title: string; // ex: "Process IT Consultant"
  mission: string;
  profile: string;
  hashtag: string;
}

const HIRING_ROLES: HiringRole[] = [
  {
    title: "Process IT Consultant",
    mission: "help our clients digitize their business processes",
    profile: "you like to fully understand a business before proposing a solution",
    hashtag: "#Hiring",
  },
  {
    title: "Integration Developer",
    mission: "connect our clients' tools together to streamline their workflows",
    profile: "you're comfortable juggling multiple technologies and APIs",
    hashtag: "#DevJobs",
  },
  {
    title: "Digitalization Project Manager",
    mission: "lead transformation projects end to end, working closely with teams on the ground",
    profile: "you know how to rally teams around a shared goal",
    hashtag: "#Hiring",
  },
  {
    title: "Business Analyst",
    mission: "map existing processes and identify the best automation opportunities",
    profile: "you have an eye for spotting what's slowing an organization down",
    hashtag: "#BusinessAnalyst",
  },
];

const HIRING_TITLES = [
  "We're hiring: {role}",
  "Daïmo is growing its team: {role}",
  "{role}, does that sound like you?",
  "Join the Daïmo team as {role}",
];

const HIRING_BODIES = [
  "At Daïmo, our {role} will {mission}. We're looking for someone who {profile}.\n\nWant to join us? Send us your CV, let's talk. 📩",
  "New opportunity at Daïmo: {role}.\n\nYour mission: {mission}. The profile we're looking for: {profile}.\n\nApplications open now. 🚀",
  "We're looking for our next {role} to {mission}.\n\nIf {profile}, this role is for you. Let's talk! 🤝",
];

// Generic phrasing used to build a post around a theme the user typed themselves —
// kept deliberately non-specific (no invented numbers or claims) since there is no
// AI backend here to actually research an arbitrary topic.
const GENERIC_PAIN_POINTS = [
  "This is a topic that comes up often with our clients.",
  "Many teams still struggle with this on a daily basis.",
  "It's rarely simple to manage without spending too much time on it.",
];

const GENERIC_BENEFITS = [
  "a tailored approach, built together with your teams",
  "hands-on support, step by step",
  "a simple solution you can roll out quickly",
];

const GENERIC_STATS = [
  "visible results within the first few weeks",
  "real time savings for the team",
  "a calmer, more organized day to day",
];

const GENERIC_STATS_SHORT = ["Visible results fast", "Real time savings", "A calmer day to day"];

// Templates for a user-typed theme, kept topic-nature-agnostic (no assumption that the
// theme is a workflow pain point to solve) since a theme can just as well be an
// announcement, an event or a celebration, not just a process to fix.
const CUSTOM_TITLE_TEMPLATES = ["{topicCap}", "An update on {topic}", "Let's talk about {topic}", "Spotlight: {topic}"];

const CUSTOM_INTROS = [
  "Today, we're taking a moment to talk about {topic}.",
  "Here's something we wanted to share with you: {topic}.",
  "We don't always take the time to share this kind of thing, but today felt right: {topic}.",
];

const CUSTOM_CONTEXTS = [
  "It's the kind of thing that reminds us why we do what we do — and it wouldn't be possible without the people around us, our team and the clients who put their trust in us every day.",
  "None of this happens by chance. It's built day after day, with a team that cares and clients who place their trust in us.",
  "We don't say this often enough, but it's worth saying: this is a team effort, built together with the people who make it possible.",
];

const CUSTOM_BODIES = [
  "At Daïmo, {benefit} — that's what guides us every day. {statCap}.",
  "What matters most to us here is {benefit}. {statCap}.",
  "If there's one thing we hold on to, it's {benefit}. {statCap}.",
];

const CUSTOM_CTAS = [
  "Want to know more, or just want to say hi? Let's talk 👇",
  "Thank you to everyone who's part of this, one way or another. 🙏",
  "We'd love to hear your thoughts on this — drop a comment or reach out. 🤝",
];

const CUSTOM_IMAGE_CAPTIONS = [
  "{topicCap}. {benefitCap}, and {stat}. It wouldn't mean much without the team and clients who make it possible. 💡",
  "A quick update from Daïmo: {topic}. {benefitCap}. {statCap}. 🚀",
  "{topicCap}: {benefitCap}. {statCap}. Thank you to everyone who's part of this story. ⚙️",
];

function slugifyHashtag(theme: string): string {
  const cleaned = theme
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3)
    .map(capitalize)
    .join("");
  return cleaned ? `#${cleaned}` : "#Daimo";
}

function buildCustomTopic(theme: string): Topic {
  return {
    name: theme,
    painPoint: pick(GENERIC_PAIN_POINTS),
    benefit: pick(GENERIC_BENEFITS),
    stat: pick(GENERIC_STATS),
    statShort: pick(GENERIC_STATS_SHORT),
    hashtag: slugifyHashtag(theme),
  };
}

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
    .replaceAll("{stat}", topic.stat)
    .replaceAll("{statCap}", capitalize(topic.stat));
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
  const highlight = "Apply today →";

  if (format === "carousel") {
    const slides: CarouselSlide[] = [
      { id: crypto.randomUUID(), caption: title },
      { id: crypto.randomUUID(), caption: `Your mission: ${capitalize(role.mission)}.` },
      { id: crypto.randomUUID(), caption: `The profile we're looking for: ${role.profile}.` },
      { id: crypto.randomUUID(), caption: "A close-knit team, real projects." },
      { id: crypto.randomUUID(), caption: "Send us your CV → let's talk! 📩" },
    ];
    const content = `We're hiring a ${role.title} at Daïmo. ${role.hashtag} #Hiring`;
    return { title, content, slides, hashtag: role.hashtag, category: "hiring", highlight };
  }

  const content =
    format === "article" ? fillHiring(pick(HIRING_BODIES), role) : `${title}. ${fillHiring(pick(HIRING_BODIES), role)}`;
  return { title, content, hashtag: role.hashtag, category: "hiring", highlight };
}

function generateFromTopic(format: PostFormat, topic: Topic, category: GraphicCategory): GeneratedContent {
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
    { id: crypto.randomUUID(), caption: `Our approach: ${topic.benefit}.` },
    { id: crypto.randomUUID(), caption: `Result: ${topic.stat}.` },
    { id: crypto.randomUUID(), caption: "Want to talk about it? Contact the Daïmo team →" },
  ];
  const content = `A carousel exploring ${topic.name} and how to fix it. ${topic.hashtag} #ProcessIT`;
  return { title, content, slides, hashtag: topic.hashtag, category, highlight };
}

function generateFromCustomTheme(format: PostFormat, theme: string, category: GraphicCategory): GeneratedContent {
  const topic = buildCustomTopic(theme);
  const title = fill(pick(CUSTOM_TITLE_TEMPLATES), topic);
  const highlight = topic.statShort;

  if (format === "article") {
    const content = [
      fill(pick(CUSTOM_INTROS), topic),
      pick(CUSTOM_CONTEXTS),
      fill(pick(CUSTOM_BODIES), topic),
      fill(pick(CUSTOM_CTAS), topic),
    ].join("\n\n");
    return { title, content, hashtag: topic.hashtag, category, highlight };
  }

  if (format === "image") {
    const content = fill(pick(CUSTOM_IMAGE_CAPTIONS), topic) + ` ${topic.hashtag}`;
    return { title, content, hashtag: topic.hashtag, category, highlight };
  }

  // carousel
  const slides: CarouselSlide[] = [
    { id: crypto.randomUUID(), caption: title },
    { id: crypto.randomUUID(), caption: capitalize(pick(CUSTOM_CONTEXTS)) },
    { id: crypto.randomUUID(), caption: `${capitalize(topic.benefit)}.` },
    { id: crypto.randomUUID(), caption: `${capitalize(topic.stat)}.` },
    { id: crypto.randomUUID(), caption: "Want to talk about it? Contact the Daïmo team →" },
  ];
  const content = [fill(pick(CUSTOM_INTROS), topic), pick(CUSTOM_CONTEXTS)].join("\n\n") + ` ${topic.hashtag}`;
  return { title, content, slides, hashtag: topic.hashtag, category, highlight };
}

/**
 * Builds the post content. When `customTheme` is provided, the post is built
 * around that exact theme (using generic, non-invented phrasing that doesn't
 * assume the theme is a workflow pain point, since there is no AI backend here
 * to research an arbitrary topic) instead of picking one of the built-in Daïmo
 * topics or hiring roles at random.
 */
export function generateContent(format: PostFormat, customTheme?: string): GeneratedContent {
  const theme = customTheme?.trim();
  if (theme) {
    const category: GraphicCategory = Math.random() < 0.5 ? "tip" : "client";
    return generateFromCustomTheme(format, theme, category);
  }

  const category = pickCategory();
  if (category === "hiring") return generateHiring(format);
  return generateFromTopic(format, pick(TOPICS), category);
}
