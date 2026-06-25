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
    Building2,
    Users,
    Zap,
    Moon,
    Sun,
    AlertCircle,
    CheckCircle2,
    Flame,
    ArrowDown,
    Target,
    MapPin,
    Network
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { playNeonClick } from '../utils/audio';
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
            { threshold: 0.05 }
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

const IndustrialLandingPage: React.FC = () => {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Theme state - synchronized with global_home_theme_mode
    const [isDayMode, setIsDayMode] = useState<boolean>(() => {
        const saved = localStorage.getItem('global_home_theme_mode');
        return saved === 'light';
    });

    // Form states
    const [companyName, setCompanyName] = useState('');
    const [category, setCategory] = useState('');
    const [reach, setReach] = useState('');
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
        const formSection = document.getElementById('alianza');
        if (formSection) {
            formSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleShare = () => {
        playNeonClick();
        const shareUrl = window.location.origin + `/industrial`;
        const shareText = '¡Impulsá tu marca directo a los comercios locales con el Directorio Industrial de ShopDigital! 🚀\n\n👉 ' + shareUrl;

        if (navigator.share) {
            navigator.share({ title: 'ShopDigital Directorio Industrial', text: shareText, url: shareUrl }).catch(console.error);
        } else {
            window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
        }
    };

    // Firebase Lead submission + WhatsApp redirect
    const handleSubmitLead = async (actionType: 'reunion' | 'dossier') => {
        playNeonClick();

        if (!companyName || !whatsapp) {
            alert('Por favor, completá al menos el Nombre de la Empresa y tu WhatsApp Corporativo.');
            return;
        }

        setLoading(true);
        try {
            const id = `lead-industrial-${Date.now()}`;
            const leadData = {
                id,
                name: companyName.trim(),
                category: category.trim() || 'Industrial General',
                phone: whatsapp.replace(/\D/g, ''),
                townId: 'esteban-echeverria', // default B2B pipeline node
                status: 'pending',
                date: new Date().toISOString(),
                notes: `Interesado en Directorio Industrial. Acción: ${actionType === 'reunion' ? 'Agendar Reunión' : 'Solicitar Dossier'}. Alcance territorial: ${reach.trim()}`,
                origin: 'landing_industrial',
                isIndustrial: true,
                zone: 'Pendiente de Asignación',
                address: 'Pendiente de Visita',
                contactName: 'Contacto B2B',
                digitalDiagnosis: {
                    interestLevel: 'high',
                    missing: 'Catálogo Industrial',
                    observations: `Ingreso desde Landing B2B /industrial. Solicitó: ${actionType === 'reunion' ? 'Reunión' : 'Dossier'}`
                }
            };

            await guardarRelevamiento(leadData, 'esteban-echeverria');
            
            alert('¡Tu solicitud ha sido guardada en nuestra red de verificación B2B! Ahora te redirigiremos a WhatsApp para finalizar la gestión.');

            const message = actionType === 'reunion'
                ? `Hola ShopDigital, acabo de registrar mi empresa desde la landing industrial /industrial:\n\n🏢 Empresa: ${companyName}\n🛠️ Rubro: ${category || 'Sin especificar'}\n🌐 Alcance deseado: ${reach || 'Nacional'}\n📱 WhatsApp: ${whatsapp}\n\nQuiero AGENDAR una reunión estratégica para asegurar mi cupo en el directorio.`
                : `Hola ShopDigital, acabo de registrar mi empresa desde la landing industrial /industrial:\n\n🏢 Empresa: ${companyName}\n🛠️ Rubro: ${category || 'Sin especificar'}\n🌐 Alcance deseado: ${reach || 'Nacional'}\n📱 WhatsApp: ${whatsapp}\n\nQuiero SOLICITAR el Dossier Comercial del Directorio Industrial.`;
            
            window.open(`https://wa.me/5491140607059?text=${encodeURIComponent(message)}`, '_blank');

            // Reset form
            setCompanyName('');
            setCategory('');
            setReach('');
            setWhatsapp('');
        } catch (error) {
            console.error('Error al guardar relevamiento industrial:', error);
            alert('Tuvimos un inconveniente al procesar tu solicitud. Por favor intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div 
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className={`h-screen w-full flex flex-col justify-start relative overflow-y-auto pb-12 transition-colors duration-700 font-sans selection:bg-amber-500/20 scroll-smooth ${
                isDayMode ? 'bg-[#cda488] text-[#2d1e15] day-mode' : 'bg-[#050505] text-white dark'
            }`}
            style={{ '--theme-primary': '#f59e0b' } as React.CSSProperties}
        >
            {/* Custom Animations & Styles Overrides */}
            <style>{`
                @keyframes pulseGlowAmber {
                    0%, 100% { filter: drop-shadow(0 0 10px rgba(245, 158, 11, 0.4)); }
                    50% { filter: drop-shadow(0 0 25px rgba(245, 158, 11, 0.8)); }
                }
                .glow-amber-glow {
                    animation: pulseGlowAmber 3s infinite ease-in-out;
                }
                @keyframes bounceSlow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-8px); }
                }
                .animate-bounce-slow {
                    animation: bounceSlow 4s infinite ease-in-out;
                }
                .btn-3d-amber {
                    position: relative;
                    transition: transform 0.15s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.15s ease, border-color 0.15s ease, background-color 0.15s ease !important;
                    border: 1px solid rgba(245, 158, 11, 0.4) !important;
                    border-bottom: 7px solid #d97706 !important;
                    background: linear-gradient(135deg, rgba(245, 158, 11, 0.25) 0%, rgba(15, 23, 42, 0.8) 100%) !important;
                    backdrop-filter: blur(12px) !important;
                    box-shadow: 
                        0 10px 20px rgba(0, 0, 0, 0.3),
                        0 4px 15px rgba(245, 158, 11, 0.2), 
                        inset 0 1.5px 0 rgba(255, 255, 255, 0.2) !important;
                    border-radius: 1.25rem !important;
                }
                .btn-3d-amber:hover {
                    transform: translateY(-2px) scale(1.01) !important;
                    background: linear-gradient(135deg, rgba(245, 158, 11, 0.35) 0%, rgba(15, 23, 42, 0.9) 100%) !important;
                    border-color: rgba(245, 158, 11, 0.6) !important;
                    border-bottom-color: #f59e0b !important;
                    border-bottom-width: 8px !important;
                    box-shadow: 
                        0 12px 25px rgba(0, 0, 0, 0.4),
                        0 6px 20px rgba(245, 158, 11, 0.35), 
                        inset 0 2px 0 rgba(255, 255, 255, 0.3) !important;
                }
                .btn-3d-amber:active {
                    transform: translateY(6px) scale(0.98) !important;
                    border-bottom-width: 1px !important;
                    box-shadow: 
                        0 2px 8px rgba(0, 0, 0, 0.2),
                        0 1px 5px rgba(245, 158, 11, 0.1), 
                        inset 0 1px 0 rgba(255, 255, 255, 0.05) !important;
                }
                /* Day Mode for Amber Button */
                .day-mode .btn-3d-amber {
                    background: linear-gradient(135deg, rgba(245, 158, 11, 0.4) 0%, rgba(245, 158, 11, 0.1) 100%) !important;
                    border: 1px solid rgba(245, 158, 11, 0.5) !important;
                    border-bottom: 7px solid #b45309 !important;
                    box-shadow: 
                        0 10px 18px rgba(88, 70, 50, 0.15), 
                        inset 0 1.5px 0 rgba(255, 255, 255, 0.5) !important;
                    color: #451a03 !important;
                }
                .day-mode .btn-3d-amber:hover {
                    background: linear-gradient(135deg, rgba(245, 158, 11, 0.5) 0%, rgba(245, 158, 11, 0.2) 100%) !important;
                    border-color: rgba(245, 158, 11, 0.6) !important;
                    border-bottom-color: #d97706 !important;
                    border-bottom-width: 8px !important;
                    box-shadow: 
                        0 12px 22px rgba(88, 70, 50, 0.2), 
                        inset 0 2px 0 rgba(255, 255, 255, 0.6) !important;
                    transform: translateY(-2px) scale(1.01) !important;
                }
                .day-mode .btn-3d-amber:active {
                    transform: translateY(6px) scale(0.98) !important;
                    border-bottom-width: 1px !important;
                    box-shadow: 
                        0 2px 6px rgba(88, 70, 50, 0.08), 
                        inset 0 1px 0 rgba(255, 255, 255, 0.3) !important;
                }
            `}</style>

            {/* Background Grid & Textures */}
            <div className="fixed inset-0 pointer-events-none z-0">
                {isDayMode ? (
                    <>
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(45,30,21,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(45,30,21,0.02)_1px,transparent_1px)] bg-[size:32px_32px]" />
                        <div className="absolute top-1/4 left-[-10%] w-[60%] h-[40%] bg-white/15 rounded-full blur-[120px]" />
                    </>
                ) : (
                    <>
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:32px_32px]" />
                        <div className="absolute top-1/3 left-[-15%] w-[80%] h-[35%] bg-amber-950/10 rounded-full blur-[150px] animate-pulse" />
                        <div className="absolute bottom-1/4 right-[-10%] w-[50%] h-[40%] bg-zinc-950/30 rounded-full blur-[150px]" />
                    </>
                )}
            </div>

            {/* STICKY HEADER */}
            <nav className={`fixed top-0 z-50 w-full transition-all duration-500 border-b ${
                scrolled 
                    ? isDayMode 
                        ? 'bg-[#faf8f5]/95 backdrop-blur-xl border-[#855b3c]/20 py-2 shadow-md' 
                        : 'bg-[#050505]/95 backdrop-blur-xl border-white/15 py-2 shadow-[0_4px_30px_rgba(0,0,0,0.8)] shadow-amber-950/10'
                    : isDayMode 
                        ? 'bg-[#faf8f5] border-[#855b3c]/10 py-3.5' 
                        : 'bg-[#050505] border-white/5 py-3.5'
            }`}>
                <div className="px-4 flex items-center justify-between w-full max-w-lg mx-auto">
                    <button 
                        onClick={() => { playNeonClick(); navigate('/'); }}
                        className={`p-2.5 rounded-xl transition-all active:translate-y-[2px] ${
                            isDayMode 
                                ? 'hover:bg-slate-200 text-[#2d1e15]' 
                                : 'hover:bg-white/5 text-white'
                        }`}
                    >
                        <ArrowLeft size={18} />
                    </button>
                    
                    {/* Pulsing Dot Logo */}
                    <div className="flex items-center gap-1.5 select-none cursor-pointer" onClick={() => navigate('/')}>
                        <span className={`text-[19px] font-[1000] tracking-tighter uppercase leading-none ${
                            isDayMode ? 'text-[#2d1e15]' : 'text-white'
                        }`}>
                            ShopDigital
                        </span>
                        <span className="text-[19px] font-[1000] leading-none text-amber-500">.ar</span>
                        <span className="w-2 h-2 rounded-full bg-[#f59e0b] shadow-[0_0_8px_#f59e0b] animate-ping ml-0.5" />
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

            <main className={`relative z-10 flex flex-col items-center w-full max-w-lg mx-auto pt-20 px-4 ${isDayMode ? 'day-mode' : ''}`}>
                
                {/* IN-PAGE NAV BAR */}
                <div className={`w-full mt-4 flex items-center justify-between px-2 py-1.5 rounded-2xl border text-[10px] font-black uppercase tracking-wider transition-colors duration-500 ${
                    isDayMode 
                        ? 'bg-[#faf8f5]/80 backdrop-blur-md border-[#855b3c]/20 text-[#2d1e15]' 
                        : 'bg-white/5 backdrop-blur-md border-white/10 text-slate-300'
                }`}>
                    <a href="#inicio" className="flex-1 text-center py-1.5 hover:text-amber-500 transition-colors">Inicio</a>
                    <span className="opacity-20">|</span>
                    <a href="#el-problema" className="flex-1 text-center py-1.5 hover:text-amber-500 transition-colors">Dolor</a>
                    <span className="opacity-20">|</span>
                    <a href="#beneficios" className="flex-1 text-center py-1.5 hover:text-amber-500 transition-colors">Pilares</a>
                    <span className="opacity-20">|</span>
                    <a href="#como-funciona" className="flex-1 text-center py-1.5 hover:text-amber-500 transition-colors">Proceso</a>
                    <span className="opacity-20">|</span>
                    <a href="#alianza" className="flex-1 text-center py-1.5 hover:text-amber-500 transition-colors">Formulario</a>
                </div>

                {/* ============================================ */}
                {/* 1. SECCIÓN HERO: EL IMPACTO CORPORATIVO      */}
                {/* ============================================ */}
                <RevealSection id="inicio" className="w-full mt-6">
                    <div className={`border border-b-[6px] p-6 rounded-[2.5rem] shadow-lg flex flex-col items-center gap-5 text-center relative overflow-hidden transition-all duration-700 ${
                        isDayMode 
                            ? 'bg-[#faf8f5] border-slate-200 border-b-[#855b3c]' 
                            : 'bg-[#0f172a]/40 backdrop-blur-xl border-amber-500/20 border-b-amber-500 shadow-amber-950/20'
                    }`}>
                        <div className={`absolute top-0 right-0 text-[7px] font-[1000] uppercase tracking-[0.25em] px-4 py-1.5 rounded-bl-2xl transition-colors duration-500 ${
                            isDayMode ? 'bg-[#2d1e15] text-[#faf8f5]' : 'bg-[#f59e0b] text-black font-black shadow-[0_0_10px_#f59e0b]'
                        }`}>
                            B2B ENTERPRISE ⚡
                        </div>

                        {/* Visual representation card (Floating Widget) */}
                        <div className="relative w-full max-w-[280px] p-4 rounded-3xl border mt-6 text-left shadow-lg model-floating transition-colors duration-500 bg-[linear-gradient(135deg,rgba(245,158,11,0.08)_0%,rgba(15,23,42,0.85)_100%)] border-amber-500/25">
                            <div className="flex items-center justify-between mb-3 border-b border-amber-500/20 pb-2">
                                <div className="flex items-center gap-2">
                                    <Building2 size={16} className="text-amber-500" />
                                    <span className="text-[10px] font-black uppercase text-amber-500 tracking-wider">Dashboard Proveedor</span>
                                </div>
                                <span className="text-[8px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">Verificado</span>
                            </div>
                            
                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-400">Alcance de Zonas:</span>
                                    <span className="font-bold text-white flex items-center gap-1"><MapPin size={8} /> Buenos Aires (E. Echeverría)</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-400">Comercios Conectados:</span>
                                    <span className="font-bold text-amber-400">342 Locales</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-400">Búsquedas Mensuales:</span>
                                    <span className="font-bold text-emerald-400">+12,500</span>
                                </div>
                            </div>
                        </div>

                        {/* Title & Subtitle */}
                        <div className="mt-2 space-y-3">
                            <h1 className="text-[23px] font-[1100] tracking-tighter leading-[1.1] uppercase">
                                Escalá tu marca <br />
                                directo al corazón <br />
                                del <span className={isDayMode ? 'text-[#855b3c]' : 'text-amber-400'}>comercio local</span>
                            </h1>
                            <p className={`text-[12px] leading-relaxed font-medium transition-colors duration-500 ${
                                isDayMode ? 'text-slate-650' : 'text-slate-350'
                            }`}>
                                Ubicá tus productos, insumos y servicios frente a cientos de dueños de negocios con Identidad Verificada. Sin intermediarios, con impacto territorial quirúrgico.
                            </p>
                        </div>

                        {/* CTA Tactile 3D Button */}
                        <button
                            onClick={handleScrollToForm}
                            className="w-full py-4 rounded-2xl font-[1100] text-[10.5px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 btn-3d-amber glow-amber-glow"
                        >
                            <Flame size={16} className="animate-pulse" />
                            Unir mi empresa al directorio
                        </button>
                    </div>
                </RevealSection>

                {/* ============================================ */}
                {/* 2. SECCIÓN DE DOLOR: EL PROBLEMA            */}
                {/* ============================================ */}
                <RevealSection id="el-problema" className="w-full mt-6">
                    <div className={`border border-b-[6px] p-6 rounded-[2.5rem] shadow-lg space-y-5 transition-all duration-700 ${
                        isDayMode 
                            ? 'bg-[#faf8f5] border-slate-200 border-b-[#855b3c]' 
                            : 'bg-[#0f172a]/40 backdrop-blur-xl border-amber-500/20 border-b-amber-500 shadow-amber-950/20'
                    }`}>
                        <div className="flex items-center gap-2.5">
                            <div className={`p-2.5 rounded-xl border ${
                                isDayMode 
                                    ? 'bg-amber-50 text-amber-700 border-amber-200' 
                                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            }`}>
                                <AlertCircle size={18} />
                            </div>
                            <h2 className="text-lg font-[1000] uppercase tracking-tight">
                                Publicidad Tradicional vs Precisión Quirúrgica
                            </h2>
                        </div>

                        <p className={`text-[12px] leading-relaxed font-medium transition-colors duration-500 ${
                            isDayMode ? 'text-[#3d2c20]' : 'text-slate-300'
                        }`}>
                            ¿Cansado de pagar publicidad genérica que no llega a quienes toman las decisiones? En el mercado tradicional, tus vendedores pierden horas buscando clientes. En ShopDigital, los comercios te encuentran a vos cuando necesitan comprar.
                        </p>

                        {/* Inline SVG Chart for comparison */}
                        <div className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-dashed border-slate-700/30 bg-slate-500/5">
                            <div className="flex-1 text-center">
                                <span className="text-[9px] font-black uppercase text-red-500 block mb-1">Tradicional</span>
                                <div className="h-16 flex items-center justify-center relative bg-red-500/5 border border-red-500/10 rounded-xl overflow-hidden">
                                    {/* Dispersed dots */}
                                    <div className="absolute top-2 left-3 w-1.5 h-1.5 bg-red-400 rounded-full" />
                                    <div className="absolute bottom-3 left-6 w-2 h-2 bg-red-400 rounded-full" />
                                    <div className="absolute top-4 right-5 w-1 h-1 bg-red-400 rounded-full" />
                                    <div className="absolute bottom-2 right-12 w-1.5 h-1.5 bg-red-400 rounded-full" />
                                    <div className="absolute top-8 left-16 w-1.5 h-1.5 bg-red-400 rounded-full" />
                                    <div className="text-[9px] font-bold text-red-400 z-10">Dispersión</div>
                                </div>
                            </div>
                            <div className="flex-1 text-center">
                                <span className="text-[9px] font-black uppercase text-amber-500 block mb-1">ShopDigital</span>
                                <div className="h-16 flex items-center justify-center relative bg-amber-500/10 border border-amber-500/20 rounded-xl overflow-hidden">
                                    {/* Target precision focus */}
                                    <div className="absolute w-8 h-8 rounded-full border border-amber-500/30 flex items-center justify-center animate-pulse">
                                        <div className="w-4 h-4 rounded-full border border-amber-500/60 flex items-center justify-center">
                                            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                                        </div>
                                    </div>
                                    <div className="text-[9px] font-bold text-amber-400 z-10 mt-6">Precisión</div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 pt-1">
                            {/* Pain point 1 */}
                            <div className={`flex items-start gap-3.5 p-3.5 rounded-2xl border transition-colors duration-500 ${
                                isDayMode ? 'bg-red-50/40 border-red-100' : 'bg-red-950/10 border-red-500/10'
                            }`}>
                                <span className="text-red-500 font-extrabold text-sm mt-0.5">✕</span>
                                <div className="space-y-0.5">
                                    <h4 className="text-[11px] font-[1000] uppercase tracking-wide text-red-500">Intermediarios Costosos</h4>
                                    <p className={`text-[10px] leading-normal ${isDayMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                        Comisiones y agentes externos que se quedan con tu margen de ganancia en cada transacción mayorista.
                                    </p>
                                </div>
                            </div>

                            {/* Pain point 2 */}
                            <div className={`flex items-start gap-3.5 p-3.5 rounded-2xl border transition-colors duration-500 ${
                                isDayMode ? 'bg-red-50/40 border-red-100' : 'bg-red-950/10 border-red-500/10'
                            }`}>
                                <span className="text-red-500 font-extrabold text-sm mt-0.5">✕</span>
                                <div className="space-y-0.5">
                                    <h4 className="text-[11px] font-[1000] uppercase tracking-wide text-red-500">Sin Contacto Directo</h4>
                                    <p className={`text-[10px] leading-normal ${isDayMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                        Tus vendedores pierden horas en la vereda tratando de dar con el dueño o decisor de compras del comercio.
                                    </p>
                                </div>
                            </div>

                            {/* Pain point 3 */}
                            <div className={`flex items-start gap-3.5 p-3.5 rounded-2xl border transition-colors duration-500 ${
                                isDayMode ? 'bg-red-50/40 border-red-100' : 'bg-red-950/10 border-red-500/10'
                            }`}>
                                <span className="text-red-500 font-extrabold text-sm mt-0.5">✕</span>
                                <div className="space-y-0.5">
                                    <h4 className="text-[11px] font-[1000] uppercase tracking-wide text-red-500">Bases de datos obsoletas</h4>
                                    <p className={`text-[10px] leading-normal ${isDayMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                        Listados de contactos viejos o falsos que no se traducen en pedidos reales de insumos o mercadería.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </RevealSection>

                {/* ============================================ */}
                {/* 3. SECCIÓN DE SOLUCIÓN: PILARES B2B          */}
                {/* ============================================ */}
                <RevealSection id="beneficios" className="w-full mt-6">
                    <div className="space-y-4">
                        <div className="text-center py-2">
                            <span className="text-[9px] font-black uppercase tracking-widest text-amber-500">
                                Por qué anunciarte en nuestra red es una mina de oro
                            </span>
                            <h2 className="text-xl font-[1100] uppercase tracking-tight mt-1">
                                El Foso de Competencia
                            </h2>
                        </div>

                        {/* Pilar 1 */}
                        <div className={`border border-b-[6px] p-5 rounded-[2rem] shadow-md flex items-start gap-4 transition-all duration-700 ${
                            isDayMode 
                                ? 'bg-[#faf8f5] border-slate-200 border-b-[#855b3c]' 
                                : 'bg-[#0f172a]/40 backdrop-blur-xl border-amber-500/20 border-b-amber-500 shadow-amber-950/20'
                        }`}>
                            <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center flex-shrink-0 transition-colors duration-500 bg-amber-500/10 border-amber-500/25 text-amber-500`}>
                                <Target size={20} />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-[12.5px] font-[1000] uppercase tracking-wider">Segmentación Quirúrgica</h3>
                                <p className={`text-[11.5px] leading-relaxed transition-colors duration-500 ${
                                    isDayMode ? 'text-slate-600 font-medium' : 'text-slate-350'
                                }`}>
                                    ¿Vendés harina? Publicitá solo en Pizzerías y Panaderías. ¿Vendés insumos de peluquería? Solo te ven las Barberías y Salones. Precisión absoluta.
                                </p>
                            </div>
                        </div>

                        {/* Pilar 2 */}
                        <div className={`border border-b-[6px] p-5 rounded-[2rem] shadow-md flex items-start gap-4 transition-all duration-700 ${
                            isDayMode 
                                ? 'bg-[#faf8f5] border-slate-200 border-b-[#855b3c]' 
                                : 'bg-[#0f172a]/40 backdrop-blur-xl border-amber-500/20 border-b-amber-500 shadow-amber-950/20'
                        }`}>
                            <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center flex-shrink-0 transition-colors duration-500 bg-amber-500/10 border-amber-500/25 text-amber-500`}>
                                <Shield size={20} />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-[12.5px] font-[1000] uppercase tracking-wider">Red B2B Verificada</h3>
                                <p className={`text-[11.5px] leading-relaxed transition-colors duration-500 ${
                                    isDayMode ? 'text-slate-600 font-medium' : 'text-slate-350'
                                }`}>
                                    Garantía total. Interactuás con comercios validados presencialmente por nuestros Embajadores y protegidos con credenciales inviolables.
                                </p>
                            </div>
                        </div>

                        {/* Pilar 3 */}
                        <div className={`border border-b-[6px] p-5 rounded-[2rem] shadow-md flex items-start gap-4 transition-all duration-700 ${
                            isDayMode 
                                ? 'bg-[#faf8f5] border-slate-200 border-b-[#855b3c]' 
                                : 'bg-[#0f172a]/40 backdrop-blur-xl border-amber-500/20 border-b-amber-500 shadow-amber-950/20'
                        }`}>
                            <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center flex-shrink-0 transition-colors duration-500 bg-amber-500/10 border-amber-500/25 text-amber-500`}>
                                <Network size={20} />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-[12.5px] font-[1000] uppercase tracking-wider">Economía Circular</h3>
                                <p className={`text-[11.5px] leading-relaxed transition-colors duration-500 ${
                                    isDayMode ? 'text-slate-600 font-medium' : 'text-slate-350'
                                }`}>
                                    Fomentá el consumo local y regional. Convertite en el proveedor oficial preferido de nuestra comunidad de comercios.
                                </p>
                            </div>
                        </div>
                    </div>
                </RevealSection>

                {/* ============================================ */}
                {/* 4. SECCIÓN DE PROCESO: ONBOARDING            */}
                {/* ============================================ */}
                <RevealSection id="como-funciona" className="w-full mt-6">
                    <div className={`border border-b-[6px] p-6 rounded-[2.5rem] shadow-lg space-y-6 transition-all duration-700 ${
                        isDayMode 
                            ? 'bg-[#faf8f5] border-slate-200 border-b-[#855b3c]' 
                            : 'bg-[#0f172a]/40 backdrop-blur-xl border-amber-500/20 border-b-amber-500 shadow-amber-950/20'
                    }`}>
                        <div className="text-center">
                            <span className="text-[9px] font-black uppercase tracking-widest text-amber-500">Ingreso Exponencial</span>
                            <h2 className="text-lg font-[1000] uppercase tracking-tight mt-0.5">Fricción Cero en 3 Pasos</h2>
                        </div>

                        {/* Vertical timeline stepper */}
                        <div className="relative pl-6 border-l border-amber-500/30 space-y-6 ml-2 py-1">
                            {/* Step 1 */}
                            <div className="relative">
                                <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-[#f59e0b] shadow-[0_0_8px_#f59e0b] flex items-center justify-center text-[9px] font-bold text-black font-sans">1</div>
                                <div className="space-y-1">
                                    <h4 className="text-[11.5px] font-[1000] uppercase tracking-wide">1. Aplicación Inicial</h4>
                                    <p className={`text-[10px] leading-normal ${isDayMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                        Completá el perfil de tu empresa y definí el alcance territorial deseado para tus productos o servicios.
                                    </p>
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div className="relative">
                                <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-[#f59e0b] shadow-[0_0_8px_#f59e0b] flex items-center justify-center text-[9px] font-bold text-black font-sans">2</div>
                                <div className="space-y-1">
                                    <h4 className="text-[11.5px] font-[1000] uppercase tracking-wide">2. Auditoría Comercial</h4>
                                    <p className={`text-[10px] leading-normal ${isDayMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                        Nuestro equipo comercial valida tus productos, calidad e insumos para garantizar la excelencia dentro de la red.
                                    </p>
                                </div>
                            </div>

                            {/* Step 3 */}
                            <div className="relative">
                                <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-[#f59e0b] shadow-[0_0_8px_#f59e0b] flex items-center justify-center text-[9px] font-bold text-black font-sans">3</div>
                                <div className="space-y-1">
                                    <h4 className="text-[11.5px] font-[1000] uppercase tracking-wide">3. Conexión Directa</h4>
                                    <p className={`text-[10px] leading-normal ${isDayMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                        Tu catálogo mayorista y ofertas se encienden en el panel de control B2B de los comercios de tu zona.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </RevealSection>

                {/* ============================================ */}
                {/* 5. SECCIÓN DE CAPTURA DE LEADS Y URGENCIA    */}
                {/* ============================================ */}
                <RevealSection id="alianza" className="w-full mt-6">
                    <div className={`border border-b-[6px] p-6 rounded-[2.5rem] shadow-lg space-y-5 transition-all duration-700 ${
                        isDayMode 
                            ? 'bg-[#faf8f5] border-slate-200 border-b-[#855b3c]' 
                            : 'bg-[#0f172a]/40 backdrop-blur-xl border-amber-500/20 border-b-amber-500 shadow-amber-950/20'
                    }`}>
                        <div className="text-center space-y-1">
                            <span className="text-[9px] font-black uppercase tracking-widest text-[#ef4444] animate-pulse">
                                🚨 CAPACIDAD ESTRICTAMENTE LIMITADA
                            </span>
                            <h2 className="text-lg font-[1000] uppercase tracking-tight">
                                Alianza Estratégica
                            </h2>
                            <p className={`text-[11px] leading-relaxed transition-colors duration-500 ${
                                isDayMode ? 'text-slate-500' : 'text-slate-400'
                            }`}>
                                Posicionate como el proveedor oficial de la red comercial del futuro. Cupos limitados por rubro industrial en esta etapa de expansión.
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={(e) => { e.preventDefault(); }} className="space-y-4 pt-2">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-wide block ml-1 text-slate-400">
                                    Nombre de la Empresa
                                </label>
                                <input 
                                    type="text" 
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    placeholder="Ej. Distribuidora del Sur"
                                    className={`w-full px-4 py-3 rounded-xl border text-[12px] font-medium transition-all outline-none ${
                                        isDayMode 
                                            ? 'bg-white border-slate-250 focus:border-[#855b3c]/60 text-slate-900 shadow-sm' 
                                            : 'bg-black/40 border-white/10 focus:border-amber-500/50 text-white'
                                    }`}
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-wide block ml-1 text-slate-400">
                                    Rubro de Insumo / Servicio
                                </label>
                                <input 
                                    type="text" 
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    placeholder="Ej. Harinas y Alimentos, Packaging, Limpieza"
                                    className={`w-full px-4 py-3 rounded-xl border text-[12px] font-medium transition-all outline-none ${
                                        isDayMode 
                                            ? 'bg-white border-slate-250 focus:border-[#855b3c]/60 text-slate-900 shadow-sm' 
                                            : 'bg-black/40 border-white/10 focus:border-amber-500/50 text-white'
                                    }`}
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-wide block ml-1 text-slate-400">
                                    Alcance Deseado (Ciudades)
                                </label>
                                <input 
                                    type="text" 
                                    value={reach}
                                    onChange={(e) => setReach(e.target.value)}
                                    placeholder="Ej. Esteban Echeverría, Ezeiza, Lomas de Zamora"
                                    className={`w-full px-4 py-3 rounded-xl border text-[12px] font-medium transition-all outline-none ${
                                        isDayMode 
                                            ? 'bg-white border-slate-250 focus:border-[#855b3c]/60 text-slate-900 shadow-sm' 
                                            : 'bg-black/40 border-white/10 focus:border-amber-500/50 text-white'
                                    }`}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-wide block ml-1 text-slate-400">
                                    WhatsApp Corporativo
                                </label>
                                <input 
                                    type="tel" 
                                    value={whatsapp}
                                    onChange={(e) => setWhatsapp(e.target.value)}
                                    placeholder="Ej. 1140607059"
                                    className={`w-full px-4 py-3 rounded-xl border text-[12px] font-medium transition-all outline-none ${
                                        isDayMode 
                                            ? 'bg-white border-slate-250 focus:border-[#855b3c]/60 text-slate-900 shadow-sm' 
                                            : 'bg-black/40 border-white/10 focus:border-amber-500/50 text-white'
                                    }`}
                                    required
                                />
                            </div>

                            {/* CTAs */}
                            <div className="flex flex-col gap-3 pt-2">
                                <button
                                    type="button"
                                    disabled={loading}
                                    onClick={() => handleSubmitLead('reunion')}
                                    className="w-full py-4 rounded-2xl font-[1100] text-[10.5px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 btn-3d-amber glow-amber-glow"
                                >
                                    {loading ? 'Procesando...' : 'Agendar Reunión Estratégica'}
                                </button>
                                
                                <button
                                    type="button"
                                    disabled={loading}
                                    onClick={() => handleSubmitLead('dossier')}
                                    className={`w-full py-3.5 rounded-2xl font-black text-[9.5px] uppercase tracking-[0.2em] transition-all border flex items-center justify-center gap-2 active:scale-[0.98] ${
                                        isDayMode 
                                            ? 'bg-slate-100 hover:bg-slate-200 border-[#855b3c]/20 text-[#2d1e15]' 
                                            : 'bg-white/5 hover:bg-white/10 border-white/10 text-white'
                                    }`}
                                >
                                    Solicitar Dossier PDF
                                </button>
                            </div>
                        </form>
                    </div>
                </RevealSection>
            </main>
        </div>
    );
};

export default IndustrialLandingPage;
