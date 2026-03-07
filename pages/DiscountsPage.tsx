import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Tag,
    Sparkles,
    ShieldCheck,
    Zap,
    Building2,
    Gift,
    QrCode
} from 'lucide-react';

const B2B_DISCOUNTS = [
    {
        id: '1',
        merchant: 'Insumos Echeverría',
        discount: '15% OFF',
        description: 'En toda la línea de descartables y limpieza.',
        image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&h=200&fit=crop',
        icon: <Zap className="text-yellow-400" size={16} />
    },
    {
        id: '2',
        merchant: 'Gráfica Digital MG',
        discount: '20% OFF',
        description: 'Impresión de menúes y folletería publicitaria.',
        image: 'https://images.unsplash.com/photo-1562654508-4c6223bf39d1?w=400&h=200&fit=crop',
        icon: <Sparkles className="text-cyan-400" size={16} />
    },
    {
        id: '3',
        merchant: 'Distribuidora del Sur',
        discount: '10% DE AHORRO',
        description: 'En compras mayoristas de bebidas y snacks.',
        image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=400&h=200&fit=crop',
        icon: <Building2 className="text-violet-400" size={16} />
    }
];

const DiscountsPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-950 flex flex-col items-center pb-24 animate-in fade-in duration-700">
            {/* Header Premium */}
            <div className="w-full bg-gradient-to-b from-violet-900/40 to-transparent pt-12 pb-8 px-8 flex flex-col items-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <div className="absolute top-[-50%] left-[-20%] w-[140%] h-[200%] bg-[radial-gradient(circle,rgba(139,92,246,0.3)_0%,transparent_70%)] animate-pulse"></div>
                </div>

                <button
                    onClick={() => navigate(-1)}
                    className="self-start mb-6 p-2 rounded-xl bg-white/5 border border-white/10 text-white backdrop-blur-sm active:scale-90 transition-all"
                >
                    <ArrowLeft size={20} />
                </button>

                <div className="flex flex-col items-center gap-2 relative z-10">
                    <div className="bg-violet-500/20 p-3 rounded-2xl border border-violet-500/30 shadow-[0_0_20px_rgba(139,92,246,0.3)] mb-2">
                        <ShieldCheck size={32} className="text-violet-400" />
                    </div>
                    <h1 className="text-2xl font-[1000] text-white uppercase tracking-[0.2em] text-center text-shadow-premium">
                        Red Comercial
                    </h1>
                    <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-violet-500 to-transparent"></div>
                    <p className="text-[10px] font-black text-violet-300 uppercase tracking-[0.4em] mt-2">
                        Beneficios Exclusivos
                    </p>
                </div>
            </div>

            <div className="px-6 w-full max-w-md flex flex-col gap-8 mt-4">
                {/* Banner Informativo */}
                <div className="bg-gradient-to-br from-gray-900 to-zinc-900 border border-white/5 rounded-[2rem] p-6 shadow-2xl relative overflow-hidden">
                    <div className="flex items-start gap-4">
                        <div className="bg-cyan-500/20 p-2 rounded-lg">
                            <Gift size={20} className="text-cyan-400" />
                        </div>
                        <div>
                            <h3 className="text-[11px] font-black text-white uppercase tracking-widest mb-1">¿Cómo obtener tu descuento?</h3>
                            <p className="text-[9px] font-medium text-white/50 leading-relaxed">
                                Presentá tu <span className="text-violet-400 font-bold">Credencial Electrónica</span> en cualquiera de los locales adheridos a nuestra red comercial de Esteban Echeverría.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Listado de Descuentos */}
                <div className="flex flex-col gap-6">
                    <h2 className="text-[9px] font-black text-white/30 uppercase tracking-[0.5em] ml-4">Descuentos Activos</h2>

                    {B2B_DISCOUNTS.map((discount, idx) => (
                        <div
                            key={discount.id}
                            className="group bg-zinc-900/50 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-xl active:scale-[0.98] transition-all"
                            style={{ animationDelay: `${idx * 150}ms` }}
                        >
                            <div className="relative h-32 overflow-hidden">
                                <img src={discount.image} alt={discount.merchant} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-60" />
                                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/20 to-transparent"></div>

                                <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                                    <span className="text-[10px] font-black text-white uppercase tracking-tighter italic">B2B Red</span>
                                </div>

                                <div className="absolute bottom-4 left-6">
                                    <div className="flex items-center gap-2 mb-1">
                                        {discount.icon}
                                        <h3 className="text-xs font-black text-white uppercase tracking-widest">{discount.merchant}</h3>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 pt-2 flex items-center justify-between">
                                <div className="flex flex-col gap-1 flex-1">
                                    <p className="text-[18px] font-black text-violet-400 uppercase tracking-tighter leading-none">{discount.discount}</p>
                                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-tight">{discount.description}</p>
                                </div>

                                <div className="bg-violet-500/10 p-4 rounded-3xl border border-violet-500/20">
                                    <QrCode size={24} className="text-violet-400" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Footer */}
                <div className="mt-8 flex flex-col items-center gap-4 py-8 border-t border-white/5">
                    <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.5em] text-center">
                        Próximamente más beneficios exclusivos
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="glass-action-btn btn-neon-delicate px-8 py-3 rounded-full flex items-center gap-2"
                    >
                        <ArrowLeft size={14} className="text-white" />
                        <span className="text-[9px] font-black text-white uppercase tracking-widest">Regresar</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DiscountsPage;
