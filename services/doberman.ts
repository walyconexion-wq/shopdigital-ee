// ==============================
// 🛡️ PROTOCOLO DOBERMAN 2.0
// Sistema de Seguridad del Hormiguero
// ==============================

import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

// --- CONFIG ---
const NTFY_TOPIC = 'shopdigital-doberman-waly';
const NTFY_URL = `https://ntfy.sh/${NTFY_TOPIC}`;
const MAX_FAILED_ATTEMPTS = 3;
const LOCKOUT_WINDOW_MS = 5 * 60 * 1000; // 5 minutos

// --- TIPOS ---
export type SecurityEventType = 
    | 'login_success' 
    | 'login_failed' 
    | 'unauthorized_access' 
    | 'brute_force_detected'
    | 'suspicious_activity'
    | 'admin_panel_access';

interface SecurityLog {
    tipo: SecurityEventType;
    email: string | null;
    ruta: string;
    userAgent: string;
    timestamp?: any;
    detalles?: string;
    ip?: string;
}

// --- REGISTRO DE ACCESO (LOG) ---
export const registrarAcceso = async (log: Omit<SecurityLog, 'timestamp'>) => {
    try {
        await addDoc(collection(db, 'logs_seguridad'), {
            ...log,
            timestamp: serverTimestamp(),
            plataforma: 'ShopDigital_Web'
        });
        console.log(`[DOBERMAN] Evento registrado: ${log.tipo} | ${log.email || 'anónimo'}`);
    } catch (error) {
        console.error('[DOBERMAN] Error registrando log:', error);
    }
};

// --- ALERTA WHATSAPP/PUSH VIA NTFY ---
export const dispararAlertaDoberman = async (
    titulo: string, 
    mensaje: string, 
    prioridad: 'low' | 'default' | 'high' | 'urgent' = 'high'
) => {
    try {
        const priorityMap = { low: '2', default: '3', high: '4', urgent: '5' };
        
        await fetch(NTFY_URL, {
            method: 'POST',
            body: mensaje,
            headers: {
                'Title': titulo,
                'Priority': priorityMap[prioridad],
                'Tags': prioridad === 'urgent' ? 'rotating_light,skull' : 'dog,shield'
            }
        });
        
        console.log(`[DOBERMAN] Alerta disparada: ${titulo}`);
    } catch (error) {
        console.error('[DOBERMAN] Error enviando alerta:', error);
    }
};

// --- DETECTOR DE FUERZA BRUTA ---
// Almacenamiento local de intentos fallidos (no requiere Firebase para velocidad)
const failedAttempts: Map<string, { count: number; firstAttempt: number }> = new Map();

export const registrarIntentoFallido = async (email: string, ruta: string) => {
    const now = Date.now();
    const record = failedAttempts.get(email) || { count: 0, firstAttempt: now };
    
    // Resetear si la ventana expiró
    if (now - record.firstAttempt > LOCKOUT_WINDOW_MS) {
        record.count = 0;
        record.firstAttempt = now;
    }
    
    record.count++;
    failedAttempts.set(email, record);
    
    // Registrar en Firebase
    await registrarAcceso({
        tipo: 'login_failed',
        email,
        ruta,
        userAgent: navigator.userAgent,
        detalles: `Intento ${record.count} de ${MAX_FAILED_ATTEMPTS}`
    });
    
    // Si supera el límite → ALERTA MÁXIMA
    if (record.count >= MAX_FAILED_ATTEMPTS) {
        await registrarAcceso({
            tipo: 'brute_force_detected',
            email,
            ruta,
            userAgent: navigator.userAgent,
            detalles: `${record.count} intentos fallidos en ${LOCKOUT_WINDOW_MS / 60000} min`
        });
        
        await dispararAlertaDoberman(
            '🚨 ALERTA DOBERMAN: INTRUSIÓN',
            `Jefe, detecté ${record.count} intentos de acceso fallidos.\n\nEmail: ${email}\nRuta: ${ruta}\nNavegador: ${navigator.userAgent.substring(0, 80)}\nHora: ${new Date().toLocaleString('es-AR')}\n\nLos Dobermans están en posición. El acceso fue bloqueado temporalmente.`,
            'urgent'
        );
        
        return true; // Indicar que está bloqueado
    }
    
    return false; // No bloqueado aún
};

// --- VERIFICAR SI ESTÁ BLOQUEADO ---
export const estaBloqueado = (email: string): boolean => {
    const record = failedAttempts.get(email);
    if (!record) return false;
    
    const now = Date.now();
    if (now - record.firstAttempt > LOCKOUT_WINDOW_MS) {
        failedAttempts.delete(email);
        return false;
    }
    
    return record.count >= MAX_FAILED_ATTEMPTS;
};

// --- REGISTRAR ACCESO EXITOSO ---
export const registrarAccesoExitoso = async (email: string, ruta: string, role: string) => {
    // Limpiar intentos fallidos
    failedAttempts.delete(email);
    
    await registrarAcceso({
        tipo: 'login_success',
        email,
        ruta,
        userAgent: navigator.userAgent,
        detalles: `Rol: ${role}`
    });
};

// --- REGISTRAR ACCESO A PANEL ADMIN ---
export const registrarAccesoAdmin = async (email: string, ruta: string) => {
    await registrarAcceso({
        tipo: 'admin_panel_access',
        email,
        ruta,
        userAgent: navigator.userAgent
    });
    
    // Notificar al Director de accesos al panel sensible
    await dispararAlertaDoberman(
        'ACCESO AL PANEL DE CONTROL',
        `Acceso detectado al panel administrativo.\n\nEmail: ${email}\nRuta: ${ruta}\nHora: ${new Date().toLocaleString('es-AR')}`,
        'default'
    );
};

// --- REGISTRAR ACCESO NO AUTORIZADO ---
export const registrarAccesoNoAutorizado = async (email: string | null, ruta: string) => {
    await registrarAcceso({
        tipo: 'unauthorized_access',
        email,
        ruta,
        userAgent: navigator.userAgent,
        detalles: 'Intento de acceso a ruta protegida sin autorización'
    });
    
    await dispararAlertaDoberman(
        '⚠️ ACCESO NO AUTORIZADO',
        `Alguien intentó entrar sin permiso.\n\nEmail: ${email || 'Sin identificar'}\nRuta: ${ruta}\nNavegador: ${navigator.userAgent.substring(0, 80)}\nHora: ${new Date().toLocaleString('es-AR')}`,
        'high'
    );
};
