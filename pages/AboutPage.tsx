import React, { useEffect, useState } from 'react';
import { 
    Shield, 
    BarChart3, 
    Handshake, 
    Share2, 
    ChevronRight, 
    Sparkles,
    Lock,
    Smartphone,
    UserCheck
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import Logo from '../components/Logo';
import { playNeonClick } from '../utils/audio';

const AboutPage: React.FC = () => {
    const { townId = 'esteban-echeverria' } = useParams<{ townId: string }>();
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
        setIsVisible(true);
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleShare = () => {
        playNeonClick();
        const shareUrl = 'https://shopdigital.tech';
        const shareText = '¡Conocé ShopDigital! La red comercial digital de Esteban Echeverría. Sumate y potenciá tu negocio. 🚀\n\n👉 ' + shareUrl;

        if (navigator.share) {
            navigator.share({ title: 'ShopDigital', text: shareText, url: shareUrl }).catch(console.error);
        } else {
            window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col font-sans relative overflow-x-hidden selection:bg-cyan-500/30">
            {/* HUD Background Layers */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-[-10%] w-[80%] h-[40%] bg-cyan-500/8 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-0 left-[-10%] w-[80%] h-[40%] bg-blue-500/8 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
            </div>

            {/* STICKY HEADER (Logo + Entrar App) */}
            <nav className={`fixed top-0 z-50 w-full transition-all duration-500 border-b ${scrolled ? 'bg-black/80 backdrop-blur-xl border-cyan-500/20 py-2 shadow-[0_10px_30px_rgba(0,0,0,0.5)]' : 'bg-transparent border-transparent py-3'}`}>
                <div className="px-4 flex items-center justify-between w-full max-w-lg mx-auto">
                    <div className="scale-75 origin-left">
                        <Logo />
                    </div>
                    <button 
                        onClick={() => { playNeonClick(); navigate(`/${townId}/home`); }}
                        className="bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all active:scale-95 group shrink-0"
                    >
                        <span className="text-[9px] font-black uppercase tracking-[0.15em] text-cyan-400">Entrar App</span>
                        <ChevronRight size={12} className="text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                </div>
            </nav>

            <main className="relative z-10 flex flex-col items-center w-full">

                {/* ============================================ */}
                {/* 1. HERO SECTION - Foto Portada                */}
                {/* ============================================ */}
                <section className={`w-full pt-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    {/* Hero Image - Clean, full width */}
                    <div className="relative w-full aspect-[16/9] overflow-hidden">
                        <img 
                            src="/images/hero-about.jpg" 
                            alt="ShopDigital - Encendiendo la Red Comercial del Futuro"
                            className="w-full h-full object-cover object-center brightness-110 contrast-105 saturate-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent"></div>
                        <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(34,211,238,0.1)]"></div>
                    </div>
                    
                    {/* Hero Content - Below image, clean mobile block */}
                    <div className="px-5 py-8 max-w-lg mx-auto">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full mb-4">
                            <Sparkles size={10} className="text-cyan-400" />
                            <span className="text-[8px] uppercase tracking-[0.3em] font-black text-cyan-300">Protocolo Institucional</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-[1000] leading-[1.1] tracking-tighter mb-4">
                            Encendiendo la Red <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                                Comercial del Futuro.
                            </span>
                        </h1>
                        <p className="text-[12px] text-white/80 font-bold mb-6 leading-relaxed">
                            Digitalización local con tecnología de última generación e identidad verificada.
                        </p>
                        <button 
                            onClick={() => { playNeonClick(); navigate(`/${townId}/subscripcion`); }}
                            className="w-full glass-action-btn btn-cyan-neon bg-cyan-600/30 border-cyan-400 shadow-[0_0_25px_rgba(34,211,238,0.4)] py-4 px-6 rounded-xl flex items-center justify-center gap-3 active:scale-95 transition-all"
                        >
                            <Shield size={16} className="text-cyan-100" />
                            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-white">Quiero Sumar Mi Comercio</span>
                        </button>
                    </div>
                </section>

                {/* ============================================ */}
                {/* 2. ¿QUIÉNES SOMOS? (Misión)                   */}
                {/* ============================================ */}
                <section className="w-full max-w-lg mx-auto px-5 py-16">
                    <div className="flex flex-col gap-8 items-center">
                        {/* Image */}
                        <div className="w-full rounded-[2rem] overflow-hidden border border-cyan-500/20 shadow-[0_0_40px_rgba(34,211,238,0.1)] aspect-[4/3] relative group">
                            <img 
                                src="/images/quienes-somos.png" 
                                alt="Embajadora ShopDigital con comerciante local"
                                className="w-full h-full object-cover brightness-110 contrast-105 group-hover:scale-105 transition-transform duration-[8s]"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                            <div className="absolute inset-0 shadow-[inset_0_0_30px_rgba(34,211,238,0.2)] rounded-[2rem]"></div>
                        </div>
                        
                        {/* Text */}
                        <div className="w-full">
                            <h2 className="text-2xl font-[1000] uppercase tracking-tighter mb-4 leading-tight">
                                ¿Quiénes <span className="text-cyan-400">Somos</span>?
                            </h2>
                            <p className="text-[12px] text-white/70 leading-relaxed font-medium mb-4">
                                ShopDigital es una plataforma de <strong className="text-white">digitalización hiperlocal</strong>. Nuestra misión es conectar a los comercios de barrio con sus vecinos, utilizando tecnología de punta para crear un ecosistema de confianza y beneficios compartidos.
                            </p>
                            <p className="text-[12px] text-white/70 leading-relaxed font-medium">
                                No somos solo una app, somos la <strong className="text-cyan-400">infraestructura</strong> que lleva tu negocio al celular de tus clientes.
                            </p>
                        </div>
                    </div>
                </section>

                {/* ============================================ */}
                {/* 3. NUESTRA VISIÓN (3 Pilares)                 */}
                {/* ============================================ */}
                <section className="w-full py-16 px-5">
                    <div className="max-w-lg mx-auto">
                        <div className="text-center mb-10">
                            <h2 className="text-2xl font-[1000] uppercase tracking-tighter mb-3">
                                Nuestra <span className="text-cyan-400">Visión</span>
                            </h2>
                            <p className="text-[12px] text-white/60 font-medium leading-relaxed">
                                Visualizamos un futuro donde cada comercio local tenga una identidad digital verificada. Nuestra visión se basa en tres pilares inquebrantables:
                            </p>
                        </div>
                        
                        <div className="flex flex-col gap-4">
                            {/* Pilar 1: Verificación Real */}
                            <div className="glass-card-3d bg-[#0A0A0A] border border-white/5 hover:border-cyan-500/30 p-8 rounded-3xl transition-all group text-center">
                                <div className="w-16 h-16 mx-auto bg-cyan-500/10 rounded-2xl flex items-center justify-center mb-6 border border-cyan-500/20 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(34,211,238,0.15)]">
                                    <Lock size={28} className="text-cyan-400" />
                                </div>
                                <h3 className="text-sm font-black uppercase tracking-widest text-white mb-3">Verificación Real</h3>
                                <p className="text-[12px] text-white/50 leading-relaxed font-medium">
                                    Credenciales con relojes en tiempo real y validación física por <strong className="text-white">Embajadores de Zona</strong>.
                                </p>
                            </div>

                            {/* Pilar 2: Data Segmentada */}
                            <div className="glass-card-3d bg-[#0A0A0A] border border-white/5 hover:border-yellow-500/30 p-8 rounded-3xl transition-all group text-center">
                                <div className="w-16 h-16 mx-auto bg-yellow-500/10 rounded-2xl flex items-center justify-center mb-6 border border-yellow-500/20 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(234,179,8,0.15)]">
                                    <BarChart3 size={28} className="text-yellow-400" />
                                </div>
                                <h3 className="text-sm font-black uppercase tracking-widest text-white mb-3">Data Segmentada</h3>
                                <p className="text-[12px] text-white/50 leading-relaxed font-medium">
                                    Conectamos productos con el <strong className="text-white">nicho exacto</strong> de consumo. Gastronomía, Ferretería, Estética y más.
                                </p>
                            </div>

                            {/* Pilar 3: Economía Circular */}
                            <div className="glass-card-3d bg-[#0A0A0A] border border-white/5 hover:border-green-500/30 p-8 rounded-3xl transition-all group text-center">
                                <div className="w-16 h-16 mx-auto bg-green-500/10 rounded-2xl flex items-center justify-center mb-6 border border-green-500/20 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(34,197,94,0.15)]">
                                    <Handshake size={28} className="text-green-400" />
                                </div>
                                <h3 className="text-sm font-black uppercase tracking-widest text-white mb-3">Economía Circular B2B</h3>
                                <p className="text-[12px] text-white/50 leading-relaxed font-medium">
                                    Descuentos exclusivos entre <strong className="text-white">comerciantes de la red</strong>. Potenciamos la economía de barrio.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ============================================ */}
                {/* 4. ACCIONES RÁPIDAS (CTA Block)               */}
                {/* ============================================ */}
                <section className="w-full max-w-lg mx-auto px-5 py-16">
                    <div className="flex flex-col gap-8 items-center">
                        {/* Mockup Image */}
                        <div className="w-48 sm:w-56 mx-auto">
                            <img 
                                src="/images/cta-mockup-phone.png" 
                                alt="ShopDigital App Mockup"
                                className="w-full h-auto drop-shadow-[0_0_40px_rgba(34,211,238,0.2)]"
                            />
                        </div>
                        
                        {/* CTA Actions */}
                        <div className="w-full flex flex-col gap-4">
                            <h2 className="text-2xl font-[1000] uppercase tracking-tighter mb-2 text-center">
                                Acciones <span className="text-cyan-400">Rápidas</span>
                            </h2>

                            <button
                                onClick={() => { playNeonClick(); navigate(`/${townId}/home`); }}
                                className="w-full glass-action-btn btn-cyan-neon bg-cyan-500/20 border border-cyan-400/50 shadow-[0_0_20px_rgba(34,211,238,0.3)] py-4 px-5 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all"
                            >
                                <Smartphone size={16} className="text-cyan-100" />
                                <span className="text-[10px] font-[1000] uppercase tracking-widest text-white">Ingresar a la App</span>
                            </button>

                            <button
                                onClick={handleShare}
                                className="w-full glass-action-btn bg-violet-600/20 border border-violet-400/50 shadow-[0_0_20px_rgba(139,92,246,0.3)] py-4 px-5 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all hover:bg-violet-600/30"
                            >
                                <Share2 size={16} className="text-violet-300" />
                                <span className="text-[10px] font-[1000] uppercase tracking-widest text-white">Compartir (WhatsApp)</span>
                            </button>

                            <button
                                onClick={() => { playNeonClick(); navigate(`/${townId}/subscripcion`); }}
                                className="w-full glass-action-btn bg-green-600/20 border border-green-400/50 shadow-[0_0_20px_rgba(34,197,94,0.3)] py-4 px-5 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all hover:bg-green-600/30"
                            >
                                <UserCheck size={16} className="text-green-300" />
                                <span className="text-[10px] font-[1000] uppercase tracking-widest text-white">Solicitar Visita Embajador</span>
                            </button>

                            <p className="text-[8px] text-white/30 uppercase tracking-[0.3em] font-bold text-center mt-2">
                                ShopDigital.tech · Conectando Barrios
                            </p>
                        </div>
                    </div>
                </section>
            </main>

            {/* Futuristic Footer */}
            <footer className="relative z-10 pt-10 pb-14 px-5 border-t border-white/10 bg-black/60 backdrop-blur-sm">
                <div className="max-w-lg mx-auto flex flex-col items-center gap-6">
                    <div className="scale-75 cursor-pointer hover:opacity-100 opacity-60 transition-opacity" onClick={() => navigate(`/${townId}/home`)}>
                        <Logo />
                    </div>
                    
                    <div className="flex flex-col items-center gap-3">
                        <div className="h-px bg-cyan-500/20 w-24" />
                        <p className="text-[7px] font-black text-white/20 uppercase tracking-[0.5em] text-center">
                            Powered by Waly · © 2026
                        </p>
                    </div>

                    <button 
                        onClick={() => { playNeonClick(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className="text-[8px] font-black uppercase tracking-[0.3em] text-cyan-400/60 hover:text-cyan-400 transition-colors px-5 py-2 border border-cyan-500/10 rounded-full"
                    >
                        Volver al inicio
                    </button>
                    
                    <p className="text-[7px] font-black uppercase tracking-[0.8em] text-cyan-500/30">
                        SHOPDIGITAL.TECH
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default AboutPage;
