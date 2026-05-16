import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ChevronRight } from 'lucide-react';
import { playNeonClick } from '../utils/audio';

interface Town {
    id: string;
    name: string;
    type?: string;
}

interface RegionalNavBarProps {
    regionName: string;
    currentTownId: string;
    towns: Town[];
    themeColor?: string;
}

export const RegionalNavBar: React.FC<RegionalNavBarProps> = ({ 
    regionName, 
    currentTownId, 
    towns,
    themeColor = '#0ea5e9' 
}) => {
    const navigate = useNavigate();

    const handleNavigate = (townId: string) => {
        if (townId === currentTownId) return;
        playNeonClick();
        navigate(`/${townId}/home`);
    };

    return (
        <div className="w-full bg-black/40 backdrop-blur-md border-b border-white/5 sticky top-0 z-40 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 py-2">
                <div className="flex items-center gap-4">
                    {/* Region Label */}
                    <div className="flex-shrink-0 flex items-center gap-2 border-r border-white/10 pr-4">
                        <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: themeColor }} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
                            {regionName}
                        </span>
                    </div>

                    {/* Horizontal Scrollable Towns */}
                    <div className="flex-1 overflow-x-auto no-scrollbar py-1">
                        <div className="flex items-center gap-2">
                            {towns.map((town) => (
                                <button
                                    key={town.id}
                                    onClick={() => handleNavigate(town.id)}
                                    className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2 border ${
                                        town.id === currentTownId
                                            ? 'bg-white/10 border-white/20 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                                            : 'bg-transparent border-transparent text-white/40 hover:text-white/70 hover:bg-white/5'
                                    }`}
                                    style={{
                                        borderColor: town.id === currentTownId ? themeColor : undefined,
                                        boxShadow: town.id === currentTownId ? `0 0 15px ${themeColor}44` : undefined,
                                        color: town.id === currentTownId ? themeColor : undefined
                                    }}
                                >
                                    <MapPin size={10} className={town.id === currentTownId ? 'animate-bounce' : ''} />
                                    {town.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Hint */}
                    <div className="flex-shrink-0 hidden md:flex items-center gap-1 text-[8px] font-black text-white/20 uppercase tracking-tighter">
                        <span>Deslizá</span>
                        <ChevronRight size={10} />
                    </div>
                </div>
            </div>
            
            {/* Glow line effect */}
            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent opacity-50" />
        </div>
    );
};
