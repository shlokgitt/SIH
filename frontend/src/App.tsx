import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import './modules/shared/styles/theme.css';
import './modules/shared/styles/components.css';

// Import pages
import LandingPage from './LandingPage';
import DosageCalculator from './DosageCalculator';
import MarketplacePage from './pages/MarketplacePage';

// Placeholder pages (to be implemented by team members)
const CertificationPage = () => <div className="page-container"><h1>QR Certification</h1><p>Coming soon - Implementation by Shriyam</p></div>;
const AdvisoryPage = () => (
  <div className="page-container">
    <h1>Farmer Advisory</h1>
    <p>Dosage Calculator - Implementation by Shreya Jaiswal</p>
    <div style={{ marginTop: '2rem' }}>
      <DosageCalculator />
    </div>
  </div>
);
const AnalyticsPage = () => <div className="page-container"><h1>Analytics Dashboard</h1><p>Coming soon - Implementation by Team</p></div>;
const RegisterPage = () => <div className="page-container"><h1>Register as Operator</h1><p>Coming soon - Implementation by Team</p></div>;

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/advisory" element={<AdvisoryPage />} />
        <Route path="/marketplace" element={<MarketplacePage />} />
        <Route path="/certification" element={<CertificationPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/calculator" element={<DosageCalculator />} />
      </Routes>
    </Router>
  );
}

export default App;
