import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage: React.FC = () => {
  return (
    <div className="landing-page">
      {/* Top Navigation */}
      <nav className="landing-navbar">
        <div className="landing-brand">SIH Agri App</div>
        <div className="landing-nav-links">
          <Link to="/advisory" className="landing-nav-link">Advisory</Link>
          <Link to="/marketplace" className="landing-nav-link">Marketplace</Link>
          <Link to="/certification" className="landing-nav-link">Certification</Link>
          <Link to="/analytics" className="landing-nav-link">Analytics</Link>
        </div>
        <div className="landing-nav-actions">
          <button className="landing-icon-btn">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="landing-icon-btn">
            <span className="material-symbols-outlined">settings</span>
          </button>
          <Link to="/marketplace" className="landing-cta-btn">New Batch</Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="landing-main">
        {/* Hero Section */}
        <section className="landing-hero">
          <div className="landing-hero-bg"></div>
          <div className="landing-hero-content">
            <h1 className="landing-hero-title">The AgriCore Ecosystem</h1>
            <p className="landing-hero-description">
              Bridging the gap between industrial biogas production and sustainable agricultural application. 
              A secure, certified pipeline transforming organic waste into high-yield, verifiable agricultural nutrients.
            </p>
            <div className="landing-hero-actions">
              <Link to="/marketplace" className="landing-btn-primary">Explore the Network</Link>
              <Link to="/register" className="landing-btn-secondary">Join as Operator</Link>
            </div>
          </div>
        </section>

        {/* Process Flow Diagram */}
        <section className="landing-process">
          <div className="landing-container">
            <h2 className="landing-section-title">How It Works</h2>
            <div className="landing-process-flow">
              {/* Step 1: Biogas Plant */}
              <div className="landing-process-step">
                <div className="landing-step-icon">
                  <span className="material-symbols-outlined landing-icon-filled">factory</span>
                  <div className="landing-step-badge">1</div>
                </div>
                <h3 className="landing-step-title">Biogas Plant</h3>
                <p className="landing-step-description">Production of high-quality organic slurry.</p>
              </div>

              {/* Connection Line */}
              <div className="landing-process-line">
                <svg className="landing-animated-line" preserveAspectRatio="none">
                  <line 
                    className="animated-line" 
                    opacity="0.3" 
                    stroke="#1b4332" 
                    strokeDasharray="8 4" 
                    strokeWidth="2" 
                    x1="0" 
                    x2="100%" 
                    y1="0" 
                    y2="0"
                  />
                </svg>
              </div>

              {/* Step 2: Quality Certification */}
              <div className="landing-process-step">
                <div className="landing-step-icon landing-step-certified">
                  <span className="material-symbols-outlined landing-icon-filled">verified</span>
                  <div className="landing-step-badge">2</div>
                </div>
                <h3 className="landing-step-title">Quality Certification</h3>
                <p className="landing-step-description">Lab analysis & QR code generation for compliance.</p>
              </div>

              {/* Connection Line */}
              <div className="landing-process-line">
                <svg className="landing-animated-line" preserveAspectRatio="none">
                  <line 
                    className="animated-line" 
                    opacity="0.3" 
                    stroke="#1b4332" 
                    strokeDasharray="8 4" 
                    strokeWidth="2" 
                    x1="0" 
                    x2="100%" 
                    y1="0" 
                    y2="0"
                  />
                </svg>
              </div>

              {/* Step 3: Farmer Utility */}
              <div className="landing-process-step">
                <div className="landing-step-icon">
                  <span className="material-symbols-outlined landing-icon-filled">agriculture</span>
                  <div className="landing-step-badge">3</div>
                </div>
                <h3 className="landing-step-title">Farmer Utility</h3>
                <p className="landing-step-description">Marketplace discovery & precision application.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="landing-features">
          <div className="landing-container">
            <h2 className="landing-section-title">Key Features</h2>
            <div className="landing-features-grid">
              <div className="landing-feature-card">
                <span className="material-symbols-outlined landing-feature-icon">qr_code_scanner</span>
                <h3 className="landing-feature-title">QR Certification</h3>
                <p className="landing-feature-description">Scan QR codes to verify batch quality and compliance with FCO norms.</p>
              </div>
              <div className="landing-feature-card">
                <span className="material-symbols-outlined landing-feature-icon">calculate</span>
                <h3 className="landing-feature-title">Dosage Calculator</h3>
                <p className="landing-feature-description">Precision agriculture tools for optimal fertilizer application.</p>
              </div>
              <div className="landing-feature-card">
                <span className="material-symbols-outlined landing-feature-icon">storefront</span>
                <h3 className="landing-feature-title">Marketplace</h3>
                <p className="landing-feature-description">Connect biogas plants with farmers for certified organic slurry trading.</p>
              </div>
              <div className="landing-feature-card">
                <span className="material-symbols-outlined landing-feature-icon">analytics</span>
                <h3 className="landing-feature-title">Analytics Dashboard</h3>
                <p className="landing-feature-description">Track production, certification, and distribution metrics.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default LandingPage;