"use client";

import { useState } from "react";
import { DaimoMark } from "@/components/Logo";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Échec de la connexion.");
        return;
      }
      const next = new URLSearchParams(window.location.search).get("next") || "/";
      window.location.href = next;
    } catch {
      setError("Impossible de contacter le serveur.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <DaimoMark className="h-10 w-10" />
          <h1 className="text-lg font-semibold text-slate-800">Daïmo Nina</h1>
          <p className="text-sm text-slate-500">Entrez le mot de passe pour accéder au calendrier.</p>
        </div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mot de passe"
          autoFocus
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-daimo-blue focus:outline-none focus:ring-1 focus:ring-daimo-blue"
        />
        {error && <p className="text-xs text-daimo-pink">{error}</p>}
        <button
          type="submit"
          disabled={submitting || !password}
          className="w-full rounded-full bg-daimo-blue px-4 py-2 text-sm font-medium text-white hover:bg-daimo-blue/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Connexion…" : "Se connecter"}
        </button>
      </form>
    </main>
  );
}
