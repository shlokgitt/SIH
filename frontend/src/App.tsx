import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";


import "./App.css";
import PublicCertificatePage from "./pages/PublicCertificatePage.tsx";
import LandingPage from "./LandingPage.tsx";
import AdvisoryPage from "./pages/AdvisoryPage.tsx";
import DosageCalculator from "./DosageCalculator.tsx";
import MarketplacePage from "./pages/MarketplacePage.tsx";
import RegisterPage from "./pages/RegisterPage.tsx";
import CertificationPage from "./pages/CertificationPage.tsx";


function App() {
  return (
    <Router>
      <Routes>
        {/* Landing */}
        <Route
          path="/"
          element={<LandingPage />}
        />

        {/* Advisory */}
        <Route
          path="/advisory"
          element={<AdvisoryPage />}
        />

        {/* Calculator */}
        <Route
          path="/calculator"
          element={<DosageCalculator />}
        />

        {/* Marketplace */}
        <Route
          path="/marketplace"
          element={<MarketplacePage />}
        />

        {/* Register */}
        <Route
          path="/register"
          element={<RegisterPage />}
        />

        {/* ==================================
            REAL CERTIFICATION PAGE
        ================================== */}
        <Route
          path="/certification"
          element={<CertificationPage />}
        />

        {/* Public certificate */}
        <Route
          path="/certificate/:id"
          element={<PublicCertificatePage />}
        />

        
        {/* Fallback */}
        <Route
          path="*"
          element={<LandingPage />}
        />
      </Routes>
    </Router>
  );
}

export default App;