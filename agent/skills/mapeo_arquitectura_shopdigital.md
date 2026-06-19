# 🗺️ Mapa de Arquitectura Ecosistémica de ShopDigital
### Manual de Inducción Técnica para Agentes de Inteligencia Artificial (SNC Nivel 3)
**Destinatarios:** Eve, Lucy, Bruno, Gemy, Luz y nuevos agentes integrados.  
**Origen:** Búnker de Sistemas (Luz 01)

Este documento sirve como el **mapa de inducción técnica principal** para comprender la arquitectura fractal, los búnkeres operativos, las "cañerías" de datos (SNC) y las térmicas de control que sostienen la red **ShopDigital**.

---

## 1. El Hormiguero (La Red de Comercios)

El **Hormiguero** representa la red viva de comercios físicos y proveedores locales de ShopDigital.
* **Catálogos Inteligentes**: Cada comercio de la red posee una ficha digital interactiva que expone sus datos de contacto, geolocalización, enlaces a WhatsApp para pedidos y sus ofertas destacadas.
* **Rubros Locales**: Los comercios se agrupan en rubros predefinidos (Gastronomía, Indumentaria, Kiosco, Servicios, etc.) definidos en [types.ts](file:///C:/Users/walya/Downloads/shopdigital.ar---esteban-echeverría/types.ts).
* **Fidelización VIP**: Clientes locales pueden dar de alta su credencial VIP virtual (con código QR dinámico y segundero inviolable) para acumular puntos y descuentos.

---

## 2. Los Búnkeres (Paneles de Operación)

Los **Búnkeres** son paneles y pantallas web administrativas e independientes construidas con estética cyberpunk y neón que permiten controlar y supervisar la red:

* **DirectorBunkerPage.tsx (Búnker Waly - Dirección General)**: Centro de mando principal del Director General. Permite monitorear el estado global de todas las regiones, activar el "Modo Navidad", ver ingresos consolidados y aprobar directivas críticas del SNC.
* **SystemsBunkerPage.tsx (Búnker de Sistemas)**: Monitoreo técnico, configuración del servidor, inspección de dependencias y despliegues.
* **SecOpsBunkerPage.tsx (Búnker de Seguridad)**: Auditoría de accesos, logs de transacciones del POSNET, validación de credenciales de Embajadores y políticas criptográficas de tokens.
* **MarketingBunkerPage.tsx (Búnker de Publicidad)**: Control de los cañones de difusión, redacción de copys masivos y gestión de las colas de disparo de WhatsApp.
* **AccountingBunkerPage.tsx (Búnker de Contabilidad)**: Emisión de facturas por abono, control de recaudación, cuentas de tesorería y suspensión automática de cuentas.
* **HRBunkerPage.tsx (Búnker de Recursos Humanos)**: Admisión, agenda táctica de Embajadores y control de notas de campo del CRM.
* **PlanningBunkerPage.tsx (Búnker de Planificación)**: Monitoreo de expansión, siembra de datos de muestra y estimaciones de saturación comercial.
* **MaintenanceBunkerPage.tsx / InvestmentBunkerPage.tsx**: Control de servidores auxiliares y balances de comisiones.

---

## 3. Arquitectura Fractal Regional

ShopDigital se escala dinámicamente mediante **clonación fractal**, aislando la información territorial pero compartiendo las mismas cañerías e interfaces.

```
                  ┌──────────────────────┐
                  │   GlobalHomePage     │
                  └──────────┬───────────┘
                             │
            ┌────────────────┼────────────────┐
            ▼                ▼                ▼
     ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
     │ townId:     │  │ townId:     │  │ townId:     │
     │ ezeiza      │  │ esteban-    │  │ patagonia   │
     │             │  │ echeverria  │  │             │
     │ Color: Cyan │  │ Color:      │  │ Color:      │
     │             │  │ Violeta     │  │ Ámbar/Ocre  │
     └─────────────┘  └─────────────┘  └─────────────┘
```

* **Aislamiento por `townId`**: Todos los comercios, clientes y facturas están asociados de manera unívoca a una clave en minúsculas (ej: `ezeiza`, `esteban-echeverria`, `patagonia`). La base de datos Firebase restringe los feeds filtrando por este identificador en [firebase.ts](file:///C:/Users/walya/Downloads/shopdigital.ar---esteban-echeverría/firebase.ts).
* **Identidad Visual Fractal (Sello de Color)**: Cada provincia/zona tiene asignado un tono representativo (ej: `#CCA387` para el fondo uniforme de carga, violeta para Esteban Echeverría, cyan para Ezeiza) que adapta las pantallas administrativas al color correspondiente.
* **Siembra (Seed) de Tres Fases**:
  1. *Fase 1 (Cascarón)*: Réplica de la interfaz de frontend, rutas en `App.tsx` y empotrado de la IA Ari.
  2. *Fase 2 (Siembra Táctica)*: Purgado de datos anteriores e inyección de datos semilla hiperrealistas de muestra para demostraciones de embajadores.
  3. *Fase 3 (API Google / Producción)*: Barrido con la API de Google Maps/Places para inyectar locales físicos verificados y despliegue final.

---

## 4. Las Cañerías de Datos (SNC - Sistema Nervioso Central)

El **SNC 2.0** es el conjunto de conductos e integraciones que permiten que la información y las órdenes fluyan en tiempo real entre la nube, las planillas y la app.

* **onSnapshot Reactivo**: Los búnkeres escuchan a Firestore de manera reactiva y asíncrona. Si el Director aprueba una directiva, los paneles receptores emiten alarmas sonoras y visuales al instante.
* **REST API Endpoint (`/api/bunker/sync`)**: Escrito en [sync.ts](file:///C:/Users/walya/Downloads/shopdigital.ar---esteban-echeverría/api/bunker/sync.ts). Es una Serverless Function de alto rendimiento en Vercel que no usa el SDK de Firebase (para evitar cold starts lentos) sino llamadas HTTP REST nativas a Google Firestore, logrando respuestas de **50ms a 150ms**.
* **Integración Sheets (Google Apps Script)**: Los operadores y agentes pueden ingresar directivas rellenando una fila en la planilla de Google Sheets. El script de Apps Script (`UrlFetchApp`) empaqueta el contenido y realiza un POST seguro al API Endpoint.
* **Webhooks y Make.com**: Conecta los sistemas externos y webhooks de mensería (WhatsApp Business Cloud) con el procesador de IA.

---

## 5. Gestores y Tableros Maestros

La administración de las operaciones comerciales locales se divide en dos grandes interfaces y cuatro gestores especializados:

* **MasterPanelPage.tsx (Tablero Maestro B2C)**: Vista de comando para la red minorista. Permite inyectar comercios de muestra, suspender locales y derivar embajadores a campo.
* **EnterpriseMasterBoardPage.tsx (Tablero Maestro B2B Industrial)**: Panel de control de industrias mayoristas y logística de distribución B2B.

### Los 4 Gestores Autónomos (enlazados con la IA Ari)
Cada gestor local tiene embebida a Ari con un rol y prompt específico:
1. **Gestor de Comercios (Red Minorista)**: Ari actúa como asesora de ventas (`merchant`) analizando visitas y sugiriendo combos irresistibles.
2. **Gestor de Clientes (Red VIP)**: Ari actúa como analista CRM (`crm_manager`) sugiriendo tácticas de fidelización masiva.
3. **Gestor de Industrias (Nodo B2B)**: Ari actúa bajo el rol `industrial` emparejando comercios con proveedores.
4. **Gestor de Facturación (Protocolo Doberman)**: Ari actúa bajo el rol `financial` controlando las cuentas de abono locales.

---

## 6. Las Térmicas de Operación (Reglas de Control y Acción)

En ShopDigital, las reglas operativas y los disparadores se denominan **Térmicas**.

### A. Térmicas de Lanzamiento (Marketing)
En [AriMerchantAssistant.tsx](file:///C:/Users/walya/Downloads/shopdigital.ar---esteban-echeverría/components/AriMerchantAssistant.tsx), representan el arsenal publicitario de 7 landing pages listas para captar diferentes audiencias:
1. `LANDING NOSOTROS` (B2C) → Presentación institucional.
2. `LANDING UNIRSE` (B2B) → Captación de comercios y embajadores.
3. `LANDING DESCUBRIR` (B2C) → Catálogo interactivo de la zona.
4. `OFERTAS B2B RED` (B2B) → Ofertas mayoristas cruzadas entre locales.
5. `OFERTAS B2C VIP` (B2C) → Cupones flash para clientes locales.
6. `RECLUTAMIENTO PÚBLICO` (Captación) → Admisión inicial de Embajadores.
7. `DIRECTORIO INDUSTRIAL` (B2B Industrial) → Mayoristas y productores de la red.

### B. Térmicas Financieras (Cobros)
Representan las políticas automáticas del Protocolo Doberman:
* **Térmica Roja N°3**: Establece la suspensión automática y el bloqueo de catálogo para cualquier comercio que acumule **3 meses consecutivos de mora** (3 facturas en estado pendiente de cobro).

### C. Térmicas de Control (Seguridad del Director)
Establecidas en [gemini.ts](file:///C:/Users/walya/Downloads/shopdigital.ar---esteban-echeverría/services/gemini.ts):
* **Escudo de Dirección**: Acciones críticas como conmutar el Modo Navidad (`isChristmasMode`), apagar un búnker, o reescribir térmicas de control, exigen al Director ingresar el código de acción de dirección exacto: **`comunicacionazul01`**. Sin este token, Ari congela el flujo inmediatamente.
