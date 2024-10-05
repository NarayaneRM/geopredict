import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Globe from 'react-globe.gl';
import Sidebar from '../components/Sidebar';
import ColorLegend from '../components/ColorLegend';
import * as d3 from 'd3';

const Atualidade = () => {
    const [globeData, setGlobeData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dataInfo, setDataInfo] = useState('');
    const globeEl = useRef();

    const loadGlobeData = useCallback(() => {
        setIsLoading(true);
        fetch('/api/globe_data')
            .then(response => response.json())
            .then(data => {
                setGlobeData(data);
                setDataInfo(`Dados carregados: ${data.length} pontos`);
            })
            .catch(error => {
                console.error('Error loading globe data:', error);
                setError('Failed to load globe data: ' + error.message);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    useEffect(() => {
        loadGlobeData();
    }, [loadGlobeData]);

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
            return null;
        }

        return (
            <Globe
                ref={globeEl}
                globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
                pointsData={globeData}
                pointLat="lat"
                pointLng="lon"
                pointColor={d => colorScale(d.value)}
                pointAltitude={0.01}
                pointRadius={0.5}
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