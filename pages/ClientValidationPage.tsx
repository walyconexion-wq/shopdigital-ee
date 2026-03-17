import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Client } from '../types';
import {
    ShieldCheck,
    ChevronLeft,
    XCircle,
    CheckCircle,
    Lock,
    Unlock
} from 'lucide-react';
import { playNeonClick, playSuccessSound } from '../utils/audio';
import LoadingScreen from '../components/LoadingScreen';

const VERIFICATION_CODE = "VIP"; // Hardcoded for events

const ClientValidationPage: React.FC = () => {
    const { clientId } = useParams<{ clientId: string }>();
    const navigate = useNavigate();
    const [client, setClient] = useState<Client | null>(null);
    const [loading, setLoading] = useState(true);
    
    // PIN logic
    const [enteredCode, setEnteredCode] = useState("");
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

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
                console.error("Error fetching client for validation:", error);
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
                <h1 className="text-2xl font-black text-red-500 uppercase tracking-widest text-center">Credencial Falsa</h1>
                <p className="text-sm text-white/50 text-center mt-2">Esta persona no está registrada en la red.</p>
                <div className="mt-8 flex flex-col gap-4">
                    <button onClick={() => navigate('/')} className="px-6 py-2 bg-white/10 rounded-full text-xs uppercase font-bold tracking-widest">
                        Cerrar
                    </button>
                    <button onClick={() => navigate('/subscripcion')} className="px-6 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/40 rounded-full text-xs uppercase font-bold tracking-widest">
                        Registrar Ahora
                    </button>
                </div>
            </div>
        );
    }

    const handleKeypadPress = (val: string) => {
        playNeonClick();
        if (status !== 'idle') setStatus('idle'); // Reset on new press

        setEnteredCode(prev => {
            const newCode = prev + val;
            if (newCode.length >= VERIFICATION_CODE.length) {
                verifyCode(newCode);
                return newCode.substring(0, VERIFICATION_CODE.length); // limit length visually
            }
            return newCode;
        });
    };

    const handleDelete = () => {
        playNeonClick();
        if (status !== 'idle') setStatus('idle');
        setEnteredCode(prev => prev.slice(0, -1));
    };

    const verifyCode = (code: string) => {
        if (code === VERIFICATION_CODE) {
            setStatus('success');
            playSuccessSound();
            setEnteredCode("");
        } else {
            setStatus('error');
            // Re-use click sound rapidly for error feedback, or you could add a playErrorSound to audio.ts later
            playNeonClick();
            setTimeout(() => playNeonClick(), 150);
            setTimeout(() => setEnteredCode(""), 800);
        }
    };

    const STATUS_COLORS = {
        idle: 'bg-zinc-900 border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]',
        success: 'bg-green-500/20 border-green-500 text-green-400 shadow-[0_0_30px_rgba(34,197,94,0.5)]',
        error: 'bg-red-500/20 border-red-500 text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.5)]'
    };

    return (
        <div className="min-h-screen bg-black text-white relative flex flex-col items-center py-10 overflow-hidden">
            {/* Background Dynamics */}
            <div className="fixed inset-0 pointer-events-none z-0">
                {status === 'success' && <div className="absolute inset-0 bg-green-500/10 animate-pulse" />}
                {status === 'error' && <div className="absolute inset-0 bg-red-500/10 animate-pulse" />}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px]" />
            </div>

            <div className="w-full max-w-sm px-6 flex items-center justify-between relative z-10 mb-8">
                <button onClick={() => { playNeonClick(); navigate(-1); }}
                    className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-white/50 hover:bg-white/10 transition-all">
                    <ChevronLeft size={20} />
                </button>
                <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Terminal Táctica</span>
                    <span className="text-[12px] font-black text-cyan-400 tracking-[0.1em] uppercase">Control de Acceso</span>
                </div>
            </div>

            {/* Target Client Profile */}
            <div className={`w-full max-w-sm px-6 mb-8 transition-all duration-300 relative z-10 
                ${status === 'success' ? 'scale-105' : status === 'error' ? 'animate-[shake_0.4s_ease-in-out]' : ''}`}>
                <div className={`rounded-3xl p-6 border flex flex-col items-center text-center transition-colors duration-300 ${STATUS_COLORS[status]}`}>
                    
                    {status === 'idle' && <Lock size={32} className="mb-2 opacity-50" />}
                    {status === 'success' && <Unlock size={40} className="mb-2 animate-bounce" />}
                    {status === 'error' && <XCircle size={40} className="mb-2 animate-pulse" />}

                    <h2 className="text-2xl font-[1000] uppercase tracking-tighter mb-1 mt-2">{client.name}</h2>
                    <p className="text-[10px] uppercase font-bold tracking-widest opacity-70">
                        {status === 'idle' ? 'Esperando validación de puerta' :
                         status === 'success' ? '✔ ACCESO VIP AUTORIZADO' : 
                         '✖ CÓDIGO INCORRECTO'}
                    </p>
                </div>
            </div>

            {/* Terminal Keypad */}
            {status !== 'success' && (
                <div className="w-full max-w-[280px] grid grid-cols-3 gap-3 relative z-10">
                    {/* Display input mask */}
                    <div className="col-span-3 bg-black/50 border border-white/10 rounded-2xl h-14 mb-4 flex items-center justify-center gap-2">
                        {[0, 1, 2].map((i) => (
                            <div key={i} className={`w-4 h-4 rounded-full transition-all duration-200
                                ${i < enteredCode.length ? 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]' : 'bg-white/10'}`} 
                            />
                        ))}
                    </div>

                    {/* Numeric/Alpha Pad */}
                    {['V', 'I', 'P'].map((char) => (
                        <button key={char} onClick={() => handleKeypadPress(char)}
                            className="bg-zinc-900 border border-white/10 h-16 rounded-2xl text-2xl font-black text-white hover:bg-cyan-500/20 hover:border-cyan-400/50 hover:text-cyan-300 active:scale-95 transition-all shadow-lg">
                            {char}
                        </button>
                    ))}
                    
                    {/* Fake numbers for aesthetics/confusion */}
                    {['1', '2', '3', '4', '5', '6'].map((num) => (
                        <button key={num} onClick={() => handleKeypadPress(num)}
                            className="bg-zinc-900 border border-white/10 h-16 rounded-2xl text-2xl font-black text-white hover:bg-cyan-500/20 hover:border-cyan-400/50 hover:text-cyan-300 active:scale-95 transition-all shadow-lg">
                            {num}
                        </button>
                    ))}
                    
                    <button className="h-16 rounded-2xl bg-zinc-900/50 border border-white/5 opacity-50 cursor-not-allowed text-xs font-black">→</button>
                    <button onClick={() => handleKeypadPress('0')}
                        className="bg-zinc-900 border border-white/10 h-16 rounded-2xl text-2xl font-black text-white hover:bg-cyan-500/20 hover:border-cyan-400/50 hover:text-cyan-300 active:scale-95 transition-all shadow-lg">
                        0
                    </button>
                    <button onClick={handleDelete}
                        className="h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 hover:bg-red-500/20 active:scale-95 transition-all shadow-lg">
                        DEL
                    </button>
                </div>
            )}

            {/* Global Styles for Animations */}
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-10px) rotate(-2deg); }
                    75% { transform: translateX(10px) rotate(2deg); }
                }
            `}} />
        </div>
    );
};

export default ClientValidationPage;
