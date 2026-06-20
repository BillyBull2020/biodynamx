"use client";
import Link from "next/link";
import { SiteNav, SiteFooter } from "@/components/SiteNavFooter";
import { useEffect, useState } from "react";

interface YouTubeVideo {
  id: string;
  title: string;
  published: string;
  thumbnail: string;
}

export default function RoofingPage() {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(true);

  useEffect(() => {
    async function fetchVideos() {
      try {
        const resp = await fetch(
          "https://www.youtube.com/feeds/videos.xml?channel_id=UCvBVK2ymNzPLRJrgip2GeQQ"
        );
        const text = await resp.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, "text/xml");
        const entries = doc.querySelectorAll("entry");
        const vids: YouTubeVideo[] = [];
        entries.forEach((entry, i) => {
          if (i >= 6) return;
          const idEl = entry.querySelector("videoId, yt\\:videoId");
          const titleEl = entry.querySelector("title");
          const pubEl = entry.querySelector("published");
          const vidId = idEl?.textContent || "";
          if (vidId) {
            vids.push({
              id: vidId,
              title: titleEl?.textContent || "",
              published: pubEl?.textContent || "",
              thumbnail: `https://img.youtube.com/vi/${vidId}/hqdefault.jpg`,
            });
          }
        });
        setVideos(vids);
      } catch (e) {
        console.error("YouTube fetch error:", e);
      }
      setLoadingVideos(false);
    }
    fetchVideos();
  }, []);

  return (
    <main style={{ minHeight: "100vh", background: "#050505", color: "#fff", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <SiteNav />

      {/* HERO */}
      <section style={{ textAlign: "center", padding: "80px 24px 40px" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "6px 18px", background: "rgba(233,69,96,0.08)",
          border: "1px solid rgba(233,69,96,0.2)", borderRadius: 100,
          fontSize: 11, fontWeight: 700, color: "#e94560", letterSpacing: "0.06em", marginBottom: 24,
        }}>
          🏠 PROSTORM PATROL FOR ROOFING CONTRACTORS
        </div>
        <h1 style={{ fontSize: "clamp(28px,5vw,48px)", fontWeight: 800, lineHeight: 1.15, marginBottom: 16, letterSpacing: "-0.04em" }}>
          Stop Chasing Storms.<br />
          <span style={{ background: "linear-gradient(90deg,#e94560,#ff6b35)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Make Storms Come to You.
          </span>
        </h1>
        <p style={{ color: "rgba(255,255,255,0.5)", maxWidth: 600, margin: "0 auto", fontSize: 16, lineHeight: 1.65 }}>
          The only roofing platform with <strong style={{ color: "#e94560" }}>NVIDIA Earth-2 AI weather forecasting</strong>,
          live NOAA HRRR hail data, and exclusive territory domination across <strong style={{ color: "#00ff41" }}>5 states</strong>.
        </p>
      </section>

      {/* STATS */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px 60px", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 40 }}>
        {[
          { num: "87,696", label: "Hail Reports Analyzed" },
          { num: "3,555", label: "ZIP Codes Scored" },
          { num: "5 States", label: "CO TX OK KS NE" },
          { num: "40", label: "Gold Territories" },
          { num: "6.00\"", label: "Max Hail Recorded" },
        ].map((s, i) => (
          <div key={i} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 36, fontWeight: 800, color: "#e94560" }}>{s.num}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </section>

      {/* STATES */}
      <section style={{ maxWidth: 800, margin: "0 auto", padding: "20px 24px" }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 20, textAlign: "center" }}>Available Territories</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 16 }}>
          {[
            { state: "CO", name: "Colorado", zips: 378, gold: 12 },
            { state: "TX", name: "Texas", zips: 1667, gold: 17 },
            { state: "OK", name: "Oklahoma", zips: 642, gold: 6 },
            { state: "KS", name: "Kansas", zips: 683, gold: 2 },
            { state: "NE", name: "Nebraska", zips: 563, gold: 3 },
          ].map((s) => (
            <div key={s.state} style={{ padding: 20, borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#e94560" }}>{s.state}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>{s.name}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>{s.zips} ZIPs</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#FFD700" }}>{s.gold} Gold</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ maxWidth: 800, margin: "0 auto", padding: "40px 24px" }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 20, textAlign: "center" }}>
          Everything You Need to <span style={{ color: "#00ff41" }}>Dominate Your Territory</span>
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 20 }}>
          {[
            { icon: "🎯", title: "Exclusive ZIP Territory", desc: "One contractor per ZIP. No other ProStorm Patrol contractor in your area." },
            { icon: "📊", title: "10-Year Hail Risk Scoring", desc: "87,696 NWS hail reports. Every ZIP ranked 0-100. Know which territories are worth fighting for." },
            { icon: "🌩️", title: "Live HRRR Hail Risk", desc: "NOAA HRRR updates hourly. 6,876 ZIPs scored across 5 states. Real-time hail risk before the storm forms." },
            { icon: "🤖", title: "NVIDIA Earth-2 AI", desc: "72-hour hail prediction using GraphCast on A100 GPU. Know your territory gets hit 3 days before anyone else." },
            { icon: "📱", title: "Homeowner CRM + AI Messages", desc: "Track every contact. AI generates SMS/email to homeowners before and after storms." },
            { icon: "📋", title: "Insurance Claim Pipeline", desc: "5-stage kanban. AI writes claim narratives from your inspection notes." },
            { icon: "🚗", title: "Route Planner", desc: "Door-knocking routes with Google Maps integration. Optimized stops." },
            { icon: "⚠️", title: "Live NWS Storm Alerts", desc: "20 tornado alley states monitored. SPC live storm reports. Auto-refresh every 5 minutes." },
          ].map((f, i) => (
            <div key={i} style={{ padding: 24, borderRadius: 16, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderLeft: "3px solid #00ff41" }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{f.icon}</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 6 }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* YOUTUBE STORM CONTENT */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, textAlign: "center" }}>
          Live Storm Coverage
        </h2>
        <p style={{ color: "rgba(255,255,255,0.4)", textAlign: "center", marginBottom: 24, fontSize: 14 }}>
          Latest severe weather videos from <a href="https://www.youtube.com/@MaxVelocityWX" target="_blank" rel="noopener" style={{ color: "#e94560", textDecoration: "none" }}>Max Velocity — Severe Weather Center</a>
        </p>
        {loadingVideos ? (
          <div style={{ textAlign: "center", padding: 40, color: "rgba(255,255,255,0.3)" }}>Loading latest storm videos...</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 20 }}>
            {videos.map((v) => (
              <a key={v.id} href={`https://youtube.com/watch?v=${v.id}`} target="_blank" rel="noopener" style={{ textDecoration: "none", display: "block", borderRadius: 12, overflow: "hidden", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", transition: "transform 0.2s, border-color 0.2s" }}>
                <div style={{ position: "relative", aspectRatio: "16/9", background: "#111" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={v.thumbnail} alt={v.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.3)" }}>
                    <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(233,69,96,0.9)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>▶</div>
                  </div>
                </div>
                <div style={{ padding: 14 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{v.title}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 6 }}>{new Date(v.published).toLocaleDateString()}</div>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>

      {/* PRICING */}
      <section style={{ maxWidth: 800, margin: "0 auto", padding: "60px 24px" }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 30, textAlign: "center" }}>Two Ways to Win</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 24 }}>
          <div style={{ padding: 32, borderRadius: 24, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>STANDARD</div>
            <h3 style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 4 }}>ProStorm Patrol Standard</h3>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 20, marginTop: 12 }}>
              <span style={{ fontSize: 48, fontWeight: 800, color: "#e94560" }}>$500</span>
              <span style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>/month per ZIP</span>
            </div>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {["Exclusive ZIP territory", "Live HRRR hail risk (hourly)", "Homeowner CRM", "Insurance claim pipeline", "Door-knocking route planner", "Live NWS storm alerts", "AI message generation", "7-day free trial"].map((f) => (
                <li key={f} style={{ padding: "6px 0", fontSize: 14, color: "rgba(255,255,255,0.7)", display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <span style={{ color: "#00ff41", fontWeight: 700 }}>✓</span> {f}
                </li>
              ))}
            </ul>
            <Link href="/storm/signup" style={{ display: "inline-block", marginTop: 20, padding: "12px 28px", background: "linear-gradient(135deg,#e94560,#ff6b35)", color: "#fff", fontSize: 14, fontWeight: 800, borderRadius: 10, textDecoration: "none" }}>
              Start Free Trial →
            </Link>
          </div>
          <div style={{ padding: 32, borderRadius: 24, background: "rgba(255,215,0,0.03)", border: "2px solid rgba(255,215,0,0.25)" }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: "#FFD700", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>⚡ AI PRO</div>
            <h3 style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 4 }}>ProStorm Patrol AI Pro</h3>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 20, marginTop: 12 }}>
              <span style={{ fontSize: 48, fontWeight: 800, color: "#FFD700" }}>$2,000</span>
              <span style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>/month per ZIP</span>
            </div>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {["Everything in Standard", "NVIDIA Earth-2 AI forecasting", "72-hour hail prediction", "GraphCast on A100 GPU", "AI claim narrative generator", "Pre-storm alert automation", "Priority territory lock", "AI Pro certification badge", "7-day free trial"].map((f) => (
                <li key={f} style={{ padding: "6px 0", fontSize: 14, color: "rgba(255,255,255,0.7)", display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <span style={{ color: "#FFD700", fontWeight: 700 }}>✓</span> {f}
                </li>
              ))}
            </ul>
            <Link href="/storm/signup" style={{ display: "inline-block", marginTop: 20, padding: "12px 28px", background: "linear-gradient(135deg,#FFD700,#FFA500)", color: "#000", fontSize: 14, fontWeight: 800, borderRadius: 10, textDecoration: "none" }}>
              Claim Your Territory →
            </Link>
          </div>
        </div>
      </section>

      {/* CLOSE */}
      <section style={{ maxWidth: 600, margin: "0 auto", padding: "60px 24px", textAlign: "center" }}>
        <div style={{ padding: 40, borderRadius: 24, background: "linear-gradient(135deg,rgba(233,69,96,0.05),rgba(0,255,65,0.03))", border: "2px solid rgba(233,69,96,0.3)" }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>40 Gold Territories. One Contractor Each.</h2>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 16, lineHeight: 1.65, marginBottom: 20 }}>
            Available in Colorado, Texas, Oklahoma, Kansas, and Nebraska. Once your ZIP is taken, it's gone.
            Storm season is coming. Are you ready?
          </p>
          <Link href="/storm/signup" style={{ display: "inline-block", padding: "14px 32px", background: "linear-gradient(135deg,#e94560,#ff6b35)", color: "#fff", fontSize: 14, fontWeight: 800, borderRadius: 10, textDecoration: "none", boxShadow: "0 0 20px rgba(233,69,96,0.3)" }}>
            Claim Your Territory →
          </Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}