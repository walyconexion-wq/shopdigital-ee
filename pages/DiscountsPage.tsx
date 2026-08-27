import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Offer } from '../types';
import {
    ArrowLeft,
    Tag,
    ShieldCheck,
    Gift,
    Share2,
    Store,
    MapPin,
    Calendar,
    Package
} from 'lucide-react';
import { playNeonClick } from '../utils/audio';
import { CyberCircuitBackground } from '../components/CyberCircuitBackground';

interface DiscountsPageProps {
    allOffers: Offer[];
}

const DiscountsPage: React.FC<DiscountsPageProps> = ({ allOffers }) => {
    const navigate = useNavigate();
    const { townId = 'esteban-echeverria' } = useParams<{ townId: string }>();
    
    const townDisplayName = townId
        .split('-')
        .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

    const activeOffers = allOffers.filter(o => o.target === 'B2B' && o.isActive);

    const handleShare = () => {
        playNeonClick();
        const shareUrl = window.location.href;
        const shareTitle = 'ShopDigital - Beneficios B2B';
        const shareText = `¡Aprovechá los descuentos exclusivos para la red de comerciantes de ShopDigital en ${townDisplayName}! 🚀💼\n\n👉 ${shareUrl}`;

        if (navigator.share) {
            navigator.share({ title: shareTitle, text: shareText, url: shareUrl }).catch(console.error);
        } else {
            window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank', 'noopener,noreferrer');
        }
    };

    return (
        <div className="min-h-screen bg-transparent flex flex-col items-center pb-24 animate-in fade-in duration-700 relative overflow-y-auto text-[#2c2440]">
            <CyberCircuitBackground />

            {/* Cabecera Neumórfica Crema HD */}
            <div className="w-full max-w-sm mx-auto px-4 pt-4 relative z-20 mb-5">
                <div className="neu-plate p-4 w-full flex flex-col items-center gap-3">
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
                            <h1 className="text-[12px] font-black uppercase tracking-wider text-[#2c2440]">
                                Red Comercial B2B
                            </h1>
                            <p className="text-[7.5px] font-extrabold uppercase tracking-widest text-[#4a3d6a]">
                                {townDisplayName}
                            </p>
                        </div>

                        <button 
                            onClick={handleShare}
                            className="w-9 h-9 flex items-center justify-center neu-btn-pod rounded-2xl cursor-pointer transition-transform active:scale-90"
                            title="Compartir"
                        >
                            <Share2 size={16} className="text-[#2c2440]" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="px-4 w-full max-w-sm flex flex-col gap-4 relative z-10">
                {/* Info Banner Neumórfico */}
                <div className="neu-plate p-4 w-full">
                    <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#2c2440] text-[#22d3ee] flex items-center justify-center shrink-0 shadow-sm">
                            <Gift size={18} />
                        </div>
                        <div>
                            <h3 className="text-[10px] font-black text-[#2c2440] uppercase tracking-wider mb-1">
                                ¿Cómo obtener tu beneficio?
                            </h3>
                            <p className="text-[8.5px] font-bold text-[#4a3d6a] leading-relaxed">
                                Presentá tu <strong className="text-[#ff6b6b]">Credencial Electrónica</strong> en cualquiera de los locales adheridos de <span className="text-[#2c2440] font-black">{townDisplayName}</span>.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Offer Cards */}
                <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-[8.5px] font-black text-[#4a3d6a] uppercase tracking-widest">
                            Descuentos Activos ({activeOffers.length})
                        </h2>
                    </div>

                    {activeOffers.length === 0 ? (
                        <div className="neu-plate p-8 flex flex-col items-center justify-center gap-2 text-center">
                            <Tag size={20} className="text-[#ff6b6b]" />
                            <p className="text-[9px] text-[#4a3d6a] font-bold uppercase tracking-wider leading-relaxed">
                                Próximamente nuevos descuentos exclusivos para comerciantes de la red.
                            </p>
                        </div>
                    ) : (
                        activeOffers.map((offer) => (
                            <div 
                                key={offer.id}
                                className="neu-plate p-4 w-full flex flex-col gap-2 relative transition-all"
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <span className="text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#ff6b6b] text-white">
                                            {offer.discountLabel || 'DESCUENTO'}
                                        </span>
                                        <h3 className="text-[11px] font-black uppercase text-[#2c2440] mt-1.5">
                                            {offer.title || offer.merchantName}
                                        </h3>
                                    </div>
                                    <div className="w-8 h-8 rounded-xl bg-[#e8dac8] text-[#2c2440] flex items-center justify-center">
                                        <Store size={15} />
                                    </div>
                                </div>

                                <p className="text-[8.5px] text-[#4a3d6a] font-bold leading-relaxed">
                                    {offer.description}
                                </p>

                                <div className="flex items-center justify-between pt-2 border-t border-[#b4a594]/20 mt-1">
                                    <div className="flex items-center gap-1 text-[8px] font-black text-[#2c2440]">
                                        <MapPin size={11} className="text-[#ff6b6b]" />
                                        <span>{offer.merchantZone || townDisplayName}</span>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            playNeonClick();
                                            const phone = (offer as any).merchantPhone || (offer as any).phone;
                                            if (phone) {
                                                window.open(`https://wa.me/549${String(phone).replace(/\D/g, '')}?text=Hola!%20Vengo%20de%20la%20App%20ShopDigital%20por%20el%20beneficio:%20*${offer.title || offer.discountLabel}*`, '_blank');
                                            }
                                        }}
                                        className="neu-btn-3d-active py-1 px-3 text-[7.5px] font-black uppercase tracking-wider text-[#2c2440]"
                                    >
                                        Aprovechar
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
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

export default DiscountsPage;
