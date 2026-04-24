import React, { useState, useEffect } from 'react';
import { ShieldCheck, Dog } from 'lucide-react';
import { obtenerIntrusiones } from '../firebase';

/**
 * 🐕 DobermanBadge — Escudo de seguridad Doberman
 * Verde = Perímetro seguro | Rojo = Alertas detectadas (24h)
 * Se conecta a Firebase securityLogs automáticamente.
 */
export const DobermanBadge: React.FC = () => {
    const [status, setStatus] = useState<'loading' | 'green' | 'red'>('loading');
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

    if (status === 'loading') return null;

    const isAlert = status === 'red';

    return (
        <div className={`
            inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest
            border transition-all cursor-default select-none
            ${isAlert 
                ? 'bg-red-500/10 border-red-500/30 text-red-400 animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.2)]' 
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.1)]'
            }
        `}>
            {isAlert 
                ? <Dog size={11} className="drop-shadow-[0_0_4px_rgba(239,68,68,0.6)]" />
                : <ShieldCheck size={11} className="drop-shadow-[0_0_4px_rgba(16,185,129,0.6)]" />
            }
            <span>{isAlert ? `${alertCount} alerta${alertCount > 1 ? 's' : ''}` : 'seguro'}</span>
        </div>
    );
};

export default DobermanBadge;
