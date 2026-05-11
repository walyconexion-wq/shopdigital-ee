import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

/**
 * Función central de Telemetría para Ari
 * @param tipo - 'view_offer' | 'click_whatsapp' | 'click_mercadopago'
 * @param shopId - ID del comercio
 * @param data - Datos extra (nombre del producto, precio, etc.)
 */
export const logEvento = async (tipo: string, shopId: string, data: any = {}) => {
  try {
    await addDoc(collection(db, "telemetria_eventos"), {
      tipo,
      shopId,
      ...data,
      fecha: serverTimestamp(),
      plataforma: "ShopDigital_Web",
      zona: "Esteban Echeverría" 
    });
    console.log(`[Ari Sensor] Evento registrado: ${tipo}`);
  } catch (e) {
    console.error("Error en sensor Ari:", e);
  }
};
