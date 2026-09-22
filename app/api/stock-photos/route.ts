import { NextRequest, NextResponse } from "next/server";
import { buildStockPhotoUrl } from "@/lib/stockPhoto";

export const runtime = "nodejs";

interface RequestBody {
  keywords: string[];
  count?: number;
  width?: number;
  height?: number;
  orientation?: "landscape" | "portrait" | "square";
}

interface Photo {
  url: string;
  alt: string;
}

interface PexelsPhoto {
  src: { large: string; original: string };
  alt?: string;
}

/**
 * Looks up real, relevant stock photos for the given keywords. Uses Pexels (real
 * keyword search, needs a free PEXELS_API_KEY) when configured; otherwise falls
 * back to LoremFlickr (no key needed, but only loosely tag-matched).
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
  const query = keywords.length > 0 ? keywords.join(" ") : "business technology";

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
