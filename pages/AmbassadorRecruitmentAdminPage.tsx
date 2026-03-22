import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Users, CheckCircle, XCircle, Search, Copy, Check, FileText } from 'lucide-react';
import { playNeonClick, playSuccessSound } from '../utils/audio';
import { db, eliminarAutorizado } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const AmbassadorRecruitmentAdminPage: React.FC = () => {
    const navigate = useNavigate();
    const [aspirantes, setAspirantes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    useEffect(() => {
        fetchAspirantes();
    }, []);

    const fetchAspirantes = async () => {
        setLoading(true);
        try {
            const q = query(
                collection(db, "autorizados"), 
                where("role", "==", "ambassador"),
            );
            const querySnapshot = await getDocs(q);
            const data: any[] = [];
            querySnapshot.forEach((doc) => {
                data.push({ id: doc.id, ...doc.data() });
            });
            // Sort to put pending first
            data.sort((a, b) => {
                if (a.status === 'pending' && b.status !== 'pending') return -1;
                if (a.status !== 'pending' && b.status === 'pending') return 1;
                return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
            });
            setAspirantes(data);
        } catch (error) {
            console.error("Error fetching aspirantes:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCopyLink = async (id: string) => {
        playNeonClick();
        const url = `${window.location.origin}/reclutamiento/alta/${id}`;
        try {
            await navigator.clipboard.writeText(url);
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        } catch (err) {
            console.error("Error copiando link", err);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        playNeonClick();
        if (window.confirm(`¿Seguro que quieres eliminar a ${name}?`)) {
            try {
                await eliminarAutorizado(id);
                setAspirantes(aspirantes.filter(a => a.id !== id));
                playSuccessSound();
            } catch (error) {
                console.error("Error al eliminar", error);
            }
        }
    };

    return (
        <div className="min-h-screen bg-black text-white pb-24 relative overflow-x-hidden selection:bg-cyan-500/30">
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px]" />
            </div>

            <div className="bg-zinc-900/80 backdrop-blur-xl border-b border-cyan-500/30 pt-10 pb-6 px-6 relative z-10 sticky top-0 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                <button onClick={() => { playNeonClick(); navigate(-1); }} className="absolute top-10 left-6 text-cyan-400 hover:text-cyan-300">
                    <ChevronLeft size={24} />
                </button>
                <div className="flex flex-col items-center">
                    <Users size={32} className="text-cyan-400 mb-2 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]" />
                    <h1 className="text-xl font-[1000] uppercase tracking-[0.2em] text-white">Reclutamiento</h1>
                    <p className="text-[9px] font-bold text-cyan-400/80 uppercase tracking-widest mt-1">Gestión de Aspirantes a Embajador</p>
                </div>
            </div>

            <div className="px-6 mt-8 space-y-6 relative z-10 max-w-4xl mx-auto">
                <div className="flex items-center gap-2 mb-2">
                    <FileText size={16} className="text-cyan-400" />
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-cyan-400">Panel de Control</h2>
                </div>

                {loading ? (
                    <div className="flex justify-center p-12">
                        <div className="w-8 h-8 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {aspirantes.length === 0 ? (
                            <p className="text-center text-white/50 py-10 text-sm uppercase tracking-widest font-bold">No hay postulantes registrados.</p>
                        ) : (
                            aspirantes.map(aspirante => (
                                <div key={aspirante.id} className={`bg-zinc-900/50 border ${aspirante.status === 'pending' ? 'border-yellow-500/30' : 'border-cyan-500/30'} rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden transition-all hover:bg-zinc-800/50`}>
                                    
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-lg font-black uppercase tracking-widest text-white">{aspirante.name}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${aspirante.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 'bg-green-500/10 text-green-400 border-green-500/20'}`}>
                                                    {aspirante.status === 'pending' ? 'Postulante (Paso 1)' : 'Activo'}
                                                </span>
                                                <span className="text-[9px] text-white/40 uppercase tracking-widest">
                                                    {new Date(aspirante.date).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        {aspirante.status === 'pending' ? (
                                            <button 
                                                onClick={() => handleCopyLink(aspirante.id)}
                                                className={`flex items-center gap-2 ${copiedId === aspirante.id ? 'bg-green-500/20 text-green-400 border-green-500/40' : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/20'} border px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg`}
                                            >
                                                {copiedId === aspirante.id ? <Check size={14}/> : <Copy size={14} />} 
                                                {copiedId === aspirante.id ? 'Enlace Copiado' : 'Enlace de Alta'}
                                            </button>
                                        ) : (
                                            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/50">
                                                <CheckCircle size={14} className="text-green-400" /> Alta Completada
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 p-4 bg-black/40 rounded-xl border border-white/5 text-[10px] uppercase font-bold tracking-widest text-white/60">
                                        <div>
                                            <p className="text-cyan-500/50 mb-1">Edad</p>
                                            <p className="text-white">{aspirante.age || 'N/A'} años</p>
                                        </div>
                                        <div>
                                            <p className="text-cyan-500/50 mb-1">Localidad</p>
                                            <p className="text-white">{aspirante.location || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-cyan-500/50 mb-1">Teléfono</p>
                                            <p className="text-white">{aspirante.phone || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-cyan-500/50 mb-1">Motivación</p>
                                            <p className="text-white truncate" title={aspirante.motivation}>{aspirante.motivation || 'N/A'}</p>
                                        </div>
                                    </div>

                                    {aspirante.status === 'active' && (
                                        <div className="mt-4 p-4 bg-cyan-900/10 rounded-xl border border-cyan-500/20 text-[10px] uppercase font-bold tracking-widest text-white/60">
                                            <p className="text-cyan-400 mb-2 flex items-center gap-2"><CheckCircle size={12}/> Datos de Alta Definitiva</p>
                                            <div className="grid grid-cols-2 gap-4">
                                                <p><span className="text-white/40 block mb-1">Email Google:</span> <span className="text-white lowercase">{aspirante.email}</span></p>
                                                <p><span className="text-white/40 block mb-1">DNI:</span> <span className="text-white">{aspirante.dni}</span></p>
                                                <p><span className="text-white/40 block mb-1">CBU:</span> <span className="text-white">{aspirante.cbu}</span></p>
                                                <p><span className="text-white/40 block mb-1">Contacto Emergencia:</span> <span className="text-white">{aspirante.emergencyContact}</span></p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-6 flex justify-end">
                                        <button 
                                            onClick={() => handleDelete(aspirante.id, aspirante.name)}
                                            className="text-red-500 hover:text-red-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1 transition-colors"
                                        >
                                            <XCircle size={12} /> Eliminar Registro
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AmbassadorRecruitmentAdminPage;
