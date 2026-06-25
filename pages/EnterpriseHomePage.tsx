import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ENTERPRISE_CATEGORIES } from '../enterpriseConstants';
import { Factory, ChevronLeft, Share2, MapPin, ShieldCheck, Zap } from 'lucide-react';
import { playNeonClick } from '../utils/audio';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, incrementarVisitasZona, registrarVisitaConTelemetria } from '../firebase';
import { useLanguage } from '../components/LanguageContext';

interface EnterpriseHomePageProps {
    globalConfig?: any;
}

const PROVINCES = [
    { id: 'buenos-aires', name: 'BUENOS AIRES',  emoji: '🏙️' },
    { id: 'cordoba',      name: 'CÓRDOBA',       emoji: '🏔️' },
    { id: 'santa-fe',     name: 'SANTA FE',      emoji: '🌾' },
    { id: 'mendoza',      name: 'MENDOZA',       emoji: '🍇' },
    { id: 'tucuman',      name: 'TUCUMÁN',       emoji: '🌿' },
    { id: 'entre-rios',   name: 'ENTRE RÍOS',   emoji: '🌊' },
    { id: 'misiones',     name: 'MISIONES',      emoji: '🌴' },
    { id: 'neuquen',      name: 'NEUQUÉN',       emoji: '⛽' },
    { id: 'patagonia',    name: 'PATAGONIA',     emoji: '🏔️' },
];

interface Coordinates {
    lat: number;
    lon: number;
}

const PROVINCE_COORDINATES: Record<string, Coordinates> = {
    'buenos-aires': { lat: -34.60, lon: -58.38 },
    'cordoba': { lat: -31.42, lon: -64.18 },
    'santa-fe': { lat: -31.63, lon: -60.70 },
    'mendoza': { lat: -32.89, lon: -68.84 },
    'tucuman': { lat: -26.81, lon: -65.22 },
    'entre-rios': { lat: -31.73, lon: -60.53 },
    'misiones': { lat: -27.37, lon: -55.90 },
    'neuquen': { lat: -38.95, lon: -68.06 },
    'patagonia': { lat: -41.13, lon: -71.30 },
};

const getWeatherEmoji = (code: number | null): string => {
    if (code === null) return '🌡️';
    if (code === 0) return '☀️';
    if ([1, 2, 3].includes(code)) return '⛅';
    if ([45, 48].includes(code)) return '🌫️';
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return '🌧️';
    if ([71, 73, 75, 77, 85, 86].includes(code)) return '❄️';
    if ([95, 96, 99].includes(code)) return '⛈️';
    return '🌡️';
};

const EnterpriseHomePage: React.FC<EnterpriseHomePageProps> = ({ globalConfig }) => {
    const navigate = useNavigate();
    const { t } = useLanguage();

    // Nueva Paleta Tecnológica (Tech Neon) - Conectada a la Configuración Global
    const primaryColor = globalConfig?.primaryColor || '#f59e0b'; // Amber por defecto
    const secondaryColor = '#3b82f6'; // Azul Royal
    const bgColor = globalConfig?.bgColor || '#020617'; // Slate 950 (Azul marino casi negro)
    const mainTitle  = globalConfig?.mainTitle  || 'Directorio Industrial';
    const mainSubtitle = globalConfig?.mainSubtitle || 'Proveedores & Mayoristas';

    const hexToRgba = (hex: string, alpha: number) => {
        try {
            const cleanHex = hex.replace('#', '');
            const r = parseInt(cleanHex.slice(0, 2), 16);
            const g = parseInt(cleanHex.slice(2, 4), 16);
            const b = parseInt(cleanHex.slice(4, 6), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        } catch { return `rgba(245,158,11,${alpha})`; }
    };

    const [selectedProvince, setSelectedProvince] = React.useState('buenos-aires');

    // --- Telemetría y Clima ---
    const [time, setTime] = React.useState(new Date());
    const [temp, setTemp] = React.useState<number | null>(null);
    const [weatherCode, setWeatherCode] = React.useState<number | null>(null);
    const [weatherError, setWeatherError] = React.useState(false);
    const [visits, setVisits] = React.useState<number>(1);
    const loggedRef = React.useRef<string | null>(null);

    // Theme Mode Resolver
    const themeMode = globalConfig?.themeMode || 'auto';
    const isDayMode = themeMode === 'light' || (themeMode === 'auto' && (() => {
        const hour = time.getHours();
        return hour >= 8 && hour < 20;
    })());

    // Incrementar visitas de empresas atómicamente al montar
    React.useEffect(() => {
        incrementarVisitasZona('empresas');
    }, []);

    // Suscribirse a las visitas de empresas para tener tiempo real
    React.useEffect(() => {
        const docRef = doc(db, 'appConfig', 'empresas');
        const unsubscribe = onSnapshot(docRef, (snap) => {
            if (snap.exists()) {
                setVisits(snap.data().visits || 1);
            }
        });
        return () => unsubscribe();
    }, []);

    // Timer de Reloj Local (1 segundo)
    React.useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Consulta Meteorológica y Registro de Telemetría por Provincia
    React.useEffect(() => {
        setTemp(null);
        setWeatherCode(null);
        setWeatherError(false);

        const coords = PROVINCE_COORDINATES[selectedProvince] || PROVINCE_COORDINATES['buenos-aires'];
        const fetchWeather = async () => {
            try {
                const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,weather_code`);
                if (res.ok) {
                    const data = await res.json();
                    const currentTemp = data.current?.temperature_2m;
                    const currentCode = data.current?.weather_code;
                    if (typeof currentTemp === 'number') {
                        const roundedTemp = Math.round(currentTemp);
                        setTemp(roundedTemp);
                        setWeatherCode(typeof currentCode === 'number' ? currentCode : null);

                        // Registrar telemetría de visita una única vez por provincia seleccionada en esta sesión
                        const logKey = `empresas-${selectedProvince}`;
                        if (loggedRef.current !== logKey) {
                            loggedRef.current = logKey;
                            registrarVisitaConTelemetria('empresas', roundedTemp, currentCode);
                        }
                    }
                } else {
                    setWeatherError(true);
                }
            } catch (err) {
                console.error("Error fetching weather:", err);
                setWeatherError(true);
            }
        };

        fetchWeather();
        const interval = setInterval(fetchWeather, 600000); // 10 min
        return () => clearInterval(interval);
    }, [selectedProvince]);

    // Formateadores de Reloj y Fecha (es-AR)
    const currentTimeStr = time.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    const currentDateStr = time.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });

    // 🔐 5-Click Búnker
    const [bunkerClicks, setBunkerClicks] = React.useState(0);
    React.useEffect(() => {
        if (bunkerClicks === 0) return;
        const t = setTimeout(() => setBunkerClicks(0), 1500);
        return () => clearTimeout(t);
    }, [bunkerClicks]);
    const handleBunkerClick = () => {
        playNeonClick();
        const next = bunkerClicks + 1;
        if (next >= 5) { navigate(`/empresas/tablero-maestro?provincia=${selectedProvince}`); setBunkerClicks(0); }
        else setBunkerClicks(next);
    };

    const handleShare = () => {
        playNeonClick();
        const url = `${window.location.origin}/empresas`;
        const text = `¡Descubrí el ${mainTitle}! 🏭\n\n👉 ${url}`;
        if (navigator.share) navigator.share({ title: 'ShopDigital Empresas', text, url }).catch(console.error);
        else window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    };

    return (
        <div className="flex flex-col pt-6 pb-16 animate-in fade-in duration-1000 relative overflow-hidden min-h-screen enterprise-home-root day-mode-bg-reset" style={{ backgroundColor: bgColor }}>
            {/* ── CSS Animations Inline ── */}
            <style>{`
                @keyframes levitate {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-8px); }
                }
                @keyframes pulseGlow {
                    0%, 100% { filter: drop-shadow(0 0 15px ${hexToRgba(primaryColor, 0.4)}); }
                    50% { filter: drop-shadow(0 0 35px ${hexToRgba(primaryColor, 0.8)}); }
                }
                @keyframes scanline {
                    0% { transform: translateY(-100%); }
                    100% { transform: translateY(200%); }
                }
                @keyframes radialGlow {
                    0%, 100% { transform: scale(1); opacity: 0.2; }
                    50% { transform: scale(1.15); opacity: 0.35; }
                }
                .tech-grid-bg {
                    background-size: 30px 30px;
                    background-image: 
                        linear-gradient(to right, ${hexToRgba(secondaryColor, 0.04)} 1px, transparent 1px),
                        linear-gradient(to bottom, ${hexToRgba(secondaryColor, 0.04)} 1px, transparent 1px);
                }
                .glass-card-neon {
                    background: linear-gradient(145deg, rgba(255,255,255,0.03), rgba(0,0,0,0.4));
                    backdrop-filter: blur(12px);
                    border: 1px solid ${hexToRgba(primaryColor, 0.2)};
                    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
                }
                .glow-orb {
                    position: absolute;
                    width: 140px;
                    height: 140px;
                    border-radius: 50%;
                    filter: blur(40px);
                    z-index: 0;
                    pointer-events: none;
                    animation: radialGlow 4s infinite alternate;
                }
                /* ☀️ REGLAS TÁCTICAS PARA EL MODO DÍA B2B */
                .day-mode .day-mode-bg-reset {
                    background: transparent !important;
                }
                .day-mode .glow-orb {
                    opacity: 0 !important;
                }
                .day-mode .enterprise-home-title {
                    background: linear-gradient(to right, #083344, #0284c7);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    text-shadow: 0 2px 4px rgba(8, 51, 68, 0.12) !important;
                }
                .day-mode .enterprise-home-subtitle {
                    color: #0284c7 !important;
                    font-weight: 700 !important;
                    text-shadow: 0 1px 2px rgba(8, 51, 68, 0.1) !important;
                    opacity: 1 !important;
                }
                .day-mode .section-header-text {
                    color: #083344 !important;
                    font-weight: 800 !important;
                    opacity: 1 !important;
                }
                .day-mode .telemetry-widget {
                    background: #ffffff !important;
                    border: 1.5px solid rgba(8, 145, 178, 0.4) !important;
                    border-bottom: 4px solid #0891b2 !important;
                    box-shadow: 0 8px 20px rgba(8, 145, 178, 0.1) !important;
                }
                .day-mode .telemetry-widget span {
                    color: rgba(8, 51, 68, 0.5) !important;
                }
                .day-mode .telemetry-widget .telemetry-widget-value {
                    color: #083344 !important;
                    font-weight: 900 !important;
                }
                .day-mode .telemetry-divider {
                    background-color: rgba(8, 145, 178, 0.2) !important;
                }
                .day-mode .factory-header-card {
                    background: #ffffff !important;
                    border: 2px solid rgba(8, 145, 178, 0.45) !important;
                    border-bottom: 5px solid #0891b2 !important;
                    box-shadow: 
                        0 10px 25px rgba(8, 145, 178, 0.08),
                        0 0 15px rgba(8, 145, 178, 0.05) !important;
                }
                .day-mode .factory-header-card svg {
                    color: #0891b2 !important;
                    filter: drop-shadow(0 4px 8px rgba(8, 145, 178, 0.15)) !important;
                }
                .day-mode .prov-select-btn {
                    background: rgba(255, 255, 255, 0.5) !important;
                    border-color: rgba(8, 145, 178, 0.2) !important;
                    color: #083344 !important;
                    box-shadow: 0 2px 6px rgba(8, 145, 178, 0.03) !important;
                    text-shadow: none !important;
                }
                .day-mode .prov-select-btn:hover {
                    background: rgba(255, 255, 255, 0.8) !important;
                    border-color: rgba(8, 145, 178, 0.35) !important;
                }
                .day-mode .prov-select-btn.active {
                    background: #ffffff !important;
                    color: #083344 !important;
                    border: 2px solid #0891b2 !important;
                    box-shadow: 
                        0 4px 12px rgba(8, 145, 178, 0.15),
                        inset 0 1px 0 rgba(255, 255, 255, 0.95) !important;
                    text-shadow: none !important;
                }
                .day-mode .glass-card-neon {
                    background: #ffffff !important;
                    border: 1.5px solid rgba(8, 145, 178, 0.3) !important;
                    border-bottom: 4px solid rgba(8, 145, 178, 0.45) !important;
                    box-shadow: 0 4px 10px rgba(8, 145, 178, 0.04) !important;
                }
                .day-mode .glass-card-neon:hover {
                    background: #f0fdfa !important;
                    transform: translateY(-4px) scale(1.02) !important;
                    border-color: rgba(8, 145, 178, 0.45) !important;
                    border-bottom-color: #0891b2 !important;
                    box-shadow: 
                        0 8px 20px rgba(8, 145, 178, 0.12),
                        0 0 12px rgba(8, 145, 178, 0.08) !important;
                }
                .day-mode .glass-card-neon span {
                    color: #083344 !important;
                }
                .day-mode .glass-card-neon svg {
                    color: #0891b2 !important;
                    filter: drop-shadow(0 2px 4px rgba(8, 145, 178, 0.1)) !important;
                }
                .day-mode footer p {
                    color: #083344 !important;
                    opacity: 0.75 !important;
                }
            `}</style>

            {/* ── HUD Background Tech ── */}
            <div className="fixed inset-0 pointer-events-none z-0 tech-grid-bg">
                {/* Orbes de luz elegantes */}
                <div className="absolute -top-20 -left-20 w-[600px] h-[600px] rounded-full blur-[150px] opacity-40 mix-blend-screen" style={{ backgroundColor: secondaryColor }} />
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] opacity-30 mix-blend-screen" style={{ backgroundColor: primaryColor }} />
                
                {/* Scanline Effect */}
                <div className="absolute inset-0 w-full h-[20vh] opacity-10 pointer-events-none" 
                     style={{ background: `linear-gradient(to bottom, transparent, ${primaryColor}, transparent)`, animation: 'scanline 8s linear infinite' }} />
            </div>

            {/* ── Header ── */}
            <header className="flex flex-col items-center relative z-10 px-6 mb-8 mt-2">
                <button
                    onClick={() => { playNeonClick(); navigate(-1); }}
                    className="self-start mb-6 w-11 h-11 flex items-center justify-center btn-3d-celeste transition-all cursor-pointer z-10 back-home-btn"
                >
                    <ChevronLeft size={24} style={isDayMode ? { color: '#083344' } : { color: '#22d3ee' }} strokeWidth={3} />
                </button>

                {/* Animated Logo Container with background glow-orb at night */}
                <div className="relative flex items-center justify-center w-full mb-6">
                    <div className="glow-orb" style={{ backgroundColor: hexToRgba(primaryColor, 0.45) }} />
                    <div 
                        onClick={handleBunkerClick} 
                        className="relative rounded-3xl p-6 glass-card-neon cursor-pointer overflow-hidden border-t border-l factory-header-card z-10"
                        style={{ 
                            animation: 'levitate 4s ease-in-out infinite',
                            borderTopColor: hexToRgba(primaryColor, 0.4),
                            borderLeftColor: hexToRgba(primaryColor, 0.2)
                        }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                        <Factory 
                            size={56} 
                            strokeWidth={1.5}
                            style={{ color: primaryColor, animation: 'pulseGlow 3s infinite alternate' }} 
                        />
                    </div>
                </div>

                <h1 className="text-xl font-bold text-white uppercase tracking-[0.25em] text-center mb-2 enterprise-home-title" style={{ textShadow: `0 0 20px ${hexToRgba(primaryColor, 0.5)}` }}>
                    {mainTitle}
                </h1>
                <div className="flex items-center gap-3">
                    <div className="h-[2px] w-12 rounded-full" style={{ backgroundImage: `linear-gradient(to right, transparent, ${primaryColor})` }} />
                    <p className="text-[10px] font-medium text-cyan-100 uppercase tracking-[0.3em] opacity-80 enterprise-home-subtitle">
                        Argentina · {mainSubtitle}
                    </p>
                    <div className="h-[2px] w-12 rounded-full" style={{ backgroundImage: `linear-gradient(to left, transparent, ${primaryColor})` }} />
                </div>

                {/* Panel de Telemetría */}
                <div 
                    className="telemetry-widget mt-6 flex items-center justify-between w-full max-w-[340px] px-4 py-2.5 rounded-2xl border text-[9px] font-black uppercase tracking-widest relative overflow-hidden backdrop-blur-md shadow-lg"
                >
                    <div className="flex flex-col items-center flex-1">
                        <span className="text-white/40 text-[6.5px] tracking-[0.25em] mb-0.5">{t('HORA')}</span>
                        <span className="telemetry-widget-value text-white font-mono text-[10px] tracking-wider">
                            {currentTimeStr}
                        </span>
                    </div>
                    <div className="w-[1px] h-5 bg-white/10 telemetry-divider" />
                    <div className="flex flex-col items-center flex-1">
                        <span className="text-white/40 text-[6.5px] tracking-[0.25em] mb-0.5">{t('FECHA')}</span>
                        <span className="telemetry-widget-value text-white text-[10px] tracking-wider">
                            {currentDateStr}
                        </span>
                    </div>
                    <div className="w-[1px] h-5 bg-white/10 telemetry-divider" />
                    <div className="flex flex-col items-center flex-1">
                        <span className="text-white/40 text-[6.5px] tracking-[0.25em] mb-0.5">{t('VISITAS')}</span>
                        <span className="telemetry-widget-value text-white text-[10px] tracking-wider">
                            👁️ {visits}
                        </span>
                    </div>
                    <div className="w-[1px] h-5 bg-white/10 telemetry-divider" />
                    <div className="flex flex-col items-center flex-1">
                        <span className="text-white/40 text-[6.5px] tracking-[0.25em] mb-0.5">{t('CLIMA')}</span>
                        <span className="telemetry-widget-value text-white text-[10px] tracking-wider">
                            {getWeatherEmoji(weatherCode)} {temp !== null ? `${temp}°C` : (weatherError ? '18°C' : '...')}
                        </span>
                    </div>
                </div>
            </header>

            {/* ── Selector de Provincias ── */}
            <section className="px-4 mb-10 relative z-10">
                <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-center mb-4 flex items-center justify-center gap-2 text-cyan-200/60 section-header-text">
                    <MapPin size={12} className="text-cyan-400" /> Coordenadas Regionales
                </p>
                <div className="flex flex-wrap gap-2.5 justify-center">
                    {PROVINCES.map((prov) => {
                        const isActive = selectedProvince === prov.id;
                        return (
                            <button
                                key={prov.id}
                                onClick={() => { playNeonClick(); setSelectedProvince(prov.id); }}
                                className={`px-4 py-2.5 rounded-xl border transition-all duration-300 text-[10px] font-bold uppercase tracking-wider relative overflow-hidden prov-select-btn cursor-pointer ${isActive ? 'active' : ''}`}
                                style={isActive ? {
                                    backgroundColor: hexToRgba(secondaryColor, 0.3),
                                    borderColor: primaryColor,
                                    color: '#ffffff',
                                    boxShadow: `0 0 20px ${hexToRgba(primaryColor, 0.4)}, inset 0 0 15px ${hexToRgba(secondaryColor, 0.5)}`,
                                    textShadow: `0 0 10px ${primaryColor}`
                                } : {
                                    backgroundColor: 'rgba(255,255,255,0.02)',
                                    borderColor: 'rgba(255,255,255,0.1)',
                                    color: 'rgba(255,255,255,0.5)',
                                }}
                            >
                                {isActive && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] animate-[shimmer_2s_infinite]" />}
                                <span className="opacity-80 mr-1.5">{prov.emoji}</span> {prov.name}
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* ── Grid de Rubros Industriales ── */}
            <section className="px-5 relative z-10">
                <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-center mb-6 text-cyan-200/60 section-header-text">
                    Sectores Productivos Activos
                </p>
                <div className="grid grid-cols-3 gap-3">
                    {ENTERPRISE_CATEGORIES.map((cat, index) => (
                        <button
                            key={cat.id}
                            onClick={() => {
                                playNeonClick();
                                const query = selectedProvince !== 'all' ? `?provincia=${selectedProvince}` : '';
                                navigate(`/empresas/${cat.slug}${query}`);
                            }}
                            className="glass-card-neon aspect-square group flex flex-col items-center justify-center rounded-2xl transition-all duration-500 hover:-translate-y-1 relative overflow-hidden"
                            style={{
                                animation: `fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${index * 40}ms both`,
                            }}
                        >
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" 
                                 style={{ background: `radial-gradient(circle at center, ${hexToRgba(primaryColor, 0.2)} 0%, transparent 70%)` }} />
                                 
                            <div className="mb-2.5 transform group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300 drop-shadow-md" style={{ color: primaryColor }}>
                                {cat.icon}
                            </div>
                            <span className="text-[8px] sm:text-[9px] text-center font-bold uppercase leading-tight tracking-wider px-1 text-slate-300 group-hover:text-white transition-colors z-10">
                                {cat.name}
                            </span>
                        </button>
                    ))}
                </div>
            </section>

            {/* ── CTA Inscripción + Compartir ── */}
            <div className="mt-14 px-6 flex flex-col gap-4 items-center w-full relative z-10">
                <button
                    onClick={() => { playNeonClick(); navigate('/empresas/inscripcion'); }}
                    className="w-full py-5 font-bold uppercase tracking-[0.15em] text-[11px] flex items-center justify-center gap-3 cursor-pointer btn-3d-celeste group"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out pointer-events-none" />
                    <ShieldCheck size={18} className="animate-pulse" style={isDayMode ? { color: '#083344' } : { color: '#22d3ee' }} />
                    <span style={isDayMode ? { color: '#083344' } : { color: '#ffffff' }}>Autenticar Fábrica / Empresa</span>
                    <Zap size={14} className="opacity-50" style={isDayMode ? { color: '#083344' } : { color: '#22d3ee' }} />
                </button>

                <button
                    onClick={handleShare}
                    className="w-full py-4 text-[10px] font-semibold uppercase tracking-[0.2em] flex items-center justify-center gap-3 cursor-pointer btn-3d-celeste"
                >
                    <Share2 size={16} style={isDayMode ? { color: '#083344' } : { color: '#22d3ee' }} />
                    <span style={isDayMode ? { color: '#083344' } : { color: '#ffffff' }}>Transmitir Coordenadas</span>
                </button>
            </div>

            {/* ── Footer ── */}
            <footer className="w-full flex flex-col items-center gap-2 pt-12 pb-6 mt-auto relative z-10">
                <div className="flex items-center gap-2 opacity-50">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    <p onClick={handleBunkerClick} className="text-[9px] font-bold text-cyan-200 uppercase tracking-widest cursor-pointer select-none">
                        SHOPDIGITAL NETWORKS © 2026
                    </p>
                </div>
                <p className="text-[8px] font-medium uppercase tracking-[0.25em]" style={{ color: hexToRgba(secondaryColor, 0.7) }}>
                    NODO INDUSTRIAL SECURE LINK
                </p>
            </footer>
        </div>
    );
};

export default EnterpriseHomePage;
