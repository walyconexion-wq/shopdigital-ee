import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Shop, ProductOffer } from '../types';
import { updateComercio } from '../firebase';
import { playNeonClick } from '../utils/audio';
import {
  ChevronLeft, Save, Image as ImageIcon,
  MapPin, Phone, Edit3, Trash2, Plus,
  Instagram, Facebook, LayoutDashboard,
  ShoppingCart, Palette, PenTool, ExternalLink,
  MessageSquare, Star
} from 'lucide-react';
import { useAuth } from '../components/AuthContext';
import { CATEGORIES } from '../constants';
import { useTownLocalities } from '../hooks/useTownLocalities';

interface ShopEditPageProps {
  allShops: Shop[];
}

const TABS = [
  { id: 'identidad', label: 'Identidad Visual', icon: <Palette size={14} /> },
  { id: 'contacto', label: 'Contacto & Mapa', icon: <MapPin size={14} /> },
  { id: 'ofertas', label: 'Catálogo Ofertas', icon: <ShoppingCart size={14} /> },
  { id: 'novedades', label: 'Muro Novedades', icon: <ImageIcon size={14} /> },
  { id: 'resenas', label: 'Gestión Reseñas', icon: <MessageSquare size={14} /> },
  { id: 'enlaces', label: 'Enlaces Exteriores', icon: <ExternalLink size={14} /> },
];

const THEME_COLORS = [
  { id: 'cyan', hex: '#22d3ee', name: 'Cyan ShopDigital' },
  { id: 'violet', hex: '#8b5cf6', name: 'Violeta Premium' },
  { id: 'rose', hex: '#f43f5e', name: 'Rojo Carmesí' },
  { id: 'emerald', hex: '#10b981', name: 'Verde Esmeralda' },
  { id: 'amber', hex: '#f59e0b', name: 'Ámbar Dorado' }
];

const ShopEditPage: React.FC<ShopEditPageProps> = ({ allShops }) => {
  const { townId = 'esteban-echeverria', shopId, shopSlug } = useParams<{ townId?: string; shopId?: string; shopSlug?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { localities } = useTownLocalities(townId);
  const ROOT_EMAIL = 'walyconexion@gmail.com';

  const [shop, setShop] = useState<Shop | null>(null);
  const [activeTab, setActiveTab] = useState('identidad');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if ((shopId || shopSlug) && allShops.length > 0) {
      const found = allShops.find(s => s.id === shopId || (s.slug && s.slug === shopSlug) || s.id === shopSlug);
      
      if (found) {
        // Validación de Seguridad Híbrida: si entra por la ruta del comerciante, exigimos match de Gmail
        if (shopSlug) {
           const userEmail = user?.email?.trim().toLowerCase();
           const authEmail = found.authorizedEmail?.trim().toLowerCase();
           if (!userEmail || (userEmail !== ROOT_EMAIL && userEmail !== authEmail)) {
              alert('🔒 Acceso Denegado. Solo el comerciante autorizado puede editar este perfil.');
              navigate(-1);
              return;
           }
        }
        setShop(JSON.parse(JSON.stringify(found))); // Eliminamos mutaciones de memoria
      }
    }
  }, [shopId, shopSlug, allShops, user, navigate]);

  const handleSave = async () => {
    if (!shop) return;
    setSaving(true);
    playNeonClick();
    try {
      // Inyectar townId si por alguna razón no lo tiene (seguridad extra) 🛡️
      const updatedShop = { ...shop, townId: shop.townId || townId };
      await updateComercio(shop.id, updatedShop);
      alert('¡Comercio actualizado con éxito!');
      navigate(-1);
    } catch (e: any) {
      alert('Error al guardar: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof Shop, value: any) => {
    if (!shop) return;
    
    // Extractor Inteligente de SRC para Mapas (Si pegan el Iframe completo)
    if (field === 'mapUrl' && typeof value === 'string' && value.includes('<iframe')) {
      const srcMatch = value.match(/src=["']([^"']+)["']/);
      if (srcMatch && srcMatch[1]) {
        value = srcMatch[1];
      }
    }

    setShop({ ...shop, [field]: value });
  };

  if (!shop) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-cyan-400 font-bold uppercase tracking-widest">
        <div className="animate-pulse">Cargando datos regionales...</div>
      </div>
    );
  }

  const isMiCatalogoRoute = window.location.pathname.includes('/mi-catalogo/');

  return (
    <div className="min-h-screen bg-[#030712] text-white pb-32 relative overflow-x-hidden selection:bg-violet-500/30">
      {/* Background Premium */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-15%] left-[-10%] w-[55vw] h-[55vw] bg-violet-600/8 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-cyan-600/6 rounded-full blur-[130px]" />
        <div className={`absolute top-[30%] right-[10%] w-[300px] h-[300px] rounded-full blur-[100px] opacity-10`} style={{ backgroundColor: shop.themeColor || '#22d3ee' }} />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      <div className="bg-black/70 backdrop-blur-2xl border-b border-violet-500/20 pt-10 pb-4 px-6 relative z-10 sticky top-0 shadow-[0_8px_32px_rgba(0,0,0,0.8),0_0_20px_rgba(139,92,246,0.08)] flex items-center justify-between">
        {!isMiCatalogoRoute ? (
          <button onClick={() => { playNeonClick(); navigate(-1); }} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/10 hover:border-violet-500/30">
            <ChevronLeft size={20} className="text-white/70" />
          </button>
        ) : <div className="w-10" />}
        <div className="flex flex-col items-center flex-1">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-2 border border-violet-500/30 shadow-[0_0_20px_rgba(139,92,246,0.2)]" style={{ background: `linear-gradient(135deg, ${shop.themeColor || '#8b5cf6'}22, transparent)` }}>
            <Edit3 size={20} style={{ color: shop.themeColor || '#8b5cf6' }} />
          </div>
          <h1 className="text-[13px] font-[1000] uppercase tracking-[0.15em] text-transparent bg-clip-text bg-gradient-to-r from-violet-300 via-white to-cyan-300 text-center leading-tight">
            Mi Catálogo Digital
          </h1>
          <p className="text-[8px] font-black uppercase tracking-[0.3em] mt-1 text-violet-400/50">
            {townId.replace(/-/g, ' ').toUpperCase()}
          </p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-gradient-to-r from-violet-600 to-violet-500 text-white px-5 py-2.5 rounded-2xl text-[9px] font-[1000] uppercase tracking-widest shadow-[0_4px_0_rgba(91,33,182,1),0_8px_20px_rgba(139,92,246,0.3)] active:translate-y-[4px] active:shadow-[0_0_0_rgba(91,33,182,1)] transition-all flex items-center gap-2 border border-violet-400/30"
        >
          {saving ? <span className="animate-pulse">...</span> : <><Save size={14} /> Guardar</>}
        </button>
      </div>

      {/* TABS NEÓN */}
      <div className="px-4 mt-6 relative z-10">
        <div className="grid grid-cols-2 gap-2.5 pb-4">
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { playNeonClick(); setActiveTab(tab.id); }}
                className={`flex items-center justify-center gap-2 py-3 px-2 rounded-2xl border text-[8px] font-[1000] uppercase tracking-widest transition-all duration-200
                  ${isActive 
                    ? 'bg-violet-500/15 border-violet-500/50 text-violet-300 shadow-[0_0_20px_rgba(139,92,246,0.2),inset_0_0_15px_rgba(139,92,246,0.05)]' 
                    : 'bg-white/[0.02] border-white/[0.06] text-white/30 hover:border-white/15 hover:text-white/50 hover:bg-white/[0.04]'
                  }`}
              >
                <span className={isActive ? 'text-violet-400' : 'text-white/20'}>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* CONTENT */}
      <div className="px-4 mt-6 relative z-10 max-w-lg mx-auto space-y-6">
        {activeTab === 'identidad' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            <div className="bg-white/[0.03] backdrop-blur-xl border border-violet-500/15 rounded-[1.5rem] p-5 space-y-5 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
              <h2 className="text-[11px] font-[1000] uppercase tracking-[0.2em] text-violet-400/70 border-b border-violet-500/10 pb-3 flex items-center gap-2">
                <PenTool size={14} /> Información Básica
              </h2>
              
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-widest text-violet-300/40 ml-1">Nombre del Local</label>
                <input 
                  type="text" 
                  value={shop.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full bg-black/40 border border-white/8 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-violet-500/50 focus:shadow-[0_0_15px_rgba(139,92,246,0.15)] transition-all placeholder-white/20"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-widest text-violet-300/40 ml-1">Categoría Principal</label>
                <select 
                  value={shop.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full bg-black/40 border border-white/8 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-violet-500/50 focus:shadow-[0_0_15px_rgba(139,92,246,0.15)] transition-all"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-white/[0.03] backdrop-blur-xl border border-violet-500/15 rounded-[1.5rem] p-5 space-y-5 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
              <h2 className="text-[11px] font-[1000] uppercase tracking-[0.2em] text-violet-400/70 border-b border-violet-500/10 pb-3 flex items-center gap-2">
                <ImageIcon size={14} /> Branding Visual
              </h2>
              
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-widest text-violet-300/40 ml-1">URL Foto Portada (Banner)</label>
                <input 
                  type="text" 
                  value={shop.bannerImage || ''}
                  onChange={(e) => handleInputChange('bannerImage', e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-black/40 border border-white/8 rounded-xl px-4 py-3.5 text-xs text-white focus:outline-none focus:border-violet-500/50 focus:shadow-[0_0_15px_rgba(139,92,246,0.15)] transition-all placeholder-white/20"
                />
                {shop.bannerImage && (
                  <div className="mt-3 h-28 rounded-xl overflow-hidden border border-violet-500/20 shadow-[0_4px_20px_rgba(0,0,0,0.5),0_0_15px_rgba(139,92,246,0.1)]">
                    <img src={shop.bannerImage} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="space-y-3 mt-4">
                <label className="text-[9px] font-bold uppercase tracking-widest text-violet-300/40 ml-1">Color de Tema (Personalización)</label>
                <div className="flex gap-3">
                  {THEME_COLORS.map(color => (
                    <button
                      key={color.id}
                      onClick={() => handleInputChange('themeColor', color.hex)}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${shop.themeColor === color.hex ? 'scale-110 shadow-[0_0_15px_currentColor]' : 'scale-90 opacity-50 border-transparent hover:scale-100 hover:opacity-100'}`}
                      style={{ backgroundColor: color.hex, borderColor: shop.themeColor === color.hex ? 'white' : 'transparent', color: color.hex }}
                    />
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}

        {activeTab === 'contacto' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="bg-white/[0.03] backdrop-blur-xl border border-violet-500/15 rounded-[1.5rem] p-5 space-y-5 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
              <h2 className="text-[11px] font-[1000] uppercase tracking-[0.2em] text-violet-400/70 border-b border-violet-500/10 pb-3 flex items-center gap-2">
                <MapPin size={14} /> Ubicación Geográfica
              </h2>

              {/* SELECT DE ZONA DINÁMICO 🛡️ */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-widest text-violet-300/40 ml-1">Zona / Localidad</label>
                <select 
                  value={shop.zone || ''}
                  onChange={(e) => handleInputChange('zone', e.target.value)}
                  className="w-full bg-black/40 border border-white/8 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-violet-500/50 focus:shadow-[0_0_15px_rgba(139,92,246,0.15)] transition-all"
                >
                  <option value="">Seleccioná una zona</option>
                  {localities.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                  <option value="Otra">Otra</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-widest text-violet-300/40 ml-1">Dirección Escrita</label>
                <input 
                  type="text" 
                  value={shop.address || ''}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Ej: Alem 123"
                  className="w-full bg-black/40 border border-white/8 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-violet-500/50 focus:shadow-[0_0_15px_rgba(139,92,246,0.15)] transition-all placeholder-white/20"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-widest text-violet-300/40 ml-1">Código HTML Google Maps (Iframe)</label>
                <textarea 
                  value={shop.mapUrl || ''}
                  onChange={(e) => handleInputChange('mapUrl', e.target.value)}
                  placeholder="<iframe src='...' ></iframe>"
                  rows={4}
                  className="w-full bg-black/40 border border-white/8 rounded-xl px-4 py-3.5 text-[10px] font-mono text-white/70 focus:outline-none focus:border-violet-500/50 focus:shadow-[0_0_15px_rgba(139,92,246,0.15)] transition-all placeholder-white/20"
                />
              </div>
            </div>

            <div className="bg-white/[0.03] backdrop-blur-xl border border-violet-500/15 rounded-[1.5rem] p-5 space-y-5 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
              <h2 className="text-[11px] font-[1000] uppercase tracking-[0.2em] text-violet-400/70 border-b border-violet-500/10 pb-3 flex items-center gap-2">
                <Phone size={14} /> WhatsApp de Pedidos
              </h2>
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-widest text-violet-300/40 ml-1">Número (Sin +)</label>
                <input 
                  type="text" 
                  value={shop.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Ej: 5491122334455"
                  className="w-full bg-black/40 border border-green-500/20 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-green-500/50 focus:shadow-[0_0_15px_rgba(34,197,94,0.15)] transition-all placeholder-white/20"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'novedades' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex justify-between items-end mb-2">
              <h2 className="text-[11px] font-[1000] uppercase tracking-[0.2em] text-violet-400 flex items-center gap-2">
                <ImageIcon size={14} /> Muro de Novedades
              </h2>
              <button 
                onClick={() => {
                  playNeonClick();
                  const newFeed = [...(shop.feedImages || []), ''];
                  handleInputChange('feedImages', newFeed);
                }}
                className="bg-violet-500/15 text-violet-300 border border-violet-500/40 px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-violet-500/25 hover:shadow-[0_0_15px_rgba(139,92,246,0.2)] transition-all flex items-center gap-1.5"
              >
                <Plus size={12} /> Agregar Foto
              </button>
            </div>

            {(!shop.feedImages || shop.feedImages.length === 0) ? (
              <div className="bg-white/[0.02] border border-dashed border-violet-500/20 rounded-[1.5rem] p-8 flex flex-col items-center justify-center text-center">
                <p className="text-[10px] text-violet-300/40 uppercase">El muro está vacío. Subí publicidades o eventos.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {shop.feedImages.map((imgUrl, index) => (
                  <div key={index} className="bg-white/[0.03] backdrop-blur-xl border border-violet-500/15 rounded-[1.5rem] p-4 relative group hover:border-violet-500/30 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
                    <button 
                      onClick={() => {
                        const confirm = window.confirm('¿Eliminar esta imagen del muro?');
                        if (confirm) {
                          playNeonClick();
                          const newFeed = shop.feedImages!.filter((_, i) => i !== index);
                          handleInputChange('feedImages', newFeed);
                        }
                      }}
                      className="absolute top-4 right-4 text-red-400/50 hover:text-red-400 transition-colors z-10"
                    >
                      <Trash2 size={16} />
                    </button>
                    
                    <div className="space-y-3 mt-2 block">
                      <label className="text-[8px] font-bold uppercase tracking-widest text-violet-300/40 ml-1">URL Imagen publicitaria #{index + 1}</label>
                      <input 
                        type="text" 
                        value={imgUrl || ''}
                        onChange={(e) => {
                          const newFeed = [...shop.feedImages!];
                          newFeed[index] = e.target.value;
                          handleInputChange('feedImages', newFeed);
                        }}
                        placeholder="https://...jpg"
                        className="w-full bg-black/40 border border-white/8 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-violet-500/50 focus:shadow-[0_0_15px_rgba(139,92,246,0.15)] transition-all placeholder-white/20"
                      />
                      {imgUrl && (
                         <div className="mt-3 aspect-video rounded-xl overflow-hidden border border-violet-500/20 shadow-[0_4px_20px_rgba(0,0,0,0.5),0_0_10px_rgba(139,92,246,0.1)]">
                            <img src={imgUrl} alt="Feed Preview" className="w-full h-full object-cover" />
                         </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="h-6"></div> {/* Spacer for scroll */}
          </div>
        )}

        {activeTab === 'enlaces' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="bg-white/[0.03] backdrop-blur-xl border border-violet-500/15 rounded-[1.5rem] p-5 space-y-5 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
              <h2 className="text-[11px] font-[1000] uppercase tracking-[0.2em] text-violet-400/70 border-b border-violet-500/10 pb-3 flex items-center gap-2">
                <ExternalLink size={14} /> Botones de Acción Comercial
              </h2>
              
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-widest text-violet-300/40 ml-1">Link de PedidoYa</label>
                <input 
                  type="text" 
                  value={shop.pedidoYaUrl || ''}
                  onChange={(e) => handleInputChange('pedidoYaUrl', e.target.value)}
                  placeholder="https://www.pedidosya.com.ar/..."
                  className="w-full bg-black/40 border border-red-500/20 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-red-500/50 focus:shadow-[0_0_15px_rgba(239,68,68,0.15)] transition-all placeholder-white/20"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-widest text-violet-300/40 ml-1">Link de MercadoPago</label>
                <input 
                  type="text" 
                  value={shop.mercadoPagoUrl || ''}
                  onChange={(e) => handleInputChange('mercadoPagoUrl', e.target.value)}
                  placeholder="Link de pago o alias..."
                  className="w-full bg-black/40 border border-blue-500/20 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:shadow-[0_0_15px_rgba(59,130,246,0.15)] transition-all placeholder-white/20"
                />
              </div>
            </div>

            <div className="bg-white/[0.03] backdrop-blur-xl border border-violet-500/15 rounded-[1.5rem] p-5 space-y-5 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
              <h2 className="text-[11px] font-[1000] uppercase tracking-[0.2em] text-violet-400/70 border-b border-violet-500/10 pb-3 flex items-center gap-2">
                <Instagram size={14} /> Redes Sociales
              </h2>
              
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-widest text-violet-300/40 ml-1">Instagram (@usuario o Link)</label>
                <input 
                  type="text" 
                  value={shop.instagram || ''}
                  onChange={(e) => handleInputChange('instagram', e.target.value)}
                  className="w-full bg-black/40 border border-fuchsia-500/20 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-fuchsia-500/50 focus:shadow-[0_0_15px_rgba(217,70,239,0.15)] transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-widest text-violet-300/40 ml-1">Facebook (Link del Perfil)</label>
                <input 
                  type="text" 
                  value={shop.facebook || ''}
                  onChange={(e) => handleInputChange('facebook', e.target.value)}
                  className="w-full bg-black/40 border border-blue-600/20 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-blue-600/50 focus:shadow-[0_0_15px_rgba(37,99,235,0.15)] transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-widest text-violet-300/40 ml-1">TikTok (@usuario o Link)</label>
                <input 
                  type="text" 
                  value={shop.tiktok || ''}
                  onChange={(e) => handleInputChange('tiktok', e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-white/40 focus:shadow-[0_0_15px_rgba(255,255,255,0.08)] transition-all"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'resenas' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex justify-between items-end mb-2">
              <h2 className="text-[11px] font-[1000] uppercase tracking-[0.2em] text-violet-400 flex items-center gap-2">
                <MessageSquare size={14} /> Gestión de Reseñas
              </h2>
              <button 
                onClick={() => {
                  playNeonClick();
                  const newReview = {
                    id: `rev-${Date.now()}`,
                    authorName: 'Nombre del Cliente',
                    rating: 5,
                    text: 'Escribí aquí el comentario...',
                    date: 'Reciente'
                  };
                  handleInputChange('reviews', [...(shop.reviews || []), newReview]);
                }}
                className="bg-violet-500/15 text-violet-300 border border-violet-500/40 px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-violet-500/25 hover:shadow-[0_0_15px_rgba(139,92,246,0.2)] transition-all flex items-center gap-1.5"
              >
                <Plus size={12} /> Nueva Reseña
              </button>
            </div>

            {(!shop.reviews || shop.reviews.length === 0) ? (
              <div className="bg-white/[0.02] border border-dashed border-violet-500/20 rounded-[1.5rem] p-8 flex flex-col items-center justify-center text-center">
                <p className="text-[10px] text-violet-300/40 uppercase">No hay reseñas cargadas aún.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {shop.reviews.map((review, index) => (
                  <div key={review.id} className="bg-white/[0.03] backdrop-blur-xl border border-violet-500/15 rounded-[1.5rem] p-4 relative group hover:border-violet-500/30 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
                    <button 
                      onClick={() => {
                        const confirm = window.confirm('¿Eliminar esta reseña?');
                        if (confirm) {playNeonClick(); handleInputChange('reviews', shop.reviews!.filter(r => r.id !== review.id));}
                      }}
                      className="absolute top-4 right-4 text-red-400/30 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                    
                    <div className="space-y-3 mt-2">
                      <div className="flex gap-3">
                        <div className="flex-1 space-y-1">
                          <label className="text-[8px] font-bold uppercase tracking-widest text-violet-300/40 ml-1">Cliente</label>
                          <input 
                            type="text" 
                            value={review.authorName}
                            onChange={(e) => {
                              const newReviews = [...shop.reviews!];
                              newReviews[index].authorName = e.target.value;
                              handleInputChange('reviews', newReviews);
                            }}
                            className="w-full bg-black/40 border border-white/8 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-violet-500/50 focus:shadow-[0_0_15px_rgba(139,92,246,0.15)] transition-all"
                          />
                        </div>
                        <div className="w-20 space-y-1">
                          <label className="text-[8px] font-bold uppercase tracking-widest text-violet-300/40 ml-1">Estrellas</label>
                          <select 
                            value={review.rating}
                            onChange={(e) => {
                              const newReviews = [...shop.reviews!];
                              newReviews[index].rating = parseInt(e.target.value);
                              handleInputChange('reviews', newReviews);
                            }}
                            className="w-full bg-black/40 border border-white/8 rounded-xl px-2 py-2.5 text-xs text-white focus:outline-none focus:border-violet-500/50 transition-all"
                          >
                            {[1,2,3,4,5].map(v => <option key={v} value={v}>{v} ★</option>)}
                          </select>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-[8px] font-bold uppercase tracking-widest text-violet-300/40 ml-1">Comentario</label>
                        <textarea 
                          value={review.text}
                          onChange={(e) => {
                            const newReviews = [...shop.reviews!];
                            newReviews[index].text = e.target.value;
                            handleInputChange('reviews', newReviews);
                          }}
                          rows={2}
                          className="w-full bg-black/40 border border-white/8 rounded-xl px-3 py-2.5 text-[10px] text-white focus:outline-none focus:border-violet-500/50 focus:shadow-[0_0_15px_rgba(139,92,246,0.15)] transition-all"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="h-6"></div>
          </div>
        )}

        {activeTab === 'ofertas' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex justify-between items-end mb-2">
              <h2 className="text-[11px] font-[1000] uppercase tracking-[0.2em] text-violet-400 flex items-center gap-2">
                <ShoppingCart size={14} /> Gestión de Combos
              </h2>
              <button 
                onClick={() => {
                  playNeonClick();
                  const newOffer: ProductOffer = {
                    id: `off-${Date.now()}`,
                    name: 'Nuevo Combo',
                    price: 1000,
                    image: ''
                  };
                  handleInputChange('offers', [...(shop.offers || []), newOffer]);
                }}
                className="bg-violet-500/15 text-violet-300 border border-violet-500/40 px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-violet-500/25 hover:shadow-[0_0_15px_rgba(139,92,246,0.2)] transition-all flex items-center gap-1.5"
              >
                <Plus size={12} /> Agregar Oferta
              </button>
            </div>

            {(!shop.offers || shop.offers.length === 0) ? (
              <div className="bg-white/[0.02] border border-dashed border-violet-500/20 rounded-[1.5rem] p-8 flex flex-col items-center justify-center text-center">
                <p className="text-[10px] text-violet-300/40 uppercase">El comercio no tiene combos cargados.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {shop.offers.map((offer, index) => (
                  <div key={offer.id} className="bg-white/[0.03] backdrop-blur-xl border border-violet-500/15 rounded-[1.5rem] p-4 relative group hover:border-violet-500/30 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
                    <button 
                      onClick={() => {
                        const confirm = window.confirm('¿Eliminar esta oferta?');
                        if(confirm) {
                          playNeonClick();
                          handleInputChange('offers', shop.offers.filter(o => o.id !== offer.id));
                        }
                      }}
                      className="absolute top-4 right-4 text-red-400/30 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                    
                    <div className="space-y-3 mt-2">
                      <div className="flex gap-3">
                        <div className="flex-1 space-y-1">
                          <label className="text-[8px] font-bold uppercase tracking-widest text-violet-300/40 ml-1">Nombre Combo #{index + 1}</label>
                          <input 
                            type="text" 
                            value={offer.name}
                            onChange={(e) => {
                              const newOffers = [...shop.offers];
                              newOffers[index].name = e.target.value;
                              handleInputChange('offers', newOffers);
                            }}
                            className="w-full bg-black/40 border border-white/8 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-violet-500/50 focus:shadow-[0_0_15px_rgba(139,92,246,0.15)] transition-all"
                          />
                        </div>
                        <div className="w-24 space-y-1">
                          <label className="text-[8px] font-bold uppercase tracking-widest text-violet-300/40 ml-1">Precio ($)</label>
                          <input 
                            type="number" 
                            value={offer.price}
                            onChange={(e) => {
                              const newOffers = [...shop.offers];
                              newOffers[index].price = parseFloat(e.target.value) || 0;
                              handleInputChange('offers', newOffers);
                            }}
                            className="w-full bg-black/40 border border-white/8 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-violet-500/50 focus:shadow-[0_0_15px_rgba(139,92,246,0.15)] transition-all"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-[8px] font-bold uppercase tracking-widest text-violet-300/40 ml-1">URL Fotografía</label>
                        <input 
                          type="text" 
                          value={offer.image}
                          onChange={(e) => {
                            const newOffers = [...shop.offers];
                            newOffers[index].image = e.target.value;
                            handleInputChange('offers', newOffers);
                          }}
                          placeholder="https://..."
                          className="w-full bg-black/40 border border-white/8 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-violet-500/50 focus:shadow-[0_0_15px_rgba(139,92,246,0.15)] transition-all placeholder-white/20"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="h-6"></div> {/* Spacer for scroll */}
          </div>
        )}
      </div>

    </div>
  );
};

export default ShopEditPage;
