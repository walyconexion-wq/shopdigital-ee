import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useParams, Navigate, useLocation } from 'react-router-dom';
import { Shop, Client, Offer } from './types';
import { 
  suscribirseAComercios, suscribirseAClientes, suscribirseAOfertas, 
  subscribeToGlobalConfig, migrarDatosLegados 
} from './firebase';
import LoadingScreen from './components/LoadingScreen';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import CategoryPage from './pages/CategoryPage';
import ShopDetailPage from './pages/ShopDetailPage';
import CredencialPage from './pages/CredencialPage';
import AdminPanelPage from './pages/AdminPanelPage';
import DiscountsPage from './pages/DiscountsPage';
import LandingPage from './pages/LandingPage';
import AboutPage from './pages/AboutPage';
import MasterPanelPage from './pages/MasterPanelPage';
import ValidationPage from './pages/ValidationPage';
import SubscriptionPage from './pages/SubscriptionPage';
import AmbassadorPanelPage from './pages/AmbassadorPanelPage';
import AmbassadorRecruitPage1 from './pages/AmbassadorRecruitPage1';
import AmbassadorRecruitPage2 from './pages/AmbassadorRecruitPage2';
import AmbassadorRecruitmentAdminPage from './pages/AmbassadorRecruitmentAdminPage';
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
import BillingManagementPage from './pages/BillingManagementPage';
import InvoiceViewerPage from './pages/InvoiceViewerPage';
import TermsPage from './pages/TermsPage';
import SurveyFormPage from './pages/SurveyFormPage';
import SurveyManagementPage from './pages/SurveyManagementPage';
import ShopMenuPage from './pages/ShopMenuPage';
import ShopEditPage from './pages/ShopEditPage';
import GlobalConfigPage from './pages/GlobalConfigPage';
import FactoryPanelPage from './pages/FactoryPanelPage';

const DEFAULT_BANNER = "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=400&fit=crop";

// --- TOWN CONTROLLER COMPONENT ---
// Este componente extrae el townId de la URL y maneja toda la lógica de suscripciones
const TownController: React.FC = () => {
    const { townId = 'esteban-echeverria' } = useParams<{ townId: string }>();
    const location = useLocation();
    
    const [allShops, setAllShops] = useState<Shop[]>([]);
    const [allClients, setAllClients] = useState<Client[]>([]);
    const [allOffers, setAllOffers] = useState<Offer[]>([]);
    const [loading, setLoading] = useState(true);
    const [showLoader, setShowLoader] = useState(true);
    const [globalConfig, setGlobalConfig] = useState<any>({
        mainTitle: "ShopDigital",
        mainSubtitle: "Tu guía de ofertas locales",
        theme: 'default',
        primaryColor: '#22d3ee',
        townName: townId === 'esteban-echeverria' ? "Esteban Echeverría" : townId
    });

    // --- REPAIR TRIGGER VIA URL (?repair=true) ---
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('repair') === 'true') {
            console.log("🛠️ ACTIVADOR MAESTRO DETECTADO: Iniciando reparación de emergencia...");
            migrarDatosLegados(townId)
                .then(result => {
                    console.log("✅ REPARACIÓN EXITOSA:", result);
                    alert("¡SISTEMA REESTABLECIDO! Los datos han sido resucitados.");
                    window.history.replaceState({}, '', window.location.pathname);
                })
                .catch(err => {
                    console.error("❌ ERROR EN REPARACIÓN:", err);
                    alert("Fallo en el rescate: " + err.message);
                });
        }
    }, [location.search, townId]);

    useEffect(() => {
        // 🧹 LIMPIEZA DE CACHÉ: resetear estado al cambiar de zona para evitar mezcla de datos
        setAllShops([]);
        setAllClients([]);
        setAllOffers([]);
        setLoading(true);
        const fallbackTimer = setTimeout(() => setLoading(false), 8000);

        const unsubscribe = suscribirseAComercios((fbShops) => {
            const cleanedShops = fbShops
                .filter(shop => shop && shop.name)
                .map(shop => ({
                    ...shop,
                    bannerImage: shop.bannerImage || DEFAULT_BANNER,
                    image: shop.image || shop.bannerImage || DEFAULT_BANNER,
                    offers: shop.offers || []
                }));

            setAllShops(cleanedShops);
            setLoading(false);
            clearTimeout(fallbackTimer);
        }, townId, (error) => {
            console.error("Critical: failed to get shops.", error);
            setLoading(false);
            clearTimeout(fallbackTimer);
        });

        const unsubscribeClients = suscribirseAClientes((fbClients) => {
            setAllClients(fbClients as Client[]);
        }, townId);

        const unsubscribeOffers = suscribirseAOfertas((fbOffers) => {
            setAllOffers(fbOffers as Offer[]);
        }, townId);

        const unsubscribeGlobal = subscribeToGlobalConfig((config: any) => {
            if (config) setGlobalConfig(config);
        }, townId);

        return () => {
            unsubscribe();
            unsubscribeClients();
            unsubscribeOffers();
            unsubscribeGlobal();
        };
    }, [townId]);

    return (
        <>
            {showLoader && (
                <LoadingScreen ready={!loading} onDone={() => setShowLoader(false)} />
            )}

            <Routes>
                <Route path="/" element={<Layout allShops={allShops} globalConfig={globalConfig} />}>
                    <Route index element={<Navigate to="home" replace />} />
                    <Route path="home" element={<Home globalConfig={globalConfig} />} />
                    <Route path=":categorySlug" element={<CategoryPage allShops={allShops} globalConfig={globalConfig} />} />
                    <Route path=":categorySlug/:shopSlug" element={<ShopDetailPage allShops={allShops} />} />
                    <Route path=":categorySlug/:shopSlug/menu" element={<ShopMenuPage allShops={allShops} />} />
                    <Route path=":categorySlug/:shopSlug/credencial" element={<CredencialPage allShops={allShops} />} />
                    <Route path=":categorySlug/:shopSlug/panel-autogestion" element={<AdminPanelPage allShops={allShops} allClients={allClients} />} />
                    <Route path=":categorySlug/:shopSlug/validar" element={<ValidationPage allShops={allShops} />} />
                    <Route path="red-comercial/descuentos" element={<DiscountsPage allOffers={allOffers} />} />
                    <Route path="red-comercial/ofertas" element={<ClientOffersPage allOffers={allOffers} />} />
                    <Route path="unirse" element={<LandingPage />} />
                    <Route path="negocios" element={<BusinessLandingPage />} />
                    <Route path="descubrir" element={<ClientLandingPage />} />
                    <Route path="subscripcion" element={<SubscriptionPage />} />
                    <Route path="reclutamiento" element={<AmbassadorRecruitPage1 />} />
                    <Route path="reclutamiento/alta/:id" element={<AmbassadorRecruitPage2 />} />
                    <Route path="embajador" element={<ProtectedRoute roles={['admin', 'ambassador']}><AmbassadorPanelPage allShops={allShops} /></ProtectedRoute>} />
                    <Route path="embajador/gestion" element={<ProtectedRoute roles={['admin', 'ambassador']}><ShopManagementPage allShops={allShops} /></ProtectedRoute>} />
                    <Route path="embajador/editar/:shopId" element={<ProtectedRoute roles={['admin', 'ambassador']}><ShopEditPage allShops={allShops} /></ProtectedRoute>} />
                    <Route path=":categorySlug/:shopSlug/editar" element={<ShopEditPage allShops={allShops} />} />
                    <Route path="embajador/clientes" element={<ProtectedRoute roles={['admin', 'ambassador']}><ClientManagementPage allShops={allShops} allClients={allClients} /></ProtectedRoute>} />
                    <Route path="embajador/ofertas/:target" element={<ProtectedRoute roles={['admin', 'ambassador']}><OfferManagementPage allOffers={allOffers} /></ProtectedRoute>} />
                    <Route path="embajador/ofertas/crear/:target" element={<ProtectedRoute roles={['admin', 'ambassador']}><OfferFormPage /></ProtectedRoute>} />
                    <Route path="embajador/ofertas/editar/:offerId" element={<ProtectedRoute roles={['admin', 'ambassador']}><OfferFormPage allOffers={allOffers} /></ProtectedRoute>} />
                    <Route path="base-clientes" element={<ProtectedRoute roles={['admin', 'ambassador']}><ClientsDatabasePage /></ProtectedRoute>} />
                    <Route path="nosotros" element={<AboutPage />} />
                    <Route path="cliente/:clientId/credencial" element={<ClientCredentialPage />} />
                    <Route path="cliente/:clientId/validar" element={<ClientValidationPage />} />
                    <Route path=":categorySlug/:shopSlug/cliente-subscripcion" element={<ClientSubscriptionPage allShops={allShops} />} />
                    <Route path="tablero-maestro" element={<ProtectedRoute roles={['admin']}><MasterPanelPage /></ProtectedRoute>} />
                    <Route path="tablero-maestro/fabrica" element={<ProtectedRoute roles={['admin']}><FactoryPanelPage /></ProtectedRoute>} />
                    <Route path="tablero-maestro/configuracion" element={<ProtectedRoute roles={['admin']}><GlobalConfigPage /></ProtectedRoute>} />
                    <Route path="tablero-maestro/reclutamiento" element={<ProtectedRoute roles={['admin']}><AmbassadorRecruitmentAdminPage /></ProtectedRoute>} />
                    <Route path="embajador/facturacion" element={<ProtectedRoute roles={['admin', 'ambassador']}><BillingManagementPage allShops={allShops} /></ProtectedRoute>} />
                    <Route path="factura/:invoiceId" element={<InvoiceViewerPage />} />
                    <Route path="terminos" element={<TermsPage />} />
                    <Route path="embajador/relevamiento/nuevo" element={<ProtectedRoute roles={['admin', 'ambassador']}><SurveyFormPage /></ProtectedRoute>} />
                    <Route path="embajador/relevamiento/gestion" element={<ProtectedRoute roles={['admin', 'ambassador']}><SurveyManagementPage /></ProtectedRoute>} />
                    <Route path="*" element={<Navigate to="home" replace />} />
                </Route>
            </Routes>
        </>
    );
};

const App: React.FC = () => {
    console.log("🧬 ROOT_CAMALEON_ACTIVE: El motor Multi-Zona está en marcha!");
    
    return (
        <BrowserRouter>
            <Routes>
                {/* Redirección directa para el Director Global (Tablero Maestro) */}
                <Route path="/tablero-maestro" element={<Navigate to="/esteban-echeverria/tablero-maestro" replace />} />
                <Route path="/tablero-maestro/*" element={<Navigate to="/esteban-echeverria/tablero-maestro" replace />} />

                {/* Fallback inteligente: si no hay zona, redirigir a Esteban Echeverría */}
                <Route path="/" element={<Navigate to="/esteban-echeverria/home" replace />} />
                
                {/* Ruteo Dinámico Multi-Zona */}
                <Route path="/:townId/*" element={<TownController />} />
                
                {/* Manejo de rutas huérfanas */}
                <Route path="*" element={<Navigate to="/esteban-echeverria/home" replace />} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;