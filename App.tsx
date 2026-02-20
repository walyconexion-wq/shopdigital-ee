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
    <div className="max-w-md mx-auto h-screen flex flex-col bg-white overflow-hidden relative border-x border-gray-100 shadow-2xl">
      
      {/* HEADER: Identidad Visual */}
      {currentView !== View.DETAIL && currentView !== View.EDIT_PANEL && (
        <header className="bg-white flex-shrink-0 flex flex-col items-center pt-8">
          <Logo />
          
          {currentView === View.CATEGORY && selectedCategory && (
            <div className="w-full px-8 flex items-center justify-between py-10 border-b border-gray-50 mt-2 bg-white sticky top-0 z-20 animate-in fade-in slide-in-from-top-4 duration-500">
               <button onClick={handleBack} className="p-2 -ml-2 text-[#0A224E] active:scale-90 transition-transform">
                  <ChevronLeft size={32} strokeWidth={2.5} />
               </button>
               <div className="flex flex-col items-center">
                 <h2 className="text-[24px] font-[900] text-[#0A224E] uppercase tracking-[0.25em] leading-none text-center">
                   {selectedCategory.name}
                 </h2>
                 <div className="flex gap-2 mt-4">
                   <div className="w-2 h-2 rounded-full bg-[#22C55E]"></div>
                   <div className="w-2 h-2 rounded-full bg-[#FF0000]"></div>
                   <div className="w-2 h-2 rounded-full bg-[#0A224E]"></div>
                 </div>
               </div>
               <div className="w-10"></div>
            </div>
          )}
        </header>
      )}

      {/* CONTENIDO PRINCIPAL */}
      <main className={`flex-grow overflow-y-auto no-scrollbar ${currentView === View.DETAIL || currentView === View.EDIT_PANEL ? 'p-0' : 'px-8 pb-12'}`}>
        
        {/* INTERFAZ 1: HOME */}
        {currentView === View.HOME && (
          <div className="flex flex-col pt-2 pb-12 animate-in fade-in duration-700">
            <div className="flex flex-col items-center mb-10 mt-2 fade-up-item">
              <div className="h-[1px] w-12 bg-[#0A224E]/10 mb-5"></div>
              <h2 className="text-[10px] font-black text-[#0A224E] uppercase tracking-[0.4em] text-center">
                Seleccionar Categoría
              </h2>
              <div className="flex gap-1.5 mt-4">
                <div className="w-1 h-1 rounded-full bg-[#22C55E]"></div>
                <div className="w-1 h-1 rounded-full bg-[#FF0000]"></div>
                <div className="w-1 h-1 rounded-full bg-[#0A224E]"></div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-x-5 gap-y-9 px-1">
              {CATEGORIES.map((cat, index) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat)}
                  style={{ animationDelay: `${index * 35}ms` }}
                  className="btn-volume category-btn fade-up-item aspect-square group"
                >
                  <div className="text-[#0A224E] mb-2 transform group-hover:scale-110 transition-transform duration-500 ease-out">
                    {React.cloneElement(cat.icon as React.ReactElement<any>, { size: 30, strokeWidth: 1.3 })}
                  </div>
                  <span className="text-[8.5px] text-center font-black text-[#0A224E] uppercase leading-tight tracking-[0.01em] px-1">
                    {cat.name}
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-16 mb-16 flex justify-center fade-up-item" style={{ animationDelay: '700ms' }}>
              <button
                onClick={handleShare}
                className="btn-volume share-btn text-[#0A224E] py-3.5 px-10 text-[10px] font-black uppercase tracking-[0.2em]"
              >
                <Share2 size={16} strokeWidth={2.5} />
                Compartir App
              </button>
            </div>
          </div>
        )}

        {/* INTERFAZ 2: LISTADO DE COMERCIOS */}
        {currentView === View.CATEGORY && (
          <div className="space-y-12 pt-12 animate-in slide-in-from-bottom-6 duration-700 pb-24">
            {filteredShops.length > 0 ? (
              filteredShops.map((shop, index) => (
                <div 
                  key={shop.id} 
                  style={{ 
                    animationDelay: `${index * 100}ms`,
                    backgroundColor: '#D1E7D5' 
                  }}
                  className="btn-volume rounded-[3rem] overflow-hidden flex flex-col cursor-default p-5 hover:top-0 active:top-0 fade-up-item max-w-[340px] mx-auto border-[#0A224E]/25"
                >
                  <div className="relative h-44 rounded-[2.2rem] overflow-hidden border border-[#0A224E]/10 shadow-lg">
                    <img src={shop.bannerImage} alt={shop.name} className="w-full h-full object-cover transition-transform duration-1000 hover:scale-110" />
                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl flex items-center gap-2 shadow-sm border border-[#0A224E]/5">
                      <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                      <span className="text-[12px] font-black text-[#0A224E]">{shop.rating}</span>
                    </div>
                  </div>

                  <div className="px-4 pt-7 pb-3 flex flex-col items-center text-center">
                    <h3 className="font-black text-[19px] text-[#0A224E] uppercase tracking-tighter leading-tight mb-2">
                      {shop.name}
                    </h3>
                    <div className="flex items-center gap-2 text-[#0A224E]/30 uppercase text-[8.5px] font-bold tracking-[0.3em] mb-8">
                      <MapPin size={10} strokeWidth={3} />
                      <span className="truncate max-w-[180px]">{shop.address}</span>
                    </div>

                    <button 
                      onClick={() => handleShopClick(shop)}
                      className="btn-volume w-[85%] bg-white text-[#0A224E] text-[10px] font-black py-4 px-6 rounded-[1.5rem] uppercase tracking-[0.25em] flex items-center justify-center gap-3 transition-all border-[#0A224E] border-bottom-[5px] shadow-sm active:border-bottom-[1px] mx-auto"
                    >
                      <BookOpen size={17} strokeWidth={2.5} />
                      Ver Catálogo
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-24 flex flex-col items-center opacity-30 text-center">
                <div className="p-8 bg-[#E8F5EA] rounded-full mb-6 border border-[#0A224E]/10">
                  <div className="text-[#0A224E]">
                    <div className="p-1">
                      <Info size={40} />
                    </div>
                  </div>
                </div>
                <p className="text-[11px] font-black uppercase tracking-[0.3em] max-w-[200px] leading-relaxed">Próximamente novedades en esta categoría</p>
              </div>
            )}
            
            <div className="pt-10 flex justify-center w-full">
              <button 
                onClick={handleBack} 
                className="btn-volume w-[85%] max-w-[340px] bg-white text-[#0A224E] text-[10px] font-black py-4 px-6 rounded-[1.5rem] uppercase tracking-[0.25em] flex items-center justify-center gap-3 transition-all border-[#0A224E] border-bottom-[5px] shadow-md active:border-bottom-[1px] mx-auto active:scale-95"
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
                className="btn-volume absolute top-6 left-6 w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#0A224E] z-50 border-[#0A224E]/20 shadow-lg"
              >
                <ChevronLeft size={18} strokeWidth={3} />
              </button>

              {/* Nombre del Negocio (Sello Central Superior) */}
              <div className="btn-volume absolute top-6 left-1/2 -translate-x-1/2 px-5 h-9 rounded-full bg-white flex items-center justify-center z-50 border-[#0A224E]/20 shadow-lg pointer-events-none">
                <span className="text-[9px] font-[900] uppercase tracking-[0.2em] text-[#0A224E] whitespace-nowrap px-1">
                  {selectedShop.name}
                </span>
              </div>

              {/* Botón Autogestión (Candado) */}
              <button 
                onClick={() => setShowLoginModal(true)}
                className="btn-volume absolute top-6 right-6 w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#0A224E] z-50 border-[#0A224E]/20 shadow-lg"
              >
                <Lock size={15} strokeWidth={3} />
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
                    className="btn-volume px-4 py-2.5 rounded-[1.2rem] bg-white flex items-center justify-center gap-2 text-[#0A224E] z-40 border-[#0A224E]/15 shadow-xl active:scale-95 transition-all"
                  >
                    <BookOpen size={14} strokeWidth={3} />
                    <span className="text-[8.5px] font-[1000] uppercase tracking-[0.15em]">Menú Online</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="-mt-8 relative z-10 flex flex-col items-center">
               <div className="bg-white px-3 py-1 rounded-full border border-gray-100 shadow-sm flex items-center gap-1.5 mb-6">
                  <div className="w-1 h-1 rounded-full bg-[#22C55E]"></div>
                  <span className="text-[7px] font-black text-[#0A224E]/40 uppercase tracking-[0.3em]">Oficial</span>
               </div>

               {/* SECCIÓN CATÁLOGO */}
               <div ref={catalogRef} className="w-full mb-8 scroll-mt-24">
                  <div className="flex flex-col items-center mb-6 px-6">
                    <div className="flex items-center gap-2 opacity-60">
                      <ShoppingBag size={14} className="text-[#0A224E]" />
                      <h3 className="font-black text-[#0A224E] text-[10px] uppercase tracking-[0.4em]">
                        Catálogo de Ofertas
                      </h3>
                    </div>
                    <div className="h-[1px] w-4 bg-[#0A224E]/10 mt-1.5"></div>
                  </div>
                  
                  <div className="overflow-hidden w-full">
                    <div className="animate-delicate-marquee flex gap-4 px-4">
                      {[...selectedShop.offers, ...selectedShop.offers].map((offer, idx) => (
                        <div 
                          key={`${offer.id}-${idx}`} 
                          className="btn-volume flex-shrink-0 w-36 rounded-[1.8rem] bg-[#D1E7D5] p-2 flex flex-col border-[#0A224E]/15 active:scale-95 transition-transform"
                        >
                          <div className="rounded-[1.4rem] overflow-hidden aspect-square mb-2.5 border border-[#0A224E]/5 shadow-sm">
                            <img src={offer.image} alt={offer.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="px-1 pb-0.5 text-center">
                            <p className="text-[8.5px] font-black uppercase tracking-tight text-[#0A224E] mb-2 line-clamp-1">
                              {offer.name}
                            </p>
                            <div className="btn-volume bg-white text-[#0A224E] py-1 px-2 rounded-lg border-[#0A224E]/15">
                              <span className="text-[9px] font-black">${offer.price.toLocaleString('es-AR')}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
               </div>

               {/* TRIO DE BOTONES DE ACCIÓN */}
               <div className="w-full px-4 mb-10 grid grid-cols-3 gap-2">
                  <button className="btn-volume w-full bg-[#FF0000] text-white py-4 rounded-[1.4rem] flex flex-col items-center justify-center gap-1 text-[8px] font-[950] uppercase tracking-[0.05em] shadow-lg border-[#0A224E] border-bottom-[5px] active:border-bottom-[1px] active:scale-95 transition-all">
                    <span className="italic text-[16px] leading-none -mb-1">P</span>
                    <span>PedidosYa</span>
                  </button>
                  <button className="btn-volume w-full bg-[#25D366] text-white py-4 rounded-[1.4rem] flex flex-col items-center justify-center gap-1 text-[8px] font-[950] uppercase tracking-[0.05em] shadow-lg border-[#0A224E] border-bottom-[5px] active:border-bottom-[1px] active:scale-95 transition-all">
                    <MessageCircle size={16} fill="currentColor" strokeWidth={0} />
                    <span>WhatsApp</span>
                  </button>
                  <button className="btn-volume w-full bg-[#009EE3] text-white py-4 rounded-[1.4rem] flex flex-col items-center justify-center gap-1 text-[8px] font-[950] uppercase tracking-[0.05em] shadow-lg border-[#0A224E] border-bottom-[5px] active:border-bottom-[1px] active:scale-95 transition-all">
                    <Handshake size={16} strokeWidth={2.5} />
                    <span>M. Pago</span>
                  </button>
               </div>

               {/* SECCIÓN MAPA */}
               <div className="w-full px-6 mb-10">
                  <div className="flex flex-col items-center mb-5">
                    <div className="flex items-center gap-2 opacity-60">
                      <MapPin size={14} className="text-[#0A224E]" />
                      <h3 className="font-black text-[#0A224E] text-[10px] uppercase tracking-[0.4em]">
                        Ubicación del Local
                      </h3>
                    </div>
                    <div className="h-[1px] w-4 bg-[#0A224E]/10 mt-1.5"></div>
                  </div>

                  <div className="btn-volume w-full h-64 rounded-[2.5rem] overflow-hidden border-[#0A224E]/15 bg-white relative shadow-sm mb-4">
                    <iframe 
                      title="Ubicación del comercio"
                      src={selectedShop.mapUrl} 
                      width="100%" 
                      height="100%" 
                      style={{ border: 0, filter: 'grayscale(0.1) contrast(1.1)' }} 
                      allowFullScreen={false} 
                      loading="lazy" 
                      referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                  </div>
                  
                  <div className="mt-4 text-center px-4 mb-6">
                     <p className="text-[9px] font-bold text-[#0A224E]/60 uppercase tracking-widest leading-relaxed">
                        {selectedShop.address}
                     </p>
                  </div>

                  <div className="flex flex-col gap-3 w-full px-2">
                    <div className="grid grid-cols-2 gap-3 w-full">
                      <button 
                        onClick={() => window.open(selectedShop.mapUrl, '_blank')}
                        className="btn-volume w-full bg-[#0A224E] text-white py-4 rounded-[1.6rem] flex items-center justify-center gap-2 text-[10px] font-[900] uppercase tracking-[0.1em] shadow-lg border-[#061633] border-bottom-[5px] active:border-bottom-[1px] active:scale-95 transition-all"
                      >
                        <Navigation size={16} strokeWidth={2.5} />
                        Cómo llegar
                      </button>
                      <button 
                        className="btn-volume w-full bg-black text-white py-4 rounded-[1.6rem] flex items-center justify-center gap-2 text-[10px] font-[900] uppercase tracking-[0.1em] shadow-lg border-gray-800 border-bottom-[5px] active:border-bottom-[1px] active:scale-95 transition-all"
                      >
                        <Car size={16} strokeWidth={2.5} />
                        Uber
                      </button>
                    </div>

                    <button 
                      onClick={handleShare}
                      className="btn-volume w-full bg-white text-[#0A224E] py-4 rounded-[1.6rem] flex items-center justify-center gap-3 text-[11px] font-[900] uppercase tracking-[0.2em] shadow-lg border-[#0A224E] border-bottom-[5px] active:border-bottom-[1px] active:scale-95 transition-all"
                    >
                      <Share2 size={18} strokeWidth={2.5} />
                      Compartir Catálogo Online
                    </button>
                  </div>
               </div>

               <div className="w-full flex justify-center mt-6 mb-12">
                  <button 
                    onClick={handleBack}
                    className="btn-volume w-[60%] bg-white text-[#0A224E] py-3 px-6 rounded-[1.2rem] flex items-center justify-center gap-2 text-[9px] font-[900] uppercase tracking-[0.25em] shadow-sm border-[#0A224E] border-bottom-[4px] active:border-bottom-[1px] active:scale-95 transition-all"
                  >
                    <ArrowLeft size={14} strokeWidth={3} />
                    Volver
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
                            setEditableShop({...editableShop, offers: newOffers});
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
                              setEditableShop({...editableShop, offers: newOffers});
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