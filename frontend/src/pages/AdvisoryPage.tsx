import React from "react";
import { Link } from "react-router-dom";
import { Home } from "lucide-react";
import "./AdvisoryPage.css";

const AdvisoryPage: React.FC = () => {
  return (
    <div className="advisory-page">
      <div className="advisory-container">

        <div className="advisory-header">
          <Link to="/" className="home-button">
            <Home size={18} />
            Go to Home
          </Link>

          <div className="advisory-badge">
            <span className="material-symbols-outlined">
              agriculture
            </span>
            FARMER ADVISORY
          </div>

          <h1>Farmer Advisory</h1>

          <p>
            Practical guidance to help farmers apply certified organic
            slurry safely and effectively.
          </p>
        </div>

        <div className="advisory-grid">

          <div className="advisory-card">
            <div className="advisory-card-icon">
              <span className="material-symbols-outlined">
                eco
              </span>
            </div>

            <h2>Organic Slurry Application</h2>

            <p>
              Use certified organic slurry according to your crop,
              field area, and recommended application quantity.
            </p>

            <ul>
              <li>Apply evenly across the field.</li>
              <li>Avoid application immediately before heavy rainfall.</li>
              <li>Store unused slurry in a cool, dry location.</li>
            </ul>
          </div>

          <div className="advisory-card">
            <div className="advisory-card-icon">
              <span className="material-symbols-outlined">
                science
              </span>
            </div>

            <h2>Check Nutrient Quality</h2>

            <p>
              Review the certified batch laboratory analysis before
              selecting a fertilizer batch.
            </p>

            <div className="advisory-info">
              <div>
                <strong>N</strong>
                <span>Nitrogen</span>
              </div>

              <div>
                <strong>P</strong>
                <span>Phosphorus</span>
              </div>

              <div>
                <strong>K</strong>
                <span>Potassium</span>
              </div>
            </div>
          </div>

          <div className="advisory-card advisory-card-wide">
            <div className="advisory-card-icon">
              <span className="material-symbols-outlined">
                calculate
              </span>
            </div>

            <h2>Need a Precise Quantity?</h2>

            <p>
              Use the dosage calculator to calculate the recommended
              slurry quantity for your field.
            </p>

            <a href="/calculator" className="advisory-calculator-btn">
              Open Dosage Calculator
              <span className="material-symbols-outlined">
                arrow_forward
              </span>
            </a>
          </div>

        </div>

      </div>
    </div>
  );
};

export default AdvisoryPage;