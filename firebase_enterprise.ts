import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "./firebase";

// 🏭 CONFIGURACIÓN INDUSTRIAL B2B (Independiente)
export const subscribeToEnterpriseConfig = (onUpdate: (config: any) => void, townId: string = 'esteban-echeverria') => {
    const docRef = doc(db, 'appConfig', `${townId}_enterprise`);
    return onSnapshot(docRef, async (snap) => {
        if (snap.exists()) {
            onUpdate(snap.data());
        } else {
            // Default config for Enterprise if not exists
            const displayName = townId
                .split('-')
                .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(' ');
            onUpdate({
                mainTitle: "Directorio Industrial",
                mainSubtitle: `Conectando la fuerza productiva de ${displayName}`,
                theme: 'default',
                primaryColor: '#f59e0b', // Amber/Orange legacy
                townName: displayName,
                bgColor: '#000000'
            });
        }
    });
};

export const saveEnterpriseConfig = async (config: any, townId: string = 'esteban-echeverria') => {
    try {
        const docRef = doc(db, 'appConfig', `${townId}_enterprise`);
        await setDoc(docRef, { ...config, updatedAt: new Date().toISOString() }, { merge: true });
        return true;
    } catch (error) {
        console.error("Error saving enterprise config:", error);
        throw error;
    }
};
