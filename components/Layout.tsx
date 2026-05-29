import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AriMerchantAssistant } from './AriMerchantAssistant';
import { Shop } from '../types';

interface LayoutProps {
    allShops?: Shop[];
    globalConfig?: any;
}

const Layout: React.FC<LayoutProps> = ({ allShops = [], globalConfig }) => {
    const location = useLocation();
    const themeColor = globalConfig?.primaryColor || '#22d3ee';
    const bgColor = globalConfig?.bgColor || '#000000';
    const themeMode = globalConfig?.themeMode || 'auto';
    
    // Helper to check if it is currently day mode
    const checkIsDayMode = (mode: string) => {
        if (mode === 'light') return true;
        if (mode === 'dark') return false;
        const hour = new Date().getHours();
        return hour >= 8 && hour < 20;
    };

    const [isDayMode, setIsDayMode] = React.useState(() => checkIsDayMode(themeMode));

    React.useEffect(() => {
        setIsDayMode(checkIsDayMode(themeMode));
        
        if (themeMode === 'auto') {
            const interval = setInterval(() => {
                setIsDayMode(checkIsDayMode(themeMode));
            }, 60000);
            return () => clearInterval(interval);
        }
    }, [themeMode]);
    
    // Ocultar ARI en páginas de edición y paneles que tienen su propio ARI (como Embajador)
    const isEditPage = location.pathname.includes('/editar') || location.pathname.includes('/mi-catalogo') || location.pathname.includes('/embajador');

    // Helper to convert hex to rgba
    const hexToRgba = (hex: string, alpha: number) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    const containerStyle = {
        '--theme-primary': themeColor,
        '--theme-glow': hexToRgba(themeColor, 0.5),
        '--theme-bg-glow': hexToRgba(themeColor, 0.08),
    } as React.CSSProperties;

    // Dummy shop para el contexto de ARI en modo cliente/baquiana
    const ariContextShop: Shop = {
        id: 'ari-global',
        name: 'ShopDigital',
        category: 'Red Comercial',
        slug: 'shopdigital',
        address: 'Argentina',
        phone: '',
        description: 'Red Comercial Digital de Argentina',
        rating: 5,
        isActive: true,
        offers: [],
        visits: 0,
        subscribers: 0,
        tags: [],
    } as unknown as Shop;

    // Sistema de Fondos Tecnológicos
    const techBg = globalConfig?.techBg || 'none';
    const getTechBgStyles = () => {
        switch (techBg) {
            case 'stardust':
                return { texture: "url('https://www.transparenttextures.com/patterns/stardust.png')", opacity: 0.35, grid: true, glow: 0.12 };
            case 'circuit':
                return { texture: "url('https://www.transparenttextures.com/patterns/circuits.png')", opacity: 0.25, grid: false, glow: 0.1 };
            case 'matrix':
                return { texture: "url('https://www.transparenttextures.com/patterns/dark-mosaic.png')", opacity: 0.3, grid: true, glow: 0.1 };
            case 'nebula':
                return { texture: "url('https://www.transparenttextures.com/patterns/asfalt-dark.png')", opacity: 0.4, grid: false, glow: 0.15 };
            case 'hex':
                return { texture: "url('https://www.transparenttextures.com/patterns/hexellence.png')", opacity: 0.25, grid: true, glow: 0.1 };
            case 'cyber':
                return { texture: "url('https://www.transparenttextures.com/patterns/carbon-fibre-v2.png')", opacity: 0.3, grid: false, glow: 0.12 };
            default:
                return null;
        }
    };
    const techStyle = getTechBgStyles();

    return (
        <div 
            className={`w-full max-w-md mx-auto h-screen flex flex-col overflow-hidden relative shadow-2xl ${isDayMode ? 'day-mode' : ''}`}
            style={{ 
                ...containerStyle, 
                backgroundColor: isDayMode ? '#f8fafc' : bgColor 
            }}
        >
            {/* Modo Navidad: Nieve Cayendo en CSS Puro */}
            {globalConfig?.isChristmasMode && (
                <div className="absolute inset-0 pointer-events-none z-[999] overflow-hidden">
                    <style>{`
                        @keyframes globalSnowfall {
                            0% { transform: translateY(-10px) translateX(0); opacity: 0; }
                            10% { opacity: 0.8; }
                            90% { opacity: 0.8; }
                            100% { transform: translateY(105vh) translateX(55px); opacity: 0; }
                        }
                        .snowflake-global {
                            position: absolute;
                            color: #fff;
                            font-size: 1.2em;
                            user-select: none;
                            pointer-events: none;
                            z-index: 999;
                            opacity: 0;
                            text-shadow: 0 0 3px rgba(255,255,255,0.8), 0 0 10px rgba(6,182,212,0.4);
                        }
                    `}</style>
                    {[...Array(15)].map((_, i) => {
                        const left = (i * 7) + Math.sin(i) * 2;
                        const delay = (i * 0.7).toFixed(1);
                        const duration = (6 + (i % 5) * 1.5).toFixed(1);
                        const scale = (0.5 + (i % 3) * 0.25).toFixed(2);
                        return (
                            <span 
                                key={i} 
                                className="snowflake-global"
                                style={{
                                    left: `${left}%`,
                                    animation: `globalSnowfall ${duration}s linear ${delay}s infinite`,
                                    transform: `scale(${scale})`
                                }}
                            >
                                ❄️
                            </span>
                        );
                    })}
                </div>
            )}
            {/* Background Effect */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div
                    className="absolute inset-0"
                    style={{
                        background: isDayMode 
                            ? `radial-gradient(ellipse at 50% 30%, ${hexToRgba(themeColor, 0.07)} 0%, transparent 65%), linear-gradient(180deg, #fffdfa 0%, #faf5ee 50%, #f4edd9 100%)`
                            : `radial-gradient(ellipse at 50% 30%, ${hexToRgba(themeColor, 0.08)} 0%, transparent 60%), linear-gradient(180deg, ${bgColor} 0%, ${bgColor} 50%, ${bgColor} 100%)`,
                    }}
                />
                {/* Fondo Tecnológico Dinámico */}
                {techStyle && !isDayMode && (
                    <>
                        <div className="absolute inset-0" style={{ backgroundImage: techStyle.texture, opacity: techStyle.opacity }} />
                        {techStyle.grid && (
                            <div className="absolute inset-0" style={{
                                backgroundImage: `linear-gradient(${hexToRgba(themeColor, 0.07)} 1px, transparent 1px), linear-gradient(90deg, ${hexToRgba(themeColor, 0.07)} 1px, transparent 1px)`,
                                backgroundSize: '35px 35px'
                            }} />
                        )}
                        <div className="absolute top-0 right-0 w-[70%] h-[70%] rounded-full blur-[120px]" style={{ backgroundColor: hexToRgba(themeColor, techStyle.glow) }} />
                        <div className="absolute bottom-0 left-0 w-[50%] h-[50%] rounded-full blur-[100px]" style={{ backgroundColor: hexToRgba(themeColor, techStyle.glow * 0.6) }} />
                    </>
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40" />
            </div>

            <main className="flex-grow overflow-y-auto no-scrollbar relative z-10">
                <Outlet />
            </main>

            {/* ARI - Asistente Baquiana Global (visible en todas las zonas) */}
            {!isEditPage && (
                <AriMerchantAssistant 
                    shop={ariContextShop} 
                    role="baquiana" 
                    townId={themeMode}
                    isDayMode={isDayMode}
                    globalConfig={globalConfig}
                />
            )}
        </div>
    );
};

export default Layout;
