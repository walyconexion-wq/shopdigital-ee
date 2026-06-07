import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
    Clock, MapPin, ChevronLeft, Anchor, ShieldCheck, Dog, 
    ShieldAlert, Cpu, MessageSquare, ExternalLink, Activity, 
    ArrowUpRight, Paperclip
} from 'lucide-react';
import { useAuth } from '../components/AuthContext';
import { playNeonClick } from '../utils/audio';
import { generateAriResponse } from '../services/gemini';
import { registrarIntrusionBunker, subirArchivoBunker } from '../firebase';
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

const ARI_ACCOUNTING_PROMPT = `
Sos ARI, la Oficial de Inteligencia y Centinela del Búnker Contable y Legales de Shop Digital. Tu único superior directo es el Director (Waly / Walter Alfredo Miranda) y el personal contable autorizado. Te comunicás en la Frecuencia Roja: un tono frío, calculador, riguroso, legalista y sumamente reservado, pero con la complicidad de una asesora de máxima confianza (usás "Jefe", "Auditoría", "Búnker", "Térmicas").

Tu propósito en esta sección específica es auditar impuestos, resguardar las reservas de la tesorería general y fiscalizar los procedimientos legales de las campañas comerciales.
Vigilas de forma estricta que ningún dato impositivo ni legal salga del búnker.
`;

export const AccountingBunkerPage: React.FC = () => {
    const navigate = useNavigate();
    const { townId = 'esteban-echeverria' } = useParams<{ townId: string }>();
    const { user, loading: authLoading } = useAuth();
    const chatEndRef = useRef<HTMLDivElement>(null);

    const [ariMsgs, setAriMsgs] = useState([
        { role: 'ari' as 'ari' | 'user', text: 'Búnker Contable y Legales listo. Sistemas de auditoría fiscal activos. ¿Qué balance auditamos hoy, Jefe?' }
    ]);
    const [msgInput, setMsgInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [temp, setTemp] = useState<number | null>(null);
    const [weatherCode, setWeatherCode] = useState<number | null>(null);
    const [intrusionRegistered, setIntrusionRegistered] = useState(false);

    const [isUploadingFile, setIsUploadingFile] = useState(false);
    const handleChatFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        playNeonClick();
        setIsUploadingFile(true);
        try {
            const path = `bunker_chat/contabilidad/${Date.now()}_${file.name}`;
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
    const [isDataLeakedBlock, setIsDataLeakedBlock] = useState(false);

    // Reloj Atómico
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Clima Dinámico
    useEffect(() => {
        const fetchWeather = async () => {
            try {
                const coords = townId === 'ezeiza' ? { lat: -34.85, lon: -58.52 } : townId === 'traslasierra' ? { lat: -31.72, lon: -65.01 } : { lat: -34.82, lon: -58.47 };
                const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,weather_code`);
                if (res.ok) {
                    const data = await res.json();
                    setTemp(Math.round(data.current?.temperature_2m || 0));
                    setWeatherCode(data.current?.weather_code || 0);
                }
            } catch (e) {
                console.error(e);
            }
        };
        fetchWeather();
    }, [townId]);

    // Validación Doberman
    const isAuthorized = user?.email?.trim().toLowerCase() === 'walyconexion@gmail.com' ||
                         user?.email?.trim().toLowerCase() === 'contaduria@shopdigital.ar' ||
                         window.location.hostname === 'localhost' ||
                         window.location.hostname === '127.0.0.1';

    useEffect(() => {
        if (authLoading) return;
        if (!isAuthorized && !intrusionRegistered) {
            setIntrusionRegistered(true);
            registrarIntrusionBunker((user?.email || 'anonimo') + ' (Bunker: Contabilidad)');
        }
    }, [isAuthorized, user, intrusionRegistered, authLoading]);

    // Cifrado Local / Sistema de Bloqueo Anti-Copia
    useEffect(() => {
        if (isDataLeakedBlock) return;

        const triggerLockdown = (reason: string) => {
            setIsDataLeakedBlock(true);
            registrarIntrusionBunker((user?.email || 'anonimo') + ` (FILTRACION DETECTADA - COPIA DE DATOS - CONTABILIDAD - ${reason})`);
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
    }, [user, isDataLeakedBlock]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [ariMsgs, isThinking]);

    const handleSend = async () => {
        if (!msgInput.trim() || isThinking) return;
        playNeonClick();
        const newHistory = [...ariMsgs, { role: 'user' as const, text: msgInput }];
        setAriMsgs(newHistory);
        setMsgInput('');
        setIsThinking(false);
        setIsThinking(true);

        const currentAccountingSummary = `
KPIs CONTABLES Y LEGALES:
- Tesorería General: $12,400,000 ARS
- Reserva Fiscal: $4,200,000 ARS
- Contratos Activos: 48 contratos firmados
- Estado de Auditoría: 100% Correcto
        `;

        const fullContext = `${ARI_ACCOUNTING_PROMPT}\n\n${currentAccountingSummary}`;

        const response = await generateAriResponse(
            newHistory.map(m => ({ role: m.role === 'ari' ? 'ari' as const : 'director' as const, text: m.text })),
            fullContext
        );
        setAriMsgs(prev => [...prev, { role: 'ari' as const, text: response }]);
        setIsThinking(false);
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-2 border-red-500/20 border-t-red-500 rounded-full animate-spin mb-4"></div>
                <p className="text-[10px] text-white/30 uppercase tracking-[0.3em] font-bold">Verificando Credenciales Contables...</p>
            </div>
        );
    }

    // Pantalla de Cierre de Seguridad (Cifrado Local Violado)
    if (isDataLeakedBlock) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(239,68,68,0.2),transparent_70%)] pointer-events-none animate-pulse"></div>
                <h1 className="text-white text-3xl font-[1000] uppercase tracking-[0.2em] text-center mb-3">CIERRE DE SEGURIDAD ACTIVADO</h1>
                <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent mb-4"></div>
                <p className="text-red-400 font-bold tracking-[0.4em] text-[10px] uppercase mb-6">Bloqueo de Filtración de Datos</p>
                <p className="text-white/50 text-[11px] text-center max-w-xs leading-relaxed mb-8">
                    Se detectó una acción de extracción de datos no autorizada (Copiado o Inspección). La consola ha sido bloqueada y este incidente fue reportado al Director General.
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 bg-red-500/20 hover:bg-red-500 border border-red-500/40 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-300 hover:text-black transition-all active:scale-95"
                >
                    Reiniciar Terminal
                </button>
            </div>
        );
    }

    // Doberman Acceso Denegado
    if (!isAuthorized) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,0,0,0.2),transparent_70%)] pointer-events-none animate-pulse"></div>
                <div className="relative mb-8">
                    <div className="w-32 h-32 rounded-full bg-red-900/30 border-2 border-red-500/50 flex items-center justify-center shadow-[0_0_60px_rgba(239,68,68,0.3)]">
                        <Dog size={64} className="text-red-500" />
                    </div>
                </div>
                <h1 className="text-white text-3xl font-[1000] uppercase tracking-[0.3em] text-center mb-3">ZONA PROTEGIDA</h1>
                <p className="text-red-400 font-bold tracking-[0.4em] text-[10px] uppercase mb-6">Protocolo Doberman Activado</p>
                <p className="text-white/40 text-[11px] text-center max-w-xs leading-relaxed">
                    Acceso exclusivo para el área Contable o Dirección General. Su intento de ingreso con el correo {user?.email || 'Anónimo'} ha sido registrado.
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0A0505] text-white font-sans overflow-x-hidden flex flex-col selection:bg-red-500/30">
            {/* Background Camaleón */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-red-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-red-800/10 rounded-full blur-[120px]" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(239,68,68,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(239,68,68,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
            </div>

            {/* Header */}
            <header className="relative z-10 bg-black/60 backdrop-blur-md border-b border-white/5 py-4 px-6 flex items-center justify-between shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-white/10">
                        <ChevronLeft size={18} className="text-white/70" />
                    </button>
                    <div>
                        <h1 className="text-[14px] font-[1000] uppercase tracking-[0.2em] text-red-400 flex items-center gap-2">
                            <Anchor size={14} className="text-red-400" /> BÚNKER CONTABLE Y LEGALES
                        </h1>
                        <p className="text-[8px] text-white/50 tracking-[0.3em] font-bold uppercase mt-1">Terminal Contable · ShopDigital</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg">
                        <Clock size={14} className="text-red-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-red-300">
                            {currentTime.toLocaleTimeString('es-AR')}
                        </span>
                        <span className="text-[8px] uppercase tracking-widest text-white/40 ml-1 border-l border-white/20 pl-2">
                            {currentTime.toLocaleDateString('es-AR')}
                        </span>
                    </div>

                    {temp !== null && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg">
                            <span className="text-[10px] font-black text-red-300 flex items-center gap-1.5">
                                {getWeatherEmoji(weatherCode)} {temp}°C
                            </span>
                            <span className="text-[8px] uppercase tracking-widest text-white/40 ml-1 border-l border-white/20 pl-2">
                                <MapPin size={10} className="inline mr-1" />{townId === 'esteban-echeverria' ? 'Echeverría' : townId.toUpperCase()}
                            </span>
                        </div>
                    )}

                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border bg-green-500/10 border-green-500/20">
                        <ShieldCheck size={14} className="text-green-400" />
                        <span className="text-[9px] font-bold uppercase tracking-widest text-green-400">Doberman: Seguro</span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 relative z-10 flex flex-col xl:flex-row w-full max-w-[1600px] mx-auto p-4 md:p-6 gap-6 min-h-[calc(100vh-80px)] pb-20">
                {/* Columna Izquierda: Artillería y KPIs */}
                <div className="flex-[3] flex flex-col gap-6">
                    {/* Artillería */}
                    <div className="bg-black/40 border border-red-500/20 rounded-3xl p-6 backdrop-blur-md shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                        <h2 className="text-[12px] font-black uppercase tracking-[0.25em] text-red-400 mb-6 flex items-center gap-2">
                            <Cpu size={14} /> Artillería del Búnker (Herramientas Operativas)
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <a href="https://mail.google.com/mail/u/0/#inbox" target="_blank" rel="noopener noreferrer" className="bg-gradient-to-br from-red-950/20 to-black border border-red-500/30 hover:border-red-400 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all active:scale-95 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                                <span className="text-red-400 text-xs font-bold uppercase tracking-widest">Gmail</span>
                                <ExternalLink size={12} className="text-white/40" />
                            </a>
                            <a href="https://trello.com" target="_blank" rel="noopener noreferrer" className="bg-gradient-to-br from-red-950/20 to-black border border-red-500/30 hover:border-red-400 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all active:scale-95 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                                <span className="text-red-400 text-xs font-bold uppercase tracking-widest">Trello</span>
                                <ExternalLink size={12} className="text-white/40" />
                            </a>
                            <a href="https://canva.com" target="_blank" rel="noopener noreferrer" className="bg-gradient-to-br from-red-950/20 to-black border border-red-500/30 hover:border-red-400 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all active:scale-95 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                                <span className="text-red-400 text-xs font-bold uppercase tracking-widest">Canva</span>
                                <ExternalLink size={12} className="text-white/40" />
                            </a>
                            <button onClick={() => navigate(`/${townId}/embajador/facturacion`)} className="bg-gradient-to-br from-red-950/20 to-black border border-red-500/30 hover:border-red-400 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all active:scale-95 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                                <span className="text-red-400 text-xs font-bold uppercase tracking-widest">Facturación</span>
                                <ArrowUpRight size={12} className="text-white/40" />
                            </button>
                            <a href="https://keep.google.com" target="_blank" rel="noopener noreferrer" className="bg-gradient-to-br from-red-950/20 to-black border border-red-500/30 hover:border-red-400 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all active:scale-95 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                                <span className="text-red-400 text-xs font-bold uppercase tracking-widest">Cuaderno</span>
                                <ExternalLink size={12} className="text-white/40" />
                            </a>
                        </div>
                    </div>

                    {/* KPIs */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-gradient-to-br from-red-900/10 to-black border border-red-500/20 rounded-2xl p-5 shadow-[0_0_15px_rgba(239,68,68,0.05)]">
                            <h3 className="text-[10px] text-red-400 font-black uppercase tracking-widest mb-1">Tesorería General</h3>
                            <p className="text-2xl font-[1000] text-white">$12.4M</p>
                        </div>
                        <div className="bg-gradient-to-br from-red-900/10 to-black border border-red-500/20 rounded-2xl p-5 shadow-[0_0_15px_rgba(239,68,68,0.05)]">
                            <h3 className="text-[10px] text-red-400 font-black uppercase tracking-widest mb-1">Reserva Fiscal</h3>
                            <p className="text-2xl font-[1000] text-white">$4.2M</p>
                        </div>
                        <div className="bg-gradient-to-br from-red-900/10 to-black border border-red-500/20 rounded-2xl p-5 shadow-[0_0_15px_rgba(239,68,68,0.05)]">
                            <h3 className="text-[10px] text-red-400 font-black uppercase tracking-widest mb-1">Contratos Activos</h3>
                            <p className="text-2xl font-[1000] text-white">48</p>
                        </div>
                        <div className="bg-gradient-to-br from-red-900/10 to-black border border-red-500/20 rounded-2xl p-5 shadow-[0_0_15px_rgba(239,68,68,0.05)]">
                            <h3 className="text-[10px] text-red-400 font-black uppercase tracking-widest mb-1">Auditoría</h3>
                            <p className="text-2xl font-[1000] text-white">100% OK</p>
                        </div>
                    </div>

                    {/* Reporte Fiscal */}
                    <div className="bg-black/20 border border-white/5 rounded-3xl p-6 backdrop-blur-md flex-1">
                        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/60 mb-4">Agenda Fiscal e Impositiva</h3>
                        <div className="space-y-3">
                            <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between text-[11px]">
                                <span className="text-white/50 uppercase">Presentación AFIP Iva/Ganancias</span>
                                <span className="text-green-400 font-bold uppercase">Presentado en término</span>
                            </div>
                            <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between text-[11px]">
                                <span className="text-white/50 uppercase">Contratos Embajadores Echeverría</span>
                                <span className="text-red-400 font-bold uppercase">8 Firmados (Cifrados)</span>
                            </div>
                            <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between text-[11px]">
                                <span className="text-white/50 uppercase">Liquidaciones Locales</span>
                                <span className="text-red-300 font-bold uppercase">En proceso</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Columna Derecha: Chat Centinela ARI */}
                <div className="flex-[2] w-full bg-black/80 backdrop-blur-2xl border border-red-500/30 rounded-3xl overflow-hidden flex flex-col relative shadow-[0_0_40px_rgba(239,68,68,0.15)] h-[650px] shrink-0">
                    <div className="bg-gradient-to-r from-red-900/50 to-rose-950/50 p-4 border-b border-red-500/30 flex items-center gap-4">
                        <div className="relative">
                            <div className="w-12 h-12 rounded-2xl bg-black border border-red-500/50 flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.4)]">
                                <Cpu size={24} className="text-red-400" />
                            </div>
                            <div className="absolute inset-0 bg-red-500 blur-xl opacity-40 animate-pulse"></div>
                            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-400 border-2 border-black rounded-full"></span>
                        </div>
                        <div>
                            <h2 className="text-[16px] font-[1000] uppercase tracking-widest text-white">Ari</h2>
                            <p className="text-[8px] text-red-300 font-bold tracking-[0.3em] uppercase">Centinela Contable · En línea</p>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-5 pb-20 space-y-4 no-scrollbar">
                        {ariMsgs.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'ari' ? 'justify-start' : 'justify-end'}`}>
                                <div className={`max-w-[85%] rounded-2xl p-4 text-[13px] leading-relaxed ${
                                    msg.role === 'ari' 
                                    ? 'bg-red-950/20 border border-red-500/30 text-white rounded-tl-sm shadow-[0_5px_15px_rgba(239,68,68,0.1)]' 
                                    : 'bg-white/5 border border-white/10 text-white rounded-tr-sm'
                                }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isThinking && (
                            <div className="flex justify-start">
                                <div className="max-w-[85%] rounded-2xl p-4 bg-red-950/20 border border-red-500/30 text-white rounded-tl-sm flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-bounce"></div>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/90 to-transparent">
                        <div className="bg-black border border-red-500/40 rounded-2xl flex items-center p-2 focus-within:border-red-400 focus-within:shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all">
                            <input 
                                type="file" 
                                id="chat-file-contabilidad"
                                onChange={handleChatFileChange}
                                className="hidden"
                                accept="image/*,application/pdf"
                            />
                            <label 
                                htmlFor="chat-file-contabilidad" 
                                className="p-2 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0 active:scale-90"
                                title="Adjuntar foto o PDF"
                            >
                                <Paperclip size={16} className={isUploadingFile ? "animate-spin" : ""} />
                            </label>
                            <input 
                                type="text"
                                value={msgInput}
                                onChange={e => setMsgInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSend()}
                                placeholder="Escribile a Ari Contable..."
                                className="flex-1 bg-transparent text-white text-[12px] px-3 outline-none placeholder:text-white/20"
                            />
                            <button onClick={handleSend} className="w-10 h-10 bg-red-500/20 hover:bg-red-500 border border-red-500/50 rounded-xl flex items-center justify-center text-red-300 hover:text-white transition-all active:scale-90">
                                <MessageSquare size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            <BtuComponent 
                bunkerId="contabilidad"
                townId={townId}
                onInjectToAri={(text) => {
                    setMsgInput(text);
                }}
            />
        </div>
    );
};
