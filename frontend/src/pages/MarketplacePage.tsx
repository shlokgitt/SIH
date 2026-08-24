import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Home } from "lucide-react";
import { api } from "../utils/api";
import "./MarketplacePage.css";

interface LabValues {
  nitrogen?: number | string;
  phosphorus?: number | string;
  potassium?: number | string;
  organicCarbon?: number | string;
  ph?: number | string;
  moisture?: number | string;
  cToNRatio?: number | string;
}

interface PickupLocation {
  lat?: number;
  lng?: number;
  address?: string;
}

interface Plant {
  name?: string;
  email?: string;
  phone?: string;
  plantDetails?: {
    plantName?: string;
    licenseNumber?: string;
  };
}

interface Batch {
  _id: string;
  batchCode?: string;

  plant?: Plant;

  labValues?: LabValues;

  pickupLocation?: PickupLocation;

  complianceStatus?: string;
  complianceViolations?: string[];

  qrCodeDataUrl?: string;
  certificateUrl?: string;

  quantityKgTotal?: number;
  quantityKgAvailable?: number;
  pricePerKg?: number;

  listedInMarketplace?: boolean;

  producedOn?: string;
  createdAt?: string;
  updatedAt?: string;

  status?: string;
}

const MarketplacePage: React.FC = () => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [selectedBatch, setSelectedBatch] =
    useState<Batch | null>(null);

  const loadBatches = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await api.marketplace.getBatches();

      setBatches(data?.batches || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load marketplace batches.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBatches();
  }, []);

  const filteredBatches = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return batches;
    }

    return batches.filter((batch) => {
      const batchCode =
        batch.batchCode?.toLowerCase() || "";

      const plantName =
        batch.plant?.name?.toLowerCase() || "";

      const officialPlantName =
        batch.plant?.plantDetails?.plantName?.toLowerCase() ||
        "";

      const location =
        batch.pickupLocation?.address?.toLowerCase() || "";

      return (
        batchCode.includes(query) ||
        plantName.includes(query) ||
        officialPlantName.includes(query) ||
        location.includes(query)
      );
    });
  }, [batches, search]);

  const formatDate = (date?: string) => {
    if (!date) return "N/A";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "N/A";
    }

    return parsed.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatNumber = (
    value?: number | string
  ) => {
    if (value === undefined || value === null) {
      return "N/A";
    }

    const numberValue = Number(value);

    if (Number.isNaN(numberValue)) {
      return String(value);
    }

    return numberValue.toLocaleString("en-IN");
  };

  const getPlantName = (batch: Batch) => {
    return (
      batch.plant?.name ||
      batch.plant?.plantDetails?.plantName ||
      "Verified Biogas Plant"
    );
  };

  const getStatus = (batch: Batch) => {
    if (
      batch.complianceStatus?.toLowerCase() ===
      "compliant"
    ) {
      return "CERTIFIED";
    }

    return (
      batch.complianceStatus ||
      batch.status ||
      "UNKNOWN"
    ).toUpperCase();
  };

  const handleViewCertificate = (
    batch: Batch
  ) => {
    if (batch.certificateUrl) {
      window.open(
        batch.certificateUrl,
        "_blank",
        "noopener,noreferrer"
      );
    }
  };

  return (
    <div className="marketplace-page">
      <div className="marketplace-container">

        {/* PAGE HEADER */}
        <header className="marketplace-header">
          <Link to="/" className="home-button">
            <Home size={18} />
            Go to Home
          </Link>

          <div>
            <div className="marketplace-eyebrow">
              <span className="material-symbols-outlined">
                storefront
              </span>

              CERTIFIED ORGANIC SLURRY
            </div>

            <h1>Marketplace</h1>

            <p>
              Browse certified organic slurry batches
              from verified biogas plants.
            </p>
          </div>

          <button
            className="marketplace-refresh-btn"
            onClick={loadBatches}
            disabled={loading}
          >
            <span className="material-symbols-outlined">
              refresh
            </span>

            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </header>

        {/* SEARCH */}
        <div className="marketplace-search-wrapper">
          <span className="material-symbols-outlined">
            search
          </span>

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search batch, plant or location"
            className="marketplace-search"
          />
        </div>

        {/* ERROR */}
        {error && (
          <div className="marketplace-error">
            <span className="material-symbols-outlined">
              error
            </span>

            <div>
              <strong>Unable to load marketplace</strong>
              <p>{error}</p>
            </div>

            <button onClick={loadBatches}>
              Retry
            </button>
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div className="marketplace-loading">
            <div className="marketplace-spinner"></div>

            <p>Loading certified batches...</p>
          </div>
        )}

        {/* EMPTY */}
        {!loading &&
          !error &&
          filteredBatches.length === 0 && (
            <div className="marketplace-empty">
              <div className="marketplace-empty-icon">
                <span className="material-symbols-outlined">
                  inventory_2
                </span>
              </div>

              <h2>
                {search
                  ? "No matching batches found"
                  : "No certified batches available"}
              </h2>

              <p>
                {search
                  ? "Try another batch ID, plant name or location."
                  : "Certified fertilizer batches will appear here once available."}
              </p>
            </div>
          )}

        {/* BATCH GRID */}
        {!loading &&
          !error &&
          filteredBatches.length > 0 && (
            <div className="marketplace-grid">
              {filteredBatches.map((batch) => (
                <article
                  key={batch._id}
                  className="marketplace-card"
                >
                  {/* CARD HEADER */}
                  <div className="marketplace-card-header">
                    <div>
                      <div className="marketplace-batch-label">
                        CERTIFIED BATCH
                      </div>

                      <h2>
                        {batch.batchCode ||
                          "Unknown Batch"}
                      </h2>

                      <p className="marketplace-plant">
                        {getPlantName(batch)}
                      </p>
                    </div>

                    <span className="marketplace-status">
                      <span className="material-symbols-outlined">
                        verified
                      </span>

                      {getStatus(batch)}
                    </span>
                  </div>

                  {/* LOCATION */}
                  <div className="marketplace-location">
                    <span className="material-symbols-outlined">
                      location_on
                    </span>

                    <span>
                      {batch.pickupLocation?.address ||
                        "Pickup location unavailable"}
                    </span>
                  </div>

                  {/* NUTRIENTS */}
                  <div className="marketplace-section-title">
                    <span className="material-symbols-outlined">
                      science
                    </span>

                    Lab Analysis
                  </div>

                  <div className="marketplace-nutrients">
                    <div>
                      <span>Nitrogen (N)</span>
                      <strong>
                        {batch.labValues?.nitrogen ??
                          "N/A"}
                        %
                      </strong>
                    </div>

                    <div>
                      <span>Phosphorus (P)</span>
                      <strong>
                        {batch.labValues?.phosphorus ??
                          "N/A"}
                        %
                      </strong>
                    </div>

                    <div>
                      <span>Potassium (K)</span>
                      <strong>
                        {batch.labValues?.potassium ??
                          "N/A"}
                        %
                      </strong>
                    </div>
                  </div>

                  {/* QUANTITY / PRICE */}
                  <div className="marketplace-summary">
                    <div>
                      <span>
                        <span className="material-symbols-outlined">
                          inventory_2
                        </span>
                        Available
                      </span>

                      <strong>
                        {formatNumber(
                          batch.quantityKgAvailable
                        )}{" "}
                        kg
                      </strong>
                    </div>

                    <div>
                      <span>
                        <span className="material-symbols-outlined">
                          scale
                        </span>
                        Total
                      </span>

                      <strong>
                        {formatNumber(
                          batch.quantityKgTotal
                        )}{" "}
                        kg
                      </strong>
                    </div>
                  </div>

                  <div className="marketplace-price">
                    <span className="material-symbols-outlined">
                      currency_rupee
                    </span>

                    <strong>
                      ₹
                      {batch.pricePerKg ?? "N/A"}
                      /kg
                    </strong>

                    <span className="marketplace-produced">
                      Produced{" "}
                      {formatDate(batch.producedOn)}
                    </span>
                  </div>

                  {/* BUTTON */}
                  <button
                    className="marketplace-details-btn"
                    onClick={() =>
                      setSelectedBatch(batch)
                    }
                  >
                    View Details

                    <span className="material-symbols-outlined">
                      arrow_forward
                    </span>
                  </button>
                </article>
              ))}
            </div>
          )}
      </div>

      {/* =====================================================
          DETAILS MODAL
      ===================================================== */}
      {selectedBatch && (
        <div
          className="marketplace-modal-backdrop"
          onClick={() => setSelectedBatch(null)}
        >
          <div
            className="marketplace-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            {/* MODAL HEADER */}
            <div className="marketplace-modal-header">
              <div>
                <div className="marketplace-batch-label">
                  CERTIFIED BATCH
                </div>

                <h2>
                  {selectedBatch.batchCode}
                </h2>

                <span className="marketplace-modal-status">
                  <span className="material-symbols-outlined">
                    verified
                  </span>

                  {getStatus(selectedBatch)}
                </span>
              </div>

              <button
                className="marketplace-close-btn"
                onClick={() =>
                  setSelectedBatch(null)
                }
                aria-label="Close"
              >
                <span className="material-symbols-outlined">
                  close
                </span>
              </button>
            </div>

            <p className="marketplace-compliance-message">
              This batch has passed compliance
              requirements.
            </p>

            {/* TWO COLUMN INFORMATION */}
            <div className="marketplace-detail-columns">

              {/* LAB */}
              <section className="marketplace-detail-section">
                <h3>
                  <span className="marketplace-detail-icon">
                    <span className="material-symbols-outlined">
                      science
                    </span>
                  </span>

                  Lab Analysis
                </h3>

                <div className="marketplace-detail-list">
                  <div>
                    <span>Nitrogen (N)</span>
                    <strong>
                      {selectedBatch.labValues
                        ?.nitrogen ?? "N/A"}
                      %
                    </strong>
                  </div>

                  <div>
                    <span>Phosphorus (P)</span>
                    <strong>
                      {selectedBatch.labValues
                        ?.phosphorus ?? "N/A"}
                      %
                    </strong>
                  </div>

                  <div>
                    <span>Potassium (K)</span>
                    <strong>
                      {selectedBatch.labValues
                        ?.potassium ?? "N/A"}
                      %
                    </strong>
                  </div>

                  <div>
                    <span>Organic Carbon</span>
                    <strong>
                      {selectedBatch.labValues
                        ?.organicCarbon ?? "N/A"}
                      %
                    </strong>
                  </div>

                  <div>
                    <span>pH</span>
                    <strong>
                      {selectedBatch.labValues?.ph ??
                        "N/A"}
                    </strong>
                  </div>

                  <div>
                    <span>Moisture</span>
                    <strong>
                      {selectedBatch.labValues
                        ?.moisture ?? "N/A"}
                      %
                    </strong>
                  </div>

                  <div>
                    <span>C:N Ratio</span>
                    <strong>
                      {selectedBatch.labValues
                        ?.cToNRatio ?? "N/A"}
                    </strong>
                  </div>
                </div>
              </section>

              {/* MARKETPLACE */}
              <section className="marketplace-detail-section">
                <h3>
                  <span className="marketplace-detail-icon">
                    <span className="material-symbols-outlined">
                      shopping_cart
                    </span>
                  </span>

                  Marketplace Information
                </h3>

                <div className="marketplace-detail-list">
                  <div>
                    <span>Available Quantity</span>
                    <strong>
                      {formatNumber(
                        selectedBatch.quantityKgAvailable
                      )}{" "}
                      kg
                    </strong>
                  </div>

                  <div>
                    <span>Total Quantity</span>
                    <strong>
                      {formatNumber(
                        selectedBatch.quantityKgTotal
                      )}{" "}
                      kg
                    </strong>
                  </div>

                  <div>
                    <span>Price</span>
                    <strong>
                      ₹
                      {selectedBatch.pricePerKg ??
                        "N/A"}{" "}
                      / kg
                    </strong>
                  </div>

                  <div>
                    <span>Production Date</span>
                    <strong>
                      {formatDate(
                        selectedBatch.producedOn
                      )}
                    </strong>
                  </div>
                </div>
              </section>
            </div>

            {/* PICKUP */}
            <section className="marketplace-pickup-section">
              <h3>
                <span className="marketplace-detail-icon">
                  <span className="material-symbols-outlined">
                    location_on
                  </span>
                </span>

                Pickup Location
              </h3>

              <div className="marketplace-pickup-address">
                <span className="material-symbols-outlined">
                  location_on
                </span>

                <span>
                  {selectedBatch.pickupLocation
                    ?.address ||
                    "Pickup location unavailable"}
                </span>
              </div>
            </section>

            {/* CERTIFICATE + QR */}
            <section className="marketplace-verification">
              <div className="marketplace-verification-actions">
                {selectedBatch.certificateUrl && (
                  <button
                    className="marketplace-certificate-btn"
                    onClick={() =>
                      handleViewCertificate(
                        selectedBatch
                      )
                    }
                  >
                    <span className="material-symbols-outlined">
                      verified
                    </span>

                    View Certificate
                  </button>
                )}

                <p>
                  Scan to verify this batch
                </p>
              </div>

              {selectedBatch.qrCodeDataUrl ? (
                <div className="marketplace-qr-wrapper">
                  <img
                    src={selectedBatch.qrCodeDataUrl}
                    alt={`QR code for ${selectedBatch.batchCode}`}
                  />
                </div>
              ) : (
                <div className="marketplace-no-qr">
                  QR unavailable
                </div>
              )}
            </section>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketplacePage;