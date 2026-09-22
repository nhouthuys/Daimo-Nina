"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "daimo-marketing-calendar:guidelines";

export function useGuidelines() {
  const [guidelines, setGuidelinesState] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      setGuidelinesState(window.localStorage.getItem(STORAGE_KEY) ?? "");
    } finally {
      setReady(true);
    }
  }, []);

  const setGuidelines = useCallback((value: string) => {
    setGuidelinesState(value);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, value);
    }
  }, []);

  return { guidelines, setGuidelines, ready };
}
