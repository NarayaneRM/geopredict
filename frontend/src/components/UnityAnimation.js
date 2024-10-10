import React, { useEffect, useRef } from 'react';

function UnityAnimation() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const script = document.createElement('script');
        script.src = "/game/Build/GameSpaceApps.loader.js";
        script.async = true;
        document.body.appendChild(script);

        script.onload = () => {
            window.createUnityInstance(canvasRef.current, {
                dataUrl: "/game/Build/webgl.data",
                frameworkUrl: "/game/Build/build.framework.js",
                codeUrl: "/game/Build/build.wasm",
                streamingAssetsUrl: "/game/StreamingAssets",
                companyName: "GeoPredict",
                productName: "EduEco",
                productVersion: "0.1",
                webglContextAttributes: {alpha: true, preserveDrawingBuffer: true},
                backgroundColor: 'transparent',
                backgroundAlpha: 0
            });
        };

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    return (
        <canvas 
            ref={canvasRef} 
            id="unity-canvas" 
            style={{
                width: '100%', 
                height: '100%', 
                background: 'transparent'
            }}
        />
    );
}

export default UnityAnimation;
