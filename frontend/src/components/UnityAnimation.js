import React, { useEffect, useRef } from 'react';

const UnityAnimation = () => {
    const iframeRef = useRef(null);

    useEffect(() => {
        const loadUnity = () => {
            if (iframeRef.current) {
                iframeRef.current.src = '/game/index.html';
            }
        };

        loadUnity();
    }, []);

    return (
        <div className="unity-container">
            <iframe
                ref={iframeRef}
                title="Unity Animation"
                width="100%"
                height="100%"
                frameBorder="0"
            />
        </div>
    );
};

export default UnityAnimation;
