"use client";

export type ViewMode = "calendar" | "list";

export function ViewToggle({
  mode,
  onChange,
}: {
  mode: ViewMode;
  onChange: (m: ViewMode) => void;
}) {
  return (
    <div className="inline-flex rounded-full border border-slate-200 bg-white p-1">
      {(["calendar", "list"] as ViewMode[]).map((m) => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className={
            mode === m
              ? "rounded-full bg-daimo-blue px-4 py-1.5 text-sm font-medium text-white"
              : "rounded-full px-4 py-1.5 text-sm font-medium text-slate-500 hover:text-daimo-blue"
          }
        >
          {m === "calendar" ? "Calendrier" : "Liste"}
        </button>
      ))}
    </div>
  );
}
