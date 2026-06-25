import { createRequire } from 'module';
import https from 'https';
import path from 'path';
import fs from 'fs';

const require = createRequire(import.meta.url);
const adminModule = require('firebase-admin');
const admin = adminModule.default || adminModule;

// ─────────────────────────────────────────────
// 1. FIREBASE ADMIN SDK (bypasea reglas de seguridad)
// ─────────────────────────────────────────────
const keyPath = path.resolve(process.cwd(), 'serviceAccountKey.json');
if (!fs.existsSync(keyPath)) {
    console.error("❌ No se encontró serviceAccountKey.json en la raíz del proyecto.");
    console.error("   Seguí las instrucciones en firebase_key_guide.md para obtenerla.");
    process.exit(1);
}
const serviceAccount = require(keyPath);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: "shopdigital-ee"
});
const db = admin.firestore();
console.log("✅ Firebase Admin SDK inicializado con Service Account.");

// ─────────────────────────────────────────────
// 2. LOCALIDADES
// ─────────────────────────────────────────────
const LOCALITIES = [
    { name: "Monte Grande",  slug: "monte-grande",  lat: -34.8272, lon: -58.4682, address_suffix: "Monte Grande" },
    { name: "Luis Guillón",  slug: "luis-guillon",  lat: -34.8112, lon: -58.4552, address_suffix: "Luis Guillón" },
    { name: "El Jagüel",     slug: "el-jaguel",     lat: -34.8452, lon: -58.4852, address_suffix: "El Jagüel"    },
];
const RADIO_M = 2500;

// ─────────────────────────────────────────────
// 3. CATEGORÍAS OSM → SHOPDIGITAL
// ─────────────────────────────────────────────
const CATEGORY_MAP = [
    {
        sdCategory: "pizzerias", sdName: "Pizzerías",
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
        sdCategory: "gastro", sdName: "Cafeterías y Panaderías",
        overpassQuery: (lat, lon, r) =>
            `(node["amenity"="cafe"](around:${r},${lat},${lon});` +
            `node["shop"="bakery"](around:${r},${lat},${lon}););`,
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
            `node["shop"="shoes"](around:${r},${lat},${lon}););`,
        img: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80",
        offerName: "Remera Estampada 100% Algodón", price: 13500,
        specialty: "Ropa de temporada para hombre, mujer y niños. Marcas nacionales.",
        schedule: "Lun-Sáb 9:30 - 19:30 · Dom Cerrado",
    },
    {
        sdCategory: "barber", sdName: "Barberías",
        overpassQuery: (lat, lon, r) =>
            `(node["shop"="hairdresser"]["male"="yes"](around:${r},${lat},${lon}););`,
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
        sdCategory: "gym", sdName: "Gimnasios",
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
            `(node["shop"="hardware"](around:${r},${lat},${lon}););`,
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
            `(node["shop"="beauty"](around:${r},${lat},${lon}););`,
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
            `(node["shop"="car_repair"](around:${r},${lat},${lon});` +
            `node["shop"="tyres"](around:${r},${lat},${lon}););`,
        img: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=600&q=80",
        offerName: "Service Completo: Aceite + Filtros + Revisión", price: 25000,
        specialty: "Lubricentro y taller mecánico, electricidad y diagnóstico computarizado.",
        schedule: "Lun-Sáb 8:00 - 18:00",
    },
    {
        sdCategory: "tech", sdName: "Tecnología y Celulares",
        overpassQuery: (lat, lon, r) =>
            `(node["shop"="mobile_phone"](around:${r},${lat},${lon});` +
            `node["shop"="electronics"](around:${r},${lat},${lon}););`,
        img: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600&q=80",
        offerName: "Reparación de Pantalla en 24hs", price: 22000,
        specialty: "Venta y reparación de celulares, tablets, notebooks y accesorios.",
        schedule: "Lun-Sáb 9:00 - 20:00",
    },
    {
        sdCategory: "farmacias", sdName: "Farmacias (droguerías)",
        overpassQuery: (lat, lon, r) =>
            `(node["shop"="chemist"](around:${r},${lat},${lon}););`,
        img: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=600&q=80",
        offerName: "Suplemento Vitamínico Mensual", price: 12000,
        specialty: "Productos de higiene, belleza, nutrición y medicamentos sin receta.",
        schedule: "Lun-Sáb 8:00 - 20:00",
    },
];

// ─────────────────────────────────────────────
// 4. HELPERS
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
                'User-Agent': 'ShopDigital-AdminSeeder/2.0 (shopdigital.tech)'
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

function slugify(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function buildShopDoc(osmNode, category, locality) {
    const tags = osmNode.tags || {};
    const rawName = tags.name || tags['name:es'] || null;
    if (!rawName) return null;

    const phone = tags.phone || tags['contact:phone'] || tags['contact:mobile'] || "1152668273";
    const website = tags.website || tags['contact:website'] || '';
    const instagram = tags['contact:instagram'] || '';

    const street = tags['addr:street'] || '';
    const housenumber = tags['addr:housenumber'] || '';
    const addressStr = (street && housenumber)
        ? `${street} ${housenumber}, ${locality.address_suffix}`
        : `${locality.address_suffix}, Provincia de Buenos Aires`;

    const id = `real-${slugify(rawName)}-${locality.slug}`;
    const slug = `${slugify(rawName)}-${locality.slug}`;
    const lat = osmNode.lat;
    const lon = osmNode.lon;
    const mapUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d300!2d${lon}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s!2s!5e0!3m2!1ses!2sar!4v${Date.now()}`;

    return {
        id, slug, name: rawName,
        category: category.sdCategory,
        specialty: category.specialty,
        entityType: 'merchant',
        zone: locality.name,
        address: addressStr,
        phone: phone.replace(/[\s\-+]/g, '').replace(/^54/, ''),
        ownerName: `Propietario de ${rawName}`,
        image: category.img,
        bannerImage: category.img,
        description: `Bienvenidos a **${rawName}**, uno de los comercios destacados de ${locality.name}. ${category.specialty} Encontranos en ${addressStr}. Presentá tu credencial VIP ShopDigital y accedé a beneficios exclusivos para socios.`,
        mapUrl, website, instagram, facebook: '', tiktok: '',
        rating: parseFloat((4.1 + Math.random() * 0.8).toFixed(1)),
        isActive: true,
        townId: 'esteban-echeverria',
        verified: true,
        visits: Math.floor(15 + Math.random() * 120),
        subscribers: Math.floor(3 + Math.random() * 40),
        schedule: category.schedule,
        osmId: osmNode.id, lat, lon,
        offers: [{
            id: `offer-real-${category.sdCategory}-${locality.slug}-1`,
            name: category.offerName,
            price: category.price,
            image: category.img,
            description: `Oferta exclusiva para socios VIP de ShopDigital. Presentá tu credencial digital y obtené este beneficio en ${rawName}.`
        }]
    };
}

function buildInvoice(shop, locality) {
    const now = new Date();
    const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const dueDate = new Date(now);
    dueDate.setDate(dueDate.getDate() + 30);
    return {
        id: `inv-real-${shop.id}-${period}`,
        shopId: shop.id, shopName: shop.name,
        townId: 'esteban-echeverria',
        locality: locality.name, category: shop.category,
        amount: 15000, status: 'pending', period,
        issueDate: now.toISOString(), dueDate: dueDate.toISOString(),
        concept: `Suscripción Mensual ShopDigital - ${now.toLocaleString('es-AR', { month: 'long', year: 'numeric' })}`,
        notes: 'Comercio real ingresado via Fase 3 de Clonación (Overpass API / OSM) — Admin SDK.'
    };
}

// ─────────────────────────────────────────────
// 5. MAIN
// ─────────────────────────────────────────────
async function seed() {
    console.log("\n🌍 ═══════════════════════════════════════════");
    console.log("🌍 FASE 3 DE CLONACIÓN · ESTEBAN ECHEVERRÍA");
    console.log("🌍 Admin SDK — Scraping Overpass + Siembra Firestore");
    console.log("🌍 ═══════════════════════════════════════════\n");

    let totalShops = 0, totalInvoices = 0, totalSkipped = 0;
    const seenIds = new Set();
    const batch = db.batch();
    let batchCount = 0;
    const MAX_BATCH = 400; // Firestore batch limit es 500

    async function commitBatch() {
        if (batchCount > 0) {
            await batch.commit();
            console.log(`   💾 Batch guardado: ${batchCount} operaciones`);
        }
    }

    for (const locality of LOCALITIES) {
        console.log(`\n📍 LOCALIDAD: ${locality.name.toUpperCase()}`);

        for (const category of CATEGORY_MAP) {
            const query = category.overpassQuery(locality.lat, locality.lon, RADIO_M);
            let result;
            try {
                result = await overpassQuery(query);
                await new Promise(r => setTimeout(r, 1000));
            } catch (err) {
                console.warn(`   ⚠️  Error OSM ${category.sdCategory}/${locality.name}: ${err.message.substring(0, 80)}`);
                continue;
            }

            const nodes = (result.elements || []).filter(e => e.type === 'node');
            console.log(`   📂 ${category.sdName}: ${nodes.length} resultados`);

            for (const node of nodes) {
                const shopDoc = buildShopDoc(node, category, locality);
                if (!shopDoc) { totalSkipped++; continue; }
                if (seenIds.has(shopDoc.id)) continue;
                seenIds.add(shopDoc.id);

                const shopRef = db.collection('comercios').doc(shopDoc.id);
                batch.set(shopRef, shopDoc, { merge: true });
                batchCount++;

                const invoice = buildInvoice(shopDoc, locality);
                const invRef = db.collection('facturas').doc(invoice.id);
                batch.set(invRef, invoice, { merge: true });
                batchCount++;
                totalShops++;
                totalInvoices++;

                console.log(`      ✨ ${shopDoc.name} · ${shopDoc.address}`);

                // Commit al llegar al límite del batch
                if (batchCount >= MAX_BATCH) {
                    await commitBatch();
                    batchCount = 0;
                }
            }
        }
    }

    // Commit final
    if (batchCount > 0) {
        await batch.commit();
        console.log(`\n   💾 Batch final guardado: ${batchCount} operaciones`);
    }

    // Cliente VIP demo
    const clientRef = db.collection('clientes').doc('cli-vip-demo-ee-fase3');
    await clientRef.set({
        id: "cli-vip-demo-ee-fase3",
        name: "María González",
        email: "maria.gonzalez@shopdigital.tech",
        vipCode: "VIP-EE-0001",
        townId: "esteban-echeverria",
        zone: "Monte Grande",
        status: "active", vipStatus: "active", role: "client-vip",
        balance: 1500, phone: "1155443322",
        createdAt: new Date().toISOString(),
    }, { merge: true });

    console.log("\n🎉 ═══════════════════════════════════════════");
    console.log(`🎉 FASE 3 COMPLETADA CON ÉXITO`);
    console.log(`🎉 ═══════════════════════════════════════════`);
    console.log(`   🏪 Comercios reales ingresados: ${totalShops}`);
    console.log(`   📄 Facturas creadas:             ${totalInvoices}`);
    console.log(`   ⏭️  Sin nombre (omitidos):       ${totalSkipped}`);
    console.log(`   👤 Cliente VIP demo:              1`);
    console.log(`\n   🌐 Ver en: https://shopdigital.tech/esteban-echeverria/home`);
    console.log("🎉 ═══════════════════════════════════════════\n");

    process.exit(0);
}

seed().catch(err => {
    console.error("❌ Error crítico:", err.message);
    process.exit(1);
});
