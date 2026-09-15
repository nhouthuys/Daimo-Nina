import { GraphicCategory } from "./types";

const FONT_STACK = "system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif";

interface Theme {
  gradient: [string, string];
  badgeLabel: string;
  accent: string;
}

const THEMES: Record<GraphicCategory, Theme> = {
  tip: { gradient: ["#394e9d", "#3fb5cc"], badgeLabel: "ASTUCE PROCESS", accent: "#3fb5cc" },
  client: { gradient: ["#394e9d", "#65b22e"], badgeLabel: "CAS CLIENT", accent: "#65b22e" },
  hiring: { gradient: ["#662d91", "#ec008c"], badgeLabel: "ON RECRUTE", accent: "#ec008c" },
};

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Draws the Daïmo "play" mark (two stacked triangles) centered at (x, y). */
function drawMark(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, rotation = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-size * 0.3, -size * 0.5);
  ctx.lineTo(-size * 0.3, 0);
  ctx.lineTo(size * 0.1, -size * 0.25);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-size * 0.3, 0);
  ctx.lineTo(-size * 0.3, size * 0.5);
  ctx.lineTo(size * 0.5, 0);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
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

function drawFooter(ctx: CanvasRenderingContext2D, width: number, height: number, padding: number) {
  drawMark(ctx, padding + 12, height - padding - 2, 26, "#ffffff");
  ctx.font = `700 20px ${FONT_STACK}`;
  ctx.fillStyle = "#ffffff";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("DAÏMO", padding + 32, height - padding + 4);
  ctx.font = `600 12px ${FONT_STACK}`;
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.fillText("A L L I E D   T O   P R O C E S S   I T", padding + 32, height - padding + 20);
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
}

/**
 * Renders a full, ready-to-post LinkedIn graphic entirely client-side via <canvas>:
 * on-brand gradient, the Daïmo mark, a category badge, the real headline text and
 * an optional highlight pill. Returns a JPEG data URL. No network call, no external
 * image — every pixel is drawn here, so this scales to any number of topics/roles.
 */
export function generatePostGraphic(opts: GraphicOptions): string {
  const isSlide = opts.slideIndex != null && opts.slideCount != null;
  const width = opts.width ?? (isSlide ? 1080 : 1200);
  const height = opts.height ?? (isSlide ? 1080 : 630);
  const theme = THEMES[opts.category];

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  // 1. Brand gradient background.
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, theme.gradient[0]);
  gradient.addColorStop(1, theme.gradient[1]);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // 2. One large, restrained brand mark bleeding off the top-right corner.
  drawMark(ctx, width * 0.86, height * -0.02, height * 1.55, hexToRgba("#ffffff", 0.1), -0.2);

  // 3. Dark scrim so white text stays legible on any part of the gradient.
  ctx.fillStyle = "rgba(8, 12, 28, 0.32)";
  ctx.fillRect(0, 0, width, height);

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
  const headlineTop = isSlide ? (height - headlineBlockHeight) / 2 - height * 0.04 : contentTop;

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

  // 7. Small Daïmo footer wordmark, bottom-left, on every graphic.
  drawFooter(ctx, width, height, padding);

  if (!isSlide) {
    ctx.font = `600 15px ${FONT_STACK}`;
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    const site = "daimo.be";
    const siteWidth = ctx.measureText(site).width;
    ctx.fillText(site, width - padding - siteWidth, height - padding + 6);
  }

  return canvas.toDataURL("image/jpeg", 0.9);
}
