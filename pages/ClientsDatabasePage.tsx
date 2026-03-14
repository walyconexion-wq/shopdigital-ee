import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Client } from '../types';
import { obtenerClientes } from '../firebase';
import {
    ChevronLeft,
    Database,
    Lock,
    Users,
    Phone,
    Store,
    Calendar,
    Download
} from 'lucide-react';
import { playNeonClick, playSuccessSound } from '../utils/audio';

const ClientsDatabasePage: React.FC = () => {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState(false);
    
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            setLoading(true);
            obtenerClientes().then(data => {
                // Sort by date descending (newest first)
                const sorted = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                setClients(sorted as Client[]);
                setLoading(false);
            });
        }
    }, [isAuthenticated]);

    // Group clients by sourceShopName for analytics
    const groupedClients = useMemo(() => {
        const groups: Record<string, Client[]> = {};
        clients.forEach(client => {
            const shopName = client.sourceShopName || 'Desconocido';
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

    const handleLogin = () => {
        playNeonClick();
        if (password === 'waly123') { // Clave secreta Waly
            setIsAuthenticated(true);
            setLoginError(false);
            playSuccessSound();
        } else {
            setLoginError(true);
            setTimeout(() => setLoginError(false), 2000);
        }
    };

    const handleExportCSV = () => {
        playNeonClick();
        const headers = ['Nombre', 'WhatsApp', 'Comercio Origen', 'Fecha de Alta'];
        const csvContent = [
            headers.join(','),
            ...clients.map(c => `"${c.name}","${c.phone}","${c.sourceShopName}","${new Date(c.createdAt).toLocaleDateString()}"`)
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

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px] animate-pulse pointer-events-none" />
                <div className="w-full max-w-sm glass-card-3d border border-cyan-500/30 rounded-[2rem] p-10 backdrop-blur-xl z-10 relative">
                    <div className="w-16 h-16 bg-cyan-500/10 rounded-2xl flex items-center justify-center mb-8 border border-cyan-400/50 shadow-[0_0_20px_rgba(34,211,238,0.3)] mx-auto">
                        <Database size={32} className="text-cyan-400" />
                    </div>
                    <h2 className="text-2xl font-[1000] text-white uppercase tracking-tighter mb-2 text-shadow-premium text-center">Data Hub</h2>
                    <p className="text-[10px] font-bold text-cyan-400/80 uppercase tracking-widest mb-8 text-center">Acceso Nivel Director</p>

                    <div className="relative mb-6">
                        <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400/50" />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-black/50 border border-cyan-500/30 rounded-2xl py-4 pl-12 pr-6 text-cyan-100 text-lg focus:outline-none focus:border-cyan-400 transition-all font-mono tracking-widest text-center"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        onClick={handleLogin}
                        className="w-full glass-action-btn btn-cyan-neon py-4 rounded-2xl font-black uppercase tracking-[0.2em] active:scale-95 transition-all text-[12px] text-white"
                    >
                        Acceder
                    </button>

                    {loginError && <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest text-center mt-4">Acceso Denegado</p>}
                </div>
            </div>
        );
    }

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
                                            <h3 className="text-sm font-black text-white uppercase tracking-wider">{group.shopName}</h3>
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
                                                        <p className="text-[11px] font-black text-white">{client.name}</p>
                                                        <p className="text-[9px] text-white/50 flex items-center gap-1 mt-0.5">
                                                            <Calendar size={8} /> {new Date(client.createdAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 bg-green-500/10 px-2 py-1 rounded-lg border border-green-500/20">
                                                    <Phone size={10} className="text-green-400" />
                                                    <span className="text-[10px] font-black text-green-400">{client.phone}</span>
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
