import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "./firebase";

// 🏭 CONFIGURACIÓN INDUSTRIAL B2B (Independiente)
export const subscribeToEnterpriseConfig = (onUpdate: (config: any) => void) => {
    const docRef = doc(db, 'appConfig', 'industrial-global');
    return onSnapshot(docRef, async (snap) => {
        if (snap.exists()) {
            onUpdate(snap.data());
        } else {
            // Default config for Enterprise if not exists
            onUpdate({
                mainTitle: "Directorio Industrial",
                mainSubtitle: "Conectando la fuerza productiva nacional",
                theme: 'default',
                primaryColor: '#f59e0b', // Amber/Orange legacy
                townName: "Argentina", // Nacional
                bgColor: '#000000'
            });
        }
    });
};

export const saveEnterpriseConfig = async (config: any) => {
    try {
        const docRef = doc(db, 'appConfig', 'industrial-global');
        await setDoc(docRef, { ...config, updatedAt: new Date().toISOString() }, { merge: true });
        return true;
    } catch (error) {
        console.error("Error saving enterprise config:", error);
        throw error;
    }
};
