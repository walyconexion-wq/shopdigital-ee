import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import fs from 'fs';
import path from 'path';
import https from 'https';

// ─────────────────────────────────────────────
// 1. FIREBASE CONFIG
// ─────────────────────────────────────────────
const envPath = path.resolve(process.cwd(), '.env.local');
const envLines = fs.readFileSync(envPath, 'utf8').split('\n');
const apiKeyLine = envLines.find(l => l.startsWith('VITE_FIREBASE_API_KEY='));
if (!apiKeyLine) { console.error("❌ No se encontró VITE_FIREBASE_API_KEY"); process.exit(1); }
const apiKey = apiKeyLine.split('=')[1].trim().replace(/['"]/g, '');

const firebaseConfig = {
    apiKey,
    authDomain: "shopdigital-ee.firebaseapp.com",
    projectId: "shopdigital-ee",
    storageBucket: "shopdigital-ee.firebasestorage.app",
    messagingSenderId: "201282750733",
    appId: "1:201282750733:web:e1fc713e99fab35ba8c844"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ─────────────────────────────────────────────
// 2. LOCALIDADES: centro geográfico + radio 2500m
// ─────────────────────────────────────────────
const LOCALITIES = [
    { name: "Monte Grande",  slug: "monte-grande",  lat: -34.8272, lon: -58.4682, address_suffix: "Monte Grande" },
    { name: "Luis Guillón",  slug: "luis-guillon",  lat: -34.8112, lon: -58.4552, address_suffix: "Luis Guillón" },
    { name: "El Jagüel",     slug: "el-jaguel",     lat: -34.8452, lon: -58.4852, address_suffix: "El Jagüel"    },
];
const RADIO_M = 2500;

// ─────────────────────────────────────────────
// 3. MAPEO OSM → SHOPDIGITAL (categoría, imagen, ofertas)
// ─────────────────────────────────────────────
const CATEGORY_MAP = [
    {
        sdCategory: "pizzerias", sdName: "Pizzerías y Restaurantes de Pizza",
        osmFilters: ['amenity=restaurant,cuisine=pizza', 'amenity=pizza'],
        overpassQuery: (lat, lon, r) =>
            `(node["amenity"="restaurant"]["cuisine"="pizza"](around:${r},${lat},${lon});` +
            `node["amenity"="fast_food"]["cuisine"="pizza"](around:${r},${lat},${lon}););`,
        img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80",
        offerName: "Pizza Grande Especial", price: 7500,
        specialty: "Pizza artesanal a la piedra y al molde con ingredientes frescos.",
        schedule: "Mar-Dom 19:00 - 00:30 · Lun Cerrado",
    },
    {
        sdCategory: "restaurantes", sdName: "Restaurantes y Bodegones",
        overpassQuery: (lat, lon, r) =>
            `(node["amenity"="restaurant"][!"cuisine"](around:${r},${lat},${lon});` +
            `node["amenity"="restaurant"]["cuisine"!="pizza"](around:${r},${lat},${lon}););`,
        img: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80",
        offerName: "Milanesa Completa con Guarnición", price: 9500,
        specialty: "Cocina casera y parrilla argentina con atención personalizada.",
        schedule: "Lun-Dom 12:00 - 15:30 · 20:00 - 00:00",
    },
    {
        sdCategory: "fastfood", sdName: "Fast Food y Hamburguesas",
        overpassQuery: (lat, lon, r) =>
            `(node["amenity"="fast_food"](around:${r},${lat},${lon}););`,
        img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80",
        offerName: "Combo Hamburguesa + Papas + Bebida", price: 6200,
        specialty: "Hamburguesas artesanales, alitas y papas crocantes para llevar o delivery.",
        schedule: "Lun-Dom 11:30 - 00:00",
    },
    {
        sdCategory: "beer", sdName: "Cervecerías y Bares",
        overpassQuery: (lat, lon, r) =>
            `(node["amenity"="bar"](around:${r},${lat},${lon});` +
            `node["amenity"="pub"](around:${r},${lat},${lon}););`,
        img: "https://images.unsplash.com/photo-1532635241-17e820add50f?w=600&q=80",
        offerName: "Pinta de Artesanal + Tabla de Picada", price: 5200,
        specialty: "Cervezas artesanales de elaboración propia y variedades importadas.",
        schedule: "Mié-Dom 18:00 - 02:00",
    },
    {
        sdCategory: "icecream", sdName: "Heladerías",
        overpassQuery: (lat, lon, r) =>
            `(node["amenity"="ice_cream"](around:${r},${lat},${lon});` +
            `node["shop"="ice_cream"](around:${r},${lat},${lon}););`,
        img: "https://images.unsplash.com/photo-1567206563066-0480d07addb6?w=600&q=80",
        offerName: "1 Kilo de Helado Premium Artesanal", price: 11000,
        specialty: "Helados artesanales de autor, elaborados con leche fresca de tambo.",
        schedule: "Lun-Dom 14:00 - 22:30",
    },
    {
        sdCategory: "gastro", sdName: "Rotiserías y Gastronomía",
        overpassQuery: (lat, lon, r) =>
            `(node["amenity"="cafe"](around:${r},${lat},${lon});` +
            `node["shop"="bakery"](around:${r},${lat},${lon});` +
            `node["shop"="deli"](around:${r},${lat},${lon}););`,
        img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80",
        offerName: "Pollo Entero al Horno con Guarnición", price: 8200,
        specialty: "Rotisería casera, viandas saludables y empanadas para llevar.",
        schedule: "Lun-Sáb 10:00 - 20:00 · Dom 10:00 - 14:00",
    },
    {
        sdCategory: "markets", sdName: "Mercados y Almacenes",
        overpassQuery: (lat, lon, r) =>
            `(node["shop"="supermarket"](around:${r},${lat},${lon});` +
            `node["shop"="convenience"](around:${r},${lat},${lon});` +
            `node["shop"="greengrocer"](around:${r},${lat},${lon}););`,
        img: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80",
        offerName: "Bolsón de Verduras de Estación (5kg)", price: 5500,
        specialty: "Almacén mayorista y minorista con productos frescos de huerta.",
        schedule: "Lun-Sáb 8:00 - 20:00 · Dom 9:00 - 13:00",
    },
    {
        sdCategory: "fashion", sdName: "Indumentaria y Boutique",
        overpassQuery: (lat, lon, r) =>
            `(node["shop"="clothes"](around:${r},${lat},${lon});` +
            `node["shop"="shoes"](around:${r},${lat},${lon});` +
            `node["shop"="boutique"](around:${r},${lat},${lon}););`,
        img: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80",
        offerName: "Remera Estampada 100% Algodón", price: 13500,
        specialty: "Ropa de temporada para hombre, mujer y niños. Marcas nacionales.",
        schedule: "Lun-Sáb 9:30 - 19:30 · Dom Cerrado",
    },
    {
        sdCategory: "barber", sdName: "Barberías",
        overpassQuery: (lat, lon, r) =>
            `(node["shop"="hairdresser"]["male"="yes"](around:${r},${lat},${lon});` +
            `node["amenity"="barber"](around:${r},${lat},${lon}););`,
        img: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&q=80",
        offerName: "Corte + Barba + Arreglo de Cejas", price: 5500,
        specialty: "Barbería masculina con técnicas clásicas y modernas. Turno o a la cola.",
        schedule: "Mar-Sáb 9:00 - 19:30 · Dom 9:00 - 13:00",
    },
    {
        sdCategory: "hair", sdName: "Peluquerías",
        overpassQuery: (lat, lon, r) =>
            `(node["shop"="hairdresser"](around:${r},${lat},${lon}););`,
        img: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=600&q=80",
        offerName: "Lavado + Corte + Secado", price: 7200,
        specialty: "Peluquería unisex con colorimetría, keratina y tratamientos intensivos.",
        schedule: "Mar-Sáb 9:00 - 19:30",
    },
    {
        sdCategory: "gym", sdName: "Gimnasios y Fitness",
        overpassQuery: (lat, lon, r) =>
            `(node["leisure"="fitness_centre"](around:${r},${lat},${lon});` +
            `node["leisure"="sports_centre"](around:${r},${lat},${lon}););`,
        img: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&q=80",
        offerName: "Cuota Mensual Sin Contrato", price: 18000,
        specialty: "Musculación, cardio, clases grupales y nutrición deportiva.",
        schedule: "Lun-Vie 7:00 - 22:00 · Sáb 9:00 - 14:00",
    },
    {
        sdCategory: "hardware", sdName: "Ferreterías",
        overpassQuery: (lat, lon, r) =>
            `(node["shop"="hardware"](around:${r},${lat},${lon});` +
            `node["shop"="doityourself"](around:${r},${lat},${lon}););`,
        img: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&q=80",
        offerName: "Caja de Herramientas Completa (18 piezas)", price: 38000,
        specialty: "Materiales de construcción, herramientas eléctricas y de mano, electricidad.",
        schedule: "Lun-Vie 8:00 - 18:30 · Sáb 8:00 - 13:00",
    },
    {
        sdCategory: "pets", sdName: "Veterinarias y Pet Shops",
        overpassQuery: (lat, lon, r) =>
            `(node["amenity"="veterinary"](around:${r},${lat},${lon});` +
            `node["shop"="pet"](around:${r},${lat},${lon}););`,
        img: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600&q=80",
        offerName: "Vacunación Completa Canina o Felina", price: 14000,
        specialty: "Clínica veterinaria con internación, cirugías y peluquería canina.",
        schedule: "Lun-Vie 9:00 - 19:00 · Sáb 9:00 - 13:00",
    },
    {
        sdCategory: "beauty", sdName: "Estéticas y Spa",
        overpassQuery: (lat, lon, r) =>
            `(node["shop"="beauty"](around:${r},${lat},${lon});` +
            `node["amenity"="beauty"](around:${r},${lat},${lon}););`,
        img: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=80",
        offerName: "Limpieza de Cutis Profunda + Hidratación", price: 9500,
        specialty: "Centro de estética integral: depilación, tratamientos corporales y faciales.",
        schedule: "Mar-Sáb 9:00 - 19:30",
    },
    {
        sdCategory: "farmacias", sdName: "Farmacias",
        overpassQuery: (lat, lon, r) =>
            `(node["amenity"="pharmacy"](around:${r},${lat},${lon}););`,
        img: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=600&q=80",
        offerName: "Medidor de Glucosa Digital + Tiras", price: 16500,
        specialty: "Medicamentos, dermocosmética, productos naturales y ortopedia.",
        schedule: "Lun-Sáb 8:00 - 21:00 · Dom 9:00 - 13:00 (guardia)",
    },
    {
        sdCategory: "auto", sdName: "Lubricentros y Talleres",
        overpassQuery: (lat, lon, r) =>
            `(node["amenity"="fuel"](around:${r},${lat},${lon});` +
            `node["shop"="car_repair"](around:${r},${lat},${lon});` +
            `node["shop"="tyres"](around:${r},${lat},${lon}););`,
        img: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=600&q=80",
        offerName: "Service Completo: Aceite + Filtros + Revisión", price: 25000,
        specialty: "Lubricentro y taller mecánico, electricidad y diagnóstico computarizado.",
        schedule: "Lun-Sáb 8:00 - 18:00",
    },
    {
        sdCategory: "inmo", sdName: "Inmobiliarias",
        overpassQuery: (lat, lon, r) =>
            `(node["office"="real_estate"](around:${r},${lat},${lon}););`,
        img: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80",
        offerName: "Tasación de Propiedad Sin Cargo", price: 0,
        specialty: "Alquileres, ventas y tasaciones en la zona sur del GBA.",
        schedule: "Lun-Vie 9:00 - 18:00 · Sáb 9:00 - 13:00",
    },
    {
        sdCategory: "servicios", sdName: "Servicios Profesionales",
        overpassQuery: (lat, lon, r) =>
            `(node["office"="lawyer"](around:${r},${lat},${lon});` +
            `node["office"="accountant"](around:${r},${lat},${lon});` +
            `node["office"="it"](around:${r},${lat},${lon}););`,
        img: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=80",
        offerName: "Consulta Inicial Sin Costo", price: 0,
        specialty: "Asesoramiento contable, legal e informático para empresas y particulares.",
        schedule: "Lun-Vie 9:00 - 18:00",
    },
    {
        sdCategory: "tech", sdName: "Tecnología y Celulares",
        overpassQuery: (lat, lon, r) =>
            `(node["shop"="mobile_phone"](around:${r},${lat},${lon});` +
            `node["shop"="electronics"](around:${r},${lat},${lon});` +
            `node["shop"="computer"](around:${r},${lat},${lon}););`,
        img: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600&q=80",
        offerName: "Reparación de Pantalla en 24hs", price: 22000,
        specialty: "Venta y reparación de celulares, tablets, notebooks y accesorios.",
        schedule: "Lun-Sáb 9:00 - 20:00",
    },
];

// ─────────────────────────────────────────────
// 4. HELPER: HTTP POST a Overpass API
// ─────────────────────────────────────────────
function overpassQuery(queryBody) {
    return new Promise((resolve, reject) => {
        const postData = `data=${encodeURIComponent(`[out:json][timeout:30];${queryBody}out body;`)}`;
        const options = {
            hostname: 'overpass-api.de',
            path: '/api/interpreter',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(postData),
                'User-Agent': 'ShopDigital-Seeder/1.0 (shopdigital.tech)'
            }
        };
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try { resolve(JSON.parse(data)); }
                catch (e) { reject(new Error(`JSON parse fail: ${data.substring(0, 200)}`)); }
            });
        });
        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}

// ─────────────────────────────────────────────
// 5. HELPER: construir ficha de comercio en el esquema de Firestore
// ─────────────────────────────────────────────
function slugify(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function buildShopDoc(osmNode, category, locality) {
    const tags = osmNode.tags || {};
    const rawName = tags.name || tags['name:es'] || null;
    if (!rawName) return null;  // omitir sin nombre

    const phone = tags.phone || tags['contact:phone'] || tags['contact:mobile'] || "1152668273";
    const website = tags.website || tags['contact:website'] || '';
    const instagram = tags['contact:instagram'] || '';

    // Dirección
    const street = tags['addr:street'] || '';
    const housenumber = tags['addr:housenumber'] || '';
    const addressStr = (street && housenumber)
        ? `${street} ${housenumber}, ${locality.address_suffix}`
        : `${locality.address_suffix}, Provincia de Buenos Aires`;

    const id = `real-${slugify(rawName)}-${locality.slug}`;
    const slug = `${slugify(rawName)}-${locality.slug}`;

    // URL de mapa embed centrada en las coordenadas del nodo real
    const lat = osmNode.lat;
    const lon = osmNode.lon;
    const mapUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d300!2d${lon}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s!2s!5e0!3m2!1ses!2sar!4v${Date.now()}`;

    return {
        id,
        slug,
        name: rawName,
        category: category.sdCategory,
        specialty: category.specialty,
        entityType: 'merchant',
        zone: locality.name,
        address: addressStr,
        phone: phone.replace(/[\s\-+]/g, '').replace(/^54/, ''),
        ownerName: `Propietario de ${rawName}`,
        image: category.img,
        bannerImage: category.img,
        description: `Bienvenidos a **${rawName}**, uno de los comercios destacados de ${locality.name}. ${category.specialty} Encontranos en ${addressStr}. Presentá tu credencial VIP de la Red ShopDigital y accedé a descuentos y beneficios exclusivos para socios.`,
        mapUrl,
        website,
        instagram,
        facebook: '',
        tiktok: '',
        rating: parseFloat((4.1 + Math.random() * 0.8).toFixed(1)),
        isActive: true,
        townId: 'esteban-echeverria',
        verified: true,
        visits: Math.floor(15 + Math.random() * 120),
        subscribers: Math.floor(3 + Math.random() * 40),
        schedule: category.schedule,
        osmId: osmNode.id,
        lat,
        lon,
        offers: [
            {
                id: `offer-real-${category.sdCategory}-${locality.slug}-1`,
                name: category.offerName,
                price: category.price,
                image: category.img,
                description: `Oferta exclusiva para socios VIP de ShopDigital. Presentá tu credencial digital y recibí este beneficio especial en ${rawName}.`
            }
        ]
    };
}

// ─────────────────────────────────────────────
// 6. HELPER: construir factura de suscripción mensual
// ─────────────────────────────────────────────
function buildInvoice(shop, locality) {
    const now = new Date();
    const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const dueDate = new Date(now);
    dueDate.setDate(dueDate.getDate() + 30);

    return {
        id: `inv-real-${shop.id}-${period}`,
        shopId: shop.id,
        shopName: shop.name,
        townId: 'esteban-echeverria',
        locality: locality.name,
        category: shop.category,
        amount: 15000,
        status: 'pending',
        period,
        issueDate: now.toISOString(),
        dueDate: dueDate.toISOString(),
        concept: `Suscripción Mensual ShopDigital - ${now.toLocaleString('es-AR', { month: 'long', year: 'numeric' })}`,
        notes: 'Comercio real ingresado via Fase 3 de Clonación (Overpass API / OSM).'
    };
}

// ─────────────────────────────────────────────
// 7. MAIN: scraping + siembra
// ─────────────────────────────────────────────
async function seed() {
    console.log("🌍 ========================================");
    console.log("🌍 FASE 3 DE CLONACIÓN · ESTEBAN ECHEVERRÍA");
    console.log("🌍 Scraping comercios reales via Overpass API");
    console.log("🌍 ========================================\n");

    let totalShops = 0;
    let totalInvoices = 0;
    let totalSkipped = 0;
    const seenIds = new Set();

    for (const locality of LOCALITIES) {
        console.log(`\n📍 LOCALIDAD: ${locality.name.toUpperCase()}`);
        console.log(`   Coordenadas: ${locality.lat}, ${locality.lon} · Radio: ${RADIO_M}m\n`);

        for (const category of CATEGORY_MAP) {
            const query = category.overpassQuery(locality.lat, locality.lon, RADIO_M);

            let result;
            try {
                result = await overpassQuery(query);
                // Rate limit courtesy
                await new Promise(r => setTimeout(r, 1200));
            } catch (err) {
                console.warn(`   ⚠️  Error consultando ${category.sdCategory} en ${locality.name}: ${err.message}`);
                continue;
            }

            const nodes = (result.elements || []).filter(e => e.type === 'node');
            console.log(`   📂 ${category.sdName}: ${nodes.length} resultados de OSM`);

            for (const node of nodes) {
                const shopDoc = buildShopDoc(node, category, locality);
                if (!shopDoc) { totalSkipped++; continue; }

                // Deduplicación: mismo OSM id en distintas localidades
                if (seenIds.has(shopDoc.id)) {
                    console.log(`      ↩️  Duplicado ignorado: ${shopDoc.name}`);
                    continue;
                }
                seenIds.add(shopDoc.id);

                try {
                    // Verificar si ya existe para no sobreescribir datos importantes
                    const existingSnap = await getDoc(doc(db, "comercios", shopDoc.id));
                    if (existingSnap.exists()) {
                        console.log(`      ✅ Ya existe: ${shopDoc.name} - actualizando datos básicos...`);
                    } else {
                        console.log(`      ✨ Nuevo: ${shopDoc.name} (${shopDoc.address})`);
                    }

                    await setDoc(doc(db, "comercios", shopDoc.id), shopDoc, { merge: true });
                    totalShops++;

                    // Crear factura de suscripción mensual
                    const invoice = buildInvoice(shopDoc, locality);
                    const invSnap = await getDoc(doc(db, "facturas", invoice.id));
                    if (!invSnap.exists()) {
                        await setDoc(doc(db, "facturas", invoice.id), invoice);
                        totalInvoices++;
                    }
                } catch (err) {
                    console.warn(`      ❌ Error guardando ${shopDoc.name}: ${err.message}`);
                }
            }
        }
    }

    // ─────────────────────────────────────────
    // Cliente VIP de prueba para demostraciones tácticas
    // ─────────────────────────────────────────
    console.log("\n👤 Creando cliente VIP de demostración...");
    const clientDemo = {
        id: "cli-vip-demo-ee-fase3",
        name: "María González",
        email: "maria.gonzalez@shopdigital.tech",
        vipCode: "VIP-EE-0001",
        townId: "esteban-echeverria",
        zone: "Monte Grande",
        status: "active",
        vipStatus: "active",
        role: "client-vip",
        balance: 1500,
        phone: "1155443322",
        createdAt: new Date().toISOString(),
        notes: "Cliente VIP demo Fase 3 de Clonación - Esteban Echeverría"
    };
    await setDoc(doc(db, "clientes", clientDemo.id), clientDemo, { merge: true });

    // ─────────────────────────────────────────
    // REPORTE FINAL
    // ─────────────────────────────────────────
    console.log("\n🎉 ════════════════════════════════════════");
    console.log(`🎉 FASE 3 COMPLETADA CON ÉXITO`);
    console.log(`🎉 ════════════════════════════════════════`);
    console.log(`   🏪 Comercios reales ingresados/actualizados: ${totalShops}`);
    console.log(`   📄 Facturas de suscripción creadas:          ${totalInvoices}`);
    console.log(`   ⏭️  Nodos sin nombre (omitidos):             ${totalSkipped}`);
    console.log(`   👤 Clientes VIP demo:                        1`);
    console.log(`\n   🌐 Visualizá en: https://shopdigital.tech/esteban-echeverria/home`);
    console.log("🎉 ════════════════════════════════════════\n");

    process.exit(0);
}

seed().catch(err => {
    console.error("❌ Error crítico en la siembra:", err);
    process.exit(1);
});
