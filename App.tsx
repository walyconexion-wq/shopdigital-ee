import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useParams, Navigate, useLocation } from 'react-router-dom';
import { Shop, Client, Offer } from './types';
import { 
  suscribirseAComercios, suscribirseAClientes, suscribirseAOfertas, 
  subscribeToGlobalConfig, migrarDatosLegados 
} from './firebase';
import { subscribeToEnterpriseConfig } from './firebase_enterprise';
import { populateInvoices, rescueEzeizaData } from './dbFix';
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
import { DirectorBunkerPage } from './pages/DirectorBunkerPage';
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
import ClientVipCredentialPage from './pages/ClientVipCredentialPage';
import EnterpriseHomePage from './pages/EnterpriseHomePage';
import EnterpriseCategoryPage from './pages/EnterpriseCategoryPage';
import EnterpriseManagementPage from './pages/EnterpriseManagementPage';
import EnterpriseFormPage from './pages/EnterpriseFormPage';
import EnterpriseMasterPanelPage from './pages/EnterpriseMasterPanelPage';
import EnterpriseGlobalConfigPage from './pages/EnterpriseGlobalConfigPage';
import CreditsPosnetPage from './pages/CreditsPosnetPage';
import EnterpriseSubscriptionPage from './pages/EnterpriseSubscriptionPage';
import MarketingPanelPage from './pages/MarketingPanelPage';
import ShopMasterPanelPage from './pages/ShopMasterPanelPage';

const DEFAULT_BANNER = "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=400&fit=crop";

// --- TOWN CONTROLLER COMPONENT ---
// Este componente extrae el townId de la URL y maneja toda la lógica de suscripciones
const TownController: React.FC = () => {
    // RESOLUCIÓN DE ZONA BLINDADA: Prioridad absoluta al parámetro de URL
    const params = useParams<{ townId: string }>();
    const townId = params.townId || 'esteban-echeverria';
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

    const [enterpriseGlobalConfig, setEnterpriseGlobalConfig] = useState<any>({
        mainTitle: "Directorio Industrial",
        mainSubtitle: "Conectando la fuerza productiva",
        theme: 'default',
        primaryColor: '#f59e0b',
        townName: townId === 'esteban-echeverria' ? "Esteban Echeverría" : townId,
        bgColor: '#000000'
    });

    // --- REPAIR TRIGGER VIA URL (?repair=true) ---
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('repair') === 'true') {
            console.log("🛠️ ACTIVADOR MAESTRO DETECTADO: Iniciando reparación de emergencia...");
            migrarDatosLegados(townId)
                .then(async (result) => {
                    console.log("✅ REPARACIÓN EXITOSA:", result);
                    // Adicionalmente, ejecutar rescate de Ezeiza para asegurar multiverso
                    const rescue = await rescueEzeizaData();
                    console.log("🛡️ RESCATE ADICIONAL:", rescue);
                    alert(`¡SISTEMA REESTABLECIDO! Datos resucitados y ${rescue.clientsFixed} fantasmas capturados.`);
                    window.history.replaceState({}, '', window.location.pathname);
                })
                .catch(err => {
                    console.error("❌ ERROR EN REPARACIÓN:", err);
                    alert("Fallo en el rescate: " + err.message);
                });
        }
        
        if (params.get('inject') === 'true') {
            console.log("🔥 INYECCIÓN DE DATOS MAESTRA INICIADA...");
            populateInvoices()
                .then(() => {
                    alert("✅ INYECCIÓN COMPLETADA. Bóveda Pizzeería El Tano y E.Echeverría listas.");
                    window.history.replaceState({}, '', window.location.pathname);
                })
                .catch(err => {
                    alert("Fallo inyección: " + err.message);
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

        const unsubscribeEnterprise = subscribeToEnterpriseConfig((config: any) => {
            if (config) setEnterpriseGlobalConfig(config);
        });

        return () => {
            unsubscribe();
            unsubscribeClients();
            unsubscribeOffers();
            unsubscribeGlobal();
            unsubscribeEnterprise();
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
                    <Route path="nosotros" element={<AboutPage />} />
                    <Route path="cliente/:clientId/credencial" element={<ClientCredentialPage />} />
                    <Route path="cliente/:clientId/validar" element={<ClientValidationPage />} />
                    <Route path="validar/:clientId" element={<ClientValidationPage />} />
                    <Route path="mi-comercio/panel-de-gestion" element={<ProtectedRoute roles={['admin', 'ambassador']}><ShopMasterPanelPage /></ProtectedRoute>} />
                    <Route path=":categorySlug/:shopSlug/cliente-subscripcion" element={<ClientSubscriptionPage allShops={allShops} />} />

                    <Route path="tablero-maestro" element={<ProtectedRoute roles={['admin']}><MasterPanelPage /></ProtectedRoute>} />
                    <Route path="tablero-maestro/fabrica" element={<ProtectedRoute roles={['admin']}><FactoryPanelPage /></ProtectedRoute>} />
                    <Route path="tablero-maestro/configuracion" element={<ProtectedRoute roles={['admin']}><GlobalConfigPage /></ProtectedRoute>} />
                    <Route path="tablero-maestro/reclutamiento" element={<ProtectedRoute roles={['admin']}><AmbassadorRecruitmentAdminPage /></ProtectedRoute>} />
                    <Route path="marketing-inteligente" element={<ProtectedRoute roles={['admin']}><MarketingPanelPage /></ProtectedRoute>} />
                    <Route path="embajador/facturacion" element={<ProtectedRoute roles={['admin', 'ambassador']}><BillingManagementPage allShops={allShops} /></ProtectedRoute>} />
                    <Route path=":categorySlug/:shopSlug/factura" element={<InvoiceViewerPage allShops={allShops} />} />
                    <Route path=":categorySlug/:shopSlug/credencial-vip/:clientId" element={<ClientVipCredentialPage allShops={allShops} allClients={allClients} />} />
                    <Route path=":categorySlug/:shopSlug/credencial-vip" element={<ClientVipCredentialPage allShops={allShops} allClients={allClients} />} />
                    <Route path="terminos" element={<TermsPage />} />
                    <Route path="embajador/relevamiento/nuevo" element={<ProtectedRoute roles={['admin', 'ambassador']}><SurveyFormPage /></ProtectedRoute>} />
                    <Route path="embajador/relevamiento/gestion" element={<ProtectedRoute roles={['admin', 'ambassador']}><SurveyManagementPage /></ProtectedRoute>} />
                    {/* 🏭 GESTOR DE EMPRESAS B2B */}
                    <Route path="embajador/empresas" element={<ProtectedRoute roles={['admin', 'ambassador']}><EnterpriseManagementPage allShops={allShops} /></ProtectedRoute>} />
                    <Route path="embajador/empresas/nueva" element={<ProtectedRoute roles={['admin', 'ambassador']}><EnterpriseFormPage allShops={allShops} /></ProtectedRoute>} />
                    <Route path="embajador/empresas/editar/:enterpriseId" element={<ProtectedRoute roles={['admin', 'ambassador']}><EnterpriseFormPage allShops={allShops} /></ProtectedRoute>} />
                    {/* 💳 POSNET DE CRÉDITOS */}
                    <Route path="embajador/posnet" element={<ProtectedRoute roles={['admin', 'ambassador']}><CreditsPosnetPage /></ProtectedRoute>} />
                    <Route path="mi-comercio/posnet-virtual" element={<CreditsPosnetPage />} />
                    <Route path="*" element={<Navigate to="home" replace />} />
                </Route>
            </Routes>
        </>
    );
};

// --- Controlador del Nodo Industrial B2B (Global) ---
const EnterpriseController: React.FC = () => {
    const [allShops, setAllShops] = useState<Shop[]>([]);
    const [enterpriseGlobalConfig, setEnterpriseGlobalConfig] = useState<any>(null);

    useEffect(() => {
        const unsubscribe = suscribirseAComercios((fbShops) => {
            const cleanedShops = fbShops
                .filter(shop => shop && shop.name)
                .map(shop => ({
                    ...shop,
                    bannerImage: shop.bannerImage || '',
                    image: shop.image || shop.bannerImage || '',
                    offers: shop.offers || []
                }));
            setAllShops(cleanedShops);
        });

        const unsubscribeEnterprise = subscribeToEnterpriseConfig((config: any) => {
            if (config) setEnterpriseGlobalConfig(config);
        });

        return () => {
            unsubscribe();
            unsubscribeEnterprise();
        };
    }, []);

    return (
        <Routes>
            <Route path="/" element={<Layout allShops={allShops} globalConfig={enterpriseGlobalConfig} />}>
                <Route index element={<EnterpriseHomePage globalConfig={enterpriseGlobalConfig} />} />
                <Route path="control-maestro" element={<ProtectedRoute roles={['admin']}><EnterpriseMasterPanelPage /></ProtectedRoute>} />
                <Route path="marketing-inteligente" element={<ProtectedRoute roles={['admin']}><MarketingPanelPage /></ProtectedRoute>} />
                <Route path="inscripcion" element={<EnterpriseSubscriptionPage />} />
                <Route path="configuracion" element={<ProtectedRoute roles={['admin']}><EnterpriseGlobalConfigPage /></ProtectedRoute>} />
                <Route path=":categorySlug" element={<EnterpriseCategoryPage allShops={allShops} />} />
                <Route path=":categorySlug/:shopSlug" element={<ShopDetailPage allShops={allShops} />} />
                <Route path=":categorySlug/:shopSlug/menu" element={<ShopMenuPage allShops={allShops} />} />
                <Route path=":categorySlug/:shopSlug/credencial" element={<CredencialPage allShops={allShops} />} />
            </Route>
        </Routes>
    );
};

const App: React.FC = () => {
    console.log("🧬 ROOT_CAMALEON_ACTIVE: El motor Multi-Zona está en marcha!");
    
    return (
        <BrowserRouter>
            <Routes>
                {/* 🏭 Nodo Empresarial Global */}
                <Route path="/empresas/*" element={<EnterpriseController />} />

                {/* Redirección directa para el Director Global (Tablero Maestro) */}
                <Route path="/tablero-maestro" element={<Navigate to="/esteban-echeverria/tablero-maestro" replace />} />
                <Route path="/tablero-maestro/*" element={<Navigate to="/esteban-echeverria/tablero-maestro" replace />} />

                {/* Fallback inteligente: si no hay zona, redirigir a Esteban Echeverría */}
                <Route path="/" element={<Navigate to="/esteban-echeverria/home" replace />} />
                
                {/* Bloqueo dimensional: Erradicar universo paralelo sin zona */}
                <Route path="/embajador" element={<Navigate to="/" replace />} />
                <Route path="/embajador/*" element={<Navigate to="/" replace />} />
                
                {/* 🛡️ BÚNKER DE MANDO (DIRECTOR) - Prioridad absoluta antes del catch-all */}
                <Route path="/:townId/bunker-waly" element={<DirectorBunkerPage />} />

                {/* Ruteo Dinámico Multi-Zona */}
                <Route path="/:townId/*" element={<TownController />} />
                
                {/* Manejo de rutas huérfanas */}
                <Route path="*" element={<Navigate to="/esteban-echeverria/home" replace />} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;