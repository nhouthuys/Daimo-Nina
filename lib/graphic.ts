import { GraphicCategory, VisualStyle } from "./types";

const FONT_STACK = "system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif";

interface Theme {
  gradient: [string, string];
  badgeLabel: string;
  accent: string;
  /** Keywords used to fetch a matching real photo for the "photo" visual style. */
  photoKeywords: string;
}

const THEMES: Record<GraphicCategory, Theme> = {
  tip: {
    gradient: ["#394e9d", "#3fb5cc"],
    badgeLabel: "ASTUCE PROCESS",
    accent: "#3fb5cc",
    photoKeywords: "office,team,business,computer",
  },
  client: {
    gradient: ["#394e9d", "#65b22e"],
    badgeLabel: "CAS CLIENT",
    accent: "#65b22e",
    photoKeywords: "meeting,handshake,business,office",
  },
  hiring: {
    gradient: ["#662d91", "#ec008c"],
    badgeLabel: "ON RECRUTE",
    accent: "#ec008c",
    photoKeywords: "team,office,people,coworkers",
  },
};

// Real Daïmo brand assets extracted directly from the official graphic charter (not redrawn).
const MARK_WHITE_SRC = "/daimo-mark-white.png"; // symbol only, white silhouette — for the decorative background bleed
const LOCKUP_WHITE_SRC = "/daimo-logo-white.png"; // symbol + wordmark + baseline, white — for the footer, per the charter's "on colored background" rule

const imageCache = new Map<string, Promise<HTMLImageElement>>();

function loadImage(src: string, crossOrigin?: "anonymous"): Promise<HTMLImageElement> {
  let cached = imageCache.get(src);
  if (!cached) {
    cached = new Promise((resolve, reject) => {
      const img = new window.Image();
      if (crossOrigin) img.crossOrigin = crossOrigin;
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
    imageCache.set(src, cached);
  }
  return cached;
}

/**
 * Builds a URL for a real, royalty-free stock photo matching the category, from a
 * keyless photo service (no API key to configure). A random seed is appended so a
 * different photo comes back each time instead of always the same cached one.
 */
function buildStockPhotoUrl(category: GraphicCategory, width: number, height: number): string {
  const seed = Math.floor(Math.random() * 100000);
  const keywords = THEMES[category].photoKeywords;
  return `https://loremflickr.com/${width}/${height}/${keywords}?random=${seed}`;
}

/** Draws `img` covering the full `w`×`h` box, cropping overflow like CSS `object-fit: cover`. */
function drawImageCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, w: number, h: number) {
  const imgRatio = img.width / img.height;
  const boxRatio = w / h;
  let sx = 0;
  let sy = 0;
  let sw = img.width;
  let sh = img.height;
  if (imgRatio > boxRatio) {
    sw = img.height * boxRatio;
    sx = (img.width - sw) / 2;
  } else {
    sh = img.width / boxRatio;
    sy = (img.height - sh) / 2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const attempt = current ? `${current} ${word}` : word;
    if (ctx.measureText(attempt).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = attempt;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function fitHeadline(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
  startSize: number,
  minSize: number,
  weight = 800
): { fontSize: number; lines: string[]; lineHeight: number } {
  let fontSize = startSize;
  while (fontSize >= minSize) {
    ctx.font = `${weight} ${fontSize}px ${FONT_STACK}`;
    const lines = wrapText(ctx, text, maxWidth);
    if (lines.length <= maxLines) {
      return { fontSize, lines, lineHeight: fontSize * 1.2 };
    }
    fontSize -= 4;
  }
  ctx.font = `${weight} ${minSize}px ${FONT_STACK}`;
  const lines = wrapText(ctx, text, maxWidth).slice(0, maxLines);
  return { fontSize: minSize, lines, lineHeight: minSize * 1.2 };
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export interface GraphicOptions {
  category: GraphicCategory;
  headline: string;
  /** Short punchy stat/CTA line shown in the highlight pill. Omit to hide the pill. */
  highlight?: string;
  width?: number;
  height?: number;
  /** When set, renders the square "carousel slide" layout with a "n / total" progress badge instead of the category badge. */
  slideIndex?: number;
  slideCount?: number;
  /** "template" (default): illustrated brand gradient. "photo": a real stock photo with people as the background. */
  visual?: VisualStyle;
}

/**
 * Renders a full, ready-to-post LinkedIn graphic entirely client-side via <canvas>:
 * either the on-brand gradient template, or a real photo background, plus the real
 * Daïmo mark/lockup images, a category badge, the real headline text and an optional
 * highlight pill. Returns a JPEG data URL.
 */
export async function generatePostGraphic(opts: GraphicOptions): Promise<string> {
  const isSlide = opts.slideIndex != null && opts.slideCount != null;
  const width = opts.width ?? (isSlide ? 1080 : 1200);
  const height = opts.height ?? (isSlide ? 1080 : 630);
  const theme = THEMES[opts.category];
  const visual = opts.visual ?? "template";

  const [markImg, lockupImg] = await Promise.all([loadImage(MARK_WHITE_SRC), loadImage(LOCKUP_WHITE_SRC)]);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  if (visual === "photo") {
    try {
      const photoUrl = buildStockPhotoUrl(opts.category, width, height);
      const photoImg = await loadImage(photoUrl, "anonymous");
      // 1. Real photo, cropped to fill the canvas.
      drawImageCover(ctx, photoImg, width, height);
      // 2. Stronger dark scrim — photos need more contrast than a flat gradient for the text to read.
      ctx.fillStyle = "rgba(6, 10, 24, 0.5)";
      ctx.fillRect(0, 0, width, height);
    } catch {
      // The stock photo service is unreachable or blocked its cross-origin canvas read — fall back to the template.
      return generatePostGraphic({ ...opts, visual: "template" });
    }
  } else {
    // 1. Brand gradient background.
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, theme.gradient[0]);
    gradient.addColorStop(1, theme.gradient[1]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // 2. The real Daïmo mark, large and restrained, bleeding off the top-right corner.
    const bleedH = height * 1.55;
    const bleedW = bleedH * (markImg.width / markImg.height);
    ctx.save();
    ctx.globalAlpha = 0.12;
    ctx.translate(width * 0.86, height * -0.02);
    ctx.rotate(-0.2);
    ctx.drawImage(markImg, -bleedW / 2, -bleedH / 2, bleedW, bleedH);
    ctx.restore();

    // 3. Dark scrim so white text stays legible on any part of the gradient.
    ctx.fillStyle = "rgba(8, 12, 28, 0.32)";
    ctx.fillRect(0, 0, width, height);
  }

  const padding = Math.round(width * 0.065);
  ctx.textBaseline = "top";

  // 4. Top badge: category label, or "n / total" progress for a carousel slide.
  const badgeText = isSlide ? `${opts.slideIndex} / ${opts.slideCount}` : theme.badgeLabel;
  ctx.font = `700 16px ${FONT_STACK}`;
  const badgeTextWidth = ctx.measureText(badgeText).width;
  const badgePadX = 16;
  const badgeHeight = 34;
  const badgeWidth = badgeTextWidth + badgePadX * 2;
  roundRect(ctx, padding, padding, badgeWidth, badgeHeight, badgeHeight / 2);
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(255,255,255,0.45)";
  ctx.stroke();
  ctx.fillStyle = "#ffffff";
  ctx.fillText(badgeText, padding + badgePadX, padding + (badgeHeight - 16) / 2);

  // 5. Headline — the real generated title / slide caption, wrapped to fit.
  const contentTop = padding + badgeHeight + (isSlide ? height * 0.08 : 36);
  const maxWidth = isSlide ? width - padding * 2 : width * 0.6;
  const maxLines = isSlide ? 5 : 4;
  const { lines, lineHeight, fontSize } = fitHeadline(
    ctx,
    opts.headline,
    maxWidth,
    maxLines,
    isSlide ? 58 : 50,
    isSlide ? 34 : 28
  );

  const headlineBlockHeight = lines.length * lineHeight;
  const headlineTop = isSlide ? (height - headlineBlockHeight) / 2 - height * 0.06 : contentTop;

  ctx.font = `800 ${fontSize}px ${FONT_STACK}`;
  ctx.fillStyle = "#ffffff";
  const textX = isSlide ? width / 2 : padding;
  ctx.textAlign = isSlide ? "center" : "left";
  lines.forEach((line, i) => {
    ctx.fillText(line, textX, headlineTop + i * lineHeight);
  });
  ctx.textAlign = "left";

  // 6. Highlight pill with the stat / CTA line.
  if (opts.highlight) {
    const icon = opts.category === "hiring" ? "📩" : "📈";
    const pillText = `${icon}  ${opts.highlight}`;
    ctx.font = `700 22px ${FONT_STACK}`;
    const pillTextWidth = ctx.measureText(pillText).width;
    const pillPadX = 22;
    const pillHeight = 52;
    const pillWidth = Math.min(pillTextWidth + pillPadX * 2, width - padding * 2);
    const pillY = headlineTop + headlineBlockHeight + (isSlide ? 36 : 30);
    const pillX = isSlide ? (width - pillWidth) / 2 : padding;
    roundRect(ctx, pillX, pillY, pillWidth, pillHeight, pillHeight / 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.fillStyle = theme.accent;
    ctx.textAlign = isSlide ? "center" : "left";
    ctx.fillText(pillText, isSlide ? pillX + pillWidth / 2 : pillX + pillPadX, pillY + (pillHeight - 22) / 2 - 2);
    ctx.textAlign = "left";
  }

  // 7. The real Daïmo lockup (symbol + wordmark + baseline), bottom-left, on every graphic.
  const lockupH = height * 0.15;
  const lockupW = lockupH * (lockupImg.width / lockupImg.height);
  ctx.drawImage(lockupImg, padding, height - padding - lockupH, lockupW, lockupH);

  if (!isSlide) {
    ctx.font = `600 15px ${FONT_STACK}`;
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    const site = "daimo.be";
    const siteWidth = ctx.measureText(site).width;
    ctx.fillText(site, width - padding - siteWidth, height - padding + lockupH - 21);
  }

  try {
    return canvas.toDataURL("image/jpeg", 0.9);
  } catch {
    // A cross-origin photo without permissive CORS headers taints the canvas — fall back to the template.
    if (visual === "photo") return generatePostGraphic({ ...opts, visual: "template" });
    throw new Error("Impossible de générer l'image du post.");
  }
}
