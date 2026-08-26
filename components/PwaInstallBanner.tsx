import React, { useState, useEffect } from 'react';
import { Smartphone, Download, CheckCircle2, Sparkles, X, Share2, PlusSquare } from 'lucide-react';
import { playNeonClick } from '../utils/audio';

interface PwaInstallBannerProps {
    className?: string;
    variant?: 'compact-3d' | 'full';
}

export const PwaInstallBanner: React.FC<PwaInstallBannerProps> = ({ 
    className = '',
    variant = 'compact-3d'
}) => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isInstalled, setIsInstalled] = useState<boolean>(false);
    const [showInstructions, setShowInstructions] = useState<boolean>(false);
    const [isIos, setIsIos] = useState<boolean>(false);

    useEffect(() => {
        // 1. Detectar si ya está instalada como PWA
        if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true) {
            setIsInstalled(true);
        }

        // 2. Detectar si es dispositivo iOS (iPhone / iPad)
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
        setIsIos(isIosDevice);

        // 3. Revisar si ya se capturó el prompt globalmente en index.html
        if ((window as any).__pwaInstallPrompt) {
            setDeferredPrompt((window as any).__pwaInstallPrompt);
        }

        // 4. Escuchar evento nativo y evento personalizado
        const handlePromptReady = () => {
            if ((window as any).__pwaInstallPrompt) {
                setDeferredPrompt((window as any).__pwaInstallPrompt);
            }
        };

        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            (window as any).__pwaInstallPrompt = e;
            setDeferredPrompt(e);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('pwa-prompt-ready', handlePromptReady);

        // Detectar cuando la app se instala con éxito
        window.addEventListener('appinstalled', () => {
            setIsInstalled(true);
            setDeferredPrompt(null);
            (window as any).__pwaInstallPrompt = null;
        });

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('pwa-prompt-ready', handlePromptReady);
        };
    }, []);

    const handleInstallClick = async () => {
        playNeonClick();

        const activePrompt = deferredPrompt || (window as any).__pwaInstallPrompt;

        if (activePrompt) {
            try {
                // Disparar cartel nativo oficial de Google Chrome / Android
                await activePrompt.prompt();
                const choiceResult = await activePrompt.userChoice;
                if (choiceResult.outcome === 'accepted') {
                    setIsInstalled(true);
                }
                setDeferredPrompt(null);
                (window as any).__pwaInstallPrompt = null;
            } catch (err) {
                console.warn('Error al disparar prompt nativo:', err);
                setShowInstructions(true);
            }
        } else {
            // Fallback elegante (iOS Safari o navegador que no soporta beforeinstallprompt)
            setShowInstructions(true);
        }
    };

    if (isInstalled) {
        return (
            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 text-[8px] font-black uppercase tracking-wider shadow-sm select-none ${className}`}>
                <CheckCircle2 size={12} className="text-emerald-600" />
                <span>App Instalada 🟢</span>
            </div>
        );
    }

    return (
        <>
            {/* 📲 BOTÓN NEUMÓRFICO 3D TÁCTIL (ESTILO PURO CARAMELO / CREMA SHOPDIGITAL) */}
            <div className={`relative inline-block z-20 select-none ${className}`}>
                <button
                    onClick={handleInstallClick}
                    className="neu-btn-3d group flex items-center justify-center gap-2 py-2 px-3.5 text-center transition-all cursor-pointer active:scale-95"
                    style={{
                        borderRadius: '1.2rem',
                        border: '1.5px solid #e2d5c3',
                        background: 'linear-gradient(135deg, #fbf8f2 0%, #f4ebe0 100%)',
                        boxShadow: '0 6px 14px rgba(44, 36, 64, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.9)'
                    }}
                >
                    {/* Luz Pulsante de Alerta Roja */}
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff6b6b] opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ff5252]" />
                    </span>

                    {/* Icono Smartphone */}
                    <div className="w-5 h-5 rounded-lg bg-[#2c2440] text-[#22d3ee] flex items-center justify-center shadow-sm">
                        <Smartphone size={11} />
                    </div>

                    {/* Texto del Botón 3D */}
                    <div className="flex flex-col text-left leading-none">
                        <span className="text-[7px] font-black uppercase tracking-[0.14em] text-[#ff6b6b] mb-0.5">
                            Acceso Directo
                        </span>
                        <span className="text-[8.5px] font-[900] uppercase tracking-wider text-[#2c2440]">
                            Descargar App en tu Celu
                        </span>
                    </div>

                    {/* Flecha Download */}
                    <div className="w-4 h-4 rounded-full bg-[#e8dac8] text-[#2c2440] flex items-center justify-center ml-0.5 group-hover:translate-y-0.5 transition-transform">
                        <Download size={9} />
                    </div>
                </button>
            </div>

            {/* 📖 MODAL INTERACTIVO DE GUÍA (SOLO COMO FALLBACK PARA IPHONE O NAVEGADORES SIN POPUP NATIVO) */}
            {showInstructions && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[300] flex items-center justify-center p-5 animate-in fade-in duration-200 select-none">
                    <div className="bg-[#fbf8f2] border-2 border-[#e2d5c3] p-6 rounded-[2rem] w-full max-w-xs shadow-2xl relative text-center animate-in zoom-in-95 duration-200">
                        {/* Botón Cerrar */}
                        <button
                            onClick={() => setShowInstructions(false)}
                            className="absolute top-4 right-4 w-7 h-7 rounded-full bg-[#e8dac8] text-[#2c2440] hover:bg-[#2c2440] hover:text-white flex items-center justify-center transition cursor-pointer"
                        >
                            <X size={14} />
                        </button>

                        {/* Icono Cabecera */}
                        <div className="w-12 h-12 bg-[#2c2440] text-[#22d3ee] rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                            <Smartphone size={24} />
                        </div>

                        <h3 className="text-sm font-[900] uppercase tracking-wider text-[#2c2440] mb-1">
                            Instalar ShopDigital
                        </h3>
                        <p className="text-[10px] text-[#5c4033] font-bold leading-snug mb-4">
                            Llevá la app en tu pantalla de inicio para usarla al instante sin descargas pesadas.
                        </p>

                        {/* Pasos según dispositivo */}
                        <div className="space-y-2.5 text-left bg-white p-3.5 rounded-2xl border border-[#e2d5c3] mb-4">
                            {isIos ? (
                                <>
                                    <div className="flex items-start gap-2 text-[10px] text-[#2c2440] font-bold">
                                        <div className="w-5 h-5 rounded-full bg-[#2c2440] text-white flex items-center justify-center shrink-0 text-[9px]">1</div>
                                        <span className="leading-tight">Tocá el botón <strong>Compartir</strong> <Share2 size={11} className="inline text-[#22d3ee]" /> en Safari.</span>
                                    </div>
                                    <div className="flex items-start gap-2 text-[10px] text-[#2c2440] font-bold">
                                        <div className="w-5 h-5 rounded-full bg-[#2c2440] text-white flex items-center justify-center shrink-0 text-[9px]">2</div>
                                        <span className="leading-tight">Seleccioná <strong>"Agregar a Inicio"</strong> <PlusSquare size={11} className="inline text-[#ff6b6b]" />.</span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex items-start gap-2 text-[10px] text-[#2c2440] font-bold">
                                        <div className="w-5 h-5 rounded-full bg-[#2c2440] text-white flex items-center justify-center shrink-0 text-[9px]">1</div>
                                        <span className="leading-tight">Tocá los <strong>tres puntitos (⋮)</strong> arriba a la derecha en Chrome.</span>
                                    </div>
                                    <div className="flex items-start gap-2 text-[10px] text-[#2c2440] font-bold">
                                        <div className="w-5 h-5 rounded-full bg-[#2c2440] text-white flex items-center justify-center shrink-0 text-[9px]">2</div>
                                        <span className="leading-tight">Elegí <strong>"Instalar aplicación"</strong> o <strong>"Agregar a pantalla principal"</strong>.</span>
                                    </div>
                                </>
                            )}
                        </div>

                        <button
                            onClick={() => { playNeonClick(); setShowInstructions(false); }}
                            className="w-full py-2.5 rounded-xl bg-[#2c2440] text-white font-black text-[9px] uppercase tracking-widest active:scale-95 transition-all shadow-md cursor-pointer"
                        >
                            ¡Entendido!
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default PwaInstallBanner;
