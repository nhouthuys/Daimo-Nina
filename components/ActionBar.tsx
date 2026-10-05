"use client";

import { useRef } from "react";

interface ActionBarProps {
  onEmailSettings: () => void;
  onCharter: () => void;
  onPromptSettings: () => void;
  onNewPost: () => void;
  onImportFile: (file: File) => void;
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
  onEmailSettings,
  onCharter,
  onPromptSettings,
  onNewPost,
  onImportFile,
  importing = false,
}: ActionBarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <PillButton onClick={onEmailSettings}>📧 Email de vérification</PillButton>
      <PillButton onClick={onCharter}>🎨 Charte graphique</PillButton>
      <PillButton onClick={onPromptSettings}>🧠 Prompt IA</PillButton>
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
      <PillButton onClick={onNewPost} primary>
        + Nouveau post
      </PillButton>
    </div>
  );
}
