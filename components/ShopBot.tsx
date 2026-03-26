import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, X } from 'lucide-react';
import { Shop } from '../types';
import { playNeonClick } from '../utils/audio';

interface ShopBotProps {
    allShops: Shop[];
}

interface ChatMessage {
    id: number;
    text: string;
    sender: 'user' | 'bot';
}

const WELCOME_MESSAGE = '¡Hola! 👋 Soy **ShopBot**, tu asistente de ShopDigital. Preguntame lo que necesites:\n\n🔍 Buscá un comercio\n🏷️ Consultá ofertas\n📍 Cómo llegar\n💬 Contactar por WhatsApp\n🎁 Suscribirte a beneficios';

const ShopBot: React.FC<ShopBotProps> = ({ allShops }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: 0, text: WELCOME_MESSAGE, sender: 'bot' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [showTooltip, setShowTooltip] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    // Hide tooltip after 8 seconds
    useEffect(() => {
        const timer = setTimeout(() => setShowTooltip(false), 8000);
        return () => clearTimeout(timer);
    }, []);

    const generateResponse = (userMessage: string): { text: string; action?: () => void } => {
        const msg = userMessage.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        // Greetings
        if (/^(hola|buenas|hey|que tal|buen dia|buenos dias|buenas tardes|buenas noches)/.test(msg)) {
            return { text: '¡Hola! 😄 Soy tu asistente ShopBot. ¿En qué te puedo ayudar hoy?\n\n🔍 Buscá un comercio\n🏷️ "Ofertas" para ver promos\n📍 "Cómo llegar" a un local\n🎁 "Suscribirme" a beneficios' };
        }

        // Search by category keywords
        const categoryMap: { [key: string]: string } = {
            'pizz': 'pizzerias', 'pizza': 'pizzerias', 'pizzeria': 'pizzerias',
            'farmacia': 'farmacias', 'remedio': 'farmacias', 'medicamento': 'farmacias',
            'kiosco': 'kioscos', 'golosin': 'kioscos',
            'carniceria': 'carnicerias', 'carne': 'carnicerias',
            'verduleria': 'verdulerías', 'verdura': 'verdulerías', 'fruta': 'verdulerías',
            'panaderia': 'panaderías', 'pan': 'panaderías', 'facturas': 'panaderías',
            'peluquer': 'peluquerías', 'corte': 'peluquerías',
            'restaurant': 'restaurantes', 'comer': 'restaurantes', 'comida': 'restaurantes',
            'cafeteria': 'cafeterías', 'cafe': 'cafeterías',
            'heladeria': 'heladerías', 'helado': 'heladerías',
            'supermercado': 'supermercados', 'super': 'supermercados',
        };

        for (const [keyword, category] of Object.entries(categoryMap)) {
            if (msg.includes(keyword)) {
                const found = allShops.filter(s => 
                    s.category.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(keyword) ||
                    s.category.toLowerCase().includes(category) ||
                    s.name.toLowerCase().includes(keyword)
                );
                if (found.length > 0) {
                    const list = found.slice(0, 5).map(s => `• **${s.name}** — ${s.zone || 'Esteban Echeverría'}`).join('\n');
                    return { text: `🔍 Encontré **${found.length}** resultado(s):\n\n${list}\n\n¿Querés que te abra alguno? Escribí el nombre.` };
                } else {
                    return { text: `😕 No encontré comercios de "${keyword}" en la zona todavía. ¡Pero estamos creciendo! Probá buscando otra categoría.` };
                }
            }
        }

        // Search by shop name
        const shopMatch = allShops.find(s => msg.includes(s.name.toLowerCase()));
        if (shopMatch) {
            const slug = shopMatch.slug || shopMatch.id;
            const catSlug = shopMatch.category.toLowerCase().replace(/\s+/g, '-');
            return { 
                text: `🏪 **${shopMatch.name}**\n📍 ${shopMatch.address}\n📞 ${shopMatch.phone || 'Sin teléfono'}\n⭐ Rating: ${shopMatch.rating}/5\n\n¿Qué querés hacer?\n• Escribí "ir" para ver su catálogo\n• Escribí "whatsapp" para contactarlo`,
                action: () => navigate(`/${catSlug}/${slug}`)
            };
        }

        // Offers / Discounts
        if (msg.includes('oferta') || msg.includes('descuento') || msg.includes('promo') || msg.includes('precio')) {
            const shopsWithOffers = allShops.filter(s => s.offers && s.offers.length > 0);
            if (shopsWithOffers.length > 0) {
                const list = shopsWithOffers.slice(0, 4).map(s => {
                    const bestOffer = s.offers[0];
                    return `• **${s.name}**: ${bestOffer.name} — $${bestOffer.price.toLocaleString('es-AR')}`;
                }).join('\n');
                return { text: `🏷️ ¡Hay promos activas!\n\n${list}\n\nEscribí el nombre del comercio para ver todas sus ofertas.` };
            }
            return { text: '🏷️ No hay ofertas en este momento 😕. ¡Pero revisá más tarde, se suben constantemente!' };
        }

        // Navigation / Maps
        if (msg.includes('como llego') || msg.includes('mapa') || msg.includes('ubicacion') || msg.includes('direccion') || msg.includes('donde queda')) {
            return { text: '📍 ¿A qué comercio querés llegar? Escribí el nombre y te abro el mapa al instante.' };
        }

        // WhatsApp / Contact
        if (msg.includes('whatsapp') || msg.includes('contacto') || msg.includes('hablar') || msg.includes('llamar') || msg.includes('telefono')) {
            return { text: '💬 ¿Con qué comercio querés comunicarte? Escribí el nombre y te paso el WhatsApp directo.' };
        }

        // Subscription / Benefits
        if (msg.includes('suscrib') || msg.includes('beneficio') || msg.includes('vip') || msg.includes('puntos') || msg.includes('credencial')) {
            return { text: '🎁 ¡Excelente! Con ShopDigital tenés acceso a ofertas VIP y puntos acumulables.\n\nPodés suscribirte desde la página de cualquier comercio tocando **"Obtener Ofertas VIP"**.\n\n¿Necesitás algo más?' };
        }

        // Help
        if (msg.includes('ayuda') || msg.includes('que podes') || msg.includes('que sabes') || msg.includes('funciones')) {
            return { text: '🤖 ¡Puedo ayudarte con:\n\n🔍 **Buscar** comercios por categoría o nombre\n🏷️ Ver **ofertas** y precios\n📍 **Cómo llegar** a un local\n💬 Contactar por **WhatsApp**\n🎁 Info sobre **suscripciones** y beneficios\n\n¡Preguntame lo que quieras!' };
        }

        // Gratitude
        if (msg.includes('gracia') || msg.includes('genial') || msg.includes('excelente') || msg.includes('perfecto')) {
            return { text: '😊 ¡De nada! Estoy para ayudarte. Si necesitás algo más, acá me quedo. ¡Que disfrutes ShopDigital! 🚀' };
        }

        // Default / not understood
        return { text: `🤔 No entendí bien tu consulta. Probá con:\n\n• El nombre de una categoría (*"pizzerías"*, *"farmacias"*)\n• *"ofertas"* para ver promos\n• *"ayuda"* para ver todo lo que puedo hacer\n\n¡Estoy para asistirte! 😄` };
    };

    const handleSend = () => {
        const trimmed = input.trim();
        if (!trimmed) return;
        playNeonClick();

        const userMsg: ChatMessage = { id: Date.now(), text: trimmed, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        setTimeout(() => {
            const response = generateResponse(trimmed);
            const botMsg: ChatMessage = { id: Date.now() + 1, text: response.text, sender: 'bot' };
            setMessages(prev => [...prev, botMsg]);
            setIsTyping(false);
        }, 800 + Math.random() * 600);
    };

    const formatMessage = (text: string) => {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br/>');
    };

    return (
        <>
            {/* Floating Bubble */}
            {!isOpen && (
                <div className="fixed bottom-24 right-4 z-[9999] flex items-end gap-2">
                    {/* Tooltip Speech Bubble */}
                    {showTooltip && (
                        <div className="animate-in fade-in slide-in-from-right duration-500 bg-cyan-950/80 backdrop-blur-md border border-cyan-400/40 rounded-2xl rounded-br-sm px-4 py-2.5 shadow-[0_0_20px_rgba(34,211,238,0.2)] max-w-[180px]">
                            <p className="text-[9.5px] font-bold text-cyan-300 leading-snug">
                                ¿Necesitás saber algo? 🤖 ¡Preguntame!
                            </p>
                        </div>
                    )}

                    <button
                        onClick={() => {
                            playNeonClick();
                            setIsOpen(true);
                            setShowTooltip(false);
                        }}
                        className="w-16 h-16 rounded-full overflow-hidden border-2 border-cyan-400 shadow-[0_0_25px_rgba(34,211,238,0.5)] animate-bounce hover:scale-110 active:scale-95 transition-all bg-black/80 p-1"
                    >
                        <img src="/shopbot-avatar.png" alt="ShopBot" className="w-full h-full object-cover rounded-full" />
                    </button>
                </div>
            )}

            {/* Chat Panel */}
            {isOpen && (
                <div className="fixed bottom-4 right-4 left-4 z-[9999] max-w-md mx-auto animate-in fade-in slide-in-from-bottom-5 duration-300">
                    <div className="bg-black/90 backdrop-blur-xl border border-cyan-400/40 rounded-[2rem] shadow-[0_0_40px_rgba(34,211,238,0.2)] flex flex-col overflow-hidden" style={{ maxHeight: '70vh' }}>
                        
                        {/* Header */}
                        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-cyan-500/20 bg-cyan-950/30">
                            <div className="w-9 h-9 rounded-full overflow-hidden border border-cyan-400/60 shadow-[0_0_10px_rgba(34,211,238,0.4)] bg-black p-0.5 flex-shrink-0">
                                <img src="/shopbot-avatar.png" alt="ShopBot" className="w-full h-full object-cover rounded-full" />
                            </div>
                            <div className="flex-grow">
                                <h3 className="text-[11px] font-black text-white uppercase tracking-widest">ShopBot</h3>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.8)] animate-pulse" />
                                    <span className="text-[8px] text-green-400 font-bold uppercase tracking-widest">En línea</span>
                                </div>
                            </div>
                            <button onClick={() => { playNeonClick(); setIsOpen(false); }} className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 active:scale-90 transition-all">
                                <X size={14} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-grow overflow-y-auto no-scrollbar px-4 py-4 flex flex-col gap-3" style={{ maxHeight: '50vh' }}>
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {msg.sender === 'bot' && (
                                        <div className="w-6 h-6 rounded-full overflow-hidden border border-cyan-400/40 flex-shrink-0 mr-2 mt-1 bg-black p-0.5">
                                            <img src="/shopbot-avatar.png" alt="Bot" className="w-full h-full object-cover rounded-full" />
                                        </div>
                                    )}
                                    <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-[10px] leading-relaxed ${
                                        msg.sender === 'user'
                                            ? 'bg-cyan-500/30 border border-cyan-400/40 text-white rounded-br-sm'
                                            : 'bg-white/5 border border-white/10 text-white/90 rounded-bl-sm'
                                    }`}
                                        dangerouslySetInnerHTML={{ __html: formatMessage(msg.text) }}
                                    />
                                </div>
                            ))}

                            {/* Typing indicator */}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="w-6 h-6 rounded-full overflow-hidden border border-cyan-400/40 flex-shrink-0 mr-2 mt-1 bg-black p-0.5">
                                        <img src="/shopbot-avatar.png" alt="Bot" className="w-full h-full object-cover rounded-full" />
                                    </div>
                                    <div className="bg-white/5 border border-white/10 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="px-4 py-3 border-t border-cyan-500/20 bg-cyan-950/20">
                            <div className="flex items-center gap-2">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Preguntale al ShopBot..."
                                    className="flex-grow bg-white/5 border border-white/10 rounded-full px-4 py-2.5 text-[10px] text-white placeholder-white/30 outline-none focus:border-cyan-400/50 transition-colors"
                                />
                                <button
                                    onClick={handleSend}
                                    className="w-10 h-10 rounded-full bg-cyan-500/30 border border-cyan-400/50 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.3)] active:scale-90 active:bg-cyan-500 active:text-black transition-all"
                                >
                                    <Send size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ShopBot;
