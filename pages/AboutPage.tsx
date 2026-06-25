import React, { useEffect, useState, useRef } from 'react';
import { 
    Shield, 
    BarChart3, 
    Handshake, 
    Share2, 
    ChevronRight, 
    Sparkles,
    Lock,
    Smartphone,
    UserCheck,
    ArrowLeft,
    Users,
    Building2,
    Store,
    Flame,
    CheckCircle2,
    Moon,
    Sun,
    AlertCircle,
    Send,
    MessageSquare
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { playNeonClick } from '../utils/audio';
import { AriMerchantAssistant } from '../components/AriMerchantAssistant';

// Custom hook to trigger scroll reveals on scroll
const useScrollReveal = () => {
    const [revealed, setRevealed] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setRevealed(true);
                    observer.unobserve(entry.target);
                }
            },
            { threshold: 0.1 }
        );
        if (ref.current) {
            observer.observe(ref.current);
        }
        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        };
    }, []);

    return [ref, revealed] as const;
};

interface RevealSectionProps {
    children: React.ReactNode;
    className?: string;
    id?: string;
}

const RevealSection: React.FC<RevealSectionProps> = ({ children, className = '', id }) => {
    const [ref, revealed] = useScrollReveal();
    return (
        <div
            id={id}
            ref={ref}
            className={`transition-all duration-1000 transform ${
                revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            } ${className}`}
        >
            {children}
        </div>
    );
};

const AboutPage: React.FC = () => {
    const { townId = 'esteban-echeverria' } = useParams<{ townId: string }>();
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    
    // Theme dual state: read from local storage or default to night
    const [isDayMode, setIsDayMode] = useState<boolean>(() => {
        const saved = localStorage.getItem('global_home_theme_mode');
        return saved === 'light';
    });

    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Form states
    const [localName, setLocalName] = useState('');
    const [specialty, setSpecialty] = useState('');
    const [whatsapp, setWhatsapp] = useState('');

    const toggleTheme = () => {
        playNeonClick();
        const nextMode = !isDayMode;
        setIsDayMode(nextMode);
        localStorage.setItem('global_home_theme_mode', nextMode ? 'light' : 'dark');
    };

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        setScrolled(e.currentTarget.scrollTop > 20);
    };

    const handleShare = () => {
        playNeonClick();
        const shareUrl = window.location.origin + `/nosotros`;
        const shareText = '¡Conocé ShopDigital.ar! La red comercial de digitalización hiperlocal. Sumate y potenciá tu negocio. 🚀\n\n👉 ' + shareUrl;

        if (navigator.share) {
            navigator.share({ title: 'ShopDigital.ar', text: shareText, url: shareUrl }).catch(console.error);
        } else {
            window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
        }
    };

    // Form submission handlers to WhatsApp
    const handleSolicitarVisita = (e: React.FormEvent) => {
        e.preventDefault();
        playNeonClick();
        if (!localName || !whatsapp) {
            alert('Por favor, ingresá al menos el Nombre del Local y tu WhatsApp de contacto.');
            return;
        }
        const message = `Hola ShopDigital, me gustaría solicitar la visita de un Embajador de Zona a mi local:\n\n🏪 Local: ${localName}\n🛍️ Rubro: ${specialty || 'No especificado'}\n📱 WhatsApp: ${whatsapp}\n\nQuiero sumarme a la red comercial.`;
        window.open(`https://wa.me/5491140607059?text=${encodeURIComponent(message)}`, '_blank');
    };

    const handleHablarAsesor = () => {
        playNeonClick();
        const message = `Hola ShopDigital, me interesa sumarme a la red y me gustaría hablar con un asesor comercial.`;
        window.open(`https://wa.me/5491140607059?text=${encodeURIComponent(message)}`, '_blank');
    };

    const handleScrollToContact = () => {
        playNeonClick();
        const contactSection = document.getElementById('contacto');
        if (contactSection) {
            contactSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // Ari Context for institutional page
    const ariContextShop = {
        id: 'ari-global',
        name: 'ShopDigital.ar',
        category: 'Red Comercial',
        slug: 'shopdigital',
        address: 'Argentina',
        phone: '1140607059',
        description: 'Red Comercial Digital de Argentina',
        rating: 5,
        isActive: true,
        offers: [],
        visits: 0,
        subscribers: 0,
        tags: [],
    } as any;

    return (
        <div 
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className={`h-screen w-full flex flex-col justify-start relative overflow-y-auto pb-12 transition-colors duration-700 font-sans selection:bg-cyan-500/20 scroll-smooth ${
                isDayMode ? 'bg-[#cda488] text-[#2d1e15]' : 'bg-[#050505] text-white dark'
            }`}
        >
            {/* Background Grid Accent */}
            <div className="fixed inset-0 pointer-events-none z-0">
                {isDayMode ? (
                    <>
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(45,30,21,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(45,30,21,0.02)_1px,transparent_1px)] bg-[size:32px_32px]" />
                        <div className="absolute top-1/4 left-[-10%] w-[60%] h-[40%] bg-white/15 rounded-full blur-[120px]" />
                    </>
                ) : (
                    <>
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:32px_32px]" />
                        <div className="absolute top-1/4 right-[-10%] w-[50%] h-[40%] bg-cyan-950/20 rounded-full blur-[150px] animate-pulse" />
                        <div className="absolute bottom-1/4 left-[-10%] w-[50%] h-[40%] bg-indigo-950/20 rounded-full blur-[150px]" />
                    </>
                )}
            </div>

            {/* STICKY HEADER (Logo Generic + Back + Theme Switcher) */}
            <nav className={`fixed top-0 z-50 w-full transition-all duration-500 border-b ${
                scrolled 
                    ? isDayMode 
                        ? 'bg-[#faf8f5]/95 backdrop-blur-xl border-[#855b3c]/20 py-2 shadow-md' 
                        : 'bg-[#050505]/95 backdrop-blur-xl border-white/15 py-2 shadow-[0_4px_30px_rgba(0,0,0,0.8)] shadow-cyan-950/10'
                    : isDayMode 
                        ? 'bg-[#faf8f5] border-[#855b3c]/10 py-3.5' 
                        : 'bg-[#050505] border-white/5 py-3.5'
            }`}>
                <div className="px-4 flex items-center justify-between w-full max-w-lg mx-auto">
                    <button 
                        onClick={() => { playNeonClick(); navigate(`/${townId}/home`); }}
                        className={`p-2.5 rounded-xl transition-all active:translate-y-[2px] ${
                            isDayMode 
                                ? 'hover:bg-slate-200 text-[#2d1e15]' 
                                : 'hover:bg-white/5 text-white'
                        }`}
                    >
                        <ArrowLeft size={18} />
                    </button>
                    
                    {/* Pulsing Dot Logo */}
                    <div className="flex items-center gap-1.5 select-none cursor-pointer" onClick={() => navigate(`/${townId}/home`)}>
                        <span className={`text-[19px] font-[1000] tracking-tighter uppercase leading-none ${
                            isDayMode ? 'text-[#2d1e15]' : 'text-white'
                        }`}>
                            ShopDigital
                        </span>
                        <span className="text-[19px] font-[1000] leading-none text-sky-500">.ar</span>
                        <span className="w-2 h-2 rounded-full bg-[#10b981] shadow-[0_0_8px_#10b981] animate-ping ml-0.5" />
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Theme Toggle Button */}
                        <button
                            onClick={toggleTheme}
                            aria-label="Alternar modo de color"
                            className={`p-2 rounded-xl border transition-all active:scale-95 ${
                                isDayMode 
                                    ? 'bg-slate-100 hover:bg-slate-200 border-[#855b3c]/20 text-[#2d1e15]' 
                                    : 'bg-white/5 hover:bg-white/10 border-white/10 text-amber-400'
                            }`}
                        >
                            {isDayMode ? <Moon size={16} /> : <Sun size={16} />}
                        </button>
                    </div>
                </div>
            </nav>

            <main className="relative z-10 flex flex-col items-center w-full max-w-lg mx-auto pt-20 px-4">
                
                {/* IN-PAGE NAV BAR (Inicio | Problema | Ecosistema | Contacto) */}
                <div className={`w-full mt-4 flex items-center justify-between px-2 py-1.5 rounded-2xl border text-[10px] font-black uppercase tracking-wider transition-colors duration-500 ${
                    isDayMode 
                        ? 'bg-[#faf8f5]/80 backdrop-blur-md border-[#855b3c]/20 text-[#2d1e15]' 
                        : 'bg-white/5 backdrop-blur-md border-white/10 text-slate-350'
                }`}>
                    <a href="#inicio" className="flex-1 text-center py-1.5 hover:text-sky-500 transition-colors">Inicio</a>
                    <span className="opacity-20">|</span>
                    <a href="#problema" className="flex-1 text-center py-1.5 hover:text-sky-500 transition-colors">El Problema</a>
                    <span className="opacity-20">|</span>
                    <a href="#ecosistema" className="flex-1 text-center py-1.5 hover:text-sky-500 transition-colors">Ecosistema</a>
                    <span className="opacity-20">|</span>
                    <a href="#contacto" className="flex-1 text-center py-1.5 hover:text-sky-500 transition-colors">Contacto</a>
                </div>

                {/* ============================================ */}
                {/* SECCIÓN 1: INICIO (Impacto Visual y Promesa) */}
                {/* ============================================ */}
                <RevealSection id="inicio" className="w-full mt-6">
                    <div className={`border border-b-[6px] p-6 rounded-[2.5rem] shadow-lg flex flex-col items-center gap-5 text-center relative overflow-hidden transition-all duration-700 ${
                        isDayMode 
                            ? 'bg-[#faf8f5] border-slate-200 border-b-[#855b3c]' 
                            : 'bg-[#0e1726]/40 backdrop-blur-xl border-cyan-500/20 border-b-cyan-500 shadow-cyan-950/20'
                    }`}>
                        {/* Status chip */}
                        <div className={`absolute top-0 right-0 text-[7px] font-[1000] uppercase tracking-[0.25em] px-4 py-1.5 rounded-bl-2xl transition-colors duration-500 ${
                            isDayMode ? 'bg-[#2d1e15] text-[#faf8f5]' : 'bg-cyan-500 text-black'
                        }`}>
                            Zonas Activas ⚡
                        </div>

                        {/* Dialogue Balloon with Assistant Ari */}
                        <div className="relative w-36 h-36 flex-shrink-0 animate-bounce-slow mt-4">
                            <div className="absolute inset-0 rounded-full bg-sky-400/10 blur-xl animate-pulse" />
                            <img 
                                src="/ari-pointing.png" 
                                alt="Asistente Ari" 
                                className="w-full h-full object-contain relative z-10"
                            />
                        </div>

                        <div className={`rounded-3xl p-4.5 relative max-w-[95%] border transition-colors duration-500 ${
                            isDayMode 
                                ? 'bg-[#2d1e15] text-[#faf8f5] border-[#855b3c]' 
                                : 'bg-[#15233c] text-white border-cyan-500/30'
                        }`}>
                            <div className={`absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 border-t border-l transition-colors duration-500 ${
                                isDayMode ? 'bg-[#2d1e15] border-[#855b3c]' : 'bg-[#15233c] border-cyan-500/30'
                            }`} />
                            <p className="text-[11.5px] leading-relaxed font-bold tracking-tight">
                                "¡Hola! Soy <strong className="text-sky-400">Ari</strong>, tu asistente de **ShopDigital.ar**. Te presento las llaves digitales para prender el motor comercial e inversor de tu región."
                            </p>
                        </div>

                        {/* H1 Title & Subtitle */}
                        <div className="mt-2 space-y-3">
                            <h1 className="text-[25px] font-[1100] tracking-tighter leading-[1.1] uppercase">
                                Tu comercio merece <br />
                                tecnología de nivel mundial en el <br />
                                <span className={isDayMode ? 'text-[#855b3c]' : 'text-cyan-400 text-shadow-neon'}>
                                    corazón de tu ciudad
                                </span>
                            </h1>
                            <p className={`text-[12px] leading-relaxed font-medium transition-colors duration-500 ${
                                isDayMode ? 'text-slate-650' : 'text-slate-300'
                            }`}>
                                Digitalizamos tu catálogo y te conectamos con miles de vecinos en segundos. No te quedes afuera de la red que está encendiendo la zona.
                            </p>
                        </div>

                        {/* CTA Tactile 3D Button */}
                        <button
                            onClick={handleScrollToContact}
                            className={`w-full py-4 rounded-2xl font-[1100] text-[10.5px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 btn-3d-celeste`}
                        >
                            <Flame size={16} className="animate-pulse" />
                            Quiero Sumar Mi Comercio
                        </button>
                    </div>
                </RevealSection>

                {/* ============================================ */}
                {/* SECCIÓN 2: EL PROBLEMA Y QUIÉNES SOMOS      */}
                {/* ============================================ */}
                <RevealSection id="problema" className="w-full mt-6">
                    <div className={`border border-b-[6px] p-6 rounded-[2.5rem] shadow-lg space-y-5 transition-all duration-700 ${
                        isDayMode 
                            ? 'bg-[#faf8f5] border-slate-200 border-b-[#855b3c]' 
                            : 'bg-[#0e1726]/40 backdrop-blur-xl border-cyan-500/20 border-b-cyan-500 shadow-cyan-950/20'
                    }`}>
                        <div className="flex items-center gap-2">
                            <div className={`p-2.5 rounded-xl ${
                                isDayMode ? 'bg-red-50 text-red-500 border border-red-200/50' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}>
                                <AlertCircle size={18} />
                            </div>
                            <h2 className="text-lg font-[1000] uppercase tracking-tight">
                                ¿Tu negocio sigue siendo invisible?
                            </h2>
                        </div>

                        {/* Pain point info block */}
                        <div className={`p-4 rounded-2xl border transition-colors duration-500 ${
                            isDayMode 
                                ? 'bg-red-50/50 border-red-100' 
                                : 'bg-red-950/15 border-red-500/10'
                        }`}>
                            <h3 className="text-[11px] font-[1000] uppercase text-red-500 tracking-wider mb-1.5 flex items-center gap-1">
                                El Dolor Comercial
                            </h3>
                            <p className={`text-[11.5px] leading-relaxed font-medium transition-colors duration-500 ${
                                isDayMode ? 'text-[#3d2c20]' : 'text-slate-300'
                            }`}>
                                El **80% de tus vecinos** deciden qué comprar desde su celular antes de salir de casa. Mientras vos esperás que alguien entre al local, tus vecinos están comprando por el celular. Si no tenés un catálogo digital actualizado, **estás perdiendo ventas cada hora** frente al local de al lado.
                            </p>
                        </div>

                        {/* Solution / Identity info block */}
                        <div className={`p-4 rounded-2xl border transition-colors duration-500 ${
                            isDayMode 
                                ? 'bg-sky-50/50 border-sky-100' 
                                : 'bg-sky-950/15 border-cyan-500/10'
                        }`}>
                            <h3 className="text-[11px] font-[1000] uppercase text-sky-500 tracking-wider mb-1.5 flex items-center gap-1">
                                Nuestra Identidad
                            </h3>
                            <p className={`text-[11.5px] leading-relaxed font-medium transition-colors duration-500 ${
                                isDayMode ? 'text-[#3d2c20]' : 'text-slate-300'
                            }`}>
                                **ShopDigital.ar** no es un directorio más; somos el **sistema operativo** de tu región. Llevamos tu negocio al bolsillo de todos tus clientes, uniendo la tecnología de Inteligencia Artificial con la confianza del trato humano.
                            </p>
                        </div>
                    </div>
                </RevealSection>

                {/* ============================================ */}
                {/* SECCIÓN 3: NUESTRO ECOSISTEMA (4 Tarjetas)  */}
                {/* ============================================ */}
                <RevealSection id="ecosistema" className="w-full mt-6">
                    <div className="space-y-4">
                        <div className="text-center py-2">
                            <span className="text-[9px] font-black uppercase tracking-widest text-sky-500">
                                Mucho más que una Web
                            </span>
                            <h2 className="text-xl font-[1100] uppercase tracking-tight mt-1">
                                Nuestro Ecosistema de Beneficios
                            </h2>
                        </div>

                        {/* Card 1: Catálogo Inteligente */}
                        <div className={`border border-b-[6px] p-5 rounded-[2rem] shadow-md flex items-start gap-4 transition-all duration-700 ${
                            isDayMode 
                                ? 'bg-[#faf8f5] border-slate-200 border-b-[#855b3c]' 
                                : 'bg-[#0e1726]/40 backdrop-blur-xl border-cyan-500/20 border-b-cyan-500 shadow-cyan-950/20'
                        }`}>
                            <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center flex-shrink-0 transition-colors duration-500 ${
                                isDayMode ? 'bg-sky-50 border-sky-200 text-sky-600' : 'bg-sky-500/10 border-sky-500/25 text-cyan-400'
                            }`}>
                                <Store size={20} />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-[12.5px] font-[1000] uppercase tracking-wider">Catálogo Inteligente 24/7</h3>
                                <p className={`text-[11.5px] leading-relaxed transition-colors duration-500 ${
                                    isDayMode ? 'text-slate-600 font-medium' : 'text-slate-350'
                                }`}>
                                    Subí tus productos y ofertas en segundos. Sin intermediarios, sin demoras. Tu vidriera abierta las 24hs y autogestionable.
                                </p>
                            </div>
                        </div>

                        {/* Card 2: Seguridad y Validación VIP */}
                        <div className={`border border-b-[6px] p-5 rounded-[2rem] shadow-md flex items-start gap-4 transition-all duration-700 ${
                            isDayMode 
                                ? 'bg-[#faf8f5] border-slate-200 border-b-[#855b3c]' 
                                : 'bg-[#0e1726]/40 backdrop-blur-xl border-cyan-500/20 border-b-cyan-500 shadow-cyan-950/20'
                        }`}>
                            <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center flex-shrink-0 transition-colors duration-500 ${
                                isDayMode ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
                            }`}>
                                <Shield size={20} />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-[12.5px] font-[1000] uppercase tracking-wider">Seguridad y Validación VIP</h3>
                                <p className={`text-[11.5px] leading-relaxed transition-colors duration-500 ${
                                    isDayMode ? 'text-slate-600 font-medium' : 'text-slate-350'
                                }`}>
                                    Protocolos de validación únicos. Entregamos credenciales digitales con reloj en tiempo real y sello técnico, imposibles de falsificar, garantizando que solo tus clientes reales accedan a los beneficios.
                                </p>
                            </div>
                        </div>

                        {/* Card 3: Club B2B */}
                        <div className={`border border-b-[6px] p-5 rounded-[2rem] shadow-md flex items-start gap-4 transition-all duration-700 ${
                            isDayMode 
                                ? 'bg-[#faf8f5] border-slate-200 border-b-[#855b3c]' 
                                : 'bg-[#0e1726]/40 backdrop-blur-xl border-cyan-500/20 border-b-cyan-500 shadow-cyan-950/20'
                        }`}>
                            <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center flex-shrink-0 transition-colors duration-500 ${
                                isDayMode ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-amber-500/10 border-amber-500/25 text-amber-400'
                            }`}>
                                <Building2 size={20} />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-[12.5px] font-[1000] uppercase tracking-wider">Club B2B (Economía Circular)</h3>
                                <p className={`text-[11.5px] leading-relaxed transition-colors duration-500 ${
                                    isDayMode ? 'text-slate-600 font-medium' : 'text-slate-350'
                                }`}>
                                    Formá parte de la comunidad. Ahorrá en insumos, servicios y logística con descuentos exclusivos de comerciante a comerciante. Recuperá tu inversión ahorrando.
                                </p>
                            </div>
                        </div>

                        {/* Card 4: Fidelización con IA */}
                        <div className={`border border-b-[6px] p-5 rounded-[2rem] shadow-md flex items-start gap-4 transition-all duration-700 ${
                            isDayMode 
                                ? 'bg-[#faf8f5] border-slate-200 border-b-[#855b3c]' 
                                : 'bg-[#0e1726]/40 backdrop-blur-xl border-cyan-500/20 border-b-cyan-500 shadow-cyan-950/20'
                        }`}>
                            <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center flex-shrink-0 transition-colors duration-500 ${
                                isDayMode ? 'bg-purple-50 border-purple-200 text-purple-600' : 'bg-purple-500/10 border-purple-500/25 text-purple-400'
                            }`}>
                                <Sparkles size={20} />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-[12.5px] font-[1000] uppercase tracking-wider">Fidelización con IA</h3>
                                <p className={`text-[11.5px] leading-relaxed transition-colors duration-500 ${
                                    isDayMode ? 'text-slate-600 font-medium' : 'text-slate-350'
                                }`}>
                                    Tu asistente de Inteligencia Artificial responde por vos y tus clientes reciben alertas de tus ofertas directamente en su celular. Creamos lealtad para que vuelvan siempre a vos.
                                </p>
                            </div>
                        </div>
                    </div>
                </RevealSection>

                {/* ============================================ */}
                {/* SECCIÓN 4: CÓMO FUNCIONA                    */}
                {/* ============================================ */}
                <RevealSection id="como-funciona" className="w-full mt-6">
                    <div className={`border border-b-[6px] p-6 rounded-[2.5rem] shadow-lg space-y-6 transition-all duration-700 ${
                        isDayMode 
                            ? 'bg-[#faf8f5] border-slate-200 border-b-[#855b3c]' 
                            : 'bg-[#0e1726]/40 backdrop-blur-xl border-cyan-500/20 border-b-cyan-500 shadow-cyan-950/20'
                    }`}>
                        <div className="text-center py-1">
                            <span className="text-[9px] font-black uppercase tracking-widest text-[#0ea5e9]">
                                En 3 simples pasos
                            </span>
                            <h2 className="text-xl font-[1100] uppercase tracking-tight mt-0.5">
                                Ingresar a la red es simple
                            </h2>
                        </div>

                        <div className="space-y-5 relative pl-4 border-l-2 border-dashed border-cyan-500/30">
                            {/* Step 1 */}
                            <div className="relative">
                                <div className="absolute -left-[27px] top-0 w-5 h-5 rounded-full bg-cyan-500 border-2 border-white flex items-center justify-center text-[9px] font-bold text-black">
                                    1
                                </div>
                                <h3 className="text-[12.5px] font-[1000] uppercase tracking-wider leading-none">Paso 1: Suscripción</h3>
                                <p className={`text-[11px] leading-relaxed mt-1.5 transition-colors duration-500 ${
                                    isDayMode ? 'text-slate-650 font-medium' : 'text-slate-300'
                                }`}>
                                    Completás tus datos básicos en el formulario digital en menos de 30 segundos.
                                </p>
                            </div>

                            {/* Step 2 */}
                            <div className="relative">
                                <div className="absolute -left-[27px] top-0 w-5 h-5 rounded-full bg-cyan-500 border-2 border-white flex items-center justify-center text-[9px] font-bold text-black">
                                    2
                                </div>
                                <h3 className="text-[12.5px] font-[1000] uppercase tracking-wider leading-none">Paso 2: Verificación</h3>
                                <p className={`text-[11px] leading-relaxed mt-1.5 transition-colors duration-500 ${
                                    isDayMode ? 'text-slate-650 font-medium' : 'text-slate-300'
                                }`}>
                                    Un **Embajador de Zona** visita físicamente tu local para validar tu identidad, explicarte el funcionamiento y entregarte la gráfica de ShopDigital Oficial.
                                </p>
                            </div>

                            {/* Step 3 */}
                            <div className="relative">
                                <div className="absolute -left-[27px] top-0 w-5 h-5 rounded-full bg-[#10b981] border-2 border-white flex items-center justify-center text-[9px] font-bold text-white shadow-[0_0_8px_#10b981]">
                                    3
                                </div>
                                <h3 className="text-[12.5px] font-[1000] uppercase tracking-wider leading-none text-emerald-500">Paso 3: Activación</h3>
                                <p className={`text-[11px] leading-relaxed mt-1.5 transition-colors duration-500 ${
                                    isDayMode ? 'text-slate-650 font-medium' : 'text-slate-300'
                                }`}>
                                    Recibís tus llaves digitales, tu credencial del Club y tu comercio se enciende en el mapa interactivo de ShopDigital.
                                </p>
                            </div>
                        </div>
                    </div>
                </RevealSection>

                {/* ============================================ */}
                {/* SECCIÓN 5: CIERRE Y CONTACTO                */}
                {/* ============================================ */}
                <RevealSection id="contacto" className="w-full mt-6 mb-6">
                    <div className={`border border-b-[6px] p-6 rounded-[2.5rem] shadow-lg space-y-5 transition-all duration-700 ${
                        isDayMode 
                            ? 'bg-[#faf8f5] border-slate-200 border-b-[#855b3c]' 
                            : 'bg-[#0e1726]/40 backdrop-blur-xl border-cyan-500/20 border-b-cyan-500 shadow-cyan-950/20'
                    }`}>
                        <div className="text-center space-y-1">
                            <span className="text-[9px] font-black uppercase tracking-widest text-amber-500">
                                Lanzamiento Estratégico
                            </span>
                            <h2 className="text-xl font-[1100] uppercase tracking-tight">
                                ¿Listo para ser el referente de tu zona?
                            </h2>
                        </div>

                        <p className={`text-[11.5px] leading-relaxed text-center font-medium transition-colors duration-500 ${
                            isDayMode ? 'text-slate-700' : 'text-slate-300'
                        }`}>
                            Estamos encendiendo nuevas zonas todos los días. Solo aceptamos **cupos limitados por rubro** en esta etapa de lanzamiento estratégico para garantizar tu exclusividad. No dejes que tu competencia ocupe tu lugar.
                        </p>

                        {/* WhatsApp Lead Form */}
                        <form onSubmit={handleSolicitarVisita} className="space-y-4 pt-2">
                            {/* Input: Local Name */}
                            <div className="space-y-1">
                                <label className="text-[9.5px] font-[1000] uppercase tracking-wider block">
                                    Nombre del Local *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={localName}
                                    onChange={(e) => setLocalName(e.target.value)}
                                    placeholder="Ej: Pizzería Lo de Waly"
                                    className={`w-full px-4 py-3 rounded-xl text-[12px] font-medium border outline-none transition-colors duration-300 ${
                                        isDayMode 
                                            ? 'bg-white border-slate-200 focus:border-[#855b3c] text-[#2d1e15]' 
                                            : 'bg-black/35 border-white/10 focus:border-cyan-500 text-white'
                                    }`}
                                />
                            </div>

                            {/* Input: Rubro/Specialty */}
                            <div className="space-y-1">
                                <label className="text-[9.5px] font-[1000] uppercase tracking-wider block">
                                    Rubro del Comercio
                                </label>
                                <input
                                    type="text"
                                    value={specialty}
                                    onChange={(e) => setSpecialty(e.target.value)}
                                    placeholder="Ej: Pizzería, Heladería, Vestimenta"
                                    className={`w-full px-4 py-3 rounded-xl text-[12px] font-medium border outline-none transition-colors duration-300 ${
                                        isDayMode 
                                            ? 'bg-white border-slate-200 focus:border-[#855b3c] text-[#2d1e15]' 
                                            : 'bg-black/35 border-white/10 focus:border-cyan-500 text-white'
                                    }`}
                                />
                            </div>

                            {/* Input: WhatsApp */}
                            <div className="space-y-1">
                                <label className="text-[9.5px] font-[1000] uppercase tracking-wider block">
                                    WhatsApp de Contacto *
                                </label>
                                <input
                                    type="tel"
                                    required
                                    value={whatsapp}
                                    onChange={(e) => setWhatsapp(e.target.value)}
                                    placeholder="Ej: 1140607059"
                                    className={`w-full px-4 py-3 rounded-xl text-[12px] font-medium border outline-none transition-colors duration-300 ${
                                        isDayMode 
                                            ? 'bg-white border-slate-200 focus:border-[#855b3c] text-[#2d1e15]' 
                                            : 'bg-black/35 border-white/10 focus:border-cyan-500 text-white'
                                    }`}
                                />
                            </div>

                            {/* Button 1: Solicitar Visita (3D Celeste) */}
                            <button
                                type="submit"
                                className="w-full py-4 text-[10px] font-[1100] uppercase tracking-[0.2em] btn-3d-celeste flex items-center justify-center gap-2 mt-2"
                            >
                                <UserCheck size={16} />
                                Solicitar Visita Del Embajador
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="flex items-center my-3">
                            <div className="flex-1 h-[1px] bg-slate-300/35" />
                            <span className="px-3 text-[9px] font-black uppercase tracking-widest opacity-40">O</span>
                            <div className="flex-1 h-[1px] bg-slate-300/35" />
                        </div>

                        {/* Button 2: Hablar con un Asesor (3D Tactile secondary) */}
                        <button
                            onClick={handleHablarAsesor}
                            className={`w-full py-4 text-[10px] font-[1100] uppercase tracking-[0.2em] border border-slate-200 border-b-[5px] rounded-2xl active:translate-y-[4px] active:border-b-0 transition-all flex items-center justify-center gap-2 shadow-sm ${
                                isDayMode 
                                    ? 'bg-[#cda488]/20 hover:bg-[#cda488]/30 border-[#855b3c]/20 text-[#2d1e15] border-b-[#855b3c]' 
                                    : 'bg-indigo-950/20 hover:bg-indigo-950/30 border-indigo-500/20 text-indigo-300 border-b-indigo-600 shadow-[0_0_15px_rgba(99,102,241,0.15)]'
                            }`}
                        >
                            <MessageSquare size={16} />
                            Hablar con un Asesor
                        </button>
                    </div>
                </RevealSection>
            </main>

            {/* PIE DE PÁGINA (Footer) */}
            <footer className={`w-full flex flex-col items-center gap-3 pt-8 pb-8 border-t relative z-10 bg-black/10 backdrop-blur-sm mt-auto max-w-lg mx-auto ${
                isDayMode ? 'border-[#855b3c]/20' : 'border-white/5'
            }`}>
                <div 
                    onClick={() => { playNeonClick(); navigate(`/${townId}/home`); }}
                    className="flex items-center gap-1 select-none cursor-pointer hover:opacity-90 transition-opacity"
                >
                    <span className="text-[20px] font-[1000] tracking-tighter uppercase text-white leading-none">
                        ShopDigital
                    </span>
                    <span className="text-[20px] font-[1000] leading-none text-sky-400">.ar</span>
                </div>
                
                {/* Secondary navigation for Footer */}
                <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-wider text-white/60">
                    <button onClick={() => { playNeonClick(); navigate(`/terminos`); }} className="hover:text-white transition-colors">Términos y Condiciones</button>
                    <span>·</span>
                    <button onClick={handleShare} className="hover:text-white transition-colors">Compartir Red</button>
                </div>

                <div className="flex flex-col items-center gap-1 mt-1 text-center">
                    <p className="text-[9px] font-black text-white/80 uppercase tracking-[0.3em] select-none">
                        © 2026 · ShopDigital
                    </p>
                    <p className="text-[7.5px] font-bold text-white/40 uppercase tracking-[0.2em]">
                        Infraestructura de Comercio Local Verificado
                    </p>
                </div>
            </footer>

            {/* Floating Ari Assistant Bubble */}
            <AriMerchantAssistant 
                shop={ariContextShop} 
                role="baquiana" 
                townId="esteban-echeverria"
                isDayMode={isDayMode}
                globalConfig={{}}
            />
        </div>
    );
};

export default AboutPage;
