import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Shop } from '../types';
import { CATEGORIES } from '../constants';
import { guardarComercio, eliminarComercio } from '../firebase';
import { useTownLocalities } from '../hooks/useTownLocalities';
import {
    ChevronLeft,
    ShieldCheck,
    Trash2,
    PauseCircle,
    PlayCircle,
    Store,
    Phone,
    MapPin,
    Image as ImageIcon,
    ArrowLeft,
    Edit3
} from 'lucide-react';
import { playNeonClick, playSuccessSound } from '../utils/audio';

// Las localidades se cargan dinámicamente desde Firebase (ver useTownLocalities)

interface ShopManagementPageProps {
    allShops: Shop[];
}

const ShopManagementPage: React.FC<ShopManagementPageProps> = ({ allShops }) => {
    const { townId = 'esteban-echeverria' } = useParams<{ townId: string }>();
    const navigate = useNavigate();
    const { localities } = useTownLocalities(townId);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
    const [activeLocation, setActiveLocation] = useState('');
    const [processingId, setProcessingId] = useState<string | null>(null);

    // Setear primera localidad como activa cuando carguen
    React.useEffect(() => {
        if (localities.length > 0 && !activeLocation) {
            setActiveLocation(localities[0]);
        }
    }, [localities]);

    const selectedCategory = CATEGORIES.find(c => c.id === selectedCategoryId);

    // Filter shops by selected category and location
    const filteredShops = useMemo(() => {
        if (!selectedCategoryId) return [];
        const normalize = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
        const normalizedLoc = normalize(activeLocation);
        
        return allShops.filter(shop =>
            shop &&
            shop.category === selectedCategoryId &&
            ((shop.zone === activeLocation) || (shop.address && normalize(shop.address || "").includes(normalizedLoc)))
        );
    }, [selectedCategoryId, activeLocation, allShops]);

    // Count shops per category (all locations)
    const shopCountByCategory = useMemo(() => {
        const counts: Record<string, number> = {};
        CATEGORIES.forEach(cat => {
            counts[cat.id] = allShops.filter(s => s.category === cat.id).length;
        });
        return counts;
    }, [allShops]);

    const handleDelete = async (shop: Shop) => {
        playNeonClick();
        if (window.confirm(`⚠️ ¿ELIMINAR "${shop.name}" definitivamente?\n\nEsta acción borra la tarjeta, el catálogo y la credencial. No se puede deshacer.`)) {
            setProcessingId(shop.id);
            try {
                await eliminarComercio(shop.id);
                playSuccessSound();
            } catch (error) {
                console.error("Error al eliminar:", error);
                alert("Error al eliminar el comercio.");
            } finally {
                setProcessingId(null);
            }
        }
    };

    const handleSuspend = async (shop: Shop) => {
        playNeonClick();
        if (window.confirm(`⏸️ ¿SUSPENDER "${shop.name}"?\n\nLa tarjeta se ocultará de la interfaz pública pero se mantiene en la base de datos.`)) {
            setProcessingId(shop.id);
            try {
                await guardarComercio({ ...shop, isActive: false });
                playSuccessSound();
            } catch (error) {
                console.error("Error al suspender:", error);
                alert("Error al suspender el comercio.");
            } finally {
                setProcessingId(null);
            }
        }
    };

    const handleActivate = async (shop: Shop) => {
        playNeonClick();
        if (window.confirm(`✅ ¿ACTIVAR "${shop.name}"?\n\nLa tarjeta será visible para todos los usuarios en la interfaz.`)) {
            setProcessingId(shop.id);
            try {
                await guardarComercio({ ...shop, isActive: true });
                playSuccessSound();
            } catch (error) {
                console.error("Error al activar:", error);
                alert("Error al activar el comercio.");
            } finally {
                setProcessingId(null);
            }
        }
    };

    // =========================================================
    // VIEW 1: Category Selection Grid
    // =========================================================
    if (!selectedCategoryId) {
        return (
            <div className="min-h-screen bg-black text-white pb-24 relative overflow-x-hidden selection:bg-cyan-500/30">
                {/* HUD Background */}
                <div className="fixed inset-0 pointer-events-none z-0">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.02)_1px,transparent_1px)] bg-[size:30px_30px]" />
                </div>

                {/* Header */}
                <div className="bg-zinc-900/50 backdrop-blur-md pt-8 pb-6 px-6 flex flex-col items-center border-b border-yellow-500/20 mb-6 sticky top-0 z-50">
                    <button onClick={() => { playNeonClick(); navigate('/embajador'); }} 
                        className="self-start mb-4 w-10 h-10 rounded-2xl bg-yellow-500/10 flex items-center justify-center text-yellow-400 border border-yellow-400/30 hover:bg-yellow-500/20 transition-all shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                        <ChevronLeft size={20} />
                    </button>
                    <div className="flex items-center gap-2 mb-1">
                        <ShieldCheck size={18} className="text-yellow-400" />
                        <h2 className="text-[16px] font-black text-white uppercase tracking-[0.2em] drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]">
                            Gestión de Comercios
                        </h2>
                    </div>
                    <p className="text-[9px] font-bold text-yellow-400/80 uppercase tracking-widest text-center mt-2 px-4">
                        Seleccioná un rubro para administrar
                    </p>
                </div>

                {/* Category Grid */}
                <div className="px-5 grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-lg mx-auto relative z-10">
                    {CATEGORIES.map(cat => {
                        const count = shopCountByCategory[cat.id] || 0;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => { playNeonClick(); setSelectedCategoryId(cat.id); }}
                                className="glass-card-3d bg-white/[0.03] border border-white/10 hover:border-yellow-500/40 rounded-2xl p-4 flex flex-col items-center gap-2 transition-all active:scale-95 group relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-500/5 rounded-full blur-[20px] pointer-events-none" />
                                <div className="text-yellow-400 group-hover:scale-110 transition-transform">
                                    {cat.icon}
                                </div>
                                <span className="text-[8px] font-black uppercase tracking-widest text-white/70 text-center leading-tight">
                                    {cat.name}
                                </span>
                                {count > 0 && (
                                    <span className="absolute top-2 right-2 bg-yellow-500/20 border border-yellow-400/30 text-yellow-300 text-[7px] font-black px-1.5 py-0.5 rounded-full">
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
    // VIEW 2: Location Tabs + Shop Cards with Controls
    // =========================================================
    // Paleta cíclica por índice (no por nombre hardcodeado)
    const CYCLIC_COLORS = [
        { border: 'border-cyan-400',   bg: 'bg-cyan-500/20',   text: 'text-cyan-300',   shadow: 'shadow-[0_0_20px_rgba(34,211,238,0.4)]'  },
        { border: 'border-violet-400', bg: 'bg-violet-500/20', text: 'text-violet-300', shadow: 'shadow-[0_0_20px_rgba(139,92,246,0.4)]'  },
        { border: 'border-rose-400',   bg: 'bg-rose-500/20',   text: 'text-rose-300',   shadow: 'shadow-[0_0_20px_rgba(244,63,94,0.4)]'   },
        { border: 'border-green-400',  bg: 'bg-green-500/20',  text: 'text-green-300',  shadow: 'shadow-[0_0_20px_rgba(34,197,94,0.4)]'   },
        { border: 'border-amber-400',  bg: 'bg-amber-500/20',  text: 'text-amber-300',  shadow: 'shadow-[0_0_20px_rgba(245,158,11,0.4)]'  },
    ];

    return (
        <div className="min-h-screen bg-black text-white pb-24 relative overflow-x-hidden selection:bg-cyan-500/30">
            {/* HUD Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-yellow-500/5 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(234,179,8,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(234,179,8,0.02)_1px,transparent_1px)] bg-[size:30px_30px]" />
            </div>

            {/* Header */}
            <div className="bg-zinc-900/50 backdrop-blur-md pt-8 pb-4 px-6 flex flex-col items-center border-b border-yellow-500/20 mb-4 sticky top-0 z-50">
                <button onClick={() => { playNeonClick(); setSelectedCategoryId(null); }}
                    className="self-start mb-3 w-10 h-10 rounded-2xl bg-yellow-500/10 flex items-center justify-center text-yellow-400 border border-yellow-400/30 hover:bg-yellow-500/20 transition-all shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                    <ArrowLeft size={20} />
                </button>
                <div className="flex items-center gap-2 mb-1">
                    <Store size={18} className="text-yellow-400" />
                    <h2 className="text-[15px] font-black text-white uppercase tracking-[0.15em] drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]">
                        {selectedCategory?.name || 'Rubro'}
                    </h2>
                </div>
                <p className="text-[8px] font-bold text-yellow-400/60 uppercase tracking-widest text-center mt-1">
                    Panel de gestión · Eliminar · Suspender · Activar
                </p>
            </div>

            {/* Location Tabs — dinámicas por zona */}
            <div className="flex justify-center gap-3 px-5 mb-6 relative z-10 overflow-x-auto no-scrollbar">
                {localities.map((loc, idx) => {
                    const isActive = activeLocation === loc;
                    const colors = CYCLIC_COLORS[idx % CYCLIC_COLORS.length];
                    return (
                        <button
                            key={loc}
                            onClick={() => { playNeonClick(); setActiveLocation(loc); }}
                            className={`px-4 py-2.5 rounded-xl font-black uppercase tracking-widest text-[8px] border transition-all duration-300 whitespace-nowrap
                                ${isActive
                                    ? `${colors.bg} ${colors.border} ${colors.text} ${colors.shadow} scale-110`
                                    : `bg-white/[0.03] border-white/10 text-white/40 hover:text-white/60 hover:border-white/20`
                                }`}
                        >
                            {loc}
                        </button>
                    );
                })}
            </div>

            {/* Shop Cards */}
            <div className="px-5 space-y-4 relative z-10 max-w-lg mx-auto">
                {filteredShops.length === 0 ? (
                    <div className="glass-card-3d bg-white/[0.02] border border-yellow-500/20 rounded-3xl p-10 flex flex-col items-center justify-center gap-3 text-center">
                        <Store size={24} className="text-yellow-400/30" />
                        <p className="text-[10px] text-white/40 uppercase tracking-widest leading-relaxed">
                            No hay comercios de {selectedCategory?.name} en {activeLocation}
                        </p>
                    </div>
                ) : (
                    filteredShops.map(shop => {
                        const isShopActive = shop.isActive === true;
                        return (
                            <div key={shop.id} className={`glass-card-3d bg-white/[0.02] border rounded-3xl p-5 overflow-hidden relative transition-all ${isShopActive ? 'border-green-500/30' : 'border-red-500/30 opacity-80'}`}>
                                {/* Status Badge */}
                                <div className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest ${isShopActive ? 'bg-green-500/20 text-green-300 border border-green-400/30' : 'bg-red-500/20 text-red-300 border border-red-400/30'}`}>
                                    {isShopActive ? '● Activo' : '● Suspendido'}
                                </div>

                                {/* Shop Info */}
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-black/40 border border-white/10 flex-shrink-0 flex items-center justify-center">
                                        {shop.bannerImage ? (
                                            <img src={shop.bannerImage} alt={shop.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <ImageIcon size={18} className="text-white/20" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-[1000] text-white uppercase tracking-tighter leading-tight truncate">
                                            {shop.name}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                                            <span className="text-[8px] font-bold text-yellow-400 uppercase tracking-widest bg-yellow-500/10 px-2 py-0.5 rounded-full border border-yellow-400/20">
                                                {selectedCategory?.name}
                                            </span>
                                            <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-1">
                                                <MapPin size={9} /> {shop.zone}
                                            </span>
                                        </div>
                                        {shop.address && shop.address !== shop.zone && (
                                            <p className="text-[9px] text-white/50 mt-1 truncate">{shop.address}</p>
                                        )}
                                        {shop.phone && (
                                            <p className="text-[9px] text-white/50 mt-0.5 flex items-center gap-1">
                                                <Phone size={9} className="text-green-400" /> {shop.phone}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2 pt-2 border-t border-white/5">
                                    {/* Edit */}
                                    <button
                                        onClick={() => {
                                            playNeonClick();
                                            navigate(`/embajador/editar/${shop.id}`);
                                        }}
                                        className="flex-1 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 py-3 rounded-xl flex items-center justify-center gap-1.5 font-black uppercase tracking-widest text-[8px] active:scale-95 transition-all hover:bg-cyan-500/20 shadow-[0_0_10px_rgba(34,211,238,0.1)]"
                                    >
                                        <Edit3 size={14} /> Editar
                                    </button>

                                    {/* Delete */}
                                    <button
                                        disabled={processingId === shop.id}
                                        onClick={() => handleDelete(shop)}
                                        className="flex-1 bg-red-500/10 border border-red-500/30 text-red-400 py-3 rounded-xl flex items-center justify-center gap-1.5 font-black uppercase tracking-widest text-[8px] active:scale-95 transition-all hover:bg-red-500/20 disabled:opacity-50"
                                    >
                                        <Trash2 size={14} /> Eliminar
                                    </button>

                                    {/* Suspend */}
                                    <button
                                        disabled={processingId === shop.id || !isShopActive}
                                        onClick={() => handleSuspend(shop)}
                                        className={`flex-1 border py-3 rounded-xl flex items-center justify-center gap-1.5 font-black uppercase tracking-widest text-[8px] active:scale-95 transition-all disabled:opacity-30 ${isShopActive ? 'bg-orange-500/10 border-orange-500/30 text-orange-400 hover:bg-orange-500/20' : 'bg-white/5 border-white/10 text-white/30'}`}
                                    >
                                        <PauseCircle size={14} /> Suspender
                                    </button>

                                    {/* Activate */}
                                    <button
                                        disabled={processingId === shop.id || isShopActive}
                                        onClick={() => handleActivate(shop)}
                                        className={`flex-1 border py-3 rounded-xl flex items-center justify-center gap-1.5 font-black uppercase tracking-widest text-[8px] active:scale-95 transition-all disabled:opacity-30 ${!isShopActive ? 'bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.2)]' : 'bg-white/5 border-white/10 text-white/30'}`}
                                    >
                                        <PlayCircle size={14} /> Activar
                                    </button>
                                </div>

                                {processingId === shop.id && (
                                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center rounded-3xl">
                                        <div className="w-6 h-6 border-2 border-yellow-400/20 border-t-yellow-400 rounded-full animate-spin" />
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

export default ShopManagementPage;
