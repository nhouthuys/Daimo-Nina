const MONTHS_FR = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

const WEEKDAYS_FR = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export function monthLabel(year: number, month: number): string {
  return `${MONTHS_FR[month]} ${year}`;
}

export function weekdayLabels(): string[] {
  return WEEKDAYS_FR;
}

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayISO(): string {
  return toISODate(new Date());
}

/**
 * Returns a flat array of Date objects covering the full weeks
 * needed to display `month` (0-indexed) of `year`, Monday-first.
 */
export function buildMonthGrid(year: number, month: number): Date[] {
  const firstOfMonth = new Date(year, month, 1);
  const firstWeekday = (firstOfMonth.getDay() + 6) % 7; // 0 = Monday
  const start = new Date(year, month, 1 - firstWeekday);

  const lastOfMonth = new Date(year, month + 1, 0);
  const lastWeekday = (lastOfMonth.getDay() + 6) % 7;
  const daysAfter = 6 - lastWeekday;
  const totalDays = firstWeekday + lastOfMonth.getDate() + daysAfter;

  const days: Date[] = [];
  for (let i = 0; i < totalDays; i++) {
    days.push(new Date(year, month, 1 - firstWeekday + i));
  }
  return days;
}

export function isSameMonth(d: Date, year: number, month: number): boolean {
  return d.getFullYear() === year && d.getMonth() === month;
}

export function isToday(d: Date): boolean {
  const t = new Date();
  return (
    d.getFullYear() === t.getFullYear() &&
    d.getMonth() === t.getMonth() &&
    d.getDate() === t.getDate()
  );
}

export function formatTimeLabel(time: string): string {
  return time;
}

export function formatDateLong(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const weekday = WEEKDAYS_FR[(date.getDay() + 6) % 7];
  return `${weekday} ${d} ${MONTHS_FR[m - 1]} ${y}`;
}
