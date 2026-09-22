import { NextRequest, NextResponse } from "next/server";
import { buildStockPhotoUrl } from "@/lib/stockPhoto";

export const runtime = "nodejs";

interface RequestBody {
  keywords: string[];
  count?: number;
  width?: number;
  height?: number;
  orientation?: "landscape" | "portrait" | "square";
  style?: "photo" | "illustration";
}

interface Photo {
  url: string;
  alt: string;
}

interface PexelsPhoto {
  src: { large: string; original: string };
  alt?: string;
}

interface PixabayHit {
  largeImageURL: string;
  webformatURL: string;
  tags: string;
}

const PIXABAY_ORIENTATION: Record<"landscape" | "portrait" | "square", "horizontal" | "vertical" | "all"> = {
  landscape: "horizontal",
  portrait: "vertical",
  square: "all",
};

/**
 * Looks up real, relevant stock visuals for the given keywords.
 * "photo" style: Pexels (real keyword search, needs a free PEXELS_API_KEY) when
 * configured, otherwise LoremFlickr (no key needed, only loosely tag-matched).
 * "illustration" style: Pixabay (needs a free PIXABAY_API_KEY) — no keyless
 * fallback exists for illustrations/vectors, so this style requires the key.
 */
export async function POST(req: NextRequest) {
  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const keywords = (body.keywords ?? []).filter(Boolean);
  const count = body.count ?? 6;
  const width = body.width ?? 1600;
  const height = body.height ?? 900;
  const orientation = body.orientation ?? "landscape";
  const style = body.style ?? "photo";
  const query = keywords.length > 0 ? keywords.join(" ") : "business technology";

  if (style === "illustration") {
    const pixabayKey = process.env.PIXABAY_API_KEY;
    if (!pixabayKey) {
      return NextResponse.json(
        { error: "Les illustrations nécessitent une clé Pixabay (PIXABAY_API_KEY) configurée sur Vercel." },
        { status: 501 }
      );
    }
    try {
      const res = await fetch(
        `https://pixabay.com/api/?key=${pixabayKey}&q=${encodeURIComponent(query)}&image_type=illustration&per_page=${Math.max(count, 3)}&orientation=${PIXABAY_ORIENTATION[orientation]}`
      );
      if (res.ok) {
        const data = (await res.json()) as { hits?: PixabayHit[] };
        const photos: Photo[] = (data.hits ?? [])
          .slice(0, count)
          .map((h) => ({ url: h.largeImageURL || h.webformatURL, alt: h.tags || query }));
        if (photos.length > 0) {
          return NextResponse.json({ ok: true, source: "pixabay", photos });
        }
        return NextResponse.json({ error: "Aucune illustration trouvée pour ces mots-clés." }, { status: 404 });
      }
      console.error("Pixabay error:", res.status, await res.text().catch(() => ""));
      return NextResponse.json({ error: "Échec de la recherche d'illustrations." }, { status: 502 });
    } catch (err) {
      console.error("Pixabay fetch failed:", err);
      return NextResponse.json({ error: "Échec de la recherche d'illustrations." }, { status: 502 });
    }
  }

  const apiKey = process.env.PEXELS_API_KEY;
  if (apiKey) {
    try {
      const res = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${count}&orientation=${orientation}`,
        { headers: { Authorization: apiKey } }
      );
      if (res.ok) {
        const data = (await res.json()) as { photos?: PexelsPhoto[] };
        const photos: Photo[] = (data.photos ?? []).map((p) => ({ url: p.src.large, alt: query }));
        if (photos.length > 0) {
          return NextResponse.json({ ok: true, source: "pexels", photos });
        }
      } else {
        console.error("Pexels error:", res.status, await res.text().catch(() => ""));
      }
    } catch (err) {
      console.error("Pexels fetch failed:", err);
    }
  }

  const photos: Photo[] = Array.from({ length: count }, () => ({
    url: buildStockPhotoUrl(keywords, width, height),
    alt: query,
  }));
  return NextResponse.json({ ok: true, source: "loremflickr", photos });
}
