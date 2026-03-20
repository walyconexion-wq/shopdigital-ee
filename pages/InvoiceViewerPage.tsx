import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Invoice } from '../types';
import { obtenerFactura } from '../firebase';
import { 
    CheckCircle, Clock, ExternalLink, ShieldCheck, 
    Smartphone, Download, FileText
} from 'lucide-react';
import { playNeonClick } from '../utils/audio';

const InvoiceViewerPage: React.FC = () => {
    const { invoiceId } = useParams<{ invoiceId: string }>();
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchInvoice = async () => {
            if (!invoiceId) return;
            try {
                const data = await obtenerFactura(invoiceId);
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
    }, [invoiceId]);

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
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 text-center">
                <FileText size={48} className="text-white/20 mb-4" />
                <h1 className="text-xl font-black text-white uppercase tracking-widest mb-2">Comprobante no encontrado</h1>
                <p className="text-[10px] text-white/50 uppercase tracking-widest mb-8">El link puede estar roto o la factura fue eliminada.</p>
                <button 
                    onClick={() => navigate('/')}
                    className="bg-white/10 text-white px-6 py-3 rounded-xl uppercase tracking-widest text-[10px] font-black active:scale-95 transition-transform"
                >
                    Volver al Inicio
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-6 relative overflow-hidden flex flex-col items-center pt-12 pb-24">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className={`absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] ${invoice.status === 'paid' ? 'bg-green-500/10' : 'bg-cyan-500/10'}`} />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:30px_30px]" />
            </div>

            {/* Header Branding */}
            <div className="w-full max-w-md relative z-10 flex flex-col items-center mb-8">
                <h1 className="text-3xl font-[1000] text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 tracking-tighter uppercase drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]">ShopDigital</h1>
                <p className="text-[9px] font-black text-white/50 uppercase tracking-[0.3em] mt-1">Servicios de Red Comercial</p>
            </div>

            {/* Main Invoice Card */}
            <div className={`w-full max-w-md bg-zinc-900/60 backdrop-blur-xl border-2 rounded-[2rem] p-8 relative z-10 overflow-hidden shadow-2xl transition-colors ${invoice.status === 'paid' ? 'border-green-500/30 shadow-[0_0_50px_rgba(34,197,94,0.1)]' : 'border-cyan-500/30 shadow-[0_0_50px_rgba(34,211,238,0.1)]'}`}>
                
                {/* Status Badge */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <p className="text-[8px] font-black uppercase tracking-[0.2em] text-white/40 mb-1">Comprobante N°</p>
                        <p className="text-xs font-mono text-white/80">{invoice.id.toUpperCase()}</p>
                    </div>
                    <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${invoice.status === 'paid' ? 'bg-green-500/20 border-green-500/50 text-green-400' : 'bg-yellow-500/10 border-yellow-500/50 text-yellow-500'}`}>
                        {invoice.status === 'paid' ? <CheckCircle size={14} /> : <Clock size={14} />}
                        {invoice.status === 'paid' ? 'Pagado' : 'Pendiente Pago'}
                    </div>
                </div>

                {/* Client Info */}
                <div className="mb-8 border-l-2 border-white/20 pl-4 py-1">
                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-white/40 mb-1">Facturado a:</p>
                    <h2 className="text-lg font-[1000] text-white uppercase tracking-wider">{invoice.shopName}</h2>
                </div>

                {/* Concept and Amount */}
                <div className="bg-black/40 rounded-2xl p-6 mb-8 border border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-[40px]" />
                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-white/40 mb-1">Concepto</p>
                    <p className="text-sm font-bold text-white uppercase tracking-wider mb-6">{invoice.concept}</p>
                    
                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-white/40 mb-1">Importe Total</p>
                    <p className={`text-4xl font-[1000] tracking-tighter ${invoice.status === 'paid' ? 'text-green-400' : 'text-cyan-400'}`}>
                        ${invoice.amount.toLocaleString('es-AR')}
                    </p>
                </div>

                {/* Dates */}
                <div className="flex justify-between items-center bg-white/5 rounded-xl p-4 mb-4">
                    <div>
                        <p className="text-[8px] font-black uppercase tracking-[0.2em] text-white/40 mb-1">Emisión</p>
                        <p className="text-[10px] font-bold text-white/80">{new Date(invoice.issueDate).toLocaleDateString('es-AR')}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[8px] font-black uppercase tracking-[0.2em] text-white/40 mb-1">Vencimiento</p>
                        <p className="text-[10px] font-bold text-white/80">{new Date(invoice.dueDate).toLocaleDateString('es-AR')}</p>
                    </div>
                </div>

                {/* Payment Info / Action */}
                {invoice.status === 'pending' ? (
                    <div className="mt-8 border-t border-white/10 pt-6">
                        <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-2xl p-5 mb-4">
                            <h3 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <ShieldCheck size={14} /> Datos para Transferencia
                            </h3>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-[9px] text-white/50 uppercase tracking-widest">Alias</span>
                                    <span className="text-[11px] font-black text-white tracking-widest select-all">SHOP.DIGITAL.VIP</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[9px] text-white/50 uppercase tracking-widest">Titular</span>
                                    <span className="text-[10px] font-bold text-white/80">ShopDigital Services</span>
                                </div>
                            </div>
                        </div>
                        
                        <button 
                            onClick={handleWhatsAppNotify}
                            className="w-full btn-cyan-neon py-4 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 active:scale-95 transition-all"
                        >
                            <Smartphone size={16} /> Avisar Pago por WhatsApp
                        </button>
                    </div>
                ) : (
                    <div className="mt-8 pt-6 border-t border-white/10 text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/20 text-green-400 mb-3">
                            <CheckCircle size={24} />
                        </div>
                        <p className="text-[11px] font-black text-green-400 uppercase tracking-[0.2em]">Pago Registrado</p>
                        <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mt-1">
                            El {invoice.paymentDate ? new Date(invoice.paymentDate).toLocaleDateString('es-AR') : 'día de hoy'}
                        </p>
                    </div>
                )}
            </div>

            {/* Print / Download Button */}
            <div className="mt-8 relative z-10 w-full max-w-md flex gap-3">
                <button 
                    onClick={() => { playNeonClick(); window.print(); }}
                    className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-4 flex items-center justify-center gap-2 text-white/80 font-black uppercase tracking-widest text-[10px] transition-colors"
                >
                    <Download size={16} /> Descargar PDF
                </button>
            </div>
            
            <p className="mt-12 text-[8px] text-white/20 uppercase tracking-[0.3em] font-bold text-center w-full max-w-md">
                Este documento es un comprobante de servicio proforma temporal, válido para seguimiento interno de membresía. No válido como factura electrónica de AFIP.
            </p>
        </div>
    );
};

export default InvoiceViewerPage;
