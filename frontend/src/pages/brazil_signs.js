import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import './brazil_signs.css';

const TOPBAR_HEIGHT = 60;

const BrazilFireMap = () => {
    const [mapData, setMapData] = useState(null);
    const [year, setYear] = useState('Total');
    const [month, setMonth] = useState('All');
    const [years, setYears] = useState([]);
    const [months, setMonths] = useState([]);
    const [data, setData] = useState([]);
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight - TOPBAR_HEIGHT
    });

    useEffect(() => {
        fetchFireData();

        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight - TOPBAR_HEIGHT
            });
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (data.length > 0) {
            updateMap();
        }
    }, [year, month, data]);

    const fetchFireData = () => {
        fetch('http://127.0.0.1:5000/api/fire_data')
            .then(response => response.json())
            .then(data => {
                setData(data);
                const [availableYears, availableMonths] = getAvailableYearsAndMonths(data);
                setYears(['Total', ...availableYears.sort().reverse()]);
                setMonths(['All', ...availableMonths.map(m => monthToEnglish(m)).sort((a, b) => monthOrder.indexOf(a) - monthOrder.indexOf(b))]);
            });
    };

    const updateMap = () => {
        const filteredData = filterData(data, year, month);
        const fig = plotFireMap(filteredData, year, month);
        setMapData(fig);
    };

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

    const plotFireMap = (data, year, month) => {
        const maxFireCount = Math.max(...data.map(d => d.fire_count));
        const df = data.map(item => ({
            ...item,
            normalized_size: Math.sqrt(item.fire_count) / Math.sqrt(maxFireCount) * 30,
            carbon_emission_rounded: Math.round(item.carbon_emission)
        }));

        return {
            data: [{
                type: 'scattermapbox',
                lat: df.map(item => item.latitude),
                lon: df.map(item => item.longitude),
                mode: 'markers',
                marker: {
                    size: df.map(item => item.normalized_size),
                    color: df.map(item => item.fire_count),
                    colorscale: [
                        [0, "yellow"],
                        [0.33, "orange"],
                        [0.66, "red"],
                        [1, "darkred"]
                    ],
                    showscale: true,
                    colorbar: {
                        title: {
                            text: "Fire Count",
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
                    sizemax: 10
                },
                text: df.map(item => item.state),
                customdata: df.map(item => [item.fire_count, item.carbon_emission_rounded]),
                hovertemplate:
                    "<b>%{text}</b><br><br>" +
                    "Fire Outbreaks: %{customdata[0]}<br>" +
                    "Carbon Emission: %{customdata[1]} ton<br>" +
                    "<extra></extra>"
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
                plot_bgcolor: 'rgba(0,0,0,0)'
            }
        };
    };

    const getAvailableYearsAndMonths = (data) => {
        const years = [...new Set(data.map(item => item.year_month.split('-')[0]))];
        const months = [...new Set(data.map(item => item.year_month.split('-')[1]))];
        return [years, months];
    };

    const monthOrder = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

    const monthToEnglish = (month) => {
        const months = {
            'Janeiro': 'January', 'Fevereiro': 'February', 'Março': 'March',
            'Abril': 'April', 'Maio': 'May', 'Junho': 'June',
            'Julho': 'July', 'Agosto': 'August', 'Setembro': 'September',
            'Outubro': 'October', 'Novembro': 'November', 'Dezembro': 'December',
            'Todos': 'All'
        };
        return months[month] || month;
    };

    if (!mapData) return <div style={{ color: 'white' }}>Carregando mapa...</div>;

    return (
        <div className="brazil-fire-map-container">
            <Plot
                data={mapData.data}
                layout={mapData.layout}
                config={{
                    mapboxAccessToken: 'your_mapbox_access_token_here',
                    responsive: true,
                    displayModeBar: false
                }}
                style={{ width: '100%', height: '100%' }}
            />
            <div className="map-controls">
                <select value={year} onChange={(e) => setYear(e.target.value)}>
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <select value={month} onChange={(e) => setMonth(e.target.value)}>
                    {months.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <button onClick={updateMap}>Update Map</button>
            </div>
        </div>
    );
};

export default BrazilFireMap;