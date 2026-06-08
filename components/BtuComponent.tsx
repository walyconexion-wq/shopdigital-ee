import React, { useState, useEffect } from 'react';
import { 
    FileText, Lightbulb, Landmark, AlertTriangle, Megaphone, 
    Paperclip, Trash2, Edit3, Eye, Zap, CheckCircle2, Clock, 
    Folder, Plus, Check
} from 'lucide-react';
import { db, subirArchivoBunker } from '../firebase';
import { collection, addDoc, doc, setDoc, deleteDoc, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { playNeonClick } from '../utils/audio';

interface BtuComponentProps {
    bunkerId: string;
    townId: string;
    onInjectToAri: (text: string) => void;
}

interface BunkerNote {
    id?: string;
    title: string;
    tipo: '💡 Idea' | '📊 Presupuesto' | '📢 Campaña' | '⚠️ Alerta' | '📄 Informe';
    contenido: string;
    adjuntoUrl?: string;
    adjuntoNombre?: string;
    fechaCreacion: string;
    fechaAlerta?: string;
    atendido: boolean;
    fechaAtendido?: string;
    bunkerId: string;
    townId: string;
}

const getBunkerColors = (bunkerId: string) => {
    // Retorna colores adaptados al búnker para máxima inmersión
    switch (bunkerId.toLowerCase()) {
        case 'director-waly':
        case 'director':
            return {
                hex: '#8b5cf6',
                border: 'border-violet-500/20 focus:border-violet-400',
                shadow: 'shadow-[0_0_15px_rgba(139,92,246,0.15)]',
                text: 'text-violet-400',
                bg: 'bg-violet-500/10',
                hover: 'hover:border-violet-400 hover:bg-violet-500/10'
            };
        case 'administracion':
            return {
                hex: '#f59e0b',
                border: 'border-amber-500/20 focus:border-amber-400',
                shadow: 'shadow-[0_0_15px_rgba(245,158,11,0.15)]',
                text: 'text-amber-400',
                bg: 'bg-amber-500/10',
                hover: 'hover:border-amber-400 hover:bg-amber-500/10'
            };
        case 'contable-legales':
        case 'contabilidad':
            return {
                hex: '#ef4444',
                border: 'border-red-500/20 focus:border-red-400',
                shadow: 'shadow-[0_0_15px_rgba(239,68,68,0.15)]',
                text: 'text-red-400',
                bg: 'bg-red-500/10',
                hover: 'hover:border-red-400 hover:bg-red-500/10'
            };
        case 'marketing':
            return {
                hex: '#10b981',
                border: 'border-emerald-500/20 focus:border-emerald-400',
                shadow: 'shadow-[0_0_15px_rgba(16,185,129,0.15)]',
                text: 'text-emerald-400',
                bg: 'bg-emerald-500/10',
                hover: 'hover:border-emerald-400 hover:bg-emerald-500/10'
            };
        case 'recursos-humanos':
            return {
                hex: '#06b6d4',
                border: 'border-cyan-500/20 focus:border-cyan-400',
                shadow: 'shadow-[0_0_15px_rgba(6,182,212,0.15)]',
                text: 'text-cyan-400',
                bg: 'bg-cyan-500/10',
                hover: 'hover:border-cyan-400 hover:bg-cyan-500/10'
            };
        case 'sistemas':
            return {
                hex: '#6366f1',
                border: 'border-indigo-500/20 focus:border-indigo-400',
                shadow: 'shadow-[0_0_15px_rgba(99,102,241,0.15)]',
                text: 'text-indigo-400',
                bg: 'bg-indigo-500/10',
                hover: 'hover:border-indigo-400 hover:bg-indigo-500/10'
            };
        case 'planificacion-desarrollo':
            return {
                hex: '#3b82f6',
                border: 'border-blue-500/20 focus:border-blue-400',
                shadow: 'shadow-[0_0_15px_rgba(59,130,246,0.15)]',
                text: 'text-blue-400',
                bg: 'bg-blue-500/10',
                hover: 'hover:border-blue-400 hover:bg-blue-500/10'
            };
        case 'inversion-exponencial':
            return {
                hex: '#eab308',
                border: 'border-yellow-500/20 focus:border-yellow-400',
                shadow: 'shadow-[0_0_15px_rgba(234,179,8,0.15)]',
                text: 'text-yellow-400',
                bg: 'bg-yellow-500/10',
                hover: 'hover:border-yellow-400 hover:bg-yellow-500/10'
            };
        case 'mantenimiento':
            return {
                hex: '#64748b',
                border: 'border-slate-500/20 focus:border-slate-400',
                shadow: 'shadow-[0_0_15px_rgba(100,116,139,0.15)]',
                text: 'text-slate-400',
                bg: 'bg-slate-500/10',
                hover: 'hover:border-slate-400 hover:bg-slate-500/10'
            };
        case 'secops':
            return {
                hex: '#10b981',
                border: 'border-emerald-500/20 focus:border-emerald-400',
                shadow: 'shadow-[0_0_15px_rgba(16,185,129,0.18)]',
                text: 'text-emerald-400',
                bg: 'bg-emerald-500/10',
                hover: 'hover:border-emerald-400 hover:bg-emerald-500/10'
            };
        default:
            return {
                hex: '#f59e0b',
                border: 'border-amber-500/20 focus:border-amber-400',
                shadow: 'shadow-[0_0_15px_rgba(245,158,11,0.15)]',
                text: 'text-amber-400',
                bg: 'bg-amber-500/10',
                hover: 'hover:border-amber-400 hover:bg-amber-500/10'
            };
    }
};

export const BtuComponent: React.FC<BtuComponentProps> = ({ bunkerId, townId, onInjectToAri }) => {
    const theme = getBunkerColors(bunkerId);

    // List of notes states
    const [notes, setNotes] = useState<BunkerNote[]>([]);
    
    // Form states
    const [noteId, setNoteId] = useState<string | null>(null);
    const [title, setTitle] = useState('');
    const [type, setType] = useState<BunkerNote['tipo']>('💡 Idea');
    const [content, setContent] = useState('');
    const [alertDate, setAlertDate] = useState('');
    const [attachmentUrl, setAttachmentUrl] = useState('');
    const [attachmentName, setAttachmentName] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Live clock for comparing alarms
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Subscribe to Firestore notes
    useEffect(() => {
        const q = query(
            collection(db, 'bunker_notes'),
            where('bunkerId', '==', bunkerId),
            where('townId', '==', townId),
            orderBy('fechaCreacion', 'desc')
        );

        const unsub = onSnapshot(q, (snap) => {
            const list = snap.docs.map(docSnap => ({
                id: docSnap.id,
                ...docSnap.data()
            })) as BunkerNote[];
            setNotes(list);
        }, (err) => {
            console.error("Firestore BTU subscription error:", err);
        });

        return () => unsub();
    }, [bunkerId, townId]);

    // Handle File Attachment
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        playNeonClick();
        setIsUploading(true);
        try {
            const path = `bunker_notes/${bunkerId}/${Date.now()}_${file.name}`;
            const downloadUrl = await subirArchivoBunker(file, path);
            setAttachmentUrl(downloadUrl);
            setAttachmentName(file.name);
        } catch (error) {
            console.error("Error uploading file:", error);
            alert("No se pudo subir el archivo.");
        } finally {
            setIsUploading(false);
        }
    };

    // Save Note
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) return;
        playNeonClick();
        setIsSaving(true);

        const noteData: Omit<BunkerNote, 'id'> = {
            title: title.trim(),
            tipo: type,
            contenido: content.trim(),
            bunkerId,
            townId,
            fechaCreacion: new Date().toISOString(),
            atendido: false
        };

        if (alertDate) {
            noteData.fechaAlerta = new Date(alertDate).toISOString();
        }
        if (attachmentUrl) {
            noteData.adjuntoUrl = attachmentUrl;
            noteData.adjuntoNombre = attachmentName;
        }

        try {
            if (noteId) {
                // Update
                await setDoc(doc(db, 'bunker_notes', noteId), {
                    ...noteData,
                    fechaCreacion: notes.find(n => n.id === noteId)?.fechaCreacion || noteData.fechaCreacion
                }, { merge: true });
            } else {
                // Insert
                await addDoc(collection(db, 'bunker_notes'), noteData);
            }

            // Clear Form
            clearForm();
        } catch (error: any) {
            console.error("Error saving BTU note:", error);
            alert("Error al guardar la nota: " + (error?.message || error));
        } finally {
            setIsSaving(false);
        }
    };

    const clearForm = () => {
        setNoteId(null);
        setTitle('');
        setType('💡 Idea');
        setContent('');
        setAlertDate('');
        setAttachmentUrl('');
        setAttachmentName('');
    };

    // Edit Note
    const handleEdit = (note: BunkerNote) => {
        playNeonClick();
        setNoteId(note.id || null);
        setTitle(note.title);
        setType(note.tipo);
        setContent(note.contenido);
        if (note.fechaAlerta) {
            const dateObj = new Date(note.fechaAlerta);
            // Formatear a datetime-local input string
            const pad = (num: number) => num.toString().padStart(2, '0');
            const formattedDate = `${dateObj.getFullYear()}-${pad(dateObj.getMonth() + 1)}-${pad(dateObj.getDate())}T${pad(dateObj.getHours())}:${pad(dateObj.getMinutes())}`;
            setAlertDate(formattedDate);
        } else {
            setAlertDate('');
        }
        setAttachmentUrl(note.adjuntoUrl || '');
        setAttachmentName(note.adjuntoNombre || '');
    };

    // Delete Note
    const handleDelete = async (id: string) => {
        playNeonClick();
        if (!window.confirm("¿Seguro que deseas eliminar esta nota táctica?")) return;
        try {
            await deleteDoc(doc(db, 'bunker_notes', id));
            if (noteId === id) clearForm();
        } catch (e) {
            alert("Error al eliminar nota.");
        }
    };

    // Attend Alert
    const handleAttend = async (note: BunkerNote) => {
        playNeonClick();
        if (!note.id) return;
        try {
            await setDoc(doc(db, 'bunker_notes', note.id), {
                atendido: true,
                fechaAtendido: new Date().toISOString()
            }, { merge: true });
        } catch (e) {
            console.error(e);
        }
    };

    // Inject Note into ARI
    const handleInject = (note: BunkerNote) => {
        playNeonClick();
        const injectionText = `[BITÁCORA TÁCTICA]
Térmica: ${note.tipo}
Título: ${note.title}
Contenido: ${note.contenido}${note.adjuntoUrl ? `\nAdjunto del Módulo: ${note.adjuntoUrl}` : ''}`;
        onInjectToAri(injectionText);
    };

    return (
        <div className="w-full relative z-10 max-w-[1600px] mx-auto px-4 md:px-6 mt-8 pb-24 selection:bg-amber-500/20 btu-container">
            <style>{`
                @keyframes alertGlow {
                    0%, 100% { border-color: rgba(239, 68, 68, 0.4); box-shadow: 0 0 10px rgba(239, 68, 68, 0.2); }
                    50% { border-color: rgba(239, 68, 68, 1); box-shadow: 0 0 25px rgba(239, 68, 68, 0.6); }
                }
                .pulse-alert-card {
                    animation: alertGlow 1.5s infinite alternate !important;
                    background: rgba(254, 226, 226, 0.03) !important;
                }
            `}</style>
            
            <div className="bg-black/55 backdrop-blur-2xl border border-white/5 rounded-3xl p-6 shadow-[0_10px_40px_rgba(0,0,0,0.6)] flex flex-col gap-6">
                
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div className="flex items-center gap-3">
                        <Folder size={20} className={theme.text} />
                        <div>
                            <h2 className="text-[14px] font-black uppercase tracking-[0.25em] text-white">
                                Bitácora Táctica Universal (BTU)
                            </h2>
                            <p className="text-[8px] text-white/50 tracking-[0.3em] font-bold uppercase mt-1">
                                Archivo centralizado y gestor de proyectos del Búnker
                            </p>
                        </div>
                    </div>
                    
                    <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-white/10 ${theme.text} bg-white/5`}>
                        {bunkerId.toUpperCase()} ZONAL
                    </span>
                </div>

                {/* Split-Screen Dashboard */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* Lado Izquierdo: Formulario de Creación */}
                    <form onSubmit={handleSave} className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[11px] font-black uppercase tracking-wider text-white/70 flex items-center gap-1.5">
                                <Plus size={14} className={theme.text} /> {noteId ? 'Modificar Entrada' : 'Registrar Nueva Entrada'}
                            </h3>
                            {noteId && (
                                <button 
                                    type="button" 
                                    onClick={clearForm}
                                    className="text-[9px] font-bold uppercase tracking-wider text-white/40 hover:text-white transition-colors"
                                >
                                    Cancelar Edición
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Título */}
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase tracking-widest text-white/40 block">Título de Operación</label>
                                <input 
                                    type="text"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    placeholder="Ej: Plan de Expansión..."
                                    required
                                    className={`w-full bg-[#050508] border rounded-xl px-4 py-2.5 text-xs text-white outline-none placeholder:text-white/20 transition-all ${theme.border} ${theme.shadow}`}
                                />
                            </div>

                            {/* Categoría */}
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase tracking-widest text-white/40 block">Categoría Táctica</label>
                                <select 
                                    value={type}
                                    onChange={e => setType(e.target.value as any)}
                                    className={`w-full bg-[#050508] border rounded-xl px-4 py-2.5 text-xs text-white outline-none transition-all ${theme.border} ${theme.shadow}`}
                                >
                                    <option value="💡 Idea">💡 Idea de Operación</option>
                                    <option value="📊 Presupuesto">📊 Presupuesto y Costos</option>
                                    <option value="📢 Campaña">📢 Campaña Comercial</option>
                                    <option value="⚠️ Alerta">⚠️ Alerta / Recordatorio</option>
                                    <option value="📄 Informe">📄 Informe Administrativo</option>
                                </select>
                            </div>
                        </div>

                        {/* Fecha de Alerta y Archivo Adjunto */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Alerta Temporal */}
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase tracking-widest text-white/40 block">Programar Alerta Visual</label>
                                <input 
                                    type="datetime-local"
                                    value={alertDate}
                                    onChange={e => setAlertDate(e.target.value)}
                                    className={`w-full bg-[#050508] border rounded-xl px-4 py-2.5 text-xs text-white outline-none transition-all ${theme.border} ${theme.shadow}`}
                                />
                            </div>

                            {/* Carga de Adjuntos */}
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase tracking-widest text-white/40 block">Documento de Respaldo</label>
                                <div className="relative">
                                    <input 
                                        type="file" 
                                        id={`btu-file-${bunkerId}`}
                                        onChange={handleFileChange}
                                        className="hidden"
                                        accept="image/*,application/pdf"
                                    />
                                    <label 
                                        htmlFor={`btu-file-${bunkerId}`}
                                        className={`w-full bg-[#050508] border rounded-xl px-4 py-2.5 text-xs text-white/60 hover:text-white outline-none transition-all cursor-pointer flex items-center justify-between ${theme.border} ${theme.shadow}`}
                                    >
                                        <span className="truncate max-w-[180px]">{isUploading ? 'Subiendo archivo...' : attachmentName || 'Adjuntar Foto / PDF'}</span>
                                        <Paperclip size={14} className={isUploading ? 'animate-spin' : theme.text} />
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Cuadro de Contenido */}
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black uppercase tracking-widest text-white/40 block">Cuerpo de la Nota</label>
                            <textarea 
                                value={content}
                                onChange={e => setContent(e.target.value)}
                                placeholder="Escribe los detalles tácticos de esta operación..."
                                required
                                rows={8}
                                className={`w-full bg-[#050508] border rounded-xl px-4 py-3 text-xs text-white outline-none placeholder:text-white/20 transition-all resize-y ${theme.border} ${theme.shadow}`}
                            />
                        </div>

                        {/* Botón de Guardado */}
                        <button
                            type="submit"
                            disabled={isSaving || isUploading}
                            className={`w-full py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest border transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${
                                noteId 
                                    ? 'bg-yellow-500/10 border-yellow-500/35 text-yellow-400 hover:bg-yellow-500 hover:text-black' 
                                    : `bg-white/5 border-white/10 text-white ${theme.hover}`
                            }`}
                        >
                            {isSaving ? 'Guardando entrada...' : noteId ? 'Actualizar Nota en Bitácora' : 'Fijar Nota en Bitácora'}
                        </button>
                    </form>

                    {/* Lado Derecho: El Archivero Scrolled */}
                    <div className="flex flex-col h-full min-h-[350px]">
                        <h3 className="text-[11px] font-black uppercase tracking-wider text-white/70 mb-4 flex items-center gap-1.5 shrink-0">
                            <Clock size={14} className={theme.text} /> Archivero Histórico ({notes.length} Notas)
                        </h3>

                        <div className="flex-1 overflow-y-auto max-h-[360px] pr-1.5 space-y-3 custom-scrollbar">
                            {notes.length === 0 ? (
                                <div className="text-white/25 text-center py-20 font-mono text-[11px]">
                                    [ BITÁCORA VACÍA ]<br/>
                                    No hay registros almacenados.
                                </div>
                            ) : (
                                notes.map(note => {
                                    // Validar si la alerta está activa y desatendida
                                    const isAlertActive = note.fechaAlerta && 
                                                          new Date(note.fechaAlerta).getTime() <= now.getTime() && 
                                                          !note.atendido;

                                    return (
                                        <div 
                                            key={note.id}
                                            className={`p-4 rounded-2xl border transition-all ${
                                                isAlertActive 
                                                    ? 'pulse-alert-card border-red-500' 
                                                    : 'bg-[#030305] border-white/5 hover:border-white/15'
                                            }`}
                                        >
                                            {/* Header de Tarjeta */}
                                            <div className="flex items-start justify-between gap-3 mb-2">
                                                <div>
                                                    <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded border mr-2 ${
                                                        isAlertActive 
                                                            ? 'text-red-400 border-red-500/30 bg-red-500/10 animate-pulse' 
                                                            : 'text-white/50 border-white/10 bg-white/5'
                                                    }`}>
                                                        {note.tipo}
                                                    </span>
                                                    
                                                    {isAlertActive && (
                                                        <span className="text-[8px] font-black text-red-400 animate-pulse">
                                                            ⚠️ ALERTA ACTIVA
                                                        </span>
                                                    )}

                                                    <h4 className="text-xs font-bold text-white mt-1.5 tracking-wide leading-relaxed">{note.title}</h4>
                                                </div>

                                                <span className="text-[8px] text-white/30 font-mono">
                                                    {new Date(note.fechaCreacion).toLocaleDateString('es-AR')}
                                                </span>
                                            </div>

                                            {/* Cuerpo */}
                                            <p className="text-[11px] text-white/60 leading-relaxed font-sans whitespace-pre-line mb-3 border-l border-white/5 pl-2.5">
                                                {note.contenido}
                                            </p>

                                            {/* Adjuntos y Info de Alertas */}
                                            {(note.adjuntoUrl || note.fechaAlerta) && (
                                                <div className="flex flex-wrap gap-2 items-center justify-between border-t border-white/5 pt-2.5 mb-3">
                                                    {note.adjuntoUrl ? (
                                                        <a 
                                                            href={note.adjuntoUrl} target="_blank" rel="noopener noreferrer"
                                                            className="text-[9px] font-bold text-cyan-400 hover:underline flex items-center gap-1"
                                                        >
                                                            <Paperclip size={10} /> {note.adjuntoNombre || 'Ver Adjunto'}
                                                        </a>
                                                    ) : <div />}

                                                    {note.fechaAlerta && (
                                                        <div className="flex items-center gap-1 text-[8.5px] text-white/40 font-mono">
                                                            <Clock size={9} />
                                                            <span>
                                                                Alerta: {new Date(note.fechaAlerta).toLocaleString('es-AR')}
                                                            </span>
                                                            {note.atendido && (
                                                                <span className="text-emerald-400 font-bold ml-1 flex items-center gap-0.5">
                                                                    <Check size={8} /> OK
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Acciones Rápidas */}
                                            <div className="flex items-center justify-between border-t border-white/5 pt-2.5">
                                                <div className="flex items-center gap-1.5">
                                                    {/* Botón Inyectar en ARI */}
                                                    <button
                                                        onClick={() => handleInject(note)}
                                                        className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500 border border-emerald-500/20 hover:border-emerald-400 rounded-lg text-[9px] font-bold uppercase tracking-wider text-emerald-400 hover:text-white transition-all flex items-center gap-1 active:scale-95 shadow-[0_0_10px_rgba(16,185,129,0.05)]"
                                                    >
                                                        <Zap size={9} /> Inyectar en ARI
                                                    </button>

                                                    {/* Atender alerta */}
                                                    {isAlertActive && (
                                                        <button
                                                            onClick={() => handleAttend(note)}
                                                            className="px-2.5 py-1 bg-red-500/10 hover:bg-red-500 border border-red-500/20 hover:border-red-400 rounded-lg text-[9px] font-bold uppercase tracking-wider text-red-400 hover:text-white transition-all flex items-center gap-1 active:scale-95 shadow-[0_0_10px_rgba(239,68,68,0.05)]"
                                                        >
                                                            <CheckCircle2 size={9} /> Atendida
                                                        </button>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-1 shrink-0">
                                                    <button
                                                        onClick={() => handleEdit(note)}
                                                        className="p-1.5 hover:bg-white/5 border border-white/5 hover:border-white/15 rounded-lg text-white/50 hover:text-white transition-colors"
                                                        title="Editar"
                                                    >
                                                        <Edit3 size={11} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(note.id!)}
                                                        className="p-1.5 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 rounded-lg text-white/45 hover:text-red-400 transition-colors"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 size={11} />
                                                    </button>
                                                </div>
                                            </div>

                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
};
