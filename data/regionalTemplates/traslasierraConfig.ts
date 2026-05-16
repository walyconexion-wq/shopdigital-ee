import React from 'react';
import { 
  Hotel, Home, Tent, Mountain, Coffee, Gift, 
  Compass, Car, Utensils, Beer, ShoppingBag, 
  Palette, Map, Camera
} from 'lucide-react';
import { CATEGORIES } from '../../constants';

export const TRASLASIERRA_REGION = {
  id: 'traslasierra',
  name: 'Valle de Traslasierra',
  province: 'Córdoba',
  themeColor: '#0ea5e9', // Cian Montaña
  towns: [
    { id: 'mina-clavero', name: 'Mina Clavero', type: 'hub_comercial', lat: -31.722, lng: -65.003 },
    { id: 'cura-brochero', name: 'Villa Cura Brochero', type: 'turismo_mistic', lat: -31.713, lng: -65.019 },
    { id: 'nono', name: 'Nono', type: 'alta_gama_artesanal', lat: -31.796, lng: -65.002 },
    { id: 'panaholma', name: 'Panaholma', type: 'naturaleza_camping', lat: -31.624, lng: -65.011 },
    { id: 'villa-dolores', name: 'Villa Dolores', type: 'nucleo_administrativo', lat: -31.944, lng: -65.189 },
    { id: 'villa-las-rosas', name: 'Villa Las Rosas', type: 'eco_gastronomia', lat: -31.948, lng: -65.051 },
    { id: 'san-javier', name: 'San Javier', type: 'boutique_sierras', lat: -32.030, lng: -65.028 },
    { id: 'las-rabonas', name: 'Las Rabonas', type: 'cabanas_tranquilidad', lat: -31.854, lng: -65.015 }
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
        subcategories: ['Turismo Aventura', 'Trekking Guiado', 'Cabalgatas', 'Alquiler de Cuatriciclos', 'Paseos en Río']
    },
    { 
        id: 'vinos_regionales', slug: 'vinos-regionales', name: 'Vinos Regionales', iconKey: 'Wine',
        subcategories: ['Bodegas', 'Degustaciones', 'Viñedos', 'Vinotecas', 'Picadas y Sabores']
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
