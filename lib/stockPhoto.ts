const STOPWORDS = new Set([
  // French
  "le", "la", "les", "un", "une", "des", "du", "de", "et", "ou", "pour", "dans", "sur", "avec", "sans", "à",
  "au", "aux", "est", "sont", "être", "nos", "notre", "vos", "votre", "leur", "leurs", "ce", "cette", "ces",
  "qui", "que", "quoi", "comme", "plus", "très", "aussi", "tout", "tous", "toute", "toutes", "par", "son",
  "sa", "ses", "il", "elle", "ils", "elles", "nous", "vous", "je", "tu", "on", "pas", "ne", "mais", "donc",
  "afin", "ainsi", "cela", "cette", "leurs", "vers", "chez", "entre",
  // English
  "the", "a", "an", "and", "or", "for", "in", "on", "with", "without", "to", "of", "is", "are", "be", "our",
  "your", "their", "this", "that", "these", "those", "who", "what", "as", "more", "very", "also", "all", "by",
  "at", "it", "we", "you", "i", "will", "can", "from", "into", "about",
]);

// The photo service matches English Flickr tags, but users here write in French — translate the
// common business/tech vocabulary so extracted keywords actually find relevant photos. Phrases are
// checked before the text is split into single words; anything not listed here is kept as-is (many
// French tech words already work, e.g. "technologie", "robot").
const FR_EN_PHRASES: [RegExp, string][] = [
  [/intelligence artificielle/g, "artificial intelligence"],
  [/apprentissage automatique/g, "machine learning"],
];

const FR_EN_WORDS: Record<string, string> = {
  entreprise: "business",
  entreprises: "business",
  société: "company",
  équipe: "team",
  bureau: "office",
  ordinateur: "computer",
  sécurité: "security",
  données: "data",
  numérique: "digital",
  formation: "training",
  gestion: "management",
  processus: "process",
  solution: "solution",
  service: "service",
  services: "service",
  projet: "project",
  réseau: "network",
  logiciel: "software",
  site: "website",
  croissance: "growth",
  développement: "development",
  analyse: "analytics",
  client: "client",
  clients: "client",
  automatisation: "automation",
  accompagnement: "consulting",
  consultant: "consultant",
  consultants: "consultant",
  informatique: "technology",
  innovation: "innovation",
  stratégie: "strategy",
  robot: "robot",
  cloud: "cloud",
};

/** Picks the most frequent, meaningful words from free text, for use as stock-photo search keywords. */
export function extractKeywords(text: string, max = 4): string[] {
  let normalized = text.toLowerCase();
  for (const [phrase, translation] of FR_EN_PHRASES) {
    normalized = normalized.replace(phrase, translation);
  }

  const words = normalized
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !STOPWORDS.has(w))
    .map((w) => FR_EN_WORDS[w] ?? w);

  const counts = new Map<string, number>();
  for (const w of words) counts.set(w, (counts.get(w) ?? 0) + 1);

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || b[0].length - a[0].length)
    .slice(0, max)
    .map(([w]) => w);
}

/** Builds a URL for a real, royalty-free stock photo matching the given keywords, from a keyless photo service. */
export function buildStockPhotoUrl(keywords: string[], width: number, height: number, seed?: number): string {
  const kw = keywords.length > 0 ? keywords.join(",") : "business,technology";
  const s = seed ?? Math.floor(Math.random() * 100000);
  return `https://loremflickr.com/${width}/${height}/${encodeURIComponent(kw)}?random=${s}`;
}
