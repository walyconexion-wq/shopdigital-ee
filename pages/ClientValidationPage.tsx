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
        <div className="min-h-screen bg-[#020208] text-white pb-24 relative overflow-x-hidden selection:bg-cyan-500/30">
            {/* HUD Background - Tech Mesh Encendida */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-indigo-500/18 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
                <div className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-cyan-500/18 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '6s' }} />
                <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-purple-500/5 rounded-full blur-[120px]" />
                {/* Tech Grid Mesh */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.12)_1px,transparent_1px)] bg-[size:30px_30px]" />
                {/* Tech Dots Mesh */}
                <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(99,102,241,0.18)_1px,transparent_1.5px)] bg-[size:15px_15px]" />
                {/* Scanline */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/[0.04] to-transparent h-[200%] w-full -translate-y-1/2 animate-[scanner-line_8s_linear_infinite]" />
            </div>

            {/* HEADER */}
            <div className="bg-black/70 backdrop-blur-xl border-b border-cyan-500/20 py-6 px-8 flex items-center justify-between sticky top-0 z-50 shadow-[0_4px_30px_rgba(34,211,238,0.08)]">
                <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20 transition-all active:scale-95"><ChevronLeft size={20} /></button>
                <div className="text-right">
                    <p className="text-[10px] font-black uppercase text-cyan-400 tracking-[0.25em] drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">Terminal de Comerciante</p>
                    <p className="text-[8px] font-bold text-cyan-300/60 uppercase tracking-widest">{townId.toUpperCase()}</p>
                </div>
            </div>

            <div className="max-w-md mx-auto p-8 relative z-10 space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
                
                {/* CLIENT PROFILE CARD */}
                <div className="bg-black/60 border border-cyan-500/20 rounded-[2.5rem] p-8 shadow-[0_0_40px_rgba(34,211,238,0.08),inset_0_0_20px_rgba(99,102,241,0.1)] relative overflow-hidden group backdrop-blur-sm">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/15 rounded-full blur-2xl" />
                    
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
                        <div className="bg-white/8 rounded-2xl p-4 border border-white/15 shadow-[inset_0_0_10px_rgba(255,255,255,0.03)]">
                            <p className="text-[8px] font-black text-cyan-300/70 uppercase tracking-widest mb-1">Membresía</p>
                            <p className="text-[13px] font-black text-white tracking-tighter drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]">{client.dni || "PENDIENTE"}</p>
                        </div>
                        <div className="bg-cyan-500/10 rounded-2xl p-4 border border-cyan-500/25 shadow-[inset_0_0_10px_rgba(34,211,238,0.08)]">
                            <p className="text-[8px] font-black text-cyan-400/80 uppercase tracking-widest mb-1">Saldo Créditos</p>
                            <p className="text-[20px] font-[1000] text-cyan-400 tabular-nums drop-shadow-[0_0_12px_rgba(34,211,238,0.5)]">{client.credits || 0}</p>
                        </div>
                    </div>
                </div>

                {/* TRANSACTION FORM */}
                <form onSubmit={handleTransaction} className="space-y-6">
                    <div className="space-y-4">
                        <div className="group">
                            <label className="text-[9px] font-black text-cyan-300/80 uppercase tracking-[0.3em] mb-2 ml-1 flex items-center gap-2">
                                <Store size={12} className="text-cyan-400" /> Local / Comercio
                            </label>
                            <select 
                                required
                                value={selectedShopId}
                                onChange={(e) => setSelectedShopId(e.target.value)}
                                className="w-full bg-black/60 border border-cyan-500/20 rounded-2xl p-4 text-sm font-black text-white focus:border-cyan-400/60 outline-none appearance-none cursor-pointer shadow-[inset_0_0_10px_rgba(34,211,238,0.05)] backdrop-blur-sm"
                            >
                                <option value="" disabled>Seleccione Su Comercio</option>
                                {shopsInTown.map(shop => (
                                    <option key={shop.id} value={shop.id}>{shop.name} ({shop.zone})</option>
                                ))}
                            </select>
                        </div>

                        <div className="group">
                            <label className="text-[9px] font-black text-cyan-300/80 uppercase tracking-[0.3em] mb-2 ml-1 flex items-center gap-2">
                                <Wallet size={12} className="text-cyan-400" /> Monto a Descontar
                            </label>
                            <div className="relative">
                                <input 
                                    required
                                    type="number"
                                    placeholder="0"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full bg-black/60 border border-cyan-500/20 rounded-2xl p-4 text-[24px] font-[1000] text-cyan-400 placeholder:text-white/15 focus:border-cyan-400/60 outline-none tabular-nums shadow-[inset_0_0_10px_rgba(34,211,238,0.05)] backdrop-blur-sm drop-shadow-[0_0_8px_rgba(34,211,238,0.3)]"
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-cyan-400/60 uppercase tracking-widest">CRÉDITOS</div>
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
                        className="w-full h-20 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 disabled:opacity-30 disabled:grayscale rounded-3xl flex flex-col items-center justify-center gap-1 font-black uppercase tracking-[0.2em] text-[12px] shadow-[0_10px_40px_rgba(34,211,238,0.35),0_0_20px_rgba(99,102,241,0.2)] active:scale-95 transition-all text-white border border-cyan-400/30 relative overflow-hidden group"
                    >
                        {isProcessing ? (
                            <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />
                                <ArrowDownRight size={22} className="opacity-90 drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]" />
                                <span className="drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">Confirmar Descuento</span>
                            </>
                        )}
                    </button>

                    {status === 'success' && (
                        <button 
                            type="button"
                            onClick={() => setStatus('idle')}
                            className="w-full h-14 rounded-2xl bg-cyan-500/8 border border-cyan-500/20 text-cyan-300/70 font-black uppercase tracking-widest text-[9px] transition-all active:scale-95 hover:bg-cyan-500/15"
                        >
                            Nueva Transacción
                        </button>
                    )}
                </form>

                <p className="text-[7.5px] text-center text-cyan-300/50 uppercase tracking-[0.4em] font-black leading-relaxed px-8">
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
                @keyframes scanner-line {
                    0% { transform: translateY(-50%); }
                    100% { transform: translateY(0%); }
                }
            `}} />
        </div>
    );
};

export default ClientValidationPage;
