import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Invoice, Shop } from '../types';
import { obtenerFacturaPorComercio } from '../firebase';
import { 
    CheckCircle, Clock, ExternalLink, ShieldCheck, 
    Smartphone, Download, FileText, RefreshCw, ChevronLeft
} from 'lucide-react';
import { playNeonClick } from '../utils/audio';

interface InvoiceViewerPageProps {
    allShops?: Shop[];
}

const InvoiceViewerPage: React.FC<InvoiceViewerPageProps> = ({ allShops = [] }) => {
    const { townId = 'esteban-echeverria', categorySlug, shopSlug } = useParams<{ townId: string, categorySlug: string, shopSlug: string }>();
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [currentTime] = useState(new Date());

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

    // Theme Mode Resolver
    const themeMode = localStorage.getItem('global_home_theme_mode') || 'dark';
    const isDayMode = themeMode === 'light' || (themeMode === 'auto' && (() => {
        const hour = currentTime.getHours();
        return hour >= 8 && hour < 20;
    })());

    const handleWhatsAppNotify = () => {
        playNeonClick();
        const text = `Hola *ShopDigital* 👋\n\nQuiero avisar que ya realicé el pago del comprobante *${invoice?.id}* por el concepto: *${invoice?.concept}*.\n\nAguardo confirmación. ¡Gracias!`;
        window.open(`https://wa.me/5491124505030?text=${encodeURIComponent(text)}`, '_blank');
    };

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDayMode ? 'bg-[#cda488]' : 'bg-black'}`}>
                <div className={`w-12 h-12 border-4 rounded-full animate-spin ${
                    isDayMode ? 'border-t-[#0891b2] border-slate-200' : 'border-t-cyan-500 border-cyan-500/20'
                }`}></div>
            </div>
        );
    }

    if (error || !invoice) {
        return (
            <div className={`min-h-screen flex flex-col items-center justify-center p-6 text-center ${
                isDayMode ? 'bg-[#cda488] text-[#083344]' : 'bg-black text-white'
            }`}>
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 border ${
                    isDayMode ? 'bg-red-500/10 border-red-500/30' : 'bg-red-500/10 border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.2)]'
                }`}>
                    <FileText size={40} className="text-red-500" />
                </div>
                <h2 className="text-2xl font-[1000] uppercase tracking-tighter mb-2">Comprobante no Encontrado</h2>
                <p className={`text-[11px] font-bold uppercase tracking-widest leading-relaxed max-w-xs mb-8 ${isDayMode ? 'text-black/60' : 'text-white/60'}`}>
                    El ID del comercio {shopSlug} no tiene una factura vinculada o la inyección está pendiente.
                </p>
                <div className="space-y-3 w-full max-w-xs">
                    <button 
                        onClick={() => { playNeonClick(); navigate(`/${townId}/home`); }}
                        className="w-full h-14 text-[10px] font-[1100] uppercase tracking-[0.2em] btn-3d-celeste flex items-center justify-center shadow-lg cursor-pointer"
                    >
                        Volver al Inicio
                    </button>
                    <div className={`pt-4 mt-4 border-t ${isDayMode ? 'border-black/5' : 'border-white/5'}`}>
                        <p className={`text-[8px] font-black uppercase tracking-widest mb-3 ${isDayMode ? 'text-[#0891b2]' : 'text-violet-400/50'}`}>Acceso Director Global</p>
                        <button 
                            onClick={() => window.location.href = window.location.href.split('?')[0] + '?inject=true'}
                            className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 border-none cursor-pointer ${
                                isDayMode 
                                    ? 'bg-gradient-to-b from-violet-600 to-violet-700 text-white shadow-lg' 
                                    : 'bg-violet-600 hover:bg-violet-500 text-white shadow-[0_0_20px_rgba(124,58,237,0.3)]'
                            }`}
                        >
                            <RefreshCw size={14} /> Inyectar Sincronía $10k
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen p-6 relative overflow-hidden flex flex-col items-center pt-8 pb-24 selection:bg-cyan-500/30 transition-colors duration-500 ${
            isDayMode ? 'bg-[#cda488] text-[#2d1e15]' : 'bg-black text-white'
        }`}>
            {/* HUD / Cyber Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className={`absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[150px] opacity-20 ${
                    invoice.status === 'paid' ? 'bg-green-500' : 'bg-cyan-500'
                }`} />
                {!isDayMode ? (
                    <>
                        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px]" />
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
                    </>
                ) : (
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(140,90,50,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(140,90,50,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
                )}
            </div>

            {/* HEADER */}
            <div className="w-full max-w-sm relative z-10 flex justify-between items-center mb-6 animate-in fade-in slide-in-from-top-4 duration-700">
                <button 
                    onClick={() => { playNeonClick(); navigate(`/${townId}/home`); }}
                    className="w-10 h-10 rounded-xl flex items-center justify-center btn-3d-celeste shadow-lg transition-all cursor-pointer z-10"
                    aria-label="Regresar"
                >
                    <ChevronLeft size={20} style={isDayMode ? { color: '#083344' } : { color: '#22d3ee' }} strokeWidth={3} />
                </button>
                <div className="text-center">
                    <h1 className={`text-2xl font-[1000] tracking-tighter uppercase ${
                        isDayMode 
                            ? 'text-transparent bg-clip-text bg-gradient-to-r from-[#083344] via-[#0891b2] to-[#0284c7] drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]' 
                            : 'text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-400 to-blue-500 drop-shadow-[0_0_20px_rgba(34,211,238,0.4)]'
                    }`}>
                        Factura Electrónica
                    </h1>
                    <p className={`text-[8px] font-[900] uppercase tracking-[0.4em] ${isDayMode ? 'text-[#0891b2]' : 'text-cyan-400/60'}`}>
                        ShopDigital · Red Comercial
                    </p>
                </div>
                <div className="w-10" />
            </div>

            {/* Brand Avatar Section */}
            {isDayMode && (
                <div className="flex justify-center mb-4 mt-1 model-floating select-none pointer-events-none z-20">
                    <img 
                        src="/ari-pointing.png" 
                        alt="ARI Asistente Factura" 
                        className="h-32 w-auto object-contain drop-shadow-[0_10px_15px_rgba(88,70,50,0.15)] animate-in fade-in duration-700" 
                    />
                </div>
            )}

            {/* PREMIUM INVOICE CONTAINER */}
            <div className={`w-full max-w-sm border-2 rounded-[2.5rem] p-9 relative z-10 overflow-hidden shadow-2xl transition-all duration-500 animate-in zoom-in-95 duration-700 ${
                isDayMode 
                    ? 'bg-white/85 border-[#0891b2] border-b-[8px] border-b-[#083344]' 
                    : invoice.status === 'paid' 
                        ? 'border-green-500/40 shadow-[0_0_40px_rgba(34,197,94,0.15)] bg-zinc-900/40' 
                        : 'border-cyan-500/40 shadow-[0_0_40px_rgba(34,211,238,0.15)] bg-zinc-900/40'
            }`}>
                {/* Laser scan line inside the card */}
                {!isDayMode && <div className="absolute left-0 right-0 h-[2px] bg-cyan-400/80 shadow-[0_0_12px_rgba(34,211,238,0.8)] animate-[scan-laser_3s_infinite_linear] pointer-events-none z-20" />}
                
                {/* Internal Decorative Glow */}
                {!isDayMode && (
                    <div className={`absolute top-[-20%] right-[-20%] w-64 h-64 rounded-full blur-[80px] pointer-events-none opacity-30 ${
                        invoice.status === 'paid' ? 'bg-green-400' : 'bg-cyan-400'
                    }`} />
                )}

                {/* STATUS CAPSULE & ID */}
                <div className="flex flex-col items-center mb-8">
                    <div className={`px-6 py-2.5 rounded-full border-2 mb-6 flex items-center gap-2.5 text-[11px] font-[1000] uppercase tracking-[0.2em] shadow-lg ${
                        isDayMode 
                            ? invoice.status === 'paid' 
                                ? 'bg-green-500/10 border-green-600 text-green-700' 
                                : 'bg-yellow-500/10 border-yellow-600 text-yellow-800' 
                            : invoice.status === 'paid' 
                                ? 'bg-green-500/20 border-green-400/60 text-green-400 animate-pulse' 
                                : 'bg-yellow-500/10 border-yellow-400/60 text-yellow-400 animate-pulse'
                    }`}>
                        {invoice.status === 'paid' ? <CheckCircle size={16} strokeWidth={3} /> : <Clock size={16} strokeWidth={3} />}
                        {invoice.status === 'paid' ? 'PAGADO' : 'PENDIENTE'}
                    </div>
                    <div className="text-center">
                        <p className={`text-[9px] font-black uppercase tracking-[0.3em] mb-1.5 ${isDayMode ? 'text-black/40' : 'text-white/30'}`}>Comprobante N°</p>
                        <p className={`text-[13px] font-mono font-bold px-4 py-1.5 rounded-xl border uppercase ${
                            isDayMode ? 'bg-[#faf8f5] border-[#0891b2]/45 text-[#083344]' : 'bg-white/5 border-white/10 text-white/90'
                        }`}>{invoice.id}</p>
                    </div>
                </div>

                {/* MERCHANT NAME SECTION */}
                <div className="text-center mb-8">
                    <p className={`text-[9px] font-black uppercase tracking-[0.3em] mb-2.5 ${isDayMode ? 'text-[#0891b2]' : 'text-cyan-400/50'}`}>Facturado a:</p>
                    <h2 className={`text-3xl font-[1000] uppercase tracking-tight leading-[0.9] ${
                        isDayMode ? 'text-[#083344]' : 'text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]'
                    }`}>
                        {invoice.shopName}
                    </h2>
                </div>

                {/* CONCEPT & AMOUNT (THE CORE) */}
                <div className={`rounded-[2rem] p-8 mb-8 border relative overflow-hidden group ${
                    isDayMode 
                        ? 'bg-[#faf8f5] border-[#0891b2]/45 text-[#083344] shadow-inner' 
                        : 'bg-black/60 border-white/10 shadow-inner'
                }`}>
                    <div className="absolute top-0 right-0 w-40 h-40 bg-black/5 rounded-full blur-[50px] -mr-10 -mt-10 pointer-events-none" />
                    
                    <div className="mb-6 relative z-10">
                        <p className={`text-[9px] font-black uppercase tracking-[0.3em] mb-2 ${isDayMode ? 'text-black/50' : 'text-white/40'}`}>Por el Concepto</p>
                        <p className="text-[13px] font-black uppercase tracking-widest leading-relaxed">{invoice.concept}</p>
                    </div>
                    
                    <div className="relative z-10">
                        <p className={`text-[9px] font-black uppercase tracking-[0.3em] mb-3 ${isDayMode ? 'text-black/50' : 'text-white/40'}`}>Importe Total</p>
                        <div className="flex items-baseline gap-1">
                            <span className={`text-5xl font-[1000] tracking-tighter ${
                                isDayMode 
                                    ? invoice.status === 'paid' ? 'text-green-700' : 'text-cyan-700' 
                                    : invoice.status === 'paid' ? 'text-green-400 drop-shadow-[0_0_20px_rgba(34,197,94,0.3)]' : 'text-cyan-400 drop-shadow-[0_0_20px_rgba(34,211,238,0.3)]'
                            }`}>
                                ${invoice.amount.toLocaleString('es-AR')}
                            </span>
                        </div>
                    </div>
                </div>

                {/* TIMESTAMPS GRID */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className={`border rounded-2xl p-4 flex flex-col items-center ${
                        isDayMode ? 'bg-[#faf8f5] border-[#0891b2]/45 text-[#083344]' : 'bg-white/5 border-white/5'
                    }`}>
                        <p className={`text-[9px] font-black uppercase tracking-[0.2em] mb-1.5 ${isDayMode ? 'text-black/40' : 'text-white/30'}`}>Emisión</p>
                        <p className="text-[12px] font-[900]">{new Date(invoice.issueDate).toLocaleDateString('es-AR')}</p>
                    </div>
                    <div className={`border rounded-2xl p-4 flex flex-col items-center ${
                        isDayMode ? 'bg-[#faf8f5] border-[#0891b2]/45 text-[#083344]' : 'bg-white/5 border-white/5'
                    }`}>
                        <p className={`text-[9px] font-black uppercase tracking-[0.2em] mb-1.5 ${isDayMode ? 'text-black/40' : 'text-white/30'}`}>Vencimiento</p>
                        <p className="text-[12px] font-[900]">{new Date(invoice.dueDate).toLocaleDateString('es-AR')}</p>
                    </div>
                </div>

                {/* PAID CONFIRMATION / ACTION */}
                {invoice.status === 'paid' ? (
                    <div className="mt-8 flex flex-col items-center animate-in zoom-in duration-500">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 border ${
                            isDayMode 
                                ? 'bg-green-500/10 border-green-600 text-green-700' 
                                : 'bg-green-500/10 border-green-500/30 text-green-400 shadow-[0_0_30px_rgba(34,197,94,0.2)]'
                        }`}>
                            <CheckCircle size={32} strokeWidth={3} />
                        </div>
                        <p className={`text-[14px] font-[1000] uppercase tracking-[0.3em] ${isDayMode ? 'text-green-700' : 'text-green-400'}`}>Pago Registrado</p>
                        <p className={`text-[10px] font-black uppercase tracking-widest mt-2 ${isDayMode ? 'text-black/40' : 'text-white/30'}`}>ID TRANSACCIÓN: {invoice.id.split('-')[1] || 'DB-AUTH'}</p>
                    </div>
                ) : (
                    <div className="mt-8">
                        <button 
                            onClick={handleWhatsAppNotify}
                            className="w-full h-16 text-[11px] font-[1100] uppercase tracking-[0.2em] btn-3d-celeste flex items-center justify-center gap-3 shadow-lg cursor-pointer"
                        >
                            <Smartphone size={18} style={isDayMode ? { color: '#083344' } : { color: '#22d3ee' }} strokeWidth={2.5} />
                            <span>Avisar Pago WhatsApp</span>
                        </button>
                    </div>
                )}
            </div>

            {/* DOWNLOAD ACTION */}
            <div className="mt-8 relative z-10 w-full max-w-sm flex flex-col gap-4 animate-in slide-in-from-bottom-4 duration-700 delay-300">
                <button 
                    onClick={() => { playNeonClick(); window.print(); }}
                    className="w-full h-16 text-[11px] font-[1100] uppercase tracking-[0.2em] btn-3d-celeste flex items-center justify-center gap-3 shadow-lg cursor-pointer"
                >
                    <Download size={18} style={isDayMode ? { color: '#083344' } : { color: '#22d3ee' }} strokeWidth={2.5} />
                    <span>Descargar PDF</span>
                </button>
                
                <p className={`text-[8.5px] uppercase tracking-[0.4em] font-bold text-center leading-[1.8] mt-4 px-6 ${
                    isDayMode ? 'text-black/40' : 'text-white/20'
                }`}>
                    Este documento es un comprobante de servicio proforma temporal, válido para seguimiento interno de membresía. No válido como factura electrónica de AFIP.
                </p>
            </div>
            
            {/* Scan animation stylesheet keyframes */}
            <style>{`
                @keyframes scan-laser {
                    0% { top: 5%; }
                    50% { top: 95%; }
                    100% { top: 5%; }
                }
            `}</style>
        </div>
    );
};

export default InvoiceViewerPage;
