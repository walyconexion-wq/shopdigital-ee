import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ShieldCheck, Save, UserCheck, AlertCircle, GraduationCap, Briefcase, Link, Star } from 'lucide-react';
import { playNeonClick, playSuccessSound } from '../utils/audio';
import { db, loginConGoogle, actualizarAutorizado } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const AmbassadorRecruitPage2: React.FC = () => {
    const { id, townId = 'esteban-echeverria' } = useParams<{ id: string, townId: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [candidate, setCandidate] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [googleUser, setGoogleUser] = useState<any>(null);

    const getZoneColor = () => {
        if (townId === 'ezeiza') return '#06b6d4';
        if (townId === 'esteban-echeverria') return '#8b5cf6';
        if (townId === 'mina-clavero' || townId === 'traslasierra') return '#10b981';
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
        } catch { return `rgba(6, 182, 212, ${alpha})`; }
    };

    const [formData, setFormData] = useState({
        // Campos Adicionales de Ficha Técnica
        fullAddress: '',
        cbu: '',
        emergencyContact: '',
        // Educación y Experiencia
        educationLevel: '',
        currentOccupation: '',
        yearsExperience: '',
        previousCompanies: '',
        // Skills adicionales
        socialMediaPresence: '',
        linkedinUrl: '',
        instagramHandle: '',
        referredBy: '',
        // Disponibilidad
        weeklyHours: '',
        workZone: '',
        // Declaración
        acceptsTerms: false
    });

    useEffect(() => {
        const fetchCandidate = async () => {
            if (!id) { setError("ID no válido."); setLoading(false); return; }
            try {
                const docRef = doc(db, "autorizados", id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    if (data.status === 'active') {
                        setError("Este perfil ya se encuentra ACTIVO.");
                    } else {
                        setCandidate(data);
                    }
                } else { setError("No se encontró la solicitud."); }
            } catch (err) { setError("Error al cargar los datos."); }
            finally { setLoading(false); }
        };
        fetchCandidate();
    }, [id]);

    const handleGoogleLogin = async () => {
        playNeonClick();
        try {
            const user = await loginConGoogle();
            setGoogleUser({ email: user.email, uid: user.uid, photoURL: user.photoURL, displayName: user.displayName });
            playSuccessSound();
        } catch (error) { console.error("Login failed", error); }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleFinalSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        playNeonClick();
        if (!googleUser || !id) return;
        if (!formData.acceptsTerms) { alert("Debes aceptar los términos y condiciones."); return; }
        setSaving(true);
        try {
            await actualizarAutorizado(id, {
                ...formData,
                email: googleUser.email,
                uid: googleUser.uid,
                googleName: googleUser.displayName,
                photo: googleUser.photoURL,
                status: 'academia', // Entra a la academia, no directo a activo
                highFormCompletedAt: new Date().toISOString()
            });
            playSuccessSound();
            navigate(`/${townId}/academia-embajadores?id=${id}`);
        } catch (err) {
            console.error(err);
            alert("Error al guardar los datos.");
        } finally { setSaving(false); }
    };

    if (loading) return <div className="min-h-screen bg-black flex items-center justify-center" style={{ color: zoneColor }}>Verificando invitación...</div>;

    if (error) return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
            <AlertCircle size={48} className="text-red-500 mb-4" />
            <h2 className="text-xl font-black uppercase tracking-widest text-red-500 mb-2">Acceso Inválido</h2>
            <p className="text-white/60 text-sm mb-6">{error}</p>
            <button onClick={() => navigate(`/${townId}/home`)} className="px-6 py-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all text-xs font-bold uppercase tracking-widest">Volver al Inicio</button>
        </div>
    );

    return (
        <div className="min-h-screen bg-black text-white pb-24 relative overflow-x-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[150px] pointer-events-none opacity-20" style={{ backgroundColor: zoneColor }} />
            <div className="relative z-10 px-6 pt-8 max-w-2xl mx-auto">
                <button onClick={() => { playNeonClick(); navigate(-1); }} className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 hover:bg-white/10 transition-all">
                    <ChevronLeft size={20} />
                </button>

                <div className="text-center mb-10">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border" style={{ backgroundColor: hexToRgba(zoneColor, 0.1), borderColor: hexToRgba(zoneColor, 0.3) }}>
                        <ShieldCheck size={32} style={{ color: zoneColor }} />
                    </div>
                    <h1 className="text-2xl font-[1000] uppercase tracking-tighter text-white mb-2">Alta Definitiva</h1>
                    <p className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full inline-block border" style={{ color: zoneColor, backgroundColor: hexToRgba(zoneColor, 0.1), borderColor: hexToRgba(zoneColor, 0.3) }}>
                        Aspirante: {candidate?.name}
                    </p>
                    <p className="text-white/40 text-xs mt-3">Completá tu ficha técnica completa para avanzar a la Academia.</p>
                </div>

                {/* PASO 1: Google */}
                {!googleUser ? (
                    <div className="bg-zinc-900/50 border border-white/5 p-8 rounded-[2rem] space-y-6 backdrop-blur-sm text-center mb-6">
                        <h2 className="text-lg font-black uppercase tracking-widest text-white">Paso 1: Vincular Cuenta Google</h2>
                        <p className="text-white/60 text-sm leading-relaxed">Este será tu acceso seguro a los paneles administrativos como Embajador o Director.</p>
                        <button onClick={handleGoogleLogin} className="w-full bg-white text-black py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-gray-200 transition-colors shadow-lg mt-4">
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Vincular con Google
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleFinalSubmit} className="space-y-6">
                        {/* Google Badge */}
                        <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
                            {googleUser.photoURL ? <img src={googleUser.photoURL} alt="Perfil" className="w-10 h-10 rounded-full" /> : <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: hexToRgba(zoneColor, 0.2) }}><UserCheck size={20} style={{ color: zoneColor }}/></div>}
                            <div>
                                <p className="text-[10px] uppercase font-bold" style={{ color: zoneColor }}>✅ Cuenta Vinculada</p>
                                <p className="text-sm font-medium text-white">{googleUser.email}</p>
                            </div>
                        </div>

                        {/* Sección: Datos Básicos de Contacto */}
                        <div className="bg-zinc-900/50 border border-white/5 p-6 rounded-[2rem] space-y-5 backdrop-blur-sm">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] border-b border-white/10 pb-2 mb-4" style={{ color: zoneColor }}>Datos de Contacto y Domicilio</h3>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-2 block">Dirección Completa</label>
                                <input required name="fullAddress" value={formData.fullAddress} onChange={handleChange} placeholder="Calle, Número, Ciudad" className="w-full bg-black/60 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold text-white focus:outline-none transition-colors" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-2 block">CBU / CVU (Comisiones)</label>
                                    <input name="cbu" value={formData.cbu} onChange={handleChange} placeholder="22 dígitos" className="w-full bg-black/60 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold text-white focus:outline-none transition-colors" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-2 block">Contacto de Emergencia</label>
                                    <input name="emergencyContact" value={formData.emergencyContact} onChange={handleChange} placeholder="Nombre y Tel." className="w-full bg-black/60 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold text-white focus:outline-none transition-colors" />
                                </div>
                            </div>
                        </div>

                        {/* Sección: Educación y Experiencia */}
                        <div className="bg-zinc-900/50 border border-white/5 p-6 rounded-[2rem] space-y-5 backdrop-blur-sm">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] border-b border-white/10 pb-2 mb-4 flex items-center gap-2" style={{ color: zoneColor }}>
                                <GraduationCap size={14}/> Educación y Experiencia
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-2 block">Nivel Educativo</label>
                                    <select name="educationLevel" value={formData.educationLevel} onChange={handleChange} className="w-full bg-black/60 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold text-white focus:outline-none appearance-none">
                                        <option value="">Seleccionar</option>
                                        <option value="primario">Primario Completo</option>
                                        <option value="secundario">Secundario Completo</option>
                                        <option value="terciario">Terciario / Técnico</option>
                                        <option value="universitario">Universitario</option>
                                        <option value="posgrado">Posgrado</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-2 block">Ocupación Actual</label>
                                    <input name="currentOccupation" value={formData.currentOccupation} onChange={handleChange} placeholder="Ej. Freelancer" className="w-full bg-black/60 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold text-white focus:outline-none transition-colors" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-2 flex items-center gap-2"><Briefcase size={10}/> Años en Ventas</label>
                                    <input type="number" name="yearsExperience" value={formData.yearsExperience} onChange={handleChange} placeholder="Años" className="w-full bg-black/60 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold text-white focus:outline-none transition-colors" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-2 block">Empresas Anteriores (opcional)</label>
                                    <input name="previousCompanies" value={formData.previousCompanies} onChange={handleChange} placeholder="Ej. Mercado Libre..." className="w-full bg-black/60 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold text-white focus:outline-none transition-colors" />
                                </div>
                            </div>
                        </div>

                        {/* Sección: Presencia Digital */}
                        <div className="bg-zinc-900/50 border border-white/5 p-6 rounded-[2rem] space-y-5 backdrop-blur-sm">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] border-b border-white/10 pb-2 mb-4 flex items-center gap-2" style={{ color: zoneColor }}>
                                <Link size={14}/> Presencia Digital y Redes
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-2 block">Instagram</label>
                                    <input name="instagramHandle" value={formData.instagramHandle} onChange={handleChange} placeholder="@tu.usuario" className="w-full bg-black/60 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold text-white focus:outline-none transition-colors" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-2 block">LinkedIn (opcional)</label>
                                    <input name="linkedinUrl" value={formData.linkedinUrl} onChange={handleChange} placeholder="linkedin.com/in/..." className="w-full bg-black/60 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold text-white focus:outline-none transition-colors" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-2 block">Horas disponibles / semana</label>
                                    <select name="weeklyHours" value={formData.weeklyHours} onChange={handleChange} className="w-full bg-black/60 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold text-white focus:outline-none appearance-none">
                                        <option value="">Seleccionar</option>
                                        <option value="5-10">5 a 10 horas</option>
                                        <option value="10-20">10 a 20 horas</option>
                                        <option value="20-30">20 a 30 horas</option>
                                        <option value="full-time">Full-Time (40+)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-2 block">¿Quién te recomendó?</label>
                                    <input name="referredBy" value={formData.referredBy} onChange={handleChange} placeholder="Nombre del Embajador" className="w-full bg-black/60 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold text-white focus:outline-none transition-colors" />
                                </div>
                            </div>
                        </div>

                        {/* Sección: Términos */}
                        <div className="bg-zinc-900/50 border border-white/5 p-6 rounded-[2rem] backdrop-blur-sm">
                            <label className="flex items-start gap-3 cursor-pointer group">
                                <input type="checkbox" name="acceptsTerms" checked={formData.acceptsTerms} onChange={handleChange} className="w-5 h-5 mt-0.5 flex-shrink-0 accent-violet-500" />
                                <p className="text-sm text-white/60 leading-relaxed group-hover:text-white/80 transition-colors">
                                    Acepto los <strong className="text-white">Términos y Condiciones</strong> de ShopDigital VIP, confirmo que los datos ingresados son verídicos y me comprometo a cumplir con el Código de Conducta del Embajador.
                                </p>
                            </label>
                        </div>

                        <button type="submit" disabled={saving || !formData.acceptsTerms} className="w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[12px] flex items-center justify-center gap-3 transition-all active:scale-95 text-white disabled:opacity-40 disabled:cursor-not-allowed" style={{ background: `linear-gradient(90deg, ${hexToRgba(zoneColor, 0.8)}, ${zoneColor})`, boxShadow: `0 0 30px ${hexToRgba(zoneColor, 0.3)}` }}>
                            {saving ? 'Guardando...' : <><Save size={18} /> Avanzar a la Academia</>}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default AmbassadorRecruitPage2;
