import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    ChevronLeft, Search, Plus, UserCheck, 
    MapPin, Trash2, Zap, Send, FileText, CheckCircle,
    Edit3, ExternalLink, X, Save, Eye
} from 'lucide-react';
import { Lead } from '../types';
import { suscribirseARelevamientos, eliminarRelevamiento, actualizarRelevamiento, guardarComercio } from '../firebase';
import { playNeonClick } from '../utils/audio';

const SurveyManagementPage: React.FC = () => {
    const navigate = useNavigate();
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterZone, setFilterZone] = useState('ALL');
    const [filterStatus, setFilterStatus] = useState<'ALL' | 'pending' | 'activated'>('pending');

    // Modals state
    const [editingLead, setEditingLead] = useState<Lead | null>(null);
    const [viewingLead, setViewingLead] = useState<Lead | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const unsubscribe = suscribirseARelevamientos((data) => {
            const sorted = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setLeads(sorted as Lead[]);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const filteredLeads = leads.filter(lead => {
        const matchesSearch = lead.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              lead.contactName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesZone = filterZone === 'ALL' || lead.zone === filterZone;
        const leadStatus = lead.status || 'pending'; // Fallback for legacy leads
        const matchesStatus = filterStatus === 'ALL' || leadStatus === filterStatus;
        return matchesSearch && matchesZone && matchesStatus;
    });

    const uniqueZones = Array.from(new Set(leads.map(l => l.zone)));

    const handleActivateLead = async (lead: Lead) => {
        playNeonClick();
        const confirmMsg = `¿Activamos a ${lead.name} como un Comercio en ShopDigital?\xA0\n\nEsto creará su sucursal, credencial y catálogo interactivo.`;
        if (!window.confirm(confirmMsg)) return;

        try {
            // Transform Lead to Shop shape. 
            // In a real scenario we might map more things exactly.
            const newShopId = `shop-${Date.now()}`;
            const slugBase = lead.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
            
            const newShop = {
                id: newShopId,
                slug: slugBase,
                name: lead.name,
                category: "restaurantes-bares", // Default fallback if no match
                address: lead.address,
                phone: lead.phone,
                rating: 5.0,
                specialty: lead.category,
                offers: [],
                bannerImage: '',
                image: ''
            };

            await guardarComercio(newShop);
            
            // Mark as activated instead of deleting
            await actualizarRelevamiento(lead.id, { status: 'activated' });
            
            alert(`✅ ¡${lead.name} Activado Exitosamente!`);
            handleSendWelcomeMessage(lead, newShop);
            
        } catch (error) {
            console.error("Error activando lead", error);
            alert("Hubo un error al intentar activar este comercio.");
        }
    };

    const handleSendWelcomeMessage = (lead: Lead, shop: any) => {
        playNeonClick();
        const phoneStr = lead.phone.replace(/\D/g, '');
        const credencialUrl = `${window.location.origin}/${shop.category}/${shop.slug}/credencial`;
        
        const wpMsg = `¡Hola *${lead.contactName}*! 👋\n\nBienvenido a la red de *ShopDigital VIP* 🚀. Ya creamos tu perfil comercial.\n\n👉 *Acá tenés el link a tu Credencial VIP y Catálogo Interactvo:*\n${credencialUrl}\n\n¡Cualquier duda, avisanos!`;
        
        window.open(`https://wa.me/549${phoneStr}?text=${encodeURIComponent(wpMsg)}`, '_blank');
    };

    const handleSaveEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingLead) return;
        
        playNeonClick();
        setIsSaving(true);
        try {
            await actualizarRelevamiento(editingLead.id, editingLead);
            setEditingLead(null);
        } catch (error) {
            alert("Error al guardar los cambios.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        playNeonClick();
        if (window.confirm(`¿Seguro que querés eliminar el prospecto de ${name}?`)) {
            await eliminarRelevamiento(id);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white pb-24 relative overflow-hidden">
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-yellow-500/10 rounded-full blur-[120px]" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(234,179,8,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(234,179,8,0.02)_1px,transparent_1px)] bg-[size:30px_30px]" />
            </div>

            <div className="bg-zinc-900/80 backdrop-blur-xl border-b border-yellow-500/30 pt-10 pb-6 px-6 relative z-10 sticky top-0 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                <button onClick={() => { playNeonClick(); navigate(-1); }} className="absolute top-10 left-6 text-yellow-400 hover:text-yellow-300">
                    <ChevronLeft size={24} />
                </button>
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-yellow-500/10 rounded-2xl flex items-center justify-center mb-2 border border-yellow-400/30">
                        <UserCheck size={24} className="text-yellow-400" />
                    </div>
                    <h1 className="text-[14px] font-[1000] uppercase tracking-widest text-white text-center">Gestión de<br/>Prospectos</h1>
                </div>
            </div>

            <div className="px-5 mt-6 relative z-10 max-w-lg mx-auto">
                <div className="flex gap-2 mb-6">
                    <div className="relative flex-1">
                        <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                        <input
                            type="text"
                            placeholder="Buscar comercio o contacto..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-[10px] font-black uppercase tracking-widest text-white placeholder:text-white/30 focus:outline-none focus:border-yellow-400/50"
                        />
                    </div>
                    <select
                        value={filterZone}
                        onChange={(e) => setFilterZone(e.target.value)}
                        className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-[10px] font-black uppercase text-white outline-none focus:border-yellow-400/50"
                    >
                        <option value="ALL">Zonas</option>
                        {uniqueZones.map(z => <option key={z} value={z}>{z}</option>)}
                    </select>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as any)}
                        className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-[10px] font-black uppercase text-white outline-none focus:border-yellow-400/50"
                    >
                        <option value="pending">Pendientes</option>
                        <option value="activated">Activados</option>
                        <option value="ALL">Todos</option>
                    </select>
                </div>

                <div className="flex justify-between items-center mb-4 px-2">
                    <p className="text-[9px] font-black text-white/50 uppercase tracking-widest">
                        {filteredLeads.length} Relevamientos
                    </p>
                    <button 
                        onClick={() => { playNeonClick(); navigate('/embajador/relevamiento/nuevo'); }}
                        className="bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 px-3 py-1.5 rounded-lg text-[9px] font-black flex items-center gap-1 uppercase tracking-wider hover:bg-yellow-500/30 transition-colors"
                    >
                        <Plus size={12} /> Cargar Nuevo
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center mt-20"><div className="w-8 h-8 border-2 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin"></div></div>
                ) : filteredLeads.length === 0 ? (
                    <div className="text-center mt-20 opacity-50">
                        <FileText size={32} className="mx-auto mb-3 text-white/40" />
                        <p className="text-[10px] font-black uppercase tracking-widest">No hay prospectos cargados.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredLeads.map(lead => (
                            <div key={lead.id} className={`bg-black/60 border border-white/10 rounded-3xl p-5 relative overflow-hidden group hover:border-yellow-500/30 transition-colors pb-16 ${lead.status === 'activated' ? 'opacity-80' : ''}`}>
                                
                                {lead.status === 'activated' && (
                                    <div className="absolute top-0 right-0 bg-green-500 text-black text-[8px] font-black px-3 py-1 uppercase tracking-widest rounded-bl-xl z-20">
                                        Activado
                                    </div>
                                )}

                                <div className="flex justify-between items-start mb-4">
                                    <div className="pr-4">
                                        <h3 className="text-[16px] font-[1000] text-white uppercase tracking-wider leading-tight">{lead.name}</h3>
                                        <p className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest mt-1">{lead.category}</p>
                                    </div>
                                    <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${lead.digitalDiagnosis.interestLevel === 'high' ? 'bg-green-500 text-black' : lead.digitalDiagnosis.interestLevel === 'medium' ? 'bg-yellow-500 text-black' : 'bg-red-500 text-white'}`}>
                                        <Zap size={14} className={lead.digitalDiagnosis.interestLevel === 'high' ? 'animate-pulse' : ''} />
                                    </div>
                                </div>

                                <div className="space-y-2 mb-4">
                                    <p className="text-[10px] text-white/60 font-medium flex items-center gap-2">
                                        <MapPin size={12} className="text-yellow-400" /> {lead.address} ({lead.zone})
                                    </p>
                                    <p className="text-[10px] text-white/60 font-medium flex items-center gap-2">
                                        <UserCheck size={12} className="text-yellow-400" />Contacto: {lead.contactName} - {lead.phone}
                                    </p>
                                </div>

                                <div className="bg-white/5 rounded-xl p-3 mb-4 border border-white/5">
                                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-white/40 mb-1">Diagnóstico (Dolor)</p>
                                    <p className="text-[11px] font-medium text-white/80 line-clamp-2">{lead.digitalDiagnosis.missing || "Sin datos."}</p>
                                </div>

                                <div className="flex justify-between items-center text-[8px] font-black text-white/30 uppercase tracking-[0.2em] border-t border-white/10 pt-3">
                                    <span>{lead.ambassadorName}</span>
                                    <span>{new Date(lead.date).toLocaleDateString()}</span>
                                </div>

                                {/* Floating Actions Bar */}
                                <div className="absolute bottom-0 left-0 w-full flex bg-zinc-900 border-t border-white/10 z-10">
                                    {lead.status === 'pending' ? (
                                        <>
                                            <button 
                                                onClick={() => { playNeonClick(); setEditingLead(lead); }}
                                                className="flex-1 py-3 flex items-center justify-center gap-1.5 text-white/40 hover:text-cyan-400 transition-colors text-[9px] font-black uppercase tracking-widest border-r border-white/5"
                                            >
                                                <Edit3 size={12} /> Editar
                                            </button>
                                            <button 
                                                onClick={() => handleActivateLead(lead)}
                                                className="flex-[2] bg-gradient-to-r from-yellow-500 to-yellow-600 text-black py-3 flex items-center justify-center gap-2 font-[1000] uppercase tracking-widest text-[9px] shadow-[0_0_20px_rgba(234,179,8,0.3)]"
                                            >
                                                <CheckCircle size={14} /> Activar
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button 
                                                onClick={() => { playNeonClick(); setViewingLead(lead); }}
                                                className="flex-1 py-3 flex items-center justify-center gap-1.5 text-white/40 hover:text-yellow-400 transition-colors text-[9px] font-black uppercase tracking-widest border-r border-white/5"
                                            >
                                                <Eye size={12} /> Ver Datos
                                            </button>
                                            <button 
                                                onClick={() => handleSendWelcomeMessage(lead, { slug: lead.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'), category: 'restaurantes-bares' })}
                                                className="flex-[2] bg-zinc-800 text-white py-3 flex items-center justify-center gap-2 font-[1000] uppercase tracking-widest text-[9px] hover:bg-zinc-700 transition-colors"
                                            >
                                                <Send size={12} /> Reenviar Bienvenida
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* MODAL EDITAR */}
            {editingLead && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-zinc-900 border border-white/10 w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-8 duration-500">
                        <div className="p-6 border-b border-white/5 flex justify-between items-center">
                            <h2 className="text-[12px] font-black uppercase tracking-widest text-yellow-400">Editar Prospecto</h2>
                            <button onClick={() => setEditingLead(null)} className="text-white/40 hover:text-white"><X size={20}/></button>
                        </div>
                        <form onSubmit={handleSaveEdit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto no-scrollbar">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-2 block">Nombre Comercial</label>
                                    <input 
                                        type="text" 
                                        value={editingLead.name}
                                        onChange={e => setEditingLead({...editingLead, name: e.target.value})}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold text-white outline-none focus:border-yellow-500/50"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-2 block">WhatsApp</label>
                                        <input 
                                            type="text" 
                                            value={editingLead.phone}
                                            onChange={e => setEditingLead({...editingLead, phone: e.target.value})}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold text-white outline-none focus:border-yellow-500/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-2 block">Zona</label>
                                        <input 
                                            type="text" 
                                            value={editingLead.zone}
                                            onChange={e => setEditingLead({...editingLead, zone: e.target.value})}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold text-white outline-none focus:border-yellow-500/50"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-2 block">Diagnóstico de Dolor</label>
                                    <textarea 
                                        value={editingLead.digitalDiagnosis.missing}
                                        onChange={e => setEditingLead({...editingLead, digitalDiagnosis: {...editingLead.digitalDiagnosis, missing: e.target.value}})}
                                        rows={3}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-sm font-medium text-white outline-none focus:border-yellow-500/50 resize-none"
                                    />
                                </div>
                            </div>
                            <button 
                                type="submit"
                                disabled={isSaving}
                                className="w-full bg-yellow-500 text-black py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] mt-4 flex items-center justify-center gap-2"
                            >
                                {isSaving ? 'Guardando...' : <><Save size={16}/> Guardar Cambios</>}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL VER DATOS */}
            {viewingLead && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-zinc-900 border border-white/10 w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-8 duration-500">
                        <div className="p-6 border-b border-white/5 flex justify-between items-center">
                            <h2 className="text-[12px] font-black uppercase tracking-widest text-yellow-400">Datos de Relevamiento</h2>
                            <button onClick={() => setViewingLead(null)} className="text-white/40 hover:text-white"><X size={20}/></button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="text-center pb-4 border-b border-white/5">
                                <h3 className="text-2xl font-[1000] text-white uppercase tracking-tighter">{viewingLead.name}</h3>
                                <p className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest mt-1">{viewingLead.category}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <p className="text-[8px] font-black uppercase tracking-widest text-white/40 mb-1">Contacto</p>
                                    <p className="text-[11px] font-bold text-white">{viewingLead.contactName}</p>
                                    <p className="text-[11px] font-bold text-green-400 mt-0.5">{viewingLead.phone}</p>
                                </div>
                                <div>
                                    <p className="text-[8px] font-black uppercase tracking-widest text-white/40 mb-1">Zona / Localidad</p>
                                    <p className="text-[11px] font-bold text-white">{viewingLead.zone}</p>
                                    <p className="text-[10px] font-medium text-white/60 mt-0.5">{viewingLead.address}</p>
                                </div>
                            </div>

                            <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                                <p className="text-[8px] font-black uppercase tracking-widest text-yellow-400 mb-2">Diagnóstico Tactical</p>
                                <p className="text-[12px] font-medium text-white/80 leading-relaxed mb-4">{viewingLead.digitalDiagnosis.missing}</p>
                                
                                <p className="text-[8px] font-black uppercase tracking-widest text-white/40 mb-2">Observaciones</p>
                                <p className="text-[11px] font-medium text-white/60 italic">"{viewingLead.digitalDiagnosis.observations || 'Sin observaciones adicionales.'}"</p>
                            </div>

                            <div className="flex justify-between items-center text-[9px] font-bold text-white/20 uppercase tracking-widest">
                                <span>Activado por {viewingLead.ambassadorName}</span>
                                <span>{new Date(viewingLead.date).toLocaleDateString()}</span>
                            </div>

                            <button 
                                onClick={() => setViewingLead(null)}
                                className="w-full bg-white/5 text-white/60 py-4 rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-white/10"
                            >
                                Cerrar Ventana
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SurveyManagementPage;
