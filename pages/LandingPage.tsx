import React, { useEffect, useState } from 'react';
import { 
    Smartphone, 
    Store, 
    Share2, 
    Info, 
    ChevronRight,
    Search,
    Users,
    TrendingUp,
    ScanLine,
    ShieldCheck,
    LayoutDashboard
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
        const shareText = '¡Promocioná tu negocio y conseguí más clientes conectándote a ShopDigital! 🚀\n\n👉 ' + shareUrl;

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
                    onClick={handleShare}
                    className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-white/10 transition-all active:scale-95 text-cyan-400"
                >
                    <Share2 size={14} />
                    <span className="text-[9px] font-black uppercase tracking-widest text-white">Compartir</span>
                </button>
            </header>

            <main className="relative z-10 flex flex-col items-center px-4 pt-6 pb-24 max-w-lg mx-auto w-full">
                
                {/* 1. HERO SECTION */}
                <section className={`w-full text-center transition-all duration-1000 mb-20 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <h1 className="text-4xl md:text-5xl font-black mb-4 leading-[1.1] tracking-tighter uppercase px-2 text-shadow-premium">
                        Conectá tu <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 drop-shadow-[0_0_15px_rgba(34,211,238,0.6)]">
                            comercio
                        </span><br />
                        a la red digital
                    </h1>
                    
                    <p className="text-sm text-white/70 font-bold leading-relaxed mb-8 px-6">
                        Promocioná tu negocio, conseguí más clientes y tené tu catálogo digital dentro de ShopDigital.
                    </p>

                    {/* Hero Image */}
                    <div className="w-full relative h-48 md:h-64 rounded-3xl overflow-hidden border border-cyan-500/20 shadow-[0_0_40px_rgba(34,211,238,0.2)] mb-8">
                        <img 
                            src="https://images.unsplash.com/photo-1556740749-887f6717d4e4?w=800&h=600&fit=crop" 
                            alt="Comercio conectado"
                            className="w-full h-full object-cover opacity-80"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                    </div>

                    <div className="flex flex-col gap-4 px-2">
                        <button 
                            onClick={() => {
                                playNeonClick();
                                navigate('/subscripcion');
                            }}
                            className="w-full glass-action-btn border-green-400/50 shadow-[0_0_20px_rgba(74,222,128,0.2)] bg-green-500/10 py-5 px-6 flex items-center justify-center gap-3 active:scale-95 transition-all text-white"
                        >
                            <Store size={20} className="text-green-400" />
                            <span className="text-[12px] font-[1000] uppercase tracking-widest">Sumar mi comercio a ShopDigital</span>
                        </button>
                        
                        <div className="grid grid-cols-2 gap-3">
                            <button 
                                onClick={() => { playNeonClick(); navigate('/'); }}
                                className="bg-white/5 border border-white/10 py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-white/10 transition-all text-white"
                            >
                                <LayoutDashboard size={14} className="text-cyan-400" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Ver la Aplicación</span>
                            </button>
                            <button 
                                onClick={() => { playNeonClick(); navigate('/nosotros'); }}
                                className="bg-white/5 border border-white/10 py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-white/10 transition-all text-white"
                            >
                                <Info size={14} className="text-cyan-400" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Quiénes Somos</span>
                            </button>
                        </div>
                    </div>
                </section>

                {/* 2. SECCIÓN PROBLEMA */}
                <section className="w-full mb-20 scroll-m-20">
                    <div className="bg-gradient-to-br from-red-500/10 to-transparent border border-red-500/20 rounded-[2.5rem] p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Smartphone size={100} />
                        </div>
                        <h2 className="text-2xl font-black uppercase tracking-tighter leading-tight mb-4 relative z-10">
                            Hoy los clientes buscan todo desde el celular.
                        </h2>
                        <img 
                            src="https://images.unsplash.com/photo-1512428559087-560fa5ceab42?w=800&h=600&fit=crop" 
                            alt="Clientes usando celulares"
                            className="w-full h-32 object-cover rounded-2xl mb-4 border border-white/10 opacity-70"
                        />
                        <p className="text-[13px] text-white/70 font-bold leading-relaxed relative z-10">
                            Si tu negocio no aparece en internet, estás perdiendo oportunidades todos los días. <br/><br/>
                            <span className="text-white">ShopDigital conecta tu comercio con clientes que están buscando productos y servicios cerca suyo.</span>
                        </p>
                    </div>
                </section>

                {/* 3. SECCIÓN SOLUCIÓN */}
                <section className="w-full mb-20">
                    <h2 className="text-3xl font-black uppercase tracking-tighter leading-tight mb-6 text-center">
                        Tu comercio dentro de una <span className="text-cyan-400">red digital</span>.
                    </h2>
                    
                    <div className="glass-card-3d bg-cyan-950/20 border-cyan-500/30 p-6 rounded-[2rem] shadow-[0_0_30px_rgba(34,211,238,0.1)] mb-6">
                        <img 
                            src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop" 
                            alt="Dashboard digital"
                            className="w-full h-40 object-cover rounded-xl mb-6 border border-cyan-500/20 opacity-80"
                        />
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <div className="p-1 bg-cyan-500/20 rounded-full mt-0.5"><ChevronRight size={14} className="text-cyan-400" /></div>
                                <span className="text-[13px] font-bold text-white/80 leading-relaxed">Tu negocio tiene un catálogo digital dentro de la red.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="p-1 bg-cyan-500/20 rounded-full mt-0.5"><ChevronRight size={14} className="text-cyan-400" /></div>
                                <span className="text-[13px] font-bold text-white/80 leading-relaxed">Los clientes pueden encontrarte, ver tus productos y suscribirse a tus ofertas.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="p-1 bg-cyan-500/20 rounded-full mt-0.5"><ChevronRight size={14} className="text-cyan-400" /></div>
                                <span className="text-[13px] font-bold text-white/80 leading-relaxed">Tu vidriera se transforma en una puerta digital mediante códigos QR.</span>
                            </li>
                        </ul>
                    </div>
                </section>

                {/* 4. SECCIÓN BENEFICIOS */}
                <section className="w-full mb-20">
                    <h2 className="text-center text-[11px] font-[1000] uppercase tracking-[0.5em] text-cyan-400 mb-8 border-b border-cyan-400/20 pb-4">
                        Beneficios para tu comercio
                    </h2>
                    <div className="grid grid-cols-1 gap-4">
                        {/* Benefit 1 */}
                        <div className="bg-white/[0.03] border border-white/5 p-6 rounded-3xl flex gap-4 items-start">
                            <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl shrink-0">
                                <Store size={24} className="text-cyan-400" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-widest text-white mb-2">Catálogo Digital</h3>
                                <p className="text-[11px] font-bold text-white/50 leading-relaxed">Tu negocio tiene su propia página con información, productos y redes sociales.</p>
                            </div>
                        </div>
                        {/* Benefit 2 */}
                        <div className="bg-white/[0.03] border border-white/5 p-6 rounded-3xl flex gap-4 items-start">
                            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-2xl shrink-0">
                                <Users size={24} className="text-green-400" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-widest text-white mb-2">Captación de clientes</h3>
                                <p className="text-[11px] font-bold text-white/50 leading-relaxed">Los clientes pueden suscribirse y recibir promociones.</p>
                            </div>
                        </div>
                        {/* Benefit 3 */}
                        <div className="bg-white/[0.03] border border-white/5 p-6 rounded-3xl flex gap-4 items-start">
                            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl shrink-0">
                                <TrendingUp size={24} className="text-blue-400" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-widest text-white mb-2">Promoción constante</h3>
                                <p className="text-[11px] font-bold text-white/50 leading-relaxed">Tu negocio aparece dentro de la red cuando los clientes buscan productos.</p>
                            </div>
                        </div>
                        {/* Benefit 4 */}
                        <div className="bg-white/[0.03] border border-white/5 p-6 rounded-3xl flex gap-4 items-start">
                            <div className="p-3 bg-violet-500/10 border border-violet-500/20 rounded-2xl shrink-0">
                                <Share2 size={24} className="text-violet-400" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-widest text-white mb-2">Red de comercios</h3>
                                <p className="text-[11px] font-bold text-white/50 leading-relaxed">Formás parte de una comunidad de negocios conectados.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 5. SECCIÓN SISTEMA QR */}
                <section className="w-full mb-20 text-center">
                    <div className="inline-flex justify-center p-4 bg-cyan-500/10 rounded-full mb-6 border border-cyan-500/30">
                        <ScanLine size={48} className="text-cyan-400" />
                    </div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter leading-none mb-6">
                        Convertí tu vidriera en una <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">puerta digital</span>.
                    </h2>
                    <img 
                        src="https://images.unsplash.com/photo-1595054134109-77569baf4152?w=800&h=600&fit=crop" 
                        alt="Escaneando código QR"
                        className="w-full h-48 object-cover rounded-[2rem] mb-6 border border-white/10 opacity-80"
                    />
                    <p className="text-[13px] text-white/70 font-bold leading-relaxed px-2">
                        Con los materiales de ShopDigital (sticker QR, display de mostrador y posters) los clientes pueden ingresar directamente a tu catálogo digital desde su celular.
                    </p>
                </section>

                {/* 6. SECCIÓN SEGURIDAD Y VALIDACIÓN */}
                <section className="w-full mb-20">
                    <div className="glass-card-3d bg-white/[0.02] border border-white/10 p-8 rounded-[2.5rem] flex flex-col items-center text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl"></div>
                        <ShieldCheck size={40} className="text-cyan-400 mb-4 relative z-10" />
                        <h2 className="text-xl font-black uppercase tracking-tight mb-4 relative z-10">
                            Sistema verificado por embajadores.
                        </h2>
                        <img 
                            src="https://images.unsplash.com/photo-1556761175-5973dc0f32b7?w=800&h=600&fit=crop" 
                            alt="Verificación en persona"
                            className="w-full h-32 object-cover rounded-2xl mb-4 border border-white/5 opacity-70 relative z-10"
                        />
                        <p className="text-[12px] text-white/60 font-bold leading-relaxed relative z-10">
                            Para garantizar la calidad de la red, un embajador de ShopDigital visitará tu comercio para validar los datos y activar tu catálogo dentro del sistema.
                        </p>
                    </div>
                </section>

                {/* 7. LLAMADA A LA ACCIÓN FINAL */}
                <section className="w-full bg-cyan-950/40 border border-cyan-500/30 rounded-[3rem] p-8 text-center relative overflow-hidden shadow-[0_0_50px_rgba(34,211,238,0.15)]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.2),transparent_70%)]" />
                    
                    <h2 className="text-3xl font-[1000] mb-4 uppercase tracking-tighter leading-none relative z-10 text-white">
                        Sumá tu comercio a <span className="text-cyan-400">ShopDigital</span>.
                    </h2>
                    
                    <p className="text-[13px] text-white/80 font-bold mb-8 leading-relaxed relative z-10">
                        Completá el formulario para registrar tu negocio. Una embajadora de zona visitará tu comercio para verificar los datos y activar tu catálogo dentro de la red.
                    </p>

                    <button 
                        onClick={() => {
                            playNeonClick();
                            navigate('/subscripcion');
                        }}
                        className="w-full glass-action-btn bg-cyan-500/20 border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.4)] hover:bg-cyan-500/30 py-5 px-6 flex items-center justify-center gap-3 active:scale-95 transition-all text-white relative z-10 mb-6"
                    >
                        <Store size={20} className="text-cyan-100" />
                        <span className="text-[12px] font-[1000] uppercase tracking-widest text-shadow-premium">Sumar mi comercio a ShopDigital</span>
                    </button>

                    <p className="text-[10px] text-cyan-300/80 font-black uppercase tracking-widest relative z-10 mt-6 px-4">
                        Una embajadora de ShopDigital se pondrá en contacto y visitará tu comercio para activar tu presencia en la red digital.
                    </p>
                </section>

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
