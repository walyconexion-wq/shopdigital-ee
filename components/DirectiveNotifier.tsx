import React, { useState, useEffect, useRef } from 'react';
import { 
    Radio, AlertTriangle, ShieldCheck, Clock, Send, CheckCircle2, 
    ChevronDown, ChevronUp, Bell, BellOff, User, Mail, Plus, Check,
    Anchor, TrendingUp, Activity, Zap, Target, Shield, Database, Users, LayoutGrid, BookOpen, Cpu
} from 'lucide-react';
import { db, suscribirseADirectivasBunker, responderDirectivaBunker, enviarDirectivaBunker } from '../firebase';
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

const BUNKER_DESTINATIONS = [
    { id: 'director', label: 'Dirección General' },
    { id: 'administracion', label: 'Administración' },
    { id: 'contabilidad', label: 'Contable y Legales' },
    { id: 'marketing', label: 'Marketing y Expansión' },
    { id: 'recursos-humanos', label: 'Recursos Humanos' },
    { id: 'sistemas', label: 'Sistemas e Infraestructura' },
    { id: 'planificacion-desarrollo', label: 'Planificación y Desarrollo' },
    { id: 'inversion-exponencial', label: 'Inversión Exponencial' },
    { id: 'mantenimiento', label: 'Mantenimiento General' },
    { id: 'secops', label: 'Ciberseguridad y SecOps' },
    { id: 'sinfonia-transmision', label: 'Sinfonía de Transmisión' }
];

const MATRIZ_ACCESO = [
    {
        name: 'Dirección General (Waly)',
        color: '#8b5cf6',
        icon: Anchor,
        notebook: 'https://notebooklm.google.com/notebook/0a83b1d9-e35e-4473-8033-648f89f81339',
        agent: 'https://gemini.google.com/app/70ea5a1cc7718225'
    },
    {
        name: 'Marketing y Expansión',
        color: '#10b981',
        icon: TrendingUp,
        notebook: 'https://notebooklm.google.com/notebook/cb9442de-e444-4ca0-98a4-914ca6e3980a',
        agent: 'https://gemini.google.com/app/23701fdc9c2e35d5'
    },
    {
        name: 'Transmisiones y Eventos',
        color: '#10b981',
        icon: Radio,
        notebook: 'https://notebooklm.google.com/notebook/82a1b7bf-3899-49f5-8b4c-3d082fcad671',
        agent: 'https://gemini.google.com/app/039e3724bd5f1b99'
    },
    {
        name: 'Mantenimiento General',
        color: '#64748b',
        icon: Activity,
        notebook: 'https://notebooklm.google.com/notebook/9a90488c-7519-441c-b845-d7b1c3bd5321',
        agent: 'https://gemini.google.com/app/da2400cab1da285b'
    },
    {
        name: 'Inversión Exponencial',
        color: '#eab308',
        icon: Zap,
        notebook: 'https://notebooklm.google.com/notebook/71668861-44e3-40fe-8cde-74cf99b11623',
        agent: 'https://gemini.google.com/app/7c5f4735c91da2a4'
    },
    {
        name: 'Planificación y Desarrollo',
        color: '#3b82f6',
        icon: Target,
        notebook: 'https://notebooklm.google.com/notebook/88340a8c-838a-4835-99d9-6b77e911307b',
        agent: 'https://gemini.google.com/app/0ca3b8338a07652e'
    },
    {
        name: 'Ciberseguridad y SecOps',
        color: '#10b981',
        icon: Shield,
        notebook: 'https://notebooklm.google.com/notebook/e0e4f151-7847-4631-8769-282ead74c670',
        agent: 'https://gemini.google.com/app/5766939f30ed677a'
    },
    {
        name: 'Desarrollo de Sistemas',
        color: '#6366f1',
        icon: Database,
        notebook: 'https://notebooklm.google.com/notebook/ef87d269-4daf-4a2c-a658-5992c9150042',
        agent: 'https://gemini.google.com/app/14da8a42a05399d0'
    },
    {
        name: 'Recursos Humanos',
        color: '#06b6d4',
        icon: Users,
        notebook: 'https://notebooklm.google.com/notebook/d302846c-db1d-4c88-9f1d-b6e07a456d29',
        agent: 'https://gemini.google.com/app/c4dab0c7f917c036'
    },
    {
        name: 'Contable y Legales',
        color: '#ef4444',
        icon: Activity,
        notebook: 'https://notebooklm.google.com/notebook/509fde7f-4b31-4beb-abab-420a30a0973e',
        agent: 'https://gemini.google.com/app/3089ba20d1274aed'
    },
    {
        name: 'Administración y Gestión',
        color: '#f59e0b',
        icon: LayoutGrid,
        notebook: 'https://notebooklm.google.com/notebook/7fa97dfa-6643-4dc9-8690-6c02e8338280',
        agent: 'https://gemini.google.com/notebook/7fa97dfa-6643-4dc9-8690-6c02e8338280'
    }
];

export const DirectiveNotifier: React.FC<DirectiveNotifierProps> = ({ bunkerId, townId, onDirectivesUpdate }) => {
    const colors = getBunkerColors(bunkerId);
    const [directives, setDirectives] = useState<BunkerDirective[]>([]);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [replyText, setReplyText] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState<Record<string, boolean>>({});
    const [soundEnabled, setSoundEnabled] = useState(true);
    
    // States for composing a new message/directive
    const [formTitle, setFormTitle] = useState('');
    const [formContent, setFormContent] = useState('');
    const [formPriority, setFormPriority] = useState<'alta' | 'media' | 'baja'>('media');
    const [formType, setFormType] = useState<'mision' | 'alerta' | 'notificacion' | 'directiva'>('notificacion');
    const [formTargets, setFormTargets] = useState<string[]>([]);
    const [customSender, setCustomSender] = useState('');
    const [isSending, setIsSending] = useState(false);

    // Guardar referencia para evitar pings repetidos al cargar por primera vez
    const prevDirectivesCount = useRef<number>(-1);

    useEffect(() => {
        const unsubscribe = suscribirseADirectivasBunker(bunkerId, (newDirectives) => {
            setDirectives(newDirectives);
            
            // Detectar si hay nuevas directivas añadidas para disparar alerta auditiva y visual
            if (prevDirectivesCount.current !== -1 && newDirectives.length > prevDirectivesCount.current) {
                const newest = newDirectives[0]; // La primera de la lista ordenada por fecha
                const hasMyReply = newest?.respuestas?.some(r => r.bunkerId === bunkerId);
                
                if (soundEnabled && !hasMyReply && newest?.sender !== bunkerId) {
                    playDirectiveAlertSound();
                }
                
                // Auto-expandir la nueva directiva
                if (newest?.id && newest?.sender !== bunkerId) {
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
                        return `Mensaje/Directiva ${i+1} de ${d.senderName || d.sender}: "${d.title}" (Prioridad: ${(d.priority || 'media').toUpperCase()}) | Tipo: ${(d.type || 'notificacion').toUpperCase()} | Estado en este Búnker: ${hasConfirmed ? "CONFIRMADO/ATENDIDO" : "PENDIENTE DE CONFIRMACIÓN"}. Contenido: "${d.content}"`;
                    }).join('\n');
                    onDirectivesUpdate(`\n[DESPACHO DE MENSAJES VIGENTES - COMUNICACIÓN INTERNA BÚNKER]:\n${textSummary}\n`);
                }
            }
        });

        return () => unsubscribe();
    }, [bunkerId, onDirectivesUpdate, soundEnabled]);

    const handleConfirmAndReply = async (directiveId: string, confirmed: boolean) => {
        const text = replyText[directiveId]?.trim() || (confirmed ? "Confirmado y procesado." : "Mensaje recibido.");
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

    const handleSendBunkerMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formTitle.trim() || !formContent.trim() || formTargets.length === 0 || isSending) {
            alert("Por favor complete el título, contenido y seleccione al menos un destinatario.");
            return;
        }
        setIsSending(true);

        try {
            const finalSenderName = customSender.trim() 
                ? `${colors.label} (${customSender.trim()})`
                : colors.label;

            const directive: Omit<BunkerDirective, 'id' | 'fechaCreacion' | 'estado'> = {
                title: formTitle.trim(),
                content: formContent.trim(),
                priority: formPriority,
                type: formType,
                targetBunkers: formTargets,
                sender: bunkerId,
                senderName: finalSenderName,
                respuestas: []
            };

            await enviarDirectivaBunker(directive);
            
            // Reset state
            setFormTitle('');
            setFormContent('');
            setFormTargets([]);
            setCustomSender('');
            alert('¡Mensaje despachado con éxito a la red interna!');
        } catch (error) {
            console.error("Error al despachar el mensaje", error);
            alert("Error al despachar el mensaje.");
        } finally {
            setIsSending(false);
        }
    };

    const handleSelectAllTargets = () => {
        const allTargetIds = BUNKER_DESTINATIONS.filter(b => b.id !== bunkerId).map(b => b.id);
        if (formTargets.length === allTargetIds.length) {
            setFormTargets([]);
        } else {
            setFormTargets(allTargetIds);
        }
    };

    const handleToggleTarget = (id: string) => {
        if (formTargets.includes(id)) {
            setFormTargets(prev => prev.filter(t => t !== id));
        } else {
            setFormTargets(prev => [...prev, id]);
        }
    };

    const unconfirmedCount = directives.filter(d => 
        d.sender !== bunkerId && !d.respuestas?.some(r => r.bunkerId === bunkerId && r.confirmed)
    ).length;

    return (
        <div className="w-full max-w-[1600px] mx-auto px-4 md:px-6 mt-6">
            <div className="w-full bg-black/40 border border-white/10 rounded-[2rem] p-6 backdrop-blur-md relative overflow-hidden shadow-[0_10px_35px_rgba(0,0,0,0.5)]">
            {/* Brillo neon temático */}
            <div 
                className="absolute -top-10 -left-10 w-24 h-24 rounded-full blur-[40px] opacity-20 pointer-events-none" 
                style={{ backgroundColor: colors.hex }}
            />
            
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
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
                            Intercomunicador de Frecuencia <span className="text-[7px] px-2 py-0.5 rounded border border-white/10 bg-white/5 font-black uppercase text-white/50 tracking-widest">SNC v2.0</span>
                        </h3>
                        <p className="text-[8px] text-white/40 tracking-[0.3em] font-bold uppercase mt-1">SISTEMA GENÉRICO DE DESPACHO DE MENSAJES Y COMUNICACIÓN INTERNA</p>
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

            {/* RACK DE ACCESO RÁPIDO (MATRIZ DE CONOCIMIENTO Y AGENTES) */}
            <div className="w-full bg-[#050A15]/40 border border-white/5 rounded-2xl p-6 backdrop-blur-md flex flex-col gap-4 shadow-inner mb-6 relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <div className="flex items-center gap-2">
                        <Cpu size={16} className="text-emerald-400" />
                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-white">
                            Rack de Acceso Rápido: Matriz de Conocimiento y Agentes
                        </h4>
                    </div>
                    <span className="text-[8px] px-2 py-0.5 rounded border border-white/10 bg-white/5 font-black uppercase text-white/45 tracking-widest">
                        11 Puntos de Conexión
                    </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                    {MATRIZ_ACCESO.map((item, idx) => {
                        const IconComp = item.icon;
                        return (
                            <div 
                                key={idx} 
                                className="bg-black/50 border border-white/5 hover:border-white/15 rounded-xl p-4 flex flex-col gap-3.5 transition-all group relative overflow-hidden"
                            >
                                {/* Indicador Neon Lateral */}
                                <div 
                                    className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl transition-all duration-300"
                                    style={{ backgroundColor: item.color }}
                                />
                                
                                <div className="flex items-center gap-3">
                                    <div 
                                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all group-hover:scale-105 animate-pulse"
                                        style={{ backgroundColor: `${item.color}15`, color: item.color }}
                                    >
                                        <IconComp size={16} />
                                    </div>
                                    <span className="text-[11px] font-black text-white uppercase tracking-wider truncate">
                                        {item.name}
                                    </span>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-2 text-[9px] font-black uppercase tracking-wider">
                                    <a 
                                        href={item.notebook} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="py-2 px-2.5 rounded-lg border border-white/5 hover:border-white/20 bg-white/[0.01] hover:bg-white/[0.04] text-white/60 hover:text-white transition-all text-center flex items-center justify-center gap-1.5 active:scale-95"
                                    >
                                        <BookOpen size={10} className="shrink-0" /> Cuaderno
                                    </a>
                                    <a 
                                        href={item.agent} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="py-2 px-2.5 rounded-lg text-black transition-all text-center flex items-center justify-center gap-1.5 active:scale-95 hover:opacity-90 shadow-sm"
                                        style={{ backgroundColor: item.color }}
                                    >
                                        <MessageSquare size={10} className="shrink-0" /> Agente
                                    </a>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Split layout: Left column = Dispatch Message Form, Right column = Messages Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* LEFT COLUMN: DESPACHO DE MENSAJES */}
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-4 shadow-inner">
                    <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                        <Mail size={14} className="text-white/60" style={{ color: colors.hex }} />
                        <h4 className="text-[11px] font-black uppercase tracking-wider text-white">
                            Despacho de Mensajes (Remitente: {colors.label})
                        </h4>
                    </div>

                    <form onSubmit={handleSendBunkerMessage} className="space-y-4">
                        {/* Custom Sign-off/Sender */}
                        <div className="space-y-1">
                            <label className="text-[8px] font-black uppercase tracking-widest text-white/45 block">Firma / Operador (Remitente Opcional):</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-white/30 pointer-events-none">
                                    <User size={12} />
                                </span>
                                <input
                                    type="text"
                                    value={customSender}
                                    onChange={e => setCustomSender(e.target.value)}
                                    placeholder="Ej: Ing. Martínez, Guardia de Turno..."
                                    className="w-full bg-black/60 border border-white/10 rounded-xl py-2.5 pl-9 pr-3 text-[11px] text-white placeholder:text-white/20 outline-none focus:border-white/20 focus:shadow-[inset_0_0_10px_rgba(255,255,255,0.02)]"
                                />
                            </div>
                        </div>

                        {/* Message Subject */}
                        <div className="space-y-1">
                            <label className="text-[8px] font-black uppercase tracking-widest text-white/45 block">Asunto / Título de la Orden:</label>
                            <input
                                type="text"
                                required
                                value={formTitle}
                                onChange={e => setFormTitle(e.target.value)}
                                placeholder="Ej: Reporte de Enlace, Solicitud de Soporte, Alerta General..."
                                className="w-full bg-black/60 border border-white/10 rounded-xl py-2.5 px-3 text-[11px] text-white placeholder:text-white/20 outline-none focus:border-white/20 focus:shadow-[inset_0_0_10px_rgba(255,255,255,0.02)]"
                            />
                        </div>

                        {/* Priority & Type */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-[8px] font-black uppercase tracking-widest text-white/45 block">Prioridad:</label>
                                <select
                                    value={formPriority}
                                    onChange={e => setFormPriority(e.target.value as any)}
                                    className="w-full bg-black/60 border border-white/10 rounded-xl py-2.5 px-2 text-[11px] text-white outline-none focus:border-white/20"
                                >
                                    <option value="baja">Baja</option>
                                    <option value="media">Media</option>
                                    <option value="alta">Alta 🚨</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[8px] font-black uppercase tracking-widest text-white/45 block">Tipo:</label>
                                <select
                                    value={formType}
                                    onChange={e => setFormType(e.target.value as any)}
                                    className="w-full bg-black/60 border border-white/10 rounded-xl py-2.5 px-2 text-[11px] text-white outline-none focus:border-white/20"
                                >
                                    <option value="notificacion">Notificación</option>
                                    <option value="alerta">Alerta</option>
                                    <option value="mision">Misión / Orden</option>
                                    <option value="directiva">Directiva</option>
                                </select>
                            </div>
                        </div>

                        {/* Body / Content */}
                        <div className="space-y-1">
                            <label className="text-[8px] font-black uppercase tracking-widest text-white/45 block">Mensaje / Contenido:</label>
                            <textarea
                                required
                                value={formContent}
                                onChange={e => setFormContent(e.target.value)}
                                placeholder="Escriba las instrucciones, reporte o mensaje aquí..."
                                className="w-full bg-black/60 border border-white/10 rounded-xl p-3 text-[11px] text-white placeholder:text-white/20 outline-none focus:border-white/20 focus:shadow-[inset_0_0_10px_rgba(255,255,255,0.02)] min-h-[80px] resize-none"
                            />
                        </div>

                        {/* Targets Selection */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-[8px] font-black uppercase tracking-widest text-white/45 block">Búnkeres Destinatarios:</label>
                                <button
                                    type="button"
                                    onClick={handleSelectAllTargets}
                                    className="text-[7.5px] font-black uppercase tracking-widest text-white/60 hover:text-white underline cursor-pointer"
                                >
                                    {formTargets.length === BUNKER_DESTINATIONS.filter(b => b.id !== bunkerId).length ? 'Deseleccionar Todos' : 'Seleccionar Todos'}
                                </button>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-[140px] overflow-y-auto p-1 border border-white/5 rounded-xl bg-black/30">
                                {BUNKER_DESTINATIONS.filter(b => b.id !== bunkerId).map((dest) => {
                                    const isSelected = formTargets.includes(dest.id);
                                    return (
                                        <button
                                            type="button"
                                            key={dest.id}
                                            onClick={() => handleToggleTarget(dest.id)}
                                            className={`px-2 py-1.5 rounded-lg border text-[8.5px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 text-left ${
                                                isSelected 
                                                    ? 'bg-white/10 border-white/20 text-white shadow-sm'
                                                    : 'bg-transparent border-white/5 text-white/45 hover:border-white/10 hover:text-white/60'
                                            }`}
                                        >
                                            <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
                                                isSelected ? 'border-white/40 bg-white/10' : 'border-white/10'
                                            }`}>
                                                {isSelected && <Check size={8} className="text-white" />}
                                            </div>
                                            <span className="truncate">{dest.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSending || !formTitle.trim() || !formContent.trim() || formTargets.length === 0}
                            className="w-full py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 rounded-xl text-black text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-98 disabled:opacity-30 flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(20,184,166,0.15)]"
                        >
                            <Send size={12} />
                            {isSending ? 'Transmitiendo Frecuencia...' : 'Transmitir a Búnkeres'}
                        </button>
                    </form>
                </div>

                {/* RIGHT COLUMN: LIST/FEED OF RECEIVED MESSAGES */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                        <div className="flex items-center gap-2">
                            <Radio size={14} className="text-white/60" />
                            <h4 className="text-[11px] font-black uppercase tracking-wider text-white">
                                Historial y Recepción de Frecuencias
                            </h4>
                        </div>
                        <span className="text-[8.5px] px-2 py-0.5 bg-white/5 border border-white/10 rounded-full font-mono text-white/50">
                            {directives.length} Mensajes
                        </span>
                    </div>

                    {directives.length === 0 ? (
                        <div className="h-[350px] border border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center p-6 text-center text-white/20">
                            <Radio size={32} className="opacity-10 mb-3 animate-pulse" />
                            <p className="text-[9px] font-black uppercase tracking-widest">No hay transmisiones activas en esta sintonía</p>
                            <p className="text-[8px] uppercase tracking-wider mt-1 opacity-50">Use el panel izquierdo para originar una señal interna</p>
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
                            {directives.map((dir) => {
                                const isMyOwnMessage = dir.sender === bunkerId;
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
                                                : isMyOwnMessage 
                                                    ? 'bg-white/[0.02] border-white/5 opacity-80'
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
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2">
                                                        {!isConfirmed && !isMyOwnMessage && dir.priority === 'alta' && (
                                                            <div className="w-2 h-2 rounded-full bg-red-500 animate-ping shrink-0" />
                                                        )}
                                                        <span className="text-[11px] font-bold text-white tracking-wide uppercase">{dir.title}</span>
                                                    </div>
                                                    <span className="text-[8.5px] text-white/50 tracking-wider">
                                                        {isMyOwnMessage ? (
                                                            <span className="text-teal-400 font-black">SALIENTE 📤</span>
                                                        ) : (
                                                            <span>REMITENTE: <strong className="text-white/80">{dir.senderName || dir.sender}</strong></span>
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[7px] font-black uppercase px-2 py-0.5 rounded border tracking-widest ${priorityBadge}`}>
                                                        {dir.priority}
                                                    </span>
                                                    {isMyOwnMessage ? (
                                                        <span className="text-[7px] font-black uppercase px-2 py-0.5 rounded border border-white/10 bg-white/5 text-white/40">
                                                            {dir.respuestas?.length || 0} confirmaciones
                                                        </span>
                                                    ) : (
                                                        <span className={`text-[7px] font-black uppercase px-2 py-0.5 rounded border tracking-widest ${
                                                            isConfirmed 
                                                                ? 'text-emerald-400 border-emerald-500/25 bg-emerald-500/5' 
                                                                : 'text-red-400 border-red-500/25 bg-red-500/5 animate-pulse'
                                                        }`}>
                                                            {isConfirmed ? 'Confirmado' : 'Pendiente'}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-white/30 hover:text-white shrink-0">
                                                {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                                            </div>
                                        </div>

                                        {/* Expandable Body */}
                                        {isExpanded && (
                                            <div className="p-4 border-t border-white/5 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
                                                <div className="space-y-1">
                                                    <span className="text-[8px] font-black uppercase tracking-[0.25em] text-white/30 block">Contenido de la Transmisión:</span>
                                                    <p className="text-[11.5px] text-white/90 leading-relaxed font-bold tracking-wide break-words">{dir.content}</p>
                                                    <span className="text-[7.5px] text-white/20 block font-mono">
                                                        Fecha: {new Date(dir.fechaCreacion).toLocaleString('es-AR')}
                                                    </span>
                                                </div>

                                                {/* Explicación de respuestas pasadas del búnker */}
                                                {!isMyOwnMessage && dir.respuestas && dir.respuestas.filter(r => r.bunkerId === bunkerId).length > 0 && (
                                                    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5 space-y-2">
                                                        <span className="text-[8px] font-black uppercase tracking-widest text-emerald-400 block">Reporte Enviado al Remitente:</span>
                                                        {dir.respuestas.filter(r => r.bunkerId === bunkerId).map((rep, idx) => (
                                                            <div key={idx} className="space-y-1">
                                                                <p className="text-[10.5px] text-white/70 italic break-words">"{rep.text}"</p>
                                                                <span className="text-[7.5px] text-white/30 block tracking-widest font-mono">
                                                                    Respondido el: {new Date(rep.fechaRespuesta).toLocaleString('es-AR')}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Display ALL confirmations if it is my own message */}
                                                {isMyOwnMessage && dir.respuestas && dir.respuestas.length > 0 && (
                                                    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5 space-y-2">
                                                        <span className="text-[8px] font-black uppercase tracking-widest text-teal-400 block">Acuse de Recibo / Confirmaciones ({dir.respuestas.length}):</span>
                                                        <div className="space-y-2.5 max-h-[150px] overflow-y-auto">
                                                            {dir.respuestas.map((rep, idx) => (
                                                                <div key={idx} className="text-[10px] border-b border-white/5 pb-2 last:border-0 last:pb-0">
                                                                    <div className="flex items-center justify-between">
                                                                        <strong className="text-white/80">{rep.responder}</strong>
                                                                        <span className="text-[7.5px] text-white/30 font-mono">{new Date(rep.fechaRespuesta).toLocaleString('es-AR')}</span>
                                                                    </div>
                                                                    <p className="text-white/60 italic mt-0.5">"{rep.text}"</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Formulario de Respuesta / Confirmación (Solo para mensajes recibidos, no los propios) */}
                                                {!isMyOwnMessage && (
                                                    <div className="space-y-3 pt-2 border-t border-white/5">
                                                        <span className="text-[8px] font-black uppercase tracking-[0.25em] text-white/30 block">Confirmar o Responder al Remitente:</span>
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
                                                                className="px-4 py-2 bg-white/5 border border-white/10 hover:border-white/20 rounded-xl text-white/75 hover:text-white text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-30 flex items-center justify-center gap-1.5"
                                                            >
                                                                <Send size={10} /> Enviar Mensaje
                                                            </button>
                                                            <button
                                                                onClick={() => handleConfirmAndReply(dir.id!, true)}
                                                                disabled={isSubmitting[dir.id!]}
                                                                className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 rounded-xl text-black text-[9px] font-[1000] uppercase tracking-[0.2em] transition-all active:translate-y-[2px] disabled:opacity-30 flex items-center justify-center gap-1.5 shadow-[0_4px_10px_rgba(16,185,129,0.15)]"
                                                            >
                                                                <CheckCircle2 size={11} />
                                                                {isConfirmed ? 'Actualizar Confirmación' : 'Confirmar Misión'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

            </div>
        </div>
    </div>
    );
};
