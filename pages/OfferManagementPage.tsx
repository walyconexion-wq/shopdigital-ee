import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Offer } from '../types';
import { guardarOferta, eliminarOferta } from '../firebase';
import {
    ChevronLeft,
    Plus,
    Trash2,
    Eye,
    Edit3,
    Power,
    PowerOff,
    Tag,
    Store,
    MapPin,
    Calendar,
    Package
} from 'lucide-react';
import { playNeonClick, playSuccessSound } from '../utils/audio';

interface OfferManagementPageProps {
    allOffers: Offer[];
}

const OfferManagementPage: React.FC<OfferManagementPageProps> = ({ allOffers }) => {
    const navigate = useNavigate();
    const { target, townId = 'esteban-echeverria' } = useParams<{ target: string, townId: string }>();

    const offerTarget = (target?.toUpperCase() || 'B2B') as 'B2B' | 'B2C';
    const filteredOffers = allOffers.filter(o => o.target === offerTarget);

    const toggleActive = async (offer: Offer) => {
        playNeonClick();
        try {
            await guardarOferta({ ...offer, isActive: !offer.isActive });
            playSuccessSound();
        } catch (err) {
            alert('Error al cambiar el estado.');
        }
    };

    const handleDelete = async (offer: Offer) => {
        playNeonClick();
        if (window.confirm(`¿Estás seguro de eliminar "${offer.title}"? Esta acción no se puede deshacer.`)) {
            try {
                await eliminarOferta(offer.id);
                playSuccessSound();
            } catch (err) {
                alert('Error al eliminar.');
            }
        }
    };

    const handlePreview = (offer: Offer) => {
        playNeonClick();
        if (offer.target === 'B2B') {
            navigate('/red-comercial/descuentos');
        } else {
            navigate('/red-comercial/ofertas');
        }
    };

    const COLORS = offerTarget === 'B2B'
        ? { accent: 'cyan', border: 'border-cyan-500/30', bg: 'bg-cyan-500/10', text: 'text-cyan-300', shadow: 'shadow-[0_0_15px_rgba(34,211,238,0.2)]' }
        : { accent: 'green', border: 'border-green-500/30', bg: 'bg-green-500/10', text: 'text-green-300', shadow: 'shadow-[0_0_15px_rgba(34,197,94,0.2)]' };

    return (
        <div className="min-h-screen bg-black text-white pb-24 relative overflow-x-hidden">
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.02)_1px,transparent_1px)] bg-[size:30px_30px]" />
            </div>

            {/* Header */}
            <div className="bg-zinc-900/50 backdrop-blur-md pt-8 pb-6 px-6 flex flex-col items-center border-b border-cyan-500/20 mb-6 sticky top-0 z-50">
                <button onClick={() => { playNeonClick(); navigate(`/${townId}/embajador`); }}
                    className="self-start mb-4 w-10 h-10 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-400/30 hover:bg-cyan-500/20 transition-all shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                    <ChevronLeft size={20} />
                </button>
                <div className="flex items-center gap-2 mb-1">
                    <Tag size={18} className={COLORS.text} />
                    <h2 className="text-[15px] font-black text-white uppercase tracking-[0.15em] drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
                        Ofertas {offerTarget}
                    </h2>
                </div>
                <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mt-1">
                    {offerTarget === 'B2B' ? 'Red Comercial · Descuentos entre Comerciantes' : 'Clientes de Calle · Promociones Públicas'}
                </p>
                <span className={`mt-2 text-[8px] font-black uppercase tracking-widest ${COLORS.text} ${COLORS.bg} px-3 py-1 rounded-full border ${COLORS.border}`}>
                    {filteredOffers.length} Ofertas Registradas
                </span>
            </div>

            <div className="px-5 max-w-lg mx-auto relative z-10">
                {/* Create Button */}
                <button
                    onClick={() => { playNeonClick(); navigate(`/embajador/ofertas/crear/${offerTarget.toLowerCase()}`); }}
                    className={`w-full mb-6 ${COLORS.bg} border ${COLORS.border} py-4 rounded-2xl flex items-center justify-center gap-2 font-black uppercase tracking-widest text-[10px] ${COLORS.text} active:scale-95 transition-all hover:opacity-80 ${COLORS.shadow}`}
                >
                    <Plus size={18} /> Crear Nueva Promoción
                </button>

                {/* Offers List */}
                <div className="space-y-5">
                    {filteredOffers.length === 0 ? (
                        <div className="glass-card-3d bg-white/[0.02] border border-white/10 rounded-3xl p-10 flex flex-col items-center justify-center gap-3 text-center">
                            <Tag size={24} className="text-white/20" />
                            <p className="text-[10px] text-white/40 uppercase tracking-widest leading-relaxed">
                                No hay ofertas {offerTarget} creadas todavía.
                            </p>
                        </div>
                    ) : (
                        filteredOffers.map(offer => (
                            <div key={offer.id} className={`glass-card-3d bg-white/[0.02] border ${offer.isActive ? COLORS.border : 'border-white/10'} rounded-3xl overflow-hidden relative transition-all duration-300`}>
                                {/* Status Badge */}
                                <div className={`absolute top-3 right-3 z-20 px-2.5 py-1 rounded-full text-[7px] font-black uppercase tracking-widest
                                    ${offer.isActive
                                        ? 'bg-green-500/20 text-green-300 border border-green-400/30 shadow-[0_0_10px_rgba(34,197,94,0.3)]'
                                        : 'bg-zinc-800 text-white/40 border border-white/10'}`}>
                                    {offer.isActive ? '● PUBLICADO' : '○ BORRADOR'}
                                </div>

                                {/* Banner Image */}
                                {offer.image && (
                                    <div className="w-full h-36 relative overflow-hidden">
                                        <img src={offer.image} alt={offer.title} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                        <div className="absolute bottom-3 left-4 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10">
                                            <span className="text-[10px] font-black text-yellow-300 uppercase tracking-wider">{offer.discountLabel}</span>
                                        </div>
                                    </div>
                                )}

                                <div className="p-5">
                                    <h3 className="text-lg font-[1000] text-white uppercase tracking-tighter leading-tight mb-1 pr-20">
                                        {offer.title}
                                    </h3>
                                    {offer.description && (
                                        <p className="text-[10px] text-white/50 mb-3 leading-relaxed">{offer.description}</p>
                                    )}

                                    {/* Meta Info */}
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        <span className="flex items-center gap-1 text-[8px] font-bold text-white/40 bg-white/5 px-2 py-1 rounded-full">
                                            <Store size={9} /> {offer.merchantName}
                                        </span>
                                        <span className="flex items-center gap-1 text-[8px] font-bold text-white/40 bg-white/5 px-2 py-1 rounded-full">
                                            <MapPin size={9} /> {offer.merchantZone}
                                        </span>
                                        {offer.validUntil && offer.validUntil !== 'indefinido' && (
                                            <span className="flex items-center gap-1 text-[8px] font-bold text-white/40 bg-white/5 px-2 py-1 rounded-full">
                                                <Calendar size={9} /> Hasta {offer.validUntil}
                                            </span>
                                        )}
                                        {offer.stockLimit && (
                                            <span className="flex items-center gap-1 text-[8px] font-bold text-orange-400/60 bg-orange-500/10 px-2 py-1 rounded-full">
                                                <Package size={9} /> {offer.stockLimit} unidades
                                            </span>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="grid grid-cols-4 gap-2">
                                        <button onClick={() => toggleActive(offer)}
                                            className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border text-[7px] font-black uppercase tracking-wider active:scale-95 transition-all
                                                ${offer.isActive
                                                    ? 'bg-orange-500/10 border-orange-400/30 text-orange-300'
                                                    : 'bg-green-500/10 border-green-400/30 text-green-300'}`}>
                                            {offer.isActive ? <PowerOff size={14} /> : <Power size={14} />}
                                            {offer.isActive ? 'Pausar' : 'Publicar'}
                                        </button>
                                        <button onClick={() => { playNeonClick(); navigate(`/embajador/ofertas/editar/${offer.id}`); }}
                                            className="flex flex-col items-center gap-1 py-2.5 rounded-xl border bg-blue-500/10 border-blue-400/30 text-blue-300 text-[7px] font-black uppercase tracking-wider active:scale-95 transition-all">
                                            <Edit3 size={14} /> Editar
                                        </button>
                                        <button onClick={() => handlePreview(offer)}
                                            className="flex flex-col items-center gap-1 py-2.5 rounded-xl border bg-cyan-500/10 border-cyan-400/30 text-cyan-300 text-[7px] font-black uppercase tracking-wider active:scale-95 transition-all">
                                            <Eye size={14} /> Ver
                                        </button>
                                        <button onClick={() => handleDelete(offer)}
                                            className="flex flex-col items-center gap-1 py-2.5 rounded-xl border bg-red-500/10 border-red-400/30 text-red-300 text-[7px] font-black uppercase tracking-wider active:scale-95 transition-all">
                                            <Trash2 size={14} /> Borrar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default OfferManagementPage;
