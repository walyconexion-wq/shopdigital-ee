import React from 'react';
import { 
  Utensils, 
  IceCream, 
  Home as HomeIcon, 
  DollarSign, 
  Shirt, 
  Smartphone, 
  PlusSquare,
  Beer,
  ShoppingCart,
  Hammer,
  Scissors,
  UserCircle,
  Dumbbell,
  PenTool,
  Sparkles,
  Pizza,
  UtensilsCrossed,
  Beef
} from 'lucide-react';
import { Category, Shop } from './types';

export const CATEGORIES: Category[] = [
  { id: 'pizzerias', name: 'Pizzerías', icon: <Pizza className="w-8 h-8 text-[#0A224E]" /> },
  { id: 'restaurantes', name: 'Restaurantes', icon: <UtensilsCrossed className="w-8 h-8 text-[#0A224E]" /> },
  { id: 'fastfood', name: 'Comida Rápida', icon: <Beef className="w-8 h-8 text-[#0A224E]" /> },
  { id: 'beer', name: 'Cervecerías', icon: <Beer className="w-8 h-8 text-[#0A224E]" /> },
  { id: 'icecream', name: 'Heladerías', icon: <IceCream className="w-8 h-8 text-[#0A224E]" /> },
  { id: 'gastro', name: 'Gastronomía', icon: <Utensils className="w-8 h-8 text-[#0A224E]" /> },
  { id: 'markets', name: 'Mercados', icon: <ShoppingCart className="w-8 h-8 text-[#0A224E]" /> },
  { id: 'fashion', name: 'Indumentaria', icon: <Shirt className="w-8 h-8 text-[#0A224E]" /> },
  { id: 'tech', name: 'Tecnología', icon: <Smartphone className="w-8 h-8 text-[#0A224E]" /> },
  { id: 'home', name: 'Hogar', icon: <HomeIcon className="w-8 h-8 text-[#0A224E]" /> },
  { id: 'pharmacy', name: 'Farmacias', icon: <PlusSquare className="w-8 h-8 text-[#0A224E]" /> },
  { id: 'barber', name: 'Barberías', icon: <Scissors className="w-8 h-8 text-[#0A224E]" /> },
  { id: 'hair', name: 'Peluquerías', icon: <UserCircle className="w-8 h-8 text-[#0A224E]" /> },
  { id: 'gym', name: 'Gimnasios', icon: <Dumbbell className="w-8 h-8 text-[#0A224E]" /> },
  { id: 'hardware', name: 'Ferreterías', icon: <Hammer className="w-8 h-8 text-[#0A224E]" /> },
  { id: 'finance', name: 'Finanzas', icon: <DollarSign className="w-8 h-8 text-[#0A224E]" /> },
  { id: 'tattoo', name: 'Tatuajes', icon: <PenTool className="w-8 h-8 text-[#0A224E]" /> },
  { id: 'beauty', name: 'Estética', icon: <Sparkles className="w-8 h-8 text-[#0A224E]" /> },
];

export const MOCK_SHOPS: Shop[] = [
  {
    id: 'santiago-ivan-1',
    name: "SANTIAGO IVAN PELUQUERIA'S",
    category: 'barber',
    rating: 4.8,
    specialty: 'Estilista & Barbería de Autor',
    address: '9 de Julio, Llavallol, Esteban Echeverría',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=400&fit=crop',
    bannerImage: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800&h=400&fit=crop',
    offers: [
      { id: 's1', name: 'Corte Premium', price: 9000, image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=200&h=200&fit=crop' },
      { id: 's2', name: 'Diseño de Barba', price: 5500, image: 'https://images.unsplash.com/photo-1532710093739-9470acff878f?w=200&h=200&fit=crop' },
      { id: 's3', name: 'Corte + Color', price: 18000, image: 'https://images.unsplash.com/photo-1620331311520-246422ff83f9?w=200&h=200&fit=crop' },
      { id: 's4', name: 'Alisado Profesional', price: 12000, image: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=200&h=200&fit=crop' },
    ],
    mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d11405.12056254948!2d-58.4974158884588!3d-34.79571039999997!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bcd1978e87e581%3A0x90594e43f8c53dd2!2sSANTIAGO%20IVAN%20PELUQUERIA&#39;S!5e1!3m2!1ses-419!2sar!4v1771456145794!5m2!1ses-419!2sar"
  },
  {
    id: 'barbeshop-1',
    name: 'BARBESHOP',
    category: 'barber',
    rating: 4.9,
    specialty: 'Cortes Urbanos & Barba',
    address: 'B1842 Llavallol, Esteban Echeverría',
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&h=400&fit=crop',
    bannerImage: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&h=400&fit=crop',
    offers: [
      { id: 'b1', name: 'Corte + Barba', price: 12000, image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=200&h=200&fit=crop' },
      { id: 'b2', name: 'Corte Degradado', price: 8500, image: 'https://images.unsplash.com/photo-1599351431247-f5094087936b?w=200&h=200&fit=crop' },
      { id: 'b3', name: 'Perfilado de Barba', price: 5000, image: 'https://images.unsplash.com/photo-1532710093739-9470acff878f?w=200&h=200&fit=crop' },
      { id: 'b4', name: 'Corte Kids', price: 7000, image: 'https://images.unsplash.com/photo-1593702295094-28258529f3ad?w=200&h=200&fit=crop' },
    ],
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d11405.482632922469!2d-58.471498515829936!3d-34.793090568457785!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bcd185dfd25c57%3A0xff4db46617f94a5e!2sBarbeshop!5e1!3m2!1ses-419!2sar!4v1771454956989!5m2!1ses-419!2sar'
  },
  {
    id: '1',
    name: 'PIZZERÍA RUCALHUE',
    category: 'pizzerias',
    rating: 5,
    specialty: 'Pizza a la leña',
    address: 'Av. L. N. Alem 450, Monte Grande',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=400&fit=crop',
    bannerImage: 'https://images.unsplash.com/photo-1574126154517-d1e0d89ef734?w=800&h=400&fit=crop',
    offers: [
      { id: 'o1', name: 'Muzzarella Familiar', price: 8500.00, image: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=200&h=200&fit=crop' },
      { id: 'o2', name: 'Napolitana Especial', price: 9200.00, image: 'https://images.unsplash.com/photo-1593504049359-74330189a355?w=200&h=200&fit=crop' },
      { id: 'o3', name: 'Fugazzeta con Queso', price: 8900.00, image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=200&h=200&fit=crop' },
      { id: 'o4', name: 'Especial Rucalhue', price: 9800.00, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&h=200&fit=crop' },
      { id: 'o5', name: 'Calzone de Jamón', price: 7500.00, image: 'https://images.unsplash.com/photo-1628191010210-a59de33e5941?w=200&h=200&fit=crop' },
    ],
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3275.4042857039014!2d-58.4682025!3d-34.821991!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bcd1361c77876d%3A0x6a099c2d1d4d13e!2sEsteban%20Echeverr%C3%ADa%2C%20Provincia%20de%20Buenos%20Aires!5e0!3m2!1ses!2sar!4v1715456789012!5m2!1ses!2sar'
  },
  {
    id: '2',
    name: 'EL SOL RESTAURANTE',
    category: 'restaurantes',
    rating: 4.8,
    specialty: 'Carnes y Pastas',
    address: 'Mariano Acosta 123, Monte Grande',
    image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&h=400&fit=crop',
    bannerImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=400&fit=crop',
    offers: [
      { id: 'o4', name: 'Asado para 2', price: 22000, image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=200&h=200&fit=crop' },
      { id: 'o6', name: 'Ravioles Caseros', price: 6800, image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=200&h=200&fit=crop' },
      { id: 'o7', name: 'Bife de Chorizo', price: 12500, image: 'https://images.unsplash.com/photo-1546241072-48010ad2862c?w=200&h=200&fit=crop' },
      { id: 'o8', name: 'Ensalada Caesar', price: 4500, image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=200&h=200&fit=crop' },
      { id: 'o9', name: 'Flan con Mixta', price: 3200, image: 'https://images.unsplash.com/photo-1528975604071-b4dc52a2d18c?w=200&h=200&fit=crop' },
    ],
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3275.4042857039014!2d-58.4682025!3d-34.821991!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bcd1361c77876d%3A0x6a099c2d1d4d13e!2sMonte%20Grande!5e0!3m2!1ses!2sar!4v1715456789012'
  }
];