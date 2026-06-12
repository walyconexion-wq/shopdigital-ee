import { VercelRequest, VercelResponse } from '@vercel/node';

const PROJECT_ID = "shopdigital-ee";
const COLLECTION = "bunker_directives";
const SECRET_TOKEN = process.env.BUNKER_SNC_TOKEN || "waly_bunker_omega_key_2026";

// Helper para limpiar las respuestas REST anidadas de Firestore
function cleanFirestoreFields(fields: any) {
    const obj: any = {};
    if (!fields) return obj;
    for (const key of Object.keys(fields)) {
        const val = fields[key];
        if (val.stringValue !== undefined) {
            obj[key] = val.stringValue;
        } else if (val.integerValue !== undefined) {
            obj[key] = parseInt(val.integerValue, 10);
        } else if (val.booleanValue !== undefined) {
            obj[key] = val.booleanValue;
        } else if (val.arrayValue !== undefined) {
            const arr = val.arrayValue.values || [];
            obj[key] = arr.map((item: any) => {
                if (item.stringValue !== undefined) return item.stringValue;
                if (item.mapValue !== undefined) return cleanFirestoreFields(item.mapValue.fields);
                return item;
            });
        } else if (val.mapValue !== undefined) {
            obj[key] = cleanFirestoreFields(val.mapValue.fields);
        }
    }
    return obj;
}

export default async function (req: VercelRequest, res: VercelResponse) {
    // 1. Validar Token de Seguridad
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: "No autorizado. Se requiere token Bearer." });
    }
    const token = authHeader.split(' ')[1];
    if (token !== SECRET_TOKEN) {
        return res.status(403).json({ error: "Token inválido o denegado." });
    }

    const method = req.method;

    if (method === 'GET') {
        try {
            // Obtener directivas activas y pendientes
            const response = await fetch(`https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    structuredQuery: {
                        from: [{ collectionId: COLLECTION }],
                        where: {
                            fieldFilter: {
                                field: { fieldPath: "estado" },
                                op: "IN",
                                value: {
                                    arrayValue: {
                                        values: [
                                            { stringValue: "active" },
                                            { stringValue: "pending_approval" }
                                        ]
                                    }
                                }
                            }
                        }
                    }
                })
            });

            if (!response.ok) {
                const errMsg = await response.text();
                return res.status(response.status).json({ error: "Error al consultar Firestore", details: errMsg });
            }

            const data = await response.json();
            const directives = data
                .filter((d: any) => d.document)
                .map((d: any) => {
                    const doc = d.document;
                    const id = doc.name.split('/').pop();
                    const fields = cleanFirestoreFields(doc.fields);
                    return { id, ...fields };
                });

            return res.status(200).json({ status: "ok", directives });

        } catch (error: any) {
            console.error("Error en GET sync:", error);
            return res.status(500).json({ error: "Error interno del servidor", details: error.message });
        }
    } 
    
    if (method === 'POST') {
        try {
            const { title, content, priority, type, targetBunkers, sender } = req.body;

            if (!title || !content || !priority || !type || !targetBunkers || !sender) {
                return res.status(400).json({ error: "Campos requeridos faltantes: title, content, priority, type, targetBunkers, sender" });
            }

            // Preparar el documento Firestore en formato REST
            const documentFields: any = {
                title: { stringValue: title },
                content: { stringValue: content },
                priority: { stringValue: priority },
                type: { stringValue: type },
                targetBunkers: {
                    arrayValue: {
                        values: targetBunkers.map((b: string) => ({ stringValue: b }))
                    }
                },
                sender: { stringValue: sender },
                fechaCreacion: { stringValue: new Date().toISOString() },
                estado: { stringValue: "pending_approval" }, // IA propone -> Estado PENDIENTE por defecto 🛡️
                respuestas: {
                    arrayValue: {}
                }
            };

            const response = await fetch(`https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${COLLECTION}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fields: documentFields })
            });

            if (!response.ok) {
                const errMsg = await response.text();
                return res.status(response.status).json({ error: "Error al crear documento en Firestore", details: errMsg });
            }

            const data = await response.json();
            const id = data.name.split('/').pop();

            return res.status(201).json({
                status: "ok",
                message: "Propuesta de directiva cargada como PENDIENTE. Esperando aprobación del Director.",
                directiveId: id
            });

        } catch (error: any) {
            console.error("Error en POST sync:", error);
            return res.status(500).json({ error: "Error interno del servidor", details: error.message });
        }
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: `Método ${method} no permitido.` });
}
