// ==========================================
// 📱 SERVICIO DE NOTIFICACIONES PUSH (PWA & WEB PUSH)
// Búnker de Infraestructura - ShopDigital
// ==========================================

const NTFY_TOPIC = 'shopdigital-bunker-autohealing-waly';
const NTFY_URL = `https://ntfy.sh/${NTFY_TOPIC}`;

export interface PushMessageOptions {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    tag?: string;
    requireInteraction?: boolean;
    urgent?: boolean;
    data?: any;
}

/**
 * Solicita permiso de notificaciones nativas en la PWA / Navegador Móvil
 */
export const solicitarPermisosPush = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
        console.warn('[PUSH] Este navegador no soporta notificaciones Web Push.');
        return false;
    }

    try {
        const result = await Notification.requestPermission();
        console.log(`[PUSH] Estado de permiso de notificaciones: ${result}`);
        return result === 'granted';
    } catch (error) {
        console.error('[PUSH] Error al solicitar permisos:', error);
        return false;
    }
};

/**
 * Verifica si las notificaciones nativas están otorgadas
 */
export const verificarPermisosPush = (): boolean => {
    return 'Notification' in window && Notification.permission === 'granted';
};

/**
 * Envía una notificación Web Push nativa (PWA) y canal Ntfy de respaldo para móvil
 */
export const enviarAlertaPush = async (options: PushMessageOptions): Promise<void> => {
    console.log(`[PUSH ALERT] 🚨 ${options.title}: ${options.body}`);

    // 1. Notificación Nativa Web Push / ServiceWorker PWA
    if ('Notification' in window && Notification.permission === 'granted') {
        try {
            if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                const registration = await navigator.serviceWorker.ready;
                await registration.showNotification(options.title, {
                    body: options.body,
                    icon: options.icon || '/icon-192.png',
                    badge: options.badge || '/badge.png',
                    tag: options.tag || 'bunker-alert',
                    requireInteraction: options.requireInteraction ?? true,
                    data: options.data || {}
                });
            } else {
                new Notification(options.title, {
                    body: options.body,
                    icon: options.icon || '/icon-192.png',
                    tag: options.tag || 'bunker-alert'
                });
            }
        } catch (err) {
            console.error('[PUSH NATIVO] Error mostrando notificación nativa:', err);
        }
    }

    // 2. Notificación Push a Móvil vía Ntfy (Respaldo directo al Celular sin importar si la pestaña está cerrada)
    try {
        await fetch(NTFY_URL, {
            method: 'POST',
            headers: {
                'Title': options.title,
                'Priority': options.urgent ? '5' : '3',
                'Tags': options.urgent ? 'warning,rotating_light,fire' : 'shield,tools,heavy_check_mark'
            },
            body: options.body
        });
    } catch (err) {
        console.error('[PUSH NTFY] Error enviando alerta al canal móvil:', err);
    }
};
