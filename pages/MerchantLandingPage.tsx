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
    CheckCircle,
    Store,
    Users,
    Zap,
    HelpCircle
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { playNeonClick } from '../utils/audio';
import { AriMerchantAssistant } from '../components/AriMerchantAssistant';

const MerchantLandingPage: React.FC = () => {
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
        const shareUrl = window.location.origin + `/vender`;
        const shareText = '¡Mirá esto! Potenciá tu comercio local con ShopDigital. Sumate y aparecé en el celular de tus vecinos. 🚀\n\n👉 ' + shareUrl;

        if (navigator.share) {
            navigator.share({ title: 'ShopDigital Comercios', text: shareText, url: shareUrl }).catch(console.error);
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
            {/* Background Textures */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(45,30,21,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(45,30,21,0.02)_1px,transparent_1px)] bg-[size:32px_32px]" />
                <div className="absolute top-1/3 left-[-15%] w-[80%] h-[35%] bg-white/10 rounded-full blur-[120px] animate-pulse" />
            </div>

            {/* HEADER */}
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
                    
                    <div className="flex flex-col items-center select-none text-center">
                        <span className="text-[20px] font-[1000] tracking-tighter uppercase text-[#2d1e15] leading-none mb-0.5">
                            ShopDigital
                        </span>
                        <span className="text-[7.5px] font-black text-slate-500 tracking-[0.2em] uppercase">
                            Para Comercios
                        </span>
                    </div>

                    <button 
                        onClick={() => { playNeonClick(); navigate(`/${townId}/subscripcion`); }}
                        className="bg-[#2d1e15] text-[#faf8f5] hover:bg-[#473022] px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all active:translate-y-[2px] shrink-0 border border-[#855b3c]/20"
                    >
                        <span className="text-[9px] font-black uppercase tracking-[0.1em]">Sumarme</span>
                    </button>
                </div>
            </nav>

            <main className="relative z-10 flex flex-col items-center w-full max-w-lg mx-auto pt-20 px-4 space-y-6">

                {/* ============================================ */}
                {/* 1. HERO - HOOK DE ATENCIÓN                   */}
                {/* ============================================ */}
                <section className={`w-full transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <div className="glass-card-3d bg-[#faf8f5] border border-slate-200 border-b-[6px] border-b-[#855b3c] p-6 rounded-[2.5rem] shadow-lg text-center space-y-5 relative overflow-hidden">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-500/10 border border-sky-500/20 rounded-full">
                            <Sparkles size={11} className="text-[#0ea5e9]" />
                            <span className="text-[8px] uppercase tracking-[0.25em] font-black text-[#0ea5e9]">
                                Red de Comercios Verificados
                            </span>
                        </div>

                        <h1 className="text-2.5xl font-[1000] tracking-tighter leading-tight uppercase text-shadow-premium">
                            Llevá tu local al <br/>
                            <span className="text-[#0ea5e9]">celular del vecino</span>
                        </h1>

                        <p className="text-[12.5px] leading-relaxed text-slate-700 font-medium">
                            El <strong>92% de las compras locales</strong> comienzan con una búsqueda en el celular. Si tus ofertas no se ven digitalmente hoy, tus clientes se van con la competencia.
                        </p>

                        <div className="pt-2">
                            <button 
                                onClick={() => { playNeonClick(); navigate(`/${townId}/subscripcion`); }}
                                className="w-full py-4 text-[11px] font-[1100] uppercase tracking-[0.2em] bg-emerald-500 hover:bg-emerald-600 text-white border border-emerald-600 border-b-[5px] border-b-emerald-700 rounded-2xl active:translate-y-[4px] transition-all flex items-center justify-center gap-2 shadow-md"
                            >
                                <Zap size={15} />
                                Activar Mi Comercio Gratis
                            </button>
                            <p className="text-[8.5px] text-slate-500 font-bold uppercase tracking-wider mt-2.5">
                                Visita del Embajador incluida · Sin comisiones
                            </p>
                        </div>
                    </div>
                </section>

                {/* ============================================ */}
                {/* 2. AGITACIÓN DEL DOLOR (Necesidad)           */}
                {/* ============================================ */}
                <section className="w-full">
                    <div className="glass-card-3d bg-[#faf8f5] border border-slate-200 border-b-[6px] border-b-[#855b3c] p-6 rounded-[2.5rem] shadow-lg space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
                                <TrendingUp size={18} />
                            </div>
                            <h2 className="text-lg font-[1000] uppercase tracking-tight text-shadow-premium">
                                ¿Por qué los métodos viejos ya no sirven?
                            </h2>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-start gap-3 p-3 rounded-2xl bg-white border border-slate-100">
                                <span className="text-red-500 font-black text-sm mt-0.5">✕</span>
                                <div className="space-y-0.5">
                                    <h4 className="text-[11px] font-[1000] uppercase tracking-wide">Folletería de Papel</h4>
                                    <p className="text-[10px] text-slate-500 leading-normal">
                                        Es costosa de diseñar e imprimir, y la gran mayoría termina tirada en la calle sin que nadie la lea.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-3 rounded-2xl bg-white border border-slate-100">
                                <span className="text-red-500 font-black text-sm mt-0.5">✕</span>
                                <div className="space-y-0.5">
                                    <h4 className="text-[11px] font-[1000] uppercase tracking-wide">Grupos de Facebook</h4>
                                    <p className="text-[10px] text-slate-500 leading-normal">
                                        Están saturados de spam. Tus publicaciones quedan enterradas en segundos y los vecinos reales de tu zona no las ven.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-3 rounded-2xl bg-white border border-slate-100">
                                <span className="text-red-500 font-black text-sm mt-0.5">✕</span>
                                <div className="space-y-0.5">
                                    <h4 className="text-[11px] font-[1000] uppercase tracking-wide">Comisiones Abusivas</h4>
                                    <p className="text-[10px] text-slate-500 leading-normal">
                                        Las grandes aplicaciones de envíos te quitan hasta un 30% de tu margen de ganancia por cada venta.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ============================================ */}
                {/* 3. LA SOLUCIÓN (Características & Deseo)    */}
                {/* ============================================ */}
                <section className="w-full">
                    <div className="glass-card-3d bg-[#faf8f5] border border-slate-200 border-b-[6px] border-b-[#855b3c] p-6 rounded-[2.5rem] shadow-lg space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-xl bg-sky-500/10 text-[#0ea5e9]">
                                <Store size={18} />
                            </div>
                            <h2 className="text-lg font-[1000] uppercase tracking-tight text-shadow-premium">
                                Con ShopDigital tenés el control
                            </h2>
                        </div>
                        <p className="text-[12px] text-slate-600 leading-relaxed font-medium">
                            Construimos la infraestructura digital que tu comercio necesita para modernizarse sin complicaciones técnicas:
                        </p>

                        <div className="space-y-3">
                            {/* Beneficio 1 */}
                            <div className="p-4 rounded-2xl bg-white border border-slate-100 space-y-1">
                                <div className="flex items-center gap-2">
                                    <CheckCircle size={15} className="text-emerald-500" />
                                    <h3 className="text-[11.5px] font-[1000] uppercase tracking-wider">Catálogo 3D Autogestionable</h3>
                                </div>
                                <p className="text-[10.5px] text-slate-600 leading-normal">
                                    Mostrá tus productos con fotos nítidas y descripciones completas. Podés editar precios y stock al instante desde tu panel móvil.
                                </p>
                            </div>

                            {/* Beneficio 2 */}
                            <div className="p-4 rounded-2xl bg-white border border-slate-100 space-y-1">
                                <div className="flex items-center gap-2">
                                    <CheckCircle size={15} className="text-emerald-500" />
                                    <h3 className="text-[11.5px] font-[1000] uppercase tracking-wider">Fidelización VIP Automática</h3>
                                </div>
                                <p className="text-[10.5px] text-slate-600 leading-normal">
                                    Premiá a tus clientes recurrentes con credenciales digitales VIP exclusivas. Hacé que vuelvan a tu local una y otra vez.
                                </p>
                            </div>

                            {/* Beneficio 3 */}
                            <div className="p-4 rounded-2xl bg-white border border-slate-100 space-y-1">
                                <div className="flex items-center gap-2">
                                    <CheckCircle size={15} className="text-emerald-500" />
                                    <h3 className="text-[11.5px] font-[1000] uppercase tracking-wider">Directorio B2B Industrial</h3>
                                </div>
                                <p className="text-[10.5px] text-slate-600 leading-normal">
                                    Conectate con fabricantes locales y distribuidores mayoristas de la red para bajar tus costos de mercadería.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ============================================ */}
                {/* 4. OFERTA IRRESISTIBLE & GARANTÍA (Funnel)   */}
                {/* ============================================ */}
                <section className="w-full">
                    <div className="glass-card-3d bg-[#2d1e15] border border-[#855b3c] border-b-[6px] border-b-[#473022] p-6 rounded-[2.5rem] shadow-lg text-[#faf8f5] space-y-5 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
                        
                        <div className="space-y-1.5">
                            <div className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.25em] flex items-center justify-center gap-1">
                                <Shield size={12} />
                                Respaldo Físico Garantizado
                            </div>
                            <h2 className="text-xl font-[1000] uppercase tracking-tighter leading-tight">
                                Te lo hacemos <br/>
                                <span className="text-emerald-400">100% fácil</span>
                            </h2>
                        </div>

                        <p className="text-[11.5px] text-slate-300 leading-relaxed font-medium">
                            Sabemos que estás ocupado atendiendo tu local. Por eso, una vez que te registrás:
                        </p>

                        <div className="text-left space-y-2.5 max-w-[90%] mx-auto text-[11px] text-slate-200">
                            <div className="flex items-center gap-2.5">
                                <span className="bg-emerald-500 text-white w-5 h-5 rounded-full flex items-center justify-center font-black text-[9px] flex-shrink-0">1</span>
                                Un Embajador te visita y saca las fotos.
                            </div>
                            <div className="flex items-center gap-2.5">
                                <span className="bg-emerald-500 text-white w-5 h-5 rounded-full flex items-center justify-center font-black text-[9px] flex-shrink-0">2</span>
                                Inyectamos tus productos y datos del local.
                            </div>
                            <div className="flex items-center gap-2.5">
                                <span className="bg-emerald-500 text-white w-5 h-5 rounded-full flex items-center justify-center font-black text-[9px] flex-shrink-0">3</span>
                                Tu catálogo queda activo en 24 horas.
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                onClick={() => { playNeonClick(); navigate(`/${townId}/subscripcion`); }}
                                className="w-full py-4 text-[10.5px] font-[1100] uppercase tracking-[0.18em] bg-emerald-500 hover:bg-emerald-600 text-white border border-emerald-600 border-b-[5px] border-b-emerald-700 rounded-2xl active:translate-y-[4px] transition-all flex items-center justify-center gap-2 shadow-lg"
                            >
                                Agendar Activación
                            </button>
                        </div>
                    </div>
                </section>

                {/* ============================================ */}
                {/* 5. PREGUNTAS FRECUENTES (FAQ)                */}
                {/* ============================================ */}
                <section className="w-full">
                    <div className="glass-card-3d bg-[#faf8f5] border border-slate-200 border-b-[6px] border-b-[#855b3c] p-6 rounded-[2.5rem] shadow-lg space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600">
                                <HelpCircle size={18} />
                            </div>
                            <h2 className="text-lg font-[1000] uppercase tracking-tight text-shadow-premium">
                                Preguntas Frecuentes
                            </h2>
                        </div>

                        <div className="space-y-3 text-[11px] leading-relaxed">
                            <div className="space-y-1">
                                <h4 className="font-extrabold text-[#2d1e15]">¿Realmente es sin comisiones?</h4>
                                <p className="text-slate-600">Sí. El trato es directo entre vos y el vecino. No intermediamos los cobros ni cobramos porcentaje de ventas.</p>
                            </div>
                            <div className="h-px bg-slate-100" />
                            <div className="space-y-1">
                                <h4 className="font-extrabold text-[#2d1e15]">¿Qué hace el Embajador de Zona?</h4>
                                <p className="text-slate-600">Es tu asesor local. Se encarga de verificar que tu comercio sea real, sacar las fotos de tus ofertas iniciales y enseñarte a usar tu panel móvil.</p>
                            </div>
                            <div className="h-px bg-slate-100" />
                            <div className="space-y-1">
                                <h4 className="font-extrabold text-[#2d1e15]">¿Tengo que saber de tecnología?</h4>
                                <p className="text-slate-600">Para nada. El panel de gestión de ShopDigital es tan fácil de usar como subir una foto o mandar un mensaje de WhatsApp.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA FINAL DE COMPARTIR */}
                <section className="w-full mt-4">
                    <button
                        onClick={handleShare}
                        className="w-full py-4 text-[10px] font-[1100] uppercase tracking-[0.2em] bg-white text-slate-800 border border-slate-200 border-b-[5px] border-b-slate-300 rounded-2xl active:translate-y-[4px] transition-all flex items-center justify-center gap-2 shadow-sm hover:bg-slate-50"
                    >
                        <Share2 size={16} className="text-violet-500" />
                        Recomendar a otro comerciante
                    </button>
                </section>
            </main>

            {/* Footer */}
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

export default MerchantLandingPage;
