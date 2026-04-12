import { db } from './firebase';
import { doc, getDoc, updateDoc, collection, addDoc } from "firebase/firestore";

/**
 * Transacciona créditos (moneda VIP) en la billetera del cliente y deja trazo de auditoría.
 */
export const transaccionarCreditos = async (clientId: string, shopId: string, amount: number, type: 'load' | 'spend', description: string = '', operatorEmail: string = 'SISTEMA') => {
    try {
        const docRef = doc(db, "clientes", clientId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            const clientData = docSnap.data();
            const currentCredits = clientData.credits || 0;
            const newCredits = type === 'spend' ? Math.max(0, currentCredits - amount) : currentCredits + amount;
            
            const transaction = {
                id: `ctx-${Date.now()}`,
                shopId,
                clientId,
                operatorEmail,
                type,
                amount,
                description,
                date: new Date().toISOString()
            };

            const history = clientData.creditsHistory || [];
            
            await updateDoc(docRef, {
                credits: newCredits,
                creditsHistory: [transaction, ...history],
                updatedAt: new Date().toISOString()
            });
            
            // INYECCIÓN DE AUDITORÍA (Trazabilidad para el dueño del local)
            const auditRef = collection(db, `comercios/${shopId}/credit_logs`);
            await addDoc(auditRef, transaction);
            
            return newCredits;
        } else {
            throw new Error("Cliente no encontrado para transaccionar.");
        }
    } catch (error) {
        console.error("Error en transaccionarCreditos:", error);
        throw error;
    }
};

/**
 * Actualiza la foto de perfil en Base64 o URL.
 */
export const actualizarFotoCliente = async (clientId: string, photoData: string) => {
    try {
        const docRef = doc(db, "clientes", clientId);
        await updateDoc(docRef, { 
            photo: photoData,
            updatedAt: new Date().toISOString()
        });
        return true;
    } catch (error) {
        console.error("Error actualizando foto de cliente:", error);
        throw error;
    }
};
