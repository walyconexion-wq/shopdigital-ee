import React, { useState, useEffect, useRef } from 'react';

interface LoadingScreenProps {
    /**
     * When true, the loader triggers its fade-out and calls onDone after the
     * CSS transition completes. While false, it stays fully visible.
     */
    ready: boolean;
    /** Called when the fade-out animation finishes — parent should unmount this component */
    onDone: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ ready, onDone }) => {
    const [visible, setVisible] = useState(true);
    const [progressSegments, setProgressSegments] = useState(1);
    const onDoneRef = useRef(onDone);
    onDoneRef.current = onDone;

    useEffect(() => {
        if (!ready) return;
        // Fade out
        setVisible(false);
        // Unmount after transition (260ms) + buffer
        const timer = setTimeout(() => onDoneRef.current(), 320);
        return () => clearTimeout(timer);
    }, [ready]);

    // Animate the segmented progress bar (cycles from 1 to 5 segments)
    useEffect(() => {
        const interval = setInterval(() => {
            setProgressSegments((prev) => (prev >= 5 ? 1 : prev + 1));
        }, 400);
        return () => clearInterval(interval);
    }, []);

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#B58E73', // Fondo marrón cálido premium de la marca
                transition: 'opacity 260ms ease-out',
                opacity: visible ? 1 : 0,
                pointerEvents: visible ? 'all' : 'none',
                overflow: 'hidden',
                fontFamily: "Georgia, serif" // Tipografía elegante serif para estética y simetría
            }}
        >
            {/* 1. Botón/Cápsula Superior "ShopDigital" */}
            <div
                style={{
                    background: '#756053',
                    border: '1.5px solid #4D3F36',
                    borderBottomWidth: '4.5px',
                    borderRadius: '2rem',
                    padding: '0.8rem 2.8rem',
                    boxShadow: '0 10px 20px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                    marginBottom: '2.5rem',
                    transform: 'translateY(0)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <span
                    style={{
                        color: '#E8F5EA', // Color crema premium
                        fontSize: '2rem',
                        fontWeight: 'normal',
                        letterSpacing: '0.02em',
                        textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
                    }}
                >
                    ShopDigital
                </span>
            </div>

            {/* 2. Personaje 3D de Ari Cuerpo Completo (Centrado y con profundidad de sombra) */}
            <div
                style={{
                    position: 'relative',
                    width: '210px',
                    height: '310px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '2.2rem'
                }}
            >
                {/* Sombra de pie para dar profundidad 3D */}
                <div
                    style={{
                        position: 'absolute',
                        bottom: '-5px',
                        width: '120px',
                        height: '14px',
                        borderRadius: '50%',
                        background: 'rgba(0, 0, 0, 0.25)',
                        filter: 'blur(6px)',
                        pointerEvents: 'none'
                    }}
                />
                
                <img
                    src="/ari-fullbody.png"
                    alt="Ari Asistente IA"
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.18))',
                        position: 'relative',
                        zIndex: 1
                    }}
                />
            </div>

            {/* 3. Texto descriptivo "cargando sistema" */}
            <p
                style={{
                    color: '#E8F5EA',
                    fontSize: '1.25rem',
                    margin: '0 0 0.8rem 0',
                    fontWeight: 'normal',
                    textAlign: 'center',
                    letterSpacing: '0.04em'
                }}
            >
                cargando sistema
            </p>

            {/* 4. Barra de Progreso Segmentada (Contenedor blanco con bloques internos animados) */}
            <div
                style={{
                    background: '#FFFFFF',
                    width: '235px',
                    height: '42px',
                    borderRadius: '0.8rem',
                    padding: '5px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)'
                }}
            >
                {Array.from({ length: 5 }).map((_, idx) => (
                    <div
                        key={idx}
                        style={{
                            width: '39px',
                            height: '100%',
                            background: idx < progressSegments ? '#756053' : 'transparent',
                            borderRadius: '0.45rem',
                            marginRight: idx < 4 ? '5px' : '0px',
                            transition: 'background-color 150ms ease-in-out',
                            boxShadow: idx < progressSegments ? 'inset 0 1px 0 rgba(255,255,255,0.1)' : 'none'
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

export default LoadingScreen;

