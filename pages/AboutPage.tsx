import React, { useEffect } from 'react';
import { Shield, Target, Users, Zap, Mail, MapPin, Phone, ArrowUpRight, CheckCircle2, Sparkles } from 'lucide-react';
import Logo from '../components/Logo';

const AboutPage: React.FC = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const sections = [
        { id: 'nosotros', label: 'Nosotros' },
        { id: 'mision', label: 'Misión' },
        { id: 'servicios', label: 'Servicios' },
        { id: 'contacto', label: 'Contacto' }
    ];

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] text-white flex flex-col font-sans relative overflow-x-hidden">
            {/* Background Glows */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute top-[20%] left-[-10%] w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

            {/* Navigation Bar */}
            <nav className="sticky top-0 z-50 w-full glass-header py-4 px-6 border-b border-white/10 backdrop-blur-xl bg-black/40">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="scale-75 origin-left">
                        <Logo />
                    </div>
                    <div className="hidden md:flex items-center gap-8">
                        {sections.map(s => (
                            <button 
                                key={s.id}
                                onClick={() => scrollToSection(s.id)}
                                className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 hover:text-white transition-colors"
                            >
                                {s.label}
                            </button>
                        ))}
                    </div>
                    <button className="glass-action-btn py-2 px-5 rounded-full btn-violet text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all">
                        Comenzar
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section id="nosotros" className="relative z-10 pt-20 pb-24 px-6 flex flex-col items-center max-w-4xl mx-auto text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500/10 border border-violet-500/20 rounded-full mb-8">
                    <Sparkles size={12} className="text-violet-400" />
                    <span className="text-[9px] uppercase tracking-[0.3em] font-black text-violet-300">Institucional</span>
                </div>
                
                <h1 className="text-5xl md:text-7xl font-black mb-8 leading-[1.1] tracking-tighter">
                    Conectamos la <br /> 
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-blue-400 to-cyan-400 drop-shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                        Red Comercial
                    </span>
                </h1>
                
                <p className="text-lg md:text-xl text-white/70 font-medium leading-relaxed max-w-2xl mb-12">
                    ShopDigital es la plataforma líder en Esteban Echeverría diseñada para potenciar el comercio local, ofreciendo herramientas digitales de última generación para conectar negocios con su comunidad.
                </p>

                <div className="flex flex-wrap justify-center gap-4">
                    <div className="glass-card-3d p-6 border border-white/10 flex flex-col items-center gap-4 w-40">
                        <Users size={32} className="text-violet-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Comunidad</span>
                    </div>
                    <div className="glass-card-3d p-6 border border-white/10 flex flex-col items-center gap-4 w-40">
                        <Target size={32} className="text-blue-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Impacto</span>
                    </div>
                    <div className="glass-card-3d p-6 border border-white/10 flex flex-col items-center gap-4 w-40">
                        <Zap size={32} className="text-cyan-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Innovación</span>
                    </div>
                </div>
            </section>

            {/* Mission Section */}
            <section id="mision" className="relative z-10 py-24 px-6 bg-gradient-to-b from-transparent via-violet-950/5 to-transparent">
                <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
                    <div className="order-2 md:order-1 relative group">
                        <div className="absolute -inset-4 bg-violet-500/20 rounded-3xl blur-2xl group-hover:bg-violet-500/30 transition-all duration-700 opacity-50" />
                        <div className="glass-card-3d aspect-square rounded-3xl overflow-hidden border border-white/10 flex items-center justify-center p-12">
                            <Shield size={120} strokeWidth={0.5} className="text-violet-400 animate-pulse" />
                        </div>
                    </div>
                    <div className="order-1 md:order-2 flex flex-col gap-8">
                        <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
                            Nuestra <span className="text-violet-400">Misión</span> es tu Crecimiento
                        </h2>
                        <div className="h-1 w-20 bg-violet-500/40 rounded-full" />
                        <p className="text-lg text-white/60 leading-relaxed">
                            Buscamos democratizar el acceso a la tecnología publicitaria para todos los comercios de la zona, brindando una vidriera digital de alto impacto que sea accesible, intuitiva y potente.
                        </p>
                        <ul className="flex flex-col gap-4">
                            {['Potenciar el consumo local', 'Digitalizar catálogos tradicionales', 'Crear vínculos comunidad-comercio'].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-white/80 font-bold text-sm tracking-tight">
                                    <CheckCircle2 size={18} className="text-cyan-400" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            {/* Features/Services Section */}
            <section id="servicios" className="relative z-10 py-24 px-6 max-w-6xl mx-auto">
                <div className="flex flex-col items-center text-center mb-16 gap-4">
                    <h2 className="text-3xl md:text-5xl font-black tracking-tight uppercase tracking-[0.1em]">Experiencia Digital</h2>
                    <p className="text-white/40 text-[10px] uppercase tracking-[0.4em] font-black">Por qué elegir ShopDigital</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        { icon: <Zap />, title: 'Velocidad HD', desc: 'Carga instantánea de catálogos y ofertas optimizados para móviles.' },
                        { icon: <Target />, title: 'Alcance Local', desc: 'Llega directamente a los clientes de tu barrio con precisión total.' },
                        { icon: <Shield />, title: 'Seguridad', desc: 'Gestión protegida y profesional de toda la información comercial.' }
                    ].map((feat, i) => (
                        <div key={i} className="glass-card-3d p-8 border border-white/5 hover:border-violet-500/30 transition-all group">
                            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-6 text-violet-400 group-hover:scale-110 group-hover:bg-violet-500/20 transition-all">
                                {React.cloneElement(feat.icon as React.ReactElement, { size: 24 })}
                            </div>
                            <h3 className="text-xl font-black mb-4 uppercase tracking-wider">{feat.title}</h3>
                            <p className="text-sm text-white/50 leading-relaxed font-medium">{feat.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Contact Section */}
            <section id="contacto" className="relative z-10 py-24 px-6 max-w-4xl mx-auto w-full">
                <div className="glass-card-3d p-12 border border-violet-500/20 shadow-[0_0_50px_rgba(139,92,246,0.1)] relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-40 transition-opacity">
                        <Logo />
                    </div>
                    
                    <div className="relative z-10">
                        <h2 className="text-4xl font-black mb-8">Hablemos de tu Negocio</h2>
                        <div className="grid md:grid-cols-2 gap-12 mt-12">
                            <div className="flex flex-col gap-6">
                                <div className="flex items-center gap-4 group">
                                    <div className="w-10 h-10 rounded-full bg-violet-500/10 flex items-center justify-center text-violet-400">
                                        <Mail size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[9px] uppercase tracking-widest text-white/40 mb-1">Email</p>
                                        <p className="font-bold text-sm tracking-tight text-white/90">contacto@shopdigital.tech</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 group">
                                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                                        <MapPin size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[9px] uppercase tracking-widest text-white/40 mb-1">Ubicación</p>
                                        <p className="font-bold text-sm tracking-tight text-white/90">Esteban Echeverría, BA</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 group">
                                    <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                                        <Phone size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[9px] uppercase tracking-widest text-white/40 mb-1">WhatsApp</p>
                                        <p className="font-bold text-sm tracking-tight text-white/90">+54 11 1234 5678</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex flex-col justify-end">
                                <button className="glass-action-btn w-full py-5 px-8 rounded-2xl btn-violet flex items-center justify-center gap-4 group">
                                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white">Contactar con Waly</span>
                                    <ArrowUpRight size={18} className="text-white/60 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 pt-16 pb-12 px-6 border-t border-white/10 mt-12 bg-black/40">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex flex-col items-center md:items-start gap-4">
                        <Logo />
                        <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">
                            © 2026 · shopdigital.ar
                        </p>
                    </div>
                    
                    <div className="flex gap-10">
                        {sections.map(s => (
                            <button 
                                key={s.id}
                                onClick={() => scrollToSection(s.id)}
                                className="text-[9px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors"
                            >
                                {s.label}
                            </button>
                        ))}
                    </div>
                    
                    <div className="text-center md:text-right">
                        <p className="text-[8px] font-bold uppercase tracking-[0.25em] text-[#009EE3] flex items-center gap-2 justify-center md:justify-end">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                            La app de Waly
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default AboutPage;
