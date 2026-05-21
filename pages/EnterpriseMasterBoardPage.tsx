import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Lock, ChevronLeft, Factory, Zap, Globe, ExternalLink,
    Check, Copy, Megaphone, MapPin, Palette, Terminal
} from 'lucide-react';
import { playNeonClick } from '../utils/audio';
import { DobermanBadge } from '../components/DobermanBadge';
import { subscribeToGlobalConfig } from '../firebase';

const PROVINCES = [
    { id: 'buenos-aires', name: 'BUENOS AIRES',  emoji: '🏙️' },
    { id: 'cordoba',      name: 'CÓRDOBA',       emoji: '🏔️' },
    { id: 'santa-fe',     name: 'SANTA FE',      emoji: '🌾' },
    { id: 'mendoza',      name: 'MENDOZA',       emoji: '🍇' },
    { id: 'tucuman',      name: 'TUCUMÁN',       emoji: '🌿' },
    { id: 'entre-rios',   name: 'ENTRE RÍOS',   emoji: '🌊' },
    { id: 'misiones',     name: 'MISIONES',      emoji: '🌴' },
    { id: 'neuquen',      name: 'NEUQUÉN',       emoji: '⛽' },
];

const STATIC_TOWNS = [
    { id: 'ezeiza', name: 'Ezeiza', label: 'Ezeiza', icon: Globe, color: '#22d3ee', activeBg: 'bg-cyan-500/20 border-cyan-500 shadow-[0_0_30px_rgba(34,211,238,0.2)]', iconClass: 'text-cyan-400' },
    { id: 'esteban-echeverria', name: 'Esteban Echeverría', label: 'E. Echeverría', icon: Lock, color: '#a855f7', activeBg: 'bg-violet-500/20 border-violet-500 shadow-[0_0_30px_rgba(139,92,246,0.2)]', iconClass: 'text-violet-400' },
    { id: 'mina-clavero', name: 'Traslasierra', label: 'Traslasierra', icon: MapPin, color: '#10b981', activeBg: 'bg-emerald-500/20 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.2)]', iconClass: 'text-emerald-400' }
];

const EnterpriseMasterBoardPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Query parameters
    const queryParams = new URLSearchParams(location.search);
    const provinciaParam = queryParams.get('provincia') || 'buenos-aires';
    const currentProvince = PROVINCES.find(p => p.id === provinciaParam) || PROVINCES[0];

    const [selectedTownId, setSelectedTownId] = useState<string>(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const prov = queryParams.get('provincia');
        if (prov === 'cordoba') return 'mina-clavero';
        return 'esteban-echeverria';
    });

    const [copiedPath, setCopiedPath] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');

    // Chameleon Config for visual style based on the selected town
    const [zoneConfig, setZoneConfig] = useState<any>({ primaryColor: '#a855f7', townName: 'Esteban Echeverría' });

    // Sync selectedTownId state with URL query param if changed externally
    useEffect(() => {
        if (provinciaParam === 'cordoba') {
            setSelectedTownId('mina-clavero');
        } else if (provinciaParam === 'buenos-aires') {
            setSelectedTownId(prev => (prev === 'ezeiza' || prev === 'esteban-echeverria') ? prev : 'esteban-echeverria');
        }
    }, [provinciaParam]);

    // Subscribe to selected town config for theme colors
    useEffect(() => {
        if (!selectedTownId) return;
        const unsub = subscribeToGlobalConfig((cfg) => {
            if (cfg) setZoneConfig(cfg);
        }, selectedTownId);
        return () => unsub();
    }, [selectedTownId]);

    const activeTownName = useMemo(() => {
        if (selectedTownId === 'mina-clavero') return 'Traslasierra';
        if (selectedTownId === 'ezeiza') return 'Ezeiza';
        if (selectedTownId === 'esteban-echeverria') return 'Esteban Echeverría';
        return selectedTownId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }, [selectedTownId]);

    const handleSelectTown = (townId: string) => {
        playNeonClick();
        setSelectedTownId(townId);
        const prov = townId === 'mina-clavero' ? 'cordoba' : 'buenos-aires';
        navigate(`/empresas/tablero-maestro?provincia=${prov}`, { replace: true });
    };

    const handleCopy = (path: string) => {
        playNeonClick();
        const fullUrl = window.location.origin + path;
        navigator.clipboard.writeText(fullUrl);
        setCopiedPath(path);
        setTimeout(() => setCopiedPath(null), 2000);
    };

    // Color conversion helper for HUD glows
    const hexToRgba = (hex: string, alpha: number) => {
        try {
            const cleanHex = hex.replace('#', '');
            const r = parseInt(cleanHex.slice(0, 2), 16) || 168;
            const g = parseInt(cleanHex.slice(2, 4), 16) || 85;
            const b = parseInt(cleanHex.slice(4, 6), 16) || 247;
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        } catch {
            return `rgba(168, 85, 247, ${alpha})`;
        }
    };

    const zoneColor = zoneConfig?.primaryColor || (selectedTownId === 'ezeiza' ? '#22d3ee' : selectedTownId === 'esteban-echeverria' ? '#a855f7' : '#10b981');

    // Filter static selector towns based on search term
    const filteredStaticTowns = useMemo(() => {
        if (!searchTerm.trim()) return STATIC_TOWNS;
        return STATIC_TOWNS.filter(town => 
            town.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            town.label.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm]);

    // Management pages under Sistemas Internos (combining B2C and B2B specific tools)
    const managementPages = [
        { 
            title: 'ALTA DE EMPRESA B2B', 
            desc: 'Agregar nueva organización B2B al nodo', 
            path: `/${selectedTownId}/embajador/empresas/nueva?provincia=${provinciaParam}` 
        },
        { 
            title: 'GESTIÓN DE RUBROS / EMPRESAS', 
            desc: 'Revisar, editar o suspender cuentas empresariales', 
            path: `/${selectedTownId}/embajador/empresas?provincia=${provinciaParam}` 
        },
        { 
            title: 'RECLUTAMIENTO ADMIN', 
            desc: 'Aprobar o rechazar aspirantes a Embajadores', 
            path: `/${selectedTownId}/tablero-maestro/reclutamiento` 
        },
        { 
            title: 'PANEL DE EMBAJADOR', 
            desc: 'Autenticación para dar de alta comercios', 
            path: `/${selectedTownId}/embajador` 
        },
        { 
            title: 'FACTURACIÓN Y AVISOS', 
            desc: 'Suscripciones B2C y B2B', 
            path: `/${selectedTownId}/embajador/facturacion` 
        },
        { 
            title: 'RELEVAMIENTO TÁCTICO', 
            desc: 'Carga Express Mobile de prospectos en calle', 
            path: `/${selectedTownId}/embajador/relevamiento/nuevo` 
        },
        { 
            title: 'GESTIÓN DE PROSPECTOS', 
            desc: 'Ver, revisar, y activar leads de relevamiento', 
            path: `/${selectedTownId}/embajador/relevamiento/gestion` 
        },
        { 
            title: 'SUSCRIPCIÓN CREADORES', 
            desc: 'Página de suscripción comercial', 
            path: `/${selectedTownId}/subscripcion` 
        },
    ];

    return (
        <div className="min-h-screen bg-[#050A15] text-white pb-24 relative overflow-x-hidden selection:bg-cyan-500/30">
            {/* Background Tecnológico — Modo Camaleón: responde al color de la zona */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-screen"></div>
                <div 
                    className="absolute top-0 right-0 w-[50vw] h-[50vw] rounded-full blur-[120px]"
                    style={{ backgroundColor: hexToRgba(zoneColor, 0.15) }}
                />
                <div 
                    className="absolute bottom-0 left-0 w-[50vw] h-[50vw] rounded-full blur-[120px]"
                    style={{ backgroundColor: hexToRgba(zoneColor, 0.1) }}
                />
                <div 
                    className="absolute inset-0"
                    style={{ 
                        backgroundImage: `linear-gradient(${hexToRgba(zoneColor, 0.05)} 1px, transparent 1px), linear-gradient(90deg, ${hexToRgba(zoneColor, 0.05)} 1px, transparent 1px)`,
                        backgroundSize: '40px 40px'
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050A15]/50 to-[#050A15]/90"></div>
            </div>

            {/* Header Sticky Console */}
            <div 
                className="backdrop-blur-xl border-b pt-10 pb-6 px-6 relative z-10 sticky top-0 shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
                style={{ 
                    background: 'rgba(24,24,27,0.80)',
                    borderBottomColor: hexToRgba(zoneColor, 0.3)
                }}
            >
                <div 
                    role="button" tabIndex={0} 
                    onClick={() => { playNeonClick(); navigate(`/empresas/control-maestro?provincia=${provinciaParam}`); }} 
                    className="absolute top-10 left-6 hover:opacity-70 cursor-pointer" 
                    style={{ color: zoneColor }}
                >
                    <ChevronLeft size={24} />
                </div>
                <div className="flex flex-col items-center">
                    <Terminal size={36} className="mb-2" style={{ color: zoneColor, filter: `drop-shadow(0 0 20px ${hexToRgba(zoneColor, 0.6)})` }} />
                    <h1 className="text-2xl font-[1000] uppercase tracking-[0.25em] text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 text-center drop-shadow-md">
                        TABLERO MAESTRO INDUSTRIAL
                    </h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] mt-2 text-center text-sky-400 drop-shadow-[0_0_10px_rgba(56,189,248,0.5)] flex items-center justify-center gap-1">
                        PROVINCIA: {currentProvince.name} <span className="text-[12px]">{currentProvince.emoji}</span>
                    </p>
                    <div className="mt-2">
                        <DobermanBadge />
                    </div>
                    {/* Green Outline Search Capsule */}
                    <div className="mt-4 w-full max-w-[280px] relative">
                        <input 
                            type="text" 
                            placeholder="🔍 BUSCAR LOCALIDAD..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#050A15]/60 text-emerald-400 placeholder-emerald-500/40 border-2 border-emerald-500/40 rounded-full py-2 px-4 text-[10px] font-bold text-center tracking-widest uppercase outline-none focus:border-emerald-400 focus:shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all"
                        />
                    </div>
                </div>
            </div>

            <div className="px-6 mt-8 space-y-10 relative z-10 pb-20 max-w-lg mx-auto">
                
                {/* 🛡️ ACCESO DIRECTO AL BÚNKER CENTRAL (Solo Director) */}
                {selectedTownId && (
                    <div 
                        role="button" tabIndex={0}
                        onClick={() => { playNeonClick(); navigate(`/${selectedTownId}/bunker-waly`); }}
                        className="w-full bg-gradient-to-r from-violet-900/50 to-indigo-900/50 text-white p-5 rounded-2xl font-[1000] uppercase tracking-widest border border-violet-500/40 hover:border-violet-400 active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer shadow-[0_0_30px_rgba(139,92,246,0.2)] relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/0 via-white/5 to-violet-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                        <Zap size={18} className="text-violet-400" />
                        <span className="text-[13px] text-violet-300">BÚNKER CENTRAL DEL DIRECTOR - WALY</span>
                    </div>
                )}

                {/* SELECTORES DE LOCALIDADES ACTIVAS */}
                {filteredStaticTowns.length === 0 ? (
                    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6 text-center animate-in fade-in duration-300">
                        <MapPin size={20} className="text-emerald-400 mx-auto mb-2 opacity-50" />
                        <p className="text-[11px] font-black text-emerald-400 uppercase tracking-wider">
                            No se encontraron localidades
                        </p>
                        <p className="text-[8px] text-white/50 uppercase tracking-widest mt-1">
                            Ajusta el filtro de búsqueda
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-2 animate-in fade-in slide-in-from-top-4 duration-1000">
                        {filteredStaticTowns.map((town) => {
                            const isSelected = town.id === selectedTownId;
                            const Icon = town.icon;
                            return (
                                <button 
                                    key={town.id}
                                    onClick={() => handleSelectTown(town.id)}
                                    className={`py-6 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2 group cursor-pointer ${isSelected ? town.activeBg : 'bg-zinc-900/50 border-white/5 opacity-40 hover:opacity-100'}`}
                                >
                                    <Icon size={24} className={isSelected ? town.iconClass : 'text-white/40'} />
                                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isSelected ? 'text-white' : 'text-white/20'}`}>
                                        Zona {town.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                )}

                {selectedTownId && (
                    <>
                        {/* 🎨 DISEÑADOR DE INTERFAZ / SINFONÍA EDITOR */}
                        <div 
                            role="button" tabIndex={0}
                            onClick={() => { playNeonClick(); navigate(`/${selectedTownId}/tablero-maestro/configuracion`); }} 
                            className="w-full bg-zinc-900/40 text-white p-6 rounded-3xl font-[1000] uppercase tracking-widest border transition-all flex flex-col items-center justify-center gap-2 cursor-pointer group hover:bg-zinc-800"
                            style={{ borderColor: hexToRgba(zoneColor, 0.3) }}
                        >
                            <div className="flex items-center gap-3">
                                <Palette size={20} style={{ color: zoneColor }} />
                                <span className="text-[14px]">DISEÑADOR DE INTERFAZ / SINFONÍA EDITOR</span>
                            </div>
                            <span className="text-[8px] opacity-40 uppercase tracking-[0.3em]">Control visual total · Colores · Temas · Identidad</span>
                        </div>

                        {/* 🏭 NODO EMPRESARIAL B2B */}
                        <div 
                            role="button" tabIndex={0}
                            onClick={() => { playNeonClick(); navigate(`/empresas`); }} 
                            className="w-full bg-gradient-to-r from-amber-700/80 to-orange-600/80 text-white p-5 rounded-2xl font-[1000] uppercase tracking-widest shadow-[0_0_25px_rgba(245,158,11,0.25)] border border-amber-500/40 hover:from-amber-600 hover:to-orange-500 active:scale-95 transition-all flex flex-col items-center justify-center gap-2 relative overflow-hidden group cursor-pointer"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />
                            <div className="flex items-center gap-2 pointer-events-none">
                                <Factory size={18} className="text-amber-200" />
                                <span className="text-[14px]">🏭 NODO EMPRESARIAL B2B</span>
                            </div>
                            <span className="text-[8px] text-amber-200/80 italic pointer-events-none">DIRECTORIO INDUSTRIAL · PROVEEDORES · MAYORISTAS</span>
                        </div>

                        {/* 🏭 LA FÁBRICA - VISIÓN GLOBAL */}
                        <div 
                            role="button" tabIndex={0}
                            onClick={() => { playNeonClick(); navigate(`/${selectedTownId}/tablero-maestro/fabrica`); }} 
                            className="w-full bg-gradient-to-r from-amber-600/90 to-yellow-600/90 text-white p-4 rounded-xl font-[1000] uppercase tracking-widest shadow-[0_0_25px_rgba(245,158,11,0.3)] border border-yellow-500/50 hover:from-amber-500 hover:to-yellow-500 active:scale-95 transition-all flex flex-col items-center justify-center gap-1.5 relative overflow-hidden group cursor-pointer"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />
                            <div className="flex items-center gap-2 pointer-events-none">
                                <Factory size={14} className="text-white/80" />
                                <span className="text-[14px]">🏭 LA FÁBRICA · VISIÓN GLOBAL</span>
                            </div>
                            <span className="text-[8px] text-yellow-100 italic pointer-events-none">VER Y SALTAR A CUALQUIER ZONA · FORJAR NUEVAS CIUDADES</span>
                        </div>

                        {/* 🎨 EDITOR DE TEMA Y FONDO */}
                        <div 
                            role="button" tabIndex={0}
                            onClick={() => { playNeonClick(); navigate(`/empresas/configuracion`); }} 
                            className="w-full bg-gradient-to-r from-purple-600/70 to-pink-600/70 text-white p-4 rounded-xl font-[1000] uppercase tracking-widest shadow-[0_0_20px_rgba(168,85,247,0.2)] border border-purple-500/40 hover:from-purple-500 hover:to-pink-500 active:scale-95 transition-all flex flex-col items-center justify-center gap-1.5 relative overflow-hidden group cursor-pointer"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />
                            <div className="flex items-center gap-2 pointer-events-none">
                                <Palette size={14} className="text-purple-200" />
                                <span className="text-[13px]">🎨 EDITOR DE TEMA Y FONDO</span>
                            </div>
                            <span className="text-[8px] text-purple-200/70 italic pointer-events-none">COLORES · ESTACIONES · BORDES · FONDO DE APP</span>
                        </div>

                        {/* 📢 MARKETING INTELIGENTE */}
                        <div 
                            role="button" tabIndex={0}
                            onClick={() => { playNeonClick(); navigate(`/empresas/marketing-inteligente`); }} 
                            className="w-full bg-gradient-to-r from-cyan-600/70 to-blue-600/70 text-white p-4 rounded-xl font-[1000] uppercase tracking-widest shadow-[0_0_20px_rgba(6,182,212,0.2)] border border-cyan-500/40 hover:from-cyan-500 hover:to-blue-500 active:scale-95 transition-all flex flex-col items-center justify-center gap-1.5 relative overflow-hidden group cursor-pointer"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />
                            <div className="flex items-center gap-2 pointer-events-none">
                                <Megaphone size={14} className="text-cyan-200" />
                                <span className="text-[13px]">📢 MARKETING INTELIGENTE</span>
                            </div>
                            <span className="text-[8px] text-cyan-200/70 italic pointer-events-none">CEREBRO DEL BOT · CAMPAÑAS · FIDELIZACIÓN</span>
                        </div>

                        {/* SISTEMAS INTERNOS */}
                        <section>
                            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 mb-4 flex items-center gap-2 border-b border-white/10 pb-2 mt-10">
                                <Lock size={12} /> Sistemas Internos
                            </h2>
                            
                            <div className="grid grid-cols-1 gap-3">
                                {managementPages.map((page, idx) => (
                                    <div
                                        key={idx}
                                        role="button" tabIndex={0}
                                        onClick={() => { playNeonClick(); navigate(page.path); }}
                                        className="bg-gradient-to-r from-red-500/10 to-orange-500/5 border border-red-500/20 rounded-2xl p-4 flex items-center justify-between group hover:border-red-400/40 active:scale-95 transition-all cursor-pointer"
                                    >
                                        <div className="flex flex-col items-start text-left flex-1 pointer-events-none">
                                            <h3 className="text-[12px] font-[1000] text-red-400 uppercase tracking-wider group-hover:text-red-300 transition-colors">
                                                {page.title}
                                            </h3>
                                            <p className="text-[9px] text-white/40 uppercase tracking-widest mt-1">
                                                {page.desc}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div 
                                                role="button" tabIndex={0}
                                                onClick={(e) => { e.stopPropagation(); handleCopy(page.path); }}
                                                className={`w-8 h-8 rounded-full flex items-center justify-center border transition-colors cursor-pointer ${copiedPath === page.path ? 'bg-green-500/20 border-green-500/40 text-green-400' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white'}`}
                                            >
                                                {copiedPath === page.path ? <Check size={14} /> : <Copy size={14} />}
                                            </div>
                                            <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/30 text-red-400 group-hover:bg-red-500/30 transition-colors">
                                                <ExternalLink size={14} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* 📡 ACCESO AL CENTRO DE TRANSMISIÓN */}
                        <button 
                            onClick={() => { playNeonClick(); navigate(`/${selectedTownId}/director/transmision-en-vivo`); }}
                            className="w-full mt-8 py-5 bg-gradient-to-r from-red-700 via-red-600 to-red-700 rounded-3xl text-white font-[1000] uppercase tracking-[0.2em] text-[12px] shadow-[0_6px_0_rgba(127,29,29,1),0_12px_40px_rgba(239,68,68,0.2)] active:translate-y-[6px] active:shadow-[0_0_0_rgba(127,29,29,1),0_5px_15px_rgba(239,68,68,0.1)] transition-all duration-75 flex items-center justify-center gap-3 relative overflow-hidden group border-2 border-red-500/20 cursor-pointer"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                            <Megaphone size={20} className="drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
                            <span className="drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]">📡 Entrar al Centro de Transmisión en Vivo</span>
                        </button>
                    </>
                )}
            </div>

            {/* Footer console */}
            <footer className="w-full flex flex-col items-center gap-2 pt-10 pb-6 mt-12 border-t border-white/5 relative z-10">
                <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.35em] text-center select-none">
                    © 2026 · ShopDigital Network
                </p>
                <p className="text-[7.5px] font-black text-amber-500/50 uppercase tracking-[0.25em] select-none" style={{ textShadow: '0 0 10px rgba(245,158,11,0.2)' }}>
                    🏭 Nodo Industrial · Panel Maestro
                </p>
            </footer>
        </div>
    );
};

export default EnterpriseMasterBoardPage;
