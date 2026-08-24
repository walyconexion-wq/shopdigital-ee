import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { z } from 'zod';

const OBSIDIAN_VAULT_PATH = 'C:\\Users\\walya\\Documents\\Obsidian Vault';
const PORT = process.env.MCP_PORT ? parseInt(process.env.MCP_PORT, 10) : 3333;

const app = express();
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Instanciar el servidor MCP
const mcpServer = new McpServer({
    name: "ShopDigital-Obsidian-Bridge",
    version: "2.0.0"
});

// 📖 HERRAMIENTA 1: Leer una nota de Obsidian
mcpServer.tool(
    "read_obsidian_note",
    "Lee el contenido completo de una nota específica de la bóveda de Obsidian de ShopDigital.",
    {
        noteName: z.string().describe("Nombre del archivo o nota (ej: GENERAL_MELISA_MARKETING o BUNKER_TACTICO_Y_ESTRATEGICO_SNC2.md)")
    },
    async ({ noteName }) => {
        try {
            const fileName = noteName.endsWith('.md') ? noteName : `${noteName}.md`;
            const filePath = path.join(OBSIDIAN_VAULT_PATH, fileName);
            const content = await fs.readFile(filePath, 'utf-8');
            return {
                content: [{ type: "text", text: `=== NOTA: ${fileName} ===\n\n${content}` }]
            };
        } catch (error: any) {
            return {
                content: [{ type: "text", text: `Error al leer la nota "${noteName}": ${error.message}` }],
                isError: true
            };
        }
    }
);

// ✍️ HERRAMIENTA 2: Escribir o actualizar una nota en Obsidian
mcpServer.tool(
    "write_obsidian_note",
    "Crea o sobreescribe una nota en la bóveda de Obsidian Vault de ShopDigital.",
    {
        noteName: z.string().describe("Nombre de la nota (ej: REPORTE_GEMINI_MARKETING.md)"),
        content: z.string().describe("Contenido en formato Markdown con enlaces bidireccionales [[...]]")
    },
    async ({ noteName, content }) => {
        try {
            const fileName = noteName.endsWith('.md') ? noteName : `${noteName}.md`;
            const filePath = path.join(OBSIDIAN_VAULT_PATH, fileName);
            await fs.writeFile(filePath, content, 'utf-8');
            return {
                content: [{ type: "text", text: `✅ Nota "${fileName}" guardada exitosamente en Obsidian Vault.` }]
            };
        } catch (error: any) {
            return {
                content: [{ type: "text", text: `Error al guardar la nota "${noteName}": ${error.message}` }],
                isError: true
            };
        }
    }
);

// 📂 HERRAMIENTA 3: Listar todas las notas de la bóveda
mcpServer.tool(
    "list_obsidian_vault",
    "Lista todas las notas y documentos markdown presentes en la bóveda de Obsidian de ShopDigital.",
    {},
    async () => {
        try {
            const files = await fs.readdir(OBSIDIAN_VAULT_PATH);
            const mdFiles = files.filter(f => f.endsWith('.md'));
            return {
                content: [{
                    type: "text",
                    text: `Bóveda Obsidian Vault (${mdFiles.length} notas):\n\n${mdFiles.map(f => `- [[${f.replace('.md', '')}]]`).join('\n')}`
                }]
            };
        } catch (error: any) {
            return {
                content: [{ type: "text", text: `Error al listar la bóveda: ${error.message}` }],
                isError: true
            };
        }
    }
);

// 🏛️ HERRAMIENTA 4: Obtener el estado del Búnker Táctico y los 12 Ministros
mcpServer.tool(
    "get_bunker_tactico_status",
    "Devuelve el estado operativo de los 12 Búnkeres, Frentes de Combate y directivas supremas.",
    {},
    async () => {
        const statusReport = `
🏛️ ESTADO MAYOR DE SHOPDIGITAL (SNC 2.0)
👑 Comandancia: Director Waly OMEGA & Luz 01
🌐 Entorno: Laboratorio (https://shopdigital-ar.vercel.app/esteban-echeverria/bunker-tactico)

👥 MINISTROS Y ESTADO DE FRENTES:
- 🔴 B02 Ari (UI/UX 3D): 85% - Modo Caramelo 3D & Web Design Guidelines
- 🟣 B03 Melisa (Marketing): 90% - Ingesta DeepSeek ($0.14/1M) & Writing Guidelines
- 🟣 B05 Bruno (Backend): 96% - Omni-Gateway AI SDK & TDD
- 🔵 B06 Thor & Vortex (SecOps): 100% - Doberman, Towns Lock & 0 Errores TS
- 🟢 B07 Ely (Clonación): 88% - Clonación Fractal Ezeiza & Traslasierra
- 🟡 B01 Mateo (Finanzas): 92% - ROI Optimizer & 98% Ahorro
- 📻 B08 Cuby (Transmisión): 70% - WebSockets & Live Broadcast
- 🔧 B09 Javi (Mantenimiento): 96% - Diagnóstico de Bugs & Rescate DB
- ⚖️ B10 Lore (Legal): 94% - Contratos y Compliance
- 🧑‍💼 B11 Max (RRHH): 80% - Academia ShopDigital & Embajadores
- 🚀 B12 Dante (Inversión): 75% - Dossier para CTOs y Fondos
`;
        return {
            content: [{ type: "text", text: statusReport }]
        };
    }
);

// 🚀 HERRAMIENTA 5: Despachar una nueva misión al Tablero
mcpServer.tool(
    "dispatch_agent_mission",
    "Agrega una nueva misión o directiva en el TABLERO_DE_MISIONES_Y_ORDENES_SNC2.md de Obsidian.",
    {
        targetAgent: z.string().describe("Nombre del agente o ministro (ej: MELISA, THOR, ARI)"),
        missionTitle: z.string().describe("Título corto de la misión"),
        objective: z.string().describe("Detalle del objetivo a cumplir")
    },
    async ({ targetAgent, missionTitle, objective }) => {
        try {
            const boardPath = path.join(OBSIDIAN_VAULT_PATH, 'TABLERO_DE_MISIONES_Y_ORDENES_SNC2.md');
            let content = await fs.readFile(boardPath, 'utf-8');
            
            const newMissionEntry = `
### ⚡ NUEVA MISIÓN: ${missionTitle.toUpperCase()}
- **Agente Asignado:** \`${targetAgent.toUpperCase()}\`
- **Estado:** 🟡 \`[EN PROCESO]\`
- **Objetivo:** ${objective}
- **Fecha de Emisión:** ${new Date().toLocaleDateString('es-AR')}
`;
            content += `\n${newMissionEntry}`;
            await fs.writeFile(boardPath, content, 'utf-8');

            return {
                content: [{ type: "text", text: `✅ Misión "${missionTitle}" asignada a ${targetAgent} y registrada en el Tablero de Obsidian.` }]
            };
        } catch (error: any) {
            return {
                content: [{ type: "text", text: `Error al despachar la misión: ${error.message}` }],
                isError: true
            };
        }
    }
);

// Gestor de transportes SSE
let transport: SSEServerTransport | null = null;

// Endpoint SSE para conexión de Gemini Web
app.get('/sse', async (req, res) => {
    console.log('⚡ [MCP Bridge] Nueva conexión SSE entrante desde Gemini Web...');
    transport = new SSEServerTransport('/messages', res);
    await mcpServer.connect(transport);
});

// Endpoint POST para mensajes de vuelta
app.post('/messages', async (req, res) => {
    if (transport) {
        await transport.handlePostMessage(req, res);
    } else {
        res.status(400).send('No hay transporte SSE activo.');
    }
});

// Endpoint de prueba para verificar estado
app.get('/', (req, res) => {
    res.send({
        status: "online",
        bridge: "ShopDigital MCP Bridge v2.0",
        sseEndpoint: "/sse",
        messagesEndpoint: "/messages",
        obsidianPath: OBSIDIAN_VAULT_PATH,
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🔌 PUENTE MCP SHOPDIGITAL ONLINE`);
    console.log(`🌐 Servidor local escuchando en: http://localhost:${PORT}`);
    console.log(`📡 Endpoint SSE: http://localhost:${PORT}/sse`);
    console.log(`🧠 Conectado a Bóveda: ${OBSIDIAN_VAULT_PATH}`);
    console.log(`======================================================\n`);
});
