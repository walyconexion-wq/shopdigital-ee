import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CATEGORIES } from '../constants';
import { Shop } from '../types';
import { TRASLASIERRA_REGION } from '../data/regionalTemplates/traslasierraConfig';
import { PATAGONIA_7_LAGOS_REGION } from '../data/regionalTemplates/patagonia7LagosConfig';
import { ChevronLeft, MapPin, Star, BookOpen, ArrowLeft, Eye, Sun, Moon, Clock, Wifi, Share2, Store } from 'lucide-react';
import { playNeonClick } from '../utils/audio';
import { incrementarVisitas } from '../firebase';
import { useTownLocalities } from '../hooks/useTownLocalities';
import ProgressiveShopImage from '../components/ProgressiveShopImage';
import { CyberCircuitBackground } from '../components/CyberCircuitBackground';

interface CategoryPageProps {
    allShops: Shop[];
    globalConfig?: any;
}

// Paleta de colores cíclica para las localidades dinámicas
const LOCALITY_COLORS = [
    { border: 'border-violet-400/80 border-b-[4px] border-b-violet-500/60', bg: 'bg-violet-600/50', shadow: 'shadow-[0_0_20px_rgba(139,92,246,0.5)]', pin: 'text-violet-400', line: 'bg-violet-400/30', dot: 'bg-violet-500/20 border-violet-400/50', card: 'card-neon-violet border-b-[5px] border-b-violet-500/30 shadow-[0_15px_30px_rgba(139,92,246,0.15)]', btn: 'border-violet-400/50 bg-violet-600/30 border-b-[4px] border-b-violet-500/80 shadow-lg text-white' },
    { border: 'border-cyan-400/80 border-b-[4px] border-b-cyan-500/60',   bg: 'bg-cyan-600/50',   shadow: 'shadow-[0_0_20px_rgba(34,211,238,0.5)]',  pin: 'text-cyan-400',   line: 'bg-cyan-400/30',   dot: 'bg-cyan-500/20 border-cyan-400/50',   card: 'card-neon-cyan border-b-[5px] border-b-cyan-500/30 shadow-[0_15px_30px_rgba(34,211,238,0.15)]',   btn: 'border-cyan-400/50 bg-cyan-600/30 border-b-[4px] border-b-cyan-500/80 shadow-lg text-white' },
    { border: 'border-rose-400/80 border-b-[4px] border-b-rose-500/60',   bg: 'bg-rose-600/50',   shadow: 'shadow-[0_0_20px_rgba(244,63,94,0.5)]',   pin: 'text-rose-400',   line: 'bg-rose-400/30',   dot: 'bg-rose-500/20 border-rose-400/50',   card: 'card-neon-red border-b-[5px] border-b-rose-500/30 shadow-[0_15px_30px_rgba(244,63,94,0.15)]',    btn: 'border-rose-400/50 bg-rose-600/30 border-b-[4px] border-b-rose-500/80 shadow-lg text-white' },
    { border: 'border-green-400/80 border-b-[4px] border-b-green-500/60',  bg: 'bg-green-600/50',  shadow: 'shadow-[0_0_20px_rgba(34,197,94,0.5)]',   pin: 'text-green-400',  line: 'bg-green-400/30',  dot: 'bg-green-500/20 border-green-400/50',  card: 'card-neon-green border-b-[5px] border-b-green-500/30 shadow-[0_15px_30px_rgba(34,197,94,0.15)]',  btn: 'border-green-400/50 bg-green-600/30 border-b-[4px] border-b-green-500/80 shadow-lg text-white' },
    { border: 'border-amber-400/80 border-b-[4px] border-b-amber-500/60',  bg: 'bg-amber-600/50',  shadow: 'shadow-[0_0_20px_rgba(245,158,11,0.5)]',  pin: 'text-amber-400',  line: 'bg-amber-400/30',  dot: 'bg-amber-500/20 border-amber-400/50',  card: 'card-neon-amber border-b-[5px] border-b-amber-500/30 shadow-[0_15px_30px_rgba(245,158,11,0.15)]',  btn: 'border-amber-400/50 bg-amber-600/30 border-b-[4px] border-b-amber-500/80 shadow-lg text-white' },
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
        : isInPatagonia
        ? PATAGONIA_7_LAGOS_REGION.towns.find(t => t.id === townId)?.name || townId.replace(/-/g, ' ')
        : (globalConfig?.townName || 'Esteban Echeverría');

    const [activeLocation, setActiveLocation] = useState<string>('');
    const [activeSubcategory, setActiveSubcategory] = useState<string>('');
    const [titleClicks, setTitleClicks] = React.useState(0);

    const themeColor = globalConfig?.primaryColor || '#22d3ee';
    const themeMode = globalConfig?.themeMode || 'auto';
    const checkIsDayMode = () => {
        const saved = localStorage.getItem('global_home_theme_mode');
        return (saved || 'light') === 'light';
    };
    const [isDayMode, setIsDayMode] = React.useState(checkIsDayMode);

    const [currentTime, setCurrentTime] = useState(new Date());
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatClock = (d: Date) => {
        const dateStr = d.toLocaleDateString('es-AR');
        const hourStr = d.toLocaleTimeString('es-AR', { hour12: false });
        return `${dateStr} - ${hourStr}`;
    };

    const handleShare = () => {
        playNeonClick();
        const shareText = `¡Mirá los comercios de ${selectedCategory?.name || 'Categoría'} en ${townName}! 🚀`;
        if (navigator.share) {
            navigator.share({ title: 'ShopDigital', text: shareText, url: window.location.href }).catch(console.error);
        } else {
            window.open(`https://wa.me/?text=${encodeURIComponent(shareText + '\n' + window.location.href)}`, '_blank');
        }
    };

    const hexToRgba = (hex: string, alpha: number) => {
        try {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        } catch { return `rgba(34, 211, 238, ${alpha})`; }
    };

    // PRIMERO: Declarar selectedCategory para que los useEffect de abajo puedan referenciarlo
    const selectedCategory = useMemo(() => {
        const availableCategories = globalConfig?.categories || CATEGORIES;
        return availableCategories.find((cat: any) => cat.slug === categorySlug);
    }, [categorySlug, globalConfig]);

    // Resetear al cambiar de zona o categoría para evitar fantasmas de filtrado
    useEffect(() => {
        setActiveLocation('');
        setActiveSubcategory('');
    }, [townId, categorySlug]);

    // Sincronizar activeLocation con las localidades validadas por el hook
    useEffect(() => {
        if (localities.length > 0 && (!activeLocation || !localities.includes(activeLocation))) {
            setActiveLocation(localities[0]);
        }
    }, [localities, activeLocation]);

    // NO auto-seleccionar subcategoría: dejar vacío muestra TODOS los comercios.
    // El usuario selecciona manualmente si quiere filtrar.

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

    const groupedShops = useMemo(() => {
        if (!selectedCategory || localities.length === 0) return {};
        const grouped: Record<string, Shop[]> = {};
        const normalize = (str: any) => {
            if (typeof str !== 'string') return '';
            return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
        };
        
        localities.forEach(loc => {
            const normalizedLoc = normalize(loc);
            grouped[loc] = allShops.filter(shop => {
                if (!shop) return false;

                // 1. Estado Activo
                const isActive = shop.isActive !== false;

                // 2. Coincidencia de Categoría
                const shopCatStr = typeof shop.category === 'string' ? shop.category : String(shop.category || '');
                const selCatNameStr = typeof selectedCategory.name === 'string' ? selectedCategory.name : String(selectedCategory.name || '');

                const categoryMatch =
                    shop.category === selectedCategory.id ||
                    shop.category === selectedCategory.slug ||
                    shopCatStr.toLowerCase() === selCatNameStr.toLowerCase();

                // 3. Localidad — busca por shop.zone o por dirección
                const isMotherZone = townId === 'esteban-echeverria' || isInTraslasierra;
                const isSingleLocalityFallback = localities.length <= 1 || loc === 'Centro' || isInPatagonia;
                const zoneMatch = (isMotherZone || isSingleLocalityFallback)
                    ? ((shop.zone === loc) || !shop.zone || normalize(shop.address || '').includes(normalizedLoc) || isSingleLocalityFallback)
                    : ((shop.zone === loc) || normalize(shop.address || '').includes(normalizedLoc));

                // 4. Coincidencia de Subcategoría (solo si el usuario seleccionó una)
                const subMatch = !activeSubcategory || 
                    (shop.specialty && normalize(shop.specialty).includes(normalize(activeSubcategory))) ||
                    (shop.description && normalize(shop.description).includes(normalize(activeSubcategory))) ||
                    (shop.tags && shop.tags.some(tag => normalize(tag).includes(normalize(activeSubcategory))));

                return isActive && categoryMatch && zoneMatch && subMatch;
            });
        });
        return grouped;
    }, [selectedCategory, allShops, localities, townId, activeSubcategory]);

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
        <div className="min-h-screen w-full flex flex-col items-center px-4 py-6 relative overflow-y-auto selection:bg-cyan-500/30 bg-transparent text-[#2c2440]">
            {/* Fondo Ciber-Digital de Circuitos Animados */}
            <CyberCircuitBackground />

            {/* ══════════════════════════════════════════
                CABECERA SUPERIOR EN CONTENEDOR NEUMÓRFICO UNIFICADO (PARIDAD INTERFAZ 1 Y CREDECIALES)
            ══════════════════════════════════════════ */}
            <div className="w-full max-w-sm relative z-10 mb-5 p-3.5 neu-plate flex flex-col items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-700">
                {/* HEADER NEUMÓRFICO CON PODS DE CABECERA */}
                <div className="w-full flex justify-between items-center gap-2">
                    <button 
                        onClick={() => { playNeonClick(); navigate(`/${townId}/home`); }}
                        className="w-9 h-9 flex items-center justify-center cursor-pointer transition-all neu-btn-pod group shrink-0"
                        aria-label="Volver a Inicio de Zona"
                        title="Volver"
                    >
                        <ArrowLeft size={16} className="text-[#2c2440] group-hover:-translate-x-0.5 transition-transform" strokeWidth={3} />
                    </button>

                    <div 
                        onClick={handleTitleClick}
                        className="flex-1 text-center px-3 py-1.5 neu-inset-title cursor-pointer active:scale-95 transition-transform"
                    >
                        <h1 className="text-xs font-black tracking-tight uppercase leading-tight text-[#2c2440]">
                            {activeSubcategory || selectedCategory.name}
                        </h1>
                        <p className="text-[7px] font-extrabold uppercase tracking-widest text-[#4a3d6a]">
                            {townName}
                        </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                        <button
                            onClick={() => {
                                playNeonClick();
                                const current = localStorage.getItem('global_home_theme_mode') || 'light';
                                const nextTheme = current === 'light' ? 'dark' : 'light';
                                localStorage.setItem('global_home_theme_mode', nextTheme);
                                window.dispatchEvent(new Event('theme-changed'));
                            }}
                            aria-label="Alternar modo de color"
                            className="w-9 h-9 flex items-center justify-center cursor-pointer transition-all neu-btn-pod group"
                            title="Modo de Color"
                        >
                            {isDayMode 
                                ? <Moon size={15} className="text-[#2c2440] group-hover:rotate-12 transition-transform" /> 
                                : <Sun size={15} className="text-[#ff6b6b] group-hover:rotate-45 transition-transform" />
                            }
                        </button>
                        <button 
                            onClick={handleShare}
                            className="w-9 h-9 flex items-center justify-center cursor-pointer transition-all neu-btn-pod group"
                            aria-label="Compartir"
                            title="Compartir Categoría"
                        >
                            <Share2 size={15} className="text-[#2c2440] group-hover:scale-110 transition-transform" />
                        </button>
                    </div>
                </div>

                {/* Avatar ARI Integrado en Cabecera */}
                {isDayMode && (
                    <div className="flex flex-col items-center select-none pointer-events-none my-0.5">
                        <img 
                            src="/ari-pointing.png" 
                            alt="ARI Asistente Categorías" 
                            className="h-20 w-auto object-contain drop-shadow-[0_4px_10px_rgba(44,36,64,0.18)] animate-in fade-in duration-700" 
                        />
                        <div className="ari-3d-shadow mt-0.5 scale-75" />
                    </div>
                )}

                {/* SELLO DE VIDA — TIMESTAMP ANTI-FALSIFICACIÓN & ESTADO LUZ VERDE */}
                <div className="w-full flex items-center justify-between neu-inset-title px-4 py-2">
                    <div className="flex items-center gap-2">
                        <Clock size={12} className="text-[#ff6b6b] animate-spin flex-shrink-0" style={{ animationDuration: '6s' }} />
                        <p className="text-[9.5px] font-black font-mono tracking-widest tabular-nums text-[#2c2440]">
                            {formatClock(currentTime)}
                        </p>
                    </div>
                    <div className="h-3.5 w-[1px] bg-[#4a3d6a]/20" />
                    <div className="flex items-center gap-1.5 font-black text-[8.5px] uppercase tracking-widest text-emerald-600">
                        <Wifi size={12} className="animate-pulse text-emerald-600" />
                        <span>LUZ VERDE ACTIVA</span>
                    </div>
                </div>

                {/* Localidades / Zonas Neumórficas (Sub-pills) */}
                {localities.length > 1 && (!isInTraslasierra) && (!isInPatagonia) && (
                    <div className="w-full mt-0.5">
                        <div className="grid grid-cols-3 gap-1.5 w-full">
                            {localities.map((loc) => {
                                const isActive = activeLocation === loc;
                                return (
                                    <button
                                        key={loc}
                                        onClick={() => { playNeonClick(); setActiveLocation(loc); }}
                                        className={`py-2 px-1 text-[8px] font-black uppercase tracking-wider text-center transition-all ${
                                            isActive ? 'neu-btn-3d-active' : 'neu-btn-pod'
                                        }`}
                                    >
                                        {loc}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Pestañas de Subcategorías Neumórficas */}
                {selectedCategory.subcategories && selectedCategory.subcategories.length > 0 && (
                    <div className="w-full mt-0.5">
                        <div className="flex flex-wrap justify-center gap-1.5 w-full">
                            {selectedCategory.subcategories.map((sub: string) => {
                                const isActive = activeSubcategory === sub;
                                return (
                                    <button
                                        key={sub}
                                        onClick={() => { 
                                            playNeonClick(); 
                                            setActiveSubcategory(prev => prev === sub ? '' : sub); 
                                        }}
                                        className={`py-1.5 px-3 text-[8px] font-black uppercase tracking-wider transition-all ${
                                            isActive ? 'neu-btn-3d-active' : 'neu-btn-pod'
                                        }`}
                                    >
                                        {sub}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* ══════════════════════════════════════════
                LISTADO DE COMERCIOS ADHERIDOS EN CONTENEDOR NEUMÓRFICO UNIFICADO
            ══════════════════════════════════════════ */}
            <div className="w-full max-w-sm relative z-10 mb-5 animate-in zoom-in duration-700 delay-100" key={activeLocation + activeSubcategory}>
                <div className="neu-plate p-4 w-full flex flex-col gap-3.5">
                    {/* Título de Sección Inset (Monte Grande | X Comercios) dentro del contenedor */}
                    <div className="neu-inset-title py-2.5 px-4 flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-[#f0ece6] flex items-center justify-center neu-btn-pod">
                                <MapPin size={13} className="text-[#ff6b6b]" />
                            </div>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2c2440]">
                                {isInTraslasierra || isInPatagonia ? townName : activeLocation}
                            </h3>
                        </div>
                        <span className="text-[8.5px] font-extrabold uppercase tracking-widest text-[#4a3d6a] bg-[#faf7f2] px-2.5 py-0.5 rounded-full border border-[#b4a594]/30">
                            {groupedShops[activeLocation]?.length || 0} COMERCIOS
                        </span>
                    </div>

                    {/* Tarjetas de Comercios integradas en el contenedor neumórfico */}
                    {groupedShops[activeLocation] && groupedShops[activeLocation].length > 0 ? (
                        groupedShops[activeLocation].map((shop, index) => (
                            <div 
                                key={shop.id} 
                                style={{ animationDelay: `${Math.min(index * 40, 200)}ms` }} 
                                className="neu-btn-pod overflow-hidden flex flex-row cursor-default fade-up-item w-full items-stretch min-h-[165px] p-0 relative rounded-2xl border border-white/60"
                            >
                                {/* Imagen del Comercio */}
                                <div className="relative w-32 shop-image-wrapper flex-shrink-0 overflow-hidden border-r border-[#b4a594]/25">
                                    <ProgressiveShopImage
                                        src={shop.bannerImage}
                                        alt={shop.name}
                                        className="w-full h-full transition-transform duration-1000 hover:scale-110 object-cover"
                                        priority={index < 4}
                                        skeletonColor="rgba(0,0,0,0.06)"
                                    />
                                </div>

                                {/* Detalle del Comercio */}
                                <div className="flex-1 flex flex-col justify-between text-left min-w-0 p-3">
                                    <div className="space-y-1.5 overflow-hidden">
                                        <h3 className="font-[1000] text-[15px] uppercase tracking-tight leading-none text-[#2c2440]">
                                            {String(shop.name || '').replace(/\s*\(.*\)\s*/, '').split('-')[0].trim()}
                                        </h3>
                                        <div className="flex items-start gap-1 uppercase text-[8.5px] font-extrabold tracking-tight leading-snug text-[#4a3d6a]">
                                            <MapPin size={10} strokeWidth={2.5} className="flex-shrink-0 mt-0.5 text-[#ff6b6b]" />
                                            <span className="break-words line-clamp-2">{shop.address}</span>
                                        </div>
                                        <div className="flex justify-between items-center pt-0.5">
                                            <div className="flex items-center gap-0.5">
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <Star key={star} size={9.5} className={`${star <= Math.round(shop.rating) ? 'fill-[#ff6b6b] text-[#ff6b6b]' : 'fill-transparent text-[#4a3d6a]/30'}`} />
                                                ))}
                                                <span className="text-[8.5px] font-black text-[#2c2440] ml-0.5">{shop.rating}</span>
                                            </div>
                                            <div className="flex items-center gap-1 flex-shrink-0 px-2 py-0.5 neu-inset-title">
                                                <Eye size={10} className="text-[#7c3aed]" />
                                                <span className="text-[8px] font-black text-[#2c2440]">{shop.visits || 0} visitas</span>
                                            </div>
                                        </div>
                                        {shop.specialty && (
                                            <p className="text-[7.5px] font-extrabold italic tracking-wide leading-tight line-clamp-1 text-[#4a3d6a]">
                                                "{shop.specialty}"
                                            </p>
                                        )}
                                    </div>

                                    {/* Botón Ver Catálogo con efecto 3D neu-cat-card e ícono encendido */}
                                    <div className="w-full pt-1.5">
                                        <button
                                            onClick={() => { playNeonClick(); incrementarVisitas(shop.id); navigate(`/${townId}/${selectedCategory.slug}/${shop.slug || shop.id}`); }}
                                            className="neu-cat-card w-full py-2 px-2.5 text-[8.5px] font-black uppercase tracking-[0.16em] flex items-center justify-center gap-1.5 cursor-pointer"
                                        >
                                            <BookOpen size={13} strokeWidth={2.5} className="neu-icon-lit" />
                                            <span>VER CATÁLOGO</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="neu-inset-title py-8 px-6 text-center text-[#2c2440]">
                            <MapPin size={26} className="mx-auto mb-2 text-[#ff6b6b] opacity-80" />
                            <p className="text-[9.5px] font-black uppercase tracking-widest leading-relaxed">No hay comercios adheridos <br/>en {activeLocation} para {selectedCategory?.name}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ══════════════════════════════════════════
                ACCIONES Y PIE DE PÁGINA EN CONTENEDOR NEUMÓRFICO UNIFICADO
            ══════════════════════════════════════════ */}
            <footer className="w-full max-w-sm relative z-10 mb-6 animate-in slide-in-from-bottom-4 duration-700">
                <div className="neu-plate p-5 sm:p-6 w-full flex flex-col gap-4">
                    {/* Botón 3D: Regresar a Zona */}
                    <button
                        onClick={() => { playNeonClick(); navigate(`/${townId}/home`); }}
                        className="neu-btn-hero w-full h-14 sm:h-15 text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2.5 cursor-pointer shadow-md"
                    >
                        <ArrowLeft size={17} className="text-[#ff6b6b]" strokeWidth={2.5} />
                        <span>Regresar a Zona</span>
                    </button>

                    {/* Sello Inset Neumórfico para Pie de Página y Términos */}
                    <div className="neu-inset-title flex items-center justify-between w-full py-3 px-4.5 mt-0.5">
                        <p 
                            onClick={handleWalyClick}
                            className="text-[8.5px] font-extrabold uppercase tracking-[0.2em] text-[#2c2440] select-none cursor-pointer"
                        >
                            © 2026 · ShopDigital
                        </p>
                        <div className="flex items-center gap-2.5">
                            <p 
                                onClick={handleWalyClick}
                                className="text-[8.5px] font-extrabold uppercase tracking-[0.14em] text-[#2c2440] hover:text-[#ff6b6b] select-none cursor-pointer active:scale-95 transition-all" 
                            >
                                {activeSubcategory || selectedCategory.name}
                            </p>
                            <span className="text-[#4a3d6a]/40 text-[7px] select-none">|</span>
                            <button 
                                onClick={() => { playNeonClick(); navigate(`/${townId}/terminos`); }}
                                className="text-[8px] font-extrabold uppercase tracking-[0.14em] text-[#2c2440] hover:text-[#ff6b6b] active:opacity-75 transition-all select-none"
                            >
                                Términos
                            </button>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default CategoryPage;
