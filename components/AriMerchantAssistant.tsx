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
                <button 
                    onClick={() => { setIsOpen(true); playNeonClick(); }}
                    className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center shadow-[0_0_30px_rgba(34,211,238,0.4)] hover:scale-110 transition-all border-2 border-white/20 relative group"
                >
                    <Bot size={32} className="text-white" />
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center animate-bounce">
                        <span className="text-[8px] font-black text-white">1</span>
                    </div>
                    {/* Tooltip */}
                    <div className="absolute right-20 top-1/2 -translate-y-1/2 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">Consultar a Ari</span>
                    </div>
                </button>
            )}

            {/* Chat Panel */}
            {isOpen && (
                <div className="w-[340px] h-[500px] bg-black/90 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden animate-in zoom-in-95 fade-in duration-300">
                    {/* Header */}
                    <div className="p-4 bg-gradient-to-r from-cyan-900/20 to-violet-900/20 border-b border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
                                <Sparkles size={20} className="text-cyan-400" />
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
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-3 rounded-2xl text-[11px] leading-relaxed ${
                                    msg.role === 'user' 
                                    ? 'bg-violet-600 text-white rounded-tr-none' 
                                    : 'bg-white/5 border border-white/10 text-white/90 rounded-tl-none'
                                } shadow-lg`}>
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
                    <div className="p-4 bg-black border-t border-white/5">
                        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl p-1 px-3">
                            <input 
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Hablá con Ari..."
                                className="flex-1 bg-transparent border-none text-white text-[11px] py-2.5 focus:outline-none placeholder:text-white/20"
                            />
                            <button 
                                onClick={handleToggleMic}
                                className={`p-2 rounded-xl transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                            >
                                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                            </button>
                            <button 
                                onClick={() => handleSend()}
                                disabled={!input.trim() || isLoading}
                                className="p-2 bg-cyan-500 text-black rounded-xl hover:bg-cyan-400 transition-all disabled:opacity-30 disabled:grayscale"
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
