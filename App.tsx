import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Shop } from './types';
import { suscribirseAComercios } from './firebase';
import LoadingScreen from './components/LoadingScreen';
import Layout from './components/Layout';
import Home from './pages/Home';
import CategoryPage from './pages/CategoryPage';
import ShopDetailPage from './pages/ShopDetailPage';
import CredencialPage from './pages/CredencialPage';
import AdminPanelPage from './pages/AdminPanelPage';
import DiscountsPage from './pages/DiscountsPage';
import LandingPage from './pages/LandingPage';
import AboutPage from './pages/AboutPage';

const App: React.FC = () => {
  const [allShops, setAllShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLoader, setShowLoader] = useState(true);

  const DEFAULT_BANNER = "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=400&fit=crop";

  useEffect(() => {
    const unsubscribe = suscribirseAComercios((fbShops) => {
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

  return (
    <BrowserRouter>
      {showLoader && (
        <LoadingScreen ready={!loading} onDone={() => setShowLoader(false)} />
      )}

      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path=":categorySlug" element={<CategoryPage allShops={allShops} />} />
          <Route path=":categorySlug/:shopSlug" element={<ShopDetailPage allShops={allShops} />} />
          <Route path=":categorySlug/:shopSlug/credencial" element={<CredencialPage allShops={allShops} />} />
          <Route path=":categorySlug/:shopSlug/panel-autogestion" element={<AdminPanelPage allShops={allShops} />} />
          <Route path="red-comercial/descuentos" element={<DiscountsPage />} />
          <Route path="unirse" element={<LandingPage />} />
          <Route path="nosotros" element={<AboutPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;