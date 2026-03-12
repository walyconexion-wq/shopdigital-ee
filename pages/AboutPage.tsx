import React, { useEffect, useState } from 'react';
import { 
    Shield, 
    Target, 
    Users, 
    Zap, 
    Mail, 
    MapPin, 
    Phone, 
    ArrowRight, 
    CheckCircle2, 
    Sparkles,
    ChevronRight,
    Globe,
    ExternalLink,
    Lock,
    Share2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';

const AboutPage: React.FC = () => {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleShare = () => {
        const shareUrl = window.location.href;
        const shareTitle = 'ShopDigital - Red Comercial';
        const shareText = '¡Conocé la red digital de comercios de Esteban Echeverría! Sumate a la comunidad y potenciá tu negocio. 🚀\n\n👉 ' + shareUrl;

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

    const features = [
        { 
            icon: <Zap className="text-cyan-400" />, 
            title: 'TECNOLOGÍA RADAR', 
            desc: 'Visualización instantánea de comercios y ofertas en tiempo real.' 
        },
        { 
            icon: <Globe className="text-cyan-400" />, 
            title: 'RED B2B', 
            desc: 'Conectamos dueños de negocios para potenciar beneficios mutuos.' 
        },
        { 
            icon: <Lock className="text-cyan-400" />, 
            title: 'VALIDACIÓN VIP', 
            desc: 'Sistema de credenciales digitales con protocolo anti-captura.' 
        }
    ];

    return (
        <div className="min-h-screen bg-black text-white flex flex-col font-sans relative overflow-x-hidden selection:bg-cyan-500/30">
            {/* HUD Background Layers */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-[-10%] w-[80%] h-[40%] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-0 left-[-10%] w-[80%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.03)_1px,transparent_1px),linear-gradient(90px,rgba(34,211,238,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
            </div>

            {/* Sticky Header */}
            <nav className={`fixed top-0 z-50 w-full transition-all duration-500 border-b ${scrolled ? 'bg-black/80 backdrop-blur-xl border-cyan-500/20 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.5)]' : 'bg-transparent border-transparent py-5'}`}>
                <div className="px-6 flex items-center justify-between max-w-lg mx-auto">
                    <div className="scale-90 origin-left">
                        <Logo />
                    </div>
                    <button 
                        onClick={() => navigate('/')}
                        className="bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 px-4 py-2 rounded-xl flex items-center gap-2 transition-all active:scale-95 group"
                    >
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">Entrar App</span>
                        <ChevronRight size={14} className="text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                </div>
            </nav>

            {/* Hero Mobile Section */}
            <main className="relative z-10 pt-32 pb-16 px-6 max-w-lg mx-auto flex flex-col items-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-full mb-6 animate-in fade-in slide-in-from-top-4 duration-700">
                    <Sparkles size={12} className="text-cyan-400" />
                    <span className="text-[10px] uppercase tracking-[0.3em] font-black text-cyan-300">Protocolo Institucional</span>
                </div>
                
                <h1 className="text-5xl font-black mb-6 leading-[0.9] tracking-tighter text-center uppercase">
                    Red Digital de <br /> 
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-500 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">
                        Comercios
                    </span>
                </h1>
                
                <p className="text-sm text-white/70 font-bold leading-relaxed text-center mb-10 px-2 tracking-tight">
                    ShopDigital.tech es la vidriera del futuro para Esteban Echeverría. Conectamos comercios con su comunidad mediante una experiencia 100% digital, rápida y segura.
                </p>

                <div className="w-full space-y-4 mb-16">
                    <button 
                        onClick={() => navigate('/')}
                        className="w-full glass-button-3d btn-neon-active py-5 px-8 flex items-center justify-center gap-4 group"
                    >
                        <span className="text-sm font-black uppercase tracking-[0.2em]">Acceder Ahora</span>
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                    <p className="text-[8px] font-black text-cyan-500/40 text-center uppercase tracking-[0.4em]">98% de accesibilidad mobile garantizada</p>
                </div>

                {/* Info Blocks - HUD Style */}
                <div className="w-full space-y-6">
                    <div className="flex flex-col gap-3">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-cyan-400/60 mb-2 pl-2">Nuestro Core</h2>
                        {features.map((feat, i) => (
                            <div key={i} className="bg-white/5 border border-white/10 rounded-3xl p-6 flex items-start gap-4 backdrop-blur-sm group hover:border-cyan-500/30 transition-all">
                                <div className="mt-1 p-3 bg-cyan-500/10 rounded-2xl group-hover:scale-110 transition-transform">
                                    {feat.icon}
                                </div>
                                <div className="flex flex-col gap-1">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-white">{feat.title}</h3>
                                    <p className="text-[11px] text-white/50 font-medium leading-relaxed">{feat.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent my-10" />

                    <div className="bg-cyan-500/[0.03] border border-cyan-500/10 rounded-[2.5rem] p-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-cyan-500/20 transition-all" />
                        
                        <h2 className="text-2xl font-black mb-6 uppercase tracking-tighter leading-none">
                            Misión <br/>
                            <span className="text-cyan-400">ShopDigital</span>
                        </h2>
                        
                        <p className="text-sm text-white/60 leading-relaxed font-bold mb-8">
                            Nacimos para democratizar la pauta digital. Queremos que cada local en Esteban Echeverría tenga una presencia digna de Silicon Valley, conectando con sus vecinos de forma real.
                        </p>

                        <div className="space-y-4">
                            {[
                                'Potenciamos el consumo local real',
                                'Digitalización de catálogos sin fricción',
                                'Vínculos VIP entre comercios'
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <CheckCircle2 size={16} className="text-cyan-400 shrink-0" />
                                    <span className="text-[11px] font-black uppercase tracking-tight text-white/80">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Contact - Direct to Waly */}
                    <div className="mt-16 bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-10 flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-cyan-500/10 rounded-full flex items-center justify-center mb-6 border border-cyan-500/20 shadow-[0_0_20px_rgba(34,211,238,0.1)]">
                            <Mail className="text-cyan-400" size={24} />
                        </div>
                        <h2 className="text-xl font-black uppercase tracking-widest mb-4">¿Querés unirte?</h2>
                        <p className="text-xs text-white/40 font-bold mb-8 leading-relaxed">
                            Formá parte de la red comercial más potente de zona sur. Hablá ahora con nuestro equipo.
                        </p>
                        
                        <div className="w-full space-y-4">
                            <a href="mailto:contacto@shopdigital.tech" className="flex items-center justify-between bg-white/5 px-6 py-4 rounded-2xl hover:bg-white/10 transition-colors">
                                <div className="flex items-center gap-3">
                                    <Mail size={16} className="text-cyan-400/50" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Escribinos</span>
                                </div>
                                <ExternalLink size={14} className="text-white/20" />
                            </a>
                            <div className="flex items-center justify-center gap-8 py-4 opacity-50">
                                <div className="flex items-center gap-2">
                                    <MapPin size={12} className="text-cyan-400" />
                                    <span className="text-[8px] font-black uppercase tracking-widest tracking-[0.4em]">E. Echeverría</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone size={12} className="text-cyan-400" />
                                    <span className="text-[8px] font-black uppercase tracking-widest tracking-[0.4em]">WhatsApp Activo</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Funnel Share Button - The Master Move */}
                    <div className="mt-12 w-full animate-in fade-in slide-in-from-bottom-8 duration-1000">
                        <button 
                            onClick={handleShare}
                            className="w-full glass-action-btn btn-cyan-neon luminous-glow py-6 px-10 flex items-center justify-center gap-4 group"
                        >
                            <span className="text-sm font-black uppercase tracking-[0.2em]">Compartir Proyecto</span>
                            <Share2 size={20} className="text-cyan-400 group-hover:rotate-12 transition-transform" />
                        </button>
                        <p className="text-[10px] text-cyan-400/40 text-center uppercase tracking-[0.3em] mt-4 font-black italic">
                            Impulsá la red y ganá puntos ShopDigital
                        </p>
                    </div>
                </div>
            </main>

            {/* Futuristic Footer */}
            <footer className="relative z-10 pt-12 pb-16 px-6 border-t border-white/10 mt-12 bg-black/60 backdrop-blur-sm">
                <div className="max-w-lg mx-auto flex flex-col items-center gap-8">
                    <div className="scale-75">
                        <Logo />
                    </div>
                    
                    <div className="flex flex-col items-center gap-4">
                        <div className="flex gap-4 items-center h-px bg-cyan-500/20 w-32" />
                        <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.5em] text-center">
                            Powered by Waly · © 2026
                        </p>
                    </div>

                    <button 
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="text-[9px] font-black uppercase tracking-[0.3em] text-cyan-400/60 hover:text-cyan-400 transition-colors px-6 py-2 border border-cyan-500/10 rounded-full"
                    >
                        Volver al inicio
                    </button>
                    
                    <div className="text-center">
                        <p className="text-[7px] font-black uppercase tracking-[0.8em] text-cyan-500/30 flex items-center gap-2 justify-center mr-[-0.8em]">
                            SHOPDIGITAL.TECH
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default AboutPage;
