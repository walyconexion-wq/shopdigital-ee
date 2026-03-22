import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Client } from '../types';
import { obtenerClientes } from '../firebase';
import {
    ChevronLeft,
    Database,
    Lock,
    Users,
    User,
    Phone,
    Store,
    Calendar,
    Download
} from 'lucide-react';
import { playNeonClick, playSuccessSound } from '../utils/audio';

const safeString = (val: any, fallback = 'Desconocido'): string => {
    if (typeof val === 'string') return val;
    if (typeof val === 'number') return String(val);
    return fallback;
};

const safeDate = (val: any): string => {
    if (!val) return 'Desconocida';
    try {
        if (typeof val.toDate === 'function') return val.toDate().toLocaleDateString();
        const d = new Date(val);
        if (isNaN(d.getTime())) return 'Desconocida';
        return d.toLocaleDateString();
    } catch {
        return 'Desconocida';
    }
};

const getSortTime = (val: any): number => {
    if (!val) return 0;
    try {
        if (typeof val.toDate === 'function') return val.toDate().getTime();
        if (typeof val.seconds === 'number') return val.seconds * 1000;
        const d = new Date(val);
        if (!isNaN(d.getTime())) return d.getTime();
        return 0;
    } catch {
        return 0;
    }
};

const ClientsDatabasePage: React.FC = () => {
    const navigate = useNavigate();
    
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        obtenerClientes().then(data => {
            const clientsData = data as Client[];
            // Sort by date descending safely
            const sorted = clientsData.sort((a, b) => {
                const dateA = getSortTime(a.createdAt);
                const dateB = getSortTime(b.createdAt);
                return dateB - dateA;
            });
            setClients(sorted);
            setLoading(false);
        });
    }, []);

    // Group clients by sourceShopName for analytics
    const groupedClients = useMemo(() => {
        const groups: Record<string, Client[]> = {};
        clients.forEach(client => {
            const shopName = safeString(client.sourceShopName, 'Desconocido');
            if (!groups[shopName]) {
                groups[shopName] = [];
            }
            groups[shopName].push(client);
        });
        
        // Convert to array and sort by number of clients descending
        return Object.entries(groups)
            .map(([shopName, shopClients]) => ({
                shopName,
                clients: shopClients,
                count: shopClients.length
            }))
            .sort((a, b) => b.count - a.count);
    }, [clients]);

    const handleExportCSV = () => {
        playNeonClick();
        const headers = ['Nombre', 'WhatsApp', 'Comercio Origen', 'Fecha de Alta'];
        const csvContent = [
            headers.join(','),
            ...clients.map(c => `"${safeString(c.name)}","${safeString(c.phone)}","${safeString(c.sourceShopName)}","${safeDate(c.createdAt)}")`)
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `ShopDigital_Clientes_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="min-h-screen bg-black text-white pb-24 relative overflow-x-hidden selection:bg-cyan-500/30">
            {/* HUD Background Layers */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px] animate-pulse" />
            </div>

            <div className="bg-zinc-900/50 backdrop-blur-md pt-8 pb-6 px-8 flex flex-col items-center border-b border-cyan-500/20 mb-8 sticky top-0 z-50">
                <div className="w-full flex justify-between items-center mb-4">
                    <button onClick={() => { playNeonClick(); navigate('/'); }} className="w-10 h-10 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-400/30 hover:bg-cyan-500/20 transition-all shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                        <ChevronLeft size={20} />
                    </button>
                    <button onClick={handleExportCSV} className="w-10 h-10 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-400/30 hover:bg-cyan-500/20 transition-all">
                        <Download size={18} />
                    </button>
                </div>
                
                <div className="flex items-center gap-2 mb-1">
                    <Database size={18} className="text-cyan-400" />
                    <h2 className="text-[18px] font-black text-white uppercase tracking-[0.2em] drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">Base Segmentada</h2>
                </div>
                <div className="flex gap-4 mt-3">
                    <p className="text-[10px] font-bold text-white/80 uppercase tracking-widest bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
                        Total: {clients.length} Clientes
                    </p>
                </div>
            </div>

            <div className="px-6 space-y-8 relative z-10 max-w-4xl mx-auto">
                {loading ? (
                    <div className="flex justify-center p-12">
                        <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" />
                    </div>
                ) : (
                    <>
                        {/* Analytics Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {groupedClients.map((group, groupIdx) => (
                                <div key={groupIdx} className="glass-card-3d bg-white/[0.02] border border-cyan-400/20 rounded-3xl p-6 relative overflow-hidden">
                                    <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-4">
                                        <div className="flex items-center gap-2">
                                            <Store size={16} className="text-cyan-400" />
                                            <h3 className="text-sm font-black text-white uppercase tracking-wider">{safeString(group.shopName)}</h3>
                                        </div>
                                        <div className="bg-cyan-500/20 px-3 py-1 rounded-full border border-cyan-400/30 flex items-center gap-1">
                                            <Users size={12} className="text-cyan-400" />
                                            <span className="text-[10px] font-black text-cyan-400">{group.count} Captados</span>
                                        </div>
                                    </div>

                                    <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                        {group.clients.map((client) => (
                                            <div key={client.id} className="bg-black/40 rounded-xl p-3 border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                                                        <User size={12} className="text-cyan-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[11px] font-black text-white">{safeString(client.name, 'Sin Nombre')}</p>
                                                        <p className="text-[9px] text-white/50 flex items-center gap-1 mt-0.5">
                                                            <Calendar size={8} /> {safeDate(client.createdAt)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 bg-green-500/10 px-2 py-1 rounded-lg border border-green-500/20">
                                                    <Phone size={10} className="text-green-400" />
                                                    <span className="text-[10px] font-black text-green-400">{safeString(client.phone, 'Sin Teléfono')}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ClientsDatabasePage;
