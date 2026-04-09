// ShopDigital — Credencial de Comerciante PRO (v4.0 POSNET Integrado) 🪪💳
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Shop, Client } from '../types';
import { db } from '../firebase';
import { transaccionarCreditos } from '../firebaseVIP';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { QRCodeCanvas } from 'qrcode.react';
import {
    ChevronLeft, Star, QrCode, ShieldCheck, Clock, IdCard,
    Wallet, CreditCard, ArrowUpRight, ArrowDownRight,
    CheckCircle, XCircle, Search, User, Store, MapPin
} from 'lucide-react';
import { playNeonClick, playSuccessSound } from '../utils/audio';

interface CredencialPageProps {
    allShops: Shop[];
}

const CredencialPage: React.FC<CredencialPageProps> = ({ allShops }) => {
    const { townId = 'esteban-echeverria', categorySlug, shopSlug } = useParams<{
        townId: string; categorySlug: string; shopSlug: string;
    }>();
    const navigate = useNavigate();

    // --- Shop ---
    const selectedShop = useMemo(() =>
        allShops.find(shop => (shop.slug || shop.id) === shopSlug),
    [shopSlug, allShops]);

    // --- Clock ---
    const [currentTime, setCurrentTime] = useState(new Date());
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);
    const formatClock = (d: Date) => `${d.toLocaleDateString('es-AR')} - ${d.toLocaleTimeString('es-AR')}`;

    // --- POSNET State ---
    const [posnetOpen, setPosnetOpen] = useState(false);
    const [posnetMode, setPosnetMode] = useState<'load' | 'spend'>('load');
    const [clients, setClients] = useState<Client[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [amount, setAmount] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [txStatus, setTxStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');

    // Fetch clients when POSNET opens
    useEffect(() => {
        if (!posnetOpen) return;
        const fetchClients = async () => {
            try {
                const snap = await getDocs(query(collection(db, 'clientes'), where('townId', '==', townId)));
                setClients(snap.docs.map(d => ({ id: d.id, ...d.data() } as Client)));
            } catch (err) { console.error(err); }
        };
        fetchClients();
    }, [posnetOpen, townId]);

    const filteredClients = useMemo(() => {
        if (!searchTerm.trim()) return [];
        const t = searchTerm.toLowerCase();
        return clients.filter(c =>
            c.name?.toLowerCase().includes(t) || c.dni?.toLowerCase().includes(t) || c.phone?.includes(t)
        ).slice(0, 6);
    }, [clients, searchTerm]);

    const handleTransaction = async () => {
        if (!selectedClient || !amount || !selectedShop) return;
        const num = parseInt(amount);
        if (isNaN(num) || num <= 0) return;

        if (posnetMode === 'spend' && (selectedClient.credits || 0) < num) {
            setErrorMsg(`Saldo insuficiente (${selectedClient.credits || 0} créditos)`);
            setTxStatus('error');
            return;
        }

        setIsProcessing(true);
        setTxStatus('idle');
        try {
            const desc = posnetMode === 'load'
                ? `+${num} créditos por compra en ${selectedShop.name}`
                : `-${num} créditos canjeados en ${selectedShop.name}`;
            const newBalance = await transaccionarCreditos(selectedClient.id, selectedShop.id, num, posnetMode, desc);
            setSelectedClient(prev => prev ? { ...prev, credits: newBalance } : null);
            setTxStatus('success');
            playSuccessSound();
            setAmount('');
        } catch (err) {
            console.error(err);
            setErrorMsg('Error en la transacción');
            setTxStatus('error');
        } finally {
            setIsProcessing(false);
        }
    };

    const resetPosnet = () => {
        setSelectedClient(null);
        setSearchTerm('');
        setAmount('');
        setTxStatus('idle');
        setErrorMsg('');
    };

    // Validation URL
    const validationUrl = useMemo(() =>
        `${window.location.origin}/${townId}/${categorySlug}/${shopSlug}/validar`,
    [townId, categorySlug, shopSlug]);

    if (!selectedShop) return null;

    // Color scheme: Slate/Blue Deep for merchant — different from client's Cyan
    const ACCENT = '#6366f1'; // Indigo
    const ACCENT_LIGHT = 'rgba(99, 102, 241, ';

    return (
        <div className="min-h-screen bg-black flex flex-col items-center px-6 py-8 relative overflow-hidden selection:bg-indigo-500/30">
            {/* HUD Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[100px]" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.01)_1px,transparent_1px)] bg-[size:40px_40px]" />
            </div>

            {/* Back Button */}
            <button onClick={() => { playNeonClick(); navigate(-1); }}
                className="self-start mb-6 w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/20 transition-all z-10">
                <ChevronLeft size={20} />
            </button>

            {/* ═══════════ CREDENCIAL CARD ═══════════ */}
            <div className="w-full max-w-sm relative z-10">
                <div className="bg-gradient-to-br from-indigo-500/20 to-blue-900/30 rounded-[2.5rem] p-[1.5px] shadow-[0_0_40px_rgba(99,102,241,0.15)]">
                    <div className="bg-[#060612] rounded-[2.4rem] p-8 flex flex-col items-center relative overflow-hidden border border-white/5">
                        {/* Ambient glow */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-2xl" />

                        {/* SELLO DE VIDA: RELOJ EN TIEMPO REAL ⏱️ */}
                        <div className="w-full flex items-center justify-center gap-2 mb-6 py-2 px-4 rounded-full bg-indigo-500/5 border border-indigo-500/10">
                            <Clock size={10} className="text-indigo-400 animate-pulse" />
                            <span className="text-[9px] font-[1000] text-indigo-400/80 uppercase tracking-widest tabular-nums">
                                {formatClock(currentTime)}
                            </span>
                        </div>

                        {/* Shop Avatar */}
                        <div className="w-24 h-24 rounded-2xl overflow-hidden mb-5 border-2 border-indigo-500/40 shadow-[0_0_25px_rgba(99,102,241,0.3)] bg-black p-1">
                            <img src={selectedShop.image} alt={selectedShop.name} className="w-full h-full object-cover rounded-xl" />
                        </div>

                        {/* Shop Name */}
                        <h2 className="text-xl font-[1000] text-white uppercase tracking-tight mb-1 text-center leading-tight">
                            {selectedShop.name}
                        </h2>
                        <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-4 text-center">
                            {selectedShop.specialty || selectedShop.category}
                        </p>

                        {/* Badge */}
                        <div className="flex items-center gap-2 mb-6 bg-indigo-500/10 px-4 py-1.5 rounded-full border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                            <span className="text-indigo-400 text-[9px] font-black uppercase tracking-[0.2em]">Comercio Verificado</span>
                        </div>

                        {/* Data Grid */}
                        <div className="w-full grid grid-cols-2 gap-3 mb-6">
                            <div className="bg-white/[0.03] rounded-xl p-3 border border-white/5">
                                <p className="text-[7px] font-black text-white/20 uppercase tracking-widest mb-0.5">Titular</p>
                                <p className="text-[11px] font-[1000] text-white/80 uppercase tracking-tight truncate">
                                    {selectedShop.ownerName || selectedShop.name}
                                </p>
                            </div>
                            <div className="bg-white/[0.03] rounded-xl p-3 border border-white/5">
                                <p className="text-[7px] font-black text-white/20 uppercase tracking-widest mb-0.5">ID Comercio</p>
                                <p className="text-[11px] font-[1000] text-indigo-400/80 tracking-tight truncate">
                                    {selectedShop.shopNumber || selectedShop.id.slice(0, 8).toUpperCase()}
                                </p>
                            </div>
                            <div className="bg-white/[0.03] rounded-xl p-3 border border-white/5 col-span-2">
                                <p className="text-[7px] font-black text-white/20 uppercase tracking-widest mb-0.5 flex items-center gap-1">
                                    <MapPin size={8} /> Dirección
                                </p>
                                <p className="text-[10px] font-bold text-white/60 truncate">{selectedShop.address}</p>
                            </div>
                        </div>

                        {/* QR Code */}
                        <div className="w-full bg-indigo-500/[0.03] rounded-[2rem] p-6 flex flex-col items-center border border-indigo-500/10 mb-6 relative group/qr">
                            <div className="bg-white p-4 rounded-2xl mb-4 shadow-[0_0_30px_rgba(255,255,255,0.05)] relative z-10">
                                <QRCodeCanvas
                                    value={validationUrl}
                                    size={140}
                                    level="H"
                                    includeMargin={false}
                                    imageSettings={{
                                        src: selectedShop.image,
                                        x: undefined, y: undefined,
                                        height: 28, width: 28, excavate: true,
                                    }}
                                />
                            </div>
                            <p className="text-[9px] font-black text-indigo-400/50 uppercase tracking-[0.3em]">Código de Validación</p>
                        </div>

                        {/* Status */}
                        <div className="w-full flex justify-between items-center text-white/90 text-[9px] font-black uppercase tracking-[0.2em] border-t border-white/5 pt-4">
                            <span className="text-white/30">Membresía Activa</span>
                            <span className="text-indigo-400 drop-shadow-[0_0_5px_rgba(99,102,241,0.4)]">
                                {selectedShop.billingStatus === 'active' ? '✅ ACTIVA' : '⏳ PENDIENTE'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══════════ POSNET INTEGRADO ═══════════ */}
            <div className="w-full max-w-sm mt-8 relative z-10 space-y-4">
                {!posnetOpen ? (
                    <button
                        onClick={() => { playNeonClick(); setPosnetOpen(true); }}
                        className="w-full h-20 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 rounded-3xl flex flex-col items-center justify-center gap-1.5 font-black uppercase tracking-[0.2em] text-[11px] shadow-[0_10px_30px_rgba(99,102,241,0.3)] active:scale-95 transition-all text-white border border-white/10 relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />
                        <CreditCard size={22} />
                        <span>💳 Abrir POSNET de Créditos</span>
                    </button>
                ) : (
                    <div className="bg-zinc-900/80 border border-indigo-500/20 rounded-[2rem] p-6 space-y-5 backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <CreditCard size={14} /> POSNET de Créditos
                            </h3>
                            <button onClick={() => { playNeonClick(); setPosnetOpen(false); resetPosnet(); }}
                                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/30 hover:text-white/60 border border-white/10 text-[12px]">✕</button>
                        </div>

                        {/* Mode Selector */}
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => { playNeonClick(); setPosnetMode('load'); setTxStatus('idle'); }}
                                className={`py-3 rounded-xl font-black uppercase tracking-widest text-[9px] border transition-all active:scale-95 flex flex-col items-center gap-1
                                    ${posnetMode === 'load'
                                        ? 'bg-green-500/15 border-green-400 text-green-300 shadow-[0_0_15px_rgba(34,197,94,0.2)]'
                                        : 'bg-white/5 border-white/10 text-white/40'}`}
                            >
                                <ArrowUpRight size={16} />
                                Cargar
                            </button>
                            <button
                                onClick={() => { playNeonClick(); setPosnetMode('spend'); setTxStatus('idle'); }}
                                className={`py-3 rounded-xl font-black uppercase tracking-widest text-[9px] border transition-all active:scale-95 flex flex-col items-center gap-1
                                    ${posnetMode === 'spend'
                                        ? 'bg-red-500/15 border-red-400 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                                        : 'bg-white/5 border-white/10 text-white/40'}`}
                            >
                                <ArrowDownRight size={16} />
                                Descontar
                            </button>
                        </div>

                        {/* Client Search or Selected */}
                        {!selectedClient ? (
                            <div className="space-y-2">
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        placeholder="Buscar socio (nombre, DNI, tel)..."
                                        className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-[11px] font-bold text-white placeholder:text-white/20 focus:border-indigo-500/40 outline-none"
                                        autoFocus
                                    />
                                    <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20" />
                                </div>
                                {filteredClients.map(c => (
                                    <button key={c.id}
                                        onClick={() => { playNeonClick(); setSelectedClient(c); setSearchTerm(''); setTxStatus('idle'); }}
                                        className="w-full bg-black/30 border border-white/5 hover:border-indigo-500/30 rounded-lg p-2.5 flex items-center gap-2.5 transition-all active:scale-[0.98]"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center overflow-hidden flex-shrink-0 border border-white/10">
                                            {c.photo ? <img src={c.photo} className="w-full h-full object-cover rounded-full" alt="" /> : <User size={12} className="text-white/30" />}
                                        </div>
                                        <div className="flex-1 text-left min-w-0">
                                            <p className="text-[10px] font-black text-white uppercase tracking-wider truncate">{c.name}</p>
                                            <p className="text-[7px] text-white/30">{c.dni || 'Sin DNI'} · 💰 {c.credits || 0}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {/* Selected Client Mini-Card */}
                                <div className="bg-black/40 border border-indigo-500/15 rounded-xl p-3 flex items-center gap-3 relative">
                                    <button onClick={() => { playNeonClick(); resetPosnet(); }}
                                        className="absolute top-2 right-2 text-white/20 hover:text-white/50 text-[10px]">✕</button>
                                    <div className="w-10 h-10 rounded-full border border-indigo-500/20 overflow-hidden bg-white/5 flex-shrink-0">
                                        {selectedClient.photo ? <img src={selectedClient.photo} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center"><User size={16} className="text-white/20" /></div>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-black text-white uppercase tracking-wider truncate">{selectedClient.name}</p>
                                        <p className="text-[8px] text-indigo-400">Saldo: <span className="font-[1000] tabular-nums">{selectedClient.credits || 0}</span> créditos</p>
                                    </div>
                                </div>

                                {/* Amount */}
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={e => setAmount(e.target.value)}
                                        placeholder="0"
                                        className={`w-full bg-black/40 border rounded-xl p-3 text-[22px] font-[1000] placeholder:text-white/5 focus:outline-none tabular-nums text-center
                                            ${posnetMode === 'load' ? 'border-green-500/20 text-green-400' : 'border-red-500/20 text-red-400'}`}
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-black text-white/20 uppercase tracking-widest">CRÉDITOS</span>
                                </div>

                                {/* Status */}
                                {txStatus === 'success' && (
                                    <div className="bg-green-500/10 border border-green-500/30 p-3 rounded-xl flex items-center gap-3">
                                        <CheckCircle size={18} className="text-green-400 flex-shrink-0" />
                                        <div>
                                            <p className="text-[10px] font-[1000] text-green-400 uppercase tracking-widest">
                                                {posnetMode === 'load' ? '✅ Créditos Cargados' : '✅ Descuento Aplicado'}
                                            </p>
                                            <p className="text-[8px] text-white/40">Nuevo saldo: {selectedClient.credits}</p>
                                        </div>
                                    </div>
                                )}
                                {txStatus === 'error' && (
                                    <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-xl flex items-center gap-3">
                                        <XCircle size={18} className="text-red-400 flex-shrink-0" />
                                        <p className="text-[9px] font-black text-red-400">{errorMsg}</p>
                                    </div>
                                )}

                                {/* Action Button */}
                                <button
                                    onClick={handleTransaction}
                                    disabled={isProcessing || !amount}
                                    className={`w-full h-14 rounded-2xl flex items-center justify-center gap-2 font-black uppercase tracking-[0.15em] text-[10px] active:scale-95 transition-all border border-white/10 disabled:opacity-30 disabled:grayscale
                                        ${posnetMode === 'load'
                                            ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-[0_8px_20px_rgba(34,197,94,0.2)]'
                                            : 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-[0_8px_20px_rgba(239,68,68,0.2)]'}`}
                                >
                                    {isProcessing
                                        ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        : <>
                                            {posnetMode === 'load' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                                            {posnetMode === 'load' ? 'Otorgar Créditos' : 'Confirmar Descuento'}
                                        </>
                                    }
                                </button>

                                {txStatus === 'success' && (
                                    <button onClick={() => { playNeonClick(); resetPosnet(); }}
                                        className="w-full h-10 rounded-xl bg-white/5 border border-white/10 text-white/40 font-black uppercase tracking-widest text-[8px] active:scale-95 transition-all">
                                        Nueva Transacción
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Navigation Buttons */}
            <div className="w-full max-w-sm mt-6 space-y-3 relative z-10">
                <button
                    onClick={() => { playNeonClick(); navigate(`/${townId}/${categorySlug}/${shopSlug}/panel-autogestion`); }}
                    className="w-full h-12 rounded-2xl bg-white/5 hover:bg-white/10 text-white/60 font-black uppercase tracking-[0.2em] text-[9px] transition-all active:scale-95 border border-white/5 flex items-center justify-center gap-2"
                >
                    <Store size={14} /> Panel de Autogestión
                </button>
                <button
                    onClick={() => { playNeonClick(); navigate(`/${townId}/home`); }}
                    className="w-full h-12 rounded-2xl bg-white/5 hover:bg-white/10 text-white/30 font-black uppercase tracking-[0.2em] text-[9px] transition-all active:scale-95 border border-white/5"
                >
                    Volver a Inicio
                </button>
            </div>

            {/* Footer */}
            <div className="mt-10 flex flex-col items-center gap-2 relative z-10">
                <p className="text-[8px] font-black text-indigo-400/60 uppercase tracking-[0.4em] text-center px-12 leading-loose">
                    Security ID: SHOP-{selectedShop.id.slice(0, 8).toUpperCase()}
                </p>
                <div className="flex items-center gap-4">
                    <div className="h-[1px] w-8 bg-indigo-500/40" />
                    <span className="text-[7px] font-bold text-white/40 uppercase tracking-[0.8em]">ShopDigital.tech</span>
                    <div className="h-[1px] w-8 bg-indigo-500/40" />
                </div>
            </div>
        </div>
    );
};

export default CredencialPage;
