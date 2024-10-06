import React, { useState, useEffect } from 'react';
import './AtualidadeSidebar.css';

const AtualidadeSidebar = ({
    availableYears,
    selectedYear,
    onYearChange,
    dataType,
    onDataTypeChange,
    dataInfo,
    isLoading,
    error,
    countries,
    selectedCountry,
    onCountryChange,
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredCountries, setFilteredCountries] = useState([]);

    useEffect(() => {
        if (searchTerm) {
            const filtered = countries.filter(country => 
                country.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredCountries(filtered);
        } else {
            setFilteredCountries([]);
        }
    }, [searchTerm, countries]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleCountrySelect = (country) => {
        onCountryChange(country);
        setSearchTerm('');
    };

    return (
        <div className="atualidade-sidebar">
            <h2>Controles</h2>
            <div className="sidebar-section">
                <label>Ano:</label>
                <select value={selectedYear} onChange={(e) => onYearChange(e.target.value)}>
                    {availableYears.map((year) => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </select>
            </div>
            <div className="sidebar-section">
                <label>Tipo de Dados:</label>
                <select value={dataType} onChange={(e) => onDataTypeChange(e.target.value)}>
                    <option value="natural">Natural</option>
                    <option value="anthropogenic">Antropogênico</option>
                </select>
            </div>
            <div className="sidebar-section">
                <label>País:</label>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder="Buscar país..."
                />
                {filteredCountries.length > 0 && (
                    <ul className="country-list">
                        {filteredCountries.map((country) => (
                            <li key={country} onClick={() => handleCountrySelect(country)}>
                                {country}
                            </li>
                        ))}
                    </ul>
                )}
                {selectedCountry && (
                    <p>País selecionado: {selectedCountry}</p>
                )}
            </div>
            <div className="sidebar-section">
                <p>{dataInfo}</p>
                {isLoading && <p>Carregando...</p>}
                {error && <p className="error">{error}</p>}
            </div>
        </div>
    );
};

export default AtualidadeSidebar;