"use client";

import { useCallback, useEffect, useState } from "react";
import { PostFormat } from "./types";

const BRAND_KEY = "daimo-marketing-calendar:brand-prompt";
const FORMAT_KEY = "daimo-marketing-calendar:format-guidance";

/** Editable block 1 (brand identity & writing rules). Empty string means "use the default". */
export function useBrandPrompt() {
  const [brandPrompt, setBrandPromptState] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      setBrandPromptState(window.localStorage.getItem(BRAND_KEY) ?? "");
    } finally {
      setReady(true);
    }
  }, []);

  const setBrandPrompt = useCallback((value: string) => {
    setBrandPromptState(value);
    if (typeof window !== "undefined") window.localStorage.setItem(BRAND_KEY, value);
  }, []);

  return { brandPrompt, setBrandPrompt, ready };
}

const EMPTY_FORMAT_GUIDANCE: Record<PostFormat, string> = { article: "", image: "", carousel: "", video: "" };

/** Editable block 2 (per-format guidance). An empty value for a format means "use the default". */
export function useFormatGuidance() {
  const [formatGuidance, setFormatGuidanceState] = useState<Record<PostFormat, string>>(EMPTY_FORMAT_GUIDANCE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(FORMAT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Record<PostFormat, string>>;
        setFormatGuidanceState({
          article: parsed.article ?? "",
          image: parsed.image ?? "",
          carousel: parsed.carousel ?? "",
          video: parsed.video ?? "",
        });
      }
    } catch {
      // malformed storage: keep defaults
    } finally {
      setReady(true);
    }
  }, []);

  const setFormatGuidance = useCallback((format: PostFormat, value: string) => {
    setFormatGuidanceState((prev) => {
      const next = { ...prev, [format]: value };
      if (typeof window !== "undefined") window.localStorage.setItem(FORMAT_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { formatGuidance, setFormatGuidance, ready };
}
