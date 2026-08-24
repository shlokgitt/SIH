import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Home } from "lucide-react";
import "./PublicCertificatePage.css";
import { api } from "../utils/api";

interface Batch {
  _id: string;
  batchCode: string;
  plant?: {
    name?: string;
    email?: string;
  };

  labValues?: {
    nitrogen?: number;
    phosphorus?: number;
    potassium?: number;
    organicCarbon?: number;
    pH?: number;
    moisture?: number;
    cToNRatio?: number;
  };

  quantityKgTotal?: number;
  quantityKgAvailable?: number;
  pricePerKg?: number;
  pickupLocation?: string;

  complianceStatus?: string;
  complianceViolations?: string[];

  qrCodeDataUrl?: string;
  certificateUrl?: string;

  createdAt?: string;
}

const PublicCertificatePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [batch, setBatch] = useState<Batch | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCertificate = async () => {
      if (!id) {
        setError("Certificate ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data = await api.batches.getCertificate(id);

        if (!data?.batch) {
          throw new Error("Certificate data not found.");
        }

        setBatch(data.batch);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load certificate."
        );
      } finally {
        setLoading(false);
      }
    };

    loadCertificate();
  }, [id]);

  if (loading) {
    return (
      <div className="public-certificate-page">
        <div className="certificate-state">
          <div className="certificate-spinner"></div>
          <h2>Loading Certificate</h2>
          <p>Verifying batch information...</p>
        </div>
      </div>
    );
  }

  if (error || !batch) {
    return (
      <div className="public-certificate-page">
        <div className="certificate-state certificate-error">
          <span className="material-symbols-outlined">
            error
          </span>

          <h2>Certificate Not Found</h2>

          <p>
            {error ||
              "The requested certificate could not be found."}
          </p>

          <Link
            to="/marketplace"
            className="certificate-back-button"
          >
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  const lab = batch.labValues || {};

  const isCompliant =
    batch.complianceStatus === "compliant";

  const productionDate = batch.createdAt
    ? new Date(batch.createdAt).toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      )
    : "—";

  return (
    <div className="public-certificate-page">
      <div className="certificate-container">

        {/* HEADER */}
        <header className="certificate-header">
          <Link to="/" className="home-button">
            <Home size={18} />
            Go to Home
          </Link>

          <div className="certificate-brand">
            <span className="material-symbols-outlined">
              verified
            </span>

            <span>
              AgriCore
            </span>
          </div>

          <div className="certificate-header-badge">
            <span className="material-symbols-outlined">
              qr_code_scanner
            </span>

            Public Verification
          </div>
        </header>

        {/* MAIN CERTIFICATE */}
        <main className="certificate-card">

          <div className="certificate-top">
            <div>
              <p className="certificate-eyebrow">
                ORGANIC SLURRY CERTIFICATE
              </p>

              <h1>
                {batch.batchCode}
              </h1>

              <p className="certificate-subtitle">
                Certified batch verification record
              </p>
            </div>

            <div
              className={`certificate-status ${
                isCompliant
                  ? "status-compliant"
                  : "status-non-compliant"
              }`}
            >
              <span className="material-symbols-outlined">
                {isCompliant
                  ? "verified"
                  : "warning"}
              </span>

              {isCompliant
                ? "COMPLIANT"
                : "NON-COMPLIANT"}
            </div>
          </div>

          {/* PLANT */}
          <section className="certificate-section">
            <div className="certificate-section-heading">
              <span className="material-symbols-outlined">
                factory
              </span>

              <h2>Plant Information</h2>
            </div>

            <div className="certificate-grid">
              <div className="certificate-info">
                <span>Plant</span>
                <strong>
                  {batch.plant?.name || "Verified Biogas Plant"}
                </strong>
              </div>

              <div className="certificate-info">
                <span>Pickup Location</span>
                <strong>
                  {batch.pickupLocation || "—"}
                </strong>
              </div>
            </div>
          </section>

          {/* LAB ANALYSIS */}
          <section className="certificate-section">
            <div className="certificate-section-heading">
              <span className="material-symbols-outlined">
                science
              </span>

              <h2>Lab Analysis</h2>
            </div>

            <div className="certificate-lab-grid">

              <div className="certificate-lab-item">
                <span>Nitrogen (N)</span>
                <strong>
                  {lab.nitrogen ?? "—"}%
                </strong>
              </div>

              <div className="certificate-lab-item">
                <span>Phosphorus (P)</span>
                <strong>
                  {lab.phosphorus ?? "—"}%
                </strong>
              </div>

              <div className="certificate-lab-item">
                <span>Potassium (K)</span>
                <strong>
                  {lab.potassium ?? "—"}%
                </strong>
              </div>

              <div className="certificate-lab-item">
                <span>Organic Carbon</span>
                <strong>
                  {lab.organicCarbon ?? "—"}%
                </strong>
              </div>

              <div className="certificate-lab-item">
                <span>pH</span>
                <strong>
                  {lab.pH ?? "—"}
                </strong>
              </div>

              <div className="certificate-lab-item">
                <span>Moisture</span>
                <strong>
                  {lab.moisture ?? "—"}%
                </strong>
              </div>

              <div className="certificate-lab-item">
                <span>C:N Ratio</span>
                <strong>
                  {lab.cToNRatio ?? "—"}
                </strong>
              </div>

            </div>
          </section>

          {/* MARKETPLACE INFORMATION */}
          <section className="certificate-section">
            <div className="certificate-section-heading">
              <span className="material-symbols-outlined">
                inventory_2
              </span>

              <h2>Marketplace Information</h2>
            </div>

            <div className="certificate-grid">

              <div className="certificate-info">
                <span>Total Quantity</span>
                <strong>
                  {batch.quantityKgTotal ?? "—"} kg
                </strong>
              </div>

              <div className="certificate-info">
                <span>Available Quantity</span>
                <strong>
                  {batch.quantityKgAvailable ?? "—"} kg
                </strong>
              </div>

              <div className="certificate-info">
                <span>Price</span>
                <strong>
                  ₹{batch.pricePerKg ?? "—"} / kg
                </strong>
              </div>

              <div className="certificate-info">
                <span>Production Date</span>
                <strong>
                  {productionDate}
                </strong>
              </div>

            </div>
          </section>

          {/* VERIFICATION */}
          <section className="certificate-verification">

            <div className="verification-content">
              <span className="material-symbols-outlined verification-icon">
                verified
              </span>

              <h2>
                Certificate Verified
              </h2>

              <p>
                This certificate corresponds to the
                batch record stored in the AgriCore
                system.
              </p>
            </div>

            <div className="verification-qr">
              {batch.qrCodeDataUrl ? (
                <img
                  src={batch.qrCodeDataUrl}
                  alt="Batch verification QR code"
                />
              ) : (
                <div className="qr-placeholder">
                  QR unavailable
                </div>
              )}

              <span>
                Scan to verify this batch
              </span>
            </div>

          </section>

          {/* FOOTER */}
          <div className="certificate-footer">
            <span>
              Batch: {batch.batchCode}
            </span>

            <Link to="/marketplace">
              Back to Marketplace
            </Link>
          </div>

        </main>
      </div>
    </div>
  );
};

export default PublicCertificatePage;