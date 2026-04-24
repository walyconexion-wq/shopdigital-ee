import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Activity, Anchor, Globe, Users, Database, 
    MessageSquare, Zap, ShieldAlert, Cpu, ChevronLeft, Hexagon,
    Shield, ShieldCheck, Dog, Trash2, RefreshCw
} from 'lucide-react';
import { useAuth } from '../components/AuthContext';
import { playNeonClick } from '../utils/audio';
import { generateAriResponse } from '../services/gemini';
import { registrarIntrusionBunker, obtenerIntrusiones, eliminarIntrusion, limpiarTodasIntrusiones } from '../firebase';

// Mock data para el Radar
const zonesData = [
    { name: 'Ezeiza', status: 'optimal', orders: 145, activeShops: 42 },
    { name: 'Monte Grande', status: 'warning', orders: 89, activeShops: 28 },
    { name: 'San Martín M.', status: 'alert', orders: 12, activeShops: 5 },
];

const embajadores = [
    { name: 'Fede', zone: 'Ezeiza Centro', status: 'Pateando' },
    { name: 'Mati', zone: 'Monte Grande Sur', status: 'Reunión' },
];

// Banderas por código de país
const getFlag = (code: string) => {
    if (!code || code === '??') return '🌐';
    try {
        return String.fromCodePoint(...[...code.toUpperCase()].map(c => 0x1F1E6 + c.charCodeAt(0) - 65));
    } catch { return '🌐'; }
};

export const DirectorBunkerPage: React.FC = () => {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const chatEndRef = useRef<HTMLDivElement>(null);
    
    const [ariMsgs, setAriMsgs] = useState([
        { role: 'ari' as 'ari' | 'director', text: 'Sistemas en linea, Director. El cluster de Ezeiza reporta alta actividad, pero San Martin esta frio. ¿Que analizamos primero?' }
    ]);
    const [msgInput, setMsgInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [intrusiones, setIntrusiones] = useState<any[]>([]);
    const [securityStatus, setSecurityStatus] = useState<'green' | 'red'>('green');
    const [intrusionRegistered, setIntrusionRegistered] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const ROOT_EMAIL = 'walyconexion@gmail.com';
    const isAuthorized = user?.email?.trim().toLowerCase() === ROOT_EMAIL;

    // 🐕 PROTOCOLO DOBERMAN: Registrar intrusión SOLO si auth ya cargó y NO es el Director
    useEffect(() => {
        if (authLoading) return; // Esperar a que Firebase Auth resuelva
        if (!isAuthorized && !intrusionRegistered) {
            setIntrusionRegistered(true);
            registrarIntrusionBunker(user?.email || null);
        }
    }, [isAuthorized, user, intrusionRegistered, authLoading]);

    // Cargar intrusiones cuando el Director entra
    const loadIntrusiones = async () => {
        const logs = await obtenerIntrusiones(20);
        setIntrusiones(logs);
        const now = Date.now();
        const recent = logs.filter(l => {
            const logTime = new Date(l.timestamp).getTime();
            return (now - logTime) < 24 * 60 * 60 * 1000;
        });
        setSecurityStatus(recent.length > 0 ? 'red' : 'green');
    };

    useEffect(() => {
        if (isAuthorized) loadIntrusiones();
    }, [isAuthorized]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [ariMsgs, isThinking]);

    // Mientras Firebase Auth resuelve, mostrar pantalla de carga
    if (authLoading) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-2 border-violet-500/20 border-t-violet-500 rounded-full animate-spin mb-4"></div>
                <p className="text-[10px] text-white/30 uppercase tracking-[0.3em] font-bold">Verificando ADN Digital...</p>
            </div>
        );
    }

    // Eliminar un intruso individual
    const handleEliminarIntruso = async (logId: string) => {
        setDeletingId(logId);
        await eliminarIntrusion(logId);
        await loadIntrusiones();
        setDeletingId(null);
    };

    // Limpiar TODOS los registros
    const handleLimpiarTodo = async () => {
        if (!window.confirm('¿Limpiar TODOS los registros de intrusión? El Doberman empezará de cero.')) return;
        await limpiarTodasIntrusiones();
        await loadIntrusiones();
    };

    // ═══════════════════════════════════════════
    // 🐕 PANTALLA DOBERMAN (Acceso Denegado)
    // ═══════════════════════════════════════════
    if (!isAuthorized) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,0,0,0.2),transparent_70%)] pointer-events-none animate-pulse"></div>
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,0,0,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>
                <div className="relative mb-8">
                    <div className="w-32 h-32 rounded-full bg-red-900/30 border-2 border-red-500/50 flex items-center justify-center relative shadow-[0_0_60px_rgba(239,68,68,0.3)]">
                        <Dog size={64} className="text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full animate-ping"></div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-[8px] font-black text-white">!</span>
                    </div>
                </div>
                <h1 className="text-white text-3xl font-[1000] uppercase tracking-[0.3em] text-center mb-3">ZONA PROTEGIDA</h1>
                <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent mb-4"></div>
                <p className="text-red-400 font-bold tracking-[0.4em] text-[10px] uppercase mb-6">Protocolo Doberman Activado</p>
                <p className="text-white/40 text-[11px] text-center max-w-xs leading-relaxed mb-10">
                    Este acceso esta reservado exclusivamente para el Director. Su intento ha sido registrado con email, IP y pais de origen.
                </p>
                <div className="flex flex-col items-center gap-2 p-4 border border-red-500/20 rounded-2xl bg-red-900/10">
                    <ShieldAlert size={18} className="text-red-500" />
                    <span className="text-[9px] text-red-400 font-bold uppercase tracking-widest">Intrusion Documentada</span>
                    <span className="text-[8px] text-white/20 tracking-wider">{new Date().toLocaleString('es-AR')}</span>
                </div>
            </div>
        );
    }

    // ═══════════════════════════════════════════
    // PANEL DEL DIRECTOR (Autorizado)
    // ═══════════════════════════════════════════
    const handleSend = async () => {
        if (!msgInput.trim() || isThinking) return;
        playNeonClick();
        const newHistory = [...ariMsgs, { role: 'director' as const, text: msgInput }];
        setAriMsgs(newHistory);
        setMsgInput('');
        setIsThinking(true);
        const response = await generateAriResponse(newHistory);
        setAriMsgs([...newHistory, { role: 'ari' as const, text: response }]);
        setIsThinking(false);
    };

    return (
        <div className="min-h-screen bg-[#020202] text-white font-sans overflow-hidden flex flex-col selection:bg-violet-500/30">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-cyan-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-violet-600/10 rounded-full blur-[120px]" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:30px_30px]" />
            </div>

            {/* Header */}
            <header className="relative z-10 bg-black/60 backdrop-blur-md border-b border-white/5 py-4 px-6 flex items-center justify-between shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
                <div className="flex items-center gap-4">
                    <button onClick={() => { playNeonClick(); navigate(-1); }} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-white/10">
                        <ChevronLeft size={18} className="text-white/70" />
                    </button>
                    <div>
                        <h1 className="text-[14px] font-[1000] uppercase tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400 flex items-center gap-2">
                            <Anchor size={14} className="text-cyan-400" /> Bunker Central
                        </h1>
                        <p className="text-[8px] text-white/50 tracking-[0.3em] font-bold uppercase mt-1">Terminal del Director [Nivel Omega]</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${
                        securityStatus === 'green' ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/30 animate-pulse'
                    }`}>
                        {securityStatus === 'green' 
                            ? <ShieldCheck size={14} className="text-green-400" />
                            : <Dog size={14} className="text-red-400" />
                        }
                        <span className={`text-[9px] font-bold uppercase tracking-widest ${securityStatus === 'green' ? 'text-green-400' : 'text-red-400'}`}>
                            {securityStatus === 'green' ? 'Seguro' : `${intrusiones.length} Alertas`}
                        </span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 relative z-10 flex flex-col xl:flex-row w-full max-w-[1600px] mx-auto p-4 md:p-6 gap-6 min-h-[calc(100vh-80px)] xl:h-[calc(100vh-80px)]">
                
                {/* ─── DASHBOARD ─── */}
                <div className="flex-[3] flex flex-col gap-6 xl:overflow-y-auto pr-0 xl:pr-2 no-scrollbar">
                    
                    {/* Contadores */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-cyan-900/40 to-black border border-cyan-500/30 rounded-2xl p-5 relative overflow-hidden shadow-[0_0_15px_rgba(6,182,212,0.1)] group">
                            <Activity className="absolute -top-4 -right-4 w-24 h-24 text-cyan-500/10 group-hover:scale-110 transition-transform duration-500" />
                            <h3 className="text-[10px] text-cyan-400 font-black uppercase tracking-widest mb-1">Pedidos Hoy</h3>
                            <p className="text-3xl font-[1000] text-white">246</p>
                        </div>
                        <div className="bg-gradient-to-br from-emerald-900/40 to-black border border-emerald-500/30 rounded-2xl p-5 relative overflow-hidden shadow-[0_0_15px_rgba(16,185,129,0.1)] group">
                            <Database className="absolute -top-4 -right-4 w-24 h-24 text-emerald-500/10 group-hover:scale-110 transition-transform duration-500" />
                            <h3 className="text-[10px] text-emerald-400 font-black uppercase tracking-widest mb-1">Facturacion</h3>
                            <p className="text-3xl font-[1000] text-white">$4.2M</p>
                        </div>
                        <div className="bg-gradient-to-br from-violet-900/40 to-black border border-violet-500/30 rounded-2xl p-5 relative overflow-hidden shadow-[0_0_15px_rgba(139,92,246,0.1)] group">
                            <Zap className="absolute -top-4 -right-4 w-24 h-24 text-violet-500/10 group-hover:scale-110 transition-transform duration-500" />
                            <h3 className="text-[10px] text-violet-400 font-black uppercase tracking-widest mb-1">Creditos Movidos</h3>
                            <p className="text-3xl font-[1000] text-white">85K</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Radar */}
                        <div className="bg-[#050505] border border-white/10 rounded-2xl p-5 flex flex-col">
                            <h2 className="text-[11px] font-black uppercase tracking-[0.25em] flex items-center gap-2 text-white/80 mb-4">
                                <Globe size={14} className="text-cyan-500" /> Radar de Zonas
                            </h2>
                            <div className="flex flex-col gap-3">
                                {zonesData.map(zone => (
                                    <div key={zone.name} className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-xl hover:border-white/10 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${
                                                zone.status === 'optimal' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]' : 
                                                zone.status === 'warning' ? 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.8)]' : 
                                                'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse'
                                            }`} />
                                            <div>
                                                <h4 className="text-[12px] font-bold text-white uppercase tracking-wider">{zone.name}</h4>
                                                <p className="text-[8px] text-white/40 tracking-widest uppercase">{zone.activeShops} comercios</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[12px] font-[1000] text-white">{zone.orders}</p>
                                            <p className="text-[7px] text-cyan-400 font-bold uppercase tracking-widest">Pedidos</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Embajadores */}
                        <div className="bg-[#050505] border border-white/10 rounded-2xl p-5 flex flex-col">
                            <h2 className="text-[11px] font-black uppercase tracking-[0.25em] flex items-center gap-2 text-white/80 mb-4">
                                <Users size={14} className="text-violet-500" /> Fuerza de Elite
                            </h2>
                            <div className="space-y-3">
                                {embajadores.map(emb => (
                                    <div key={emb.name} className="flex items-center gap-3 p-3 bg-gradient-to-r from-violet-900/10 to-transparent border-l-2 border-violet-500 rounded-r-xl">
                                        <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400">
                                            <Hexagon size={16} />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-[11px] font-bold text-white uppercase tracking-wider">{emb.name}</h4>
                                            <p className="text-[8px] text-white/50 tracking-widest uppercase">{emb.zone}</p>
                                        </div>
                                        <span className="text-[8px] font-black text-violet-400 uppercase tracking-widest bg-violet-500/10 px-2 py-1 rounded-md border border-violet-500/20">
                                            {emb.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ═══════════════════════════════════════════ */}
                    {/* 🐕 BITÁCORA DOBERMAN — Panel de Intrusos   */}
                    {/* ═══════════════════════════════════════════ */}
                    <div className="bg-[#050505] border border-red-500/20 rounded-2xl p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-[11px] font-black uppercase tracking-[0.25em] flex items-center gap-2 text-red-400">
                                <Dog size={16} className="drop-shadow-[0_0_6px_rgba(239,68,68,0.6)]" /> Bitacora Doberman
                            </h2>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => loadIntrusiones()}
                                    className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 text-white/40 hover:text-white transition-all"
                                    title="Refrescar"
                                >
                                    <RefreshCw size={12} />
                                </button>
                                {intrusiones.length > 0 && (
                                    <button 
                                        onClick={handleLimpiarTodo}
                                        className="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 rounded-lg border border-red-500/20 text-[8px] font-black text-red-400 uppercase tracking-widest transition-all"
                                    >
                                        Limpiar Todo
                                    </button>
                                )}
                            </div>
                        </div>

                        {intrusiones.length === 0 ? (
                            <div className="flex flex-col items-center gap-3 py-8 text-center">
                                <ShieldCheck size={32} className="text-green-500/30" />
                                <p className="text-[10px] text-white/30 uppercase tracking-widest">Perimetro limpio. Sin intrusiones registradas.</p>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-[300px] overflow-y-auto no-scrollbar">
                                {intrusiones.map((log) => (
                                    <div key={log.id} className={`flex items-center gap-3 p-3 border rounded-xl transition-all ${
                                        deletingId === log.id 
                                        ? 'bg-red-500/30 border-red-500/50 scale-95 opacity-50' 
                                        : 'bg-red-900/10 border-red-500/10 hover:border-red-500/30'
                                    }`}>
                                        {/* Bandera */}
                                        <div className="text-xl w-8 text-center flex-shrink-0">
                                            {getFlag(log.countryCode)}
                                        </div>
                                        
                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[11px] font-bold text-white/90 truncate">
                                                {log.email === 'anonimo' ? '👤 Usuario Anonimo' : `📧 ${log.email}`}
                                            </p>
                                            <div className="flex items-center gap-3 mt-0.5">
                                                <span className="text-[8px] text-white/40">IP: {log.ip}</span>
                                                <span className="text-[8px] text-white/40">{log.country || 'Desconocido'}</span>
                                            </div>
                                        </div>

                                        {/* Fecha */}
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-[9px] text-red-400 font-bold">{log.date}</p>
                                            <p className="text-[7px] text-white/30">{log.time}</p>
                                        </div>

                                        {/* Botón Eliminar */}
                                        <button
                                            onClick={() => handleEliminarIntruso(log.id)}
                                            disabled={deletingId === log.id}
                                            className="flex-shrink-0 p-2 bg-red-500/10 hover:bg-red-500/30 border border-red-500/20 hover:border-red-500/50 rounded-lg text-red-400 hover:text-red-300 transition-all active:scale-90 disabled:opacity-30"
                                            title="Eliminar registro"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* ─── CHAT ARI ─── */}
                <div className="flex-[2] w-full mt-4 xl:mt-0 bg-black/80 backdrop-blur-2xl border border-violet-500/30 rounded-3xl overflow-hidden flex flex-col relative shadow-[0_0_40px_rgba(139,92,246,0.15)] h-[600px] xl:h-auto shrink-0">
                    <div className="bg-gradient-to-r from-violet-900/50 to-indigo-900/50 p-4 border-b border-violet-500/30 flex items-center gap-4">
                        <div className="relative">
                            <div className="w-12 h-12 rounded-2xl bg-black border border-violet-500/50 flex items-center justify-center relative z-10 shadow-[0_0_15px_rgba(139,92,246,0.4)]">
                                <Cpu size={24} className="text-violet-400" />
                            </div>
                            <div className="absolute inset-0 bg-violet-500 blur-xl opacity-40 animate-pulse"></div>
                            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-400 border-2 border-black rounded-full z-20"></span>
                        </div>
                        <div>
                            <h2 className="text-[16px] font-[1000] uppercase tracking-widest text-white">Ari</h2>
                            <p className="text-[8px] text-violet-300 font-bold tracking-[0.3em] uppercase">Analista Tactica · En linea</p>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-5 pb-20 space-y-4 no-scrollbar">
                        {ariMsgs.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'ari' ? 'justify-start' : 'justify-end'}`}>
                                <div className={`max-w-[85%] rounded-2xl p-4 text-[13px] leading-relaxed ${
                                    msg.role === 'ari' 
                                    ? 'bg-violet-900/20 border border-violet-500/30 text-white rounded-tl-sm shadow-[0_5px_15px_rgba(139,92,246,0.1)]' 
                                    : 'bg-cyan-900/20 border border-cyan-500/30 text-white rounded-tr-sm shadow-[0_5px_15px_rgba(6,182,212,0.1)]'
                                }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isThinking && (
                            <div className="flex justify-start">
                                <div className="max-w-[85%] rounded-2xl p-4 bg-violet-900/20 border border-violet-500/30 text-white rounded-tl-sm flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce"></div>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/90 to-transparent">
                        <div className="bg-black border border-violet-500/40 rounded-2xl flex items-center p-2 focus-within:border-violet-400 focus-within:shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-all">
                            <input 
                                type="text"
                                value={msgInput}
                                onChange={e => setMsgInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSend()}
                                placeholder="Escribile a Ari. Comando, consulta o analisis..."
                                className="flex-1 bg-transparent text-white text-[12px] px-3 outline-none placeholder:text-white/20"
                            />
                            <button onClick={handleSend} className="w-10 h-10 bg-violet-500/20 hover:bg-violet-500 border border-violet-500/50 rounded-xl flex items-center justify-center text-violet-300 hover:text-white transition-all active:scale-90">
                                <MessageSquare size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
