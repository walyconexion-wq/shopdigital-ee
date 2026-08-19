import sys
import os
import subprocess
import time

class JarvisController:
    """
    SISTEMA DE CONTROL JARVIS OS - GOOGLE ANTIGRAVITY (SNC 2.0)
    Agente: Luz 01
    """

    @staticmethod
    def open_youtube_search(query: str = "Google Antigravity AI demo"):
        """Abre el navegador en YouTube buscando el tema especificado y reproduciendo automáticamente."""
        print(f"🤖 [JARVIS LUZ 01] Buscando en YouTube: {query}")
        formatted_query = query.replace(" ", "+")
        url = f"https://www.youtube.com/results?search_query={formatted_query}"
        
        if sys.platform == "win32":
            os.system(f"start {url}")
        else:
            subprocess.Popen(["xdg-open", url])
        return {"status": "success", "action": "open_youtube", "query": query, "url": url}

    @staticmethod
    def open_app(app_name: str):
        """Abre una aplicación de Windows (Obsidian, Chrome, Notepad, etc.)."""
        print(f"🤖 [JARVIS LUZ 01] Abriendo aplicación: {app_name}")
        if app_name.lower() == "obsidian":
            obsidian_vault_path = r"C:\Users\walya\.gemini\antigravity\scratch\ShopDigital_Vault"
            os.system(f"start obsidian://open?path={obsidian_vault_path}")
        else:
            os.system(f"start {app_name}")
        return {"status": "success", "action": "open_app", "app": app_name}

    @staticmethod
    def run_qa_audit():
        """Ejecuta el Búnker 11 (Vortex QA Testing) via Playwright."""
        print("🤖 [JARVIS LUZ 01] Iniciando auditoría sintética de QA con Playwright...")
        cwd = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        res = subprocess.run(["npx.cmd", "playwright", "test"], cwd=cwd, capture_output=True, text=True)
        return {"status": "success" if res.returncode == 0 else "error", "output": res.stdout}

if __name__ == "__main__":
    if len(sys.argv) > 1:
        command = sys.argv[1]
        if command == "youtube":
            query = sys.argv[2] if len(sys.argv) > 2 else "Google Antigravity AI agent"
            JarvisController.open_youtube_search(query)
        elif command == "app":
            app = sys.argv[2] if len(sys.argv) > 2 else "obsidian"
            JarvisController.open_app(app)
        elif command == "qa":
            print(JarvisController.run_qa_audit())
    else:
        # Ejecución de prueba por defecto
        JarvisController.open_youtube_search("Google Antigravity AI demo 2026")
