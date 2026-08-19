import os
import json
import glob

VAULT_DIR = r"C:\Users\walya\.gemini\antigravity\scratch\ShopDigital_Vault"
BRAIN_DIR = r"C:\Users\walya\.gemini\antigravity\brain"

def sync_conversations_to_obsidian():
    print("🧠 Sincronizando Conversaciones y Búnkeres a la Red Neuronal de Obsidian...")
    
    # 1. Crear carpeta de Índice de Conversaciones en Obsidian
    conv_vault_dir = os.path.join(VAULT_DIR, "CONVERSACIONES_ANTIGRAVITY")
    os.makedirs(conv_vault_dir, exist_ok=True)
    
    # 2. Buscar carpetas de conversaciones en brain
    if os.path.exists(BRAIN_DIR):
        conv_folders = [f for f in os.listdir(BRAIN_DIR) if os.path.isdir(os.path.join(BRAIN_DIR, f)) and not f.startswith('.')]
    else:
        conv_folders = []
    
    indexed_count = 0
    for conv_id in conv_folders:
        transcript_file = os.path.join(BRAIN_DIR, conv_id, ".system_generated", "logs", "transcript.jsonl")
        md_file_path = os.path.join(conv_vault_dir, f"CONV_{conv_id}.md")
        
        # Crear ficha de red neuronal vinculada
        content = f"""# 🧠 FICHA DE CONVERSACIÓN: {conv_id}

- **ID de Conversación:** `{conv_id}`
- **Entorno:** Google Antigravity Engine
- **Estado:** Indexado en Red Neuronal de Obsidian

## 🔗 Vinculación a Búnkeres & Enjambre
- [[BK01_Core_Bruno]]
- [[BK02_Frontend_Luz01]]
- [[BK03_SecOps_Thor]]
- [[BK08_Ventas_CRM]]
- [[BK11_Vortex_QA]]
- [[BK12_Comando_Waly]]

## 📜 Registro de Logs & Transcripción
- Archivo de Logs Local: [transcript.jsonl](file:///{transcript_file.replace('\\', '/')})

---
*Indexado automáticamente por el Script de Red Neuronal de Luz 01.*
"""
        with open(md_file_path, "w", encoding="utf-8") as f:
            f.write(content)
        indexed_count += 1

    print(f"✅ ¡Red Neuronal de Obsidian Actualizada! {indexed_count} Fichas de Conversación Indexadas.")

if __name__ == "__main__":
    sync_conversations_to_obsidian()
