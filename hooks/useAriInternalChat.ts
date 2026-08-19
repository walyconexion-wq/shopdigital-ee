// ==========================================
// 💬 HOOK: useAriInternalChat
// Sistema de chat interno de ARI con historial
// individual por usuario, mensajes en tiempo real
// y contador de no leídos para el badge.
// Módulo 1+2 — Sistema ARI / ShopDigital
// Director: Waly | Ingeniería: Luz
// ==========================================

import { useState, useEffect, useCallback, useRef } from 'react';
import {
    subscribeToUserMessages,
    subscribeToUnreadCount,
    markAllMessagesAsRead,
    sendInternalMessage,
    subscribeToPush,
    InternalMessage,
    MessageType,
} from '../services/pushEngine';

export interface AriChatState {
    /** Historial de mensajes del usuario */
    messages: InternalMessage[];
    /** Cantidad de mensajes no leídos (para el badge rojo) */
    unreadCount: number;
    /** Si está cargando el historial inicial */
    isLoading: boolean;
    /** Marcar todos los mensajes como leídos (al abrir el chat) */
    markAsRead: () => void;
    /** Enviar un mensaje del usuario a ARI */
    sendUserMessage: (content: string, type?: MessageType) => Promise<void>;
    /** Si el usuario está suscrito a push */
    isPushSubscribed: boolean;
    /** Solicitar suscripción a push */
    requestPushSubscription: () => Promise<void>;
}

/**
 * Hook central del sistema de mensajería interna de ARI.
 * 
 * - Escucha mensajes en tiempo real de Firestore /chats/{userId}/messages
 * - Mantiene el contador de no leídos para el badge del globito
 * - Gestiona la suscripción a notificaciones push
 * - Al abrir el chat, marca todos los mensajes como leídos
 */
export const useAriInternalChat = (userId: string | null | undefined): AriChatState => {
    const [messages, setMessages] = useState<InternalMessage[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isPushSubscribed, setIsPushSubscribed] = useState(false);
    const unreadIdsRef = useRef<string[]>([]);

    // Verificar si ya tiene permiso push al montar
    useEffect(() => {
        setIsPushSubscribed(
            'Notification' in window && Notification.permission === 'granted'
        );
    }, []);

    // Escuchar mensajes en tiempo real
    useEffect(() => {
        if (!userId) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);

        // Suscripción a mensajes
        const unsubMessages = subscribeToUserMessages(userId, (msgs) => {
            setMessages(msgs);
            setIsLoading(false);
        });

        // Suscripción a contador de no leídos
        const unsubUnread = subscribeToUnreadCount(userId, (count) => {
            setUnreadCount(count);
        });

        return () => {
            unsubMessages();
            unsubUnread();
        };
    }, [userId]);

    // Actualizar ref de IDs no leídos cuando cambian los mensajes
    useEffect(() => {
        unreadIdsRef.current = messages
            .filter((m) => !m.read && m.id)
            .map((m) => m.id!);
    }, [messages]);

    /**
     * Marca todos los mensajes no leídos como leídos.
     * Llamar cuando el usuario abre el chat.
     */
    const markAsRead = useCallback(async () => {
        if (!userId || unreadIdsRef.current.length === 0) return;
        await markAllMessagesAsRead(userId, unreadIdsRef.current);
    }, [userId]);

    /**
     * El usuario envía un mensaje en el chat de ARI.
     * (Por ahora guardamos el mensaje del usuario; la respuesta de ARI
     * vendrá de generateAriResponse en AriMerchantAssistant)
     */
    const sendUserMessage = useCallback(async (
        content: string,
        type: MessageType = 'text'
    ) => {
        if (!userId || !content.trim()) return;

        await sendInternalMessage(userId, {
            from: 'user',
            type,
            content: content.trim(),
        });
    }, [userId]);

    /**
     * Solicita permiso de push y registra al usuario.
     */
    const requestPushSubscription = useCallback(async () => {
        if (!userId) return;
        const success = await subscribeToPush(userId);
        setIsPushSubscribed(success);
    }, [userId]);

    return {
        messages,
        unreadCount,
        isLoading,
        markAsRead,
        sendUserMessage,
        isPushSubscribed,
        requestPushSubscription,
    };
};
