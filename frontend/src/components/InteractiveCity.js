import React from 'react';
import { useSpring, animated } from 'react-spring';

const InteractiveCity = () => {
    const [props, set] = useSpring(() => ({
        scale: 1,
        rotation: 0,
    }));

    const handleHover = () => {
        set({ scale: 1.1, rotation: 5 });
    };

    const handleLeave = () => {
        set({ scale: 1, rotation: 0 });
    };

    return (
        <animated.div
            style={{
                transform: props.scale.to(s => `scale(${s}) rotate(${props.rotation.to(r => r)}deg)`),
            }}
            onMouseEnter={handleHover}
            onMouseLeave={handleLeave}
        >
            {/* Adicione aqui os elementos da sua cidade (prédios, árvores, etc.) */}
            <div className="building"></div>
            <div className="tree"></div>
            {/* ... */}
        </animated.div>
    );
};

export default InteractiveCity;