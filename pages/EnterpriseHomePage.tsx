import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ENTERPRISE_CATEGORIES } from '../enterpriseConstants';
import { Factory, ChevronLeft, Share2 } from 'lucide-react';
import { playNeonClick } from '../utils/audio';

interface EnterpriseHomePageProps {
    globalConfig?: any;
}

const EnterpriseHomePage: React.FC<EnterpriseHomePageProps> = ({ globalConfig }) => {
    const { townId = 'esteban-echeverria' } = useParams<{ townId: string }>();
    const navigate = useNavigate();
    const townName = globalConfig?.townName || townId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    const handleShare = () => {
        playNeonClick();
        const url = `${window.location.origin}/${townId}/empresas`;
        const text = `¡Descubrí el Directorio Industrial de ${townName}! 🏭\n\n👉 ${url}`;
        if (navigator.share) {
            navigator.share({ title: 'ShopDigital Empresas', text, url }).catch(console.error);
        } else {
            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
        }
    };

    return (
        <div className="flex flex-col pt-6 pb-12 animate-in fade-in duration-700 relative overflow-hidden min-h-screen bg-transparent">
            {/* HUD Background — Estética Industrial (Acero Neón) */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-orange-500/5 rounded-full blur-[100px]" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(245,158,11,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(245,158,11,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
            </div>

            {/* Header Industrial */}
            <header className="flex flex-col items-center relative z-10 px-6 mb-8">
                <button
                    onClick={() => { playNeonClick(); navigate(`/${townId}/home`); }}
                    className="self-start mb-4 w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-400/30 hover:bg-amber-500/20 transition-all shadow-lg active:scale-95"
                >
                    <ChevronLeft size={20} />
                </button>

                <div className="glass-header rounded-3xl p-5 mb-4 border backdrop-blur-md border-amber-500/30 bg-gradient-to-br from-amber-500/15 to-orange-600/10 shadow-[0_15px_40px_rgba(245,158,11,0.2)]">
                    <Factory size={48} className="text-amber-400 drop-shadow-[0_0_20px_rgba(245,158,11,0.6)]" />
                </div>

                <h1 className="text-[18px] font-[1000] text-white uppercase tracking-[0.2em] text-center drop-shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                    Directorio Industrial
                </h1>
                <div className="flex items-center gap-2 mt-2">
                    <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-amber-500/50" />
                    <p className="text-[9px] font-black text-amber-400/70 uppercase tracking-[0.3em]">
                        {townName} · Proveedores & Mayoristas
                    </p>
                    <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-amber-500/50" />
                </div>
            </header>

            {/* Grid de 21 Rubros Industriales */}
            <div className="grid grid-cols-3 gap-x-4 gap-y-7 px-5 relative z-10">
                {ENTERPRISE_CATEGORIES.map((cat, index) => (
                    <button
                        key={cat.id}
                        onClick={() => { playNeonClick(); navigate(`/${townId}/empresas/${cat.slug}`); }}
                        className="glass-button-3d category-btn btn-neon-active aspect-square group backdrop-blur-md border rounded-[1.25rem] transition-all duration-300 bg-amber-500/10 border-amber-500/15 hover:border-amber-400/40 active:scale-95"
                        style={{
                            animation: `fadeUp 0.7s cubic-bezier(0.25, 1, 0.5, 1) ${index * 35}ms both`,
                            boxShadow: '0 0 15px rgba(245,158,11,0.06)'
                        }}
                    >
                        <div className="mb-1.5 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-500 ease-out text-amber-400">
                            {cat.icon}
                        </div>
                        <span className="text-[8px] text-center font-black uppercase leading-[1.1] tracking-[0.01em] px-0.5 text-white/90 group-hover:text-white transition-colors">
                            {cat.name}
                        </span>
                    </button>
                ))}
            </div>

            {/* CTA Compartir */}
            <div className="mt-12 mb-4 px-14 flex flex-col gap-4 justify-center items-center w-full relative z-10">
                <button
                    onClick={handleShare}
                    className="glass-action-btn w-full py-4 text-[10px] font-[1100] uppercase tracking-[0.25em] active:scale-95 border flex items-center justify-center gap-3 bg-amber-500/20 border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                >
                    <Share2 size={16} className="text-amber-400" strokeWidth={3} />
                    <span className="text-white text-shadow-premium">Compartir Directorio</span>
                </button>
            </div>

            {/* Footer Industrial */}
            <footer className="w-full flex flex-col items-center gap-2 pt-6 pb-6 mt-auto border-t border-amber-500/10 relative z-10">
                <p className="text-[9px] font-black text-white uppercase tracking-[0.35em] text-center select-none">
                    © 2026 · ShopDigital
                </p>
                <p className="text-[8px] font-bold text-amber-400 uppercase tracking-[0.25em] text-center select-none" style={{ textShadow: '0 0 10px rgba(245,158,11,0.5)' }}>
                    🏭 Nodo Empresarial B2B
                </p>
            </footer>
        </div>
    );
};

export default EnterpriseHomePage;
