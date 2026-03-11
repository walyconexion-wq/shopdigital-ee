// Added React import to resolve 'Cannot find namespace React' error when using React.ReactNode
import React from 'react';

export enum View {
  HOME = 'HOME',
  CATEGORY = 'CATEGORY',
  DETAIL = 'DETAIL',
  EDIT_PANEL = 'EDIT_PANEL'
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  icon: React.ReactNode;
}

export interface ProductOffer {
  id: string;
  name: string;
  price: number;
  image: string;
}

export interface Shop {
  id: string;
  slug: string;
  name: string;
  category: string;
  rating: number;
  specialty: string;
  address: string;
  phone?: string;
  zone?: string;
  image: string;
  bannerImage: string;
  offers: ProductOffer[];
  galleryImages?: string[];
  mapUrl: string; // Este es el iframe (embed)
  mapSheetUrl?: string; // Este es el link a la ficha técnica
  isActive?: boolean;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  // Personal Validation Fields (Master Play)
  ownerName?: string;
  ownerPhoto?: string;
  memberNumber?: string;
  shopNumber?: string;
  region?: string;
}