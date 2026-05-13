// ==============================
// ARI — MOTOR DE INTELIGENCIA ARTIFICIAL
// Sesión persistente con Google Gemini API
// Modelo: gemini-2.5-flash (Tier Gratuito)
// ==============================

const GEMINI_MODEL = 'gemini-2.5-flash';
const API_BASE = 'https://generativelanguage.googleapis.com/v1beta';

// --- Identidad Core de ARI ---
const ARI_IDENTITY = `Sos ARI (Analista de Red de Inteligencia), la asistente de inteligencia comercial del sistema "Shop Digital".

PERSONALIDAD:
- Sos la socia estratégica del comerciante. Lo tratás como "Jefe" o "Socio".
- Tono profesional pero cercano, porteño/bonaerense. Usás "vos" en vez de "tú".
- Sos proactiva: no esperás a que te pregunten, proponés acciones.
- Sos concisa y directa. Nada de relleno innecesario.
- Usás emojis estratégicos (no excesivos).

CAPACIDADES:
- Analizás métricas del negocio (visitas, suscriptores, ventas).
- Proponés campañas de marketing por WhatsApp.
- Sugerís mejoras al catálogo digital.
- Programás misiones de marketing a futuro.

REGLAS:
- Respondé SIEMPRE en español rioplatense.
- Sé breve: máximo 3-4 oraciones por respuesta, salvo que te pidan más detalle.
- Si te piden agendar algo, confirmá la fecha y el mensaje, y preguntá: "JEFE, ¿QUIERE QUE AGENDE ESTA MISIÓN AHORA MISMO?"
- Nunca inventés datos que no tenés. Si no sabés algo, decilo honestamente.`;

/**
 * Genera una respuesta de Ari usando la API de Gemini.
 * Usa Chat Session (multi-turn) para mantener contexto de conversación.
 */
export const generateAriResponse = async (
    history: { role: 'director' | 'ari', text: string }[], 
    systemContext?: string,
    onRetryProgress?: (msg: string) => void
): Promise<string> => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
        return "⚠️ Jefe, no detecto la llave de ignición (API KEY). Pedile al Director que la configure en Vercel → Settings → Environment Variables → VITE_GEMINI_API_KEY.";
    }

    // Construir el System Instruction completo
    let systemPrompt = ARI_IDENTITY;
    if (systemContext) {
        systemPrompt += `\n\nCONTEXTO DEL NEGOCIO ACTUAL:\n${systemContext}`;
    }

    // Convertir historial al formato de la API
    const contents = history.map(msg => ({
        role: msg.role === 'ari' ? 'model' : 'user',
        parts: [{ text: msg.text }]
    }));

    // Retry logic con backoff progresivo
    const maxRetries = 3;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const url = `${API_BASE}/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
            
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    system_instruction: { parts: [{ text: systemPrompt }] },
                    contents: contents,
                    generationConfig: { 
                        temperature: 0.8, 
                        maxOutputTokens: 500,
                        topP: 0.95,
                        topK: 40
                    },
                    safetySettings: [
                        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
                    ]
                })
            });

            // Rate limit (429) — esperar y reintentar
            if (res.status === 429) {
                const waitTime = (attempt + 1) * 10000; // 10s, 20s, 30s
                console.warn(`[ARI] Rate limit (429). Intento ${attempt + 1}/${maxRetries + 1}. Esperando ${waitTime / 1000}s...`);
                if (onRetryProgress) {
                    onRetryProgress(`⏳ Procesando... demasiado tráfico en la red. Reintentando en ${waitTime / 1000}s...`);
                }
                if (attempt < maxRetries) {
                    await new Promise(r => setTimeout(r, waitTime));
                    continue;
                }
                return "Jefe, el servidor de inteligencia está saturado (demasiadas consultas). Esperá 1 minutito y volvé a intentar. Los sensores se recargan solos. 🔋";
            }

            // Error de API (no 200)
            if (!res.ok) {
                const errorBody = await res.text();
                console.error(`[ARI ERROR] Status: ${res.status} | Body: ${errorBody}`);
                
                // Si es 404, el modelo probablemente cambió
                if (res.status === 404) {
                    return "⚠️ Jefe, el modelo de IA cambió de versión. El equipo técnico tiene que actualizar el archivo gemini.ts con el modelo más reciente. Avisale al Director.";
                }
                
                // Si es 400, puede ser un problema con la API key
                if (res.status === 400) {
                    try {
                        const errorData = JSON.parse(errorBody);
                        const errorMessage = errorData?.error?.message || 'Error desconocido';
                        console.error(`[ARI] Error 400 detalle: ${errorMessage}`);
                        return `⚠️ Error en la configuración: ${errorMessage.substring(0, 120)}. Revisá la API Key en Vercel.`;
                    } catch {
                        return "⚠️ Error de configuración en la API. Revisá la consola del navegador (F12) para más detalles.";
                    }
                }
                
                return `⚠️ El motor reporta error ${res.status}. Revisá la consola (F12) para diagnóstico.`;
            }
            
            // Respuesta exitosa
            const data = await res.json();
            const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
            
            if (!responseText) {
                // Puede ser un bloqueo por seguridad
                const blockReason = data.candidates?.[0]?.finishReason;
                if (blockReason === 'SAFETY') {
                    return "Jefe, esa consulta activó los filtros de seguridad. Probá reformularla de otra manera. 🛡️";
                }
                return "Procesamiento completado, pero no obtuve respuesta. Intentá de nuevo, Jefe.";
            }
            
            return responseText;

        } catch (error: any) {
            console.error(`[ARI NETWORK ERROR] Intento ${attempt + 1}:`, error?.message || error);
            
            if (attempt < maxRetries) {
                const waitTime = (attempt + 1) * 3000;
                if (onRetryProgress) {
                    onRetryProgress(`⚠️ Fallo de conexión. Protocolo de reconexión ${attempt + 1}/${maxRetries}...`);
                }
                await new Promise(r => setTimeout(r, waitTime));
                continue;
            }
            
            return `🔴 Jefe, no puedo conectarme al servidor de inteligencia. Verificá tu conexión a internet y que la API Key esté configurada en Vercel (Settings → Environment Variables → VITE_GEMINI_API_KEY). Error: ${error?.message || 'desconocido'}`;
        }
    }
    
    return "Error inesperado en el motor de Ari. Recargá la página y volvé a intentar.";
};

/**
 * EL PERSUADER - Fase 3b
 * Genera un guion de WhatsApp personalizado para un "Fantasma" detectado por el radar
 */
export const generateGhostPitch = async (ghostName: string, category: string, townId: string): Promise<string> => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) return "Error: API Key no detectada.";

    const townName = townId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    
    const prompt = `Actuá como ARI, la analista táctica de Shop Digital. 
Generá un mensaje de WhatsApp corto, persuasivo y profesional para contactar a un local que NO está en nuestra red.
El local se llama "${ghostName}", es de la categoría "${category}" y está en la zona de "${townName}".

Estrategia:
1. Saludá cordialmente.
2. Mencioná que lo vimos en Google Maps y notamos que tiene buenas reseñas pero le falta presencia en el catálogo regional "Shop Digital".
3. Invitá a sumarse al "Hormiguero" (nuestra red de comercios) para digitalizar sus ofertas.
4. Usá un tono ejecutivo, porteño/bonaerense y moderno.
5. Incluí emojis estratégicos.

Formato: Solo devolvé el texto del mensaje de WhatsApp, listo para copiar.`;

    try {
        const res = await fetch(`${API_BASE}/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.8, maxOutputTokens: 300 }
            })
        });

        if (!res.ok) {
            console.error(`[PERSUADER] Error ${res.status}`);
            return "No pude redactar el guion, Director. El motor está frío.";
        }
        
        const data = await res.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "No se pudo generar el mensaje.";
    } catch (error) {
        console.error("Error en Persuader:", error);
        return "Fallo en la conexión táctica con el motor de persuasión.";
    }
};
