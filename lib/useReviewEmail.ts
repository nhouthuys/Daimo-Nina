"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "daimo-marketing-calendar:review-email";

export function useReviewEmail() {
  const [email, setEmailState] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      setEmailState(window.localStorage.getItem(STORAGE_KEY) ?? "");
    } finally {
      setReady(true);
    }
  }, []);

  const setEmail = useCallback((value: string) => {
    setEmailState(value);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, value);
    }
  }, []);

  return { email, setEmail, ready };
}
