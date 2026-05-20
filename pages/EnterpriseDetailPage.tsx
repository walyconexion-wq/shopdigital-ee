import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ENTERPRISE_CATEGORIES } from '../enterpriseConstants';
import { Shop } from '../types';
import {
    ChevronLeft, MapPin, Star, Phone, Globe, Clock,
    BookOpen, Shield, ChevronRight, ChevronLeft as ChevronLeftIcon,
    Settings, Trash2, Edit3, CheckCircle, ExternalLink
} from 'lucide-react';
import { playNeonClick } from '../utils/audio';

interface EnterpriseDetailPageProps {
    allShops: Shop[];
    globalConfig?: any;
}

const MOCK_REVIEWS = [
    { id: '1', author: 'Almacén Don José', rating: 5, text: 'Excelente calidad de productos. Los chorizos y salames son de primera. Siempre puntuales con la entrega.', date: 'Hace 2 semanas' },
    { id: '2', author: 'Carnicería El Gaucho', rating: 4, text: 'Muy buena relación precio/calidad. La morcilla es espectacular. Los recomiendo para distribución mayorista.', date: 'Hace 1 mes' },
    { id: '3', author: 'Restaurant La Posta', rating: 5, text: 'Trabajamos con ellos hace 3 años. Jamás tuvieron un problema. Producto fresco y precio justo directo de fábrica.', date: 'Hace 2 meses' },
];

const EnterpriseDetailPage: React.FC<EnterpriseDetailPageProps> = ({ allShops, globalConfig }) => {
    const { categorySlug, enterpriseSlug } = useParams<{ categorySlug: string; enterpriseSlug: string }>();
    const navigate = useNavigate();

    const [reviewIndex, setReviewIndex] = useState(0);
    const [showEditPanel, setShowEditPanel] = useState(false);
    const [editClicks, setEditClicks] = useState(0);

    const primaryColor = '#f59e0b';
    const bgColor = globalConfig?.bgColor || '#050A15';

    const hexToRgba = (hex: string, alpha: number) => {
        try {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        } catch { return `rgba(245,158,11,${alpha})`; }
    };

    const enterprise = useMemo(() =>
        allShops.find(s =>
            s.entityType === 'enterprise' &&
            (s.slug === enterpriseSlug || s.id === enterpriseSlug)
        ),
        [allShops, enterpriseSlug]
    );

    const category = useMemo(() =>
        ENTERPRISE_CATEGORIES.find(c => c.slug === categorySlug),
        [categorySlug]
    );

    // 🔐 Triple-tap oculto para panel de edición
    const handleLogoTap = () => {
        const next = editClicks + 1;
        setEditClicks(next);
        if (next >= 3) { setShowEditPanel(true); setEditClicks(0); }
        setTimeout(() => setEditClicks(0), 2000);
    };

    if (!enterprise) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-white" style={{ backgroundColor: bgColor }}>
                <div className="text-amber-400/30 text-[48px] mb-4">🏭</div>
                <p className="text-white/50 uppercase tracking-widest text-[10px] font-black">Empresa no encontrada</p>
                <button onClick={() => navigate(`/empresas/${categorySlug}`)} className="mt-4 text-amber-400 text-[10px] font-black uppercase tracking-widest">
                    ← Volver al catálogo
                </button>
            </div>
        );
    }

    const rating = enterprise.rating || 4.4;
    const schedule = (enterprise as any).schedule || 'Consultar horarios';
    const website = (enterprise as any).website || '';

    return (
        <div className="flex flex-col min-h-screen pb-24 relative overflow-x-hidden animate-in fade-in duration-700" style={{ backgroundColor: bgColor }}>

            {/* ── Grid BG ── */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0" style={{ backgroundImage: `linear-gradient(${hexToRgba(primaryColor, 0.02)} 1px, transparent 1px), linear-gradient(90deg, ${hexToRgba(primaryColor, 0.02)} 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
                <div className="absolute top-0 right-0 w-[350px] h-[350px] rounded-full blur-[120px]" style={{ backgroundColor: hexToRgba(primaryColor, 0.06) }} />
            </div>

            {/* ── PORTADA / BANNER ── */}
            <div className="relative w-full h-[260px] flex-shrink-0 z-10">
                <img
                    src={enterprise.bannerImage || enterprise.image}
                    alt={enterprise.name}
                    className="w-full h-full object-cover"
                />
                {/* Overlay gradiente */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                {/* Botón de regreso */}
                <button
                    onClick={() => { playNeonClick(); navigate(`/empresas/${categorySlug}`); }}
                    className="absolute top-5 left-4 z-20 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center active:scale-90 transition-all"
                >
                    <ChevronLeft size={20} className="text-white" />
                </button>

                {/* Badge Verificado */}
                <div className="absolute top-5 right-4 z-20 px-2.5 py-1 rounded-full bg-emerald-500/30 border border-emerald-400/50 text-emerald-300 text-[7px] font-black uppercase tracking-widest flex items-center gap-1 backdrop-blur-md">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Verificado
                </div>

                {/* Nombre sobre la portada */}
                <div className="absolute bottom-0 left-0 right-0 px-5 pb-5 z-10">
                    <p className="text-[8px] font-black uppercase tracking-widest text-amber-400/70 mb-1">
                        {category?.name || 'Empresa'}
                    </p>
                    <h1 onClick={handleLogoTap} className="text-[22px] font-[1000] text-white uppercase tracking-tighter leading-none cursor-pointer select-none" style={{ textShadow: '0 2px 20px rgba(0,0,0,0.8)' }}>
                        {enterprise.name}
                    </h1>
                    <div className="flex items-center gap-3 mt-1.5">
                        <div className="flex items-center gap-1">
                            {[1,2,3,4,5].map(s => (
                                <Star key={s} size={11} className={s <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'fill-transparent text-white/20'} />
                            ))}
                            <span className="text-[9px] font-bold text-amber-300 ml-1">{rating}</span>
                        </div>
                        <span className="text-white/30 text-[8px]">·</span>
                        <div className="flex items-center gap-1 text-white/60 text-[8px]">
                            <MapPin size={9} />
                            <span className="font-bold uppercase tracking-wide">{enterprise.zone}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── CONTENIDO PRINCIPAL ── */}
            <div className="flex flex-col gap-5 px-5 pt-5 relative z-10">

                {/* ── Descripción ── */}
                {enterprise.description && (
                    <div className="rounded-2xl border border-amber-500/15 bg-amber-500/[0.06] backdrop-blur-md p-4">
                        <p className="text-[11px] text-white/75 leading-relaxed">{enterprise.description}</p>
                    </div>
                )}

                {/* ── Datos de Contacto ── */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md p-4 space-y-3">
                    <h3 className="text-[9px] font-black uppercase tracking-widest text-amber-400/70">Información de Contacto</h3>
                    {enterprise.address && (
                        <div className="flex items-start gap-3">
                            <MapPin size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
                            <span className="text-[11px] text-white/70">{enterprise.address}</span>
                        </div>
                    )}
                    {enterprise.phone && (
                        <div className="flex items-center gap-3">
                            <Phone size={14} className="text-emerald-400 flex-shrink-0" />
                            <span className="text-[11px] text-white/70">{enterprise.phone}</span>
                        </div>
                    )}
                    {schedule && (
                        <div className="flex items-center gap-3">
                            <Clock size={14} className="text-amber-400/60 flex-shrink-0" />
                            <span className="text-[11px] text-white/60">{schedule}</span>
                        </div>
                    )}
                    {website && (
                        <div className="flex items-center gap-3">
                            <Globe size={14} className="text-blue-400 flex-shrink-0" />
                            <a href={website} target="_blank" rel="noopener noreferrer" className="text-[11px] text-blue-400 underline truncate">{website}</a>
                        </div>
                    )}
                </div>

                {/* ── Botón WhatsApp ── */}
                {enterprise.phone && (
                    <a
                        href={`https://wa.me/549${enterprise.phone.replace(/\D/g, '')}?text=${encodeURIComponent('Hola! Soy comerciante y me interesa consultar precios mayoristas. 🏭')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => playNeonClick()}
                        className="w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 transition-all active:scale-95 border border-emerald-500/40 bg-emerald-600/20 text-white"
                        style={{ boxShadow: '0 0 25px rgba(16,185,129,0.2)' }}
                    >
                        <Phone size={16} strokeWidth={3} className="text-emerald-400" />
                        📲 Contactar por WhatsApp
                    </a>
                )}

                {/* ── Mapa Google ── */}
                {enterprise.mapUrl && (
                    <div className="rounded-2xl overflow-hidden border border-amber-500/15" style={{ height: 200 }}>
                        <iframe
                            src={enterprise.mapUrl}
                            className="w-full h-full border-0"
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title={`Mapa ${enterprise.name}`}
                        />
                    </div>
                )}

                {/* ── CATÁLOGO — próximamente expandible ── */}
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.06] backdrop-blur-md overflow-hidden">
                    <button
                        onClick={() => playNeonClick()}
                        className="w-full p-4 flex items-center justify-between group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                                <BookOpen size={16} className="text-amber-400" />
                            </div>
                            <div className="text-left">
                                <p className="text-[12px] font-black text-white uppercase tracking-wider">Abrir Catálogo Completo</p>
                                <p className="text-[8px] text-amber-400/60 uppercase tracking-widest">Productos · Precios Mayoristas</p>
                            </div>
                        </div>
                        <ChevronRight size={18} className="text-amber-400/60 group-active:translate-x-1 transition-transform" />
                    </button>
                </div>

                {/* ── CARRUSEL DE RESEÑAS ── */}
                <div>
                    <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40 mb-3 flex items-center gap-2">
                        <Shield size={11} className="text-amber-400/60" />
                        Opiniones de Clientes Verificados
                    </h3>

                    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md p-5">
                        <div
                            className="flex transition-transform duration-500 ease-out"
                            style={{ transform: `translateX(-${reviewIndex * 100}%)` }}
                        >
                            {MOCK_REVIEWS.map(rev => (
                                <div key={rev.id} className="min-w-full flex-shrink-0 space-y-3">
                                    <div className="flex items-center gap-1">
                                        {[1,2,3,4,5].map(s => (
                                            <Star key={s} size={12} className={s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'fill-transparent text-white/20'} />
                                        ))}
                                    </div>
                                    <p className="text-[12px] text-white/75 leading-relaxed italic">"{rev.text}"</p>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[9px] font-black text-amber-400/70 uppercase tracking-wider">{rev.author}</span>
                                        <span className="text-[8px] text-white/30">{rev.date}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Controles del carrusel */}
                        <div className="flex items-center justify-between mt-4">
                            <button
                                onClick={() => { playNeonClick(); setReviewIndex(i => Math.max(0, i - 1)); }}
                                disabled={reviewIndex === 0}
                                className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center transition-all disabled:opacity-30 active:scale-90"
                            >
                                <ChevronLeftIcon size={14} className="text-white/60" />
                            </button>
                            <div className="flex gap-1.5">
                                {MOCK_REVIEWS.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => { playNeonClick(); setReviewIndex(i); }}
                                        className="rounded-full transition-all"
                                        style={{
                                            width: reviewIndex === i ? 20 : 6,
                                            height: 6,
                                            backgroundColor: reviewIndex === i ? primaryColor : 'rgba(255,255,255,0.2)',
                                        }}
                                    />
                                ))}
                            </div>
                            <button
                                onClick={() => { playNeonClick(); setReviewIndex(i => Math.min(MOCK_REVIEWS.length - 1, i + 1)); }}
                                disabled={reviewIndex === MOCK_REVIEWS.length - 1}
                                className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center transition-all disabled:opacity-30 active:scale-90"
                            >
                                <ChevronRight size={14} className="text-white/60" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Badge ADN Industrial ── */}
                <div className="flex items-center justify-center gap-3 py-2">
                    <div className="h-[1px] flex-1 bg-amber-500/10" />
                    <div className="flex items-center gap-1.5 text-[7px] font-black uppercase tracking-[0.25em] text-amber-500/40">
                        <CheckCircle size={9} />
                        Empresa Verificada por ShopDigital
                    </div>
                    <div className="h-[1px] flex-1 bg-amber-500/10" />
                </div>
            </div>

            {/* ── PANEL DE EDICIÓN OCULTO (3-tap en el nombre) ── */}
            {showEditPanel && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col justify-end animate-in slide-in-from-bottom-full duration-300">
                    <div className="bg-zinc-900 border-t border-amber-500/30 rounded-t-3xl p-6 space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-[13px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-2">
                                <Settings size={16} /> Panel de Edición Industrial
                            </h2>
                            <button onClick={() => setShowEditPanel(false)} className="text-white/40 text-[10px] font-black uppercase tracking-widest border border-white/10 px-3 py-1.5 rounded-xl active:scale-95">
                                Cerrar
                            </button>
                        </div>
                        <p className="text-[9px] text-white/40 uppercase tracking-wider">Empresa: {enterprise.name}</p>

                        <button
                            onClick={() => { playNeonClick(); navigate(`/empresas/inscripcion?edit=${enterprise.id}`); setShowEditPanel(false); }}
                            className="w-full py-4 rounded-2xl bg-amber-600/20 border border-amber-500/30 text-white text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95"
                        >
                            <Edit3 size={14} className="text-amber-400" /> Editar Datos de Empresa
                        </button>

                        {enterprise.mapUrl && (
                            <a
                                href={`https://maps.google.com/maps?q=${encodeURIComponent(enterprise.address || '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-4 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-white text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95"
                            >
                                <ExternalLink size={14} className="text-blue-400" /> Ver en Google Maps
                            </a>
                        )}

                        <button
                            onClick={() => { playNeonClick(); setShowEditPanel(false); }}
                            className="w-full py-3 rounded-2xl bg-red-600/10 border border-red-500/20 text-red-400/70 text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95"
                        >
                            <Trash2 size={12} /> Solicitar Baja de Empresa
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EnterpriseDetailPage;
