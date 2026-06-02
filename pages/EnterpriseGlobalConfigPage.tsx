import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { 
    ChevronLeft, Save, Palette, Type, Globe, 
    Snowflake, Sun, Flower2, TreePine, Layout,
    Check, AlertCircle, Factory, Settings
} from 'lucide-react';
import { playNeonClick } from '../utils/audio';
import { subscribeToEnterpriseConfig, saveEnterpriseConfig } from '../firebase_enterprise';

const EnterpriseGlobalConfigPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const queryParams = new URLSearchParams(location.search);
    const provinciaParam = queryParams.get('provincia') || 'buenos-aires';
    
    const [config, setConfig] = useState<any>({
        mainTitle: "Directorio Industrial",
        mainSubtitle: "Conectando la fuerza productiva",
        theme: 'default',
        primaryColor: '#f59e0b',
        townName: 'Argentina',
        bgColor: '#000000',
        themeMode: 'auto'
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
        <div className="min-h-screen text-white pb-24 relative overflow-hidden selection:bg-amber-500/30" style={{ background: 'linear-gradient(165deg, #1a1005 0%, #0f0d06 40%, #12100a 100%)' }}>
            {/* Ambient background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] opacity-30" style={{ backgroundColor: config.primaryColor }} />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-[120px] opacity-15" style={{ backgroundColor: config.primaryColor }} />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(245,158,11,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(245,158,11,0.04)_1px,transparent_1px)] bg-[size:40px_40px]" />
            </div>

            {/* Header Sticky */}
            <div className="backdrop-blur-xl border-b border-amber-500/30 pt-10 pb-4 px-6 relative z-10 sticky top-0 flex items-center justify-between" style={{ background: 'rgba(26, 16, 5, 0.9)', boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 20px rgba(245,158,11,0.08)' }}>
                <button onClick={() => { playNeonClick(); navigate(`/empresas/tablero-maestro?provincia=${provinciaParam}`); }} className="text-amber-400/70 hover:text-amber-300 transition-colors">
                    <ChevronLeft size={24} />
                </button>
                <div className="flex flex-col items-center flex-1">
                    <Settings size={20} className="mb-1 text-amber-400" style={{ filter: 'drop-shadow(0 0 6px rgba(245,158,11,0.4))' }} />
                    <h1 className="text-sm font-[1000] uppercase tracking-[0.1em] text-white text-center leading-tight" style={{ textShadow: '0 0 12px rgba(245,158,11,0.3)' }}>
                        Editor Industrial
                    </h1>
                    <p className="text-[9px] font-bold uppercase tracking-widest mt-0.5 text-amber-400" style={{ textShadow: '0 0 8px rgba(245,158,11,0.4)' }}>
                        {config.townName || 'Argentina'}
                    </p>
                </div>
                <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-amber-500 text-black px-4 py-2 rounded-xl text-[9px] font-[1000] uppercase tracking-widest active:scale-90 transition-all flex items-center gap-1.5" style={{ boxShadow: '0 4px 15px rgba(245,158,11,0.4), 0 0 20px rgba(245,158,11,0.15)' }}
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
                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-400/80 flex items-center gap-2 border-b border-amber-500/20 pb-2">
                        <Palette size={14} /> Sinfonía B2B
                    </h2>
                    <div className="grid grid-cols-1 gap-3">
                        {themes.map((theme) => (
                            <button
                                key={theme.id}
                                onClick={() => { playNeonClick(); setConfig({ ...config, theme: theme.id, primaryColor: theme.color }); }}
                                className={`group p-4 rounded-2xl border transition-all flex items-center justify-between overflow-hidden relative ${
                                    config.theme === theme.id 
                                    ? 'bg-amber-500/15 border-amber-500/50 ring-2 ring-amber-500/15' 
                                    : 'bg-zinc-800/50 border-amber-900/20 hover:border-amber-500/30'
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
                                        <p className="text-[9px] text-amber-300/40 uppercase tracking-widest mt-0.5">Atmósfera {theme.id}</p>
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

                {/* Section: Modo de Brillo */}
                <section className="space-y-4">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-400/80 flex items-center gap-2 border-b border-amber-500/20 pb-2">
                        <Sun size={14} /> Brillo de Interfaz
                    </h2>
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { id: 'auto', name: 'Automático 🔄', desc: 'Día / Noche según horario' },
                            { id: 'light', name: 'Modo Día ☀️', desc: 'Champagne y Claridad' },
                            { id: 'dark', name: 'Modo Noche 🌙', desc: 'Cyberpunk Industrial' },
                        ].map((mode) => (
                            <button
                                key={mode.id}
                                onClick={() => { playNeonClick(); setConfig({ ...config, themeMode: mode.id }); }}
                                className={`p-4 rounded-2xl border transition-all flex flex-col items-center justify-center text-center gap-1.5 cursor-pointer ${
                                    (config.themeMode || 'auto') === mode.id
                                    ? 'bg-amber-500/15 border-amber-500/50 ring-2 ring-amber-500/15'
                                    : 'bg-zinc-800/50 border-amber-900/20 hover:border-amber-500/30'
                                }`}
                            >
                                <span className="text-[11px] font-[1000] uppercase tracking-wider text-white">{mode.name}</span>
                                <span className="text-[7.5px] text-amber-300/50 uppercase tracking-widest leading-tight">{mode.desc}</span>
                            </button>
                        ))}
                    </div>
                </section>

                {/* Section: Textos Industrial */}
                <section className="space-y-4">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-400/80 flex items-center gap-2 border-b border-amber-500/20 pb-2">
                        <Type size={14} /> Textos del Directorio
                    </h2>
                    
                    <div className="space-y-5 bg-zinc-800/50 p-5 rounded-[2rem] border border-amber-900/25">
                        <div className="space-y-2">
                            <label className="text-[8px] font-black uppercase tracking-[0.2em] text-amber-400/70 ml-1">Título Principal</label>
                            <input 
                                type="text"
                                value={config.mainTitle}
                                onChange={(e) => setConfig({ ...config, mainTitle: e.target.value })}
                                className="w-full bg-zinc-900/70 border border-amber-500/15 rounded-xl py-3.5 px-4 text-xs font-bold text-white focus:border-amber-500/40 focus:outline-none transition-colors placeholder-white/30"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[8px] font-black uppercase tracking-[0.2em] text-amber-400/70 ml-1">Descripción / Eslogan</label>
                            <input 
                                type="text"
                                value={config.mainSubtitle}
                                onChange={(e) => setConfig({ ...config, mainSubtitle: e.target.value })}
                                className="w-full bg-zinc-900/70 border border-amber-500/15 rounded-xl py-3.5 px-4 text-xs font-bold text-white focus:border-amber-500/40 focus:outline-none transition-colors placeholder-white/30"
                            />
                        </div>
                    </div>
                </section>

                {/* Section: Identidad Visual */}
                <section className="space-y-4">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-400/80 flex items-center gap-2 border-b border-amber-500/20 pb-2">
                        <Palette size={14} /> Color de Identidad B2B
                    </h2>
                    
                    <div className="bg-zinc-800/50 p-5 rounded-[2rem] border border-amber-900/25 flex items-center gap-6">
                        <input 
                            type="color"
                            value={config.primaryColor}
                            onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                            className="w-16 h-16 rounded-2xl bg-transparent border-none cursor-pointer"
                        />
                        <div className="flex-1">
                            <p className="text-[11px] font-black uppercase tracking-widest text-white">{config.primaryColor}</p>
                            <p className="text-[9px] text-amber-300/50 uppercase tracking-widest mt-1">Este color bañará los brillos y acentos de la Interfaz 1 de Empresas.</p>
                        </div>
                    </div>
                </section>

                {/* Section: Fondo B2B */}
                <section className="space-y-4">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-400/80 flex items-center gap-2 border-b border-amber-500/20 pb-2">
                        <Layout size={14} /> Color de Fondo Industrial
                    </h2>
                    
                    <div className="bg-zinc-800/50 p-5 rounded-[2rem] border border-amber-900/25 space-y-4">
                        <div className="grid grid-cols-3 gap-3">
                            {['#000000', '#0a0a0a', '#1a1005', '#0f1a1a', '#1a0a0a', '#0a0a1a'].map(color => (
                                <button
                                    key={color}
                                    onClick={() => { playNeonClick(); setConfig({ ...config, bgColor: color }); }}
                                    className={`p-3 rounded-xl border transition-all ${(config.bgColor || '#000000') === color ? 'border-amber-500/50 ring-2 ring-amber-500/15' : 'border-amber-900/20 hover:border-amber-500/30'}`}
                                >
                                    <div className="w-10 h-10 rounded-lg mx-auto border border-white/10" style={{ backgroundColor: color }} />
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-4 pt-2 border-t border-amber-900/20">
                            <input 
                                type="color"
                                value={config.bgColor || '#000000'}
                                onChange={(e) => setConfig({ ...config, bgColor: e.target.value })}
                                className="w-12 h-12 rounded-xl bg-transparent border-none cursor-pointer"
                            />
                            <p className="text-[10px] font-black text-amber-300/60 uppercase tracking-widest">{config.bgColor || '#000000'}</p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default EnterpriseGlobalConfigPage;
