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
    ImagePlus,
    Share2
} from 'lucide-react';
import { playNeonClick, playSuccessSound } from '../utils/audio';
import { AriMerchantAssistant } from '../components/AriMerchantAssistant';

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

    const handleShare = async () => {
        playNeonClick();
        const url = `${window.location.origin}/${townId}/subscripcion`;
        try {
            if (navigator.share) {
                await navigator.share({
                    title: `Sumá tu comercio a ShopDigital ${townId.replace(/-/g, ' ')}`,
                    text: '¡Subite a la red comercial inteligente y ganá visibilidad!',
                    url: url
                });
            } else {
                await navigator.clipboard.writeText(url);
                alert('¡Link de suscripción copiado al portapapeles!');
            }
        } catch (error) {
            console.error('Error sharing:', error);
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
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-[#0b1329] to-slate-950 text-white pb-24 relative overflow-x-hidden selection:bg-cyan-500/30">
            <style>{`
                @keyframes pulseGlow {
                    0%, 100% { filter: drop-shadow(0 0 15px rgba(34,211,238,0.4)); }
                    50% { filter: drop-shadow(0 0 35px rgba(34,211,238,0.8)); }
                }
                .tech-grid-bg {
                    background-size: 30px 30px;
                    background-image: 
                        linear-gradient(to right, rgba(34,211,238,0.04) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(34,211,238,0.04) 1px, transparent 1px);
                }
                .glass-card-neon {
                    background: linear-gradient(145deg, rgba(255,255,255,0.02), rgba(0,0,0,0.4));
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(34,211,238,0.15);
                    box-shadow: inset 0 0 20px rgba(34,211,238,0.02), 0 8px 32px rgba(0,0,0,0.4);
                }
                /* Finetuning: Legibilidad de inputs y opciones de select en modo oscuro */
                input, select, textarea, option {
                    color: #ffffff !important;
                    background-color: #0b1329 !important;
                }
                input::placeholder, textarea::placeholder {
                    color: rgba(255, 255, 255, 0.4) !important;
                }
                /* Corrección de autocompletado en navegadores móviles/escritorio */
                input:-webkit-autofill,
                input:-webkit-autofill:hover, 
                input:-webkit-autofill:focus, 
                input:-webkit-autofill:active {
                    -webkit-box-shadow: 0 0 0 30px #0b1329 inset !important;
                    -webkit-text-fill-color: #ffffff !important;
                    transition: background-color 5000s ease-in-out 0s;
                }
            `}</style>

            <div className="fixed inset-0 pointer-events-none z-0 tech-grid-bg" />
            
            {/* Esferas de luz cian */}
            <div className="fixed top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none z-0" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[30vw] h-[30vw] rounded-full bg-cyan-500/5 blur-[100px] pointer-events-none z-0" />

            {/* HEADER STICKY */}
            <div className="sticky top-0 z-40 bg-[#020617]/80 backdrop-blur-xl border-b border-cyan-500/20 pt-6 pb-4 px-6 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
                <div className="flex items-center justify-between mb-4">
                    <button onClick={() => {
                        playNeonClick();
                        navigate(-1);
                    }} className="p-2 bg-white/5 rounded-xl border border-white/10 text-white/70 hover:text-cyan-400 hover:border-cyan-400/50 transition-all active:scale-95">
                        <ChevronLeft size={20} />
                    </button>
                    <div className="flex-1 flex justify-center items-center gap-3">
                        <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center border border-cyan-500/30" style={{ animation: 'pulseGlow 3s infinite' }}>
                            <Rocket size={20} className="text-cyan-400" />
                        </div>
                        <div>
                            <h1 className="text-[12px] sm:text-sm font-black uppercase tracking-widest text-white leading-none text-center">Formulario de Inscripción de Comercio</h1>
                            <span className="text-[9px] font-bold text-cyan-500/60 uppercase tracking-widest block text-center mt-1">{townId.replace(/-/g, ' ')}</span>
                        </div>
                    </div>
                    <div className="w-10" /> {/* Spacer */}
                </div>
                <p className="text-[8px] font-bold text-white/50 uppercase tracking-widest text-center mt-1 px-4 leading-relaxed">
                    Completá los datos para registrar tu negocio. <br/>
                    📢 <span className="text-cyan-400">Este formulario es público:</span> compartilo con otros comerciantes y colegas para que puedan sumarse a la red.
                </p>
            </div>

            {/* PANEL ARI INLINE */}
            <div className="relative z-10 px-5 mt-6 mb-8 max-w-lg mx-auto">
                <AriMerchantAssistant 
                    shop={{ id: 'suscripcion', name: 'Nuevo Comercio' } as any}
                    role="subscription"
                    townId={townId}
                    inline={true}
                    isDayMode={false}
                />
            </div>

            <form onSubmit={handleSubmit} className="px-8 space-y-6 max-w-lg mx-auto relative z-10 animate-in slide-in-from-bottom-6 duration-700">
                {/* Nombre Comercio */}
                <div className="glass-card-neon rounded-3xl p-6 relative overflow-hidden focus-within:border-cyan-400/50 transition-colors">
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
                        className="w-full bg-slate-950/60 border border-white/10 rounded-2xl p-4 text-white text-sm font-black placeholder:text-white/30 focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-500/20 transition-all"
                        style={{ color: '#ffffff', backgroundColor: '#0b1329' }}
                    />
                </div>

                {/* Rubro y Localidad */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="glass-card-neon rounded-3xl p-5 focus-within:border-cyan-400/50 transition-colors">
                        <label className="text-[9px] flex items-center gap-1.5 font-black uppercase tracking-[0.2em] text-cyan-400 mb-3">
                            <Tag size={12} /> Rubro
                        </label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full bg-slate-950/60 border border-white/10 rounded-2xl p-4 text-white text-sm font-black focus:outline-none focus:border-cyan-400/50 transition-all"
                            style={{ color: '#ffffff', backgroundColor: '#0b1329' }}
                        >
                            {CATEGORIES.map(cat => (
                                <option key={cat.id} value={cat.id} className="bg-slate-950 text-white" style={{ color: '#ffffff', backgroundColor: '#0b1329' }}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="glass-card-neon rounded-3xl p-5 focus-within:border-cyan-400/50 transition-colors">
                        <label className="text-[9px] flex items-center gap-1.5 font-black uppercase tracking-[0.2em] text-cyan-400 mb-3">
                            <MapPin size={12} /> Localidad
                        </label>
                        <select
                            value={formData.zone}
                            onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                            className="w-full bg-slate-950/60 border border-white/10 rounded-2xl p-4 text-white text-sm font-black focus:outline-none focus:border-cyan-400/50 transition-all"
                            style={{ color: '#ffffff', backgroundColor: '#0b1329' }}
                        >
                            {localities.map(loc => (
                                <option key={loc} value={loc} className="bg-slate-950 text-white" style={{ color: '#ffffff', backgroundColor: '#0b1329' }}>{loc}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Dirección del Local */}
                <div className="glass-card-neon rounded-3xl p-6 focus-within:border-cyan-400/50 transition-colors">
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
                        className="w-full bg-slate-950/60 border border-white/10 rounded-2xl p-4 text-white text-sm font-black placeholder:text-white/30 focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-500/20 transition-all"
                        style={{ color: '#ffffff', backgroundColor: '#0b1329' }}
                    />
                </div>

                {/* Foto Portada (Opcional - Input de Archivo) */}
                <div className="glass-card-neon rounded-3xl p-6 focus-within:border-cyan-400/50 transition-colors">
                    <div className="flex justify-between items-center mb-4">
                        <label className="text-[10px] flex items-center gap-2 font-black uppercase tracking-[0.2em] text-cyan-400">
                            <Camera size={14} /> Logo / Foto (Opcional)
                        </label>
                    </div>
                    
                    <div className="flex flex-col gap-4">
                        <input
                            id="image-file-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                        />
                        <input
                            id="image-camera-upload"
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={handleImageUpload}
                            className="hidden"
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => document.getElementById('image-file-upload')?.click()}
                                className="flex flex-col items-center justify-center py-6 border border-white/10 rounded-2xl bg-slate-950/60 hover:bg-cyan-500/5 hover:border-cyan-400/50 transition-all active:scale-95 cursor-pointer"
                                style={{ color: '#ffffff' }}
                            >
                                <ImagePlus size={22} className="text-cyan-400 mb-2" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-white/70">Subir Archivo</span>
                                <span className="text-[7px] text-white/40 uppercase tracking-widest mt-1">Galería</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => document.getElementById('image-camera-upload')?.click()}
                                className="flex flex-col items-center justify-center py-6 border border-white/10 rounded-2xl bg-slate-950/60 hover:bg-cyan-500/5 hover:border-cyan-400/50 transition-all active:scale-95 cursor-pointer"
                                style={{ color: '#ffffff' }}
                            >
                                <Camera size={22} className="text-cyan-400 mb-2" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-white/70">Tomar Foto</span>
                                <span className="text-[7px] text-white/40 uppercase tracking-widest mt-1">Cámara</span>
                            </button>
                        </div>

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
                <div className="glass-card-neon rounded-3xl p-6 space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                        <User size={14} className="text-cyan-400" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">Titular de Contacto</h3>
                    </div>
                    
                    <div>
                        <label className="text-[9px] font-bold uppercase tracking-[0.1em] text-white/40 mb-2 block">Nombre Completo</label>
                        <input
                            required
                            placeholder="Ej: Juan Pérez"
                            value={formData.ownerName}
                            onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                            className="w-full bg-slate-950/60 border border-white/10 rounded-2xl p-4 text-white text-sm font-black placeholder:text-white/30 focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-500/20 transition-all"
                            style={{ color: '#ffffff', backgroundColor: '#0b1329' }}
                        />
                    </div>

                    <div>
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
                            className="w-full bg-slate-950/60 border border-white/10 rounded-2xl p-4 text-white text-sm font-black placeholder:text-white/30 focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-500/20 transition-all"
                            style={{ color: '#ffffff', backgroundColor: '#0b1329' }}
                        />
                    </div>
                </div>

                <div className="pt-4 space-y-6">
                    <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full glass-action-btn bg-cyan-900/40 border border-cyan-500 py-5 rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-[0.2em] text-[12px] shadow-[0_0_30px_rgba(34,211,238,0.3)] active:scale-95 transition-all text-white disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Store size={20} className="text-white drop-shadow-md" /> Ingresar mi negocio
                            </>
                        )}
                    </button>
                    
                    <div className="pt-4 border-t border-white/10 mt-6 bg-cyan-950/10 rounded-2xl p-4 border border-cyan-500/20">
                        <p className="text-[9px] text-cyan-400 font-black uppercase tracking-widest text-center mb-1">
                            📢 ¿Conocés a otros comerciantes o colegas?
                        </p>
                        <p className="text-[8px] text-white/60 uppercase tracking-wider text-center mb-3 leading-normal px-2">
                            Ayudalos a digitalizar su negocio. Copiá y enviales el link de este formulario para que puedan auto-inscribirse en el sistema.
                        </p>
                        <button
                            type="button"
                            onClick={handleShare}
                            className="w-full bg-cyan-500 text-black py-4 rounded-2xl flex items-center justify-center gap-2 font-black uppercase tracking-widest text-[10px] hover:bg-cyan-400 transition-all active:scale-95 shadow-[0_0_20px_rgba(34,211,238,0.3)]"
                            style={{ color: '#000000', backgroundColor: '#22d3ee' }}
                        >
                            <Share2 size={14} />
                            Compartir este formulario con mis colegas
                        </button>
                    </div>

                    <p className="text-[7px] text-center text-white/30 uppercase tracking-[0.3em] font-bold mt-4">
                        Al enviar, aceptás los términos y condiciones de la red ShopDigital.
                    </p>
                </div>
            </form>
        </div>
    );
};

export default SubscriptionPage;
