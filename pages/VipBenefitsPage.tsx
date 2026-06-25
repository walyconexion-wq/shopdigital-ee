import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Tag,
    ShieldCheck,
    Gift,
    QrCode,
    Share2,
    Sparkles,
    Star,
    Zap,
    Clock,
    ChevronRight,
    Ticket,
    Percent,
    Pizza,
    Coffee,
    Dumbbell,
    Scissors,
    ShoppingBag,
    Heart,
    Wrench,
    Car,
    Smartphone,
    IceCream,
    Package,
    X,
    Copy,
    Check,
    Moon,
    Sun,
    Flame
} from 'lucide-react';
import { playNeonClick } from '../utils/audio';
import { AriMerchantAssistant } from '../components/AriMerchantAssistant';

// ─────────────────────────────────────────────
// TIPOS DE DATOS DE MUESTRA
// ─────────────────────────────────────────────

interface BenefitCard {
    id: string;
    type: 'descuento' | 'cupon' | 'oferta';
    category: string;
    categoryIcon: React.ElementType;
    categoryColor: string;
    brand: string;
    title: string;
    description: string;
    discount: string;
    code?: string;
    validUntil: string;
    image: string;
    badge?: string;
    isHot?: boolean;
}

// ─────────────────────────────────────────────
// DATOS DE MUESTRA — 12 beneficios VIP
// ─────────────────────────────────────────────
const SAMPLE_BENEFITS: BenefitCard[] = [
    {
        id: 'b1',
        type: 'descuento',
        category: 'Pizzerías',
        categoryIcon: Pizza,
        categoryColor: '#f97316',
        brand: 'La Napolitana',
        title: '30% off en toda la carta',
        description: 'Pizza artesanal a la piedra. Presentá tu credencial VIP y llevate el 30% de descuento en cualquier pizza grande.',
        discount: '30%',
        validUntil: '31 Jul 2025',
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80',
        badge: 'Más popular',
        isHot: true
    },
    {
        id: 'b2',
        type: 'cupon',
        category: 'Heladerías',
        categoryIcon: IceCream,
        categoryColor: '#a855f7',
        brand: 'Cremolatti',
        title: '1 Kilo de helado por $8.900',
        description: 'Precio especial para socios VIP. Válido en todas las variedades premium incluyendo sin TACC.',
        discount: '-20%',
        code: 'VIP-ICE-2025',
        validUntil: '30 Jun 2025',
        image: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=600&q=80',
        badge: 'Cupón digital'
    },
    {
        id: 'b3',
        type: 'oferta',
        category: 'Gimnasios',
        categoryIcon: Dumbbell,
        categoryColor: '#22d3ee',
        brand: 'Iron Gym',
        title: 'Cuota mensual sin contrato',
        description: 'Primera quincena gratis + 25% de descuento en inscripción. Incluye sala de musculación y clases grupales.',
        discount: '25%',
        validUntil: 'Indefinido',
        image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&q=80',
        isHot: true
    },
    {
        id: 'b4',
        type: 'cupon',
        category: 'Peluquerías',
        categoryIcon: Scissors,
        categoryColor: '#ec4899',
        brand: 'Glamour Salón',
        title: 'Lavado + Corte + Peinado',
        description: 'Paquete completo con colorimetría profesional. Reservá por WhatsApp mencionando tu código VIP.',
        discount: '-35%',
        code: 'VIP-HAIR-35',
        validUntil: '15 Jul 2025',
        image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&q=80',
        badge: 'Exclusivo VIP'
    },
    {
        id: 'b5',
        type: 'descuento',
        category: 'Indumentarias',
        categoryIcon: ShoppingBag,
        categoryColor: '#f59e0b',
        brand: 'Elegance Boutique',
        title: '20% off en nueva temporada',
        description: 'Descuento en toda la colección otoño-invierno. Ropa de mujer, hombre y niños. Marcas nacionales.',
        discount: '20%',
        validUntil: '31 Ago 2025',
        image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80',
    },
    {
        id: 'b6',
        type: 'oferta',
        category: 'Estéticas',
        categoryIcon: Heart,
        categoryColor: '#f43f5e',
        brand: 'Bella Donna',
        title: 'Limpieza de cutis + Hidratación',
        description: 'Tratamiento facial completo. Primera vez 50% off para clientes VIP de ShopDigital.',
        discount: '50%',
        validUntil: '20 Jul 2025',
        image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=80',
        badge: '1ra vez',
        isHot: true
    },
    {
        id: 'b7',
        type: 'cupon',
        category: 'Tecnología',
        categoryIcon: Smartphone,
        categoryColor: '#6366f1',
        brand: 'Tecno Sur',
        title: 'Reparación de pantalla -$3000',
        description: 'Descuento fijo en reparación de cualquier modelo de celular. Stock limitado de pantallas premium.',
        discount: '-$3.000',
        code: 'VIP-TECH-SCREEN',
        validUntil: '10 Jul 2025',
        image: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600&q=80',
    },
    {
        id: 'b8',
        type: 'descuento',
        category: 'Gastronomías',
        categoryIcon: Coffee,
        categoryColor: '#92400e',
        brand: 'Café Central',
        title: '2x1 en desayunos hasta las 11hs',
        description: 'Dos desayunos al precio de uno. Incluye café, medialunas y jugo. Todos los días de semana.',
        discount: '2x1',
        validUntil: 'Indefinido',
        image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80',
    },
    {
        id: 'b9',
        type: 'oferta',
        category: 'Ferreterías',
        categoryIcon: Wrench,
        categoryColor: '#64748b',
        brand: 'El Tornillo',
        title: 'Caja herramientas 18 piezas',
        description: 'Precio especial para socios: $29.900 (precio normal $38.000). Incluye maletín y garantía.',
        discount: '-$8.100',
        validUntil: '30 Jun 2025',
        image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&q=80',
    },
    {
        id: 'b10',
        type: 'cupon',
        category: 'Automotor y Motos',
        categoryIcon: Car,
        categoryColor: '#10b981',
        brand: 'Silva Express',
        title: 'Cambio de aceite + revisión',
        description: 'Service completo con aceite Castrol premium. Incluye revisión de frenos, suspensión y luces.',
        discount: '25%',
        code: 'VIP-CAR-OIL',
        validUntil: '31 Jul 2025',
        image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600&q=80',
        badge: 'Solo VIP'
    },
    {
        id: 'b11',
        type: 'descuento',
        category: 'Comida Rápida',
        categoryIcon: Pizza,
        categoryColor: '#ef4444',
        brand: 'Doble Queso',
        title: 'Combo hamburguesa + papas',
        description: 'Hamburguesa artesanal doble, papas crocantes y bebida a elección. Precio VIP exclusivo.',
        discount: '15%',
        validUntil: 'Indefinido',
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80',
        isHot: true
    },
    {
        id: 'b12',
        type: 'cupon',
        category: 'Mascotas',
        categoryIcon: Heart,
        categoryColor: '#84cc16',
        brand: 'San Roque',
        title: 'Vacunación completa canina',
        description: 'Vacuna séxtuple + antirábica. Precio especial VIP. Turno disponible lunes a sábados.',
        discount: '-$2.500',
        code: 'VIP-PET-VAC',
        validUntil: '31 Ago 2025',
        image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600&q=80',
    }
];

const CATEGORIES = [
    'Pizzerías',
    'Restaurantes',
    'Comida Rápida',
    'Cervecerías',
    'Heladerías',
    'Gastronomías',
    'Mercados',
    'Indumentarias',
    'Tecnología',
    'Hogar',
    'Barberías',
    'Peluquerías',
    'Gimnasios',
    'Ferreterías',
    'Mascotas',
    'Tatuajes',
    'Estéticas',
    'Inmobiliarias',
    'Automotor',
    'Regalería',
    'Finanzas',
    'Servicios y Profesionales',
    'Automotor y Motos',
    'Farmacias'
];
const TYPES = ['descuento', 'cupon', 'oferta'];

const TYPE_LABELS: Record<string, string> = {
    descuento: '🏷️ Descuento',
    cupon: '🎟️ Cupón',
    oferta: '⚡ Oferta',
    Todos: 'Todos'
};

// ─────────────────────────────────────────────
// COUPON CODE CHIP (3D Volumétrico)
// ─────────────────────────────────────────────
const CouponCode: React.FC<{ code: string; isDayMode: boolean }> = ({ code, isDayMode }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        playNeonClick();
        navigator.clipboard.writeText(code).catch(() => {});
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <button 
            onClick={handleCopy} 
            className="flex items-center gap-2 px-3 py-2.5 w-full group btn-3d-celeste shadow-md"
        >
            <Ticket size={12} className={isDayMode ? 'text-[#083344]' : 'text-cyan-300'} />
            <span className={`text-[11px] font-black tracking-widest uppercase flex-1 text-left ${
                isDayMode ? 'text-[#083344]' : 'text-cyan-300'
            }`}>{code}</span>
            <div className="shrink-0">
                {copied ? (
                    <Check size={12} className="text-green-600" />
                ) : (
                    <Copy size={12} className={isDayMode ? 'text-[#083344]/70 group-hover:text-[#083344]' : 'text-cyan-300/70 group-hover:text-cyan-300'} />
                )}
            </div>
        </button>
    );
};

// ─────────────────────────────────────────────
// BENEFIT CARD
// ─────────────────────────────────────────────
const BenefitCardComponent: React.FC<{ benefit: BenefitCard; idx: number; isDayMode: boolean }> = ({ benefit, idx, isDayMode }) => {
    const Icon = benefit.categoryIcon;

    const handleShare = () => {
        playNeonClick();
        const text = `🎁 *${benefit.discount} en ${benefit.brand}*\n${benefit.title}\n\n${benefit.description}\n\n✅ Válido hasta: ${benefit.validUntil}\n🔗 Ver todos mis beneficios VIP: ${window.location.href}`;
        if (navigator.share) {
            navigator.share({ title: benefit.title, text, url: window.location.href }).catch(console.error);
        } else {
            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
        }
    };

    const typeColor = {
        descuento: isDayMode 
            ? 'from-amber-500/10 to-transparent border-amber-500/30 text-amber-800' 
            : 'from-amber-500/20 to-transparent border-amber-500/20 text-amber-400',
        cupon: isDayMode 
            ? 'from-cyan-500/10 to-transparent border-cyan-500/30 text-cyan-800' 
            : 'from-cyan-500/20 to-transparent border-cyan-500/20 text-cyan-400',
        oferta: isDayMode 
            ? 'from-purple-500/10 to-transparent border-purple-500/30 text-purple-800' 
            : 'from-purple-500/20 to-transparent border-purple-500/20 text-purple-400',
    }[benefit.type];

    const typeLabel = { descuento: '🏷️ DESCUENTO', cupon: '🎟️ CUPÓN', oferta: '⚡ OFERTA' }[benefit.type];

    return (
        <div
            className={`group border rounded-[2.5rem] overflow-hidden shadow-2xl transition-all duration-300 ${
                isDayMode
                    ? 'bg-[#faf8f5] border-[#855b3c] border-b-[8px] border-b-[#855b3c] hover:shadow-lg'
                    : 'bg-[#0e1726]/40 backdrop-blur-xl border-cyan-500/20 border-b-[8px] border-b-cyan-500 shadow-cyan-950/20 hover:shadow-[0_0_20px_rgba(0,229,255,0.15)]'
            }`}
            style={{ animationDelay: `${idx * 80}ms` }}
        >
            {/* Image */}
            <div className="relative h-40 overflow-hidden">
                <img
                    src={benefit.image}
                    alt={benefit.title}
                    className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${
                        isDayMode ? 'opacity-90' : 'opacity-65'
                    }`}
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${
                    isDayMode 
                        ? 'from-[#faf8f5] via-[#faf8f5]/25 to-transparent' 
                        : 'from-[#0e1726]/90 via-[#0e1726]/30 to-transparent'
                }`} />

                {/* Type badge */}
                <div className={`absolute top-4 left-4 bg-gradient-to-r ${typeColor} border backdrop-blur-sm px-3 py-1 rounded-full`}>
                    <span className="text-[8px] font-black uppercase tracking-widest">{typeLabel}</span>
                </div>

                {/* Hot badge */}
                {benefit.isHot && (
                    <div className="absolute top-4 right-4 bg-red-500/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
                        <Zap size={8} className="text-white fill-white animate-pulse" />
                        <span className="text-[7px] font-black text-white uppercase tracking-widest">Hot</span>
                    </div>
                )}

                {/* Category Icon */}
                <div className="absolute bottom-4 left-5 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl flex items-center justify-center bg-white/20 backdrop-blur-sm border border-white/20">
                        <Icon size={14} style={{ color: benefit.categoryColor }} />
                    </div>
                    <div>
                        <p className={`text-[8px] font-black uppercase tracking-widest leading-none ${isDayMode ? 'text-[#2d1e15]/60' : 'text-white/40'}`}>{benefit.category}</p>
                        <p className={`text-[11px] font-black uppercase tracking-tight leading-tight ${isDayMode ? 'text-[#2d1e15]' : 'text-white'}`}>{benefit.brand}</p>
                    </div>
                </div>

                {/* Discount pill */}
                <div className="absolute bottom-4 right-5">
                    <div className={`backdrop-blur-md border rounded-2xl px-3 py-1.5 text-center min-w-[52px] ${
                        isDayMode 
                            ? 'bg-white/85 border-[#855b3c]/20 shadow-sm' 
                            : 'bg-gradient-to-br from-white/15 to-white/5 border-white/20'
                    }`}>
                        <span className={`text-[16px] font-black leading-none block ${isDayMode ? 'text-[#2d1e15]' : 'text-white'}`}>{benefit.discount}</span>
                        <span className={`text-[6px] font-bold uppercase tracking-wider ${isDayMode ? 'text-[#2d1e15]/50' : 'text-white/50'}`}>OFF</span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-5 pt-3">
                {benefit.badge && (
                    <span className={`inline-block text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full mb-2 ${
                        isDayMode
                            ? 'text-cyan-700 bg-cyan-100 border border-cyan-300/40'
                            : 'text-cyan-300 bg-cyan-500/10 border border-cyan-500/20'
                    }`}>
                        ✦ {benefit.badge}
                    </span>
                )}

                <h3 className={`text-[13px] font-black leading-tight mb-1 ${isDayMode ? 'text-[#2d1e15]' : 'text-white'}`}>{benefit.title}</h3>
                <p className={`text-[10px] font-medium leading-relaxed mb-3 ${isDayMode ? 'text-[#2d1e15]/60' : 'text-white/40'}`}>{benefit.description}</p>

                {/* Coupon Code */}
                {benefit.code && (
                    <div className="mb-3">
                        <CouponCode code={benefit.code} isDayMode={isDayMode} />
                    </div>
                )}

                {/* Footer */}
                <div className="flex items-center gap-2">
                    {/* Credencial CTA (3D Volumétrico Button matching btn-3d-celeste) */}
                    <button
                        onClick={() => {
                            playNeonClick();
                            alert("Presentá tu Credencial VIP de ShopDigital en el comercio para acceder a este beneficio 💎");
                        }}
                        className="flex-1 py-2 px-3 flex items-center justify-center gap-1.5 btn-3d-celeste shadow-md cursor-pointer"
                    >
                        <ShieldCheck size={11} className={isDayMode ? 'text-[#083344]' : 'text-cyan-300'} />
                        <span className="text-[8px] font-black uppercase tracking-widest text-inherit">Credencial VIP</span>
                    </button>

                    {/* Validity */}
                    <div className={`flex items-center gap-1 border rounded-xl px-2 py-2.5 ${
                        isDayMode ? 'bg-[#faf8f5] border-[#cbd5e1]' : 'bg-white/5 border-white/10'
                    }`}>
                        <Clock size={9} className={isDayMode ? 'text-[#2d1e15]/40' : 'text-white/30'} />
                        <span className={`text-[8px] font-bold ${isDayMode ? 'text-[#2d1e15]/40' : 'text-white/30'}`}>{benefit.validUntil}</span>
                    </div>

                    {/* Share Button (3D Volumétrico matching btn-3d-celeste) */}
                    <button
                        onClick={handleShare}
                        className="w-10 h-10 flex items-center justify-center btn-3d-celeste shadow-md"
                    >
                        <Share2 size={13} className={isDayMode ? 'text-[#083344]' : 'text-cyan-300'} />
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────
const VipBenefitsPage: React.FC = () => {
    const { townId = 'esteban-echeverria' } = useParams<{ townId: string }>();
    const navigate = useNavigate();
    const [activeCategory, setActiveCategory] = useState('Todos');
    const [activeType, setActiveType] = useState('Todos');
    const [scrolled, setScrolled] = useState(false);
    const pageRef = useRef<HTMLDivElement>(null);

    // Theme state - synchronized with global_home_theme_mode
    const [isDayMode, setIsDayMode] = useState<boolean>(() => {
        const saved = localStorage.getItem('global_home_theme_mode');
        return saved === 'light';
    });

    const toggleTheme = () => {
        playNeonClick();
        const nextMode = !isDayMode;
        setIsDayMode(nextMode);
        localStorage.setItem('global_home_theme_mode', nextMode ? 'light' : 'dark');
    };

    // Listen to parent Layout's scroll container dynamically to update scrolled header styling
    useEffect(() => {
        const handleScrollEvent = (e: Event) => {
            const target = e.target as HTMLElement;
            setScrolled(target.scrollTop > 20);
        };

        const parent = pageRef.current?.parentElement;
        if (parent) {
            parent.addEventListener('scroll', handleScrollEvent);
        }
        return () => {
            if (parent) {
                parent.removeEventListener('scroll', handleScrollEvent);
            }
        };
    }, []);

    const filtered = useMemo(() => {
        return SAMPLE_BENEFITS.filter(b => {
            const matchCat = activeCategory === 'Todos' || b.category === activeCategory;
            const matchType = activeType === 'Todos' || b.type === activeType;
            return matchCat && matchType;
        });
    }, [activeCategory, activeType]);

    const stats = useMemo(() => ({
        total: SAMPLE_BENEFITS.length,
        descuentos: SAMPLE_BENEFITS.filter(b => b.type === 'descuento').length,
        cupones: SAMPLE_BENEFITS.filter(b => b.type === 'cupon').length,
        ofertas: SAMPLE_BENEFITS.filter(b => b.type === 'oferta').length,
    }), []);

    const handleShare = () => {
        playNeonClick();
        const text = `💎 ¡Descubrí mis Beneficios VIP en ShopDigital!\n\n${stats.total} descuentos exclusivos en comercios locales 🎁\n\n👉 ${window.location.href}`;
        if (navigator.share) {
            navigator.share({ title: 'Beneficios VIP · ShopDigital', text, url: window.location.href }).catch(console.error);
        } else {
            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
        }
    };

    const ariContextShop = {
        id: 'ari-global',
        name: 'ShopDigital VIP',
        category: 'Red Comercial',
        slug: 'shopdigital',
        address: 'Argentina',
        phone: '1140607059',
        description: 'Red Comercial Digital de Argentina',
        rating: 5,
        isActive: true,
        offers: [],
        visits: 0,
        subscribers: 0,
        tags: [],
    } as any;

    return (
        <div 
            ref={pageRef}
            className={`w-full min-h-full flex flex-col justify-start relative pb-24 transition-colors duration-700 font-sans selection:bg-cyan-500/20 ${
                isDayMode ? 'bg-[#cda488] text-[#2d1e15]' : 'bg-[#050505] text-white dark'
            }`}
        >
            {/* Custom animations & glow styles */}
            <style>{`
                @keyframes pulseGlowCyan {
                    0%, 100% { filter: drop-shadow(0 0 10px rgba(0, 229, 255, 0.4)); }
                    50% { filter: drop-shadow(0 0 25px rgba(0, 229, 255, 0.8)); }
                }
                .glow-cyan-glow {
                    animation: pulseGlowCyan 3s infinite ease-in-out;
                }
                @keyframes bounceSlow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-8px); }
                }
                .animate-bounce-slow {
                    animation: bounceSlow 4s infinite ease-in-out;
                }
                .text-shadow-premium {
                    text-shadow: 0 0 15px rgba(0, 229, 255, 0.6);
                }
                @keyframes spinSlow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spinSlow 8s linear infinite;
                }
                .btn-3d-selector {
                    position: relative;
                    transition: transform 0.2s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.2s ease, border-color 0.2s ease, background-color 0.2s ease !important;
                    border: 1px solid rgba(168, 85, 247, 0.35) !important;
                    border-bottom: 5px solid #a855f7 !important;
                    background: linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(15, 23, 42, 0.6) 100%) !important;
                    backdrop-filter: blur(12px) !important;
                    box-shadow: 
                      0 8px 25px rgba(168, 85, 247, 0.25), 
                      inset 0 1px 0 rgba(255, 255, 255, 0.15) !important;
                    border-radius: 1.25rem !important;
                }
                .btn-3d-selector:hover {
                    transform: translateY(-2px) scale(1.01) !important;
                    background: linear-gradient(135deg, rgba(168, 85, 247, 0.3) 0%, rgba(15, 23, 42, 0.8) 100%) !important;
                    border-color: rgba(168, 85, 247, 0.5) !important;
                    border-bottom-color: #a855f7 !important;
                    box-shadow: 
                      0 12px 30px rgba(168, 85, 247, 0.4), 
                      inset 0 1px 0 rgba(255, 255, 255, 0.25) !important;
                }
                .btn-3d-selector:active {
                    transform: translateY(4px) scale(0.99) !important;
                    border-bottom-width: 1px !important;
                    box-shadow: 
                      0 2px 10px rgba(168, 85, 247, 0.15), 
                      inset 0 1px 0 rgba(255, 255, 255, 0.05) !important;
                }
                .day-mode .btn-3d-selector {
                    background: linear-gradient(135deg, color-mix(in srgb, #f59e0b 35%, #fff) 0%, color-mix(in srgb, #f59e0b 60%, #fff) 100%) !important;
                    border: 1px solid rgba(245, 158, 11, 0.45) !important;
                    border-bottom: 5px solid #b45309 !important;
                    box-shadow: 
                      0 8px 22px rgba(245, 158, 11, 0.25), 
                      inset 0 1px 0 rgba(255, 255, 255, 0.4) !important;
                    color: #78350f !important;
                }
                .day-mode .btn-3d-selector:hover {
                    background: linear-gradient(135deg, color-mix(in srgb, #f59e0b 45%, #fff) 0%, color-mix(in srgb, #f59e0b 70%, #fff) 100%) !important;
                    border-color: rgba(245, 158, 11, 0.6) !important;
                    border-bottom-color: #b45309 !important;
                    box-shadow: 
                      0 12px 28px rgba(245, 158, 11, 0.35), 
                      inset 0 1px 0 rgba(255, 255, 255, 0.5) !important;
                    transform: translateY(-2px) scale(1.01) !important;
                }
                .day-mode .btn-3d-selector:active {
                    transform: translateY(4px) scale(0.99) !important;
                    border-bottom-width: 1px !important;
                    box-shadow: 
                      0 2px 10px rgba(245, 158, 11, 0.1), 
                      inset 0 1px 0 rgba(255, 255, 255, 0.5) !important;
                }
            `}</style>

            {/* Background Texture */}
            <div className="fixed inset-0 pointer-events-none z-0">
                {isDayMode ? (
                    <>
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(45,30,21,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(45,30,21,0.02)_1px,transparent_1px)] bg-[size:32px_32px]" />
                        <div className="absolute top-1/4 left-[-10%] w-[60%] h-[40%] bg-white/15 rounded-full blur-[120px]" />
                    </>
                ) : (
                    <>
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:32px_32px]" />
                        <div className="absolute top-1/3 left-[-15%] w-[80%] h-[35%] bg-cyan-950/20 rounded-full blur-[150px] animate-pulse" />
                        <div className="absolute bottom-1/4 right-[-10%] w-[50%] h-[40%] bg-indigo-950/20 rounded-full blur-[150px]" />
                    </>
                )}
            </div>

            {/* STICKY HEADER */}
            <nav className={`sticky top-0 z-50 w-full transition-all duration-500 border-b ${
                scrolled 
                    ? isDayMode 
                        ? 'bg-[#faf8f5]/95 backdrop-blur-xl border-[#855b3c]/20 py-2 shadow-md' 
                        : 'bg-[#050505]/95 backdrop-blur-xl border-white/15 py-2 shadow-[0_4px_30px_rgba(0,0,0,0.8)] shadow-cyan-950/10'
                    : 'bg-transparent border-transparent py-3.5'
            }`}>
                <div className="px-4 flex items-center justify-between w-full max-w-lg mx-auto">
                    {/* Back Button matching ShopDetailPage */}
                    <button 
                        onClick={() => { playNeonClick(); navigate(`/${townId}/home`); }}
                        className="w-10 h-10 flex items-center justify-center rounded-full btn-3d-celeste transition-all active:translate-y-[4px] active:border-b-0 shadow-lg"
                    >
                        <ArrowLeft size={18} style={isDayMode ? { color: '#083344' } : { color: '#22d3ee', filter: 'drop-shadow(0 0 3px rgba(34, 211, 238, 0.6))' }} strokeWidth={3} />
                    </button>
                    
                    {/* Pulsing Dot Logo */}
                    <div className="flex items-center gap-1.5 select-none cursor-pointer" onClick={() => navigate(`/${townId}/home`)}>
                        <span className={`text-[19px] font-[1000] tracking-tighter uppercase leading-none ${
                            isDayMode ? 'text-[#2d1e15]' : 'text-white'
                        }`}>
                            ShopDigital
                        </span>
                        <span className="text-[19px] font-[1000] leading-none text-sky-500">.ar</span>
                        <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] shadow-[0_0_8px_#10b981] animate-ping ml-0.5" />
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Theme Toggle Button (3D) */}
                        <button
                            onClick={toggleTheme}
                            aria-label="Alternar modo de color"
                            className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all hover:translate-y-[-1px] active:translate-y-[3px] active:border-b-[1px] shadow-md ${
                                isDayMode 
                                    ? 'bg-[#faf8f5] hover:bg-slate-50 border-slate-200 border-b-[4px] border-b-slate-300 text-[#2d1e15]' 
                                    : 'bg-white/5 hover:bg-white/10 border-white/10 border-b-[4px] border-b-white/20 text-cyan-400 hover:border-cyan-400/30'
                            }`}
                        >
                            {isDayMode ? <Moon size={16} /> : <Sun size={16} />}
                        </button>
                    </div>
                </div>
            </nav>

            <main className="relative z-10 flex flex-col items-center w-full max-w-lg mx-auto pt-4 px-4">
                
                {/* HERO CARD & ARI DIALOGUE (Reordered: Badge -> Title -> Speech Balloon -> Avatar) */}
                <div className="w-full mt-2">
                    <div className={`border border-b-[6px] p-6 rounded-[2.5rem] shadow-lg flex flex-col items-center gap-5 text-center relative overflow-hidden transition-all duration-700 ${
                        isDayMode 
                            ? 'bg-[#faf8f5] border-slate-200 border-b-[#855b3c]' 
                            : 'bg-[#0e1726]/40 backdrop-blur-xl border-cyan-500/20 border-b-cyan-500 shadow-cyan-950/20'
                    }`}>
                        {/* Zone Badge */}
                        <div className={`absolute top-0 left-0 text-[7px] font-[1000] uppercase tracking-[0.25em] px-4 py-1.5 rounded-br-2xl transition-colors duration-500 ${
                            isDayMode ? 'bg-[#2d1e15]/10 text-[#2d1e15]/70' : 'bg-white/5 text-white/50'
                        }`}>
                            ZONA {townId === 'esteban-echeverria' ? 'ESTEBAN ECHEVERRÍA' : townId.replace('-', ' ').toUpperCase()} 📍
                        </div>

                        <div className={`absolute top-0 right-0 text-[7px] font-[1000] uppercase tracking-[0.25em] px-4 py-1.5 rounded-bl-2xl transition-colors duration-500 ${
                            isDayMode ? 'bg-[#2d1e15] text-[#faf8f5]' : 'bg-[#00E5FF] text-black font-black shadow-[0_0_10px_#00E5FF]'
                        }`}>
                            SOCIOS VIP 💎
                        </div>

                        {/* 1. VIP Badge Container */}
                        <div className="flex justify-center mt-2">
                            <div className={`flex items-center gap-2 border rounded-full px-4 py-1.5 ${
                                isDayMode
                                    ? 'bg-amber-100/80 border-[#855b3c]/30 text-[#855b3c]'
                                    : 'bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border-amber-500/30 text-amber-300'
                            }`}>
                                <Star size={10} className="text-amber-500 fill-amber-500 animate-spin-slow" />
                                <span className="text-[9px] font-black uppercase tracking-[0.4em]">Beneficios VIP</span>
                                <Star size={10} className="text-amber-500 fill-amber-500 animate-spin-slow" />
                            </div>
                        </div>

                        {/* 2. Main Title */}
                        <h1 className="text-[24px] font-[1100] tracking-tighter leading-none uppercase">
                            Mis Beneficios <br />
                            <span className={isDayMode ? 'text-[#855b3c]' : 'text-cyan-400 text-shadow-premium'}>Exclusivos</span>
                        </h1>

                        {/* 3. Dialogue Balloon (Arrow points DOWN towards avatar) - Compact & Color Matched */}
                        <div className={`rounded-2xl py-2.5 px-4 relative max-w-[90%] border transition-colors duration-500 ${
                            isDayMode 
                                ? 'bg-[#2d1e15] text-[#faf8f5] border-[#855b3c]' 
                                : 'bg-[#15233c] text-white border-cyan-500/30 shadow-[inset_0_0_12px_rgba(0,229,255,0.15)]'
                        }`}>
                            <div className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rotate-45 border-b border-r transition-colors duration-500 ${
                                isDayMode ? 'bg-[#2d1e15] border-[#855b3c]' : 'bg-[#15233c] border-cyan-500/30'
                            }`} />
                            <p className="text-[10px] leading-normal font-bold tracking-tight">
                                "¡Hola! Soy <strong className="text-[#22d3ee]">Ari</strong>, tu asistente virtual. Descubrí y activá tus beneficios exclusivos en comercios locales presentando tu credencial VIP 💙"
                            </p>
                        </div>

                        {/* 4. Ari Avatar */}
                        <div className="relative w-32 h-32 flex-shrink-0 animate-bounce-slow">
                            <div className={`absolute inset-0 rounded-full blur-xl animate-pulse ${
                                isDayMode ? 'bg-sky-400/10' : 'bg-cyan-500/20'
                            }`} />
                            <img 
                                src="/ari-pointing.png" 
                                alt="Asistente Ari" 
                                className="w-full h-full object-contain relative z-10"
                            />
                        </div>
                    </div>
                </div>

                {/* FILTER SECTION (3D buttons) */}
                <div className={`w-full mt-4 border border-b-[5px] p-4 rounded-[2rem] shadow-md transition-all duration-700 ${
                    isDayMode 
                        ? 'bg-[#faf8f5] border-slate-200 border-b-[#855b3c]' 
                        : 'bg-[#0e1726]/40 backdrop-blur-xl border-cyan-500/20 border-b-cyan-500 shadow-cyan-950/20'
                }`}>
                    <p className={`text-[9.5px] font-[1000] uppercase tracking-wider mb-2.5 ${isDayMode ? 'text-[#2d1e15]/60' : 'text-cyan-400/80'}`}>Filtrar Beneficios</p>
                    
                    {/* Type filter chips (volumetric 3D buttons - Stretched columns & custom shadow color) */}
                    <div className="grid grid-cols-3 w-full gap-2 pb-2 mb-4">
                        {TYPES.map(type => {
                             const isActive = activeType === type;
                             return (
                                 <button
                                     key={type}
                                     onClick={() => {
                                         playNeonClick();
                                         setActiveType(prev => prev === type ? 'Todos' : type);
                                     }}
                                     className={`px-3 py-2.5 rounded-xl text-[8.5px] font-[1000] uppercase tracking-widest transition-all w-full flex justify-center items-center ${
                                         isActive
                                             ? isDayMode
                                                 ? 'bg-white border border-[#b45309]/30 border-b-[2px] border-b-[#b45309]/60 text-[#78350f] translate-y-[3px] shadow-inner font-black'
                                                 : 'bg-fuchsia-500 border border-fuchsia-400 border-b-[2px] border-b-fuchsia-700 text-black shadow-[0_0_15px_rgba(217,70,239,0.7)] translate-y-[3px] font-black'
                                             : 'btn-3d-selector'
                                     }`}
                                 >
                                     {TYPE_LABELS[type]}
                                 </button>
                             );
                        })}
                    </div>

                    {/* Rubros panel to group and save vertical space */}
                    <div className={`p-3 rounded-3xl border transition-colors duration-500 ${
                        isDayMode 
                            ? 'bg-[#cda488]/15 border-[#855b3c]/15 shadow-inner' 
                            : 'bg-black/35 border-white/5 shadow-inner'
                    }`}>
                        <div className="flex flex-wrap gap-1.25 justify-center">
                            {CATEGORIES.map(cat => {
                                const isActive = activeCategory === cat;
                                return (
                                    <button
                                        key={cat}
                                        onClick={() => {
                                            playNeonClick();
                                            setActiveCategory(prev => prev === cat ? 'Todos' : cat);
                                        }}
                                        className={`px-2.5 py-1.5 rounded-xl text-[7px] font-black uppercase tracking-widest transition-all ${
                                            isActive
                                                ? isDayMode
                                                    ? 'bg-white border border-[#855b3c]/20 border-b-[2px] border-b-[#855b3c]/50 text-[#2d1e15] translate-y-[3px] shadow-inner'
                                                    : 'bg-cyan-500 border border-cyan-400 border-b-[2px] border-b-cyan-600 text-black shadow-[0_0_15px_rgba(0,229,255,0.6)] translate-y-[3px]'
                                                : 'btn-3d-celeste'
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* COUNT */}
                <div className="w-full mt-4 mb-2 px-1">
                    <p className={`text-[8.5px] font-[1000] uppercase tracking-[0.3em] ${isDayMode ? 'text-[#2d1e15]/40' : 'text-white/30'}`}>
                        {filtered.length} beneficio{filtered.length !== 1 ? 's' : ''} · {activeCategory} · {activeType === 'Todos' ? 'Todos los tipos' : TYPE_LABELS[activeType]}
                    </p>
                </div>

                {/* CARDS GRID */}
                <div className="w-full flex flex-col gap-4">
                    {filtered.length === 0 ? (
                        <div className={`border border-b-[5px] rounded-[2.5rem] p-12 flex flex-col items-center gap-3 text-center transition-all duration-700 ${
                            isDayMode 
                                ? 'bg-[#faf8f5] border-slate-200 border-b-[#855b3c] shadow-sm' 
                                : 'bg-[#0e1726]/40 backdrop-blur-xl border-cyan-500/20 border-b-cyan-500 shadow-cyan-950/20'
                        }`}>
                            <Tag size={24} className={isDayMode ? 'text-[#2d1e15]/20' : 'text-white/20'} />
                            <p className={`text-[10px] uppercase tracking-widest font-black ${isDayMode ? 'text-[#2d1e15]/40' : 'text-white/30'}`}>No hay beneficios en esta categoría</p>
                            <button onClick={() => { setActiveCategory('Todos'); setActiveType('Todos'); playNeonClick(); }} className={`px-6 py-3 rounded-xl border border-b-[4px] text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all hover:translate-y-[-1px] hover:border-b-[5px] active:translate-y-[3px] active:border-b-[1px] ${
                                isDayMode 
                                    ? 'bg-white border-slate-200 border-b-slate-300 text-[#855b3c]' 
                                    : 'bg-white/5 border-white/10 border-b-white/20 text-cyan-400'
                            }`}>
                                 Ver todos <ChevronRight size={10} />
                            </button>
                        </div>
                    ) : (
                        filtered.map((b, idx) => (
                            <BenefitCardComponent key={b.id} benefit={b} idx={idx} isDayMode={isDayMode} />
                        ))
                    )}
                </div>

                {/* FOOTER CTA & CONTROLS */}
                <div className="w-full mt-6 flex flex-col gap-3">
                    {/* Share page */}
                    <button
                        onClick={handleShare}
                        className="w-full py-4 rounded-2xl font-[1100] text-[10.5px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 btn-3d-celeste glow-cyan-glow shadow-[0_4px_25px_rgba(34,211,238,0.25)]"
                    >
                        <Share2 size={16} className="text-white" />
                        Compartir mis beneficios VIP
                    </button>

                    {/* Return to menu button (Volumetric 3D Celeste) */}
                    <button
                        onClick={() => { playNeonClick(); navigate(`/${townId}/home`); }}
                        className="w-full py-4 text-[10.5px] font-[1100] uppercase tracking-[0.25em] rounded-2xl transition-all flex items-center justify-center gap-2 btn-3d-celeste shadow-md"
                    >
                        <ArrowLeft size={16} />
                        Regresar al inicio
                    </button>

                    {/* Speak to advisor/Info block - Moved below Regresar al inicio */}
                    <div className={`border border-b-[5px] p-5 rounded-[2rem] flex items-start gap-4 transition-colors duration-300 ${
                        isDayMode 
                            ? 'bg-[#faf8f5] border-slate-200 border-b-[#855b3c]' 
                            : 'bg-[#0e1726]/40 backdrop-blur-xl border-cyan-500/20 border-b-cyan-500 shadow-cyan-950/20'
                    }`}>
                        {/* Ari avatar */}
                        <div className="w-9 h-9 shrink-0 rounded-xl overflow-hidden border border-cyan-400/30 shadow-[0_0_15px_rgba(34,211,238,0.3)] bg-slate-950 flex items-center justify-center">
                            <img src="/ari-avatar.png" alt="Ari mini" className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${isDayMode ? 'text-[#2d1e15]/50' : 'text-cyan-400'}`}>Ari dice</p>
                            <p className={`text-[10px] font-medium leading-relaxed ${isDayMode ? 'text-[#2d1e15]/60' : 'text-white/50'}`}>
                                Recordá presentar tu <strong className={isDayMode ? 'text-cyan-700' : 'text-cyan-400'}>Credencial VIP</strong> en el comercio para validar y gozar de los descuentos. Copiá el código si es un cupón digital 📱
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className={`w-full flex flex-col items-center gap-3 pt-10 pb-12 border-t relative z-10 bg-black/10 backdrop-blur-sm mt-12 max-w-lg mx-auto ${
                isDayMode ? 'border-[#855b3c]/20' : 'border-white/5'
            }`}>
                <div 
                    onClick={() => { playNeonClick(); navigate(`/${townId}/home`); }}
                    className="flex items-center gap-1 select-none cursor-pointer hover:opacity-90 transition-opacity"
                >
                    <span className="text-[20px] font-[1000] tracking-tighter uppercase text-white leading-none">
                        ShopDigital
                    </span>
                    <span className="text-[20px] font-[1000] leading-none text-sky-400">.ar</span>
                </div>
                
                {/* Footer links */}
                <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-wider text-white/60">
                    <button onClick={() => { playNeonClick(); navigate(`/terminos`); }} className="hover:text-white transition-colors">Términos y Condiciones</button>
                    <span>·</span>
                    <button onClick={handleShare} className="hover:text-white transition-colors">Compartir Red</button>
                </div>

                <div className="flex flex-col items-center gap-1 mt-1 text-center">
                    <p className="text-[9px] font-black text-white/80 uppercase tracking-[0.3em] select-none">
                        © 2026 · ShopDigital
                    </p>
                    <p className="text-[7.5px] font-bold text-white/40 uppercase tracking-[0.2em]">
                        Infraestructura de Comercio Local Verificado
                    </p>
                </div>
            </footer>

            {/* Ari Floating Assistant Bubble */}
            <AriMerchantAssistant 
                shop={ariContextShop} 
                role="baquiana" 
                isDayMode={isDayMode}
            />
        </div>
    );
};

export default VipBenefitsPage;
