import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Shop } from '../types';
import { ArrowLeft, Star, QrCode } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

interface CredencialPageProps {
    allShops: Shop[];
}

const CredencialPage: React.FC<CredencialPageProps> = ({ allShops }) => {
    const { categorySlug, shopSlug } = useParams<{ categorySlug: string; shopSlug: string }>();
    const navigate = useNavigate();

    const validationUrl = useMemo(() => {
        return `${window.location.origin}${window.location.pathname}/validar`;
    }, []);

    const selectedShop = useMemo(() =>
        allShops.find(shop => (shop.slug || shop.id) === shopSlug),
        [shopSlug, allShops]);

    if (!selectedShop) return null;

    return (
        <div className="min-h-screen bg-black flex flex-col items-center p-8 animate-in fade-in duration-700 relative overflow-hidden">
            {/* HUD Decorative Elements */}
            <div className="absolute top-20 left-[-10%] w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-20 right-[-10%] w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
            
            <button
                onClick={() => navigate(-1)}
                className="self-start mb-8 text-cyan-400/90 hover:text-cyan-300 flex items-center gap-2 transition-all relative z-10 group/back hover:translate-x-[-4px]"
            >
                <ArrowLeft size={18} className="drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Volver</span>
            </button>

            <div className="w-full max-w-sm bg-gradient-to-br from-cyan-500/30 to-blue-900/40 rounded-[2.5rem] p-[1.5px] shadow-[0_0_40px_rgba(34,211,238,0.15)] relative overflow-hidden group animate-in slide-in-from-bottom duration-1000">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-cyan-400/20 transition-colors"></div>
                
                <div className="bg-[#050505] rounded-[2.4rem] p-8 flex flex-col items-center relative z-10 border border-white/5">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden mb-6 border-2 border-cyan-500/50 shadow-[0_0_20px_rgba(34,211,238,0.3)] bg-black p-1">
                        <img src={selectedShop.image} alt={selectedShop.name} className="w-full h-full object-cover rounded-xl" />
                    </div>

                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-2 text-center text-shadow-premium">{selectedShop.name}</h2>
                    
                    <div className="flex items-center gap-2 mb-8 bg-cyan-500/10 px-4 py-1.5 rounded-full border border-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
                        <Star className="w-3.5 h-3.5 fill-cyan-400 text-cyan-400" />
                        <span className="text-cyan-400 text-[10px] font-black uppercase tracking-[0.2em]">Socio VIP Digital</span>
                    </div>

                    <div className="w-full bg-cyan-500/[0.03] rounded-[2rem] p-8 flex flex-col items-center border border-cyan-500/10 mb-8 relative group/qr">
                        <div className="absolute inset-0 bg-cyan-400/5 blur-xl opacity-0 group-hover/qr:opacity-100 transition-opacity" />
                        <div className="bg-white p-5 rounded-2xl mb-5 shadow-[0_0_30px_rgba(255,255,255,0.1)] relative z-10">
                            <QRCodeCanvas 
                                value={validationUrl}
                                size={160}
                                level="H"
                                includeMargin={false}
                                imageSettings={{
                                    src: selectedShop.image,
                                    x: undefined,
                                    y: undefined,
                                    height: 30,
                                    width: 30,
                                    excavate: true,
                                }}
                            />
                        </div>
                        <p className="text-[10px] font-black text-cyan-500/60 uppercase tracking-[0.3em] relative z-10">Escaneá tu beneficio</p>
                    </div>

                    <div className="w-full space-y-4">
                        <div className="flex justify-between items-center text-white/90 text-[9px] font-black uppercase tracking-[0.3em] border-b border-white/10 pb-3">
                            <span className="opacity-60">Membresía Activa</span>
                            <span className="text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.4)]">DIC 2026</span>
                        </div>
                        <div className="flex justify-center pt-2">
                            <p className="text-[11px] font-black text-center text-white/80 uppercase tracking-[0.25em] leading-relaxed">
                                Presentá este pase y accedé a <br/>
                                <span className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">VENTAJAS EXCLUSIVAS</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Connecting Button to Discounts */}
            <div className="mt-10 animate-in fade-in slide-in-from-bottom duration-1000 delay-300">
                <button
                    onClick={() => navigate('/red-comercial/descuentos')}
                    className="glass-button-3d btn-neon-active px-10 py-5 flex items-center gap-3 group"
                >
                    <div className="bg-cyan-400/20 p-2 rounded-lg group-hover:bg-cyan-400/30 transition-colors">
                        <QrCode size={20} className="text-cyan-400" />
                    </div>
                    <div className="flex flex-col items-start gap-0.5">
                        <span className="text-[11px] font-black text-white uppercase tracking-[0.15em] leading-none">Ver Descuentos B2B</span>
                        <span className="text-[8px] font-bold text-cyan-400/60 uppercase tracking-widest">Beneficios de red</span>
                    </div>
                </button>
            </div>

            <div className="mt-12 flex flex-col items-center gap-2 opacity-80">
                <p className="text-[8px] font-black text-cyan-400/80 uppercase tracking-[0.5em] text-center px-12 leading-loose">
                    Security ID: SHOP-{selectedShop.id.slice(0, 8).toUpperCase()}
                </p>
                <div className="flex items-center gap-4">
                    <div className="h-[1px] w-8 bg-cyan-500/40 shadow-[0_0_5px_rgba(34,211,238,0.3)]" />
                    <span className="text-[7px] font-bold text-white uppercase tracking-[1em] mr-[-1em]">ShopDigital.tech</span>
                    <div className="h-[1px] w-8 bg-cyan-500/40 shadow-[0_0_5px_rgba(34,211,238,0.3)]" />
                </div>
            </div>
        </div>
    );
};

export default CredencialPage;
