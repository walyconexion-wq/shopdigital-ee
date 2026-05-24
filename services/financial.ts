import { db, enviarMensajeBunker } from '../firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { Shop, Invoice } from '../types';

/**
 * Audit engine run by ARI to simulate automated billing operations.
 * This should ideally run on a Node backend/Firebase Functions, 
 * but for the current architecture we run it on mount in the Búnker/Billing dashboard.
 */
export const runFinancialAudit = async (townId: string) => {
    try {
        console.log(`[ARI Financial] Starting audit for town: ${townId}`);

        // 1. Get all pending invoices for the town
        const invoicesRef = collection(db, `towns/${townId}/invoices`);
        const qPending = query(invoicesRef, where("status", "==", "pending"));
        const pendingSnap = await getDocs(qPending);
        
        const pendingInvoices = pendingSnap.docs.map(d => ({ id: d.id, ...d.data() } as Invoice));

        // Group pending invoices by shop
        const shopDebtCount: Record<string, Invoice[]> = {};
        pendingInvoices.forEach(inv => {
            if (!shopDebtCount[inv.shopId]) {
                shopDebtCount[inv.shopId] = [];
            }
            shopDebtCount[inv.shopId].push(inv);
        });

        // 2. Identify shops with 3 or more pending invoices
        const suspendedShopsCount = 0;

        for (const [shopId, invoices] of Object.entries(shopDebtCount)) {
            if (invoices.length >= 3) {
                // Fetch shop to check current status
                const shopRef = doc(db, `towns/${townId}/shops`, shopId);
                const shopSnap = await getDocs(query(collection(db, `towns/${townId}/shops`), where("id", "==", shopId)));
                
                if (!shopSnap.empty) {
                    const shopDoc = shopSnap.docs[0];
                    const shopData = shopDoc.data() as Shop;
                    
                    if (shopData.billingStatus !== 'suspended') {
                        console.log(`[ARI Financial] Suspending shop ${shopData.name} due to ${invoices.length} unpaid invoices.`);
                        
                        // Update Shop Status
                        await updateDoc(shopDoc.ref, {
                            billingStatus: 'suspended',
                            isActive: false // Optional: hide them from the app
                        });

                        // Notify Director via Frecuencia Directiva
                        await enviarMensajeBunker({
                            type: 'alert',
                            title: 'Suspensión por Mora (ARI)',
                            message: `He suspendido automáticamente el comercio "${shopData.name}" por presentar ${invoices.length} meses de mora (Facturas Pendientes).`,
                            targetAmbassadorId: 'all', // Or send to a specific channel/admin
                            sender: 'ARI Directora Financiera',
                            townId
                        });

                        // Optionally, update the invoices to 'suspended' status
                        for (const inv of invoices) {
                            const invRef = doc(db, `towns/${townId}/invoices`, inv.id);
                            await updateDoc(invRef, { status: 'suspended' });
                        }
                    }
                }
            }
        }

        console.log(`[ARI Financial] Audit complete.`);
        
    } catch (error) {
        console.error('[ARI Financial] Error running audit:', error);
    }
};
