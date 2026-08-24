import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  Download,
  FlaskConical,
  Home,
  Leaf,
  MapPin,
  QrCode,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import "./CertificationPage.css";
import { api } from "../utils/api";

interface FormData {
  productionDate: string;
  quantityKgTotal: string;

  nitrogen: string;
  phosphorus: string;
  potassium: string;

  ph: string;
  organicCarbon: string;
  moisture: string;
  cToNRatio: string;

  address: string;
  lat: string;
  lng: string;
}

interface CreatedBatch {
  _id: string;
  batchCode: string;

  labValues: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
    ph: number;
    organicCarbon: number;
    moisture?: number;
    cToNRatio?: number;
  };

  complianceStatus:
    | "pending"
    | "compliant"
    | "non_compliant";

  complianceViolations?: {
    parameter: string;
    value: number;
    expected: string;
  }[];

  qrCodeDataUrl?: string;
  certificateUrl?: string;

  quantityKgTotal: number;
  quantityKgAvailable: number;

  pickupLocation: {
    lat: number;
    lng: number;
    address?: string;
  };

  producedOn: string;
}

interface CreateBatchResponse {
  success: boolean;
  message?: string;
  batch?: CreatedBatch;
}

const createInitialForm = (): FormData => ({
  productionDate: new Date()
    .toISOString()
    .split("T")[0],

  quantityKgTotal: "",

  nitrogen: "",
  phosphorus: "",
  potassium: "",

  ph: "",
  organicCarbon: "",
  moisture: "",
  cToNRatio: "",

  address: "",

  lat: "28.6692",
  lng: "77.4538",
});

function toNumber(
  value: string
): number | null {
  if (!value.trim()) {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : null;
}

export default function CertificationPage() {
  const [form, setForm] = useState<FormData>(
    createInitialForm()
  );

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [createdBatch, setCreatedBatch] =
    useState<CreatedBatch | null>(null);

  const [copied, setCopied] = useState(false);

  const updateField = (
    field: keyof FormData,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setError("");
  };

  /*
   * =========================================
   * LIVE COMPLIANCE CHECK
   * =========================================
   */

  const compliance = useMemo(() => {
    const nitrogen = toNumber(form.nitrogen);
    const phosphorus = toNumber(form.phosphorus);
    const potassium = toNumber(form.potassium);

    const ph = toNumber(form.ph);

    const organicCarbon = toNumber(
      form.organicCarbon
    );

    const moisture = toNumber(form.moisture);

    const cToNRatio = toNumber(form.cToNRatio);

    const complete =
      nitrogen !== null &&
      phosphorus !== null &&
      potassium !== null &&
      ph !== null &&
      organicCarbon !== null &&
      moisture !== null &&
      cToNRatio !== null;

    if (!complete) {
      return {
        status: "pending" as const,
        violations: [] as string[],
      };
    }

    const violations: string[] = [];

    if (nitrogen < 0.5) {
      violations.push(
        "Nitrogen must be at least 0.5%"
      );
    }

    if (phosphorus < 0.5) {
      violations.push(
        "Phosphorus must be at least 0.5%"
      );
    }

    if (potassium < 0.5) {
      violations.push(
        "Potassium must be at least 0.5%"
      );
    }

    if (organicCarbon < 12) {
      violations.push(
        "Organic carbon must be at least 12%"
      );
    }

    if (ph < 6.5 || ph > 8.5) {
      violations.push(
        "pH must be between 6.5 and 8.5"
      );
    }

    if (moisture > 25) {
      violations.push(
        "Moisture must not exceed 25%"
      );
    }

    if (cToNRatio > 20) {
      violations.push(
        "C:N ratio must not exceed 20"
      );
    }

    return {
      status:
        violations.length === 0
          ? ("compliant" as const)
          : ("non_compliant" as const),

      violations,
    };
  }, [form]);

  /*
   * =========================================
   * CREATE CERTIFICATION
   * =========================================
   */

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    const token = localStorage.getItem("token");

    if (!token) {
      setError(
        "Please login as a plant operator before creating a certification."
      );

      return;
    }

    const quantityKgTotal = toNumber(
      form.quantityKgTotal
    );

    const nitrogen = toNumber(form.nitrogen);
    const phosphorus = toNumber(form.phosphorus);
    const potassium = toNumber(form.potassium);

    const ph = toNumber(form.ph);

    const organicCarbon = toNumber(
      form.organicCarbon
    );

    const moisture = toNumber(form.moisture);

    const cToNRatio = toNumber(form.cToNRatio);

    const lat = toNumber(form.lat);
    const lng = toNumber(form.lng);

    if (
      quantityKgTotal === null ||
      quantityKgTotal <= 0
    ) {
      setError(
        "Please enter a valid fertilizer quantity."
      );

      return;
    }

    if (
      nitrogen === null ||
      phosphorus === null ||
      potassium === null ||
      ph === null ||
      organicCarbon === null ||
      moisture === null ||
      cToNRatio === null
    ) {
      setError(
        "Please complete all laboratory analysis fields."
      );

      return;
    }

    if (lat === null || lng === null) {
      setError(
        "Please enter valid pickup coordinates."
      );

      return;
    }

    if (compliance.status !== "compliant") {
      setError(
        compliance.status === "pending"
          ? "Complete all laboratory values first."
          : "This batch does not meet the displayed FCO compliance requirements."
      );

      return;
    }

    setLoading(true);

    try {
      const payload = {
        labValues: {
          nitrogen,
          phosphorus,
          potassium,
          organicCarbon,
          ph,
          moisture,
          cToNRatio,
        },

        quantityKgTotal,

        pricePerKg: 0,

        pickupLocation: {
          lat,
          lng,
          address: form.address.trim(),
        },

        producedOn: form.productionDate,
      };

      const response =
        (await api.batches.createBatch(
          payload
        )) as CreateBatchResponse;

      if (!response.success || !response.batch) {
        throw new Error(
          response.message ||
            "Failed to generate certification."
        );
      }

      setCreatedBatch(response.batch);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (err) {
      console.error(
        "Certification error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to generate certification."
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * =========================================
   * COPY CERTIFICATE LINK
   * =========================================
   */

  async function copyCertificateLink() {
    if (!createdBatch?.certificateUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        createdBatch.certificateUrl
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setCopied(false);
    }
  }

  /*
   * =========================================
   * RESET
   * =========================================
   */

  function createAnotherBatch() {
    setCreatedBatch(null);
    setError("");
    setCopied(false);
    setForm(createInitialForm());

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  /*
   * =========================================
   * GENERATED CERTIFICATE
   * =========================================
   */

  if (createdBatch) {
    return (
      <main className="certification-page">
        <div className="certification-shell">
          <header className="certification-header">
            <Link to="/" className="home-button">
              <Home size={18} />
              Go to Home
            </Link>

            <div className="certification-heading">
              <div className="certification-heading-icon">
                <QrCode size={23} />
              </div>

              <div>
                <h1>
                  Batch Quality Certification
                </h1>

                <p>
                  Digital compliance certificate and QR
                  label generated successfully.
                </p>
              </div>
            </div>

            <div className="system-status">
              <span className="status-dot" />

              <span>System Status</span>

              <strong>
                FCO API Connected
              </strong>
            </div>
          </header>

          <section className="success-card">
            <div className="success-title">
              <div className="success-icon">
                <CheckCircle2 size={29} />
              </div>

              <div>
                <span>
                  CERTIFICATION GENERATED
                </span>

                <h2>
                  Batch Successfully Certified
                </h2>

                <p>
                  This batch passed the compliance
                  requirements.
                </p>
              </div>
            </div>

            <div className="success-content">
              <div className="certificate-details">
                <div className="detail-card">
                  <span>Batch ID</span>

                  <strong>
                    {createdBatch.batchCode}
                  </strong>
                </div>

                <div className="detail-card">
                  <span>FCO Status</span>

                  <strong className="green-text">
                    <CheckCircle2 size={16} />
                    Compliant
                  </strong>
                </div>

                <div className="detail-card">
                  <span>Quantity</span>

                  <strong>
                    {createdBatch.quantityKgTotal} kg
                  </strong>
                </div>

                <div className="detail-card">
                  <span>Production Date</span>

                  <strong>
                    {new Date(
                      createdBatch.producedOn
                    ).toLocaleDateString(
                      "en-IN"
                    )}
                  </strong>
                </div>

                <div className="detail-card">
                  <span>NPK</span>

                  <strong>
                    {
                      createdBatch.labValues
                        .nitrogen
                    }{" "}
                    /{" "}
                    {
                      createdBatch.labValues
                        .phosphorus
                    }{" "}
                    /{" "}
                    {
                      createdBatch.labValues
                        .potassium
                    }
                  </strong>
                </div>

                <div className="detail-card">
                  <span>pH</span>

                  <strong>
                    {createdBatch.labValues.ph}
                  </strong>
                </div>
              </div>

              <div className="qr-card">
                <div className="qr-card-title">
                  <QrCode size={17} />

                  DIGITAL QR CERTIFICATE
                </div>

                {createdBatch.qrCodeDataUrl ? (
                  <img
                    src={
                      createdBatch.qrCodeDataUrl
                    }
                    alt="Batch QR certificate"
                    className="generated-qr"
                  />
                ) : (
                  <div className="qr-placeholder">
                    QR unavailable
                  </div>
                )}

                <p>
                  Scan to verify this batch and its
                  compliance certificate.
                </p>

                {createdBatch.qrCodeDataUrl && (
                  <a
                    href={
                      createdBatch.qrCodeDataUrl
                    }
                    download={`${createdBatch.batchCode}-QR.png`}
                    className="download-button"
                  >
                    <Download size={16} />
                    Download QR
                  </a>
                )}
              </div>
            </div>

            {createdBatch.certificateUrl && (
              <div className="certificate-url">
                <div>
                  <span>
                    PUBLIC CERTIFICATE URL
                  </span>

                  <strong>
                    {createdBatch.certificateUrl}
                  </strong>
                </div>

                <button
                  type="button"
                  onClick={
                    copyCertificateLink
                  }
                >
                  {copied
                    ? "Copied!"
                    : "Copy Link"}
                </button>
              </div>
            )}

            <div className="success-actions">
              <Link
                to="/marketplace"
                className="secondary-button"
              >
                Go to Marketplace
              </Link>

              <button
                type="button"
                onClick={
                  createAnotherBatch
                }
                className="primary-button"
              >
                Create Another Batch
              </button>
            </div>
          </section>
        </div>
      </main>
    );
  }

  /*
   * =========================================
   * MAIN CERTIFICATION FORM
   * =========================================
   */

  return (
    <main className="certification-page">
      <div className="certification-shell">
        {/* Header */}
        <header className="certification-header">
          <Link to="/" className="home-button">
            <Home size={18} />
            Go to Home
          </Link>

          <div className="certification-heading">
            <div className="certification-heading-icon">
              <ShieldCheck size={23} />
            </div>

            <div>
              <h1>
                Batch Quality Certification
              </h1>

              <p>
                Enter lab results to generate
                compliance certificate and QR label.
              </p>
            </div>
          </div>

          <div className="system-status">
            <span className="status-dot" />

            <span>System Status</span>

            <strong>
              FCO API Connected
            </strong>
          </div>
        </header>

        <form
          className="certification-card"
          onSubmit={handleSubmit}
        >
          {/* Error */}
          {error && (
            <div className="certification-error">
              <XCircle size={19} />

              <span>{error}</span>
            </div>
          )}

          {/* =================================
              BATCH IDENTIFICATION
          ================================= */}

          <section className="cert-section">
            <div className="section-header">
              <div className="section-icon">
                <Leaf size={19} />
              </div>

              <div>
                <h2>
                  Batch Identification
                </h2>

                <p>
                  Enter production and quantity
                  information.
                </p>
              </div>
            </div>

            <div className="three-column-grid">
              <div className="field">
                <label>Batch ID</label>

                <div className="readonly-field">
                  AUTO-GENERATED
                </div>

                <small>
                  Generated automatically when
                  certification is saved.
                </small>
              </div>

              <div className="field">
                <label htmlFor="productionDate">
                  Production Date
                </label>

                <input
                  id="productionDate"
                  type="date"
                  value={
                    form.productionDate
                  }
                  onChange={(event) =>
                    updateField(
                      "productionDate",
                      event.target.value
                    )
                  }
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="quantityKgTotal">
                  Slurry Volume / Quantity (kg)
                </label>

                <input
                  id="quantityKgTotal"
                  type="number"
                  min="1"
                  step="0.1"
                  value={
                    form.quantityKgTotal
                  }
                  onChange={(event) =>
                    updateField(
                      "quantityKgTotal",
                      event.target.value
                    )
                  }
                  placeholder="15000"
                  required
                />
              </div>
            </div>
          </section>

          {/* =================================
              LAB ANALYSIS
          ================================= */}

          <section className="cert-section">
            <div className="section-header">
              <div className="section-icon">
                <FlaskConical size={19} />
              </div>

              <div>
                <h2>
                  Lab Analysis Results
                </h2>

                <p>
                  Enter laboratory-tested nutrient
                  and physicochemical values.
                </p>
              </div>
            </div>

            <div className="analysis-grid">
              {/* NPK */}
              <div className="analysis-box">
                <div className="analysis-title">
                  NPK Ratio (%)
                </div>

                <div className="three-column-grid analysis-fields">
                  <div className="field">
                    <label htmlFor="nitrogen">
                      Nitrogen (N)
                    </label>

                    <input
                      id="nitrogen"
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.nitrogen}
                      onChange={(event) =>
                        updateField(
                          "nitrogen",
                          event.target.value
                        )
                      }
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="phosphorus">
                      Phosphorus (P)
                    </label>

                    <input
                      id="phosphorus"
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.phosphorus}
                      onChange={(event) =>
                        updateField(
                          "phosphorus",
                          event.target.value
                        )
                      }
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="potassium">
                      Potassium (K)
                    </label>

                    <input
                      id="potassium"
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.potassium}
                      onChange={(event) =>
                        updateField(
                          "potassium",
                          event.target.value
                        )
                      }
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* PHYSICOCHEMICAL */}
              <div className="analysis-box">
                <div className="analysis-title">
                  Physicochemical
                </div>

                <div className="three-column-grid analysis-fields">
                  <div className="field">
                    <label htmlFor="ph">
                      pH Level
                    </label>

                    <input
                      id="ph"
                      type="number"
                      min="0"
                      max="14"
                      step="0.1"
                      value={form.ph}
                      onChange={(event) =>
                        updateField(
                          "ph",
                          event.target.value
                        )
                      }
                      placeholder="7.0"
                      required
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="organicCarbon">
                      Organic Carbon (%)
                    </label>

                    <input
                      id="organicCarbon"
                      type="number"
                      min="0"
                      step="0.1"
                      value={
                        form.organicCarbon
                      }
                      onChange={(event) =>
                        updateField(
                          "organicCarbon",
                          event.target.value
                        )
                      }
                      placeholder="15.0"
                      required
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="moisture">
                      Moisture (%)
                    </label>

                    <input
                      id="moisture"
                      type="number"
                      min="0"
                      step="0.1"
                      value={form.moisture}
                      onChange={(event) =>
                        updateField(
                          "moisture",
                          event.target.value
                        )
                      }
                      placeholder="18.0"
                      required
                    />
                  </div>
                </div>

                <div className="ctn-wrapper">
                  <div className="field">
                    <label htmlFor="cToNRatio">
                      C:N Ratio
                    </label>

                    <input
                      id="cToNRatio"
                      type="number"
                      min="0"
                      step="0.1"
                      value={form.cToNRatio}
                      onChange={(event) =>
                        updateField(
                          "cToNRatio",
                          event.target.value
                        )
                      }
                      placeholder="12.5"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* =================================
              FCO COMPLIANCE
          ================================= */}

          <section
            className={`compliance-status ${compliance.status}`}
          >
            <div className="compliance-main">
              <div className="compliance-circle">
                {compliance.status ===
                "compliant" ? (
                  <CheckCircle2 size={22} />
                ) : compliance.status ===
                  "non_compliant" ? (
                  <XCircle size={22} />
                ) : (
                  <ShieldCheck size={22} />
                )}
              </div>

              <div>
                <span>
                  FCO COMPLIANCE STATUS
                </span>

                <h3>
                  {compliance.status ===
                    "pending" &&
                    "Awaiting Input"}

                  {compliance.status ===
                    "compliant" &&
                    "Ready for Certification"}

                  {compliance.status ===
                    "non_compliant" &&
                    "Requirements Not Met"}
                </h3>

                {compliance.violations.length >
                  0 && (
                  <div className="violations">
                    {compliance.violations.map(
                      (item) => (
                        <div key={item}>
                          • {item}
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="compliance-rules">
              <span>
                Min NPK: 0.5% each
              </span>

              <span>
                pH: 6.5–8.5
              </span>

              <span>
                Min Organic Carbon: 12%
              </span>

              <span>
                Max Moisture: 25%
              </span>

              <span>
                Max C:N: 20
              </span>
            </div>
          </section>

          {/* =================================
              LOCATION
          ================================= */}

          <section className="cert-section location-section">
            <div className="section-header">
              <div className="section-icon">
                <MapPin size={19} />
              </div>

              <div>
                <h2>
                  Pickup Location
                </h2>

                <p>
                  Location associated with the
                  certified batch.
                </p>
              </div>
            </div>

            <div className="location-grid">
              <div className="field">
                <label htmlFor="address">
                  Address
                </label>

                <input
                  id="address"
                  type="text"
                  value={form.address}
                  onChange={(event) =>
                    updateField(
                      "address",
                      event.target.value
                    )
                  }
                  placeholder="Industrial Area, Ghaziabad, UP"
                />
              </div>

              <div className="coordinate-grid">
                <div className="field">
                  <label htmlFor="lat">
                    Latitude
                  </label>

                  <input
                    id="lat"
                    type="number"
                    step="any"
                    value={form.lat}
                    onChange={(event) =>
                      updateField(
                        "lat",
                        event.target.value
                      )
                    }
                    required
                  />
                </div>

                <div className="field">
                  <label htmlFor="lng">
                    Longitude
                  </label>

                  <input
                    id="lng"
                    type="number"
                    step="any"
                    value={form.lng}
                    onChange={(event) =>
                      updateField(
                        "lng",
                        event.target.value
                      )
                    }
                    required
                  />
                </div>
              </div>
            </div>
          </section>

          {/* =================================
              FOOTER ACTIONS
          ================================= */}

          <div className="certification-actions">
            <Link
              to="/"
              className="cancel-button"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="generate-button"
              disabled={
                loading ||
                compliance.status !==
                  "compliant"
              }
            >
              <QrCode size={18} />

              {loading
                ? "Generating..."
                : "Save & Generate QR Code"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}