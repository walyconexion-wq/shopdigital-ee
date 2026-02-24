import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc } from "firebase/firestore";

// --- CONFIGURACIÓN DE FIREBASE ---
// Pegá acá tus credenciales de la consola de Firebase
const firebaseConfig = {
    apiKey: "TU_API_KEY",
    authDomain: "TU_PROYECTO.firebaseapp.com",
    projectId: "TU_PROYECTO_ID",
    storageBucket: "TU_PROYECTO.appspot.com",
    messagingSenderId: "TU_SENDER_ID",
    appId: "TU_APP_ID"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// --- SERVICIOS ---

// 1. Obtener todos los comercios desde la colección "comercios"
export const obtenerComercios = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, "comercios"));
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Error obteniendo comercios:", error);
        return [];
    }
};

// 2. Guardar un nuevo comercio en la colección "comercios"
export const guardarComercio = async (comercioData: any) => {
    try {
        // Al usar addDoc, Firebase genera un ID automático
        const docRef = await addDoc(collection(db, "comercios"), comercioData);
        console.log("Comercio guardado con éxito. ID:", docRef.id);
        return docRef.id;
    } catch (error) {
        console.error("Error al guardar en Firestore:", error);
        throw error;
    }
};
