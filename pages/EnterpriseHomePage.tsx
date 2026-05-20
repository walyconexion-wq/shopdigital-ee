import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ENTERPRISE_CATEGORIES } from '../enterpriseConstants';
import { Factory, ChevronLeft, Share2, MapPin } from 'lucide-react';
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

    const primaryColor = '#f59e0b';
    const bgColor = globalConfig?.bgColor || '#000000';
    const mainTitle  = globalConfig?.mainTitle  || 'Directorio Industrial';
    const mainSubtitle = globalConfig?.mainSubtitle || 'Proveedores & Mayoristas';

    const hexToRgba = (hex: string, alpha: number) => {
        try {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        } catch { return `rgba(245,158,11,${alpha})`; }
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
        if (next >= 5) { navigate('/empresas/control-maestro'); setBunkerClicks(0); }
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
        <div className="flex flex-col pt-6 pb-16 animate-in fade-in duration-700 relative overflow-hidden min-h-screen" style={{ backgroundColor: bgColor }}>

            {/* ── HUD Background ── */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full blur-[120px]" style={{ backgroundColor: hexToRgba(primaryColor, 0.05) }} />
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full blur-[100px]" style={{ backgroundColor: hexToRgba(primaryColor, 0.05) }} />
                <div className="absolute inset-0" style={{ backgroundImage: `linear-gradient(${hexToRgba(primaryColor, 0.025)} 1px, transparent 1px), linear-gradient(90deg, ${hexToRgba(primaryColor, 0.025)} 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
            </div>

            {/* ── Header ── */}
            <header className="flex flex-col items-center relative z-10 px-6 mb-5">
                <button
                    onClick={() => { playNeonClick(); navigate(-1); }}
                    className="self-start mb-4 w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center transition-all shadow-lg active:scale-95"
                    style={{ color: primaryColor, border: `1px solid ${hexToRgba(primaryColor, 0.3)}` }}
                >
                    <ChevronLeft size={20} />
                </button>

                <div onClick={handleBunkerClick} className="glass-header rounded-3xl p-5 mb-4 border backdrop-blur-md shadow-2xl cursor-pointer" style={{ borderColor: hexToRgba(primaryColor, 0.3), background: `linear-gradient(135deg, ${hexToRgba(primaryColor, 0.15)}, transparent)` }}>
                    <Factory size={48} style={{ color: primaryColor, filter: `drop-shadow(0 0 15px ${hexToRgba(primaryColor, 0.6)})` }} />
                </div>

                <h1 className="text-[18px] font-[1000] text-white uppercase tracking-[0.2em] text-center" style={{ textShadow: `0 0 15px ${hexToRgba(primaryColor, 0.4)}` }}>
                    {mainTitle}
                </h1>
                <div className="flex items-center gap-2 mt-1 mb-1">
                    <div className="h-[1px] w-8" style={{ backgroundImage: `linear-gradient(to right, transparent, ${hexToRgba(primaryColor, 0.5)})` }} />
                    <p className="text-[9px] font-black uppercase tracking-[0.3em]" style={{ color: hexToRgba(primaryColor, 0.7) }}>
                        Argentina · {mainSubtitle}
                    </p>
                    <div className="h-[1px] w-8" style={{ backgroundImage: `linear-gradient(to left, transparent, ${hexToRgba(primaryColor, 0.5)})` }} />
                </div>
            </header>

            {/* ── Selector de Provincias — Cápsulas estilo Traslasierra ── */}
            <section className="px-4 mb-6 relative z-10">
                <p className="text-[8px] font-black uppercase tracking-[0.3em] text-center mb-3 flex items-center justify-center gap-1.5" style={{ color: hexToRgba(primaryColor, 0.6) }}>
                    <MapPin size={10} /> Seleccioná una Provincia
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                    {PROVINCES.map((prov) => {
                        const isActive = selectedProvince === prov.id;
                        return (
                            <button
                                key={prov.id}
                                onClick={() => { playNeonClick(); setSelectedProvince(prov.id); }}
                                className="px-4 py-2.5 rounded-full border transition-all duration-300 text-[9px] font-black uppercase tracking-widest active:scale-95"
                                style={isActive ? {
                                    backgroundColor: hexToRgba(primaryColor, 0.25),
                                    borderColor: primaryColor,
                                    color: primaryColor,
                                    boxShadow: `0 0 18px ${hexToRgba(primaryColor, 0.5)}, inset 0 0 10px ${hexToRgba(primaryColor, 0.2)}`,
                                    textShadow: `0 0 8px ${hexToRgba(primaryColor, 0.8)}`,
                                } : {
                                    backgroundColor: hexToRgba(primaryColor, 0.06),
                                    borderColor: hexToRgba(primaryColor, 0.2),
                                    color: 'rgba(255,255,255,0.6)',
                                }}
                            >
                                {prov.emoji} {prov.name}
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* ── Grid de Rubros Industriales ── */}
            <section className="px-5 relative z-10">
                <p className="text-[8px] font-black uppercase tracking-[0.3em] text-center mb-4" style={{ color: hexToRgba(primaryColor, 0.5) }}>
                    Elegí el Rubro Industrial
                </p>
                <div className="grid grid-cols-3 gap-x-4 gap-y-7">
                    {ENTERPRISE_CATEGORIES.map((cat, index) => (
                        <button
                            key={cat.id}
                            onClick={() => {
                                playNeonClick();
                                // Pasamos la provincia como query param
                                const query = selectedProvince !== 'all' ? `?provincia=${selectedProvince}` : '';
                                navigate(`/empresas/${cat.slug}${query}`);
                            }}
                            className="glass-button-3d category-btn btn-neon-active aspect-square group backdrop-blur-md border rounded-[1.25rem] transition-all duration-300"
                            style={{
                                animation: `fadeUp 0.7s cubic-bezier(0.25, 1, 0.5, 1) ${index * 35}ms both`,
                                boxShadow: `0 0 15px ${hexToRgba(primaryColor, 0.06)}`,
                                backgroundColor: hexToRgba(primaryColor, 0.1),
                                borderColor: hexToRgba(primaryColor, 0.15),
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
            </section>

            {/* ── CTA Inscripción + Compartir ── */}
            <div className="mt-12 px-8 flex flex-col gap-4 items-center w-full relative z-10">
                <button
                    onClick={() => { playNeonClick(); navigate('/empresas/inscripcion'); }}
                    className="w-full py-5 rounded-2xl font-black uppercase tracking-[0.15em] text-[11px] active:scale-95 transition-all flex items-center justify-center gap-3 relative overflow-hidden group border"
                    style={{
                        background: `linear-gradient(to right, ${primaryColor}, #f97316)`,
                        color: '#000',
                        boxShadow: `0 0 30px ${hexToRgba(primaryColor, 0.3)}`,
                        borderColor: hexToRgba(primaryColor, 0.5),
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />
                    <Factory size={18} />
                    <span>🏭 Asociar Mi Empresa / Fábrica</span>
                </button>

                <button
                    onClick={handleShare}
                    className="w-full py-4 text-[10px] font-[1100] uppercase tracking-[0.25em] active:scale-95 border flex items-center justify-center gap-3 rounded-2xl backdrop-blur-md"
                    style={{ backgroundColor: hexToRgba(primaryColor, 0.15), borderColor: hexToRgba(primaryColor, 0.3), boxShadow: `0 0 20px ${hexToRgba(primaryColor, 0.15)}` }}
                >
                    <Share2 size={16} style={{ color: primaryColor }} strokeWidth={3} />
                    <span className="text-white">Compartir Directorio</span>
                </button>
            </div>

            {/* ── Footer ── */}
            <footer className="w-full flex flex-col items-center gap-1 pt-10 pb-4 mt-auto relative z-10">
                <p onClick={handleBunkerClick} className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em] cursor-pointer select-none">
                    © 2026 · ShopDigital
                </p>
                <p className="text-[7px] uppercase tracking-widest" style={{ color: hexToRgba(primaryColor, 0.3) }}>
                    🏭 Modo Empresarial B2B
                </p>
            </footer>
        </div>
    );
};

export default EnterpriseHomePage;
