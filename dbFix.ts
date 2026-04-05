import { getDocs, collection, updateDoc, doc, setDoc, writeBatch } from "firebase/firestore";
import { db, crearFactura } from "./firebase";
import { Shop, Invoice } from "./types";

export async function populateInvoices() {
    console.log("🔥 Starting FireDB Injection Mission 🔥");
    const shopsSnap = await getDocs(collection(db, "comercios"));
    const allShops = shopsSnap.docs.map(d => ({id: d.id, ...d.data()})) as Shop[];
    
    // Mission 1: Pizzería El Tano -> Spegazzini in Ezeiza
    let elTano = allShops.find(s => s.name.toLowerCase().includes("el tano"));
    if (!elTano) {
        console.log("Pizzería El Tano no encontrada. La creamos.");
        elTano = {
            id: `shop-tano-${Date.now()}`,
            slug: 'pizzeria-el-tano',
            name: 'Pizzería El Tano',
            category: 'pizzerias',
            townId: 'ezeiza',
            zone: 'Spegazzini',
            address: 'Ruta 205 Km 42',
            phone: '1123456789',
            isActive: true,
            rating: 5,
            specialty: 'Pizza Libre',
            image: 'https://images.unsplash.com/photo-1544982503-9f984c14501a',
            bannerImage: 'https://images.unsplash.com/photo-1544982503-9f984c14501a',
            offers: []
        };
        await setDoc(doc(db, "comercios", elTano.id), elTano);
        console.log("✅ Pizzería El Tano inyectada en Ezeiza -> Spegazzini");
    } else {
        await updateDoc(doc(db, "comercios", elTano.id), {
            townId: 'ezeiza',
            zone: 'Spegazzini',
            category: 'pizzerias'
        });
        elTano.townId = 'ezeiza';
        elTano.zone = 'Spegazzini';
        elTano.category = 'pizzerias';
        console.log("✅ Pizzería El Tano recalibrada.");
    }

    // Inyectamos factura para El Tano
    const invoicesSnap = await getDocs(collection(db, "facturas"));
    let allInvoices = invoicesSnap.docs.map(d => ({id: d.id, ...d.data()})) as Invoice[];
    
    const tanoInvoices = allInvoices.filter(i => i.shopId === elTano!.id);
    if (tanoInvoices.length === 0) {
        const issueDateObj = new Date();
        const periodSello = `${issueDateObj.getFullYear()}-${String(issueDateObj.getMonth() + 1).padStart(2, '0')}`;
        await crearFactura({
            shopId: elTano.id,
            shopName: elTano.name,
            townId: elTano.townId,
            locality: elTano.zone,
            period: periodSello,
            amount: 7500,
            issueDate: issueDateObj.toISOString(),
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'pending',
            concept: 'Suscripción Premium Mensual'
        });
        console.log("✅ Factura El Tano generada en Ezeiza.");
    }

    // EE Facturas logic
    const eeShops = allShops.filter(s => s.townId === 'esteban-echeverria');
    const targetCategories = [
        { cat: 'pizzerias', count: 3 },
        { cat: 'restaurants', count: 3 },
        { cat: 'hamburgueserias', count: 3 },
        { cat: 'cervecerias', count: 1 }
    ];

    let invCounter = 0;
    const batch = writeBatch(db);

    for (const target of targetCategories) {
        let matchingShops = eeShops.filter(s => s.category === target.cat);
        for (let i = 0; i < target.count; i++) {
            let shopForInv = matchingShops[i];
            if (!shopForInv) {
                const newId = `shop-auto-ee-${target.cat}-${i}-${Date.now()}`;
                shopForInv = {
                    id: newId,
                    slug: `auto-${target.cat}-${i}`,
                    name: `La Auténtica ${target.cat.charAt(0).toUpperCase() + target.cat.slice(1)} ${i+1}`,
                    category: target.cat,
                    townId: 'esteban-echeverria',
                    zone: 'Monte Grande',
                    address: 'M. Acosta 123',
                    isActive: true,
                    rating: 5,
                    specialty: 'Comida',
                    offers: []
                } as Shop;
                batch.set(doc(db, "comercios", newId), shopForInv);
                matchingShops.push(shopForInv); // keep references for remainder of loop
            }
            
            // Re check facturas for this shop to not duplicate endlessly every refresh
            const shopInvoices = allInvoices.filter(inv => inv.shopId === shopForInv.id);
            if (shopInvoices.length < 1) {
                const invId = `inv-${Date.now()}-${invCounter++}`;
                const issueDateObj = new Date();
                const periodSello = `${issueDateObj.getFullYear()}-${String(issueDateObj.getMonth() + 1).padStart(2, '0')}`;
                
                const newInvoice = {
                    id: invId,
                    shopId: shopForInv.id,
                    shopName: shopForInv.name,
                    townId: shopForInv.townId,
                    locality: shopForInv.zone || 'Desconocida',
                    period: periodSello,
                    amount: Math.floor(Math.random() * 5000) + 3000,
                    issueDate: issueDateObj.toISOString(),
                    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                    status: i % 2 === 0 ? 'paid' : 'pending',
                    concept: 'Cuota Mensual'
                };
                batch.set(doc(db, "facturas", invId), newInvoice);
                allInvoices.push(newInvoice as any);
            }
        }
    }
    
    await batch.commit();
    console.log("✅ Facturas EE generadas. 🎉 Misión Cumplida!");
    return true;
}
