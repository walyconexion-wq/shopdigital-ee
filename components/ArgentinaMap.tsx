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
        <div className="relative w-full" style={{ maxWidth: 210, margin: '0 auto' }}>
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
                        <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                    </radialGradient>
                    
                    {/* Radar Sweep Gradient */}
                    <linearGradient id="radarGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="transparent" />
                        <stop offset="90%" stopColor={hexToRgba(accentColor, 0.4)} />
                        <stop offset="100%" stopColor="#ffffff" />
                    </linearGradient>

                    <style>{`
                        @keyframes rotateRadar {
                            from { transform: rotate(0deg); }
                            to { transform: rotate(360deg); }
                        }
                        .radar-sweep {
                            transform-origin: 150px 220px;
                            animation: rotateRadar 5s linear infinite;
                        }
                    `}</style>
                </defs>

                {/* Radar Scanning Effect */}
                <g className="radar-sweep" opacity="0.6">
                    <path 
                        d="M150,220 L150,20 A200,200 0 0,1 300,220 Z" 
                        fill="url(#radarGrad)" 
                        opacity="0.15"
                    />
                    <line 
                        x1="150" y1="220" x2="150" y2="20" 
                        stroke="#ffffff" 
                        strokeWidth="1.5" 
                        opacity="0.4"
                        style={{ filter: 'drop-shadow(0 0 5px #ffffff)' }}
                    />
                </g>

                {/* Highly Accurate Argentina outline + Provinces */}
                <g style={{ filter: 'drop-shadow(0 0 10px rgba(0,251,255,0.25))' }}>
                    {/* Main body */}
                    <path
                        d="M125,25 L145,28 L170,35 L190,45 L210,60 L230,85 L245,115 L235,145 L225,185 L210,225 L195,265 L185,305 L175,345 L165,385 L155,425 L145,465 L148,485 L135,495 L120,485 L110,460 L100,420 L90,380 L80,340 L75,300 L85,260 L95,220 L105,180 L110,140 L115,100 L120,60 L125,30 Z"
                        stroke={hexToRgba(accentColor, 0.4)}
                        strokeWidth="1.5"
                        fill={hexToRgba(accentColor, 0.08)}
                    />
                    {/* Tierra del Fuego */}
                    <path
                        d="M132,502 L148,506 L152,522 L132,525 Z"
                        stroke={hexToRgba(accentColor, 0.4)}
                        strokeWidth="1"
                        fill={hexToRgba(accentColor, 0.1)}
                    />
                    {/* Misiones detail */}
                    <path
                        d="M215,62 L230,55 L245,75 L235,95 Z"
                        stroke={hexToRgba(accentColor, 0.4)}
                        strokeWidth="1"
                        fill={hexToRgba(accentColor, 0.1)}
                    />
                    
                    {/* Simplified provincial borders in white neon */}
                    <g stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" strokeDasharray="2 2">
                        <path d="M120,75 L215,85" /> {/* Formosa/Chaco */}
                        <path d="M115,115 L225,130" /> {/* Santiago/Sta Fe */}
                        <path d="M110,160 L210,175" /> {/* Cordoba/BsAs border area */}
                        <path d="M100,215 L195,235" /> {/* La Pampa/BsAs */}
                        <path d="M90,285 L185,300" /> {/* Rio Negro */}
                        <path d="M80,365 L165,380" /> {/* Chubut */}
                        <path d="M75,445 L145,460" /> {/* Santa Cruz */}
                    </g>
                </g>

                {/* Connection lines between active nodes */}
                {nodes.filter(n => n.isActive).map((node, i, arr) => {
                    if (i === 0) return null;
                    const prev = arr[i - 1];
                    return (
                        <line
                            key={`line-${node.id}`}
                            x1={prev.x} y1={prev.y}
                            x2={node.x} y2={node.y}
                            stroke="rgba(255,255,255,0.3)"
                            strokeWidth="1.2"
                            strokeDasharray="4 4"
                        />
                    );
                })}

                {/* Node dots */}
                {nodes.map(node => (
                    <g key={node.id} onClick={() => node.isActive && onNodeClick(node.id)} style={{ cursor: node.isActive ? 'pointer' : 'default' }}>
                        {/* Outer pulse ring */}
                        {node.isActive && (
                            <circle cx={node.x} cy={node.y} r="15" fill="url(#nodeGrad)" opacity="0.5">
                                <animate attributeName="r" values="10;18;10" dur="2s" repeatCount="indefinite" />
                                <animate attributeName="opacity" values="0.5;0.2;0.5" dur="2s" repeatCount="indefinite" />
                            </circle>
                        )}
                        {/* Main dot - PURE WHITE */}
                        <circle
                            cx={node.x} cy={node.y}
                            r={node.isActive ? 6 : 4}
                            fill={node.isActive ? '#ffffff' : 'rgba(255,255,255,0.3)'}
                            style={{ filter: node.isActive ? 'drop-shadow(0 0 8px #ffffff)' : 'none' }}
                        />
                        {/* Label - PURE WHITE */}
                        <text
                            x={node.x + 12} y={node.y + 4}
                            fill="#ffffff"
                            fontSize="11"
                            fontWeight="900"
                            fontFamily="system-ui, sans-serif"
                            letterSpacing="0.08em"
                            style={{ 
                                textTransform: 'uppercase',
                                textShadow: node.isActive ? '0 0 15px rgba(255,255,255,0.8)' : '0 0 5px rgba(255,255,255,0.3)',
                                opacity: node.isActive ? 1 : 0.4
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
