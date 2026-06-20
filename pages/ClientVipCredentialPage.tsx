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

    // Theme Mode Resolver (sincronizado con GlobalHomePage, ClientSubscriptionPage y SubscriptionPage)
    const themeMode = localStorage.getItem('global_home_theme_mode') || 'dark';
    const isDayMode = themeMode === 'light' || (themeMode === 'auto' && (() => {
        const hour = currentTime.getHours();
        return hour >= 8 && hour < 20;
    })());

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
            <div className={`min-h-screen flex flex-col items-center justify-center p-8 text-center ${isDayMode ? 'bg-[#cda488]' : 'bg-black'}`}>
                <div className={`w-12 h-12 border-4 rounded-full animate-spin mb-4 ${
                    isDayMode ? 'border-[#855b3c]/20 border-t-[#855b3c]' : 'border-cyan-500/20 border-t-cyan-500'
                }`} />
                <p className={`text-[10px] uppercase tracking-widest font-black animate-pulse ${
                    isDayMode ? 'text-[#855b3c]' : 'text-cyan-400'
                }`}>Sincronizando Identidad...</p>
            </div>
        );
    }

    if (!shop || !client) {
        return (
            <div className={`min-h-screen flex flex-col items-center justify-center p-8 text-center ${
                isDayMode ? 'bg-[#cda488] text-[#2d1e15]' : 'bg-black text-white'
            }`}>
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 animate-pulse border ${
                    isDayMode ? 'bg-white/90 border-[#cbd5e1] text-[#ef4444]' : 'bg-red-500/10 border-red-500/30 text-red-500'
                }`}>
                    <ShieldCheck size={40} />
                </div>
                <h2 className="text-xl font-black uppercase tracking-tighter mb-2">Socio No Encontrado</h2>
                <p className={`text-[10px] uppercase mb-8 leading-relaxed ${isDayMode ? 'text-[#2d1e15]/60' : 'text-white/40'}`}>
                    La credencial no pertenece a este radar o ha sido revocada.
                </p>
                <button 
                    onClick={() => navigate('/')} 
                    className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer border ${
                        isDayMode 
                            ? 'bg-white text-[#2d1e15] border-[#cbd5e1] border-b-[4px] border-b-[#cbd5e1] hover:bg-white/90 active:translate-y-[2px]' 
                            : 'bg-white/5 border-white/10 text-white hover:bg-white/10 active:scale-95'
                    }`}
                >
                    Volver al Inicio
                </button>
            </div>
        );
    }

    const isSuspended = client.status === 'suspended';
    const cardColor = '#00f5ff';
    const formattedTown = townId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    return (
        <div className={`min-h-screen p-6 relative overflow-hidden flex flex-col items-center pt-16 pb-24 selection:bg-cyan-500/30 transition-colors duration-500 ${
            isDayMode ? 'bg-[#cda488] text-[#2d1e15]' : 'bg-black text-white'
        }`}>
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
                    color: ${isDayMode ? '#2d1e15' : '#ffffff'} !important;
                    background-color: ${isDayMode ? '#faf8f5' : '#0b1329'} !important;
                }
                
                @keyframes scanner-line {
                    0% { transform: translateY(-50%); }
                    100% { transform: translateY(50%); }
                }
            `}</style>

            {/* HUD Background Layers */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className={`absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[150px] opacity-35 ${
                    isDayMode ? 'bg-amber-500/10' : 'bg-cyan-500/15'
                }`} />
                {!isDayMode ? (
                    <>
                        <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-blue-500/10 rounded-full blur-[150px] opacity-25 animate-pulse" style={{ animationDuration: '10s' }} />
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,245,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(0,245,255,0.12)_1px,transparent_1px)] bg-[size:30px_30px]" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(0,245,255,0.18)_1px,transparent_1.5px)] bg-[size:15px_15px]" />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/[0.04] to-transparent h-[200%] w-full -translate-y-1/2 animate-[scanner-line_8s_linear_infinite]" />
                    </>
                ) : (
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(140,90,50,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(140,90,50,0.03)_1px,transparent_1px)] bg-[size:30px_30px]" />
                )}
            </div>

            {/* HEADER */}
            <div className="w-full max-w-sm relative z-10 flex justify-between items-center mb-6 animate-in fade-in slide-in-from-top-4 duration-700">
                <button 
                    onClick={() => { playNeonClick(); navigate(-1); }}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border shadow-lg ${
                        isDayMode 
                            ? 'bg-white/90 border-[#cbd5e1] border-b-[4px] border-b-[#cbd5e1] text-[#2d1e15] hover:bg-white active:translate-y-[2px] active:border-b-[1px]' 
                            : 'bg-white/5 border-white/10 text-white/50 hover:text-white active:scale-95'
                    }`}
                >
                    <ChevronLeft size={20} />
                </button>
                <div className="text-center">
                    <h1 className={`text-2xl font-[1000] tracking-tighter uppercase ${
                        isDayMode 
                            ? 'text-[#2d1e15] drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]' 
                            : 'text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-400 to-blue-500 drop-shadow-[0_0_20px_rgba(0,245,255,0.4)]'
                    }`}>
                        Credencial VIP
                    </h1>
                    <p className={`text-[8px] font-[900] uppercase tracking-[0.4em] ${isDayMode ? 'text-[#855b3c]/70' : 'text-cyan-400/60'}`}>
                        Sede: {formattedTown}
                    </p>
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
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border shadow-lg ${
                        isDayMode 
                            ? 'bg-white/90 border-[#cbd5e1] border-b-[4px] border-b-[#cbd5e1] text-[#2d1e15] hover:bg-white active:translate-y-[2px] active:border-b-[1px]' 
                            : 'bg-white/5 border-white/10 text-white/50 hover:text-white active:scale-95'
                    }`}
                >
                    <Share2 size={18} />
                </button>
            </div>

            {/* Brand Avatar Section */}
            {isDayMode && (
                <div className="flex justify-center mb-4 mt-1 model-floating select-none pointer-events-none z-20">
                    <img 
                        src="/ari-pointing.png" 
                        alt="ARI Asistente Credencial" 
                        className="h-32 w-auto object-contain drop-shadow-[0_10px_15px_rgba(88,70,50,0.15)] animate-in fade-in duration-700" 
                    />
                </div>
            )}

            {/* ═══════════ LIVE EVENT TICKER BANNER 🟢🔴 ═══════════ */}
            {client.eventPassEnabled !== false && (
                <>
                    {client.activeTicket && ticketEvent && (
                        <div className="w-full max-w-sm mb-6 relative z-10 animate-in slide-in-from-top-6 duration-500">
                            {ticketEvent.status === 'active_live' ? (
                                <div className={`border rounded-3xl p-5 flex flex-col items-center justify-center relative overflow-hidden ${
                                    isDayMode 
                                        ? 'bg-emerald-500/10 border-emerald-500/30 shadow-[0_8px_20px_rgba(16,185,129,0.15)]' 
                                        : 'bg-gradient-to-r from-emerald-500/15 via-emerald-600/25 to-teal-500/15 border border-emerald-400/50 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                                }`}>
                                    <span className={`text-[12px] font-[1000] uppercase tracking-[0.2em] text-center mb-1 animate-pulse ${isDayMode ? 'text-emerald-700' : 'text-emerald-400'}`}>
                                        🟢 EVENTO ACTIVO - ENTRADA EXCLUSIVA
                                    </span>
                                    <h3 className={`text-sm font-black uppercase tracking-wider text-center mb-2 ${isDayMode ? 'text-[#2d1e15]' : 'text-white'}`}>
                                        {ticketEvent.name}
                                    </h3>
                                    <div className={`border px-3 py-1.5 rounded-2xl text-center w-full ${isDayMode ? 'bg-[#faf8f5] border-[#cbd5e1]' : 'bg-emerald-500/15 border-emerald-400/30'}`}>
                                        <span className={`text-[10px] font-black uppercase tracking-widest block font-mono ${isDayMode ? 'text-[#2d1e15]' : 'text-white'}`}>
                                            SECTOR: {client.activeTicket.seatSector || 'General VIP'} · FILA: {client.activeTicket.fila || '-'} · ASIENTO: {client.activeTicket.asiento || '-'}
                                        </span>
                                    </div>
                                </div>
                            ) : ticketEvent.status === 'suspended' ? (
                                <div className={`border rounded-3xl p-5 flex flex-col items-center justify-center relative overflow-hidden ${
                                    isDayMode 
                                        ? 'bg-red-500/10 border-red-500/30 shadow-lg' 
                                        : 'bg-gradient-to-r from-red-500/15 via-red-600/25 to-rose-500/15 border border-red-400/40 shadow-[0_0_20px_rgba(239,68,68,0.2)]'
                                }`}>
                                    <span className={`text-[12px] font-[1000] uppercase tracking-[0.2em] text-center mb-1 animate-bounce ${isDayMode ? 'text-red-700' : 'text-red-400'}`}>
                                        🔴 EVENTO SUSPENDIDO / APLAZADO
                                    </span>
                                    <h3 className={`text-sm font-black uppercase tracking-wider text-center mb-2 ${isDayMode ? 'text-[#2d1e15]' : 'text-white'}`}>
                                        {ticketEvent.name}
                                    </h3>
                                    <p className={`text-[9px] font-black uppercase tracking-widest text-center animate-pulse ${isDayMode ? 'text-red-600' : 'text-red-300'}`}>
                                        MÁS INFO VÍA ASISTENTE ARI 🤖
                                    </p>
                                </div>
                            ) : null}
                        </div>
                    )}

                    {!client.activeTicket && generalActiveEvent && (
                        <div className="w-full max-w-sm mb-6 relative z-10 animate-in slide-in-from-top-6 duration-500">
                            <div className={`border rounded-3xl p-5 flex flex-col items-center justify-center relative overflow-hidden animate-pulse ${
                                isDayMode 
                                    ? 'bg-white border-[#cbd5e1] border-b-[4px] border-b-[#cbd5e1] shadow-lg' 
                                    : 'bg-gradient-to-r from-cyan-500/15 via-indigo-600/20 to-cyan-500/15 border border-cyan-400/40 shadow-[0_0_20px_rgba(0,245,255,0.15)]'
                            }`}>
                                <span className={`text-[10px] font-[1000] uppercase tracking-[0.2em] text-center mb-1 ${isDayMode ? 'text-[#855b3c]' : 'text-cyan-400'}`}>
                                    ✨ EVENTO VIP DISPONIBLE EN TU ZONA
                                </span>
                                <h3 className={`text-xs font-black uppercase tracking-wider text-center mb-2 ${isDayMode ? 'text-[#2d1e15]' : 'text-white'}`}>
                                    {generalActiveEvent.name}
                                </h3>
                                <p className={`text-[8px] font-black uppercase tracking-widest text-center ${isDayMode ? 'text-[#855b3c]/85' : 'text-cyan-300'}`}>
                                    Adquirí tus pases con descuento B2C consultando a Ari 🤖
                                </p>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* SELLO DE VIDA */}
            <div className={`relative z-10 mb-8 border px-4 py-2 rounded-2xl backdrop-blur-md flex items-center gap-4 transition-all ${
                isDayMode 
                    ? 'bg-white/80 border-[#cbd5e1] border-b-[4px] border-b-[#cbd5e1] shadow-sm text-[#2d1e15]' 
                    : 'bg-cyan-500/5 border-cyan-500/20 text-cyan-400'
            }`}>
                <p className={`text-[10px] font-black font-mono flex items-center gap-2 tracking-widest tabular-nums ${
                    isDayMode ? 'text-[#2d1e15]' : 'text-cyan-400 drop-shadow-[0_0_5px_rgba(0,245,255,0.3)]'
                }`}>
                    <Clock size={12} className={`animate-spin ${isDayMode ? 'text-[#855b3c]' : 'text-cyan-400'}`} style={{ animationDuration: '8s' }} /> {formatClock(currentTime)}
                </p>
                <div className={`h-4 w-[1px] ${isDayMode ? 'bg-[#cbd5e1]' : 'bg-cyan-500/20'}`} />
                <button 
                    onClick={handleToggleEventReceiver}
                    className={`flex items-center gap-1.5 border-none bg-transparent font-black text-[9px] uppercase tracking-widest cursor-pointer transition-colors ${
                        client.eventPassEnabled !== false ? 'text-green-600' : 'text-white/30'
                    }`}
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
                <div className={`absolute -inset-1 rounded-[2.5rem] blur opacity-25 ${isDayMode ? 'bg-[#855b3c]/20' : ''}`} style={isDayMode ? {} : { backgroundColor: isSuspended ? '#ef4444' : cardColor }}></div>
                
                <div className={`relative border-2 rounded-[2.5rem] overflow-hidden shadow-2xl transition-all ${
                    isDayMode 
                        ? 'bg-white/85 border-[#855b3c] border-b-[8px] border-b-[#855b3c]' 
                        : 'bg-zinc-900 border-cyan-500/30 border-b-[8px] border-b-cyan-500/50'
                }`}>
                    {/* Background structures */}
                    {!isDayMode ? (
                        <>
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,245,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,245,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none z-0" />
                            <div className="absolute top-0 left-0 w-full h-44 opacity-20" style={{ background: `linear-gradient(135deg, ${cardColor}, transparent)` }} />
                        </>
                    ) : (
                        <div className="absolute top-0 left-0 w-full h-44 opacity-10 bg-gradient-to-br from-[#cda488] to-transparent pointer-events-none" />
                    )}
                    
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
                            <div className={`px-3 py-1.5 rounded-full flex items-center gap-2 border ${
                                isDayMode 
                                    ? 'bg-[#cda488]/15 border-[#a88d75]/30 text-[#855b3c]' 
                                    : 'bg-white/5 border-white/10'
                            }`} style={isDayMode ? {} : { borderColor: `${cardColor}4D` }}>
                                <Activity size={10} className="animate-pulse" style={isDayMode ? { color: '#855b3c' } : { color: cardColor }} />
                                <span className="text-[9px] font-black uppercase tracking-widest" style={isDayMode ? { color: '#855b3c' } : { color: cardColor }}>SOCIO VIP ACTIVO</span>
                            </div>
                            <div className="flex items-center gap-2">
                                {isAuthorized && (
                                    <button 
                                        onClick={() => { playNeonClick(); setIsEditing(true); }}
                                        className={`p-1.5 rounded-lg border transition-all cursor-pointer active:scale-95 ${
                                            isDayMode 
                                                ? 'bg-white/80 border-[#cbd5e1] border-b-[3px] text-[#2d1e15] hover:bg-white' 
                                                : 'bg-white/5 border-white/10 text-white/50 hover:text-white'
                                        }`}
                                        title="Editar Perfil"
                                    >
                                        <Edit2 size={14} />
                                    </button>
                                )}
                                <Star size={24} className={isDayMode ? 'text-[#855b3c]' : 'text-cyan-400'} style={isDayMode ? { fill: '#855b3c', color: '#855b3c' } : { color: cardColor, fill: cardColor }} />
                            </div>
                        </div>

                        <div className="mb-10 relative">
                            <p className={`text-[10px] font-black uppercase tracking-[0.3em] mb-1 ${isDayMode ? 'text-[#5c4033]/60' : 'text-white/60'}`}>Membresía ShopDigital</p>
                            <h3 className={`text-3xl font-[1000] uppercase tracking-tighter leading-none mb-2 ${isDayMode ? 'text-[#2d1e15]' : 'text-white'}`}>
                                {shop.name}
                            </h3>
                            <div className={`flex items-center gap-2 ${isDayMode ? 'text-[#5c4033]/80' : 'text-white/70'}`}>
                                <MapPin size={12} style={isDayMode ? { color: '#855b3c' } : { color: cardColor }} />
                                <span className="text-[10px] font-bold uppercase tracking-widest leading-none mt-0.5">{shop.zone || formattedTown} · {shop.category}</span>
                            </div>
                        </div>

                        <div className={`w-full aspect-square border rounded-[2rem] flex flex-col items-center justify-center p-8 mb-8 relative overflow-hidden group/photo ${
                            isDayMode ? 'bg-[#faf8f5] border-[#cbd5e1]' : 'bg-white/[0.03] border-white/10'
                        }`}>
                            <div className="absolute inset-0" style={{ background: isDayMode ? '' : `radial-gradient(circle at center, ${cardColor}1A, transparent 70%)` }} />
                            
                            <div className="relative w-40 h-40 rounded-full border-2 p-1 shadow-2xl overflow-hidden group-hover/photo:scale-105 transition-transform duration-500" 
                                 style={isDayMode ? { borderColor: '#cbd5e1', backgroundColor: '#faf8f5' } : { borderColor: `${cardColor}4D`, backgroundColor: `${cardColor}0D` }}>
                                {client.photo ? (
                                    <img src={client.photo} className="w-full h-full object-cover rounded-full" alt={client.name} />
                                ) : (
                                    <div className="w-full h-full rounded-full bg-white/5 flex flex-col items-center justify-center opacity-40">
                                        <User size={80} style={isDayMode ? { color: '#855b3c' } : { color: cardColor }} />
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

                            <div className={`mt-8 border px-5 py-2 rounded-2xl ${isDayMode ? 'bg-[#cda488]/10 border-[#a88d75]/30' : 'bg-zinc-950/80 border-white/10'}`}>
                                <p className={`text-[10px] font-black tracking-[0.3em] flex items-center gap-2 ${isDayMode ? 'text-[#2d1e15]' : 'text-white'}`}>
                                    <CheckCircle2 size={12} className="text-green-600" /> IDENTIDAD VERIFICADA
                                </p>
                            </div>
                        </div>

                        <div className="space-y-6 border-t border-white/5 pt-8">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className={`text-[8px] font-black uppercase tracking-widest mb-1 ${isDayMode ? 'text-[#5c4033]/60' : 'text-white/60'}`}>Titular VIP</p>
                                    <p className={`text-[20px] font-[1000] tracking-tighter uppercase leading-tight ${isDayMode ? 'text-[#2d1e15]' : 'text-white'}`}>
                                        {client.name}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className={`text-[8px] font-black uppercase tracking-widest mb-1 ${isDayMode ? 'text-[#5c4033]/60' : 'text-white/60'}`}>Nro. de Membresía (DNI)</p>
                                    <p className={`text-[15px] font-black tracking-tighter uppercase leading-tight flex items-center justify-end gap-1 ${
                                        isDayMode ? 'text-[#2d1e15]' : client.dni ? 'text-white/80' : 'text-cyan-400 animate-pulse'
                                    }`}>
                                        <IdCard size={14} className="opacity-40" /> {client.dni || "COMPLETAR DNI"}
                                    </p>
                                </div>
                            </div>

                            <div className={`border p-5 rounded-3xl flex justify-between items-center shadow-inner group/wallet ${
                                isDayMode ? 'bg-[#faf8f5] border-[#cbd5e1]' : 'bg-gradient-to-br from-white/[0.05] to-transparent border-white/10'
                            }`}>
                                <div>
                                    <label className={`text-[8px] font-black uppercase tracking-[0.2em] mb-1 flex items-center gap-1.5 ${isDayMode ? 'text-[#5c4033]/70' : 'text-white/60'}`}>
                                        <Wallet size={10} style={isDayMode ? { color: '#855b3c' } : { color: cardColor }} /> Créditos ShopDigital
                                    </label>
                                    <p className={`text-2xl font-[1000] font-inter tabular-nums ${isDayMode ? 'text-[#2d1e15]' : 'text-white'}`}>
                                        {client.credits || 0}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className={`inline-block px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${
                                        isDayMode 
                                            ? 'bg-[#cda488]/20 border-[#a88d75]/30 text-[#855b3c]' 
                                            : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
                                    }`}>
                                        DISPONIBLES
                                    </div>
                                </div>
                            </div>

                            {/* 🛰️ SINTONIZADOR DE ACCESO / EVENTOS LIVE */}
                            <div className={`rounded-[2.5rem] p-6 border space-y-4 relative overflow-hidden ${
                                isDayMode 
                                    ? 'bg-[#faf8f5] border-[#cbd5e1] shadow-inner text-[#2d1e15]' 
                                    : 'bg-black/80 border-white/15 shadow-[inset_0_0_20px_rgba(0,245,255,0.15)]'
                            }`}>
                                <div className="flex justify-between items-center relative z-10">
                                    <label className={`text-[9px] font-black uppercase tracking-[0.25em] flex items-center gap-2 ${isDayMode ? 'text-[#855b3c]' : 'text-cyan-300'}`}>
                                        <Radio size={12} className={`animate-pulse ${isDayMode ? 'text-[#855b3c]' : 'text-cyan-400'}`} /> Sintonizador de Acceso
                                    </label>
                                    <span className={`text-[8px] font-[900] border px-3 py-1.5 rounded-full uppercase tracking-wider animate-pulse ${
                                        isDayMode 
                                            ? 'bg-[#cda488]/20 border-[#a88d75]/40 text-[#855b3c]' 
                                            : 'bg-cyan-500/20 border-cyan-400/40 text-cyan-400'
                                    }`}>
                                        LIVE SINFONÍA
                                    </span>
                                </div>
                                
                                {client.eventPassEnabled !== false && sintonizadorEventData ? (
                                    <div className="space-y-3.5 relative z-10">
                                        <p className={`text-[13px] font-[1000] uppercase tracking-tight leading-snug ${isDayMode ? 'text-[#2d1e15]' : 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.25)]'}`}>
                                            {sintonizadorEventData.name}
                                        </p>
                                        <p className={`text-[9px] font-black uppercase tracking-widest leading-relaxed ${isDayMode ? 'text-[#855b3c]' : 'text-cyan-300'}`}>
                                            {sintonizadorEventData.details}
                                        </p>
                                        <div className={`flex items-center gap-2 border px-3 py-1.5 rounded-xl w-fit ${
                                            isDayMode ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-500/20 border-emerald-500/40'
                                        }`}>
                                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                                            <span className="text-[9px] font-[1000] text-emerald-600 uppercase tracking-widest">
                                                {sintonizadorEventData.access}
                                            </span>
                                        </div>
                                        <p className={`text-[7.5px] font-bold uppercase tracking-widest leading-relaxed ${isDayMode ? 'text-[#2d1e15]/50' : 'text-white/50'}`}>
                                            Control de Puerta: Permitir acceso y verificar DNI/Membresía.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-2 relative z-10">
                                        <p className={`text-[10px] font-black uppercase tracking-widest italic ${isDayMode ? 'text-[#2d1e15]/50' : 'text-white/50'}`}>
                                            {client.eventPassEnabled === false ? 'Sintonizador inactivo (OFF)' : 'Buscando transmisiones...'}
                                        </p>
                                        <p className={`text-[8px] font-bold uppercase tracking-wider leading-relaxed ${isDayMode ? 'text-[#2d1e15]/40' : 'text-white/40'}`}>
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

            {/* QR DE VALIDACIÓN TRASACCIONAL */}
            <div className={`w-full max-w-sm mt-8 p-6 border-2 rounded-[2rem] flex flex-col items-center shadow-2xl ${
                isDayMode 
                    ? 'bg-white/85 border-[#855b3c] border-b-[8px] border-b-[#855b3c]' 
                    : 'bg-zinc-900 border-cyan-500/30 border-b-[8px] border-b-cyan-500/50'
            }`}>
                <p className={`text-[10px] font-black uppercase tracking-[0.4em] mb-6 ${isDayMode ? 'text-[#2d1e15]/60' : 'text-white/60'}`}>Validación de Descuentos</p>
                <div className="bg-white p-4 rounded-2xl shadow-2xl relative group/qr">
                    <QrCode size={160} className="text-black transition-transform group-hover/qr:scale-105 duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/qr:opacity-100 transition-opacity pointer-events-none">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg border border-zinc-100">
                             <Star size={24} style={isDayMode ? { color: '#855b3c', fill: '#855b3c' } : { color: cardColor, fill: cardColor }} />
                        </div>
                    </div>
                </div>
                
                <button 
                    onClick={() => { playNeonClick(); navigate(`/${townId}/validar/${client.id}`); }}
                    className={`mt-8 w-full h-16 rounded-2xl font-[1000] uppercase tracking-[0.2em] text-[11px] transition-all flex items-center justify-center gap-3 border-2 cursor-pointer ${
                        isDayMode 
                            ? 'bg-gradient-to-b from-[#b58866] to-[#9c7151] hover:from-[#c29673] hover:to-[#a87c5b] text-white border-[#5c4033] border-b-[8px] border-b-[#472f22] shadow-[0_10px_25px_rgba(140,90,50,0.2)] active:translate-y-[4px] active:border-b-[2px]' 
                            : 'bg-cyan-600 hover:bg-cyan-500 text-white border-cyan-400 border-b-[8px] border-b-cyan-800 shadow-lg active:scale-95 active:translate-y-[4px]'
                    }`}
                >
                    <Activity size={18} /> COMPLETAR DATOS
                </button>
            </div>

            {/* ACTION BUTTONS */}
            <div className="w-full max-w-sm mt-8 space-y-4 relative z-10 animate-in slide-in-from-bottom-4 duration-700 delay-300">
                <button 
                    onClick={() => { playNeonClick(); navigate(`/${townId}/red-comercial/ofertas`); }}
                    className={`w-full h-14 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all border-2 cursor-pointer ${
                        isDayMode 
                            ? 'bg-[#faf8f5] hover:bg-white border-[#855b3c] border-b-[6px] border-b-[#734b2f] text-[#2d1e15] active:translate-y-[4px] active:border-b-[2px]' 
                            : 'bg-[#0b1329] hover:bg-[#0b1329]/80 text-white border-cyan-500/30 border-b-[6px] border-b-cyan-600/50 active:translate-y-[4px] active:border-b-[2px]'
                    }`}
                >
                    Explorar Beneficios
                </button>
                <button 
                    onClick={() => { playNeonClick(); navigate(`/${townId}/home`); }}
                    className={`w-full h-14 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all border-2 cursor-pointer ${
                        isDayMode 
                            ? 'bg-[#faf8f5] hover:bg-white border-[#855b3c] border-b-[6px] border-b-[#734b2f] text-[#2d1e15] active:translate-y-[4px] active:border-b-[2px]' 
                            : 'bg-[#0b1329] hover:bg-[#0b1329]/80 text-white border-cyan-500/30 border-b-[6px] border-b-cyan-600/50 active:translate-y-[4px] active:border-b-[2px]'
                    }`}
                >
                    Volver a Inicio
                </button>
            </div>

            {/* MODAL DE EDICIÓN DEL CLIENTE VIP */}
            {isEditing && isAuthorized && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setIsEditing(false)} />
                    
                    <div className={`relative w-full max-w-sm rounded-[2.5rem] p-8 overflow-hidden border shadow-2xl ${
                        isDayMode 
                            ? 'bg-white border-[#cbd5e1] border-b-[6px] border-b-[#cbd5e1] text-[#2d1e15]' 
                            : 'bg-zinc-950 border-cyan-500/30 text-white'
                    }`}>
                        {!isDayMode && (
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,245,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,245,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none z-0" />
                        )}
                        
                        <div className="flex justify-between items-center mb-6 relative z-10">
                            <h3 className={`text-xs font-black uppercase tracking-widest flex items-center gap-2 ${
                                isDayMode ? 'text-[#855b3c]' : 'text-white'
                            }`}>
                                <ShieldCheck size={18} className={isDayMode ? 'text-[#855b3c]' : 'text-cyan-400'} /> Editar Perfil VIP
                            </h3>
                            <button 
                                onClick={() => setIsEditing(false)} 
                                className={`cursor-pointer active:scale-90 border-none bg-transparent ${isDayMode ? 'text-black/40 hover:text-black' : 'text-white/20 hover:text-white'}`}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveProfile} className="space-y-5 relative z-10">
                            <div>
                                <label className={`text-[8px] font-black uppercase tracking-[0.2em] mb-2 block ${isDayMode ? 'text-[#2d1e15]/60' : 'text-white/60'}`}>Nombre del Titular</label>
                                <input 
                                    required
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                    className={`w-full border p-3 text-sm rounded-xl focus:outline-none uppercase font-black ${
                                        isDayMode 
                                            ? 'bg-[#faf8f5] text-[#2d1e15] border-[#cbd5e1] focus:border-[#a88d75]' 
                                            : 'bg-white/5 border border-white/10 text-white focus:border-cyan-400'
                                    }`}
                                    style={isDayMode ? { color: '#2d1e15', backgroundColor: '#faf8f5' } : { color: '#ffffff', backgroundColor: '#0b1329' }}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={`text-[8px] font-black uppercase tracking-[0.2em] mb-2 block ${isDayMode ? 'text-[#2d1e15]/60' : 'text-white/60'}`}>DNI / Membresía</label>
                                    <input 
                                        required
                                        placeholder="Ej: 41234567"
                                        value={editForm.dni}
                                        onChange={(e) => setEditForm({ ...editForm, dni: e.target.value })}
                                        className={`w-full border p-3 text-sm rounded-xl focus:outline-none font-bold ${
                                            isDayMode 
                                                ? 'bg-[#faf8f5] text-[#2d1e15] border-[#cbd5e1] focus:border-[#a88d75]' 
                                                : 'bg-white/5 border border-white/10 text-white focus:border-cyan-400'
                                        }`}
                                        style={isDayMode ? { color: '#2d1e15', backgroundColor: '#faf8f5' } : { color: '#ffffff', backgroundColor: '#0b1329' }}
                                    />
                                </div>
                                <div>
                                    <label className={`text-[8px] font-black uppercase tracking-[0.2em] mb-2 block ${isDayMode ? 'text-[#2d1e15]/60' : 'text-white/60'}`}>WhatsApp</label>
                                    <input 
                                        required
                                        value={editForm.phone}
                                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                        className={`w-full border p-3 text-sm rounded-xl focus:outline-none font-bold ${
                                            isDayMode 
                                                ? 'bg-[#faf8f5] text-[#2d1e15] border-[#cbd5e1] focus:border-[#a88d75]' 
                                                : 'bg-white/5 border border-white/10 text-white focus:border-cyan-400'
                                        }`}
                                        style={isDayMode ? { color: '#2d1e15', backgroundColor: '#faf8f5' } : { color: '#ffffff', backgroundColor: '#0b1329' }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className={`text-[8px] font-black uppercase tracking-[0.2em] mb-2 block ${isDayMode ? 'text-[#2d1e15]/60' : 'text-white/60'}`}>Correo Electrónico</label>
                                <input 
                                    required
                                    type="email"
                                    value={editForm.email}
                                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                    className={`w-full border p-3 text-xs rounded-xl focus:outline-none ${
                                        isDayMode 
                                            ? 'bg-[#faf8f5] text-[#2d1e15] border-[#cbd5e1] focus:border-[#a88d75]' 
                                            : 'bg-white/5 border border-white/10 text-white focus:border-cyan-400'
                                    }`}
                                    style={isDayMode ? { color: '#2d1e15', backgroundColor: '#faf8f5' } : { color: '#ffffff', backgroundColor: '#0b1329' }}
                                />
                            </div>

                            <div>
                                <label className={`text-[8px] font-black uppercase tracking-[0.2em] mb-2 block ${isDayMode ? 'text-[#2d1e15]/60' : 'text-white/60'}`}>Foto de Perfil</label>
                                <div className="flex gap-2 items-center">
                                    <div className={`w-12 h-12 rounded-xl border overflow-hidden flex items-center justify-center shrink-0 ${
                                        isDayMode ? 'bg-[#faf8f5] border-[#cbd5e1]' : 'bg-white/5 border-white/10'
                                    }`}>
                                        {editForm.photo ? (
                                            <img src={editForm.photo} className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={20} className={isDayMode ? 'text-[#2d1e15]/20' : 'text-white/20'} />
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className={`flex-1 py-3 border rounded-xl text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer active:scale-95 ${
                                            isDayMode 
                                                ? 'bg-white/80 border-[#cbd5e1] border-b-[3px] border-b-[#cbd5e1] text-[#2d1e15] hover:bg-white hover:border-[#a88d75]' 
                                                : 'bg-white/5 border border-white/10 text-cyan-400 hover:bg-white/10'
                                        }`}
                                    >
                                        Subir Foto
                                    </button>
                                </div>
                            </div>

                            <button 
                                type="submit"
                                disabled={isSaving}
                                className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-[1000] uppercase tracking-[0.2em] text-[10px] border transition-all cursor-pointer ${
                                    isDayMode 
                                        ? 'bg-gradient-to-b from-[#b58866] to-[#9c7151] text-white border-[#855b3c] border-b-[4px] border-b-[#734b2f] active:translate-y-[2px]' 
                                        : 'bg-cyan-600 hover:bg-cyan-500 text-white border-white/20 border-b-[4px] border-b-cyan-800 active:scale-95'
                                } disabled:opacity-50`}
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
            <p className={`text-[8.5px] uppercase tracking-[0.4em] font-black text-center leading-[1.8] mt-12 px-8 ${
                isDayMode ? 'text-[#2d1e15]/40' : 'text-white/50'
            }`}>
                Secured VIP Network · {formatClock(client.updatedAt ? new Date(client.updatedAt) : currentTime)} <br/>
                ID: {client.id}
            </p>
        </div>
    );
};

export default ClientVipCredentialPage;
