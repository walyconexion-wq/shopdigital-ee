import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { transaccionarCreditos } from '../firebaseVIP';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { Client, Shop } from '../types';
import {
    ShieldCheck,
    ChevronLeft,
    XCircle,
    CheckCircle,
    Lock,
    Unlock,
    Wallet,
    Store,
    ArrowDownRight,
    Search,
    User
} from 'lucide-react';
import { playNeonClick, playSuccessSound } from '../utils/audio';
import LoadingScreen from '../components/LoadingScreen';

const ClientValidationPage: React.FC = () => {
    const { townId = 'esteban-echeverria', clientId } = useParams<{ townId: string, clientId: string }>();
    const navigate = useNavigate();
    
    const [client, setClient] = useState<Client | null>(null);
    const [loading, setLoading] = useState(true);
    const [shopsInTown, setShopsInTown] = useState<Shop[]>([]);
    
    // Form State
    const [selectedShopId, setSelectedShopId] = useState("");
    const [amount, setAmount] = useState("");
    const [pin, setPin] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            if (!clientId) return;
            try {
                // 1. Fetch Client
                const docRef = doc(db, 'clientes', clientId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setClient({ id: docSnap.id, ...docSnap.data() } as Client);
                }

                // 2. Fetch Shops for this town
                const q = query(collection(db, "comercios"), where("townId", "==", townId));
                const shopSnap = await getDocs(q);
                const shops = shopSnap.docs.map(d => ({ id: d.id, ...d.data() } as Shop));
                setShopsInTown(shops);
            } catch (error) {
                console.error("Error fetching data for terminal:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [clientId, townId]);

    const handleTransaction = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!client || !selectedShopId || !amount) return;

        const numAmount = parseInt(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            alert("Monto inválido");
            return;
        }

        if ((client.credits || 0) < numAmount) {
            setErrorMessage("Créditos insuficientes");
            setStatus('error');
            return;
        }

        setIsProcessing(true);
        setStatus('idle');

        try {
            const newBalance = await transaccionarCreditos(
                client.id, 
                selectedShopId, 
                numAmount, 
                'spend', 
                `Canje de créditos en terminal`
            );
            
            setClient(prev => prev ? { ...prev, credits: newBalance } : null);
            setStatus('success');
            playSuccessSound();
            setAmount("");
        } catch (err) {
            console.error(err);
            setErrorMessage("Error en la transacción");
            setStatus('error');
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) return <LoadingScreen ready={false} onDone={() => {}} />;

    if (!client) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8 text-center">
                <ShieldCheck size={64} className="text-red-500 mb-6 animate-pulse" />
                <h1 className="text-2xl font-black text-red-500 uppercase tracking-widest">Socio No Identificado</h1>
                <p className="text-sm text-white/40 mt-4 leading-relaxed">Esta credencial no existe en el sistema o es inválida.</p>
                <button onClick={() => navigate(-1)} className="mt-8 bg-zinc-900 border border-white/10 px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest text-white">Regresar</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white pb-24 relative overflow-x-hidden">
            {/* HUD Layers */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[100px]" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px]" />
            </div>

            {/* HEADER */}
            <div className="bg-zinc-900/80 backdrop-blur-xl border-b border-white/5 py-6 px-8 flex items-center justify-between sticky top-0 z-50">
                <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 border border-white/10"><ChevronLeft size={20} /></button>
                <div className="text-right">
                    <p className="text-[10px] font-black uppercase text-cyan-400 tracking-[0.25em]">Terminal de Comerciante</p>
                    <p className="text-[8px] font-bold text-white/30 uppercase tracking-widest">{townId.toUpperCase()}</p>
                </div>
            </div>

            <div className="max-w-md mx-auto p-8 relative z-10 space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
                
                {/* CLIENT PROFILE CARD */}
                <div className="bg-zinc-900 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl" />
                    
                    <div className="flex items-center gap-6 mb-8">
                        <div className="w-20 h-20 rounded-full border-2 border-cyan-500/30 p-1 relative overflow-hidden bg-white/5 shadow-inner">
                            {client.photo ? (
                                <img src={client.photo} className="w-full h-full object-cover rounded-full" alt={client.name} />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center opacity-20">
                                   <User size={40} className="text-cyan-400" />
                                </div>
                            )}
                        </div>
                        <div>
                            <h2 className="text-2xl font-[1000] text-white uppercase tracking-tighter leading-none mb-2">{client.name}</h2>
                            <div className="flex items-center gap-2 text-cyan-400 font-black text-[10px] uppercase tracking-widest bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
                                <CheckCircle size={10} /> SOCIO VIP VERIFICADO
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                            <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Membresía</p>
                            <p className="text-[13px] font-black text-white/70 tracking-tighter">{client.dni || "PENDIENTE"}</p>
                        </div>
                        <div className="bg-cyan-500/5 rounded-2xl p-4 border border-cyan-500/10">
                            <p className="text-[8px] font-black text-cyan-400/30 uppercase tracking-widest mb-1">Saldo Créditos</p>
                            <p className="text-[20px] font-[1000] text-cyan-400 tabular-nums">{client.credits || 0}</p>
                        </div>
                    </div>
                </div>

                {/* TRANSACTION FORM */}
                <form onSubmit={handleTransaction} className="space-y-6">
                    <div className="space-y-4">
                        <div className="group">
                            <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] mb-2 ml-1 flex items-center gap-2">
                                <Store size={12} /> Local / Comercio
                            </label>
                            <select 
                                required
                                value={selectedShopId}
                                onChange={(e) => setSelectedShopId(e.target.value)}
                                className="w-full bg-zinc-900 border border-white/10 rounded-2xl p-4 text-sm font-black text-white focus:border-cyan-500/50 outline-none appearance-none cursor-pointer"
                            >
                                <option value="" disabled>Seleccione Su Comercio</option>
                                {shopsInTown.map(shop => (
                                    <option key={shop.id} value={shop.id}>{shop.name} ({shop.zone})</option>
                                ))}
                            </select>
                        </div>

                        <div className="group">
                            <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] mb-2 ml-1 flex items-center gap-2">
                                <Wallet size={12} /> Monto a Descontar
                            </label>
                            <div className="relative">
                                <input 
                                    required
                                    type="number"
                                    placeholder="0"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full bg-zinc-900 border border-white/10 rounded-2xl p-4 text-[24px] font-[1000] text-cyan-400 placeholder:text-white/5 focus:border-cyan-500/50 outline-none tabular-nums"
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-white/20 uppercase tracking-widest">CRÉDITOS</div>
                            </div>
                        </div>
                    </div>

                    {/* STATUS FEEDBACK */}
                    {status === 'success' && (
                        <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-2xl flex items-center gap-4 animate-in zoom-in duration-300">
                            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-black shadow-lg shadow-green-500/40">
                                <CheckCircle size={24} />
                            </div>
                            <div>
                                <p className="text-[11px] font-[1000] text-green-400 uppercase tracking-widest">Pago Autorizado</p>
                                <p className="text-[9px] font-bold text-white/50 uppercase tracking-widest">Saldos actualizados en tiempo real.</p>
                            </div>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-2xl flex items-center gap-4 animate-in shake duration-300">
                            <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white">
                                <XCircle size={24} />
                            </div>
                            <div>
                                <p className="text-[11px] font-[1000] text-red-500 uppercase tracking-widest">Operación Fallida</p>
                                <p className="text-[9px] font-bold text-white/50 uppercase tracking-widest">{errorMessage}</p>
                            </div>
                        </div>
                    )}

                    <button 
                        type="submit"
                        disabled={isProcessing || !amount || !selectedShopId || status === 'success'}
                        className="w-full h-20 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-30 disabled:grayscale rounded-3xl flex flex-col items-center justify-center gap-1 font-black uppercase tracking-[0.2em] text-[12px] shadow-[0_10px_30px_rgba(34,211,238,0.3)] active:scale-95 transition-all text-white border border-white/20"
                    >
                        {isProcessing ? (
                            <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <ArrowDownRight size={22} className="opacity-70" />
                                <span>Confirmar Descuento</span>
                            </>
                        )}
                    </button>

                    {status === 'success' && (
                        <button 
                            type="button"
                            onClick={() => setStatus('idle')}
                            className="w-full h-14 rounded-2xl bg-white/5 border border-white/10 text-white/40 font-black uppercase tracking-widest text-[9px] transition-all active:scale-95"
                        >
                            Nueva Transacción
                        </button>
                    )}
                </form>

                <p className="text-[7.5px] text-center text-white/20 uppercase tracking-[0.4em] font-black leading-relaxed px-8">
                    Esta terminal es para uso exclusivo de comercios autorizados. <br/>
                    Todas las transacciones son registradas bajo seguridad Blockchain.
                </p>
            </div>

            <style dangerouslySetInnerHTML={{__html: `
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-8px); }
                    75% { transform: translateX(8px); }
                }
                .shake { animation: shake 0.3s ease-in-out; }
            `}} />
        </div>
    );
};

export default ClientValidationPage;
