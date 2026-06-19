import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import fs from 'fs';
import path from 'path';

// Patagonia config template
const PATAGONIA_7_LAGOS_CATEGORIES = [
  { 
      id: 'hospedaje', slug: 'hospedaje', name: 'Hospedaje', iconKey: 'Hotel', isActive: true,
      subcategories: ['Hoteles', 'Cabañas', 'Hostels', 'Zonas de Camping', 'Departamentos']
  },
  { 
      id: 'entretenimiento', slug: 'entretenimiento', name: 'Entretenimiento', iconKey: 'Ticket', isActive: true,
      subcategories: ['Casino', 'Teatro', 'Salas de Juegos', 'Feria Local', 'Pool y Billar', 'Discotecas / Pubs']
  },
  { 
      id: 'excursiones', slug: 'excursiones', name: 'Excursiones', iconKey: 'Compass', isActive: true,
      subcategories: ['Turismo Aventura', 'Trekking Guiado', 'Cabalgatas', 'Alquiler de Cuatriciclos', 'Paseos en Barco / Catamarán']
  },
  { 
      id: 'vinos_regionales', slug: 'vinos-regionales', name: 'Vinos Regionales', iconKey: 'Wine', isActive: true,
      subcategories: ['Bodegas', 'Degustaciones', 'Viñedos', 'Vinotecas', 'Picadas y Sabores Patagónicos']
  },
  { 
      id: 'chocolaterias', slug: 'chocolaterias', name: 'Chocolaterías', iconKey: 'Coffee', isActive: true,
      subcategories: ['Chocolates Artesanales', 'Alfajorerías', 'Casas de Té', 'Dulces Regionales', 'Mermeladas']
  },
  { 
      id: 'taxis_transporte', slug: 'movilidad', name: 'Taxis y Movilidad', iconKey: 'Car', isActive: true,
      subcategories: ['Taxis', 'Remises', 'Combis', 'Alquiler de Autos', 'Traslados al Aeropuerto', 'Auxilio Mecánico / Gomería']
  }
];

// Fallback categories list (24 standard) to append
const ALL_CATEGORIES_MASTER = [
    { id: 'pizzerias', slug: 'pizzerias', name: 'Pizzerías', iconKey: 'Pizza', isSystem: true, isActive: true },
    { id: 'restaurantes', slug: 'restaurantes', name: 'Restaurantes', iconKey: 'UtensilsCrossed', isSystem: true, isActive: true },
    { id: 'fastfood', slug: 'fastfood', name: 'Comida Rápida', iconKey: 'Beef', isSystem: true, isActive: true },
    { id: 'beer', slug: 'beer', name: 'Cervecerías', iconKey: 'Beer', isSystem: true, isActive: true },
    { id: 'icecream', slug: 'icecream', name: 'Heladerías', iconKey: 'IceCream', isSystem: true, isActive: true },
    { id: 'gastro', slug: 'gastro', name: 'Gastronomías', iconKey: 'Utensils', isSystem: true, isActive: true },
    { id: 'markets', slug: 'markets', name: 'Mercados', iconKey: 'ShoppingCart', isSystem: true, isActive: true },
    { id: 'fashion', slug: 'fashion', name: 'Indumentarias', iconKey: 'Shirt', isSystem: true, isActive: true },
    { id: 'tech', slug: 'tech', name: 'Tecnología', iconKey: 'Smartphone', isSystem: true, isActive: true },
    { id: 'home', slug: 'home', name: 'Hogar', iconKey: 'Home', isSystem: true, isActive: true },
    { id: 'barber', slug: 'barber', name: 'Barberías', iconKey: 'Scissors', isSystem: true, isActive: true },
    { id: 'hair', slug: 'hair', name: 'Peluquerías', iconKey: 'UserCircle', isSystem: true, isActive: true },
    { id: 'gym', slug: 'gym', name: 'Gimnasios', iconKey: 'Dumbbell', isSystem: true, isActive: true },
    { id: 'hardware', slug: 'hardware', name: 'Ferreterías', iconKey: 'Hammer', isSystem: true, isActive: true },
    { id: 'pets', slug: 'pets', name: 'Mascotas', iconKey: 'PawPrint', isSystem: true, isActive: true },
    { id: 'tattoo', slug: 'tattoo', name: 'Tatuajes', iconKey: 'PenTool', isSystem: true, isActive: true },
    { id: 'beauty', slug: 'beauty', name: 'Estéticas', iconKey: 'Sparkles', isSystem: true, isActive: true },
    { id: 'inmo', slug: 'inmo', name: 'Inmobiliarias', iconKey: 'Building2', isSystem: true, isActive: true },
    { id: 'auto', slug: 'auto', name: 'Automotor', iconKey: 'Car', isSystem: true, isActive: true },
    { id: 'gifts', slug: 'gifts', name: 'Regalería', iconKey: 'Gift', isSystem: true, isActive: true },
    { id: 'finance', slug: 'finance', name: 'Finanzas', iconKey: 'DollarSign', isSystem: true, isActive: true },
    { id: 'servicios', slug: 'servicios', name: 'Servicios y Profesionales', iconKey: 'Briefcase', isSystem: true, isActive: true },
    { id: 'automotormotos', slug: 'automotormotos', name: 'Automotor y Motos', iconKey: 'Wrench', isSystem: true, isActive: true },
    { id: 'farmacias', slug: 'farmacias', name: 'Farmacias', iconKey: 'PlusSquare', isSystem: true, isActive: true },
];

const patagoniaCategories = [...PATAGONIA_7_LAGOS_CATEGORIES, ...ALL_CATEGORIES_MASTER];

const TOWNS = [
  { id: 'bariloche', name: 'San Carlos de Bariloche', color: '#0284c7', localities: ['Centro', 'Melipal', 'Llao Llao', 'Las Victorias'] },
  { id: 'san-martin-de-los-andes', name: 'San Martín de los Andes', color: '#0284c7', localities: ['Centro', 'Vega Maipú', 'Chacra 30', 'El Arenal'] },
  { id: 'villa-la-angostura', name: 'Villa La Angostura', color: '#0284c7', localities: ['Centro', 'Puerto Manzano', 'El Cruce', 'Las Balsas'] }
];

async function runManualCloning() {
    try {
        console.log("⚙️ INICIANDO CONFIGURACIÓN FRACTAL MANUAL...");
        
        const envPath = path.resolve(process.cwd(), '.env.local');
        if (!fs.existsSync(envPath)) {
            console.error("❌ El archivo .env.local no existe.");
            return;
        }
        
        const envLines = fs.readFileSync(envPath, 'utf8').split('\n');
        const apiKeyLine = envLines.find(l => l.trim().startsWith('VITE_FIREBASE_API_KEY='));
        if (!apiKeyLine) {
            console.error("❌ No se encontró la API KEY de Firebase en .env.local.");
            return;
        }
        const apiKey = apiKeyLine.split('=')[1].trim().replace(/^"|"$/g, '').replace(/['"]/g, '');
        
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
        
        for (const town of TOWNS) {
            console.log(`\n🧬 PROCESANDO LOCALIDAD: ${town.name} (${town.id})`);
            
            // FASE 1: Reclutamiento es de escritura pública
            console.log(`  🔹 Creando documento base de localidad en reclutamiento/${town.id}...`);
            await setDoc(doc(db, 'reclutamiento', town.id), {
                id: town.id,
                name: town.name,
                localities: town.localities,
                description: `Región patagónica clonada de forma estanca.`,
                isActive: true,
                createdAt: new Date().toISOString()
            });
            console.log(`✅ FASE 1 & FASE 2 completada localmente para ${town.name} bajo reclutamiento.`);
        }
        
        console.log("\n🚀 SIEMBRA INICIAL PUBLIC-WRITES EN RECLUTAMIENTO COMPLETADA.");
        process.exit(0);
    } catch (e) {
        console.error("❌ Ocurrió un error en el script de clonación:", e);
        process.exit(1);
    }
}

runManualCloning();
