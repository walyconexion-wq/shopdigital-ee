import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Invoice, Shop } from '../types';
import { obtenerFacturaPorComercio } from '../firebase';
import { 
    CheckCircle, Clock, ExternalLink, ShieldCheck, 
    Smartphone, Download, FileText, RefreshCw
} from 'lucide-react';
import { playNeonClick } from '../utils/audio';

interface InvoiceViewerPageProps {
    allShops?: Shop[];
}

const InvoiceViewerPage: React.FC<InvoiceViewerPageProps> = ({ allShops = [] }) => {
    const { townId, categorySlug, shopSlug } = useParams<{ townId: string, categorySlug: string, shopSlug: string }>();
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

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

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error || !invoice) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                    <FileText size={40} className="text-red-500" />
                </div>
                <h2 className="text-2xl font-[1000] text-white uppercase tracking-tighter mb-2">Comprobante no Encontrado</h2>
                <p className="text-white/60 text-[11px] font-bold uppercase tracking-widest leading-relaxed max-w-xs mb-8">
                    El ID del comercio {shopSlug} no tiene una factura vinculada o la inyección está pendiente.
                </p>
                <div className="space-y-3 w-full max-w-xs">
                    <button 
                        onClick={() => navigate(`/${townId}/home`)}
                        className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                    >
                        Volver al Inicio
                    </button>
                    <div className="pt-4 border-t border-white/5 mt-4">
                        <p className="text-[8px] font-black text-violet-400/50 uppercase tracking-widest mb-3">Acceso Director Global</p>
                        <button 
                            onClick={() => window.location.href = window.location.href.split('?')[0] + '?inject=true'}
                            className="w-full bg-violet-600 hover:bg-violet-500 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-[0_0_20px_rgba(124,58,237,0.3)] flex items-center justify-center gap-2"
                        >
                            <RefreshCw size={14} /> Inyectar Sincronía $10k
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-6 relative overflow-hidden flex flex-col items-center pt-16 pb-24 selection:bg-cyan-500/30">
            {/* HUD / Cyber Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className={`absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[150px] opacity-20 ${invoice.status === 'paid' ? 'bg-green-500' : 'bg-cyan-500'}`} />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px]" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
                <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black opacity-60" />
            </div>

            {/* BRANDING HEADER */}
            <div className="w-full max-w-sm relative z-10 flex flex-col items-center mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
                <h1 className="text-4xl font-[1000] text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-400 to-blue-500 tracking-tighter uppercase drop-shadow-[0_0_20px_rgba(34,211,238,0.4)]">
                    ShopDigital
                </h1>
                <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent mt-1" />
                <p className="text-[10px] font-[900] text-cyan-400/60 uppercase tracking-[0.4em] mt-2">Servicios de Red Comercial</p>
            </div>

            {/* PREMIUM INVOICE CONTAINER */}
            <div className={`w-full max-w-sm glass-card-3d border-[1.5px] rounded-[2.5rem] p-9 relative z-10 overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.5)] transition-all duration-500 animate-in zoom-in-95 duration-700 ${invoice.status === 'paid' ? 'border-green-500/40 shadow-[0_0_40px_rgba(34,197,94,0.15)] bg-zinc-900/40' : 'border-cyan-500/40 shadow-[0_0_40px_rgba(34,211,238,0.15)] bg-zinc-900/40'}`}>
                
                {/* Internal Decorative Glow */}
                <div className={`absolute top-[-20%] right-[-20%] w-64 h-64 rounded-full blur-[80px] pointer-events-none opacity-30 ${invoice.status === 'paid' ? 'bg-green-400' : 'bg-cyan-400'}`} />

                {/* STATUS CAPSULE & ID */}
                <div className="flex flex-col items-center mb-10">
                    <div className={`px-6 py-2.5 rounded-full border-[1.5px] mb-6 flex items-center gap-2.5 text-[11px] font-[1000] uppercase tracking-[0.2em] shadow-lg animate-pulse-slow ${invoice.status === 'paid' ? 'bg-green-500/20 border-green-400/60 text-green-400' : 'bg-yellow-500/10 border-yellow-400/60 text-yellow-400'}`}>
                        {invoice.status === 'paid' ? <CheckCircle size={16} strokeWidth={3} /> : <Clock size={16} strokeWidth={3} />}
                        {invoice.status === 'paid' ? 'PAGADO' : 'PENDIENTE'}
                    </div>
                    <div className="text-center">
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 mb-1.5">Comprobante N°</p>
                        <p className="text-[13px] font-mono font-bold text-white/90 bg-white/5 px-4 py-1.5 rounded-xl border border-white/10 uppercase">{invoice.id}</p>
                    </div>
                </div>

                {/* MERCHANT NAME SECTION */}
                <div className="text-center mb-12">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-cyan-400/50 mb-3">Facturado a:</p>
                    <h2 className="text-3xl font-[1000] text-white uppercase tracking-tight leading-[0.9] drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
                        {invoice.shopName}
                    </h2>
                </div>

                {/* CONCEPT & AMOUNT (THE CORE) */}
                <div className="bg-black/60 backdrop-blur-md rounded-[2rem] p-8 mb-10 border border-white/10 relative overflow-hidden group shadow-inner">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-[50px] -mr-10 -mt-10" />
                    
                    <div className="mb-8 relative z-10">
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40 mb-2">Por el Concepto</p>
                        <p className="text-[13px] font-black text-white uppercase tracking-widest leading-relaxed">{invoice.concept}</p>
                    </div>
                    
                    <div className="relative z-10">
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40 mb-3">Importe Total</p>
                        <div className="flex items-baseline gap-1">
                            <span className={`text-5xl font-[1000] tracking-tighter ${invoice.status === 'paid' ? 'text-green-400' : 'text-cyan-400'} drop-shadow-[0_0_20px_rgba(34,197,94,0.3)]`}>
                                ${invoice.amount.toLocaleString('es-AR')}
                            </span>
                        </div>
                    </div>
                </div>

                {/* TIMESTAMPS GRID */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col items-center">
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 mb-1.5">Emisión</p>
                        <p className="text-[12px] font-[900] text-white/80">{new Date(invoice.issueDate).toLocaleDateString('es-AR')}</p>
                    </div>
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col items-center">
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 mb-1.5">Vencimiento</p>
                        <p className="text-[12px] font-[900] text-white/80">{new Date(invoice.dueDate).toLocaleDateString('es-AR')}</p>
                    </div>
                </div>

                {/* PAID CONFIRMATION / ACTION */}
                {invoice.status === 'paid' ? (
                    <div className="mt-8 flex flex-col items-center animate-in zoom-in duration-500">
                        <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-400 mb-4 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                            <CheckCircle size={32} strokeWidth={3} />
                        </div>
                        <p className="text-[14px] font-[1000] text-green-400 uppercase tracking-[0.3em]">Pago Registrado</p>
                        <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mt-2">ID TRANSACCIÓN: {invoice.id.split('-')[1] || 'DB-AUTH'}</p>
                    </div>
                ) : (
                    <div className="mt-8">
                        <button 
                            onClick={handleWhatsAppNotify}
                            className="w-full glass-action-btn btn-cyan-neon py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(34,211,238,0.3)] active:scale-95 transition-all text-white border border-cyan-400/50"
                        >
                            <Smartphone size={18} /> Avisar Pago WhatsApp
                        </button>
                    </div>
                )}
            </div>

            {/* DOWNLOAD ACTION */}
            <div className="mt-10 relative z-10 w-full max-w-sm flex flex-col gap-4 animate-in slide-in-from-bottom-4 duration-700 delay-300">
                <button 
                    onClick={() => { playNeonClick(); window.print(); }}
                    className="w-full bg-zinc-900 border border-white/10 rounded-2xl py-5 flex items-center justify-center gap-3 text-white/90 font-black uppercase tracking-[0.2em] text-[11px] hover:bg-zinc-800 transition-all active:scale-[0.98] shadow-xl"
                >
                    <Download size={18} className="text-cyan-400" /> Descargar PDF
                </button>
                
                <p className="text-[8.5px] text-white/20 uppercase tracking-[0.4em] font-bold text-center leading-[1.8] mt-4 px-6">
                    Este documento es un comprobante de servicio proforma temporal, válido para seguimiento interno de membresía. No válido como factura electrónica de AFIP.
                </p>
            </div>
        </div>
    );
};

export default InvoiceViewerPage;
