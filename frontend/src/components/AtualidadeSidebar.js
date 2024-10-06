import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import './AtualidadeSidebar.css';

const AtualidadeSidebar = ({
    availableYears,
    selectedYear,
    onYearChange,
    dataType,
    onDataTypeChange,
    isPlaying,
    onPlayToggle
}) => {
    const [currentYear, setCurrentYear] = useState(selectedYear);

    useEffect(() => {
        setCurrentYear(selectedYear);
    }, [selectedYear]);

    const handleYearChange = (selectedOption) => {
        const year = selectedOption.value;
        setCurrentYear(year);
        onYearChange(year);
    };

    const handlePlayToggle = () => {
        onPlayToggle(!isPlaying);
    };

    const yearOptions = availableYears.map(year => ({ value: year, label: year }));
    const dataTypeOptions = [
        { value: 'natural', label: 'Emissões Naturais' },
        { value: 'anthropogenic', label: 'Emissões Antropogênicas' }
    ];

    const customStyles = {
        control: (provided) => ({
            ...provided,
            backgroundColor: 'rgba(30, 30, 30, 0.9)',
            borderColor: 'rgba(255, 255, 255, 0.2)',
            color: '#fff',
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
        // Adicionando estilos para a barra de rolagem
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

    return (
        <div className="atualidade-sidebar">
            <h2>Configurações</h2>
            <div className="sidebar-section">
                <label htmlFor="year-select">Ano:</label>
                <Select
                    id="year-select"
                    options={yearOptions}
                    value={{ value: currentYear, label: currentYear }}
                    onChange={handleYearChange}
                    isDisabled={isPlaying}
                    styles={customStyles}
                />
            </div>
            <div className="sidebar-section">
                <label htmlFor="data-type-select">Tipo de Dados:</label>
                <Select
                    id="data-type-select"
                    options={dataTypeOptions}
                    value={dataTypeOptions.find(option => option.value === dataType)}
                    onChange={(selectedOption) => onDataTypeChange(selectedOption.value)}
                    styles={customStyles}
                />
            </div>
            <div className="sidebar-section">
                <button onClick={handlePlayToggle}>
                    {isPlaying ? 'Pausar' : 'Reproduzir'}
                </button>
            </div>
        </div>
    );
};

export default AtualidadeSidebar;