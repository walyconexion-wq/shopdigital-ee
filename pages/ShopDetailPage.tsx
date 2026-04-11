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
    ArrowLeft,
    Gift,
    Users,
    MessageSquare,
    Star,
    Settings,
    Eye,
    Heart,
    Image as ImageIcon
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { playNeonClick } from '../utils/audio';
import { useAuth } from '../components/AuthContext';
import { incrementarLikesFeed } from '../firebase';

interface ShopDetailPageProps {
    allShops: Shop[];
}

const ShopDetailPage: React.FC<ShopDetailPageProps> = ({ allShops }) => {
    const { townId = 'esteban-echeverria', categorySlug, shopSlug } = useParams<{ townId: string; categorySlug: string; shopSlug: string }>();
    const navigate = useNavigate();
    const isEnterprisePath = window.location.pathname.startsWith('/empresas');
    const basePath = isEnterprisePath ? '/empresas' : `/${townId}`;
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const catalogRef = useRef<HTMLDivElement>(null);
    const { user, login } = useAuth();

    const ROOT_EMAIL = 'walyconexion@gmail.com';

    const handleMerchantAccess = async (destination: string) => {
        playNeonClick();
        if (!user) {
            await login();
            return;
        }
        const userEmail = user.email?.trim().toLowerCase();
        const shopEmail = selectedShop?.authorizedEmail?.trim().toLowerCase();
        if (userEmail === ROOT_EMAIL || (shopEmail && userEmail === shopEmail)) {
            navigate(destination);
        } else {
            alert('🔒 Acceso denegado. Este acceso es exclusivo para el comerciante autorizado. Contactá al administrador.');
        }
    };

    const selectedShop = useMemo(() =>
        allShops.find(shop => (shop.slug || shop.id) === shopSlug),
        [shopSlug, allShops]);

    const themeColor = selectedShop?.themeColor || '#22d3ee';
    const hexToRgba = (hex: string, alpha: number) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    const [hasLikedFeed, setHasLikedFeed] = useState(false);
    const [feedLikesCount, setFeedLikesCount] = useState(0);

    const feedGallery = useMemo(() => {
        if (!selectedShop) return [];
        if (selectedShop.feedImages && selectedShop.feedImages.length > 0) {
            return selectedShop.feedImages;
        }
        if (selectedShop.bannerImage) return [selectedShop.bannerImage];
        if (selectedShop.image) return [selectedShop.image];
        return [];
    }, [selectedShop]);

    const handleLikeFeed = async () => {
        if (hasLikedFeed || !selectedShop) return;
        playNeonClick();
        setHasLikedFeed(true);
        setFeedLikesCount(prev => prev + 1);
        await incrementarLikesFeed(selectedShop.id);
    };

    useEffect(() => {
        if (selectedShop) {
            setFeedLikesCount(selectedShop.feedLikes || 0);

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
        playNeonClick();
        catalogRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleShare = () => {
        playNeonClick();
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
        playNeonClick();
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
                <button onClick={() => {
                    playNeonClick();
                    navigate(isEnterprisePath ? '/empresas' : `/${townId}/home`);
                }} className="mt-4 text-cyan-400 font-bold uppercase tracking-widest text-[10px]">Volver al inicio</button>
            </div>
        );
    }

    const gallery = selectedShop.galleryImages && selectedShop.galleryImages.length > 0
        ? selectedShop.galleryImages
        : [selectedShop.bannerImage, selectedShop.image, selectedShop.offers[0]?.image].filter(Boolean) as string[];

    return (
        <div className="pb-24 animate-in fade-in duration-700 bg-transparent min-h-screen">
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

            <div className="relative w-full h-[260px] bg-black overflow-hidden">
                {/* Back Button Overlay */}
                <button
                    onClick={() => {
                        playNeonClick();
                        navigate(`${basePath}/${categorySlug}`);
                    }}
                    className="absolute top-6 left-5 z-[60] w-10 h-10 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-md border border-white/20 active:scale-90 transition-all hover:bg-black/50 shadow-[0_0_15px_rgba(0,0,0,0.5)]"
                >
                    <ArrowLeft size={22} className="text-white drop-shadow-md pr-0.5" />
                </button>

                {gallery.map((img, idx) => (
                    <img
                        key={idx}
                        src={img}
                        alt={`Cover ${idx}`}
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[2000ms] ease-in-out ${idx === currentImageIndex ? 'opacity-100' : 'opacity-0'}`}
                    />
                ))}
                {/* Gradiente sutil solo en los bordes para lectura de texto, el centro queda 100% visible */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40"></div>

                <div className="absolute top-5 left-1/2 -translate-x-1/2 z-50 pointer-events-none w-[90%] flex flex-col items-center">
                    <h1 
                        className="impact-title neon-flicker text-[34px] drop-shadow-[0_0_20px_rgba(255,255,255,0.7)] text-white text-center pointer-events-auto cursor-default"
                        onClick={(e) => {
                            if (e.detail === 3) {
                                handleMerchantAccess(`/${townId}/mi-comercio/panel-de-gestion`);
                            }
                        }}
                    >
                        {selectedShop.name.replace(/\s*\(.*\)\s*/, '').split('-')[0].trim()}
                    </h1>
                    <div className="flex items-center gap-1.5 mt-1 opacity-90">
                        <MapPin size={10} className="text-red-400" strokeWidth={3} />
                        <span className="text-[8.5px] font-black uppercase tracking-[0.3em] text-white/80 text-shadow-premium">
                            {selectedShop.zone || globalConfig?.townName || 'Tu zona'}
                        </span>
                    </div>
                    <div className="w-12 h-[1px] bg-white/40 mx-auto mt-2.5 shadow-[0_0_10px_rgba(255,255,255,0.6)]"></div>
                </div>

                {/* Contador de Visitas Portada (Esquina Inferior Izquierda) */}
                <div className="absolute bottom-5 left-5 z-40 flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-lg border shadow-inner backdrop-blur-sm" style={{ borderColor: hexToRgba(themeColor, 0.2) }}>
                    <Eye size={12} style={{ color: themeColor }} />
                    <span className="text-[10px] font-black tracking-widest uppercase" style={{ color: themeColor }}>{selectedShop.visits || 0} visitas</span>
                </div>

                {/* Contador de Suscriptores Portada (Esquina Inferior Derecha) */}
                <div className="absolute bottom-5 right-5 z-40 flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-lg border shadow-inner backdrop-blur-sm" style={{ borderColor: hexToRgba(themeColor, 0.2) }}>
                    <Users size={12} style={{ color: themeColor }} />
                    <span className="text-[10px] font-black tracking-widest uppercase" style={{ color: themeColor }}>{selectedShop.subscribers || 0} suscriptores</span>
                </div>

            </div>

            <div className="relative z-10 flex flex-col items-center">
                <div ref={catalogRef} className="w-full mb-10 mt-8">
                    <div className="w-full px-6 mb-8 flex flex-col items-center">
                        <button
                            onClick={() => {
                                playNeonClick();
                                navigate(`${basePath}/${categorySlug}/${shopSlug}/menu`);
                            }}
                            className="glass-action-btn backdrop-blur-md border px-8 py-3.5 rounded-[1.25rem] flex items-center justify-center gap-3 font-black uppercase tracking-[0.2em] text-[10px] text-white transition-all duration-75 active:translate-y-[4px]"
                            style={{ 
                                backgroundColor: hexToRgba(themeColor, 0.35),
                                borderColor: hexToRgba(themeColor, 0.5),
                                boxShadow: `0 4px 0 ${hexToRgba(themeColor, 0.5)}, 0 12px 20px ${hexToRgba(themeColor, 0.2)}`
                            }}
                        >
                            <ShoppingBag size={16} className="text-white" style={{ filter: `drop-shadow(0 0 8px ${hexToRgba(themeColor, 0.8)})` }} />
                            <span style={{ filter: `drop-shadow(0 0 8px ${hexToRgba(themeColor, 0.8)})` }}>Catálogo de Ofertas</span>
                        </button>
                    </div>

                    <div className="overflow-hidden w-full relative">
                        {/* Subtle Glows for Catalog */}
                        <div className="absolute top-0 left-0 w-32 h-32 bg-cyan-500/5 blur-3xl rounded-full pointer-events-none" />
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

                {/* Botón Integración PedidoYa */}
                {selectedShop.pedidoYaUrl && (
                    <div className="w-full px-6 mb-8 mt-2">
                        <button
                            onClick={() => {
                                playNeonClick();
                                window.open(selectedShop.pedidoYaUrl, '_blank', 'noopener,noreferrer');
                            }}
                            className="w-full bg-[#EA044E]/10 border border-[#EA044E]/50 py-4 rounded-2xl flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(234,4,78,0.2)] hover:bg-[#EA044E]/20 active:scale-95 group relative overflow-hidden transition-all"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-[#EA044E]/0 via-white/10 to-[#EA044E]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                            <ShoppingBag size={16} strokeWidth={3} className="text-[#EA044E] group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#EA044E] drop-shadow-md">Pedir por PedidoYa</span>
                        </button>
                    </div>
                )}
                {/* B2C Client Fidelity Subscription Trigger */}
                <div className="w-full px-6 mb-12 flex flex-col items-center">
                    <button
                        onClick={() => {
                            playNeonClick();
                            navigate(`${basePath}/${categorySlug}/${shopSlug}/cliente-subscripcion`);
                        }}
                        className="glass-action-btn backdrop-blur-md border px-8 py-3.5 rounded-[1.25rem] flex items-center justify-center gap-3 font-black uppercase tracking-[0.2em] text-[10px] text-white transition-all duration-75 active:translate-y-[4px]"
                        style={{ 
                            backgroundColor: hexToRgba(themeColor, 0.35),
                            borderColor: hexToRgba(themeColor, 0.5),
                            boxShadow: `0 4px 0 ${hexToRgba(themeColor, 0.5)}, 0 12px 20px ${hexToRgba(themeColor, 0.2)}`
                        }}
                    >
                        <Gift size={16} className="text-white" style={{ filter: `drop-shadow(0 0 8px ${hexToRgba(themeColor, 0.8)})` }} />
                        <span style={{ filter: `drop-shadow(0 0 8px ${hexToRgba(themeColor, 0.8)})` }}>Obtener Credencial VIP</span>
                    </button>
                    <p className="text-[8px] text-center font-bold uppercase tracking-widest mt-4" style={{ color: themeColor, filter: `drop-shadow(0 0 8px ${hexToRgba(themeColor, 0.6)})` }}>Sumate a nuestra red de beneficios locales</p>
                </div>

                {/* Action Buttons */}
                <div className="w-full px-5 mb-12 grid grid-cols-3 gap-4">
                    <button onClick={() => handleOpenLink('https://www.pedidosya.com.ar/')} className="glass-action-btn btn-py py-3 rounded-[1.25rem] flex flex-col items-center justify-center gap-1.5 font-black text-white shadow-[0_4px_0_rgba(239,68,68,0.5),0_10px_15px_rgba(239,68,68,0.2)] active:translate-y-[4px] active:shadow-[0_0px_0_rgba(239,68,68,0.5),0_5px_10px_rgba(239,68,68,0.1)] transition-all duration-75">
                        <span className="italic text-[18px] text-red-500">P</span>
                        <span className="text-[8px] tracking-wider uppercase">PedidosYa</span>
                    </button>
                    <button onClick={() => selectedShop.phone && handleOpenLink(`https://wa.me/549${selectedShop.phone.replace(/\D/g, '')}?text=Hola!%20Vengo%20de%20la%20App%20de%20Waly`)} className="glass-action-btn btn-wa py-3 rounded-[1.25rem] flex flex-col items-center justify-center gap-1.5 font-black text-white shadow-[0_4px_0_rgba(37,211,102,0.5),0_10px_15px_rgba(37,211,102,0.2)] active:translate-y-[4px] active:shadow-[0_0px_0_rgba(37,211,102,0.5),0_5px_10px_rgba(37,211,102,0.1)] transition-all duration-75">
                        <MessageCircle size={18} className="text-[#25D366]" fill="currentColor" strokeWidth={0} />
                        <span className="text-[8px] tracking-wider uppercase">WhatsApp</span>
                    </button>
                    <button onClick={() => handleOpenLink('https://www.mercadopago.com.ar/')} className="glass-action-btn btn-mp py-3 rounded-[1.25rem] flex flex-col items-center justify-center gap-1.5 font-black text-white shadow-[0_4px_0_rgba(0,158,227,0.5),0_10px_15px_rgba(0,158,227,0.2)] active:translate-y-[4px] active:shadow-[0_0px_0_rgba(0,158,227,0.5),0_5px_10px_rgba(0,158,227,0.1)] transition-all duration-75">
                        <Handshake size={18} className="text-[#009EE3]" strokeWidth={3} />
                        <span className="text-[8px] tracking-wider uppercase">M. Pago</span>
                    </button>
                </div>

                {/* Map Section */}
                <div className="w-full px-6 mb-12">
                    <div className="map-glow-container w-full h-80 overflow-hidden bg-black/40 backdrop-blur-md relative mb-8 rounded-[2rem] border p-1" style={{ borderColor: hexToRgba(themeColor, 0.5), boxShadow: `0 0 30px ${hexToRgba(themeColor, 0.15)}` }}>
                        <iframe
                            title="Ubicación"
                            src={selectedShop.mapUrl}
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen={false}
                            loading="lazy"
                            className="rounded-[1.7rem] invert-[100%] hue-rotate-180 contrast-[110%] saturate-[150%] brightness-[90%] opacity-95 pointer-events-auto"
                        ></iframe>
                    </div>
                    <div className="mt-2 text-center px-4 mb-10">
                        <p className="text-[8px] text-center font-bold uppercase tracking-widest" style={{ color: themeColor, filter: `drop-shadow(0 0 8px ${hexToRgba(themeColor, 0.6)})` }}>
                            {selectedShop.address}
                        </p>
                    </div>

                    <div className="flex flex-col gap-4 w-full">
                        <div className="grid grid-cols-3 gap-4 mb-4">
                            <button onClick={() => selectedShop.facebook && handleOpenLink(selectedShop.facebook)} className="glass-action-btn btn-fb py-3 rounded-[1.25rem] flex flex-col items-center justify-center gap-1.5 text-white shadow-[0_4px_0_rgba(24,119,242,0.5),0_10px_15px_rgba(24,119,242,0.2)] active:translate-y-[4px] active:shadow-[0_0px_0_rgba(24,119,242,0.5),0_5px_10px_rgba(24,119,242,0.1)] transition-all duration-75">
                                <Facebook size={18} className="text-[#1877F2]" fill="currentColor" strokeWidth={0} />
                                <span className="text-[8px] font-black uppercase tracking-tighter">Facebook</span>
                            </button>
                            <button onClick={() => selectedShop.instagram && handleOpenLink(selectedShop.instagram)} className="glass-action-btn btn-ig py-3 rounded-[1.25rem] flex flex-col items-center justify-center gap-1.5 text-white shadow-[0_4px_0_rgba(228,64,95,0.5),0_10px_15px_rgba(228,64,95,0.2)] active:translate-y-[4px] active:shadow-[0_0px_0_rgba(228,64,95,0.5),0_5px_10px_rgba(228,64,95,0.1)] transition-all duration-75">
                                <Instagram size={18} className="text-[#E4405F]" strokeWidth={2.5} />
                                <span className="text-[8px] font-black uppercase tracking-tighter">Instagram</span>
                            </button>
                            <button onClick={() => selectedShop.tiktok && handleOpenLink(selectedShop.tiktok)} className="glass-action-btn btn-tk py-3 rounded-[1.25rem] flex flex-col items-center justify-center gap-1.5 text-white shadow-[0_4px_0_rgba(255,255,255,0.3),0_10px_15px_rgba(255,255,255,0.1)] active:translate-y-[4px] active:shadow-[0_0px_0_rgba(255,255,255,0.3),0_5px_10px_rgba(255,255,255,0.05)] transition-all duration-75">
                                <Music size={18} className="text-white" strokeWidth={2.5} />
                                <span className="text-[8px] font-black uppercase tracking-tighter">TikTok</span>
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => handleOpenLink(selectedShop.mapSheetUrl || '#')} className="glass-action-btn btn-violet py-3 rounded-[1.25rem] flex items-center justify-center gap-2 text-white shadow-[0_4px_0_rgba(139,92,246,0.5),0_10px_15px_rgba(139,92,246,0.2)] active:translate-y-[4px] active:shadow-[0_0px_0_rgba(139,92,246,0.5),0_5px_10px_rgba(139,92,246,0.1)] transition-all duration-75">
                                <Navigation size={16} className="text-violet-400" />
                                <span className="text-[9px] font-black uppercase">Cómo llegar</span>
                            </button>
                            <button onClick={() => handleOpenLink('https://m.uber.com/ul/')} className="glass-action-btn bg-black/60 border border-white/20 py-3 rounded-[1.25rem] flex items-center justify-center gap-2 text-white shadow-[0_4px_0_rgba(255,255,255,0.3),0_10px_15px_rgba(255,255,255,0.1)] active:translate-y-[4px] active:shadow-[0_0px_0_rgba(255,255,255,0.3),0_5px_10px_rgba(255,255,255,0.05)] transition-all duration-75">
                                <Car size={16} className="text-white" />
                                <span className="text-[9px] font-black uppercase">Uber</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-4 w-full px-8 pb-12">
                    <button onClick={handleShare} className="glass-action-btn btn-green py-3 rounded-[1.25rem] flex items-center justify-center gap-2 text-white shadow-[0_4px_0_rgba(34,197,94,0.5),0_10px_15px_rgba(34,197,94,0.2)] active:translate-y-[4px] active:shadow-[0_0px_0_rgba(34,197,94,0.5),0_5px_10px_rgba(34,197,94,0.1)] transition-all duration-75">
                        <Share2 size={16} className="text-green-400" />
                        <span className="text-[10px] font-black uppercase">Compartir Catálogo</span>
                    </button>
                    <button onClick={() => {
                        playNeonClick();
                        navigate(`/${townId}/mi-comercio/panel-de-gestion`);
                    }} className="flex items-center justify-center gap-2 text-white/20 hover:text-white/40"><Lock size={12} /><span className="text-[8px] font-bold uppercase">Gestión</span></button>
                </div>

                {/* ---------- MURO DE NOVEDADES (FEED) ---------- */}
                <div className="w-full px-5 mb-14 flex flex-col items-center">
                    <div className="flex items-center gap-2 mb-6">
                        <ImageIcon size={16} style={{ color: themeColor }} />
                        <h3 className="font-black text-[11px] uppercase tracking-[0.3em]" style={{ color: themeColor, filter: `drop-shadow(0 0 8px ${hexToRgba(themeColor,0.6)})` }}>Muro de Novedades</h3>
                    </div>

                    <div className="w-full aspect-square md:aspect-video rounded-[1.7rem] overflow-hidden relative border isolate bg-zinc-900 group" style={{ borderColor: hexToRgba(themeColor, 0.2), boxShadow: `0 0 30px ${hexToRgba(themeColor, 0.1)}` }}>
                        
                        <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar w-full h-full">
                            {feedGallery.length > 0 ? (
                                feedGallery.map((img, i) => (
                                    <img key={i} src={img} className="w-full h-full object-cover shrink-0 snap-center" alt={`Novedad ${i + 1}`} loading="lazy" />
                                ))
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center bg-black/50 text-white/40 relative">
                                    <div className="absolute inset-0 bg-cyan-500/5 blur-3xl pointer-events-none" />
                                    <ImageIcon size={32} className="mb-2 opacity-50" />
                                    <p className="text-[10px] uppercase font-black tracking-widest text-center px-4">Próximamente nuevas publicidades</p>
                                </div>
                            )}
                        </div>

                        {/* Pagination Dots */}
                        {feedGallery.length > 1 && (
                            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 pointer-events-none z-10">
                                {feedGallery.map((_, i) => (
                                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/50 backdrop-blur-md shadow-[0_0_5px_rgba(0,0,0,0.5)]"></div>
                                ))}
                            </div>
                        )}

                        {/* Like Button */}
                        <div className="absolute top-3 right-3 z-20">
                            <button
                                onClick={handleLikeFeed}
                                disabled={hasLikedFeed}
                                className={`glass-action-btn flex items-center gap-1.5 px-3 py-1.5 rounded-full border backdrop-blur-md transition-all duration-300 ${
                                    hasLikedFeed 
                                    ? 'bg-rose-500/30 border-rose-400/50 shadow-[0_0_15px_rgba(244,63,94,0.4)]' 
                                    : 'bg-black/40 border-white/20 hover:bg-black/60 hover:border-white/40'
                                }`}
                            >
                                <Heart size={14} className={`${hasLikedFeed ? 'fill-rose-400 text-rose-400' : 'text-white'} transition-colors duration-300`} />
                                <span className={`text-[10px] font-black tracking-widest ${hasLikedFeed ? 'text-rose-400 drop-shadow-[0_0_5px_rgba(244,63,94,0.8)]' : 'text-white'}`}>
                                    {feedLikesCount}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* ---------- REVIEWS AND RATING SECTION ---------- */}
                <div className="w-full px-5 mb-14 flex flex-col items-center">
                    <div className="flex items-center gap-2 mb-6">
                        <MessageSquare size={16} style={{ color: themeColor }} />
                        <h3 className="font-black text-[11px] uppercase tracking-[0.3em]" style={{ color: themeColor, filter: `drop-shadow(0 0 8px ${hexToRgba(themeColor,0.6)})` }}>Opiniones de Clientes</h3>
                    </div>

                    {/* Review List */}
                    <div className="flex flex-col gap-3 w-full mb-6 relative">
                        {/* Decorative glow behind reviews */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 blur-3xl rounded-full pointer-events-none" style={{ backgroundColor: hexToRgba(themeColor, 0.05) }} />
                        
                        {(selectedShop.reviews || [
                            { id: '1', authorName: 'Carlos M.', rating: 5, text: 'Excelente atención y los productos de primera calidad. Vuelvo seguro. Recomendado al 100%.', date: 'Hace 2 días' },
                            { id: '2', authorName: 'Laura G.', rating: 5, text: 'Muy buen servicio, llegó todo rapidísimo y caliente. Un lujo tener algo así en la zona.', date: 'Hace 1 semana' },
                            { id: '3', authorName: 'Diego F.', rating: 4, text: '¡Increíble la calidad! Se nota que le ponen mucha dedicación a lo que hacen.', date: 'Hace 2 semanas' }
                        ]).slice(0, 5).map((review) => (
                            <div key={review.id} className="glass-card-3d backdrop-blur-sm border rounded-[1.25rem] p-4 flex flex-col gap-2 relative overflow-hidden" style={{ backgroundColor: hexToRgba(themeColor, 0.05), borderColor: hexToRgba(themeColor, 0.2) }}>
                                <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 blur-2xl rounded-full" />
                                <div className="flex justify-between items-center w-full relative z-10">
                                    <span className="text-[10px] font-black text-white uppercase tracking-wider">{review.authorName}</span>
                                    <div className="flex gap-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={10} className={i < review.rating ? "text-yellow-400 fill-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.6)]" : "text-white/10 fill-white/5"} />
                                        ))}
                                    </div>
                                </div>
                                <p className="text-[9.5px] text-white/70 italic leading-relaxed relative z-10">"{review.text}"</p>
                                <span className="text-[7.5px] text-cyan-500/60 font-black uppercase tracking-[0.2em] mt-1 relative z-10">{review.date}</span>
                            </div>
                        ))}
                    </div>

                    {/* Actions: View All / Leave Review */}
                    <div className="grid grid-cols-2 gap-3 w-full">
                        <button 
                            className="glass-action-btn backdrop-blur-md border py-3 rounded-[1.25rem] flex items-center justify-center gap-2 text-white transition-all duration-75 active:translate-y-[4px]"
                            style={{ 
                                backgroundColor: hexToRgba(themeColor, 0.2), 
                                borderColor: hexToRgba(themeColor, 0.3),
                                boxShadow: `0 4px 0 ${hexToRgba(themeColor, 0.3)}, 0 8px 15px ${hexToRgba(themeColor, 0.15)}`
                            }}
                        >
                            <span className="text-[8px] font-black uppercase tracking-widest" style={{ color: themeColor, filter: `drop-shadow(0 0 5px ${hexToRgba(themeColor, 0.5)})` }}>Ver Todas</span>
                        </button>
                        <button 
                            className="glass-action-btn backdrop-blur-md border py-3 rounded-[1.25rem] flex items-center justify-center gap-2 text-white transition-all duration-75 active:translate-y-[4px]"
                            style={{ 
                                backgroundColor: hexToRgba(themeColor, 0.3), 
                                borderColor: hexToRgba(themeColor, 0.5),
                                boxShadow: `0 4px 0 ${hexToRgba(themeColor, 0.5)}, 0 10px 20px ${hexToRgba(themeColor, 0.2)}`
                            }}
                        >
                            <span className="text-[8px] font-[1100] uppercase tracking-widest text-white" style={{ filter: `drop-shadow(0 0 8px ${hexToRgba(themeColor, 0.8)})` }}>Dejar Reseña</span>
                        </button>
                    </div>
                </div>
                {/* ----------------------------------------------- */}

                <div className="w-full flex justify-center mb-8">
                    <button onClick={() => {
                        playNeonClick();
                        navigate(`${basePath}/${categorySlug}`);
                    }} 
                        className="glass-action-btn backdrop-blur-md border w-max py-2.5 px-8 rounded-full flex items-center gap-2 text-white transition-all duration-75 active:translate-y-[4px]"
                        style={{ 
                            backgroundColor: hexToRgba(themeColor, 0.35), 
                            borderColor: hexToRgba(themeColor, 0.5),
                            boxShadow: `0 4px 0 ${hexToRgba(themeColor, 0.5)}, 0 10px 20px ${hexToRgba(themeColor, 0.2)}`
                        }}
                    >
                        <ArrowLeft size={16} className="text-white" style={{ filter: `drop-shadow(0 0 8px ${hexToRgba(themeColor, 0.8)})` }} />
                        <span className="text-[10px] font-[1100] uppercase tracking-widest text-white" style={{ filter: `drop-shadow(0 0 8px ${hexToRgba(themeColor, 0.8)})` }}>Regresar</span>
                    </button>
                </div>

                {/* Secret Merchant Cable */}
                <div 
                    onClick={() => handleMerchantAccess(`/${townId}/red-comercial/descuentos`)}
                    className="mb-12 cursor-pointer group active:scale-95 transition-all"
                >
                    <div className="flex items-center justify-center gap-2 mb-1">
                        <Lock size={10} className="text-cyan-500/30 group-hover:text-cyan-400 transition-colors" />
                        <p className="text-[8px] font-black uppercase tracking-[0.5em] text-cyan-500/30 group-hover:text-cyan-400 transition-colors text-center neon-flicker-slow">
                            Catálogo exclusivo para comerciantes
                        </p>
                    </div>
                </div>

                {/* Merchant Access Links */}
                <div className="w-full flex flex-col items-center gap-4 pb-12 opacity-40 hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => handleMerchantAccess(`/${townId}/mi-comercio/panel-de-gestion`)}
                        className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-black text-white hover:text-cyan-400 transition-colors"
                    >
                        <Lock size={12} /> Acceso Comercio
                    </button>
                    <button
                        onClick={() => handleMerchantAccess(`/${townId}/mi-comercio/panel-de-gestion`)}
                        className="flex items-center gap-2 text-[9px] uppercase tracking-widest font-black text-cyan-500/80 hover:text-cyan-400 transition-colors"
                    >
                        <Lock size={10} /> Panel Central
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShopDetailPage;
