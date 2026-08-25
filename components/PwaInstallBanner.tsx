import React, { useState, useEffect } from 'react';
import { Smartphone, Download, CheckCircle2, Sparkles, X, Share2, PlusSquare } from 'lucide-react';
import { playNeonClick } from '../utils/audio';

interface PwaInstallBannerProps {
    className?: string;
}

export const PwaInstallBanner: React.FC<PwaInstallBannerProps> = ({ className = '' }) => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isInstalled, setIsInstalled] = useState<boolean>(false);
    const [showInstructions, setShowInstructions] = useState<boolean>(false);
    const [isIos, setIsIos] = useState<boolean>(false);

    useEffect(() => {
        // Detectar si ya está instalada en modo standalone
        if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true) {
            setIsInstalled(true);
        }

        // Detectar iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
        setIsIos(isIosDevice);

        // Capturar evento de instalación de PWA en Android/Chrome
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Detectar cuando se instala exitosamente
        window.addEventListener('appinstalled', () => {
            setIsInstalled(true);
            setDeferredPrompt(null);
        });

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        playNeonClick();

        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                setIsInstalled(true);
            }
            setDeferredPrompt(null);
        } else {
            // Si no hay prompt nativo disponible (iOS o Chrome escritorio), mostrar guía modal
            setShowInstructions(true);
        }
    };

    if (isInstalled) {
        return (
            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 text-[8px] font-black uppercase tracking-wider shadow-sm select-none ${className}`}>
                <CheckCircle2 size={11} className="text-emerald-600" />
                <span>App Instalada en tu Celu</span>
            </div>
        );
    }

    return (
        <>
            {/* 📲 PÍLDORA / BANNER FLOTANTE NEUMÓRFICO 3D */}
            <div className={`relative inline-block z-20 select-none ${className}`}>
                <button
                    onClick={handleInstallClick}
                    className="group relative flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-[#fbf8f2] to-[#f4ebe0] border-[1.5px] border-[#e2d5c3] shadow-[0_6px_16px_rgba(44,36,64,0.12),inset_0_1px_1px_rgba(255,255,255,0.9)] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
                >
                    {/* Luz pulsante */}
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff6b6b] opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ff5252]" />
                    </span>

                    {/* Icono */}
                    <div className="w-6 h-6 rounded-xl bg-[#2c2440] text-white flex items-center justify-center shadow-md group-hover:rotate-6 transition-transform">
                        <Smartphone size={13} className="text-[#22d3ee]" />
                    </div>

                    {/* Textos */}
                    <div className="text-left flex flex-col">
                        <span className="text-[7px] font-black uppercase tracking-[0.15em] text-[#ff6b6b] leading-tight flex items-center gap-0.5">
                            Acceso Directo <Sparkles size={8} />
                        </span>
                        <span className="text-[9px] font-[900] uppercase tracking-wider text-[#2c2440] leading-none">
                            Instalar App en tu Celu
                        </span>
                    </div>

                    {/* Flechita / Download */}
                    <div className="ml-1 w-5 h-5 rounded-full bg-[#e8dac8] text-[#2c2440] flex items-center justify-center">
                        <Download size={10} />
                    </div>
                </button>
            </div>

            {/* 📖 MODAL INTERACTIVO DE GUÍA DE INSTALACIÓN (PARA IPHONE O MANUAL) */}
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
                            ¡Entendido, gracias!
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default PwaInstallBanner;
