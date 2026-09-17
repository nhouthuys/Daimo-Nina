import { FORMAT_COLORS, FORMAT_LABELS, Post } from "@/lib/types";

const FORMAT_ICON: Record<Post["format"], string> = {
  article: "📰",
  image: "🖼️",
  carousel: "📑",
};

export function PostBadge({
  post,
  onClick,
  compact = false,
}: {
  post: Post;
  onClick?: (e: React.MouseEvent) => void;
  compact?: boolean;
}) {
  const colors = FORMAT_COLORS[post.format];
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(e);
      }}
      className={`w-full truncate rounded-md px-2 py-1 text-left text-xs font-medium ${colors.bg} ${colors.text} hover:opacity-80`}
      title={`${post.time} : ${post.title}`}
    >
      <span className="mr-1">{FORMAT_ICON[post.format]}</span>
      {!compact && <span className="mr-1 tabular-nums">{post.time}</span>}
      {post.title}
      {post.status === "draft" && <span className="ml-1 opacity-60">(brouillon)</span>}
    </button>
  );
}

export function FormatLegend() {
  return (
    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
      {(Object.keys(FORMAT_LABELS) as Post["format"][]).map((f) => (
        <span key={f} className="inline-flex items-center gap-1.5">
          <span className={`h-2 w-2 rounded-full ${FORMAT_COLORS[f].dot}`} />
          {FORMAT_LABELS[f]}
        </span>
      ))}
    </div>
  );
}
