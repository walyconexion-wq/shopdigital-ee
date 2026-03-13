import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Shop } from '../types';
import { CATEGORIES } from '../constants';
import { guardarComercio, eliminarComercio } from '../firebase';
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
    ExternalLink
} from 'lucide-react';
import { playNeonClick } from '../utils/audio';

interface AdminPanelPageProps {
    allShops: Shop[];
}

const AdminPanelPage: React.FC<AdminPanelPageProps> = ({ allShops }) => {
    const { shopSlug } = useParams<{ shopSlug: string }>();
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState(false);

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
                    navigate(-1);
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

                <button 
                    onClick={() => {
                        playNeonClick();
                        const category = editableShop.category || (existingShop ? existingShop.category : '');
                        const slug = editableShop.slug || shopSlug;
                        if (category && slug) {
                            navigate(`/${category}/${slug}/credencial`);
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
