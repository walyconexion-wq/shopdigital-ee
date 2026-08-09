import React from 'react';
import { CATEGORIES } from '../constants';
import Logo from '../components/Logo';
import { Share2, Store, ArrowLeft, Sun, Moon, Clock, Wifi } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { playNeonClick } from '../utils/audio';
import { resolveIcon } from '../utils/iconResolver';
import { useAuth } from '../components/AuthContext';
import { TRASLASIERRA_REGION } from '../data/regionalTemplates/traslasierraConfig';
import { PATAGONIA_7_LAGOS_REGION } from '../data/regionalTemplates/patagonia7LagosConfig';
import { useLanguage } from '../components/LanguageContext';
import { CyberCircuitBackground } from '../components/CyberCircuitBackground';

interface HomeProps {
    globalConfig?: any;
}

interface Coordinates {
    lat: number;
    lon: number;
}

const TOWN_COORDINATES: Record<string, Coordinates> = {
    'esteban-echeverria': { lat: -34.82, lon: -58.47 },
    'ezeiza': { lat: -34.85, lon: -58.52 },
    'lomas-de-zamora': { lat: -34.76, lon: -58.40 },
    'traslasierra': { lat: -31.72, lon: -65.01 },
    'mina-clavero': { lat: -31.72, lon: -65.01 },
    'villa-cura-brochero': { lat: -31.72, lon: -65.01 },
    'nono': { lat: -31.79, lon: -65.00 },
    'san-lorenzo': { lat: -31.66, lon: -65.01 },
    'las-rabonas': { lat: -31.85, lon: -64.97 },
    'los-hornillos': { lat: -31.90, lon: -64.95 },
    'villa-de-las-rosas': { lat: -31.95, lon: -65.01 },
    'las-tapias': { lat: -31.97, lon: -65.09 },
    'san-javier': { lat: -32.03, lon: -65.03 },
    'yacanto': { lat: -32.05, lon: -65.03 },
    'la-poblacion': { lat: -32.10, lon: -65.01 },
    'luyaba': { lat: -32.17, lon: -65.07 },
    'la-paz': { lat: -32.22, lon: -65.05 },
    'bariloche': { lat: -41.134, lon: -71.308 },
    'san-martin-de-los-andes': { lat: -40.155, lon: -71.353 },
    'villa-la-angostura': { lat: -40.763, lon: -71.643 }
};

const getCoordinates = (id: string): Coordinates => {
    if (TOWN_COORDINATES[id]) return TOWN_COORDINATES[id];
    if (id.includes('ezeiza')) return TOWN_COORDINATES['ezeiza'];
    if (id.includes('traslasierra')) return TOWN_COORDINATES['traslasierra'];
    if (id.includes('bariloche') || id.includes('san-martin') || id.includes('villa-la-angostura')) {
        return TOWN_COORDINATES[id.includes('bariloche') ? 'bariloche' : id.includes('san-martin') ? 'san-martin-de-los-andes' : 'villa-la-angostura'];
    }
    return TOWN_COORDINATES['esteban-echeverria'];
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

const Home: React.FC<HomeProps> = ({ globalConfig }) => {
    const { townId = 'esteban-echeverria' } = useParams<{ townId: string }>();
    const navigate = useNavigate();
    const { t, language } = useLanguage();
    const themeColor = globalConfig?.primaryColor || globalConfig?.themeColor || '#22d3ee';
    const isInTraslasierra = TRASLASIERRA_REGION.towns.some(t => t.id === townId);
    const isInPatagonia = PATAGONIA_7_LAGOS_REGION.towns.some(t => t.id === townId);
    const BUENOS_AIRES_SUR_TOWNS = ['esteban-echeverria', 'ezeiza', 'lomas-de-zamora'];
    const isInBuenosAires = BUENOS_AIRES_SUR_TOWNS.includes(townId);
    const activeTheme = globalConfig?.isChristmasMode ? 'christmas' : (globalConfig?.theme || 'default');
    const mainSubtitle = globalConfig?.mainSubtitle || `${t('Tu guía de ofertas locales')} - ${townId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}`;
    const townName = globalConfig?.townName || 'Esteban Echeverría';
    const themeMode = globalConfig?.themeMode || 'auto';
    const checkIsDayMode = () => {
        const saved = localStorage.getItem('global_home_theme_mode');
        return (saved || 'light') === 'light';
    };
    const [isDayMode, setIsDayMode] = React.useState(checkIsDayMode);

    React.useEffect(() => {
        const syncTheme = () => setIsDayMode(checkIsDayMode());
        window.addEventListener('theme-changed', syncTheme);
        return () => window.removeEventListener('theme-changed', syncTheme);
    }, []);

    const [logoClicks, setLogoClicks] = React.useState(0);
    const [walyClicks, setWalyClicks] = React.useState(0);

    // --- Telemetría y Clima ---
    const [time, setTime] = React.useState(new Date());
    const [temp, setTemp] = React.useState<number | null>(null);
    const [weatherCode, setWeatherCode] = React.useState<number | null>(null);
    const [weatherError, setWeatherError] = React.useState(false);
    const loggedRef = React.useRef<string | null>(null);

    // Incrementar visitas de zona de manera atómica
    React.useEffect(() => {
        if (townId) {
            import('../firebase').then(({ incrementarVisitasZona }) => {
                incrementarVisitasZona(townId);
            });
        }
    }, [townId]);

    // Timer de Reloj Local
    React.useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Consulta Meteorológica y Registro de Telemetría
    React.useEffect(() => {
        setTemp(null);
        setWeatherCode(null);
        setWeatherError(false);

        const coords = getCoordinates(townId);
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

                        // Registrar telemetría de visita una única vez por zona resuelta
                        if (loggedRef.current !== townId) {
                            loggedRef.current = townId;
                            const { registrarVisitaConTelemetria } = await import('../firebase');
                            registrarVisitaConTelemetria(townId, roundedTemp, currentCode);
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
    }, [townId]);

    // Formateadores de Reloj y Fecha
    const currentTimeStr = time.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    const currentDateStr = time.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });

    const hexToRgba = (hex: string, alpha: number) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    // Seasonal Decoration Component
    const SeasonalDecoration = () => {
        if (activeTheme === 'default') return null;

        const items = [];
        const count = 12;
        
        for (let i = 0; i < count; i++) {
            const left = Math.random() * 100;
            const delay = Math.random() * 5;
            const duration = 5 + Math.random() * 10;
            const size = 15 + Math.random() * 20;
            
            let char = '❄️';
            if (activeTheme === 'christmas') char = '🎄';
            if (activeTheme === 'summer') char = '☀️';
            if (activeTheme === 'spring') char = '🌸';
            if (activeTheme === 'winter') char = '❄️';

            items.push(
                <div 
                    key={i}
                    className="fixed pointer-events-none z-0 transition-opacity duration-1000"
                    style={{
                        left: `${left}%`,
                        top: `-50px`,
                        fontSize: `${size}px`,
                        opacity: 0.1,
                        animation: `seasonalFall ${duration}s linear ${delay}s infinite`,
                    }}
                >
                    {char}
                </div>
            );
        }
        return <>{items}</>;
    };

    // Reset clicks logic
    React.useEffect(() => {
        if (logoClicks === 0) return;
        const timer = setTimeout(() => setLogoClicks(0), 1000);
        return () => clearTimeout(timer);
    }, [logoClicks]);

    React.useEffect(() => {
        if (walyClicks === 0) return;
        const timer = setTimeout(() => setWalyClicks(0), 1000);
        return () => clearTimeout(timer);
    }, [walyClicks]);

    const handleLogoClick = () => {
        playNeonClick();
        const nextClicks = logoClicks + 1;
        if (nextClicks >= 3) { navigate(`/${townId}/nosotros`); setLogoClicks(0); }
        else setLogoClicks(nextClicks);
    };

    const handleWalyClick = () => {
        playNeonClick();
        const nextClicks = walyClicks + 1;
        if (nextClicks >= 5) { navigate(`/${townId}/tablero-maestro`); setWalyClicks(0); }
        else setWalyClicks(nextClicks);
    };

    const handleShare = () => {
        playNeonClick();
        const appUrl = window.location.origin;
        const shareText = language === 'en' 
            ? `Check out the shops in ${townName} on Waly's App! 🚀\n\n👉 ${appUrl}`
            : language === 'pt'
                ? `Veja as lojas de ${townName} no aplicativo do Waly! 🚀\n\n👉 ${appUrl}`
                : `¡Mirá los comercios de ${townName} en la App de Waly! 🚀\n\n👉 ${appUrl}`;
        if (navigator.share) {
            navigator.share({ title: 'ShopDigital', text: shareText, url: appUrl }).catch(console.error);
        } else {
            window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col items-center px-4 py-6 relative overflow-y-auto selection:bg-cyan-500/30 bg-transparent text-[#2c2440]">
            {/* Fondo Ciber-Digital de Circuitos Animados */}
            <CyberCircuitBackground />
            
            <SeasonalDecoration />

            {/* ══════════════════════════════════════════
                CABECERA SUPERIOR EN CONTENEDOR NEUMÓRFICO UNIFICADO (PARIDAD TOTAL CON CREDECIAL COMERCIANTE)
            ══════════════════════════════════════════ */}
            <div className="w-full max-w-sm relative z-10 mb-5 p-3.5 neu-plate flex flex-col items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-700">
                {/* HEADER NEUMÓRFICO CON PODS DE CABECERA */}
                <div className="w-full flex justify-between items-center gap-2">
                    <button 
                        onClick={() => { playNeonClick(); navigate('/'); }}
                        className="w-9 h-9 flex items-center justify-center cursor-pointer transition-all neu-btn-pod group shrink-0"
                        aria-label="Volver a Inicio Global"
                        title="Volver"
                    >
                        <ArrowLeft size={16} className="text-[#2c2440] group-hover:-translate-x-0.5 transition-transform" strokeWidth={3} />
                    </button>

                    <div 
                        onClick={handleLogoClick}
                        className="flex-1 text-center px-3 py-1.5 neu-inset-title cursor-pointer active:scale-95 transition-transform"
                    >
                        <h1 className="text-xs font-black tracking-tight uppercase leading-tight text-[#2c2440]">
                            {townName}
                        </h1>
                        <p className="text-[7px] font-extrabold uppercase tracking-widest text-[#4a3d6a]">
                            {t('RED COMERCIAL DIGITAL')}
                        </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                        <button
                            onClick={() => {
                                playNeonClick();
                                const current = localStorage.getItem('global_home_theme_mode') || 'light';
                                const nextTheme = current === 'light' ? 'dark' : 'light';
                                localStorage.setItem('global_home_theme_mode', nextTheme);
                                window.dispatchEvent(new Event('theme-changed'));
                            }}
                            aria-label="Alternar modo de color"
                            className="w-9 h-9 flex items-center justify-center cursor-pointer transition-all neu-btn-pod group"
                            title="Modo de Color"
                        >
                            {isDayMode 
                                ? <Moon size={15} className="text-[#2c2440] group-hover:rotate-12 transition-transform" /> 
                                : <Sun size={15} className="text-[#ff6b6b] group-hover:rotate-45 transition-transform" />
                            }
                        </button>
                        <button 
                            onClick={handleShare}
                            className="w-9 h-9 flex items-center justify-center cursor-pointer transition-all neu-btn-pod group"
                            aria-label="Compartir"
                            title="Compartir App"
                        >
                            <Share2 size={15} className="text-[#2c2440] group-hover:scale-110 transition-transform" />
                        </button>
                    </div>
                </div>

                {/* Avatar ARI Integrado en Cabecera */}
                {isDayMode && (
                    <div className="flex flex-col items-center select-none pointer-events-none my-0.5">
                        <img 
                            src="/ari-pointing.png" 
                            alt="ARI Asistente Local" 
                            className="h-20 w-auto object-contain drop-shadow-[0_4px_10px_rgba(44,36,64,0.18)] animate-in fade-in duration-700" 
                        />
                        <div className="ari-3d-shadow mt-0.5 scale-75" />
                    </div>
                )}

                {/* SELLO DE VIDA — TIMESTAMP ANTI-FALSIFICACIÓN & TELEMETRÍA */}
                <div className="w-full flex items-center justify-between neu-inset-title px-4 py-2">
                    <div className="flex items-center gap-2">
                        <Clock size={12} className="text-[#ff6b6b] animate-spin flex-shrink-0" style={{ animationDuration: '6s' }} />
                        <p className="text-[9.5px] font-black font-mono tracking-widest tabular-nums text-[#2c2440]">
                            {currentTimeStr}
                        </p>
                    </div>
                    <div className="h-3.5 w-[1px] bg-[#4a3d6a]/20" />
                    <div className="flex items-center gap-2 text-[8.5px] font-extrabold uppercase tracking-widest text-[#4a3d6a]">
                        <span>👁️ {globalConfig?.visits || 1}</span>
                        <span>•</span>
                        <span>{getWeatherEmoji(weatherCode)} {temp !== null ? `${temp}°C` : '18°C'}</span>
                    </div>
                </div>

                {/* Botones de Navegación Buenos Aires Sur (Sub-pills Neumórficos) */}
                {isInBuenosAires && (
                    <div className="w-full mt-0.5">
                        <div className="grid grid-cols-4 gap-1.5 w-full">
                            {[
                                { id: 'esteban-echeverria', label: 'Echeverría' },
                                { id: 'ezeiza', label: 'Ezeiza' },
                                { id: 'lomas-de-zamora', label: 'Lomas' },
                                { id: 'home', label: 'Home', isHome: true }
                            ].map((item) => {
                                const isActive = !item.isHome && townId === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => {
                                            playNeonClick();
                                            if (item.isHome) {
                                                navigate('/');
                                            } else if (!isActive) {
                                                navigate(`/${item.id}/home`);
                                            }
                                        }}
                                        className={`py-2 px-0.5 text-[8px] font-black uppercase tracking-wider text-center transition-all ${
                                            isActive ? 'neu-btn-3d-active' : 'neu-btn-pod'
                                        }`}
                                    >
                                        {item.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Botones de Navegación Patagonia */}
                {isInPatagonia && (
                    <div className="w-full mt-0.5">
                        <div className="grid grid-cols-3 gap-1.5 w-full">
                            {PATAGONIA_7_LAGOS_REGION.towns.map((town) => {
                                const isActive = townId === town.id;
                                return (
                                    <button
                                        key={town.id}
                                        onClick={() => {
                                            playNeonClick();
                                            if (!isActive) navigate(`/${town.id}/home`);
                                        }}
                                        className={`py-2 px-1 text-[7.5px] font-black uppercase tracking-wider text-center transition-all whitespace-nowrap overflow-hidden ${
                                            isActive ? 'neu-btn-3d-active' : 'neu-btn-pod'
                                        }`}
                                    >
                                        {town.id === 'san-martin-de-los-andes' ? 'San Martín' : town.id === 'villa-la-angostura' ? 'V. Angostura' : 'Bariloche'}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Chips Regionales para Traslasierra */}
                {isInTraslasierra && (
                    <div className="w-full mt-0.5">
                        <div className="flex flex-wrap justify-center gap-1.5 w-full">
                            {TRASLASIERRA_REGION.towns.map((town) => {
                                const isActive = townId === town.id;
                                return (
                                    <button
                                        key={town.id}
                                        onClick={() => {
                                            playNeonClick();
                                            if (!isActive) navigate(`/${town.id}/home`);
                                        }}
                                        className={`py-1.5 px-3 text-[8px] font-black uppercase tracking-wider text-center transition-all ${
                                            isActive ? 'neu-btn-3d-active' : 'neu-btn-pod'
                                        }`}
                                    >
                                        {town.name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* ══════════════════════════════════════════
                GRILLA DE CATEGORÍAS EN CONTENEDOR NEUMÓRFICO CREMA HD
            ══════════════════════════════════════════ */}
            <div className="w-full max-w-sm relative z-10 mb-5 animate-in zoom-in duration-700 delay-100">
                <div className="neu-plate p-5 w-full grid grid-cols-3 gap-3">
                    {(globalConfig?.categories || CATEGORIES).filter((c: any) => c.isActive !== false).map((cat: any, index: number) => {
                        return (
                            <button
                                key={cat.id}
                                onClick={() => { playNeonClick(); navigate(`/${townId}/${cat.slug}`); }}
                                className="neu-cat-card aspect-square p-2 flex flex-col items-center justify-center gap-1.5 transition-all group"
                                style={{
                                    animation: `fadeUp 0.6s cubic-bezier(0.25, 1, 0.5, 1) ${index * 30}ms both`
                                }}
                            >
                                <div className="neu-icon-lit flex items-center justify-center">
                                    {cat.iconKey ? resolveIcon(cat.iconKey) : cat.icon}
                                </div>
                                <span className="text-[8px] text-center font-extrabold uppercase leading-tight tracking-wide text-[#2c2440] group-hover:text-[#7c3aed] transition-colors">
                                    {t(cat.name)}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ══════════════════════════════════════════
                ACCIONES CTA HERO Y PIE DE PÁGINA EN CONTENEDOR NEUMÓRFICO UNIFICADO
            ══════════════════════════════════════════ */}
            <footer className="w-full max-w-sm relative z-10 mb-6 animate-in slide-in-from-bottom-4 duration-700">
                <div className="neu-plate p-5 sm:p-6 w-full flex flex-col gap-4">
                    {/* Botón Hero: Suscribir Comercio */}
                    <button
                        onClick={() => { playNeonClick(); navigate(`/${townId}/subscripcion`); }}
                        className="neu-btn-hero w-full h-14 sm:h-15 text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 cursor-pointer shadow-md"
                    >
                        <Store size={17} className="text-[#ff6b6b]" strokeWidth={2.5} />
                        <span>{t('Suscribir Comercio')}</span>
                    </button>

                    {/* Botón 3D: Compartir App */}
                    <button
                        onClick={handleShare}
                        className="neu-btn-3d w-full h-14 sm:h-15 text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 cursor-pointer"
                    >
                        <Share2 size={17} className="text-[#2c2440]" strokeWidth={2.5} />
                        <span>Compartir App</span>
                    </button>

                    {/* Sello Inset Neumórfico para Pie de Página y Términos */}
                    <div className="neu-inset-title flex items-center justify-between w-full py-3 px-4.5 mt-0.5">
                        <p 
                            onClick={handleWalyClick}
                            className="text-[8.5px] font-extrabold uppercase tracking-[0.2em] text-[#2c2440] select-none cursor-pointer"
                        >
                            © 2026 · ShopDigital
                        </p>
                        <div className="flex items-center gap-2.5">
                            <p 
                                onClick={handleWalyClick}
                                className="text-[8.5px] font-extrabold uppercase tracking-[0.14em] text-[#2c2440] hover:text-[#ff6b6b] select-none cursor-pointer active:scale-95 transition-all" 
                            >
                                {isInPatagonia ? 'Patagonia' : townName}
                            </p>
                            <span className="text-[#4a3d6a]/40 text-[7px] select-none">|</span>
                            <button 
                                onClick={() => { playNeonClick(); navigate(`/${townId}/terminos`); }}
                                className="text-[8px] font-extrabold uppercase tracking-[0.14em] text-[#2c2440] hover:text-[#ff6b6b] active:opacity-75 transition-all select-none"
                            >
                                Términos
                            </button>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;
