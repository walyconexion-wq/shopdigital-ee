import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Send, Share2, User, Phone, MapPin, Calendar, CheckCircle, Mail, Briefcase, Cpu, Smartphone, Monitor, Camera } from 'lucide-react';
import { playNeonClick, playSuccessSound } from '../utils/audio';
import { crearAspirante } from '../firebase';

const AmbassadorRecruitPage1: React.FC = () => {
    const { townId = 'esteban-echeverria' } = useParams<{ townId: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        dni: '',
        age: '',
        gender: '',
        nationality: '',
        location: '',
        phone: '',
        email: '',
        motivation: '',
        photoUrl: '',
        hasSmartphone: false,
        hasPC: false,
        hasSalesExperience: false,
        hasDevKnowledge: false
    });
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    const getZoneColor = () => {
        if (townId === 'ezeiza') return '#06b6d4'; // Cyan
        if (townId === 'esteban-echeverria') return '#8b5cf6'; // Violet
        if (townId === 'mina-clavero' || townId === 'traslasierra') return '#10b981'; // Emerald
        return '#06b6d4';
    };
    const zoneColor = getZoneColor();

    const hexToRgba = (hex: string, alpha: number) => {
        try {
            const cleanHex = hex.replace('#', '');
            const r = parseInt(cleanHex.slice(0, 2), 16) || 6;
            const g = parseInt(cleanHex.slice(2, 4), 16) || 182;
            const b = parseInt(cleanHex.slice(4, 6), 16) || 212;
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        } catch {
            return `rgba(6, 182, 212, ${alpha})`;
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) { alert('La foto debe pesar menos de 2MB.'); return; }
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            setPhotoPreview(base64);
            setFormData(prev => ({ ...prev, photoUrl: base64 }));
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        playNeonClick();
        setLoading(true);

        try {
            await crearAspirante({
                ...formData,
                townId,
                date: new Date().toISOString(),
                formStep: 1,
                status: 'pending' // Asegurar que entra como 'nuevos'/'pending' en el embudo
            });
            playSuccessSound();
            setSuccess(true);
        } catch (error) {
            console.error("Error al enviar la solicitud", error);
            alert("Hubo un error al enviar tu solicitud. Intenta nuevamente.");
        } finally {
            setLoading(false);
        }
    };

    const handleShare = async () => {
        playNeonClick();
        const url = window.location.href;
        const text = `¡Súmate al equipo de Embajadores de ShopDigital VIP!\nBuscamos talentos comerciales.\nCompletá el formulario aquí:\n👉 ${url}`;
        
        if (navigator.share) {
            try {
                await navigator.share({
                    title: '¡Sé Embajador ShopDigital VIP!',
                    text: text,
                    url: url
                });
            } catch (err) {
                console.error('Error compartiendo:', err);
            }
        } else {
            const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
            window.open(waUrl, '_blank');
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
                <div className="absolute inset-0" style={{ background: `radial-gradient(circle at center, ${hexToRgba(zoneColor, 0.1)} 0%, transparent 100%)` }} />
                <div className="bg-zinc-900 border p-10 rounded-[2.5rem] w-full max-w-md text-center relative z-10" style={{ borderColor: hexToRgba(zoneColor, 0.3), boxShadow: `0 0 50px ${hexToRgba(zoneColor, 0.15)}` }}>
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border" style={{ backgroundColor: hexToRgba(zoneColor, 0.1), borderColor: hexToRgba(zoneColor, 0.5) }}>
                        <CheckCircle size={40} className="animate-pulse" style={{ color: zoneColor }} />
                    </div>
                    <h2 className="text-2xl font-[1000] uppercase tracking-widest mb-4" style={{ color: zoneColor }}>¡Solicitud Recibida!</h2>
                    <p className="text-white/70 text-sm leading-relaxed mb-8">
                        Tus datos han ingresado a nuestro Búnker. Nuestro equipo evaluará tu perfil y te contactaremos para la videollamada de ingreso.
                    </p>
                    <button 
                        onClick={() => { playNeonClick(); navigate(`/${townId}/home`); }}
                        className="w-full py-4 rounded-xl font-black uppercase tracking-[0.2em] text-[12px] text-white transition-all active:scale-95"
                        style={{ background: `linear-gradient(90deg, ${hexToRgba(zoneColor, 0.8)}, ${zoneColor})`, boxShadow: `0 0 20px ${hexToRgba(zoneColor, 0.4)}` }}
                    >
                        Volver al Inicio
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white pb-24 relative overflow-x-hidden selection:bg-white/30">
            {/* Background Layers */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none opacity-20 mix-blend-screen" style={{ backgroundColor: zoneColor }} />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none opacity-10 mix-blend-screen" style={{ backgroundColor: '#3b82f6' }} />
            
            <div className="relative z-10 px-6 pt-8 max-w-lg mx-auto">
                <div className="flex justify-between items-center mb-10">
                    <button onClick={() => { playNeonClick(); navigate(-1); }} className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-all active:scale-95">
                        <ChevronLeft size={20} />
                    </button>
                    <button onClick={handleShare} className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all active:scale-95" style={{ backgroundColor: hexToRgba(zoneColor, 0.1), borderColor: hexToRgba(zoneColor, 0.3), color: zoneColor, boxShadow: `0 0 15px ${hexToRgba(zoneColor, 0.2)}` }}>
                        <Share2 size={18} />
                    </button>
                </div>

                <div className="text-center mb-10">
                    <h1 className="text-3xl font-[1000] uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 mb-2 drop-shadow-md">
                        UNITE A LA RED
                    </h1>
                    <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: zoneColor }}>Reclutamiento de Embajadores · {townId.replace('-', ' ')}</p>
                    <p className="text-white/50 text-sm mt-4">Completá este formulario inicial para postularte. Evaluaremos tu perfil comercial y tecnológico.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 relative">
                    <div className="bg-zinc-900/50 border border-white/5 p-6 rounded-[2rem] space-y-5 backdrop-blur-sm relative overflow-hidden" style={{ boxShadow: `0 10px 40px ${hexToRgba(zoneColor, 0.05)}` }}>
                        
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] border-b border-white/10 pb-2 mb-4" style={{ color: zoneColor }}>1. Datos Personales</h3>

                        {/* 📸 Foto de Perfil */}
                        <div className="flex flex-col items-center mb-4">
                            <label htmlFor="photo-upload" className="cursor-pointer group">
                                <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 mx-auto transition-all group-hover:scale-105" style={{ borderColor: hexToRgba(zoneColor, 0.5), backgroundColor: hexToRgba(zoneColor, 0.1) }}>
                                    {photoPreview ? (
                                        <img src={photoPreview} alt="Foto" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                                            <Camera size={24} style={{ color: zoneColor }} />
                                            <span className="text-[8px] font-bold uppercase tracking-widest" style={{ color: zoneColor }}>Tu Foto</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Camera size={20} className="text-white" />
                                    </div>
                                </div>
                                <p className="text-[9px] uppercase tracking-widest text-white/40 text-center mt-2 font-bold">Tocar para subir foto</p>
                            </label>
                            <input id="photo-upload" type="file" accept="image/*" capture="user" onChange={handlePhotoChange} className="hidden" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-2 flex items-center gap-2"><User size={12} style={{ color: zoneColor }} /> Nombre Completo</label>
                            <input required name="name" value={formData.name} onChange={handleChange} placeholder="Ej. Juan Pérez" className="w-full bg-black/60 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold text-white focus:outline-none transition-colors" style={{ outlineColor: zoneColor }} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-2 flex items-center gap-2"><User size={12} style={{ color: zoneColor }} /> DNI</label>
                                <input required name="dni" value={formData.dni} onChange={handleChange} placeholder="Tu DNI" className="w-full bg-black/60 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold text-white focus:outline-none transition-colors" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-2 flex items-center gap-2"><Calendar size={12} style={{ color: zoneColor }} /> Edad</label>
                                <input required type="number" name="age" value={formData.age} onChange={handleChange} placeholder="Ej. 25" className="w-full bg-black/60 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold text-white focus:outline-none transition-colors" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-2 flex items-center gap-2">Sexo</label>
                                <select required name="gender" value={formData.gender} onChange={handleChange} className="w-full bg-black/60 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold text-white focus:outline-none transition-colors appearance-none">
                                    <option value="">Seleccionar</option>
                                    <option value="M">Masculino</option>
                                    <option value="F">Femenino</option>
                                    <option value="X">Otro</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-2 flex items-center gap-2">Nacionalidad</label>
                                <input required name="nationality" value={formData.nationality} onChange={handleChange} placeholder="Ej. Argentina" className="w-full bg-black/60 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold text-white focus:outline-none transition-colors" />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-2 flex items-center gap-2"><MapPin size={12} style={{ color: zoneColor }} /> Localidad / Dirección</label>
                            <input required name="location" value={formData.location} onChange={handleChange} placeholder="Barrio / Dirección" className="w-full bg-black/60 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold text-white focus:outline-none transition-colors" />
                        </div>

                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] border-b border-white/10 pb-2 mt-8 mb-4 pt-4" style={{ color: zoneColor }}>2. Contacto Digital</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-2 flex items-center gap-2"><Phone size={12} style={{ color: zoneColor }} /> WhatsApp</label>
                                <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="Ej. 11 1234-5678" className="w-full bg-black/60 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold text-white focus:outline-none transition-colors" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-2 flex items-center gap-2"><Mail size={12} style={{ color: zoneColor }} /> Correo Electrónico (Gmail)</label>
                                <input required type="email" name="email" value={formData.email} onChange={handleChange} placeholder="tu.correo@gmail.com" className="w-full bg-black/60 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold text-white focus:outline-none transition-colors" />
                            </div>
                        </div>

                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] border-b border-white/10 pb-2 mt-8 mb-4 pt-4" style={{ color: zoneColor }}>3. Herramientas y Skills</h3>

                        <div className="grid grid-cols-2 gap-4">
                            <label className="flex items-center gap-3 bg-black/40 border border-white/5 p-4 rounded-xl cursor-pointer hover:bg-white/5 transition-colors">
                                <input type="checkbox" name="hasSmartphone" checked={formData.hasSmartphone} onChange={handleChange} className="w-4 h-4 accent-cyan-500" />
                                <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><Smartphone size={14}/> Posee Smartphone</span>
                            </label>
                            <label className="flex items-center gap-3 bg-black/40 border border-white/5 p-4 rounded-xl cursor-pointer hover:bg-white/5 transition-colors">
                                <input type="checkbox" name="hasPC" checked={formData.hasPC} onChange={handleChange} className="w-4 h-4 accent-cyan-500" />
                                <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><Monitor size={14}/> Posee PC / Notebook</span>
                            </label>
                            <label className="flex items-center gap-3 bg-black/40 border border-white/5 p-4 rounded-xl cursor-pointer hover:bg-white/5 transition-colors">
                                <input type="checkbox" name="hasSalesExperience" checked={formData.hasSalesExperience} onChange={handleChange} className="w-4 h-4 accent-cyan-500" />
                                <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><Briefcase size={14}/> Experiencia en Ventas</span>
                            </label>
                            <label className="flex items-center gap-3 bg-black/40 border border-white/5 p-4 rounded-xl cursor-pointer hover:bg-white/5 transition-colors">
                                <input type="checkbox" name="hasDevKnowledge" checked={formData.hasDevKnowledge} onChange={handleChange} className="w-4 h-4 accent-cyan-500" />
                                <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><Cpu size={14}/> Conoce Programación</span>
                            </label>
                        </div>

                        <div className="mt-6 pt-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-2 block">¿Por qué te gustaría ser Embajador?</label>
                            <textarea required name="motivation" value={formData.motivation} onChange={handleChange} rows={3} placeholder="Contanos brevemente sobre vos..." className="w-full bg-black/60 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold text-white focus:outline-none transition-colors resize-none" />
                        </div>
                    </div>

                    <button disabled={loading} type="submit" className="w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[12px] flex items-center justify-center gap-3 active:scale-95 transition-all mt-6 text-white" style={{ background: `linear-gradient(90deg, ${hexToRgba(zoneColor, 0.8)}, ${zoneColor})`, boxShadow: `0 0 30px ${hexToRgba(zoneColor, 0.3)}` }}>
                        {loading ? 'Transmitiendo Datos...' : <><Send size={18} /> Enviar Postulación al Búnker</>}
                    </button>
                    <p className="text-center text-[10px] text-white/30 uppercase tracking-widest mt-4 flex items-center justify-center gap-2">
                        <CheckCircle size={10} /> Conexión Segura P2P
                    </p>
                </form>
            </div>
        </div>
    );
};

export default AmbassadorRecruitPage1;
