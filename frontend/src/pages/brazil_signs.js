import React, { useState, useEffect, useCallback } from 'react';
import Plot from 'react-plotly.js';
import Select from 'react-select';
import './brazil_signs.css';
import fireData from '../data/wildfire_inpe/plot_data.json';
import CH4_brutoData from '../data/local_emissions_seeg/SEEG_CH4_bruto.json';
import CH4_liqData from '../data/local_emissions_seeg/SEEG_CH4_liq.json';
import CO2_brutoData from '../data/local_emissions_seeg/SEEG_CO2_bruto.json';
import CO2_liqData from '../data/local_emissions_seeg/SEEG_CO2_liq.json';
import CO2e_brutoData from '../data/local_emissions_seeg/SEEG_CO2e_bruto.json';
import CO2e_liqData from '../data/local_emissions_seeg/SEEG_CO2e_liq.json';

const TOPBAR_HEIGHT = 60;

const BrazilFireMap = () => {
    const [mapData, setMapData] = useState(null);
    const [dataType, setDataType] = useState('fire');
    const [year, setYear] = useState('Total');
    const [years, setYears] = useState([]);
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight - TOPBAR_HEIGHT
    });
    const [emissionData, setEmissionData] = useState({});

    const loadData = useCallback(() => {
        try {
            if (dataType === 'fire') {
                setData(fireData);
                const years = [...new Set(fireData.map(item => item.year_month.split('-')[0]))];
                setYears(['Total', ...years.sort().reverse()]);
            } else {
                // Carregando dados de emissão
                const emissionDataMap = {
                    'CH4_bruto': CH4_brutoData,
                    'CH4_liq': CH4_liqData,
                    'CO2_bruto': CO2_brutoData,
                    'CO2_liq': CO2_liqData,
                    'CO2e_bruto': CO2e_brutoData,
                    'CO2e_liq': CO2e_liqData
                };
                setEmissionData(emissionDataMap[dataType]);
                const emissionYears = Object.keys(emissionDataMap[dataType]).sort().reverse();
                setYears(emissionYears);
                setYear(emissionYears[0]); // Definir o ano mais recente como padrão
            }
            setError(null);
        } catch (error) {
            console.error('Error loading data:', error);
            setError(error.message);
        }
    }, [dataType]);

    const updateMap = useCallback(() => {
        let filteredData;
        if (dataType === 'fire') {
            filteredData = filterData(data, year);
        } else {
            // Filtra dados de emissão para o ano selecionado
            if (emissionData && emissionData[year]) {
                filteredData = Object.entries(emissionData[year]).map(([state, sectors]) => ({
                    state,
                    total_emissions: Object.values(sectors).reduce((sum, value) => sum + (typeof value === 'number' ? value : 0), 0)
                }));
            } else {
                console.error('No emission data for selected year:', year);
                filteredData = [];
            }
        }
        console.log('Filtered Data:', filteredData);

        // Adicione este log para ver quais estados têm coordenadas
        filteredData.forEach(item => {
            if (!stateCoordinates[item.state]) {
                console.warn(`Missing coordinates for state: ${item.state}`);
            }
        });

        const fig = plotMap(filteredData);
        console.log('Plot Data:', fig); // Log dos dados do plot
        setMapData(fig);
    }, [data, year, dataType, emissionData]);

    useEffect(() => {
        loadData();

        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight - TOPBAR_HEIGHT
            });
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [loadData]);

    useEffect(() => {
        if (data.length > 0) {
            updateMap();
        }
    }, [data, updateMap]);

    const filterData = (data, year) => {
        let df = [...data];
        if (year !== 'Total') {
            df = df.filter(item => item.year_month.split('-')[0] === year);
        }
        return df;
    };

    const plotMap = (data) => {
        if (!data || data.length === 0) {
            console.error('No data to plot');
            return null;
        }

        // Filtra os dados para incluir apenas estados com coordenadas
        const validData = data.filter(item => stateCoordinates[item.state]);

        if (validData.length === 0) {
            console.error('No valid data to plot after filtering');
            return null;
        }

        let colorScale, sizeRef, hoverTemplate, colorbarTitle;

        if (dataType === 'fire') {
            const maxFireCount = Math.max(...validData.map(d => d.fire_count));
            sizeRef = validData.map(item => Math.sqrt(item.fire_count) / Math.sqrt(maxFireCount) * 30);
            colorScale = [[0, "yellow"], [0.33, "orange"], [0.66, "red"], [1, "darkred"]];
            hoverTemplate = "<b>%{text}</b><br><br>" +
                "Fire Outbreaks: %{customdata[0]}<br>" +
                "<extra></extra>";
            colorbarTitle = "Fire Count";
        } else {
            const validEmissions = validData.filter(d => typeof d.total_emissions === 'number' && !isNaN(d.total_emissions));
            if (validEmissions.length === 0) {
                console.error('No valid emission data');
                return null;
            }
            const maxEmission = Math.max(...validEmissions.map(d => Math.abs(d.total_emissions)));
            sizeRef = validEmissions.map(item => Math.sqrt(Math.abs(item.total_emissions)) / Math.sqrt(maxEmission) * 30);
            colorScale = [[0, "blue"], [0.5, "white"], [1, "red"]];
            hoverTemplate = "<b>%{text}</b><br><br>" +
                "Total Emissions: %{marker.color:,.2f}<br>" +
                "<extra></extra>";
            colorbarTitle = `${dataType} Emissions`;
        }

        return {
            data: [{
                type: 'scattermapbox',
                lat: validData.map(item => stateCoordinates[item.state].lat),
                lon: validData.map(item => stateCoordinates[item.state].lon),
                mode: 'markers',
                marker: {
                    size: sizeRef,
                    color: validData.map(item => dataType === 'fire' ? item.fire_count : item.total_emissions),
                    colorscale: colorScale,
                    showscale: true,
                    colorbar: {
                        title: {
                            text: colorbarTitle,
                            font: { color: 'white' }
                        },
                        thickness: 20,
                        len: 0.6,
                        x: 0.9,
                        y: 0.5,
                        yanchor: 'middle',
                        bgcolor: 'rgba(255,255,255,0.1)',
                        bordercolor: 'white',
                        tickfont: { color: 'white' }
                    },
                    sizemin: 5,
                    sizemax: 30
                },
                text: validData.map(item => item.state),
                customdata: validData.map(item => [item.fire_count, item.carbon_emission_rounded, item.total_emissions]),
                hovertemplate: hoverTemplate
            }],
            layout: {
                mapbox: {
                    style: "carto-darkmatter",
                    center: { lat: -14.2350, lon: -51.9253 },
                    zoom: 3,
                },
                autosize: true,
                height: windowSize.height,
                width: windowSize.width,
                margin: { t: 0, b: 0, l: 0, r: 0 },
                paper_bgcolor: 'rgba(0,0,0,0)',
                plot_bgcolor: 'rgba(0,0,0,0)',
                title: {
                    text: `${dataType === 'fire' ? 'Fire Outbreaks' : `${dataType} Emissions`} in Brazil (${year})`,
                    font: { color: 'white' }
                }
            }
        };
    };

    const monthOrder = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

    const monthToEnglish = (month) => {
        const months = {
            'Janeiro': 'January', 'Fevereiro': 'February', 'Março': 'March',
            'Abril': 'April', 'Maio': 'May', 'Junho': 'June',
            'Julho': 'July', 'Agosto': 'August', 'Setembro': 'September',
            'Outubro': 'October', 'Novembro': 'November', 'Dezembro': 'December'
        };
        return months[month] || month;
    };

    const customStyles = {
        control: (provided) => ({
            ...provided,
            backgroundColor: 'rgba(30, 30, 30, 0.9)',
            borderColor: 'rgba(255, 255, 255, 0.2)',
            color: '#fff',
            width: '200px',
        }),
        menu: (provided) => ({
            ...provided,
            backgroundColor: 'rgba(30, 30, 30, 0.9)',
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isFocused ? 'rgba(60, 60, 60, 0.9)' : 'rgba(30, 30, 30, 0.9)',
            color: '#fff',
        }),
        singleValue: (provided) => ({
            ...provided,
            color: '#fff',
        }),
        menuList: (provided) => ({
            ...provided,
            '::-webkit-scrollbar': {
                width: '8px',
            },
            '::-webkit-scrollbar-track': {
                background: 'rgba(0, 0, 0, 0.1)',
            },
            '::-webkit-scrollbar-thumb': {
                background: 'rgba(255, 255, 255, 0.3)',
                borderRadius: '4px',
            },
            '::-webkit-scrollbar-thumb:hover': {
                background: 'rgba(255, 255, 255, 0.5)',
            },
        }),
    };

    const dataTypeOptions = [
        { value: 'fire', label: 'Fire Outbreaks' },
        { value: 'CO2e_liq', label: 'CO2e (net)' },
        { value: 'CO2_liq', label: 'CO2 (net)' },
        { value: 'CH4_liq', label: 'CH4 (net)' },
        { value: 'CO2e_bruto', label: 'CO2e (gross)' },
        { value: 'CO2_bruto', label: 'CO2 (gross)' },
        { value: 'CH4_bruto', label: 'CH4 (gross)' },
    ];

    const yearOptions = years.map(y => ({ value: y, label: y }));

    if (error) return (
        <div style={{ color: 'white' }}>
            <p>Error: {error}</p>
        </div>
    );
    if (!mapData) return <div style={{ color: 'white' }}>Loading map...</div>;

    return (
        <div className="brazil-fire-map-container">
            <Plot
                data={mapData?.data || []}
                layout={mapData?.layout || {}}
                config={{
                    responsive: true,
                    displayModeBar: false
                }}
                style={{ width: '100%', height: '100%' }}
            />
            <div className="map-controls">
                <Select
                    options={dataTypeOptions}
                    value={dataTypeOptions.find(option => option.value === dataType)}
                    onChange={(selectedOption) => setDataType(selectedOption.value)}
                    styles={customStyles}
                />
                <Select
                    options={yearOptions}
                    value={yearOptions.find(option => option.value === year)}
                    onChange={(selectedOption) => setYear(selectedOption.value)}
                    styles={customStyles}
                />
            </div>
        </div>
    );
};

// Adicione as coordenadas dos estados brasileiros
const stateCoordinates = {
    'Acre': { lat: -9.0238, lon: -70.812 },
    'Alagoas': { lat: -9.5713, lon: -36.782 },
    'Amapá': { lat: 1.4099, lon: -51.1661 },
    'Amazonas': { lat: -3.4168, lon: -65.8561 },
    'Bahia': { lat: -12.5797, lon: -41.7007 },
    'Ceará': { lat: -5.4984, lon: -39.3206 },
    'Distrito Federal': { lat: -15.7998, lon: -47.8645 },
    'Espírito Santo': { lat: -19.1834, lon: -40.3089 },
    'Goiás': { lat: -15.8270, lon: -49.8362 },
    'Maranhão': { lat: -4.9609, lon: -45.2744 },
    'Mato Grosso': { lat: -12.6819, lon: -56.9211 },
    'Mato Grosso do Sul': { lat: -20.7722, lon: -54.7852 },
    'Minas Gerais': { lat: -18.5122, lon: -44.5550 },
    'Pará': { lat: -1.9981, lon: -54.9306 },
    'Paraíba': { lat: -7.2400, lon: -36.7820 },
    'Paraná': { lat: -25.2521, lon: -52.0215 },
    'Pernambuco': { lat: -8.8137, lon: -36.9541 },
    'Piauí': { lat: -7.7183, lon: -42.7289 },
    'Rio de Janeiro': { lat: -22.9068, lon: -43.1729 },
    'Rio Grande do Norte': { lat: -5.4026, lon: -36.9541 },
    'Rio Grande do Sul': { lat: -30.0346, lon: -51.2177 },
    'Rondônia': { lat: -11.5057, lon: -63.5806 },
    'Roraima': { lat: 2.7376, lon: -62.0751 },
    'Santa Catarina': { lat: -27.2423, lon: -50.2189 },
    'São Paulo': { lat: -23.5505, lon: -46.6333 },
    'Sergipe': { lat: -10.9091, lon: -37.0677 },
    'Tocantins': { lat: -10.1753, lon: -48.2982 }
};

export default BrazilFireMap;