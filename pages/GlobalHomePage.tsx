import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mountain, MapPin, Building2, Plane, FileCheck, FileText, ScrollText, AlertCircle, X } from 'lucide-react';
import { suscribirseARegiones } from '../firebase';
import { Region, Shop } from '../types';
import { playNeonClick } from '../utils/audio';
import { AriMerchantAssistant } from '../components/AriMerchantAssistant';
import { CyberCircuitBackground } from '../components/CyberCircuitBackground';
import { PwaInstallBanner } from '../components/PwaInstallBanner';

const STATIC_REGIONS: Region[] = [
    { 
        id: 'esteban-echeverria', 
        name: 'Esteban Echeverría', 
        type: 'zona', 
        towns: ['esteban-echeverria'], 
        color: '#22d3ee', 
        icon: 'building', 
        isActive: true,
        provinceId: 'buenos-aires',
        createdAt: '2026-01-01T00:00:00.000Z'
    },
    { 
        id: 'ezeiza', 
        name: 'Ezeiza', 
        type: 'zona', 
        towns: ['ezeiza'], 
        color: '#22d3ee', 
        icon: 'building', 
        isActive: true,
        provinceId: 'buenos-aires',
        createdAt: '2026-01-01T00:00:00.000Z'
    },
    { 
        id: 'lomas-de-zamora', 
        name: 'Lomas de Zamora', 
        type: 'zona', 
        towns: ['lomas-de-zamora'], 
        color: '#22d3ee', 
        icon: 'building', 
        isActive: true,
        provinceId: 'buenos-aires',
        createdAt: '2026-01-01T00:00:00.000Z'
    },
    { 
        id: 'traslasierra', 
        name: 'Traslasierra', 
        type: 'region', 
        towns: ['mina-clavero', 'nono', 'cura-brochero', 'panaholma', 'villa-dolores', 'villa-las-rosas', 'san-javier', 'las-rabonas'], 
        color: '#0ea5e9', 
        icon: 'mountain', 
        isActive: true,
        provinceId: 'cordoba',
        createdAt: '2026-01-01T00:00:00.000Z'
    },
    { 
        id: 'patagonia-7-lagos', 
        name: 'Región Patagónica - 7 Lagos', 
        type: 'region', 
        towns: ['bariloche', 'san-martin-de-los-andes', 'villa-la-angostura'], 
        color: '#0284c7', 
        icon: 'mountain', 
        isActive: true,
        provinceId: 'neuquen-rio-negro',
        createdAt: '2026-01-01T00:00:00.000Z'
    }
];

const GlobalHomePage: React.FC = () => {
    const navigate = useNavigate();
    const [, setRegions] = useState<Region[]>(STATIC_REGIONS);
    const [clickCount, setClickCount] = useState(0);
    const [showTermsModal, setShowTermsModal] = useState(false);

    // --- ESTADO DE REGIONES Y LOCALIDADES ---
    const [activeRegion, setActiveRegion] = useState<'buenos-aires' | 'cordoba' | 'patagonia'>('buenos-aires');
    const [mockMessage, setMockMessage] = useState<string | null>(null);

    // Mock Shop para que ARI funcione en la Home Global
    const globalShop: Shop = {
        id: 'global-network',
        name: 'Red Digital Argentina',
        ownerId: 'admin',
        townId: 'argentina',
        category: 'Plataforma',
        description: 'Centro de mando nacional de ShopDigital',
        address: 'Nube Digital',
        phone: '',
        color: '#00FBFF',
        visits: 2500,
        subscribers: 150,
        offers: [],
        isActive: true,
        rating: 5,
        specialty: 'Red Nacional',
        image: '',
        bannerImage: '',
        mapUrl: '',
        slug: 'red-digital-argentina',
        gmail: 'admin@shopdigital.ar',
    };

    useEffect(() => {
        const unsubscribe = suscribirseARegiones((data) => {
            if (data && data.length > 0) {
                const dynamicRegions = data.filter(
                    r => r.id !== 'traslasierra' && 
                         r.id !== 'ezeiza' && 
                         r.id !== 'esteban-echeverria' && 
                         r.id !== 'buenos-aires-sur'
                );
                setRegions([...STATIC_REGIONS, ...dynamicRegions]);
            }
        });
        return () => unsubscribe();
    }, []);

    const handleCopyrightClick = () => {
        playNeonClick();
        setClickCount(prev => {
            const next = prev + 1;
            if (next >= 6) {
                navigate('/esteban-echeverria/tablero-maestro');
                return 0;
            }
            return next;
        });
    };

    const localitiesForActiveRegion: Array<{ name: string; path: string; isMock?: boolean }> = activeRegion === 'buenos-aires' 
        ? [
            { name: 'Esteban Echeverria', path: '/esteban-echeverria/home' },
            { name: 'Ezeiza', path: '/ezeiza/home' },
            { name: 'Lomas de Zamora', path: '/lomas-de-zamora/home' }
          ]
        : activeRegion === 'cordoba'
        ? [
            { name: 'Traslasierra', path: '/region/traslasierra' }
          ]
        : [
            { name: 'San Carlos de Bariloche', path: '/bariloche/home' },
            { name: 'Villa La Angostura', path: '/villa-la-angostura/home' },
            { name: 'San Martín de los Andes', path: '/san-martin-de-los-andes/home' }
          ];

    return (
        <div className="w-full h-[100dvh] min-h-[100dvh] max-h-[100dvh] font-sans relative select-none z-10 text-[#2d1e15] overflow-hidden flex flex-col justify-between items-center">
            {/* Fondo Ciber-Digital de Circuitos Animados */}
            <CyberCircuitBackground />
            
            {/* Contenedor Central Neumórfico Crema */}
            <div className="w-full max-w-md mx-auto h-full flex flex-col p-3 sm:p-5 pb-3 justify-between relative z-10">

                {/* ── Encabezado y Botones Envueltos en el Contenedor Neumórfico Crema ── */}
                <div className="neu-plate w-full mt-1 sm:mt-2 flex flex-col gap-2.5 sm:gap-3.5 relative z-10">
                    {/* ── Título Interno Hundido (Inset Neumórfico) ── */}
                    <div className="neu-inset-title py-2 sm:py-3 px-5 text-center w-full max-w-[280px] mx-auto flex flex-col items-center justify-center">
                        <h1 className="text-[17px] sm:text-[19px] font-[900] uppercase tracking-[0.1em] text-[#2c2440] select-none leading-none">
                            SHOPDIGITAL
                        </h1>
                        <div className="flex items-center justify-center gap-1 mt-0.5 select-none">
                            <span className="text-[8px] sm:text-[8.5px] font-bold uppercase tracking-[0.18em] text-[#4a3d6a]">
                                SELECCIONA TU REGIÓN
                            </span>
                            <MapPin size={10} className="text-[#4a3d6a]" />
                        </div>
                    </div>

                    {/* ── Fila 1: Selector de Región — botones Neumórficos 3D ── */}
                    <div className="grid grid-cols-3 gap-2 w-full">
                        {[
                            { id: 'buenos-aires' as const, label: 'BUENOS AIRES', icon: null },
                            { id: 'cordoba' as const, label: 'CÓRDOBA', icon: null },
                            { id: 'patagonia' as const, label: 'PATAGONIA', icon: <Mountain size={13} className="opacity-70 flex-shrink-0" /> }
                        ].map(reg => {
                            const isActive = activeRegion === reg.id;
                            return (
                                <button
                                    key={reg.id}
                                    onClick={() => { playNeonClick(); setActiveRegion(reg.id); }}
                                    className={`py-2.5 px-1.5 text-[7.5px] sm:text-[8px] font-extrabold uppercase tracking-wider flex items-center justify-center gap-1 text-center transition-all ${
                                        isActive ? 'neu-btn-3d-active' : 'neu-btn-3d'
                                    }`}
                                >
                                    <span>{reg.label}</span>
                                    {reg.icon}
                                </button>
                            );
                        })}
                    </div>

                    {/* ── Fila 2: Localidades — botones Neumórficos 3D ── */}
                    <div className="grid grid-cols-3 gap-2 w-full">
                        {localitiesForActiveRegion.map(loc => {
                            const locLower = loc.name.toLowerCase();
                            const isEzeiza = locLower.includes('ezeiza');
                            const isLomas = locLower.includes('lomas');
                            return (
                                <button
                                    key={loc.name}
                                    onClick={() => {
                                        playNeonClick();
                                        if (loc.isMock) {
                                            setMockMessage(
                                                loc.name === 'Lomas de zamora'
                                                ? "¡Zona Esteban Echeverría y Ezeiza activas! Lomas de Zamora será clonada en la próxima fase de expansión de la red local. 🚀"
                                                : "¡Zona Traslasierra (Córdoba) y Buenos Aires activas! San Martín de los Andes (Patagonia) es nuestra próxima región a clonar. 🏔️"
                                            );
                                        } else {
                                            navigate(loc.path);
                                        }
                                    }}
                                    className="neu-btn-3d py-2 px-1 text-[7px] sm:text-[7.5px] leading-tight font-extrabold uppercase tracking-wider flex items-center justify-center gap-0.5 text-center transition-all"
                                >
                                    <span>
                                        {loc.name === 'Esteban Echeverria' ? (
                                            <>ESTEBAN<br/>ECHEVERRIA</>
                                        ) : loc.name === 'Ezeiza' ? (
                                            'EZEIZA'
                                        ) : loc.name === 'Lomas de Zamora' ? (
                                            <>LOMAS DE<br/>ZAMORA</>
                                        ) : (
                                            loc.name
                                        )}
                                    </span>
                                    {isEzeiza && <Plane size={11} className="opacity-70 flex-shrink-0 ml-0.5" />}
                                    {isLomas && <Building2 size={11} className="opacity-70 flex-shrink-0 ml-0.5" />}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ── Avatar Central Animado 3D & Botón 3D de Descarga PWA ── */}
                <div className="flex-1 flex flex-col items-center justify-center relative z-10 select-none my-1 py-1">
                    {/* 📲 Botón Neumórfico 3D de Instalación PWA */}
                    <div className="mb-1 sm:mb-2 pointer-events-auto">
                        <PwaInstallBanner />
                    </div>

                    <div className="ari-3d-avatar-container flex flex-col items-center justify-center max-h-[220px] sm:max-h-[290px] pointer-events-none">
                        <img
                            src="/ari-saludando.gif"
                            alt="ARI Asistente Animado"
                            className="max-h-[210px] sm:max-h-[280px] h-auto w-auto object-contain filter drop-shadow-[0_8px_20px_rgba(40,10,80,0.25)]"
                            loading="eager"
                        />
                        <div className="ari-3d-shadow mt-0.5 opacity-40" />
                    </div>
                </div>

                {/* ── Pie de Página Neumórfico Crema HD (Siempre Visible) ── */}
                <footer className="w-full z-10 mt-auto pt-0 pb-1 mb-0 pr-14 sm:pr-0">
                    <div className="neu-footer flex items-center justify-between w-full py-2 px-3 sm:py-2.5 sm:px-6">
                        <p
                            onClick={handleCopyrightClick}
                            className="text-[7.5px] sm:text-[8px] font-extrabold uppercase tracking-[0.2em] text-[#2c2440] cursor-pointer select-none active:opacity-100 transition-opacity"
                        >
                            © 2026 · SHOPDIGITAL
                        </p>
                        <div className="flex items-center gap-2 sm:gap-3">
                            <button
                                onClick={() => { playNeonClick(); setShowTermsModal(true); }}
                                className="text-[7px] sm:text-[7.5px] font-extrabold uppercase tracking-[0.12em] text-[#2c2440] hover:text-[#ff6b6b] flex items-center gap-1 active:opacity-75 transition-all select-none border-none bg-transparent cursor-pointer"
                            >
                                <FileText size={10} className="opacity-70" />
                                TÉRMINOS
                            </button>
                            <button
                                onClick={() => { playNeonClick(); setShowTermsModal(true); }}
                                className="text-[7px] sm:text-[7.5px] font-extrabold uppercase tracking-[0.12em] text-[#2c2440] hover:text-[#ff6b6b] flex items-center gap-1 active:opacity-75 transition-all select-none border-none bg-transparent cursor-pointer"
                            >
                                <FileCheck size={10} className="opacity-70" />
                                CONDICIONES
                            </button>
                        </div>
                    </div>
                </footer>

            </div>

            {/* 🤖 ASISTENTE ARI REAL */}
            <AriMerchantAssistant shop={globalShop} role="home" isDayMode={true} />

            {/* 🚀 MODAL INTERACTIVO PARA LOCALIDADES NO CLONADAS (MAQUETAS) */}
            {mockMessage && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="bg-white border border-slate-200 p-6 rounded-[2rem] w-full max-w-xs shadow-2xl relative text-center animate-in zoom-in-95 duration-200">
                        <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle size={22} className="animate-pulse" />
                        </div>
                        <h3 className="text-[11px] font-black uppercase tracking-wider text-[#2d1e15] mb-2.5">
                            Zona en Preparación
                        </h3>
                        <p className="text-[9px] text-[#5c4033] font-bold uppercase tracking-widest leading-relaxed mb-5">
                            {mockMessage}
                        </p>
                        <button
                            onClick={() => { playNeonClick(); setMockMessage(null); }}
                            className="w-full bg-[#2d1e15] text-white py-3 rounded-xl font-black uppercase tracking-widest text-[8px] active:scale-95 transition-all border-b-[3.5px] border-b-[#110b07] shadow-lg cursor-pointer"
                        >
                            Entendido
                        </button>
                    </div>
                </div>
            )}

            {/* 📄 MODAL DESPLEGABLE DE TÉRMINOS Y CONDICIONES */}
            {showTermsModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[300] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
                    <div className="w-full max-w-lg max-h-[85vh] flex flex-col rounded-[2.5rem] border shadow-2xl relative animate-in zoom-in-95 duration-200 overflow-hidden bg-[#f0ece6] border-[#e0d6c8] text-[#2c2440]">
                        {/* Header del Modal */}
                        <div className="p-5 sm:p-6 border-b flex items-center justify-between sticky top-0 z-10 backdrop-blur-xl bg-[#f0ece6]/95 border-[#b4a594]/30">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-2xl bg-[#2c2440]/10 text-[#2c2440]">
                                    <ScrollText size={20} />
                                </div>
                                <div className="text-left">
                                    <h2 className="text-sm font-[1000] uppercase tracking-wider leading-none">
                                        Términos y Condiciones
                                    </h2>
                                    <p className="text-[8.5px] font-bold uppercase tracking-widest mt-1 text-[#4a3d6a]">
                                        ShopDigital VIP S.A. · Documento Legal
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => { playNeonClick(); setShowTermsModal(false); }}
                                className="p-2 rounded-full transition-all active:scale-95 bg-black/5 hover:bg-black/10 text-[#2c2440] border-none cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Cuerpo Escroleable de Términos */}
                        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-left">
                            <div className="p-3.5 rounded-2xl border text-center bg-amber-500/10 border-amber-500/30 text-[#5c4033]">
                                <p className="text-[9px] font-extrabold uppercase tracking-widest leading-relaxed">
                                    Este documento establece los términos y condiciones vinculantes para el uso de la Red Nacional ShopDigital.
                                </p>
                            </div>

                            {[
                                {
                                    title: "1. Aceptación de los Términos",
                                    content: "Al acceder y utilizar la plataforma ShopDigital (en adelante, la 'Plataforma'), usted acepta estar sujeto a estos Términos y Condiciones, así como a todas las leyes y regulaciones aplicables en la República Argentina."
                                },
                                {
                                    title: "2. Descripción del Servicio",
                                    content: "ShopDigital es una red digital hiperlocal que conecta comercios locales con usuarios finales, facilitando catálogo de ofertas, fidelización B2C/B2B y gestión multizona."
                                },
                                {
                                    title: "3. Cuentas de Usuarios y Comercios",
                                    content: "Los comerciantes y usuarios son responsables de salvaguardar sus credenciales y de cualquier actividad en su cuenta. ShopDigital se reserva el derecho de denegar acceso o suspender cuentas por mal uso de la red."
                                },
                                {
                                    title: "4. Privacidad y Protección de Datos",
                                    content: "Los datos personales se procesan estrictamente bajo la Ley 25.326 de Protección de Datos Personales. No compartimos información personal con terceros ajenos a la operación de la red."
                                },
                                {
                                    title: "5. Pagos y Pasarelas Comerciales",
                                    content: "Las transacciones de suscripción e interacción comercial se realizan mediante pasarelas de pago homologadas (Mercado Pago, Stripe). ShopDigital no almacena números completos de tarjetas bancarias."
                                },
                                {
                                    title: "6. Propiedad Intelectual",
                                    content: "Todos los logos, diseños neumórficos, marcas y tecnología conversacional Ari están protegidos por las leyes de propiedad intelectual en la República Argentina."
                                },
                                {
                                    title: "7. Exención de Responsabilidad",
                                    content: "ShopDigital opera como facilitador tecnológico entre comercio y cliente final, manteniendo altos estándares de disponibilidad y seguridad."
                                },
                                {
                                    title: "8. Modificaciones",
                                    content: "Nos reservamos el derecho de actualizar estos términos periódicamente para acompañar el crecimiento de la red en todo el país."
                                }
                            ].map((sec, idx) => (
                                <div key={idx} className="space-y-1.5">
                                    <h3 className="text-[11px] font-black uppercase tracking-wider text-[#2c2440]">
                                        {sec.title}
                                    </h3>
                                    <p className="text-[10px] leading-relaxed font-medium text-justify text-[#4a3d6a]">
                                        {sec.content}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Footer del Modal */}
                        <div className="p-4 sm:p-5 border-t text-center bg-[#f0ece6] border-[#b4a594]/30">
                            <button
                                onClick={() => { playNeonClick(); setShowTermsModal(false); }}
                                className="w-full py-3.5 rounded-2xl font-black uppercase tracking-widest text-[9.5px] active:scale-95 transition-all shadow-lg bg-[#2c2440] text-white hover:bg-[#1a1528] border-none cursor-pointer"
                            >
                                Entendido y Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GlobalHomePage;
