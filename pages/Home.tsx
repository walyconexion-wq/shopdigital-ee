import React from 'react';
import { CATEGORIES } from '../constants';
import Logo from '../components/Logo';
import { Share2, Store } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { playNeonClick } from '../utils/audio';
import { resolveIcon } from '../utils/iconResolver';

interface HomeProps {
    globalConfig?: any;
}

const Home: React.FC<HomeProps> = ({ globalConfig }) => {
    const navigate = useNavigate();
    const themeColor = globalConfig?.primaryColor || '#22d3ee';
    const activeTheme = globalConfig?.theme || 'default';
    const mainSubtitle = globalConfig?.mainSubtitle || 'Tu guía de ofertas locales';
    const townName = globalConfig?.townName || 'Esteban Echeverría';

    const [logoClicks, setLogoClicks] = React.useState(0);
    const [walyClicks, setWalyClicks] = React.useState(0);

    const hexToRgba = (hex: string, alpha: number) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    // Seasonal Decoration Component
    const SeasonalDecoration = () => {
        if (activeTheme === 'default') return null;

        const items = [];
        const count = 12;
        
        for (let i = 0; i < count; i++) {
            const left = Math.random() * 100;
            const delay = Math.random() * 5;
            const duration = 5 + Math.random() * 10;
            const size = 15 + Math.random() * 20;
            
            let char = '❄️';
            if (activeTheme === 'christmas') char = '🎄';
            if (activeTheme === 'summer') char = '☀️';
            if (activeTheme === 'spring') char = '🌸';
            if (activeTheme === 'winter') char = '❄️';

            items.push(
                <div 
                    key={i}
                    className="fixed pointer-events-none z-0 transition-opacity duration-1000"
                    style={{
                        left: `${left}%`,
                        top: `-50px`,
                        fontSize: `${size}px`,
                        opacity: 0.1,
                        animation: `seasonalFall ${duration}s linear ${delay}s infinite`,
                    }}
                >
                    {char}
                </div>
            );
        }
        return <>{items}</>;
    };

    // Reset clicks logic
    React.useEffect(() => {
        if (logoClicks === 0) return;
        const timer = setTimeout(() => setLogoClicks(0), 1000);
        return () => clearTimeout(timer);
    }, [logoClicks]);

    React.useEffect(() => {
        if (walyClicks === 0) return;
        const timer = setTimeout(() => setWalyClicks(0), 1000);
        return () => clearTimeout(timer);
    }, [walyClicks]);

    const handleLogoClick = () => {
        playNeonClick();
        const nextClicks = logoClicks + 1;
        if (nextClicks >= 3) { navigate('/nosotros'); setLogoClicks(0); }
        else setLogoClicks(nextClicks);
    };

    const handleWalyClick = () => {
        playNeonClick();
        const nextClicks = walyClicks + 1;
        if (nextClicks >= 5) { navigate('/tablero-maestro'); setWalyClicks(0); }
        else setWalyClicks(nextClicks);
    };

    const handleShare = () => {
        playNeonClick();
        const appUrl = window.location.origin;
        const shareText = `¡Mirá los comercios de ${townName} en la App de Waly! 🚀\n\n👉 ${appUrl}`;
        if (navigator.share) {
            navigator.share({ title: 'ShopDigital', text: shareText, url: appUrl }).catch(console.error);
        } else {
            window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
        }
    };

    return (
        <div className="flex flex-col pt-8 pb-12 animate-in fade-in duration-700 relative overflow-hidden min-h-screen bg-transparent">
            <style>
                {`
                @keyframes seasonalFall {
                    0% { transform: translateY(0) rotate(0deg); opacity: 0; }
                    10% { opacity: 0.2; }
                    90% { opacity: 0.2; }
                    100% { transform: translateY(110vh) rotate(360deg); opacity: 0; }
                }
                `}
            </style>
            
            <SeasonalDecoration />

            <div className="absolute top-20 left-[-10%] w-64 h-64 rounded-full blur-3xl pointer-events-none" style={{ backgroundColor: hexToRgba(themeColor, 0.1) }} />
            <div className="absolute bottom-20 right-[-10%] w-64 h-64 rounded-full blur-3xl pointer-events-none" style={{ backgroundColor: hexToRgba(themeColor, 0.1) }} />
            
            <header className="flex-shrink-0 flex flex-col items-center relative z-10 transition-all duration-700 bg-transparent pt-0">
                <div 
                    onClick={handleLogoClick}
                    className="glass-header rounded-3xl p-5 mb-2.5 border backdrop-blur-md animate-in fade-in zoom-in duration-1000 cursor-pointer active:scale-95 transition-all"
                    style={{ 
                        borderColor: hexToRgba(themeColor, 0.5),
                        boxShadow: `0 15px 40px ${hexToRgba(themeColor, 0.4)}`,
                        background: `linear-gradient(135deg, ${hexToRgba(themeColor, 0.2)} 0%, rgba(15,23,42,0.6) 100%)`
                    }}
                >
                    <Logo />
                </div>
            </header>

            <div className="flex flex-col items-center mb-10 mt-3 fade-up-item relative z-10 px-6">
                <div className="h-[1px] w-20 mb-5" style={{ background: `linear-gradient(90deg, transparent, ${hexToRgba(themeColor, 0.5)}, transparent)` }}></div>
                <h2 className="text-[12px] font-[1000] text-white/90 text-shadow-premium uppercase tracking-[0.35em] text-center leading-none">
                    {mainSubtitle}
                </h2>
                <div className="flex items-center gap-3 mt-4">
                    <div className="h-[1px] w-6" style={{ background: `linear-gradient(90deg, transparent, ${hexToRgba(themeColor, 0.3)})` }}></div>
                    <div className="flex gap-1.5">
                        <div className="w-1 h-1 rounded-full" style={{ backgroundColor: hexToRgba(themeColor, 0.2) }}></div>
                        <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: themeColor, boxShadow: `0 0 8px ${hexToRgba(themeColor, 0.6)}` }}></div>
                        <div className="w-1 h-1 rounded-full" style={{ backgroundColor: hexToRgba(themeColor, 0.2) }}></div>
                    </div>
                    <div className="h-[1px] w-6" style={{ background: `linear-gradient(90deg, ${hexToRgba(themeColor, 0.3)}, transparent)` }}></div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-x-4 gap-y-8 px-5 relative z-10">
                {(globalConfig?.categories || CATEGORIES).filter((c: any) => c.isActive !== false).map((cat: any, index: number) => (
                    <button
                        key={cat.id}
                        onClick={() => { playNeonClick(); navigate(`/${cat.slug}`); }}
                        className="glass-button-3d category-btn btn-neon-active aspect-square group backdrop-blur-md border rounded-[1.25rem] transition-all duration-300"
                        style={{
                            animation: `fadeUp 0.7s cubic-bezier(0.25, 1, 0.5, 1) ${index * 35}ms both`,
                            backgroundColor: hexToRgba(themeColor, 0.15),
                            borderColor: hexToRgba(themeColor, 0.2),
                            boxShadow: `0 0 15px ${hexToRgba(themeColor, 0.08)}`
                        }}
                    >
                        <div className="mb-1.5 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-500 ease-out" style={{ color: themeColor }}>
                            {cat.iconKey ? resolveIcon(cat.iconKey) : cat.icon}
                        </div>
                        <span className="text-[8.5px] text-center font-black uppercase leading-[1.1] tracking-[0.01em] px-0.5 text-white/90 group-hover:text-white transition-colors">
                            {cat.name}
                        </span>
                    </button>
                ))}
            </div>

            <div className="mt-12 mb-4 px-14 flex flex-col gap-4 justify-center items-center w-full fade-up-item relative z-10" style={{ animationDelay: '700ms' }}>
                <button
                    onClick={() => { playNeonClick(); navigate('/subscripcion'); }}
                    className="glass-action-btn w-full py-4 text-[10px] font-[1100] uppercase tracking-[0.25em] active:scale-95 border flex items-center justify-center gap-3 transition-all"
                    style={{ 
                        backgroundColor: hexToRgba(themeColor, 0.3),
                        borderColor: hexToRgba(themeColor, 0.6),
                        boxShadow: `0 0 30px ${hexToRgba(themeColor, 0.3)}`
                    }}
                >
                    <Store size={18} style={{ color: hexToRgba(themeColor, 0.8) }} strokeWidth={3} />
                    <span className="text-white text-shadow-premium">Suscribir Comercio</span>
                </button>

                <button
                    onClick={handleShare}
                    className="glass-action-btn w-full py-4 text-[10px] font-[1100] uppercase tracking-[0.25em] active:scale-95 border flex items-center justify-center gap-3"
                    style={{ 
                        backgroundColor: hexToRgba(themeColor, 0.3),
                        borderColor: hexToRgba(themeColor, 0.6),
                        boxShadow: `0 0 30px ${hexToRgba(themeColor, 0.3)}`
                    }}
                >
                    <Share2 size={16} style={{ color: hexToRgba(themeColor, 0.8) }} strokeWidth={3} />
                    <span className="text-white text-shadow-premium">Compartir App</span>
                </button>
            </div>

            <footer className="w-full flex flex-col items-center gap-2 pt-6 pb-6 mt-auto border-t border-white/10 relative z-10">
                <p className="text-[9px] font-black text-white uppercase tracking-[0.35em] text-center select-none">
                    © 2026 · ShopDigital
                </p>
                <div className="flex items-center gap-4 mt-1">
                    <p 
                        onClick={handleWalyClick}
                        className="text-[8px] font-bold uppercase tracking-[0.25em] text-center select-none cursor-pointer active:scale-95 transition-transform" 
                        style={{ color: themeColor, textShadow: `0 0 10px ${hexToRgba(themeColor, 0.8)}, 0 0 20px ${hexToRgba(themeColor, 0.4)}` }}
                    >
                        {townName}
                    </p>
                    <span className="text-white/20 text-[8px]">|</span>
                    <button 
                        onClick={() => { playNeonClick(); navigate('/terminos'); }}
                        className="text-[8px] font-bold uppercase tracking-[0.25em] text-center text-white hover:text-cyan-300 transition-colors"
                    >
                        Términos y Condiciones
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default Home;
