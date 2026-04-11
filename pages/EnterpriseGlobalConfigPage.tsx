import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
    ChevronLeft, Save, Palette, Type, Globe, 
    Snowflake, Sun, Flower2, TreePine, Layout,
    Check, AlertCircle, Factory, Settings
} from 'lucide-react';
import { playNeonClick } from '../utils/audio';
import { subscribeToEnterpriseConfig, saveEnterpriseConfig } from '../firebase_enterprise';

const EnterpriseGlobalConfigPage: React.FC = () => {
    const navigate = useNavigate();
    
    const [config, setConfig] = useState<any>({
        mainTitle: "Directorio Industrial",
        mainSubtitle: "Conectando la fuerza productiva",
        theme: 'default',
        primaryColor: '#f59e0b',
        townName: 'Argentina',
        bgColor: '#000000'
    });
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        const unsubscribe = subscribeToEnterpriseConfig((updatedConfig) => {
            if (updatedConfig) {
                setConfig(updatedConfig);
            }
        });
        return () => unsubscribe();
    }, []);

    const handleSave = async () => {
        const confirmed = window.confirm(
            `¿Confirmás los cambios estéticos para el NODO INDUSTRIAL GLOBAL?\n\n"${config.townName || 'Argentina'}"`
        );
        if (!confirmed) return;

        setSaving(true);
        setMessage(null);
        playNeonClick();
        try {
            await saveEnterpriseConfig(config);
            setMessage({ type: 'success', text: `¡Configuración Industrial guardada! 🏭✨` });
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            setMessage({ type: 'error', text: `Error al guardar la configuración industrial` });
        } finally {
            setSaving(false);
        }
    };

    const themes = [
        { id: 'default', name: 'Industrial Amber', icon: <Factory size={20} />, color: '#f59e0b' },
        { id: 'christmas', name: 'Navidad B2B 🎄', icon: <TreePine size={20} />, color: '#ef4444' },
        { id: 'winter', name: 'Invierno B2B ❄️', icon: <Snowflake size={20} />, color: '#3b82f6' },
        { id: 'summer', name: 'Verano B2B ☀️', icon: <Sun size={20} />, color: '#f59e0b' },
        { id: 'spring', name: 'Primavera B2B 🌸', icon: <Flower2 size={20} />, color: '#ec4899' },
    ];

    const hexToRgba = (hex: string, alpha: number) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    return (
        <div className="min-h-screen bg-black text-white pb-24 relative overflow-hidden selection:bg-amber-500/30">
            {/* Ambient background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] opacity-20" style={{ backgroundColor: config.primaryColor }} />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-[120px] opacity-10" style={{ backgroundColor: config.primaryColor }} />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(245,158,11,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(245,158,11,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
            </div>

            {/* Header Sticky */}
            <div className="bg-zinc-900/80 backdrop-blur-xl border-b border-amber-500/20 pt-10 pb-4 px-6 relative z-10 sticky top-0 shadow-2xl flex items-center justify-between">
                <button onClick={() => { playNeonClick(); navigate(`/empresas/control-maestro`); }} className="text-white/50 hover:text-white transition-colors">
                    <ChevronLeft size={24} />
                </button>
                <div className="flex flex-col items-center flex-1">
                    <Settings size={20} className="mb-1 text-amber-500" />
                    <h1 className="text-sm font-[1000] uppercase tracking-[0.1em] text-white text-center leading-tight">
                        Editor Industrial
                    </h1>
                    <p className="text-[9px] font-bold uppercase tracking-widest mt-0.5 text-amber-400">
                        {config.townName || 'Argentina'}
                    </p>
                </div>
                <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-amber-500 text-black px-4 py-2 rounded-xl text-[9px] font-[1000] uppercase tracking-widest shadow-lg active:scale-90 transition-all flex items-center gap-1.5"
                >
                    {saving ? <span className="animate-pulse">...</span> : <><Save size={14} /> Guardar</>}
                </button>
            </div>

            <div className="px-6 mt-8 space-y-8 relative z-10 max-w-lg mx-auto">
                {message && (
                    <div className={`p-4 rounded-2xl flex items-center gap-3 border animate-in fade-in slide-in-from-top-2 ${
                        message.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
                    }`}>
                        {message.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
                        <span className="text-[11px] font-bold uppercase tracking-wider">{message.text}</span>
                    </div>
                )}

                {/* Section: Estética Industrial */}
                <section className="space-y-4">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500/50 flex items-center gap-2 border-b border-amber-500/10 pb-2">
                        <Palette size={14} /> Sinfonía B2B
                    </h2>
                    <div className="grid grid-cols-1 gap-3">
                        {themes.map((theme) => (
                            <button
                                key={theme.id}
                                onClick={() => { playNeonClick(); setConfig({ ...config, theme: theme.id, primaryColor: theme.color }); }}
                                className={`group p-4 rounded-2xl border transition-all flex items-center justify-between overflow-hidden relative ${
                                    config.theme === theme.id 
                                    ? 'bg-amber-500/10 border-amber-500/40 ring-2 ring-amber-500/10' 
                                    : 'bg-zinc-900/40 border-white/5 hover:border-white/20'
                                }`}
                            >
                                <div className="flex items-center gap-4 relative z-10">
                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110" style={{ backgroundColor: hexToRgba(theme.color, 0.2), color: theme.color, border: `1px solid ${hexToRgba(theme.color, 0.3)}` }}>
                                        {theme.icon}
                                    </div>
                                    <div className="text-left">
                                        <h3 className={`text-[13px] font-[1000] uppercase tracking-wider transition-colors ${config.theme === theme.id ? 'text-white' : 'text-white/70'}`}>
                                            {theme.name}
                                        </h3>
                                        <p className="text-[9px] text-white/30 uppercase tracking-widest mt-0.5">Atmósfera {theme.id}</p>
                                    </div>
                                </div>
                                {config.theme === theme.id && (
                                    <div className="relative z-10 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center text-black">
                                        <Check size={14} strokeWidth={3} />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Section: Textos Industrial */}
                <section className="space-y-4">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500/50 flex items-center gap-2 border-b border-amber-500/10 pb-2">
                        <Type size={14} /> Textos del Directorio
                    </h2>
                    
                    <div className="space-y-5 bg-zinc-900/40 p-5 rounded-[2rem] border border-white/5">
                        <div className="space-y-2">
                            <label className="text-[8px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">Título Principal</label>
                            <input 
                                type="text"
                                value={config.mainTitle}
                                onChange={(e) => setConfig({ ...config, mainTitle: e.target.value })}
                                className="w-full bg-black/50 border border-white/10 rounded-xl py-3.5 px-4 text-xs font-bold focus:border-amber-500/30 focus:outline-none transition-colors"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[8px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">Descripción / Eslogan</label>
                            <input 
                                type="text"
                                value={config.mainSubtitle}
                                onChange={(e) => setConfig({ ...config, mainSubtitle: e.target.value })}
                                className="w-full bg-black/50 border border-white/10 rounded-xl py-3.5 px-4 text-xs font-bold focus:border-amber-500/30 focus:outline-none transition-colors"
                            />
                        </div>
                    </div>
                </section>

                {/* Section: Identidad Visual */}
                <section className="space-y-4">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500/50 flex items-center gap-2 border-b border-amber-500/10 pb-2">
                        <Palette size={14} /> Color de Identidad B2B
                    </h2>
                    
                    <div className="bg-zinc-900/40 p-5 rounded-[2rem] border border-white/5 flex items-center gap-6">
                        <input 
                            type="color"
                            value={config.primaryColor}
                            onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                            className="w-16 h-16 rounded-2xl bg-transparent border-none cursor-pointer"
                        />
                        <div className="flex-1">
                            <p className="text-[11px] font-black uppercase tracking-widest text-white">{config.primaryColor}</p>
                            <p className="text-[9px] text-white/40 uppercase tracking-widest mt-1">Este color bañará los brillos y acentos de la Interfaz 1 de Empresas.</p>
                        </div>
                    </div>
                </section>

                {/* Section: Fondo B2B */}
                <section className="space-y-4">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500/50 flex items-center gap-2 border-b border-amber-500/10 pb-2">
                        <Layout size={14} /> Color de Fondo Industrial
                    </h2>
                    
                    <div className="bg-zinc-900/40 p-5 rounded-[2rem] border border-white/5 space-y-4">
                        <div className="grid grid-cols-3 gap-3">
                            {['#000000', '#0a0a0a', '#1a1005', '#0f1a1a', '#1a0a0a', '#0a0a1a'].map(color => (
                                <button
                                    key={color}
                                    onClick={() => { playNeonClick(); setConfig({ ...config, bgColor: color }); }}
                                    className={`p-3 rounded-xl border transition-all ${(config.bgColor || '#000000') === color ? 'border-amber-500/50 ring-2 ring-amber-500/10' : 'border-white/10'}`}
                                >
                                    <div className="w-10 h-10 rounded-lg mx-auto" style={{ backgroundColor: color }} />
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-4 pt-2 border-t border-white/5">
                            <input 
                                type="color"
                                value={config.bgColor || '#000000'}
                                onChange={(e) => setConfig({ ...config, bgColor: e.target.value })}
                                className="w-12 h-12 rounded-xl bg-transparent border-none cursor-pointer"
                            />
                            <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">{config.bgColor || '#000000'}</p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default EnterpriseGlobalConfigPage;
