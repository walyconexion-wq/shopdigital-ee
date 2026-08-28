import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
    Cpu, Shield, ShieldCheck, Zap, Radio, Database, Users, 
    LayoutGrid, Target, Activity, TrendingUp, Sparkles, Terminal, 
    ExternalLink, CheckCircle2, Clock, AlertTriangle, Copy, Check,
    Layers, Compass, Flame, ArrowUpRight, BarChart3, Bot, ChevronLeft,
    BookOpen, Network, RefreshCw, Plus, FileText, Lock, Search,
    Send, UserCheck, CheckCheck, FolderKanban, Crown, Trophy,
    ScrollText, Award, Lightbulb, Rocket, Milestone, ShieldAlert,
    Calendar, Eye, HelpCircle, ChevronRight, X
} from 'lucide-react';
import { playNeonClick } from '../utils/audio';
import { NeuralNetworkCanvas } from '../components/NeuralNetworkCanvas';
import { NeonMindmapDiagram } from '../components/NeonMindmapDiagram';

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

export interface ChronogramEntry {
    id: string;
    title: string;
    timestamp: string;
    dateFormatted: string;
    month: string;
    agent: string;
    pillar: 'ShopDigital' | 'Comunidad Faro de Luz' | 'Fundación Valle de Luz' | 'Ministerio Caminos de Fe';
    pillarBadge: string;
    summary: string;
    impact: string;
    obsidianNode: string;
    stage: 'produccion' | 'laboratorio' | 'forja' | 'obsidian';
    tags: string[];
}

export interface EcosystemSuperpower {
    id: string;
    name: string;
    category: 'inteligencia' | 'seguridad' | 'scraping' | 'automatizacion' | 'infraestructura' | 'diseno';
    status: 'activo' | 'conectado' | 'desplegado';
    icon: string;
    badge: string;
    badgeColor: string;
    summary: string;
    keyFeatures: string[];
    assignedAgents: string[];
    obsidianDoc: string;
    exampleDirectives: string[];
    techStack: string;
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
        title: 'Clonación Fractal Automatizada de Municipios',
        date: 'Agosto 2026',
        metric: '< 10 min por zona',
        description: 'Inyección autónoma de plantillas regionales con ADN zonal dinámico (Traslasierra y Patagonia 7 Lagos).',
        badge: 'Expansión Relámpago',
        icon: Rocket
    },
    {
        id: 'ach-05',
        title: 'Forja Doberman 2.0 y Protocolo de Inmutabilidad',
        date: 'Agosto 2026',
        metric: '100% Blindaje de Datos',
        description: 'Protección de colecciones maestras y auditoría automatizada en cada pull request.',
        badge: 'Ciberseguridad Total',
        icon: ShieldCheck
    }
];

// 📅 BITÁCORA MAESTRA HISTÓRICA POR FECHAS Y HORAS
const CHRONOGRAM_ENTRIES: ChronogramEntry[] = [
    {
        id: 'log-01',
        title: 'Afinamiento de Cabecera Slim & Habilitación de Scroll Suave en Tablero Maestro',
        timestamp: '2026-08-28 17:58:26',
        dateFormatted: 'Viernes 28 de Agosto, 2026',
        month: 'Agosto 2026',
        agent: 'Luz 01 (Orquestadora Central)',
        pillar: 'ShopDigital',
        pillarBadge: 'border-cyan-400 bg-cyan-500/20 text-cyan-300',
        summary: 'Rediseño de la cabecera del Tablero Maestro a barra compacta de 45px con botón de retorno, reloj e integración de fixed inset-0 para deslizamiento suave e ilimitado.',
        impact: '90% más área visual en pantalla y scroll táctil/ratón 100% fluido',
        obsidianNode: 'HISTORIAL_MEJORAS_TABLERO_MAESTRO_SNC2',
        stage: 'laboratorio',
        tags: ['UX/UI', 'Responsive', 'Tablero Maestro', 'Scroll Fix']
    },
    {
        id: 'log-02',
        title: 'Liberación Panorámica Widescreen PC de Tablero Maestro fuera de Jaula Móvil',
        timestamp: '2026-08-28 17:42:09',
        dateFormatted: 'Viernes 28 de Agosto, 2026',
        month: 'Agosto 2026',
        agent: 'Luz 01 (Orquestadora Central)',
        pillar: 'ShopDigital',
        pillarBadge: 'border-cyan-400 bg-cyan-500/20 text-cyan-300',
        summary: 'Desacople de la ruta /tablero-maestro del contenedor Layout consumidor que forzaba max-w-md, expandiéndola a pantalla completa (max-w-7xl) en monitores de PC.',
        impact: 'Aprovechamiento total de monitores de escritorio en 4 columnas',
        obsidianNode: 'HISTORIAL_MEJORAS_TABLERO_MAESTRO_SNC2',
        stage: 'laboratorio',
        tags: ['Router', 'Widescreen', 'Arquitectura']
    },
    {
        id: 'log-03',
        title: 'Consagración de Strix-AI Pentesting Autónomo & Fortaleza Doberman 2.0',
        timestamp: '2026-08-28 06:04:44',
        dateFormatted: 'Viernes 28 de Agosto, 2026',
        month: 'Agosto 2026',
        agent: 'Thor & Vortex (SecOps) + Bruno (Backend)',
        pillar: 'ShopDigital',
        pillarBadge: 'border-cyan-400 bg-cyan-500/20 text-cyan-300',
        summary: 'Integración del framework Open-Source usestrix/strix (59k ⭐) para Red Teaming multi-agente, hallazgo de vulnerabilidades y generación autónoma de parches.',
        impact: 'Bóveda de ciberseguridad militar con simulación de ataques en vivo',
        obsidianNode: 'SUPERPODER_STRIX_AI_PENTESTING_FORTALEZA_DOBERMAN_SNC2',
        stage: 'produccion',
        tags: ['Ciberseguridad', 'Pentesting', 'Strix-AI', 'Doberman']
    },
    {
        id: 'log-04',
        title: 'Inyección de Superpoderes Agénticos (Agent-Reach v1.5.0, Firecrawl MCP & Playwright)',
        timestamp: '2026-08-28 05:35:04',
        dateFormatted: 'Viernes 28 de Agosto, 2026',
        month: 'Agosto 2026',
        agent: 'Luz 01 & Director Waly',
        pillar: 'ShopDigital',
        pillarBadge: 'border-cyan-400 bg-cyan-500/20 text-cyan-300',
        summary: 'Instalación de uv Python 3.12, yt-dlp, Exa AI semántico, Jina Reader y registro de skill global agent-reach en Antigravity para todo el enjambre.',
        impact: 'Ojos, Manos y Acceso universal a la Web sin costos de APIs',
        obsidianNode: 'SUPERPODERES_AGENTICOS_SNC2_AGENT_REACH_FIRECRAWL_PLAYWRIGHT',
        stage: 'produccion',
        tags: ['Superpoderes', 'Agent-Reach', 'Firecrawl', 'Playwright']
    },
    {
        id: 'log-05',
        title: 'Consagración de los 3 Búnkeres Institucionales Faro de Luz y Manifiesto Maestro',
        timestamp: '2026-08-27 22:30:15',
        dateFormatted: 'Jueves 27 de Agosto, 2026',
        month: 'Agosto 2026',
        agent: 'Luz 01, Luz 02, Luz 03, Luz 04',
        pillar: 'Comunidad Faro de Luz',
        pillarBadge: 'border-emerald-400 bg-emerald-500/20 text-emerald-300',
        summary: 'Indexación de las 3 agentes en Antigravity (Luz 02 Faro, Luz 03 Fundación, Luz 04 Ministerio) y redacción del Manifiesto Maestro con planos de Traslasierra en Obsidian.',
        impact: 'Ecosistema de 4 Pilares 100% coordinado e interconectado',
        obsidianNode: 'MANIFIESTO_MAESTRO_ECOSISTEMA_FARO_DE_LUZ_SNC2',
        stage: 'produccion',
        tags: ['Ecosistema', 'Faro de Luz', 'Fundación', 'Ministerio', 'Obsidian']
    },
    {
        id: 'log-05a',
        title: 'Diseño de Logística Territorial para Parajes Vulnerables y Distribución con Hilux/Sprinter',
        timestamp: '2026-08-26 15:20:00',
        dateFormatted: 'Miércoles 26 de Agosto, 2026',
        month: 'Agosto 2026',
        agent: 'Luz 03 (Brazo Social & Logística)',
        pillar: 'Fundación Valle de Luz',
        pillarBadge: 'border-amber-400 bg-amber-500/20 text-amber-300',
        summary: 'Mapeo de rutas de acceso a comedores y parajes de montaña en Traslasierra, optimizando la cadena de donaciones y combustible.',
        impact: 'Cobertura directa a familias vulnerables y asistencia comunitaria',
        obsidianNode: 'MANIFIESTO_MAESTRO_ECOSISTEMA_FARO_DE_LUZ_SNC2',
        stage: 'forja',
        tags: ['Fundación', 'Logística', 'Acción Social', 'Hilux']
    },
    {
        id: 'log-05b',
        title: 'Configuración del Rider Técnico de Audio Portátil y Misiones de Culto en Plazas',
        timestamp: '2026-08-25 21:00:00',
        dateFormatted: 'Martes 25 de Agosto, 2026',
        month: 'Agosto 2026',
        agent: 'Luz 04 (Streaming, Audio & Legal)',
        pillar: 'Ministerio Caminos de Fe',
        pillarBadge: 'border-purple-400 bg-purple-500/20 text-purple-300',
        summary: 'Armado del setup de sonido portátil con microfonía inalámbrica, consolas y streaming satelital para campañas de adoración y cultos.',
        impact: 'Evangelización de impacto masivo en plazas y parajes rurales',
        obsidianNode: 'MANIFIESTO_MAESTRO_ECOSISTEMA_FARO_DE_LUZ_SNC2',
        stage: 'forja',
        tags: ['Ministerio', 'Sonido', 'Streaming', 'Culto']
    },
    {
        id: 'log-05c',
        title: 'Dimensionamiento del Domo Geodésico Central (Frecuencia 4/6) y Banco de Baterías de Litio',
        timestamp: '2026-08-23 17:45:00',
        dateFormatted: 'Domingo 23 de Agosto, 2026',
        month: 'Agosto 2026',
        agent: 'Luz 02 (Desarrollo Comunitario)',
        pillar: 'Comunidad Faro de Luz',
        pillarBadge: 'border-emerald-400 bg-emerald-500/20 text-emerald-300',
        summary: 'Cálculo de la estructura geodésica central, distribución de los 6 containers habitacionales y dimensionamiento del parque solar fotovoltaico.',
        impact: 'Autonomía energética 100% renovable y centro de formación',
        obsidianNode: 'MANIFIESTO_MAESTRO_ECOSISTEMA_FARO_DE_LUZ_SNC2',
        stage: 'forja',
        tags: ['Ecotecnología', 'Domo Geodésico', 'Energía Solar', 'Traslasierra']
    },
    {
        id: 'log-06',
        title: 'Unificación y Blindaje de Modo Día Crema 3D en Catálogo, Home y Descuentos',
        timestamp: '2026-08-27 02:07:52',
        dateFormatted: 'Jueves 27 de Agosto, 2026',
        month: 'Agosto 2026',
        agent: 'Ari (UI/UX) + Luz 01',
        pillar: 'ShopDigital',
        pillarBadge: 'border-cyan-400 bg-cyan-500/20 text-cyan-300',
        summary: 'Erradicación de modos oscuros mezclados, adopción del blanco tecnológico y crema táctil en Home, Category, ShopDetail, ShopMenu y DiscountsPage.',
        impact: 'Velocidad de render 40% superior y nitidez absoluta bajo la luz solar',
        obsidianNode: 'GENERAL_ARI_UX_UI',
        stage: 'produccion',
        tags: ['UI/UX', 'Modo Día', 'Neumorfismo', 'Despliegue']
    },
    {
        id: 'log-07',
        title: 'Despliegue de Jarvis-OS Dashboard & Telemetría Agéntica Central',
        timestamp: '2026-08-24 18:30:00',
        dateFormatted: 'Lunes 24 de Agosto, 2026',
        month: 'Agosto 2026',
        agent: 'Luz 01 (Orquestadora Central)',
        pillar: 'ShopDigital',
        pillarBadge: 'border-cyan-400 bg-cyan-500/20 text-cyan-300',
        summary: 'Lanzamiento de la interfaz Jarvis-OS (/jarvis) con consola holográfica, monitoreo de tokens, automatizaciones agénticas y puente de comando.',
        impact: 'Control y supervisión en vivo del cerebro de Inteligencia Artificial',
        obsidianNode: 'LUZ_01_ORQUESTADORA',
        stage: 'produccion',
        tags: ['Jarvis', 'Dashboard', 'Agentes']
    },
    {
        id: 'log-08',
        title: 'Forja del Búnker Táctico y Estado Mayor SNC 2.0 con Lienzo 3D',
        timestamp: '2026-08-21 20:00:00',
        dateFormatted: 'Viernes 21 de Agosto, 2026',
        month: 'Agosto 2026',
        agent: 'Luz 01 & Director Waly',
        pillar: 'ShopDigital',
        pillarBadge: 'border-cyan-400 bg-cyan-500/20 text-cyan-300',
        summary: 'Creación del Estado Mayor Digital con matriz de 12 agentes, Lienzo 3D en vivo, Tablero Kanban de proyectos y sincronización con Obsidian.',
        impact: 'Mando militar unificado y visibilidad total del desarrollo',
        obsidianNode: 'BUNKER_TACTICO_Y_ESTRATEGICO_SNC2',
        stage: 'produccion',
        tags: ['Búnker Táctico', 'Lienzo 3D', 'Estado Mayor']
    }
];

// ⚡ BÓVEDA DEL ARSENAL DE SUPERPODERES (10 CAPACIDADES)
const ECOSYSTEM_SUPERPOWERS: EcosystemSuperpower[] = [
    {
        id: 'sp-01',
        name: 'Agent-Reach (v1.5.0)',
        category: 'scraping',
        status: 'activo',
        icon: '👁️',
        badge: 'Ojos Web Universales',
        badgeColor: 'border-cyan-400 bg-cyan-500/20 text-cyan-300',
        summary: 'Capa de capacidad que le da al enjambre acceso para leer, buscar y extraer datos de cualquier web, Twitter, Reddit, YouTube y RSS sin pagar APIs.',
        keyFeatures: [
            'Lectura limpia de cualquier URL con Jina Reader',
            'Extracción instantánea de subtítulos de YouTube con yt-dlp',
            'Búsqueda semántica global con Exa AI (vía mcporter)',
            'Auto-diagnóstico en tiempo real con agent-reach doctor'
        ],
        assignedAgents: ['Luz 01 (ShopDigital)', 'Luz 02 (Faro de Luz)', 'Luz 03 (Fundación)', 'Luz 04 (Ministerio)'],
        obsidianDoc: 'SUPERPODERES_AGENTICOS_SNC2_AGENT_REACH_FIRECRAWL_PLAYWRIGHT',
        exampleDirectives: [
            'Luz, leeme este artículo con Jina Reader y extraeme los 3 puntos clave.',
            'Luz 02, buscame en YouTube cómo calcular el banco de baterías de litio y pasame la transcripción.',
            'Luz 03, hacé una búsqueda semántica con Exa de proveedores de alimentos mayoristas en Traslasierra.'
        ],
        techStack: 'Python 3.12 (uv) + yt-dlp + mcporter + Exa AI + Jina Reader'
    },
    {
        id: 'sp-02',
        name: 'Firecrawl (MCP Server)',
        category: 'scraping',
        status: 'activo',
        icon: '🔥',
        badge: 'Digestor Web a Markdown',
        badgeColor: 'border-orange-400 bg-orange-500/20 text-orange-300',
        summary: 'Convierte sitios web complejos con JavaScript pesado, catálogos de comercio y cartas de restaurantes en Markdown estructurado limpio.',
        keyFeatures: [
            'Extracción automática de cartas y listas de precios de comercios',
            'Bypass de estructuras dinámicas y renderizado headless',
            'Integración directa vía Model Context Protocol (MCP)'
        ],
        assignedAgents: ['Luz 01 (ShopDigital)', 'Melisa (Marketing)', 'Bruno (Backend)'],
        obsidianDoc: 'SUPERPODERES_AGENTICOS_SNC2_AGENT_REACH_FIRECRAWL_PLAYWRIGHT',
        exampleDirectives: [
            'Luz, escaneá la web de este restaurante y convertí su carta en un JSON para sembrar en ShopDigital.',
            'Bruno, crawleá este sitio de distribuidores mayoristas de bebidas y extraé la tabla de precios.'
        ],
        techStack: 'Node.js + Model Context Protocol + Headless Parser'
    },
    {
        id: 'sp-03',
        name: 'Playwright Automation',
        category: 'automatizacion',
        status: 'activo',
        icon: '🎭',
        badge: 'Manos Ejecutivas QA',
        badgeColor: 'border-emerald-400 bg-emerald-500/20 text-emerald-300',
        summary: 'Motor de automatización que controla navegadores reales (Chromium) para ejecutar pruebas de estrés, clicks, formularios y capturas.',
        keyFeatures: [
            'Batería de pruebas E2E automáticas para compras y cupones',
            'Captura de screenshots de alta fidelidad para el Estado Mayor',
            'Simulación de usuarios reales en móviles y PC de escritorio'
        ],
        assignedAgents: ['Thor & Vortex (SecOps)', 'Ari (Frontend)', 'Luz 01'],
        obsidianDoc: 'SUPERPODERES_AGENTICOS_SNC2_AGENT_REACH_FIRECRAWL_PLAYWRIGHT',
        exampleDirectives: [
            'Thor, corré el test E2E de Playwright para validar que la descarga PWA funciona sin errores.',
            'Ari, generá screenshots automáticos en resolución móvil y desktop de la nueva Home.'
        ],
        techStack: '@playwright/test + Chromium Headless + TypeScript'
    },
    {
        id: 'sp-04',
        name: 'Strix-AI Pentesting (59k ⭐)',
        category: 'seguridad',
        status: 'activo',
        icon: '🦅',
        badge: 'Red Team Multi-Agente',
        badgeColor: 'border-red-400 bg-red-500/20 text-red-300',
        summary: 'Framework de Inteligencia Artificial para penetration testing autónomo. Múltiples agentes atacan éticamente la app y generan parches de código inmediatos.',
        keyFeatures: [
            'Auditoría de reglas de Firestore y claves de sesión',
            'Simulación de fraude en canje de cupones y balances VIP',
            'Detección de Cross-Site Scripting (XSS) e inyecciones',
            'Generación de parches de código 0-day directos'
        ],
        assignedAgents: ['Thor & Vortex (BK 06)', 'Bruno (BK 05)', 'Luz 01'],
        obsidianDoc: 'SUPERPODER_STRIX_AI_PENTESTING_FORTALEZA_DOBERMAN_SNC2',
        exampleDirectives: [
            'Thor, ejecutá un pentesting con Strix sobre las rutas de facturas y el canje de saldo VIP.',
            'Bruno, revisá el reporte de Strix y aplicá los parches de seguridad recomendados en Firestore.'
        ],
        techStack: 'Strix AI Multi-Agent + Docker Sandboxes + MCP Server'
    },
    {
        id: 'sp-05',
        name: 'Sistema Doberman 2.0',
        category: 'seguridad',
        status: 'activo',
        icon: '🐕',
        badge: 'Escudo Blue Team & Guardián',
        badgeColor: 'border-amber-400 bg-amber-500/20 text-amber-300',
        summary: 'Escudo guardián que protege las colecciones maestras (Towns, Comercios), audita en tiempo real las rutas y bloquea intentos de modificación no autorizados.',
        keyFeatures: [
            'Protección estricta de la colección Towns en Firestore',
            'Badge de integridad Doberman en cabeceras de búnkeres',
            'Aislamiento de sesiones y prevención de reseteos en producción'
        ],
        assignedAgents: ['Thor & Vortex (BK 06)', 'Javi (Mantenimiento)', 'Luz 01'],
        obsidianDoc: 'GENERAL_THOR_SECOPS',
        exampleDirectives: [
            'Thor, verificá que el protocolo de inmutabilidad Doberman esté activo en la zona Esteban Echeverría.',
            'Luz, auditá que ninguna ruta de edición esté expuesta sin ProtectedRoute.'
        ],
        techStack: 'Firebase Security Rules + ProtectedRoute + AuthContext'
    },
    {
        id: 'sp-06',
        name: 'Cerebro Obsidian MCP (SSE)',
        category: 'inteligencia',
        status: 'activo',
        icon: '🧠',
        badge: 'Segundo Cerebro Inmutable',
        badgeColor: 'border-purple-400 bg-purple-500/20 text-purple-300',
        summary: 'Enlace neural en tiempo real con la bóveda de Obsidian Vault para lectura, escritura, vinculación de grafos y almacenamiento de manifiestos.',
        keyFeatures: [
            'Documentación instantánea de avances y decisiones',
            'Matriz maestra de conversaciones e IDs de agentes',
            'Grafo de conocimiento transversal para los 4 pilares'
        ],
        assignedAgents: ['Todos los 12 Agentes del Enjambre', 'Luz 02', 'Luz 03', 'Luz 04'],
        obsidianDoc: 'MATRIZ_MAESTRA_CONVERSACIONES_SNC2',
        exampleDirectives: [
            'Luz, registrá el balance de la jornada en la nota de Obsidian HISTORIAL_MEJORAS_TABLERO_MAESTRO_SNC2.',
            'Luz 02, consultá el MANIFIESTO_MAESTRO_ECOSISTEMA_FARO_DE_LUZ para revisar el plano del domo.'
        ],
        techStack: 'Obsidian MCP Server (SSE) + Markdown + KaTeX + Graph View'
    },
    {
        id: 'sp-07',
        name: 'Omni-Gateway Multi-Modelo',
        category: 'infraestructura',
        status: 'activo',
        icon: '🤖',
        badge: 'DeepSeek + Qwen + Gemini',
        badgeColor: 'border-sky-400 bg-sky-500/20 text-sky-300',
        summary: 'Enrutador inteligente de Inteligencia Artificial que balancea consultas a DeepSeek-V3 ($0.14/1M), Qwen y Gemini con 98% de ahorro en tokens.',
        keyFeatures: [
            'Enrutamiento automático según la complejidad de la tarea',
            'Fallback tolerante a fallos entre OpenRouter y DeepSeek directo',
            'Generación de contenido de marketing masivo a costo $0.00'
        ],
        assignedAgents: ['Bruno (BK 05)', 'Melisa (BK 03)', 'Mateo (BK 01)'],
        obsidianDoc: 'GENERAL_BRUNO_BACKEND',
        exampleDirectives: [
            'Bruno, balanceá la generación de descripciones comerciales a través de DeepSeek-V3.',
            'Melisa, redactá 24 copys publicitarios usando el Omni-Gateway sin costo de tokens.'
        ],
        techStack: 'DeepSeek API + OpenRouter + Vercel Serverless Gateway'
    },
    {
        id: 'sp-08',
        name: 'Clonación Fractal Regional',
        category: 'infraestructura',
        status: 'activo',
        icon: '🧬',
        badge: 'Expansión de Zonas en 10 min',
        badgeColor: 'border-teal-400 bg-teal-500/20 text-teal-300',
        summary: 'Motor de siembra y replicación que clona municipios y regiones completas (Ezeiza, Traslasierra, Patagonia 7 Lagos) con catálogo e identidad zonal.',
        keyFeatures: [
            'Siembra hiperrealista de comercios y clientes VIP en 1 click',
            'Asignación automática de ADN regional y coordenadas',
            'Aislamiento completo de bases de datos por municipio'
        ],
        assignedAgents: ['Ely (BK 07)', 'Javi (BK 09)', 'Luz 01'],
        obsidianDoc: 'LABORATORIO_SHOPDIGITAL',
        exampleDirectives: [
            'Ely, cloná la plantilla regional de Traslasierra para habilitar la zona San Javier.',
            'Luz, ejecutá la siembra de muestra de 24 comercios VIP en Ezeiza.'
        ],
        techStack: 'Firebase Firestore Batching + Regional Templates JSON'
    },
    {
        id: 'sp-09',
        name: 'Sinfonía Chameleon Theme Editor',
        category: 'diseno',
        status: 'activo',
        icon: '🎨',
        badge: 'Identidad Zonal Dinámica',
        badgeColor: 'border-pink-400 bg-pink-500/20 text-pink-300',
        summary: 'Sistema que adapta los colores primarios, temas estacionales, texturas vectoriales y glow en tiempo real según la localidad que visita el usuario.',
        keyFeatures: [
            'Cambio dinámico de paleta: Celeste Ezeiza, Violeta Echeverría, Esmeralda Traslasierra',
            'Editor visual en vivo desde el Tablero Maestro (/configuracion)',
            'Fondos tecnológicos SVG optimizados para GPU'
        ],
        assignedAgents: ['Ari (BK 02)', 'Luz 01'],
        obsidianDoc: 'GENERAL_ARI_UX_UI',
        exampleDirectives: [
            'Ari, calibrá el color primario de Traslasierra a verde esmeralda #10b981.',
            'Luz, verificá que el modo camaleón responda al townId de la URL.'
        ],
        techStack: 'Tailwind CSS JIT + CSS Custom Properties + React State'
    },
    {
        id: 'sp-10',
        name: 'Transmisiones WebSockets & PWA 1-Click',
        category: 'automatizacion',
        status: 'activo',
        icon: '📻',
        badge: 'Streaming & Instalación Rápida',
        badgeColor: 'border-rose-400 bg-rose-500/20 text-rose-300',
        summary: 'Módulo de streaming en vivo de la cabina de mandos con avisos de broadcast a comercios y botón de instalación directa PWA en celulares.',
        keyFeatures: [
            'Avisos de broadcast en tiempo real para todos los comerciantes',
            'Descarga directa PWA sin pasar por menús ocultos de 3 puntitos',
            'Consola de transmisión en vivo (/director/transmision-en-vivo)'
        ],
        assignedAgents: ['Cuby (BK 08)', 'Max (BK 11)', 'Luz 04 (Ministerio)'],
        obsidianDoc: 'BUNKER_CONFIG_AND_SKILLS_MASTER_SNC2',
        exampleDirectives: [
            'Cuby, emití un aviso broadcast a todos los comercios sobre el nuevo sorteo VIP.',
            'Luz 04, prepará la consola de audio para el streaming del culto de campaña.'
        ],
        techStack: 'WebSockets + Service Workers + Web App Manifest + Audio Web API'
    }
];

const SWARM_AGENTS: SwarmAgent[] = [
    {
        id: 'mateo-finanzas',
        name: 'MATEO',
        roleTitle: 'Oficial de Inteligencia Financiera & Tokenomics',
        bunkerName: 'Búnker 01: Viabilidad & Tokenomics',
        frente: 'infraestructura',
        status: 'produccion',
        conversationId: '88340a8c-838a-4835-99d9-6b77e911307b',
        notebookUrl: 'https://notebooklm.google.com/notebook/88340a8c-838a-4835-99d9-6b77e911307b',
        notebookSources: 12,
        activeSkill: 'tokenomics-modeling + financial-viability-v2',
        obsidianNode: 'GENERAL_MATEO_FINANZAS',
        lastMission: 'Modelado del ROI de comercios y proyección de saldo VIP',
        progressPercentage: 92,
        color: '#f59e0b',
        icon: TrendingUp
    },
    {
        id: 'ari-ui-ux',
        name: 'ARI',
        roleTitle: 'Oficial de Frontend & UI/UX Neumórfico 3D',
        bunkerName: 'Búnker 02: Experiencia & UI/UX',
        frente: 'experiencia',
        status: 'laboratorio',
        conversationId: '6c8e16ba-10a9-4a34-a4d1-be97865f38f7',
        notebookUrl: 'https://notebooklm.google.com/notebook/6c8e16ba-10a9-4a34-a4d1-be97865f38f7',
        notebookSources: 28,
        activeSkill: 'shadcn-ui + tailwind-v4-expert + 3d-glassmorphism',
        obsidianNode: 'GENERAL_ARI_UX_UI',
        lastMission: 'Diseño neumórfico Crema & Caramelo HD de las Interfaces 1, 2 y 3',
        progressPercentage: 88,
        color: '#ec4899',
        icon: Sparkles
    },
    {
        id: 'melisa-marketing',
        name: 'MELISA',
        roleTitle: 'Directora de Crecimiento, Copywriting & Campañas',
        bunkerName: 'Búnker 03: Marketing & Expansión',
        frente: 'expansion',
        status: 'laboratorio',
        conversationId: 'e2b0ec83-c9bb-44fe-9752-1a21eabd3f18',
        notebookUrl: 'https://notebooklm.google.com/notebook/e2b0ec83-c9bb-44fe-9752-1a21eabd3f18',
        notebookSources: 42,
        activeSkill: 'notebooklm-deepseek-ingestion + marketing-automation-v3',
        obsidianNode: 'BUNKER_CONFIG_AND_SKILLS_MASTER_SNC2',
        lastMission: 'Estructuración de campaña masiva de 24 rubros comerciales',
        progressPercentage: 95,
        color: '#a855f7',
        icon: Target
    },
    {
        id: 'bruno-backend',
        name: 'BRUNO',
        roleTitle: 'Arquitecto de Backend, Datastore & EVE Gateway',
        bunkerName: 'Búnker 05: Infraestructura Core',
        frente: 'infraestructura',
        status: 'produccion',
        conversationId: 'b9472e3a-7a52-4734-aa1b-53c829e06180',
        notebookUrl: 'https://notebooklm.google.com/notebook/b9472e3a-7a52-4734-aa1b-53c829e06180',
        notebookSources: 31,
        activeSkill: 'deepseek-omni-gateway + firebase-admin-expert',
        obsidianNode: 'GENERAL_BRUNO_BACKEND',
        lastMission: 'Balanceo automático DeepSeek/Qwen y enrutador EVE sin caídas',
        progressPercentage: 97,
        color: '#06b6d4',
        icon: Database
    },
    {
        id: 'thor-secops',
        name: 'THOR & VORTEX',
        roleTitle: 'Comandantes de Ciberseguridad, QA & Protocolo Doberman',
        bunkerName: 'Búnker 06: Ciberseguridad & QA',
        frente: 'blindaje',
        status: 'produccion',
        conversationId: '04c3114d-9ca3-4882-a010-85f8c6ebf8b6',
        notebookUrl: 'https://notebooklm.google.com/notebook/04c3114d-9ca3-4882-a010-85f8c6ebf8b6',
        notebookSources: 18,
        activeSkill: 'doberman-sentinel-v2 + firestore-rules-audit',
        obsidianNode: 'GENERAL_THOR_SECOPS',
        lastMission: 'Blindaje inmutable de Towns y erradicación de errores TypeScript',
        progressPercentage: 99,
        color: '#10b981',
        icon: ShieldCheck
    },
    {
        id: 'ely-clonacion',
        name: 'ELY',
        roleTitle: 'Oficial de Clonación Fractal & Expansión Regional',
        bunkerName: 'Búnker 07: Clonación Fractal',
        frente: 'expansion',
        status: 'laboratorio',
        conversationId: 'b1ca1b6d-a719-4f36-8a03-61e8c1ea9825',
        notebookUrl: 'https://notebooklm.google.com/notebook/b1ca1b6d-a719-4f36-8a03-61e8c1ea9825',
        notebookSources: 14,
        activeSkill: 'protocolo-clonacion-fractal + multi-tenant-builder',
        obsidianNode: 'LABORATORIO_SHOPDIGITAL',
        lastMission: 'Inyección de semilleros para Traslasierra y Patagonia 7 Lagos',
        progressPercentage: 90,
        color: '#14b8a6',
        icon: Rocket
    },
    {
        id: 'cuby-transmision',
        name: 'CUBY',
        roleTitle: 'Oficial de WebSockets & Transmisiones PWA',
        bunkerName: 'Búnker 08: Transmisión & Red',
        frente: 'infraestructura',
        status: 'produccion',
        conversationId: '98d36329-8735-4309-847f-8e2b20755913',
        notebookUrl: 'https://notebooklm.google.com/notebook/98d36329-8735-4309-847f-8e2b20755913',
        notebookSources: 10,
        activeSkill: 'webrtc-streamer + pwa-push-notifications',
        obsidianNode: 'BUNKER_CONFIG_AND_SKILLS_MASTER_SNC2',
        lastMission: 'Canal de audio en vivo y notificaciones de broadcast a comercios',
        progressPercentage: 85,
        color: '#f43f5e',
        icon: Radio
    },
    {
        id: 'javi-mantenimiento',
        name: 'JAVI',
        roleTitle: 'Oficial de Mantenimiento General & Salud de BD',
        bunkerName: 'Búnker 09: Mantenimiento & Soporte',
        frente: 'infraestructura',
        status: 'produccion',
        conversationId: '03aa2a10-b131-452d-abb4-f01c21f95e72',
        notebookUrl: 'https://notebooklm.google.com/notebook/03aa2a10-b131-452d-abb4-f01c21f95e72',
        notebookSources: 15,
        activeSkill: 'firestore-data-cleaner + memory-leak-detector',
        obsidianNode: 'GENERAL_JAVI_MANTENIMIENTO',
        lastMission: 'Limpieza de documentos huérfanos y optimización de suscripciones',
        progressPercentage: 91,
        color: '#64748b',
        icon: CheckCircle2
    },
    {
        id: 'lore-legal',
        name: 'LORE',
        roleTitle: 'Oficial Contable, Tesorería & Marco Legal',
        bunkerName: 'Búnker 10: Contable & Legales',
        frente: 'infraestructura',
        status: 'produccion',
        conversationId: '509fde7f-4b31-4beb-abab-420a30a0973e',
        notebookUrl: 'https://notebooklm.google.com/notebook/509fde7f-4b31-4beb-abab-420a30a0973e',
        notebookSources: 22,
        activeSkill: 'afip-invoice-parser + terminos-legales-ar',
        obsidianNode: 'GENERAL_LORE_LEGALES',
        lastMission: 'Generación automática de facturas y términos de servicio 2026',
        progressPercentage: 94,
        color: '#ef4444',
        icon: Lock
    },
    {
        id: 'max-talento',
        name: 'MAX',
        roleTitle: 'Director de Embajadores & Academia de Ventas',
        bunkerName: 'Búnker 11: Recursos Humanos & Talento',
        frente: 'expansion',
        status: 'laboratorio',
        conversationId: 'd302846c-db1d-4c88-9f1d-b6e07a456d29',
        notebookUrl: 'https://notebooklm.google.com/notebook/d302846c-db1d-4c88-9f1d-b6e07a456d29',
        notebookSources: 25,
        activeSkill: 'recruitment-funnel + sales-academy-trainer',
        obsidianNode: 'GENERAL_MAX_TALENTO',
        lastMission: 'Plataforma de reclutamiento y simulador de ventas para embajadores',
        progressPercentage: 87,
        color: '#06b6d4',
        icon: Users
    },
    {
        id: 'dante-inversiones',
        name: 'DANTE',
        roleTitle: 'Oficial de Inversión Exponencial & Dossier de Capital',
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
        activeSkill: 'vercel-composition-patterns (Vercel Labs) + code-review (Matt Pocock)',
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
    const [selectedTab, setSelectedTab] = useState<'comandancia' | 'cronograma' | 'superpoderes' | 'agentes' | 'lienzo' | 'kanban' | 'obsidian'>('comandancia');
    const [selectedFrente, setSelectedFrente] = useState<string>('todos');
    const [selectedChronMonth, setSelectedChronMonth] = useState<string>('todos');
    const [selectedChronPillar, setSelectedChronPillar] = useState<string>('todos');
    const [selectedSpCategory, setSelectedSpCategory] = useState<string>('todos');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [selectedAgent, setSelectedAgent] = useState<SwarmAgent | null>(null);
    const [selectedProj, setSelectedProj] = useState<StrategicProject | null>(null);
    const [selectedSuperpower, setSelectedSuperpower] = useState<EcosystemSuperpower | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [directiveInput, setDirectiveInput] = useState<string>('');
    const [transmittedDirective, setTransmittedDirective] = useState<string | null>(null);

    // ⏰ RELOJ TÁCTICO MILITAR EN VIVO (SEGUNDO A SEGUNDO)
    const [currentClock, setCurrentClock] = useState<string>('');

    useEffect(() => {
        const updateClock = () => {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            setCurrentClock(`${year}-${month}-${day} · ${hours}:${minutes}:${seconds} ART (UTC-3)`);
        };
        updateClock();
        const timer = setInterval(updateClock, 1000);
        return () => clearInterval(timer);
    }, []);

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

    const filteredChronogram = CHRONOGRAM_ENTRIES.filter(entry => {
        const matchesMonth = selectedChronMonth === 'todos' || entry.month === selectedChronMonth;
        const matchesPillar = selectedChronPillar === 'todos' || entry.pillar === selectedChronPillar;
        const matchesSearch = searchQuery === '' ||
            entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            entry.agent.toLowerCase().includes(searchQuery.toLowerCase()) ||
            entry.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
            entry.obsidianNode.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesMonth && matchesPillar && matchesSearch;
    });

    const filteredSuperpowers = ECOSYSTEM_SUPERPOWERS.filter(sp => {
        const matchesCategory = selectedSpCategory === 'todos' || sp.category === selectedSpCategory;
        const matchesSearch = searchQuery === '' ||
            sp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            sp.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
            sp.techStack.toLowerCase().includes(searchQuery.toLowerCase()) ||
            sp.assignedAgents.some(a => a.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

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
        <div className="fixed inset-0 overflow-y-auto overflow-x-hidden bg-[#030610] text-white p-4 md:p-8 pb-56 font-sans selection:bg-cyan-500 selection:text-black z-20">
            {/* 🌌 FONDO NEURONAL EN MOVIMIENTO DINÁMICO */}
            <NeuralNetworkCanvas />

            <div className="relative z-10 max-w-7xl mx-auto">
                {/* 🌟 ENCABEZADO OFICIAL DE MANDO ESTRATÉGICO */}
                <div className="mb-8">
                    {/* BARRA SUPERIOR: BOTÓN VOLVER Y RELOJ MILITAR EN VIVO */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                        <button
                            onClick={() => { playNeonClick(); navigate(`/${townId}/tablero-maestro`); }}
                            className="px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 transition cursor-pointer"
                        >
                            <ChevronLeft size={16} /> Volver al Tablero Maestro
                        </button>

                        {/* ⏰ RELOJ TÁCTICO MILITAR EN TIEMPO REAL */}
                        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-black/70 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                            <Clock size={14} className="text-cyan-400 animate-pulse" />
                            <span className="text-[11px] font-mono font-black text-cyan-300 tracking-widest">
                                {currentClock || 'SINCRONIZANDO HORA OFICIAL...'}
                            </span>
                        </div>
                    </div>

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
                        <div className="grid grid-cols-4 gap-2 bg-[#050a17]/90 p-4 rounded-2xl border border-cyan-500/30">
                            <div className="text-center px-2.5">
                                <div className="text-[9px] uppercase font-black text-slate-400">Directivas</div>
                                <div className="text-lg font-[1000] text-amber-400">{COMMAND_DIRECTIVES.length}</div>
                            </div>
                            <div className="text-center px-2.5 border-x border-slate-800">
                                <div className="text-[9px] uppercase font-black text-slate-400">Ministros</div>
                                <div className="text-lg font-[1000] text-cyan-400">{SWARM_AGENTS.length}</div>
                            </div>
                            <div className="text-center px-2.5 border-r border-slate-800">
                                <div className="text-[9px] uppercase font-black text-slate-400">Logros</div>
                                <div className="text-lg font-[1000] text-emerald-400">{COMMAND_ACHIEVEMENTS.length}</div>
                            </div>
                            <div className="text-center px-2.5">
                                <div className="text-[9px] uppercase font-black text-slate-400">Poderes</div>
                                <div className="text-lg font-[1000] text-purple-400">{ECOSYSTEM_SUPERPOWERS.length}</div>
                            </div>
                        </div>
                    </div>

                    {/* 🎛️ SELECTOR DE VISTAS PRINCIPALES (7 PESTAÑAS TÁCTICAS) */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mt-6">
                        <div className="flex flex-wrap items-center gap-2 bg-[#0a1020] p-1.5 rounded-2xl border border-slate-800">
                            {[
                                { id: 'comandancia', label: '👑 Comandancia & Directivas', icon: Crown },
                                { id: 'cronograma', label: '📅 Cronograma Histórico', icon: Clock },
                                { id: 'superpoderes', label: '⚡ Bóveda de Superpoderes', icon: Zap },
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
                                        className={`px-3.5 md:px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer border ${
                                            selectedTab === tab.id
                                                ? 'bg-gradient-to-r from-amber-500 via-cyan-500 to-blue-600 text-black border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                                                : 'text-slate-400 border-transparent hover:text-white hover:bg-slate-800/50'
                                        }`}
                                    >
                                        <Icon size={14} /> {tab.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* FILTRO DE FRENTES & BUSCADOR (VISIBLE EN AGENTES, KANBAN, ETC.) */}
                        {(selectedTab === 'agentes' || selectedTab === 'kanban' || selectedTab === 'lienzo') && (
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

                        {/* 2. SECCIÓN: NUESTROS LOGROS CONQUISTADOS */}
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
                                            className="p-6 rounded-3xl bg-gradient-to-b from-[#0a1f1d] to-[#061214] border-2 border-emerald-500/30 hover:border-emerald-400 transition-all shadow-lg flex flex-col justify-between"
                                        >
                                            <div>
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                                        {ach.badge}
                                                    </span>
                                                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                                                        <Icon className="w-4 h-4 text-emerald-400" />
                                                    </div>
                                                </div>
                                                <h3 className="text-base font-black text-white mb-1 leading-snug">
                                                    {ach.title}
                                                </h3>
                                                <div className="text-xl font-[1000] text-emerald-400 font-mono my-2">
                                                    {ach.metric}
                                                </div>
                                                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                                                    {ach.description}
                                                </p>
                                            </div>
                                            <div className="text-[10px] text-slate-400 font-mono pt-3 border-t border-emerald-900/40">
                                                📅 {ach.date}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── VISTA 1: 📅 CRONOGRAMA HISTÓRICO & BITÁCORA DE AVANCES ─── */}
                {selectedTab === 'cronograma' && (
                    <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn">
                        {/* Cabecera del Cronograma con Filtros */}
                        <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0d162c] via-[#091122] to-[#0d162c] border-2 border-cyan-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-6 h-6 text-cyan-400" />
                                    <h2 className="text-xl font-[1000] text-white">
                                        CRONOGRAMA MAESTRO & BALANCE DE AVANCES POR FECHA
                                    </h2>
                                </div>
                                <p className="text-xs text-slate-400 mt-1">
                                    Registro cronológico inmutable de todas las tareas, parches y mejoras ejecutadas en el ecosistema.
                                </p>
                            </div>

                            {/* Filtros de Mes y Pilar */}
                            <div className="flex flex-wrap items-center gap-2">
                                {/* Filtro de Mes */}
                                <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-slate-800">
                                    {['todos', 'Agosto 2026'].map(m => (
                                        <button
                                            key={m}
                                            onClick={() => { playNeonClick(); setSelectedChronMonth(m); }}
                                            className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                                                selectedChronMonth === m ? 'bg-cyan-500 text-black shadow' : 'text-slate-400 hover:text-white'
                                            }`}
                                        >
                                            {m === 'todos' ? 'Todos los Meses' : m}
                                        </button>
                                    ))}
                                </div>

                                {/* Filtro de Pilar */}
                                <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-slate-800">
                                    {[
                                        { id: 'todos', label: 'Todos los Pilares' },
                                        { id: 'ShopDigital', label: 'ShopDigital' },
                                        { id: 'Comunidad Faro de Luz', label: 'Faro de Luz' },
                                        { id: 'Fundación Valle de Luz', label: 'Fundación' },
                                        { id: 'Ministerio Caminos de Fe', label: 'Ministerio' }
                                    ].map(p => (
                                        <button
                                            key={p.id}
                                            onClick={() => { playNeonClick(); setSelectedChronPillar(p.id); }}
                                            className={`px-2.5 py-1 rounded-lg text-[9.5px] font-bold uppercase transition-all cursor-pointer ${
                                                selectedChronPillar === p.id ? 'bg-amber-500 text-black shadow' : 'text-slate-400 hover:text-white'
                                            }`}
                                        >
                                            {p.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Línea de Tiempo / Timeline de Hitos */}
                        <div className="relative pl-6 md:pl-8 border-l-2 border-cyan-500/30 space-y-6 my-8">
                            {filteredChronogram.map((entry, idx) => (
                                <div key={entry.id} className="relative group">
                                    {/* Indicador de Nodo en la Línea de Tiempo */}
                                    <div className="absolute -left-[31px] md:-left-[39px] top-6 w-5 h-5 rounded-full bg-[#030610] border-2 border-cyan-400 flex items-center justify-center shadow-[0_0_12px_rgba(6,182,212,0.6)] group-hover:scale-125 transition-transform">
                                        <div className="w-2 h-2 rounded-full bg-cyan-300 animate-pulse" />
                                    </div>

                                    {/* Tarjeta del Hito Histórico */}
                                    <div className="p-5 md:p-6 rounded-3xl bg-gradient-to-r from-[#0b1429] to-[#070d1c] border border-cyan-500/30 hover:border-cyan-400/80 transition-all shadow-xl space-y-3">
                                        {/* Header de la Tarjeta */}
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${entry.pillarBadge}`}>
                                                    {entry.pillar}
                                                </span>
                                                <span className="text-[10px] font-mono text-cyan-400 font-bold">
                                                    📅 {entry.timestamp}
                                                </span>
                                                <span className="text-[9px] font-mono text-slate-500">
                                                    ({entry.dateFormatted})
                                                </span>
                                            </div>

                                            <span className={`px-2.5 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-widest self-start sm:self-auto border ${getStageBadge(entry.stage).bg}`}>
                                                {getStageBadge(entry.stage).label}
                                            </span>
                                        </div>

                                        {/* Título y Agente */}
                                        <div>
                                            <h3 className="text-base md:text-lg font-[1000] text-white group-hover:text-cyan-200 transition-colors">
                                                {entry.title}
                                            </h3>
                                            <p className="text-xs text-amber-300/90 font-mono mt-0.5">
                                                👤 Agente Responsable: <strong>{entry.agent}</strong>
                                            </p>
                                        </div>

                                        {/* Resumen e Impacto */}
                                        <div className="p-3.5 rounded-2xl bg-black/40 border border-slate-800 space-y-1.5 text-xs text-slate-300">
                                            <p className="leading-relaxed">{entry.summary}</p>
                                            <div className="text-[11px] text-emerald-400 font-bold flex items-center gap-1.5 pt-1">
                                                <span>⚡ Impacto:</span> <span>{entry.impact}</span>
                                            </div>
                                        </div>

                                        {/* Footer con Nodo Obsidian y Tags */}
                                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[10px]">
                                            <div className="flex flex-wrap items-center gap-1.5">
                                                {entry.tags.map((t, tidx) => (
                                                    <span key={tidx} className="px-2 py-0.5 rounded-md bg-white/5 text-slate-400 font-mono">
                                                        #{t}
                                                    </span>
                                                ))}
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <span className="text-slate-500 font-mono">Obsidian:</span>
                                                <button
                                                    onClick={() => handleCopy(`[[${entry.obsidianNode}]]`)}
                                                    className="px-2.5 py-1 rounded-lg bg-purple-950/60 border border-purple-500/40 text-purple-300 font-mono font-bold hover:bg-purple-900 transition flex items-center gap-1 cursor-pointer"
                                                >
                                                    <span>[[ {entry.obsidianNode} ]]</span>
                                                    {copiedId === `[[${entry.obsidianNode}]]` ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ─── VISTA 2: ⚡ BÓVEDA DEL ARSENAL DE SUPERPODERES (10 CAPACIDADES) ─── */}
                {selectedTab === 'superpoderes' && (
                    <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn">
                        {/* Cabecera del Arsenal */}
                        <div className="p-6 rounded-3xl bg-gradient-to-r from-[#170e28] via-[#0d091a] to-[#170e28] border-2 border-purple-500/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <Zap className="w-6 h-6 text-purple-400 animate-pulse" />
                                    <h2 className="text-xl font-[1000] text-white">
                                        BÓVEDA DEL ARSENAL DE SUPERPODERES (10 CAPACIDADES ACTIVAS)
                                    </h2>
                                </div>
                                <p className="text-xs text-slate-400 mt-1">
                                    Catálogo de herramientas avanzadas inyectadas para lectura web, pentesting, QA automático y orquestación.
                                </p>
                            </div>
                            <span className="px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 self-start md:self-auto">
                                🟢 {filteredSuperpowers.length} / 10 ACTIVOS EN RED
                            </span>
                        </div>

                        {/* Filtros de Categoría de Superpoderes */}
                        <div className="flex flex-wrap items-center gap-2 bg-[#090d1a] p-2 rounded-2xl border border-slate-800">
                            {[
                                { id: 'todos', label: 'Todos (10)' },
                                { id: 'scraping', label: '👁️ Ojos Web & Scraping (2)' },
                                { id: 'seguridad', label: '🛡️ Ciberseguridad & Red Team (2)' },
                                { id: 'automatizacion', label: '🎭 QA & Automatización (2)' },
                                { id: 'inteligencia', label: '🧠 IA & Cerebro Obsidian (2)' },
                                { id: 'infraestructura', label: '🧱 Infraestructura & Zonas (1)' },
                                { id: 'diseno', label: '🎨 Neumorfismo & Temas (1)' }
                            ].map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => { playNeonClick(); setSelectedSpCategory(cat.id); }}
                                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border ${
                                        selectedSpCategory === cat.id
                                            ? 'bg-purple-500 text-white border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                                            : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
                                    }`}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>

                        {/* Grilla de Superpoderes */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {filteredSuperpowers.map(sp => (
                                <div
                                    key={sp.id}
                                    className="p-6 rounded-3xl bg-gradient-to-b from-[#0e162e] to-[#070b18] border border-cyan-500/30 hover:border-cyan-400 transition-all shadow-xl flex flex-col justify-between group"
                                >
                                    <div className="space-y-3">
                                        {/* Header Card */}
                                        <div className="flex items-center justify-between">
                                            <span className="text-3xl">{sp.icon}</span>
                                            <span className={`px-2.5 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-widest border ${sp.badgeColor}`}>
                                                {sp.badge}
                                            </span>
                                        </div>

                                        {/* Título & Resumen */}
                                        <div>
                                            <h3 className="text-base font-[1000] text-white group-hover:text-cyan-300 transition-colors">
                                                {sp.name}
                                            </h3>
                                            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                                                {sp.summary}
                                            </p>
                                        </div>

                                        {/* Características Clave */}
                                        <div className="pt-2 border-t border-slate-800/80 space-y-1">
                                            {sp.keyFeatures.map((feat, fidx) => (
                                                <div key={fidx} className="flex items-start gap-1.5 text-[11px] text-slate-300">
                                                    <span className="text-cyan-400">▹</span>
                                                    <span>{feat}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Agentes Asignados */}
                                        <div className="p-2.5 rounded-xl bg-black/40 border border-slate-800">
                                            <span className="text-[8.5px] font-mono text-slate-500 uppercase tracking-widest block">Agentes con Acceso:</span>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {sp.assignedAgents.map((ag, aidx) => (
                                                    <span key={aidx} className="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 text-[9.5px] font-bold border border-cyan-500/20">
                                                        {ag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Botón de Detalles & Comandos de Ejemplo */}
                                    <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                                        <span className="text-[9px] font-mono text-purple-400 truncate max-w-[150px]">
                                            [[ {sp.obsidianDoc} ]]
                                        </span>
                                        <button
                                            onClick={() => { playNeonClick(); setSelectedSuperpower(sp); }}
                                            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black text-[10px] font-[1000] uppercase tracking-wider hover:brightness-110 active:scale-95 transition cursor-pointer flex items-center gap-1"
                                        >
                                            Ver Comandos →
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ─── VISTA 3: MATRIZ DE AGENTES (12 MINISTROS) ─── */}
                {selectedTab === 'agentes' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-fadeIn">
                        {filteredAgents.map(agent => {
                            const Icon = agent.icon;
                            const status = getStatusBadge(agent.status);
                            return (
                                <div
                                    key={agent.id}
                                    className="p-6 rounded-3xl bg-[#080d1a] border border-slate-800 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] flex flex-col justify-between group"
                                >
                                    <div>
                                        <div className="flex items-start justify-between gap-3 mb-3">
                                            <div className="flex items-center gap-3">
                                                <div 
                                                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white border"
                                                    style={{ backgroundColor: `${agent.color}20`, borderColor: `${agent.color}50` }}
                                                >
                                                    <Icon size={22} style={{ color: agent.color }} />
                                                </div>
                                                <div>
                                                    <h3 className="text-base font-black text-white group-hover:text-cyan-300 transition-colors">
                                                        {agent.name}
                                                    </h3>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                        {agent.bunkerName}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <p className="text-xs text-slate-300 font-medium mb-3">
                                            {agent.roleTitle}
                                        </p>

                                        <div className="p-3 rounded-2xl bg-[#040711] border border-slate-800/80 mb-3 space-y-1">
                                            <div className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Última Misión</div>
                                            <div className="text-xs text-slate-200 font-medium line-clamp-2">
                                                {agent.lastMission}
                                            </div>
                                        </div>

                                        {/* BARRA DE PROGRESO */}
                                        <div className="space-y-1 mb-3">
                                            <div className="flex justify-between text-[10px] font-mono">
                                                <span className="text-slate-400">Madurez Operativa</span>
                                                <span className="font-bold" style={{ color: agent.color }}>{agent.progressPercentage}%</span>
                                            </div>
                                            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                                                <div 
                                                    className="h-full rounded-full transition-all duration-1000"
                                                    style={{ width: `${agent.progressPercentage}%`, backgroundColor: agent.color }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* FOOTER CARD */}
                                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${status.bg}`}>
                                            {status.label}
                                        </span>
                                        <button
                                            onClick={() => { playNeonClick(); setSelectedAgent(agent); }}
                                            className="text-xs font-black text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition cursor-pointer"
                                        >
                                            Expediente <ChevronRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ─── VISTA 4: LIENZO TÁCTICO 3D (DIAGRAMA INTERACTIVO) ─── */}
                {selectedTab === 'lienzo' && (
                    <div className="animate-fadeIn">
                        <NeonMindmapDiagram />
                    </div>
                )}

                {/* ─── VISTA 5: TABLERO KANBAN DE PROYECTOS ─── */}
                {selectedTab === 'kanban' && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-fadeIn">
                        {[
                            { id: 'obsidian', title: '📝 En Obsidian (Plan)', color: 'border-purple-500/50 bg-purple-950/20' },
                            { id: 'forja', title: '⚡ En Forja (Código)', color: 'border-blue-500/50 bg-blue-950/20' },
                            { id: 'laboratorio', title: '🔬 En Laboratorio (Staging)', color: 'border-amber-500/50 bg-amber-950/20' },
                            { id: 'produccion', title: '🟢 En Producción (Live)', color: 'border-emerald-500/50 bg-emerald-950/20' },
                        ].map(col => {
                            const projects = filteredProjects.filter(p => p.stage === col.id);
                            return (
                                <div key={col.id} className={`p-4 rounded-3xl border-2 ${col.color} flex flex-col min-h-[500px]`}>
                                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
                                        <h3 className="text-xs font-black uppercase tracking-wider text-white">{col.title}</h3>
                                        <span className="w-6 h-6 rounded-full bg-black/60 flex items-center justify-center text-xs font-mono font-bold text-cyan-400">
                                            {projects.length}
                                        </span>
                                    </div>

                                    <div className="space-y-3 flex-1 overflow-y-auto">
                                        {projects.map(proj => (
                                            <div
                                                key={proj.id}
                                                onClick={() => { playNeonClick(); setSelectedProj(proj); }}
                                                className="p-4 rounded-2xl bg-[#060a14] border border-slate-800 hover:border-cyan-400 transition-all cursor-pointer shadow hover:shadow-cyan-500/20 group"
                                            >
                                                <span className="text-[9px] font-black uppercase text-cyan-400 tracking-wider">
                                                    {proj.assignedAgent}
                                                </span>
                                                <h4 className="text-xs font-bold text-white mt-1 group-hover:text-cyan-200 transition-colors">
                                                    {proj.title}
                                                </h4>
                                                <p className="text-[11px] text-slate-400 mt-2 line-clamp-2">
                                                    {proj.summary}
                                                </p>
                                                <div className="mt-3 pt-2 border-t border-slate-900 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                                                    <span>{proj.updatedAt}</span>
                                                    <span className="text-emerald-400 font-bold">{proj.impactMetric}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ─── VISTA 6: SINCRONÍA OBSIDIAN (SEGUNDO CEREBRO) ─── */}
                {selectedTab === 'obsidian' && (
                    <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn">
                        <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/40 via-[#0a0f24] to-cyan-950/40 border-2 border-purple-500/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <BookOpen className="w-6 h-6 text-purple-400" />
                                    <h2 className="text-xl font-[1000] text-white">
                                        SINCRONÍA NEURAL CON OBSIDIAN VAULT (SEGUNDO CEREBRO)
                                    </h2>
                                </div>
                                <p className="text-xs text-slate-300 mt-1">
                                    Toda la arquitectura, directivas y expedientes están respaldados en Markdown inmutable en tu disco local.
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-300 border border-emerald-400/50">
                                    🟢 Servidor MCP SSE Activo
                                </span>
                            </div>
                        </div>

                        {/* LISTADO DE NODOS MAESTROS EN OBSIDIAN */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[
                                { node: 'MANIFIESTO_MAESTRO_ECOSISTEMA_FARO_DE_LUZ_SNC2', title: 'Manifiesto Maestro Ecosistema Faro de Luz', desc: 'Los 4 pilares, plano radial y renders de Traslasierra.' },
                                { node: 'HISTORIAL_MEJORAS_TABLERO_MAESTRO_SNC2', title: 'Historial Mejoras Tablero Maestro', desc: 'Registro de diseño widescreen, header slim y scroll fixed.' },
                                { node: 'SUPERPODERES_AGENTICOS_SNC2_AGENT_REACH_FIRECRAWL_PLAYWRIGHT', title: 'Arsenal de Superpoderes Agénticos', desc: 'Documentación de Agent-Reach, Firecrawl y Playwright.' },
                                { node: 'SUPERPODER_STRIX_AI_PENTESTING_FORTALEZA_DOBERMAN_SNC2', title: 'Strix-AI Pentesting & Fortaleza Doberman', desc: 'Multi-agentes Red Team para hacking ético y parches.' },
                                { node: 'MATRIZ_MAESTRA_CONVERSACIONES_SNC2', title: 'Matriz Maestra de Conversaciones', desc: 'Indexación de Conversation IDs de Luz 01 a Luz 04.' },
                                { node: 'TABLERO_DE_MISIONES_Y_ORDENES_SNC2', title: 'Tablero de Misiones y Órdenes', desc: 'Registro de directivas supremas emitidas por Waly.' }
                            ].map((item, idx) => (
                                <div key={idx} className="p-5 rounded-2xl bg-[#070c18] border border-purple-500/30 hover:border-purple-400 transition-all flex flex-col justify-between">
                                    <div>
                                        <span className="text-[10px] font-mono text-purple-400 font-bold block mb-1">
                                            [[ {item.node} ]]
                                        </span>
                                        <h4 className="text-sm font-bold text-white mb-1">{item.title}</h4>
                                        <p className="text-xs text-slate-400">{item.desc}</p>
                                    </div>
                                    <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                                        <span className="text-[9px] text-slate-500 font-mono">Bóveda Obsidian</span>
                                        <button
                                            onClick={() => handleCopy(`[[${item.node}]]`)}
                                            className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 text-xs font-bold hover:bg-purple-500/40 transition cursor-pointer flex items-center gap-1"
                                        >
                                            <Copy size={12} /> Copiar Nodo
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 📋 MODAL DE DETALLE DEL EXPEDIENTE DE AGENTE */}
                {selectedAgent && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
                        <div className="w-full max-w-2xl bg-[#0b1326] border-2 border-cyan-500/50 rounded-3xl p-6 md:p-8 shadow-[0_0_50px_rgba(6,182,212,0.3)] relative">
                            <button
                                onClick={() => setSelectedAgent(null)}
                                className="absolute top-6 right-6 w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
                            >
                                ✕
                            </button>

                            <div className="flex items-center gap-4 mb-6">
                                <div 
                                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-white border-2"
                                    style={{ backgroundColor: `${selectedAgent.color}25`, borderColor: selectedAgent.color }}
                                >
                                    <selectedAgent.icon size={32} style={{ color: selectedAgent.color }} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-2xl font-[1000] text-white">{selectedAgent.name}</h2>
                                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusBadge(selectedAgent.status).bg}`}>
                                            {getStatusBadge(selectedAgent.status).label}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-300 font-medium mt-0.5">{selectedAgent.roleTitle}</p>
                                    <p className="text-[10px] text-cyan-400 font-mono">{selectedAgent.bunkerName}</p>
                                </div>
                            </div>

                            <div className="space-y-3 text-xs">
                                <div className="p-3 rounded-xl bg-[#060a14] border border-slate-800">
                                    <div className="text-[10px] font-bold text-slate-500 uppercase">Skill Principal Activa</div>
                                    <div className="font-mono text-cyan-300 mt-0.5">{selectedAgent.activeSkill}</div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="p-3 rounded-xl bg-[#060a14] border border-slate-800">
                                        <div className="text-[10px] font-bold text-slate-500 uppercase">Nodo en Obsidian</div>
                                        <div className="text-purple-400 font-mono font-bold mt-0.5">[[ {selectedAgent.obsidianNode} ]]</div>
                                    </div>
                                    <div className="p-3 rounded-xl bg-[#060a14] border border-slate-800 flex items-center justify-between">
                                        <div>
                                            <div className="text-[10px] font-bold text-slate-500 uppercase">Conversation ID</div>
                                            <div className="font-mono text-cyan-300 mt-0.5 text-[11px] truncate max-w-[180px]">
                                                {selectedAgent.conversationId}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleCopy(selectedAgent.conversationId)}
                                            className="p-2 rounded-xl bg-slate-800 hover:bg-cyan-500 hover:text-black transition cursor-pointer"
                                            title="Copiar ID"
                                        >
                                            {copiedId === selectedAgent.conversationId ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                                        </button>
                                    </div>
                                </div>

                                {/* TRANSMISOR DE DIRECTIVAS AL AGENTE */}
                                <div className="p-4 rounded-2xl bg-gradient-to-r from-[#091024] to-[#0d1633] border border-cyan-500/40 space-y-2 mt-4">
                                    <div className="flex items-center gap-2 text-cyan-300 font-black uppercase text-[10px] tracking-wider">
                                        <Send size={12} />
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
                            <div className="flex items-center justify-end pt-4 border-t border-slate-800 mt-4">
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

                {/* 📋 MODAL DE DETALLE DE SUPERPODER & COMANDOS PRÁCTICOS */}
                {selectedSuperpower && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
                        <div className="w-full max-w-2xl bg-[#0c0a1f] border-2 border-purple-500/60 rounded-3xl p-6 md:p-8 shadow-[0_0_50px_rgba(168,85,247,0.35)] relative space-y-4">
                            <button
                                onClick={() => setSelectedSuperpower(null)}
                                className="absolute top-6 right-6 w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
                            >
                                <X size={16} />
                            </button>

                            <div className="flex items-center gap-3">
                                <span className="text-4xl">{selectedSuperpower.icon}</span>
                                <div>
                                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${selectedSuperpower.badgeColor}`}>
                                        {selectedSuperpower.badge} · 🟢 ACTIVO EN RED
                                    </span>
                                    <h2 className="text-xl md:text-2xl font-[1000] text-white mt-1">
                                        {selectedSuperpower.name}
                                    </h2>
                                </div>
                            </div>

                            <p className="text-xs text-slate-300 leading-relaxed">
                                {selectedSuperpower.summary}
                            </p>

                            {/* Stack y Documentación */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                <div className="p-3 rounded-xl bg-black/50 border border-slate-800">
                                    <span className="text-[9px] font-mono text-slate-500 uppercase">Stack Tecnológico:</span>
                                    <p className="text-cyan-300 font-mono font-bold mt-0.5">{selectedSuperpower.techStack}</p>
                                </div>
                                <div className="p-3 rounded-xl bg-black/50 border border-slate-800">
                                    <span className="text-[9px] font-mono text-slate-500 uppercase">Documentación en Obsidian:</span>
                                    <p className="text-purple-400 font-mono font-bold mt-0.5">[[ {selectedSuperpower.obsidianDoc} ]]</p>
                                </div>
                            </div>

                            {/* Comandos y Directivas de Ejemplo en Lenguaje Natural */}
                            <div className="p-4 rounded-2xl bg-[#060412] border border-purple-500/30 space-y-2">
                                <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider block">
                                    💬 Ejemplos de Directivas en Lenguaje Natural (Copiá y dale la orden al Agente):
                                </span>
                                <div className="space-y-2">
                                    {selectedSuperpower.exampleDirectives.map((cmd, cidx) => (
                                        <div key={cidx} className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs text-white/90">
                                            <span className="italic">"{cmd}"</span>
                                            <button
                                                onClick={() => handleCopy(cmd)}
                                                className="p-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/40 text-purple-300 transition cursor-pointer"
                                                title="Copiar Comando"
                                            >
                                                {copiedId === cmd ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Footer Modal */}
                            <div className="flex items-center justify-end pt-2 border-t border-slate-800">
                                <button
                                    onClick={() => setSelectedSuperpower(null)}
                                    className="px-5 py-2.5 rounded-xl bg-purple-600 text-white font-[1000] uppercase text-xs tracking-wider hover:bg-purple-500 transition cursor-pointer"
                                >
                                    Entendido, Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BunkerTacticoPage;
