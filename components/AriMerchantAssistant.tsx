import React, { useState, useEffect, useRef } from 'react';
import { 
    MessageSquare, Mic, MicOff, Send, X, 
    Sparkles, BarChart3, Megaphone, Settings,
    Play, Pause, Volume2, Bot
} from 'lucide-react';
import { generateAriResponse } from '../services/gemini';
import { Shop } from '../types';
import { playNeonClick } from '../utils/audio';

interface Message {
    role: 'user' | 'ari';
    text: string;
    timestamp: Date;
}

interface AriMerchantAssistantProps {
    shop: Shop;
}

export const AriMerchantAssistant: React.FC<AriMerchantAssistantProps> = ({ shop }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        { 
            role: 'ari', 
            text: `¡Hola, Jefe! Soy Ari, tu asistente de negocios. Estoy lista para ayudarte con las estadísticas de ${shop.name}, programar campañas o ajustar tu catálogo. ¿En qué puedo darte una mano hoy?`, 
            timestamp: new Date() 
        }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

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
            
            // Contexto específico del Comercio
            const systemContext = `
                ACTÚAS COMO: ARI, la asistente de inteligencia comercial para el COMERCIANTE.
                COMERCIO: "${shop.name}".
                DATA: ${shop.visits || 0} visitas, ${shop.subscribers || 0} suscriptores.
                OFERTAS: ${shop.offers.map(o => `${o.name} ($${o.price})`).join(', ')}.
                
                IMPORTANTE: Tu trato es con el COMERCIANTE (Jefe/Socio). 
                Tu misión es analizar su negocio y proponer campañas de WhatsApp. 
                Si te piden algo para el 12 de julio, diles que ya tomaste nota y que lo agendarás en la Bitácora de Marketing.
            `;

            const response = await generateAriResponse([...history, { role: 'director', text: textToSend }], systemContext);
            const ariMsg: Message = { role: 'ari', text: response, timestamp: new Date() };
            setMessages(prev => [...prev, ariMsg]);
            
            // Hablar respuesta (TTS)
            speak(response);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'ari', text: "Lo siento Jefe, perdí conexión con el búnker central. ¿Podés repetir?", timestamp: new Date() }]);
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
