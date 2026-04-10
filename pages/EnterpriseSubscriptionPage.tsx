// ShopDigital — Formulario de Inscripción de Empresa/Fábrica (Embudo B2B) 🏭📝
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { guardarComercio } from '../firebase';
import { ENTERPRISE_CATEGORIES } from '../enterpriseConstants';
import { Shop } from '../types';
import {
    ChevronLeft, Factory, Camera, Phone, User, Tag,
    PartyPopper, ImagePlus, Globe, MapPin, FileText, MessageCircle
} from 'lucide-react';
import { playNeonClick, playSuccessSound } from '../utils/audio';

const REACH_OPTIONS = [
    { value: 'national', label: 'Nacional 🌎', desc: 'Opera en todo el país' },
    { value: 'regional', label: 'Regional 📍', desc: 'Opera en la zona/provincia' },
];

// Número de WhatsApp del Director para recibir inscripciones
const DIRECTOR_WHATSAPP = '5491122334455';

const EnterpriseSubscriptionPage: React.FC = () => {
    const { townId = 'esteban-echeverria' } = useParams<{ townId: string }>();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        category: ENTERPRISE_CATEGORIES[0].id,
        reach: 'national' as 'national' | 'regional',
        specialty: '',
        ownerName: '',
        phone: '',
        address: '',
        bannerImage: '',
    });

    const generateSlug = (text: string) =>
        text.toString().toLowerCase()
            .replace(/\s+/g, '-').replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-').replace(/^-+/, '').replace(/-+$/, '');

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX = 600;
                let w = img.width, h = img.height;
                if (w > h) { if (w > MAX) { h *= MAX / w; w = MAX; } }
                else { if (h > MAX) { w *= MAX / h; h = MAX; } }
                canvas.width = w; canvas.height = h;
                canvas.getContext('2d')?.drawImage(img, 0, 0, w, h);
                setFormData(prev => ({ ...prev, bannerImage: canvas.toDataURL('image/jpeg', 0.7) }));
            };
            img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        playNeonClick();

        if (!formData.name || !formData.ownerName || !formData.phone) {
            alert('⚠️ Por favor completá todos los datos requeridos.');
            return;
        }

        setIsSubmitting(true);

        const newEnterprise: Shop = {
            id: `ent-${Date.now()}`,
            slug: generateSlug(formData.name),
            townId,
            name: formData.name,
            category: formData.category,
            zone: '',
            bannerImage: formData.bannerImage,
            image: formData.bannerImage,
            ownerName: formData.ownerName,
            phone: formData.phone,
            rating: 5.0,
            isActive: false, // ⚡ Pendiente de activación por el Director
            specialty: formData.specialty,
            address: formData.address,
            offers: [],
            mapUrl: '',
            mapSheetUrl: '',
            instagram: '',
            facebook: '',
            tiktok: '',
            entityType: 'enterprise',
            reach: formData.reach,
        };

        try {
            await guardarComercio(newEnterprise, townId);
            playSuccessSound();
            setShowSuccess(true);

            // Disparo automático de WhatsApp al Director
            const catName = ENTERPRISE_CATEGORIES.find(c => c.id === formData.category)?.name || formData.category;
            const msg = `🏭 *NUEVA INSCRIPCIÓN INDUSTRIAL*\n\n` +
                `📋 *Empresa:* ${formData.name}\n` +
                `🏷️ *Rubro:* ${catName}\n` +
                `🌎 *Alcance:* ${formData.reach === 'national' ? 'Nacional' : 'Regional'}\n` +
                `👤 *Contacto:* ${formData.ownerName}\n` +
                `📱 *Tel:* ${formData.phone}\n` +
                `📍 *Dirección:* ${formData.address || 'No especificada'}\n\n` +
                `_Enviado desde ShopDigital · Nodo Industrial_`;

            setTimeout(() => {
                window.open(`https://wa.me/${DIRECTOR_WHATSAPP}?text=${encodeURIComponent(msg)}`, '_blank');
            }, 1500);

        } catch (error) {
            console.error(error);
            alert('❌ Error al registrar. Intentá nuevamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // ═══ PANTALLA DE ÉXITO ═══
    if (showSuccess) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 animate-in zoom-in duration-500">
                <div className="w-full max-w-sm glass-card-3d border border-amber-400/50 rounded-[2rem] p-10 backdrop-blur-xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-amber-500/5 pointer-events-none" />

                    <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mb-6 mx-auto border border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.4)]">
                        <PartyPopper size={40} className="text-amber-400" />
                    </div>

                    <h2 className="text-2xl font-[1000] text-white uppercase tracking-tighter mb-4 text-center">
                        ¡Felicitaciones!
                    </h2>

                    <p className="text-[12px] font-bold text-white/80 text-center leading-relaxed mb-4">
                        Su empresa ha ingresado en el sistema de verificación del <span className="text-amber-400 font-[1000]">Nodo Industrial B2B</span>.
                    </p>
                    <p className="text-[11px] font-bold text-white/60 text-center leading-relaxed mb-8">
                        En breve, el Director de Zona se pondrá en contacto para completar su catálogo y activar su presencia en la red.
                        <br/><br/>
                        📱 <span className="text-amber-400">Se enviará un mensaje automático a WhatsApp</span> con los datos de su inscripción.
                    </p>

                    <button
                        onClick={() => { playNeonClick(); navigate(`/${townId}/empresas`); }}
                        className="w-full bg-amber-500 text-black py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] active:scale-95 transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)]"
                    >
                        Volver al Directorio Industrial
                    </button>
                </div>
            </div>
        );
    }

    // ═══ FORMULARIO ═══
    const formattedTown = townId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    return (
        <div className="min-h-screen bg-black text-white pb-24 relative overflow-x-hidden selection:bg-amber-500/30">
            {/* HUD */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-orange-500/5 rounded-full blur-[100px]" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(245,158,11,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(245,158,11,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
            </div>

            {/* Header */}
            <div className="bg-zinc-900/50 backdrop-blur-md pt-8 pb-6 px-8 flex flex-col items-center border-b border-amber-500/10 mb-8 sticky top-0 z-50">
                <button onClick={() => { playNeonClick(); navigate(-1); }}
                    className="self-start mb-4 w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition-all">
                    <ChevronLeft size={20} />
                </button>
                <div className="flex items-center gap-2 mb-1">
                    <Factory size={18} className="text-amber-400" />
                    <h2 className="text-[16px] font-black text-white uppercase tracking-[0.15em] drop-shadow-[0_0_10px_rgba(245,158,11,0.4)]">
                        Asociar Empresa al Nodo
                    </h2>
                </div>
                <p className="text-[9px] font-bold text-amber-400/60 uppercase tracking-widest text-center mt-2 px-4">
                    {formattedTown} · Directorio Industrial B2B
                </p>
            </div>

            <form onSubmit={handleSubmit} className="px-6 space-y-5 max-w-lg mx-auto relative z-10 animate-in slide-in-from-bottom-6 duration-700">
                {/* Nombre de la Empresa */}
                <div className="glass-card-3d bg-white/[0.02] border border-amber-500/15 rounded-3xl p-6 focus-within:border-amber-500/40 transition-colors">
                    <div className="flex justify-between items-center mb-4">
                        <label className="text-[10px] flex items-center gap-2 font-black uppercase tracking-[0.2em] text-amber-400">
                            <Factory size={14} /> Nombre de la Empresa
                        </label>
                        <span className="text-[8px] text-red-400 font-bold uppercase">* Requerido</span>
                    </div>
                    <input
                        required
                        placeholder="Ej: Distribuidora Los Andes S.A."
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-transparent border-b border-white/20 pb-2 text-white text-lg font-bold placeholder:text-white/20 focus:outline-none focus:border-amber-400 transition-all"
                    />
                </div>

                {/* Rubro y Alcance */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="glass-card-3d bg-white/[0.02] border border-amber-500/15 rounded-3xl p-5 focus-within:border-amber-500/40 transition-colors">
                        <label className="text-[9px] flex items-center gap-1.5 font-black uppercase tracking-[0.2em] text-amber-400 mb-3">
                            <Tag size={12} /> Rubro Industrial
                        </label>
                        <select
                            value={formData.category}
                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                            className="w-full bg-transparent border-b border-white/20 pb-2 text-white text-sm font-bold focus:outline-none focus:border-amber-400 transition-all"
                        >
                            {ENTERPRISE_CATEGORIES.map(cat => (
                                <option key={cat.id} value={cat.id} className="bg-zinc-900 text-white">{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="glass-card-3d bg-white/[0.02] border border-amber-500/15 rounded-3xl p-5 focus-within:border-amber-500/40 transition-colors">
                        <label className="text-[9px] flex items-center gap-1.5 font-black uppercase tracking-[0.2em] text-amber-400 mb-3">
                            <Globe size={12} /> Alcance
                        </label>
                        <select
                            value={formData.reach}
                            onChange={e => setFormData({ ...formData, reach: e.target.value as 'national' | 'regional' })}
                            className="w-full bg-transparent border-b border-white/20 pb-2 text-white text-sm font-bold focus:outline-none focus:border-amber-400 transition-all"
                        >
                            {REACH_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value} className="bg-zinc-900 text-white">{opt.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Especialidad / Descripción */}
                <div className="glass-card-3d bg-white/[0.02] border border-amber-500/15 rounded-3xl p-6 focus-within:border-amber-500/40 transition-colors">
                    <label className="text-[10px] flex items-center gap-2 font-black uppercase tracking-[0.2em] text-amber-400 mb-4">
                        <FileText size={14} /> Descripción / Especialidad
                    </label>
                    <input
                        placeholder="Ej: Fabricante de indumentaria deportiva al por mayor"
                        value={formData.specialty}
                        onChange={e => setFormData({ ...formData, specialty: e.target.value })}
                        className="w-full bg-transparent border-b border-white/20 pb-2 text-white text-sm font-bold placeholder:text-white/20 focus:outline-none focus:border-amber-400 transition-all"
                    />
                </div>

                {/* Dirección */}
                <div className="glass-card-3d bg-white/[0.02] border border-amber-500/15 rounded-3xl p-6 focus-within:border-amber-500/40 transition-colors">
                    <label className="text-[10px] flex items-center gap-2 font-black uppercase tracking-[0.2em] text-amber-400 mb-4">
                        <MapPin size={14} /> Dirección / Ubicación
                    </label>
                    <input
                        placeholder="Ej: Parque Industrial Ezeiza, Nave 12"
                        value={formData.address}
                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                        className="w-full bg-transparent border-b border-white/20 pb-2 text-white text-sm font-bold placeholder:text-white/20 focus:outline-none focus:border-amber-400 transition-all"
                    />
                </div>

                {/* Logo / Foto */}
                <div className="glass-card-3d bg-white/[0.02] border border-amber-500/15 rounded-3xl p-6">
                    <label className="text-[10px] flex items-center gap-2 font-black uppercase tracking-[0.2em] text-amber-400 mb-4">
                        <Camera size={14} /> Logo / Imagen (Opcional)
                    </label>
                    <label className="w-full flex flex-col items-center justify-center py-6 border-2 border-dashed border-white/15 rounded-2xl cursor-pointer hover:border-amber-400/40 hover:bg-amber-500/5 transition-all">
                        <ImagePlus size={24} className="text-amber-400 mb-2" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">Cargar imagen</span>
                        <input type="file" accept="image/*" capture="environment" onChange={handleImageUpload} className="hidden" />
                    </label>
                    {formData.bannerImage && (
                        <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-amber-400/30 mt-4">
                            <img src={formData.bannerImage} alt="Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2 px-4">
                                <span className="text-[8px] font-black text-amber-400 uppercase tracking-widest">Imagen lista</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Datos de Contacto */}
                <div className="glass-card-3d bg-white/[0.02] border border-amber-500/15 rounded-3xl p-6 space-y-5">
                    <div className="flex items-center gap-2 mb-1">
                        <User size={14} className="text-amber-400" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400">Contacto de la Empresa</h3>
                    </div>

                    <div>
                        <label className="text-[9px] font-bold uppercase tracking-[0.1em] text-white/40 mb-2 block">Nombre del Responsable</label>
                        <input
                            required
                            placeholder="Ej: Carlos Martínez"
                            value={formData.ownerName}
                            onChange={e => setFormData({ ...formData, ownerName: e.target.value })}
                            className="w-full bg-transparent border-b border-white/10 pb-2 text-white text-sm focus:outline-none focus:border-amber-400 transition-all"
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-[9px] font-bold uppercase tracking-[0.1em] text-white/40">WhatsApp</label>
                            <MessageCircle size={10} className="text-green-400" />
                        </div>
                        <input
                            required
                            type="tel"
                            placeholder="Ej: 1122334455"
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full bg-transparent border-b border-white/10 pb-2 text-white text-sm focus:outline-none focus:border-amber-400 transition-all"
                        />
                    </div>
                </div>

                {/* Submit */}
                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-black py-5 rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-[0.2em] text-[12px] shadow-[0_0_30px_rgba(245,158,11,0.3)] active:scale-95 transition-all disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                        ) : (
                            <>
                                <Factory size={20} /> Ingresar mi Empresa
                            </>
                        )}
                    </button>
                    <p className="text-[7px] text-center text-white/30 uppercase tracking-[0.3em] font-bold mt-4">
                        Al enviar, aceptás los términos y condiciones de la red ShopDigital Industrial.
                    </p>
                </div>
            </form>
        </div>
    );
};

export default EnterpriseSubscriptionPage;
