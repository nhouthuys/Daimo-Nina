"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { ActionBar } from "@/components/ActionBar";
import { LinkedInBanner } from "@/components/LinkedInBanner";
import { ViewToggle, ViewMode } from "@/components/ViewToggle";
import { MonthNav } from "@/components/MonthNav";
import { CalendarGrid } from "@/components/CalendarGrid";
import { ListView } from "@/components/ListView";
import { PostModal } from "@/components/PostModal";
import { InfoModal } from "@/components/InfoModal";
import { FormatLegend } from "@/components/PostBadge";
import { usePosts } from "@/lib/usePosts";
import { Post } from "@/lib/types";
import { todayISO } from "@/lib/date";
import { createGeneratedPost } from "@/lib/autoGenerate";

function emptyPost(date: string): Post {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    format: "article",
    title: "",
    content: "",
    date,
    time: "09:00",
    status: "draft",
    createdAt: now,
    updatedAt: now,
  };
}

export default function Home() {
  const { posts, ready, upsertPost, deletePost } = usePosts();
  const [view, setView] = useState<ViewMode>("calendar");
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [infoModal, setInfoModal] = useState<"notes" | "charter" | null>(null);
  const [connected, setConnected] = useState(false);
  const [generating, setGenerating] = useState(false);

  function goToMonth(delta: number) {
    setCursor((prev) => {
      const d = new Date(prev.year, prev.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }

  async function handleGenerate(date: string, time: string) {
    setGenerating(true);
    try {
      const post = await createGeneratedPost(date, time);
      setEditingPost(post);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <Header />

        <ActionBar
          onNotes={() => setInfoModal("notes")}
          onCharter={() => setInfoModal("charter")}
          onGenerate={() => handleGenerate(todayISO(), "09:00")}
          generating={generating}
          onNewPost={() => setEditingPost(emptyPost(todayISO()))}
        />

        <LinkedInBanner connected={connected} onConnect={() => setConnected((c) => !c)} />

        <div className="flex flex-wrap items-center justify-between gap-4">
          <ViewToggle mode={view} onChange={setView} />
          {view === "calendar" && (
            <MonthNav
              year={cursor.year}
              month={cursor.month}
              onPrev={() => goToMonth(-1)}
              onNext={() => goToMonth(1)}
            />
          )}
        </div>

        <FormatLegend />

        {!ready ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-400">
            Chargement…
          </div>
        ) : view === "calendar" ? (
          <CalendarGrid
            year={cursor.year}
            month={cursor.month}
            posts={posts}
            onDayClick={(iso) => setEditingPost(emptyPost(iso))}
            onPostClick={(post) => setEditingPost(post)}
          />
        ) : (
          <ListView posts={posts} onPostClick={(post) => setEditingPost(post)} />
        )}
      </div>

      {editingPost && (
        <PostModal
          key={editingPost.id}
          initial={editingPost}
          onClose={() => setEditingPost(null)}
          onSave={(post) => {
            upsertPost(post);
            setEditingPost(null);
          }}
          onDelete={(id) => {
            deletePost(id);
            setEditingPost(null);
          }}
          onRegenerate={() => handleGenerate(editingPost.date, editingPost.time)}
        />
      )}

      {infoModal === "notes" && (
        <InfoModal title="Notes" onClose={() => setInfoModal(null)}>
          <p>
            Espace libre pour noter vos idées de contenu, angles d&apos;articles ou retours
            d&apos;équipe. (Fonctionnalité à connecter à votre outil de notes préféré.)
          </p>
        </InfoModal>
      )}

      {infoModal === "charter" && (
        <InfoModal title="Charte graphique Daïmo" onClose={() => setInfoModal(null)}>
          <p>Couleurs principales de la marque, à respecter dans les visuels publiés sur LinkedIn :</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              { name: "Dark Blue", hex: "#394e9d" },
              { name: "Light Blue", hex: "#3fb5cc" },
              { name: "Green", hex: "#65b22e" },
              { name: "Purple", hex: "#662d91" },
              { name: "Gray", hex: "#76818e" },
              { name: "Pink", hex: "#ec008c" },
            ].map((c) => (
              <div key={c.hex} className="overflow-hidden rounded-lg border border-slate-200">
                <div style={{ backgroundColor: c.hex }} className="h-14 w-full" />
                <div className="px-2 py-1.5 text-xs">
                  <p className="font-medium text-slate-700">{c.name}</p>
                  <p className="text-slate-400">{c.hex}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400">
            Typographies : Exo 2 (titres), Exo (texte courant) — Calibri en substitution.
          </p>
        </InfoModal>
      )}
    </main>
  );
}
