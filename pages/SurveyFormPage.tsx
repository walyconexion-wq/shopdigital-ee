import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    ChevronLeft, Store, MapPin, Map, 
    Phone, Users, AlertTriangle, 
    MessageSquare, BatteryCharging, Send, User
} from 'lucide-react';
import { guardarRelevamiento } from '../firebase';
import { playNeonClick } from '../utils/audio';
import { CATEGORIES } from '../constants';

// Constantes Locales para el formulario
const ZONAS = [
    "Monte Grande Centro", "El Jagüel", "Luis Guillón", "Canning", "Ezeiza Centro", "Tristán Suárez", "Otra"
];

const SurveyFormPage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        category: CATEGORIES[0].id,
        address: '',
        zone: ZONAS[0],
        contactName: '',
        phone: '',
        socialNetworks: '',
        digitalDiagnosis: {
            missing: '',
            interestLevel: 'medium' as 'high' | 'medium' | 'low',
            observations: ''
        },
        ambassadorName: '' // Debería sacarse del usuario logueado en una versión con Auth
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...(prev as any)[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleInterestChange = (level: 'high' | 'medium' | 'low') => {
        playNeonClick();
        setFormData(prev => ({
            ...prev,
            digitalDiagnosis: { ...prev.digitalDiagnosis, interestLevel: level }
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        playNeonClick();
        
        if (!formData.name || !formData.phone || !formData.ambassadorName) {
            alert("Completá como mínimo: Nombre, Teléfono y Nombre del Embajador.");
            return;
        }

        setLoading(true);
        try {
            const leadData = {
                ...formData,
                date: new Date().toISOString(),
                status: 'pending'
            };
            
            await guardarRelevamiento(leadData);
            alert(`¡Relevamiento de ${formData.name} guardado con éxito! ✅`);
            navigate(-1);
        } catch (error) {
            console.error("Error guardando relevamiento", error);
            alert("Ocurrió un error al guardar el prospecto.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white pb-24 relative overflow-hidden selection:bg-cyan-500/30">
            {/* Fondo dinámico oscuro */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-yellow-500/10 rounded-full blur-[100px]" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(234,179,8,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(234,179,8,0.03)_1px,transparent_1px)] bg-[size:30px_30px]" />
            </div>

            {/* Header Flotante */}
            <div className="bg-zinc-900/80 backdrop-blur-xl border-b border-yellow-500/30 pt-10 pb-6 px-6 relative z-10 sticky top-0 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                <button onClick={() => navigate(-1)} className="absolute top-10 left-6 text-white/50 hover:text-yellow-400">
                    <ChevronLeft size={28} />
                </button>
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-yellow-500/10 rounded-2xl flex items-center justify-center mb-2 border border-yellow-400/30">
                        <BatteryCharging size={24} className="text-yellow-400 animate-pulse" />
                    </div>
                    <h1 className="text-[16px] font-[1000] uppercase tracking-widest text-white text-center leading-tight">Relevamiento<br/>Táctico</h1>
                </div>
            </div>

            {/* Formulario Mobile-First */}
            <form onSubmit={handleSubmit} className="px-5 mt-6 relative z-10 max-w-md mx-auto space-y-8 pb-12">
                
                {/* SECCIÓN: OPERATIVO */}
                <div className="bg-black/60 border border-white/10 rounded-3xl p-5 shadow-lg">
                    <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40 mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
                        <User size={14} className="text-yellow-400" /> Registro Operativo
                    </h2>
                    
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-2 ml-1">Tu Nombre (Embajador)</label>
                        <input
                            type="text"
                            name="ambassadorName"
                            value={formData.ambassadorName}
                            onChange={handleChange}
                            placeholder="Ej. Waly, Luz..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-lg font-bold text-white focus:outline-none focus:border-yellow-400 focus:shadow-[0_0_15px_rgba(234,179,8,0.2)] transition-all placeholder:text-white/20"
                            required
                        />
                    </div>
                </div>

                {/* SECCIÓN: IDENTIDAD Y CONTACTO */}
                <div className="bg-zinc-900/80 border border-yellow-500/20 rounded-3xl p-5 shadow-lg">
                    <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-yellow-400 mb-4 flex items-center gap-2 border-b border-yellow-500/20 pb-2">
                        <Store size={14} /> Identidad del Local
                    </h2>
                    
                    <div className="space-y-5">
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-2 ml-1">Nombre Comercial</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Ej. Barbería The Kings"
                                className="w-full bg-black/50 border border-white/10 rounded-2xl py-4 px-5 text-xl font-black text-white focus:outline-none focus:border-yellow-400 transition-all placeholder:text-white/20"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-2 ml-1 flex items-center gap-1"><MapPin size={10}/> Zona</label>
                                <select 
                                    name="zone"
                                    value={formData.zone}
                                    onChange={handleChange}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl py-4 px-4 text-sm font-bold text-white focus:outline-none focus:border-yellow-400 appearance-none text-center"
                                >
                                    {ZONAS.map(z => <option key={z} value={z}>{z}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-2 ml-1 flex items-center gap-1"><Store size={10}/> Rubro</label>
                                <select 
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl py-4 px-4 text-sm font-bold text-white focus:outline-none focus:border-yellow-400 appearance-none text-center"
                                >
                                    {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-2 ml-1 flex items-center gap-1"><Map size={10}/> Dirección Exacta</label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Ej. Alem 123"
                                className="w-full bg-black/50 border border-white/10 rounded-2xl py-4 px-5 text-lg font-bold text-white focus:outline-none focus:border-yellow-400 transition-all placeholder:text-white/20"
                            />
                        </div>

                        <div className="pt-4 border-t border-white/10">
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-2 ml-1 flex items-center gap-1"><Users size={10}/> Contacto Clave (Dueño/Empl.)</label>
                            <input
                                type="text"
                                name="contactName"
                                value={formData.contactName}
                                onChange={handleChange}
                                placeholder="Ej. Marcos (Dueño)"
                                className="w-full bg-black/50 border border-white/10 rounded-2xl py-4 px-5 text-lg font-bold text-white focus:outline-none focus:border-yellow-400 transition-all placeholder:text-white/20"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-2 ml-1 flex items-center gap-1"><Phone size={10}/> WhatsApp</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="1122334455"
                                className="w-full bg-black/50 border border-white/10 rounded-2xl py-4 px-5 text-xl font-black text-yellow-500 focus:outline-none focus:border-yellow-400 transition-all placeholder:text-yellow-500/20"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* SECCIÓN: DIAGNÓSTICO DIGITAL */}
                <div className="bg-black/80 border border-white/10 rounded-3xl p-5 shadow-lg">
                    <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40 mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
                        <AlertTriangle size={14} className="text-white/60" /> Diagnóstico Rápido
                    </h2>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-3 ml-1">Nivel de Interés Inicial</label>
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleInterestChange('low')}
                                    className={`py-3 rounded-xl font-black tracking-widest text-[9px] uppercase transition-all ${formData.digitalDiagnosis.interestLevel === 'low' ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'bg-white/5 text-white/40 border border-white/10'}`}
                                >Bajo</button>
                                <button
                                    type="button"
                                    onClick={() => handleInterestChange('medium')}
                                    className={`py-3 rounded-xl font-black tracking-widest text-[9px] uppercase transition-all ${formData.digitalDiagnosis.interestLevel === 'medium' ? 'bg-yellow-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.4)]' : 'bg-white/5 text-white/40 border border-white/10'}`}
                                >Medio</button>
                                <button
                                    type="button"
                                    onClick={() => handleInterestChange('high')}
                                    className={`py-3 rounded-xl font-black tracking-widest text-[9px] uppercase transition-all ${formData.digitalDiagnosis.interestLevel === 'high' ? 'bg-green-500 text-black shadow-[0_0_15px_rgba(34,197,94,0.4)]' : 'bg-white/5 text-white/40 border border-white/10'}`}
                                >Alto 🔥</button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-2 ml-1">¿Qué le falta al local? (Dolor)</label>
                            <input
                                type="text"
                                name="digitalDiagnosis.missing"
                                value={formData.digitalDiagnosis.missing}
                                onChange={handleChange}
                                placeholder="Ej. Fidelizar, más difusión, QR en mesa..."
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-sm font-medium text-white focus:outline-none focus:border-yellow-400 transition-all placeholder:text-white/20"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-2 ml-1 flex items-center gap-1"><MessageSquare size={10}/> Observaciones del Encuentro</label>
                            <textarea
                                name="digitalDiagnosis.observations"
                                value={formData.digitalDiagnosis.observations}
                                onChange={handleChange}
                                rows={3}
                                placeholder="Ej. Me pidió que vuelva el viernes porque hoy estaba lleno."
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-sm font-medium text-white focus:outline-none focus:border-yellow-400 transition-all placeholder:text-white/20 resize-none"
                            />
                        </div>
                    </div>
                </div>

                {/* SUBMIT BUTTON */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-black py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[12px] flex items-center justify-center gap-3 active:scale-95 transition-all shadow-[0_10px_40px_rgba(234,179,8,0.3)] disabled:opacity-50"
                >
                    {loading ? (
                        'GUARDANDO...'
                    ) : (
                        <>
                            <Send size={18} /> Guardar Prospecto
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default SurveyFormPage;
