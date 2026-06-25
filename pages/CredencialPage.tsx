import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Shop, Client, LiveEvent } from '../types';
import { db, suscribirseAEventos, registrarIntrusionBunker } from '../firebase';
import { useAuth } from '../components/AuthContext';
import { transaccionarCreditos } from '../firebaseVIP';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { QRCodeCanvas } from 'qrcode.react';
import {
    ChevronLeft, ArrowLeft, Moon, Sun, Share2, Star, QrCode, ShieldCheck, Clock, IdCard,
    Wallet, CreditCard, ArrowUpRight, ArrowDownRight,
    CheckCircle, XCircle, Search, User, Store, MapPin, Zap, Lock, Radio,
    Camera, Edit2, Check, X
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

    const [shop, setShop] = useState<Shop | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editForm, setEditForm] = useState({
        name: '',
        ownerName: '',
        shopNumber: '',
        gmail: '',
        phone: '',
        address: ''
    });

    useEffect(() => {
        if (selectedShop) {
            setShop(selectedShop);
            setEditForm({
                name: selectedShop.name || '',
                ownerName: selectedShop.ownerName || '',
                shopNumber: selectedShop.shopNumber || selectedShop.id.slice(0, 8).toUpperCase(),
                gmail: selectedShop.gmail || selectedShop.authorizedEmail || '',
                phone: selectedShop.phone || '',
                address: selectedShop.address || ''
            });
        }
    }, [selectedShop]);

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
        if (!file || !selectedShop) return;

        setIsUploading(true);
        try {
            const compressed = await compressImage(file);
            const { doc, updateDoc } = await import('firebase/firestore');
            const shopRef = doc(db, 'comercios', selectedShop.id);
            await updateDoc(shopRef, { 
                ownerPhoto: compressed,
                updatedAt: new Date().toISOString()
            });
            setShop(prev => prev ? { ...prev, ownerPhoto: compressed } : null);
            playSuccessSound();
        } catch (err) {
            console.error("Error subiendo foto:", err);
            alert("Error al cargar y comprimir la foto.");
        } finally {
            setIsUploading(false);
        }
    };

    // Save profile from edit panel
    const handleSaveShopProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedShop) return;
        playNeonClick();
        setIsSaving(true);
        try {
            const updatedData = {
                name: editForm.name.toUpperCase().trim(),
                ownerName: editForm.ownerName.trim(),
                shopNumber: editForm.shopNumber.trim(),
                gmail: editForm.gmail.trim().toLowerCase(),
                phone: editForm.phone.replace(/\D/g, ''),
                address: editForm.address.trim()
            };
            const { doc, updateDoc } = await import('firebase/firestore');
            const shopRef = doc(db, 'comercios', selectedShop.id);
            await updateDoc(shopRef, {
                ...updatedData,
                updatedAt: new Date().toISOString()
            });
            setShop(prev => prev ? { ...prev, ...updatedData } : null);
            setIsEditing(false);
            playSuccessSound();
        } catch (err) {
            console.error("Error guardando datos del comercio:", err);
            alert("Hubo un error al guardar los cambios.");
        } finally {
            setIsSaving(false);
        }
    };

    // Dynamic Neon color scheme based on node type
    const isEnterprise = selectedShop?.entityType === 'enterprise';
    const neonColor = isEnterprise ? '#8b5cf6' : '#2563eb';
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

    // Fallback/Mock event data for sintonizador
    const sintonizadorEventData = useMemo(() => {
        if (activeEvent) {
            return {
                name: activeEvent.name,
                details: `ARTISTA: ${activeEvent.artist || 'Red ShopDigital'} · LOCALIDAD: ${activeEvent.targetLocalities.join(', ').toUpperCase()}`,
                access: isEnterprise ? 'ACCESO INDUSTRIAL VERIFICADO' : 'ACCESO COMERCIO VERIFICADO',
                isLive: true
            };
        }
        return {
            name: "Gala & Business Networking - Esteban Echeverría 🎷",
            details: "ARTISTA: GUSTAVO DIAZ QUINTET · CONEXIÓN B2B DIRECTA",
            access: isEnterprise ? 'ACCESO INDUSTRIAL VERIFICADO' : 'ACCESO COMERCIO VERIFICADO',
            isLive: false
        };
    }, [activeEvent, isEnterprise]);

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

    // Theme Mode Resolver (sincronizado con GlobalHomePage, ClientSubscriptionPage, SubscriptionPage y ClientVipCredentialPage)
    const [isDayMode, setIsDayMode] = useState(() => {
        const themeMode = localStorage.getItem('global_home_theme_mode') || 'dark';
        return themeMode === 'light' || (themeMode === 'auto' && (() => {
            const hour = new Date().getHours();
            return hour >= 8 && hour < 20;
        })());
    });

    const toggleTheme = () => {
        playNeonClick();
        const nextMode = isDayMode ? 'dark' : 'light';
        localStorage.setItem('global_home_theme_mode', nextMode);
        window.dispatchEvent(new Event('theme_change'));
        setIsDayMode(!isDayMode);
    };

    // Listen for changes from other pages
    useEffect(() => {
        const handleThemeChange = () => {
            const themeMode = localStorage.getItem('global_home_theme_mode') || 'dark';
            setIsDayMode(themeMode === 'light' || (themeMode === 'auto' && (() => {
                const hour = new Date().getHours();
                return hour >= 8 && hour < 20;
            })()));
        };
        window.addEventListener('theme_change', handleThemeChange);
        return () => window.removeEventListener('theme_change', handleThemeChange);
    }, []);

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
            <div className={`min-h-screen flex flex-col items-center justify-center p-8 ${isDayMode ? 'bg-[#cda488]' : 'bg-black'}`}>
                <div className="flex flex-col items-center gap-4">
                    <div className={`w-12 h-12 border-t-2 rounded-full animate-spin ${
                        isDayMode ? 'border-t-[#855b3c] border-[#cbd5e1]' : 'border-t-indigo-400 border-indigo-500/20'
                    }`} />
                    <span className={`text-[10px] font-bold uppercase tracking-widest animate-pulse ${
                        isDayMode ? 'text-[#855b3c]' : 'text-indigo-400'
                    }`}>Autenticando Credencial...</span>
                </div>
            </div>
        );
    }

    // Unauthenticated State
    if (!user) {
        return (
            <div className={`min-h-screen flex flex-col items-center justify-center p-8 relative overflow-hidden ${
                isDayMode ? 'bg-[#cda488]' : 'bg-black'
            }`}>
                <div className="fixed inset-0 pointer-events-none z-0">
                    <div className={`absolute inset-0 ${isDayMode ? 'bg-amber-500/5' : 'bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.05),transparent_60%)]'}`} />
                </div>
                
                <div className={`w-full max-w-sm rounded-[2.5rem] p-8 border relative z-10 ${
                    isDayMode 
                        ? 'bg-white/85 border-[#cbd5e1] border-b-[6px] border-b-[#cbd5e1]' 
                        : 'bg-zinc-950/40 border-indigo-500/20 shadow-[0_0_50px_rgba(99,102,241,0.1)] backdrop-blur-xl'
                }`}>
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border mx-auto ${
                        isDayMode ? 'bg-[#cda488]/20 border-[#a88d75]/30' : 'bg-indigo-500/10 border-indigo-500/30'
                    }`}>
                        <Lock size={24} className={`animate-pulse ${isDayMode ? 'text-[#855b3c]' : 'text-indigo-400'}`} />
                    </div>
                    <h2 className={`text-xl font-black uppercase tracking-tighter text-center mb-1 ${isDayMode ? 'text-[#2d1e15]' : 'text-white'}`}>Credencial Protegida</h2>
                    <p className={`text-[9px] font-bold uppercase tracking-widest text-center mb-8 ${isDayMode ? 'text-[#855b3c]/70' : 'text-indigo-400/60'}`}>Requiere Verificación de Identidad B2B</p>

                    <button
                        onClick={() => { playNeonClick(); login(); }}
                        className="w-full h-14 text-[10px] font-[1100] uppercase tracking-[0.2em] btn-3d-celeste flex items-center justify-center gap-3 shadow-lg cursor-pointer"
                    >
                        <User size={16} /> Iniciar Sesión con Google
                    </button>
                    
                    <button
                        onClick={() => { playNeonClick(); navigate(`/${townId}/home`); }}
                        className="w-full h-14 text-[10px] font-[1100] uppercase tracking-[0.2em] btn-3d-celeste flex items-center justify-center shadow-md cursor-pointer mt-4"
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
            <div className={`min-h-screen flex flex-col items-center justify-center p-8 relative overflow-hidden ${
                isDayMode ? 'bg-[#cda488]' : 'bg-black'
            }`}>
                <div className="fixed inset-0 pointer-events-none z-0">
                    <div className="absolute inset-0 bg-red-950/10 pointer-events-none" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />
                </div>
                
                <div className={`w-full max-w-sm rounded-[2.5rem] p-8 border relative z-10 ${
                    isDayMode 
                        ? 'bg-white/85 border-[#cbd5e1] border-b-[6px] border-b-[#cbd5e1]' 
                        : 'bg-red-950/20 border-red-500/30 backdrop-blur-xl shadow-[0_0_50px_rgba(239,68,68,0.1)]'
                }`}>
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border mx-auto ${
                        isDayMode ? 'bg-red-500/20 border-red-500/30' : 'bg-red-500/10 border-red-500/30'
                    }`}>
                        <Zap size={24} className="text-red-500 animate-bounce" />
                    </div>
                    <h2 className="text-xl font-black text-red-500 uppercase tracking-tighter text-center mb-2">Acceso Denegado</h2>
                    <p className={`text-[10px] font-bold uppercase tracking-widest leading-relaxed text-center mb-6 ${
                        isDayMode ? 'text-[#2d1e15]/85' : 'text-red-400/80'
                    }`}>
                        SU CORREO <span className="font-mono text-black select-all bg-[#faf8f5] px-1.5 py-0.5 rounded border border-black/5">{user.email}</span> NO TIENE PERMISO PARA VER ESTA CREDENCIAL DE COMERCIO.
                    </p>
                    <p className={`text-[8px] uppercase tracking-widest leading-normal mb-8 border-l-2 pl-3 ${
                        isDayMode ? 'text-black/50 border-red-400' : 'text-white/40 border-red-500/30'
                    }`}>
                        El protocolo de seguridad Doberman ha registrado este evento.
                    </p>

                    <button
                        onClick={() => { playNeonClick(); logoutUser(); }}
                        className="w-full h-14 text-[10px] font-[1100] uppercase tracking-[0.15em] btn-3d-celeste flex items-center justify-center shadow-lg cursor-pointer"
                    >
                        Cerrar Sesión / Cambiar Cuenta
                    </button>
                    
                    <button
                        onClick={() => { playNeonClick(); navigate(`/${townId}/home`); }}
                        className="w-full h-14 text-[10px] font-[1100] uppercase tracking-[0.2em] btn-3d-celeste flex items-center justify-center shadow-md cursor-pointer mt-4"
                    >
                        Volver
                    </button>
                </div>
            </div>
        );
    }

    const formattedTown = townId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    return (
        <div className={`min-h-screen flex flex-col items-center px-6 py-8 relative overflow-hidden selection:bg-indigo-500/30 transition-colors duration-500 ${
            isDayMode ? 'bg-[#cda488] text-[#2d1e15]' : 'bg-[#020208] text-white'
        }`}>
            {/* HUD Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className={`absolute top-0 right-0 w-[450px] h-[450px] rounded-full blur-[120px] animate-pulse ${
                    isDayMode ? 'bg-amber-500/10' : 'bg-indigo-500/18'
                }`} style={{ animationDuration: '8s' }} />
                {!isDayMode ? (
                    <>
                        <div className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-cyan-500/18 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '6s' }} />
                        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-purple-500/5 rounded-full blur-[120px]" />
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.18)_1px,transparent_1px)] bg-[size:30px_30px]" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(34,211,238,0.22)_1px,transparent_1.5px)] bg-[size:15px_15px]" />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/[0.03] to-transparent h-[200%] w-full -translate-y-1/2 animate-[scanner-line_8s_linear_infinite]" />
                    </>
                ) : (
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(140,90,50,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(140,90,50,0.03)_1px,transparent_1px)] bg-[size:30px_30px]" />
                )}
            </div>

            {/* HEADER */}
            <div className="w-full max-w-sm relative z-10 flex justify-between items-center mb-6 gap-3 animate-in fade-in slide-in-from-top-4 duration-700">
                <button 
                    onClick={() => { playNeonClick(); navigate(`/${townId}/home`); }}
                    className="w-10 h-10 rounded-xl flex items-center justify-center btn-3d-celeste shadow-lg transition-all cursor-pointer"
                    aria-label="Regresar"
                >
                    <ArrowLeft size={18} style={isDayMode ? { color: '#083344' } : { color: '#22d3ee' }} strokeWidth={3} />
                </button>
                <div className="text-center flex-1">
                    <h1 className={`text-[19px] font-[1000] tracking-tighter uppercase leading-tight ${
                        isDayMode 
                            ? 'text-[#2d1e15] drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]' 
                            : 'text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-400 to-blue-500 drop-shadow-[0_0_20px_rgba(0,245,255,0.4)]'
                    }`}>
                        Credencial VIP Comercio
                    </h1>
                    <p className={`text-[7px] font-[900] uppercase tracking-[0.3em] ${isDayMode ? 'text-[#855b3c]/70' : 'text-cyan-400/60'}`}>
                        Sede: {formattedTown}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={toggleTheme}
                        aria-label="Alternar modo de color"
                        className="w-10 h-10 rounded-xl flex items-center justify-center btn-3d-celeste shadow-lg transition-all cursor-pointer"
                    >
                        {isDayMode ? <Moon size={16} style={{ color: '#083344' }} /> : <Sun size={16} style={{ color: '#22d3ee' }} />}
                    </button>
                    <button 
                        onClick={() => {
                            playNeonClick();
                            if (navigator.share) {
                                navigator.share({
                                    title: `Credencial VIP de ${selectedShop.name}`,
                                    text: `Mirá la Credencial VIP de ${selectedShop.name} en ShopDigital`,
                                    url: window.location.href,
                                 });
                            }
                        }}
                        className="w-10 h-10 rounded-xl flex items-center justify-center btn-3d-celeste shadow-lg transition-all cursor-pointer"
                        aria-label="Compartir"
                    >
                        <Share2 size={16} style={isDayMode ? { color: '#083344' } : { color: '#22d3ee' }} />
                    </button>
                </div>
            </div>

            {/* Brand Avatar Section */}
            {isDayMode && (
                <div className="flex justify-center mb-4 mt-1 model-floating select-none pointer-events-none z-20">
                    <img 
                        src="/ari-pointing.png" 
                        alt="ARI Asistente Credencial Comercio" 
                        className="h-32 w-auto object-contain drop-shadow-[0_10px_15px_rgba(88,70,50,0.15)] animate-in fade-in duration-700" 
                    />
                </div>
            )}

            {/* ═══════════ LIVE EVENT TICKER BANNER 🟢🔴 ═══════════ */}
            {activeEvent && (
                <div className="w-full max-w-sm mb-6 relative z-10 animate-in slide-in-from-top-6 duration-500">
                    {activeEvent.status === 'active_live' ? (
                        <div className={`border rounded-3xl p-5 flex flex-col items-center justify-center relative overflow-hidden ${
                            isDayMode 
                                ? 'bg-emerald-500/10 border-emerald-500/30 shadow-[0_8px_20px_rgba(16,185,129,0.15)]' 
                                : 'bg-gradient-to-r from-emerald-500/15 via-emerald-600/20 to-teal-500/15 border border-emerald-400/40 shadow-[0_0_20px_rgba(16,185,129,0.15)] animate-pulse'
                        }`}>
                            <span className={`text-[12px] font-[1000] uppercase tracking-[0.25em] text-center mb-1 ${isDayMode ? 'text-emerald-700' : 'text-emerald-400'}`}>
                                🟢 EVENTO ACTIVO EN REGIONAL
                            </span>
                            <h3 className={`text-sm font-black uppercase tracking-wider text-center mb-2 ${isDayMode ? 'text-[#2d1e15]' : 'text-white'}`}>
                                {activeEvent.name}
                            </h3>
                            <div className={`border px-4 py-1.5 rounded-full text-center ${isDayMode ? 'bg-[#faf8f5] border-[#cbd5e1]' : 'bg-emerald-500/25 border-emerald-400/30'}`}>
                                <span className={`text-[9px] font-black uppercase tracking-widest block ${isDayMode ? 'text-emerald-700' : 'text-emerald-300'}`}>
                                    🎫 BENEFICIO EXCLUSIVO: ENTRADA GRATIS
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className={`border rounded-3xl p-5 flex flex-col items-center justify-center relative overflow-hidden ${
                            isDayMode 
                                ? 'bg-red-500/10 border-red-500/30 shadow-lg' 
                                : 'bg-gradient-to-r from-red-500/15 via-red-600/25 to-rose-500/15 border border-red-400/40 shadow-[0_0_20px_rgba(239,68,68,0.15)]'
                        }`}>
                            <span className={`text-[12px] font-[1000] uppercase tracking-[0.25em] text-center mb-1 ${isDayMode ? 'text-red-700' : 'text-red-400'}`}>
                                🔴 EVENTO SUSPENDIDO / APLAZADO
                            </span>
                            <h3 className={`text-sm font-black uppercase tracking-wider text-center mb-2 ${isDayMode ? 'text-[#2d1e15]' : 'text-white'}`}>
                                {activeEvent.name}
                            </h3>
                            <p className={`text-[8px] font-black uppercase tracking-widest text-center animate-pulse ${isDayMode ? 'text-red-600' : 'text-red-300'}`}>
                                MÁS INFO VÍA ASISTENTE ARI 🤖
                            </p>
                        </div>
                    )}
                </div>
            )}

            <div className="w-full max-w-sm relative z-10">
                <div className={`absolute -inset-1 rounded-[2.5rem] blur opacity-25 ${isDayMode ? 'bg-[#855b3c]/20' : ''}`}></div>
                
                <div className={`relative border-2 rounded-[2.5rem] overflow-hidden shadow-2xl transition-all ${
                    isDayMode 
                        ? 'bg-white/85 border-[#855b3c] border-b-[8px] border-b-[#855b3c]' 
                        : 'bg-[#060614]/95 border-cyan-500/30 border-b-[8px] border-b-cyan-500/50 backdrop-blur-2xl'
                }`}>
                    <div className="p-8 flex flex-col items-center relative overflow-hidden neon-credential-card">
                        {/* Dynamic background structures */}
                        {!isDayMode ? (
                            <>
                                <div className="absolute inset-0 bg-[linear-gradient(rgba(37,99,235,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(37,99,235,0.05)_1px,transparent_1px)] bg-[size:25px_25px] pointer-events-none z-0" style={{ backgroundImage: `linear-gradient(${neonColor}0D 1px, transparent 1px), linear-gradient(90deg, ${neonColor}0D 1px, transparent 1px)` }} />
                                <div className="absolute top-0 right-0 w-48 h-48 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none opacity-20" style={{ backgroundColor: neonColor }} />
                                <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full -ml-16 -mb-16 blur-3xl pointer-events-none opacity-15" style={{ backgroundColor: isEnterprise ? '#a855f7' : '#06b6d4' }} />
                            </>
                        ) : (
                            <div className="absolute top-0 left-0 w-full h-44 opacity-10 bg-gradient-to-br from-[#cda488] to-transparent pointer-events-none" />
                        )}

                        {/* SELLO DE VIDA INVIOLABLE CON SEGUNDEROS */}
                        <div className={`w-full flex flex-col items-center justify-center gap-1 mb-6 py-3 px-4 rounded-2xl relative overflow-hidden border-2 transition-all ${
                            isDayMode 
                                ? 'bg-black border-[#855b3c]/40 text-white shadow-md' 
                                : isEnterprise 
                                    ? 'bg-purple-500/15 border-purple-400/40 shadow-[inset_0_0_15px_rgba(139,92,246,0.25),0_0_20px_rgba(139,92,246,0.2)]' 
                                    : 'bg-blue-500/15 border-blue-400/40 shadow-[inset_0_0_15px_rgba(37,99,235,0.25),0_0_20px_rgba(37,99,235,0.2)]'
                        }`}>
                            {!isDayMode && <div className="absolute top-0 left-0 w-full h-[1px] bg-cyan-400/80 animate-[scan_2s_infinite_ease-in-out]" />}
                            <div className="flex items-center gap-2 relative z-10">
                                <Clock size={13} className={`animate-spin ${isDayMode ? 'text-amber-400' : ''}`} style={isDayMode ? { animationDuration: '4s' } : { animationDuration: '4s', color: isEnterprise ? '#c084fc' : '#22d3ee' }} />
                                <span className={`text-[12px] font-black font-mono tracking-[0.15em] tabular-nums ${isDayMode ? 'text-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.5)]' : 'text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.7)]'}`}>
                                    {formatClock(currentTime)}
                                </span>
                            </div>
                            <span className={`text-[7px] font-[900] uppercase tracking-[0.25em] relative z-10 ${isDayMode ? 'text-emerald-400 animate-pulse' : 'text-cyan-400/80 animate-pulse'}`}>Sello de Seguridad Activo</span>
                        </div>

                        {/* Edit Button for Merchant Profile */}
                        {isAuthorized && (
                            <button 
                                onClick={() => { playNeonClick(); setIsEditing(true); }}
                                className="absolute top-4 right-4 w-8 h-8 rounded-xl flex items-center justify-center btn-3d-celeste shadow-md transition-all cursor-pointer z-[25]"
                                title="Editar Comercio"
                            >
                                <Edit2 size={14} style={isDayMode ? { color: '#083344' } : { color: '#22d3ee' }} />
                            </button>
                        )}

                        {/* ownerPhoto / Shop Image */}
                        <div className={`relative w-24 h-24 rounded-full p-0.5 mb-5 flex-shrink-0 bg-gradient-to-br group/photo ${
                            isDayMode 
                                ? 'from-[#b58866] to-[#cbd5e1] border border-[#855b3c]/30 shadow-md' 
                                : isEnterprise 
                                    ? 'from-purple-400 to-fuchsia-500 shadow-[0_0_30px_rgba(139,92,246,0.4)]' 
                                    : 'from-blue-400 to-cyan-500 shadow-[0_0_30px_rgba(37,99,235,0.4)]'
                        }`}>
                            <div className="w-full h-full bg-zinc-950 rounded-full overflow-hidden flex items-center justify-center p-0.5 border border-black/40 relative">
                                <img src={shop?.ownerPhoto || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&q=80"} alt={shop?.ownerName} className="w-full h-full object-cover rounded-full" />
                                {isAuthorized && (
                                    <button 
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute inset-0 bg-black/60 opacity-0 group-hover/photo:opacity-100 flex flex-col items-center justify-center transition-opacity border-none cursor-pointer rounded-full"
                                    >
                                        <Camera size={20} className="text-white mb-1" />
                                        <span className="text-[7px] font-black uppercase tracking-widest text-white">Editar Foto</span>
                                    </button>
                                )}
                            </div>
                            <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />
                            {isUploading && (
                                <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-full z-10">
                                    <div className="w-6 h-6 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
                                </div>
                            )}
                        </div>

                        {/* Shop Name */}
                        <h2 className={`text-xl font-[1000] uppercase tracking-tight mb-1 text-center leading-tight ${isDayMode ? 'text-[#2d1e15]' : 'text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.2)]'}`}>
                            {shop?.name || selectedShop.name}
                        </h2>
                        <p className={`text-[8px] font-black uppercase tracking-widest mb-4 text-center ${isDayMode ? 'text-[#855b3c]' : 'text-cyan-400/60'}`}>
                            {shop?.specialty || shop?.category || selectedShop.specialty || selectedShop.category}
                        </p>

                        {/* Verified Badge */}
                        <div className={`flex items-center gap-2 mb-6 px-5 py-2 rounded-full border transition-all ${
                            isDayMode 
                                ? 'bg-black border-[#855b3c]/40 text-white shadow-md' 
                                : isEnterprise 
                                    ? 'bg-purple-500/20 border-purple-400/50 shadow-[0_0_20px_rgba(139,92,246,0.3)] text-purple-200' 
                                    : 'bg-blue-500/20 border-blue-400/50 shadow-[0_0_20px_rgba(37,99,235,0.3)] text-blue-200'
                        }`}>
                            <ShieldCheck className={`w-4 h-4 ${isDayMode ? 'text-emerald-400' : isEnterprise ? 'text-purple-300' : 'text-blue-300'}`} />
                            <span className={`text-[9px] font-[1000] uppercase tracking-[0.25em] ${isDayMode ? 'text-emerald-400' : isEnterprise ? 'text-purple-200' : 'text-blue-200'}`}>{isEnterprise ? 'Empresa Industrial Verificada' : 'Comercio Verificado'}</span>
                        </div>

                        {/* Data Grid */}
                        <div className="w-full grid grid-cols-2 gap-3 mb-6">
                            <div className={`rounded-2xl p-3.5 border transition-all ${
                                isDayMode 
                                    ? 'bg-[#faf8f5] border-[#0891b2]/45 text-[#2d1e15] shadow-sm' 
                                    : 'bg-black/60 border-white/5 shadow-[0_0_15px_rgba(37,99,235,0.1)]'
                            }`} style={isDayMode ? {} : { borderColor: `${neonColor}30` }}>
                                <p className={`text-[7px] font-black uppercase tracking-widest mb-1 ${isDayMode ? 'text-[#855b3c]' : ''}`} style={isDayMode ? {} : { color: `${neonColor}99` }}>Titular</p>
                                <p className={`text-[11px] font-[1000] uppercase tracking-tight truncate ${isDayMode ? 'text-[#2d1e15]' : 'text-white'}`}>
                                    {shop?.ownerName || selectedShop.ownerName || 'Sin Registrar'}
                                </p>
                            </div>
                            
                            <div className={`rounded-2xl p-3.5 border transition-all ${
                                isDayMode 
                                    ? 'bg-[#faf8f5] border-[#0891b2]/45 text-[#2d1e15] shadow-sm' 
                                    : 'bg-black/60 border-white/5 shadow-[0_0_15px_rgba(37,99,235,0.1)]'
                            }`} style={isDayMode ? {} : { borderColor: `${neonColor}30` }}>
                                <p className={`text-[7px] font-black uppercase tracking-widest mb-1 ${isDayMode ? 'text-[#855b3c]' : ''}`} style={isDayMode ? {} : { color: `${neonColor}99` }}>{isEnterprise ? 'ID Empresa' : 'ID Comercio'}</p>
                                <p className={`text-[11px] font-[1000] tracking-tight truncate ${isDayMode ? 'text-[#2d1e15]' : 'text-cyan-400'}`}>
                                    {shop?.shopNumber || selectedShop.shopNumber || selectedShop.id.slice(0, 8).toUpperCase()}
                                </p>
                            </div>
                            
                            <div className={`rounded-2xl p-3.5 border transition-all col-span-2 ${
                                isDayMode 
                                    ? 'bg-[#faf8f5] border-[#0891b2]/45 text-[#2d1e15] shadow-sm' 
                                    : 'bg-black/60 border-white/5 shadow-[0_0_15px_rgba(37,99,235,0.1)]'
                            }`} style={isDayMode ? {} : { borderColor: `${neonColor}30` }}>
                                <p className={`text-[7px] font-black uppercase tracking-widest mb-1 flex items-center gap-1 ${isDayMode ? 'text-[#855b3c]' : ''}`} style={isDayMode ? {} : { color: `${neonColor}99` }}>
                                    <MapPin size={8} className={isDayMode ? 'text-[#855b3c]' : 'text-cyan-400'} /> Dirección
                                </p>
                                <p className={`text-[10px] font-bold truncate ${isDayMode ? 'text-[#2d1e15]/80' : 'text-white/80'}`}>{shop?.address || selectedShop.address}</p>
                            </div>
                        </div>

                        {/* QR Code */}
                        <div className={`w-full rounded-[2.2rem] p-6 flex flex-col items-center border-2 mb-6 relative group/qr overflow-hidden transition-all ${
                            isDayMode 
                                ? 'bg-[#faf8f5] border-[#0891b2]/45 text-[#2d1e15] shadow-inner' 
                                : isEnterprise 
                                    ? 'bg-black/75 border-purple-500/40 shadow-[0_0_30px_rgba(139,92,246,0.2),inset_0_0_20px_rgba(139,92,246,0.15)]' 
                                    : 'bg-black/75 border-blue-500/40 shadow-[0_0_30px_rgba(37,99,235,0.2),inset_0_0_20px_rgba(37,99,235,0.15)]'
                        }`}>
                            {!isDayMode && <div className="absolute left-0 right-0 h-[2px] bg-cyan-400/80 shadow-[0_0_12px_rgba(34,211,238,0.8)] animate-[scan-laser_3s_infinite_linear] pointer-events-none z-20" />}
                            
                            <div className="bg-white p-4.5 rounded-2xl mb-4 shadow-sm relative z-10 border-2" style={{ borderColor: isDayMode ? '#0891b24D' : isEnterprise ? '#c084fc4D' : '#3b82f64D' }}>
                                <QRCodeCanvas
                                    value={validationUrl}
                                    size={140}
                                    level="H"
                                    includeMargin={false}
                                    imageSettings={{
                                        src: shop?.ownerPhoto || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&q=80',
                                        x: undefined, y: undefined,
                                        height: 28, width: 28, excavate: true,
                                    }}
                                />
                            </div>
                            <p className={`text-[9px] font-black uppercase tracking-[0.25em] ${isDayMode ? 'text-[#855b3c]' : 'text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]'}`}>Código de Validación</p>
                        </div>

                        {/* 🛰️ SINTONIZADOR DE ACCESO / EVENTOS LIVE */}
                        <div className={`w-full rounded-[2.5rem] p-6 border-2 space-y-4 relative overflow-hidden mb-6 z-10 transition-colors duration-500 ${
                            isDayMode 
                                ? 'bg-black border-[#855b3c] text-white shadow-lg' 
                                : 'bg-black/80 border-white/15 shadow-[inset_0_0_20px_rgba(99,102,241,0.15)]'
                        }`}>
                            <div className="flex justify-between items-center relative z-10">
                                <label className={`text-[9px] font-black uppercase tracking-[0.25em] flex items-center gap-2 ${isDayMode ? 'text-amber-400' : 'text-cyan-300'}`}>
                                    <Radio size={12} className={`animate-pulse ${isDayMode ? 'text-amber-400' : 'text-cyan-400'}`} /> Sintonizador de Acceso
                                </label>
                                <span className={`text-[8px] font-[900] border px-3 py-1.5 rounded-full uppercase tracking-wider animate-pulse ${
                                    isDayMode 
                                        ? 'bg-amber-500/20 border-amber-400/40 text-amber-300' 
                                        : 'bg-cyan-500/20 border-cyan-400/40 text-cyan-400'
                                }`}>
                                    LIVE SINFONÍA
                                </span>
                            </div>
                            
                            {sintonizadorEventData && (
                                <div className="space-y-3.5 relative z-10">
                                    <p className={`text-[13px] font-[1000] uppercase tracking-tight leading-snug ${isDayMode ? 'text-white drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]' : 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.25)]'}`}>
                                        {sintonizadorEventData.name}
                                    </p>
                                    <p className={`text-[9px] font-black uppercase tracking-widest leading-relaxed ${isDayMode ? 'text-amber-300/90' : 'text-cyan-300'}`}>
                                        {sintonizadorEventData.details}
                                    </p>
                                    <div className="flex items-center gap-2 border px-3 py-1.5 rounded-xl w-fit bg-emerald-500/20 border-emerald-500/40">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                                        <span className="text-[9px] font-[1000] text-emerald-400 uppercase tracking-widest">
                                            {sintonizadorEventData.access}
                                        </span>
                                    </div>
                                    <p className={`text-[7.5px] font-bold uppercase tracking-widest leading-relaxed ${isDayMode ? 'text-white/50' : 'text-white/50'}`}>
                                        Seguridad: Permitir el ingreso al personal asociado acreditado.
                                    </p>
                                </div>
                            )}
                        </div>
 
                        {/* Status */}
                        <div className={`w-full flex justify-between items-center text-[9px] font-black uppercase tracking-[0.2em] border-t pt-4 ${
                            isDayMode ? 'border-[#cbd5e1]' : ''
                        }`} style={isDayMode ? {} : { borderColor: `${neonColor}33` }}>
                            <span className={isDayMode ? 'text-[#2d1e15]/70' : 'text-white/70'}>Membresía Activa</span>
                            <span className={`font-black ${
                                selectedShop.isActive 
                                    ? 'text-green-600' 
                                    : isDayMode ? 'text-amber-700' : 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]'
                            }`}>
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
                        className="w-full h-16 text-[11px] font-[1100] uppercase tracking-[0.2em] btn-3d-celeste flex items-center justify-center gap-2.5 shadow-lg cursor-pointer"
                    >
                        <CreditCard size={20} />
                        <span>Abrir POSNET de Créditos</span>
                    </button>
                ) : (
                    <div className={`border rounded-[2rem] p-6 space-y-5 shadow-2xl transition-all ${
                        isDayMode 
                            ? 'bg-white border-[#cbd5e1] border-b-[6px] border-b-[#cbd5e1] text-[#2d1e15]' 
                            : 'bg-zinc-900/80 border-indigo-500/20 backdrop-blur-sm'
                    }`}>
                        <div className="flex items-center justify-between">
                            <h3 className={`text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-2 ${
                                isDayMode ? 'text-[#855b3c]' : 'text-indigo-400'
                            }`}>
                                <CreditCard size={14} /> POSNET de Créditos
                            </h3>
                            <button onClick={() => { playNeonClick(); setPosnetOpen(false); resetPosnet(); }}
                                className={`w-8 h-8 rounded-full flex items-center justify-center border text-[12px] cursor-pointer ${
                                    isDayMode 
                                        ? 'bg-black/5 border-black/10 text-black/40 hover:bg-black/10' 
                                        : 'bg-white/5 border-white/10 text-white/30 hover:text-white/60'
                                }`}>✕</button>
                        </div>

                        {/* Mode Selector */}
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => { playNeonClick(); setPosnetMode('load'); setTxStatus('idle'); }}
                                className={`py-3 rounded-xl font-black uppercase tracking-widest text-[9px] border transition-all active:scale-95 flex flex-col items-center gap-1 cursor-pointer
                                    ${posnetMode === 'load'
                                        ? isDayMode 
                                            ? 'bg-green-500/10 border-green-500 text-green-700 font-bold' 
                                            : 'bg-green-500/15 border-green-400 text-green-300 shadow-[0_0_15px_rgba(34,197,94,0.2)]'
                                        : isDayMode 
                                            ? 'bg-black/5 border-black/10 text-black/40' 
                                            : 'bg-white/5 border-white/10 text-white/40'}`}
                            >
                                <ArrowUpRight size={16} />
                                Cargar
                            </button>
                            <button
                                onClick={() => { playNeonClick(); setPosnetMode('spend'); setTxStatus('idle'); }}
                                className={`py-3 rounded-xl font-black uppercase tracking-widest text-[9px] border transition-all active:scale-95 flex flex-col items-center gap-1 cursor-pointer
                                    ${posnetMode === 'spend'
                                        ? isDayMode 
                                            ? 'bg-red-500/10 border-red-500 text-red-700 font-bold' 
                                            : 'bg-red-500/15 border-red-400 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                                        : isDayMode 
                                            ? 'bg-black/5 border-black/10 text-black/40' 
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
                                        className="w-full p-3 text-[11px] rounded-xl focus:outline-none font-bold premium-input"
                                        autoFocus
                                    />
                                    <Search size={14} className={`absolute right-3 top-1/2 -translate-y-1/2 opacity-30 ${isDayMode ? 'text-[#2d1e15]' : 'text-white'}`} />
                                </div>
                                {filteredClients.map(c => (
                                    <button key={c.id}
                                        onClick={() => { playNeonClick(); setSelectedClient(c); setSearchTerm(''); setTxStatus('idle'); }}
                                        className={`w-full border rounded-lg p-2.5 flex items-center gap-2.5 transition-all active:scale-[0.98] cursor-pointer ${
                                            isDayMode 
                                                ? 'bg-[#faf8f5] border-black/5 hover:border-[#a88d75]/50 text-[#2d1e15]' 
                                                : 'bg-black/30 border-white/5 hover:border-indigo-500/30 text-white'
                                        }`}
                                    >
                                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center overflow-hidden flex-shrink-0 border border-white/10">
                                            {c.photo ? <img src={c.photo} className="w-full h-full object-cover rounded-full" alt="" /> : <User size={12} className="opacity-35" />}
                                        </div>
                                        <div className="flex-1 text-left min-w-0">
                                            <p className="text-[10px] font-black uppercase tracking-wider truncate">{c.name}</p>
                                            <p className="text-[7px] opacity-40">{c.dni || 'Sin DNI'} · 💰 {c.credits || 0}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {/* Selected Client Mini-Card */}
                                <div className={`border rounded-xl p-3 flex items-center gap-3 relative ${
                                    isDayMode ? 'bg-[#faf8f5] border-[#0891b2]/45' : 'bg-black/40 border-indigo-500/15'
                                }`}>
                                    <button onClick={() => { playNeonClick(); resetPosnet(); }}
                                        className="absolute top-2 right-2 opacity-30 hover:opacity-60 text-[10px] border-none bg-transparent cursor-pointer">✕</button>
                                    <div className="w-10 h-10 rounded-full border overflow-hidden bg-white/5 flex-shrink-0" style={{ borderColor: isDayMode ? '#0891b24D' : '#cbd5e14D' }}>
                                        {selectedClient.photo ? <img src={selectedClient.photo} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center"><User size={16} className="opacity-20" /></div>}
                                    </div>
                                    <div className="flex-1 min-w-0 text-left">
                                        <p className="text-[10px] font-black uppercase tracking-wider truncate">{selectedClient.name}</p>
                                        <p className={`text-[8px] ${isDayMode ? 'text-[#855b3c]' : 'text-indigo-400'}`}>Saldo: <span className="font-[1000] tabular-nums">{selectedClient.credits || 0}</span> créditos</p>
                                    </div>
                                </div>

                                {/* Amount */}
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={e => setAmount(e.target.value)}
                                        placeholder="0"
                                        className="w-full p-3 text-[22px] font-[1000] focus:outline-none tabular-nums text-center premium-input"
                                    />
                                    <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-[8px] font-black opacity-30 uppercase tracking-widest ${isDayMode ? 'text-[#2d1e15]' : 'text-white'}`}>CRÉDITOS</span>
                                </div>

                                {/* Status */}
                                {txStatus === 'success' && (
                                    <div className="bg-green-500/10 border border-green-500/30 p-3 rounded-xl flex items-center gap-3">
                                        <CheckCircle size={18} className="text-green-600 flex-shrink-0" />
                                        <div className="text-left">
                                            <p className="text-[10px] font-[1000] text-green-600 uppercase tracking-widest">
                                                {posnetMode === 'load' ? '✅ Créditos Cargados' : '✅ Descuento Aplicado'}
                                            </p>
                                            <p className="text-[8px] opacity-50">Nuevo saldo: {selectedClient.credits}</p>
                                        </div>
                                    </div>
                                )}
                                {txStatus === 'error' && (
                                    <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-xl flex items-center gap-3">
                                        <XCircle size={18} className="text-red-500 flex-shrink-0" />
                                        <p className="text-[9px] font-black text-red-600 text-left">{errorMsg}</p>
                                    </div>
                                )}

                                {/* Action Button */}
                                <button
                                    onClick={handleTransaction}
                                    disabled={isProcessing || !amount}
                                    className="w-full h-14 text-[10px] font-[1100] uppercase tracking-[0.15em] btn-3d-celeste flex items-center justify-center gap-2 shadow-lg disabled:opacity-30 disabled:grayscale cursor-pointer"
                                >
                                    {isProcessing
                                        ? <div className="w-5 h-5 border-2 border-[#083344]/30 border-t-[#083344] rounded-full animate-spin" />
                                        : <>
                                            {posnetMode === 'load' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                                            {posnetMode === 'load' ? 'Otorgar Créditos' : 'Confirmar Descuento'}
                                        </>
                                    }
                                </button>

                                {txStatus === 'success' && (
                                    <button onClick={() => { playNeonClick(); resetPosnet(); }}
                                        className="w-full h-10 text-[8px] font-[1100] uppercase tracking-widest btn-3d-celeste flex items-center justify-center shadow-md cursor-pointer mt-2"
                                    >
                                        Nueva Transacción
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Navigation Buttons */}
            <div className="w-full max-w-sm mt-6 space-y-4 relative z-10">
                <button
                    onClick={() => { playNeonClick(); navigate(`/${townId}/${categorySlug}/${shopSlug}/panel-autogestion`); }}
                    className="w-full h-14 text-[9px] font-[1100] uppercase tracking-[0.2em] btn-3d-celeste flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                >
                    <Store size={14} style={isDayMode ? { color: '#083344' } : { color: '#22d3ee' }} /> Panel de Autogestión
                </button>
                <button
                    onClick={() => { playNeonClick(); navigate(`/${townId}/home`); }}
                    className="w-full h-14 text-[9px] font-[1100] uppercase tracking-[0.2em] btn-3d-celeste flex items-center justify-center shadow-lg cursor-pointer"
                >
                    Volver a Inicio
                </button>
            </div>

            {/* MODAL DE EDICIÓN DEL COMERCIO */}
            {isEditing && isAuthorized && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setIsEditing(false)} />
                    
                    <div className={`relative w-full max-w-sm rounded-[2.5rem] p-8 overflow-hidden border-2 shadow-2xl transition-all ${
                        isDayMode 
                            ? 'bg-white border-slate-200 border-b-[8px] border-b-[#855b3c] text-[#2d1e15]' 
                            : 'bg-zinc-950 border-cyan-500/30 border-b-[8px] border-b-cyan-500/50 text-white'
                    }`}>
                        {!isDayMode && (
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,245,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,245,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none z-0" />
                        )}
                        
                        <div className="flex justify-between items-center mb-6 relative z-10">
                            <h3 className={`text-xs font-black uppercase tracking-widest flex items-center gap-2 ${
                                isDayMode ? 'text-[#855b3c]' : 'text-white'
                            }`}>
                                <ShieldCheck size={18} className={isDayMode ? 'text-[#855b3c]' : 'text-cyan-400'} /> Editar Comercio
                            </h3>
                            <button 
                                onClick={() => { playNeonClick(); setIsEditing(false); }} 
                                className={`w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-all border ${
                                    isDayMode 
                                        ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-500 hover:text-slate-800' 
                                        : 'bg-white/5 hover:bg-white/10 border-white/10 text-cyan-400 hover:text-white'
                                }`}
                                aria-label="Cerrar"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveShopProfile} className="space-y-4.5 relative z-10 max-h-[70vh] overflow-y-auto pr-1">
                            <div>
                                <label className={`text-[8.5px] font-black uppercase tracking-[0.2em] mb-2 block ${isDayMode ? 'text-[#2d1e15]/60' : 'text-white/60'}`}>Nombre del Local</label>
                                <input 
                                    required
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                    className="w-full p-3 text-xs rounded-xl focus:outline-none uppercase font-black premium-input"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={`text-[8.5px] font-black uppercase tracking-[0.2em] mb-2 block ${isDayMode ? 'text-[#2d1e15]/60' : 'text-white/60'}`}>Titular (Nombre)</label>
                                    <input 
                                        required
                                        value={editForm.ownerName}
                                        onChange={(e) => setEditForm({ ...editForm, ownerName: e.target.value })}
                                        className="w-full p-3 text-xs rounded-xl focus:outline-none font-bold premium-input"
                                    />
                                </div>
                                <div>
                                    <label className={`text-[8.5px] font-black uppercase tracking-[0.2em] mb-2 block ${isDayMode ? 'text-[#2d1e15]/60' : 'text-white/60'}`}>Nro / DNI / CUIT</label>
                                    <input 
                                        required
                                        value={editForm.shopNumber}
                                        onChange={(e) => setEditForm({ ...editForm, shopNumber: e.target.value })}
                                        className="w-full p-3 text-xs rounded-xl focus:outline-none font-bold premium-input"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={`text-[8.5px] font-black uppercase tracking-[0.2em] mb-2 block ${isDayMode ? 'text-[#2d1e15]/60' : 'text-white/60'}`}>WhatsApp</label>
                                    <input 
                                        required
                                        value={editForm.phone}
                                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                        className="w-full p-3 text-xs rounded-xl focus:outline-none font-bold premium-input"
                                    />
                                </div>
                                <div>
                                    <label className={`text-[8.5px] font-black uppercase tracking-[0.2em] mb-2 block ${isDayMode ? 'text-[#2d1e15]/60' : 'text-white/60'}`}>Correo Autorizado</label>
                                    <input 
                                        required
                                        type="email"
                                        value={editForm.gmail}
                                        onChange={(e) => setEditForm({ ...editForm, gmail: e.target.value })}
                                        className="w-full p-3 text-xs rounded-xl focus:outline-none font-bold premium-input"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className={`text-[8.5px] font-black uppercase tracking-[0.2em] mb-2 block ${isDayMode ? 'text-[#2d1e15]/60' : 'text-white/60'}`}>Dirección Física</label>
                                <input 
                                    required
                                    value={editForm.address}
                                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                                    className="w-full p-3 text-xs rounded-xl focus:outline-none font-bold premium-input"
                                />
                            </div>

                            <div>
                                <label className={`text-[8.5px] font-black uppercase tracking-[0.2em] mb-2 block ${isDayMode ? 'text-[#2d1e15]/60' : 'text-white/60'}`}>Foto del Propietario</label>
                                <div className="flex gap-2.5 items-center">
                                    <div className={`w-12 h-12 rounded-xl border overflow-hidden flex items-center justify-center shrink-0 ${
                                        isDayMode ? 'bg-[#faf8f5] border-[#0891b2]/45' : 'bg-white/5 border-white/10'
                                    }`}>
                                        <img src={shop?.ownerPhoto || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&q=80'} className="w-full h-full object-cover" />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => { playNeonClick(); fileInputRef.current?.click(); }}
                                        className="flex-1 py-2.5 text-[9px] font-black uppercase tracking-widest btn-3d-celeste flex items-center justify-center shadow-md cursor-pointer"
                                    >
                                        Subir Foto
                                    </button>
                                </div>
                            </div>

                            <button 
                                type="submit"
                                disabled={isSaving}
                                className="w-full py-4.5 rounded-2xl flex items-center justify-center gap-2 font-[1000] uppercase tracking-[0.2em] text-[10px] btn-3d-celeste shadow-lg disabled:opacity-50 cursor-pointer"
                            >
                                {isSaving ? (
                                    <div className="w-4 h-4 border-2 border-white/25 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Check size={16} style={isDayMode ? { color: '#083344' } : { color: '#22d3ee' }} strokeWidth={3} />
                                        <span>Guardar Cambios</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className="mt-10 flex flex-col items-center gap-2 relative z-10">
                <p className={`text-[8px] font-black uppercase tracking-[0.4em] text-center px-12 leading-loose ${isDayMode ? 'text-[#2d1e15]/60' : 'text-indigo-400/90'}`}>
                    Security ID: SHOP-{selectedShop.id.slice(0, 8).toUpperCase()}
                </p>
                <div className="flex items-center gap-4">
                    <div className={`h-[1px] w-8 ${isDayMode ? 'bg-[#cbd5e1]' : 'bg-indigo-500/60'}`} />
                    <span className={`text-[7px] font-bold uppercase tracking-[0.8em] ${isDayMode ? 'text-black/50' : 'text-white/70'}`}>ShopDigital.tech</span>
                    <div className={`h-[1px] w-8 ${isDayMode ? 'bg-[#cbd5e1]' : 'bg-indigo-500/60'}`} />
                </div>
            </div>
            
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
                
                /* High contrast input styling */
                .premium-input {
                    color: ${isDayMode ? '#083344' : '#ffffff'} !important;
                    background-color: ${isDayMode ? '#ffffff' : '#050505'} !important;
                    border: 2.5px solid ${isDayMode ? '#0891b2' : 'rgba(99, 102, 241, 0.2)'} !important;
                    box-shadow: ${isDayMode ? '0 2px 5px rgba(8, 145, 178, 0.08), inset 0 2px 4px rgba(0,0,0,0.03)' : 'inset 0 2px 4px rgba(0,0,0,0.8)'} !important;
                    transition: border-color 0.25s ease, box-shadow 0.25s ease !important;
                }
                .premium-input:focus {
                    border-color: ${isDayMode ? '#083344' : '#818cf8'} !important;
                    box-shadow: ${isDayMode ? '0 0 0 3.5px rgba(8, 51, 68, 0.15), inset 0 2px 4px rgba(0,0,0,0.03)' : '0 0 10px rgba(99, 102, 241, 0.25), inset 0 2px 4px rgba(0,0,0,0.8)'} !important;
                }

                input, option, select {
                    color: ${isDayMode ? '#083344' : '#ffffff'} !important;
                    background-color: ${isDayMode ? '#ffffff' : '#050505'} !important;
                }

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
            `}</style>
        </div>
    );
};

export default CredencialPage;
