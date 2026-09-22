"use client";

import Link from "next/link";
import { useState } from "react";
import { DaimoMark } from "@/components/Logo";
import { extractKeywords, buildStockPhotoUrl } from "@/lib/stockPhoto";

type Aspect = "wide" | "square" | "portrait";

const ASPECTS: Record<Aspect, { label: string; width: number; height: number }> = {
  wide: { label: "Bannière large (1600×900)", width: 1600, height: 900 },
  square: { label: "Carré (1200×1200)", width: 1200, height: 1200 },
  portrait: { label: "Portrait (900×1200)", width: 900, height: 1200 },
};

export default function WebsiteImages() {
  const [text, setText] = useState("");
  const [keywordsInput, setKeywordsInput] = useState("");
  const [aspect, setAspect] = useState<Aspect>("wide");
  const [photos, setPhotos] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);

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

  function generate() {
    setGenerating(true);
    try {
      const keywords = currentKeywords();
      const { width, height } = ASPECTS[aspect];
      const batch = Array.from({ length: 6 }, () => buildStockPhotoUrl(keywords, width, height));
      setPhotos(batch);
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
        </div>

        {photos.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-700">Résultats</p>
              <button onClick={generate} className="text-xs font-medium text-daimo-blue hover:underline">
                🔄 Proposer d&apos;autres photos
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {photos.map((url, i) => (
                <div key={i} className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`Proposition photo ${i + 1}`} className="aspect-square w-full object-cover" />
                  <a
                    href={url}
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
      </div>
    </main>
  );
}
