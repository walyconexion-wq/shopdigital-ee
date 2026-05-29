import React from 'react';
import { CATEGORIES } from '../constants';
import Logo from '../components/Logo';
import { Share2, Store } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { playNeonClick } from '../utils/audio';
import { resolveIcon } from '../utils/iconResolver';
import { useAuth } from '../components/AuthContext';
import { TRASLASIERRA_REGION } from '../data/regionalTemplates/traslasierraConfig';

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
};

const getCoordinates = (id: string): Coordinates => {
    if (TOWN_COORDINATES[id]) return TOWN_COORDINATES[id];
    if (id.includes('ezeiza')) return TOWN_COORDINATES['ezeiza'];
    if (id.includes('traslasierra')) return TOWN_COORDINATES['traslasierra'];
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
    const themeColor = globalConfig?.themeColor || '#22d3ee';
    const isInTraslasierra = TRASLASIERRA_REGION.towns.some(t => t.id === townId);
    const activeTheme = globalConfig?.isChristmasMode ? 'christmas' : (globalConfig?.theme || 'default');
    const mainSubtitle = globalConfig?.mainSubtitle || `Tu guía de ofertas en ${townId.replace(/-/g, ' ')}`;
    const townName = globalConfig?.townName || 'Esteban Echeverría';

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
        const shareText = `¡Mirá los comercios de ${townName} en la App de Waly! 🚀\n\n👉 ${appUrl}`;
        if (navigator.share) {
            navigator.share({ title: 'ShopDigital', text: shareText, url: appUrl }).catch(console.error);
        } else {
            window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
        }
    };

    return (
        <div className="flex flex-col pt-8 pb-12 animate-in fade-in duration-700 relative overflow-hidden min-h-screen bg-transparent">
            <style>
                {`
                @keyframes seasonalFall {
                    0% { transform: translateY(0) rotate(0deg); opacity: 0; }
                    10% { opacity: 0.2; }
                    90% { opacity: 0.2; }
                    100% { transform: translateY(110vh) rotate(360deg); opacity: 0; }
                }
                @keyframes bounceSlow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-6px); }
                }
                .animate-bounce-slow {
                    animation: bounceSlow 3s ease-in-out infinite;
                }
                `}
            </style>
            
            <SeasonalDecoration />

            <div className="absolute top-20 left-[-10%] w-64 h-64 rounded-full blur-3xl pointer-events-none" style={{ backgroundColor: hexToRgba(themeColor, 0.1) }} />
            <div className="absolute bottom-20 right-[-10%] w-64 h-64 rounded-full blur-3xl pointer-events-none" style={{ backgroundColor: hexToRgba(themeColor, 0.1) }} />
            
            <header className="flex-shrink-0 flex flex-col items-center relative z-10 transition-all duration-700 bg-transparent pt-0">
                <div 
                    onClick={handleLogoClick}
                    className="glass-header rounded-3xl p-5 mb-2.5 border backdrop-blur-md animate-in fade-in zoom-in duration-1000 cursor-pointer active:scale-95 transition-all"
                    style={{ 
                        borderColor: hexToRgba(themeColor, 0.5),
                        boxShadow: `0 15px 40px ${hexToRgba(themeColor, 0.4)}`,
                        background: `linear-gradient(135deg, ${hexToRgba(themeColor, 0.2)} 0%, rgba(15,23,42,0.6) 100%)`
                    }}
                >
                    <Logo />
                </div>
            </header>

            <div className="flex flex-col items-center mb-10 mt-3 fade-up-item relative z-10 px-6">
                <div className="h-[1px] w-20 mb-5" style={{ background: `linear-gradient(90deg, transparent, ${hexToRgba(themeColor, 0.5)}, transparent)` }}></div>
                <h2 className="text-[12px] font-[1000] text-white/90 text-shadow-premium uppercase tracking-[0.35em] text-center leading-none">
                    {mainSubtitle}
                </h2>
                <div className="flex items-center gap-3 mt-4">
                    <div className="h-[1px] w-6" style={{ background: `linear-gradient(90deg, transparent, ${hexToRgba(themeColor, 0.3)})` }}></div>
                    <div className="flex gap-1.5">
                        <div className="w-1 h-1 rounded-full" style={{ backgroundColor: hexToRgba(themeColor, 0.2) }}></div>
                        <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: themeColor, boxShadow: `0 0 8px ${hexToRgba(themeColor, 0.6)}` }}></div>
                        <div className="w-1 h-1 rounded-full" style={{ backgroundColor: hexToRgba(themeColor, 0.2) }}></div>
                    </div>
                    <div className="h-[1px] w-6" style={{ background: `linear-gradient(90deg, ${hexToRgba(themeColor, 0.3)}, transparent)` }}></div>
                </div>

                {/* Panel de Telemetría */}
                <div 
                    className="telemetry-widget mt-6 flex items-center justify-between w-full max-w-[340px] px-4 py-2.5 rounded-2xl border text-[9px] font-black uppercase tracking-widest relative overflow-hidden backdrop-blur-md shadow-lg"
                >
                    <div className="flex flex-col items-center flex-1">
                        <span className="text-white/40 text-[6.5px] tracking-[0.25em] mb-0.5">HORA</span>
                        <span className="telemetry-widget-value text-white font-mono text-[10px] tracking-wider">
                            {currentTimeStr}
                        </span>
                    </div>
                    <div className="w-[1px] h-5 bg-white/10" />
                    <div className="flex flex-col items-center flex-1">
                        <span className="text-white/40 text-[6.5px] tracking-[0.25em] mb-0.5">FECHA</span>
                        <span className="telemetry-widget-value text-white text-[10px] tracking-wider">
                            {currentDateStr}
                        </span>
                    </div>
                    <div className="w-[1px] h-5 bg-white/10" />
                    <div className="flex flex-col items-center flex-1">
                        <span className="text-white/40 text-[6.5px] tracking-[0.25em] mb-0.5">VISITAS</span>
                        <span className="telemetry-widget-value text-white text-[10px] tracking-wider">
                            👁️ {globalConfig?.visits || 1}
                        </span>
                    </div>
                    <div className="w-[1px] h-5 bg-white/10" />
                    <div className="flex flex-col items-center flex-1">
                        <span className="text-white/40 text-[6.5px] tracking-[0.25em] mb-0.5">CLIMA</span>
                        <span className="telemetry-widget-value text-white text-[10px] tracking-wider">
                            {getWeatherEmoji(weatherCode)} {temp !== null ? `${temp}°C` : (weatherError ? '18°C' : '...')}
                        </span>
                    </div>
                </div>

                {globalConfig?.isChristmasMode && (
                    <div 
                        className="mt-6 w-full max-w-[340px] px-4 py-3 rounded-2xl border text-center relative overflow-hidden backdrop-blur-md animate-bounce-slow"
                        style={{
                            background: `linear-gradient(135deg, rgba(220, 38, 38, 0.3) 0%, rgba(20, 83, 45, 0.3) 100%)`,
                            borderColor: '#ef4444',
                            boxShadow: '0 0 15px rgba(239, 68, 68, 0.5), inset 0 0 10px rgba(34, 197, 94, 0.3)',
                        }}
                    >
                        {/* Christmas Lights decoration */}
                        <div className="absolute top-0 left-0 right-0 flex justify-around opacity-80 select-none text-[8px] tracking-[0.1em] pointer-events-none">
                            <span>🔴</span><span>🟢</span><span>🔵</span><span>🟡</span><span>🔴</span><span>🟢</span><span>🔵</span><span>🟡</span>
                        </div>
                        <h3 className="text-[13px] font-black text-white tracking-[0.15em] uppercase text-shadow-premium flex items-center justify-center gap-1.5 pt-1.5">
                            🎄 ¡Feliz Navidad en {townName}! 🎅
                        </h3>
                        <p className="text-[8.5px] font-black text-emerald-300 tracking-[0.1em] uppercase mt-1">
                            Disfrutá los catálogos y ofertas locales
                        </p>
                    </div>
                )}

                {/* Chips Regionales para Traslasierra */}
                {isInTraslasierra && (
                    <div className="w-full mt-6 mb-2">
                        <div className="flex flex-wrap justify-center gap-2.5 px-2 pb-2 max-w-[95%] mx-auto">
                            {TRASLASIERRA_REGION.towns.map((town) => {
                                const isActive = townId === town.id;
                                return (
                                    <button
                                        key={town.id}
                                        onClick={() => {
                                            playNeonClick();
                                            if (!isActive) navigate(`/${town.id}/home`);
                                        }}
                                        className={`px-4 py-2 rounded-full border transition-all duration-300 text-[8.5px] font-black uppercase tracking-widest ${
                                            isActive
                                                ? 'backdrop-blur-md text-white scale-105 animate-pulse'
                                                : 'backdrop-blur-sm text-white/90 hover:text-white hover:scale-105 active:scale-95'
                                        }`}
                                        style={isActive ? {
                                            backgroundColor: hexToRgba(themeColor, 0.35),
                                            borderColor: '#ffffff',
                                            boxShadow: `0 0 20px ${hexToRgba(themeColor, 0.8)}, inset 0 0 10px ${hexToRgba(themeColor, 0.5)}`,
                                            textShadow: `0 0 8px ${hexToRgba(themeColor, 0.9)}`
                                        } : {
                                            backgroundColor: hexToRgba(themeColor, 0.1),
                                            borderColor: hexToRgba(themeColor, 0.3),
                                            boxShadow: `0 0 10px ${hexToRgba(themeColor, 0.1)}`
                                        }}
                                    >
                                        {town.name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-3 gap-x-4 gap-y-8 px-5 relative z-10">
                {(globalConfig?.categories || CATEGORIES).filter((c: any) => c.isActive !== false).map((cat: any, index: number) => (
                    <button
                        key={cat.id}
                        onClick={() => { playNeonClick(); navigate(`/${townId}/${cat.slug}`); }}
                        className="glass-button-3d category-btn aspect-square group backdrop-blur-md border rounded-[1.25rem] transition-all duration-300"
                        style={{
                            animation: `fadeUp 0.7s cubic-bezier(0.25, 1, 0.5, 1) ${index * 35}ms both`,
                            backgroundColor: hexToRgba(themeColor, 0.15),
                            borderColor: hexToRgba(themeColor, 0.2),
                            boxShadow: `0 0 15px ${hexToRgba(themeColor, 0.08)}`
                        }}
                    >
                        <div className="mb-1.5 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-500 ease-out" style={{ color: themeColor }}>
                            {cat.iconKey ? resolveIcon(cat.iconKey) : cat.icon}
                        </div>
                        <span className="text-[8.5px] text-center font-black uppercase leading-[1.1] tracking-[0.01em] px-0.5 text-white/90 group-hover:text-white transition-colors">
                            {cat.name}
                        </span>
                    </button>
                ))}
            </div>

            <div className="mt-12 mb-4 px-14 flex flex-col gap-4 justify-center items-center w-full fade-up-item relative z-10" style={{ animationDelay: '700ms' }}>
                <button
                    onClick={() => { playNeonClick(); navigate(`/${townId}/subscripcion`); }}
                    className="glass-action-btn w-full py-4 text-[10px] font-[1100] uppercase tracking-[0.25em] active:scale-95 border flex items-center justify-center gap-3 transition-all"
                    style={{ 
                        backgroundColor: hexToRgba(themeColor, 0.3),
                        borderColor: hexToRgba(themeColor, 0.6),
                        boxShadow: `0 0 30px ${hexToRgba(themeColor, 0.3)}`
                    }}
                >
                    <Store size={18} style={{ color: hexToRgba(themeColor, 0.8) }} strokeWidth={3} />
                    <span className="text-white text-shadow-premium">Suscribir Comercio</span>
                </button>

                <button
                    onClick={handleShare}
                    className="glass-action-btn w-full py-4 text-[10px] font-[1100] uppercase tracking-[0.25em] active:scale-95 border flex items-center justify-center gap-3"
                    style={{ 
                        backgroundColor: hexToRgba(themeColor, 0.3),
                        borderColor: hexToRgba(themeColor, 0.6),
                        boxShadow: `0 0 30px ${hexToRgba(themeColor, 0.3)}`
                    }}
                >
                    <Share2 size={16} style={{ color: hexToRgba(themeColor, 0.8) }} strokeWidth={3} />
                    <span className="text-white text-shadow-premium">Compartir App</span>
                </button>
            </div>

            <footer className="w-full flex flex-col items-center gap-2 pt-6 pb-6 mt-auto border-t border-white/10 relative z-10">
                <p className="text-[9px] font-black text-white uppercase tracking-[0.35em] text-center select-none">
                    © 2026 · ShopDigital
                </p>
                <div className="flex items-center gap-4 mt-1">
                    <p 
                        onClick={handleWalyClick}
                        className="text-[8px] font-bold uppercase tracking-[0.25em] text-center select-none cursor-pointer active:scale-95 transition-transform" 
                        style={{ color: themeColor, textShadow: `0 0 10px ${hexToRgba(themeColor, 0.8)}, 0 0 20px ${hexToRgba(themeColor, 0.4)}` }}
                    >
                        {townName}
                    </p>
                    <span className="text-white/20 text-[8px]">|</span>
                    <button 
                        onClick={() => { playNeonClick(); navigate(`/${townId}/terminos`); }}
                        className="text-[8px] font-bold uppercase tracking-[0.25em] text-center text-white hover:text-cyan-300 transition-colors"
                    >
                        Términos y Condiciones
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default Home;
