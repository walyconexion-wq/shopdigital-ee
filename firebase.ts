import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc, onSnapshot, getDoc, updateDoc, query, where, increment } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

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
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const loginConGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        return result.user;
    } catch (error) {
        console.error("Error al iniciar sesión con Google:", error);
        throw error;
    }
};

export const logout = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Error al cerrar sesión:", error);
        throw error;
    }
};

// --- CONTROL DE ACCESO (ADMIN/EMBAJADORES) ---
export const checkUserAuthorization = async (email: string) => {
    try {
        const q = query(collection(db, "autorizados"), where("email", "==", email));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const docData = querySnapshot.docs[0].data();
            return {
                id: querySnapshot.docs[0].id,
                email: docData.email,
                role: docData.role, // 'admin' | 'ambassador'
                status: docData.status, // 'active' | 'inactive' | 'pending'
                name: docData.name
            };
        }
        return null;
    } catch (e) {
        console.error("Error validando autorización:", e);
        return null;
    }
};

export const crearAspirante = async (aspiranteData: any) => {
    try {
        const id = aspiranteData.id || `asp-${Date.now()}`;
        await setDoc(doc(db, "autorizados", id), { ...aspiranteData, id, status: 'pending', role: 'ambassador' });
        return id;
    } catch (e) {
        console.error("Error al crear aspirante:", e);
        throw e;
    }
};

export const suscribirseAAutorizados = (callback: (usuarios: any[]) => void) => {
    const colRef = collection(db, "autorizados");
    return onSnapshot(colRef, (snapshot) => {
        const usuarios = snapshot.docs.map(docSnap => ({
            id: docSnap.id,
            ...docSnap.data()
        }));
        callback(usuarios);
    }, (error) => {
        console.error("Error en suscripción de autorizados:", error);
    });
};

export const actualizarAutorizado = async (id: string, updateData: any) => {
    try {
        const docRef = doc(db, "autorizados", id);
        await updateDoc(docRef, updateData);
        return true;
    } catch (error) {
        console.error("Error al actualizar autorizado:", error);
        throw error;
    }
};

export const eliminarAutorizado = async (id: string) => {
    try {
        await deleteDoc(doc(db, "autorizados", id));
        return true;
    } catch (error) {
        console.error("Error al eliminar autorizado:", error);
        throw error;
    }
};

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
export const suscribirseAComercios = (callback: (comercios: any[]) => void, onError?: (error: any) => void) => {
    const colRef = collection(db, "comercios");
    return onSnapshot(colRef, (snapshot) => {
        const comercios = snapshot.docs.map(docSnap => ({
            id: docSnap.id,
            ...docSnap.data()
        }));
        callback(comercios);
    }, (error) => {
        console.error("Error en la suscripción de comercios:", error);
        if (onError) onError(error);
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

// Incrementar visitas de un comercio (contador atómico)
export const incrementarVisitas = async (comercioId: string) => {
    try {
        const ref = doc(db, "comercios", comercioId);
        await updateDoc(ref, { visits: increment(1) });
    } catch (error) {
        console.error("Error incrementando visitas:", error);
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

// 4. Actualizar un comercio en la colección "comercios"
export const actualizarComercio = async (id: string, updateData: any) => {
    try {
        const docRef = doc(db, "comercios", id);
        await updateDoc(docRef, updateData);
        console.log(`Comercio ${id} actualizado con éxito.`);
        return true;
    } catch (error) {
        console.error(`Error al actualizar comercio ${id}:`, error);
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

export const suscribirseAClientes = (callback: (clientes: any[]) => void) => {
    const colRef = collection(db, "clientes");
    return onSnapshot(colRef, (snapshot) => {
        const clientes = snapshot.docs.map(docSnap => ({
            id: docSnap.id,
            ...docSnap.data()
        }));
        callback(clientes);
    }, (error) => {
        console.error("Error en la suscripción de clientes:", error);
    });
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

export const actualizarPuntosCliente = async (clientId: string, pointsDelta: number, shopName: string, type: 'earned' | 'redeemed') => {
    try {
        const docRef = doc(db, "clientes", clientId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            const clientData = docSnap.data();
            const currentPoints = clientData.points || 0;
            const newPoints = Math.max(0, currentPoints + pointsDelta);
            
            const transactionRef = {
                id: `trx-${Date.now()}`,
                shopName,
                type,
                points: Math.abs(pointsDelta),
                date: new Date().toISOString()
            };

            const currentHistory = clientData.pointsHistory || [];
            
            await updateDoc(docRef, {
                points: newPoints,
                pointsHistory: [transactionRef, ...currentHistory]
            });
            
            console.log(`Puntos actualizados para el cliente ${clientId}. Nuevo saldo: ${newPoints}`);
            return newPoints;
        } else {
            throw new Error("Cliente no encontrado.");
        }
    } catch (error) {
        console.error("Error al actualizar puntos del cliente en Firestore:", error);
        throw error;
    }
};

// --- SERVICIOS OFERTAS (B2B & B2C) ---

export const suscribirseAOfertas = (callback: (ofertas: any[]) => void) => {
    const colRef = collection(db, "ofertas");
    return onSnapshot(colRef, (snapshot) => {
        const ofertas = snapshot.docs.map(docSnap => ({
            id: docSnap.id,
            ...docSnap.data()
        }));
        callback(ofertas);
    }, (error) => {
        console.error("Error en la suscripción de ofertas:", error);
    });
};

export const guardarOferta = async (ofertaData: any) => {
    try {
        const id = ofertaData.id;
        if (!id) throw new Error("ID de oferta es requerido para guardar.");
        await setDoc(doc(db, "ofertas", id), ofertaData);
        console.log("Oferta guardada con éxito. ID:", id);
        return id;
    } catch (error) {
        console.error("Error al guardar oferta en Firestore:", error);
        throw error;
    }
};

export const eliminarOferta = async (id: string) => {
    try {
        await deleteDoc(doc(db, "ofertas", id));
        console.log("Oferta eliminada con éxito. ID:", id);
        return true;
    } catch (error) {
        console.error("Error al eliminar oferta de Firestore:", error);
        throw error;
    }
};

// --- SERVICIOS DE SUSCRIPCIÓN Y FACTURACIÓN (FASE 1) ---

export const suscribirseAFacturas = (callback: (facturas: any[]) => void) => {
    const colRef = collection(db, "facturas");
    return onSnapshot(colRef, (snapshot) => {
        const facturas = snapshot.docs.map(docSnap => ({
            id: docSnap.id,
            ...docSnap.data()
        }));
        callback(facturas);
    }, (error) => {
        console.error("Error en la suscripción de facturas:", error);
    });
};

export const obtenerFactura = async (id: string) => {
    try {
        const docRef = doc(db, "facturas", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error al obtener factura:", error);
        throw error;
    }
};

export const crearFactura = async (facturaData: any) => {
    try {
        const id = facturaData.id || `inv-${Date.now()}`;
        await setDoc(doc(db, "facturas", id), { ...facturaData, id });
        console.log("Factura creada con éxito. ID:", id);
        return id;
    } catch (error) {
        console.error("Error al crear factura en Firestore:", error);
        throw error;
    }
};

export const actualizarEstadoFactura = async (id: string, status: 'pending' | 'paid') => {
    try {
        const docRef = doc(db, "facturas", id);
        const updateData: any = { status };
        if (status === 'paid') {
            updateData.paymentDate = new Date().toISOString();
        }
        await updateDoc(docRef, updateData);
        console.log(`Estado de factura ${id} actualizado a ${status}`);
        return true;
    } catch (error) {
        console.error(`Error al actualizar estado de factura ${id}:`, error);
        throw error;
    }
};

export const actualizarFactura = async (id: string, updateData: any) => {
    try {
        const docRef = doc(db, "facturas", id);
        await updateDoc(docRef, updateData);
        console.log(`Factura ${id} actualizada con éxito.`);
        return true;
    } catch (error) {
        console.error(`Error al actualizar factura ${id}:`, error);
        throw error;
    }
};

// --- MÓDULO DE RELEVAMIENTO TÁCTICO (Prospectos/Leads) ---

export const guardarRelevamiento = async (leadData: any) => {
    try {
        const id = leadData.id || `lead-${Date.now()}`;
        await setDoc(doc(db, "relevamientos", id), { ...leadData, id });
        console.log("Relevamiento guardado con éxito. ID:", id);
        return id;
    } catch (error) {
        console.error("Error al guardar relevamiento en Firestore:", error);
        throw error;
    }
};

export const eliminarRelevamiento = async (id: string) => {
    try {
        await deleteDoc(doc(db, "relevamientos", id));
        console.log("Relevamiento eliminado con éxito. ID:", id);
        return true;
    } catch (error) {
        console.error("Error al eliminar relevamiento de Firestore:", error);
        throw error;
    }
};

export const actualizarRelevamiento = async (id: string, updateData: any) => {
    try {
        const docRef = doc(db, "relevamientos", id);
        await updateDoc(docRef, updateData);
        console.log(`Relevamiento ${id} actualizado con éxito.`);
        return true;
    } catch (error) {
        console.error(`Error al actualizar relevamiento ${id}:`, error);
        throw error;
    }
};

export const suscribirseARelevamientos = (callback: (leads: any[]) => void) => {
    const colRef = collection(db, "relevamientos");
    return onSnapshot(colRef, (snapshot) => {
        const leads = snapshot.docs.map(docSnap => ({
            id: docSnap.id,
            ...docSnap.data()
        }));
        callback(leads);
    }, (error) => {
        console.error("Error en la suscripción de relevamientos:", error);
    });
};
