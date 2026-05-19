import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ENTERPRISE_CATEGORIES } from '../enterpriseConstants';
import { Factory, ChevronLeft, Share2 } from 'lucide-react';
import { playNeonClick } from '../utils/audio';

interface EnterpriseHomePageProps {
    globalConfig?: any;
}

const EnterpriseHomePage: React.FC<EnterpriseHomePageProps> = ({ globalConfig }) => {
    const navigate = useNavigate();
    
    // Extracción de Configuración Dinámica Industrial
    const primaryColor = globalConfig?.primaryColor || '#f59e0b';
    const bgColor = globalConfig?.bgColor || '#000000';
    const mainTitle = globalConfig?.mainTitle || "Directorio Industrial";
    const mainSubtitle = globalConfig?.mainSubtitle || "Proveedores & Mayoristas";
    const townName = globalConfig?.townName || 'Nacional';

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
        if (next >= 5) { navigate(`/empresas/control-maestro`); setBunkerClicks(0); }
        else setBunkerClicks(next);
    };

    const handleShare = () => {
        playNeonClick();
        const url = `${window.location.origin}/empresas`;
        const text = `¡Descubrí el ${mainTitle} de ${townName}! 🏭\n\n👉 ${url}`;
        if (navigator.share) {
            navigator.share({ title: 'ShopDigital Empresas', text, url }).catch(console.error);
        } else {
            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
        }
    };

    // 🗺️ Filtro Provincial/Regional
    const [selectedProvince, setSelectedProvince] = React.useState('all');
    const [selectedRegion, setSelectedRegion] = React.useState('all');

    const PROVINCES = [
        { id: 'all', name: '🌎 Todas las Provincias' },
        { id: 'buenos-aires', name: '🏙️ Buenos Aires' },
        { id: 'cordoba', name: '🏔️ Córdoba' },
        { id: 'santa-fe', name: '🌾 Santa Fe' },
        { id: 'mendoza', name: '🍇 Mendoza' },
        { id: 'tucuman', name: '🌿 Tucumán' },
        { id: 'entre-rios', name: '🌊 Entre Ríos' },
        { id: 'misiones', name: '🌴 Misiones' },
        { id: 'neuquen', name: '⛽ Neuquén' },
    ];

    const REGIONS: Record<string, { id: string; name: string }[]> = {
        'buenos-aires': [
            { id: 'all', name: '📍 Todas las Zonas' },
            { id: 'zona-sur', name: '🔵 Zona Sur (E. Echeverría, Ezeiza, Lomas)' },
            { id: 'zona-norte', name: '🟢 Zona Norte (Tigre, San Isidro)' },
            { id: 'zona-oeste', name: '🟠 Zona Oeste (Morón, Merlo)' },
            { id: 'la-plata', name: '🏛️ La Plata y alrededores' },
        ],
        'cordoba': [
            { id: 'all', name: '📍 Todas las Zonas' },
            { id: 'traslasierra', name: '🏔️ Traslasierra' },
            { id: 'capital', name: '🏙️ Córdoba Capital' },
            { id: 'punilla', name: '⛰️ Punilla' },
        ],
    };

    const currentRegions = REGIONS[selectedProvince] || [];

    return (
        <div className="flex flex-col pt-6 pb-12 animate-in fade-in duration-700 relative overflow-hidden min-h-screen" style={{ backgroundColor: bgColor }}>
            {/* HUD Background — Estética Industrial Dinámica */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full blur-[120px]" style={{ backgroundColor: hexToRgba(primaryColor, 0.05) }} />
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full blur-[100px]" style={{ backgroundColor: hexToRgba(primaryColor, 0.05) }} />
                <div className="absolute inset-0" style={{ backgroundImage: `linear-gradient(${hexToRgba(primaryColor, 0.02)} 1px, transparent 1px), linear-gradient(90deg, ${hexToRgba(primaryColor, 0.02)} 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
            </div>

            {/* Header Industrial */}
            <header className="flex flex-col items-center relative z-10 px-6 mb-4">
                <button
                    onClick={() => { playNeonClick(); navigate(-1); }}
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

            {/* 🗺️ Selector Provincial / Regional */}
            <div className="px-5 mb-6 relative z-10 space-y-3">
                <h3 className="text-[8px] font-black uppercase tracking-[0.3em] text-center" style={{ color: hexToRgba(primaryColor, 0.6) }}>
                    📍 Filtrar por Zona Geográfica
                </h3>
                <select
                    value={selectedProvince}
                    onChange={(e) => { playNeonClick(); setSelectedProvince(e.target.value); setSelectedRegion('all'); }}
                    className="w-full bg-zinc-900/60 border rounded-2xl p-3 text-white text-[11px] font-bold focus:outline-none transition-all appearance-none text-center uppercase tracking-widest"
                    style={{ borderColor: hexToRgba(primaryColor, 0.3) }}
                >
                    {PROVINCES.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                {currentRegions.length > 0 && (
                    <select
                        value={selectedRegion}
                        onChange={(e) => { playNeonClick(); setSelectedRegion(e.target.value); }}
                        className="w-full bg-zinc-900/60 border rounded-2xl p-3 text-white text-[11px] font-bold focus:outline-none transition-all appearance-none text-center uppercase tracking-widest"
                        style={{ borderColor: hexToRgba(primaryColor, 0.2) }}
                    >
                        {currentRegions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                )}
            </div>

            {/* Grid de 21 Rubros Industriales */}
            <div className="grid grid-cols-3 gap-x-4 gap-y-7 px-5 relative z-10">
                {ENTERPRISE_CATEGORIES.map((cat, index) => (
                    <button
                        key={cat.id}
                        onClick={() => { playNeonClick(); navigate(`/empresas/${cat.slug}`); }}
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
                    onClick={() => { playNeonClick(); navigate(`/empresas/inscripcion`); }}
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
