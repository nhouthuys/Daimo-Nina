"use client";

interface LinkedInBannerProps {
  connected: boolean;
  onConnect: () => void;
}

export function LinkedInBanner({ connected, onConnect }: LinkedInBannerProps) {
  return (
    <div
      className={
        connected
          ? "flex flex-col gap-3 rounded-xl border border-daimo-green/30 bg-daimo-green/5 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
          : "flex flex-col gap-3 rounded-xl border border-dashed border-slate-300 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
      }
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-lg">{connected ? "✅" : "🏢"}</span>
        <p className="text-sm text-slate-600">
          {connected ? (
            <>
              Page LinkedIn <span className="font-medium text-slate-900">Daïmo</span> connectée : les
              posts programmés seront publiés automatiquement.
            </>
          ) : (
            <>
              Aucune page LinkedIn connectée : les posts programmés ne seront pas publiés.
            </>
          )}
        </p>
      </div>
      <button
        onClick={onConnect}
        className={
          connected
            ? "shrink-0 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-daimo-blue/40"
            : "shrink-0 rounded-full bg-daimo-blue px-4 py-2 text-sm font-medium text-white hover:bg-daimo-blue/90"
        }
      >
        {connected ? "Déconnecter" : "Connecter la page Daïmo"}
      </button>
    </div>
  );
}
