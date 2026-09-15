"use client";

import { useCallback, useEffect, useState } from "react";
import { Post } from "./types";
import { buildSeedPosts } from "./seed";

const STORAGE_KEY = "daimo-marketing-calendar:posts";

function loadPosts(): Post[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return buildSeedPosts();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return buildSeedPosts();
    return parsed;
  } catch {
    return buildSeedPosts();
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
    setPosts(loadPosts());
    setReady(true);
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

  return { posts, ready, upsertPost, deletePost };
}
