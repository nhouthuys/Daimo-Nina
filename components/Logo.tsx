import Image from "next/image";

/** The real Daïmo mark, extracted from the official graphic charter — not a redrawn approximation. */
export function DaimoMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <Image
      src="/daimo-mark.png"
      alt="Daïmo"
      width={64}
      height={79}
      className={className}
      priority
    />
  );
}
