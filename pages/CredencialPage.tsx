import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Shop, Client, LiveEvent } from '../types';
import { db, suscribirseAEventos, registrarIntrusionBunker } from '../firebase';
import { useAuth } from '../components/AuthContext';
import { transaccionarCreditos } from '../firebaseVIP';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { QRCodeCanvas } from 'qrcode.react';
import {
    ChevronLeft, Star, QrCode, ShieldCheck, Clock, IdCard,
    Wallet, CreditCard, ArrowUpRight, ArrowDownRight,
    CheckCircle, XCircle, Search, User, Store, MapPin, Zap, Lock, Radio
} from 'lucide-react';
import { playNeonClick, playSuccessSound } from '../utils/audio';

interface CredencialPageProps {
    allShops: Shop[];
}

const CredencialPage: React.FC<CredencialPageProps> = ({ allShops }) => {
    const { townId = 'esteban-echeverria', categorySlug, shopSlug } = useParams<{
        townId: string; categorySlug: string; shopSlug: string;
    }>();
    const navigate = useNavigate();

    // Auth gating
    const { user, role, status, login, logoutUser, loading: authLoading } = useAuth();

    // --- Shop ---
    const selectedShop = useMemo(() =>
        allShops.find(shop => (shop.slug || shop.id) === shopSlug),
    [shopSlug, allShops]);

    // Dynamic Neon color scheme based on node type
    const isEnterprise = selectedShop?.entityType === 'enterprise';
    const neonColor = isEnterprise ? '#8b5cf6' : '#2563eb'; // Violeta vs Azul
    const borderGradient = isEnterprise
        ? 'from-purple-500 via-fuchsia-500 to-violet-500'
        : 'from-blue-500 via-indigo-500 to-cyan-500';
    const cardGlowStyle = isEnterprise
        ? 'shadow-[0_0_50px_rgba(139,92,246,0.45)] hover:shadow-[0_0_65px_rgba(139,92,246,0.65)]'
        : 'shadow-[0_0_50px_rgba(37,99,235,0.45)] hover:shadow-[0_0_65px_rgba(37,99,235,0.65)]';

    // --- Live Event Listener ---
    const [liveEvents, setLiveEvents] = useState<LiveEvent[]>([]);
    useEffect(() => {
        const unsubscribe = suscribirseAEventos((events) => {
            setLiveEvents(events);
        });
        return () => unsubscribe();
    }, []);

    // Active/Suspended event matching this locality & role 'comerciante'
    const activeEvent = useMemo(() => {
        const requiredRole = isEnterprise ? 'empresario' : 'comerciante';
        return liveEvents.find(e => 
            (e.status === 'active_live' || e.status === 'suspended') &&
            (e.targetRegion === townId || e.targetLocalities.includes('all')) &&
            e.targetRoles.includes(requiredRole)
        );
    }, [liveEvents, townId, isEnterprise]);

    // --- Clock ---
    const [currentTime, setCurrentTime] = useState(new Date());
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);
    
    const formatClock = (d: Date) => {
        const dateStr = d.toLocaleDateString('es-AR');
        const hourStr = d.toLocaleTimeString('es-AR', { hour12: false });
        return `${dateStr} - ${hourStr}`;
    };

    // --- POSNET State ---
    const [posnetOpen, setPosnetOpen] = useState(false);
    const [posnetMode, setPosnetMode] = useState<'load' | 'spend'>('load');
    const [clients, setClients] = useState<Client[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [amount, setAmount] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [txStatus, setTxStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');

    // Fetch clients when POSNET opens
    useEffect(() => {
        if (!posnetOpen) return;
        const fetchClients = async () => {
            try {
                const snap = await getDocs(query(collection(db, 'clientes'), where('townId', '==', townId)));
                setClients(snap.docs.map(d => ({ id: d.id, ...d.data() } as Client)));
            } catch (err) { console.error(err); }
        };
        fetchClients();
    }, [posnetOpen, townId]);

    const filteredClients = useMemo(() => {
        if (!searchTerm.trim()) return [];
        const t = searchTerm.toLowerCase();
        return clients.filter(c =>
            c.name?.toLowerCase().includes(t) || c.dni?.toLowerCase().includes(t) || c.phone?.includes(t)
        ).slice(0, 6);
    }, [clients, searchTerm]);

    const handleTransaction = async () => {
        if (!selectedClient || !amount || !selectedShop) return;
        const num = parseInt(amount);
        if (isNaN(num) || num <= 0) return;

        if (posnetMode === 'spend' && (selectedClient.credits || 0) < num) {
            setErrorMsg(`Saldo insuficiente (${selectedClient.credits || 0} créditos)`);
            setTxStatus('error');
            return;
        }

        setIsProcessing(true);
        setTxStatus('idle');
        try {
            const desc = posnetMode === 'load'
                ? `+${num} créditos por compra en ${selectedShop.name}`
                : `-${num} créditos canjeados en ${selectedShop.name}`;
            const newBalance = await transaccionarCreditos(selectedClient.id, selectedShop.id, num, posnetMode, desc);
            setSelectedClient(prev => prev ? { ...prev, credits: newBalance } : null);
            setTxStatus('success');
            playSuccessSound();
            setAmount('');
        } catch (err) {
            console.error(err);
            setErrorMsg('Error en la transacción');
            setTxStatus('error');
        } finally {
            setIsProcessing(false);
        }
    };

    const resetPosnet = () => {
        setSelectedClient(null);
        setSearchTerm('');
        setAmount('');
        setTxStatus('idle');
        setErrorMsg('');
    };

    // Validation URL
    const validationUrl = useMemo(() =>
        `${window.location.origin}/${townId}/${categorySlug}/${shopSlug}/validar`,
    [townId, categorySlug, shopSlug]);

    // Permissions Gating Check
    const userEmail = user?.email?.trim().toLowerCase() || null;
    const isDG = userEmail === 'walyconexion@gmail.com';
    const isAmbassador = (role === 'admin' || role === 'ambassador') && status === 'active';
    const isShopOwner = userEmail && (
        userEmail === selectedShop?.gmail?.trim().toLowerCase() ||
        userEmail === selectedShop?.authorizedEmail?.trim().toLowerCase()
    );
    const isAuthorized = isDG || isAmbassador || isShopOwner;

    // Log intrusion to Bunker if unauthorized
    useEffect(() => {
        if (user && !isAuthorized && !authLoading) {
            registrarIntrusionBunker(userEmail).catch(console.error);
        }
    }, [user, isAuthorized, authLoading, userEmail]);

    if (!selectedShop) return null;

    // Loading State
    if (authLoading) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-t-2 border-indigo-400 rounded-full animate-spin shadow-[0_0_15px_rgba(99,102,241,0.3)]" />
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest animate-pulse">Autenticando Credencial...</span>
                </div>
            </div>
        );
    }

    // Unauthenticated State
    if (!user) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 relative overflow-hidden">
                <div className="fixed inset-0 pointer-events-none z-0">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.05),transparent_60%)]" />
                </div>
                
                <div className="w-full max-w-sm bg-zinc-950/40 border border-indigo-500/20 rounded-[2.5rem] p-8 backdrop-blur-xl relative z-10 shadow-[0_0_50px_rgba(99,102,241,0.1)]">
                    <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6 border border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.2)] mx-auto">
                        <Lock size={24} className="text-indigo-400 animate-pulse" />
                    </div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tighter text-center mb-1">Credencial Protegida</h2>
                    <p className="text-[9px] font-bold text-indigo-400/60 uppercase tracking-widest text-center mb-8">Requiere Verificación de Identidad B2B</p>

                    <button
                        onClick={() => { playNeonClick(); login(); }}
                        className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-black uppercase tracking-[0.15em] py-4.5 rounded-2xl active:scale-95 transition-all shadow-[0_0_25px_rgba(99,102,241,0.25)] flex items-center justify-center gap-3 text-xs"
                    >
                        <User size={16} /> Iniciar Sesión con Google
                    </button>
                    
                    <button
                        onClick={() => { playNeonClick(); navigate(-1); }}
                        className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 hover:text-white font-bold uppercase tracking-wider py-3.5 rounded-2xl active:scale-95 transition-all mt-4 text-xs"
                    >
                        Volver
                    </button>
                </div>
            </div>
        );
    }

    // Unauthorized Access State (Gated)
    if (!isAuthorized) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 relative overflow-hidden">
                <div className="fixed inset-0 pointer-events-none z-0">
                    <div className="absolute inset-0 bg-red-950/10 pointer-events-none" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />
                </div>
                
                <div className="w-full max-w-sm bg-red-950/20 border border-red-500/30 rounded-[2.5rem] p-8 backdrop-blur-xl relative z-10 shadow-[0_0_50px_rgba(239,68,68,0.1)]">
                    <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6 border border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.2)] mx-auto">
                        <Zap size={24} className="text-red-500 animate-bounce" />
                    </div>
                    <h2 className="text-xl font-black text-red-500 uppercase tracking-tighter text-center mb-2">Acceso Denegado</h2>
                    <p className="text-[10px] font-bold text-red-400/80 uppercase tracking-widest leading-relaxed text-center mb-6">
                        SU CORREO <span className="font-mono text-white select-all">{user.email}</span> NO TIENE PERMISO PARA VER ESTA CREDENCIAL DE COMERCIO.
                    </p>
                    <p className="text-[8px] text-white/40 uppercase tracking-widest leading-normal mb-8 border-l-2 border-red-500/30 pl-3">
                        El protocolo de seguridad Doberman ha registrado este evento.
                    </p>

                    <button
                        onClick={() => { playNeonClick(); logoutUser(); }}
                        className="w-full bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-[0.15em] py-4 rounded-2xl active:scale-95 transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)] text-xs"
                    >
                        Cerrar Sesión / Cambiar Cuenta
                    </button>
                    
                    <button
                        onClick={() => { playNeonClick(); navigate(-1); }}
                        className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 hover:text-white font-bold uppercase tracking-wider py-3.5 rounded-2xl active:scale-95 transition-all mt-4 text-[10px]"
                    >
                        Volver
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020208] flex flex-col items-center px-6 py-8 relative overflow-hidden selection:bg-indigo-500/30">
            {/* HUD Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-indigo-500/18 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
                <div className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-cyan-500/18 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '6s' }} />
                <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-purple-500/5 rounded-full blur-[120px]" />
                {/* Tech Grid Mesh */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.18)_1px,transparent_1px)] bg-[size:30px_30px]" />
                {/* Tech Dots Mesh */}
                <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(34,211,238,0.22)_1px,transparent_1.5px)] bg-[size:15px_15px]" />
                {/* Scanline Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/[0.03] to-transparent h-[200%] w-full -translate-y-1/2 animate-[scanner-line_8s_linear_infinite]" />
            </div>

            {/* Back Button */}
            <button onClick={() => { playNeonClick(); navigate(-1); }}
                className="self-start mb-6 w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/20 hover:border-indigo-400/60 hover:shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-all z-10">
                <ChevronLeft size={20} />
            </button>

            {/* ═══════════ LIVE EVENT TICKER BANNER 🟢🔴 ═══════════ */}
            {activeEvent && (
                <div className="w-full max-w-sm mb-6 relative z-10 animate-in slide-in-from-top-6 duration-500">
                    {activeEvent.status === 'active_live' ? (
                        <div className="bg-gradient-to-r from-emerald-500/15 via-emerald-600/20 to-teal-500/15 border border-emerald-400/40 rounded-3xl p-5 shadow-[0_0_20px_rgba(16,185,129,0.15)] flex flex-col items-center justify-center relative overflow-hidden animate-pulse">
                            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(16,185,129,0.05)_25%,rgba(16,185,129,0.05)_50%,transparent_50%,transparent_75%,rgba(16,185,129,0.05)_75%)] bg-[size:40px_40px] animate-[scan_6s_linear_infinite]" />
                            <span className="text-[12px] font-[1000] text-emerald-400 uppercase tracking-[0.25em] text-center mb-1">
                                🟢 EVENTO ACTIVO EN REGIONAL
                            </span>
                            <h3 className="text-sm font-black text-white uppercase tracking-wider text-center mb-2">
                                {activeEvent.name}
                            </h3>
                            <div className="bg-emerald-500/25 border border-emerald-400/30 px-4 py-1.5 rounded-full text-center">
                                <span className="text-[9px] font-black text-emerald-300 uppercase tracking-widest block">
                                    🎫 BENEFICIO EXCLUSIVO: ENTRADA GRATIS
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gradient-to-r from-red-500/15 via-red-600/25 to-rose-500/15 border border-red-400/40 rounded-3xl p-5 shadow-[0_0_20px_rgba(239,68,68,0.15)] flex flex-col items-center justify-center relative overflow-hidden">
                            <span className="text-[12px] font-[1000] text-red-400 uppercase tracking-[0.25em] text-center mb-1">
                                🔴 EVENTO SUSPENDIDO / APLAZADO
                            </span>
                            <h3 className="text-sm font-black text-white uppercase tracking-wider text-center mb-2">
                                {activeEvent.name}
                            </h3>
                            <p className="text-[8px] font-black text-red-300 uppercase tracking-widest animate-pulse">
                                MÁS INFO VÍA ASISTENTE ARI 🤖
                            </p>
                        </div>
                    )}
                </div>
            )}

            <div className="w-full max-w-sm relative z-10">
                <div className={`bg-gradient-to-br ${borderGradient} rounded-[2.5rem] p-[2px] transition-all duration-500 ${cardGlowStyle}`}>
                    <div className="bg-[#060614]/95 rounded-[2.4rem] p-8 flex flex-col items-center relative overflow-hidden border border-white/10 backdrop-blur-2xl neon-credential-card">
                        {/* Dynamic electronic mesh background */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(37,99,235,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(37,99,235,0.05)_1px,transparent_1px)] bg-[size:25px_25px] pointer-events-none z-0" style={{ backgroundImage: `linear-gradient(${neonColor}0D 1px, transparent 1px), linear-gradient(90deg, ${neonColor}0D 1px, transparent 1px)` }} />
                        
                        {/* Ambient glow */}
                        <div className="absolute top-0 right-0 w-48 h-48 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none opacity-20" style={{ backgroundColor: neonColor }} />
                        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full -ml-16 -mb-16 blur-3xl pointer-events-none opacity-15" style={{ backgroundColor: isEnterprise ? '#a855f7' : '#06b6d4' }} />

                        {/* SELLO DE VIDA INVIOLABLE CON SEGUNDEROS ⏱️ */}
                        <div className={`w-full flex flex-col items-center justify-center gap-1 mb-6 py-3 px-4 rounded-2xl relative overflow-hidden border-2 transition-all ${isEnterprise ? 'bg-purple-500/15 border-purple-400/40 shadow-[inset_0_0_15px_rgba(139,92,246,0.25),0_0_20px_rgba(139,92,246,0.2)]' : 'bg-blue-500/15 border-blue-400/40 shadow-[inset_0_0_15px_rgba(37,99,235,0.25),0_0_20px_rgba(37,99,235,0.2)]'}`}>
                            <div className="absolute top-0 left-0 w-full h-[1px] bg-cyan-400/80 animate-[scan_2s_infinite_ease-in-out]" />
                            <div className="flex items-center gap-2 relative z-10">
                                <Clock size={13} className="animate-spin" style={{ animationDuration: '4s', color: isEnterprise ? '#c084fc' : '#22d3ee' }} />
                                <span className="text-[12px] font-black font-mono text-cyan-300 tracking-[0.15em] tabular-nums drop-shadow-[0_0_8px_rgba(34,211,238,0.7)]">
                                    {formatClock(currentTime)}
                                </span>
                            </div>
                            <span className="text-[7px] font-[900] text-cyan-400/80 uppercase tracking-[0.25em] relative z-10 animate-pulse">Sello de Seguridad Activo</span>
                        </div>

                        {/* ownerPhoto / Shop Image - Biométrica Circular */}
                        <div className={`relative w-24 h-24 rounded-full p-0.5 mb-5 flex-shrink-0 bg-gradient-to-br ${isEnterprise ? 'from-purple-400 to-fuchsia-500 shadow-[0_0_30px_rgba(139,92,246,0.4)]' : 'from-blue-400 to-cyan-500 shadow-[0_0_30px_rgba(37,99,235,0.4)]'}`}>
                            <div className="w-full h-full bg-zinc-950 rounded-full overflow-hidden flex items-center justify-center p-0.5 border border-black/40">
                                {selectedShop.ownerPhoto ? (
                                    <img src={selectedShop.ownerPhoto} alt={selectedShop.ownerName} className="w-full h-full object-cover rounded-full" />
                                ) : selectedShop.image ? (
                                    <img src={selectedShop.image} alt={selectedShop.name} className="w-full h-full object-cover rounded-full" />
                                ) : (
                                    <User size={36} className={isEnterprise ? 'text-purple-400/30' : 'text-blue-400/30'} />
                                )}
                            </div>
                        </div>

                        {/* Shop Name */}
                        <h2 className="text-xl font-[1000] text-white uppercase tracking-tight mb-1 text-center leading-tight drop-shadow-[0_0_12px_rgba(255,255,255,0.2)]">
                            {selectedShop.name}
                        </h2>
                        <p className="text-[8px] font-black text-cyan-400/60 uppercase tracking-widest mb-4 text-center">
                            {selectedShop.specialty || selectedShop.category}
                        </p>

                        {/* Badge */}
                        <div className={`flex items-center gap-2 mb-6 px-5 py-2 rounded-full border transition-all ${isEnterprise ? 'bg-purple-500/20 border-purple-400/50 shadow-[0_0_20px_rgba(139,92,246,0.3)] text-purple-200' : 'bg-blue-500/20 border-blue-400/50 shadow-[0_0_20px_rgba(37,99,235,0.3)] text-blue-200'}`}>
                            <ShieldCheck className={`w-4 h-4 drop-shadow-[0_0_5px_rgba(255,255,255,0.4)] ${isEnterprise ? 'text-purple-300' : 'text-blue-300'}`} />
                            <span className={`text-[9px] font-[1000] uppercase tracking-[0.2em] ${isEnterprise ? 'text-purple-200' : 'text-blue-200'}`}>{isEnterprise ? 'Empresa Industrial Verificada' : 'Comercio Verificado'}</span>
                        </div>

                        {/* Data Grid */}
                        <div className="w-full grid grid-cols-2 gap-3 mb-6">
                            <div className={`bg-black/60 rounded-2xl p-3.5 border transition-all ${isEnterprise ? 'border-purple-500/30 shadow-[0_0_15px_rgba(139,92,246,0.1)]' : 'border-blue-500/30 shadow-[0_0_15px_rgba(37,99,235,0.1)]'}`}>
                                <p className="text-[7px] font-black uppercase tracking-widest mb-1" style={{ color: `${neonColor}99` }}>Titular</p>
                                <p className="text-[11px] font-[1000] text-white uppercase tracking-tight truncate drop-shadow-[0_0_5px_rgba(255,255,255,0.4)]">
                                    {selectedShop.ownerName || 'Sin Registrar'}
                                </p>
                            </div>
                            <div className={`bg-black/60 rounded-2xl p-3.5 border transition-all ${isEnterprise ? 'border-purple-500/30 shadow-[0_0_15px_rgba(139,92,246,0.1)]' : 'border-blue-500/30 shadow-[0_0_15px_rgba(37,99,235,0.1)]'}`}>
                                <p className="text-[7px] font-black uppercase tracking-widest mb-1" style={{ color: `${neonColor}99` }}>{isEnterprise ? 'ID Empresa' : 'ID Comercio'}</p>
                                <p className="text-[11px] font-[1000] text-cyan-400 tracking-tight truncate drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">
                                    {selectedShop.shopNumber || selectedShop.id.slice(0, 8).toUpperCase()}
                                </p>
                            </div>
                            <div className={`bg-black/60 rounded-2xl p-3.5 border transition-all col-span-2 ${isEnterprise ? 'border-purple-500/30 shadow-[0_0_15px_rgba(139,92,246,0.1)]' : 'border-blue-500/30 shadow-[0_0_15px_rgba(37,99,235,0.1)]'}`}>
                                <p className="text-[7px] font-black uppercase tracking-widest mb-1 flex items-center gap-1" style={{ color: `${neonColor}99` }}>
                                    <MapPin size={8} className="text-cyan-400" /> Dirección
                                </p>
                                <p className="text-[10px] font-bold text-white/80 truncate">{selectedShop.address}</p>
                            </div>
                        </div>

                        {/* QR Code */}
                        <div className={`w-full bg-black/75 rounded-[2.2rem] p-6 flex flex-col items-center border-2 mb-6 relative group/qr overflow-hidden transition-all ${isEnterprise ? 'border-purple-500/40 shadow-[0_0_30px_rgba(139,92,246,0.2),inset_0_0_20px_rgba(139,92,246,0.15)]' : 'border-blue-500/40 shadow-[0_0_30px_rgba(37,99,235,0.2),inset_0_0_20px_rgba(37,99,235,0.15)]'}`}>
                            {/* Scanning Laser Line */}
                            <div className="absolute left-0 right-0 h-[2px] bg-cyan-400/80 shadow-[0_0_12px_rgba(34,211,238,0.8)] animate-[scan-laser_3s_infinite_linear] pointer-events-none z-20" />
                            
                            {/* Corner Scanner brackets */}
                            <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-cyan-400 pointer-events-none" />
                            <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-cyan-400 pointer-events-none" />
                            <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-cyan-400 pointer-events-none" />
                            <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-cyan-400 pointer-events-none" />

                            <div className="bg-white p-4.5 rounded-2xl mb-4 shadow-[0_0_35px_rgba(255,255,255,0.1)] relative z-10 border-2" style={{ borderColor: isEnterprise ? '#c084fc4D' : '#3b82f64D' }}>
                                <QRCodeCanvas
                                    value={validationUrl}
                                    size={140}
                                    level="H"
                                    includeMargin={false}
                                    imageSettings={{
                                        src: selectedShop.image || '',
                                        x: undefined, y: undefined,
                                        height: 28, width: 28, excavate: true,
                                    }}
                                />
                            </div>
                            <p className="text-[9px] font-black text-cyan-400 uppercase tracking-[0.25em] drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">Código de Validación</p>
                        </div>

                        {/* 🛰️ SINTONIZADOR DE ACCESO / EVENTOS LIVE */}
                        <div className="w-full bg-black/60 rounded-[1.5rem] p-4.5 border border-white/10 space-y-3 relative overflow-hidden mb-6 z-10">
                            <div className="flex justify-between items-center relative z-10">
                                <label className="text-[8px] font-black text-cyan-300 uppercase tracking-[0.2em] flex items-center gap-1.5">
                                    <Radio size={10} className="text-cyan-400 animate-pulse" /> Sintonizador de Acceso
                                </label>
                                <span className="text-[7.5px] font-[900] bg-cyan-500/10 border border-cyan-400/30 text-cyan-400 px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">LIVE SINFONÍA</span>
                            </div>
                            
                            {activeEvent ? (
                                <div className="space-y-2 relative z-10">
                                    <p className="text-[11px] font-[1000] text-white uppercase tracking-tight leading-tight">
                                        {activeEvent.name}
                                    </p>
                                    <p className="text-[8px] font-black text-white/60 uppercase tracking-widest leading-none">
                                        ARTISTA: {activeEvent.artist || 'Red ShopDigital'} · LOCALIDAD: {activeEvent.targetLocalities.join(', ').toUpperCase()}
                                    </p>
                                    <div className="flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded-xl w-fit">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                                        <span className="text-[8.5px] font-[1000] text-emerald-400 uppercase tracking-widest">
                                            {isEnterprise ? 'ACCESO INDUSTRIAL VERIFICADO' : 'ACCESO COMERCIO VERIFICADO'}
                                        </span>
                                    </div>
                                    <p className="text-[7px] font-bold text-white/45 uppercase tracking-wider leading-relaxed">
                                        Seguridad: Permitir el ingreso al personal asociado acreditado.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-1 relative z-10">
                                    <p className="text-[9px] font-black text-white/45 uppercase tracking-widest italic">
                                        Buscando transmisiones...
                                    </p>
                                    <p className="text-[7.5px] font-bold text-white/30 uppercase tracking-wider leading-relaxed">
                                        Sin eventos live activos para este nodo en este radar.
                                    </p>
                                </div>
                            )}
                        </div>
 
                        {/* Status */}
                        <div className="w-full flex justify-between items-center text-white/90 text-[9px] font-black uppercase tracking-[0.2em] border-t pt-4" style={{ borderColor: `${neonColor}33` }}>
                            <span className="text-white/70">Membresía Activa</span>
                            <span className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)] font-black">
                                {selectedShop.isActive ? '⚡ ACTIVA' : '⏳ PENDIENTE'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══════════ POSNET INTEGRADO ═══════════ */}
            <div className="w-full max-w-sm mt-8 relative z-10 space-y-4">
                {!posnetOpen ? (
                    <button
                        onClick={() => { playNeonClick(); setPosnetOpen(true); }}
                        className="w-full h-20 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 rounded-3xl flex flex-col items-center justify-center gap-1.5 font-black uppercase tracking-[0.2em] text-[11px] shadow-[0_10px_30px_rgba(99,102,241,0.3)] active:scale-95 transition-all text-white border border-white/10 relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />
                        <CreditCard size={22} />
                        <span>💳 Abrir POSNET de Créditos</span>
                    </button>
                ) : (
                    <div className="bg-zinc-900/80 border border-indigo-500/20 rounded-[2rem] p-6 space-y-5 backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <CreditCard size={14} /> POSNET de Créditos
                            </h3>
                            <button onClick={() => { playNeonClick(); setPosnetOpen(false); resetPosnet(); }}
                                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/30 hover:text-white/60 border border-white/10 text-[12px]">✕</button>
                        </div>

                        {/* Mode Selector */}
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => { playNeonClick(); setPosnetMode('load'); setTxStatus('idle'); }}
                                className={`py-3 rounded-xl font-black uppercase tracking-widest text-[9px] border transition-all active:scale-95 flex flex-col items-center gap-1
                                    ${posnetMode === 'load'
                                        ? 'bg-green-500/15 border-green-400 text-green-300 shadow-[0_0_15px_rgba(34,197,94,0.2)]'
                                        : 'bg-white/5 border-white/10 text-white/40'}`}
                            >
                                <ArrowUpRight size={16} />
                                Cargar
                            </button>
                            <button
                                onClick={() => { playNeonClick(); setPosnetMode('spend'); setTxStatus('idle'); }}
                                className={`py-3 rounded-xl font-black uppercase tracking-widest text-[9px] border transition-all active:scale-95 flex flex-col items-center gap-1
                                    ${posnetMode === 'spend'
                                        ? 'bg-red-500/15 border-red-400 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                                        : 'bg-white/5 border-white/10 text-white/40'}`}
                            >
                                <ArrowDownRight size={16} />
                                Descontar
                            </button>
                        </div>

                        {/* Client Search or Selected */}
                        {!selectedClient ? (
                            <div className="space-y-2">
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        placeholder="Buscar socio (nombre, DNI, tel)..."
                                        className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-[11px] font-bold text-white placeholder:text-white/20 focus:border-indigo-500/40 outline-none"
                                        autoFocus
                                    />
                                    <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20" />
                                </div>
                                {filteredClients.map(c => (
                                    <button key={c.id}
                                        onClick={() => { playNeonClick(); setSelectedClient(c); setSearchTerm(''); setTxStatus('idle'); }}
                                        className="w-full bg-black/30 border border-white/5 hover:border-indigo-500/30 rounded-lg p-2.5 flex items-center gap-2.5 transition-all active:scale-[0.98]"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center overflow-hidden flex-shrink-0 border border-white/10">
                                            {c.photo ? <img src={c.photo} className="w-full h-full object-cover rounded-full" alt="" /> : <User size={12} className="text-white/30" />}
                                        </div>
                                        <div className="flex-1 text-left min-w-0">
                                            <p className="text-[10px] font-black text-white uppercase tracking-wider truncate">{c.name}</p>
                                            <p className="text-[7px] text-white/30">{c.dni || 'Sin DNI'} · 💰 {c.credits || 0}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {/* Selected Client Mini-Card */}
                                <div className="bg-black/40 border border-indigo-500/15 rounded-xl p-3 flex items-center gap-3 relative">
                                    <button onClick={() => { playNeonClick(); resetPosnet(); }}
                                        className="absolute top-2 right-2 text-white/20 hover:text-white/50 text-[10px]">✕</button>
                                    <div className="w-10 h-10 rounded-full border border-indigo-500/20 overflow-hidden bg-white/5 flex-shrink-0">
                                        {selectedClient.photo ? <img src={selectedClient.photo} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center"><User size={16} className="text-white/20" /></div>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-black text-white uppercase tracking-wider truncate">{selectedClient.name}</p>
                                        <p className="text-[8px] text-indigo-400">Saldo: <span className="font-[1000] tabular-nums">{selectedClient.credits || 0}</span> créditos</p>
                                    </div>
                                </div>

                                {/* Amount */}
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={e => setAmount(e.target.value)}
                                        placeholder="0"
                                        className={`w-full bg-black/40 border rounded-xl p-3 text-[22px] font-[1000] placeholder:text-white/5 focus:outline-none tabular-nums text-center
                                            ${posnetMode === 'load' ? 'border-green-500/20 text-green-400' : 'border-red-500/20 text-red-400'}`}
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-black text-white/20 uppercase tracking-widest">CRÉDITOS</span>
                                </div>

                                {/* Status */}
                                {txStatus === 'success' && (
                                    <div className="bg-green-500/10 border border-green-500/30 p-3 rounded-xl flex items-center gap-3">
                                        <CheckCircle size={18} className="text-green-400 flex-shrink-0" />
                                        <div>
                                            <p className="text-[10px] font-[1000] text-green-400 uppercase tracking-widest">
                                                {posnetMode === 'load' ? '✅ Créditos Cargados' : '✅ Descuento Aplicado'}
                                            </p>
                                            <p className="text-[8px] text-white/40">Nuevo saldo: {selectedClient.credits}</p>
                                        </div>
                                    </div>
                                )}
                                {txStatus === 'error' && (
                                    <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-xl flex items-center gap-3">
                                        <XCircle size={18} className="text-red-400 flex-shrink-0" />
                                        <p className="text-[9px] font-black text-red-400">{errorMsg}</p>
                                    </div>
                                )}

                                {/* Action Button */}
                                <button
                                    onClick={handleTransaction}
                                    disabled={isProcessing || !amount}
                                    className={`w-full h-14 rounded-2xl flex items-center justify-center gap-2 font-black uppercase tracking-[0.15em] text-[10px] active:scale-95 transition-all border border-white/10 disabled:opacity-30 disabled:grayscale
                                        ${posnetMode === 'load'
                                            ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-[0_8px_20px_rgba(34,197,94,0.2)]'
                                            : 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-[0_8px_20px_rgba(239,68,68,0.2)]'}`}
                                >
                                    {isProcessing
                                        ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        : <>
                                            {posnetMode === 'load' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                                            {posnetMode === 'load' ? 'Otorgar Créditos' : 'Confirmar Descuento'}
                                        </>
                                    }
                                </button>

                                {txStatus === 'success' && (
                                    <button onClick={() => { playNeonClick(); resetPosnet(); }}
                                        className="w-full h-10 rounded-xl bg-white/5 border border-white/10 text-white/40 font-black uppercase tracking-widest text-[8px] active:scale-95 transition-all">
                                        Nueva Transacción
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Navigation Buttons */}
            <div className="w-full max-w-sm mt-6 space-y-3 relative z-10">
                <button
                    onClick={() => { playNeonClick(); navigate(`/${townId}/${categorySlug}/${shopSlug}/panel-autogestion`); }}
                    className="w-full h-12 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 font-black uppercase tracking-[0.2em] text-[9px] transition-all active:scale-95 border border-cyan-400/40 shadow-[0_0_15px_rgba(34,211,238,0.2)] flex items-center justify-center gap-2"
                >
                    <Store size={14} className="text-cyan-400" /> Panel de Autogestión
                </button>
                <button
                    onClick={() => { playNeonClick(); navigate(`/${townId}/home`); }}
                    className="w-full h-12 rounded-2xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 font-black uppercase tracking-[0.2em] text-[9px] transition-all active:scale-95 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.15)] flex items-center justify-center"
                >
                    Volver a Inicio
                </button>
            </div>

            {/* Footer */}
            <div className="mt-10 flex flex-col items-center gap-2 relative z-10">
                <p className="text-[8px] font-black text-indigo-400/60 uppercase tracking-[0.4em] text-center px-12 leading-loose">
                    Security ID: SHOP-{selectedShop.id.slice(0, 8).toUpperCase()}
                </p>
                <div className="flex items-center gap-4">
                    <div className="h-[1px] w-8 bg-indigo-500/40" />
                    <span className="text-[7px] font-bold text-white/40 uppercase tracking-[0.8em]">ShopDigital.tech</span>
                    <div className="h-[1px] w-8 bg-indigo-500/40" />
                </div>
            </div>
            
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes scan-laser {
                    0% { top: 5%; }
                    50% { top: 95%; }
                    100% { top: 5%; }
                }
                @keyframes scan {
                    0% { background-position: 0% 0%; }
                    100% { background-position: 0% 100%; }
                }
                @keyframes scanner-line {
                    0% { transform: translateY(-50%); }
                    100% { transform: translateY(50%); }
                }
                /* Enforce bright colors inside the neon credential card (day-mode bypass) */
                .neon-credential-card .text-white, .day-mode .neon-credential-card .text-white { color: #ffffff !important; }
                .neon-credential-card .text-cyan-400, .day-mode .neon-credential-card .text-cyan-400 { color: #22d3ee !important; }
                .neon-credential-card .text-cyan-300, .day-mode .neon-credential-card .text-cyan-300 { color: #67e8f9 !important; }
                .neon-credential-card .text-indigo-400, .day-mode .neon-credential-card .text-indigo-400 { color: #818cf8 !important; }
                .neon-credential-card .text-indigo-300, .day-mode .neon-credential-card .text-indigo-300 { color: #a5b4fc !important; }
                .neon-credential-card .text-indigo-200, .day-mode .neon-credential-card .text-indigo-200 { color: #c7d2fe !important; }
                .neon-credential-card .text-white\/80, .day-mode .neon-credential-card .text-white\/80 { color: rgba(255, 255, 255, 0.8) !important; }
                .neon-credential-card .text-white\/60, .day-mode .neon-credential-card .text-white\/60 { color: rgba(255, 255, 255, 0.6) !important; }
                .neon-credential-card .text-white\/40, .day-mode .neon-credential-card .text-white\/40 { color: rgba(255, 255, 255, 0.4) !important; }
                .neon-credential-card .text-white\/30, .day-mode .neon-credential-card .text-white\/30 { color: rgba(255, 255, 255, 0.3) !important; }
                .neon-credential-card .text-white\/20, .day-mode .neon-credential-card .text-white\/20 { color: rgba(255, 255, 255, 0.2) !important; }
                .neon-credential-card .text-cyan-400\/60, .day-mode .neon-credential-card .text-cyan-400\/60 { color: rgba(34, 211, 238, 0.6) !important; }
                .neon-credential-card .text-cyan-400\/80, .day-mode .neon-credential-card .text-cyan-400\/80 { color: rgba(34, 211, 238, 0.8) !important; }
                .neon-credential-card .text-indigo-400\/50, .day-mode .neon-credential-card .text-indigo-400\/50 { color: rgba(129, 140, 248, 0.5) !important; }
                .neon-credential-card .text-indigo-400\/60, .day-mode .neon-credential-card .text-indigo-400\/60 { color: rgba(129, 140, 248, 0.6) !important; }
            `}} />
        </div>
    );
};

export default CredencialPage;
