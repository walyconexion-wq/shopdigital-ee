import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Shop, Client, Invoice } from '../types';
import { CATEGORIES } from '../constants';
import { guardarComercio, eliminarComercio, actualizarPuntosCliente, suscribirseAFacturas } from '../firebase';
import {
    ChevronLeft,
    Zap,
    Lock,
    Save,
    Trash2,
    Plus,
    Camera,
    PlusSquare,
    ImageIcon,
    ExternalLink,
    Search,
    User,
    Coins,
    Award,
    FileText,
    CheckCircle,
    Clock,
    Download
} from 'lucide-react';
import { playNeonClick } from '../utils/audio';

interface AdminPanelPageProps {
    allShops: Shop[];
    allClients?: Client[];
}

const AdminPanelPage: React.FC<AdminPanelPageProps> = ({ allShops, allClients = [] }) => {
    const { townId = 'esteban-echeverria', shopSlug } = useParams<{ townId: string, shopSlug: string }>();
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [foundClient, setFoundClient] = useState<Client | null>(null);
    const [searchError, setSearchError] = useState('');
    const [isUpdatingPoints, setIsUpdatingPoints] = useState(false);
    const [shopInvoices, setShopInvoices] = useState<Invoice[]>([]);

    const existingShop = allShops.find(shop => (shop.slug || shop.id) === shopSlug);

    const [editableShop, setEditableShop] = useState<Shop>(existingShop || {
        id: `shop-${Date.now()}`,
        slug: '',
        name: '',
        category: CATEGORIES[0].id,
        rating: 5.0,
        specialty: '',
        address: '',
        phone: '',
        bannerImage: '',
        image: '',
        offers: [],
        mapUrl: '',
        mapSheetUrl: '',
        instagram: '',
        facebook: '',
        tiktok: ''
    });

    React.useEffect(() => {
        if (existingShop?.id) {
            const unsubscribe = suscribirseAFacturas((facturas) => {
                const shopFacturas = facturas.filter(f => f.shopId === existingShop.id);
                // Sort by date descending
                setShopInvoices(shopFacturas.sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()));
            });
            return () => unsubscribe();
        }
    }, [existingShop?.id]);

    const handleLogin = () => {
        playNeonClick();
        if (password === 'admin123') {
            setIsAuthenticated(true);
            setLoginError(false);
        } else {
            setLoginError(true);
            setTimeout(() => setLoginError(false), 2000);
        }
    };

    const handleSave = async () => {
        playNeonClick();
        try {
            await guardarComercio(editableShop);
            alert('¡Comercio guardado con éxito!');
            navigate(-1);
        } catch (error) {
            console.error(error);
            alert('Error al guardar');
        }
    };

    const handleSearchClient = () => {
        playNeonClick();
        setSearchError('');
        const normalizedQuery = searchQuery.trim().toLowerCase();
        
        if (!normalizedQuery) {
            setSearchError('Ingresá un DNI, teléfono o nombre.');
            setFoundClient(null);
            return;
        }

        // Search by phone (digits only) or partial name match
        const queryDigits = normalizedQuery.replace(/\D/g, '');
        const client = allClients.find(c => {
            const phoneDigits = c.phone.replace(/\D/g, '');
            return (queryDigits && phoneDigits.includes(queryDigits)) || c.name.toLowerCase().includes(normalizedQuery);
        });

        if (client) {
            setFoundClient(client);
        } else {
            setFoundClient(null);
            setSearchError('Cliente VIP no encontrado.');
        }
    };

    const handleAwardPoints = async (points: number) => {
        if (!foundClient || !existingShop) return;
        playNeonClick();
        setIsUpdatingPoints(true);
        try {
            const newBalance = await actualizarPuntosCliente(foundClient.id, points, existingShop.name, 'earned');
            setFoundClient({ ...foundClient, points: newBalance });
        } catch (error) {
            alert('Error al actualizar puntos.');
        } finally {
            setIsUpdatingPoints(false);
        }
    };

    const handleRedeemPoints = async () => {
        if (!foundClient || !existingShop) return;
        playNeonClick();
        
        const pointsStr = window.prompt(`¿Cuántos puntos querés descontar de ${foundClient.name}? (Saldo actual: ${foundClient.points || 0})`);
        if (!pointsStr) return;
        
        const points = parseInt(pointsStr, 10);
        if (isNaN(points) || points <= 0) {
            alert('Cantidad inválida.');
            return;
        }
        
        if (points > (foundClient.points || 0)) {
            alert('El cliente no tiene suficientes puntos.');
            return;
        }

        setIsUpdatingPoints(true);
        try {
            const newBalance = await actualizarPuntosCliente(foundClient.id, -points, existingShop.name, 'redeemed');
            setFoundClient({ ...foundClient, points: newBalance });
            alert(`Puntos canjeados con éxito. Nuevo saldo: ${newBalance}`);
        } catch (error) {
            alert('Error al canjear puntos.');
        } finally {
            setIsUpdatingPoints(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8">
                <div className="w-full max-w-sm bg-zinc-900/50 border border-white/10 rounded-[2rem] p-10 backdrop-blur-xl">
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-8 border border-white/10">
                        <Lock size={24} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Acceso Gestión</h2>
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-8">Ingresá la clave de seguridad</p>

                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-center text-lg focus:outline-none focus:border-violet-500 transition-all mb-4"
                        placeholder="••••••••"
                    />

                    <button
                        onClick={handleLogin}
                        className="w-full bg-white text-black font-black uppercase tracking-[0.2em] py-4 rounded-2xl active:scale-95 transition-all"
                    >
                        Entrar
                    </button>

                    {loginError && <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest text-center mt-4">Clave incorrecta</p>}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white pb-24">
            <div className="bg-zinc-900/50 backdrop-blur-md pt-8 pb-6 px-8 flex flex-col items-center border-b border-white/5 mb-4 sticky top-0 z-50">
                <button onClick={() => {
                    playNeonClick();
                    navigate(`/${townId}/home`);
                }} className="self-start mb-4 w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-white border border-white/10"><ChevronLeft size={20} /></button>
                <h2 className="text-[18px] font-black text-white uppercase tracking-[0.2em] mb-1">Carga de Comercio</h2>
                <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Panel de Autogestión</p>
            </div>

            <div className="px-8 space-y-8">
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-3xl p-6 flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-black"><Zap size={20} fill="currentColor" /></div>
                        <h3 className="text-[12px] font-[1000] text-yellow-500 uppercase tracking-[0.3em]">REGLA DE ORO: NO BASE64</h3>
                    </div>
                    <p className="text-[10px] font-bold text-yellow-500/80 leading-relaxed uppercase tracking-widest">"Nunca guardamos imágenes pesadas. Siempre usá links externos. La App debe volar 🚀"</p>
                </div>

                {/* Form fields simplified for briefing */}
                <div className="space-y-6">
                    <div>
                        <label className="block text-[8px] font-black uppercase tracking-[0.3em] text-white/30 ml-4 mb-3">Nombre del Comercio</label>
                        <input
                            value={editableShop.name}
                            onChange={(e) => setEditableShop({ ...editableShop, name: e.target.value })}
                            className="w-full bg-zinc-900 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-violet-500"
                        />
                    </div>

                    <div>
                        <label className="block text-[8px] font-black uppercase tracking-[0.3em] text-white/30 ml-4 mb-3">Slug (Para URL: pizablu-catalogo)</label>
                        <input
                            value={editableShop.slug}
                            onChange={(e) => setEditableShop({ ...editableShop, slug: e.target.value })}
                            className="w-full bg-zinc-900 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-violet-500"
                        />
                    </div>

                    {/* Add more fields here as needed */}
                </div>

                {/* VIP LOYALTY TERMINAL */}
                <div className="bg-zinc-900/40 border border-cyan-500/20 rounded-[2rem] p-6 relative overflow-hidden mt-8 shadow-[0_0_30px_rgba(34,211,238,0.05)]">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/5 rounded-full blur-[40px] pointer-events-none" />
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-400/30 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                            <Award size={20} className="text-cyan-400" />
                        </div>
                        <div>
                            <h3 className="text-[12px] font-[1000] text-cyan-400 uppercase tracking-[0.2em] drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">Punto de Venta VIP</h3>
                            <p className="text-[9px] text-white/40 uppercase tracking-widest mt-0.5">Gestión de Puntos</p>
                        </div>
                    </div>

                    <div className="flex gap-2 mb-4 relative z-10">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearchClient()}
                            className="flex-1 bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_10px_rgba(34,211,238,0.2)] transition-all font-mono"
                            placeholder="DNI, Teléfono o Nombre"
                        />
                        <button
                            onClick={handleSearchClient}
                            className="bg-cyan-500/20 text-cyan-400 border border-cyan-400/30 rounded-xl px-4 flex items-center justify-center hover:bg-cyan-500/30 active:scale-95 transition-all"
                        >
                            <Search size={18} />
                        </button>
                    </div>

                    {searchError && <p className="text-red-400 text-[10px] font-bold mt-2 uppercase tracking-wide px-2">{searchError}</p>}

                    {foundClient && (
                        <div className="mt-6 bg-black/60 border border-cyan-500/20 rounded-2xl p-5 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 p-0.5 shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                                        <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
                                            <User size={20} className="text-cyan-400/80" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-black text-white uppercase tracking-wider">{foundClient.name}</span>
                                        <span className="text-[10px] text-cyan-400/80 uppercase tracking-widest flex items-center gap-1 mt-0.5">
                                            <Coins size={10} /> Saldo: {foundClient.points || 0} pts
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <p className="text-[8px] font-bold text-white/30 uppercase tracking-[0.2em] mb-3 ml-1">Sumar Puntos de Compra</p>
                            <div className="grid grid-cols-4 gap-2 mb-4">
                                {[5, 10, 15, 20].map((pts) => (
                                    <button
                                        key={pts}
                                        onClick={() => handleAwardPoints(pts)}
                                        disabled={isUpdatingPoints}
                                        className="bg-green-500/10 border border-green-500/30 rounded-xl py-3 flex flex-col items-center justify-center hover:bg-green-500/20 active:scale-95 transition-all disabled:opacity-50"
                                    >
                                        <span className="text-[14px] font-[1000] text-green-400 leading-none">+{pts}</span>
                                        <span className="text-[7px] text-green-400/60 uppercase tracking-widest mt-1">Pts</span>
                                    </button>
                                ))}
                            </div>

                            <p className="text-[8px] font-bold text-white/30 uppercase tracking-[0.2em] mb-3 ml-1 mt-6">Canjear Recompensas</p>
                            <button
                                onClick={handleRedeemPoints}
                                disabled={isUpdatingPoints || (foundClient.points || 0) === 0}
                                className="w-full relative group bg-indigo-500/10 border border-indigo-500/30 rounded-xl py-4 flex items-center justify-center gap-2 hover:bg-indigo-500/20 active:scale-95 transition-all disabled:opacity-50"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none animate-[scan_2s_ease-in-out_infinite]" />
                                <Coins size={16} className="text-indigo-400 relative z-10" />
                                <span className="text-[11px] font-black uppercase tracking-widest text-indigo-400 relative z-10">Cobrar con Puntos</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* MIS FACTURAS TERMINAL */}
                <div className="bg-zinc-900/40 border border-green-500/20 rounded-[2rem] p-6 relative overflow-hidden mt-8 shadow-[0_0_30px_rgba(34,197,94,0.05)]">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-400/5 rounded-full blur-[40px] pointer-events-none" />
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center border border-green-400/30 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                            <FileText size={20} className="text-green-400" />
                        </div>
                        <div>
                            <h3 className="text-[12px] font-[1000] text-green-400 uppercase tracking-[0.2em] drop-shadow-[0_0_5px_rgba(34,197,94,0.5)]">Suscripción y Pagos</h3>
                            <p className="text-[9px] text-white/40 uppercase tracking-widest mt-0.5">Mis Facturas Mensuales</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {shopInvoices.length === 0 ? (
                            <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest text-center py-4">No tenés facturas registradas</p>
                        ) : (
                            shopInvoices.map(inv => (
                                <div key={inv.id} className="bg-black/40 border border-white/10 rounded-2xl p-4 flex flex-col gap-3 relative overflow-hidden hover:border-green-500/30 transition-colors">
                                    <div className="flex justify-between items-start z-10">
                                        <div>
                                            <p className="text-[11px] font-[1000] text-white uppercase tracking-wider">{inv.concept}</p>
                                            <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest mt-1">Vence: {new Date(inv.dueDate).toLocaleDateString()}</p>
                                        </div>
                                        <div className={`px-2.5 py-1 rounded-lg border text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 ${inv.status === 'paid' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-500'}`}>
                                            {inv.status === 'paid' ? <CheckCircle size={10} /> : <Clock size={10} />}
                                            {inv.status === 'paid' ? 'Pagado' : 'Pendiente'}
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-between mt-1 z-10 border-t border-white/5 pt-3">
                                        <div className="text-xl font-[1000] text-green-400 tracking-wider">${inv.amount}</div>
                                        <button 
                                            onClick={() => {
                                                playNeonClick();
                                                window.open(`/${townId}/factura/${inv.id}`, '_blank');
                                            }}
                                            className="bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10 rounded-xl py-2 px-3 flex items-center gap-2 text-[9px] uppercase font-black tracking-widest transition-all"
                                        >
                                            <ExternalLink size={12} /> Ver Factura
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="h-4" /> {/* Spacer */}

                <button 
                    onClick={() => {
                        playNeonClick();
                        const category = editableShop.category || (existingShop ? existingShop.category : '');
                        const slug = editableShop.slug || shopSlug;
                        if (category && slug) {
                            navigate(`/${townId}/${category}/${slug}/credencial`);
                        } else {
                            alert('Faltan datos para generar la ruta de la credencial');
                        }
                    }}
                    className="w-full glass-action-btn btn-cyan-neon py-5 rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-widest text-[11px] mb-4 active:scale-95 transition-all shadow-[0_0_20px_rgba(34,211,238,0.2)]"
                >
                    <ExternalLink size={20} className="text-cyan-400" /> Ver Credencial
                </button>

                <button onClick={handleSave} className="w-full bg-violet-600 py-5 rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-widest text-[11px] shadow-[0_0_30px_rgba(139,92,246,0.5)] active:scale-95 transition-all">
                    <Save size={20} /> Guardar Cambios
                </button>
            </div>
        </div>
    );
};

export default AdminPanelPage;
