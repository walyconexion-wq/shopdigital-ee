// ==========================================
// 📲 HOOK: useInstallPrompt
// Controla el cartel de instalación PWA
// Módulo 6 — Sistema ARI / ShopDigital
// Director: Waly | Ingeniería: Luz
// ==========================================

import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
    prompt(): Promise<void>;
}

export interface InstallPromptState {
    /** true si el navegador soporta instalación y aún no fue instalado */
    canInstall: boolean;
    /** true si el usuario ya instaló la app (no mostrar más) */
    isInstalled: boolean;
    /** Dispara el cartel nativo de instalación */
    triggerInstall: () => Promise<boolean>;
    /** Marca el banner como descartado por el usuario (no volver a molestar en esta sesión) */
    dismissBanner: () => void;
    /** true si el usuario descartó el banner en esta sesión */
    isDismissed: boolean;
    /** Cantidad de visitas del usuario (para decidir cuándo mostrar el banner) */
    visitCount: number;
}

const INSTALL_DISMISSED_KEY = 'ari_install_dismissed_at';
const VISIT_COUNT_KEY = 'ari_visit_count';
const DISMISS_COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000; // 3 días antes de volver a sugerir

/**
 * Hook que captura el evento beforeinstallprompt del navegador
 * y expone controles para mostrar el cartel de instalación PWA
 * exactamente cuando nosotros queremos, no cuando Google quiera.
 * 
 * Lógica anti-molestia:
 * - No muestra el banner si ya está instalado
 * - No muestra si fue descartado en los últimos 3 días
 * - Aumenta el contador de visitas para estrategia de aparición progresiva
 */
export const useInstallPrompt = (): InstallPromptState => {
    const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
    const [isInstalled, setIsInstalled] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);
    const [visitCount, setVisitCount] = useState(0);

    useEffect(() => {
        // 1. Verificar si ya está instalado (modo standalone = app instalada)
        const isRunningStandalone =
            window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as any).standalone === true;

        if (isRunningStandalone) {
            setIsInstalled(true);
            return; // Si ya está instalado, no hacemos nada más
        }

        // 2. Verificar cooldown de dismissal
        const dismissedAt = localStorage.getItem(INSTALL_DISMISSED_KEY);
        if (dismissedAt) {
            const elapsed = Date.now() - parseInt(dismissedAt, 10);
            if (elapsed < DISMISS_COOLDOWN_MS) {
                setIsDismissed(true);
            }
        }

        // 3. Actualizar contador de visitas
        const currentCount = parseInt(localStorage.getItem(VISIT_COUNT_KEY) || '0', 10);
        const newCount = currentCount + 1;
        localStorage.setItem(VISIT_COUNT_KEY, String(newCount));
        setVisitCount(newCount);

        // 4. Capturar y FRENAR el evento automático de Google
        const handleBeforeInstall = (e: Event) => {
            e.preventDefault(); // ← Esto es el truco: frenamos el cartel de Google
            setPromptEvent(e as BeforeInstallPromptEvent);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstall);

        // 5. Detectar si el usuario instaló la app después de disparar el prompt
        window.addEventListener('appinstalled', () => {
            setIsInstalled(true);
            setPromptEvent(null);
            localStorage.removeItem(INSTALL_DISMISSED_KEY);
            localStorage.removeItem(VISIT_COUNT_KEY);
            console.log('[PWA] ✅ ShopDigital instalado en pantalla de inicio');
        });

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
        };
    }, []);

    /**
     * Dispara el cartel nativo de instalación del navegador.
     * Retorna true si el usuario aceptó, false si descartó.
     */
    const triggerInstall = async (): Promise<boolean> => {
        if (!promptEvent) return false;

        try {
            await promptEvent.prompt();
            const { outcome } = await promptEvent.userChoice;
            console.log(`[PWA] Usuario ${outcome === 'accepted' ? 'ACEPTÓ' : 'descartó'} la instalación`);

            if (outcome === 'accepted') {
                setIsInstalled(true);
                setPromptEvent(null);
            }

            return outcome === 'accepted';
        } catch (error) {
            console.error('[PWA] Error al disparar el prompt de instalación:', error);
            return false;
        }
    };

    /**
     * El usuario descarta el banner manualmente.
     * Guardamos la fecha para aplicar el cooldown de 3 días.
     */
    const dismissBanner = () => {
        localStorage.setItem(INSTALL_DISMISSED_KEY, String(Date.now()));
        setIsDismissed(true);
    };

    const canInstall = !!promptEvent && !isInstalled && !isDismissed;

    return {
        canInstall,
        isInstalled,
        triggerInstall,
        dismissBanner,
        isDismissed,
        visitCount,
    };
};
