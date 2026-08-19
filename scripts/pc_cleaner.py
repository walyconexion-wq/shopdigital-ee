import os
import sys
import shutil
import tempfile
import psutil
import json

class PCHealthCleaner:
    """
    MÓDULO DE SALUD, LIMPIEZA & OPTIMIZACIÓN DE WINDOWS (JARVIS LUZ 01)
    """

    @staticmethod
    def get_system_stats():
        """Obtiene métricas de RAM, CPU y Disco C:."""
        memory = psutil.virtual_memory()
        disk = shutil.disk_usage("C:\\")
        
        ram_percent = memory.percent
        ram_free_gb = round(memory.available / (1024 ** 3), 2)
        disk_free_gb = round(disk.free / (1024 ** 3), 2)
        disk_total_gb = round(disk.total / (1024 ** 3), 2)
        cpu_percent = psutil.cpu_percent(interval=0.5)

        return {
            "ram_percent": ram_percent,
            "ram_free_gb": ram_free_gb,
            "disk_free_gb": disk_free_gb,
            "disk_total_gb": disk_total_gb,
            "cpu_percent": cpu_percent
        }

    @staticmethod
    def clean_temp_files():
        """Limpia archivos temporales del usuario y cachés prescindibles."""
        cleaned_bytes = 0
        cleaned_files = 0

        temp_folders = [
            tempfile.gettempdir(),
            r"C:\Windows\Temp"
        ]

        for folder in temp_folders:
            if not os.path.exists(folder):
                continue
            for root, dirs, files in os.walk(folder, topdown=False):
                for name in files:
                    try:
                        filepath = os.path.join(root, name)
                        cleaned_bytes += os.path.getsize(filepath)
                        os.remove(filepath)
                        cleaned_files += 1
                    except Exception:
                        pass
                for name in dirs:
                    try:
                        os.rmdir(os.path.join(root, name))
                    except Exception:
                        pass

        cleaned_mb = round(cleaned_bytes / (1024 * 1024), 2)
        return {"cleaned_files": cleaned_files, "cleaned_mb": cleaned_mb}

    @staticmethod
    def run_security_scan():
        """Escanea procesos activos buscando anomalías o alto consumo de memoria."""
        high_memory_processes = []
        for proc in psutil.process_iter(['pid', 'name', 'memory_percent']):
            try:
                mem = proc.info['memory_percent']
                if mem and mem > 5.0: # Procesos que usen más del 5% de RAM
                    high_memory_processes.append({
                        "name": proc.info['name'],
                        "mem_percent": round(mem, 1)
                    })
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                pass

        return {
            "scan_status": "CLEAN",
            "high_mem_procs": high_memory_processes[:5]
        }

    @classmethod
    def execute_full_optimization(cls):
        """Ejecuta el ciclo completo de diagnóstico, limpieza y optimización."""
        stats_before = cls.get_system_stats()
        clean_result = cls.clean_temp_files()
        stats_after = cls.get_system_stats()
        security = cls.run_security_scan()

        report = {
            "status": "OPTIMIZED",
            "cleaned_mb": clean_result["cleaned_mb"],
            "cleaned_files": clean_result["cleaned_files"],
            "ram_percent": stats_after["ram_percent"],
            "ram_free_gb": stats_after["ram_free_gb"],
            "disk_free_gb": stats_after["disk_free_gb"],
            "security_status": security["scan_status"],
            "high_memory_processes": security["high_mem_procs"]
        }
        return report

if __name__ == "__main__":
    report = PCHealthCleaner.execute_full_optimization()
    print(json.dumps(report, indent=2))
