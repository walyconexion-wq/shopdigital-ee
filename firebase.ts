import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc, onSnapshot } from "firebase/firestore";

// --- CONFIGURACIÓN DE FIREBASE ---
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: "shopdigital-ee.firebaseapp.com",
    projectId: "shopdigital-ee",
    storageBucket: "shopdigital-ee.firebasestorage.app",
    messagingSenderId: "201282750733",
    appId: "1:201282750733:web:e1fc713e99fab35ba8c844",
    measurementId: "G-D842DKHX2F"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Optimización: Habilitar persistencia de datos local (Ahorro Máximo de Lecturas)
// Esto permite que la app use datos en caché y solo descargue cambios, reduciendo el consumo de cuota.
import { enableIndexedDbPersistence } from "firebase/firestore";

enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
        console.warn("La persistencia falló (múltiples pestañas abiertas)");
    } else if (err.code === 'unimplemented') {
        console.warn("El navegador no soporta persistencia");
    }
});

// --- SERVICIOS ---

// 1. Obtener todos los comercios desde la colección "comercios"
export const obtenerComercios = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, "comercios"));
        return querySnapshot.docs.map(docSnap => ({
            id: docSnap.id,
            ...docSnap.data()
        }));
    } catch (error) {
        console.error("Error obteniendo comercios:", error);
        return [];
    }
};

// 1b. Suscribirse a los comercios en tiempo real
export const suscribirseAComercios = (callback: (comercios: any[]) => void) => {
    const colRef = collection(db, "comercios");
    return onSnapshot(colRef, (snapshot) => {
        const comercios = snapshot.docs.map(docSnap => ({
            id: docSnap.id,
            ...docSnap.data()
        }));
        callback(comercios);
    }, (error) => {
        console.error("Error en la suscripción de comercios:", error);
    });
};

// 2. Guardar o actualizar un comercio en la colección "comercios"
export const guardarComercio = async (comercioData: any) => {
    try {
        const id = comercioData.id;
        if (!id) throw new Error("ID de comercio es requerido para guardar.");

        await setDoc(doc(db, "comercios", id), comercioData);
        console.log("Comercio guardado con éxito. ID:", id);
        return id;
    } catch (error) {
        console.error("Error al guardar en Firestore:", error);
        throw error;
    }
};

// 3. Eliminar un comercio de la colección "comercios"
export const eliminarComercio = async (id: string) => {
    try {
        await deleteDoc(doc(db, "comercios", id));
        console.log("Comercio eliminado con éxito. ID:", id);
        return true;
    } catch (error) {
        console.error("Error al eliminar de Firestore:", error);
        throw error;
    }
};

// --- SERVICIOS BASE CLIENTES (B2C) ---

export const guardarCliente = async (clienteData: any) => {
    try {
        const id = clienteData.id;
        if (!id) throw new Error("ID de cliente es requerido para guardar.");

        await setDoc(doc(db, "clientes", id), clienteData);
        console.log("Cliente guardado con éxito. ID:", id);
        return id;
    } catch (error) {
        console.error("Error al guardar cliente en Firestore:", error);
        throw error;
    }
};

export const obtenerClientes = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, "clientes"));
        return querySnapshot.docs.map(docSnap => ({
            id: docSnap.id,
            ...docSnap.data()
        }));
    } catch (error) {
        console.error("Error obteniendo clientes:", error);
        return [];
    }
};

export const eliminarCliente = async (id: string) => {
    try {
        await deleteDoc(doc(db, "clientes", id));
        console.log("Cliente eliminado con éxito. ID:", id);
        return true;
    } catch (error) {
        console.error("Error al eliminar cliente de Firestore:", error);
        throw error;
    }
};
