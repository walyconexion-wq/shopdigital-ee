import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Shop, Client, LiveEvent } from '../types';
import { db, suscribirseAEventos } from '../firebase';
import { actualizarFotoCliente, actualizarDatosCliente } from '../firebaseVIP';
import { useAuth } from '../components/AuthContext';
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
    X,
    Ticket,
    Edit2,
    Check,
    Radio,
    Wifi,
    WifiOff
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
    const { user, role } = useAuth();

    // --- STATE ---
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [liveEvents, setLiveEvents] = useState<LiveEvent[]>([]);

    // Client State Rescue
    const [client, setClient] = useState<Client | null>(null);
    const [isLoadingClient, setIsLoadingClient] = useState(true);

    // Edit Modal State
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        name: '',
        phone: '',
        email: '',
        dni: '',
        photo: ''
    });
    const [isSaving, setIsSaving] = useState(false);

    // Subscribe to live events
    useEffect(() => {
        const unsubscribe = suscribirseAEventos((events) => {
            setLiveEvents(events);
        });
        return () => unsubscribe();
    }, []);

    // Load or rescue client
    useEffect(() => {
        if (!clientId) {
            setIsLoadingClient(false);
            return;
        }
        
        const found = allClients.find(c => c.id === clientId);
        if (found) {
            setClient(found);
            setEditForm({
                name: found.name || '',
                phone: found.phone || '',
                email: found.email || '',
                dni: found.dni || '',
                photo: found.photo || ''
            });
            setIsLoadingClient(false);
            return;
        }

        const fetchDirect = async () => {
            try {
                const { doc, getDoc } = await import('firebase/firestore');
                const docRef = doc(db, 'clientes', clientId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = { id: docSnap.id, ...docSnap.data() } as Client;
                    setClient(data);
                    setEditForm({
                        name: data.name || '',
                        phone: data.phone || '',
                        email: data.email || '',
                        dni: data.dni || '',
                        photo: data.photo || ''
                    });
                }
            } catch (err) {
                console.error("Error al rescatar cliente:", err);
            } finally {
                setIsLoadingClient(false);
            }
        };
        
        fetchDirect();
    }, [allClients, clientId]);

    // Authorization checks
    const userEmail = user?.email?.trim().toLowerCase() || null;
    const isClientOwner = userEmail && client && userEmail === client.email.trim().toLowerCase();
    const isDG = userEmail === 'walyconexion@gmail.com';
    const isAuthorized = isClientOwner || role === 'admin' || isDG;

    // Match active event with client's active ticket
    const ticketEvent = useMemo(() => {
        if (!client?.activeTicket?.eventId) return null;
        return liveEvents.find(e => e.id === client.activeTicket?.eventId);
    }, [liveEvents, client?.activeTicket?.eventId]);

    // Active event for client zone if they don't have a ticket
    // CORRECCIÓN FASE 3: Cambiado de 'empresario' a 'cliente_calle' para sintonizar a la gente
    const generalActiveEvent = useMemo(() => {
        if (client?.activeTicket) return null;
        return liveEvents.find(e => 
            (e.status === 'active_live' || e.status === 'suspended') &&
            e.targetRoles.includes('cliente_calle')
        );
    }, [liveEvents, client]);

    const sintonizadorEventData = useMemo(() => {
        if (client?.eventPassEnabled === false) return null;
        if (client?.activeTicket && ticketEvent) {
            return {
                name: ticketEvent.name,
                details: `SECTOR: ${client.activeTicket.seatSector || 'General VIP'} · FILA: ${client.activeTicket.fila || '-'} · ASIENTO: ${client.activeTicket.asiento || '-'}`,
                access: 'PASE VIP ACTIVO',
                isTicket: true
            };
        }
        if (generalActiveEvent) {
            return {
                name: generalActiveEvent.name,
                details: `ARTISTA: ${generalActiveEvent.artist || 'Red ShopDigital'} · LOCALIDAD: ${generalActiveEvent.targetLocalities.join(', ').toUpperCase()}`,
                access: 'ENTRADA LIBRE',
                isTicket: false
            };
        }
        return null;
    }, [client, ticketEvent, generalActiveEvent]);

    // Encontrar el comercio origen
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

    // Sello de vida clock
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatClock = (date: Date) => {
        const d = date.toLocaleDateString('es-AR');
        const t = date.toLocaleTimeString('es-AR');
        return `${d} - ${t}`;
    };

    // Canvas image compression helper
    const compressImage = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    const MAX_SIZE = 300;
                    
                    if (width > height) {
                        if (width > MAX_SIZE) {
                            height = Math.round((height * MAX_SIZE) / width);
                            width = MAX_SIZE;
                        }
                    } else {
                        if (height > MAX_SIZE) {
                            width = Math.round((width * MAX_SIZE) / height);
                            height = MAX_SIZE;
                        }
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.drawImage(img, 0, 0, width, height);
                        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                        resolve(dataUrl);
                    } else {
                        resolve(e.target?.result as string);
                    }
                };
                img.onerror = () => reject(new Error('Error cargando imagen.'));
                img.src = e.target?.result as string;
            };
            reader.onerror = (err) => reject(err);
            reader.readAsDataURL(file);
        });
    };

    // Photo direct handler
    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !clientId) return;

        setIsUploading(true);
        try {
            const compressed = await compressImage(file);
            await actualizarFotoCliente(clientId, compressed);
            setEditForm(prev => ({ ...prev, photo: compressed }));
            if (client) {
                setClient({ ...client, photo: compressed });
            }
            playSuccessSound();
        } catch (err) {
            console.error("Error subiendo foto:", err);
            alert("Error al cargar y comprimir la foto.");
        } finally {
            setIsUploading(false);
        }
    };

    // Toggle live events receiver
    const handleToggleEventReceiver = async () => {
        if (!client || !clientId) return;
        playNeonClick();
        const nextValue = client.eventPassEnabled === false ? true : false;
        try {
            await actualizarDatosCliente(clientId, { eventPassEnabled: nextValue });
            setClient({ ...client, eventPassEnabled: nextValue });
            playSuccessSound();
        } catch (err) {
            console.error("Error al actualizar sintonizador de eventos:", err);
        }
    };

    // Save profile from edit panel
    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!clientId || !client) return;
        playNeonClick();
        setIsSaving(true);
        try {
            const updatedData = {
                name: editForm.name.toUpperCase().trim(),
                phone: editForm.phone.replace(/\D/g, ''),
                email: editForm.email.trim().toLowerCase(),
                dni: editForm.dni.trim(),
                photo: editForm.photo
            };
            await actualizarDatosCliente(clientId, updatedData);
            setClient({
                ...client,
                ...updatedData
            });
            setIsEditing(false);
            playSuccessSound();
        } catch (err) {
            console.error("Error guardando datos:", err);
            alert("Hubo un error al guardar los cambios.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoadingClient) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 text-center">
                <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mb-4" />
                <p className="text-cyan-400 text-[10px] uppercase tracking-widest font-black animate-pulse">Sincronizando Identidad...</p>
            </div>
        );
    }

    if (!shop || !client) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 text-center">
                <div className="w-20 h-20 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mb-6 animate-pulse">
                    <ShieldCheck size={40} className="text-red-500" />
                </div>
                <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-2">Socio No Encontrado</h2>
                <p className="text-white/40 text-[10px] uppercase mb-8 leading-relaxed">La credencial no pertenece a este radar o ha sido revocada.</p>
                <button onClick={() => navigate('/')} className="bg-white/5 border border-white/10 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all active:scale-95 cursor-pointer">Volver al Inicio</button>
            </div>
        );
    }

    const isSuspended = client.status === 'suspended';
    // CELESTE NEÓN COLOR POR DEFECTO
    const cardColor = '#00f5ff';
    const formattedTown = townId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    return (
        <div className="min-h-screen bg-black text-white p-6 relative overflow-hidden flex flex-col items-center pt-16 pb-24 selection:bg-cyan-500/30">
            {/* Ambient styles to override Day-Mode */}
            <style>{`
                .neon-credential-card .text-white, .day-mode .neon-credential-card .text-white { color: #ffffff !important; }
                .neon-credential-card .text-cyan-400, .day-mode .neon-credential-card .text-cyan-400 { color: #00f5ff !important; }
                .neon-credential-card .text-cyan-300, .day-mode .neon-credential-card .text-cyan-300 { color: #67e8f9 !important; }
                .neon-credential-card .text-white\/80, .day-mode .neon-credential-card .text-white\/80 { color: rgba(255, 255, 255, 0.8) !important; }
                .neon-credential-card .text-white\/60, .day-mode .neon-credential-card .text-white\/60 { color: rgba(255, 255, 255, 0.6) !important; }
                .neon-credential-card .text-white\/40, .day-mode .neon-credential-card .text-white\/40 { color: rgba(255, 255, 255, 0.4) !important; }
                .neon-credential-card .text-white\/30, .day-mode .neon-credential-card .text-white\/30 { color: rgba(255, 255, 255, 0.3) !important; }
                .neon-credential-card .text-white\/20, .day-mode .neon-credential-card .text-white\/20 { color: rgba(255, 255, 255, 0.2) !important; }
                
                input, option, select {
                    color: #ffffff !important;
                    background-color: #0b1329 !important;
                }
            `}</style>

            {/* HUD Background Layers */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[150px] opacity-20" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
            </div>

            {/* HEADER */}
            <div className="w-full max-w-sm relative z-10 flex justify-between items-center mb-6 animate-in fade-in slide-in-from-top-4 duration-700">
                <button 
                    onClick={() => { playNeonClick(); navigate(-1); }}
                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all shadow-inner active:scale-95 cursor-pointer"
                >
                    <ChevronLeft size={20} />
                </button>
                <div className="text-center">
                    <h1 className="text-2xl font-[1000] text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-400 to-blue-500 tracking-tighter uppercase drop-shadow-[0_0_20px_rgba(0,245,255,0.4)]">
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
                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all shadow-inner active:scale-95 cursor-pointer"
                >
                    <Share2 size={18} />
                </button>
            </div>

            {/* ═══════════ LIVE EVENT TICKER BANNER 🟢🔴 ═══════════ */}
            {client.eventPassEnabled !== false && (
                <>
                    {client.activeTicket && ticketEvent && (
                        <div className="w-full max-w-sm mb-6 relative z-10 animate-in slide-in-from-top-6 duration-500">
                            {ticketEvent.status === 'active_live' ? (
                                <div className="bg-gradient-to-r from-emerald-500/15 via-emerald-600/25 to-teal-500/15 border border-emerald-400/50 rounded-3xl p-5 shadow-[0_0_20px_rgba(16,185,129,0.2)] flex flex-col items-center justify-center relative overflow-hidden">
                                    <span className="text-[12px] font-[1000] text-emerald-400 uppercase tracking-[0.2em] text-center mb-1 animate-pulse">
                                        🟢 EVENTO ACTIVO - ENTRADA EXCLUSIVA
                                    </span>
                                    <h3 className="text-sm font-black text-white uppercase tracking-wider text-center mb-2">
                                        {ticketEvent.name}
                                    </h3>
                                    <div className="bg-emerald-500/15 border border-emerald-400/30 px-3 py-1.5 rounded-2xl text-center w-full">
                                        <span className="text-[10px] font-black text-white uppercase tracking-widest block font-mono">
                                            SECTOR: {client.activeTicket.seatSector || 'General VIP'} · FILA: {client.activeTicket.fila || '-'} · ASIENTO: {client.activeTicket.asiento || '-'}
                                        </span>
                                    </div>
                                </div>
                            ) : ticketEvent.status === 'suspended' ? (
                                <div className="bg-gradient-to-r from-red-500/15 via-red-600/25 to-rose-500/15 border border-red-400/40 rounded-3xl p-5 shadow-[0_0_20px_rgba(239,68,68,0.2)] flex flex-col items-center justify-center relative overflow-hidden">
                                    <span className="text-[12px] font-[1000] text-red-400 uppercase tracking-[0.2em] text-center mb-1 animate-bounce">
                                        🔴 EVENTO SUSPENDIDO / APLAZADO
                                    </span>
                                    <h3 className="text-sm font-black text-white uppercase tracking-wider text-center mb-2">
                                        {ticketEvent.name}
                                    </h3>
                                    <p className="text-[9px] font-black text-red-300 uppercase tracking-widest text-center animate-pulse">
                                        MÁS INFO VÍA ASISTENTE ARI 🤖
                                    </p>
                                </div>
                            ) : null}
                        </div>
                    )}

                    {!client.activeTicket && generalActiveEvent && (
                        <div className="w-full max-w-sm mb-6 relative z-10 animate-in slide-in-from-top-6 duration-500">
                            <div className="bg-gradient-to-r from-cyan-500/15 via-indigo-600/20 to-cyan-500/15 border border-cyan-400/40 rounded-3xl p-5 shadow-[0_0_20px_rgba(0,245,255,0.15)] flex flex-col items-center justify-center relative overflow-hidden animate-pulse">
                                <span className="text-[10px] font-[1000] text-cyan-400 uppercase tracking-[0.2em] text-center mb-1">
                                    ✨ EVENTO VIP DISPONIBLE EN TU ZONA
                                </span>
                                <h3 className="text-xs font-black text-white uppercase tracking-wider text-center mb-2">
                                    {generalActiveEvent.name}
                                </h3>
                                <p className="text-[8px] font-black text-cyan-300 uppercase tracking-widest text-center">
                                    Adquirí tus pases con descuento B2C consultando a Ari 🤖
                                </p>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* SELLO DE VIDA (RELÓJ EN VIVO CON SEGUNDERO INVIOLABLE) ⏱️ */}
            <div className="relative z-10 mb-8 bg-cyan-500/5 border border-cyan-500/20 px-4 py-2 rounded-2xl backdrop-blur-md flex items-center gap-4">
                <p className="text-[10px] font-black font-mono text-cyan-400 flex items-center gap-2 tracking-widest drop-shadow-[0_0_5px_rgba(0,245,255,0.3)] tabular-nums">
                    <Clock size={12} className="text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} /> {formatClock(currentTime)}
                </p>
                <div className="h-4 w-[1px] bg-cyan-500/20" />
                <button 
                    onClick={handleToggleEventReceiver}
                    className={`flex items-center gap-1.5 border-none bg-transparent font-black text-[9px] uppercase tracking-widest cursor-pointer transition-colors ${client.eventPassEnabled !== false ? 'text-green-400' : 'text-white/30'}`}
                >
                    {client.eventPassEnabled !== false ? (
                        <>
                            <Wifi size={12} className="animate-pulse" />
                            <span>ON</span>
                        </>
                    ) : (
                        <>
                            <WifiOff size={12} />
                            <span>OFF</span>
                        </>
                    )}
                </button>
            </div>

            {/* VIP CARD */}
            <div className="w-full max-w-sm relative z-10 group animate-in zoom-in duration-700 delay-100">
                {/* CELESTE NEÓN GLOW */}
                <div className="absolute -inset-1 rounded-[2.5rem] blur opacity-25" style={{ backgroundColor: isSuspended ? '#ef4444' : cardColor }}></div>
                
                <div className="relative bg-zinc-900 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
                    {/* Light electronic blue mesh background */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(0,245,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,245,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none z-0" />
                    <div className="absolute top-0 left-0 w-full h-44 opacity-20" style={{ background: `linear-gradient(135deg, ${cardColor}, transparent)` }} />
                    
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

                    <div className="p-8 pb-10 neon-credential-card">
                        <div className="flex justify-between items-start mb-8">
                            <div className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-2" style={{ borderColor: `${cardColor}4D` }}>
                                <Activity size={10} className="animate-pulse" style={{ color: cardColor }} />
                                <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: cardColor }}>SOCIO VIP ACTIVO</span>
                            </div>
                            <div className="flex items-center gap-2">
                                {isAuthorized && (
                                    <button 
                                        onClick={() => { playNeonClick(); setIsEditing(true); }}
                                        className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-white/50 hover:text-white cursor-pointer active:scale-95 transition-all"
                                        title="Editar Perfil"
                                    >
                                        <Edit2 size={14} />
                                    </button>
                                )}
                                <Star size={24} className="text-cyan-400" style={{ color: cardColor, fill: cardColor }} />
                            </div>
                        </div>

                        <div className="mb-10 relative">
                            <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.3em] mb-1">Membresía ShopDigital</p>
                            <h3 className="text-3xl font-[1000] text-white uppercase tracking-tighter leading-none mb-2">
                                {shop.name}
                            </h3>
                            <div className="flex items-center gap-2 text-white/70">
                                <MapPin size={12} style={{ color: cardColor }} />
                                <span className="text-[10px] font-bold uppercase tracking-widest leading-none mt-0.5">{shop.zone || formattedTown} · {shop.category}</span>
                            </div>
                        </div>

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
                                
                                {isAuthorized && (
                                    <button 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute inset-0 bg-black/60 opacity-0 group-hover/photo:opacity-100 flex flex-col items-center justify-center transition-opacity border-none cursor-pointer"
                                    >
                                        <Camera size={32} className="text-white mb-2" />
                                        <span className="text-[8px] font-black uppercase tracking-widest text-white">{client.photo ? 'Editar Foto' : 'Subir Foto'}</span>
                                    </button>
                                )}
                                
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

                        <div className="space-y-6 border-t border-white/5 pt-8">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[8px] font-black text-white/60 uppercase tracking-widest mb-1">Titular VIP</p>
                                    <p className="text-[20px] font-[1000] text-white tracking-tighter uppercase leading-tight">
                                        {client.name}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[8px] font-black text-white/60 uppercase tracking-widest mb-1">Nro. de Membresía (DNI)</p>
                                    <p className={`text-[15px] font-black tracking-tighter uppercase leading-tight flex items-center justify-end gap-1 ${client.dni ? 'text-white/80' : 'text-cyan-400 animate-pulse'}`}>
                                        <IdCard size={14} className="opacity-40" /> {client.dni || "COMPLETAR DNI"}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-white/[0.05] to-transparent p-5 rounded-3xl border border-white/10 flex justify-between items-center shadow-inner group/wallet">
                                <div>
                                    <label className="text-[8px] font-black text-white/60 uppercase tracking-[0.2em] mb-1 flex items-center gap-1.5">
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

                            {/* 🛰️ SINTONIZADOR DE ACCESO / EVENTOS LIVE */}
                            <div className="bg-black/60 rounded-[1.5rem] p-4.5 border border-white/10 space-y-3 relative overflow-hidden">
                                <div className="flex justify-between items-center relative z-10">
                                    <label className="text-[8px] font-black text-cyan-300 uppercase tracking-[0.2em] flex items-center gap-1.5">
                                        <Radio size={10} className="text-cyan-400 animate-pulse" /> Sintonizador de Acceso
                                    </label>
                                    <span className="text-[7.5px] font-[900] bg-cyan-500/10 border border-cyan-400/30 text-cyan-400 px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">LIVE SINFONÍA</span>
                                </div>
                                
                                {client.eventPassEnabled !== false && sintonizadorEventData ? (
                                    <div className="space-y-2 relative z-10">
                                        <p className="text-[11px] font-[1000] text-white uppercase tracking-tight leading-tight">
                                            {sintonizadorEventData.name}
                                        </p>
                                        <p className="text-[8px] font-black text-white/60 uppercase tracking-widest leading-none">
                                            {sintonizadorEventData.details}
                                        </p>
                                        <div className="flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded-xl w-fit">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                                            <span className="text-[8.5px] font-[1000] text-emerald-400 uppercase tracking-widest">
                                                {sintonizadorEventData.access}
                                            </span>
                                        </div>
                                        <p className="text-[7px] font-bold text-white/45 uppercase tracking-wider leading-relaxed">
                                            Control de Puerta: Permitir acceso y verificar DNI/Membresía.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-1 relative z-10">
                                        <p className="text-[9px] font-black text-white/45 uppercase tracking-widest italic">
                                            {client.eventPassEnabled === false ? 'Sintonizador inactivo (OFF)' : 'Buscando transmisiones...'}
                                        </p>
                                        <p className="text-[7.5px] font-bold text-white/30 uppercase tracking-wider leading-relaxed">
                                            {client.eventPassEnabled === false 
                                                ? 'Active el sintonizador arriba para recibir pases de eventos live.' 
                                                : 'Sin eventos live activos en este radar. Acceso comercial estándar.'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* QR DE VALIDACIÓN TRASACCIONAL 📡 */}
            <div className="w-full max-w-sm mt-8 p-6 bg-zinc-900 border border-white/10 rounded-[2rem] flex flex-col items-center">
                <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.4em] mb-6">Validación de Descuentos</p>
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
                    className="mt-8 w-full h-16 rounded-2xl bg-cyan-600 hover:bg-cyan-500 font-[1000] uppercase tracking-[0.2em] text-[11px] shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3 border border-white/10 text-white cursor-pointer"
                >
                    <Activity size={18} /> COMPLETAR DATOS
                </button>
            </div>

            {/* ACTION BUTTONS */}
            <div className="w-full max-w-sm mt-8 space-y-4 relative z-10 animate-in slide-in-from-bottom-4 duration-700 delay-300">
                <button 
                    onClick={() => { playNeonClick(); navigate(`/${townId}/red-comercial/ofertas`); }}
                    className="w-full h-14 rounded-2xl bg-white/5 hover:bg-white/10 text-white/80 font-black uppercase tracking-[0.2em] text-[10px] transition-all active:scale-95 border border-white/5 cursor-pointer"
                >
                    Explorar Beneficios
                </button>
                <button 
                    onClick={() => { playNeonClick(); navigate(`/${townId}/home`); }}
                    className="w-full h-14 rounded-2xl bg-white/5 hover:bg-white/10 text-white/40 font-black uppercase tracking-[0.2em] text-[10px] transition-all active:scale-95 border border-white/5 cursor-pointer"
                >
                    Volver a Inicio
                </button>
            </div>

            {/* MODAL DE EDICIÓN DEL CLIENTE VIP (AUTOGESTIÓN CIBERPUNK) 🛠️ */}
            {isEditing && isAuthorized && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setIsEditing(false)} />
                    
                    <div className="relative w-full max-w-sm bg-zinc-950 border border-cyan-500/30 rounded-[2.5rem] p-8 shadow-[0_0_50px_rgba(0,245,255,0.2)] overflow-hidden">
                        {/* Light electronic blue mesh background */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,245,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,245,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none z-0" />
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-500 animate-[scan_2s_infinite]" />
                        
                        <div className="flex justify-between items-center mb-6 relative z-10">
                            <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                                <ShieldCheck size={18} className="text-cyan-400" /> Editar Perfil VIP
                            </h3>
                            <button 
                                onClick={() => setIsEditing(false)} 
                                className="text-white/20 hover:text-white cursor-pointer active:scale-90"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveProfile} className="space-y-5 relative z-10">
                            <div>
                                <label className="text-[8px] font-black text-white/60 uppercase tracking-[0.2em] mb-2 block">Nombre del Titular</label>
                                <input 
                                    required
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-cyan-400 outline-none uppercase font-black"
                                    style={{ color: '#ffffff', backgroundColor: '#0b1329' }}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[8px] font-black text-white/60 uppercase tracking-[0.2em] mb-2 block">DNI / Membresía</label>
                                    <input 
                                        required
                                        placeholder="Ej: 41234567"
                                        value={editForm.dni}
                                        onChange={(e) => setEditForm({ ...editForm, dni: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-cyan-400 outline-none font-bold"
                                        style={{ color: '#ffffff', backgroundColor: '#0b1329' }}
                                    />
                                </div>
                                <div>
                                    <label className="text-[8px] font-black text-white/60 uppercase tracking-[0.2em] mb-2 block">WhatsApp</label>
                                    <input 
                                        required
                                        value={editForm.phone}
                                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-cyan-400 outline-none font-bold"
                                        style={{ color: '#ffffff', backgroundColor: '#0b1329' }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[8px] font-black text-white/60 uppercase tracking-[0.2em] mb-2 block">Correo Electrónico</label>
                                <input 
                                    required
                                    type="email"
                                    value={editForm.email}
                                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:border-cyan-400 outline-none"
                                    style={{ color: '#ffffff', backgroundColor: '#0b1329' }}
                                />
                            </div>

                            <div>
                                <label className="text-[8px] font-black text-white/60 uppercase tracking-[0.2em] mb-2 block">Foto de Perfil (Lightweight)</label>
                                <div className="flex gap-2 items-center">
                                    <div className="w-12 h-12 rounded-xl border border-white/10 overflow-hidden bg-white/5 flex items-center justify-center shrink-0">
                                        {editForm.photo ? (
                                            <img src={editForm.photo} className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={20} className="text-white/20" />
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-cyan-400 hover:bg-white/10 transition-all cursor-pointer active:scale-95"
                                    >
                                        Subir / Capturar Foto
                                    </button>
                                </div>
                            </div>

                            <button 
                                type="submit"
                                disabled={isSaving}
                                className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 rounded-2xl flex items-center justify-center gap-2 font-[1000] uppercase tracking-[0.2em] text-[10px] shadow-[0_5px_15px_rgba(0,245,255,0.2)] active:scale-95 transition-all text-white disabled:opacity-50 border border-white/20 cursor-pointer"
                            >
                                {isSaving ? (
                                    <div className="w-4 h-4 border-2 border-white/25 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Check size={16} />
                                        <span>Guardar Cambios</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* FOOTER INFO */}
            <p className="text-[8.5px] text-white/10 uppercase tracking-[0.4em] font-black text-center leading-[1.8] mt-12 px-8">
                Secured VIP Network · {formatClock(client.updatedAt ? new Date(client.updatedAt) : currentTime)} <br/>
                ID: {client.id}
            </p>
        </div>
    );
};

export default ClientVipCredentialPage;
