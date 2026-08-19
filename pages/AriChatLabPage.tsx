// ==========================================
// 🧪 PÁGINA LABORATORIO — AriChatLabPage
// Simulación del comerciante "Waly Test"
// para probar el sistema completo en el
// celular de Waly antes de producción.
// Director: Waly | Ingeniería: Luz
// ==========================================

import React, { useState } from 'react';
import { AriFullChat } from '../components/AriFullChat';
import { sendBirthdayMessage, sendWelcomeMessage, sendInternalMessage } from '../services/pushEngine';
import { Zap, Gift, Bell, MessageCircle, Smartphone, CheckCircle2 } from 'lucide-react';

// ─── USUARIO SIMULADO (Laboratorio) ──────────────────────────────────────────
// En producción, este userId viene de Firebase Auth.
// En el lab, usamos un ID fijo para simular un comerciante.
const LAB_USER_ID = 'lab-waly-test-001';
const LAB_USER_NAME = 'Waly (Lab)';

// ─── PANEL DE CONTROL DEL LABORATORIO ────────────────────────────────────────
const LabControlPanel: React.FC = () => {
    const [lastAction, setLastAction] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const run = async (label: string, fn: () => Promise<void>) => {
        setIsLoading(true);
        setLastAction(null);
        try {
            await fn();
            setLastAction(`✅ ${label} — enviado correctamente`);
        } catch (err) {
            setLastAction(`❌ Error en: ${label}`);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const tests = [
        {
            label: 'Enviar Bienvenida',
            icon: <Smartphone size={14} />,
            color: 'from-emerald-600 to-teal-600',
            fn: () => sendWelcomeMessage(LAB_USER_ID, LAB_USER_NAME),
        },
        {
            label: 'Enviar Cumpleaños 🎂',
            icon: <Gift size={14} />,
            color: 'from-pink-600 to-rose-600',
            fn: () => sendBirthdayMessage(LAB_USER_ID, LAB_USER_NAME),
        },
        {
            label: 'Enviar Oferta del Día',
            icon: <Zap size={14} />,
            color: 'from-amber-500 to-orange-600',
            fn: () => sendInternalMessage(LAB_USER_ID, {
                from: 'luz',
                type: 'offer',
                content: '⚡ ¡OFERTA RELÁMPAGO! 🔥\n\n50% OFF en todos los comercios aderidos esta tarde de 18 a 21hs.\n\n¡No te lo pierdas, Socio! El stock es limitado.',
                linkUrl: '/descuentos',
                linkLabel: '🛍️ Ver todas las ofertas',
                authorizedRoles: ['luz', 'waly', 'director'],
            }),
        },
        {
            label: 'Enviar Link de Credencial',
            icon: <Bell size={14} />,
            color: 'from-violet-600 to-cyan-600',
            fn: () => sendInternalMessage(LAB_USER_ID, {
                from: 'bunker',
                type: 'link',
                content: '🎫 Tu credencial electrónica está lista.\n\nPodés mostrarla en cualquier comercio adherido para acceder a tus beneficios VIP. ¡Guardala en tu pantalla de inicio!',
                linkUrl: '/credencial',
                linkLabel: '🎫 Ver mi credencial',
                authorizedRoles: ['luz', 'waly', 'director'],
            }),
        },
        {
            label: 'Mensaje de Luz (Búnker)',
            icon: <MessageCircle size={14} />,
            color: 'from-indigo-600 to-purple-600',
            fn: () => sendInternalMessage(LAB_USER_ID, {
                from: 'luz',
                type: 'text',
                content: '📡 Mensaje del Búnker — Luz 01\n\nHola Waly, te confirmo que el sistema de chat interno está operativo. Las notificaciones push están configuradas. ¡La Jugada Maestra está en marcha! 🚀',
                authorizedRoles: ['luz', 'waly', 'director'],
            }),
        },
    ];

    return (
        <div className="bg-[#1a0a2e] border-b border-violet-900/50 px-4 py-3">
            <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-amber-400 text-[9px] font-black uppercase tracking-widest">
                    🧪 Modo Laboratorio — Búnker de Luz
                </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
                {tests.map(({ label, icon, color, fn }) => (
                    <button
                        key={label}
                        onClick={() => run(label, fn)}
                        disabled={isLoading}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl
                            bg-gradient-to-r ${color} text-white
                            text-[9px] font-black uppercase tracking-wider
                            shadow-md hover:scale-[1.02] active:scale-95
                            transition-all cursor-pointer border-none
                            disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {icon}
                        <span className="truncate">{label}</span>
                    </button>
                ))}
            </div>

            {lastAction && (
                <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-900/30 border border-emerald-500/30">
                    <CheckCircle2 size={12} className="text-emerald-400 flex-shrink-0" />
                    <span className="text-emerald-300 text-[9px] font-bold">{lastAction}</span>
                </div>
            )}
        </div>
    );
};

// ─── PÁGINA PRINCIPAL DEL LAB ─────────────────────────────────────────────────
const AriChatLabPage: React.FC = () => {
    return (
        <div className="flex flex-col h-screen w-screen overflow-hidden">
            {/* Panel de control Luz (solo visible en lab) */}
            <LabControlPanel />

            {/* Chat completo de ARI con usuario simulado */}
            <div className="flex-1 overflow-hidden">
                <AriFullChat
                    userId={LAB_USER_ID}
                    userName={LAB_USER_NAME}
                    ariRole="home"
                />
            </div>
        </div>
    );
};

export default AriChatLabPage;
