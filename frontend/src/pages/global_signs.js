import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Globe from 'react-globe.gl';
import AtualidadeSidebar from '../components/AtualidadeSidebar';
import ColorLegend from '../components/ColorLegend';
import * as d3 from 'd3';
import './global_signs.css'; 

const Atualidade = () => {
    const [globeData, setGlobeData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dataInfo, setDataInfo] = useState('');
    const [availableYears, setAvailableYears] = useState([]);
    const [selectedYear, setSelectedYear] = useState('');
    const [dataType, setDataType] = useState('natural');
    const [isPlaying, setIsPlaying] = useState(false);
    const globeEl = useRef();
    const playIntervalRef = useRef(null);

    const loadAvailableYears = useCallback(() => {
        setIsLoading(true);
        fetch('/api/available_years')
            .then(response => response.json())
            .then(years => {
                console.log('Available years:', years);
                setAvailableYears(years);
                if (years.length > 0 && !selectedYear) {
                    setSelectedYear(years[0]);
                }
            })
            .catch(error => {
                console.error('Error loading available years:', error);
                setError('Failed to load available years: ' + error.message);
            })
            .finally(() => setIsLoading(false));
    }, [selectedYear]);

    const loadGlobeData = useCallback((year) => {
        if (!year) return;

        setIsLoading(true);
        console.log(`Fetching data for year: ${year}`);
        fetch(`/api/globe_data?year=${year}&type=${dataType}`)
            .then(response => response.json())
            .then(data => {
                console.log(`Loaded data for year ${year}:`, data);
                setGlobeData(data);
                setDataInfo(`Dados carregados para ${year}: ${data.length} pontos`);
                setError(null);
            })
            .catch(error => {
                console.error('Error loading globe data:', error);
                setError('Failed to load globe data: ' + error.message);
                setGlobeData(null);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [dataType]);

    useEffect(() => {
        loadAvailableYears();
    }, [loadAvailableYears]);

    useEffect(() => {
        if (selectedYear) {
            loadGlobeData(selectedYear);
        }
    }, [selectedYear, loadGlobeData]);

    useEffect(() => {
        if (isPlaying) {
            playIntervalRef.current = setInterval(() => {
                setSelectedYear(prevYear => {
                    const currentIndex = availableYears.indexOf(prevYear);
                    const nextIndex = (currentIndex + 1) % availableYears.length;
                    return availableYears[nextIndex];
                });
            }, 2000); // Change year every 2 seconds
        } else {
            clearInterval(playIntervalRef.current);
        }

        return () => clearInterval(playIntervalRef.current);
    }, [isPlaying, availableYears]);

    const handleYearChange = (year) => {
        setSelectedYear(year);
    };

    const handleDataTypeChange = (type) => {
        setDataType(type);
    };

    const handlePlayToggle = (play) => {
        setIsPlaying(play);
    };

    const { colorScale, minValue, maxValue } = useMemo(() => {
        if (!globeData || !Array.isArray(globeData) || globeData.length === 0) {
            return { colorScale: null, minValue: null, maxValue: null };
        }
        const maxVal = Math.max(...globeData.map(d => d.value));
        const minVal = Math.min(...globeData.map(d => d.value));
        const colorScl = d3.scaleSequential(d3.interpolateYlOrRd)
            .domain([minVal, maxVal]);
        return { colorScale: colorScl, minValue: minVal, maxValue: maxVal };
    }, [globeData]);

    const renderGlobe = () => {
        if (!globeData || !Array.isArray(globeData) || globeData.length === 0) {
            console.log('No globe data to render');
            return null;
        }

        return (
            <Globe
                ref={globeEl}
                width="100%"
                height="100%"
                pointsData={globeData}
                pointLat="lat"
                pointLng="lon"
                pointColor={d => colorScale(d.value)}
                pointAltitude={0.01}
                pointRadius={0.5}
                atmosphereColor="lightskyblue"
                atmosphereAltitude={0.25}
                backgroundColor="rgba(0,0,0,0)"
                enablePointerInteraction={false}
                cameraRotateSpeed={0.5}
                onGlobeReady={centerOnBrazil}
            />
        );
    };

    const centerOnBrazil = useCallback(() => {
        if (globeEl.current) {
            globeEl.current.pointOfView({ lat: -14.235, lng: -51.9253, altitude: 2.5 }, 1000);
        }
    }, []);

    useEffect(() => {
        centerOnBrazil();
    }, [centerOnBrazil]);

    return (
        <div className="atualidade-container">
            <div className="starry-background"></div>
            <AtualidadeSidebar
                availableYears={availableYears}
                selectedYear={selectedYear}
                onYearChange={handleYearChange}
                dataType={dataType}
                onDataTypeChange={handleDataTypeChange}
                isPlaying={isPlaying}
                onPlayToggle={handlePlayToggle}
                dataInfo={dataInfo}
                isLoading={isLoading}
                error={error}
            />
            <div className="atualidade-main-content">
                <h1 className="atualidade-title">Atualidade</h1>
                <div className="globe-container">
                    {renderGlobe()}
                    {colorScale && minValue !== null && maxValue !== null && (
                        <ColorLegend
                            minValue={minValue}
                            maxValue={maxValue}
                            colorScale={colorScale}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default Atualidade;