import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Lock, ChevronLeft, Factory, Zap, Globe, ExternalLink,
    Check, Copy, Megaphone, MapPin, Palette, Terminal, ShieldAlert,
    Store, Users, ShoppingBag
} from 'lucide-react';
import { playNeonClick } from '../utils/audio';
import { DobermanBadge } from '../components/DobermanBadge';
import { subscribeToGlobalConfig, guardarComercio } from '../firebase';

const PROVINCES = [
    { id: 'buenos-aires', name: 'BUENOS AIRES',  emoji: '🏙️' },
    { id: 'cordoba',      name: 'CÓRDOBA',       emoji: '🏔️' },
    { id: 'santa-fe',     name: 'SANTA FE',      emoji: '🌾' },
    { id: 'mendoza',      name: 'MENDOZA',       emoji: '🍇' },
    { id: 'tucuman',      name: 'TUCUMÁN',       emoji: '🌿' },
    { id: 'entre-rios',   name: 'ENTRE RÍOS',   emoji: '🌊' },
    { id: 'misiones',     name: 'MISIONES',      emoji: '🌴' },
    { id: 'neuquen',      name: 'NEUQUÉN',       emoji: '⛽' },
];

const STATIC_TOWNS = [
    { id: 'ezeiza', name: 'Ezeiza', label: 'Ezeiza', icon: Globe, color: '#06b6d4', activeBg: 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.3)]', iconClass: 'text-cyan-400' },
    { id: 'esteban-echeverria', name: 'Esteban Echeverría', label: 'E. Echeverría', icon: Lock, color: '#3b82f6', activeBg: 'bg-blue-500/20 border-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.3)]', iconClass: 'text-blue-400' },
    { id: 'mina-clavero', name: 'Traslasierra', label: 'Traslasierra', icon: MapPin, color: '#10b981', activeBg: 'bg-emerald-500/20 border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)]', iconClass: 'text-emerald-400' }
];

const EnterpriseMasterBoardPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Query parameters
    const queryParams = new URLSearchParams(location.search);
    const provinciaParam = queryParams.get('provincia') || 'buenos-aires';
    const currentProvince = PROVINCES.find(p => p.id === provinciaParam) || PROVINCES[0];

    const [selectedTownId, setSelectedTownId] = useState<string>(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const prov = queryParams.get('provincia');
        if (prov === 'cordoba') return 'mina-clavero';
        return 'esteban-echeverria';
    });

    const [copiedPath, setCopiedPath] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');

    // Modo Camaleón: leer config de zona para identidad visual del panel
    const [zoneConfig, setZoneConfig] = useState<any>({ primaryColor: '#06b6d4', townName: '' });
    const [isSeeding, setIsSeeding] = useState(false);
    const [hasSeeded, setHasSeeded] = useState(false);

    useEffect(() => {
        const unsub = subscribeToGlobalConfig((cfg) => {
            if (cfg) setZoneConfig(cfg);
        }, selectedTownId);
        return () => unsub();
    }, [selectedTownId]);

    // Sync selectedTownId state with URL query param if changed externally
    useEffect(() => {
        if (provinciaParam === 'cordoba') {
            setSelectedTownId('mina-clavero');
        } else if (provinciaParam === 'buenos-aires') {
            setSelectedTownId(prev => (prev === 'ezeiza' || prev === 'esteban-echeverria') ? prev : 'esteban-echeverria');
        }
    }, [provinciaParam]);

    const formatTownName = (id: string) => {
        if (id === 'ezeiza') return 'Ezeiza';
        if (id === 'esteban-echeverria') return 'Esteban Echeverría';
        if (id === 'mina-clavero' || id === 'traslasierra') return 'Traslasierra';
        return id.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    const zoneName = zoneConfig?.townName || formatTownName(selectedTownId);

    const handleSelectTown = (townId: string) => {
        playNeonClick();
        setSelectedTownId(townId);
    };

    const handleCopy = (path: string) => {
        playNeonClick();
        const fullUrl = window.location.origin + path;
        navigator.clipboard.writeText(fullUrl);
        setCopiedPath(path);
        setTimeout(() => setCopiedPath(null), 2000);
    };

    // Filter static selector towns based on search term
    const filteredStaticTowns = useMemo(() => {
        if (!searchTerm.trim()) return STATIC_TOWNS;
        return STATIC_TOWNS.filter(town => 
            town.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            town.label.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm]);

    // Paleta Tech Neon B2B — Modo Camaleón
    const zoneColor = zoneConfig?.primaryColor || '#06b6d4';
    const primaryColor = '#06b6d4'; // Cyan industrial
    const secondaryColor = '#3b82f6'; // Azul Royal
    const bgColor = '#020617'; // Slate 950

    const hexToRgba = (hex: string, alpha: number) => {
        try {
            const cleanHex = hex.replace('#', '');
            const r = parseInt(cleanHex.slice(0, 2), 16) || 6;
            const g = parseInt(cleanHex.slice(2, 4), 16) || 182;
            const b = parseInt(cleanHex.slice(4, 6), 16) || 212;
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        } catch {
            return `rgba(6, 182, 212, ${alpha})`;
        }
    };

    // ═══════════════════════════════════════════════════════════
    // 🌱 SIEMBRA INDUSTRIAL B2B — Muestras Hiperrealistas
    // Genera 1 empresa de muestra por cada categoría industrial
    // ═══════════════════════════════════════════════════════════
    const seedB2BMuestrasHiperrealistas = async () => {
        const confirmed = window.confirm(
            `🌱🏭 SIEMBRA INDUSTRIAL B2B HIPERREALISTA\n\n¿Estás seguro de sembrar empresas industriales de muestra en la zona:\n\n"${zoneName}"?\n\nSe creará 1 empresa por cada una de las 21 categorías industriales.\nTodas se inyectarán con la marca "isSeed: true" y estado de incubación.`
        );
        if (!confirmed) return;

        setIsSeeding(true);
        try {
            playNeonClick();

            // Datos hiperrealistas para las 21 categorías industriales B2B
            const B2B_SEED_DATA: Record<string, { name: string; specialty: string; img: string; offerName: string; price: number }> = {
                'ent-alimentos': {
                    name: `Alimentos del Sur S.A.`,
                    specialty: 'Elaboración y distribución mayorista de productos alimenticios envasados, conservas y congelados para cadenas de supermercados y minimercados.',
                    img: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=500',
                    offerName: 'Caja x24 Conservas Premium',
                    price: 45000
                },
                'ent-bebidas': {
                    name: `Distribuidora de Bebidas ${zoneName}`,
                    specialty: 'Distribución mayorista de bebidas nacionales e importadas. Abastecimiento directo a restaurantes, cervecerías y comercios minoristas.',
                    img: 'https://images.unsplash.com/photo-1527960656366-ee2a5e98f661?w=500',
                    offerName: 'Pallet Gaseosas x120 unid.',
                    price: 85000
                },
                'ent-textil': {
                    name: `Textil Industrial Pampa`,
                    specialty: 'Fabricación de telas, hilados y corte de indumentaria a gran escala para marcas de moda y tiendas departamentales.',
                    img: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=500',
                    offerName: 'Rollo Tela Jersey 50m',
                    price: 120000
                },
                'ent-tecnologia': {
                    name: `TechImport Argentina`,
                    specialty: 'Importación directa de componentes electrónicos, celulares y accesorios tecnológicos. Distribución nacional a cadenas retail.',
                    img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500',
                    offerName: 'Lote Auriculares BT x50',
                    price: 250000
                },
                'ent-limpieza': {
                    name: `Higiene Total S.R.L.`,
                    specialty: 'Fabricación de productos de limpieza industrial y doméstica. Línea completa de detergentes, desinfectantes y artículos de higiene.',
                    img: 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=500',
                    offerName: 'Pack Lavandina Institucional x12',
                    price: 28000
                },
                'ent-construccion': {
                    name: `Corralón y Materiales del Sur`,
                    specialty: 'Venta mayorista de materiales de construcción: cemento, hierro, ladrillos, cal, arena y herramientas. Despacho a obra con flota propia.',
                    img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500',
                    offerName: 'Pallet Cemento x40 bolsas',
                    price: 180000
                },
                'ent-mayoristas': {
                    name: `Central Mayorista ${zoneName}`,
                    specialty: 'Distribución de productos de consumo masivo a comercios minoristas. Alimentos, bebidas, perfumería y bazar a precios directos de fábrica.',
                    img: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500',
                    offerName: 'Bolsón Surtido Almacén',
                    price: 95000
                },
                'ent-cosmeticos': {
                    name: `Belleza Industrial Argentina`,
                    specialty: 'Fabricación y fraccionamiento de cosméticos, cremas, shampoos y productos capilares para salones de belleza y perfumerías.',
                    img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500',
                    offerName: 'Kit Salón Capilar x20 prod.',
                    price: 65000
                },
                'ent-automotriz': {
                    name: `AutoPartes Nacional S.A.`,
                    specialty: 'Fabricación e importación de repuestos automotrices, autopartes y accesorios para talleres mecánicos y concesionarias.',
                    img: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=500',
                    offerName: 'Kit Pastillas de Freno x100',
                    price: 340000
                },
                'ent-electronica': {
                    name: `Electro Componentes Sur`,
                    specialty: 'Distribución mayorista de componentes electrónicos, circuitos, cables, conectores y herramientas de soldadura para fábricas y talleres.',
                    img: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=500',
                    offerName: 'Lote Cables HDMI x200',
                    price: 78000
                },
                'ent-muebles': {
                    name: `Fábrica de Muebles del Valle`,
                    specialty: 'Fabricación de muebles de madera y melamina para hogares, oficinas y locales comerciales. Diseño a medida y producción en serie.',
                    img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500',
                    offerName: 'Escritorio Oficina Premium',
                    price: 155000
                },
                'ent-packaging': {
                    name: `EnvaPack Industrial`,
                    specialty: 'Fabricación de envases plásticos, cajas de cartón corrugado, film stretch y soluciones de packaging para la industria alimenticia y logística.',
                    img: 'https://images.unsplash.com/photo-1589758438368-0ad531db3366?w=500',
                    offerName: 'Bobina Film Stretch x6',
                    price: 42000
                },
                'ent-salud': {
                    name: `Droguería del Centro`,
                    specialty: 'Distribución farmacéutica mayorista. Medicamentos, insumos médicos y productos de salud para farmacias y centros de atención.',
                    img: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=500',
                    offerName: 'Lote Descartables Médicos',
                    price: 125000
                },
                'ent-agro': {
                    name: `AgroInsumos Pampa`,
                    specialty: 'Provisión de semillas, fertilizantes, agroquímicos y maquinaria agrícola para productores rurales y cooperativas.',
                    img: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=500',
                    offerName: 'Pallet Fertilizante NPK x20',
                    price: 220000
                },
                'ent-calzado': {
                    name: `Calzados Industrial Sur`,
                    specialty: 'Fabricación de calzado deportivo, casual y de seguridad industrial. Producción en serie y marca blanca para cadenas de retail.',
                    img: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=500',
                    offerName: 'Lote Zapatillas x48 pares',
                    price: 480000
                },
                'ent-papeleria': {
                    name: `Papelera del Plata`,
                    specialty: 'Fabricación y distribución mayorista de papelería, útiles escolares, artículos de oficina y productos de librería.',
                    img: 'https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=500',
                    offerName: 'Pack Resmas A4 x100',
                    price: 95000
                },
                'ent-plasticos': {
                    name: `Plásticos del Sur S.A.`,
                    specialty: 'Fabricación de artículos plásticos descartables, contenedores, bolsas y productos de polietileno para industrias y comercios.',
                    img: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=500',
                    offerName: 'Bolsa Consorcio x1000 unid.',
                    price: 35000
                },
                'ent-metalurgica': {
                    name: `Metalúrgica Federal`,
                    specialty: 'Fabricación de estructuras metálicas, herrería industrial, corte y plegado de chapas. Provisión a constructoras y talleres.',
                    img: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=500',
                    offerName: 'Perfil de Hierro T x50',
                    price: 290000
                },
                'ent-quimica': {
                    name: `Química Industrial del Sur`,
                    specialty: 'Fabricación y distribución de insumos químicos, solventes, adhesivos y productos para industrias textiles, alimenticias y de la construcción.',
                    img: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=500',
                    offerName: 'Tambor Solvente Industrial 200L',
                    price: 185000
                },
                'ent-juguetes': {
                    name: `Juguetes Fantasía S.R.L.`,
                    specialty: 'Importación y distribución mayorista de juguetes, cotillón, artículos de fiesta y souvenirs para jugueterías y librerías.',
                    img: 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=500',
                    offerName: 'Pack Cotillón Fiesta x100',
                    price: 55000
                },
                'ent-mascotas-ind': {
                    name: `NutriPet Industrial`,
                    specialty: 'Fabricación de alimento balanceado premium para mascotas. Distribución a veterinarias, pet shops y cadenas especializadas.',
                    img: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=500',
                    offerName: 'Pallet Alimento Premium x40 bolsas',
                    price: 320000
                }
            };

            let totalEmpresas = 0;

            for (const [catSlug, catData] of Object.entries(B2B_SEED_DATA)) {
                const id = `ent-sample-${catSlug}-${selectedTownId}`;
                const slug = `ent-sample-${catSlug}-${selectedTownId}`;

                const enterpriseData = {
                    id,
                    slug,
                    name: catData.name,
                    category: catSlug,
                    specialty: catData.specialty,
                    entityType: 'enterprise',
                    reach: 'regional',
                    zone: zoneName,
                    address: `Parque Industrial ${zoneName}, Lote ${10 + totalEmpresas}, Argentina`,
                    phone: `11${5000 + Math.floor(Math.random() * 5000)}${1000 + Math.floor(Math.random() * 9000)}`,
                    image: catData.img,
                    bannerImage: catData.img,
                    description: `${catData.name} es una empresa industrial con base operativa en ${zoneName}. ${catData.specialty} Formamos parte de la Red ShopDigital Industrial B2B, conectando proveedores directamente con comerciantes y emprendedores.`,
                    mapUrl: `https://maps.google.com/maps?q=${encodeURIComponent(catData.name + ', ' + zoneName + ', Argentina')}&t=&z=15&ie=UTF8&iwloc=&output=embed`,
                    website: `https://shopdigital.tech/empresas/${slug}`,
                    isActive: true,
                    townId: selectedTownId,
                    verified: true,
                    visits: Math.floor(10 + Math.random() * 50),
                    subscribers: Math.floor(2 + Math.random() * 15),
                    schedule: 'Lun-Vie 8:00 - 17:00 · Sáb 8:00 - 12:00',
                    isSeed: true,
                    status: 'incubacion',
                    offers: [
                        {
                            id: `offer-ent-${catSlug}-${selectedTownId}`,
                            name: catData.offerName,
                            price: catData.price,
                            image: catData.img,
                            description: `Oferta mayorista exclusiva para comerciantes de la Red ShopDigital. Precio directo de fábrica con entrega programada.`
                        }
                    ]
                };

                await guardarComercio(enterpriseData, selectedTownId);
                totalEmpresas++;
            }

            setHasSeeded(true);
            alert(`🏭🌱 ¡Siembra Industrial B2B completada con éxito en ${zoneName}!\n\nSe crearon ${totalEmpresas} empresas industriales de muestra (una por cada categoría B2B).\n\nTodas marcadas con "isSeed: true" y en estado de incubación.`);
        } catch (error: any) {
            console.error('Error en la siembra industrial B2B:', error);
            alert(`❌ Error al sembrar muestras industriales: ${error.message || error}`);
        } finally {
            setIsSeeding(false);
        }
    };

    // ═══════════════════════════════════════════════════════════
    // ADN FRACTAL — Sistemas Internos (MOLDE IDÉNTICO AL B2C)
    // Solo: Reclutamiento Admin, Panel de Embajador, Suscripción de Comercio
    // ═══════════════════════════════════════════════════════════
    const managementPages = [
        { 
            title: 'RECLUTAMIENTO ADMIN', 
            desc: 'Aprobar o rechazar aspirantes a Embajadores', 
            path: `/${selectedTownId}/tablero-maestro/reclutamiento` 
        },
        { 
            title: 'PANEL DE EMBAJADOR', 
            desc: 'Autenticación para dar de alta comercios', 
            path: `/${selectedTownId}/embajador` 
        },
        { 
            title: 'SUSCRIPCIÓN DE COMERCIO', 
            desc: 'Formulario público para nuevos comerciantes', 
            path: `/${selectedTownId}/subscripcion` 
        },
    ];

    return (
        <div className="min-h-screen text-white pb-24 relative overflow-x-hidden selection:bg-cyan-500/30 master-panel-container" style={{ backgroundColor: bgColor }}>
            
            <style>{`
                @keyframes pulseGlow {
                    0%, 100% { filter: drop-shadow(0 0 15px ${hexToRgba(primaryColor, 0.4)}); }
                    50% { filter: drop-shadow(0 0 35px ${hexToRgba(primaryColor, 0.8)}); }
                }
                @keyframes scanline {
                    0% { transform: translateY(-100%); }
                    100% { transform: translateY(200%); }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-6px); }
                }
                .tech-grid-bg {
                    background-size: 30px 30px;
                    background-image: 
                        linear-gradient(to right, ${hexToRgba(secondaryColor, 0.04)} 1px, transparent 1px),
                        linear-gradient(to bottom, ${hexToRgba(secondaryColor, 0.04)} 1px, transparent 1px);
                }
                .glass-card-neon {
                    background: linear-gradient(145deg, rgba(255,255,255,0.02), rgba(0,0,0,0.4));
                    backdrop-filter: blur(12px);
                    border: 1px solid ${hexToRgba(primaryColor, 0.3)};
                    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
                }
                .glass-card-neon:hover {
                    box-shadow: 0 0 20px ${hexToRgba(primaryColor, 0.2)};
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

            {/* Background Tecnológico */}
            <div className="fixed inset-0 pointer-events-none z-0 tech-grid-bg">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-screen"></div>
                <div 
                    className="absolute top-0 right-0 w-[50vw] h-[50vw] rounded-full blur-[150px] opacity-20 mix-blend-screen"
                    style={{ backgroundColor: primaryColor }}
                />
                <div 
                    className="absolute bottom-0 left-0 w-[50vw] h-[50vw] rounded-full blur-[150px] opacity-20 mix-blend-screen"
                    style={{ backgroundColor: secondaryColor }}
                />
                <div className="absolute inset-0 w-full h-[10vh] opacity-5 pointer-events-none" 
                     style={{ background: `linear-gradient(to bottom, transparent, ${primaryColor}, transparent)`, animation: 'scanline 6s linear infinite' }} />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020617]/50 to-[#020617]/90"></div>
            </div>

            {/* ════════════════════════════════════════════════════════ */}
            {/* HEADER — PANEL MAESTRO INDUSTRIAL                      */}
            {/* ════════════════════════════════════════════════════════ */}
            <div 
                className="backdrop-blur-xl border-b pt-10 pb-6 px-6 relative z-10 sticky top-0 shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
                style={{ 
                    background: 'rgba(2, 6, 23, 0.85)',
                    borderBottomColor: hexToRgba(primaryColor, 0.3)
                }}
            >
                <div 
                    role="button" tabIndex={0} 
                    onClick={() => { playNeonClick(); navigate(`/empresas?provincia=${provinciaParam}`); }} 
                    className="absolute top-10 left-6 hover:opacity-70 cursor-pointer transition-transform hover:scale-110 active:scale-95" 
                    style={{ color: primaryColor }}
                >
                    <ChevronLeft size={24} />
                </div>
                <div className="flex flex-col items-center">
                    <Terminal size={36} className="mb-2" style={{ color: primaryColor, animation: 'pulseGlow 4s infinite alternate' }} />
                    <h1 className="text-2xl font-[1000] uppercase tracking-[0.25em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-cyan-400 to-blue-500 text-center drop-shadow-md">
                        PANEL MAESTRO INDUSTRIAL
                    </h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] mt-2 text-center text-cyan-400 flex items-center justify-center gap-1 opacity-80" style={{ textShadow: `0 0 10px ${hexToRgba(primaryColor, 0.5)}` }}>
                        PROVINCIA: {currentProvince.name} <span className="text-[12px]">{currentProvince.emoji}</span>
                    </p>
                    <div className="mt-3 drop-shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                        <DobermanBadge />
                    </div>
                    {/* Search Capsule */}
                    <div className="mt-5 w-full max-w-[280px] relative">
                        <input 
                            type="text" 
                            placeholder="🔍 BUSCAR LOCALIDAD..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#020617]/80 text-cyan-300 placeholder-cyan-500/40 border border-cyan-500/40 rounded-full py-2.5 px-4 text-[10px] font-bold text-center tracking-widest uppercase outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all backdrop-blur-md"
                        />
                    </div>
                </div>
            </div>

            <div className="px-6 mt-8 space-y-6 relative z-10 pb-20 max-w-lg mx-auto">
                
                {/* ════════════════════════════════════════════════════════ */}
                {/* 🧬 ADN FRACTAL — SELECTORES DE LOCALIDAD                */}
                {/* Respetamos la estructura del molde B2C                  */}
                {/* ════════════════════════════════════════════════════════ */}
                {filteredStaticTowns.length === 0 ? (
                    <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-2xl p-6 text-center animate-in fade-in duration-300">
                        <MapPin size={20} className="text-cyan-400 mx-auto mb-2 opacity-50" />
                        <p className="text-[11px] font-black text-cyan-400 uppercase tracking-wider">
                            No se encontraron localidades
                        </p>
                        <p className="text-[8px] text-white/50 uppercase tracking-widest mt-1">
                            Ajusta el filtro de búsqueda
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-2 animate-in fade-in slide-in-from-top-4 duration-1000">
                        {filteredStaticTowns.map((town) => {
                            const isSelected = town.id === selectedTownId;
                            const Icon = town.icon;
                            return (
                                <button 
                                    key={town.id}
                                    onClick={() => {
                                        playNeonClick();
                                        if (town.id === 'ezeiza') navigate('/ezeiza/home');
                                        else if (town.id === 'esteban-echeverria') navigate('/esteban-echeverria/home');
                                        else navigate('/region/traslasierra');
                                    }}
                                    className={`py-6 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2 group cursor-pointer ${isSelected ? town.activeBg : 'bg-zinc-900/50 border-white/10 opacity-75 hover:opacity-100 hover:border-cyan-500/35'}`}
                                >
                                    <Icon size={24} className={isSelected ? town.iconClass : 'text-white/60 group-hover:text-white transition-colors'} />
                                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isSelected ? 'text-white' : 'text-white/45 group-hover:text-white/85 transition-colors'}`}>
                                        {town.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                )}

                {selectedTownId && (
                    <div className="flex flex-col gap-4">

                        {/* ════════════════════════════════════════════════════════ */}
                        {/* 🛡️ BÚNKER CENTRAL DEL DIRECTOR - WALY                  */}
                        {/* (ADN Fractal: idéntico al molde B2C)                    */}
                        {/* ════════════════════════════════════════════════════════ */}
                        <div 
                            role="button" tabIndex={0}
                            onClick={() => { playNeonClick(); navigate(`/${selectedTownId}/bunker-waly`); }}
                            className="w-full glass-card-neon text-white p-5 rounded-2xl font-[1000] uppercase tracking-widest border border-violet-500/40 hover:border-violet-400 active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer shadow-[0_0_30px_rgba(139,92,246,0.2)] relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/0 via-white/5 to-violet-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                            <Zap size={18} className="text-violet-400" />
                            <span className="text-[13px] text-violet-300">BÚNKER CENTRAL DEL DIRECTOR - WALY</span>
                        </div>

                        {/* 🌱 SIEMBRA INDUSTRIAL B2B */}
                        <button
                            disabled={isSeeding || hasSeeded}
                            onClick={seedB2BMuestrasHiperrealistas}
                            className={`w-full glass-card-neon text-white p-5 rounded-2xl font-[1000] uppercase tracking-widest border transition-all flex items-center justify-center gap-3 cursor-pointer relative overflow-hidden group disabled:opacity-60 disabled:cursor-not-allowed
                                ${hasSeeded 
                                    ? 'border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.2)] bg-emerald-500/10' 
                                    : 'border-green-500/40 hover:border-green-400 shadow-[0_0_30px_rgba(34,197,94,0.2)]'
                                }`}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-white/5 to-green-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                            <Factory size={18} className={hasSeeded ? 'text-emerald-400' : 'text-green-400 animate-pulse'} />
                            <span className={hasSeeded ? 'text-[13px] text-emerald-300' : 'text-[13px] text-green-300'}>
                                {isSeeding ? '⏳ Sembrando Industrias...' : hasSeeded ? '✅ Muestras Industriales Pobladas' : '🌱 Sembrar Muestras Industriales B2B'}
                            </span>
                        </button>

                        {/* ════════════════════════════════════════════════════════ */}
                        {/* 🎨 DISEÑADOR DE INTERFAZ / SINFONÍA EDITOR             */}
                        {/* (ADN Fractal: idéntico al molde B2C)                    */}
                        {/* ════════════════════════════════════════════════════════ */}
                        <div 
                            role="button" tabIndex={0}
                            onClick={() => { playNeonClick(); navigate(`/empresas/configuracion?provincia=${provinciaParam}`); }} 
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

                        {/* ════════════════════════════════════════════════════════ */}
                        {/* 🏭 NODO EMPRESARIAL B2B                                */}
                        {/* (ADN Fractal: idéntico al molde B2C)                    */}
                        {/* ════════════════════════════════════════════════════════ */}
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



                        {/* ════════════════════════════════════════════════════════ */}
                        {/* 📢 MARKETING INTELIGENTE                               */}
                        {/* (ADN Fractal: idéntico al molde B2C)                    */}
                        {/* ════════════════════════════════════════════════════════ */}
                        <div 
                            role="button" tabIndex={0}
                            onClick={() => { playNeonClick(); navigate(`/${selectedTownId}/marketing-inteligente`); }} 
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
                        {/* ADN Fractal: idéntico al molde B2C         */}
                        {/* ═══════════════════════════════════════════ */}
                        <section className="mt-8">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
                                <Terminal size={12} /> Térmicas de Gestión Autónoma
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* 🟡 GESTOR DE COMERCIOS */}
                                <div 
                                    role="button" tabIndex={0}
                                    onClick={() => { playNeonClick(); navigate(`/${selectedTownId}/embajador/gestion`); }} 
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
                                    onClick={() => { playNeonClick(); navigate(`/${selectedTownId}/embajador/clientes`); }} 
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
                                    onClick={() => { playNeonClick(); navigate(`/${selectedTownId}/embajador/empresas`); }} 
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
                                    onClick={() => { playNeonClick(); navigate(`/${selectedTownId}/embajador/facturacion`); }} 
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

                        {/* ═══════════════════════════════════════════ */}
                        {/* 🔒 SISTEMAS INTERNOS                       */}
                        {/* ADN Fractal: idéntico al molde B2C         */}
                        {/* Solo: Reclutamiento, Embajador, Suscripción*/}
                        {/* ═══════════════════════════════════════════ */}
                        <section className="mt-8">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
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
                        {/* 📡 ACCESO AL CENTRO DE TRANSMISIÓN         */}
                        {/* ADN Fractal: idéntico al molde B2C         */}
                        {/* ═══════════════════════════════════════════ */}
                        <button 
                            onClick={() => { playNeonClick(); navigate(`/${selectedTownId}/director/transmision-en-vivo`); }}
                            className="w-full mt-6 py-5 rounded-3xl text-white font-[1000] uppercase tracking-[0.2em] text-[13px] flex items-center justify-center gap-3 relative overflow-hidden group cursor-pointer active:scale-95 transition-all glass-card-neon border-2 hover:bg-zinc-800/80"
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
                )}
            </div>

            {/* Footer console */}
            <footer className="w-full flex flex-col items-center gap-2 pt-10 pb-6 mt-6 relative z-10 opacity-60">
                <p className="text-[8px] font-black text-cyan-200/50 uppercase tracking-[0.35em] text-center select-none">
                    SHOPDIGITAL NETWORKS © 2026
                </p>
                <p className="text-[7.5px] font-black text-blue-400/50 uppercase tracking-[0.25em] select-none">
                    PANEL MAESTRO INDUSTRIAL · CONTROL B2B
                </p>
            </footer>
        </div>
    );
};

export default EnterpriseMasterBoardPage;
