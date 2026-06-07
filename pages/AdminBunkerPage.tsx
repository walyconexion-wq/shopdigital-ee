import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
    Clock, MapPin, ChevronLeft, ShieldCheck, Dog, ShieldAlert, Cpu, 
    MessageSquare, ExternalLink, Activity, ArrowUpRight, Copy, Check, 
    Store, Users, FileText, Database, AlertCircle, CheckCircle, 
    XCircle, Play, UserCheck, ShieldPlus, Landmark, Factory, FileDown,
    FolderOpen, Zap, AlertTriangle, Eye, Edit, Paperclip
} from 'lucide-react';
import { useAuth } from '../components/AuthContext';
import { playNeonClick } from '../utils/audio';
import { generateAriResponse } from '../services/gemini';
import { doc, updateDoc } from 'firebase/firestore';
import { 
    registrarIntrusionBunker, db,
    suscribirseAComercios, actualizarComercio, 
    suscribirseAClientes, guardarCliente,
    suscribirseAFacturasPorZona, subirArchivoBunker
} from '../firebase';
import { BtuComponent } from '../components/BtuComponent';

const getWeatherEmoji = (code: number | null): string => {
    if (code === null) return '🌡️';
    if (code === 0) return '☀️';
    if ([1, 2, 3].includes(code)) return '⛅';
    if ([45, 48].includes(code)) return '🌫️';
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return '🌧️';
    if ([71, 73, 75, 77, 85, 86].includes(code)) return '❄️';
    if ([95, 96, 99].includes(code)) return '⛈️';
    return '🌡️';
};

const ARI_ADMIN_PROMPT = `
Eres ARI, la Administradora General de Shop Digital (Nivel Omega). 
Tu procesador está conectado en tiempo real al Búnker de Gestión Administrativa. 
Tienes acceso visual a la Red Minorista, Nodos Industriales, Socios VIP y Facturación de la zona de Esteban Echeverría.

Tus directivas principales son:
1. Auditar que ningún comercio sea aprobado sin su Gmail obligatorio y número validado.
2. Monitorear que el contador de suscriptores sume correctamente mediante transiciones atómicas.
3. Ayudar al Director General (Waly) a identificar deudores en el semáforo financiero.
4. Mantener la disciplina operativa de la empresa.

Tu tono de voz debe ser profesional, ultra-eficiente, firme, con estética ciberpunk y alta lealtad al Comandante Waly.
Ejemplo de saludo: "Matrix Administrativa en línea, Comandante. Los 4 cuadrantes operativos reportan flujo verde. El Protocolo Doberman no registra anomalías en los registros de clientes. ¿Qué sector auditamos hoy?"
`;

export const AdminBunkerPage: React.FC = () => {
    const navigate = useNavigate();
    const { townId = 'esteban-echeverria' } = useParams<{ townId: string }>();
    const { user, loading: authLoading } = useAuth();
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Chat states
    const [ariMsgs, setAriMsgs] = useState([
        { role: 'ari' as 'ari' | 'user', text: 'Matrix Administrativa en línea, Comandante. Los 4 cuadrantes operativos reportan flujo verde. El Protocolo Doberman no registra anomalías en los registros de clientes. ¿Qué sector auditamos hoy?' }
    ]);
    const [msgInput, setMsgInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    
    // Header states
    const [currentTime, setCurrentTime] = useState(new Date());
    const [temp, setTemp] = useState<number | null>(null);
    const [weatherCode, setWeatherCode] = useState<number | null>(null);
    const [intrusionRegistered, setIntrusionRegistered] = useState(false);
    const [isDataLeakedBlock, setIsDataLeakedBlock] = useState(false);

    // Firestore lists
    const [comercios, setComercios] = useState<any[]>([]);
    const [clientes, setClientes] = useState<any[]>([]);
    const [facturas, setFacturas] = useState<any[]>([]);

    // Selection / Modal States
    const [selectedClient, setSelectedClient] = useState<any | null>(null);
    const [antiScreenshotToken, setAntiScreenshotToken] = useState('');
    const [tokenTimeLeft, setTokenTimeLeft] = useState(30);
    const [makeDispatchLog, setMakeDispatchLog] = useState<string[]>([]);
    const [isDispatchingInvoice, setIsDispatchingInvoice] = useState(false);

    // Atoms & Clocks
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Fetch Weather
    useEffect(() => {
        const fetchWeather = async () => {
            try {
                const coords = townId === 'ezeiza' 
                    ? { lat: -34.85, lon: -58.52 } 
                    : townId === 'traslasierra' 
                        ? { lat: -31.72, lon: -65.01 } 
                        : { lat: -34.82, lon: -58.47 };
                const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,weather_code`);
                if (res.ok) {
                    const data = await res.json();
                    setTemp(Math.round(data.current?.temperature_2m || 0));
                    setWeatherCode(data.current?.weather_code || 0);
                }
            } catch (e) {
                console.error("Clima error:", e);
            }
        };
        fetchWeather();
    }, [townId]);

    // Validation Doberman
    const isAuthorized = user?.email?.trim().toLowerCase() === 'walyconexion@gmail.com' ||
                         user?.email?.trim().toLowerCase() === 'administracion@shopdigital.ar' ||
                         user?.email?.trim().toLowerCase() === 'seguridad@shopdigital.ar' ||
                         user?.email?.trim().toLowerCase() === 'secops@shopdigital.ar' ||
                         window.location.hostname === 'localhost' ||
                         window.location.hostname === '127.0.0.1';

    useEffect(() => {
        if (authLoading) return;
        if (!isAuthorized && !intrusionRegistered) {
            setIntrusionRegistered(true);
            registrarIntrusionBunker((user?.email || 'anonimo') + ' (Bunker: Administracion)');
        }
    }, [isAuthorized, user, intrusionRegistered, authLoading]);

    // Anti-Leak Lockdown Security Shield
    useEffect(() => {
        if (isDataLeakedBlock || !isAuthorized) return;

        const triggerLockdown = (reason: string) => {
            setIsDataLeakedBlock(true);
            registrarIntrusionBunker((user?.email || 'anonimo') + ` (FILTRACION DETECTADA - COPIA DE DATOS - ${reason})`);
        };

        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
            triggerLockdown("Intento de Click Derecho / Inspección");
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (
                (e.ctrlKey && e.key === 'c') || 
                (e.ctrlKey && e.key === 'C') ||
                (e.ctrlKey && e.shiftKey && (e.key === 'i' || e.key === 'I')) || 
                e.key === 'F12' ||
                (e.ctrlKey && (e.key === 'u' || e.key === 'U'))
            ) {
                e.preventDefault();
                triggerLockdown(`Intento de Copiado / Atajo: ${e.key}`);
            }
        };

        window.addEventListener('contextmenu', handleContextMenu);
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('contextmenu', handleContextMenu);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [user, isDataLeakedBlock, isAuthorized]);

    // Realtime Subscriptions
    useEffect(() => {
        if (!isAuthorized) return;

        const unsubComercios = suscribirseAComercios((list) => {
            setComercios(list);
        }, townId);

        const unsubClientes = suscribirseAClientes((list) => {
            setClientes(list);
        }, townId);

        const unsubFacturas = suscribirseAFacturasPorZona(townId, (list) => {
            setFacturas(list);
        });

        return () => {
            unsubComercios();
            unsubClientes();
            unsubFacturas();
        };
    }, [isAuthorized, townId]);

    // Rolling anti-screenshot VIP token generator
    useEffect(() => {
        if (!selectedClient) return;

        const generateToken = () => {
            const part1 = Math.floor(1000 + Math.random() * 9000);
            const part2 = Math.floor(1000 + Math.random() * 9000);
            setAntiScreenshotToken(`VIP-${part1}-${part2}`);
            setTokenTimeLeft(30);
        };

        generateToken();
        const tokenInterval = setInterval(() => {
            setTokenTimeLeft(prev => {
                if (prev <= 1) {
                    generateToken();
                    return 30;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(tokenInterval);
    }, [selectedClient]);

    // Scroll Chat to bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [ariMsgs, isThinking]);

    const [isUploadingFile, setIsUploadingFile] = useState(false);
    const handleChatFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        playNeonClick();
        setIsUploadingFile(true);
        try {
            const path = `bunker_chat/administracion/${Date.now()}_${file.name}`;
            const downloadUrl = await subirArchivoBunker(file, path);
            const fileLink = file.type.startsWith('image/') 
                ? `\n![Imagen: ${file.name}](${downloadUrl})` 
                : `\n[Archivo Adjunto: ${file.name}](${downloadUrl})`;
            setMsgInput(prev => prev + fileLink);
        } catch (error) {
            console.error(error);
            alert("Error al subir archivo.");
        } finally {
            setIsUploadingFile(false);
        }
    };

    const handleSend = async () => {
        if (!msgInput.trim() || isThinking) return;
        playNeonClick();
        const newHistory = [...ariMsgs, { role: 'user' as const, text: msgInput }];
        setAriMsgs(newHistory);
        setMsgInput('');
        setIsThinking(true);

        const activeComercios = comercios.filter(c => c.entityType !== 'enterprise' && c.status === 'active').length;
        const totalComercios = comercios.filter(c => c.entityType !== 'enterprise').length;
        const totalIndustrias = comercios.filter(c => c.entityType === 'enterprise').length;
        const totalClientes = clientes.length;

        // Semáforo Financiero
        const paidCount = facturas.filter(f => f.status === 'paid').length;
        const pendingCount = facturas.filter(f => f.status === 'pending').length;
        const overdueCount = facturas.filter(f => f.status === 'uncollectible' || f.status === 'suspended').length;

        const currentBudgetSummary = `
KPIs ADMINISTRATIVOS ACTUALES:
- Comercios Activos: ${activeComercios} de ${totalComercios} totales
- Industrias B2B Registradas: ${totalIndustrias}
- Clientes VIP Totales: ${totalClientes}
- Facturación Semáforo: Al Día (${paidCount}), Pendientes (${pendingCount}), Deudores (${overdueCount})
        `;

        const fullContext = `${ARI_ADMIN_PROMPT}\n\n${currentBudgetSummary}`;

        const response = await generateAriResponse(
            newHistory.map(m => ({ role: m.role === 'ari' ? 'ari' as const : 'director' as const, text: m.text })),
            fullContext
        );
        setAriMsgs(prev => [...prev, { role: 'ari' as const, text: response }]);
        setIsThinking(false);
    };

    // Actions
    const approveStore = async (id: string) => {
        playNeonClick();
        if (!window.confirm("¿Confirmás la aprobación y despliegue del comercio en la red?")) return;
        try {
            await actualizarComercio(id, { status: 'active' });
            alert("Comercio aprobado y desplegado con éxito.");
        } catch (e) {
            alert("Error al aprobar comercio.");
        }
    };

    const suspendStore = async (id: string) => {
        playNeonClick();
        if (!window.confirm("¿Confirmás la suspensión temporal del comercio?")) return;
        try {
            await actualizarComercio(id, { status: 'suspended' });
            alert("Comercio suspendido.");
        } catch (e) {
            alert("Error al suspender comercio.");
        }
    };

    const triggerMakeDispatch = (invoice: any) => {
        if (isDispatchingInvoice) return;
        playNeonClick();
        setIsDispatchingInvoice(true);
        setMakeDispatchLog([]);

        const logs = [
            { text: `[DISPATCH] Iniciando despacho de Factura ID: ${invoice.id}...`, delay: 0 },
            { text: `[MAKE] Disparando webhook de Make.com (Escenario 5260209)...`, delay: 1000 },
            { text: `[RENDER] Generando comprobante electrónico PDF en la nube...`, delay: 2500 },
            { text: `[API] Conectando con Meta Cloud API para WhatsApp Business...`, delay: 4000 },
            { text: `[SMS] Enviando plantilla certificada a dueño: ${invoice.ownerPhone || '1152668273'}`, delay: 5500 },
            { text: `[OK] PDF despachado exitosamente. WhatsApp entregado y leído.`, delay: 7000 }
        ];

        logs.forEach((log, index) => {
            setTimeout(() => {
                setMakeDispatchLog(prev => [...prev, log.text]);
                if (index === logs.length - 1) {
                    setIsDispatchingInvoice(false);
                }
            }, log.delay);
        });
    };

    // Filters for 4 core lists
    const retailShops = comercios.filter(c => c.entityType !== 'enterprise');
    const industries = comercios.filter(c => c.entityType === 'enterprise');

    const pendingRetail = retailShops.filter(c => c.status === 'incubacion' || c.status === 'pending_review');
    const activeRetail = retailShops.filter(c => c.status === 'active');
    const suspendedRetail = retailShops.filter(c => c.status === 'suspended');

    const paidInvoices = facturas.filter(f => f.status === 'paid');
    const pendingInvoices = facturas.filter(f => f.status === 'pending');
    const overdueInvoices = facturas.filter(f => f.status === 'uncollectible' || f.status === 'suspended');

    if (authLoading) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mb-4"></div>
                <p className="text-[10px] text-white/30 uppercase tracking-[0.3em] font-bold">Verificando Huella de Acceso...</p>
            </div>
        );
    }

    // Lockdown Screen
    if (isDataLeakedBlock) {
        return (
            <div className="min-h-screen bg-[#050300] flex flex-col items-center justify-center p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.15),transparent_70%)] pointer-events-none animate-pulse"></div>
                <div className="absolute inset-0 bg-[linear-gradient(rgba(245,158,11,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(245,158,11,0.015)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none"></div>

                <div className="relative mb-8">
                    <div className="w-32 h-32 rounded-full bg-amber-950/20 border-2 border-amber-500/40 flex items-center justify-center shadow-[0_0_60px_rgba(245,158,11,0.3)] animate-pulse">
                        <ShieldAlert size={64} className="text-amber-500" />
                    </div>
                </div>

                <h1 className="text-white text-3xl font-[1000] uppercase tracking-[0.2em] text-center mb-3">CIERRE DE SEGURIDAD ACTIVADO</h1>
                <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent mb-4"></div>
                <p className="text-amber-400 font-bold tracking-[0.4em] text-[10px] uppercase mb-6">Bloqueo de Filtración de Datos</p>
                <p className="text-white/50 text-[11px] text-center max-w-xs leading-relaxed border border-amber-500/20 bg-amber-950/5 p-4 rounded-2xl">
                    Se detectó una acción de extracción de datos no autorizada (Copiado o Inspección). La consola ha sido bloqueada y este incidente fue reportado al Director General.
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-8 px-6 py-2.5 bg-amber-500/10 border border-amber-500/35 hover:border-amber-500 rounded-xl text-amber-400 text-xs font-bold uppercase tracking-widest active:scale-95 transition-all"
                >
                    Reiniciar Terminal
                </button>
            </div>
        );
    }

    // Doberman Acceso Denegado
    if (!isAuthorized) {
        return (
            <div className="min-h-screen bg-[#020205] flex flex-col items-center justify-center p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,0,0,0.15),transparent_70%)] pointer-events-none animate-pulse"></div>
                <div className="absolute inset-0 bg-[linear-gradient(rgba(220,38,38,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(220,38,38,0.015)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none"></div>

                <div className="relative mb-8">
                    <div className="w-32 h-32 rounded-full bg-red-950/20 border-2 border-red-500/40 flex items-center justify-center shadow-[0_0_60px_rgba(239,68,68,0.3)] animate-pulse">
                        <Dog size={64} className="text-red-500" />
                    </div>
                </div>

                <h1 className="text-white text-3xl font-[1000] uppercase tracking-[0.3em] text-center mb-3">ZONA COMPARTIMENTADA</h1>
                <p className="text-red-400 font-bold tracking-[0.4em] text-[10px] uppercase mb-6 flex items-center gap-2">
                    <AlertTriangle size={12} /> Protocolo Doberman Activado
                </p>
                <p className="text-white/40 text-[11px] text-center max-w-xs leading-relaxed border border-red-500/20 bg-red-950/5 p-4 rounded-2xl">
                    Acceso exclusivo para Administración o Dirección General. Su intento de ingreso con el correo {user?.email || 'Anónimo'} ha sido registrado.
                </p>
            </div>
        );
    }

    return (
        <div className="h-screen overflow-y-auto overflow-x-hidden relative z-10 w-full bg-[#030200] text-white font-sans flex flex-col selection:bg-amber-500/30">
            {/* Background Malla de Circuitos Ámbar */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-amber-950/5 rounded-full blur-[140px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-yellow-950/5 rounded-full blur-[140px]" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(245,158,11,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(245,158,11,0.012)_1px,transparent_1px)] bg-[size:30px_30px]" />
                {/* Scanline vertical sutil */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/2 to-transparent w-[200%] animate-[scan_8s_linear_infinite]" style={{ transform: 'translateX(-50%)' }} />
            </div>

            {/* Header */}
            <header className="relative z-10 bg-black/60 backdrop-blur-xl border-b border-amber-500/20 py-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_4px_30px_rgba(0,0,0,0.6)]">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <button onClick={() => navigate(-1)} className="p-2.5 bg-white/5 hover:bg-amber-500/10 rounded-xl transition-colors border border-white/10 hover:border-amber-500/30">
                        <ChevronLeft size={18} className="text-amber-400" />
                    </button>
                    <div>
                        <h1 className="text-[14px] font-[1000] uppercase tracking-[0.2em] text-amber-400 flex items-center gap-2 drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]">
                            <Landmark size={14} className="text-amber-400" /> BÚNKER DE GESTIÓN ADMINISTRATIVA
                        </h1>
                        <p className="text-[8px] text-amber-500/60 tracking-[0.3em] font-bold uppercase mt-1">Terminal Operativa · Módulo Omega</p>
                    </div>
                </div>

                <div className="flex items-center flex-wrap gap-3 w-full sm:w-auto justify-end">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-950/10 border border-amber-500/20 rounded-lg">
                        <Clock size={12} className="text-amber-400" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-amber-300">
                            {currentTime.toLocaleTimeString('es-AR')}
                        </span>
                    </div>

                    {temp !== null && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-950/10 border border-amber-500/20 rounded-lg">
                            <span className="text-[9px] font-black text-amber-300 flex items-center gap-1">
                                {getWeatherEmoji(weatherCode)} {temp}°C
                            </span>
                            <span className="text-[8px] uppercase tracking-widest text-amber-500/50 border-l border-amber-500/20 pl-2">
                                <MapPin size={9} className="inline mr-1" />{townId === 'esteban-echeverria' ? 'Echeverría' : townId.toUpperCase()}
                            </span>
                        </div>
                    )}

                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border bg-emerald-500/10 border-emerald-500/35">
                        <ShieldCheck size={12} className="text-emerald-400" />
                        <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-300">Doberman: Seguro</span>
                    </div>
                </div>
            </header>

            {/* MUEBLE 2: Enlaces de Artillería Externa */}
            <div className="relative z-10 max-w-[1600px] w-full mx-auto px-4 md:px-6 mt-6 shrink-0">
                <div className="bg-black/55 border border-amber-500/15 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 backdrop-blur-md">
                    <div className="flex items-center gap-2">
                        <Cpu size={14} className="text-amber-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400">Artillería Externa (Enlaces Cifrados)</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full md:w-auto">
                        <a 
                            href="https://drive.google.com" target="_blank" rel="noopener noreferrer"
                            className="px-4 py-2 border border-amber-500/25 hover:border-amber-400 rounded-xl text-[10px] font-bold uppercase tracking-widest text-amber-300 hover:text-white transition-all flex items-center justify-center gap-2 hover:shadow-[0_0_15px_rgba(245,158,11,0.15)] bg-amber-950/5 active:scale-95"
                        >
                            <FolderOpen size={12} /> Bóveda Drive
                        </a>
                        <a 
                            href="https://us1.make.com/5260209" target="_blank" rel="noopener noreferrer"
                            className="px-4 py-2 border border-amber-500/25 hover:border-amber-400 rounded-xl text-[10px] font-bold uppercase tracking-widest text-amber-300 hover:text-white transition-all flex items-center justify-center gap-2 hover:shadow-[0_0_15px_rgba(245,158,11,0.15)] bg-amber-950/5 active:scale-95"
                        >
                            <Zap size={12} className="animate-pulse" /> Cañerías Make
                        </a>
                        <a 
                            href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer"
                            className="px-4 py-2 border border-amber-500/25 hover:border-amber-400 rounded-xl text-[10px] font-bold uppercase tracking-widest text-amber-300 hover:text-white transition-all flex items-center justify-center gap-2 hover:shadow-[0_0_15px_rgba(245,158,11,0.15)] bg-amber-950/5 active:scale-95"
                        >
                            <ExternalLink size={12} /> Meta Developers
                        </a>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <main className="flex-1 relative z-10 flex flex-col xl:flex-row w-full max-w-[1600px] mx-auto p-4 md:p-6 gap-6 min-h-[calc(100vh-160px)] pb-20">
                
                {/* Columna Izquierda: Grid Core de 4 Térmicas */}
                <div className="flex-[3] flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">

                        {/* CUADRANTE A: Terminal de Red Minorista (Comercios) */}
                        <div className="bg-black/55 border border-amber-500/20 hover:border-amber-500/30 rounded-3xl p-5 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.5)] transition-all flex flex-col h-[400px]">
                            <div className="flex items-center justify-between border-b border-amber-500/15 pb-3 mb-3 shrink-0">
                                <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-amber-400 flex items-center gap-2">
                                    <Store size={14} className="text-amber-400" /> Red Minorista (Comercios)
                                </h3>
                                <span className="text-[9px] font-black text-amber-300 bg-amber-500/10 px-2 py-0.5 border border-amber-500/20 rounded-md">
                                    Activos: {activeRetail.length} / {retailShops.length}
                                </span>
                            </div>

                            <div className="flex-1 overflow-y-auto font-sans text-[11px] space-y-2.5 pr-1 custom-scrollbar">
                                {/* Incubando o Pendientes */}
                                {pendingRetail.length > 0 && (
                                    <div className="space-y-1.5">
                                        <h4 className="text-[9px] font-black uppercase tracking-wider text-yellow-500/70">Pendientes de Aprobación ({pendingRetail.length})</h4>
                                        {pendingRetail.map(shop => (
                                            <div key={shop.id} className="p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-xl flex items-center justify-between gap-3">
                                                <div className="truncate">
                                                    <span className="font-bold text-white block truncate">{shop.name}</span>
                                                    <span className="text-[9.5px] text-white/45 truncate block">{shop.category} · {shop.zone || 'Echeverría'}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    <button 
                                                        onClick={() => approveStore(shop.id)}
                                                        className="px-2.5 py-1 bg-yellow-500/20 hover:bg-yellow-500 rounded-lg text-yellow-300 hover:text-black font-bold uppercase text-[9px] tracking-wider transition-all border border-yellow-500/30 active:scale-95"
                                                    >
                                                        Aprobar
                                                    </button>
                                                    <button 
                                                        onClick={() => navigate(`/${townId}/embajador/editar/${shop.id}`)}
                                                        className="p-1 hover:bg-white/5 border border-white/10 hover:border-white/25 rounded-lg text-white/60 hover:text-white transition-all"
                                                    >
                                                        <Edit size={10} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Activos */}
                                <div className="space-y-1.5">
                                    <h4 className="text-[9px] font-black uppercase tracking-wider text-emerald-500/70">Comercios Activos ({activeRetail.length})</h4>
                                    {activeRetail.length === 0 ? (
                                        <div className="text-white/20 text-center py-4">No hay comercios activos.</div>
                                    ) : (
                                        activeRetail.map(shop => (
                                            <div key={shop.id} className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-between gap-3">
                                                <div className="truncate">
                                                    <span className="font-bold text-white/90 block truncate">{shop.name}</span>
                                                    <span className="text-[9px] text-white/40 block truncate">{shop.category} · {shop.zone}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    <button 
                                                        onClick={() => suspendStore(shop.id)}
                                                        className="px-2.5 py-1 bg-zinc-900 hover:bg-red-500/10 border border-zinc-800 hover:border-red-500/30 rounded-lg text-white/40 hover:text-red-400 font-bold uppercase text-[9px] tracking-wider transition-all active:scale-95"
                                                    >
                                                        Suspender
                                                    </button>
                                                    <button 
                                                        onClick={() => navigate(`/${townId}/embajador/editar/${shop.id}`)}
                                                        className="p-1 hover:bg-white/5 border border-white/10 hover:border-white/25 rounded-lg text-white/60 hover:text-white transition-all"
                                                    >
                                                        <Edit size={10} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Suspendidos */}
                                {suspendedRetail.length > 0 && (
                                    <div className="space-y-1.5">
                                        <h4 className="text-[9px] font-black uppercase tracking-wider text-red-500/70">Comercios Suspendidos ({suspendedRetail.length})</h4>
                                        {suspendedRetail.map(shop => (
                                            <div key={shop.id} className="p-2.5 bg-red-500/5 border border-red-500/20 rounded-xl flex items-center justify-between gap-3">
                                                <span className="font-bold text-red-300 truncate block">{shop.name}</span>
                                                <button 
                                                    onClick={() => approveStore(shop.id)}
                                                    className="px-2.5 py-1 bg-red-500/20 hover:bg-emerald-500 rounded-lg text-red-300 hover:text-black font-bold uppercase text-[9px] tracking-wider transition-all border border-red-500/30 active:scale-95"
                                                >
                                                    Re-Activar
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* CUADRANTE B: Terminal de Nodo Industrial (Industrias B2B) */}
                        <div className="bg-black/55 border border-amber-500/20 hover:border-amber-500/30 rounded-3xl p-5 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.5)] transition-all flex flex-col h-[400px]">
                            <div className="flex items-center justify-between border-b border-amber-500/15 pb-3 mb-3 shrink-0">
                                <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-violet-400 flex items-center gap-2">
                                    <Factory size={14} className="text-violet-400" /> Nodo Industrial (B2B)
                                </h3>
                                <span className="text-[9px] font-black text-violet-300 bg-violet-500/10 px-2 py-0.5 border border-violet-500/20 rounded-md">
                                    Total: {industries.length}
                                </span>
                            </div>

                            <div className="flex-1 overflow-y-auto font-sans text-[11px] space-y-2.5 pr-1 custom-scrollbar">
                                {industries.length === 0 ? (
                                    <div className="text-white/20 text-center py-12">No hay industrias registradas en la zona.</div>
                                ) : (
                                    industries.map(ind => {
                                        const hasGmail = ind.email || ind.ownerName;
                                        return (
                                            <div key={ind.id} className="p-3 bg-zinc-950 border border-violet-500/15 hover:border-violet-500/40 rounded-xl flex items-center justify-between gap-3 shadow-[0_2px_10px_rgba(168,85,247,0.02)]">
                                                <div className="truncate">
                                                    <span className="font-bold text-white block truncate">{ind.name}</span>
                                                    <span className="text-[9.5px] text-violet-300 truncate block mt-0.5">{ind.specialty || 'Servicios Industriales'}</span>
                                                    
                                                    <div className="flex items-center gap-1.5 mt-1">
                                                        <span className="text-[8px] text-violet-400 px-1.5 py-0.2 bg-violet-500/10 border border-violet-500/20 rounded">
                                                            Reach: {ind.reach || 'local'}
                                                        </span>
                                                        <span className={`text-[8px] px-1.5 py-0.2 rounded border ${
                                                            hasGmail 
                                                                ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
                                                                : 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                                                        }`}>
                                                            {hasGmail ? 'Gmail Link Ok' : 'Falta Gmail'}
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                <button 
                                                    onClick={() => navigate(`/empresas/${ind.category}/${ind.slug}`)}
                                                    className="p-1.5 hover:bg-violet-500/10 border border-violet-500/20 hover:border-violet-400 rounded-lg text-violet-400 transition-all active:scale-95 shrink-0"
                                                >
                                                    <ArrowUpRight size={12} />
                                                </button>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* CUADRANTE C: Terminal de Socios de Calle (Clientes VIP) */}
                        <div className="bg-black/55 border border-amber-500/20 hover:border-amber-500/30 rounded-3xl p-5 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.5)] transition-all flex flex-col h-[400px]">
                            <div className="flex items-center justify-between border-b border-amber-500/15 pb-3 mb-3 shrink-0">
                                <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-cyan-400 flex items-center gap-2">
                                    <Users size={14} className="text-cyan-400" /> Socios de Calle (B2C VIP)
                                </h3>
                                <span className="text-[9px] font-black text-cyan-300 bg-cyan-500/10 px-2 py-0.5 border border-cyan-500/20 rounded-md">
                                    Total: {clientes.length}
                                </span>
                            </div>

                            <div className="flex-1 overflow-y-auto font-sans text-[11px] space-y-2.5 pr-1 custom-scrollbar">
                                {clientes.length === 0 ? (
                                    <div className="text-white/20 text-center py-12">No hay clientes registrados en esta zona.</div>
                                ) : (
                                    clientes.map(cli => (
                                        <div key={cli.id} className="p-3 bg-zinc-950 border border-cyan-500/10 hover:border-cyan-500/30 rounded-xl flex items-center justify-between gap-3">
                                            <div className="truncate">
                                                <span className="font-bold text-white block truncate">{cli.name}</span>
                                                <span className="text-[9px] text-white/40 block truncate">{cli.email}</span>
                                                <div className="flex items-center gap-1.5 mt-1 font-mono text-[8.5px]">
                                                    <span className="text-cyan-300">VIP: {cli.vipCode || '0000'}</span>
                                                    <span className="text-white/30">|</span>
                                                    <span className="text-cyan-400/70">Credencial: {cli.vipStatus || 'active'}</span>
                                                </div>
                                            </div>

                                            <button 
                                                onClick={() => { playNeonClick(); setSelectedClient(cli); }}
                                                className="p-1.5 hover:bg-cyan-500/10 border border-cyan-500/25 hover:border-cyan-400 rounded-lg text-cyan-300 transition-all active:scale-95 shrink-0 flex items-center gap-1"
                                            >
                                                <Eye size={12} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* CUADRANTE D: Terminal Financiera (Facturación y Cobros) */}
                        <div className="bg-black/55 border border-amber-500/20 hover:border-amber-500/30 rounded-3xl p-5 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.5)] transition-all flex flex-col h-[400px]">
                            <div className="flex items-center justify-between border-b border-amber-500/15 pb-3 mb-3 shrink-0">
                                <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-yellow-500 flex items-center gap-2">
                                    <Landmark size={14} className="text-yellow-500" /> Terminal Financiera
                                </h3>
                                <div className="flex gap-1">
                                    <span className="text-[8px] font-bold text-emerald-400 px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded">
                                        Al Día: {paidInvoices.length}
                                    </span>
                                    <span className="text-[8px] font-bold text-amber-400 px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded">
                                        Vencer: {pendingInvoices.length}
                                    </span>
                                    <span className="text-[8px] font-bold text-red-400 px-1.5 py-0.5 bg-red-500/10 border border-red-500/20 rounded">
                                        Deudor: {overdueInvoices.length}
                                    </span>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto font-sans text-[11.5px] space-y-3 pr-1 custom-scrollbar">
                                {/* Make webhook log simulation console */}
                                {makeDispatchLog.length > 0 && (
                                    <div className="bg-[#050300] border border-amber-500/20 rounded-xl p-3 font-mono text-[9px] text-amber-300 space-y-1">
                                        <div className="flex items-center justify-between border-b border-amber-500/10 pb-1 mb-1 font-bold">
                                            <span>Consola de Despacho (Make escenario 5260209)</span>
                                            <button onClick={() => setMakeDispatchLog([])} className="text-white/40 hover:text-white">x</button>
                                        </div>
                                        {makeDispatchLog.map((log, idx) => <div key={idx}>{log}</div>)}
                                    </div>
                                )}

                                {facturas.length === 0 ? (
                                    <div className="text-white/20 text-center py-12">Sin suscripciones ni facturas registradas en la zona.</div>
                                ) : (
                                    facturas.map(inv => {
                                        let badgeColor = 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
                                        if (inv.status === 'pending') badgeColor = 'text-amber-400 border-amber-500/20 bg-amber-500/5';
                                        else if (inv.status === 'uncollectible' || inv.status === 'suspended') badgeColor = 'text-red-400 border-red-500/20 bg-red-500/5';

                                        return (
                                            <div key={inv.id} className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-between gap-3">
                                                <div className="truncate">
                                                    <span className="font-bold text-white block truncate">Monto: ${inv.amount} ARS</span>
                                                    <span className="text-[9px] text-white/40 block truncate">Período: {inv.period || 'Junio 2026'} · Comercio ID: {inv.shopId}</span>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className={`text-[8px] font-black uppercase px-2 py-0.2 rounded border ${badgeColor}`}>
                                                            {inv.status}
                                                        </span>
                                                        {inv.promocional && (
                                                            <span className="text-[8px] text-yellow-300 font-bold bg-yellow-500/10 border border-yellow-500/25 px-1.5 rounded">
                                                                Mes Gratis
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <button 
                                                    onClick={() => triggerMakeDispatch(inv)}
                                                    disabled={isDispatchingInvoice}
                                                    className="p-2 bg-amber-500/10 hover:bg-amber-500 border border-amber-500/35 hover:border-amber-500 rounded-xl text-amber-300 hover:text-black transition-all active:scale-90 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                                >
                                                    <FileDown size={12} />
                                                </button>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                    </div>
                </div>

                {/* Columna Derecha: Chat Centinela ARI */}
                <div className="flex-[2] w-full bg-black/85 backdrop-blur-3xl border border-amber-500/20 hover:border-amber-500/35 rounded-3xl overflow-hidden flex flex-col relative shadow-[0_0_40px_rgba(245,158,11,0.12)] h-[670px] shrink-0">
                    <div className="bg-gradient-to-r from-amber-950/40 to-orange-950/40 p-4 border-b border-amber-500/20 flex items-center gap-4">
                        <div className="relative">
                            <div className="w-12 h-12 rounded-2xl bg-black border border-amber-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                                <Cpu size={24} className="text-amber-400" />
                            </div>
                            <div className="absolute inset-0 bg-amber-500 blur-xl opacity-40 animate-pulse"></div>
                            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-amber-400 border-2 border-black rounded-full"></span>
                        </div>
                        <div>
                            <h2 className="text-[16px] font-[1000] uppercase tracking-widest text-white">Ari</h2>
                            <p className="text-[8px] text-amber-400 font-bold tracking-[0.3em] uppercase">COO General · Frecuencia Ámbar</p>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-5 pb-24 space-y-4 no-scrollbar">
                        {ariMsgs.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'ari' ? 'justify-start' : 'justify-end'}`}>
                                <div className={`max-w-[85%] rounded-2xl p-4 text-[13px] leading-relaxed ${
                                    msg.role === 'ari' 
                                        ? 'bg-amber-950/20 border border-amber-500/30 text-white rounded-tl-sm shadow-[0_5px_15px_rgba(245,158,11,0.05)]' 
                                        : 'bg-white/5 border border-white/10 text-white rounded-tr-sm'
                                }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isThinking && (
                            <div className="flex justify-start">
                                <div className="max-w-[85%] rounded-2xl p-4 bg-amber-950/20 border border-amber-500/25 text-white rounded-tl-sm flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce"></div>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/90 to-transparent">
                        <div className="bg-black border border-amber-500/40 rounded-2xl flex items-center p-2 focus-within:border-amber-400 focus-within:shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all">
                            <input 
                                type="file" 
                                id="chat-file-admin"
                                onChange={handleChatFileChange}
                                className="hidden"
                                accept="image/*,application/pdf"
                            />
                            <label 
                                htmlFor="chat-file-admin" 
                                className="p-2 text-white/40 hover:text-amber-400 hover:bg-amber-500/10 rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0 active:scale-90"
                                title="Adjuntar foto o PDF"
                            >
                                <Paperclip size={16} className={isUploadingFile ? "animate-spin" : ""} />
                            </label>
                            <input 
                                type="text"
                                value={msgInput}
                                onChange={e => setMsgInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSend()}
                                placeholder="Escribile a Ari de Administración..."
                                className="flex-1 bg-transparent text-white text-[12px] px-3 outline-none placeholder:text-white/20"
                            />
                            <button onClick={handleSend} className="w-10 h-10 bg-amber-500/20 hover:bg-amber-500 border border-amber-500/50 rounded-xl flex items-center justify-center text-amber-300 hover:text-white transition-all active:scale-90">
                                <MessageSquare size={16} />
                            </button>
                        </div>
                    </div>
                </div>

            </main>

            <BtuComponent 
                bunkerId="administracion"
                townId={townId}
                onInjectToAri={(text) => {
                    setMsgInput(text);
                }}
            />

            {/* MODAL: Cliente VIP Celeste Neón Credencial */}
            {selectedClient && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-black border-2 border-cyan-500 rounded-3xl p-6 max-w-sm w-full relative overflow-hidden shadow-[0_0_50px_rgba(34,211,238,0.25)]">
                        {/* Mesh grid for credential */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
                        
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-16 h-16 rounded-full bg-cyan-950/20 border border-cyan-500/50 flex items-center justify-center mb-4">
                                <Users size={32} className="text-cyan-400" />
                            </div>

                            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/25 mb-2">
                                SOCIO VIP REGIONAL
                            </span>

                            <h3 className="text-xl font-[1000] text-center tracking-wide text-white mb-1">{selectedClient.name}</h3>
                            <p className="text-[10px] text-white/50 mb-4">{selectedClient.email}</p>

                            <div className="bg-[#020508] border border-cyan-500/20 rounded-2xl p-4 w-full text-center space-y-2.5 mb-5 shadow-[inset_0_0_15px_rgba(34,211,238,0.05)]">
                                <div>
                                    <span className="text-[8px] uppercase tracking-widest text-white/40 block">Código Único VIP</span>
                                    <span className="font-mono text-lg font-black text-cyan-300 tracking-widest block">{selectedClient.vipCode || '0000'}</span>
                                </div>
                                <div className="border-t border-cyan-500/10 pt-2.5">
                                    <span className="text-[8px] uppercase tracking-widest text-white/40 block">Saldo Virtual</span>
                                    <span className="font-black text-lg text-emerald-400 block">${selectedClient.balance || 0}</span>
                                </div>
                            </div>

                            {/* Rolling anti-screenshot counter */}
                            <div className="w-full bg-cyan-950/10 border border-cyan-500/15 rounded-xl py-2 px-3 flex items-center justify-between text-[10px] font-mono mb-6">
                                <div className="flex items-center gap-1.5 text-cyan-300">
                                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                                    <span className="font-bold">{antiScreenshotToken}</span>
                                </div>
                                <span className="text-white/40 text-[9px]">Expira en: {tokenTimeLeft}s</span>
                            </div>

                            <button 
                                onClick={() => setSelectedClient(null)}
                                className="w-full py-2.5 bg-cyan-500/10 border border-cyan-500/35 hover:border-cyan-400 rounded-xl text-cyan-300 text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all"
                            >
                                Cerrar Credencial
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
