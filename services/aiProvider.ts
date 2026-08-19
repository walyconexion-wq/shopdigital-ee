// =========================================================================
// 🇨🇳 MOTOR DE INTELIGENCIA ARTIFICIAL MULTI-PROVEEDOR — aiProvider.ts
// Proveedores: DeepSeek V3 (Directo) + OpenRouter (Gratis/Low-Cost) + Fallback
// ShopDigital · Búnker de Sistemas & Automatización
// Director: Waly | Ingeniería: Luz 01
// =========================================================================

export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface AiRequestOptions {
    messages: ChatMessage[];
    temperature?: number;
    maxTokens?: number;
    preferredProvider?: 'deepseek' | 'openrouter' | 'auto';
}

const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY || '';
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '';

/**
 * 1. Llamada directa a DeepSeek API (DeepSeek-V3 / deepseek-chat)
 * Costo ultra-económico: $0.14/M input tokens, ultra rápido.
 */
async function callDeepSeek(messages: ChatMessage[], temperature = 0.7, maxTokens = 800): Promise<string> {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
            model: 'deepseek-chat',
            messages: messages,
            temperature: temperature,
            max_tokens: maxTokens,
            stream: false
        })
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`[DeepSeek API Error HTTP ${response.status}]: ${errText}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
        throw new Error('[DeepSeek] Respuesta vacía del modelo');
    }

    return content.trim();
}

/**
 * 2. Llamada a OpenRouter API (Pasarela con modelos Free y Low-Cost)
 * Soporta DeepSeek-R1, Qwen 2.5 72B, Llama 3.3 70B
 */
async function callOpenRouter(messages: ChatMessage[], temperature = 0.7, maxTokens = 800): Promise<string> {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'HTTP-Referer': 'https://shopdigital.tech',
            'X-Title': 'ShopDigital ARI Assistant'
        },
        body: JSON.stringify({
            model: 'deepseek/deepseek-chat',
            messages: messages,
            temperature: temperature,
            max_tokens: maxTokens
        })
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`[OpenRouter API Error HTTP ${response.status}]: ${errText}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
        throw new Error('[OpenRouter] Respuesta vacía del modelo');
    }

    return content.trim();
}

/**
 * Función Maestra: Ejecuta la consulta con Auto-Sanación (Fallback automático).
 * Prioridad 1: DeepSeek V3 Directo.
 * Prioridad 2: OpenRouter (DeepSeek / Qwen).
 */
export async function generateAiCompletion(options: AiRequestOptions): Promise<string> {
    const { messages, temperature = 0.7, maxTokens = 800, preferredProvider = 'auto' } = options;

    // Si se forzó OpenRouter
    if (preferredProvider === 'openrouter') {
        try {
            console.log('[AI Provider] 🚀 Consultando OpenRouter API...');
            return await callOpenRouter(messages, temperature, maxTokens);
        } catch (err: any) {
            console.warn('[AI Provider] ⚠️ OpenRouter falló, intentando DeepSeek:', err.message);
            return await callDeepSeek(messages, temperature, maxTokens);
        }
    }

    // Por defecto: Intentar DeepSeek Directo primero
    try {
        console.log('[AI Provider] 🇨🇳 Consultando DeepSeek V3 API directo...');
        return await callDeepSeek(messages, temperature, maxTokens);
    } catch (err: any) {
        console.warn('[AI Provider] ⚠️ DeepSeek directo falló, activando OpenRouter de respaldo:', err.message);
        try {
            return await callOpenRouter(messages, temperature, maxTokens);
        } catch (routerErr: any) {
            console.error('[AI Provider] ❌ Todos los proveedores fallaron:', routerErr);
            throw routerErr;
        }
    }
}
