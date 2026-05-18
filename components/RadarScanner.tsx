import React, { useState } from 'react';
import { 
    Radar, Search, AlertCircle, CheckCircle2, 
    ArrowRight, MapPin, Star, Phone, RefreshCw,
    Scan, Ghost, Zap
} from 'lucide-react';
import { scanZone, RadarResult } from '../services/radar';
import { playNeonClick } from '../utils/audio';
import { generateGhostPitch } from '../services/gemini';
import { X, Copy, MessageSquare, Send } from 'lucide-react';

interface RadarScannerProps {
    townId: string;
    themeColor?: string;
}

const categories = [
    { id: 'pizzerias', name: 'Pizzerías', icon: '🍕' },
    { id: 'barber', name: 'Barberías', icon: '✂️' },
    { id: 'gym', name: 'Gimnasios', icon: '💪' },
    { id: 'restaurantes', name: 'Restaurantes', icon: '🍴' },
];

export const RadarScanner: React.FC<RadarScannerProps> = ({ townId, themeColor = '#a855f7' }) => {
    const [selectedCategory, setSelectedCategory] = useState('pizzerias');
    const [isScanning, setIsScanning] = useState(false);
    const [results, setResults] = useState<RadarResult[]>([]);
    const [scanProgress, setScanProgress] = useState(0);
    
    // El Persuader States
    const [activeGhost, setActiveGhost] = useState<RadarResult | null>(null);
    const [persuasionScript, setPersuasionScript] = useState('');
    const [isPersuading, setIsPersuading] = useState(false);

    const handleStartScan = async () => {
        playNeonClick();
        setIsScanning(true);
        setResults([]);
        setScanProgress(0);
        setActiveGhost(null); // Reset persuader

        // Simulación de progreso de radar
        const interval = setInterval(() => {
            setScanProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return prev + 5;
            });
        }, 150);

        try {
            const data = await scanZone(townId, selectedCategory);
            setTimeout(() => {
                setResults(data);
                setIsScanning(false);
                clearInterval(interval);
            }, 3500); // Dar tiempo al efecto visual
        } catch (error) {
            console.error(error);
            setIsScanning(false);
            clearInterval(interval);
        }
    };

    const handlePersuade = async (biz: RadarResult) => {
        playNeonClick();
        setActiveGhost(biz);
        setIsPersuading(true);
        setPersuasionScript('Analizando ADN del local y redactando guion táctico...');
        
        try {
            const script = await generateGhostPitch(biz.name, biz.category, townId);
            setPersuasionScript(script);
        } catch (error) {
            setPersuasionScript("Error al conectar con Ari para la redacción.");
        } finally {
            setIsPersuading(false);
        }
    };

    const handleOpenWhatsApp = () => {
        if (!activeGhost) return;
        playNeonClick();
        const phone = activeGhost.phone?.replace(/\D/g, '') || '';
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(persuasionScript)}`;
        window.open(url, '_blank');
    };

    const handleCopyScript = () => {
        playNeonClick();
        navigator.clipboard.writeText(persuasionScript);
        alert("¡Guion táctico copiado al portapapeles!");
    };

    const ghostsCount = results.filter(r => r.isGhost).length;

    return (
        <div className="flex flex-col gap-6">
            {/* Control Panel */}
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 shadow-inner backdrop-blur-md">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/70 flex items-center gap-2">
                        <Scan size={14} className="text-cyan-400" /> Parámetros de Escaneo
                    </h3>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-[8px] font-bold text-green-500 uppercase tracking-widest">En Línea</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => { playNeonClick(); setSelectedCategory(cat.id); }}
                            className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-2 ${
                                selectedCategory === cat.id 
                                ? 'bg-cyan-500/20 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.2)]' 
                                : 'bg-black/40 border-white/5 hover:border-white/20'
                            }`}
                        >
                            <span className="text-xl">{cat.icon}</span>
                            <span className={`text-[9px] font-black uppercase tracking-widest ${selectedCategory === cat.id ? 'text-white' : 'text-white/40'}`}>
                                {cat.name}
                            </span>
                        </button>
                    ))}
                </div>

                <button
                    onClick={handleStartScan}
                    disabled={isScanning}
                    className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 font-[1000] uppercase tracking-[0.3em] text-[12px] transition-all relative overflow-hidden group ${
                        isScanning 
                        ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)] active:scale-95'
                    }`}
                >
                    {isScanning ? (
                        <>
                            <RefreshCw size={18} className="animate-spin" />
                            Escaneando... {scanProgress}%
                        </>
                    ) : (
                        <>
                            <Radar size={18} className="group-hover:scale-125 transition-transform" />
                            Iniciar Barrido Táctico
                        </>
                    )}
                    {isScanning && (
                        <div className="absolute bottom-0 left-0 h-1 bg-cyan-400 transition-all duration-300" style={{ width: `${scanProgress}%` }} />
                    )}
                </button>
            </div>

            {/* Radar Animation / Results */}
            <div className="relative min-h-[300px] bg-[#050505] border border-white/5 rounded-2xl overflow-hidden flex flex-col items-center justify-center p-6">
                {isScanning ? (
                    <div className="flex flex-col items-center gap-6 animate-in fade-in duration-700">
                        <div className="relative w-48 h-48 border border-cyan-500/20 rounded-full flex items-center justify-center">
                            <div className="absolute inset-0 border-2 border-cyan-500/10 rounded-full animate-ping"></div>
                            <div className="absolute inset-4 border border-cyan-500/20 rounded-full"></div>
                            <div className="absolute inset-12 border border-cyan-500/30 rounded-full"></div>
                            {/* Radar Sweep Line */}
                            <div className="absolute top-1/2 left-1/2 w-24 h-24 origin-top-left -translate-x-full -translate-y-full bg-gradient-to-br from-cyan-500/40 to-transparent rounded-tl-full animate-[spin_2s_linear_infinite]" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%)' }}></div>
                            <Radar size={48} className="text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]" />
                        </div>
                        <div className="text-center">
                            <h4 className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.4em] mb-2">Interrogando Google Maps...</h4>
                            <p className="text-[8px] text-white/30 uppercase tracking-widest">Analizando coordenadas de {townId}</p>
                        </div>
                    </div>
                ) : results.length > 0 ? (
                    <div className="w-full animate-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex flex-col">
                                <h4 className="text-[12px] font-black text-white uppercase tracking-wider">Reporte de Escaneo</h4>
                                <p className="text-[8px] text-white/40 uppercase tracking-widest">{results.length} Negocios encontrados</p>
                            </div>
                            <div className="bg-red-500/10 border border-red-500/30 px-4 py-2 rounded-xl flex items-center gap-3">
                                <Ghost size={16} className="text-red-400" />
                                <div>
                                    <p className="text-[14px] font-[1000] text-red-400">{ghostsCount}</p>
                                    <p className="text-[7px] font-black text-white/60 uppercase tracking-widest">Fantasmas</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
                            {results.map((biz) => (
                                <div 
                                    key={biz.id}
                                    className={`p-4 border rounded-2xl flex items-center gap-4 transition-all ${
                                        biz.isGhost 
                                        ? 'bg-red-900/10 border-red-500/20 hover:border-red-500/40' 
                                        : 'bg-white/[0.02] border-white/5 opacity-60'
                                    }`}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${biz.isGhost ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                                        {biz.isGhost ? <Ghost size={20} /> : <CheckCircle2 size={20} />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h5 className="text-[12px] font-bold text-white uppercase tracking-tight">{biz.name}</h5>
                                            {biz.rating && (
                                                <div className="flex items-center gap-1 bg-yellow-500/10 px-1.5 py-0.5 rounded text-yellow-500 text-[8px] font-black">
                                                    <Star size={8} fill="currentColor" /> {biz.rating}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-1 mt-1">
                                            <div className="flex items-center gap-1.5 text-[8px] text-white/40 font-bold uppercase tracking-widest">
                                                <MapPin size={10} /> {biz.address}
                                            </div>
                                            {biz.phone && (
                                                <div className="flex items-center gap-1.5 text-[8px] text-cyan-400/60 font-bold uppercase tracking-widest">
                                                    <Phone size={10} /> {biz.phone}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {biz.isGhost && (
                                        <button 
                                            onClick={() => handlePersuade(biz)}
                                            className="p-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 transition-all active:scale-90 group" 
                                            title="Persuadir (Redactar Guion)"
                                        >
                                            <Zap size={16} className="group-hover:scale-125 group-hover:fill-red-400/20 transition-all" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-4 py-12 text-center opacity-40 relative w-full h-full justify-center">
                        {/* Animación de Barrido en Espera */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                             <div className="w-32 h-32 rounded-full border border-cyan-500/20 absolute animate-ping duration-[3000ms]"></div>
                             <div className="w-48 h-48 rounded-full border border-violet-500/10 absolute animate-ping duration-[4000ms] delay-700"></div>
                             <div className="w-2 h-2 bg-cyan-400 rounded-full absolute -top-4 -right-4 animate-pulse shadow-[0_0_10px_rgba(34,211,238,0.8)]"></div>
                             <div className="w-1.5 h-1.5 bg-violet-400 rounded-full absolute bottom-4 left-8 animate-pulse shadow-[0_0_10px_rgba(139,92,246,0.8)] delay-150"></div>
                        </div>
                        <Radar size={64} className="mb-2 text-cyan-500/50 relative z-10" />
                        <div className="flex flex-col relative z-10">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400/80">Radar en Espera</p>
                            <p className="text-[8px] uppercase tracking-widest mt-1 text-white/50">Seleccioná categoría e iniciá el barrido</p>
                        </div>
                    </div>
                )}
            </div>

            {/* AI Insights Card (Conditional) */}
            {results.length > 0 && !isScanning && ghostsCount > 0 && (
                <div className="bg-gradient-to-r from-violet-900/40 to-indigo-900/40 border border-violet-500/30 rounded-2xl p-5 animate-in zoom-in-95 duration-500">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
                            <AlertCircle size={18} className="text-violet-400" />
                        </div>
                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-violet-300">Análisis Táctico de Ari</h4>
                    </div>
                    <p className="text-[11px] text-white/80 leading-relaxed italic">
                        "Director, el radar detectó <span className="text-red-400 font-bold">{ghostsCount} locales</span> en Maps que no forman parte de nuestra red en {townId}. He preparado los borradores de prospección. El local <span className="text-cyan-400 font-bold">'{results.find(r => r.isGhost)?.name}'</span> tiene excelente calificación y sería un aliado estratégico."
                    </p>
                    <div className="mt-4 flex justify-end">
                        <button className="flex items-center gap-2 text-[9px] font-black text-violet-400 uppercase tracking-widest hover:text-violet-300 transition-colors">
                            Ver Estrategia de Contacto <ArrowRight size={12} />
                        </button>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════ */}
            {/* EL PERSUADER MODAL (Guion Táctico)        */}
            {/* ═══════════════════════════════════════════ */}
            {activeGhost && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-[#0a0a0a] border border-red-500/30 w-full max-w-md rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(239,68,68,0.2)] animate-in zoom-in-95 duration-300">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-red-900/40 to-black p-6 border-b border-red-500/20 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Zap size={20} className="text-red-400 animate-pulse" />
                                <div>
                                    <h3 className="text-[14px] font-[1000] text-white uppercase tracking-widest">El Persuader</h3>
                                    <p className="text-[8px] text-red-400 font-black uppercase tracking-widest">Objetivo: {activeGhost.name}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setActiveGhost(null)}
                                className="p-2 hover:bg-white/5 rounded-xl transition-colors"
                            >
                                <X size={20} className="text-white/40" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-violet-500 rounded-2xl blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
                                <div className="relative bg-black/50 border border-white/5 rounded-2xl p-5 min-h-[200px] flex flex-col">
                                    {isPersuading ? (
                                        <div className="flex-1 flex flex-col items-center justify-center gap-4 py-10">
                                            <RefreshCw size={32} className="text-red-500 animate-spin" />
                                            <p className="text-[10px] text-red-400 font-bold animate-pulse uppercase tracking-[0.2em]">Redactando Script...</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex items-center gap-2 mb-3 text-red-400/60 uppercase text-[9px] font-black tracking-widest">
                                                <MessageSquare size={12} /> Guion de WhatsApp Sugerido
                                            </div>
                                            <p className="text-[13px] text-white/80 leading-relaxed whitespace-pre-wrap font-medium italic">
                                                {persuasionScript}
                                            </p>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mt-6">
                                <button 
                                    onClick={handleCopyScript}
                                    className="py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/70 transition-all active:scale-95"
                                >
                                    <Copy size={16} /> Copiar Script
                                </button>
                                <button 
                                    onClick={handleOpenWhatsApp}
                                    className="py-4 bg-green-600 hover:bg-green-500 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-white shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all active:scale-95"
                                >
                                    <Send size={16} /> Ir a WhatsApp
                                </button>
                            </div>
                        </div>

                        {/* Footer info */}
                        <div className="px-6 py-4 bg-black/50 border-t border-white/5 text-center">
                            <p className="text-[8px] text-white/30 uppercase tracking-[0.2em]">Guion generado dinámicamente por Ari basado en ADN comercial de Maps.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
