import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
    ChevronLeft, Terminal, MapPin, Zap, Database, Check, Settings,
    Store, Users, Factory, ShoppingBag
} from 'lucide-react';
import { playNeonClick } from '../utils/audio';
import { DobermanBadge } from '../components/DobermanBadge';
import { TRASLASIERRA_REGION } from '../data/regionalTemplates/traslasierraConfig';

export const RegionMasterPanelPage: React.FC = () => {
    const { regionId } = useParams<{ regionId: string }>();
    const navigate = useNavigate();
    const [isInjecting, setIsInjecting] = useState(false);

    // En un futuro, se puede buscar de Firebase. Por ahora, mock para Traslasierra.
    const regionData = regionId === 'traslasierra' ? TRASLASIERRA_REGION : null;

    const zoneColor = regionData?.themeColor || '#0ea5e9';
    const zoneName = regionData?.name || 'Región Desconocida';

    const hexToRgba = (hex: string, alpha: number) => {
        try {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        } catch { return `rgba(14, 165, 233, ${alpha})`; }
    };

    const injectRegionData = async () => {
        if (!regionData) return;
        const confirmed = window.confirm(
            `⚠️ INYECCIÓN REGIONAL\n\n¿Estás seguro de inyectar las configuraciones y rubros a todos los nodos de:\n\n"${zoneName}"\n\nEsto afectará a ${regionData.towns.length} localidades.`
        );
        if (!confirmed) return;

        setIsInjecting(true);
        try {
            // Aquí iría la lógica para inyectar los documentos en Firebase
            // simulamos el delay
            await new Promise(r => setTimeout(r, 2000));
            alert(`✅ ¡ÉXITO! Configuraciones inyectadas en los nodos: ${regionData.towns.map(t => t.name).join(', ')}`);
        } catch (error: any) {
            alert("❌ ERROR: " + error.message);
        } finally {
            setIsInjecting(false);
        }
    };

    if (!regionData) {
        return <div className="text-white p-10">Región no encontrada.</div>;
    }

    return (
        <div className="min-h-screen bg-black text-white pb-24 relative overflow-hidden selection:bg-cyan-500/30">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none z-0 bg-black">
                {/* Resplandor principal superior */}
                <div 
                    className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full blur-[120px] opacity-60"
                    style={{ backgroundColor: hexToRgba(zoneColor, 0.15) }}
                />
                {/* Resplandor secundario inferior (tono tierra/montaña para Traslasierra) */}
                {regionId === 'traslasierra' && (
                    <div 
                        className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[100px] opacity-50"
                        style={{ backgroundColor: hexToRgba('#16a34a', 0.12) }}
                    />
                )}
                {/* Grilla tecnológica */}
                <div 
                    className="absolute inset-0"
                    style={{ backgroundImage: `linear-gradient(${hexToRgba(zoneColor, 0.04)} 1px, transparent 1px), linear-gradient(90deg, ${hexToRgba(zoneColor, 0.04)} 1px, transparent 1px)`, backgroundSize: '40px 40px' }}
                />
                {/* Textura sutil de ruido para darle un toque "táctico" */}
                <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }} />
            </div>

            <div 
                className="backdrop-blur-xl border-b pt-10 pb-6 px-6 relative z-10 sticky top-0 shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
                style={{ 
                    background: 'rgba(24,24,27,0.80)',
                    borderBottomColor: hexToRgba(zoneColor, 0.3)
                }}
            >
                <div role="button" tabIndex={0} onClick={() => { playNeonClick(); navigate('/'); }} className="absolute top-10 left-6 hover:opacity-70 cursor-pointer" style={{ color: zoneColor }}>
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
                
                {/* 🛡️ INYECCIÓN MASIVA */}
                <div 
                    role="button" tabIndex={0}
                    onClick={injectRegionData} 
                    className={`w-full ${isInjecting ? 'bg-red-800' : 'bg-red-600/90 hover:bg-red-500'} text-white p-4 rounded-xl font-[1000] uppercase tracking-widest shadow-[0_0_20px_rgba(220,38,38,0.3)] border border-red-500/50 active:scale-95 transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer`}
                >
                    <div className="flex items-center gap-2 pointer-events-none">
                        <Database size={14} className="text-white/80" />
                        <span className="text-[14px]">{isInjecting ? 'INJECTANDO...' : 'INJECT DATA REGIONAL'}</span>
                    </div>
                    <span className="text-[8px] text-red-200 pointer-events-none">INYECCIÓN DE CONFIGURACIÓN A TODOS LOS NODOS</span>
                </div>

                {/* SELECTORES DE ADN ZONAL (NODOS DEL VALLE) 🧬 */}
                <div>
                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
                        <MapPin size={12} /> Nodos de la Región
                    </h2>
                    <div className="grid grid-cols-2 gap-3 mb-2 animate-in fade-in slide-in-from-top-4 duration-1000">
                        {regionData.towns.map((town) => (
                            <button 
                                key={town.id}
                                onClick={() => { playNeonClick(); navigate(`/${town.id}/tablero-maestro`); }}
                                className="py-6 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2 group bg-zinc-900/50 border-white/5 hover:border-cyan-500/50 hover:bg-cyan-500/10"
                            >
                                <MapPin size={24} className="text-white/40 group-hover:text-cyan-400 transition-colors" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 group-hover:text-white transition-colors text-center px-2">
                                    {town.name}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* ═══════════════════════════════════════════ */}
                {/* ⚡ TÉRMICAS DE GESTIÓN AUTÓNOMA (4 NODOS)  */}
                {/* ═══════════════════════════════════════════ */}
                <section className="mt-8">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
                        <Terminal size={12} /> Térmicas de Gestión Autónoma
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* 🟡 GESTOR DE COMERCIOS */}
                        <div 
                            role="button" tabIndex={0}
                            onClick={() => { playNeonClick(); navigate(`/${regionData?.towns[0].id}/embajador/gestion`); }} 
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
                            onClick={() => { playNeonClick(); navigate(`/${regionData?.towns[0].id}/embajador/clientes`); }} 
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
                            onClick={() => { playNeonClick(); navigate(`/${regionData?.towns[0].id}/embajador/empresas`); }} 
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
                            onClick={() => { playNeonClick(); navigate(`/${regionData?.towns[0].id}/embajador/facturacion`); }} 
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

                {/* 🛡️ ACCESO DIRECTO AL BÚNKER CENTRAL (Solo Director) */}
                <div 
                    role="button" tabIndex={0}
                    onClick={() => { playNeonClick(); navigate(`/${regionData?.towns[0].id}/bunker-waly`); }}
                    className="w-full glass-card-neon text-white p-5 rounded-2xl font-[1000] uppercase tracking-widest border border-violet-500/40 hover:border-violet-400 active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer shadow-[0_0_30px_rgba(139,92,246,0.2)] relative overflow-hidden group mt-10"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-500/0 via-white/5 to-violet-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                    <Zap size={18} className="text-violet-400" />
                    <span className="text-[13px] text-violet-300">Búnker Central · ARI</span>
                </div>

                {/* 🛡️ ACCESO DIRECTO AL BÚNKER INDUSTRIAL */}
                <div 
                    role="button" tabIndex={0}
                    onClick={() => { 
                        playNeonClick(); 
                        navigate('/empresas/tablero-maestro?provincia=cordoba'); 
                    }}
                    className="w-full glass-card-neon text-white p-5 rounded-2xl font-[1000] uppercase tracking-widest border border-cyan-500/40 hover:border-cyan-400 active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer shadow-[0_0_30px_rgba(6,182,212,0.2)] relative overflow-hidden group mt-4"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-white/5 to-cyan-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                    <Terminal size={18} className="text-cyan-400" />
                    <span className="text-[13px] text-cyan-300">BÚNKER INDUSTRIAL (B2B)</span>
                </div>
            </div>
        </div>
    );
};

export default RegionMasterPanelPage;
