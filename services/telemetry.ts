// ═══════════════════════════════════════════
// 🛰️ ARI — Sistema de Telemetría ShopDigital
// Sensores de eventos para análisis comercial
// ═══════════════════════════════════════════

import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

/**
 * Registra un evento de telemetría en Firebase.
 * @param tipo - Tipo de evento: 'view_offer' | 'click_whatsapp' | 'click_mercadopago' | 'view_shop' | etc.
 * @param shopId - ID del comercio asociado
 * @param data - Datos adicionales (producto, precio, zona, etc.)
 */
export const logEvento = async (tipo: string, shopId: string, data: any = {}) => {
  try {
    await addDoc(collection(db, "telemetria_eventos"), {
      tipo,
      shopId,
      ...data,
      fecha: serverTimestamp(),
      plataforma: "ShopDigital_Web",
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    });
    // Log silencioso en desarrollo
    if (import.meta.env.DEV) {
      console.log(`[Ari 🛰️] ${tipo} → ${shopId}`, data);
    }
  } catch (e) {
    // Fallo silencioso: la telemetría nunca debe romper la experiencia del usuario
    console.warn("[Ari] Sensor offline:", e);
  }
};
