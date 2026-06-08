import React, { useState, useEffect, useRef } from 'react';
import { Radio, AlertTriangle, ShieldCheck, Clock, Send, CheckCircle2, ChevronDown, ChevronUp, Bell, BellOff } from 'lucide-react';
import { db, suscribirseADirectivasBunker, responderDirectivaBunker } from '../firebase';
import { BunkerDirective, BunkerReply } from '../types';

interface DirectiveNotifierProps {
    bunkerId: string;
    townId: string;
    onDirectivesUpdate?: (text: string) => void;
}

const getBunkerColors = (bunkerId: string) => {
    switch (bunkerId.toLowerCase()) {
        case 'director':
        case 'director-waly':
            return {
                hex: '#8b5cf6',
                border: 'border-violet-500/20 focus:border-violet-400',
                shadow: 'shadow-[0_0_15px_rgba(139,92,246,0.15)]',
                text: 'text-violet-400',
                bg: 'bg-violet-500/5',
                accent: 'bg-violet-500',
                accentHover: 'hover:bg-violet-600',
                accentBorder: 'border-violet-500/50',
                ring: 'ring-violet-500/20',
                glow: 'rgba(139,92,246,0.3)',
                label: 'Dirección General'
            };
        case 'administracion':
            return {
                hex: '#f59e0b',
                border: 'border-amber-500/20 focus:border-amber-400',
                shadow: 'shadow-[0_0_15px_rgba(245,158,11,0.15)]',
                text: 'text-amber-400',
                bg: 'bg-amber-500/5',
                accent: 'bg-amber-500',
                accentHover: 'hover:bg-amber-600',
                accentBorder: 'border-amber-500/50',
                ring: 'ring-amber-500/20',
                glow: 'rgba(245,158,11,0.3)',
                label: 'Administración'
            };
        case 'contabilidad':
            return {
                hex: '#ef4444',
                border: 'border-red-500/20 focus:border-red-400',
                shadow: 'shadow-[0_0_15px_rgba(239,68,68,0.15)]',
                text: 'text-red-400',
                bg: 'bg-red-500/5',
                accent: 'bg-red-500',
                accentHover: 'hover:bg-red-600',
                accentBorder: 'border-red-500/50',
                ring: 'ring-red-500/20',
                glow: 'rgba(239,68,68,0.3)',
                label: 'Contable y Legales'
            };
        case 'marketing':
            return {
                hex: '#10b981',
                border: 'border-emerald-500/20 focus:border-emerald-400',
                shadow: 'shadow-[0_0_15px_rgba(16,185,129,0.15)]',
                text: 'text-emerald-400',
                bg: 'bg-emerald-500/5',
                accent: 'bg-emerald-500',
                accentHover: 'hover:bg-emerald-600',
                accentBorder: 'border-emerald-500/50',
                ring: 'ring-emerald-500/20',
                glow: 'rgba(16,185,129,0.3)',
                label: 'Marketing y Expansión'
            };
        case 'recursos-humanos':
            return {
                hex: '#06b6d4',
                border: 'border-cyan-500/20 focus:border-cyan-400',
                shadow: 'shadow-[0_0_15px_rgba(6,180,212,0.15)]',
                text: 'text-cyan-400',
                bg: 'bg-cyan-500/5',
                accent: 'bg-cyan-500',
                accentHover: 'hover:bg-cyan-600',
                accentBorder: 'border-cyan-500/50',
                ring: 'ring-cyan-500/20',
                glow: 'rgba(6,180,212,0.3)',
                label: 'Recursos Humanos'
            };
        case 'sistemas':
            return {
                hex: '#6366f1',
                border: 'border-indigo-500/20 focus:border-indigo-400',
                shadow: 'shadow-[0_0_15px_rgba(99,102,241,0.15)]',
                text: 'text-indigo-400',
                bg: 'bg-indigo-500/5',
                accent: 'bg-indigo-500',
                accentHover: 'hover:bg-indigo-600',
                accentBorder: 'border-indigo-500/50',
                ring: 'ring-indigo-500/20',
                glow: 'rgba(99,102,241,0.3)',
                label: 'Sistemas e Infraestructura'
            };
        case 'planificacion-desarrollo':
            return {
                hex: '#3b82f6',
                border: 'border-blue-500/20 focus:border-blue-400',
                shadow: 'shadow-[0_0_15px_rgba(59,130,246,0.15)]',
                text: 'text-blue-400',
                bg: 'bg-blue-500/5',
                accent: 'bg-blue-500',
                accentHover: 'hover:bg-blue-600',
                accentBorder: 'border-blue-500/50',
                ring: 'ring-blue-500/20',
                glow: 'rgba(59,130,246,0.3)',
                label: 'Planificación y Desarrollo'
            };
        case 'inversion-exponencial':
            return {
                hex: '#eab308',
                border: 'border-yellow-500/20 focus:border-yellow-400',
                shadow: 'shadow-[0_0_15px_rgba(234,179,8,0.15)]',
                text: 'text-yellow-400',
                bg: 'bg-yellow-500/5',
                accent: 'bg-yellow-500',
                accentHover: 'hover:bg-yellow-600',
                accentBorder: 'border-yellow-500/50',
                ring: 'ring-yellow-500/20',
                glow: 'rgba(234,179,8,0.3)',
                label: 'Inversión Exponencial'
            };
        case 'mantenimiento':
            return {
                hex: '#64748b',
                border: 'border-slate-500/20 focus:border-slate-400',
                shadow: 'shadow-[0_0_15px_rgba(100,116,139,0.15)]',
                text: 'text-slate-400',
                bg: 'bg-slate-500/5',
                accent: 'bg-slate-500',
                accentHover: 'hover:bg-slate-600',
                accentBorder: 'border-slate-500/50',
                ring: 'ring-slate-500/20',
                glow: 'rgba(100,116,139,0.3)',
                label: 'Mantenimiento General'
            };
        case 'secops':
            return {
                hex: '#10b981',
                border: 'border-emerald-500/20 focus:border-emerald-400',
                shadow: 'shadow-[0_0_15px_rgba(16,185,129,0.15)]',
                text: 'text-emerald-400',
                bg: 'bg-emerald-500/5',
                accent: 'bg-emerald-500',
                accentHover: 'hover:bg-emerald-600',
                accentBorder: 'border-emerald-500/50',
                ring: 'ring-emerald-500/20',
                glow: 'rgba(16,185,129,0.3)',
                label: 'Ciberseguridad y SecOps'
            };
        case 'sinfonia-transmision':
            return {
                hex: '#10b981',
                border: 'border-emerald-500/20 focus:border-emerald-400',
                shadow: 'shadow-[0_0_15px_rgba(16,185,129,0.15)]',
                text: 'text-emerald-400',
                bg: 'bg-emerald-500/5',
                accent: 'bg-emerald-500',
                accentHover: 'hover:bg-emerald-600',
                accentBorder: 'border-emerald-500/50',
                ring: 'ring-emerald-500/20',
                glow: 'rgba(16,185,129,0.3)',
                label: 'Sinfonía de Transmisión'
            };
        default:
            return {
                hex: '#a855f7',
                border: 'border-purple-500/20 focus:border-purple-400',
                shadow: 'shadow-[0_0_15px_rgba(168,85,247,0.15)]',
                text: 'text-purple-400',
                bg: 'bg-purple-500/5',
                accent: 'bg-purple-500',
                accentHover: 'hover:bg-purple-600',
                accentBorder: 'border-purple-500/50',
                ring: 'ring-purple-500/20',
                glow: 'rgba(168,85,247,0.3)',
                label: 'Búnker Operativo'
            };
    }
};

const playDirectiveAlertSound = () => {
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        
        // Primer Beep
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(1000, ctx.currentTime);
        gain1.gain.setValueAtTime(0.06, ctx.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.12);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start();
        osc1.stop(ctx.currentTime + 0.12);
        
        // Segundo Beep (120ms después, tono más agudo)
        setTimeout(() => {
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(1300, ctx.currentTime);
            gain2.gain.setValueAtTime(0.06, ctx.currentTime);
            gain2.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.12);
            osc2.connect(gain2);
            gain2.connect(ctx.destination);
            osc2.start();
            osc2.stop(ctx.currentTime + 0.12);
        }, 120);
    } catch (e) {
        console.error("Audio beep error", e);
    }
};

export const DirectiveNotifier: React.FC<DirectiveNotifierProps> = ({ bunkerId, townId, onDirectivesUpdate }) => {
    const colors = getBunkerColors(bunkerId);
    const [directives, setDirectives] = useState<BunkerDirective[]>([]);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [replyText, setReplyText] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState<Record<string, boolean>>({});
    const [soundEnabled, setSoundEnabled] = useState(true);
    
    // Guardar referencia para evitar pings repetidos al cargar por primera vez
    const prevDirectivesCount = useRef<number>(-1);

    useEffect(() => {
        const unsubscribe = suscribirseADirectivasBunker(bunkerId, (newDirectives) => {
            setDirectives(newDirectives);
            
            // Detectar si hay nuevas directivas añadidas para disparar alerta auditiva y visual
            if (prevDirectivesCount.current !== -1 && newDirectives.length > prevDirectivesCount.current) {
                const newest = newDirectives[0]; // La primera de la lista ordenada por fecha
                const hasMyReply = newest?.respuestas?.some(r => r.bunkerId === bunkerId);
                
                if (soundEnabled && !hasMyReply) {
                    playDirectiveAlertSound();
                }
                
                // Auto-expandir la nueva directiva
                if (newest?.id) {
                    setExpandedId(newest.id);
                }
            }
            prevDirectivesCount.current = newDirectives.length;

            // Inyectar en vivo a ARI
            if (onDirectivesUpdate) {
                if (newDirectives.length === 0) {
                    onDirectivesUpdate("");
                } else {
                    const textSummary = newDirectives.map((d, i) => {
                        const hasConfirmed = d.respuestas?.some(r => r.bunkerId === bunkerId && r.confirmed);
                        return `Directiva ${i+1}: "${d.title}" (Prioridad: ${d.priority.toUpperCase()}) | Tipo: ${d.type.toUpperCase()} | Estado en este Búnker: ${hasConfirmed ? "CONFIRMADO/ATENDIDO" : "PENDIENTE DE CONFIRMACIÓN"}. Contenido: "${d.content}"`;
                    }).join('\n');
                    onDirectivesUpdate(`\n[SNC - DIRECTIVAS DEL DIRECTOR WALY VIGENTES]:\n${textSummary}\n`);
                }
            }
        });

        return () => unsubscribe();
    }, [bunkerId, onDirectivesUpdate, soundEnabled]);

    const handleConfirmAndReply = async (directiveId: string, confirmed: boolean) => {
        const text = replyText[directiveId]?.trim() || (confirmed ? "Misión recibida y en proceso." : "Mensaje recibido.");
        setIsSubmitting(prev => ({ ...prev, [directiveId]: true }));
        
        try {
            const reply: BunkerReply = {
                bunkerId,
                responder: colors.label,
                text,
                fechaRespuesta: new Date().toISOString(),
                confirmed
            };
            
            await responderDirectivaBunker(directiveId, reply);
            setReplyText(prev => ({ ...prev, [directiveId]: "" }));
            // Cerrar el acordeón al confirmar con éxito
            setExpandedId(null);
        } catch (e) {
            console.error(e);
            alert("Error al enviar la respuesta.");
        } finally {
            setIsSubmitting(prev => ({ ...prev, [directiveId]: false }));
        }
    };

    if (directives.length === 0) return null;

    const unconfirmedCount = directives.filter(d => 
        !d.respuestas?.some(r => r.bunkerId === bunkerId && r.confirmed)
    ).length;

    return (
        <div className="w-full max-w-4xl mx-auto mt-6 bg-black/40 border border-white/10 rounded-[2rem] p-6 backdrop-blur-md relative overflow-hidden shadow-[0_10px_35px_rgba(0,0,0,0.5)]">
            {/* Brillo neon temático */}
            <div 
                className="absolute -top-10 -left-10 w-24 h-24 rounded-full blur-[40px] opacity-20 pointer-events-none" 
                style={{ backgroundColor: colors.hex }}
            />
            
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Radio size={20} className={unconfirmedCount > 0 ? "animate-pulse" : ""} style={{ color: colors.hex }} />
                        {unconfirmedCount > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 bg-red-500 rounded-full flex items-center justify-center border-2 border-black animate-bounce">
                                <span className="text-[7.5px] font-black text-white">{unconfirmedCount}</span>
                            </span>
                        )}
                    </div>
                    <div>
                        <h3 className="text-xs font-[1000] uppercase tracking-[0.25em] text-white flex items-center gap-2">
                            Sistema Nervioso Central <span className="text-[7px] px-2 py-0.5 rounded border border-white/10 bg-white/5 font-black uppercase text-white/50 tracking-widest">SNC v1.0</span>
                        </h3>
                        <p className="text-[8px] text-white/40 tracking-[0.3em] font-bold uppercase mt-1">Canal de Directivas y Misiones del Director</p>
                    </div>
                </div>

                <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/10 text-white/40 hover:text-white"
                    title={soundEnabled ? "Silenciar alarmas" : "Activar alarmas"}
                >
                    {soundEnabled ? <Bell size={13} className="text-emerald-400" /> : <BellOff size={13} />}
                </button>
            </div>

            <div className="space-y-3">
                {directives.map((dir) => {
                    const myReply = dir.respuestas?.find(r => r.bunkerId === bunkerId);
                    const isConfirmed = myReply?.confirmed || false;
                    const isExpanded = expandedId === dir.id;
                    
                    let priorityBadge = "text-white/40 border-white/10 bg-white/5";
                    if (dir.priority === 'alta') {
                        priorityBadge = "text-red-400 border-red-500/20 bg-red-500/5 shadow-[0_0_10px_rgba(239,68,68,0.15)] animate-pulse";
                    } else if (dir.priority === 'media') {
                        priorityBadge = "text-amber-400 border-amber-500/20 bg-amber-500/5";
                    } else if (dir.priority === 'baja') {
                        priorityBadge = "text-blue-400 border-blue-500/20 bg-blue-500/5";
                    }

                    return (
                        <div 
                            key={dir.id}
                            className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
                                isExpanded 
                                    ? 'bg-black/60 border-white/15 shadow-[inset_0_0_15px_rgba(255,255,255,0.02)]' 
                                    : !isConfirmed 
                                        ? 'bg-[#050A15]/10 hover:bg-[#050A15]/20 border-red-500/25 hover:border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.03)]'
                                        : 'bg-white/[0.01] hover:bg-white/[0.03] border-white/5 hover:border-white/10'
                            }`}
                        >
                            {/* Card Header Clickable */}
                            <div 
                                onClick={() => setExpandedId(isExpanded ? null : dir.id!)}
                                className="p-4 flex items-center justify-between gap-4 cursor-pointer select-none"
                            >
                                <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-2.5">
                                    <div className="flex items-center gap-2.5">
                                        {/* Baliza visual parpadeante si no está confirmado y es prioridad alta */}
                                        {!isConfirmed && dir.priority === 'alta' && (
                                            <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping shrink-0" />
                                        )}
                                        <span className="text-[11.5px] font-bold text-white tracking-wide uppercase">{dir.title}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[7.5px] font-black uppercase px-2 py-0.5 rounded border tracking-widest ${priorityBadge}`}>
                                            {dir.priority}
                                        </span>
                                        <span className={`text-[7.5px] font-black uppercase px-2 py-0.5 rounded border tracking-widest ${
                                            isConfirmed 
                                                ? 'text-emerald-400 border-emerald-500/25 bg-emerald-500/5' 
                                                : 'text-red-400 border-red-500/25 bg-red-500/5 animate-pulse'
                                        }`}>
                                            {isConfirmed ? 'Confirmado' : 'Pendiente'}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-white/30 hover:text-white shrink-0">
                                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                </div>
                            </div>

                            {/* Expandable Body */}
                            {isExpanded && (
                                <div className="p-4 border-t border-white/5 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
                                    <div className="space-y-1">
                                        <span className="text-[8px] font-black uppercase tracking-[0.25em] text-white/30 block">Orden Directiva del Mando:</span>
                                        <p className="text-[12px] text-white/80 leading-relaxed font-bold tracking-wide break-words">{dir.content}</p>
                                    </div>

                                    {/* Explicación de respuestas pasadas del búnker */}
                                    {dir.respuestas && dir.respuestas.filter(r => r.bunkerId === bunkerId).length > 0 && (
                                        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5 space-y-2">
                                            <span className="text-[8px] font-black uppercase tracking-widest text-emerald-400 block">Reporte Enviado al Director:</span>
                                            {dir.respuestas.filter(r => r.bunkerId === bunkerId).map((rep, idx) => (
                                                <div key={idx} className="space-y-1">
                                                    <p className="text-[11px] text-white/70 italic break-words">"{rep.text}"</p>
                                                    <span className="text-[7.5px] text-white/30 block tracking-widest font-mono">
                                                        Respondido el: {new Date(rep.fechaRespuesta).toLocaleString('es-AR')}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Formulario de Respuesta / Confirmación */}
                                    <div className="space-y-3 pt-2 border-t border-white/5">
                                        <span className="text-[8px] font-black uppercase tracking-[0.25em] text-white/30 block">Responder al Director General:</span>
                                        <textarea
                                            value={replyText[dir.id!] || ""}
                                            onChange={e => setReplyText(prev => ({ ...prev, [dir.id!]: e.target.value }))}
                                            placeholder={isConfirmed ? "Escriba una actualización o explicación adicional..." : "Escriba el reporte de cumplimiento o confirmación..."}
                                            className="w-full bg-black/60 border border-white/10 rounded-xl p-3 text-[11px] text-white placeholder:text-white/20 outline-none focus:border-white/20 focus:shadow-[inset_0_0_10px_rgba(255,255,255,0.02)] min-h-[70px] resize-none"
                                        />
                                        <div className="flex flex-col sm:flex-row gap-2 justify-end">
                                            <button
                                                onClick={() => handleConfirmAndReply(dir.id!, false)}
                                                disabled={isSubmitting[dir.id!] || !replyText[dir.id!]?.trim()}
                                                className="px-4 py-2.5 bg-white/5 border border-white/10 hover:border-white/20 rounded-xl text-white/75 hover:text-white text-[9.5px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-30 flex items-center justify-center gap-1.5"
                                            >
                                                <Send size={11} /> Enviar Mensaje
                                            </button>
                                            <button
                                                onClick={() => handleConfirmAndReply(dir.id!, true)}
                                                disabled={isSubmitting[dir.id!]}
                                                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 rounded-xl text-black text-[9.5px] font-[1000] uppercase tracking-[0.2em] transition-all active:translate-y-[2px] disabled:opacity-30 flex items-center justify-center gap-1.5 shadow-[0_4px_10px_rgba(16,185,129,0.15)]"
                                            >
                                                <CheckCircle2 size={12} />
                                                {isConfirmed ? 'Actualizar Confirmación' : 'Confirmar Misión'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
