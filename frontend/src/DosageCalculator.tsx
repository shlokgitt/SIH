import { useState } from "react";
import { Info, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { api } from "./utils/api";

const USAGE_TIPS = [
  "Apply the recommended quantity evenly across your field.",
  "Split into two doses if your area is above 3 acres for better absorption.",
  "Avoid application right before heavy rain to limit runoff.",
  "Store unused slurry in a cool, dry place away from direct sunlight.",
];

interface DosageResult {
  recommendedKgPerAcre: number;
  totalRecommendedKg: number;
  batchCode: string | null;
  labValuesUsed: Record<string, string | number> | null;
}

interface LocalEstimate {
  recommendedKgPerAcre: number;
  totalRecommendedKg: number;
}

// Local fallback when the backend is unreachable
function estimateLocally(cropAreaAcres: number): LocalEstimate {
  const baseDosagePerAcre = 500;
  const recommendedKgPerAcre = baseDosagePerAcre;
  const totalRecommendedKg = recommendedKgPerAcre * cropAreaAcres;
  return { recommendedKgPerAcre, totalRecommendedKg };
}

export default function DosageCalculator() {
  const [orderId, setOrderId] = useState<string>("");
  const [cropAreaAcres, setCropAreaAcres] = useState<string>("2");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [result, setResult] = useState<DosageResult | null>(null);
  const [usedFallback, setUsedFallback] = useState<string | false>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const gaugePercent = result
    ? Math.max(6, Math.min(100, Math.round((result.recommendedKgPerAcre / 1000) * 100)))
    : 0;

  async function handleCalculate(e: React.FormEvent) {
    e.preventDefault();

    // Validate inputs
    if (!orderId.trim()) {
      setErrorMsg("Please enter your Order ID.");
      return;
    }
    const areaNum = parseFloat(cropAreaAcres);
    if (!cropAreaAcres || isNaN(areaNum) || areaNum <= 0) {
      setErrorMsg("Enter a crop area greater than 0.");
      return;
    }

    setErrorMsg("");
    setStatus("loading");
    setUsedFallback(false);

    try {
      const data = await api.advisory.getDosage(orderId.trim(), areaNum);
      setResult({
        recommendedKgPerAcre: Math.round(data.recommendedKgPerAcre ?? 0),
        totalRecommendedKg: Math.round(data.totalRecommendedKg ?? 0),
        batchCode: data.batchCode || null,
        labValuesUsed: data.labValuesUsed || null,
      });
      setStatus("done");
    } catch (err) {
      console.error("API Error:", err);
      // Fallback to local estimate
      const fallback = estimateLocally(areaNum);
      setResult({
        recommendedKgPerAcre: fallback.recommendedKgPerAcre,
        totalRecommendedKg: fallback.totalRecommendedKg,
        batchCode: null,
        labValuesUsed: null,
      });
      setUsedFallback(err instanceof Error ? err.message : "Unknown error");
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
        .dc-input {
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
        .dc-input:focus {
          outline: none;
          border-color: #35633F;
          box-shadow: 0 0 0 3px rgba(53,99,63,0.15);
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
          How much slurry to apply
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
          <label htmlFor="order-id" style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 8 }}>
            Order ID
          </label>
          <input
            id="order-id"
            className="dc-input"
            type="text"
            value={orderId}
            onChange={(e) => {
              setOrderId(e.target.value);
              if (errorMsg) setErrorMsg("");
            }}
            placeholder="e.g. 6a89bf74d730c0724774ac31"
            style={{ marginBottom: 16 }}
          />

          <label htmlFor="crop-area" style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 8 }}>
            Crop area (acres)
          </label>
          <input
            id="crop-area"
            className="dc-input"
            type="number"
            min="0.1"
            step="0.1"
            value={cropAreaAcres}
            onChange={(e) => {
              setCropAreaAcres(e.target.value);
              if (errorMsg) setErrorMsg("");
            }}
            placeholder="e.g. 2.5"
            style={{ marginBottom: errorMsg ? 4 : 20 }}
          />

          {errorMsg && (
            <p style={{ color: "#A64B2A", fontSize: 13, margin: "0 0 12px" }}>{errorMsg}</p>
          )}

          <button type="submit" className="dc-btn" disabled={status === "loading"}>
            {status === "loading" ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
                <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
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
                Enter your order ID and crop area, then calculate to see how much slurry to apply.
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

                <p style={{ fontSize: 13, color: "#B4B2A9", margin: "6px 0 4px" }}>
                  {result.totalRecommendedKg} kg total for {cropAreaAcres} acre{parseFloat(cropAreaAcres) === 1 ? "" : "s"}
                </p>

                {result.batchCode && (
                  <p style={{ fontSize: 12, color: "#97C459", margin: "0 0 14px" }}>
                    Batch: {result.batchCode}
                  </p>
                )}

                {result.labValuesUsed && (
                  <div style={{ borderTop: "1px solid #444441", paddingTop: 14, marginTop: 8 }}>
                    <p style={{ fontSize: 12, color: "#B4B2A9", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Lab values used
                    </p>
                    <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, lineHeight: 1.6, color: "#EDE9DD" }}>
                      {Object.entries(result.labValuesUsed).map(([key, val]) => (
                        <li key={key}>
                          {key}: {val}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div style={{ borderTop: "1px solid #444441", paddingTop: 14, marginTop: 14 }}>
                  <p style={{ fontSize: 12, color: "#B4B2A9", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Usage tips
                  </p>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, lineHeight: 1.6, color: "#EDE9DD" }}>
                    {USAGE_TIPS.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>

                {usedFallback ? (
                  <div style={{ display: "flex", gap: 6, alignItems: "flex-start", marginTop: 14, fontSize: 12, color: "#FAC775" }}>
                    <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 2 }} />
                    <span style={{ wordBreak: "break-word" }}>
                      Couldn't reach the advisory server ({usedFallback}) — showing a local estimate, not a live recommendation.
                    </span>
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