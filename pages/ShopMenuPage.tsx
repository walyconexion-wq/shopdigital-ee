import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Shop } from '../types';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { playNeonClick } from '../utils/audio';

interface ShopMenuPageProps {
    allShops: Shop[];
}

const ShopMenuPage: React.FC<ShopMenuPageProps> = ({ allShops }) => {
    const { categorySlug, shopSlug } = useParams<{ categorySlug: string; shopSlug: string }>();
    const navigate = useNavigate();

    const selectedShop = allShops.find(
        (s) =>
            s.name.toLowerCase().replace(/\s+/g, '-') === shopSlug &&
            s.category.toLowerCase().replace(/\s+/g, '-') === categorySlug
    );

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    if (!selectedShop) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-6">
                <h2 className="text-xl font-black neon-text-red mb-4">Comercio no encontrado</h2>
                <button onClick={() => navigate(-1)} className="glass-action-btn bg-cyan-950 border border-cyan-500 px-6 py-2 rounded-full">Volver</button>
            </div>
        );
    }

    // Default mock data if no offers (for visual presentation)
    const mockOffers = [
        { id: '1', name: 'Promo Especial 1', description: 'Porción abundante con ingredientes frescos. Calidad premium asegurada para nuestros clientes.', price: 5000, originalPrice: 6500, image: selectedShop.image },
        { id: '2', name: 'Promo Especial 2', description: 'Ideal para compartir, el mejor precio de la zona con envío incluido.', price: 8500, originalPrice: 10000, image: selectedShop.bannerImage },
        { id: '3', name: 'Promo Especial 3', description: 'Nuestra especialidad de la casa, directamente a tu mesa.', price: 12000, originalPrice: 15000, image: selectedShop.galleryImages?.[0] || selectedShop.image },
        { id: '4', name: 'Promo Individual', description: 'Perfecto para una solapersona, date el gusto.', price: 3500, originalPrice: 4200, image: selectedShop.galleryImages?.[1] || selectedShop.bannerImage }
    ];

    const displayOffers = selectedShop.offers && selectedShop.offers.length > 0 ? selectedShop.offers : mockOffers;

    return (
        <div className="min-h-screen bg-black pb-24 animate-in fade-in duration-700">
            <Helmet>
                <title>Menú de {selectedShop.name} - ShopDigital</title>
            </Helmet>

            {/* Header */}
            <div className="relative w-full h-48 bg-black overflow-hidden rounded-b-[2.5rem] shadow-[0_10px_30px_rgba(34,211,238,0.15)] mb-8">
                <img src={selectedShop.bannerImage || selectedShop.image} alt="Banner" className="w-full h-full object-cover opacity-50" />
                <div className="absolute inset-0 bg-gradient-to-t from-cyan-950/90 via-black/50 to-black/80"></div>
                
                <div className="absolute top-6 left-6 z-50">
                    <button 
                        onClick={() => {
                            playNeonClick();
                            navigate(-1);
                        }} 
                        className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white shadow-lg active:scale-95 transition-all"
                    >
                        <ArrowLeft size={18} />
                    </button>
                </div>

                <div className="absolute bottom-6 left-0 w-full px-6 flex flex-col items-center z-50">
                    <div className="w-14 h-14 rounded-full border-2 border-cyan-400 p-0.5 overflow-hidden shadow-[0_0_15px_rgba(34,211,238,0.5)] mb-3 bg-black">
                        <img src={selectedShop.image} alt={selectedShop.name} className="w-full h-full object-cover rounded-full" />
                    </div>
                    <h1 className="text-[16px] font-black uppercase text-white tracking-widest text-shadow-premium text-center drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">
                        {selectedShop.name.replace(/\s*\(.*\)\s*/, '').split('-')[0].trim()}
                    </h1>
                    <div className="flex items-center gap-1.5 mt-1">
                        <ShoppingBag size={10} className="text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]" />
                        <span className="text-[8px] font-bold text-cyan-400 uppercase tracking-[0.3em] drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]">Catálogo Oficial</span>
                    </div>
                </div>
            </div>

            {/* Menu Grid */}
            <div className="px-5 w-full max-w-md mx-auto flex flex-col gap-4">
                {displayOffers.map((offer, idx) => (
                    <div key={`${offer.id}-${idx}`} className="glass-card-3d bg-cyan-950/20 backdrop-blur-md border border-cyan-500/30 rounded-[1.5rem] p-3 flex gap-4 relative overflow-hidden group hover:border-cyan-400 transition-all duration-300">
                        {/* Decorative glow */}
                        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 blur-2xl rounded-full pointer-events-none" />
                        
                        <div className="w-24 h-24 flex-shrink-0 rounded-[1rem] overflow-hidden shadow-lg relative border border-white/10">
                            <img src={offer.image} alt={offer.name} className="w-full h-full object-cover scale-100 group-hover:scale-110 transition-transform duration-700" />
                            <div className="absolute top-1 left-1 bg-cyan-500/90 backdrop-blur-sm text-white text-[6px] font-black px-1.5 py-0.5 rounded-full uppercase shadow-[0_0_10px_rgba(34,211,238,0.5)]">
                                PROMO
                            </div>
                        </div>

                        <div className="flex flex-col justify-center flex-grow py-1 pr-1 z-10 w-full">
                            <h3 className="text-white text-[11px] font-black uppercase tracking-wide leading-tight mb-1">{offer.name}</h3>
                            <p className="text-white/50 text-[8px] leading-snug mb-3 line-clamp-2">{offer.description}</p>
                            
                            <div className="flex items-end justify-between mt-auto w-full">
                                <div className="flex flex-col">
                                    {offer.originalPrice > offer.price && (
                                        <span className="text-white/30 text-[8px] line-through font-bold mb-0.5">${offer.originalPrice.toLocaleString('es-AR')}</span>
                                    )}
                                    <span className="text-cyan-400 text-[14px] font-black drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]">
                                        ${offer.price.toLocaleString('es-AR')}
                                    </span>
                                </div>
                                
                                <button onClick={() => selectedShop.phone && window.open(`https://wa.me/549${selectedShop.phone.replace(/\D/g, '')}?text=Hola!%20Quiero%20pedir%20la%20oferta:%20*${offer.name}*%20por%20$${offer.price}%20desde%20el%20Catálogo%20ShopDigital.`, '_blank')} className="glass-action-btn bg-cyan-500/20 border border-cyan-500/50 w-8 h-8 rounded-full flex items-center justify-center text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.2)] active:scale-90 active:bg-cyan-500 active:text-black transition-all">
                                    <ShoppingBag size={12} strokeWidth={2.5} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="w-full flex justify-center mt-10 opacity-30">
                <span className="text-[7px] text-white tracking-[0.5em] font-black uppercase">POWERED BY SHOPDIGITAL</span>
            </div>
        </div>
    );
};

export default ShopMenuPage;
