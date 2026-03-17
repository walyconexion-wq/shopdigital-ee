import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Client } from '../types';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { ShieldCheck, User, Clock, ChevronLeft, Ticket } from 'lucide-react';
import { playNeonClick } from '../utils/audio';
import LoadingScreen from '../components/LoadingScreen';

const ClientCredentialPage: React.FC = () => {
    const { clientId } = useParams<{ clientId: string }>();
    const navigate = useNavigate();
    const [client, setClient] = useState<Client | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Anti-screenshot real-time clock
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchClient = async () => {
            if (!clientId) return;
            try {
                const docRef = doc(db, 'clientes', clientId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setClient({ id: docSnap.id, ...docSnap.data() } as Client);
                }
            } catch (error) {
                console.error("Error fetching client:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchClient();
    }, [clientId]);

    if (loading) return (
        <div className="min-h-screen bg-black z-50 fixed inset-0 flex items-center justify-center">
            <LoadingScreen ready={false} onDone={() => {}} />
        </div>
    );

    if (!client) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
                <ShieldCheck size={64} className="text-red-500 mb-4 animate-pulse" />
                <h1 className="text-2xl font-black text-red-500 uppercase tracking-widest text-center">Credencial Inválida</h1>
                <p className="text-sm text-white/50 text-center mt-2">El pase VIP no existe o fue revocado.</p>
                <button onClick={() => navigate('/')} className="mt-8 px-6 py-2 bg-white/10 rounded-full text-xs uppercase font-bold tracking-widest">
                    Volver al Inicio
                </button>
            </div>
        );
    }

    // Determine color theme based on active pulse
    const validationUrl = `https://shopdigital.tech/cliente/${clientId}/validar`;

    return (
        <div className="min-h-screen bg-black text-white relative flex flex-col items-center pb-24 overflow-hidden selection:bg-cyan-500/30">
            {/* Background Cyber-Neon */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
            </div>

            {/* Header Mini */}
            <div className="w-full max-w-md px-6 pt-8 pb-4 flex items-center justify-between relative z-10">
                <button onClick={() => { playNeonClick(); navigate(-1); }}
                    className="w-10 h-10 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-400/30 shadow-[0_0_15px_rgba(34,211,238,0.2)] hover:bg-cyan-500/20 transition-all">
                    <ChevronLeft size={20} />
                </button>
                <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]">ShopDigital</span>
                    <span className="text-[6px] font-black text-white/50 tracking-[0.3em]">RED COMERCIAL DIGITAL</span>
                </div>
            </div>

            {/* Credential Main Card */}
            <div className="w-full max-w-sm px-5 relative z-10 mt-4 perspective-[1000px]">
                <div className="glass-card-3d bg-zinc-900/60 backdrop-blur-xl border border-cyan-500/30 rounded-[2rem] p-8 flex flex-col items-center relative overflow-hidden shadow-[0_0_50px_rgba(34,211,238,0.15)] transform transition-transform duration-500 hover:rotate-y-2 hover:rotate-x-2">
                    
                    {/* Holographic corner accents */}
                    <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-cyan-400/50 rounded-tl-[2rem]" />
                    <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-cyan-400/50 rounded-br-[2rem]" />
                    <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50" />

                    {/* TOP: Title & Clock */}
                    <div className="flex flex-col items-center w-full mb-8">
                        <div className="flex items-center gap-2 mb-3 bg-cyan-500/10 px-4 py-1.5 rounded-full border border-cyan-400/30">
                            <Ticket size={16} className="text-cyan-400" />
                            <h2 className="text-[12px] font-[1000] text-cyan-300 uppercase tracking-[0.25em]">PASE VIP</h2>
                        </div>
                        
                        {/* Real Time Clock */}
                        <div className="flex items-center gap-1.5 text-white/80">
                            <Clock size={12} className="text-cyan-400 animate-pulse" />
                            <span className="text-[10px] font-mono tracking-widest">
                                {currentTime.toLocaleDateString('es-AR')} {currentTime.toLocaleTimeString('es-AR', { hour12: false })}
                            </span>
                        </div>
                    </div>

                    {/* CENTER: Identity */}
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 p-1 mt-2 mb-6 shadow-[0_0_30px_rgba(34,211,238,0.4)] relative">
                        <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden border-2 border-black">
                            {/* Generic Avatar since clients don't upload photos yet */}
                            <User size={40} className="text-cyan-400/50" />
                            {/* Radar scan line effect */}
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/20 to-transparent h-[200%] -top-[100%] animate-[scan_3s_ease-in-out_infinite]" />
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-2 border-black flex items-center justify-center shadow-[0_0_10px_rgba(34,197,94,0.6)]">
                            <ShieldCheck size={12} className="text-white" />
                        </div>
                    </div>

                    <div className="text-center mb-8 relative w-full">
                        <h3 className="text-2xl font-[1000] uppercase tracking-tighter text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] mb-1 break-words leading-none">
                            {client.name}
                        </h3>
                        <p className="text-[10px] text-cyan-400 uppercase tracking-[0.2em] font-bold">
                            Miembro Verificado
                        </p>
                    </div>

                    {/* BOTTOM: QR Code */}
                    <div className="bg-white p-3 rounded-2xl relative group">
                        <div className="absolute inset-0 bg-cyan-400/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                        <QRCodeSVG
                            value={validationUrl}
                            size={160}
                            bgColor="#ffffff"
                            fgColor="#000000"
                            level="H"
                            className="relative z-10"
                        />
                    </div>
                    <p className="text-[7px] text-white/40 uppercase tracking-widest mt-4 text-center">
                        Escaneá para validar en puerta
                    </p>
                </div>
            </div>

            {/* Global Styles for Animations */}
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes scan {
                    0% { transform: translateY(0); }
                    100% { transform: translateY(100%); }
                }
            `}} />
        </div>
    );
};

export default ClientCredentialPage;
