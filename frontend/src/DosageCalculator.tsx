import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Info,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Leaf,
  FlaskConical,
  Calculator,
} from "lucide-react";
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

/*
 * Local fallback when the advisory backend
 * cannot be reached.
 *
 * This is clearly labelled in the UI and should
 * not be treated as a live recommendation.
 */
function estimateLocally(
  cropAreaAcres: number
): LocalEstimate {
  const baseDosagePerAcre = 500;

  const recommendedKgPerAcre =
    baseDosagePerAcre;

  const totalRecommendedKg =
    recommendedKgPerAcre *
    cropAreaAcres;

  return {
    recommendedKgPerAcre,
    totalRecommendedKg,
  };
}

export default function DosageCalculator() {
  const [orderId, setOrderId] =
    useState<string>("");

  const [cropAreaAcres, setCropAreaAcres] =
    useState<string>("2");

  const [status, setStatus] = useState<
    "idle" | "loading" | "done" | "error"
  >("idle");

  const [result, setResult] =
    useState<DosageResult | null>(null);

  const [usedFallback, setUsedFallback] =
    useState<string | false>(false);

  const [errorMsg, setErrorMsg] =
    useState<string>("");

  /*
   * Visual gauge.
   * 1000 kg/acre is used only as the
   * upper visual scale.
   */
  const gaugePercent = result
    ? Math.max(
        6,
        Math.min(
          100,
          Math.round(
            (result.recommendedKgPerAcre /
              1000) *
              100
          )
        )
      )
    : 0;

  async function handleCalculate(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setErrorMsg("");

    // ==========================================
    // VALIDATE ORDER ID
    // ==========================================

    if (!orderId.trim()) {
      setErrorMsg(
        "Please enter your Order ID."
      );
      setStatus("error");
      return;
    }

    // ==========================================
    // VALIDATE AREA
    // ==========================================

    const areaNum =
      parseFloat(cropAreaAcres);

    if (
      !cropAreaAcres ||
      Number.isNaN(areaNum) ||
      areaNum <= 0
    ) {
      setErrorMsg(
        "Enter a crop area greater than 0."
      );
      setStatus("error");
      return;
    }

    // ==========================================
    // START CALCULATION
    // ==========================================

    setStatus("loading");
    setUsedFallback(false);
    setResult(null);

    try {
      const data =
        await api.advisory.getDosage(
          orderId.trim(),
          areaNum
        );

      setResult({
        recommendedKgPerAcre: Math.round(
          data.recommendedKgPerAcre ?? 0
        ),

        totalRecommendedKg: Math.round(
          data.totalRecommendedKg ?? 0
        ),

        batchCode:
          data.batchCode || null,

        labValuesUsed:
          data.labValuesUsed || null,
      });

      setStatus("done");
    } catch (err) {
      console.error(
        "Advisory API Error:",
        err
      );

      /*
       * Preserve the existing fallback behaviour.
       */
      const fallback =
        estimateLocally(areaNum);

      setResult({
        recommendedKgPerAcre:
          fallback.recommendedKgPerAcre,

        totalRecommendedKg:
          fallback.totalRecommendedKg,

        batchCode: null,
        labValuesUsed: null,
      });

      setUsedFallback(
        err instanceof Error
          ? err.message
          : "Unknown error"
      );

      setStatus("done");
    }
  }

  return (
    <div className="dosage-page">

      <div className="dosage-container">

        {/* ==========================================
            PAGE HEADER
        ========================================== */}

        <div className="dosage-header">
          <Link to="/" className="home-button">
            <Calculator size={18} />
            Go to Home
          </Link>

          <div className="dosage-eyebrow">
            <Leaf size={15} />
            Farmer Advisory
          </div>

          <h1>
            Dosage Calculator
          </h1>

          <p>
            Calculate the recommended quantity
            of organic slurry for your field using
            your order and crop area.
          </p>

        </div>

        {/* ==========================================
            MAIN GRID
        ========================================== */}

        <div className="dosage-grid">

          {/* ========================================
              INPUT CARD
          ======================================== */}

          <form
            onSubmit={handleCalculate}
            className="dosage-form-card"
          >

            <div className="dosage-card-heading">

              <div className="dosage-card-icon">
                <Calculator size={21} />
              </div>

              <div>
                <h2>
                  Calculate Application
                </h2>

                <p>
                  Enter your order details below.
                </p>
              </div>

            </div>

            {/* ======================================
                ORDER ID
            ====================================== */}

            <div className="dosage-field">

              <label htmlFor="order-id">
                Order ID
              </label>

              <input
                id="order-id"
                type="text"
                value={orderId}
                onChange={(e) => {
                  setOrderId(
                    e.target.value
                  );

                  if (errorMsg) {
                    setErrorMsg("");
                    setStatus("idle");
                  }
                }}
                placeholder="e.g. 6a89bf74d730c0724774ac31"
              />

              <small>
                Use the Order ID associated
                with your purchased batch.
              </small>

            </div>

            {/* ======================================
                CROP AREA
            ====================================== */}

            <div className="dosage-field">

              <label htmlFor="crop-area">
                Crop area
              </label>

              <div className="dosage-input-unit">

                <input
                  id="crop-area"
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={cropAreaAcres}
                  onChange={(e) => {
                    setCropAreaAcres(
                      e.target.value
                    );

                    if (errorMsg) {
                      setErrorMsg("");
                      setStatus("idle");
                    }
                  }}
                  placeholder="e.g. 2.5"
                />

                <span>
                  acres
                </span>

              </div>

            </div>

            {/* ======================================
                ERROR
            ====================================== */}

            {errorMsg && (
              <div className="dosage-error">

                <AlertTriangle size={17} />

                <span>
                  {errorMsg}
                </span>

              </div>
            )}

            {/* ======================================
                SUBMIT
            ====================================== */}

            <button
              type="submit"
              className="dosage-submit-btn"
              disabled={
                status === "loading"
              }
            >
              {status === "loading" ? (
                <>
                  <Loader2
                    size={18}
                    className="dosage-spin"
                  />

                  Calculating...
                </>
              ) : (
                <>
                  <Calculator size={18} />

                  Calculate Dosage
                </>
              )}
            </button>

            <div className="dosage-info-note">

              <Info size={16} />

              <span>
                Recommendations are based on
                the advisory service and the
                batch associated with your order.
              </span>

            </div>

          </form>

          {/* ========================================
              RESULT CARD
          ======================================== */}

          <div className="dosage-result-card">

            {status === "idle" && (
              <div className="dosage-result-empty">

                <div className="dosage-result-empty-icon">
                  <FlaskConical size={26} />
                </div>

                <h3>
                  Your recommendation
                </h3>

                <p>
                  Enter your Order ID and crop
                  area to calculate the amount
                  of slurry recommended for
                  your field.
                </p>

              </div>
            )}

            {status === "loading" && (
              <div className="dosage-result-loading">

                <Loader2
                  size={34}
                  className="dosage-spin"
                />

                <h3>
                  Calculating...
                </h3>

                <p>
                  Getting your advisory
                  recommendation.
                </p>

              </div>
            )}

            {status === "error" && (
              <div className="dosage-result-empty">

                <div className="dosage-result-empty-icon error">
                  <AlertTriangle size={26} />
                </div>

                <h3>
                  Check your inputs
                </h3>

                <p>
                  Correct the highlighted
                  information and try again.
                </p>

              </div>
            )}

            {status === "done" &&
              result && (
                <div className="dosage-result-content">

                  {/* ==================================
                      RESULT HEADER
                  ================================== */}

                  <div className="dosage-result-heading">

                    <div>
                      <span>
                        RECOMMENDED APPLICATION
                      </span>

                      <h2>
                        {result.recommendedKgPerAcre}
                        <small>
                          kg / acre
                        </small>
                      </h2>
                    </div>

                    <div className="dosage-check">
                      <CheckCircle2
                        size={22}
                      />
                    </div>

                  </div>

                  {/* ==================================
                      TOTAL
                  ================================== */}

                  <div className="dosage-total-box">

                    <div>
                      <span>
                        Total recommended quantity
                      </span>

                      <strong>
                        {result.totalRecommendedKg.toLocaleString(
                          "en-IN"
                        )}{" "}
                        kg
                      </strong>
                    </div>

                    <div>
                      <span>
                        Crop area
                      </span>

                      <strong>
                        {cropAreaAcres}{" "}
                        acre
                        {parseFloat(
                          cropAreaAcres
                        ) === 1
                          ? ""
                          : "s"}
                      </strong>
                    </div>

                  </div>

                  {/* ==================================
                      VISUAL GAUGE
                  ================================== */}

                  <div className="dosage-gauge-section">

                    <div className="dosage-gauge-label">
                      <span>
                        Application level
                      </span>

                      <span>
                        {gaugePercent}%
                      </span>
                    </div>

                    <div className="dosage-gauge">

                      <div
                        className="dosage-gauge-fill"
                        style={{
                          width: `${gaugePercent}%`,
                        }}
                      />

                    </div>

                  </div>

                  {/* ==================================
                      BATCH
                  ================================== */}

                  {result.batchCode && (
                    <div className="dosage-batch">

                      <span>
                        Batch used
                      </span>

                      <strong>
                        {result.batchCode}
                      </strong>

                    </div>
                  )}

                  {/* ==================================
                      LAB VALUES
                  ================================== */}

                  {result.labValuesUsed && (
                    <div className="dosage-section">

                      <div className="dosage-section-title">
                        <FlaskConical
                          size={17}
                        />

                        <span>
                          Lab values used
                        </span>
                      </div>

                      <div className="dosage-lab-grid">

                        {Object.entries(
                          result.labValuesUsed
                        ).map(
                          ([key, value]) => (
                            <div
                              key={key}
                              className="dosage-lab-item"
                            >
                              <span>
                                {key}
                              </span>

                              <strong>
                                {value}
                              </strong>
                            </div>
                          )
                        )}

                      </div>

                    </div>
                  )}

                  {/* ==================================
                      USAGE TIPS
                  ================================== */}

                  <div className="dosage-section">

                    <div className="dosage-section-title">
                      <Leaf size={17} />

                      <span>
                        Usage tips
                      </span>
                    </div>

                    <ul className="dosage-tips">

                      {USAGE_TIPS.map(
                        (tip, index) => (
                          <li key={index}>
                            {tip}
                          </li>
                        )
                      )}

                    </ul>

                  </div>

                  {/* ==================================
                      SERVICE STATUS
                  ================================== */}

                  {usedFallback ? (
                    <div className="dosage-fallback">

                      <AlertTriangle
                        size={16}
                      />

                      <span>
                        The advisory server
                        could not be reached.
                        A local estimate is
                        being shown instead
                        of a live recommendation.
                      </span>

                    </div>
                  ) : (
                    <div className="dosage-live">

                      <CheckCircle2
                        size={16}
                      />

                      <span>
                        Recommendation provided
                        by the advisory service.
                      </span>

                    </div>
                  )}

                </div>
              )}

          </div>

        </div>

      </div>

      {/* ==========================================
          PAGE STYLES
      ========================================== */}

      <style>{`

        .dosage-page {
          min-height: 100vh;
          background: #f5f8f3;
          color: #123f32;
          padding: 56px 24px 80px;
          box-sizing: border-box;
        }

        .dosage-container {
          width: min(1100px, 100%);
          margin: 0 auto;
        }

        /* HEADER */

        .dosage-header {
          text-align: center;
          margin-bottom: 36px;
        }

        .dosage-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 12px;
          padding: 6px 11px;
          border-radius: 999px;
          background: #e7f3e9;
          color: #267353;
          font-size: 0.76rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .dosage-header h1 {
          margin: 0 0 12px;
          color: #103f32;
          font-size: 2.35rem;
          line-height: 1.15;
          letter-spacing: -0.03em;
        }

        .dosage-header p {
          max-width: 680px;
          margin: 0 auto;
          color: #6b8178;
          font-size: 1rem;
          line-height: 1.6;
        }

        /* GRID */

        .dosage-grid {
          display: grid;
          grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
          gap: 24px;
          align-items: stretch;
        }

        /* INPUT CARD */

        .dosage-form-card {
          padding: 28px;
          background: #ffffff;
          border: 1px solid #d8e3da;
          border-radius: 18px;
          box-shadow: 0 8px 26px rgba(25, 62, 48, 0.06);
          box-sizing: border-box;
        }

        .dosage-card-heading {
          display: flex;
          align-items: center;
          gap: 13px;
          margin-bottom: 26px;
          padding-bottom: 20px;
          border-bottom: 1px solid #edf2ed;
        }

        .dosage-card-icon {
          width: 42px;
          height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border-radius: 11px;
          background: #e7f3e9;
          color: #267353;
        }

        .dosage-card-heading h2 {
          margin: 0 0 4px;
          color: #123f32;
          font-size: 1.15rem;
        }

        .dosage-card-heading p {
          margin: 0;
          color: #788c84;
          font-size: 0.84rem;
        }

        /* FIELDS */

        .dosage-field {
          margin-bottom: 20px;
        }

        .dosage-field label {
          display: block;
          margin-bottom: 8px;
          color: #254c40;
          font-size: 0.86rem;
          font-weight: 650;
        }

        .dosage-field small {
          display: block;
          margin-top: 7px;
          color: #82928c;
          font-size: 0.75rem;
          line-height: 1.45;
        }

        .dosage-field input {
          width: 100%;
          padding: 12px 13px;
          border: 1px solid #cbd9ce;
          border-radius: 9px;
          background: #ffffff;
          color: #123f32;
          font-family: inherit;
          font-size: 0.92rem;
          box-sizing: border-box;
          outline: none;
          transition: border-color 0.2s ease,
            box-shadow 0.2s ease;
        }

        .dosage-field input:focus {
          border-color: #1c624d;
          box-shadow: 0 0 0 3px rgba(28, 98, 77, 0.1);
        }

        .dosage-input-unit {
          position: relative;
        }

        .dosage-input-unit input {
          padding-right: 70px;
        }

        .dosage-input-unit span {
          position: absolute;
          top: 50%;
          right: 14px;
          transform: translateY(-50%);
          color: #70867c;
          font-size: 0.82rem;
          pointer-events: none;
        }

        /* ERROR */

        .dosage-error {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          margin: -4px 0 16px;
          padding: 11px 12px;
          border: 1px solid #efcfca;
          border-radius: 9px;
          background: #fff5f3;
          color: #a13d35;
          font-size: 0.82rem;
          line-height: 1.4;
        }

        /* BUTTON */

        .dosage-submit-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 13px 18px;
          border: 1px solid #1c624d;
          border-radius: 9px;
          background: #1c624d;
          color: #ffffff;
          font-size: 0.92rem;
          font-weight: 650;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .dosage-submit-btn:hover:not(:disabled) {
          background: #154d3d;
          transform: translateY(-1px);
          box-shadow: 0 5px 14px rgba(28, 98, 77, 0.18);
        }

        .dosage-submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .dosage-info-note {
          display: flex;
          align-items: flex-start;
          gap: 7px;
          margin-top: 17px;
          color: #7b8d86;
          font-size: 0.75rem;
          line-height: 1.5;
        }

        .dosage-info-note svg {
          flex-shrink: 0;
          margin-top: 1px;
        }

        /* RESULT CARD */

        .dosage-result-card {
          min-height: 520px;
          background: #123f32;
          border-radius: 18px;
          padding: 28px;
          color: #ffffff;
          box-shadow: 0 10px 30px rgba(25, 62, 48, 0.12);
          box-sizing: border-box;
        }

        .dosage-result-empty,
        .dosage-result-loading {
          min-height: 460px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 30px;
          box-sizing: border-box;
        }

        .dosage-result-empty-icon {
          width: 58px;
          height: 58px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 18px;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.1);
          color: #9fce78;
        }

        .dosage-result-empty-icon.error {
          color: #f0a59d;
        }

        .dosage-result-empty h3,
        .dosage-result-loading h3 {
          margin: 0 0 8px;
          color: #ffffff;
          font-size: 1.15rem;
        }

        .dosage-result-empty p,
        .dosage-result-loading p {
          max-width: 330px;
          margin: 0;
          color: #b8c9c1;
          font-size: 0.88rem;
          line-height: 1.6;
        }

        .dosage-result-loading {
          color: #a8d17f;
        }

        /* RESULT CONTENT */

        .dosage-result-content {
          height: 100%;
        }

        .dosage-result-heading {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          padding-bottom: 22px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.12);
        }

        .dosage-result-heading > div:first-child > span {
          display: block;
          margin-bottom: 8px;
          color: #a9bdb5;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.06em;
        }

        .dosage-result-heading h2 {
          margin: 0;
          color: #b9df91;
          font-size: 2.35rem;
          line-height: 1;
        }

        .dosage-result-heading h2 small {
          margin-left: 7px;
          color: #a9bdb5;
          font-size: 0.88rem;
          font-weight: 500;
        }

        .dosage-check {
          width: 42px;
          height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border-radius: 50%;
          background: rgba(159, 206, 120, 0.14);
          color: #9fce78;
        }

        /* TOTAL */

        .dosage-total-box {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin: 20px 0;
        }

        .dosage-total-box > div {
          padding: 15px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 11px;
          background: rgba(255, 255, 255, 0.05);
        }

        .dosage-total-box span {
          display: block;
          margin-bottom: 6px;
          color: #9fb3ab;
          font-size: 0.72rem;
        }

        .dosage-total-box strong {
          color: #ffffff;
          font-size: 1rem;
        }

        /* GAUGE */

        .dosage-gauge-section {
          margin: 20px 0;
        }

        .dosage-gauge-label {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          color: #a9bdb5;
          font-size: 0.75rem;
        }

        .dosage-gauge {
          height: 8px;
          overflow: hidden;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.1);
        }

        .dosage-gauge-fill {
          height: 100%;
          border-radius: inherit;
          background: #9fce78;
          transition: width 0.5s ease;
        }

        /* BATCH */

        .dosage-batch {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 12px 0;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .dosage-batch span {
          color: #9fb3ab;
          font-size: 0.76rem;
        }

        .dosage-batch strong {
          color: #ffffff;
          font-size: 0.82rem;
          word-break: break-word;
        }

        /* SECTIONS */

        .dosage-section {
          margin-top: 22px;
          padding-top: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .dosage-section-title {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 12px;
          color: #ffffff;
          font-size: 0.8rem;
          font-weight: 650;
        }

        .dosage-section-title svg {
          color: #9fce78;
        }

        /* LAB VALUES */

        .dosage-lab-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }

        .dosage-lab-item {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          padding: 9px 10px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.05);
        }

        .dosage-lab-item span {
          color: #9fb3ab;
          font-size: 0.73rem;
          word-break: break-word;
        }

        .dosage-lab-item strong {
          color: #ffffff;
          font-size: 0.75rem;
          word-break: break-word;
        }

        /* TIPS */

        .dosage-tips {
          margin: 0;
          padding-left: 18px;
          color: #c3d1cb;
          font-size: 0.78rem;
          line-height: 1.65;
        }

        .dosage-tips li {
          margin-bottom: 6px;
        }

        /* SERVICE STATUS */

        .dosage-live,
        .dosage-fallback {
          display: flex;
          align-items: flex-start;
          gap: 7px;
          margin-top: 20px;
          padding: 11px 12px;
          border-radius: 9px;
          font-size: 0.74rem;
          line-height: 1.45;
        }

        .dosage-live {
          background: rgba(159, 206, 120, 0.1);
          color: #b8db99;
        }

        .dosage-fallback {
          background: rgba(240, 165, 157, 0.1);
          color: #f0b5ae;
        }

        .dosage-live svg,
        .dosage-fallback svg {
          flex-shrink: 0;
          margin-top: 1px;
        }

        /* SPINNER */

        .dosage-spin {
          animation: dosage-spin 1s linear infinite;
        }

        @keyframes dosage-spin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        /* ==========================================
           RESPONSIVE
        ========================================== */

        @media (max-width: 850px) {

          .dosage-page {
            padding: 42px 18px 60px;
          }

          .dosage-grid {
            grid-template-columns: 1fr;
          }

          .dosage-result-card {
            min-height: auto;
          }

          .dosage-result-empty,
          .dosage-result-loading {
            min-height: 320px;
          }

        }

        @media (max-width: 560px) {

          .dosage-page {
            padding: 32px 14px 48px;
          }

          .dosage-header h1 {
            font-size: 1.85rem;
          }

          .dosage-header p {
            font-size: 0.9rem;
          }

          .dosage-form-card,
          .dosage-result-card {
            padding: 20px;
            border-radius: 14px;
          }

          .dosage-total-box {
            grid-template-columns: 1fr;
          }

          .dosage-lab-grid {
            grid-template-columns: 1fr;
          }

          .dosage-result-heading h2 {
            font-size: 2rem;
          }

        }

      `}</style>

    </div>
  );
}