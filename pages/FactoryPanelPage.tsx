import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Factory, Plus, ChevronLeft, Globe, 
    Settings, Zap, Shield, Trash2, Building2, MapPin
} from 'lucide-react';
import { playNeonClick } from '../utils/audio';
import { subscribeToTowns, saveTown } from '../firebase';

const FactoryPanelPage: React.FC = () => {
    const navigate = useNavigate();
    const [towns, setTowns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForgeForm, setShowForgeForm] = useState(false);
    const [newTown, setNewTown] = useState({ 
        id: '', 
        name: '', 
        localities: '',
        description: 'Nueva expansión de ShopDigital'
    });
    const [status, setStatus] = useState<{ type: 'idle' | 'forging' | 'success' | 'error', message?: string }>({ type: 'idle' });

    useEffect(() => {
        const unsubscribe = subscribeToTowns((data) => {
            setTowns(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleForge = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTown.name || !newTown.id) return;
        
        playNeonClick();
        setStatus({ type: 'forging' });
        
        try {
            const localitiesArray = newTown.localities.split(',').map(l => l.trim()).filter(l => l);
            await saveTown({
                id: newTown.id.toLowerCase().trim().replace(/\s+/g, '-'),
                name: newTown.name,
                localities: localitiesArray,
                description: newTown.description,
                isActive: true,
                createdAt: new Date().toISOString()
            });
            
            setStatus({ type: 'success', message: `¡Zona ${newTown.name} forjada con éxito! 🏭🔥` });
            setTimeout(() => {
                setShowForgeForm(false);
                setStatus({ type: 'idle' });
                setNewTown({ id: '', name: '', localities: '', description: 'Nueva expansión de ShopDigital' });
            }, 3000);
        } catch (error) {
            console.error("Error forging town:", error);
            setStatus({ type: 'error', message: 'Error en la forja. El metal está frío.' });
        }
    };

    const copyUrl = (townId: string) => {
        playNeonClick();
        const url = `${window.location.origin}/?z=${townId}`;
        navigator.clipboard.writeText(url);
        alert(`¡URL Copiada! Comparte esta zona: ${url}`);
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-cyan-500 selection:text-black">
            {/* Animated Background Layers */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-900/10 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 blur-[120px] rounded-full animate-pulse delay-1000" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none" />
            </div>

            <main className="relative z-10 max-w-lg mx-auto pb-24 pt-8 px-5">
                {/* Header */}
                <header className="flex items-center justify-between mb-8">
                    <button 
                        onClick={() => { playNeonClick(); navigate('/tablero-maestro'); }}
                        className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center active:scale-90 transition-all"
                    >
                        <ChevronLeft size={20} className="text-white/60" />
                    </button>
                    <div className="text-center flex-1">
                        <h1 className="text-xs font-black uppercase tracking-[0.4em] text-cyan-400">La Fábrica</h1>
                        <p className="text-[9px] text-white/30 uppercase tracking-widest mt-1">Forjador de Expansión Galáctica</p>
                    </div>
                    <div className="w-10" />
                </header>

                {/* Status Message */}
                {status.message && (
                    <div className={`mb-6 p-4 rounded-2xl border text-center animate-in zoom-in-95 duration-300 ${
                        status.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
                    }`}>
                        <p className="text-[10px] font-black uppercase tracking-widest">{status.message}</p>
                    </div>
                )}

                {/* Hero / CTA */}
                {!showForgeForm && (
                    <section className="mb-10 text-center space-y-6">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-3xl border border-cyan-500/30 relative">
                            <Factory size={32} className="text-cyan-400" />
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-500 rounded-full animate-ping opacity-20" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-xl font-black uppercase tracking-tight leading-none italic">Forja el Futuro</h2>
                            <p className="text-[10px] text-white/40 uppercase tracking-widest max-w-[80%] mx-auto leading-relaxed">
                                Crea una nueva instancia de ShopDigital en segundos. Al forjar, se clona todo el ADN maestro para una nueva ciudad.
                            </p>
                        </div>
                        <button 
                            onClick={() => { playNeonClick(); setShowForgeForm(true); }}
                            className="group relative w-full bg-cyan-500 text-black py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] overflow-hidden transition-all active:scale-95 shadow-[0_0_30px_rgba(6,182,212,0.3)] hover:shadow-[0_0_50px_rgba(6,182,212,0.5)]"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                <Plus size={16} strokeWidth={3} /> Forjar Nueva Zona
                            </span>
                            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                        </button>
                    </section>
                )}

                {/* Forge Form */}
                {showForgeForm && (
                    <section className="bg-zinc-900/60 border border-white/10 p-6 rounded-[2.5rem] mb-10 space-y-6 backdrop-blur-xl animate-in slide-in-from-bottom-8 duration-500">
                        <div className="flex items-center justify-between border-b border-white/5 pb-4">
                            <h3 className="text-xs font-black uppercase tracking-widest text-cyan-400">Configuración de Forja</h3>
                            <button onClick={() => setShowForgeForm(false)} className="text-[10px] text-white/20 uppercase hover:text-white transition-colors">Cerrar</button>
                        </div>
                        
                        <form onSubmit={handleForge} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-white/40 ml-1">ID de la Zona (URL Slug)</label>
                                <input 
                                    type="text"
                                    required
                                    placeholder="ej: ezeiza"
                                    value={newTown.id}
                                    onChange={(e) => setNewTown({ ...newTown, id: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 px-4 text-xs font-bold focus:border-cyan-500/50 outline-none transition-colors border-l-4 border-l-cyan-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-white/40 ml-1">Nombre Visual</label>
                                <input 
                                    type="text"
                                    required
                                    placeholder="ej: Ezeiza"
                                    value={newTown.name}
                                    onChange={(e) => setNewTown({ ...newTown, name: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 px-4 text-xs font-bold focus:border-cyan-500/50 outline-none transition-colors"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-white/40 ml-1">Localidades (Separa por comas)</label>
                                <textarea 
                                    required
                                    placeholder="Tristán Suárez, Spegazzini, La Unión..."
                                    value={newTown.localities}
                                    onChange={(e) => setNewTown({ ...newTown, localities: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 px-4 text-xs font-bold focus:border-cyan-500/50 outline-none transition-colors min-h-[80px]"
                                />
                            </div>

                            <button 
                                disabled={status.type === 'forging'}
                                className={`w-full py-4 rounded-xl font-black uppercase tracking-[0.3em] text-[11px] transition-all flex items-center justify-center gap-3 active:scale-95 ${
                                    status.type === 'forging' ? 'bg-cyan-900/20 text-cyan-400 cursor-not-allowed border border-cyan-500/10' : 'bg-white text-black hover:bg-cyan-50 shadow-lg'
                                }`}
                            >
                                {status.type === 'forging' ? (
                                    <>
                                        <Zap size={16} className="animate-pulse" /> Forjando ADN...
                                    </>
                                ) : (
                                    <>
                                        <Zap size={16} /> ¡Comenzar Forja!
                                    </>
                                )}
                            </button>
                        </form>
                    </section>
                )}

                {/* Zones List */}
                <section className="space-y-4">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 flex items-center gap-2 mb-2">
                        <Globe size={14} className="text-cyan-500" /> Zonas Forjadas Activas
                    </h2>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-3 opacity-20">
                            <Zap size={32} className="animate-bounce" />
                            <p className="text-[10px] font-black uppercase tracking-widest">Sincronizando con el Núcleo...</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {towns.map((town) => (
                                <div 
                                    key={town.id}
                                    className="bg-zinc-900/40 border border-white/5 p-5 rounded-[2rem] hover:border-cyan-500/30 transition-all group"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                                                <Building2 size={20} />
                                            </div>
                                            <div>
                                                <h3 className="text-[13px] font-black uppercase tracking-wider">{town.name}</h3>
                                                <p className="text-[8px] text-white/20 uppercase tracking-widest font-mono italic">ID: {town.id}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={() => copyUrl(town.id)}
                                                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-cyan-500/20 active:scale-90 transition-all text-white/40 hover:text-cyan-400"
                                                title="Copiar URL de la Zona"
                                            >
                                                <Globe size={14} />
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-wrap gap-1.5 mt-4">
                                        {town.localities?.slice(0, 4).map((loc: string, idx: number) => (
                                            <span key={idx} className="text-[8px] font-bold uppercase tracking-widest bg-white/5 border border-white/5 px-2.5 py-1.5 rounded-lg text-white/40">
                                                {loc}
                                            </span>
                                        ))}
                                        {town.localities?.length > 4 && (
                                            <span className="text-[8px] font-bold uppercase tracking-widest bg-cyan-500/10 border border-cyan-500/10 px-2.5 py-1.5 rounded-lg text-cyan-400">
                                                +{town.localities.length - 4} más
                                            </span>
                                        )}
                                    </div>
                                    
                                    <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
                                        <div className="flex items-center gap-1.5 text-white/20">
                                            <Shield size={10} />
                                            <span className="text-[8px] font-black uppercase tracking-widest">Seguridad Nivel 5</span>
                                        </div>
                                        <a 
                                            href={`/?z=${town.id}`} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            onClick={() => playNeonClick()}
                                            className="text-[9px] font-black uppercase tracking-widest bg-white text-black px-4 py-2 rounded-xl group-hover:bg-cyan-400 transition-colors"
                                        >
                                            Entrar a Zona
                                        </a>
                                    </div>
                                </div>
                            ))}
                            
                            {towns.length === 0 && (
                                <div className="p-12 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
                                    <MapPin size={32} className="mx-auto text-white/5 mb-4" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Aún no hay zonas forjadas</p>
                                    <p className="text-[8px] text-white/10 uppercase tracking-widest mt-2 leading-relaxed">
                                        Comienza la expansión creando la primera zona fuera de Esteban Echeverría.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

export default FactoryPanelPage;
