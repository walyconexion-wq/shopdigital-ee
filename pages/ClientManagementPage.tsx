import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Shop, Client } from '../types';
import { CATEGORIES } from '../constants';
import {
    ChevronLeft,
    ShieldCheck,
    Store,
    Users,
    MessageSquare,
    ArrowLeft,
    Phone,
    Send,
    Trash2,
    Eye,
    MapPin,
    Search,
    User,
    Edit2,
    X,
    Check,
    Palette,
    IdCard,
    Camera,
    AlertTriangle
} from 'lucide-react';
import { useTownLocalities } from '../hooks/useTownLocalities';
import { playNeonClick } from '../utils/audio';
import { eliminarCliente, guardarCliente } from '../firebase';

interface ClientManagementPageProps {
    allShops: Shop[];
    allClients: Client[];
}

const ClientManagementPage: React.FC<ClientManagementPageProps> = ({ allShops, allClients }) => {
    const { townId = 'esteban-echeverria' } = useParams<{ townId: string }>();
    const navigate = useNavigate();
    const { localities } = useTownLocalities(townId);
    
    // Filtro regional estricto (ADN ShopDigital) 🛡️
    const clientsInZone = useMemo(() => 
        allClients.filter(c => c.townId === townId), 
    [allClients, townId]);

    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
    const [activeLocation, setActiveLocation] = useState('');
    const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
    const [customMessage, setCustomMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    
    // Estado para edición de socio
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const formattedTown = townId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    // Pre-select first locality of the zone
    useMemo(() => {
        if (localities.length > 0 && !activeLocation) {
            setActiveLocation(localities[0]);
        }
    }, [localities, activeLocation]);

    const selectedCategory = CATEGORIES.find(c => c.id === selectedCategoryId);
    const selectedShop = allShops.find(s => s.id === selectedShopId);

    // =========================================================
    // HELPER MEMOS
    // =========================================================
    const shopToCategoryMap = useMemo(() => {
        const map: Record<string, string> = {};
        allShops.forEach(shop => { map[shop.id] = shop.category; });
        return map;
    }, [allShops]);

    const normalize = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    const shopToLocalityMap = useMemo(() => {
        const map: Record<string, string> = {};
        allShops.forEach(shop => {
            const shopLocNormalized = normalize(shop.zone || "");
            const shopAddrNormalized = normalize(shop.address || "");
            const matchedLoc = localities.find(loc => {
                const locNorm = normalize(loc);
                return shopLocNormalized.includes(locNorm) || shopAddrNormalized.includes(locNorm);
            });
            map[shop.id] = matchedLoc || (localities.length > 0 ? localities[0] : 'Centro');
        });
        return map;
    }, [allShops, localities]);

    // Mapeo dinámico de clientes a localidad (ADN ShopDigital 3.1) 🧬
    const clientToLocalityMap = useMemo(() => {
        const map: Record<string, string> = {};
        clientsInZone.forEach(client => {
            // 1. Si el cliente tiene localidad explícita, usarla.
            // 2. Si no, heredar la del comercio de origen.
            map[client.id] = client.locality || shopToLocalityMap[client.sourceShopId] || (localities.length > 0 ? localities[0] : 'Centro');
        });
        return map;
    }, [clientsInZone, shopToLocalityMap, localities]);

    // Conteo regionalizado
    const clientCountByCategory = useMemo(() => {
        const counts: Record<string, number> = {};
        CATEGORIES.forEach(cat => counts[cat.id] = 0);
        clientsInZone.forEach(client => {
            const catId = shopToCategoryMap[client.sourceShopId];
            if (catId) counts[catId]++;
        });
        return counts;
    }, [clientsInZone, shopToCategoryMap]);

    // Comercios filtrados por Rubro + Localidad + TOWNID (BLINDAJE TOTAL 🛡️)
    const shopsWithClients = useMemo(() => {
        if (!selectedCategoryId) return [];
        
        // 1. Identificar qué comercios tienen socios en la localidad ACTIVA
        const countsByShopAndLocality: Record<string, number> = {};
        clientsInZone.forEach(c => {
            const clientLoc = clientToLocalityMap[c.id];
            if (clientLoc === activeLocation) {
                countsByShopAndLocality[c.sourceShopId] = (countsByShopAndLocality[c.sourceShopId] || 0) + 1;
            }
        });

        // 2. Filtrar comercios que tengan socios en esta localidad específica
        return allShops.filter(shop => 
            shop.category === selectedCategoryId &&
            (countsByShopAndLocality[shop.id] || 0) > 0
        ).map(shop => ({
            ...shop,
            clientCount: countsByShopAndLocality[shop.id] || 0
        }));
    }, [selectedCategoryId, activeLocation, allShops, clientsInZone, clientToLocalityMap]);

    // Clientes del comercio seleccionado con búsqueda táctica
    const filteredShopClients = useMemo(() => {
        if (!selectedShopId) return [];
        const baseClients = clientsInZone.filter(c => c.sourceShopId === selectedShopId);
        if (!searchTerm) return baseClients;
        return baseClients.filter(c => 
            normalize(c.name || '').includes(normalize(searchTerm)) ||
            c.phone.includes(searchTerm) ||
            (c.dni && c.dni.includes(searchTerm))
        );
    }, [selectedShopId, clientsInZone, searchTerm]);

    useMemo(() => {
        if (selectedShop) {
            const catSlug = CATEGORIES.find(c => c.id === selectedShop.category)?.slug || 'comercio';
            setCustomMessage(`¡Hola! 👋 Bienvenido al grupo VIP de *${selectedShop.name}*. Descargá acá tu Credencial VIP personalizada: https://shopdigital.tech/${townId}/${catSlug}/${selectedShop.slug}/credencial-vip`);
        }
    }, [selectedShop, townId]);

    // =========================================================
    // ACTIONS
    // =========================================================
    const openWhatsApp = (client: Client, baseMessage: string) => {
        playNeonClick();
        const formattedPhone = client.phone.replace(/\D/g, '');
        const shop = allShops.find(s => s.id === client.sourceShopId);
        const catSlug = CATEGORIES.find(c => c.id === shop?.category)?.slug || 'comercio';
        const credentialLink = `\n\nTu Credencial VIP: https://shopdigital.tech/${townId}/${catSlug}/${shop?.slug || 'club'}/credencial-vip/${client.id}`;
        const fullMessage = baseMessage + credentialLink;
        const url = `https://wa.me/549${formattedPhone}?text=${encodeURIComponent(fullMessage)}`;
        window.open(url, '_blank');
    };

    const handleBulkMessage = () => {
        playNeonClick();
        if (filteredShopClients.length === 0) return;
        if (window.confirm(`Se intentarán abrir ${filteredShopClients.length} pestañas de WhatsApp. ¿Continuar?`)) {
            const shop = allShops.find(s => s.id === selectedShopId);
            const catSlug = CATEGORIES.find(c => c.id === shop?.category)?.slug || 'comercio';
            filteredShopClients.forEach(client => {
                const formattedPhone = client.phone.replace(/\D/g, '');
                const credentialLink = `\n\nTu Credencial VIP: https://shopdigital.tech/${townId}/${catSlug}/${shop?.slug || 'club'}/credencial-vip/${client.id}`;
                const fullMessage = customMessage + credentialLink;
                const url = `https://wa.me/549${formattedPhone}?text=${encodeURIComponent(fullMessage)}`;
                window.open(url, '_blank');
            });
        }
    };

    const handleSaveClient = async () => {
        if (!editingClient) return;
        setIsSaving(true);
        try {
            await guardarCliente(editingClient, townId);
            playNeonClick();
            setEditingClient(null);
        } catch (error) {
            alert("Error al guardar cambios.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteClient = async (client: Client) => {
        if (window.confirm(`¿Seguro que querés eliminar a ${client.name}?`)) {
            playNeonClick();
            try { await eliminarCliente(client.id); } 
            catch (error) { alert("Error al eliminar cliente."); }
        }
    };

    // =========================================================
    // RENDER VIEW 1: CATEGORY GRID
    // =========================================================
    if (!selectedCategoryId) {
        return (
            <div className="min-h-screen bg-black text-white pb-24 relative overflow-x-hidden selection:bg-cyan-500/30">
                <div className="fixed inset-0 pointer-events-none z-0">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.02)_1px,transparent_1px)] bg-[size:30px_30px]" />
                </div>

                <div className="bg-zinc-900/50 backdrop-blur-md pt-8 pb-6 px-6 flex flex-col items-center border-b border-cyan-500/20 mb-6 sticky top-0 z-50">
                    <button onClick={() => { playNeonClick(); navigate(`/${townId}/embajador`); }} 
                        className="self-start mb-4 w-10 h-10 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-400/30 hover:bg-cyan-500/20 transition-all shadow-lg active:scale-95">
                        <ChevronLeft size={20} />
                    </button>
                    <div className="flex items-center gap-2 mb-1">
                        <Users size={18} className="text-cyan-400 drop-shadow-md" />
                        <h2 className="text-[17px] font-black text-white uppercase tracking-[0.2em] drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
                            Gestión Clientes · {formattedTown}
                        </h2>
                    </div>
                    <p className="text-[9px] font-bold text-cyan-400/80 uppercase tracking-widest text-center mt-2 px-4">
                        Red VIP Regional: {clientsInZone.length} socios activos
                    </p>
                </div>

                <div className="px-5 grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-lg mx-auto relative z-10 animate-in fade-in duration-700">
                    {CATEGORIES.map(cat => {
                        const count = clientCountByCategory[cat.id] || 0;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => { playNeonClick(); setSelectedCategoryId(cat.id); }}
                                className="glass-card-3d bg-white/[0.03] border border-white/10 hover:border-cyan-500/40 rounded-2xl p-4 flex flex-col items-center gap-2 transition-all active:scale-95 group relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-500/5 rounded-full blur-[20px] pointer-events-none" />
                                <div className="text-cyan-400 group-hover:scale-110 transition-transform">
                                    {cat.icon}
                                </div>
                                <span className="text-[8px] font-black uppercase tracking-widest text-white/70 text-center leading-tight">
                                    {cat.name}
                                </span>
                                {count > 0 && (
                                    <span className="absolute top-2 right-2 bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-[7px] font-black px-1.5 py-0.5 rounded-full">
                                        {count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    }

    // =========================================================
    // RENDER VIEW 3: CLIENT LIST (SHOP SELECTED)
    // =========================================================
    if (selectedShopId && selectedShop) {
        return (
            <div className="min-h-screen bg-black text-white pb-24 relative overflow-x-hidden selection:bg-cyan-500/30">
                <div className="fixed inset-0 pointer-events-none z-0">
                    <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[120px]" />
                </div>

                <div className="bg-zinc-900/50 backdrop-blur-md pt-8 pb-4 px-6 flex flex-col items-center border-b border-cyan-500/20 mb-4 sticky top-0 z-50">
                    <button onClick={() => { playNeonClick(); setSelectedShopId(null); setSearchTerm(''); }}
                        className="self-start mb-3 w-10 h-10 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-400/30 hover:bg-cyan-500/20 transition-all shadow-lg active:scale-95">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex flex-col items-center justify-center">
                        <p className="text-[8px] font-black text-cyan-400/60 uppercase tracking-widest mb-1 italic">{formattedTown} · {activeLocation}</p>
                        <h2 className="text-[14px] font-black text-white uppercase tracking-widest drop-shadow-[0_0_10px_rgba(34,211,238,0.5)] text-center mb-1 pr-2">
                             {selectedShop.name}
                        </h2>
                        <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-[0.2em] bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-400/20">
                            {filteredShopClients.length} Socios VIP Encontrados
                        </span>
                    </div>
                </div>

                <div className="px-5 space-y-6 relative z-10 max-w-lg mx-auto">
                    {/* Buscador Táctico */}
                    <div className="relative group">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400/40 group-focus-within:text-cyan-400 transition-colors" />
                        <input
                            placeholder="BUSCAR POR NOMBRE, DNI O WHATSAPP..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white/[0.02] border border-white/10 p-4 pl-12 rounded-2xl text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-cyan-400/50 transition-all placeholder:text-white/10"
                        />
                    </div>

                    {/* Messaging Panel */}
                    <div className="glass-card-3d bg-white/[0.01] border border-cyan-500/20 rounded-3xl p-5 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-600 to-blue-500" />
                        <h3 className="text-[10px] font-black text-white/70 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <MessageSquare size={14} className="text-cyan-400" /> Plantilla de Invitación
                        </h3>
                        <textarea
                            value={customMessage}
                            onChange={(e) => setCustomMessage(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-2xl p-3 text-xs text-white/90 focus:border-cyan-400/40 focus:outline-none transition-all min-h-[80px]"
                        />
                        <button
                            onClick={handleBulkMessage}
                            className="mt-4 w-full bg-cyan-600 text-white py-3 rounded-xl flex items-center justify-center gap-2 font-black uppercase tracking-widest text-[9px] shadow-lg active:scale-95 transition-all"
                        >
                            <Send size={14} /> Enviar invitación VIP
                        </button>
                    </div>

                    {/* Client List */}
                    <div className="space-y-3">
                        {filteredShopClients.map((client) => (
                            <div key={client.id} className="glass-card-3d bg-white/[0.02] border hover:border-cyan-500/30 border-white/5 rounded-2xl p-4 flex items-center justify-between transition-all group">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 overflow-hidden">
                                        {client.photo ? <img src={client.photo} className="w-full h-full object-cover" /> : <User size={20} />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-[12px] font-[1000] text-white uppercase tracking-tight">{client.name}</p>
                                            {client.status === 'suspended' && (
                                                <span className="text-[7px] bg-red-500 text-white px-1.5 py-0.5 rounded-full font-black uppercase tracking-widest">SUSPENDIDO</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 text-[9px] font-black text-cyan-400/50 uppercase tracking-widest mt-0.5">
                                            <Phone size={10} /> {client.phone}
                                            {client.dni && <><span className="opacity-30">|</span> <IdCard size={10} /> {client.dni}</>}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <button
                                        onClick={() => { playNeonClick(); setEditingClient(client); }}
                                        className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white"
                                        title="Gestionar Identidad"
                                    >
                                        <Edit2 size={15} />
                                    </button>
                                    <button
                                        onClick={() => { 
                                            playNeonClick(); 
                                            const shop = allShops.find(s => s.id === client.sourceShopId);
                                            const catSlug = CATEGORIES.find(c => c.id === shop?.category)?.slug || 'comercio';
                                            window.open(`/${townId}/${catSlug}/${shop?.slug || 'club'}/credencial-vip/${client.id}`, '_blank'); 
                                        }}
                                        className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-cyan-400"
                                    >
                                        <Eye size={15} />
                                    </button>
                                    <button
                                        onClick={() => openWhatsApp(client, customMessage)}
                                        className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400"
                                    >
                                        <Send size={15} className="-ml-0.5" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClient(client)}
                                        className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500"
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* MODAL DE EDICIÓN VIP 💎 */}
                {editingClient && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
                        <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setEditingClient(null)} />
                        <div className="relative w-full max-w-sm glass-card-3d bg-zinc-900 border border-cyan-500/30 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-600 to-blue-500" />
                            
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                                    <ShieldCheck size={18} className="text-cyan-400" /> Gestionar Socio VIP
                                </h3>
                                <button onClick={() => setEditingClient(null)} className="text-white/20 hover:text-white"><X size={20} /></button>
                            </div>

                            <div className="space-y-5">
                                <div>
                                    <label className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em] mb-2 block">Nombre del Titular</label>
                                    <input 
                                        value={editingClient.name}
                                        onChange={(e) => setEditingClient({...editingClient, name: e.target.value})}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-cyan-400 outline-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em] mb-2 block">DNI / ID</label>
                                        <input 
                                            placeholder="Ej: 35.888.111"
                                            value={editingClient.dni || ''}
                                            onChange={(e) => setEditingClient({...editingClient, dni: e.target.value})}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-cyan-400 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em] mb-2 block">Color Credencial</label>
                                        <input 
                                            type="color"
                                            value={editingClient.cardColor || '#22d3ee'}
                                            onChange={(e) => setEditingClient({...editingClient, cardColor: e.target.value})}
                                            className="w-full h-[46px] bg-white/5 border border-white/10 rounded-xl p-1 cursor-pointer"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em] mb-2 block">URL Foto de Perfil</label>
                                    <div className="relative">
                                        <Camera size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                                        <input 
                                            placeholder="https://..."
                                            value={editingClient.photo || ''}
                                            onChange={(e) => setEditingClient({...editingClient, photo: e.target.value})}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 pl-10 text-[10px] text-white focus:border-cyan-400 outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="pt-2">
                                        <label className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em] mb-2 block">Localidad Residencial</label>
                                        <select 
                                            value={editingClient.locality || ''}
                                            onChange={(e) => setEditingClient({...editingClient, locality: e.target.value})}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-[10px] text-white focus:border-cyan-400 outline-none appearance-none"
                                        >
                                            <option value="">(Herencia de Local)</option>
                                            {localities.map(loc => (
                                                <option key={loc} value={loc}>{loc}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="pt-2">
                                        <label className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em] mb-2 block">Estado de Membresía</label>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => setEditingClient({...editingClient, status: 'active'})}
                                                className={`flex-1 py-3 rounded-xl text-[8px] font-black uppercase tracking-widest border transition-all ${editingClient.status !== 'suspended' ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' : 'bg-white/5 border-white/10 text-white/30'}`}
                                            >
                                                Activa
                                            </button>
                                            <button 
                                                onClick={() => setEditingClient({...editingClient, status: 'suspended'})}
                                                className={`flex-1 py-3 rounded-xl text-[8px] font-black uppercase tracking-widest border transition-all ${editingClient.status === 'suspended' ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-white/5 border-white/10 text-white/30'}`}
                                            >
                                                Susp.
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <button 
                                    disabled={isSaving}
                                    onClick={handleSaveClient}
                                    className="w-full bg-cyan-600 hover:bg-cyan-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg flex items-center justify-center gap-2 mt-4"
                                >
                                    {isSaving ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <><Check size={16}/> Guardar Cambios</>}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // =========================================================
    // RENDER VIEW 2: LOCATION TABS + SHOP CARDS
    // =========================================================
    return (
        <div className="min-h-screen bg-black text-white pb-24 relative overflow-x-hidden selection:bg-cyan-500/30">
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px] animate-pulse" />
            </div>

            <div className="bg-zinc-900/50 backdrop-blur-md pt-8 pb-4 px-6 flex flex-col items-center border-b border-cyan-500/20 mb-4 sticky top-0 z-50">
                <button onClick={() => { playNeonClick(); setSelectedCategoryId(null); }}
                    className="self-start mb-3 w-10 h-10 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-400/30 hover:bg-cyan-500/20 transition-all shadow-lg active:scale-95">
                    <ArrowLeft size={20} />
                </button>
                <div className="flex flex-col items-center justify-center">
                    <p className="text-[8px] font-black text-cyan-400/60 uppercase tracking-widest mb-1 italic">ADN {formattedTown}</p>
                    <div className="flex items-center gap-2 mb-1">
                        <Users size={18} className="text-cyan-400" />
                        <h2 className="text-[15px] font-[1000] text-white uppercase tracking-[0.15em] drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
                            {selectedCategory?.name}
                        </h2>
                    </div>
                </div>
            </div>

            <div className="flex justify-center gap-2 px-5 mb-6 relative z-10 overflow-x-auto no-scrollbar scroll-smooth">
                {localities.map((loc) => {
                    const isActive = activeLocation === loc;
                    return (
                        <button
                            key={loc}
                            onClick={() => { playNeonClick(); setActiveLocation(loc); }}
                            className={`px-4 py-3 rounded-2xl font-black uppercase tracking-widest text-[9px] border transition-all duration-300 whitespace-nowrap
                                ${isActive
                                    ? `bg-cyan-500/20 border-cyan-500 text-white shadow-[0_0_20px_rgba(34,211,238,0.2)] scale-105 z-10`
                                    : `bg-white/[0.03] border-white/10 text-white/30 hover:border-white/20`
                                }`}
                        >
                            {loc}
                        </button>
                    );
                })}
            </div>

            <div className="px-5 space-y-4 relative z-10 max-w-lg mx-auto">
                {shopsWithClients.length === 0 ? (
                    <div className="glass-card-3d bg-white/[0.02] border border-dashed border-white/10 rounded-3xl p-12 flex flex-col items-center justify-center gap-4 text-center">
                        <Users size={24} className="text-white/10" />
                        <p className="text-[10px] text-white/30 uppercase tracking-widest font-black leading-relaxed">
                            No se detectaron clientes <br/> VIP en esta zona
                        </p>
                    </div>
                ) : (
                    shopsWithClients.map(shop => (
                        <div key={shop.id} className="glass-card-3d bg-white/[0.02] border border-cyan-500/20 rounded-3xl p-6 overflow-hidden relative transition-all hover:bg-white/[0.04]">
                            <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-cyan-500 text-black shadow-lg">
                                {shop.clientCount} VIP
                            </div>

                            <div className="flex flex-col gap-5">
                                <div>
                                    <h3 className="text-xl font-[1000] text-white uppercase tracking-tighter leading-tight pr-12">
                                        {shop.name}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-2 text-[10px] font-black text-cyan-400/60 uppercase tracking-widest text-shadow-premium">
                                        <MapPin size={12} /> {shop.zone || activeLocation}
                                    </div>
                                </div>
                                
                                <button
                                    onClick={() => { playNeonClick(); setSelectedShopId(shop.id); }}
                                    className="w-full bg-white/5 border border-white/10 hover:border-cyan-500/40 py-4 rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-[0.2em] text-[10px] text-white active:scale-95 transition-all shadow-inner"
                                >
                                    <Eye size={18} className="text-cyan-400" />
                                    <span>Ver Tarjetas VIP</span>
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ClientManagementPage;
