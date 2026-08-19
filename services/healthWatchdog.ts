// ==========================================
// 🛡️ WATCHDOG & MONITOR DE SALUD DE INFRAESTRUCTURA
// Búnker de Infraestructura - ShopDigital
// ==========================================

import { enviarAlertaPush } from './pushNotifier';
import { ejecutarReparacionEnSombras, IncidentType } from './shadowLabRepair';

export type SystemStatusType = 
    | 'HEALTHY'
    | 'ROLLBACK_ACTIVE'
    | 'SHADOW_LAB_REPAIRING'
    | 'HUMAN_INTERVENTION_REQUIRED'
    | 'REPAIRED_NORMALIZED';

export interface IncidentReport {
    id: string;
    timestamp: string;
    tipo: IncidentType;
    moduloAfecado: string;
    errorStack: string;
    rollbackApplied: boolean;
    versioPrevia: string;
    versionRollback: string;
    solucionPropuesta?: string;
    requiereIntervencionHumana: boolean;
    razonIntervencion?: string;
    detallesReparacion?: string;
}

export interface BunkerSystemState {
    status: SystemStatusType;
    activeVersion: string;
    stableVersion: string;
    currentIncident: IncidentReport | null;
    history: IncidentReport[];
    lastCheckTimestamp: string;
    stats: {
        totalIncidents: number;
        autoHealed: number;
        humanInterventions: number;
        rollbackTimeMs: number;
    };
}

let currentState: BunkerSystemState = {
    status: 'HEALTHY',
    activeVersion: 'v2.4.2 (Producción)',
    stableVersion: 'v2.4.1 (Estable N-1)',
    currentIncident: null,
    history: [
        {
            id: 'INC-20260816-01',
            timestamp: new Date(Date.now() - 3600000).toLocaleTimeString(),
            tipo: 'CODE_EXCEPT',
            moduloAfecado: 'Auth & Session Handler',
            errorStack: 'TypeError: Cannot read properties of undefined (reading "userToken")',
            rollbackApplied: true,
            versioPrevia: 'v2.4.1',
            versionRollback: 'v2.4.0',
            solucionPropuesta: 'Añadir validación null-check en hook de sesión Firebase',
            requiereIntervencionHumana: false,
            detallesReparacion: 'Luz aplicó el parche en sombras y ejecutó Playwright (100% exitoso).'
        }
    ],
    lastCheckTimestamp: new Date().toLocaleTimeString(),
    stats: {
        totalIncidents: 1,
        autoHealed: 1,
        humanInterventions: 0,
        rollbackTimeMs: 120
    }
};

const listeners: Array<(state: BunkerSystemState) => void> = [];

export const getBunkerState = (): BunkerSystemState => ({ ...currentState });

export const subscribeToBunkerState = (callback: (state: BunkerSystemState) => void) => {
    listeners.push(callback);
    callback({ ...currentState });
    return () => {
        const idx = listeners.indexOf(callback);
        if (idx >= 0) listeners.splice(idx, 1);
    };
};

const notifyListeners = () => {
    listeners.forEach(cb => cb({ ...currentState }));
};

/**
 * Dispara un incidente y activa el Protocolo de Auto-Sanación
 */
export const dispararIncidenteProduccion = async (
    tipo: IncidentType,
    modulo: string,
    errorMsg: string
): Promise<IncidentReport> => {
    const incidentId = `INC-${Date.now().toString().slice(-6)}`;
    const now = new Date().toLocaleTimeString();

    const incident: IncidentReport = {
        id: incidentId,
        timestamp: now,
        tipo,
        moduloAfecado: modulo,
        errorStack: errorMsg,
        rollbackApplied: true,
        versioPrevia: currentState.activeVersion,
        versionRollback: currentState.stableVersion,
        requiereIntervencionHumana: false
    };

    // 1. Activar Rollback Instantáneo
    currentState = {
        ...currentState,
        status: 'ROLLBACK_ACTIVE',
        activeVersion: `${currentState.stableVersion} [EN PRODUCCIÓN VIA ROLLBACK]`,
        currentIncident: incident,
        lastCheckTimestamp: now,
        stats: {
            ...currentState.stats,
            totalIncidents: currentState.stats.totalIncidents + 1
        }
    };
    notifyListeners();

    // 2. Notificación Push de Rollback
    await enviarAlertaPush({
        title: `🛡️ ESCUDO ACTIVO - Fallo en ${modulo}`,
        body: `Se detectó fallo en Prod. Rollback instantáneo aplicado a ${currentState.stableVersion}. El cliente sigue operando sin interrupción.`,
        urgent: true,
        tag: 'rollback-alert'
    });

    // 3. Pasar al Quirófano en las Sombras (Agente Luz)
    setTimeout(async () => {
        currentState = {
            ...currentState,
            status: 'SHADOW_LAB_REPAIRING'
        };
        notifyListeners();

        // Ejecutar reparación autónoma
        const resultadoReparacion = await ejecutarReparacionEnSombras(incident);
        
        const incidentFinal: IncidentReport = {
            ...incident,
            solucionPropuesta: resultadoReparacion.solucion,
            requiereIntervencionHumana: resultadoReparacion.requiereHumano,
            razonIntervencion: resultadoReparacion.razonHumano,
            detallesReparacion: resultadoReparacion.logReparacion
        };

        if (resultadoReparacion.requiereHumano) {
            currentState = {
                ...currentState,
                status: 'HUMAN_INTERVENTION_REQUIRED',
                currentIncident: incidentFinal,
                history: [incidentFinal, ...currentState.history],
                stats: {
                    ...currentState.stats,
                    humanInterventions: currentState.stats.humanInterventions + 1
                }
            };
            notifyListeners();

            await enviarAlertaPush({
                title: `🚨 REQUIERE INTERVENCIÓN - Director Waly`,
                body: `Luz aisló el problema en ${modulo}: ${resultadoReparacion.razonHumano}. Ingrese al Búnker para autorizar.`,
                urgent: true,
                tag: 'human-intervention'
            });
        } else {
            currentState = {
                ...currentState,
                status: 'REPAIRED_NORMALIZED',
                activeVersion: 'v2.4.3 (Reparada & Redesplegada)',
                stableVersion: 'v2.4.2 (Nueva Base Estable)',
                currentIncident: incidentFinal,
                history: [incidentFinal, ...currentState.history],
                stats: {
                    ...currentState.stats,
                    autoHealed: currentState.stats.autoHealed + 1
                }
            };
            notifyListeners();

            await enviarAlertaPush({
                title: `🟢 AUTO-SANADO COMPLETADO - Luz Ingeniera`,
                body: `El bug en ${modulo} fue reparado y validado en las Sombras (100% Tests OK). Redesplegado a Producción.`,
                urgent: false,
                tag: 'auto-healed'
            });
        }
    }, 1500);

    return incident;
};

/**
 * Resuelve manualmente un incidente de intervención humana (ej: tras actualizar cuotas/tokens)
 */
export const resolverIncidenteManualmente = async (notas: string) => {
    if (!currentState.currentIncident) return;

    const incidentResuelto: IncidentReport = {
        ...currentState.currentIncident,
        detallesReparacion: `[INTERVENCIÓN DIRECTOR WALY]: ${notas}. ${currentState.currentIncident.detallesReparacion || ''}`
    };

    currentState = {
        ...currentState,
        status: 'REPAIRED_NORMALIZED',
        activeVersion: 'v2.4.3 (Operación Normal Restablecida)',
        stableVersion: 'v2.4.2 (Estable N-1)',
        currentIncident: incidentResuelto,
        lastCheckTimestamp: new Date().toLocaleTimeString()
    };
    notifyListeners();

    await enviarAlertaPush({
        title: `✅ SISTEMA NORMALIZADO POR DIRECTOR`,
        body: `Intervención completada. Producción restablecida correctamente.`,
        urgent: false
    });
};
