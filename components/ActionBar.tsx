"use client";

import { useRef, useState } from "react";
import { FORMAT_LABELS, PostFormat } from "@/lib/types";
import { Modal } from "./Modal";

interface ActionBarProps {
  onGuidelines: () => void;
  onCharter: () => void;
  onGenerate: (theme: string | undefined, format: PostFormat) => void;
  onNewPost: () => void;
  onImportFile: (file: File) => void;
  generating?: boolean;
  importing?: boolean;
}

function PillButton({
  children,
  onClick,
  primary = false,
  disabled = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  primary?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={
        primary
          ? "inline-flex items-center gap-2 rounded-full bg-daimo-blue px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-daimo-blue/90 disabled:cursor-wait disabled:opacity-70"
          : "inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-daimo-blue/40 hover:text-daimo-blue disabled:cursor-wait disabled:opacity-70"
      }
    >
      {children}
    </button>
  );
}

export function ActionBar({
  onGuidelines,
  onCharter,
  onGenerate,
  onNewPost,
  onImportFile,
  generating = false,
  importing = false,
}: ActionBarProps) {
  const [theme, setTheme] = useState("");
  const [format, setFormat] = useState<PostFormat>("article");
  const [menuOpen, setMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function triggerGenerate() {
    onGenerate(theme, format);
    setMenuOpen(false);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <PillButton onClick={onGuidelines}>🧭 Consignes d&apos;écriture</PillButton>
      <PillButton onClick={onCharter}>🎨 Charte graphique</PillButton>
      <PillButton onClick={() => fileInputRef.current?.click()} disabled={importing}>
        {importing ? "⏳ Import…" : "📥 Importer un calendrier"}
      </PillButton>
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onImportFile(file);
          e.target.value = "";
        }}
      />
      <PillButton onClick={() => setMenuOpen(true)} disabled={generating}>
        {generating ? "⏳ Génération…" : "✨ Générer un post"}
      </PillButton>
      <PillButton onClick={onNewPost} primary>
        + Nouveau post
      </PillButton>

      {menuOpen && (
        <Modal title="Générer un post" onClose={() => setMenuOpen(false)}>
          <div className="space-y-4">
            <div>
              <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-400">
                1. Format
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(Object.keys(FORMAT_LABELS) as PostFormat[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFormat(f)}
                    className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
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
              <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-400">
                2. Contenu
              </span>
              <input
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !generating) triggerGenerate();
                }}
                autoFocus
                placeholder="Thème (ex : notre partenariat avec…) ou collez directement un texte déjà rédigé — les deux fonctionnent"
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm focus:border-daimo-blue focus:outline-none focus:ring-1 focus:ring-daimo-blue"
              />
            </div>
            <div className="flex justify-end">
              <PillButton onClick={triggerGenerate} primary disabled={generating}>
                {generating ? "⏳ Génération…" : "3. ✨ Générer"}
              </PillButton>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
