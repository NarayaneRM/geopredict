import React, { useState } from 'react';
import { useSpring, animated } from '@react-spring/web';

const InteractiveCity = () => {
    const [rotation, setRotation] = useState(0);
    const [zoom, setZoom] = useState(1);
    const [selectedBuilding, setSelectedBuilding] = useState(null);

    const [props, api] = useSpring(() => ({
        rotation: 0,
        scale: 1,
    }));

    const handleRotate = (direction) => {
        const newRotation = rotation + (direction === 'left' ? -15 : 15);
        setRotation(newRotation);
        api.start({ rotation: newRotation });
    };

    const handleZoom = (direction) => {
        const newZoom = direction === 'in' ? zoom * 1.2 : zoom / 1.2;
        setZoom(newZoom);
        api.start({ scale: newZoom });
    };

    const handleBuildingClick = (building) => {
        setSelectedBuilding(building);
        // Aqui você pode adicionar lógica para exibir informações sobre o edifício
    };

    return (
        <div className="interactive-city-container">
            <animated.div
                className="city-model"
                style={{
                    transform: props.rotation.to(r => `rotateY(${r}deg) scale(${props.scale.get()})`),
                }}
            >
                {/* Adicione seus edifícios e elementos da cidade aqui */}
                <div className="building" onClick={() => handleBuildingClick('building1')}>Edifício 1</div>
                <div className="building" onClick={() => handleBuildingClick('building2')}>Edifício 2</div>
                {/* ... mais edifícios ... */}
            </animated.div>
            <div className="controls">
                <button onClick={() => handleRotate('left')}>Girar Esquerda</button>
                <button onClick={() => handleRotate('right')}>Girar Direita</button>
                <button onClick={() => handleZoom('in')}>Zoom In</button>
                <button onClick={() => handleZoom('out')}>Zoom Out</button>
            </div>
            {selectedBuilding && (
                <div className="building-info">
                    {/* Exiba informações sobre o edifício selecionado */}
                    Informações sobre {selectedBuilding}
                </div>
            )}
        </div>
    );
};

export default InteractiveCity;