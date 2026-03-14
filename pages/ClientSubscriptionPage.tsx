import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Shop, Client } from '../types';
import { guardarCliente } from '../firebase';
import {
    ChevronLeft,
    Gift,
    Phone,
    User,
    PartyPopper
} from 'lucide-react';
import { playNeonClick, playSuccessSound } from '../utils/audio';

interface ClientSubscriptionPageProps {
    allShops: Shop[];
}

const ClientSubscriptionPage: React.FC<ClientSubscriptionPageProps> = ({ allShops }) => {
    const { categorySlug, shopSlug } = useParams<{ categorySlug: string; shopSlug: string }>();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        phone: ''
    });

    const selectedShop = useMemo(() =>
        allShops.find(shop => (shop.slug || shop.id) === shopSlug),
        [shopSlug, allShops]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        playNeonClick();
        
        if (!formData.name || !formData.phone) {
            alert("Por favor completá los datos para suscribirte.");
            return;
        }

        if (!selectedShop) {
            alert("Error: Comercio de origen no encontrado.");
            return;
        }

        setIsSubmitting(true);

        const newClient: Client = {
            id: `client-${Date.now()}`,
            name: formData.name,
            phone: formData.phone,
            sourceShopId: selectedShop.id,
            sourceShopName: selectedShop.name,
            createdAt: new Date().toISOString()
        };

        try {
            await guardarCliente(newClient);
            playSuccessSound();
            setShowSuccess(true);
        } catch (error) {
            console.error(error);
            alert("Hubo un error al suscribirte. Por favor intentá nuevamente.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (showSuccess) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 animate-in zoom-in duration-500">
                <div className="w-full max-w-sm glass-card-3d border border-cyan-400/50 rounded-[2rem] p-10 backdrop-blur-xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-cyan-500/10 pointer-events-none" />
                    
                    <div className="w-20 h-20 bg-cyan-500/20 rounded-full flex items-center justify-center mb-6 mx-auto border border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.5)]">
                        <PartyPopper size={40} className="text-cyan-400" />
                    </div>
                    
                    <h2 className="text-2xl font-[1000] text-white uppercase tracking-tighter mb-4 text-center text-shadow-premium">
                        ¡Felicitaciones!
                    </h2>
                    
                    <p className="text-[12px] font-bold text-white/80 text-center leading-relaxed mb-8">
                        Sos parte de nuestra red de descuentos para clientes suscriptos.
                        <br/><br/>
                        Entrá y disfrutá de los mejores beneficios de la zona.
                    </p>
                    
                    <button
                        onClick={() => {
                            playNeonClick();
                            navigate('/red-comercial/ofertas');
                        }}
                        className="w-full glass-action-btn btn-cyan-neon py-4 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.3)] active:scale-95 transition-all"
                    >
                        <span className="font-black uppercase tracking-widest text-[11px] text-white">Ver Ofertas</span>
                    </button>
                </div>
            </div>
        );
    }

    if (!selectedShop) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-white bg-black">
                <p>Comercio no encontrado</p>
                <button onClick={() => navigate('/')} className="mt-4 text-cyan-400 font-bold uppercase tracking-widest text-[10px]">Volver al inicio</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white pb-24 relative overflow-x-hidden selection:bg-cyan-500/30">
            {/* HUD Background Layers */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.02)_1px,transparent_1px)] bg-[size:30px_30px]" />
            </div>

            <div className="bg-zinc-900/50 backdrop-blur-md pt-8 pb-6 px-8 flex flex-col items-center border-b border-white/5 mb-8 sticky top-0 z-50">
                <button onClick={() => {
                    playNeonClick();
                    navigate(-1);
                }} className="self-start mb-4 w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/10 transition-all"><ChevronLeft size={20} /></button>
                <div className="flex items-center gap-2 mb-1">
                    <Gift size={18} className="text-cyan-400" />
                    <h2 className="text-[18px] font-black text-white uppercase tracking-[0.2em] drop-shadow-[0_0_10px_rgba(34,211,238,0.5)] text-center">Club de Ofertas</h2>
                </div>
                <p className="text-[9px] font-bold text-white/50 uppercase tracking-widest text-center mt-2 px-4 shadow-black">Suscribite para recibir descuentos exclusivos de la red.</p>
                <p className="text-[8px] font-black text-cyan-400/80 uppercase tracking-widest text-center mt-2">Invitado por: {selectedShop.name}</p>
            </div>

            <form onSubmit={handleSubmit} className="px-8 space-y-6 max-w-lg mx-auto relative z-10 animate-in slide-in-from-bottom-6 duration-700">
                <div className="glass-card-3d bg-white/[0.02] border border-white/10 rounded-3xl p-6 space-y-6">
                    <div className="focus-within:bg-white/[0.01] rounded-xl transition-colors">
                        <label className="text-[9px] flex items-center gap-2 font-black uppercase tracking-[0.2em] text-cyan-400 mb-2">
                            <User size={12} /> Nombre Completo
                        </label>
                        <input
                            required
                            placeholder="Ej: Juan Pérez"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-transparent border-b border-white/10 pb-2 text-white text-lg font-bold placeholder:text-white/20 focus:outline-none focus:border-cyan-400 transition-all"
                        />
                    </div>

                    <div className="focus-within:bg-white/[0.01] rounded-xl transition-colors">
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-[9px] flex items-center gap-2 font-black uppercase tracking-[0.2em] text-cyan-400">
                                <Phone size={12} /> WhatsApp
                            </label>
                        </div>
                        <input
                            required
                            type="tel"
                            placeholder="Ej: 1122334455"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full bg-transparent border-b border-white/10 pb-2 text-white text-lg font-bold placeholder:text-white/20 focus:outline-none focus:border-cyan-400 transition-all"
                        />
                    </div>
                </div>

                <div className="pt-4">
                    <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full glass-action-btn btn-cyan-neon py-5 rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-[0.2em] text-[12px] shadow-[0_0_30px_rgba(34,211,238,0.3)] active:scale-95 transition-all text-white disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Gift size={20} className="text-white drop-shadow-md" /> Suscribirme Ahora
                            </>
                        )}
                    </button>
                    <p className="text-[7px] text-center text-white/30 uppercase tracking-[0.3em] font-bold mt-4">
                        Al enviar, aceptás sumarte a la red de beneficios.
                    </p>
                </div>
            </form>
        </div>
    );
};

export default ClientSubscriptionPage;
