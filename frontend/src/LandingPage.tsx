import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./LandingPage.css";

const LandingPage: React.FC = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="landing-page">

      {/* ================================
          NAVBAR
      ================================= */}
      <nav className="landing-navbar">

        <div className="landing-brand">
          DigestX
        </div>

        <div className="landing-nav-links">

          <Link
            to="/advisory"
            className="landing-nav-link"
          >
            Advisory
          </Link>

          <Link
            to="/calculator"
            className="landing-nav-link"
          >
            Dosage Calculator
          </Link>

          <Link
            to="/marketplace"
            className="landing-nav-link"
          >
            Marketplace
          </Link>

          <Link
            to="/certification"
            className="landing-nav-link"
          >
            Certification
          </Link>

        </div>

        <div className="landing-nav-actions">

          {/* Notifications */}
          <div className="landing-action-wrapper">

            <button
              className="landing-icon-btn"
              type="button"
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowSettings(false);
              }}
              aria-label="Notifications"
            >
              <span className="material-symbols-outlined">
                notifications
              </span>
            </button>

            {showNotifications && (
              <div className="landing-dropdown">
                <h4>Notifications</h4>
                <p>No new notifications.</p>
              </div>
            )}

          </div>


          {/* Settings */}
          <div className="landing-action-wrapper">

            <button
              className="landing-icon-btn"
              type="button"
              onClick={() => {
                setShowSettings(!showSettings);
                setShowNotifications(false);
              }}
              aria-label="Settings"
            >
              <span className="material-symbols-outlined">
                settings
              </span>
            </button>

            {showSettings && (
              <div className="landing-dropdown">
                <h4>Settings</h4>

                <button
                  type="button"
                  className="landing-dropdown-item"
                  onClick={() => alert("Settings are currently managed locally.")}
                >
                  Account Settings
                </button>

                <button
                  type="button"
                  className="landing-dropdown-item"
                  onClick={() => alert("Theme settings are not configured yet.")}
                >
                  Preferences
                </button>
              </div>
            )}

          </div>


          {/* New Batch */}
          <Link
            to="/register"
            className="landing-new-batch-btn"
          >
            New Batch
          </Link>


          {/* Profile */}
          <Link
            to="/register"
            className="landing-profile"
            aria-label="Profile"
          >
            <span className="material-symbols-outlined">
              person
            </span>
          </Link>

        </div>

      </nav>


      {/* ================================
          MAIN
      ================================= */}
      <main>

        {/* ================================
            HERO
        ================================= */}
        <section className="landing-hero">

          <div className="landing-hero-content">

            <h1 className="landing-hero-title">
              The AgriCore Ecosystem
            </h1>

            <p className="landing-hero-description">
              Bridging the gap between industrial biogas production
              and sustainable agricultural application. A secure,
              certified pipeline transforming organic waste into
              high-yield, verifiable agricultural nutrients.
            </p>

            <div className="landing-hero-actions">

              <Link
                to="/marketplace"
                className="landing-btn-primary"
              >
                Explore the Network
              </Link>

              <Link
                to="/register"
                className="landing-btn-secondary"
              >
                Join as Operator
              </Link>

            </div>

          </div>

        </section>


        {/* ================================
            HOW IT WORKS
        ================================= */}
        <section className="landing-process">

          <div className="landing-container">

            <h2 className="landing-section-title">
              How It Works
            </h2>

            <div className="landing-process-card">

              {/* STEP 1 */}
              <div className="landing-process-step">

                <div className="landing-step-icon-wrapper">

                  <div className="landing-step-icon">
                    <span className="material-symbols-outlined">
                      factory
                    </span>
                  </div>

                  <span className="landing-step-number">
                    1
                  </span>

                </div>

                <h3 className="landing-step-title">
                  Biogas Plant
                </h3>

                <p className="landing-step-description">
                  Production of high-quality organic slurry.
                </p>

              </div>


              {/* CONNECTOR */}
              <div className="landing-process-connector">
                <span></span>
                <span></span>
                <span></span>
              </div>


              {/* STEP 2 */}
              <div className="landing-process-step">

                <div className="landing-step-icon-wrapper">

                  <div className="landing-step-icon landing-step-icon-active">
                    <span className="material-symbols-outlined">
                      verified
                    </span>
                  </div>

                  <span className="landing-step-number">
                    2
                  </span>

                </div>

                <h3 className="landing-step-title">
                  Quality Certification
                </h3>

                <p className="landing-step-description">
                  Lab analysis &amp; QR code generation for compliance.
                </p>

              </div>


              {/* CONNECTOR */}
              <div className="landing-process-connector">
                <span></span>
                <span></span>
                <span></span>
              </div>


              {/* STEP 3 */}
              <div className="landing-process-step">

                <div className="landing-step-icon-wrapper">

                  <div className="landing-step-icon">
                    <span className="material-symbols-outlined">
                      agriculture
                    </span>
                  </div>

                  <span className="landing-step-number">
                    3
                  </span>

                </div>

                <h3 className="landing-step-title">
                  Farmer Utility
                </h3>

                <p className="landing-step-description">
                  Marketplace discovery &amp; precision application.
                </p>

              </div>

            </div>

          </div>

        </section>


        {/* ================================
            KEY FEATURES
        ================================= */}
        <section className="landing-features">

          <div className="landing-container">

            <h2 className="landing-section-title">
              Key Features
            </h2>

            <div className="landing-features-grid">

              {/* QR */}
              <div className="landing-feature-card">

                <div className="landing-feature-icon">
                  <span className="material-symbols-outlined">
                    qr_code_scanner
                  </span>
                </div>

                <h3>
                  QR Certification
                </h3>

                <p>
                  Scan QR codes to verify batch quality and
                  compliance with FCO norms.
                </p>

              </div>


              {/* Calculator */}
              <div className="landing-feature-card">

                <div className="landing-feature-icon">
                  <span className="material-symbols-outlined">
                    calculate
                  </span>
                </div>

                <h3>
                  Dosage Calculator
                </h3>

                <p>
                  Precision agriculture tools for optimal
                  fertilizer application.
                </p>

                <Link
                  to="/calculator"
                  className="landing-feature-link"
                >
                  Open Calculator →
                </Link>

              </div>


              {/* Marketplace */}
              <div className="landing-feature-card">

                <div className="landing-feature-icon">
                  <span className="material-symbols-outlined">
                    storefront
                  </span>
                </div>

                <h3>
                  Marketplace
                </h3>

                <p>
                  Connect biogas plants with farmers for
                  certified organic slurry trading.
                </p>

                <Link
                  to="/marketplace"
                  className="landing-feature-link"
                >
                  Open Marketplace →
                </Link>

              </div>


              {/* Compliance */}
              <div className="landing-feature-card">

                <div className="landing-feature-icon">
                  <span className="material-symbols-outlined">
                    verified
                  </span>
                </div>

                <h3>
                  Compliance
                </h3>

                <p>
                  Verify certified batches through transparent
                  compliance records and QR verification.
                </p>

                <Link
                  to="/certification"
                  className="landing-feature-link"
                >
                  View Certification →
                </Link>

              </div>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
};

export default LandingPage;