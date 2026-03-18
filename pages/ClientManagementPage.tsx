import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
    Eye
} from 'lucide-react';
import { playNeonClick } from '../utils/audio';
import { eliminarCliente } from '../firebase';

const LOCALITIES = ['Luis Guillón', 'Monte Grande', 'El Jagüel'];

interface ClientManagementPageProps {
    allShops: Shop[];
    allClients: Client[];
}

const ClientManagementPage: React.FC<ClientManagementPageProps> = ({ allShops, allClients }) => {
    const navigate = useNavigate();
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
    const [activeLocation, setActiveLocation] = useState('Monte Grande');
    const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
    const [customMessage, setCustomMessage] = useState('');

    const selectedCategory = CATEGORIES.find(c => c.id === selectedCategoryId);
    const selectedShop = allShops.find(s => s.id === selectedShopId);

    // =========================================================
    // HELPER MEMOS
    // =========================================================
    
    // Map shop ID to its Category ID
    const shopToCategoryMap = useMemo(() => {
        const map: Record<string, string> = {};
        allShops.forEach(shop => {
            map[shop.id] = shop.category;
        });
        return map;
    }, [allShops]);

    const normalize = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    // Map shop ID to Locality
    const shopToLocalityMap = useMemo(() => {
        const map: Record<string, string> = {};
        allShops.forEach(shop => {
            const isLuisGuillon = shop.zone === 'Luis Guillón' || (shop.address && normalize(shop.address).includes('guillon'));
            const isElJaguel = shop.zone === 'El Jagüel' || (shop.address && normalize(shop.address).includes('jaguel'));
            map[shop.id] = isLuisGuillon ? 'Luis Guillón' : isElJaguel ? 'El Jagüel' : 'Monte Grande';
        });
        return map;
    }, [allShops]);

    // Count clients per Category
    const clientCountByCategory = useMemo(() => {
        const counts: Record<string, number> = {};
        CATEGORIES.forEach(cat => counts[cat.id] = 0);
        
        allClients.forEach(client => {
            const catId = shopToCategoryMap[client.sourceShopId];
            if (catId) counts[catId]++;
        });
        return counts;
    }, [allClients, shopToCategoryMap]);

    // Shops in selected category & locality that have > 0 clients
    const shopsWithClients = useMemo(() => {
        if (!selectedCategoryId) return [];
        
        // Count clients per shop
        const countsByShop: Record<string, number> = {};
        allClients.forEach(c => {
            countsByShop[c.sourceShopId] = (countsByShop[c.sourceShopId] || 0) + 1;
        });

        return allShops.filter(shop => 
            shop.category === selectedCategoryId &&
            shopToLocalityMap[shop.id] === activeLocation &&
            (countsByShop[shop.id] || 0) > 0
        ).map(shop => ({
            ...shop,
            clientCount: countsByShop[shop.id] || 0
        }));
    }, [selectedCategoryId, activeLocation, allShops, allClients, shopToLocalityMap]);

    // Clients for selected shop
    const shopClients = useMemo(() => {
        if (!selectedShopId) return [];
        return allClients.filter(c => c.sourceShopId === selectedShopId);
    }, [selectedShopId, allClients]);

    // Set default message when a shop is selected
    useMemo(() => {
        if (selectedShop) {
            setCustomMessage(`¡Hola! 👋 Bienvenido al grupo VIP de *${selectedShop.name}*. Sumate acá para ver beneficios exclusivos: https://chat.whatsapp.com/IeibPhJcCGDLJklCpywTzn`);
        }
    }, [selectedShop]);

    // =========================================================
    // ACTIONS
    // =========================================================

    const openWhatsApp = (client: Client, baseMessage: string) => {
        playNeonClick();
        const formattedPhone = client.phone.replace(/\D/g, '');
        const credentialLink = `\n\nTu Credencial VIP: https://shopdigital.tech/cliente/${client.id}/credencial`;
        const fullMessage = baseMessage + credentialLink;
        const url = `https://wa.me/549${formattedPhone}?text=${encodeURIComponent(fullMessage)}`;
        window.open(url, '_blank');
    };

    const handleBulkMessage = () => {
        playNeonClick();
        if (shopClients.length === 0) return;
        
        if (window.confirm(`¿Se intentarán abrir ${shopClients.length} pestañas de WhatsApp. Es posible que tu navegador bloquee las ventanas emergentes (pop-ups). ¿Quieres continuar?`)) {
            shopClients.forEach(client => {
                const formattedPhone = client.phone.replace(/\D/g, '');
                const credentialLink = `\n\nTu Credencial VIP: https://shopdigital.tech/cliente/${client.id}/credencial`;
                const fullMessage = customMessage + credentialLink;
                const url = `https://wa.me/549${formattedPhone}?text=${encodeURIComponent(fullMessage)}`;
                window.open(url, '_blank');
            });
        }
    };

    const handleDeleteClient = async (client: Client) => {
        if (window.confirm(`¿Estás seguro de que querés eliminar definitivamente a ${client.name || 'este cliente'} de la red VIP? Esta acción no se puede deshacer.`)) {
            playNeonClick();
            try {
                await eliminarCliente(client.id);
            } catch (error) {
                console.error("Error al eliminar cliente:", error);
                alert("Hubo un error al eliminar el cliente.");
            }
        }
    };

    // =========================================================
    // VIEW 1: Category Selection Grid
    // =========================================================
    if (!selectedCategoryId) {
        return (
            <div className="min-h-screen bg-black text-white pb-24 relative overflow-x-hidden selection:bg-blue-500/30">
                <div className="fixed inset-0 pointer-events-none z-0">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.02)_1px,transparent_1px)] bg-[size:30px_30px]" />
                </div>

                <div className="bg-zinc-900/50 backdrop-blur-md pt-8 pb-6 px-6 flex flex-col items-center border-b border-blue-500/20 mb-6 sticky top-0 z-50">
                    <button onClick={() => { playNeonClick(); navigate('/embajador'); }} 
                        className="self-start mb-4 w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-400/30 hover:bg-blue-500/20 transition-all shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                        <ChevronLeft size={20} />
                    </button>
                    <div className="flex items-center gap-2 mb-1">
                        <Users size={18} className="text-blue-400" />
                        <h2 className="text-[16px] font-black text-white uppercase tracking-[0.2em] drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                            Gestión de Clientes
                        </h2>
                    </div>
                    <p className="text-[9px] font-bold text-blue-400/80 uppercase tracking-widest text-center mt-2 px-4">
                        Total en BD: {allClients.length} clientes asociados
                    </p>
                </div>

                <div className="px-5 grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-lg mx-auto relative z-10">
                    {CATEGORIES.map(cat => {
                        const count = clientCountByCategory[cat.id] || 0;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => { playNeonClick(); setSelectedCategoryId(cat.id); }}
                                className="glass-card-3d bg-white/[0.03] border border-white/10 hover:border-blue-500/40 rounded-2xl p-4 flex flex-col items-center gap-2 transition-all active:scale-95 group relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-full blur-[20px] pointer-events-none" />
                                <div className="text-blue-400 group-hover:scale-110 transition-transform">
                                    {cat.icon}
                                </div>
                                <span className="text-[8px] font-black uppercase tracking-widest text-white/70 text-center leading-tight">
                                    {cat.name}
                                </span>
                                {count > 0 && (
                                    <span className="absolute top-2 right-2 bg-blue-500/20 border border-blue-400/30 text-blue-300 text-[7px] font-black px-1.5 py-0.5 rounded-full">
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
    // VIEW 3: Client List & Messaging (Shop Selected)
    // =========================================================
    if (selectedShopId && selectedShop) {
        return (
            <div className="min-h-screen bg-black text-white pb-24 relative overflow-x-hidden selection:bg-blue-500/30">
                <div className="fixed inset-0 pointer-events-none z-0">
                    <div className="absolute top-0 left-0 w-[300px] h-[300px] bg-green-500/5 rounded-full blur-[100px]" />
                </div>

                {/* Header View 3 */}
                <div className="bg-zinc-900/50 backdrop-blur-md pt-8 pb-4 px-6 flex flex-col items-center border-b border-blue-500/20 mb-4 sticky top-0 z-50">
                    <button onClick={() => { playNeonClick(); setSelectedShopId(null); }}
                        className="self-start mb-3 w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-400/30 hover:bg-blue-500/20 transition-all shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex flex-col items-center justify-center">
                        <h2 className="text-[14px] font-black text-white uppercase tracking-widest drop-shadow-[0_0_10px_rgba(59,130,246,0.5)] text-center mb-1">
                            Clientes de {selectedShop.name}
                        </h2>
                        <span className="text-[9px] font-bold text-blue-400 uppercase tracking-[0.2em] bg-blue-500/10 px-3 py-1 rounded-full border border-blue-400/20">
                            {shopClients.length} Registros Activos
                        </span>
                    </div>
                </div>

                <div className="px-5 space-y-6 relative z-10 max-w-lg mx-auto">
                    {/* Messaging Panel */}
                    <div className="glass-card-3d bg-white/[0.02] border border-blue-500/30 rounded-3xl p-5 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-green-400" />
                        <h3 className="text-[10px] font-black text-white/70 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <MessageSquare size={14} className="text-blue-400" /> Plantilla de Mensaje
                        </h3>
                        <textarea
                            value={customMessage}
                            onChange={(e) => setCustomMessage(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:border-blue-400/50 transition-all min-h-[100px] resize-y"
                        />
                        <button
                            onClick={handleBulkMessage}
                            className="mt-4 w-full bg-green-600/20 border border-green-400/40 py-3 rounded-xl flex items-center justify-center gap-2 font-black uppercase tracking-widest text-[9px] text-green-300 active:scale-95 transition-all hover:bg-green-600/30 shadow-[0_0_15px_rgba(34,197,94,0.2)]"
                        >
                            <Send size={14} /> Enviar Múltiple (Abrir Pestañas)
                        </button>
                        <p className="text-[7px] text-white/30 text-center mt-2 uppercase tracking-wide">
                            Atención: Tu navegador puede bloquear múltiples pestañas. Se recomienda enviar individualmente.
                        </p>
                    </div>

                    {/* Client List */}
                    <div className="space-y-3">
                        {shopClients.map((client, idx) => (
                            <div key={idx} className="glass-card-3d bg-white/[0.01] border hover:border-blue-500/30 border-white/5 rounded-2xl p-4 flex items-center justify-between transition-colors">
                                <div>
                                    <p className="text-[12px] font-black text-white/90 uppercase tracking-wide mb-0.5">
                                        {client.name}
                                    </p>
                                    <p className="text-[9px] font-bold text-white/40 flex items-center gap-1">
                                        <Phone size={10} /> {client.phone}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => { playNeonClick(); window.open(`/cliente/${client.id}/credencial`, '_blank'); }}
                                        className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-400/30 hover:bg-cyan-500/20 transition-all active:scale-95 flex-shrink-0 shadow-[0_0_10px_rgba(34,211,238,0.1)]"
                                        title="Ver Credencial VIP"
                                    >
                                        <Eye size={16} />
                                    </button>
                                    <button
                                        onClick={() => openWhatsApp(client, customMessage)}
                                        className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400 border border-green-400/30 hover:bg-green-500/20 transition-all active:scale-95 flex-shrink-0 shadow-[0_0_10px_rgba(34,197,94,0.1)]"
                                        title="Enviar WhatsApp"
                                    >
                                        <Send size={16} className="-ml-1" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClient(client)}
                                        className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/30 hover:bg-red-500/20 transition-all active:scale-95 flex-shrink-0 shadow-[0_0_10px_rgba(239,68,68,0.1)]"
                                        title="Eliminar Cliente"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // =========================================================
    // VIEW 2: Location Tabs + Shop Cards
    // =========================================================
    const LOCALITY_COLORS: Record<string, { border: string; bg: string; text: string; shadow: string }> = {
        'Luis Guillón': { border: 'border-green-400', bg: 'bg-green-500/20', text: 'text-green-300', shadow: 'shadow-[0_0_20px_rgba(34,197,94,0.4)]' },
        'Monte Grande': { border: 'border-cyan-400', bg: 'bg-cyan-500/20', text: 'text-cyan-300', shadow: 'shadow-[0_0_20px_rgba(34,211,238,0.4)]' },
        'El Jagüel': { border: 'border-violet-400', bg: 'bg-violet-500/20', text: 'text-violet-300', shadow: 'shadow-[0_0_20px_rgba(139,92,246,0.4)]' },
    };

    return (
        <div className="min-h-screen bg-black text-white pb-24 relative overflow-x-hidden selection:bg-blue-500/30">
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.02)_1px,transparent_1px)] bg-[size:30px_30px]" />
            </div>

            {/* Header View 2 */}
            <div className="bg-zinc-900/50 backdrop-blur-md pt-8 pb-4 px-6 flex flex-col items-center border-b border-blue-500/20 mb-4 sticky top-0 z-50">
                <button onClick={() => { playNeonClick(); setSelectedCategoryId(null); }}
                    className="self-start mb-3 w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-400/30 hover:bg-blue-500/20 transition-all shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                    <ArrowLeft size={20} />
                </button>
                <div className="flex items-center gap-2 mb-1">
                    <Users size={18} className="text-blue-400" />
                    <h2 className="text-[15px] font-black text-white uppercase tracking-[0.15em] drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                        Mina de Clientes · {selectedCategory?.name}
                    </h2>
                </div>
            </div>

            {/* Location Tabs */}
            <div className="flex justify-center gap-3 px-5 mb-6 relative z-10">
                {LOCALITIES.map(loc => {
                    const isActive = activeLocation === loc;
                    const colors = LOCALITY_COLORS[loc];
                    return (
                        <button
                            key={loc}
                            onClick={() => { playNeonClick(); setActiveLocation(loc); }}
                            className={`px-4 py-2.5 rounded-xl font-black uppercase tracking-widest text-[8px] border transition-all duration-300
                                ${isActive
                                    ? `${colors.bg} ${colors.border} ${colors.text} ${colors.shadow} scale-110`
                                    : `bg-white/[0.03] border-white/10 text-white/40 hover:text-white/60 hover:border-white/20`
                                }`}
                        >
                            {loc}
                        </button>
                    );
                })}
            </div>

            {/* Shop Cards (Client Summaries) */}
            <div className="px-5 space-y-4 relative z-10 max-w-lg mx-auto">
                {shopsWithClients.length === 0 ? (
                    <div className="glass-card-3d bg-white/[0.02] border border-blue-500/20 rounded-3xl p-10 flex flex-col items-center justify-center gap-3 text-center">
                        <Users size={24} className="text-blue-400/30" />
                        <p className="text-[10px] text-white/40 uppercase tracking-widest leading-relaxed">
                            No hay clientes asociados a {selectedCategory?.name} en {activeLocation}
                        </p>
                    </div>
                ) : (
                    shopsWithClients.map(shop => (
                        <div key={shop.id} className="glass-card-3d bg-white/[0.02] border border-blue-500/20 rounded-3xl p-5 overflow-hidden relative transition-all">
                            {/* Stats Badge */}
                            <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest bg-blue-500/20 text-blue-300 border border-blue-400/30 shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                                {shop.clientCount} Clientes
                            </div>

                            <div className="flex flex-col gap-4 mt-2">
                                <div>
                                    <h3 className="text-lg font-[1000] text-white uppercase tracking-tighter leading-tight pr-20">
                                        {shop.name}
                                    </h3>
                                    <p className="text-[9px] font-bold text-white/40 mt-1 uppercase tracking-widest flex items-center gap-1">
                                        <Store size={10} /> Registros de este catálogo
                                    </p>
                                </div>
                                
                                <button
                                    onClick={() => { playNeonClick(); setSelectedShopId(shop.id); }}
                                    className="w-full bg-blue-500/10 border border-blue-500/30 py-3 rounded-xl flex items-center justify-center gap-2 font-black uppercase tracking-widest text-[9px] text-blue-300 active:scale-95 transition-all hover:bg-blue-500/20"
                                >
                                    <Users size={14} /> Administrar Clientes VIP
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
