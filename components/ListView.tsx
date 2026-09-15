"use client";

import { FORMAT_LABELS, Post } from "@/lib/types";
import { formatDateLong } from "@/lib/date";

export function ListView({
  posts,
  onPostClick,
}: {
  posts: Post[];
  onPostClick: (post: Post) => void;
}) {
  const sorted = [...posts].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  if (sorted.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
        Aucun post programmé. Cliquez sur « + Nouveau post » pour en créer un.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <ul className="divide-y divide-slate-100">
        {sorted.map((post) => (
          <li
            key={post.id}
            onClick={() => onPostClick(post)}
            className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 hover:bg-daimo-blue/5"
          >
            <div className="flex items-center gap-4">
              <div className="w-28 shrink-0 text-sm text-slate-500">
                <div>{formatDateLong(post.date)}</div>
                <div className="tabular-nums text-slate-400">{post.time}</div>
              </div>
              <div>
                <p className="font-medium text-slate-900">{post.title}</p>
                <p className="text-xs text-slate-500">
                  {FORMAT_LABELS[post.format]}
                  {post.status === "draft" && " · brouillon"}
                  {post.status === "published" && " · publié"}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
