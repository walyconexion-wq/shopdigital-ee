import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Shop, Client } from '../types';
import { guardarCliente } from '../firebase';
import {
    ChevronLeft,
    Gift,
    Phone,
    User,
    UserCircle
} from 'lucide-react';
import { playNeonClick, playSuccessSound } from '../utils/audio';

interface ClientSubscriptionPageProps {
    allShops: Shop[];
}

const ClientSubscriptionPage: React.FC<ClientSubscriptionPageProps> = ({ allShops }) => {
    const { townId = 'esteban-echeverria', categorySlug, shopSlug } = useParams<{ townId: string; categorySlug: string; shopSlug: string }>();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: ''
    });

    const selectedShop = useMemo(() =>
        allShops.find(shop => (shop.slug || shop.id) === shopSlug),
        [shopSlug, allShops]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        playNeonClick();
        
        // WhatsApp format cleaning for ID consistency
        const cleanPhone = formData.phone.replace(/\D/g, '');

        if (!formData.name || !cleanPhone || !formData.email) {
            alert("Por favor completá todos los campos para suscribirte.");
            return;
        }

        if (!selectedShop) {
            alert("Error: Comercio de origen no encontrado.");
            return;
        }

        setIsSubmitting(true);

        // ID ÚNICO BASADO EN TELÉFONO O TIMESTAMP
        const clientId = `client-${cleanPhone || Date.now()}`;

        const newClient: Client & { subscribedTo?: string } = {
            id: clientId,
            name: formData.name,
            phone: cleanPhone,
            email: formData.email,
            sourceShopId: selectedShop.id,
            sourceShopName: selectedShop.name,
            createdAt: new Date().toISOString(),
            subscribedTo: selectedShop.id,
            townId // SELLO REGIONAL 🛡️
        };

        try {
            // INYECCIÓN DE townId PARA EVITAR FUGAS A LA "CLOACA" GLOBAL 🛡️⚓
            await guardarCliente(newClient, townId);
            playSuccessSound();
            
            // REDIRECCIÓN DIRECTA A LA CREDENCIAL VIP PERSONALIZADA 💎✨
            const targetPath = `/${townId}/${categorySlug}/${shopSlug}/credencial-vip/${clientId}`;
            navigate(targetPath);
        } catch (error) {
            console.error(error);
            alert("Hubo un error al suscribirte. Por favor intentá nuevamente.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!selectedShop) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-white bg-black">
                <div className="animate-pulse text-cyan-400 mb-4 font-black uppercase tracking-widest text-xs">Sincronizando Multiverso...</div>
                <p className="text-white/40 text-[10px] uppercase">Comercio no encontrado</p>
                <button onClick={() => navigate('/')} className="mt-8 bg-zinc-900 border border-white/10 px-6 py-2 rounded-xl text-cyan-400 font-bold uppercase tracking-widest text-[9px]">Ir al Inicio</button>
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
                }} className="self-start mb-4 w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/10 transition-all shadow-lg active:scale-95"><ChevronLeft size={20} /></button>
                <div className="flex items-center gap-2 mb-1">
                    <UserCircle size={22} className="text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                    <h2 className="text-[18px] font-[1000] text-white uppercase tracking-[0.2em] drop-shadow-[0_0_10px_rgba(34,211,238,0.3)] text-center">Registro VIP</h2>
                </div>
                <p className="text-[9px] font-bold text-white/40 uppercase tracking-[0.3em] text-center mt-2 px-4 italic">Sede: {townId.replace(/-/g, ' ').toUpperCase()}</p>
                <p className="text-[8px] font-black text-cyan-400/80 uppercase tracking-widest text-center mt-3 bg-cyan-500/10 px-4 py-1 rounded-full border border-cyan-500/20 shadow-inner">
                    Invitado por: {selectedShop.name}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="px-8 space-y-6 max-w-lg mx-auto relative z-10 animate-in slide-in-from-bottom-6 duration-700">
                <div className="glass-card-3d bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-8 space-y-6 shadow-2xl">
                    <div className="focus-within:bg-white/[0.01] rounded-xl transition-colors">
                        <label className="text-[9px] flex items-center gap-2 font-black uppercase tracking-[0.25em] text-cyan-400/70 mb-2">
                            <User size={12} /> Nombre y Apellido
                        </label>
                        <input
                            required
                            placeholder="Ej: Waly Miranda"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-transparent border-b border-white/10 pb-3 text-lg font-black text-white placeholder:text-white/10 focus:outline-none focus:border-cyan-400 transition-all uppercase tracking-tight"
                        />
                    </div>

                    <div className="focus-within:bg-white/[0.01] rounded-xl transition-colors">
                        <label className="text-[9px] flex items-center gap-2 font-black uppercase tracking-[0.25em] text-cyan-400/70 mb-2">
                             WhatsApp (Sin Ceros)
                        </label>
                        <input
                            required
                            type="tel"
                            placeholder="Ej: 1122334455"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full bg-transparent border-b border-white/10 pb-3 text-lg font-black text-white placeholder:text-white/10 focus:outline-none focus:border-cyan-400 transition-all font-inter tabular-nums"
                        />
                    </div>

                    <div className="focus-within:bg-white/[0.01] rounded-xl transition-colors">
                        <label className="text-[9px] flex items-center gap-2 font-black uppercase tracking-[0.25em] text-cyan-400/70 mb-2">
                             Correo Electrónico
                        </label>
                        <input
                            required
                            type="email"
                            placeholder="Ej: waly@shopdigital.tech"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full bg-transparent border-b border-white/10 pb-3 text-lg font-bold text-white placeholder:text-white/10 focus:outline-none focus:border-cyan-400 transition-all lowercase"
                        />
                    </div>
                </div>

                <div className="pt-6">
                    <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-20 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-3xl flex flex-col items-center justify-center gap-1 font-black uppercase tracking-[0.2em] text-[12px] shadow-[0_10px_30px_rgba(34,211,238,0.3)] active:scale-95 transition-all text-white disabled:opacity-50 border border-white/20"
                    >
                        {isSubmitting ? (
                            <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Gift size={22} className="text-white drop-shadow-lg" />
                                <span>Obtener Mi Credencial</span>
                            </>
                        )}
                    </button>
                    <p className="text-[7px] text-center text-white/20 uppercase tracking-[0.4em] font-black mt-6 leading-relaxed">
                        Al registrarte aceptás los términos y condiciones <br/> de la red de beneficios ShopDigital.
                    </p>
                </div>
            </form>
        </div>
    );
};

export default ClientSubscriptionPage;
