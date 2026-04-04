import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { guardarComercio } from '../firebase';
import { useTownLocalities } from '../hooks/useTownLocalities';
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
    CheckCircle2,
    PartyPopper,
    ImagePlus
} from 'lucide-react';
import { playNeonClick, playSuccessSound } from '../utils/audio';

// Las localidades se cargan dinámicamente desde Firebase según el townId (ver useTownLocalities)

const SubscriptionPage: React.FC = () => {
    const { townId = 'esteban-echeverria' } = useParams<{ townId: string }>();
    const navigate = useNavigate();
    const { localities } = useTownLocalities(townId);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        category: CATEGORIES[0].id,
        zone: '',  // se setea cuando cargan las localidades
        address: '',
        bannerImage: '',
        ownerName: '',
        phone: ''
    });

    // Setear la primera localidad como default una vez que carguen
    useEffect(() => {
        if (localities.length > 0 && !formData.zone) {
            setFormData(prev => ({ ...prev, zone: localities[0] }));
        }
    }, [localities]);

    const generateSlug = (text: string) => {
        return text.toString().toLowerCase()
            .replace(/\s+/g, '-')           // Replace spaces with -
            .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
            .replace(/\-\-+/g, '-')         // Replace multiple - with single -
            .replace(/^-+/, '')             // Trim - from start of text
            .replace(/-+$/, '');            // Trim - from end of text
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 600;
                const MAX_HEIGHT = 600;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);

                const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
                setFormData({ ...formData, bannerImage: compressedDataUrl });
            };
            img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        playNeonClick();
        
        if (!formData.name || !formData.ownerName || !formData.phone) {
            alert("Por favor completá todos los datos mínimos para crear tu catálogo.");
            return;
        }

        setIsSubmitting(true);

        const newShop: Shop = {
            id: `shop-${Date.now()}`,
            slug: generateSlug(formData.name),
            townId, // Inyectar id de base para el aislamiento multi-zona
            name: formData.name,
            category: formData.category,
            zone: formData.zone,
            bannerImage: formData.bannerImage,
            image: formData.bannerImage, // Same as banner initially
            ownerName: formData.ownerName,
            phone: formData.phone,
            rating: 5.0, // Initial perfect rating
            isActive: false, // Security: Must be approved by an ambassador
            specialty: '',
            address: formData.address || formData.zone, // Uses typed address or falls back to zone
            offers: [],
            mapUrl: '',
            mapSheetUrl: '',
            instagram: '',
            facebook: '',
            tiktok: ''
        };

        try {
            await guardarComercio(newShop, townId);
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
                        <PartyPopper size={40} className="text-cyan-400" />
                    </div>
                    
                    <h2 className="text-2xl font-[1000] text-white uppercase tracking-tighter mb-4 text-center text-shadow-premium">
                        ¡Felicitaciones!
                    </h2>
                    
                    <p className="text-[12px] font-bold text-white/80 text-center leading-relaxed mb-8">
                        Pronto un embajador de zona lo estará visitando para completar su catálogo y traerle noticias exclusivas.
                        <br/><br/>
                        Ya puede disfrutar de nuestros servicios y compartir su catálogo para promoción en la red.
                    </p>
                    
                    <button
                        onClick={() => {
                            playNeonClick();
                            navigate(`/${townId}/home`);
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
                    <h2 className="text-[18px] font-black text-white uppercase tracking-[0.2em] drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">Suma Tu Comercio · {townId.replace(/-/g, ' ')}</h2>
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
                            {localities.map(loc => (
                                <option key={loc} value={loc} className="bg-zinc-900 text-white">{loc}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Dirección del Local */}
                <div className="glass-card-3d bg-white/[0.02] border border-white/10 rounded-3xl p-6 focus-within:border-cyan-500/50 transition-colors">
                    <div className="flex justify-between items-center mb-4">
                        <label className="text-[10px] flex items-center gap-2 font-black uppercase tracking-[0.2em] text-cyan-400">
                            <MapPin size={14} /> Dirección del Local
                        </label>
                        <span className="text-[8px] text-red-400 font-bold uppercase">* Requerido</span>
                    </div>
                    <input
                        required
                        placeholder={`Ej: Av. Principal 123, ${formData.zone || (localities[0] || 'tu localidad')}`}
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full bg-transparent border-b border-white/20 pb-2 text-white text-sm font-bold placeholder:text-white/20 focus:outline-none focus:border-cyan-400 transition-all"
                    />
                </div>

                {/* Foto Portada (Opcional - Input de Archivo) */}
                <div className="glass-card-3d bg-white/[0.02] border border-white/10 rounded-3xl p-6 focus-within:border-cyan-500/50 transition-colors">
                    <div className="flex justify-between items-center mb-4">
                        <label className="text-[10px] flex items-center gap-2 font-black uppercase tracking-[0.2em] text-cyan-400">
                            <Camera size={14} /> Logo / Foto (Opcional)
                        </label>
                    </div>
                    
                    <div className="flex flex-col gap-4">
                        <label className="w-full flex flex-col items-center justify-center py-6 border-2 border-dashed border-white/20 rounded-2xl cursor-pointer hover:border-cyan-400/50 hover:bg-cyan-500/5 transition-all">
                            <ImagePlus size={24} className="text-cyan-400 mb-2" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">Cargar de cámara o archivo</span>
                            <input
                                type="file"
                                accept="image/*"
                                capture="environment"
                                onChange={handleImageUpload}
                                className="hidden"
                            />
                        </label>

                        {formData.bannerImage && (
                            <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-cyan-400/30">
                                <img src={formData.bannerImage} alt="Preview" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2 px-4">
                                    <span className="text-[8px] font-black text-cyan-400 uppercase tracking-widest drop-shadow-md">Imagen lista</span>
                                </div>
                            </div>
                        )}
                    </div>
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
                                <Store size={20} className="text-white drop-shadow-md" /> Ingresar mi negocio
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
