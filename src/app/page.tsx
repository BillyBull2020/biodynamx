"use client";

/**
 * Home page — fetches the Gemini session token from our secure
 * server-side endpoint BEFORE mounting the VaultUI.
 *
 * WHY: NEXT_PUBLIC_GEMINI_API_KEY bakes the key into the JS bundle
 *      where any visitor can extract it with DevTools → Sources.
 *      This approach keeps the key server-only (process.env.GEMINI_API_KEY)
 *      and only transmits it over an authenticated, rate-limited route.
 *
 * IMPORTANT: On static hosting (no API routes), the session fetch will
 * return 404. We must NOT block the entire page behind this — VaultUI
 * should still render so visitors see the full landing page. The voice
 * agent feature simply won't be available until deployed with functions.
 */

import { useEffect, useState } from "react";
import VaultUI from "@/components/VaultUI";

export default function Home() {
  const [apiKey, setApiKey] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    async function fetchSession() {
      try {
        const res = await fetch("/api/voice/session", {
          method: "GET",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
          // API not available (static hosting) — don't block the page
          return;
        }

        const { token } = await res.json();
        if (!cancelled && token) {
          setApiKey(token);
        }
      } catch {
        // Network error — don't block the page, just log silently
      }
    }

    fetchSession();
    return () => { cancelled = true; };
  }, []);

  // Always render VaultUI — apiKey="" means voice features are disabled
  // but the full landing page (hero, agents, pricing, etc.) is visible.
  return <VaultUI apiKey={apiKey} />;
}
