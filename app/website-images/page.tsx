"use client";

import Link from "next/link";
import { useState } from "react";
import { DaimoMark } from "@/components/Logo";
import { extractKeywords } from "@/lib/stockPhoto";
import { fetchStockPhotos, StockPhoto } from "@/lib/fetchStockPhotos";

type Aspect = "wide" | "square" | "portrait";

const ASPECTS: Record<Aspect, { label: string; width: number; height: number; orientation: "landscape" | "square" | "portrait" }> = {
  wide: { label: "Bannière large (1600×900)", width: 1600, height: 900, orientation: "landscape" },
  square: { label: "Carré (1200×1200)", width: 1200, height: 1200, orientation: "square" },
  portrait: { label: "Portrait (900×1200)", width: 900, height: 1200, orientation: "portrait" },
};

export default function WebsiteImages() {
  const [text, setText] = useState("");
  const [keywordsInput, setKeywordsInput] = useState("");
  const [aspect, setAspect] = useState<Aspect>("wide");
  const [photos, setPhotos] = useState<StockPhoto[]>([]);
  const [source, setSource] = useState<"pexels" | "loremflickr" | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function currentKeywords(): string[] {
    const typed = keywordsInput
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);
    return typed.length > 0 ? typed : extractKeywords(text);
  }

  function handleExtract() {
    setKeywordsInput(extractKeywords(text).join(", "));
  }

  async function generate() {
    setGenerating(true);
    setError(null);
    try {
      const keywords = currentKeywords();
      const { width, height, orientation } = ASPECTS[aspect];
      const result = await fetchStockPhotos(keywords, 6, width, height, orientation);
      if (result.ok && result.photos) {
        setPhotos(result.photos);
        setSource(result.source ?? null);
      } else {
        setError(result.error ?? "Échec de la recherche de photos.");
      }
    } finally {
      setGenerating(false);
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="flex items-start gap-3">
          <DaimoMark className="h-9 w-auto mt-1 shrink-0" />
          <div>
            <h1 className="font-heading text-2xl md:text-3xl font-bold text-daimo-blue">
              Images pour le site web
            </h1>
            <p className="mt-1 text-sm text-daimo-gray">
              Trouvez une photo libre de droits en lien avec un texte, pour une page de votre site
              (ex. la page « Services IA »). Outil indépendant du calendrier LinkedIn.
            </p>
          </div>
        </div>

        <Link href="/" className="inline-block text-sm font-medium text-daimo-blue hover:underline">
          ← Retour au calendrier
        </Link>

        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Décrivez le sujet de la page
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              placeholder="Ex : Notre offre de services IA aide les entreprises à automatiser leurs processus grâce à l'intelligence artificielle, avec un accompagnement sur mesure…"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-daimo-blue focus:outline-none focus:ring-1 focus:ring-daimo-blue"
            />
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">
                Mots-clés utilisés pour la recherche (modifiables)
              </label>
              <button onClick={handleExtract} className="text-xs font-medium text-daimo-blue hover:underline">
                🔍 Extraire du texte
              </button>
            </div>
            <input
              value={keywordsInput}
              onChange={(e) => setKeywordsInput(e.target.value)}
              placeholder="ex : intelligence artificielle, automatisation, technologie"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-daimo-blue focus:outline-none focus:ring-1 focus:ring-daimo-blue"
            />
            <p className="mt-1 text-xs text-slate-400">
              Ce moteur gratuit cherche par mots-clés (pas de vraie IA) : mieux vaut des mots-clés en
              anglais et concrets (ex. « robot, technology, office ») que des phrases abstraites.
            </p>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Format
            </label>
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(ASPECTS) as Aspect[]).map((a) => (
                <button
                  key={a}
                  onClick={() => setAspect(a)}
                  className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
                    aspect === a
                      ? "border-daimo-blue bg-daimo-blue/10 text-daimo-blue"
                      : "border-slate-200 text-slate-500 hover:border-daimo-blue/30"
                  }`}
                >
                  {ASPECTS[a].label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={generate}
            disabled={generating}
            className="rounded-full bg-daimo-blue px-4 py-2 text-sm font-medium text-white hover:bg-daimo-blue/90 disabled:cursor-wait disabled:opacity-70"
          >
            {generating ? "⏳ Recherche…" : "🖼️ Proposer des photos"}
          </button>
          {error && <p className="text-xs text-daimo-pink">{error}</p>}
        </div>

        {photos.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-700">Résultats</p>
              <button onClick={generate} className="text-xs font-medium text-daimo-blue hover:underline">
                🔄 Proposer d&apos;autres photos
              </button>
            </div>
            {source === "loremflickr" && (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                Résultats via le moteur gratuit de secours (mots-clés approximatifs). Pour des
                résultats vraiment pertinents, configurez une clé Pexels (PEXELS_API_KEY, gratuite,
                sans carte bancaire) sur Vercel — voir plus bas.
              </p>
            )}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {photos.map((photo, i) => (
                <div key={i} className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.url} alt={photo.alt} className="aspect-square w-full object-cover" />
                  <a
                    href={photo.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block px-2 py-1.5 text-center text-xs font-medium text-daimo-blue hover:underline"
                  >
                    Ouvrir / télécharger →
                  </a>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-400">
              Photos libres de droits, gratuites, sourcées automatiquement. Ouvrez une image dans un
              nouvel onglet puis enregistrez-la (clic droit → « Enregistrer l&apos;image ») pour
              l&apos;utiliser sur votre site.
            </p>
          </div>
        )}

        <div className="rounded-xl border border-slate-200 bg-white p-5 text-xs text-slate-500 space-y-1">
          <p className="font-medium text-slate-700">Pour des photos vraiment pertinentes (recommandé)</p>
          <p>
            Créez un compte gratuit sur pexels.com/api (sans carte bancaire), copiez la clé API, puis
            sur Vercel : Project Settings → Environment Variables → ajoutez <code>PEXELS_API_KEY</code>{" "}
            avec cette clé, et redéployez. Sans cette clé, l&apos;outil utilise un moteur de secours
            gratuit mais moins précis.
          </p>
        </div>
      </div>
    </main>
  );
}
