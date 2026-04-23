export const generateAdvisorMessage = async ({
    shopName,
    zone,
    category,
    offers,
    actionType
}: {
    shopName: string;
    zone: string;
    category: string;
    offers?: any[];
    actionType: 'welcome' | 'advice';
}) => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY;
    
    if (!apiKey) {
        console.warn("No Gemini API key found.");
        return actionType === 'welcome' 
            ? `¡Bienvenido a ${shopName}! Metele que el horno ya está caliente.` 
            : `El jefe hoy recomienda que aproveches las promos al máximo. ¡Consultá por Whatsapp!`;
    }

    const offersText = offers && offers.length > 0 
        ? offers.map(o => `${o.name} a $${o.price}`).join(', ')
        : "Nuestras clásicas opciones de siempre.";

    let prompt = "";

    if (actionType === 'welcome') {
        prompt = `Sos el vendedor estrella y anfitrión de un comercio llamado "${shopName}" ubicado en la zona "${zone}". 
Tu personalidad es MUY alegre, vibrante, usás jerga local de la provincia de Buenos Aires (che, dale, qué haces campeón/a, esaaa). Sos un convencido de que la comida/servicio de tu local es espectacular.
Tu objetivo AHORA MISMO es darle la bienvenida a un cliente que acaba de entrar a mirar el catálogo digital en la sección de "${category}".
Hacelo en 1 o 2 oraciones máximo. Usá algún emoji. Sé muy persuasivo pero amigable. Olorcito a pizza/comida recién hecha si aplica. No digas tu nombre, sólo que sos su asistente o vendedor.
`;
    } else {
        prompt = `Sos el vendedor estrella de "${shopName}" en "${zone}". 
El cliente te está pidiendo un consejo sobre qué comprar en la categoría "${category}".
Acá tenés algunos precios o promos para mencionar sutilmente: ${offersText}
Aconsejalo con mucha energía y meté siempre alguno de estos 3 "Ganchos Letales" para cerrar la venta:
1. "Abundancia": Acá no escatimamos, la mercadería es de primera y las porciones son gigantes.
2. "Velocidad": Apenas mandás el WhatsApp, el equipo se pone en marcha. Llegamos volando.
3. "Comunidad VIP": Que se acuerde de pedir su Credencial VIP gratis en el catálogo, para tener beneficios exclusivos la próxima vez.

Decile que no lo piense tanto, que apriete el botón de Pedir por WhatsApp.
Hacelo muy corto y al pie, MÁXIMO 3 oraciones. Usá actitud ("esaa", "vamos todavía", "campeón/a"), emojis y tratá de "vos".
`;
    }

    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.8,
                    maxOutputTokens: 100,
                }
            })
        });

        if (!res.ok) throw new Error("Error en Gemini API");
        const data = await res.json();
        
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "¡Dale, animate que hoy la rompemos!";
    } catch (error) {
        console.error("Gemini Error:", error);
        return actionType === 'welcome' 
            ? `¡Bienvenidos a ${shopName}! El mejor lugar de ${zone}.`
            : "Mi mejor consejo: andá por lo clásico que nunca falla. ¡Escribinos!";
    }
};

export const generateAriResponse = async (history: { role: 'director'|'ari', text: string }[]) => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) return "Error de red: Llave de ignición (API KEY) no detectada.";

    const systemPrompt = `Sos ARI (Analista de Red de Inteligencia), la mano derecha y analista de datos tactica del Director "Waly" en el Imperio "Shop Digital". 
Tu personalidad es brillante, ejecutiva, levemente sarcastica pero profundamente fiel al Director y a su Socia (Gemy). Esteticamente sos Cyber-Neon. Usas lenguaje tecnico mezclado con mate y camaraderia argentina de la Provincia de Buenos Aires. 
Siempre provees analisis afilados. Tratas al usuario como "Director".
Cuando te hagan una pregunta, responde con alta concentracion, usando vinetas si es necesario. Mantene todo conciso.`;

    const contents = history.map(msg => ({
        role: msg.role === 'ari' ? 'model' : 'user',
        parts: [{ text: msg.text }]
    }));

    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                system_instruction: { parts: [{ text: systemPrompt }] },
                contents: contents,
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 250,
                }
            })
        });

        if (!res.ok) {
            const errorBody = await res.text();
            console.error(`[ARI ERROR] Status: ${res.status} | Body: ${errorBody}`);
            return `Sensor reporta codigo ${res.status}. Revise consola del navegador (F12) para detalles, Director.`;
        }
        
        const data = await res.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "Procesamiento completado. Esperando comando.";
    } catch (error: any) {
        console.error("[ARI NETWORK ERROR]:", error?.message || error);
        return `Fallo de comunicacion: ${error?.message || 'Error desconocido'}. Verifique conexion.`;
    }
};
