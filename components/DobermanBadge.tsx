import React, { useState, useEffect } from 'react';
import { ShieldCheck, Dog } from 'lucide-react';
import { obtenerIntrusiones } from '../firebase';

/**
 * 🐕 DobermanBadge — Escudo de seguridad Doberman
 * Verde = Perímetro seguro | Rojo = Alertas detectadas (24h)
 * Se conecta a Firebase securityLogs automáticamente.
 */
export const DobermanBadge: React.FC = () => {
    const [status, setStatus] = useState<'loading' | 'green' | 'red'>('green');
    const [alertCount, setAlertCount] = useState(0);

    useEffect(() => {
        obtenerIntrusiones(10).then(logs => {
            const now = Date.now();
            const recent = logs.filter(l => {
                const t = new Date(l.timestamp).getTime();
                return (now - t) < 24 * 60 * 60 * 1000;
            });
            setAlertCount(recent.length);
            setStatus(recent.length > 0 ? 'red' : 'green');
        }).catch(() => setStatus('green'));
    }, []);

    const isAlert = status === 'red';

    return (
        <div className={`
            inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.15em]
            border-2 transition-all cursor-default select-none backdrop-blur-sm
            ${isAlert 
                ? 'bg-red-500/15 border-red-500/40 text-red-400 animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.25),inset_0_0_15px_rgba(239,68,68,0.1)]' 
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15),inset_0_0_10px_rgba(16,185,129,0.05)]'
            }
        `}>
            {isAlert 
                ? <Dog size={14} className="drop-shadow-[0_0_6px_rgba(239,68,68,0.8)]" />
                : <ShieldCheck size={14} className="drop-shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
            }
            <span>{isAlert ? `${alertCount} alerta${alertCount > 1 ? 's' : ''}` : 'seguro'}</span>
            <div className={`w-2 h-2 rounded-full ${isAlert ? 'bg-red-400 animate-ping' : 'bg-emerald-400'}`} />
        </div>
    );
};

export default DobermanBadge;
