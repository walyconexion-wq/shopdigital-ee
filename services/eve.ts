/**
 * EVE — MOTOR DE EJECUCIÓN INTELIGENTE EN EL SERVIDOR
 * Interfaz frontend para comunicarse con el endpoint seguro /api/bunker/eve
 */

export interface ChatMessage {
    role: 'director' | 'ari' | 'user' | 'assistant';
    text: string;
}

export const generateEveResponse = async (
    bunkerId: string,
    history: ChatMessage[],
    systemContext?: string
): Promise<string> => {
    try {
        // En desarrollo local y producción, llamamos a nuestro propio backend serverless
        const response = await fetch('/api/bunker/eve', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                bunkerId,
                history,
                systemContext
            })
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || `Error del servidor (HTTP ${response.status})`);
        }

        const data = await response.json();
        return data.response || 'EVE procesó la solicitud pero no retornó texto.';
    } catch (error: any) {
        console.error('[EVE SERVICE CLIENT ERROR]', error);
        return `⚠️ Error en la conexión segura con EVE: ${error.message || 'Error de red'}. Verifique la conexión a internet.`;
    }
};
