import React from 'react';
import { Outlet } from 'react-router-dom';
import ShopBot from './ShopBot';
import { Shop } from '../types';

interface LayoutProps {
    allShops?: Shop[];
    globalConfig?: any;
}

const Layout: React.FC<LayoutProps> = ({ allShops = [], globalConfig }) => {
    const themeColor = globalConfig?.primaryColor || '#22d3ee';
    const bgColor = globalConfig?.bgColor || '#000000';
    
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
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40" />
            </div>

            <main className="flex-grow overflow-y-auto no-scrollbar relative z-10">
                <Outlet />
            </main>

            {/* ShopBot Floating Assistant */}
            <ShopBot allShops={allShops} />
        </div>
    );
};

export default Layout;
