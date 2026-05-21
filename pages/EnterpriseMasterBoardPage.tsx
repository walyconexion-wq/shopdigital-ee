import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Lock, ChevronLeft, Factory, Zap, Users, Globe, ExternalLink, Settings,
    FileText, Check, Copy, Megaphone, MapPin, Landmark, Shield, BarChart3, Database
} from 'lucide-react';
import { playNeonClick } from '../utils/audio';
import { DobermanBadge } from '../components/DobermanBadge';
import { suscribirseARegiones, subscribeToTowns } from '../firebase';
import { Region } from '../types';

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

const EnterpriseMasterBoardPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Query parameters
    const queryParams = new URLSearchParams(location.search);
    const provinciaParam = queryParams.get('provincia') || 'buenos-aires';
    const currentProvince = PROVINCES.find(p => p.id === provinciaParam) || PROVINCES[0];

    // Database state
    const [regions, setRegions] = useState<Region[]>([]);
    const [towns, setTowns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedTownId, setSelectedTownId] = useState<string>('');
    const [copiedPath, setCopiedPath] = useState<string | null>(null);

    // Subscriptions
    useEffect(() => {
        setLoading(true);
        const unsubRegions = suscribirseARegiones((regs) => {
            setRegions(regs);
        });

        const unsubTowns = subscribeToTowns((twns) => {
            setTowns(twns);
            setLoading(false);
        });

        return () => {
            unsubRegions();
            unsubTowns();
        };
    }, []);

    // Filter towns belonging to regions of the active province
    const activeProvinceTowns = useMemo(() => {
        const provinceRegions = regions.filter(r => r.provinceId === provinciaParam && r.isActive);
        const allowedTownIds = Array.from(new Set(provinceRegions.flatMap(r => r.towns)));
        return towns.filter(t => allowedTownIds.includes(t.id) && t.isActive);
    }, [regions, towns, provinciaParam]);

    // Auto-select first active town
    useEffect(() => {
        if (activeProvinceTowns.length > 0) {
            const isValid = activeProvinceTowns.some(t => t.id === selectedTownId);
            if (!isValid) {
                setSelectedTownId(activeProvinceTowns[0].id);
            }
        } else {
            setSelectedTownId('');
        }
    }, [activeProvinceTowns, selectedTownId]);

    const activeTownName = useMemo(() => {
        const t = towns.find(town => town.id === selectedTownId);
        return t ? t.name : selectedTownId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }, [towns, selectedTownId]);

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
            const r = parseInt(cleanHex.slice(0, 2), 16) || 245;
            const g = parseInt(cleanHex.slice(2, 4), 16) || 158;
            const b = parseInt(cleanHex.slice(4, 6), 16) || 11;
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        } catch {
            return `rgba(245, 158, 11, ${alpha})`;
        }
    };

    const AMBER = '#f59e0b';
    const CYAN = '#06b6d4';

    // B2B Board actions contextualized to the selected town
    const primaryB2BActions = [
        {
            title: 'Alta de Empresa',
            desc: 'Agregar nueva organización B2B al nodo',
            path: `/${selectedTownId}/embajador/empresas/nueva?provincia=${provinciaParam}`,
            icon: <FileText size={18} />,
            color: 'amber'
        },
        {
            title: 'Gestión de Rubros / Empresas',
            desc: 'Revisar, editar o suspender cuentas empresariales',
            path: `/${selectedTownId}/embajador/empresas?provincia=${provinciaParam}`,
            icon: <Factory size={18} />,
            color: 'amber'
        },
        {
            title: 'Configuración Global B2B',
            desc: 'Ajustar temas, colores y títulos del directorio',
            path: `/empresas/configuracion`,
            icon: <Settings size={18} />,
            color: 'cyan'
        },
        {
            title: 'Marketing Industrial B2B',
            desc: 'Lanzar campañas y gestionar alertas masivas',
            path: `/empresas/marketing-inteligente`,
            icon: <Megaphone size={18} />,
            color: 'cyan'
        }
    ];

    // Systems control pages
    const internalSystems = [
        {
            title: 'Búnker Central ARI',
            desc: 'Consola de Inteligencia Artificial para gestión',
            path: `/${selectedTownId}/bunker-waly`,
            icon: <Zap size={16} />,
            color: 'cyan'
        },
        {
            title: 'POSNET de Créditos B2B',
            desc: 'Emisión y validación de transacciones virtuales',
            path: `/${selectedTownId}/embajador/posnet`,
            icon: <Landmark size={16} />,
            color: 'amber'
        },
        {
            title: 'Relevamiento Táctico',
            desc: 'Carga móvil exprés de prospectos industriales',
            path: `/${selectedTownId}/embajador/relevamiento/nuevo`,
            icon: <MapPin size={16} />,
            color: 'cyan'
        },
        {
            title: 'Gestión de Prospectos',
            desc: 'Monitorear e incorporar leads relevados en calle',
            path: `/${selectedTownId}/embajador/relevamiento/gestion`,
            icon: <Users size={16} />,
            color: 'cyan'
        },
        {
            title: 'Facturación y Suscripciones',
            desc: 'Administrar cobros de servicios y planes activos',
            path: `/${selectedTownId}/embajador/facturacion`,
            icon: <Shield size={16} />,
            color: 'amber'
        }
    ];

    return (
        <div className="min-h-screen bg-[#02050A] text-white pb-24 relative overflow-x-hidden selection:bg-amber-500/30">
            {/* Background Cyber HUD Layer */}
            <div className="fixed inset-0 pointer-events-none z-0">
                {/* Radial Glows */}
                <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full blur-[120px]" style={{ backgroundColor: hexToRgba(CYAN, 0.08) }} />
                <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full blur-[120px]" style={{ backgroundColor: hexToRgba(AMBER, 0.08) }} />
                
                {/* Cyber HUD Grid */}
                <div 
                    className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.015)_1px,transparent_1px)] bg-[size:30px_30px]" 
                />
            </div>

            {/* Header Sticky Console */}
            <div 
                className="backdrop-blur-xl border-b pt-10 pb-6 px-6 relative z-10 sticky top-0 shadow-[0_10px_35px_rgba(0,0,0,0.8)] bg-zinc-950/80"
                style={{ borderBottomColor: 'rgba(245, 158, 11, 0.25)' }}
            >
                <button 
                    onClick={() => { playNeonClick(); navigate(`/empresas/control-maestro?provincia=${provinciaParam}`); }}
                    className="absolute top-10 left-6 w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 active:scale-95 transition-all cursor-pointer"
                >
                    <ChevronLeft size={20} />
                </button>
                <div className="flex flex-col items-center">
                    <Factory size={32} className="text-amber-400 mb-2 drop-shadow-[0_0_15px_rgba(245,158,11,0.6)]" />
                    <h1 className="text-xl font-[1000] uppercase tracking-[0.25em] text-white text-center">
                        Tablero Maestro Industrial
                    </h1>
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] mt-2 text-center text-amber-400" style={{ textShadow: '0 0 10px rgba(245,158,11,0.4)' }}>
                        Red Productiva B2B · {currentProvince.name} {currentProvince.emoji}
                    </p>
                    <div className="mt-2.5">
                        <DobermanBadge />
                    </div>
                </div>
            </div>

            <div className="px-6 mt-8 space-y-8 relative z-10 max-w-lg mx-auto">
                {/* ─── TOWN SELECTOR ─── */}
                <div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-cyan-400 mb-3 flex items-center gap-2">
                        <MapPin size={14} /> Seleccionar Localidad Activa
                    </h3>
                    
                    {loading ? (
                        <div className="py-8 text-center text-[11px] font-bold text-white/40 uppercase tracking-widest animate-pulse">
                            Analizando coordenadas del Hormiguero...
                        </div>
                    ) : activeProvinceTowns.length === 0 ? (
                        <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6 text-center">
                            <Lock size={20} className="text-amber-400 mx-auto mb-2 opacity-50" />
                            <p className="text-[11px] font-black text-amber-400 uppercase tracking-wider">
                                No se encontraron localidades activas
                            </p>
                            <p className="text-[8px] text-white/50 uppercase tracking-widest mt-1">
                                En la provincia de {currentProvince.name}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-2.5">
                            {activeProvinceTowns.map(town => {
                                const isSelected = town.id === selectedTownId;
                                return (
                                    <button
                                        key={town.id}
                                        onClick={() => { playNeonClick(); setSelectedTownId(town.id); }}
                                        className={`py-4 px-3 rounded-xl border text-center transition-all duration-300 relative overflow-hidden group cursor-pointer
                                            ${isSelected 
                                                ? 'bg-amber-500/10 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)] text-white' 
                                                : 'bg-zinc-950/40 border-white/5 text-white/40 hover:text-white/80 hover:border-white/10'
                                            }`}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                                        <span className="text-[10px] font-black uppercase tracking-wider block truncate">
                                            {town.name}
                                        </span>
                                        <span className={`text-[6px] font-bold uppercase tracking-widest mt-1 block ${isSelected ? 'text-amber-400' : 'text-white/20'}`}>
                                            {town.localities?.length || 0} Sectores
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* ─── ACTIVE CONSOLE STATUS ─── */}
                {selectedTownId && (
                    <div className="glass-card-3d bg-gradient-to-r from-amber-500/5 to-cyan-500/5 border border-amber-400/20 rounded-2xl p-4 flex items-center justify-between shadow-[0_0_25px_rgba(245,158,11,0.05)]">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-400/30 flex items-center justify-center text-amber-400 animate-pulse">
                                <Database size={18} />
                            </div>
                            <div>
                                <h4 className="text-[9px] font-black text-white uppercase tracking-widest leading-none">
                                    Consola de Enlace B2B
                                </h4>
                                <p className="text-[11px] text-amber-400 font-bold uppercase tracking-wider mt-1.5 italic">
                                    Activo: {activeTownName}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-green-500/10 border border-green-500/30 text-green-400 text-[7px] font-black uppercase tracking-wider">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping" />
                                Sincronizado
                              </span>
                        </div>
                    </div>
                )}

                {/* ─── PRIMARY ACTIONS ─── */}
                {selectedTownId && (
                    <div className="space-y-3">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-400 flex items-center gap-2">
                            <Factory size={14} /> Gestión Operativa B2B
                        </h3>
                        
                        <div className="grid grid-cols-1 gap-3">
                            {primaryB2BActions.map((action, idx) => {
                                const isAmber = action.color === 'amber';
                                return (
                                    <div
                                        key={idx}
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => { playNeonClick(); navigate(action.path); }}
                                        className={`w-full bg-zinc-950/30 border rounded-2xl p-4 flex items-center justify-between group active:scale-[0.98] transition-all cursor-pointer relative overflow-hidden
                                            ${isAmber 
                                                ? 'border-amber-500/15 hover:border-amber-400/40 shadow-[0_0_15px_rgba(245,158,11,0.05)]' 
                                                : 'border-cyan-500/15 hover:border-cyan-400/40 shadow-[0_0_15px_rgba(6,182,212,0.05)]'
                                            }`}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                                        
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-300 group-hover:scale-105
                                                ${isAmber 
                                                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-400 group-hover:bg-amber-500/20' 
                                                    : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400 group-hover:bg-cyan-500/20'
                                                }`}
                                            >
                                                {action.icon}
                                            </div>
                                            <div className="text-left">
                                                <h4 className="text-[11px] font-black text-white uppercase tracking-widest">
                                                    {action.title}
                                                </h4>
                                                <p className="text-[8px] text-white/40 tracking-wider mt-0.5">
                                                    {action.desc}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1.5">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleCopy(action.path); }}
                                                className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-colors cursor-pointer
                                                    ${copiedPath === action.path 
                                                        ? 'bg-green-500/20 border-green-500/40 text-green-400' 
                                                        : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white'
                                                    }`}
                                            >
                                                {copiedPath === action.path ? <Check size={12} /> : <Copy size={12} />}
                                            </button>
                                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-colors
                                                ${isAmber 
                                                    ? 'bg-amber-500/15 border-amber-500/30 text-amber-400 group-hover:bg-amber-500/25' 
                                                    : 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400 group-hover:bg-cyan-500/25'
                                                }`}
                                            >
                                                <ExternalLink size={12} />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ─── SYSTEMS / INTERNAL CONTROLS ─── */}
                {selectedTownId && (
                    <div className="space-y-3">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-cyan-400 flex items-center gap-2 border-t border-white/5 pt-6">
                            <Lock size={12} /> Sistemas Internos B2B
                        </h3>
                        
                        <div className="grid grid-cols-1 gap-2.5">
                            {internalSystems.map((sys, idx) => {
                                const isAmber = sys.color === 'amber';
                                return (
                                    <div
                                        key={idx}
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => { playNeonClick(); navigate(sys.path); }}
                                        className="bg-zinc-950/20 border border-white/5 hover:border-white/10 rounded-xl p-3.5 flex items-center justify-between group active:scale-[0.99] transition-all cursor-pointer relative overflow-hidden"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-colors
                                                ${isAmber 
                                                    ? 'bg-amber-500/10 border-amber-500/25 text-amber-400 group-hover:bg-amber-500/20' 
                                                    : 'bg-cyan-500/10 border-cyan-500/25 text-cyan-400 group-hover:bg-cyan-500/20'
                                                }`}
                                            >
                                                {sys.icon}
                                            </div>
                                            <div className="text-left">
                                                <h4 className="text-[10px] font-bold text-white/95 uppercase tracking-wide">
                                                    {sys.title}
                                                </h4>
                                                <p className="text-[7.5px] text-white/30 tracking-wider mt-0.5">
                                                    {sys.desc}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1.5">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleCopy(sys.path); }}
                                                className={`w-6 h-6 rounded-md flex items-center justify-center border transition-colors cursor-pointer
                                                    ${copiedPath === sys.path 
                                                        ? 'bg-green-500/20 border-green-500/40 text-green-400' 
                                                        : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white'
                                                    }`}
                                            >
                                                {copiedPath === sys.path ? <Check size={11} /> : <Copy size={11} />}
                                            </button>
                                            <div className="w-6 h-6 rounded-md bg-white/5 border border-white/10 text-white/30 flex items-center justify-center group-hover:text-white group-hover:bg-white/10 transition-colors">
                                                <ExternalLink size={11} />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
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
