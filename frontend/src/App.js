import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Atualidade from './pages/Atualidade';
import Futuro from './pages/Futuro';
import Mudancas from './pages/Mudancas';
import Analise from './pages/Analise';
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
                <li><Link to="/">Global signs</Link></li>
                <li><Link to="/futuro">Brazil signs</Link></li>
                <li><Link to="/mudancas">Calculator</Link></li>
                <li><Link to="/analise">EDUCATION</Link></li>
                <li><Link to="/about">ABOUT</Link></li>
              </ul>
            </nav>
          </header>

          <main className="content">
            <Routes>
              <Route path="/" element={<Atualidade />} />
              <Route path="/futuro" element={<Futuro />} />
              <Route path="/mudancas" element={<Mudancas />} />
              <Route path="/analise" element={<Analise />} />
            </Routes>
          </main>

        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;