import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Shop } from '../types';
import { ENTERPRISE_CATEGORIES } from '../enterpriseConstants';
import { suscribirseAComercios } from '../firebase';
import {
    Lock, ChevronLeft, Factory, Zap, Users, BarChart3,
    Globe, Landmark, ExternalLink, Settings, FileText,
    CheckCircle, AlertTriangle, TrendingUp, Package, Megaphone
} from 'lucide-react';
import { playNeonClick } from '../utils/audio';
import { DobermanBadge } from '../components/DobermanBadge';
import { AriMerchantAssistant } from '../components/AriMerchantAssistant';

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

const EnterpriseMasterPanelPage: React.FC = () => {

    const navigate = useNavigate();
    const location = useLocation();
    const [allShops, setAllShops] = useState<Shop[]>([]);

    const queryParams = new URLSearchParams(location.search);
    const provinciaParam = queryParams.get('provincia') || 'buenos-aires';
    const currentProvince = PROVINCES.find(p => p.id === provinciaParam) || PROVINCES[0];

    // Suscripción a datos en tiempo real
    useEffect(() => {
        const unsub = suscribirseAComercios((shops) => {
            setAllShops(shops.filter(s => s && s.name));
        }, undefined, (err) => console.error(err));
        return () => unsub();
    }, []);

    const enterprises = useMemo(() =>
        allShops.filter(s => s.entityType === 'enterprise' && s.province === provinciaParam),
    [allShops, provinciaParam]);

    const activeEnterprises = enterprises.filter(e => e.isActive === true);
    const inactiveEnterprises = enterprises.filter(e => e.isActive !== true);

    // Conteo por rubro
    const countByCategory = useMemo(() => {
        const counts: Record<string, number> = {};
        ENTERPRISE_CATEGORIES.forEach(cat => {
            counts[cat.id] = enterprises.filter(e =>
                e.category === cat.id || e.category === cat.slug
            ).length;
        });
        return counts;
    }, [enterprises]);

    // Conteo por alcance
    const nationalCount = enterprises.filter(e => e.reach === 'national').length;
    const regionalCount = enterprises.filter(e => e.reach === 'regional').length;

    const hexToRgba = (hex: string, alpha: number) => {
        try {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        } catch { return `rgba(245, 158, 11, ${alpha})`; }
    };

    const AMBER = '#f59e0b';


    // ============================
    // CONSOLA AMBER PRINCIPAL
    // ============================
    const formattedTown = currentProvince.name;

    const quickLinks = [
        { title: '🛡️ Búnker Central · ARI', desc: 'Terminal del Director · Chat IA', path: `/esteban-echeverria/bunker-waly`, icon: <Zap size={16} />, color: 'violet' },
        { title: 'Centro de Mando Ezeiza', desc: 'Tablero Maestro · Zona Ezeiza', path: `/ezeiza/tablero-maestro`, icon: <Zap size={16} />, color: 'cyan' },
        { title: 'Centro de Mando Echeverría', desc: 'Tablero Maestro · Zona E. Echeverría', path: `/esteban-echeverria/tablero-maestro`, icon: <Zap size={16} />, color: 'violet' },
        { title: 'Directorio Industrial', desc: 'Portal público de rubros', path: `/empresas`, icon: <Factory size={16} />, color: 'amber' },
        { title: 'Gestión de Empresas', desc: `Control · ${currentProvince.name}`, path: `/esteban-echeverria/embajador/empresas?provincia=${provinciaParam}`, icon: <Settings size={16} />, color: 'amber' },
        { title: 'Nueva Empresa', desc: `Alta B2B · ${currentProvince.name}`, path: `/esteban-echeverria/embajador/empresas/nueva?provincia=${provinciaParam}`, icon: <FileText size={16} />, color: 'amber' },
        { title: '📢 Marketing Industrial', desc: 'Automatización y Campañas', path: `/empresas/marketing-inteligente`, icon: <Megaphone size={16} />, color: 'amber' },
        { title: '🎨 Editor de Tema', desc: 'Colores · Estaciones · Fondo', path: `/empresas/configuracion`, icon: <Settings size={16} />, color: 'violet' },
    ];

    // Dummy Shop object for the B2B Node
    const bunkerShop = useMemo<Shop>(() => ({
        id: 'bunker-industrial',
        slug: 'bunker-industrial',
        name: 'Búnker Industrial B2B',
        entityType: 'enterprise',
        isActive: true,
        visits: 0,
        subscribers: 0,
        offers: [],
        address: '',
        category: '',
        phone: '',
        whatsapp: '',
        instagram: '',
        facebook: '',
        tiktok: '',
        website: '',
        mapUrl: '',
        rating: 5,
        specialty: 'Industrial B2B',
        image: '',
        bannerImage: '',
        createdAt: new Date().toISOString()
    }), []);

    return (
        <div className="min-h-screen bg-black text-white pb-24 relative overflow-hidden selection:bg-amber-500/30">
            {/* Background Amber HUD */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full blur-[100px]" style={{ backgroundColor: hexToRgba(AMBER, 0.08) }} />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full blur-[100px]" style={{ backgroundColor: hexToRgba(AMBER, 0.05) }} />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(245,158,11,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(245,158,11,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
            </div>

            {/* Header */}
            <div className="bg-zinc-900/50 backdrop-blur-md pt-8 pb-6 px-6 flex flex-col items-center border-b border-amber-500/20 mb-6 sticky top-0 z-50">
                <button onClick={() => { playNeonClick(); navigate(`/empresas`); }}
                    className="self-start mb-4 w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-400/30 hover:bg-amber-500/20 transition-all">
                    <ChevronLeft size={20} />
                </button>
                <Factory size={28} className="text-amber-400 mb-2 drop-shadow-[0_0_15px_rgba(245,158,11,0.6)]" />
                <h1 className="text-[18px] font-black text-white uppercase tracking-[0.2em] text-center drop-shadow-[0_0_10px_rgba(245,158,11,0.4)]">
                    Búnker Industrial
                </h1>
                <p className="text-[8px] font-bold text-amber-400/60 uppercase tracking-widest mt-1 italic">
                    Panel de Control B2B · {formattedTown}
                </p>
                <div className="mt-2">
                    <DobermanBadge />
                </div>
            </div>

            <div className="px-6 space-y-6 relative z-10 max-w-lg mx-auto">
                {/* ─── Botón Premium Panel Central ─── */}
                <div className="glass-card-3d bg-gradient-to-r from-amber-500/10 to-amber-500/5 border border-amber-400/40 rounded-2xl p-5 relative overflow-hidden group shadow-[0_0_20px_rgba(245,158,11,0.15)]">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)] animate-pulse">
                                <Settings size={22} className="animate-spin" style={{ animationDuration: '6s' }} />
                            </div>
                            <div>
                                <h3 className="text-[12px] font-black text-white uppercase tracking-widest leading-none">
                                    PANEL CENTRAL DE GESTIÓN
                                </h3>
                                <p className="text-[8px] text-amber-400/80 uppercase tracking-widest mt-1.5 font-bold italic">
                                    Administración · {currentProvince.name}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => { playNeonClick(); navigate(`/esteban-echeverria/embajador/empresas?provincia=${provinciaParam}`); }}
                            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-[10px] font-black uppercase tracking-widest transition-all duration-300 shadow-[0_0_20px_rgba(245,158,11,0.4)] active:scale-95 hover:scale-105"
                        >
                            Ingresar
                        </button>
                    </div>
                </div>

                {/* ─── KPI Dashboard ─── */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="glass-card-3d bg-amber-500/5 border-amber-500/20 rounded-2xl p-4 flex flex-col items-center gap-1">
                        <TrendingUp size={20} className="text-amber-400" />
                        <span className="text-[28px] font-[1000] text-white">{enterprises.length}</span>
                        <span className="text-[8px] font-black text-amber-400/60 uppercase tracking-widest">Total Empresas</span>
                    </div>
                    <div className="glass-card-3d bg-green-500/5 border-green-500/20 rounded-2xl p-4 flex flex-col items-center gap-1">
                        <CheckCircle size={20} className="text-green-400" />
                        <span className="text-[28px] font-[1000] text-white">{activeEnterprises.length}</span>
                        <span className="text-[8px] font-black text-green-400/60 uppercase tracking-widest">Activas</span>
                    </div>
                    <div className="glass-card-3d bg-red-500/5 border-red-500/20 rounded-2xl p-4 flex flex-col items-center gap-1">
                        <AlertTriangle size={20} className="text-red-400" />
                        <span className="text-[28px] font-[1000] text-white">{inactiveEnterprises.length}</span>
                        <span className="text-[8px] font-black text-red-400/60 uppercase tracking-widest">Suspendidas</span>
                    </div>
                    <div className="glass-card-3d bg-cyan-500/5 border-cyan-500/20 rounded-2xl p-4 flex flex-col items-center gap-1">
                        <Package size={20} className="text-cyan-400" />
                        <span className="text-[28px] font-[1000] text-white">{Object.values(countByCategory).filter(c => c > 0).length}</span>
                        <span className="text-[8px] font-black text-cyan-400/60 uppercase tracking-widest">Rubros Activos</span>
                    </div>
                </div>

                {/* ─── Alcance Nacional vs Regional ─── */}
                <div className="glass-card-3d bg-white/[0.02] border-amber-500/15 rounded-2xl p-5">
                    <h3 className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Globe size={14} /> Distribución por Alcance
                    </h3>
                    <div className="flex gap-3">
                        <div className="flex-1 bg-amber-500/10 rounded-xl p-3 border border-amber-500/20 text-center">
                            <Globe size={16} className="text-amber-400 mx-auto mb-1" />
                            <span className="text-[20px] font-[1000] text-white block">{nationalCount}</span>
                            <span className="text-[7px] font-black text-amber-400/50 uppercase tracking-widest">Nacional 🌎</span>
                        </div>
                        <div className="flex-1 bg-white/5 rounded-xl p-3 border border-white/10 text-center">
                            <Landmark size={16} className="text-white/40 mx-auto mb-1" />
                            <span className="text-[20px] font-[1000] text-white block">{regionalCount}</span>
                            <span className="text-[7px] font-black text-white/40 uppercase tracking-widest">Regional 📍</span>
                        </div>
                    </div>
                </div>

                {/* ─── Radar de Rubros ─── */}
                <div className="glass-card-3d bg-white/[0.02] border-amber-500/15 rounded-2xl p-5">
                    <h3 className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <BarChart3 size={14} /> Radar de Rubros Industriales
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                        {ENTERPRISE_CATEGORIES.map(cat => {
                            const count = countByCategory[cat.id] || 0;
                            const hasEnterprises = count > 0;
                            return (
                                <div
                                    key={cat.id}
                                    className={`rounded-xl p-2.5 border text-center transition-all
                                        ${hasEnterprises
                                            ? 'bg-amber-500/10 border-amber-500/30'
                                            : 'bg-white/[0.02] border-white/5'
                                        }`}
                                >
                                    <div className={`text-[14px] font-[1000] ${hasEnterprises ? 'text-amber-400' : 'text-white/20'}`}>
                                        {count}
                                    </div>
                                    <div className={`text-[6px] font-black uppercase tracking-widest mt-0.5 ${hasEnterprises ? 'text-white/60' : 'text-white/20'}`}>
                                        {cat.name}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ─── Accesos Rápidos ─── */}
                <div className="glass-card-3d bg-white/[0.02] border-amber-500/15 rounded-2xl p-5">
                    <h3 className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Zap size={14} /> Accesos Rápidos
                    </h3>
                    <div className="space-y-2">
                        {quickLinks.map((link, i) => {
                            const colorMap: Record<string, { bg: string; border: string; text: string; hoverBg: string }> = {
                                cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', text: 'text-cyan-400', hoverBg: 'hover:bg-cyan-500/20' },
                                violet: { bg: 'bg-violet-500/10', border: 'border-violet-500/20', text: 'text-violet-400', hoverBg: 'hover:bg-violet-500/20' },
                                amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', hoverBg: 'hover:bg-amber-500/20' },
                            };
                            const c = colorMap[link.color] || colorMap.amber;
                            return (
                                <button
                                    key={i}
                                    onClick={() => { playNeonClick(); navigate(link.path); }}
                                    className={`w-full bg-zinc-900/50 border border-amber-500/15 rounded-xl p-3.5 flex items-center gap-3 ${c.hoverBg} hover:border-amber-500/30 transition-all active:scale-[0.98] group`}
                                >
                                    <div className={`w-9 h-9 rounded-lg ${c.bg} border ${c.border} flex items-center justify-center ${c.text} group-hover:scale-105 transition-all`}>
                                        {link.icon}
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="text-[10px] font-black text-white uppercase tracking-widest">{link.title}</p>
                                        <p className="text-[8px] text-white/40 tracking-wider">{link.desc}</p>
                                    </div>
                                    <ExternalLink size={14} className={`text-white/20 group-hover:${c.text} transition-colors`} />
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ─── Listado de Empresas Activas ─── */}
                {activeEnterprises.length > 0 && (
                    <div className="glass-card-3d bg-white/[0.02] border-amber-500/15 rounded-2xl p-5">
                        <h3 className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Users size={14} /> Empresas Activas en la Red
                        </h3>
                        <div className="space-y-2">
                            {activeEnterprises.map(ent => (
                                <div key={ent.id} className="bg-zinc-900/50 border border-amber-500/10 rounded-xl p-3 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-black/40 border border-amber-500/20 flex-shrink-0">
                                        {ent.bannerImage ? (
                                            <img src={ent.bannerImage} alt={ent.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <Factory size={16} className="text-amber-500/30 m-auto mt-2.5" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-black text-white uppercase tracking-wider truncate">{ent.name}</p>
                                        <p className="text-[7px] text-white/40 uppercase tracking-widest">
                                            {ENTERPRISE_CATEGORIES.find(c => c.id === ent.category || c.slug === ent.category)?.name || ent.category}
                                            {' · '}
                                            {ent.reach === 'national' ? '🌎 Nacional' : '📍 Regional'}
                                        </p>
                                    </div>
                                    <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_6px_rgba(34,197,94,0.8)]" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <footer className="w-full flex flex-col items-center gap-2 pt-8 pb-6 mt-8 border-t border-amber-500/10 relative z-10">
                <p className="text-[9px] font-black text-white uppercase tracking-[0.35em] text-center select-none">
                    © 2026 · ShopDigital
                </p>
                <p className="text-[8px] font-bold text-amber-400 uppercase tracking-[0.25em] select-none" style={{ textShadow: '0 0 10px rgba(245,158,11,0.5)' }}>
                    🏭 Búnker Industrial · Control B2B
                </p>
            </footer>
            
            {/* ARI industrial assistant widget */}
            <AriMerchantAssistant role="industrial" shop={bunkerShop} allShops={allShops} />
        </div>
    );
};

export default EnterpriseMasterPanelPage;
