import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Shop } from '../types';
import { CATEGORIES } from '../constants';
import { guardarComercio, eliminarComercio, crearFactura, suscribirseAMensajesBunker, marcarMensajeComoLeido } from '../firebase';
import { useAuth } from '../components/AuthContext';
import {
    ChevronLeft,
    ShieldCheck,
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
    Tag,
    Zap,
    Target,
    Wrench,
    BarChart,
    LogOut,
    Camera,
    CheckSquare,
    CheckSquare,
    Clock,
    Radio,
    AlertTriangle
} from 'lucide-react';
import { playNeonClick, playSuccessSound } from '../utils/audio';
import { AriMerchantAssistant } from '../components/AriMerchantAssistant';

interface AmbassadorPanelPageProps {
    allShops: Shop[];
}

type RoomType = 'hall' | 'radar' | 'misiones' | 'herramientas' | 'metricas';

const AmbassadorPanelPage: React.FC<AmbassadorPanelPageProps> = ({ allShops }) => {
    const { townId = 'esteban-echeverria' } = useParams<{ townId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [activeRoom, setActiveRoom] = useState<RoomType>('hall');
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [mensajesDirectivos, setMensajesDirectivos] = useState<any[]>([]);

    React.useEffect(() => {
        if (user?.uid) {
            const unsub = suscribirseAMensajesBunker(user.uid, (mensajes) => {
                setMensajesDirectivos(mensajes);
            });
            return () => unsub();
        }
    }, [user]);

    // Filtrar comercios pendientes (Radar de Prospectos)
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
                
                const issueDateObj = new Date();
                const periodSello = `${issueDateObj.getFullYear()}-${String(issueDateObj.getMonth() + 1).padStart(2, '0')}`;
                
                const newInvoice = {
                    shopId: shop.id,
                    shopName: shop.name,
                    townId,
                    locality: shop.zone || 'Desconocida',
                    period: periodSello,
                    amount: 10000, 
                    issueDate: issueDateObj.toISOString(),
                    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                    status: 'pending',
                    concept: 'SUSCRIPCIÓN MES EN CURSO'
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

    // ─── COMPONENTES DE HABITACIONES (ROOMS) ───

    const renderRadarRoom = () => (
        <div className="px-6 space-y-6 max-w-2xl mx-auto pb-24">
            <h2 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-2 mb-6">
                <Target className="text-cyan-400" /> Radar de Prospectos
            </h2>
            {pendingShops.length === 0 ? (
                <div className="bg-white/[0.02] border border-cyan-500/20 rounded-3xl p-10 flex flex-col items-center justify-center gap-4 text-center">
                    <div className="w-16 h-16 bg-cyan-500/5 rounded-full flex items-center justify-center border border-cyan-500/20">
                        <CheckCircle size={24} className="text-cyan-400/50" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-white uppercase tracking-widest mb-2">Red Despejada</h3>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest leading-relaxed">No hay negocios pendientes de aprobación.</p>
                    </div>
                </div>
            ) : (
                pendingShops.map((shop) => (
                    <div key={shop.id} className="bg-[#050B14] border border-cyan-400/30 rounded-3xl p-6 overflow-hidden relative shadow-lg">
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
                                    <h3 className="text-xl font-[1000] text-white uppercase tracking-tighter leading-tight">
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

                            {/* Details */}
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
                            
                            <div className="bg-black/40 rounded-xl p-3 border border-white/5 flex items-center gap-3">
                                <Navigation size={14} className="text-yellow-400" />
                                <div>
                                    <p className="text-[8px] font-bold text-white/30 uppercase tracking-widest mb-0.5">Dirección del Local</p>
                                    <p className="text-[11px] font-black text-white/90">{shop.address || 'No provista'}</p>
                                </div>
                            </div>

                            {shop.phone && (
                                <a
                                    href={`https://wa.me/549${shop.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`¡Hola ${shop.ownerName || ''}! Soy embajador de ShopDigital. Tu comercio "${shop.name}" está pendiente de verificación. ¿Podemos coordinar una visita? 🚀`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => playNeonClick()}
                                    className="w-full bg-green-600/20 border border-green-400/40 py-3 rounded-xl flex items-center justify-center gap-2 font-black uppercase tracking-widest text-[10px] text-green-300 active:scale-95 transition-all hover:bg-green-600/30"
                                >
                                    <MessageSquare size={16} /> Contactar por WhatsApp
                                </a>
                            )}

                            <div className="pt-2 flex gap-3">
                                <button
                                    disabled={processingId === shop.id}
                                    onClick={() => handleReject(shop)}
                                    className="flex-1 bg-red-500/10 border border-red-500/30 text-red-400 py-3 rounded-xl flex items-center justify-center gap-2 font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all hover:bg-red-500/20"
                                >
                                    <XCircle size={16} /> Rechazar
                                </button>
                                
                                <button
                                    disabled={processingId === shop.id}
                                    onClick={() => handleApprove(shop)}
                                    className="flex-[2] bg-cyan-500/20 border border-cyan-400/50 py-3 rounded-xl flex items-center justify-center gap-2 font-black uppercase tracking-widest text-[11px] active:scale-95 transition-all text-white"
                                >
                                    {processingId === shop.id ? (
                                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <><CheckCircle size={16} /> Aprobar & Activar</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    );

    const renderMisionesRoom = () => (
        <div className="px-6 space-y-6 max-w-2xl mx-auto pb-24">
            <h2 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-2 mb-6">
                <Zap className="text-amber-400" /> Misiones del Día
            </h2>
            {/* MOCKUPS FASE 1 */}
            <div className="space-y-4">
                <div className="bg-[#050B14] border border-amber-500/30 rounded-2xl p-5 flex gap-4">
                    <div className="mt-1"><CheckSquare size={20} className="text-white/20" /></div>
                    <div>
                        <h4 className="text-sm font-black text-white uppercase mb-1">Visita a "La Pizzería del Centro"</h4>
                        <p className="text-[11px] text-white/60 mb-2">Entregar kit de stickers oficiales y verificar que el QR esté escaneable en la vidriera.</p>
                        <span className="text-[9px] bg-amber-500/20 text-amber-400 px-2 py-1 rounded-md font-bold uppercase">Prioridad Alta</span>
                    </div>
                </div>
                <div className="bg-[#050B14] border border-white/10 rounded-2xl p-5 flex gap-4 opacity-60">
                    <div className="mt-1"><CheckSquare size={20} className="text-green-400" /></div>
                    <div>
                        <h4 className="text-sm font-black text-white uppercase mb-1 line-through">Relevamiento Ezeiza Sur</h4>
                        <p className="text-[11px] text-white/60 mb-2">Pasar por calle principal y suscribir al menos 2 kioscos.</p>
                        <span className="text-[9px] bg-green-500/20 text-green-400 px-2 py-1 rounded-md font-bold uppercase">Completada</span>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderHerramientasRoom = () => (
        <div className="px-6 space-y-4 max-w-2xl mx-auto pb-24">
            <h2 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-2 mb-6">
                <Wrench className="text-blue-400" /> Arsenal de Herramientas
            </h2>
            <button className="w-full bg-blue-500/20 border border-blue-500/40 p-6 rounded-2xl flex flex-col items-center justify-center gap-3 text-center active:scale-95 transition-transform">
                <Store size={32} className="text-blue-400" />
                <div>
                    <span className="block text-sm font-black text-white uppercase tracking-widest">Suscripción Nuevo Comercio</span>
                    <span className="text-[10px] text-white/50 uppercase tracking-widest">Abre el formulario oficial (Copia de Embajador)</span>
                </div>
            </button>
            <button className="w-full bg-emerald-500/20 border border-emerald-500/40 p-6 rounded-2xl flex flex-col items-center justify-center gap-3 text-center active:scale-95 transition-transform">
                <Camera size={32} className="text-emerald-400" />
                <div>
                    <span className="block text-sm font-black text-white uppercase tracking-widest">Reportar Promoción / Visita</span>
                    <span className="text-[10px] text-white/50 uppercase tracking-widest">Subir foto de sticker colocado</span>
                </div>
            </button>
        </div>
    );

    const renderMetricasRoom = () => (
        <div className="px-6 space-y-6 max-w-2xl mx-auto pb-24">
            <h2 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-2 mb-6">
                <BarChart className="text-violet-400" /> Métricas y Reportes
            </h2>
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#050B14] border border-violet-500/30 p-5 rounded-2xl text-center">
                    <span className="block text-3xl font-black text-white mb-1">12</span>
                    <span className="text-[9px] font-bold text-violet-400 uppercase tracking-widest">Locales Visitados</span>
                </div>
                <div className="bg-[#050B14] border border-emerald-500/30 p-5 rounded-2xl text-center">
                    <span className="block text-3xl font-black text-white mb-1">4</span>
                    <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">Suscripciones</span>
                </div>
            </div>
            <button className="w-full bg-violet-600/20 border border-violet-500/50 py-4 rounded-xl text-xs font-black uppercase tracking-widest text-violet-300 mt-4 flex items-center justify-center gap-2">
                <Clock size={16} /> Cerrar Jornada Laboral
            </button>
        </div>
    );

    // ─── HALL CENTRAL (HOME) ───

    const renderHallCentral = () => (
        <div className="flex flex-col h-screen max-h-[100dvh]">
            {/* ARI Radio Base (Upper section, fixed height or flexible) */}
            <div className="flex-none bg-black border-b border-white/10 shadow-2xl relative z-20 h-[45dvh]">
                <AriMerchantAssistant
                    shop={{
                        id: 'mobile-bunker',
                        name: 'Búnker Embajador',
                        category: 'admin',
                        description: '',
                        address: '',
                        phone: '',
                        email: '',
                        logo: '',
                        images: [],
                        offers: [],
                        isActive: true,
                        visits: 0,
                        subscribers: 0,
                        townId: townId,
                    } as any}
                    role="ambassador-field"
                    townId={townId}
                    inline={true}
                />
            </div>

            {/* Grilla Táctica de Puertas (Lower section, scrollable) */}
            <div className="flex-1 overflow-y-auto bg-[#020617] px-4 py-6 relative z-10">
                <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto">
                    {/* Puertas Operativas Móviles */}
                    <button onClick={() => { playNeonClick(); setActiveRoom('radar'); }} className="bg-[#0f172a] border border-cyan-500/30 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 active:scale-95 transition-all shadow-[0_4px_20px_rgba(34,211,238,0.1)]">
                        <Target size={24} className="text-cyan-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white text-center">Radar Prospectos</span>
                        {pendingShops.length > 0 && <span className="absolute top-2 right-2 w-5 h-5 bg-cyan-500 rounded-full flex items-center justify-center text-[9px] font-black">{pendingShops.length}</span>}
                    </button>
                    <button onClick={() => { playNeonClick(); setActiveRoom('misiones'); }} className="bg-[#0f172a] border border-amber-500/30 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 active:scale-95 transition-all shadow-[0_4px_20px_rgba(245,158,11,0.1)]">
                        <Zap size={24} className="text-amber-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white text-center">Misiones</span>
                    </button>
                    <button onClick={() => { playNeonClick(); setActiveRoom('herramientas'); }} className="bg-[#0f172a] border border-blue-500/30 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 active:scale-95 transition-all shadow-[0_4px_20px_rgba(59,130,246,0.1)]">
                        <Wrench size={24} className="text-blue-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white text-center">Herramientas</span>
                    </button>
                    <button onClick={() => { playNeonClick(); setActiveRoom('metricas'); }} className="bg-[#0f172a] border border-violet-500/30 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 active:scale-95 transition-all shadow-[0_4px_20px_rgba(139,92,246,0.1)]">
                        <BarChart size={24} className="text-violet-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white text-center">Métricas</span>
                    </button>

                    {/* Divisor */}
                    <div className="col-span-2 my-2 border-t border-white/5 relative">
                        <span className="absolute left-1/2 -top-2.5 -translate-x-1/2 bg-[#020617] px-2 text-[8px] font-black text-white/30 uppercase tracking-widest">Accesos Administrativos</span>
                    </div>

                    {/* Puertas Clásicas */}
                    <button onClick={() => { playNeonClick(); navigate(`/${townId}/embajador/gestion`); }} className="bg-[#0f172a] border border-white/10 rounded-2xl p-3 flex items-center justify-center gap-2 active:scale-95 transition-all">
                        <Settings size={14} className="text-yellow-400" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/70">Comercios</span>
                    </button>
                    <button onClick={() => { playNeonClick(); navigate(`/${townId}/embajador/clientes`); }} className="bg-[#0f172a] border border-white/10 rounded-2xl p-3 flex items-center justify-center gap-2 active:scale-95 transition-all">
                        <Users size={14} className="text-blue-400" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/70">Clientes</span>
                    </button>
                    <button onClick={() => { playNeonClick(); navigate(`/${townId}/embajador/ofertas/b2b`); }} className="col-span-2 bg-[#0f172a] border border-white/10 rounded-2xl p-3 flex items-center justify-center gap-2 active:scale-95 transition-all">
                        <Tag size={14} className="text-cyan-400" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/70">Gestión Descuentos B2B / B2C</span>
                    </button>
                    <button onClick={() => { playNeonClick(); navigate(`/${townId}/embajador/empresas`); }} className="bg-[#0f172a] border border-white/10 rounded-2xl p-3 flex items-center justify-center gap-2 active:scale-95 transition-all">
                        <Store size={14} className="text-amber-400" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/70">Empresas</span>
                    </button>
                    <button onClick={() => { playNeonClick(); navigate(`/${townId}/embajador/posnet`); }} className="bg-[#0f172a] border border-white/10 rounded-2xl p-3 flex items-center justify-center gap-2 active:scale-95 transition-all">
                        <Zap size={14} className="text-emerald-400" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/70">POSNET</span>
                    </button>
                </div>

                {/* --- BANDEJA DE MENSAJES DIRECTIVOS --- */}
                <div className="max-w-lg mx-auto mt-6">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-[11px] font-black uppercase tracking-[0.25em] flex items-center gap-2 text-white/80">
                            <Radio size={14} className="text-red-500 animate-pulse" /> Alertas de Dirección
                        </h2>
                        {mensajesDirectivos.filter(m => !m.isRead).length > 0 && (
                            <span className="bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full animate-pulse">
                                {mensajesDirectivos.filter(m => !m.isRead).length} NUEVAS
                            </span>
                        )}
                    </div>
                    
                    <div className="flex flex-col gap-3">
                        {mensajesDirectivos.length === 0 ? (
                            <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-6 text-center">
                                <p className="text-[10px] text-white/30 uppercase tracking-widest italic">Sin novedades en la frecuencia.</p>
                            </div>
                        ) : (
                            mensajesDirectivos.map(msg => (
                                <div key={msg.id} className={`border rounded-2xl p-4 flex flex-col gap-3 transition-all ${
                                    msg.isRead ? 'bg-[#0f172a] border-white/10 opacity-70' : 'bg-red-950/20 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.15)]'
                                }`}>
                                    <div className="flex justify-between items-start">
                                        <span className="text-[8px] text-white/40 uppercase tracking-widest">
                                            {new Date(msg.createdAt).toLocaleString('es-AR')}
                                        </span>
                                        {!msg.isRead && (
                                            <span className="text-[8px] font-black bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded uppercase flex items-center gap-1">
                                                <AlertTriangle size={8} /> Prioridad
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[12px] text-white/90 leading-relaxed font-medium break-words">
                                        {msg.text}
                                    </p>
                                    {!msg.isRead && (
                                        <button 
                                            onClick={() => {
                                                playSuccessSound();
                                                marcarMensajeComoLeido(msg.id);
                                            }}
                                            className="w-full mt-2 py-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-black uppercase tracking-widest text-[9px] rounded-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle size={14} /> Confirmar Recepción
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    <a
                        href="https://wa.me/5491140607059"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-6 w-full bg-emerald-500/10 border border-emerald-500/30 py-3 rounded-xl flex items-center justify-center gap-2 font-black uppercase tracking-widest text-[10px] text-emerald-400 active:scale-95 transition-all hover:bg-emerald-500/20"
                    >
                        <MessageSquare size={14} /> Reporte al Director (WhatsApp)
                    </a>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#020617] text-white overflow-hidden font-sans selection:bg-cyan-500/30">
            {activeRoom === 'hall' ? (
                renderHallCentral()
            ) : (
                <div className="flex flex-col h-screen max-h-[100dvh]">
                    {/* Header para las Habitaciones */}
                    <div className="sticky top-0 bg-[#050B14]/90 backdrop-blur-md border-b border-white/10 z-50 px-4 py-4 flex items-center gap-3">
                        <button 
                            onClick={() => { playNeonClick(); setActiveRoom('hall'); }} 
                            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70 active:scale-95 transition-transform"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <div>
                            <p className="text-[8px] text-white/40 uppercase tracking-widest font-black">Regresar a la Radio Base</p>
                            <h2 className="text-[11px] font-black text-white uppercase tracking-widest">{activeRoom}</h2>
                        </div>
                    </div>
                    {/* Contenido de la Habitación */}
                    <div className="flex-1 overflow-y-auto pt-6 bg-[#020617]">
                        {activeRoom === 'radar' && renderRadarRoom()}
                        {activeRoom === 'misiones' && renderMisionesRoom()}
                        {activeRoom === 'herramientas' && renderHerramientasRoom()}
                        {activeRoom === 'metricas' && renderMetricasRoom()}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AmbassadorPanelPage;
