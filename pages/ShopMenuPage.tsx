import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Shop } from '../types';
import { ArrowLeft, ShoppingBag, Store, MapPin } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { playNeonClick } from '../utils/audio';
import { CyberCircuitBackground } from '../components/CyberCircuitBackground';

interface ShopMenuPageProps {
    allShops: Shop[];
}

const ShopMenuPage: React.FC<ShopMenuPageProps> = ({ allShops }) => {
    const { townId = 'esteban-echeverria', categorySlug, shopSlug } = useParams<{ townId: string; categorySlug: string; shopSlug: string }>();
    const navigate = useNavigate();

    const selectedShop = allShops.find(
        (s) => (s.slug || s.id) === shopSlug
    );

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    if (!selectedShop) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-transparent text-[#2c2440]">
                <CyberCircuitBackground />
                <div className="neu-plate p-8 max-w-xs text-center z-10">
                    <h2 className="text-sm font-black mb-3 uppercase tracking-wider text-[#2c2440]">Comercio no encontrado</h2>
                    <button 
                        onClick={() => { playNeonClick(); navigate(-1); }} 
                        className="neu-btn-3d px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest text-[#2c2440]"
                    >
                        Volver
                    </button>
                </div>
            </div>
        );
    }

    // Default mock data if no offers (for visual presentation)
    const mockOffers = [
        { id: '1', name: 'Promo Especial 1', description: 'Porción abundante con ingredientes frescos. Calidad premium asegurada para nuestros clientes.', price: 5000, originalPrice: 6500, image: selectedShop.image },
        { id: '2', name: 'Promo Especial 2', description: 'Ideal para compartir, el mejor precio de la zona con envío incluido.', price: 8500, originalPrice: 10000, image: selectedShop.bannerImage },
        { id: '3', name: 'Promo Especial 3', description: 'Nuestra especialidad de la casa, directamente a tu mesa.', price: 12000, originalPrice: 15000, image: selectedShop.galleryImages?.[0] || selectedShop.image },
        { id: '4', name: 'Promo Individual', description: 'Perfecto para una sola persona, date el gusto.', price: 3500, originalPrice: 4200, image: selectedShop.galleryImages?.[1] || selectedShop.bannerImage }
    ];

    const displayOffers = selectedShop.offers && selectedShop.offers.length > 0 ? selectedShop.offers : mockOffers;

    return (
        <div className="min-h-screen pb-24 animate-in fade-in duration-700 relative bg-transparent text-[#2c2440]">
            <CyberCircuitBackground />

            <Helmet>
                <title>Menú de {selectedShop.name} - ShopDigital</title>
            </Helmet>

            {/* Header Banner Neumórfico Crema HD */}
            <div className="w-full max-w-sm mx-auto px-4 pt-4 relative z-20 mb-6">
                <div className="neu-plate p-4 w-full flex flex-col items-center gap-3">
                    {/* Botón Volver y Título */}
                    <div className="w-full flex items-center justify-between">
                        <button 
                            onClick={() => {
                                playNeonClick();
                                navigate(-1);
                            }} 
                            className="w-9 h-9 flex items-center justify-center neu-btn-pod rounded-2xl cursor-pointer transition-transform active:scale-90"
                            title="Volver"
                        >
                            <ArrowLeft size={16} className="text-[#2c2440]" strokeWidth={3} />
                        </button>

                        <div className="neu-inset-title py-1.5 px-4 flex-1 mx-2 text-center">
                            <h1 className="text-[12px] font-black uppercase tracking-wider text-[#2c2440] truncate">
                                {selectedShop.name.replace(/\s*\(.*\)\s*/, '').split('-')[0].trim()}
                            </h1>
                            <div className="flex items-center justify-center gap-1 mt-0.5">
                                <ShoppingBag size={9} className="text-[#ff6b6b]" />
                                <span className="text-[7.5px] font-extrabold uppercase tracking-widest text-[#4a3d6a]">
                                    Catálogo Oficial
                                </span>
                            </div>
                        </div>

                        <div className="w-9 h-9 flex items-center justify-center neu-btn-pod rounded-2xl shrink-0 overflow-hidden p-0.5">
                            <img src={selectedShop.image} alt={selectedShop.name} className="w-full h-full object-cover rounded-xl" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Menu Grid */}
            <div className="px-4 w-full max-w-sm mx-auto flex flex-col gap-3 relative z-10">
                {displayOffers.map((offer, idx) => (
                    <div 
                        key={`${offer.id}-${idx}`} 
                        className="neu-plate p-3.5 w-full flex gap-3.5 items-center relative group transition-all"
                    >
                        <div className="w-20 h-20 flex-shrink-0 rounded-2xl overflow-hidden relative border border-[#b4a594]/30 shadow-md">
                            <img src={offer.image} alt={offer.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute top-1 left-1 text-[6.5px] font-black px-1.5 py-0.5 rounded-full uppercase bg-[#ff6b6b] text-white shadow-sm">
                                PROMO
                            </div>
                        </div>

                        <div className="flex flex-col justify-between flex-grow py-0.5 pr-1 z-10 w-full min-h-[75px]">
                            <div>
                                <h3 className="text-[11px] font-black uppercase tracking-tight text-[#2c2440] leading-tight mb-1">
                                    {offer.name}
                                </h3>
                                
                                <p className="text-[8px] leading-snug line-clamp-2 text-[#4a3d6a]/80 font-bold mb-2">
                                    {offer.description}
                                </p>
                            </div>
                            
                            <div className="flex items-center justify-between mt-auto w-full pt-1 border-t border-[#b4a594]/15">
                                <div className="flex items-baseline gap-1.5">
                                    <span className="text-[13px] font-[1000] text-[#2c2440]">
                                        ${offer.price.toLocaleString('es-AR')}
                                    </span>
                                    {offer.originalPrice > offer.price && (
                                        <span className="text-[8px] line-through font-bold text-[#4a3d6a]/50">
                                            ${offer.originalPrice.toLocaleString('es-AR')}
                                        </span>
                                    )}
                                </div>
                                
                                <button 
                                    onClick={() => selectedShop.phone && window.open(`https://wa.me/549${selectedShop.phone.replace(/\D/g, '')}?text=Hola!%20Quiero%20pedir%20la%20oferta:%20*${offer.name}*%20por%20$${offer.price}%20desde%20el%20Catálogo%20ShopDigital.`, '_blank')} 
                                    className="neu-btn-3d-active py-1.5 px-3 rounded-xl flex items-center justify-center gap-1.5 text-[8px] font-black uppercase tracking-wider text-[#2c2440] active:scale-95 transition-transform cursor-pointer"
                                >
                                    <ShoppingBag size={11} className="text-[#ff6b6b]" strokeWidth={2.5} />
                                    <span>Pedir</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Pie de Marca */}
            <div className="w-full flex justify-center mt-8 opacity-40 relative z-10">
                <span className="text-[7.5px] tracking-[0.35em] font-black uppercase text-[#2c2440]">
                    © 2026 · SHOPDIGITAL RED DIGITAL
                </span>
            </div>
        </div>
    );
};

export default ShopMenuPage;
