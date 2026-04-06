import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
    ChevronLeft, FileText, Search, Plus, 
    CheckCircle, Clock, Edit2, Send, 
    Trash2, RefreshCw, XCircle, MapPin, LineChart, ArrowLeft,
    ExternalLink
} from 'lucide-react';
import { Shop, Invoice } from '../types';
import { CATEGORIES } from '../constants';
import { suscribirseAFacturasPorZona, crearFactura, actualizarEstadoFactura, actualizarFactura } from '../firebase';
import { useTownLocalities } from '../hooks/useTownLocalities';
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
    
    // UI Navigation State
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
    const { localities } = useTownLocalities(townId);
    const [activeLocation, setActiveLocation] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'paid' | 'uncollectible'>('all');
    
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

    // Setear primera localidad como activa cuando carguen en el nivel 2
    useEffect(() => {
        if (localities.length > 0 && !activeLocation) {
            setActiveLocation(localities[0]);
        }
    }, [localities, activeLocation]);

    // -------------------------------------------------------------
    // DATA COMPUTATION
    // -------------------------------------------------------------
    const isCurrentMonth = (dateString: string) => {
        const d = new Date(dateString);
        const now = new Date();
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    };

    // Dashboard computations (All zone scale)
    const currentMonthInvoices = invoices; // Si queremos que el radar sea histórico, quitamos el filtro de mes. Según directriz "Radar", es el global de esa vista o mensual.
    const totalFacturado = currentMonthInvoices.reduce((sum, inv) => sum + inv.amount, 0);
    const totalCobrado = currentMonthInvoices.filter(i => i.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0);
    const totalPendiente = currentMonthInvoices.filter(i => i.status === 'pending').reduce((sum, inv) => sum + inv.amount, 0);
    
    const invoiceCountByCategory = useMemo(() => {
        const counts: Record<string, number> = {};
        CATEGORIES.forEach(cat => {
            counts[cat.id] = invoices.filter(inv => {
                const shop = allShops.find(s => s.id === inv.shopId);
                return shop && (shop.category === cat.id || shop.category === cat.slug);
            }).length;
        });
        return counts;
    }, [invoices, allShops]);

    // View 2 (Detail) computations
    const filteredInvoices = useMemo(() => {
        if (!selectedCategoryId) return [];
        return invoices.filter(inv => {
            const shop = allShops.find(s => s.id === inv.shopId);
            if (!shop) return false;
            
            // 1. Filtrar por Rubro
            const catMatch = shop.category === selectedCategoryId || shop.category === CATEGORIES.find(c => c.id === selectedCategoryId)?.slug;
            if (!catMatch) return false;
            
            // 2. Filtrar por Localidad Activa
            const normalize = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
            const normalizedLoc = normalize(activeLocation);
            const isLocal = shop.zone === activeLocation || (shop.address && normalize(shop.address).includes(normalizedLoc));
            if (!isLocal) return false;

            // 3. Filtrar por Mood
            if (statusFilter !== 'all' && inv.status !== statusFilter) return false;

            // 4. Filtrar por Buscador
            const strSearch = searchQuery.toLowerCase();
            if (strSearch && !(
                inv.shopName.toLowerCase().includes(strSearch) ||
                inv.concept.toLowerCase().includes(strSearch) ||
                inv.id.toLowerCase().includes(strSearch)
            )) {
                return false;
            }

            return true;
        });
    }, [invoices, allShops, selectedCategoryId, activeLocation, statusFilter, searchQuery]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(amount);
    };

    // -------------------------------------------------------------
    // HANDLERS
    // -------------------------------------------------------------
    const handleCreateInvoice = async () => {
        playNeonClick();
        const shop = allShops.find(s => s.id === selectedShopId);
        if (!shop || !amount) return;

        const issueDateObj = new Date();
        const periodSello = `${issueDateObj.getFullYear()}-${String(issueDateObj.getMonth() + 1).padStart(2, '0')}`;

        const newInvoice = {
            shopId: shop.id,
            shopName: shop.name,
            townId,
            locality: shop.zone || 'Desconocida',
            period: periodSello,
            amount: parseFloat(amount),
            issueDate: issueDateObj.toISOString(),
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
        let newStatus: 'pending' | 'paid' | 'uncollectible' = 'pending';
        
        if (inv.status === 'pending') {
            const confirm = window.confirm(`¿Confirmás que recibiste el pago de ${formatCurrency(inv.amount)} de ${inv.shopName}?`);
            if (!confirm) return;
            newStatus = 'paid';
        } else if (inv.status === 'paid') {
            const confirm = window.confirm(`¿Deseas marcar esta factura como INCOBRABLE? (Dejará de contar en cobrados)`);
            if (!confirm) return;
            newStatus = 'uncollectible';
        } else {
            const confirm = window.confirm(`¿Devolver la factura a PENDIENTE de cobro?`);
            if (!confirm) return;
            newStatus = 'pending';
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

    // Paleta cíclica para solapas nivel 2
    const CYCLIC_COLORS = [
        { border: 'border-violet-400',  bg: 'bg-violet-500/20',  text: 'text-violet-300',  shadow: 'shadow-[0_0_20px_rgba(139,92,246,0.4)]'  },
        { border: 'border-cyan-400',    bg: 'bg-cyan-500/20',    text: 'text-cyan-300',    shadow: 'shadow-[0_0_20px_rgba(34,211,238,0.4)]'  },
        { border: 'border-rose-400',    bg: 'bg-rose-500/20',    text: 'text-rose-300',    shadow: 'shadow-[0_0_20px_rgba(244,63,94,0.4)]'   },
        { border: 'border-green-400',   bg: 'bg-green-500/20',   text: 'text-green-300',   shadow: 'shadow-[0_0_20px_rgba(34,197,94,0.4)]'   },
        { border: 'border-amber-400',   bg: 'bg-amber-500/20',   text: 'text-amber-300',   shadow: 'shadow-[0_0_20px_rgba(245,158,11,0.4)]'  },
    ];

    // =========================================================
    // VIEW 1: Category Selection Grid
    // =========================================================
    if (!selectedCategoryId) {
        return (
            <div className="min-h-screen bg-black text-white pb-24 relative overflow-hidden selection:bg-violet-500/30">
                <div className="fixed inset-0 pointer-events-none z-0">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.02)_1px,transparent_1px)] bg-[size:30px_30px]" />
                </div>

                <div className="bg-zinc-900/80 backdrop-blur-xl border-b border-violet-500/30 pt-10 pb-6 px-4 sticky top-0 z-50 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                    <div role="button" tabIndex={0} onClick={() => { playNeonClick(); navigate(`/${townId}/embajador`); }} 
                            className="absolute top-10 left-6 text-violet-400 hover:text-violet-300 cursor-pointer">
                        <ChevronLeft size={24} />
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 bg-violet-500/10 rounded-2xl flex items-center justify-center mb-2 border border-violet-400/30 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                            <FileText size={24} className="text-violet-400" />
                        </div>
                        <h1 className="text-xl font-[1000] uppercase tracking-[0.2em] text-white">Facturación</h1>
                        <p className="text-[10px] font-bold text-violet-400/80 uppercase tracking-widest text-center mt-1">
                            Radar de Tesorería · {townId.replace(/-/g, ' ')}
                        </p>
                        
                        {/* Radar Dashboard */}
                        <div className="w-full max-w-sm mt-4 grid grid-cols-3 gap-2 text-center bg-black/40 p-3 rounded-2xl border border-white/5">
                            <div className="flex flex-col">
                                <span className="text-[8px] text-white/40 uppercase tracking-widest font-bold">Cobrado</span>
                                <span className="text-xs font-black text-green-400">{formatCurrency(totalCobrado)}</span>
                            </div>
                            <div className="flex flex-col border-x border-white/5">
                                <span className="text-[8px] text-white/40 uppercase tracking-widest font-bold">Pendiente</span>
                                <span className="text-xs font-black text-yellow-400">{formatCurrency(totalPendiente)}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[8px] text-white/40 uppercase tracking-widest font-bold">Total</span>
                                <span className="text-xs font-black text-white">{formatCurrency(totalFacturado)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-5 mt-6 relative z-10 max-w-lg mx-auto">
                    {/* Resumen Rápido A.I. */}
                    <div className="w-full bg-violet-900/10 border border-violet-500/20 rounded-2xl p-4 mb-6 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-32 h-32 bg-violet-500/10 rounded-full blur-[40px] pointer-events-none" />
                        <h2 className="text-[10px] font-black text-violet-400 uppercase tracking-widest mb-3 flex items-center gap-2 relative z-10">
                            <LineChart size={14} /> Desglose Zonal (A.I.)
                        </h2>
                        <div className="space-y-2 relative z-10">
                            {localities.map(loc => {
                                const locInvoices = currentMonthInvoices.filter(inv => {
                                    const shop = allShops.find(s => s.id === inv.shopId);
                                    return shop?.zone === loc;
                                });
                                const locTot = locInvoices.reduce((sum, inv) => sum + inv.amount, 0);
                                const locPag = locInvoices.filter(i => i.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0);
                                if (locTot === 0) return null;
                                return (
                                    <div key={loc} className="flex justify-between items-center bg-black/40 px-3 py-2 rounded-xl text-[9px] font-bold tracking-widest uppercase border border-white/5">
                                        <span className="text-white/80">{loc}</span>
                                        <div className="flex gap-3 text-right">
                                            <span className="text-green-400">{formatCurrency(locPag)}</span>
                                            <span className="text-white/40">/</span>
                                            <span className="text-white">{formatCurrency(locTot)}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    
                    {loading ? (
                        <div className="flex justify-center mt-10"><RefreshCw className="animate-spin text-violet-400" /></div>
                    ) : (
                        <>
                            <h2 className="text-[10px] font-black text-white/50 uppercase tracking-widest pl-2 mb-3 mt-8">Navegación por Rubro</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {CATEGORIES.map(cat => {
                                    const count = invoiceCountByCategory[cat.id] || 0;
                                    return (
                                        <div
                                            key={cat.id}
                                            role="button"
                                            tabIndex={0}
                                            onClick={() => { playNeonClick(); setSelectedCategoryId(cat.id); }}
                                            className="glass-card-3d bg-white/[0.03] border border-white/10 hover:border-violet-500/40 rounded-2xl p-4 flex flex-col items-center gap-2 transition-all active:scale-95 group relative overflow-hidden cursor-pointer"
                                        >
                                            <div className="absolute top-0 right-0 w-16 h-16 bg-violet-500/5 rounded-full blur-[20px] pointer-events-none" />
                                            <div className="text-violet-400 group-hover:scale-110 transition-transform">
                                                {cat.icon}
                                            </div>
                                            <span className="text-[8px] font-black uppercase tracking-widest text-white/70 text-center leading-tight">
                                                {cat.name}
                                            </span>
                                            {count > 0 && (
                                                <span className="absolute top-2 right-2 bg-violet-500/20 border border-violet-400/30 text-violet-300 text-[7px] font-black px-1.5 py-0.5 rounded-full">
                                                    {count}
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    }

    // =========================================================
    // VIEW 2: Location Tabs + Mood Filters + Invoice List
    // =========================================================
    const selectedCategory = CATEGORIES.find(c => c.id === selectedCategoryId);
    
    return (
        <div className="min-h-screen bg-black text-white pb-24 relative overflow-hidden selection:bg-violet-500/30">
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-500/5 rounded-full blur-[120px]" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.02)_1px,transparent_1px)] bg-[size:30px_30px]" />
            </div>

            {/* Header Nivel 2 */}
            <div className="bg-zinc-900/50 backdrop-blur-md pt-8 pb-4 px-6 flex flex-col items-center border-b border-violet-500/20 mb-4 sticky top-0 z-40">
                <div role="button" tabIndex={0} onClick={() => { playNeonClick(); setSelectedCategoryId(null); }}
                    className="self-start mb-3 w-10 h-10 rounded-2xl bg-violet-500/10 flex items-center justify-center text-violet-400 border border-violet-400/30 hover:bg-violet-500/20 transition-all shadow-[0_0_15px_rgba(139,92,246,0.2)] cursor-pointer">
                    <ArrowLeft size={20} />
                </div>
                <div className="flex items-center gap-2 mb-1">
                    <FileText size={18} className="text-violet-400" />
                    <h2 className="text-[15px] font-black text-white uppercase tracking-[0.15em] drop-shadow-[0_0_10px_rgba(139,92,246,0.5)]">
                        {selectedCategory?.name || 'Facturación'}
                    </h2>
                </div>
                <p className="text-[8px] font-bold text-violet-400/60 uppercase tracking-widest text-center mt-1">
                    Auditoría de Tesorería · Filtrado Zonal
                </p>
            </div>

            {/* Location Tabs */}
            <div className="flex justify-center gap-3 px-5 mb-5 relative z-10 overflow-x-auto no-scrollbar">
                {localities.map((loc, idx) => {
                    const isActive = activeLocation === loc;
                    const colors = CYCLIC_COLORS[idx % CYCLIC_COLORS.length];
                    return (
                        <div
                            role="button" tabIndex={0}
                            key={loc}
                            onClick={() => { playNeonClick(); setActiveLocation(loc); }}
                            className={`px-4 py-2.5 rounded-xl font-black uppercase tracking-widest text-[8px] border transition-all duration-300 whitespace-nowrap cursor-pointer
                                ${isActive
                                    ? `${colors.bg} ${colors.border} ${colors.text} ${colors.shadow} scale-110`
                                    : `bg-white/[0.03] border-white/10 text-white/40 hover:text-white/60 hover:border-white/20`
                                }`}
                        >
                            {loc}
                        </div>
                    );
                })}
            </div>

            {/* Mood Tabs */}
            <div className="w-full overflow-x-auto hide-scrollbar mb-4 pb-2 z-10 relative px-4">
                <div className="flex gap-2 min-w-max px-1">
                    {[
                        { id: 'all', label: 'Todas las Órdenes' },
                        { id: 'pending', label: 'Pendientes' },
                        { id: 'paid', label: 'Pagadas' },
                        { id: 'uncollectible', label: 'Incobrables' }
                    ].map(mood => (
                        <div
                            role="button" tabIndex={0}
                            key={mood.id}
                            onClick={() => { playNeonClick(); setStatusFilter(mood.id as any); }}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                                statusFilter === mood.id 
                                ? mood.id === 'paid' ? 'bg-green-500 text-black shadow-[0_0_15px_rgba(34,197,94,0.3)]'
                                  : mood.id === 'pending' ? 'bg-yellow-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.3)]'
                                  : mood.id === 'uncollectible' ? 'bg-red-500 text-black shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                                  : 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                                : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/5'
                            }`}
                        >
                            {mood.label}
                        </div>
                    ))}
                </div>
            </div>

            <div className="px-5 mt-2 relative z-10 max-w-lg mx-auto">
                <div className="flex gap-3 mb-6">
                    <div className="relative flex-1">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                        <input
                            type="text"
                            placeholder="BUSCAR FACTURA..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-[10px] font-black uppercase tracking-widest text-white placeholder:text-white/30 focus:outline-none focus:border-violet-400/50"
                        />
                    </div>
                    <div
                        role="button" tabIndex={0}
                        onClick={() => { playNeonClick(); setShowCreateModal(true); }}
                        className="bg-violet-600 border border-violet-400 text-white px-4 rounded-xl flex items-center justify-center font-black active:scale-95 transition-transform shadow-[0_0_15px_rgba(139,92,246,0.3)] cursor-pointer"
                    >
                        <Plus size={20} />
                    </div>
                </div>

                {filteredInvoices.length === 0 ? (
                    <div className="text-center mt-10 opacity-50 bg-white/[0.02] border border-violet-500/20 rounded-3xl p-10 flex flex-col items-center">
                        <FileText size={32} className="mx-auto mb-3 text-violet-400/50" />
                        <p className="text-[10px] font-black uppercase tracking-widest">No hay facturas registradas aquí</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredInvoices.map(inv => {
                            const shop = allShops.find(s => s.id === inv.shopId);
                            const invoiceUrl = `${window.location.origin}/${townId}/factura/${inv.id}`;

                            return (
                            <div key={inv.id} className="bg-zinc-900/50 border border-white/10 rounded-3xl p-5 relative overflow-hidden group hover:border-violet-500/30 transition-colors">
                                <div className={`absolute top-0 right-0 w-24 h-24 blur-[50px] rounded-full pointer-events-none ${inv.status === 'paid' ? 'bg-green-500/20' : inv.status === 'uncollectible' ? 'bg-red-500/20' : 'bg-yellow-500/20'}`} />
                                
                                <div className="flex justify-between items-start mb-3 relative z-10">
                                    <div>
                                        <h3 className="text-[14px] font-[1000] text-white uppercase tracking-wider flex items-center gap-2">
                                            {inv.shopName}
                                        </h3>
                                        <p className="text-[9px] font-bold text-white/50 uppercase tracking-widest mt-0.5">{inv.concept}</p>
                                        <p className="text-[8px] font-bold text-violet-400/80 uppercase tracking-widest mt-1 flex items-center gap-1 bg-violet-500/10 px-1.5 py-0.5 rounded w-max border border-violet-400/20">
                                            <MapPin size={8} /> ZONA: {shop?.zone || inv.locality || 'Desconocida'}
                                        </p>
                                    </div>
                                    <div className={`px-2.5 py-1 rounded-lg border text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 ${inv.status === 'paid' ? 'bg-green-500/10 border-green-500/30 text-green-400' : inv.status === 'uncollectible' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'}`}>
                                        {inv.status === 'paid' ? <CheckCircle size={10} /> : inv.status === 'uncollectible' ? <XCircle size={10} /> : <Clock size={10} />}
                                        {inv.status === 'paid' ? 'Pagado' : inv.status === 'uncollectible' ? 'Incobrable' : 'Pendiente'}
                                    </div>
                                </div>
                                
                                <div className="bg-black/30 border border-white/5 rounded-xl p-3 mb-4 relative z-10">
                                    <p className="text-[8px] text-white/40 uppercase tracking-widest mb-1 flex justify-between">
                                        <span>Detalle de Auditoría</span>
                                        <span>ID: {inv.id.slice(0,8)}...</span>
                                    </p>
                                    <p className="text-[7.5px] text-white/30 truncate select-all">{invoiceUrl}</p>
                                </div>

                                <div className="flex items-end justify-between border-t border-white/10 pt-3 mb-4 relative z-10">
                                    <div>
                                        <p className="text-[8px] text-white/40 uppercase tracking-widest">Emisión: {new Date(inv.issueDate).toLocaleDateString()}</p>
                                        <p className="text-[8px] text-white/40 uppercase tracking-widest">Vence: {new Date(inv.dueDate).toLocaleDateString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[8px] text-violet-400/60 font-black uppercase tracking-widest mb-0.5">Importe</p>
                                        <p className="text-lg font-[1000] text-violet-400 leading-none">{formatCurrency(inv.amount)}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-4 gap-1.5 relative z-10">
                                    <div 
                                        role="button" tabIndex={0}
                                        onClick={() => { playNeonClick(); window.open(invoiceUrl, '_blank'); }}
                                        className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 py-2 rounded-xl flex flex-col items-center justify-center gap-1.5 text-[8px] font-black uppercase tracking-widest hover:bg-cyan-500/20 cursor-pointer"
                                    >
                                        <ExternalLink size={12} /> Ver
                                    </div>
                                    <div 
                                        role="button" tabIndex={0}
                                        onClick={() => handleToggleStatus(inv)}
                                        className={`py-2 rounded-xl flex flex-col items-center justify-center gap-1.5 text-[8px] font-black uppercase tracking-widest transition-colors cursor-pointer ${inv.status === 'pending' ? 'bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30' : inv.status === 'paid' ? 'bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20' : 'bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/30'}`}
                                    >
                                        {inv.status === 'pending' ? <CheckCircle size={12} /> : inv.status === 'paid' ? <XCircle size={12} /> : <RefreshCw size={12} />} 
                                        {inv.status === 'pending' ? 'Cobrar' : inv.status === 'paid' ? 'Anular' : 'Reversar'}
                                    </div>
                                    <div 
                                        role="button" tabIndex={0}
                                        onClick={() => openEditModal(inv)}
                                        className="bg-white/5 border border-white/10 text-white/80 py-2 rounded-xl flex flex-col items-center justify-center gap-1.5 text-[8px] font-black uppercase tracking-widest hover:bg-white/10 cursor-pointer"
                                    >
                                        <Edit2 size={12} /> Editar
                                    </div>
                                    <div 
                                        role="button" tabIndex={0}
                                        onClick={() => handleSendWhatsApp(inv)}
                                        className="bg-violet-500/10 border border-violet-500/30 text-violet-400 py-2 rounded-xl flex flex-col items-center justify-center gap-1.5 text-[8px] font-black uppercase tracking-widest hover:bg-violet-500/20 cursor-pointer"
                                    >
                                        <Send size={12} /> Enviar
                                    </div>
                                </div>
                            </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            {(showCreateModal || showEditModal) && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-5 animate-in fade-in duration-200">
                    <div className="bg-zinc-900 border border-violet-500/20 rounded-3xl w-full max-w-sm overflow-hidden shadow-[0_0_50px_rgba(139,92,246,0.1)]">
                        <div className="bg-violet-500/10 p-5 border-b border-violet-500/20 flex justify-between items-center">
                            <h3 className="font-black text-white uppercase tracking-widest text-[11px] flex items-center gap-2">
                                <FileText size={14} className="text-violet-400" /> 
                                {showCreateModal ? 'Generar Aviso de Pago' : 'Modificar Aviso'}
                            </h3>
                            <div role="button" tabIndex={0} onClick={() => { setShowCreateModal(false); setShowEditModal(false); resetForm(); }} className="text-white/40 hover:text-white cursor-pointer">
                                <Trash2 size={16} />
                            </div>
                        </div>
                        <div className="p-5 space-y-4">
                            {showCreateModal && (
                                <div>
                                    <label className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-1.5 block">Comercio del Rubro y Zona</label>
                                    <select 
                                        value={selectedShopId}
                                        onChange={(e) => setSelectedShopId(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-3 text-[11px] font-bold text-white focus:border-violet-400/50 focus:outline-none uppercase"
                                    >
                                        <option value="">Seleccionar Comercio...</option>
                                        {allShops
                                            .filter(s => {
                                                const normalize = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
                                                const catMatch = s.category === selectedCategoryId || s.category === CATEGORIES.find(c => c.id === selectedCategoryId)?.slug;
                                                const normalizedLoc = normalize(activeLocation);
                                                const locMatch = s.zone === activeLocation || (s.address && normalize(s.address).includes(normalizedLoc));
                                                return catMatch && locMatch;
                                            })
                                            .map(s => <option key={s.id} value={s.id}>{s.name}</option>)
                                        }
                                    </select>
                                </div>
                            )}
                            
                            <div>
                                <label className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-1.5 block">Importe ($)</label>
                                <input 
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-3 text-lg font-black text-violet-400 focus:border-violet-400/50 focus:outline-none"
                                    placeholder="Ej: 5000"
                                />
                            </div>

                            <div>
                                <label className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-1.5 block">Concepto</label>
                                <input 
                                    type="text"
                                    value={concept}
                                    onChange={(e) => setConcept(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-3 text-[11px] font-bold text-white focus:border-violet-400/50 focus:outline-none uppercase"
                                />
                            </div>

                            <div>
                                <label className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-1.5 block">Vencimiento</label>
                                <input 
                                    type="date"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-3 text-[11px] font-bold text-white focus:border-violet-400/50 focus:outline-none"
                                />
                            </div>

                            <div 
                                role="button" tabIndex={0}
                                onClick={() => {
                                    if (!amount || (showCreateModal && !selectedShopId)) return;
                                    showCreateModal ? handleCreateInvoice() : handleEditInvoice();
                                }}
                                className={`w-full mt-2 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] text-center transition-transform shadow-[0_0_20px_rgba(139,92,246,0.3)] 
                                    ${(!amount || (showCreateModal && !selectedShopId)) ? 'opacity-50 bg-violet-600/50 text-white/50 cursor-not-allowed' : 'bg-violet-600 text-white cursor-pointer hover:bg-violet-500 active:scale-95'}`}
                            >
                                {showCreateModal ? 'Generar Aviso' : 'Guardar Cambios'}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BillingManagementPage;
