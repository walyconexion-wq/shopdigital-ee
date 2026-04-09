import React from 'react';
import {
  UtensilsCrossed,
  Beer,
  Shirt,
  Smartphone,
  Sparkles,
  Hammer,
  ShoppingCart,
  Car,
  Home as HomeIcon,
  Package,
  PlusSquare,
  Leaf,
  Footprints,
  BookOpen,
  Box,
  Wrench,
  FlaskConical,
  Gift,
  PawPrint,
  Zap
} from 'lucide-react';
import { Category } from './types';

/**
 * 🏭 RUBROS INDUSTRIALES / EMPRESARIALES / MAYORISTAS
 * Espejo fractal de los rubros retail, pero a escala fábrica/importador.
 * Cada rubro representa un sector industrial donde los comerciantes buscan proveedores.
 */
export const ENTERPRISE_CATEGORIES: Category[] = [
  { id: 'ent-alimentos', slug: 'alimentos', name: 'Alimentos', icon: <UtensilsCrossed className="w-8 h-8" /> },
  { id: 'ent-bebidas', slug: 'bebidas', name: 'Bebidas', icon: <Beer className="w-8 h-8" /> },
  { id: 'ent-textil', slug: 'textil', name: 'Textil / Indumentaria', icon: <Shirt className="w-8 h-8" /> },
  { id: 'ent-tecnologia', slug: 'tecnologia', name: 'Tecnología / Importación', icon: <Smartphone className="w-8 h-8" /> },
  { id: 'ent-limpieza', slug: 'limpieza', name: 'Limpieza e Higiene', icon: <Sparkles className="w-8 h-8" /> },
  { id: 'ent-construccion', slug: 'construccion', name: 'Construcción', icon: <Hammer className="w-8 h-8" /> },
  { id: 'ent-mayoristas', slug: 'mayoristas', name: 'Mayoristas Generales', icon: <ShoppingCart className="w-8 h-8" /> },
  { id: 'ent-cosmeticos', slug: 'cosmeticos', name: 'Cosméticos y Belleza', icon: <Sparkles className="w-8 h-8" /> },
  { id: 'ent-automotriz', slug: 'automotriz', name: 'Automotriz / Autopartes', icon: <Car className="w-8 h-8" /> },
  { id: 'ent-electronica', slug: 'electronica', name: 'Electrónica', icon: <Zap className="w-8 h-8" /> },
  { id: 'ent-muebles', slug: 'muebles', name: 'Muebles / Deco', icon: <HomeIcon className="w-8 h-8" /> },
  { id: 'ent-packaging', slug: 'packaging', name: 'Packaging / Envases', icon: <Package className="w-8 h-8" /> },
  { id: 'ent-salud', slug: 'salud', name: 'Salud / Farmacia', icon: <PlusSquare className="w-8 h-8" /> },
  { id: 'ent-agro', slug: 'agro', name: 'Agro / Insumos Rurales', icon: <Leaf className="w-8 h-8" /> },
  { id: 'ent-calzado', slug: 'calzado', name: 'Calzado / Deportivo', icon: <Footprints className="w-8 h-8" /> },
  { id: 'ent-papeleria', slug: 'papeleria', name: 'Papelería / Librería', icon: <BookOpen className="w-8 h-8" /> },
  { id: 'ent-plasticos', slug: 'plasticos', name: 'Plásticos / Descartables', icon: <Box className="w-8 h-8" /> },
  { id: 'ent-metalurgica', slug: 'metalurgica', name: 'Metalúrgica', icon: <Wrench className="w-8 h-8" /> },
  { id: 'ent-quimica', slug: 'quimica', name: 'Química Industrial', icon: <FlaskConical className="w-8 h-8" /> },
  { id: 'ent-juguetes', slug: 'juguetes', name: 'Juguetería / Cotillón', icon: <Gift className="w-8 h-8" /> },
  { id: 'ent-mascotas', slug: 'mascotas-ind', name: 'Mascotas / Pet Shop', icon: <PawPrint className="w-8 h-8" /> },
];
