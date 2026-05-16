import React from 'react';
import { 
  Hotel, Home, Tent, Mountain, Coffee, Gift, 
  Compass, Car, Utensils, Beer, ShoppingBag, 
  Palette, Map, Camera
} from 'lucide-react';

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
  // 🏨 RUBROS DE ORO (Turismo Máximo)
  categories: [
    { id: 'hoteleria', slug: 'hoteleria', name: 'Hoteles y Hostels', iconKey: 'Hotel' },
    { id: 'cabanas', slug: 'cabanas', name: 'Cabañas y Complejos', iconKey: 'Mountain' },
    { id: 'camping', slug: 'camping', name: 'Zonas de Camping', iconKey: 'Tent' },
    { id: 'chocolateria', slug: 'chocolateria', name: 'Chocolaterías y Té', iconKey: 'Coffee' },
    { id: 'regaleria-reg', slug: 'regaleria', name: 'Regalería Regional', iconKey: 'Gift' },
    { id: 'artesanias', slug: 'artesanias', name: 'Artesanías y Talleres', iconKey: 'Palette' },
    { id: 'excursiones', slug: 'excursiones', name: 'Excursiones y Guías', iconKey: 'Compass' },
    { id: 'traslados', slug: 'traslados', name: 'Traslados y Alquiler', iconKey: 'Car' },
    { id: 'gastronomia-reg', slug: 'gastronomia', name: 'Sabores del Valle', iconKey: 'Utensils' }
  ]
};
