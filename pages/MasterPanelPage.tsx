import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Lock, ChevronLeft, Share2, ExternalLink, 
    Globe, Users, Store, Tag, ShoppingBag, Terminal, Copy, Check
} from 'lucide-react';
import { playNeonClick } from '../utils/audio';

const MasterPanelPage: React.FC = () => {
    const navigate = useNavigate();
    const [copiedPath, setCopiedPath] = useState<string | null>(null);

    const handleShare = async (path: string, title: string, desc: string) => {
        playNeonClick();
        const url = `${window.location.origin}${path}`;
        const text = `${desc}\n\n👉 ${url}`;
        
        if (navigator.share) {
            try {
                await navigator.share({ title, text, url });
            } catch (err) {
                console.error(err);
            }
        } else {
            const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
            window.open(waUrl, '_blank');
        }
    };

    const handleCopy = async (path: string) => {
        playNeonClick();
        const url = `${window.location.origin}${path}`;
        try {
            await navigator.clipboard.writeText(url);
            setCopiedPath(path);
            setTimeout(() => setCopiedPath(null), 2000);
        } catch (err) {
            console.error('Failed to copy', err);
        }
    };

    const publicPages = [
        { title: 'Landing Nosotros', desc: 'Presentación de la empresa', path: '/nosotros', icon: <Globe size={18} /> },
        { title: 'Landing Unirse', desc: 'Registro para comercios / Embajador', path: '/unirse', icon: <Store size={18} /> },
        { title: 'Landing Descubrir', desc: 'Presentación para Clientes B2C', path: '/descubrir', icon: <Users size={18} /> },
        { title: 'Ofertas B2B Red', desc: 'Descuentos exclusivos entre comercios', path: '/red-comercial/descuentos', icon: <Tag size={18} /> },
        { title: 'Ofertas B2C VIP', desc: 'Ofertas para red de clientes locales', path: '/red-comercial/ofertas', icon: <ShoppingBag size={18} /> },
        { title: 'Reclutamiento Público', desc: 'Formulario inicial (Paso 1)', path: '/reclutamiento', icon: <Globe size={18} /> },
    ];

    const managementPages = [
        { title: 'Reclutamiento Admin', desc: 'Aprobar o rechazar aspirantes a Embajadores', path: '/tablero-maestro/reclutamiento' },
        { title: 'Panel de Embajador', desc: 'Autenticación para dar de alta comercios', path: '/embajador' },
        { title: 'Facturación y Avisos', desc: 'Suscripciones B2C y B2B', path: '/embajador/facturacion' },
        { title: 'Relevamiento Táctico', desc: 'Carga Express Mobile de prospectos en calle', path: '/embajador/relevamiento/nuevo' },
        { title: 'Gestión de Prospectos', desc: 'Ver, revisar, y activar leads de relevamiento', path: '/embajador/relevamiento/gestion' },
        { title: 'Suscripción Creadores', desc: 'Página de suscripción comercial', path: '/subscripcion' },
        { title: 'Base de Clientes', desc: 'Para ver todos los clientes registrados', path: '/base-clientes' },
        { title: 'Gestión Comercial', desc: 'Ruta directa a listado de comercios', path: '/embajador/gestion' },
    ];

    return (
        <div className="min-h-screen bg-black text-white pb-24 relative overflow-hidden selection:bg-cyan-500/30">
            {/* Background elements */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px]" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
            </div>

            <div className="bg-zinc-900/80 backdrop-blur-xl border-b border-cyan-500/30 pt-10 pb-6 px-6 relative z-10 sticky top-0 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                <button onClick={() => navigate(-1)} className="absolute top-10 left-6 text-cyan-400 hover:text-cyan-300">
                    <ChevronLeft size={24} />
                </button>
                <div className="flex flex-col items-center">
                    <Terminal size={32} className="text-cyan-400 mb-2 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]" />
                    <h1 className="text-xl font-[1000] uppercase tracking-[0.2em] text-white">Tablero Maestro</h1>
                    <p className="text-[9px] font-bold text-cyan-400/80 uppercase tracking-widest mt-1">Control General de Waly</p>
                </div>
            </div>

            <div className="px-6 mt-8 space-y-10 relative z-10 pb-20 max-w-lg mx-auto">
                
                {/* Public Landings & Sections */}
                <section>
                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
                        <Globe size={12} /> Interfaces Públicas
                    </h2>
                    <div className="space-y-3">
                        {publicPages.map((page, idx) => (
                            <div key={idx} className="bg-zinc-900/40 border border-white/10 rounded-2xl p-4 flex flex-col gap-3 hover:border-cyan-500/30 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-400/20">
                                        {page.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-[12px] font-[1000] text-white uppercase tracking-wider">{page.title}</h3>
                                        <p className="text-[9px] text-white/40 uppercase tracking-widest mt-0.5">{page.desc}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-2 mt-2">
                                    <button 
                                        onClick={() => { playNeonClick(); navigate(page.path); }}
                                        className="bg-white/5 border border-white/10 py-2.5 rounded-xl flex items-center justify-center gap-1.5 text-[9px] uppercase font-black tracking-widest hover:bg-white/10 active:scale-95 transition-all text-white/80"
                                    >
                                        <ExternalLink size={12} /> Ver App
                                    </button>
                                    <button 
                                        onClick={() => handleShare(page.path, page.title, page.desc)}
                                        className="bg-cyan-500/10 border border-cyan-500/30 py-2.5 rounded-xl flex items-center justify-center gap-1.5 text-[9px] uppercase font-black tracking-widest hover:bg-cyan-500/20 active:scale-95 transition-all text-cyan-400"
                                    >
                                        <Share2 size={12} /> Compartir
                                    </button>
                                    <button 
                                        onClick={() => handleCopy(page.path)}
                                        className={`${copiedPath === page.path ? 'bg-green-500/20 border-green-500/40 text-green-400' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'} border py-2.5 rounded-xl flex items-center justify-center gap-1.5 text-[9px] uppercase font-black tracking-widest active:scale-95 transition-all`}
                                    >
                                        {copiedPath === page.path ? <Check size={12} /> : <Copy size={12} />} 
                                        {copiedPath === page.path ? 'Copiado' : 'Copiar'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Management Panels */}
                <section>
                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 mb-4 flex items-center gap-2 border-b border-white/10 pb-2 mt-10">
                        <Lock size={12} /> Sistemas Internos
                    </h2>
                    <div className="grid grid-cols-1 gap-3">
                        {managementPages.map((page, idx) => (
                            <button
                                key={idx}
                                onClick={() => { playNeonClick(); navigate(page.path); }}
                                className="bg-gradient-to-r from-red-500/10 to-orange-500/5 border border-red-500/20 rounded-2xl p-4 flex items-center justify-between group hover:border-red-400/40 active:scale-95 transition-all"
                            >
                                <div className="flex flex-col items-start text-left flex-1">
                                    <h3 className="text-[12px] font-[1000] text-red-400 uppercase tracking-wider group-hover:text-red-300 transition-colors">{page.title}</h3>
                                    <p className="text-[9px] text-white/40 uppercase tracking-widest mt-1">{page.desc}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleCopy(page.path); }}
                                        className={`w-8 h-8 rounded-full flex items-center justify-center border transition-colors ${copiedPath === page.path ? 'bg-green-500/20 border-green-500/40 text-green-400' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white'}`}
                                    >
                                        {copiedPath === page.path ? <Check size={14} /> : <Copy size={14} />}
                                    </button>
                                    <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/30 text-red-400 group-hover:bg-red-500/30 transition-colors">
                                        <ExternalLink size={14} />
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-5 mt-4">
                        <h3 className="text-[10px] font-black text-yellow-500 uppercase tracking-widest mb-2 flex items-center gap-2 border-b border-yellow-500/20 pb-2">
                            <Store size={14} /> Paneles de Comercio Especiales
                        </h3>
                        <p className="text-[9px] text-yellow-400/80 leading-relaxed">
                            Para acceder a los paneles de: <br/>
                            <span className="font-bold text-white uppercase ml-1">- Carga de Ofertas y Puntos VIP (Posnet)</span><br/>
                            <span className="font-bold text-white uppercase ml-1">- Suscripción B2C (Cliente)</span><br/>
                            Debe buscar el comercio específico en <strong>Gestión Comercial</strong> y usar los botones de acceso directo que figuran para ese local.
                        </p>
                        <button 
                            onClick={() => { playNeonClick(); navigate('/embajador/gestion'); }}
                            className="w-full mt-4 bg-yellow-500 text-black py-3 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] active:scale-95 transition-transform"
                        >
                            Ir a buscar comercio
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default MasterPanelPage;
