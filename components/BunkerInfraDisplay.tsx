import React, { useState, useEffect } from 'react';
import { 
    Shield, 
    ShieldCheck, 
    AlertTriangle, 
    Activity, 
    Cpu, 
    Bell, 
    CheckCircle2, 
    Terminal, 
    Zap, 
    RefreshCw, 
    Server, 
    Lock,
    Play,
    CreditCard,
    Key
} from 'lucide-react';
import { 
    subscribeToBunkerState, 
    dispararIncidenteProduccion, 
    resolverIncidenteManualmente,
    BunkerSystemState 
} from '../services/healthWatchdog';
import { solicitarPermisosPush, verificarPermisosPush } from '../services/pushNotifier';

export const BunkerInfraDisplay: React.FC = () => {
    const [state, setState] = useState<BunkerSystemState | null>(null);
    const [pushActive, setPushActive] = useState<boolean>(false);
    const [simulating, setSimulating] = useState<boolean>(false);
    const [resolutionNotes, setResolutionNotes] = useState<string>('');

    useEffect(() => {
        const unsubscribe = subscribeToBunkerState(setState);
        setPushActive(verificarPermisosPush());
        return () => unsubscribe();
    }, []);

    const handleEnablePush = async () => {
        const granted = await solicitarPermisosPush();
        setPushActive(granted);
    };

    const handleSimulateIncident = async (
        tipo: 'CODE_EXCEPT' | 'FIREBASE_QUOTA' | 'TOKEN_EXHAUSTED',
        modulo: string,
        errorMsg: string
    ) => {
        setSimulating(true);
        try {
            await dispararIncidenteProduccion(tipo, modulo, errorMsg);
        } finally {
            setSimulating(false);
        }
    };

    const handleManualResolve = async () => {
        if (!resolutionNotes.trim()) return;
        await resolverIncidenteManualmente(resolutionNotes);
        setResolutionNotes('');
    };

    if (!state) return null;

    const getStatusTheme = () => {
        switch (state.status) {
            case 'HEALTHY':
                return {
                    bg: 'bg-emerald-950/40 border-emerald-500/50 text-emerald-400',
                    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
                    icon: ShieldCheck,
                    label: '🟢 PRODUCCIÓN NORMAL Y PROTEGIDA'
                };
            case 'ROLLBACK_ACTIVE':
                return {
                    bg: 'bg-amber-950/50 border-amber-500/60 text-amber-300 animate-pulse',
                    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
                    icon: Zap,
                    label: '🛡️ ESCUDO ACTIVO: ROLLBACK INSTANTÁNEO (VERS. N-1)'
                };
            case 'SHADOW_LAB_REPAIRING':
                return {
                    bg: 'bg-indigo-950/60 border-indigo-500/60 text-indigo-300',
                    badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50 animate-bounce',
                    icon: Cpu,
                    label: '🛠️ LUZ INGENIERA EN QUIRÓFANO DE LAS SOMBRAS'
                };
            case 'HUMAN_INTERVENTION_REQUIRED':
                return {
                    bg: 'bg-rose-950/60 border-rose-500/70 text-rose-300',
                    badge: 'bg-rose-500/20 text-rose-300 border-rose-500/60 animate-pulse',
                    icon: AlertTriangle,
                    label: '🚨 REQUIERE INTERVENCIÓN MANUALL DEL DIRECTOR WALY'
                };
            case 'REPAIRED_NORMALIZED':
                return {
                    bg: 'bg-cyan-950/50 border-cyan-500/50 text-cyan-300',
                    badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
                    icon: CheckCircle2,
                    label: '❇️ SISTEMA AUTO-SANADO Y RESTABLECIDO'
                };
        }
    };

    const currentTheme = getStatusTheme();
    const StatusIcon = currentTheme.icon;

    return (
        <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 space-y-6 font-mono text-slate-100">
            {/* Header del Búnker */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-cyan-950/80 border border-cyan-500/40 rounded-xl text-cyan-400 shadow-lg shadow-cyan-500/10">
                            <Shield className="w-8 h-8 animate-pulse" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl sm:text-2xl font-black tracking-wider text-white uppercase">
                                    Búnker de Infraestructura & Sistemas
                                </h1>
                                <span className="px-2 py-0.5 text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-md">
                                    AUTO-HEAL v4.0
                                </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">
                                Sistema Inmunológico Digital de ShopDigital | Operación Autónoma por Agente Luz & Director Waly
                            </p>
                        </div>
                    </div>

                    {/* Botón Activar Push Celular */}
                    <button
                        onClick={handleEnablePush}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border shadow-lg ${
                            pushActive 
                                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 shadow-emerald-950' 
                                : 'bg-amber-950/60 border-amber-500/50 text-amber-300 hover:bg-amber-900/80 animate-pulse'
                        }`}
                    >
                        <Bell className="w-4 h-4" />
                        {pushActive ? 'Notificaciones Push Celular: ACTIVAS' : 'Activar Notificaciones Push Celular (PWA)'}
                    </button>
                </div>

                {/* Banner de Estado Principal */}
                <div className={`mt-6 p-4 rounded-xl border ${currentTheme.bg} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-inner`}>
                    <div className="flex items-center gap-3">
                        <StatusIcon className="w-6 h-6 shrink-0" />
                        <div>
                            <span className={`inline-block px-3 py-1 text-xs font-black rounded-lg border ${currentTheme.badge} uppercase tracking-wider`}>
                                {currentTheme.label}
                            </span>
                            <div className="text-xs text-slate-300 mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
                                <span>Versión Activa: <strong className="text-white">{state.activeVersion}</strong></span>
                                <span>Base Estable: <strong className="text-slate-400">{state.stableVersion}</strong></span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-400 bg-slate-950/60 px-4 py-2 rounded-lg border border-slate-800">
                        <div className="text-center">
                            <span className="block text-[10px] uppercase tracking-wider text-slate-500">Rollback Speed</span>
                            <span className="font-bold text-cyan-400">{state.stats.rollbackTimeMs}ms</span>
                        </div>
                        <div className="h-6 w-px bg-slate-800" />
                        <div className="text-center">
                            <span className="block text-[10px] uppercase tracking-wider text-slate-500">Auto-Sanados</span>
                            <span className="font-bold text-emerald-400">{state.stats.autoHealed}</span>
                        </div>
                        <div className="h-6 w-px bg-slate-800" />
                        <div className="text-center">
                            <span className="block text-[10px] uppercase tracking-wider text-slate-500">Incidentes</span>
                            <span className="font-bold text-slate-200">{state.stats.totalIncidents}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid Principal */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Columna Izquierda: Simulación & Laboratorio Sombras */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Panel de Simulación de Incidente */}
                    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <div className="flex items-center gap-2">
                                <Zap className="w-5 h-5 text-amber-400" />
                                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                                    Simulador de Pruebas de Estrés en Producción
                                </h2>
                            </div>
                            <span className="text-[10px] text-slate-500">DISPARADORES DE PROTOCOLO</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <button
                                disabled={simulating || state.status === 'SHADOW_LAB_REPAIRING'}
                                onClick={() => handleSimulateIncident(
                                    'CODE_EXCEPT',
                                    'MercadoPago Checkout & Payment Gateway',
                                    'TypeError: Cannot read properties of null (reading "transactionId")'
                                )}
                                className="p-3 bg-slate-950 hover:bg-slate-800/80 border border-amber-500/30 hover:border-amber-500/60 rounded-xl text-left transition-all group disabled:opacity-50"
                            >
                                <div className="flex items-center justify-between text-amber-400 mb-1">
                                    <Terminal className="w-4 h-4" />
                                    <Play className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                                </div>
                                <span className="block text-xs font-bold text-slate-200">Bug de Código</span>
                                <span className="block text-[10px] text-slate-400 mt-0.5">Probado por Luz en Sombras</span>
                            </button>

                            <button
                                disabled={simulating || state.status === 'SHADOW_LAB_REPAIRING'}
                                onClick={() => handleSimulateIncident(
                                    'FIREBASE_QUOTA',
                                    'Firestore Database Engine',
                                    'Error 429 ResourceExhausted: Quota exceeded for quota metric "Read/Write Operations"'
                                )}
                                className="p-3 bg-slate-950 hover:bg-slate-800/80 border border-rose-500/30 hover:border-rose-500/60 rounded-xl text-left transition-all group disabled:opacity-50"
                            >
                                <div className="flex items-center justify-between text-rose-400 mb-1">
                                    <CreditCard className="w-4 h-4" />
                                    <Play className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                                </div>
                                <span className="block text-xs font-bold text-slate-200">Cuota Firebase Excedida</span>
                                <span className="block text-[10px] text-slate-400 mt-0.5">Requiere Intervención Director</span>
                            </button>

                            <button
                                disabled={simulating || state.status === 'SHADOW_LAB_REPAIRING'}
                                onClick={() => handleSimulateIncident(
                                    'TOKEN_EXHAUSTED',
                                    'Agentes de IA (eTokens & Gemini API)',
                                    'Error 402 Payment Required: Token quota exhausted for billing cycle'
                                )}
                                className="p-3 bg-slate-950 hover:bg-slate-800/80 border border-purple-500/30 hover:border-purple-500/60 rounded-xl text-left transition-all group disabled:opacity-50"
                            >
                                <div className="flex items-center justify-between text-purple-400 mb-1">
                                    <Key className="w-4 h-4" />
                                    <Play className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                                </div>
                                <span className="block text-xs font-bold text-slate-200">Agotamiento eTokens IA</span>
                                <span className="block text-[10px] text-slate-400 mt-0.5">Notificación Push Inmediata</span>
                            </button>
                        </div>
                    </div>

                    {/* Quirófano en las Sombras - Monitor de Luz */}
                    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <div className="flex items-center gap-2">
                                <Cpu className="w-5 h-5 text-cyan-400" />
                                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                                    Quirófano de las Sombras (Laboratorio Paralelo)
                                </h2>
                            </div>
                            <span className="text-[10px] text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                                LUZ AGENT REPAIR CORE
                            </span>
                        </div>

                        {state.status === 'SHADOW_LAB_REPAIRING' ? (
                            <div className="p-6 bg-slate-950 border border-cyan-500/40 rounded-xl text-center space-y-3">
                                <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
                                <h3 className="text-sm font-bold text-cyan-300">
                                    Luz Ingeniera está aislando la rotura en el laboratorio...
                                </h3>
                                <p className="text-xs text-slate-400 max-w-md mx-auto">
                                    Aplicando parche genómico en la rama paralela <code className="text-white bg-slate-900 px-1 py-0.5 rounded">shadow-lab/incidents</code> y corriendo 18 verificaciones de Playwright.
                                </p>
                            </div>
                        ) : state.currentIncident ? (
                            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3 text-xs">
                                <div className="flex items-center justify-between text-slate-400">
                                    <span>Incidente Activo: <strong className="text-white">{state.currentIncident.id}</strong></span>
                                    <span>Módulo: <strong className="text-amber-400">{state.currentIncident.moduloAfecado}</strong></span>
                                </div>
                                <div className="p-2.5 bg-slate-900 rounded font-mono text-[11px] text-rose-300 border border-slate-800 overflow-x-auto">
                                    {state.currentIncident.errorStack}
                                </div>
                                {state.currentIncident.solucionPropuesta && (
                                    <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/30 rounded text-emerald-300">
                                        <strong>Solución Propuesta:</strong> {state.currentIncident.solucionPropuesta}
                                    </div>
                                )}
                                {state.currentIncident.detallesReparacion && (
                                    <div className="p-2.5 bg-slate-900 border border-slate-800 rounded text-slate-300 text-[11px]">
                                        {state.currentIncident.detallesReparacion}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="p-6 bg-slate-950 border border-slate-800/80 rounded-xl text-center text-slate-500 text-xs">
                                <ShieldCheck className="w-8 h-8 text-emerald-500/40 mx-auto mb-2" />
                                No hay incidentes activos en el Quirófano. El sistema opera en perfecta armonía.
                            </div>
                        )}
                    </div>
                </div>

                {/* Columna Derecha: Panel de Intervención & Historial */}
                <div className="space-y-6">
                    
                    {/* Panel de Acción Manual del Director */}
                    {state.status === 'HUMAN_INTERVENTION_REQUIRED' && (
                        <div className="bg-rose-950/30 border border-rose-500/60 rounded-2xl p-5 shadow-2xl space-y-4">
                            <div className="flex items-center gap-2 text-rose-400">
                                <AlertTriangle className="w-5 h-5 animate-pulse" />
                                <h2 className="text-sm font-bold text-white uppercase">
                                    Intervención del Director Waly
                                </h2>
                            </div>

                            <p className="text-xs text-rose-200">
                                {state.currentIncident?.razonIntervencion || 'El sistema requiere autorización manual para proceder.'}
                            </p>

                            <div className="space-y-2">
                                <label className="block text-[10px] text-slate-400 uppercase">
                                    Notas de Resolución / Pago de Cuota:
                                </label>
                                <input
                                    type="text"
                                    value={resolutionNotes}
                                    onChange={(e) => setResolutionNotes(e.target.value)}
                                    placeholder="Ej: Plan Firebase actualizado / Bolsa eTokens recargada"
                                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-rose-500"
                                />
                            </div>

                            <button
                                onClick={handleManualResolve}
                                className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
                            >
                                ✅ Confirmar Actualización y Restablecer Producción
                            </button>
                        </div>
                    )}

                    {/* Historial Táctico de Incidentes */}
                    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <div className="flex items-center gap-2">
                                <Activity className="w-5 h-5 text-cyan-400" />
                                <h2 className="text-sm font-bold text-white uppercase">
                                    Log Táctico de Incidentes
                                </h2>
                            </div>
                            <span className="text-[10px] text-slate-500">OBSIDIAN VAULT REG</span>
                        </div>

                        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                            {state.history.map((inc) => (
                                <div 
                                    key={inc.id} 
                                    className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5 text-xs"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-white">{inc.id}</span>
                                        <span className="text-[10px] text-slate-500">{inc.timestamp}</span>
                                    </div>
                                    <p className="text-[11px] text-amber-400 font-semibold">{inc.moduloAfecado}</p>
                                    <p className="text-[10px] text-slate-400 truncate">{inc.errorStack}</p>
                                    <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-900">
                                        <span className="text-emerald-400">Rollback: {inc.versionRollback}</span>
                                        <span className={inc.requiereIntervencionHumana ? 'text-rose-400' : 'text-cyan-400'}>
                                            {inc.requiereIntervencionHumana ? 'Intervención Humana' : 'Auto-Sanado OK'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
