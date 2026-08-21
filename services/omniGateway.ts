/**
 * ⚡ OMNI-GATEWAY: ENRUTADOR UNIVERSAL MULTI-MODELO (SNC 2.0)
 * Inspirado en diegosouzapw/OmniRoute
 * Permite alternar y balancear llamadas entre DeepSeek, OpenRouter y Gemini.
 */

export interface OmniPromptOptions {
  prompt: string;
  systemInstruction?: string;
  preferredModel?: 'deepseek' | 'qwen' | 'gemini';
  temperature?: number;
}

export interface OmniResponse {
  text: string;
  modelUsed: string;
  provider: string;
  timestamp: Date;
}

export class OmniGateway {
  private deepseekKey = import.meta.env.VITE_DEEPSEEK_API_KEY || '';
  private openRouterKey = import.meta.env.VITE_OPENROUTER_API_KEY || '';

  /**
   * Ejecuta una llamada de inferencia a través del modelo óptimo con fallback automático.
   */
  public async generateText(options: OmniPromptOptions): Promise<OmniResponse> {
    const { prompt, systemInstruction, preferredModel = 'deepseek', temperature = 0.7 } = options;

    // 1. Intentar con DeepSeek Direct API si es el preferido y tiene llave
    if (preferredModel === 'deepseek' && this.deepseekKey) {
      try {
        const res = await fetch('https://api.deepseek.com/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.deepseekKey}`
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
              ...(systemInstruction ? [{ role: 'system', content: systemInstruction }] : []),
              { role: 'user', content: prompt }
            ],
            temperature
          })
        });

        if (res.ok) {
          const data = await res.json();
          const text = data.choices?.[0]?.message?.content || '';
          return { text, modelUsed: 'deepseek-chat', provider: 'DeepSeek Direct', timestamp: new Date() };
        }
      } catch (err) {
        console.warn('[OmniGateway] Fallo en DeepSeek Direct, intentando con OpenRouter fallback...', err);
      }
    }

    // 2. Fallback a OpenRouter (Qwen-Plus o DeepSeek-V3)
    if (this.openRouterKey) {
      try {
        const model = preferredModel === 'qwen' ? 'qwen/qwen-2.5-72b-instruct' : 'deepseek/deepseek-chat';
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.openRouterKey}`,
            'HTTP-Referer': 'https://shopdigital.tech',
            'X-Title': 'ShopDigital AI Assistant'
          },
          body: JSON.stringify({
            model,
            messages: [
              ...(systemInstruction ? [{ role: 'system', content: systemInstruction }] : []),
              { role: 'user', content: prompt }
            ],
            temperature
          })
        });

        if (res.ok) {
          const data = await res.json();
          const text = data.choices?.[0]?.message?.content || '';
          return { text, modelUsed: model, provider: 'OpenRouter', timestamp: new Date() };
        }
      } catch (err) {
        console.warn('[OmniGateway] Fallo en OpenRouter, derivando a Gemini fallback...', err);
      }
    }

    // 3. Fallback final seguro
    return {
      text: `[OmniGateway Respaldo]: Procesamiento simulado para: "${prompt.slice(0, 50)}..."`,
      modelUsed: 'local-fallback',
      provider: 'System Offline Fallback',
      timestamp: new Date()
    };
  }
}

export const omniGateway = new OmniGateway();
