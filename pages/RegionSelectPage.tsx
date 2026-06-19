import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, ChevronRight, Globe, Zap, Lock, Mountain, Building2, Palmtree } from 'lucide-react';
import { obtenerRegionPorId, subscribeToTowns } from '../firebase';
import { Region } from '../types';
import { playNeonClick } from '../utils/audio';

const STATIC_REGIONS: Record<string, Region> = {
    'traslasierra': {
        id: 'traslasierra',
        name: 'Valle de Traslasierra',
        provinceId: 'cordoba',
        type: 'region',
        towns: ['mina-clavero', 'nono', 'cura-brochero', 'panaholma', 'villa-dolores', 'villa-las-rosas', 'san-javier', 'las-rabonas'],
        color: '#0ea5e9',
        icon: 'mountain',
        isActive: true,
        createdAt: new Date().toISOString()
    },
    'buenos-aires-sur': {
        id: 'buenos-aires-sur',
        name: 'Buenos Aires Sur',
        provinceId: 'buenos-aires',
        type: 'zona',
        towns: ['esteban-echeverria', 'ezeiza', 'lomas-de-zamora'],
        color: '#22d3ee',
        icon: 'building',
        isActive: true,
        createdAt: new Date().toISOString()
    },
    'patagonia-7-lagos': {
        id: 'patagonia-7-lagos',
        name: 'Región Patagónica - 7 Lagos',
        provinceId: 'neuquen-rio-negro',
        type: 'region',
        towns: ['bariloche', 'villa-la-angostura', 'san-martin-de-los-andes'],
        color: '#0284c7', // Azul Lago Patagónico
        icon: 'mountain',
        isActive: true,
        createdAt: new Date().toISOString()
    }
};

const RegionSelectPage: React.FC = () => {
    const { regionId } = useParams<{ regionId: string }>();
    const navigate = useNavigate();
    const [region, setRegion] = useState<Region | null>(null);
    const [towns, setTowns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!regionId) return;
        
        // Cargar instantáneamente la región estática como fallback
        if (STATIC_REGIONS[regionId]) {
            setRegion(STATIC_REGIONS[regionId]);
        }

        obtenerRegionPorId(regionId).then(r => {
            if (r) {
                setRegion(r);
            }
            if (!r && !STATIC_REGIONS[regionId]) {
                setLoading(false);
            }
        });
    }, [regionId]);

    useEffect(() => {
        const unsubscribe = subscribeToTowns((data) => {
            setTowns(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // Filter towns that belong to this region
    const regionTowns = region
        ? region.towns.map(townId => {
            const townData = towns.find(t => t.id === townId);
            return {
                id: townId,
                name: townData?.name || townId.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
                localities: townData?.localities && townData.localities.length > 0 ? townData.localities : ['Centro'],
                exists: true, // Siempre habilitado para permitir el ruteo y configuración fractal
                shopCount: 0
            };
        })
        : [];

    const hexToRgba = (hex: string, a: number) => {
        try {
            const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
            return `rgba(${r},${g},${b},${a})`;
        } catch { return `rgba(168,85,247,${a})`; }
    };

    const regionColor = region?.color || '#a855f7';

    const getRegionIcon = (icon?: string) => {
        switch (icon) {
            case 'mountain': return <Mountain size={28} />;
            case 'building': return <Building2 size={28} />;
            case 'palmtree': return <Palmtree size={28} />;
            default: return <Globe size={28} />;
        }
    };

    if (!region && !loading) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
                <Globe size={48} className="text-white/10 mb-4" />
                <p className="text-sm font-black uppercase tracking-widest text-white/30">Región no encontrada</p>
                <button onClick={() => navigate('/')} className="mt-6 text-xs text-cyan-400 underline">
                    Volver al Comando Central
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden relative">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div
                    className="absolute top-[-15%] left-[-10%] w-[45%] h-[45%] rounded-full blur-[130px] animate-pulse"
                    style={{ backgroundColor: hexToRgba(regionColor, 0.08) }}
                />
                <div
                    className="absolute bottom-[-15%] right-[-10%] w-[45%] h-[45%] rounded-full blur-[130px] animate-pulse"
                    style={{ backgroundColor: hexToRgba(regionColor, 0.05), animationDelay: '1.5s' }}
                />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
            </div>

            <main className="relative z-10 max-w-lg mx-auto pb-16 px-5">
                {/* Header */}
                <header className="pt-8 pb-6 animate-in fade-in duration-700">
                    <div className="flex items-center justify-between mb-6">
                        <button
                            onClick={() => {
                                playNeonClick();
                                navigate('/');
                            }}
                            className="p-3.5 rounded-2xl bg-black/45 border backdrop-blur-md text-white/70 hover:text-white hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] active:scale-90 transition-all cursor-pointer flex items-center justify-center"
                            style={{
                                borderColor: hexToRgba(regionColor, 0.35),
                                boxShadow: `0 8px 30px rgba(0,0,0,0.5), inset 0 0 10px ${hexToRgba(regionColor, 0.05)}`
                            }}
                        >
                            <ArrowLeft size={16} style={{ color: regionColor, filter: `drop-shadow(0 0 6px ${regionColor})` }} />
                        </button>
                        <div className="text-center flex-1 px-4">
                            <p className="text-[8px] font-black uppercase tracking-[0.4em] text-white/20">
                                {region?.type === 'region' ? '🏔️ Región' : '📍 Zona'}
                            </p>
                        </div>
                        <div className="w-10" />
                    </div>

                    {/* Region Hero */}
                    <div className="text-center space-y-3">
                        <div
                            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl border relative"
                            style={{
                                background: hexToRgba(regionColor, 0.1),
                                borderColor: hexToRgba(regionColor, 0.3),
                                color: regionColor
                            }}
                        >
                            {getRegionIcon(region?.icon)}
                            <div
                                className="absolute -top-1 -right-1 w-3 h-3 rounded-full animate-ping"
                                style={{ backgroundColor: regionColor, opacity: 0.4 }}
                            />
                        </div>
                        <h1
                            className="text-2xl font-black uppercase tracking-tight"
                            style={{
                                color: regionColor,
                                textShadow: `0 0 30px ${hexToRgba(regionColor, 0.4)}, 0 0 60px ${hexToRgba(regionColor, 0.2)}`
                            }}
                        >
                            {region?.name || 'Cargando...'}
                        </h1>
                        <p className="text-[9px] text-white/30 uppercase tracking-[0.3em]">
                            {regionTowns.length} {regionTowns.length === 1 ? 'localidad' : 'localidades'} · Seleccioná tu destino
                        </p>
                    </div>
                </header>

                {/* Locality Cards */}
                <section className="space-y-3 mt-4">
                    {loading ? (
                        <div className="flex flex-col items-center py-16 gap-3">
                            <Zap size={28} className="animate-bounce" style={{ color: hexToRgba(regionColor, 0.4) }} />
                            <p className="text-[9px] font-black uppercase tracking-widest text-white/20">Escaneando la región...</p>
                        </div>
                    ) : (
                        regionTowns.map((town, idx) => (
                            <button
                                key={town.id}
                                onClick={() => {
                                    if (town.exists) {
                                        playNeonClick();
                                        navigate(`/${town.id}/home`);
                                    }
                                }}
                                disabled={!town.exists}
                                className={`w-full text-left p-5 rounded-[1.5rem] border transition-all group ${
                                    town.exists
                                        ? 'bg-white/[0.03] backdrop-blur-xl border-white/5 hover:border-white/15 active:scale-[0.98]'
                                        : 'bg-white/[0.01] border-white/[0.03] opacity-40 cursor-not-allowed'
                                }`}
                                style={{
                                    animation: `fadeUp 0.5s cubic-bezier(0.25,1,0.5,1) ${idx * 100}ms both`,
                                    borderLeftWidth: town.exists ? 3 : 1,
                                    borderLeftColor: town.exists ? hexToRgba(regionColor, 0.5) : 'transparent'
                                }}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                                            style={{
                                                background: town.exists ? hexToRgba(regionColor, 0.1) : 'rgba(255,255,255,0.02)',
                                                border: `1px solid ${town.exists ? hexToRgba(regionColor, 0.2) : 'rgba(255,255,255,0.05)'}`,
                                                color: town.exists ? regionColor : 'rgba(255,255,255,0.15)'
                                            }}
                                        >
                                            {town.exists ? <MapPin size={18} /> : <Lock size={16} />}
                                        </div>
                                        <div>
                                            <h3 className="text-[12px] font-black uppercase tracking-wider text-white/90 group-hover:text-white transition-colors">
                                                {town.name}
                                            </h3>
                                            <p className="text-[8px] uppercase tracking-widest mt-0.5" style={{ color: town.exists ? hexToRgba(regionColor, 0.5) : 'rgba(255,255,255,0.15)' }}>
                                                {town.exists ? `${town.localities.length || 0} barrios` : 'Próximamente'}
                                            </p>
                                        </div>
                                    </div>
                                    {town.exists ? (
                                        <div className="flex items-center gap-2">
                                            <span
                                                className="text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg"
                                                style={{
                                                    background: hexToRgba(regionColor, 0.15),
                                                    color: regionColor,
                                                    boxShadow: `0 0 15px ${hexToRgba(regionColor, 0.1)}`
                                                }}
                                            >
                                                Entrar
                                            </span>
                                            <ChevronRight size={16} className="text-white/10 group-hover:text-white/30 transition-colors" />
                                        </div>
                                    ) : (
                                        <Lock size={14} className="text-white/10" />
                                    )}
                                </div>
                            </button>
                        ))
                    )}
                </section>

                {/* Back to Command Center */}
                <div className="mt-10 text-center">
                    <button
                        onClick={() => { playNeonClick(); navigate('/'); }}
                        className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 hover:text-white/40 transition-colors flex items-center gap-2 mx-auto"
                    >
                        <Globe size={12} /> Volver al Comando Central
                    </button>
                </div>
            </main>
        </div>
    );
};

export default RegionSelectPage;
