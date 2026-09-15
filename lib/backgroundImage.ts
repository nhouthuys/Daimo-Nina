const GRADIENTS: [string, string, string][] = [
  ["#394e9d", "#3fb5cc", "#65b22e"], // primary brand gradient
  ["#662d91", "#76818e", "#ec008c"], // secondary brand gradient
  ["#394e9d", "#662d91", "#ec008c"],
  ["#3fb5cc", "#65b22e", "#394e9d"],
];

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Draws the Daïmo "play" symbol (two stacked triangles) at (x, y) with the given size. */
function drawMark(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, rotation: number) {
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

/**
 * Generates an on-brand background image (gradient + scattered Daïmo mark motif)
 * entirely client-side via <canvas>, and returns it as a JPEG data URL.
 * A fresh random image is produced on every call — nothing is fetched or hardcoded.
 */
export function generateBackgroundImage(width = 1200, height = 630): string {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  const [c1, c2, c3] = GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)];
  const angle = Math.random() * Math.PI * 2;
  const x0 = width / 2 + Math.cos(angle) * width;
  const y0 = height / 2 + Math.sin(angle) * height;
  const x1 = width / 2 - Math.cos(angle) * width;
  const y1 = height / 2 - Math.sin(angle) * height;

  const gradient = ctx.createLinearGradient(x0, y0, x1, y1);
  gradient.addColorStop(0, c1);
  gradient.addColorStop(0.55, c2);
  gradient.addColorStop(1, c3);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // subtle dot grid, echoing the Daïmo brand charter background
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  const spacing = 34;
  for (let gx = spacing / 2; gx < width; gx += spacing) {
    for (let gy = spacing / 2; gy < height; gy += spacing) {
      ctx.beginPath();
      ctx.arc(gx, gy, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // scattered outline marks (repetitive motif, per the charter's "motif répétitif")
  const markCount = 10 + Math.floor(Math.random() * 6);
  for (let i = 0; i < markCount; i++) {
    const size = 90 + Math.random() * 160;
    const x = Math.random() * width;
    const y = Math.random() * height;
    const rotation = Math.random() * Math.PI * 2;
    drawMark(ctx, x, y, size, hexToRgba("#ffffff", 0.08 + Math.random() * 0.1), rotation);
  }

  // soft dark vignette at the bottom so overlaid text stays legible
  const vignette = ctx.createLinearGradient(0, height * 0.45, 0, height);
  vignette.addColorStop(0, "rgba(15, 23, 42, 0)");
  vignette.addColorStop(1, "rgba(15, 23, 42, 0.45)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);

  return canvas.toDataURL("image/jpeg", 0.85);
}
