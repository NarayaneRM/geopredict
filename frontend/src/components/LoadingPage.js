import React, { useState, useEffect } from 'react';
import './LoadingPage.css';

const messages = [
    "Calculating trajectory to Mars...",
    "Aligning satellites for better climate visualization...",
    "Collecting emission data from across the galaxy...",
    "Preparing rockets for a sustainable interplanetary journey...",
    "Calibrating atmospheric sensors on a global scale...",
    "Negotiating carbon reduction treaties with alien civilizations...",
    "Converting solar energy into climate data...",
    "Synchronizing atomic clocks for precise CO2 measurements...",
    "Activating shields against solar storms and climate change...",
    "Initiating terraforming simulation for a sustainable future..."
];

const LoadingPage = () => {
    const [message, setMessage] = useState('');

    useEffect(() => {
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        setMessage(randomMessage);
    }, []);

    return (
        <div className="loading-page">
            <div className="stars"></div>
            <div className="twinkling"></div>
            <div className="loading-content">
                <img src="/logo.png" alt="GEOPREDICT Logo" className="geo_logo" />
                <h1>GEOPREDICT</h1>
                <p>{message}</p>
                <div className="loading-spinner"></div>
            </div>
        </div>
    );
};

export default LoadingPage;
