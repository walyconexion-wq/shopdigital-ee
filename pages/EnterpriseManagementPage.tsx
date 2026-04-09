import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Shop } from '../types';
import { ENTERPRISE_CATEGORIES } from '../enterpriseConstants';
import { guardarComercio, eliminarComercio } from '../firebase';
import {
    ChevronLeft,
    Factory,
    Trash2,
    PauseCircle,
    PlayCircle,
    Phone,
    MapPin,
    Image as ImageIcon,
    ArrowLeft,
    Edit3,
    Globe,
    Landmark,
    Plus
} from 'lucide-react';
import { playNeonClick, playSuccessSound } from '../utils/audio';

interface EnterpriseManagementPageProps {
    allShops: Shop[];
}

const EnterpriseManagementPage: React.FC<EnterpriseManagementPageProps> = ({ allShops }) => {
    const { townId = 'esteban-echeverria' } = useParams<{ townId: string }>();
    const navigate = useNavigate();
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [reachFilter, setReachFilter] = useState<string>('all');

    // Filtrar solo empresas
    const allEnterprises = useMemo(() =>
        allShops.filter(s => s.entityType === 'enterprise'),
    [allShops]);

    const selectedCategory = ENTERPRISE_CATEGORIES.find(c => c.id === selectedCategoryId);

    // Contar empresas por categoría industrial
    const countByCategory = useMemo(() => {
        const counts: Record<string, number> = {};
        ENTERPRISE_CATEGORIES.forEach(cat => {
            counts[cat.id] = allEnterprises.filter(s =>
                s.category === cat.id || s.category === cat.slug
            ).length;
        });
        return counts;
    }, [allEnterprises]);

    // Filtrar por categoría y alcance
    const filteredEnterprises = useMemo(() => {
        if (!selectedCategoryId) return [];
        return allEnterprises.filter(ent => {
            const catMatch = ent.category === selectedCategoryId || ent.category === selectedCategory?.slug;
            const reachMatch = reachFilter === 'all' || ent.reach === reachFilter;
            return catMatch && reachMatch;
        });
    }, [selectedCategoryId, allEnterprises, reachFilter, selectedCategory]);

    const handleDelete = async (enterprise: Shop) => {
        playNeonClick();
        if (window.confirm(`⚠️ ¿ELIMINAR "${enterprise.name}" definitivamente?\n\nEsta acción borra la tarjeta y el catálogo. No se puede deshacer.`)) {
            setProcessingId(enterprise.id);
            try {
                await eliminarComercio(enterprise.id);
                playSuccessSound();
            } catch (error) {
                console.error("Error al eliminar:", error);
                alert("Error al eliminar la empresa.");
            } finally {
                setProcessingId(null);
            }
        }
    };

    const handleSuspend = async (enterprise: Shop) => {
        playNeonClick();
        if (window.confirm(`⏸️ ¿SUSPENDER "${enterprise.name}"?\n\nLa tarjeta se ocultará del Directorio Industrial.`)) {
            setProcessingId(enterprise.id);
            try {
                await guardarComercio({ ...enterprise, isActive: false }, townId);
                playSuccessSound();
            } catch (error) {
                console.error("Error al suspender:", error);
            } finally {
                setProcessingId(null);
            }
        }
    };

    const handleActivate = async (enterprise: Shop) => {
        playNeonClick();
        if (window.confirm(`✅ ¿ACTIVAR "${enterprise.name}"?\n\nSu tarjeta será visible en el Directorio Industrial.`)) {
            setProcessingId(enterprise.id);
            try {
                await guardarComercio({ ...enterprise, isActive: true }, townId);
                playSuccessSound();
            } catch (error) {
                console.error("Error al activar:", error);
            } finally {
                setProcessingId(null);
            }
        }
    };

    // =========================================================
    // VIEW 1: Grilla de Rubros Industriales
    // =========================================================
    if (!selectedCategoryId) {
        return (
            <div className="min-h-screen bg-black text-white pb-24 relative overflow-x-hidden selection:bg-amber-500/30">
                <div className="fixed inset-0 pointer-events-none z-0">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(245,158,11,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(245,158,11,0.02)_1px,transparent_1px)] bg-[size:30px_30px]" />
                </div>

                <div className="bg-zinc-900/50 backdrop-blur-md pt-8 pb-6 px-6 flex flex-col items-center border-b border-amber-500/20 mb-6 sticky top-0 z-50">
                    <button onClick={() => { playNeonClick(); navigate(`/${townId}/embajador`); }}
                        className="self-start mb-4 w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-400/30 hover:bg-amber-500/20 transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                        <ChevronLeft size={20} />
                    </button>
                    <div className="flex items-center gap-2 mb-1">
                        <Factory size={18} className="text-amber-400" />
                        <h2 className="text-[16px] font-black text-white uppercase tracking-[0.2em] drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]">
                            Gestión de Empresas
                        </h2>
                    </div>
                    <p className="text-[9px] font-black text-amber-400/80 uppercase tracking-widest text-center mt-2 px-4 italic">
                        Nodo Empresarial B2B · {allEnterprises.length} asociadas
                    </p>
                    <button
                        onClick={() => { playNeonClick(); navigate(`/${townId}/embajador/empresas/nueva`); }}
                        className="mt-4 w-full max-w-xs bg-amber-500 text-black py-3 rounded-xl flex items-center justify-center gap-2 font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)]"
                    >
                        <Plus size={16} /> Alta de Nueva Empresa
                    </button>
                </div>

                <div className="px-5 grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-lg mx-auto relative z-10">
                    {ENTERPRISE_CATEGORIES.map(cat => {
                        const count = countByCategory[cat.id] || 0;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => { playNeonClick(); setSelectedCategoryId(cat.id); }}
                                className="glass-card-3d bg-white/[0.03] border border-white/10 hover:border-amber-500/40 rounded-2xl p-4 flex flex-col items-center gap-2 transition-all active:scale-95 group relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-full blur-[20px] pointer-events-none" />
                                <div className="text-amber-400 group-hover:scale-110 transition-transform">
                                    {cat.icon}
                                </div>
                                <span className="text-[7px] font-black uppercase tracking-widest text-white/70 text-center leading-tight">
                                    {cat.name}
                                </span>
                                {count > 0 && (
                                    <span className="absolute top-2 right-2 bg-amber-500/20 border border-amber-400/30 text-amber-300 text-[7px] font-black px-1.5 py-0.5 rounded-full">
                                        {count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    }

    // =========================================================
    // VIEW 2: Tarjetas de Empresa con Controles
    // =========================================================
    return (
        <div className="min-h-screen bg-black text-white pb-24 relative overflow-x-hidden selection:bg-amber-500/30">
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(245,158,11,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(245,158,11,0.02)_1px,transparent_1px)] bg-[size:30px_30px]" />
            </div>

            <div className="bg-zinc-900/50 backdrop-blur-md pt-8 pb-4 px-6 flex flex-col items-center border-b border-amber-500/20 mb-4 sticky top-0 z-50">
                <button onClick={() => { playNeonClick(); setSelectedCategoryId(null); }}
                    className="self-start mb-3 w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-400/30 hover:bg-amber-500/20 transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                    <ArrowLeft size={20} />
                </button>
                <div className="flex items-center gap-2 mb-1">
                    <Factory size={18} className="text-amber-400" />
                    <h2 className="text-[15px] font-black text-white uppercase tracking-[0.15em] drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]">
                        {selectedCategory?.name || 'Rubro'}
                    </h2>
                </div>
                <p className="text-[8px] font-bold text-amber-400/60 uppercase tracking-widest text-center mt-1 italic">
                    Gestión Industrial B2B
                </p>
            </div>

            {/* Filtros de Alcance */}
            <div className="flex justify-center gap-3 px-5 mb-6 relative z-10">
                {[
                    { id: 'all', label: 'Todos', icon: <Globe size={12} /> },
                    { id: 'national', label: 'Nacional', icon: <Globe size={12} /> },
                    { id: 'regional', label: 'Regional', icon: <Landmark size={12} /> },
                ].map(f => (
                    <button
                        key={f.id}
                        onClick={() => { playNeonClick(); setReachFilter(f.id); }}
                        className={`px-4 py-2.5 rounded-xl font-black uppercase tracking-widest text-[8px] border transition-all duration-300 flex items-center gap-1.5
                            ${reachFilter === f.id
                                ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.4)] scale-105'
                                : 'bg-white/[0.03] border-white/10 text-white/40 hover:text-white/60'
                            }`}
                    >
                        {f.icon} {f.label}
                    </button>
                ))}
            </div>

            <div className="px-5 space-y-4 relative z-10 max-w-lg mx-auto">
                {filteredEnterprises.length === 0 ? (
                    <div className="glass-card-3d bg-white/[0.02] border border-amber-500/20 rounded-3xl p-10 flex flex-col items-center justify-center gap-3 text-center">
                        <Factory size={24} className="text-amber-400/30" />
                        <p className="text-[10px] text-white/40 uppercase tracking-widest leading-relaxed">
                            No hay empresas de {selectedCategory?.name} registradas
                        </p>
                        <button
                            onClick={() => { playNeonClick(); navigate(`/${townId}/embajador/empresas/nueva`); }}
                            className="mt-2 bg-amber-500 text-black py-2.5 px-6 rounded-xl font-black uppercase tracking-widest text-[9px] active:scale-95 transition-all"
                        >
                            <Plus size={14} className="inline mr-1" /> Crear Primera Empresa
                        </button>
                    </div>
                ) : (
                    filteredEnterprises.map(enterprise => {
                        const isActive = enterprise.isActive === true;
                        return (
                            <div key={enterprise.id} className={`glass-card-3d bg-white/[0.02] border rounded-3xl p-5 overflow-hidden relative transition-all ${isActive ? 'border-amber-500/30' : 'border-red-500/30 opacity-80'}`}>
                                {/* Status + Reach Badges */}
                                <div className="absolute top-3 right-3 flex gap-1.5">
                                    <span className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest ${enterprise.reach === 'national' ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30' : 'bg-white/10 text-white/50 border border-white/20'}`}>
                                        {enterprise.reach === 'national' ? '🌎 Nacional' : '📍 Regional'}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest ${isActive ? 'bg-green-500/20 text-green-300 border border-green-400/30' : 'bg-red-500/20 text-red-300 border border-red-400/30'}`}>
                                        {isActive ? '● Activa' : '● Suspendida'}
                                    </span>
                                </div>

                                {/* Info */}
                                <div className="flex items-start gap-4 mb-4 mt-1">
                                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-black/40 border border-amber-500/20 flex-shrink-0 flex items-center justify-center">
                                        {enterprise.bannerImage ? (
                                            <img src={enterprise.bannerImage} alt={enterprise.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <ImageIcon size={18} className="text-white/20" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-[1000] text-white uppercase tracking-tighter leading-tight truncate">
                                            {enterprise.name}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                                            <span className="text-[8px] font-bold text-amber-400 uppercase tracking-widest bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                                                {selectedCategory?.name}
                                            </span>
                                        </div>
                                        {enterprise.zone && (
                                            <p className="text-[9px] text-white/50 mt-1 flex items-center gap-1">
                                                <MapPin size={9} className="text-amber-400" /> {enterprise.zone}
                                            </p>
                                        )}
                                        {enterprise.phone && (
                                            <p className="text-[9px] text-white/50 mt-0.5 flex items-center gap-1">
                                                <Phone size={9} className="text-green-400" /> {enterprise.phone}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Botones de Control */}
                                <div className="flex gap-2 pt-2 border-t border-white/5">
                                    <button
                                        onClick={() => { playNeonClick(); navigate(`/${townId}/embajador/empresas/editar/${enterprise.id}`); }}
                                        className="flex-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 py-3 rounded-xl flex items-center justify-center gap-1.5 font-black uppercase tracking-widest text-[8px] active:scale-95 transition-all hover:bg-amber-500/20"
                                    >
                                        <Edit3 size={14} /> Editar
                                    </button>
                                    <button
                                        disabled={processingId === enterprise.id}
                                        onClick={() => handleDelete(enterprise)}
                                        className="flex-1 bg-red-500/10 border border-red-500/30 text-red-400 py-3 rounded-xl flex items-center justify-center gap-1.5 font-black uppercase tracking-widest text-[8px] active:scale-95 transition-all hover:bg-red-500/20 disabled:opacity-50"
                                    >
                                        <Trash2 size={14} /> Eliminar
                                    </button>
                                    <button
                                        disabled={processingId === enterprise.id || !isActive}
                                        onClick={() => handleSuspend(enterprise)}
                                        className={`flex-1 border py-3 rounded-xl flex items-center justify-center gap-1.5 font-black uppercase tracking-widest text-[8px] active:scale-95 transition-all disabled:opacity-30 ${isActive ? 'bg-orange-500/10 border-orange-500/30 text-orange-400 hover:bg-orange-500/20' : 'bg-white/5 border-white/10 text-white/30'}`}
                                    >
                                        <PauseCircle size={14} /> Suspender
                                    </button>
                                    <button
                                        disabled={processingId === enterprise.id || isActive}
                                        onClick={() => handleActivate(enterprise)}
                                        className={`flex-1 border py-3 rounded-xl flex items-center justify-center gap-1.5 font-black uppercase tracking-widest text-[8px] active:scale-95 transition-all disabled:opacity-30 ${!isActive ? 'bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20' : 'bg-white/5 border-white/10 text-white/30'}`}
                                    >
                                        <PlayCircle size={14} /> Activar
                                    </button>
                                </div>

                                {processingId === enterprise.id && (
                                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center rounded-3xl">
                                        <div className="w-6 h-6 border-2 border-amber-400/20 border-t-amber-400 rounded-full animate-spin" />
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default EnterpriseManagementPage;
