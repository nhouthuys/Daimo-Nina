"use client";

import { useState } from "react";
import { CarouselSlide, FORMAT_LABELS, Post, PostFormat, PostStatus } from "@/lib/types";
import { generateBackgroundImage } from "@/lib/backgroundImage";
import { Modal } from "./Modal";

function newSlide(): CarouselSlide {
  return { id: crypto.randomUUID(), caption: "" };
}

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
      date,
      time,
      status,
      updatedAt: now,
    });
  }

  function updateSlide(id: string, caption: string) {
    setSlides((prev) => prev.map((s) => (s.id === id ? { ...s, caption } : s)));
  }

  function regenerateSlideImage(id: string) {
    const url = generateBackgroundImage(1080, 1080);
    setSlides((prev) => prev.map((s) => (s.id === id ? { ...s, imageUrl: url } : s)));
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
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">
                Image de fond
              </label>
              <button
                onClick={() => setImageUrl(generateBackgroundImage(1200, 630))}
                className="text-xs font-medium text-daimo-blue hover:underline"
              >
                🎨 Générer une image de fond
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
                Aucune image — cliquez sur « Générer une image de fond »
              </div>
            )}
            <p className="mt-1 text-xs text-slate-400">
              Générée automatiquement aux couleurs Daïmo (dégradé + motif de la charte), 100% côté
              navigateur.
            </p>
          </div>
        )}

        {format === "carousel" && (
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Slides du carrousel
            </label>
            <div className="space-y-2">
              {slides.map((slide, i) => (
                <div key={slide.id} className="flex items-center gap-2">
                  <span className="w-5 shrink-0 text-xs text-slate-400">{i + 1}</span>
                  {slide.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={slide.imageUrl}
                      alt={`Fond de la slide ${i + 1}`}
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
                    onClick={() => regenerateSlideImage(slide.id)}
                    className="shrink-0 text-sm text-daimo-blue hover:opacity-70"
                    aria-label="Régénérer l'image de fond de la slide"
                    title="Régénérer l'image de fond"
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
