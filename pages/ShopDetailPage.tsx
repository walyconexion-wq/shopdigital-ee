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
    Eye,
    Users,
    MessageSquare,
    Star
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { playNeonClick } from '../utils/audio';

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
                    navigate('/');
                }} className="mt-4 text-cyan-400 font-bold uppercase tracking-widest text-[10px]">Volver al inicio</button>
            </div>
        );
    }

    const gallery = selectedShop.galleryImages && selectedShop.galleryImages.length > 0
        ? selectedShop.galleryImages
        : [selectedShop.bannerImage, selectedShop.image, selectedShop.offers[0]?.image].filter(Boolean) as string[];

    return (
        <div className="pb-24 animate-in fade-in duration-700 bg-black min-h-screen">
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
                    <h1 className="impact-title neon-flicker text-[34px] drop-shadow-[0_0_20px_rgba(255,255,255,0.7)] text-white text-center">
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

                {/* Contador de Visitas Portada (Esquina Inferior Izquierda) */}
                <div className="absolute bottom-5 left-5 z-40 flex items-center gap-1.5 bg-cyan-950/40 px-3 py-1.5 rounded-lg border border-cyan-500/20 shadow-inner backdrop-blur-sm">
                    <Eye size={12} className="text-cyan-400" />
                    <span className="text-[10px] font-black text-cyan-400 tracking-widest uppercase">{selectedShop.visits || 0} visitas</span>
                </div>

                {/* Contador de Suscriptores Portada (Esquina Inferior Derecha) */}
                <div className="absolute bottom-5 right-5 z-40 flex items-center gap-1.5 bg-cyan-950/40 px-3 py-1.5 rounded-lg border border-cyan-500/20 shadow-inner backdrop-blur-sm">
                    <Users size={12} className="text-cyan-400" />
                    <span className="text-[10px] font-black text-cyan-400 tracking-widest uppercase">{selectedShop.subscribers || 0} suscriptores</span>
                </div>

            </div>

            <div className="relative z-10 flex flex-col items-center">
                <div ref={catalogRef} className="w-full mb-10 mt-8">
                    <div className="w-full px-6 mb-8 flex flex-col items-center">
                        <button
                            onClick={() => {
                                playNeonClick();
                                // TODO: Navigate to full catalog/menu page when created
                                console.log("Navegando al menú completo del comercio...");
                            }}
                            className="glass-action-btn bg-cyan-950/40 backdrop-blur-md border border-cyan-400/50 px-8 py-3 rounded-full flex items-center justify-center gap-3 font-black uppercase tracking-[0.2em] text-[10px] text-white overflow-hidden relative group shadow-[0_3px_0_rgba(34,211,238,0.3),0_10px_20px_rgba(34,211,238,0.2)] active:translate-y-[3px] active:shadow-[0_0px_0_rgba(34,211,238,0.3),0_5px_10px_rgba(34,211,238,0.1)] transition-all duration-75"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-white/10 to-cyan-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                            <ShoppingBag size={16} className="text-cyan-400 drop-shadow-md group-hover:scale-110 transition-transform" />
                            Catálogo de Ofertas
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

                {/* Botón Ver Catálogo Reubicado */}
                {selectedShop.catalog && (
                    <div className="w-full px-6 mb-8 mt-2">
                        <button
                            onClick={() => {
                                playNeonClick();
                                window.open(selectedShop.catalog, '_blank', 'noopener,noreferrer');
                            }}
                            className="w-full glass-action-btn btn-offers-glow luminous-glow py-4 rounded-2xl flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(34,211,238,0.2)] active:scale-95 group relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-white/10 to-cyan-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                            <BookOpen size={16} strokeWidth={3} className="text-white group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Ver Catálogo Completo</span>
                        </button>
                    </div>
                )}
                {/* B2C Client Fidelity Subscription Trigger */}
                <div className="w-full px-6 mb-12 flex flex-col items-center">
                    <button
                        onClick={() => {
                            playNeonClick();
                            navigate(`/${categorySlug}/${shopSlug}/cliente-subscripcion`);
                        }}
                        className="glass-action-btn bg-cyan-950/40 backdrop-blur-md border border-cyan-400/50 px-8 py-3 rounded-full flex items-center justify-center gap-3 font-black uppercase tracking-[0.2em] text-[10px] text-white overflow-hidden relative group shadow-[0_3px_0_rgba(34,211,238,0.3),0_10px_20px_rgba(34,211,238,0.2)] active:translate-y-[3px] active:shadow-[0_0px_0_rgba(34,211,238,0.3),0_5px_10px_rgba(34,211,238,0.1)] transition-all duration-75"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-white/10 to-cyan-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                        <Gift size={16} className="text-white drop-shadow-md group-hover:scale-110 transition-transform" />
                        Obtener Ofertas VIP
                    </button>
                    <p className="text-[8px] text-center font-bold text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)] uppercase tracking-widest mt-4">Sumate a nuestra red de beneficios locales</p>
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
                    <div className="map-glow-container w-full h-80 overflow-hidden bg-cyan-950/40 backdrop-blur-md relative mb-8 shadow-[0_0_30px_rgba(34,211,238,0.15)] rounded-[2rem] border border-cyan-400/50 p-1">
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
                        <p className="text-[8px] text-center font-bold text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)] uppercase tracking-widest">
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
                        navigate(`/${categorySlug}/${shopSlug}/panel-autogestion`);
                    }} className="flex items-center justify-center gap-2 text-white/20 hover:text-white/40"><Lock size={12} /><span className="text-[8px] font-bold uppercase">Gestión</span></button>
                </div>

                {/* ---------- REVIEWS AND RATING SECTION ---------- */}
                <div className="w-full px-5 mb-14 flex flex-col items-center">
                    <div className="flex items-center gap-2 mb-6">
                        <MessageSquare size={16} className="text-cyan-400" />
                        <h3 className="neon-text-cyan font-black text-[11px] uppercase tracking-[0.3em]">Opiniones de Clientes</h3>
                    </div>

                    {/* Review List */}
                    <div className="flex flex-col gap-3 w-full mb-6 relative">
                        {/* Decorative glow behind reviews */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-cyan-500/5 blur-3xl rounded-full pointer-events-none" />
                        
                        {(selectedShop.reviews || [
                            { id: '1', authorName: 'Carlos M.', rating: 5, text: 'Excelente atención y los productos de primera calidad. Vuelvo seguro. Recomendado al 100%.', date: 'Hace 2 días' },
                            { id: '2', authorName: 'Laura G.', rating: 5, text: 'Muy buen servicio, llegó todo rapidísimo y caliente. Un lujo tener algo así en la zona.', date: 'Hace 1 semana' },
                            { id: '3', authorName: 'Diego F.', rating: 4, text: '¡Increíble la calidad! Se nota que le ponen mucha dedicación a lo que hacen.', date: 'Hace 2 semanas' }
                        ]).slice(0, 5).map((review) => (
                            <div key={review.id} className="glass-card-3d bg-cyan-950/20 backdrop-blur-sm border border-cyan-500/20 rounded-[1.25rem] p-4 flex flex-col gap-2 relative overflow-hidden">
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
                        <button className="glass-action-btn bg-cyan-950/40 backdrop-blur-md border border-cyan-400/50 py-3 rounded-[1.25rem] flex items-center justify-center gap-2 text-white shadow-[0_3px_0_rgba(34,211,238,0.2)] active:translate-y-[3px] active:shadow-none transition-all duration-75">
                            <span className="text-[8px] font-black uppercase tracking-widest text-cyan-400">Ver Todas</span>
                        </button>
                        <button className="glass-action-btn bg-gradient-to-br from-cyan-400 to-cyan-600 py-3 rounded-[1.25rem] border border-cyan-300 flex items-center justify-center gap-2 shadow-[0_4px_0_rgba(8,145,178,1),0_10px_20px_rgba(34,211,238,0.3)] active:translate-y-[4px] active:shadow-[0_0px_0_rgba(8,145,178,1),0_5px_10px_rgba(34,211,238,0.1)] transition-all duration-75">
                            <span className="text-[8px] font-black uppercase tracking-widest text-white drop-shadow-md">Dejar Reseña</span>
                        </button>
                    </div>
                </div>
                {/* ----------------------------------------------- */}

                <button onClick={() => {
                    playNeonClick();
                    navigate(`/${categorySlug}`);
                }} className="glass-action-btn btn-neon-delicate w-max py-2 px-5 mb-8 flex items-center gap-2 text-white"><ArrowLeft size={16} /><span className="text-[10px] font-black">Regresar</span></button>

                {/* Secret Merchant Cable */}
                <div 
                    onClick={() => {
                        playNeonClick();
                        navigate('/red-comercial/descuentos');
                    }}
                    className="mb-12 cursor-pointer group active:scale-95 transition-all"
                >
                    <p className="text-[8px] font-black uppercase tracking-[0.5em] text-cyan-500/30 group-hover:text-cyan-400 transition-colors text-center neon-flicker-slow">
                        Catálogo exclusivo para comerciantes
                    </p>
                </div>

                {/* Merchant Access Link */}
                <div className="w-full flex justify-center pb-8 opacity-40 hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => {
                            playNeonClick();
                            navigate(`/${categorySlug}/${shopSlug}/panel-autogestion`);
                        }}
                        className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-black text-white"
                    >
                        <Lock size={12} /> Acceso Comercio
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShopDetailPage;
