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
    Store
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { playNeonClick } from '../utils/audio';
import { AriMerchantAssistant } from '../components/AriMerchantAssistant';

const AboutPage: React.FC = () => {
    const { townId = 'esteban-echeverria' } = useParams<{ townId: string }>();
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        setScrolled(e.currentTarget.scrollTop > 20);
    };

    const handleShare = () => {
        playNeonClick();
        const shareUrl = window.location.origin + `/nosotros`;
        const shareText = '¡Conocé ShopDigital! La red comercial de digitalización hiperlocal. Sumate y potenciá tu negocio. 🚀\n\n👉 ' + shareUrl;

        if (navigator.share) {
            navigator.share({ title: 'ShopDigital', text: shareText, url: shareUrl }).catch(console.error);
        } else {
            window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
        }
    };

    const ariContextShop = {
        id: 'ari-global',
        name: 'ShopDigital',
        category: 'Red Comercial',
        slug: 'shopdigital',
        address: 'Argentina',
        phone: '',
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
            className="h-screen w-full flex flex-col justify-start relative overflow-y-auto pb-12 transition-colors duration-700 bg-[#cda488] text-[#2d1e15] font-sans selection:bg-cyan-500/20"
        >
            {/* Background Grid Accent */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(45,30,21,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(45,30,21,0.02)_1px,transparent_1px)] bg-[size:32px_32px]" />
                <div className="absolute top-1/4 left-[-10%] w-[60%] h-[40%] bg-white/10 rounded-full blur-[100px]" />
            </div>

            {/* STICKY HEADER (Logo Generic + Back) */}
            <nav className={`fixed top-0 z-50 w-full transition-all duration-500 border-b ${
                scrolled 
                    ? 'bg-white/95 backdrop-blur-xl border-slate-200 py-2 shadow-md' 
                    : 'bg-white border-b-slate-200/80 py-3'
            }`}>
                <div className="px-4 flex items-center justify-between w-full max-w-lg mx-auto">
                    <button 
                        onClick={() => { playNeonClick(); navigate(`/${townId}/home`); }}
                        className="p-2 rounded-xl hover:bg-slate-100 transition-all active:translate-y-[2px]"
                    >
                        <ArrowLeft size={18} className="text-[#2d1e15]" />
                    </button>
                    
                    {/* Titulo ShopDigital con mejor jerarquía y sin Esteban Echeverría */}
                    <div className="flex flex-col items-center select-none text-center">
                        <span className="text-[20px] font-[1000] tracking-tighter uppercase text-[#2d1e15] leading-none mb-0.5">
                            ShopDigital
                        </span>
                        <span className="text-[7.5px] font-black text-slate-500 tracking-[0.2em] uppercase">
                            Red Comercial
                        </span>
                    </div>

                    <button 
                        onClick={() => { playNeonClick(); navigate(`/${townId}/home`); }}
                        className="bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all active:translate-y-[2px] group shrink-0"
                    >
                        <span className="text-[9px] font-black uppercase tracking-[0.15em] text-[#0ea5e9]">Entrar</span>
                        <ChevronRight size={12} className="text-[#0ea5e9] group-hover:translate-x-0.5 transition-transform" />
                    </button>
                </div>
            </nav>

            <main className="relative z-10 flex flex-col items-center w-full max-w-lg mx-auto pt-20 px-4">

                {/* ============================================ */}
                {/* 1. HERO - AVATAR DE ARI Y BIENVENIDA        */}
                {/* ============================================ */}
                <section className={`w-full mt-4 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <div className="glass-card-3d bg-[#faf8f5] border border-slate-200 border-b-[6px] border-b-[#855b3c] p-6 rounded-[2.5rem] shadow-lg flex flex-col items-center gap-5 text-center relative overflow-hidden">
                        {/* Decorative tag */}
                        <div className="absolute top-0 right-0 bg-[#2d1e15] text-[#faf8f5] text-[7.5px] font-black uppercase tracking-[0.25em] px-4 py-1.5 rounded-bl-2xl">
                            Institucional
                        </div>

                        {/* Ari Floating Avatar Block */}
                        <div className="relative w-36 h-36 flex-shrink-0 animate-bounce-slow mt-4">
                            <div className="absolute inset-0 rounded-full bg-sky-400/10 blur-xl animate-pulse" />
                            <img 
                                src="/ari-pointing.png" 
                                alt="Asistente Ari" 
                                className="w-full h-full object-contain relative z-10"
                            />
                        </div>

                        {/* Ari Dialogue Balloon */}
                        <div className="bg-[#2d1e15] text-[#faf8f5] rounded-3xl p-5 relative max-w-[90%] border border-[#855b3c] shadow-md">
                            {/* Balloon tail */}
                            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-5 h-5 bg-[#2d1e15] rotate-45 border-t border-l border-[#855b3c]" />
                            <p className="text-[11.5px] leading-relaxed font-bold tracking-tight">
                                "¡Hola! Soy <strong>Ari</strong>, tu asistente en **ShopDigital**. Te doy la bienvenida a nuestro espacio institucional, donde vas a descubrir cómo encendemos la red de comercios y el motor productivo regional."
                            </p>
                        </div>

                        <div className="mt-2 space-y-2">
                            <h1 className="text-2.5xl font-[1000] tracking-tighter leading-none uppercase text-shadow-premium">
                                Red Comercial <br/>
                                <span className="text-[#0ea5e9]">ShopDigital</span>
                            </h1>
                            <p className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">
                                Confianza · Digitalización · Cercanía
                            </p>
                        </div>
                    </div>
                </section>

                {/* ============================================ */}
                {/* 2. ¿QUÉ ES SHOPDIGITAL? (Negocio)            */}
                {/* ============================================ */}
                <section className="w-full mt-6">
                    <div className="glass-card-3d bg-[#faf8f5] border border-slate-200 border-b-[6px] border-b-[#855b3c] p-6 rounded-[2.5rem] shadow-lg space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-xl bg-sky-500/10 text-[#0ea5e9]">
                                <Store size={18} />
                            </div>
                            <h2 className="text-lg font-[1000] uppercase tracking-tight text-shadow-premium">
                                Nuestro Modelo de Negocio
                            </h2>
                        </div>
                        <p className="text-[12px] text-slate-700 leading-relaxed font-medium">
                            **ShopDigital** es una infraestructura de **digitalización comercial hiperlocal**. Nos enfocamos en dar soporte a las economías locales mediante una red estructurada en dos niveles dinámicos:
                        </p>

                        <div className="grid grid-cols-1 gap-4 pt-2">
                            {/* B2C Level */}
                            <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-2">
                                <div className="flex items-center gap-2">
                                    <Users size={16} className="text-[#0ea5e9]" />
                                    <h3 className="text-[11.5px] font-[1000] uppercase tracking-wider">Red Minorista B2C</h3>
                                </div>
                                <p className="text-[10.5px] text-slate-600 leading-normal">
                                    Conectamos de forma directa a los vecinos con los locales de su zona. Ofrecemos catálogos móviles interactivos de acceso veloz y credenciales VIP de fidelización de clientes.
                                </p>
                            </div>

                            {/* B2B Level */}
                            <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-2">
                                <div className="flex items-center gap-2">
                                    <Building2 size={16} className="text-amber-500" />
                                    <h3 className="text-[11.5px] font-[1000] uppercase tracking-wider">Hormiguero Industrial B2B</h3>
                                </div>
                                <p className="text-[10.5px] text-slate-600 leading-normal">
                                    El canal mayorista. Vinculamos a fabricantes locales e importadores con comercios minoristas, facilitando el abastecimiento interno con mejores costos y logística integrada.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ============================================ */}
                {/* 3. TRES PILARES CLAVE                        */}
                {/* ============================================ */}
                <section className="w-full mt-6">
                    <div className="space-y-4">
                        {/* Pilar 1 */}
                        <div className="glass-card-3d bg-[#faf8f5] border border-slate-200 border-b-[6px] border-b-[#855b3c] p-6 rounded-[2.5rem] shadow-lg flex items-start gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center flex-shrink-0 text-[#0ea5e9]">
                                <Lock size={20} />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-[12px] font-[1000] uppercase tracking-wider">Identidad Verificada</h3>
                                <p className="text-[11px] text-slate-600 leading-relaxed">
                                    Comercios y credenciales validados físicamente por nuestros **Embajadores de Zona**, garantizando la seguridad en cada compra local.
                                </p>
                            </div>
                        </div>

                        {/* Pilar 2 */}
                        <div className="glass-card-3d bg-[#faf8f5] border border-slate-200 border-b-[6px] border-b-[#855b3c] p-6 rounded-[2.5rem] shadow-lg flex items-start gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0 text-amber-600">
                                <BarChart3 size={20} />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-[12px] font-[1000] uppercase tracking-wider">Data y Segmentación</h3>
                                <p className="text-[11px] text-slate-600 leading-relaxed">
                                    Vinculamos ofertas, productos y rubros en base al nicho geográfico y de consumo exacto de los vecinos.
                                </p>
                            </div>
                        </div>

                        {/* Pilar 3 */}
                        <div className="glass-card-3d bg-[#faf8f5] border border-slate-200 border-b-[6px] border-b-[#855b3c] p-6 rounded-[2.5rem] shadow-lg flex items-start gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 text-emerald-600">
                                <Handshake size={20} />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-[12px] font-[1000] uppercase tracking-wider">Economía Circular</h3>
                                <p className="text-[11px] text-slate-600 leading-relaxed">
                                    Reducción de costos de intermediación y acuerdos de beneficio mutuo para sostener e incrementar el flujo de dinero de barrio.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ============================================ */}
                {/* 4. ACCIONES RÁPIDAS (CTA Block)               */}
                {/* ============================================ */}
                <section className="w-full mt-6 mb-4">
                    <div className="glass-card-3d bg-[#faf8f5] border border-slate-200 border-b-[6px] border-b-[#855b3c] p-6 rounded-[2.5rem] shadow-lg space-y-5 text-center">
                        <div className="space-y-1">
                            <h2 className="text-lg font-[1000] uppercase tracking-tight text-shadow-premium">
                                Acciones Tácticas
                            </h2>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                                Sumate a la red
                            </p>
                        </div>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => { playNeonClick(); navigate(`/${townId}/home`); }}
                                className="w-full py-4 text-[10px] font-[1100] uppercase tracking-[0.2em] bg-white text-slate-800 border border-slate-200 border-b-[5px] border-b-slate-300 rounded-2xl active:translate-y-[4px] transition-all flex items-center justify-center gap-2 shadow-sm hover:bg-slate-50"
                            >
                                <Smartphone size={16} className="text-[#0ea5e9]" />
                                Ingresar a la App
                            </button>

                            <button
                                onClick={handleShare}
                                className="w-full py-4 text-[10px] font-[1100] uppercase tracking-[0.2em] bg-white text-slate-800 border border-slate-200 border-b-[5px] border-b-slate-300 rounded-2xl active:translate-y-[4px] transition-all flex items-center justify-center gap-2 shadow-sm hover:bg-slate-50"
                            >
                                <Share2 size={16} className="text-violet-500" />
                                Compartir Web
                            </button>

                            <button
                                onClick={() => { playNeonClick(); navigate(`/${townId}/subscripcion`); }}
                                className="w-full py-4 text-[10px] font-[1100] uppercase tracking-[0.2em] bg-white text-slate-800 border border-slate-200 border-b-[5px] border-b-slate-300 rounded-2xl active:translate-y-[4px] transition-all flex items-center justify-center gap-2 shadow-sm hover:bg-slate-50"
                            >
                                <UserCheck size={16} className="text-emerald-500" />
                                Adherir Mi Comercio
                            </button>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer Institucional sin Esteban Echeverría */}
            <footer className="w-full flex flex-col items-center gap-3 pt-8 pb-6 border-t border-[#855b3c]/20 relative z-10 bg-black/10 backdrop-blur-sm mt-auto max-w-lg mx-auto">
                <div className="flex flex-col items-center select-none text-center cursor-pointer hover:opacity-100 opacity-80 transition-opacity" onClick={() => navigate(`/${townId}/home`)}>
                    <span className="text-[22px] font-[1000] tracking-tighter uppercase text-[#faf8f5] leading-none mb-0.5">
                        ShopDigital
                    </span>
                    <span className="text-[8px] font-black text-white/50 tracking-[0.2em] uppercase">
                        Red Comercial
                    </span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                    <p className="text-[9px] font-black text-white/85 uppercase tracking-[0.35em] text-center select-none">
                        © 2026 · ShopDigital
                    </p>
                    <p className="text-[7.5px] font-bold text-white/50 uppercase tracking-[0.2em] text-center">
                        Digitalización Local Verificada
                    </p>
                </div>
            </footer>

            {/* Ari Floating Assistant Bubble */}
            <AriMerchantAssistant 
                shop={ariContextShop} 
                role="baquiana" 
                townId="esteban-echeverria"
                isDayMode={true}
                globalConfig={{}}
            />
        </div>
    );
};

export default AboutPage;
