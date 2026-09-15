"use client";

import { Post } from "@/lib/types";
import { buildMonthGrid, isSameMonth, isToday, toISODate, weekdayLabels } from "@/lib/date";
import { PostBadge } from "./PostBadge";

export function CalendarGrid({
  year,
  month,
  posts,
  onDayClick,
  onPostClick,
}: {
  year: number;
  month: number;
  posts: Post[];
  onDayClick: (iso: string) => void;
  onPostClick: (post: Post) => void;
}) {
  const days = buildMonthGrid(year, month);
  const postsByDay = new Map<string, Post[]>();
  for (const post of posts) {
    const list = postsByDay.get(post.date) ?? [];
    list.push(post);
    postsByDay.set(post.date, list);
  }
  for (const list of postsByDay.values()) {
    list.sort((a, b) => a.time.localeCompare(b.time));
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center text-xs font-medium uppercase tracking-wide text-slate-500">
        {weekdayLabels().map((w) => (
          <div key={w} className="py-2">
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const iso = toISODate(day);
          const inMonth = isSameMonth(day, year, month);
          const dayPosts = postsByDay.get(iso) ?? [];
          return (
            <div
              key={iso}
              onClick={() => onDayClick(iso)}
              className={`group flex min-h-[7rem] cursor-pointer flex-col gap-1 border-b border-r border-slate-100 p-2 last:border-r-0 hover:bg-daimo-blue/5 ${
                inMonth ? "bg-white" : "bg-slate-50/60"
              }`}
            >
              <span
                className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                  isToday(day)
                    ? "bg-daimo-blue font-semibold text-white"
                    : inMonth
                    ? "text-slate-700"
                    : "text-slate-400"
                }`}
              >
                {day.getDate()}
              </span>
              <div className="flex flex-col gap-1">
                {dayPosts.slice(0, 3).map((post) => (
                  <PostBadge key={post.id} post={post} onClick={() => onPostClick(post)} />
                ))}
                {dayPosts.length > 3 && (
                  <span className="px-2 text-xs text-slate-400">+{dayPosts.length - 3} autres</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
