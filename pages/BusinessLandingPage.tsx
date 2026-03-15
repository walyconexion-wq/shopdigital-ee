import React, { useEffect, useState } from 'react';
import { 
    Target, 
    MapPin, 
    BarChart3, 
    ShieldCheck,
    Briefcase,
    TrendingUp,
    Network,
    Share2,
    LayoutDashboard,
    Info,
    CalendarCheck,
    Building2,
    MessageSquare
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { playNeonClick } from '../utils/audio';

const BusinessLandingPage: React.FC = () => {
    const navigate = useNavigate();
    const [isVisible, setIsVisible] = useState(false);
    
    // Formulario Inversor/Empresa
    const [formData, setFormData] = useState({
        empresa: '',
        rubro: '',
        alcance: '',
        whatsapp: ''
    });

    useEffect(() => {
        window.scrollTo(0, 0);
        setIsVisible(true);
    }, []);

    const handleShare = () => {
        playNeonClick();
        const shareUrl = window.location.href;
        const shareText = 'ShopDigital Enterprise - Escalá tu marca y anunciá en el corazón del comercio local. Descubrí el alcance de nuestra red en tiempo real:\n\n👉 ' + shareUrl;

        if (navigator.share) {
            navigator.share({ title: 'ShopDigital Enterprise', text: shareText, url: shareUrl }).catch(console.error);
        } else {
            window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
        }
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        playNeonClick();
        const message = `*NUEVO CONTACTO CORPORATIVO*\n\n🏢 *Empresa:* ${formData.empresa}\n🎯 *Rubro/Servicio:* ${formData.rubro}\n🌐 *Alcance Deseado:* ${formData.alcance}\n📱 *WhatsApp Corp:* ${formData.whatsapp}\n\n_Interesado en Alianza Estratégica B2B_`;
        const waLink = `https://wa.me/5491168797543?text=${encodeURIComponent(message)}`;
        window.open(waLink, '_blank');
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans relative overflow-x-hidden selection:bg-cyan-500/30">
            {/* Enterprise Tech Background Overlay */}
            <div className="fixed inset-0 pointer-events-none z-0">
                {/* Subtle Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.03)_1px,transparent_1px)] bg-[size:40px_40px] perspective-1000 transform scale-110" />
                {/* Ambient Glows */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cyan-600/5 rounded-full blur-[150px] animate-pulse" />
                <div className="absolute bottom-0 left-[-20%] w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[150px] animate-pulse" />
            </div>

            {/* Corporate Header */}
            <header className="relative z-20 pt-6 pb-4 px-6 flex flex-col gap-4 sm:flex-row sm:justify-between items-center max-w-4xl mx-auto w-full border-b border-white/5">
                <div className="scale-100 flex items-center gap-3">
                    <Logo />
                    <div className="h-6 w-px bg-white/20 hidden sm:block"></div>
                    <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-cyan-500/80 bg-cyan-900/20 px-3 py-1 rounded-full border border-cyan-500/20">Enterprise</span>
                </div>
                <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
                    <button onClick={() => { playNeonClick(); navigate('/'); }} className="shrink-0 bg-transparent border border-white/10 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-white/5 transition-all text-white/70">
                        <LayoutDashboard size={14} /> <span className="text-[9px] font-bold uppercase tracking-widest text-white">App Central</span>
                    </button>
                    <button onClick={() => { playNeonClick(); navigate('/nosotros'); }} className="shrink-0 bg-transparent border border-white/10 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-white/5 transition-all text-white/70">
                        <Info size={14} /> <span className="text-[9px] font-bold uppercase tracking-widest text-white">Nosotros</span>
                    </button>
                    <button onClick={handleShare} className="shrink-0 bg-cyan-500/10 border border-cyan-500/30 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-cyan-500/20 transition-all text-cyan-400">
                        <Share2 size={14} /> <span className="text-[9px] font-bold uppercase tracking-widest">Dossier</span>
                    </button>
                </div>
            </header>

            <main className="relative z-10 flex flex-col items-center px-4 pt-10 pb-24 max-w-4xl mx-auto w-full">
                
                {/* 1. HERO SECTION */}
                <section className={`w-full text-center transition-all duration-1000 mb-20 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-[1000] mb-6 leading-[1.1] tracking-tighter text-white drop-shadow-2xl">
                        Escalá tu marca directo al <br className="hidden md:block"/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-500">
                            corazón del comercio local.
                        </span>
                    </h1>
                    
                    <p className="text-sm md:text-base text-white/60 font-medium leading-relaxed mb-10 max-w-2xl mx-auto">
                        Ubicá tus productos y servicios frente a los dueños de negocios verificados en tiempo real. Publicidad segmentada, sin intermediarios y con <strong className="text-cyan-400 font-bold">impacto territorial quirúrgico</strong>.
                    </p>

                    {/* Holographic Data Map Image */}
                    <div className="w-full relative aspect-[16/10] md:aspect-[21/9] rounded-2xl md:rounded-[2rem] overflow-hidden border border-cyan-500/30 shadow-[0_0_80px_rgba(34,211,238,0.15)] mb-10 bg-black/50 group">
                        <img 
                            src="/images/hero-business-landing.jpg" 
                            alt="Mapa holográfico de red comercial ShopDigital y empresario B2B"
                            className="w-full h-full object-cover object-center brightness-[1.15] contrast-[1.1] saturate-[1.05] transition-transform duration-[10s] group-hover:scale-105"
                        />
                        {/* High-tech overlays */}
                        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-[#050505] opacity-60"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-90"></div>
                        <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(34,211,238,0.2)] rounded-2xl md:rounded-[2rem] pointer-events-none"></div>
                        
                        {/* Action floating within image */}
                        <div className="absolute bottom-6 left-0 right-0 flex justify-center">
                            <button 
                                onClick={() => {
                                    playNeonClick();
                                    document.getElementById('alliance-form')?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="glass-action-btn bg-cyan-950/80 border border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.4)] hover:bg-cyan-900 py-4 px-8 rounded-xl flex items-center justify-center gap-3 transition-all backdrop-blur-md"
                            >
                                <Briefcase size={18} className="text-cyan-400" />
                                <span className="text-[11px] md:text-xs font-black uppercase tracking-[0.2em] text-white">Solicitar Dossier Corporativo</span>
                            </button>
                        </div>
                    </div>
                    
                    {/* Trust Indicators */}
                    <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-white/30 text-[10px] uppercase tracking-widest font-black">
                        <span>Inteligencia Geoespacial</span>
                        <span className="hidden sm:inline">•</span>
                        <span>Red Autogestionable</span>
                        <span className="hidden sm:inline">•</span>
                        <span>B2B Directo</span>
                    </div>
                </section>

                {/* 2. EL PODER DE LA SEGMENTACIÓN */}
                <section className="w-full mb-24 relative">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center p-3 sm:p-4 bg-white/[0.02] border border-white/5 rounded-2xl mb-6">
                            <Target size={32} className="text-cyan-400" />
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-[1000] uppercase tracking-tighter mb-4 text-white">
                            El Poder de la <span className="text-cyan-400">Segmentación</span>
                        </h2>
                        <p className="text-[13px] sm:text-sm text-white/50 font-medium tracking-wide">
                            No tiramos publicidad al aire. Apuntamos al blanco.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="glass-card-3d bg-[#0A0A0A] border border-white/5 hover:border-cyan-500/30 p-8 rounded-3xl transition-colors group">
                            <BarChart3 size={28} className="text-cyan-500 mb-6 group-hover:scale-110 transition-transform" />
                            <h3 className="text-sm font-black uppercase tracking-widest text-white mb-3">Segmentación por Rubro</h3>
                            <p className="text-[12px] text-white/50 leading-relaxed font-medium">
                                ¿Vendés harina? Publicitá <strong className="text-white">solo en Pizzerías</strong>. ¿Vendés tijeras? <strong className="text-white">Solo en Barberías</strong>. Optimizá tu CPA al máximo.
                            </p>
                        </div>

                        <div className="glass-card-3d bg-[#0A0A0A] border border-white/5 hover:border-cyan-500/30 p-8 rounded-3xl transition-colors group">
                            <MapPin size={28} className="text-cyan-500 mb-6 group-hover:scale-110 transition-transform" />
                            <h3 className="text-sm font-black uppercase tracking-widest text-white mb-3">Geofencing Real</h3>
                            <p className="text-[12px] text-white/50 leading-relaxed font-medium">
                                Impactá exactamente en la zona donde tenés logística o donde querés abrir mercado (Ej: Monte Grande, Luis Guillón).
                            </p>
                        </div>

                        <div className="glass-card-3d bg-[#0A0A0A] border border-white/5 hover:border-cyan-500/30 p-8 rounded-3xl transition-colors group">
                            <Network size={28} className="text-cyan-500 mb-6 group-hover:scale-110 transition-transform" />
                            <h3 className="text-sm font-black uppercase tracking-widest text-white mb-3">Consumo Activo</h3>
                            <p className="text-[12px] text-white/50 leading-relaxed font-medium">
                                Tu marca aparece justo en el momento de demanda, cuando el comerciante está online gestionando su catálogo y buscando proveedores.
                            </p>
                        </div>
                    </div>
                </section>

                {/* 3. ESCALABILIDAD Y EXPANSIÓN */}
                <section className="w-full mb-24">
                    <div className="bg-gradient-to-br from-[#0c1824] to-[#050505] border border-cyan-900/50 rounded-[2.5rem] p-8 sm:p-12 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <TrendingUp size={200} />
                        </div>
                        
                        <h2 className="text-2xl sm:text-3xl font-[1000] uppercase tracking-tighter mb-6 text-white relative z-10">
                            Escalabilidad y Visión <span className="text-blue-400">Nacional</span>
                        </h2>
                        
                        <p className="text-sm text-white/70 leading-relaxed mb-10 max-w-xl relative z-10">
                            ShopDigital nace conectando el núcleo comercial de Esteban Echeverría con una arquitectura puramente replicable. Ser <strong className="text-white">Early Partner</strong> hoy te posiciona como el proveedor oficial de la red comercial del futuro a nivel nacional.
                        </p>

                        <div className="grid sm:grid-cols-2 gap-8 relative z-10">
                            <div>
                                <h4 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-cyan-400 mb-2">
                                    <ShieldCheck size={16} /> Infraestructura IA
                                </h4>
                                <p className="text-[11px] text-white/50 font-medium">Validamos cada comercio para que tu publicidad, promociones e inversiones lleguen a humanos reales con negocios reales.</p>
                            </div>
                            <div>
                                <h4 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-cyan-400 mb-2">
                                    <Network size={16} /> Crecimiento Orgánico
                                </h4>
                                <p className="text-[11px] text-white/50 font-medium">Las marcas fundadoras crecerán y monopolizarán nuestra red B2B a medida que encendemos nuevas zonas geográficas.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 4. OPORTUNIDAD FINANCIERAS */}
                <section className="w-full mb-24 text-center px-4">
                    <div className="inline-flex justify-center p-4 bg-green-500/10 rounded-2xl border border-green-500/20 mb-6">
                        <Building2 size={32} className="text-green-400" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-[1000] uppercase tracking-tighter mb-6 text-white max-w-2xl mx-auto">
                        Oportunidades únicas para <span className="text-green-400">Inversores y Entidades Financieras</span>
                    </h2>
                    <p className="text-sm md:text-base text-white/60 font-medium leading-relaxed max-w-2xl mx-auto">
                        Ofrecé tus soluciones de crédito, micropréstamos, terminales de pago o seguros directamente a una red de comercios con <strong className="text-white">identidad digital verificada</strong>. Bajamos tu riesgo de prospección y subimos tu tasa de conversión.
                    </p>
                </section>

                {/* 5. FORMULARIO ALIANZA ESTRATÉGICA */}
                <section id="alliance-form" className="w-full scroll-mt-24">
                    <div className="glass-card-3d bg-[#0A0A0A]/80 backdrop-blur-xl border border-white/10 p-8 sm:p-12 rounded-[2.5rem] relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-600/10 rounded-full blur-[80px]" />
                        
                        <div className="relative z-10 max-w-lg mx-auto">
                            <div className="text-center mb-10">
                                <h2 className="text-2xl font-[1000] uppercase tracking-tighter mb-3 text-white">
                                    Alianzas Estratégicas
                                </h2>
                                <p className="text-[11px] font-bold text-white/50 uppercase tracking-widest">
                                    Conectá tu empresa con la red ShopDigital
                                </p>
                            </div>

                            <form onSubmit={handleFormSubmit} className="space-y-5">
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-cyan-500/80 ml-2">Nombre de tu Empresa / Entidad</label>
                                    <input 
                                        required type="text" placeholder="Ej: Distribuidora Central / Banco Sur"
                                        value={formData.empresa} onChange={e => setFormData({...formData, empresa: e.target.value})}
                                        className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 sm:py-4 text-xs sm:text-sm text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-white/20 font-medium"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-cyan-500/80 ml-2">Rubro de Insumo o Servicio</label>
                                    <input 
                                        required type="text" placeholder="Ej: Mayorista de Bebidas / Microcréditos"
                                        value={formData.rubro} onChange={e => setFormData({...formData, rubro: e.target.value})}
                                        className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 sm:py-4 text-xs sm:text-sm text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-white/20 font-medium"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-cyan-500/80 ml-2">Alcance B2B Deseado</label>
                                    <input 
                                        required type="text" placeholder="Ej: Gastronomía en Zona Sur / Todos los rubros"
                                        value={formData.alcance} onChange={e => setFormData({...formData, alcance: e.target.value})}
                                        className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 sm:py-4 text-xs sm:text-sm text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-white/20 font-medium"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-cyan-500/80 ml-2">WhatsApp Corporativo de Contacto</label>
                                    <input 
                                        required type="tel" placeholder="Ej: +54 9 11 0000 0000"
                                        value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})}
                                        className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 sm:py-4 text-xs sm:text-sm text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-white/20 font-medium"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full btn-cyan-neon bg-cyan-500/20 border border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:bg-cyan-500/30 py-4 sm:py-5 rounded-[1rem] flex items-center justify-center gap-3 active:scale-95 transition-all mt-8"
                                >
                                    <CalendarCheck size={18} className="text-cyan-100" />
                                    <span className="text-[11px] sm:text-[12px] font-black uppercase tracking-widest text-white">Agendar Reunión Estratégica</span>
                                </button>
                                
                                <p className="text-center text-[9px] uppercase tracking-widest text-white/30 font-bold mt-4 flex items-center justify-center gap-2">
                                    <MessageSquare size={10} /> Contacto directo por WhatsApp
                                </p>
                            </form>
                        </div>
                    </div>
                </section>

            </main>

            {/* Solid Tech Footer */}
            <footer className="relative z-20 py-10 border-t border-white/5 bg-[#030303] text-center">
                <div className="scale-75 mb-6 opacity-60 hover:opacity-100 transition-opacity cursor-pointer inline-block" onClick={() => navigate('/')}>
                    <Logo />
                </div>
                <div className="flex flex-col gap-2 opacity-30">
                    <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.3em]">ShopDigital Enterprise B2B Solutions</p>
                    <p className="text-[7px] sm:text-[8px] font-bold uppercase tracking-[0.5em]">Powered by Waly · 2026</p>
                </div>
            </footer>
        </div>
    );
};

export default BusinessLandingPage;
