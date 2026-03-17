import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Shop, Client, Offer } from './types';
import { suscribirseAComercios, suscribirseAClientes, suscribirseAOfertas } from './firebase';
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
import ValidationPage from './pages/ValidationPage';
import SubscriptionPage from './pages/SubscriptionPage';
import AmbassadorPanelPage from './pages/AmbassadorPanelPage';
import ClientSubscriptionPage from './pages/ClientSubscriptionPage';
import ClientsDatabasePage from './pages/ClientsDatabasePage';
import ClientOffersPage from './pages/ClientOffersPage';
import ClientLandingPage from './pages/ClientLandingPage';
import BusinessLandingPage from './pages/BusinessLandingPage';
import ShopManagementPage from './pages/ShopManagementPage';
import ClientManagementPage from './pages/ClientManagementPage';
import ClientCredentialPage from './pages/ClientCredentialPage';
import ClientValidationPage from './pages/ClientValidationPage';
import OfferManagementPage from './pages/OfferManagementPage';
import OfferFormPage from './pages/OfferFormPage';

const App: React.FC = () => {
  const [allShops, setAllShops] = useState<Shop[]>([]);
  const [allClients, setAllClients] = useState<Client[]>([]);
  const [allOffers, setAllOffers] = useState<Offer[]>([]);
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

    const unsubscribeClients = suscribirseAClientes((fbClients) => {
      setAllClients(fbClients as Client[]);
    });

    const unsubscribeOffers = suscribirseAOfertas((fbOffers) => {
      setAllOffers(fbOffers as Offer[]);
    });

    return () => {
      unsubscribe();
      unsubscribeClients();
      unsubscribeOffers();
    };
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
          <Route path=":categorySlug/:shopSlug/validar" element={<ValidationPage allShops={allShops} />} />
          <Route path="red-comercial/descuentos" element={<DiscountsPage allOffers={allOffers} />} />
          <Route path="red-comercial/ofertas" element={<ClientOffersPage allOffers={allOffers} />} />
          <Route path="unirse" element={<LandingPage />} />
          <Route path="negocios" element={<BusinessLandingPage />} />
          <Route path="descubrir" element={<ClientLandingPage />} />
          <Route path="subscripcion" element={<SubscriptionPage />} />
          <Route path="embajador" element={<AmbassadorPanelPage allShops={allShops} />} />
          <Route path="embajador/gestion" element={<ShopManagementPage allShops={allShops} />} />
          <Route path="embajador/clientes" element={<ClientManagementPage allShops={allShops} allClients={allClients} />} />
          <Route path="embajador/ofertas/:target" element={<OfferManagementPage allOffers={allOffers} />} />
          <Route path="embajador/ofertas/crear/:target" element={<OfferFormPage />} />
          <Route path="embajador/ofertas/editar/:offerId" element={<OfferFormPage allOffers={allOffers} />} />
          <Route path="base-clientes" element={<ClientsDatabasePage />} />
          <Route path="nosotros" element={<AboutPage />} />
          <Route path="cliente/:clientId/credencial" element={<ClientCredentialPage />} />
          <Route path="cliente/:clientId/validar" element={<ClientValidationPage />} />
          <Route path=":categorySlug/:shopSlug/cliente-subscripcion" element={<ClientSubscriptionPage allShops={allShops} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;