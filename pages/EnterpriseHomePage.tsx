import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ENTERPRISE_CATEGORIES } from '../enterpriseConstants';
import { Factory, ChevronLeft, Share2, MapPin, ShieldCheck, Zap } from 'lucide-react';
import { playNeonClick } from '../utils/audio';

interface EnterpriseHomePageProps {
    globalConfig?: any;
}

const PROVINCES = [
    { id: 'buenos-aires', name: 'BUENOS AIRES',  emoji: '🏙️' },
    { id: 'cordoba',      name: 'CÓRDOBA',       emoji: '🏔️' },
    { id: 'santa-fe',     name: 'SANTA FE',      emoji: '🌾' },
    { id: 'mendoza',      name: 'MENDOZA',       emoji: '🍇' },
    { id: 'tucuman',      name: 'TUCUMÁN',       emoji: '🌿' },
    { id: 'entre-rios',   name: 'ENTRE RÍOS',   emoji: '🌊' },
    { id: 'misiones',     name: 'MISIONES',      emoji: '🌴' },
    { id: 'neuquen',      name: 'NEUQUÉN',       emoji: '⛽' },
];

const EnterpriseHomePage: React.FC<EnterpriseHomePageProps> = ({ globalConfig }) => {
    const navigate = useNavigate();

    // Nueva Paleta Tecnológica (Tech Neon)
    const primaryColor = '#06b6d4'; // Cyan brillante
    const secondaryColor = '#3b82f6'; // Azul Royal
    const bgColor = '#020617'; // Slate 950 (Azul marino casi negro)
    const mainTitle  = globalConfig?.mainTitle  || 'Directorio Industrial';
    const mainSubtitle = globalConfig?.mainSubtitle || 'Proveedores & Mayoristas';

    const hexToRgba = (hex: string, alpha: number) => {
        try {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        } catch { return `rgba(6,182,212,${alpha})`; }
    };

    const [selectedProvince, setSelectedProvince] = React.useState('buenos-aires');

    // 🔐 5-Click Búnker
    const [bunkerClicks, setBunkerClicks] = React.useState(0);
    React.useEffect(() => {
        if (bunkerClicks === 0) return;
        const t = setTimeout(() => setBunkerClicks(0), 1500);
        return () => clearTimeout(t);
    }, [bunkerClicks]);
    const handleBunkerClick = () => {
        playNeonClick();
        const next = bunkerClicks + 1;
        if (next >= 5) { navigate(`/empresas/tablero-maestro?provincia=${selectedProvince}`); setBunkerClicks(0); }
        else setBunkerClicks(next);
    };

    const handleShare = () => {
        playNeonClick();
        const url = `${window.location.origin}/empresas`;
        const text = `¡Descubrí el ${mainTitle}! 🏭\n\n👉 ${url}`;
        if (navigator.share) navigator.share({ title: 'ShopDigital Empresas', text, url }).catch(console.error);
        else window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    };

    return (
        <div className="flex flex-col pt-6 pb-16 animate-in fade-in duration-1000 relative overflow-hidden min-h-screen" style={{ backgroundColor: bgColor }}>
            {/* ── CSS Animations Inline ── */}
            <style>{`
                @keyframes levitate {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-8px); }
                }
                @keyframes pulseGlow {
                    0%, 100% { filter: drop-shadow(0 0 15px ${hexToRgba(primaryColor, 0.4)}); }
                    50% { filter: drop-shadow(0 0 35px ${hexToRgba(primaryColor, 0.8)}); }
                }
                @keyframes scanline {
                    0% { transform: translateY(-100%); }
                    100% { transform: translateY(200%); }
                }
                .tech-grid-bg {
                    background-size: 30px 30px;
                    background-image: 
                        linear-gradient(to right, ${hexToRgba(secondaryColor, 0.04)} 1px, transparent 1px),
                        linear-gradient(to bottom, ${hexToRgba(secondaryColor, 0.04)} 1px, transparent 1px);
                }
                .glass-card-neon {
                    background: linear-gradient(145deg, rgba(255,255,255,0.03), rgba(0,0,0,0.4));
                    backdrop-filter: blur(12px);
                    border: 1px solid ${hexToRgba(primaryColor, 0.2)};
                    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
                }
            `}</style>

            {/* ── HUD Background Tech ── */}
            <div className="fixed inset-0 pointer-events-none z-0 tech-grid-bg">
                {/* Orbes de luz elegantes */}
                <div className="absolute -top-20 -left-20 w-[600px] h-[600px] rounded-full blur-[150px] opacity-40 mix-blend-screen" style={{ backgroundColor: secondaryColor }} />
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] opacity-30 mix-blend-screen" style={{ backgroundColor: primaryColor }} />
                
                {/* Scanline Effect */}
                <div className="absolute inset-0 w-full h-[20vh] opacity-10 pointer-events-none" 
                     style={{ background: `linear-gradient(to bottom, transparent, ${primaryColor}, transparent)`, animation: 'scanline 8s linear infinite' }} />
            </div>

            {/* ── Header ── */}
            <header className="flex flex-col items-center relative z-10 px-6 mb-8 mt-2">
                <button
                    onClick={() => { playNeonClick(); navigate(-1); }}
                    className="self-start mb-6 w-11 h-11 rounded-2xl glass-card-neon flex items-center justify-center transition-all hover:scale-105 active:scale-95 group relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <ChevronLeft size={24} style={{ color: primaryColor }} />
                </button>

                {/* Animated Logo Container */}
                <div 
                    onClick={handleBunkerClick} 
                    className="relative rounded-3xl p-6 mb-6 glass-card-neon cursor-pointer overflow-hidden border-t border-l"
                    style={{ 
                        animation: 'levitate 4s ease-in-out infinite',
                        borderTopColor: hexToRgba(primaryColor, 0.4),
                        borderLeftColor: hexToRgba(primaryColor, 0.2)
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                    <Factory 
                        size={56} 
                        strokeWidth={1.5}
                        style={{ color: primaryColor, animation: 'pulseGlow 3s infinite alternate' }} 
                    />
                </div>

                <h1 className="text-xl font-bold text-white uppercase tracking-[0.25em] text-center mb-2" style={{ textShadow: `0 0 20px ${hexToRgba(primaryColor, 0.5)}` }}>
                    {mainTitle}
                </h1>
                <div className="flex items-center gap-3">
                    <div className="h-[2px] w-12 rounded-full" style={{ backgroundImage: `linear-gradient(to right, transparent, ${primaryColor})` }} />
                    <p className="text-[10px] font-medium text-cyan-100 uppercase tracking-[0.3em] opacity-80">
                        Argentina · {mainSubtitle}
                    </p>
                    <div className="h-[2px] w-12 rounded-full" style={{ backgroundImage: `linear-gradient(to left, transparent, ${primaryColor})` }} />
                </div>
            </header>

            {/* ── Selector de Provincias ── */}
            <section className="px-4 mb-10 relative z-10">
                <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-center mb-4 flex items-center justify-center gap-2 text-cyan-200/60">
                    <MapPin size={12} className="text-cyan-400" /> Coordenadas Regionales
                </p>
                <div className="flex flex-wrap gap-2.5 justify-center">
                    {PROVINCES.map((prov) => {
                        const isActive = selectedProvince === prov.id;
                        return (
                            <button
                                key={prov.id}
                                onClick={() => { playNeonClick(); setSelectedProvince(prov.id); }}
                                className="px-4 py-2.5 rounded-xl border transition-all duration-300 text-[10px] font-bold uppercase tracking-wider relative overflow-hidden"
                                style={isActive ? {
                                    backgroundColor: hexToRgba(secondaryColor, 0.3),
                                    borderColor: primaryColor,
                                    color: '#ffffff',
                                    boxShadow: `0 0 20px ${hexToRgba(primaryColor, 0.4)}, inset 0 0 15px ${hexToRgba(secondaryColor, 0.5)}`,
                                    textShadow: `0 0 10px ${primaryColor}`
                                } : {
                                    backgroundColor: 'rgba(255,255,255,0.02)',
                                    borderColor: 'rgba(255,255,255,0.1)',
                                    color: 'rgba(255,255,255,0.5)',
                                }}
                            >
                                {isActive && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] animate-[shimmer_2s_infinite]" />}
                                <span className="opacity-80 mr-1.5">{prov.emoji}</span> {prov.name}
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* ── Grid de Rubros Industriales ── */}
            <section className="px-5 relative z-10">
                <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-center mb-6 text-cyan-200/60">
                    Sectores Productivos Activos
                </p>
                <div className="grid grid-cols-3 gap-3">
                    {ENTERPRISE_CATEGORIES.map((cat, index) => (
                        <button
                            key={cat.id}
                            onClick={() => {
                                playNeonClick();
                                const query = selectedProvince !== 'all' ? `?provincia=${selectedProvince}` : '';
                                navigate(`/empresas/${cat.slug}${query}`);
                            }}
                            className="glass-card-neon aspect-square group flex flex-col items-center justify-center rounded-2xl transition-all duration-500 hover:-translate-y-1 relative overflow-hidden"
                            style={{
                                animation: `fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${index * 40}ms both`,
                            }}
                        >
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" 
                                 style={{ background: `radial-gradient(circle at center, ${hexToRgba(primaryColor, 0.2)} 0%, transparent 70%)` }} />
                                 
                            <div className="mb-2.5 transform group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300 drop-shadow-md" style={{ color: primaryColor }}>
                                {cat.icon}
                            </div>
                            <span className="text-[8px] sm:text-[9px] text-center font-bold uppercase leading-tight tracking-wider px-1 text-slate-300 group-hover:text-white transition-colors z-10">
                                {cat.name}
                            </span>
                        </button>
                    ))}
                </div>
            </section>

            {/* ── CTA Inscripción + Compartir ── */}
            <div className="mt-14 px-6 flex flex-col gap-4 items-center w-full relative z-10">
                <button
                    onClick={() => { playNeonClick(); navigate('/empresas/inscripcion'); }}
                    className="w-full py-5 rounded-2xl font-bold uppercase tracking-[0.15em] text-[11px] transition-all flex items-center justify-center gap-3 relative overflow-hidden group border"
                    style={{
                        background: `linear-gradient(135deg, ${hexToRgba(secondaryColor, 0.8)}, ${hexToRgba(primaryColor, 0.6)})`,
                        color: '#ffffff',
                        borderColor: primaryColor,
                        boxShadow: `0 10px 30px -10px ${primaryColor}, inset 0 2px 10px rgba(255,255,255,0.2)`,
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out pointer-events-none" />
                    <ShieldCheck size={18} className="animate-pulse" />
                    <span>Autenticar Fábrica / Empresa</span>
                    <Zap size={14} className="opacity-50" />
                </button>

                <button
                    onClick={handleShare}
                    className="w-full py-4 text-[10px] font-semibold uppercase tracking-[0.2em] transition-all border flex items-center justify-center gap-3 rounded-2xl glass-card-neon hover:bg-white/5"
                    style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                >
                    <Share2 size={16} style={{ color: secondaryColor }} />
                    <span className="text-slate-300">Transmitir Coordenadas</span>
                </button>
            </div>

            {/* ── Footer ── */}
            <footer className="w-full flex flex-col items-center gap-2 pt-12 pb-6 mt-auto relative z-10">
                <div className="flex items-center gap-2 opacity-50">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    <p onClick={handleBunkerClick} className="text-[9px] font-bold text-cyan-200 uppercase tracking-widest cursor-pointer select-none">
                        SHOPDIGITAL NETWORKS © 2026
                    </p>
                </div>
                <p className="text-[8px] font-medium uppercase tracking-[0.25em]" style={{ color: hexToRgba(secondaryColor, 0.7) }}>
                    NODO INDUSTRIAL SECURE LINK
                </p>
            </footer>
        </div>
    );
};

export default EnterpriseHomePage;
