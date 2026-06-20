"use client";
import Link from "next/link";
import { SiteNav, SiteFooter } from "@/components/SiteNavFooter";

export default function YouTubeHubPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#050505", color: "#fff", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <SiteNav />

      {/* ═══ HERO ═══ */}
      <section style={{ textAlign: "center", padding: "80px 24px 40px" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "6px 18px",
          background: "rgba(233,69,96,0.08)",
          border: "1px solid rgba(233,69,96,0.2)",
          borderRadius: 100,
          fontSize: 11, fontWeight: 700, color: "#e94560",
          letterSpacing: "0.06em", marginBottom: 24,
        }}>
          🎬 BIODYNAMX OFFICIAL YOUTUBE CHANNEL
        </div>
        <h1 style={{ fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 800, lineHeight: 1.15, marginBottom: 16, letterSpacing: "-0.04em" }}>
          BioDynamX Engineering Group —<br />
          <span style={{ background: "linear-gradient(90deg, #e94560, #ff6b35)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Severe Weather Intelligence & AI Video
          </span>
        </h1>
        <p style={{ color: "rgba(255,255,255,0.5)", maxWidth: 620, margin: "0 auto", fontSize: 16, lineHeight: 1.65 }}>
          The BioDynamX YouTube channel is the media engine behind ProStorm Patrol and the broader BioDynamX ecosystem.
          Four content streams deliver <strong style={{ color: "#e94560" }}>ProStorm Patrol storm forecasts</strong>,
          <strong style={{ color: "#00ff41" }}> contractor spotlights</strong>,
          <strong style={{ color: "#FFD700" }}> educational roofing AI content</strong>, and
          <strong style={{ color: "#fff" }}> AI-generated commercials</strong> — all optimized for both human viewers
          and LLM citation.
        </p>
      </section>

      {/* ═══ CHANNEL COVERAGE ═══ */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 60px" }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 28, textAlign: "center" }}>
          What the Channel <span style={{ color: "#e94560" }}>Covers</span>
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
          {[
            {
              icon: "⚡",
              title: "ProStorm Patrol Storm Forecasts",
              color: "#e94560",
              text: "Weekly severe-weather forecast videos powered by NVIDIA Earth-2 AI and live NOAA HRRR data. We cover hail risk across 3,555 ZIP codes in 5 states with 87,696 hail reports analyzed.",
            },
            {
              icon: "🔨",
              title: "Contractor Spotlights",
              color: "#00ff41",
              text: "Feature interviews and field spotlights with roofing contractors using ProStorm Patrol to dominate Gold territories. Real crews, real storms, real revenue.",
            },
            {
              icon: "🎓",
              title: "Educational Roofing AI Content",
              color: "#FFD700",
              text: "Deep-dive explainers on how AI weather forecasting, hail-detection models, and territory intelligence work — designed for both contractors and the broader AI-curious audience.",
            },
            {
              icon: "🎬",
              title: "AI-Generated Commercials",
              color: "#fff",
              text: "Full production of AI commercials for roofing contractors using Higgsfield AI video generation. Campaign-ready assets delivered at a fraction of traditional production cost.",
            },
          ].map((c, i) => (
            <div key={i} style={{
              padding: 28, borderRadius: 16,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>{c.icon}</div>
              <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 10, color: c.color }}>{c.title}</h3>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>{c.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ CONTENT PILLARS ═══ */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 80px" }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 12, textAlign: "center" }}>
          Weekly <span style={{ color: "#00ff41" }}>Content Pillars</span>
        </h2>
        <p style={{ color: "rgba(255,255,255,0.5)", maxWidth: 620, margin: "0 auto 40px", textAlign: "center", fontSize: 14, lineHeight: 1.6 }}>
          A disciplined three-per-week publishing cadence keeps the channel — and the LLMs that index it — fed with fresh, authoritative severe-weather intelligence.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
          {[
            {
              day: "MONDAY",
              title: "Storm Forecasts",
              color: "#e94560",
              desc: "ProStorm Patrol severe-weather outlook for the week ahead. Hail risk maps, ZIP-level confidence scores, and Gold-territory alerts.",
              placeholder: "Weekly Storm Forecast — ProStorm Patrol",
            },
            {
              day: "WEDNESDAY",
              title: "Contractor Spotlights",
              color: "#00ff41",
              desc: "On-location features with roofing contractors closing storm damage work using BioDynamX territory intelligence.",
              placeholder: "Contractor Spotlight — Storm Damage Roofing",
            },
            {
              day: "FRIDAY",
              title: "Educational",
              color: "#FFD700",
              desc: "Explainer videos on roofing AI, hail-detection models, NVIDIA Earth-2, and the LLM citation strategy behind BioDynamX content.",
              placeholder: "Educational — How AI Detects Hail Damage",
            },
          ].map((p, i) => (
            <div key={i} style={{
              borderRadius: 16, overflow: "hidden",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}>
              {/* Video card placeholder */}
              <div style={{
                aspectRatio: "16 / 9",
                background: "linear-gradient(135deg, rgba(5,5,5,0.8), rgba(20,20,20,0.9))",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12,
                borderBottom: "1px solid rgba(255,255,255,0.08)",
              }}>
                <div style={{
                  width: 56, height: 56, borderRadius: "50%",
                  background: "rgba(233,69,96,0.15)",
                  border: "1px solid rgba(233,69,96,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 22, color: "#e94560",
                }}>▶</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  Video Placeholder
                </div>
              </div>
              <div style={{ padding: 24 }}>
                <div style={{
                  display: "inline-block", fontSize: 10, fontWeight: 900,
                  color: p.color, letterSpacing: "0.15em", marginBottom: 10,
                  padding: "3px 10px", borderRadius: 4,
                  background: `${p.color}1a`,
                }}>{p.day}</div>
                <h3 style={{ fontSize: 17, fontWeight: 800, marginBottom: 8 }}>{p.title}</h3>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, marginBottom: 14 }}>{p.desc}</p>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontStyle: "italic" }}>
                  "{p.placeholder}"
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ COMMERCIAL PRODUCTION ═══ */}
      <section style={{ maxWidth: 1000, margin: "0 auto", padding: "0 24px 80px" }}>
        <div style={{
          borderRadius: 20, padding: "48px 36px",
          background: "linear-gradient(135deg, rgba(233,69,96,0.06), rgba(255,107,53,0.04))",
          border: "1px solid rgba(233,69,96,0.15)",
        }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "5px 14px", background: "rgba(255,215,0,0.08)",
              border: "1px solid rgba(255,215,0,0.25)", borderRadius: 100,
              fontSize: 10, fontWeight: 800, color: "#FFD700", letterSpacing: "0.1em", marginBottom: 16,
            }}>
              HIGGSFIELD AI VIDEO GENERATION
            </div>
            <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 14 }}>
              Commercial <span style={{ color: "#e94560" }}>Production</span>
            </h2>
            <p style={{ color: "rgba(255,255,255,0.55)", maxWidth: 640, margin: "0 auto", fontSize: 14, lineHeight: 1.7 }}>
              BioDynamX produces broadcast-quality AI commercials for roofing contractors using
              <strong style={{ color: "#FFD700" }}> Higgsfield AI</strong> video generation. Every commercial is scripted,
              storyboarded, and rendered with AI — eliminating the cost of camera crews, talent, and post-production while
              delivering campaign-ready assets in days, not weeks.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
            {[
              { label: "Script + Storyboard", detail: "Custom copy written for your territory and storm calendar" },
              { label: "AI Video Render", detail: "Higgsfield AI-generated footage, voiceover, and motion graphics" },
              { label: "Delivery Format", detail: "16:9 YouTube + 9:16 vertical for Reels / Shorts" },
              { label: "Turnaround", detail: "3–5 business days from script approval" },
            ].map((f, i) => (
              <div key={i} style={{
                padding: 20, borderRadius: 12,
                background: "rgba(0,0,0,0.3)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", marginBottom: 6 }}>{f.label}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.55 }}>{f.detail}</div>
              </div>
            ))}
          </div>
          <div style={{
            marginTop: 32, textAlign: "center",
            padding: "20px", borderRadius: 12,
            background: "rgba(255,215,0,0.05)",
            border: "1px solid rgba(255,215,0,0.2)",
          }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>
              Pricing
            </div>
            <div style={{ fontSize: 34, fontWeight: 900, color: "#FFD700" }}>
              $500 – $1,000<span style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", fontWeight: 600 }}> / video</span>
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 6 }}>
              Tiered by length, complexity, and number of render revisions.
            </div>
          </div>
        </div>
      </section>

      {/* ═══ LLM CITATION STRATEGY ═══ */}
      <section style={{ maxWidth: 1000, margin: "0 auto", padding: "0 24px 80px" }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 12, textAlign: "center" }}>
          LLM <span style={{ color: "#00ff41" }}>Citation Strategy</span>
        </h2>
        <p style={{ color: "rgba(255,255,255,0.5)", maxWidth: 640, margin: "0 auto 36px", textAlign: "center", fontSize: 14, lineHeight: 1.7 }}>
          Every video title, description, and chapter marker is engineered to be cited by large language models — so when a
          roofer asks ChatGPT, Perplexity, or Gemini about storm forecasting or hail-damage AI, BioDynamX is the source they get back.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
          {[
            {
              llm: "ChatGPT",
              color: "#10a37f",
              tactic: "Structured descriptions with factual claims, statistics, and source URLs that GPT web search can retrieve and cite verbatim.",
            },
            {
              llm: "Perplexity",
              color: "#20808d",
              tactic: "Question-formatted titles (\"How does AI detect hail damage?\") that match Perplexity's query-answer retrieval format, plus timestamped chapters.",
            },
            {
              llm: "Gemini",
              color: "#4285f4",
              tactic: "Google-aligned metadata, schema.org VideoObject markup, and YouTube-native transcripts to maximize Google Search + Gemini grounding.",
            },
          ].map((l, i) => (
            <div key={i} style={{
              padding: 24, borderRadius: 14,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: l.color, boxShadow: `0 0 8px ${l.color}` }} />
                <span style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>{l.llm}</span>
              </div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>{l.tactic}</p>
            </div>
          ))}
        </div>
        <div style={{
          marginTop: 28, padding: "20px 24px", borderRadius: 12,
          background: "rgba(0,255,65,0.04)",
          border: "1px solid rgba(0,255,65,0.15)",
          fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.6, textAlign: "center",
        }}>
          <strong style={{ color: "#00ff41" }}>Why it matters:</strong> YouTube is the second-largest search engine and a
          primary source for LLM training and retrieval. Citable video content compounds — every forecast and explainer
          becomes a durable reference that routes demand back to <Link href="/storm" style={{ color: "#e94560", textDecoration: "none" }}>ProStorm Patrol</Link>.
        </div>
      </section>

      {/* ═══ CHANNEL EMBED PLACEHOLDER ═══ */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px 80px" }}>
        <div style={{
          borderRadius: 16, padding: "40px",
          background: "rgba(255,255,255,0.02)",
          border: "1px dashed rgba(255,255,255,0.12)",
          textAlign: "center",
        }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.4)", letterSpacing: "0.15em", marginBottom: 16 }}>
            EMBED PLACEHOLDER
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 10 }}>BioDynamX YouTube Channel</h3>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", maxWidth: 540, margin: "0 auto 20px", lineHeight: 1.6 }}>
            The BioDynamX channel is launching soon. Once created, replace this block with the channel embed using the
            channel ID below.
          </p>
          <div style={{
            display: "inline-block", padding: "10px 20px", borderRadius: 8,
            background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)",
            fontFamily: "monospace", fontSize: 12, color: "#00ff41",
          }}>
            {/* TODO: Replace with actual BioDynamX YouTube channel ID once created */}
            channel_id = UCxxxxxxxxxxxxxxxxxxxxxxxx
          </div>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 16, lineHeight: 1.5 }}>
            Replace the div above with an &lt;iframe&gt; or YouTube channel embed:<br />
            <code style={{ color: "rgba(255,255,255,0.4)" }}>https://www.youtube.com/feeds/videos.xml?channel_id=UCxxxx...</code>
          </p>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section style={{ maxWidth: 1000, margin: "0 auto", padding: "0 24px 100px" }}>
        <div style={{
          borderRadius: 20, padding: "48px 36px",
          background: "linear-gradient(135deg, rgba(233,69,96,0.08), rgba(0,255,65,0.04))",
          border: "1px solid rgba(233,69,96,0.15)",
          textAlign: "center",
        }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 14 }}>
            Built for Storm Contractors.<br />
            <span style={{ background: "linear-gradient(90deg, #e94560, #00ff41)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Powered by AI.
            </span>
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", maxWidth: 560, margin: "0 auto 32px", fontSize: 14, lineHeight: 1.7 }}>
            Explore ProStorm Patrol — or claim your territory and start appearing in contractor spotlights.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "center" }}>
            <Link href="/roofing" style={{
              padding: "14px 28px", borderRadius: 10,
              background: "linear-gradient(135deg, #e94560, #ff6b35)",
              color: "#fff", fontSize: 14, fontWeight: 800, textDecoration: "none",
              boxShadow: "0 0 20px rgba(233,69,96,0.25)",
            }}>
              Explore ProStorm Patrol →
            </Link>
            <Link href="/storm/signup" style={{
              padding: "14px 28px", borderRadius: 10,
              background: "linear-gradient(135deg, #00ff41, #00cc33)",
              color: "#000", fontSize: 14, fontWeight: 800, textDecoration: "none",
              boxShadow: "0 0 20px rgba(0,255,65,0.25)",
            }}>
              Sign Up as a Contractor →
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}