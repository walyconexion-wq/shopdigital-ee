import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    ChevronLeft, Search, Plus, UserCheck, 
    MapPin, Trash2, Zap, Send, FileText, CheckCircle
} from 'lucide-react';
import { Lead } from '../types';
import { suscribirseARelevamientos, eliminarRelevamiento, guardarComercio } from '../firebase';
import { playNeonClick } from '../utils/audio';

const SurveyManagementPage: React.FC = () => {
    const navigate = useNavigate();
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterZone, setFilterZone] = useState('ALL');

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
        return matchesSearch && matchesZone;
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
            
            // Delete from relevamientos or mark as activated. Here we'll delete to keep it clean.
            await eliminarRelevamiento(lead.id);

            alert(`✅ ¡${lead.name} Activado Exitosamente!`);

            // Send WhatsApp Welcome Message
            const phoneStr = lead.phone.replace(/\D/g, '');
            const credencialUrl = `${window.location.origin}/${newShop.category}/${newShop.slug}/credencial`;
            
            const wpMsg = `¡Hola *${lead.contactName}*! 👋\n\nBienvenido a la red de *ShopDigital VIP* 🚀. Ya creamos tu perfil comercial.\n\n👉 *Acá tenés el link a tu Credencial VIP y Catálogo Interactvo:*\n${credencialUrl}\n\n¡Cualquier duda, avisanos!`;
            
            window.open(`https://wa.me/549${phoneStr}?text=${encodeURIComponent(wpMsg)}`, '_blank');
            
        } catch (error) {
            console.error("Error activando lead", error);
            alert("Hubo un error al intentar activar este comercio.");
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
                        <option value="ALL">Todas</option>
                        {uniqueZones.map(z => <option key={z} value={z}>{z}</option>)}
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
                            <div key={lead.id} className="bg-black/60 border border-white/10 rounded-3xl p-5 relative overflow-hidden group hover:border-yellow-500/30 transition-colors pb-16">
                                
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
                                    <p className="text-[11px] font-medium text-white/80">{lead.digitalDiagnosis.missing || "Sin datos."}</p>
                                    {lead.digitalDiagnosis.observations && (
                                        <>
                                            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-white/40 mb-1 mt-3">Observaciones</p>
                                            <p className="text-[10px] italic text-white/60">"{lead.digitalDiagnosis.observations}"</p>
                                        </>
                                    )}
                                </div>

                                <div className="flex justify-between items-center text-[8px] font-black text-white/30 uppercase tracking-[0.2em] border-t border-white/10 pt-3">
                                    <span>Cargado por: {lead.ambassadorName}</span>
                                    <span>{new Date(lead.date).toLocaleDateString()}</span>
                                </div>

                                {/* Floating Actions Bar inside the card to keep it clean */}
                                <div className="absolute bottom-0 left-0 w-full flex bg-zinc-900 border-t border-white/10">
                                    <button 
                                        onClick={() => handleDelete(lead.id, lead.name)}
                                        className="flex-1 py-3 flex items-center justify-center gap-1.5 text-white/40 hover:text-red-400 transition-colors text-[9px] font-black uppercase tracking-widest border-r border-white/5"
                                    >
                                        <Trash2 size={12} /> Borrar
                                    </button>
                                    <button 
                                        onClick={() => handleActivateLead(lead)}
                                        className="flex-[2] bg-gradient-to-r from-yellow-500 to-yellow-600 text-black py-3 flex items-center justify-center gap-2 font-[1000] uppercase tracking-widest text-[9px] shadow-[0_0_20px_rgba(234,179,8,0.3)]"
                                    >
                                        <CheckCircle size={14} /> Activar Comercio
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SurveyManagementPage;
