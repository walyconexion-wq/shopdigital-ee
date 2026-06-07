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
    guardarBroadcast, obtenerBroadcasts, eliminarBroadcast, toggleBroadcast, Broadcast,
    guardarCliente, saveTown
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
    const [isSeeding, setIsSeeding] = useState(false);
    const [hasSeeded, setHasSeeded] = useState(false);
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

    const seedMuestrasHiperrealistas = async () => {
        const confirmed = window.confirm(
            `🌱 SIEMBRA HIPERREALISTA DE MUESTRAS (V2)\n\n¿Estás seguro de sembrar comercios, clientes e industrias de muestra en la zona:\n\n"${zoneName}"?\n\nEsto creará un comercio por cada rubro activo en cada localidad de la zona. Se inyectará con la marca "isSeed: true" y el estado de incubación.`
        );
        if (!confirmed) return;

        setIsSeeding(true);
        try {
            playNeonClick();
            
            // ─── Asegurar que el documento del Town existe en Firebase ────────
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
                name: formatTownName(townId),
                localities: ['Centro'],
                description: `Localidad autónoma de ${formatTownName(townId)}`
            };

            // Escribir/Actualizar el Town en Firestore para asegurar sintonía absoluta
            await saveTown({
                id: townId,
                name: townMeta.name,
                localities: townMeta.localities,
                description: townMeta.description,
                isActive: true,
                createdAt: new Date().toISOString()
            });

            const baseLocs = townMeta.localities;

            // ─── Definir rubros sembrables (24 rubros estándar) ───────────
            const seedCategoriesData: Record<string, { name: string; names: string[]; img: string; offerName: string; price: number }> = {
                pizzerias: { name: "Pizzería", names: ["Don Carlos", "El Tano", "Napolitana"], img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500", offerName: "Pizza Grande Especial", price: 6500 },
                restaurantes: { name: "Bodegón", names: ["Lo de Charly", "Don Miguel", "El Boliche"], img: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500", offerName: "Milanesa Completa con Fritas", price: 8500 },
                fastfood: { name: "Burger Club", names: ["Doble Queso", "La Estación", "Fast Bite"], img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500", offerName: "Combo Hamburguesa Clásica", price: 5400 },
                beer: { name: "Cervecería", names: ["Temple", "Growler Garage", "Refugio"], img: "https://images.unsplash.com/photo-1532635241-17e820add50f?w=500", offerName: "Pinta de Artesanal + Papas", price: 4200 },
                icecream: { name: "Heladería", names: ["Freddo", "Cremolatti", "Vía Cosenza"], img: "https://images.unsplash.com/photo-1567206563066-0480d07addb6?w=500", offerName: "1 Kilo de Helado Premium", price: 9500 },
                gastro: { name: "Rotisería", names: ["La Abuela", "Sabores Caseros", "Viandas Fit"], img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500", offerName: "Pollo al Horno con Papas", price: 7200 },
                markets: { name: "Mercado", names: ["El Sol", "Las Acacias", "Almacén Central"], img: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500", offerName: "Bolson de Verduras de Estación", price: 4800 },
                fashion: { name: "Boutique", names: ["Elegance", "Milán Style", "Urbano Look"], img: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500", offerName: "Remera Algodón Estampada", price: 12000 },
                tech: { name: "Waly Tech", names: ["Ciber Conexión", "Matriz Celulares", "Tecno Sur"], img: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=500", offerName: "Cargador Rápido Tipo C", price: 8900 },
                home: { name: "Deco Hogar", names: ["Muebles del Sur", "Bazar Express", "Luz y Diseño"], img: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=500", offerName: "Juego de Sábanas 2 Plazas", price: 18500 },
                barber: { name: "Barbería", names: ["The King", "Corte Táctico", "Barber Style"], img: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=500", offerName: "Corte de Cabello + Perfilado", price: 4500 },
                hair: { name: "Peluquería", names: ["Estela Unisex", "Glamour Salón", "Coiffeur Claudio"], img: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=500", offerName: "Lavado y Nutrición Intensa", price: 6500 },
                gym: { name: "Gimnasio", names: ["Iron Gym", "Fuerza y Salud", "Crossfit Box"], img: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500", offerName: "Pase Libre Mensual", price: 15000 },
                hardware: { name: "Ferretería", names: ["El Tornillo", "Bulonera Central", "Industrial Sur"], img: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500", offerName: "Caja de Herramientas Completa", price: 35000 },
                pets: { name: "Veterinaria", names: ["San Roque", "Mascotas Felices", "Pet Shop"], img: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=500", offerName: "Alimento Perro Premium 15kg", price: 28000 },
                tattoo: { name: "Neon Art", names: ["Tattoo Studio", "Tinta Roja", "Skin Art"], img: "https://images.unsplash.com/photo-1590247813693-5541d1c609fd?w=500", offerName: "Sesión de Tatuaje de 2 Horas", price: 40000 },
                beauty: { name: "Estética", names: ["Bella Donna", "Lotus Centro", "Spa Relajación"], img: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500", offerName: "Limpieza de Cutis Profunda", price: 8000 },
                inmo: { name: "Inmobiliaria", names: ["Santamarina", "Propiedades Sur", "Matriz Prop"], img: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=500", offerName: "Tasación de Propiedad Sin Cargo", price: 0 },
                auto: { name: "Lubricentro", names: ["Silva Express", "Repuestos MG", "Taller Mecánico"], img: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=500", offerName: "Cambio de Filtro y Aceite", price: 22000 },
                gifts: { name: "Regalería", names: ["Con Amor", "Sorpresas y Más", "Gifts Shop"], img: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500", offerName: "Peluche de Muestra + Tarjeta", price: 7500 },
                finance: { name: "CrediSur", names: ["Finanzas Express", "Créditos Central", "Socio Financiero"], img: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=500", offerName: "Asesoramiento Financiero", price: 0 },
                servicios: { name: "Estudio", names: ["Pérez Contable", "Asociados Abogados", "PC Soporte"], img: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=500", offerName: "Consulta Inicial Profesional", price: 5000 },
                automotormotos: { name: "Motos", names: ["Dos Ruedas", "El Rayo", "Motos Central"], img: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=500", offerName: "Service Completo de Moto", price: 16000 },
                farmacias: { name: "Farmacia", names: ["Central", "Del Pueblo", "Social Sur"], img: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=500", offerName: "Medidor de Presión Digital", price: 14500 }
            };

            // ─── Definir rubros específicos de Traslasierra (Matriz Turística) ─
            const traslasierraCategoriesData: Record<string, { name: string; names: string[]; img: string; offerName: string; price: number }> = {
                hospedaje: { name: "Cabañas", names: ["Altas Sierras", "Del Sol", "Senderos"], img: "https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=500", offerName: "Estadía Mínima 3 Noches", price: 25000 },
                entretenimiento: { name: "Entretenimiento", names: ["Casino", "Teatro El Tala", "Pub Central"], img: "https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=500", offerName: "Entrada + Trago de Bienvenida", price: 3500 },
                excursiones: { name: "Excursiones", names: ["Champaquí Aventura", "Trekking Serrano", "Senderos del Valle"], img: "https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=500", offerName: "Trekking Guiado de Medio Día", price: 12000 },
                vinos_regionales: { name: "Bodega", names: ["Noble San Javier", "Viñedos del Valle", "La Caroyense"], img: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=500", offerName: "Caja de Vinos Malbec Blend", price: 18000 },
                chocolaterias: { name: "Chocolatería", names: ["El Tala", "Sabores Serranos", "Alfajores Brochero"], img: "https://images.unsplash.com/photo-1511381939415-e44015466834?w=500", offerName: "Caja de Alfajores Artesanales x12", price: 7200 },
                taxis_transporte: { name: "Traslados", names: ["Altas Cumbres", "Remís del Valle", "Servicio Express"], img: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=500", offerName: "Viaje Programado Interurbano", price: 9500 }
            };

            const activeCategoriesData = {
                ...seedCategoriesData,
                ...(isTraslasierra ? traslasierraCategoriesData : {})
            };

            // Mapas específicos de Esteban Echeverría para conservar fidelidad original
            const EE_MAPS: Record<string, string> = {
                "monte-grande": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3274.6547638367746!2d-58.468205423450914!3d-34.82728286950269!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bcd1625fe9f8b9%3A0xe54ef864fb8c1d56!2sMonte%20Grande%2C%20Provincia%20de%20Buenos%20Aires!5e0!3m2!1ses!4far!4v1716800000000!5m2!1ses!4far",
                "luis-guillon": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3275.29548325692!2d-58.4552485!3d-34.8112345!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bcd1a23fe9f8b9%3A0xe54ef864fb8c1d56!2sLuis%20Guill%C3%B3n%2C%20Provincia%20de%20Buenos%20Aires!5e0!3m2!1ses!4far!4v1716800000000!5m2!1ses!4far",
                "el-jaguel": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3273.829548325692!2d-58.4852485!3d-34.8452345!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bcd1c23fe9f8b9%3A0xe54ef864fb8c1d56!2sEl%20Jag%C3%BCel%2C%20Provincia%20de%20Buenos%20Aires!5e0!3m2!1ses!4far!4v1716800000000!5m2!1ses!4far"
            };

            const EZEIZA_MAPS: Record<string, string> = {
                "ezeiza": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3271.8679183!2d-58.52554!3d-34.85124!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bcd1d0efb!2sEzeiza!5e0",
                "la-union": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3271!2d-58.55!3d-34.86!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1",
                "tristan-suarez": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3270!2d-58.57!3d-34.88!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1"
            };

            let totalComercios = 0;

            for (const [catKey, catVal] of Object.entries(activeCategoriesData)) {
                for (let i = 0; i < baseLocs.length; i++) {
                    const locName = baseLocs[i];
                    const locSlug = locName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-');
                    
                    const businessName = `${catVal.name} ${catVal.names[i % catVal.names.length]}`;
                    const id = `shop-sample-${catKey}-${locSlug}-${townId}`;
                    const slug = `sample-${catKey}-${locSlug}-${townId}`;

                    let mapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(businessName + ", " + locName + ", Argentina")}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
                    if (townId === 'esteban-echeverria' && EE_MAPS[locSlug]) {
                        mapUrl = EE_MAPS[locSlug];
                    } else if (townId === 'ezeiza' && EZEIZA_MAPS[locSlug]) {
                        mapUrl = EZEIZA_MAPS[locSlug];
                    }

                    const shopData = {
                        id,
                        slug,
                        name: businessName,
                        category: catKey,
                        specialty: `Especialistas en ${catVal.name.toLowerCase()} de primer nivel para toda la comunidad de ${locName}.`,
                        entityType: 'merchant',
                        zone: locName,
                        address: `Calle Ficticia ${100 + i * 15}, ${locName}, Argentina`,
                        phone: "1152668273",
                        ownerName: `Propietario ${catVal.names[i % catVal.names.length]}`,
                        image: catVal.img,
                        bannerImage: catVal.img,
                        description: `Te damos la bienvenida a ${businessName}. Ofrecemos una experiencia excelente en ${catVal.name.toLowerCase()} con atención personalizada, los mejores insumos del mercado y beneficios exclusivos para socios VIP de la Red ShopDigital. Visitanos y conocé nuestras propuestas.`,
                        mapUrl: mapUrl,
                        website: `https://shopdigital.tech/${slug}`,
                        instagram: `https://instagram.com/${slug}`,
                        facebook: `https://facebook.com/${slug}`,
                        tiktok: "",
                        rating: parseFloat((4.2 + Math.random() * 0.7).toFixed(1)),
                        isActive: true,
                        townId: townId,
                        verified: true,
                        visits: Math.floor(20 + Math.random() * 80),
                        subscribers: Math.floor(5 + Math.random() * 30),
                        schedule: 'Lun-Sáb 9:00 - 20:00 · Dom Cerrado',
                        isSeed: true,
                        status: 'incubacion',
                        offers: [
                            {
                                id: `offer-sample-${catKey}-${locSlug}-1-${townId}`,
                                name: catVal.offerName,
                                price: catVal.price,
                                image: catVal.img,
                                description: `Descuento exclusivo de demostración. Presentá tu credencial VIP y obtené este beneficio.`
                            }
                        ]
                    };

                    await guardarComercio(shopData, townId);
                    totalComercios++;
                }
            }

            // 2. Inyectar Cliente VIP Cero
            const clientZero = {
                id: `cli-socio-cero-${townId}`,
                name: "Juan Pérez",
                email: `juan.perez.${townId}@test.com`,
                vipCode: "0001",
                townId: townId,
                status: "active",
                createdAt: new Date().toISOString(),
                vipStatus: "active",
                role: "client-vip",
                balance: 1000,
                isSeed: true
            };
            await guardarCliente(clientZero, townId);

            // 3. Inyectar Industrias B2B (Muestras adaptables)
            const b2bLoc1 = baseLocs[0] || 'Centro';
            const b2bLoc2 = baseLocs[1] || b2bLoc1;

            const B2B_INDUSTRIES = [
                {
                    id: `ent-bebidas-${townId}-sample`,
                    slug: `bebidas-${townId}-sample`,
                    name: `Distribuidora de Bebidas ${zoneName} S.A.`,
                    category: 'ent-alimentos',
                    specialty: 'Distribución mayorista de bebidas nacionales e importadas. Abastecimiento de restaurantes, cervecerías y comercios.',
                    entityType: 'enterprise',
                    reach: 'regional',
                    zone: b2bLoc1,
                    address: `Av. Principal 1200, ${b2bLoc1}, Argentina`,
                    phone: '1158291032',
                    image: 'https://images.unsplash.com/photo-1527960656366-ee2a5e98f661?w=500',
                    bannerImage: 'https://images.unsplash.com/photo-1527960656366-ee2a5e98f661?w=500',
                    description: 'Distribuidora mayorista dedicada al abastecimiento de bebidas alcohólicas y analcohólicas en toda la zona. Precios directos y entregas programadas.',
                    isActive: true,
                    townId: townId,
                    offers: [],
                    isSeed: true,
                    status: 'incubacion'
                },
                {
                    id: `ent-panificadora-${townId}-sample`,
                    slug: `panificadora-${townId}-sample`,
                    name: `Panificadora Industrial ${b2bLoc2}`,
                    category: 'ent-alimentos',
                    specialty: 'Elaboración industrial de pan lactal, pan de hamburguesas y panchos para locales gastronómicos y mercados.',
                    entityType: 'enterprise',
                    reach: 'regional',
                    zone: b2bLoc2,
                    address: `Ruta Nacional Km 23.5, ${b2bLoc2}, Argentina`,
                    phone: '1149204921',
                    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500',
                    bannerImage: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500',
                    description: 'Fábrica e insumos de panadería para todo el canal gastronómico. Despacho diario con flota propia.',
                    isActive: true,
                    townId: townId,
                    offers: [],
                    isSeed: true,
                    status: 'incubacion'
                }
            ];

            for (const ind of B2B_INDUSTRIES) {
                await guardarComercio(ind, townId);
            }

            setHasSeeded(true);
            alert(`🌱 ¡Muestras sembradas con éxito en ${zoneName}!\n\nSe crearon ${totalComercios} comercios (uno por rubro por localidad), 1 Socio VIP y 2 industrias B2B de muestra.`);
        } catch (error: any) {
            console.error("Error en la siembra:", error);
            alert(`❌ Error al sembrar muestras: ${error.message || error}`);
        } finally {
            setIsSeeding(false);
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
        <div className="min-h-screen bg-[#020617] text-white pb-24 relative overflow-x-hidden selection:bg-cyan-500/30 master-panel-container">
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
                /* Protege el panel hacker oscuro de que las reglas de modo día inviertan y arruinen los colores de texto */
                .day-mode .master-panel-container .text-white {
                    color: #ffffff !important;
                }
                .day-mode .master-panel-container .text-white\/90 {
                    color: rgba(255, 255, 255, 0.9) !important;
                }
                .day-mode .master-panel-container .text-white\/80 {
                    color: rgba(255, 255, 255, 0.8) !important;
                }
                .day-mode .master-panel-container .text-white\/70 {
                    color: rgba(255, 255, 255, 0.7) !important;
                }
                .day-mode .master-panel-container .text-white\/60 {
                    color: rgba(255, 255, 255, 0.6) !important;
                }
                .day-mode .master-panel-container .text-white\/50 {
                    color: rgba(255, 255, 255, 0.5) !important;
                }
                .day-mode .master-panel-container .text-white\/45 {
                    color: rgba(255, 255, 255, 0.45) !important;
                }
                .day-mode .master-panel-container .text-white\/40 {
                    color: rgba(255, 255, 255, 0.4) !important;
                }
                .day-mode .master-panel-container .text-white\/30 {
                    color: rgba(255, 255, 255, 0.3) !important;
                }
                .day-mode .master-panel-container .text-white\/20 {
                    color: rgba(255, 255, 255, 0.2) !important;
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
                
                {/* 🛡️ BÚNKERS DE CONTROL COMPARTIMENTADO (NIVEL OMEGA) */}
                <div className="border border-white/10 rounded-[2rem] p-6 bg-black/45 backdrop-blur-md space-y-4 shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 border-b border-white/10 pb-2 mb-2 flex items-center gap-2">
                        <Lock size={12} className="text-white/40 animate-pulse" /> BÚNKERS DE CONTROL COMPARTIMENTADO
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                        <div 
                            role="button" tabIndex={0}
                            onClick={() => { playNeonClick(); navigate(`/${townId}/bunker-waly`); }}
                            className="w-full p-4 rounded-xl font-bold uppercase tracking-wider border border-violet-500/40 hover:border-violet-400 active:scale-95 transition-all flex items-center justify-between cursor-pointer shadow-[0_0_15px_rgba(139,92,246,0.1)] hover:bg-violet-900/10"
                        >
                            <span className="text-[11px] text-violet-300">🏛️ BÚNKER DIRECCIÓN GENERAL (WALY)</span>
                            <span className="text-[9px] text-violet-400 px-2 py-0.5 bg-violet-500/10 rounded-md border border-violet-500/20">Omega</span>
                        </div>

                        <div 
                            role="button" tabIndex={0}
                            onClick={() => { playNeonClick(); navigate(`/${townId}/bunker/administracion`); }}
                            className="w-full p-4 rounded-xl font-bold uppercase tracking-wider border border-amber-500/40 hover:border-amber-400 active:scale-95 transition-all flex items-center justify-between cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.1)] hover:bg-amber-900/10"
                        >
                            <span className="text-[11px] text-amber-300">💼 BÚNKER GESTIÓN ADMINISTRATIVA</span>
                            <span className="text-[9px] text-amber-400 px-2 py-0.5 bg-amber-500/10 rounded-md border border-amber-500/20">Administración</span>
                        </div>

                        <div 
                            role="button" tabIndex={0}
                            onClick={() => { playNeonClick(); navigate(`/${townId}/bunker/contable-legales`); }}
                            className="w-full p-4 rounded-xl font-bold uppercase tracking-wider border border-red-500/40 hover:border-red-400 active:scale-95 transition-all flex items-center justify-between cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.1)] hover:bg-red-900/10"
                        >
                            <span className="text-[11px] text-red-300">⚖️ BÚNKER CONTABLE Y LEGALES</span>
                            <span className="text-[9px] text-red-400 px-2 py-0.5 bg-red-500/10 rounded-md border border-red-500/20">Contaduría</span>
                        </div>

                        <div 
                            role="button" tabIndex={0}
                            onClick={() => { playNeonClick(); navigate(`/${townId}/bunker/marketing`); }}
                            className="w-full p-4 rounded-xl font-bold uppercase tracking-wider border border-emerald-500/40 hover:border-emerald-400 active:scale-95 transition-all flex items-center justify-between cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.1)] hover:bg-emerald-900/10"
                        >
                            <span className="text-[11px] text-emerald-300">📢 BÚNKER MARKETING Y EXPANSIÓN</span>
                            <span className="text-[9px] text-emerald-400 px-2 py-0.5 bg-emerald-500/10 rounded-md border border-emerald-500/20">Marketing</span>
                        </div>

                        <div 
                            role="button" tabIndex={0}
                            onClick={() => { playNeonClick(); navigate(`/${townId}/bunker/recursos-humanos`); }}
                            className="w-full p-4 rounded-xl font-bold uppercase tracking-wider border border-cyan-500/40 hover:border-cyan-400 active:scale-95 transition-all flex items-center justify-between cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.1)] hover:bg-cyan-900/10"
                        >
                            <span className="text-[11px] text-cyan-300">👥 BÚNKER RECURSOS HUMANOS</span>
                            <span className="text-[9px] text-cyan-400 px-2 py-0.5 bg-cyan-500/10 rounded-md border border-cyan-500/20">Personal</span>
                        </div>

                        <div 
                            role="button" tabIndex={0}
                            onClick={() => { playNeonClick(); navigate(`/${townId}/bunker/sistemas`); }}
                            className="w-full p-4 rounded-xl font-bold uppercase tracking-wider border border-indigo-500/40 hover:border-indigo-400 active:scale-95 transition-all flex items-center justify-between cursor-pointer shadow-[0_0_15px_rgba(99,102,241,0.1)] hover:bg-indigo-900/10"
                        >
                            <span className="text-[11px] text-indigo-300">💻 BÚNKER SISTEMAS E INFRAESTRUCTURA</span>
                            <span className="text-[9px] text-indigo-400 px-2 py-0.5 bg-indigo-500/10 rounded-md border border-indigo-500/20">IT / Dev</span>
                        </div>

                        <div 
                            role="button" tabIndex={0}
                            onClick={() => { playNeonClick(); navigate(`/${townId}/bunker/secops`); }}
                            className="w-full p-4 rounded-xl font-bold uppercase tracking-wider border border-emerald-500/40 hover:border-emerald-400 active:scale-95 transition-all flex items-center justify-between cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.15)] hover:bg-emerald-900/10"
                        >
                            <span className="text-[11px] text-emerald-300">🛡️ BÚNKER CIBERSEGURIDAD Y SECOPS</span>
                            <span className="text-[9px] text-emerald-400 px-2 py-0.5 bg-emerald-500/10 rounded-md border border-emerald-500/20">SEGURIDAD / IT</span>
                        </div>

                        <div 
                            role="button" tabIndex={0}
                            onClick={() => { playNeonClick(); navigate(`/${townId}/bunker/planificacion-desarrollo`); }}
                            className="w-full p-4 rounded-xl font-bold uppercase tracking-wider border border-blue-500/40 hover:border-blue-400 active:scale-95 transition-all flex items-center justify-between cursor-pointer shadow-[0_0_15px_rgba(59,130,246,0.1)] hover:bg-blue-900/10"
                        >
                            <span className="text-[11px] text-blue-300">🗺️ BÚNKER PLANIFICACIÓN Y DESARROLLO</span>
                            <span className="text-[9px] text-blue-400 px-2 py-0.5 bg-blue-500/10 rounded-md border border-blue-500/20">Estrategia</span>
                        </div>

                        <div 
                            role="button" tabIndex={0}
                            onClick={() => { playNeonClick(); navigate(`/${townId}/bunker/inversion-exponencial`); }}
                            className="w-full p-4 rounded-xl font-bold uppercase tracking-wider border border-yellow-500/40 hover:border-yellow-400 active:scale-95 transition-all flex items-center justify-between cursor-pointer shadow-[0_0_15px_rgba(234,179,8,0.1)] hover:bg-yellow-900/10"
                        >
                            <span className="text-[11px] text-yellow-300">📈 BÚNKER INVERSIÓN EXPONENCIAL</span>
                            <span className="text-[9px] text-yellow-400 px-2 py-0.5 bg-yellow-500/10 rounded-md border border-yellow-500/20">Finanzas</span>
                        </div>

                        <div 
                            role="button" tabIndex={0}
                            onClick={() => { playNeonClick(); navigate(`/${townId}/bunker/mantenimiento`); }}
                            className="w-full p-4 rounded-xl font-bold uppercase tracking-wider border border-slate-500/40 hover:border-slate-400 active:scale-95 transition-all flex items-center justify-between cursor-pointer shadow-[0_0_15px_rgba(100,116,139,0.1)] hover:bg-slate-900/10"
                        >
                            <span className="text-[11px] text-slate-300">🔧 BÚNKER MANTENIMIENTO GENERAL</span>
                            <span className="text-[9px] text-slate-400 px-2 py-0.5 bg-slate-500/10 rounded-md border border-slate-500/20">Soporte</span>
                        </div>
                    </div>
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
                <button
                    disabled={isSeeding || hasSeeded}
                    onClick={seedMuestrasHiperrealistas}
                    className={`w-full glass-card-neon text-white p-5 rounded-2xl font-[1000] uppercase tracking-widest border transition-all flex items-center justify-center gap-3 cursor-pointer relative overflow-hidden group disabled:opacity-60 disabled:cursor-not-allowed
                        ${hasSeeded 
                            ? 'border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.2)] bg-emerald-500/10' 
                            : 'border-green-500/40 hover:border-green-400 shadow-[0_0_30px_rgba(34,197,94,0.2)]'
                        }`}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-white/5 to-green-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                    <Database size={18} className={hasSeeded ? 'text-emerald-400' : 'text-green-400 animate-pulse'} />
                    <span className={hasSeeded ? 'text-[13px] text-emerald-300' : 'text-[13px] text-green-300'}>
                        {isSeeding ? '⏳ Sembrando Ecosistema...' : hasSeeded ? '✅ Ecosistema Poblado' : '🌱 Sembrar Muestras Hiperrealistas'}
                    </span>
                </button>

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
                    className="w-full glass-card-neon text-white p-6 rounded-3xl font-[1000] uppercase tracking-widest border-2 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer group hover:bg-zinc-800/80 active:scale-98"
                    style={{ 
                        borderColor: zoneColor,
                        boxShadow: `0 0 20px ${hexToRgba(zoneColor, 0.4)}, inset 0 0 12px ${hexToRgba(zoneColor, 0.25)}`,
                        background: 'linear-gradient(145deg, rgba(255,255,255,0.03), rgba(0,0,0,0.65))'
                    }}
                >
                    <div className="flex items-center gap-3 pointer-events-none">
                        <Palette size={22} style={{ color: zoneColor, filter: `drop-shadow(0 0 8px ${zoneColor})` }} className="animate-pulse" />
                        <span className="text-[14px]" style={{ color: '#ffffff', textShadow: `0 0 10px ${hexToRgba(zoneColor, 0.6)}` }}>
                            DISEÑADOR DE INTERFAZ / SINFONÍA EDITOR
                        </span>
                    </div>
                    <span className="text-[8.5px] uppercase tracking-[0.3em]" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        Control visual total · Colores · Temas · Identidad
                    </span>
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
                    className="w-full mt-8 py-5 rounded-3xl text-white font-[1000] uppercase tracking-[0.2em] text-[13px] flex items-center justify-center gap-3 relative overflow-hidden group cursor-pointer active:scale-95 transition-all glass-card-neon border-2 hover:bg-zinc-800/80"
                    style={{
                        borderColor: '#ef4444',
                        boxShadow: '0 0 25px rgba(239, 68, 68, 0.4), inset 0 0 12px rgba(239, 68, 68, 0.2)',
                        background: 'linear-gradient(145deg, rgba(239, 68, 68, 0.05), rgba(0, 0, 0, 0.75))'
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    
                    <div className="relative flex items-center justify-center w-3 h-3 mr-1">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                    </div>
                    
                    <Megaphone size={20} className="text-red-500" style={{ filter: 'drop-shadow(0 0 8px #ef4444)' }} />
                    <span className="font-[1000]" style={{ color: '#ffffff', textShadow: '0 0 12px rgba(239, 68, 68, 0.8)' }}>
                        Entrar al Centro de Transmisión en Vivo
                    </span>
                </button>
            </div>
        </div>
    );
};

export default MasterPanelPage;
