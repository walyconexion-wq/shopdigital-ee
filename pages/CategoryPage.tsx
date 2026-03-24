import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CATEGORIES } from '../constants';
import { Shop } from '../types';
import { ChevronLeft, MapPin, Star, BookOpen, ArrowLeft, Eye } from 'lucide-react';
import { playNeonClick } from '../utils/audio';
import { incrementarVisitas } from '../firebase';

interface CategoryPageProps {
    allShops: Shop[];
}

const LOCALITIES = ['Luis Guillón', 'Monte Grande', 'El Jagüel'];

const CategoryPage: React.FC<CategoryPageProps> = ({ allShops }) => {
    const { categorySlug } = useParams<{ categorySlug: string }>();
    const navigate = useNavigate();
    const [activeLocation, setActiveLocation] = useState<string>('Monte Grande');

    // Ambassador Easter Egg Logic
    const [titleClicks, setTitleClicks] = React.useState(0);

    React.useEffect(() => {
        if (titleClicks === 0) return;
        const timer = setTimeout(() => {
            setTitleClicks(0);
        }, 1500); // 1.5 seconds window for 5 clicks
        return () => clearTimeout(timer);
    }, [titleClicks]);

    const handleTitleClick = () => {
        playNeonClick();
        const nextClicks = titleClicks + 1;
        if (nextClicks >= 5) {
            setTitleClicks(0);
            navigate('/embajador');
        } else {
            setTitleClicks(nextClicks);
        }
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
            grouped[loc] = allShops.filter(shop =>
                shop &&
                shop.isActive === true &&
                shop.category === selectedCategory.id &&
                ((shop.zone === loc) || (shop.address && normalize(shop.address || "").includes(normalizedLoc)))
            );
        });

        return grouped;
    }, [selectedCategory, allShops]);

    if (!selectedCategory) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-white">
                <p>Categoría no encontrada</p>
                <button onClick={() => {
                    playNeonClick();
                    navigate('/');
                }} className="mt-4 text-cyan-400 font-bold uppercase tracking-widest text-[10px]">Volver al inicio</button>
            </div>
        );
    }

    return (
        <div className="flex flex-col animate-in slide-in-from-bottom-6 duration-700 relative overflow-hidden min-h-screen bg-black">
            {/* HUD Decorative Elements */}
            <div className="absolute top-40 right-[-10%] w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-40 left-[-10%] w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            <header className="bg-transparent pt-4 flex-shrink-0 flex flex-col items-center relative z-10">
                <div className="w-full px-6 flex flex-col pb-4">
                    <div className="flex justify-center w-full px-2">
                        <div 
                            onClick={handleTitleClick}
                            className="glass-header rounded-3xl w-full py-4 px-6 flex flex-col items-center border-cyan-400/50 shadow-[0_15px_40px_rgba(34,211,238,0.4)] bg-gradient-to-br from-cyan-500/20 to-slate-900/60 cursor-pointer select-none active:scale-95 transition-all"
                        >
                            <h2 className="text-[24px] font-[900] text-white uppercase tracking-[0.3em] leading-none text-center drop-shadow-[0_0_15px_rgba(34,211,238,0.8)] mb-3 transition-transform active:scale-95">
                                {selectedCategory.name}
                            </h2>
                            <div className="h-[1px] w-20 bg-cyan-400/60 mb-3 shadow-[0_0_10px_rgba(34,211,238,0.8)]"></div>
                            <p className="text-[9.5px] font-bold text-white/90 uppercase tracking-[0.15em] leading-tight text-center px-8">
                                Seleccioná tu comercio y descubrí ofertas magníficas
                            </p>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    playNeonClick();
                                    navigate('/');
                                }}
                                className="mt-4 flex items-center gap-1.5 text-[8px] font-bold text-white/50 uppercase tracking-[0.2em] hover:text-cyan-400 transition-colors"
                            >
                                <ChevronLeft size={12} strokeWidth={3} />
                                Atrás
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex flex-col gap-8 px-2 pt-4 pb-24 relative z-10">
                {/* LOCATION TABS NAVIGATION */}
                <div className="flex gap-2 w-full justify-center px-2 mb-2">
                    {LOCALITIES.map(loc => {
                        const isActive = activeLocation === loc;
                        let colorClasses = "border-white/20 text-white/70 bg-white/10 hover:bg-white/15"; // slightly brighter inactive
                        
                        if (isActive) {
                            if (loc === 'Monte Grande') colorClasses = "border-violet-400/80 text-white bg-violet-600/50 shadow-[0_0_20px_rgba(139,92,246,0.8)] scale-110 z-10";
                            else if (loc === 'Luis Guillón') colorClasses = "border-green-400/80 text-white bg-green-600/50 shadow-[0_0_20px_rgba(34,197,94,0.8)] scale-110 z-10";
                            else if (loc === 'El Jagüel') colorClasses = "border-rose-400/80 text-white bg-rose-600/50 shadow-[0_0_20px_rgba(244,63,94,0.8)] scale-110 z-10";
                        }

                        return (
                            <button
                                key={loc}
                                onClick={() => {
                                    playNeonClick();
                                    setActiveLocation(loc);
                                }}
                                className={`flex-1 py-3 px-2 rounded-2xl border flex flex-col items-center justify-center transition-all duration-300 active:scale-95 ${colorClasses}`}
                            >
                                <span className={`text-[10px] sm:text-[11px] font-[1000] uppercase tracking-widest text-center leading-tight ${isActive ? 'text-shadow-premium' : ''}`}>
                                    {loc}
                                </span>
                            </button>
                        );
                    })}
                </div>

                <div className="flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-500" key={activeLocation}>
                    <div className="flex items-center gap-3 ml-2">
                        <div className={`w-8 h-8 rounded-full backdrop-blur-md border flex items-center justify-center shadow-lg transition-colors
                            ${activeLocation === 'Monte Grande' ? 'bg-violet-500/20 border-violet-400/50' : 
                              activeLocation === 'Luis Guillón' ? 'bg-green-500/20 border-green-400/50' : 
                              'bg-rose-500/20 border-rose-400/50'}`}
                        >
                            <MapPin size={16} className={
                                activeLocation === 'Monte Grande' ? 'text-violet-400' :
                                activeLocation === 'Luis Guillón' ? 'text-green-400' :
                                'text-rose-400'
                            } />
                        </div>
                        <h3 className="text-[12px] font-black text-white uppercase tracking-[0.4em] text-shadow-premium">
                            {activeLocation}
                        </h3>
                        <div className={`h-[1px] flex-1 opacity-50 transition-colors
                            ${activeLocation === 'Monte Grande' ? 'bg-violet-400/30' :
                              activeLocation === 'Luis Guillón' ? 'bg-green-400/30' :
                              'bg-rose-400/30'}`}
                        ></div>
                    </div>

                    {groupedShops[activeLocation] && groupedShops[activeLocation].length > 0 ? (
                        groupedShops[activeLocation].map((shop, index) => (
                            <div
                                key={shop.id}
                                style={{ animationDelay: `${index * 80}ms` }}
                                className={`glass-card-3d ${activeLocation === 'Monte Grande' ? 'card-neon-violet' : activeLocation === 'Luis Guillón' ? 'card-neon-green' : 'card-neon-red'} overflow-hidden flex flex-row cursor-default fade-up-item w-full items-stretch h-[170px]`}
                            >
                                <div className="relative w-32 shop-image-wrapper flex-shrink-0 overflow-hidden border-r border-white/20">
                                    <img src={shop.bannerImage} alt={shop.name} className="w-full h-full object-cover transition-transform duration-1000 hover:scale-110" />
                                    
                                    {/* Contador de Visitas */}
                                    <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full border border-cyan-400/30 shadow-lg flex items-center gap-1.5">
                                        <Eye size={13} className="text-cyan-400" />
                                        <span className="text-[10px] font-black text-cyan-400">{shop.visits || 0}</span>
                                    </div>

                                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full border border-white/20 shadow-xl">
                                        <div className="flex items-center gap-1">
                                            <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                                            <span className="text-[10px] font-black text-white">{shop.rating}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 flex flex-col justify-between text-left min-w-0 bg-white/[0.04]">
                                    <div className="space-y-1.5 overflow-hidden p-4 pb-2">
                                        <h3 className="font-[1000] text-[19px] shop-title-text text-white uppercase tracking-tighter leading-none text-shadow-premium">
                                            {shop.name.replace(/\s*\(.*\)\s*/, '').split('-')[0].trim()}
                                        </h3>
                                        <div className="flex items-start gap-1 pb-1 text-white/80 shop-address-sub uppercase text-[10px] font-bold tracking-tight leading-snug overflow-hidden">
                                            <MapPin size={12} strokeWidth={3} className={`flex-shrink-0 mt-0.5 ${
                                                activeLocation === 'Monte Grande' ? 'text-violet-400/80' :
                                                activeLocation === 'Luis Guillón' ? 'text-green-400/80' :
                                                'text-rose-400/80'
                                            }`} />
                                            <span className="break-words line-clamp-2">{shop.address}</span>
                                        </div>

                                        {/* Estrellas de calificación */}
                                        <div className="flex items-center gap-1 pt-0.5">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <Star key={star} size={11} className={`${
                                                    star <= Math.round(shop.rating)
                                                        ? 'fill-yellow-400 text-yellow-400'
                                                        : 'fill-transparent text-white/20'
                                                }`} />
                                            ))}
                                            <span className="text-[9px] font-bold text-yellow-400/80 ml-1">{shop.rating}</span>
                                        </div>

                                        {/* Eslogan / Especialidad */}
                                        {shop.specialty && (
                                            <p className="text-[8px] font-bold text-white/50 italic tracking-wide leading-tight line-clamp-1">
                                                "{shop.specialty}"
                                            </p>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => {
                                            playNeonClick();
                                            incrementarVisitas(shop.id);
                                            navigate(`/${selectedCategory.slug}/${shop.slug || shop.id}`);
                                        }}
                                        className={`w-full py-4 px-3 text-[11px] text-white font-[1100] uppercase tracking-[0.2em] flex items-center justify-center gap-2 active:scale-95 transition-all border-t animate-pulse
                                            ${activeLocation === 'Monte Grande' ? 'border-violet-400/30 bg-violet-600/30 hover:bg-violet-600/40 shadow-[0_0_15px_rgba(139,92,246,0.3)]' :
                                              activeLocation === 'Luis Guillón' ? 'border-green-400/30 bg-green-600/30 hover:bg-green-600/40 shadow-[0_0_15px_rgba(34,197,94,0.3)]' :
                                              'border-rose-400/30 bg-rose-600/30 hover:bg-rose-600/40 shadow-[0_0_15px_rgba(244,63,94,0.3)]'}
                                        `}
                                    >
                                        <span className={`relative flex h-2 w-2 mr-1`}>
                                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                                                activeLocation === 'Monte Grande' ? 'bg-violet-400' :
                                                activeLocation === 'Luis Guillón' ? 'bg-green-400' :
                                                'bg-rose-400'
                                            }`}></span>
                                            <span className={`relative inline-flex rounded-full h-2 w-2 ${
                                                activeLocation === 'Monte Grande' ? 'bg-violet-400' :
                                                activeLocation === 'Luis Guillón' ? 'bg-green-400' :
                                                'bg-rose-400'
                                            }`}></span>
                                        </span>
                                        <BookOpen size={16} strokeWidth={4} className="text-white drop-shadow-md" />
                                        VER CATÁLOGO
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-12 px-6 text-center glass-card-3d bg-white/5 border-white/10 rounded-3xl mt-4">
                            <MapPin size={32} className="mx-auto text-white/20 mb-3" />
                            <p className="text-[10px] sm:text-[11px] font-black text-white/50 uppercase tracking-widest leading-relaxed">
                                No hay comercios adheridos <br/>en {activeLocation} para {selectedCategory?.name}
                            </p>
                        </div>
                    )}
                </div>

                <div className="pt-8 flex justify-center w-full">
                    <button
                        onClick={() => {
                            playNeonClick();
                            navigate('/');
                        }}
                        className="flex items-center gap-1.5 text-[8px] font-bold text-white/40 uppercase tracking-[0.2em] hover:text-cyan-400 transition-colors active:scale-95"
                    >
                        <ChevronLeft size={12} strokeWidth={3} />
                        Regresar al Inicio
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CategoryPage;
