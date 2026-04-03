import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
    Lock, ChevronLeft, Share2, ExternalLink, 
    Globe, Users, Store, Tag, ShoppingBag, Terminal, Copy, Check, Palette, Factory, RefreshCw, Zap, Database
} from 'lucide-react';
import { playNeonClick } from '../utils/audio';
import { 
    guardarComercio, guardarOferta, saveGlobalConfig, DEFAULT_CATEGORIES_CONFIG, 
    saveCategoriesConfig, migrarDatosLegados, subscribeToGlobalConfig
} from '../firebase';
import { Offer } from '../types';

const MasterPanelPage: React.FC = () => {
    const { townId = 'esteban-echeverria' } = useParams<{ townId: string }>();
    const navigate = useNavigate();
    const [copiedPath, setCopiedPath] = useState<string | null>(null);
    const [isMigrating, setIsMigrating] = useState(false);
    const [migrationResult, setMigrationResult] = useState<any>(null);
    // Modo Camaleón: leer config de zona para identidad visual del panel
    const [zoneConfig, setZoneConfig] = useState<any>({ primaryColor: '#22d3ee', townName: '' });

    useEffect(() => {
        const unsub = subscribeToGlobalConfig((cfg) => {
            if (cfg) setZoneConfig(cfg);
        }, townId);
        return () => unsub();
    }, [townId]);

    const zoneColor = zoneConfig?.primaryColor || '#22d3ee';
    const zoneName = zoneConfig?.townName || townId;
    const hexToRgba = (hex: string, alpha: number) => {
        try {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        } catch { return `rgba(34, 211, 238, ${alpha})`; }
    };

    const handleMigration = async () => {
        if (!window.confirm(`¿Confirmás iniciar la migración de datos legados a ${zoneName}?`)) return;
        
        setIsMigrating(true);
        try {
            const result = await migrarDatosLegados(townId);
            setMigrationResult(result);
            alert("¡Migración completada con éxito! Revisa la Interfaz 1.");
        } catch (error) {
            console.error("Error en migración:", error);
            alert("Error durante la migración. Revisa la consola.");
        } finally {
            setIsMigrating(false);
        }
    };

    const initializeGlobalConfig = async () => {
        // ─── Confirm de seguridad con nombre de zona ─────────────────────
        const confirmed = window.confirm(
            `⚠️ RESET DE CONFIGURACIÓN ZONAL\n\n¿Estás seguro de resetear la configuración maestra de:\n\n"${zoneName}"\n\nEsto borrará colores, logos y textos de esta zona y los reemplazará con los valores por defecto.\n\nEl resto de las zonas NO serán afectadas.`
        );
        if (!confirmed) return;

        try {
            playNeonClick();
            const defaultConfig = {
                mainTitle: "ShopDigital",
                mainSubtitle: "Tu guía de ofertas locales",
                primaryColor: "#22d3ee",
                theme: "winter",
                townName: zoneName  // Nombre correcto de la zona activa
            };
            // Guarda SOLO en appConfig/{townId} — no toca otras zonas
            await saveGlobalConfig(defaultConfig, townId);

            // Inyectar rubros maestros etiquetados para esta zona
            await saveCategoriesConfig(DEFAULT_CATEGORIES_CONFIG, townId);

            alert(`🦎✅ ¡Modo Camaleón activado en "${zoneName}"!\n\nColores y rubros maestros restaurados solo para esta zona.\nEl resto de las ciudades permanecen intactas.`);
        } catch (error) {
            console.error("Error init config:", error);
            alert(`❌ Error al inicializar la configuración de "${zoneName}".`);
        }
    };

    const injectTestShops = async () => {
        // ─── Confirm con nombre de zona ───────────────────────────────────
        const confirmed = window.confirm(
            `⚠️ INYECCIÓN DIRIGIDA\n\n¿Estás seguro de inyectar datos maestros en la zona:\n\n"${zoneName}"\n\nSolo se escribirá en /comercios con townId="${townId}". No se tocará ninguna otra zona.`
        );
        if (!confirmed) return;

        try {
            // ─── Leer localidades reales de la zona activa ────────────────
            const { getTowns } = await import('../firebase');
            const towns = await getTowns();
            const thisTown = towns.find((t: any) => t.id === townId);
            const baseLocs: string[] = (thisTown && Array.isArray(thisTown.localities) && thisTown.localities.length > 0)
                ? thisTown.localities
                : ['Centro'];
            // Expandir a 6 slots (ciclar si hay menos)
            const locs = Array.from({ length: 6 }, (_, i) => baseLocs[i % baseLocs.length]);

            const shops: any[] = [
                {
                    id: `restaurante-maestro-1-${townId}`,
                    slug: `restaurante-maestro-1-${townId}`,
                    name: "Macondo",
                    category: "restaurantes",
                    zone: locs[0],
                    address: locs[0],
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
                        { id: `promo-macondo-1-${townId}`, name: "Menú Ejecutivo Base", price: 6500, image: "https://images.unsplash.com/photo-1544025162-81111421ab79?w=400&h=300&fit=crop" },
                        { id: `promo-macondo-2-${townId}`, name: "Bife de Chorizo Premium", price: 18500, image: "https://images.unsplash.com/photo-1558030006-450675393462?w=400&h=300&fit=crop" },
                        { id: `promo-macondo-3-${townId}`, name: "Ravioles Caseros", price: 9800, image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&h=300&fit=crop" },
                        { id: `promo-macondo-4-${townId}`, name: "Cerveza Artesanal Pinta", price: 3200, image: "https://images.unsplash.com/photo-1566633641473-ebbeaef6c7f4?w=400&h=300&fit=crop" }
                    ],
                    mapSheetUrl: '',
                    instagram: '',
                    facebook: '',
                    tiktok: ''
                },
                {
                    id: `restaurante-maestro-2-${townId}`,
                    slug: `restaurante-maestro-2-${townId}`,
                    name: "Parrilla La Carlina",
                    category: "restaurantes",
                    zone: locs[1],
                    address: locs[1],
                    mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31330.36092038479!2d-58.50213168184711!3d-34.813269452061654!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bcd180c730bb3d%3A0x2e5c48a961c30e14!2sParrilla%20-%20Restaurante%20La%20Carlina!5e1!3m2!1ses-419!2sar!4v1774709403317!5m2!1ses-419!2sar",
                    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop",
                    bannerImage: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=400&fit=crop",
                    specialty: "Parrilla",
                    ownerName: "Admin",
                    phone: "5491100000000",
                    rating: 5.0,
                    isActive: true, // Auto-activate
                    offers: [
                        { id: `promo-carlina-1-${townId}`, name: "Parrillada V.I.P (2 Pers)", price: 21000, image: "https://images.unsplash.com/photo-1544025162-81111421ab79?w=400&h=300&fit=crop" },
                        { id: `promo-carlina-2-${townId}`, name: "Matambre a la Pizza", price: 14500, image: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=400&h=300&fit=crop" },
                        { id: `promo-carlina-3-${townId}`, name: "Bondiola Braseada", price: 16000, image: "https://images.unsplash.com/photo-1628268909376-e8c5dfdc3130?w=400&h=300&fit=crop" },
                        { id: `promo-carlina-4-${townId}`, name: "Flan Mixto Casero", price: 4500, image: "https://images.unsplash.com/photo-1587314168485-3236d6710814?w=400&h=300&fit=crop" }
                    ],
                    mapSheetUrl: '',
                    instagram: '',
                    facebook: '',
                    tiktok: ''
                },
                {
                    id: `restaurante-maestro-3-${townId}`,
                    slug: `restaurante-maestro-3-${townId}`,
                    name: "El Bodegón De Canning",
                    category: "restaurantes",
                    zone: locs[2],
                    address: locs[2],
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
                    id: `fastfood-maestro-1-${townId}`,
                    slug: `fastfood-maestro-1-${townId}`,
                    name: "Mr Tasty",
                    category: "fastfood",
                    zone: locs[3 % locs.length],
                    address: locs[3 % locs.length],
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
                    id: `fastfood-maestro-2-${townId}`,
                    slug: `fastfood-maestro-2-${townId}`,
                    name: "Burger Mat",
                    category: "fastfood",
                    zone: locs[4 % locs.length],
                    address: locs[4 % locs.length],
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
                    id: `fastfood-maestro-3-${townId}`,
                    slug: `fastfood-maestro-3-${townId}`,
                    name: "Sabores Express",
                    category: "fastfood",
                    zone: locs[5 % locs.length],
                    address: locs[5 % locs.length],
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
                    id: `b2b-1-${townId}`,
                    target: 'B2B',
                    title: "20% OFF Cenas Comerciales",
                    description: `Descuento en cenas para eventos de empresas locales de ${zoneName}.`,
                    price: "A convenir",
                    discountLabel: "20% OFF",
                    image: "https://images.unsplash.com/photo-1544025162-81111421ab79?w=800&h=600&fit=crop",
                    merchantName: "Macondo",
                    merchantZone: locs[0],
                    category: "restaurantes",
                    validFrom: new Date().toISOString().split('T')[0],
                    validUntil: "2026-12-31",
                    isActive: true,
                    createdAt: new Date().toISOString()
                },
                {
                    id: `b2b-2-${townId}`,
                    target: 'B2B',
                    title: "Parrillada Corporativa VIP",
                    description: "Bebidas liberadas contratando mesa para más de 10 personas.",
                    price: "$21,000 / persona",
                    discountLabel: "Bebidas Libre",
                    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop",
                    merchantName: "Parrilla La Carlina",
                    merchantZone: locs[1],
                    category: "restaurantes",
                    validFrom: new Date().toISOString().split('T')[0],
                    validUntil: "2026-12-31",
                    isActive: true,
                    createdAt: new Date().toISOString()
                },
                {
                    id: `b2b-3-${townId}`,
                    target: 'B2B',
                    title: "Viandas para Personal",
                    description: `Precios mayoristas en viandas diarias para empresas de la red ShopDigital ${zoneName}.`,
                    price: "$6,500 / un.",
                    discountLabel: "Mayoreo",
                    image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&h=600&fit=crop",
                    merchantName: "El Bodegón De Canning",
                    merchantZone: locs[2],
                    category: "restaurantes",
                    validFrom: new Date().toISOString().split('T')[0],
                    validUntil: "2026-12-31",
                    isActive: true,
                    createdAt: new Date().toISOString()
                }
            ];

            alert(`🛡️ INICIO DE INYECCIÓN DIRIGIDA → Zona: ${zoneName} (${townId})`);
            for (const shop of shops) {
                await guardarComercio(shop, townId);
            }
            for (const offer of b2bOffers) {
                await guardarOferta(offer, townId);
            }
            alert(`✅ ¡ÉXITO! Datos maestros inyectados en "${zoneName}" con localidades: ${[...new Set(shops.map((s: any) => s.zone))].join(', ')}`);
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
        { title: 'Landing Nosotros', desc: 'Presentación de la empresa', path: `/${townId}/nosotros`, icon: <Globe size={18} /> },
        { title: 'Landing Unirse', desc: 'Registro para comercios / Embajador', path: `/${townId}/unirse`, icon: <Store size={18} /> },
        { title: 'Landing Descubrir', desc: 'Presentación para Clientes B2C', path: `/${townId}/descubrir`, icon: <Users size={18} /> },
        { title: 'Ofertas B2B Red', desc: 'Descuentos exclusivos entre comercios', path: `/${townId}/red-comercial/descuentos`, icon: <Tag size={18} /> },
        { title: 'Ofertas B2C VIP', desc: 'Ofertas para red de clientes locales', path: `/${townId}/red-comercial/ofertas`, icon: <ShoppingBag size={18} /> },
        { title: 'Reclutamiento Público', desc: 'Formulario inicial (Paso 1)', path: `/${townId}/reclutamiento`, icon: <Globe size={18} /> },
    ];

    const managementPages = [
        { title: 'Reclutamiento Admin', desc: 'Aprobar o rechazar aspirantes a Embajadores', path: `/${townId}/tablero-maestro/reclutamiento` },
        { title: 'Panel de Embajador', desc: 'Autenticación para dar de alta comercios', path: `/${townId}/embajador` },
        { title: 'Facturación y Avisos', desc: 'Suscripciones B2C y B2B', path: `/${townId}/embajador/facturacion` },
        { title: 'Relevamiento Táctico', desc: 'Carga Express Mobile de prospectos en calle', path: `/${townId}/embajador/relevamiento/nuevo` },
        { title: 'Gestión de Prospectos', desc: 'Ver, revisar, y activar leads de relevamiento', path: `/${townId}/embajador/relevamiento/gestion` },
        { title: 'Suscripción Creadores', desc: 'Página de suscripción comercial', path: `/${townId}/subscripcion` },
        { title: 'Base de Clientes', desc: 'Para ver todos los clientes registrados', path: `/${townId}/base-clientes` },
        { title: 'Gestión Comercial', desc: 'Ruta directa a listado de comercios', path: `/${townId}/embajador/gestion` },
        { title: 'Configuración Global', desc: 'Temas estacionales e identidad de App', path: `/${townId}/tablero-maestro/configuracion` },
    ];

    return (
        <div className="min-h-screen bg-black text-white pb-24 relative overflow-hidden selection:bg-cyan-500/30">
            {/* Background — Modo Camaleón: responde al color de la zona */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div 
                    className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full blur-[100px]"
                    style={{ backgroundColor: hexToRgba(zoneColor, 0.1) }}
                />
                <div 
                    className="absolute inset-0"
                    style={{ backgroundImage: `linear-gradient(${hexToRgba(zoneColor, 0.03)} 1px, transparent 1px), linear-gradient(90deg, ${hexToRgba(zoneColor, 0.03)} 1px, transparent 1px)`, backgroundSize: '40px 40px' }}
                />
            </div>

            <div 
                className="backdrop-blur-xl border-b pt-10 pb-6 px-6 relative z-10 sticky top-0 shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
                style={{ 
                    background: 'rgba(24,24,27,0.80)',
                    borderBottomColor: hexToRgba(zoneColor, 0.3)
                }}
            >
                <button onClick={() => { playNeonClick(); navigate(`/${townId}/home`); }} className="absolute top-10 left-6 hover:opacity-70" style={{ color: zoneColor }}>
                    <ChevronLeft size={24} />
                </button>
                <div className="flex flex-col items-center">
                    <Terminal size={32} className="mb-2" style={{ color: zoneColor, filter: `drop-shadow(0 0 15px ${hexToRgba(zoneColor, 0.5)})` }} />
                    <h1 className="text-xl font-[1000] uppercase tracking-[0.2em] text-white">Tablero Maestro</h1>
                    <p className="text-[9px] font-bold uppercase tracking-widest mt-1" style={{ color: zoneColor }}>
                        {zoneName} · Control General
                    </p>
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
                    onClick={() => { playNeonClick(); navigate(`/${townId}/tablero-maestro/configuracion`); }} 
                    className="w-full bg-violet-600/80 text-white p-4 rounded-xl font-[1000] uppercase tracking-widest shadow-[0_0_20px_rgba(139,92,246,0.3)] border border-violet-500/50 hover:bg-violet-500 active:scale-95 transition-all flex flex-col items-center justify-center gap-1.5"
                >
                    <div className="flex items-center gap-2">
                        <Palette size={14} className="text-white/80" />
                        <span className="text-[14px]">🎨 SINFONÍA DE ESTACIONES</span>
                    </div>
                    <span className="text-[8px] text-violet-200">CAMBIAR TEMA · COLORES · TÍTULOS DE INTERFAZ 1 y 2</span>
                </button>

                <button 
                    onClick={() => { playNeonClick(); navigate(`/${townId}/tablero-maestro/fabrica`); }} 
                    className="w-full bg-gradient-to-r from-amber-600/90 to-yellow-600/90 text-white p-4 rounded-xl font-[1000] uppercase tracking-widest shadow-[0_0_25px_rgba(245,158,11,0.3)] border border-yellow-500/50 hover:from-amber-500 hover:to-yellow-500 active:scale-95 transition-all flex flex-col items-center justify-center gap-1.5 relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    <div className="flex items-center gap-2">
                        <Factory size={14} className="text-white/80" />
                        <span className="text-[14px]">🏭 LA FÁBRICA · VISIóN GLOBAL</span>
                    </div>
                    <span className="text-[8px] text-yellow-100 italic">VER Y SALTAR A CUALQUIER ZONA · FORJAR NUEVAS CIUDADES</span>
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
                            onClick={() => { playNeonClick(); navigate(`/${townId}/embajador/gestion`); }}
                            className="w-full mt-4 bg-yellow-500 text-black py-3 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] active:scale-95 transition-transform"
                        >
                            Ir a buscar comercio
                        </button>
                    </div>

                    {/* SECCIÓN DE MANTENIMIENTO */}
                    <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-2xl p-5 mt-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 opacity-20">
                            <Database size={40} className="text-cyan-400" />
                        </div>
                        <h3 className="text-[11px] font-black text-cyan-400 uppercase tracking-widest mb-3 flex items-center gap-2 border-b border-cyan-500/20 pb-2">
                            <RefreshCw size={14} className={isMigrating ? "animate-spin" : ""} /> Mantenimiento del Sistema
                        </h3>
                        
                        {!migrationResult ? (
                            <>
                                <p className="text-[10px] text-white/70 leading-relaxed mb-4">
                                    Si no ves tus comercios o categorías antiguas en la Interfaz 1, usa este botón para re-conectarlos a la zona de <strong>Esteban Echeverría</strong>.
                                </p>
                                <button 
                                    onClick={handleMigration}
                                    disabled={isMigrating}
                                    className={`w-full py-4 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 transition-all ${isMigrating ? 'bg-cyan-900/50 text-cyan-500 cursor-not-allowed' : 'bg-cyan-500 text-black active:scale-95 shadow-[0_0_20px_rgba(34,211,238,0.3)]'}`}
                                >
                                    {isMigrating ? (
                                        <>Procesando ADN...</>
                                    ) : (
                                        <>
                                            <Zap size={14} /> Migrar Datos Legados
                                        </>
                                    )}
                                </button>
                            </>
                        ) : (
                            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                                <p className="text-[10px] text-green-400 font-bold mb-2">¡MIGRACIÓN COMPLETADA!</p>
                                <div className="grid grid-cols-3 gap-2 text-center text-[9px] uppercase tracking-tighter">
                                    <div className="bg-white/5 p-2 rounded-lg">
                                        <div className="text-white font-black text-xs">{migrationResult.shops}</div>
                                        <div className="text-white/40">Comercios</div>
                                    </div>
                                    <div className="bg-white/5 p-2 rounded-lg">
                                        <div className="text-white font-black text-xs">{migrationResult.clients}</div>
                                        <div className="text-white/40">Clientes</div>
                                    </div>
                                    <div className="bg-white/5 p-2 rounded-lg">
                                        <div className="text-white font-black text-xs">{migrationResult.offers}</div>
                                        <div className="text-white/40">Ofertas</div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setMigrationResult(null)}
                                    className="w-full mt-4 text-[9px] text-cyan-400/60 hover:text-cyan-400 uppercase font-black"
                                >
                                    Cerrar Reporte
                                </button>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default MasterPanelPage;
