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
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { playNeonClick } from '../utils/audio';

const AboutPage: React.FC = () => {
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
            <nav className={`fixed top-0 z-50 w-full transition-all duration-500 border-b ${scrolled ? 'bg-black/80 backdrop-blur-xl border-cyan-500/20 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.5)]' : 'bg-transparent border-transparent py-5'}`}>
                <div className="px-6 flex items-center justify-between max-w-4xl mx-auto">
                    <div className="scale-90 origin-left">
                        <Logo />
                    </div>
                    <button 
                        onClick={() => { playNeonClick(); navigate('/'); }}
                        className="bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 px-4 py-2 rounded-xl flex items-center gap-2 transition-all active:scale-95 group"
                    >
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">Entrar App</span>
                        <ChevronRight size={14} className="text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                </div>
            </nav>

            <main className="relative z-10 flex flex-col items-center w-full">

                {/* ============================================ */}
                {/* 1. HERO SECTION - Foto Portada                */}
                {/* ============================================ */}
                <section className={`w-full pt-24 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <div className="relative w-full aspect-[16/10] md:aspect-[21/9] overflow-hidden">
                        <img 
                            src="/images/hero-about.jpg" 
                            alt="ShopDigital - Encendiendo la Red Comercial del Futuro"
                            className="w-full h-full object-cover object-center brightness-110 contrast-105 saturate-105"
                        />
                        {/* Gradient overlays */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60"></div>
                        <div className="absolute inset-0 shadow-[inset_0_0_60px_rgba(34,211,238,0.15)]"></div>
                        
                        {/* Overlay Text & CTA */}
                        <div className="absolute bottom-6 md:bottom-10 left-0 w-full px-6 md:px-12 max-w-4xl mx-auto text-left" style={{ left: '50%', transform: 'translateX(-50%)' }}>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full mb-4">
                                <Sparkles size={10} className="text-cyan-400" />
                                <span className="text-[8px] uppercase tracking-[0.3em] font-black text-cyan-300">Protocolo Institucional</span>
                            </div>
                            <h1 className="text-2xl sm:text-4xl md:text-5xl font-[1000] leading-[1.05] tracking-tighter mb-4 drop-shadow-2xl">
                                Encendiendo la Red <br className="hidden sm:block" />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                                    Comercial del Futuro.
                                </span>
                            </h1>
                            <p className="text-[11px] sm:text-sm text-white/80 font-bold mb-6 max-w-md">
                                Digitalización local con tecnología de última generación e identidad verificada.
                            </p>
                            <button 
                                onClick={() => { playNeonClick(); navigate('/unirse'); }}
                                className="glass-action-btn btn-cyan-neon bg-cyan-600/30 border-cyan-400 shadow-[0_0_25px_rgba(34,211,238,0.4)] py-4 px-8 rounded-xl flex items-center gap-3 active:scale-95 transition-all"
                            >
                                <Shield size={18} className="text-cyan-100" />
                                <span className="text-[11px] sm:text-xs font-black uppercase tracking-[0.2em] text-white">Quiero Sumar Mi Comercio</span>
                            </button>
                        </div>
                    </div>
                </section>

                {/* ============================================ */}
                {/* 2. ¿QUIÉNES SOMOS? (Misión)                   */}
                {/* ============================================ */}
                <section className="w-full max-w-4xl mx-auto px-6 py-20">
                    <div className="flex flex-col md:flex-row gap-10 items-center">
                        {/* Image */}
                        <div className="w-full md:w-1/2 rounded-[2rem] overflow-hidden border border-cyan-500/20 shadow-[0_0_40px_rgba(34,211,238,0.1)] aspect-[4/3] relative group">
                            <img 
                                src="/images/quienes-somos.png" 
                                alt="Embajadora ShopDigital con comerciante local"
                                className="w-full h-full object-cover brightness-110 contrast-105 group-hover:scale-105 transition-transform duration-[8s]"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                            <div className="absolute inset-0 shadow-[inset_0_0_30px_rgba(34,211,238,0.2)] rounded-[2rem]"></div>
                        </div>
                        
                        {/* Text */}
                        <div className="w-full md:w-1/2">
                            <h2 className="text-2xl sm:text-3xl font-[1000] uppercase tracking-tighter mb-6 leading-tight">
                                ¿Quiénes <span className="text-cyan-400">Somos</span>?
                            </h2>
                            <p className="text-sm text-white/70 leading-relaxed font-medium mb-6">
                                ShopDigital es una plataforma de <strong className="text-white">digitalización hiperlocal</strong>. Nuestra misión es conectar a los comercios de barrio con sus vecinos, utilizando tecnología de punta para crear un ecosistema de confianza y beneficios compartidos.
                            </p>
                            <p className="text-sm text-white/70 leading-relaxed font-medium">
                                No somos solo una app, somos la <strong className="text-cyan-400">infraestructura</strong> que lleva tu negocio al celular de tus clientes.
                            </p>
                        </div>
                    </div>
                </section>

                {/* ============================================ */}
                {/* 3. NUESTRA VISIÓN (3 Pilares)                 */}
                {/* ============================================ */}
                <section className="w-full bg-gradient-to-b from-transparent via-cyan-950/10 to-transparent py-20 px-6">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-14">
                            <h2 className="text-2xl sm:text-3xl font-[1000] uppercase tracking-tighter mb-4">
                                Nuestra <span className="text-cyan-400">Visión</span>
                            </h2>
                            <p className="text-sm text-white/60 font-medium max-w-xl mx-auto leading-relaxed">
                                Visualizamos un futuro donde cada comercio local tenga una identidad digital verificada. Nuestra visión se basa en tres pilares inquebrantables:
                            </p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                <section className="w-full max-w-4xl mx-auto px-6 py-20">
                    <div className="flex flex-col md:flex-row gap-10 items-center">
                        {/* Mockup Image */}
                        <div className="w-full md:w-1/2 flex justify-center">
                            <div className="relative w-64 sm:w-72">
                                <img 
                                    src="/images/cta-mockup-phone.png" 
                                    alt="ShopDigital App Mockup"
                                    className="w-full h-auto drop-shadow-[0_0_40px_rgba(34,211,238,0.2)]"
                                />
                            </div>
                        </div>
                        
                        {/* CTA Actions */}
                        <div className="w-full md:w-1/2 flex flex-col gap-5">
                            <h2 className="text-2xl font-[1000] uppercase tracking-tighter mb-4">
                                Acciones <span className="text-cyan-400">Rápidas</span>
                            </h2>

                            {/* CTA 1: Ingresar a la App */}
                            <button
                                onClick={() => { playNeonClick(); navigate('/'); }}
                                className="w-full glass-action-btn btn-cyan-neon bg-cyan-500/20 border border-cyan-400/50 shadow-[0_0_20px_rgba(34,211,238,0.3)] py-5 px-6 rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all"
                            >
                                <Smartphone size={18} className="text-cyan-100" />
                                <span className="text-[11px] font-[1000] uppercase tracking-widest text-white">Ingresar a la App (Web)</span>
                            </button>

                            {/* CTA 2: Compartir */}
                            <button
                                onClick={handleShare}
                                className="w-full glass-action-btn bg-violet-600/20 border border-violet-400/50 shadow-[0_0_20px_rgba(139,92,246,0.3)] py-5 px-6 rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all hover:bg-violet-600/30"
                            >
                                <Share2 size={18} className="text-violet-300" />
                                <span className="text-[11px] font-[1000] uppercase tracking-widest text-white">Compartir App (WhatsApp)</span>
                            </button>

                            {/* CTA 3: Solicitar Visita */}
                            <button
                                onClick={() => { playNeonClick(); navigate('/unirse'); }}
                                className="w-full glass-action-btn bg-green-600/20 border border-green-400/50 shadow-[0_0_20px_rgba(34,197,94,0.3)] py-5 px-6 rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all hover:bg-green-600/30"
                            >
                                <UserCheck size={18} className="text-green-300" />
                                <span className="text-[11px] font-[1000] uppercase tracking-widest text-white">Solicitar Visita Embajador</span>
                            </button>

                            <p className="text-[8px] text-white/30 uppercase tracking-[0.3em] font-bold text-center mt-2">
                                ShopDigital.tech · Conectando Barrios
                            </p>
                        </div>
                    </div>
                </section>
            </main>

            {/* Futuristic Footer */}
            <footer className="relative z-10 pt-12 pb-16 px-6 border-t border-white/10 bg-black/60 backdrop-blur-sm">
                <div className="max-w-4xl mx-auto flex flex-col items-center gap-8">
                    <div className="scale-75 cursor-pointer hover:opacity-100 opacity-60 transition-opacity" onClick={() => navigate('/')}>
                        <Logo />
                    </div>
                    
                    <div className="flex flex-col items-center gap-4">
                        <div className="h-px bg-cyan-500/20 w-32" />
                        <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.5em] text-center">
                            Powered by Waly · © 2026
                        </p>
                    </div>

                    <button 
                        onClick={() => { playNeonClick(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className="text-[9px] font-black uppercase tracking-[0.3em] text-cyan-400/60 hover:text-cyan-400 transition-colors px-6 py-2 border border-cyan-500/10 rounded-full"
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
