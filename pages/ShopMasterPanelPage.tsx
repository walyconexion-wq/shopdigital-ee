import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
    Store, Megaphone, CreditCard, Users, ChevronLeft, 
    Image as ImageIcon, Share2, PlusCircle, ShieldCheck, Zap
} from 'lucide-react';
import { playNeonClick } from '../utils/audio';
import { Shop } from '../types';
import { suscribirseAComercios, db } from '../firebase';
import { doc, updateDoc, arrayUnion, arrayRemove, collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';

const ShopMasterPanelPage: React.FC = () => {
    const { townId } = useParams<{ townId: string }>();
    const navigate = useNavigate();

    // Contexto de autenticación & Comercios (Simulación para Fase 1)
    const [allShops, setAllShops] = useState<Shop[]>([]);
    const [myShops, setMyShops] = useState<Shop[]>([]);
    const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
    const [newEmail, setNewEmail] = useState('');
    const [creditLogs, setCreditLogs] = useState<any[]>([]);
    const [logSearchQuery, setLogSearchQuery] = useState('');

    const todayLogs = creditLogs.filter(log => {
        const logDate = new Date(log.date);
        const today = new Date();
        return logDate.getDate() === today.getDate() && 
               logDate.getMonth() === today.getMonth() && 
               logDate.getFullYear() === today.getFullYear();
    });

    const totalLoadedToday = todayLogs.filter(l => l.type === 'load').reduce((acc, curr) => acc + (curr.amount || 0), 0);
    const totalSpentToday = todayLogs.filter(l => l.type === 'spend').reduce((acc, curr) => acc + (curr.amount || 0), 0);

    useEffect(() => {
        const unsub = suscribirseAComercios((shops) => {
            setAllShops(shops);
            // Simulación: Si hubiera login, acá filtramos por user.email
            // Por ahora mostramos los primeros 3 para poder testear la interfaz
            const dummyMyShops = shops.slice(0, 3);
            setMyShops(dummyMyShops);
            if (dummyMyShops.length > 0 && !selectedShop) {
                setSelectedShop(dummyMyShops[0]);
            }
        }, townId);
        return () => unsub();
    }, [townId]);

    useEffect(() => {
        if (!selectedShop?.id) {
            setCreditLogs([]);
            return;
        }

        const logsRef = collection(db, `comercios/${selectedShop.id}/credit_logs`);
        const q = query(logsRef, orderBy('date', 'desc'), limit(50));
        
        const unsubLogs = onSnapshot(q, (snapshot) => {
            const logsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setCreditLogs(logsData);
        }, (err) => console.error(err));

        return () => unsubLogs();
    }, [selectedShop?.id]);

    const hexToRgba = (hex: string, alpha: number) => {
        try {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        } catch { return `rgba(6, 182, 212, ${alpha})`; }
    };

    const CYAN = '#06b6d4';
    const textTheme = 'text-cyan-400';
    const borderTheme = 'border-cyan-500/30';
    const glowTheme = `0 0 20px ${hexToRgba(CYAN, 0.3)}`;

    const handleAddEmail = async () => {
        playNeonClick();
        if (!newEmail || !selectedShop) return;
        const emailToAdd = newEmail.trim().toLowerCase();
        try {
            const shopRef = doc(db, 'comercios', selectedShop.id);
            await updateDoc(shopRef, {
                authorizedStaff: arrayUnion(emailToAdd)
            });
            alert(`✅ GMAIL Autorizado: ${emailToAdd} podrá operar tu POSNET y Tablero de Marketing.`);
            setNewEmail('');
        } catch (error) {
            console.error("Error al autorizar:", error);
            alert("❌ Hubo un error. Intenta nuevamente.");
        }
    };

    const handleRemoveEmail = async (emailToRemove: string) => {
        playNeonClick();
        if (!selectedShop) return;
        if (window.confirm(`¿Estás seguro de revocar el acceso a ${emailToRemove}?`)) {
            try {
                const shopRef = doc(db, 'comercios', selectedShop.id);
                await updateDoc(shopRef, {
                    authorizedStaff: arrayRemove(emailToRemove)
                });
            } catch (error) {
                console.error("Error al revocar:", error);
            }
        }
    };

    const handleSharePosnet = () => {
        playNeonClick();
        if (!selectedShop) return;
        const appUrl = window.location.origin;
        const posnetUrl = `${appUrl}/${townId}/mi-comercio/posnet-virtual`;
        const shareText = `*POSNET VIRTUAL - ${selectedShop.name}*\n\nAcceso a la terminal de cobro para personal autorizado:\n👉 ${posnetUrl}`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white pb-24 relative overflow-hidden font-sans selection:bg-cyan-500/30">
            {/* Background Cyber-Shop */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] rounded-full blur-[120px] opacity-40" style={{ backgroundColor: hexToRgba(CYAN, 0.15) }} />
                <div className="absolute bottom-[-100px] left-[-100px] w-[500px] h-[500px] rounded-full blur-[120px] opacity-40" style={{ backgroundColor: hexToRgba(CYAN, 0.05) }} />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:30px_30px]" />
            </div>

            {/* Header */}
            <div className="bg-black/80 backdrop-blur-xl pt-10 pb-6 px-6 flex flex-col items-center border-b mb-6 sticky top-0 z-50 shadow-2xl" style={{ borderColor: hexToRgba(CYAN, 0.2) }}>
                <button onClick={() => { playNeonClick(); navigate(`/${townId}/home`); }}
                    className="self-start mb-4 w-10 h-10 rounded-2xl flex items-center justify-center border transition-all active:scale-95"
                    style={{ backgroundColor: hexToRgba(CYAN, 0.1), borderColor: hexToRgba(CYAN, 0.3), color: CYAN }}>
                    <ChevronLeft size={20} />
                </button>
                
                {/* Selector de Comercio si tiene varios */}
                {myShops.length > 1 ? (
                    <select 
                        value={selectedShop?.id || ''}
                        onChange={(e) => setSelectedShop(myShops.find(s => s.id === e.target.value) || null)}
                        className="bg-black/50 border border-cyan-500/30 text-cyan-400 font-black uppercase tracking-widest text-[12px] py-2 px-4 rounded-xl outline-none text-center mb-3 appearance-none shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                    >
                        {myShops.map(s => <option key={s.id} value={s.id}>{s.name || 'Mi Comercio'}</option>)}
                    </select>
                ) : (
                    <h1 className="text-[20px] font-[1000] text-white uppercase tracking-[0.2em] text-center drop-shadow-md mb-2">
                        {selectedShop?.name || "Panel Maestro"}
                    </h1>
                )}
                
                <p className={`text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 ${textTheme}`}>
                    <ShieldCheck size={12} /> Autogestión Cyber-Shop
                </p>
            </div>

            <div className="px-5 space-y-6 relative z-10 max-w-lg mx-auto">

                {/* ─── 📦 ESTACIÓN DE OPERACIONES (VIDRIERA) ─── */}
                <section className="animate-in slide-in-from-bottom-4 duration-500 fade-in delay-100">
                    <h2 className="text-[10px] font-black text-white/50 uppercase tracking-[0.3em] mb-4 flex items-center gap-2 border-b border-white/5 pb-2">
                        <Store size={14} className={textTheme} /> Operaciones de Vidriera
                    </h2>
                    <div 
                        role="button" tabIndex={0}
                        onClick={() => { playNeonClick(); alert("Te llevaría al Editor Express (Carrusel)"); }} 
                        className={`w-full bg-gradient-to-r from-cyan-600/20 to-blue-600/20 text-white p-5 rounded-2xl font-[1000] uppercase tracking-widest shadow-lg border border-cyan-500/40 hover:bg-cyan-500/10 active:scale-95 transition-all flex flex-col items-center justify-center gap-2 group cursor-pointer`}
                    >
                        <div className="flex items-center gap-3">
                            <ImageIcon size={22} className="text-cyan-400 group-hover:scale-110 transition-transform" />
                            <span className="text-[15px]">Editar Mi Vidriera</span>
                        </div>
                        <span className="text-[8px] text-cyan-200/60 lowercase font-bold tracking-wider">
                            Carrusel express, banners y precios (En dos clicks)
                        </span>
                    </div>
                </section>

                {/* ─── 📢 ESTACIÓN DE MARKETING (BOT) ─── */}
                <section className="animate-in slide-in-from-bottom-4 duration-500 fade-in delay-200">
                    <h2 className="text-[10px] font-black text-white/50 uppercase tracking-[0.3em] mb-4 flex items-center gap-2 border-b border-white/5 pb-2">
                        <Megaphone size={14} className={textTheme} /> Campañas y Bot
                    </h2>
                    <div className="grid grid-cols-2 gap-3">
                        <div 
                            role="button" tabIndex={0}
                            onClick={() => { playNeonClick(); alert("Llamada al Bot Marketing"); }} 
                            className="bg-black/50 border border-pink-500/40 p-4 rounded-2xl shadow-[0_0_20px_rgba(236,72,153,0.15)] flex flex-col items-center justify-center gap-2 hover:bg-pink-500/10 active:scale-95 transition-all cursor-pointer group"
                        >
                            <Zap size={24} className="text-pink-400 group-hover:animate-pulse" />
                            <span className="text-[11px] font-[1000] text-white uppercase tracking-widest text-center leading-tight">Impulso<br/>Relámpago</span>
                            <span className="text-[7px] text-pink-400/70 border border-pink-500/30 px-2 py-0.5 rounded-full mt-1">Disparar Oferta</span>
                        </div>
                        
                        <div 
                            role="button" tabIndex={0}
                            onClick={() => { playNeonClick(); navigate(`/${townId}/${selectedShop?.category || 'x'}/${selectedShop?.slug || 'x'}/credencial`); }} 
                            className={`bg-gradient-to-br from-cyan-600/30 to-blue-600/30 border border-cyan-500/40 p-4 rounded-2xl shadow-lg flex flex-col items-center justify-center gap-2 hover:to-cyan-600/40 active:scale-95 transition-all cursor-pointer group`}
                        >
                            <Share2 size={24} className="text-cyan-400 group-hover:rotate-12 transition-transform" />
                            <span className="text-[11px] font-[1000] text-white uppercase tracking-widest text-center leading-tight">Viralizar<br/>Mi QR</span>
                            <span className="text-[7px] text-cyan-200/70 border border-cyan-500/30 px-2 py-0.5 rounded-full mt-1">Status/Instagram</span>
                        </div>
                    </div>
                </section>

                {/* ─── 💳 ESTACIÓN FINANCIERA (POSNET) ─── */}
                <section className="animate-in slide-in-from-bottom-4 duration-500 fade-in delay-300">
                    <h2 className="text-[10px] font-black text-white/50 uppercase tracking-[0.3em] mb-4 flex items-center gap-2 border-b border-white/5 pb-2">
                        <CreditCard size={14} className={textTheme} /> Transacciones
                    </h2>
                    
                    {/* Mini Tarjeta del Comercio */}
                    <div className="bg-gradient-to-tr from-zinc-900 to-black border border-white/10 rounded-2xl p-4 mb-3 relative overflow-hidden flex items-center gap-4">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-[40px] pointer-events-none" />
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-black/50 border border-cyan-500/30 shrink-0">
                            {selectedShop?.image ? (
                                <img src={selectedShop.image} alt="Shop" className="w-full h-full object-cover" />
                            ) : (
                                <Store size={20} className="text-cyan-500/40 m-auto mt-4" />
                            )}
                        </div>
                        <div className="flex-1">
                            <h3 className="text-[14px] font-black uppercase text-white truncate">{selectedShop?.name || 'Comercio B2C'}</h3>
                            <p className="text-[9px] text-cyan-400 tracking-widest uppercase">ID: #{selectedShop?.id?.slice(0,6) || '000000'}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-4 gap-3">
                        <div 
                            role="button" tabIndex={0}
                            onClick={() => { playNeonClick(); navigate(`/${townId}/mi-comercio/posnet-virtual`); }} 
                            className={`col-span-3 w-full bg-cyan-500 text-black p-4 rounded-2xl font-[1000] uppercase tracking-[0.2em] shadow-[0_0_25px_rgba(6,182,212,0.3)] hover:bg-cyan-400 active:scale-95 transition-all justify-center flex items-center gap-2 cursor-pointer`}
                        >
                            <CreditCard size={18} />
                            <span className="text-[13px]">POSNET VIRTUAL</span>
                        </div>
                        <div 
                            role="button" tabIndex={0}
                            onClick={handleSharePosnet}
                            className="col-span-1 w-full bg-transparent border border-cyan-500/40 text-cyan-400 rounded-2xl flex flex-col items-center justify-center hover:bg-cyan-500/10 active:scale-95 transition-all cursor-pointer"
                        >
                            <Share2 size={20} className="mb-1" />
                            <span className="text-[7px] font-black uppercase tracking-widest">Compartir</span>
                        </div>
                    </div>
                </section>

                {/* ─── 👥 RECURSOS HUMANOS (EQUIPO) ─── */}
                <section className="animate-in slide-in-from-bottom-4 duration-500 fade-in delay-500">
                    <h2 className="text-[10px] font-black text-white/50 uppercase tracking-[0.3em] mb-4 flex items-center gap-2 border-b border-white/5 pb-2">
                        <Users size={14} className={textTheme} /> Gestión de Equipo
                    </h2>
                    <div className="bg-black/60 border border-white/10 rounded-2xl p-5">
                        <p className="text-[9px] text-white/60 mb-4 leading-relaxed">
                            Autorizá a tus empleados (cajeras, vendedores) a usar el POSNET y el Panel de Marketing con sus propios correos, sin darles tu contraseña master.
                        </p>
                        <div className="flex gap-2">
                            <div className="flex-1 bg-white/5 border border-white/10 rounded-xl flex items-center px-3 focus-within:border-cyan-500/50 transition-colors">
                                <Users size={14} className="text-white/40" />
                                <input 
                                    type="email" 
                                    placeholder="empleado@gmail.com" 
                                    value={newEmail}
                                    onChange={e => setNewEmail(e.target.value)}
                                    className="w-full bg-transparent text-[11px] text-white px-2 py-3 outline-none" 
                                />
                            </div>
                            <button 
                                onClick={handleAddEmail}
                                className={`w-12 rounded-xl flex items-center justify-center transition-all bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500 hover:text-black`}
                            >
                                <PlusCircle size={18} />
                            </button>
                        </div>

                        {/* Empleados Reales */}
                        <div className="mt-4 space-y-2">
                            {selectedShop?.authorizedStaff && selectedShop.authorizedStaff.length > 0 ? (
                                selectedShop.authorizedStaff.map((email: string) => (
                                    <div key={email} className="flex items-center justify-between bg-white/[0.02] border border-white/5 py-2 px-3 rounded-lg">
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[10px] font-bold text-white truncate">{email}</p>
                                            <p className="text-[7px] text-green-400 uppercase tracking-widest">Activo · POSNET Y MARKETING</p>
                                        </div>
                                        <button 
                                            onClick={() => handleRemoveEmail(email)}
                                            className="text-[8px] bg-red-500/20 text-red-400 px-2 py-1 rounded hover:bg-red-500/40 active:scale-95 transition-all"
                                        >
                                            Revocar
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p className="text-[8px] text-white/30 text-center uppercase tracking-widest py-2">
                                    No hay empleados autorizados
                                </p>
                            )}
                        </div>
                    </div>
                </section>

                {/* ─── 🕵️‍♂️ AUDITORÍA Y TRAZABILIDAD (MÓDULO ANTI-FRAUDE) ─── */}
                <section className="animate-in slide-in-from-bottom-4 duration-500 fade-in delay-600">
                    <h2 className="text-[10px] font-black text-red-500/80 uppercase tracking-[0.3em] mb-4 flex items-center gap-2 border-b border-red-500/10 pb-2">
                        <ShieldCheck size={14} className="text-red-500" /> Libro de Guardia (Auditoría)
                    </h2>
                    
                    <div className="bg-black/60 border border-white/10 rounded-2xl p-5 overflow-hidden">
                        <div className="flex items-center gap-2 mb-4 bg-white/5 border border-white/10 rounded-xl px-3 focus-within:border-red-500/50 transition-colors">
                            <Search size={14} className="text-white/40" />
                            <input 
                                type="text" 
                                placeholder="Filtrar DNI o Credencial..." 
                                value={logSearchQuery}
                                onChange={e => setLogSearchQuery(e.target.value)}
                                className="w-full bg-transparent text-[10px] text-white px-2 py-3 outline-none" 
                            />
                        </div>

                        {/* MÉTRICAS EXPRESS DEL DÍA */}
                        <div className="grid grid-cols-2 gap-2 mb-4">
                            <div className="bg-green-500/5 border border-green-500/10 p-3 rounded-xl flex flex-col pt-4 relative overflow-hidden">
                                <ArrowUpRight size={30} className="absolute -top-1 -right-1 text-green-500/20" />
                                <span className="text-[7px] font-black uppercase tracking-widest text-green-400 mb-1">Cargados (Hoy)</span>
                                <span className="text-[18px] font-[1000] text-white">{totalLoadedToday} <span className="text-[9px] text-white/30 tracking-widest">CRÉD</span></span>
                            </div>
                            <div className="bg-cyan-500/5 border border-cyan-500/10 p-3 rounded-xl flex flex-col pt-4 relative overflow-hidden">
                                <ArrowDownRight size={30} className="absolute -top-1 -right-1 text-cyan-500/20" />
                                <span className="text-[7px] font-black uppercase tracking-widest text-cyan-400 mb-1">Descontados (Hoy)</span>
                                <span className="text-[18px] font-[1000] text-white">{totalSpentToday} <span className="text-[9px] text-white/30 tracking-widest">CRÉD</span></span>
                            </div>
                        </div>
                        
                        <div className="max-h-60 overflow-y-auto pr-1 no-scrollbar space-y-2">
                            {creditLogs
                                .filter(log => !logSearchQuery || (log.clientId || '').toLowerCase().includes(logSearchQuery.toLowerCase()))
                                .map(log => (
                                <div key={log.id} className="flex flex-col bg-white/[0.02] border border-white/5 p-3 rounded-lg hover:border-white/20 transition-colors">
                                    <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/5">
                                        <div className="flex items-center gap-1.5">
                                            {log.type === 'load' ? (
                                                <div className="bg-green-500/20 text-green-400 p-1 rounded"><ArrowUpRight size={10} /></div>
                                            ) : (
                                                <div className="bg-cyan-500/20 text-cyan-400 p-1 rounded"><ArrowDownRight size={10} /></div>
                                            )}
                                            <span className={`text-[12px] font-[1000] ${log.type === 'load' ? 'text-green-400' : 'text-cyan-400'}`}>
                                                {log.type === 'load' ? '+' : '-'}{log.amount}
                                            </span>
                                        </div>
                                        <span className="text-[8px] text-white/40 font-bold uppercase tracking-wider">
                                            {new Date(log.date).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-[9px] uppercase tracking-widest text-white/50">
                                        <div className="flex items-center gap-1">
                                            <User size={10} className="text-red-400/70" /> 
                                            <span className="truncate max-w-[100px]">{log.operatorEmail}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="truncate max-w-[80px]">Destino: {log.clientId?.slice(0,8) || 'Desconocido'}</span>
                                        </div>
                                    </div>
                                    <p className="text-[8px] text-white/30 italic mt-2">Detalle: {log.description}</p>
                                </div>
                            ))}
                            {creditLogs.length === 0 && (
                                <p className="text-[9px] text-center text-white/30 uppercase tracking-widest py-6">No hay registros de auditoría aún.</p>
                            )}
                        </div>
                    </div>
                </section>
            </div>
            
            {/* Footer */}
            <footer className={`w-full flex-col flex items-center gap-2 pt-8 pb-6 mt-8 border-t border-white/5 relative z-10`}>
                <p className={`text-[10px] font-black uppercase tracking-[0.35em] text-center select-none ${textTheme}`}>
                    ShopDigital B2C
                </p>
                <p className={`text-[8px] font-bold text-white/40 uppercase tracking-[0.25em] select-none`}>
                    Gerente Administrativo Inteligente
                </p>
            </footer>
        </div>
    );
};

export default ShopMasterPanelPage;
