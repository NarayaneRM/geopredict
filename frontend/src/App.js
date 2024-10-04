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
            <div className="logo">LOGO</div>
            <h1>GLOBAL CLIMATE CHANGE</h1>
            <nav>
              <ul>
                <li><Link to="/">VITAL SIGNS</Link></li>
                <li><Link to="/futuro">FUTURE VITAL SIGNS</Link></li>
                <li><Link to="/mudancas">CALCULATOR</Link></li>
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