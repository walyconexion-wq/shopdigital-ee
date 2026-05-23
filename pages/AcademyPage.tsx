import React, { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { BookOpen, Play, CheckCircle, MessageCircle, Award, ChevronRight, Lock, Zap, Star, Shield, Target, Users } from 'lucide-react';
import { playNeonClick, playSuccessSound } from '../utils/audio';
import { actualizarAutorizado } from '../firebase';

// ─── Material de la Academia ───────────────────────────────────────
const ACADEMY_MODULES = [
    {
        id: 'mod-1',
        title: 'Misión y Visión ShopDigital VIP',
        icon: '🎯',
        duration: '10 min',
        content: [
            'ShopDigital VIP es la red comercial digital más dinámica de Argentina.',
            'Nuestra misión es conectar a comercios locales con clientes inteligentes a través de tecnología de última generación.',
            'Como Embajador, sos el nexo entre la plataforma y el mundo real: el soldado de campo que mueve la red.',
            'Tu territorio es tu zona de operaciones. Conocés los negocios, hablás el idioma del barrio, y usás la tecnología como arma.'
        ]
    },
    {
        id: 'mod-2',
        title: 'Tu Rol como Embajador',
        icon: '🦾',
        duration: '15 min',
        content: [
            'Un Embajador ShopDigital VIP tiene 3 funciones principales: Captar, Vincular y Activar.',
            '➤ CAPTAR: Identificar comercios locales (almacenes, ferreterías, peluquerías, etc.) con potencial para unirse.',
            '➤ VINCULAR: Registrar al comercio en la plataforma, completar su ficha digital y activar su perfil.',
            '➤ ACTIVAR: Acompañar al comerciante durante sus primeros 30 días, enseñarle a usar el panel y conseguir sus primeros clientes suscriptos.',
            'Tu comisión se genera por cada comercio activo y por cada cliente que suscribís a la red VIP.'
        ]
    },
    {
        id: 'mod-3',
        title: 'Herramientas Digitales de Campo',
        icon: '⚡',
        duration: '12 min',
        content: [
            'Tenés acceso a tu Panel de Embajador personal, disponible en tu celular las 24 horas.',
            'Desde el panel podés: registrar nuevos comercios, ver tus comisiones, gestionar clientes y enviar reportes de campo.',
            'ARI (tu agente de R.R.H.H. de Inteligencia Artificial) estará disponible para responderte cualquier duda del sistema en tiempo real.',
            'Usarás WhatsApp Business como canal principal de comunicación con los comerciantes y clientes.',
            'El Radar Radar de Satélite te muestra en tiempo real cuántos comercios hay en tu zona y cuáles son potenciales objetivos.'
        ]
    },
    {
        id: 'mod-4',
        title: 'Protocolo de Ética y Conducta',
        icon: '🛡️',
        duration: '8 min',
        content: [
            'El Embajador ShopDigital VIP representa la marca en el territorio. Tu conducta ES la marca.',
            'NUNCA prometer algo que el sistema no pueda cumplir. Ante la duda, consultá con tu Director de Zona.',
            'Toda información de clientes y comercios es CONFIDENCIAL. Está prohibida su divulgación bajo cualquier circunstancia.',
            'Trato siempre profesional, respetuoso y orientado a la solución.',
            'El incumplimiento del código de conducta puede resultar en la suspensión de tu cuenta y comisiones.'
        ]
    }
];

const AcademyPage: React.FC = () => {
    const { townId = 'esteban-echeverria' } = useParams<{ townId: string }>();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const candidateId = searchParams.get('id');

    const [completedModules, setCompletedModules] = useState<Set<string>>(new Set());
    const [activeModule, setActiveModule] = useState<string | null>(null);
    const [examStarted, setExamStarted] = useState(false);
    const [examAnswers, setExamAnswers] = useState<Record<string, string>>({});
    const [examSubmitted, setExamSubmitted] = useState(false);
    const [saving, setSaving] = useState(false);

    const allModulesCompleted = completedModules.size >= ACADEMY_MODULES.length;

    const EXAM_QUESTIONS = [
        { id: 'q1', question: '¿Cuáles son las 3 funciones principales de un Embajador?', options: ['Captar, Vincular, Activar', 'Vender, Cobrar, Retirar', 'Publicar, Compartir, Olvidar', 'Llamar, Visitar, Ignorar'], correct: 'Captar, Vincular, Activar' },
        { id: 'q2', question: '¿Dónde accedés a tu panel de Embajador?', options: ['Solo en una PC de escritorio', 'En tu celular o cualquier dispositivo', 'Debés ir físicamente a la oficina', 'Solo por llamada telefónica'], correct: 'En tu celular o cualquier dispositivo' },
        { id: 'q3', question: '¿Cómo se llama el agente de IA que te acompaña?', options: ['SARA', 'MARCO', 'ARI', 'ALEX'], correct: 'ARI' },
        { id: 'q4', question: '¿Qué hacés si un comerciante te pide algo que el sistema no puede cumplir?', options: ['Lo prometés igual', 'Lo ignorás', 'Consultás con tu Director de Zona', 'Inventás una solución'], correct: 'Consultás con tu Director de Zona' },
    ];

    const getZoneColor = () => {
        if (townId === 'ezeiza') return '#06b6d4';
        if (townId === 'esteban-echeverria') return '#8b5cf6';
        if (townId === 'mina-clavero' || townId === 'traslasierra') return '#10b981';
        return '#06b6d4';
    };
    const zoneColor = getZoneColor();
    const hexToRgba = (hex: string, alpha: number) => {
        try {
            const cleanHex = hex.replace('#', '');
            const r = parseInt(cleanHex.slice(0, 2), 16) || 6;
            const g = parseInt(cleanHex.slice(2, 4), 16) || 182;
            const b = parseInt(cleanHex.slice(4, 6), 16) || 212;
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        } catch { return `rgba(6, 182, 212, ${alpha})`; }
    };

    const markComplete = (modId: string) => {
        playSuccessSound();
        setCompletedModules(prev => new Set([...prev, modId]));
        setActiveModule(null);
    };

    const handleExamSubmit = async () => {
        playNeonClick();
        const correct = EXAM_QUESTIONS.filter(q => examAnswers[q.id] === q.correct).length;
        const score = (correct / EXAM_QUESTIONS.length) * 100;
        setExamSubmitted(true);

        if (score >= 75 && candidateId) {
            setSaving(true);
            try {
                await actualizarAutorizado(candidateId, {
                    examScore: score,
                    examPassedAt: new Date().toISOString(),
                    status: 'aprobados' // Pasa a la columna "Aprobados" del Kanban
                });
                playSuccessSound();
            } catch(e) { console.error(e); }
            finally { setSaving(false); }
        }
    };

    // ─── EXAM VIEW ─────────────────────────────────────────────────
    if (examStarted) {
        const correct = examSubmitted ? EXAM_QUESTIONS.filter(q => examAnswers[q.id] === q.correct).length : 0;
        const score = (correct / EXAM_QUESTIONS.length) * 100;
        const passed = score >= 75;

        return (
            <div className="min-h-screen pb-24 text-white relative" style={{ backgroundColor: '#020617' }}>
                <style>{`.tech-bg { background-size: 40px 40px; background-image: linear-gradient(to right, ${hexToRgba(zoneColor, 0.05)} 1px, transparent 1px), linear-gradient(to bottom, ${hexToRgba(zoneColor, 0.05)} 1px, transparent 1px); }`}</style>
                <div className="fixed inset-0 tech-bg pointer-events-none z-0">
                    <div className="absolute top-0 right-0 w-[50vw] h-[50vw] rounded-full blur-[150px] opacity-20" style={{ backgroundColor: zoneColor }} />
                </div>

                <div className="relative z-10 max-w-2xl mx-auto px-6 py-12">
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border" style={{ backgroundColor: hexToRgba(zoneColor, 0.1), borderColor: hexToRgba(zoneColor, 0.3) }}>
                            <Target size={32} style={{ color: zoneColor }} />
                        </div>
                        <h1 className="text-2xl font-[1000] uppercase tracking-widest text-white">Examen de Graduación</h1>
                        <p className="text-white/50 text-sm mt-2">Necesitás el 75% para aprobar y ser activado como Embajador.</p>
                    </div>

                    {!examSubmitted ? (
                        <div className="space-y-6">
                            {EXAM_QUESTIONS.map((q, idx) => (
                                <div key={q.id} className="bg-zinc-900/50 border border-white/5 p-6 rounded-2xl backdrop-blur-sm">
                                    <p className="text-sm font-bold text-white mb-4">{idx + 1}. {q.question}</p>
                                    <div className="space-y-2">
                                        {q.options.map(opt => (
                                            <label key={opt} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${examAnswers[q.id] === opt ? 'border-opacity-100' : 'border-white/5 bg-white/5 hover:bg-white/10'}`}
                                                style={examAnswers[q.id] === opt ? { borderColor: zoneColor, backgroundColor: hexToRgba(zoneColor, 0.1) } : {}}>
                                                <input type="radio" name={q.id} value={opt} checked={examAnswers[q.id] === opt} onChange={() => setExamAnswers({...examAnswers, [q.id]: opt})} className="hidden" />
                                                <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all`} style={{ borderColor: examAnswers[q.id] === opt ? zoneColor : 'rgba(255,255,255,0.2)', backgroundColor: examAnswers[q.id] === opt ? zoneColor : 'transparent' }} />
                                                <span className="text-sm text-white/80">{opt}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            <button
                                onClick={handleExamSubmit}
                                disabled={Object.keys(examAnswers).length < EXAM_QUESTIONS.length}
                                className="w-full py-5 rounded-2xl font-black uppercase tracking-widest text-[12px] text-white flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
                                style={{ background: `linear-gradient(90deg, ${hexToRgba(zoneColor, 0.8)}, ${zoneColor})`, boxShadow: `0 0 30px ${hexToRgba(zoneColor, 0.3)}` }}
                            >
                                <CheckCircle size={18}/> Enviar Respuestas
                            </button>
                        </div>
                    ) : (
                        <div className={`bg-zinc-900/50 border p-10 rounded-3xl text-center backdrop-blur-sm shadow-2xl`} style={{ borderColor: passed ? '#10b981' : '#ef4444' }}>
                            <div className="text-6xl mb-4">{passed ? '🎖️' : '📋'}</div>
                            <h2 className="text-3xl font-[1000] uppercase tracking-widest mb-2" style={{ color: passed ? '#10b981' : '#ef4444' }}>
                                {passed ? '¡APROBADO!' : 'A REPASAR'}
                            </h2>
                            <p className="text-5xl font-black text-white my-4">{Math.round(score)}%</p>
                            <p className="text-white/60 text-sm mb-8">
                                {passed
                                    ? `¡Felicitaciones! Respondiste ${correct} de ${EXAM_QUESTIONS.length} preguntas correctamente. Tu tarjeta en el Radar de Reclutas ya se marcó como APROBADA. El Director de Zona te asignará tu rol oficial.`
                                    : `Respondiste ${correct} de ${EXAM_QUESTIONS.length} correctamente. Revisá los módulos y volvé a intentarlo cuando estés listo.`
                                }
                            </p>
                            {!passed && (
                                <button onClick={() => { setExamStarted(false); setExamSubmitted(false); setExamAnswers({}); }} className="px-8 py-3 rounded-xl font-black uppercase tracking-widest text-sm text-white border border-white/20 hover:bg-white/10 transition-all">
                                    Volver a Estudiar
                                </button>
                            )}
                            {passed && saving && <p className="text-white/40 text-xs animate-pulse">Actualizando tu estado en el sistema...</p>}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // ─── MAIN ACADEMY VIEW ─────────────────────────────────────────
    return (
        <div className="min-h-screen pb-24 text-white relative" style={{ backgroundColor: '#020617' }}>
            <style>{`
                .tech-bg { background-size: 40px 40px; background-image: linear-gradient(to right, ${hexToRgba(zoneColor, 0.05)} 1px, transparent 1px), linear-gradient(to bottom, ${hexToRgba(zoneColor, 0.05)} 1px, transparent 1px); }
                @keyframes pulseGlow { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }
            `}</style>
            <div className="fixed inset-0 tech-bg pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[50vw] h-[50vw] rounded-full blur-[150px] opacity-20" style={{ backgroundColor: zoneColor }} />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020617]/50 to-[#020617]" />
            </div>

            {/* Header */}
            <div className="sticky top-0 backdrop-blur-xl border-b z-10 py-5 px-6" style={{ background: 'rgba(2, 6, 23, 0.9)', borderBottomColor: hexToRgba(zoneColor, 0.3) }}>
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <BookOpen size={22} style={{ color: zoneColor }} />
                        <div>
                            <h1 className="text-lg font-[1000] uppercase tracking-widest text-white">Academia ShopDigital</h1>
                            <p className="text-[9px] uppercase tracking-[0.3em]" style={{ color: zoneColor }}>Bóveda de Entrenamiento · {townId.replace('-', ' ')}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/60">
                        <CheckCircle size={14} style={{ color: zoneColor }} />
                        {completedModules.size}/{ACADEMY_MODULES.length} módulos
                    </div>
                </div>
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-6 py-8 space-y-8">
                {/* Bienvenida */}
                <div className="p-6 rounded-3xl border text-center" style={{ backgroundColor: hexToRgba(zoneColor, 0.05), borderColor: hexToRgba(zoneColor, 0.2) }}>
                    <div className="text-4xl mb-3">🎓</div>
                    <h2 className="text-lg font-black uppercase tracking-widest text-white mb-2">Bienvenido a la Academia</h2>
                    <p className="text-white/60 text-sm leading-relaxed max-w-lg mx-auto">
                        Estudiá cada módulo, completalo y cuando hayas terminado todos, habilitarás el Examen de Graduación. Si aprobás, tu ficha se activará automáticamente y el Director de Zona te asignará tu rol.
                    </p>
                    {/* ARI Badge */}
                    <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-bold uppercase tracking-widest animate-pulse">
                        <Star size={12} /> ARI está disponible en el chat para responderte dudas
                    </div>
                </div>

                {/* Módulos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ACADEMY_MODULES.map((mod, idx) => {
                        const isCompleted = completedModules.has(mod.id);
                        const isOpen = activeModule === mod.id;
                        const isLocked = idx > 0 && !completedModules.has(ACADEMY_MODULES[idx - 1].id);

                        return (
                            <div key={mod.id} className="bg-zinc-900/50 border rounded-2xl overflow-hidden backdrop-blur-sm transition-all" style={{ borderColor: isCompleted ? hexToRgba('#10b981', 0.4) : isOpen ? hexToRgba(zoneColor, 0.3) : 'rgba(255,255,255,0.05)' }}>
                                {/* Module Header */}
                                <button
                                    onClick={() => { if (!isLocked) { playNeonClick(); setActiveModule(isOpen ? null : mod.id); }}}
                                    disabled={isLocked}
                                    className="w-full p-5 flex items-center gap-4 text-left hover:bg-white/5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <span className="text-2xl">{isLocked ? '🔒' : mod.icon}</span>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-black uppercase tracking-wide text-white truncate">{mod.title}</h3>
                                        <p className="text-[10px] text-white/40 uppercase tracking-widest mt-0.5">{mod.duration}</p>
                                    </div>
                                    {isCompleted ? (
                                        <CheckCircle size={20} className="text-emerald-400 flex-shrink-0" />
                                    ) : (
                                        <ChevronRight size={18} className={`text-white/40 flex-shrink-0 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                                    )}
                                </button>

                                {/* Module Content */}
                                {isOpen && (
                                    <div className="px-5 pb-5 border-t border-white/5">
                                        <div className="mt-4 space-y-3">
                                            {mod.content.map((line, i) => (
                                                <p key={i} className="text-sm text-white/70 leading-relaxed flex items-start gap-2">
                                                    <span className="text-xs mt-1" style={{ color: zoneColor }}>▸</span>
                                                    {line}
                                                </p>
                                            ))}
                                        </div>
                                        {!isCompleted && (
                                            <button
                                                onClick={() => markComplete(mod.id)}
                                                className="w-full mt-5 py-3 rounded-xl font-black uppercase tracking-widest text-[11px] text-white flex items-center justify-center gap-2 transition-all active:scale-95"
                                                style={{ background: `linear-gradient(90deg, ${hexToRgba(zoneColor, 0.6)}, ${zoneColor})` }}
                                            >
                                                <CheckCircle size={16} /> Módulo Completado
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Progress Bar */}
                <div className="bg-zinc-900/50 border border-white/5 p-5 rounded-2xl backdrop-blur-sm">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Progreso del Entrenamiento</span>
                        <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: zoneColor }}>{Math.round((completedModules.size / ACADEMY_MODULES.length) * 100)}%</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(completedModules.size / ACADEMY_MODULES.length) * 100}%`, backgroundColor: zoneColor }} />
                    </div>
                </div>

                {/* Exam Button */}
                {allModulesCompleted ? (
                    <button
                        onClick={() => { playNeonClick(); setExamStarted(true); }}
                        className="w-full py-6 rounded-3xl font-black uppercase tracking-[0.25em] text-base text-white flex items-center justify-center gap-3 transition-all active:scale-95 shadow-2xl"
                        style={{ background: `linear-gradient(135deg, #10b981, #059669)`, boxShadow: '0 0 40px rgba(16, 185, 129, 0.4)' }}
                    >
                        <Award size={24} /> ¡Comenzar Examen de Graduación!
                    </button>
                ) : (
                    <div className="w-full py-6 rounded-3xl border border-white/10 bg-white/5 flex items-center justify-center gap-3 text-white/30 text-sm font-black uppercase tracking-widest">
                        <Lock size={18} /> Completá todos los módulos para habilitar el examen
                    </div>
                )}
            </div>
        </div>
    );
};

export default AcademyPage;
