import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { guardarComercio } from '../firebase';
import { Shop } from '../types';
import { CATEGORIES } from '../constants';
import {
    ChevronLeft,
    Rocket,
    Camera,
    MapPin,
    Phone,
    User,
    Store,
    Tag,
    CheckCircle2
} from 'lucide-react';
import { playNeonClick, playSuccessSound } from '../utils/audio';

const LOCALITIES = ['Monte Grande', 'Luis Guillón', 'El Jagüel'];

const SubscriptionPage: React.FC = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        category: CATEGORIES[0].id,
        zone: LOCALITIES[0],
        bannerImage: '',
        ownerName: '',
        phone: ''
    });

    const generateSlug = (text: string) => {
        return text.toString().toLowerCase()
            .replace(/\s+/g, '-')           // Replace spaces with -
            .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
            .replace(/\-\-+/g, '-')         // Replace multiple - with single -
            .replace(/^-+/, '')             // Trim - from start of text
            .replace(/-+$/, '');            // Trim - from end of text
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        playNeonClick();
        
        if (!formData.name || !formData.bannerImage || !formData.ownerName || !formData.phone) {
            alert("Por favor completá todos los datos mínimos para crear tu catálogo.");
            return;
        }

        setIsSubmitting(true);

        const newShop: Shop = {
            id: `shop-${Date.now()}`,
            slug: generateSlug(formData.name),
            name: formData.name,
            category: formData.category,
            zone: formData.zone,
            bannerImage: formData.bannerImage,
            image: formData.bannerImage, // Same as banner initially
            ownerName: formData.ownerName,
            phone: formData.phone,
            rating: 5.0, // Initial perfect rating
            isActive: true, // Visible immediately
            specialty: '',
            address: formData.zone, // Defaults to zone
            offers: [],
            mapUrl: '',
            mapSheetUrl: '',
            instagram: '',
            facebook: '',
            tiktok: ''
        };

        try {
            await guardarComercio(newShop);
            playSuccessSound();
            setShowSuccess(true);
        } catch (error) {
            console.error(error);
            alert("Hubo un error al crear tu comercio. Por favor intentá nuevamente.");
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
                        <CheckCircle2 size={40} className="text-cyan-400" />
                    </div>
                    
                    <h2 className="text-2xl font-[1000] text-white uppercase tracking-tighter mb-4 text-center text-shadow-premium">
                        ¡Misión Exitosa!
                    </h2>
                    
                    <p className="text-[12px] font-bold text-white/80 text-center leading-relaxed mb-8">
                        Tu comercio <span className="text-cyan-400">{formData.name}</span> ya tiene visibilidad básica en la red. 
                        Un embajador de zona se comunicará pronto para confirmar tus datos.
                        <br/><br/>
                        Al suscribirte al Club B2B, podrás activar el catálogo completo.
                    </p>
                    
                    <button
                        onClick={() => {
                            playNeonClick();
                            navigate('/');
                        }}
                        className="w-full glass-action-btn btn-cyan-neon py-4 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.3)] active:scale-95 transition-all"
                    >
                        <span className="font-black uppercase tracking-widest text-[11px] text-white">Entrar a la App</span>
                    </button>
                </div>
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
                    <Rocket size={18} className="text-cyan-400" />
                    <h2 className="text-[18px] font-black text-white uppercase tracking-[0.2em] drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">Suma Tu Comercio</h2>
                </div>
                <p className="text-[9px] font-bold text-white/50 uppercase tracking-widest text-center mt-2 px-4 shadow-black">Completá los datos y ganá visibilidad en la red comercial.</p>
            </div>

            <form onSubmit={handleSubmit} className="px-8 space-y-6 max-w-lg mx-auto relative z-10 animate-in slide-in-from-bottom-6 duration-700">
                {/* Nombre Comercio */}
                <div className="glass-card-3d bg-white/[0.02] border border-white/10 rounded-3xl p-6 focus-within:border-cyan-500/50 transition-colors">
                    <div className="flex justify-between items-center mb-4">
                        <label className="text-[10px] flex items-center gap-2 font-black uppercase tracking-[0.2em] text-cyan-400">
                            <Store size={14} /> Marca Comercial
                        </label>
                        <span className="text-[8px] text-red-400 font-bold uppercase">* Requerido</span>
                    </div>
                    <input
                        required
                        placeholder="Ej: Pizzería El Buen Gusto"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-transparent border-b border-white/20 pb-2 text-white text-lg font-bold placeholder:text-white/20 focus:outline-none focus:border-cyan-400 transition-all"
                    />
                </div>

                {/* Rubro y Localidad */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="glass-card-3d bg-white/[0.02] border border-white/10 rounded-3xl p-5 focus-within:border-cyan-500/50 transition-colors">
                        <label className="text-[9px] flex items-center gap-1.5 font-black uppercase tracking-[0.2em] text-cyan-400 mb-3">
                            <Tag size={12} /> Rubro
                        </label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full bg-transparent border-b border-white/20 pb-2 text-white text-sm font-bold focus:outline-none focus:border-cyan-400 transition-all"
                        >
                            {CATEGORIES.map(cat => (
                                <option key={cat.id} value={cat.id} className="bg-zinc-900 text-white">{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="glass-card-3d bg-white/[0.02] border border-white/10 rounded-3xl p-5 focus-within:border-cyan-500/50 transition-colors">
                        <label className="text-[9px] flex items-center gap-1.5 font-black uppercase tracking-[0.2em] text-cyan-400 mb-3">
                            <MapPin size={12} /> Localidad
                        </label>
                        <select
                            value={formData.zone}
                            onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                            className="w-full bg-transparent border-b border-white/20 pb-2 text-white text-sm font-bold focus:outline-none focus:border-cyan-400 transition-all"
                        >
                            {LOCALITIES.map(loc => (
                                <option key={loc} value={loc} className="bg-zinc-900 text-white">{loc}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Foto Portada (URL) */}
                <div className="glass-card-3d bg-white/[0.02] border border-white/10 rounded-3xl p-6 focus-within:border-cyan-500/50 transition-colors">
                    <div className="flex justify-between items-center mb-4">
                        <label className="text-[10px] flex items-center gap-2 font-black uppercase tracking-[0.2em] text-cyan-400">
                            <Camera size={14} /> Logo / Portada
                        </label>
                        <span className="text-[8px] text-red-400 font-bold uppercase">* Requerido</span>
                    </div>
                    <p className="text-[8px] text-white/40 font-bold uppercase tracking-widest leading-relaxed mb-3">
                        Por la regla "No Base64", pegá el link directo de tu imagen (ej: Facebook o Instagram). Para cambiarla luego, contactá a tu embajador.
                    </p>
                    <input
                        required
                        type="url"
                        placeholder="https://..."
                        value={formData.bannerImage}
                        onChange={(e) => setFormData({ ...formData, bannerImage: e.target.value })}
                        className="w-full bg-transparent border-b border-white/20 pb-2 text-blue-400 text-sm focus:outline-none focus:border-cyan-400 transition-all"
                    />
                </div>

                {/* Owner Data */}
                <div className="glass-card-3d bg-white/[0.02] border border-white/10 rounded-3xl p-6 space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                        <User size={14} className="text-cyan-400" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">Titular de Contacto</h3>
                    </div>
                    
                    <div className="focus-within:bg-white/[0.01] rounded-xl transition-colors">
                        <label className="text-[9px] font-bold uppercase tracking-[0.1em] text-white/40 mb-2 block">Nombre Completo</label>
                        <input
                            required
                            placeholder="Ej: Juan Pérez"
                            value={formData.ownerName}
                            onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                            className="w-full bg-transparent border-b border-white/10 pb-2 text-white text-sm focus:outline-none focus:border-cyan-400 transition-all"
                        />
                    </div>

                    <div className="focus-within:bg-white/[0.01] rounded-xl transition-colors">
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-[9px] font-bold uppercase tracking-[0.1em] text-white/40 block">Celular / WhatsApp</label>
                            <Phone size={10} className="text-green-400" />
                        </div>
                        <input
                            required
                            type="tel"
                            placeholder="Ej: 1122334455"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full bg-transparent border-b border-white/10 pb-2 text-white text-sm focus:outline-none focus:border-cyan-400 transition-all"
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
                                <Rocket size={20} className="text-white drop-shadow-md" /> Iniciar Misión
                            </>
                        )}
                    </button>
                    <p className="text-[7px] text-center text-white/30 uppercase tracking-[0.3em] font-bold mt-4">
                        Al enviar, aceptás los términos y condiciones de la red ShopDigital.
                    </p>
                </div>
            </form>
        </div>
    );
};

export default SubscriptionPage;
