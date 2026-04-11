import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
    Megaphone, Users, Factory, Calendar, Clock, Image as ImageIcon, 
    Link as LinkIcon, Send, Save, CheckCircle, AlertTriangle, ChevronLeft, Zap, Target
} from 'lucide-react';
import { playNeonClick } from '../utils/audio';

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

    const [audience, setAudience] = useState<AudienceType>('clientes');
    const [campaignType, setCampaignType] = useState<CampaignType>('persuasion');
    const [message, setMessage] = useState('');
    const [title, setTitle] = useState('');
    const [mediaUrl, setMediaUrl] = useState('');
    const [attachCatalog, setAttachCatalog] = useState(true);
    const [scheduledDate, setScheduledDate] = useState('');
    
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);

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

        // In a real implementation this would go to Firestore -> collection('marketing_campaigns')
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

    return (
        <div className="min-h-screen bg-black text-white pb-24 relative overflow-hidden transition-colors duration-1000">
            {/* Background HUD Dynamic */}
            <div className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-1000">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full blur-[100px] transition-colors duration-1000" style={{ backgroundColor: hexToRgba(themeColor, 0.08) }} />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full blur-[100px] transition-colors duration-1000" style={{ backgroundColor: hexToRgba(themeColor, 0.05) }} />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
            </div>

            {/* Header */}
            <div className="bg-zinc-900/50 backdrop-blur-md pt-8 pb-6 px-6 flex flex-col items-center border-b mb-6 sticky top-0 z-50 transition-colors duration-1000" style={{ borderColor: hexToRgba(themeColor, 0.2) }}>
                <button onClick={() => { playNeonClick(); navigate(basePath); }}
                    className="self-start mb-4 w-10 h-10 rounded-2xl flex items-center justify-center border transition-all"
                    style={{ backgroundColor: hexToRgba(themeColor, 0.1), borderColor: hexToRgba(themeColor, 0.3), color: themeColor }}>
                    <ChevronLeft size={20} />
                </button>
                <Megaphone size={28} className="mb-2 transition-colors duration-1000" style={{ color: themeColor, filter: `drop-shadow(0 0 15px ${hexToRgba(themeColor, 0.6)})` }} />
                <h1 className="text-[18px] font-black text-white uppercase tracking-[0.2em] text-center" style={{ textShadow: `0 0 10px ${hexToRgba(themeColor, 0.4)}` }}>
                    Panel de Marketing
                </h1>
                <p className={`text-[8px] font-bold uppercase tracking-widest mt-1 italic transition-colors duration-1000 ${textTheme}`}>
                    Cerebro B2C / B2B · {headerTitle}
                </p>
            </div>

            <div className="px-5 space-y-6 relative z-10 max-w-lg mx-auto">
                
                {/* ─── SELECTOR DE AUDIENCIA ─── */}
                <div className={`glass-card-3d bg-white/[0.02] border rounded-2xl p-5 transition-colors duration-1000 ${borderTheme}`}>
                    <h3 className={`text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2 ${textTheme}`}>
                        <Users size={14} /> Foco de Audiencia (Targeting)
                    </h3>
                    <div className="flex bg-black/40 rounded-xl p-1 border border-white/5 relative">
                        <button 
                            onClick={() => { playNeonClick(); setAudience('clientes'); }}
                            className={`flex-1 py-3 flex items-center justify-center gap-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all z-10
                                ${audience === 'clientes' ? 'text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]' : 'text-white/40 hover:text-white/80'}`}
                            style={{ backgroundColor: audience === 'clientes' ? '#06b6d4' : 'transparent' }}
                        >
                            <Users size={14} /> Clientes B2C
                        </button>
                        <button 
                            onClick={() => { playNeonClick(); setAudience('comerciantes'); }}
                            className={`flex-1 py-3 flex items-center justify-center gap-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all z-10
                                ${audience === 'comerciantes' ? 'text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]' : 'text-white/40 hover:text-white/80'}`}
                            style={{ backgroundColor: audience === 'comerciantes' ? '#f59e0b' : 'transparent' }}
                        >
                            <Factory size={14} /> Comerciantes B2B
                        </button>
                    </div>
                </div>

                {/* ─── CONSTRUCTOR DE CAMPAÑA ─── */}
                <div className={`glass-card-3d bg-gradient-to-br ${themeGradient} border rounded-2xl p-5 transition-colors duration-1000 ${borderTheme}`}>
                    <h3 className={`text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2 text-white`}>
                        <Zap size={14} /> Motor de Propulsión
                    </h3>

                    {/* Tipos de Campaña */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                        {[
                            { id: 'persuasion', label: 'Persuasión', icon: <Target size={12} /> },
                            { id: 'fidelizacion', label: 'Fidelización', icon: <CheckCircle size={12} /> },
                            { id: 'informativa', label: 'Informativa', icon: <AlertTriangle size={12} /> }
                        ].map(type => (
                            <button key={type.id} onClick={() => { playNeonClick(); setCampaignType(type.id as CampaignType); }}
                                className={`py-2 rounded-lg border text-[8px] font-black uppercase tracking-widest flex flex-col items-center gap-1 transition-all
                                    ${campaignType === type.id 
                                        ? `bg-black/60 border-${audience==='clientes'?'cyan':'amber'}-500/50 ${textTheme}` 
                                        : 'bg-black/20 border-white/10 text-white/40 hover:bg-black/40'}`}>
                                {type.icon}
                                {type.label}
                            </button>
                        ))}
                    </div>

                    {/* Inputs */}
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

                        {/* Media Hub */}
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

                        {/* Catalog Toggle */}
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
                                className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${attachCatalog ? (audience==='clientes'?'bg-cyan-500':'bg-amber-500') : 'bg-white/10'}`}>
                                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-300 ${attachCatalog ? 'left-[22px]' : 'left-0.5'}`} />
                            </button>
                        </div>
                    </div>
                    
                    {/* Bot Triggers */}
                    <div className="flex gap-3 mt-5">
                        <button onClick={handleSave} className="flex-1 bg-black/40 border border-white/10 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-black/60 transition-colors uppercase font-black text-[9px] tracking-widest text-white/70 hover:text-white">
                            <Save size={14} /> Programar
                        </button>
                        <button onClick={handleFireNow} className={`flex-[1.5] py-3 rounded-xl flex items-center justify-center gap-2 transition-all uppercase font-black text-[10px] tracking-[0.2em] shadow-[0_0_20px_${hexToRgba(themeColor, 0.3)}]`}
                            style={{ backgroundColor: themeColor, color: '#000' }}>
                            <Send size={14} /> Disparar Ya
                        </button>
                    </div>
                </div>

                {/* ─── CALENDARIO DE CAMPAÑAS ─── */}
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
            
            {/* Footer */}
            <footer className={`w-full flex-col flex items-center gap-2 pt-8 pb-6 mt-8 border-t transition-colors duration-1000 relative z-10 ${borderTheme}`}>
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
