import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
    Lock, ChevronLeft, Share2, ExternalLink, 
    Globe, Users, Store, Tag, ShoppingBag, Terminal, Copy, Check, Palette, Factory, RefreshCw, Zap, Database, Megaphone, MapPin, Network, Mountain, Trash2,
    X, Sparkles, Bot, Radio, Shield, Heart, Church, Building2, Layers
} from 'lucide-react';
import { playNeonClick } from '../utils/audio';
import { 
    guardarComercio, guardarOferta, saveGlobalConfig, DEFAULT_CATEGORIES_CONFIG, 
    saveCategoriesConfig, migrarDatosLegados, subscribeToGlobalConfig,
    guardarBroadcast, obtenerBroadcasts, eliminarBroadcast, toggleBroadcast, Broadcast,
    guardarCliente, saveTown, db, eliminarComercio, eliminarCliente, crearFactura, eliminarFactura
} from '../firebase';
import { collection, query, where, getDocs, doc, updateDoc, increment } from 'firebase/firestore';
import { Offer } from '../types';
import { DobermanBadge } from '../components/DobermanBadge';
import { CATEGORIES } from '../constants';
import { TRASLASIERRA_REGION } from '../data/regionalTemplates/traslasierraConfig';
import { PATAGONIA_7_LAGOS_REGION } from '../data/regionalTemplates/patagonia7LagosConfig';

const MasterPanelPage: React.FC = () => {
    const { townId: paramTownId } = useParams<{ townId: string }>();
    const townId = paramTownId || window.location.pathname.split('/')[1] || 'esteban-echeverria';
    
    // Determinar si es parte de Traslasierra o Patagonia
    const isTraslasierra = TRASLASIERRA_REGION.towns.some(t => t.id === townId);
    const isPatagonia = PATAGONIA_7_LAGOS_REGION.towns.some(t => t.id === townId);
    const isTouristRegion = isTraslasierra || isPatagonia;
    const navigate = useNavigate();
    const [copiedPath, setCopiedPath] = useState<string | null>(null);
    const [isMigrating, setIsMigrating] = useState(false);
    const [migrationResult, setMigrationResult] = useState<any>(null);
    const [isSeedingComercios, setIsSeedingComercios] = useState(false);
    const [hasSeededComercios, setHasSeededComercios] = useState(false);
    const [isSeedingClientes, setIsSeedingClientes] = useState(false);
    const [hasSeededClientes, setHasSeededClientes] = useState(false);
    const [isClearingSeed, setIsClearingSeed] = useState(false);
    
    // Modal de Búnkeres Institucionales
    const [selectedInstBunker, setSelectedInstBunker] = useState<any | null>(null);
    const [instCopiedId, setInstCopiedId] = useState(false);

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
                townName: zoneName
            };
            await saveGlobalConfig(defaultConfig, townId);
            await saveCategoriesConfig(DEFAULT_CATEGORIES_CONFIG, townId);

            alert(`🦎✅ ¡Modo Camaleón activado en "${zoneName}"!\n\nColores y rubros maestros restaurados solo para esta zona.`);
        } catch (error) {
            console.error("Error init config:", error);
            alert(`❌ Error al inicializar la configuración de "${zoneName}".`);
        }
    };

    const seedMuestrasComercios = async () => {
        const confirmed = window.confirm(
            `🌱 SIEMBRA HIPERREALISTA DE COMERCIOS (V2)\n\n¿Estás seguro de sembrar comercios de muestra en la zona:\n\n"${zoneName}"?\n\nEsto creará un comercio por cada rubro activo en cada localidad de la zona.`
        );
        if (!confirmed) return;

        setIsSeedingComercios(true);
        try {
            playNeonClick();
            
            const defaultTownMetadata: Record<string, { name: string; localities: string[]; description: string }> = {
                'esteban-echeverria': {
                    name: 'Esteban Echeverría',
                    localities: ['Monte Grande', 'Luis Guillón', 'El Jagüel'],
                    description: 'Zona Madre — Origen de ShopDigital'
                },
                'ezeiza': {
                    name: 'Ezeiza',
                    localities: ['Ezeiza', 'La Unión', 'Tristán Suárez', 'Spegazzini'],
                    description: 'Zona Sur — Puerta de entrada internacional'
                },
                'lomas-de-zamora': {
                    name: 'Lomas de Zamora',
                    localities: ['Lomas de Zamora', 'Banfield', 'Temperley'],
                    description: 'Zona Sur — Núcleo comercial'
                },
                'mina-clavero': { name: 'Mina Clavero', localities: ['Mina Clavero'], description: 'Traslasierra — Corazón turístico' },
                'nono': { name: 'Nono', localities: ['Nono'], description: 'Traslasierra — Alta gama artesanal' },
                'cura-brochero': { name: 'Cura Brochero', localities: ['Villa Cura Brochero'], description: 'Traslasierra — Capital espiritual' },
                'panaholma': { name: 'Panaholma', localities: ['Panaholma'], description: 'Traslasierra — Valle serrano' },
                'villa-las-rosas': { name: 'Villa Las Rosas', localities: ['Villa Las Rosas'], description: 'Traslasierra — Eco-gastronomía' },
                'san-javier': { name: 'San Javier', localities: ['San Javier'], description: 'Traslasierra — Sierra y tradición' },
                'villa-dolores': { name: 'Villa Dolores', localities: ['Villa Dolores'], description: 'Traslasierra — Capital del Valle' },
                'las-rabonas': { name: 'Las Rabonas', localities: ['Las Rabonas'], description: 'Traslasierra — Cabañas y tranquilidad' }
            };

            const townMeta = defaultTownMetadata[townId] || {
                name: zoneName,
                localities: [zoneName],
                description: 'Zona Comercial'
            };

            await saveTown({
                id: townId,
                name: townMeta.name,
                localities: townMeta.localities,
                description: townMeta.description
            });

            const categoriesConfig = zoneConfig?.categories || CATEGORIES;
            const activeCats = categoriesConfig.filter((c: any) => c.isActive !== false);

            let totalComercios = 0;
            const baseLocs = townMeta.localities;

            for (const locName of baseLocs) {
                for (const cat of activeCats) {
                    const catKey = cat.id || cat.slug;
                    const locSlug = locName.toLowerCase().replace(/\s+/g, '-');
                    const id = `shop-sample-${catKey}-${locSlug}-${townId}`;
                    const businessName = `${cat.name} ${locName} (Muestra)`;

                    const sampleShop = {
                        id,
                        slug: `${cat.slug}-${locSlug}-sample`,
                        name: businessName,
                        category: catKey,
                        specialty: `Especialistas en ${cat.name.toLowerCase()} con atención de excelencia en ${locName}.`,
                        zone: locName,
                        address: `Av. San Martín 150, ${locName}`,
                        phone: '1158291032',
                        image: cat.defaultImage || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500',
                        bannerImage: cat.defaultBanner || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
                        description: `Comercio de prueba verificado para ${cat.name} en ${locName}. Descubrí ofertas exclusivas y promociones semanales.`,
                        isActive: true,
                        townId: townId,
                        offers: [],
                        isSeed: true,
                        status: 'incubacion'
                    };

                    await guardarComercio(sampleShop, townId);
                    totalComercios++;
                }
            }

            setHasSeededComercios(true);
            alert(`🌱 ¡Muestras de comercios sembradas con éxito en ${zoneName}!\n\nSe crearon ${totalComercios} comercios.`);
        } catch (error: any) {
            console.error("Error en la siembra de comercios:", error);
            alert(`❌ Error al sembrar comercios: ${error.message || error}`);
        } finally {
            setIsSeedingComercios(false);
        }
    };

    const seedMuestrasClientes = async () => {
        const confirmed = window.confirm(
            `👥 SIEMBRA DE CLIENTES Y SOCIOS VIP (V2)\n\n¿Estás seguro de sembrar clientes de muestra en la zona:\n\n"${zoneName}"?`
        );
        if (!confirmed) return;

        setIsSeedingClientes(true);
        try {
            playNeonClick();
            const colRef = collection(db, "comercios");
            const q = query(colRef, where("townId", "==", townId));
            const snap = await getDocs(q);

            if (snap.empty) {
                alert(`⚠️ No se encontraron comercios en la zona "${zoneName}". Primero debés sembrar los comercios.`);
                setIsSeedingClientes(false);
                return;
            }

            const shops = snap.docs.map(docSnap => ({
                id: docSnap.id,
                name: docSnap.data().name || 'Comercio Muestra'
            }));

            let totalClientes = 0;
            const clientNames = ["Juan Pérez", "María Gómez", "Lucas Díaz", "Sofía Rodríguez", "Carlos Sánchez", "Ana Martínez", "Diego Fernández", "Clara Benítez"];

            for (let i = 0; i < shops.length; i++) {
                const shop = shops[i];
                const clientName = clientNames[i % clientNames.length];
                const clientId = `cli-sample-${shop.id}`;
                const clientSample = {
                    id: clientId,
                    name: `${clientName} (Muestra)`,
                    email: `cliente.muestra.${i + 1}@${townId}.com`,
                    vipCode: `100${10 + i}`,
                    townId: townId,
                    status: "active",
                    createdAt: new Date().toISOString(),
                    vipStatus: "active",
                    role: "client-vip",
                    balance: 1000 + (i * 100) % 1500,
                    isSeed: true,
                    sourceShopId: shop.id,
                    sourceShopName: shop.name
                };

                await guardarCliente(clientSample, townId);
                await updateDoc(doc(db, "comercios", shop.id), {
                    subscribers: increment(1)
                });
                totalClientes++;
            }

            setHasSeededClientes(true);
            alert(`👥 ¡Clientes de muestra sembrados con éxito en ${zoneName}!\n\nSe crearon ${totalClientes} clientes VIP.`);
        } catch (error: any) {
            console.error("Error en la siembra de clientes:", error);
            alert(`❌ Error al sembrar clientes: ${error.message || error}`);
        } finally {
            setIsSeedingClientes(false);
        }
    };

    const limpiarMuestras = async () => {
        const confirmed = window.confirm(
            `⚠️ LIMPIEZA DE DATOS DE MUESTRA\n\n¿Estás seguro de eliminar todos los datos de muestra en la zona "${zoneName}"?`
        );
        if (!confirmed) return;

        setIsClearingSeed(true);
        try {
            playNeonClick();
            const shopsCol = collection(db, "comercios");
            const qShops = query(shopsCol, where("townId", "==", townId));
            const snapShops = await getDocs(qShops);
            let deletedShops = 0;
            for (const docSnap of snapShops.docs) {
                const data = docSnap.data();
                if (data.isSeed === true || docSnap.id.startsWith("shop-sample-") || docSnap.id.startsWith("ent-sample-") || docSnap.id.endsWith("-sample")) {
                    await eliminarComercio(docSnap.id);
                    deletedShops++;
                }
            }

            const clientsCol = collection(db, "clientes");
            const qClients = query(clientsCol, where("townId", "==", townId));
            const snapClients = await getDocs(qClients);
            let deletedClients = 0;
            for (const docSnap of snapClients.docs) {
                const data = docSnap.data();
                if (data.isSeed === true || docSnap.id.startsWith("cli-sample-") || docSnap.id.startsWith("cli-socio-cero-")) {
                    await eliminarCliente(docSnap.id);
                    deletedClients++;
                }
            }

            setHasSeededComercios(false);
            setHasSeededClientes(false);
            alert(`🧹 ¡Limpieza completada en ${zoneName}!\n\nSe eliminaron ${deletedShops} comercios y ${deletedClients} clientes.`);
        } catch (error: any) {
            console.error("Error en la limpieza de muestras:", error);
            alert(`❌ Error al limpiar muestras: ${error.message || error}`);
        } finally {
            setIsClearingSeed(false);
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

    // 🏛️ BÚNKERES INSTITUCIONALES DEL ECOSISTEMA FARO DE LUZ
    const INSTITUTIONAL_BUNKERS = [
        {
            id: 'faro-de-luz',
            title: 'BÚNKER COMUNIDAD FARO DE LUZ',
            agent: 'Luz 02',
            role: 'Ingeniera de Infraestructura y Ecotecnología',
            tag: 'Infraestructura & Domo',
            badgeColor: 'border-emerald-400 bg-emerald-500/20 text-emerald-300',
            borderColor: 'border-emerald-500/50 hover:border-emerald-400',
            glowColor: 'shadow-[0_0_25px_rgba(16,185,129,0.25)]',
            bgGradient: 'from-emerald-950/60 via-slate-900 to-black/80',
            icon: '🏔️⚡',
            location: 'Montaña Traslasierra, Córdoba (1 Ha + Pozo 80m)',
            liveWebUrl: 'https://farodeluz.dpdns.org',
            bunkerWebUrl: 'https://farodeluz.dpdns.org/bunker.html',
            githubUrl: 'https://github.com/walyconexion-wq/comunidad-faro-de-luz',
            features: [
                'Domo Geodésico Central (Frecuencia 4/5)',
                '6 Módulos Habitacionales Contenedores 40ft High Cube',
                'Parque Solar Fotovoltaico + Baterías de Litio',
                'Pozo Subterráneo a 80m + Tanque Cisterna en Torre',
                'Centro de Formación Comunitario y Tecnológico'
            ],
            conversationId: '164bdd4c-1f22-41b0-af68-c4b3f558316d',
            obsidianNote: '[[05_DESPLIEGUE_PRODUCCION_VERCEL.md]]',
            path: '/region/traslasierra'
        },
        {
            id: 'valle-de-luz',
            title: 'BÚNKER FUNDACIÓN VALLE DE LUZ',
            agent: 'Luz 03',
            role: 'Despliegue Social & Logística Territorial',
            tag: 'Impacto Social & Filantropía',
            badgeColor: 'border-amber-400 bg-amber-500/20 text-amber-300',
            borderColor: 'border-amber-500/50 hover:border-amber-400',
            glowColor: 'shadow-[0_0_25px_rgba(245,158,11,0.25)]',
            bgGradient: 'from-amber-950/60 via-stone-900 to-black/80',
            icon: '🤝📦',
            location: 'Valle de Traslasierra (Parajes y Comedores)',
            liveWebUrl: 'https://fundacion-valle-de-luz.vercel.app',
            bunkerWebUrl: 'https://fundacion-valle-de-luz.vercel.app/bunker.html',
            githubUrl: 'https://github.com/walyconexion-wq/fundacion-valle-de-luz-',
            features: [
                'Asistencia Directa a Familias en Vulnerabilidad',
                'Soporte y Cadena de Suministro a Comedores Comunitarios',
                'Flota Operativa: Toyota Hilux 4x4 (Montaña Profunda)',
                'Logística Masiva: Mercedes-Benz Sprinter',
                'Talleres de Oficios Digitales y Ecotecnología'
            ],
            conversationId: '5349f922-7249-4299-8fad-cd74e4975ed6',
            obsidianNote: '[[FUNDACION_VALLE_DE_LUZ/02_PLAN_DESPLIEGUE_Y_CONEXION_EXTERNA.md]]',
            path: `/${townId}/red-comercial/descuentos`
        },
        {
            id: 'caminos-de-fe',
            title: 'BÚNKER MINISTERIO CAMINOS DE FE',
            agent: 'Luz 04',
            role: 'Ingeniería de Audio, Streaming & Legal',
            tag: 'Culto Cristiano & Altar',
            badgeColor: 'border-purple-400 bg-purple-500/20 text-purple-300',
            borderColor: 'border-purple-500/50 hover:border-purple-400',
            glowColor: 'shadow-[0_0_25px_rgba(168,85,247,0.25)]',
            bgGradient: 'from-purple-950/60 via-zinc-900 to-black/80',
            icon: '🙏✨',
            location: 'Altar de Montaña & Misiones Regionales',
            liveWebUrl: 'https://ministerio-caminos-de-fe.vercel.app',
            bunkerWebUrl: 'https://ministerio-caminos-de-fe.vercel.app/bunker.html',
            githubUrl: 'https://github.com/walyconexion-wq/-ministerio-caminos-de-fe',
            features: [
                'Cultos de Campaña en Plazas y Parajes con Sonido Portátil',
                'Comunión y Red de Jóvenes de Adoración',
                'Escuelita Bíblica Infantil y Material Didáctico',
                'Rider de Sonido Profesional: Consolas, Microfonía y Potencia',
                'Personería Jurídica / Fichero Nacional de Culto'
            ],
            conversationId: 'f1d60dcd-0c5c-453f-a69a-33411d8e377f',
            obsidianNote: '[[MINISTERIO_CAMINOS_DE_FE/01_PLAN_DESPLIEGUE_Y_CONEXION_EXTERNA.md]]',
            path: `/${townId}/director/transmision-en-vivo`
        }
    ];

    const managementPages = [
        { title: 'Reclutamiento Admin', desc: 'Aprobar o rechazar aspirantes a Embajadores', path: `/${townId}/tablero-maestro/reclutamiento` },
        { title: 'Panel de Embajador', desc: 'Autenticación para dar de alta comercios', path: `/${townId}/embajador` },
        { title: 'Suscripción de Comercio', desc: 'Formulario público para nuevos comerciantes', path: `/${townId}/subscripcion` },
    ];

    return (
        <div className="fixed inset-0 overflow-y-auto overflow-x-hidden bg-[#020617] text-white pb-32 selection:bg-cyan-500/30 master-panel-container">
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
                    background: linear-gradient(145deg, rgba(255,255,255,0.02), rgba(0,0,0,0.5));
                    backdrop-filter: blur(12px);
                    border: 1px solid ${hexToRgba(zoneColor, 0.3)};
                    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
                }
                .glass-card-neon:hover {
                    box-shadow: 0 0 20px ${hexToRgba(zoneColor, 0.2)};
                    background: linear-gradient(145deg, rgba(255,255,255,0.04), rgba(0,0,0,0.7));
                }
            `}</style>

            {/* Background Tecnológico */}
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

            {/* CABECERA PRINCIPAL SLIM STICKY */}
            <div 
                className="w-full backdrop-blur-xl border-b py-2.5 sm:py-3 px-4 sm:px-8 relative z-30 sticky top-0 shadow-[0_4px_25px_rgba(0,0,0,0.6)]"
                style={{ 
                    background: 'rgba(15,18,28,0.88)',
                    borderBottomColor: hexToRgba(zoneColor, 0.3)
                }}
            >
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    {/* Botón Volver */}
                    <div 
                        role="button" 
                        tabIndex={0} 
                        onClick={() => { playNeonClick(); navigate(`/${townId}/home`); }} 
                        className="hover:opacity-80 active:scale-95 cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-500/40 transition-all group"
                        style={{ color: zoneColor }}
                    >
                        <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/80 group-hover:text-white hidden sm:inline">Volver a Home</span>
                    </div>

                    {/* Título Central Compacto y Afinado */}
                    <div className="flex items-center gap-2.5">
                        <Terminal size={18} style={{ color: zoneColor, animation: 'pulseGlow 3s infinite alternate' }} className="hidden sm:block" />
                        <div className="text-center sm:text-left">
                            <h1 
                                className="text-sm sm:text-base font-[1000] uppercase tracking-[0.25em] drop-shadow-md leading-none" 
                                style={{ color: zoneColor, textShadow: `0 0 15px ${hexToRgba(zoneColor, 0.6)}` }}
                            >
                                Tablero Maestro
                            </h1>
                            <p 
                                className="text-[8px] font-black uppercase tracking-[0.3em] mt-0.5 text-center sm:text-left" 
                                style={{ color: hexToRgba(zoneColor, 0.75) }}
                            >
                                {zoneName.toUpperCase()} · CENTRO DE COMANDO GENERAL
                            </p>
                        </div>
                    </div>

                    {/* Badge Doberman */}
                    <div className="flex items-center gap-2">
                        <DobermanBadge />
                    </div>
                </div>
            </div>

            {/* ════════════════════════════════════════════════════════════════ */}
            {/* CONTENEDOR PANORÁMICO WIDESCREEN RESPONSIVE (PC / MÓVIL)       */}
            {/* ════════════════════════════════════════════════════════════════ */}
            <div className="px-4 sm:px-6 lg:px-8 mt-8 space-y-10 relative z-10 pb-20 max-w-7xl mx-auto">
                
                {/* ════════════════════════════════════════════════════════════════ */}
                {/* 🗺️⚡ SECCIÓN 1: ESTADO MAYOR & INTELIGENCIA CENTRAL (2 CARDS)  */}
                {/* ════════════════════════════════════════════════════════════════ */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 1. Búnker Táctico y Estratégico (Lienzo de Avances de ShopDigital) */}
                    <div 
                        role="button" tabIndex={0}
                        onClick={() => { playNeonClick(); navigate(`/${townId}/bunker-tactico`); }}
                        className="w-full p-5 rounded-2xl font-[1000] uppercase tracking-wider border-2 border-cyan-400 bg-gradient-to-r from-cyan-950/70 via-[#0d1c38] to-blue-950/70 hover:from-cyan-900/90 hover:to-blue-900/90 active:scale-98 transition-all flex items-center justify-between cursor-pointer shadow-[0_0_30px_rgba(6,182,212,0.35)] relative overflow-hidden group"
                    >
                        <div className="flex items-center gap-3.5">
                            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
                                🗺️
                            </div>
                            <div className="text-left">
                                <div className="text-[13px] text-cyan-300 font-[1000] tracking-widest flex items-center gap-1.5">
                                    BÚNKER TÁCTICO & LIENZO <span className="text-xs">⚡</span>
                                </div>
                                <div className="text-[8.5px] text-cyan-400/80 font-mono tracking-wider">
                                    RADAR DE AVANCES · MAPA DE NODOS · PROTOCOLOS
                                </div>
                            </div>
                        </div>
                        <span className="text-[9px] text-cyan-200 font-black px-3 py-1.5 bg-cyan-500/30 rounded-xl border border-cyan-400/60 shadow whitespace-nowrap">
                            Estado Mayor
                        </span>
                    </div>

                    {/* 2. Jarvis Dashboard (Inteligencia Central de Agentes) */}
                    <div 
                        role="button" tabIndex={0}
                        onClick={() => { playNeonClick(); navigate('/jarvis'); }}
                        className="w-full p-5 rounded-2xl font-[1000] uppercase tracking-wider border-2 border-emerald-400 bg-gradient-to-r from-emerald-950/70 via-[#0a2e1d] to-teal-950/70 hover:from-emerald-900/90 hover:to-teal-900/90 active:scale-98 transition-all flex items-center justify-between cursor-pointer shadow-[0_0_30px_rgba(16,185,129,0.35)] relative overflow-hidden group"
                    >
                        <div className="flex items-center gap-3.5">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
                                🤖
                            </div>
                            <div className="text-left">
                                <div className="text-[13px] text-emerald-300 font-[1000] tracking-widest flex items-center gap-1.5">
                                    JARVIS-OS DASHBOARD <span className="text-xs">✨</span>
                                </div>
                                <div className="text-[8.5px] text-emerald-400/80 font-mono tracking-wider">
                                    TELEMETRÍA AGÉNTICA LUZ 01 · PROCESOS EN VIVO
                                </div>
                            </div>
                        </div>
                        <span className="text-[9px] text-emerald-200 font-black px-3 py-1.5 bg-emerald-500/30 rounded-xl border border-emerald-400/60 shadow whitespace-nowrap">
                            Jarvis 2.0
                        </span>
                    </div>
                </div>

                {/* ════════════════════════════════════════════════════════════════ */}
                {/* 🏛️ SECCIÓN 2: BÚNKERES INSTITUCIONALES · ECOSISTEMA FARO DE LUZ */}
                {/* ════════════════════════════════════════════════════════════════ */}
                <div className="border border-white/15 rounded-[2rem] p-6 bg-black/60 backdrop-blur-xl space-y-4 shadow-[0_15px_50px_rgba(0,0,0,0.7)]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-3 gap-2">
                        <div>
                            <h3 className="text-[12px] font-[1000] uppercase tracking-[0.25em] text-white flex items-center gap-2">
                                🏛️ BÚNKERES INSTITUCIONALES · ECOSISTEMA FARO DE LUZ
                            </h3>
                            <p className="text-[8.5px] text-white/50 font-mono tracking-wider mt-0.5">
                                MONTAÑA DE TRASLASIERRA, CÓRDOBA · INFRAESTRUCTURA, ACCIÓN SOCIAL Y CULTO
                            </p>
                        </div>
                        <span className="text-[8.5px] text-amber-300 font-bold px-2.5 py-1 bg-amber-500/15 rounded-lg border border-amber-500/30 self-start sm:self-auto">
                            3 Centros de Comando
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                        {INSTITUTIONAL_BUNKERS.map((bunker) => (
                            <div 
                                key={bunker.id}
                                role="button" tabIndex={0}
                                onClick={() => { playNeonClick(); setSelectedInstBunker(bunker); }}
                                className={`p-5 rounded-2xl border bg-gradient-to-b ${bunker.bgGradient} ${bunker.borderColor} ${bunker.glowColor} transition-all duration-300 flex flex-col justify-between cursor-pointer group hover:-translate-y-1 hover:shadow-2xl relative overflow-hidden`}
                            >
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-2xl">{bunker.icon}</span>
                                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${bunker.badgeColor}`}>
                                            {bunker.agent}
                                        </span>
                                    </div>
                                    <div>
                                        <h4 className="text-[12px] font-[1000] uppercase tracking-wider text-white group-hover:text-amber-300 transition-colors leading-snug">
                                            {bunker.title}
                                        </h4>
                                        <p className="text-[8.5px] text-white/70 font-mono mt-1 leading-relaxed">
                                            {bunker.role}
                                        </p>
                                    </div>
                                    <div className="pt-2 border-t border-white/10 space-y-1">
                                        {bunker.features.slice(0, 3).map((feat, fidx) => (
                                            <div key={fidx} className="flex items-center gap-1.5 text-[8px] text-white/60 font-medium truncate">
                                                <span className="text-amber-400">▹</span>
                                                <span>{feat}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                                    <span className="text-[8px] font-mono text-white/40 uppercase tracking-widest">
                                        {bunker.tag}
                                    </span>
                                    <span className="text-[9px] font-black uppercase tracking-wider text-amber-300 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                                        Operar Búnker →
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ════════════════════════════════════════════════════════════════ */}
                {/* 🛡️ SECCIÓN 3: LOS 12 BÚNKERS MINISTERIALES SHOPDIGITAL (4 COLS) */}
                {/* ════════════════════════════════════════════════════════════════ */}
                <div className="border border-white/10 rounded-[2rem] p-6 bg-black/45 backdrop-blur-md space-y-4 shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                        <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-white/70 flex items-center gap-2">
                            <Lock size={13} className="text-cyan-400 animate-pulse" /> BÚNKERS MINISTERIALES SHOPDIGITAL (12 NODOS)
                        </h3>
                        <span className="text-[8px] text-cyan-400 font-mono">SNC 2.0 RED MATRIZ</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
                        <div 
                            role="button" tabIndex={0}
                            onClick={() => { playNeonClick(); navigate(`/${townId}/bunker-waly`); }}
                            className="p-4 rounded-xl font-bold uppercase tracking-wider border border-violet-500/40 hover:border-violet-400 active:scale-95 transition-all flex items-center justify-between cursor-pointer shadow-[0_0_15px_rgba(139,92,246,0.1)] hover:bg-violet-900/15"
                        >
                            <span className="text-[10.5px] text-violet-300">🏛️ DIRECCIÓN (WALY)</span>
                            <span className="text-[8.5px] text-violet-400 px-2 py-0.5 bg-violet-500/10 rounded-md border border-violet-500/20">Omega</span>
                        </div>

                        <div 
                            role="button" tabIndex={0}
                            onClick={() => { playNeonClick(); navigate(`/${townId}/bunker/administracion`); }}
                            className="p-4 rounded-xl font-bold uppercase tracking-wider border border-amber-500/40 hover:border-amber-400 active:scale-95 transition-all flex items-center justify-between cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.1)] hover:bg-amber-900/15"
                        >
                            <span className="text-[10.5px] text-amber-300">💼 ADMINISTRACIÓN</span>
                            <span className="text-[8.5px] text-amber-400 px-2 py-0.5 bg-amber-500/10 rounded-md border border-amber-500/20">Admin</span>
                        </div>

                        <div 
                            role="button" tabIndex={0}
                            onClick={() => { playNeonClick(); navigate(`/${townId}/bunker/contable-legales`); }}
                            className="p-4 rounded-xl font-bold uppercase tracking-wider border border-red-500/40 hover:border-red-400 active:scale-95 transition-all flex items-center justify-between cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.1)] hover:bg-red-900/15"
                        >
                            <span className="text-[10.5px] text-red-300">⚖️ CONTABLE Y LEGALES</span>
                            <span className="text-[8.5px] text-red-400 px-2 py-0.5 bg-red-500/10 rounded-md border border-red-500/20">Legal</span>
                        </div>

                        <div 
                            role="button" tabIndex={0}
                            onClick={() => { playNeonClick(); navigate(`/${townId}/bunker/marketing`); }}
                            className="p-4 rounded-xl font-bold uppercase tracking-wider border border-emerald-500/40 hover:border-emerald-400 active:scale-95 transition-all flex items-center justify-between cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.1)] hover:bg-emerald-900/15"
                        >
                            <span className="text-[10.5px] text-emerald-300">📢 MARKETING Y EXPANSIÓN</span>
                            <span className="text-[8.5px] text-emerald-400 px-2 py-0.5 bg-emerald-500/10 rounded-md border border-emerald-500/20">Marketing</span>
                        </div>

                        <div 
                            role="button" tabIndex={0}
                            onClick={() => { playNeonClick(); navigate(`/${townId}/bunker/recursos-humanos`); }}
                            className="p-4 rounded-xl font-bold uppercase tracking-wider border border-cyan-500/40 hover:border-cyan-400 active:scale-95 transition-all flex items-center justify-between cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.1)] hover:bg-cyan-900/15"
                        >
                            <span className="text-[10.5px] text-cyan-300">👥 RECURSOS HUMANOS</span>
                            <span className="text-[8.5px] text-cyan-400 px-2 py-0.5 bg-cyan-500/10 rounded-md border border-cyan-500/20">RRHH</span>
                        </div>

                        <div 
                            role="button" tabIndex={0}
                            onClick={() => { playNeonClick(); navigate(`/${townId}/bunker/sistemas`); }}
                            className="p-4 rounded-xl font-bold uppercase tracking-wider border border-indigo-500/40 hover:border-indigo-400 active:scale-95 transition-all flex items-center justify-between cursor-pointer shadow-[0_0_15px_rgba(99,102,241,0.1)] hover:bg-indigo-900/15"
                        >
                            <span className="text-[10.5px] text-indigo-300">💻 SISTEMAS & DEV</span>
                            <span className="text-[8.5px] text-indigo-400 px-2 py-0.5 bg-indigo-500/10 rounded-md border border-indigo-500/20">IT</span>
                        </div>

                        <div 
                            role="button" tabIndex={0}
                            onClick={() => { playNeonClick(); navigate(`/${townId}/bunker/secops`); }}
                            className="p-4 rounded-xl font-bold uppercase tracking-wider border border-emerald-500/40 hover:border-emerald-400 active:scale-95 transition-all flex items-center justify-between cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.15)] hover:bg-emerald-900/15"
                        >
                            <span className="text-[10.5px] text-emerald-300">🛡️ SECOPS & SEGURIDAD</span>
                            <span className="text-[8.5px] text-emerald-400 px-2 py-0.5 bg-emerald-500/10 rounded-md border border-emerald-500/20">SecOps</span>
                        </div>

                        <div 
                            role="button" tabIndex={0}
                            onClick={() => { playNeonClick(); navigate(`/${townId}/bunker/planificacion-desarrollo`); }}
                            className="p-4 rounded-xl font-bold uppercase tracking-wider border border-blue-500/40 hover:border-blue-400 active:scale-95 transition-all flex items-center justify-between cursor-pointer shadow-[0_0_15px_rgba(59,130,246,0.1)] hover:bg-blue-900/15"
                        >
                            <span className="text-[10.5px] text-blue-300">🗺️ PLANIFICACIÓN</span>
                            <span className="text-[8.5px] text-blue-400 px-2 py-0.5 bg-blue-500/10 rounded-md border border-blue-500/20">Estrategia</span>
                        </div>

                        <div 
                            role="button" tabIndex={0}
                            onClick={() => { playNeonClick(); navigate(`/${townId}/bunker/inversion-exponencial`); }}
                            className="p-4 rounded-xl font-bold uppercase tracking-wider border border-yellow-500/40 hover:border-yellow-400 active:scale-95 transition-all flex items-center justify-between cursor-pointer shadow-[0_0_15px_rgba(234,179,8,0.1)] hover:bg-yellow-900/15"
                        >
                            <span className="text-[10.5px] text-yellow-300">📈 INVERSIÓN EXPONENCIAL</span>
                            <span className="text-[8.5px] text-yellow-400 px-2 py-0.5 bg-yellow-500/10 rounded-md border border-yellow-500/20">Finanzas</span>
                        </div>

                        <div 
                            role="button" tabIndex={0}
                            onClick={() => { playNeonClick(); navigate(`/${townId}/bunker/mantenimiento`); }}
                            className="p-4 rounded-xl font-bold uppercase tracking-wider border border-slate-500/40 hover:border-slate-400 active:scale-95 transition-all flex items-center justify-between cursor-pointer shadow-[0_0_15px_rgba(100,116,139,0.1)] hover:bg-slate-900/15"
                        >
                            <span className="text-[10.5px] text-slate-300">🔧 MANTENIMIENTO</span>
                            <span className="text-[8.5px] text-slate-400 px-2 py-0.5 bg-slate-500/10 rounded-md border border-slate-500/20">Soporte</span>
                        </div>

                        <div 
                            role="button" tabIndex={0}
                            onClick={() => { playNeonClick(); navigate(`/${townId}/bunker/clonacion`); }}
                            className="p-4 rounded-xl font-bold uppercase tracking-wider border border-teal-500/40 hover:border-teal-400 active:scale-95 transition-all flex items-center justify-between cursor-pointer shadow-[0_0_15px_rgba(20,184,166,0.1)] hover:bg-teal-900/15"
                        >
                            <span className="text-[10.5px] text-teal-300">🧬 CLONACIÓN FRACTAL</span>
                            <span className="text-[8.5px] text-teal-400 px-2 py-0.5 bg-teal-500/10 rounded-md border border-teal-500/20">Expansión</span>
                        </div>

                        <div 
                            role="button" tabIndex={0}
                            onClick={() => { playNeonClick(); navigate(`/${townId}/director/transmision-en-vivo`); }}
                            className="p-4 rounded-xl font-bold uppercase tracking-wider border border-rose-500/40 hover:border-rose-400 active:scale-95 transition-all flex items-center justify-between cursor-pointer shadow-[0_0_15px_rgba(244,63,94,0.1)] hover:bg-rose-900/15"
                        >
                            <span className="text-[10.5px] text-rose-300">📡 TRANSMISIÓN EN VIVO</span>
                            <span className="text-[8.5px] text-rose-400 px-2 py-0.5 bg-rose-500/10 rounded-md border border-rose-500/20">Streaming</span>
                        </div>
                    </div>
                </div>

                {/* ════════════════════════════════════════════════════════════════ */}
                {/* 🏭 SECCIÓN 4: ACCESOS INDUSTRIALES & ACCIONES DE MUESTRAS       */}
                {/* ════════════════════════════════════════════════════════════════ */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* PANEL INDUSTRIAL B2B */}
                    <div 
                        role="button" tabIndex={0}
                        onClick={() => { 
                            playNeonClick(); 
                            const prov = isTraslasierra ? 'cordoba' : isPatagonia ? 'patagonia' : 'buenos-aires';
                            navigate(`/empresas/tablero-maestro?provincia=${prov}`); 
                        }}
                        className="glass-card-neon text-white p-5 rounded-2xl font-[1000] uppercase tracking-widest border border-cyan-500/40 hover:border-cyan-400 active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer shadow-[0_0_30px_rgba(6,182,212,0.2)] relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-white/5 to-cyan-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                        <Terminal size={18} className="text-cyan-400" />
                        <span className="text-[12px] text-cyan-300">PANEL INDUSTRIAL B2B</span>
                    </div>

                    {/* SEMBRAR COMERCIOS */}
                    <button
                        disabled={isSeedingComercios || hasSeededComercios}
                        onClick={seedMuestrasComercios}
                        className={`glass-card-neon text-white p-5 rounded-2xl font-[1000] uppercase tracking-widest border transition-all flex items-center justify-center gap-3 cursor-pointer relative overflow-hidden group disabled:opacity-60 disabled:cursor-not-allowed
                            ${hasSeededComercios 
                                ? 'border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.2)] bg-emerald-500/10' 
                                : 'border-green-500/40 hover:border-green-400 shadow-[0_0_30px_rgba(34,197,94,0.2)]'
                            }`}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-white/5 to-green-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                        <Database size={18} className={hasSeededComercios ? 'text-emerald-400' : 'text-green-400 animate-pulse'} />
                        <span className={hasSeededComercios ? 'text-[11px] text-emerald-300' : 'text-[11px] text-green-300'}>
                            {isSeedingComercios ? '⏳ Sembrando...' : hasSeededComercios ? '✅ Comercios Listos' : '🌱 Sembrar Comercios'}
                        </span>
                    </button>

                    {/* SEMBRAR CLIENTES */}
                    <button
                        disabled={isSeedingClientes || hasSeededClientes}
                        onClick={seedMuestrasClientes}
                        className={`glass-card-neon text-white p-5 rounded-2xl font-[1000] uppercase tracking-widest border transition-all flex items-center justify-center gap-3 cursor-pointer relative overflow-hidden group disabled:opacity-60 disabled:cursor-not-allowed
                            ${hasSeededClientes 
                                ? 'border-cyan-500/40 shadow-[0_0_30px_rgba(6,182,212,0.2)] bg-cyan-500/10' 
                                : 'border-blue-500/40 hover:border-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.2)]'
                            }`}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-white/5 to-blue-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                        <Users size={18} className={hasSeededClientes ? 'text-cyan-400' : 'text-blue-400 animate-pulse'} />
                        <span className={hasSeededClientes ? 'text-[11px] text-cyan-300' : 'text-[11px] text-blue-300'}>
                            {isSeedingClientes ? '⏳ Sembrando...' : hasSeededClientes ? '✅ Clientes Listos' : '👥 Sembrar Clientes'}
                        </span>
                    </button>
                </div>

                {/* BOTÓN LIMPIAR MUESTRAS */}
                <div>
                    <button
                        disabled={isClearingSeed}
                        onClick={limpiarMuestras}
                        className="w-full glass-card-neon text-white p-4 rounded-xl font-[1000] uppercase tracking-widest border border-red-500/40 hover:border-red-400 hover:bg-red-500/10 shadow-[0_0_20px_rgba(239,68,68,0.15)] transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        <Trash2 size={16} className={isClearingSeed ? 'animate-spin' : 'text-red-400'} />
                        <span className="text-[10px] text-red-300">
                            {isClearingSeed ? '⏳ Limpiando Muestras...' : '🧹 Limpiar Muestras de Prueba (Reset)'}
                        </span>
                    </button>
                </div>

                {/* ════════════════════════════════════════════════════════════════ */}
                {/* 🧬 SECCIÓN 5: SELECTORES DE ADN ZONAL (4 COLUMNAS)             */}
                {/* ════════════════════════════════════════════════════════════════ */}
                <div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 border-b border-white/10 pb-2 mb-4 flex items-center gap-2">
                        <Globe size={13} className="text-cyan-400" /> SELECTORES DE ADN ZONAL
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                        <button 
                            onClick={() => { playNeonClick(); navigate('/ezeiza/home'); }}
                            className={`py-5 px-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2 group cursor-pointer ${townId === 'ezeiza' ? 'bg-cyan-500/20 border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.4)]' : 'bg-zinc-950/80 border-white/10 opacity-70 hover:opacity-100 hover:border-cyan-500/50'}`}
                        >
                            <Globe size={22} className={townId === 'ezeiza' ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]' : 'text-white/60 group-hover:text-cyan-300 transition-colors'} />
                            <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${townId === 'ezeiza' ? 'text-cyan-200' : 'text-white/45 group-hover:text-white/85 transition-colors'}`}>Zona Ezeiza</span>
                        </button>
                        <button 
                            onClick={() => { playNeonClick(); navigate('/esteban-echeverria/home'); }}
                            className={`py-5 px-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2 group cursor-pointer ${townId === 'esteban-echeverria' ? 'bg-violet-500/20 border-violet-500 shadow-[0_0_30px_rgba(139,92,246,0.4)]' : 'bg-zinc-950/80 border-white/10 opacity-70 hover:opacity-100 hover:border-violet-500/50'}`}
                        >
                            <Lock size={22} className={townId === 'esteban-echeverria' ? 'text-violet-400 drop-shadow-[0_0_8px_rgba(139,92,246,0.6)]' : 'text-white/60 group-hover:text-violet-300 transition-colors'} />
                            <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${townId === 'esteban-echeverria' ? 'text-violet-200' : 'text-white/45 group-hover:text-white/85 transition-colors'}`}>Zona E. Echeverría</span>
                        </button>
                        <button 
                            onClick={() => { playNeonClick(); navigate('/region/traslasierra'); }}
                            className={`py-5 px-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2 group cursor-pointer ${isTraslasierra ? 'bg-emerald-500/20 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.4)]' : 'bg-zinc-950/80 border-white/10 opacity-70 hover:opacity-100 hover:border-emerald-500/50'}`}
                        >
                            <MapPin size={22} className={isTraslasierra ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'text-white/60 group-hover:text-emerald-300 transition-colors'} />
                            <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isTraslasierra ? 'text-emerald-200' : 'text-white/45 group-hover:text-white/85 transition-colors'}`}>Traslasierra</span>
                        </button>
                        <button 
                            onClick={() => { playNeonClick(); navigate('/region/patagonia-7-lagos'); }}
                            className={`py-5 px-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2 group cursor-pointer ${townId === 'bariloche' || townId === 'san-martin-de-los-andes' || townId === 'villa-la-angostura' || townId === 'patagonia-7-lagos' ? 'bg-sky-500/20 border-sky-500 shadow-[0_0_30px_rgba(14,165,233,0.4)]' : 'bg-zinc-950/80 border-white/10 opacity-70 hover:opacity-100 hover:border-sky-500/50'}`}
                        >
                            <Mountain size={22} className={townId === 'bariloche' || townId === 'san-martin-de-los-andes' || townId === 'villa-la-angostura' || townId === 'patagonia-7-lagos' ? 'text-sky-400 drop-shadow-[0_0_8px_rgba(14,165,233,0.6)]' : 'text-white/60 group-hover:text-sky-300 transition-colors'} />
                            <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${townId === 'bariloche' || townId === 'san-martin-de-los-andes' || townId === 'villa-la-angostura' || townId === 'patagonia-7-lagos' ? 'text-sky-200' : 'text-white/45 group-hover:text-white/85 transition-colors'}`}>Patagonia 7L</span>
                        </button>
                    </div>
                </div>

                {/* SINFONÍA EDITOR & MARKETING */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div 
                        role="button" tabIndex={0}
                        onClick={() => { playNeonClick(); navigate(`/${townId}/tablero-maestro/configuracion`); }} 
                        className="w-full glass-card-neon text-white p-6 rounded-3xl font-[1000] uppercase tracking-widest border-2 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer group hover:bg-zinc-800/80 active:scale-98"
                        style={{ 
                            borderColor: zoneColor,
                            boxShadow: `0 0 20px ${hexToRgba(zoneColor, 0.4)}, inset 0 0 12px ${hexToRgba(zoneColor, 0.25)}`,
                            background: 'linear-gradient(145deg, rgba(255,255,255,0.03), rgba(0,0,0,0.65))'
                        }}
                    >
                        <div className="flex items-center gap-3 pointer-events-none">
                            <Palette size={22} style={{ color: zoneColor, filter: `drop-shadow(0 0 8px ${zoneColor})` }} className="animate-pulse" />
                            <span className="text-[13px] text-white">
                                SINFONÍA EDITOR DE INTERFAZ
                            </span>
                        </div>
                        <span className="text-[8.5px] uppercase tracking-[0.3em] text-white/70">
                            Colores · Temas · Identidad Zonal
                        </span>
                    </div>

                    <div 
                        role="button" tabIndex={0}
                        onClick={() => { playNeonClick(); navigate(`/${townId}/marketing-inteligente`); }} 
                        className="w-full glass-card-neon text-white p-6 rounded-3xl font-[1000] uppercase tracking-widest shadow-[0_0_20px_rgba(6,182,212,0.2)] border border-cyan-500/40 hover:from-cyan-500 hover:to-blue-500 active:scale-95 transition-all flex flex-col items-center justify-center gap-2 relative overflow-hidden group cursor-pointer"
                    >
                        <div className="flex items-center gap-3 pointer-events-none">
                            <Megaphone size={22} className="text-cyan-300" />
                            <span className="text-[13px] text-cyan-200">MARKETING INTELIGENTE</span>
                        </div>
                        <span className="text-[8.5px] text-cyan-200/70 uppercase tracking-[0.3em] pointer-events-none">
                            Cerebro de Campañas · Fidelización
                        </span>
                    </div>
                </div>

                {/* ════════════════════════════════════════════════════════════════ */}
                {/* ⚡ SECCIÓN 6: TÉRMICAS DE GESTIÓN AUTÓNOMA (4 NODOS)            */}
                {/* ════════════════════════════════════════════════════════════════ */}
                <div>
                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
                        <Terminal size={13} className="text-amber-400" /> TÉRMICAS DE GESTIÓN AUTÓNOMA
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* 🟡 GESTOR DE COMERCIOS */}
                        <div 
                            role="button" tabIndex={0}
                            onClick={() => { playNeonClick(); navigate(`/${townId}/embajador/gestion`); }} 
                            className="w-full glass-card-neon text-white p-5 rounded-2xl font-[1000] uppercase tracking-widest shadow-[0_0_20px_rgba(234,179,8,0.2)] border border-yellow-500/40 hover:from-yellow-600 hover:to-amber-500 active:scale-95 transition-all flex flex-col items-center justify-center gap-2 relative overflow-hidden group cursor-pointer"
                        >
                            <Store size={20} className="text-yellow-300" />
                            <span className="text-[12px] text-yellow-300">COMERCIOS</span>
                            <span className="text-[7.5px] text-yellow-300/80 italic">RED MINORISTA · STATUS</span>
                        </div>

                        {/* 🔵 GESTOR DE CLIENTES */}
                        <div 
                            role="button" tabIndex={0}
                            onClick={() => { playNeonClick(); navigate(`/${townId}/embajador/clientes`); }} 
                            className="w-full glass-card-neon text-white p-5 rounded-2xl font-[1000] uppercase tracking-widest shadow-[0_0_20px_rgba(34,211,238,0.2)] border border-cyan-500/40 hover:from-cyan-600 hover:to-blue-500 active:scale-95 transition-all flex flex-col items-center justify-center gap-2 relative overflow-hidden group cursor-pointer"
                        >
                            <Users size={20} className="text-cyan-300" />
                            <span className="text-[12px] text-cyan-300">CLIENTES VIP</span>
                            <span className="text-[7.5px] text-cyan-300/80 italic">CRM · RETENCIÓN</span>
                        </div>

                        {/* 🟠 GESTOR DE INDUSTRIAS (B2B) */}
                        <div 
                            role="button" tabIndex={0}
                            onClick={() => { playNeonClick(); navigate(`/${townId}/embajador/empresas`); }} 
                            className="w-full glass-card-neon text-white p-5 rounded-2xl font-[1000] uppercase tracking-widest shadow-[0_0_20px_rgba(245,158,11,0.2)] border border-amber-500/40 hover:from-amber-600 hover:to-orange-500 active:scale-95 transition-all flex flex-col items-center justify-center gap-2 relative overflow-hidden group cursor-pointer"
                        >
                            <Factory size={20} className="text-amber-300" />
                            <span className="text-[12px] text-amber-300">INDUSTRIAS B2B</span>
                            <span className="text-[7.5px] text-amber-300/80 italic">MAYORISTAS · EMPRESAS</span>
                        </div>

                        {/* 🟣 GESTOR DE FACTURACIÓN */}
                        <div 
                            role="button" tabIndex={0}
                            onClick={() => { playNeonClick(); navigate(`/${townId}/embajador/facturacion`); }} 
                            className="w-full glass-card-neon text-white p-5 rounded-2xl font-[1000] uppercase tracking-widest shadow-[0_0_20px_rgba(139,92,246,0.2)] border border-violet-500/40 hover:from-violet-600 hover:to-purple-500 active:scale-95 transition-all flex flex-col items-center justify-center gap-2 relative overflow-hidden group cursor-pointer"
                        >
                            <ShoppingBag size={20} className="text-violet-300" />
                            <span className="text-[12px] text-violet-300">FACTURACIÓN</span>
                            <span className="text-[7.5px] text-violet-300/80 italic">TESORERÍA · COBRANZAS</span>
                        </div>
                    </div>
                </div>

                {/* ════════════════════════════════════════════════════════════════ */}
                {/* 🔒 SECCIÓN 7: SISTEMAS INTERNOS                                */}
                {/* ════════════════════════════════════════════════════════════════ */}
                <div>
                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
                        <Lock size={13} className="text-red-400" /> SISTEMAS INTERNOS
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                        {managementPages.map((page, idx) => (
                            <div
                                key={idx}
                                role="button" tabIndex={0}
                                onClick={() => { playNeonClick(); navigate(page.path); }}
                                className="glass-card-neon p-4 rounded-2xl flex items-center justify-between group hover:border-red-400/40 active:scale-95 transition-all cursor-pointer"
                            >
                                <div className="flex flex-col items-start text-left flex-1 pointer-events-none">
                                    <h3 className="text-[11px] font-[1000] text-red-400 uppercase tracking-wider group-hover:text-red-300 transition-colors">{page.title}</h3>
                                    <p className="text-[8px] text-white/40 uppercase tracking-widest mt-0.5">{page.desc}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div 
                                        role="button" tabIndex={0}
                                        onClick={(e) => { e.stopPropagation(); handleCopy(page.path); }}
                                        className={`w-7 h-7 rounded-full flex items-center justify-center border transition-colors cursor-pointer ${copiedPath === page.path ? 'bg-green-500/20 border-green-500/40 text-green-400' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white'}`}
                                    >
                                        {copiedPath === page.path ? <Check size={12} /> : <Copy size={12} />}
                                    </div>
                                    <div className="w-7 h-7 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/30 text-red-400 group-hover:bg-red-500/30 transition-colors">
                                        <ExternalLink size={12} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* ════════════════════════════════════════════════════════════════ */}
            {/* 🏛️ MODAL OPERATIVO DE BÚNKER INSTITUCIONAL                     */}
            {/* ════════════════════════════════════════════════════════════════ */}
            {selectedInstBunker && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="neu-plate bg-zinc-950 border border-white/20 p-6 rounded-3xl max-w-lg w-full shadow-2xl relative space-y-4">
                        {/* Header Modal */}
                        <div className="flex items-start justify-between border-b border-white/10 pb-3">
                            <div className="flex items-center gap-3">
                                <span className="text-3xl">{selectedInstBunker.icon}</span>
                                <div>
                                    <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${selectedInstBunker.badgeColor}`}>
                                        {selectedInstBunker.agent} · Asignada
                                    </span>
                                    <h3 className="text-sm sm:text-base font-[1000] uppercase text-white tracking-wider mt-1">
                                        {selectedInstBunker.title}
                                    </h3>
                                </div>
                            </div>
                            <button 
                                onClick={() => { playNeonClick(); setSelectedInstBunker(null); setInstCopiedId(false); }}
                                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Contenido Operativo */}
                        <div className="space-y-3">
                            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                <span className="text-[8px] font-mono text-white/50 uppercase tracking-widest">Ubicación y Asignación</span>
                                <p className="text-[10px] font-bold text-white mt-0.5">{selectedInstBunker.location}</p>
                                <p className="text-[9px] text-amber-300/90 font-mono mt-0.5">{selectedInstBunker.role}</p>
                            </div>

                            <div>
                                <span className="text-[8.5px] font-mono text-white/60 uppercase tracking-widest">Infraestructura y Módulos:</span>
                                <div className="mt-1.5 space-y-1">
                                    {selectedInstBunker.features.map((feat: string, idx: number) => (
                                        <div key={idx} className="flex items-center gap-2 text-[9px] text-white/80 font-medium">
                                            <span className="text-amber-400">▹</span>
                                            <span>{feat}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* ID de Conversación y Obsidian */}
                            <div className="p-3 rounded-xl bg-black/50 border border-cyan-500/30 flex items-center justify-between">
                                <div>
                                    <span className="text-[7.5px] font-mono text-cyan-400 uppercase tracking-widest">Conversation ID (Antigravity):</span>
                                    <p className="text-[8.5px] font-mono text-white/90 truncate max-w-[220px] sm:max-w-[280px]">
                                        {selectedInstBunker.conversationId}
                                    </p>
                                </div>
                                <button
                                    onClick={async () => {
                                        playNeonClick();
                                        await navigator.clipboard.writeText(selectedInstBunker.conversationId);
                                        setInstCopiedId(true);
                                        setTimeout(() => setInstCopiedId(false), 2000);
                                    }}
                                    className="px-2.5 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-400/50 text-[8px] font-bold text-cyan-300 hover:bg-cyan-500/40 cursor-pointer transition-colors"
                                >
                                    {instCopiedId ? '¡Copiado!' : 'Copiar ID'}
                                </button>
                            </div>
                        </div>

                        {/* Enlaces de Producción en Vivo (si existen) */}
                        {selectedInstBunker.liveWebUrl && (
                            <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 space-y-2">
                                <span className="text-[8px] font-mono text-emerald-400 uppercase tracking-widest block">
                                    🟢 Ecosistema en Producción (Vercel & Supabase):
                                </span>
                                <div className="grid grid-cols-2 gap-2">
                                    <a
                                        href={selectedInstBunker.liveWebUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="py-2 px-3 rounded-xl bg-emerald-500 text-black font-[1000] text-[9.5px] uppercase tracking-wider hover:brightness-110 flex items-center justify-center gap-1.5 transition text-center"
                                    >
                                        <ExternalLink size={12} /> Web Pública
                                    </a>
                                    <a
                                        href={selectedInstBunker.bunkerWebUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="py-2 px-3 rounded-xl bg-slate-900 border border-emerald-500/50 text-emerald-300 font-[1000] text-[9.5px] uppercase tracking-wider hover:bg-emerald-950 flex items-center justify-center gap-1.5 transition text-center"
                                    >
                                        <Lock size={12} /> Búnker 5 Modos
                                    </a>
                                </div>
                                {selectedInstBunker.githubUrl && (
                                    <a
                                        href={selectedInstBunker.githubUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="py-1.5 px-3 rounded-xl bg-black/60 border border-slate-700 text-slate-300 font-mono text-[8.5px] hover:text-white flex items-center justify-center gap-1.5 transition text-center"
                                    >
                                        <Sparkles size={11} className="text-cyan-400" /> Repositorio GitHub (CI/CD)
                                    </a>
                                )}
                            </div>
                        )}

                        {/* Botones de Acción */}
                        <div className="pt-2 flex items-center gap-3">
                            <button
                                onClick={() => {
                                    playNeonClick();
                                    navigate(selectedInstBunker.path);
                                    setSelectedInstBunker(null);
                                }}
                                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-black font-[1000] uppercase text-[10px] tracking-widest hover:brightness-110 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
                            >
                                <ExternalLink size={14} />
                                <span>Ingresar al Búnker Zonal</span>
                            </button>
                            <button
                                onClick={() => { playNeonClick(); setSelectedInstBunker(null); }}
                                className="py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold uppercase text-[10px] tracking-widest transition-all cursor-pointer"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MasterPanelPage;
