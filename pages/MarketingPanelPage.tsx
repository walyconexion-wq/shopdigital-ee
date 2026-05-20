import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
    Megaphone, Users, Factory, Calendar, Clock, Image as ImageIcon, 
    Link as LinkIcon, Send, Save, CheckCircle, AlertTriangle, ChevronLeft, Zap, Target,
    Share2, Copy, Check, ExternalLink, Globe, Store, Tag, ShoppingBag, Plus, Trash2, Smartphone, Database
} from 'lucide-react';
import { playNeonClick } from '../utils/audio';
import { AriMerchantAssistant } from '../components/AriMerchantAssistant';
import { Shop } from '../types';

type AudienceType = 'clientes' | 'comerciantes';
type CampaignType = 'persuasion' | 'fidelizacion' | 'informativa';

interface Campaign {
    id: string;
    title: string;
    audience: AudienceType;
    type: CampaignType;
    message: string;
    mediaUrl: string;
    attachCatalog: boolean;
    date: string;
    status: 'scheduled' | 'sent';
}

const MarketingPanelPage: React.FC = () => {
    const navigate = useNavigate();
    const params = useParams<{ townId?: string }>();
    
    // Determine context based on URL: /empresas/marketing-inteligente or /:townId/marketing-inteligente
    const isEnterprisePath = window.location.pathname.startsWith('/empresas');
    const basePath = isEnterprisePath ? '/empresas/control-maestro' : `/${params.townId}/tablero-maestro`;
    const headerTitle = isEnterprisePath ? 'Marketing Industrial' : 'Marketing Zonal';
    const townId = params.townId || 'esteban-echeverria';

    // State for tabs navigation
    const [activeTab, setActiveTab] = useState<'automatizador' | 'lanzamiento' | 'bases'>('automatizador');

    // ⏱️ Reloj en tiempo real
    const [now, setNow] = useState(new Date());
    const [colonVisible, setColonVisible] = useState(true);
    useEffect(() => {
        const timer = setInterval(() => {
            setNow(new Date());
            setColonVisible(v => !v);
        }, 1000);
        return () => clearInterval(timer);
    }, []);
    const timeStr = now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    const dateStr = now.toLocaleDateString('es-AR', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();

    const [audience, setAudience] = useState<AudienceType>('clientes');
    const [campaignType, setCampaignType] = useState<CampaignType>('persuasion');
    const [message, setMessage] = useState('');
    const [title, setTitle] = useState('');
    const [mediaUrl, setMediaUrl] = useState('');
    const [attachCatalog, setAttachCatalog] = useState(true);
    const [scheduledDate, setScheduledDate] = useState('');
    
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [copiedPath, setCopiedPath] = useState<string | null>(null);

    // Bases of contacts & Social configs (localStorage storage)
    const [b2cContacts, setB2cContacts] = useState<string>(() => {
        return localStorage.getItem('marketing_b2c_contacts') || '1123456789, 1198765432';
    });
    const [b2bContacts, setB2bContacts] = useState<string>(() => {
        return localStorage.getItem('marketing_b2b_contacts') || '1133334444, 1155556666';
    });
    const [instagramLink, setInstagramLink] = useState(() => localStorage.getItem('marketing_ig_link') || '');
    const [facebookLink, setFacebookLink] = useState(() => localStorage.getItem('marketing_fb_link') || '');
    const [tiktokLink, setTiktokLink] = useState(() => localStorage.getItem('marketing_tk_link') || '');
    const [whatsappLink, setWhatsappLink] = useState(() => localStorage.getItem('marketing_wa_link') || '');

    // Aesthetics based on audience
    const themeColor = audience === 'clientes' ? '#06b6d4' : '#f59e0b'; // Cyan for Clientes, Amber for Comerciantes
    const themeGradient = audience === 'clientes' ? 'from-cyan-500/20 to-blue-600/20' : 'from-amber-500/20 to-orange-600/20';
    const borderTheme = audience === 'clientes' ? 'border-cyan-500/30' : 'border-amber-500/30';
    const textTheme = audience === 'clientes' ? 'text-cyan-400' : 'text-amber-400';
    const buttonBgHover = audience === 'clientes' ? 'hover:bg-cyan-500/20' : 'hover:bg-amber-500/20';

    const hexToRgba = (hex: string, alpha: number) => {
        try {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        } catch { return `rgba(6, 182, 212, ${alpha})`; }
    };

    const handleSave = () => {
        playNeonClick();
        if (!title || !message) {
            alert("El título y mensaje son obligatorios.");
            return;
        }
        
        const newCamp: Campaign = {
            id: Date.now().toString(),
            title,
            audience,
            type: campaignType,
            message,
            mediaUrl,
            attachCatalog,
            date: scheduledDate || new Date().toISOString().split('T')[0],
            status: 'scheduled'
        };

        setCampaigns([...campaigns, newCamp]);
        
        // Reset form
        setTitle('');
        setMessage('');
        setMediaUrl('');
    };

    const handleFireNow = () => {
        playNeonClick();
        if (!title || !message) {
            alert("El título y mensaje son obligatorios para disparar el evento.");
            return;
        }
        if (window.confirm("¿Estás seguro de disparar esta campaña AHORA MISMO a los grupos de WhatsApp?")) {
            alert(`🚀 ¡Campaña disparada con éxito al gremio de ${audience}!`);
        }
    };

    // Public pages to share
    const publicPages = [
        { title: 'Landing Nosotros', desc: 'Presentación de la empresa', path: `/${townId}/nosotros`, icon: <Globe size={18} />, color: 'cyan', target: 'clientes' as AudienceType },
        { title: 'Landing Unirse', desc: 'Registro para comercios / Embajador', path: `/${townId}/unirse`, icon: <Store size={18} />, color: 'amber', target: 'comerciantes' as AudienceType },
        { title: 'Landing Descubrir', desc: 'Presentación para Clientes B2C', path: `/${townId}/descubrir`, icon: <Users size={18} />, color: 'cyan', target: 'clientes' as AudienceType },
        { title: 'Ofertas B2B Red', desc: 'Descuentos exclusivos entre comercios', path: `/${townId}/red-comercial/descuentos`, icon: <Tag size={18} />, color: 'amber', target: 'comerciantes' as AudienceType },
        { title: 'Ofertas B2C VIP', desc: 'Ofertas para red de clientes locales', path: `/${townId}/red-comercial/ofertas`, icon: <ShoppingBag size={18} />, color: 'cyan', target: 'clientes' as AudienceType },
        { title: 'Reclutamiento Público', desc: 'Formulario inicial (Paso 1)', path: `/${townId}/reclutamiento`, icon: <Globe size={18} />, color: 'violet', target: 'comerciantes' as AudienceType },
        { title: 'Directorio Industrial', desc: 'Portal B2B de Proveedores y Mayoristas', path: `/empresas`, icon: <Factory size={18} />, color: 'amber', target: 'comerciantes' as AudienceType },
    ];

    const handleShare = async (path: string, titleStr: string, desc: string) => {
        playNeonClick();
        const url = `${window.location.origin}${path}`;
        const text = `${desc}\n\n👉 ${url}`;
        
        if (navigator.share) {
            try {
                await navigator.share({ title: titleStr, text, url });
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

    // Auto-compose helper
    const autoRedactarCampania = (titleStr: string, path: string, target: AudienceType) => {
        playNeonClick();
        setAudience(target);
        setTitle(`Campaña: ${titleStr}`);
        const fullUrl = `${window.location.origin}${path}`;
        setMessage(`¡Hola! Te invitamos a conocer nuestra nueva sección: ${titleStr}.\n${target === 'clientes' ? 'Disfrutá de las mejores ofertas locales.' : 'Conectá tu comercio y potenciá tus ventas.'}\n\nAccedé aquí 👉 ${fullUrl}`);
        setActiveTab('automatizador');
    };

    // Save Databases & Networks
    const handleSaveBases = () => {
        playNeonClick();
        localStorage.setItem('marketing_b2c_contacts', b2cContacts);
        localStorage.setItem('marketing_b2b_contacts', b2bContacts);
        localStorage.setItem('marketing_ig_link', instagramLink);
        localStorage.setItem('marketing_fb_link', facebookLink);
        localStorage.setItem('marketing_tk_link', tiktokLink);
        localStorage.setItem('marketing_wa_link', whatsappLink);
        alert('💾 ¡Configuración de Bases y Redes guardada correctamente!');
    };

    // Dummy Shop object for the ARI assistant widget
    const marketingShop = useMemo<Shop>(() => ({
        id: 'marketing-central',
        slug: 'marketing-central',
        name: isEnterprisePath ? 'Marketing Industrial' : 'Marketing Zonal',
        entityType: isEnterprisePath ? 'enterprise' : 'shop',
        isActive: true,
        visits: 0,
        subscribers: 0,
        offers: [],
        address: '',
        category: '',
        phone: '',
        whatsapp: '',
        instagram: '',
        facebook: '',
        tiktok: '',
        website: '',
        mapUrl: '',
        rating: 5,
        specialty: 'Marketing Inteligente',
        image: '',
        bannerImage: '',
        createdAt: new Date().toISOString()
    } as any), [isEnterprisePath]);

    return (
        <div className="min-h-screen bg-black text-white pb-24 relative overflow-hidden transition-colors duration-1000">


            {/* ════════════ FONDO TECNOLÓGICO PREMIUM ════════════ */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                {/* Base oscura */}
                <div className="absolute inset-0 bg-[#020810]"></div>
                {/* Gradiente radial central */}
                <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(6,182,212,0.07) 0%, transparent 70%)' }} />
                {/* Grid de circuitos fino */}
                <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(6,182,212,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.04) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
                {/* Grid secundario más grueso */}
                <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(6,182,212,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.08) 1px, transparent 1px)', backgroundSize: '160px 160px' }} />
                {/* Punto de intersección (nodos de circuito) */}
                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, rgba(6,182,212,0.15) 1px, transparent 1px)', backgroundSize: '160px 160px' }} />
                {/* Glow orbs de color según audiencia */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] transition-colors duration-1000" style={{ backgroundColor: hexToRgba(themeColor, 0.07) }} />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-[120px] transition-colors duration-1000" style={{ backgroundColor: hexToRgba(themeColor, 0.05) }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full blur-[80px] bg-emerald-500/5" />
                {/* Scanline sutil */}
                <div className="absolute inset-0" style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.08) 3px, rgba(0,0,0,0.08) 4px)' }} />
            </div>
            {/* ════════════ HEADER — BÚNKER DE PUBLICIDAD ════════════ */}
            <div
                className="backdrop-blur-xl pt-6 pb-5 px-5 flex flex-col items-center border-b mb-6 sticky top-0 z-50 transition-colors duration-1000 relative overflow-hidden"
                style={{ 
                    background: `linear-gradient(135deg, rgba(2,8,16,0.94) 0%, ${hexToRgba(themeColor, 0.06)} 100%)`,
                    borderColor: hexToRgba(themeColor, 0.25),
                    boxShadow: `0 4px 40px ${hexToRgba(themeColor, 0.12)}, 0 1px 0 ${hexToRgba(themeColor, 0.2)}`
                }}
            >
                {/* Línea de acento superior */}
                <div className="absolute top-0 left-0 right-0 h-[2px] transition-colors duration-1000" style={{ background: `linear-gradient(90deg, transparent, ${themeColor}, transparent)` }} />
                {/* Grid interno del header */}
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

                {/* Fila superior: botón volver + reloj + badge */}
                <div className="w-full flex items-center justify-between mb-3 relative z-10">
                    <button onClick={() => { playNeonClick(); navigate(basePath); }}
                        className="w-9 h-9 rounded-xl flex items-center justify-center border transition-all hover:scale-110 active:scale-95"
                        style={{ backgroundColor: hexToRgba(themeColor, 0.1), borderColor: hexToRgba(themeColor, 0.3), color: themeColor }}>
                        <ChevronLeft size={18} />
                    </button>

                    {/* ⏱️ RELOJ DIGITAL */}
                    <div className="flex flex-col items-center gap-0.5">
                        <div
                            className="font-mono font-black tracking-[0.1em] leading-none"
                            style={{ 
                                fontSize: '20px',
                                color: themeColor,
                                textShadow: `0 0 20px ${hexToRgba(themeColor, 0.8)}, 0 0 40px ${hexToRgba(themeColor, 0.4)}`
                            }}
                        >
                            {timeStr.slice(0,2)}
                            <span style={{ opacity: colonVisible ? 1 : 0.15, transition: 'opacity 0.1s' }}>:</span>
                            {timeStr.slice(3,5)}
                            <span style={{ fontSize: '13px', opacity: 0.55 }}>:{timeStr.slice(6,8)}</span>
                        </div>
                        <span className="text-[7px] font-black uppercase tracking-[0.15em] opacity-50" style={{ color: themeColor }}>{dateStr}</span>
                    </div>

                    {/* 🟢 BADGE SISTEMA ONLINE */}
                    <div className="flex items-center gap-1.5 bg-black/50 border border-emerald-500/30 rounded-full px-2 py-1.5 backdrop-blur-sm">
                        <div className="relative flex h-2 w-2 flex-shrink-0">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </div>
                        <span className="text-[6.5px] font-black uppercase tracking-[0.12em] text-emerald-400" style={{ textShadow: '0 0 8px rgba(52,211,153,0.6)' }}>ONLINE</span>
                    </div>
                </div>

                {/* Centro: Ícono + Título */}
                <div className="flex flex-col items-center gap-1 relative z-10">
                    <div className="relative mb-0.5">
                        <Megaphone size={28} className="transition-colors duration-1000" style={{ color: themeColor, filter: `drop-shadow(0 0 16px ${hexToRgba(themeColor, 0.7)})` }} />
                    </div>
                    <h1 className="text-[16px] font-black text-white uppercase tracking-[0.22em] text-center" style={{ textShadow: `0 0 20px ${hexToRgba(themeColor, 0.5)}` }}>
                        Búnker de Publicidad
                    </h1>
                    <p className={`text-[8px] font-bold uppercase tracking-[0.25em] mt-0.5 transition-colors duration-1000 ${textTheme}`}>
                        Inteligente · {headerTitle} · Cañón Activo 🚀
                    </p>
                </div>
            </div>

            <div className="px-5 space-y-6 relative z-10 max-w-lg mx-auto">
                
                {/* ─── TAB NAVIGATION ─── */}
                <div className={`flex bg-zinc-900/60 backdrop-blur-md rounded-2xl p-1 border transition-colors duration-1000 ${borderTheme}`}>
                    <button
                        onClick={() => { playNeonClick(); setActiveTab('automatizador'); }}
                        className={`flex-1 py-3.5 flex flex-col items-center justify-center gap-1 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer
                            ${activeTab === 'automatizador' ? 'text-black shadow-lg font-black' : 'text-white/40 hover:text-white/80'}`}
                        style={{ backgroundColor: activeTab === 'automatizador' ? themeColor : 'transparent' }}
                    >
                        <Zap size={14} />
                        <span>🤖 Automatizador</span>
                    </button>
                    <button
                        onClick={() => { playNeonClick(); setActiveTab('lanzamiento'); }}
                        className={`flex-1 py-3.5 flex flex-col items-center justify-center gap-1 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer
                            ${activeTab === 'lanzamiento' ? 'text-black shadow-lg font-black' : 'text-white/40 hover:text-white/80'}`}
                        style={{ backgroundColor: activeTab === 'lanzamiento' ? themeColor : 'transparent' }}
                    >
                        <Send size={14} />
                        <span>🚀 Lanzamientos</span>
                    </button>
                    <button
                        onClick={() => { playNeonClick(); setActiveTab('bases'); }}
                        className={`flex-1 py-3.5 flex flex-col items-center justify-center gap-1 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer
                            ${activeTab === 'bases' ? 'text-black shadow-lg font-black' : 'text-white/40 hover:text-white/80'}`}
                        style={{ backgroundColor: activeTab === 'bases' ? themeColor : 'transparent' }}
                    >
                        <Database size={14} />
                        <span>📋 Bases & Redes</span>
                    </button>
                </div>

                {/* ─── TAB 1: AUTOMATIZADOR DE CAMPAÑAS ─── */}
                {activeTab === 'automatizador' && (
                    <div className="space-y-6">
                        {/* Selector de Foco */}
                        <div className={`glass-card-3d bg-white/[0.02] border rounded-2xl p-5 transition-colors duration-1000 ${borderTheme}`}>
                            <h3 className={`text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2 ${textTheme}`}>
                                <Users size={14} /> Foco de Audiencia (Targeting)
                            </h3>
                            <div className="flex bg-black/40 rounded-xl p-1 border border-white/5 relative">
                                <button 
                                    onClick={() => { playNeonClick(); setAudience('clientes'); }}
                                    className={`flex-1 py-3 flex items-center justify-center gap-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all z-10 cursor-pointer
                                        ${audience === 'clientes' ? 'text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]' : 'text-white/40 hover:text-white/80'}`}
                                    style={{ backgroundColor: audience === 'clientes' ? '#06b6d4' : 'transparent' }}
                                >
                                    <Users size={14} /> Clientes B2C
                                </button>
                                <button 
                                    onClick={() => { playNeonClick(); setAudience('comerciantes'); }}
                                    className={`flex-1 py-3 flex items-center justify-center gap-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all z-10 cursor-pointer
                                        ${audience === 'comerciantes' ? 'text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]' : 'text-white/40 hover:text-white/80'}`}
                                    style={{ backgroundColor: audience === 'comerciantes' ? '#f59e0b' : 'transparent' }}
                                >
                                    <Factory size={14} /> Comerciantes B2B
                                </button>
                            </div>
                        </div>

                        {/* Constructor */}
                        <div className={`glass-card-3d bg-gradient-to-br ${themeGradient} border rounded-2xl p-5 transition-colors duration-1000 ${borderTheme}`}>
                            <h3 className={`text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2 text-white`}>
                                <Zap size={14} /> Motor de Propulsión
                            </h3>

                            <div className="grid grid-cols-3 gap-2 mb-4">
                                {[
                                    { id: 'persuasion', label: 'Persuasión', icon: <Target size={12} /> },
                                    { id: 'fidelizacion', label: 'Fidelización', icon: <CheckCircle size={12} /> },
                                    { id: 'informativa', label: 'Informativa', icon: <AlertTriangle size={12} /> }
                                ].map(type => (
                                    <button key={type.id} onClick={() => { playNeonClick(); setCampaignType(type.id as CampaignType); }}
                                        className={`py-2 rounded-lg border text-[8px] font-black uppercase tracking-widest flex flex-col items-center gap-1 transition-all cursor-pointer
                                            ${campaignType === type.id 
                                                ? `bg-black/60 border-${audience==='clientes'?'cyan':'amber'}-500/50 ${textTheme}` 
                                                : 'bg-black/20 border-white/10 text-white/40 hover:bg-black/40'}`}>
                                        {type.icon}
                                        {type.label}
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <label className="text-[8px] font-black uppercase text-white/50 block mb-1">Título Interno</label>
                                    <input 
                                        type="text" placeholder="Ej: Oferta Finde Largo" value={title} onChange={e => setTitle(e.target.value)}
                                        className={`w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-[11px] text-white outline-none focus:border-${audience==='clientes'?'cyan':'amber'}-500/50 transition-colors`}
                                    />
                                </div>
                                
                                <div>
                                    <label className="text-[8px] font-black uppercase text-white/50 block mb-1">Cuerpo del Mensaje (Bot WhatsApp)</label>
                                    <textarea 
                                        rows={4} placeholder="Escribí el texto persuasivo acá..." value={message} onChange={e => setMessage(e.target.value)}
                                        className={`w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-[11px] text-white outline-none focus:border-${audience==='clientes'?'cyan':'amber'}-500/50 transition-colors resize-none`}
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <div className="flex-1">
                                        <label className="text-[8px] font-black uppercase text-white/50 block mb-1 flex items-center gap-1"><ImageIcon size={10}/> Link Media (Opcional)</label>
                                        <input 
                                            type="text" placeholder="https://..." value={mediaUrl} onChange={e => setMediaUrl(e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-[10px] text-white outline-none"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-[8px] font-black uppercase text-white/50 block mb-1 flex items-center gap-1"><Calendar size={10}/> Agendar Para</label>
                                        <input 
                                            type="date" value={scheduledDate} onChange={e => setScheduledDate(e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-[10px] text-white outline-none dark:[color-scheme:dark]"
                                        />
                                    </div>
                                </div>

                                <div className="bg-black/30 rounded-xl p-3 border border-white/5 flex items-center justify-between mt-2">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-6 h-6 rounded-md flex items-center justify-center ${textTheme} bg-black/50`}>
                                            <LinkIcon size={12} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-white uppercase tracking-wider">Adjuntar Catálogo</p>
                                            <p className="text-[7px] text-white/40 uppercase">Envía el link al Shop automáticamente</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setAttachCatalog(!attachCatalog)}
                                        className={`w-10 h-5 rounded-full relative transition-colors duration-300 cursor-pointer ${attachCatalog ? (audience==='clientes'?'bg-cyan-500':'bg-amber-500') : 'bg-white/10'}`}>
                                        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-300 ${attachCatalog ? 'left-[22px]' : 'left-0.5'}`} />
                                    </button>
                                </div>
                            </div>
                            
                            <div className="flex gap-3 mt-5">
                                <button onClick={handleSave} className="flex-1 bg-black/40 border border-white/10 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-black/60 transition-colors uppercase font-black text-[9px] tracking-widest text-white/70 hover:text-white cursor-pointer">
                                    <Save size={14} /> Programar
                                </button>
                                <button onClick={handleFireNow} className={`flex-[1.5] py-3 rounded-xl flex items-center justify-center gap-2 transition-all uppercase font-black text-[10px] tracking-[0.2em] shadow-[0_0_20px_${hexToRgba(themeColor, 0.3)}] cursor-pointer`}
                                    style={{ backgroundColor: themeColor, color: '#000' }}>
                                    <Send size={14} /> Disparar Ya
                                </button>
                            </div>
                        </div>

                        {/* Cola de Distribución */}
                        {campaigns.length > 0 && (
                            <div className={`glass-card-3d bg-white/[0.02] border rounded-2xl p-5 transition-colors duration-1000 ${borderTheme}`}>
                                <h3 className={`text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2 ${textTheme}`}>
                                    <Clock size={14} /> Cola de Distribución
                                </h3>
                                <div className="space-y-3">
                                    {campaigns.map(camp => (
                                        <div key={camp.id} className="bg-zinc-900/50 border border-white/5 rounded-xl p-3 flex flex-col gap-2 relative overflow-hidden">
                                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${camp.audience === 'clientes' ? 'bg-cyan-500' : 'bg-amber-500'}`} />
                                            <div className="flex justify-between items-start pl-2">
                                                <div>
                                                    <p className="text-[10px] font-black text-white uppercase">{camp.title}</p>
                                                    <p className="text-[8px] text-white/40 uppercase">{camp.date} · {camp.type}</p>
                                                </div>
                                                <div className="bg-black/50 px-2 py-1 rounded text-[7px] font-black uppercase tracking-widest" style={{ color: camp.audience === 'clientes' ? '#06b6d4' : '#f59e0b' }}>
                                                    {camp.audience === 'clientes' ? 'B2C' : 'B2B'}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ─── TAB 2: CENTRAL DE LANZAMIENTOS (ENLACES PÚBLICOS) ─── */}
                {activeTab === 'lanzamiento' && (
                    <div className="space-y-6">
                        {/* Interfaces Públicas */}
                        <div className={`glass-card-3d bg-white/[0.02] border rounded-2xl p-5 transition-colors duration-1000 ${borderTheme}`}>
                            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
                                <Globe size={12} /> Interfaces Públicas
                            </h2>
                            <div className="space-y-3">
                                {publicPages.map((page, idx) => {
                                    const colorMap: Record<string, { bg: string; border: string; text: string; hoverBorder: string }> = {
                                        cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-400/20', text: 'text-cyan-400', hoverBorder: 'hover:border-cyan-500/30' },
                                        amber: { bg: 'bg-amber-500/10', border: 'border-amber-400/20', text: 'text-amber-400', hoverBorder: 'hover:border-amber-500/30' },
                                        violet: { bg: 'bg-violet-500/10', border: 'border-violet-400/20', text: 'text-violet-400', hoverBorder: 'hover:border-violet-500/30' },
                                    };
                                    const c = colorMap[page.color] || colorMap.cyan;
                                    return (
                                        <div key={idx} className="bg-zinc-900/40 border border-white/10 rounded-2xl p-4 flex flex-col gap-3 hover:border-cyan-500/30 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center ${c.text} border ${c.border}`}>
                                                    {page.icon}
                                                </div>
                                                <div>
                                                    <h3 className="text-[12px] font-[1000] text-white uppercase tracking-wider">{page.title.toUpperCase()}</h3>
                                                    <p className="text-[9px] text-white/40 uppercase tracking-widest mt-0.5">{page.desc.toUpperCase()}</p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-3 gap-2 mt-2">
                                                <button 
                                                    onClick={() => { playNeonClick(); window.open(page.path, '_blank'); }}
                                                    className="bg-white/5 border border-white/10 py-2.5 rounded-xl flex items-center justify-center gap-1.5 text-[9px] uppercase font-black tracking-widest hover:bg-white/10 active:scale-95 transition-all text-white/80 cursor-pointer"
                                                >
                                                    <ExternalLink size={12} /> Ver App
                                                </button>
                                                <button 
                                                    onClick={() => handleShare(page.path, page.title, page.desc)}
                                                    className={`${c.bg} border ${c.border} py-2.5 rounded-xl flex items-center justify-center gap-1.5 text-[9px] uppercase font-black tracking-widest hover:bg-opacity-20 active:scale-95 transition-all ${c.text} cursor-pointer`}
                                                >
                                                    <Share2 size={12} /> Compartir
                                                </button>
                                                <button 
                                                    onClick={() => handleCopy(page.path)}
                                                    className={`${copiedPath === page.path ? 'bg-green-500/20 border-green-500/40 text-green-400' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'} border py-2.5 rounded-xl flex items-center justify-center gap-1.5 text-[9px] uppercase font-black tracking-widest active:scale-95 transition-all cursor-pointer`}
                                                >
                                                    {copiedPath === page.path ? <Check size={12} /> : <Copy size={12} />} 
                                                    {copiedPath === page.path ? 'Copiado' : 'Copiar'}
                                                </button>
                                            </div>
                                            <button 
                                                onClick={() => autoRedactarCampania(page.title, page.path, page.target)}
                                                className={`w-full ${c.bg} border ${c.border} py-2 rounded-xl flex items-center justify-center gap-2 text-[9px] uppercase font-black tracking-widest ${c.text} ${c.hoverBorder} active:scale-95 transition-all cursor-pointer mt-1`}
                                            >
                                                <Megaphone size={12} /> Redactar Campaña
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── TAB 3: BASES DE DATOS & CONFIG REDES ─── */}
                {activeTab === 'bases' && (
                    <div className="space-y-6">
                        {/* Bases de WhatsApp */}
                        <div className={`glass-card-3d bg-white/[0.02] border rounded-2xl p-5 transition-colors duration-1000 ${borderTheme}`}>
                            <h3 className={`text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2 ${textTheme}`}>
                                <Smartphone size={14} /> Bases de Difusión WhatsApp
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[8px] font-black uppercase text-white/50 block mb-1">Destinatarios B2C (Teléfonos de Clientes)</label>
                                    <textarea 
                                        rows={3} 
                                        placeholder="Ej: 1123456789, 1198765432..." 
                                        value={b2cContacts} 
                                        onChange={e => setB2cContacts(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-[11px] text-white outline-none focus:border-cyan-500/50 transition-colors resize-none"
                                    />
                                    <span className="text-[7px] text-white/40 uppercase tracking-wider block mt-1">Números de teléfono separados por comas.</span>
                                </div>

                                <div>
                                    <label className="text-[8px] font-black uppercase text-white/50 block mb-1">Destinatarios B2B (Teléfonos de Comercios/Industrias)</label>
                                    <textarea 
                                        rows={3} 
                                        placeholder="Ej: 1133334444, 1155556666..." 
                                        value={b2bContacts} 
                                        onChange={e => setB2bContacts(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-[11px] text-white outline-none focus:border-amber-500/50 transition-colors resize-none"
                                    />
                                    <span className="text-[7px] text-white/40 uppercase tracking-wider block mt-1">Base de datos de comercios habilitados para campañas.</span>
                                </div>
                            </div>
                        </div>

                        {/* Redes Sociales Activas */}
                        <div className={`glass-card-3d bg-white/[0.02] border rounded-2xl p-5 transition-colors duration-1000 ${borderTheme}`}>
                            <h3 className={`text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2 ${textTheme}`}>
                                <Globe size={14} /> Redes Sociales de la Zona
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-[8px] font-black uppercase text-white/50 block mb-1">WhatsApp Link del Grupo / Canal</label>
                                    <input 
                                        type="text" 
                                        placeholder="https://chat.whatsapp.com/..." 
                                        value={whatsappLink} 
                                        onChange={e => setWhatsappLink(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-[10px] text-white outline-none focus:border-green-500/50 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="text-[8px] font-black uppercase text-white/50 block mb-1">Instagram de la Zona</label>
                                    <input 
                                        type="text" 
                                        placeholder="https://instagram.com/..." 
                                        value={instagramLink} 
                                        onChange={e => setInstagramLink(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-[10px] text-white outline-none focus:border-pink-500/50 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="text-[8px] font-black uppercase text-white/50 block mb-1">Facebook Zonal</label>
                                    <input 
                                        type="text" 
                                        placeholder="https://facebook.com/..." 
                                        value={facebookLink} 
                                        onChange={e => setFacebookLink(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-[10px] text-white outline-none focus:border-blue-500/50 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="text-[8px] font-black uppercase text-white/50 block mb-1">TikTok Zonal</label>
                                    <input 
                                        type="text" 
                                        placeholder="https://tiktok.com/..." 
                                        value={tiktokLink} 
                                        onChange={e => setTiktokLink(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-[10px] text-white outline-none focus:border-violet-500/50 transition-colors"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Guardar Cambios */}
                        <button 
                            onClick={handleSaveBases}
                            className="w-full py-4 rounded-xl flex items-center justify-center gap-2 transition-all uppercase font-black text-[10px] tracking-[0.2em] shadow-[0_0_20px_rgba(255,255,255,0.05)] bg-white text-black hover:bg-white/90 cursor-pointer"
                        >
                            <Save size={14} /> Guardar Cambios en el Búnker
                        </button>
                    </div>
                )}
            </div>
            
            {/* ════════════ ARI INLINE — CEREBRO DEL BÚNKER ════════════ */}
            <div className="px-5 relative z-10 max-w-lg mx-auto mt-8 mb-6">
                {/* Separador con título de sección */}
                <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, transparent, ${hexToRgba(themeColor, 0.4)})` }} />
                    <div
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full border backdrop-blur-sm"
                        style={{ borderColor: hexToRgba(themeColor, 0.3), backgroundColor: hexToRgba(themeColor, 0.06) }}
                    >
                        <span className="text-[7px] font-black uppercase tracking-[0.3em]" style={{ color: themeColor }}>
                            ⚡ ARI · INTELIGENCIA DE CAMPAÑA
                        </span>
                    </div>
                    <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${hexToRgba(themeColor, 0.4)}, transparent)` }} />
                </div>

                {/* ARI Panel Inline — siempre abierto */}
                <AriMerchantAssistant 
                    inline={true}
                    role={isEnterprisePath ? 'industrial' : 'marketing'} 
                    shop={marketingShop} 
                    townId={townId}
                    publicPages={publicPages.map(p => ({ title: p.title, desc: p.desc, path: p.path, target: p.target }))}
                />
            </div>

            {/* Footer */}
            <footer className={`w-full flex-col flex items-center gap-2 pt-4 pb-8 border-t transition-colors duration-1000 relative z-10 ${borderTheme}`}>
                <p className="text-[9px] font-black text-white uppercase tracking-[0.35em] text-center select-none">
                    © 2026 · Automator Bot
                </p>
                <p className={`text-[8px] font-bold uppercase tracking-[0.25em] select-none transition-colors duration-1000 ${textTheme}`} style={{ textShadow: `0 0 10px ${hexToRgba(themeColor, 0.5)}` }}>
                    🚀 Departamento de Fidelización
                </p>
            </footer>
        </div>
    );
};

export default MarketingPanelPage;
