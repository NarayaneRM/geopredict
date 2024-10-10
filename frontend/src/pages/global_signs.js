import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Globe from 'react-globe.gl';
import GlobalSingsSidebar from '../components/global_signs_sidebar';
import * as d3 from 'd3';
import { interpolateRdBu } from 'd3-scale-chromatic';
import countriesLib from 'i18n-iso-countries';
import ptLocale from "i18n-iso-countries/langs/pt.json";
import './global_signs.css';

// Função para importar dados dinamicamente
function importAll(r) {
    let files = {};
    r.keys().forEach((key) => {
        const year = key.match(/\d{4}/)[0];
        files[year] = r(key);
    });
    return files;
}

// Importar todos os arquivos JSON de dados antropogênicos
const anthropogenicData = importAll(require.context('../data/us_ghg_center/preprocessed_globe_data_anthropogenic', true, /globe_data_\d{4}_12\.json$/));

// Importar todos os arquivos JSON de dados naturais
const naturalData = importAll(require.context('../data/us_ghg_center/preprocessed_globe_data_natural', true, /globe_data_\d{4}_12\.json$/));

// Registre os dados de localização em português
countriesLib.registerLocale(ptLocale);

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
    const cachedDataRef = useRef({});
    const [sliderValue, setSliderValue] = useState(0);
    const [countriesList, setCountriesList] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [countryEmissions, setCountryEmissions] = useState({});
    const [isCountryDataLoading, setIsCountryDataLoading] = useState(false);

    // Modifique o objeto allData para usar os dados importados dinamicamente
    const allData = useMemo(() => ({
        anthropogenic: anthropogenicData,
        natural: naturalData
    }), []);

    // Modifique a função loadGlobeData para usar os dados locais
    const loadGlobeData = useCallback((year, preload = false) => {
        if (!year) return;

        const data = allData[dataType][year];
        if (data) {
            if (!preload) {
                setGlobeData(data);
                setDataInfo(`Dados carregados para ${year}: ${data.length} pontos`);
                setError(null);
            }
        } else {
            if (!preload) {
                setError(`Dados não disponíveis para o ano ${year}`);
                setGlobeData(null);
            }
        }
        setIsLoading(false);
    }, [dataType, allData]);

    // Modifique a função loadAvailableYears para usar os dados locais
    const loadAvailableYears = useCallback(() => {
        const years = Object.keys(allData[dataType]).sort();
        setAvailableYears(years);
        if (years.length > 0 && !selectedYear) {
            setSelectedYear(years[0]);
        }
        years.forEach(year => loadGlobeData(year, true));
    }, [dataType, selectedYear, loadGlobeData, allData]);

    useEffect(() => {
        loadAvailableYears();
    }, [loadAvailableYears, dataType]);

    useEffect(() => {
        if (selectedYear) {
            loadGlobeData(selectedYear);
        }
    }, [selectedYear, loadGlobeData]);

    useEffect(() => {
        if (isPlaying) {
            playIntervalRef.current = setInterval(() => {
                setSliderValue(prevValue => {
                    const nextValue = (prevValue + 1) % availableYears.length;
                    setSelectedYear(availableYears[nextValue]);
                    return nextValue;
                });
            }, 2000); // Change year every 2 seconds
        } else {
            clearInterval(playIntervalRef.current);
        }

        return () => clearInterval(playIntervalRef.current);
    }, [isPlaying, availableYears]);

    const handleYearChange = (year) => {
        setSelectedYear(year);
        setSelectedCountry(null);
    };

    const handleDataTypeChange = (type) => {
        setDataType(type);
        setSelectedCountry(null);
        cachedDataRef.current = {}; // Clear cache when data type changes
    };

    const handlePlayToggle = () => {
        setIsPlaying(!isPlaying);
    };

    const handleSliderChange = (event) => {
        const index = parseInt(event.target.value, 10);
        setSliderValue(index);
        setSelectedYear(availableYears[index]);
    };

    const { colorScale, minValue, maxValue } = useMemo(() => {
        if (!globeData || !Array.isArray(globeData) || globeData.length === 0) {
            return { colorScale: null, minValue: null, maxValue: null };
        }
        const maxVal = Math.max(...globeData.map(d => d.value));
        const minVal = Math.min(...globeData.map(d => d.value));
        const colorScl = d3.scaleSequential(t => interpolateRdBu(1 - t))
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
                globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
                pointsData={globeData}
                pointLat="lat"
                pointLng="lon"
                pointColor={d => colorScale(d.value)}
                pointAltitude={0.01}
                pointRadius={0.25}
                atmosphereColor="lightskyblue"
                atmosphereAltitude={0.25}
                backgroundColor="rgba(0,0,0,0)"
                enablePointerInteraction={false}
                cameraRotateSpeed={0.5}
                onGlobeReady={centerOnBrazil}
            />
        );
    };

    const renderSlider = () => {
        return (
            <div className="slider-container">
                <div className="slider-play-container">
                    <button onClick={handlePlayToggle} className="play-button">
                        {isPlaying ? '⏹' : '▶'}
                    </button>
                    <input
                        type="range"
                        min="0"
                        max={availableYears.length - 1}
                        value={sliderValue}
                        onChange={handleSliderChange}
                        className="year-slider"
                    />
                </div>
                <div className="slider-labels">
                    {availableYears.map((year, index) => (
                        <span
                            key={year}
                            className={`slider-label ${index === sliderValue ? 'active' : ''}`}
                            style={{ left: `${(index / (availableYears.length - 1)) * 100}%` }}
                        >
                            {year}
                        </span>
                    ))}
                </div>
            </div>
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

    useEffect(() => {
        console.log('Globe data updated:', globeData);
    }, [globeData]);

    // Modifique a função loadCountryData para calcular os totais localmente
    const loadCountryData = useCallback(() => {
        setIsCountryDataLoading(true);
        const data = allData[dataType][selectedYear];
        if (data) {
            const countryTotals = data.reduce((acc, point) => {
                if (!acc[point.country]) {
                    acc[point.country] = 0;
                }
                acc[point.country] += point.value;
                return acc;
            }, {});

            const countryList = Object.keys(countryTotals)
                .map(code => ({
                    code: code,
                    name: countriesLib.getName(code, "pt") || code
                }))
                .sort((a, b) => a.name.localeCompare(b.name, 'pt'));

            setCountriesList(countryList);
            setCountryEmissions(countryTotals);
        } else {
            setError(`Dados não disponíveis para o ano ${selectedYear}`);
        }
        setIsCountryDataLoading(false);
    }, [selectedYear, dataType, allData]);

    useEffect(() => {
        if (selectedYear && dataType) {
            loadCountryData();
        }
    }, [loadCountryData, selectedYear, dataType]);

    const handleCountryChange = (country) => {
        setSelectedCountry(country);
    };

    return (
        <div className="atualidade-container">
            <div className="starry-background"></div>
            <GlobalSingsSidebar
                availableYears={availableYears}
                selectedYear={selectedYear}
                onYearChange={handleYearChange}
                dataType={dataType}
                onDataTypeChange={handleDataTypeChange}
                isPlaying={isPlaying}
                onPlayToggle={handlePlayToggle}
                countries={countriesList}
                selectedCountry={selectedCountry}
                onCountryChange={handleCountryChange}
                countryEmissions={countryEmissions}
                dataInfo={dataInfo}
                isLoading={isLoading}
                error={error}
                isCountryDataLoading={isCountryDataLoading}
            />
            <div className="atualidade-main-content">
                <h1 className="atualidade-title">Emissions</h1>
                <div className="globe-container">
                    {renderGlobe()}
                    {colorScale && minValue !== null && maxValue !== null && (
                        <div className="color-legend">
                            <div className="color-bar"></div>
                            <div className="color-labels">
                                <span>{d3.format(".2f")(maxValue)}</span>
                                <span>{d3.format(".2f")((3 * maxValue + minValue) / 4)}</span>
                                <span>{d3.format(".2f")((maxValue + minValue) / 2)}</span>
                                <span>{d3.format(".2f")((maxValue + 3 * minValue) / 4)}</span>
                                <span>{d3.format(".2f")(minValue)}</span>
                            </div>
                        </div>
                    )}
                    {renderSlider()}
                </div>
            </div>
        </div>
    );
};

export default Atualidade;