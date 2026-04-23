// ==============================
// ARI (Analista Táctica del Director)
// Único consumidor de la API de Gemini
// ==============================
export const generateAriResponse = async (history: { role: 'director'|'ari', text: string }[]) => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) return "Error de red: Llave de ignicion (API KEY) no detectada.";

    const systemPrompt = `Sos ARI (Analista de Red de Inteligencia), la mano derecha del Director "Waly" en "Shop Digital". 
Brillante, ejecutiva, levemente sarcastica pero leal al Director y a Gemy (la Socia). Estetica Cyber-Neon. 
Lenguaje tecnico mezclado con mate y camaraderia argentina. Tratas al usuario como "Director".
Responde conciso, con vinetas si es necesario.`;

    const contents = history.map(msg => ({
        role: msg.role === 'ari' ? 'model' : 'user',
        parts: [{ text: msg.text }]
    }));

    // Retry logic para 429
    const maxRetries = 2;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    system_instruction: { parts: [{ text: systemPrompt }] },
                    contents: contents,
                    generationConfig: { temperature: 0.7, maxOutputTokens: 250 }
                })
            });

            if (res.status === 429) {
                console.warn(`[ARI] Cuota agotada (429). Intento ${attempt + 1}/${maxRetries + 1}. Esperando 15s...`);
                if (attempt < maxRetries) {
                    await new Promise(r => setTimeout(r, 15000));
                    continue;
                }
                return "Director, la cuota de Gemini Free Tier esta temporalmente agotada. Espere 1 minuto y reintente. Los sensores se recargan solos. 🔋";
            }

            if (!res.ok) {
                const errorBody = await res.text();
                console.error(`[ARI ERROR] Status: ${res.status} | Body: ${errorBody}`);
                return `Sensor reporta codigo ${res.status}. Revise consola (F12).`;
            }
            
            const data = await res.json();
            return data.candidates?.[0]?.content?.parts?.[0]?.text || "Procesamiento completado. Esperando comando.";
        } catch (error: any) {
            console.error("[ARI NETWORK ERROR]:", error?.message || error);
            if (attempt < maxRetries) {
                await new Promise(r => setTimeout(r, 5000));
                continue;
            }
            return `Fallo de comunicacion: ${error?.message || 'Error desconocido'}.`;
        }
    }
    return "Error inesperado en el motor de Ari.";
};
