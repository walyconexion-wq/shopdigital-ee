import React from 'react';
import { Outlet } from 'react-router-dom';
import ShopBot from './ShopBot';
import { Shop } from '../types';

interface LayoutProps {
    allShops?: Shop[];
}

const Layout: React.FC<LayoutProps> = ({ allShops = [] }) => {
    return (
        <div className="w-full max-w-md mx-auto h-screen flex flex-col bg-gray-900 overflow-hidden relative shadow-2xl">
            {/* Background Effect */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover"
                    style={{
                        backgroundImage: 'url("https://img.freepik.com/fotos-premium/fondo-tecnologia-red-digital-azul_939148-135.jpg")',
                        backgroundPosition: 'center center',
                        opacity: 1
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
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
