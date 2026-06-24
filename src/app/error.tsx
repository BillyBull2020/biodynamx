"use client";

import { useEffect } from "react";

/**
 * Error boundary for the home page.
 * When client-side hydration crashes, instead of showing a blank
 * "Application error" screen, we render a static fallback that
 * tells the user to refresh. This is a safety net — the SSR HTML
 * already contains the full page content for crawlers and SEO.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[BioDynamX] Client error caught by boundary:", error?.message || error);
  }, [error]);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#050505",
      color: "#f0f0f0",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      gap: 16,
      fontFamily: "Inter, system-ui, sans-serif",
      textAlign: "center",
      padding: 20,
    }}>
      <div style={{ fontSize: 32, fontWeight: 900 }}>
        BioDynamX Engineering Group
      </div>
      <div style={{ fontSize: 16, color: "rgba(255,255,255,0.6)", maxWidth: 480 }}>
        The AI-powered revenue recovery platform with 11 autonomous agents.
        5x ROI guaranteed or your money back.
      </div>
      <button
        onClick={() => reset()}
        style={{
          marginTop: 8, padding: "12px 32px",
          background: "#00ff41", color: "#000",
          border: "none", borderRadius: 8,
          fontWeight: 700, cursor: "pointer", fontSize: 16,
        }}
      >
        Reload Page
      </button>
      <div style={{ marginTop: 24, display: "flex", gap: 24, flexWrap: "wrap", justifyContent: "center" }}>
        <a href="/pricing" style={{ color: "#00ff41", textDecoration: "none", fontSize: 14 }}>Pricing</a>
        <a href="/audit" style={{ color: "#00ff41", textDecoration: "none", fontSize: 14 }}>Free Audit</a>
        <a href="/about" style={{ color: "#00ff41", textDecoration: "none", fontSize: 14 }}>About</a>
        <a href="/blog" style={{ color: "#00ff41", textDecoration: "none", fontSize: 14 }}>Blog</a>
      </div>
    </div>
  );
}