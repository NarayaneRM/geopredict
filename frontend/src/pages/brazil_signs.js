import React, { useState, useEffect, useCallback } from 'react';
import Plot from 'react-plotly.js';
import Select from 'react-select';
import './brazil_signs.css';
import fireData from '../data/wildfire_inpe/plot_data.json';

const TOPBAR_HEIGHT = 60;

const BrazilFireMap = () => {
    const [mapData, setMapData] = useState(null);
    const [dataType, setDataType] = useState('fire');
    const [year, setYear] = useState('Total');
    const [month, setMonth] = useState('All');
    const [years, setYears] = useState([]);
    const [months, setMonths] = useState([]);
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight - TOPBAR_HEIGHT
    });

    const loadData = useCallback(() => {
        try {
            if (dataType === 'fire') {
                setData(fireData);
                const years = [...new Set(fireData.map(item => item.year_month.split('-')[0]))];
                const months = [...new Set(fireData.map(item => item.year_month.split('-')[1]))];
                setYears(['Total', ...years.sort().reverse()]);
                setMonths(['All', ...months.map(m => monthToEnglish(m)).sort((a, b) => monthOrder.indexOf(a) - monthOrder.indexOf(b))]);
            } else {
                // Aqui você pode adicionar a lógica para carregar outros tipos de dados
                setError('Dados de emissão ainda não implementados');
            }
            setError(null);
        } catch (error) {
            console.error('Error loading data:', error);
            setError(error.message);
        }
    }, [dataType]);

    const updateMap = useCallback(() => {
        const filteredData = dataType === 'fire' ? filterData(data, year, month) : data;
        const fig = plotMap(filteredData);
        setMapData(fig);
    }, [data, year, month, dataType]);

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

    const filterData = (data, year, month) => {
        let df = [...data];
        if (year !== 'Total') {
            df = df.filter(item => item.year_month.split('-')[0] === year);
        }
        if (month !== 'All') {
            df = df.filter(item => monthToEnglish(item.year_month.split('-')[1]) === month);
        }
        return df;
    };

    const plotMap = (data) => {
        let colorScale, sizeRef, hoverTemplate, colorbarTitle;

        if (dataType === 'fire') {
            const maxFireCount = Math.max(...data.map(d => d.fire_count));
            sizeRef = data.map(item => Math.sqrt(item.fire_count) / Math.sqrt(maxFireCount) * 30);
            colorScale = [[0, "yellow"], [0.33, "orange"], [0.66, "red"], [1, "darkred"]];
            hoverTemplate = "<b>%{text}</b><br><br>" +
                "Fire Outbreaks: %{customdata[0]}<br>" +
                "Carbon Emission: %{customdata[1]} ton<br>" +
                "<extra></extra>";
            colorbarTitle = "Fire Count";
        } else {
            const maxEmission = Math.max(...data.map(d => Math.abs(d.total_emissions)));
            sizeRef = data.map(item => Math.sqrt(Math.abs(item.total_emissions)) / Math.sqrt(maxEmission) * 30);
            colorScale = [[0, "blue"], [0.5, "white"], [1, "red"]];
            hoverTemplate = "<b>%{text}</b><br><br>" +
                "Total Emissions: %{marker.color:,.2f}<br>" +
                "<extra></extra>";
            colorbarTitle = `${dataType} Emissions`;
        }

        return {
            data: [{
                type: 'scattermapbox',
                lat: data.map(item => item.latitude),
                lon: data.map(item => item.longitude),
                mode: 'markers',
                marker: {
                    size: sizeRef,
                    color: data.map(item => dataType === 'fire' ? item.fire_count : item.total_emissions),
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
                text: data.map(item => item.state),
                customdata: data.map(item => [item.fire_count, item.carbon_emission_rounded, item.total_emissions]),
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
                    text: `${dataType === 'fire' ? 'Fire Outbreaks' : `${dataType} Emissions`} in Brazil (${year}${month !== 'All' ? `-${month}` : ''})`,
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
    ];

    const yearOptions = years.map(y => ({ value: y, label: y }));
    const monthOptions = months.map(m => ({ value: m, label: m }));

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
                {dataType === 'fire' && (
                    <Select
                        options={monthOptions}
                        value={monthOptions.find(option => option.value === month)}
                        onChange={(selectedOption) => setMonth(selectedOption.value)}
                        styles={customStyles}
                    />
                )}
                <button onClick={loadData}>Update Map</button>
            </div>
        </div>
    );
};

export default BrazilFireMap;