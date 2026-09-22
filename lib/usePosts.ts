"use client";

import { useCallback, useEffect, useState } from "react";
import { Post } from "./types";
import { buildCalendarSeedPosts } from "./seed";

const STORAGE_KEY = "daimo-marketing-calendar:posts";

function loadStoredPosts(): Post[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function savePosts(posts: Post[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const stored = loadStoredPosts();
      const initial = stored ?? (await buildCalendarSeedPosts());
      if (!cancelled) {
        setPosts(initial);
        setReady(true);
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (ready) savePosts(posts);
  }, [posts, ready]);

  const upsertPost = useCallback((post: Post) => {
    setPosts((prev) => {
      const exists = prev.some((p) => p.id === post.id);
      if (exists) return prev.map((p) => (p.id === post.id ? post : p));
      return [...prev, post];
    });
  }, []);

  const deletePost = useCallback((id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  /**
   * Merges freshly-imported posts into the calendar: a post landing on a date
   * that already has one replaces it (keeping its original id/createdAt so it
   * stays the "same" calendar entry); any other date is added as new.
   */
  const importPosts = useCallback(
    (newPosts: Post[]) => {
      const result = [...posts];
      let added = 0;
      let updated = 0;
      for (const incoming of newPosts) {
        const existingIndex = result.findIndex((p) => p.date === incoming.date);
        if (existingIndex >= 0) {
          const existing = result[existingIndex];
          result[existingIndex] = { ...incoming, id: existing.id, createdAt: existing.createdAt };
          updated++;
        } else {
          result.push(incoming);
          added++;
        }
      }
      setPosts(result);
      return { added, updated };
    },
    [posts]
  );

  return { posts, ready, upsertPost, deletePost, importPosts };
}
