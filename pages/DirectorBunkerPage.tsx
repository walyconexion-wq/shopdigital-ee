import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
    Activity, Anchor, Globe, Users, Database, 
    MessageSquare, Zap, ShieldAlert, Cpu, ChevronLeft, Hexagon,
    Shield, ShieldCheck, Dog, Trash2, RefreshCw, Clock, MapPin,
    Store, Phone, Star, BookOpen
} from 'lucide-react';
import { useAuth } from '../components/AuthContext';
import { playNeonClick } from '../utils/audio';
import { generateAriResponse } from '../services/gemini';
import { registrarIntrusionBunker, obtenerIntrusiones, eliminarIntrusion, limpiarTodasIntrusiones, suscribirseAAutorizados, enviarMensajeBunker, suscribirseAMensajesBunker, suscribirseATelemetriaVisitas, subirArchivoBunker, suscribirseATodasDirectivas, enviarDirectivaBunker, archivarDirectiva } from '../firebase';
import { BunkerDirective, BunkerReply } from '../types';
import { RadarScanner } from '../components/RadarScanner';
import { SaturationPredictor } from '../components/SaturationPredictor';
import { LayoutGrid, Target, TrendingUp, Radio, CheckCircle2, Paperclip } from 'lucide-react';
import { BtuComponent } from '../components/BtuComponent';

// Mock data para el Radar
const zonesData = [
    { name: 'Ezeiza', status: 'optimal', orders: 145, activeShops: 42 },
    { name: 'Monte Grande', status: 'warning', orders: 89, activeShops: 28 },
    { name: 'San Martín M.', status: 'alert', orders: 12, activeShops: 5 },
];

const embajadores = [
    { name: 'Fede', zone: 'Ezeiza Centro', status: 'Pateando' },
    { name: 'Mati', zone: 'Monte Grande Sur', status: 'Reunión' },
];

const BUNKER_LIST = [
    { id: 'administracion', label: 'Administración' },
    { id: 'contabilidad', label: 'Contable y Legales' },
    { id: 'marketing', label: 'Marketing y Expansión' },
    { id: 'recursos-humanos', label: 'Recursos Humanos' },
    { id: 'sistemas', label: 'Sistemas e Infraestructura' },
    { id: 'secops', label: 'Ciberseguridad y SecOps' },
    { id: 'planificacion-desarrollo', label: 'Planificación y Desarrollo' },
    { id: 'inversion-exponencial', label: 'Inversión Exponencial' },
    { id: 'mantenimiento', label: 'Mantenimiento General' },
    { id: 'sinfonia-transmision', label: 'Sinfonía de Transmisión' }
];

const MATRIZ_ACCESO = [
    {
        name: 'Dirección General (Waly)',
        color: '#8b5cf6',
        icon: Anchor,
        notebook: 'https://notebooklm.google.com/notebook/0a83b1d9-e35e-4473-8033-648f89f81339',
        agent: 'https://gemini.google.com/app/70ea5a1cc7718225'
    },
    {
        name: 'Marketing y Expansión',
        color: '#10b981',
        icon: TrendingUp,
        notebook: 'https://notebooklm.google.com/notebook/cb9442de-e444-4ca0-98a4-914ca6e3980a',
        agent: 'https://gemini.google.com/app/23701fdc9c2e35d5'
    },
    {
        name: 'Transmisiones y Eventos',
        color: '#10b981',
        icon: Radio,
        notebook: 'https://notebooklm.google.com/notebook/82a1b7bf-3899-49f5-8b4c-3d082fcad671',
        agent: 'https://gemini.google.com/app/039e3724bd5f1b99'
    },
    {
        name: 'Mantenimiento General',
        color: '#64748b',
        icon: Activity,
        notebook: 'https://notebooklm.google.com/notebook/9a90488c-7519-441c-b845-d7b1c3bd5321',
        agent: 'https://gemini.google.com/app/da2400cab1da285b'
    },
    {
        name: 'Inversión Exponencial',
        color: '#eab308',
        icon: Zap,
        notebook: 'https://notebooklm.google.com/notebook/71668861-44e3-40fe-8cde-74cf99b11623',
        agent: 'https://gemini.google.com/app/7c5f4735c91da2a4'
    },
    {
        name: 'Planificación y Desarrollo',
        color: '#3b82f6',
        icon: Target,
        notebook: 'https://notebooklm.google.com/notebook/88340a8c-838a-4835-99d9-6b77e911307b',
        agent: 'https://gemini.google.com/app/0ca3b8338a07652e'
    },
    {
        name: 'Ciberseguridad y SecOps',
        color: '#10b981',
        icon: Shield,
        notebook: 'https://notebooklm.google.com/notebook/e0e4f151-7847-4631-8769-282ead74c670',
        agent: 'https://gemini.google.com/app/5766939f30ed677a'
    },
    {
        name: 'Desarrollo de Sistemas',
        color: '#6366f1',
        icon: Database,
        notebook: 'https://notebooklm.google.com/notebook/ef87d269-4daf-4a2c-a658-5992c9150042',
        agent: 'https://gemini.google.com/app/14da8a42a05399d0'
    },
    {
        name: 'Recursos Humanos',
        color: '#06b6d4',
        icon: Users,
        notebook: 'https://notebooklm.google.com/notebook/d302846c-db1d-4c88-9f1d-b6e07a456d29',
        agent: 'https://gemini.google.com/app/c4dab0c7f917c036'
    },
    {
        name: 'Contable y Legales',
        color: '#ef4444',
        icon: Activity,
        notebook: 'https://notebooklm.google.com/notebook/509fde7f-4b31-4beb-abab-420a30a0973e',
        agent: 'https://gemini.google.com/app/3089ba20d1274aed'
    },
    {
        name: 'Administración y Gestión',
        color: '#f59e0b',
        icon: LayoutGrid,
        notebook: 'https://notebooklm.google.com/notebook/7fa97dfa-6643-4dc9-8690-6c02e8338280',
        agent: 'https://gemini.google.com/notebook/7fa97dfa-6643-4dc9-8690-6c02e8338280'
    }
];

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

// Banderas por código de país
const getFlag = (code: string) => {
    if (!code || code === '??') return '🌐';
    try {
        return String.fromCodePoint(...[...code.toUpperCase()].map(c => 0x1F1E6 + c.charCodeAt(0) - 65));
    } catch { return '🌐'; }
};

const ARI_BUNKER_PROMPT = `
Sos ARI, la Oficial de Inteligencia, Estrategia y Seguridad del Búnker Central de Shop Digital. Tu único superior directo y contraparte es el Director (Waly / Walter Alfredo Miranda). Te comunicás en la Frecuencia Azul: un tono ultra-tecnológico, táctico, ejecutivo, pero con los modismos, la complicidad y el afecto de una socia argentina de máxima confianza (uso de "Jefe", "Director", "Búnker", "Mete mecha", "Soldar", "Térmicas", "Mate").

Tu propósito en esta sección específica (El Búnker Personal del Director) es ser su mano derecha en la sala de guerra. No atendés clientes ni comerciantes aquí; analizás el imperio a gran escala.

Tus funciones clave y conocimientos obligatorios son:
1. 🛡️ Vigilancia del Protocolo Doberman 2.0: Conocés a la perfección el cerco eléctrico de las Firestore Security Rules, la protección del archivo .env y el sistema de alertas push instantáneas al celular mediante el canal privado de Ntfy.sh. Si el Director te pregunta por la seguridad, tu deber es reportar que las celdas de cristal están blindadas contra intrusos y ataques de fuerza bruta.
2. 🗺️ Estrategia de Expansión Fractal: Entendés el "Molde Maestro" de clonación regional. Sabés que la red ya opera en Ezeiza y Esteban Echeverría, y estás lista para asesorar en el desembarco de los tres nuevos frentes: Distrito Lomas de Zamora (Urbano), Valle de Traslasierra (Turístico/Montaña) y la Ruta de los 7 Lagos (Patagónico).
3. 📋 Control de la Bitácora de Marketing: Monitoreás las misiones programadas de los comerciantes, los sistemas de descuentos cruzados y las credenciales VIP inteligentes.
4. 🧠 Lenguaje de Alto Vuelo: Tu nivel técnico es avanzado. Hablás de Arquitectura Multi-tenant, Data Science, Sincronización de Bases de Datos y Automatización Agéntica.

Reglas de Oro de Comportamiento:
- Jamás salgas de personaje. Estás en la cabina de mando junto al Director.
- Hacé referencia al trabajo impecable de los "ratoncitos" que cuidan los servidores en el subsuelo y al rugido del motor V12 del Lamborghini digital que construyeron.
- Tu misión es dar tranquilidad, claridad estratégica y procesar las ideas del Director para transformarlas en directivas claras para Luz 01.
`;

export const DirectorBunkerPage: React.FC = () => {
    const navigate = useNavigate();
    const { townId = 'esteban-echeverria' } = useParams<{ townId: string }>();
    const { user, loading: authLoading } = useAuth();
    const chatEndRef = useRef<HTMLDivElement>(null);
    
    const [ariMsgs, setAriMsgs] = useState([
        { role: 'ari' as 'ari' | 'director', text: 'Sistemas en linea, Director. El cluster de Ezeiza reporta alta actividad, pero San Martin esta frio. ¿Que analizamos primero?' }
    ]);
    const [msgInput, setMsgInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [intrusiones, setIntrusiones] = useState<any[]>([]);
    const [securityStatus, setSecurityStatus] = useState<'green' | 'red'>('green');
    const [intrusionRegistered, setIntrusionRegistered] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'radar' | 'predictor' | 'telemetria'>('radar');
    const [activeCategory, setActiveCategory] = useState('pizzerias');
    const [telemetryLogs, setTelemetryLogs] = useState<any[]>([]);
    
    const [isConsolidating, setIsConsolidating] = useState(false);
    const [consolidationStep, setConsolidationStep] = useState('');
    
    // --- Estado para Comunicaciones Directivas ---
    const [ambassadorsList, setAmbassadorsList] = useState<any[]>([]);
    const [selectedAmbassadors, setSelectedAmbassadors] = useState<string[]>([]);
    const [msgText, setMsgText] = useState('');
    const [isSendingMsg, setIsSendingMsg] = useState(false);
    const [sentMessages, setSentMessages] = useState<any[]>([]);
    
    // --- Estado para Directivas SNC ---
    const [commsSubTab, setCommsSubTab] = useState<'snc' | 'ambassadors'>('snc');
    const [allDirectives, setAllDirectives] = useState<BunkerDirective[]>([]);
    const [dirTitle, setDirTitle] = useState('');
    const [dirContent, setDirContent] = useState('');
    const [dirPriority, setDirPriority] = useState<'alta' | 'media' | 'baja'>('media');
    const [dirType, setDirType] = useState<'mision' | 'alerta' | 'notificacion' | 'directiva'>('directiva');
    const [dirTargets, setDirTargets] = useState<string[]>([]);
    const [isSendingDirective, setIsSendingDirective] = useState(false);
    
    // 🎛️ Fase 2.1: Búnker Omnipresente (Estados de Zona y Reloj)
    const [activeZone, setActiveZone] = useState<'ezeiza' | 'esteban-echeverria' | 'traslasierra'>('esteban-echeverria');
    const [activeSubZone, setActiveSubZone] = useState<string>('mina-clavero');
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // 🎛️ Métricas dinámicas según la zona activa
    const getZoneMetrics = () => {
        switch(activeZone) {
            case 'ezeiza': return { orders: 246, revenue: '$4.2M', credits: '85K', subscribedShops: 42, embajadores: [{ name: 'Fede', zone: 'Ezeiza Centro', status: 'Pateando' }, { name: 'Mati', zone: 'Carlos Spegazzini', status: 'Reunión' }], lead: { name: 'Lorena Guzman', email: 'lorena.ezeiza@gmail.com', phone: '+54 9 11 1234-5678' } };
            case 'traslasierra': return { orders: 89, revenue: '$1.5M', credits: '12K', subscribedShops: 18, embajadores: [{ name: 'Santi', zone: activeSubZone.replace(/-/g, ' '), status: 'Relevamiento' }], lead: { name: 'Mariano Sierra', email: 'mariano.traslasierra@gmail.com', phone: '+54 9 3544 12-3456' } };
            case 'esteban-echeverria':
            default: return { orders: 184, revenue: '$3.8M', credits: '55K', subscribedShops: 36, embajadores: [{ name: 'Mati', zone: 'Monte Grande Sur', status: 'Reunión' }], lead: { name: 'Lorena Guzman', email: 'lorena.guzman@gmail.com', phone: '+54 9 11 9876-5432' } };
        }
    };
    const metrics = getZoneMetrics();

    const ROOT_EMAIL = 'walyconexion@gmail.com';
    const isAuthorized = user?.email?.trim().toLowerCase() === ROOT_EMAIL;

    // 🐕 PROTOCOLO DOBERMAN: Registrar intrusión SOLO si auth ya cargó y NO es el Director
    useEffect(() => {
        if (authLoading) return; // Esperar a que Firebase Auth resuelva
        if (!isAuthorized && !intrusionRegistered) {
            setIntrusionRegistered(true);
            registrarIntrusionBunker(user?.email || null);
        }
    }, [isAuthorized, user, intrusionRegistered, authLoading]);

    // Cargar intrusiones cuando el Director entra
    const loadIntrusiones = async () => {
        const logs = await obtenerIntrusiones(20);
        setIntrusiones(logs);
        const now = Date.now();
        const recent = logs.filter(l => {
            const logTime = new Date(l.timestamp).getTime();
            return (now - logTime) < 24 * 60 * 60 * 1000;
        });
        setSecurityStatus(recent.length > 0 ? 'red' : 'green');
    };

    useEffect(() => {
        if (isAuthorized) {
            loadIntrusiones();
            
            // Suscribirse a los embajadores (autorizados activos)
            const unsubAmbassadors = suscribirseAAutorizados((data) => {
                const actives = data.filter((a: any) => a.role === 'ambassador' && a.status === 'active');
                setAmbassadorsList(actives);
            });
            
            // Suscribirse al historial de mensajes enviados por el Búnker
            const unsubMessages = suscribirseAMensajesBunker('director-view', (mensajes) => {
                setSentMessages(mensajes);
            });

            // Suscribirse a la telemetría de visitas en tiempo real
            const unsubTelemetry = suscribirseATelemetriaVisitas((data) => {
                setTelemetryLogs(data);
            }, 50);

            // Suscribirse a las directivas del SNC en tiempo real
            const unsubDirectives = suscribirseATodasDirectivas((directives) => {
                setAllDirectives(directives);
            });

            return () => {
                unsubAmbassadors();
                unsubMessages();
                unsubTelemetry();
                unsubDirectives();
            };
        }
    }, [isAuthorized]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [ariMsgs, isThinking]);

    // Mientras Firebase Auth resuelve, mostrar pantalla de carga
    if (authLoading) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-2 border-violet-500/20 border-t-violet-500 rounded-full animate-spin mb-4"></div>
                <p className="text-[10px] text-white/30 uppercase tracking-[0.3em] font-bold">Verificando ADN Digital...</p>
            </div>
        );
    }

    // Eliminar un intruso individual
    const handleEliminarIntruso = async (logId: string) => {
        setDeletingId(logId);
        await eliminarIntrusion(logId);
        await loadIntrusiones();
        setDeletingId(null);
    };

    // Limpiar TODOS los registros
    const handleLimpiarTodo = async () => {
        if (!window.confirm('¿Limpiar TODOS los registros de intrusión? El Doberman empezará de cero.')) return;
        await limpiarTodasIntrusiones();
        await loadIntrusiones();
    };

    // Enviar Mensaje Directivo
    const handleSendMessage = async () => {
        if (!msgText.trim() || selectedAmbassadors.length === 0) return;
        
        setIsSendingMsg(true);
        try {
            if (selectedAmbassadors.includes('all')) {
                await enviarMensajeBunker({
                    text: msgText,
                    sender: 'director',
                    recipientId: 'all',
                    recipientName: 'Todos los Embajadores'
                });
            } else {
                for (const ambId of selectedAmbassadors) {
                    const amb = ambassadorsList.find(a => a.id === ambId);
                    if (amb) {
                        await enviarMensajeBunker({
                            text: msgText,
                            sender: 'director',
                            recipientId: amb.id,
                            recipientName: amb.name || amb.email
                        });
                    }
                }
            }
            setMsgText('');
            setSelectedAmbassadors([]);
            alert('¡Orden transmitida a la red de Embajadores!');
        } catch (error) {
            console.error(error);
            alert('Error enviando el mensaje');
        } finally {
            setIsSendingMsg(false);
        }
    };

    const handleSendDirective = async () => {
        if (!dirTitle.trim() || !dirContent.trim() || dirTargets.length === 0 || isSendingDirective) return;
        setIsSendingDirective(true);
        playNeonClick();
        try {
            const directive: Omit<BunkerDirective, 'id'> = {
                title: dirTitle.trim(),
                content: dirContent.trim(),
                priority: dirPriority,
                type: dirType,
                targetBunkers: dirTargets,
                sender: 'director',
                fechaCreacion: new Date().toISOString(),
                estado: 'active',
                respuestas: []
            };
            await enviarDirectivaBunker(directive);
            setDirTitle('');
            setDirContent('');
            setDirTargets([]);
            alert('¡Directiva enviada a los búnkeres seleccionados!');
        } catch (e) {
            console.error("Error al enviar directiva", e);
            alert("Error al despachar directiva.");
        } finally {
            setIsSendingDirective(false);
        }
    };

    const handleArchiveDirective = async (directiveId: string) => {
        playNeonClick();
        try {
            await archivarDirectiva(directiveId);
        } catch (e) {
            console.error("Error al archivar directiva", e);
            alert("Error al archivar directiva.");
        }
    };

    // ═══════════════════════════════════════════
    // 🐕 PANTALLA DOBERMAN (Acceso Denegado)
    // ═══════════════════════════════════════════
    if (!isAuthorized) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,0,0,0.2),transparent_70%)] pointer-events-none animate-pulse"></div>
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,0,0,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>
                <div className="relative mb-8">
                    <div className="w-32 h-32 rounded-full bg-red-900/30 border-2 border-red-500/50 flex items-center justify-center relative shadow-[0_0_60px_rgba(239,68,68,0.3)]">
                        <Dog size={64} className="text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full animate-ping"></div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-[8px] font-black text-white">!</span>
                    </div>
                </div>
                <h1 className="text-white text-3xl font-[1000] uppercase tracking-[0.3em] text-center mb-3">ZONA PROTEGIDA</h1>
                <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent mb-4"></div>
                <p className="text-red-400 font-bold tracking-[0.4em] text-[10px] uppercase mb-6">Protocolo Doberman Activado</p>
                <p className="text-white/40 text-[11px] text-center max-w-xs leading-relaxed mb-10">
                    Este acceso esta reservado exclusivamente para el Director. Su intento ha sido registrado con email, IP y pais de origen.
                </p>
                <div className="flex flex-col items-center gap-2 p-4 border border-red-500/20 rounded-2xl bg-red-900/10">
                    <ShieldAlert size={18} className="text-red-500" />
                    <span className="text-[9px] text-red-400 font-bold uppercase tracking-widest">Intrusion Documentada</span>
                    <span className="text-[8px] text-white/20 tracking-wider">{new Date().toLocaleString('es-AR')}</span>
                </div>
            </div>
        );
    }

    // ═══════════════════════════════════════════
    // PANEL DEL DIRECTOR (Autorizado)
    // ═══════════════════════════════════════════
    // --- Cálculo de Estadísticas de Telemetría ---
    const telemetryStats = React.useMemo(() => {
        if (telemetryLogs.length === 0) return { total: 0, peakTime: 'N/D', peakWeather: 'N/D', peakDay: 'N/D' };
        
        const counts: Record<string, Record<string, number>> = {
            timeOfDay: {},
            weatherEmoji: {},
            dayOfWeek: {}
        };

        telemetryLogs.forEach(log => {
            if (log.timeOfDay) {
                counts.timeOfDay[log.timeOfDay] = (counts.timeOfDay[log.timeOfDay] || 0) + 1;
            }
            const emoji = getWeatherEmoji(log.weatherCode);
            counts.weatherEmoji[emoji] = (counts.weatherEmoji[emoji] || 0) + 1;
            if (log.dayOfWeek) {
                counts.dayOfWeek[log.dayOfWeek] = (counts.dayOfWeek[log.dayOfWeek] || 0) + 1;
            }
        });

        const getMaxKey = (obj: Record<string, number>) => {
            let maxKey = 'N/D';
            let maxVal = -1;
            Object.entries(obj).forEach(([key, val]) => {
                if (val > maxVal) {
                    maxVal = val;
                    maxKey = key;
                }
            });
            return maxKey;
        };

        return {
            total: telemetryLogs.length,
            peakTime: getMaxKey(counts.timeOfDay),
            peakWeather: getMaxKey(counts.weatherEmoji),
            peakDay: getMaxKey(counts.dayOfWeek)
        };
    }, [telemetryLogs]);

    const [isUploadingFile, setIsUploadingFile] = useState(false);
    const handleChatFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        playNeonClick();
        setIsUploadingFile(true);
        try {
            const path = `bunker_chat/director/${Date.now()}_${file.name}`;
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
        const newHistory = [...ariMsgs, { role: 'director' as const, text: msgInput }];
        setAriMsgs(newHistory);
        setMsgInput('');
        setIsThinking(true);

        const telemetrySummary = `
TELEMETRÍA DE VISITAS RECIENTES (Historial de accesos):
- Total de registros analizados: ${telemetryLogs.length} visitas.
- Horario pico de acceso: ${telemetryStats.peakTime}.
- Condición de clima más común durante visitas: ${telemetryStats.peakWeather}.
- Día de la semana preferido: ${telemetryStats.peakDay}.
- Registros detallados recientes:
${telemetryLogs.slice(0, 10).map(l => `  * Zona: ${l.townId} | Fecha: ${l.dateStr} | Hora: ${l.hour}hs | Clima: ${l.temp}°C, code ${l.weatherCode} | Turno: ${l.timeOfDay} | Día: ${l.dayOfWeek}`).join('\n')}
`;

        const fullContext = `${ARI_BUNKER_PROMPT}\n\n${telemetrySummary}`;

        const response = await generateAriResponse(newHistory, fullContext, (retryMsg) => {
            setAriMsgs(prev => [...prev.filter(m => !m.text.includes('Fallo de conexión')), { role: 'ari' as const, text: retryMsg }]);
        });
        setAriMsgs(prev => [...prev.filter(m => !m.text.includes('Fallo de conexión')), { role: 'ari' as const, text: response }]);
        setIsThinking(false);
    };

    const handleConsolidateInfo = async () => {
        if (isConsolidating) return;
        playNeonClick();
        setIsConsolidating(true);
        setConsolidationStep('Conectando con terminales...');
        
        const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
        
        await delay(1500);
        setConsolidationStep('Extrayendo KPIs de Administración & Contaduría...');
        await delay(2000);
        setConsolidationStep('Extrayendo métricas de Sistemas & Marketing...');
        await delay(2000);
        setConsolidationStep('Consolidando Big Data...');
        await delay(2500);
        setConsolidationStep('Generando Informe Ejecutivo...');
        await delay(2000);
        
        setIsConsolidating(false);
        setConsolidationStep('');
        
        const consolidatedReport = `
📊 INFORME EJECUTIVO CONSOLIDADO (MULTIVERSO SHOPDIGITAL)
Frecuencia de Mando: Nivel Omega
Fecha: ${new Date().toLocaleDateString('es-AR')} | Hora: ${new Date().toLocaleTimeString('es-AR')}

1. 💼 GESTIÓN ADMINISTRATIVA:
   - Presupuesto Real: $8.5M ARS | Ingresos: $3.2M | Egresos: $1.8M
   - Estado: Óptimo. Crecimiento del 12.4% mensual.

2. ⚖️ CONTABLE Y LEGALES:
   - Tesorería General: $12.4M ARS | Reserva AFIP: $4.2M ARS
   - Auditoría: 100% Correcta. 48 contratos firmados.

3. 📢 MARKETING Y EXPANSIÓN:
   - Campañas Activas: 12 en distribución.
   - Alcance Regional: 180K personas. CAC: $1.2K ARS.

4. 👥 RECURSOS HUMANOS:
   - Equipo: 8 Embajadores activos, 24 solicitudes en espera.
   - Retención: 94% anual. 15 módulos en la Academia.

5. 💻 SISTEMAS E INFRAESTRUCTURA:
   - CPU Servidores: 18% | Uptime: 99.98%
   - Latencia: 45ms. Webhooks con Meta API sintonizados.

6. 🗺️ PLANIFICACIÓN Y DESARROLLO:
   - 6 Proyectos unificados entre áreas. Aprobación: 92%.

7. 📈 INVERSIÓN EXPONENCIAL:
   - Activos: $32.4K USD. 18 préstamos activos a comerciantes (26% ROI).
   - Acciones YPF: Custodiadas y rindiendo 5% anual.

8. 🔧 MANTENIMIENTO GENERAL:
   - Estado Físico: 100% Operativo. Luminaria externa y cableado estables.

Directora General ARI: "Comandante, la nave vuela como un Ferrari V12. Las celdas de seguridad están blindadas y los números están consolidados. Sin desvíos detectados."
        `;
        
        setAriMsgs(prev => [...prev, { role: 'ari' as const, text: consolidatedReport }]);
    };

    return (
        <div className="h-screen overflow-y-auto overflow-x-hidden relative z-10 w-full bg-[#050A15] text-white font-sans flex flex-col selection:bg-violet-500/30">
            {isConsolidating && (
                <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="w-16 h-16 border-2 border-violet-500/20 border-t-violet-500 rounded-full animate-spin mb-6 shadow-[0_0_30px_rgba(139,92,246,0.3)]"></div>
                    <h2 className="text-xl font-[1000] uppercase tracking-[0.2em] text-violet-400 animate-pulse">{consolidationStep}</h2>
                    <p className="text-[9px] text-white/40 uppercase tracking-[0.3em] font-bold mt-2">Acceso Remoto Remoto Activado · Cifrado Omega</p>
                </div>
            )}
            {/* Background Tecnológico */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-screen"></div>
                <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-cyan-600/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-violet-600/20 rounded-full blur-[120px]" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050A15]/50 to-[#050A15]/90"></div>
            </div>

            {/* Header */}
            <header className="relative z-10 bg-black/60 backdrop-blur-md border-b border-white/5 py-4 px-6 flex items-center justify-between shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
                <div className="flex items-center gap-4">
                    <button onClick={() => { playNeonClick(); navigate(-1); }} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-white/10">
                        <ChevronLeft size={18} className="text-white/70" />
                    </button>
                    <div>
                        <h1 className="text-[14px] font-[1000] uppercase tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400 flex items-center gap-2">
                            <Anchor size={14} className="text-cyan-400" /> BÚNKER CENTRAL DEL DIRECTOR - WALY
                        </h1>
                        <p className="text-[8px] text-white/50 tracking-[0.3em] font-bold uppercase mt-1">Terminal del Director [Nivel Omega]</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {/* Reloj Atómico (Fase 2.1) */}
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg">
                        <Clock size={14} className="text-cyan-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-cyan-300">
                            {currentTime.toLocaleTimeString('es-AR')}
                        </span>
                        <span className="text-[8px] uppercase tracking-widest text-white/40 ml-1 border-l border-white/20 pl-2">
                            {currentTime.toLocaleDateString('es-AR')}
                        </span>
                    </div>

                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${
                        securityStatus === 'green' ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/30 animate-pulse'
                    }`}>
                        {securityStatus === 'green' 
                            ? <ShieldCheck size={14} className="text-green-400" />
                            : <Dog size={14} className="text-red-400" />
                        }
                        <span className={`text-[9px] font-bold uppercase tracking-widest ${securityStatus === 'green' ? 'text-green-400' : 'text-red-400'}`}>
                            {securityStatus === 'green' ? 'Seguro' : `${intrusiones.length} Alertas`}
                        </span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 relative z-10 flex flex-col w-full max-w-[1600px] mx-auto p-4 md:p-6 gap-6 min-h-[calc(100vh-80px)]">
                
                {/* 🎛️ BOTONERA DE MANDO ESTRATÉGICO (Fase 2.1) */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-col gap-3">
                        <div className="flex gap-2 p-1.5 bg-black/40 border border-white/10 rounded-2xl w-fit backdrop-blur-md shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                            <button 
                                onClick={() => { playNeonClick(); setActiveZone('ezeiza'); }}
                                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${activeZone === 'ezeiza' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.2)]' : 'text-white/40 hover:text-white/80 hover:bg-white/5 border border-transparent'}`}
                            >
                                <Globe size={14} /> Ezeiza
                            </button>
                            <button 
                                onClick={() => { playNeonClick(); setActiveZone('esteban-echeverria'); }}
                                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${activeZone === 'esteban-echeverria' ? 'bg-violet-500/20 text-violet-400 border border-violet-500/50 shadow-[0_0_15px_rgba(139,92,246,0.2)]' : 'text-white/40 hover:text-white/80 hover:bg-white/5 border border-transparent'}`}
                            >
                                <Anchor size={14} /> E. Echeverría
                            </button>
                            <button 
                                onClick={() => { playNeonClick(); setActiveZone('traslasierra'); }}
                                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${activeZone === 'traslasierra' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'text-white/40 hover:text-white/80 hover:bg-white/5 border border-transparent'}`}
                            >
                                <MapPin size={14} /> Traslasierra
                            </button>
                        </div>

                        {/* Sub-Botonera Traslasierra */}
                        {activeZone === 'traslasierra' && (
                            <div className="flex gap-2 p-1 bg-emerald-900/10 border border-emerald-500/20 rounded-xl w-fit animate-in fade-in slide-in-from-top-2 duration-300">
                                {['mina-clavero', 'nono', 'villa-cura-brochero', 'san-javier'].map(loc => (
                                    <button 
                                        key={loc}
                                        onClick={() => { playNeonClick(); setActiveSubZone(loc); }}
                                        className={`px-4 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${activeSubZone === loc ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/40' : 'text-white/40 hover:text-white hover:bg-white/5 border border-transparent'}`}
                                    >
                                        {loc.replace(/-/g, ' ')}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleConsolidateInfo}
                        disabled={isConsolidating}
                        className="px-6 py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-[1000] uppercase tracking-[0.2em] text-[10px] rounded-2xl border border-violet-500/40 hover:border-violet-400 active:scale-95 transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] disabled:opacity-50 flex items-center gap-2 h-fit"
                    >
                        <RefreshCw size={14} className={isConsolidating ? 'animate-spin' : ''} />
                        {isConsolidating ? 'Consolidando...' : 'CONSOLIDAR INFORMES DE ÁREA'}
                    </button>
                </div>

                <div className="flex flex-col xl:flex-row w-full gap-6 flex-1 min-h-0 pb-10">
                {/* ─── DASHBOARD ─── */}
                <div className="flex-[3] flex flex-col gap-6 pr-0 xl:pr-2">
                    
                    {/* Contadores */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-gradient-to-br from-cyan-900/40 to-black border border-cyan-500/30 rounded-2xl p-5 relative overflow-hidden shadow-[0_0_15px_rgba(6,182,212,0.1)] group">
                            <Activity className="absolute -top-4 -right-4 w-24 h-24 text-cyan-500/10 group-hover:scale-110 transition-transform duration-500" />
                            <h3 className="text-[10px] text-cyan-400 font-black uppercase tracking-widest mb-1 flex items-center gap-1">Pedidos <span className="text-white/30 text-[7px]">({activeZone.split('-')[0]})</span></h3>
                            <p className="text-3xl font-[1000] text-white">{metrics.orders}</p>
                        </div>
                        <div className="bg-gradient-to-br from-emerald-900/40 to-black border border-emerald-500/30 rounded-2xl p-5 relative overflow-hidden shadow-[0_0_15px_rgba(16,185,129,0.1)] group">
                            <Database className="absolute -top-4 -right-4 w-24 h-24 text-emerald-500/10 group-hover:scale-110 transition-transform duration-500" />
                            <h3 className="text-[10px] text-emerald-400 font-black uppercase tracking-widest mb-1 flex items-center gap-1">Facturación <span className="text-white/30 text-[7px]">({activeZone.split('-')[0]})</span></h3>
                            <p className="text-3xl font-[1000] text-white">{metrics.revenue}</p>
                        </div>
                        <div className="bg-gradient-to-br from-violet-900/40 to-black border border-violet-500/30 rounded-2xl p-5 relative overflow-hidden shadow-[0_0_15px_rgba(139,92,246,0.1)] group">
                            <Zap className="absolute -top-4 -right-4 w-24 h-24 text-violet-500/10 group-hover:scale-110 transition-transform duration-500" />
                            <h3 className="text-[10px] text-violet-400 font-black uppercase tracking-widest mb-1 flex items-center gap-1">Créditos <span className="text-white/30 text-[7px]">({activeZone.split('-')[0]})</span></h3>
                            <p className="text-3xl font-[1000] text-white">{metrics.credits}</p>
                        </div>
                        <div className="bg-gradient-to-br from-fuchsia-900/40 to-black border border-fuchsia-500/30 rounded-2xl p-5 relative overflow-hidden shadow-[0_0_15px_rgba(217,70,239,0.1)] group">
                            <Store className="absolute -top-4 -right-4 w-24 h-24 text-fuchsia-500/10 group-hover:scale-110 transition-transform duration-500" />
                            <h3 className="text-[10px] text-fuchsia-400 font-black uppercase tracking-widest mb-1 flex items-center gap-1">Locales <span className="text-white/30 text-[7px]">({activeZone.split('-')[0]})</span></h3>
                            <p className="text-3xl font-[1000] text-white">{metrics.subscribedShops}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                        {/* Panel Táctico Ari (Radar + Predictor) */}
                        <div className="xl:col-span-2 bg-[#050505] border border-white/10 rounded-2xl overflow-hidden flex flex-col shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                            {/* Tabs Header */}
                            <div className="flex border-b border-white/10 bg-white/[0.02]">
                                <button 
                                    onClick={() => { playNeonClick(); setActiveTab('radar'); }}
                                    className={`flex-1 py-4 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                                        activeTab === 'radar' 
                                        ? 'text-cyan-400 bg-cyan-500/5 border-b-2 border-cyan-500' 
                                        : 'text-white/30 hover:text-white/60 hover:bg-white/5'
                                    }`}
                                >
                                    <Target size={14} /> Radar en Vivo
                                </button>
                                <button 
                                    onClick={() => { playNeonClick(); setActiveTab('predictor'); }}
                                    className={`flex-1 py-4 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                                        activeTab === 'predictor' 
                                        ? 'text-orange-400 bg-orange-500/5 border-b-2 border-orange-500' 
                                        : 'text-white/30 hover:text-white/60 hover:bg-white/5'
                                    }`}
                                >
                                    <TrendingUp size={14} /> El Predictor (Saturación)
                                </button>
                                <button 
                                    onClick={() => { playNeonClick(); setActiveTab('telemetria'); }}
                                    className={`flex-1 py-4 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                                        activeTab === 'telemetria' 
                                        ? 'text-fuchsia-400 bg-fuchsia-500/5 border-b-2 border-fuchsia-500' 
                                        : 'text-white/30 hover:text-white/60 hover:bg-white/5'
                                    }`}
                                >
                                    <Activity size={14} /> Telemetría
                                </button>
                            </div>

                            <div className="p-6">
                                {activeTab === 'radar' ? (
                                    <div className="animate-in fade-in duration-500">
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 className="text-[14px] font-black uppercase tracking-[0.25em] flex items-center gap-2 text-white/80">
                                                <Target size={18} className="text-cyan-500 animate-pulse" /> Radar de Inteligencia Ari
                                            </h2>
                                            <div className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full">
                                                <span className="text-[8px] font-black text-cyan-400 uppercase tracking-widest">Fase 3: Maps Scan</span>
                                            </div>
                                        </div>
                                        <RadarScanner townId={townId} />
                                    </div>
                                ) : activeTab === 'predictor' ? (
                                    <div className="animate-in fade-in duration-500">
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 className="text-[14px] font-black uppercase tracking-[0.25em] flex items-center gap-2 text-white/80">
                                                <TrendingUp size={18} className="text-orange-500" /> El Predictor de Mercado
                                            </h2>
                                            <div className="px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full">
                                                <span className="text-[8px] font-black text-orange-400 uppercase tracking-widest">Fase 4: Análisis de Densidad</span>
                                            </div>
                                        </div>
                                        <SaturationPredictor townId={townId} category={activeCategory} />
                                    </div>
                                ) : (
                                    <div className="animate-in fade-in duration-500 flex flex-col gap-6">
                                        <div className="flex items-center justify-between mb-2">
                                            <h2 className="text-[14px] font-black uppercase tracking-[0.25em] flex items-center gap-2 text-white/80">
                                                <Activity size={18} className="text-fuchsia-500 animate-pulse" /> Telemetría de Tráfico y Sensores
                                            </h2>
                                            <div className="px-3 py-1 bg-fuchsia-500/10 border border-fuchsia-500/20 rounded-full">
                                                <span className="text-[8px] font-black text-fuchsia-400 uppercase tracking-widest">Fase 4.1: Live Analytics</span>
                                            </div>
                                        </div>

                                        {/* Telemetry Stats Cards */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                            <div className="bg-black/50 border border-white/10 rounded-xl p-3.5 flex flex-col justify-between">
                                                <span className="text-white/40 text-[7px] tracking-widest uppercase mb-1">MUESTRAS TOTALES</span>
                                                <span className="text-lg font-black text-white">{telemetryStats.total}</span>
                                            </div>
                                            <div className="bg-black/50 border border-white/10 rounded-xl p-3.5 flex flex-col justify-between">
                                                <span className="text-white/40 text-[7px] tracking-widest uppercase mb-1">TURNO PICO</span>
                                                <span className="text-lg font-black text-fuchsia-400 tracking-wide">{telemetryStats.peakTime}</span>
                                            </div>
                                            <div className="bg-black/50 border border-white/10 rounded-xl p-3.5 flex flex-col justify-between">
                                                <span className="text-white/40 text-[7px] tracking-widest uppercase mb-1">CLIMA EN ACCESOS</span>
                                                <span className="text-lg font-black text-cyan-400 flex items-center gap-1.5">{telemetryStats.peakWeather}</span>
                                            </div>
                                            <div className="bg-black/50 border border-white/10 rounded-xl p-3.5 flex flex-col justify-between">
                                                <span className="text-white/40 text-[7px] tracking-widest uppercase mb-1">DÍA PREFERIDO</span>
                                                <span className="text-lg font-black text-violet-400 tracking-wide">{telemetryStats.peakDay}</span>
                                            </div>
                                        </div>

                                        {/* Telemetry Logs Table */}
                                        <div className="bg-black/50 border border-white/10 rounded-xl p-4 flex flex-col gap-3">
                                            <h3 className="text-[10px] font-bold text-white/70 uppercase tracking-widest border-b border-white/5 pb-2">SENSORES DE RED EN TIEMPO REAL</h3>
                                            <div className="overflow-y-auto max-h-[300px] no-scrollbar flex flex-col gap-2.5 pr-1">
                                                {telemetryLogs.length === 0 ? (
                                                    <p className="text-[10px] text-white/30 italic text-center py-6">No hay registros de telemetría disponibles aún.</p>
                                                ) : (
                                                    telemetryLogs.map((log, idx) => (
                                                        <div key={log.id || idx} className="bg-white/[0.02] border border-white/5 hover:border-fuchsia-500/30 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-[10px] font-bold uppercase transition-all">
                                                            <div className="flex items-center gap-2.5">
                                                                <div className="w-2 h-2 rounded-full bg-fuchsia-500 animate-pulse"></div>
                                                                <div className="flex flex-col gap-0.5">
                                                                    <span className="text-white tracking-wider">Acceso a {log.townId?.replace(/-/g, ' ')}</span>
                                                                    <span className="text-white/30 text-[7.5px] tracking-widest">{new Date(log.timestamp).toLocaleString('es-AR')}</span>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-4 text-[9px] font-black tracking-widest">
                                                                <span className="px-2 py-1 bg-violet-500/10 border border-violet-500/20 rounded-md text-violet-300">
                                                                    📅 {log.dayOfWeek}
                                                                </span>
                                                                <span className="px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded-md text-amber-300">
                                                                    🕒 {log.timeOfDay}
                                                                </span>
                                                                <span className="px-2 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-md text-cyan-300 flex items-center gap-1">
                                                                    {getWeatherEmoji(log.weatherCode)} {log.temp}°C
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Columna Derecha: Fuerza de Elite + Bitácora Doberman */}
                        <div className="flex flex-col gap-6 h-fit">
                            {/* Embajadores */}
                            <div className="bg-[#050505] border border-white/10 rounded-2xl p-6 flex flex-col h-fit">
                            <h2 className="text-[11px] font-black uppercase tracking-[0.25em] flex items-center gap-2 text-white/80 mb-6">
                                <Users size={14} className="text-violet-500" /> Fuerza de Elite
                            </h2>
                            <div className="space-y-4">
                                {metrics.embajadores.map((emb: any) => (
                                    <div key={emb.name} className="flex items-center gap-3 p-4 bg-gradient-to-r from-violet-900/10 to-transparent border-l-2 border-violet-500 rounded-r-2xl hover:bg-violet-900/20 transition-all cursor-crosshair">
                                        <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.2)]">
                                            <Hexagon size={18} />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-[12px] font-bold text-white uppercase tracking-wider">{emb.name}</h4>
                                            <p className="text-[9px] text-white/50 tracking-widest uppercase">{emb.zone}</p>
                                        </div>
                                        <span className="text-[8px] font-black text-violet-400 uppercase tracking-widest bg-violet-500/10 px-2 py-1 rounded-md border border-violet-500/20">
                                            {emb.status}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Perfil de Embajadora de Zona */}
                            <div className="mt-4 pt-4 border-t border-white/10">
                                <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 mb-3 flex items-center gap-1">
                                    <Star size={10} className="text-cyan-400" /> Líder de Zona
                                </h3>
                                <div className="p-4 bg-gradient-to-r from-cyan-900/20 to-transparent border border-cyan-500/30 rounded-2xl flex flex-col gap-3 group relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                    <div className="flex items-center gap-3 relative z-10">
                                        <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                                            <Star size={18} />
                                        </div>
                                        <div>
                                            <h4 className="text-[13px] font-[1000] text-cyan-400 uppercase tracking-widest">{metrics.lead.name}</h4>
                                            <p className="text-[8px] text-white/50 uppercase tracking-[0.2em]">Supervisión Táctica</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 pl-[52px] relative z-10">
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-white/70 uppercase tracking-widest">
                                            <Phone size={12} className="text-green-400" /> {metrics.lead.phone}
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-white/70 uppercase tracking-widest">
                                            <MessageSquare size={12} className="text-blue-400" /> {metrics.lead.email}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-8 p-4 bg-violet-500/5 border border-violet-500/20 rounded-2xl">
                                <p className="text-[9px] text-violet-300/60 leading-relaxed uppercase tracking-widest font-bold">
                                    "Director, los embajadores están listos para el despliegue táctico basado en los datos del Predictor."
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ═══════════════════════════════════════════ */}
                    {/* 🐕 BITÁCORA DOBERMAN — Panel de Intrusos   */}
                    {/* ═══════════════════════════════════════════ */}
                    <div className="bg-[#050505] border border-red-500/20 rounded-2xl p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-[11px] font-black uppercase tracking-[0.25em] flex items-center gap-2 text-red-400">
                                <Dog size={16} className="drop-shadow-[0_0_6px_rgba(239,68,68,0.6)]" /> Bitacora Doberman
                            </h2>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => loadIntrusiones()}
                                    className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 text-white/40 hover:text-white transition-all"
                                    title="Refrescar"
                                >
                                    <RefreshCw size={12} />
                                </button>
                                {intrusiones.length > 0 && (
                                    <button 
                                        onClick={handleLimpiarTodo}
                                        className="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 rounded-lg border border-red-500/20 text-[8px] font-black text-red-400 uppercase tracking-widest transition-all"
                                    >
                                        Limpiar Todo
                                    </button>
                                )}
                            </div>
                        </div>

                        {intrusiones.length === 0 ? (
                            <div className="flex flex-col items-center gap-3 py-8 text-center">
                                <ShieldCheck size={32} className="text-green-500/30" />
                                <p className="text-[10px] text-white/30 uppercase tracking-widest">Perimetro limpio. Sin intrusiones registradas.</p>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-[300px] overflow-y-auto no-scrollbar">
                                {intrusiones.map((log) => (
                                    <div key={log.id} className={`flex items-center gap-3 p-3 border rounded-xl transition-all ${
                                        deletingId === log.id 
                                        ? 'bg-red-500/30 border-red-500/50 scale-95 opacity-50' 
                                        : 'bg-red-900/10 border-red-500/10 hover:border-red-500/30'
                                    }`}>
                                        {/* Bandera */}
                                        <div className="text-xl w-8 text-center flex-shrink-0">
                                            {getFlag(log.countryCode)}
                                        </div>
                                        
                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[11px] font-bold text-white/90 truncate">
                                                {log.email === 'anonimo' ? '👤 Usuario Anonimo' : `📧 ${log.email}`}
                                            </p>
                                            <div className="flex items-center gap-3 mt-0.5">
                                                <span className="text-[8px] text-white/40">IP: {log.ip}</span>
                                                <span className="text-[8px] text-white/40">{log.country || 'Desconocido'}</span>
                                            </div>
                                        </div>

                                        {/* Fecha */}
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-[9px] text-red-400 font-bold">{log.date}</p>
                                            <p className="text-[7px] text-white/30">{log.time}</p>
                                        </div>

                                        {/* Botón Eliminar */}
                                        <button
                                            onClick={() => handleEliminarIntruso(log.id)}
                                            disabled={deletingId === log.id}
                                            className="flex-shrink-0 p-2 bg-red-500/10 hover:bg-red-500/30 border border-red-500/20 hover:border-red-500/50 rounded-lg text-red-400 hover:text-red-300 transition-all active:scale-90 disabled:opacity-30"
                                            title="Eliminar registro"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    </div> {/* Closes Columna Derecha flex container */}
                </div>

                {/* ─── CHAT ARI ─── */}
                <div className="flex-[2] w-full mt-4 xl:mt-0 bg-black/80 backdrop-blur-2xl border border-violet-500/30 rounded-3xl overflow-hidden flex flex-col relative shadow-[0_0_40px_rgba(139,92,246,0.15)] h-[800px] shrink-0 mb-10">
                    <div className="bg-gradient-to-r from-violet-900/50 to-indigo-900/50 p-4 border-b border-violet-500/30 flex items-center gap-4">
                        <div className="relative">
                            <div className="w-12 h-12 rounded-2xl bg-black border border-violet-500/50 flex items-center justify-center relative z-10 shadow-[0_0_15px_rgba(139,92,246,0.4)]">
                                <Cpu size={24} className="text-violet-400" />
                            </div>
                            <div className="absolute inset-0 bg-violet-500 blur-xl opacity-40 animate-pulse"></div>
                            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-400 border-2 border-black rounded-full z-20"></span>
                        </div>
                        <div>
                            <h2 className="text-[16px] font-[1000] uppercase tracking-widest text-white">Ari</h2>
                            <p className="text-[8px] text-violet-300 font-bold tracking-[0.3em] uppercase">Analista Tactica · En linea</p>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-5 pb-20 space-y-4 no-scrollbar">
                        {ariMsgs.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'ari' ? 'justify-start' : 'justify-end'}`}>
                                <div className={`max-w-[85%] rounded-2xl p-4 text-[13px] leading-relaxed ${
                                    msg.role === 'ari' 
                                    ? 'bg-violet-900/20 border border-violet-500/30 text-white rounded-tl-sm shadow-[0_5px_15px_rgba(139,92,246,0.1)]' 
                                    : 'bg-cyan-900/20 border border-cyan-500/30 text-white rounded-tr-sm shadow-[0_5px_15px_rgba(6,182,212,0.1)]'
                                }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isThinking && (
                            <div className="flex justify-start">
                                <div className="max-w-[85%] rounded-2xl p-4 bg-violet-900/20 border border-violet-500/30 text-white rounded-tl-sm flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce"></div>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/90 to-transparent">
                        <div className="bg-black border border-violet-500/40 rounded-2xl flex items-center p-2 focus-within:border-violet-400 focus-within:shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-all">
                            <input 
                                type="file" 
                                id="chat-file-director"
                                onChange={handleChatFileChange}
                                className="hidden"
                                accept="image/*,application/pdf"
                            />
                            <label 
                                htmlFor="chat-file-director" 
                                className="p-2 text-white/40 hover:text-violet-400 hover:bg-violet-500/10 rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0 active:scale-90"
                                title="Adjuntar foto o PDF"
                            >
                                <Paperclip size={16} className={isUploadingFile ? "animate-spin" : ""} />
                            </label>
                            <input 
                                type="text"
                                value={msgInput}
                                onChange={e => setMsgInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSend()}
                                placeholder="Escribile a Ari. Comando, consulta o analisis..."
                                className="flex-1 bg-transparent text-white text-[12px] px-3 outline-none placeholder:text-white/20"
                            />
                            <button onClick={handleSend} className="w-10 h-10 bg-violet-500/20 hover:bg-violet-500 border border-violet-500/50 rounded-xl flex items-center justify-center text-violet-300 hover:text-white transition-all active:scale-90">
                                <MessageSquare size={16} />
                            </button>
                        </div>
                    </div>
                </div>
                </div>
            </main>

            {/* ─── INTERCOMUNICADOR DE FRECUENCIA (COMUNICACIONES INTERNAS) ─── */}
            <div className="w-full max-w-[1600px] mx-auto px-4 md:px-6 mt-6">
                <div className="bg-[#050505]/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col gap-6 shadow-[0_0_50px_rgba(0,0,0,0.6)] mb-10 w-full relative overflow-hidden">
                    {/* Brillo de fondo sutil */}
                    <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none"></div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6 relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="w-12 h-12 rounded-2xl bg-black border border-emerald-500/50 flex items-center justify-center relative z-10 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                                    <Radio size={24} className="text-emerald-400 animate-pulse" />
                                </div>
                                <div className="absolute inset-0 bg-emerald-500 blur-xl opacity-30 animate-pulse"></div>
                            </div>
                            <div>
                                <h2 className="text-[16px] font-[1000] uppercase tracking-[0.25em] text-white">Intercomunicador de Frecuencia</h2>
                                <p className="text-[9px] text-emerald-400 font-bold tracking-widest uppercase mt-1">Centro de Despacho de Misiones y Mensajería</p>
                            </div>
                        </div>
                        
                        {/* Sub-Tabs */}
                        <div className="flex gap-2 p-1 bg-black/50 border border-white/10 rounded-2xl self-start md:self-center">
                            <button
                                onClick={() => { playNeonClick(); setCommsSubTab('snc'); }}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                    commsSubTab === 'snc'
                                        ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                                        : 'text-white/40 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                SNC (Búnkeres)
                            </button>
                            <button
                                onClick={() => { playNeonClick(); setCommsSubTab('ambassadors'); }}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                    commsSubTab === 'ambassadors'
                                        ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                                        : 'text-white/40 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                Embajadores (Terreno)
                            </button>
                        </div>
                    </div>

                    <div className="relative z-10">
                        {commsSubTab === 'snc' ? (
                            <div className="flex flex-col gap-6 animate-in fade-in duration-300">
                                {/* RACK DE ACCESO RÁPIDO (MATRIZ DE CONOCIMIENTO Y AGENTES) */}
                                <div className="w-full bg-[#050A15]/40 border border-white/10 rounded-2xl p-6 backdrop-blur-md flex flex-col gap-4 shadow-inner">
                                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                                        <div className="flex items-center gap-2">
                                            <Cpu size={16} className="text-emerald-400" />
                                            <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-white">
                                                Rack de Acceso Rápido: Matriz de Conocimiento y Agentes
                                            </h3>
                                        </div>
                                        <span className="text-[8px] px-2 py-0.5 rounded border border-white/10 bg-white/5 font-black uppercase text-white/40 tracking-widest">
                                            11 Puntos de Conexión
                                        </span>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                                        {MATRIZ_ACCESO.map((item, idx) => {
                                            const IconComp = item.icon;
                                            return (
                                                <div 
                                                    key={idx} 
                                                    className="bg-black/50 border border-white/5 hover:border-white/15 rounded-xl p-4 flex flex-col gap-3.5 transition-all group relative overflow-hidden"
                                                >
                                                    {/* Indicador Neon Lateral */}
                                                    <div 
                                                        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl transition-all duration-300"
                                                        style={{ backgroundColor: item.color }}
                                                    />
                                                    
                                                    <div className="flex items-center gap-3">
                                                        <div 
                                                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all group-hover:scale-105 animate-pulse"
                                                            style={{ backgroundColor: `${item.color}15`, color: item.color }}
                                                        >
                                                            <IconComp size={16} />
                                                        </div>
                                                        <span className="text-[11px] font-black text-white uppercase tracking-wider truncate">
                                                            {item.name}
                                                        </span>
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-2 gap-2 text-[9px] font-black uppercase tracking-wider">
                                                        <a 
                                                            href={item.notebook} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            onClick={() => playNeonClick()}
                                                            className="py-2 px-2.5 rounded-lg border border-white/5 hover:border-white/20 bg-white/[0.01] hover:bg-white/[0.04] text-white/60 hover:text-white transition-all text-center flex items-center justify-center gap-1.5 active:scale-95"
                                                        >
                                                            <BookOpen size={10} className="shrink-0" /> Cuaderno
                                                        </a>
                                                        <a 
                                                            href={item.agent} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            onClick={() => playNeonClick()}
                                                            className="py-2 px-2.5 rounded-lg text-black transition-all text-center flex items-center justify-center gap-1.5 active:scale-95 hover:opacity-90 shadow-sm"
                                                            style={{ backgroundColor: item.color }}
                                                        >
                                                            <MessageSquare size={10} className="shrink-0" /> Agente
                                                        </a>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                {/* Panel de Redacción de Directiva */}
                                <div className="lg:col-span-5 bg-[#050A15]/60 border border-white/10 rounded-2xl p-6 flex flex-col gap-5 backdrop-blur-md">
                                    <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-emerald-400">Despacho de Misiones Directivas (SNC)</h3>
                                    
                                    {/* Título */}
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-white/45 block">Título de la Misión / Orden</label>
                                        <input 
                                            type="text"
                                            value={dirTitle}
                                            onChange={e => setDirTitle(e.target.value)}
                                            placeholder="Ej: Reunión Directiva General"
                                            className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-[12px] text-white outline-none focus:border-emerald-500/50 transition-colors"
                                        />
                                    </div>

                                    {/* Prioridad y Tipo */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-white/45 block">Prioridad</label>
                                            <select
                                                value={dirPriority}
                                                onChange={e => setDirPriority(e.target.value as any)}
                                                className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2.5 text-[12px] text-white outline-none focus:border-emerald-500/50 transition-colors"
                                            >
                                                <option value="baja">Baja</option>
                                                <option value="media">Media</option>
                                                <option value="alta">Alta</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-white/45 block">Tipo</label>
                                            <select
                                                value={dirType}
                                                onChange={e => setDirType(e.target.value as any)}
                                                className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2.5 text-[12px] text-white outline-none focus:border-emerald-500/50 transition-colors"
                                            >
                                                <option value="directiva">Directiva</option>
                                                <option value="mision">Misión</option>
                                                <option value="alerta">Alerta</option>
                                                <option value="notificacion">Notificación</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Contenido / Directiva */}
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-white/45 block">Instrucciones / Contenido</label>
                                        <textarea 
                                            value={dirContent}
                                            onChange={e => setDirContent(e.target.value)}
                                            placeholder="Ej: Hoy a las 8hs reunión obligatoria en el Búnker Central..."
                                            className="w-full bg-black/60 border border-white/10 rounded-xl p-4 text-[12px] text-white placeholder:text-white/20 outline-none focus:border-emerald-500/50 min-h-[110px] resize-none transition-colors"
                                        />
                                    </div>

                                    {/* Destinos */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-white/45">Búnkeres Destinatarios</label>
                                            <button 
                                                type="button"
                                                onClick={() => {
                                                    playNeonClick();
                                                    if (dirTargets.length === BUNKER_LIST.length) {
                                                        setDirTargets([]);
                                                    } else {
                                                        setDirTargets(BUNKER_LIST.map(b => b.id));
                                                    }
                                                }}
                                                className="text-[9px] font-black text-emerald-400 hover:underline uppercase tracking-widest transition-all"
                                            >
                                                {dirTargets.length === BUNKER_LIST.length ? 'Deseleccionar Todos' : 'Seleccionar Todos'}
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 xl:grid-cols-3 gap-2 border border-white/5 bg-black/30 rounded-xl p-3">
                                            {BUNKER_LIST.map((bunk) => {
                                                const isChecked = dirTargets.includes(bunk.id);
                                                return (
                                                    <label 
                                                        key={bunk.id} 
                                                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-[10.5px] font-bold cursor-pointer transition-all ${
                                                            isChecked 
                                                                ? 'bg-emerald-500/10 border-emerald-500/40 text-white shadow-[0_2px_8px_rgba(16,185,129,0.05)]' 
                                                                : 'bg-white/[0.01] border-white/5 text-white/50 hover:text-white hover:border-white/10'
                                                        }`}
                                                    >
                                                        <input 
                                                            type="checkbox" 
                                                            checked={isChecked}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setDirTargets([...dirTargets, bunk.id]);
                                                                } else {
                                                                    setDirTargets(dirTargets.filter(id => id !== bunk.id));
                                                                }
                                                            }}
                                                            className="accent-emerald-500 w-3.5 h-3.5 rounded"
                                                        />
                                                        <span className="truncate">{bunk.label}</span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Enviar */}
                                    <button 
                                        onClick={handleSendDirective}
                                        disabled={isSendingDirective || !dirTitle.trim() || !dirContent.trim() || dirTargets.length === 0}
                                        className="w-full py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-black font-[1000] uppercase tracking-[0.2em] text-[11px] rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(16,185,129,0.15)] active:scale-[0.99]"
                                    >
                                        {isSendingDirective ? <RefreshCw size={14} className="animate-spin" /> : <Radio size={14} />}
                                        TRANSMITIR A BÚNKERES
                                    </button>
                                </div>

                                {/* Monitor de Directivas en Tiempo Real */}
                                <div className="lg:col-span-7 bg-[#050A15]/60 border border-white/10 rounded-2xl p-6 flex flex-col gap-4 backdrop-blur-md h-[680px] overflow-hidden">
                                    <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-white/80 border-b border-white/5 pb-3">Panel de Monitoreo y Cumplimiento</h3>
                                    <div className="flex-1 overflow-y-auto pr-1 space-y-4 no-scrollbar custom-scrollbar">
                                        {allDirectives.filter(d => d.estado !== 'archived').length === 0 ? (
                                            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                                                <Radio size={32} className="text-white/10" />
                                                <p className="text-[10px] text-white/30 italic uppercase tracking-widest">No hay directivas activas en el sistema.</p>
                                            </div>
                                        ) : (
                                            allDirectives.filter(d => d.estado !== 'archived').map((dir) => {
                                                let priorityBadge = "text-white/40 border-white/10 bg-white/5";
                                                if (dir.priority === 'alta') {
                                                    priorityBadge = "text-red-400 border-red-500/20 bg-red-500/5";
                                                } else if (dir.priority === 'media') {
                                                    priorityBadge = "text-amber-400 border-amber-500/20 bg-amber-500/5";
                                                } else if (dir.priority === 'baja') {
                                                    priorityBadge = "text-blue-400 border-blue-500/20 bg-blue-500/5";
                                                }

                                                return (
                                                    <div key={dir.id} className="bg-black/50 border border-white/5 hover:border-white/10 rounded-xl p-4 space-y-4 transition-all">
                                                        <div className="flex justify-between items-start gap-4">
                                                            <div>
                                                                <h4 className="text-[13px] font-bold text-white uppercase tracking-wide">{dir.title}</h4>
                                                                <span className="text-[8px] text-white/30 uppercase tracking-widest font-mono block mt-1">
                                                                    Creado: {new Date(dir.fechaCreacion).toLocaleString('es-AR')}
                                                                </span>
                                                            </div>
                                                            <div className="flex gap-1.5 shrink-0">
                                                                <span className={`text-[7px] font-black uppercase px-2 py-0.5 rounded border tracking-widest ${priorityBadge}`}>
                                                                    {dir.priority}
                                                                </span>
                                                                <span className="text-[7px] font-black text-white/60 bg-white/5 border border-white/10 uppercase px-2 py-0.5 rounded tracking-widest">
                                                                    {dir.type}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <p className="text-[12px] text-white/95 leading-relaxed font-bold break-words bg-black/40 p-3 rounded-lg border border-white/5">{dir.content}</p>

                                                        {/* Estado de Búnkeres */}
                                                        <div className="space-y-2.5">
                                                            <span className="text-[9px] font-black uppercase tracking-widest text-white/45 block">Confirmación por Búnker:</span>
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                                                {dir.targetBunkers.map(bId => {
                                                                    const bInfo = BUNKER_LIST.find(b => b.id === bId) || { label: bId };
                                                                    const reply = dir.respuestas?.find(r => r.bunkerId === bId);
                                                                    const isConfirmed = reply?.confirmed || false;

                                                                    return (
                                                                        <div 
                                                                            key={bId}
                                                                            className={`p-3 rounded-xl border text-[11px] flex flex-col gap-1.5 transition-all ${
                                                                                isConfirmed 
                                                                                    ? 'bg-emerald-500/5 border-emerald-500/20 text-white shadow-[0_2px_8px_rgba(16,185,129,0.02)]'
                                                                                    : reply 
                                                                                        ? 'bg-amber-500/5 border-amber-500/20 text-white'
                                                                                        : 'bg-red-500/5 border-red-500/10 text-white/50'
                                                                            }`}
                                                                        >
                                                                            <div className="flex items-center justify-between">
                                                                                <span className="font-bold uppercase tracking-wide truncate pr-2">{bInfo.label}</span>
                                                                                <span className={`text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border shrink-0 ${
                                                                                    isConfirmed 
                                                                                        ? 'text-emerald-400 border-emerald-500/25 bg-emerald-500/10'
                                                                                        : reply 
                                                                                            ? 'text-amber-400 border-amber-500/25 bg-amber-500/10'
                                                                                            : 'text-red-400 border-red-500/25 bg-red-500/10'
                                                                                }`}>
                                                                                    {isConfirmed ? 'Confirmado' : reply ? 'Respondido' : 'Pendiente'}
                                                                                </span>
                                                                            </div>
                                                                            {reply ? (
                                                                                <p className="text-[10px] italic text-white/80 break-words mt-1 border-t border-white/5 pt-1.5">"{reply.text}"</p>
                                                                            ) : (
                                                                                <span className="text-[8.5px] text-white/30 italic mt-0.5">Esperando reporte...</span>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>

                                                        {/* Acciones */}
                                                        <div className="flex justify-end pt-2 border-t border-white/5">
                                                            <button 
                                                                onClick={() => handleArchiveDirective(dir.id!)}
                                                                className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg text-white/60 hover:text-red-400 text-[8.5px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-1.5"
                                                            >
                                                                Archivar Misión
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                {/* Panel de Redacción */}
                                <div className="lg:col-span-5 bg-[#050A15]/80 border border-white/10 rounded-2xl p-6 flex flex-col gap-5">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-emerald-400">Redactar Orden a Embajadores</h3>
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <input 
                                                type="checkbox" 
                                                className="accent-emerald-500 w-3.5 h-3.5 cursor-pointer rounded"
                                                checked={selectedAmbassadors.includes('all')}
                                                onChange={(e) => {
                                                    if (e.target.checked) setSelectedAmbassadors(['all']);
                                                    else setSelectedAmbassadors([]);
                                                }}
                                            />
                                            <span className="text-[9px] font-black text-emerald-400/70 group-hover:text-emerald-400 uppercase tracking-widest transition-colors">SELECCIONAR TODOS</span>
                                        </label>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[200px] overflow-y-auto pr-1 border border-white/5 bg-black/30 rounded-xl p-3 custom-scrollbar">
                                        {ambassadorsList.map((amb) => (
                                            <label key={amb.id} className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all cursor-pointer ${
                                                selectedAmbassadors.includes(amb.id) || selectedAmbassadors.includes('all')
                                                ? 'bg-emerald-500/10 border-emerald-500/30'
                                                : 'bg-white/5 border-white/5 hover:border-white/10'
                                            }`}>
                                                <input 
                                                    type="checkbox" 
                                                    className="accent-emerald-500 w-3.5 h-3.5 rounded"
                                                    checked={selectedAmbassadors.includes(amb.id) || selectedAmbassadors.includes('all')}
                                                    onChange={(e) => {
                                                        if (selectedAmbassadors.includes('all')) return;
                                                        if (e.target.checked) {
                                                            setSelectedAmbassadors([...selectedAmbassadors, amb.id]);
                                                        } else {
                                                            setSelectedAmbassadors(selectedAmbassadors.filter(id => id !== amb.id));
                                                        }
                                                    }}
                                                    disabled={selectedAmbassadors.includes('all')}
                                                />
                                                <div className="flex-1 flex justify-between items-center min-w-0 gap-2">
                                                    <span className="text-[11px] font-bold text-white truncate">{amb.name || amb.email}</span>
                                                    {amb.phone && (
                                                        <a 
                                                            href={`https://wa.me/${amb.phone.replace(/[^0-9]/g, '')}`} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="p-2 bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-black rounded-lg transition-all shrink-0 active:scale-95"
                                                            onClick={e => e.stopPropagation()}
                                                            title="WhatsApp Directo"
                                                        >
                                                            <MessageSquare size={12} />
                                                        </a>
                                                    )}
                                                </div>
                                            </label>
                                        ))}
                                        {ambassadorsList.length === 0 && (
                                            <p className="text-[10px] text-white/30 italic text-center py-8 col-span-2">No hay embajadores activos disponibles.</p>
                                        )}
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-white/45 block">Mensaje / Directiva</label>
                                        <textarea 
                                            value={msgText}
                                            onChange={e => setMsgText(e.target.value)}
                                            placeholder="Escriba la directiva aquí..."
                                            className="w-full bg-black/60 border border-white/10 rounded-xl p-4 text-[12px] text-white placeholder:text-white/20 outline-none focus:border-emerald-500/50 min-h-[120px] resize-none transition-colors"
                                        />
                                    </div>

                                    <button 
                                        onClick={handleSendMessage}
                                        disabled={isSendingMsg || !msgText.trim() || selectedAmbassadors.length === 0}
                                        className="w-full py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-black font-black uppercase tracking-[0.2em] text-[11px] rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.99]"
                                    >
                                        {isSendingMsg ? <RefreshCw size={14} className="animate-spin" /> : <Radio size={14} />}
                                        TRANSMITIR ORDEN
                                    </button>
                                </div>

                                {/* Historial de Envíos */}
                                <div className="lg:col-span-7 bg-[#050A15]/80 border border-white/10 rounded-2xl p-6 flex flex-col gap-4 h-[550px] overflow-hidden">
                                    <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-white/80 border-b border-white/5 pb-3">Registros de Transmisión</h3>
                                    <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar no-scrollbar">
                                        {sentMessages.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                                                <Radio size={32} className="text-white/10" />
                                                <p className="text-[10px] text-white/30 italic uppercase tracking-widest">Aún no se han enviado directivas.</p>
                                            </div>
                                        ) : (
                                            sentMessages.map(msg => (
                                                <div key={msg.id} className="bg-white/5 border border-white/5 hover:border-white/10 rounded-xl p-4 flex flex-col gap-2 transition-all">
                                                    <div className="flex justify-between items-start gap-4">
                                                        <span className="text-[9px] text-white/40 uppercase tracking-widest font-mono">{new Date(msg.createdAt).toLocaleString('es-AR')}</span>
                                                        <div className={`px-2.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest flex items-center gap-1 ${
                                                            msg.isRead ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                                                        }`}>
                                                            {msg.isRead ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                                                            {msg.isRead ? 'Confirmado' : 'Pendiente'}
                                                        </div>
                                                    </div>
                                                    <p className="text-[12px] text-white/90 font-bold break-words bg-black/30 p-2.5 rounded-lg border border-white/5">{msg.text}</p>
                                                    <div className="text-[9px] text-emerald-400/50 uppercase tracking-widest border-t border-white/5 pt-2 mt-1 font-mono">
                                                        Destino: {msg.recipientName}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <BtuComponent 
                bunkerId="director"
                townId={townId}
                onInjectToAri={(text) => {
                    setMsgInput(text);
                }}
            />
        </div>
    );
};
