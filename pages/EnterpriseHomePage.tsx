import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ENTERPRISE_CATEGORIES } from '../enterpriseConstants';
import { Factory, ChevronLeft, Share2 } from 'lucide-react';
import { playNeonClick } from '../utils/audio';

interface EnterpriseHomePageProps {
    globalConfig?: any;
}

const EnterpriseHomePage: React.FC<EnterpriseHomePageProps> = ({ globalConfig }) => {
    const { townId = 'esteban-echeverria' } = useParams<{ townId: string }>();
    const navigate = useNavigate();
    
    // Extracción de Configuración Dinámica Industrial
    const primaryColor = globalConfig?.primaryColor || '#f59e0b';
    const bgColor = globalConfig?.bgColor || '#000000';
    const mainTitle = globalConfig?.mainTitle || "Directorio Industrial";
    const mainSubtitle = globalConfig?.mainSubtitle || "Proveedores & Mayoristas";
    const townName = globalConfig?.townName || townId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    const hexToRgba = (hex: string, alpha: number) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    // 🔐 Activador secreto de 5-Click para el Búnker Industrial
    const [bunkerClicks, setBunkerClicks] = React.useState(0);
    React.useEffect(() => {
        if (bunkerClicks === 0) return;
        const timer = setTimeout(() => setBunkerClicks(0), 1500);
        return () => clearTimeout(timer);
    }, [bunkerClicks]);
    const handleBunkerClick = () => {
        playNeonClick();
        const next = bunkerClicks + 1;
        if (next >= 5) { navigate(`/${townId}/empresas/control-maestro`); setBunkerClicks(0); }
        else setBunkerClicks(next);
    };

    const handleShare = () => {
        playNeonClick();
        const url = `${window.location.origin}/${townId}/empresas`;
        const text = `¡Descubrí el ${mainTitle} de ${townName}! 🏭\n\n👉 ${url}`;
        if (navigator.share) {
            navigator.share({ title: 'ShopDigital Empresas', text, url }).catch(console.error);
        } else {
            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
        }
    };

    return (
        <div className="flex flex-col pt-6 pb-12 animate-in fade-in duration-700 relative overflow-hidden min-h-screen" style={{ backgroundColor: bgColor }}>
            {/* HUD Background — Estética Industrial Dinámica */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full blur-[120px]" style={{ backgroundColor: hexToRgba(primaryColor, 0.05) }} />
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full blur-[100px]" style={{ backgroundColor: hexToRgba(primaryColor, 0.05) }} />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(245,158,11,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(245,158,11,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" style={{ backgroundImage: `linear-gradient(${hexToRgba(primaryColor, 0.02)} 1px, transparent 1px), linear-gradient(90deg, ${hexToRgba(primaryColor, 0.02)} 1px, transparent 1px)` }} />
            </div>

            {/* Header Industrial */}
            <header className="flex flex-col items-center relative z-10 px-6 mb-8">
                <button
                    onClick={() => { playNeonClick(); navigate(`/${townId}/home`); }}
                    className="self-start mb-4 w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center transition-all shadow-lg active:scale-95"
                    style={{ color: primaryColor, border: `1px solid ${hexToRgba(primaryColor, 0.3)}` }}
                >
                    <ChevronLeft size={20} />
                </button>

                <div className="glass-header rounded-3xl p-5 mb-4 border backdrop-blur-md shadow-2xl" style={{ borderColor: hexToRgba(primaryColor, 0.3), background: `linear-gradient(135deg, ${hexToRgba(primaryColor, 0.15)}, transparent)` }}>
                    <Factory size={48} style={{ color: primaryColor, filter: `drop-shadow(0 0 15px ${hexToRgba(primaryColor, 0.6)})` }} />
                </div>

                <h1 className="text-[18px] font-[1000] text-white uppercase tracking-[0.2em] text-center" style={{ textShadow: `0 0 15px ${hexToRgba(primaryColor, 0.4)}` }}>
                    {mainTitle}
                </h1>
                <div className="flex items-center gap-2 mt-2">
                    <div className="h-[1px] w-8 bg-gradient-to-r from-transparent" style={{ backgroundImage: `linear-gradient(to right, transparent, ${hexToRgba(primaryColor, 0.5)})` }} />
                    <p className="text-[9px] font-black uppercase tracking-[0.3em]" style={{ color: hexToRgba(primaryColor, 0.7) }}>
                        {townName} · {mainSubtitle}
                    </p>
                    <div className="h-[1px] w-8 bg-gradient-to-l from-transparent" style={{ backgroundImage: `linear-gradient(to left, transparent, ${hexToRgba(primaryColor, 0.5)})` }} />
                </div>
            </header>

            {/* Grid de 21 Rubros Industriales */}
            <div className="grid grid-cols-3 gap-x-4 gap-y-7 px-5 relative z-10">
                {ENTERPRISE_CATEGORIES.map((cat, index) => (
                    <button
                        key={cat.id}
                        onClick={() => { playNeonClick(); navigate(`/${townId}/empresas/${cat.slug}`); }}
                        className="glass-button-3d category-btn btn-neon-active aspect-square group backdrop-blur-md border rounded-[1.25rem] transition-all duration-300"
                        style={{
                            animation: `fadeUp 0.7s cubic-bezier(0.25, 1, 0.5, 1) ${index * 35}ms both`,
                            boxShadow: `0 0 15px ${hexToRgba(primaryColor, 0.06)}`,
                            backgroundColor: hexToRgba(primaryColor, 0.1),
                            borderColor: hexToRgba(primaryColor, 0.15)
                        }}
                    >
                        <div className="mb-1.5 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-500 ease-out" style={{ color: primaryColor }}>
                            {cat.icon}
                        </div>
                        <span className="text-[8px] text-center font-black uppercase leading-[1.1] tracking-[0.01em] px-0.5 text-white/90 group-hover:text-white transition-colors">
                            {cat.name}
                        </span>
                    </button>
                ))}
            </div>

            {/* CTA Inscripción + Compartir */}
            <div className="mt-12 mb-4 px-14 flex flex-col gap-4 justify-center items-center w-full relative z-10">
                {/* 🏭 Botón de Inscripción B2B */}
                <button
                    onClick={() => { playNeonClick(); navigate(`/${townId}/empresas/inscripcion`); }}
                    className="w-full py-5 rounded-2xl font-black uppercase tracking-[0.15em] text-[11px] active:scale-95 transition-all flex items-center justify-center gap-3 relative overflow-hidden group border"
                    style={{ 
                        background: `linear-gradient(to right, ${primaryColor}, #f97316)`, 
                        color: bgColor === '#000000' ? '#000' : '#fff',
                        boxShadow: `0 0 30px ${hexToRgba(primaryColor, 0.3)}`,
                        borderColor: hexToRgba(primaryColor, 0.5)
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />
                    <Factory size={18} />
                    <span>🏭 Asociar Mi Empresa / Fábrica</span>
                </button>

                {/* Compartir */}
                <button
                    onClick={handleShare}
                    className="glass-action-btn w-full py-4 text-[10px] font-[1100] uppercase tracking-[0.25em] active:scale-95 border flex items-center justify-center gap-3"
                    style={{ backgroundColor: hexToRgba(primaryColor, 0.2), borderColor: hexToRgba(primaryColor, 0.4), boxShadow: `0 0 20px ${hexToRgba(primaryColor, 0.2)}` }}
                >
                    <Share2 size={16} style={{ color: primaryColor }} strokeWidth={3} />
                    <span className="text-white text-shadow-premium">Compartir Directorio</span>
                </button>
            </div>

            {/* Footer Industrial */}
            <footer className="w-full flex flex-col items-center gap-2 pt-6 pb-6 mt-auto border-t relative z-10" style={{ borderColor: hexToRgba(primaryColor, 0.1) }}>
                <p className="text-[9px] font-black text-white uppercase tracking-[0.35em] text-center select-none">
                    © 2026 · ShopDigital
                </p>
                <p 
                    onClick={handleBunkerClick}
                    className="text-[8px] font-bold uppercase tracking-[0.25em] text-center select-none cursor-pointer active:scale-95 transition-transform" 
                    style={{ color: primaryColor, textShadow: `0 0 10px ${hexToRgba(primaryColor, 0.5)}` }}
                >
                    🏭 Nodo Empresarial B2B
                </p>
            </footer>
        </div>
    );
};

export default EnterpriseHomePage;
