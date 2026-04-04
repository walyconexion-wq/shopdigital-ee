import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Send, Share2, User, Phone, MapPin, Calendar, CheckCircle } from 'lucide-react';
import { playNeonClick, playSuccessSound } from '../utils/audio';
import { crearAspirante } from '../firebase';

const AmbassadorRecruitPage1: React.FC = () => {
    const { townId = 'esteban-echeverria' } = useParams<{ townId: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        location: '',
        phone: '',
        secondaryPhone: '',
        motivation: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        playNeonClick();
        setLoading(true);

        try {
            await crearAspirante({
                ...formData,
                townId, // Inyectar zona actual
                date: new Date().toISOString(),
                formStep: 1
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
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.1)_0%,transparent_100%)]" />
                <div className="bg-zinc-900 border border-cyan-500/30 p-10 rounded-[2.5rem] w-full max-w-md text-center shadow-[0_0_50px_rgba(34,211,238,0.15)] relative z-10">
                    <div className="w-20 h-20 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-cyan-400/50">
                        <CheckCircle size={40} className="text-cyan-400 animate-pulse" />
                    </div>
                    <h2 className="text-2xl font-[1000] uppercase tracking-widest text-cyan-400 mb-4">¡Solicitud Recibida!</h2>
                    <p className="text-white/70 text-sm leading-relaxed mb-8">
                        Tus datos han sido registrados en nuestro sistema de evaluación. Nuestro equipo revisará tu perfil y nos contactaremos a la brevedad para agendar la entrevista.
                    </p>
                    <button 
                        onClick={() => { playNeonClick(); navigate(`/${townId}/home`); }}
                        className="w-full btn-cyan-neon py-4 rounded-xl font-black uppercase tracking-[0.2em] text-[12px]"
                    >
                        Volver al Inicio
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white pb-24 relative overflow-x-hidden selection:bg-cyan-500/30">
            {/* Background Layers */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
            
            <div className="relative z-10 px-6 pt-8 max-w-md mx-auto">
                <div className="flex justify-between items-center mb-10">
                    <button onClick={() => { playNeonClick(); navigate(-1); }} className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-all active:scale-95">
                        <ChevronLeft size={20} />
                    </button>
                    <button onClick={handleShare} className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 hover:bg-cyan-500/20 transition-all active:scale-95 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                        <Share2 size={18} />
                    </button>
                </div>

                <div className="text-center mb-10">
                    <h1 className="text-3xl font-[1000] uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">
                        {townId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </h1>
                    <p className="text-[11px] font-bold text-cyan-400/60 uppercase tracking-widest">Reclutamiento de Embajadores</p>
                    <p className="text-white/50 text-sm mt-4">Completá este formulario inicial para postularte como Embajador ShopDigital VIP en esta zona.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 relative">
                    {/* Decorative line */}
                    <div className="absolute left-[20px] top-6 bottom-6 w-px bg-gradient-to-b from-cyan-500/0 via-cyan-500/20 to-cyan-500/0 hidden sm:block"></div>

                    <div className="bg-zinc-900/50 border border-white/5 p-6 rounded-[2rem] space-y-5 backdrop-blur-sm relative overflow-hidden">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-cyan-400/70 mb-2 flex items-center gap-2"><User size={12} /> Nombre Completo</label>
                            <input required name="name" value={formData.name} onChange={handleChange} placeholder="Ej. Juan Pérez" className="w-full bg-black/60 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold text-white focus:outline-none focus:border-cyan-400 transition-colors" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-cyan-400/70 mb-2 flex items-center gap-2"><Calendar size={12} /> Edad</label>
                                <input required type="number" name="age" value={formData.age} onChange={handleChange} placeholder="Ej. 25" className="w-full bg-black/60 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold text-white focus:outline-none focus:border-cyan-400 transition-colors" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-cyan-400/70 mb-2 flex items-center gap-2"><MapPin size={12} /> Localidad</label>
                                <input required name="location" value={formData.location} onChange={handleChange} placeholder="Ej. Ezeiza" className="w-full bg-black/60 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold text-white focus:outline-none focus:border-cyan-400 transition-colors" />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-cyan-400/70 mb-2 flex items-center gap-2"><Phone size={12} /> Teléfono Principal (WhatsApp)</label>
                            <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="Ej. 11 1234-5678" className="w-full bg-black/60 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold text-white focus:outline-none focus:border-cyan-400 transition-colors" />
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-cyan-400/70 mb-2 flex items-center gap-2"><Phone size={12} /> Teléfono Secundario (Opcional)</label>
                            <input type="tel" name="secondaryPhone" value={formData.secondaryPhone} onChange={handleChange} placeholder="Número alternativo" className="w-full bg-black/60 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold text-white focus:outline-none focus:border-cyan-400 transition-colors" />
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-cyan-400/70 mb-2 block">¿Por qué te gustaría ser Embajador?</label>
                            <textarea required name="motivation" value={formData.motivation} onChange={handleChange} rows={3} placeholder="Contanos brevemente sobre vos y tus expectativas..." className="w-full bg-black/60 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold text-white focus:outline-none focus:border-cyan-400 transition-colors resize-none" />
                        </div>
                    </div>

                    <button disabled={loading} type="submit" className="w-full btn-cyan-neon py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[12px] flex items-center justify-center gap-3 active:scale-95 transition-all mt-6">
                        {loading ? 'Enviando...' : <><Send size={16} /> Enviar Postulación</>}
                    </button>
                    <p className="text-center text-[10px] text-white/30 uppercase tracking-widest mt-4">Toda la información es confidencial.</p>
                </form>
            </div>
        </div>
    );
};

export default AmbassadorRecruitPage1;
