# 🎨 SKILL ESPECIALIZADO: ARI UI/UX 3D DESIGN SYSTEM (IBELICK ADAPTED)

> **Inspiración:** `ibelick/ui-skills` (Julien Thibeaut) + ShopDigital 3D Neumorphism  
> **Asignado a:** Agente ARI (`SQUAD_FRONTEND_UX_UI`)  
> **Comandante Directa:** Luz 01  

---

## 💎 PRINCIPIOS DE DISEÑO & TOKENS VISUALES (REACT 19 + TAILWIND)

### 1. Frecuencia Caramelo (Modo Día Oficial):
- **Canvas:** `#cda488`
- **Placas & Tarjetas (`.neu-plate`):** `#faf8f5` (Hueso/Perla sólido) con borde y relieve inferior `border-[#855b3c] border-b-[8px] border-b-[#855b3c] rounded-[1.5rem]`.
- **Textos:** `#2d1e15` (Marrón profundo de alto contraste).

### 2. Frecuencia Interestelar (Modo Noche Oficial):
- **Canvas:** `#060d1a` / `#000000`
- **Placas & Tarjetas:** `bg-[#0f172a]/80 backdrop-blur-md border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)]`.
- **Textos:** `#ffffff` y `#e2e8f0`.

### 3. Física de Botones Táctiles (Micro-interacciones):
```css
/* Botón Primario Físico 3D */
.btn-3d-primary {
  @apply bg-gradient-to-b from-[#b58866] to-[#9c7151] text-white font-extrabold 
         border-[#855b3c] border-b-[4px] border-b-[#734b2f] rounded-2xl
         active:translate-y-[3px] active:border-b-[1px] transition-all;
}
```

### 4. Avatar Flotante de Asistencia (ARI):
- Siempre utilizar `/ari-avatar.png` o `/ari-pointing.png`.
- Diálogo explicativo cerrado por defecto (`showAri = false`).
- Burbuja flotante circular (12x12 / 16x16) con sombra pulsante `.ari-3d-shadow`.
