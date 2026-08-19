// ==========================================
// 📡 MOTOR DE PUSH MARKETING — pushEngine.ts
// Sistema de notificaciones push para campañas internas
// reemplaza WhatsApp API — Costo: $0
// Director: Waly | Ingeniería: Luz
// ==========================================

import { db } from '../firebase';
import {
    collection, addDoc, onSnapshot, query,
    where, orderBy, Timestamp, doc, updateDoc
} from 'firebase/firestore';

// ─── TIPOS ───────────────────────────────────────────────────────────────────

export type MessageType = 'text' | 'video' | 'image' | 'link' | 'offer' | 'birthday' | 'welcome';
export type MessageSender = 'ari' | 'agent' | 'luz' | 'waly' | 'bunker';
export type MessageRole = 'user' | 'ari';

export interface InternalMessage {
    id?: string;
    from: MessageSender | MessageRole;
    type: MessageType;
    content: string;
    mediaUrl?: string;
    linkUrl?: string;
    linkLabel?: string;
    timestamp: Date | Timestamp;
    read: boolean;
    campaignId?: string;
    /** Roles del Búnker que pueden ver este mensaje en el panel */
    authorizedRoles?: ('luz' | 'waly' | 'director')[];
}

export interface PushCampaign {
    id?: string;
    title: string;
    body: string;
    type: MessageType;
    mediaUrl?: string;
    linkUrl?: string;
    scheduledAt?: Date;
    targetUserId?: string;    // Si es null, es campaña masiva
    targetAudience?: 'all' | 'merchants' | 'clients' | 'ambassadors';
    createdBy: 'luz' | 'waly' | 'director';
    status: 'draft' | 'scheduled' | 'sent' | 'failed';
    sentCount?: number;
    createdAt?: Date;
}

// ─── SUBSCRIPCIÓN DE PUSH ─────────────────────────────────────────────────────

const PUSH_SUBSCRIPTION_COLLECTION = 'pushSubscriptions';
const MESSAGES_COLLECTION = 'chats';

/**
 * Solicita permiso al navegador y registra el service worker para push.
 * Guarda el estado de suscripción en Firestore para el userId.
 */
export const subscribeToPush = async (userId: string): Promise<boolean> => {
    if (!('Notification' in window)) {
        console.warn('[PUSH ENGINE] Navegador no soporta notificaciones.');
        return false;
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
        console.warn('[PUSH ENGINE] Permiso denegado.');
        return false;
    }

    // Guardar suscripción en Firestore
    try {
        const subscriptionsRef = collection(db, PUSH_SUBSCRIPTION_COLLECTION);
        await addDoc(subscriptionsRef, {
            userId,
            platform: navigator.platform,
            userAgent: navigator.userAgent.substring(0, 100),
            subscribedAt: Timestamp.now(),
            active: true,
        });
        console.log(`[PUSH ENGINE] ✅ Usuario ${userId} suscrito al sistema de push.`);
        return true;
    } catch (err) {
        console.error('[PUSH ENGINE] Error al guardar suscripción:', err);
        return false;
    }
};

// ─── ENVÍO DE MENSAJES INTERNOS ───────────────────────────────────────────────

/**
 * Envía un mensaje interno al chat de un usuario (ARI, Búnker, Luz, Waly).
 * El mensaje se guarda en /chats/{userId}/messages
 */
export const sendInternalMessage = async (
    userId: string,
    message: Omit<InternalMessage, 'id' | 'timestamp' | 'read'>
): Promise<string | null> => {
    try {
        const messagesRef = collection(db, MESSAGES_COLLECTION, userId, 'messages');
        const docRef = await addDoc(messagesRef, {
            ...message,
            timestamp: Timestamp.now(),
            read: false,
        });
        console.log(`[PUSH ENGINE] ✅ Mensaje enviado a ${userId}: ${message.content.substring(0, 50)}`);
        return docRef.id;
    } catch (err) {
        console.error('[PUSH ENGINE] Error al enviar mensaje interno:', err);
        return null;
    }
};

/**
 * Muestra una notificación push nativa en el dispositivo.
 * Funciona si el Service Worker está activo y el permiso fue concedido.
 */
export const showNativePush = async (options: {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    tag?: string;
    data?: Record<string, unknown>;
}): Promise<void> => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    const registration = await navigator.serviceWorker?.ready;
    if (registration) {
        await registration.showNotification(options.title, {
            body: options.body,
            icon: options.icon || '/ari-avatar.png',
            badge: options.badge || '/ari-avatar.png',
            tag: options.tag || 'shopdigital-push',
            data: options.data || {},
        });
    } else {
        // Fallback: notificación directa (tab abierta)
        new Notification(options.title, {
            body: options.body,
            icon: options.icon || '/ari-avatar.png',
        });
    }
};

// ─── CAMPAÑAS AUTOMÁTICAS ─────────────────────────────────────────────────────

/**
 * Envía un mensaje de feliz cumpleaños automático al usuario.
 * Llamada desde el Cron Job diario del Búnker.
 * Incluye mensaje generado por IA + push nativa.
 */
export const sendBirthdayMessage = async (
    userId: string,
    userName: string
): Promise<void> => {
    const birthdayContent = `🎂 ¡Feliz cumpleaños, ${userName}! 🎉\n\nEn ShopDigital te deseamos un día increíble lleno de celebraciones. Como regalo especial, tenés un descuento exclusivo esperándote. ¡Hacé clic para reclamarlo antes de que expire!\n\n¡Que cumplas muchos más, Socio! 🥳`;

    // 1. Guardar mensaje en el chat interno
    await sendInternalMessage(userId, {
        from: 'ari',
        type: 'birthday',
        content: birthdayContent,
        linkUrl: '/descuentos?promo=birthday',
        linkLabel: '🎁 Reclamar mi regalo',
        authorizedRoles: ['luz', 'waly', 'director'],
    });

    // 2. Disparar notificación push nativa
    await showNativePush({
        title: `🎂 ¡Feliz Cumpleaños, ${userName}!`,
        body: 'ShopDigital tiene un regalo especial para vos. ¡Abrí ARI para verlo!',
        tag: `birthday-${userId}`,
        data: { type: 'birthday', userId, action: 'open-chat' },
    });

    console.log(`[PUSH ENGINE] 🎂 Cumpleaños enviado a ${userId} (${userName})`);
};

/**
 * Envía el mensaje de bienvenida automático cuando un usuario se suscribe.
 */
export const sendWelcomeMessage = async (
    userId: string,
    userName: string
): Promise<void> => {
    const welcomeContent = `¡Bienvenido/a a ShopDigital, ${userName}! 🚀\n\nSoy ARI, tu asistente virtual. Acá vas a encontrar las mejores ofertas y beneficios de los comercios de tu zona.\n\n¿Querés que te muestre cómo sacar el máximo partido a la plataforma?`;

    await sendInternalMessage(userId, {
        from: 'ari',
        type: 'welcome',
        content: welcomeContent,
        linkUrl: '/descuentos',
        linkLabel: '🛍️ Ver ofertas del día',
    });
};

// ─── LECTURA DE MENSAJES EN TIEMPO REAL ──────────────────────────────────────

/**
 * Suscribe a los mensajes del chat de un usuario en tiempo real.
 * Retorna una función para cancelar la suscripción.
 */
export const subscribeToUserMessages = (
    userId: string,
    onMessages: (messages: InternalMessage[]) => void
): (() => void) => {
    const messagesRef = collection(db, MESSAGES_COLLECTION, userId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const messages: InternalMessage[] = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
            timestamp: (docSnap.data().timestamp as Timestamp).toDate(),
        } as InternalMessage));

        onMessages(messages);
    }, (err) => {
        console.error('[PUSH ENGINE] Error al escuchar mensajes:', err);
    });

    return unsubscribe;
};

/**
 * Marca todos los mensajes no leídos del usuario como leídos.
 */
export const markAllMessagesAsRead = async (
    userId: string,
    messageIds: string[]
): Promise<void> => {
    const updates = messageIds.map((msgId) => {
        const msgRef = doc(db, MESSAGES_COLLECTION, userId, 'messages', msgId);
        return updateDoc(msgRef, { read: true });
    });
    await Promise.all(updates);
};

/**
 * Cuenta los mensajes no leídos de un usuario.
 * Usado para el badge rojo en el globito de ARI.
 */
export const subscribeToUnreadCount = (
    userId: string,
    onCount: (count: number) => void
): (() => void) => {
    const messagesRef = collection(db, MESSAGES_COLLECTION, userId, 'messages');
    const q = query(messagesRef, where('read', '==', false));

    const unsubscribe = onSnapshot(q, (snapshot) => {
        onCount(snapshot.size);
    });

    return unsubscribe;
};

// ─── GUARDAR CAMPAÑA DEL BÚNKER ──────────────────────────────────────────────

/**
 * Luz o Waly guardan una campaña desde el display del Búnker de Marketing.
 */
export const saveBunkerCampaign = async (
    campaign: Omit<PushCampaign, 'id' | 'createdAt'>
): Promise<string | null> => {
    try {
        const campaignsRef = collection(db, 'bunkerCampaigns');
        const docRef = await addDoc(campaignsRef, {
            ...campaign,
            createdAt: Timestamp.now(),
            status: campaign.scheduledAt ? 'scheduled' : 'draft',
        });
        console.log(`[BÚNKER] ✅ Campaña guardada: ${campaign.title}`);
        return docRef.id;
    } catch (err) {
        console.error('[BÚNKER] Error al guardar campaña:', err);
        return null;
    }
};
