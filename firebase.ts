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

// --- MASTER CONSTANTS (Moved to top to avoid TDZ errors) ---
// Master list of all available categories (with lucide icon key for rendering)
export const ALL_CATEGORIES_MASTER = [
    { id: 'pizzerias', slug: 'pizzerias', name: 'Pizzerías', iconKey: 'Pizza', isSystem: true },
    { id: 'restaurantes', slug: 'restaurantes', name: 'Restaurantes', iconKey: 'UtensilsCrossed', isSystem: true },
    { id: 'fastfood', slug: 'fastfood', name: 'Comida Rápida', iconKey: 'Beef', isSystem: true },
    { id: 'beer', slug: 'beer', name: 'Cervecerías', iconKey: 'Beer', isSystem: true },
    { id: 'icecream', slug: 'icecream', name: 'Heladerías', iconKey: 'IceCream', isSystem: true },
    { id: 'gastro', slug: 'gastro', name: 'Gastronomías', iconKey: 'Utensils', isSystem: true },
    { id: 'markets', slug: 'markets', name: 'Mercados', iconKey: 'ShoppingCart', isSystem: true },
    { id: 'fashion', slug: 'fashion', name: 'Indumentarias', iconKey: 'Shirt', isSystem: true },
    { id: 'tech', slug: 'tech', name: 'Tecnología', iconKey: 'Smartphone', isSystem: true },
    { id: 'home', slug: 'home', name: 'Hogar', iconKey: 'Home', isSystem: true },
    { id: 'barber', slug: 'barber', name: 'Barberías', iconKey: 'Scissors', isSystem: true },
    { id: 'hair', slug: 'hair', name: 'Peluquerías', iconKey: 'UserCircle', isSystem: true },
    { id: 'gym', slug: 'gym', name: 'Gimnasios', iconKey: 'Dumbbell', isSystem: true },
    { id: 'hardware', slug: 'hardware', name: 'Ferreterías', iconKey: 'Hammer', isSystem: true },
    { id: 'pets', slug: 'pets', name: 'Mascotas', iconKey: 'PawPrint', isSystem: true },
    { id: 'tattoo', slug: 'tattoo', name: 'Tatuajes', iconKey: 'PenTool', isSystem: true },
    { id: 'beauty', slug: 'beauty', name: 'Estéticas', iconKey: 'Sparkles', isSystem: true },
    { id: 'inmo', slug: 'inmo', name: 'Inmobiliarias', iconKey: 'Building2', isSystem: true },
    { id: 'auto', slug: 'auto', name: 'Automotor', iconKey: 'Car', isSystem: true },
    { id: 'gifts', slug: 'gifts', name: 'Regalería', iconKey: 'Gift', isSystem: true },
    { id: 'finance', slug: 'finance', name: 'Finanzas', iconKey: 'DollarSign', isSystem: true },
    { id: 'servicios', slug: 'servicios', name: 'Servicios y Profesionales', iconKey: 'Briefcase', isSystem: true },
    { id: 'automotormotos', slug: 'automotormotos', name: 'Automotor y Motos', iconKey: 'Wrench', isSystem: true },
    { id: 'farmacias', slug: 'farmacias', name: 'Farmacias', iconKey: 'PlusSquare', isSystem: true },
];

// Default active categories (all system categories active by default)
export const DEFAULT_CATEGORIES_CONFIG = ALL_CATEGORIES_MASTER.map(c => ({ ...c, isActive: true }));

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

// --- MULTI-TOWN MANAGEMENT (LA FÁBRICA) ---

export const getTowns = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, "towns"));
        return querySnapshot.docs.map(docSnap => ({
            id: docSnap.id,
            ...docSnap.data()
        }));
    } catch (error) {
        console.error("Error getting towns:", error);
        return [];
    }
};

export const subscribeToTowns = (callback: (towns: any[]) => void) => {
    const colRef = collection(db, "towns");
    return onSnapshot(colRef, (snapshot) => {
        const towns = snapshot.docs.map(docSnap => ({
            id: docSnap.id,
            ...docSnap.data()
        }));
        callback(towns);
    });
};

export const saveTown = async (townData: any) => {
    try {
        const id = townData.id;
        if (!id) throw new Error("ID de zona es requerido.");
        await setDoc(doc(db, "towns", id), { ...townData, updatedAt: new Date().toISOString() }, { merge: true });
        
        // Initialize appConfig for the new town if it doesn't already exist
        const configRef = doc(db, 'appConfig', id);
        const configSnap = await getDoc(configRef);
        if (!configSnap.exists()) {
            // Use serializable categories (no React icon elements)
            const serializableCategories = ALL_CATEGORIES_MASTER.map(({ id: cId, slug, name, iconKey, isSystem }) => ({
                id: cId, slug, name, iconKey, isActive: true, isSystem: !!isSystem
            }));
            await setDoc(configRef, {
                mainTitle: "ShopDigital",
                mainSubtitle: `Tu guía de ofertas en ${townData.name}`,
                theme: 'default',
                primaryColor: '#22d3ee',
                townName: townData.name,
                categories: serializableCategories,
                updatedAt: new Date().toISOString()
            });
            console.log(`✅ Config base inicializada para zona: ${id}`);
        }
        return id;
    } catch (error) {
        console.error("Error saving town:", error);
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

// 1b. Suscribirse a los comercios en tiempo real (Filtrado por Zona)
export const suscribirseAComercios = (callback: (comercios: any[]) => void, townId?: string, onError?: (error: any) => void) => {
    const colRef = collection(db, "comercios");
    // Si es la zona por defecto ('esteban-echeverria' o vacío), mostramos todo el legado
    const q = (townId && townId !== 'esteban-echeverria') 
        ? query(colRef, where("townId", "==", townId)) 
        : colRef;
    
    return onSnapshot(q, (snapshot) => {
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
export const guardarComercio = async (comercioData: any, townId: string = 'esteban-echeverria') => {
    try {
        const id = comercioData.id;
        if (!id) throw new Error("ID de comercio es requerido para guardar.");

        // Inyectar townId si no lo tiene
        const finalData = { ...comercioData, townId: comercioData.townId || townId };
        await setDoc(doc(db, "comercios", id), finalData);
        console.log("Comercio guardado con éxito. ID:", id, "Zona:", finalData.townId);
        return id;
    } catch (error) {
        console.error("Error al guardar en Firestore:", error);
        throw error;
    }
};

export const updateComercio = async (id: string, updates: any) => {
    try {
        const docRef = doc(db, "comercios", id);
        await updateDoc(docRef, updates);
        return true;
    } catch (error) {
        console.error("Error al actualizar comercio:", error);
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

// Incrementar likes del muro de novedades (contador atómico)
export const incrementarLikesFeed = async (comercioId: string) => {
    try {
        const ref = doc(db, "comercios", comercioId);
        await updateDoc(ref, { feedLikes: increment(1) });
    } catch (error) {
        console.error("Error incrementando likes del muro:", error);
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

export const suscribirseAClientes = (callback: (clientes: any[]) => void, townId?: string) => {
    const colRef = collection(db, "clientes");
    const q = townId ? query(colRef, where("townId", "==", townId)) : colRef;
    
    return onSnapshot(q, (snapshot) => {
        const clientes = snapshot.docs.map(docSnap => ({
            id: docSnap.id,
            ...docSnap.data()
        }));
        callback(clientes);
    }, (error) => {
        console.error("Error en la suscripción de clientes:", error);
    });
};

export const guardarCliente = async (clienteData: any, townId: string = 'esteban-echeverria') => {
    try {
        const id = clienteData.id;
        if (!id) throw new Error("ID de cliente es requerido.");
        const finalData = { ...clienteData, townId: clienteData.townId || townId };
        await setDoc(doc(db, "clientes", id), finalData);
        return id;
    } catch (error) {
        console.error("Error saving client:", error);
        throw error;
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

export const suscribirseAOfertas = (callback: (ofertas: any[]) => void, townId?: string) => {
    const colRef = collection(db, "ofertas");
    const q = (townId && townId !== 'esteban-echeverria') 
        ? query(colRef, where("townId", "==", townId)) 
        : colRef;
    
    return onSnapshot(q, (snapshot) => {
        const ofertas = snapshot.docs.map(docSnap => ({
            id: docSnap.id,
            ...docSnap.data()
        }));
        callback(ofertas);
    }, (error) => {
        console.error("Error en la suscripción de ofertas:", error);
    });
};

export const guardarOferta = async (ofertaData: any, townId: string = 'esteban-echeverria') => {
    try {
        const id = ofertaData.id;
        if (!id) throw new Error("ID de oferta es requerido.");
        const finalData = { ...ofertaData, townId: ofertaData.townId || townId };
        await setDoc(doc(db, "ofertas", id), finalData);
        return id;
    } catch (error) {
        console.error("Error saving offer:", error);
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

export const suscribirseAFacturasPorZona = (townId: string, callback: (facturas: any[]) => void) => {
    const colRef = collection(db, "facturas");
    const q = query(colRef, where("townId", "==", townId));
    return onSnapshot(q, (snapshot) => {
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

export const actualizarEstadoFactura = async (id: string, status: 'pending' | 'paid' | 'uncollectible') => {
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

export const suscribirseARelevamientos = (callback: (leads: any[]) => void, townId?: string) => {
    const colRef = collection(db, "relevamientos");
    const q = townId ? query(colRef, where("townId", "==", townId)) : colRef;
    
    return onSnapshot(q, (snapshot) => {
        const leads = snapshot.docs.map(docSnap => ({
            id: docSnap.id,
            ...docSnap.data()
        }));
        callback(leads);
    }, (error) => {
        console.error("Error en la suscripción de relevamientos:", error);
    });
};

export const guardarRelevamiento = async (leadData: any, townId: string = 'esteban-echeverria') => {
    try {
        const id = leadData.id || `lead-${Date.now()}`;
        const finalData = { ...leadData, id, townId: leadData.townId || townId };
        await setDoc(doc(db, "relevamientos", id), finalData);
        return id;
    } catch (error) {
        console.error("Error saving relevamiento:", error);
        throw error;
    }
};

export const eliminarRelevamiento = async (id: string) => {
    try {
        await deleteDoc(doc(db, "relevamientos", id));
        return true;
    } catch (error) {
        console.error("Error eliminando relevamiento:", error);
        throw error;
    }
};

export const actualizarRelevamiento = async (id: string, data: any) => {
    try {
        await updateDoc(doc(db, "relevamientos", id), data);
        return true;
    } catch (error) {
        console.error("Error actualizando relevamiento:", error);
        throw error;
    }
};

// --- GLOBAL CONFIGURATION (TOWN THEMES & TITLES) ---

export const getGlobalConfig = async (townId: string = 'esteban-echeverria') => {
    try {
        const docRef = doc(db, 'appConfig', townId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data();
        }
        // Default config if not exists
        return {
            mainTitle: "ShopDigital",
            mainSubtitle: "Tu guía de ofertas locales",
            theme: 'default',
            primaryColor: '#22d3ee',
            townName: "Esteban Echeverría"
        };
    } catch (error) {
        console.error("Error getting global config:", error);
        return null;
    }
};

export const subscribeToGlobalConfig = (onUpdate: (config: any) => void, townId: string = 'esteban-echeverria') => {
    const docRef = doc(db, 'appConfig', townId);
    return onSnapshot(docRef, async (snap) => {
        if (snap.exists()) {
            const data = snap.data();
            // Si el documento existe pero no tiene categorías (o están vacías), inyectamos los defaults
            if (!data.categories || data.categories.length === 0) {
                onUpdate({
                    ...data,
                    categories: ALL_CATEGORIES_MASTER.map(c => ({ ...c, isActive: true, isSystem: true }))
                });
            } else {
                onUpdate(data);
            }
        } else if (townId === 'esteban-echeverria') {
            // Si es la zona por defecto y no existe el doc, intentamos usar el legado o el default maestro
            onUpdate({
                mainTitle: "ShopDigital",
                mainSubtitle: "Tu guía de ofertas locales",
                theme: 'winter',
                primaryColor: '#22d3ee',
                townName: "Esteban Echeverría",
                categories: ALL_CATEGORIES_MASTER.map(c => ({ ...c, isActive: true, isSystem: true }))
            });
        } else {
            // Nueva zona sin configuración aún: generar default dinámico usando el nombre real de la zona
            const displayName = townId
                .split('-')
                .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(' ');
            onUpdate({
                mainTitle: "ShopDigital",
                mainSubtitle: `Tu guía de ofertas en ${displayName}`,
                theme: 'default',
                primaryColor: '#22d3ee',
                townName: displayName,
                categories: ALL_CATEGORIES_MASTER.map(c => ({ ...c, isActive: true, isSystem: true }))
            });
        }
    });
};

export const saveGlobalConfig = async (config: any, townId: string = 'esteban-echeverria') => {
    try {
        const docRef = doc(db, 'appConfig', townId);
        await setDoc(docRef, { ...config, updatedAt: new Date().toISOString() }, { merge: true });
        return true;
    } catch (error) {
        console.error("Error saving global config:", error);
        throw error;
    }
};

// --- CATEGORY (RUBROS) CONFIG ---

// Default active categories (all system categories active by default)

export const saveCategoriesConfig = async (categories: any[], townId: string = 'esteban-echeverria') => {
    try {
        const docRef = doc(db, 'appConfig', townId);
        // Strip React elements (icons) before saving — only save serializable data
        const serializable = categories.map(({ id, slug, name, iconKey, isActive, isSystem }) => ({
            id, slug, name, iconKey, isActive: !!isActive, isSystem: !!isSystem
        }));
        await setDoc(docRef, { categories: serializable, updatedAt: new Date().toISOString() }, { merge: true });
        return true;
    } catch (error) {
        console.error("Error saving categories config:", error);
        throw error;
    }
};

// --- MÓDULO DE MANTENIMIENTO Y MIGRACIÓN ---

/**
 * Inicializa la configuración de una zona si no existe.
 * Útil para asegurar que una zona tenga los rubros maestros por defecto.
 */
export const inicializarZonaPredeterminada = async (townId: string = 'esteban-echeverria') => {
    try {
        const docRef = doc(db, 'appConfig', townId);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists() || !docSnap.data().categories) {
            console.log(`Inicializando configuración base para: ${townId}`);
            const serializable = ALL_CATEGORIES_MASTER.map(cat => ({
                ...cat,
                isActive: true,
                isSystem: true
            }));
            await setDoc(docRef, {
                mainTitle: "ShopDigital",
                mainSubtitle: "Tu guía de ofertas locales",
                theme: 'default',
                primaryColor: '#22d3ee',
                townName: townId === 'esteban-echeverria' ? "Esteban Echeverría" : townId,
                categories: serializable,
                updatedAt: new Date().toISOString()
            }, { merge: true });
        }
        return true;
    } catch (error) {
        console.error("Error inicializando zona:", error);
        throw error;
    }
};

/**
 * Migra todos los registros (comercios, clientes, ofertas) que no tengan townId 
 * asignándoles la zona especificada.
 */
export const migrarDatosLegados = async (targetTownId: string = 'esteban-echeverria') => {
    try {
        console.log("Iniciando migración de datos legados a:", targetTownId);
        
        // 1. Migrar Comercios
        const shopsSnap = await getDocs(collection(db, "comercios"));
        const shopsToUpdate = shopsSnap.docs.filter(d => !d.data().townId);
        for (const d of shopsToUpdate) {
            await updateDoc(doc(db, "comercios", d.id), { townId: targetTownId });
        }
        
        // 2. Migrar Clientes
        const clientsSnap = await getDocs(collection(db, "clientes"));
        const clientsToUpdate = clientsSnap.docs.filter(d => !d.data().townId);
        for (const d of clientsToUpdate) {
            await updateDoc(doc(db, "clientes", d.id), { townId: targetTownId });
        }

        // 3. Migrar Ofertas
        const offersSnap = await getDocs(collection(db, "ofertas"));
        const offersToUpdate = offersSnap.docs.filter(d => !d.data().townId);
        for (const d of offersToUpdate) {
            await updateDoc(doc(db, "ofertas", d.id), { townId: targetTownId });
        }

        console.log(`Migración completada. Actualizados: ${shopsToUpdate.length} comercios, ${clientsToUpdate.length} clientes, ${offersToUpdate.length} ofertas.`);
        
        // 4. Asegurar que la zona destino tenga rubros
        await inicializarZonaPredeterminada(targetTownId);
        
        return {
            shops: shopsToUpdate.length,
            clients: clientsToUpdate.length,
            offers: offersToUpdate.length
        };
    } catch (error) {
        console.error("Error en migración:", error);
        throw error;
    }
};

// --- CEREBRO DE CONSULTAS IA (LA MENTE DE DATOS DEL BOT) ---

export const SumaTotal = async (townId: string, locality?: string, period?: string, status?: string): Promise<number> => {
    try {
        const colRef = collection(db, "facturas");
        let constraints: any[] = [where("townId", "==", townId)];
        if (status) constraints.push(where("status", "==", status));
        // Filtramos localidad y periodo localmente
        const q = query(colRef, ...constraints);
        const snapshot = await getDocs(q);
        let facturas = snapshot.docs.map(d => d.data() as any);
        
        if (locality) facturas = facturas.filter(f => f.locality === locality);
        if (period) facturas = facturas.filter(f => f.period === period);
        
        return facturas.reduce((sum, inv) => sum + (inv.amount || 0), 0);
    } catch (error) {
        console.error("Error en SumaTotal (IA):", error);
        return 0;
    }
};

export const ConteoPendientes = async (townId: string, locality?: string, period?: string): Promise<number> => {
    try {
        const colRef = collection(db, "facturas");
        const q = query(colRef, where("townId", "==", townId), where("status", "==", "pending"));
        const snapshot = await getDocs(q);
        let facturas = snapshot.docs.map(d => d.data() as any);
        
        if (locality) facturas = facturas.filter(f => f.locality === locality);
        if (period) facturas = facturas.filter(f => f.period === period);
        
        return facturas.length;
    } catch (error) {
        console.error("Error en ConteoPendientes (IA):", error);
        return 0;
    }
};
