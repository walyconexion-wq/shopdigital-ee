import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
    ChevronLeft, FileText, Search, Plus, 
    CheckCircle, Clock, Edit2, Send, Download, 
    Trash2, AlertCircle, RefreshCw
} from 'lucide-react';
import { Shop, Invoice } from '../types';
import { CATEGORIES } from '../constants';
import { suscribirseAFacturasPorZona, crearFactura, actualizarEstadoFactura, actualizarFactura } from '../firebase';
import { playNeonClick } from '../utils/audio';

interface BillingManagementPageProps {
    allShops: Shop[];
}

const BillingManagementPage: React.FC<BillingManagementPageProps> = ({ allShops }) => {
    const { townId = 'esteban-echeverria' } = useParams<{ townId: string }>();
    const navigate = useNavigate();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
    
    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    
    // Form states
    const [selectedShopId, setSelectedShopId] = useState('');
    const [amount, setAmount] = useState('');
    const [concept, setConcept] = useState('Suscripción Mes en Curso');
    const [dueDate, setDueDate] = useState('');

    useEffect(() => {
        const unsubscribe = suscribirseAFacturasPorZona(townId, (data) => {
            const sorted = data.sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());
            setInvoices(sorted as Invoice[]);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [townId]);

    const pendingCount = invoices.filter(i => i.status === 'pending').length;

    const filteredInvoices = invoices.filter(inv => {
        const matchesSearch = inv.shopName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              inv.concept.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              inv.status.includes(searchQuery.toLowerCase());
                              
        if (!matchesSearch) return false;
        
        if (selectedCategoryId) {
            const shop = allShops.find(s => s.id === inv.shopId);
            const cat = shop?.category || '';
            const catMatch = cat === selectedCategoryId || cat === CATEGORIES.find(c => c.id === selectedCategoryId)?.slug;
            if (!catMatch) return false;
        }
        
        return true;
    });

    const handleCreateInvoice = async () => {
        playNeonClick();
        const shop = allShops.find(s => s.id === selectedShopId);
        if (!shop || !amount) return;

        const newInvoice = {
            shopId: shop.id,
            shopName: shop.name,
            townId,
            amount: parseFloat(amount),
            issueDate: new Date().toISOString(),
            dueDate: dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'pending',
            concept
        };

        try {
            await crearFactura(newInvoice);
            setShowCreateModal(false);
            resetForm();
        } catch (error) {
            console.error("Error creating invoice", error);
        }
    };

    const handleEditInvoice = async () => {
        playNeonClick();
        if (!selectedInvoice || !amount) return;

        try {
            await actualizarFactura(selectedInvoice.id, {
                amount: parseFloat(amount),
                concept,
                dueDate
            });
            setShowEditModal(false);
            resetForm();
        } catch (error) {
            console.error("Error updating invoice", error);
        }
    };

    const handleSendWhatsApp = (inv: Invoice) => {
        playNeonClick();
        const shop = allShops.find(s => s.id === inv.shopId);
        if (!shop || !shop.phone) {
            alert("El comercio no tiene un teléfono celular registrado.");
            return;
        }

        const phone = shop.phone.replace(/\D/g, '');
        const invoiceUrl = `${window.location.origin}/${townId}/factura/${inv.id}`;
        const message = `¡Hola *${shop.name}*! 👋\n\nTe generamos el comprobante para:\n*${inv.concept}*\n\n👉 *Click aquí para ver tu factura y los datos de pago:*\n${invoiceUrl}\n\nPor favor, enviá el comprobante por este medio una vez realizado el pago. ¡Muchas gracias! 🚀`;
        
        window.open(`https://wa.me/549${phone}?text=${encodeURIComponent(message)}`, '_blank');
    };

    const handleToggleStatus = async (inv: Invoice) => {
        playNeonClick();
        const newStatus = inv.status === 'pending' ? 'paid' : 'pending';
        if (newStatus === 'paid') {
            const confirm = window.confirm(`¿Confirmás que recibiste el pago de $${inv.amount} de ${inv.shopName}?`);
            if (!confirm) return;
        }
        await actualizarEstadoFactura(inv.id, newStatus);
    };

    const resetForm = () => {
        setSelectedShopId('');
        setAmount('');
        setConcept('Suscripción Mes en Curso');
        setDueDate('');
        setSelectedInvoice(null);
    };

    const openEditModal = (inv: Invoice) => {
        playNeonClick();
        setSelectedInvoice(inv);
        setAmount(inv.amount.toString());
        setConcept(inv.concept);
        setDueDate(inv.dueDate.slice(0,10));
        setShowEditModal(true);
    };

    return (
        <div className="min-h-screen bg-black text-white pb-24 relative overflow-hidden">
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-500/10 rounded-full blur-[120px]" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.02)_1px,transparent_1px)] bg-[size:30px_30px]" />
            </div>

            {/* Header */}
            <div className="bg-zinc-900/80 backdrop-blur-xl border-b border-green-500/30 pt-10 pb-6 px-6 sticky top-0 z-50 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                <button onClick={() => navigate(`/${townId}/embajador`)} className="absolute top-10 left-6 text-green-400 hover:text-green-300">
                    <ChevronLeft size={24} />
                </button>
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center mb-2 border border-green-400/30">
                        <FileText size={24} className="text-green-400" />
                    </div>
                    <h1 className="text-xl font-[1000] uppercase tracking-[0.2em] text-white">Facturación · {townId.replace(/-/g, ' ')}</h1>
                    <p className="text-[9px] font-bold text-green-400/80 uppercase tracking-widest mt-1">
                        Comprobantes Pendientes: {pendingCount}
                    </p>
                </div>
            </div>

            <div className="px-5 mt-6 relative z-10 max-w-lg mx-auto">
                <div className="w-full overflow-x-auto hide-scrollbar mb-6 pb-2">
                    <div className="flex gap-2 min-w-max px-1">
                        <button
                            onClick={() => { playNeonClick(); setSelectedCategoryId(null); }}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                !selectedCategoryId 
                                ? 'bg-green-500 text-black shadow-[0_0_15px_rgba(34,197,94,0.3)]' 
                                : 'bg-white/5 text-white/60 hover:bg-white/10'
                            }`}
                        >
                            Todos
                        </button>
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => { playNeonClick(); setSelectedCategoryId(cat.id); }}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                    selectedCategoryId === cat.id 
                                    ? 'bg-green-500 text-black shadow-[0_0_15px_rgba(34,197,94,0.3)]' 
                                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                                }`}
                            >
                                <span className="flex items-center gap-1.5">
                                    {cat.icon} {cat.name}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex gap-3 mb-6">
                    <div className="relative flex-1">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                        <input
                            type="text"
                            placeholder="BUSCAR FACTURA..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-[10px] font-black uppercase tracking-widest text-white placeholder:text-white/30 focus:outline-none focus:border-green-400/50"
                        />
                    </div>
                    <button 
                        onClick={() => { playNeonClick(); setShowCreateModal(true); }}
                        className="bg-green-500 text-black px-4 rounded-xl flex items-center justify-center font-black active:scale-95 transition-transform"
                    >
                        <Plus size={20} />
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center mt-20"><RefreshCw className="animate-spin text-green-400" /></div>
                ) : filteredInvoices.length === 0 ? (
                    <div className="text-center mt-20 opacity-50">
                        <FileText size={32} className="mx-auto mb-3" />
                        <p className="text-[10px] font-black uppercase tracking-widest">No hay facturas registradas</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredInvoices.map(inv => (
                            <div key={inv.id} className="bg-zinc-900/50 border border-white/10 rounded-3xl p-5 relative overflow-hidden group hover:border-green-500/30 transition-colors">
                                <div className={`absolute top-0 right-0 w-24 h-24 blur-[50px] rounded-full pointer-events-none ${inv.status === 'paid' ? 'bg-green-500/20' : 'bg-red-500/20'}`} />
                                
                                <div className="flex justify-between items-start mb-3 relative z-10">
                                    <div>
                                        <h3 className="text-[14px] font-[1000] text-white uppercase tracking-wider">{inv.shopName}</h3>
                                        <p className="text-[9px] font-bold text-white/50 uppercase tracking-widest mt-0.5">{inv.concept}</p>
                                    </div>
                                    <div className={`px-2.5 py-1 rounded-lg border text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 ${inv.status === 'paid' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                                        {inv.status === 'paid' ? <CheckCircle size={10} /> : <Clock size={10} />}
                                        {inv.status === 'paid' ? 'Pagado' : 'Pendiente'}
                                    </div>
                                </div>

                                <div className="flex items-end justify-between border-t border-white/10 pt-3 mb-4 relative z-10">
                                    <div>
                                        <p className="text-[8px] text-white/40 uppercase tracking-widest">Emisión: {new Date(inv.issueDate).toLocaleDateString()}</p>
                                        <p className="text-[8px] text-white/40 uppercase tracking-widest">Vence: {new Date(inv.dueDate).toLocaleDateString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[8px] text-green-400/60 font-black uppercase tracking-widest mb-0.5">Importe</p>
                                        <p className="text-lg font-[1000] text-green-400 leading-none">${inv.amount}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-2 relative z-10">
                                    <button 
                                        onClick={() => handleToggleStatus(inv)}
                                        className={`py-2 rounded-xl flex items-center justify-center gap-1.5 text-[9px] font-black uppercase tracking-widest transition-colors ${inv.status === 'pending' ? 'bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30' : 'bg-white/5 border border-white/10 text-white/40 hover:bg-white/10'}`}
                                    >
                                        <CheckCircle size={12} /> Pagó
                                    </button>
                                    <button 
                                        onClick={() => openEditModal(inv)}
                                        className="bg-white/5 border border-white/10 text-white/80 py-2 rounded-xl flex items-center justify-center gap-1.5 text-[9px] font-black uppercase tracking-widest hover:bg-white/10"
                                    >
                                        <Edit2 size={12} /> Editar
                                    </button>
                                    <button 
                                        onClick={() => handleSendWhatsApp(inv)}
                                        className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 py-2 rounded-xl flex items-center justify-center gap-1.5 text-[9px] font-black uppercase tracking-widest hover:bg-cyan-500/20"
                                    >
                                        <Send size={12} /> Enviar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            {(showCreateModal || showEditModal) && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-5 animate-in fade-in duration-200">
                    <div className="bg-zinc-900 border border-white/10 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl">
                        <div className="bg-white/5 p-5 border-b border-white/10 flex justify-between items-center">
                            <h3 className="font-black text-white uppercase tracking-widest text-[11px] flex items-center gap-2">
                                <FileText size={14} className="text-green-400" /> 
                                {showCreateModal ? 'Generar Nuevo Aviso' : 'Modificar Aviso'}
                            </h3>
                            <button onClick={() => { setShowCreateModal(false); setShowEditModal(false); resetForm(); }} className="text-white/40 hover:text-white">
                                <Trash2 size={16} />
                            </button>
                        </div>
                        <div className="p-5 space-y-4">
                            {showCreateModal && (
                                <div>
                                    <label className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-1.5 block">Comercio</label>
                                    <select 
                                        value={selectedShopId}
                                        onChange={(e) => setSelectedShopId(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-3 text-[11px] font-bold text-white focus:border-green-400/50 focus:outline-none uppercase"
                                    >
                                        <option value="">Seleccionar Comercio...</option>
                                        {allShops.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                            )}
                            
                            <div>
                                <label className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-1.5 block">Importe ($)</label>
                                <input 
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-3 text-lg font-black text-green-400 focus:border-green-400/50 focus:outline-none"
                                    placeholder="Ej: 5000"
                                />
                            </div>

                            <div>
                                <label className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-1.5 block">Concepto</label>
                                <input 
                                    type="text"
                                    value={concept}
                                    onChange={(e) => setConcept(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-3 text-[11px] font-bold text-white focus:border-green-400/50 focus:outline-none uppercase"
                                />
                            </div>

                            <div>
                                <label className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-1.5 block">Vencimiento</label>
                                <input 
                                    type="date"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-3 text-[11px] font-bold text-white focus:border-green-400/50 focus:outline-none"
                                />
                            </div>

                            <button 
                                onClick={showCreateModal ? handleCreateInvoice : handleEditInvoice}
                                disabled={!amount || (showCreateModal && !selectedShopId)}
                                className="w-full mt-2 bg-green-500 text-black py-4 rounded-xl font-black uppercase tracking-widest text-[10px] active:scale-95 disabled:opacity-50 transition-transform"
                            >
                                {showCreateModal ? 'Generar Aviso' : 'Guardar Cambios'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BillingManagementPage;
