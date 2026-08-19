// ==========================================
// 📲 COMPONENTE: InstallBanner
// Banner de instalación PWA — 3 apariciones distintas
// con lógica anti-molestia integrada
// Módulo 6 — Sistema ARI / ShopDigital
// Director: Waly | Ingeniería: Luz
// ==========================================

import React, { useEffect, useState } from 'react';
import { useInstallPrompt } from '../hooks/useInstallPrompt';
import { Download, X, Smartphone } from 'lucide-react';

interface InstallBannerProps {
    /** Modo de aparición: 'home' = banner top, 'menu' = ítem en menú lateral, 'ari' = sugerencia en el chat */
    variant?: 'home' | 'menu' | 'ari';
    /** Callback cuando ARI sugiere instalación dentro del chat (para el modo 'ari') */
    onAriSuggested?: () => void;
}

/**
 * Componente multi-variante de instalación PWA.
 * 
 * Variante 'home':   Banner deslizable en la parte superior de la Home
 *                    Aparece a partir de la 3° visita del usuario.
 * 
 * Variante 'menu':   Ítem fijo en el menú lateral (siempre visible si canInstall)
 * 
 * Variante 'ari':    Botón compacto para incrustar dentro del chat de ARI,
 *                    ARI sugiere instalación en la primera conversación.
 */
export const InstallBanner: React.FC<InstallBannerProps> = ({
    variant = 'home',
    onAriSuggested,
}) => {
    const { canInstall, isInstalled, triggerInstall, dismissBanner, visitCount } = useInstallPrompt();
    const [installing, setInstalling] = useState(false);
    const [justInstalled, setJustInstalled] = useState(false);

    // Para el banner 'home': sólo mostrar a partir de la 3° visita
    const shouldShowHomeBanner = variant === 'home' && canInstall && visitCount >= 3;
    const shouldShowMenuBtn = variant === 'menu' && canInstall;
    const shouldShowAriBanner = variant === 'ari' && canInstall;

    // Notificar a ARI que puede sugerir instalación
    useEffect(() => {
        if (shouldShowAriBanner && onAriSuggested) {
            onAriSuggested();
        }
    }, [shouldShowAriBanner]);

    const handleInstall = async () => {
        setInstalling(true);
        const accepted = await triggerInstall();
        setInstalling(false);
        if (accepted) {
            setJustInstalled(true);
        }
    };

    // ── VARIANTE HOME ── Banner superior deslizable ─────────────────────────
    if (variant === 'home') {
        if (!shouldShowHomeBanner && !justInstalled) return null;

        if (justInstalled) {
            return (
                <div className="fixed top-0 left-0 right-0 z-[9999] flex items-center justify-center px-4 py-3
                    bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg animate-in slide-in-from-top duration-500">
                    <Smartphone size={16} className="text-white mr-2 flex-shrink-0" />
                    <span className="text-white text-[11px] font-black uppercase tracking-widest">
                        ✅ ¡ShopDigital instalado! Ya tenés el ícono en tu pantalla de inicio.
                    </span>
                </div>
            );
        }

        return (
            <div
                id="pwa-install-banner"
                className="fixed top-0 left-0 right-0 z-[9999] flex items-center justify-between gap-3 px-4 py-3
                    bg-gradient-to-r from-violet-700 via-purple-700 to-indigo-700
                    shadow-xl shadow-violet-900/50 animate-in slide-in-from-top duration-500"
            >
                {/* Brillo animado */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-white/10 to-transparent 
                        skew-x-12 animate-[shimmer_3s_ease-in-out_infinite]" />
                </div>

                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0">
                        <img src="/ari-avatar.png" alt="ARI" className="w-6 h-6 object-cover rounded-lg" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-white text-[10px] font-black uppercase tracking-wider truncate">
                            📲 Instalá ShopDigital
                        </p>
                        <p className="text-violet-200 text-[9px] truncate">
                            Acceso directo desde tu pantalla de inicio
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                        id="pwa-install-btn-banner"
                        onClick={handleInstall}
                        disabled={installing}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl
                            bg-white text-violet-700 text-[9px] font-black uppercase tracking-wider
                            shadow-lg hover:bg-violet-50 transition-all hover:scale-105 active:scale-95
                            disabled:opacity-70 cursor-pointer border-none"
                    >
                        <Download size={12} />
                        {installing ? 'Instalando...' : 'Instalar'}
                    </button>
                    <button
                        id="pwa-install-dismiss-btn"
                        onClick={dismissBanner}
                        className="p-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10 
                            transition-all cursor-pointer border-none bg-transparent"
                        aria-label="Cerrar banner de instalación"
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>
        );
    }

    // ── VARIANTE MENÚ ── Ítem en el menú lateral ─────────────────────────────
    if (variant === 'menu') {
        if (!shouldShowMenuBtn) return null;

        return (
            <button
                id="pwa-install-btn-menu"
                onClick={handleInstall}
                disabled={installing}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl
                    bg-gradient-to-r from-violet-600/20 to-cyan-600/20
                    border border-violet-400/30 hover:border-violet-400/60
                    text-left transition-all hover:scale-[1.02] active:scale-95
                    cursor-pointer disabled:opacity-70"
            >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-600
                    flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Download size={16} className="text-white" />
                </div>
                <div className="min-w-0">
                    <p className="text-[11px] font-black uppercase tracking-wider text-white">
                        {installing ? '⏳ Instalando...' : '📲 Instalar App'}
                    </p>
                    <p className="text-[9px] text-white/60 truncate">
                        Agrega ShopDigital a tu inicio
                    </p>
                </div>
            </button>
        );
    }

    // ── VARIANTE ARI ── Botón compacto dentro del chat ───────────────────────
    if (variant === 'ari') {
        if (!shouldShowAriBanner) return null;

        if (justInstalled) {
            return (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 my-2">
                    <Smartphone size={14} className="text-emerald-600 flex-shrink-0" />
                    <span className="text-[10px] font-bold text-emerald-700">
                        ¡Genial! Ya tenés ShopDigital en tu pantalla de inicio. 🎉
                    </span>
                </div>
            );
        }

        return (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-violet-50 border border-violet-200 my-2 animate-in fade-in duration-500">
                <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-violet-800 uppercase tracking-wider">
                        📲 Instalame en tu pantalla de inicio
                    </p>
                    <p className="text-[9px] text-violet-600">
                        Acceso rápido sin abrir el navegador
                    </p>
                </div>
                <button
                    id="pwa-install-btn-ari"
                    onClick={handleInstall}
                    disabled={installing}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg
                        bg-gradient-to-r from-violet-600 to-cyan-600 text-white
                        text-[9px] font-black uppercase tracking-wider shadow-md
                        hover:scale-105 transition-all active:scale-95
                        disabled:opacity-70 cursor-pointer border-none flex-shrink-0"
                >
                    <Download size={10} />
                    {installing ? '...' : 'Instalar'}
                </button>
            </div>
        );
    }

    return null;
};

export default InstallBanner;
