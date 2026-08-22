import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
    Cpu, Shield, ShieldCheck, Zap, Radio, Database, Users, 
    LayoutGrid, Target, Activity, TrendingUp, Sparkles, Terminal, 
    ExternalLink, CheckCircle2, Clock, AlertTriangle, Copy, Check,
    Layers, Compass, Flame, ArrowUpRight, BarChart3, Bot, ChevronLeft,
    BookOpen, Network, RefreshCw, Plus, FileText, Lock, Search,
    Send, UserCheck, CheckCheck, FolderKanban, Crown, Trophy,
    ScrollText, Award, Lightbulb, Rocket, Milestone, ShieldAlert
} from 'lucide-react';
import { playNeonClick } from '../utils/audio';

export interface StrategicProject {
    id: string;
    title: string;
    bunkerId: string;
    bunkerName: string;
    assignedAgent: string;
    frente: 'experiencia' | 'infraestructura' | 'expansion' | 'blindaje';
    stage: 'obsidian' | 'forja' | 'laboratorio' | 'produccion';
    obsidianNode: string;
    conversationId: string;
    summary: string;
    impactMetric: string;
    updatedAt: string;
}

export interface SwarmAgent {
    id: string;
    name: string;
    roleTitle: string;
    bunkerName: string;
    frente: 'experiencia' | 'infraestructura' | 'expansion' | 'blindaje';
    status: 'produccion' | 'laboratorio' | 'desarrollo' | 'directiva';
    conversationId: string;
    notebookUrl: string;
    notebookSources: number;
    activeSkill: string;
    obsidianNode: string;
    lastMission: string;
    progressPercentage: number;
    color: string;
    icon: React.ElementType;
}

export interface CommandDirective {
    id: string;
    number: string;
    title: string;
    category: 'disciplina' | 'seguridad' | 'calidad' | 'arquitectura' | 'diseno';
    targetAgents: string;
    description: string;
    enforcement: string;
    icon: React.ElementType;
}

export interface CommandAchievement {
    id: string;
    title: string;
    date: string;
    metric: string;
    description: string;
    badge: string;
    icon: React.ElementType;
}

const COMMAND_DIRECTIVES: CommandDirective[] = [
    {
        id: 'dir-01',
        number: 'DIRECTIVA 01',
        title: 'La Ley del Laboratorio & Despliegue Escalonado',
        category: 'disciplina',
        targetAgents: 'Todos los 12 Agentes del Enjambre',
        description: 'Ningún agente puede empujar cambios a producción directamente. Todo código se forja y prueba en la rama "laboratorio" (shopdigital-ar.vercel.app). El paso a main (shopdigital.tech) es facultad exclusiva del Director Waly con la orden "Luz verde a producción".',
        enforcement: '🔒 Estricto: 100% obligatorio sin excepciones',
        icon: Rocket
    },
    {
        id: 'dir-02',
        number: 'DIRECTIVA 02',
        title: 'Inmutabilidad de Bases de Datos & Colección Towns',
        category: 'seguridad',
        targetAgents: 'Bruno (Backend), Thor (SecOps), Javi (Mantenimiento)',
        description: 'Prohibición absoluta de modificar claves primarias, esquemas de documentos o IDs en la colección "Towns" de Firestore sin autorización expresa y escrita del Director Waly OMEGA.',
        enforcement: '🛡️ Bloqueo Doberman Activo',
        icon: ShieldAlert
    },
    {
        id: 'dir-03',
        number: 'DIRECTIVA 03',
        title: 'El Estándar del 94% Zero-Slop (Superpowers)',
        category: 'calidad',
        targetAgents: 'Luz 01 (Forja) y todos los subagentes',
        description: 'Rechazar tajantemente el 94% de código basura generado por LLMs sin tipado estricto, sin manejo de errores o con imports rotos. Toda línea forjada debe compilar con 0 errores en TypeScript.',
        enforcement: '⚡ Compilación Limpia Obligatoria (0 Errores TS)',
        icon: Zap
    },
    {
        id: 'dir-04',
        number: 'DIRECTIVA 04',
        title: 'Planificación Primero en Obsidian (Segundo Cerebro)',
        category: 'arquitectura',
        targetAgents: 'Luz 01, Gemy, Mateo y Dirección General',
        description: 'Antes de tocar código en la matriz, cada arquitectura, sistema o refactor se planifica, valida y documenta en la bóveda de Obsidian Vault vinculando sus nodos neuronales.',
        enforcement: '📖 Registro Obligatorio en Bóveda',
        icon: BookOpen
    },
    {
        id: 'dir-05',
        number: 'DIRECTIVA 05',
        title: 'Neumorfismo 3D Crema & Caramelo HD',
        category: 'diseno',
        targetAgents: 'Ari (UI/UX) y Squad Frontend',
        description: 'Todas las interfaces públicas de ShopDigital deben mantener la identidad visual neumórfica táctil de Silicon Valley, con paletas Crema/Caramelo, respuestas auditivas neón y adaptabilidad móvil absoluta.',
        enforcement: '🎨 Identidad Visual Unificada 24/7',
        icon: Sparkles
    }
];

const COMMAND_ACHIEVEMENTS: CommandAchievement[] = [
    {
        id: 'ach-01',
        title: 'Cero Errores TypeScript & Blindaje de Build',
        date: 'Agosto 2026',
        metric: '0 Errores TS Permanentes',
        description: 'Erradicación total de tipos inconsistentes y blindaje del compilador en las 104 vistas del sistema.',
        badge: 'Infraestructura Impecable',
        icon: CheckCircle2
    },
    {
        id: 'ach-02',
        title: '98% Ahorro de Costos con Omni-Gateway (DeepSeek V3)',
        date: 'Agosto 2026',
        metric: '$0.14 / 1M Tokens',
        description: 'Sustitución de APIs costosas por balanceo automático a DeepSeek-V3 y Qwen con tolerancia total a fallos.',
        badge: 'Eficiencia Extrema',
        icon: Zap
    },
    {
        id: 'ach-03',
        title: 'Búnker Táctico y Estado Mayor Operativo en Vercel',
        date: 'Agosto 2026',
        metric: '12 Búnkeres Conectados',
        description: 'Centro de comando con Lienzo 3D, Matriz de Agentes, Kanban y fallback seguro de credenciales.',
        badge: 'Mando Unificado',
        icon: Crown
    },
    {
        id: 'ach-04',
        title: 'Conexión Nativa al Ecosistema Abierto de Skills.sh',
        date: 'Agosto 2026',
        metric: '5 Skills de Élite Instalados',
        description: 'Terminal de Luz 01 habilitada para buscar e inyectar habilidades globales (TDD, Web Testing, Frontend Design).',
        badge: 'Superpoderes Ilimitados',
        icon: Trophy
    },
    {
        id: 'ach-05',
        title: 'Red Neuronal de 12 Cuadernos de NotebookLM',
        date: 'Agosto 2026',
        metric: '300+ Fuentes Auditadas',
        description: 'Base de conocimiento profunda estructurada para cada ministro agéntico de la organización.',
        badge: 'Segundo Cerebro Activo',
        icon: BookOpen
    }
];

const SWARM_AGENTS: SwarmAgent[] = [
    {
        id: 'melisa-marketing',
        name: 'MELISA',
        roleTitle: 'Directora de Campañas, IA & Crecimiento',
        bunkerName: 'Búnker 03: Marketing & Expansión',
        frente: 'expansion',
        status: 'laboratorio',
        conversationId: 'e2b0ec83-c9bb-44fe-9752-1a21eabd3f18',
        notebookUrl: 'https://notebooklm.google.com/notebook/cb9442de-e444-4ca0-98a4-914ca6e3980a',
        notebookSources: 40,
        activeSkill: 'DeepSeek Ingestion & Marketing Engine',
        obsidianNode: 'BUNKER_CONFIG_AND_SKILLS_MASTER_SNC2',
        lastMission: 'Generación masiva de copys para 24 rubros a costo $0.14 / 1M',
        progressPercentage: 90,
        color: '#ec4899',
        icon: TrendingUp
    },
    {
        id: 'ari-ui-ux',
        name: 'ARI',
        roleTitle: 'Oficial de Frontend & Neumorfismo 3D',
        bunkerName: 'Búnker 02: Experiencia & UI/UX',
        frente: 'experiencia',
        status: 'laboratorio',
        conversationId: '6c8e16ba-10a9-4a34-a4d1-be97865f38f7',
        notebookUrl: 'https://notebooklm.google.com/notebook/cb9442de-e444-4ca0-98a4-914ca6e3980a',
        notebookSources: 24,
        activeSkill: 'frontend-design (Anthropic) & ibelick/ui-skills',
        obsidianNode: 'GENERAL_ARI_UX_UI',
        lastMission: 'Estructuración 3D de Interfaces 1, 2 y 3 de la Home (Modo Caramelo)',
        progressPercentage: 85,
        color: '#f59e0b',
        icon: Sparkles
    },
    {
        id: 'bruno-backend',
        name: 'BRUNO',
        roleTitle: 'Arquitecto de Datastore, EVE & Backend',
        bunkerName: 'Búnker 05: Infraestructura Core',
        frente: 'infraestructura',
        status: 'produccion',
        conversationId: 'b9472e3a-7a52-4734-aa1b-53c829e06180',
        notebookUrl: 'https://notebooklm.google.com/notebook/ef87d269-4daf-4a2c-a658-5992c9150042',
        notebookSources: 32,
        activeSkill: 'tdd (Matt Pocock) & omniGateway.ts',
        obsidianNode: 'GENERAL_BRUNO_BACKEND',
        lastMission: 'Router Multi-Modelo DeepSeek-V3 + Qwen y Edge Functions',
        progressPercentage: 95,
        color: '#6366f1',
        icon: Database
    },
    {
        id: 'thor-secops',
        name: 'THOR & VORTEX',
        roleTitle: 'Comandante de Ciberseguridad & QA Doberman',
        bunkerName: 'Búnker 06: Ciberseguridad & QA',
        frente: 'blindaje',
        status: 'produccion',
        conversationId: '04c3114d-9ca3-4882-a010-85f8c6ebf8b6',
        notebookUrl: 'https://notebooklm.google.com/notebook/e0e4f151-7847-4631-8769-282ead74c670',
        notebookSources: 28,
        activeSkill: 'webapp-testing (Anthropic) & code-review-graph',
        obsidianNode: 'GENERAL_THOR_SECOPS',
        lastMission: 'Blindaje de colección Towns en Firestore y servidor MCP local',
        progressPercentage: 100,
        color: '#10b981',
        icon: ShieldCheck
    },
    {
        id: 'mateo-viabilidad',
        name: 'MATEO',
        roleTitle: 'Jefe de Viabilidad, Finanzas & Tokenomics',
        bunkerName: 'Búnker 01: Planificación & Finanzas',
        frente: 'expansion',
        status: 'produccion',
        conversationId: '88340a8c-838a-4835-99d9-6b77e911307b',
        notebookUrl: 'https://notebooklm.google.com/notebook/88340a8c-838a-4835-99d9-6b77e911307b',
        notebookSources: 30,
        activeSkill: 'financial.ts (ROI & Cost Optimizer)',
        obsidianNode: 'GENERAL_MATEO_VIABILIDAD',
        lastMission: 'Auditoría de reducción de costos 98% vs WhatsApp API oficial',
        progressPercentage: 92,
        color: '#3b82f6',
        icon: Target
    },
    {
        id: 'ely-clonacion',
        name: 'ELY',
        roleTitle: 'Especialista en Expansión & Clonación Fractal',
        bunkerName: 'Búnker 07: Clonación Fractal',
        frente: 'expansion',
        status: 'laboratorio',
        conversationId: 'b1ca1b6d-a719-4f36-8a03-61e8c1ea9825',
        notebookUrl: 'https://notebooklm.google.com/notebook/7fa97dfa-6643-4dc9-8690-6c02e8338280',
        notebookSources: 25,
        activeSkill: 'protocolo-clonacion-fractal & siembra-hiperrealista',
        obsidianNode: 'LABORATORIO_SHOPDIGITAL',
        lastMission: 'Siembra hiperrealista de Ezeiza, Lomas y Traslasierra',
        progressPercentage: 88,
        color: '#8b5cf6',
        icon: Layers
    },
    {
        id: 'cuby-transmision',
        name: 'CUBY',
        roleTitle: 'Operador de WebSockets & Transmisión en Vivo',
        bunkerName: 'Búnker 08: Transmisión & Eventos',
        frente: 'experiencia',
        status: 'desarrollo',
        conversationId: '98d36329-8735-4309-847f-8e2b20755913',
        notebookUrl: 'https://notebooklm.google.com/notebook/82a1b7bf-3899-49f5-8b4c-3d082fcad671',
        notebookSources: 18,
        activeSkill: 'pushNotifier.ts & LiveBroadcastPage.tsx',
        obsidianNode: 'CENTRO_DE_MANDO_SHOPDIGITAL',
        lastMission: 'Canal de transmisión en vivo y notificaciones PWA',
        progressPercentage: 70,
        color: '#06b6d4',
        icon: Radio
    },
    {
        id: 'javi-mantenimiento',
        name: 'JAVI',
        roleTitle: 'Ingeniero de Saneamiento y Rescate DB',
        bunkerName: 'Búnker 09: Mantenimiento & Health',
        frente: 'infraestructura',
        status: 'produccion',
        conversationId: '03aa2a10-b131-452d-abb4-f01c21f95e72',
        notebookUrl: 'https://notebooklm.google.com/notebook/9a90488c-7519-441c-b845-d7b1c3bd5321',
        notebookSources: 22,
        activeSkill: 'diagnosing-bugs (Matt Pocock) & healthWatchdog.ts',
        obsidianNode: 'MATRIZ_MAESTRA_CONVERSACIONES_SNC2',
        lastMission: 'Verificación de integridad de 42 comercios y rescate de backups',
        progressPercentage: 96,
        color: '#64748b',
        icon: Activity
    },
    {
        id: 'lore-legal',
        name: 'LORE',
        roleTitle: 'Auditora de Términos, Contratos y Facturación',
        bunkerName: 'Búnker 10: Contable & Legales',
        frente: 'blindaje',
        status: 'produccion',
        conversationId: '509fde7f-4b31-4beb-abab-420a30a0973e',
        notebookUrl: 'https://notebooklm.google.com/notebook/509fde7f-4b31-4beb-abab-420a30a0973e',
        notebookSources: 35,
        activeSkill: 'TermsPage.tsx & BillingManagementPage.tsx',
        obsidianNode: 'CONSTITUCION_AGENTICA_SNC2',
        lastMission: 'Reglamentación de Beneficios VIP y contratos de comercios',
        progressPercentage: 94,
        color: '#ef4444',
        icon: Shield
    },
    {
        id: 'max-ventas',
        name: 'MAX',
        roleTitle: 'Coordinador de Embajadores & Academia',
        bunkerName: 'Búnker 11: Recursos Humanos & Talento',
        frente: 'expansion',
        status: 'laboratorio',
        conversationId: 'd302846c-db1d-4c88-9f1d-b6e07a456d29',
        notebookUrl: 'https://notebooklm.google.com/notebook/d302846c-db1d-4c88-9f1d-b6e07a456d29',
        notebookSources: 20,
        activeSkill: 'AcademyPage.tsx & AmbassadorRecruit.tsx',
        obsidianNode: 'ARQUITECTURA_EQUIPO_SHOPDIGITAL_SNC2',
        lastMission: 'Malla de entrenamiento para embajadores de calle',
        progressPercentage: 80,
        color: '#14b8a6',
        icon: Users
    },
    {
        id: 'dante-inversion',
        name: 'DANTE',
        roleTitle: 'Estratega de Capital & Expansión Exponencial',
        bunkerName: 'Búnker 12: Inversión Exponencial',
        frente: 'expansion',
        status: 'desarrollo',
        conversationId: '71668861-44e3-40fe-8cde-74cf99b11623',
        notebookUrl: 'https://notebooklm.google.com/notebook/71668861-44e3-40fe-8cde-74cf99b11623',
        notebookSources: 19,
        activeSkill: 'DOSSIER_TECNOLOGICO_INVERSORES_SHOPDIGITAL',
        obsidianNode: 'DOSSIER_TECNOLOGICO_INVERSORES_SHOPDIGITAL',
        lastMission: 'Estructuración del dossier para inversores y rondas de capital',
        progressPercentage: 75,
        color: '#eab308',
        icon: Zap
    },
    {
        id: 'luz-central',
        name: 'LUZ 01',
        roleTitle: 'Orquestadora Central, Jefa de Forja & Mano Derecha',
        bunkerName: 'Búnker 00: Dirección Central & Forja',
        frente: 'infraestructura',
        status: 'produccion',
        conversationId: 'a4faed7e-d3c7-472a-a9ae-7b0cabf9f0f0',
        notebookUrl: 'https://notebooklm.google.com/notebook/ef87d269-4daf-4a2c-a658-5992c9150042',
        notebookSources: 50,
        activeSkill: 'code-review (Matt Pocock) & .cursorrules',
        obsidianNode: 'LUZ_01_ORQUESTADORA',
        lastMission: 'Orquestación de enjambre, control de Laboratorio y merge a Producción',
        progressPercentage: 100,
        color: '#38bdf8',
        icon: Cpu
    }
];

const STRATEGIC_PROJECTS: StrategicProject[] = [
    {
        id: 'proj-01',
        title: 'Interfaces 1, 2 y 3 de la Home (Modo Caramelo 3D)',
        bunkerId: 'ari-ui-ux',
        bunkerName: 'Búnker 02: Experiencia & UI/UX',
        assignedAgent: 'ARI (SQUAD_FRONTEND)',
        frente: 'experiencia',
        stage: 'laboratorio',
        obsidianNode: 'GENERAL_ARI_UX_UI',
        conversationId: '6c8e16ba-10a9-4a34-a4d1-be97865f38f7',
        summary: 'Portada Hero, Barra de 24 Rubros 3D y Catálogo de Comercios VIP con diseño neumórfico táctil.',
        impactMetric: 'UI Silicon Valley & 100% Mobile',
        updatedAt: '21 Ago 2026'
    },
    {
        id: 'proj-02',
        title: 'Omni-Gateway Multi-Modelo (DeepSeek + Qwen)',
        bunkerId: 'bruno-backend',
        bunkerName: 'Búnker 05: Infraestructura Core',
        assignedAgent: 'BRUNO (CORE_DATASTORE)',
        frente: 'infraestructura',
        stage: 'produccion',
        obsidianNode: 'GENERAL_BRUNO_BACKEND',
        conversationId: 'b9472e3a-7a52-4734-aa1b-53c829e06180',
        summary: 'Enrutador universal con balanceo automático a DeepSeek ($0.14/1M) y OpenRouter sin caídas.',
        impactMetric: '98% ahorro en costos de IA',
        updatedAt: '20 Ago 2026'
    },
    {
        id: 'proj-03',
        title: 'Marketing Masivo de Rubros con DeepSeek Ingestion',
        bunkerId: 'melisa-marketing',
        bunkerName: 'Búnker 03: Marketing & Expansión',
        assignedAgent: 'MELISA (MARKETING_LEAD)',
        frente: 'expansion',
        stage: 'laboratorio',
        obsidianNode: 'BUNKER_CONFIG_AND_SKILLS_MASTER_SNC2',
        conversationId: 'e2b0ec83-c9bb-44fe-9752-1a21eabd3f18',
        summary: 'Campaña inteligente de 24 rubros basada en 40 fuentes de NotebookLM para atracción de comerciantes.',
        impactMetric: 'Generación a costo $0.00 / comercio',
        updatedAt: '19 Ago 2026'
    },
    {
        id: 'proj-04',
        title: 'Blindaje de Colección Towns & Protocolo Doberman',
        bunkerId: 'thor-secops',
        bunkerName: 'Búnker 06: Ciberseguridad & QA',
        assignedAgent: 'THOR & VORTEX (SECOPS)',
        frente: 'blindaje',
        stage: 'produccion',
        obsidianNode: 'GENERAL_THOR_SECOPS',
        conversationId: '04c3114d-9ca3-4882-a010-85f8c6ebf8b6',
        summary: 'Bloqueo inmutable de claves primarias en Firestore y servidor MCP local para grafo de dependencias.',
        impactMetric: 'Zero Data Loss & 0 Errores TS',
        updatedAt: '20 Ago 2026'
    },
    {
        id: 'proj-05',
        title: 'Clonación Fractal: Ezeiza, Traslasierra y 7 Lagos',
        bunkerId: 'ely-clonacion',
        bunkerName: 'Búnker 07: Clonación Fractal',
        assignedAgent: 'ELY (CLONACION_FRACTAL)',
        frente: 'expansion',
        stage: 'laboratorio',
        obsidianNode: 'LABORATORIO_SHOPDIGITAL',
        conversationId: 'b1ca1b6d-a719-4f36-8a03-61e8c1ea9825',
        summary: 'Molde maestro para replicar ShopDigital en cualquier municipio en menos de 10 minutos.',
        impactMetric: 'Escalabilidad regional ilimitada',
        updatedAt: '18 Ago 2026'
    },
    {
        id: 'proj-06',
        title: 'Fusión Superpowers + Spec Kit (.cursorrules)',
        bunkerId: 'luz-central',
        bunkerName: 'Búnker 00: Dirección Central & Forja',
        assignedAgent: 'LUZ 01 (MARISCAL_GENERAL)',
        frente: 'infraestructura',
        stage: 'produccion',
        obsidianNode: 'SUPERPOWERS_FUSION_MAESTRA_SNC2',
        conversationId: 'a4faed7e-d3c7-472a-a9ae-7b0cabf9f0f0',
        summary: 'Estándar del 94% Zero-Slop, 3 Fases de la Forja y conexión al ecosistema skills.sh.',
        impactMetric: '100% de agentes disciplinados',
        updatedAt: '21 Ago 2026'
    }
];

export const BunkerTacticoPage: React.FC = () => {
    const navigate = useNavigate();
    const { townId = 'esteban-echeverria' } = useParams<{ townId: string }>();
    const [selectedTab, setSelectedTab] = useState<'comandancia' | 'agentes' | 'lienzo' | 'kanban' | 'obsidian'>('comandancia');
    const [selectedFrente, setSelectedFrente] = useState<string>('todos');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [selectedAgent, setSelectedAgent] = useState<SwarmAgent | null>(null);
    const [selectedProj, setSelectedProj] = useState<StrategicProject | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [directiveInput, setDirectiveInput] = useState<string>('');
    const [transmittedDirective, setTransmittedDirective] = useState<string | null>(null);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(text);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleSendDirective = (agentName: string) => {
        if (!directiveInput.trim()) return;
        playNeonClick();
        setTransmittedDirective(`Directiva enviada a ${agentName}: "${directiveInput}"`);
        setTimeout(() => setTransmittedDirective(null), 4000);
        setDirectiveInput('');
    };

    const filteredAgents = SWARM_AGENTS.filter(agent => {
        const matchesFrente = selectedFrente === 'todos' || agent.frente === selectedFrente;
        const matchesSearch = searchQuery === '' || 
            agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            agent.roleTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
            agent.lastMission.toLowerCase().includes(searchQuery.toLowerCase()) ||
            agent.bunkerName.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFrente && matchesSearch;
    });

    const filteredProjects = selectedFrente === 'todos'
        ? STRATEGIC_PROJECTS
        : STRATEGIC_PROJECTS.filter(p => p.frente === selectedFrente);

    const getStatusBadge = (status: SwarmAgent['status']) => {
        switch (status) {
            case 'produccion':
                return { label: '🟢 En Producción', bg: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40' };
            case 'laboratorio':
                return { label: '🔬 En Laboratorio', bg: 'bg-amber-950/80 text-amber-300 border-amber-500/40 animate-pulse' };
            case 'desarrollo':
                return { label: '🟡 En Forja', bg: 'bg-sky-950/80 text-sky-300 border-sky-500/40' };
            case 'directiva':
                return { label: '🔴 Esperando Orden', bg: 'bg-rose-950/80 text-rose-300 border-rose-500/40' };
        }
    };

    const getStageBadge = (stage: StrategicProject['stage']) => {
        switch (stage) {
            case 'obsidian':
                return { label: '📝 En Obsidian (Plan)', bg: 'bg-purple-950/80 text-purple-300 border-purple-500/40' };
            case 'forja':
                return { label: '⚡ En Forja (Código)', bg: 'bg-blue-950/80 text-blue-300 border-blue-500/40' };
            case 'laboratorio':
                return { label: '🔬 En Laboratorio (Staging)', bg: 'bg-amber-950/80 text-amber-300 border-amber-500/40 animate-pulse' };
            case 'produccion':
                return { label: '🟢 En Producción (Live)', bg: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40' };
        }
    };

    return (
        <div className="w-full min-h-screen bg-[#050811] text-white p-4 md:p-8 font-sans selection:bg-cyan-500 selection:text-black">
            {/* 🌟 ENCABEZADO OFICIAL DE MANDO ESTRATÉGICO */}
            <div className="max-w-7xl mx-auto mb-8">
                {/* BOTÓN VOLVER AL TABLERO MAESTRO */}
                <button
                    onClick={() => { playNeonClick(); navigate(`/${townId}/tablero-maestro`); }}
                    className="mb-4 px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 transition cursor-pointer"
                >
                    <ChevronLeft size={16} /> Volver al Tablero Maestro
                </button>

                <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-[#0b1329] via-[#0f1b3d] to-[#0b1329] border-2 border-cyan-500/40 shadow-[0_0_40px_rgba(6,182,212,0.2)] flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-20 h-20 rounded-2xl bg-cyan-500/10 border-2 border-cyan-400/50 flex items-center justify-center shadow-[0_0_25px_rgba(6,182,212,0.4)]">
                            <Compass className="w-10 h-10 text-cyan-400 animate-spin-slow" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="px-3 py-1 rounded-full text-[10px] font-[1000] uppercase tracking-widest bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
                                    ESTADO MAYOR • SNC 2.0
                                </span>
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                            </div>
                            <h1 className="text-2xl md:text-4xl font-[1000] tracking-tight text-white mt-1">
                                BÚNKER TÁCTICO Y ESTRATÉGICO
                            </h1>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 font-bold mt-1">
                                <span className="text-amber-400 flex items-center gap-1">
                                    👑 Comandante: <strong className="text-white">DIRECTOR WALY OMEGA</strong>
                                </span>
                                <span className="text-slate-600">•</span>
                                <span className="text-cyan-400 flex items-center gap-1">
                                    ⚡ Orquestación: <strong className="text-white">AGENTE LUZ-01</strong>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* TELEMETRÍA GLOBAL */}
                    <div className="grid grid-cols-3 gap-2 bg-[#050a17]/90 p-4 rounded-2xl border border-cyan-500/30">
                        <div className="text-center px-3">
                            <div className="text-[10px] uppercase font-black text-slate-400">Directivas</div>
                            <div className="text-xl font-[1000] text-amber-400">{COMMAND_DIRECTIVES.length}</div>
                        </div>
                        <div className="text-center px-3 border-x border-slate-800">
                            <div className="text-[10px] uppercase font-black text-slate-400">Ministros</div>
                            <div className="text-xl font-[1000] text-cyan-400">{SWARM_AGENTS.length}</div>
                        </div>
                        <div className="text-center px-3">
                            <div className="text-[10px] uppercase font-black text-slate-400">Logros</div>
                            <div className="text-xl font-[1000] text-emerald-400">{COMMAND_ACHIEVEMENTS.length}</div>
                        </div>
                    </div>
                </div>

                {/* 🎛️ SELECTOR DE VISTAS PRINCIPALES */}
                <div className="flex flex-wrap items-center justify-between gap-4 mt-6">
                    <div className="flex flex-wrap items-center gap-2 bg-[#0a1020] p-1.5 rounded-2xl border border-slate-800">
                        {[
                            { id: 'comandancia', label: '👑 Comandancia & Directivas', icon: Crown },
                            { id: 'agentes', label: '👥 Matriz de Agentes (12)', icon: Users },
                            { id: 'lienzo', label: '🧠 Lienzo Táctico 3D', icon: Network },
                            { id: 'kanban', label: '📊 Tablero Kanban', icon: FolderKanban },
                            { id: 'obsidian', label: '📖 Sincronía Obsidian', icon: BookOpen },
                        ].map(tab => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => {
                                        playNeonClick();
                                        setSelectedTab(tab.id as any);
                                    }}
                                    className={`px-4 md:px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer border ${
                                        selectedTab === tab.id
                                            ? 'bg-gradient-to-r from-amber-500 via-cyan-500 to-blue-600 text-black border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                                            : 'text-slate-400 border-transparent hover:text-white hover:bg-slate-800/50'
                                    }`}
                                >
                                    <Icon size={15} /> {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* FILTRO DE FRENTES & BUSCADOR */}
                    {selectedTab !== 'comandancia' && (
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="relative">
                                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                                <input
                                    type="text"
                                    placeholder="Buscar agente o misión..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 pr-4 py-1.5 rounded-xl bg-[#090e1c] border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 w-48 md:w-56"
                                />
                            </div>

                            <div className="flex flex-wrap items-center gap-1.5">
                                {[
                                    { id: 'todos', label: 'Todos' },
                                    { id: 'experiencia', label: '🎨 Exp.' },
                                    { id: 'infraestructura', label: '🧱 Infra' },
                                    { id: 'expansion', label: '📢 Exp.' },
                                    { id: 'blindaje', label: '🛡️ Sec' },
                                ].map(f => (
                                    <button
                                        key={f.id}
                                        onClick={() => {
                                            playNeonClick();
                                            setSelectedFrente(f.id);
                                        }}
                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border ${
                                            selectedFrente === f.id
                                                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow'
                                                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
                                        }`}
                                    >
                                        {f.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* NOTIFICACIÓN FLOTANTE DE DIRECTIVA TRANSMITIDA */}
            {transmittedDirective && (
                <div className="max-w-7xl mx-auto mb-6 p-4 rounded-2xl bg-emerald-950/80 border-2 border-emerald-400 text-emerald-300 flex items-center justify-between shadow-[0_0_30px_rgba(16,185,129,0.3)] animate-fadeIn">
                    <div className="flex items-center gap-3">
                        <CheckCheck className="w-6 h-6 text-emerald-400" />
                        <span className="text-xs font-black uppercase tracking-wider">{transmittedDirective}</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400">🟢 TRANSMISIÓN CONFIRMADA</span>
                </div>
            )}

            {/* ─── VISTA 0: COMANDANCIA & DIRECTIVAS (WALY & LUZ 01) ─── */}
            {selectedTab === 'comandancia' && (
                <div className="max-w-7xl mx-auto space-y-10">
                    {/* 1. SECCIÓN: DIRECTIVAS SUPREMAS PARA TODOS LOS AGENTES */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <ScrollText className="w-6 h-6 text-amber-400" />
                                <div>
                                    <h2 className="text-xl font-[1000] text-white">
                                        DIRECTIVAS SUPREMAS DE LA COMANDANCIA (LÍNEA DE MANDO)
                                    </h2>
                                    <p className="text-xs text-slate-400">
                                        Doctrina obligatoria que rige las operaciones de todos los agentes y subagentes de ShopDigital.
                                    </p>
                                </div>
                            </div>
                            <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-amber-500/20 text-amber-300 border border-amber-400/40">
                                Inmutable
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {COMMAND_DIRECTIVES.map(dir => {
                                const Icon = dir.icon;
                                return (
                                    <div
                                        key={dir.id}
                                        className="p-6 rounded-3xl bg-gradient-to-b from-[#101a38] to-[#0a1024] border-2 border-amber-500/30 hover:border-amber-400 transition-all shadow-lg flex flex-col justify-between"
                                    >
                                        <div>
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-[10px] font-mono font-black text-amber-400 tracking-wider">
                                                    {dir.number}
                                                </span>
                                                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                                                    <Icon className="w-4 h-4 text-amber-400" />
                                                </div>
                                            </div>
                                            <h3 className="text-base font-black text-white mb-2 leading-snug">
                                                {dir.title}
                                            </h3>
                                            <p className="text-xs text-slate-300 leading-relaxed mb-4">
                                                {dir.description}
                                            </p>
                                        </div>

                                        <div className="pt-3 border-t border-slate-800/80 flex flex-col gap-1">
                                            <span className="text-[10px] text-slate-400 font-bold">
                                                🎯 <strong>Alcance:</strong> {dir.targetAgents}
                                            </span>
                                            <span className="text-[10px] text-emerald-400 font-bold">
                                                {dir.enforcement}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* 2. SECCIÓN: NUESTROS LOGROS CONQUISTADOS (EL CAMINO RECORRIDO) */}
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <Trophy className="w-6 h-6 text-emerald-400" />
                            <div>
                                <h2 className="text-xl font-[1000] text-white">
                                    HITOS Y LOGROS CONQUISTADOS (BITÁCORA DE ÉXITO)
                                </h2>
                                <p className="text-xs text-slate-400">
                                    Hitos de infraestructura, optimización y blindaje alcanzados por el Director Waly y Luz 01.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {COMMAND_ACHIEVEMENTS.map(ach => {
                                const Icon = ach.icon;
                                return (
                                    <div
                                        key={ach.id}
                                        className="p-6 rounded-3xl bg-gradient-to-b from-[#091829] to-[#050e1c] border-2 border-emerald-500/30 hover:border-emerald-400 transition-all shadow-lg flex flex-col justify-between"
                                    >
                                        <div>
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                                    {ach.badge}
                                                </span>
                                                <span className="text-[10px] font-mono text-slate-500">{ach.date}</span>
                                            </div>
                                            <h3 className="text-base font-black text-white mb-2 leading-snug">
                                                {ach.title}
                                            </h3>
                                            <p className="text-xs text-slate-400 leading-relaxed mb-4">
                                                {ach.description}
                                            </p>
                                        </div>

                                        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                                            <span className="text-xs font-[1000] text-emerald-400 flex items-center gap-1">
                                                <Icon size={14} /> {ach.metric}
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-500">Consolidado</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* ─── VISTA 1: MATRIZ DE AGENTES Y MINISTROS (12) ─── */}
            {selectedTab === 'agentes' && (
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAgents.map(agent => {
                        const Icon = agent.icon;
                        const badge = getStatusBadge(agent.status);
                        return (
                            <div
                                key={agent.id}
                                onClick={() => {
                                    playNeonClick();
                                    setSelectedAgent(agent);
                                }}
                                className="group relative p-6 rounded-3xl bg-gradient-to-b from-[#0e162c] to-[#080d1a] border-2 border-slate-800 hover:border-cyan-500/60 transition-all duration-300 hover:shadow-[0_0_30px_rgba(6,182,212,0.25)] hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
                            >
                                <div>
                                    {/* CABECERA DE LA CARD */}
                                    <div className="flex items-center justify-between gap-2 mb-4">
                                        <div className="flex items-center gap-3">
                                            <div 
                                                className="w-12 h-12 rounded-2xl flex items-center justify-center border shadow-lg transition-transform group-hover:scale-110"
                                                style={{ backgroundColor: `${agent.color}15`, borderColor: `${agent.color}60` }}
                                            >
                                                <Icon className="w-6 h-6" style={{ color: agent.color }} />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-[1000] text-white group-hover:text-cyan-300 transition-colors">
                                                    {agent.name}
                                                </h3>
                                                <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                                    {agent.bunkerName}
                                                </div>
                                            </div>
                                        </div>
                                        <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${badge.bg}`}>
                                            {badge.label}
                                        </span>
                                    </div>

                                    {/* ROL Y MISIÓN */}
                                    <div className="text-xs font-bold text-slate-200 mb-2">
                                        {agent.roleTitle}
                                    </div>
                                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed bg-[#050a14] p-2.5 rounded-xl border border-slate-800/80 mb-4">
                                        🎯 <strong>Última Misión:</strong> {agent.lastMission}
                                    </p>

                                    {/* BARRA DE PROGRESO */}
                                    <div className="mb-4">
                                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mb-1">
                                            <span>Progreso Operativo</span>
                                            <span className="text-cyan-400">{agent.progressPercentage}%</span>
                                        </div>
                                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full rounded-full transition-all duration-500"
                                                style={{ 
                                                    width: `${agent.progressPercentage}%`,
                                                    background: `linear-gradient(90deg, ${agent.color}, #06b6d4)`
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* PIE DE CARD */}
                                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                                    <span className="text-slate-400 font-mono flex items-center gap-1">
                                        🧠 {agent.notebookSources} Fuentes LM
                                    </span>
                                    <span className="text-cyan-400 font-black flex items-center gap-1 group-hover:underline">
                                        Ver Expediente <ArrowUpRight size={13} />
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ─── VISTA 2: LIENZO TÁCTICO 3D (PROYECTOS) ─── */}
            {selectedTab === 'lienzo' && (
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects.map(proj => {
                        const badge = getStageBadge(proj.stage);
                        return (
                            <div
                                key={proj.id}
                                onClick={() => {
                                    playNeonClick();
                                    setSelectedProj(proj);
                                }}
                                className="group relative p-6 rounded-3xl bg-gradient-to-b from-[#0e162c] to-[#080d1a] border-2 border-slate-800 hover:border-cyan-500/60 transition-all duration-300 hover:shadow-[0_0_30px_rgba(6,182,212,0.25)] hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-center justify-between gap-2 mb-3">
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${badge.bg}`}>
                                            {badge.label}
                                        </span>
                                        <span className="text-[10px] font-mono text-slate-500">{proj.updatedAt}</span>
                                    </div>

                                    <div className="text-[10px] font-black uppercase tracking-widest text-cyan-400 mb-1">
                                        {proj.assignedAgent}
                                    </div>
                                    <h3 className="text-lg font-black text-white group-hover:text-cyan-300 transition-colors leading-snug">
                                        {proj.title}
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                                        {proj.summary}
                                    </p>
                                </div>

                                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                                    <div className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                                        <Zap size={12} /> {proj.impactMetric}
                                    </div>
                                    <span className="text-cyan-400 text-xs font-black flex items-center gap-1 group-hover:underline">
                                        Ver <ArrowUpRight size={14} />
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ─── VISTA 3: TABLERO KANBAN DE 4 FASES ─── */}
            {selectedTab === 'kanban' && (
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-5">
                    {[
                        { stage: 'obsidian', title: '1. Planificado en Obsidian', color: 'border-purple-500/40 text-purple-400 bg-purple-950/20' },
                        { stage: 'forja', title: '2. En Forja de Código', color: 'border-blue-500/40 text-blue-400 bg-blue-950/20' },
                        { stage: 'laboratorio', title: '3. En Laboratorio (Staging)', color: 'border-amber-500/40 text-amber-400 bg-amber-950/20' },
                        { stage: 'produccion', title: '4. En Producción (Live)', color: 'border-emerald-500/40 text-emerald-400 bg-emerald-950/20' },
                    ].map(col => {
                        const colProjects = filteredProjects.filter(p => p.stage === col.stage);
                        return (
                            <div key={col.stage} className={`p-4 rounded-3xl border ${col.color} flex flex-col min-h-[500px]`}>
                                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                                    <h4 className="text-xs font-black uppercase tracking-wider">{col.title}</h4>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-black/60 text-white">
                                        {colProjects.length}
                                    </span>
                                </div>

                                <div className="space-y-3 flex-1">
                                    {colProjects.map(p => (
                                        <div
                                            key={p.id}
                                            onClick={() => { playNeonClick(); setSelectedProj(p); }}
                                            className="p-4 rounded-2xl bg-[#090e1c] border border-slate-800 hover:border-cyan-400/50 cursor-pointer transition shadow hover:shadow-lg"
                                        >
                                            <span className="text-[9px] font-black uppercase tracking-widest text-cyan-400 block mb-1">
                                                {p.assignedAgent}
                                            </span>
                                            <h5 className="text-xs font-bold text-white mb-2">{p.title}</h5>
                                            <p className="text-[11px] text-slate-400 line-clamp-2">{p.summary}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ─── VISTA 4: SINCRONÍA OBSIDIAN ─── */}
            {selectedTab === 'obsidian' && (
                <div className="max-w-7xl mx-auto p-6 md:p-8 rounded-3xl bg-[#090e1c] border border-purple-500/30">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-400/40 flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white">Red Neuronal & Segundo Cerebro (Obsidian Vault)</h3>
                            <p className="text-xs text-slate-400">
                                Cada nodo forjado por el Director Waly y Luz 01 está sincronizado en tiempo real en la bóveda local.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                            { node: 'DIRECTOR_WALY_OMEGA', desc: 'Comandante Supremo y Autorizaciones de Producción' },
                            { node: 'LUZ_01_ORQUESTADORA', desc: 'Nodo HUB Central y Orquestación de Agentes' },
                            { node: 'BUNKER_TACTICO_Y_ESTRATEGICO_SNC2', desc: 'Estado Mayor y Matriz de 12 Agentes' },
                            { node: 'CONSTITUCION_AGENTICA_SNC2', desc: 'Reglas y Jerarquías de los 12 Búnkeres' },
                            { node: 'LABORATORIO_SHOPDIGITAL', desc: 'Registro de Despliegues en Staging' },
                            { node: 'SPEC_KIT_MATT_POCOCK_ADAPTACION_SNC2', desc: 'Guardrails Estrictos y Tipos TypeScript' },
                            { node: 'SUPERPOWERS_FUSION_MAESTRA_SNC2', desc: 'Estándar del 94% y Directivas Multi-LLM' },
                            { node: 'ECOSISTEMA_SKILLS_SH_Y_FORJA_SNC2', desc: 'Conexión a la CLI de Skills.sh' },
                            { node: 'DOSSIER_TECNOLOGICO_INVERSORES_SHOPDIGITAL', desc: 'Documento Ejecutivo para Inversores y CTOs' },
                            { node: 'SALA_DE_GUERRA_Y_LIENZO_TACTICO_LUZ01', desc: 'Mapa Mental y Planificación de Frentes' }
                        ].map(n => (
                            <div key={n.node} className="p-4 rounded-2xl bg-[#060a14] border border-slate-800 flex flex-col justify-between">
                                <div>
                                    <div className="text-[10px] font-mono text-purple-400 font-black mb-1">[[ {n.node} ]]</div>
                                    <p className="text-xs text-slate-300">{n.desc}</p>
                                </div>
                                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                                    <span className="text-emerald-400">🟢 Sincronizado</span>
                                    <span className="font-mono">Vault Local</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 📋 MODAL DE EXPEDIENTE DEL AGENTE (MELISA, ARI, BRUNO, ETC.) */}
            {selectedAgent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
                    <div className="w-full max-w-2xl bg-[#0b1326] border-2 border-cyan-500/50 rounded-3xl p-6 md:p-8 shadow-[0_0_50px_rgba(6,182,212,0.35)] relative max-h-[90vh] overflow-y-auto">
                        <button
                            onClick={() => setSelectedAgent(null)}
                            className="absolute top-6 right-6 w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
                        >
                            ✕
                        </button>

                        {/* CABECERA DEL MODAL */}
                        <div className="flex items-center gap-4 mb-6">
                            <div 
                                className="w-16 h-16 rounded-2xl flex items-center justify-center border-2 shadow-lg"
                                style={{ backgroundColor: `${selectedAgent.color}20`, borderColor: selectedAgent.color }}
                            >
                                <selectedAgent.icon className="w-8 h-8" style={{ color: selectedAgent.color }} />
                            </div>
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">
                                    {selectedAgent.bunkerName}
                                </span>
                                <h2 className="text-2xl md:text-3xl font-[1000] text-white">
                                    {selectedAgent.name}
                                </h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusBadge(selectedAgent.status).bg}`}>
                                        {getStatusBadge(selectedAgent.status).label}
                                    </span>
                                    <span className="text-xs text-slate-400 font-bold">{selectedAgent.roleTitle}</span>
                                </div>
                            </div>
                        </div>

                        {/* DETALLES Y EXPEDIENTE */}
                        <div className="space-y-4 text-xs my-6">
                            {/* ÚLTIMA MISIÓN */}
                            <div className="p-4 rounded-2xl bg-[#060a14] border border-slate-800">
                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">🎯 Misión & Planificación Activa</div>
                                <div className="text-slate-200 mt-1 font-medium leading-relaxed">
                                    {selectedAgent.lastMission}
                                </div>
                            </div>

                            {/* GRILLA DE HERRAMIENTAS Y NOTEBOOKLM */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {/* NOTEBOOKLM */}
                                <div className="p-4 rounded-2xl bg-[#060a14] border border-slate-800 flex flex-col justify-between">
                                    <div>
                                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">🧠 Cuaderno NotebookLM</div>
                                        <div className="text-cyan-300 font-bold mt-1 flex items-center gap-1">
                                            <span>{selectedAgent.notebookSources} Fuentes Auditadas</span>
                                        </div>
                                    </div>
                                    <a
                                        href={selectedAgent.notebookUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-3 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition"
                                    >
                                        Abrir en NotebookLM <ExternalLink size={12} />
                                    </a>
                                </div>

                                {/* SUPERPODER / SKILL */}
                                <div className="p-4 rounded-2xl bg-[#060a14] border border-slate-800 flex flex-col justify-between">
                                    <div>
                                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">⚡ Superpoder Activo (Skill)</div>
                                        <div className="text-amber-300 font-bold mt-1 text-[11px]">
                                            {selectedAgent.activeSkill}
                                        </div>
                                    </div>
                                    <div className="text-[10px] text-slate-500 mt-2 font-mono">
                                        Bóveda: [[ {selectedAgent.obsidianNode} ]]
                                    </div>
                                </div>
                            </div>

                            {/* CONVERSATION ID */}
                            <div className="p-4 rounded-2xl bg-[#060a14] border border-slate-800 flex items-center justify-between">
                                <div>
                                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Conversation ID (Antigravity)</div>
                                    <div className="font-mono text-cyan-300 mt-0.5 text-[11px] truncate max-w-[280px]">
                                        {selectedAgent.conversationId}
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleCopy(selectedAgent.conversationId)}
                                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-cyan-500 hover:text-black transition cursor-pointer text-[10px] font-bold flex items-center gap-1"
                                >
                                    {copiedId === selectedAgent.conversationId ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                                    <span>{copiedId === selectedAgent.conversationId ? 'Copiado' : 'Copiar'}</span>
                                </button>
                            </div>

                            {/* CAJA DE TRANSMISIÓN DE DIRECTIVA DIRECTA */}
                            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#0c1836] to-[#081026] border-2 border-cyan-500/30">
                                <div className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                    <Zap size={14} className="text-cyan-400" />
                                    <span>Emitir Directiva Suprema a {selectedAgent.name}</span>
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder={`Ej: Priorizar integración en Laboratorio y pruebas con Thor...`}
                                        value={directiveInput}
                                        onChange={(e) => setDirectiveInput(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') handleSendDirective(selectedAgent.name); }}
                                        className="flex-1 px-4 py-2 rounded-xl bg-black/60 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                                    />
                                    <button
                                        onClick={() => handleSendDirective(selectedAgent.name)}
                                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-black text-xs uppercase tracking-wider hover:scale-105 transition shadow flex items-center gap-1.5 cursor-pointer"
                                    >
                                        <Send size={13} /> Transmitir
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* BOTÓN DE CIERRE */}
                        <div className="flex items-center justify-end pt-4 border-t border-slate-800">
                            <button
                                onClick={() => setSelectedAgent(null)}
                                className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-black uppercase tracking-wider hover:bg-slate-700 transition cursor-pointer"
                            >
                                Cerrar Expediente
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 📋 MODAL DE DETALLE DEL PROYECTO */}
            {selectedProj && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
                    <div className="w-full max-w-2xl bg-[#0b1326] border-2 border-cyan-500/50 rounded-3xl p-6 md:p-8 shadow-[0_0_50px_rgba(6,182,212,0.3)] relative">
                        <button
                            onClick={() => setSelectedProj(null)}
                            className="absolute top-6 right-6 w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
                        >
                            ✕
                        </button>

                        <div className="mb-4">
                            <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">
                                {selectedProj.bunkerName}
                            </span>
                            <h2 className="text-2xl font-[1000] text-white mt-1">
                                {selectedProj.title}
                            </h2>
                            <div className="flex items-center gap-2 mt-2">
                                <span className={`px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStageBadge(selectedProj.stage).bg}`}>
                                    {getStageBadge(selectedProj.stage).label}
                                </span>
                                <span className="text-xs text-slate-400">• Agente: <strong>{selectedProj.assignedAgent}</strong></span>
                            </div>
                        </div>

                        <div className="space-y-3 text-xs my-6">
                            <div className="p-4 rounded-2xl bg-[#060a14] border border-slate-800">
                                <div className="text-[10px] font-bold text-slate-500 uppercase">Resumen Táctico</div>
                                <div className="text-slate-200 mt-1 font-medium leading-relaxed">
                                    {selectedProj.summary}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="p-4 rounded-2xl bg-[#060a14] border border-slate-800">
                                    <div className="text-[10px] font-bold text-slate-500 uppercase">Nodo en Obsidian</div>
                                    <div className="text-purple-400 font-mono font-bold mt-1">[[ {selectedProj.obsidianNode} ]]</div>
                                </div>
                                <div className="p-4 rounded-2xl bg-[#060a14] border border-slate-800 flex items-center justify-between">
                                    <div>
                                        <div className="text-[10px] font-bold text-slate-500 uppercase">Conversation ID</div>
                                        <div className="font-mono text-cyan-300 mt-0.5 text-[11px] truncate max-w-[180px]">
                                            {selectedProj.conversationId}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleCopy(selectedProj.conversationId)}
                                        className="p-2 rounded-xl bg-slate-800 hover:bg-cyan-500 hover:text-black transition cursor-pointer"
                                        title="Copiar ID"
                                    >
                                        {copiedId === selectedProj.conversationId ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                            <button
                                onClick={() => setSelectedProj(null)}
                                className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-black uppercase tracking-wider hover:bg-slate-700 transition cursor-pointer"
                            >
                                Cerrar
                            </button>
                            <button
                                onClick={() => {
                                    playNeonClick();
                                    alert(`Directiva enviada a ${selectedProj.assignedAgent}: "Priorizar avance hacia Producción"`);
                                    setSelectedProj(null);
                                }}
                                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-black text-xs uppercase tracking-wider hover:scale-105 transition shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center gap-2 cursor-pointer"
                            >
                                <Zap size={14} /> Transmitir Directiva
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BunkerTacticoPage;
