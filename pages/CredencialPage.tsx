import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Shop } from '../types';
import { ArrowLeft, Star, QrCode } from 'lucide-react';

interface CredencialPageProps {
    allShops: Shop[];
}

const CredencialPage: React.FC<CredencialPageProps> = ({ allShops }) => {
    const { categorySlug, shopSlug } = useParams<{ categorySlug: string; shopSlug: string }>();
    const navigate = useNavigate();

    const selectedShop = useMemo(() =>
        allShops.find(shop => (shop.slug || shop.id) === shopSlug),
        [shopSlug, allShops]);

    if (!selectedShop) return null;

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col items-center p-8 animate-in fade-in duration-700">
            <button
                onClick={() => navigate(-1)}
                className="self-start mb-8 text-white flex items-center gap-2"
            >
                <ArrowLeft size={20} />
                <span className="text-[10px] font-black uppercase tracking-widest">Volver</span>
            </button>

            <div className="w-full max-w-sm bg-gradient-to-br from-violet-600 to-indigo-900 rounded-[2rem] p-1 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                <div className="bg-gray-900 rounded-[1.8rem] p-8 flex flex-col items-center relative z-10">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden mb-4 border-2 border-violet-500/50 shadow-lg">
                        <img src={selectedShop.image} alt={selectedShop.name} className="w-full h-full object-cover" />
                    </div>

                    <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-1">{selectedShop.name}</h2>
                    <div className="flex items-center gap-1 mb-6">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Cliente VIP</span>
                    </div>

                    <div className="w-full bg-white/5 rounded-2xl p-6 flex flex-col items-center border border-white/10 mb-6">
                        <div className="bg-white p-4 rounded-xl mb-4">
                            <QrCode size={150} className="text-gray-900" />
                        </div>
                        <p className="text-[10px] font-black text-violet-400 uppercase tracking-[0.2em]">Credencial Escaneable</p>
                    </div>

                    <div className="w-full space-y-3">
                        <div className="flex justify-between items-center text-white/40 text-[9px] font-black uppercase tracking-widest border-b border-white/5 pb-2">
                            <span>Válido hasta</span>
                            <span className="text-white">DIC 2026</span>
                        </div>
                        <div className="flex justify-center pt-4">
                            <p className="text-[12px] font-black text-center text-white uppercase tracking-[0.3em] leading-relaxed">
                                Presentá esta credencial y obtené <span className="text-violet-400">BENEFICIOS EXCLUSIVOS</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <p className="mt-8 text-[9px] font-bold text-white/20 uppercase tracking-[0.4em] text-center px-12 leading-loose">
                Exclusivo en la App de Waly para comercios de Esteban Echeverría
            </p>
        </div>
    );
};

export default CredencialPage;
