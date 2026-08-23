export interface MasterCampaignTemplate {
    id: string;
    title: string;
    description: string;
    audience: 'cliente_calle' | 'comerciante' | 'empresario';
    type: 'persuasion' | 'fidelizacion' | 'informativa';
    message: string;
    mediaUrl: string;
    attachCatalog: boolean;
}

export const MASTER_CAMPAIGNS: MasterCampaignTemplate[] = [
    // --- CLIENTE DE CALLE (B2C) ---
    {
        id: 'c_calle_persuasion_1',
        title: '🌟 Descubrí tu Barrio',
        description: 'Invita a los vecinos a explorar comercios locales.',
        audience: 'cliente_calle',
        type: 'persuasion',
        message: '¡Hola! ¿Sabías que los mejores comercios de {zona} están más cerca de lo que creés? 🏪✨\n\nApoyemos al comercio local y disfrutemos de la mejor calidad sin movernos de nuestro barrio.\n\nMirá todo lo que tenés cerca de casa 👇',
        mediaUrl: '',
        attachCatalog: true
    },
    {
        id: 'c_calle_fidelizacion_1',
        title: '💎 Beneficios Club VIP',
        description: 'Impulsa el registro en el club de beneficios locales.',
        audience: 'cliente_calle',
        type: 'fidelizacion',
        message: '¡Atención Vecino! 💎 ¿Ya te registraste en el Club VIP de {zona}?\n\nAccedé a descuentos exclusivos, cupones de regalo y sumá puntos con cada compra en tus comercios favoritos del barrio.\n\nRegistrate gratis y empezá a ahorrar hoy mismo 👇',
        mediaUrl: '',
        attachCatalog: true
    },
    {
        id: 'c_calle_informativa_1',
        title: '📢 Frecuencia Zonal Activa',
        description: 'Informa sobre novedades locales relevantes.',
        audience: 'cliente_calle',
        type: 'informativa',
        message: '📢 ¡Sintonía Zonal en Vivo en {zona}!\n\nEnterate de todas las novedades del barrio, eventos del fin de semana, nuevos locales que se sumaron a la red y promociones activas.\n\nNo te quedes afuera de lo que pasa en tu zona 👇',
        mediaUrl: '',
        attachCatalog: true
    },

    // --- COMERCIANTE (B2B/B2C) ---
    {
        id: 'comercio_persuasion_1',
        title: '🏪 Registro de Comercios',
        description: 'Invita a comercios a sumarse a ShopDigital.',
        audience: 'comerciante',
        type: 'persuasion',
        message: '¡Hola, colega comerciante de {zona}! 🏪👋\n\nSumá tu negocio GRATIS al mapa digital interactivo de la zona. Hacé que los vecinos te encuentren de inmediato, publiquá tus ofertas y gestioná tus propios clientes VIP.\n\nComenzá tu alta digital hoy mismo en 3 simples pasos 👇',
        mediaUrl: '',
        attachCatalog: true
    },
    {
        id: 'comercio_fidelizacion_1',
        title: '🔥 Impulso de Ofertas Finde',
        description: 'Motiva a publicar ofertas de fin de semana.',
        audience: 'comerciante',
        type: 'fidelizacion',
        message: '¡Atención Socios de la Red! 🔥 Se acerca el fin de semana en {zona}.\n\nRecordá que publicar al menos una oferta irresistible duplica las visitas a tu ficha y atrae más vecinos a tu local. ¡Mete mecha en el panel y cargá tu promo!\n\nAccedé al panel de ofertas acá 👇',
        mediaUrl: '',
        attachCatalog: true
    },
    {
        id: 'comercio_informativa_1',
        title: '🛡️ Boletín del Búnker Central',
        description: 'Novedades de tráfico e infraestructura.',
        audience: 'comerciante',
        type: 'informativa',
        message: '🛡️ Comunicado del Búnker Central para la red comercial de {zona}.\n\nEl tráfico del catálogo local ha crecido un 30% este mes. Asegurate de mantener tus datos actualizados (WhatsApp, horarios y fotos) para no perder ventas.\n\nRevisá tu configuración acá 👇',
        mediaUrl: '',
        attachCatalog: true
    },

    // --- EMPRESARIO (B2B INDUSTRIAL) ---
    {
        id: 'empresario_persuasion_1',
        title: '🏭 Registro Directorio Industrial',
        description: 'Invita a industrias al Directorio B2B.',
        audience: 'empresario',
        type: 'persuasion',
        message: 'Estimado Empresario de {zona} 🏭🤝\n\nLo invitamos a registrar su fábrica, taller, mayorista o distribuidora en el nuevo Directorio Industrial Regional.\n\nConecte con la mayor red de proveedores de la región, optimice su cadena de suministro y genere alianzas de valor.\n\nRegístrese aquí sin costo 👇',
        mediaUrl: '',
        attachCatalog: true
    },
    {
        id: 'empresario_fidelizacion_1',
        title: '🤝 Red de Descuentos Cruzados',
        description: 'Fomenta el intercambio de ofertas corporativas.',
        audience: 'empresario',
        type: 'fidelizacion',
        message: 'Estimado Socio Industrial 🤝\n\nLe recordamos que ya se encuentra activo el sistema de ofertas B2B en {zona}. Su empresa puede acceder a precios mayoristas y descuentos exclusivos de red entre industrias autorizadas.\n\nExplore las ofertas industriales activas 👇',
        mediaUrl: '',
        attachCatalog: true
    },
    {
        id: 'empresario_informativa_1',
        title: '📊 Reporte de Tránsito B2B',
        description: 'Envía estadísticas agregadas de la red industrial.',
        audience: 'empresario',
        type: 'informativa',
        message: '📊 Reporte de Inteligencia B2B - {zona}.\n\nSe ha publicado el análisis de tráfico y consultas mayoristas correspondientes al período en curso. Conozca las tendencias de búsqueda de insumos y materiales en su sector.\n\nConsulte el reporte completo aquí 👇',
        mediaUrl: '',
        attachCatalog: true
    }
];
