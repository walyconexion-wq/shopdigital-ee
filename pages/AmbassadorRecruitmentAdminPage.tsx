import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Users, CheckCircle, XCircle, Copy, Check, FileText, Zap, ShieldAlert, Terminal, MessageCircle, ArrowRight, ArrowLeft, Shield, Star, BookOpen } from 'lucide-react';
import { playNeonClick, playSuccessSound } from '../utils/audio';
import { db, eliminarAutorizado, actualizarAutorizado } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

// Definición de las Fases del Embudo
const FUNNEL_STAGES = [
    { id: 'nuevos', label: 'Nuevos (Formulario)', color: '#f59e0b' }, // Amber
    { id: 'entrevista', label: 'Entrevista / Evaluación', color: '#8b5cf6' }, // Violet
    { id: 'academia', label: 'Academia ShopDigital', color: '#3b82f6' }, // Blue
    { id: 'aprobados', label: 'Graduados / Listos', color: '#10b981' } // Emerald
];

const AmbassadorRecruitmentAdminPage: React.FC = () => {
    const { townId = 'esteban-echeverria' } = useParams<{ townId: string }>();
    const navigate = useNavigate();
    const [aspirantes, setAspirantes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);

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

    useEffect(() => {
        fetchAspirantes();
    }, [townId]);

    const fetchAspirantes = async () => {
        setLoading(true);
        try {
            const q = query(
                collection(db, "autorizados"), 
                where("role", "==", "ambassador"),
                where("townId", "==", townId)
            );
            const querySnapshot = await getDocs(q);
            const data: any[] = [];
            querySnapshot.forEach((doc) => {
                let status = doc.data().status;
                // Normalizar estados legacy
                if (status === 'pending') status = 'nuevos';
                if (status === 'active') status = 'aprobados';
                
                data.push({ id: doc.id, ...doc.data(), status: status || 'nuevos' });
            });
            // Sort by date newest first
            data.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
            setAspirantes(data);
        } catch (error) {
            console.error("Error fetching aspirantes:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCopyLink = async (id: string) => {
        playNeonClick();
        const url = `${window.location.origin}/${townId}/reclutamiento/alta/${id}`;
        try {
            await navigator.clipboard.writeText(url);
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
            playSuccessSound();
        } catch (err) {
            console.error("Error copiando link", err);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        playNeonClick();
        if (window.confirm(`¿INICIAR PROTOCOLO DE BORRADO DE DATOS PARA: ${name.toUpperCase()}?`)) {
            try {
                await eliminarAutorizado(id);
                setAspirantes(aspirantes.filter(a => a.id !== id));
                if (selectedCandidate?.id === id) setSelectedCandidate(null);
                playSuccessSound();
            } catch (error) {
                console.error("Error al eliminar", error);
            }
        }
    };

    const changeStatus = async (id: string, newStatus: string) => {
        playNeonClick();
        try {
            await actualizarAutorizado(id, { status: newStatus });
            setAspirantes(aspirantes.map(a => a.id === id ? { ...a, status: newStatus } : a));
            if (selectedCandidate?.id === id) {
                setSelectedCandidate({ ...selectedCandidate, status: newStatus });
            }
            playSuccessSound();
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    const authorizeRole = async (id: string, role: 'ambassador' | 'director') => {
        playNeonClick();
        const label = role === 'ambassador' ? 'EMBAJADOR' : 'DIRECTOR DE ZONA';
        if (window.confirm(`¿CONFIRMAR AUTORIZACIÓN DE ROL: ${label} para ${selectedCandidate?.name?.toUpperCase()}?`)) {
            try {
                await actualizarAutorizado(id, {
                    role,
                    status: 'active',
                    authorizedAt: new Date().toISOString()
                });
                setAspirantes(aspirantes.map(a => a.id === id ? { ...a, status: 'active', role } : a));
                if (selectedCandidate?.id === id) {
                    setSelectedCandidate({ ...selectedCandidate, status: 'active', role });
                }
                playSuccessSound();
                alert(`✅ ¡${selectedCandidate?.name} ha sido autorizado como ${label}! Su cuenta ya está activa.`);
                setSelectedCandidate(null);
            } catch (error) {
                console.error('Error authorizing role:', error);
            }
        }
    };

    // Función para obtener aspirantes por columna
    const getAspirantesByStage = (stageId: string) => {
        return aspirantes.filter(a => a.status === stageId);
    };

    return (
        <div className="min-h-screen pb-24 relative overflow-x-hidden selection:bg-white/30" style={{ backgroundColor: '#020617' }}>
            <style>{`
                @keyframes pulseGlow {
                    0%, 100% { filter: drop-shadow(0 0 15px ${hexToRgba(zoneColor, 0.4)}); }
                    50% { filter: drop-shadow(0 0 35px ${hexToRgba(zoneColor, 0.8)}); }
                }
                .tech-grid-bg {
                    background-size: 40px 40px;
                    background-image: 
                        linear-gradient(to right, ${hexToRgba(zoneColor, 0.05)} 1px, transparent 1px),
                        linear-gradient(to bottom, ${hexToRgba(zoneColor, 0.05)} 1px, transparent 1px);
                }
                .glass-card-neon {
                    background: linear-gradient(145deg, rgba(255,255,255,0.02), rgba(0,0,0,0.4));
                    backdrop-filter: blur(12px);
                    border: 1px solid ${hexToRgba(zoneColor, 0.2)};
                    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
                }
                /* Hide scrollbar for columns */
                .kanban-col::-webkit-scrollbar { width: 4px; }
                .kanban-col::-webkit-scrollbar-track { background: transparent; }
                .kanban-col::-webkit-scrollbar-thumb { background: ${hexToRgba(zoneColor, 0.3)}; border-radius: 4px; }
            `}</style>

            {/* Background Tecnológico */}
            <div className="fixed inset-0 pointer-events-none z-0 tech-grid-bg">
                <div 
                    className="absolute top-0 right-0 w-[50vw] h-[50vw] rounded-full blur-[150px] opacity-20 mix-blend-screen"
                    style={{ backgroundColor: zoneColor }}
                />
                <div 
                    className="absolute bottom-0 left-0 w-[40vw] h-[40vw] rounded-full blur-[120px] opacity-10 mix-blend-screen"
                    style={{ backgroundColor: zoneColor }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020617]/80 to-[#020617]/95"></div>
            </div>

            {/* Header Sticky Console */}
            <div 
                className="backdrop-blur-xl border-b pt-8 pb-4 px-6 relative z-10 sticky top-0 shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
                style={{ background: 'rgba(2, 6, 23, 0.85)', borderBottomColor: hexToRgba(zoneColor, 0.3) }}
            >
                <div 
                    role="button" tabIndex={0} 
                    onClick={() => { playNeonClick(); navigate(-1); }} 
                    className="absolute top-8 left-6 hover:opacity-70 cursor-pointer transition-transform hover:scale-110 active:scale-95" 
                    style={{ color: zoneColor }}
                >
                    <ChevronLeft size={24} />
                </div>
                <div className="flex flex-col items-center">
                    <Users size={28} className="mb-1" style={{ color: zoneColor, animation: 'pulseGlow 4s infinite alternate' }} />
                    <h1 className="text-xl font-[1000] uppercase tracking-[0.25em] text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 text-center drop-shadow-md">
                        RADAR DE RECLUTAS
                    </h1>
                    <p className="text-[9px] font-black uppercase tracking-[0.4em] mt-1 text-center opacity-80" style={{ color: zoneColor, textShadow: `0 0 10px ${hexToRgba(zoneColor, 0.5)}` }}>
                        NODO: {townId.replace('-', ' ')}
                    </p>
                </div>
            </div>

            <div className="px-6 mt-6 relative z-10 pb-20 w-full max-w-full mx-auto">
                {loading ? (
                    <div className="flex justify-center p-12">
                        <div className="w-12 h-12 border-4 rounded-full animate-spin" style={{ borderColor: hexToRgba(zoneColor, 0.2), borderTopColor: zoneColor }} />
                    </div>
                ) : (
                    <div className="flex gap-4 overflow-x-auto pb-8 snap-x snap-mandatory h-[calc(100vh-200px)] items-start">
                        {FUNNEL_STAGES.map((stage) => {
                            const colAspirantes = getAspirantesByStage(stage.id);
                            return (
                                <div key={stage.id} className="flex-1 min-w-[280px] snap-center flex flex-col h-full bg-black/40 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-md">
                                    {/* Column Header */}
                                    <div className="p-4 border-b border-white/10" style={{ backgroundColor: hexToRgba(stage.color, 0.1) }}>
                                        <div className="flex justify-between items-center">
                                            <h2 className="text-[11px] font-black uppercase tracking-widest text-white drop-shadow-md flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stage.color, boxShadow: `0 0 10px ${stage.color}` }} />
                                                {stage.label}
                                            </h2>
                                            <span className="text-[10px] font-bold bg-white/10 px-2 py-0.5 rounded-full text-white/70">
                                                {colAspirantes.length}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {/* Column Body */}
                                    <div className="p-4 flex-1 overflow-y-auto kanban-col space-y-4">
                                        {colAspirantes.length === 0 ? (
                                            <div className="h-24 flex items-center justify-center border border-dashed border-white/10 rounded-xl">
                                                <span className="text-[9px] uppercase tracking-widest text-white/30 font-bold">Sin registros</span>
                                            </div>
                                        ) : (
                                            colAspirantes.map((aspirante) => (
                                                <div 
                                                    key={aspirante.id} 
                                                    className="bg-zinc-900/80 border rounded-2xl p-4 cursor-pointer hover:-translate-y-1 transition-transform shadow-lg relative overflow-hidden group"
                                                    style={{ borderColor: hexToRgba(stage.color, 0.3) }}
                                                    onClick={() => setSelectedCandidate(aspirante)}
                                                >
                                                    <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: stage.color }} />
                                                    <h3 className="text-[13px] font-black uppercase tracking-widest text-white mb-1 pl-2 truncate">{aspirante.name}</h3>
                                                    <p className="text-[10px] text-white/50 uppercase tracking-widest pl-2 mb-3 truncate">{aspirante.location || 'Localidad N/A'}</p>
                                                    
                                                    {/* Skills mini-badges */}
                                                    <div className="flex gap-1 pl-2 mb-4">
                                                        {aspirante.hasSmartphone && <span className="bg-cyan-500/20 text-cyan-400 text-[8px] px-1.5 py-0.5 rounded border border-cyan-500/30" title="Smartphone">📱</span>}
                                                        {aspirante.hasPC && <span className="bg-blue-500/20 text-blue-400 text-[8px] px-1.5 py-0.5 rounded border border-blue-500/30" title="PC">💻</span>}
                                                        {aspirante.hasSalesExperience && <span className="bg-emerald-500/20 text-emerald-400 text-[8px] px-1.5 py-0.5 rounded border border-emerald-500/30" title="Ventas">💼</span>}
                                                        {aspirante.hasDevKnowledge && <span className="bg-violet-500/20 text-violet-400 text-[8px] px-1.5 py-0.5 rounded border border-violet-500/30" title="Programación">⌨️</span>}
                                                    </div>

                                                    <div className="flex gap-2 pl-2 mt-auto">
                                                        <button 
                                                            className="flex-1 py-1.5 text-[9px] font-bold uppercase tracking-widest rounded-lg transition-colors"
                                                            style={{ backgroundColor: hexToRgba(stage.color, 0.1), color: stage.color, border: `1px solid ${hexToRgba(stage.color, 0.3)}` }}
                                                        >
                                                            Ver Ficha
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* MODAL DETALLES DEL CANDIDATO */}
            {selectedCandidate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedCandidate(null)} />
                    
                    <div className="relative w-full max-w-2xl bg-zinc-950 border rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col"
                         style={{ borderColor: hexToRgba(zoneColor, 0.4) }}>
                        
                        {/* Modal Header */}
                        <div className="p-6 border-b flex justify-between items-start" style={{ borderColor: hexToRgba(zoneColor, 0.2), backgroundColor: hexToRgba(zoneColor, 0.05) }}>
                            <div>
                                <h2 className="text-xl font-[1000] uppercase tracking-[0.2em] text-white flex items-center gap-3">
                                    <User style={{ color: zoneColor }} /> {selectedCandidate.name}
                                </h2>
                                <p className="text-[10px] uppercase tracking-widest text-white/50 mt-1">ID: {selectedCandidate.id} | FASE: {FUNNEL_STAGES.find(s => s.id === selectedCandidate.status)?.label}</p>
                            </div>
                            <button onClick={() => setSelectedCandidate(null)} className="text-white/50 hover:text-white"><XCircle size={24} /></button>
                        </div>

                        {/* Modal Body (Scrollable) */}
                        <div className="p-6 overflow-y-auto kanban-col flex-1 space-y-6">
                            
                            {/* Data Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                    <p className="text-[9px] uppercase tracking-widest text-cyan-400/70 mb-1">DNI</p>
                                    <p className="text-xs font-bold text-white">{selectedCandidate.dni || 'N/A'}</p>
                                </div>
                                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                    <p className="text-[9px] uppercase tracking-widest text-cyan-400/70 mb-1">Edad</p>
                                    <p className="text-xs font-bold text-white">{selectedCandidate.age || 'N/A'} Años</p>
                                </div>
                                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                    <p className="text-[9px] uppercase tracking-widest text-cyan-400/70 mb-1">Nacionalidad</p>
                                    <p className="text-xs font-bold text-white">{selectedCandidate.nationality || 'N/A'}</p>
                                </div>
                                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                    <p className="text-[9px] uppercase tracking-widest text-cyan-400/70 mb-1">Teléfono</p>
                                    <p className="text-xs font-bold text-white">{selectedCandidate.phone || 'N/A'}</p>
                                </div>
                                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                    <p className="text-[9px] uppercase tracking-widest text-cyan-400/70 mb-1">Correo Gmail</p>
                                    <p className="text-xs font-bold text-white truncate" title={selectedCandidate.email}>{selectedCandidate.email || 'N/A'}</p>
                                </div>
                                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                    <p className="text-[9px] uppercase tracking-widest text-cyan-400/70 mb-1">Localidad</p>
                                    <p className="text-xs font-bold text-white">{selectedCandidate.location || 'N/A'}</p>
                                </div>
                            </div>

                            {/* Skills/Tools */}
                            <div>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 mb-3 border-b border-white/10 pb-2">Equipamiento y Habilidades</h3>
                                <div className="flex flex-wrap gap-3">
                                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase ${selectedCandidate.hasSmartphone ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300' : 'bg-white/5 border-white/10 text-white/30'}`}>
                                        <Check size={12}/> Smartphone
                                    </div>
                                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase ${selectedCandidate.hasPC ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300' : 'bg-white/5 border-white/10 text-white/30'}`}>
                                        <Check size={12}/> PC / Notebook
                                    </div>
                                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase ${selectedCandidate.hasSalesExperience ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300' : 'bg-white/5 border-white/10 text-white/30'}`}>
                                        <Check size={12}/> Exp. Ventas
                                    </div>
                                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase ${selectedCandidate.hasDevKnowledge ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300' : 'bg-white/5 border-white/10 text-white/30'}`}>
                                        <Check size={12}/> Prog. Básica
                                    </div>
                                </div>
                            </div>

                            {/* Motivación */}
                            <div>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 mb-3 border-b border-white/10 pb-2">Motivación</h3>
                                <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-sm text-white/80 italic">
                                    "{selectedCandidate.motivation || 'Sin especificar'}"
                                </div>
                            </div>

                            {/* Controles de Acción Rápidos */}
                            <div>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 mb-3 border-b border-white/10 pb-2">Panel de Operaciones R.R.H.H.</h3>
                                <div className="flex flex-wrap gap-3">
                                    <button 
                                        onClick={() => {
                                            playNeonClick();
                                            window.open(`https://wa.me/${selectedCandidate.phone.replace(/\D/g, '')}?text=Hola ${selectedCandidate.name}, somos del equipo de ShopDigital VIP.`, '_blank');
                                        }}
                                        className="flex-1 min-w-[200px] flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest bg-green-500/10 text-green-400 border border-green-500/30 hover:bg-green-500/20 transition-all active:scale-95"
                                    >
                                        <MessageCircle size={16}/> Iniciar WhatsApp
                                    </button>
                                    
                                    {/* Botón: Generar enlace de alta */}
                                    {selectedCandidate.status === 'entrevista' && (
                                        <button 
                                            onClick={() => handleCopyLink(selectedCandidate.id)}
                                            className="flex-1 min-w-[200px] flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest bg-violet-500/10 text-violet-400 border border-violet-500/30 hover:bg-violet-500/20 transition-all active:scale-95"
                                        >
                                            <Zap size={16}/> {copiedId === selectedCandidate.id ? '✅ Enlace Copiado!' : 'Copiar Enlace de Alta'}
                                        </button>
                                    )}

                                    {/* Botón: Ver Academia */}
                                    {(selectedCandidate.status === 'academia') && (
                                        <button 
                                            onClick={() => { playNeonClick(); navigate(`/${townId}/academia-embajadores?id=${selectedCandidate.id}`); }}
                                            className="flex-1 min-w-[200px] flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/30 hover:bg-blue-500/20 transition-all active:scale-95"
                                        >
                                            <BookOpen size={16}/> Ver Bóveda de Entrenamiento
                                        </button>
                                    )}

                                    {/* Botones de Autorización de Rol */}
                                    {selectedCandidate.status === 'aprobados' && (
                                        <div className="w-full space-y-2">
                                            <p className="text-[9px] uppercase tracking-widest font-bold text-emerald-400 mb-2 flex items-center gap-1"><Star size={10}/> Candidato aprobado — Asignar Rol Oficial:</p>
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => authorizeRole(selectedCandidate.id, 'ambassador')}
                                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest text-white transition-all active:scale-95"
                                                    style={{ background: 'linear-gradient(90deg, rgba(16,185,129,0.8), #10b981)', boxShadow: '0 0 20px rgba(16,185,129,0.3)' }}
                                                >
                                                    <Shield size={16}/> Autorizar como Embajador
                                                </button>
                                                <button 
                                                    onClick={() => authorizeRole(selectedCandidate.id, 'director')}
                                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest text-white transition-all active:scale-95"
                                                    style={{ background: 'linear-gradient(90deg, rgba(139,92,246,0.8), #8b5cf6)', boxShadow: '0 0 20px rgba(139,92,246,0.3)' }}
                                                >
                                                    <Star size={16}/> Autorizar como Director
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>

                        {/* Modal Footer (Move Stages) */}
                        <div className="p-4 border-t border-white/10 flex justify-between items-center bg-black/40">
                            <button 
                                onClick={() => handleDelete(selectedCandidate.id, selectedCandidate.name)}
                                className="text-red-500 hover:text-red-400 px-3 py-2 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-red-500/10 rounded-lg transition-all"
                            >
                                <XCircle size={14}/> Borrar Registro
                            </button>

                            <div className="flex gap-2">
                                <select 
                                    className="bg-zinc-900 border border-white/20 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl px-4 py-2 outline-none focus:border-cyan-400 cursor-pointer"
                                    value={selectedCandidate.status}
                                    onChange={(e) => changeStatus(selectedCandidate.id, e.target.value)}
                                >
                                    {FUNNEL_STAGES.map(s => (
                                        <option key={s.id} value={s.id}>Mover a: {s.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export default AmbassadorRecruitmentAdminPage;
