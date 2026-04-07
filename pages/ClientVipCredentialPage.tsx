import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Shop, Client } from '../types';
import { CATEGORIES } from '../constants';
import { 
    ShieldCheck, 
    Star, 
    QrCode, 
    ChevronLeft,
    Share2,
    Activity,
    User,
    AlertTriangle,
    MapPin,
    Calendar,
    IdCard
} from 'lucide-react';
import { playNeonClick } from '../utils/audio';

interface ClientVipCredentialPageProps {
    allShops: Shop[];
    allClients: Client[];
}

const ClientVipCredentialPage: React.FC<ClientVipCredentialPageProps> = ({ allShops, allClients }) => {
    const { townId = 'esteban-echeverria', categorySlug, shopSlug, clientId } = useParams<{ 
        townId: string, 
        categorySlug: string, 
        shopSlug: string,
        clientId?: string
    }>();
    const navigate = useNavigate();

    // 1. Encontrar al socio primero para el fallback de club
    const client = useMemo(() => {
        if (!clientId) return null;
        return allClients.find(c => c.id === clientId);
    }, [allClients, clientId]);

    // 2. Encontrar el comercio origen (con fallback para links genéricos de club)
    const shop = useMemo(() => {
        if (!shopSlug) return null;
        // Búsqueda por slug o ID
        let found = allShops.find(s => (s.slug === shopSlug || s.id === shopSlug));
        
        // Fallback: Si es 'club' o no se encuentra, buscar por el comercio del cliente
        if (!found || shopSlug === 'club') {
            if (client?.sourceShopId) {
                found = allShops.find(s => s.id === client.sourceShopId);
            }
        }
        return found;
    }, [allShops, shopSlug, client]);

    if (!shop) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 text-center">
                <div className="w-20 h-20 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mb-6 animate-pulse">
                    <ShieldCheck size={40} className="text-red-500" />
                </div>
                <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-2">Comercio VIP No Identificado</h2>
                <p className="text-white/40 text-[10px] uppercase mb-8 leading-relaxed">El comercio de origen no existe o no se encuentra en este radar regional.</p>
                <button 
                    onClick={() => navigate('/')}
                    className="bg-white/5 border border-white/10 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all active:scale-95"
                >
                    Volver al Inicio
                </button>
            </div>
        );
    }

    const enrollmentDate = client?.createdAt 
        ? new Date(client.createdAt).toLocaleDateString('es-AR') 
        : new Date().toLocaleDateString('es-AR');

    const isSuspended = client?.status === 'suspended';
    const cardColor = client?.cardColor || '#22d3ee'; // Default Cyan Neon
    const formattedTown = townId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    return (
        <div className="min-h-screen bg-black text-white p-6 relative overflow-hidden flex flex-col items-center pt-16 pb-24 selection:bg-cyan-500/30">
            {/* HUD Background Layers */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[150px] opacity-20" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-violet-500/5 rounded-full blur-[120px]" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
            </div>

            {/* HEADER */}
            <div className="w-full max-w-sm relative z-10 flex justify-between items-center mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
                <button 
                    onClick={() => { playNeonClick(); navigate(-1); }}
                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all shadow-inner"
                >
                    <ChevronLeft size={20} />
                </button>
                <div className="text-center">
                    <h1 className="text-2xl font-[1000] text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-400 to-blue-500 tracking-tighter uppercase drop-shadow-[0_0_20px_rgba(34,211,238,0.4)]">
                        ShopDigital
                    </h1>
                    <p className="text-[8px] font-[900] text-cyan-400/60 uppercase tracking-[0.4em]">Sede: {formattedTown}</p>
                </div>
                <button 
                    onClick={() => {
                        playNeonClick();
                        if (navigator.share) {
                            navigator.share({
                                title: `Credencial VIP de ${client?.name || 'Socio'}`,
                                text: `Mirá mi Credencial VIP en ShopDigital: ${shop.name}`,
                                url: window.location.href,
                            });
                        }
                    }}
                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all shadow-inner"
                >
                    <Share2 size={18} />
                </button>
            </div>

            {/* VIP CARD */}
            <div className="w-full max-w-sm relative z-10 group animate-in zoom-in duration-700 delay-100">
                {/* Glow Effect Dynamized */}
                <div className="absolute -inset-1 rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" style={{ backgroundColor: isSuspended ? '#ef4444' : cardColor }}></div>
                
                <div className="relative bg-zinc-900 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
                    {/* Card Header Background */}
                    <div className="absolute top-0 left-0 w-full h-40 opacity-20" style={{ background: `linear-gradient(135deg, ${cardColor}, transparent)` }} />
                    
                    <div className="p-8 pb-10">
                        {/* Status Badge */}
                        <div className="flex justify-between items-start mb-8">
                            {isSuspended ? (
                                <div className="bg-red-500/10 border border-red-500/30 px-3 py-1.5 rounded-full flex items-center gap-2">
                                    <AlertTriangle size={10} className="text-red-500" />
                                    <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">MEMBRESÍA SUSPENDIDA</span>
                                </div>
                            ) : (
                                <div className="bg-cyan-500/10 border border-cyan-500/30 px-3 py-1.5 rounded-full flex items-center gap-2" style={{ borderColor: `${cardColor}4D`, backgroundColor: `${cardColor}1A` }}>
                                    <Activity size={10} className="animate-pulse" style={{ color: cardColor }} />
                                    <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: cardColor }}>SOCIO VIP ACTIVO</span>
                                </div>
                            )}
                            <Star size={24} className={isSuspended ? 'text-zinc-600' : 'text-cyan-400'} style={{ color: isSuspended ? undefined : cardColor, fill: isSuspended ? 'none' : cardColor }} />
                        </div>

                        {/* Shop Info */}
                        <div className="mb-10 relative">
                            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-1">Círculo de Beneficios</p>
                            <h3 className="text-3xl font-[1000] text-white uppercase tracking-tighter leading-none mb-2">
                                {shop.name}
                            </h3>
                            <div className="flex items-center gap-2 text-white/40">
                                <MapPin size={12} style={{ color: isSuspended ? undefined : cardColor }} />
                                <span className="text-[10px] font-bold uppercase tracking-widest leading-none mt-0.5">{shop.zone || formattedTown} · {shop.category}</span>
                            </div>
                        </div>

                        {/* QR / Identity Area */}
                        <div className="w-full aspect-square bg-white/[0.03] border border-white/10 rounded-[2rem] flex flex-col items-center justify-center p-8 mb-10 relative overflow-hidden group/qr">
                            <div className="absolute inset-0" style={{ background: `radial-gradient(circle at center, ${cardColor}0D, transparent 70%)` }} />
                            <QrCode size={180} className="text-white/10 group-hover/qr:opacity-30 transition-all duration-700 scale-90" style={{ color: isSuspended ? undefined : cardColor }} />
                            
                            {/* Photo / Identity Bubble */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="w-36 h-36 rounded-full border-2 backdrop-blur-md flex items-center justify-center shadow-2xl relative overflow-hidden" 
                                     style={{ borderColor: isSuspended ? '#ef444433' : `${cardColor}33`, backgroundColor: isSuspended ? '#ef44440D' : `${cardColor}0D` }}>
                                    {client?.photo ? (
                                        <img src={client.photo} className="w-full h-full object-cover animate-in fade-in zoom-in duration-1000" alt={client.name} />
                                    ) : (
                                        <User size={70} style={{ color: isSuspended ? '#ef44444D' : `${cardColor}4D` }} />
                                    )}
                                    {isSuspended && (
                                        <div className="absolute inset-0 bg-red-900/40 flex items-center justify-center">
                                            <X size={40} className="text-white opacity-60" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="absolute bottom-6 bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl">
                                <p className="text-[9px] font-black text-white/70 uppercase tracking-[0.3em]">ID VERIFICADO</p>
                            </div>
                        </div>

                        {/* Card Footer: DYNAMIC IDENTITY 💎 */}
                        <div className="space-y-6 border-t border-white/5 pt-8">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Titular de Membresía</p>
                                    <p className="text-[18px] font-[1000] text-white tracking-tighter uppercase leading-tight">
                                        {client?.name || 'Socio Preferencial'}
                                    </p>
                                </div>
                                {client?.dni && (
                                    <div className="text-right">
                                        <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">DNI / Pasaporte</p>
                                        <p className="text-[14px] font-black text-white/80 tracking-tighter uppercase leading-tight flex items-center justify-end gap-1">
                                            <IdCard size={12} className="opacity-40" /> {client.dni}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between items-end bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                                <div>
                                    <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Estado</p>
                                    <p className={`text-[10px] font-black uppercase tracking-widest ${isSuspended ? 'text-red-500' : 'text-green-400'}`}>
                                        {isSuspended ? 'Suspendida' : 'Vigente'}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Miembro desde</p>
                                    <div className="flex items-center gap-1.5 justify-end text-[12px] font-black text-white/90 tabular-nums">
                                        <Calendar size={12} className="opacity-40" />
                                        {enrollmentDate}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ACTION BUTTONS */}
            {!isSuspended && (
                <div className="w-full max-w-sm mt-10 space-y-4 relative z-10 animate-in slide-in-from-bottom-4 duration-700 delay-300">
                    <button 
                        onClick={() => { playNeonClick(); navigate(`/${townId}/red-comercial/ofertas`); }}
                        className="w-full h-16 rounded-2xl font-[1000] uppercase tracking-[0.2em] text-[11px] shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3 border border-white/10"
                        style={{ backgroundColor: cardColor, color: '#000' }}
                    >
                        <Star size={18} /> Ver Beneficios Club
                    </button>
                    <button 
                        onClick={() => { playNeonClick(); navigate(`/${townId}/home`); }}
                        className="w-full h-16 rounded-2xl bg-white/5 hover:bg-white/10 text-white/60 font-black uppercase tracking-[0.2em] text-[11px] transition-all active:scale-95 border border-white/5"
                    >
                        Volver a Inicio
                    </button>
                </div>
            )}

            {isSuspended && (
                <div className="w-full max-w-sm mt-10 relative z-10 p-6 bg-red-500/10 border border-red-500/30 rounded-[2rem] text-center">
                    <p className="text-[10px] font-black text-red-400 uppercase tracking-widest leading-relaxed">
                        Tu membresía ha sido <span className="text-red-500 underline text-xs">SUSPENDIDA</span> temporalmente. <br/>
                        Contactate con {shop.name} para regularizar tu situación.
                    </p>
                </div>
            )}

            {/* FOOTER INFO */}
            <p className="text-[8.5px] text-white/20 uppercase tracking-[0.4em] font-black text-center leading-[1.8] mt-12 px-8 relative z-10">
                Esta credencial es personal e intransferible. <br/>
                Habilita el acceso a beneficios exclusivos en {formattedTown}.
                <br/><br/>
                <span className="opacity-40">ShopDigital VIP · Blockchain Secured ID: {client?.id || 'SD-REF-99'}</span>
            </p>
        </div>
    );
};

export default ClientVipCredentialPage;
