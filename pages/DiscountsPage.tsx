import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Offer } from '../types';
import {
    ArrowLeft,
    Tag,
    ShieldCheck,
    Gift,
    QrCode,
    Share2,
    Store,
    MapPin,
    Calendar,
    Package,
    Coins
} from 'lucide-react';
import { playNeonClick } from '../utils/audio';

interface DiscountsPageProps {
    allOffers: Offer[];
}

const DiscountsPage: React.FC<DiscountsPageProps> = ({ allOffers }) => {
    const navigate = useNavigate();
    const { townId = 'esteban-echeverria' } = useParams<{ townId: string }>();
    // Derivar nombre visual de ciudad a partir del townId
    const townDisplayName = townId
        .split('-')
        .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

    const activeOffers = allOffers.filter(o => o.target === 'B2B' && o.isActive);

    const handleShare = () => {
        playNeonClick();
        const shareUrl = window.location.href;
        const shareTitle = 'ShopDigital - Beneficios B2B';
        const shareText = '¡Aprovechá los descuentos exclusivos para la red de comerciantes de ShopDigital! 🚀💼\n\n👉 ' + shareUrl;

        if (navigator.share) {
            navigator.share({ title: shareTitle, text: shareText, url: shareUrl }).catch(console.error);
        } else {
            window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank', 'noopener,noreferrer');
        }
    };

    const handleShareOffer = (offer: Offer) => {
        playNeonClick();
        const text = `🏷️ *${offer.discountLabel}* en *${offer.merchantName}*\n${offer.description}\n\n📍 ${offer.merchantZone}\n🔗 Ver más beneficios: ${window.location.href}`;
        if (navigator.share) {
            navigator.share({ title: offer.title, text, url: window.location.href }).catch(console.error);
        } else {
            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
        }
    };

    return (
        <div className="min-h-screen bg-black flex flex-col items-center pb-24 animate-in fade-in duration-700 relative overflow-hidden">
             <div className="absolute top-20 left-[-10%] w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
             <div className="absolute bottom-20 right-[-10%] w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="w-full bg-gradient-to-b from-cyan-900/20 to-transparent pt-12 pb-8 px-8 flex flex-col items-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <div className="absolute top-[-50%] left-[-20%] w-[140%] h-[200%] bg-[radial-gradient(circle,rgba(34,211,238,0.2)_0%,transparent_70%)] animate-pulse"></div>
                </div>
                <button onClick={() => navigate(-1)}
                    className="self-start mb-6 p-2 rounded-xl bg-white/5 border border-white/10 text-white backdrop-blur-sm active:scale-90 transition-all hover:border-cyan-500/40">
                    <ArrowLeft size={20} />
                </button>
                <div className="flex flex-col items-center gap-2 relative z-10">
                    <div className="bg-cyan-500/20 p-3 rounded-2xl border border-cyan-500/30 shadow-[0_0_30px_rgba(34,211,238,0.3)] mb-2">
                        <ShieldCheck size={32} className="text-cyan-400" />
                    </div>
                    <h1 className="text-2xl font-[1000] text-white uppercase tracking-[0.2em] text-center text-shadow-premium">Red Comercial</h1>
                    <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
                    <p className="text-[10px] font-black text-cyan-300 uppercase tracking-[0.4em] mt-2">Beneficios Exclusivos</p>
                </div>
            </div>

            <div className="px-6 w-full max-w-md flex flex-col gap-8 mt-4">
                {/* Info Banner */}
                <div className="bg-gradient-to-br from-gray-900 to-zinc-900 border border-white/5 rounded-[2rem] p-6 shadow-2xl relative overflow-hidden">
                    <div className="flex items-start gap-4">
                        <div className="bg-cyan-500/20 p-2 rounded-lg"><Gift size={20} className="text-cyan-400" /></div>
                        <div>
                            <h3 className="text-[11px] font-black text-white uppercase tracking-widest mb-1">¿Cómo obtener tu descuento?</h3>
                            <p className="text-[9px] font-medium text-white/50 leading-relaxed">
                                Preséntala {{' '}}<span className="text-cyan-400 font-bold">Credencial Electrónica</span> en cualquiera de los locales adheridos a nuestra red comercial de <span className="text-white font-bold">{townDisplayName}</span>.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Offer Cards */}
                <div className="flex flex-col gap-6">
                    <h2 className="text-[9px] font-black text-white/30 uppercase tracking-[0.5em] ml-4">Descuentos Activos · {activeOffers.length}</h2>

                    {activeOffers.length === 0 ? (
                        <div className="glass-card-3d bg-white/[0.02] border border-cyan-500/20 rounded-3xl p-10 flex flex-col items-center justify-center gap-3 text-center">
                            <Tag size={24} className="text-cyan-400/30" />
                            <p className="text-[10px] text-white/40 uppercase tracking-widest leading-relaxed">
                                Próximamente descuentos exclusivos para comerciantes de la red.
                            </p>
                        </div>
                    ) : (
                        activeOffers.map((offer, idx) => (
                            <div key={offer.id}
                                className="group bg-zinc-900/50 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-xl transition-all"
                                style={{ animationDelay: `${idx * 150}ms` }}>
                                
                                {/* Image */}
                                <div className="relative h-36 overflow-hidden">
                                    {offer.image ? (
                                        <img src={offer.image} alt={offer.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-60" />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-cyan-900/30 to-zinc-900 flex items-center justify-center">
                                            <Tag size={32} className="text-cyan-400/20" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/20 to-transparent"></div>
                                    <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                                        <span className="text-[10px] font-black text-white uppercase tracking-tighter italic">B2B Red</span>
                                    </div>
                                    <div className="absolute bottom-4 left-6">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Store size={12} className="text-cyan-400" />
                                            <h3 className="text-xs font-black text-white uppercase tracking-widest leading-none">{offer.merchantName}</h3>
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6 pt-2">
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                        <div className="flex flex-col gap-1 flex-1">
                                            <p className="text-[18px] font-black text-cyan-400 uppercase tracking-tighter leading-none">{offer.discountLabel}</p>
                                            <p className="text-[12px] font-bold text-white/80 leading-tight">{offer.title}</p>
                                            {offer.description && <p className="text-[10px] font-bold text-white/40 mt-1">{offer.description}</p>}
                                        </div>
                                        <div className="flex flex-col items-end gap-2 shrink-0">
                                            {offer.pointsPrice ? (
                                                <div className="bg-yellow-500/10 px-3 py-1.5 rounded-xl border border-yellow-500/20 flex flex-col items-center justify-center min-w-[70px]">
                                                    <Coins size={14} className="text-yellow-400 mb-0.5" />
                                                    <span className="text-[9px] font-black text-yellow-500 uppercase">Pts: {offer.pointsPrice}</span>
                                                </div>
                                            ) : offer.price && (
                                                <div className="bg-cyan-500/10 px-3 py-1.5 rounded-xl border border-cyan-500/20 min-w-[70px] flex items-center justify-center">
                                                    <span className="text-[12px] font-black text-cyan-400">{offer.price}</span>
                                                </div>
                                            )}
                                            <div className="bg-white/10 p-2 rounded-xl border border-white/20">
                                                <QrCode size={20} className="text-white/80" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Meta Tags */}
                                    <div className="flex flex-wrap gap-1.5 mb-4">
                                        <span className="flex items-center gap-1 text-[7px] font-bold text-white/40 bg-white/5 px-2 py-1 rounded-full"><MapPin size={8} /> {offer.merchantZone}</span>
                                        {offer.validUntil && offer.validUntil !== 'indefinido' && (
                                            <span className="flex items-center gap-1 text-[7px] font-bold text-white/40 bg-white/5 px-2 py-1 rounded-full"><Calendar size={8} /> Hasta {offer.validUntil}</span>
                                        )}
                                        {offer.stockLimit && (
                                            <span className="flex items-center gap-1 text-[7px] font-bold text-orange-400/60 bg-orange-500/10 px-2 py-1 rounded-full"><Package size={8} /> {offer.stockLimit} unidades</span>
                                        )}
                                    </div>

                                    {/* Credential Requirement + Share */}
                                    <div className="flex gap-2">
                                        <div className="flex-1 bg-cyan-500/10 border border-cyan-400/30 py-2.5 rounded-xl flex items-center justify-center gap-1.5">
                                            <ShieldCheck size={12} className="text-cyan-400" />
                                            <span className="text-[8px] font-black text-cyan-300 uppercase tracking-widest">Presentar Credencial</span>
                                        </div>
                                        <button onClick={() => handleShareOffer(offer)}
                                            className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-cyan-400 hover:border-cyan-400/30 active:scale-95 transition-all">
                                            <Share2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="mt-8 flex flex-col items-center gap-6 py-8 border-t border-white/5 w-full">
                    <button onClick={handleShare}
                        className="w-full glass-action-btn btn-cyan-neon luminous-glow py-5 px-10 flex items-center justify-center gap-4 group">
                        <span className="text-sm font-black uppercase tracking-[0.2em]">Compartir Beneficios</span>
                        <Share2 size={20} className="text-cyan-400 group-hover:rotate-12 transition-transform" />
                    </button>
                    <button onClick={() => navigate('/')} className="glass-action-btn btn-neon-delicate px-8 py-3 rounded-full flex items-center gap-2">
                        <ArrowLeft size={14} className="text-white" />
                        <span className="text-[9px] font-black text-white uppercase tracking-widest">Regresar</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DiscountsPage;
