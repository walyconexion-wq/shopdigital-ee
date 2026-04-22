import React, { useState, useEffect } from 'react';
import { generateAdvisorMessage } from '../services/gemini';
import { Sparkles, MessageCircle, Bot } from 'lucide-react';
import { playNeonClick } from '../utils/audio';

interface SmartAdvisorProps {
    shopName: string;
    zone: string;
    categoryTitle: string;
    offers?: any[];
}

export const SmartAdvisor: React.FC<SmartAdvisorProps> = ({ shopName, zone, categoryTitle, offers }) => {
    const [message, setMessage] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [mode, setMode] = useState<'welcome' | 'advice'>('welcome');

    useEffect(() => {
        let isMounted = true;
        const fetchWelcomeMsg = async () => {
            setLoading(true);
            const response = await generateAdvisorMessage({
                shopName,
                zone,
                category: categoryTitle,
                actionType: 'welcome'
            });
            if (isMounted) {
                setMessage(response);
                setLoading(false);
            }
        };
        
        fetchWelcomeMsg();

        return () => { isMounted = false; };
    }, [shopName, zone, categoryTitle]);

    const handleAskAdvice = async () => {
        playNeonClick();
        setLoading(true);
        setMode('advice');
        const response = await generateAdvisorMessage({
            shopName,
            zone,
            category: categoryTitle,
            offers,
            actionType: 'advice'
        });
        setMessage(response);
        setLoading(false);
    };

    return (
        <div className="mx-4 mb-8 mt-2 relative animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Contenedor Glow Animado */}
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-3xl blur opacity-30 animate-pulse"></div>
            
            <div className="relative bg-[#0a0a0a] border border-cyan-500/20 rounded-3xl p-5 shadow-[0_0_20px_rgba(6,182,212,0.15)] flex flex-col gap-3">
                <div className="flex items-start gap-4">
                    <div className="relative shrink-0">
                        <div className="w-12 h-12 bg-cyan-900/40 rounded-full border border-cyan-500/50 flex items-center justify-center relative z-10 animate-bounce" style={{ animationDuration: '3s' }}>
                            <Bot size={24} className="text-cyan-400" />
                        </div>
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-black rounded-full z-20 shadow-[0_0_10px_rgba(34,197,94,0.8)]"></span>
                    </div>
                    
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-[11px] font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400">
                                Asistente Virtual
                            </h4>
                            <Sparkles size={10} className="text-violet-400 animate-pulse" />
                        </div>
                        
                        <div className="bg-white/5 border border-white/5 rounded-2xl rounded-tl-none p-4 text-sm text-white/80 leading-relaxed font-medium relative">
                            {loading ? (
                                <div className="flex gap-1 items-center h-5">
                                    <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce"></div>
                                </div>
                            ) : (
                                <p className="animate-in fade-in duration-500 text-[12px]">{message}</p>
                            )}
                        </div>
                    </div>
                </div>

                {mode === 'welcome' && !loading && (
                    <div className="self-end mt-1">
                        <button 
                            onClick={handleAskAdvice}
                            className="bg-transparent border border-cyan-500/40 text-cyan-400 text-[10px] font-bold uppercase tracking-wider px-4 py-2 rounded-full hover:bg-cyan-500/10 active:scale-95 transition-all flex items-center gap-1.5"
                        >
                            <MessageCircle size={12} />
                            Pedir un Consejo
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
