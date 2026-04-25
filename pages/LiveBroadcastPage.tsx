import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
    ChevronLeft, Megaphone, Radio, Tv, Signal, 
    Trash2, Power, MonitorPlay
} from 'lucide-react';
import { playNeonClick } from '../utils/audio';
import { 
    guardarBroadcast, obtenerBroadcasts, eliminarBroadcast, toggleBroadcast, Broadcast 
} from '../firebase';
import { CATEGORIES } from '../constants';
import { DobermanBadge } from '../components/DobermanBadge';

const LiveBroadcastPage: React.FC = () => {
    const { townId = 'esteban-echeverria' } = useParams<{ townId: string }>();
    const navigate = useNavigate();

    const [broadcastUrl, setBroadcastUrl] = useState('');
    const [broadcastTitle, setBroadcastTitle] = useState('');
    const [broadcastType, setBroadcastType] = useState<'image' | 'video'>('image');
    const [targetCats, setTargetCats] = useState<string[]>(['all']);
    const [allBroadcasts, setAllBroadcasts] = useState<Broadcast[]>([]);
    const [transmitting, setTransmitting] = useState(false);

    useEffect(() => {
        obtenerBroadcasts(townId).then(setAllBroadcasts);
    }, [townId]);

    const activeCount = allBroadcasts.filter(b => b.active).length;

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
            active: true,
            priority: 1,
            townId,
            createdBy: 'Director'
        });
        setBroadcastUrl('');
        setBroadcastTitle('');
        const updated = await obtenerBroadcasts(townId);
        setAllBroadcasts(updated);
        setTransmitting(false);
    };

    const handleToggle = async (id: string, active: boolean) => {
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

    return (
        <div className="min-h-screen h-screen bg-black text-white flex flex-col overflow-hidden selection:bg-red-500/30">
            {/* === BACKGROUND === */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full blur-[150px] opacity-15 bg-red-600" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full blur-[120px] opacity-10 bg-cyan-500" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:60px_60px]" />
                {/* Scanlines */}
                <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.03)_2px,rgba(0,0,0,0.03)_4px)]" />
            </div>

            {/* === HEADER === */}
            <header className="relative z-10 bg-zinc-950/80 backdrop-blur-2xl border-b-2 border-red-500/20 px-6 py-4 flex items-center justify-between shadow-[0_4px_30px_rgba(239,68,68,0.1)]">
                <button onClick={() => { playNeonClick(); navigate(-1); }} className="text-white/40 hover:text-white transition-colors">
                    <ChevronLeft size={24} />
                </button>
                <div className="flex flex-col items-center flex-1">
                    <div className="flex items-center gap-3 mb-1">
                        <Radio size={20} className="text-red-500 drop-shadow-[0_0_12px_rgba(239,68,68,0.8)] animate-pulse" />
                        <h1 className="text-[15px] font-[1000] uppercase tracking-[0.15em] text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                            Centro de Transmisión
                        </h1>
                        <Radio size={20} className="text-red-500 drop-shadow-[0_0_12px_rgba(239,68,68,0.8)] animate-pulse" />
                    </div>
                    <p className="text-[8px] font-black uppercase tracking-[0.4em] text-red-400/60">
                        Retail Media Network · {townId.replace(/-/g, ' ').toUpperCase()}
                    </p>
                </div>
                <DobermanBadge />
            </header>

            {/* === MAIN CONTENT === */}
            <main className="flex-1 relative z-10 overflow-y-auto px-6 py-6 max-w-3xl mx-auto w-full">
                
                {/* Status Bar */}
                <div className="flex items-center justify-between mb-8 bg-zinc-900/60 border border-white/5 rounded-2xl px-5 py-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${activeCount > 0 ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-pulse' : 'bg-white/10'}`} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Estado del Canal</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="text-center">
                            <p className="text-[22px] font-[1000] text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)] leading-none">{activeCount}</p>
                            <p className="text-[7px] font-black uppercase tracking-widest text-white/30 mt-1">Activas</p>
                        </div>
                        <div className="text-center">
                            <p className="text-[22px] font-[1000] text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)] leading-none">{allBroadcasts.length}</p>
                            <p className="text-[7px] font-black uppercase tracking-widest text-white/30 mt-1">Total</p>
                        </div>
                        <div className="text-center">
                            <p className="text-[22px] font-[1000] text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)] leading-none">{targetCats.includes('all') ? '∞' : targetCats.length}</p>
                            <p className="text-[7px] font-black uppercase tracking-widest text-white/30 mt-1">Target</p>
                        </div>
                    </div>
                </div>

                {/* === FORM DE TRANSMISIÓN === */}
                <div className="bg-gradient-to-br from-red-950/20 via-zinc-900/80 to-zinc-900/80 border-2 border-red-500/15 rounded-3xl p-6 mb-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
                    
                    <h2 className="text-[12px] font-[1000] uppercase tracking-[0.2em] text-red-400 flex items-center gap-2 mb-6">
                        <Megaphone size={16} className="drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                        Nueva Transmisión
                    </h2>

                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/30 ml-1">Título de la Campaña</label>
                            <input 
                                type="text" 
                                value={broadcastTitle}
                                onChange={e => setBroadcastTitle(e.target.value)}
                                placeholder="Ej: Cerveza Quilmes - Promo Verano 🍺"
                                className="w-full bg-black/60 border border-red-500/15 rounded-xl px-5 py-4 text-sm text-white placeholder:text-white/15 focus:outline-none focus:border-red-500/40 focus:shadow-[0_0_20px_rgba(239,68,68,0.1)] transition-all"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/30 ml-1">URL del Media</label>
                            <input 
                                type="text" 
                                value={broadcastUrl}
                                onChange={e => {
                                    setBroadcastUrl(e.target.value);
                                    if (/\.(mp4|webm|mov)($|\?)/i.test(e.target.value)) setBroadcastType('video');
                                    else setBroadcastType('image');
                                }}
                                placeholder="https://... imagen o video (.mp4, .webm)"
                                className="w-full bg-black/60 border border-red-500/15 rounded-xl px-5 py-4 text-sm text-white placeholder:text-white/15 focus:outline-none focus:border-red-500/40 focus:shadow-[0_0_20px_rgba(239,68,68,0.1)] transition-all"
                            />
                        </div>

                        {/* Preview */}
                        {broadcastUrl && (
                            <div className="rounded-xl overflow-hidden border border-white/10 h-32 bg-black/40">
                                {broadcastType === 'video' ? (
                                    <video src={broadcastUrl} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                                ) : (
                                    <img src={broadcastUrl} className="w-full h-full object-cover" alt="Preview" />
                                )}
                            </div>
                        )}

                        {/* Tipo */}
                        <div className="flex items-center gap-3">
                            <span className="text-[8px] text-white/30 font-bold uppercase tracking-[0.2em]">Formato:</span>
                            <button onClick={() => setBroadcastType('image')} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all duration-200 ${broadcastType === 'image' ? 'bg-red-500/15 border-red-500/30 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.15)]' : 'bg-white/[0.02] border-white/10 text-white/25'}`}>
                                🖼️ Imagen
                            </button>
                            <button onClick={() => setBroadcastType('video')} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all duration-200 ${broadcastType === 'video' ? 'bg-red-500/15 border-red-500/30 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.15)]' : 'bg-white/[0.02] border-white/10 text-white/25'}`}>
                                🎬 Video
                            </button>
                        </div>

                        {/* Categorías */}
                        <div>
                            <label className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/30 ml-1 block mb-3">Transmitir a:</label>
                            <div className="flex flex-wrap gap-2">
                                <button 
                                    onClick={() => toggleCat('all')}
                                    className={`px-4 py-2 rounded-full text-[8px] font-black uppercase tracking-widest border transition-all duration-200 ${targetCats.includes('all') ? 'bg-red-500/15 border-red-500/30 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.2)]' : 'bg-white/[0.02] border-white/10 text-white/25 hover:border-white/20'}`}
                                >🌐 Todo el Hormiguero</button>
                                {CATEGORIES.map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => toggleCat(cat.id)}
                                        className={`px-3 py-1.5 rounded-full text-[7px] font-black uppercase tracking-widest border transition-all duration-200 ${targetCats.includes(cat.id) ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400' : 'bg-white/[0.02] border-white/[0.06] text-white/20 hover:border-white/15'}`}
                                    >{cat.name}</button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* === BOTÓN TRANSMITIR === */}
                <button 
                    onClick={handleTransmit}
                    disabled={transmitting || !broadcastUrl.trim() || !broadcastTitle.trim()}
                    className="w-full py-5 bg-gradient-to-r from-red-700 via-red-600 to-red-700 rounded-2xl text-white font-[1000] uppercase tracking-[0.3em] text-[13px] shadow-[0_6px_0_rgba(127,29,29,1),0_12px_40px_rgba(239,68,68,0.25)] active:translate-y-[6px] active:shadow-[0_0_0_rgba(127,29,29,1),0_5px_15px_rgba(239,68,68,0.15)] transition-all duration-75 flex items-center justify-center gap-3 disabled:opacity-30 disabled:cursor-not-allowed mb-8 relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    <Signal size={20} className={transmitting ? 'animate-ping' : ''} />
                    {transmitting ? '📡 Transmitiendo...' : '📡 TRANSMITIR A TODOS LOS MUROS'}
                </button>

                {/* === LISTA DE TRANSMISIONES === */}
                {allBroadcasts.length > 0 && (
                    <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-5 mb-8">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
                                <Tv size={14} className="text-red-400/50" />
                                Transmisiones en el Hormiguero
                            </h3>
                            <span className="text-[8px] font-black text-red-400/50 uppercase tracking-widest">
                                {activeCount} en vivo
                            </span>
                        </div>
                        <div className="space-y-2">
                            {allBroadcasts.map(bc => (
                                <div key={bc.id} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 ${bc.active ? 'bg-gradient-to-r from-red-950/20 to-transparent border-red-500/15 shadow-[inset_0_0_20px_rgba(239,68,68,0.03)]' : 'bg-white/[0.01] border-white/[0.04] opacity-40'}`}>
                                    {/* Status dot */}
                                    <div className={`w-3 h-3 rounded-full shrink-0 ${bc.active ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse' : 'bg-white/10'}`} />
                                    
                                    {/* Thumbnail */}
                                    <div className="w-14 h-10 rounded-lg overflow-hidden border border-white/10 shrink-0 bg-black/40">
                                        {bc.mediaType === 'video' ? (
                                            <video src={bc.mediaUrl} className="w-full h-full object-cover" muted />
                                        ) : (
                                            <img src={bc.mediaUrl} className="w-full h-full object-cover" alt="" />
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[11px] font-bold text-white truncate">{bc.title}</p>
                                        <p className="text-[7px] text-white/25 uppercase tracking-widest mt-0.5">
                                            {bc.mediaType === 'video' ? '🎬' : '🖼️'} {bc.mediaType} · {bc.targetCategories.join(', ')}
                                        </p>
                                    </div>

                                    {/* Controls */}
                                    <button 
                                        onClick={() => handleToggle(bc.id!, bc.active)} 
                                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest border transition-all duration-200 ${bc.active ? 'border-red-500/30 text-red-400 bg-red-500/10 shadow-[0_0_10px_rgba(239,68,68,0.1)]' : 'border-white/10 text-white/30 bg-white/[0.02]'}`}
                                    >
                                        <Power size={12} />
                                        {bc.active ? 'ON' : 'OFF'}
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(bc.id!)} 
                                        className="text-white/10 hover:text-red-400 transition-colors p-2"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty state */}
                {allBroadcasts.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <MonitorPlay size={48} className="text-white/5 mb-4" />
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/15">
                            No hay transmisiones activas
                        </p>
                        <p className="text-[8px] text-white/10 mt-1 uppercase tracking-widest">
                            Creá tu primera campaña de Retail Media
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default LiveBroadcastPage;
