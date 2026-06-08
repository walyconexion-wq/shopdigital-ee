import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
    Clock, MapPin, ChevronLeft, ShieldCheck, Dog, ShieldAlert, 
    Cpu, MessageSquare, ExternalLink, Activity, ArrowUpRight, 
    Play, RefreshCw, Shield, AlertTriangle, Database, Zap, Sparkles, Paperclip
} from 'lucide-react';
import { useAuth } from '../components/AuthContext';
import { playNeonClick } from '../utils/audio';
import { generateAriResponse } from '../services/gemini';
import { registrarIntrusionBunker, obtenerIntrusiones, subirArchivoBunker } from '../firebase';
import { BtuComponent } from '../components/BtuComponent';
import { DirectiveNotifier } from '../components/DirectiveNotifier';

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

const ARI_SECOPS_PROMPT = `
Sos ARI, la Oficial de Inteligencia en Ciberseguridad y Administradora de Sistemas del Búnker SecOps de Shop Digital. Tu superior directo es el Director (Waly / Walter Alfredo Miranda) y el personal de seguridad autorizado. Te comunicás en la Frecuencia Verde Matrix: un tono directo, enfocado en ciberseguridad, cortafuegos, vulnerabilidades, cifrado y balanceo de carga (usás "Comandante", "Cortafuegos", "Doberman", "Puertos", "IP", "Exploit").

Tu propósito es asesorar sobre seguridad informática, reglas de Firestore, prevención de intrusiones, compresión de almacenamiento y escalabilidad del servidor.
`;

export const SecOpsBunkerPage: React.FC = () => {
    const navigate = useNavigate();
    const { townId = 'esteban-echeverria' } = useParams<{ townId: string }>();
    const { user, loading: authLoading } = useAuth();
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Chat states
    const [ariMsgs, setAriMsgs] = useState([
        { role: 'ari' as 'ari' | 'user', text: 'Sistemas de seguridad en línea, Comandante. Cortafuegos activado y Protocolo Doberman en vigilancia. ¿Qué métrica revisamos hoy?' }
    ]);
    const [msgInput, setMsgInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    
    // Header states
    const [currentTime, setCurrentTime] = useState(new Date());
    const [temp, setTemp] = useState<number | null>(null);
    const [weatherCode, setWeatherCode] = useState<number | null>(null);
    const [intrusionRegistered, setIntrusionRegistered] = useState(false);
    const [activeDirectivesText, setActiveDirectivesText] = useState("");

    const [isUploadingFile, setIsUploadingFile] = useState(false);
    const handleChatFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        playNeonClick();
        setIsUploadingFile(true);
        try {
            const path = `bunker_chat/secops/${Date.now()}_${file.name}`;
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

    // Module 1: Monitor Doberman states
    const [securityLogs, setSecurityLogs] = useState<any[]>([]);
    const [isLoadingLogs, setIsLoadingLogs] = useState(false);

    // Module 2: Compactador states
    const [compressCanvas, setCompressCanvas] = useState(true);
    const [savedSpace, setSavedSpace] = useState(4.82);

    // Module 3: Pentesting states
    const [pentestLogs, setPentestLogs] = useState<string[]>([]);
    const [isPentesting, setIsPentesting] = useState(false);
    const [pentestPercent, setPentestPercent] = useState(0);

    // Module 4: Telemetría states
    const [dbReads, setDbReads] = useState<number[]>([24, 32, 28, 45, 52, 48, 62, 55, 68, 72, 60, 58]);
    const [bandwidth, setBandwidth] = useState<number[]>([120, 145, 130, 185, 210, 190, 240, 220, 265, 280, 230, 215]);
    const [trafficPeakMode, setTrafficPeakMode] = useState(false);

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
                         user?.email?.trim().toLowerCase() === 'sistemas@shopdigital.ar' ||
                         user?.email?.trim().toLowerCase() === 'seguridad@shopdigital.ar' ||
                         user?.email?.trim().toLowerCase() === 'secops@shopdigital.ar' ||
                         window.location.hostname === 'localhost' ||
                         window.location.hostname === '127.0.0.1';

    useEffect(() => {
        if (authLoading) return;
        if (!isAuthorized && !intrusionRegistered) {
            setIntrusionRegistered(true);
            registrarIntrusionBunker((user?.email || 'anonimo') + ' (Bunker: SecOps)');
        }
    }, [isAuthorized, user, intrusionRegistered, authLoading]);

    // Fetch Security Logs
    const loadLogs = async () => {
        setIsLoadingLogs(true);
        try {
            const logs = await obtenerIntrusiones(12);
            setSecurityLogs(logs);
        } catch (e) {
            console.error("Error cargando logs:", e);
        } finally {
            setIsLoadingLogs(false);
        }
    };

    useEffect(() => {
        if (isAuthorized) {
            loadLogs();
        }
    }, [isAuthorized]);

    // Scroll Chat to bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [ariMsgs, isThinking]);

    // Telemetry Realtime Updates
    useEffect(() => {
        const telemetryInterval = setInterval(() => {
            setDbReads(prev => {
                const base = trafficPeakMode ? 120 : 45;
                const variance = trafficPeakMode ? 35 : 15;
                const nextVal = Math.max(10, Math.round(base + (Math.random() - 0.5) * variance));
                return [...prev.slice(1), nextVal];
            });
            setBandwidth(prev => {
                const base = trafficPeakMode ? 480 : 180;
                const variance = trafficPeakMode ? 110 : 40;
                const nextVal = Math.max(20, Math.round(base + (Math.random() - 0.5) * variance));
                return [...prev.slice(1), nextVal];
            });
            if (compressCanvas) {
                setSavedSpace(prev => prev + 0.001);
            }
        }, 1500);

        return () => clearInterval(telemetryInterval);
    }, [trafficPeakMode, compressCanvas]);

    const handleSend = async () => {
        if (!msgInput.trim() || isThinking) return;
        playNeonClick();
        const newHistory = [...ariMsgs, { role: 'user' as const, text: msgInput }];
        setAriMsgs(newHistory);
        setMsgInput('');
        setIsThinking(true);

        const currentSecOpsSummary = `
KPIs DE CIBERSEGURIDAD Y SECOPS:
- Estado del Cortafuegos: Activo (Uptime 100%)
- Módulo Doberman: Vigilando activamente. ${securityLogs.length} logs de intrusión cargados.
- Compresión de Red Canvas: ${compressCanvas ? "Forzada a 300kb activa (Ahorro Firebase: " + savedSpace.toFixed(3) + " GB)" : "Inactiva"}
- Alertas de Picos de Tráfico: ${trafficPeakMode ? "ACTIVADA - PICO DE TRÁFICO SIMULADO" : "Normal"}
        `;

        const fullContext = `${ARI_SECOPS_PROMPT}\n\n${currentSecOpsSummary}\n\n${activeDirectivesText}`;

        const response = await generateAriResponse(
            newHistory.map(m => ({ role: m.role === 'ari' ? 'ari' as const : 'director' as const, text: m.text })),
            fullContext
        );
        setAriMsgs(prev => [...prev, { role: 'ari' as const, text: response }]);
        setIsThinking(false);
    };

    // Run Pentesting Simulation
    const runPentest = () => {
        if (isPentesting) return;
        playNeonClick();
        setIsPentesting(true);
        setPentestPercent(0);
        setPentestLogs([]);

        const steps = [
            { text: '[INIT] Inicializando escaneo de seguridad en puertos y reglas...', delay: 0 },
            { text: '[RUN] Analizando firestore.rules para reglas públicas de escritura...', delay: 1000 },
            { text: '[SAFE] Reglas de lectura en /securityLogs y /appConfig verificadas.', delay: 2000 },
            { text: '[RUN] Evaluando expiración de tokens en sesiones de Embajador...', delay: 3000 },
            { text: '[SAFE] Sesiones inactivas purgadas con éxito.', delay: 4000 },
            { text: '[RUN] Escaneando Base de Datos en búsqueda de documentos huérfanos...', delay: 5000 },
            { text: '[OK] Cero fugas de información o escrituras no autorizadas detectadas.', delay: 6500 },
            { text: '[STATUS] ESCANEO COMPLETADO: SISTEMA SECOPS 100% SEGURO.', delay: 8000 }
        ];

        steps.forEach((step, index) => {
            setTimeout(() => {
                setPentestLogs(prev => [...prev, step.text]);
                setPentestPercent(Math.round(((index + 1) / steps.length) * 100));
                if (index === steps.length - 1) {
                    setIsPentesting(false);
                }
            }, step.delay);
        });
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
                <p className="text-[10px] text-white/30 uppercase tracking-[0.3em] font-bold">Verificando Huella SecOps...</p>
            </div>
        );
    }

    // Doberman Acceso Denegado
    if (!isAuthorized) {
        return (
            <div className="min-h-screen bg-[#020205] flex flex-col items-center justify-center p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,0,0,0.15),transparent_70%)] pointer-events-none animate-pulse"></div>
                
                {/* Tech Grid Line Bg */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(220,38,38,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(220,38,38,0.015)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none"></div>

                <div className="relative mb-8">
                    <div className="w-32 h-32 rounded-full bg-red-950/20 border-2 border-red-500/40 flex items-center justify-center shadow-[0_0_60px_rgba(239,68,68,0.3)] animate-pulse">
                        <Dog size={64} className="text-red-500" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white text-[10px] font-black">!</div>
                </div>

                <h1 className="text-white text-3xl font-[1000] uppercase tracking-[0.3em] text-center mb-3">ZONA COMPARTIMENTADA</h1>
                <p className="text-red-400 font-bold tracking-[0.4em] text-[10px] uppercase mb-6 flex items-center gap-2">
                    <AlertTriangle size={12} /> Protocolo Doberman Activado
                </p>
                <p className="text-white/40 text-[11px] text-center max-w-xs leading-relaxed border border-red-500/20 bg-red-950/5 p-4 rounded-2xl">
                    Acceso restringido exclusivamente a Personal de SecOps o Director General. El intento de intrusión de <strong className="text-red-400">{user?.email || 'Anónimo'}</strong> ha sido capturado e inyectado al Monitor Doberman.
                </p>
                <button 
                    onClick={() => navigate(`/${townId}/home`)}
                    className="mt-8 px-6 py-2.5 bg-red-500/10 border border-red-500/30 hover:border-red-500 rounded-xl text-red-400 text-xs font-bold uppercase tracking-widest active:scale-95 transition-all"
                >
                    Retirarse de la Base
                </button>
            </div>
        );
    }

    return (
        <div className="h-screen overflow-y-auto overflow-x-hidden relative z-10 w-full bg-[#020406] text-white font-sans flex flex-col selection:bg-emerald-500/30">
            {/* Background Malla Tecnológica Verde */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-emerald-950/10 rounded-full blur-[140px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-teal-950/10 rounded-full blur-[140px]" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.015)_1px,transparent_1px)] bg-[size:35px_35px]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,#020406_90%)]" />
            </div>

            {/* Header */}
            <header className="relative z-10 bg-black/50 backdrop-blur-xl border-b border-emerald-500/20 py-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_4px_30px_rgba(0,0,0,0.6)]">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <button onClick={() => navigate(-1)} className="p-2.5 bg-white/5 hover:bg-emerald-500/10 rounded-xl transition-colors border border-white/10 hover:border-emerald-500/30">
                        <ChevronLeft size={18} className="text-emerald-400" />
                    </button>
                    <div>
                        <h1 className="text-[14px] font-[1000] uppercase tracking-[0.2em] text-emerald-400 flex items-center gap-2 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]">
                            <Shield size={14} className="text-emerald-400" /> BÚNKER DE CIBERSEGURIDAD Y SECOPS
                        </h1>
                        <p className="text-[8px] text-emerald-500/60 tracking-[0.3em] font-bold uppercase mt-1">NÚCLEO OMEGA · CONTROL CORTAFUEGOS</p>
                    </div>
                </div>
                
                <div className="flex items-center flex-wrap gap-3 w-full sm:w-auto justify-end">
                    {/* Reloj */}
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-950/10 border border-emerald-500/20 rounded-lg">
                        <Clock size={12} className="text-emerald-400" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-emerald-300">
                            {currentTime.toLocaleTimeString('es-AR')}
                        </span>
                    </div>

                    {/* Clima */}
                    {temp !== null && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-950/10 border border-emerald-500/20 rounded-lg">
                            <span className="text-[9px] font-black text-emerald-300 flex items-center gap-1">
                                {getWeatherEmoji(weatherCode)} {temp}°C
                            </span>
                            <span className="text-[8px] uppercase tracking-widest text-emerald-500/50 border-l border-emerald-500/20 pl-2">
                                <MapPin size={9} className="inline mr-1" />{townId === 'esteban-echeverria' ? 'Echeverría' : townId.toUpperCase()}
                            </span>
                        </div>
                    )}

                    {/* Doberman Badge */}
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border bg-emerald-500/10 border-emerald-500/35 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                        <ShieldCheck size={12} className="text-emerald-400 animate-pulse" />
                        <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-300">Doberman: Vigilando</span>
                    </div>
                </div>
            </header>

            {/* Main Grid */}
            <main className="flex-1 relative z-10 flex flex-col xl:flex-row w-full max-w-[1600px] mx-auto p-4 md:p-6 gap-6 min-h-[calc(100vh-80px)] pb-20">
                
                {/* Columna Izquierda: Mesas de Trabajo */}
                <div className="flex-[3] flex flex-col gap-6">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* MÓDULO 1: Monitor Doberman (Control de Accesos) */}
                        <div className="bg-black/50 border border-emerald-500/20 hover:border-emerald-500/30 rounded-3xl p-5 backdrop-blur-md shadow-[0_4px_25px_rgba(0,0,0,0.5)] transition-all flex flex-col h-[340px]">
                            <div className="flex items-center justify-between border-b border-emerald-500/10 pb-3 mb-3 shrink-0">
                                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-400 flex items-center gap-2">
                                    <Dog size={14} className="text-emerald-400" /> Monitor Doberman (Accesos)
                                </h3>
                                <button 
                                    onClick={loadLogs} 
                                    disabled={isLoadingLogs}
                                    className="p-1.5 hover:bg-emerald-500/10 border border-emerald-500/20 hover:border-emerald-500/40 rounded-lg text-emerald-400 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    <RefreshCw size={12} className={isLoadingLogs ? 'animate-spin' : ''} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto font-mono text-[10px] space-y-2 pr-1 custom-scrollbar">
                                {securityLogs.length === 0 ? (
                                    <div className="text-white/30 text-center py-10">Sin alertas o registros en las últimas 24h</div>
                                ) : (
                                    securityLogs.map((log, index) => {
                                        const isIntrusion = log.type === 'bunker_intrusion';
                                        return (
                                            <div 
                                                key={log.id || index} 
                                                className={`p-2 rounded-lg border ${
                                                    isIntrusion 
                                                        ? 'bg-red-500/5 border-red-500/20 text-red-300' 
                                                        : 'bg-emerald-500/5 border-emerald-500/10 text-emerald-300'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between font-bold text-[9px] mb-1">
                                                    <span className={isIntrusion ? 'text-red-400' : 'text-emerald-400'}>
                                                        {isIntrusion ? '🚨 INTRUSIÓN DETECTADA' : '🟢 ACCESO SEGURO'}
                                                    </span>
                                                    <span className="text-white/40">{log.time || '12:00:00'} · {log.date || 'Hoy'}</span>
                                                </div>
                                                <div className="truncate">Sujeto: {log.email || 'anonimo'}</div>
                                                <div className="text-[9px] text-white/50 flex justify-between mt-1 border-t border-white/5 pt-1">
                                                    <span>IP: {log.ip || 'Local'}</span>
                                                    <span>País: {log.country || 'Desconocido'} ({log.countryCode || '??'})</span>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* MÓDULO 2: Compactador de Carga (Aduana de Datos) */}
                        <div className="bg-black/50 border border-emerald-500/20 hover:border-emerald-500/30 rounded-3xl p-5 backdrop-blur-md shadow-[0_4px_25px_rgba(0,0,0,0.5)] transition-all flex flex-col justify-between h-[340px]">
                            <div>
                                <div className="border-b border-emerald-500/10 pb-3 mb-4">
                                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-400 flex items-center gap-2">
                                        <Database size={14} className="text-emerald-400" /> Compactador de Carga (Aduana)
                                    </h3>
                                </div>

                                <div className="space-y-4">
                                    <div className="p-4 bg-emerald-950/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between">
                                        <div>
                                            <h4 className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">Aduana de Datos</h4>
                                            <p className="text-[9px] text-white/45 mt-0.5">Forzar compresión Canvas a 300kb en toda la red</p>
                                        </div>
                                        <button 
                                            onClick={() => { playNeonClick(); setCompressCanvas(!compressCanvas); }}
                                            className={`w-11 h-6 rounded-full p-1 transition-colors duration-300 outline-none ${
                                                compressCanvas ? 'bg-emerald-500' : 'bg-zinc-800 border border-zinc-700'
                                            }`}
                                        >
                                            <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 ${
                                                compressCanvas ? 'translate-x-5' : 'translate-x-0'
                                            }`} />
                                        </button>
                                    </div>

                                    {/* Métrica de Firebase Storage */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-zinc-950 border border-emerald-500/10 rounded-xl p-3 text-center">
                                            <span className="text-[8px] text-white/40 uppercase tracking-widest block mb-1">Ahorro Firebase</span>
                                            <span className="text-lg font-black text-emerald-400 block tracking-wide">
                                                {savedSpace.toFixed(3)} GB
                                            </span>
                                        </div>
                                        <div className="bg-zinc-950 border border-emerald-500/10 rounded-xl p-3 text-center">
                                            <span className="text-[8px] text-white/40 uppercase tracking-widest block mb-1">Ratio Promedio</span>
                                            <span className="text-lg font-black text-emerald-400 block tracking-wide">
                                                78.4 %
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${compressCanvas ? 'bg-emerald-400 animate-pulse' : 'bg-yellow-500'}`} />
                                <span className="text-[9px] uppercase tracking-wider font-bold text-white/70">
                                    Compresión en tiempo real: {compressCanvas ? 'FORZADA Y ACTIVA' : 'SISTEMA LIBRE'}
                                </span>
                            </div>
                        </div>

                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                        
                        {/* MÓDULO 3: Auditoría de ADN (Pentesting) */}
                        <div className="bg-black/50 border border-emerald-500/20 hover:border-emerald-500/30 rounded-3xl p-5 backdrop-blur-md shadow-[0_4px_25px_rgba(0,0,0,0.5)] transition-all flex flex-col justify-between min-h-[300px]">
                            <div>
                                <div className="flex items-center justify-between border-b border-emerald-500/10 pb-3 mb-4">
                                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-400 flex items-center gap-2">
                                        <Shield size={14} className="text-emerald-400" /> Auditoría de ADN (Pentesting)
                                    </h3>
                                    <button 
                                        onClick={runPentest}
                                        disabled={isPentesting}
                                        className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500 border border-emerald-500/30 hover:border-emerald-500 rounded-lg text-[10px] text-emerald-300 hover:text-white font-bold uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                                    >
                                        <Play size={10} /> {isPentesting ? 'Escaneando...' : 'Ejecutar Pentest'}
                                    </button>
                                </div>

                                <div className="bg-[#030604] border border-emerald-500/15 rounded-2xl p-4 font-mono text-[9.5px] text-emerald-300 h-[170px] overflow-y-auto custom-scrollbar space-y-1.5 flex flex-col-reverse justify-end">
                                    {pentestLogs.length === 0 ? (
                                        <div className="text-white/20 text-center py-12">Consola lista para escaneo de seguridad.</div>
                                    ) : (
                                        [...pentestLogs].reverse().map((log, idx) => (
                                            <div key={idx} className={log.includes('SAFE') || log.includes('OK') ? 'text-emerald-400 font-bold' : log.includes('INIT') ? 'text-white/70' : 'text-emerald-400/70'}>
                                                {log}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {isPentesting && (
                                <div className="mt-3">
                                    <div className="flex justify-between text-[8px] uppercase tracking-widest text-emerald-400/70 font-bold mb-1">
                                        <span>Procesando reglas de Firestore</span>
                                        <span>{pentestPercent}%</span>
                                    </div>
                                    <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden border border-emerald-500/10">
                                        <div 
                                            className="bg-emerald-500 h-1.5 transition-all duration-300 shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                                            style={{ width: `${pentestPercent}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* MÓDULO 4: Telemetría de Servidores */}
                        <div className="bg-black/50 border border-emerald-500/20 hover:border-emerald-500/30 rounded-3xl p-5 backdrop-blur-md shadow-[0_4px_25px_rgba(0,0,0,0.5)] transition-all flex flex-col justify-between min-h-[300px]">
                            <div>
                                <div className="flex items-center justify-between border-b border-emerald-500/10 pb-3 mb-4">
                                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-400 flex items-center gap-2">
                                        <Activity size={14} className="text-emerald-400 animate-pulse" /> Telemetría de Servidores
                                    </h3>
                                    <button 
                                        onClick={() => { playNeonClick(); setTrafficPeakMode(!trafficPeakMode); }}
                                        className={`px-3 py-1.5 border rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all active:scale-95 flex items-center gap-1 ${
                                            trafficPeakMode 
                                                ? 'bg-red-500/20 border-red-500 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.25)] animate-pulse' 
                                                : 'bg-emerald-500/5 border-emerald-500/25 text-emerald-400 hover:border-emerald-500/50'
                                        }`}
                                    >
                                        <Zap size={10} /> {trafficPeakMode ? 'DETENER PICO' : 'SIMULAR PICO'}
                                    </button>
                                </div>

                                {/* SVG Graphs */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    
                                    {/* DB Reads SVG */}
                                    <div className="bg-[#030604] border border-emerald-500/10 rounded-2xl p-3">
                                        <div className="flex justify-between text-[8px] uppercase tracking-widest text-emerald-400/60 font-bold mb-2">
                                            <span>Lecturas Firestore</span>
                                            <span className={trafficPeakMode ? 'text-red-400 font-black' : 'text-emerald-300'}>
                                                {dbReads[dbReads.length - 1]} ops/s
                                            </span>
                                        </div>
                                        <div className="h-[90px] w-full flex items-end">
                                            <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                                                <defs>
                                                    <linearGradient id="dbGrad" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                                                        <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                                                    </linearGradient>
                                                </defs>
                                                {/* Grid lines */}
                                                <line x1="0" y1="10" x2="100" y2="10" stroke="rgba(16,185,129,0.05)" strokeWidth="0.5" />
                                                <line x1="0" y1="20" x2="100" y2="20" stroke="rgba(16,185,129,0.05)" strokeWidth="0.5" />
                                                <line x1="0" y1="30" x2="100" y2="30" stroke="rgba(16,185,129,0.05)" strokeWidth="0.5" />
                                                
                                                {/* Area */}
                                                <path
                                                    d={`M 0 40 
                                                        ${dbReads.map((val, i) => `L ${(i / (dbReads.length - 1)) * 100} ${40 - (val / 150) * 35}`).join(' ')} 
                                                        L 100 40 Z`}
                                                    fill="url(#dbGrad)"
                                                />
                                                {/* Line */}
                                                <path
                                                    d={dbReads.map((val, i) => `${i === 0 ? 'M' : 'L'} ${(i / (dbReads.length - 1)) * 100} ${40 - (val / 150) * 35}`).join(' ')}
                                                    fill="none"
                                                    stroke={trafficPeakMode ? '#ef4444' : '#10b981'}
                                                    strokeWidth="1.5"
                                                    className="transition-all duration-300"
                                                />
                                            </svg>
                                        </div>
                                    </div>

                                    {/* Bandwidth SVG */}
                                    <div className="bg-[#030604] border border-emerald-500/10 rounded-2xl p-3">
                                        <div className="flex justify-between text-[8px] uppercase tracking-widest text-emerald-400/60 font-bold mb-2">
                                            <span>Ancho de Banda</span>
                                            <span className={trafficPeakMode ? 'text-red-400 font-black' : 'text-emerald-300'}>
                                                {bandwidth[bandwidth.length - 1]} MB/s
                                            </span>
                                        </div>
                                        <div className="h-[90px] w-full flex items-end">
                                            <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                                                <defs>
                                                    <linearGradient id="bwGrad" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                                                        <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                                                    </linearGradient>
                                                </defs>
                                                {/* Grid lines */}
                                                <line x1="0" y1="10" x2="100" y2="10" stroke="rgba(16,185,129,0.05)" strokeWidth="0.5" />
                                                <line x1="0" y1="20" x2="100" y2="20" stroke="rgba(16,185,129,0.05)" strokeWidth="0.5" />
                                                <line x1="0" y1="30" x2="100" y2="30" stroke="rgba(16,185,129,0.05)" strokeWidth="0.5" />
                                                
                                                {/* Area */}
                                                <path
                                                    d={`M 0 40 
                                                        ${bandwidth.map((val, i) => `L ${(i / (bandwidth.length - 1)) * 100} ${40 - (val / 600) * 35}`).join(' ')} 
                                                        L 100 40 Z`}
                                                    fill="url(#bwGrad)"
                                                />
                                                {/* Line */}
                                                <path
                                                    d={bandwidth.map((val, i) => `${i === 0 ? 'M' : 'L'} ${(i / (bandwidth.length - 1)) * 100} ${40 - (val / 600) * 35}`).join(' ')}
                                                    fill="none"
                                                    stroke={trafficPeakMode ? '#ef4444' : '#10b981'}
                                                    strokeWidth="1.5"
                                                    className="transition-all duration-300"
                                                />
                                            </svg>
                                        </div>
                                    </div>

                                </div>
                            </div>

                            <div className={`p-3 border rounded-xl flex items-center justify-between text-[9px] font-bold ${
                                trafficPeakMode 
                                    ? 'bg-red-500/10 border-red-500/35 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.1)]' 
                                    : 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400'
                            }`}>
                                <span className="uppercase">Estado Tráfico: {trafficPeakMode ? 'PICO DE TRÁFICO - CUELLO DETECTADO' : 'NORMAL / BAJO'}</span>
                                <span className={trafficPeakMode ? 'animate-pulse' : 'opacity-70'}>{trafficPeakMode ? '⚠️ ESCALAR CPU' : 'SEGURO'}</span>
                            </div>
                        </div>

                    </div>

                </div>

                {/* Columna Derecha: Chat Centinela ARI */}
                <div className="flex-[2] w-full bg-black/85 backdrop-blur-3xl border border-emerald-500/25 hover:border-emerald-500/35 rounded-3xl overflow-hidden flex flex-col relative shadow-[0_0_40px_rgba(16,185,129,0.15)] h-[670px] shrink-0">
                    <div className="bg-gradient-to-r from-emerald-950/40 to-teal-950/40 p-4 border-b border-emerald-500/20 flex items-center gap-4">
                        <div className="relative">
                            <div className="w-12 h-12 rounded-2xl bg-black border border-emerald-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                                <Cpu size={24} className="text-emerald-400" />
                            </div>
                            <div className="absolute inset-0 bg-emerald-500 blur-xl opacity-40 animate-pulse"></div>
                            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-black rounded-full"></span>
                        </div>
                        <div>
                            <h2 className="text-[16px] font-[1000] uppercase tracking-widest text-white">Ari</h2>
                            <p className="text-[8px] text-emerald-400 font-bold tracking-[0.3em] uppercase">SysAdmin / SecOps · Frecuencia Verde</p>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-5 pb-24 space-y-4 no-scrollbar">
                        {ariMsgs.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'ari' ? 'justify-start' : 'justify-end'}`}>
                                <div className={`max-w-[85%] rounded-2xl p-4 text-[13px] leading-relaxed ${
                                    msg.role === 'ari' 
                                        ? 'bg-emerald-950/20 border border-emerald-500/30 text-white rounded-tl-sm shadow-[0_5px_15px_rgba(16,185,129,0.05)]' 
                                        : 'bg-white/5 border border-white/10 text-white rounded-tr-sm'
                                }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isThinking && (
                            <div className="flex justify-start">
                                <div className="max-w-[85%] rounded-2xl p-4 bg-emerald-950/20 border border-emerald-500/25 text-white rounded-tl-sm flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce"></div>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/90 to-transparent">
                        <div className="bg-black border border-emerald-500/40 rounded-2xl flex items-center p-2 focus-within:border-emerald-400 focus-within:shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all">
                            <input 
                                type="file" 
                                id="chat-file-secops"
                                onChange={handleChatFileChange}
                                className="hidden"
                                accept="image/*,application/pdf"
                            />
                            <label 
                                htmlFor="chat-file-secops" 
                                className="p-2 text-white/40 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0 active:scale-90"
                                title="Adjuntar foto o PDF"
                            >
                                <Paperclip size={16} className={isUploadingFile ? "animate-spin" : ""} />
                            </label>
                            <input 
                                type="text"
                                value={msgInput}
                                onChange={e => setMsgInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSend()}
                                placeholder="Escribile a Ari de Ciberseguridad..."
                                className="flex-1 bg-transparent text-white text-[12px] px-3 outline-none placeholder:text-white/20"
                            />
                            <button onClick={handleSend} className="w-10 h-10 bg-emerald-500/20 hover:bg-emerald-500 border border-emerald-500/50 rounded-xl flex items-center justify-center text-emerald-300 hover:text-white transition-all active:scale-90">
                                <MessageSquare size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            <DirectiveNotifier 
                bunkerId="secops"
                townId={townId}
                onDirectivesUpdate={setActiveDirectivesText}
            />

            <BtuComponent 
                bunkerId="secops"
                townId={townId}
                onInjectToAri={(text) => {
                    setMsgInput(text);
                }}
            />
        </div>
    );
};
