import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, updateDoc, setDoc, getDoc } from "firebase/firestore";
import fs from 'fs';
import path from 'path';

// Master list of all available categories
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

const TOWN_ID = 'esteban-echeverria';

async function runMigration() {
    try {
        console.log("🚀 INICIANDO RESCATE DE DATOS POR TERMINAL...");
        
        // Cargar API Key de .env.local
        const envPath = path.resolve(process.cwd(), '.env.local');
        if (!fs.existsSync(envPath)) {
            console.error("❌ El archivo .env.local no existe.");
            return;
        }
        
        const envLines = fs.readFileSync(envPath, 'utf8').split('\n');
        const apiKeyLine = envLines.find(l => l.startsWith('VITE_FIREBASE_API_KEY='));
        if (!apiKeyLine) {
            console.error("❌ No se encontró la API KEY de Firebase en .env.local.");
            return;
        }
        const apiKey = apiKeyLine.split('=')[1].trim();
        
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
        
        console.log(`🌍 Ciudad Objetivo: ${TOWN_ID}`);
        
        // 1. MIGRAR COMERCIOS
        console.log("📦 Buscando comercios huérfanos...");
        const shopsSnap = await getDocs(collection(db, "comercios"));
        let shopsCount = 0;
        for (const docSnap of shopsSnap.docs) {
            if (!docSnap.data().townId) {
                await updateDoc(doc(db, "comercios", docSnap.id), { townId: TOWN_ID });
                shopsCount++;
            }
        }
        console.log(`✅ ${shopsCount} Comercios re-conectados.`);
        
        // 2. CONFIGURAR RUBROS (CATEGORÍAS)
        console.log("📂 Inicializando rubros dinámicos...");
        const configRef = doc(db, 'appConfig', TOWN_ID);
        const configSnap = await getDoc(configRef);
        
        if (!configSnap.exists() || !configSnap.data().categories) {
            await setDoc(configRef, {
                categories: ALL_CATEGORIES_MASTER,
                mainTitle: "ShopDigital",
                mainSubtitle: "Tu guía de ofertas locales",
                townName: "Esteban Echeverría",
                updatedAt: new Date().toISOString()
            }, { merge: true });
            console.log("✅ Rubros maestros instalados.");
        } else {
            console.log("ℹ️ Los rubros ya estaban configurados.");
        }
        
        console.log("🏁 RESCATE COMPLETADO CON ÉXITO. Revisa tu dominio.");
        process.exit(0);
    } catch (error) {
        console.error("❌ ERROR EN LA MIGRACIÓN:", error);
        process.exit(1);
    }
}

runMigration();
