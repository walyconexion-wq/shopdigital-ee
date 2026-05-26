import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
    Lock, ChevronLeft, Share2, ExternalLink, 
    Globe, Users, Store, Tag, ShoppingBag, Terminal, Copy, Check, Palette, Factory, RefreshCw, Zap, Database, Megaphone, MapPin
} from 'lucide-react';
import { playNeonClick } from '../utils/audio';
import { 
    guardarComercio, guardarOferta, saveGlobalConfig, DEFAULT_CATEGORIES_CONFIG, 
    saveCategoriesConfig, migrarDatosLegados, subscribeToGlobalConfig,
    guardarBroadcast, obtenerBroadcasts, eliminarBroadcast, toggleBroadcast, Broadcast
} from '../firebase';
import { Offer } from '../types';
import { DobermanBadge } from '../components/DobermanBadge';
import { CATEGORIES } from '../constants';
import { TRASLASIERRA_REGION } from '../data/regionalTemplates/traslasierraConfig';

const MasterPanelPage: React.FC = () => {
    const { townId: paramTownId } = useParams<{ townId: string }>();
    const townId = paramTownId || window.location.pathname.split('/')[1] || 'esteban-echeverria';
    
    // Determinar si es parte de Traslasierra
    const isTraslasierra = TRASLASIERRA_REGION.towns.some(t => t.id === townId);
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

    const formatTownName = (id: string) => {
        if (id === 'ezeiza') return 'Ezeiza';
        if (id === 'esteban-echeverria') return 'Esteban Echeverría';
        if (id === 'traslasierra') return 'Traslasierra';
        return id.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    const zoneName = zoneConfig?.townName || formatTownName(townId);
    
    // Lógica de color dinámica: Usa la config global si existe, sino asigna colores por defecto
    const zoneColor = zoneConfig?.primaryColor || (townId === 'ezeiza' ? '#22d3ee' : townId === 'esteban-echeverria' ? '#a855f7' : '#10b981'); // Verde esmeralda por defecto para Traslasierra

    const hexToRgba = (hex: string, alpha: number) => {
        try {
            const cleanHex = hex.replace('#', '');
            const r = parseInt(cleanHex.slice(0, 2), 16) || 34;
            const g = parseInt(cleanHex.slice(2, 4), 16) || 211;
            const b = parseInt(cleanHex.slice(4, 6), 16) || 238;
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
            const thisTown = towns.find((t: any) => t.id === townId) as any;
            const baseLocs: string[] = (thisTown && Array.isArray((thisTown as any).localities) && (thisTown as any).localities.length > 0)
                ? (thisTown as any).localities
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

    const managementPages = [
        { title: 'Reclutamiento Admin', desc: 'Aprobar o rechazar aspirantes a Embajadores', path: `/${townId}/tablero-maestro/reclutamiento` },
        { title: 'Panel de Embajador', desc: 'Autenticación para dar de alta comercios', path: `/${townId}/embajador` },
        { title: 'Suscripción de Comercio', desc: 'Formulario público para nuevos comerciantes', path: `/${townId}/subscripcion` },
    ];

    return (
        <div className="min-h-screen bg-[#020617] text-white pb-24 relative overflow-x-hidden selection:bg-cyan-500/30">
            <style>{`
                @keyframes pulseGlow {
                    0%, 100% { filter: drop-shadow(0 0 15px ${hexToRgba(zoneColor, 0.4)}); }
                    50% { filter: drop-shadow(0 0 35px ${hexToRgba(zoneColor, 0.8)}); }
                }
                .tech-grid-bg {
                    background-size: 30px 30px;
                    background-image: 
                        linear-gradient(to right, ${hexToRgba(zoneColor, 0.04)} 1px, transparent 1px),
                        linear-gradient(to bottom, ${hexToRgba(zoneColor, 0.04)} 1px, transparent 1px);
                }
                .glass-card-neon {
                    background: linear-gradient(145deg, rgba(255,255,255,0.02), rgba(0,0,0,0.4));
                    backdrop-filter: blur(12px);
                    border: 1px solid ${hexToRgba(zoneColor, 0.3)};
                    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
                }
                .glass-card-neon:hover {
                    box-shadow: 0 0 20px ${hexToRgba(zoneColor, 0.2)};
                    background: linear-gradient(145deg, rgba(255,255,255,0.04), rgba(0,0,0,0.6));
                }
            `}</style>
            {/* Background Tecnológico — Modo Camaleón: responde al color de la zona */}
            <div className="fixed inset-0 pointer-events-none z-0 tech-grid-bg">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-screen"></div>
                <div 
                    className="absolute top-0 right-0 w-[50vw] h-[50vw] rounded-full blur-[120px]"
                    style={{ backgroundColor: hexToRgba(zoneColor, 0.15) }}
                />
                <div 
                    className="absolute bottom-0 left-0 w-[50vw] h-[50vw] rounded-full blur-[120px]"
                    style={{ backgroundColor: hexToRgba(zoneColor, 0.1) }}
                />
                <div 
                    className="absolute inset-0"
                    style={{ 
                        backgroundImage: `linear-gradient(${hexToRgba(zoneColor, 0.05)} 1px, transparent 1px), linear-gradient(90deg, ${hexToRgba(zoneColor, 0.05)} 1px, transparent 1px)`,
                        backgroundSize: '40px 40px'
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020617]/50 to-[#020617]/90"></div>
            </div>

            <div 
                className="backdrop-blur-xl border-b pt-10 pb-6 px-6 relative z-10 sticky top-0 shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
                style={{ 
                    background: 'rgba(24,24,27,0.80)',
                    borderBottomColor: hexToRgba(zoneColor, 0.3)
                }}
            >
                <div role="button" tabIndex={0} onClick={() => { playNeonClick(); navigate(`/${townId}/home`); }} className="absolute top-10 left-6 hover:opacity-70 cursor-pointer" style={{ color: zoneColor }}>
                    <ChevronLeft size={24} />
                </div>
                <div className="flex flex-col items-center">
                    <Terminal size={36} className="mb-2" style={{ color: zoneColor, animation: 'pulseGlow 4s infinite alternate' }} />
                    <h1 className="text-2xl font-[1000] uppercase tracking-[0.25em] text-center drop-shadow-md" style={{ color: zoneColor, textShadow: `0 0 20px ${hexToRgba(zoneColor, 0.5)}` }}>
                        Tablero Maestro
                    </h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] mt-2 text-center" style={{ color: zoneColor, textShadow: `0 0 15px ${hexToRgba(zoneColor, 0.8)}` }}>
                        {zoneName.toUpperCase()} · CONTROL GENERAL
                    </p>
                    <div className="mt-2">
                        <DobermanBadge />
                    </div>
                </div>
            </div>

            <div className="px-6 mt-8 space-y-10 relative z-10 pb-20 max-w-lg mx-auto">
                
                {/* 🛡️ ACCESO DIRECTO AL BÚNKER CENTRAL (Solo Director) */}
                <div 
                    role="button" tabIndex={0}
                    onClick={() => { playNeonClick(); navigate(`/${townId}/bunker-waly`); }}
                    className="w-full glass-card-neon text-white p-5 rounded-2xl font-[1000] uppercase tracking-widest border border-violet-500/40 hover:border-violet-400 active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer shadow-[0_0_30px_rgba(139,92,246,0.2)] relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-500/0 via-white/5 to-violet-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                    <Zap size={18} className="text-violet-400" />
                    <span className="text-[13px] text-violet-300">BÚNKER CENTRAL DEL DIRECTOR - WALY</span>
                </div>

                
                {/* 🛡️ ACCESO DIRECTO AL PANEL MAESTRO INDUSTRIAL */}
                <div 
                    role="button" tabIndex={0}
                    onClick={() => { 
                        playNeonClick(); 
                        const prov = townId === 'traslasierra' || (typeof isTraslasierra !== 'undefined' && isTraslasierra) ? 'cordoba' : 'buenos-aires';
                        navigate(`/empresas/tablero-maestro?provincia=${prov}`); 
                    }}
                    className="w-full glass-card-neon text-white p-5 rounded-2xl font-[1000] uppercase tracking-widest border border-cyan-500/40 hover:border-cyan-400 active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer shadow-[0_0_30px_rgba(6,182,212,0.2)] relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-white/5 to-cyan-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                    <Terminal size={18} className="text-cyan-400" />
                    <span className="text-[13px] text-cyan-300">PANEL MAESTRO INDUSTRIAL (B2B)</span>
                </div>
\n                {/* Botón de Inject Data eliminado por directiva de Operaciones 2.0 */}

                {/* Botón de Reset Maestro eliminado por directiva de Operaciones 2.0 (Prevención de reseteos en producción) */}

                {/* SELECTORES DE ADN ZONAL 🧬 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-2 animate-in fade-in slide-in-from-top-4 duration-1000">
                    <button 
                        onClick={() => { playNeonClick(); navigate('/ezeiza/home'); }}
                        className={`py-6 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2 group ${townId === 'ezeiza' ? 'bg-cyan-500/20 border-cyan-500 shadow-[0_0_30px_rgba(34,211,238,0.2)]' : 'bg-zinc-900/50 border-white/10 opacity-75 hover:opacity-100 hover:border-white/25'}`}
                    >
                        <Globe size={24} className={townId === 'ezeiza' ? 'text-cyan-400' : 'text-white/60 group-hover:text-white transition-colors'} />
                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${townId === 'ezeiza' ? 'text-white' : 'text-white/45 group-hover:text-white/85 transition-colors'}`}>Zona Ezeiza</span>
                    </button>
                    <button 
                        onClick={() => { playNeonClick(); navigate('/esteban-echeverria/home'); }}
                        className={`py-6 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2 group ${townId === 'esteban-echeverria' ? 'bg-violet-500/20 border-violet-500 shadow-[0_0_30px_rgba(139,92,246,0.2)]' : 'bg-zinc-900/50 border-white/10 opacity-75 hover:opacity-100 hover:border-white/25'}`}
                    >
                        <Lock size={24} className={townId === 'esteban-echeverria' ? 'text-violet-400' : 'text-white/60 group-hover:text-white transition-colors'} />
                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${townId === 'esteban-echeverria' ? 'text-white' : 'text-white/45 group-hover:text-white/85 transition-colors'}`}>Zona E. Echeverría</span>
                    </button>
                    <button 
                        onClick={() => { playNeonClick(); navigate('/region/traslasierra'); }}
                        className={`py-6 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2 group ${isTraslasierra ? 'bg-emerald-500/20 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.2)]' : 'bg-zinc-900/50 border-white/10 opacity-75 hover:opacity-100 hover:border-white/25'}`}
                    >
                        <MapPin size={24} className={isTraslasierra ? 'text-emerald-400' : 'text-white/60 group-hover:text-white transition-colors'} />
                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isTraslasierra ? 'text-white' : 'text-white/45 group-hover:text-white/85 transition-colors'}`}>Traslasierra</span>
                    </button>
                </div>

                <div 
                    role="button" tabIndex={0}
                    onClick={() => { playNeonClick(); navigate(`/${townId}/tablero-maestro/configuracion`); }} 
                    className="w-full glass-card-neon text-white p-6 rounded-3xl font-[1000] uppercase tracking-widest border transition-all flex flex-col items-center justify-center gap-2 cursor-pointer group hover:bg-zinc-800"
                    style={{ borderColor: hexToRgba(zoneColor, 0.3) }}
                >
                    <div className="flex items-center gap-3">
                        <Palette size={20} style={{ color: zoneColor }} />
                        <span className="text-[14px]">DISEÑADOR DE INTERFAZ / SINFONÍA EDITOR</span>
                    </div>
                    <span className="text-[8px] opacity-40 uppercase tracking-[0.3em]">Control visual total · Colores · Temas · Identidad</span>
                </div>

                {/* 🏭 NODO EMPRESARIAL B2B */}
                <div 
                    role="button" tabIndex={0}
                    onClick={() => { playNeonClick(); navigate(`/empresas`); }} 
                    className="w-full glass-card-neon text-white p-5 rounded-2xl font-[1000] uppercase tracking-widest shadow-[0_0_25px_rgba(245,158,11,0.25)] border border-amber-500/40 hover:from-amber-600 hover:to-orange-500 active:scale-95 transition-all flex flex-col items-center justify-center gap-2 relative overflow-hidden group cursor-pointer"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />
                    <div className="flex items-center gap-2 pointer-events-none">
                        <Factory size={18} className="text-amber-200" />
                        <span className="text-[14px]">🏭 NODO EMPRESARIAL B2B</span>
                    </div>
                    <span className="text-[8px] text-amber-200/80 italic pointer-events-none">DIRECTORIO INDUSTRIAL · PROVEEDORES · MAYORISTAS</span>
                </div>





                {/* 📢 MARKETING INTELIGENTE */}
                <div 
                    role="button" tabIndex={0}
                    onClick={() => { playNeonClick(); navigate(`/${townId}/marketing-inteligente`); }} 
                    className="w-full glass-card-neon text-white p-4 rounded-xl font-[1000] uppercase tracking-widest shadow-[0_0_20px_rgba(6,182,212,0.2)] border border-cyan-500/40 hover:from-cyan-500 hover:to-blue-500 active:scale-95 transition-all flex flex-col items-center justify-center gap-1.5 relative overflow-hidden group cursor-pointer"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />
                    <div className="flex items-center gap-2 pointer-events-none">
                        <Megaphone size={14} className="text-cyan-200" />
                        <span className="text-[13px]">📢 MARKETING INTELIGENTE</span>
                    </div>
                    <span className="text-[8px] text-cyan-200/70 italic pointer-events-none">CEREBRO DEL BOT · CAMPAÑAS · FIDELIZACIÓN</span>
                </div>

                {/* ═══════════════════════════════════════════ */}
                {/* ⚡ TÉRMICAS DE GESTIÓN AUTÓNOMA (4 NODOS)  */}
                {/* ═══════════════════════════════════════════ */}
                <section>
                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 mb-4 flex items-center gap-2 border-b border-white/10 pb-2 mt-8">
                        <Terminal size={12} /> Térmicas de Gestión Autónoma
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* 🟡 GESTOR DE COMERCIOS */}
                        <div 
                            role="button" tabIndex={0}
                            onClick={() => { playNeonClick(); navigate(`/${townId}/embajador/gestion`); }} 
                            className="w-full glass-card-neon text-white p-5 rounded-2xl font-[1000] uppercase tracking-widest shadow-[0_0_20px_rgba(234,179,8,0.2)] border border-yellow-500/40 hover:from-yellow-600 hover:to-amber-500 active:scale-95 transition-all flex flex-col items-center justify-center gap-2 relative overflow-hidden group cursor-pointer"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />
                            <div className="flex items-center gap-2 pointer-events-none">
                                <Store size={18} className="text-yellow-300" />
                                <span className="text-[13px] text-yellow-300">GESTOR DE COMERCIOS</span>
                            </div>
                            <span className="text-[8px] text-yellow-300/80 italic pointer-events-none">RED MINORISTA · ACTIVACIONES · STATUS</span>
                        </div>

                        {/* 🔵 GESTOR DE CLIENTES */}
                        <div 
                            role="button" tabIndex={0}
                            onClick={() => { playNeonClick(); navigate(`/${townId}/embajador/clientes`); }} 
                            className="w-full glass-card-neon text-white p-5 rounded-2xl font-[1000] uppercase tracking-widest shadow-[0_0_20px_rgba(34,211,238,0.2)] border border-cyan-500/40 hover:from-cyan-600 hover:to-blue-500 active:scale-95 transition-all flex flex-col items-center justify-center gap-2 relative overflow-hidden group cursor-pointer"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />
                            <div className="flex items-center gap-2 pointer-events-none">
                                <Users size={18} className="text-cyan-300" />
                                <span className="text-[13px] text-cyan-300">GESTOR DE CLIENTES</span>
                            </div>
                            <span className="text-[8px] text-cyan-300/80 italic pointer-events-none">RED VIP · CRM · RETENCIÓN</span>
                        </div>

                        {/* 🟠 GESTOR DE INDUSTRIAS (B2B) */}
                        <div 
                            role="button" tabIndex={0}
                            onClick={() => { playNeonClick(); navigate(`/${townId}/embajador/empresas`); }} 
                            className="w-full glass-card-neon text-white p-5 rounded-2xl font-[1000] uppercase tracking-widest shadow-[0_0_20px_rgba(245,158,11,0.2)] border border-amber-500/40 hover:from-amber-600 hover:to-orange-500 active:scale-95 transition-all flex flex-col items-center justify-center gap-2 relative overflow-hidden group cursor-pointer"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />
                            <div className="flex items-center gap-2 pointer-events-none">
                                <Factory size={18} className="text-amber-300" />
                                <span className="text-[13px] text-amber-300">GESTOR DE INDUSTRIAS</span>
                            </div>
                            <span className="text-[8px] text-amber-300/80 italic pointer-events-none">NODO B2B · MAYORISTAS · PROVEEDORES</span>
                        </div>

                        {/* 🟣 GESTOR DE FACTURACIÓN */}
                        <div 
                            role="button" tabIndex={0}
                            onClick={() => { playNeonClick(); navigate(`/${townId}/embajador/facturacion`); }} 
                            className="w-full glass-card-neon text-white p-5 rounded-2xl font-[1000] uppercase tracking-widest shadow-[0_0_20px_rgba(139,92,246,0.2)] border border-violet-500/40 hover:from-violet-600 hover:to-purple-500 active:scale-95 transition-all flex flex-col items-center justify-center gap-2 relative overflow-hidden group cursor-pointer"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />
                            <div className="flex items-center gap-2 pointer-events-none">
                                <ShoppingBag size={18} className="text-violet-300" />
                                <span className="text-[13px] text-violet-300">GESTOR DE FACTURACIÓN</span>
                            </div>
                            <span className="text-[8px] text-violet-300/80 italic pointer-events-none">TESORERÍA · AVISOS · COBRANZAS</span>
                        </div>
                    </div>
                </section>

                {/* Management Panels */}
                <section>
                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 mb-4 flex items-center gap-2 border-b border-white/10 pb-2 mt-10">
                        <Lock size={12} /> Sistemas Internos
                    </h2>
                    <div className="grid grid-cols-1 gap-3">
                        {managementPages.map((page, idx) => (
                            <div
                                key={idx}
                                role="button" tabIndex={0}
                                onClick={() => { playNeonClick(); navigate(page.path); }}
                                className="glass-card-neon p-4 rounded-2xl flex items-center justify-between group hover:border-red-400/40 active:scale-95 transition-all cursor-pointer"
                            >
                                <div className="flex flex-col items-start text-left flex-1 pointer-events-none">
                                    <h3 className="text-[12px] font-[1000] text-red-400 uppercase tracking-wider group-hover:text-red-300 transition-colors">{page.title}</h3>
                                    <p className="text-[9px] text-white/40 uppercase tracking-widest mt-1">{page.desc}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div 
                                        role="button" tabIndex={0}
                                        onClick={(e) => { e.stopPropagation(); handleCopy(page.path); }}
                                        className={`w-8 h-8 rounded-full flex items-center justify-center border transition-colors cursor-pointer ${copiedPath === page.path ? 'bg-green-500/20 border-green-500/40 text-green-400' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white'}`}
                                    >
                                        {copiedPath === page.path ? <Check size={14} /> : <Copy size={14} />}
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/30 text-red-400 group-hover:bg-red-500/30 transition-colors">
                                        <ExternalLink size={14} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                </section>

                {/* ═══════════════════════════════════════════ */}
                {/* 📡 ACCESO AL CENTRO DE TRANSMISIÓN */}
                {/* ═══════════════════════════════════════════ */}
                <button 
                    onClick={() => { playNeonClick(); navigate(`/${townId}/director/transmision-en-vivo`); }}
                    className="w-full mt-8 py-5 rounded-3xl text-white font-[1000] uppercase tracking-[0.2em] text-[12px] flex items-center justify-center gap-3 relative overflow-hidden group cursor-pointer active:scale-95 transition-all glass-card-neon border-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.2)] hover:shadow-[0_0_30px_rgba(239,68,68,0.4)]"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    <Megaphone size={20} className="drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
                    <span className="drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]">📡 Entrar al Centro de Transmisión en Vivo</span>
                </button>
            </div>
        </div>
    );
};

export default MasterPanelPage;
