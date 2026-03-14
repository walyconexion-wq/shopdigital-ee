import React, { useEffect, useState } from 'react';
import { 
    Smartphone, 
    Zap, 
    Target, 
    Sparkles, 
    ArrowRight, 
    ShieldCheck, 
    ChevronRight,
    MessageSquare,
    Info,
    LayoutDashboard,
    Share2,
    Store,
    Globe
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { playNeonClick } from '../utils/audio';

const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
        setIsVisible(true);
    }, []);

    const handleShare = () => {
        playNeonClick();
        const shareUrl = window.location.href;
        const shareTitle = 'ShopDigital - Sumá tu Comercio';
        const shareText = '¡Hacé crecer tu negocio con ShopDigital! Escaneá y descubrí el futuro de Esteban Echeverría. 🚀\n\n👉 ' + shareUrl;

        if (navigator.share) {
            navigator.share({
                title: shareTitle,
                text: shareText,
                url: shareUrl,
            }).catch(console.error);
        } else {
            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
            window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
        }
    };

    const benefits = [
        { 
            icon: <Zap className="text-cyan-400" />, 
            title: 'VELOCIDAD TOTAL', 
            desc: 'Tus productos cargan al instante en cualquier dispositivo.' 
        },
        { 
            icon: <Target className="text-cyan-400" />, 
            title: 'ALCANCE BARRIAL', 
            desc: 'Llegá a los vecinos de E. Echeverría con precisión quirúrgica.' 
        },
        { 
            icon: <ShieldCheck className="text-cyan-400" />, 
            title: 'SEGURIDAD VIP', 
            desc: 'Protocolos anti-captura para tus credenciales y descuentos.' 
        }
    ];

    return (
        <div className="min-h-screen bg-black text-white flex flex-col font-sans relative overflow-x-hidden selection:bg-cyan-500/30">
            {/* HUD Background Layers */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.02)_1px,transparent_1px)] bg-[size:30px_30px]" />
            </div>

            {/* Header / Nav */}
            <header className="relative z-20 pt-8 pb-4 px-6 flex justify-between items-center max-w-lg mx-auto w-full">
                <div className="scale-90 origin-left">
                    <Logo />
                </div>
                <button 
                    onClick={() => {
                        playNeonClick();
                        navigate('/');
                    }}
                    className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-white/10 transition-all active:scale-95"
                >
                    <LayoutDashboard size={14} className="text-cyan-400" />
                    <span className="text-[9px] font-black uppercase tracking-widest">App Central</span>
                </button>
            </header>

            <main className="relative z-10 flex flex-col items-center px-6 pt-10 pb-24 max-w-lg mx-auto w-full">
                {/* Hero Section */}
                <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-full mb-6">
                        <Sparkles size={12} className="text-cyan-400" />
                        <span className="text-[10px] uppercase tracking-[0.3em] font-black text-cyan-300">Net Digital 2026</span>
                    </div>
                    
                    <h1 className="text-6xl font-black mb-4 leading-none tracking-tighter uppercase">
                        Conectá tu <br /> 
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 drop-shadow-[0_0_15px_rgba(34,211,238,0.6)]">
                            Comercio
                        </span>
                    </h1>
                    
                    <p className="text-sm text-white/60 font-bold leading-relaxed mb-12 px-4">
                        La vidriera profesional que tu negocio necesita en Esteban Echeverría. Formá parte de la red más avanzada.
                    </p>
                </div>

                {/* Animated HUD Radar Graphic */}
                <div className="relative w-full aspect-square max-w-[300px] mb-16">
                    <div className="absolute inset-0 border-[0.5px] border-cyan-500/20 rounded-full animate-[spin_30s_linear_infinite]" />
                    <div className="absolute inset-8 border-[1px] border-dashed border-cyan-500/40 rounded-full animate-[spin_20s_linear_infinite_reverse]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.05),transparent_70%)]" />
                    
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative group">
                            <div className="absolute -inset-4 bg-cyan-500/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                            <div className="glass-card-3d p-10 rounded-[3rem] border border-cyan-400/30 shadow-[0_0_50px_rgba(34,211,238,0.15)] relative z-10">
                                <Smartphone size={80} strokeWidth={0.5} className="text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                            </div>
                        </div>
                    </div>

                    {/* Orbiting Tech Badges */}
                    <div className="absolute top-0 right-0 glass-card-3d p-3 rounded-2xl border border-white/20 animate-bounce cursor-default">
                        <Zap size={18} className="text-cyan-400" />
                    </div>
                    <div className="absolute bottom-10 left-0 glass-card-3d p-3 rounded-2xl border border-white/20 animate-pulse cursor-default">
                        <Globe size={18} className="text-blue-400" />
                    </div>
                </div>

                {/* Benefits Funnel */}
                <div className="w-full space-y-6 mb-20">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-cyan-400/60 mb-2 pl-4">Ventajas Técnicas</h2>
                    {benefits.map((benefit, i) => (
                        <div 
                            key={i} 
                            className={`bg-white/[0.03] border border-white/5 rounded-3xl p-6 flex items-start gap-4 backdrop-blur-sm hover:border-cyan-500/30 transition-all duration-500 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}
                            style={{ transitionDelay: `${i * 200 + 500}ms` }}
                        >
                            <div className="p-3 bg-cyan-500/10 rounded-2xl shrink-0">
                                {benefit.icon}
                            </div>
                            <div className="flex flex-col gap-1">
                                <h3 className="text-xs font-black uppercase tracking-widest text-white">{benefit.title}</h3>
                                <p className="text-[11px] text-white/50 font-medium leading-relaxed">{benefit.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Conversion Section - The Funnel Bottom */}
                <div className="w-full space-y-6">
                    <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-[2.5rem] p-8 text-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.1),transparent_50%)]" />
                        
                        <h2 className="text-2xl font-black mb-4 uppercase tracking-tighter leading-none relative z-10">
                            ¿Listo para <br/>
                            <span className="text-cyan-400">Digitalizarte?</span>
                        </h2>
                        
                        <p className="text-xs text-white/40 font-bold mb-8 leading-relaxed relative z-10">
                            Unite a la red comercial más potente de la zona y empezá a brillar hoy mismo.
                        </p>

                        <div className="space-y-4 relative z-10">
                            <button 
                                onClick={() => playNeonClick()}
                                className="w-full glass-button-3d btn-neon-active py-5 px-8 flex items-center justify-center gap-4 group"
                            >
                                <span className="text-sm font-black uppercase tracking-[0.2em]">Unirse a la Red</span>
                                <MessageSquare size={20} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                            
                            <div className="grid grid-cols-2 gap-3">
                                <button 
                                    onClick={() => {
                                        playNeonClick();
                                        navigate('/nosotros');
                                    }}
                                    className="bg-white/5 border border-white/10 py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
                                >
                                    <Info size={14} className="text-cyan-400/50" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Conocé Más</span>
                                </button>
                                <button 
                                    onClick={() => {
                                        playNeonClick();
                                        navigate('/');
                                    }}
                                    className="bg-white/5 border border-white/10 py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
                                >
                                    <ChevronRight size={14} className="text-cyan-400/50" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Ir a la App</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <p className="text-[8px] font-black text-cyan-500/40 text-center uppercase tracking-[0.5em] mt-10">
                        98% Mobile Optimization Guarantee
                    </p>

                    {/* Funnel Share Button - Drive Growth */}
                    <div className="mt-8 w-full space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                        <button 
                            onClick={() => {
                                playNeonClick();
                                navigate('/subscripcion');
                            }}
                            className="w-full glass-action-btn border-green-400/50 shadow-[0_0_20px_rgba(74,222,128,0.2)] bg-green-500/10 py-5 px-10 flex items-center justify-center gap-4 group hover:bg-green-500/20 transition-all active:scale-95"
                        >
                            <Store size={20} className="text-green-400" />
                            <span className="text-sm font-black uppercase tracking-[0.2em] text-white">Suscribir Mi Comercio</span>
                        </button>

                        <button 
                            onClick={handleShare}
                            className="w-full glass-action-btn btn-cyan-neon luminous-glow py-5 px-10 flex items-center justify-center gap-4 group"
                        >
                            <span className="text-sm font-black uppercase tracking-[0.2em]">Compartir Red</span>
                            <Share2 size={20} className="text-cyan-400 group-hover:rotate-12 transition-transform" />
                        </button>
                    </div>
                </div>
            </main>

            {/* Futuristic Footer */}
            <footer className="relative z-20 py-12 border-t border-white/10 bg-black/60 backdrop-blur-sm text-center">
                <div className="scale-75 mb-8">
                    <Logo />
                </div>
                <div className="flex flex-col gap-2 opacity-30">
                    <p className="text-[8px] font-black uppercase tracking-[0.3em]">ShopDigital.tech · Esteban Echeverría</p>
                    <p className="text-[7px] font-bold uppercase tracking-[0.5em]">Powered by Waly · 2026</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
