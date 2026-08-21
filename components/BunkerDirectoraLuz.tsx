import React, { useState } from 'react';
import { 
    Cpu, Shield, ShieldCheck, Zap, Radio, Database, Users, 
    LayoutGrid, Target, Activity, TrendingUp, Sparkles, Terminal, 
    ExternalLink, CheckCircle2, Clock, AlertTriangle, Copy, Check,
    Layers, Compass, Flame, ArrowUpRight, BarChart3, Bot
} from 'lucide-react';
import { playNeonClick } from '../utils/audio';

export interface BunkerNode {
    id: string;
    name: string;
    roleTitle: string;
    agentName: string;
    frente: 'experiencia' | 'infraestructura' | 'expansion' | 'blindaje';
    status: 'produccion' | 'laboratorio' | 'desarrollo' | 'directiva';
    conversationId: string;
    notebookUrl: string;
    notebookSources: number;
    activeSkill: string;
    lastMission: string;
    progressPercentage: number;
    color: string;
    icon: React.ElementType;
}

const BUNKERS_DATA: BunkerNode[] = [
    {
        id: 'ari-ui-ux',
        name: 'Búnker 02: Experiencia & UI/UX',
        roleTitle: 'Oficial de Frontend & Neumorfismo 3D',
        agentName: 'ARI (SQUAD_FRONTEND)',
        frente: 'experiencia',
        status: 'laboratorio',
        conversationId: '6c8e16ba-10a9-4a34-a4d1-be97865f38f7',
        notebookUrl: 'https://notebooklm.google.com/notebook/cb9442de-e444-4ca0-98a4-914ca6e3980a',
        notebookSources: 24,
        activeSkill: 'ari_ui_skills.md (ibelick/ui-skills)',
        lastMission: 'Estructuración 3D de Interfaces 1, 2 y 3 de la Home & Modo Caramelo',
        progressPercentage: 85,
        color: '#f59e0b',
        icon: Sparkles
    },
    {
        id: 'bruno-backend',
        name: 'Búnker 05: Infraestructura Core',
        roleTitle: 'Arquitecto de Datastore & EVE',
        agentName: 'BRUNO (CORE_DATASTORE)',
        frente: 'infraestructura',
        status: 'produccion',
        conversationId: 'b9472e3a-7a52-4734-aa1b-53c829e06180',
        notebookUrl: 'https://notebooklm.google.com/notebook/ef87d269-4daf-4a2c-a658-5992c9150042',
        notebookSources: 32,
        activeSkill: 'omniGateway.ts (diegosouzapw/OmniRoute)',
        lastMission: 'Router Multi-Modelo DeepSeek-V3 + Qwen-Plus y Edge Functions',
        progressPercentage: 95,
        color: '#6366f1',
        icon: Database
    },
    {
        id: 'melisa-marketing',
        name: 'Búnker 03: Marketing & Expansión',
        roleTitle: 'Directora de Campañas & Copywriting',
        agentName: 'MELISA (MARKETING_LEAD)',
        frente: 'expansion',
        status: 'laboratorio',
        conversationId: 'e2b0ec83-c9bb-44fe-9752-1a21eabd3f18',
        notebookUrl: 'https://notebooklm.google.com/notebook/cb9442de-e444-4ca0-98a4-914ca6e3980a',
        notebookSources: 40,
        activeSkill: 'melisa_marketing.md (DeepSeek Ingestion)',
        lastMission: 'Generación masiva de copys de 24 rubros a costo $0.14 / 1M',
        progressPercentage: 90,
        color: '#ec4899',
        icon: TrendingUp
    },
    {
        id: 'thor-secops',
        name: 'Búnker 06: Ciberseguridad & QA',
        roleTitle: 'Comandante de Ciberseguridad & Doberman',
        agentName: 'THOR & VORTEX (SECOPS_LEAD)',
        frente: 'blindaje',
        status: 'produccion',
        conversationId: '04c3114d-9ca3-4882-a010-85f8c6ebf8b6',
        notebookUrl: 'https://notebooklm.google.com/notebook/e0e4f151-7847-4631-8769-282ead74c670',
        notebookSources: 28,
        activeSkill: 'thor_code_graph_audit.md (tirth8205/code-review-graph)',
        lastMission: 'Blindaje de colección Towns de Firestore & Compile-Safety',
        progressPercentage: 100,
        color: '#10b981',
        icon: ShieldCheck
    },
    {
        id: 'mateo-viabilidad',
        name: 'Búnker 01: Planificación & Finanzas',
        roleTitle: 'Jefe de Viabilidad & Tokenomics',
        agentName: 'MATEO (VIABILIDAD_FINANCIERA)',
        frente: 'expansion',
        status: 'produccion',
        conversationId: '88340a8c-838a-4835-99d9-6b77e911307b',
        notebookUrl: 'https://notebooklm.google.com/notebook/88340a8c-838a-4835-99d9-6b77e911307b',
        notebookSources: 30,
        activeSkill: 'financial.ts (ROI Optimizer)',
        lastMission: 'Auditoría de reducción de costos 98% vs WhatsApp API',
        progressPercentage: 92,
        color: '#3b82f6',
        icon: Target
    },
    {
        id: 'ely-clonacion',
        name: 'Búnker 07: Clonación Fractal',
        roleTitle: 'Especialista en Expansión Regional',
        agentName: 'ELY (CLONACION_FRACTAL)',
        frente: 'expansion',
        status: 'laboratorio',
        conversationId: 'b1ca1b6d-a719-4f36-8a03-61e8c1ea9825',
        notebookUrl: 'https://notebooklm.google.com/notebook/0a83b1d9-e35e-4473-8033-648f89f81339',
        notebookSources: 25,
        activeSkill: 'protocolo-clonacion-fractal (Skill Global)',
        lastMission: 'Siembra hiperrealista de Ezeiza, Lomas y Traslasierra',
        progressPercentage: 88,
        color: '#8b5cf6',
        icon: Layers
    },
    {
        id: 'cuby-transmision',
        name: 'Búnker 08: Sinfonía de Transmisión',
        roleTitle: 'Operador de WebSockets & Eventos',
        agentName: 'CUBY (TRANSMISION_MAESTRA)',
        frente: 'experiencia',
        status: 'desarrollo',
        conversationId: '98d36329-8735-4309-847f-8e2b20755913',
        notebookUrl: 'https://notebooklm.google.com/notebook/82a1b7bf-3899-49f5-8b4c-3d082fcad671',
        notebookSources: 18,
        activeSkill: 'pushNotifier.ts (PWA Web Push)',
        lastMission: 'Canal de transmisión en vivo y notificaciones en segundo plano',
        progressPercentage: 70,
        color: '#06b6d4',
        icon: Radio
    },
    {
        id: 'javi-mantenimiento',
        name: 'Búnker 09: Mantenimiento & Health',
        roleTitle: 'Ingeniero de Saneamiento y Rescate DB',
        agentName: 'JAVI (MANTENIMIENTO_SISTEMAS)',
        frente: 'infraestructura',
        status: 'produccion',
        conversationId: '03aa2a10-b131-452d-abb4-f01c21f95e72',
        notebookUrl: 'https://notebooklm.google.com/notebook/9a90488c-7519-441c-b845-d7b1c3bd5321',
        notebookSources: 22,
        activeSkill: 'healthWatchdog.ts & shadowLabRepair.ts',
        lastMission: 'Verificación de integridad de 42 comercios y rescate de backups',
        progressPercentage: 96,
        color: '#64748b',
        icon: Activity
    },
    {
        id: 'lore-legal',
        name: 'Búnker 10: Contable & Legales',
        roleTitle: 'Auditora de Términos y Facturación',
        agentName: 'LORE (LEGAL_COMPLIANCE)',
        frente: 'blindaje',
        status: 'produccion',
        conversationId: '509fde7f-4b31-4beb-abab-420a30a0973e',
        notebookUrl: 'https://notebooklm.google.com/notebook/509fde7f-4b31-4beb-abab-420a30a0973e',
        notebookSources: 35,
        activeSkill: 'TermsPage.tsx & BillingManagementPage.tsx',
        lastMission: 'Reglamentación de Beneficios VIP y contratos de comercios',
        progressPercentage: 94,
        color: '#ef4444',
        icon: Shield
    },
    {
        id: 'max-ventas',
        name: 'Búnker 11: Recursos Humanos & CRM',
        roleTitle: 'Coordinador de Embajadores de Campo',
        agentName: 'MAX (RECLUTAMIENTO_RRHH)',
        frente: 'expansion',
        status: 'laboratorio',
        conversationId: 'd302846c-db1d-4c88-9f1d-b6e07a456d29',
        notebookUrl: 'https://notebooklm.google.com/notebook/d302846c-db1d-4c88-9f1d-b6e07a456d29',
        notebookSources: 20,
        activeSkill: 'AcademyPage.tsx & AmbassadorRecruit.tsx',
        lastMission: 'Malla de entrenamiento para embajadores de calle',
        progressPercentage: 80,
        color: '#14b8a6',
        icon: Users
    },
    {
        id: 'dante-inversion',
        name: 'Búnker 12: Inversión Exponencial',
        roleTitle: 'Estratega de Capital & Expansión',
        agentName: 'DANTE (INVERSION_CAPITAL)',
        frente: 'expansion',
        status: 'desarrollo',
        conversationId: '71668861-44e3-40fe-8cde-74cf99b11623',
        notebookUrl: 'https://notebooklm.google.com/notebook/71668861-44e3-40fe-8cde-74cf99b11623',
        notebookSources: 19,
        activeSkill: 'DOSSIER_TECNOLOGICO_INVERSORES_SHOPDIGITAL',
        lastMission: 'Estructuración del dossier para inversores y rondas de capital',
        progressPercentage: 75,
        color: '#eab308',
        icon: Zap
    },
    {
        id: 'luz-central',
        name: 'Búnker 00: Dirección Central & Forja',
        roleTitle: 'Orquestadora Central & Mano Derecha',
        agentName: 'LUZ 01 (MARISCAL_GENERAL)',
        frente: 'infraestructura',
        status: 'produccion',
        conversationId: 'a4faed7e-d3c7-472a-a9ae-7b0cabf9f0f0',
        notebookUrl: 'https://notebooklm.google.com/notebook/0a83b1d9-e35e-4473-8033-648f89f81339',
        notebookSources: 50,
        activeSkill: 'CONSTITUCION_AGENTICA.md & .cursorrules',
        lastMission: 'Orquestación de enjambre, control de Laboratorio y merge a Producción',
        progressPercentage: 100,
        color: '#38bdf8',
        icon: Cpu
    }
];

export const BunkerDirectoraLuz: React.FC = () => {
    const [selectedFrente, setSelectedFrente] = useState<string>('todos');
    const [selectedBunker, setSelectedBunker] = useState<BunkerNode | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [timeHorizon, setTimeHorizon] = useState<'semana' | 'mes' | 'total'>('semana');

    const handleCopyId = (id: string) => {
        navigator.clipboard.writeText(id);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const filteredBunkers = selectedFrente === 'todos' 
        ? BUNKERS_DATA 
        : BUNKERS_DATA.filter(b => b.frente === selectedFrente);

    const getStatusBadge = (status: BunkerNode['status']) => {
        switch (status) {
            case 'produccion':
                return { label: '🟢 Producción', bg: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40' };
            case 'laboratorio':
                return { label: '🔬 Laboratorio', bg: 'bg-amber-950/80 text-amber-300 border-amber-500/40 animate-pulse' };
            case 'desarrollo':
                return { label: '🟡 En Forja', bg: 'bg-sky-950/80 text-sky-300 border-sky-500/40' };
            case 'directiva':
                return { label: '🔴 Esperando Orden', bg: 'bg-rose-950/80 text-rose-300 border-rose-500/40' };
        }
    };

    return (
        <div className="w-full min-h-screen bg-[#070b14] text-white p-4 md:p-8 font-sans selection:bg-cyan-500 selection:text-black">
            {/* 🌟 CABECERA SUPREMA: SALA DE GUERRA */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-[#0c1427] via-[#101b33] to-[#0c1427] border-2 border-cyan-500/30 shadow-[0_0_35px_rgba(6,182,212,0.15)]">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border-2 border-cyan-400/40 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                            <Cpu className="w-8 h-8 text-cyan-400 animate-pulse" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
                                    SNC 2.0 • FORJA CENTRAL
                                </span>
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                            </div>
                            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white mt-1">
                                SALA DE GUERRA: MARISCAL LUZ 01
                            </h1>
                            <p className="text-xs text-slate-400 font-medium">
                                Centro de Comando Táctico • 12 Búnkeres Agénticos bajo el mando del Director Waly OMEGA
                            </p>
                        </div>
                    </div>

                    {/* TELEMETRÍA RÁPIDA DE COMANDANCIA */}
                    <div className="grid grid-cols-3 gap-2 bg-[#060a12]/80 p-3 rounded-2xl border border-slate-800">
                        <div className="text-center px-3 py-1">
                            <div className="text-[10px] uppercase font-bold text-slate-400">Nodos</div>
                            <div className="text-lg font-black text-cyan-400">12 / 12</div>
                        </div>
                        <div className="text-center px-3 py-1 border-x border-slate-800">
                            <div className="text-[10px] uppercase font-bold text-slate-400">Ahorro API</div>
                            <div className="text-lg font-black text-emerald-400">98%</div>
                        </div>
                        <div className="text-center px-3 py-1">
                            <div className="text-[10px] uppercase font-bold text-slate-400">Guardrails</div>
                            <div className="text-lg font-black text-purple-400">Activos</div>
                        </div>
                    </div>
                </div>

                {/* 🧭 SELECTOR DE FRENTES DE BATALLA */}
                <div className="flex flex-wrap items-center justify-between gap-3 mt-6">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-black uppercase tracking-wider text-slate-400 mr-2 flex items-center gap-1">
                            <Compass className="w-4 h-4 text-cyan-400" /> Frentes:
                        </span>
                        {[
                            { id: 'todos', label: 'Todos los Búnkeres' },
                            { id: 'experiencia', label: '🎨 Frente 1: Experiencia (Ari)' },
                            { id: 'infraestructura', label: '🧱 Frente 2: Infraestructura (Bruno)' },
                            { id: 'expansion', label: '📢 Frente 3: Expansión (Melisa)' },
                            { id: 'blindaje', label: '🛡️ Frente 4: Blindaje (Thor)' },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    playNeonClick();
                                    setSelectedFrente(tab.id);
                                }}
                                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border ${
                                    selectedFrente === tab.id
                                        ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)] scale-105'
                                        : 'bg-[#0f172a]/60 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* SELECTOR TEMPORAL */}
                    <div className="flex items-center gap-1 bg-[#0c1427] p-1 rounded-xl border border-slate-800">
                        {(['semana', 'mes', 'total'] as const).map(horizon => (
                            <button
                                key={horizon}
                                onClick={() => {
                                    playNeonClick();
                                    setTimeHorizon(horizon);
                                }}
                                className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                                    timeHorizon === horizon 
                                        ? 'bg-violet-600 text-white shadow'
                                        : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                {horizon}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* 🧠 LIENZO TÁCTICO: GRID DE LOS BÚNKERES (MAPA MENTAL) */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredBunkers.map(bunker => {
                    const IconComponent = bunker.icon;
                    const badge = getStatusBadge(bunker.status);

                    return (
                        <div
                            key={bunker.id}
                            onClick={() => {
                                playNeonClick();
                                setSelectedBunker(bunker);
                            }}
                            className="group relative p-6 rounded-3xl bg-gradient-to-b from-[#0f182e] to-[#0a101f] border-2 border-slate-800 hover:border-cyan-500/60 transition-all duration-300 hover:shadow-[0_0_30px_rgba(6,182,212,0.2)] hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
                        >
                            {/* CABECERA DE NODO */}
                            <div>
                                <div className="flex items-start justify-between gap-3 mb-4">
                                    <div 
                                        className="w-12 h-12 rounded-2xl flex items-center justify-center border shadow-lg"
                                        style={{ backgroundColor: `${bunker.color}15`, borderColor: `${bunker.color}40`, color: bunker.color }}
                                    >
                                        <IconComponent className="w-6 h-6" />
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${badge.bg}`}>
                                        {badge.label}
                                    </span>
                                </div>

                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                                    {bunker.agentName}
                                </div>
                                <h3 className="text-lg font-black text-white group-hover:text-cyan-300 transition-colors">
                                    {bunker.name}
                                </h3>
                                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                                    {bunker.lastMission}
                                </p>
                            </div>

                            {/* BARRA DE PROGRESO Y ACCIÓN */}
                            <div className="mt-6 pt-4 border-t border-slate-800/80">
                                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mb-1.5">
                                    <span>Avance Táctico</span>
                                    <span className="text-cyan-400 font-mono font-black">{bunker.progressPercentage}%</span>
                                </div>
                                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                                    <div 
                                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500"
                                        style={{ width: `${bunker.progressPercentage}%` }}
                                    />
                                </div>

                                <div className="flex items-center justify-between text-[10px] text-slate-500 mt-3 font-mono">
                                    <span>Sources: {bunker.notebookSources}</span>
                                    <span className="text-cyan-400 flex items-center gap-1 group-hover:underline">
                                        Inspeccionar <ArrowUpRight className="w-3 h-3" />
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* 📋 MODAL TÁCTICO: EXPEDIENTE COMPLETO DEL BÚNKER */}
            {selectedBunker && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
                    <div className="w-full max-w-2xl bg-[#0d1527] border-2 border-cyan-500/50 rounded-3xl p-6 md:p-8 shadow-[0_0_50px_rgba(6,182,212,0.3)] relative">
                        {/* BOTÓN CERRAR */}
                        <button
                            onClick={() => setSelectedBunker(null)}
                            className="absolute top-6 right-6 w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center hover:bg-slate-700 transition cursor-pointer"
                        >
                            ✕
                        </button>

                        <div className="flex items-center gap-4 mb-6">
                            <div 
                                className="w-14 h-14 rounded-2xl flex items-center justify-center border shadow-xl"
                                style={{ backgroundColor: `${selectedBunker.color}20`, borderColor: `${selectedBunker.color}60`, color: selectedBunker.color }}
                            >
                                <selectedBunker.icon className="w-7 h-7" />
                            </div>
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">
                                    Expediente Oficial • {selectedBunker.agentName}
                                </span>
                                <h2 className="text-2xl font-black text-white">
                                    {selectedBunker.name}
                                </h2>
                                <p className="text-xs text-slate-400">
                                    {selectedBunker.roleTitle}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4 text-xs">
                            {/* CONVERSATION ID */}
                            <div className="p-4 rounded-2xl bg-[#060a12] border border-slate-800 flex items-center justify-between">
                                <div>
                                    <div className="text-[10px] font-bold text-slate-500 uppercase">Conversation ID (Antigravity)</div>
                                    <div className="font-mono text-cyan-300 mt-0.5 select-all">{selectedBunker.conversationId}</div>
                                </div>
                                <button
                                    onClick={() => handleCopyId(selectedBunker.conversationId)}
                                    className="p-2 rounded-xl bg-slate-800 hover:bg-cyan-500 hover:text-black transition cursor-pointer"
                                    title="Copiar ID"
                                >
                                    {copiedId === selectedBunker.conversationId ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>

                            {/* SKILL ACTIVO & FUENTES */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="p-4 rounded-2xl bg-[#060a12] border border-slate-800">
                                    <div className="text-[10px] font-bold text-slate-500 uppercase">Skill Asignado</div>
                                    <div className="font-bold text-emerald-300 mt-1 font-mono">{selectedBunker.activeSkill}</div>
                                </div>
                                <div className="p-4 rounded-2xl bg-[#060a12] border border-slate-800">
                                    <div className="text-[10px] font-bold text-slate-500 uppercase">NotebookLM Ground Truth</div>
                                    <div className="font-bold text-purple-300 mt-1 flex items-center gap-1">
                                        <span>{selectedBunker.notebookSources} fuentes cargadas</span>
                                        <a href={selectedBunker.notebookUrl} target="_blank" rel="noreferrer" className="text-cyan-400 ml-auto flex items-center gap-0.5 hover:underline">
                                            Abrir <ExternalLink className="w-3 h-3" />
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* ÚLTIMA MISIÓN */}
                            <div className="p-4 rounded-2xl bg-[#060a12] border border-slate-800">
                                <div className="text-[10px] font-bold text-slate-500 uppercase">Última Misión Forjada</div>
                                <div className="text-slate-200 mt-1 font-medium leading-relaxed">
                                    {selectedBunker.lastMission}
                                </div>
                            </div>
                        </div>

                        {/* ACCIONES DEL DIRECTOR */}
                        <div className="flex items-center justify-end gap-3 mt-8 pt-4 border-t border-slate-800">
                            <button
                                onClick={() => setSelectedBunker(null)}
                                className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-black uppercase tracking-wider hover:bg-slate-700 transition cursor-pointer"
                            >
                                Volver al Mapa
                            </button>
                            <a
                                href={selectedBunker.notebookUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-black text-xs uppercase tracking-wider hover:scale-105 transition shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center gap-2 cursor-pointer"
                            >
                                <Bot className="w-4 h-4" /> Despachar en NotebookLM
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BunkerDirectoraLuz;
