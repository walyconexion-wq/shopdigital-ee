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

                {/* Accurate Argentina outline */}
                <path
                    d="M135,20 L160,25 L185,35 L205,50 L220,70 L230,95 L235,125 L230,155 L220,190 L205,230 L195,270 L185,310 L175,350 L165,390 L155,430 L145,470 L148,495 L135,510 L120,500 L110,475 L100,435 L90,395 L80,355 L75,315 L85,275 L95,235 L105,195 L110,155 L115,115 L120,75 L125,45 Z"
                    stroke={hexToRgba(accentColor, 0.4)}
                    strokeWidth="2"
                    fill={hexToRgba(accentColor, 0.05)}
                    style={{ filter: 'drop-shadow(0 0 12px rgba(0,251,255,0.4))' }}
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
                            stroke={hexToRgba(accentColor, 0.25)}
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
                            <circle cx={node.x} cy={node.y} r="16" fill="url(#nodeGrad)" opacity="0.4">
                                <animate attributeName="r" values="12;20;12" dur="2.5s" repeatCount="indefinite" />
                                <animate attributeName="opacity" values="0.4;0.15;0.4" dur="2.5s" repeatCount="indefinite" />
                            </circle>
                        )}
                        {/* Main dot */}
                        <circle
                            cx={node.x} cy={node.y}
                            r={node.isActive ? 6 : 4}
                            fill={node.isActive ? accentColor : hexToRgba(accentColor, 0.3)}
                            filter={node.isActive ? "url(#dotGlow)" : undefined}
                        />
                        {/* Label */}
                        <text
                            x={node.x + 12} y={node.y + 4}
                            fill={node.isActive ? '#ffffff' : hexToRgba('#ffffff', 0.3)}
                            fontSize="10"
                            fontWeight="900"
                            fontFamily="system-ui, sans-serif"
                            letterSpacing="0.05em"
                            style={{ 
                                textTransform: 'uppercase',
                                textShadow: node.isActive ? '0 0 10px rgba(0,251,255,0.8)' : 'none'
                            }}
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
