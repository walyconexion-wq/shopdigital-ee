import React, { useState, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Shop, Client } from '../types';
import { ENTERPRISE_CATEGORIES } from '../enterpriseConstants';
import { useTownLocalities } from '../hooks/useTownLocalities';
import {
    ChevronLeft,
    Users,
    MessageSquare,
    ArrowLeft,
    Phone,
    Send,
    Trash2,
    Search,
    User,
    Edit2,
    X,
    Check,
    IdCard,
    Factory,
    Globe,
    CheckCircle,
    XCircle
} from 'lucide-react';
import { playNeonClick } from '../utils/audio';
import { eliminarCliente, guardarCliente } from '../firebase';
import { AriMerchantAssistant } from '../components/AriMerchantAssistant';

interface EnterpriseClientManagementPageProps {
    allShops: Shop[];
    allClients: Client[];
}

const EnterpriseClientManagementPage: React.FC<EnterpriseClientManagementPageProps> = ({ allShops, allClients }) => {
    const { townId = 'esteban-echeverria' } = useParams<{ townId: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    
    // Leer provincia activa del query parameter
    const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
    const provinciaParam = queryParams.get('provincia');

    const { localities } = useTownLocalities(townId);
    
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
    const [activeLocation, setActiveLocation] = useState('');
    const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
    const [customMessage, setCustomMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    
    // Estado para edición de socio comerciante
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const formattedTown = townId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    // Pre-select first locality of the zone
    useMemo(() => {
        if (localities.length > 0 && !activeLocation) {
            setActiveLocation(localities[0]);
        }
    }, [localities, activeLocation]);

    const selectedCategory = ENTERPRISE_CATEGORIES.find(c => c.id === selectedCategoryId);
    const selectedShop = allShops.find(s => s.id === selectedShopId);

    // Mapeos auxiliares
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

    // Filtrar únicamente los clientes B2B (aquellos cuya tienda de origen es una empresa)
    const b2bClientsInZone = useMemo(() => {
        const enterpriseShopIds = new Set(allShops.filter(s => s.entityType === 'enterprise').map(s => s.id));
        return allClients.filter(c => c.townId === townId && enterpriseShopIds.has(c.sourceShopId));
    }, [allClients, allShops, townId]);

    // Mapeo dinámico de clientes comerciantes a localidad
    const clientToLocalityMap = useMemo(() => {
        const map: Record<string, string> = {};
        b2bClientsInZone.forEach(client => {
            map[client.id] = client.locality || shopToLocalityMap[client.sourceShopId] || (localities.length > 0 ? localities[0] : 'Centro');
        });
        return map;
    }, [b2bClientsInZone, shopToLocalityMap, localities]);

    // Conteo regionalizado por categoría B2B
    const clientCountByCategory = useMemo(() => {
        const counts: Record<string, number> = {};
        ENTERPRISE_CATEGORIES.forEach(cat => counts[cat.id] = 0);
        b2bClientsInZone.forEach(client => {
            const catId = shopToCategoryMap[client.sourceShopId];
            if (catId) {
                // Verificar si coincide con la categoría o su slug
                const matchedCat = ENTERPRISE_CATEGORIES.find(c => c.id === catId || c.slug === catId);
                if (matchedCat) {
                    counts[matchedCat.id] = (counts[matchedCat.id] || 0) + 1;
                }
            }
        });
        return counts;
    }, [b2bClientsInZone, shopToCategoryMap]);

    const clientStats = useMemo(() => {
        const total = b2bClientsInZone.length;
        const active = b2bClientsInZone.filter(c => c.status !== 'suspended').length;
        const suspended = total - active;
        return {
            total,
            active,
            suspended,
            engagement: total > 0 ? Math.round((active / total) * 100) : 100
        };
    }, [b2bClientsInZone]);

    // Industrias B2B filtradas por Categoría Industrial + Localidad de la zona
    const industriesWithClients = useMemo(() => {
        if (!selectedCategoryId) return [];
        
        const countsByShopAndLocality: Record<string, number> = {};
        b2bClientsInZone.forEach(c => {
            const clientLoc = clientToLocalityMap[c.id];
            if (clientLoc === activeLocation) {
                countsByShopAndLocality[c.sourceShopId] = (countsByShopAndLocality[c.sourceShopId] || 0) + 1;
            }
        });

        return allShops.filter(shop => 
            shop.townId === townId && 
            shop.entityType === 'enterprise' &&
            (shop.category === selectedCategoryId || shop.category === selectedCategory?.slug) &&
            (countsByShopAndLocality[shop.id] || 0) > 0
        ).map(shop => ({
            ...shop,
            clientCount: countsByShopAndLocality[shop.id] || 0
        }));
    }, [selectedCategoryId, activeLocation, allShops, b2bClientsInZone, clientToLocalityMap, selectedCategory, townId]);

    // Clientes minoristas del comercio industrial seleccionado
    const filteredShopClients = useMemo(() => {
        if (!selectedShopId) return [];
        const baseClients = b2bClientsInZone.filter(c => c.sourceShopId === selectedShopId);
        if (!searchTerm) return baseClients;
        return baseClients.filter(c => 
            normalize(c.name || '').includes(normalize(searchTerm)) ||
            c.phone.includes(searchTerm) ||
            (c.dni && c.dni.includes(searchTerm))
        );
    }, [selectedShopId, b2bClientsInZone, searchTerm]);

    useMemo(() => {
        if (selectedShop) {
            setCustomMessage(`¡Hola! 👋 Te damos la bienvenida como Comerciante VIP en el catálogo industrial de *${selectedShop.name}*. Podés descargar tu Credencial de Comerciante aquí: https://shopdigital.ar/empresas/${selectedShop.category}/${selectedShop.slug || selectedShop.id}/credencial`);
        }
    }, [selectedShop]);

    // =========================================================
    // ACTIONS
    // =========================================================
    const openWhatsApp = (client: Client, baseMessage: string) => {
        playNeonClick();
        const formattedPhone = client.phone.replace(/\D/g, '');
        const shop = allShops.find(s => s.id === client.sourceShopId);
        const catSlug = ENTERPRISE_CATEGORIES.find(c => c.id === shop?.category || c.slug === shop?.category)?.slug || 'insumos';
        const credentialLink = `\n\nTu Credencial de Comerciante: https://shopdigital.ar/empresas/${catSlug}/${shop?.slug || shop?.id || 'club'}/credencial`;
        const fullMessage = baseMessage + credentialLink;
        const url = `https://wa.me/549${formattedPhone}?text=${encodeURIComponent(fullMessage)}`;
        window.open(url, '_blank');
    };

    const handleBulkMessage = () => {
        playNeonClick();
        if (filteredShopClients.length === 0) return;
        if (window.confirm(`Se intentarán abrir ${filteredShopClients.length} pestañas de WhatsApp. ¿Continuar?`)) {
            const shop = allShops.find(s => s.id === selectedShopId);
            const catSlug = ENTERPRISE_CATEGORIES.find(c => c.id === shop?.category || c.slug === shop?.category)?.slug || 'insumos';
            filteredShopClients.forEach(client => {
                const formattedPhone = client.phone.replace(/\D/g, '');
                const credentialLink = `\n\nTu Credencial de Comerciante: https://shopdigital.ar/empresas/${catSlug}/${shop?.slug || shop?.id || 'club'}/credencial`;
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
        if (window.confirm(`¿Seguro que querés eliminar el registro de ${client.name}?`)) {
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
            <div className="min-h-screen bg-black text-white pb-24 relative overflow-hidden selection:bg-cyan-500/30">
                <div className="fixed inset-0 pointer-events-none z-0">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute inset-0 tech-mesh-bg" />
                    <div className="absolute inset-0 tech-dots-bg pointer-events-none" />
                </div>

                {/* Header sticky */}
                <div className="bg-zinc-900/80 backdrop-blur-xl border-b border-cyan-500/30 pt-10 pb-6 px-4 sticky top-0 z-50 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                    <div role="button" tabIndex={0} onClick={() => {
                        playNeonClick();
                        if (provinciaParam) {
                            navigate(`/empresas/tablero-maestro?provincia=${provinciaParam}`);
                        } else {
                            navigate(`/${townId}/tablero-maestro`);
                        }
                    }}
                        className="absolute top-10 left-6 text-cyan-400 hover:text-cyan-300 cursor-pointer">
                        <ChevronLeft size={24} />
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center mb-2 border border-cyan-400/30 shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                            <Users size={24} className="text-cyan-400" />
                        </div>
                        <h1 className="text-xl font-[1000] uppercase tracking-[0.1em] text-white">Clientes Comerciantes</h1>
                        <p className="text-[10px] font-bold text-cyan-400/80 uppercase tracking-widest text-center mt-1">
                            Suscripciones al Catálogo Industrial · {formattedTown}
                        </p>

                        {/* Métricas en vivo */}
                        <div className="w-full max-w-sm mt-4 grid grid-cols-3 gap-2 text-center bg-black/40 p-3 rounded-2xl border border-white/5">
                            <div className="flex flex-col">
                                <span className="text-[8px] text-white/40 uppercase tracking-widest font-bold">Comerciantes</span>
                                <span className="text-xs font-black text-cyan-400">{clientStats.total}</span>
                            </div>
                            <div className="flex flex-col border-x border-white/5">
                                <span className="text-[8px] text-white/40 uppercase tracking-widest font-bold">Activos</span>
                                <span className="text-xs font-black text-green-400">{clientStats.active}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[8px] text-white/40 uppercase tracking-widest font-bold">Zona</span>
                                <span className="text-xs font-black text-white">{formattedTown}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-5 mt-6 relative z-10 max-w-lg mx-auto">
                    {/* ARI Assistant */}
                    <div className="mb-6">
                        <AriMerchantAssistant
                            shop={{ id: 'crm-industrial-bunker', name: 'CRM Industrial B2B', category: 'crm', rating: 5, specialty: 'CRM B2B', address: 'Búnker', image: '', bannerImage: '', offers: [], mapUrl: '' } as any}
                            role="crm_manager"
                            townId={townId}
                            inline={true}
                            clientStats={clientStats}
                        />
                    </div>

                    <h2 className="text-[10px] font-black text-white/50 uppercase tracking-widest pl-2 mb-3 mt-8">Navegación por Rubro Industrial</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 animate-in fade-in duration-700">
                        {ENTERPRISE_CATEGORIES.map(cat => {
                            const count = clientCountByCategory[cat.id] || 0;
                            return (
                                <div
                                    key={cat.id}
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => { playNeonClick(); setSelectedCategoryId(cat.id); }}
                                    className="glass-card-3d bg-white/[0.03] border border-white/10 hover:border-cyan-500/40 rounded-2xl p-4 flex flex-col items-center gap-2 transition-all active:scale-95 group relative overflow-hidden cursor-pointer"
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
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    // =========================================================
    // RENDER VIEW 2: INDUSTRIES LIST BY Rubro & Localidad
    // =========================================================
    if (selectedCategoryId && !selectedShopId) {
        return (
            <div className="min-h-screen bg-black text-white pb-24 relative overflow-x-hidden selection:bg-cyan-500/30">
                <div className="fixed inset-0 pointer-events-none z-0">
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[120px]" />
                </div>

                <div className="bg-zinc-900/50 backdrop-blur-md pt-8 pb-4 px-6 flex flex-col items-center border-b border-cyan-500/20 mb-4 sticky top-0 z-50">
                    <button onClick={() => { playNeonClick(); setSelectedCategoryId(null); }}
                        className="self-start mb-3 w-10 h-10 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-400/30 hover:bg-cyan-500/20 transition-all shadow-lg active:scale-95">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex flex-col items-center justify-center">
                        <p className="text-[8px] font-black text-cyan-400/60 uppercase tracking-widest mb-1 italic">{formattedTown}</p>
                        <h2 className="text-[14px] font-black text-white uppercase tracking-widest drop-shadow-[0_0_10px_rgba(34,211,238,0.5)] text-center mb-1 pr-2">
                            {selectedCategory?.name}
                        </h2>
                        <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-[0.2em] bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-400/20">
                            Empresas Industriales de la Zona
                        </span>
                    </div>
                </div>

                {/* Locality Selector Tab */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar py-2 px-5 mb-6 relative z-10 max-w-lg mx-auto scroll-smooth">
                    {localities.map(loc => {
                        const isActive = activeLocation === loc;
                        return (
                            <button
                                key={loc}
                                onClick={() => { playNeonClick(); setActiveLocation(loc); }}
                                className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                                    isActive
                                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                                        : 'bg-white/5 border-white/10 text-white/50 hover:text-white/80'
                                }`}
                            >
                                {loc}
                            </button>
                        );
                    })}
                </div>

                <div className="px-5 space-y-4 relative z-10 max-w-lg mx-auto">
                    {industriesWithClients.length === 0 ? (
                        <div className="glass-card-3d bg-white/[0.02] border border-white/5 rounded-3xl p-10 flex flex-col items-center justify-center gap-3 text-center">
                            <Factory size={24} className="text-cyan-400/30 animate-pulse" />
                            <p className="text-[9px] text-white/40 uppercase tracking-widest leading-relaxed">
                                Ningún comerciante se ha suscrito a industrias de este rubro en {activeLocation}
                            </p>
                        </div>
                    ) : (
                        industriesWithClients.map(ind => (
                            <div
                                key={ind.id}
                                role="button"
                                tabIndex={0}
                                onClick={() => { playNeonClick(); setSelectedShopId(ind.id); }}
                                className="glass-card-3d bg-white/[0.02] border border-white/10 hover:border-cyan-500/30 rounded-3xl p-5 flex items-center justify-between transition-all active:scale-[0.98] group cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center border border-cyan-400/20">
                                        <Factory size={20} className="text-cyan-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black text-white uppercase tracking-tight group-hover:text-cyan-300 transition-colors">
                                            {ind.name}
                                        </h3>
                                        <p className="text-[8px] font-black text-cyan-400/50 uppercase tracking-widest mt-1">
                                            {ind.clientCount} Comerciantes Suscritos
                                        </p>
                                    </div>
                                </div>
                                <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest bg-cyan-500/10 border border-cyan-400/20 px-3 py-2 rounded-xl group-hover:bg-cyan-500 group-hover:text-black transition-all">
                                    VER LISTA →
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        );
    }

    // =========================================================
    // RENDER VIEW 3: MERCHANTS LIST (INDUSTRY SELECTED)
    // =========================================================
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
                         {selectedShop?.name}
                    </h2>
                    <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-[0.2em] bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-400/20">
                        {filteredShopClients.length} Comerciantes Suscritos
                    </span>
                </div>
            </div>

            <div className="px-5 space-y-6 relative z-10 max-w-lg mx-auto">
                {/* Buscador */}
                <div className="relative group">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400/40 group-focus-within:text-cyan-400 transition-colors" />
                    <input
                        placeholder="BUSCAR COMERCIANTE POR NOMBRE, DNI O WHATSAPP..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/[0.02] border border-white/10 p-4 pl-12 rounded-2xl text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-cyan-400/50 transition-all placeholder:text-white/10"
                    />
                </div>

                {/* Panel de Envíos de Mensajes */}
                <div className="glass-card-3d bg-white/[0.01] border border-cyan-500/20 rounded-3xl p-5 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-600 to-blue-500" />
                    <h3 className="text-[10px] font-black text-white/70 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <MessageSquare size={14} className="text-cyan-400" /> Mensaje de Invitación al Catálogo
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
                        <Send size={14} /> Enviar aviso de acceso comercial
                    </button>
                </div>

                {/* Lista de Comerciantes */}
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
                                    title="Editar datos del socio"
                                >
                                    <Edit2 size={15} />
                                </button>
                                <button
                                    onClick={() => openWhatsApp(client, customMessage)}
                                    className="w-9 h-9 rounded-xl bg-[#25D366]/10 border border-[#25D366]/30 flex items-center justify-center text-[#25D366] hover:bg-[#25D366] hover:text-black transition-all"
                                    title="Notificar por WhatsApp"
                                >
                                    <Send size={15} />
                                </button>
                                <button
                                    onClick={() => handleDeleteClient(client)}
                                    className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 hover:bg-red-500 hover:text-white transition-all"
                                    title="Remover Registro"
                                >
                                    <Trash2 size={15} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal de edición rápida */}
            {editingClient && (
                <div className="fixed inset-0 z-[1000] bg-black/85 backdrop-blur-md flex items-center justify-center p-6">
                    <div className="w-full max-w-sm bg-zinc-950 border border-white/10 rounded-[2rem] p-6 shadow-2xl relative">
                        <button onClick={() => setEditingClient(null)} className="absolute top-4 right-4 text-white/40 hover:text-white">
                            <X size={20} />
                        </button>
                        <h3 className="text-sm font-black uppercase tracking-widest text-cyan-400 mb-6 flex items-center gap-2">
                            <Users size={16} /> Ficha del Comerciante
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-1.5 block">Nombre del Socio</label>
                                <input
                                    type="text"
                                    value={editingClient.name}
                                    onChange={(e) => setEditingClient({ ...editingClient, name: e.target.value.toUpperCase() })}
                                    className="w-full bg-zinc-900 border border-white/10 p-3.5 rounded-xl text-xs font-black uppercase text-white outline-none focus:border-cyan-500"
                                />
                            </div>
                            <div>
                                <label className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-1.5 block">Teléfono / WhatsApp</label>
                                <input
                                    type="text"
                                    value={editingClient.phone}
                                    onChange={(e) => setEditingClient({ ...editingClient, phone: e.target.value })}
                                    className="w-full bg-zinc-900 border border-white/10 p-3.5 rounded-xl text-xs font-black text-white outline-none focus:border-cyan-500"
                                />
                            </div>
                            <div>
                                <label className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-1.5 block">CUIT o DNI</label>
                                <input
                                    type="text"
                                    value={editingClient.dni || ''}
                                    onChange={(e) => setEditingClient({ ...editingClient, dni: e.target.value })}
                                    className="w-full bg-zinc-900 border border-white/10 p-3.5 rounded-xl text-xs font-black text-white outline-none focus:border-cyan-500"
                                />
                            </div>
                            <div>
                                <label className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-1.5 block">Estado de Suscripción</label>
                                <select
                                    value={editingClient.status || 'active'}
                                    onChange={(e) => setEditingClient({ ...editingClient, status: e.target.value as any })}
                                    className="w-full bg-zinc-900 border border-white/10 p-3.5 rounded-xl text-xs font-black text-white outline-none focus:border-cyan-500"
                                >
                                    <option value="active">🟢 ACTIVO / AUTORIZADO</option>
                                    <option value="suspended">🔴 SUSPENDIDO</option>
                                    <option value="pending">🟡 PENDIENTE</option>
                                </select>
                            </div>
                            <button
                                disabled={isSaving}
                                onClick={handleSaveClient}
                                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-black py-4.5 rounded-xl text-[10px] uppercase tracking-widest active:scale-95 transition-all shadow-lg mt-2 flex items-center justify-center"
                            >
                                {isSaving ? "Guardando..." : "Guardar Cambios"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EnterpriseClientManagementPage;
