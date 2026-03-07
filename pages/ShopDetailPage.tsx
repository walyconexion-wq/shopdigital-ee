import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Shop } from '../types';
import {
    Share2,
    MapPin,
    BookOpen,
    ShoppingBag,
    Lock,
    MessageCircle,
    Handshake,
    Navigation,
    Car,
    Facebook,
    Instagram,
    Music,
    ArrowLeft
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';

interface ShopDetailPageProps {
    allShops: Shop[];
}

const ShopDetailPage: React.FC<ShopDetailPageProps> = ({ allShops }) => {
    const { categorySlug, shopSlug } = useParams<{ categorySlug: string; shopSlug: string }>();
    const navigate = useNavigate();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const catalogRef = useRef<HTMLDivElement>(null);

    const selectedShop = useMemo(() =>
        allShops.find(shop => (shop.slug || shop.id) === shopSlug),
        [shopSlug, allShops]);

    useEffect(() => {
        if (selectedShop) {
            const gallery = selectedShop.galleryImages && selectedShop.galleryImages.length > 0
                ? selectedShop.galleryImages
                : [selectedShop.bannerImage, selectedShop.image, selectedShop.offers[0]?.image].filter(Boolean) as string[];

            if (gallery.length > 1) {
                const timer = setInterval(() => {
                    setCurrentImageIndex((prev) => (prev + 1) % gallery.length);
                }, 6000);
                return () => clearInterval(timer);
            }
        }
        return undefined;
    }, [selectedShop]);

    const scrollToCatalog = () => {
        catalogRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleShare = () => {
        const appUrl = window.location.href;
        const shopName = selectedShop?.name || 'shopdigital.ar';
        const shareTitle = `${shopName} - Catálogo Online`;
        const shareDescription = `Te comparto el catálogo de *${shopName}* desde la App de Waly 🚀`;
        const shareText = `${shareDescription}\n\n👉 ${appUrl}`;

        if (navigator.share) {
            navigator.share({
                title: shareTitle,
                text: shareText,
                url: appUrl,
            }).catch(console.error);
        } else {
            const whatsappText = encodeURIComponent(shareText);
            window.open(`https://wa.me/?text=${whatsappText}`, '_blank', 'noopener,noreferrer');
        }
    };

    const handleOpenLink = (url: string | null) => {
        if (url) {
            window.open(url, '_blank', 'noopener,noreferrer');
        } else {
            alert('Función próximamente disponible');
        }
    };

    if (!selectedShop) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-white">
                <p>Comercio no encontrado</p>
                <button onClick={() => navigate('/')} className="mt-4 text-cyan-400 font-bold uppercase tracking-widest text-[10px]">Volver al inicio</button>
            </div>
        );
    }

    const gallery = selectedShop.galleryImages && selectedShop.galleryImages.length > 0
        ? selectedShop.galleryImages
        : [selectedShop.bannerImage, selectedShop.image, selectedShop.offers[0]?.image].filter(Boolean) as string[];

    return (
        <div className="pb-24 animate-in fade-in duration-700">
            <Helmet>
                <title>{selectedShop.name} - Catálogo de Ofertas</title>
                <meta name="description" content={`Mirá nuestro menú digital de ${selectedShop.specialty || 'gastronomía'} en nuestra app. Pedidos directos por WhatsApp.`} />

                {/* Facebook / OG */}
                <meta property="og:type" content="website" />
                <meta property="og:title" content={`${selectedShop.name} - Catálogo de Ofertas`} />
                <meta property="og:description" content={`Mirá nuestro menú digital de ${selectedShop.specialty || 'gastronomía'} en nuestra app. Pedidos directos por WhatsApp.`} />
                <meta property="og:image" content={selectedShop.bannerImage || selectedShop.image} />

                {/* Twitter */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={`${selectedShop.name} - Catálogo de Ofertas`} />
                <meta name="twitter:description" content={`Mirá nuestro menú digital de ${selectedShop.specialty || 'gastronomía'} en nuestra app. Pedidos directos por WhatsApp.`} />
                <meta name="twitter:image" content={selectedShop.bannerImage || selectedShop.image} />
            </Helmet>

            <div className="relative w-full h-[260px] bg-[#0A224E] overflow-hidden">
                {gallery.map((img, idx) => (
                    <img
                        key={idx}
                        src={img}
                        alt={`Cover ${idx}`}
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[2000ms] ease-in-out ${idx === currentImageIndex ? 'opacity-65' : 'opacity-0'}`}
                    />
                ))}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A224E] via-[#0A224E]/20 to-transparent"></div>

                <div className="absolute top-5 left-1/2 -translate-x-1/2 z-50 pointer-events-none w-[90%] flex flex-col items-center">
                    <h1 className="impact-title neon-flicker text-[28px] drop-shadow-[0_0_20px_rgba(255,255,255,0.7)] text-white text-center">
                        {selectedShop.name.replace(/\s*\(.*\)\s*/, '').split('-')[0].trim()}
                    </h1>
                    <div className="flex items-center gap-1.5 mt-1 opacity-90">
                        <MapPin size={10} className="text-red-400" strokeWidth={3} />
                        <span className="text-[8.5px] font-black uppercase tracking-[0.3em] text-white/80 text-shadow-premium">
                            {selectedShop.zone || 'Esteban Echeverría'}
                        </span>
                    </div>
                    <div className="w-12 h-[1px] bg-white/40 mx-auto mt-2.5 shadow-[0_0_10px_rgba(255,255,255,0.6)]"></div>
                </div>

                <div className="absolute inset-0 flex flex-col justify-end pb-6 px-6">
                    <div className="flex justify-center w-full">
                        <button
                            onClick={scrollToCatalog}
                            className="glass-action-btn btn-offers-glow luminous-glow px-4 py-2 rounded-2xl flex items-center justify-center gap-2.5 z-40 shadow-xl active:scale-95 group"
                        >
                            <BookOpen size={14} strokeWidth={3} className="text-white group-hover:scale-110 transition-transform" />
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white">Ver catálogo</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="relative z-10 flex flex-col items-center">
                <div ref={catalogRef} className="w-full mb-10 mt-8">
                    <div className="flex flex-col items-center mb-8 px-6">
                        <div className="flex items-center gap-2">
                            <ShoppingBag size={14} className="text-cyan-400" />
                            <h3 className="neon-text-cyan font-black text-[10px] uppercase tracking-[0.4em]">Catálogo de Ofertas</h3>
                        </div>
                        <div className="h-[1px] w-6 bg-white/10 mt-3"></div>
                    </div>

                    <div className="overflow-hidden w-full">
                        <div className="animate-delicate-marquee flex gap-4 px-4">
                            {[...selectedShop.offers, ...selectedShop.offers].map((offer, idx) => (
                                <div key={`${offer.id}-${idx}`} className="glass-card-3d offer-card-neon flex-shrink-0 w-44 p-3.5 flex flex-col">
                                    <div className="rounded-2xl overflow-hidden aspect-square mb-3.5 border border-white/20 shadow-xl relative">
                                        <img src={offer.image} alt={offer.name} className="w-full h-full object-cover" />
                                        <div className="absolute top-2 right-2 bg-cyan-500/80 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full uppercase">Oferta</div>
                                    </div>
                                    <div className="px-1 pb-1 text-center">
                                        <p className="text-[10px] font-black uppercase tracking-tight text-white mb-3.5 line-clamp-1">{offer.name}</p>
                                        <div className="glass-action-btn offer-price-tag py-2 px-3 rounded-xl">
                                            <span className="text-[12.5px] font-black text-white">$ {offer.price.toLocaleString('es-AR')}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="w-full px-4 mb-12 grid grid-cols-3 gap-3">
                    <button onClick={() => handleOpenLink('https://www.pedidosya.com.ar/')} className="glass-action-btn btn-py py-5 flex flex-col items-center justify-center gap-1.5 font-black text-white">
                        <span className="italic text-[22px] text-red-500">P</span>
                        <span className="text-[9px] tracking-wider uppercase">PedidosYa</span>
                    </button>
                    <button onClick={() => selectedShop.phone && handleOpenLink(`https://wa.me/549${selectedShop.phone.replace(/\D/g, '')}?text=Hola!%20Vengo%20de%20la%20App%20de%20Waly`)} className="glass-action-btn btn-wa py-5 flex flex-col items-center justify-center gap-1.5 font-black text-white">
                        <MessageCircle size={20} className="text-[#25D366]" fill="currentColor" strokeWidth={0} />
                        <span className="text-[9px] tracking-wider uppercase">WhatsApp</span>
                    </button>
                    <button onClick={() => handleOpenLink('https://www.mercadopago.com.ar/')} className="glass-action-btn btn-mp py-5 flex flex-col items-center justify-center gap-1.5 font-black text-white">
                        <Handshake size={20} className="text-[#009EE3]" strokeWidth={3} />
                        <span className="text-[9px] tracking-wider uppercase">M. Pago</span>
                    </button>
                </div>

                {/* Map Section */}
                <div className="w-full px-6 mb-12">
                    <div className="map-glow-container w-full h-80 overflow-hidden bg-black/20 relative mb-8 shadow-2xl">
                        <iframe
                            title="Ubicación"
                            src={selectedShop.mapUrl}
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen={false}
                            loading="lazy"
                        ></iframe>
                    </div>
                    <div className="mt-2 text-center px-4 mb-10">
                        <p className="neon-text-white text-[11px] font-[1000] uppercase tracking-[0.35em] text-white">
                            {selectedShop.address}
                        </p>
                    </div>

                    <div className="flex flex-col gap-4 w-full">
                        <div className="grid grid-cols-3 gap-3">
                            <button onClick={() => selectedShop.facebook && handleOpenLink(selectedShop.facebook)} className="glass-action-btn btn-fb py-4 flex flex-col items-center justify-center gap-1.5 text-white">
                                <Facebook size={20} className="text-[#1877F2]" fill="currentColor" strokeWidth={0} />
                                <span className="text-[8px] font-black uppercase tracking-tighter">Facebook</span>
                            </button>
                            <button onClick={() => selectedShop.instagram && handleOpenLink(selectedShop.instagram)} className="glass-action-btn btn-ig py-4 flex flex-col items-center justify-center gap-1.5 text-white">
                                <Instagram size={20} className="text-[#E4405F]" strokeWidth={2.5} />
                                <span className="text-[8px] font-black uppercase tracking-tighter">Instagram</span>
                            </button>
                            <button onClick={() => selectedShop.tiktok && handleOpenLink(selectedShop.tiktok)} className="glass-action-btn btn-tk py-4 flex flex-col items-center justify-center gap-1.5 text-white">
                                <Music size={20} className="text-white" strokeWidth={2.5} />
                                <span className="text-[8px] font-black uppercase tracking-tighter">TikTok</span>
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => handleOpenLink(selectedShop.mapSheetUrl || '#')} className="glass-action-btn btn-violet py-4 flex items-center justify-center gap-3 text-white"><Navigation size={18} /><span className="text-[10px] font-black uppercase">Cómo llegar</span></button>
                            <button onClick={() => handleOpenLink('https://m.uber.com/ul/')} className="glass-action-btn bg-black/60 py-4 flex items-center justify-center gap-3 text-white"><Car size={18} /><span className="text-[10px] font-black uppercase">Uber</span></button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-4 w-full px-8 pb-12">
                    <button onClick={handleShare} className="glass-action-btn btn-green py-4 flex items-center justify-center gap-3 text-white"><Share2 size={20} /><span className="text-[10px] font-black uppercase">Compartir Catálogo</span></button>
                    <button onClick={() => navigate(`/${categorySlug}/${shopSlug}/panel-autogestion`)} className="flex items-center justify-center gap-2 text-white/20 hover:text-white/40"><Lock size={12} /><span className="text-[8px] font-bold uppercase">Gestión</span></button>
                </div>

                <button onClick={() => navigate(`/${categorySlug}`)} className="glass-action-btn btn-neon-delicate w-max py-2 px-5 mb-12 flex items-center gap-2 text-white"><ArrowLeft size={16} /><span className="text-[10px] font-black">Regresar</span></button>
            </div>
        </div>
    );
};

export default ShopDetailPage;
