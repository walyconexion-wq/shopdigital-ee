import React, { useState } from 'react';
import { 
    Sparkles, TrendingUp, Database, ShieldCheck, Layers, 
    Zap, Compass, ArrowRight, CheckCircle2, Clock, AlertCircle,
    Cpu, Activity, Target, Users, Radio, Shield, Terminal
} from 'lucide-react';
import { playNeonClick } from '../utils/audio';

export interface MindmapNode {
    step: string;
    frente: string;
    agentName: string;
    bunker: string;
    title: string;
    status: 'produccion' | 'laboratorio' | 'forja';
    progress: number;
    pendingTasks: string;
    completedMilestone: string;
    color: string;
    neonGlow: string;
    borderColor: string;
    icon: React.ElementType;
}

const MINDMAP_NODES: MindmapNode[] = [
    {
        step: '01',
        frente: 'EXPERIENCIA DE USUARIO',
        agentName: 'ARI (SQUAD_FRONTEND)',
        bunker: 'Búnker 02: UI/UX & Neumorfismo',
        title: 'Interfaces 1, 2 y 3 (Modo Caramelo 3D)',
        status: 'laboratorio',
        progress: 85,
        completedMilestone: 'Portada Hero neumórfica, carrusel y barra de 24 rubros 3D listos.',
        pendingTasks: 'Ajuste de contraste en modo nocturno y selector de localidades táctil.',
        color: '#f43f5e', // Rosa / Coral Neón
        neonGlow: '0 0 25px rgba(244, 63, 94, 0.6)',
        borderColor: 'border-rose-500',
        icon: Sparkles
    },
    {
        step: '02',
        frente: 'MARKETING & CRECIMIENTO',
        agentName: 'MELISA (MARKETING_LEAD)',
        bunker: 'Búnker 03: Marketing & Expansión',
        title: 'Ingesta Masiva de Copys con DeepSeek',
        status: 'laboratorio',
        progress: 90,
        completedMilestone: 'Estructuración de 40 fuentes de NotebookLM para 24 rubros a $0.14 / 1M.',
        pendingTasks: 'Conexión con el bot de WhatsApp y generación automática de folletos.',
        color: '#d946ef', // Magenta Neón
        neonGlow: '0 0 25px rgba(217, 70, 239, 0.6)',
        borderColor: 'border-fuchsia-500',
        icon: TrendingUp
    },
    {
        step: '03',
        frente: 'INFRAESTRUCTURA & DATOS',
        agentName: 'BRUNO & JAVI',
        bunker: 'Búnkers 05 & 09: Backend & Health',
        title: 'Omni-Gateway Multi-Modelo & Rescate DB',
        status: 'produccion',
        progress: 96,
        completedMilestone: 'Balanceo automático DeepSeek-V3 + Qwen y scripts de sanación de datos.',
        pendingTasks: 'Indexación en tiempo real con ChromaDB para búsqueda semántica.',
        color: '#8b5cf6', // Violeta / Púrpura Neón
        neonGlow: '0 0 25px rgba(139, 92, 246, 0.6)',
        borderColor: 'border-purple-500',
        icon: Database
    },
    {
        step: '04',
        frente: 'BLINDAJE & CIBERSEGURIDAD',
        agentName: 'THOR, VORTEX & LORE',
        bunker: 'Búnkers 06 & 10: SecOps & Legal',
        title: 'Protocolo Doberman & Cero Errores TS',
        status: 'produccion',
        progress: 100,
        completedMilestone: 'Inmutabilidad de colección Towns en Firestore y compilación limpia.',
        pendingTasks: 'Monitor de intrusiones en tiempo real y logs cifrados en Obsidian.',
        color: '#06b6d4', // Cian Neón
        neonGlow: '0 0 25px rgba(6, 182, 212, 0.6)',
        borderColor: 'border-cyan-500',
        icon: ShieldCheck
    },
    {
        step: '05',
        frente: 'EXPANSIÓN REGIONAL',
        agentName: 'ELY & MAX',
        bunker: 'Búnkers 07 & 11: Clonación & RRHH',
        title: 'Clonación Fractal & Embajadores de Calle',
        status: 'laboratorio',
        progress: 88,
        completedMilestone: 'Siembra hiperrealista de Ezeiza, Traslasierra y 7 Lagos en minutos.',
        pendingTasks: 'Malla curricular de Academia ShopDigital para nuevos municipios.',
        color: '#10b981', // Verde Esmeralda Neón
        neonGlow: '0 0 25px rgba(16, 185, 129, 0.6)',
        borderColor: 'border-emerald-500',
        icon: Layers
    },
    {
        step: '06',
        frente: 'VIABILIDAD & TRANSMISIÓN',
        agentName: 'MATEO, DANTE & CUBY',
        bunker: 'Búnkers 01, 12 & 08: Finanzas & Transmisión',
        title: 'Dossier Inversores & Live Broadcast',
        status: 'forja',
        progress: 80,
        completedMilestone: 'Auditoría de 98% ahorro y redacción del Dossier Tecnológico para CTOs.',
        pendingTasks: 'Canal de WebSockets bidireccional para transmisión en vivo del Director.',
        color: '#f59e0b', // Ámbar / Dorado Neón
        neonGlow: '0 0 25px rgba(245, 158, 11, 0.6)',
        borderColor: 'border-amber-500',
        icon: Zap
    }
];

export const NeonMindmapDiagram: React.FC = () => {
    const [activeNode, setActiveNode] = useState<MindmapNode | null>(null);

    return (
        <div className="w-full my-12 p-6 md:p-10 rounded-[2.5rem] bg-[#030712]/95 border-2 border-cyan-500/40 shadow-[0_0_50px_rgba(6,182,212,0.25)] relative overflow-hidden">
            {/* ENCABEZADO DEL DIAGRAMA */}
            <div className="text-center max-w-3xl mx-auto mb-10 relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-[10px] font-[1000] uppercase tracking-widest mb-3">
                    <Compass className="w-3.5 h-3.5 animate-spin-slow" />
                    CIRCUITO DE COMANDANCIA & MAPA MENTAL INTEGRADO (SNC 2.0)
                </div>
                <h2 className="text-2xl md:text-4xl font-[1000] tracking-tight text-white uppercase">
                    MAPA MENTAL DE ORQUESTACIÓN DEL ENJAMBRE
                </h2>
                <p className="text-xs md:text-sm text-slate-400 mt-2 leading-relaxed">
                    Visualización holográfica del estado de los 6 Frentes de Combate conectados al Núcleo Central de Mando: Director Waly OMEGA y Luz 01.
                </p>
            </div>

            {/* 🌀 NÚCLEO CENTRAL HOLOGRÁFICO DE MANDO */}
            <div className="max-w-md mx-auto mb-12 relative z-10">
                <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-950/40 via-cyan-950/60 to-blue-950/40 border-2 border-cyan-400/60 shadow-[0_0_35px_rgba(6,182,212,0.4)] text-center relative overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-1 bg-cyan-400 shadow-[0_0_15px_#22d3ee]" />
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-cyan-500/20 border-2 border-cyan-300 flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(6,182,212,0.5)]">
                        <Cpu className="w-7 h-7 text-cyan-300 animate-pulse" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-400 block mb-1">
                        👑 ESTADO MAYOR SUPREMO
                    </span>
                    <h3 className="text-xl font-[1000] text-white">
                        DIRECTOR WALY & LUZ 01
                    </h3>
                    <p className="text-[11px] text-cyan-200/80 font-mono mt-1">
                        Emisión Continua de Directivas & Sincronía con Obsidian
                    </p>
                </div>
            </div>

            {/* 🌌 MATRIZ DE LOS 6 NODOS DE NEÓN PERIFÉRICOS (COMO EN LA INFOGRAFÍA) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                {MINDMAP_NODES.map((node) => {
                    const Icon = node.icon;
                    return (
                        <div
                            key={node.step}
                            onClick={() => {
                                playNeonClick();
                                setActiveNode(node);
                            }}
                            className={`group relative p-6 rounded-3xl bg-[#060c1c]/90 border-2 ${node.borderColor} transition-all duration-300 hover:scale-[1.02] cursor-pointer flex flex-col justify-between`}
                            style={{
                                boxShadow: `0 0 20px ${node.color}25`,
                            }}
                        >
                            <div>
                                {/* CABECERA: PASO Y BADGE */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div 
                                            className="w-12 h-12 rounded-2xl flex items-center justify-center font-[1000] text-lg text-white border-2 transition-transform group-hover:scale-110 shadow-lg"
                                            style={{ 
                                                backgroundColor: `${node.color}20`, 
                                                borderColor: node.color,
                                                boxShadow: `0 0 15px ${node.color}60`
                                            }}
                                        >
                                            {node.step}
                                        </div>
                                        <div>
                                            <span 
                                                className="text-[9px] font-black uppercase tracking-widest block"
                                                style={{ color: node.color }}
                                            >
                                                {node.frente}
                                            </span>
                                            <span className="text-xs font-bold text-white">
                                                {node.agentName}
                                            </span>
                                        </div>
                                    </div>
                                    <div 
                                        className="w-9 h-9 rounded-xl flex items-center justify-center border"
                                        style={{ backgroundColor: `${node.color}15`, borderColor: `${node.color}40` }}
                                    >
                                        <Icon className="w-5 h-5" style={{ color: node.color }} />
                                    </div>
                                </div>

                                {/* TÍTULO DEL PROYECTO */}
                                <h4 className="text-base font-black text-white group-hover:text-cyan-300 transition-colors mb-2 leading-snug">
                                    {node.title}
                                </h4>

                                {/* PROGRESO */}
                                <div className="mb-4">
                                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mb-1">
                                        <span>Avance del Frente</span>
                                        <span style={{ color: node.color }}>{node.progress}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full rounded-full transition-all duration-500"
                                            style={{ 
                                                width: `${node.progress}%`,
                                                backgroundColor: node.color,
                                                boxShadow: `0 0 10px ${node.color}`
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* HITOS Y TAREAS */}
                                <div className="space-y-2 text-[11px] bg-[#02050d] p-3 rounded-2xl border border-slate-800/80 mb-3">
                                    <div className="text-emerald-400 flex items-start gap-1.5">
                                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                        <span className="leading-snug">{node.completedMilestone}</span>
                                    </div>
                                    <div className="text-amber-300 flex items-start gap-1.5">
                                        <Clock className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                        <span className="leading-snug">{node.pendingTasks}</span>
                                    </div>
                                </div>
                            </div>

                            {/* PIE DE CARD */}
                            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[10px]">
                                <span className="text-slate-400 font-mono">
                                    {node.bunker}
                                </span>
                                <span 
                                    className="font-black flex items-center gap-1 group-hover:underline"
                                    style={{ color: node.color }}
                                >
                                    Ver Detalle <ArrowRight size={12} />
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* MODAL DETALLE DE NODO DEL MAPA MENTAL */}
            {activeNode && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
                    <div className="w-full max-w-lg bg-[#0b1326] border-2 rounded-3xl p-6 md:p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative" style={{ borderColor: activeNode.color }}>
                        <button
                            onClick={() => setActiveNode(null)}
                            className="absolute top-6 right-6 w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
                        >
                            ✕
                        </button>

                        <div className="flex items-center gap-4 mb-6">
                            <div 
                                className="w-14 h-14 rounded-2xl flex items-center justify-center font-[1000] text-xl text-white border-2"
                                style={{ backgroundColor: `${activeNode.color}20`, borderColor: activeNode.color }}
                            >
                                {activeNode.step}
                            </div>
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: activeNode.color }}>
                                    {activeNode.frente}
                                </span>
                                <h3 className="text-2xl font-[1000] text-white">
                                    {activeNode.agentName}
                                </h3>
                                <span className="text-xs text-slate-400 font-mono">{activeNode.bunker}</span>
                            </div>
                        </div>

                        <div className="space-y-4 text-xs my-6">
                            <div className="p-4 rounded-2xl bg-[#060a14] border border-slate-800">
                                <div className="text-[10px] font-bold text-slate-500 uppercase">Misión Principal</div>
                                <div className="text-slate-200 mt-1 font-bold text-sm">
                                    {activeNode.title}
                                </div>
                            </div>

                            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30">
                                <div className="text-[10px] font-bold text-emerald-400 uppercase flex items-center gap-1">
                                    <CheckCircle2 size={12} /> Logro Conquistado
                                </div>
                                <div className="text-emerald-200 mt-1">
                                    {activeNode.completedMilestone}
                                </div>
                            </div>

                            <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30">
                                <div className="text-[10px] font-bold text-amber-400 uppercase flex items-center gap-1">
                                    <Clock size={12} /> Tareas Pendientes & Planificación
                                </div>
                                <div className="text-amber-200 mt-1">
                                    {activeNode.pendingTasks}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end pt-4 border-t border-slate-800">
                            <button
                                onClick={() => setActiveNode(null)}
                                className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-black uppercase tracking-wider hover:bg-slate-700 transition cursor-pointer"
                            >
                                Cerrar Nodo
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NeonMindmapDiagram;
