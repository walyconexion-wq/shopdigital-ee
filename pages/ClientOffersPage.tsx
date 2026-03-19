import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Offer } from '../types';
import {
    ArrowLeft,
    Search,
    Tag,
    Store,
    Sparkles,
    ShoppingBag,
    Share2,
    Ticket,
    MapPin,
    Calendar,
    Package,
    Coins
} from 'lucide-react';
import { playNeonClick } from '../utils/audio';

interface ClientOffersPageProps {
    allOffers: Offer[];
}

const ClientOffersPage: React.FC<ClientOffersPageProps> = ({ allOffers }) => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    const activeOffers = useMemo(() => {
        return allOffers.filter(o => o.target === 'B2C' && o.isActive);
    }, [allOffers]);

    const filteredOffers = useMemo(() => {
        if (!searchTerm) return activeOffers;
        const lower = searchTerm.toLowerCase();
        return activeOffers.filter(o =>
            o.title.toLowerCase().includes(lower) ||
            o.merchantName.toLowerCase().includes(lower) ||
            o.category.toLowerCase().includes(lower)
        );
    }, [activeOffers, searchTerm]);

    const handleShareOffer = (offer: Offer) => {
        playNeonClick();
        const text = `🏷️ *${offer.discountLabel}* en *${offer.merchantName}*\n${offer.title}\n\n📍 ${offer.merchantZone}\n🔗 Ver más ofertas: ${window.location.href}`;
        if (navigator.share) {
            navigator.share({ title: offer.title, text, url: window.location.href }).catch(console.error);
        } else {
            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
        }
    };

    return (
        <div className="min-h-screen bg-black flex flex-col items-center pb-24 animate-in fade-in duration-700 relative overflow-hidden">
            <div className="absolute top-20 left-[-10%] w-64 h-64 bg-green-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-20 right-[-10%] w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="w-full bg-gradient-to-b from-green-900/20 to-transparent pt-12 pb-6 px-8 flex flex-col items-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <div className="absolute top-[-50%] left-[-20%] w-[140%] h-[200%] bg-[radial-gradient(circle,rgba(34,197,94,0.2)_0%,transparent_70%)] animate-pulse" />
                </div>

                <div className="w-full flex justify-between items-center mb-6 relative z-10 max-w-md mx-auto">
                    <button onClick={() => { playNeonClick(); navigate('/'); }}
                        className="p-3 rounded-2xl bg-white/5 border border-white/10 text-white backdrop-blur-sm active:scale-95 transition-all hover:bg-white/10">
                        <ArrowLeft size={20} className="text-green-400" />
                    </button>
                    <div className="flex bg-green-500/10 px-4 py-2 rounded-full border border-green-400/30">
                        <Tag size={14} className="text-green-400 mr-2" />
                        <span className="text-[10px] font-black text-green-300 uppercase tracking-widest">{activeOffers.length} Ofertas</span>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-2 relative z-10">
                    <div className="bg-green-500/20 p-3 rounded-2xl border border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.3)] mb-2">
                        <ShoppingBag size={32} className="text-green-400" />
                    </div>
                    <h1 className="text-2xl font-[1000] text-white uppercase tracking-[0.2em] text-center text-shadow-premium">Ofertas VIP</h1>
                    <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-green-500 to-transparent" />
                    <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.4em] mt-2">Descuentos para Clientes</p>
                </div>
            </div>

            <div className="px-6 w-full max-w-md flex flex-col gap-6 relative z-10">
                {/* Search Bar */}
                <div className="relative">
                    <div className="absolute inset-y-0 left-4 flex flex-col justify-center pointer-events-none">
                        <Search size={18} className="text-green-400/60" />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar producto o local..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-zinc-900/80 border border-white/10 py-5 pl-12 pr-6 rounded-[2rem] text-sm text-white font-bold placeholder:text-white/20 focus:outline-none focus:border-green-400/50 backdrop-blur-md transition-all shadow-inner"
                    />
                </div>

                {/* Offers Grid */}
                <div className="flex flex-col gap-5">
                    {filteredOffers.length > 0 ? (
                        filteredOffers.map((offer, idx) => (
                            <div key={offer.id}
                                className="group bg-zinc-900/50 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-xl transition-all"
                                style={{ animationDelay: `${idx * 100}ms` }}>

                                {/* Image */}
                                <div className="relative h-36 overflow-hidden">
                                    {offer.image ? (
                                        <img src={offer.image} alt={offer.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-60" />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-green-900/30 to-zinc-900 flex items-center justify-center">
                                            <Tag size={32} className="text-green-400/20" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/20 to-transparent" />
                                    <div className="absolute top-4 right-4 bg-green-500 backdrop-blur-md px-3 py-1 rounded-full border border-green-400">
                                        <span className="text-[10px] font-black text-black uppercase tracking-tighter">{offer.discountLabel}</span>
                                    </div>
                                    <div className="absolute bottom-4 left-6">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Store size={12} className="text-green-400" />
                                            <h3 className="text-xs font-black text-white uppercase tracking-widest leading-none">{offer.merchantName}</h3>
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-5 pt-3">
                                    <h3 className="text-[14px] font-[1000] text-white uppercase tracking-tighter leading-tight mb-1">{offer.title}</h3>
                                    {offer.description && <p className="text-[10px] text-white/50 mb-3 leading-relaxed">{offer.description}</p>}
                                    {offer.pointsPrice ? (
                                        <div className="flex items-center gap-1.5 mb-3 bg-yellow-500/10 w-fit px-3 py-1.5 rounded-xl border border-yellow-500/20 shadow-[0_0_15px_rgba(250,204,21,0.15)]">
                                            <Coins size={14} className="text-yellow-400" />
                                            <span className="text-[12px] font-[1000] text-yellow-400 tracking-widest uppercase">CANJE: {offer.pointsPrice} PTS</span>
                                        </div>
                                    ) : (
                                        offer.price && <p className="text-lg font-black text-green-400 tracking-tighter mb-3">{offer.price}</p>
                                    )}

                                    {/* Meta */}
                                    <div className="flex flex-wrap gap-1.5 mb-4">
                                        <span className="flex items-center gap-1 text-[7px] font-bold text-white/40 bg-white/5 px-2 py-1 rounded-full"><MapPin size={8} /> {offer.merchantZone}</span>
                                        {offer.validUntil && offer.validUntil !== 'indefinido' && (
                                            <span className="flex items-center gap-1 text-[7px] font-bold text-white/40 bg-white/5 px-2 py-1 rounded-full"><Calendar size={8} /> Hasta {offer.validUntil}</span>
                                        )}
                                        {offer.stockLimit && (
                                            <span className="flex items-center gap-1 text-[7px] font-bold text-orange-400/60 bg-orange-500/10 px-2 py-1 rounded-full"><Package size={8} /> {offer.stockLimit} unidades</span>
                                        )}
                                    </div>

                                    {/* VIP Pass Requirement + Share */}
                                    <div className="flex gap-2">
                                        <div className="flex-1 bg-green-500/10 border border-green-400/30 py-2.5 rounded-xl flex items-center justify-center gap-1.5">
                                            <Ticket size={12} className="text-green-400" />
                                            <span className="text-[8px] font-black text-green-300 uppercase tracking-widest">Presentar Pase VIP</span>
                                        </div>
                                        <button onClick={() => handleShareOffer(offer)}
                                            className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-green-400 hover:border-green-400/30 active:scale-95 transition-all">
                                            <Share2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-12 flex flex-col items-center justify-center bg-white/[0.02] border border-white/5 rounded-3xl">
                            <Sparkles size={32} className="text-green-400/20 mb-4" />
                            <p className="text-white/50 text-[11px] uppercase tracking-widest font-black text-center px-4">
                                {searchTerm ? 'No se encontraron ofertas con esa búsqueda.' : 'Próximamente ofertas exclusivas para clientes VIP.'}
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="mt-6 flex flex-col items-center gap-4">
                    <button onClick={() => { playNeonClick(); navigate('/'); }}
                        className="glass-action-btn btn-neon-delicate px-8 py-3 rounded-full flex items-center gap-2">
                        <ArrowLeft size={14} className="text-white" />
                        <span className="text-[9px] font-black text-white uppercase tracking-widest">Regresar</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ClientOffersPage;
