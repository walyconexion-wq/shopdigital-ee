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
    TrendingUp,
    Store,
    Users,
    Zap,
    HelpCircle,
    Moon,
    Sun,
    AlertCircle,
    CheckCircle2,
    Flame,
    ArrowDown,
    MessageSquare
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { playNeonClick } from '../utils/audio';
import { AriMerchantAssistant } from '../components/AriMerchantAssistant';
import { guardarRelevamiento } from '../firebase';

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

const MerchantLandingPage: React.FC = () => {
    const { townId = 'esteban-echeverria' } = useParams<{ townId: string }>();
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Theme state - synchronized with global_home_theme_mode
    const [isDayMode, setIsDayMode] = useState<boolean>(() => {
        const saved = localStorage.getItem('global_home_theme_mode');
        return saved === 'light';
    });

    // Form states
    const [localName, setLocalName] = useState('');
    const [specialty, setSpecialty] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [loading, setLoading] = useState(false);

    const toggleTheme = () => {
        playNeonClick();
        const nextMode = !isDayMode;
        setIsDayMode(nextMode);
        localStorage.setItem('global_home_theme_mode', nextMode ? 'light' : 'dark');
    };

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        setScrolled(e.currentTarget.scrollTop > 20);
    };

    const handleScrollToForm = () => {
        playNeonClick();
        const formSection = document.getElementById('suscripcion');
        if (formSection) {
            formSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleShare = () => {
        playNeonClick();
        const shareUrl = window.location.origin + `/vender`;
        const shareText = '¡Potenciá tu comercio local con ShopDigital! Sumate y aparecé en el celular de tus vecinos sin pagar comisiones. 🚀\n\n👉 ' + shareUrl;

        if (navigator.share) {
            navigator.share({ title: 'ShopDigital Comercios', text: shareText, url: shareUrl }).catch(console.error);
        } else {
            window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
        }
    };

    // Firebase Lead submission + WhatsApp fallback
    const handleSubmitLead = async (e: React.FormEvent) => {
        e.preventDefault();
        playNeonClick();

        if (!localName || !whatsapp) {
            alert('Por favor, completá al menos el Nombre del Local y tu WhatsApp.');
            return;
        }

        setLoading(true);
        try {
            // Pipeline de Relevamiento - Prospecto Pendiente 🛡️
            const leadData = {
                name: localName.trim(),
                category: specialty.trim() || 'General',
                phone: whatsapp.replace(/\D/g, ''),
                townId,
                status: 'pending', // internally 'pending' so it flows to Ambassador Panels
                date: new Date().toISOString(),
                notes: 'Registrado de manera directa desde la Landing B2B /vender',
                origin: 'landing_b2b',
                zone: 'Pendiente de Asignación',
                address: 'Pendiente de Visita',
                contactName: 'Contacto Directo',
                digitalDiagnosis: {
                    interestLevel: 'high',
                    missing: 'Catálogo Digital',
                    observations: 'Solicitó visita del embajador desde la landing.'
                }
            };

            await guardarRelevamiento(leadData, townId);
            
            // Success alert
            alert('¡Tu solicitud de visita fue registrada como Prospecto Pendiente! Un Embajador de Zona te contactará pronto. 🚀');

            // Preformat WhatsApp message for double-channel conversion
            const message = `Hola ShopDigital, acabo de registrar mi comercio desde la landing /vender:\n\n🏪 Local: ${localName}\n🛍️ Rubro: ${specialty || 'General'}\n📱 WhatsApp: ${whatsapp}\n\nQuiero solicitar la visita del Embajador de Zona para activar mi catálogo digital.`;
            window.open(`https://wa.me/5491140607059?text=${encodeURIComponent(message)}`, '_blank');

            // Reset form
            setLocalName('');
            setSpecialty('');
            setWhatsapp('');
        } catch (error) {
            console.error('Error al registrar prospecto:', error);
            alert('Tuvimos un inconveniente al guardar tu solicitud. Intentá nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleAsesorChat = () => {
        playNeonClick();
        const message = 'Hola ShopDigital, me interesa sumarme como comercio y me gustaría hablar con un asesor comercial.';
        window.open(`https://wa.me/5491140607059?text=${encodeURIComponent(message)}`, '_blank');
    };

    const ariContextShop = {
        id: 'ari-global',
        name: 'ShopDigital B2B',
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
            {/* Custom animations & glow styles */}
            <style>{`
                @keyframes pulseGlowCyan {
                    0%, 100% { filter: drop-shadow(0 0 10px rgba(0, 229, 255, 0.4)); }
                    50% { filter: drop-shadow(0 0 25px rgba(0, 229, 255, 0.8)); }
                }
                .glow-cyan-glow {
                    animation: pulseGlowCyan 3s infinite ease-in-out;
                }
                @keyframes bounceSlow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-8px); }
                }
                .animate-bounce-slow {
                    animation: bounceSlow 4s infinite ease-in-out;
                }
            `}</style>

            {/* Background Texture */}
            <div className="fixed inset-0 pointer-events-none z-0">
                {isDayMode ? (
                    <>
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(45,30,21,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(45,30,21,0.02)_1px,transparent_1px)] bg-[size:32px_32px]" />
                        <div className="absolute top-1/4 left-[-10%] w-[60%] h-[40%] bg-white/15 rounded-full blur-[120px]" />
                    </>
                ) : (
                    <>
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:32px_32px]" />
                        <div className="absolute top-1/3 left-[-15%] w-[80%] h-[35%] bg-cyan-950/20 rounded-full blur-[150px] animate-pulse" />
                        <div className="absolute bottom-1/4 right-[-10%] w-[50%] h-[40%] bg-indigo-950/20 rounded-full blur-[150px]" />
                    </>
                )}
            </div>

            {/* STICKY HEADER */}
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
                                    : 'bg-white/5 hover:bg-white/10 border-white/10 text-cyan-400'
                            }`}
                        >
                            {isDayMode ? <Moon size={16} /> : <Sun size={16} />}
                        </button>
                    </div>
                </div>
            </nav>

            <main className="relative z-10 flex flex-col items-center w-full max-w-lg mx-auto pt-20 px-4">
                
                {/* IN-PAGE NAV BAR */}
                <div className={`w-full mt-4 flex items-center justify-between px-2 py-1.5 rounded-2xl border text-[10px] font-black uppercase tracking-wider transition-colors duration-500 ${
                    isDayMode 
                        ? 'bg-[#faf8f5]/80 backdrop-blur-md border-[#855b3c]/20 text-[#2d1e15]' 
                        : 'bg-white/5 backdrop-blur-md border-white/10 text-slate-300'
                }`}>
                    <a href="#inicio" className="flex-1 text-center py-1.5 hover:text-cyan-400 transition-colors">Inicio</a>
                    <span className="opacity-20">|</span>
                    <a href="#el-problema" className="flex-1 text-center py-1.5 hover:text-cyan-400 transition-colors">Dolor</a>
                    <span className="opacity-20">|</span>
                    <a href="#beneficios" className="flex-1 text-center py-1.5 hover:text-cyan-400 transition-colors">Pilares</a>
                    <span className="opacity-20">|</span>
                    <a href="#como-funciona" className="flex-1 text-center py-1.5 hover:text-cyan-400 transition-colors">Proceso</a>
                    <span className="opacity-20">|</span>
                    <a href="#suscripcion" className="flex-1 text-center py-1.5 hover:text-cyan-400 transition-colors">Registro</a>
                </div>

                {/* ============================================ */}
                {/* 1. SECCIÓN HERO: EL IMPACTO Y LA PROMESA     */}
                {/* ============================================ */}
                <RevealSection id="inicio" className="w-full mt-6">
                    <div className={`border border-b-[6px] p-6 rounded-[2.5rem] shadow-lg flex flex-col items-center gap-5 text-center relative overflow-hidden transition-all duration-700 ${
                        isDayMode 
                            ? 'bg-[#faf8f5] border-slate-200 border-b-[#855b3c]' 
                            : 'bg-[#0e1726]/40 backdrop-blur-xl border-cyan-500/20 border-b-cyan-500 shadow-cyan-950/20'
                    }`}>
                        <div className={`absolute top-0 right-0 text-[7px] font-[1000] uppercase tracking-[0.25em] px-4 py-1.5 rounded-bl-2xl transition-colors duration-500 ${
                            isDayMode ? 'bg-[#2d1e15] text-[#faf8f5]' : 'bg-[#00E5FF] text-black font-black shadow-[0_0_10px_#00E5FF]'
                        }`}>
                            COMERCIANTES ⚡
                        </div>

                        {/* Dialogue Balloon with Assistant Ari */}
                        <div className="relative w-36 h-36 flex-shrink-0 animate-bounce-slow mt-4">
                            <div className={`absolute inset-0 rounded-full blur-xl animate-pulse ${
                                isDayMode ? 'bg-sky-400/10' : 'bg-cyan-500/20'
                            }`} />
                            <img 
                                src="/ari-pointing.png" 
                                alt="Asistente Ari" 
                                className="w-full h-full object-contain relative z-10"
                            />
                        </div>

                        <div className={`rounded-3xl p-4 relative max-w-[95%] border transition-colors duration-500 ${
                            isDayMode 
                                ? 'bg-[#2d1e15] text-[#faf8f5] border-[#855b3c]' 
                                : 'bg-[#15233c] text-white border-cyan-500/30 shadow-[inset_0_0_12px_rgba(0,229,255,0.15)]'
                        }`}>
                            <div className={`absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 border-t border-l transition-colors duration-500 ${
                                isDayMode ? 'bg-[#2d1e15] border-[#855b3c]' : 'bg-[#15233c] border-cyan-500/30'
                            }`} />
                            <p className="text-[11.5px] leading-relaxed font-bold tracking-tight">
                                "¡Hola! Soy <strong className="text-cyan-400">Ari</strong>, tu asesora de digitalización. Tu comercio está a punto de dar un salto gigante en tu ciudad."
                            </p>
                        </div>

                        {/* Title & Subtitle */}
                        <div className="mt-2 space-y-3">
                            <h1 className="text-[24px] font-[1100] tracking-tighter leading-[1.1] uppercase">
                                Tu comercio merece <br />
                                tecnología de <span className={isDayMode ? 'text-[#855b3c]' : 'text-cyan-400 text-shadow-neon'}>Silicon Valley</span> <br />
                                en el corazón de tu ciudad
                            </h1>
                            <p className={`text-[12px] leading-relaxed font-medium transition-colors duration-500 ${
                                isDayMode ? 'text-slate-650' : 'text-slate-350'
                            }`}>
                                No seas invisible. Digitalizá tu catálogo y conectá con miles de vecinos que ya están buscando lo que vendés.
                            </p>
                        </div>

                        {/* CTA Tactile 3D Button */}
                        <button
                            onClick={handleScrollToForm}
                            className="w-full py-4 rounded-2xl font-[1100] text-[10.5px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 btn-3d-celeste glow-cyan-glow"
                        >
                            <Flame size={16} className="animate-pulse" />
                            Quiero Digitalizar Mi Negocio Hoy
                        </button>
                    </div>
                </RevealSection>

                {/* ============================================ */}
                {/* 2. SECCIÓN DE DOLOR: CREAR LA NECESIDAD      */}
                {/* ============================================ */}
                <RevealSection id="el-problema" className="w-full mt-6">
                    <div className={`border border-b-[6px] p-6 rounded-[2.5rem] shadow-lg space-y-5 transition-all duration-700 ${
                        isDayMode 
                            ? 'bg-[#faf8f5] border-slate-200 border-b-[#855b3c]' 
                            : 'bg-[#0e1726]/40 backdrop-blur-xl border-cyan-500/20 border-b-cyan-500 shadow-cyan-950/20'
                    }`}>
                        <div className="flex items-center gap-2.5">
                            <div className={`p-2.5 rounded-xl border ${
                                isDayMode 
                                    ? 'bg-red-50 text-red-600 border-red-200/50' 
                                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                            }`}>
                                <AlertCircle size={18} />
                            </div>
                            <h2 className="text-lg font-[1000] uppercase tracking-tight">
                                ¿Sabías que estás perdiendo ventas?
                            </h2>
                        </div>

                        <p className={`text-[12px] leading-relaxed font-medium transition-colors duration-500 ${
                            isDayMode ? 'text-[#3d2c20]' : 'text-slate-300'
                        }`}>
                            El **80% de tus vecinos** deciden qué comprar desde su celular antes de salir de casa. Si no estás en la red, estás perdiendo ventas cada hora frente al local de al lado que ya se digitalizó.
                        </p>

                        <div className="space-y-3 pt-1">
                            {/* Pain point 1 */}
                            <div className={`flex items-start gap-3.5 p-3.5 rounded-2xl border transition-colors duration-500 ${
                                isDayMode ? 'bg-red-50/40 border-red-100' : 'bg-red-950/15 border-red-500/10'
                            }`}>
                                <span className="text-red-500 font-extrabold text-sm mt-0.5">✕</span>
                                <div className="space-y-0.5">
                                    <h4 className="text-[11px] font-[1000] uppercase tracking-wide text-red-500">Vidrieras que nadie mira</h4>
                                    <p className={`text-[10px] leading-normal ${isDayMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                        El tráfico físico de la vereda ya no es suficiente. Si no figurás en las pantallas locales, no existís para los vecinos de tu zona.
                                    </p>
                                </div>
                            </div>

                            {/* Pain point 2 */}
                            <div className={`flex items-start gap-3.5 p-3.5 rounded-2xl border transition-colors duration-500 ${
                                isDayMode ? 'bg-red-50/40 border-red-100' : 'bg-red-950/15 border-red-500/10'
                            }`}>
                                <span className="text-red-500 font-extrabold text-sm mt-0.5">✕</span>
                                <div className="space-y-0.5">
                                    <h4 className="text-[11px] font-[1000] uppercase tracking-wide text-red-500">Falta de contacto directo</h4>
                                    <p className={`text-[10px] leading-normal ${isDayMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                        Los intermediarios o apps de envíos tradicionales devoran tus márgenes con comisiones abusivas de hasta el 30% por transacción.
                                    </p>
                                </div>
                            </div>

                            {/* Pain point 3 */}
                            <div className={`flex items-start gap-3.5 p-3.5 rounded-2xl border transition-colors duration-500 ${
                                isDayMode ? 'bg-red-50/40 border-red-100' : 'bg-red-950/15 border-red-500/10'
                            }`}>
                                <span className="text-red-500 font-extrabold text-sm mt-0.5">✕</span>
                                <div className="space-y-0.5">
                                    <h4 className="text-[11px] font-[1000] uppercase tracking-wide text-red-500">Competencia ya digitalizada</h4>
                                    <p className={`text-[10px] leading-normal ${isDayMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                        Los comercios vecinos que adoptan herramientas móviles capturan la clientela leal y los buscadores activos de tu barrio.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </RevealSection>

                {/* ============================================ */}
                {/* 3. SECCIÓN DE SOLUCIÓN: LOS PILARES          */}
                {/* ============================================ */}
                <RevealSection id="beneficios" className="w-full mt-6">
                    <div className="space-y-4">
                        <div className="text-center py-2">
                            <span className="text-[9px] font-black uppercase tracking-widest text-cyan-400">
                                Tu infraestructura de crecimiento
                            </span>
                            <h2 className="text-xl font-[1100] uppercase tracking-tight mt-1">
                                Los Pilares de ShopDigital
                            </h2>
                        </div>

                        {/* Pilar 1: Catálogo Inteligente */}
                        <div className={`border border-b-[6px] p-5 rounded-[2rem] shadow-md flex items-start gap-4 transition-all duration-700 ${
                            isDayMode 
                                ? 'bg-[#faf8f5] border-slate-200 border-b-[#855b3c]' 
                                : 'bg-[#0e1726]/40 backdrop-blur-xl border-cyan-500/20 border-b-cyan-500 shadow-cyan-950/20'
                        }`}>
                            <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center flex-shrink-0 transition-colors duration-500 ${
                                isDayMode ? 'bg-sky-50 border-sky-200 text-sky-600' : 'bg-cyan-500/10 border-cyan-500/25 text-[#00E5FF] shadow-[0_0_10px_rgba(0,229,255,0.15)]'
                            }`}>
                                <Store size={20} />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-[12.5px] font-[1000] uppercase tracking-wider">Catálogo Inteligente 24/7</h3>
                                <p className={`text-[11.5px] leading-relaxed transition-colors duration-500 ${
                                    isDayMode ? 'text-slate-600 font-medium' : 'text-slate-350'
                                }`}>
                                    Tu vidriera abierta todo el día, sin intermediarios y autogestionable. Editá precios, fotos y ofertas al instante.
                                </p>
                            </div>
                        </div>

                        {/* Pilar 2: Seguridad y Validación VIP */}
                        <div className={`border border-b-[6px] p-5 rounded-[2rem] shadow-md flex items-start gap-4 transition-all duration-700 ${
                            isDayMode 
                                ? 'bg-[#faf8f5] border-slate-200 border-b-[#855b3c]' 
                                : 'bg-[#0e1726]/40 backdrop-blur-xl border-cyan-500/20 border-b-cyan-500 shadow-cyan-950/20'
                        }`}>
                            <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center flex-shrink-0 transition-colors duration-500 ${
                                isDayMode ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400 shadow-[0_0_10px_rgba(34,197,94,0.15)]'
                            }`}>
                                <Shield size={20} />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-[12.5px] font-[1000] uppercase tracking-wider">Seguridad y Validación VIP</h3>
                                <p className={`text-[11.5px] leading-relaxed transition-colors duration-500 ${
                                    isDayMode ? 'text-slate-600 font-medium' : 'text-slate-350'
                                }`}>
                                    Credenciales inviolables con reloj en tiempo real, imposibles de falsificar. Asegura que los descuentos lleguen únicamente a clientes verificados.
                                </p>
                            </div>
                        </div>

                        {/* Pilar 3: Club B2B */}
                        <div className={`border border-b-[6px] p-5 rounded-[2rem] shadow-md flex items-start gap-4 transition-all duration-700 ${
                            isDayMode 
                                ? 'bg-[#faf8f5] border-slate-200 border-b-[#855b3c]' 
                                : 'bg-[#0e1726]/40 backdrop-blur-xl border-cyan-500/20 border-b-cyan-500 shadow-cyan-950/20'
                        }`}>
                            <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center flex-shrink-0 transition-colors duration-500 ${
                                isDayMode ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-amber-500/10 border-amber-500/25 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.15)]'
                            }`}>
                                <Users size={20} />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-[12.5px] font-[1000] uppercase tracking-wider">Club B2B (Economía Circular)</h3>
                                <p className={`text-[11.5px] leading-relaxed transition-colors duration-500 ${
                                    isDayMode ? 'text-slate-600 font-medium' : 'text-slate-350'
                                }`}>
                                    Descuentos exclusivos entre colegas de la red. Ahorrá en la compra de insumos comerciales y recuperá tu inversión cooperativamente.
                                </p>
                            </div>
                        </div>

                        {/* Pilar 4: Fidelización con IA */}
                        <div className={`border border-b-[6px] p-5 rounded-[2rem] shadow-md flex items-start gap-4 transition-all duration-700 ${
                            isDayMode 
                                ? 'bg-[#faf8f5] border-slate-200 border-b-[#855b3c]' 
                                : 'bg-[#0e1726]/40 backdrop-blur-xl border-cyan-500/20 border-b-cyan-500 shadow-cyan-950/20'
                        }`}>
                            <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center flex-shrink-0 transition-colors duration-500 ${
                                isDayMode ? 'bg-purple-50 border-purple-200 text-purple-600' : 'bg-purple-500/10 border-purple-500/25 text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.15)]'
                            }`}>
                                <Sparkles size={20} />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-[12.5px] font-[1000] uppercase tracking-wider">Fidelización con IA</h3>
                                <p className={`text-[11.5px] leading-relaxed transition-colors duration-500 ${
                                    isDayMode ? 'text-slate-600 font-medium' : 'text-slate-350'
                                }`}>
                                    Tus clientes reciben alertas de tus ofertas directo al celular de forma segmentada, aumentando de manera inteligente tus visitas recurrentes.
                                </p>
                            </div>
                        </div>
                    </div>
                </RevealSection>

                {/* ============================================ */}
                {/* 4. SECCIÓN DE FRICCIÓN CERO: EL PROCESO      */}
                {/* ============================================ */}
                <RevealSection id="como-funciona" className="w-full mt-6">
                    <div className={`border border-b-[6px] p-6 rounded-[2.5rem] shadow-lg space-y-6 transition-all duration-700 ${
                        isDayMode 
                            ? 'bg-[#faf8f5] border-slate-200 border-b-[#855b3c]' 
                            : 'bg-[#0e1726]/40 backdrop-blur-xl border-cyan-500/20 border-b-cyan-500 shadow-cyan-950/20'
                    }`}>
                        <div className="text-center py-1">
                            <span className="text-[9px] font-black uppercase tracking-widest text-[#00E5FF]">
                                Sumarse es instantáneo
                            </span>
                            <h2 className="text-xl font-[1100] uppercase tracking-tight mt-0.5">
                                Proceso de Activación
                            </h2>
                        </div>

                        <div className="space-y-6 relative pl-5 border-l-2 border-dashed border-cyan-500/30">
                            {/* Paso 1 */}
                            <div className="relative">
                                <div className="absolute -left-[31px] top-0 w-6 h-6 rounded-full bg-cyan-500 border-2 border-white flex items-center justify-center text-[10px] font-black text-black">
                                    1
                                </div>
                                <h3 className="text-[12.5px] font-[1000] uppercase tracking-wider leading-none">Paso 1: Suscripción</h3>
                                <p className={`text-[11px] leading-relaxed mt-2 transition-colors duration-500 ${
                                    isDayMode ? 'text-slate-650 font-medium' : 'text-slate-300'
                                }`}>
                                    Completás tus datos en el formulario inferior en solo 30 segundos.
                                </p>
                            </div>

                            {/* Paso 2 */}
                            <div className="relative">
                                <div className="absolute -left-[31px] top-0 w-6 h-6 rounded-full bg-cyan-500 border-2 border-white flex items-center justify-center text-[10px] font-black text-black">
                                    2
                                </div>
                                <h3 className="text-[12.5px] font-[1000] uppercase tracking-wider leading-none">Paso 2: Verificación</h3>
                                <p className={`text-[11px] leading-relaxed mt-2 transition-colors duration-500 ${
                                    isDayMode ? 'text-slate-650 font-medium' : 'text-slate-300'
                                }`}>
                                    Un **Embajador de Zona** te visita físicamente en tu local para entregarte tu gráfica oficial y guiarte en el catálogo.
                                </p>
                            </div>

                            {/* Paso 3 */}
                            <div className="relative">
                                <div className="absolute -left-[31px] top-0 w-6 h-6 rounded-full bg-[#10b981] border-2 border-white flex items-center justify-center text-[10px] font-black text-white shadow-[0_0_8px_#10b981]">
                                    3
                                </div>
                                <h3 className="text-[12.5px] font-[1000] uppercase tracking-wider leading-none text-emerald-500">Paso 3: Activación</h3>
                                <p className={`text-[11px] leading-relaxed mt-2 transition-colors duration-500 ${
                                    isDayMode ? 'text-slate-650 font-medium' : 'text-slate-300'
                                }`}>
                                    Se enciende tu local en nuestro mapa interactivo y tus ofertas llegan inmediatamente a los vecinos.
                                </p>
                            </div>
                        </div>
                    </div>
                </RevealSection>

                {/* ============================================ */}
                {/* 5. SECCIÓN DE CIERRE Y URGENCIA: SUSCRIPCIÓN */}
                {/* ============================================ */}
                <RevealSection id="suscripcion" className="w-full mt-6 mb-6">
                    <div className={`border border-b-[6px] p-6 rounded-[2.5rem] shadow-lg space-y-5 transition-all duration-700 ${
                        isDayMode 
                            ? 'bg-[#faf8f5] border-slate-200 border-b-[#855b3c]' 
                            : 'bg-[#0e1726]/40 backdrop-blur-xl border-cyan-500/20 border-b-cyan-500 shadow-cyan-950/20'
                    }`}>
                        <div className="text-center space-y-1">
                            <span className="text-[9px] font-black uppercase tracking-widest text-[#00E5FF]">
                                Cupos Limitados por Rubro
                            </span>
                            <h2 className="text-xl font-[1100] uppercase tracking-tight">
                                Lanzamiento Estratégico
                            </h2>
                        </div>

                        <p className={`text-[11.5px] leading-relaxed text-center font-medium transition-colors duration-500 ${
                            isDayMode ? 'text-slate-700' : 'text-slate-300'
                        }`}>
                            Solo aceptamos cupos limitados por rubro en esta etapa para garantizar tu exclusividad en la zona. No dejes que tu competencia ocupe tu lugar.
                        </p>

                        {/* Firebase B2B lead capture form */}
                        <form onSubmit={handleSubmitLead} className="space-y-4 pt-2">
                            {/* Name Input */}
                            <div className="space-y-1">
                                <label className="text-[9.5px] font-[1000] uppercase tracking-wider block">
                                    Nombre del Local *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={localName}
                                    onChange={(e) => setLocalName(e.target.value)}
                                    placeholder="Ej: Panadería La Espiga"
                                    className={`w-full px-4 py-3 rounded-xl text-[12px] font-medium border outline-none transition-colors duration-300 ${
                                        isDayMode 
                                            ? 'bg-white border-slate-200 focus:border-[#855b3c] text-[#2d1e15]' 
                                            : 'bg-black/35 border-white/10 focus:border-cyan-500 text-white'
                                    }`}
                                />
                            </div>

                            {/* Specialty Input */}
                            <div className="space-y-1">
                                <label className="text-[9.5px] font-[1000] uppercase tracking-wider block">
                                    Rubro del Comercio
                                </label>
                                <input
                                    type="text"
                                    value={specialty}
                                    onChange={(e) => setSpecialty(e.target.value)}
                                    placeholder="Ej: Panadería, Pizzería, Indumentaria"
                                    className={`w-full px-4 py-3 rounded-xl text-[12px] font-medium border outline-none transition-colors duration-300 ${
                                        isDayMode 
                                            ? 'bg-white border-slate-200 focus:border-[#855b3c] text-[#2d1e15]' 
                                            : 'bg-black/35 border-white/10 focus:border-cyan-500 text-white'
                                    }`}
                                />
                            </div>

                            {/* WhatsApp Input */}
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

                            {/* CTA button (Vercel/Firebase direct pipeline + whatsapp trigger) */}
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-4 text-[10px] font-[1100] uppercase tracking-[0.2em] btn-3d-celeste flex items-center justify-center gap-2 mt-2 ${
                                    loading ? 'opacity-70 cursor-not-allowed' : ''
                                }`}
                            >
                                <UserCheck size={16} />
                                {loading ? 'Enviando...' : 'Solicitar Visita del Embajador'}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="flex items-center my-3.5">
                            <div className="flex-1 h-[1px] bg-slate-300/35" />
                            <span className="px-3 text-[9px] font-black uppercase tracking-widest opacity-40">O</span>
                            <div className="flex-1 h-[1px] bg-slate-300/35" />
                        </div>

                        {/* Speak to advisor secondary CTA */}
                        <button
                            onClick={handleAsesorChat}
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

                {/* Recommend B2B landing */}
                <section className="w-full mt-2">
                    <button
                        onClick={handleShare}
                        className={`w-full py-4 text-[10px] font-[1100] uppercase tracking-[0.2em] border border-b-[5px] rounded-2xl active:translate-y-[4px] transition-all flex items-center justify-center gap-2 shadow-sm ${
                            isDayMode 
                                ? 'bg-white hover:bg-slate-50 border-slate-200 border-b-slate-300 text-slate-800' 
                                : 'bg-white/5 hover:bg-white/10 border-white/10 border-b-white/20 text-white'
                        }`}
                    >
                        <Share2 size={16} className="text-violet-500" />
                        Recomendar a otro comerciante
                    </button>
                </section>

            </main>

            {/* Footer */}
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
                
                {/* Footer links */}
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
                townId={townId}
                isDayMode={isDayMode}
                globalConfig={{}}
            />
        </div>
    );
};

export default MerchantLandingPage;
