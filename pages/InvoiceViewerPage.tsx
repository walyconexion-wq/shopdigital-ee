import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Invoice, Shop } from '../types';
import { obtenerFacturaPorComercio } from '../firebase';
import { 
    CheckCircle, Clock, ShieldCheck, 
    Smartphone, Download, FileText, RefreshCw, ArrowLeft,
    Wifi, Activity, Star, FileCheck2, AlertCircle
} from 'lucide-react';
import { playNeonClick } from '../utils/audio';
import { CyberCircuitBackground } from '../components/CyberCircuitBackground';

interface InvoiceViewerPageProps {
    allShops?: Shop[];
}

const InvoiceViewerPage: React.FC<InvoiceViewerPageProps> = ({ allShops = [] }) => {
    const { townId = 'esteban-echeverria', categorySlug, shopSlug } = useParams<{ townId: string, categorySlug: string, shopSlug: string }>();
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Reloj en tiempo real — igual que en CredencialPage
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchInvoice = async () => {
            if (!shopSlug) return;
            const shop = allShops.find(s => s.slug === shopSlug);
            if (!shop) {
                if (allShops.length > 0) {
                    setError(true);
                    setLoading(false);
                }
                return;
            }

            try {
                const data = await obtenerFacturaPorComercio(shop.id);
                if (data) {
                    setInvoice(data as Invoice);
                } else {
                    setError(true);
                }
            } catch (err) {
                console.error(err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        fetchInvoice();
    }, [shopSlug, allShops]);

    const handleWhatsAppNotify = () => {
        playNeonClick();
        const text = `Hola *ShopDigital* 👋\n\nQuiero avisar que ya realicé el pago del comprobante *${invoice?.id}* por el concepto: *${invoice?.concept}*.\n\nAguardo confirmación. ¡Gracias!`;
        window.open(`https://wa.me/5491124505030?text=${encodeURIComponent(text)}`, '_blank');
    };

    const formatClock = (date: Date) => {
        return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    // ═══════════ LOADING STATE ═══════════
    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-8 relative overflow-hidden bg-transparent">
                <CyberCircuitBackground />
                <div className="flex flex-col items-center gap-4 relative z-10 neu-plate p-8">
                    <div className="w-12 h-12 border-t-2 border-t-[#ff6b6b] border-[#4a3d6a]/20 rounded-full animate-spin" />
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#4a3d6a] animate-pulse">
                        Cargando Comprobante...
                    </span>
                </div>
            </div>
        );
    }

    // ═══════════ ERROR STATE ═══════════
    if (error || !invoice) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-transparent text-[#2c2440]">
                <CyberCircuitBackground />

                <div className="w-full max-w-sm rounded-[26px] p-8 relative z-10 neu-plate border-2 border-[#ff6b6b]/40">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto bg-red-500/10 border border-red-500/30">
                        <AlertCircle size={28} className="text-[#ff6b6b] animate-bounce" />
                    </div>
                    <h2 className="text-xl font-black text-[#ff6b6b] uppercase tracking-tight text-center mb-2">
                        Comprobante No Encontrado
                    </h2>
                    <p className="text-[10px] font-bold uppercase tracking-wider leading-relaxed text-center mb-6 text-[#2c2440]">
                        El comercio <span className="font-mono text-[#ff6b6b] bg-[#faf7f2] px-1.5 py-0.5 rounded border border-[#ff6b6b]/30">{shopSlug}</span> no tiene una factura vinculada o la inyección está pendiente.
                    </p>
                    <p className="text-[8px] uppercase tracking-widest leading-normal mb-8 border-l-2 pl-3 text-[#4a3d6a] border-[#ff6b6b]">
                        Sistema de Facturación ShopDigital · Red Comercial.
                    </p>

                    <button
                        onClick={() => { playNeonClick(); navigate(`/${townId}/home`); }}
                        className="w-full h-14 text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-3 cursor-pointer neu-btn-hero"
                    >
                        Volver al Inicio
                    </button>

                    <div className="mt-4 pt-4 border-t-2 border-[#4a3d6a]/10">
                        <p className="text-[8px] font-black uppercase tracking-widest mb-3 text-center text-[#4a3d6a]/60">Acceso Director Global</p>
                        <button
                            onClick={() => window.location.href = window.location.href.split('?')[0] + '?inject=true'}
                            className="w-full h-12 text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 cursor-pointer neu-btn-3d hover:border-[#ff6b6b]/60 group"
                        >
                            <RefreshCw size={14} className="text-[#ff6b6b] group-hover:rotate-180 transition-transform duration-500" />
                            Inyectar Sincronía $10k
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const isPaid = invoice.status === 'paid';

    return (
        <div className="min-h-screen w-full flex flex-col items-center px-4 py-6 relative overflow-y-auto selection:bg-emerald-500/20 bg-transparent text-[#2c2440]">

            {/* ═══════════ FONDO CIBER-DIGITAL DE CIRCUITOS ANIMADOS ═══════════ */}
            <CyberCircuitBackground />

            {/* ══════════════════════════════════════════
                CABECERA NEUMÓRFICA SUPERIOR
            ══════════════════════════════════════════ */}
            <div className="w-full max-w-sm relative z-10 mb-5 p-3.5 neu-plate flex flex-col items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-700">
                {/* HEADER PRINCIPAL */}
                <div className="w-full flex justify-between items-center gap-2">
                    <button
                        onClick={() => { playNeonClick(); navigate(`/${townId}/home`); }}
                        className="w-9 h-9 flex items-center justify-center cursor-pointer transition-all neu-btn-pod group shrink-0"
                        aria-label="Regresar"
                    >
                        <ArrowLeft size={16} className="text-[#2c2440] group-hover:-translate-x-0.5 transition-transform" strokeWidth={3} />
                    </button>

                    <div className="flex-1 text-center px-3 py-1 neu-inset-title">
                        <h1 className="text-xs font-black tracking-tight uppercase leading-tight text-[#2c2440]">
                            Factura Electrónica
                        </h1>
                        <p className="text-[7px] font-extrabold uppercase tracking-widest text-[#4a3d6a]">
                            ShopDigital · Red Comercial
                        </p>
                    </div>

                    <div className="w-9 h-9 flex items-center justify-center shrink-0 neu-btn-pod">
                        <FileText size={16} className="text-[#ff6b6b]" />
                    </div>
                </div>

                {/* Avatar ARI integrado en cabecera */}
                <div className="flex flex-col items-center select-none pointer-events-none my-0.5">
                    <img
                        src="/ari-pointing.png"
                        alt="ARI Asistente Factura"
                        className="h-20 w-auto object-contain drop-shadow-[0_4px_10px_rgba(44,36,64,0.18)] animate-in fade-in duration-700"
                    />
                    <div className="ari-3d-shadow mt-0.5 scale-75" />
                </div>

                {/* SELLO DE VIDA — TIMESTAMP ANTI-FALSIFICACIÓN CON LUZ VERDE / EN PROCESO */}
                <div className="w-full flex items-center justify-between neu-inset-title px-4 py-2">
                    <div className="flex items-center gap-2">
                        <Clock size={12} className="text-[#ff6b6b] animate-spin flex-shrink-0" style={{ animationDuration: '6s' }} />
                        <p className="text-[9.5px] font-black font-mono tracking-widest tabular-nums text-[#2c2440]">
                            {formatClock(currentTime)}
                        </p>
                    </div>
                    <div className="h-3.5 w-[1px] bg-[#4a3d6a]/20" />
                    <div className={`flex items-center gap-1.5 font-black text-[9px] uppercase tracking-widest ${isPaid ? 'text-emerald-600' : 'text-amber-600'}`}>
                        <Wifi size={12} className={`animate-pulse ${isPaid ? 'text-emerald-600' : 'text-amber-600'}`} />
                        <span>{isPaid ? 'PAGADO · LUZ VERDE' : 'PENDIENTE · EN PROCESO'}</span>
                    </div>
                </div>
            </div>

            {/* ══════════════════════════════════════════
                COMPROBANTE NEUMÓRFICO PRINCIPAL
            ══════════════════════════════════════════ */}
            <div className="w-full max-w-sm relative z-10 animate-in zoom-in duration-700 delay-100">
                <div className="neu-plate p-8 pb-10 relative overflow-hidden">

                    {/* TOP ROW: Badge de estado + Estrella */}
                    <div className="flex justify-between items-start mb-8">
                        <div className={`px-3 py-1.5 rounded-full flex items-center gap-2 neu-btn-pod border ${
                            isPaid
                                ? 'border-emerald-500/30 bg-emerald-500/10'
                                : 'border-amber-500/30 bg-amber-500/10'
                        }`}>
                            <Activity size={12} className={`animate-pulse ${isPaid ? 'text-emerald-600' : 'text-amber-600'}`} />
                            <span className={`text-[9px] font-black uppercase tracking-widest ${isPaid ? 'text-emerald-700' : 'text-amber-700'}`}>
                                {isPaid ? 'COMPROBANTE PAGADO · LUZ VERDE' : 'PAGO PENDIENTE · EN PROCESO'}
                            </span>
                        </div>
                        <Star size={22} className="text-[#ff6b6b] shrink-0" style={{ fill: '#ff6b6b' }} />
                    </div>

                    {/* NOMBRE DEL COMERCIO */}
                    <div className="mb-8 relative">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-1 text-[#4a3d6a]">Facturado a:</p>
                        <h2 className="text-3xl font-[1000] uppercase tracking-tighter leading-none mb-2 text-[#2c2440]">
                            {invoice.shopName}
                        </h2>
                        <p className="text-[9px] font-extrabold uppercase tracking-widest text-[#4a3d6a]">
                            Red de Comercios ShopDigital
                        </p>
                    </div>

                    {/* NÚMERO DE COMPROBANTE */}
                    <div className="w-full p-4 neu-inset-title flex flex-col items-center mb-6 relative overflow-hidden">
                        <p className="text-[8px] font-black uppercase tracking-[0.3em] mb-2 text-[#4a3d6a]">Comprobante N°</p>
                        <p className="text-[13px] font-mono font-black uppercase tracking-wider text-[#2c2440]">
                            {invoice.id}
                        </p>
                    </div>

                    {/* CONCEPTO Y MONTO — BLOQUE CENTRAL */}
                    <div className="w-full p-6 mb-6 relative overflow-hidden neu-inset-title">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-black/5 rounded-full blur-[50px] -mr-10 -mt-10 pointer-events-none" />

                        <div className="mb-5 relative z-10">
                            <p className="text-[8.5px] font-black uppercase tracking-[0.3em] mb-2 text-[#4a3d6a]">Por el Concepto</p>
                            <p className="text-[12px] font-black uppercase tracking-widest leading-relaxed text-[#2c2440]">
                                {invoice.concept}
                            </p>
                        </div>

                        <div className="relative z-10">
                            <p className="text-[8.5px] font-black uppercase tracking-[0.3em] mb-2 text-[#4a3d6a]">Importe Total</p>
                            <div className="flex items-baseline gap-1">
                                <span className={`text-5xl font-[1000] tracking-tighter ${
                                    isPaid ? 'text-emerald-700' : 'text-[#ff6b6b]'
                                }`}>
                                    ${invoice.amount.toLocaleString('es-AR')}
                                </span>
                                <span className="text-[8px] font-black uppercase tracking-widest text-[#4a3d6a] ml-1">ARS</span>
                            </div>
                        </div>
                    </div>

                    {/* GRILLA DE FECHAS */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="p-3.5 neu-inset-title">
                            <p className="text-[7.5px] font-black uppercase tracking-widest mb-1 text-[#4a3d6a]">Emisión</p>
                            <p className="text-xs font-[1000] uppercase tracking-tight text-[#2c2440]">
                                {new Date(invoice.issueDate).toLocaleDateString('es-AR')}
                            </p>
                        </div>
                        <div className="p-3.5 neu-inset-title">
                            <p className="text-[7.5px] font-black uppercase tracking-widest mb-1 text-[#4a3d6a]">Vencimiento</p>
                            <p className={`text-xs font-[1000] uppercase tracking-tight ${isPaid ? 'text-emerald-700' : 'text-[#ff6b6b]'}`}>
                                {new Date(invoice.dueDate).toLocaleDateString('es-AR')}
                            </p>
                        </div>
                    </div>

                    {/* CONFIRMACIÓN DE PAGO O ACCIÓN PENDIENTE */}
                    {isPaid ? (
                        <div className="w-full p-4 flex flex-col items-center gap-3 animate-in zoom-in duration-500 neu-inset-title border border-emerald-500/30 bg-emerald-500/10">
                            <div className="w-14 h-14 rounded-full flex items-center justify-center neu-btn-pod bg-emerald-500/10 border border-emerald-500/30">
                                <CheckCircle size={28} className="text-emerald-600" strokeWidth={2.5} />
                            </div>
                            <p className="text-[12px] font-[1000] uppercase tracking-[0.3em] text-emerald-700">Pago Registrado</p>
                            <p className="text-[9px] font-black uppercase tracking-widest text-[#4a3d6a]">
                                ID TX: {invoice.id.split('-')[1] || 'DB-AUTH'}
                            </p>
                            <div className="flex items-center gap-1.5 font-black text-[9px] uppercase tracking-widest text-emerald-600">
                                <FileCheck2 size={12} className="animate-pulse" />
                                <span>LUZ VERDE · ACCESO VERIFICADO</span>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-2">
                            <button
                                onClick={handleWhatsAppNotify}
                                className="w-full h-12 text-[10px] font-[1000] uppercase tracking-[0.18em] neu-btn-hero flex items-center justify-center gap-2.5 cursor-pointer group"
                            >
                                <Smartphone size={16} className="text-[#ff6b6b] group-hover:scale-110 transition-transform" />
                                <span>Avisar Pago por WhatsApp</span>
                            </button>
                        </div>
                    )}

                    {/* ESTADO DEL COMPROBANTE */}
                    <div className="w-full flex justify-between items-center text-[9.5px] font-black uppercase tracking-widest border-t-2 border-[#4a3d6a]/10 pt-4 mt-6">
                        <span className="text-[#4a3d6a]">Estado del Comprobante</span>
                        <span className={`font-black flex items-center gap-1 ${isPaid ? 'text-emerald-700' : 'text-amber-700'}`}>
                            {isPaid ? (
                                <>
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span>⚡ SALDADO · LUZ VERDE</span>
                                </>
                            ) : (
                                <>
                                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                    <span>⏳ PENDIENTE</span>
                                </>
                            )}
                        </span>
                    </div>
                </div>
            </div>

            {/* ══════════════════════════════════════════
                SECCIÓN INFERIOR — ACCIONES + FOOTER NEUMÓRFICO
            ══════════════════════════════════════════ */}
            <div className="w-full max-w-sm mt-5 relative z-10 neu-plate p-5 flex flex-col items-center gap-4 animate-in slide-in-from-bottom-4 duration-700 delay-200">

                {/* BOTÓN DESCARGAR PDF */}
                <button
                    onClick={() => { playNeonClick(); window.print(); }}
                    className="w-full h-12 text-[10px] font-[1000] uppercase tracking-[0.18em] neu-btn-3d flex items-center justify-center gap-2.5 cursor-pointer group hover:border-[#ff6b6b]/60"
                >
                    <Download size={15} className="text-[#4a3d6a] group-hover:text-[#ff6b6b] transition-colors" strokeWidth={2.5} />
                    <span>Descargar PDF</span>
                </button>

                {/* BOTÓN VOLVER AL INICIO */}
                <button
                    onClick={() => { playNeonClick(); navigate(`/${townId}/home`); }}
                    className="w-full h-12 text-[10px] font-[1000] uppercase tracking-[0.18em] neu-btn-3d flex items-center justify-center gap-2 cursor-pointer group"
                >
                    <ArrowLeft size={14} className="text-[#4a3d6a] group-hover:-translate-x-1 transition-transform" />
                    <span>Volver al Inicio</span>
                </button>

                {/* DIVISOR */}
                <div className="w-full h-[1px] bg-[#4a3d6a]/10" />

                {/* FOOTER INTEGRADO DENTRO DE LA PLACA */}
                <div className="w-full flex flex-col items-center">
                    <p className="text-[7.5px] uppercase tracking-[0.3em] font-black text-center text-[#4a3d6a]/60 leading-relaxed mb-2">
                        Comprobante Proforma · ID: {invoice.id.slice(0, 12).toUpperCase()}
                    </p>
                    <div className="w-full neu-inset-title py-1.5 px-3 flex items-center justify-center gap-1.5 text-[7.5px] font-black uppercase tracking-widest text-[#4a3d6a]">
                        <ShieldCheck size={10} className="text-[#ff6b6b]" />
                        ShopDigital · Red Comercial Digital
                    </div>
                    <p className="text-[7px] uppercase tracking-[0.25em] font-bold text-center text-[#4a3d6a]/40 leading-relaxed mt-3 px-2">
                        Este documento es un comprobante de servicio proforma temporal, válido para seguimiento interno de membresía. No válido como factura electrónica de AFIP.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default InvoiceViewerPage;
