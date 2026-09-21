"use client";

import { useState } from "react";
import {
  CarouselSlide,
  FORMAT_LABELS,
  GRAPHIC_CATEGORY_LABELS,
  GraphicCategory,
  Post,
  PostFormat,
  PostStatus,
  VISUAL_STYLE_LABELS,
  VisualStyle,
} from "@/lib/types";
import { generatePostGraphic } from "@/lib/graphic";
import { Modal } from "./Modal";

function newSlide(): CarouselSlide {
  return { id: crypto.randomUUID(), caption: "" };
}

const DEFAULT_HIGHLIGHT: Record<GraphicCategory, string> = {
  tip: "Save time on your processes →",
  client: "Real results from our clients →",
  hiring: "Apply today →",
};

export function PostModal({
  initial,
  onSave,
  onDelete,
  onClose,
  onRegenerate,
}: {
  initial: Post;
  onSave: (post: Post) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
  onRegenerate?: () => void;
}) {
  const [format, setFormat] = useState<PostFormat>(initial.format);
  const [title, setTitle] = useState(initial.title);
  const [content, setContent] = useState(initial.content);
  const [imageUrl, setImageUrl] = useState(initial.imageUrl ?? "");
  const [slides, setSlides] = useState<CarouselSlide[]>(
    initial.slides && initial.slides.length > 0 ? initial.slides : [newSlide(), newSlide()]
  );
  const [graphicCategory, setGraphicCategory] = useState<GraphicCategory>(initial.graphicCategory ?? "tip");
  const [visualStyle, setVisualStyle] = useState<VisualStyle>(initial.visualStyle ?? "template");
  const [candidates, setCandidates] = useState<{ style: VisualStyle; url: string }[]>([]);
  const [proposing, setProposing] = useState(false);
  const [date, setDate] = useState(initial.date);
  const [time, setTime] = useState(initial.time);
  const [status, setStatus] = useState<PostStatus>(initial.status);
  const isEditing = initial.title !== "" || initial.content !== "";

  function handleSave() {
    if (!title.trim()) return;
    const now = new Date().toISOString();
    onSave({
      ...initial,
      format,
      title: title.trim(),
      content,
      imageUrl: format === "image" ? imageUrl : undefined,
      slides: format === "carousel" ? slides.filter((s) => s.caption.trim() !== "") : undefined,
      graphicCategory: format === "image" || format === "carousel" ? graphicCategory : undefined,
      visualStyle: format === "image" || format === "carousel" ? visualStyle : undefined,
      date,
      time,
      status,
      updatedAt: now,
    });
  }

  function updateSlide(id: string, caption: string) {
    setSlides((prev) => prev.map((s) => (s.id === id ? { ...s, caption } : s)));
  }

  async function regenerateSlideImage(id: string, caption: string) {
    const url = await generatePostGraphic({
      category: graphicCategory,
      headline: caption || "Your text here",
      slideIndex: slides.findIndex((s) => s.id === id) + 1,
      slideCount: slides.length,
      visual: visualStyle,
    });
    setSlides((prev) => prev.map((s) => (s.id === id ? { ...s, imageUrl: url } : s)));
  }

  async function proposeVisuals() {
    setProposing(true);
    try {
      const base = { category: graphicCategory, headline: title || "Your title here", highlight: DEFAULT_HIGHLIGHT[graphicCategory] };
      const [tpl, photoA, photoB] = await Promise.all([
        generatePostGraphic({ ...base, visual: "template" }),
        generatePostGraphic({ ...base, visual: "photo" }),
        generatePostGraphic({ ...base, visual: "photo" }),
      ]);
      const options: { style: VisualStyle; url: string }[] = [
        { style: "template", url: tpl },
        { style: "photo", url: photoA },
        { style: "photo", url: photoB },
      ];
      setCandidates(options);
      setImageUrl(options[0].url);
      setVisualStyle(options[0].style);
    } finally {
      setProposing(false);
    }
  }

  function pickCandidate(candidate: { style: VisualStyle; url: string }) {
    setImageUrl(candidate.url);
    setVisualStyle(candidate.style);
  }

  function categorySelector() {
    return (
      <div className="flex flex-wrap gap-1.5">
        {(Object.keys(GRAPHIC_CATEGORY_LABELS) as GraphicCategory[]).map((c) => (
          <button
            key={c}
            onClick={() => setGraphicCategory(c)}
            className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
              graphicCategory === c
                ? "border-daimo-blue bg-daimo-blue/10 text-daimo-blue"
                : "border-slate-200 text-slate-500 hover:border-daimo-blue/30"
            }`}
          >
            {GRAPHIC_CATEGORY_LABELS[c]}
          </button>
        ))}
      </div>
    );
  }

  function visualStyleSelector() {
    return (
      <div className="flex flex-wrap gap-1.5">
        {(Object.keys(VISUAL_STYLE_LABELS) as VisualStyle[]).map((v) => (
          <button
            key={v}
            onClick={() => setVisualStyle(v)}
            className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
              visualStyle === v
                ? "border-daimo-blue bg-daimo-blue/10 text-daimo-blue"
                : "border-slate-200 text-slate-500 hover:border-daimo-blue/30"
            }`}
          >
            {VISUAL_STYLE_LABELS[v]}
          </button>
        ))}
      </div>
    );
  }

  return (
    <Modal title={isEditing ? "Modifier le post" : "Nouveau post"} onClose={onClose} wide>
      <div className="space-y-5">
        {onRegenerate && (
          <button
            onClick={onRegenerate}
            className="inline-flex items-center gap-1.5 rounded-full border border-daimo-blue/30 bg-daimo-blue/5 px-3 py-1.5 text-xs font-medium text-daimo-blue hover:bg-daimo-blue/10"
          >
            🔁 Générer un autre post (texte + image)
          </button>
        )}

        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">
            Format
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(FORMAT_LABELS) as PostFormat[]).map((f) => (
              <button
                key={f}
                onClick={() => setFormat(f)}
                className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                  format === f
                    ? "border-daimo-blue bg-daimo-blue/10 text-daimo-blue"
                    : "border-slate-200 text-slate-600 hover:border-daimo-blue/30"
                }`}
              >
                {FORMAT_LABELS[f]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
            Titre
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titre du post"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-daimo-blue focus:outline-none focus:ring-1 focus:ring-daimo-blue"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
            {format === "carousel" ? "Texte d'accompagnement" : "Contenu"}
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            placeholder="Texte du post LinkedIn…"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-daimo-blue focus:outline-none focus:ring-1 focus:ring-daimo-blue"
          />
        </div>

        {format === "image" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">
                Thème
              </label>
              {categorySelector()}
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">
                  Image (le titre y est affiché automatiquement)
                </label>
                <button
                  onClick={proposeVisuals}
                  disabled={proposing}
                  className="text-xs font-medium text-daimo-blue hover:underline disabled:opacity-50"
                >
                  {proposing ? "⏳ Génération…" : "🎲 Proposer des visuels"}
                </button>
              </div>
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt="Aperçu de l'image générée"
                  className="aspect-[1200/630] w-full rounded-lg border border-slate-200 object-cover"
                />
              ) : (
                <div className="flex aspect-[1200/630] w-full items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-xs text-slate-400">
                  Aucune image, cliquez sur « Proposer des visuels »
                </div>
              )}
              {candidates.length > 0 && (
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {candidates.map((c, i) => (
                    <button
                      key={i}
                      onClick={() => pickCandidate(c)}
                      className={`relative overflow-hidden rounded-lg border-2 ${
                        imageUrl === c.url ? "border-daimo-blue" : "border-transparent hover:border-slate-300"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={c.url} alt={c.style === "template" ? "Type PowerPoint" : "Photo"} className="aspect-[1200/630] w-full object-cover" />
                      <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
                        {c.style === "template" ? "PowerPoint" : "Photo"}
                      </span>
                    </button>
                  ))}
                </div>
              )}
              <p className="mt-1 text-xs text-slate-400">
                Un visuel de type PowerPoint et deux photos de personnes en contexte sont proposés à chaque
                clic : cliquez sur l&apos;une des vignettes pour la choisir. Tout est généré côté
                navigateur, avec le titre affiché directement sur l&apos;image.
              </p>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Ou utilisez une photo déjà existante
              </label>
              <input
                type="url"
                defaultValue={imageUrl && !imageUrl.startsWith("data:") ? imageUrl : ""}
                onBlur={(e) => {
                  if (e.target.value.trim()) setImageUrl(e.target.value.trim());
                }}
                placeholder="https://… (lien vers une photo déjà en ligne)"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-daimo-blue focus:outline-none focus:ring-1 focus:ring-daimo-blue"
              />
              <p className="mt-1 text-xs text-slate-400">
                Collez le lien d&apos;une photo que vous avez déjà (Drive, site, banque d&apos;images…) :
                elle remplacera l&apos;image ci-dessus telle quelle, sans texte ajouté par-dessus.
              </p>
            </div>
          </div>
        )}

        {format === "carousel" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">
                Thème
              </label>
              {categorySelector()}
            </div>
            <div className="flex items-center justify-between gap-2">
              <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">
                Fond (des slides générées, pas de celles avec un lien photo)
              </label>
              {visualStyleSelector()}
            </div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Slides du carrousel : le texte de chaque slide s&apos;affiche sur son image
            </label>
            <div className="space-y-3">
              {slides.map((slide, i) => (
                <div key={slide.id} className="space-y-1.5 rounded-lg border border-slate-100 p-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 shrink-0 text-xs text-slate-400">{i + 1}</span>
                    {slide.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={slide.imageUrl}
                        alt={`Aperçu de la slide ${i + 1}`}
                        className="h-10 w-10 shrink-0 rounded-md border border-slate-200 object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 shrink-0 rounded-md border border-dashed border-slate-300 bg-slate-50" />
                    )}
                    <input
                      value={slide.caption}
                      onChange={(e) => updateSlide(slide.id, e.target.value)}
                      placeholder={`Texte de la slide ${i + 1}`}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-daimo-blue focus:outline-none focus:ring-1 focus:ring-daimo-blue"
                    />
                    <button
                      onClick={() => regenerateSlideImage(slide.id, slide.caption)}
                      className="shrink-0 text-sm text-daimo-blue hover:opacity-70"
                      aria-label="Régénérer l'image de la slide"
                      title="Régénérer l'image"
                    >
                      🎨
                    </button>
                    <button
                      onClick={() => setSlides((prev) => prev.filter((s) => s.id !== slide.id))}
                      className="shrink-0 text-slate-400 hover:text-daimo-pink"
                      aria-label="Supprimer la slide"
                    >
                      ✕
                    </button>
                  </div>
                  <input
                    type="url"
                    defaultValue={slide.imageUrl && !slide.imageUrl.startsWith("data:") ? slide.imageUrl : ""}
                    onBlur={(e) => {
                      const url = e.target.value.trim();
                      if (url) setSlides((prev) => prev.map((s) => (s.id === slide.id ? { ...s, imageUrl: url } : s)));
                    }}
                    placeholder="Ou collez ici le lien d'une photo déjà existante pour cette slide"
                    className="ml-7 w-[calc(100%-1.75rem)] rounded-lg border border-slate-100 bg-slate-50 px-3 py-1.5 text-xs focus:border-daimo-blue focus:outline-none focus:ring-1 focus:ring-daimo-blue"
                  />
                </div>
              ))}
            </div>
            <button
              onClick={() => setSlides((prev) => [...prev, newSlide()])}
              className="mt-2 text-sm font-medium text-daimo-blue hover:underline"
            >
              + Ajouter une slide
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-daimo-blue focus:outline-none focus:ring-1 focus:ring-daimo-blue"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Heure
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-daimo-blue focus:outline-none focus:ring-1 focus:ring-daimo-blue"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
            Statut
          </label>
          <div className="flex gap-2">
            {(["draft", "scheduled"] as PostStatus[]).map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
                  status === s
                    ? "border-daimo-blue bg-daimo-blue/10 text-daimo-blue"
                    : "border-slate-200 text-slate-500"
                }`}
              >
                {s === "draft" ? "Brouillon" : "Programmé"}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          {isEditing && onDelete ? (
            <button
              onClick={() => onDelete(initial.id)}
              className="text-sm font-medium text-daimo-pink hover:underline"
            >
              Supprimer le post
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={!title.trim()}
              className="rounded-full bg-daimo-blue px-5 py-2 text-sm font-medium text-white hover:bg-daimo-blue/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
