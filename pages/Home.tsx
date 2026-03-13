import React from 'react';
import { CATEGORIES } from '../constants';
import Logo from '../components/Logo';
import { Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
    const navigate = useNavigate();
    const [logoClicks, setLogoClicks] = React.useState(0);

    // Reset clicks after 1 second of inactivity
    React.useEffect(() => {
        if (logoClicks === 0) return;
        
        const timer = setTimeout(() => {
            setLogoClicks(0);
        }, 1000);

        return () => clearTimeout(timer);
    }, [logoClicks]);

    const handleLogoClick = () => {
        const nextClicks = logoClicks + 1;
        if (nextClicks >= 3) {
            setLogoClicks(0);
            navigate('/nosotros');
        } else {
            setLogoClicks(nextClicks);
        }
    };

    // Synthetic Audio Feedback - Neon Click
    const playNeonClick = () => {
        try {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContext) return;
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);
            
            gain.gain.setValueAtTime(0.05, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.start();
            osc.stop(ctx.currentTime + 0.1);
        } catch (e) {
            console.error("Audio error", e);
        }
    };

    const handleShare = () => {
        playNeonClick();
        const appUrl = window.location.origin;
        const shareTitle = 'ShopDigital - La App de Waly';
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
        <div className="flex flex-col pt-8 pb-12 animate-in fade-in duration-700 relative overflow-hidden min-h-screen bg-black">
            {/* HUD Decorative Elements */}
            <div className="absolute top-20 left-[-10%] w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-20 right-[-10%] w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <header className="flex-shrink-0 flex flex-col items-center relative z-10 transition-all duration-700 bg-transparent pt-0">
                <div 
                    onClick={handleLogoClick}
                    className="glass-header rounded-3xl p-2.5 mb-2.5 border-cyan-400/50 shadow-[0_15px_40px_rgba(34,211,238,0.4)] bg-gradient-to-br from-cyan-500/20 to-slate-900/60 animate-in fade-in zoom-in duration-1000 cursor-pointer active:scale-95 transition-all"
                >
                    <Logo />
                </div>
            </header>

            <div className="flex flex-col items-center mb-10 mt-2 fade-up-item relative z-10">
                <div className="h-[1px] w-12 bg-cyan-400/30 mb-5"></div>
                <h2 className="text-[10px] font-black text-white text-shadow-premium uppercase tracking-[0.4em] text-center">
                    Seleccionar Categoría
                </h2>
                <div className="flex gap-1.5 mt-4">
                    <div className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500"></div>
                    <div className="w-1 h-1 rounded-full bg-cyan-400/40"></div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-x-3 gap-y-7 px-6 relative z-10">
                {CATEGORIES.map((cat, index) => (
                    <button
                        key={cat.id}
                        onClick={() => navigate(`/${cat.slug}`)}
                        style={{
                            animation: `fadeUp 0.7s cubic-bezier(0.25, 1, 0.5, 1) ${index * 35}ms both`
                        }}
                        className="glass-button-3d category-btn btn-neon-active aspect-square group"
                    >
                        <div className="mb-1.5 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-500 ease-out text-cyan-400">
                            {cat.icon}
                        </div>
                        <span className="text-[8.5px] text-center font-black uppercase leading-[1.1] tracking-[0.01em] px-0.5 text-white/90 group-hover:text-white transition-colors">
                            {cat.name}
                        </span>
                    </button>
                ))}
            </div>

            <div className="mt-12 mb-4 flex justify-center fade-up-item relative z-10" style={{ animationDelay: '700ms' }}>
                <button
                    onClick={handleShare}
                    className="glass-action-btn btn-cyan-neon luminous-glow py-4 px-10 text-[10px] font-[1100] uppercase tracking-[0.25em] active:scale-95 shadow-[0_0_30px_rgba(34,211,238,0.3)] border-cyan-400/60"
                >
                    <Share2 size={16} strokeWidth={3} className="text-cyan-300" />
                    Compartir App
                </button>
            </div>

            <footer className="w-full flex flex-col items-center gap-1.5 pt-6 pb-4 mt-auto border-t border-white/10 relative z-10">
                <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.35em] text-center select-none" style={{ textShadow: '0 0 8px rgba(34, 211, 238, 0.2)' }}>
                    © 2026 · ShopDigital
                </p>
                <p 
                    onClick={() => navigate('/unirse')}
                    className="text-[8px] font-bold uppercase tracking-[0.25em] text-center select-none cursor-pointer active:scale-95 transition-transform" 
                    style={{ color: '#22d3ee', textShadow: '0 0 10px rgba(34, 211, 238, 0.8), 0 0 20px rgba(34, 211, 238, 0.4)' }}
                >
                    La app de Waly
                </p>
            </footer>
        </div>
    );
};

export default Home;
