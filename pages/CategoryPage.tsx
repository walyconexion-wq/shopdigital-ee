import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CATEGORIES } from '../constants';
import { Shop } from '../types';
import { TRASLASIERRA_REGION } from '../data/regionalTemplates/traslasierraConfig';
import { PATAGONIA_7_LAGOS_REGION } from '../data/regionalTemplates/patagonia7LagosConfig';
import { ChevronLeft, MapPin, Star, BookOpen, ArrowLeft, Eye } from 'lucide-react';
import { playNeonClick } from '../utils/audio';
import { incrementarVisitas } from '../firebase';
import { useTownLocalities } from '../hooks/useTownLocalities';

interface CategoryPageProps {
    allShops: Shop[];
    globalConfig?: any;
}

// Paleta de colores cíclica para las localidades dinámicas
const LOCALITY_COLORS = [
    { border: 'border-violet-400/80', bg: 'bg-violet-600/50', shadow: 'shadow-[0_0_20px_rgba(139,92,246,0.8)]', pin: 'text-violet-400', line: 'bg-violet-400/30', dot: 'bg-violet-500/20 border-violet-400/50', card: 'card-neon-violet', btn: 'border-violet-400/50 bg-violet-600/30 shadow-[0_4px_0_rgba(139,92,246,0.5)]' },
    { border: 'border-cyan-400/80',   bg: 'bg-cyan-600/50',   shadow: 'shadow-[0_0_20px_rgba(34,211,238,0.8)]',  pin: 'text-cyan-400',   line: 'bg-cyan-400/30',   dot: 'bg-cyan-500/20 border-cyan-400/50',   card: 'card-neon-cyan',   btn: 'border-cyan-400/50 bg-cyan-600/30 shadow-[0_4px_0_rgba(34,211,238,0.5)]' },
    { border: 'border-rose-400/80',   bg: 'bg-rose-600/50',   shadow: 'shadow-[0_0_20px_rgba(244,63,94,0.8)]',   pin: 'text-rose-400',   line: 'bg-rose-400/30',   dot: 'bg-rose-500/20 border-rose-400/50',   card: 'card-neon-red',    btn: 'border-rose-400/50 bg-rose-600/30 shadow-[0_4px_0_rgba(244,63,94,0.5)]' },
    { border: 'border-green-400/80',  bg: 'bg-green-600/50',  shadow: 'shadow-[0_0_20px_rgba(34,197,94,0.8)]',   pin: 'text-green-400',  line: 'bg-green-400/30',  dot: 'bg-green-500/20 border-green-400/50',  card: 'card-neon-green',  btn: 'border-green-400/50 bg-green-600/30 shadow-[0_4px_0_rgba(34,197,94,0.5)]' },
    { border: 'border-amber-400/80',  bg: 'bg-amber-600/50',  shadow: 'shadow-[0_0_20px_rgba(245,158,11,0.8)]',  pin: 'text-amber-400',  line: 'bg-amber-400/30',  dot: 'bg-amber-500/20 border-amber-400/50',  card: 'card-neon-amber',  btn: 'border-amber-400/50 bg-amber-600/30 shadow-[0_4px_0_rgba(245,158,11,0.5)]' },
];

const CategoryPage: React.FC<CategoryPageProps> = ({ allShops, globalConfig }) => {
    const { townId = 'esteban-echeverria', categorySlug } = useParams<{ townId: string, categorySlug: string }>();
    const navigate = useNavigate();
    const { localities } = useTownLocalities(townId);
    
    // Determinar si estamos en Traslasierra o Patagonia
    const isInTraslasierra = townId === 'traslasierra' || TRASLASIERRA_REGION.towns.some(t => t.id === townId);
    const isInPatagonia = townId === 'patagonia-7-lagos' || PATAGONIA_7_LAGOS_REGION.towns.some(t => t.id === townId);
    
    // Obtener townName amigable
    const townName = isInTraslasierra 
        ? TRASLASIERRA_REGION.towns.find(t => t.id === townId)?.name || townId.replace(/-/g, ' ')
        : (globalConfig?.townName || 'Esteban Echeverría');

    const [activeLocation, setActiveLocation] = useState<string>('');
    const [activeSubcategory, setActiveSubcategory] = useState<string>('');
    const [titleClicks, setTitleClicks] = React.useState(0);

    const themeColor = globalConfig?.primaryColor || '#22d3ee';
    const themeMode = globalConfig?.themeMode || 'auto';
    const isDayMode = themeMode === 'light' 
        ? true 
        : themeMode === 'dark' 
            ? false 
            : new Date().getHours() >= 8 && new Date().getHours() < 20;

    const hexToRgba = (hex: string, alpha: number) => {
        try {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        } catch { return `rgba(34, 211, 238, ${alpha})`; }
    };

    // Sincronizar activeLocation con las localidades validadas por el hook
    useEffect(() => {
        if (localities.length > 0 && (!activeLocation || !localities.includes(activeLocation))) {
            setActiveLocation(localities[0]);
        }
    }, [localities]);

    React.useEffect(() => {
        if (titleClicks === 0) return;
        const timer = setTimeout(() => setTitleClicks(0), 1500);
        return () => clearTimeout(timer);
    }, [titleClicks]);

    const handleTitleClick = () => {
        playNeonClick();
        const nextClicks = titleClicks + 1;
        if (nextClicks >= 5) { setTitleClicks(0); navigate(`/${townId}/embajador`); }
        else setTitleClicks(nextClicks);
    };

    const handleWalyClick = () => {
        playNeonClick();
        navigate(`/${townId}/tablero-maestro`);
    };

    const selectedCategory = useMemo(() => {
        const availableCategories = globalConfig?.categories || CATEGORIES;
        return availableCategories.find((cat: any) => cat.slug === categorySlug);
    }, [categorySlug, globalConfig]);

    const groupedShops = useMemo(() => {
        if (!selectedCategory || localities.length === 0) return {};
        const grouped: Record<string, Shop[]> = {};
        const normalize = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
        
        localities.forEach(loc => {
            const normalizedLoc = normalize(loc);
            grouped[loc] = allShops.filter(shop => {
                if (!shop) return false;

                // 1. Estado Activo
                const isActive = shop.isActive !== false;

                // 2. Coincidencia de Categoría
                const categoryMatch =
                    shop.category === selectedCategory.id ||
                    shop.category === selectedCategory.slug ||
                    shop.category?.toLowerCase() === selectedCategory.name.toLowerCase();

                // 3. Localidad — busca por shop.zone o por dirección
                // Para zonas nuevas (Ezeiza) se filtra estrictamente.
                // Para la zona madre y Traslasierra se incluyen los sin zone.
                const isMotherZone = townId === 'esteban-echeverria' || isInTraslasierra;
                const isSingleLocalityFallback = localities.length <= 1 || loc === 'Centro' || isInPatagonia;
                const zoneMatch = (isMotherZone || isSingleLocalityFallback)
                    ? ((shop.zone === loc) || !shop.zone || normalize(shop.address || '').includes(normalizedLoc) || isSingleLocalityFallback)
                    : ((shop.zone === loc) || normalize(shop.address || '').includes(normalizedLoc));

                // 4. Coincidencia de Subcategoría
                const subMatch = !activeSubcategory || 
                    (shop.specialty && normalize(shop.specialty).includes(normalize(activeSubcategory))) ||
                    (shop.description && normalize(shop.description).includes(normalize(activeSubcategory))) ||
                    (shop.tags && shop.tags.some(tag => normalize(tag).includes(normalize(activeSubcategory))));

                return isActive && categoryMatch && zoneMatch && subMatch;
            });
        });
        return grouped;
    }, [selectedCategory, allShops, localities, townId]);

    // Obtener el color de la localidad activa según su índice en el array
    const activeIdx = localities.indexOf(activeLocation);
    const activeColors = LOCALITY_COLORS[activeIdx % LOCALITY_COLORS.length] || LOCALITY_COLORS[0];

    if (!selectedCategory) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-white">
                <p>Categoría no encontrada</p>
                <button onClick={() => { playNeonClick(); navigate(`/${townId}/home`); }} className="mt-4 text-cyan-400 font-bold uppercase tracking-widest text-[10px]">Volver al inicio</button>
            </div>
        );
    }

    return (
        <div className={`flex flex-col animate-in slide-in-from-bottom-6 duration-700 relative overflow-hidden min-h-screen pb-10 bg-transparent ${isDayMode ? 'text-slate-800' : 'text-white'}`}>
            <style>
                {`
                @keyframes bounceSlow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-6px); }
                }
                .animate-bounce-slow {
                    animation: bounceSlow 3s ease-in-out infinite;
                }
                @keyframes scanner-line {
                    0% { transform: translateY(-50%); }
                    100% { transform: translateY(0%); }
                }
                `}
            </style>
            {/* HUD Background - Tech Mesh Encendida */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-indigo-500/18 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
                <div className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-cyan-500/18 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '6s' }} />
                <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-purple-500/5 rounded-full blur-[120px]" />
                {/* Tech Grid Mesh */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.12)_1px,transparent_1px)] bg-[size:30px_30px]" />
                {/* Tech Dots Mesh */}
                <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(99,102,241,0.18)_1px,transparent_1.5px)] bg-[size:15px_15px]" />
                {/* Scanline */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/[0.04] to-transparent h-[200%] w-full -translate-y-1/2 animate-[scanner-line_8s_linear_infinite]" />
            </div>

            <header className={`pt-4 flex-shrink-0 flex flex-col items-center relative z-10 border-b border-cyan-500/15 shadow-[0_4px_30px_rgba(34,211,238,0.06)] bg-transparent`}>
                <div className="w-full px-6 flex flex-col pb-4">
                    <button
                        onClick={() => { playNeonClick(); navigate(`/${townId}/home`); }}
                        className={`back-button absolute top-6 left-5 z-[60] w-10 h-10 flex items-center justify-center rounded-2xl border active:scale-90 transition-all shadow-lg cursor-pointer ${
                            isDayMode 
                                ? 'bg-white border-slate-200 text-slate-800' 
                                : 'text-white/70 hover:text-white'
                        }`}
                        style={
                            isDayMode
                                ? {
                                    borderWidth: '1px',
                                    borderBottomWidth: '4px',
                                    borderBottomColor: '#cbd5e1',
                                    boxShadow: '0 6px 12px rgba(88, 70, 50, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.95)'
                                  }
                                : {
                                    backgroundColor: hexToRgba(themeColor, 0.15),
                                    borderColor: hexToRgba(themeColor, 0.35),
                                    boxShadow: `0 8px 30px rgba(0,0,0,0.5), inset 0 0 10px ${hexToRgba(themeColor, 0.05)}`
                                  }
                        }
                    >
                        <ArrowLeft 
                            size={18} 
                            style={
                                isDayMode 
                                    ? { color: '#2d1e15' } 
                                    : { color: themeColor, filter: `drop-shadow(0 0 6px ${themeColor})` }
                            } 
                        />
                    </button>

                    <div className="flex justify-center w-full px-2">
                        <div
                            onClick={handleTitleClick}
                            className="glass-header rounded-3xl w-full py-3 px-5 flex flex-col items-center border backdrop-blur-md cursor-pointer select-none active:scale-95 transition-all"
                            style={{
                                borderColor: hexToRgba(themeColor, 0.5),
                                boxShadow: `0 15px 40px ${hexToRgba(themeColor, 0.4)}`,
                                background: isDayMode 
                                    ? `linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(248,250,252,0.9) 100%)`
                                    : `linear-gradient(135deg, ${hexToRgba(themeColor, 0.15)} 0%, rgba(15,23,42,0.6) 100%)`
                            }}
                        >
                            <h2 className={`text-[20px] font-[900] uppercase tracking-[0.25em] leading-none text-center mb-2 ${isDayMode ? 'text-slate-800 drop-shadow-sm' : 'text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]'}`}>
                                {selectedCategory.name}
                            </h2>
                            <div className="h-[1px] w-16 mb-2" style={{ backgroundColor: hexToRgba(themeColor, 0.6), boxShadow: `0 0 10px ${hexToRgba(themeColor, 0.8)}` }}></div>
                            <p className={`text-[8.5px] font-bold uppercase tracking-[0.15em] leading-tight text-center px-6 ${isDayMode ? 'text-slate-600' : 'text-white/90'}`}>
                                Seleccioná tu comercio y descubrí ofertas magníficas
                            </p>
                        </div>
                    </div>

                    {globalConfig?.isChristmasMode && (
                        <div 
                            className="mt-4 w-[calc(100%-1rem)] max-w-[340px] mx-auto px-4 py-2.5 rounded-2xl border text-center relative overflow-hidden backdrop-blur-md animate-bounce-slow"
                            style={{
                                background: `linear-gradient(135deg, rgba(220, 38, 38, 0.3) 0%, rgba(20, 83, 45, 0.3) 100%)`,
                                borderColor: '#ef4444',
                                boxShadow: '0 0 15px rgba(239, 68, 68, 0.5), inset 0 0 10px rgba(34, 197, 94, 0.3)',
                            }}
                        >
                            {/* Christmas Lights decoration */}
                            <div className="absolute top-0 left-0 right-0 flex justify-around opacity-80 select-none text-[8px] tracking-[0.1em] pointer-events-none">
                                <span>🔴</span><span>🟢</span><span>🔵</span><span>🟡</span><span>🔴</span><span>🟢</span><span>🔵</span><span>🟡</span>
                            </div>
                            <h3 className="text-[12px] font-black text-white tracking-[0.12em] uppercase text-shadow-premium flex items-center justify-center gap-1.5 pt-1">
                                🎄 ¡Feliz Navidad en {townName}! 🎅
                            </h3>
                        </div>
                    )}
                </div>
            </header>

            <div className="flex flex-col gap-8 px-2 pt-4 relative z-10">
                {/* Pestañas de Localidades — cargadas dinámicamente desde Firebase */}
                {localities.length > 1 && (!isInTraslasierra) && (!isInPatagonia) && (
                    <div className="flex gap-2 w-full justify-center px-2 mb-2 overflow-x-auto no-scrollbar">
                        {localities.map((loc, idx) => {
                            const isActive = activeLocation === loc;
                            const colors = LOCALITY_COLORS[idx % LOCALITY_COLORS.length];
                            const activeClass = isActive
                                ? `${colors.border} ${colors.bg} ${colors.shadow} scale-110 z-10 text-white`
                                : 'border-white/20 text-white/70 bg-white/10 hover:bg-white/15';
                            return (
                                <button
                                    key={loc}
                                    onClick={() => { playNeonClick(); setActiveLocation(loc); }}
                                    className={`locality-tab flex-1 min-w-[72px] py-3 px-2 rounded-2xl border flex flex-col items-center justify-center transition-all duration-300 active:scale-95 ${activeClass}`}
                                >
                                    <span className={`text-[10px] sm:text-[11px] font-[1000] uppercase tracking-widest text-center leading-tight ${isActive ? 'text-shadow-premium' : ''}`}>
                                        {loc}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Pestañas de Subcategorías */}
                {selectedCategory.subcategories && selectedCategory.subcategories.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-2.5 px-2 pb-2 max-w-[95%] mx-auto mb-2">
                        {(() => {
                            const isAllActive = !activeSubcategory;
                            const allBtnClass = isDayMode
                                ? `px-4 py-2.5 rounded-full text-[8.5px] font-[1000] uppercase tracking-widest transition-all duration-150 active:translate-y-[2px] ${
                                    isAllActive 
                                        ? 'border-sky-400 bg-sky-500/20 text-sky-950 scale-105 shadow-[0_0_12px_rgba(14,165,233,0.3)]' 
                                        : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300 hover:-translate-y-[1.5px]'
                                  }`
                                : `px-4 py-2 rounded-full border transition-all duration-300 text-[8.5px] font-black uppercase tracking-widest ${
                                    isAllActive
                                        ? 'active-sub backdrop-blur-md text-white scale-105 animate-pulse'
                                        : 'backdrop-blur-sm text-white/90 hover:text-white hover:scale-105 active:scale-95'
                                  }`;

                            const allBtnStyle = isDayMode
                                ? (isAllActive 
                                    ? {
                                        borderWidth: '1.5px',
                                        borderBottomWidth: '1.5px',
                                        borderBottomColor: themeColor,
                                        boxShadow: `0 0 12px ${hexToRgba(themeColor, 0.4)}, inset 0 1px 0 rgba(255,255,255,0.4)`,
                                        transform: 'translateY(2px)',
                                        color: themeColor,
                                        fontWeight: '1000'
                                      }
                                    : {
                                        borderWidth: '1px',
                                        borderBottomWidth: '4px',
                                        borderBottomColor: '#cda488',
                                        boxShadow: '0 4px 8px rgba(88, 70, 50, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.95)'
                                      }
                                  )
                                : (isAllActive 
                                    ? {
                                        backgroundColor: hexToRgba(themeColor, 0.35),
                                        borderColor: '#ffffff',
                                        boxShadow: `0 0 15px ${hexToRgba(themeColor, 0.8)}, inset 0 0 8px ${hexToRgba(themeColor, 0.5)}`,
                                        textShadow: `0 0 6px ${hexToRgba(themeColor, 0.9)}`
                                      } 
                                    : {
                                        backgroundColor: hexToRgba(themeColor, 0.1),
                                        borderColor: hexToRgba(themeColor, 0.3),
                                        boxShadow: `0 0 8px ${hexToRgba(themeColor, 0.1)}`
                                      }
                                  );

                            return (
                                <button
                                    onClick={() => { playNeonClick(); setActiveSubcategory(''); }}
                                    className={allBtnClass}
                                    style={allBtnStyle}
                                >
                                    Ver Todo
                                </button>
                            );
                        })()}

                        {selectedCategory.subcategories.map((sub: string) => {
                            const isActive = activeSubcategory === sub;
                            const btnClass = isDayMode
                                ? `px-4 py-2.5 rounded-full text-[8.5px] font-[1000] uppercase tracking-widest transition-all duration-150 active:translate-y-[2px] ${
                                    isActive 
                                        ? 'border-sky-400 bg-sky-500/20 text-sky-950 scale-105 shadow-[0_0_12px_rgba(14,165,233,0.3)]' 
                                        : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300 hover:-translate-y-[1.5px]'
                                  }`
                                : `px-4 py-2 rounded-full border transition-all duration-300 text-[8.5px] font-black uppercase tracking-widest ${
                                    isActive
                                        ? 'active-sub backdrop-blur-md text-white scale-105 animate-pulse'
                                        : 'backdrop-blur-sm text-white/90 hover:text-white hover:scale-105 active:scale-95'
                                  }`;

                            const btnStyle = isDayMode
                                ? (isActive 
                                    ? {
                                        borderWidth: '1.5px',
                                        borderBottomWidth: '1.5px',
                                        borderBottomColor: themeColor,
                                        boxShadow: `0 0 12px ${hexToRgba(themeColor, 0.4)}, inset 0 1px 0 rgba(255,255,255,0.4)`,
                                        transform: 'translateY(2px)',
                                        color: themeColor,
                                        fontWeight: '1000'
                                      }
                                    : {
                                        borderWidth: '1px',
                                        borderBottomWidth: '4px',
                                        borderBottomColor: '#cda488',
                                        boxShadow: '0 4px 8px rgba(88, 70, 50, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.95)'
                                      }
                                  )
                                : (isActive 
                                    ? {
                                        backgroundColor: hexToRgba(themeColor, 0.35),
                                        borderColor: '#ffffff',
                                        boxShadow: `0 0 15px ${hexToRgba(themeColor, 0.8)}, inset 0 0 8px ${hexToRgba(themeColor, 0.5)}`,
                                        textShadow: `0 0 6px ${hexToRgba(themeColor, 0.9)}`
                                      } 
                                    : {
                                        backgroundColor: hexToRgba(themeColor, 0.1),
                                        borderColor: hexToRgba(themeColor, 0.3),
                                        boxShadow: `0 0 8px ${hexToRgba(themeColor, 0.1)}`
                                      }
                                  );

                            return (
                                <button
                                    key={sub}
                                    onClick={() => { playNeonClick(); setActiveSubcategory(sub); }}
                                    className={btnClass}
                                    style={btnStyle}
                                >
                                    {sub}
                                </button>
                            );
                        })}
                    </div>
                )}

                <div className="flex flex-col gap-6" key={activeLocation + activeSubcategory}>
                    {/* Título de Sección con ícono */}
                    <div className="flex items-center gap-3 ml-2">
                        <div className={`w-8 h-8 rounded-full backdrop-blur-md border flex items-center justify-center shadow-lg transition-colors ${activeColors.dot}`}>
                            <MapPin size={16} className={activeColors.pin} />
                        </div>
                        <h3 className="text-[12px] font-black uppercase tracking-[0.4em] text-shadow-premium">
                            {isInTraslasierra || isInPatagonia ? townName : activeLocation}
                        </h3>
                        <div className={`h-[1px] flex-1 opacity-50 transition-colors ${activeColors.line}`}></div>
                    </div>

                    {groupedShops[activeLocation] && groupedShops[activeLocation].length > 0 ? (
                        groupedShops[activeLocation].map((shop, index) => (
                            <div key={shop.id} style={{ animationDelay: `${index * 80}ms` }} className={`glass-card-3d ${activeColors.card} overflow-hidden flex flex-row cursor-default fade-up-item w-full items-stretch h-[170px]`}>
                                <div className="relative w-32 shop-image-wrapper flex-shrink-0 overflow-hidden border-r border-white/20">
                                    <img src={shop.bannerImage} alt={shop.name} className="w-full h-full object-cover transition-transform duration-1000 hover:scale-110" />
                                </div>
                                <div className="flex-1 flex flex-col justify-between text-left min-w-0 bg-white/[0.04]">
                                    <div className="space-y-1.5 overflow-hidden p-4 pb-2">
                                        <h3 className="font-[1000] text-[19px] shop-title-text text-white uppercase tracking-tighter leading-none text-shadow-premium">{shop.name.replace(/\s*\(.*\)\s*/, '').split('-')[0].trim()}</h3>
                                        <div className="flex items-start gap-1 pb-1 text-white/80 shop-address-sub uppercase text-[10px] font-bold tracking-tight leading-snug overflow-hidden">
                                            <MapPin size={12} strokeWidth={3} className={`flex-shrink-0 mt-0.5 ${activeColors.pin}`} />
                                            <span className="break-words line-clamp-2">{shop.address}</span>
                                        </div>
                                        <div className="flex justify-between items-end mt-auto pt-1">
                                            <div className="flex flex-col gap-0.5 min-w-0 pr-2">
                                                <div className="flex items-center gap-1">
                                                    {[1, 2, 3, 4, 5].map(star => (<Star key={star} size={11} className={`${star <= Math.round(shop.rating) ? 'fill-yellow-400 text-yellow-400' : 'fill-transparent text-white/20'}`} />))}
                                                    <span className="text-[9px] font-bold text-yellow-400/80 ml-1">{shop.rating}</span>
                                                </div>
                                                {shop.specialty && <p className="text-[8px] font-bold text-white/50 italic tracking-wide leading-tight line-clamp-1">"{shop.specialty}"</p>}
                                            </div>
                                            <div className="flex items-center gap-1 flex-shrink-0 px-2 py-1 rounded-md border shadow-inner" style={{ backgroundColor: hexToRgba(themeColor, 0.2), borderColor: hexToRgba(themeColor, 0.3) }}>
                                                <Eye size={12} style={{ color: themeColor }} />
                                                <span className="text-[9px] font-black" style={{ color: themeColor }}>{shop.visits || 0} visitas</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-full flex justify-center py-3 px-4">
                                        <button
                                            onClick={() => { playNeonClick(); incrementarVisitas(shop.id); navigate(`/${townId}/${selectedCategory.slug}/${shop.slug || shop.id}`); }}
                                            className={`py-2.5 px-6 text-[9px] text-white font-[1100] uppercase tracking-[0.25em] flex items-center justify-center gap-2 transition-all duration-75 rounded-full border backdrop-blur-md active:translate-y-[4px] ${activeColors.btn}`}
                                        >
                                            <BookOpen size={14} strokeWidth={3} className="text-white drop-shadow-md" />VER CATÁLOGO
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-12 px-6 text-center glass-card-3d bg-white/5 border-white/10 rounded-3xl mt-4">
                            <MapPin size={32} className="mx-auto text-white/20 mb-3" />
                            <p className="text-[10px] sm:text-[11px] font-black text-white/50 uppercase tracking-widest leading-relaxed">No hay comercios adheridos <br/>en {activeLocation} para {selectedCategory?.name}</p>
                        </div>
                    )}
                </div>

                <div className="w-full flex justify-center mb-8">
                    <button onClick={() => { playNeonClick(); navigate(`/${townId}/home`); }} className="glass-action-btn backdrop-blur-md border w-max py-2.5 px-6 rounded-full flex items-center gap-2 shadow-lg active:translate-y-[4px] transition-all duration-75" style={{ backgroundColor: hexToRgba(themeColor, 0.2), borderColor: hexToRgba(themeColor, 0.4), color: themeColor }}>
                        <ArrowLeft size={16} /><span className="text-[10px] font-[1100] uppercase tracking-widest">Regresar</span>
                    </button>
                </div>
            </div>

            <footer className="w-full flex flex-col items-center gap-2 pt-6 pb-6 mt-auto border-t border-cyan-500/20 relative z-10 bg-black/30 backdrop-blur-sm">
                <p className="text-[9px] font-black text-white uppercase tracking-[0.35em] text-center select-none">© 2026 · ShopDigital</p>
                <div className="flex items-center gap-4 mt-1">
                    <p onClick={handleWalyClick} className="text-[8px] font-bold uppercase tracking-[0.25em] text-center select-none cursor-pointer active:scale-95 transition-transform"
                        style={{ color: themeColor, textShadow: `0 0 10px ${hexToRgba(themeColor, 0.8)}, 0 0 20px ${hexToRgba(themeColor, 0.4)}` }}>
                        {isInPatagonia ? 'Patagonia' : townName}
                    </p>
                    <span className="text-white/20 text-[8px]">|</span>
                    <button onClick={() => { playNeonClick(); navigate(`/${townId}/terminos`); }} className="text-[8px] font-bold uppercase tracking-[0.25em] text-center text-white hover:text-cyan-300 transition-colors">Términos y Condiciones</button>
                </div>
            </footer>
        </div>
    );
};

export default CategoryPage;
