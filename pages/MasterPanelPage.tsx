import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Lock, ChevronLeft, Share2, ExternalLink, 
    Globe, Users, Store, Tag, ShoppingBag, Terminal, Copy, Check, Palette, Factory
} from 'lucide-react';
import { playNeonClick } from '../utils/audio';
import { 
    guardarComercio, guardarOferta, saveGlobalConfig, DEFAULT_CATEGORIES_CONFIG, saveCategoriesConfig 
} from '../firebase';
import { Offer } from '../types';

const MasterPanelPage: React.FC = () => {
    const navigate = useNavigate();
    const [copiedPath, setCopiedPath] = useState<string | null>(null);

    const initializeGlobalConfig = async () => {
        try {
            playNeonClick();
            const defaultConfig = {
                mainTitle: "ShopDigital",
                mainSubtitle: "Tu guía de ofertas locales",
                primaryColor: "#22d3ee",
                theme: "winter", 
                townName: "Esteban Echeverría"
            };
            await saveGlobalConfig(defaultConfig);
            
            // Inyectar rubros iniciales
            await saveCategoriesConfig(DEFAULT_CATEGORIES_CONFIG);

            alert("¡Modo Camaleón Activado! 🎨❄️ Mirá la nieve en la Home.");
        } catch (error) {
            console.error("Error init config:", error);
            alert("Error al inicializar");
        }
    };

    const injectTestShops = async () => {
        try {
            const shops: any[] = [
                {
                    id: "macondo-restaurante",
                    slug: "macondo",
                    name: "Macondo",
                    category: "restaurantes",
                    zone: "Luis Guillón",
                    address: "Luis Guillón",
                    mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31330.333639195138!2d-58.50213166152844!3d-34.81334119999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bcd1669b1d6949%3A0xfa8f1cd3207ae1a1!2sMacondo!5e1!3m2!1ses-419!2sar!4v1774709334693!5m2!1ses-419!2sar",
                    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop",
                    bannerImage: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=400&fit=crop",
                    description: "El mejor ambiente y la mejor comida para disfrutar en familia.",
                    specialty: "Restaurante",
                    ownerName: "Admin",
                    phone: "5491100000000",
                    rating: 5.0,
                    isActive: true, // Auto-activate since user is admin!
                    offers: [
                        {
                            id: "promo-macondo-1",
                            name: "Menú Ejecutivo Base",
                            price: 6500,
                            image: "https://images.unsplash.com/photo-1544025162-81111421ab79?w=400&h=300&fit=crop"
                        },
                        {
                            id: "promo-macondo-2",
                            name: "Bife de Chorizo Premium",
                            price: 18500,
                            image: "https://images.unsplash.com/photo-1558030006-450675393462?w=400&h=300&fit=crop"
                        },
                        {
                            id: "promo-macondo-3",
                            name: "Ravioles Caseros",
                            price: 9800,
                            image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&h=300&fit=crop"
                        },
                        {
                            id: "promo-macondo-4",
                            name: "Cerveza Artesanal Pinta",
                            price: 3200,
                            image: "https://images.unsplash.com/photo-1566633641473-ebbeaef6c7f4?w=400&h=300&fit=crop"
                        }
                    ],
                    mapSheetUrl: '',
                    instagram: '',
                    facebook: '',
                    tiktok: ''
                },
                {
                    id: "parrilla-la-carlina",
                    slug: "parrilla-la-carlina",
                    name: "Parrilla La Carlina",
                    category: "restaurantes",
                    zone: "Monte Grande",
                    address: "Monte Grande",
                    mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31330.36092038479!2d-58.50213168184711!3d-34.813269452061654!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bcd180c730bb3d%3A0x2e5c48a961c30e14!2sParrilla%20-%20Restaurante%20La%20Carlina!5e1!3m2!1ses-419!2sar!4v1774709403317!5m2!1ses-419!2sar",
                    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop",
                    bannerImage: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=400&fit=crop",
                    specialty: "Parrilla",
                    ownerName: "Admin",
                    phone: "5491100000000",
                    rating: 5.0,
                    isActive: true, // Auto-activate
                    offers: [
                        {
                            id: "promo-carlina-1",
                            name: "Parrillada V.I.P (2 Pers)",
                            price: 21000,
                            image: "https://images.unsplash.com/photo-1544025162-81111421ab79?w=400&h=300&fit=crop"
                        },
                        {
                            id: "promo-carlina-2",
                            name: "Matambre a la Pizza",
                            price: 14500,
                            image: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=400&h=300&fit=crop"
                        },
                        {
                            id: "promo-carlina-3",
                            name: "Bondiola Braseada",
                            price: 16000,
                            image: "https://images.unsplash.com/photo-1628268909376-e8c5dfdc3130?w=400&h=300&fit=crop"
                        },
                        {
                            id: "promo-carlina-4",
                            name: "Flan Mixto Casero",
                            price: 4500,
                            image: "https://images.unsplash.com/photo-1587314168485-3236d6710814?w=400&h=300&fit=crop"
                        }
                    ],
                    mapSheetUrl: '',
                    instagram: '',
                    facebook: '',
                    tiktok: ''
                },
                {
                    id: "bodegon-de-canning",
                    slug: "bodegon-de-canning",
                    name: "El Bodegón De Canning",
                    category: "restaurantes",
                    zone: "El Jagüel",
                    address: "El Jagüel",
                    mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31315.31353599826!2d-58.53928356152844!3d-34.85282359999997!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bcd7ed0d8beecd%3A0x539414616272bd17!2sEl%20Bodegon%20De%20Canning!5e1!3m2!1ses-419!2sar!4v1774709476315!5m2!1ses-419!2sar",
                    image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&h=300&fit=crop",
                    bannerImage: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&h=400&fit=crop",
                    specialty: "Bodegón",
                    ownerName: "Admin",
                    phone: "5491100000000",
                    rating: 5.0,
                    isActive: true, // Auto-activate
                    offers: [
                        {
                            id: "promo-bodegon-1",
                            name: "Milanesa Napolitana XXL",
                            price: 9500,
                            image: "https://images.unsplash.com/photo-1599921841143-819065a55cc6?w=400&h=300&fit=crop"
                        },
                        {
                            id: "promo-bodegon-2",
                            name: "Sorrentinos de Jamón y Queso",
                            price: 8500,
                            image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&h=300&fit=crop"
                        },
                        {
                            id: "promo-bodegon-3",
                            name: "Cazuela de Mariscos",
                            price: 22000,
                            image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop"
                        },
                        {
                            id: "promo-bodegon-4",
                            name: "Tabla Picada Bodegón (3 Pers)",
                            price: 24000,
                            image: "https://images.unsplash.com/photo-1541529086526-db283c563270?w=400&h=300&fit=crop"
                        }
                    ],
                    mapSheetUrl: '',
                    instagram: '',
                    facebook: '',
                    tiktok: ''
                },
                {
                    id: "mr-tasty-monte-grande",
                    slug: "mr-tasty-monte-grande",
                    name: "Mr Tasty",
                    category: "fastfood",
                    zone: "Monte Grande",
                    address: "Monte Grande",
                    mapUrl: "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d22814.031406935814!2d-58.4754765!3d-34.7977637!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bcd14b53c1b6f3%3A0x91ef24a15ef7cb98!2sMr%20Tasty%20Monte%20Grande!5e1!3m2!1ses-419!2sar!4v1774740877510!5m2!1ses-419!2sar",
                    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop",
                    bannerImage: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=400&fit=crop",
                    specialty: "Hamburguesas & Fast Food",
                    ownerName: "Admin",
                    phone: "5491100000000",
                    rating: 4.8,
                    isActive: true, // Auto-activate
                    offers: [
                        {
                            id: "promo-tasty-1",
                            name: "Combo Tasty Doble Cheddar",
                            price: 7500,
                            image: "https://images.unsplash.com/photo-1586816001966-79b736744398?w=400&h=300&fit=crop"
                        },
                        {
                            id: "promo-tasty-2",
                            name: "Papas Fritas con Bacon",
                            price: 4500,
                            image: "https://images.unsplash.com/photo-1576107248873-1d0b3a31c19b?w=400&h=300&fit=crop"
                        },
                        {
                            id: "promo-tasty-3",
                            name: "Nuggets de Pollo x10",
                            price: 5200,
                            image: "https://images.unsplash.com/photo-1562967914-608f82629710?w=400&h=300&fit=crop"
                        },
                        {
                            id: "promo-tasty-4",
                            name: "Milkshake Vainilla & Oreo",
                            price: 3800,
                            image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&h=300&fit=crop"
                        }
                    ],
                    mapSheetUrl: '',
                    instagram: '',
                    facebook: '',
                    tiktok: ''
                },
                {
                    id: "burger-mat-luis-guillon",
                    slug: "burger-mat-luis-guillon",
                    name: "Burger Mat",
                    category: "fastfood",
                    zone: "Luis Guillón",
                    address: "Luis Guillón",
                    mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d22815.061778173727!2d-58.48918582682876!3d-34.794039999999995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bcd39bdc8c9ff3%3A0x118244d60db4d933!2sBURGUER%20MAT!5e1!3m2!1ses-419!2sar!4v1774741379189!5m2!1ses-419!2sar",
                    image: "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=400&h=300&fit=crop",
                    bannerImage: "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=800&h=400&fit=crop",
                    specialty: "Hamburguesas Smash",
                    ownerName: "Admin",
                    phone: "5491100000000",
                    rating: 4.9,
                    isActive: true, // Auto-activate
                    offers: [
                        {
                            id: "promo-burgermat-1",
                            name: "Smash Burger Doble",
                            price: 6500,
                            image: "https://images.unsplash.com/photo-1594212691516-436f5efa9a4d?w=400&h=300&fit=crop"
                        },
                        {
                            id: "promo-burgermat-2",
                            name: "Hamburguesa BBQ Crispy",
                            price: 7200,
                            image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&h=300&fit=crop"
                        },
                        {
                            id: "promo-burgermat-3",
                            name: "Super Pancho con Papas",
                            price: 3500,
                            image: "https://images.unsplash.com/photo-1585848206001-f0932c0d83ad?w=400&h=300&fit=crop"
                        },
                        {
                            id: "promo-burgermat-4",
                            name: "Aros de Cebolla Rebozados",
                            price: 3200,
                            image: "https://images.unsplash.com/photo-1639024471283-03518883512d?w=400&h=300&fit=crop"
                        }
                    ],
                    mapSheetUrl: '',
                    instagram: '',
                    facebook: '',
                    tiktok: ''
                },
                {
                    id: "sabores-express-el-jaguel",
                    slug: "sabores-express-el-jaguel",
                    name: "Sabores Express",
                    category: "fastfood",
                    zone: "El Jagüel",
                    address: "El Jagüel",
                    mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d22803.99859432698!2d-58.52188422682876!3d-34.834003499999994!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bcd100487efa8b%3A0x33c68573928f7921!2sSabores%20Express%20EL%20JAGUEL!5e1!3m2!1ses-419!2sar!4v1774741501606!5m2!1ses-419!2sar",
                    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop",
                    bannerImage: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&h=400&fit=crop",
                    specialty: "Pizzas & Empanadas",
                    ownerName: "Admin",
                    phone: "5491100000000",
                    rating: 4.6,
                    isActive: true, // Auto-activate
                    offers: [
                        {
                            id: "promo-sabores-1",
                            name: "Promoción: 2 Pizzas Muzzarella",
                            price: 11000,
                            image: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=400&h=300&fit=crop"
                        },
                        {
                            id: "promo-sabores-2",
                            name: "Docena de Empanadas Premium",
                            price: 8500,
                            image: "https://images.unsplash.com/photo-1627447470659-1e3df6a165b4?w=400&h=300&fit=crop"
                        },
                        {
                            id: "promo-sabores-3",
                            name: "Pizza Especial Jamón y Morrones",
                            price: 7500,
                            image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop"
                        },
                        {
                            id: "promo-sabores-4",
                            name: "Media Docena Emp. Carne Cortada",
                            price: 4500,
                            image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&h=300&fit=crop"
                        }
                    ],
                    mapSheetUrl: '',
                    instagram: '',
                    facebook: '',
                    tiktok: ''
                }
            ];
            
            const b2bOffers: Offer[] = [
                {
                    id: "b2b-macondo-1",
                    target: 'B2B',
                    title: "20% OFF Cenas Comerciales",
                    description: "Descuento en cenas para eventos de empresas locales de Esteban Echeverría.",
                    price: "A convenir",
                    discountLabel: "20% OFF",
                    image: "https://images.unsplash.com/photo-1544025162-81111421ab79?w=800&h=600&fit=crop",
                    merchantName: "Macondo",
                    merchantZone: "Luis Guillón",
                    category: "restaurantes",
                    validFrom: new Date().toISOString().split('T')[0],
                    validUntil: "2026-12-31",
                    isActive: true,
                    createdAt: new Date().toISOString()
                },
                {
                    id: "b2b-carlina-1",
                    target: 'B2B',
                    title: "Parrillada Corporativa VIP",
                    description: "Bebidas liberadas contratando mesa para más de 10 personas.",
                    price: "$21,000 / persona",
                    discountLabel: "Bebidas Libre",
                    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop",
                    merchantName: "Parrilla La Carlina",
                    merchantZone: "Monte Grande",
                    category: "restaurantes",
                    validFrom: new Date().toISOString().split('T')[0],
                    validUntil: "2026-12-31",
                    isActive: true,
                    createdAt: new Date().toISOString()
                },
                {
                    id: "b2b-bodegon-1",
                    target: 'B2B',
                    title: "Viandas para Personal",
                    description: "Precios mayoristas en viandas diarias para empresas de la red ShopDigital.",
                    price: "$6,500 / un.",
                    discountLabel: "Mayoreo",
                    image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&h=600&fit=crop",
                    merchantName: "El Bodegón De Canning",
                    merchantZone: "El Jagüel",
                    category: "restaurantes",
                    validFrom: new Date().toISOString().split('T')[0],
                    validUntil: "2026-12-31",
                    isActive: true,
                    createdAt: new Date().toISOString()
                }
            ];

            alert("🛡️ INICIO DE INYECCIÓN DE SISTEMA MAESTRO...");
            for (const shop of shops) {
                 await guardarComercio(shop);
            }
            for (const offer of b2bOffers) {
                 await guardarOferta(offer);
            }
            alert("✅ ¡ÉXITO! Base de Datos de Muestra Cargada Correctamente.");
        } catch (error: any) {
            console.error("Error injetando datos:", error);
            alert("❌ ERROR AL SUBIR: " + (error.message || "Fallo de permisos."));
        }
    };

    const handleShare = async (path: string, title: string, desc: string) => {
        playNeonClick();
        const url = `${window.location.origin}${path}`;
        const text = `${desc}\n\n👉 ${url}`;
        
        if (navigator.share) {
            try {
                await navigator.share({ title, text, url });
            } catch (err) {
                console.error(err);
            }
        } else {
            const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
            window.open(waUrl, '_blank');
        }
    };

    const handleCopy = async (path: string) => {
        playNeonClick();
        const url = `${window.location.origin}${path}`;
        try {
            await navigator.clipboard.writeText(url);
            setCopiedPath(path);
            setTimeout(() => setCopiedPath(null), 2000);
        } catch (err) {
            console.error('Failed to copy', err);
        }
    };

    const publicPages = [
        { title: 'Landing Nosotros', desc: 'Presentación de la empresa', path: '/nosotros', icon: <Globe size={18} /> },
        { title: 'Landing Unirse', desc: 'Registro para comercios / Embajador', path: '/unirse', icon: <Store size={18} /> },
        { title: 'Landing Descubrir', desc: 'Presentación para Clientes B2C', path: '/descubrir', icon: <Users size={18} /> },
        { title: 'Ofertas B2B Red', desc: 'Descuentos exclusivos entre comercios', path: '/red-comercial/descuentos', icon: <Tag size={18} /> },
        { title: 'Ofertas B2C VIP', desc: 'Ofertas para red de clientes locales', path: '/red-comercial/ofertas', icon: <ShoppingBag size={18} /> },
        { title: 'Reclutamiento Público', desc: 'Formulario inicial (Paso 1)', path: '/reclutamiento', icon: <Globe size={18} /> },
    ];

    const managementPages = [
        { title: 'Reclutamiento Admin', desc: 'Aprobar o rechazar aspirantes a Embajadores', path: '/tablero-maestro/reclutamiento' },
        { title: 'Panel de Embajador', desc: 'Autenticación para dar de alta comercios', path: '/embajador' },
        { title: 'Facturación y Avisos', desc: 'Suscripciones B2C y B2B', path: '/embajador/facturacion' },
        { title: 'Relevamiento Táctico', desc: 'Carga Express Mobile de prospectos en calle', path: '/embajador/relevamiento/nuevo' },
        { title: 'Gestión de Prospectos', desc: 'Ver, revisar, y activar leads de relevamiento', path: '/embajador/relevamiento/gestion' },
        { title: 'Suscripción Creadores', desc: 'Página de suscripción comercial', path: '/subscripcion' },
        { title: 'Base de Clientes', desc: 'Para ver todos los clientes registrados', path: '/base-clientes' },
        { title: 'Gestión Comercial', desc: 'Ruta directa a listado de comercios', path: '/embajador/gestion' },
        { title: 'Configuración Global', desc: 'Temas estacionales e identidad de App', path: '/tablero-maestro/configuracion' },
    ];

    return (
        <div className="min-h-screen bg-black text-white pb-24 relative overflow-hidden selection:bg-cyan-500/30">
            {/* Background elements */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px]" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
            </div>

            <div className="bg-zinc-900/80 backdrop-blur-xl border-b border-cyan-500/30 pt-10 pb-6 px-6 relative z-10 sticky top-0 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                <button onClick={() => navigate(-1)} className="absolute top-10 left-6 text-cyan-400 hover:text-cyan-300">
                    <ChevronLeft size={24} />
                </button>
                <div className="flex flex-col items-center">
                    <Terminal size={32} className="text-cyan-400 mb-2 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]" />
                    <h1 className="text-xl font-[1000] uppercase tracking-[0.2em] text-white">Tablero Maestro V2</h1>
                    <p className="text-[9px] font-bold text-cyan-400/80 uppercase tracking-widest mt-1">Control General de Waly</p>
                </div>
            </div>

            <div className="px-6 mt-8 space-y-10 relative z-10 pb-20 max-w-lg mx-auto">
                <button 
                    onClick={injectTestShops} 
                    className="w-full bg-red-600/90 text-white p-4 rounded-xl font-[1000] uppercase tracking-widest shadow-[0_0_20px_rgba(220,38,38,0.3)] border border-red-500/50 hover:bg-red-500 active:scale-95 transition-all flex flex-col items-center justify-center gap-1.5"
                >
                    <div className="flex items-center gap-2">
                        <Terminal size={14} className="text-white/80" />
                        <span className="text-[14px]">INJECT DATA</span>
                        <Lock size={14} className="text-white/80" />
                    </div>
                    <span className="text-[8px] text-red-200">INYECCIÓN MAESTRA A FIREBASE (USO ROOT)</span>
                </button>

                <button 
                    onClick={initializeGlobalConfig} 
                    className="w-full bg-cyan-600/90 text-white p-4 rounded-xl font-[1000] uppercase tracking-widest shadow-[0_0_20px_rgba(34,211,238,0.3)] border border-cyan-500/50 hover:bg-cyan-500 active:scale-95 transition-all flex flex-col items-center justify-center gap-1.5"
                >
                    <div className="flex items-center gap-2">
                        <Globe size={14} className="text-white/80" />
                        <span className="text-[14px]">ACTIVAR MODO CAMALEÓN</span>
                        <Check size={14} className="text-white/80" />
                    </div>
                    <span className="text-[8px] text-cyan-200">INICIALIZAR CONFIGURACIÓN GLOBAL (RESET MAESTRO)</span>
                </button>

                <button 
                    onClick={() => { playNeonClick(); navigate('/tablero-maestro/configuracion'); }} 
                    className="w-full bg-violet-600/80 text-white p-4 rounded-xl font-[1000] uppercase tracking-widest shadow-[0_0_20px_rgba(139,92,246,0.3)] border border-violet-500/50 hover:bg-violet-500 active:scale-95 transition-all flex flex-col items-center justify-center gap-1.5"
                >
                    <div className="flex items-center gap-2">
                        <Palette size={14} className="text-white/80" />
                        <span className="text-[14px]">🎨 SINFONÍA DE ESTACIONES</span>
                    </div>
                    <span className="text-[8px] text-violet-200">CAMBIAR TEMA · COLORES · TÍTULOS DE INTERFAZ 1 y 2</span>
                </button>

                <button 
                    onClick={() => { playNeonClick(); navigate('/tablero-maestro/fabrica'); }} 
                    className="w-full bg-gradient-to-r from-amber-600/90 to-yellow-600/90 text-white p-4 rounded-xl font-[1000] uppercase tracking-widest shadow-[0_0_25px_rgba(245,158,11,0.3)] border border-yellow-500/50 hover:from-amber-500 hover:to-yellow-500 active:scale-95 transition-all flex flex-col items-center justify-center gap-1.5 relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    <div className="flex items-center gap-2">
                        <Factory size={14} className="text-white/80" />
                        <span className="text-[14px]">🏭 LA FÁBRICA DE SHOPDIGITAL</span>
                    </div>
                    <span className="text-[8px] text-yellow-100 italic">MÓDULO DE EXPANSIÓN MULTI-ZONA (FORJAR CIUDADES)</span>
                </button>
                
                {/* Public Landings & Sections */}
                <section>
                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
                        <Globe size={12} /> Interfaces Públicas
                    </h2>
                    <div className="space-y-3">
                        {publicPages.map((page, idx) => (
                            <div key={idx} className="bg-zinc-900/40 border border-white/10 rounded-2xl p-4 flex flex-col gap-3 hover:border-cyan-500/30 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-400/20">
                                        {page.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-[12px] font-[1000] text-white uppercase tracking-wider">{page.title}</h3>
                                        <p className="text-[9px] text-white/40 uppercase tracking-widest mt-0.5">{page.desc}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-2 mt-2">
                                    <button 
                                        onClick={() => { playNeonClick(); navigate(page.path); }}
                                        className="bg-white/5 border border-white/10 py-2.5 rounded-xl flex items-center justify-center gap-1.5 text-[9px] uppercase font-black tracking-widest hover:bg-white/10 active:scale-95 transition-all text-white/80"
                                    >
                                        <ExternalLink size={12} /> Ver App
                                    </button>
                                    <button 
                                        onClick={() => handleShare(page.path, page.title, page.desc)}
                                        className="bg-cyan-500/10 border border-cyan-500/30 py-2.5 rounded-xl flex items-center justify-center gap-1.5 text-[9px] uppercase font-black tracking-widest hover:bg-cyan-500/20 active:scale-95 transition-all text-cyan-400"
                                    >
                                        <Share2 size={12} /> Compartir
                                    </button>
                                    <button 
                                        onClick={() => handleCopy(page.path)}
                                        className={`${copiedPath === page.path ? 'bg-green-500/20 border-green-500/40 text-green-400' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'} border py-2.5 rounded-xl flex items-center justify-center gap-1.5 text-[9px] uppercase font-black tracking-widest active:scale-95 transition-all`}
                                    >
                                        {copiedPath === page.path ? <Check size={12} /> : <Copy size={12} />} 
                                        {copiedPath === page.path ? 'Copiado' : 'Copiar'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Management Panels */}
                <section>
                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 mb-4 flex items-center gap-2 border-b border-white/10 pb-2 mt-10">
                        <Lock size={12} /> Sistemas Internos
                    </h2>
                    <div className="grid grid-cols-1 gap-3">
                        {managementPages.map((page, idx) => (
                            <button
                                key={idx}
                                onClick={() => { playNeonClick(); navigate(page.path); }}
                                className="bg-gradient-to-r from-red-500/10 to-orange-500/5 border border-red-500/20 rounded-2xl p-4 flex items-center justify-between group hover:border-red-400/40 active:scale-95 transition-all"
                            >
                                <div className="flex flex-col items-start text-left flex-1">
                                    <h3 className="text-[12px] font-[1000] text-red-400 uppercase tracking-wider group-hover:text-red-300 transition-colors">{page.title}</h3>
                                    <p className="text-[9px] text-white/40 uppercase tracking-widest mt-1">{page.desc}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleCopy(page.path); }}
                                        className={`w-8 h-8 rounded-full flex items-center justify-center border transition-colors ${copiedPath === page.path ? 'bg-green-500/20 border-green-500/40 text-green-400' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white'}`}
                                    >
                                        {copiedPath === page.path ? <Check size={14} /> : <Copy size={14} />}
                                    </button>
                                    <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/30 text-red-400 group-hover:bg-red-500/30 transition-colors">
                                        <ExternalLink size={14} />
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-5 mt-4">
                        <h3 className="text-[10px] font-black text-yellow-500 uppercase tracking-widest mb-2 flex items-center gap-2 border-b border-yellow-500/20 pb-2">
                            <Store size={14} /> Paneles de Comercio Especiales
                        </h3>
                        <p className="text-[9px] text-yellow-400/80 leading-relaxed">
                            Para acceder a los paneles de: <br/>
                            <span className="font-bold text-white uppercase ml-1">- Carga de Ofertas y Puntos VIP (Posnet)</span><br/>
                            <span className="font-bold text-white uppercase ml-1">- Suscripción B2C (Cliente)</span><br/>
                            Debe buscar el comercio específico en <strong>Gestión Comercial</strong> y usar los botones de acceso directo que figuran para ese local.
                        </p>
                        <button 
                            onClick={() => { playNeonClick(); navigate('/embajador/gestion'); }}
                            className="w-full mt-4 bg-yellow-500 text-black py-3 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] active:scale-95 transition-transform"
                        >
                            Ir a buscar comercio
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default MasterPanelPage;
