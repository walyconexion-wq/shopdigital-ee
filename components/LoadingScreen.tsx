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

    return (
        <>
            <style>{`
        @keyframes sd-breathe {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.022); }
        }

        @keyframes sd-shimmer {
          0%   { left: -65%; }
          100% { left: 115%; }
        }

        @keyframes sd-dots {
          0%        { content: 'Conectando comercios.'; }
          33.33%    { content: 'Conectando comercios..'; }
          66.66%    { content: 'Conectando comercios...'; }
        }

        .sd-loader-logo {
          animation: sd-breathe 2s ease-in-out infinite;
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .sd-loader-bar-track {
          width: 65%;
          max-width: 240px;
          height: 2px;
          background: rgba(34, 211, 238, 0.1);
          border-radius: 999px;
          overflow: hidden;
          position: relative;
          margin: 0 auto 1.1rem;
        }

        .sd-loader-bar-fill {
          position: absolute;
          top: 0;
          left: -65%;
          width: 65%;
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(34, 211, 238, 0.5),
            rgba(34, 211, 238, 1),
            rgba(34, 211, 238, 0.5),
            transparent
          );
          animation: sd-shimmer 1.1s ease-in-out infinite;
          box-shadow: 0 0 12px rgba(34, 211, 238, 0.6);
        }

        .sd-loader-text::after {
          content: 'Conectando comercios.';
          animation: sd-dots 1.5s steps(1, end) infinite;
        }

        .sd-loader-text {
          font-family: 'Inter', sans-serif;
          font-size: 0.6rem;
          font-weight: 400;
          color: rgba(255, 255, 255, 0.55);
          letter-spacing: 0.14em;
          margin: 0;
          text-align: center;
          padding: 0;
          background: none;
          border: none;
        }
      `}</style>

            <div
                style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 9999,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#000000',
                    transition: 'opacity 260ms ease-out',
                    opacity: visible ? 1 : 0,
                    pointerEvents: visible ? 'all' : 'none',
                    overflow: 'hidden'
                }}
            >
                {/* HUD Decorative Elements */}
                <div className="absolute top-20 left-[-10%] w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" style={{ position: 'absolute' }} />
                <div className="absolute bottom-20 right-[-10%] w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" style={{ position: 'absolute' }} />
                
                {/* Ambient cyan glow blob */}
                <div
                    style={{
                        position: 'absolute',
                        top: '18%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '300px',
                        height: '300px',
                        borderRadius: '50%',
                        background:
                            'radial-gradient(circle, rgba(34,211,238,0.1) 0%, transparent 68%)',
                        pointerEvents: 'none',
                    }}
                />

                {/* Logo with breathing animation */}
                <div className="sd-loader-logo">
                    <h1
                        style={{
                            margin: 0,
                            fontFamily: "'Inter', sans-serif",
                            fontSize: 'clamp(2.2rem, 9vw, 2.8rem)',
                            fontWeight: 900,
                            letterSpacing: '-0.02em',
                            lineHeight: 1,
                            filter: 'drop-shadow(0 0 20px rgba(34,211,238,0.6))',
                        }}
                    >
                        <span style={{ color: '#ffffff' }}>ShopDigital</span>
                        <span style={{ color: '#22d3ee' }}>.tech</span>
                    </h1>

                    {/* Glow underline */}
                    <div
                        style={{
                            height: '1px',
                            background:
                                'linear-gradient(90deg, transparent, rgba(34,211,238,0.6), transparent)',
                            marginTop: '7px',
                            boxShadow: '0 0 10px rgba(34,211,238,0.4)',
                        }}
                    />

                    {/* Subtitle */}
                    <p
                        style={{
                            margin: '10px 0 0 0',
                            fontFamily: "'Inter', sans-serif",
                            fontSize: '0.57rem',
                            fontWeight: 700,
                            color: 'rgba(255,255,255,0.38)',
                            letterSpacing: '0.38em',
                            textTransform: 'uppercase',
                        }}
                    >
                        ESTEBAN ECHEVERRÍA
                    </p>
                </div>

                {/* Shimmer progress bar */}
                <div className="sd-loader-bar-track">
                    <div className="sd-loader-bar-fill" />
                </div>

                {/* Animated loading text via CSS ::after */}
                <p className="sd-loader-text" />
            </div>
        </>
    );
};

export default LoadingScreen;
