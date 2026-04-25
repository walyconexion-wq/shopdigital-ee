import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
    ChevronLeft, Megaphone, Radio, Tv, Signal, 
    Trash2, Power, MonitorPlay, MessageSquare, Cpu, Anchor,
    Play, Pause, Edit2, Clock, Calendar, Server, Save
} from 'lucide-react';
import { playNeonClick } from '../utils/audio';
import { generateAriResponse } from '../services/gemini';
import { 
    guardarBroadcast, obtenerBroadcasts, eliminarBroadcast, toggleBroadcast, editarBroadcast, Broadcast 
} from '../firebase';
import { CATEGORIES } from '../constants';

const LiveBroadcastPage: React.FC = () => {
    const { townId = 'esteban-echeverria' } = useParams<{ townId: string }>();
    const navigate = useNavigate();
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Formulario de Transmisión
    const [broadcastUrl, setBroadcastUrl] = useState('');
    const [broadcastTitle, setBroadcastTitle] = useState('');
    const [broadcastType, setBroadcastType] = useState<'image' | 'video'>('image');
    const [targetCats, setTargetCats] = useState<string[]>(['all']);
    const [targetTowns, setTargetTowns] = useState<string[]>(['global']);
    const [allBroadcasts, setAllBroadcasts] = useState<Broadcast[]>([]);
    const [transmitting, setTransmitting] = useState(false);
    
    // Gestión de Campañas
    const [selectedPreviewId, setSelectedPreviewId] = useState<string | null>(null);
    const [editingBcId, setEditingBcId] = useState<string | null>(null);
    const [editStart, setEditStart] = useState('');
    const [editEnd, setEditEnd] = useState('');

    // Ari Terminal
    const [ariMsgs, setAriMsgs] = useState([
        { role: 'ari' as 'ari' | 'director', text: 'Sistemas enganchados, Director. El Centro de Transmisión global está listo para inyectar sobre la señal de los muros. ¿Qué campaña corremos primero?' }
    ]);
    const [msgInput, setMsgInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);

    useEffect(() => {
        obtenerBroadcasts(townId).then(setAllBroadcasts);
    }, [townId]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [ariMsgs, isThinking]);

    const activeCount = allBroadcasts.filter(b => b.active).length;
    const firstActive = allBroadcasts.find(b => b.active);
    
    const selectedBroadcast = allBroadcasts.find(b => b.id === selectedPreviewId);
    const resolvedActiveTargetFallback = firstActive?.targetTowns?.includes('global') || !firstActive?.targetTowns ? 'CADENA NACIONAL' : firstActive.targetTowns.join(' - ').replace(/-/g, ' ').toUpperCase();
    const resolvedLocalTargetText = targetTowns.includes('global') ? 'CADENA NACIONAL' : targetTowns.join(' - ').replace(/-/g, ' ').toUpperCase();

    const previewUrl = selectedBroadcast?.mediaUrl || (broadcastUrl.trim() !== '' ? broadcastUrl : firstActive?.mediaUrl);
    const previewType = selectedBroadcast?.mediaType || (broadcastUrl.trim() !== '' ? broadcastType : firstActive?.mediaType);
    const previewTownsText = selectedBroadcast 
        ? (!selectedBroadcast.targetTowns || selectedBroadcast.targetTowns.includes('global') ? 'CADENA NACIONAL' : selectedBroadcast.targetTowns.join(' - ').replace(/-/g, ' ').toUpperCase())
        : (broadcastUrl.trim() !== '' ? resolvedLocalTargetText : resolvedActiveTargetFallback);

    const handleTransmit = async () => {
        if (!broadcastUrl.trim() || !broadcastTitle.trim()) {
            alert('Completá la URL y el Título para transmitir.');
            return;
        }
        setTransmitting(true);
        playNeonClick();
        
        await guardarBroadcast({
            mediaUrl: broadcastUrl.trim(),
            mediaType: broadcastType,
            title: broadcastTitle.trim(),
            targetCategories: targetCats,
            targetTowns: targetTowns,
            active: true,
            priority: 1,
            createdBy: 'Director'
        });
        
        const titleCopy = broadcastTitle.trim();
        setBroadcastUrl('');
        setBroadcastTitle('');
        setTargetCats(['all']);
        setTargetTowns(['global']);
        
        const updated = await obtenerBroadcasts(townId);
        setAllBroadcasts(updated);
        setTransmitting(false);

        // Ari comment
        setTimeout(() => {
            const zonaTxt = targetTowns.includes('global') ? 'toda la Cadena Nacional' : targetTowns.join(' y ').replace(/-/g, ' ').toUpperCase();
            setAriMsgs(prev => [...prev, { 
                role: 'ari', 
                text: `¡Campaña "${titleCopy}" inyectada con éxito en ${zonaTxt}! Monitoreando propagación en muros...` 
            }]);
        }, 1000);
    };

    const handleToggle = async (id: string, active: boolean) => {
        playNeonClick();
        await toggleBroadcast(id, !active);
        const updated = await obtenerBroadcasts(townId);
        setAllBroadcasts(updated);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('¿Eliminar esta transmisión permanentemente?')) return;
        playNeonClick();
        await eliminarBroadcast(id);
        const updated = await obtenerBroadcasts(townId);
        setAllBroadcasts(updated);
    };

    const toggleCat = (catId: string) => {
        if (catId === 'all') {
            setTargetCats(['all']);
        } else {
            const without = targetCats.filter(c => c !== 'all');
            if (without.includes(catId)) {
                const next = without.filter(c => c !== catId);
                setTargetCats(next.length > 0 ? next : ['all']);
            } else {
                setTargetCats([...without, catId]);
            }
        }
    };

    const toggleTown = (town: string) => {
        if (town === 'global') {
            setTargetTowns(['global']);
        } else {
            const without = targetTowns.filter(t => t !== 'global');
            if (without.includes(town)) {
                const next = without.filter(t => t !== town);
                setTargetTowns(next.length > 0 ? next : ['global']);
            } else {
                setTargetTowns([...without, town]);
            }
        }
    };

    const handleSendAri = async () => {
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
        <div className="fixed inset-0 w-screen h-screen bg-[#050505] text-white font-sans overflow-hidden flex flex-col selection:bg-emerald-500/30">
            {/* Background ADN Estético Búnker */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-emerald-600/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-violet-600/10 rounded-full blur-[120px]" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:30px_30px]" />
            </div>

            {/* Header Mando */}
            <header className="relative z-10 bg-black/60 backdrop-blur-md border-b border-white/5 py-4 px-6 flex items-center justify-between shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
                <div className="flex items-center gap-4">
                    <button onClick={() => { playNeonClick(); navigate(-1); }} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-white/10">
                        <ChevronLeft size={18} className="text-white/70" />
                    </button>
                    <div>
                        <h1 className="text-[14px] font-[1000] uppercase tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-violet-400 flex items-center gap-2 drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                            <Anchor size={14} className="text-emerald-400" /> SINFONÍA DE TRANSMISIÓN
                        </h1>
                        <p className="text-[8px] text-white/50 tracking-[0.3em] font-bold uppercase mt-1">
                            Centro de Comando RMN · {townId.replace(/-/g, ' ').toUpperCase()}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Radio size={20} className="text-emerald-500 drop-shadow-[0_0_12px_rgba(16,185,129,0.8)] animate-pulse" />
                </div>
            </header>

            {/* Main Content Layout (3 Columns Desktop) */}
            <main className="flex-1 min-h-0 relative z-10 flex flex-col xl:flex-row w-full h-full p-4 xl:p-8 gap-6 xl:gap-8 origin-top">
                
                {/* ==================================================== */}
                {/* PILAR 1: PANEL DE TRANSMISIÓN PRO (IZQUIERDA)        */}
                {/* ==================================================== */}
                <div className="flex-none xl:w-[450px] shrink-0 flex flex-col gap-6 h-full overflow-y-auto pr-0 xl:pr-2 no-scrollbar">
                    
                    {/* Status Bar Elegante */}
                    <div className="bg-black/90 backdrop-blur-2xl border-2 border-purple-900/50 rounded-3xl p-5 flex items-center justify-between shadow-[0_0_20px_rgba(88,28,135,0.3)]">
                        <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${activeCount > 0 ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)] animate-pulse' : 'bg-white/10'}`} />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Canal Maestro</span>
                        </div>
                        <div className="flex items-center gap-5">
                            <div className="text-center">
                                <p className="text-[20px] font-[1000] text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)] leading-none">{activeCount}</p>
                                <p className="text-[7px] font-black uppercase tracking-widest text-white/30 mt-1.5">Activas</p>
                            </div>
                            <div className="w-[1px] h-8 bg-white/10" />
                            <div className="text-center">
                                <p className="text-[20px] font-[1000] text-violet-400 drop-shadow-[0_0_8px_rgba(139,92,246,0.5)] leading-none">{allBroadcasts.length}</p>
                                <p className="text-[7px] font-black uppercase tracking-widest text-white/30 mt-1.5">Total</p>
                            </div>
                        </div>
                    </div>

                    {/* Nuevo Contenedor Formulario */}
                    <div className="bg-[#050505] border-2 border-purple-900/50 shadow-[0_0_30px_rgba(88,28,135,0.2)] rounded-3xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/10 blur-[50px] pointer-events-none rounded-full" />
                        
                        <h2 className="text-[11px] font-[1000] uppercase tracking-[0.2em] text-violet-400 flex items-center gap-2 mb-6">
                            <Megaphone size={16} className="drop-shadow-[0_0_8px_rgba(139,92,246,0.6)]" />
                            Configuración de Campaña
                        </h2>

                        <div className="space-y-4 relative z-10">
                            {/* Titulo */}
                            <div className="space-y-1.5">
                                <input 
                                    type="text" 
                                    value={broadcastTitle}
                                    onChange={e => setBroadcastTitle(e.target.value)}
                                    placeholder="Nombre de campaña (Ej: Promo Quilmes)"
                                    className="w-full bg-black border border-white/10 rounded-2xl px-5 py-4 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/50 focus:shadow-[0_0_20px_rgba(139,92,246,0.15)] transition-all"
                                />
                            </div>

                            {/* URL Media */}
                            <div className="space-y-1.5">
                                <input 
                                    type="text" 
                                    value={broadcastUrl}
                                    onChange={e => {
                                        setBroadcastUrl(e.target.value);
                                        if (/\.(mp4|webm|mov)($|\?)/i.test(e.target.value)) setBroadcastType('video');
                                        else setBroadcastType('image');
                                    }}
                                    placeholder="https://... URL (Video .mp4 o Imagen)"
                                    className="w-full bg-black border border-white/10 rounded-2xl px-5 py-4 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/50 focus:shadow-[0_0_20px_rgba(139,92,246,0.15)] transition-all"
                                />
                            </div>

                            {/* Chips de Zonas (Target Towns) */}
                            <div className="pt-2 border-b border-white/5 pb-4">
                                <label className="text-[8px] font-bold uppercase tracking-[0.25em] text-white/30 ml-1 block mb-3">Zonas Geográficas :</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button 
                                        onClick={() => toggleTown('global')}
                                        className={`col-span-2 px-3 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest border transition-all duration-300 ${targetTowns.includes('global') ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'bg-white/[0.02] border-white/10 text-white/30 hover:border-white/20'}`}
                                    >🌐 Global / Cadena Nacional</button>
                                    <button 
                                        onClick={() => toggleTown('ezeiza')}
                                        className={`px-2 py-2 rounded-xl text-[7px] font-black uppercase tracking-widest border transition-all duration-300 truncate ${targetTowns.includes('ezeiza') ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'bg-white/[0.02] border-white/[0.05] text-white/20 hover:border-white/15'}`}
                                    >🏙️ Ezeiza</button>
                                    <button 
                                        onClick={() => toggleTown('esteban-echeverria')}
                                        className={`px-2 py-2 rounded-xl text-[7px] font-black uppercase tracking-widest border transition-all duration-300 truncate ${targetTowns.includes('esteban-echeverria') ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'bg-white/[0.02] border-white/[0.05] text-white/20 hover:border-white/15'}`}
                                    >🌳 Esteban Echeverría</button>
                                </div>
                            </div>

                            {/* Chips de Categorías (Compact Grid Symmetrical) */}
                            <div className="pt-2">
                                <label className="text-[8px] font-bold uppercase tracking-[0.25em] text-white/30 ml-1 block mb-3">Target en Muros :</label>
                                <div className="grid grid-cols-3 gap-2">
                                    <button 
                                        onClick={() => toggleCat('all')}
                                        className={`col-span-3 px-3 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest border transition-all duration-300 ${targetCats.includes('all') ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-white/[0.02] border-white/10 text-white/30 hover:border-white/20'}`}
                                    >🌐 Todos los Sectores</button>
                                    {CATEGORIES.map(cat => (
                                        <button
                                            key={cat.id}
                                            onClick={() => toggleCat(cat.id)}
                                            className={`px-2 py-2 rounded-xl text-[7px] font-black uppercase tracking-widest border transition-all duration-300 truncate ${targetCats.includes(cat.id) ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-white/[0.02] border-white/[0.05] text-white/20 hover:border-white/15'}`}
                                        >{cat.name}</button>
                                    ))}
                                </div>
                            </div>

                            {/* Botón Transmitir */}
                            <button 
                                onClick={handleTransmit}
                                disabled={transmitting || !broadcastUrl.trim() || !broadcastTitle.trim()}
                                className="w-full mt-4 py-4 bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 rounded-2xl text-white font-[1000] uppercase tracking-[0.3em] text-[12px] shadow-[0_5px_0_rgba(6,95,70,1),0_10px_30px_rgba(16,185,129,0.25)] active:translate-y-[5px] active:shadow-[0_0_0_rgba(6,95,70,1),0_5px_15px_rgba(16,185,129,0.15)] transition-all duration-75 flex items-center justify-center gap-3 disabled:opacity-30 disabled:cursor-not-allowed group relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                                <Signal size={18} className={transmitting ? 'animate-ping' : 'drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]'} />
                                <span className="drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
                                    {transmitting ? 'INYECTANDO...' : 'INYECTAR EN LA RED'}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* ==================================================== */}
                {/* PILAR 2: MONITOR DE RETORNO (CENTRO)                 */}
                {/* ==================================================== */}
                <div className="flex-[2] hidden xl:flex flex-col items-center justify-start relative p-2 pt-12 min-h-0">
                    
                    {/* TV Monitor Container con Efecto Cristal */}
                    <div className="relative w-full max-w-[850px] aspect-video rounded-[2rem] border-2 border-purple-900/50 bg-black overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,1),0_0_40px_rgba(88,28,135,0.2)] ring-4 ring-black shrink-0 relative">
                        
                        {/* Brillo Bisel TV */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-white/5 pointer-events-none rounded-[3rem] z-20" />
                        {/* Scanlines Profesionales */}
                        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.2)_2px,rgba(0,0,0,0.2)_4px)] z-20 pointer-events-none mix-blend-overlay" />
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.8)_100%)] z-20 pointer-events-none" />

                        {previewUrl ? (
                            <div className="w-full h-full relative group">
                                {previewType === 'video' ? (
                                    <video src={previewUrl} className="w-full h-full object-cover scale-[1.02]" autoPlay muted loop playsInline />
                                ) : (
                                    <img src={previewUrl} className="w-full h-full object-cover scale-[1.02]" alt="Live Preview" />
                                )}
                                <div className="absolute inset-0 bg-[#000] transition-opacity duration-1000 pointer-events-none opacity-0 mix-blend-screen glitch-active" />
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full w-full bg-zinc-950">
                                <div className="w-32 h-32 rounded-full border border-white/5 flex items-center justify-center mb-6">
                                    <Signal size={40} className="text-white/10 animate-pulse" />
                                </div>
                                <p className="text-[11px] text-white/20 font-black uppercase tracking-[0.3em] text-center px-8">
                                    MONITOR STANDBY
                                </p>
                                <p className="text-[8px] text-white/10 tracking-[0.2em] font-bold uppercase mt-2">
                                    ESPERANDO SEÑAL DE INYECCIÓN
                                </p>
                            </div>
                        )}

                        {/* Etiqueta LIVE */}
                        <div className="absolute top-6 right-6 z-30 flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-full border border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.3)]">
                            <div className={`w-2 h-2 rounded-full ${previewUrl ? 'bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,1)]' : 'bg-white/20'}`} />
                            <span className={`text-[9px] font-black uppercase tracking-widest ${previewUrl ? 'text-white' : 'text-white/40'}`}>RETORNO</span>
                        </div>

                        {/* Tag Bottom */}
                        <div className="absolute bottom-6 left-0 right-0 flex justify-center z-30">
                            <div className="px-4 py-1.5 bg-black/60 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-2">
                                <span className={selectedPreviewId ? "text-[8px] font-black uppercase tracking-widest text-amber-400" : "text-[8px] font-black uppercase tracking-widest text-emerald-400"}>
                                    {selectedPreviewId ? 'PREVISUALIZACIÓN' : 'LIVE MONITOR'}
                                </span>
                                <div className="w-[1px] h-3 bg-white/20" />
                                <span className={selectedPreviewId ? "text-[8px] font-black uppercase tracking-widest text-amber-500/50" : "text-[8px] font-black uppercase tracking-widest text-white/50"}>
                                    {previewUrl ? previewTownsText : 'Muro Vivo RMN'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* GESTIÓN DE CAMPAÑAS INTELIGENTES */}
                    <div className="w-full max-w-[850px] mt-6 bg-black/40 backdrop-blur-3xl border-t border-x border-purple-900/30 rounded-t-[2rem] p-6 shadow-[0_-20px_40px_rgba(88,28,135,0.1)] flex-1 overflow-hidden flex flex-col shrink-0">
                        <div className="flex items-center justify-between mb-6 shrink-0">
                            <h3 className="text-[12px] font-[1000] uppercase tracking-[0.2em] text-white flex items-center gap-2">
                                <Server size={14} className="text-violet-400" />
                                Programación Maestra de Campañas
                            </h3>
                            <div className="flex items-center gap-2">
                                <div className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30">
                                    <span className="text-[8px] font-black uppercase tracking-widest text-emerald-400">{activeCount} Vivas</span>
                                </div>
                                <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
                                    <span className="text-[8px] font-black uppercase tracking-widest text-white/40">{allBroadcasts.length} Total</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth pr-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {allBroadcasts.map(bc => {
                                    const isSelected = selectedPreviewId === bc.id;
                                    const isEditing = editingBcId === bc.id;

                                    return (
                                        <div 
                                            key={bc.id} 
                                            onClick={() => setSelectedPreviewId(isSelected ? null : bc.id!)}
                                            className={`flex flex-col p-4 rounded-[1.5rem] border transition-all duration-300 cursor-pointer ${isSelected ? 'border-amber-400/50 shadow-[0_0_20px_rgba(251,191,36,0.15)] bg-amber-900/10' : 'border-white/5 opacity-80 hover:opacity-100 hover:border-white/10 bg-[#050505]'}`}
                                        >
                                            {/* Card Header */}
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${bc.active ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]'}`} />
                                                    <p className={`text-[10px] font-bold truncate max-w-[120px] ${isSelected ? 'text-amber-400' : (bc.active ? 'text-white' : 'text-white/60')}`} title={bc.title}>{bc.title}</p>
                                                </div>
                                                <div className="flex items-center gap-0.5">
                                                    <button onClick={(e) => { e.stopPropagation(); handleToggle(bc.id!, bc.active); }} className={`p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-all ${isSelected ? 'hover:bg-amber-400/20 text-amber-200/50' : ''}`}>
                                                        {bc.active ? <Pause size={12} className="text-amber-400" /> : <Play size={12} className="text-emerald-400" />}
                                                    </button>
                                                    <button onClick={(e) => { e.stopPropagation(); setEditingBcId(isEditing ? null : bc.id!); setEditStart(bc.scheduledStart || ''); setEditEnd(bc.scheduledEnd || ''); }} className={`p-1.5 rounded-lg transition-all ${isEditing ? 'bg-violet-500/20 text-violet-400' : 'text-white/40 hover:text-white hover:bg-white/10'} ${isSelected && !isEditing ? 'hover:bg-amber-400/20 text-amber-200/50' : ''}`}>
                                                        <Edit2 size={12} />
                                                    </button>
                                                    <button onClick={(e) => { e.stopPropagation(); handleDelete(bc.id!); }} className={`p-1.5 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all ${isSelected ? 'hover:bg-red-500/20 text-red-300/50' : ''}`}>
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Detalles Target */}
                                            <p className={`text-[7px] uppercase tracking-widest px-1 mb-2 truncate ${isSelected ? 'text-amber-400/50' : 'text-white/30'}`}>
                                                {!bc.targetTowns || bc.targetTowns.includes('global') ? '🌐 GLOBAL' : '📍 ' + bc.targetTowns.join(', ').replace(/-/g, ' ').toUpperCase()} | {bc.targetCategories.includes('all') ? 'TODO' : bc.targetCategories.length + ' CATS'}
                                            </p>

                                            {/* Schedule Edit Panel */}
                                            {isEditing ? (
                                                <div className="mt-auto pt-3 border-t border-white/5 space-y-2" onClick={e => e.stopPropagation()}>
                                                    <div className="flex items-center gap-2">
                                                        <Calendar size={10} className="text-white/30 shrink-0" />
                                                        <input type="datetime-local" value={editStart} onChange={e => setEditStart(e.target.value)} className="bg-black border border-white/10 rounded-lg px-2 py-1.5 text-[9px] flex-1 outline-none focus:border-violet-500/50 text-white w-full" title="Inicio Programado" />
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Clock size={10} className="text-white/30 shrink-0" />
                                                        <input type="datetime-local" value={editEnd} onChange={e => setEditEnd(e.target.value)} className="bg-black border border-white/10 rounded-lg px-2 py-1.5 text-[9px] flex-1 outline-none focus:border-violet-500/50 text-white w-full" title="Fin Programado" />
                                                    </div>
                                                    <div className="flex justify-end gap-1.5 pt-1">
                                                        <button onClick={() => setEditingBcId(null)} className="px-2 py-1 text-[8px] font-bold text-white/40 hover:text-white rounded-lg">CANC</button>
                                                        <button onClick={async () => {
                                                            await editarBroadcast(bc.id!, { scheduledStart: editStart, scheduledEnd: editEnd });
                                                            const updated = await obtenerBroadcasts(townId);
                                                            setAllBroadcasts(updated);
                                                            setEditingBcId(null);
                                                            
                                                            // Inform Ari
                                                            setAriMsgs(prev => [...prev, { role: 'ari', text: `Calendario actualizado para la campaña "${bc.title}". Todo en línea, Director.` }]);
                                                        }} className="px-2 py-1 text-[8px] font-bold bg-violet-600/20 text-violet-300 hover:bg-violet-600/40 border border-violet-500/30 rounded-lg flex items-center gap-1"><Save size={10}/> GO</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className={`mt-auto pt-2 border-t flex flex-col gap-1 ${isSelected ? 'border-amber-400/20' : 'border-white/5'}`}>
                                                    <div className={`flex items-center justify-between text-[7px] tracking-widest uppercase font-bold ${isSelected ? 'text-amber-400/40' : 'text-white/30'}`}>
                                                        <span className="flex items-center gap-1"><Play size={8} /> INICIA:</span>
                                                        <span className={bc.scheduledStart ? 'text-violet-300' : (isSelected ? 'text-amber-400/30' : 'text-white/20')}>{bc.scheduledStart ? new Date(bc.scheduledStart).toLocaleString('es-AR') : 'MANUAL'}</span>
                                                    </div>
                                                    <div className={`flex items-center justify-between text-[7px] tracking-widest uppercase font-bold ${isSelected ? 'text-amber-400/40' : 'text-white/30'}`}>
                                                        <span className="flex items-center gap-1"><Pause size={8} /> FRENA:</span>
                                                        <span className={bc.scheduledEnd ? 'text-amber-300' : (isSelected ? 'text-amber-400/30' : 'text-white/20')}>{bc.scheduledEnd ? new Date(bc.scheduledEnd).toLocaleString('es-AR') : 'S/ FECHA'}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ==================================================== */}
                {/* PILAR 3: CEREBRO ARI (DERECHA)                       */}
                {/* ==================================================== */}
                <div className="flex-none xl:w-[550px] h-full bg-black/40 backdrop-blur-3xl border-2 border-purple-900/50 rounded-3xl overflow-hidden flex flex-col relative shadow-[0_0_50px_rgba(88,28,135,0.2)] shrink-0">
                    <div className="bg-gradient-to-r from-violet-900/50 to-indigo-900/50 p-4 border-b border-violet-500/30 flex items-center gap-4">
                        <div className="relative">
                            <div className="w-12 h-12 rounded-2xl bg-black border border-violet-500/50 flex items-center justify-center relative z-10 shadow-[0_0_15px_rgba(139,92,246,0.4)]">
                                <Cpu size={24} className="text-violet-400" />
                            </div>
                            <div className="absolute inset-0 bg-violet-500 blur-xl opacity-40 animate-pulse"></div>
                            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-black rounded-full z-20 shadow-[0_0_10px_rgba(16,185,129,0.8)]"></span>
                        </div>
                        <div>
                            <h2 className="text-[16px] font-[1000] uppercase tracking-widest text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">Ari</h2>
                            <p className="text-[8px] text-violet-300 font-bold tracking-[0.3em] uppercase">Analista Base · Lista</p>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-5 pb-20 space-y-4 no-scrollbar">
                        {ariMsgs.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'ari' ? 'justify-start' : 'justify-end'}`}>
                                <div className={`max-w-[85%] rounded-2xl p-4 text-[12px] leading-relaxed ${
                                    msg.role === 'ari' 
                                    ? 'bg-violet-900/20 border border-violet-500/30 text-white rounded-tl-sm shadow-[0_5px_15px_rgba(139,92,246,0.1)]' 
                                    : 'bg-emerald-900/20 border border-emerald-500/30 text-white rounded-tr-sm shadow-[0_5px_15px_rgba(16,185,129,0.1)]'
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
                                onKeyDown={e => e.key === 'Enter' && handleSendAri()}
                                placeholder="Escribile a Ari o dale una orden..."
                                className="flex-1 bg-transparent text-white text-[12px] px-3 outline-none placeholder:text-white/20"
                            />
                            <button onClick={handleSendAri} className="w-10 h-10 bg-violet-500/20 hover:bg-violet-500 border border-violet-500/50 rounded-xl flex items-center justify-center text-violet-300 hover:text-white transition-all active:scale-90">
                                <MessageSquare size={16} />
                            </button>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
};

export default LiveBroadcastPage;
