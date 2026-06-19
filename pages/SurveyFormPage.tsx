import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
    ChevronLeft, Store, MapPin, Map, 
    Phone, Users, AlertTriangle, 
    MessageSquare, BatteryCharging, Send, User
} from 'lucide-react';
import { guardarRelevamiento } from '../firebase';
import { playNeonClick } from '../utils/audio';
import { useTownCategories } from '../hooks/useTownCategories';
import { useTownLocalities } from '../hooks/useTownLocalities';
import { AriMerchantAssistant } from '../components/AriMerchantAssistant';

const SurveyFormPage: React.FC = () => {
    const { townId = 'esteban-echeverria' } = useParams<{ townId: string }>();
    const navigate = useNavigate();
    const { localities, loading: loadingLocs } = useTownLocalities(townId);
    const categories = useTownCategories(townId);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        category: categories[0]?.id || '',
        address: '',
        zone: '',
        contactName: '',
        phone: '',
        socialNetworks: '',
        digitalDiagnosis: {
            missing: '',
            interestLevel: 'medium' as 'high' | 'medium' | 'low',
            observations: ''
        },
        ambassadorName: '' 
    });

    // Sincronizar zona inicial cuando carguen las localidades
    useEffect(() => {
        if (localities.length > 0 && !formData.zone) {
            setFormData(prev => ({ ...prev, zone: localities[0] }));
        }
    }, [localities, formData.zone]);

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
                townId, // SELLO REGIONAL OBLIGATORIO 🛡️
                date: new Date().toISOString(),
                status: 'pending'
            };
            
            await guardarRelevamiento(leadData, townId);
            alert(`¡Relevamiento de ${formData.name} guardado con éxito en ${townId}! ✅`);
            navigate(-1);
        } catch (error) {
            console.error("Error guardando relevamiento", error);
            alert("Ocurrió un error al guardar el prospecto.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] text-white pb-24 relative overflow-x-hidden selection:bg-amber-500/30">
            {/* ESTILOS TECH-MESH ÁMBAR Y ANIMACIONES */}
            <style>{`
                @keyframes pulseGlow {
                    0%, 100% { filter: drop-shadow(0 0 15px rgba(245,158,11,0.4)); }
                    50% { filter: drop-shadow(0 0 35px rgba(245,158,11,0.8)); }
                }
                .tech-grid-bg {
                    background-size: 30px 30px;
                    background-image: 
                        linear-gradient(to right, rgba(245,158,11,0.04) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(245,158,11,0.04) 1px, transparent 1px);
                }
                .glass-card-neon {
                    background: linear-gradient(145deg, rgba(255,255,255,0.02), rgba(0,0,0,0.4));
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(245,158,11,0.15);
                    box-shadow: inset 0 0 20px rgba(245,158,11,0.02), 0 8px 32px rgba(0,0,0,0.4);
                }
            `}</style>

            <div className="fixed inset-0 pointer-events-none z-0 tech-grid-bg" />
            
            {/* Esferas de luz ámbar */}
            <div className="fixed top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-amber-500/5 blur-[120px] pointer-events-none z-0" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[30vw] h-[30vw] rounded-full bg-orange-500/5 blur-[100px] pointer-events-none z-0" />

            {/* HEADER STICKY (MOLDE FACTURACIÓN) */}
            <div className="sticky top-0 z-40 bg-[#020617]/80 backdrop-blur-xl border-b border-amber-500/20 pt-6 pb-4 px-6 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
                <div className="flex items-center justify-between mb-4">
                    <button onClick={() => navigate(`/${townId}/embajador/`)} className="p-2 bg-white/5 rounded-xl border border-white/10 text-white/70 hover:text-amber-400 hover:border-amber-400/50 transition-all active:scale-95">
                        <ChevronLeft size={20} />
                    </button>
                    <div className="flex-1 flex justify-center items-center gap-3">
                        <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/30" style={{ animation: 'pulseGlow 3s infinite' }}>
                            <BatteryCharging size={20} className="text-amber-400" />
                        </div>
                        <div>
                            <h1 className="text-sm font-black uppercase tracking-widest text-white leading-none">Relevamiento</h1>
                            <span className="text-[10px] font-bold text-amber-500/60 uppercase tracking-widest">Táctico</span>
                        </div>
                    </div>
                    <div className="w-10" /> {/* Spacer */}
                </div>
            </div>

            {/* PANEL ARI INLINE */}
            <div className="relative z-10 px-5 mt-6 mb-8 max-w-md mx-auto">
                <AriMerchantAssistant 
                    shop={{ id: 'relevamiento', name: 'Prospecto' } as any}
                    role="ambassador-field"
                    townId={townId}
                    inline={true}
                />
            </div>

            {/* Formulario Mobile-First */}
            <form onSubmit={handleSubmit} className="px-5 mt-6 relative z-10 max-w-md mx-auto space-y-8 pb-12">
                
                {/* SECCIÓN: OPERATIVO */}
                <div className="glass-card-neon rounded-3xl p-5 relative overflow-hidden">
                    <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40 mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
                        <User size={14} className="text-amber-400" /> Registro Operativo
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
                <div className="glass-card-neon border-amber-500/20 rounded-3xl p-5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-[50px] pointer-events-none" />
                    <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-amber-400 mb-4 flex items-center gap-2 border-b border-amber-500/20 pb-2">
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
                                    {loadingLocs ? <option>Cargando...</option> : localities.map(z => <option key={z} value={z}>{z}</option>)}
                                    <option value="Otra">Otra</option>
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
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
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
                <div className="glass-card-neon rounded-3xl p-5 relative overflow-hidden">
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
                                    className={`py-3 rounded-xl font-black tracking-widest text-[9px] uppercase transition-all ${formData.digitalDiagnosis.interestLevel === 'medium' ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]' : 'bg-white/5 text-white/40 border border-white/10'}`}
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
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-sm font-medium text-white focus:outline-none focus:border-amber-400 transition-all placeholder:text-white/20"
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
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-sm font-medium text-white focus:outline-none focus:border-amber-400 transition-all placeholder:text-white/20 resize-none"
                            />
                        </div>
                    </div>
                </div>

                {/* SUBMIT BUTTON */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-amber-400 to-amber-600 text-black py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[12px] flex items-center justify-center gap-3 active:scale-95 transition-all shadow-[0_10px_40px_rgba(245,158,11,0.3)] disabled:opacity-50"
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
