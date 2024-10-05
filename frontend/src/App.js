import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import GlobalSigns from './pages/global_signs';
import Prediction from './pages/prediction';
import BrazilSigns from './pages/brazil_signs';
import './App.css';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="App">
          <header className="top-menu">
            <div className="left-section">
              <img src="/logo.png" alt="GEOPREDICT" className="logo" />
              <div className="title-container">
                <span className="team-name">GEOPREDICT</span>
                <span className="main-title">  | CLIMATE CHANGE: GHG EMISSIONS</span>
              </div>
            </div>
            <nav>
              <ul>
                <li><Link to="/">Brazil signs</Link></li>
                <li><Link to="/global_signs">Global signs</Link></li>
                <li><Link to="/prediction">Education</Link></li>
                <li><Link to="/about">About</Link></li>
              </ul>
            </nav>
          </header>

          <main className="content">
            <Routes>
              <Route path="/global_signs" element={<GlobalSigns />} />
              <Route path="/prediction" element={<Prediction />} />
              <Route path="/" element={<BrazilSigns />} />
            </Routes>
          </main>

        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;