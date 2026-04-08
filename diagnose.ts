import { getDocs, collection } from "firebase/firestore";
import { db } from "./firebase";
import { Client, Shop } from "./types";

export async function diagnoseEEVisibility() {
    console.log("🔍 DIAGNÓSTICO DE VISIBILIDAD ESTEBAN ECHEVERRÍA 🔍");
    
    const clientsSnap = await getDocs(collection(db, "clientes"));
    const allClients = clientsSnap.docs.map(d => ({id: d.id, ...d.data()})) as Client[];
    const eeClients = allClients.filter(c => c.townId === 'esteban-echeverria');
    
    console.log(`Total Clientes en EE: ${eeClients.length}`);
    
    const shopsSnap = await getDocs(collection(db, "comercios"));
    const allShops = shopsSnap.docs.map(d => ({id: d.id, ...d.data()})) as Shop[];
    
    eeClients.forEach(c => {
        const shop = allShops.find(s => s.id === c.sourceShopId);
        console.log(`- Socio: ${c.name} (Subscripto a: ${shop?.name || c.sourceShopId})`);
        console.log(`  Shop Zone: ${shop?.zone}, TownId: ${shop?.townId}, Category: ${shop?.category}`);
    });

    const categoriesInEE = [...new Set(allShops.filter(s => s.townId === 'esteban-echeverria').map(s => s.category))];
    console.log(`Categorías con comercios en EE: ${categoriesInEE.join(', ')}`);
}
