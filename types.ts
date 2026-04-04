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

export interface Invoice {
  id: string;
  shopId: string;
  shopName: string;
  amount: number;
  issueDate: string;
  dueDate: string;
  status: 'pending' | 'paid';
  concept: string;
  pdfUrl?: string;
  paymentDate?: string;
}

export interface Lead {
    id: string;
    name: string;
    category: string;
    address: string;
    zone: string;
    contactName: string;
    phone: string;
    socialNetworks: string;
    digitalDiagnosis: {
        missing: string;
        interestLevel: 'high' | 'medium' | 'low';
        observations: string;
    };
    ambassadorName: string;
    date: string;
    status: 'pending' | 'activated';
    createdShopId?: string;
}

export interface Review {
  id: string;
  authorName: string;
  rating: number;
  text: string;
  date: string;
}

export interface ProductOffer {
  id: string;
  name: string;
  price: number;
  image: string;
}

export interface PointsTransaction {
  id: string;
  shopName: string;
  type: 'earned' | 'redeemed';
  points: number;
  date: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  sourceShopId: string;
  sourceShopName: string;
  createdAt: string;
  points?: number;
  pointsHistory?: PointsTransaction[];
}

export interface Offer {
  id: string;
  target: 'B2B' | 'B2C';
  title: string;
  description: string;
  price: string;
  discountLabel: string;
  image: string;
  merchantName: string;
  merchantZone: string;
  category: string;
  validFrom: string;
  validUntil: string;
  stockLimit?: number;
  pointsPrice?: number;
  isActive: boolean;
  createdAt: string;
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
  townId?: string; // Inyector de la zona inamovible (SaaS)
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
  pedidoYaUrl?: string;
  mercadoPagoUrl?: string;
  themeColor?: string;
  // Personal Validation Fields (Master Play)
  ownerName?: string;
  ownerPhoto?: string;
  memberNumber?: string;
  shopNumber?: string;
  region?: string;
  // Billing Fields
  billingStatus?: 'active' | 'pending' | 'suspended';
  billingAmount?: number;
  visits?: number;
  subscribers?: number;
  reviews?: Review[];
  authorizedEmail?: string;
  feedImages?: string[];
  feedLikes?: number;
}