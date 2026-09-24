"use client";

import { useEffect, useRef, useState } from "react";
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
import { buildPostsFromEntries, parseCalendarFile } from "@/lib/xlsxImport";
import { useGuidelines } from "@/lib/useGuidelines";
import { useReviewEmail } from "@/lib/useReviewEmail";
import { pushSyncedState } from "@/lib/syncStore";

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
  const { posts, ready, upsertPost, deletePost, importPosts } = usePosts();
  const { guidelines, setGuidelines } = useGuidelines();
  const { email: reviewEmail, setEmail: setReviewEmail } = useReviewEmail();
  const [view, setView] = useState<ViewMode>("calendar");
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [infoModal, setInfoModal] = useState<"guidelines" | "charter" | "import-result" | null>(null);
  const [importMessage, setImportMessage] = useState("");
  const [connected, setConnected] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [importing, setImporting] = useState(false);

  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!ready) return;
    if (syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(() => {
      pushSyncedState({ posts, reviewEmail });
    }, 1500);
    return () => {
      if (syncTimer.current) clearTimeout(syncTimer.current);
    };
  }, [posts, reviewEmail, ready]);

  function goToMonth(delta: number) {
    setCursor((prev) => {
      const d = new Date(prev.year, prev.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }

  async function handleGenerate(
    date: string,
    time: string,
    customTheme?: string,
    replacing?: Post,
    forcedFormat?: Post["format"]
  ) {
    setGenerating(true);
    try {
      const post = await createGeneratedPost(date, time, customTheme, guidelines, forcedFormat);
      setEditingPost(replacing ? { ...post, id: replacing.id, createdAt: replacing.createdAt } : post);
    } finally {
      setGenerating(false);
    }
  }

  async function handleImportFile(file: File) {
    setImporting(true);
    try {
      const entries = await parseCalendarFile(file);
      if (entries.length === 0) {
        setImportMessage(
          "Aucun thème trouvé dans ce fichier. Vérifiez qu'il contient bien des colonnes « Semaine » et « Thème/contenu » avec des lignes remplies."
        );
        setInfoModal("import-result");
        return;
      }
      const confirmed = window.confirm(
        `${entries.length} thème(s) trouvé(s) dans le fichier.\n\nL'import remplacera le contenu de tout post déjà programmé aux mêmes dates. Continuer ?`
      );
      if (!confirmed) return;
      const newPosts = await buildPostsFromEntries(entries, guidelines);
      const { added, updated } = importPosts(newPosts);
      setImportMessage(
        `Import terminé : ${added} post(s) ajouté(s), ${updated} post(s) mis à jour (même date déjà programmée).`
      );
      setInfoModal("import-result");
    } catch (err) {
      setImportMessage(err instanceof Error ? err.message : "Échec de l'import : fichier illisible.");
      setInfoModal("import-result");
    } finally {
      setImporting(false);
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <Header />

        <ActionBar
          onGuidelines={() => setInfoModal("guidelines")}
          onCharter={() => setInfoModal("charter")}
          onGenerate={(theme) => handleGenerate(todayISO(), "09:00", theme)}
          generating={generating}
          onNewPost={() => setEditingPost(emptyPost(todayISO()))}
          onImportFile={handleImportFile}
          importing={importing}
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
          key={`${editingPost.id}-${editingPost.updatedAt}`}
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
          onRegenerate={(theme, forcedFormat) =>
            handleGenerate(editingPost.date, editingPost.time, theme, editingPost, forcedFormat)
          }
          reviewEmail={reviewEmail || undefined}
        />
      )}

      {infoModal === "guidelines" && (
        <InfoModal title="Consignes d'écriture & vérification" onClose={() => setInfoModal(null)}>
          <p>
            Décrivez ici le ton, le style, ce qu&apos;il faut toujours mentionner ou éviter, le
            public visé… Ces consignes sont envoyées à l&apos;IA à chaque génération de post.
          </p>
          <textarea
            value={guidelines}
            onChange={(e) => setGuidelines(e.target.value)}
            rows={6}
            placeholder="Ex : ton professionnel mais chaleureux, toujours mentionner que Daïmo est basé en Belgique, éviter le jargon technique, s'adresser à des responsables opérationnels de PME…"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-daimo-blue focus:outline-none focus:ring-1 focus:ring-daimo-blue"
          />
          <p className="text-xs text-slate-400">
            Pour que ces consignes soient réellement suivies par une IA, une clé Anthropic
            (ANTHROPIC_API_KEY) doit être configurée côté serveur, sur Vercel. Sans clé, l&apos;outil
            utilise son générateur local (gratuit, mais qui ne lit pas ces consignes).
          </p>

          <hr className="border-slate-100" />

          <label className="block text-sm font-medium text-slate-700">
            Email de vérification
          </label>
          <p>
            Une fois renseigné : chaque post ouvre un bouton « 📧 Envoyer pour vérification » pour
            un envoi immédiat, <strong>et</strong> tout post au statut « Programmé » vous est
            envoyé automatiquement par email le matin de sa date, sans rien cliquer. Dans les deux
            cas, rien n&apos;est publié automatiquement sur LinkedIn : c&apos;est à vous de
            vérifier puis de publier.
          </p>
          <input
            type="email"
            value={reviewEmail}
            onChange={(e) => setReviewEmail(e.target.value)}
            placeholder="vous@daimo.be"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-daimo-blue focus:outline-none focus:ring-1 focus:ring-daimo-blue"
          />
          <p className="text-xs text-slate-400">
            Pour que l&apos;envoi (immédiat ou automatique) fonctionne, une clé Resend
            (RESEND_API_KEY, gratuite jusqu&apos;à 3000 emails/mois, sans carte bancaire) doit être
            configurée côté serveur, sur Vercel.
          </p>
          <p className="text-xs text-slate-400">
            Pour que l&apos;envoi <strong>automatique</strong> fonctionne en plus, une base de
            stockage Vercel Blob (gratuite, créée puis connectée à ce projet depuis l&apos;onglet
            « Storage » de votre projet Vercel) doit aussi être configurée : elle permet au serveur
            de connaître vos posts programmés, même quand votre navigateur est fermé.
          </p>
          <p className="text-xs text-slate-400">
            Sans ces clés, les boutons et l&apos;envoi automatique échouent silencieusement en
            arrière-plan (pour l&apos;automatique) ou affichent une erreur claire (pour le bouton
            manuel) — le reste de l&apos;outil continue de fonctionner normalement.
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
            Typographies : Exo 2 (titres), Exo (texte courant), Calibri en substitution.
          </p>
        </InfoModal>
      )}

      {infoModal === "import-result" && (
        <InfoModal title="Import du calendrier" onClose={() => setInfoModal(null)}>
          <p>{importMessage}</p>
        </InfoModal>
      )}
    </main>
  );
}
