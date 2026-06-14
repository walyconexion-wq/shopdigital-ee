import { CATEGORIES } from '../../constants';

export const PATAGONIA_7_LAGOS_REGION = {
  id: 'patagonia-7-lagos',
  name: 'Región Patagónica - 7 Lagos',
  province: 'Neuquén / Río Negro',
  themeColor: '#0284c7', // Azul Lago Patagónico
  towns: [
    { id: 'bariloche', name: 'San Carlos de Bariloche', type: 'hub_turistico_comercial', lat: -41.134, lng: -71.308 },
    { id: 'san-martin-de-los-andes', name: 'San Martín de los Andes', type: 'turismo_montana', lat: -40.155, lng: -71.353 },
    { id: 'villa-la-angostura', name: 'Villa La Angostura', type: 'boutique_lago', lat: -40.763, lng: -71.643 }
  ],
  // 🏨 MATRIZ TURÍSTICA TOP 6 (2x3 GRID)
  categories: [
    { 
        id: 'hospedaje', slug: 'hospedaje', name: 'Hospedaje', iconKey: 'Hotel',
        subcategories: ['Hoteles', 'Cabañas', 'Hostels', 'Zonas de Camping', 'Departamentos']
    },
    { 
        id: 'entretenimiento', slug: 'entretenimiento', name: 'Entretenimiento', iconKey: 'Ticket',
        subcategories: ['Casino', 'Teatro', 'Salas de Juegos', 'Feria Local', 'Pool y Billar', 'Discotecas / Pubs']
    },
    { 
        id: 'excursiones', slug: 'excursiones', name: 'Excursiones', iconKey: 'Compass',
        subcategories: ['Turismo Aventura', 'Trekking Guiado', 'Cabalgatas', 'Alquiler de Cuatriciclos', 'Paseos en Barco / Catamarán']
    },
    { 
        id: 'vinos_regionales', slug: 'vinos-regionales', name: 'Vinos Regionales', iconKey: 'Wine',
        subcategories: ['Bodegas', 'Degustaciones', 'Viñedos', 'Vinotecas', 'Picadas y Sabores Patagónicos']
    },
    { 
        id: 'chocolaterias', slug: 'chocolaterias', name: 'Chocolaterías', iconKey: 'Coffee',
        subcategories: ['Chocolates Artesanales', 'Alfajorerías', 'Casas de Té', 'Dulces Regionales', 'Mermeladas']
    },
    { 
        id: 'taxis_transporte', slug: 'movilidad', name: 'Taxis y Movilidad', iconKey: 'Car',
        subcategories: ['Taxis', 'Remises', 'Combis', 'Alquiler de Autos', 'Traslados al Aeropuerto', 'Auxilio Mecánico / Gomería']
    },
    ...CATEGORIES
  ]
};
