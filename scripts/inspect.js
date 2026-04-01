import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, limit, query } from "firebase/firestore";
import fs from 'fs';
import path from 'path';

// Cargar API Key de .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
const envLines = fs.readFileSync(envPath, 'utf8').split('\n');
const apiKeyLine = envLines.find(l => l.startsWith('VITE_FIREBASE_API_KEY='));
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

async function inspect() {
    console.log("🔍 INSPECCIONANDO COMERCIOS...");
    const q = query(collection(db, "comercios"), limit(5));
    const snap = await getDocs(q);
    
    const results = snap.docs.map(d => ({
        id: d.id,
        name: d.data().name,
        category: d.data().category,
        townId: d.data().townId,
        isActive: d.data().isActive
    }));
    
    console.log(JSON.stringify(results, null, 2));
    process.exit(0);
}

inspect().catch(console.error);
