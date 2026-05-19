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
    
    // Ocultar ARI en páginas de edición para que solo aparezca la versión del comerciante
    const isEditPage = location.pathname.includes('/editar') || location.pathname.includes('/mi-catalogo');

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
                return { texture: "url('https://www.transparenttextures.com/patterns/stardust.png')", opacity: 0.15, grid: true };
            case 'circuit':
                return { texture: "url('https://www.transparenttextures.com/patterns/circuits.png')", opacity: 0.08, grid: false };
            case 'matrix':
                return { texture: "url('https://www.transparenttextures.com/patterns/dark-mosaic.png')", opacity: 0.12, grid: true };
            case 'nebula':
                return { texture: "url('https://www.transparenttextures.com/patterns/asfalt-dark.png')", opacity: 0.2, grid: false };
            case 'hex':
                return { texture: "url('https://www.transparenttextures.com/patterns/hexellence.png')", opacity: 0.1, grid: true };
            case 'cyber':
                return { texture: "url('https://www.transparenttextures.com/patterns/carbon-fibre-v2.png')", opacity: 0.12, grid: false };
            default:
                return null;
        }
    };
    const techStyle = getTechBgStyles();

    return (
        <div 
            className="w-full max-w-md mx-auto h-screen flex flex-col overflow-hidden relative shadow-2xl"
            style={{ ...containerStyle, backgroundColor: bgColor }}
        >
            {/* Background Effect */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div
                    className="absolute inset-0"
                    style={{
                        background: `radial-gradient(ellipse at 50% 30%, ${hexToRgba(themeColor, 0.08)} 0%, transparent 60%), linear-gradient(180deg, ${bgColor} 0%, ${bgColor} 50%, ${bgColor} 100%)`,
                    }}
                />
                {/* Fondo Tecnológico Dinámico */}
                {techStyle && (
                    <>
                        <div className="absolute inset-0 mix-blend-screen" style={{ backgroundImage: techStyle.texture, opacity: techStyle.opacity }} />
                        {techStyle.grid && (
                            <div className="absolute inset-0" style={{
                                backgroundImage: `linear-gradient(${hexToRgba(themeColor, 0.04)} 1px, transparent 1px), linear-gradient(90deg, ${hexToRgba(themeColor, 0.04)} 1px, transparent 1px)`,
                                backgroundSize: '30px 30px'
                            }} />
                        )}
                        <div className="absolute top-0 right-0 w-[60%] h-[60%] rounded-full blur-[100px]" style={{ backgroundColor: hexToRgba(themeColor, 0.06) }} />
                    </>
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40" />
            </div>

            <main className="flex-grow overflow-y-auto no-scrollbar relative z-10">
                <Outlet />
            </main>

            {/* ARI - Asistente Baquiana Global (visible en todas las zonas) */}
            {!isEditPage && <AriMerchantAssistant shop={ariContextShop} role="baquiana" />}
        </div>
    );
};

export default Layout;
