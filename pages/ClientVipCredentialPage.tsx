import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Shop, Client } from '../types';
import { 
    ShieldCheck, 
    Star, 
    QrCode, 
    ChevronLeft,
    Share2,
    Activity,
    User
} from 'lucide-react';
import { playNeonClick } from '../utils/audio';

interface ClientVipCredentialPageProps {
    allShops: Shop[];
    allClients: Client[];
}

const ClientVipCredentialPage: React.FC<ClientVipCredentialPageProps> = ({ allShops, allClients }) => {
    const { townId = 'esteban-echeverria', categorySlug, shopSlug, clientId } = useParams<{ 
        townId: string, 
        categorySlug: string, 
        shopSlug: string,
        clientId?: string
    }>();
    const navigate = useNavigate();

    // 1. Encontrar el comercio origen
    const shop = useMemo(() => 
        allShops.find(s => (s.slug === shopSlug || s.id === shopSlug)),
    [allShops, shopSlug]);

    // 2. Encontrar al socio si hay clientId
    const client = useMemo(() => {
        if (!clientId) return null;
        return allClients.find(c => c.id === clientId);
    }, [allClients, clientId]);

    if (!shop) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 text-center">
                <div className="w-20 h-20 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mb-6 animate-pulse">
                    <ShieldCheck size={40} className="text-red-500" />
                </div>
                <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-2">Comercio del Club No Encontrado</h2>
                <p className="text-white/40 text-[10px] uppercase mb-8 leading-relaxed">El comercio de origen no existe en este universo regional.</p>
                <button 
                    onClick={() => navigate('/')}
                    className="bg-white/5 border border-white/10 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all active:scale-95"
                >
                    Volver al Inicio
                </button>
            </div>
        );
    }

    const enrollmentDate = client?.createdAt 
        ? new Date(client.createdAt).toLocaleDateString('es-AR') 
        : new Date().toLocaleDateString('es-AR');

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
                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all shadow-inner"
                >
                    <ChevronLeft size={20} />
                </button>
                <div className="text-center">
                    <h1 className="text-2xl font-[1000] text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-400 to-blue-500 tracking-tighter uppercase drop-shadow-[0_0_20px_rgba(34,211,238,0.4)]">
                        ShopDigital
                    </h1>
                    <p className="text-[8px] font-[900] text-cyan-400/60 uppercase tracking-[0.4em]">Sede: {townId.toUpperCase()}</p>
                </div>
                <button 
                    onClick={() => {
                        playNeonClick();
                        if (navigator.share) {
                            navigator.share({
                                title: `Credencial VIP de ${client?.name || 'Socio'}`,
                                text: `Mirá mi Credencial VIP en ShopDigital: ${shop.name}`,
                                url: window.location.href,
                            });
                        }
                    }}
                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all shadow-inner"
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
                                <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest">CREDENCIAL ACTIVA</span>
                            </div>
                            <Star size={24} className="text-cyan-400 fill-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.5)]" />
                        </div>

                        {/* Shop Info */}
                        <div className="mb-10">
                            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-1">Membresía Exclusiva</p>
                            <h3 className="text-3xl font-[1000] text-white uppercase tracking-tighter leading-none mb-2">
                                {shop.name}
                            </h3>
                            <div className="flex items-center gap-2 text-cyan-400/80">
                                <ShieldCheck size={14} />
                                <span className="text-[10px] font-bold uppercase tracking-widest leading-none mt-0.5">{shop.zone || townId} · {shop.category}</span>
                            </div>
                        </div>

                        {/* QR / Identity Area */}
                        <div className="w-full aspect-square bg-white/[0.03] border border-white/10 rounded-3xl flex flex-col items-center justify-center p-8 mb-10 relative overflow-hidden group/qr">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.05),transparent_70%)]" />
                            <QrCode size={180} className="text-white/10 group-hover/qr:text-cyan-400/30 transition-all duration-700 scale-90 group-hover/qr:scale-100" />
                            
                            {/* Inner Identity Bubble */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="w-32 h-32 rounded-full bg-cyan-500/5 border border-cyan-400/20 backdrop-blur-sm flex items-center justify-center shadow-2xl">
                                    <User size={60} className="text-cyan-400/50" />
                                </div>
                            </div>

                            <div className="absolute bottom-6 bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl">
                                <p className="text-[9px] font-black text-white/70 uppercase tracking-[0.3em]">Socio ShopDigital</p>
                            </div>
                        </div>

                        {/* Card Footer: DYNAMIC IDENTITY 💎 */}
                        <div className="flex justify-between items-end border-t border-white/5 pt-8">
                            <div className="flex-1">
                                <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Titular VIP</p>
                                <p className="text-[15px] font-black text-white tracking-tighter uppercase leading-tight">
                                    {client?.name || 'Socio Preferencial'}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Enrolamiento</p>
                                <p className="text-[11px] font-black text-cyan-400 tabular-nums">{enrollmentDate}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="w-full max-w-sm mt-10 space-y-4 relative z-10 animate-in slide-in-from-bottom-4 duration-700 delay-300">
                <button 
                    onClick={() => { playNeonClick(); navigate(`/${townId}/red-comercial/ofertas`); }}
                    className="w-full h-16 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-[1000] uppercase tracking-[0.2em] text-[11px] shadow-[0_10px_25px_rgba(34,211,238,0.2)] transition-all active:scale-95 flex items-center justify-center gap-3 border border-white/10"
                >
                    <Star size={18} /> Ver Mis Beneficios
                </button>
                <button 
                    onClick={() => { playNeonClick(); navigate(`/${townId}/home`); }}
                    className="w-full h-16 rounded-2xl bg-white/5 hover:bg-white/10 text-white/60 font-black uppercase tracking-[0.2em] text-[11px] transition-all active:scale-95 border border-white/5"
                >
                    Volver a Inicio
                </button>
            </div>

            {/* FOOTER INFO */}
            <p className="text-[8.5px] text-white/20 uppercase tracking-[0.4em] font-black text-center leading-[1.8] mt-10 px-8 relative z-10 animate-in fade-in duration-1000 delay-500">
                Esta credencial habilita al titular a acceder a los <br/>
                descuentos y promociones exclusivas en la zona {townId.toUpperCase()}.
                <br/><br/>
                <span className="text-cyan-400/30">ID VERIFICACIÓN: {client?.id || 'SD-LEGACY'}</span>
            </p>
        </div>
    );
};

export default ClientVipCredentialPage;
