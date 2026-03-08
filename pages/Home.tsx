import React from 'react';
import { CATEGORIES } from '../constants';
import Logo from '../components/Logo';
import { Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
    const navigate = useNavigate();

    const handleShare = () => {
        const appUrl = window.location.origin;
        const shareTitle = 'shopdigital.ar - La App de Waly';
        const shareDescription = '¡Mirá los comercios de Esteban Echeverría en la App de Waly! 🚀';
        const shareText = `${shareDescription}\n\n👉 ${appUrl}`;

        if (navigator.share) {
            navigator.share({
                title: shareTitle,
                text: shareText,
                url: appUrl,
            }).catch(console.error);
        } else {
            const whatsappText = encodeURIComponent(shareText);
            window.open(`https://wa.me/?text=${whatsappText}`, '_blank', 'noopener,noreferrer');
        }
    };

    return (
        <div className="flex flex-col pt-8 pb-12 animate-in fade-in duration-700">
            <header className="flex-shrink-0 flex flex-col items-center relative z-10 transition-all duration-700 bg-transparent pt-0">
                <div className="glass-header rounded-3xl p-2.5 mb-2.5 border-[#8b5cf6]/50 shadow-[0_15px_40px_rgba(139,92,246,0.4)] bg-gradient-to-br from-[#8b5cf6]/20 to-[#0A224E]/60 animate-in fade-in zoom-in duration-1000">
                    <Logo />
                </div>
            </header>

            <div className="flex flex-col items-center mb-10 mt-2 fade-up-item">
                <div className="h-[1px] w-12 bg-white/20 mb-5"></div>
                <h2 className="text-[10px] font-black text-white text-shadow-premium uppercase tracking-[0.4em] text-center">
                    Seleccionar Categoría
                </h2>
                <div className="flex gap-1.5 mt-4">
                    <div className="w-1 h-1 rounded-full bg-[#22C55E]"></div>
                    <div className="w-1 h-1 rounded-full bg-[#FF0000]"></div>
                    <div className="w-1 h-1 rounded-full bg-[#0A224E]"></div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-x-3 gap-y-7 px-6">
                {CATEGORIES.map((cat, index) => (
                    <button
                        key={cat.id}
                        onClick={() => navigate(`/${cat.slug}`)}
                        style={{
                            animation: `fadeUp 0.7s cubic-bezier(0.25, 1, 0.5, 1) ${index * 35}ms forwards`
                        }}
                        className="glass-button-3d category-btn btn-neon-active aspect-square group opacity-0"
                    >
                        <div className="mb-1.5 transform group-hover:scale-110 transition-transform duration-500 ease-out">
                            {React.cloneElement(cat.icon as React.ReactElement<any>, { size: 19, strokeWidth: 1.3 })}
                        </div>
                        <span className="text-[8.5px] text-center font-black uppercase leading-[1.1] tracking-[0.01em] px-0.5 text-white">
                            {cat.name}
                        </span>
                    </button>
                ))}
            </div>

            <div className="mt-12 mb-4 flex justify-center fade-up-item" style={{ animationDelay: '700ms' }}>
                <button
                    onClick={handleShare}
                    className="glass-action-btn btn-violet luminous-glow py-3.5 px-8 text-[10px] font-[1100] uppercase tracking-[0.25em] active:scale-95 shadow-2xl"
                >
                    <Share2 size={16} strokeWidth={3} className="text-white" />
                    Compartir App
                </button>
            </div>

            <footer className="w-full flex flex-col items-center gap-1.5 pt-4 pb-4 mt-2 border-t border-white/10">
                <p className="text-[9px] font-black text-white uppercase tracking-[0.35em] text-center select-none" style={{ textShadow: '0 0 8px rgba(255, 255, 255, 0.4)' }}>
                    © 2026 · shopdigital.ar
                </p>
                <p className="text-[8px] font-bold uppercase tracking-[0.25em] text-center select-none" style={{ color: '#009EE3', textShadow: '0 0 10px rgba(0, 158, 227, 0.8), 0 0 20px rgba(0, 158, 227, 0.4)' }}>
                    La app de Waly
                </p>
            </footer>
        </div>
    );
};

export default Home;
