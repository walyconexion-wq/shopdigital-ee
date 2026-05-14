import React from 'react';

interface MapNode {
    id: string;
    label: string;
    x: number;
    y: number;
    isActive: boolean;
}

interface ArgentinaMapProps {
    nodes: MapNode[];
    onNodeClick: (id: string) => void;
    accentColor?: string;
}

const ArgentinaMap: React.FC<ArgentinaMapProps> = ({ nodes, onNodeClick, accentColor = '#00FBFF' }) => {
    const hexToRgba = (hex: string, a: number) => {
        try {
            const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
            return `rgba(${r},${g},${b},${a})`;
        } catch { return `rgba(0,251,255,${a})`; }
    };

    return (
        <div className="relative w-full" style={{ maxWidth: 320, margin: '0 auto' }}>
            <svg viewBox="0 0 300 520" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
                {/* Glow filter */}
                <defs>
                    <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                    <filter id="dotGlow" x="-100%" y="-100%" width="300%" height="300%">
                        <feGaussianBlur stdDeviation="6" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                    <radialGradient id="nodeGrad" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor={accentColor} stopOpacity="1" />
                        <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
                    </radialGradient>
                </defs>

                {/* Simplified Argentina outline */}
                <path
                    d="M155 15 L170 25 L185 20 L195 30 L200 45 L210 50 L220 48 L225 55 L215 65 L220 80 L230 85 L235 95 L225 105 L230 120 L225 135 L220 145 L225 160 L220 175 L215 190 L220 205 L215 220 L210 235 L205 250 L200 265 L195 280 L190 295 L185 310 L180 325 L175 340 L170 355 L165 370 L160 385 L155 400 L150 415 L145 425 L140 435 L135 440 L125 445 L120 450 L130 460 L145 465 L155 470 L160 480 L150 490 L140 495 L130 490 L120 485 L115 475 L110 465 L105 455 L100 445 L95 435 L90 425 L85 415 L80 400 L75 385 L70 370 L72 355 L75 340 L78 325 L80 310 L83 295 L85 280 L88 265 L90 250 L92 235 L95 220 L98 205 L100 190 L102 175 L105 160 L108 145 L112 130 L115 115 L118 100 L120 85 L125 70 L130 55 L135 45 L140 35 L145 25 L150 18 Z"
                    stroke={hexToRgba(accentColor, 0.25)}
                    strokeWidth="1.5"
                    fill={hexToRgba(accentColor, 0.03)}
                    filter="url(#neonGlow)"
                />

                {/* Connection lines between active nodes */}
                {nodes.filter(n => n.isActive).map((node, i, arr) => {
                    if (i === 0) return null;
                    const prev = arr[i - 1];
                    return (
                        <line
                            key={`line-${node.id}`}
                            x1={prev.x} y1={prev.y}
                            x2={node.x} y2={node.y}
                            stroke={hexToRgba(accentColor, 0.15)}
                            strokeWidth="1"
                            strokeDasharray="4 4"
                        />
                    );
                })}

                {/* Node dots */}
                {nodes.map(node => (
                    <g key={node.id} onClick={() => node.isActive && onNodeClick(node.id)} style={{ cursor: node.isActive ? 'pointer' : 'default' }}>
                        {/* Outer pulse ring */}
                        {node.isActive && (
                            <circle cx={node.x} cy={node.y} r="14" fill="url(#nodeGrad)" opacity="0.3">
                                <animate attributeName="r" values="10;18;10" dur="3s" repeatCount="indefinite" />
                                <animate attributeName="opacity" values="0.3;0.1;0.3" dur="3s" repeatCount="indefinite" />
                            </circle>
                        )}
                        {/* Main dot */}
                        <circle
                            cx={node.x} cy={node.y}
                            r={node.isActive ? 5 : 3}
                            fill={node.isActive ? accentColor : hexToRgba(accentColor, 0.3)}
                            filter={node.isActive ? "url(#dotGlow)" : undefined}
                        />
                        {/* Label */}
                        <text
                            x={node.x + 10} y={node.y + 4}
                            fill={node.isActive ? '#ffffff' : hexToRgba('#ffffff', 0.3)}
                            fontSize="9"
                            fontWeight="900"
                            fontFamily="system-ui, sans-serif"
                            letterSpacing="0.05em"
                            style={{ textTransform: 'uppercase' }}
                        >
                            {node.label}
                        </text>
                    </g>
                ))}
            </svg>
        </div>
    );
};

export default ArgentinaMap;
