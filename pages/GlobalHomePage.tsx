import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mountain, MapPin, Search, ChevronRight, Globe, Zap, Building2, Palmtree } from 'lucide-react';
import { suscribirseARegiones } from '../firebase';
import { Region } from '../types';
import { playNeonClick } from '../utils/audio';
import ArgentinaMap from '../components/ArgentinaMap';
import Logo from '../components/Logo';

const GlobalHomePage: React.FC = () => {
    const navigate = useNavigate();
    const [regions, setRegions] = useState<Region[]>([]);
    const [filter, setFilter] = useState<'all' | 'region' | 'zona'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

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
        { id: 'buenos-aires-sur', label: 'Buenos Aires', x: 155, y: 235, isActive: regions.some(r => r.id === 'buenos-aires-sur') },
        { id: 'traslasierra', label: 'Traslasierra', x: 120, y: 185, isActive: regions.some(r => r.id === 'traslasierra') },
        { id: 'calamuchita', label: 'Calamuchita', x: 135, y: 178, isActive: regions.some(r => r.id === 'calamuchita') },
        { id: 'punilla', label: 'Punilla', x: 130, y: 170, isActive: regions.some(r => r.id === 'punilla') },
        { id: 'rosario', label: 'Rosario', x: 145, y: 200, isActive: regions.some(r => r.id === 'rosario') },
        { id: 'siete-lagos', label: '7 Lagos', x: 85, y: 290, isActive: regions.some(r => r.id === 'siete-lagos') },
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
        <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden relative">
            {/* Animated background — más brillo */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[150px] bg-cyan-500/10 animate-pulse" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[150px] bg-violet-500/8 animate-pulse" style={{ animationDelay: '2s' }} />
                <div className="absolute top-[40%] left-[30%] w-[30%] h-[30%] rounded-full blur-[120px] bg-cyan-400/5 animate-pulse" style={{ animationDelay: '3s' }} />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-15" />
            </div>

            <main className="relative z-10 max-w-lg mx-auto pb-16 px-5">
                {/* Header — Logo + título único */}
                <header className="pt-10 pb-6 flex flex-col items-center gap-4 animate-in fade-in duration-1000">
                    <div
                        className="rounded-3xl p-5 border backdrop-blur-md"
                        style={{
                            borderColor: 'rgba(0,251,255,0.5)',
                            boxShadow: '0 15px 60px rgba(0,251,255,0.25), 0 0 100px rgba(0,251,255,0.08)',
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

                {/* Map Section — con más glow */}
                <div className="mb-8 animate-in fade-in duration-1000" style={{ animationDelay: '500ms' }}>
                    <div
                        className="border rounded-[2rem] p-4 backdrop-blur-xl"
                        style={{
                            backgroundColor: 'rgba(0,251,255,0.03)',
                            borderColor: 'rgba(0,251,255,0.12)',
                            boxShadow: '0 0 40px rgba(0,251,255,0.06)'
                        }}
                    >
                        <p className="text-[8px] font-black uppercase tracking-[0.4em] text-center mb-2"
                            style={{ color: 'rgba(0,251,255,0.5)', textShadow: '0 0 8px rgba(0,251,255,0.3)' }}
                        >
                            <Zap size={10} className="inline mr-1" style={{ color: '#00FBFF', filter: 'drop-shadow(0 0 4px rgba(0,251,255,0.6))' }} />
                            Mapa de la Red · Nodos Activos: {regions.length}
                        </p>
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
                    ) : filteredRegions.length === 0 ? (
                        <div className="text-center py-16 border-2 border-dashed rounded-[2rem]"
                            style={{ borderColor: 'rgba(0,251,255,0.1)' }}
                        >
                            <Globe size={32} className="mx-auto mb-4" style={{ color: 'rgba(0,251,255,0.15)' }} />
                            <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'rgba(0,251,255,0.3)', textShadow: '0 0 6px rgba(0,251,255,0.2)' }}>
                                {searchQuery ? 'Sin resultados para esa búsqueda' : 'No hay zonas activas todavía'}
                            </p>
                            <p className="text-[8px] mt-2" style={{ color: 'rgba(255,255,255,0.2)' }}>
                                Las regiones se crean desde el Tablero Maestro → La Fábrica
                            </p>
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

                {/* Footer — limpio, sin duplicados */}
                <footer className="mt-16 text-center border-t pt-6 pb-4" style={{ borderColor: 'rgba(0,251,255,0.08)' }}>
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
                        Argentina
                    </p>
                </footer>
            </main>
        </div>
    );
};

export default GlobalHomePage;
