import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Users, CheckCircle, XCircle, Copy, Check, FileText, Zap, ShieldAlert, Terminal } from 'lucide-react';
import { playNeonClick, playSuccessSound } from '../utils/audio';
import { db, eliminarAutorizado } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const AmbassadorRecruitmentAdminPage: React.FC = () => {
    const { townId = 'esteban-echeverria' } = useParams<{ townId: string }>();
    const navigate = useNavigate();
    const [aspirantes, setAspirantes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [copiedId, setCopiedId] = useState<string | null>(null);

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
                playSuccessSound();
            } catch (error) {
                console.error("Error al eliminar", error);
            }
        }
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
                .glass-card-neon:hover {
                    border-color: ${hexToRgba(zoneColor, 0.5)};
                    box-shadow: 0 0 25px ${hexToRgba(zoneColor, 0.15)};
                    background: linear-gradient(145deg, rgba(255,255,255,0.04), rgba(0,0,0,0.6));
                }
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
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020617]/50 to-[#020617]/90"></div>
            </div>

            {/* Header Sticky Console */}
            <div 
                className="backdrop-blur-xl border-b pt-10 pb-6 px-6 relative z-10 sticky top-0 shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
                style={{ 
                    background: 'rgba(2, 6, 23, 0.85)',
                    borderBottomColor: hexToRgba(zoneColor, 0.3)
                }}
            >
                <div 
                    role="button" tabIndex={0} 
                    onClick={() => { playNeonClick(); navigate(-1); }} 
                    className="absolute top-10 left-6 hover:opacity-70 cursor-pointer transition-transform hover:scale-110 active:scale-95" 
                    style={{ color: zoneColor }}
                >
                    <ChevronLeft size={24} />
                </div>
                <div className="flex flex-col items-center">
                    <Users size={36} className="mb-2" style={{ color: zoneColor, animation: 'pulseGlow 4s infinite alternate' }} />
                    <h1 className="text-2xl font-[1000] uppercase tracking-[0.25em] text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 text-center drop-shadow-md">
                        RECLUTAMIENTO
                    </h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] mt-2 text-center flex items-center justify-center gap-1 opacity-80" style={{ color: zoneColor, textShadow: `0 0 10px ${hexToRgba(zoneColor, 0.5)}` }}>
                        NODO: {townId.replace('-', ' ')}
                    </p>
                </div>
            </div>

            <div className="px-6 mt-8 space-y-6 relative z-10 max-w-4xl mx-auto pb-20">
                <div className="flex items-center gap-2 mb-4 justify-center md:justify-start">
                    <Terminal size={16} style={{ color: zoneColor }} />
                    <h2 className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: zoneColor }}>Registros de Aspirantes</h2>
                </div>

                {loading ? (
                    <div className="flex justify-center p-12">
                        <div className="w-12 h-12 border-4 rounded-full animate-spin" style={{ borderColor: hexToRgba(zoneColor, 0.2), borderTopColor: zoneColor }} />
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {aspirantes.length === 0 ? (
                            <div className="glass-card-neon rounded-3xl p-10 text-center animate-in fade-in duration-500">
                                <ShieldAlert size={40} className="mx-auto mb-4 opacity-50" style={{ color: zoneColor }} />
                                <p className="text-sm uppercase tracking-[0.3em] font-[1000] text-white/70">Terminal Vacía</p>
                                <p className="text-[10px] text-white/40 uppercase tracking-widest mt-2">No hay postulantes registrados en esta zona.</p>
                            </div>
                        ) : (
                            aspirantes.map((aspirante, index) => (
                                <div 
                                    key={aspirante.id} 
                                    className="glass-card-neon rounded-3xl p-6 md:p-8 relative overflow-hidden transition-all duration-500 hover:-translate-y-1"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    {/* Indicador de Status Glow */}
                                    <div 
                                        className="absolute top-0 left-0 w-full h-1"
                                        style={{ 
                                            background: aspirante.status === 'pending' 
                                                ? 'linear-gradient(90deg, transparent, #eab308, transparent)' // Yellow
                                                : `linear-gradient(90deg, transparent, ${zoneColor}, transparent)` 
                                        }}
                                    />
                                    
                                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
                                        <div>
                                            <h3 className="text-xl font-[1000] uppercase tracking-[0.2em] text-white drop-shadow-md flex items-center gap-3">
                                                {aspirante.name}
                                                {aspirante.status === 'active' && <CheckCircle size={18} style={{ color: zoneColor }} />}
                                            </h3>
                                            <div className="flex flex-wrap items-center gap-2 mt-3">
                                                <span 
                                                    className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border shadow-sm backdrop-blur-md"
                                                    style={{ 
                                                        backgroundColor: aspirante.status === 'pending' ? 'rgba(234, 179, 8, 0.1)' : hexToRgba(zoneColor, 0.1),
                                                        color: aspirante.status === 'pending' ? '#fde047' : zoneColor,
                                                        borderColor: aspirante.status === 'pending' ? 'rgba(234, 179, 8, 0.3)' : hexToRgba(zoneColor, 0.3)
                                                    }}
                                                >
                                                    {aspirante.status === 'pending' ? 'Paso 1: Postulante' : 'Paso 2: Alta Completada'}
                                                </span>
                                                <span className="text-[9px] text-white/40 uppercase tracking-widest px-2 py-1 bg-white/5 rounded-full border border-white/10">
                                                    {new Date(aspirante.date).toLocaleDateString()}
                                                </span>
                                                <span 
                                                    className="text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-full border"
                                                    style={{ 
                                                        backgroundColor: hexToRgba(zoneColor, 0.05),
                                                        color: zoneColor,
                                                        borderColor: hexToRgba(zoneColor, 0.2)
                                                    }}
                                                >
                                                    ID: {aspirante.id.substring(0, 8)}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        {/* Botón de Acción Principal */}
                                        <div className="flex-shrink-0 w-full md:w-auto">
                                            {aspirante.status === 'pending' ? (
                                                <button 
                                                    onClick={() => handleCopyLink(aspirante.id)}
                                                    className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-[11px] font-[1000] uppercase tracking-widest active:scale-95 transition-all"
                                                    style={{ 
                                                        backgroundColor: copiedId === aspirante.id ? hexToRgba('#22c55e', 0.2) : hexToRgba(zoneColor, 0.15),
                                                        color: copiedId === aspirante.id ? '#4ade80' : zoneColor,
                                                        border: `1px solid ${copiedId === aspirante.id ? 'rgba(34, 197, 94, 0.4)' : hexToRgba(zoneColor, 0.4)}`,
                                                        boxShadow: copiedId === aspirante.id ? '0 0 20px rgba(34, 197, 94, 0.2)' : `0 0 20px ${hexToRgba(zoneColor, 0.2)}`
                                                    }}
                                                >
                                                    {copiedId === aspirante.id ? <Check size={16}/> : <Zap size={16} />} 
                                                    {copiedId === aspirante.id ? 'ENLACE COPIADO' : 'GENERAR ENLACE DE ALTA'}
                                                </button>
                                            ) : (
                                                <div 
                                                    className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest"
                                                    style={{ backgroundColor: hexToRgba(zoneColor, 0.05), border: `1px solid ${hexToRgba(zoneColor, 0.2)}`, color: zoneColor }}
                                                >
                                                    <CheckCircle size={16} /> Alta Ratificada
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Matriz de Datos */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 p-5 rounded-2xl border" style={{ backgroundColor: 'rgba(0,0,0,0.5)', borderColor: hexToRgba(zoneColor, 0.1) }}>
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-1 opacity-70" style={{ color: zoneColor }}>Edad</p>
                                            <p className="text-[13px] text-white font-bold">{aspirante.age || 'N/A'} AÑOS</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-1 opacity-70" style={{ color: zoneColor }}>Localidad</p>
                                            <p className="text-[13px] text-white font-bold truncate" title={aspirante.location}>{aspirante.location || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-1 opacity-70" style={{ color: zoneColor }}>Teléfono</p>
                                            <p className="text-[13px] text-white font-bold">{aspirante.phone || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-1 opacity-70" style={{ color: zoneColor }}>Motivación</p>
                                            <p className="text-[13px] text-white/80 italic truncate" title={aspirante.motivation}>"{aspirante.motivation || 'N/A'}"</p>
                                        </div>
                                    </div>

                                    {/* Datos Extendidos (Solo Activos) */}
                                    {aspirante.status === 'active' && (
                                        <div className="mt-4 p-5 rounded-2xl border relative overflow-hidden" style={{ backgroundColor: hexToRgba(zoneColor, 0.05), borderColor: hexToRgba(zoneColor, 0.2) }}>
                                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                                <FileText size={40} style={{ color: zoneColor }} />
                                            </div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2" style={{ color: zoneColor }}>
                                                <CheckCircle size={14}/> Dossier de Alta Definitiva
                                            </p>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="flex items-center gap-3 bg-black/40 p-3 rounded-xl border border-white/5">
                                                    <span className="text-[9px] text-white/40 uppercase tracking-widest w-24">Email:</span> 
                                                    <span className="text-xs text-white truncate">{aspirante.email}</span>
                                                </div>
                                                <div className="flex items-center gap-3 bg-black/40 p-3 rounded-xl border border-white/5">
                                                    <span className="text-[9px] text-white/40 uppercase tracking-widest w-24">DNI:</span> 
                                                    <span className="text-xs text-white tracking-widest">{aspirante.dni}</span>
                                                </div>
                                                <div className="flex items-center gap-3 bg-black/40 p-3 rounded-xl border border-white/5">
                                                    <span className="text-[9px] text-white/40 uppercase tracking-widest w-24">CBU:</span> 
                                                    <span className="text-xs text-white tracking-widest">{aspirante.cbu}</span>
                                                </div>
                                                <div className="flex items-center gap-3 bg-black/40 p-3 rounded-xl border border-white/5">
                                                    <span className="text-[9px] text-white/40 uppercase tracking-widest w-24">Emergencia:</span> 
                                                    <span className="text-xs text-white truncate">{aspirante.emergencyContact}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Controles de Destrucción */}
                                    <div className="mt-6 pt-4 border-t border-white/5 flex justify-end">
                                        <button 
                                            onClick={() => handleDelete(aspirante.id, aspirante.name)}
                                            className="text-red-500 hover:text-red-400 hover:bg-red-500/10 px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2 transition-all group"
                                        >
                                            <XCircle size={14} className="group-hover:scale-110 transition-transform" /> Borrar Registro del Sistema
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
