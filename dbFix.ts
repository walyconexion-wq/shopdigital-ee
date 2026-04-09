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

export async function rescueEzeizaData() {
    console.log("🔦 INICIANDO RASTREO DE CLIENTES FANTASMAS EN EZEIZA...");
    
    // 1. Rescatar Comercios (Asegurar que El Tano es de Ezeiza)
    const shopsSnap = await getDocs(collection(db, "comercios"));
    const batch = writeBatch(db);
    let shopsFixed = 0;

    for (const d of shopsSnap.docs) {
        // Si el nombre o el slug sugieren Ezeiza o es el Tano, o la zona es Spegazzini, forzar townId
        const isTano = normalize(data.name).includes("tano") || normalize(data.slug).includes("tano");
        const isEzeizaZone = normalize(data.zone).includes("ezeiza") || normalize(data.zone).includes("spegazzini") || normalize(data.zone).includes("union") || normalize(data.zone).includes("suarez");
        
        if (isTano || isEzeizaZone) {
            if (data.townId !== "ezeiza") {
                batch.update(d.ref, { townId: "ezeiza" });
                shopsFixed++;
            }
        }
    }

    // 2. Rescatar Clientes Fantasmas
    const clientsSnap = await getDocs(collection(db, "clientes"));
    let clientsFixed = 0;

    for (const d of clientsSnap.docs) {
        const data = d.data();
        // Criterio de Rescate: 
        // a) Referencia a un comercio de Ezeiza/Tano
        // b) Venir de la landing de Ezeiza
        // c) Estar huérfano de townId
        // d) Estar en Spegazzini/Ezeiza explícitamente en su localidad
        const isTanoClient = normalize(data.sourceShopId || "").includes("tano") || normalize(data.sourceShopName || "").includes("tano");
        const isEzeizaOrigin = normalize(data.sourceShopId || "").includes("ezeiza") || normalize(data.locality || "").includes("spegazzini");
        const isOrphan = !data.townId;

        if (isTanoClient || isEzeizaOrigin || isOrphan) {
            if (data.townId !== "ezeiza") {
                batch.update(d.ref, { townId: "ezeiza" });
                clientsFixed++;
            }
        }
    }

    if (shopsFixed > 0 || clientsFixed > 0) {
        await batch.commit();
        console.log(`✅ RESCATE COMPLETADO: ${shopsFixed} comercios y ${clientsFixed} clientes normalizados a 'ezeiza'.`);
    } else {
        console.log("✨ NO SE DETECTARON FANTASMAS: El multiverso está en equilibrio.");
    }
    
    return { shopsFixed, clientsFixed };
}
