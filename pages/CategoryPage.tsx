import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CATEGORIES } from '../constants';
import { Shop } from '../types';
import { ChevronLeft, MapPin, Star, BookOpen, ArrowLeft, Eye } from 'lucide-react';
import { playNeonClick } from '../utils/audio';
import { incrementarVisitas } from '../firebase';

interface CategoryPageProps {
    allShops: Shop[];
    globalConfig?: any;
}

const LOCALITIES = ['Luis Guillón', 'Monte Grande', 'El Jagüel'];

const CategoryPage: React.FC<CategoryPageProps> = ({ allShops, globalConfig }) => {
    const { categorySlug } = useParams<{ categorySlug: string }>();
    const navigate = useNavigate();
    const [activeLocation, setActiveLocation] = useState<string>('Monte Grande');
    const [titleClicks, setTitleClicks] = React.useState(0);

    const themeColor = globalConfig?.primaryColor || '#22d3ee';
    const townName = globalConfig?.townName || 'Esteban Echeverría';

    const hexToRgba = (hex: string, alpha: number) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    React.useEffect(() => {
        if (titleClicks === 0) return;
        const timer = setTimeout(() => setTitleClicks(0), 1500);
        return () => clearTimeout(timer);
    }, [titleClicks]);

    const handleTitleClick = () => {
        playNeonClick();
        const nextClicks = titleClicks + 1;
        if (nextClicks >= 5) { setTitleClicks(0); navigate('/embajador'); }
        else setTitleClicks(nextClicks);
    };

    const handleWalyClick = () => {
        playNeonClick();
        navigate('/tablero-maestro');
    };

    const selectedCategory = useMemo(() =>
        CATEGORIES.find(cat => cat.slug === categorySlug),
        [categorySlug]);

    const groupedShops = useMemo(() => {
        if (!selectedCategory) return {};
        const grouped: Record<string, Shop[]> = {};
        const normalize = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
        LOCALITIES.forEach(loc => {
            const normalizedLoc = normalize(loc);
            grouped[loc] = allShops.filter(shop => {
                if (!shop) return false;
                
                // 1. Estado Activo (Tolerante con el legado)
                const isActive = shop.isActive !== false;
                
                // 2. Coincidencia de Categoría (Triple verificación: ID, Slug o Nombre)
                const categoryMatch = 
                    shop.category === selectedCategory.id || 
                    shop.category === selectedCategory.slug || 
                    shop.category?.toLowerCase() === selectedCategory.name.toLowerCase();

                // 3. Localidad (Inclusivo para la zona global)
                const zoneMatch = 
                    townName !== 'Esteban Echeverría' ? 
                    ((shop.zone === loc) || (shop.address && normalize(shop.address || "").includes(normalizedLoc))) :
                    ((shop.zone === loc) || !shop.zone || (shop.address && normalize(shop.address || "").includes(normalizedLoc)));

                return isActive && categoryMatch && zoneMatch;
            });
        });
        return grouped;
    }, [selectedCategory, allShops]);

    if (!selectedCategory) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-white">
                <p>Categoría no encontrada</p>
                <button onClick={() => { playNeonClick(); navigate('/'); }} className="mt-4 text-cyan-400 font-bold uppercase tracking-widest text-[10px]">Volver al inicio</button>
            </div>
        );
    }

    return (
        <div className="flex flex-col animate-in slide-in-from-bottom-6 duration-700 relative overflow-hidden min-h-screen bg-transparent pb-10">
            <div className="absolute top-40 right-[-10%] w-72 h-72 rounded-full blur-3xl pointer-events-none" style={{ backgroundColor: hexToRgba(themeColor, 0.1) }} />
            <div className="absolute bottom-40 left-[-10%] w-72 h-72 rounded-full blur-3xl pointer-events-none" style={{ backgroundColor: hexToRgba(themeColor, 0.1) }} />

            <header className="bg-transparent pt-4 flex-shrink-0 flex flex-col items-center relative z-10">
                <div className="w-full px-6 flex flex-col pb-4">
                    <button
                        onClick={() => { playNeonClick(); navigate('/'); }}
                        className="absolute top-6 left-5 z-[60] w-10 h-10 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-md border border-white/20 active:scale-90 transition-all hover:bg-black/50 shadow-[0_0_15px_rgba(0,0,0,0.5)]"
                    >
                        <ArrowLeft size={22} className="text-white drop-shadow-md pr-0.5" />
                    </button>

                    <div className="flex justify-center w-full px-2">
                        <div 
                            onClick={handleTitleClick}
                            className="glass-header rounded-3xl w-full py-3 px-5 flex flex-col items-center border backdrop-blur-md cursor-pointer select-none active:scale-95 transition-all"
                            style={{ 
                                borderColor: hexToRgba(themeColor, 0.5),
                                boxShadow: `0 15px 40px ${hexToRgba(themeColor, 0.4)}`,
                                background: `linear-gradient(135deg, ${hexToRgba(themeColor, 0.15)} 0%, rgba(15,23,42,0.6) 100%)`
                            }}
                        >
                            <h2 className="text-[20px] font-[900] text-white uppercase tracking-[0.25em] leading-none text-center drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] mb-2">
                                {selectedCategory.name}
                            </h2>
                            <div className="h-[1px] w-16 mb-2" style={{ backgroundColor: hexToRgba(themeColor, 0.6), boxShadow: `0 0 10px ${hexToRgba(themeColor, 0.8)}` }}></div>
                            <p className="text-[8.5px] font-bold text-white/90 uppercase tracking-[0.15em] leading-tight text-center px-6">
                                Seleccioná tu comercio y descubrí ofertas magníficas
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex flex-col gap-8 px-2 pt-4 relative z-10">
                <div className="flex gap-2 w-full justify-center px-2 mb-2">
                    {LOCALITIES.map(loc => {
                        const isActive = activeLocation === loc;
                        let colorClasses = "border-white/20 text-white/70 bg-white/10 hover:bg-white/15";
                        if (isActive) {
                            if (loc === 'Monte Grande') colorClasses = "border-violet-400/80 text-white bg-violet-600/50 shadow-[0_0_20px_rgba(139,92,246,0.8)] scale-110 z-10";
                            else if (loc === 'Luis Guillón') colorClasses = "border-green-400/80 text-white bg-green-600/50 shadow-[0_0_20px_rgba(34,197,94,0.8)] scale-110 z-10";
                            else if (loc === 'El Jagüel') colorClasses = "border-rose-400/80 text-white bg-rose-600/50 shadow-[0_0_20px_rgba(244,63,94,0.8)] scale-110 z-10";
                        }
                        return (
                            <button key={loc} onClick={() => { playNeonClick(); setActiveLocation(loc); }} className={`flex-1 py-3 px-2 rounded-2xl border flex flex-col items-center justify-center transition-all duration-300 active:scale-95 ${colorClasses}`}>
                                <span className={`text-[10px] sm:text-[11px] font-[1000] uppercase tracking-widest text-center leading-tight ${isActive ? 'text-shadow-premium' : ''}`}>{loc}</span>
                            </button>
                        );
                    })}
                </div>

                <div className="flex flex-col gap-6" key={activeLocation}>
                    <div className="flex items-center gap-3 ml-2">
                        <div className={`w-8 h-8 rounded-full backdrop-blur-md border flex items-center justify-center shadow-lg transition-colors
                            ${activeLocation === 'Monte Grande' ? 'bg-violet-500/20 border-violet-400/50' : activeLocation === 'Luis Guillón' ? 'bg-green-500/20 border-green-400/50' : 'bg-rose-500/20 border-rose-400/50'}`}>
                            <MapPin size={16} className={activeLocation === 'Monte Grande' ? 'text-violet-400' : activeLocation === 'Luis Guillón' ? 'text-green-400' : 'text-rose-400'} />
                        </div>
                        <h3 className="text-[12px] font-black text-white uppercase tracking-[0.4em] text-shadow-premium">{activeLocation}</h3>
                        <div className={`h-[1px] flex-1 opacity-50 transition-colors ${activeLocation === 'Monte Grande' ? 'bg-violet-400/30' : activeLocation === 'Luis Guillón' ? 'bg-green-400/30' : 'bg-rose-400/30'}`}></div>
                    </div>

                    {groupedShops[activeLocation] && groupedShops[activeLocation].length > 0 ? (
                        groupedShops[activeLocation].map((shop, index) => (
                            <div key={shop.id} style={{ animationDelay: `${index * 80}ms` }} className={`glass-card-3d ${activeLocation === 'Monte Grande' ? 'card-neon-violet' : activeLocation === 'Luis Guillón' ? 'card-neon-green' : 'card-neon-red'} overflow-hidden flex flex-row cursor-default fade-up-item w-full items-stretch h-[170px]`}>
                                <div className="relative w-32 shop-image-wrapper flex-shrink-0 overflow-hidden border-r border-white/20">
                                    <img src={shop.bannerImage} alt={shop.name} className="w-full h-full object-cover transition-transform duration-1000 hover:scale-110" />
                                </div>
                                <div className="flex-1 flex flex-col justify-between text-left min-w-0 bg-white/[0.04]">
                                    <div className="space-y-1.5 overflow-hidden p-4 pb-2">
                                        <h3 className="font-[1000] text-[19px] shop-title-text text-white uppercase tracking-tighter leading-none text-shadow-premium">{shop.name.replace(/\s*\(.*\)\s*/, '').split('-')[0].trim()}</h3>
                                        <div className="flex items-start gap-1 pb-1 text-white/80 shop-address-sub uppercase text-[10px] font-bold tracking-tight leading-snug overflow-hidden">
                                            <MapPin size={12} strokeWidth={3} className={`flex-shrink-0 mt-0.5 ${activeLocation === 'Monte Grande' ? 'text-violet-400/80' : activeLocation === 'Luis Guillón' ? 'text-green-400/80' : 'text-rose-400/80'}`} />
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
                                        <button onClick={() => { playNeonClick(); incrementarVisitas(shop.id); navigate(`/${selectedCategory.slug}/${shop.slug || shop.id}`); }} 
                                            className={`py-2.5 px-6 text-[9px] text-white font-[1100] uppercase tracking-[0.25em] flex items-center justify-center gap-2 transition-all duration-75 rounded-full border
                                                ${activeLocation === 'Monte Grande' ? 'border-violet-400/50 bg-violet-600/30 backdrop-blur-md shadow-[0_4px_0_rgba(139,92,246,0.5)] active:translate-y-[4px]' :
                                                  activeLocation === 'Luis Guillón' ? 'border-green-400/50 bg-green-600/30 backdrop-blur-md shadow-[0_4px_0_rgba(34,197,94,0.5)] active:translate-y-[4px]' :
                                                  'border-rose-400/50 bg-rose-600/30 backdrop-blur-md shadow-[0_4px_0_rgba(244,63,94,0.5)] active:translate-y-[4px]'}`}>
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
                    <button onClick={() => { playNeonClick(); navigate('/'); }} className="glass-action-btn backdrop-blur-md border w-max py-2.5 px-6 rounded-full flex items-center gap-2 shadow-lg active:translate-y-[4px] transition-all duration-75" style={{ backgroundColor: hexToRgba(themeColor, 0.2), borderColor: hexToRgba(themeColor, 0.4), color: themeColor }}>
                        <ArrowLeft size={16} /><span className="text-[10px] font-[1100] uppercase tracking-widest">Regresar</span>
                    </button>
                </div>
            </div>

            <footer className="w-full flex flex-col items-center gap-2 pt-6 pb-6 mt-auto border-t border-white/10 relative z-10">
                <p className="text-[9px] font-black text-white uppercase tracking-[0.35em] text-center select-none">© 2026 · ShopDigital</p>
                <div className="flex items-center gap-4 mt-1">
                    <p onClick={handleWalyClick} className="text-[8px] font-bold uppercase tracking-[0.25em] text-center select-none cursor-pointer active:scale-95 transition-transform" 
                        style={{ color: themeColor, textShadow: `0 0 10px ${hexToRgba(themeColor, 0.8)}, 0 0 20px ${hexToRgba(themeColor, 0.4)}` }}>
                        {townName}
                    </p>
                    <span className="text-white/20 text-[8px]">|</span>
                    <button onClick={() => { playNeonClick(); navigate('/terminos'); }} className="text-[8px] font-bold uppercase tracking-[0.25em] text-center text-white hover:text-cyan-300 transition-colors">Términos y Condiciones</button>
                </div>
            </footer>
        </div>
    );
};

export default CategoryPage;
