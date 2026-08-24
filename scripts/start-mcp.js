import { spawn } from 'child_process';
import localtunnel from 'localtunnel';
import fs from 'fs/promises';
import path from 'path';

const PORT = 3333;
const OBSIDIAN_VAULT_PATH = 'C:\\Users\\walya\\Documents\\Obsidian Vault';

async function main() {
    console.log('🚀 [1/2] Iniciando Servidor MCP Obsidian Bridge...');
    
    // Iniciar servidor TypeScript con tsx
    const serverProcess = spawn('npx', ['tsx', 'mcp-server/obsidian-bridge.ts'], {
        stdio: 'inherit',
        shell: true
    });

    // Esperar 2 segundos para que el servidor levante
    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log('🌐 [2/2] Abriendo Túnel HTTPS para Google Gemini Web...');
    
    try {
        const tunnel = await localtunnel({ port: PORT });
        const mcpUrl = `${tunnel.url}/sse`;

        console.log('\n' + '='.repeat(60));
        console.log('🎉 ¡PUENTE MCP ACTIVO Y CONECTADO!');
        console.log('📋 COPIÁ ESTA URL Y PEGALA EN gemini.google.com/apps:');
        console.log(`👉 ${mcpUrl}`);
        console.log('='.repeat(60) + '\n');

        // Guardar la URL en Obsidian para registro permanente
        const noteContent = `# 🔌 PUENTE MCP ACTIVO: GOOGLE GEMINI ↔ OBSIDIAN
> **Fecha:** ${new Date().toLocaleString('es-AR')}  
> **Estado:** 🟢 ONLINE & ESCUCHANDO  
> **URL para Gemini Web:** \`${mcpUrl}\`  

---

## 🛠️ Herramientas Disponibles para Gemini:
1. \`read_obsidian_note\`: Lee notas de la bóveda.
2. \`write_obsidian_note\`: Escribe notas en la bóveda.
3. \`list_obsidian_vault\`: Lista los archivos .md.
4. \`get_bunker_tactico_status\`: Telemetría de los 12 Ministros.
5. \`dispatch_agent_mission\`: Asigna misiones en el Tablero.
`;
        await fs.writeFile(path.join(OBSIDIAN_VAULT_PATH, 'MCP_SERVER_LIVE_URL.md'), noteContent, 'utf-8');

        tunnel.on('close', () => {
            console.log('⚠️ Túnel cerrado.');
        });
    } catch (err) {
        console.error('❌ Error al abrir el túnel:', err);
    }
}

main();
