import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import LoadingPage from './components/LoadingPage';
import './App.css';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load dos componentes
const GlobalSigns = lazy(() => import('./pages/global_signs'));
const Prediction = lazy(() => import('./pages/prediction'));
const BrazilSigns = lazy(() => import('./pages/brazil_signs'));
const AboutUs = lazy(() => import('./pages/AboutUs'));

// Crie um tema personalizado
const theme = createTheme({
  palette: {
    mode: 'dark', // Isso definirá um tema escuro
    primary: {
      main: '#90caf9', // Um azul claro
    },
    secondary: {
      main: '#f48fb1', // Um rosa claro
    },
    background: {
      default: '#121212', // Um cinza muito escuro
      paper: '#1e1e1e', // Um cinza escuro para os componentes de papel
    },
  },
});

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
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
              <Suspense fallback={<LoadingPage />}>
                <Routes>
                  <Route path="/global_signs" element={<GlobalSigns />} />
                  <Route path="/prediction" element={<Prediction />} />
                  <Route path="/" element={<BrazilSigns />} />
                  <Route path="/about" element={<AboutUs />} />
                </Routes>
              </Suspense>
            </main>

            {isLoading && <LoadingPage />}
          </div>
        </Router>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;