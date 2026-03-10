import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CATEGORIES } from '../constants';
import { Shop } from '../types';
import { ChevronLeft, MapPin, Star, BookOpen, ArrowLeft } from 'lucide-react';

interface CategoryPageProps {
    allShops: Shop[];
}

const LOCALITIES = ['Monte Grande', 'Luis Guillón', 'El Jagüel'];

const CategoryPage: React.FC<CategoryPageProps> = ({ allShops }) => {
    const { categorySlug } = useParams<{ categorySlug: string }>();
    const navigate = useNavigate();

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
                shop.isActive !== false &&
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
                <button onClick={() => navigate('/')} className="mt-4 text-cyan-400 font-bold uppercase tracking-widest text-[10px]">Volver al inicio</button>
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
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={() => navigate('/')}
                            className="btn-cyan-neon px-5 py-2.5 rounded-full flex items-center gap-2 border-cyan-400/50 active:scale-95 transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)] bg-cyan-500/10"
                        >
                            <ChevronLeft size={18} strokeWidth={4} className="text-cyan-400" />
                            <span className="text-[10px] font-[1000] text-white uppercase tracking-[0.2em] text-shadow-premium">Regresar</span>
                        </button>
                    </div>

                    <div className="flex justify-center w-full px-2">
                        <div className="glass-header rounded-3xl w-full py-6 flex flex-col items-center border-cyan-400/50 shadow-[0_15px_40px_rgba(34,211,238,0.4)] bg-gradient-to-br from-cyan-500/20 to-slate-900/60">
                            <h2 className="text-[24px] font-[900] text-white uppercase tracking-[0.3em] leading-none text-center drop-shadow-[0_0_15px_rgba(34,211,238,0.8)] mb-3">
                                {selectedCategory.name}
                            </h2>
                            <div className="h-[1px] w-20 bg-cyan-400/60 mb-3 shadow-[0_0_10px_rgba(34,211,238,0.8)]"></div>
                            <p className="text-[9.5px] font-bold text-white/90 uppercase tracking-[0.15em] leading-tight text-center px-8">
                                Seleccioná tu comercio y descubrí ofertas magníficas
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex flex-col gap-10 px-2 pt-4 pb-24 relative z-10">
                {LOCALITIES.map((locality) => (
                    <div key={locality} className="flex flex-col gap-6">
                        <div className="flex items-center gap-3 ml-2">
                            <div className="w-8 h-8 rounded-full bg-cyan-500/10 backdrop-blur-md border border-cyan-400/30 flex items-center justify-center shadow-lg">
                                <MapPin size={16} className="text-cyan-400" />
                            </div>
                            <h3 className="text-[12px] font-black text-white uppercase tracking-[0.4em] text-shadow-premium">
                                {locality}
                            </h3>
                            <div className="h-[1px] flex-1 bg-cyan-400/10"></div>
                        </div>

                        {groupedShops[locality] && groupedShops[locality].length > 0 ? (
                            groupedShops[locality].map((shop, index) => (
                                <div
                                    key={shop.id}
                                    style={{ animationDelay: `${index * 80}ms` }}
                                    className={`glass-card-3d ${locality === 'Monte Grande' ? 'card-neon-violet' : locality === 'Luis Guillón' ? 'card-neon-green' : 'card-neon-red'} overflow-hidden flex flex-row cursor-default fade-up-item w-full items-stretch h-[170px]`}
                                >
                                    <div className="relative w-32 shop-image-wrapper flex-shrink-0 overflow-hidden border-r border-white/20">
                                        <img src={shop.bannerImage} alt={shop.name} className="w-full h-full object-cover transition-transform duration-1000 hover:scale-110" />
                                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full border border-white/20 shadow-xl">
                                            <div className="flex items-center gap-1">
                                                <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                                                <span className="text-[10px] font-black text-white">{shop.rating}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex-1 flex flex-col justify-between p-4 text-left min-w-0 bg-white/[0.04]">
                                        <div className="space-y-1.5 overflow-hidden">
                                            <h3 className="font-[1000] text-[19px] shop-title-text text-white uppercase tracking-tighter leading-none text-shadow-premium">
                                                {shop.name.replace(/\s*\(.*\)\s*/, '').split('-')[0].trim()}
                                            </h3>
                                            <div className="flex items-start gap-1 pb-1 text-white/80 shop-address-sub uppercase text-[10px] font-bold tracking-tight leading-snug overflow-hidden">
                                                <MapPin size={12} strokeWidth={3} className="flex-shrink-0 mt-0.5 text-cyan-400/80" />
                                                <span className="break-words line-clamp-2">{shop.address}</span>
                                            </div>
                                        </div>

                                        <div className="mt-4 flex flex-col gap-3">
                                            <button
                                                onClick={() => navigate(`/${selectedCategory.slug}/${shop.slug || shop.id}`)}
                                                className="glass-action-btn btn-offers-glow pulse-3d-btn w-full shop-btn-mobile py-4 px-3 text-[11px] font-[1100] uppercase tracking-[0.2em] flex items-center justify-center gap-2 active:scale-95 transition-all shadow-2xl"
                                            >
                                                <BookOpen size={16} strokeWidth={4} className="text-white drop-shadow-md" />
                                                VER CATÁLOGO
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-8 text-center">
                                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                                    No hay comercios disponibles en esta zona
                                </p>
                            </div>
                        )}
                    </div>
                ))}

                <div className="pt-10 flex justify-center w-full">
                    <button
                        onClick={() => navigate('/')}
                        className="glass-action-btn btn-cyan-neon w-max py-3 px-8 uppercase tracking-[0.2em] flex items-center justify-center gap-3 mx-auto active:scale-95 transition-all group shadow-[0_0_30px_rgba(34,211,238,0.2)] border-cyan-400/40"
                    >
                        <div className="bg-cyan-500/10 p-1.5 rounded-full group-hover:scale-110 transition-transform">
                            <ArrowLeft size={18} strokeWidth={3} className="text-cyan-400" />
                        </div>
                        <span className="text-[11px] font-black text-white">Regresar al Inicio</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CategoryPage;
