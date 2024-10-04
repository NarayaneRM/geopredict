import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const Analise = () => {
    const [params, setParams] = useState({
        renewableEnergy: 20,
        electricVehicles: 10,
        reforestation: 5
    });
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        updateChartData();
    }, [updateChartData]); // Adicione updateChartData como dependência

    const updateChartData = useCallback(() => {
        // Aqui você implementaria a lógica para calcular os dados do gráfico
        // com base nos parâmetros. Por enquanto, vamos apenas simular isso.
        const data = [
            { year: 2020, emissions: 100 },
            { year: 2030, emissions: 100 - params.renewableEnergy * 0.5 - params.electricVehicles * 0.3 - params.reforestation * 0.2 },
            { year: 2040, emissions: 100 - params.renewableEnergy * 0.7 - params.electricVehicles * 0.5 - params.reforestation * 0.4 },
            { year: 2050, emissions: 100 - params.renewableEnergy * 0.9 - params.electricVehicles * 0.7 - params.reforestation * 0.6 },
        ];
        setChartData(data);
    }, []); // Adicione dependências se necessário

    const handleParamChange = (newParams) => {
        setParams(newParams);
    };

    return (
        <div className="page-container">
            <Sidebar>
                <h3>Parâmetros</h3>
                <label>
                    Energia Renovável (%):
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={params.renewableEnergy}
                        onChange={(e) => handleParamChange({ ...params, renewableEnergy: parseInt(e.target.value) })}
                    />
                    {params.renewableEnergy}%
                </label>
                <label>
                    Veículos Elétricos (%):
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={params.electricVehicles}
                        onChange={(e) => handleParamChange({ ...params, electricVehicles: parseInt(e.target.value) })}
                    />
                    {params.electricVehicles}%
                </label>
                <label>
                    Reflorestamento (%):
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={params.reforestation}
                        onChange={(e) => handleParamChange({ ...params, reforestation: parseInt(e.target.value) })}
                    />
                    {params.reforestation}%
                </label>
            </Sidebar>
            <main>
                <h2>Análise de Emissões</h2>
                <LineChart width={600} height={300} data={chartData}>
                    <XAxis dataKey="year" />
                    <YAxis />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="emissions" stroke="#8884d8" />
                </LineChart>
            </main>
        </div>
    );
};

export default Analise;