import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";
import * as dotenv from 'dotenv';
dotenv.config();

const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: "shopdigital-ee.firebaseapp.com",
    projectId: "shopdigital-ee",
    storageBucket: "shopdigital-ee.firebasestorage.app",
    messagingSenderId: "201282750733",
    appId: "1:201282750733:web:e1fc713e99fab35ba8c844",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
    const q = collection(db, "comercios");
    const snapshot = await getDocs(q);
    let count = 0;
    snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.entityType === 'enterprise') {
            count++;
            console.log(`- ${data.name} | Category: ${data.category} | Prov: ${data.province} | Town: ${data.townId} | Reach: ${data.reach}`);
        }
    });
    console.log("Total enterprises found:", count);
}
run().catch(console.error);
