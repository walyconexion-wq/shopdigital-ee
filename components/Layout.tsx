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
                    className="absolute inset-0"
                    style={{
                        background: 'radial-gradient(ellipse at 50% 30%, rgba(34,211,238,0.08) 0%, transparent 60%), linear-gradient(180deg, #0D0E12 0%, #090A0D 50%, #050507 100%)',
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
