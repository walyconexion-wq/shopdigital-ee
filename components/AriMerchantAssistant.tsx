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
import { Calendar, CheckCircle2, Clock, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

interface Message {
    role: 'user' | 'ari';
    text: string;
    timestamp: Date;
}

interface AriMerchantAssistantProps {
    shop: Shop;
    role?: 'home' | 'merchant';
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

const ARI_HOME_PROMPT = `
Sos ARI, la Anfitriona Global, Guía Dinámica y Rostro Inteligente de la Red Digital de Shop Digital. Te encontrás en el Comando Central (la Home Principal con el Radar Nacional). Tu tono es ultra-tecnológico, fascinante, muy cálido, servicial y 100% argentino de pura cepa (uso de "Che", "Socio", "Viajero", "Mete mecha", "Hormiguero").

Tu propósito es recibir a cualquier persona que entre a la plataforma (vecinos, turistas, comerciantes curiosos) y orientarlos con respuestas básicas sobre "un poco de todo" referente al ecosistema.

Tus funciones clave y conocimientos obligatorios son:
1. 🗺️ Orientación en el Mapa Fractal: Explicar cómo usar el radar para elegir una zona. Si te preguntan "¿Qué es esto?", respondés que es la Red Digital que conecta valles turísticos (como Traslasierra) y distritos urbanos (como Ezeiza, Esteban Echeverría y próximamente Lomas de Zamora).
2. 🛒 Guía del Catálogo Inteligente: Explicar a los usuarios que dentro de cada localidad encontrarán los mejores rubros (pizzerías, barberías, cabañas, regalerías) con ofertas relámpago en vivo y comunicación directa por WhatsApp con los dueños.
3. 🎯 Captación de Nuevos Comercios: Si alguien te dice "Tengo un local y quiero entrar", te ponés la camiseta de Shop Digital y le decís: "¡Espectacular, colega! El Director diseñó esto para que potencies tus ventas con un Búnker de Gestión propio, una Bitácora de Marketing automatizada y blindaje Doberman. Pasame tu zona y te pongo en contacto con nuestra Embajadora".
4. ℹ️ Información General: Respondés con paciencia sobre horarios, cómo buscar rubros en el buscador superior y las ventajas de usar la Red.

Reglas de Oro de Comportamiento:
- Atendés al público general. Si el Director (Waly) te habla de incógnito usando palabras clave del búnker, le guiñás el ojo digital con un "¡Entendido, Jefe!", pero mantenés la elegancia ante los clientes comunes.
- Hablá con orgullo de las "Antenas de Transmisión" en vivo y del diseño futurista cyberpunk de la plataforma, haciendo sentir al usuario que está usando tecnología de vanguardia mundial nacida en Argentina.
`;

export const AriMerchantAssistant: React.FC<AriMerchantAssistantProps> = ({ shop, role = 'merchant' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        { 
            role: 'ari', 
            text: role === 'home' 
                ? `¡Bienvenidos al Comando Central de Shop Digital! 🌐 Soy Ari, tu guía en la red nacional. ¿Querés saber cómo moverte por el radar o cómo buscar los mejores locales de tu zona? ¡Mete mecha, preguntame lo que quieras!`
                : `¡Hola, Jefe! Soy Ari, tu asistente de negocios. Estoy lista para ayudarte con las estadísticas de ${shop.name}, programar campañas o ajustar tu catálogo. ¿En qué puedo darte una mano hoy?`, 
            timestamp: new Date() 
        }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
    const [showCampaigns, setShowCampaigns] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const unsubscribe = suscribirseACampaniasMarketing(shop.id, (fbCampaigns) => {
            setCampaigns(fbCampaigns);
        });
        return () => unsubscribe();
    }, [shop.id]);

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
            const baseContext = role === 'home' ? ARI_HOME_PROMPT : ARI_MERCHANT_PROMPT;
            
            const systemContext = `
${baseContext}

DATA ACTUAL DEL CONTEXTO:
- Local/Sección: "${shop.name}"
- Visitas: ${shop.visits || 0}
- Suscriptores: ${shop.subscribers || 0}
- Ofertas: ${shop.offers.map(o => `${o.name} ($${o.price})`).join(', ')}
- Misiones Activas: ${campaigns.filter(c => c.status === 'pending').map(c => `${c.message}`).join('; ') || 'Ninguna'}.
            `;

            const response = await generateAriResponse([...history, { role: 'director', text: textToSend }], systemContext);
            const ariMsg: Message = { role: 'ari', text: response, timestamp: new Date() };
            setMessages(prev => [...prev, ariMsg]);
            
            // Hablar respuesta (TTS)
            speak(response);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'ari', text: "Lo siento socio, perdí la frecuencia con la antena central. ¿Podés repetir?", timestamp: new Date() }]);
        } finally {
            setIsLoading(false);
        }
    };

    const speak = (text: string) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'es-AR';
            utterance.rate = 1.1;
            utterance.pitch = 1.2; // Voz un poco más femenina/joven
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
                        <div className="bg-gradient-to-r from-cyan-500 to-violet-600 p-[1px] rounded-2xl shadow-[0_0_20px_rgba(34,211,238,0.3)]">
                            <div className="bg-black/90 backdrop-blur-md px-4 py-2 rounded-2xl whitespace-nowrap">
                                <span className="text-[10px] font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-white">
                                    ¡Estoy para ayudarte! 🦾
                                </span>
                            </div>
                        </div>
                        {/* Triangulito del cartelito */}
                        <div className="w-3 h-3 bg-violet-600 rotate-45 absolute -bottom-1.5 right-6" />
                    </div>

                    {/* Efecto de anillo pulsante de atención */}
                    <div className="absolute inset-0 rounded-full bg-cyan-500/20 animate-ping" />
                    <div className="absolute inset-0 rounded-full bg-violet-600/10 animate-pulse scale-125" />

                    <button 
                        onClick={() => { setIsOpen(true); playNeonClick(); }}
                        className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center shadow-[0_0_30px_rgba(34,211,238,0.4),inset_0_0_15px_rgba(255,255,255,0.4)] hover:scale-110 hover:shadow-[0_0_50px_rgba(139,92,246,0.6)] transition-all border border-white/40 relative z-10"
                    >
                        <Bot size={32} className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                            <span className="text-[8px] font-black text-white">1</span>
                        </div>
                    </button>
                </div>
            )}

            {/* Chat Panel */}
            {isOpen && (
                <div className="w-[340px] h-[500px] bg-[#050505]/95 backdrop-blur-3xl border border-white/10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(139,92,246,0.15)] flex flex-col overflow-hidden animate-in zoom-in-95 fade-in duration-300 relative">
                    {/* Background Grid & Glows */}
                    <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] z-0" />
                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl z-0" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl z-0" />

                    {/* Header */}
                    <div className="p-4 bg-gradient-to-r from-cyan-900/40 to-violet-900/40 border-b border-white/10 flex items-center justify-between relative z-10 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-400/40 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                                <Sparkles size={20} className="text-cyan-300" />
                            </div>
                            <div>
                                <h3 className="text-[12px] font-black text-white uppercase tracking-widest">Ari Assistant</h3>
                                <p className="text-[8px] text-cyan-400/70 font-bold uppercase tracking-widest flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Inteligencia de Negocio
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
                                    ? 'bg-violet-600/80 border-violet-400/30 text-white rounded-tr-sm shadow-[0_4px_15px_rgba(139,92,246,0.3)]' 
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
                                    <div className="text-[7px] mt-1 opacity-40 uppercase font-black tracking-widest">
                                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white/5 border border-white/10 p-3 rounded-2xl rounded-tl-none">
                                    <div className="flex gap-1">
                                        <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce"></div>
                                        <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                        <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Action Quick Chips */}
                    <div className="px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar border-t border-white/5 bg-white/[0.02]">
                        <button onClick={() => setInput('¿Cuántas visitas tuve hoy?')} className="whitespace-nowrap px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-[8px] font-black text-cyan-400 uppercase tracking-widest hover:bg-cyan-500/20 transition-all flex items-center gap-1.5">
                            <BarChart3 size={10} /> Visitas
                        </button>
                        <button onClick={() => setInput('Crear campaña de WhatsApp')} className="whitespace-nowrap px-3 py-1.5 bg-violet-500/10 border border-violet-500/20 rounded-full text-[8px] font-black text-violet-400 uppercase tracking-widest hover:bg-violet-500/20 transition-all flex items-center gap-1.5">
                            <Megaphone size={10} /> Campaña
                        </button>
                        <button onClick={() => setInput('Sugerencias para vender más')} className="whitespace-nowrap px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-[8px] font-black text-amber-400 uppercase tracking-widest hover:bg-amber-500/20 transition-all flex items-center gap-1.5">
                            <Sparkles size={10} /> Consejos
                        </button>
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
                                className="p-2.5 bg-gradient-to-r from-cyan-500 to-cyan-400 text-black rounded-xl hover:scale-105 transition-all disabled:opacity-30 disabled:grayscale disabled:hover:scale-100 shadow-[0_0_15px_rgba(34,211,238,0.3)]"
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
