"use client";

import { monthLabel } from "@/lib/date";

export function MonthNav({
  year,
  month,
  onPrev,
  onNext,
}: {
  year: number;
  month: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex items-center gap-4">
      <button
        onClick={onPrev}
        aria-label="Mois précédent"
        className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:border-daimo-blue/40 hover:text-daimo-blue"
      >
        ‹
      </button>
      <span className="min-w-[10rem] text-center font-heading text-base font-semibold text-slate-800">
        {monthLabel(year, month)}
      </span>
      <button
        onClick={onNext}
        aria-label="Mois suivant"
        className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:border-daimo-blue/40 hover:text-daimo-blue"
      >
        ›
      </button>
    </div>
  );
}
