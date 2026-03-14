import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shop } from '../types';
import {
    ArrowLeft,
    Search,
    Tag,
    Store,
    Sparkles,
    ShoppingBag
} from 'lucide-react';
import { playNeonClick } from '../utils/audio';

interface ClientOffersPageProps {
    allShops: Shop[];
}

interface GlobalOffer {
    id: string;
    offerId: string;
    name: string;
    price: number;
    image: string;
    shopId: string;
    shopName: string;
    shopCategory: string;
}

const ClientOffersPage: React.FC<ClientOffersPageProps> = ({ allShops }) => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    // Extraer todas las ofertas de todos los comercios activos
    const allOffers = useMemo(() => {
        const offersList: GlobalOffer[] = [];
        allShops.forEach(shop => {
            if (shop.isActive !== false && shop.offers && shop.offers.length > 0) {
                shop.offers.forEach(offer => {
                    offersList.push({
                        id: `${shop.id}-${offer.id}`,
                        offerId: offer.id,
                        name: offer.name,
                        price: offer.price,
                        image: offer.image,
                        shopId: shop.id,
                        shopName: shop.name,
                        shopCategory: shop.category
                    });
                });
            }
        });
        return offersList;
    }, [allShops]);

    // Filtrar ofertas por búsqueda
    const filteredOffers = useMemo(() => {
        if (!searchTerm) return allOffers;
        const lowerSearch = searchTerm.toLowerCase();
        return allOffers.filter(offer => 
            offer.name.toLowerCase().includes(lowerSearch) ||
            offer.shopName.toLowerCase().includes(lowerSearch) ||
            offer.shopCategory.toLowerCase().includes(lowerSearch)
        );
    }, [allOffers, searchTerm]);

    return (
        <div className="min-h-screen bg-black flex flex-col items-center pb-24 animate-in fade-in duration-700 relative overflow-hidden">
            {/* HUD Decorative Elements */}
            <div className="absolute top-20 left-[-10%] w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-20 right-[-10%] w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
            
            {/* Header Premium */}
            <div className="w-full bg-gradient-to-b from-cyan-900/20 to-transparent pt-12 pb-6 px-8 flex flex-col items-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <div className="absolute top-[-50%] left-[-20%] w-[140%] h-[200%] bg-[radial-gradient(circle,rgba(34,211,238,0.2)_0%,transparent_70%)] animate-pulse"></div>
                </div>

                <div className="w-full flex justify-between items-center mb-6 relative z-10 max-w-md mx-auto">
                    <button
                        onClick={() => {
                            playNeonClick();
                            navigate('/');
                        }}
                        className="p-3 rounded-2xl bg-white/5 border border-white/10 text-white backdrop-blur-sm active:scale-95 transition-all hover:bg-white/10"
                    >
                        <ArrowLeft size={20} className="text-cyan-400" />
                    </button>
                    <div className="flex bg-cyan-500/10 px-4 py-2 rounded-full border border-cyan-400/30">
                        <Tag size={14} className="text-cyan-400 mr-2" />
                        <span className="text-[10px] font-black text-cyan-300 uppercase tracking-widest">{allOffers.length} Ofertas Net</span>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-2 relative z-10">
                    <div className="bg-cyan-500/20 p-3 rounded-2xl border border-cyan-500/30 shadow-[0_0_30px_rgba(34,211,238,0.3)] mb-2">
                        <ShoppingBag size={32} className="text-cyan-400" />
                    </div>
                    <h1 className="text-2xl font-[1000] text-white uppercase tracking-[0.2em] text-center text-shadow-premium">
                        Catálogo B2C
                    </h1>
                    <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
                    <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.4em] mt-2">
                        Descuentos para clientes
                    </p>
                </div>
            </div>

            <div className="px-6 w-full max-w-md flex flex-col gap-6 relative z-10">
                
                {/* Search Bar */}
                <div className="relative">
                    <div className="absolute inset-y-0 left-4 flex flex-col justify-center pointer-events-none">
                        <Search size={18} className="text-cyan-400/60" />
                    </div>
                    <input 
                        type="text" 
                        placeholder="Buscar producto o local..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-zinc-900/80 border border-white/10 py-5 pl-12 pr-6 rounded-[2rem] text-sm text-white font-bold placeholder:text-white/20 focus:outline-none focus:border-cyan-400/50 backdrop-blur-md transition-all shadow-inner"
                    />
                </div>

                {/* Ofertas Grid */}
                <div className="grid grid-cols-2 gap-4">
                    {filteredOffers.length > 0 ? (
                        filteredOffers.map((offer, index) => (
                            <div 
                                key={offer.id} 
                                className="glass-card-3d bg-zinc-900/50 rounded-3xl overflow-hidden border border-white/5 flex flex-col group active:scale-[0.98] transition-transform"
                                style={{ animationDelay: `${index * 50}ms`, animation: `fadeUp 0.5s ease-out both` }}
                                onClick={() => {
                                    playNeonClick();
                                    navigate(`/${offer.shopCategory}/${offer.shopId}`);
                                }}
                            >
                                <div className="h-32 w-full relative overflow-hidden bg-black/50">
                                    <img 
                                        src={offer.image} 
                                        alt={offer.name} 
                                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
                                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop' }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent"></div>
                                    <div className="absolute top-2 right-2 bg-cyan-500 backdrop-blur-md px-2 py-1 rounded-lg border border-cyan-400">
                                        <span className="text-[10px] font-black text-black tracking-tighter uppercase relative z-10">Oferta</span>
                                    </div>
                                </div>
                                <div className="p-4 flex flex-col flex-1">
                                    <h3 className="text-[11px] font-black uppercase text-white tracking-widest leading-tight mb-2 line-clamp-2 min-h-[2rem]">
                                        {offer.name}
                                    </h3>
                                    
                                    <div className="flex items-center gap-1.5 mb-3 bg-white/[0.03] p-1.5 rounded-lg border border-white/5">
                                        <Store size={10} className="text-cyan-400 shrink-0" />
                                        <p className="text-[9px] font-bold text-white/60 truncate uppercase tracking-widest">{offer.shopName}</p>
                                    </div>
                                    
                                    <div className="mt-auto flex items-end justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-[8px] text-white/30 uppercase font-black tracking-widest mb-0.5">Precio Especial</span>
                                            <span className="text-lg font-black text-cyan-400 tracking-tighter leading-none">${typeof offer.price === 'number' ? offer.price.toLocaleString('es-AR') : offer.price}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-2 py-12 flex flex-col items-center justify-center bg-white/[0.02] border border-white/5 rounded-3xl">
                            <Sparkles size={32} className="text-cyan-400/20 mb-4" />
                            <p className="text-white/50 text-[11px] uppercase tracking-widest font-black text-center px-4">No se encontraron ofertas con esa búsqueda.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default ClientOffersPage;
