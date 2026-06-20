import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { guardarComercio } from '../firebase';
import { useTownLocalities } from '../hooks/useTownLocalities';
import { Shop } from '../types';
import { CATEGORIES } from '../constants';
import { processImageToDataUrl } from '../utils/imageProcessor';
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

const SubscriptionPage: React.FC = () => {
    const { townId = 'esteban-echeverria' } = useParams<{ townId: string }>();
    const navigate = useNavigate();
    const { localities } = useTownLocalities(townId);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        category: CATEGORIES[0].id,
        zone: '',
        address: '',
        bannerImage: '',
        ownerName: '',
        phone: '',
        gmail: ''
    });

    // Theme Mode Resolver (sincronizado con GlobalHomePage y ClientSubscriptionPage)
    const [currentTime] = useState(new Date());
    const themeMode = localStorage.getItem('global_home_theme_mode') || 'dark';
    const isDayMode = themeMode === 'light' || (themeMode === 'auto' && (() => {
        const hour = currentTime.getHours();
        return hour >= 8 && hour < 20;
    })());

    // Setear la primera localidad como default una vez que carguen
    useEffect(() => {
        if (localities.length > 0 && !formData.zone) {
            setFormData(prev => ({ ...prev, zone: localities[0] }));
        }
    }, [localities]);

    const generateSlug = (text: string) => {
        return text.toString().toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-')
            .replace(/^-+/, '')
            .replace(/-+$/, '');
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            // Pipeline WebP: max 800px · 80% quality · fondo blanco para PNG
            const dataUrl = await processImageToDataUrl(file, 'banner');
            setFormData({ ...formData, bannerImage: dataUrl });
        } catch (err) {
            console.warn('[SubscriptionPage] Compresión fallida, cargando imagen original.', err);
            const reader = new FileReader();
            reader.onload = (ev) => setFormData({ ...formData, bannerImage: ev.target?.result as string });
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        playNeonClick();
        
        if (!formData.name || !formData.ownerName || !formData.phone || !formData.gmail) {
            alert("Por favor completá todos los datos mínimos para crear tu catálogo.");
            return;
        }

        if (!formData.gmail.trim().toLowerCase().endsWith('@gmail.com')) {
            alert("⚠️ El correo electrónico debe ser una cuenta de Gmail válida (@gmail.com) para poder acceder a las credenciales y al panel de autogestión.");
            return;
        }

        setIsSubmitting(true);

        const newShop: Shop = {
            id: `shop-${Date.now()}`,
            slug: generateSlug(formData.name),
            townId,
            name: formData.name,
            category: formData.category,
            zone: formData.zone,
            bannerImage: formData.bannerImage,
            image: formData.bannerImage,
            ownerName: formData.ownerName,
            phone: formData.phone,
            gmail: formData.gmail.trim().toLowerCase(),
            rating: 5.0,
            isActive: false,
            specialty: '',
            address: formData.address || formData.zone,
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
            <div className={`min-h-screen flex flex-col items-center justify-center p-8 animate-in zoom-in duration-500 ${
                isDayMode ? 'bg-[#cda488] text-[#2d1e15]' : 'bg-black text-white'
            }`}>
                
                {/* Brand Avatar Section */}
                {isDayMode && (
                    <div className="flex justify-center mb-4 model-floating select-none pointer-events-none">
                        <img 
                            src="/ari-avatar.png" 
                            alt="ARI Asistente Éxito" 
                            className="h-32 w-auto object-contain drop-shadow-[0_10px_15px_rgba(88,70,50,0.15)] animate-in fade-in duration-700" 
                        />
                    </div>
                )}

                <div className={`w-full max-w-sm rounded-[2rem] p-10 relative overflow-hidden border ${
                    isDayMode 
                        ? 'bg-white/85 border-[#cbd5e1] border-b-[6px] border-b-[#cbd5e1] shadow-2xl' 
                        : 'glass-card-3d border-cyan-400/50 backdrop-blur-xl'
                }`}>
                    <div className={`absolute inset-0 pointer-events-none ${isDayMode ? 'bg-[#cda488]/5' : 'bg-cyan-500/10'}`} />
                    
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 mx-auto border shadow-lg ${
                        isDayMode 
                            ? 'bg-white border-[#cbd5e1] border-b-[4px] border-b-[#cbd5e1]' 
                            : 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.5)]'
                    }`}>
                        <PartyPopper size={40} className={isDayMode ? 'text-[#855b3c]' : 'text-cyan-400'} />
                    </div>
                    
                    <h2 className={`text-2xl font-[1000] uppercase tracking-tighter mb-4 text-center ${
                        isDayMode ? 'text-[#2d1e15]' : 'text-white'
                    }`}>
                        ¡Felicitaciones!
                    </h2>
                    
                    <p className={`text-[11px] font-bold text-center leading-relaxed mb-8 ${
                        isDayMode ? 'text-[#2d1e15]/80' : 'text-white/80'
                    }`}>
                        Pronto un embajador de zona lo estará visitando para completar su catálogo y traerle noticias exclusivas.
                        <br/><br/>
                        Ya puede disfrutar de nuestros servicios y compartir su catálogo para promoción en la red.
                    </p>
                    
                    <button
                        onClick={() => {
                            playNeonClick();
                            navigate(`/${townId}/home`);
                        }}
                        className={`w-full py-4 rounded-2xl flex items-center justify-center transition-all border cursor-pointer ${
                            isDayMode 
                                ? 'bg-gradient-to-b from-[#b58866] to-[#9c7151] hover:from-[#c29673] hover:to-[#a87c5b] text-white border-[#855b3c] border-b-[4px] border-b-[#734b2f] shadow-[0_10px_25px_rgba(140,90,50,0.15)] active:translate-y-[2px] active:border-b-[1px]' 
                                : 'glass-action-btn btn-cyan-neon text-white border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.3)] active:scale-95'
                        }`}
                    >
                        <span className="font-black uppercase tracking-widest text-[11px] text-white">Entrar a la App</span>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen pb-24 relative overflow-x-hidden selection:bg-cyan-500/30 transition-colors duration-500 ${
            isDayMode ? 'bg-[#cda488] text-[#2d1e15]' : 'bg-gradient-to-b from-slate-900 via-[#0b1329] to-slate-950 text-white'
        }`}>
            <style>{`
                input, select, textarea, option {
                    color: ${isDayMode ? '#2d1e15' : '#ffffff'} !important;
                    background-color: ${isDayMode ? '#faf8f5' : '#0b1329'} !important;
                }
                input::placeholder, textarea::placeholder {
                    color: ${isDayMode ? 'rgba(45, 30, 21, 0.4)' : 'rgba(255, 255, 255, 0.4)'} !important;
                }
                input:-webkit-autofill,
                input:-webkit-autofill:hover, 
                input:-webkit-autofill:focus, 
                input:-webkit-autofill:active {
                    -webkit-box-shadow: 0 0 0 30px ${isDayMode ? '#faf8f5' : '#0b1329'} inset !important;
                    -webkit-text-fill-color: ${isDayMode ? '#2d1e15' : '#ffffff'} !important;
                    transition: background-color 5000s ease-in-out 0s;
                }
            `}</style>

            {/* Background Layers */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className={`absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] animate-pulse ${
                    isDayMode ? 'bg-amber-500/10' : 'bg-cyan-500/5'
                }`} />
                {!isDayMode && (
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.02)_1px,transparent_1px)] bg-[size:30px_30px]" />
                )}
            </div>

            {/* HEADER STICKY */}
            <div className={`backdrop-blur-md pt-8 pb-6 px-8 flex flex-col items-center border-b mb-4 sticky top-0 z-50 transition-all duration-300 ${
                isDayMode 
                    ? 'bg-[#cbd5e1]/45 border-white/20 shadow-[0_10px_25px_rgba(88,70,50,0.08)]' 
                    : 'bg-[#020617]/80 border-cyan-500/20 shadow-[0_10px_40px_rgba(0,0,0,0.5)]'
            }`}>
                <div className="flex items-center justify-between w-full mb-4">
                    <button 
                        onClick={() => { playNeonClick(); navigate(-1); }} 
                        className={`p-2 rounded-xl flex items-center justify-center transition-all border shadow-lg ${
                            isDayMode 
                                ? 'bg-white/90 border-[#cbd5e1] border-b-[4px] border-b-[#cbd5e1] text-[#2d1e15] hover:bg-white active:translate-y-[2px] active:border-b-[1px]' 
                                : 'bg-white/5 border-white/10 text-white/70 hover:text-cyan-400 hover:border-cyan-400/50 active:scale-95'
                        }`}
                    >
                        <ChevronLeft size={20} />
                    </button>
                    
                    <div className="flex-grow flex justify-center items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                            isDayMode 
                                ? 'bg-white border-[#cbd5e1] border-b-[4px] border-b-[#cbd5e1]' 
                                : 'bg-cyan-500/10 border-cyan-500/30'
                        }`}>
                            <Rocket size={20} className={isDayMode ? 'text-[#855b3c]' : 'text-cyan-400'} />
                        </div>
                        <div>
                            <h1 className={`text-[12px] sm:text-sm font-black uppercase tracking-widest leading-none text-center ${
                                isDayMode ? 'text-[#2d1e15]' : 'text-white'
                            }`}>
                                Inscripción de Comercio
                            </h1>
                            <span className={`text-[9px] font-bold uppercase tracking-widest block text-center mt-1 ${
                                isDayMode ? 'text-[#855b3c]/70' : 'text-cyan-500/60'
                            }`}>
                                {townId.replace(/-/g, ' ')}
                            </span>
                        </div>
                    </div>
                    
                    <div className="w-10" />
                </div>
                
                <p className={`text-[8px] font-bold uppercase tracking-widest text-center mt-1 px-4 leading-relaxed ${
                    isDayMode ? 'text-[#2d1e15]/60' : 'text-white/50'
                }`}>
                    Completá los datos para registrar tu negocio. <br/>
                    📢 <span className={isDayMode ? 'text-[#855b3c]' : 'text-cyan-400'}>Este formulario es público:</span> compartilo con otros comerciantes y colegas.
                </p>
            </div>

            {/* Brand Avatar Section */}
            {isDayMode && (
                <div className="flex justify-center mb-2 mt-4 model-floating select-none pointer-events-none">
                    <img 
                        src="/ari-fullbody.png" 
                        alt="ARI Asistente VIP" 
                        className="h-32 w-auto object-contain drop-shadow-[0_10px_15px_rgba(88,70,50,0.15)] animate-in fade-in zoom-in-75 duration-700" 
                    />
                </div>
            )}

            <form onSubmit={handleSubmit} className="px-8 mt-6 space-y-6 max-w-sm mx-auto relative z-10 animate-in slide-in-from-bottom-6 duration-700">
                {/* Nombre Comercio */}
                <div className={`rounded-3xl p-6 relative overflow-hidden border ${
                    isDayMode 
                        ? 'bg-white/85 border-[#cbd5e1] border-b-[6px] border-b-[#cbd5e1]' 
                        : 'glass-card-neon focus-within:border-cyan-400/50'
                }`}>
                    <div className="flex justify-between items-center mb-4">
                        <label className={`text-[10px] flex items-center gap-2 font-black uppercase tracking-[0.2em] ${
                            isDayMode ? 'text-[#855b3c]' : 'text-cyan-400'
                        }`}>
                            <Store size={14} /> Marca Comercial
                        </label>
                        <span className="text-[8px] text-red-400 font-bold uppercase">* Requerido</span>
                    </div>
                    <input
                        required
                        placeholder="Ej: Pizzería El Buen Gusto"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className={`w-full border p-4 text-sm font-black rounded-2xl transition-all focus:outline-none ${
                            isDayMode 
                                ? 'bg-[#faf8f5] text-[#2d1e15] border-[#cbd5e1] border-b-[4px] border-b-[#cbd5e1] focus:border-[#a88d75] focus:border-b-[#a88d75]' 
                                : 'bg-[#0b1329] text-white border-white/10 border-b-[4px] border-b-white/20 focus:border-cyan-400/50 focus:border-b-cyan-400/50'
                        }`}
                        style={isDayMode ? { color: '#2d1e15', backgroundColor: '#faf8f5' } : { color: '#ffffff', backgroundColor: '#0b1329' }}
                    />
                </div>

                {/* Rubro y Localidad */}
                <div className="grid grid-cols-2 gap-4">
                    <div className={`rounded-3xl p-5 border ${
                        isDayMode 
                            ? 'bg-white/85 border-[#cbd5e1] border-b-[6px] border-b-[#cbd5e1]' 
                            : 'glass-card-neon focus-within:border-cyan-400/50'
                    }`}>
                        <label className={`text-[9px] flex items-center gap-1.5 font-black uppercase tracking-[0.2em] mb-3 ${
                            isDayMode ? 'text-[#855b3c]' : 'text-cyan-400'
                        }`}>
                            <Tag size={12} /> Rubro
                        </label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className={`w-full border p-4 text-sm font-black rounded-2xl transition-all focus:outline-none ${
                                isDayMode 
                                    ? 'bg-[#faf8f5] text-[#2d1e15] border-[#cbd5e1] border-b-[4px] border-b-[#cbd5e1]' 
                                    : 'bg-[#0b1329] text-white border-white/10 border-b-[4px] border-b-white/20'
                            }`}
                            style={isDayMode ? { color: '#2d1e15', backgroundColor: '#faf8f5' } : { color: '#ffffff', backgroundColor: '#0b1329' }}
                        >
                            {CATEGORIES.map(cat => (
                                <option key={cat.id} value={cat.id} style={isDayMode ? { color: '#2d1e15', backgroundColor: '#faf8f5' } : { color: '#ffffff', backgroundColor: '#0b1329' }}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className={`rounded-3xl p-5 border ${
                        isDayMode 
                            ? 'bg-white/85 border-[#cbd5e1] border-b-[6px] border-b-[#cbd5e1]' 
                            : 'glass-card-neon focus-within:border-cyan-400/50'
                    }`}>
                        <label className={`text-[9px] flex items-center gap-1.5 font-black uppercase tracking-[0.2em] mb-3 ${
                            isDayMode ? 'text-[#855b3c]' : 'text-cyan-400'
                        }`}>
                            <MapPin size={12} /> Localidad
                        </label>
                        <select
                            value={formData.zone}
                            onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                            className={`w-full border p-4 text-sm font-black rounded-2xl transition-all focus:outline-none ${
                                isDayMode 
                                    ? 'bg-[#faf8f5] text-[#2d1e15] border-[#cbd5e1] border-b-[4px] border-b-[#cbd5e1]' 
                                    : 'bg-[#0b1329] text-white border-white/10 border-b-[4px] border-b-white/20'
                            }`}
                            style={isDayMode ? { color: '#2d1e15', backgroundColor: '#faf8f5' } : { color: '#ffffff', backgroundColor: '#0b1329' }}
                        >
                            {localities.map(loc => (
                                <option key={loc} value={loc} style={isDayMode ? { color: '#2d1e15', backgroundColor: '#faf8f5' } : { color: '#ffffff', backgroundColor: '#0b1329' }}>{loc}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Dirección del Local */}
                <div className={`rounded-3xl p-6 border ${
                    isDayMode 
                        ? 'bg-white/85 border-[#cbd5e1] border-b-[6px] border-b-[#cbd5e1]' 
                        : 'glass-card-neon focus-within:border-cyan-400/50'
                }`}>
                    <div className="flex justify-between items-center mb-4">
                        <label className={`text-[10px] flex items-center gap-2 font-black uppercase tracking-[0.2em] ${
                            isDayMode ? 'text-[#855b3c]' : 'text-cyan-400'
                        }`}>
                            <MapPin size={14} /> Dirección del Local
                        </label>
                        <span className="text-[8px] text-red-400 font-bold uppercase">* Requerido</span>
                    </div>
                    <input
                        required
                        placeholder={`Ej: Av. Principal 123, ${formData.zone || (localities[0] || 'tu localidad')}`}
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className={`w-full border p-4 text-sm font-black rounded-2xl transition-all focus:outline-none ${
                            isDayMode 
                                ? 'bg-[#faf8f5] text-[#2d1e15] border-[#cbd5e1] border-b-[4px] border-b-[#cbd5e1] focus:border-[#a88d75] focus:border-b-[#a88d75]' 
                                : 'bg-[#0b1329] text-white border-white/10 border-b-[4px] border-b-white/20 focus:border-cyan-400/50 focus:border-b-cyan-400/50'
                        }`}
                        style={isDayMode ? { color: '#2d1e15', backgroundColor: '#faf8f5' } : { color: '#ffffff', backgroundColor: '#0b1329' }}
                    />
                </div>

                {/* Foto Portada (Opcional - Input de Archivo) */}
                <div className={`rounded-3xl p-6 border ${
                    isDayMode 
                        ? 'bg-white/85 border-[#cbd5e1] border-b-[6px] border-b-[#cbd5e1]' 
                        : 'glass-card-neon focus-within:border-cyan-400/50'
                }`}>
                    <div className="flex justify-between items-center mb-4">
                        <label className={`text-[10px] flex items-center gap-2 font-black uppercase tracking-[0.2em] ${
                            isDayMode ? 'text-[#855b3c]' : 'text-cyan-400'
                        }`}>
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
                                className={`flex flex-col items-center justify-center py-6 border rounded-2xl transition-all cursor-pointer ${
                                    isDayMode 
                                        ? 'bg-white/80 border-[#cbd5e1] border-b-[4px] border-b-[#cbd5e1] text-[#2d1e15] hover:bg-white hover:border-[#a88d75] active:translate-y-[2px] active:border-b-[1px]' 
                                        : 'border border-white/10 bg-slate-950/60 hover:bg-cyan-500/5 hover:border-cyan-400/50 active:scale-95'
                                }`}
                                style={isDayMode ? { color: '#2d1e15' } : { color: '#ffffff' }}
                            >
                                <ImagePlus size={22} className={`${isDayMode ? 'text-[#855b3c]' : 'text-cyan-400'} mb-2`} />
                                <span className={`text-[9px] font-black uppercase tracking-widest ${isDayMode ? 'text-[#2d1e15]/70' : 'text-white/70'}`}>Subir Archivo</span>
                                <span className={`text-[7px] uppercase tracking-widest mt-1 ${isDayMode ? 'text-[#2d1e15]/40' : 'text-white/40'}`}>Galería</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => document.getElementById('image-camera-upload')?.click()}
                                className={`flex flex-col items-center justify-center py-6 border rounded-2xl transition-all cursor-pointer ${
                                    isDayMode 
                                        ? 'bg-white/80 border-[#cbd5e1] border-b-[4px] border-b-[#cbd5e1] text-[#2d1e15] hover:bg-white hover:border-[#a88d75] active:translate-y-[2px] active:border-b-[1px]' 
                                        : 'border border-white/10 bg-slate-950/60 hover:bg-cyan-500/5 hover:border-cyan-400/50 active:scale-95'
                                }`}
                                style={isDayMode ? { color: '#2d1e15' } : { color: '#ffffff' }}
                            >
                                <Camera size={22} className={`${isDayMode ? 'text-[#855b3c]' : 'text-cyan-400'} mb-2`} />
                                <span className={`text-[9px] font-black uppercase tracking-widest ${isDayMode ? 'text-[#2d1e15]/70' : 'text-white/70'}`}>Tomar Foto</span>
                                <span className={`text-[7px] uppercase tracking-widest mt-1 ${isDayMode ? 'text-[#2d1e15]/40' : 'text-white/40'}`}>Cámara</span>
                            </button>
                        </div>

                        {formData.bannerImage && (
                            <div className={`relative w-full aspect-video rounded-xl overflow-hidden border ${
                                isDayMode ? 'border-[#a88d75]/50' : 'border-cyan-400/30'
                            }`}>
                                <img src={formData.bannerImage} alt="Preview" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2 px-4">
                                    <span className="text-[8px] font-black text-cyan-400 uppercase tracking-widest drop-shadow-md">Imagen lista</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Owner Data */}
                <div className={`rounded-3xl p-6 space-y-6 border ${
                    isDayMode 
                        ? 'bg-white/85 border-[#cbd5e1] border-b-[6px] border-b-[#cbd5e1]' 
                        : 'glass-card-neon'
                }`}>
                    <div className="flex items-center gap-2 mb-2">
                        <User size={14} className={isDayMode ? 'text-[#855b3c]' : 'text-cyan-400'} />
                        <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] ${
                            isDayMode ? 'text-[#855b3c]' : 'text-cyan-400'
                        }`}>Titular de Contacto</h3>
                    </div>
                    
                    <div>
                        <label className={`text-[9px] font-bold uppercase tracking-[0.1em] mb-2 block ${
                            isDayMode ? 'text-[#2d1e15]/60' : 'text-white/40'
                        }`}>Nombre Completo</label>
                        <input
                            required
                            placeholder="Ej: Juan Pérez"
                            value={formData.ownerName}
                            onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                            className={`w-full border p-4 text-sm font-black rounded-2xl transition-all focus:outline-none ${
                                isDayMode 
                                    ? 'bg-[#faf8f5] text-[#2d1e15] border-[#cbd5e1] border-b-[4px] border-b-[#cbd5e1] focus:border-[#a88d75] focus:border-b-[#a88d75]' 
                                    : 'bg-[#0b1329] text-white border-white/10 border-b-[4px] border-b-white/20 focus:border-cyan-400/50 focus:border-b-cyan-400/50'
                            }`}
                            style={isDayMode ? { color: '#2d1e15', backgroundColor: '#faf8f5' } : { color: '#ffffff', backgroundColor: '#0b1329' }}
                        />
                    </div>

                    <div>
                        <label className={`text-[9px] font-bold uppercase tracking-[0.1em] mb-2 block ${
                            isDayMode ? 'text-[#2d1e15]/60' : 'text-white/40'
                        }`}>Gmail de Acceso (Obligatorio)</label>
                        <input
                            required
                            type="email"
                            placeholder="Ej: juan.perez@gmail.com"
                            value={formData.gmail}
                            onChange={(e) => setFormData({ ...formData, gmail: e.target.value })}
                            className={`w-full border p-4 text-sm font-black rounded-2xl transition-all focus:outline-none ${
                                isDayMode 
                                    ? 'bg-[#faf8f5] text-[#2d1e15] border-[#cbd5e1] border-b-[4px] border-b-[#cbd5e1] focus:border-[#a88d75] focus:border-b-[#a88d75]' 
                                    : 'bg-[#0b1329] text-white border-white/10 border-b-[4px] border-b-white/20 focus:border-cyan-400/50 focus:border-b-cyan-400/50'
                            }`}
                            style={isDayMode ? { color: '#2d1e15', backgroundColor: '#faf8f5' } : { color: '#ffffff', backgroundColor: '#0b1329' }}
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className={`text-[9px] font-bold uppercase tracking-[0.1em] block ${
                                isDayMode ? 'text-[#2d1e15]/60' : 'text-white/40'
                            }`}>Celular / WhatsApp</label>
                            <Phone size={10} className="text-green-400" />
                        </div>
                        <input
                            required
                            type="tel"
                            placeholder="Ej: 1122334455"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className={`w-full border p-4 text-sm font-black rounded-2xl transition-all focus:outline-none ${
                                isDayMode 
                                    ? 'bg-[#faf8f5] text-[#2d1e15] border-[#cbd5e1] border-b-[4px] border-b-[#cbd5e1] focus:border-[#a88d75] focus:border-b-[#a88d75]' 
                                    : 'bg-[#0b1329] text-white border-white/10 border-b-[4px] border-b-white/20 focus:border-cyan-400/50 focus:border-b-cyan-400/50'
                            }`}
                            style={isDayMode ? { color: '#2d1e15', backgroundColor: '#faf8f5' } : { color: '#ffffff', backgroundColor: '#0b1329' }}
                        />
                    </div>
                </div>

                <div className="pt-4 space-y-6">
                    <button 
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full py-5 rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-[0.2em] text-[12px] border transition-all cursor-pointer ${
                            isDayMode 
                                ? 'bg-gradient-to-b from-[#b58866] to-[#9c7151] hover:from-[#c29673] hover:to-[#a87c5b] text-white border-[#855b3c] border-b-[6px] border-b-[#734b2f] shadow-[0_10px_30px_rgba(140,90,50,0.2)] active:translate-y-[4px] active:border-b-[2px]' 
                                : 'bg-cyan-600 hover:bg-cyan-500 text-white border-white/20 border-b-[6px] border-b-cyan-800 shadow-[0_10px_40px_rgba(34,211,238,0.2)] active:translate-y-[4px] active:border-b-[2px]'
                        } disabled:opacity-50`}
                    >
                        {isSubmitting ? (
                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Store size={20} className="text-white drop-shadow-md" /> Ingresar mi negocio
                            </>
                        )}
                    </button>
                    
                    <div className={`mt-6 border rounded-2xl p-4 transition-colors ${
                        isDayMode 
                            ? 'bg-white/60 border-black/5' 
                            : 'bg-cyan-950/10 border-cyan-500/20'
                    }`}>
                        <p className={`text-[9px] font-black uppercase tracking-widest text-center mb-1 ${
                            isDayMode ? 'text-[#855b3c]' : 'text-cyan-400'
                        }`}>
                            📢 ¿Conocés a otros comerciantes o colegas?
                        </p>
                        <p className={`text-[8px] uppercase tracking-wider text-center mb-3 leading-normal px-2 ${
                            isDayMode ? 'text-[#2d1e15]/70' : 'text-white/60'
                        }`}>
                            Ayudalos a digitalizar su negocio. Copiá y enviales el link de este formulario para que puedan auto-inscribirse en el sistema.
                        </p>
                        <button
                            type="button"
                            onClick={handleShare}
                            className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-black uppercase tracking-widest text-[10px] transition-all cursor-pointer border ${
                                isDayMode 
                                    ? 'bg-[#b58866]/10 border-[#b58866]/40 text-[#855b3c] hover:bg-[#b58866]/20 border-b-[4px] border-b-[#b58866]/40 active:translate-y-[2px] active:border-b-[1px]' 
                                    : 'bg-cyan-500 text-black border-cyan-400/50 hover:bg-cyan-400 active:scale-95 shadow-[0_0_20px_rgba(34,211,238,0.3)]'
                            }`}
                            style={isDayMode ? {} : { color: '#000000', backgroundColor: '#22d3ee' }}
                        >
                            <Share2 size={14} />
                            Compartir este formulario con mis colegas
                        </button>
                    </div>

                    <p className={`text-[7px] text-center uppercase tracking-[0.3em] font-bold mt-4 ${
                        isDayMode ? 'text-[#2d1e15]/40' : 'text-white/30'
                    }`}>
                        Al enviar, aceptás los términos y condiciones de la red ShopDigital.
                    </p>
                </div>
            </form>
        </div>
    );
};

export default SubscriptionPage;
