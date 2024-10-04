import React from 'react';
import * as d3 from 'd3';

const ColorLegend = ({ minValue, maxValue, colorScale }) => {
    const gradientId = 'color-gradient';
    const height = 200;
    const width = 30;

    const ticks = d3.range(0, 1.1, 0.1).map(d => minValue + d * (maxValue - minValue));

    return (
        <div style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)' }}>
            <svg width={width + 40} height={height + 20}>
                <defs>
                    <linearGradient id={gradientId} x1="0%" y1="100%" x2="0%" y2="0%">
                        {ticks.map((tick, i) => (
                            <stop
                                key={i}
                                offset={`${i * 10}%`}
                                stopColor={colorScale(tick)}
                            />
                        ))}
                    </linearGradient>
                </defs>
                <rect x="0" y="10" width={width} height={height} fill={`url(#${gradientId})`} />
                {ticks.map((tick, i) => (
                    <g key={i} transform={`translate(${width}, ${height - i * height / 10 + 10})`}>
                        <line x1="0" y1="0" x2="5" y2="0" stroke="white" />
                        <text x="8" y="4" fontSize="10" fill="white" textAnchor="start">
                            {tick.toFixed(2)}
                        </text>
                    </g>
                ))}
            </svg>
        </div>
    );
};

export default ColorLegend;