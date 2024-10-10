import React, { useState, useEffect } from 'react';
import './LoadingPage.css';

const messages = [
    "Calculando a trajetória para Marte...",
    "Alinhando satélites para melhor visualização do clima...",
    "Coletando dados de emissões de toda a galáxia...",
    "Preparando foguetes para uma viagem interplanetária sustentável...",
    "Calibrando sensores atmosféricos em escala global...",
    "Negociando tratados de redução de carbono com civilizações alienígenas...",
    "Convertendo energia solar em dados climáticos...",
    "Sincronizando relógios atômicos para medições precisas de CO2...",
    "Ativando escudos contra tempestades solares e mudanças climáticas...",
    "Iniciando simulação de terraformação para um futuro sustentável..."
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
