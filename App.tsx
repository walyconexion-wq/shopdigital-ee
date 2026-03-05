import React, { useState, useCallback, useMemo, useRef } from 'react';
import { View, Shop, Category } from './types';
import { CATEGORIES } from './constants';
import Logo from './components/Logo';
import LoadingScreen from './components/LoadingScreen';
import { db, suscribirseAComercios, guardarComercio, eliminarComercio } from './firebase';
import { useEffect } from 'react';
import {
  Share2,
  Star,
  MessageCircle,
  ChevronLeft,
  MapPin,
  ArrowLeft,
  Info,
  BookOpen,
  ShoppingBag,
  Handshake,
  Navigation,
  Car,
  Lock,
  Save,
  Image as ImageIcon,
  Plus,
  PlusSquare,
  Trash2,
  Camera,
  Pizza,
  Facebook,
  Instagram,
  Music,
  Zap
} from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.HOME);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [footerClicks, setFooterClicks] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleFooterClick = () => {
    const newCount = footerClicks + 1;
    if (newCount >= 6) {
      setShowLoginModal(true);
      setFooterClicks(0);
    } else {
      setFooterClicks(newCount);
      // Reset count after 3 seconds of inactivity
      setTimeout(() => setFooterClicks(0), 3000);
    }
  };

  // Refs para navegación y archivos
  const catalogRef = useRef<HTMLDivElement>(null);

  // Estado para la edición
  const [editableShop, setEditableShop] = useState<Shop | null>(null);
  const [allShops, setAllShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  // showLoader controls whether LoadingScreen is in the DOM at all
  const [showLoader, setShowLoader] = useState(true);

  const DEFAULT_BANNER = "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=400&fit=crop";

  // Cargar datos de Firebase en tiempo real
  useEffect(() => {
    const unsubscribe = suscribirseAComercios((fbShops) => {
      // Limpieza y Validación: Solo mostrar locales con nombre y asignar imagen por defecto si falta
      const cleanedShops = fbShops
        .filter(shop => shop.name && shop.name.trim() !== "")
        .map(shop => ({
          ...shop,
          bannerImage: shop.bannerImage || DEFAULT_BANNER,
          image: shop.image || shop.bannerImage || DEFAULT_BANNER,
          offers: shop.offers || []
        }));

      setAllShops(cleanedShops);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleCategoryClick = useCallback((category: Category) => {
    setSelectedCategory(category);
    setCurrentView(View.CATEGORY);
  }, []);

  const handleShopClick = useCallback((shop: Shop) => {
    setSelectedShop(shop);
    setEditableShop({ ...shop });
    setCurrentView(View.DETAIL);
  }, []);

  const handleBack = useCallback(() => {
    if (currentView === View.DETAIL) {
      setCurrentView(View.CATEGORY);
    } else if (currentView === View.EDIT_PANEL) {
      if (selectedShop) {
        setCurrentView(View.DETAIL);
      } else {
        setSelectedCategory(null);
        setCurrentView(View.HOME);
      }
    } else {
      setSelectedCategory(null);
      setCurrentView(View.HOME);
    }
  }, [currentView]);

  const scrollToCatalog = () => {
    catalogRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleLogin = () => {
    if (password === 'admin123') {
      setShowLoginModal(false);
      setPassword('');
      setLoginError(false);

      // Si no hay un comercio editable (venimos del footer), inicializar uno vacío
      if (!editableShop) {
        setEditableShop({
          id: '',
          name: '',
          category: CATEGORIES[0].id,
          rating: 5.0,
          specialty: '',
          address: '',
          phone: '',
          bannerImage: '',
          image: '',
          offers: [],
          mapUrl: '',
          mapSheetUrl: '',
          instagram: '',
          facebook: '',
          tiktok: ''
        });
      }

      setCurrentView(View.EDIT_PANEL);
    } else {
      setLoginError(true);
      setTimeout(() => setLoginError(false), 2000);
    }
  };

  const handleSaveEdit = async () => {
    if (editableShop) {
      try {
        // Asegurar que tenga los campos nuevos si no los tiene
        const shopToSave = {
          ...editableShop,
          id: editableShop.id || `shop-${Date.now()}`, // Generar ID si es nuevo
          rating: editableShop.rating || 5.0,
          isActive: editableShop.isActive !== undefined ? editableShop.isActive : true,
          offers: editableShop.offers || [],
        };

        // Enviar a Firebase
        await guardarComercio(shopToSave);

        // Ya no actualizamos allShops manualmente, onSnapshot lo hará
        setSelectedShop(shopToSave);
        setCurrentView(View.DETAIL);
        alert('¡Comercio guardado en la nube con éxito!');
      } catch (error) {
        console.error(error);
        alert('Error al guardar en Firebase. Verificá la configuración.');
      }
    }
  };

  const handleDeleteShop = async (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este comercio? Esta acción no se puede deshacer.')) {
      try {
        await eliminarComercio(id);
        // Ya no filtramos allShops manualmente, onSnapshot lo hará
        alert('Comercio eliminado con éxito.');
      } catch (error) {
        console.error(error);
        alert('Error al eliminar de Firebase.');
      }
    }
  };

  const DEFAULT_OG_IMAGE = 'https://images.unsplash.com/photo-1574126154517-d1e0d89ef734?w=1200&h=630&fit=crop';

  const updateOGTags = (title: string, description: string, imageUrl: string) => {
    const setMeta = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.querySelector(`meta[name="${property}"]`) as HTMLMetaElement;
      }
      if (meta) meta.content = content;
    };
    setMeta('og:title', title);
    setMeta('og:description', description);
    setMeta('og:image', imageUrl);
    setMeta('twitter:title', title);
    setMeta('twitter:description', description);
    setMeta('twitter:image', imageUrl);
  };

  const handleShare = () => {
    const appUrl = window.location.href;
    const shopName = selectedShop?.name || 'shopdigital.ar';
    const shopImage = selectedShop?.bannerImage || DEFAULT_OG_IMAGE;

    const shareTitle = selectedShop
      ? `${shopName} - Catálogo Online`
      : 'shopdigital.ar - La App de Waly';

    const shareDescription = selectedShop
      ? `Te comparto el catálogo de *${shopName}* desde la App de Waly 🚀`
      : `¡Mirá los comercios de Esteban Echeverría en la App de Waly! 🚀`;

    const shareText = `${shareDescription}\n\n👉 ${appUrl}`;

    // Actualizar OG tags dinámicamente para que el crawler vea la info correcta
    updateOGTags(shareTitle, shareDescription, shopImage);

    if (navigator.share) {
      navigator.share({
        title: shareTitle,
        text: shareText,
        url: appUrl,
      }).catch(console.error);
    } else {
      // Fallback: abrir WhatsApp Web con el mensaje pre-armado
      const whatsappText = encodeURIComponent(shareText);
      window.open(`https://wa.me/?text=${whatsappText}`, '_blank', 'noopener,noreferrer');
    }
  };

  const handleOpenLink = useCallback((url: string | null) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      alert('Función próximamente disponible para este comercio');
    }
  }, []);

  const LOCALITIES = ['Monte Grande', 'Luis Guillón', 'El Jagüel'];

  const groupedShops = useMemo(() => {
    if (!selectedCategory) return {};
    const grouped: Record<string, Shop[]> = {};

    const normalize = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    LOCALITIES.forEach(loc => {
      const normalizedLoc = normalize(loc);
      grouped[loc] = allShops.filter(shop =>
        shop &&
        shop.isActive !== false &&
        shop.category === selectedCategory.id &&
        ((shop.zone === loc) || (shop.address && normalize(shop.address || "").includes(normalizedLoc)))
      );
    });

    return grouped;
  }, [selectedCategory, allShops]);

  const filteredShops = useMemo(() => {
    if (!selectedCategory) return [];
    return allShops.filter(shop => shop.category === selectedCategory.id);
  }, [selectedCategory, allShops]);

  // Agrupado para la Lista de Gestión del Admin
  const groupedManagementShops = useMemo(() => {
    const grouped: Record<string, Record<string, Shop[]>> = {};
    const normalize = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    CATEGORIES.forEach(cat => {
      grouped[cat.id] = {};
      LOCALITIES.forEach(loc => {
        const normalizedLoc = normalize(loc);
        grouped[cat.id][loc] = allShops.filter(shop =>
          shop &&
          shop.category === cat.id &&
          (shop.zone === loc || (shop.address && normalize(shop.address).includes(normalizedLoc)))
        );
      });
    });

    return grouped;
  }, [allShops]);

  return (
    <div className={`w-full max-w-md mx-auto h-screen flex flex-col ${currentView === View.HOME ? 'bg-gray-900' : 'bg-white'} overflow-hidden relative shadow-2xl`}>

      {/* Pantalla de Carga — se desmonta completamente del DOM cuando termina */}
      {showLoader && (
        <LoadingScreen ready={!loading} onDone={() => setShowLoader(false)} />
      )}

      {/* Efecto Carrusel para Interface 3 */}
      {useEffect(() => {
        if (currentView === View.DETAIL && selectedShop) {
          const gallery = selectedShop.galleryImages && selectedShop.galleryImages.length > 0
            ? selectedShop.galleryImages
            : [selectedShop.bannerImage, selectedShop.image, selectedShop.offers[0]?.image].filter(Boolean) as string[];

          if (gallery.length > 1) {
            const timer = setInterval(() => {
              setCurrentImageIndex((prev) => (prev + 1) % gallery.length);
            }, 6000);
            return () => clearInterval(timer);
          }
        } else {
          setCurrentImageIndex(0);
        }
        return undefined;
      }, [currentView, selectedShop]) as any}

      {/* FONDO TECNOLÓGICO (ESTÁTICO) */}
      {(currentView === View.HOME || currentView === View.CATEGORY || currentView === View.DETAIL) && (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div
            className="absolute inset-0 bg-cover"
            style={{
              backgroundImage: 'url("https://img.freepik.com/fotos-premium/fondo-tecnologia-red-digital-azul_939148-135.jpg")',
              backgroundPosition: 'center center',
              opacity: 1
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
        </div>
      )}

      {currentView !== View.DETAIL && currentView !== View.EDIT_PANEL && (
        <header className={`${currentView === View.HOME ? 'bg-transparent pt-8' : currentView === View.CATEGORY ? 'bg-transparent pt-4' : 'bg-white pt-8'} flex-shrink-0 flex flex-col items-center relative z-10 transition-all duration-700`}>
          {currentView === View.HOME ? (
            <div className="glass-header rounded-3xl p-2.5 mb-2.5 border-[#8b5cf6]/50 shadow-[0_15px_40px_rgba(139,92,246,0.4)] bg-gradient-to-br from-[#8b5cf6]/20 to-[#0A224E]/60 animate-in fade-in zoom-in duration-1000">
              <Logo />
            </div>
          ) : currentView === View.CATEGORY ? (
            <div className="w-full px-6 flex flex-col pb-4">
              <div className="flex items-center justify-between mb-2">
                <button
                  onClick={handleBack}
                  className="glass-action-btn px-4 py-2 rounded-full flex items-center gap-2 border-white/30 active:scale-95 transition-all shadow-xl"
                >
                  <ChevronLeft size={16} strokeWidth={4} className="text-white drop-shadow(0 0 3px rgba(255,255,255,0.4))" />
                  <span className="text-[9px] font-[1000] text-white uppercase tracking-[0.2em] text-shadow-premium">Regresar</span>
                </button>
                <div className="w-10"></div> {/* Espaciador para equilibrio */}
              </div>

              <div className="flex justify-center w-full px-2">
                <div className="glass-header rounded-3xl w-full py-5 flex flex-col items-center border-[#8b5cf6]/50 shadow-[0_15px_40px_rgba(139,92,246,0.4)] bg-gradient-to-br from-[#8b5cf6]/20 to-[#0A224E]/60">
                  <h2 className="text-[22px] font-[900] text-white uppercase tracking-[0.3em] leading-none text-center drop-shadow-[0_0_15px_rgba(139,92,246,0.8)] mb-2">
                    {selectedCategory?.name}
                  </h2>
                  <div className="h-[1px] w-16 bg-[#8b5cf6]/60 mb-2 shadow-[0_0_10px_rgba(139,92,246,0.8)]"></div>
                  <p className="text-[9px] font-bold text-white/90 uppercase tracking-[0.15em] leading-tight text-center px-6 drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]">
                    Seleccioná tu comercio y descubrí ofertas magníficas
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <Logo />
          )}

        </header>
      )}

      {/* CONTENIDO PRINCIPAL */}
      <main className={`flex-grow overflow-y-auto no-scrollbar relative z-10 ${currentView === View.DETAIL || currentView === View.EDIT_PANEL ? 'p-0' : 'p-0 pb-12'}`}>

        {/* INTERFAZ 1: HOME */}
        {currentView === View.HOME && (
          <div className="flex flex-col pt-2 pb-12 animate-in fade-in duration-700">
            <div className="flex flex-col items-center mb-10 mt-2 fade-up-item">
              <div className={`h-[1px] w-12 ${currentView === View.HOME ? 'bg-white/20' : 'bg-[#0A224E]/10'} mb-5`}></div>
              <h2 className={`text-[10px] font-black ${currentView === View.HOME ? 'text-white text-shadow-premium' : 'text-[#0A224E]'} uppercase tracking-[0.4em] text-center`}>
                Seleccionar Categoría
              </h2>
              <div className="flex gap-1.5 mt-4">
                <div className="w-1 h-1 rounded-full bg-[#22C55E]"></div>
                <div className="w-1 h-1 rounded-full bg-[#FF0000]"></div>
                <div className="w-1 h-1 rounded-full bg-[#0A224E]"></div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-x-3 gap-y-7 px-6">
              {CATEGORIES.map((cat, index) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat)}
                  style={{
                    animation: `fadeUp 0.7s cubic-bezier(0.25, 1, 0.5, 1) ${index * 35}ms forwards`
                  }}
                  className="glass-button-3d category-btn aspect-square group opacity-0"
                >
                  <div className="mb-1.5 transform group-hover:scale-110 transition-transform duration-500 ease-out">
                    {React.cloneElement(cat.icon as React.ReactElement<any>, { size: 19, strokeWidth: 1.3 })}
                  </div>
                  <span className="text-[8.5px] text-center font-black uppercase leading-[1.1] tracking-[0.01em] px-0.5">
                    {cat.name}
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-12 mb-4 flex justify-center fade-up-item" style={{ animationDelay: '700ms' }}>
              <button
                onClick={handleShare}
                className="glass-action-btn btn-violet luminous-glow py-3.5 px-8 text-[10px] font-[1100] uppercase tracking-[0.25em] active:scale-95 shadow-2xl"
              >
                <Share2 size={16} strokeWidth={3} className="text-white" />
                Compartir App
              </button>
            </div>

            {/* Footer en flujo natural del scroll */}
            <footer
              onClick={handleFooterClick}
              className="w-full flex flex-col items-center gap-1.5 pt-4 pb-4 mt-2 border-t border-white/10"
            >
              <p
                className="text-[9px] font-black text-white uppercase tracking-[0.35em] text-center select-none"
                style={{ textShadow: '0 0 8px rgba(255, 255, 255, 0.4)' }}
              >
                © 2026 · shopdigital.ar
              </p>
              <p
                className="text-[8px] font-bold uppercase tracking-[0.25em] text-center select-none"
                style={{
                  color: '#009EE3',
                  textShadow: '0 0 10px rgba(0, 158, 227, 0.8), 0 0 20px rgba(0, 158, 227, 0.4)',
                }}
              >
                La app de Waly
              </p>
            </footer>
          </div>
        )}

        {/* INTERFAZ 2: LISTADO DE COMERCIOS */}
        {currentView === View.CATEGORY && (
          <div className="flex flex-col gap-10 px-2 pt-4 animate-in slide-in-from-bottom-6 duration-700 pb-24">
            {LOCALITIES.map((locality) => (
              <div key={locality} className="flex flex-col gap-6">
                {/* Cabecera de Región */}
                <div className="flex items-center gap-3 ml-2">
                  <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg">
                    <MapPin size={16} className="text-red-500 fill-red-500/20" />
                  </div>
                  <h3 className="text-[12px] font-black text-white uppercase tracking-[0.4em] text-shadow-premium">
                    {locality}
                  </h3>
                  <div className="h-[1px] flex-1 bg-white/10"></div>
                </div>

                {groupedShops[locality] && groupedShops[locality].length > 0 ? (
                  groupedShops[locality].map((shop, index) => (
                    <div
                      key={shop.id}
                      style={{ animationDelay: `${index * 80}ms` }}
                      className={`glass-card-3d ${locality === 'Monte Grande' ? 'card-neon-violet' : locality === 'Luis Guillón' ? 'card-neon-green' : 'card-neon-red'} overflow-hidden flex flex-row cursor-default fade-up-item w-full items-stretch h-[170px]`}
                    >
                      {/* Foto estirada al contenedor (Izquierda) */}
                      <div className="relative w-32 shop-image-wrapper flex-shrink-0 overflow-hidden border-r border-white/20">
                        <img src={shop.bannerImage} alt={shop.name} className="w-full h-full object-cover transition-transform duration-1000 hover:scale-110" />
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full border border-white/20 shadow-xl">
                          <div className="flex items-center gap-1">
                            <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                            <span className="text-[10px] font-black text-white">{shop.rating}</span>
                          </div>
                        </div>
                      </div>

                      {/* Contenido Legible (Derecha) */}
                      <div className="flex-1 flex flex-col justify-between p-4 text-left min-w-0 bg-white/[0.04]">
                        <div className="space-y-1.5 overflow-hidden">
                          <h3 className="font-[1000] text-[19px] shop-title-text text-white uppercase tracking-tighter leading-none text-shadow-premium">
                            {shop.name.replace(/\s*\(.*\)\s*/, '').split('-')[0].trim()}
                          </h3>

                          <div className="flex items-start gap-1 pb-1 text-white/80 shop-address-sub uppercase text-[10px] font-bold tracking-tight leading-snug overflow-hidden">
                            <MapPin size={12} strokeWidth={3} className="flex-shrink-0 mt-0.5 text-red-500" />
                            <span className="break-words line-clamp-2">{shop.address}</span>
                          </div>

                          {/* Social Icons Mini */}
                          <div className="flex gap-5 pt-1.5">
                            {shop.instagram && <Instagram size={15} className="text-white/60" />}
                            {shop.facebook && <Facebook size={15} className="text-white/60" />}
                            {shop.tiktok && <Music size={15} className="text-white/60" />}
                          </div>
                        </div>

                        <div className="mt-4 flex flex-col gap-3">
                          <div className="flex items-center gap-0.5 mb-1 shop-stars-mobile">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={12} className={`${i < Math.floor(shop.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-white/10'}`} />
                            ))}
                          </div>
                          <button
                            onClick={() => handleShopClick(shop)}
                            className="glass-action-btn btn-offers-glow pulse-3d-btn w-full shop-btn-mobile py-4 px-3 text-[11px] font-[1100] uppercase tracking-[0.2em] flex items-center justify-center gap-2 active:scale-95 transition-all shadow-2xl"
                          >
                            <BookOpen size={16} strokeWidth={4} className="text-white drop-shadow-md" />
                            VER CATÁLOGO
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                      No hay comercios disponibles en esta zona
                    </p>
                  </div>
                )}
              </div>
            ))}

            <div className="pt-8 flex justify-center w-full">
              <button
                onClick={handleBack}
                className="glass-action-btn btn-neon-delicate w-max py-2 px-5 uppercase tracking-[0.2em] flex items-center justify-center gap-2 mx-auto active:scale-95 transition-all group shadow-xl"
              >
                <div className="bg-white/5 p-1 rounded-full group-hover:scale-110 transition-transform">
                  <ArrowLeft size={16} strokeWidth={3} className="text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.4)]" />
                </div>
                <span className="text-[10px] font-black text-white">Regresar</span>
              </button>
            </div>
          </div>
        )}

        {/* INTERFAZ 3: DETALLE */}
        {currentView === View.DETAIL && selectedShop && (
          <div className="pb-24 animate-in fade-in duration-700">
            {/* PORTADA CON CARRUSEL DINÁMICO */}
            <div className="relative w-full h-[260px] bg-[#0A224E] overflow-hidden">
              {(() => {
                const gallery = selectedShop.galleryImages && selectedShop.galleryImages.length > 0
                  ? selectedShop.galleryImages
                  : [selectedShop.bannerImage, selectedShop.image, selectedShop.offers[0]?.image].filter(Boolean) as string[];

                return gallery.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Cover ${idx}`}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[2000ms] ease-in-out ${idx === currentImageIndex ? 'opacity-65' : 'opacity-0'}`}
                  />
                ));
              })()}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A224E] via-[#0A224E]/20 to-transparent"></div>

              <div className="absolute top-5 left-1/2 -translate-x-1/2 z-50 pointer-events-none w-[90%] flex flex-col items-center">
                <h1 className="impact-title neon-flicker text-[28px] drop-shadow-[0_0_20px_rgba(255,255,255,0.7)]">
                  {selectedShop.name.replace(/\s*\(.*\)\s*/, '').split('-')[0].trim()}
                </h1>
                <div className="flex items-center gap-1.5 mt-1 opacity-90">
                  <MapPin size={10} className="text-red-400" strokeWidth={3} />
                  <span className="text-[8.5px] font-black uppercase tracking-[0.3em] text-white/80 text-shadow-premium">
                    {selectedShop.zone || 'Esteban Echeverría'}
                  </span>
                </div>
                <div className="w-12 h-[1px] bg-white/40 mx-auto mt-2.5 shadow-[0_0_10px_rgba(255,255,255,0.6)]"></div>
              </div>

              <div className="absolute inset-0 flex flex-col justify-end pb-6 px-6">
                <div className="flex justify-center w-full">
                  {/* Botón Menú Online Centrado */}
                  <button
                    onClick={scrollToCatalog}
                    className="glass-action-btn btn-offers-glow luminous-glow px-4 py-2 rounded-2xl flex items-center justify-center gap-2.5 z-40 shadow-xl active:scale-95 group"
                  >
                    <BookOpen size={14} strokeWidth={3} className="text-white group-hover:scale-110 transition-transform" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white">Ver menú</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="relative z-10 flex flex-col items-center">
              {/* SECCIÓN CATÁLOGO */}
              <div ref={catalogRef} className="w-full mb-10 mt-8 scroll-mt-24">
                <div className="flex flex-col items-center mb-8 px-6">
                  <div className="flex items-center gap-2">
                    <ShoppingBag size={14} className="text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]" />
                    <h3 className="neon-text-cyan font-black text-[10px] uppercase tracking-[0.4em]">
                      Catálogo de Ofertas
                    </h3>
                  </div>
                  <div className="h-[1px] w-6 bg-white/10 mt-3"></div>
                </div>

                <div className="overflow-hidden w-full">
                  <div className="animate-delicate-marquee flex gap-4 px-4">
                    {[...selectedShop.offers, ...selectedShop.offers].map((offer, idx) => (
                      <div
                        key={`${offer.id}-${idx}`}
                        className="glass-card-3d offer-card-neon flex-shrink-0 w-44 p-3.5 flex flex-col active:scale-95 transition-all duration-300"
                      >
                        <div className="rounded-2xl overflow-hidden aspect-square mb-3.5 border border-white/20 shadow-xl relative group-hover:border-cyan-400/50 transition-colors">
                          <img src={offer.image} alt={offer.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                          <div className="absolute top-2 right-2 bg-cyan-500/80 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter">Oferta</div>
                        </div>
                        <div className="px-1 pb-1 text-center">
                          <p className="text-[10px] font-black uppercase tracking-tight text-white mb-3.5 line-clamp-1 text-shadow-premium">
                            {offer.name}
                          </p>
                          <div className="glass-action-btn offer-price-tag py-2 px-3 rounded-xl">
                            <span className="text-[12.5px] font-black text-cyan-50 text-shadow-premium">$ {offer.price.toLocaleString('es-AR')}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Acceso Admin al final del catálogo */}
                <div className="flex justify-center mt-6">
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/20 hover:text-white/40 transition-all active:scale-95"
                  >
                    <Lock size={12} strokeWidth={2} />
                    <span className="text-[8px] font-bold uppercase tracking-[0.2em]">Acceso Gestión</span>
                  </button>
                </div>
              </div>

              {/* TRIO DE BOTONES DE ACCIÓN */}
              <div className="w-full px-4 mb-12 grid grid-cols-3 gap-3">
                <button
                  onClick={() => handleOpenLink('https://www.pedidosya.com.ar/')}
                  className="glass-action-btn btn-py w-full py-5 flex flex-col items-center justify-center gap-1.5"
                >
                  <span className="italic text-[22px] font-black leading-none -mb-1 text-red-500 drop-shadow-md">P</span>
                  <span className="text-[9px] font-black text-white uppercase tracking-wider">PedidosYa</span>
                </button>
                <button
                  onClick={() => {
                    if (selectedShop.phone) {
                      const cleanPhone = selectedShop.phone.replace(/\D/g, '');
                      handleOpenLink(`https://wa.me/549${cleanPhone}?text=Hola!%20Vengo%20de%20la%20App%20de%20Waly`);
                    } else {
                      alert('Este comercio aún no tiene WhatsApp registrado');
                    }
                  }}
                  className="glass-action-btn btn-wa w-full py-5 flex flex-col items-center justify-center gap-1.5"
                >
                  <MessageCircle size={20} className="text-[#25D366] drop-shadow-md" fill="currentColor" strokeWidth={0} />
                  <span className="text-[9px] font-black text-white uppercase tracking-wider">WhatsApp</span>
                </button>
                <button
                  onClick={() => handleOpenLink('https://www.mercadopago.com.ar/')}
                  className="glass-action-btn btn-mp w-full py-5 flex flex-col items-center justify-center gap-1.5"
                >
                  <Handshake size={20} className="text-[#009EE3] drop-shadow-md" strokeWidth={3} />
                  <span className="text-[9px] font-black text-white uppercase tracking-wider">M. Pago</span>
                </button>
              </div>

              {/* SECCIÓN MAPA */}
              <div className="w-full px-6 mb-12">
                <div className="flex flex-col items-center mb-6">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-white" />
                    <h3 className="font-black text-white text-[11px] uppercase tracking-[0.5em] text-shadow-premium">
                      Ubicación del Local
                    </h3>
                  </div>
                  <div className="h-[1px] w-8 bg-white/20 mt-3"></div>
                </div>

                <div className="map-glow-container w-full h-80 overflow-hidden bg-black/20 relative mb-8 shadow-2xl transition-all duration-700">
                  <iframe
                    title="Ubicación del comercio"
                    src={selectedShop.mapUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0, filter: 'grayscale(0.2) contrast(1.1) brightness(0.9)' }}
                    allowFullScreen={false}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>

                <div className="mt-2 text-center px-4 mb-10">
                  <p className="neon-text-white text-[11px] font-[1000] uppercase tracking-[0.35em] leading-relaxed">
                    {selectedShop.address}
                  </p>
                </div>

                <div className="flex flex-col gap-4 w-full px-2">
                  <div className="grid grid-cols-2 gap-4 w-full">
                    <button
                      onClick={() => handleOpenLink(selectedShop.mapSheetUrl || 'https://www.google.com/maps/place/Monte+Grande,+Provincia+de+Buenos+Aires/')}
                      className="glass-action-btn btn-violet w-full py-4 flex items-center justify-center gap-3 active:scale-95"
                    >
                      <Navigation size={18} strokeWidth={3} className="text-white drop-shadow-md" />
                      <span className="text-[10px] font-black uppercase tracking-[0.15em]">Cómo llegar</span>
                    </button>
                    <button
                      onClick={() => handleOpenLink('https://m.uber.com/ul/')}
                      className="glass-action-btn w-full bg-black/60 py-4 flex items-center justify-center gap-3 border-white/20 active:scale-95"
                    >
                      <Car size={18} strokeWidth={3} className="text-white drop-shadow-md" />
                      <span className="text-[10px] font-black uppercase tracking-[0.15em]">Uber</span>
                    </button>
                  </div>

                  {/* Redes Sociales */}
                  <div className="grid grid-cols-3 gap-3 w-full">
                    <button
                      onClick={() => handleOpenLink(selectedShop.facebook || 'https://www.facebook.com/')}
                      className="glass-action-btn btn-fb w-full py-4 flex flex-col items-center justify-center gap-2 transition-all"
                    >
                      <Facebook size={18} className="text-[#1877F2] drop-shadow-md" strokeWidth={3} />
                      <span className="text-[8px] font-black text-white uppercase tracking-[0.1em]">Facebook</span>
                    </button>
                    <button
                      onClick={() => handleOpenLink(selectedShop.instagram || 'https://www.instagram.com/')}
                      className="glass-action-btn btn-ig w-full py-4 flex flex-col items-center justify-center gap-2 transition-all"
                    >
                      <Instagram size={18} className="text-[#E4405F] drop-shadow-md" strokeWidth={3} />
                      <span className="text-[8px] font-black text-white uppercase tracking-[0.1em]">Instagram</span>
                    </button>
                    <button
                      onClick={() => handleOpenLink(selectedShop.tiktok || 'https://www.tiktok.com/')}
                      className="glass-action-btn btn-tk w-full py-4 flex flex-col items-center justify-center gap-2 transition-all"
                    >
                      <Music size={18} className="text-white drop-shadow-md" strokeWidth={3} />
                      <span className="text-[8px] font-black text-white uppercase tracking-[0.1em]">TikTok</span>
                    </button>
                  </div>

                  <button
                    onClick={handleShare}
                    className="glass-action-btn btn-green luminous-glow w-[85%] mx-auto py-4 flex items-center justify-center gap-3 active:scale-[0.98] shadow-2xl"
                  >
                    <Share2 size={20} strokeWidth={3} className="text-white drop-shadow-md" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Compartir Catálogo Online</span>
                  </button>
                </div>
              </div>

              <div className="w-full flex justify-center mt-10 mb-12">
                <button
                  onClick={handleBack}
                  className="glass-action-btn btn-neon-delicate w-max py-2 px-5 uppercase tracking-[0.2em] flex items-center justify-center gap-2 mx-auto transition-all active:scale-95 shadow-xl"
                >
                  <ArrowLeft size={16} strokeWidth={3} className="text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.4)]" />
                  <span className="text-[10px] font-black text-white">Regresar</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* INTERFAZ: PANEL DE EDICIÓN (MODO OSCURO) */}
        {currentView === View.EDIT_PANEL && editableShop && (
          <div className="pb-24 animate-in slide-in-from-right duration-500 bg-[#000] text-white min-h-screen no-scrollbar relative z-[60]">

            {/* Header del Panel */}
            <div className="bg-zinc-900/50 backdrop-blur-md pt-8 pb-6 px-8 flex flex-col items-center border-b border-white/5 mb-4 sticky top-0 z-50">
              <button
                onClick={handleBack}
                className="self-start mb-4 w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-white border border-white/10 active:scale-90 transition-all"
              >
                <ChevronLeft size={20} strokeWidth={3} />
              </button>
              <h2 className="text-[18px] font-black text-white uppercase tracking-[0.2em] mb-1">Carga de Comercio</h2>
              <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Panel de Gestión Real</p>
            </div>

            {/* BANNER REGLA DE ORO */}
            <div className="mx-8 mb-8 bg-yellow-500/10 border border-yellow-500/30 rounded-3xl p-6 flex flex-col gap-4 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-2 h-full bg-yellow-500 group-hover:w-full transition-all duration-700 opacity-20"></div>
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-black shadow-[0_0_20px_rgba(234,179,8,0.5)]">
                  <Zap size={20} fill="currentColor" />
                </div>
                <h3 className="text-[12px] font-[1000] text-yellow-500 uppercase tracking-[0.3em]">REGLA DE ORO: NO BASE64</h3>
              </div>
              <p className="text-[10px] font-bold text-yellow-500/80 leading-relaxed uppercase tracking-widest relative z-10">
                "Nunca guardamos imágenes pesadas. Siempre usá links externos (Unsplash, Google, etc.). La App debe volar 🚀"
              </p>
            </div>

            <div className="px-8 space-y-8">
              {/* Estado del Local (Suspensión) */}
              <div className="bg-white/5 p-6 rounded-3xl border border-white/10 flex items-center justify-between">
                <div>
                  <label className="text-[12px] font-black uppercase tracking-[0.1em] text-white block">Estado del Local</label>
                  <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mt-1">
                    {editableShop.isActive !== false ? '✅ Activo - Visible en la App' : '🚫 Suspendido - No visible'}
                  </p>
                </div>
                <button
                  onClick={() => setEditableShop({ ...editableShop, isActive: editableShop.isActive === false ? true : false })}
                  className={`w-14 h-8 rounded-full relative transition-all duration-300 ${editableShop.isActive !== false ? 'bg-green-500' : 'bg-zinc-700'}`}
                >
                  <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all duration-300 ${editableShop.isActive !== false ? 'left-7 shadow-[0_0_10px_rgba(255,255,255,0.8)]' : 'left-1'}`}></div>
                </button>
              </div>

              {/* Nombre del Comercio */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 block ml-1">Nombre del Comercio</label>
                <input
                  type="text"
                  value={editableShop.name}
                  onChange={(e) => setEditableShop({ ...editableShop, name: e.target.value })}
                  placeholder="Ej: PIZZERÍA EL TANQUE"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-[14px] font-bold text-white focus:border-green-500 focus:ring-0 transition-all shadow-xl"
                />
              </div>

              {/* Zona / Localidad */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 block ml-1">Zona / Localidad</label>
                <div className="grid grid-cols-3 gap-2">
                  {LOCALITIES.map(loc => (
                    <button
                      key={loc}
                      onClick={() => setEditableShop({ ...editableShop, zone: loc, address: `${loc}, Esteban Echeverría` })}
                      className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-wider border transition-all ${editableShop.zone === loc || editableShop.address?.includes(loc) ? 'bg-green-500 border-green-400 text-black shadow-[0_0_15px_rgba(34,197,94,0.4)]' : 'bg-white/5 border-white/10 text-white/40'}`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rubro / Categoría */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 block ml-1">Rubro Oficial</label>
                <div className="relative">
                  <select
                    value={editableShop.category}
                    onChange={(e) => setEditableShop({ ...editableShop, category: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-[13px] font-bold text-white focus:border-green-500 appearance-none cursor-pointer"
                  >
                    <option value="" disabled className="bg-zinc-900">Seleccionar rubro...</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id} className="bg-zinc-900">{cat.name}</option>
                    ))}
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-white/20">
                    <PlusSquare size={16} />
                  </div>
                </div>
              </div>

              {/* Dirección y Teléfono */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 block ml-1">Dirección</label>
                  <input
                    type="text"
                    value={editableShop.address}
                    onChange={(e) => setEditableShop({ ...editableShop, address: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-[12px] font-bold text-white"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 block ml-1">Teléfono (WhatsApp)</label>
                  <input
                    type="tel"
                    value={editableShop.phone || ''}
                    onChange={(e) => setEditableShop({ ...editableShop, phone: e.target.value })}
                    placeholder="11 1234 5678"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-[12px] font-bold text-white"
                  />
                </div>
              </div>

              {/* URL del Banner */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 block ml-1">URL Imagen Portada (Banner)</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={editableShop.bannerImage}
                    onChange={(e) => setEditableShop({ ...editableShop, bannerImage: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-[12px] font-bold text-white"
                  />
                </div>
              </div>

              {/* Redes Sociales */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <Share2 size={16} className="text-blue-400" />
                  <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white">Redes Sociales</h3>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 block ml-1">Instagram (URL)</label>
                    <input
                      type="text"
                      value={editableShop.instagram || ''}
                      onChange={(e) => setEditableShop({ ...editableShop, instagram: e.target.value })}
                      placeholder="https://instagram.com/perfil"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-[11px] text-white/70"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 block ml-1">Facebook (URL)</label>
                    <input
                      type="text"
                      value={editableShop.facebook || ''}
                      onChange={(e) => setEditableShop({ ...editableShop, facebook: e.target.value })}
                      placeholder="https://facebook.com/perfil"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-[11px] text-white/70"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 block ml-1">TikTok (URL)</label>
                    <input
                      type="text"
                      value={editableShop.tiktok || ''}
                      onChange={(e) => setEditableShop({ ...editableShop, tiktok: e.target.value })}
                      placeholder="https://tiktok.com/@usuario"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-[11px] text-white/70"
                    />
                  </div>
                </div>
              </div>

              {/* Google Maps Ficha y Embed */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin size={16} className="text-red-500" />
                  <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white">Configuración de Google Maps</h3>
                </div>

                <div className="space-y-3">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 block ml-1">Ficha Técnica (Link Directo)</label>
                  <input
                    type="text"
                    value={editableShop.mapSheetUrl || ''}
                    onChange={(e) => setEditableShop({ ...editableShop, mapSheetUrl: e.target.value })}
                    placeholder="https://maps.app.goo.gl/..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-[11px] text-white/70"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 block ml-1">HTML Embed (Iframe Compartir)</label>
                  <textarea
                    value={editableShop.mapUrl}
                    onChange={(e) => setEditableShop({ ...editableShop, mapUrl: e.target.value })}
                    placeholder="<iframe src='...'></iframe>"
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-[10px] font-mono text-blue-300 resize-none"
                  />
                </div>
              </div>

              {/* Sección Ofertas (Restaurada) */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <ShoppingBag size={16} className="text-green-500" />
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white">Ofertas / Productos</h3>
                  </div>
                  <button
                    onClick={() => {
                      const newOffer = { id: `off-${Date.now()}`, name: 'NUEVA OFERTA', price: 0, image: DEFAULT_OG_IMAGE };
                      setEditableShop({ ...editableShop, offers: [...(editableShop.offers || []), newOffer] });
                    }}
                    className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center active:scale-90 transition-transform"
                  >
                    <Plus size={16} strokeWidth={3} />
                  </button>
                </div>

                <div className="space-y-3">
                  {(editableShop.offers || []).map((offer, idx) => (
                    <div key={offer.id} className="bg-white/5 p-4 rounded-2xl flex items-center gap-4 border border-white/5">
                      <div
                        className="w-14 h-14 rounded-xl overflow-hidden bg-white/5 flex-shrink-0 border border-white/10"
                      >
                        <img src={offer.image} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-grow space-y-2">
                        <input
                          type="text"
                          value={offer.name}
                          onChange={(e) => {
                            const newOffers = [...editableShop.offers];
                            newOffers[idx].name = e.target.value;
                            setEditableShop({ ...editableShop, offers: newOffers });
                          }}
                          placeholder="Nombre de la oferta"
                          className="bg-transparent border-none p-0 focus:ring-0 text-[12px] font-bold text-white w-full uppercase"
                        />
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1 text-green-500">
                            <span className="text-[10px] font-black">$</span>
                            <input
                              type="number"
                              value={offer.price}
                              onChange={(e) => {
                                const newOffers = [...editableShop.offers];
                                newOffers[idx].price = Number(e.target.value);
                                setEditableShop({ ...editableShop, offers: newOffers });
                              }}
                              className="bg-transparent border-none p-0 focus:ring-0 text-[12px] font-black text-white w-20"
                            />
                          </div>
                          <input
                            type="text"
                            value={offer.image}
                            onChange={(e) => {
                              const newOffers = [...editableShop.offers];
                              newOffers[idx].image = e.target.value;
                              setEditableShop({ ...editableShop, offers: newOffers });
                            }}
                            placeholder="Link Imagen URL"
                            className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[9px] font-bold text-white/50 flex-grow"
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const newOffers = editableShop.offers.filter(o => o.id !== offer.id);
                          setEditableShop({ ...editableShop, offers: newOffers });
                        }}
                        className="text-red-500/30 hover:text-red-500 transition-colors p-2"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Botón Guardar Principal */}
              <div className="pt-6 pb-20">
                <button
                  onClick={handleSaveEdit}
                  className="w-full bg-green-500 text-black py-6 rounded-[2rem] flex items-center justify-center gap-4 text-[14px] font-[1000] uppercase tracking-[0.3em] shadow-[0_10px_30px_rgba(34,197,94,0.3)] border-b-[6px] border-green-700 active:border-b-0 active:translate-y-[6px] transition-all"
                >
                  <Save size={24} strokeWidth={2.5} />
                  Guardar en Firestore
                </button>
              </div>

              {/* Lista de Gestión de Locales (Agregada) */}
              <div className="mt-12 space-y-6">
                <div className="flex items-center gap-3 px-2">
                  <div className="h-[1px] flex-1 bg-white/10"></div>
                  <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Lista de Gestión</h3>
                  <div className="h-[1px] flex-1 bg-white/10"></div>
                </div>

                <div className="space-y-16 pb-32">
                  {CATEGORIES.map((category, catIndex) => {
                    const localitiesInCat = groupedManagementShops[category.id];

                    return (
                      <div key={category.id} className="space-y-6 relative">
                        {/* Línea Separadora entre Rubros */}
                        {catIndex > 0 && (
                          <div className="absolute -top-8 left-0 right-0 h-[1px] bg-white/10 shadow-[0_0_10px_rgba(255,255,255,0.1)]"></div>
                        )}

                        {/* Cabecera de Categoría */}
                        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-3xl border border-white/10 mx-[-8px] shadow-2xl">
                          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white/90 border border-white/20 shadow-inner">
                            {React.cloneElement(category.icon as React.ReactElement<any>, { size: 24, strokeWidth: 1.5 })}
                          </div>
                          <div>
                            <h4 className="text-[14px] font-black text-white uppercase tracking-[0.25em]">{category.name}</h4>
                            <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest mt-0.5">Rubro Oficial</p>
                          </div>
                          <div className="h-[1px] flex-1 bg-white/10 ml-2"></div>
                        </div>

                        <div className="space-y-10 pl-6 border-l-2 border-white/5 ml-1">
                          {LOCALITIES.map(locality => {
                            const shops = localitiesInCat[locality] || [];

                            return (
                              <div key={locality} className="space-y-4">
                                <div className="flex items-center gap-3 ml-[-12px]">
                                  <div className={`w-2.5 h-2.5 rounded-full ${shops.length > 0 ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]'} animate-pulse`}></div>
                                  <span className={`text-[11px] font-[1000] uppercase tracking-[0.2em] ${shops.length > 0 ? 'text-white/80' : 'text-white/20'}`}>
                                    {locality}
                                    <span className="ml-2 text-[8px] opacity-40">({shops.length})</span>
                                  </span>
                                </div>

                                <div className="space-y-3">
                                  {shops.length > 0 ? (
                                    shops.map(shop => (
                                      <div
                                        key={shop.id}
                                        className="bg-zinc-900/40 rounded-[2rem] p-4 border border-white/5 flex items-center justify-between group hover:bg-white/10 transition-all active:scale-[0.98] shadow-lg backdrop-blur-sm"
                                      >
                                        <div
                                          onClick={() => {
                                            setEditableShop({ ...shop });
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                          }}
                                          className="flex items-center gap-4 flex-1 min-w-0 cursor-pointer"
                                        >
                                          <div className="w-12 h-12 rounded-2xl overflow-hidden bg-zinc-800 flex-shrink-0 border border-white/10 shadow-2xl">
                                            <img src={shop.bannerImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <h4 className="text-[12px] font-black text-white uppercase truncate tracking-tight">{shop.name}</h4>
                                            <div className="flex items-center gap-2 mt-1">
                                              <span className={`text-[7px] font-black uppercase tracking-tighter px-2.5 py-1 rounded-full ${shop.isActive !== false ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-400/10 text-red-400 border border-red-400/20'}`}>
                                                {shop.isActive !== false ? 'Activo' : 'Suspendido'}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="flex gap-2">
                                          <button
                                            onClick={() => {
                                              setEditableShop({ ...shop });
                                              window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }}
                                            className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/20 transition-all border border-white/10 shadow-inner group-active:scale-95"
                                          >
                                            <PlusSquare size={18} />
                                          </button>
                                          <button
                                            onClick={() => handleDeleteShop(shop.id)}
                                            className="w-10 h-10 rounded-2xl bg-red-500/5 flex items-center justify-center text-red-500/40 hover:text-red-500 hover:bg-red-500/20 transition-all border border-red-500/10 group-active:scale-95"
                                          >
                                            <Trash2 size={18} />
                                          </button>
                                        </div>
                                      </div>
                                    ))
                                  ) : (
                                    <div className="bg-white/[0.02] border border-dashed border-white/5 rounded-2xl p-4 flex items-center justify-center">
                                      <p className="text-[9px] font-bold text-white/10 uppercase tracking-[0.2em]">Sin comercios cargados</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>



      {/* MODAL DE LOGIN */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setShowLoginModal(false)}></div>

          <div className={`btn-volume relative w-full max-w-[320px] bg-zinc-900 rounded-[2.8rem] p-10 flex flex-col items-center border border-white/10 shadow-2xl transition-all ${loginError ? 'animate-shake' : ''}`}>
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-green-500 mb-8 border border-white/5 shadow-inner">
              <Lock size={32} strokeWidth={2.5} />
            </div>

            <h3 className="text-[14px] font-black text-white uppercase tracking-[0.3em] mb-3">Acceso Admin</h3>
            <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest text-center mb-10">Ingresá la clave de gestión</p>

            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              className="w-full text-center bg-white/5 border-2 border-white/10 rounded-2xl py-5 mb-8 focus:border-green-500 focus:ring-0 transition-all text-white font-black tracking-[0.5em] text-[20px]"
              autoFocus
            />

            <div className="flex flex-col w-full gap-4">
              <button
                onClick={handleLogin}
                className="w-full bg-white text-black py-5 rounded-[1.6rem] text-[11px] font-black uppercase tracking-[0.4em] shadow-lg border-b-[5px] border-gray-300 active:border-b-0 active:translate-y-[5px] transition-all"
              >
                Entrar
              </button>

              <button
                onClick={() => {
                  // Crear un comercio nuevo vacío para cargar
                  setEditableShop({
                    id: '',
                    name: '',
                    category: CATEGORIES[0].id,
                    rating: 5.0,
                    specialty: '',
                    address: '',
                    phone: '',
                    bannerImage: '',
                    image: '',
                    offers: [],
                    mapUrl: '',
                    mapSheetUrl: '',
                    instagram: '',
                    facebook: '',
                    tiktok: ''
                  });
                  handleLogin();
                }}
                className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] hover:text-white/50 transition-colors mt-2"
              >
                + Cargar Nuevo Comercio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;