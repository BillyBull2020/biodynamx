"use client";

/**
 * Home page — fetches the Gemini session token from our secure
 * server-side endpoint BEFORE mounting the VaultUI.
 *
 * WHY: NEXT_PUBLIC_GEMINI_API_KEY bakes the key into the JS bundle
 *      where any visitor can extract it with DevTools → Sources.
 *      This approach keeps the key server-only (process.env.GEMINI_API_KEY)
 *      and only transmits it over an authenticated, rate-limited route.
 */

import { useEffect, useState } from "react";
import VaultUI from "@/components/VaultUI";

export default function Home() {
  const [apiKey, setApiKey] = useState<string>("");
  const [cartesiaKey, setCartesiaKey] = useState<string>("");
  const [cartesiaVoiceId, setCartesiaVoiceId] = useState<string>("");
  const [keyError, setKeyError] = useState<string | null>(null);

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
          const body = await res.json().catch(() => ({}));
          const msg = body?.error || `Session error (${res.status})`;
          if (!cancelled) setKeyError(msg);
          return;
        }

        const { token, cartesiaKey: cKey, cartesiaVoiceId: cVoice } = await res.json();
        if (!cancelled) {
          if (token) setApiKey(token);
          if (cKey) setCartesiaKey(cKey);
          if (cVoice) setCartesiaVoiceId(cVoice);
        }
      } catch {
        if (!cancelled) {
          setKeyError("Voice service unavailable — please refresh.");
        }
      }
    }

    fetchSession();
    return () => { cancelled = true; };
  }, []);

  // Show minimal error state if the session endpoint fails
  if (keyError) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#030308",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 16,
        color: "#fff",
        fontFamily: "system-ui, sans-serif",
      }}>
        <div style={{ fontSize: 40 }}>⚠️</div>
        <div style={{ fontSize: 18, fontWeight: 700 }}>Voice service unavailable</div>
        <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>{keyError}</div>
        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: 8, padding: "10px 24px",
            background: "#00ff41", color: "#000",
            border: "none", borderRadius: 8,
            fontWeight: 700, cursor: "pointer", fontSize: 14,
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  // VaultUI receives the key once the session fetch resolves.
  // apiKey="" while loading — VaultUI gracefully blocks agent launch until key is ready.
  return <VaultUI
    apiKey={apiKey}
    cartesiaKey={cartesiaKey}
    cartesiaVoiceId={cartesiaVoiceId}
  />;
}
