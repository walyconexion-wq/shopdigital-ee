import React from 'react';
import { Smartphone, Zap, Target, Sparkles, ArrowRight, Share2, Globe, ShieldCheck } from 'lucide-react';

const LandingPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-[#020617] text-white flex flex-col font-sans overflow-hidden py-8 px-6 relative">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] left-[-20%] w-[100%] h-[100%] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-20%] w-[100%] h-[100%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
            
            <header className="relative z-10 flex flex-col items-center mb-12 animate-in fade-in slide-in-from-top-8 duration-700">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full mb-6">
                    <Zap size={14} className="text-cyan-400" />
                    <span className="text-[10px] uppercase tracking-widest font-bold text-cyan-300">Net Digital 2026</span>
                </div>
                
                <h1 className="text-5xl md:text-7xl font-black text-center mb-4 tracking-tighter leading-none">
                    <span className="block text-white">Shop</span>
                    <span className="block text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]">Digital</span>
                </h1>
                
                <div className="w-16 h-[2px] bg-cyan-500/40 rounded-full mb-6"></div>
                
                <p className="text-xl md:text-2xl text-center font-bold tracking-tight text-cyan-100/80 max-w-[320px] leading-tight mb-8">
                    Conectá tu comercio a la <span className="text-cyan-400">red digital</span>
                </p>
                
                <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
                    <div className="w-2 h-2 rounded-full bg-cyan-500/30"></div>
                    <div className="w-2 h-2 rounded-full bg-cyan-500/30"></div>
                </div>
            </header>

            <main className="relative z-10 flex flex-col items-center gap-10 w-full max-w-lg mx-auto mb-16">
                {/* HUD Graphic Elements */}
                <div className="relative w-full aspect-square max-w-[280px] animate-in zoom-in duration-1000 delay-300">
                    <div className="absolute inset-0 border-[1px] border-cyan-500/20 rounded-full animate-[spin_20s_linear_infinite]" />
                    <div className="absolute inset-4 border-[1px] border-dashed border-cyan-500/40 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
                    
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="glass-card-3d p-8 rounded-full border border-cyan-400/30 shadow-[0_0_50px_rgba(34,211,238,0.2)]">
                            <div className="relative">
                                <Smartphone size={80} strokeWidth={1} className="text-cyan-400" />
                                <div className="absolute -top-4 -right-4">
                                    <Sparkles size={32} className="text-cyan-300 animate-pulse" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Orbiting Elements */}
                    <div className="absolute top-0 left-1/2 -ml-6 -mt-6 glass-card-3d w-12 h-12 flex items-center justify-center rounded-xl border border-white/20 animate-bounce cursor-default">
                        <Target size={20} className="text-cyan-400" />
                    </div>
                </div>

                <div className="flex flex-col gap-6 w-full px-4 animate-in slide-in-from-bottom-12 duration-1000 delay-500">
                    <div className="glass-card-3d p-6 border border-white/10 group hover:border-cyan-400/40 transition-all">
                        <p className="text-lg font-bold text-center leading-relaxed">
                            Promocioná tu <span className="text-cyan-400">negocio</span> y conseguí más clientes
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="glass-card-3d p-4 flex flex-col items-center gap-2 border border-white/5">
                            <Zap size={20} className="text-cyan-400" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Velocidad</span>
                        </div>
                        <div className="glass-card-3d p-4 flex flex-col items-center gap-2 border border-white/5">
                            <Target size={20} className="text-cyan-400" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Alcance</span>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="relative z-10 mt-auto flex flex-col items-center gap-8 animate-in fade-in duration-1000 delay-700">
                <button className="glass-action-btn w-full max-w-[320px] py-6 px-10 rounded-2xl bg-cyan-500/20 border border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.3)] active:scale-95 transition-all group overflow-hidden">
                    <div className="flex items-center justify-center gap-4 relative z-10">
                        <span className="text-sm font-black uppercase tracking-[0.2em] text-cyan-50">Escaneá y Descubrí</span>
                        <ArrowRight size={20} className="text-cyan-400 group-hover:translate-x-2 transition-transform" />
                    </div>
                    {/* Inner Button Glow Effect */}
                    <div className="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent group-hover:left-[100%] transition-all duration-1000" />
                </button>

                <div className="flex flex-col items-center gap-4">
                    <div className="h-[1px] w-12 bg-white/10"></div>
                    <div className="flex items-center gap-6">
                        <Share2 size={24} className="text-white/40 hover:text-cyan-400 transition-colors cursor-pointer" />
                        <Globe size={24} className="text-white/40 hover:text-cyan-400 transition-colors cursor-pointer" />
                        <ShieldCheck size={24} className="text-white/40 hover:text-cyan-400 transition-colors cursor-pointer" />
                    </div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/30 text-center">
                        shopdigital.tech · Esteban Echeverría
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
