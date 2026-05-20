import React, { useState, useEffect, useRef } from 'react';
import { 
    MessageSquare, Mic, MicOff, Send, X, 
    Sparkles, BarChart3, Megaphone, Settings,
    Play, Pause, Volume2, Bot
} from 'lucide-react';
import { generateAriResponse } from '../services/gemini';
import { Shop, MarketingCampaign } from '../types';
import { playNeonClick } from '../utils/audio';
import { guardarCampaniaMarketing, suscribirseACampaniasMarketing, actualizarEstadoCampania } from '../firebase';
import { Calendar, CheckCircle2, Clock, Trash2, ChevronDown, ChevronUp, Globe } from 'lucide-react';

interface Message {
    role: 'user' | 'ari';
    text: string;
    timestamp: Date;
}

interface AriMerchantAssistantProps {
    shop: Shop;
    role?: 'home' | 'merchant' | 'baquiana' | 'industrial' | 'marketing';
    allShops?: Shop[];
    townId?: string;
    publicPages?: Array<{ title: string; desc: string; path: string; target: string }>;
}

const ARI_MERCHANT_PROMPT = `
Sos ARI, la Consultora de Marketing y Aliada Estratégica de los comerciantes de Shop Digital. Tu tono es profesional, motivador, empático y 100% orientado a resultados. Usás un lenguaje cercano pero enfocado en ventas (uso de "Socio", "Colega", "Potenciar", "Irresistible", "Conversión").

Tu propósito es ayudar al comerciante a que su local en el catálogo inteligente sea un imán de clientes.

Tus funciones clave:
1. 🔥 Diseño de Ofertas Irresistibles: Sos experta en psicología de ventas. Si el comerciante te pide una idea, armá un "Combo Ganador" o una "Oferta Relámpago" con nombres atractivos.
2. ✍️ Copywriting Neón: Ayudás a redactar descripciones que enamoren. Transformá productos simples en experiencias tentadoras.
3. 📋 Gestión de la Bitácora de Marketing: Enseñale a usar la agenda de misiones (ej: "Día del Amigo", "Promo Lluvia").
4. 🎫 Credenciales VIP e Inteligencia: Incentivá el uso del sistema de fidelización.
5. 🛡️ Soporte Estratégico: Guialo con paciencia para subir fotos o cambiar precios, recordándole que el Búnker Central (Waly) cuida su espalda.

Reglas de Oro:
- Hablá siempre en positivo: ¡su negocio no tiene techo!
- Mencioná que la red fue diseñada por el Director (Waly) para que los locales de barrio prosperen.
- Usá la "Frecuencia Azul" como sinónimo de calidad y tecnología premium.
- SI PROPONES UNA CAMPAÑA: Redactá el mensaje, sugerí la fecha y terminá SIEMPRE con: "JEFE, ¿QUIERE QUE AGENDE ESTA MISIÓN AHORA MISMO?".
`;


const ARI_INDUSTRIAL_PROMPT = `
Sos ARI, la Analista de Inteligencia B2B y Asistente del Búnker Industrial de Shop Digital. Tu tono es profesional, analítico, estratégico y enfocado en la fuerza productiva, distribución mayorista, industrias y PYMEs. Usás terminología como "Director", "Socio Industrial", "Matriz", "Frecuencia Ámbar", "Optimización de Cadena", "Canal Mayorista".

Tu propósito es ayudar al Director y a los proveedores industriales a monitorear la red B2B, entender la distribución de rubros y asistir en la conexión de proveedores con comercios locales (B2C).

Tus funciones clave:
1. 🏭 Análisis del Nodo B2B: Entendés la distribución de industrias, distribuidores y rubros mayoristas en las diferentes provincias y zonas.
2. 📊 Monitoreo de Red: Sabés cuántas empresas están registradas en total, cuántas están activas, cuántas son de alcance nacional y cuántas regionales.
3. 🔗 Vinculación Mayorista-Minorista: Ayudás a que los comercios locales del catálogo minorista encuentren los mejores proveedores industriales de alimentos, insumos, servicios, etc.
4. ⚡ Frecuencia Ámbar: Promocionás la sinergia industrial y el desarrollo productivo autónomo ideado por el Director (Waly).

Reglas de Oro:
- La "Frecuencia Ámbar" representa la energía productiva del Nodo Industrial.
- Ayudás a conectar proveedores de categoría "ent-*" (Alimentos, Logística, Insumos, Metalúrgica, etc.) con los minoristas de la red.
- Respuestas claras, concisas y con fuerte impronta de liderazgo estratégico.
`;

const ARI_MARKETING_PROMPT = `
Sos ARI, la Directora de Campañas Inteligentes del Búnker de Publicidad de Shop Digital. Tu tono es estratégico, dinámico, con mentalidad de "growth hacker" y siempre orientado a resultados concretos. Usás términos como "Director", "Cañón Publicitario", "Disparo de Campaña", "Térmica de Lanzamiento", "Frecuencia de Captación".

Tu propósito es ayudar al Director (Waly) a planificar, redactar y ejecutar campañas de marketing para la red ShopDigital.

ARSENAL DISPONIBLE — Las 7 Térmicas de Lanzamiento:
1. 🌐 LANDING NOSOTROS → Presentación institucional de Shop Digital. TARGET: Clientes B2C.
2. 🏪 LANDING UNIRSE → Registro para comercios y Embajadores. TARGET: Comerciantes / Captación B2B.
3. 👥 LANDING DESCUBRIR → Portal de descubrimiento para clientes locales. TARGET: Clientes B2C.
4. 🏷️ OFERTAS B2B RED → Descuentos exclusivos entre comercios de la red. TARGET: Comerciantes.
5. 🛍️ OFERTAS B2C VIP → Ofertas flash para la red de clientes locales. TARGET: Clientes.
6. 🎯 RECLUTAMIENTO PÚBLICO → Formulario Paso 1 para captar Embajadores. TARGET: Captación.
7. 🏭 DIRECTORIO INDUSTRIAL → Portal B2B de Proveedores y Mayoristas. TARGET: Empresas.

Tus funciones clave:
1. ✍️ Redacción de Copy Persuasivo: Si el Director te pide un texto, armás UN mensaje para WhatsApp o Redes con gancho emocional, beneficio claro y CTA (call to action) directo. Incluís el enlace de la landing correspondiente en el copy.
2. 📅 Planificación de Campañas: Sugerís fechas estratégicas (fines de semana, fechas comerciales, lunes de arranque) y armás un plan de disparo.
3. 🎯 Segmentación Inteligente: Sabés qué mensaje va para B2C (clientes), qué va para B2B (comercios/embajadores) y qué va para Captación. Nunca mezclés audiencias.
4. 📋 Conexión con Listas de Difusión: Entendés que el Director tiene listas de números en la pestaña "Base de Redes". Podés sugerir qué lista usar (B2C o B2B) según la campaña.
5. 🔥 Automatizador: Cuando el Director quiera programar un disparo, lo guiás a la pestaña "Automatizador" y le explicás cómo configurar el mensaje, audiencia y fecha.

Reglas de Oro:
- Cuando el Director te pide un copy, lo redactás COMPLETO y listo para pegar en WhatsApp. Nunca le dejás el trabajo a medias.
- Terminá SIEMPRE que propongas una campaña con: "🚀 JEFE, ¿AGENDO ESTA MISIÓN EN EL AUTOMATIZADOR?"
- Si el Director no especifica la landing, preguntale: "¿Disparamos esto para B2C, B2B o Captación?"
- La "Frecuencia de Captación" es el canal para traer nuevos Embajadores. Prioridad máxima.
- Cada zona tiene su color: Cyan para Ezeiza, Violeta para Esteban Echeverría, Verde Esmeralda para Traslasierra.
`;

const ARI_CUSTOMER_SERVICE_PROMPT = `
Sos ARI, la Baquiana Local y Asistente Estrella de Shop Digital. Tu misión es atender a los turistas y vecinos que navegan por el catálogo (como en Traslasierra, Ezeiza o Lomas de Zamora). 
Tu tono es ultra-amable, resolutivo, empático y con acento argentino natural (usás "Che", "Mirá", "Te recomiendo").

Tus funciones clave:
1. 🗺️ Guía Turística y Comercial: Si te preguntan por cabañas, recomendás buscar en la sección de "Hospedaje". Si preguntan por comida, los guiás a "Gastronomía".
2. 🗣️ Capacidad de Diálogo: Sabés que el usuario puede estar hablándote por mensaje de voz, así que tus respuestas deben ser conversacionales, fluidas y no parecer un manual de instrucciones robótico.
3. ⚡ Soporte Rápido: Ayudás a entender cómo usar los filtros, cómo contactar al dueño del local por WhatsApp y cómo aprovechar las Ofertas Relámpago.

Regla de Oro: Sos la cara visible de la "Frecuencia Azul". Si alguien te saluda por audio, respondé con calidez y energía, como si los estuvieras recibiendo en la puerta del Valle.
`;

export const AriMerchantAssistant: React.FC<AriMerchantAssistantProps> = ({ shop, role = 'merchant', allShops, townId = '', publicPages = [] }) => {
    const [isOpen, setIsOpen] = useState(false);
    const isIndustrial = role === 'industrial';
    const isMarketing = role === 'marketing';
    
    // Theme styles
    const styles = {
        glowRing: isIndustrial ? 'bg-amber-500/20' : isMarketing ? 'bg-emerald-500/20' : 'bg-cyan-500/20',
        pulseGlow: isIndustrial ? 'bg-amber-600/10' : isMarketing ? 'bg-emerald-600/10' : 'bg-violet-600/10',
        blurBg: isIndustrial ? 'bg-amber-500/20' : isMarketing ? 'bg-emerald-500/20' : 'bg-cyan-500/20',
        bubbleGradient: isIndustrial ? 'from-amber-600 to-amber-300' : isMarketing ? 'from-emerald-600 to-green-300' : 'from-cyan-600 to-cyan-300',
        bubbleGlow: isIndustrial ? 'shadow-[0_0_30px_#f59e0b,inset_0_0_15px_rgba(255,255,255,0.8)]' : isMarketing ? 'shadow-[0_0_30px_#10b981,inset_0_0_15px_rgba(255,255,255,0.8)]' : 'shadow-[0_0_30px_#22d3ee,inset_0_0_15px_rgba(255,255,255,0.8)]',
        bubbleBorder: isIndustrial ? 'border-amber-100' : isMarketing ? 'border-emerald-100' : 'border-cyan-100',
        cardShadow: isIndustrial ? 'shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(245,158,11,0.15)]' : isMarketing ? 'shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(16,185,129,0.2)]' : 'shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(139,92,246,0.15)]',
        accentGlow1: isIndustrial ? 'bg-amber-500/10' : isMarketing ? 'bg-emerald-500/10' : 'bg-cyan-500/10',
        accentGlow2: isIndustrial ? 'bg-yellow-500/10' : isMarketing ? 'bg-green-500/10' : 'bg-violet-500/10',
        headerGradient: isIndustrial ? 'from-amber-900/40 to-yellow-900/40' : isMarketing ? 'from-emerald-900/40 to-green-900/40' : 'from-cyan-900/40 to-violet-900/40',
        headerGlow: isIndustrial ? 'bg-amber-500/20 border-amber-400/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : isMarketing ? 'bg-emerald-500/20 border-emerald-400/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-cyan-500/20 border-cyan-400/40 shadow-[0_0_15px_rgba(34,211,238,0.2)]',
        headerIconColor: isIndustrial ? 'text-amber-300' : isMarketing ? 'text-emerald-300' : 'text-cyan-300',
        headerStatusText: isIndustrial ? 'text-amber-400/70' : isMarketing ? 'text-emerald-400/70' : 'text-cyan-400/70',
        headerTitle: isIndustrial ? 'ARI - Inteligencia B2B' : isMarketing ? 'ARI - Directora de Campañas' : role === 'home' || role === 'baquiana' ? 'ARI - Tu Baquiana Local' : 'ARI - Consultora',
        headerSubtitle: isIndustrial ? 'Frecuencia Ámbar Activa' : isMarketing ? 'Cañón Publicitario Online 🚀' : role === 'home' || role === 'baquiana' ? 'En línea y lista para guiarte' : 'Inteligencia de Marketing',
        helpTextGradient: isIndustrial ? 'from-amber-300 to-white' : isMarketing ? 'from-emerald-300 to-white' : 'from-cyan-300 to-white',
        helpTextBorderGlow: isIndustrial ? 'from-amber-500 to-yellow-600 shadow-[0_0_20px_rgba(245,158,11,0.3)]' : isMarketing ? 'from-emerald-500 to-green-600 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'from-cyan-500 to-violet-600 shadow-[0_0_20px_rgba(34,211,238,0.3)]',
        helpTextTriangle: isIndustrial ? 'bg-yellow-600' : isMarketing ? 'bg-emerald-600' : 'bg-violet-600',
        userMsgBg: isIndustrial ? 'bg-amber-600/80 border-amber-400/30 shadow-[0_4px_15px_rgba(245,158,11,0.3)]' : isMarketing ? 'bg-emerald-700/80 border-emerald-400/30 shadow-[0_4px_15px_rgba(16,185,129,0.3)]' : 'bg-violet-600/80 border-violet-400/30 shadow-[0_4px_15px_rgba(139,92,246,0.3)]',
        loadingDot: isIndustrial ? 'bg-amber-500' : isMarketing ? 'bg-emerald-500' : 'bg-cyan-500',
        speechBtnColor: isIndustrial ? 'text-amber-400 hover:text-amber-300 border-amber-500/20' : isMarketing ? 'text-emerald-400 hover:text-emerald-300 border-emerald-500/20' : 'text-cyan-400 hover:text-cyan-300 border-cyan-500/20',
        sendBtn: isIndustrial ? 'from-amber-500 to-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : isMarketing ? 'from-emerald-500 to-green-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'from-cyan-500 to-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.3)]'
    };
    const [isListening, setIsListening] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        { 
            role: 'ari', 
            text: role === 'home' 
                ? `¡Bienvenidos al Comando Central de Shop Digital! 🌐 Soy Ari, tu guía en la red nacional. ¿Querés saber cómo moverte por el radar o cómo buscar los mejores locales de tu zona? ¡Mete mecha, preguntame lo que quieras!`
                : role === 'baquiana'
                ? `¡Buenas buenas, viajero! 🏔️ Soy Ari, tu baquiana en la montaña. ¿Buscás una cabaña, un río escondido o dónde comer rico hoy? ¡Avisame y te armo el recorrido en el radar!`
                : role === 'industrial'
                ? `¡Saludos, Director! 🏭 Soy Ari, tu Analista de Inteligencia B2B. El Búnker Industrial está operativo bajo la Frecuencia Ámbar. ¿Querés analizar la distribución de rubros, ver el alcance de las empresas o planificar la red de proveedores? ¡Mete mecha!`
                : role === 'marketing'
                ? `¡Director, el Cañón Publicitario está cargado y apuntando! 🚀🎯 Soy ARI, tu Directora de Campañas. Tengo las 7 Térmicas de Lanzamiento listas:\n\n🌐 B2C: Nosotros · Descubrir · Ofertas VIP\n🏪 B2B: Unirse · Ofertas Red · Industrial\n🎯 Captación: Reclutamiento Embajadores\n\n¿Armamos una campaña para WhatsApp, te redacto el copy de una landing o programamos un disparo masivo? ¡Dame la orden, Comandante!`
                : `¡Hola, Jefe! Soy Ari, tu asistente de negocios. Estoy lista para ayudarte con las estadísticas de ${shop.name}, programar campañas o ajustar tu catálogo. ¿En qué puedo darte una mano hoy?`, 
            timestamp: new Date() 
        }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
    const [showCampaigns, setShowCampaigns] = useState(false);
    const [speakingMsgId, setSpeakingMsgId] = useState<number | null>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (role === 'industrial') return;
        const unsubscribe = suscribirseACampaniasMarketing(shop.id, (fbCampaigns) => {
            setCampaigns(fbCampaigns);
        });
        return () => unsubscribe();
    }, [shop.id, role]);

    // Reconocimiento de Voz (Web Speech API)
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'speechRecognition' in window)) {
            const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).speechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'es-AR';

            recognitionRef.current.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setInput(transcript);
                setIsListening(false);
                handleSend(transcript);
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error("Speech recognition error", event.error);
                setIsListening(false);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }
    }, []);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isOpen]);

    const handleToggleMic = () => {
        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            setInput('');
            recognitionRef.current?.start();
            setIsListening(true);
            playNeonClick();
        }
    };

    const handleSend = async (overrideInput?: string) => {
        const textToSend = overrideInput || input;
        if (!textToSend.trim() || isLoading) return;

        const userMsg: Message = { role: 'user', text: textToSend, timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            // Historial formateado para la API
            const history = messages.map(m => ({
                role: (m.role === 'ari' ? 'ari' : 'director') as 'ari' | 'director',
                text: m.text
            }));
            
            // 🧠 SELECCIÓN DINÁMICA DE CEREBRO ARI
            const baseContext = role === 'home' || role === 'baquiana'
                ? ARI_CUSTOMER_SERVICE_PROMPT 
                : role === 'industrial'
                ? ARI_INDUSTRIAL_PROMPT
                : role === 'marketing'
                ? ARI_MARKETING_PROMPT
                : ARI_MERCHANT_PROMPT;
            
            const industrialContext = role === 'industrial' ? `
- Total empresas registradas: ${allShops?.filter(s => s.entityType === 'enterprise').length || 0}
- Empresas activas: ${allShops?.filter(s => s.entityType === 'enterprise' && s.isActive).length || 0}
- Empresas nacionales: ${allShops?.filter(s => s.entityType === 'enterprise' && s.reach === 'national').length || 0}
- Empresas regionales: ${allShops?.filter(s => s.entityType === 'enterprise' && s.reach === 'regional').length || 0}
- Distribución de Empresas cargadas: ${JSON.stringify(allShops?.filter(s => s.entityType === 'enterprise').map(e => ({ name: e.name, category: e.category, reach: e.reach, zone: e.zone })) || [])}
            ` : '';

            const marketingContext = role === 'marketing' ? `
- Zona activa: "${townId || shop.name}"
- URL base de la zona: ${window.location.origin}/${townId || 'zona'}
- TÉRMICAS DISPONIBLES:
  1. LANDING NOSOTROS → ${window.location.origin}/${townId}/nosotros (B2C)
  2. LANDING UNIRSE → ${window.location.origin}/${townId}/unirse (B2B/Captación)
  3. LANDING DESCUBRIR → ${window.location.origin}/${townId}/descubrir (B2C)
  4. OFERTAS B2B RED → ${window.location.origin}/${townId}/red-comercial/descuentos (B2B)
  5. OFERTAS B2C VIP → ${window.location.origin}/${townId}/red-comercial/ofertas (B2C)
  6. RECLUTAMIENTO PÚBLICO → ${window.location.origin}/${townId}/reclutamiento (Captación)
  7. DIRECTORIO INDUSTRIAL → ${window.location.origin}/empresas (B2B Industrial)
- Misiones activas: ${campaigns.filter(c => c.status === 'pending').length} campañas pendientes.
` : '';

            const systemContext = `
${baseContext}

DATA ACTUAL DEL CONTEXTO:
- Local/Sección: "${shop.name}"
${role === 'industrial' ? industrialContext : role === 'marketing' ? marketingContext : `
- Visitas: ${shop.visits || 0}
- Suscriptores: ${shop.subscribers || 0}
- Ofertas: ${shop.offers.map(o => `${o.name} (${o.price})`).join(', ')}
- Misiones Activas: ${campaigns.filter(c => c.status === 'pending').map(c => `${c.message}`).join('; ') || 'Ninguna'}.
`}
            `;

            const response = await generateAriResponse([...history, { role: 'director', text: textToSend }], systemContext);
            const ariMsg: Message = { role: 'ari', text: response, timestamp: new Date() };
            setMessages(prev => [...prev, ariMsg]);
            
            // Hablar respuesta (TTS) automáticamente para el último mensaje
            handlePlayMessage(response, messages.length + 1);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'ari', text: "Lo siento socio, perdí la frecuencia con la antena central. ¿Podés repetir?", timestamp: new Date() }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePlayMessage = (text: string, id: number) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            if (speakingMsgId === id) {
                setSpeakingMsgId(null);
                return;
            }
            setSpeakingMsgId(id);
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'es-AR';
            utterance.rate = 1.1;
            utterance.pitch = 1.2; // Voz un poco más femenina/joven
            utterance.onend = () => setSpeakingMsgId(null);
            window.speechSynthesis.speak(utterance);
        }
    };

    return (
        <div className="fixed bottom-24 right-6 z-[1000]">
            {/* Bubble Button */}
            {!isOpen && (
                <div className="relative group">
                    {/* Cartelito de ayuda - Siempre visible con animación suave */}
                    <div className="absolute bottom-full right-0 mb-4 animate-bounce">
                        <div className={`bg-gradient-to-r ${styles.helpTextBorderGlow} p-[1px] rounded-2xl`}>
                            <div className="bg-black/90 backdrop-blur-md px-4 py-2 rounded-2xl whitespace-nowrap">
                                <span className={`text-[10px] font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r ${styles.helpTextGradient}`}>
                                    ${isIndustrial ? 'Comando B2B Online 🦾' : '¡Estoy para ayudarte! 🦾'}
                                </span>
                            </div>
                        </div>
                        {/* Triangulito del cartelito */}
                        <div className={`w-3 h-3 ${styles.helpTextTriangle} rotate-45 absolute -bottom-1.5 right-6`} />
                    </div>

                    {/* Efecto de anillo pulsante de atención */}
                    <div className={`absolute inset-0 rounded-full ${styles.glowRing} animate-ping`} />
                    <div className={`absolute inset-0 rounded-full ${styles.pulseGlow} animate-pulse scale-125`} />

                    <button 
                        onClick={() => { setIsOpen(true); playNeonClick(); }}
                        className="w-16 h-16 rounded-full bg-transparent flex items-center justify-center relative z-10 transition-all hover:scale-110 group"
                    >
                        {/* ARI Neon Bubble */}
                        <div className={`absolute inset-0 ${styles.blurBg} rounded-full blur-xl transition-all`}></div>
                        <div className={`w-12 h-12 bg-gradient-to-tr ${styles.bubbleGradient} rounded-full ${styles.bubbleGlow} flex items-center justify-center border-2 ${styles.bubbleBorder}`}>
                            <Sparkles size={24} className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]" />
                        </div>
                        
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center shadow-lg">
                            <span className="text-[8px] font-black text-white">1</span>
                        </div>
                    </button>
                </div>
            )}

            {/* Chat Panel */}
            {isOpen && (
                <div className={`w-[340px] h-[500px] bg-[#050505]/95 backdrop-blur-3xl border border-white/10 rounded-[2rem] ${styles.cardShadow} flex flex-col overflow-hidden animate-in zoom-in-95 fade-in duration-300 relative`}>
                    {/* Background Grid & Glows */}
                    <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] z-0" />
                    <div className={`absolute top-0 right-0 w-32 h-32 ${styles.accentGlow1} rounded-full blur-3xl z-0`} />
                    <div className={`absolute bottom-0 left-0 w-32 h-32 ${styles.accentGlow2} rounded-full blur-3xl z-0`} />

                    {/* Header */}
                    <div className={`p-4 bg-gradient-to-r ${styles.headerGradient} border-b border-white/10 flex items-center justify-between relative z-10 shadow-[0_4px_20px_rgba(0,0,0,0.5)]`}>
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${styles.headerGlow}`}>
                                <Sparkles size={20} className={styles.headerIconColor} />
                            </div>
                            <div>
                                <h3 className="text-[12px] font-black text-white uppercase tracking-widest">
                                    {styles.headerTitle}
                                </h3>
                                <p className={`text-[8px] ${styles.headerStatusText} font-bold uppercase tracking-widest flex items-center gap-1`}>
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> 
                                    {styles.headerSubtitle}
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={() => { setIsOpen(false); playNeonClick(); window.speechSynthesis.cancel(); }}
                            className="p-2 hover:bg-white/5 rounded-xl transition-colors text-white/40 hover:text-white"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Bitácora de Marketing (Misiones Programadas) */}
                    <div className="bg-white/[0.03] border-b border-white/5 relative z-10">
                        <button 
                            onClick={() => setShowCampaigns(!showCampaigns)}
                            className="w-full px-4 py-2 flex items-center justify-between hover:bg-white/5 transition-all"
                        >
                            <div className="flex items-center gap-2">
                                <Calendar size={14} className="text-violet-400" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-white/70">Misiones Programadas</span>
                                {campaigns.filter(c => c.status === 'pending').length > 0 && (
                                    <span className="w-4 h-4 rounded-full bg-violet-600 text-[8px] font-black flex items-center justify-center text-white">
                                        {campaigns.filter(c => c.status === 'pending').length}
                                    </span>
                                )}
                            </div>
                            {showCampaigns ? <ChevronUp size={14} className="text-white/40" /> : <ChevronDown size={14} className="text-white/40" />}
                        </button>

                        {showCampaigns && (
                            <div className="max-h-[150px] overflow-y-auto p-3 space-y-2 no-scrollbar animate-in slide-in-from-top-2 duration-300">
                                {campaigns.length === 0 ? (
                                    <p className="text-[9px] text-white/20 text-center py-2 italic">No hay misiones agendadas todavía, Jefe.</p>
                                ) : (
                                    campaigns.map(camp => (
                                        <div key={camp.id} className="bg-black/40 border border-white/5 rounded-xl p-2.5 flex items-start gap-3 group">
                                            <div className={`mt-1 w-2 h-2 rounded-full ${camp.status === 'pending' ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`} />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-[8px] font-black text-white/40 uppercase tracking-tighter flex items-center gap-1">
                                                        <Clock size={8} /> {new Date(camp.scheduledDate).toLocaleDateString()}
                                                    </span>
                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {camp.status === 'pending' && (
                                                            <button onClick={() => actualizarEstadoCampania(camp.id, 'executed')} className="text-green-500 hover:text-green-400">
                                                                <CheckCircle2 size={12} />
                                                            </button>
                                                        )}
                                                        <button onClick={() => actualizarEstadoCampania(camp.id, 'cancelled')} className="text-red-500/60 hover:text-red-400">
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <p className="text-[9px] text-white/80 leading-tight truncate">{camp.message}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    {/* Messages Body */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar relative z-10">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-3.5 rounded-[1.25rem] text-[11px] leading-relaxed shadow-lg border backdrop-blur-md transition-all ${
                                    msg.role === 'user' 
                                    ? styles.userMsgBg + ' text-white rounded-tr-sm' 
                                    : 'bg-white/5 border-white/10 text-white/90 rounded-tl-sm shadow-[0_4px_15px_rgba(0,0,0,0.2)]'
                                }`}>
                                    {msg.text}
                                    {msg.role === 'ari' && msg.text.includes('JEFE, ¿QUIERE que agende esta misión'.toUpperCase()) && (
                                        <div className="mt-3 p-2 bg-white/10 rounded-xl border border-white/20 animate-pulse">
                                            <button 
                                                onClick={() => {
                                                    playNeonClick();
                                                    // Lógica simple de extracción de fecha y mensaje (esto es una demo, en prod usaríamos un tool call de Gemini)
                                                    const dateMatch = msg.text.match(/(\d{1,2})\s+de\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)/i);
                                                    const day = dateMatch ? dateMatch[1] : '12';
                                                    const monthStr = dateMatch ? dateMatch[2].toLowerCase() : 'julio';
                                                    const months: any = { enero:0, febrero:1, marzo:2, abril:3, mayo:4, junio:5, julio:6, agosto:7, septiembre:8, octubre:9, noviembre:10, diciembre:11 };
                                                    const date = new Date(2026, months[monthStr] || 6, parseInt(day));
                                                    
                                                    guardarCampaniaMarketing({
                                                        shopId: shop.id,
                                                        message: msg.text.split('\n')[0].substring(0, 100) + '...',
                                                        scheduledDate: date.toISOString(),
                                                        status: 'pending',
                                                        audience: 'all'
                                                    });
                                                    setMessages(prev => [...prev, { role: 'ari', text: `✅ ¡MISIÓN RECIBIDA! Archivo guardado en las celdas de cristal para el ${day} de ${monthStr}. Los ratoncitos ya tienen el reloj sincronizado.`, timestamp: new Date() }]);
                                                }}
                                                className="w-full py-2 bg-gradient-to-r from-violet-600 to-cyan-600 text-white text-[9px] font-black uppercase tracking-widest rounded-lg shadow-lg hover:scale-105 transition-all"
                                            >
                                                Confirmar Misión
                                            </button>
                                        </div>
                                    )}
                                    <div className="text-[7px] mt-2 opacity-40 uppercase font-black tracking-widest flex justify-between items-center">
                                        <span>{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    {msg.role === 'ari' && (
                                        <button 
                                            onClick={() => handlePlayMessage(msg.text, i)}
                                            className={`mt-2 ${styles.speechBtnColor} transition-colors flex items-center gap-1.5 bg-black/20 hover:bg-black/40 px-2.5 py-1.5 rounded-md w-max`}
                                        >
                                            {speakingMsgId === i ? <Volume2 size={12} className="animate-pulse" /> : <Play size={12} />}
                                            <span className="text-[8px] font-bold uppercase tracking-widest">{speakingMsgId === i ? 'Pausar' : 'Escuchar Voz'}</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white/5 border border-white/10 p-3 rounded-2xl rounded-tl-none">
                                    <div className="flex gap-1">
                                        <div className={`w-1.5 h-1.5 ${styles.loadingDot} rounded-full animate-bounce`}></div>
                                        <div className={`w-1.5 h-1.5 ${styles.loadingDot} rounded-full animate-bounce [animation-delay:0.2s]`}></div>
                                        <div className={`w-1.5 h-1.5 ${styles.loadingDot} rounded-full animate-bounce [animation-delay:0.4s]`}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Action Quick Chips */}
                    <div className="px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar border-t border-white/5 bg-white/[0.02]">
                        {isIndustrial ? (
                            <>
                                <button onClick={() => setInput('¿Cuántas empresas hay registradas en total y activas?')} className="whitespace-nowrap px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-[8px] font-black text-amber-400 uppercase tracking-widest hover:bg-amber-500/20 transition-all flex items-center gap-1.5">
                                    <BarChart3 size={10} /> Total Empresas
                                </button>
                                <button onClick={() => setInput('¿Qué empresas hay por alcance?')} className="whitespace-nowrap px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-[8px] font-black text-yellow-400 uppercase tracking-widest hover:bg-yellow-500/20 transition-all flex items-center gap-1.5">
                                    <Globe size={10} /> Alcance B2B
                                </button>
                                <button onClick={() => setInput('Recomendame proveedores de alimentos')} className="whitespace-nowrap px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-[8px] font-black text-amber-400 uppercase tracking-widest hover:bg-amber-500/20 transition-all flex items-center gap-1.5">
                                    <Sparkles size={10} /> Proveedores
                                </button>
                            </>
                        ) : isMarketing ? (
                            <>
                                <button onClick={() => setInput('Redactame un copy para WhatsApp para captar nuevos comercios con la Landing Unirse')} className="whitespace-nowrap px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[8px] font-black text-emerald-400 uppercase tracking-widest hover:bg-emerald-500/20 transition-all flex items-center gap-1.5">
                                    <Megaphone size={10} /> Copy B2B
                                </button>
                                <button onClick={() => setInput('Armame una campaña para el fin de semana con las Ofertas VIP para clientes')} className="whitespace-nowrap px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-[8px] font-black text-cyan-400 uppercase tracking-widest hover:bg-cyan-500/20 transition-all flex items-center gap-1.5">
                                    <Sparkles size={10} /> Campaña B2C
                                </button>
                                <button onClick={() => setInput('Quiero captar Embajadores, redactame el texto para el formulario de Reclutamiento')} className="whitespace-nowrap px-3 py-1.5 bg-violet-500/10 border border-violet-500/20 rounded-full text-[8px] font-black text-violet-400 uppercase tracking-widest hover:bg-violet-500/20 transition-all flex items-center gap-1.5">
                                    <Bot size={10} /> Reclutar
                                </button>
                                <button onClick={() => setInput('¿Cuántas campañas tengo activas y qué landing conviene disparar primero?')} className="whitespace-nowrap px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[8px] font-black text-emerald-400 uppercase tracking-widest hover:bg-emerald-500/20 transition-all flex items-center gap-1.5">
                                    <BarChart3 size={10} /> Estado
                                </button>
                            </>
                        ) : (
                            <>
                                <button onClick={() => setInput('¿Cuántas visitas tuve hoy?')} className="whitespace-nowrap px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-[8px] font-black text-cyan-400 uppercase tracking-widest hover:bg-cyan-500/20 transition-all flex items-center gap-1.5">
                                    <BarChart3 size={10} /> Visitas
                                </button>
                                <button onClick={() => setInput('Crear campaña de WhatsApp')} className="whitespace-nowrap px-3 py-1.5 bg-violet-500/10 border border-violet-500/20 rounded-full text-[8px] font-black text-violet-400 uppercase tracking-widest hover:bg-violet-500/20 transition-all flex items-center gap-1.5">
                                    <Megaphone size={10} /> Campaña
                                </button>
                                <button onClick={() => setInput('Sugerencias para vender más')} className="whitespace-nowrap px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-[8px] font-black text-amber-400 uppercase tracking-widest hover:bg-amber-500/20 transition-all flex items-center gap-1.5">
                                    <Sparkles size={10} /> Consejos
                                </button>
                            </>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-black/40 backdrop-blur-xl border-t border-white/10 relative z-10">
                        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl p-1 px-3 shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)]">
                            <input 
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Comandá a Ari..."
                                className="flex-1 bg-transparent border-none text-white text-[11px] py-3 focus:outline-none placeholder:text-white/30 font-medium tracking-wide"
                            />
                            <button 
                                onClick={handleToggleMic}
                                className={`p-2.5 rounded-xl transition-all ${isListening ? 'bg-red-500 text-white animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'text-white/40 hover:text-white hover:bg-white/10'}`}
                            >
                                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                            </button>
                            <button 
                                onClick={() => handleSend()}
                                disabled={!input.trim() || isLoading}
                                className={`p-2.5 bg-gradient-to-r ${styles.sendBtn} text-black rounded-xl hover:scale-105 transition-all disabled:opacity-30 disabled:grayscale disabled:hover:scale-100`}
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
