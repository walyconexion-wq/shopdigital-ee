import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mountain, MapPin, Search, ChevronRight, Globe, Zap, Building2, Palmtree } from 'lucide-react';
import { suscribirseARegiones } from '../firebase';
import { Region, Shop } from '../types';
import { playNeonClick } from '../utils/audio';
import ArgentinaMap from '../components/ArgentinaMap';
import Logo from '../components/Logo';
import { AriMerchantAssistant } from '../components/AriMerchantAssistant';

const GlobalHomePage: React.FC = () => {
    const navigate = useNavigate();
    const [regions, setRegions] = useState<Region[]>([]);
    const [filter, setFilter] = useState<'all' | 'region' | 'zona'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Mock Shop para que ARI funcione en la Home Global
    const globalShop: Shop = {
        id: 'global-network',
        name: 'Red Digital Argentina',
        ownerId: 'admin',
        townId: 'argentina',
        category: 'Plataforma',
        description: 'Centro de mando nacional de ShopDigital',
        address: 'Nube Digital',
        phone: '',
        color: '#00FBFF',
        visits: 2500,
        subscribers: 150,
        offers: [],
        active: true,
        whatsapp: ''
    };

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const unsubscribe = suscribirseARegiones((data) => {
            setRegions(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const filteredRegions = regions
        .filter(r => filter === 'all' || r.type === filter)
        .filter(r => {
            if (!searchQuery) return true;
            const q = searchQuery.toLowerCase();
            return r.name.toLowerCase().includes(q) ||
                   r.towns.some(t => t.replace(/-/g, ' ').includes(q));
        });

    const handleRegionClick = (region: Region) => {
        playNeonClick();
        if (region.towns.length === 1) {
            navigate(`/${region.towns[0]}/home`);
        } else {
            navigate(`/region/${region.id}`);
        }
    };

    const mapNodes = [
        { id: 'buenos-aires-sur', label: 'Buenos Aires', x: 190, y: 260, isActive: regions.some(r => r.id === 'buenos-aires-sur') },
        { id: 'traslasierra', label: 'Traslasierra', x: 135, y: 180, isActive: regions.some(r => r.id === 'traslasierra') },
        { id: 'calamuchita', label: 'Calamuchita', x: 140, y: 195, isActive: regions.some(r => r.id === 'calamuchita') },
        { id: 'punilla', label: 'Punilla', x: 138, y: 170, isActive: regions.some(r => r.id === 'punilla') },
        { id: 'rosario', label: 'Rosario', x: 175, y: 220, isActive: regions.some(r => r.id === 'rosario') },
        { id: 'siete-lagos', label: '7 Lagos', x: 100, y: 370, isActive: regions.some(r => r.id === 'siete-lagos') },
    ];

    const getRegionIcon = (icon: string) => {
        switch (icon) {
            case 'mountain': return <Mountain size={22} />;
            case 'building': return <Building2 size={22} />;
            case 'palmtree': return <Palmtree size={22} />;
            default: return <Globe size={22} />;
        }
    };

    const hexToRgba = (hex: string, a: number) => {
        try {
            const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
            return `rgba(${r},${g},${b},${a})`;
        } catch { return `rgba(0,251,255,${a})`; }
    };

    return (
        <div 
            className="h-screen w-full bg-black text-white font-sans overflow-y-auto overflow-x-hidden relative selection:bg-cyan-500/30"
            style={{ WebkitOverflowScrolling: 'touch' }}
        >
            {/* Cybernetic Background Mesh — Capa visible en el fondo */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                {/* Glow Orbs */}
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[180px] bg-cyan-600/10 animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[180px] bg-violet-600/10 animate-pulse" style={{ animationDelay: '2s' }} />
                
                {/* Hexagonal Grid Layer */}
                <div 
                    className="absolute inset-0 opacity-[0.12]"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='104' viewBox='0 0 60 104' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M60 104V102.66c-1.1.2-2.22.34-3.37.34-11.05 0-20-8.95-20-20s8.95-20 20-20c1.15 0 2.27.14 3.37.34V50.66c-1.1.2-2.22.34-3.37.34-11.05 0-20-8.95-20-20s8.95-20 20-20c1.15 0 2.27.14 3.37.34V0h-2v1.34C56.9 1.14 55.78 1 54.63 1c-11.05 0-20 8.95-20 20s8.95 20 20 20c1.15 0 2.27-.14 3.37-.34v25.32c-1.1-.2-2.22-.34-3.37-.34-11.05 0-20 8.95-20 20s8.95 20 20 20c1.15 0 2.27-.14 3.37.34v25.32c-1.1-.2-2.22-.34-3.37-.34-11.05 0-20 8.95-20 20s8.95 20 20 20c1.15 0 2.27-.14 3.37.34V104h-2zM0 104V0h2v104H0zm2 0V0h2v104H2zm2 0V0h2v104H4zm2 0V0h2v104H6zm2 0V0h2v104H8zm2 0V0h2v104H10zm2 0V0h2v104H12zm2 0V0h2v104H14zm2 0V0h2v104H16zm2 0V0h2v104H18zm2 0V0h2v104H20zm2 0V0h2v104H22zm2 0V0h2v104H24zm2 0V0h2v104H26zm2 0V0h2v104H28zm2 0V0h2v104H30zm2 0V0h2v104H32zm2 0V0h2v104H34v-1.34c-1.1.2-2.22.34-3.37.34-11.05 0-20-8.95-20-20s8.95-20 20-20c1.15 0 2.27.14 3.37.34V50.66c-1.1.2-2.22.34-3.37.34-11.05 0-20-8.95-20-20s8.95-20 20-20c1.15 0 2.27.14 3.37.34V0h2v1.34c-1.1-.2-2.22-.34-3.37-.34-11.05 0-20-8.95-20-20s8.95 20 20 20c1.15 0 2.27-.14 3.37.34v25.32c-1.1-.2-2.22-.34-3.37-.34-11.05 0-20 8.95-20 20s8.95 20 20 20c1.15 0 2.27-.14 3.37.34v25.32c-1.1-.2-2.22-.34-3.37-.34-11.05 0-20 8.95-20 20s8.95 20 20 20c1.15 0 2.27-.14 3.37.34V104h-2z' fill='%236366f1' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E")`,
                        backgroundSize: '80px 140px'
                    }}
                />

                {/* Tech Circles Background */}
                <div className="absolute inset-0 opacity-[0.05]">
                    {[...Array(6)].map((_, i) => (
                        <div 
                            key={i}
                            className="absolute rounded-full border border-cyan-500/30 animate-pulse"
                            style={{
                                width: `${(i + 1) * 200}px`,
                                height: `${(i + 1) * 200}px`,
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                animationDelay: `${i * 0.5}s`,
                                animationDuration: '4s'
                            }}
                        />
                    ))}
                </div>
            </div>

            <main className="relative z-10 max-w-lg mx-auto flex flex-col pb-32">
                {/* Header — Logo + título único */}
                <header className="sticky top-0 z-[100] pt-6 pb-4 flex flex-col items-center gap-2 animate-in fade-in duration-1000 backdrop-blur-xl border-b border-white/5 bg-black/40 px-5 -mx-5">
                    <div
                        className="rounded-2xl p-3.5 border backdrop-blur-md"
                        style={{
                            borderColor: 'rgba(0,251,255,0.4)',
                            boxShadow: '0 10px 40px rgba(0,251,255,0.15)',
                            background: 'linear-gradient(135deg, rgba(0,251,255,0.18) 0%, rgba(15,23,42,0.6) 100%)'
                        }}
                    >
                        <Logo />
                    </div>
                    <div className="text-center">
                        <p
                            className="text-[10px] font-black uppercase tracking-[0.5em]"
                            style={{
                                color: '#00FBFF',
                                textShadow: '0 0 15px rgba(0,251,255,0.6), 0 0 30px rgba(0,251,255,0.3)'
                            }}
                        >
                            Explorá tu zona
                        </p>
                    </div>
                </header>

                {/* Search Bar — con luminosidad */}
                <div className="mb-8 animate-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: '200ms' }}>
                    <div className="relative">
                        <Search
                            size={16}
                            className="absolute left-4 top-1/2 -translate-y-1/2"
                            style={{ color: '#00FBFF', filter: 'drop-shadow(0 0 6px rgba(0,251,255,0.5))' }}
                        />
                        <input
                            type="text"
                            placeholder="¿Dónde estás hoy?"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full backdrop-blur-xl rounded-2xl py-4 pl-11 pr-4 text-xs font-bold text-white placeholder:text-cyan-300/30 focus:outline-none transition-all"
                            style={{
                                backgroundColor: 'rgba(0,251,255,0.08)',
                                border: '1.5px solid rgba(0,251,255,0.35)',
                                boxShadow: '0 0 25px rgba(0,251,255,0.12), inset 0 0 20px rgba(0,251,255,0.03)',
                                textShadow: '0 0 8px rgba(0,251,255,0.3)'
                            }}
                        />
                    </div>
                </div>

                {/* Toggle: Regiones / Zonas — con más brillo */}
                <div className="flex gap-2 mb-8 animate-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: '300ms' }}>
                    {[
                        { key: 'all' as const, label: 'Todo', icon: <Globe size={14} /> },
                        { key: 'region' as const, label: 'Regiones', icon: <Mountain size={14} /> },
                        { key: 'zona' as const, label: 'Zonas', icon: <MapPin size={14} /> }
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => { playNeonClick(); setFilter(tab.key); }}
                            className="flex-1 py-3.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all active:scale-95 border"
                            style={{
                                backgroundColor: filter === tab.key ? 'rgba(0,251,255,0.18)' : 'rgba(255,255,255,0.04)',
                                borderColor: filter === tab.key ? 'rgba(0,251,255,0.5)' : 'rgba(255,255,255,0.08)',
                                color: filter === tab.key ? '#00FBFF' : 'rgba(255,255,255,0.5)',
                                boxShadow: filter === tab.key ? '0 0 25px rgba(0,251,255,0.2), inset 0 0 15px rgba(0,251,255,0.05)' : 'none',
                                textShadow: filter === tab.key ? '0 0 10px rgba(0,251,255,0.5)' : 'none'
                            }}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                {/* Map Section — con HUD Tecnológico */}
                <div className="mb-8 animate-in fade-in duration-1000" style={{ animationDelay: '500ms' }}>
                    <div
                        className="border rounded-[2rem] p-4 backdrop-blur-xl relative overflow-hidden"
                        style={{
                            backgroundColor: 'rgba(0,251,255,0.03)',
                            borderColor: 'rgba(0,251,255,0.12)',
                            boxShadow: '0 0 40px rgba(0,251,255,0.06)'
                        }}
                    >
                        {/* HUD Superior: Fecha/Hora y Seguridad */}
                        <div className="absolute top-4 left-6 right-6 flex justify-between items-start z-20 pointer-events-none">
                            {/* Doberman Security Shield — Bájado un poco para no tapar */}
                            <div className="flex flex-col gap-1 mt-6">
                                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-green-500/30 bg-green-500/5 backdrop-blur-md">
                                    <Zap size={10} className="text-green-400 animate-pulse" />
                                    <span className="text-[8px] font-black uppercase tracking-widest text-green-400" style={{ textShadow: '0 0 8px rgba(74,222,128,0.5)' }}>
                                        Doberman 2.0 Active
                                    </span>
                                </div>
                                <p className="text-[6px] uppercase tracking-[0.2em] text-white/20 ml-1">Shield protocol engaged</p>
                            </div>

                            {/* Digital Clock */}
                            <div className="text-right">
                                <p className="text-[10px] font-black tracking-widest text-white/80 tabular-nums" style={{ textShadow: '0 0 10px rgba(255,255,255,0.3)' }}>
                                    {currentTime.toLocaleTimeString('es-AR', { hour12: false })}
                                </p>
                                <p className="text-[7px] uppercase tracking-widest text-cyan-400/50 mt-0.5">
                                    {currentTime.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' }).replace('.', '')}
                                </p>
                            </div>
                        </div>

                        {/* HUD Inferior: Tráfico en Red */}
                        <div className="absolute bottom-8 left-8 z-20 pointer-events-none">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                                <p className="text-[8px] font-black uppercase tracking-[0.3em] text-cyan-400" style={{ textShadow: '0 0 8px rgba(34,211,238,0.5)' }}>
                                    Net Traffic: {Math.floor(2100 + Math.random() * 50).toLocaleString()} Active
                                </p>
                            </div>
                        </div>

                        {/* Título Centralizado — Subido un poco para despejar */}
                        <p className="text-[9px] font-black uppercase tracking-[0.5em] text-center mb-1 relative z-30"
                            style={{ color: 'rgba(0,251,255,0.7)', textShadow: '0 0 12px rgba(0,251,255,0.5)' }}
                        >
                            <Globe size={11} className="inline mr-2 mb-0.5" style={{ color: '#00FBFF' }} />
                            RADAR NACIONAL · NODOS: {regions.length || 2}
                        </p>
                        
                        <div className="relative py-4">
                            <ArgentinaMap
                                nodes={mapNodes}
                                onNodeClick={(id) => {
                                    const region = regions.find(r => r.id === id);
                                    if (region) handleRegionClick(region);
                                }}
                                accentColor="#00FBFF"
                            />
                        </div>
                    </div>
                </div>

                {/* Region Cards */}
                <section className="space-y-3 animate-in slide-in-from-bottom-6 duration-700" style={{ animationDelay: '600ms' }}>
                    <h2
                        className="text-[9px] font-black uppercase tracking-[0.4em] flex items-center gap-2 ml-1"
                        style={{ color: 'rgba(0,251,255,0.5)', textShadow: '0 0 8px rgba(0,251,255,0.3)' }}
                    >
                        <Globe size={12} style={{ color: '#00FBFF', filter: 'drop-shadow(0 0 4px rgba(0,251,255,0.5))' }} />
                        {filter === 'region' ? 'Regiones Turísticas' : filter === 'zona' ? 'Zonas Urbanas' : 'Zonas y Regiones'}
                    </h2>

                    {loading ? (
                        <div className="flex flex-col items-center py-16 gap-3">
                            <Zap size={28} className="animate-bounce" style={{ color: '#00FBFF', filter: 'drop-shadow(0 0 8px rgba(0,251,255,0.6))' }} />
                            <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'rgba(0,251,255,0.4)', textShadow: '0 0 8px rgba(0,251,255,0.3)' }}>
                                Sincronizando la Red...
                            </p>
                        </div>
                    ) : (filteredRegions.length === 0 && searchQuery === '') ? (
                        // Muestra zonas por defecto si no hay nada en Firebase aún
                        <div className="space-y-3">
                            {[
                                { id: 'esteban-echeverria', name: 'Esteban Echeverría', type: 'zona', towns: ['esteban-echeverria'], color: '#22d3ee', icon: 'building' },
                                { id: 'ezeiza', name: 'Ezeiza', type: 'zona', towns: ['ezeiza'], color: '#22d3ee', icon: 'building' }
                            ].map((region, idx) => (
                                <button
                                    key={region.id}
                                    onClick={() => navigate(`/${region.id}/home`)}
                                    className="w-full text-left backdrop-blur-xl border p-5 rounded-[1.5rem] transition-all group active:scale-[0.98]"
                                    style={{
                                        animation: `fadeUp 0.5s cubic-bezier(0.25,1,0.5,1) ${idx * 80}ms both`,
                                        backgroundColor: hexToRgba(region.color, 0.06),
                                        borderColor: hexToRgba(region.color, 0.2),
                                        borderLeftWidth: 3,
                                        borderLeftColor: hexToRgba(region.color, 0.7),
                                        boxShadow: `0 0 25px ${hexToRgba(region.color, 0.08)}`
                                    }}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-11 h-11 rounded-xl flex items-center justify-center"
                                                style={{
                                                    background: hexToRgba(region.color, 0.15),
                                                    border: `1px solid ${hexToRgba(region.color, 0.4)}`,
                                                    color: region.color,
                                                    boxShadow: `0 0 15px ${hexToRgba(region.color, 0.2)}`
                                                }}
                                            >
                                                {getRegionIcon(region.icon)}
                                            </div>
                                            <div>
                                                <h3 className="text-[12px] font-black uppercase tracking-wider group-hover:text-white transition-colors" style={{ color: 'rgba(255,255,255,0.95)' }}>
                                                    {region.name}
                                                </h3>
                                                <p className="text-[8px] uppercase tracking-widest mt-0.5" style={{ color: hexToRgba(region.color, 0.6) }}>
                                                    📍 Zona Local · {region.towns.length} localidad
                                                </p>
                                            </div>
                                        </div>
                                        <ChevronRight size={18} style={{ color: hexToRgba(region.color, 0.5) }} />
                                    </div>
                                </button>
                            ))}
                            <div className="text-center py-6">
                                <p className="text-[8px] uppercase tracking-widest text-white/10 italic">Zonas iniciales cargadas por defecto</p>
                            </div>
                        </div>
                    ) : filteredRegions.length === 0 ? (
                        <div className="text-center py-16 border-2 border-dashed rounded-[2rem]" style={{ borderColor: 'rgba(0,251,255,0.1)' }}>
                            <Globe size={32} className="mx-auto mb-4" style={{ color: 'rgba(0,251,255,0.15)' }} />
                            <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'rgba(0,251,255,0.3)' }}>Sin resultados</p>
                        </div>
                    ) : (
                        filteredRegions.map((region, idx) => (
                            <button
                                key={region.id}
                                onClick={() => handleRegionClick(region)}
                                className="w-full text-left backdrop-blur-xl border p-5 rounded-[1.5rem] transition-all group active:scale-[0.98]"
                                style={{
                                    animation: `fadeUp 0.5s cubic-bezier(0.25,1,0.5,1) ${idx * 80}ms both`,
                                    backgroundColor: hexToRgba(region.color, 0.06),
                                    borderColor: hexToRgba(region.color, 0.2),
                                    borderLeftWidth: 3,
                                    borderLeftColor: hexToRgba(region.color, 0.7),
                                    boxShadow: `0 0 25px ${hexToRgba(region.color, 0.08)}`
                                }}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-11 h-11 rounded-xl flex items-center justify-center"
                                            style={{
                                                background: hexToRgba(region.color, 0.15),
                                                border: `1px solid ${hexToRgba(region.color, 0.4)}`,
                                                color: region.color,
                                                boxShadow: `0 0 15px ${hexToRgba(region.color, 0.2)}`
                                            }}
                                        >
                                            {getRegionIcon(region.icon)}
                                        </div>
                                        <div>
                                            <h3
                                                className="text-[12px] font-black uppercase tracking-wider group-hover:text-white transition-colors"
                                                style={{ color: 'rgba(255,255,255,0.95)', textShadow: '0 0 10px rgba(255,255,255,0.15)' }}
                                            >
                                                {region.name}
                                            </h3>
                                            <p
                                                className="text-[8px] uppercase tracking-widest mt-0.5"
                                                style={{ color: hexToRgba(region.color, 0.6), textShadow: `0 0 6px ${hexToRgba(region.color, 0.3)}` }}
                                            >
                                                {region.type === 'region' ? '🏔️ Región' : '📍 Zona'} · {region.towns.length} {region.towns.length === 1 ? 'localidad' : 'localidades'}
                                            </p>
                                        </div>
                                    </div>
                                    <ChevronRight size={18} style={{ color: hexToRgba(region.color, 0.5), filter: `drop-shadow(0 0 4px ${hexToRgba(region.color, 0.3)})` }} />
                                </div>
                                {/* Town pills — con luminosidad */}
                                <div className="flex flex-wrap gap-1.5 mt-3">
                                    {region.towns.slice(0, 4).map(townId => (
                                        <span
                                            key={townId}
                                            className="text-[7px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md"
                                            style={{
                                                background: hexToRgba(region.color, 0.12),
                                                color: hexToRgba(region.color, 0.8),
                                                border: `1px solid ${hexToRgba(region.color, 0.15)}`,
                                                textShadow: `0 0 6px ${hexToRgba(region.color, 0.3)}`
                                            }}
                                        >
                                            {townId.replace(/-/g, ' ')}
                                        </span>
                                    ))}
                                    {region.towns.length > 4 && (
                                        <span className="text-[7px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md"
                                            style={{ color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.04)' }}
                                        >
                                            +{region.towns.length - 4} más
                                        </span>
                                    )}
                                </div>
                            </button>
                        ))
                    )}
                </section>

                {/* Botón de Compartir — Estilo Neón */}
                <div className="mt-12 flex justify-center animate-in fade-in duration-1000" style={{ animationDelay: '800ms' }}>
                    <button
                        onClick={() => {
                            playNeonClick();
                            if (navigator.share) {
                                navigator.share({
                                    title: 'ShopDigital - Red Comercial Nacional',
                                    text: 'Explorá la nueva red digital argentina',
                                    url: window.location.href
                                });
                            }
                        }}
                        className="flex items-center gap-3 px-8 py-4 rounded-2xl border backdrop-blur-xl transition-all active:scale-95 group"
                        style={{
                            backgroundColor: 'rgba(255,255,255,0.05)',
                            borderColor: 'rgba(0,251,255,0.3)',
                            boxShadow: '0 0 20px rgba(0,251,255,0.1)'
                        }}
                    >
                        <div className="p-2 rounded-lg bg-cyan-500/20 group-hover:bg-cyan-500/30 transition-colors">
                            <Search size={18} className="text-cyan-400" />
                        </div>
                        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/90">
                            Compartir Red Nacional
                        </span>
                    </button>
                </div>

                <footer className="mt-16 text-center border-t pt-8 pb-12" style={{ borderColor: 'rgba(0,251,255,0.08)' }}>
                    <p
                        className="text-[9px] font-black uppercase tracking-[0.35em]"
                        style={{ color: 'rgba(255,255,255,0.5)', textShadow: '0 0 6px rgba(255,255,255,0.1)' }}
                    >
                        © 2026 · ShopDigital
                    </p>
                    <p
                        className="text-[7px] uppercase tracking-[0.3em] mt-1"
                        style={{ color: 'rgba(0,251,255,0.4)', textShadow: '0 0 10px rgba(0,251,255,0.4)' }}
                    >
                        V.1.5 - COMANDO CENTRAL · ARGENTINA
                    </p>
                </footer>
            </main>

            {/* 🤖 ASISTENTE ARI REAL */}
            <AriMerchantAssistant shop={globalShop} />
        </div>
    );
};

export default GlobalHomePage;
