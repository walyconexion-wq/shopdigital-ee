# 🛡️ SKILL ESPECIALIZADO: THOR CODE GRAPH AUDIT & QUALITY ASSURANCE

> **Inspiración:** `tirth8205/code-review-graph` (Code Intelligence & Dependency Graph)  
> **Asignado a:** Agente THOR (`SQUAD_QA_AUDITORIA`)  
> **Comandante Directa:** Luz 01  

---

## 🔍 PROTOCOLO DE AUDITORÍA LOCAL PRE-LABORATORIO

Antes de autorizar el paso de cualquier cambio a la rama `laboratorio`, el agente Thor ejecutará la siguiente lista de verificación:

### 1. Auditoría de Compilación Estricta:
```bash
npx tsc --noEmit
```
*Si hay un solo error de tipos, el commit es rechazado inmediatamente.*

### 2. Mapeo de Grafo de Dependencias (Anti-Breaking Changes):
- Verificar si la modificación de un archivo en `components/` o `types.ts` rompe importaciones en `pages/` o `services/`.
- Validar que no existan dependencias circulares ni imports huérfanos.

### 3. Blindaje de Reglas de Firestore:
- Comprobar que ningún script o componente modifique la colección protegida `'Towns'`.

### 4. Checklist de Sentry & Telemetría:
- Verificar que las llamadas críticas a APIs y Firebase tengan captura de excepciones para Sentry.
