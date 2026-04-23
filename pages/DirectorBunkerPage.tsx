import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Activity, Anchor, Globe, Users, Database, 
    MessageSquare, Zap, ShieldAlert, Cpu, ChevronLeft, Hexagon
} from 'lucide-react';
import { useAuth } from '../components/AuthContext';
import { playNeonClick } from '../utils/audio';
import { generateAriResponse } from '../services/gemini';

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

export const DirectorBunkerPage: React.FC = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    
    // Chat UI state (Mock)
    const [ariMsgs, setAriMsgs] = useState([
        { role: 'ari' as 'ari' | 'director', text: 'Sistemas en línea, Director. El clúster de Ezeiza reporta alta actividad, pero San Martín está frío. ¿Qué analizamos primero?' }
    ]);
    const [msgInput, setMsgInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);

    const ROOT_EMAIL = 'walyconexion@gmail.com';
    
    // Capa 1: Búnker de Seguridad Absoluta
    if (user?.email?.trim().toLowerCase() !== ROOT_EMAIL) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,0,0,0.15),transparent_70%)] pointer-events-none"></div>
                <ShieldAlert size={80} className="text-red-500 mb-6 drop-shadow-[0_0_30px_rgba(255,0,0,0.6)] animate-pulse" />
                <h1 className="text-white text-2xl font-[1000] uppercase tracking-widest text-center mb-2 text-shadow-premium">ACCESO DENEGADO</h1>
                <p className="text-red-400 font-bold tracking-widest text-[10px] uppercase mb-8">Nivel de autorización insuficiente</p>
                <div className="text-[9px] text-white/30 tracking-[0.3em] uppercase">Se ha registrado el intento de intrusión.</div>
            </div>
        );
    }

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
            {/* Background Aesthetics */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-cyan-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-violet-600/10 rounded-full blur-[120px]" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:30px_30px]" />
            </div>

            {/* Header Mando */}
            <header className="relative z-10 bg-black/60 backdrop-blur-md border-b border-white/5 py-4 px-6 flex items-center justify-between shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
                <div className="flex items-center gap-4">
                    <button onClick={() => { playNeonClick(); navigate('/tablero-maestro'); }} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-white/10">
                        <ChevronLeft size={18} className="text-white/70" />
                    </button>
                    <div>
                        <h1 className="text-[14px] font-[1000] uppercase tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400 flex items-center gap-2">
                            <Anchor size={14} className="text-cyan-400" /> Búnker Central
                        </h1>
                        <p className="text-[8px] text-white/50 tracking-[0.3em] font-bold uppercase mt-1">Terminal del Director [Nivel Omega]</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)]"></div>
                        <span className="text-[9px] text-green-400 font-bold uppercase tracking-widest">En Línea</span>
                    </div>
                </div>
            </header>

            {/* Main Content: Left Dashboard (60%) | Right Chat (40%) */}
            <main className="flex-1 relative z-10 flex flex-col md:flex-row w-full max-w-[1600px] mx-auto p-4 md:p-6 gap-6 h-[calc(100vh-80px)]">
                
                {/* ─── CAPA 2: DASHBOARD DE ESTADO ─── */}
                <div className="flex-[3] flex flex-col gap-6 overflow-y-auto pr-2 no-scrollbar">
                    
                    {/* Contadores Globales */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-cyan-900/40 to-black border border-cyan-500/30 rounded-2xl p-5 relative overflow-hidden shadow-[0_0_15px_rgba(6,182,212,0.1)] group">
                            <Activity className="absolute -top-4 -right-4 w-24 h-24 text-cyan-500/10 group-hover:scale-110 transition-transform duration-500" />
                            <h3 className="text-[10px] text-cyan-400 font-black uppercase tracking-widest mb-1">Pedidos Hoy</h3>
                            <p className="text-3xl font-[1000] text-white">246</p>
                        </div>
                        <div className="bg-gradient-to-br from-emerald-900/40 to-black border border-emerald-500/30 rounded-2xl p-5 relative overflow-hidden shadow-[0_0_15px_rgba(16,185,129,0.1)] group">
                            <Database className="absolute -top-4 -right-4 w-24 h-24 text-emerald-500/10 group-hover:scale-110 transition-transform duration-500" />
                            <h3 className="text-[10px] text-emerald-400 font-black uppercase tracking-widest mb-1">Facturación</h3>
                            <p className="text-3xl font-[1000] text-white">$4.2M</p>
                        </div>
                        <div className="bg-gradient-to-br from-violet-900/40 to-black border border-violet-500/30 rounded-2xl p-5 relative overflow-hidden shadow-[0_0_15px_rgba(139,92,246,0.1)] group">
                            <Zap className="absolute -top-4 -right-4 w-24 h-24 text-violet-500/10 group-hover:scale-110 transition-transform duration-500" />
                            <h3 className="text-[10px] text-violet-400 font-black uppercase tracking-widest mb-1">Créditos Movidos</h3>
                            <p className="text-3xl font-[1000] text-white">85K</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                        {/* Radar de Zonas */}
                        <div className="bg-[#050505] border border-white/10 rounded-2xl p-5 flex flex-col">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-[11px] font-black uppercase tracking-[0.25em] flex items-center gap-2 text-white/80">
                                    <Globe size={14} className="text-cyan-500" /> Radar de Zonas
                                </h2>
                            </div>
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
                                                <p className="text-[8px] text-white/40 tracking-widest uppercase">{zone.activeShops} comercios activos</p>
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

                        {/* Alerta de Embajadores */}
                        <div className="bg-[#050505] border border-white/10 rounded-2xl p-5 flex flex-col">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-[11px] font-black uppercase tracking-[0.25em] flex items-center gap-2 text-white/80">
                                    <Users size={14} className="text-violet-500" /> Fuerza de Elite
                                </h2>
                            </div>
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
                </div>

                {/* ─── CAPA 3: EL ALTAR DE ARI (CHAT) ─── */}
                <div className="flex-[2] bg-black/80 backdrop-blur-2xl border border-violet-500/30 rounded-3xl overflow-hidden flex flex-col relative shadow-[0_0_40px_rgba(139,92,246,0.15)] h-[600px] md:h-auto">
                    
                    {/* Ari Header */}
                    <div className="bg-gradient-to-r from-violet-900/50 to-indigo-900/50 p-4 border-b border-violet-500/30 flex items-center gap-4">
                        <div className="relative">
                            <div className="w-12 h-12 rounded-2xl bg-black border border-violet-500/50 flex items-center justify-center relative z-10 shadow-[0_0_15px_rgba(139,92,246,0.4)]">
                                <Cpu size={24} className="text-violet-400" />
                            </div>
                            <div className="absolute inset-0 bg-violet-500 blur-xl opacity-40 animate-pulse"></div>
                            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-400 border-2 border-black rounded-full z-20"></span>
                        </div>
                        <div>
                            <h2 className="text-[16px] font-[1000] uppercase tracking-widest text-white shadow-sm">Ari</h2>
                            <p className="text-[8px] text-violet-300 font-bold tracking-[0.3em] uppercase">Analista de Datos Táctica · En línea</p>
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 overflow-y-auto p-5 pb-20 space-y-4 no-scrollbar">
                        {ariMsgs.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'ari' ? 'justify-start' : 'justify-end'}`}>
                                <div className={`max-w-[85%] rounded-2xl p-4 text-[13px] leading-relaxed relative ${
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
                                <div className="max-w-[85%] rounded-2xl p-4 text-[13px] bg-violet-900/20 border border-violet-500/30 text-white rounded-tl-sm shadow-[0_5px_15px_rgba(139,92,246,0.1)] flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce"></div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/90 to-transparent">
                        <div className="bg-black border border-violet-500/40 rounded-2xl flex items-center p-2 focus-within:border-violet-400 focus-within:shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-all">
                            <input 
                                type="text"
                                value={msgInput}
                                onChange={e => setMsgInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSend()}
                                placeholder="Escribile a Ari. Comando, consulta o análisis..."
                                className="flex-1 bg-transparent text-white text-[12px] px-3 outline-none placeholder:text-white/20"
                            />
                            <button 
                                onClick={handleSend}
                                className="w-10 h-10 bg-violet-500/20 hover:bg-violet-500 border border-violet-500/50 rounded-xl flex items-center justify-center text-violet-300 hover:text-white transition-all active:scale-90"
                            >
                                <MessageSquare size={16} />
                            </button>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
};
