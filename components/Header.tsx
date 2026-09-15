import { DaimoMark } from "./Logo";

export function Header() {
  return (
    <div className="flex items-start gap-3">
      <DaimoMark className="h-9 w-9 mt-1 shrink-0" />
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-daimo-blue">
          Calendrier marketing — Daïmo
        </h1>
        <p className="mt-1 text-sm text-daimo-gray">
          Articles, images et carrousels programmés sur LinkedIn.
        </p>
      </div>
    </div>
  );
}
