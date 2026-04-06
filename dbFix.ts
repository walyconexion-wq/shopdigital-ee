import { getDocs, collection, updateDoc, doc, setDoc, writeBatch } from "firebase/firestore";
import { db, crearFactura } from "./firebase";
import { Shop, Invoice } from "./types";

export async function populateInvoices() {
    console.log("🔥 INICIANDO REACTOR DE SINCRONIZACIÓN MAESTRA 🔥");
    
    // 1. Obtener todos los comercios y facturas actuales
    const shopsSnap = await getDocs(collection(db, "comercios"));
    const allShops = shopsSnap.docs.map(d => ({id: d.id, ...d.data()})) as Shop[];
    
    const invoicesSnap = await getDocs(collection(db, "facturas"));
    const allInvoices = invoicesSnap.docs.map(d => ({id: d.id, ...d.data()})) as Invoice[];
    
    const batch = writeBatch(db);
    let newInvoicesCount = 0;
    const now = new Date();
    const currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    console.log(`Analizando ${allShops.length} comercios para sincronización...`);

    for (const shop of allShops) {
        // Buscar si ya tiene una factura para este periodo
        const hasInvoice = allInvoices.some(inv => 
            inv.shopId === shop.id && 
            inv.period === currentPeriod
        );

        if (!hasInvoice) {
            const invId = `inv-${shop.slug}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            const issueDate = now.toISOString();
            const dueDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

            const newInvoice: any = {
                id: invId,
                shopId: shop.id,
                shopName: shop.name,
                townId: shop.townId || 'esteban-echeverria',
                locality: shop.zone || 'Centro',
                period: currentPeriod,
                amount: 10000, // Estándar Premium establecido por el Director
                issueDate,
                dueDate,
                status: 'pending',
                concept: 'SUSCRIPCIÓN MES EN CURSO'
            };

            batch.set(doc(db, "facturas", invId), newInvoice);
            newInvoicesCount++;
            console.log(`✅ Generando factura $10k para: ${shop.name} (${shop.townId})`);
        }
    }

    if (newInvoicesCount > 0) {
        await batch.commit();
        console.log(`🚀 REACTOR COMPLETADO: Se inyectaron ${newInvoicesCount} facturas nuevas.`);
    } else {
        console.log("✨ SISTEMA YA SINCRONIZADO: No se requirieron inyecciones nuevas.");
    }
    
    return true;
}
