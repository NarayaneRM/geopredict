import React, { useState, useEffect, useRef } from 'react';
import Globe from 'react-globe.gl';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import CommuteIcon from '@mui/icons-material/CommuteOutlined';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCarOutlined';
import LocalShippingIcon from '@mui/icons-material/LocalShippingOutlined';
import PersonIcon from '@mui/icons-material/PersonOutlined';
import EcoIcon from '@mui/icons-material/EnergySavingsLeafOutlined';
import AcUnitIcon from '@mui/icons-material/AcUnitOutlined';
import Co2Icon from '@mui/icons-material/Co2Outlined';
import FilterAltIcon from '@mui/icons-material/FilterAltOutlined';
import ScienceIcon from '@mui/icons-material/ScienceOutlined';
import RadioactiveIcon from '@mui/icons-material/ScienceOutlined';
import AirIcon from '@mui/icons-material/AirOutlined';
import WbSunnyIcon from '@mui/icons-material/WbSunnyOutlined';
import WaterIcon from '@mui/icons-material/WaterOutlined';
import ParkIcon from '@mui/icons-material/ParkOutlined';
import GrassIcon from '@mui/icons-material/GrassOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import SettingsIcon from '@mui/icons-material/SettingsOutlined';
import Sidebar from '../components/Sidebar';
import UnityAnimation from '../components/UnityAnimation';
import './predicition.css';

const Future = () => {
    const [globeData] = useState([]); // Remove setGlobeData if it's not used
    const [globeSize, setGlobeSize] = useState({ width: 100, height: 100 });
    const [parameters, setParameters] = useState({
        transport: {
            travelDemand: 2,
            lightVehicles: 2,
            heavyVehicles: 2
        },
        buildings: {
            behaviour: 2,
            efficiency: 2,
            heatingSystem: 2
        },
        industry: {
            carbonIntensity: 2,
            carbonCapture: 2,
            hydrogen: 2
        },
        electricity: {
            nuclear: 2,
            wind: 2,
            solar: 2,
            waveAndTidal: 2
        },
        landAndWaste: {
            forestry: 2,
            bioenergy: 2,
            waste: 2
        }
    });
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const containerEl = useRef();
    const globeEl = useRef();

    useEffect(() => {
        const handleResize = () => {
            if (containerEl.current) {
                const { width, height } = containerEl.current.getBoundingClientRect();
                const size = Math.min(width, height) * 0.9;
                setGlobeSize({ width: size, height: size });
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (globeEl.current) {
            globeEl.current.controls().autoRotate = true;
            globeEl.current.controls().autoRotateSpeed = 0.5;
        }
    }, []);

    const handleParameterChange = (category, name, value) => {
        setParameters(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [name]: value
            }
        }));
    };

    // Dummy data for charts
    const temperatureData = [
        { year: 2020, temperature: 14.5 },
        { year: 2030, temperature: 15.1 },
        { year: 2040, temperature: 15.8 },
        { year: 2050, temperature: 16.5 },
        { year: 2060, temperature: 17.2 },
    ];

    const co2Data = [
        { year: 2020, co2: 410 },
        { year: 2030, co2: 450 },
        { year: 2040, co2: 490 },
        { year: 2050, co2: 530 },
        { year: 2060, co2: 570 },
    ];

    const seaLevelData = [
        { year: 2020, level: 0 },
        { year: 2030, level: 5 },
        { year: 2040, level: 12 },
        { year: 2050, level: 22 },
        { year: 2060, level: 35 },
    ];

    const energyMixData = [
        { name: 'Fossil', value: 60 },
        { name: 'Renewable', value: 30 },
        { name: 'Nuclear', value: 10 },
    ];

    return (
        <>
            <div className="space-background"></div>
            <div className="future-page">
                <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)}>
                    <div className="charts-container">
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={temperatureData}>
                                <XAxis dataKey="year" />
                                <YAxis />
                                <CartesianGrid strokeDasharray="3 3" />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="temperature" stroke="#8884d8" name="Global Temperature (°C)" />
                            </LineChart>
                        </ResponsiveContainer>

                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={co2Data}>
                                <XAxis dataKey="year" />
                                <YAxis />
                                <CartesianGrid strokeDasharray="3 3" />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="co2" stroke="#82ca9d" name="CO2 Concentration (ppm)" />
                            </LineChart>
                        </ResponsiveContainer>

                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={seaLevelData}>
                                <XAxis dataKey="year" />
                                <YAxis />
                                <CartesianGrid strokeDasharray="3 3" />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="level" fill="#8884d8" name="Sea Level Rise (cm)" />
                            </BarChart>
                        </ResponsiveContainer>

                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie data={energyMixData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label />
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Sidebar>
                <div className={`main-content ${sidebarOpen ? '' : 'sidebar-closed'}`}>
                    <div className="globe-container" ref={containerEl}>
                        <Globe
                            ref={globeEl}
                            width={globeSize.width}
                            height={globeSize.height}
                            globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
                            backgroundColor="rgba(0,0,0,0)"
                            pointsData={globeData}
                            pointAltitude="value"
                            pointColor="color"
                            pointRadius={0.5}
                            pointsMerge={true}
                            globeRadius={Math.min(globeSize.width, globeSize.height) * 0.45}
                            atmosphereColor="lightskyblue"
                            atmosphereAltitude={0.15}
                            animateIn={true}
                        />
                    </div>
                    <div className="unity-animation-container">
                        <UnityAnimation />
                    </div>
                    <div className="bottom-bar">
                        <div className="lever-container">
                            {Object.entries(parameters).map(([category, params], index) => (
                                <React.Fragment key={category}>
                                    {index > 0 && <div className="category-divider"></div>}
                                    <div className="category-group">
                                        <h3>{category.charAt(0).toUpperCase() + category.slice(1)}</h3>
                                        <div className="levers-wrapper">
                                            {Object.entries(params).map(([param, value]) => (
                                                <div key={param} className="lever-group">
                                                    {getIconForParam(param)}
                                                    <div className="lever-container">
                                                        <input
                                                            type="range"
                                                            min="1"
                                                            max="4"
                                                            step="1"
                                                            value={value}
                                                            onChange={(e) => handleParameterChange(category, param, parseInt(e.target.value))}
                                                            className="lever"
                                                        />
                                                        <div className="lever-marks">
                                                            <div className="lever-mark"></div>
                                                            <div className="lever-mark"></div>
                                                            <div className="lever-mark"></div>
                                                            <div className="lever-mark"></div>
                                                        </div>
                                                    </div>
                                                    <span className="lever-value">Level {value}</span>
                                                    <span className="lever-label">{getParamLabel(param)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </React.Fragment>
                            ))}
                        </div>
                        <div className="button-container">
                            <button className="results-button">Go to results</button>
                            <button className="reset-button">Reset levers</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

function getIconForParam(param) {
    const iconMap = {
        travelDemand: <CommuteIcon />,
        lightVehicles: <DirectionsCarIcon />,
        heavyVehicles: <LocalShippingIcon />,
        behaviour: <PersonIcon />,
        efficiency: <EcoIcon />,
        heatingSystem: <AcUnitIcon />,
        carbonIntensity: <Co2Icon />,
        carbonCapture: <FilterAltIcon />,
        hydrogen: <ScienceIcon />,
        nuclear: <RadioactiveIcon />,
        wind: <AirIcon />,
        solar: <WbSunnyIcon />,
        waveAndTidal: <WaterIcon />,
        forestry: <ParkIcon />,
        bioenergy: <GrassIcon />,
        waste: <DeleteIcon />
    };
    return iconMap[param] || <SettingsIcon />;
}

function getParamLabel(param) {
    const labelMap = {
        travelDemand: 'Travel Demand',
        lightVehicles: 'Light Vehicles',
        heavyVehicles: 'Heavy Vehicles',
        behaviour: 'Behaviour',
        efficiency: 'Efficiency',
        heatingSystem: 'Heating System',
        carbonIntensity: 'Carbon Intensity',
        carbonCapture: 'Carbon Capture',
        hydrogen: 'Hydrogen',
        nuclear: 'Nuclear',
        wind: 'Wind',
        solar: 'Solar',
        waveAndTidal: 'Wave/ Tidal',
        forestry: 'Forestry',
        bioenergy: 'Bioenergy',
        waste: 'Waste'
    };
    return labelMap[param] || param;
}

export default Future;