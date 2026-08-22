import React, { useState, useMemo } from "react";
import { Sprout, Wheat, Droplets, Info, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";


const CROPS = [
  { id: "wheat", label: "Wheat", icon: Wheat, baseKgPerAcre: 50 },
  { id: "rice", label: "Rice", icon: Droplets, baseKgPerAcre: 60 },
  { id: "cotton", label: "Cotton", icon: Sprout, baseKgPerAcre: 45 },
  { id: "sugarcane", label: "Sugarcane", icon: Sprout, baseKgPerAcre: 80 },
  { id: "maize", label: "Maize", icon: Wheat, baseKgPerAcre: 55 },
  { id: "pulses", label: "Pulses", icon: Sprout, baseKgPerAcre: 20 },
];

const SOILS = [
  { id: "alluvial", label: "Alluvial", multiplier: 1.0 },
  { id: "black", label: "Black (regur)", multiplier: 0.9 },
  { id: "red", label: "Red", multiplier: 1.1 },
  { id: "laterite", label: "Laterite", multiplier: 1.2 },
  { id: "sandy", label: "Sandy", multiplier: 1.3 },
  { id: "loamy", label: "Loamy", multiplier: 0.95 },
  { id: "clay", label: "Clay", multiplier: 1.05 },
];

const TIPS_BY_CROP = {
  wheat: [
    "Split into two doses: half at sowing, half at first irrigation.",
    "Avoid application right before heavy rain to limit runoff.",
  ],
  rice: [
    "Apply in standing water no deeper than 5 cm for even uptake.",
    "Hold the third dose until panicle initiation stage.",
  ],
  cotton: [
    "Band the dose 5–7 cm from the root zone, not directly on stems.",
    "Follow with light irrigation within 24 hours.",
  ],
  sugarcane: [
    "Apply in three splits across the growth cycle, not all at planting.",
    "Earth up the rows after the second split to reduce loss.",
  ],
  maize: [
    "Side-dress at knee-height stage for best nitrogen uptake.",
    "Keep granules off the leaf whorl to avoid scorching.",
  ],
  pulses: [
    "Pulses fix their own nitrogen — over-application can reduce yield.",
    "A small starter dose at sowing is usually enough.",
  ],
};

function estimateLocally(cropId, area, soilId) {
  const crop = CROPS.find((c) => c.id === cropId);
  const soil = SOILS.find((s) => s.id === soilId);
  const perAcre = Math.round(crop.baseKgPerAcre * soil.multiplier);
  const total = Math.round(perAcre * area);
  return {
    recommendedKgPerAcre: perAcre,
    totalKg: total,
    tips: TIPS_BY_CROP[cropId] || [],
  };
}

export default function DosageCalculator() {
  const [cropType, setCropType] = useState("wheat");
  const [landArea, setLandArea] = useState("2");
  const [soilType, setSoilType] = useState("alluvial");
  const [status, setStatus] = useState("idle"); // idle | loading | done | error
  const [result, setResult] = useState(null);
  const [usedFallback, setUsedFallback] = useState(false);
  const [areaError, setAreaError] = useState("");

  const selectedCrop = useMemo(() => CROPS.find((c) => c.id === cropType), [cropType]);

  const gaugePercent = result
    ? Math.max(6, Math.min(100, Math.round((result.recommendedKgPerAcre / 120) * 100)))
    : 0;

  async function handleCalculate(e) {
    e.preventDefault();
    const areaNum = parseFloat(landArea);
    if (!landArea || isNaN(areaNum) || areaNum <= 0) {
      setAreaError("Enter a land area greater than 0.");
      return;
    }
    setAreaError("");
    setStatus("loading");
    setUsedFallback(false);

    try {
      const res = await fetch("/api/advisory/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cropType, landArea: areaNum, soilType }),
      });
      if (!res.ok) throw new Error("Request failed");
      const data = await res.json();
      const totalKg = Math.round((data.recommendedKgPerAcre ?? 0) * areaNum);
      setResult({
        recommendedKgPerAcre: Math.round(data.recommendedKgPerAcre ?? 0),
        totalKg,
        tips: data.tips && data.tips.length ? data.tips : TIPS_BY_CROP[cropType] || [],
      });
      setStatus("done");
    } catch (err) {
      const fallback = estimateLocally(cropType, areaNum, soilType);
      setResult(fallback);
      setUsedFallback(true);
      setStatus("done");
    }
  }

  return (
    <div
      style={{
        fontFamily: "'Work Sans', sans-serif",
        background: "#EDE9DD",
        color: "#23281F",
        padding: "2rem 1.25rem",
        borderRadius: 16,
        maxWidth: 960,
        margin: "0 auto",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600&family=Work+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@500;600&display=swap');
        .dc-input, .dc-select {
          font-family: 'Work Sans', sans-serif;
          background: #FBF9F3;
          border: 1px solid #C9C2AC;
          border-radius: 8px;
          padding: 10px 12px;
          font-size: 15px;
          color: #23281F;
          width: 100%;
          box-sizing: border-box;
        }
        .dc-input:focus, .dc-select:focus {
          outline: none;
          border-color: #35633F;
          box-shadow: 0 0 0 3px rgba(53,99,63,0.15);
        }
        .dc-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          border-radius: 10px;
          border: 1px solid #C9C2AC;
          background: #FBF9F3;
          cursor: pointer;
          font-size: 14px;
          font-family: 'Work Sans', sans-serif;
          color: #23281F;
          transition: border-color 0.15s ease, background 0.15s ease;
        }
        .dc-pill:hover { border-color: #35633F; }
        .dc-pill.active {
          background: #35633F;
          border-color: #35633F;
          color: #F7F4EA;
        }
        .dc-btn {
          font-family: 'Work Sans', sans-serif;
          font-weight: 600;
          font-size: 15px;
          background: #35633F;
          color: #F7F4EA;
          border: none;
          border-radius: 10px;
          padding: 12px 20px;
          cursor: pointer;
          width: 100%;
        }
        .dc-btn:hover { background: #2A4E32; }
        .dc-btn:disabled { opacity: 0.7; cursor: default; }
        @media (min-width: 720px) {
          .dc-grid { grid-template-columns: 1fr 1fr; }
        }
      `}</style>

      <div style={{ marginBottom: "1.5rem" }}>
        <p style={{ margin: 0, fontSize: 12, letterSpacing: "0.06em", textTransform: "uppercase", color: "#5F5E5A" }}>
          Farmer advisory · Dosage calculator
        </p>
        <h1
          style={{
            fontFamily: "'Fraunces', serif",
            fontWeight: 600,
            fontSize: 28,
            margin: "4px 0 0",
          }}
        >
          How much to apply, and where
        </h1>
      </div>

      <div className="dc-grid" style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.5rem" }}>
        {/* Form */}
        <form
          onSubmit={handleCalculate}
          style={{
            background: "#F7F4EA",
            border: "1px solid #C9C2AC",
            borderRadius: 14,
            padding: "1.25rem",
          }}
        >
          <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 8 }}>Crop</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 16 }}>
            {CROPS.map((crop) => {
              const Icon = crop.icon;
              return (
                <div
                  key={crop.id}
                  className={`dc-pill ${cropType === crop.id ? "active" : ""}`}
                  onClick={() => setCropType(crop.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && setCropType(crop.id)}
                >
                  <Icon size={16} />
                  {crop.label}
                </div>
              );
            })}
          </div>

          <label htmlFor="land-area" style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 8 }}>
            Land area (acres)
          </label>
          <input
            id="land-area"
            className="dc-input"
            type="number"
            min="0.1"
            step="0.1"
            value={landArea}
            onChange={(e) => {
              setLandArea(e.target.value);
              if (areaError) setAreaError("");
            }}
            placeholder="e.g. 2.5"
            style={{ marginBottom: areaError ? 4 : 16 }}
          />
          {areaError && (
            <p style={{ color: "#A64B2A", fontSize: 13, margin: "0 0 12px" }}>{areaError}</p>
          )}

          <label htmlFor="soil-type" style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 8 }}>
            Soil type
          </label>
          <select
            id="soil-type"
            className="dc-select"
            value={soilType}
            onChange={(e) => setSoilType(e.target.value)}
            style={{ marginBottom: 20 }}
          >
            {SOILS.map((soil) => (
              <option key={soil.id} value={soil.id}>
                {soil.label}
              </option>
            ))}
          </select>

          <button type="submit" className="dc-btn" disabled={status === "loading"}>
            {status === "loading" ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
                <Loader2 size={16} className="dc-spin" style={{ animation: "spin 1s linear infinite" }} />
                Calculating…
              </span>
            ) : (
              "Calculate dosage"
            )}
          </button>
        </form>

        {/* Results */}
        <div
          style={{
            background: "#23281F",
            borderRadius: 14,
            padding: "1.25rem",
            color: "#F7F4EA",
            minHeight: 260,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {status === "idle" && (
            <div style={{ margin: "auto", textAlign: "center", color: "#B4B2A9", maxWidth: 260 }}>
              <Info size={22} style={{ marginBottom: 8 }} />
              <p style={{ fontSize: 14, margin: 0 }}>
                Fill in the crop, land area and soil type, then calculate to see the recommended dose.
              </p>
            </div>
          )}

          {status === "loading" && (
            <div style={{ margin: "auto", textAlign: "center", color: "#B4B2A9" }}>
              <Loader2 size={22} style={{ animation: "spin 1s linear infinite" }} />
              <p style={{ fontSize: 14, marginTop: 8 }}>Working it out…</p>
            </div>
          )}

          {status === "done" && result && (
            <div style={{ display: "flex", gap: 20, flex: 1 }}>
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                <svg width="34" height="150" viewBox="0 0 34 150" aria-hidden="true">
                  <rect x="1" y="1" width="32" height="148" rx="6" fill="none" stroke="#5F5E5A" strokeWidth="1.5" />
                  <rect
                    x="4"
                    y={146 - (140 * gaugePercent) / 100}
                    width="26"
                    height={(140 * gaugePercent) / 100}
                    rx="3"
                    fill="#D6A419"
                  />
                </svg>
              </div>

              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 12, color: "#B4B2A9", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Recommended
                </p>
                <p
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 34,
                    fontWeight: 600,
                    margin: 0,
                    color: "#D6A419",
                  }}
                >
                  {result.recommendedKgPerAcre} <span style={{ fontSize: 16, color: "#B4B2A9" }}>kg/acre</span>
                </p>

                <p style={{ fontSize: 13, color: "#B4B2A9", margin: "6px 0 18px" }}>
                  {result.totalKg} kg total for {landArea} acre{parseFloat(landArea) === 1 ? "" : "s"} of {selectedCrop.label.toLowerCase()}
                </p>

                {result.tips.length > 0 && (
                  <div style={{ borderTop: "1px solid #444441", paddingTop: 14 }}>
                    <p style={{ fontSize: 12, color: "#B4B2A9", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Usage tips
                    </p>
                    <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, lineHeight: 1.6, color: "#EDE9DD" }}>
                      {result.tips.map((tip, i) => (
                        <li key={i}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {usedFallback ? (
                  <div style={{ display: "flex", gap: 6, alignItems: "flex-start", marginTop: 14, fontSize: 12, color: "#FAC775" }}>
                    <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 2 }} />
                    <span>Couldn't reach the advisory server — showing a local estimate, not a live recommendation.</span>
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 14, fontSize: 12, color: "#97C459" }}>
                    <CheckCircle2 size={14} />
                    <span>From the advisory service.</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}