import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ENTERPRISE_CATEGORIES } from '../enterpriseConstants';
import { Shop } from '../types';
import { ChevronLeft, Factory, MapPin, Star, BookOpen, ArrowLeft, Globe, Landmark } from 'lucide-react';
import { playNeonClick } from '../utils/audio';

interface EnterpriseCategoryPageProps {
    allShops: Shop[];
}

// Filtros de Alcance Industrial 🌍
const REACH_FILTERS = [
    { id: 'all', label: 'Todos', icon: <Globe size={14} /> },
    { id: 'national', label: 'Nacional', icon: <Globe size={14} /> },
    { id: 'regional', label: 'Regional', icon: <Landmark size={14} /> },
];

const EnterpriseCategoryPage: React.FC<EnterpriseCategoryPageProps> = ({ allShops }) => {
    const { townId = 'esteban-echeverria', categorySlug } = useParams<{ townId: string; categorySlug: string }>();
    const navigate = useNavigate();
    const [activeReach, setActiveReach] = useState('all');

    const selectedCategory = useMemo(() =>
        ENTERPRISE_CATEGORIES.find(cat => cat.slug === categorySlug),
        [categorySlug]);

    // Filtrar empresas: entityType === 'enterprise' + categoría coincidente
    const filteredEnterprises = useMemo(() => {
        if (!selectedCategory) return [];
        return allShops.filter(shop => {
            const isEnterprise = shop.entityType === 'enterprise';
            const categoryMatch =
                shop.category === selectedCategory.id ||
                shop.category === selectedCategory.slug;
            const reachMatch = activeReach === 'all' || shop.reach === activeReach;
            return isEnterprise && categoryMatch && reachMatch;
        });
    }, [selectedCategory, allShops, activeReach]);

    if (!selectedCategory) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-white min-h-screen">
                <Factory size={48} className="text-amber-400/30 mb-4" />
                <p className="text-white/50 uppercase tracking-widest text-[10px] font-black">Sector Industrial no encontrado</p>
                <button onClick={() => { playNeonClick(); navigate(`/${townId}/empresas`); }} className="mt-4 text-amber-400 font-bold uppercase tracking-widest text-[10px]">Volver al Directorio</button>
            </div>
        );
    }

    const formattedTown = townId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    return (
        <div className="flex flex-col animate-in slide-in-from-bottom-6 duration-700 relative overflow-hidden min-h-screen bg-transparent pb-10">
            {/* HUD Background Industrial */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-40 right-[-10%] w-72 h-72 bg-amber-500/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-40 left-[-10%] w-72 h-72 bg-orange-500/5 rounded-full blur-[100px]" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(245,158,11,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(245,158,11,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
            </div>

            {/* Header */}
            <header className="bg-transparent pt-4 flex-shrink-0 flex flex-col items-center relative z-10">
                <div className="w-full px-6 flex flex-col pb-4">
                    <button
                        onClick={() => { playNeonClick(); navigate(`/${townId}/empresas`); }}
                        className="absolute top-6 left-5 z-[60] w-10 h-10 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-md border border-amber-500/20 active:scale-90 transition-all hover:bg-black/50 shadow-lg"
                    >
                        <ArrowLeft size={22} className="text-amber-400 drop-shadow-md pr-0.5" />
                    </button>

                    <div className="flex justify-center w-full px-2">
                        <div className="glass-header rounded-3xl w-full py-3 px-5 flex flex-col items-center border backdrop-blur-md border-amber-500/30 bg-gradient-to-br from-amber-500/15 to-orange-600/10 shadow-[0_15px_40px_rgba(245,158,11,0.2)]">
                            <p className="text-[8px] font-black text-amber-400/60 uppercase tracking-widest mb-1 italic">ADN {formattedTown}</p>
                            <div className="flex items-center gap-2 mb-2">
                                <Factory size={18} className="text-amber-400" />
                                <h2 className="text-[18px] font-[900] text-white uppercase tracking-[0.15em] leading-none text-center drop-shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                                    {selectedCategory.name}
                                </h2>
                            </div>
                            <div className="h-[1px] w-16 mb-2 bg-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                            <p className="text-[8.5px] font-bold text-white/70 uppercase tracking-[0.15em] text-center">
                                Encontrá tu proveedor industrial ideal
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex flex-col gap-6 px-4 pt-4 relative z-10">
                {/* Filtros de Alcance */}
                <div className="flex gap-2 w-full justify-center px-2 mb-2">
                    {REACH_FILTERS.map((filter) => {
                        const isActive = activeReach === filter.id;
                        return (
                            <button
                                key={filter.id}
                                onClick={() => { playNeonClick(); setActiveReach(filter.id); }}
                                className={`flex-1 min-w-[80px] py-3 px-2 rounded-2xl border flex items-center justify-center gap-1.5 transition-all duration-300 active:scale-95
                                    ${isActive
                                        ? 'bg-amber-500/20 border-amber-500 text-white shadow-[0_0_20px_rgba(245,158,11,0.3)] scale-105 z-10'
                                        : 'border-white/10 text-white/40 bg-white/5 hover:bg-white/10'
                                    }`}
                            >
                                <span className={isActive ? 'text-amber-400' : 'text-white/30'}>{filter.icon}</span>
                                <span className={`text-[9px] font-[1000] uppercase tracking-widest ${isActive ? 'text-shadow-premium' : ''}`}>
                                    {filter.label}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Tarjetas de Empresa */}
                {filteredEnterprises.length > 0 ? (
                    <div className="flex flex-col gap-5">
                        {filteredEnterprises.map((enterprise, index) => (
                            <div
                                key={enterprise.id}
                                style={{ animationDelay: `${index * 80}ms` }}
                                className="glass-card-3d overflow-hidden flex flex-row cursor-default fade-up-item w-full items-stretch h-[180px] border-amber-500/20"
                            >
                                {/* Imagen */}
                                <div className="relative w-32 flex-shrink-0 overflow-hidden border-r border-amber-500/20">
                                    <img
                                        src={enterprise.bannerImage || enterprise.image}
                                        alt={enterprise.name}
                                        className="w-full h-full object-cover transition-transform duration-1000 hover:scale-110"
                                    />
                                    {/* Badge de Alcance */}
                                    <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-[7px] font-black uppercase tracking-widest border backdrop-blur-md
                                        ${enterprise.reach === 'national' ? 'bg-amber-500/30 border-amber-500/50 text-amber-300' : 'bg-white/10 border-white/20 text-white/60'}`}>
                                        {enterprise.reach === 'national' ? '🌎 Nacional' : enterprise.reach === 'regional' ? '📍 Regional' : '📍 Local'}
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="flex-1 flex flex-col justify-between text-left min-w-0 bg-white/[0.04]">
                                    <div className="space-y-1.5 overflow-hidden p-4 pb-2">
                                        <h3 className="font-[1000] text-[17px] text-white uppercase tracking-tighter leading-none text-shadow-premium">
                                            {enterprise.name}
                                        </h3>
                                        {enterprise.zone && (
                                            <div className="flex items-start gap-1 text-amber-400/70 uppercase text-[9px] font-bold tracking-tight">
                                                <MapPin size={11} strokeWidth={3} className="flex-shrink-0 mt-0.5" />
                                                <span>{enterprise.zone}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1 mt-1">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <Star key={star} size={10} className={`${star <= Math.round(enterprise.rating) ? 'fill-amber-400 text-amber-400' : 'fill-transparent text-white/20'}`} />
                                            ))}
                                            <span className="text-[8px] font-bold text-amber-400/80 ml-1">{enterprise.rating}</span>
                                        </div>
                                        {enterprise.specialty && (
                                            <p className="text-[8px] font-bold text-white/40 italic tracking-wide leading-tight line-clamp-1">"{enterprise.specialty}"</p>
                                        )}
                                    </div>

                                    <div className="w-full flex justify-center py-3 px-4">
                                        <button
                                            onClick={() => { playNeonClick(); navigate(`/${townId}/empresas/${selectedCategory.slug}/${enterprise.slug || enterprise.id}`); }}
                                            className="py-2.5 px-6 text-[9px] text-white font-[1100] uppercase tracking-[0.25em] flex items-center justify-center gap-2 transition-all duration-75 rounded-full border backdrop-blur-md active:translate-y-[2px] border-amber-400/50 bg-amber-600/30 shadow-[0_4px_0_rgba(245,158,11,0.5)]"
                                        >
                                            <BookOpen size={14} strokeWidth={3} className="text-white drop-shadow-md" />VER CATÁLOGO
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-16 px-6 text-center glass-card-3d bg-white/5 border-amber-500/10 rounded-3xl">
                        <Factory size={36} className="mx-auto text-amber-500/20 mb-4" />
                        <p className="text-[10px] font-black text-white/50 uppercase tracking-widest leading-relaxed">
                            No hay proveedores adheridos<br />en {selectedCategory?.name}
                        </p>
                        <p className="text-[8px] text-white/30 uppercase tracking-widest mt-3">
                            Próximamente se inyectarán empresas testigo
                        </p>
                    </div>
                )}

                {/* Botón Regresar */}
                <div className="w-full flex justify-center mb-8 mt-4">
                    <button
                        onClick={() => { playNeonClick(); navigate(`/${townId}/empresas`); }}
                        className="glass-action-btn backdrop-blur-md border w-max py-2.5 px-6 rounded-full flex items-center gap-2 shadow-lg active:translate-y-[2px] transition-all bg-amber-500/15 border-amber-500/30 text-amber-400"
                    >
                        <ArrowLeft size={16} /><span className="text-[10px] font-[1100] uppercase tracking-widest">Regresar</span>
                    </button>
                </div>
            </div>

            {/* Footer */}
            <footer className="w-full flex flex-col items-center gap-2 pt-6 pb-6 mt-auto border-t border-amber-500/10 relative z-10">
                <p className="text-[9px] font-black text-white uppercase tracking-[0.35em] text-center select-none">© 2026 · ShopDigital</p>
                <p className="text-[8px] font-bold text-amber-400 uppercase tracking-[0.25em] text-center select-none" style={{ textShadow: '0 0 10px rgba(245,158,11,0.5)' }}>
                    🏭 Nodo Empresarial B2B
                </p>
            </footer>
        </div>
    );
};

export default EnterpriseCategoryPage;
