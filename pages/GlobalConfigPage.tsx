import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
    ChevronLeft, Save, Palette, Type, Globe, 
    Snowflake, Sun, Flower2, TreePine, Layout,
    Check, AlertCircle
} from 'lucide-react';
import { playNeonClick } from '../utils/audio';
import { subscribeToGlobalConfig, saveGlobalConfig, ALL_CATEGORIES_MASTER, saveCategoriesConfig } from '../firebase';
import { resolveIcon, AVAILABLE_ICONS_FOR_PICKER } from '../utils/iconResolver';
import { Trash2, Plus, PowerOff, Power } from 'lucide-react';

const GlobalConfigPage: React.FC = () => {
    const { townId = 'esteban-echeverria' } = useParams<{ townId: string }>();
    const navigate = useNavigate();
    // Derivar nombre visual de ciudad (por si Firebase tarda o no tiene config aún)
    const derivedTownName = townId
        .split('-')
        .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

    const [config, setConfig] = useState<any>({
        mainTitle: "ShopDigital",
        mainSubtitle: "Tu guía de ofertas locales",
        theme: 'default',
        primaryColor: '#22d3ee',
        townName: derivedTownName,  // Dinámico desde el townId de la URL
        categories: []
    });
    const [newCat, setNewCat] = useState({ name: '', iconKey: 'Star' });
    const [showAddForm, setShowAddForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        const unsubscribe = subscribeToGlobalConfig((updatedConfig) => {
            if (updatedConfig) {
                setConfig(updatedConfig);
            }
        }, townId);
        return () => unsubscribe();
    }, [townId]);

    const handleSave = async () => {
        // ─── Confirm de seguridad zonal ──────────────────────────────────
        const confirmed = window.confirm(
            `¿Conformás los cambios estéticos y de rubros para la zona:\n\n"${config.townName || derivedTownName}"\n\nEstos cambios son exclusivos de esta zona y no afectan al resto de las ciudades.`
        );
        if (!confirmed) return;

        setSaving(true);
        setMessage(null);
        playNeonClick();
        try {
            // Guarda SOLO en appConfig/{townId} — aislamiento total
            await saveGlobalConfig(config, townId);
            setMessage({ type: 'success', text: `¡Sinfonía guardada para ${config.townName || derivedTownName}! 🎻` });
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            setMessage({ type: 'error', text: `Error al guardar la configuración de ${config.townName || derivedTownName}` });
        } finally {
            setSaving(false);
        }
    };

    const toggleCategory = (catId: string) => {
        playNeonClick();
        const updatedCats = config.categories.map((c: any) => 
            c.id === catId ? { ...c, isActive: !c.isActive } : c
        );
        setConfig({ ...config, categories: updatedCats });
    };

    const addCategory = () => {
        if (!newCat.name) return;
        playNeonClick();
        const slug = newCat.name.toLowerCase().trim().replace(/\s+/g, '-');
        const newItem = {
            id: slug,
            slug,
            name: newCat.name,
            iconKey: newCat.iconKey,
            isActive: true,
            isSystem: false
        };
        setConfig({
            ...config,
            categories: [...(config.categories || []), newItem]
        });
        setNewCat({ name: '', iconKey: 'Star' });
        setShowAddForm(false);
    };

    const removeCategory = (catId: string) => {
        playNeonClick();
        setConfig({
            ...config,
            categories: config.categories.filter((c: any) => c.id !== catId)
        });
    };

    const themes = [
        { id: 'default', name: 'Original Neón', icon: <Layout size={20} />, color: '#22d3ee' },
        { id: 'christmas', name: 'Navidad 🎄', icon: <TreePine size={20} />, color: '#ef4444' },
        { id: 'winter', name: 'Invierno ❄️', icon: <Snowflake size={20} />, color: '#3b82f6' },
        { id: 'summer', name: 'Verano ☀️', icon: <Sun size={20} />, color: '#f59e0b' },
        { id: 'spring', name: 'Primavera 🌸', icon: <Flower2 size={20} />, color: '#ec4899' },
    ];

    const hexToRgba = (hex: string, alpha: number) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    return (
        <div className="min-h-screen bg-black text-white pb-24 relative overflow-hidden selection:bg-cyan-500/30">
            {/* Ambient background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] opacity-20" style={{ backgroundColor: config.primaryColor }} />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-[120px] opacity-10" style={{ backgroundColor: config.primaryColor }} />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
            </div>

            {/* Header Sticky */}
            <div className="bg-zinc-900/80 backdrop-blur-xl border-b border-white/10 pt-10 pb-4 px-6 relative z-10 sticky top-0 shadow-2xl flex items-center justify-between">
                <button onClick={() => { playNeonClick(); navigate(`/${townId}/tablero-maestro`); }} className="text-white/50 hover:text-white transition-colors">
                    <ChevronLeft size={24} />
                </button>
                <div className="flex flex-col items-center flex-1">
                    <Palette size={24} className="mb-1" style={{ color: config.primaryColor }} />
                    <h1 className="text-sm font-[1000] uppercase tracking-[0.1em] text-white text-center leading-tight">
                        Config · {config.townName || townId}
                    </h1>
                    <p className="text-[9px] font-bold uppercase tracking-widest mt-0.5" style={{ color: config.primaryColor }}>
                        Zona {config.townName || townId}
                    </p>
                </div>
                <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-white text-black px-4 py-2 rounded-xl text-[9px] font-[1000] uppercase tracking-widest shadow-lg active:scale-90 transition-all flex items-center gap-1.5"
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

                {/* Section: Estética de Temporada */}
                <section className="space-y-4">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 flex items-center gap-2 border-b border-white/10 pb-2">
                        <Sun size={14} /> Sinfonía de Estaciones
                    </h2>
                    <div className="grid grid-cols-1 gap-3">
                        {themes.map((theme) => (
                            <button
                                key={theme.id}
                                onClick={() => { playNeonClick(); setConfig({ ...config, theme: theme.id, primaryColor: theme.color }); }}
                                className={`group p-4 rounded-2xl border transition-all flex items-center justify-between overflow-hidden relative ${
                                    config.theme === theme.id 
                                    ? 'bg-white/10 border-white/40 ring-2 ring-white/10' 
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
                                        <p className="text-[9px] text-white/30 uppercase tracking-widest mt-0.5">Activar atmósfera {theme.id}</p>
                                    </div>
                                </div>
                                {config.theme === theme.id && (
                                    <div className="relative z-10 w-6 h-6 bg-white rounded-full flex items-center justify-center text-black">
                                        <Check size={14} strokeWidth={3} />
                                    </div>
                                )}
                                {/* Background glow for selected */}
                                {config.theme === theme.id && (
                                    <div className="absolute inset-0 opacity-20" style={{ background: `radial-gradient(circle at center, ${theme.color} 0%, transparent 70%)` }} />
                                )}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Section: Textos y Marca */}
                <section className="space-y-4">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 flex items-center gap-2 border-b border-white/10 pb-2">
                        <Type size={14} /> Textos y Localidad
                    </h2>
                    
                    <div className="space-y-5 bg-zinc-900/40 p-5 rounded-[2rem] border border-white/5">
                        <div className="space-y-2">
                            <label className="text-[8px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">Título de la Localidad</label>
                            <div className="relative">
                                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                                <input 
                                    type="text"
                                    value={config.townName}
                                    onChange={(e) => setConfig({ ...config, townName: e.target.value })}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-xs font-bold focus:border-white/30 focus:outline-none transition-colors"
                                    placeholder="Ej: Esteban Echeverría"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[8px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">Mensaje de Bienvenida (Título)</label>
                            <div className="relative">
                                <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                                <input 
                                    type="text"
                                    value={config.mainTitle}
                                    onChange={(e) => setConfig({ ...config, mainTitle: e.target.value })}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-xs font-bold focus:border-white/30 focus:outline-none transition-colors"
                                    placeholder="Ej: ShopDigital"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[8px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">Bajada / Eslogan</label>
                            <div className="relative">
                                <Layout className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                                <input 
                                    type="text"
                                    value={config.mainSubtitle}
                                    onChange={(e) => setConfig({ ...config, mainSubtitle: e.target.value })}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-xs font-bold focus:border-white/30 focus:outline-none transition-colors"
                                    placeholder="Ej: Tu guía de ofertas locales"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section: Color Primario Personalizado */}
                <section className="space-y-4">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 flex items-center gap-2 border-b border-white/10 pb-2">
                        <Palette size={14} /> Color de Identidad (Interfaz 1 y 2)
                    </h2>
                    
                    <div className="bg-zinc-900/40 p-5 rounded-[2rem] border border-white/5 flex items-center gap-6">
                        <div className="relative group">
                            <input 
                                type="color"
                                value={config.primaryColor}
                                onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                                className="w-16 h-16 rounded-2xl bg-transparent border-none cursor-pointer"
                            />
                            <div className="absolute inset-0 rounded-2xl ring-2 ring-white/20 pointer-events-none group-hover:ring-white/40 transition-all" />
                        </div>
                        <div className="flex-1">
                            <p className="text-[11px] font-black uppercase tracking-widest text-white">{config.primaryColor}</p>
                            <p className="text-[9px] text-white/40 uppercase tracking-widest mt-1">Este color bañará todos los brillos, botones y sombras de la Home y Categorías.</p>
                        </div>
                    </div>
                </section>

                {/* Section: Gestión de Rubros */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 flex items-center gap-2">
                            <Layout size={14} /> Gestión de Rubros
                        </h2>
                        <button 
                            onClick={() => { playNeonClick(); setShowAddForm(!showAddForm); }}
                            className="text-[9px] font-black uppercase tracking-wider bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/20 transition-all flex items-center gap-1.5"
                        >
                            <Plus size={12} /> {showAddForm ? 'Cancelar' : 'Agregar Rubro'}
                        </button>
                    </div>

                    {showAddForm && (
                        <div className="bg-zinc-900 border border-white/20 p-5 rounded-3xl space-y-4 animate-in slide-in-from-top-4 duration-500">
                            <div className="space-y-2">
                                <label className="text-[8px] font-black uppercase tracking-widest text-white/40">Nombre del Rubro</label>
                                <input 
                                    type="text"
                                    value={newCat.name}
                                    onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-xs font-bold focus:border-white/30 outline-none"
                                    placeholder="Ej: Lavanderías"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[8px] font-black uppercase tracking-widest text-white/40">Elegir Ícono</label>
                                <div className="grid grid-cols-6 gap-2 bg-black/30 p-3 rounded-xl max-h-40 overflow-y-auto custom-scrollbar">
                                    {AVAILABLE_ICONS_FOR_PICKER.map((icon) => (
                                        <button
                                            key={icon.key}
                                            onClick={() => setNewCat({ ...newCat, iconKey: icon.key })}
                                            className={`aspect-square rounded-lg flex items-center justify-center transition-all ${newCat.iconKey === icon.key ? 'bg-white text-black scale-110 shadow-lg' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                                            title={icon.label}
                                        >
                                            <div className="scale-75">
                                                {resolveIcon(icon.key)}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <button 
                                onClick={addCategory}
                                className="w-full bg-white text-black py-3 rounded-xl font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all"
                            >
                                Confirmar y Agregar
                            </button>
                        </div>
                    )}

                    <div className="space-y-3">
                        {(config.categories || []).map((cat: any) => (
                            <div 
                                key={cat.id}
                                className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${cat.isActive ? 'bg-zinc-900/60 border-white/10' : 'bg-red-950/10 border-red-900/20 opacity-60'}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${cat.isActive ? 'bg-white/5 border-white/10 text-white' : 'bg-black/40 border-white/5 text-white/20'}`} style={cat.isActive ? { color: config.primaryColor, borderColor: `${config.primaryColor}30` } : {}}>
                                        <div className="scale-75">
                                            {resolveIcon(cat.iconKey)}
                                        </div>
                                    </div>
                                    <div className="text-left">
                                        <h3 className={`text-[12px] font-black uppercase tracking-wider ${cat.isActive ? 'text-white' : 'text-white/40'}`}>
                                            {cat.name}
                                        </h3>
                                        <p className="text-[8px] text-white/20 uppercase tracking-widest">
                                            {cat.isSystem ? 'Sistema' : 'Personalizado'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {!cat.isSystem && (
                                        <button 
                                            onClick={() => removeCategory(cat.id)}
                                            className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 flex items-center justify-center hover:bg-red-500/20 active:scale-90 transition-all"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => toggleCategory(cat.id)}
                                        className={`w-12 h-6 rounded-full relative transition-all duration-300 border ${cat.isActive ? 'bg-green-500 border-green-400' : 'bg-zinc-800 border-zinc-700'}`}
                                    >
                                        <div className={`absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full transition-all duration-300 flex items-center justify-center shadow-md ${cat.isActive ? 'left-6.5' : 'left-0.5'}`}>
                                            {cat.isActive ? <Power size={8} className="text-green-600" /> : <PowerOff size={8} className="text-zinc-400" />}
                                        </div>
                                    </button>
                                </div>
                            </div>
                        ))}
                        {config.categories?.length === 0 && (
                            <div className="p-8 border border-dashed border-white/10 rounded-3xl text-center">
                                <PowerOff size={24} className="mx-auto text-white/10 mb-2" />
                                <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Sin rubros configurados</p>
                                <p className="text-[8px] text-white/10 uppercase tracking-widest mt-1">Haga clic en Reset Maestro para inicializar</p>
                            </div>
                        )}
                    </div>
                </section>

                <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                    <p className="text-[9px] text-center text-white/30 uppercase tracking-[0.2em] leading-relaxed">
                        Nota: Al cambiar el tema estacional, se aplican automáticamente efectos visuales específicos (como nieve, hojas o flores) en la página principal.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default GlobalConfigPage;
