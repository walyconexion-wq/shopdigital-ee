// ==========================================
// 💬 AriFullChat — Chat ARI Pantalla Completa
// Sistema de mensajería interna ShopDigital
// Estilo WhatsApp · Autenticado por userId
// Módulo 1 — Director: Waly | Ingeniería: Luz
// ==========================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Send, ArrowLeft, Smartphone, Bell, BellOff,
    MessageCircle, Play, Volume2, Download, Link,
    Gift, Zap, X
} from 'lucide-react';
import { useAriInternalChat } from '../hooks/useAriInternalChat';
import { InstallBanner } from './InstallBanner';
import { InternalMessage } from '../services/pushEngine';
import { generateAriResponse } from '../services/gemini';
import { Shop } from '../types';

interface AriFullChatProps {
    /** Usuario autenticado */
    userId: string;
    userName: string;
    /** Si se muestra como modal full-screen o como página */
    asModal?: boolean;
    /** Callback para cerrar si es modal */
    onClose?: () => void;
    /** Datos del comercio para el contexto de ARI */
    shop?: Shop;
    /** Rol para determinar el prompt de ARI */
    ariRole?: 'merchant' | 'home' | 'marketing' | 'subscription';
}

// ─── Mapa de íconos por tipo de mensaje ──────────────────────────────────────
const MessageTypeIcon: Record<string, React.ReactNode> = {
    birthday: <Gift size={12} className="text-pink-500" />,
    offer:    <Zap size={12} className="text-amber-500" />,
    link:     <Link size={12} className="text-cyan-500" />,
    video:    <Play size={12} className="text-violet-500" />,
    welcome:  <Smartphone size={12} className="text-emerald-500" />,
};

// ─── Burbuja individual de mensaje ────────────────────────────────────────────
const MessageBubble: React.FC<{ msg: InternalMessage; onSpeak?: (text: string) => void }> = ({
    msg,
    onSpeak,
}) => {
    const isUser = msg.from === 'user';
    const timestamp = msg.timestamp instanceof Date
        ? msg.timestamp
        : (msg.timestamp as any)?.toDate?.() ?? new Date();

    const formattedTime = timestamp.toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-2 px-3`}>
            {!isUser && (
                <div className="w-7 h-7 rounded-full overflow-hidden mr-2 flex-shrink-0 self-end mb-1
                    border border-violet-200 bg-slate-950">
                    <img src="/ari-avatar.png" alt="ARI" className="w-full h-full object-cover" />
                </div>
            )}
            <div className={`max-w-[78%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
                {/* Indicador de tipo */}
                {msg.type !== 'text' && (
                    <div className={`flex items-center gap-1 mb-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
                        {MessageTypeIcon[msg.type] || null}
                        <span className="text-[8px] uppercase tracking-widest font-black text-slate-400">
                            {msg.type}
                        </span>
                    </div>
                )}

                {/* Cuerpo del mensaje */}
                <div className={`px-3.5 py-2.5 rounded-[1.2rem] shadow-sm text-[12px] leading-relaxed
                    ${isUser
                        ? 'bg-[#2d1e15] text-white rounded-tr-[4px]'
                        : 'bg-white border border-slate-200/80 text-slate-800 rounded-tl-[4px] shadow-sm'
                    }`
                }>
                    {/* Imagen o video */}
                    {msg.mediaUrl && msg.type === 'image' && (
                        <img
                            src={msg.mediaUrl}
                            alt="Imagen adjunta"
                            className="w-full rounded-xl mb-2 max-h-48 object-cover"
                        />
                    )}
                    {msg.mediaUrl && msg.type === 'video' && (
                        <video
                            src={msg.mediaUrl}
                            controls
                            className="w-full rounded-xl mb-2 max-h-48"
                        />
                    )}

                    {/* Texto */}
                    <p className="whitespace-pre-wrap">{msg.content}</p>

                    {/* Link CTA */}
                    {msg.linkUrl && (
                        <a
                            href={msg.linkUrl}
                            className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-xl
                                bg-gradient-to-r from-violet-600 to-cyan-600 text-white
                                text-[9px] font-black uppercase tracking-wider no-underline
                                hover:opacity-90 transition-opacity w-fit"
                        >
                            <Link size={10} />
                            {msg.linkLabel || 'Ver más'}
                        </a>
                    )}
                </div>

                {/* Pie: hora + botón de voz */}
                <div className={`flex items-center gap-2 mt-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <span className="text-[9px] text-slate-400 font-medium">{formattedTime}</span>
                    {!isUser && onSpeak && (
                        <button
                            onClick={() => onSpeak(msg.content)}
                            className="flex items-center gap-1 text-[8px] text-slate-400 hover:text-cyan-600
                                transition-colors border-none bg-transparent cursor-pointer p-0"
                        >
                            <Volume2 size={10} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export const AriFullChat: React.FC<AriFullChatProps> = ({
    userId,
    userName,
    asModal = false,
    onClose,
    shop,
    ariRole = 'home',
}) => {
    const {
        messages,
        unreadCount,
        isLoading,
        markAsRead,
        sendUserMessage,
        isPushSubscribed,
        requestPushSubscription,
    } = useAriInternalChat(userId);

    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [showPushPrompt, setShowPushPrompt] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Al abrir el chat: marcar como leídos + mostrar prompt de push si no tiene
    useEffect(() => {
        markAsRead();
        if (!isPushSubscribed) {
            const timer = setTimeout(() => setShowPushPrompt(true), 2000);
            return () => clearTimeout(timer);
        }
    }, []);

    // Auto-scroll al último mensaje
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const handleSend = useCallback(async () => {
        const text = input.trim();
        if (!text || isTyping) return;

        setInput('');
        setIsTyping(true);

        // 1. Guardar mensaje del usuario
        await sendUserMessage(text);

        try {
            // 2. Generar respuesta de ARI
            const ariResponse = await generateAriResponse(
                text,
                [],          // mensajes previos (en producción: pasar historial)
                ariRole as any,
                shop || {} as Shop,
            );

            // 3. Guardar respuesta de ARI en el chat interno
            const { sendInternalMessage } = await import('../services/pushEngine');
            await sendInternalMessage(userId, {
                from: 'ari',
                type: 'text',
                content: ariResponse,
            });
        } catch (err) {
            console.error('[AriFullChat] Error generando respuesta ARI:', err);
        } finally {
            setIsTyping(false);
        }
    }, [input, isTyping, userId, sendUserMessage, ariRole, shop]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleSpeak = (text: string) => {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-AR';
        utterance.rate = 0.95;
        window.speechSynthesis.speak(utterance);
    };

    // ── Layout ───────────────────────────────────────────────────────────────
    const containerClass = asModal
        ? 'fixed inset-0 z-[9999] flex flex-col bg-[#f5f5f0]'
        : 'flex flex-col h-full bg-[#f5f5f0]';

    return (
        <div className={containerClass} style={{ fontFamily: "'Inter', sans-serif" }}>

            {/* ── BANNER PWA (home variant) ── */}
            <InstallBanner variant="home" />

            {/* ── HEADER tipo WhatsApp ─────────────────────────────────────── */}
            <div className="flex items-center gap-3 px-4 py-3
                bg-gradient-to-r from-[#1a0a2e] to-[#2d1e5a]
                shadow-xl shadow-violet-900/30 flex-shrink-0">

                {/* Botón volver */}
                {(asModal || onClose) && (
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10
                            transition-all border-none bg-transparent cursor-pointer"
                        aria-label="Volver"
                    >
                        <ArrowLeft size={20} />
                    </button>
                )}

                {/* Avatar ARI */}
                <div className="relative">
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-violet-400/50 bg-slate-950">
                        <img src="/ari-avatar.png" alt="ARI" className="w-full h-full object-cover" />
                    </div>
                    {/* Punto verde online */}
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full
                        border-2 border-[#1a0a2e] animate-pulse" />
                </div>

                {/* Info ARI */}
                <div className="flex-1 min-w-0">
                    <h2 className="text-white text-[13px] font-black uppercase tracking-wider">
                        ARI · Asistente Virtual
                    </h2>
                    <p className="text-emerald-400 text-[9px] font-bold uppercase tracking-widest">
                        En línea y lista para guiarte
                    </p>
                </div>

                {/* Botón push */}
                <button
                    onClick={isPushSubscribed ? undefined : requestPushSubscription}
                    title={isPushSubscribed ? 'Notificaciones activadas' : 'Activar notificaciones'}
                    className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10
                        transition-all border-none bg-transparent cursor-pointer"
                >
                    {isPushSubscribed
                        ? <Bell size={18} className="text-emerald-400" />
                        : <BellOff size={18} />
                    }
                </button>
            </div>

            {/* ── PROMPT DE SUSCRIPCIÓN PUSH ───────────────────────────────── */}
            {showPushPrompt && !isPushSubscribed && (
                <div className="mx-3 mt-2 p-3 rounded-2xl bg-gradient-to-r from-violet-100 to-cyan-100
                    border border-violet-200 flex items-center gap-3 animate-in slide-in-from-top duration-300">
                    <Bell size={18} className="text-violet-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-black text-violet-800">
                            ¿Querés recibir ofertas y novedades?
                        </p>
                        <p className="text-[9px] text-violet-600">
                            Activá las notificaciones para que ARI te avise.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => { requestPushSubscription(); setShowPushPrompt(false); }}
                            className="px-3 py-1.5 rounded-xl bg-violet-600 text-white text-[9px]
                                font-black uppercase tracking-wider border-none cursor-pointer
                                hover:bg-violet-700 transition-colors"
                        >
                            Activar
                        </button>
                        <button
                            onClick={() => setShowPushPrompt(false)}
                            className="p-1 border-none bg-transparent text-violet-400 cursor-pointer"
                        >
                            <X size={14} />
                        </button>
                    </div>
                </div>
            )}

            {/* ── CUERPO DE MENSAJES ───────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto py-4 space-y-1"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cpath d='M96 95h4v1h-4v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9zm-1 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9z' fill='%23e8e0f0' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E")`,
                }}
            >
                {isLoading && (
                    <div className="flex justify-center items-center py-8">
                        <div className="flex gap-1.5">
                            {[0, 1, 2].map((i) => (
                                <div key={i}
                                    className="w-2 h-2 rounded-full bg-violet-400 animate-bounce"
                                    style={{ animationDelay: `${i * 0.15}s` }}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {!isLoading && messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                        <div className="w-20 h-20 rounded-full overflow-hidden mb-4 border-4 border-violet-200 shadow-xl">
                            <img src="/ari-avatar.png" alt="ARI" className="w-full h-full object-cover" />
                        </div>
                        <p className="text-[14px] font-black text-slate-700 mb-1">¡Hola, {userName}! 👋</p>
                        <p className="text-[11px] text-slate-500">
                            Soy ARI, tu asistente virtual de ShopDigital. ¡Preguntame lo que quieras!
                        </p>
                        {/* Sugerencia de instalación PWA dentro del chat */}
                        <div className="mt-4 w-full">
                            <InstallBanner variant="ari" />
                        </div>
                    </div>
                )}

                {messages.map((msg, i) => (
                    <MessageBubble key={msg.id || i} msg={msg} onSpeak={handleSpeak} />
                ))}

                {isTyping && (
                    <div className="flex items-end gap-2 px-3 mb-2">
                        <div className="w-7 h-7 rounded-full overflow-hidden border border-violet-200 bg-slate-950">
                            <img src="/ari-avatar.png" alt="ARI" className="w-full h-full object-cover" />
                        </div>
                        <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-[4px] px-4 py-3 shadow-sm">
                            <div className="flex gap-1">
                                {[0, 1, 2].map((i) => (
                                    <div key={i}
                                        className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce"
                                        style={{ animationDelay: `${i * 0.15}s` }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <div ref={chatEndRef} />
            </div>

            {/* ── CHIPS DE ACCESO RÁPIDO ───────────────────────────────────── */}
            <div className="px-3 py-2 flex gap-2 overflow-x-auto no-scrollbar bg-white/80 border-t border-slate-200/60 flex-shrink-0">
                {[
                    { label: '🛍️ Ofertas', msg: 'Mostrami las mejores ofertas del día' },
                    { label: '📋 Mi cuenta', msg: '¿Cómo veo mi información de cuenta?' },
                    { label: '📲 Instalar', msg: '¿Cómo instalo ShopDigital en mi celular?' },
                    { label: '🎯 Beneficios', msg: '¿Qué beneficios tengo como socio?' },
                ].map(({ label, msg }) => (
                    <button
                        key={label}
                        onClick={() => setInput(msg)}
                        className="whitespace-nowrap px-3 py-1.5 rounded-full border border-violet-200
                            bg-violet-50 text-violet-700 text-[9px] font-black uppercase tracking-wider
                            hover:bg-violet-100 transition-all cursor-pointer flex-shrink-0"
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* ── INPUT DE MENSAJE ─────────────────────────────────────────── */}
            <div className="flex items-end gap-2 px-3 py-3 bg-white border-t border-slate-200 flex-shrink-0">
                <textarea
                    ref={inputRef}
                    id="ari-fullchat-input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Comandá a ARI..."
                    rows={1}
                    className="flex-1 resize-none rounded-2xl border border-slate-200 bg-slate-50
                        px-4 py-2.5 text-[12px] text-slate-800 placeholder:text-slate-400
                        focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100
                        transition-all max-h-24 overflow-y-auto"
                    style={{ lineHeight: '1.5' }}
                />
                <button
                    id="ari-fullchat-send-btn"
                    onClick={handleSend}
                    disabled={!input.trim() || isTyping}
                    className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0
                        bg-gradient-to-br from-violet-600 to-cyan-600
                        text-white shadow-lg shadow-violet-500/30
                        hover:scale-105 active:scale-95 transition-all
                        disabled:opacity-50 disabled:cursor-not-allowed
                        border-none cursor-pointer"
                    aria-label="Enviar mensaje"
                >
                    <Send size={16} />
                </button>
            </div>
        </div>
    );
};

export default AriFullChat;
