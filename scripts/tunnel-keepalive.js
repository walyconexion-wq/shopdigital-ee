import localtunnel from 'localtunnel';
import fs from 'fs/promises';
import path from 'path';

const PORT = 3333;
const OBSIDIAN_VAULT_PATH = 'C:\\Users\\walya\\Documents\\Obsidian Vault';

let activeTunnel = null;

async function startTunnel() {
    try {
        console.log('🔄 Iniciando túnel localtunnel en puerto 3333...');
        activeTunnel = await localtunnel({ port: PORT, subdomain: 'shopdigital-mcp-bridge' });

        const mcpUrl = `${activeTunnel.url}/sse`;
        console.log('\n======================================================');
        console.log('🎉 TÚNEL MCP PERMANENTE ACTIVO (HEARTBEAT VIVO):');
        console.log(`👉 ${mcpUrl}`);
        console.log('======================================================\n');

        const noteContent = `# 🔌 PUENTE MCP ACTIVO (GEMINI ↔ OBSIDIAN)
> **Fecha:** ${new Date().toLocaleString('es-AR')}  
> **Estado:** 🟢 ONLINE & PERSISTENTE  
> **URL para Gemini Web:** \`${mcpUrl}\`  

---

## 🛠️ Herramientas Exponenciales Conectadas:
1. \`read_obsidian_note\`: Lee notas de la bóveda.
2. \`write_obsidian_note\`: Escribe notas en la bóveda.
3. \`list_obsidian_vault\`: Lista los archivos .md.
4. \`get_bunker_tactico_status\`: Telemetría de los 12 Ministros.
5. \`dispatch_agent_mission\`: Asigna misiones en el Tablero.
`;
        await fs.writeFile(path.join(OBSIDIAN_VAULT_PATH, 'MCP_SERVER_LIVE_URL.md'), noteContent, 'utf-8');

        activeTunnel.on('close', () => {
            console.log('⚠️ El túnel se cerró. Reiniciando en 2 segundos...');
            activeTunnel = null;
            setTimeout(startTunnel, 2000);
        });

        activeTunnel.on('error', (err) => {
            console.error('❌ Error en el túnel:', err);
            if (activeTunnel) activeTunnel.close();
            activeTunnel = null;
            setTimeout(startTunnel, 3000);
        });

    } catch (err) {
        console.error('❌ Error al iniciar el túnel, reintentando...', err);
        setTimeout(startTunnel, 4000);
    }
}

// Heartbeat cada 30 segundos para mantener el event loop de Node despierto indefinidamente
setInterval(() => {
    if (activeTunnel && activeTunnel.url) {
        console.log(`💓 [Heartbeat] Túnel vivo en: ${activeTunnel.url}/sse`);
    }
}, 30000);

startTunnel();
