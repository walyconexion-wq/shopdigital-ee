import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";

// --- CONFIGURACIÓN DE FIREBASE ---
const firebaseConfig = {
    apiKey: "AIzaSyBSicRJMwdxG76eaXvQh07ncDYhxMz7mF0",
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
