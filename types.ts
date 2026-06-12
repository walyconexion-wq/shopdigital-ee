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
  status: 'pending' | 'paid' | 'uncollectible' | 'suspended';
  townId?: string; // Multi-Zona SaaS Identifier
  locality?: string; // Sello geográfico profundo para consultas IA
  period?: string; // Franja contable (ej: "2026-04")
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
  scarcityLabel?: string; // e.g. "¡Válido solo por hoy!"
  stockCount?: number;    // e.g. 3
  legalText?: string;     // e.g. "Válido solo para take-away"
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
  email: string;
  sourceShopId: string;
  sourceShopName: string;
  createdAt: string;
  townId?: string; // Sello Regional B2C 🛡️
  dni?: string;
  photo?: string;
  status?: 'active' | 'suspended' | 'pending';
  cardColor?: string;
  points?: number;
  credits?: number;
  pointsHistory?: PointsTransaction[];
  creditsHistory?: any[];
  locality?: string; // Sello geográfico del socio 📍
  updatedAt?: string; // Última actualización del perfil
  eventPassEnabled?: boolean; // Sintonizar eventos y transmisión en vivo 📡
  verificationCode?: string; // OTP de 6 dígitos para verificación
  verificationExpires?: string; // Fecha de expiración de OTP (ISO string)
  activeTicket?: {
    eventId: string;
    eventName: string;
    date: string;
    time: string;
    seatSector?: string;
    fila?: string;
    asiento?: string;
    status: 'active' | 'used' | 'suspended';
    pricePaid?: number;
  };
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
  townId?: string; // Zona del comercio que publica la oferta
  shopId?: string; // ID del comercio que publica la oferta
  ownerId?: string; // Owner del recurso
}

export interface MarketingCampaign {
  id: string;
  shopId: string;
  message: string;
  scheduledDate: string; // ISO string o formato fecha
  status: 'pending' | 'executed' | 'cancelled';
  audience: 'all' | 'vip';
  createdAt: string;
}

// --- EXPANSIÓN REGIONAL ---
export interface Region {
  id: string;                // 'traslasierra', 'buenos-aires-sur'
  name: string;              // 'Valle de Traslasierra'
  provinceId: string;        // 'cordoba', 'buenos-aires'
  type: 'region' | 'zona';  // región turística vs zona urbana
  towns: string[];           // ['mina-clavero', 'cura-brochero', ...]
  icon: string;              // 'mountain', 'building', 'palmtree'
  color: string;             // '#a855f7' violeta para regiones
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
  entityType?: 'shop' | 'enterprise'; // Discriminador de nodo 🏭
  reach?: 'national' | 'regional' | 'local'; // Alcance de distribución 🌎
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
  fechaEnvioAutomatica?: number; // Día del mes para enviar factura automáticamente
  ultimoEnvioAutomatico?: string; // Fecha (ISO) de última generación automática
  visits?: number;
  subscribers?: number;
  reviews?: Review[];
  authorizedEmail?: string;
  authorizedStaff?: string[];
  feedImages?: string[];
  feedLikes?: number;
  seasonTheme?: string; // Tema estacional/festivo del catálogo 🎄❄️🌸
  customBackground?: string; // Fondo o patrón personalizado (Fase Personalización) 🎨
  description?: string; // Descripción completa del comercio
  tags?: string[]; // Etiquetas para búsqueda y filtrado
  updatedAt?: string; // Última actualización del registro
  province?: string; // Provincia (para nodo B2B)
  verified?: boolean; // Empresa verificada por embajador
  ownerId?: string; // Owner del comercio
  color?: string; // Color temático del comercio
  // 🚀 ONBOARDING BLITZKRIEG — Sistema de Alta de Comercios
  onboardingStatus?: 'draft' | 'pending_review' | 'approved' | 'rejected';
  onboardingSubmittedAt?: string;   // ISO date — cuando el comerciante envió su solicitud
  onboardingApprovedAt?: string;    // ISO date — cuando el embajador aprobó
  onboardingApprovedBy?: string;    // Email del embajador que aprobó
  onboardingNotes?: string;         // Notas del embajador durante la revisión
  credentialUrl?: string;           // URL a la credencial electrónica
  invoiceSimulationUrl?: string;    // URL a la factura del mes gratis
  memberSince?: string;             // ISO date — fecha oficial de alta
  gmail: string;                    // Gmail de acceso obligatorio para credencial 🛡️
}

export interface LiveEvent {
  id: string;
  name: string;
  artist?: string;
  dateStr: string;
  timeStr: string;
  status: 'draft' | 'published' | 'active_live' | 'suspended' | 'canceled';
  targetRegion: string;
  targetLocalities: string[]; // ['monte-grande', 'all']
  targetRoles: Array<'cliente_calle' | 'comerciante' | 'empresario'>;
  ticketPageUrl?: string;
}

export interface BunkerDirective {
  id?: string;
  title: string;
  content: string;
  priority: 'alta' | 'media' | 'baja';
  type: 'mision' | 'alerta' | 'notificacion' | 'directiva';
  targetBunkers: string[]; // e.g. ['all'] o ['contabilidad', 'sistemas']
  sender: string;
  senderName?: string;
  fechaCreacion: string; // ISO String
  estado: 'active' | 'archived' | 'pending_approval';
  respuestas?: BunkerReply[];
}

export interface BunkerReply {
  bunkerId: string;
  responder: string;
  text: string;
  fechaRespuesta: string; // ISO String
  confirmed: boolean; // Confirmación formal de la misión
}