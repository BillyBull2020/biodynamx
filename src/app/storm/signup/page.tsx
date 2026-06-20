"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { SiteNav, SiteFooter } from "@/components/SiteNavFooter";

// Territory data — top 40 Gold ZIPs across 5 states
const GOLD_TERRITORIES = [
  { zip: "76909", state: "TX", score: 73.5, reports: 54, maxHail: '3.0"', city: "San Angelo area" },
  { zip: "73019", state: "OK", score: 71.7, reports: 98, maxHail: '2.0"', city: "Norman/Choctaw" },
  { zip: "73069", state: "OK", score: 70.5, reports: 42, maxHail: '2.75"', city: "Okarche area" },
  { zip: "76086", state: "TX", score: 70.3, reports: 39, maxHail: '3.0"', city: "Weatherford area" },
  { zip: "78843", state: "TX", score: 70.1, reports: 44, maxHail: '4.0"', city: "Del Rio area" },
  { zip: "79703", state: "TX", score: 69.3, reports: 48, maxHail: '3.0"', city: "Midland area" },
  { zip: "79761", state: "TX", score: 69.0, reports: 47, maxHail: '3.0"', city: "Odessa area" },
  { zip: "79701", state: "TX", score: 68.1, reports: 43, maxHail: '4.0"', city: "Odessa area" },
  { zip: "73134", state: "OK", score: 68.1, reports: 33, maxHail: '2.75"', city: "Oklahoma City N" },
  { zip: "76262", state: "TX", score: 65.6, reports: 47, maxHail: '3.0"', city: "Roanoke area" },
  { zip: "76002", state: "TX", score: 65.2, reports: 29, maxHail: '2.75"', city: "Arlington SE" },
  { zip: "79016", state: "TX", score: 65.0, reports: 44, maxHail: '2.5"', city: "Canyon area" },
  { zip: "79110", state: "TX", score: 64.9, reports: 43, maxHail: '2.0"', city: "Amarillo area" },
  { zip: "73160", state: "OK", score: 64.2, reports: 34, maxHail: '2.0"', city: "Sapulpa area" },
  { zip: "66506", state: "KS", score: 63.4, reports: 27, maxHail: '3.5"', city: "Manhattan area" },
  { zip: "73505", state: "OK", score: 63.3, reports: 48, maxHail: '4.0"', city: "Lawton area" },
  { zip: "69355", state: "NE", score: 62.5, reports: 31, maxHail: '3.5"', city: "Marsland area" },
  { zip: "76939", state: "TX", score: 62.3, reports: 33, maxHail: '2.75"', city: "Eldorado area" },
  { zip: "69001", state: "NE", score: 61.8, reports: 52, maxHail: '4.0"', city: "Benkelman area" },
  { zip: "78611", state: "TX", score: 61.5, reports: 35, maxHail: '3.0"', city: "Burnet area" },
  { zip: "74820", state: "OK", score: 61.0, reports: 74, maxHail: '6.0"', city: "Bristow area" },
  { zip: "80826", state: "CO", score: 72.1, reports: 41, maxHail: '3.0"', city: "Calhan area" },
  { zip: "80911", state: "CO", score: 70.7, reports: 50, maxHail: '4.0"', city: "Colorado Springs SE" },
  { zip: "80905", state: "CO", score: 67.5, reports: 43, maxHail: '2.75"', city: "Colorado Springs" },
  { zip: "80924", state: "CO", score: 65.1, reports: 41, maxHail: '2.0"', city: "Colorado Springs E" },
  { zip: "80705", state: "CO", score: 63.5, reports: 30, maxHail: '3.0"', city: "Burlington area" },
  { zip: "80918", state: "CO", score: 62.8, reports: 32, maxHail: '1.75"', city: "Colorado Springs" },
  { zip: "81003", state: "CO", score: 62.7, reports: 40, maxHail: '1.75"', city: "Pueblo Central" },
  { zip: "80927", state: "CO", score: 62.6, reports: 40, maxHail: '2.5"', city: "Colorado Springs N" },
  { zip: "80915", state: "CO", score: 61.6, reports: 27, maxHail: '2.0"', city: "Colorado Springs E" },
  { zip: "80720", state: "CO", score: 61.5, reports: 51, maxHail: '4.0"', city: "Haxtun area" },
  { zip: "80755", state: "CO", score: 61.1, reports: 54, maxHail: '3.0"', city: "Julesburg area" },
  { zip: "80743", state: "CO", score: 60.8, reports: 47, maxHail: '4.5"', city: "Holyoke area" },
  { zip: "73019", state: "OK", score: 71.7, reports: 98, maxHail: '2.0"', city: "Norman area" },
  { zip: "74055", state: "OK", score: 59.2, reports: 40, maxHail: '1.75"', city: "Owasso area" },
  { zip: "67748", state: "KS", score: 59.7, reports: 74, maxHail: '4.0"', city: "Grinnell area" },
  { zip: "67601", state: "KS", score: 59.0, reports: 62, maxHail: '4.0"', city: "Hays area" },
  { zip: "68116", state: "NE", score: 60.2, reports: 24, maxHail: '2.0"', city: "Omaha NW" },
  { zip: "69341", state: "NE", score: 59.9, reports: 52, maxHail: '2.75"', city: "Alliance area" },
  { zip: "68025", state: "NE", score: 59.0, reports: 37, maxHail: '4.5"', city: "Holland area" },
];

const STATE_COLORS: Record<string, string> = { CO: "#e94560", TX: "#ff6b35", OK: "#76b900", KS: "#FFD700", NE: "#00ff41" };

export default function StormShieldSignup() {
  const [step, setStep] = useState(1);
  const [selectedTerritory, setSelectedTerritory] = useState<typeof GOLD_TERRITORIES[0] | null>(null);
  const [plan, setPlan] = useState<"standard" | "pro">("standard");
  const [filterState, setFilterState] = useState<string>("ALL");
  const [contractor, setContractor] = useState({
    company: "",
    contactName: "",
    email: "",
    phone: "",
    license: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);
  const [signupLoading, setSignupLoading] = useState(false);

  const filteredTerritories = filterState === "ALL"
    ? GOLD_TERRITORIES
    : GOLD_TERRITORIES.filter((t) => t.state === filterState);

  const stateCounts: Record<string, number> = {};
  GOLD_TERRITORIES.forEach((t) => { stateCounts[t.state] = (stateCounts[t.state] || 0) + 1; });

  const handleSelectTerritory = (territory: typeof GOLD_TERRITORIES[0]) => {
    setSelectedTerritory(territory);
    setStep(2);
  };

  const handleSignup = async () => {
    if (!contractor.company || !contractor.email || !contractor.phone) {
      setSignupError("Please fill in all required fields");
      return;
    }
    if (!selectedTerritory) {
      setSignupError("No territory selected");
      return;
    }

    setSignupLoading(true);
    setSignupError(null);

    try {
      const resp = await fetch("/api/storm/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: contractor.company,
          contactName: contractor.contactName,
          email: contractor.email,
          phone: contractor.phone,
          license: contractor.license,
          territoryZip: selectedTerritory.zip,
          territoryState: selectedTerritory.state,
          territoryScore: selectedTerritory.score,
          plan: plan,
        }),
      });

      const data = await resp.json();

      if (!resp.ok) {
        if (data.territory_taken) {
          setSignupError(`Sorry — territory ${selectedTerritory.zip} was just claimed by another contractor. Please go back and choose a different territory.`);
        } else {
          setSignupError(data.error || "Signup failed. Please try again.");
        }
        setSignupLoading(false);
        return;
      }

      setSubmitted(true);
      setStep(4);
    } catch (e: any) {
      setSignupError("Network error: " + e.message);
    }
    setSignupLoading(false);
  };

  return (
    <main style={{ minHeight: "100vh", background: "#050505", color: "#fff", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <SiteNav />

      {/* PROGRESS BAR */}
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "30px 24px 10px" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {["Territory", "Plan", "Details", "Done"].map((label, i) => (
            <div key={i} style={{ flex: 1, textAlign: "center" }}>
              <div style={{
                height: 4, borderRadius: 2, marginBottom: 6,
                background: step > i ? "#e94560" : "rgba(255,255,255,0.1)",
                transition: "background 0.3s",
              }} />
              <div style={{ fontSize: 11, color: step > i ? "#e94560" : "rgba(255,255,255,0.3)", fontWeight: 600 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* STEP 1: TERRITORY SELECTION */}
      {step === 1 && (
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px 60px" }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, textAlign: "center" }}>Choose Your Territory</h1>
          <p style={{ color: "rgba(255,255,255,0.5)", textAlign: "center", marginBottom: 24, fontSize: 15 }}>
            One contractor per ZIP. Once claimed, it's gone. 40 Gold territories available across 5 states.
          </p>

          {/* State filter */}
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 24, flexWrap: "wrap" }}>
            <button
              onClick={() => setFilterState("ALL")}
              style={{
                padding: "6px 16px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700,
                background: filterState === "ALL" ? "#e94560" : "rgba(255,255,255,0.08)",
                color: filterState === "ALL" ? "#fff" : "rgba(255,255,255,0.5)",
              }}
            >All ({GOLD_TERRITORIES.length})</button>
            {Object.entries(stateCounts).map(([state, count]) => (
              <button
                key={state}
                onClick={() => setFilterState(state)}
                style={{
                  padding: "6px 16px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700,
                  background: filterState === state ? (STATE_COLORS[state] || "#e94560") : "rgba(255,255,255,0.08)",
                  color: filterState === state ? "#000" : "rgba(255,255,255,0.5)",
                }}
              >{state} ({count})</button>
            ))}
          </div>

          {/* Territory cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 12 }}>
            {filteredTerritories.map((t, i) => (
              <div
                key={`${t.zip}-${i}`}
                onClick={() => handleSelectTerritory(t)}
                style={{
                  padding: 16, borderRadius: 12, cursor: "pointer",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = STATE_COLORS[t.state] || "#e94560"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.transform = "none"; }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>{t.zip}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{t.city}</div>
                  </div>
                  <div style={{
                    padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 800,
                    background: STATE_COLORS[t.state] || "#e94560", color: "#000",
                  }}>{t.state}</div>
                </div>
                <div style={{ display: "flex", gap: 12, fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
                  <span>Score: <b style={{ color: "#e94560" }}>{t.score}</b></span>
                  <span>{t.reports} reports</span>
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
                  Max hail: <b style={{ color: "#ff6b35" }}>{t.maxHail}</b>
                </div>
                <div style={{
                  marginTop: 10, padding: "6px 12px", borderRadius: 6, textAlign: "center",
                  background: "linear-gradient(135deg,#e94560,#ff6b35)", color: "#fff",
                  fontSize: 11, fontWeight: 700,
                }}>CLAIM THIS TERRITORY →</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 2: PLAN SELECTION */}
      {step === 2 && selectedTerritory && (
        <div style={{ maxWidth: 700, margin: "0 auto", padding: "0 24px 60px" }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, textAlign: "center" }}>Choose Your Plan</h1>
          <p style={{ color: "rgba(255,255,255,0.5)", textAlign: "center", marginBottom: 24, fontSize: 15 }}>
            Territory: <b style={{ color: STATE_COLORS[selectedTerritory.state] }}>{selectedTerritory.zip}</b> ({selectedTerritory.city}, {selectedTerritory.state}) — Score: {selectedTerritory.score}/100
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 20 }}>
            {/* Standard */}
            <div
              onClick={() => { setPlan("standard"); setStep(3); }}
              style={{
                padding: 28, borderRadius: 20, cursor: "pointer",
                background: "rgba(255,255,255,0.03)",
                border: plan === "standard" ? "2px solid #e94560" : "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>STANDARD</div>
              <div style={{ fontSize: 36, fontWeight: 800, color: "#e94560" }}>$500<span style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>/mo</span></div>
              <ul style={{ listStyle: "none", padding: 0, marginTop: 16 }}>
                {["Exclusive ZIP territory", "Live HRRR hail risk", "Homeowner CRM", "Claim pipeline", "Route planner", "NWS storm alerts", "AI message generation"].map((f) => (
                  <li key={f} style={{ padding: "4px 0", fontSize: 13, color: "rgba(255,255,255,0.6)", display: "flex", gap: 8 }}>
                    <span style={{ color: "#00ff41" }}>✓</span> {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* AI Pro */}
            <div
              onClick={() => { setPlan("pro"); setStep(3); }}
              style={{
                padding: 28, borderRadius: 20, cursor: "pointer",
                background: "rgba(255,215,0,0.03)",
                border: plan === "pro" ? "2px solid #FFD700" : "1px solid rgba(255,215,0,0.15)",
              }}
            >
              <div style={{ fontSize: 10, fontWeight: 800, color: "#FFD700", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>⚡ AI PRO</div>
              <div style={{ fontSize: 36, fontWeight: 800, color: "#FFD700" }}>$2,000<span style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>/mo</span></div>
              <ul style={{ listStyle: "none", padding: 0, marginTop: 16 }}>
                {["Everything in Standard", "NVIDIA Earth-2 AI", "72hr hail prediction", "AI claim narratives", "Pre-storm automation", "Priority territory lock", "AI Pro badge"].map((f) => (
                  <li key={f} style={{ padding: "4px 0", fontSize: 13, color: "rgba(255,255,255,0.6)", display: "flex", gap: 8 }}>
                    <span style={{ color: "#FFD700" }}>✓</span> {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div style={{ textAlign: "center", marginTop: 24 }}>
            <button onClick={() => setStep(1)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 13 }}>← Back to territory selection</button>
          </div>
          <p style={{ color: "rgba(255,255,255,0.3)", textAlign: "center", fontSize: 13, marginTop: 16 }}>7-day free trial. No charge until trial ends. Cancel anytime.</p>
        </div>
      )}

      {/* STEP 3: CONTRACTOR DETAILS */}
      {step === 3 && selectedTerritory && (
        <div style={{ maxWidth: 500, margin: "0 auto", padding: "0 24px 60px" }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, textAlign: "center" }}>Your Details</h1>
          <p style={{ color: "rgba(255,255,255,0.5)", textAlign: "center", marginBottom: 24, fontSize: 15 }}>
            Claiming: <b style={{ color: STATE_COLORS[selectedTerritory.state] }}>{selectedTerritory.zip}</b> ({selectedTerritory.state}) — {plan === "pro" ? "AI Pro $2,000/mo" : "Standard $500/mo"}
          </p>

          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 24 }}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: 4 }}>Company Name *</label>
              <input
                type="text" value={contractor.company} onChange={(e) => setContractor({ ...contractor, company: e.target.value })}
                placeholder="Apex Roofing LLC"
                style={{ width: "100%", padding: "10px 14px", background: "#050505", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 14, fontFamily: "inherit" }}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: 4 }}>Contact Name *</label>
              <input
                type="text" value={contractor.contactName} onChange={(e) => setContractor({ ...contractor, contactName: e.target.value })}
                placeholder="Mike Johnson"
                style={{ width: "100%", padding: "10px 14px", background: "#050505", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 14, fontFamily: "inherit" }}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: 4 }}>Email *</label>
              <input
                type="email" value={contractor.email} onChange={(e) => setContractor({ ...contractor, email: e.target.value })}
                placeholder="mike@apexroofing.com"
                style={{ width: "100%", padding: "10px 14px", background: "#050505", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 14, fontFamily: "inherit" }}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: 4 }}>Phone *</label>
              <input
                type="tel" value={contractor.phone} onChange={(e) => setContractor({ ...contractor, phone: e.target.value })}
                placeholder="(719) 555-0100"
                style={{ width: "100%", padding: "10px 14px", background: "#050505", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 14, fontFamily: "inherit" }}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: 4 }}>License # (optional)</label>
              <input
                type="text" value={contractor.license} onChange={(e) => setContractor({ ...contractor, license: e.target.value })}
                placeholder="CO-ROOF-12345"
                style={{ width: "100%", padding: "10px 14px", background: "#050505", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 14, fontFamily: "inherit" }}
              />
            </div>

            {signupError && (
              <div style={{ marginBottom: 12, padding: 12, borderRadius: 8, background: "rgba(233,69,96,0.1)", border: "1px solid rgba(233,69,96,0.3)", color: "#e94560", fontSize: 13 }}>
                ⚠️ {signupError}
              </div>
            )}

            <button
              onClick={handleSignup}
              disabled={signupLoading}
              style={{
                width: "100%", padding: "14px", border: "none", borderRadius: 10, cursor: signupLoading ? "wait" : "pointer",
                background: "linear-gradient(135deg,#e94560,#ff6b35)", color: "#fff",
                fontSize: 15, fontWeight: 800, marginTop: 8, opacity: signupLoading ? 0.6 : 1,
              }}
            >
              {signupLoading ? "Claiming territory..." : "Start 7-Day Free Trial →"}
            </button>
          </div>

          <div style={{ textAlign: "center", marginTop: 16 }}>
            <button onClick={() => setStep(2)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 13 }}>← Back to plan selection</button>
          </div>
        </div>
      )}

      {/* STEP 4: CONFIRMATION */}
      {step === 4 && selectedTerritory && submitted && (
        <div style={{ maxWidth: 500, margin: "0 auto", padding: "60px 24px", textAlign: "center" }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Territory Claimed!</h1>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 16, marginBottom: 24, lineHeight: 1.65 }}>
            <b style={{ color: STATE_COLORS[selectedTerritory.state] }}>{selectedTerritory.zip}</b> ({selectedTerritory.city}, {selectedTerritory.state}) is now exclusively yours.<br /><br />
            Plan: <b style={{ color: plan === "pro" ? "#FFD700" : "#e94560" }}>{plan === "pro" ? "AI Pro $2,000/mo" : "Standard $500/mo"}</b><br />
            Trial: 7 days free — no charge until {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
          </p>

          <div style={{ background: "rgba(0,255,65,0.05)", border: "1px solid rgba(0,255,65,0.15)", borderRadius: 12, padding: 20, marginBottom: 24, textAlign: "left" }}>
            <h3 style={{ color: "#00ff41", fontSize: 14, marginBottom: 10 }}>✓ What happens next:</h3>
            <ul style={{ listStyle: "none", padding: 0, fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.8 }}>
              <li>1. We've sent a confirmation email to <b style={{ color: "#fff" }}>{contractor.email}</b></li>
              <li>2. Your territory is locked — no other contractor can claim it</li>
              <li>3. Download the ProStorm Patrol dashboard to start managing your territory</li>
              <li>4. Begin building homeowner relationships before storm season</li>
            </ul>
          </div>

          <a
            href="/storm"
            style={{
              display: "inline-block", padding: "14px 32px",
              background: "linear-gradient(135deg,#e94560,#ff6b35)",
              color: "#fff", fontSize: 14, fontWeight: 800, borderRadius: 10, textDecoration: "none",
            }}
          >
            Download Dashboard →
          </a>

          <div style={{ marginTop: 20 }}>
            <Link href="/" style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, textDecoration: "none" }}>Return to BioDynamX</Link>
          </div>
        </div>
      )}

      <SiteFooter />
    </main>
  );
}