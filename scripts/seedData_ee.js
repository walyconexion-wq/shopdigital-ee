import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import fs from 'fs';
import path from 'path';

// Cargar API Key desde .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
const envLines = fs.readFileSync(envPath, 'utf8').split('\n');
const apiKeyLine = envLines.find(l => l.startsWith('VITE_FIREBASE_API_KEY='));
if (!apiKeyLine) {
    console.error("❌ No se encontró la variable VITE_FIREBASE_API_KEY en .env.local");
    process.exit(1);
}
const apiKey = apiKeyLine.split('=')[1].trim().replace(/['"]/g, '');

const firebaseConfig = {
    apiKey: apiKey,
    authDomain: "shopdigital-ee.firebaseapp.com",
    projectId: "shopdigital-ee",
    storageBucket: "shopdigital-ee.firebasestorage.app",
    messagingSenderId: "201282750733",
    appId: "1:201282750733:web:e1fc713e99fab35ba8c844"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const CATEGORIES_DATA = {
    pizzerias: { name: "Pizzería", names: ["Don Carlos", "El Tano", "Napolitana"], img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500", offerName: "Pizza Grande Especial", price: 6500 },
    restaurantes: { name: "Bodegón", names: ["Lo de Charly", "Don Miguel", "El Boliche"], img: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500", offerName: "Milanesa Completa con Fritas", price: 8500 },
    fastfood: { name: "Burger Club", names: ["Doble Queso", "La Estación", "Fast Bite"], img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500", offerName: "Combo Hamburguesa Clásica", price: 5400 },
    beer: { name: "Cervecería", names: ["Temple", "Growler Garage", "Refugio"], img: "https://images.unsplash.com/photo-1532635241-17e820add50f?w=500", offerName: "Pinta de Artesanal + Papas", price: 4200 },
    icecream: { name: "Heladería", names: ["Freddo", "Cremolatti", "Vía Cosenza"], img: "https://images.unsplash.com/photo-1567206563066-0480d07addb6?w=500", offerName: "1 Kilo de Helado Premium", price: 9500 },
    gastro: { name: "Rotisería", names: ["La Abuela", "Sabores Caseros", "Viandas Fit"], img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500", offerName: "Pollo al Horno con Papas", price: 7200 },
    markets: { name: "Mercado", names: ["El Sol", "Las Acacias", "Almacén Central"], img: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500", offerName: "Bolson de Verduras de Estación", price: 4800 },
    fashion: { name: "Boutique", names: ["Elegance", "Milán Style", "Urbano Look"], img: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500", offerName: "Remera Algodón Estampada", price: 12000 },
    tech: { name: "Waly Tech", names: ["Ciber Conexión", "Matriz Celulares", "Tecno Sur"], img: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=500", offerName: "Cargador Rápido Tipo C", price: 8900 },
    home: { name: "Deco Hogar", names: ["Muebles del Sur", "Bazar Express", "Luz y Diseño"], img: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=500", offerName: "Juego de Sábanas 2 Plazas", price: 18500 },
    barber: { name: "Barbería", names: ["The King", "Corte Táctico", "Barber Style"], img: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=500", offerName: "Corte de Cabello + Perfilado", price: 4500 },
    hair: { name: "Peluquería", names: ["Estela Unisex", "Glamour Salón", "Coiffeur Claudio"], img: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=500", offerName: "Lavado y Nutrición Intensa", price: 6500 },
    gym: { name: "Gimnasio", names: ["Iron Gym", "Fuerza y Salud", "Crossfit Box"], img: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500", offerName: "Pase Libre Mensual", price: 15000 },
    hardware: { name: "Ferretería", names: ["El Tornillo", "Bulonera Central", "Industrial Sur"], img: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500", offerName: "Caja de Herramientas Completa", price: 35000 },
    pets: { name: "Veterinaria", names: ["San Roque", "Mascotas Felices", "Pet Shop"], img: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=500", offerName: "Alimento Perro Premium 15kg", price: 28000 },
    tattoo: { name: "Neon Art", names: ["Tattoo Studio", "Tinta Roja", "Skin Art"], img: "https://images.unsplash.com/photo-1590247813693-5541d1c609fd?w=500", offerName: "Sesión de Tatuaje de 2 Horas", price: 40000 },
    beauty: { name: "Estética", names: ["Bella Donna", "Lotus Centro", "Spa Relajación"], img: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500", offerName: "Limpieza de Cutis Profunda", price: 8000 },
    inmo: { name: "Inmobiliaria", names: ["Santamarina", "Propiedades Sur", "Matriz Prop"], img: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=500", offerName: "Tasación de Propiedad Sin Cargo", price: 0 },
    auto: { name: "Lubricentro", names: [" Silva Express", "Repuestos MG", "Taller Mecánico"], img: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=500", offerName: "Cambio de Filtro y Aceite", price: 22000 },
    gifts: { name: "Regalería", names: ["Con Amor", "Sorpresas y Más", "Gifts Shop"], img: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500", offerName: "Peluche de Muestra + Tarjeta", price: 7500 },
    finance: { name: "CrediSur", names: ["Finanzas Express", "Créditos Central", "Socio Financiero"], img: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=500", offerName: "Asesoramiento Financiero", price: 0 },
    servicios: { name: "Estudio", names: ["Pérez Contable", "Asociados Abogados", "PC Soporte"], img: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=500", offerName: "Consulta Inicial Profesional", price: 5000 },
    automotormotos: { name: "Motos", names: ["Dos Ruedas", "El Rayo", "Motos Central"], img: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=500", offerName: "Service Completo de Moto", price: 16000 },
    farmacias: { name: "Farmacia", names: ["Central", "Del Pueblo", "Social Sur"], img: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=500", offerName: "Medidor de Presión Digital", price: 14500 }
};

const LOCALITIES = [
    { name: "Monte Grande", slug: "monte-grande", address: "Alem 123", idx: 0, map: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3274.6547638367746!2d-58.468205423450914!3d-34.82728286950269!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bcd1625fe9f8b9%3A0xe54ef864fb8c1d56!2sMonte%20Grande%2C%20Provincia%20de%20Buenos%20Aires!5e0!3m2!1ses!4far!4v1716800000000!5m2!1ses!4far" },
    { name: "Luis Guillón", slug: "luis-guillon", address: "Bulevar Buenos Aires 450", idx: 1, map: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3275.29548325692!2d-58.4552485!3d-34.8112345!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bcd1a23fe9f8b9%3A0xe54ef864fb8c1d56!2sLuis%20Guill%C3%B3n%2C%20Provincia%20de%20Buenos%20Aires!5e0!3m2!1ses!4far!4v1716800000000!5m2!1ses!4far" },
    { name: "El Jagüel", slug: "el-jaguel", address: "Madariaga 820", idx: 2, map: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3273.829548325692!2d-58.4852485!3d-34.8452345!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bcd1c23fe9f8b9%3A0xe54ef864fb8c1d56!2sEl%20Jag%C3%BCel%2C%20Provincia%20de%20Buenos%20Aires!5e0!3m2!1ses!4far!4v1716800000000!5m2!1ses!4far" }
];

async function seed() {
    console.log("🌱 INICIANDO PROCESO DE SIEMBRA HIPERREALISTA EN ESTEBAN ECHEVERRÍA...");
    
    let totalComercios = 0;

    // 1. Inyectar 72 comercios de muestra (24 rubros x 3 localidades)
    for (const [catKey, catVal] of Object.entries(CATEGORIES_DATA)) {
        for (const loc of LOCALITIES) {
            const businessName = `${catVal.name} ${catVal.names[loc.idx]}`;
            const id = `shop-sample-${catKey}-${loc.slug}`;
            const slug = `sample-${catKey}-${loc.slug}`;
            
            const shopData = {
                id,
                slug,
                name: businessName,
                category: catKey,
                specialty: `Especialistas en ${catVal.name.toLowerCase()} de primer nivel para toda la comunidad de ${loc.name}.`,
                entityType: 'merchant',
                zone: loc.name,
                address: `${loc.address}, ${loc.name}, Pcia. de Buenos Aires`,
                phone: "1152668273",
                ownerName: `Propietario ${catVal.names[loc.idx]}`,
                image: catVal.img,
                bannerImage: catVal.img,
                description: `Te damos la bienvenida a ${businessName}. Ofrecemos una experiencia excelente en ${catVal.name.toLowerCase()} con atención personalizada, los mejores insumos del mercado y beneficios exclusivos para socios VIP de la Red ShopDigital. Visitanos y conocé nuestras propuestas.`,
                mapUrl: loc.map,
                website: `https://shopdigital.tech/${slug}`,
                instagram: `https://instagram.com/${slug}`,
                facebook: `https://facebook.com/${slug}`,
                tiktok: "",
                rating: parseFloat((4.2 + Math.random() * 0.7).toFixed(1)),
                isActive: true,
                townId: 'esteban-echeverria',
                verified: true,
                visits: Math.floor(20 + Math.random() * 80),
                subscribers: Math.floor(5 + Math.random() * 30),
                schedule: 'Lun-Sáb 9:00 - 20:00 · Dom Cerrado',
                offers: [
                    {
                        id: `offer-sample-${catKey}-${loc.slug}-1`,
                        name: catVal.offerName,
                        price: catVal.price,
                        image: catVal.img,
                        description: `Descuento exclusivo de demostración. Presentá tu credencial VIP y obtené este beneficio.`
                    }
                ]
            };

            await setDoc(doc(db, "comercios", id), shopData);
            totalComercios++;
        }
    }
    console.log(`✅ Se inyectaron ${totalComercios} comercios de muestra hiperrealistas.`);

    // 2. Inyectar Cliente VIP Cero (Socio VIP 0001)
    const clientZero = {
        id: "cli-socio-cero-ee",
        name: "Juan Pérez",
        email: "juan.perez@test.com",
        vipCode: "0001",
        townId: "esteban-echeverria",
        status: "active",
        createdAt: new Date().toISOString(),
        vipStatus: "active",
        role: "client-vip",
        balance: 1000
    };
    await setDoc(doc(db, "clientes", clientZero.id), clientZero);
    console.log("✅ Se inyectó el Cliente VIP Cero (Socio VIP 0001) para demostración.");

    // 3. Inyectar Industrias B2B (Muestras)
    const B2B_INDUSTRIES = [
        {
            id: 'ent-bebidas-ee-sample',
            slug: 'bebidas-ee-sample',
            name: 'Distribuidora de Bebidas Esteban Echeverría S.A.',
            category: 'ent-alimentos',
            specialty: 'Distribución mayorista de bebidas nacionales e importadas. Abastecimiento de restaurantes, cervecerías y comercios.',
            entityType: 'enterprise',
            reach: 'regional',
            zone: 'Monte Grande',
            address: 'Av. Boulevard Buenos Aires 1200, Monte Grande, Buenos Aires',
            phone: '1158291032',
            image: 'https://images.unsplash.com/photo-1527960656366-ee2a5e98f661?w=500',
            bannerImage: 'https://images.unsplash.com/photo-1527960656366-ee2a5e98f661?w=500',
            description: 'Distribuidora mayorista dedicada al abastecimiento de bebidas alcohólicas y analcohólicas en toda la zona sur. Precios directos y entregas programadas.',
            isActive: true,
            townId: 'esteban-echeverria',
            offers: []
        },
        {
            id: 'ent-panificadora-ee-sample',
            slug: 'panificadora-ee-sample',
            name: 'Panificadora Industrial El Jagüel',
            category: 'ent-alimentos',
            specialty: 'Elaboración industrial de pan lactal, pan de hamburguesas y panchos para locales gastronómicos y mercados.',
            entityType: 'enterprise',
            reach: 'regional',
            zone: 'El Jagüel',
            address: 'Ruta 205 Km 23.5, El Jagüel, Buenos Aires',
            phone: '1149204921',
            image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500',
            bannerImage: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500',
            description: 'Fábrica e insumos de panadería para todo el canal gastronómico. Despacho diario con flota propia.',
            isActive: true,
            townId: 'esteban-echeverria',
            offers: []
        }
    ];

    for (const ind of B2B_INDUSTRIES) {
        await setDoc(doc(db, "comercios", ind.id), ind);
    }
    console.log("✅ Se inyectaron 2 Industrias B2B de prueba.");

    console.log("🎉 ¡SIEMBRA COMPLETADA CON ÉXITO! Todos los datos están listos en Firebase.");
    process.exit(0);
}

seed().catch(err => {
    console.error("❌ Error en la siembra:", err);
    process.exit(1);
});
