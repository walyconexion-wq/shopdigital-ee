import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Shop, Client, LiveEvent } from '../types';
import { db, actualizarEntradaCliente, guardarEvento } from '../firebase';
import { doc, getDoc, collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { 
    ChevronLeft, Ticket, Calendar, Clock, User, IdCard, 
    CreditCard, ShieldCheck, Sparkles, Coins, Gift, CheckCircle2 
} from 'lucide-react';
import { playNeonClick, playSuccessSound } from '../utils/audio';

interface EventLandingPageProps {
    allShops: Shop[];
}

const EventLandingPage: React.FC<EventLandingPageProps> = ({ allShops }) => {
    const { townId = 'esteban-echeverria', eventId } = useParams<{ townId: string, eventId: string }>();
    const navigate = useNavigate();

    const [event, setEvent] = useState<LiveEvent | null>(null);
    const [loading, setLoading] = useState(true);

    // Form fields
    const [name, setName] = useState('');
    const [dni, setDni] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [seatSector, setSeatSector] = useState('Platea Central');
    
    // B2B discount state
    const [b2bGmail, setB2bGmail] = useState('');
    const [isB2bVerified, setIsB2bVerified] = useState(false);
    const [verifiedShopName, setVerifiedShopName] = useState('');

    // Payment/Submit States
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [createdClientId, setCreatedClientId] = useState('');

    // Load event details
    useEffect(() => {
        const fetchEvent = async () => {
            if (!eventId) return;
            try {
                const docRef = doc(db, 'eventos_live', eventId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setEvent({ id: docSnap.id, ...docSnap.data() } as LiveEvent);
                }
            } catch (err) {
                console.error("Error fetching event:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [eventId]);

    // Validate B2B Gmail
    const handleVerifyB2b = () => {
        playNeonClick();
        const normalized = b2bGmail.trim().toLowerCase();
        if (!normalized) {
            alert('Por favor ingresá tu Gmail.');
            return;
        }

        // Search in active shops
        const matchingShop = allShops.find(s => 
            s.gmail?.trim().toLowerCase() === normalized && 
            s.isActive
        );

        if (matchingShop) {
            setIsB2bVerified(true);
            setVerifiedShopName(matchingShop.name);
            setEmail(normalized); // Auto-fill checkout email
            playSuccessSound();
        } else {
            setIsB2bVerified(false);
            alert('⚠️ El Gmail ingresado no se encuentra en la base de datos de comercios ACTIVOS.');
        }
    };

    // Cost calculations
    const basePrice = 25000;
    const finalPrice = isB2bVerified ? 0 : basePrice;

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !dni.trim() || !phone.trim() || !email.trim()) {
            alert('⚠️ Por favor completa todos los campos del formulario.');
            return;
        }

        setIsProcessing(true);
        playNeonClick();

        try {
            // 1. Search for existing client with this email or phone
            let clientIdToUse = '';
            const clientsRef = collection(db, 'clientes');
            const q = query(clientsRef, where('email', '==', email.trim().toLowerCase()));
            const qSnap = await getDocs(q);

            const fila = Math.floor(Math.random() * 10) + 1;
            const asiento = Math.floor(Math.random() * 20) + 1;

            const ticketData = {
                eventId: event?.id || eventId || '',
                eventName: event?.name || 'Recital',
                date: event?.dateStr || '',
                time: event?.timeStr || '',
                seatSector,
                fila: fila.toString(),
                asiento: asiento.toString(),
                status: 'active' as const,
                pricePaid: finalPrice
            };

            if (!qSnap.empty) {
                // Existing client found
                const clientDoc = qSnap.docs[0];
                clientIdToUse = clientDoc.id;
                // Update active ticket
                await actualizarEntradaCliente(clientIdToUse, ticketData);
            } else {
                // Create new client document
                const newClientRef = await addDoc(clientsRef, {
                    name: name.trim(),
                    dni: dni.trim(),
                    phone: phone.trim(),
                    email: email.trim().toLowerCase(),
                    sourceShopId: isB2bVerified ? 'b2b-onboarding' : 'event-landing',
                    sourceShopName: isB2bVerified ? verifiedShopName : 'ShopDigital Live',
                    createdAt: new Date().toISOString(),
                    townId,
                    cardColor: '#22d3ee',
                    status: 'active',
                    points: 0,
                    credits: 0,
                    activeTicket: ticketData
                });
                clientIdToUse = newClientRef.id;
            }

            playSuccessSound();
            setCreatedClientId(clientIdToUse);
            setPaymentSuccess(true);
        } catch (err) {
            console.error("Error in checkout simulation:", err);
            alert("Error al procesar la compra.");
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-t-2 border-cyan-400 rounded-full animate-spin shadow-[0_0_15px_rgba(34,211,238,0.3)]" />
                    <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest animate-pulse">Sintonizando Evento...</span>
                </div>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
                <ShieldCheck size={64} className="text-red-500 mb-4 animate-pulse" />
                <h1 className="text-xl font-black text-white uppercase tracking-widest">Evento No Encontrado</h1>
                <p className="text-xs text-white/40 mt-2">El recital solicitado no existe o ya ha finalizado.</p>
                <button onClick={() => navigate(-1)} className="mt-8 px-6 py-3 bg-white/10 rounded-xl text-xs uppercase font-bold tracking-widest">
                    Volver
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white pb-24 relative overflow-hidden selection:bg-cyan-500/30">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[150px]" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[150px]" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] opacity-30" />
            </div>

            {/* Header */}
            <div className="bg-zinc-950/80 backdrop-blur-xl border-b border-white/5 pt-10 pb-6 px-6 flex items-center gap-4 sticky top-0 z-50">
                <button onClick={() => { playNeonClick(); navigate(-1); }} 
                    className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-white border border-white/10 hover:bg-white/10 transition-all">
                    <ChevronLeft size={20} />
                </button>
                <div>
                    <h2 className="text-[12px] font-black text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                        <Ticket size={14} /> ShopDigital Live
                    </h2>
                    <p className="text-[10px] font-bold text-white/50 tracking-wider">Adquisición de Entradas</p>
                </div>
            </div>

            {paymentSuccess ? (
                /* SUCCESS SCREEN */
                <div className="max-w-md mx-auto px-6 mt-16 text-center animate-in zoom-in duration-500 relative z-10">
                    <div className="w-20 h-20 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_35px_rgba(34,197,94,0.3)]">
                        <CheckCircle2 size={40} className="text-green-400 animate-bounce" />
                    </div>
                    
                    <h2 className="text-2xl font-[1000] text-white uppercase tracking-tighter mb-2">¡Compra Confirmada!</h2>
                    <p className="text-xs text-white/50 leading-relaxed mb-8">
                        Tus pases VIP de acceso han sido registrados en nuestro sistema de forma exitosa. Se asignó automáticamente tu ubicación.
                    </p>

                    {/* Ticket details card */}
                    <div className="bg-zinc-950/80 border border-cyan-500/20 rounded-[2rem] p-6 text-left mb-10 shadow-[0_0_20px_rgba(6,182,212,0.05)]">
                        <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest block mb-2">Pase Digital de Acceso</span>
                        <h4 className="text-md font-black text-white uppercase tracking-wide mb-4">{event.name}</h4>
                        
                        <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
                            <div>
                                <span className="text-[8px] font-black text-white/30 uppercase tracking-widest block">Sector</span>
                                <span className="text-xs font-bold text-white/80">{seatSector}</span>
                            </div>
                            <div>
                                <span className="text-[8px] font-black text-white/30 uppercase tracking-widest block">Fila / Asiento</span>
                                <span className="text-xs font-bold text-cyan-400 font-mono">Fila {Math.floor(Math.random()*10)+1} · Asiento {Math.floor(Math.random()*20)+1}</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            playNeonClick();
                            navigate(`/${townId}/cliente/${createdClientId}/credencial`);
                        }}
                        className="w-full bg-gradient-to-r from-cyan-400 to-indigo-500 hover:from-cyan-300 hover:to-indigo-400 text-black font-black uppercase tracking-[0.2em] py-5 rounded-2xl active:scale-95 transition-all shadow-[0_0_25px_rgba(6,182,212,0.25)]"
                    >
                        Ver Mi Credencial Live 🪪
                    </button>
                </div>
            ) : (
                /* LANDING & FORM */
                <div className="max-w-md mx-auto px-6 mt-8 space-y-8 relative z-10">
                    
                    {/* Event Banner */}
                    <div className="bg-gradient-to-br from-cyan-500/10 to-indigo-600/15 border border-cyan-500/30 rounded-[2.5rem] p-6 shadow-[0_0_40px_rgba(6,182,212,0.1)]">
                        <div className="flex items-center gap-2 mb-4 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-400/20 w-fit">
                            <Ticket size={12} className="text-cyan-400 animate-pulse" />
                            <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest">EVENTO EXCLUSIVO</span>
                        </div>

                        <h3 className="text-2xl font-[1000] text-white uppercase tracking-tighter leading-tight mb-2">
                            {event.name}
                        </h3>
                        {event.artist && (
                            <p className="text-xs font-black text-cyan-400 uppercase tracking-wider mb-4">
                                {event.artist}
                            </p>
                        )}

                        <div className="flex flex-col gap-2 border-t border-white/5 pt-4 text-xs text-white/60">
                            <div className="flex items-center gap-2">
                                <Calendar size={14} className="text-cyan-400" />
                                <span>Fecha: {event.dateStr}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock size={14} className="text-cyan-400 animate-pulse" />
                                <span>Hora: {event.timeStr} HS</span>
                            </div>
                        </div>
                    </div>

                    {/* B2B MERCHANT DISCOUNT BOX */}
                    <div className="bg-zinc-950/60 border border-yellow-500/20 rounded-[2rem] p-6 relative overflow-hidden shadow-[0_0_30px_rgba(251,191,36,0.02)]">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/5 rounded-full blur-[30px]" />
                        
                        <div className="flex items-center gap-2.5 mb-4">
                            <Gift size={18} className="text-yellow-400" />
                            <h4 className="text-[11px] font-black text-yellow-400 uppercase tracking-[0.2em]">Descuento Socio Comercial</h4>
                        </div>

                        {isB2bVerified ? (
                            <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-xl flex flex-col gap-1.5 animate-in fade-in">
                                <span className="text-[10px] font-black text-yellow-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <CheckCircle2 size={12} /> Comercio Verificado
                                </span>
                                <p className="text-[11px] text-white/80 font-bold uppercase tracking-wide">
                                    {verifiedShopName}
                                </p>
                                <p className="text-[9px] text-white/50 uppercase tracking-widest">
                                    Beneficio del 100% aplicado. Costo de entrada: $0 (Gratis)
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <p className="text-[10px] text-white/40 leading-relaxed uppercase tracking-wide">
                                    Si sos propietario de un comercio activo registrado en la red de ShopDigital, ingresá tu Gmail de acceso para obtener tu entrada gratis.
                                </p>
                                <div className="flex gap-2">
                                    <input
                                        type="email"
                                        value={b2bGmail}
                                        onChange={e => setB2bGmail(e.target.value)}
                                        placeholder="Tu Gmail corporativo"
                                        className="flex-1 bg-black border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-yellow-500/50"
                                    />
                                    <button
                                        onClick={handleVerifyB2b}
                                        className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/30 rounded-xl px-4 text-xs font-black uppercase tracking-wider transition-all active:scale-95"
                                    >
                                        Validar
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* CHECKOUT FORM */}
                    <form onSubmit={handleCheckout} className="bg-zinc-950/40 border border-white/5 rounded-[2rem] p-6 space-y-5">
                        <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] border-b border-white/5 pb-2 mb-2">Formulario de Registro</h4>

                        <div className="space-y-1">
                            <label className="text-[8px] font-black text-white/40 uppercase tracking-widest block ml-2">Nombre y Apellido *</label>
                            <input
                                required
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="Ej: Juan Pérez"
                                className="w-full bg-zinc-900 border border-white/10 rounded-2xl px-4 py-3 text-xs focus:outline-none focus:border-cyan-400 transition-colors"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[8px] font-black text-white/40 uppercase tracking-widest block ml-2">DNI / ID *</label>
                                <input
                                    required
                                    value={dni}
                                    onChange={e => setDni(e.target.value)}
                                    placeholder="Ej: 12345678"
                                    className="w-full bg-zinc-900 border border-white/10 rounded-2xl px-4 py-3 text-xs focus:outline-none focus:border-cyan-400 transition-colors"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[8px] font-black text-white/40 uppercase tracking-widest block ml-2">WhatsApp / Celular *</label>
                                <input
                                    required
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                    placeholder="Ej: 1122334455"
                                    className="w-full bg-zinc-900 border border-white/10 rounded-2xl px-4 py-3 text-xs focus:outline-none focus:border-cyan-400 transition-colors"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[8px] font-black text-white/40 uppercase tracking-widest block ml-2">Correo de Notificaciones *</label>
                            <input
                                required
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                disabled={isB2bVerified}
                                placeholder="Ej: usuario@gmail.com"
                                className="w-full bg-zinc-900 border border-white/10 rounded-2xl px-4 py-3 text-xs focus:outline-none focus:border-cyan-400 transition-colors disabled:opacity-50"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[8px] font-black text-white/40 uppercase tracking-widest block ml-2">Sector de Preferencia</label>
                            <select
                                value={seatSector}
                                onChange={e => setSeatSector(e.target.value)}
                                className="w-full bg-zinc-900 border border-white/10 rounded-2xl px-4 py-3 text-xs focus:outline-none focus:border-cyan-400 transition-colors text-white"
                                style={{ color: '#ffffff', backgroundColor: '#18181b' }}
                            >
                                <option value="Platea Central">Platea Central VIP</option>
                                <option value="Platea Lateral">Platea Lateral Preferida</option>
                                <option value="Sector Campo">Campo Delantero</option>
                                <option value="Sector General">Campo General</option>
                            </select>
                        </div>

                        {/* Cost & Checkout button */}
                        <div className="border-t border-white/5 pt-6 space-y-4">
                            <div className="flex justify-between items-center px-2">
                                <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Total a Pagar</span>
                                <span className="text-2xl font-[1000] text-cyan-400 tracking-wider">
                                    {finalPrice === 0 ? 'GRATIS $0 B2B' : `$${finalPrice.toLocaleString('es-AR')}`}
                                </span>
                            </div>

                            {finalPrice > 0 && (
                                <div className="bg-zinc-950/80 p-4 border border-white/10 rounded-2xl space-y-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <CreditCard size={14} className="text-white/40" />
                                        <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">Simulación Pasarela Pago</span>
                                    </div>
                                    <input
                                        placeholder="Número de Tarjeta (16 dígitos)"
                                        className="w-full bg-zinc-900 border border-white/5 rounded-xl px-3 py-2 text-[10px] text-white"
                                        defaultValue="4509 3840 9102 9384"
                                    />
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            placeholder="Vencimiento (MM/AA)"
                                            className="bg-zinc-900 border border-white/5 rounded-xl px-3 py-2 text-[10px] text-white"
                                            defaultValue="12/30"
                                        />
                                        <input
                                            placeholder="CVV (3 dígitos)"
                                            className="bg-zinc-900 border border-white/5 rounded-xl px-3 py-2 text-[10px] text-white"
                                            defaultValue="123"
                                        />
                                    </div>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isProcessing}
                                className="w-full bg-gradient-to-r from-cyan-400 to-indigo-500 hover:from-cyan-300 hover:to-indigo-400 text-black font-black uppercase tracking-[0.2em] py-5 rounded-2xl active:scale-95 transition-all shadow-[0_0_20px_rgba(6,182,212,0.15)] flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isProcessing ? (
                                    <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Sparkles size={16} />
                                        <span>CONFIRMAR Y ADQUIRIR BOLETO</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default EventLandingPage;
