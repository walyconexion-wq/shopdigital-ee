import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Shop } from '../types';
import {
    Rocket, Shield, Phone, MapPin, Store, ChevronLeft, Zap, Smartphone,
    CheckCircle2, Lock, UserCheck, AlertTriangle, Edit3, Send,
    Users, BookOpen, Receipt, Unlock, MessageCircle, ExternalLink
} from 'lucide-react';
import { playNeonClick, playSuccessSound } from '../utils/audio';
import { AriMerchantAssistant } from '../components/AriMerchantAssistant';

// =========================================================
// CONSTANTES DEL SISTEMA — Llaves del Ecosistema ShopDigital
// =========================================================
const SD_CANAL_CLIENTES = 'https://whatsapp.com/channel/0029VbCS4rvInlqNj9tcA40m';
const SD_CANAL_COMERCIANTES = 'https://whatsapp.com/channel/0029VbCU0awK0IBrdkOWkR2I';
const SD_ARI_OFICIAL = 'https://wa.me/5491140607059';

interface ShopOnboardingPageProps {
    allShops: Shop[];
}

// =========================================================
// TIPO DE DISPARADOR
// =========================================================
interface Trigger {
    id: string;
    number: number;
    label: string;
    icon: React.ReactNode;
    color: string;
    borderColor: string;
    bgColor: string;
    glowColor: string;
    textColor: string;
    locked: boolean;
    buildMessage: (shop: Shop, townId: string) => string;
    buildLinks?: (shop: Shop, townId: string) => string[];
}

const buildCredentialUrl = (shop: Shop, townId: string) =>
    `${window.location.origin}/${townId}/${shop.category}/${shop.slug}/credencial`;

const buildLandingUrl = (townId: string) =>
    `${window.location.origin}/${townId}/descubrir`;

const buildDiscountsUrl = (townId: string) =>
    `${window.location.origin}/${townId}/red-comercial/descuentos`;

const buildInvoiceUrl = (shop: Shop, townId: string) =>
    shop.invoiceSimulationUrl || `${window.location.origin}/${townId}/${shop.category}/${shop.slug}/factura`;

const TRIGGERS: Trigger[] = [
    {
        id: 'validar',
        number: 1,
        label: 'VALIDAR NÚMERO',
        icon: <Rocket size={16} />,
        color: 'cyan',
        borderColor: 'border-cyan-400/60',
        bgColor: 'bg-cyan-500/10',
        glowColor: 'shadow-[0_0_20px_rgba(34,211,238,0.3)]',
        textColor: 'text-cyan-300',
        locked: false,
        buildMessage: (shop) =>
            `🚀 ¡Hola ${shop.ownerName || 'Comandante'}! Soy tu Embajadora de ShopDigital.\n\n` +
            `Tu local *${shop.name}* acaba de ser incorporado oficialmente a nuestra red comercial.\n\n` +
            `¿Estás listo para recibir tu *Kit de Bienvenida Digital*? 🎯\n\nRespondé *"SI"* para confirmar y activar tu arsenal completo ✅`,
    },
    {
        id: 'credencial',
        number: 2,
        label: 'ENVIAR CREDENCIAL',
        icon: <Shield size={16} />,
        color: 'violet',
        borderColor: 'border-violet-400/60',
        bgColor: 'bg-violet-500/10',
        glowColor: 'shadow-[0_0_20px_rgba(139,92,246,0.3)]',
        textColor: 'text-violet-300',
        locked: true,
        buildMessage: (shop, townId) =>
            `🏆 ¡Excelente ${shop.ownerName || ''}! Aquí está tu *Credencial Electrónica Oficial* de ShopDigital:\n\n` +
            `🔗 ${buildCredentialUrl(shop, townId)}\n\n` +
            `Mostrásela a tus clientes para que accedan a descuentos y beneficios exclusivos en tu local 💎\n\n` +
            `Tu número de socio: *#${shop.memberNumber || shop.shopNumber || '001'}*`,
    },
    {
        id: 'descuentos',
        number: 3,
        label: 'DESCUENTOS B2B',
        icon: <Users size={16} />,
        color: 'amber',
        borderColor: 'border-amber-400/60',
        bgColor: 'bg-amber-500/10',
        glowColor: 'shadow-[0_0_20px_rgba(245,158,11,0.3)]',
        textColor: 'text-amber-300',
        locked: true,
        buildMessage: (shop, townId) =>
            `🛍️ ${shop.ownerName || 'Comerciante'}, como socio de ShopDigital tenés acceso a nuestra *Página de Descuentos B2B* exclusiva:\n\n` +
            `🔗 ${buildDiscountsUrl(townId)}\n\n` +
            `Ahorrá en tus compras mayoristas y accedé a precios preferenciales para comerciantes asociados 💰`,
    },
    {
        id: 'canales',
        number: 4,
        label: 'CANALES INFO',
        icon: <Send size={16} />,
        color: 'green',
        borderColor: 'border-green-400/60',
        bgColor: 'bg-green-500/10',
        glowColor: 'shadow-[0_0_20px_rgba(34,197,94,0.3)]',
        textColor: 'text-green-300',
        locked: true,
        buildMessage: (shop) =>
            `📡 ${shop.ownerName || ''}, te conectamos a nuestros canales oficiales:\n\n` +
            `🏆 *Canal para Comerciantes Premium* (info, actualizaciones, novedades del sistema):\n${SD_CANAL_COMERCIANTES}\n\n` +
            `😎 *Canal "Clientes Felices"* (para que veas tu publicidad y lo que ven tus clientes):\n${SD_CANAL_CLIENTES}\n\n` +
            `🤖 Para consultas privadas con *ARI*, tu asistente IA 24/7:\n${SD_ARI_OFICIAL}`,
    },
    {
        id: 'manual',
        number: 5,
        label: 'MANUAL INTERACTIVO',
        icon: <BookOpen size={16} />,
        color: 'indigo',
        borderColor: 'border-indigo-400/60',
        bgColor: 'bg-indigo-500/10',
        glowColor: 'shadow-[0_0_20px_rgba(99,102,241,0.3)]',
        textColor: 'text-indigo-300',
        locked: true,
        buildMessage: (shop, townId) =>
            `📖 ${shop.ownerName || ''}, aquí tenés tu *Landing Page* con toda la información de ShopDigital:\n\n` +
            `🔗 ${buildLandingUrl(townId)}\n\n` +
            `Tutorial interactivo, beneficios del sistema y guía completa de uso 🌟\n\n` +
            `*ARI* te va a guiar en cada paso y está disponible 24/7 en: ${SD_ARI_OFICIAL}`,
    },
    {
        id: 'factura',
        number: 6,
        label: 'FACTURA MES GRATIS',
        icon: <Receipt size={16} />,
        color: 'orange',
        borderColor: 'border-orange-400/60',
        bgColor: 'bg-orange-500/10',
        glowColor: 'shadow-[0_0_20px_rgba(249,115,22,0.3)]',
        textColor: 'text-orange-300',
        locked: true,
        buildMessage: (shop, townId) =>
            `🎁 ¡Bienvenido a la red, ${shop.ownerName || ''}! Tu *primer mes es completamente GRATIS*.\n\n` +
            `Para que veas cómo funciona nuestro sistema de facturación, aquí está tu comprobante:\n\n` +
            `🔗 ${buildInvoiceUrl(shop, townId)}\n\n` +
            `*${shop.name}* ya es parte oficial de ShopDigital. ¡Gracias por confiar en nosotros! 🚀`,
    },
];

const COLOR_MAP: Record<string, string> = {
    cyan: 'rgba(34,211,238,0.5)',
    violet: 'rgba(139,92,246,0.5)',
    amber: 'rgba(245,158,11,0.5)',
    green: 'rgba(34,197,94,0.5)',
    indigo: 'rgba(99,102,241,0.5)',
    orange: 'rgba(249,115,22,0.5)',
};

const ShopOnboardingPage: React.FC<ShopOnboardingPageProps> = ({ allShops }) => {
    const { townId = 'esteban-echeverria', shopId } = useParams<{ townId: string; shopId: string }>();
    const navigate = useNavigate();

    const shop = allShops.find(s => s.id === shopId);

    // H-Hour Lock state — persisted per shopId
    const HANDSHAKE_KEY = `shopdigital_handshake_${shopId}`;
    const SENT_KEY = `shopdigital_sent_${shopId}`;

    const [handshakeConfirmed, setHandshakeConfirmed] = useState<boolean>(() => {
        return localStorage.getItem(HANDSHAKE_KEY) === 'true';
    });
    const [sentTriggers, setSentTriggers] = useState<Set<string>>(() => {
        const stored = localStorage.getItem(SENT_KEY);
        return stored ? new Set(JSON.parse(stored)) : new Set();
    });
    const [fuegoProgress, setFuegoProgress] = useState(0);
    const [isFuegoRunning, setIsFuegoRunning] = useState(false);
    const [missionComplete, setMissionComplete] = useState(false);

    // ARI audit — detect missing fields
    const ariAlerts: string[] = [];
    if (shop) {
        if (!shop.phone) ariAlerts.push('📵 NO HAY TELÉFONO REGISTRADO. SIN NÚMERO, LA ARTILLERÍA NO PUEDE DISPARAR.');
        if (!shop.ownerName) ariAlerts.push('👤 FALTA NOMBRE DEL DUEÑO. COMPLETAR PARA MENSAJES PERSONALIZADOS.');
        if (!shop.description) ariAlerts.push('📝 LOCAL SIN DESCRIPCIÓN. COMPLETAR PARA MEJORAR SU PERFIL.');
        if (!shop.bannerImage || shop.bannerImage.includes('unsplash')) ariAlerts.push('📸 FALTA FOTO DEL LOCAL. CAPTURAR EN LA VISITA.');
    }
    const ariOk = ariAlerts.length === 0;

    const markHandshake = () => {
        localStorage.setItem(HANDSHAKE_KEY, 'true');
        setHandshakeConfirmed(true);
        playSuccessSound();
    };

    const markSent = (triggerId: string) => {
        const next = new Set(sentTriggers);
        next.add(triggerId);
        setSentTriggers(next);
        localStorage.setItem(SENT_KEY, JSON.stringify([...next]));
    };

    const openWhatsApp = (shop: Shop, trigger: Trigger) => {
        if (!shop.phone) { alert('⚠️ El comercio no tiene teléfono registrado. Editá el comercio primero.'); return; }
        const phone = shop.phone.replace(/\D/g, '');
        const msg = trigger.buildMessage(shop, townId);
        const url = `https://wa.me/${phone.startsWith('54') ? phone : '54' + phone}?text=${encodeURIComponent(msg)}`;
        window.open(url, '_blank');
        markSent(trigger.id);
        playNeonClick();
    };

    const triggerFuegoManual = async () => {
        if (!shop) return;
        setIsFuegoRunning(true);
        setFuegoProgress(0);
        const locked = TRIGGERS.filter(t => t.id !== 'validar');
        for (let i = 0; i < locked.length; i++) {
            const t = locked[i];
            const phone = (shop.phone || '').replace(/\D/g, '');
            const msg = t.buildMessage(shop, townId);
            const url = `https://wa.me/${phone.startsWith('54') ? phone : '54' + phone}?text=${encodeURIComponent(msg)}`;
            window.open(url, '_blank');
            markSent(t.id);
            setFuegoProgress(Math.round(((i + 1) / locked.length) * 100));
            await new Promise(r => setTimeout(r, 1200));
        }
        setIsFuegoRunning(false);
        setMissionComplete(true);
        playSuccessSound();
    };

    if (!shop) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white">
                <div className="text-center space-y-3">
                    <AlertTriangle size={40} className="text-red-400 mx-auto" />
                    <p className="text-[12px] text-white/60 uppercase tracking-widest">Comercio no encontrado</p>
                    <button onClick={() => navigate(-1)} className="text-cyan-400 text-[10px] underline">Volver</button>
                </div>
            </div>
        );
    }

    const themeGlow = shop.themeColor || '#a855f7';

    return (
        <div className="min-h-screen bg-black text-white pb-32 relative overflow-x-hidden">
            {/* Background cyberpunk grid */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(168,85,247,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(168,85,247,0.03)_1px,transparent_1px)] bg-[size:30px_30px]" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-[100px] opacity-20"
                    style={{ backgroundColor: themeGlow }} />
                <div className="absolute bottom-0 right-0 w-[300px] h-[300px] rounded-full blur-[80px] opacity-10"
                    style={{ backgroundColor: '#06b6d4' }} />
            </div>

            {/* === HEADER === */}
            <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10 px-5 pt-8 pb-4">
                <button onClick={() => { playNeonClick(); navigate(`/${townId}/embajador/gestion`); }}
                    className="mb-3 flex items-center gap-2 text-white/40 hover:text-white/80 transition-colors text-[10px] uppercase tracking-widest font-bold">
                    <ChevronLeft size={16} /> Volver al Gestor
                </button>
                <div className="flex items-center gap-4">
                    {/* Shop thumb */}
                    <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 flex-shrink-0"
                        style={{ borderColor: themeGlow, boxShadow: `0 0 20px ${themeGlow}60` }}>
                        {shop.bannerImage ? (
                            <img src={shop.bannerImage} alt={shop.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-black/60 flex items-center justify-center">
                                <Store size={20} className="text-white/30" />
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border"
                                style={{ color: themeGlow, borderColor: `${themeGlow}60`, backgroundColor: `${themeGlow}15` }}>
                                🚀 ONBOARDING BLITZKRIEG
                            </span>
                            <span className="text-[8px] font-black uppercase tracking-widest text-green-400 bg-green-500/10 border border-green-400/30 px-2 py-0.5 rounded-full">
                                ✅ Aprobado
                            </span>
                        </div>
                        <h1 className="text-xl font-[1000] uppercase tracking-tighter text-white mt-1 truncate"
                            style={{ textShadow: `0 0 20px ${themeGlow}80` }}>
                            {shop.name}
                        </h1>
                        <div className="flex items-center gap-3 mt-0.5">
                            {shop.phone && (
                                <span className="text-[9px] text-green-400 flex items-center gap-1">
                                    <Phone size={9} /> {shop.phone}
                                </span>
                            )}
                            {shop.zone && (
                                <span className="text-[9px] text-white/40 flex items-center gap-1">
                                    <MapPin size={9} /> {shop.zone}
                                </span>
                            )}
                        </div>
                    </div>
                    <button onClick={() => { playNeonClick(); navigate(`/${townId}/embajador/editar/${shop.id}`); }}
                        className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-400/30 text-cyan-400 hover:bg-cyan-500/20 transition-all flex-shrink-0">
                        <Edit3 size={16} />
                    </button>
                </div>
            </div>

            <div className="px-5 relative z-10 max-w-lg mx-auto mt-5 space-y-5">

                {/* === ARI AUDIT PANEL === */}
                <div className={`rounded-2xl border p-4 ${ariOk ? 'border-green-400/40 bg-green-500/5' : 'border-amber-400/40 bg-amber-500/5'}`}>
                    <div className="flex items-center gap-2 mb-3">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[12px] ${ariOk ? 'bg-green-500/20' : 'bg-amber-500/20'}`}>
                            {ariOk ? '✅' : '⚠️'}
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/70">
                            ARI — Auditoría de Inteligencia de Objetivos
                        </span>
                    </div>
                    {ariOk ? (
                        <p className="text-[10px] text-green-300 font-bold">
                            ✅ DATOS COMPLETOS. SISTEMA LISTO PARA EL BLITZKRIEG, COMANDANTE.
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {ariAlerts.map((alert, i) => (
                                <div key={i} className="flex items-start gap-2">
                                    <span className="text-[10px] text-amber-300 leading-relaxed flex-1">{alert}</span>
                                </div>
                            ))}
                            <button onClick={() => navigate(`/${townId}/embajador/editar/${shop.id}`)}
                                className="mt-2 flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-cyan-400 border border-cyan-400/30 bg-cyan-500/10 px-3 py-1.5 rounded-lg hover:bg-cyan-500/20 transition-all">
                                <Edit3 size={10} /> Ir a Editar el Comercio
                            </button>
                        </div>
                    )}
                </div>

                {/* === H-HOUR LOCK STATUS === */}
                <div className={`rounded-2xl border p-4 transition-all ${handshakeConfirmed
                    ? 'border-green-400/40 bg-green-500/5'
                    : 'border-amber-400/40 bg-amber-500/10 animate-pulse'
                    }`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                {handshakeConfirmed ? <Unlock size={14} className="text-green-400" /> : <Lock size={14} className="text-amber-400" />}
                                <span className="text-[9px] font-black uppercase tracking-widest text-white/70">
                                    H-Hour Lock — Handshake de Validación
                                </span>
                            </div>
                            <p className="text-[10px] text-white/50 leading-relaxed">
                                {handshakeConfirmed
                                    ? '✅ Comerciante confirmó. Artillería desbloqueada.'
                                    : 'Primero envía el Disparador #1 y espera que el comerciante responda "SI".'}
                            </p>
                        </div>
                        {!handshakeConfirmed && (
                            <button onClick={markHandshake}
                                className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-green-300 border border-green-400/40 bg-green-500/10 px-3 py-2 rounded-xl hover:bg-green-500/20 transition-all flex-shrink-0 ml-3">
                                <UserCheck size={12} /> Respondió "SI"
                            </button>
                        )}
                    </div>
                    {handshakeConfirmed && (
                        <div className="mt-3 flex items-center gap-2">
                            <div className="flex-1 h-1 bg-green-500/20 rounded-full">
                                <div className="h-full rounded-full bg-green-400"
                                    style={{ width: `${Math.round((sentTriggers.size / TRIGGERS.length) * 100)}%`, transition: 'width 0.5s ease' }} />
                            </div>
                            <span className="text-[9px] font-black text-green-400">{sentTriggers.size}/{TRIGGERS.length}</span>
                        </div>
                    )}
                </div>

                {/* === 6 DISPARADORES === */}
                <div>
                    <h2 className="text-[9px] font-black text-white/50 uppercase tracking-widest pl-1 mb-3">
                        Arsenal de Disparadores
                    </h2>
                    <div className="space-y-3">
                        {TRIGGERS.map(trigger => {
                            const isLocked = trigger.locked && !handshakeConfirmed;
                            const isSent = sentTriggers.has(trigger.id);
                            const glowRgb = COLOR_MAP[trigger.color] || 'rgba(168,85,247,0.4)';

                            return (
                                <div key={trigger.id}
                                    className={`rounded-2xl border p-4 transition-all ${isLocked ? 'opacity-40' : trigger.bgColor} ${trigger.borderColor} ${!isLocked ? trigger.glowColor : ''}`}
                                    style={!isLocked ? { boxShadow: `0 0 15px ${glowRgb}` } : {}}>

                                    {/* Trigger header */}
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${trigger.textColor} ${trigger.bgColor} border ${trigger.borderColor}`}>
                                                {trigger.icon}
                                            </div>
                                            <div>
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${trigger.textColor}`}>
                                                    #{trigger.number} {trigger.label}
                                                </span>
                                            </div>
                                        </div>
                                        {isLocked ? (
                                            <Lock size={12} className="text-white/30" />
                                        ) : isSent ? (
                                            <span className="text-[8px] font-black text-green-300 bg-green-500/20 border border-green-400/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                <CheckCircle2 size={8} /> Enviado
                                            </span>
                                        ) : null}
                                    </div>

                                    {/* Dual buttons */}
                                    {!isLocked && (
                                        <div className="flex gap-2">
                                            {/* MANUAL — always available */}
                                            <button
                                                onClick={() => openWhatsApp(shop, trigger)}
                                                className={`flex-1 border ${trigger.borderColor} ${trigger.bgColor} ${trigger.textColor} py-2.5 rounded-xl flex items-center justify-center gap-1.5 font-black uppercase tracking-widest text-[8px] active:scale-95 transition-all hover:brightness-110`}
                                            >
                                                <Smartphone size={11} /> Manual
                                            </button>
                                            {/* AUTO — webhook placeholder (future Make.com) */}
                                            <button
                                                onClick={() => {
                                                    alert('⚡ Modo Automático (Make.com) en configuración. Usando modo Manual por ahora.');
                                                    openWhatsApp(shop, trigger);
                                                }}
                                                className={`flex-1 border border-white/20 bg-white/5 text-white/50 py-2.5 rounded-xl flex items-center justify-center gap-1.5 font-black uppercase tracking-widest text-[8px] active:scale-95 transition-all hover:bg-white/10`}
                                            >
                                                <Zap size={11} /> Auto
                                            </button>
                                        </div>
                                    )}

                                    {isLocked && (
                                        <p className="text-[9px] text-white/30 text-center mt-1">
                                            🔒 Bloqueado hasta confirmación del comerciante
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* === FUEGO TOTAL === */}
                {handshakeConfirmed && (
                    <div className="rounded-3xl border border-red-500/40 bg-red-500/5 p-5 space-y-4">
                        <div className="text-center">
                            <h2 className="text-[11px] font-black uppercase tracking-widest text-red-300 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]">
                                ⚡ FUEGO TOTAL — Arsenal Completo
                            </h2>
                            <p className="text-[9px] text-white/40 mt-1">Disparar los 6 mensajes al comerciante de forma secuencial</p>
                        </div>

                        {isFuegoRunning && (
                            <div className="space-y-2">
                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-cyan-400 via-violet-400 to-red-400 transition-all duration-500 rounded-full"
                                        style={{ width: `${fuegoProgress}%` }} />
                                </div>
                                <p className="text-[9px] text-center text-white/50 animate-pulse">
                                    Desplegando arsenal... {fuegoProgress}%
                                </p>
                            </div>
                        )}

                        {missionComplete && (
                            <div className="text-center py-3 rounded-2xl bg-green-500/10 border border-green-400/30">
                                <p className="text-[11px] font-black text-green-300">
                                    ⚡ MISIÓN CUMPLIDA, COMANDANTE!<br />
                                    <span className="text-[9px] text-white/60">{shop.name} está dentro del sistema. +500 PUNTOS 🏆</span>
                                </p>
                            </div>
                        )}

                        <div className="flex gap-3">
                            {/* FUEGO AUTOMÁTICO (future) */}
                            <button
                                disabled={isFuegoRunning}
                                onClick={() => alert('⚡ Fuego Automático vía Make.com — configuración pendiente. Usar Fuego Manual.')}
                                className="flex-1 bg-white/5 border border-white/20 text-white/40 py-3 rounded-2xl flex items-center justify-center gap-2 font-black uppercase tracking-widest text-[8px] active:scale-95 transition-all disabled:opacity-30"
                            >
                                <Zap size={14} /> ⚡ Auto (Make)
                            </button>
                            {/* FUEGO MANUAL */}
                            <button
                                disabled={isFuegoRunning || missionComplete}
                                onClick={triggerFuegoManual}
                                className="flex-1 bg-red-500/20 border border-red-400/50 text-red-300 py-3 rounded-2xl flex items-center justify-center gap-2 font-black uppercase tracking-widest text-[8px] active:scale-95 transition-all hover:bg-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.3)] disabled:opacity-40"
                            >
                                <Rocket size={14} /> 📱 Fuego Manual
                            </button>
                        </div>
                    </div>
                )}

                {/* === LINKS RÁPIDOS === */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 space-y-3">
                    <h3 className="text-[9px] font-black uppercase tracking-widest text-white/40">
                        Vista Rápida de Recursos
                    </h3>
                    {[
                        { label: 'Credencial del Comercio', url: buildCredentialUrl(shop, townId), color: 'text-violet-400' },
                        { label: 'Landing Page del Sistema', url: buildLandingUrl(townId), color: 'text-cyan-400' },
                        { label: 'Página de Descuentos B2B', url: buildDiscountsUrl(townId), color: 'text-amber-400' },
                        { label: 'ARI Oficial (Soporte 24/7)', url: SD_ARI_OFICIAL, color: 'text-green-400' },
                    ].map(link => (
                        <a key={link.url} href={link.url} target="_blank" rel="noreferrer"
                            className={`flex items-center justify-between py-2 border-b border-white/5 last:border-0 ${link.color} hover:opacity-80 transition-opacity`}>
                            <span className="text-[10px] font-bold">{link.label}</span>
                            <ExternalLink size={12} />
                        </a>
                    ))}
                </div>
            </div>

            {/* ARI ASSISTANT */}
            <AriMerchantAssistant
                shop={shop}
                role="onboarding_deployer"
                townId={townId}
                inline={false}
            />
        </div>
    );
};

export default ShopOnboardingPage;
