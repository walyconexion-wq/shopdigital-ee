import React, { useMemo, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Shop } from '../types';
import { ArrowLeft, ShieldCheck, User, MapPin, Hash, Sparkles, Clock } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { playNeonClick } from '../utils/audio';

interface ValidationPageProps {
    allShops: Shop[];
}

const ValidationPage: React.FC<ValidationPageProps> = ({ allShops }) => {
    const { shopSlug } = useParams<{ shopSlug: string }>();
    const navigate = useNavigate();
    const [currentTime, setCurrentTime] = useState(new Date());

    const validationUrl = useMemo(() => {
        return window.location.href;
    }, []);

    // Anti-screenshot: Live clock
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const selectedShop = useMemo(() =>
        allShops.find(shop => (shop.slug || shop.id) === shopSlug),
        [shopSlug, allShops]);

    if (!selectedShop) return null;

    // Default values if fields are missing (Master Play)
    const ownerName = selectedShop.ownerName || "Propietario No Registrado";
    const ownerPhoto = selectedShop.ownerPhoto || "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&h=400&fit=crop";
    const memberNumber = selectedShop.memberNumber || "0000-0000";
    const shopNumber = selectedShop.shopNumber || selectedShop.id.slice(0, 6).toUpperCase();
    const region = selectedShop.region || "Esteban Echeverría";

    return (
        <div className="min-h-screen bg-black flex flex-col items-center p-6 animate-in fade-in duration-1000 relative overflow-hidden">
            {/* Dynamic HUD Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
            </div>

            {/* Top Navigation */}
            <div className="w-full max-w-md flex justify-between items-center mb-8 relative z-10">
                <button
                    onClick={() => {
                        playNeonClick();
                        navigate(-1);
                    }}
                    className="p-3 rounded-2xl bg-white/5 border border-white/10 text-cyan-400 hover:bg-cyan-500/10 transition-all active:scale-95"
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.2em]">Security Protocol</span>
                    <span className="text-[12px] font-mono text-white/80 tabular-nums">
                        {currentTime.toLocaleTimeString()}
                    </span>
                </div>
            </div>

            {/* Validation Card */}
            <div className="w-full max-w-sm relative group">
                {/* Border Glow */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
                
                <div className="relative bg-[#050505] rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl">
                    {/* Card Header HUD */}
                    <div className="bg-gradient-to-r from-cyan-900/40 to-transparent p-6 flex justify-between items-center border-b border-white/5">
                        <div className="flex flex-col">
                            <h1 className="text-sm font-black text-white uppercase tracking-[0.3em] leading-none mb-1">Identidad Digital</h1>
                            <span className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest">Validación Oficial ShopDigital</span>
                        </div>
                        <ShieldCheck className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" size={24} />
                    </div>

                    <div className="p-8 pb-4">
                        {/* Owner Image & Main ID */}
                        <div className="flex items-center gap-6 mb-8">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-cyan-500/30 p-1 bg-black shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                                    <img src={ownerPhoto} alt={ownerName} className="w-full h-full object-cover rounded-xl grayscale hover:grayscale-0 transition-all duration-500" />
                                </div>
                                <div className="absolute -bottom-2 -right-2 bg-black border border-cyan-500/40 p-1.5 rounded-lg shadow-lg">
                                    <Sparkles size={12} className="text-cyan-400 animate-pulse" />
                                </div>
                            </div>
                            
                            <div className="flex flex-col gap-1.5">
                                <span className="text-[8px] font-black text-cyan-500/60 uppercase tracking-widest">Nombre Completo</span>
                                <h2 className="text-lg font-black text-white uppercase tracking-tighter leading-tight">{ownerName}</h2>
                                <div className="flex items-center gap-1.5 opacity-60">
                                    <MapPin size={10} className="text-white" />
                                    <span className="text-[9px] font-bold text-white uppercase tracking-wider">{region}</span>
                                </div>
                            </div>
                        </div>

                        {/* Data Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-white/[0.03] border border-white/5 p-4 rounded-2xl">
                                <div className="flex items-center gap-2 mb-1 opacity-40">
                                    <Hash size={10} className="text-white" />
                                    <span className="text-[7px] font-black text-white uppercase tracking-widest">Socio Nº</span>
                                </div>
                                <p className="text-xs font-mono text-cyan-400 font-bold">{memberNumber}</p>
                            </div>
                            <div className="bg-white/[0.03] border border-white/5 p-4 rounded-2xl">
                                <div className="flex items-center gap-2 mb-1 opacity-40">
                                    <User size={10} className="text-white" />
                                    <span className="text-[7px] font-black text-white uppercase tracking-widest">Local ID</span>
                                </div>
                                <p className="text-xs font-mono text-cyan-400 font-bold">{shopNumber}</p>
                            </div>
                        </div>

                        {/* QR Validation Dynamic */}
                        <div className="w-full bg-cyan-500/[0.03] rounded-3xl p-6 mb-6 border border-cyan-500/10 flex flex-col items-center">
                            <div className="bg-white p-3 rounded-xl mb-3 shadow-[0_0_20px_rgba(255,255,255,0.05)]">
                                <QRCodeCanvas 
                                    value={validationUrl}
                                    size={120}
                                    level="H"
                                    includeMargin={false}
                                />
                            </div>
                            <span className="text-[7px] font-black text-cyan-500/60 uppercase tracking-[0.4em]">Sello Técnico de Validación</span>
                        </div>

                        {/* Status HUD */}
                        <div className="flex flex-col gap-4">
                            <div className="flex justify-between items-center bg-cyan-500/5 border border-cyan-500/20 p-4 rounded-2xl">
                                <div className="flex flex-col">
                                    <span className="text-[8px] font-black text-cyan-500/60 uppercase tracking-widest leading-none mb-1">Estado del Sistema</span>
                                    <span className="text-[10px] font-black text-white uppercase tracking-widest">VERIFICADO ONLINE</span>
                                </div>
                                <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,1)] animate-ping" />
                            </div>
                        </div>
                    </div>

                    <p className="text-[8.5px] font-bold text-white/40 uppercase tracking-[0.2em] leading-relaxed text-center px-4 mb-6">
                        Esta credencial confirma la legitimidad del titular para operar bajo la red **ShopDigital**
                    </p>

                    {/* Footer HUD info */}
                    <div className="bg-[#0a0a0a] p-4 flex justify-center items-center border-t border-white/5 gap-3">
                        <Clock size={12} className="text-cyan-500/40" />
                        <span className="text-[8px] font-mono text-cyan-500/40 uppercase tracking-[0.3em]">Session token: {Math.random().toString(36).substring(7).toUpperCase()}</span>
                    </div>
                </div>
            </div>

            {/* Bottom Info */}
            <div className="mt-10 flex flex-col items-center gap-4 relative z-10">
                <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
                <p className="text-[9px] font-black text-cyan-500/40 uppercase tracking-[0.5em] text-center">
                    Ruta de Validación: MASTER-PLAY-001
                </p>
                <div className="flex items-center gap-4 grayscale opacity-20">
                     <span className="text-[7px] font-bold text-white uppercase tracking-[1em] mr-[-1em]">ShopDigital.tech</span>
                </div>
            </div>
        </div>
    );
};

export default ValidationPage;
