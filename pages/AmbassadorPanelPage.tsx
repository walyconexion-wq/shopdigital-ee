import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Shop } from '../types';
import { CATEGORIES } from '../constants';
import { guardarComercio, eliminarComercio, crearFactura } from '../firebase';
import {
    ChevronLeft,
    ShieldCheck,
    Lock,
    Store,
    Phone,
    User,
    CheckCircle,
    XCircle,
    MapPin,
    Image as ImageIcon,
    MessageSquare,
    Navigation,
    Settings,
    Users,
    Tag
} from 'lucide-react';
import { playNeonClick, playSuccessSound } from '../utils/audio';

interface AmbassadorPanelPageProps {
    allShops: Shop[];
}

const AmbassadorPanelPage: React.FC<AmbassadorPanelPageProps> = ({ allShops }) => {
    const { townId = 'esteban-echeverria' } = useParams<{ townId: string }>();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [processingId, setProcessingId] = useState<string | null>(null);

    // Filtrar comercios que NO están aprobados (isActive !== true) y pertenecen a la zona
    const pendingShops = useMemo(() => {
        return allShops.filter(shop => shop.isActive !== true && shop.townId === townId);
    }, [allShops, townId]);

    const handleApprove = async (shop: Shop) => {
        playNeonClick();
        if (window.confirm(`¿Seguro que quieres APROBAR y activar comercialmente a "${shop.name}"?`)) {
            setProcessingId(shop.id);
            try {
                const updatedShop = { ...shop, isActive: true };
                await guardarComercio(updatedShop);
                
                // INYECCIÓN AUTOMÁTICA DE SUSCRIPCIÓN (Modelo Premium $10.000) 💸
                const issueDateObj = new Date();
                const periodSello = `${issueDateObj.getFullYear()}-${String(issueDateObj.getMonth() + 1).padStart(2, '0')}`;
                
                const newInvoice = {
                    shopId: shop.id,
                    shopName: shop.name,
                    townId, // Garantía de Aislamiento Zonal
                    locality: shop.zone || 'Desconocida', // Sello geográfico IA
                    period: periodSello, // Sello temporal IA
                    amount: 10000, 
                    issueDate: issueDateObj.toISOString(),
                    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                    status: 'pending',
                    concept: 'SUSCRIPCIÓN MES EN CURSO' // Coincidente con modelo visual
                };
                await crearFactura(newInvoice);
                
                playSuccessSound();
            } catch (error) {
                console.error("Error al aprobar:", error);
                alert("Hubo un error al aprobar el comercio.");
            } finally {
                setProcessingId(null);
            }
        }
    };

    const handleReject = async (shop: Shop) => {
        playNeonClick();
        if (window.confirm(`¿Seguro que quieres RECHAZAR y ELIMINAR a "${shop.name}"? Esta acción es irreversible.`)) {
            setProcessingId(shop.id);
            try {
                await eliminarComercio(shop.id);
            } catch (error) {
                console.error("Error al rechazar:", error);
                alert("Hubo un error al eliminar el comercio.");
            } finally {
                setProcessingId(null);
            }
        }
    };

    return (
        <div className="min-h-screen bg-black text-white pb-24 relative overflow-x-hidden selection:bg-cyan-500/30">
            {/* HUD Background Layers */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.02)_1px,transparent_1px)] bg-[size:30px_30px]" />
            </div>

            <div className="bg-zinc-900/50 backdrop-blur-md pt-8 pb-6 px-8 flex flex-col items-center border-b border-cyan-500/20 mb-8 sticky top-0 z-50">
                <button onClick={() => {
                    playNeonClick();
                    navigate(`/${townId}/home`);
                }} className="self-start mb-4 w-10 h-10 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-400/30 hover:bg-cyan-500/20 transition-all shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                    <ChevronLeft size={20} />
                </button>
                <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck size={18} className="text-cyan-400" />
                    <h2 className="text-[18px] font-black text-white uppercase tracking-[0.2em] drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
                        Cuartel Embajador · {townId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </h2>
                </div>
                <p className="text-[10px] font-bold text-cyan-400/80 uppercase tracking-widest text-center mt-2 px-4">
                    Comercios Pendientes: {pendingShops.length}
                </p>
                {/* Botones de Gestión */}
                <div className="mt-4 flex flex-col gap-2 w-full max-w-xs">
                    <button
                        onClick={() => { playNeonClick(); navigate(`/${townId}/embajador/gestion`); }}
                        className="w-full bg-yellow-500/15 border border-yellow-400/40 py-3 rounded-xl flex items-center justify-center gap-2 font-black uppercase tracking-widest text-[9px] text-yellow-300 active:scale-95 transition-all hover:bg-yellow-500/25 shadow-[0_0_15px_rgba(234,179,8,0.2)]"
                    >
                        <Settings size={16} />
                        Gestión de Comercios
                    </button>
                    
                    <button
                        onClick={() => { playNeonClick(); navigate(`/${townId}/embajador/clientes`); }}
                        className="w-full bg-blue-500/15 border border-blue-400/40 py-3 rounded-xl flex items-center justify-center gap-2 font-black uppercase tracking-widest text-[9px] text-blue-300 active:scale-95 transition-all hover:bg-blue-500/25 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                    >
                        <Users size={16} />
                        Gestión de Clientes
                    </button>
                    
                    <button
                        onClick={() => { playNeonClick(); navigate(`/${townId}/embajador/ofertas/b2b`); }}
                        className="w-full bg-cyan-500/15 border border-cyan-400/40 py-3 rounded-xl flex items-center justify-center gap-2 font-black uppercase tracking-widest text-[9px] text-cyan-300 active:scale-95 transition-all hover:bg-cyan-500/25 shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                    >
                        <Tag size={16} />
                        Gestión Descuentos B2B
                    </button>
                    
                    <button
                        onClick={() => { playNeonClick(); navigate(`/${townId}/embajador/ofertas/b2c`); }}
                        className="w-full bg-green-500/15 border border-green-400/40 py-3 rounded-xl flex items-center justify-center gap-2 font-black uppercase tracking-widest text-[9px] text-green-300 active:scale-95 transition-all hover:bg-green-500/25 shadow-[0_0_15px_rgba(34,197,94,0.2)]"
                    >
                        <Tag size={16} />
                        Gestión Descuentos B2C
                    </button>

                    <button
                        onClick={() => { playNeonClick(); navigate(`/${townId}/embajador/empresas`); }}
                        className="w-full bg-amber-500/15 border border-amber-400/40 py-3 rounded-xl flex items-center justify-center gap-2 font-black uppercase tracking-widest text-[9px] text-amber-300 active:scale-95 transition-all hover:bg-amber-500/25 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                    >
                        <Store size={16} />
                        🏭 Gestión de Empresas B2B
                    </button>

                    <button
                        onClick={() => { playNeonClick(); navigate(`/${townId}/embajador/posnet`); }}
                        className="w-full bg-cyan-500/15 border border-cyan-400/40 py-3 rounded-xl flex items-center justify-center gap-2 font-black uppercase tracking-widest text-[9px] text-cyan-300 active:scale-95 transition-all hover:bg-cyan-500/25 shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                    >
                        <Store size={16} />
                        💳 POSNET de Créditos VIP
                    </button>
                </div>
            </div>

            <div className="px-6 space-y-6 relative z-10 max-w-2xl mx-auto">
                {pendingShops.length === 0 ? (
                    <div className="glass-card-3d bg-white/[0.02] border border-cyan-500/20 rounded-3xl p-10 flex flex-col items-center justify-center gap-4 text-center">
                        <div className="w-16 h-16 bg-cyan-500/5 rounded-full flex items-center justify-center border border-cyan-500/20">
                            <CheckCircle size={24} className="text-cyan-400/50" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-white uppercase tracking-widest mb-2">Red Despejada</h3>
                            <p className="text-[10px] text-white/40 uppercase tracking-widest leading-relaxed">No hay negocios pendientes de aprobación en este momento.</p>
                        </div>
                    </div>
                ) : (
                    pendingShops.map((shop) => (
                        <div key={shop.id} className="glass-card-3d bg-white/[0.02] border border-cyan-400/30 rounded-3xl p-6 overflow-hidden relative">
                            {/* Decoration Pulse inside card */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-[40px] pointer-events-none" />
                            
                            <div className="flex flex-col gap-6 relative z-10">
                                {/* Header: Nombre y Rubro */}
                                <div className="flex items-start gap-4 pb-4 border-b border-white/5">
                                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-black/40 border border-white/10 flex-shrink-0 relative flex items-center justify-center">
                                        {shop.bannerImage ? (
                                            <img src={shop.bannerImage} alt={shop.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <ImageIcon size={20} className="text-white/20" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-[1000] text-white uppercase tracking-tighter leading-tight text-shadow-premium">
                                            {shop.name}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-400/20">
                                                {CATEGORIES.find(c => c.id === shop.category)?.name || shop.category}
                                            </span>
                                            <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-1">
                                                <MapPin size={10} /> {shop.zone}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Details: Titular, Contacto y Dirección */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-black/40 rounded-xl p-3 border border-white/5 flex items-center gap-3">
                                        <User size={14} className="text-white/40" />
                                        <div>
                                            <p className="text-[8px] font-bold text-white/30 uppercase tracking-widest mb-0.5">Titular</p>
                                            <p className="text-[11px] font-black text-white/90">{shop.ownerName || 'No provisto'}</p>
                                        </div>
                                    </div>
                                    <div className="bg-black/40 rounded-xl p-3 border border-white/5 flex items-center gap-3">
                                        <Phone size={14} className="text-green-400" />
                                        <div>
                                            <p className="text-[8px] font-bold text-white/30 uppercase tracking-widest mb-0.5">Contacto</p>
                                            <p className="text-[11px] font-black text-white/90">{shop.phone || 'No provisto'}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Dirección del Local */}
                                <div className="bg-black/40 rounded-xl p-3 border border-white/5 flex items-center gap-3">
                                    <Navigation size={14} className="text-yellow-400" />
                                    <div>
                                        <p className="text-[8px] font-bold text-white/30 uppercase tracking-widest mb-0.5">Dirección del Local</p>
                                        <p className="text-[11px] font-black text-white/90">{shop.address || 'No provista'}</p>
                                    </div>
                                </div>

                                {/* Botón Contactar por WhatsApp */}
                                {shop.phone && (
                                    <a
                                        href={`https://wa.me/549${shop.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`¡Hola ${shop.ownerName || ''}! Soy embajador de ShopDigital. Tu comercio "${shop.name}" está pendiente de verificación. \u00bfPodemos coordinar una visita? 🚀`)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={() => playNeonClick()}
                                        className="w-full bg-green-600/20 border border-green-400/40 py-3 rounded-xl flex items-center justify-center gap-2 font-black uppercase tracking-widest text-[10px] text-green-300 active:scale-95 transition-all hover:bg-green-600/30 shadow-[0_0_15px_rgba(34,197,94,0.2)]"
                                    >
                                        <MessageSquare size={16} />
                                        Contactar por WhatsApp
                                    </a>
                                )}

                                {/* Botones CTA para Embajador */}
                                <div className="pt-2 flex gap-3">
                                    <button
                                        disabled={processingId === shop.id}
                                        onClick={() => handleReject(shop)}
                                        className="flex-1 bg-red-500/10 border border-red-500/30 text-red-400 py-3 rounded-xl flex items-center justify-center gap-2 font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all hover:bg-red-500/20 disabled:opacity-50"
                                    >
                                        <XCircle size={16} /> Rechazar
                                    </button>
                                    
                                    <button
                                        disabled={processingId === shop.id}
                                        onClick={() => handleApprove(shop)}
                                        className="flex-[2] glass-action-btn btn-cyan-neon py-3 rounded-xl flex items-center justify-center gap-2 font-black uppercase tracking-widest text-[11px] shadow-[0_0_20px_rgba(34,211,238,0.3)] active:scale-95 transition-all text-white disabled:opacity-50"
                                    >
                                        {processingId === shop.id ? (
                                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <CheckCircle size={16} className="text-white drop-shadow-md" /> Aprobar & Activar
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AmbassadorPanelPage;
