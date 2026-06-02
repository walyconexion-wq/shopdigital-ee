import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { guardarRegion, saveTown } from '../firebase';
import { Zap, Rocket, ChevronLeft } from 'lucide-react';
import { playNeonClick } from '../utils/audio';

// Regiones predefinidas para inyectar
const SEED_REGIONS = [
    {
        id: 'buenos-aires-sur',
        name: 'Buenos Aires Sur',
        provinceId: 'buenos-aires',
        type: 'zona' as const,
        towns: ['esteban-echeverria', 'ezeiza', 'lomas-de-zamora'],
        icon: 'building',
        color: '#22d3ee', // cian
        isActive: true,
        createdAt: new Date().toISOString()
    },
    {
        id: 'traslasierra',
        name: 'Valle de Traslasierra',
        provinceId: 'cordoba',
        type: 'region' as const,
        towns: ['mina-clavero', 'nono', 'cura-brochero', 'panaholma', 'villa-las-rosas', 'san-javier', 'villa-dolores', 'las-rabonas'],
        icon: 'mountain',
        color: '#a855f7', // violeta
        isActive: true,
        createdAt: new Date().toISOString()
    }
];

const SEED_TOWNS = [
    { id: 'esteban-echeverria', name: 'Esteban Echeverría', localities: ['Monte Grande', 'Luis Guillón', 'El Jagüel'], description: 'Zona Madre — Origen de ShopDigital', isActive: true, createdAt: new Date().toISOString() },
    { id: 'ezeiza', name: 'Ezeiza', localities: ['Ezeiza', 'La Unión', 'Tristán Suárez', 'Spegazzini'], description: 'Zona Sur — Puerta de entrada internacional', isActive: true, createdAt: new Date().toISOString() },
    { id: 'lomas-de-zamora', name: 'Lomas de Zamora', localities: ['Lomas de Zamora', 'Banfield', 'Temperley'], description: 'Zona Sur — Núcleo comercial', isActive: true, createdAt: new Date().toISOString() },
    { id: 'mina-clavero', name: 'Mina Clavero', localities: ['Mina Clavero'], description: 'Traslasierra — Corazón turístico', isActive: true, createdAt: new Date().toISOString() },
    { id: 'nono', name: 'Nono', localities: ['Nono'], description: 'Traslasierra — Alta gama artesanal', isActive: true, createdAt: new Date().toISOString() },
    { id: 'cura-brochero', name: 'Cura Brochero', localities: ['Villa Cura Brochero'], description: 'Traslasierra — Capital espiritual', isActive: true, createdAt: new Date().toISOString() },
    { id: 'panaholma', name: 'Panaholma', localities: ['Panaholma'], description: 'Traslasierra — Valle serrano', isActive: true, createdAt: new Date().toISOString() },
    { id: 'villa-las-rosas', name: 'Villa Las Rosas', localities: ['Villa Las Rosas'], description: 'Traslasierra — Eco-gastronomía', isActive: true, createdAt: new Date().toISOString() },
    { id: 'san-javier', name: 'San Javier', localities: ['San Javier'], description: 'Traslasierra — Sierra y tradición', isActive: true, createdAt: new Date().toISOString() },
    { id: 'villa-dolores', name: 'Villa Dolores', localities: ['Villa Dolores'], description: 'Traslasierra — Capital del Valle', isActive: true, createdAt: new Date().toISOString() },
    { id: 'las-rabonas', name: 'Las Rabonas', localities: ['Las Rabonas'], description: 'Traslasierra — Cabañas y tranquilidad', isActive: true, createdAt: new Date().toISOString() },
];

const RegionSeedPage: React.FC = () => {
    const navigate = useNavigate();
    const { townId = 'esteban-echeverria' } = useParams<{ townId: string }>();
    const [status, setStatus] = useState<'idle' | 'seeding' | 'done' | 'error'>('idle');
    const [log, setLog] = useState<string[]>([]);

    const addLog = (msg: string) => setLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

    const handleSeed = async () => {
        playNeonClick();
        setStatus('seeding');
        setLog([]);

        try {
            // 1. Inyectar regiones
            for (const region of SEED_REGIONS) {
                addLog(`🌐 Forjando región: ${region.name}...`);
                await guardarRegion(region);
                addLog(`✅ Región ${region.name} forjada.`);
            }

            // 2. Inyectar towns
            for (const town of SEED_TOWNS) {
                addLog(`📍 Registrando localidad: ${town.name}...`);
                await saveTown(town);
                addLog(`✅ Localidad ${town.name} registrada.`);
            }

            addLog('🏆 ¡INYECCIÓN COMPLETA! El Hormiguero está poblado.');
            setStatus('done');
        } catch (error: any) {
            addLog(`❌ ERROR: ${error.message}`);
            setStatus('error');
        }
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans p-6">
            <div className="max-w-lg mx-auto">
                <button onClick={() => { playNeonClick(); navigate(`/${townId}/tablero-maestro`); }}
                    className="mb-6 text-xs text-white/30 flex items-center gap-1 hover:text-white/50 transition-colors">
                    <ChevronLeft size={14} /> Volver al Tablero
                </button>

                <h1 className="text-xl font-black uppercase tracking-widest text-cyan-400 mb-2">
                    🌱 Semillero Regional
                </h1>
                <p className="text-[10px] text-white/40 uppercase tracking-widest mb-8">
                    Inyecta las regiones y localidades iniciales al Hormiguero
                </p>

                {status === 'idle' && (
                    <div className="space-y-6">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-cyan-400 mb-3">Se van a crear:</h3>
                            {SEED_REGIONS.map(r => (
                                <div key={r.id} className="flex items-center gap-2 mb-2">
                                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: r.color }} />
                                    <span className="text-xs font-bold">{r.name}</span>
                                    <span className="text-[8px] text-white/30">({r.towns.length} localidades)</span>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={handleSeed}
                            className="w-full py-4 bg-cyan-500 text-black font-black uppercase tracking-widest rounded-2xl text-sm active:scale-95 transition-all flex items-center justify-center gap-2"
                            style={{ boxShadow: '0 0 30px rgba(0,251,255,0.3)' }}
                        >
                            <Rocket size={18} /> Inyectar Datos Iniciales
                        </button>
                    </div>
                )}

                {status !== 'idle' && (
                    <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-5 font-mono text-[10px] space-y-1 max-h-[60vh] overflow-y-auto">
                        {log.map((line, i) => (
                            <p key={i} className={line.includes('❌') ? 'text-red-400' : line.includes('✅') ? 'text-green-400' : line.includes('🏆') ? 'text-cyan-400 font-bold' : 'text-white/50'}>
                                {line}
                            </p>
                        ))}
                        {status === 'seeding' && (
                            <p className="text-yellow-400 animate-pulse">⏳ Procesando...</p>
                        )}
                    </div>
                )}

                {status === 'done' && (
                    <button
                        onClick={() => { playNeonClick(); navigate('/'); }}
                        className="mt-6 w-full py-4 bg-green-500/20 border border-green-500/30 text-green-400 font-black uppercase tracking-widest rounded-2xl text-xs active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        <Zap size={16} /> Ir al Comando Central
                    </button>
                )}
            </div>
        </div>
    );
};

export default RegionSeedPage;
