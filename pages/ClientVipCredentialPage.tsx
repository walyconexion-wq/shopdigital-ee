import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Shop, Client } from '../types';
import { actualizarFotoCliente } from '../firebaseVIP';
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
    IdCard,
    Clock,
    Camera,
    Wallet,
    CheckCircle2,
    X
} from 'lucide-react';
import { playNeonClick, playSuccessSound } from '../utils/audio';

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

    // --- STATE ---
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 1. Encontrar al socio
    const client = useMemo(() => {
        if (!clientId) return null;
        return allClients.find(c => c.id === clientId);
    }, [allClients, clientId]);

    // 2. Encontrar el comercio origen (con fallback para links genéricos de club)
    const shop = useMemo(() => {
        if (!shopSlug) return null;
        let found = allShops.find(s => (s.slug === shopSlug || s.id === shopSlug));
        if (!found || shopSlug === 'club') {
            if (client?.sourceShopId) {
                found = allShops.find(s => s.id === client.sourceShopId);
            }
        }
        return found;
    }, [allShops, shopSlug, client]);

    // --- SELLO DE VIDA: RELOJ EN VIVO ---
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatClock = (date: Date) => {
        const d = date.toLocaleDateString('es-AR');
        const t = date.toLocaleTimeString('es-AR');
        return `${d} - ${t}`;
    };

    // --- GESTIÓN DE FOTO ---
    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !clientId) return;

        setIsUploading(true);
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64String = reader.result as string;
            try {
                await actualizarFotoCliente(clientId, base64String);
                playSuccessSound();
            } catch (err) {
                console.error("Error subiendo foto:", err);
                alert("Error al cargar la foto.");
            } finally {
                setIsUploading(false);
            }
        };
        reader.readAsDataURL(file);
    };

    if (!shop || !client) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 text-center">
                <div className="w-20 h-20 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mb-6 animate-pulse">
                    <ShieldCheck size={40} className="text-red-500" />
                </div>
                <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-2">Socio No Encontrado</h2>
                <p className="text-white/40 text-[10px] uppercase mb-8 leading-relaxed">La credencial no pertenece a este radar o ha sido revocada.</p>
                <button onClick={() => navigate('/')} className="bg-white/5 border border-white/10 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all">Volver al Inicio</button>
            </div>
        );
    }

    const enrollmentDate = client.createdAt 
        ? new Date(client.createdAt).toLocaleDateString('es-AR') 
        : '--/--/----';

    const isSuspended = client.status === 'suspended';
    const cardColor = client.cardColor || '#22d3ee';
    const formattedTown = townId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    return (
        <div className="min-h-screen bg-black text-white p-6 relative overflow-hidden flex flex-col items-center pt-16 pb-24 selection:bg-cyan-500/30">
            {/* HUD Background Layers */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[150px] opacity-20" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
            </div>

            {/* HEADER */}
            <div className="w-full max-w-sm relative z-10 flex justify-between items-center mb-6 animate-in fade-in slide-in-from-top-4 duration-700">
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
                                title: `Credencial VIP de ${client.name}`,
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

            {/* SELLO DE VIDA (RELÓJ EN VIVO) ⏱️ */}
            <div className="relative z-10 mb-8 bg-cyan-500/5 border border-cyan-500/20 px-4 py-2 rounded-full backdrop-blur-md animate-pulse">
                <p className="text-[10px] font-black font-mono text-cyan-400 flex items-center gap-2 tracking-widest">
                    <Clock size={12} /> {formatClock(currentTime)}
                </p>
            </div>

            {/* VIP CARD */}
            <div className="w-full max-w-sm relative z-10 group animate-in zoom-in duration-700 delay-100">
                {/* Glow Effect Dynamized */}
                <div className="absolute -inset-1 rounded-[2.5rem] blur opacity-25" style={{ backgroundColor: isSuspended ? '#ef4444' : cardColor }}></div>
                
                <div className="relative bg-zinc-900 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
                    {/* Card Header Background */}
                    <div className="absolute top-0 left-0 w-full h-44 opacity-20" style={{ background: `linear-gradient(135deg, ${cardColor}, transparent)` }} />
                    
                    {/* SUSPENDED OVERLAY 🚫 */}
                    {isSuspended && (
                        <div className="absolute inset-0 z-50 bg-red-600/10 backdrop-blur-[2px] flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
                            <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_20px,rgba(239,68,68,0.05)_20px,rgba(239,68,68,0.05)_40px)]" />
                            <div className="bg-red-600 px-6 py-2 rounded-xl shadow-[0_0_30px_rgba(239,68,68,0.6)] rotate-[-5deg] mb-4">
                                <h4 className="text-xl font-[1000] text-white uppercase tracking-widest">CUENTA SUSPENDIDA</h4>
                            </div>
                            <p className="text-[10px] font-black text-red-500/90 uppercase tracking-widest max-w-[200px] leading-relaxed">
                                Contacte con {shop.name} para regularizar su situación de membresía.
                            </p>
                        </div>
                    )}

                    <div className="p-8 pb-10">
                        {/* Status Badge */}
                        <div className="flex justify-between items-start mb-8">
                            <div className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-2" style={{ borderColor: `${cardColor}4D` }}>
                                <Activity size={10} className="animate-pulse" style={{ color: cardColor }} />
                                <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: cardColor }}>SOCIO VIP ACTIVO</span>
                            </div>
                            <Star size={24} className="text-cyan-400" style={{ color: cardColor, fill: cardColor }} />
                        </div>

                        {/* Shop Info */}
                        <div className="mb-10 relative">
                            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-1">Membresía ShopDigital</p>
                            <h3 className="text-3xl font-[1000] text-white uppercase tracking-tighter leading-none mb-2">
                                {shop.name}
                            </h3>
                            <div className="flex items-center gap-2 text-white/40">
                                <MapPin size={12} style={{ color: cardColor }} />
                                <span className="text-[10px] font-bold uppercase tracking-widest leading-none mt-0.5">{shop.zone || formattedTown} · {shop.category}</span>
                            </div>
                        </div>

                        {/* PHOTO IDENTITY AREA 📸 */}
                        <div className="w-full aspect-square bg-white/[0.03] border border-white/10 rounded-[2rem] flex flex-col items-center justify-center p-8 mb-8 relative overflow-hidden group/photo">
                            <div className="absolute inset-0" style={{ background: `radial-gradient(circle at center, ${cardColor}1A, transparent 70%)` }} />
                            
                            <div className="relative w-40 h-40 rounded-full border-2 p-1 shadow-2xl overflow-hidden group-hover/photo:scale-105 transition-transform duration-500" 
                                 style={{ borderColor: `${cardColor}4D`, backgroundColor: `${cardColor}0D` }}>
                                {client.photo ? (
                                    <img src={client.photo} className="w-full h-full object-cover rounded-full" alt={client.name} />
                                ) : (
                                    <div className="w-full h-full rounded-full bg-white/5 flex flex-col items-center justify-center opacity-40">
                                        <User size={80} style={{ color: cardColor }} />
                                    </div>
                                )}
                                
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute inset-0 bg-black/60 opacity-0 group-hover/photo:opacity-100 flex flex-col items-center justify-center transition-opacity border-none cursor-pointer"
                                >
                                    <Camera size={32} className="text-white mb-2" />
                                    <span className="text-[8px] font-black uppercase tracking-widest text-white">{client.photo ? 'Editar Foto' : 'Subir Foto'}</span>
                                </button>
                                
                                <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />
                                
                                {isUploading && (
                                    <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                                        <div className="w-8 h-8 border-3 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
                                    </div>
                                )}
                            </div>

                            <div className="mt-8 bg-zinc-950/80 backdrop-blur-md border border-white/10 px-5 py-2 rounded-2xl">
                                <p className="text-[10px] font-black text-white tracking-[0.3em] flex items-center gap-2">
                                    <CheckCircle2 size={12} className="text-green-400" /> IDENTIDAD VERIFICADA
                                </p>
                            </div>
                        </div>

                        {/* IDENTITY DATA: DNI / CREDITS 💰🆔 */}
                        <div className="space-y-6 border-t border-white/5 pt-8">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Titular VIP</p>
                                    <p className="text-[20px] font-[1000] text-white tracking-tighter uppercase leading-tight">
                                        {client.name}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Nro. de Membresía (DNI)</p>
                                    <p className={`text-[15px] font-black tracking-tighter uppercase leading-tight flex items-center justify-end gap-1 ${client.dni ? 'text-white/80' : 'text-cyan-400 animate-pulse'}`}>
                                        <IdCard size={14} className="opacity-40" /> {client.dni || "COMPLETAR DNI"}
                                    </p>
                                </div>
                            </div>

                            {/* BILLETERA DIGITAL 💰 */}
                            <div className="bg-gradient-to-br from-white/[0.05] to-transparent p-5 rounded-3xl border border-white/10 flex justify-between items-center shadow-inner group/wallet">
                                <div>
                                    <label className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em] mb-1 flex items-center gap-1.5">
                                        <Wallet size={10} style={{ color: cardColor }} /> Créditos ShopDigital
                                    </label>
                                    <p className="text-2xl font-[1000] text-white font-inter tabular-nums">
                                        {client.credits || 0}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="inline-block px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[9px] font-black text-cyan-400 uppercase tracking-widest">
                                        DISPONIBLES
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* QR DE VALIDACIÓN TRASACCIONAL 📡 */}
            <div className="w-full max-w-sm mt-8 p-6 bg-zinc-900 border border-white/10 rounded-[2rem] flex flex-col items-center">
                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mb-6">Validación de Descuentos</p>
                <div className="bg-white p-4 rounded-2xl shadow-2xl relative group/qr">
                    <QrCode size={160} className="text-black transition-transform group-hover/qr:scale-105 duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/qr:opacity-100 transition-opacity pointer-events-none">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg border border-zinc-100">
                             <Star size={24} style={{ color: cardColor, fill: cardColor }} />
                        </div>
                    </div>
                </div>
                
                <button 
                    onClick={() => { playNeonClick(); navigate(`/${townId}/validar/${client.id}`); }}
                    className="mt-8 w-full h-16 rounded-2xl bg-cyan-600 hover:bg-cyan-500 font-[1000] uppercase tracking-[0.2em] text-[11px] shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3 border border-white/10 text-white"
                >
                    <Activity size={18} /> Validar Descuento VIP
                </button>
            </div>

            {/* ACTION BUTTONS */}
            <div className="w-full max-w-sm mt-8 space-y-4 relative z-10 animate-in slide-in-from-bottom-4 duration-700 delay-300">
                <button 
                    onClick={() => { playNeonClick(); navigate(`/${townId}/red-comercial/ofertas`); }}
                    className="w-full h-14 rounded-2xl bg-white/5 hover:bg-white/10 text-white/80 font-black uppercase tracking-[0.2em] text-[10px] transition-all active:scale-95 border border-white/5"
                >
                    Explorar Beneficios
                </button>
                <button 
                    onClick={() => { playNeonClick(); navigate(`/${townId}/home`); }}
                    className="w-full h-14 rounded-2xl bg-white/5 hover:bg-white/10 text-white/40 font-black uppercase tracking-[0.2em] text-[10px] transition-all active:scale-95 border border-white/5"
                >
                    Volver a Inicio
                </button>
            </div>

            {/* FOOTER INFO */}
            <p className="text-[8.5px] text-white/10 uppercase tracking-[0.4em] font-black text-center leading-[1.8] mt-12 px-8">
                Blockchain Secured Identity · {formatClock(client.updatedAt ? new Date(client.updatedAt) : currentTime)} <br/>
                ID: {client.id}
            </p>
        </div>
    );
};

export default ClientVipCredentialPage;
