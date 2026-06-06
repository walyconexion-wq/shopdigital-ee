import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Shop, Client } from '../types';
import { guardarCliente, verificarClienteExistente, activarClienteYIncrementarSuscriptores } from '../firebase';
import { CATEGORIES } from '../constants';
import {
    ChevronLeft,
    Gift,
    Phone,
    User,
    UserCircle,
    Mail,
    ShieldCheck,
    Store,
    CheckCircle2,
    MessageSquare,
    Ticket,
    FileText,
    Coins,
    ArrowRight,
    Lock,
    Unlock,
    AlertTriangle
} from 'lucide-react';
import { playNeonClick, playSuccessSound } from '../utils/audio';

interface ClientSubscriptionPageProps {
    allShops: Shop[];
}

const ClientSubscriptionPage: React.FC<ClientSubscriptionPageProps> = ({ allShops }) => {
    const { townId = 'esteban-echeverria', categorySlug, shopSlug } = useParams<{ townId: string; categorySlug: string; shopSlug: string }>();
    const navigate = useNavigate();
    
    // States
    const [step, setStep] = useState<'form' | 'verify' | 'welcome'>('form');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [duplicateError, setDuplicateError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: ''
    });

    // Verification States
    const [generatedOtp, setGeneratedOtp] = useState('');
    const [enteredOtp, setEnteredOtp] = useState('');
    const [otpError, setOtpError] = useState('');
    const [newClientId, setNewClientId] = useState('');

    const selectedShop = useMemo(() =>
        allShops.find(shop => (shop.slug || shop.id) === shopSlug),
        [shopSlug, allShops]);

    const activeCatSlug = useMemo(() => {
        if (categorySlug) return categorySlug;
        if (selectedShop) {
            return CATEGORIES.find(c => c.id === selectedShop.category)?.slug || 'comercio';
        }
        return 'comercio';
    }, [categorySlug, selectedShop]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        playNeonClick();
        setDuplicateError('');
        
        const cleanPhone = formData.phone.replace(/\D/g, '');

        if (!formData.name || !cleanPhone || !formData.email) {
            alert("Por favor completá todos los campos para suscribirte.");
            return;
        }

        if (!selectedShop) {
            alert("Error: Comercio de origen no encontrado.");
            return;
        }

        setIsSubmitting(true);

        try {
            // FASE 1: Filtro de Unicidad Anti-Fraude
            const isDuplicate = await verificarClienteExistente(formData.email, cleanPhone, townId);
            if (isDuplicate) {
                setDuplicateError("Este correo o WhatsApp ya está registrado para una credencial VIP en esta zona.");
                setIsSubmitting(false);
                return;
            }

            // Generar código OTP de 6 dígitos
            const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
            setGeneratedOtp(otpCode);

            // Registrar cliente en estado 'pending'
            const clientId = `client-${cleanPhone || Date.now()}`;
            const newClient: Client = {
                id: clientId,
                name: formData.name.toUpperCase().trim(),
                phone: cleanPhone,
                email: formData.email.trim().toLowerCase(),
                sourceShopId: selectedShop.id,
                sourceShopName: selectedShop.name,
                createdAt: new Date().toISOString(),
                townId,
                status: 'pending', // Estado pendiente de validación 🛡️
                cardColor: '#00f5ff', // Celeste Neón de base
                verificationCode: otpCode,
                verificationExpires: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // Válido por 10 mins
                eventPassEnabled: true // Activado por defecto
            };

            await guardarCliente(newClient, townId);
            setNewClientId(clientId);
            setStep('verify');
            playSuccessSound();
        } catch (error) {
            console.error("Error al registrar cliente pre-validación:", error);
            alert("Hubo un error al procesar tu registro. Por favor intentá nuevamente.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        playNeonClick();
        setOtpError('');

        if (enteredOtp.trim() !== generatedOtp) {
            setOtpError("Código incorrecto. Por favor verificá el código e ingresalo de nuevo.");
            return;
        }

        setIsSubmitting(true);
        try {
            // FASE 3: Transacción para activar cliente e incrementar subscriptores
            if (!selectedShop) return;
            await activarClienteYIncrementarSuscriptores(newClientId, selectedShop.id, townId);
            playSuccessSound();
            setStep('welcome');
        } catch (error) {
            console.error("Error al verificar código OTP:", error);
            setOtpError("Error al validar código. Por favor intentá nuevamente.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!selectedShop) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-white bg-black p-8 text-center">
                <ShieldCheck size={48} className="text-cyan-400 mb-6 animate-pulse opacity-20" />
                <h2 className="text-xl font-black uppercase tracking-widest mb-2">Radar Sincronizando...</h2>
                <p className="text-white/40 text-[10px] uppercase leading-relaxed">El comercio de origen no se encuentra <br/> en este universo regional.</p>
                <button onClick={() => navigate('/')} className="mt-8 bg-zinc-900 border border-white/10 px-8 py-3 rounded-2xl text-cyan-400 font-black uppercase tracking-widest text-[9px] hover:bg-white/5 transition-all">Regresar al Inicio</button>
            </div>
        );
    }

    const formattedTown = townId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-[#0a1e2d] to-slate-950 text-white pb-24 relative overflow-x-hidden selection:bg-cyan-500/30">
            <style>{`
                input, select, textarea, option {
                    color: #ffffff !important;
                    background-color: #0b1329 !important;
                }
                input::placeholder, textarea::placeholder {
                    color: rgba(255, 255, 255, 0.4) !important;
                }
                input:-webkit-autofill,
                input:-webkit-autofill:hover, 
                input:-webkit-autofill:focus, 
                input:-webkit-autofill:active {
                    -webkit-box-shadow: 0 0 0 30px #0b1329 inset !important;
                    -webkit-text-fill-color: #ffffff !important;
                    transition: background-color 5000s ease-in-out 0s;
                }
            `}</style>
            
            {/* HUD Background Layers */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.02)_1px,transparent_1px)] bg-[size:30px_30px]" />
            </div>

            {/* Header */}
            <div className="bg-zinc-900/50 backdrop-blur-md pt-8 pb-6 px-8 flex flex-col items-center border-b border-cyan-500/20 mb-8 sticky top-0 z-50">
                <button onClick={() => { playNeonClick(); navigate(-1); }} 
                    className="self-start mb-4 w-10 h-10 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-400/30 hover:bg-cyan-500/20 transition-all shadow-lg active:scale-95">
                    <ChevronLeft size={20} />
                </button>
                <div className="flex items-center gap-2 mb-1">
                    <UserCircle size={22} className="text-cyan-400" />
                    <h2 className="text-[18px] font-[1000] text-white uppercase tracking-[0.2em] drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
                        {step === 'form' && "Registro VIP"}
                        {step === 'verify' && "Verificación VIP"}
                        {step === 'welcome' && "¡Bienvenido a bordo!"}
                    </h2>
                </div>
                <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.4em] mt-2 italic">{formattedTown}</p>
                {step !== 'welcome' && (
                    <div className="mt-4 px-5 py-2 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 shadow-inner">
                        <p className="text-[8px] font-black text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                            <Store size={10} /> Invitación de: {selectedShop.name}
                        </p>
                    </div>
                )}
            </div>

            {/* STEP 1: FORM VIEW */}
            {step === 'form' && (
                <form onSubmit={handleSubmit} className="px-8 space-y-6 max-w-sm mx-auto relative z-10 animate-in slide-in-from-bottom-6 duration-700">
                    <div className="glass-card-3d bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-8 space-y-8 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl" />
                        
                        <div className="space-y-6">
                            <div className="group">
                                <label className="text-[9px] flex items-center gap-2 font-black uppercase tracking-[0.25em] text-white/30 group-focus-within:text-cyan-400 transition-colors mb-2 ml-1">
                                    <User size={12} /> Nombre y Apellido
                                </label>
                                <input
                                    required
                                    placeholder="EJ: WALY MIRANDA"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
                                    className="w-full bg-slate-950/60 border border-white/10 rounded-2xl p-4 text-sm font-black text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-400/50 transition-all uppercase"
                                    style={{ color: '#ffffff', backgroundColor: '#0b1329' }}
                                />
                            </div>

                            <div className="group">
                                <label className="text-[9px] flex items-center gap-2 font-black uppercase tracking-[0.25em] text-white/30 group-focus-within:text-cyan-400 transition-colors mb-2 ml-1">
                                    <Phone size={12} /> WhatsApp (Sin Ceros)
                                </label>
                                <input
                                    required
                                    type="tel"
                                    placeholder="EJ: 1122334455"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full bg-slate-950/60 border border-white/10 rounded-2xl p-4 text-sm font-black text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-400/50 transition-all tabular-nums"
                                    style={{ color: '#ffffff', backgroundColor: '#0b1329' }}
                                />
                            </div>

                            <div className="group">
                                <label className="text-[9px] flex items-center gap-2 font-black uppercase tracking-[0.25em] text-white/30 group-focus-within:text-cyan-400 transition-colors mb-2 ml-1">
                                    <Mail size={12} /> Correo Electrónico
                                </label>
                                <input
                                    required
                                    type="email"
                                    placeholder="EJ: WALY@SHOPDIGITAL.AR"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full bg-slate-950/60 border border-white/10 rounded-2xl p-4 text-sm font-bold text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-400/50 transition-all"
                                    style={{ color: '#ffffff', backgroundColor: '#0b1329' }}
                                />
                            </div>
                        </div>

                        {duplicateError && (
                            <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-2xl flex items-start gap-3 animate-in shake duration-300">
                                <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={16} />
                                <p className="text-[9px] font-black text-red-400 uppercase tracking-widest leading-relaxed">
                                    {duplicateError}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="pt-4">
                        <button 
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-6 bg-cyan-600 hover:bg-cyan-500 rounded-[2rem] flex flex-col items-center justify-center gap-2 font-[1000] uppercase tracking-[0.2em] text-[11px] shadow-[0_10px_40px_rgba(34,211,238,0.2)] active:scale-95 transition-all text-white disabled:opacity-50 border border-white/20 cursor-pointer"
                        >
                            {isSubmitting ? (
                                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Gift size={20} className="text-white animate-bounce" />
                                    <span>Activar Mi Credencial VIP</span>
                                </>
                            )}
                        </button>
                        <div className="mt-8 p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-center">
                            <p className="text-[7px] text-white/20 uppercase tracking-[0.4em] font-black leading-relaxed">
                                Al registrarte aceptás los términos y condiciones <br/> de la red de beneficios exclusivos ShopDigital.
                            </p>
                        </div>
                    </div>
                </form>
            )}

            {/* STEP 2: VERIFICATION OTP HANDSHAKE */}
            {step === 'verify' && (
                <div className="px-8 space-y-6 max-w-sm mx-auto relative z-10 animate-in zoom-in duration-500">
                    {/* OTP Simulator HUD Alert */}
                    <div className="bg-cyan-500/10 border border-cyan-400/40 p-4 rounded-3xl shadow-[0_0_20px_rgba(34,211,238,0.15)] flex flex-col items-center text-center">
                        <span className="text-[8px] font-black text-cyan-400 uppercase tracking-[0.3em] mb-1">📟 Simulador OTP (B2C Handshake)</span>
                        <div className="text-[14px] font-mono font-black text-white tracking-[0.1em] bg-black/60 px-4 py-1.5 rounded-xl border border-white/10 select-all">
                            CÓDIGO: <span className="text-cyan-300">{generatedOtp}</span>
                        </div>
                        <span className="text-[7px] text-white/40 uppercase tracking-widest mt-2">Simula el código enviado a tu Gmail/WhatsApp.</span>
                    </div>

                    <form onSubmit={handleVerifyOtp} className="space-y-6">
                        <div className="glass-card-3d bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-8 space-y-6 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl" />
                            
                            <div className="text-center space-y-2">
                                <Lock className="text-cyan-400 mx-auto animate-pulse" size={28} />
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">Ingresá tu Código VIP</h3>
                                <p className="text-[9px] font-bold text-white/40 uppercase tracking-wider leading-relaxed">
                                    Hemos enviado una clave secreta a tu WhatsApp y a tu dirección de correo electrónico.
                                </p>
                            </div>

                            <div className="group">
                                <input
                                    required
                                    maxLength={6}
                                    placeholder="0 0 0 0 0 0"
                                    value={enteredOtp}
                                    onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                                    className="w-full bg-slate-950/60 border border-white/10 rounded-2xl p-4 text-center font-mono text-xl font-black text-white tracking-[0.3em] placeholder:text-white/10 focus:outline-none focus:border-cyan-400/50 transition-all"
                                    style={{ color: '#ffffff', backgroundColor: '#0b1329' }}
                                />
                            </div>

                            {otpError && (
                                <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-2xl flex items-start gap-3 animate-in shake duration-300">
                                    <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={16} />
                                    <p className="text-[9px] font-black text-red-400 uppercase tracking-widest leading-relaxed">
                                        {otpError}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <button 
                                type="submit"
                                disabled={isSubmitting || enteredOtp.length !== 6}
                                className="w-full py-6 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 disabled:grayscale rounded-[2rem] flex flex-col items-center justify-center gap-1.5 font-black uppercase tracking-[0.2em] text-[11px] shadow-[0_10px_30px_rgba(34,211,238,0.2)] active:scale-95 transition-all text-white border border-white/20 cursor-pointer"
                            >
                                {isSubmitting ? (
                                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Unlock size={18} />
                                        <span>Verificar Identidad</span>
                                    </>
                                )}
                            </button>

                            <button 
                                type="button"
                                onClick={() => { playNeonClick(); setStep('form'); }}
                                className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest text-white/50 hover:bg-white/10 hover:text-white transition-all active:scale-95 cursor-pointer"
                            >
                                Volver al Formulario
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* STEP 3: WELCOME KIT ONBOARDING ARTILLERY */}
            {step === 'welcome' && (
                <div className="px-8 space-y-6 max-w-sm mx-auto relative z-10 animate-in zoom-in duration-700">
                    <div className="glass-card-3d bg-white/[0.02] border border-cyan-500/30 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden text-center space-y-6">
                        {/* Glow and Success Icon */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
                        <div className="w-16 h-16 bg-cyan-500/10 rounded-2xl flex items-center justify-center border border-cyan-400/40 shadow-[0_0_25px_rgba(34,211,238,0.4)] mx-auto animate-bounce">
                            <CheckCircle2 size={32} className="text-cyan-400" />
                        </div>

                        <div className="space-y-2">
                            <span className="text-[9px] font-black text-cyan-400 uppercase tracking-[0.3em] block">Socio VIP Validado</span>
                            <h3 className="text-xl font-[1000] uppercase tracking-tighter text-white leading-tight">
                                ¡Bienvenido a bordo, <br/> {formData.name.split(' ')[0]}!
                            </h3>
                            <p className="text-[9px] font-bold text-white/40 uppercase tracking-wider leading-relaxed">
                                Tu identidad digital ha sido sincronizada con el nodo comercial. Disponés de tu credencial VIP y acceso a toda la red.
                            </p>
                        </div>

                        {/* Fast Guide Box */}
                        <div className="bg-black/50 border border-white/5 rounded-2xl p-4 text-left space-y-3 shadow-inner">
                            <h4 className="text-[8px] font-black text-cyan-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-white/5 pb-1.5">
                                <FileText size={10} /> Guía rápida de uso
                            </h4>
                            <ul className="space-y-2 text-[8px] font-bold text-white/60 uppercase tracking-wide">
                                <li className="flex items-start gap-2">
                                    <span className="text-cyan-400 font-black">1.</span>
                                    <span>Presentá tu código QR VIP en caja al comprar.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-cyan-400 font-black">2.</span>
                                    <span>Ganá créditos con cada compra para canjear en la red.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-cyan-400 font-black">3.</span>
                                    <span>Accedé a eventos y recitales exclusivos sintonizados en vivo.</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Action buttons - Welcoming kit */}
                    <div className="space-y-4 pt-2">
                        <button
                            onClick={() => {
                                playNeonClick();
                                navigate(`/${townId}/${activeCatSlug}/${shopSlug}/credencial-vip/${newClientId}`);
                            }}
                            className="w-full h-20 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-3xl flex items-center justify-between px-8 font-black uppercase tracking-[0.15em] text-[10px] text-white shadow-[0_0_35px_rgba(34,211,238,0.25)] border border-cyan-400/40 hover:border-cyan-400/80 hover:shadow-[0_0_45px_rgba(34,211,238,0.45)] transition-all active:scale-95 cursor-pointer group"
                        >
                            <div className="flex items-center gap-4">
                                <UserCircle size={24} className="text-cyan-300" />
                                <div className="text-left">
                                    <span className="block text-[11px] font-[1000]">Ver Mi Credencial VIP</span>
                                    <span className="block text-[7px] text-cyan-200/50 tracking-widest font-bold mt-0.5">Identidad Digital</span>
                                </div>
                            </div>
                            <ArrowRight size={16} className="text-cyan-300 group-hover:translate-x-1.5 transition-transform" />
                        </button>

                        <button
                            onClick={() => {
                                playNeonClick();
                                navigate(`/${townId}/red-comercial/ofertas`);
                            }}
                            className="w-full h-16 bg-zinc-900 hover:bg-zinc-900/80 rounded-2xl flex items-center justify-between px-8 font-black uppercase tracking-[0.15em] text-[9px] text-white border border-white/10 active:scale-95 transition-all cursor-pointer group"
                        >
                            <div className="flex items-center gap-3">
                                <Ticket size={18} className="text-green-400" />
                                <div className="text-left">
                                    <span className="block">Explorar Descuentos VIP</span>
                                    <span className="block text-[6px] text-white/30 tracking-widest font-black mt-0.5">Ofertas B2C</span>
                                </div>
                            </div>
                            <ArrowRight size={14} className="text-white/40 group-hover:translate-x-1 transition-transform" />
                        </button>

                        <a
                            href="https://chat.whatsapp.com/G5iM46NnleN5d5Jk55D07G"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={playNeonClick}
                            className="w-full h-16 bg-[#00e676]/10 border border-[#00e676]/30 hover:bg-[#00e676]/15 rounded-2xl flex items-center justify-between px-8 font-black uppercase tracking-[0.15em] text-[9px] text-[#00e676] active:scale-95 transition-all cursor-pointer group"
                        >
                            <div className="flex items-center gap-3">
                                <MessageSquare size={18} className="text-[#00e676]" />
                                <div className="text-left">
                                    <span className="block">Comunidad VIP WhatsApp</span>
                                    <span className="block text-[6px] text-[#00e676]/50 tracking-widest font-black mt-0.5">Canal de Clientes felices</span>
                                </div>
                            </div>
                            <ArrowRight size={14} className="text-[#00e676]/70 group-hover:translate-x-1 transition-transform" />
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientSubscriptionPage;
