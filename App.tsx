import React, { useState, useCallback, useMemo, useRef } from 'react';
import { View, Shop, Category } from './types';
import { CATEGORIES, MOCK_SHOPS } from './constants';
import Logo from './components/Logo';
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
  Trash2,
  Camera
} from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.HOME);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);

  // Refs para navegación y archivos
  const catalogRef = useRef<HTMLDivElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const offerInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  // Estado para la edición
  const [editableShop, setEditableShop] = useState<Shop | null>(null);

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
      setCurrentView(View.DETAIL);
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
      setCurrentView(View.EDIT_PANEL);
    } else {
      setLoginError(true);
      setTimeout(() => setLoginError(false), 2000);
    }
  };

  const handleSaveEdit = () => {
    if (editableShop) {
      setSelectedShop(editableShop);
      setCurrentView(View.DETAIL);
      alert('¡Cambios guardados con éxito!');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'banner' | 'offer', offerId?: string) => {
    const file = e.target.files?.[0];
    if (!file || !editableShop) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (type === 'banner') {
        setEditableShop({ ...editableShop, bannerImage: base64String });
      } else if (type === 'offer' && offerId) {
        const newOffers = editableShop.offers.map(o =>
          o.id === offerId ? { ...o, image: base64String } : o
        );
        setEditableShop({ ...editableShop, offers: newOffers });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: selectedShop ? selectedShop.name : 'shopdigital.ar',
        text: selectedShop
          ? `¡Mira el catálogo de ${selectedShop.name} en Esteban Echeverría!`
          : '¡Mira los comercios de Esteban Echeverría!',
        url: window.location.href,
      }).catch(console.error);
    } else {
      alert('Enlace copiado: ' + window.location.href);
    }
  };

  const filteredShops = useMemo(() => {
    if (!selectedCategory) return [];
    return MOCK_SHOPS.filter(shop => shop.category === selectedCategory.id);
  }, [selectedCategory]);

  return (
    <div className={`max-w-md mx-auto h-screen flex flex-col ${currentView === View.HOME ? 'bg-gray-900' : 'bg-white'} overflow-hidden relative border-x border-gray-100 shadow-2xl`}>

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
        <header className={`${(currentView === View.HOME || currentView === View.CATEGORY) ? 'bg-transparent pt-12' : 'bg-white pt-8'} flex-shrink-0 flex flex-col items-center relative z-10 transition-all duration-700`}>
          {currentView === View.HOME ? (
            <div className="glass-header rounded-3xl p-6 mb-4 animate-in fade-in zoom-in duration-1000">
              <Logo />
            </div>
          ) : currentView === View.CATEGORY ? (
            <div className="w-full px-8 flex items-center justify-between py-6">
              <button onClick={handleBack} className="p-2 -ml-2 text-white active:scale-90 transition-transform filter drop-shadow(0 0 5px rgba(255,255,255,0.3))">
                <ChevronLeft size={32} strokeWidth={2.5} />
              </button>
              <div className="glass-header rounded-2xl px-6 py-3 flex flex-col items-center">
                <h2 className="text-[20px] font-[900] text-white uppercase tracking-[0.25em] leading-none text-center text-shadow-premium">
                  {selectedCategory?.name}
                </h2>
              </div>
              <div className="w-12"></div>
            </div>
          ) : (
            <Logo />
          )}

        </header>
      )}

      {/* CONTENIDO PRINCIPAL */}
      <main className={`flex-grow overflow-y-auto no-scrollbar relative z-10 ${currentView === View.DETAIL || currentView === View.EDIT_PANEL ? 'p-0' : 'px-8 pb-12'}`}>

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

            <div className="grid grid-cols-3 gap-x-4 gap-y-10 px-0">
              {CATEGORIES.map((cat, index) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat)}
                  style={{ animationDelay: `${index * 35}ms` }}
                  className="glass-button-3d category-btn fade-up-item aspect-square group"
                >
                  <div className="mb-2 transform group-hover:scale-110 transition-transform duration-500 ease-out">
                    {React.cloneElement(cat.icon as React.ReactElement<any>, { size: 30, strokeWidth: 1.3 })}
                  </div>
                  <span className="text-[9.5px] text-center font-black uppercase leading-tight tracking-[0.01em] px-1">
                    {cat.name}
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-16 mb-16 flex justify-center fade-up-item" style={{ animationDelay: '700ms' }}>
              <button
                onClick={handleShare}
                className={`btn-volume share-btn ${currentView === View.HOME ? 'bg-white/10 backdrop-blur-md border-white/20 text-white' : 'text-[#0A224E]'} py-3.5 px-10 text-[10px] font-black uppercase tracking-[0.2em]`}
              >
                <Share2 size={16} strokeWidth={2.5} />
                Compartir App
              </button>
            </div>
          </div>
        )}

        {/* INTERFAZ 2: LISTADO DE COMERCIOS */}
        {currentView === View.CATEGORY && (
          <div className="grid grid-cols-2 gap-x-3 gap-y-6 px-4 pt-6 animate-in slide-in-from-bottom-6 duration-700 pb-12">
            {filteredShops.length > 0 ? (
              filteredShops.map((shop, index) => (
                <div
                  key={shop.id}
                  style={{ animationDelay: `${index * 80}ms` }}
                  className="glass-card-3d overflow-hidden flex flex-col cursor-default p-3 fade-up-item w-full"
                >
                  {/* Imagen más compacta */}
                  <div className="relative h-28 rounded-2xl overflow-hidden border border-white/10 shadow-lg">
                    <img src={shop.bannerImage} alt={shop.name} className="w-full h-full object-cover transition-transform duration-1000 hover:scale-110" />
                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-xl flex items-center gap-1 shadow-sm border border-white/10">
                      <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                      <span className="text-[10px] font-black text-white">{shop.rating}</span>
                    </div>
                  </div>

                  {/* Cuerpo de tarjeta más ajustado */}
                  <div className="px-1 pt-4 pb-1 flex flex-col items-center text-center">
                    <h3 className="font-black text-[13px] text-white uppercase tracking-tighter leading-tight mb-1 text-shadow-premium line-clamp-1 w-full px-1">
                      {shop.name}
                    </h3>
                    <div className="flex items-center gap-1 text-white/50 uppercase text-[7px] font-bold tracking-[0.2em] mb-4">
                      <MapPin size={8} strokeWidth={3} />
                      <span className="truncate max-w-[100px]">{shop.address}</span>
                    </div>

                    <button
                      onClick={() => handleShopClick(shop)}
                      className="glass-action-btn w-full py-2.5 px-2 text-[9px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 mx-auto"
                    >
                      <BookOpen size={13} strokeWidth={2.5} />
                      Ver Menú
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-24 flex flex-col items-center opacity-40 text-center">
                <div className="p-8 glass-header rounded-full mb-6 border border-white/10 shadow-xl">
                  <div className="text-white">
                    <div className="p-1">
                      <Info size={40} />
                    </div>
                  </div>
                </div>
                <p className="text-[11px] font-black uppercase tracking-[0.3em] max-w-[200px] leading-relaxed text-white text-shadow-premium">Próximamente novedades en esta categoría</p>
              </div>
            )}

            <div className="pt-6 col-span-2 flex justify-center w-full">
              <button
                onClick={handleBack}
                className="glass-action-btn w-[70%] py-3.5 px-6 uppercase tracking-[0.25em] flex items-center justify-center gap-3 mx-auto active:scale-95 transition-all"
              >
                <ArrowLeft size={17} strokeWidth={3} />
                Regresar
              </button>
            </div>
          </div>
        )}

        {/* INTERFAZ 3: DETALLE */}
        {currentView === View.DETAIL && selectedShop && (
          <div className="pb-24 animate-in fade-in duration-700">
            {/* PORTADA ESTIRADA */}
            <div className="relative w-full h-[260px] bg-[#0A224E] overflow-hidden">
              <img src={selectedShop.bannerImage} alt="Banner" className="w-full h-full object-cover opacity-65" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A224E] via-[#0A224E]/20 to-transparent"></div>

              {/* Botón Volver */}
              <button
                onClick={handleBack}
                className="glass-action-btn absolute top-6 left-6 w-10 h-10 rounded-full flex items-center justify-center z-50 transition-all border-white/30"
              >
                <ChevronLeft size={20} strokeWidth={3} />
              </button>

              {/* Nombre del Negocio (Sello Central Superior) */}
              <div className="glass-header absolute top-6 left-1/2 -translate-x-1/2 px-6 h-10 rounded-full flex items-center justify-center z-50 border-white/30 shadow-xl pointer-events-none">
                <span className="text-[10px] font-[900] uppercase tracking-[0.25em] text-white whitespace-nowrap px-1 text-shadow-premium">
                  {selectedShop.name}
                </span>
              </div>

              {/* Botón Autogestión (Candado) */}
              <button
                onClick={() => setShowLoginModal(true)}
                className="glass-action-btn absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center z-50 transition-all border-white/30"
              >
                <Lock size={16} strokeWidth={3} />
              </button>

              <div className="absolute inset-0 flex flex-col justify-end pb-6 px-6">
                <div className="flex items-end justify-between w-full">
                  {/* Etiqueta Especialidad (A un costado, discreto) */}
                  <div className="bg-[#22C55E] text-white px-3 py-1.5 rounded-xl text-[7.5px] font-black uppercase tracking-[0.1em] shadow-lg border border-white/20">
                    {selectedShop.specialty}
                  </div>

                  {/* Botón Menú Online (Discreto y al costado) */}
                  <button
                    onClick={scrollToCatalog}
                    className="glass-action-btn px-5 py-3 rounded-2xl flex items-center justify-center gap-2 z-40 border-white/30"
                  >
                    <BookOpen size={16} strokeWidth={3} />
                    <span className="text-[9px] font-[1000] uppercase tracking-[0.2em]">Menú Online</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="-mt-8 relative z-10 flex flex-col items-center">
              <div className="glass-header px-4 py-1.5 rounded-full border border-white/20 shadow-lg flex items-center gap-2 mb-8">
                <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse"></div>
                <span className="text-[8px] font-black text-white uppercase tracking-[0.4em]">Verificado Oficial</span>
              </div>

              {/* SECCIÓN CATÁLOGO */}
              <div ref={catalogRef} className="w-full mb-10 scroll-mt-24">
                <div className="flex flex-col items-center mb-8 px-6">
                  <div className="flex items-center gap-2">
                    <ShoppingBag size={16} className="text-white filter drop-shadow(0 0 5px rgba(255,255,255,0.4))" />
                    <h3 className="font-black text-white text-[11px] uppercase tracking-[0.5em] text-shadow-premium">
                      Catálogo de Ofertas
                    </h3>
                  </div>
                  <div className="h-[1px] w-8 bg-white/20 mt-3"></div>
                </div>

                <div className="overflow-hidden w-full">
                  <div className="animate-delicate-marquee flex gap-4 px-4">
                    {[...selectedShop.offers, ...selectedShop.offers].map((offer, idx) => (
                      <div
                        key={`${offer.id}-${idx}`}
                        className="glass-card-3d flex-shrink-0 w-40 p-3 flex flex-col active:scale-95 transition-transform"
                      >
                        <div className="rounded-2xl overflow-hidden aspect-square mb-3 border border-white/10 shadow-lg">
                          <img src={offer.image} alt={offer.name} className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" />
                        </div>
                        <div className="px-1 pb-1 text-center">
                          <p className="text-[9.5px] font-black uppercase tracking-tight text-white mb-3 line-clamp-1 text-shadow-premium">
                            {offer.name}
                          </p>
                          <div className="glass-action-btn py-2 px-3 rounded-xl border-white/20">
                            <span className="text-[11px] font-black text-white">$ {offer.price.toLocaleString('es-AR')}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* TRIO DE BOTONES DE ACCIÓN */}
              <div className="w-full px-4 mb-12 grid grid-cols-3 gap-3">
                <button className="glass-action-btn w-full bg-[#FF0000]/20 hover:bg-[#FF0000]/30 py-4 flex flex-col items-center justify-center gap-1 border-[#FF0000]/40">
                  <span className="italic text-[20px] leading-none -mb-1 text-[#FF0000] filter drop-shadow(0 0 5px rgba(255,0,0,0.5))">P</span>
                  <span className="text-[8.5px] font-black text-white/90">PedidosYa</span>
                </button>
                <button className="glass-action-btn w-full bg-[#25D366]/20 hover:bg-[#25D366]/30 py-4 flex flex-col items-center justify-center gap-1 border-[#25D366]/40">
                  <MessageCircle size={18} className="text-[#25D366] filter drop-shadow(0 0 5px rgba(37,211,102,0.5))" fill="currentColor" strokeWidth={0} />
                  <span className="text-[8.5px] font-black text-white/90">WhatsApp</span>
                </button>
                <button className="glass-action-btn w-full bg-[#009EE3]/20 hover:bg-[#009EE3]/30 py-4 flex flex-col items-center justify-center gap-1 border-[#009EE3]/40">
                  <Handshake size={18} className="text-[#009EE3] filter drop-shadow(0 0 5px rgba(0,158,227,0.5))" strokeWidth={2.5} />
                  <span className="text-[8.5px] font-black text-white/90">M. Pago</span>
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

                <div className="glass-card-3d w-full h-64 overflow-hidden bg-black/20 relative shadow-2xl mb-6">
                  <iframe
                    title="Ubicación del comercio"
                    src={selectedShop.mapUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0, filter: 'grayscale(0.3) contrast(1.2) brightness(0.8)' }}
                    allowFullScreen={false}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>

                <div className="mt-4 text-center px-4 mb-8">
                  <p className="text-[10px] font-bold text-white/50 uppercase tracking-[0.25em] leading-relaxed text-shadow-premium">
                    {selectedShop.address}
                  </p>
                </div>

                <div className="flex flex-col gap-4 w-full px-2">
                  <div className="grid grid-cols-2 gap-4 w-full">
                    <button
                      onClick={() => window.open(selectedShop.mapUrl, '_blank')}
                      className="glass-action-btn w-full bg-white/5 py-4 flex items-center justify-center gap-2 border-white/20"
                    >
                      <Navigation size={18} strokeWidth={2.5} className="text-white" />
                      <span className="text-[10px] font-black uppercase tracking-[0.1em]">Cómo llegar</span>
                    </button>
                    <button
                      className="glass-action-btn w-full bg-black/40 py-4 flex items-center justify-center gap-2 border-white/20"
                    >
                      <Car size={18} strokeWidth={2.5} className="text-white" />
                      <span className="text-[10px] font-black uppercase tracking-[0.1em]">Uber</span>
                    </button>
                  </div>

                  <button
                    onClick={handleShare}
                    className="glass-action-btn w-full py-5 flex items-center justify-center gap-3 border-white/30"
                  >
                    <Share2 size={20} strokeWidth={2.5} />
                    <span className="text-[11px] font-[1000] uppercase tracking-[0.2em]">Compartir Catálogo Online</span>
                  </button>
                </div>
              </div>

              <div className="w-full flex justify-center mt-10 mb-12">
                <button
                  onClick={handleBack}
                  className="glass-action-btn w-[70%] py-4 px-6 uppercase tracking-[0.25em] flex items-center justify-center gap-3 mx-auto transition-all"
                >
                  <ArrowLeft size={18} strokeWidth={3} />
                  <span className="text-[10px] font-black">Regresar a Locales</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* INTERFAZ: PANEL DE EDICIÓN */}
        {currentView === View.EDIT_PANEL && editableShop && (
          <div className="pb-24 animate-in slide-in-from-right duration-500 bg-[#E8F5EA] min-h-screen">
            {/* Header del Panel */}
            <div className="bg-white pt-8 pb-6 px-8 flex flex-col items-center shadow-sm border-b border-[#0A224E]/5 mb-8">
              <button
                onClick={handleBack}
                className="btn-volume self-start mb-4 w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#0A224E] border-[#0A224E]/20"
              >
                <ChevronLeft size={18} strokeWidth={3} />
              </button>
              <h2 className="text-[20px] font-black text-[#0A224E] uppercase tracking-[0.2em] mb-1">Panel de Edición</h2>
              <p className="text-[10px] font-bold text-[#0A224E]/40 uppercase tracking-widest">{editableShop.name}</p>
            </div>

            <div className="px-8 space-y-10">
              {/* Sección Portada */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <ImageIcon size={16} className="text-[#0A224E]/40" />
                  <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#0A224E]">Imagen de Portada</h3>
                </div>

                <input
                  type="file"
                  ref={bannerInputRef}
                  onChange={(e) => handleImageUpload(e, 'banner')}
                  accept="image/*"
                  className="hidden"
                />

                <div
                  onClick={() => bannerInputRef.current?.click()}
                  className="btn-volume relative h-36 rounded-3xl overflow-hidden border-2 border-[#0A224E]/10 shadow-inner group cursor-pointer active:scale-95 transition-transform"
                >
                  <img src={editableShop.bannerImage} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera size={24} className="text-white mb-2" />
                    <span className="text-white text-[9px] font-black uppercase tracking-widest text-center">Toca para subir desde galería</span>
                  </div>
                </div>
              </div>

              {/* Sección Ofertas */}
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <ShoppingBag size={16} className="text-[#0A224E]/40" />
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#0A224E]">Ofertas del Catálogo</h3>
                  </div>
                  <button className="w-8 h-8 rounded-full bg-[#0A224E] text-white flex items-center justify-center active:scale-90 transition-transform">
                    <Plus size={16} strokeWidth={3} />
                  </button>
                </div>

                <div className="space-y-3">
                  {editableShop.offers.map((offer, idx) => (
                    <div key={offer.id} className="btn-volume bg-white p-3 rounded-2xl flex items-center gap-4 hover:top-0 active:top-0 cursor-default">
                      <input
                        type="file"
                        ref={el => offerInputRefs.current[offer.id] = el}
                        onChange={(e) => handleImageUpload(e, 'offer', offer.id)}
                        accept="image/*"
                        className="hidden"
                      />

                      <div
                        onClick={() => offerInputRefs.current[offer.id]?.click()}
                        className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 relative group cursor-pointer border border-[#0A224E]/5"
                      >
                        <img src={offer.image} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Camera size={12} className="text-white" />
                        </div>
                      </div>

                      <div className="flex-grow flex flex-col gap-1">
                        <input
                          type="text"
                          value={offer.name}
                          onChange={(e) => {
                            const newOffers = [...editableShop.offers];
                            newOffers[idx].name = e.target.value;
                            setEditableShop({ ...editableShop, offers: newOffers });
                          }}
                          className="text-[10px] font-black uppercase tracking-tight text-[#0A224E] bg-transparent border-none p-0 focus:ring-0 w-full"
                        />
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-black text-[#0A224E]/50">$</span>
                          <input
                            type="number"
                            value={offer.price}
                            onChange={(e) => {
                              const newOffers = [...editableShop.offers];
                              newOffers[idx].price = Number(e.target.value);
                              setEditableShop({ ...editableShop, offers: newOffers });
                            }}
                            className="text-[10px] font-black text-[#0A224E] bg-transparent border-none p-0 focus:ring-0 w-20"
                          />
                        </div>
                      </div>
                      <button className="text-[#FF0000]/30 hover:text-[#FF0000] transition-colors p-1">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sección Contacto */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <MessageCircle size={16} className="text-[#0A224E]/40" />
                  <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#0A224E]">Configurar WhatsApp</h3>
                </div>
                <div className="btn-volume bg-white p-4 rounded-2xl flex items-center gap-3">
                  <span className="text-[12px] font-black text-[#0A224E]/30">+54 9</span>
                  <input
                    type="tel"
                    placeholder="11 1234 5678"
                    className="text-[12px] font-black text-[#0A224E] bg-transparent border-none p-0 focus:ring-0 w-full"
                  />
                </div>
              </div>

              {/* Botón Guardar */}
              <div className="pt-8 flex flex-col items-center">
                <button
                  onClick={handleSaveEdit}
                  className="btn-volume w-full bg-[#22C55E] text-white py-5 rounded-[1.8rem] flex items-center justify-center gap-3 text-[13px] font-[900] uppercase tracking-[0.25em] shadow-xl border-[#15803d] border-bottom-[6px] active:border-bottom-[1px] active:scale-95 transition-all mb-10"
                >
                  <Save size={20} strokeWidth={2.5} />
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL DE LOGIN */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-[#0A224E]/60 backdrop-blur-md" onClick={() => setShowLoginModal(false)}></div>

          <div className={`btn-volume relative w-full max-w-[300px] bg-white rounded-[2.5rem] p-8 flex flex-col items-center border-[#0A224E]/20 shadow-2xl transition-all ${loginError ? 'animate-shake' : ''}`}>
            <div className="w-16 h-16 rounded-full bg-[#E8F5EA] flex items-center justify-center text-[#0A224E] mb-6 border border-[#0A224E]/5 shadow-inner">
              <Lock size={28} strokeWidth={2.5} />
            </div>

            <h3 className="text-[13px] font-black text-[#0A224E] uppercase tracking-[0.2em] mb-2">Acceso Dueño</h3>
            <p className="text-[9px] font-bold text-[#0A224E]/40 uppercase tracking-widest text-center mb-8">Ingresá la contraseña de gestión</p>

            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              className="w-full text-center bg-gray-50 border-2 border-[#0A224E]/10 rounded-2xl py-4 mb-6 focus:border-[#22C55E] focus:ring-0 transition-colors text-[#0A224E] font-black tracking-widest text-[16px]"
              autoFocus
            />

            <button
              onClick={handleLogin}
              className="btn-volume w-full bg-[#0A224E] text-white py-4 rounded-[1.4rem] text-[10px] font-black uppercase tracking-[0.3em] shadow-lg border-[#061633] border-bottom-[5px] active:border-bottom-[1px]"
            >
              Entrar
            </button>

            <button
              onClick={() => setShowLoginModal(false)}
              className="mt-6 text-[8px] font-black text-[#0A224E]/30 uppercase tracking-[0.4em] hover:text-[#0A224E] transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;