"use client";

import { useState } from "react";

interface ActionBarProps {
  onNotes: () => void;
  onCharter: () => void;
  onGenerate: (theme?: string) => void;
  onNewPost: () => void;
  generating?: boolean;
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

export function ActionBar({ onNotes, onCharter, onGenerate, onNewPost, generating = false }: ActionBarProps) {
  const [theme, setTheme] = useState("");

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <PillButton onClick={onNotes}>📝 Notes</PillButton>
        <PillButton onClick={onCharter}>🎨 Charte graphique</PillButton>
        <PillButton onClick={onNewPost} primary>
          + Nouveau post
        </PillButton>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !generating) onGenerate(theme);
          }}
          placeholder="Proposez un thème (optionnel), ex : notre nouveau partenariat avec…"
          className="min-w-[240px] flex-1 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm focus:border-daimo-blue focus:outline-none focus:ring-1 focus:ring-daimo-blue"
        />
        <PillButton onClick={() => onGenerate(theme)} disabled={generating}>
          {generating ? "⏳ Génération…" : "✨ Générer un post"}
        </PillButton>
      </div>
    </div>
  );
}
