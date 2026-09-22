export interface StockPhoto {
  url: string;
  alt: string;
}

export interface FetchStockPhotosResult {
  ok: boolean;
  source?: "pexels" | "loremflickr" | "pixabay";
  photos?: StockPhoto[];
  error?: string;
}

export async function fetchStockPhotos(
  keywords: string[],
  count: number,
  width: number,
  height: number,
  orientation: "landscape" | "portrait" | "square",
  style: "photo" | "illustration" = "photo"
): Promise<FetchStockPhotosResult> {
  try {
    const res = await fetch("/api/stock-photos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keywords, count, width, height, orientation, style }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, error: data.error || "Échec de la recherche." };
    }
    return { ok: true, source: data.source, photos: data.photos };
  } catch {
    return { ok: false, error: "Impossible de contacter le serveur." };
  }
}
