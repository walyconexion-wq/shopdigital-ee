import React, { useState, useEffect } from 'react';
import { 
    TrendingUp, BarChart3, Target, MapPin, 
    Zap, AlertTriangle, CheckCircle, 
    ArrowUpRight, Users, Store, Ghost
} from 'lucide-react';
import { db } from '../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { playNeonClick } from '../utils/audio';

interface LocalitySaturation {
    name: string;
    alliesCount: number;
    ghostsCount: number;
    saturation: number; // 0 to 100
    opportunityScore: number; // 0 to 100
    status: 'hot' | 'balanced' | 'cold';
}

interface SaturationPredictorProps {
    townId: string;
    category: string;
}

export const SaturationPredictor: React.FC<SaturationPredictorProps> = ({ townId, category }) => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<LocalitySaturation[]>([]);

    useEffect(() => {
        const analyzeSaturation = async () => {
            setLoading(true);
            try {
                // 1. Obtener datos de la zona para saber las localidades
                const townsSnap = await getDocs(collection(db, "towns"));
                const town = townsSnap.docs.find(d => d.id === townId)?.data();
                const localities: string[] = town?.localities || ['Centro', 'Norte', 'Sur', 'Oeste', 'Este'];

                // 2. Obtener aliados reales en Firestore
                const alliesQuery = query(
                    collection(db, "comercios"), 
                    where("townId", "==", townId),
                    where("category", "==", category)
                );
                const alliesSnap = await getDocs(alliesQuery);
                const allies = alliesSnap.docs.map(d => d.data());

                // 3. Simular conteo de Fantasmas por localidad (Mock robusto)
                // En el futuro esto vendría de una tabla de escaneos guardados
                const saturationData: LocalitySaturation[] = localities.map(loc => {
                    const locAllies = allies.filter(a => (a.zone || '').includes(loc)).length;
                    
                    // Simulación determinística basada en el nombre de la localidad
                    const seed = loc.length + (townId.length % 5);
                    const locGhosts = Math.max(0, Math.floor((seed * 7) % 15) + (locAllies === 0 ? 3 : -1));
                    
                    const total = locAllies + locGhosts;
                    const saturation = total > 0 ? (locAllies / total) * 100 : 0;
                    
                    // Opportunity Score: Muchos fantasmas + pocos aliados = Score Alto
                    const opportunityScore = total > 0 
                        ? Math.min(100, (locGhosts * 15) - (locAllies * 10)) 
                        : 0;

                    return {
                        name: loc,
                        alliesCount: locAllies,
                        ghostsCount: locGhosts,
                        saturation: Math.round(saturation),
                        opportunityScore: Math.max(0, Math.round(opportunityScore)),
                        status: opportunityScore > 60 ? 'hot' : (opportunityScore > 30 ? 'balanced' : 'cold')
                    };
                });

                // Ordenar por oportunidad
                saturationData.sort((a, b) => b.opportunityScore - a.opportunityScore);
                setData(saturationData);
            } catch (error) {
                console.error("Error analyzing saturation:", error);
            } finally {
                setLoading(false);
            }
        };

        analyzeSaturation();
    }, [townId, category]);

    if (loading) {
        return (
            <div className="py-12 flex flex-col items-center justify-center gap-4">
                <div className="w-10 h-10 border-2 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
                <p className="text-[10px] text-orange-400 font-bold uppercase tracking-[0.3em] animate-pulse">Analizando Densidad de Mercado...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header / Stats */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-orange-500/5 border border-orange-500/20 rounded-2xl p-4 flex flex-col gap-1">
                    <span className="text-[8px] text-orange-400 font-black uppercase tracking-widest">Zona de Mayor Impacto</span>
                    <span className="text-[14px] font-[1000] text-white uppercase tracking-tight">{data[0]?.name || '---'}</span>
                    <div className="flex items-center gap-1 mt-1">
                        <Zap size={10} className="text-orange-400" />
                        <span className="text-[9px] text-orange-300 font-bold">Oportunidad: {data[0]?.opportunityScore}%</span>
                    </div>
                </div>
                <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-4 flex flex-col gap-1">
                    <span className="text-[8px] text-blue-400 font-black uppercase tracking-widest">Saturación Promedio</span>
                    <span className="text-[14px] font-[1000] text-white uppercase tracking-tight">
                        {Math.round(data.reduce((acc, curr) => acc + curr.saturation, 0) / data.length)}%
                    </span>
                    <div className="flex items-center gap-1 mt-1">
                        <CheckCircle size={10} className="text-blue-400" />
                        <span className="text-[9px] text-blue-300 font-bold">Mercado en Crecimiento</span>
                    </div>
                </div>
            </div>

            {/* Opportunity List */}
            <div className="space-y-3">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-2 mb-4">
                    <Target size={14} className="text-orange-500" /> Mapa de Saturación por Localidad
                </h4>
                
                {data.map((loc) => (
                    <div 
                        key={loc.name}
                        className={`p-4 rounded-2xl border transition-all relative overflow-hidden group ${
                            loc.status === 'hot' 
                            ? 'bg-orange-500/10 border-orange-500/30 shadow-[0_0_20px_rgba(249,115,22,0.05)]' 
                            : 'bg-white/[0.02] border-white/5'
                        }`}
                    >
                        {/* Status Badge */}
                        <div className="absolute top-0 right-0 px-3 py-1 bg-white/5 rounded-bl-xl border-l border-b border-white/5">
                            <span className={`text-[7px] font-black uppercase tracking-widest ${
                                loc.status === 'hot' ? 'text-orange-400' : (loc.status === 'balanced' ? 'text-blue-400' : 'text-white/30')
                            }`}>
                                {loc.status === 'hot' ? '🔥 Alta Prioridad' : (loc.status === 'balanced' ? '⚖️ Balanceado' : '❄️ Frío')}
                            </span>
                        </div>

                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                    loc.status === 'hot' ? 'bg-orange-500/20 text-orange-400' : 'bg-white/5 text-white/40'
                                }`}>
                                    <MapPin size={20} />
                                </div>
                                <div>
                                    <h5 className="text-[13px] font-black text-white uppercase tracking-wider">{loc.name}</h5>
                                    <div className="flex items-center gap-3 mt-0.5">
                                        <div className="flex items-center gap-1 text-[8px] text-white/40 font-bold uppercase tracking-widest">
                                            <Store size={10} className="text-blue-400" /> {loc.alliesCount} Aliados
                                        </div>
                                        <div className="flex items-center gap-1 text-[8px] text-white/40 font-bold uppercase tracking-widest">
                                            <Ghost size={10} className="text-red-400" /> {loc.ghostsCount} Fantasmas
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="flex items-center gap-1 justify-end">
                                    <TrendingUp size={12} className={loc.opportunityScore > 50 ? 'text-green-400' : 'text-white/20'} />
                                    <span className="text-[16px] font-[1000] text-white">{loc.opportunityScore}%</span>
                                </div>
                                <p className="text-[7px] font-black text-white/40 uppercase tracking-widest">Score Oportunidad</p>
                            </div>
                        </div>

                        {/* Progress Bar (Saturation) */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-widest">
                                <span className="text-white/40">Saturación del Sistema</span>
                                <span className={loc.saturation > 70 ? 'text-blue-400' : 'text-white/60'}>{loc.saturation}%</span>
                            </div>
                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                                <div 
                                    className={`h-full transition-all duration-1000 ${
                                        loc.saturation > 70 ? 'bg-blue-500' : (loc.saturation > 30 ? 'bg-indigo-500' : 'bg-zinc-700')
                                    }`}
                                    style={{ width: `${loc.saturation}%` }}
                                />
                            </div>
                        </div>

                        {/* Insight Overlay on Hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/90 to-orange-800/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                            <div className="flex flex-col items-center gap-2">
                                <Target size={24} className="text-white animate-bounce" />
                                <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Desplegar Dobermans aquí</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* AI Summary */}
            <div className="bg-black/40 border border-white/10 rounded-2xl p-5 border-l-4 border-l-orange-500">
                <div className="flex items-center gap-3 mb-2">
                    <BarChart3 size={16} className="text-orange-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-orange-400">Predicción Estratégica</span>
                </div>
                <p className="text-[11px] text-white/60 leading-relaxed">
                    "Director, el análisis de saturación indica que la localidad de <span className="text-white font-bold">{data[0]?.name}</span> es el 'punto de entrada' óptimo para {category}. Tenemos una penetración de apenas el <span className="text-orange-400 font-bold">{data[0]?.saturation}%</span>, lo que significa que el 90% del mercado local sigue operando fuera del Hormiguero. Recomiendo iniciar el barrido 'El Persuader' inmediatamente en esta zona."
                </p>
            </div>
        </div>
    );
};
