// ShopDigital Technical Protocol - Security Phase 5
import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Shop } from '../types';
import { ArrowLeft, Star, QrCode, Lock, ShieldCheck, X, Volume2, CreditCard } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { playNeonClick, playSuccessSound } from '../utils/audio';

interface CredencialPageProps {
    allShops: Shop[];
}

const CredencialPage: React.FC<CredencialPageProps> = ({ allShops }) => {
    const { categorySlug, shopSlug } = useParams<{ categorySlug: string; shopSlug: string }>();
    const navigate = useNavigate();
    const [isManualModalOpen, setIsManualModalOpen] = React.useState(false);
    const [manualCode, setManualCode] = React.useState('');
    const [isVerifying, setIsVerifying] = React.useState(false);
    const [verificationError, setVerificationError] = React.useState(false);
    const [showSuccess, setShowSuccess] = React.useState(false);


    const handleManualVerify = () => {
        setIsVerifying(true);
        setVerificationError(false);

        // Simulation of a secure delay
        setTimeout(() => {
            if (manualCode === '123') {
                playSuccessSound();
                setShowSuccess(true);
                setTimeout(() => {
                    navigate(`/${categorySlug}/${shopSlug}/validar`);
                }, 800);
            } else {
                setVerificationError(true);
                setIsVerifying(false);
                setManualCode('');
                // Reset error after pulse
                setTimeout(() => setVerificationError(false), 2000);
            }
        }, 1000);
    };

    const validationUrl = useMemo(() => {
        return `${window.location.origin}/${categorySlug}/${shopSlug}/validar`;
    }, [categorySlug, shopSlug]);

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
                onClick={() => {
                    playNeonClick();
                    navigate(-1);
                }}
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
                    onClick={() => {
                        playNeonClick();
                        navigate('/red-comercial/descuentos');
                    }}
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

            {/* Manual Verification Action Trigger */}
            <button 
                onClick={() => {
                    playNeonClick();
                    setIsManualModalOpen(true);
                }}
                className="mt-6 flex items-center gap-2 text-cyan-400/50 hover:text-cyan-400 transition-all py-3 px-6 group rounded-xl border border-white/5 hover:border-cyan-500/20 active:scale-95 bg-white/0 hover:bg-white/[0.02]"
            >
                <Lock size={12} className="group-hover:text-cyan-400 transition-colors shadow-[0_0_10px_rgba(34,211,238,0.3)]" />
                <span className="text-[9px] font-black uppercase tracking-[0.3em]">Protocolo de Verificación Manual</span>
            </button>

            {/* Manual Verification HUD Modal */}
            {isManualModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-6 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => !isVerifying && setIsManualModalOpen(false)} />
                    
                    <div className={`relative w-full max-w-sm glass-card-3d border ${verificationError ? 'border-red-500/50 shadow-[0_0_50px_rgba(239,68,68,0.2)]' : 'border-cyan-500/30 shadow-[0_0_50px_rgba(34,211,238,0.15)]'} rounded-t-[2.5rem] md:rounded-[2.5rem] p-6 md:p-10 overflow-hidden transform animate-in slide-in-from-bottom-full md:slide-in-from-bottom-0 md:zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto`}>
                        {/* HUD Scanning Line Animation */}
                        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent animate-scan z-0 pointer-events-none" />
                        
                        <div className="relative z-10 flex flex-col items-center">
                            <button 
                                onClick={() => {
                                    playNeonClick();
                                    !isVerifying && setIsManualModalOpen(false);
                                }}
                                className="absolute -top-4 -right-4 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors"
                            >
                                <X size={18} />
                            </button>

                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border ${verificationError ? 'bg-red-500/10 border-red-500/30' : 'bg-cyan-500/10 border-cyan-500/30'} shadow-lg transition-colors`}>
                                {showSuccess ? (
                                    <ShieldCheck size={32} className="text-cyan-400 animate-bounce" />
                                ) : verificationError ? (
                                    <X size={32} className="text-red-500 animate-pulse" />
                                ) : (
                                    <Lock size={32} className={isVerifying ? 'text-cyan-400 animate-pulse' : 'text-white/80'} />
                                )}
                            </div>

                            <h3 className={`text-xl font-black uppercase tracking-tighter mb-1 ${verificationError ? 'text-red-500' : 'text-white'}`}>
                                {showSuccess ? 'Acceso Concedido' : verificationError ? 'Clave Inválida' : 'Protocolo Manual'}
                            </h3>
                            <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.4em] mb-6 md:mb-10">Ingresá el código de seguridad</p>

                            <div className="w-full relative mb-8">
                                <input 
                                    type="password"
                                    value={manualCode}
                                    onChange={(e) => setManualCode(e.target.value)}
                                    disabled={isVerifying}
                                    autoFocus
                                    className={`w-full bg-black/40 border-2 ${verificationError ? 'border-red-500/50 text-red-500' : 'border-cyan-400/20 text-cyan-400'} rounded-2xl py-5 px-6 text-center text-2xl font-black tracking-[0.5em] focus:outline-none focus:border-cyan-400/60 transition-all placeholder:text-white/5`}
                                    placeholder="••••"
                                />
                                {isVerifying && !showSuccess && (
                                    <div className="absolute inset-x-0 -bottom-1 h-1 bg-cyan-500/20 rounded-full overflow-hidden">
                                        <div className="h-full bg-cyan-400 animate-progress-indefinite" />
                                    </div>
                                )}
                            </div>

                            <button 
                                onClick={handleManualVerify}
                                disabled={isVerifying || !manualCode}
                                className={`w-full py-5 rounded-2xl font-[1000] uppercase tracking-[0.3em] text-[11px] transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-30 ${showSuccess ? 'bg-cyan-500 text-black shadow-[0_0_30px_rgba(34,211,238,0.5)]' : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'}`}
                            >
                                {isVerifying ? 'Verificando...' : 'Autenticar'}
                                {showSuccess && <Volume2 size={16} />}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Merchant Access Link */}
            <div className="w-full flex justify-center mt-6 opacity-40 hover:opacity-100 transition-opacity">
                <button 
                    onClick={() => {
                        playNeonClick();
                        navigate(`/${categorySlug}/${shopSlug}/panel-autogestion`);
                    }}
                    className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-black text-cyan-400"
                >
                    <Lock size={12} /> Acceso Comercio
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
