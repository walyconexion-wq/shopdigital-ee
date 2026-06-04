# Guía Maestra de Clonación y Purificación de ADN Zonal (ShopDigital) 🧬🛡️🚀

Esta guía establece el protocolo operativo obligatorio para la clonación de nuevas regiones, zonas o localidades en la plataforma ShopDigital. Su objetivo es garantizar la **independencia absoluta (estanqueidad)** y evitar la mezcla de datos o interferencias visuales entre zonas.

---

## 🧠 Principio de Estanqueidad Zonal

> **"Cada nueva zona clonada debe ser un compartimento estanco: auto-suficiente, aislado a nivel de datos en base de datos, almacenamiento en la nube y visualmente blindado."**

---

## 1. Data Isolation (Aislamiento de Datos) 📥

Cuando se consulta o escribe información de comercios, clientes, ofertas, facturas o relevamientos, **siempre** se debe filtrar por el identificador de la zona activa (`townId`).

### Checklist de Código:
* **Consultas de Firebase (Subscriptions / Queries):**
  Toda consulta síncrona o reactiva debe incluir la restricción de zona. 
  *Ejemplo correcto en `firebase.ts`:*
  ```typescript
  // Siempre filtrar usando where("townId", "==", townId)
  const q = query(collection(db, "comercios"), where("townId", "==", townId));
  ```
  *Evitar:* Consultar la colección completa (`collection(db, "comercios")`) y filtrar en memoria, ya que esto incrementa la cuota de lectura drásticamente y mezcla información si hay fallos lógicos.

* **Escrituras y Modificaciones (Writes):**
  Cada inserción de documento debe inyectar la propiedad `townId` de forma mandatoria.
  ```typescript
  const finalData = { ...comercioData, townId: townId };
  await setDoc(doc(db, "comercios", id), finalData);
  ```

---

## 2. Visual Isolation (Aislamiento Visual) 🎨

Los Tableros Maestros de Gestión, Búnkers Administrativos y herramientas de Embajadores deben mantener una interfaz con estética de "cuarto de control" cyberpunk (alta visibilidad, fondo oscuro de ciberseguridad), inmune al Modo Día/Noche activado por el cliente en la Interfaz 1.

### Reglas de Estilos:
1. **Desacoplar en `Layout.tsx`:**
   Evitar que la clase CSS `.day-mode` se propague a las vistas de administración.
   Utilizar la variable `shouldApplyDayMode = isDayMode && !isManagementPage`.
2. **Uso de Clases Locales Protegidas:**
   En los CSS de los componentes de gestión, encapsular los selectores de texto blanco usando `.master-panel-container` o `.bunker-container` para evitar que reglas globales de modo claro inviertan los colores:
   ```css
   .master-panel-container .text-white {
       color: #ffffff !important;
   }
   ```
3. **Alto Contraste Neon Fijo:**
   Cada panel de gestión debe tener sus colores de acento fijos y legibles (violeta para Director, ámbar para Administración, rojo para Contaduría, etc.) con sus brillos (`drop-shadow` / `text-shadow`) inmutables.

---

## 3. Storage Scoped (Aislamiento de Archivos) ☁️

Cualquier archivo multimedia (fotos de comercios, logos de zona, capturas de credenciales VIP) que se suba en una zona debe almacenarse en rutas específicas dentro de Firebase Storage.

### Estructura de Carpetas en Storage:
* **Comercios / B2B:** `/zonas/{townId}/comercios/{shopId}/`
* **Clientes / Perfiles VIP:** `/zonas/{townId}/clientes/{clientId}/`
* **Branding / Configuración:** `/zonas/{townId}/assets/`

---

## 4. Checklist Paso a Paso para la Clonación de una Zona 📋

1. **Forjar ID de Zona:**
   Definir un identificador único en minúsculas y separado por guiones (ej: `lomas-de-zamora`, `mina-clavero`).
2. **Definir Metadatos de Localidad:**
   Registrar las sub-localidades y el color de identidad en `App.tsx` y en el semillero correspondiente.
3. **Inicializar appConfig en Firestore:**
   Crear el documento `appConfig/{townId}` con el título de zona, subtítulo y rubros activos (24 estándar o personalizados).
4. **Sembrar Ecosistema Inicial:**
   Ejecutar la siembra hiperrealista de muestras (comercios, socio VIP cero e industrias B2B de muestra) para poblar y testear la zona de forma aislada.
5. **Verificar Compilación de Producción:**
   Correr `npm run build` para asegurar el tipo estricto de las rutas nuevas.
