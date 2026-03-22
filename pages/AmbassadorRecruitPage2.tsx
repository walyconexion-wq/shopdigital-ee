import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ShieldCheck, Mail, Save, UserCheck, AlertCircle } from 'lucide-react';
import { playNeonClick, playSuccessSound } from '../utils/audio';
import { db, loginConGoogle, actualizarAutorizado } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const AmbassadorRecruitPage2: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [candidate, setCandidate] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    
    // Auth State
    const [googleUser, setGoogleUser] = useState<any>(null);
    
    // Form State
    const [formData, setFormData] = useState({
        dni: '',
        fullAddress: '',
        cbu: '',
        emergencyContact: ''
    });

    useEffect(() => {
        const fetchCandidate = async () => {
            if (!id) {
                setError("ID no válido.");
                setLoading(false);
                return;
            }
            try {
                const docRef = doc(db, "autorizados", id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    if (data.status === 'active') {
                        setError("Este perfil ya se encuentra ACTIVO y vinculado.");
                    } else {
                        setCandidate(data);
                    }
                } else {
                    setError("No se encontró la solicitud.");
                }
            } catch (err) {
                setError("Error al cargar los datos.");
            } finally {
                setLoading(false);
            }
        };
        fetchCandidate();
    }, [id]);

    const handleGoogleLogin = async () => {
        playNeonClick();
        try {
            const user = await loginConGoogle();
            setGoogleUser({
                email: user.email,
                uid: user.uid,
                photoURL: user.photoURL,
                displayName: user.displayName
            });
            playSuccessSound();
        } catch (error) {
            console.error("Login failed", error);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFinalSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        playNeonClick();
        if (!googleUser || !id) return;

        setLoading(true);
        try {
            await actualizarAutorizado(id, {
                ...formData,
                email: googleUser.email,
                uid: googleUser.uid,
                googleName: googleUser.displayName,
                photo: googleUser.photoURL,
                status: 'active',
                approvedAt: new Date().toISOString()
            });
            
            playSuccessSound();
            alert("¡Felicidades! Tu cuenta de Embajador ha sido activada exitosamente.\nAhora puedes ingresar a los paneles administrativos.");
            navigate('/embajador');
        } catch (err) {
            console.error(err);
            alert("Error al guardar los datos.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-black flex items-center justify-center text-cyan-400">Verificando invitación...</div>;
    }

    if (error) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
                <AlertCircle size={48} className="text-red-500 mb-4" />
                <h2 className="text-xl font-black uppercase tracking-widest text-red-500 mb-2">Acceso Inválido</h2>
                <p className="text-white/60 text-sm mb-6">{error}</p>
                <button onClick={() => navigate('/')} className="px-6 py-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all text-xs font-bold uppercase tracking-widest">Volver al Inicio</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white pb-24 relative overflow-x-hidden selection:bg-cyan-500/30">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
            
            <div className="relative z-10 px-6 pt-8 max-w-lg mx-auto">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-cyan-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-cyan-400/30">
                        <ShieldCheck size={32} className="text-cyan-400" />
                    </div>
                    <h1 className="text-2xl font-[1000] uppercase tracking-tighter text-white mb-2">Alta Definitiva</h1>
                    <p className="text-[11px] font-bold text-cyan-400/60 uppercase tracking-widest bg-cyan-500/10 inline-block px-3 py-1 rounded-full border border-cyan-500/20">
                        Aspirante: {candidate?.name}
                    </p>
                </div>

                {!googleUser ? (
                    <div className="bg-zinc-900/50 border border-white/5 p-8 rounded-[2rem] space-y-6 backdrop-blur-sm shadow-2xl text-center">
                        <h2 className="text-lg font-black uppercase tracking-widest text-white">Paso 1: Vincular Cuenta</h2>
                        <p className="text-white/60 text-sm leading-relaxed">
                            Para proteger tu acceso como Embajador, necesitamos vincular tu cuenta de Google. Este será tu único método de acceso seguro a los paneles administrativos.
                        </p>
                        
                        <button 
                            onClick={handleGoogleLogin}
                            className="w-full bg-white text-black py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-gray-200 transition-colors shadow-lg mt-4"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Vincular con Google
                        </button>
                    </div>
                ) : (
                    <div className="bg-zinc-900/50 border border-cyan-500/30 p-8 rounded-[2rem] space-y-6 backdrop-blur-sm shadow-[0_0_30px_rgba(34,211,238,0.1)] relative">
                        <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10 mb-6">
                            {googleUser.photoURL ? (
                                <img src={googleUser.photoURL} alt="Perfil" className="w-10 h-10 rounded-full" />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center"><UserCheck size={20} className="text-cyan-400"/></div>
                            )}
                            <div>
                                <p className="text-[10px] uppercase font-bold text-cyan-400">Cuenta Vinculada</p>
                                <p className="text-sm font-medium text-white">{googleUser.email}</p>
                            </div>
                        </div>

                        <form onSubmit={handleFinalSubmit} className="space-y-4">
                            <h2 className="text-lg font-black uppercase tracking-widest text-white mb-4">Paso 2: Ficha Técnica</h2>
                            
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-2 block">DNI / Documento</label>
                                <input required name="dni" value={formData.dni} onChange={handleChange} className="w-full bg-black/60 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold text-white focus:outline-none focus:border-cyan-400 transition-colors" />
                            </div>
                            
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-2 block">Dirección Completa</label>
                                <input required name="fullAddress" value={formData.fullAddress} onChange={handleChange} className="w-full bg-black/60 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold text-white focus:outline-none focus:border-cyan-400 transition-colors" />
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-2 block">CBU / CVU (Para Comisiones)</label>
                                <input required name="cbu" value={formData.cbu} onChange={handleChange} className="w-full bg-black/60 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold text-white focus:outline-none focus:border-cyan-400 transition-colors" />
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-2 block">Contacto de Emergencia</label>
                                <input required name="emergencyContact" value={formData.emergencyContact} onChange={handleChange} placeholder="Nombre y Teléfono" className="w-full bg-black/60 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold text-white focus:outline-none focus:border-cyan-400 transition-colors" />
                            </div>

                            <button type="submit" className="w-full btn-cyan-neon py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[12px] flex items-center justify-center gap-3 mt-6">
                                <Save size={18} /> Activar Cuenta Embajador
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AmbassadorRecruitPage2;
