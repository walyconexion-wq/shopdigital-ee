/* eslint-disable @typescript-eslint/no-var-requires */
'use strict';

const {
    initializeApp,
    cert,
} = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const https = require('https');
const path  = require('path');
const fs    = require('fs');

// ─────────────────────────────────────────────
// 1. FIREBASE ADMIN SDK
// ─────────────────────────────────────────────
const keyPath = path.resolve(process.cwd(), 'serviceAccountKey.json');
if (!fs.existsSync(keyPath)) {
    console.error('❌  No se encontró serviceAccountKey.json');
    process.exit(1);
}

initializeApp({ credential: cert(require(keyPath)) });
const db = getFirestore();
console.log('✅  Firebase Admin SDK inicializado.');

// ─────────────────────────────────────────────
// 2. LOCALIDADES
// ─────────────────────────────────────────────
const LOCALITIES = [
    { name: 'Monte Grande', slug: 'monte-grande', lat: -34.8272, lon: -58.4682, suffix: 'Monte Grande' },
    { name: 'Luis Guillón', slug: 'luis-guillon', lat: -34.8112, lon: -58.4552, suffix: 'Luis Guillón' },
    { name: 'El Jagüel',    slug: 'el-jaguel',    lat: -34.8452, lon: -58.4852, suffix: 'El Jagüel'    },
];
const RADIO_M = 2500;

// ─────────────────────────────────────────────
// 3. CATEGORÍAS
// ─────────────────────────────────────────────
const CATEGORIES = [
    {
        id: 'pizzerias', name: 'Pizzerías',
        query: (lat, lon, r) =>
            `(node["amenity"="restaurant"]["cuisine"="pizza"](around:${r},${lat},${lon});` +
            `node["amenity"="fast_food"]["cuisine"="pizza"](around:${r},${lat},${lon}););`,
        img:      'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80',
        offer:    'Pizza Grande Especial', price: 7500,
        specialty:'Pizza artesanal a la piedra y al molde con ingredientes frescos.',
        schedule: 'Mar-Dom 19:00 - 00:30 · Lun Cerrado',
    },
    {
        id: 'restaurantes', name: 'Restaurantes y Bodegones',
        query: (lat, lon, r) =>
            `(node["amenity"="restaurant"]["cuisine"!="pizza"](around:${r},${lat},${lon});` +
            `node["amenity"="restaurant"][!"cuisine"](around:${r},${lat},${lon}););`,
        img:      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80',
        offer:    'Milanesa Completa con Guarnición', price: 9500,
        specialty:'Cocina casera y parrilla argentina con atención personalizada.',
        schedule: 'Lun-Dom 12:00-15:30 · 20:00-00:00',
    },
    {
        id: 'fastfood', name: 'Fast Food y Hamburguesas',
        query: (lat, lon, r) =>
            `(node["amenity"="fast_food"][!"cuisine"](around:${r},${lat},${lon});` +
            `node["amenity"="fast_food"]["cuisine"!="pizza"](around:${r},${lat},${lon}););`,
        img:      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80',
        offer:    'Combo Hamburguesa + Papas + Bebida', price: 6200,
        specialty:'Hamburguesas artesanales, alitas y papas crocantes para llevar o delivery.',
        schedule: 'Lun-Dom 11:30 - 00:00',
    },
    {
        id: 'beer', name: 'Cervecerías y Bares',
        query: (lat, lon, r) =>
            `(node["amenity"="bar"](around:${r},${lat},${lon});` +
            `node["amenity"="pub"](around:${r},${lat},${lon}););`,
        img:      'https://images.unsplash.com/photo-1532635241-17e820add50f?w=600&q=80',
        offer:    'Pinta de Artesanal + Tabla de Picada', price: 5200,
        specialty:'Cervezas artesanales de elaboración propia y variedades importadas.',
        schedule: 'Mié-Dom 18:00 - 02:00',
    },
    {
        id: 'icecream', name: 'Heladerías',
        query: (lat, lon, r) =>
            `(node["amenity"="ice_cream"](around:${r},${lat},${lon});` +
            `node["shop"="ice_cream"](around:${r},${lat},${lon}););`,
        img:      'https://images.unsplash.com/photo-1567206563066-0480d07addb6?w=600&q=80',
        offer:    '1 Kilo de Helado Premium Artesanal', price: 11000,
        specialty:'Helados artesanales de autor, elaborados con leche fresca de tambo.',
        schedule: 'Lun-Dom 14:00 - 22:30',
    },
    {
        id: 'gastro', name: 'Cafeterías y Panaderías',
        query: (lat, lon, r) =>
            `(node["amenity"="cafe"](around:${r},${lat},${lon});` +
            `node["shop"="bakery"](around:${r},${lat},${lon}););`,
        img:      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80',
        offer:    'Pollo Entero al Horno con Guarnición', price: 8200,
        specialty:'Rotisería casera, viandas saludables y empanadas para llevar.',
        schedule: 'Lun-Sáb 10:00-20:00 · Dom 10:00-14:00',
    },
    {
        id: 'markets', name: 'Mercados y Almacenes',
        query: (lat, lon, r) =>
            `(node["shop"="supermarket"](around:${r},${lat},${lon});` +
            `node["shop"="convenience"](around:${r},${lat},${lon});` +
            `node["shop"="greengrocer"](around:${r},${lat},${lon}););`,
        img:      'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80',
        offer:    'Bolsón de Verduras de Estación (5kg)', price: 5500,
        specialty:'Almacén mayorista y minorista con productos frescos de huerta.',
        schedule: 'Lun-Sáb 8:00-20:00 · Dom 9:00-13:00',
    },
    {
        id: 'fashion', name: 'Indumentaria y Boutique',
        query: (lat, lon, r) =>
            `(node["shop"="clothes"](around:${r},${lat},${lon});` +
            `node["shop"="shoes"](around:${r},${lat},${lon}););`,
        img:      'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80',
        offer:    'Remera Estampada 100% Algodón', price: 13500,
        specialty:'Ropa de temporada para hombre, mujer y niños. Marcas nacionales.',
        schedule: 'Lun-Sáb 9:30-19:30 · Dom Cerrado',
    },
    {
        id: 'hair', name: 'Peluquerías',
        query: (lat, lon, r) =>
            `(node["shop"="hairdresser"](around:${r},${lat},${lon}););`,
        img:      'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=600&q=80',
        offer:    'Lavado + Corte + Secado', price: 7200,
        specialty:'Peluquería unisex con colorimetría, keratina y tratamientos intensivos.',
        schedule: 'Mar-Sáb 9:00-19:30',
    },
    {
        id: 'gym', name: 'Gimnasios',
        query: (lat, lon, r) =>
            `(node["leisure"="fitness_centre"](around:${r},${lat},${lon});` +
            `node["leisure"="sports_centre"](around:${r},${lat},${lon}););`,
        img:      'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&q=80',
        offer:    'Cuota Mensual Sin Contrato', price: 18000,
        specialty:'Musculación, cardio, clases grupales y nutrición deportiva.',
        schedule: 'Lun-Vie 7:00-22:00 · Sáb 9:00-14:00',
    },
    {
        id: 'hardware', name: 'Ferreterías',
        query: (lat, lon, r) =>
            `(node["shop"="hardware"](around:${r},${lat},${lon}););`,
        img:      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&q=80',
        offer:    'Caja de Herramientas Completa (18 piezas)', price: 38000,
        specialty:'Materiales de construcción, herramientas eléctricas y de mano, electricidad.',
        schedule: 'Lun-Vie 8:00-18:30 · Sáb 8:00-13:00',
    },
    {
        id: 'pets', name: 'Veterinarias y Pet Shops',
        query: (lat, lon, r) =>
            `(node["amenity"="veterinary"](around:${r},${lat},${lon});` +
            `node["shop"="pet"](around:${r},${lat},${lon}););`,
        img:      'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600&q=80',
        offer:    'Vacunación Completa Canina o Felina', price: 14000,
        specialty:'Clínica veterinaria con internación, cirugías y peluquería canina.',
        schedule: 'Lun-Vie 9:00-19:00 · Sáb 9:00-13:00',
    },
    {
        id: 'beauty', name: 'Estéticas y Spa',
        query: (lat, lon, r) =>
            `(node["shop"="beauty"](around:${r},${lat},${lon}););`,
        img:      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=80',
        offer:    'Limpieza de Cutis Profunda + Hidratación', price: 9500,
        specialty:'Centro de estética integral: depilación, tratamientos corporales y faciales.',
        schedule: 'Mar-Sáb 9:00-19:30',
    },
    {
        id: 'farmacias', name: 'Farmacias',
        query: (lat, lon, r) =>
            `(node["amenity"="pharmacy"](around:${r},${lat},${lon}););`,
        img:      'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=600&q=80',
        offer:    'Medidor de Glucosa Digital + Tiras', price: 16500,
        specialty:'Medicamentos, dermocosmética, productos naturales y ortopedia.',
        schedule: 'Lun-Sáb 8:00-21:00 · Dom 9:00-13:00 (guardia)',
    },
    {
        id: 'auto', name: 'Lubricentros y Talleres',
        query: (lat, lon, r) =>
            `(node["shop"="car_repair"](around:${r},${lat},${lon});` +
            `node["shop"="tyres"](around:${r},${lat},${lon}););`,
        img:      'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=600&q=80',
        offer:    'Service Completo: Aceite + Filtros + Revisión', price: 25000,
        specialty:'Lubricentro y taller mecánico, electricidad y diagnóstico computarizado.',
        schedule: 'Lun-Sáb 8:00-18:00',
    },
    {
        id: 'tech', name: 'Tecnología y Celulares',
        query: (lat, lon, r) =>
            `(node["shop"="mobile_phone"](around:${r},${lat},${lon});` +
            `node["shop"="electronics"](around:${r},${lat},${lon}););`,
        img:      'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600&q=80',
        offer:    'Reparación de Pantalla en 24hs', price: 22000,
        specialty:'Venta y reparación de celulares, tablets, notebooks y accesorios.',
        schedule: 'Lun-Sáb 9:00-20:00',
    },
];

// ─────────────────────────────────────────────
// 4. HELPERS
// ─────────────────────────────────────────────
function overpassFetch(queryBody) {
    return new Promise((resolve, reject) => {
        const data = `data=${encodeURIComponent(`[out:json][timeout:25];${queryBody}out body;`)}`;
        const opts = {
            hostname: 'overpass-api.de',
            path: '/api/interpreter',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(data),
                'User-Agent': 'ShopDigital-Fase3/2.0 (shopdigital.tech)',
            },
        };
        const req = https.request(opts, (res) => {
            let raw = '';
            res.on('data', c => raw += c);
            res.on('end', () => {
                try { resolve(JSON.parse(raw)); }
                catch { reject(new Error('JSON parse error: ' + raw.substring(0, 120))); }
            });
        });
        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

function slugify(s) {
    return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function buildShop(node, cat, loc) {
    const t = node.tags || {};
    const name = t.name || t['name:es'];
    if (!name) return null;

    const street = t['addr:street'] || '';
    const num    = t['addr:housenumber'] || '';
    const addr   = (street && num)
        ? `${street} ${num}, ${loc.suffix}`
        : `${loc.suffix}, Provincia de Buenos Aires`;

    const id   = `real-${slugify(name)}-${loc.slug}`;
    const slug = `${slugify(name)}-${loc.slug}`;

    return {
        id, slug, name,
        category: cat.id,
        specialty: cat.specialty,
        entityType: 'merchant',
        zone: loc.name,
        address: addr,
        phone: (t.phone || t['contact:phone'] || '1152668273').replace(/[\s\-+]/g, '').replace(/^54/, ''),
        ownerName: `Propietario de ${name}`,
        image: cat.img,
        bannerImage: cat.img,
        description: `Bienvenidos a **${name}**, uno de los comercios destacados de ${loc.name}. ${cat.specialty} Encontranos en ${addr}. Presentá tu credencial VIP ShopDigital y accedé a beneficios exclusivos para socios.`,
        mapUrl: `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d300!2d${node.lon}!3d${node.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s!2s!5e0!3m2!1ses!2sar`,
        website: t.website || t['contact:website'] || '',
        instagram: t['contact:instagram'] || '',
        facebook: '', tiktok: '',
        rating: parseFloat((4.1 + Math.random() * 0.8).toFixed(1)),
        isActive: true,
        townId: 'esteban-echeverria',
        verified: true,
        visits: Math.floor(15 + Math.random() * 120),
        subscribers: Math.floor(3 + Math.random() * 40),
        schedule: cat.schedule,
        osmId: node.id,
        lat: node.lat,
        lon: node.lon,
        offers: [{
            id: `offer-${cat.id}-${loc.slug}`,
            name: cat.offer,
            price: cat.price,
            image: cat.img,
            description: `Oferta exclusiva para socios VIP ShopDigital en ${name}. Presentá tu credencial digital y obtené este beneficio especial.`,
        }],
    };
}

function buildInvoice(shop, loc) {
    const now    = new Date();
    const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const due    = new Date(now); due.setDate(due.getDate() + 30);
    return {
        id: `inv-${shop.id}-${period}`,
        shopId: shop.id, shopName: shop.name,
        townId: 'esteban-echeverria', locality: loc.name, category: shop.category,
        amount: 15000, status: 'pending', period,
        issueDate: now.toISOString(), dueDate: due.toISOString(),
        concept: `Suscripción Mensual ShopDigital - ${now.toLocaleString('es-AR', { month: 'long', year: 'numeric' })}`,
        notes: 'Fase 3 de Clonación · Overpass API / OSM · Admin SDK',
    };
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ─────────────────────────────────────────────
// 5. MAIN
// ─────────────────────────────────────────────
async function seed() {
    console.log('\n🌍 ══════════════════════════════════════════════');
    console.log('🌍  FASE 3 DE CLONACIÓN · ESTEBAN ECHEVERRÍA');
    console.log('🌍  Overpass OSM → Firebase Firestore (Admin SDK)');
    console.log('🌍 ══════════════════════════════════════════════\n');

    let shops = 0, invoices = 0, skipped = 0;
    const seen = new Set();
    const ops  = [];   // acumular docs para escribir en batch

    for (const loc of LOCALITIES) {
        console.log(`\n📍  ${loc.name.toUpperCase()}`);

        for (const cat of CATEGORIES) {
            let result;
            try {
                result = await overpassFetch(cat.query(loc.lat, loc.lon, RADIO_M));
                await sleep(1100);
            } catch (e) {
                console.warn(`   ⚠️  OSM error [${cat.name}]: ${e.message.substring(0, 80)}`);
                continue;
            }

            const nodes = (result.elements || []).filter(n => n.type === 'node');
            console.log(`   📂  ${cat.name}: ${nodes.length} resultados`);

            for (const node of nodes) {
                const shop = buildShop(node, cat, loc);
                if (!shop) { skipped++; continue; }
                if (seen.has(shop.id)) continue;
                seen.add(shop.id);

                ops.push({ col: 'comercios', id: shop.id, data: shop });
                ops.push({ col: 'facturas',  id: buildInvoice(shop, loc).id, data: buildInvoice(shop, loc) });
                shops++;
                invoices++;
                console.log(`      ✨  ${shop.name} · ${shop.address}`);
            }
        }
    }

    // ── Escribir en batches de 400 (límite Firestore = 500 ops/batch)
    console.log(`\n💾  Escribiendo ${ops.length} operaciones en Firestore...`);
    const CHUNK = 400;
    for (let i = 0; i < ops.length; i += CHUNK) {
        const chunk = ops.slice(i, i + CHUNK);
        const batch = db.batch();
        chunk.forEach(({ col, id, data }) => {
            batch.set(db.collection(col).doc(id), data, { merge: true });
        });
        await batch.commit();
        console.log(`   ✅  Batch ${Math.floor(i / CHUNK) + 1}/${Math.ceil(ops.length / CHUNK)} guardado (${chunk.length} ops)`);
    }

    // Cliente VIP demo
    await db.collection('clientes').doc('cli-vip-demo-ee-fase3').set({
        id: 'cli-vip-demo-ee-fase3', name: 'María González',
        email: 'maria.gonzalez@shopdigital.tech', vipCode: 'VIP-EE-0001',
        townId: 'esteban-echeverria', zone: 'Monte Grande',
        status: 'active', vipStatus: 'active', role: 'client-vip',
        balance: 1500, phone: '1155443322',
        createdAt: new Date().toISOString(),
    }, { merge: true });

    console.log('\n🎉 ══════════════════════════════════════════════');
    console.log('🎉  FASE 3 COMPLETADA CON ÉXITO');
    console.log('🎉 ══════════════════════════════════════════════');
    console.log(`   🏪  Comercios reales ingresados : ${shops}`);
    console.log(`   📄  Facturas creadas            : ${invoices}`);
    console.log(`   ⏭️   Sin nombre (omitidos)       : ${skipped}`);
    console.log(`   👤  Cliente VIP demo            : 1`);
    console.log('\n   🌐  Ver en: https://shopdigital.tech/esteban-echeverria/home');
    console.log('🎉 ══════════════════════════════════════════════\n');

    process.exit(0);
}

seed().catch(e => {
    console.error('❌  Error crítico:', e.message || e);
    process.exit(1);
});
