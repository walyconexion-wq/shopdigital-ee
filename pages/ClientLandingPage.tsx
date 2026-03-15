import React, { useEffect, useState } from 'react';
import { 
    Smartphone, 
    MapPin, 
    Share2, 
    Search,
    ShoppingBag,
    MessageCircle,
    Navigation,
    Handshake,
    Store,
    Instagram
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { playNeonClick } from '../utils/audio';

const ClientLandingPage: React.FC = () => {
    const navigate = useNavigate();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
        setIsVisible(true);
    }, []);

    const handleShare = () => {
        playNeonClick();
        const shareUrl = window.location.href;
        const shareTitle = 'ShopDigital - Ofertas de tu Barrio';
        const shareText = '¡Mirá! Ahora podés encontrar ofertas y negocios cerca tuyo usando ShopDigital. Entrá acá para ver descuentos exclusivos de nuestro barrio: \n\n👉 ' + shareUrl;

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

    return (
        <div className="min-h-screen bg-black text-white flex flex-col font-sans relative overflow-x-hidden selection:bg-cyan-500/30">
            {/* HUD Background Layers */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.02)_1px,transparent_1px)] bg-[size:30px_30px]" />
            </div>

            {/* Header / Nav */}
            <header className="relative z-20 pt-8 pb-4 px-6 flex justify-between items-center max-w-lg mx-auto w-full">
                <div className="scale-90 origin-left">
                    <Logo />
                </div>
                <button 
                    onClick={handleShare}
                    className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-white/10 transition-all active:scale-95 text-cyan-400"
                >
                    <Share2 size={14} />
                    <span className="text-[9px] font-black uppercase tracking-widest text-white">Compartir</span>
                </button>
            </header>

            <main className="relative z-10 flex flex-col items-center px-4 pt-6 pb-24 max-w-lg mx-auto w-full">
                
                {/* 1. HERO SECTION */}
                <section className={`w-full text-center transition-all duration-1000 mb-16 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <h1 className="text-4xl md:text-5xl font-black mb-4 leading-[1.1] tracking-tighter uppercase px-2 text-shadow-premium">
                        Descubrí las <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.6)]">
                            Ofertas
                        </span><br />
                        de tu barrio
                    </h1>
                    
                    <p className="text-[13px] text-white/70 font-bold leading-relaxed mb-8 px-4">
                        ShopDigital conecta los comercios de tu zona para que encuentres promociones, servicios y catálogos digitales desde tu celular.
                    </p>

                    {/* Hero Image (User Provided) */}
                    <div className="w-full relative h-64 md:h-72 rounded-[2rem] overflow-hidden border border-cyan-400/50 shadow-[0_0_50px_rgba(34,211,238,0.3)] mb-8 bg-cyan-900/10">
                        <img 
                            src="/images/hero-client-landing.jpg" 
                            alt="Cliente escaneando ofertas en vidriera"
                            className="w-full h-full object-cover brightness-105 contrast-110 saturate-110 object-top"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none"></div>
                        <div className="absolute inset-0 shadow-[inset_0_0_30px_rgba(34,211,238,0.4)] rounded-[2rem] pointer-events-none"></div>
                        
                        <div className="absolute bottom-4 left-0 w-full text-center px-4">
                            <p className="text-[11px] font-black uppercase tracking-widest text-cyan-300 drop-shadow-md">
                                Escaneaste el QR correcto.
                            </p>
                            <p className="text-[9px] font-bold text-white/90">
                                Ahora podés descubrir ofertas exclusivas cerca tuyo.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 px-2">
                        <button 
                            onClick={() => {
                                playNeonClick();
                                navigate('/red-comercial/ofertas');
                            }}
                            className="w-full glass-action-btn border-cyan-400/50 shadow-[0_0_30px_rgba(34,211,238,0.4)] bg-cyan-500/20 py-5 px-6 flex items-center justify-center gap-3 active:scale-95 transition-all text-white"
                        >
                            <ShoppingBag size={20} className="text-cyan-100" />
                            <span className="text-[12px] font-[1000] uppercase tracking-widest text-shadow-premium">Ver Ofertas del Barrio</span>
                        </button>
                        <p className="text-[9px] text-cyan-400/60 font-black uppercase tracking-widest">
                            👆 Ingresá ahora para ahorrar en tus compras
                        </p>
                    </div>
                </section>

                {/* 2. SECCIÓN EXPLICACIÓN */}
                <section className="w-full mb-16 scroll-m-20 text-center px-2">
                    <div className="bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 rounded-[2rem] p-8 relative overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.1),transparent_70%)]" />
                        <MapPin size={32} className="text-emerald-400 mx-auto mb-4 relative z-10" />
                        <h2 className="text-2xl font-black uppercase tracking-tighter leading-tight mb-4 relative z-10">
                            Tu barrio ahora está conectado.
                        </h2>
                        <p className="text-[13px] text-white/80 font-bold leading-relaxed relative z-10">
                            ShopDigital conecta comercios locales en una red digital donde podés descubrir promociones, ver catálogos y encontrar servicios cerca tuyo. <br/><br/>
                            <span className="text-emerald-300 font-black uppercase tracking-widest text-[10px]">Todo desde tu celular.</span>
                        </p>
                    </div>
                </section>

                {/* 3. SECCIÓN CÓMO FUNCIONA */}
                <section className="w-full mb-20 px-2">
                    <h2 className="text-center text-[12px] font-[1000] uppercase tracking-[0.4em] text-cyan-400 mb-8">
                        ¿Cómo Funciona?
                    </h2>
                    
                    <div className="relative space-y-6 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-cyan-500/30 before:to-transparent">
                        
                        {/* Paso 1 */}
                        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-cyan-500 bg-black text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.3)] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 font-black text-lg z-10">
                                1
                            </div>
                            <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] glass-card-3d bg-white/5 border-white/10 p-5 rounded-2xl">
                                <h3 className="font-black text-white text-[11px] uppercase tracking-widest mb-1">Escanear</h3>
                                <p className="text-[11px] text-white/60 font-bold leading-relaxed">Escaneá el QR en la vidriera o en la publicidad del local.</p>
                            </div>
                        </div>

                        {/* Paso 2 */}
                        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-cyan-500 bg-black text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.3)] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 font-black text-lg z-10">
                                2
                            </div>
                            <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] glass-card-3d bg-white/5 border-white/10 p-5 rounded-2xl">
                                <h3 className="font-black text-white text-[11px] uppercase tracking-widest mb-1">Explorar</h3>
                                <p className="text-[11px] text-white/60 font-bold leading-relaxed">Ingresá al catálogo digital del comercio y mirá sus productos.</p>
                            </div>
                        </div>

                        {/* Paso 3 */}
                        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-cyan-500 bg-black text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.3)] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 font-black text-lg z-10">
                                3
                            </div>
                            <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] glass-card-3d bg-white/5 border-white/10 p-5 rounded-2xl border-cyan-500/30">
                                <h3 className="font-black text-cyan-400 text-[11px] uppercase tracking-widest mb-1">Registrarse</h3>
                                <p className="text-[11px] text-white/60 font-bold leading-relaxed">Registrate gratis con tu WhatsApp y accedé a promociones exclusivas.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 4. SECCIÓN BENEFICIOS PARA EL CLIENTE */}
                <section className="w-full mb-16">
                    <h2 className="text-2xl font-black uppercase tracking-tighter leading-tight mb-8 text-center px-4">
                        Todo lo que podés hacer con <span className="text-cyan-400">ShopDigital</span>
                    </h2>
                    
                    <div className="grid grid-cols-2 gap-3 px-2">
                        <div className="bg-white/[0.03] border border-white/5 p-4 rounded-2xl flex flex-col items-center text-center gap-3">
                            <Store size={24} className="text-emerald-400" />
                            <p className="text-[9px] font-black uppercase tracking-widest text-white/80">Ver catálogos digitales</p>
                        </div>
                        <div className="bg-cyan-900/10 border border-cyan-500/20 p-4 rounded-2xl flex flex-col items-center text-center gap-3">
                            <ShoppingBag size={24} className="text-cyan-400" />
                            <p className="text-[9px] font-black uppercase tracking-widest text-white/80">Encontrar ofertas y promos</p>
                        </div>
                        <div className="bg-white/[0.03] border border-white/5 p-4 rounded-2xl flex flex-col items-center text-center gap-3">
                            <MapPin size={24} className="text-rose-400" />
                            <p className="text-[9px] font-black uppercase tracking-widest text-white/80">Ver ubicación en el mapa</p>
                        </div>
                        <div className="bg-[#25D366]/10 border border-[#25D366]/20 p-4 rounded-2xl flex flex-col items-center text-center gap-3">
                            <MessageCircle size={24} className="text-[#25D366]" />
                            <p className="text-[9px] font-black uppercase tracking-widest text-white/80">Contactar al comercio</p>
                        </div>
                        <div className="bg-white/[0.03] border border-white/5 p-4 rounded-2xl flex flex-col items-center text-center gap-3">
                            <Search size={24} className="text-yellow-400" />
                            <p className="text-[9px] font-black uppercase tracking-widest text-white/80">Pedir productos o servicios</p>
                        </div>
                        <div className="bg-white/[0.03] border border-white/5 p-4 rounded-2xl flex flex-col items-center text-center gap-3">
                            <Instagram size={24} className="text-purple-400" />
                            <p className="text-[9px] font-black uppercase tracking-widest text-white/80">Acceder a redes sociales</p>
                        </div>
                        <div className="bg-white/[0.03] border border-white/5 p-4 rounded-2xl flex flex-col items-center text-center gap-3">
                            <Navigation size={24} className="text-cyan-400" />
                            <p className="text-[9px] font-black uppercase tracking-widest text-white/80">Cómo llegar desde tu ubicación</p>
                        </div>
                        <div className="bg-[#009EE3]/10 border border-[#009EE3]/20 p-4 rounded-2xl flex flex-col items-center text-center gap-3">
                            <Handshake size={24} className="text-[#009EE3]" />
                            <p className="text-[9px] font-black uppercase tracking-widest text-white/80">Pagar mediante Mercado Pago</p>
                        </div>
                    </div>
                </section>

                {/* 5. CTA INFERIOR */}
                <section className="w-full mt-4 mb-4 text-center">
                    <button 
                        onClick={() => {
                            playNeonClick();
                            navigate('/red-comercial/ofertas');
                        }}
                        className="w-full glass-action-btn border-cyan-400/50 shadow-[0_0_20px_rgba(34,211,238,0.2)] bg-cyan-500/10 py-5 px-6 flex items-center justify-center gap-3 active:scale-95 transition-all text-white mb-6 rounded-2xl"
                    >
                        <ShoppingBag size={20} className="text-cyan-400" />
                        <span className="text-[12px] font-[1000] uppercase tracking-widest">Entrar a la red de beneficios</span>
                    </button>
                    
                    <button 
                        onClick={handleShare}
                        className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white py-4 px-6 rounded-2xl transition-all active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.05)] flex items-center justify-center gap-3"
                    >
                        <Share2 size={16} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Compartir esta App con un amigo</span>
                    </button>
                    <p className="text-[8px] text-white/40 uppercase tracking-[0.3em] font-bold mt-4">
                        Recomendá ShopDigital y ayudá al comercio local
                    </p>
                </section>

            </main>

            {/* Futuristic Footer */}
            <footer className="relative z-20 py-12 border-t border-white/10 bg-black/60 backdrop-blur-sm text-center">
                <div className="scale-75 mb-6 opacity-80 hover:opacity-100 transition-opacity cursor-pointer" onClick={() => navigate('/')}>
                    <Logo />
                </div>
                <div className="flex flex-col gap-2 opacity-30">
                    <p className="text-[8px] font-black uppercase tracking-[0.3em]">ShopDigital.tech · Conectando Barrios</p>
                    <p className="text-[7px] font-bold uppercase tracking-[0.5em]">Powered by Waly · 2026</p>
                </div>
            </footer>
        </div>
    );
};

export default ClientLandingPage;
