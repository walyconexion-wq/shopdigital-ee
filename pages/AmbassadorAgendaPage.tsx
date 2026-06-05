import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ChevronLeft,
    NotebookPen,
    Camera,
    MapPin,
    Phone,
    User,
    Store,
    CalendarClock,
    Mic,
    Send,
    ListTodo,
    Radar,
    Check,
    Image as ImageIcon
} from 'lucide-react';
import { playNeonClick } from '../utils/audio';
import { AriMerchantAssistant } from '../components/AriMerchantAssistant';
import {
    suscribirseARelevamientos,
    guardarComercio,
    actualizarRelevamiento
} from '../firebase';

interface AgendaNote {
    id: string;
    shopName: string;
    address: string;
    contactName: string;
    phone: string;
    notes: string;
    status: 'pendiente' | 'promocionado' | 'revisitar';
    reminderDate: string;
    photo?: string;
    timestamp: number;
}

const AmbassadorAgendaPage: React.FC = () => {
    const { townId = 'esteban-echeverria' } = useParams<{ townId: string }>();
    const navigate = useNavigate();

    // Tabs state
    const [activeTab, setActiveTab] = useState<'agenda' | 'radar'>('agenda');
    const [prospects, setProspects] = useState<any[]>([]);

    // Local state for the form
    const [formData, setFormData] = useState({
        shopName: '',
        address: '',
        contactName: '',
        phone: '',
        notes: '',
        status: 'pendiente',
        reminderDate: '',
        photo: ''
    });

    const [isRecording, setIsRecording] = useState(false);
    const [notesList, setNotesList] = useState<AgendaNote[]>([]);

    // Load from local storage for persistence across reloads
    useEffect(() => {
        const saved = localStorage.getItem(`agenda_notes_${townId}`);
        if (saved) {
            setNotesList(JSON.parse(saved));
        }
    }, [townId]);

    // Firestore subscription to prospects (relevamientos) in status 'pending'
    useEffect(() => {
        const unsubscribe = suscribirseARelevamientos((leads) => {
            const pendingLeads = leads.filter((l: any) => l.status === 'pending' && l.townId === townId);
            setProspects(pendingLeads);
        }, townId);
        return () => unsubscribe();
    }, [townId]);

    const saveToLocalStorage = (notes: AgendaNote[]) => {
        localStorage.setItem(`agenda_notes_${townId}`, JSON.stringify(notes));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800;
                let width = img.width;
                let height = img.height;

                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);
                setFormData({ ...formData, photo: canvas.toDataURL('image/jpeg', 0.7) });
            };
            img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    const handleVoiceRecord = () => {
        // UI Mockup for recording voice
        playNeonClick();
        setIsRecording(!isRecording);
        if (!isRecording) {
            setTimeout(() => {
                setIsRecording(false);
                setFormData(prev => ({
                    ...prev,
                    notes: prev.notes + (prev.notes ? '\n' : '') + '[Nota de Voz Transcrita]: '
                }));
            }, 3000);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        playNeonClick();
        if (!formData.shopName) {
            alert('El nombre del local es obligatorio.');
            return;
        }

        const newNote: AgendaNote = {
            id: `nota-${Date.now()}`,
            ...formData,
            status: formData.status as any,
            timestamp: Date.now()
        };

        const updatedList = [newNote, ...notesList];
        setNotesList(updatedList);
        saveToLocalStorage(updatedList);

        // Reset form
        setFormData({
            shopName: '',
            address: '',
            contactName: '',
            phone: '',
            notes: '',
            status: 'pendiente',
            reminderDate: '',
            photo: ''
        });
        
        alert('Nota agendada exitosamente.');
    };

    const getCategoryImage = (category: string) => {
        switch (category) {
            case 'pizzerias':
                return 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500';
            case 'barber':
                return 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=500';
            case 'gym':
                return 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500';
            case 'restaurantes':
                return 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500';
            default:
                return 'https://images.unsplash.com/photo-1453728013993-6d66e9c9123a?w=500';
        }
    };

    const handleActivateShop = async (lead: any) => {
        playNeonClick();
        const confirmActivation = window.confirm(`¿Estás seguro de que deseas activar "${lead.name}" en la red?`);
        if (!confirmActivation) return;

        const shopId = lead.id.replace('lead-gmaps-', 'shop-');
        const shopSlug = lead.name.toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

        const newShop = {
            id: shopId,
            slug: `${shopSlug}-${Date.now().toString().slice(-4)}`,
            name: lead.name,
            category: lead.category,
            specialty: `Especialistas en su rubro en ${lead.zone || 'Centro'}.`,
            entityType: 'merchant',
            zone: lead.zone || 'Centro',
            address: lead.address,
            phone: lead.phone || '',
            ownerName: lead.contactName || 'Dueño / Encargado',
            image: getCategoryImage(lead.category),
            bannerImage: getCategoryImage(lead.category),
            description: `Te damos la bienvenida a ${lead.name}. Ofrecemos una experiencia excelente con atención personalizada y beneficios exclusivos para socios VIP de la Red ShopDigital.`,
            mapUrl: `https://maps.google.com/maps?q=${encodeURIComponent(lead.name + ", " + lead.address)}&output=embed`,
            isActive: true,
            status: 'activo',
            townId: townId,
            verified: true,
            visits: 0,
            subscribers: 0,
            schedule: 'Lun-Sáb 9:00 - 20:00 · Dom Cerrado',
            offers: [],
            billingStatus: 'pending',
            billingAmount: 5000,
            createdAt: new Date().toISOString()
        };

        try {
            // Guardar en la colección oficial /comercios
            await guardarComercio(newShop, townId);
            // Cambiar estado en relevamientos a 'activated'
            await actualizarRelevamiento(lead.id, { status: 'activated' });
            alert(`✅ "${lead.name}" fue activado exitosamente en la Red.`);
        } catch (error) {
            console.error("Error al activar comercio:", error);
            alert("Ocurrió un error al activar el comercio.");
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] text-white pb-24 relative overflow-x-hidden selection:bg-emerald-500/30">
            <style>{`
                @keyframes pulseGlowEmerald {
                    0%, 100% { filter: drop-shadow(0 0 15px rgba(16,185,129,0.4)); }
                    50% { filter: drop-shadow(0 0 35px rgba(16,185,129,0.8)); }
                }
                @keyframes pulseGlowCyan {
                    0%, 100% { filter: drop-shadow(0 0 15px rgba(6,182,212,0.4)); }
                    50% { filter: drop-shadow(0 0 35px rgba(6,182,212,0.8)); }
                }
                .tech-grid-bg-emerald {
                    background-size: 30px 30px;
                    background-image: 
                        linear-gradient(to right, rgba(16,185,129,0.04) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(16,185,129,0.04) 1px, transparent 1px);
                }
                .glass-card-neon-emerald {
                    background: linear-gradient(145deg, rgba(255,255,255,0.02), rgba(0,0,0,0.4));
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(16,185,129,0.15);
                    box-shadow: inset 0 0 20px rgba(16,185,129,0.02), 0 8px 32px rgba(0,0,0,0.4);
                }
                .glass-card-neon-cyan {
                    background: linear-gradient(145deg, rgba(255,255,255,0.02), rgba(0,0,0,0.4));
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(6,182,212,0.15);
                    box-shadow: inset 0 0 20px rgba(6,182,212,0.02), 0 8px 32px rgba(0,0,0,0.4);
                }
            `}</style>

            <div className="fixed inset-0 pointer-events-none z-0 tech-grid-bg-emerald" />
            
            {/* Esferas de luz esmeralda */}
            <div className="fixed top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none z-0" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[30vw] h-[30vw] rounded-full bg-emerald-500/5 blur-[100px] pointer-events-none z-0" />

            {/* HEADER STICKY */}
            <div className="sticky top-0 z-40 bg-[#020617]/80 backdrop-blur-xl border-b border-emerald-500/20 pt-6 pb-4 px-6 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
                <div className="flex items-center justify-between mb-4">
                    <button onClick={() => {
                        playNeonClick();
                        navigate(-1);
                    }} className="p-2 bg-white/5 rounded-xl border border-white/10 text-white/70 hover:text-emerald-400 hover:border-emerald-400/50 transition-all active:scale-95">
                        <ChevronLeft size={20} />
                    </button>
                    <div className="flex-1 flex justify-center items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/30" style={{ animation: activeTab === 'agenda' ? 'pulseGlowEmerald 3s infinite' : 'pulseGlowCyan 3s infinite' }}>
                            {activeTab === 'agenda' ? (
                                <NotebookPen size={20} className="text-emerald-400" />
                            ) : (
                                <Radar size={20} className="text-cyan-400" />
                            )}
                        </div>
                        <div>
                            <h1 className="text-[12px] sm:text-sm font-black uppercase tracking-widest text-white leading-none text-center">Agenda Táctica</h1>
                            <span className="text-[9px] font-bold text-emerald-500/60 uppercase tracking-widest block text-center mt-1">CRM de Campo</span>
                        </div>
                    </div>
                    <div className="w-10" />
                </div>
            </div>

            {/* PANEL ARI INLINE */}
            <div className="relative z-10 px-5 mt-6 mb-8 max-w-lg mx-auto">
                <AriMerchantAssistant 
                    shop={{ id: 'agenda', name: 'CRM Embajador' } as any}
                    role="ambassador-crm"
                    townId={townId}
                    inline={true}
                />
            </div>

            {/* TABS SELECTION */}
            <div className="px-5 max-w-lg mx-auto relative z-10 mb-8">
                <div className="flex bg-black/40 border border-white/10 rounded-2xl p-1.5 backdrop-blur-md">
                    <button
                        type="button"
                        onClick={() => { playNeonClick(); setActiveTab('agenda'); }}
                        className={`flex-1 py-3 text-center rounded-xl font-black uppercase tracking-widest text-[10px] sm:text-xs transition-all ${
                            activeTab === 'agenda'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                            : 'text-white/40 hover:text-white/70'
                        }`}
                    >
                        📝 Anotador
                    </button>
                    <button
                        type="button"
                        onClick={() => { playNeonClick(); setActiveTab('radar'); }}
                        className={`flex-1 py-3 text-center rounded-xl font-black uppercase tracking-widest text-[10px] sm:text-xs transition-all flex items-center justify-center gap-2 ${
                            activeTab === 'radar'
                            ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                            : 'text-white/40 hover:text-white/70'
                        }`}
                    >
                        <Radar size={12} className={activeTab === 'radar' ? 'animate-pulse' : ''} />
                        Radar ({prospects.length})
                    </button>
                </div>
            </div>

            <div className="px-5 max-w-lg mx-auto relative z-10 space-y-8">
                {activeTab === 'agenda' ? (
                    <>
                        {/* Formulario de Anotador */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 flex items-center gap-2 mb-4 px-2">
                                <NotebookPen size={14} /> Nueva Nota / Visita
                            </h2>

                            <div className="glass-card-neon-emerald rounded-3xl p-5 space-y-4">
                                {/* Comercio */}
                                <div className="focus-within:bg-white/[0.01] rounded-xl transition-colors">
                                    <label className="text-[9px] font-bold uppercase tracking-[0.1em] text-white/40 mb-1 flex items-center gap-1">
                                        <Store size={10} /> Comercio / Local
                                    </label>
                                    <input
                                        required
                                        placeholder="Ej: Kiosco Don Manolo"
                                        value={formData.shopName}
                                        onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                                        className="w-full bg-transparent border-b border-white/10 pb-2 text-white text-sm focus:outline-none focus:border-emerald-400 transition-all"
                                    />
                                </div>

                                {/* Dirección */}
                                <div className="focus-within:bg-white/[0.01] rounded-xl transition-colors">
                                    <label className="text-[9px] font-bold uppercase tracking-[0.1em] text-white/40 mb-1 flex items-center gap-1">
                                        <MapPin size={10} /> Dirección
                                    </label>
                                    <input
                                        placeholder="Ej: San Martín 123"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        className="w-full bg-transparent border-b border-white/10 pb-2 text-white text-sm focus:outline-none focus:border-emerald-400 transition-all"
                                    />
                                </div>

                                {/* Contacto & Teléfono */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="focus-within:bg-white/[0.01] rounded-xl transition-colors">
                                        <label className="text-[9px] font-bold uppercase tracking-[0.1em] text-white/40 mb-1 flex items-center gap-1">
                                            <User size={10} /> Dueño / Contacto
                                        </label>
                                        <input
                                            placeholder="Ej: Carlos"
                                            value={formData.contactName}
                                            onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                                            className="w-full bg-transparent border-b border-white/10 pb-2 text-white text-sm focus:outline-none focus:border-emerald-400 transition-all"
                                        />
                                    </div>
                                    <div className="focus-within:bg-white/[0.01] rounded-xl transition-colors">
                                        <label className="text-[9px] font-bold uppercase tracking-[0.1em] text-white/40 mb-1 flex items-center gap-1">
                                            <Phone size={10} /> Teléfono
                                        </label>
                                        <input
                                            type="tel"
                                            placeholder="Ej: 11223344"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full bg-transparent border-b border-white/10 pb-2 text-white text-sm focus:outline-none focus:border-emerald-400 transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Estado y Recordatorio */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="focus-within:bg-white/[0.01] rounded-xl transition-colors">
                                        <label className="text-[9px] font-bold uppercase tracking-[0.1em] text-white/40 mb-1">Estado</label>
                                        <select
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                            className="w-full bg-transparent border-b border-white/10 pb-2 text-white text-sm focus:outline-none focus:border-emerald-400 transition-all"
                                        >
                                            <option value="pendiente" className="bg-zinc-900">Pendiente / Sin dueño</option>
                                            <option value="promocionado" className="bg-zinc-900">Sticker Colocado / Promocionado</option>
                                            <option value="revisitar" className="bg-zinc-900">Revisitar / Seguimiento</option>
                                        </select>
                                    </div>
                                    <div className="focus-within:bg-white/[0.01] rounded-xl transition-colors">
                                        <label className="text-[9px] font-bold uppercase tracking-[0.1em] text-white/40 mb-1 flex items-center gap-1">
                                            <CalendarClock size={10} /> Recordatorio
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.reminderDate}
                                            onChange={(e) => setFormData({ ...formData, reminderDate: e.target.value })}
                                            className="w-full bg-transparent border-b border-white/10 pb-2 text-white text-sm focus:outline-none focus:border-emerald-400 transition-all [color-scheme:dark]"
                                        />
                                    </div>
                                </div>

                                {/* Notas y Voz */}
                                <div className="focus-within:bg-white/[0.01] rounded-xl transition-colors pt-2">
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-[9px] font-bold uppercase tracking-[0.1em] text-white/40 block">Anotaciones / Memorias</label>
                                        <button 
                                            type="button" 
                                            onClick={handleVoiceRecord}
                                            className={`p-2 rounded-xl transition-all ${isRecording ? 'bg-red-500/20 text-red-400 animate-pulse border border-red-500/50' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}
                                        >
                                            <Mic size={14} />
                                        </button>
                                    </div>
                                    <textarea
                                        rows={3}
                                        placeholder="Ej: Me atendió la empleada. Dijo que el miércoles a la tarde está el dueño."
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        className="w-full bg-transparent border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-emerald-400 transition-all resize-none"
                                    />
                                </div>

                                {/* Foto */}
                                <div className="pt-2">
                                    <label className="text-[9px] font-bold uppercase tracking-[0.1em] text-white/40 mb-2 block">Foto del Local o Tarjeta</label>
                                    
                                    <input
                                        id="image-file-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                    <input
                                        id="image-camera-upload"
                                        type="file"
                                        accept="image/*"
                                        capture="environment"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />

                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            type="button"
                                            onClick={() => document.getElementById('image-file-upload')?.click()}
                                            className="flex flex-col items-center justify-center py-6 border border-white/10 rounded-2xl bg-slate-950/60 hover:bg-emerald-500/5 hover:border-emerald-400/50 transition-all active:scale-95 cursor-pointer"
                                            style={{ color: '#ffffff' }}
                                        >
                                            <ImageIcon size={22} className="text-emerald-400 mb-2" />
                                            <span className="text-[9px] font-black uppercase tracking-widest text-white/70">Subir Archivo</span>
                                            <span className="text-[7px] text-white/40 uppercase tracking-widest mt-1">Galería</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => document.getElementById('image-camera-upload')?.click()}
                                            className="flex flex-col items-center justify-center py-6 border border-white/10 rounded-2xl bg-slate-950/60 hover:bg-emerald-500/5 hover:border-emerald-400/50 transition-all active:scale-95 cursor-pointer"
                                            style={{ color: '#ffffff' }}
                                        >
                                            <Camera size={22} className="text-emerald-400 mb-2" />
                                            <span className="text-[9px] font-black uppercase tracking-widest text-white/70">Tomar Foto</span>
                                            <span className="text-[7px] text-white/40 uppercase tracking-widest mt-1">Cámara</span>
                                        </button>
                                    </div>

                                    {formData.photo && (
                                        <div className="mt-4 relative w-full h-32 rounded-xl overflow-hidden border border-emerald-400/30">
                                            <img src={formData.photo} alt="Preview" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                </div>

                                {/* Submit */}
                                <button 
                                    type="submit"
                                    className="w-full glass-action-btn bg-emerald-900/40 border border-emerald-500 py-4 rounded-xl flex items-center justify-center gap-2 font-black uppercase tracking-[0.2em] text-[11px] shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-95 transition-all text-white mt-4"
                                >
                                    <Send size={16} /> Guardar Anotación
                                </button>
                            </div>
                        </form>

                        {/* Radar de Tareas / Visitas Recientes */}
                        <div className="pt-6">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 flex items-center gap-2 mb-4 px-2">
                                <ListTodo size={14} /> Historial y Recordatorios
                            </h2>
                            
                            <div className="space-y-3">
                                {notesList.length === 0 ? (
                                    <div className="text-center p-6 border border-white/5 rounded-2xl bg-white/[0.02]">
                                        <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">No hay anotaciones aún</span>
                                    </div>
                                ) : (
                                    notesList.map(note => (
                                        <div key={note.id} className="glass-card-neon-emerald rounded-2xl p-4 relative overflow-hidden">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-black text-white text-sm flex items-center gap-2">
                                                    <Store size={12} className="text-emerald-400" /> {note.shopName}
                                                </h3>
                                                <span className={`text-[8px] font-bold uppercase tracking-widest px-2 py-1 rounded-md ${
                                                    note.status === 'promocionado' ? 'bg-emerald-500/20 text-emerald-400' :
                                                    note.status === 'revisitar' ? 'bg-amber-500/20 text-amber-400' :
                                                    'bg-white/10 text-white/50'
                                                }`}>
                                                    {note.status}
                                                </span>
                                            </div>
                                            
                                            {note.contactName && (
                                                <p className="text-[10px] text-white/60 mb-1 flex items-center gap-1">
                                                    <User size={10} /> {note.contactName} {note.phone && `- ${note.phone}`}
                                                </p>
                                            )}
                                            {note.address && (
                                                <p className="text-[10px] text-white/60 mb-2 flex items-center gap-1">
                                                    <MapPin size={10} /> {note.address}
                                                </p>
                                            )}
                                            
                                            {note.notes && (
                                                <div className="bg-black/40 rounded-lg p-3 mt-2 border border-white/5">
                                                    <p className="text-[11px] text-emerald-50/80 italic whitespace-pre-wrap">{note.notes}</p>
                                                </div>
                                            )}
                                            
                                            <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/10">
                                                <span className="text-[8px] text-white/30 uppercase tracking-widest">
                                                    {new Date(note.timestamp).toLocaleDateString()}
                                                </span>
                                                {note.reminderDate && (
                                                    <span className="text-[9px] text-emerald-400 font-bold flex items-center gap-1">
                                                        <CalendarClock size={10} /> {new Date(note.reminderDate).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    // Radar Tab Content
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400 flex items-center gap-2 mb-4 px-2">
                            <Radar size={14} className="animate-pulse" /> Prospectos Detectados (Google Maps)
                        </h2>

                        {prospects.length === 0 ? (
                            <div className="text-center p-12 border border-white/5 rounded-3xl bg-white/[0.01] flex flex-col items-center justify-center gap-4">
                                <Radar size={40} className="text-white/20 animate-pulse" />
                                <div className="space-y-1">
                                    <span className="text-[10px] text-white/40 uppercase tracking-widest font-black block">No hay prospectos en radar</span>
                                    <span className="text-[8px] text-white/25 uppercase tracking-widest block text-center max-w-xs leading-relaxed">ARI puede rastrear prospectos satelitalmente desde la consola central y enviarlos aquí.</span>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {prospects.map((prospect) => (
                                    <div key={prospect.id} className="glass-card-neon-cyan rounded-3xl p-5 relative overflow-hidden flex flex-col gap-4 border border-cyan-500/10">
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                    <span className="text-[16px]">{
                                                        prospect.category === 'pizzerias' ? '🍕' :
                                                        prospect.category === 'barber' ? '✂️' :
                                                        prospect.category === 'gym' ? '💪' :
                                                        prospect.category === 'restaurantes' ? '🍴' : '🏪'
                                                    }</span>
                                                    <h3 className="font-black text-white text-base leading-tight uppercase">{prospect.name}</h3>
                                                </div>
                                                <span className="text-[8px] bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold uppercase tracking-widest px-2 py-0.5 rounded-md inline-block mb-2">
                                                    {prospect.category}
                                                </span>
                                                
                                                <div className="space-y-1 mt-1">
                                                    <p className="text-[10px] text-white/60 flex items-center gap-1.5">
                                                        <MapPin size={12} className="text-cyan-400" /> {prospect.address}
                                                    </p>
                                                    {prospect.phone && (
                                                        <p className="text-[10px] text-cyan-300/80 flex items-center gap-1.5">
                                                            <Phone size={12} className="text-cyan-400" /> {prospect.phone}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {prospect.digitalDiagnosis?.observations && (
                                            <div className="bg-black/30 rounded-xl p-3 border border-white/5">
                                                <p className="text-[10px] text-cyan-100/60 font-bold uppercase tracking-wider mb-1">Diagnóstico Satelital</p>
                                                <p className="text-[11px] text-cyan-50/80 italic">{prospect.digitalDiagnosis.observations}</p>
                                            </div>
                                        )}

                                        <button
                                            onClick={() => handleActivateShop(prospect)}
                                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-[0.2em] text-[10px] sm:text-[11px] py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all active:scale-95"
                                        >
                                            <Check size={16} /> Activar Comercio en la Red
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AmbassadorAgendaPage;
