import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Globe from 'react-globe.gl';
import Sidebar from '../components/Sidebar';
import ColorLegend from '../components/ColorLegend';
import * as d3 from 'd3';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Atualidade = () => {
    const [globeData, setGlobeData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dataInfo, setDataInfo] = useState('');
    const globeEl = useRef();

    const fetchGlobeData = useCallback(async () => {
        try {
            const response = await fetch(`${API_URL}/api/globe-data`);
            if (!response.ok) {
                throw new Error('Failed to fetch globe data');
            }
            const data = await response.json();

            if (data && data.data && Array.isArray(data.data) && data.data.length > 0) {
                const scatterGeoData = data.data[0];
                if (Array.isArray(scatterGeoData.lat) && Array.isArray(scatterGeoData.lon) && Array.isArray(scatterGeoData.marker.color)) {
                    // Reduzir para aproximadamente 10% dos pontos
                    const processedData = scatterGeoData.lat.reduce((acc, lat, index) => {
                        if (Math.random() < 0.1) {  // 10% de chance de manter cada ponto
                            acc.push({
                                latitude: lat,
                                longitude: scatterGeoData.lon[index],
                                value: scatterGeoData.marker.color[index]
                            });
                        }
                        return acc;
                    }, []);

                    setGlobeData(processedData);
                    setDataInfo(`Dados carregados: ${processedData.length} pontos (reduzido de ${scatterGeoData.lat.length})`);
                } else {
                    throw new Error('Invalid data structure: lat, lon, or color is not an array');
                }
            } else {
                throw new Error('Invalid data format received from API');
            }
        } catch (error) {
            console.error('Error processing globe data:', error);
            setError('Failed to load globe data: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchGlobeData();
    }, [fetchGlobeData]);

    useEffect(() => {
        if (globeEl.current) {
            const controls = globeEl.current.controls();
            controls.autoRotate = true;
            controls.autoRotateSpeed = 0.1; // Reduzimos a velocidade para 0.1

            // Ajuste opcional: inclinação inicial
            controls.minPolarAngle = Math.PI / 3.5;
            controls.maxPolarAngle = Math.PI - Math.PI / 3;
        }
    }, []);

    const { colorScale, minValue, maxValue } = useMemo(() => {
        if (!globeData || globeData.length === 0) {
            return { colorScale: null, minValue: null, maxValue: null };
        }
        const maxVal = Math.max(...globeData.map(d => d.value));
        const minVal = Math.min(...globeData.map(d => d.value));
        const colorScl = d3.scaleSequential(d3.interpolateYlOrRd)
            .domain([minVal, maxVal]);
        return { colorScale: colorScl, minValue: minVal, maxValue: maxVal };
    }, [globeData]);

    const renderGlobe = () => {
        if (!globeData || globeData.length === 0) {
            return null;
        }

        return (
            <Globe
                ref={globeEl}
                globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
                pointsData={globeData}
                pointLat="latitude"
                pointLng="longitude"
                pointColor={d => colorScale(d.value)}
                pointAltitude={0.01}
                pointRadius={0.05}
                atmosphereColor="lightskyblue"
                atmosphereAltitude={0.25}
                backgroundColor="rgba(0,0,0,0)"
                enablePointerInteraction={false} // Desativa a interação do mouse para manter a rotação constante
            />
        );
    };

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="atualidade-container">
            <Sidebar />
            <div className="main-content">
                <h1>Atualidade</h1>
                {error && <div className="error-message">{error}</div>}
                {dataInfo && <div className="data-info">{dataInfo}</div>}
                <div className="globe-container" style={{ height: '80vh', width: '100%', backgroundColor: 'black', position: 'relative' }}>
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