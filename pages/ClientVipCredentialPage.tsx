import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Shop, Client } from '../types';
import { 
    ShieldCheck, 
    Star, 
    QrCode, 
    ChevronLeft,
    Share2,
    Activity
} from 'lucide-react';
import { playNeonClick } from '../utils/audio';

interface ClientVipCredentialPageProps {
    allShops: Shop[];
}

const ClientVipCredentialPage: React.FC<ClientVipCredentialPageProps> = ({ allShops }) => {
    const { townId, categorySlug, shopSlug } = useParams<{ townId: string, categorySlug: string, shopSlug: string }>();
    const navigate = useNavigate();

    const shop = allShops.find(s => s.slug === shopSlug);

    if (!shop) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 text-center">
                <div className="w-20 h-20 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mb-6">
                    <ShieldCheck size={40} className="text-red-500" />
                </div>
                <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-2">Comercio no encontrado</h2>
                <button 
                    onClick={() => navigate('/')}
                    className="bg-white/5 border border-white/10 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all"
                >
                    Volver al Inicio
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-6 relative overflow-hidden flex flex-col items-center pt-16 pb-24 selection:bg-cyan-500/30">
            {/* HUD Background Layers */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[150px] opacity-20" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-violet-500/5 rounded-full blur-[120px]" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
            </div>

            {/* HEADER */}
            <div className="w-full max-w-sm relative z-10 flex justify-between items-center mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
                <button 
                    onClick={() => { playNeonClick(); navigate(-1); }}
                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all"
                >
                    <ChevronLeft size={20} />
                </button>
                <div className="text-center">
                    <h1 className="text-2xl font-[1000] text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-400 to-blue-500 tracking-tighter uppercase drop-shadow-[0_0_20px_rgba(34,211,238,0.4)]">
                        ShopDigital
                    </h1>
                    <p className="text-[8px] font-[900] text-cyan-400/60 uppercase tracking-[0.4em]">Credencial VIP Simétrica</p>
                </div>
                <button 
                    onClick={() => playNeonClick()}
                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all"
                >
                    <Share2 size={18} />
                </button>
            </div>

            {/* VIP CARD */}
            <div className="w-full max-w-sm relative z-10 group animate-in zoom-in duration-700 delay-100">
                {/* Glow Effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                
                <div className="relative bg-zinc-900 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
                    {/* Card Header Background */}
                    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-cyan-500/20 via-transparent to-transparent" />
                    
                    <div className="p-8 pb-10">
                        {/* Status Badge */}
                        <div className="flex justify-between items-start mb-8">
                            <div className="bg-cyan-500/10 border border-cyan-500/30 px-3 py-1.5 rounded-full flex items-center gap-2">
                                <Activity size={10} className="text-cyan-400 animate-pulse" />
                                <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest">ACTIVA</span>
                            </div>
                            <Star size={24} className="text-cyan-400 fill-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                        </div>

                        {/* Shop Info */}
                        <div className="mb-10">
                            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-1">Membresía Exclusiva</p>
                            <h3 className="text-3xl font-[1000] text-white uppercase tracking-tighter leading-none mb-2">
                                {shop.name}
                            </h3>
                            <div className="flex items-center gap-2 text-cyan-400/80">
                                <ShieldCheck size={14} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">{shop.zone} · {shop.category}</span>
                            </div>
                        </div>

                        {/* QR / Visual Code placeholder */}
                        <div className="w-full aspect-square bg-white/[0.03] border border-white/10 rounded-3xl flex flex-col items-center justify-center p-8 mb-10 relative overflow-hidden group/qr">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.05),transparent_70%)]" />
                            <QrCode size={180} className="text-white/20 group-hover/qr:text-cyan-400/40 transition-all duration-700 scale-90 group-hover/qr:scale-100" />
                            <div className="absolute bottom-6 bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl">
                                <p className="text-[9px] font-black text-cyan-400 uppercase tracking-[0.2em]">Escanear para Validar</p>
                            </div>
                        </div>

                        {/* Card Footer */}
                        <div className="flex justify-between items-end border-t border-white/5 pt-8">
                            <div>
                                <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Cliente VIP</p>
                                <p className="text-[13px] font-bold text-white tracking-tight uppercase">Socio Preferencial</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Emisión</p>
                                <p className="text-[10px] font-bold text-white/80 tabular-nums">07/04/2026</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="w-full max-w-sm mt-10 space-y-4 relative z-10 animate-in slide-in-from-bottom-4 duration-700 delay-300">
                <button 
                    onClick={() => playNeonClick()}
                    className="w-full h-16 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase tracking-[0.2em] text-[11px] shadow-[0_0_30px_rgba(34,211,238,0.3)] transition-all active:scale-95 flex items-center justify-center gap-3 border border-cyan-400/50"
                >
                    <Star size={18} /> Ver Mis Beneficios
                </button>
                <button 
                    onClick={() => { playNeonClick(); navigate(`/${townId}/red-comercial/ofertas`); }}
                    className="w-full h-16 rounded-2xl bg-white/5 hover:bg-white/10 text-white/80 font-black uppercase tracking-[0.2em] text-[11px] transition-all active:scale-95 border border-white/10"
                >
                    Ir a la Red Comercial
                </button>
            </div>

            {/* FOOTER INFO */}
            <p className="text-[8.5px] text-white/20 uppercase tracking-[0.4em] font-bold text-center leading-[1.8] mt-10 px-8 relative z-10 animate-in fade-in duration-1000 delay-500">
                Esta credencial es personal e intransferible. <br/>
                Válida únicamente en locales adheridos a ShopDigital de la zona {townId}.
            </p>
        </div>
    );
};

export default ClientVipCredentialPage;
