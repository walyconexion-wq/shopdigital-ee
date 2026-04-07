import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Shop, Client } from '../types';
import { guardarCliente } from '../firebase';
import { CATEGORIES } from '../constants';
import {
    ChevronLeft,
    Gift,
    Phone,
    User,
    UserCircle,
    Mail,
    ShieldCheck
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

    const activeCatSlug = useMemo(() => {
        if (categorySlug) return categorySlug;
        if (selectedShop) {
            return CATEGORIES.find(c => c.id === selectedShop.category)?.slug || 'comercio';
        }
        return 'comercio';
    }, [categorySlug, selectedShop]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        playNeonClick();
        
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

        const newClient: Client = {
            id: clientId,
            name: formData.name,
            phone: cleanPhone,
            email: formData.email,
            sourceShopId: selectedShop.id,
            sourceShopName: selectedShop.name,
            createdAt: new Date().toISOString(),
            townId, // SELLO REGIONAL 🛡️
            status: 'active', // Estado inicial 🟢
            cardColor: '#22d3ee' // Color Cyan por defecto
        };

        try {
            await guardarCliente(newClient, townId);
            playSuccessSound();
            
            // REDIRECCIÓN DIRECTA A LA CREDENCIAL VIP PERSONALIZADA 💎✨
            const targetPath = `/${townId}/${activeCatSlug}/${shopSlug}/credencial-vip/${clientId}`;
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
            <div className="flex flex-col items-center justify-center min-h-screen text-white bg-black p-8 text-center">
                <ShieldCheck size={48} className="text-cyan-400 mb-6 animate-pulse opacity-20" />
                <h2 className="text-xl font-black uppercase tracking-widest mb-2">Radar Sincronizando...</h2>
                <p className="text-white/40 text-[10px] uppercase leading-relaxed">El comercio de origen no se encuentra <br/> en este universo regional.</p>
                <button onClick={() => navigate('/')} className="mt-8 bg-zinc-900 border border-white/10 px-8 py-3 rounded-2xl text-cyan-400 font-black uppercase tracking-widest text-[9px] hover:bg-white/5 transition-all">Regresar al Inicio</button>
            </div>
        );
    }

    const formattedTown = townId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    return (
        <div className="min-h-screen bg-black text-white pb-24 relative overflow-x-hidden selection:bg-cyan-500/30">
            {/* HUD Background Layers */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.02)_1px,transparent_1px)] bg-[size:30px_30px]" />
            </div>

            <div className="bg-zinc-900/50 backdrop-blur-md pt-8 pb-6 px-8 flex flex-col items-center border-b border-cyan-500/20 mb-8 sticky top-0 z-50">
                <button onClick={() => { playNeonClick(); navigate(-1); }} 
                    className="self-start mb-4 w-10 h-10 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-400/30 hover:bg-cyan-500/20 transition-all shadow-lg">
                    <ChevronLeft size={20} />
                </button>
                <div className="flex items-center gap-2 mb-1">
                    <UserCircle size={22} className="text-cyan-400" />
                    <h2 className="text-[18px] font-[1000] text-white uppercase tracking-[0.2em] drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">Registro VIP</h2>
                </div>
                <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.4em] mt-2 italic">{formattedTown}</p>
                <div className="mt-4 px-5 py-2 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 shadow-inner">
                    <p className="text-[8px] font-black text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                        <Store size={10} /> Invitación de: {selectedShop.name}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="px-8 space-y-6 max-w-sm mx-auto relative z-10 animate-in slide-in-from-bottom-6 duration-700">
                <div className="glass-card-3d bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-8 space-y-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl" />
                    
                    <div className="space-y-6">
                        <div className="group">
                            <label className="text-[9px] flex items-center gap-2 font-black uppercase tracking-[0.25em] text-white/30 group-focus-within:text-cyan-400 transition-colors mb-2 ml-1">
                                <User size={12} /> Nombre y Apellido
                            </label>
                            <input
                                required
                                placeholder="EJ: WALY MIRANDA"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-black text-white placeholder:text-white/10 focus:outline-none focus:border-cyan-400/50 transition-all uppercase"
                            />
                        </div>

                        <div className="group">
                            <label className="text-[9px] flex items-center gap-2 font-black uppercase tracking-[0.25em] text-white/30 group-focus-within:text-cyan-400 transition-colors mb-2 ml-1">
                                <Phone size={12} /> WhatsApp (Sin Ceros)
                            </label>
                            <input
                                required
                                type="tel"
                                placeholder="EJ: 1122334455"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-black text-white focus:outline-none focus:border-cyan-400/50 transition-all tabular-nums"
                            />
                        </div>

                        <div className="group">
                            <label className="text-[9px] flex items-center gap-2 font-black uppercase tracking-[0.25em] text-white/30 group-focus-within:text-cyan-400 transition-colors mb-2 ml-1">
                                <Mail size={12} /> Correo Electrónico
                            </label>
                            <input
                                required
                                type="email"
                                placeholder="EJ: WALY@SHOPDIGITAL.AR"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold text-white focus:outline-none focus:border-cyan-400/50 transition-all"
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-4">
                    <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-6 bg-cyan-600 hover:bg-cyan-500 rounded-[2rem] flex flex-col items-center justify-center gap-2 font-[1000] uppercase tracking-[0.2em] text-[11px] shadow-[0_10px_40px_rgba(34,211,238,0.2)] active:scale-95 transition-all text-white disabled:opacity-50 border border-white/20"
                    >
                        {isSubmitting ? (
                            <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Gift size={20} className="text-white animate-bounce" />
                                <span>Activar Mi Credencial VIP</span>
                            </>
                        )}
                    </button>
                    <div className="mt-8 p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-center">
                         <p className="text-[7px] text-white/20 uppercase tracking-[0.4em] font-black leading-relaxed">
                            Al registrarte aceptás los términos y condiciones <br/> de la red de beneficios exclusivos ShopDigital.
                        </p>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default ClientSubscriptionPage;
