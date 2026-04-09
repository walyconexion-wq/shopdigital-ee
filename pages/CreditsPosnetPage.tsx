import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { transaccionarCreditos } from '../firebaseVIP';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Client, Shop } from '../types';
import {
    ChevronLeft,
    CreditCard,
    Search,
    User,
    Wallet,
    ArrowUpRight,
    ArrowDownRight,
    CheckCircle,
    XCircle,
    Store,
    Phone,
    ShieldCheck,
    History
} from 'lucide-react';
import { playNeonClick, playSuccessSound } from '../utils/audio';
import LoadingScreen from '../components/LoadingScreen';

const CreditsPosnetPage: React.FC = () => {
    const { townId = 'esteban-echeverria' } = useParams<{ townId: string }>();
    const navigate = useNavigate();

    const [clients, setClients] = useState<Client[]>([]);
    const [shops, setShops] = useState<Shop[]>([]);
    const [loading, setLoading] = useState(true);

    // Search & Selection
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [selectedShopId, setSelectedShopId] = useState('');

    // Transaction Form
    const [mode, setMode] = useState<'load' | 'spend'>('load');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    // Fetch data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [clientSnap, shopSnap] = await Promise.all([
                    getDocs(query(collection(db, "clientes"), where("townId", "==", townId))),
                    getDocs(query(collection(db, "comercios"), where("townId", "==", townId)))
                ]);
                setClients(clientSnap.docs.map(d => ({ id: d.id, ...d.data() } as Client)));
                setShops(shopSnap.docs.map(d => ({ id: d.id, ...d.data() } as Shop)).filter(s => s.isActive && s.entityType !== 'enterprise'));
            } catch (err) {
                console.error("Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [townId]);

    // Search filter
    const filteredClients = useMemo(() => {
        if (!searchTerm.trim()) return [];
        const term = searchTerm.toLowerCase();
        return clients.filter(c =>
            c.name?.toLowerCase().includes(term) ||
            c.dni?.toLowerCase().includes(term) ||
            c.phone?.includes(term)
        ).slice(0, 8);
    }, [clients, searchTerm]);

    const handleSelectClient = (client: Client) => {
        playNeonClick();
        setSelectedClient(client);
        setSearchTerm('');
        setStatus('idle');
        setAmount('');
    };

    const handleTransaction = async () => {
        if (!selectedClient || !amount || !selectedShopId) return;

        const numAmount = parseInt(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            alert("⚠️ Monto inválido");
            return;
        }

        if (mode === 'spend' && (selectedClient.credits || 0) < numAmount) {
            setErrorMessage(`Créditos insuficientes. Saldo actual: ${selectedClient.credits || 0}`);
            setStatus('error');
            return;
        }

        setIsProcessing(true);
        setStatus('idle');

        try {
            const shopName = shops.find(s => s.id === selectedShopId)?.name || 'Comercio';
            const desc = description || (mode === 'load'
                ? `+${numAmount} créditos por compra en ${shopName}`
                : `-${numAmount} créditos canjeados en ${shopName}`);

            const newBalance = await transaccionarCreditos(
                selectedClient.id,
                selectedShopId,
                numAmount,
                mode,
                desc
            );

            setSelectedClient(prev => prev ? { ...prev, credits: newBalance } : null);
            setStatus('success');
            playSuccessSound();
            setAmount('');
            setDescription('');
        } catch (err) {
            console.error(err);
            setErrorMessage("Error procesando la transacción");
            setStatus('error');
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) return <LoadingScreen ready={false} onDone={() => {}} />;

    return (
        <div className="min-h-screen bg-black text-white pb-24 relative overflow-x-hidden selection:bg-cyan-500/30">
            {/* HUD */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-green-500/5 rounded-full blur-[100px]" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.01)_1px,transparent_1px)] bg-[size:40px_40px]" />
            </div>

            {/* Header */}
            <div className="bg-zinc-900/80 backdrop-blur-xl border-b border-cyan-500/10 py-6 px-6 flex items-center justify-between sticky top-0 z-50">
                <button onClick={() => { playNeonClick(); navigate(-1); }}
                    className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 border border-white/10">
                    <ChevronLeft size={20} />
                </button>
                <div className="text-right">
                    <p className="text-[11px] font-black uppercase text-cyan-400 tracking-[0.2em] flex items-center gap-1.5 justify-end">
                        <CreditCard size={14} /> POSNET de Créditos
                    </p>
                    <p className="text-[8px] font-bold text-white/30 uppercase tracking-widest">
                        Terminal VIP · {townId.replace(/-/g, ' ').toUpperCase()}
                    </p>
                </div>
            </div>

            <div className="max-w-lg mx-auto p-6 relative z-10 space-y-6">
                {/* ─── MODO: CARGAR / DESCONTAR ─── */}
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => { playNeonClick(); setMode('load'); setStatus('idle'); }}
                        className={`py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] border transition-all active:scale-95 flex flex-col items-center gap-1.5
                            ${mode === 'load'
                                ? 'bg-green-500/15 border-green-400 text-green-300 shadow-[0_0_20px_rgba(34,197,94,0.3)]'
                                : 'bg-white/5 border-white/10 text-white/40'
                            }`}
                    >
                        <ArrowUpRight size={20} />
                        Cargar Créditos
                    </button>
                    <button
                        onClick={() => { playNeonClick(); setMode('spend'); setStatus('idle'); }}
                        className={`py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] border transition-all active:scale-95 flex flex-col items-center gap-1.5
                            ${mode === 'spend'
                                ? 'bg-red-500/15 border-red-400 text-red-300 shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                                : 'bg-white/5 border-white/10 text-white/40'
                            }`}
                    >
                        <ArrowDownRight size={20} />
                        Descontar Créditos
                    </button>
                </div>

                {/* ─── BUSCAR CLIENTE ─── */}
                {!selectedClient ? (
                    <div className="space-y-3">
                        <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] flex items-center gap-2">
                            <Search size={12} /> Buscar Socio VIP
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                placeholder="Nombre, DNI o teléfono..."
                                className="w-full bg-zinc-900 border border-white/10 rounded-2xl p-4 text-sm font-bold text-white placeholder:text-white/20 focus:border-cyan-500/50 outline-none"
                                autoFocus
                            />
                            <Search size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20" />
                        </div>

                        {filteredClients.length > 0 && (
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {filteredClients.map(c => (
                                    <button
                                        key={c.id}
                                        onClick={() => handleSelectClient(c)}
                                        className="w-full bg-zinc-900/80 border border-white/10 hover:border-cyan-500/30 rounded-xl p-3 flex items-center gap-3 transition-all active:scale-[0.98]"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                                            {c.photo ? (
                                                <img src={c.photo} className="w-full h-full object-cover rounded-full" alt="" />
                                            ) : (
                                                <User size={16} className="text-white/30" />
                                            )}
                                        </div>
                                        <div className="flex-1 text-left min-w-0">
                                            <p className="text-[11px] font-black text-white uppercase tracking-wider truncate">{c.name}</p>
                                            <p className="text-[8px] text-white/40 tracking-widest">
                                                {c.dni || 'Sin DNI'} · 💰 {c.credits || 0} créditos
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {searchTerm.length > 2 && filteredClients.length === 0 && (
                            <p className="text-[9px] text-white/30 text-center uppercase tracking-widest py-4">
                                No se encontraron socios con "{searchTerm}"
                            </p>
                        )}
                    </div>
                ) : (
                    /* ─── CLIENTE SELECCIONADO + FORMULARIO ─── */
                    <div className="space-y-5">
                        {/* Tarjeta del Cliente */}
                        <div className="bg-zinc-900 border border-cyan-500/20 rounded-[2rem] p-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl" />
                            <button
                                onClick={() => { playNeonClick(); setSelectedClient(null); setStatus('idle'); }}
                                className="absolute top-3 right-3 w-8 h-8 bg-white/5 rounded-full flex items-center justify-center text-white/30 hover:text-white/60 border border-white/10 z-10"
                            >
                                <XCircle size={14} />
                            </button>

                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-16 h-16 rounded-full border-2 border-cyan-500/30 overflow-hidden bg-white/5 flex-shrink-0">
                                    {selectedClient.photo ? (
                                        <img src={selectedClient.photo} className="w-full h-full object-cover" alt="" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center"><User size={28} className="text-white/20" /></div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-lg font-[1000] text-white uppercase tracking-tighter">{selectedClient.name}</h3>
                                    <div className="flex items-center gap-2 text-[8px] font-black text-cyan-400 uppercase tracking-widest">
                                        <CheckCircle size={10} /> Socio VIP · {selectedClient.dni || 'Sin DNI'}
                                    </div>
                                </div>
                            </div>

                            <div className={`rounded-xl p-4 border text-center ${mode === 'load' ? 'bg-green-500/5 border-green-500/10' : 'bg-cyan-500/5 border-cyan-500/10'}`}>
                                <p className="text-[8px] font-black uppercase tracking-widest mb-1" style={{ color: mode === 'load' ? 'rgb(74,222,128)' : 'rgb(34,211,238)', opacity: 0.5 }}>
                                    Saldo Actual
                                </p>
                                <p className={`text-[32px] font-[1000] tabular-nums ${mode === 'load' ? 'text-green-400' : 'text-cyan-400'}`}>
                                    {selectedClient.credits || 0}
                                </p>
                                <p className="text-[7px] font-bold text-white/30 uppercase tracking-widest">créditos disponibles</p>
                            </div>
                        </div>

                        {/* Comercio Origen */}
                        <div>
                            <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
                                <Store size={12} /> Comercio
                            </label>
                            <select
                                value={selectedShopId}
                                onChange={e => setSelectedShopId(e.target.value)}
                                className="w-full bg-zinc-900 border border-white/10 rounded-2xl p-4 text-sm font-black text-white focus:border-cyan-500/50 outline-none appearance-none"
                            >
                                <option value="" disabled>Seleccione el comercio...</option>
                                {shops.map(s => (
                                    <option key={s.id} value={s.id}>{s.name} ({s.zone})</option>
                                ))}
                            </select>
                        </div>

                        {/* Monto */}
                        <div>
                            <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
                                <Wallet size={12} /> {mode === 'load' ? 'Créditos a Cargar' : 'Créditos a Descontar'}
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                    placeholder="0"
                                    className={`w-full bg-zinc-900 border rounded-2xl p-4 text-[28px] font-[1000] placeholder:text-white/5 focus:outline-none tabular-nums
                                        ${mode === 'load'
                                            ? 'border-green-500/20 text-green-400 focus:border-green-500/50'
                                            : 'border-cyan-500/20 text-cyan-400 focus:border-cyan-500/50'
                                        }`}
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-white/20 uppercase tracking-widest">
                                    CRÉDITOS
                                </span>
                            </div>
                        </div>

                        {/* Descripción */}
                        <div>
                            <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
                                <History size={12} /> Motivo (opcional)
                            </label>
                            <input
                                type="text"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder={mode === 'load' ? 'Ej: Compra de 2 prendas' : 'Ej: Descuento en zapatillas'}
                                className="w-full bg-zinc-900 border border-white/10 rounded-2xl p-3.5 text-[11px] font-bold text-white placeholder:text-white/20 focus:border-white/30 outline-none"
                            />
                        </div>

                        {/* Status */}
                        {status === 'success' && (
                            <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-2xl flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-black shadow-lg shadow-green-500/40">
                                    <CheckCircle size={24} />
                                </div>
                                <div>
                                    <p className="text-[11px] font-[1000] text-green-400 uppercase tracking-widest">
                                        {mode === 'load' ? '✅ Créditos Cargados' : '✅ Descuento Aplicado'}
                                    </p>
                                    <p className="text-[9px] font-bold text-white/50 uppercase tracking-widest">
                                        Nuevo saldo: {selectedClient.credits} créditos
                                    </p>
                                </div>
                            </div>
                        )}

                        {status === 'error' && (
                            <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-2xl flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white">
                                    <XCircle size={24} />
                                </div>
                                <div>
                                    <p className="text-[11px] font-[1000] text-red-500 uppercase tracking-widest">Error</p>
                                    <p className="text-[9px] font-bold text-white/50">{errorMessage}</p>
                                </div>
                            </div>
                        )}

                        {/* Botón de Acción */}
                        <button
                            onClick={handleTransaction}
                            disabled={isProcessing || !amount || !selectedShopId}
                            className={`w-full h-[72px] rounded-3xl flex flex-col items-center justify-center gap-1 font-black uppercase tracking-[0.2em] text-[12px] active:scale-95 transition-all border border-white/20 disabled:opacity-30 disabled:grayscale
                                ${mode === 'load'
                                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 shadow-[0_10px_30px_rgba(34,197,94,0.3)] text-white'
                                    : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-[0_10px_30px_rgba(34,211,238,0.3)] text-white'
                                }`}
                        >
                            {isProcessing ? (
                                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    {mode === 'load' ? <ArrowUpRight size={22} /> : <ArrowDownRight size={22} />}
                                    <span>{mode === 'load' ? 'Otorgar Créditos' : 'Confirmar Descuento'}</span>
                                </>
                            )}
                        </button>

                        {status === 'success' && (
                            <button
                                onClick={() => { playNeonClick(); setStatus('idle'); }}
                                className="w-full h-14 rounded-2xl bg-white/5 border border-white/10 text-white/40 font-black uppercase tracking-widest text-[9px] transition-all active:scale-95"
                            >
                                Nueva Transacción
                            </button>
                        )}
                    </div>
                )}

                <p className="text-[7px] text-center text-white/20 uppercase tracking-[0.3em] font-black leading-relaxed px-4">
                    Terminal POSNET VIP · Todas las transacciones son registradas con trazabilidad completa.
                </p>
            </div>
        </div>
    );
};

export default CreditsPosnetPage;
