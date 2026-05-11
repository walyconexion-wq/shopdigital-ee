import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";

export interface RadarResult {
    id: string;
    name: string;
    address: string;
    phone?: string;
    rating?: number;
    category: string;
    isGhost: boolean; // True if NOT in ShopDigital
    source: 'google_maps';
}

/**
 * Radar de Inteligencia Ari
 * Busca negocios en el área y los cruza con la base de datos local
 */
export const scanZone = async (townId: string, category: string): Promise<RadarResult[]> => {
    try {
        console.log(`[Ari Radar] Iniciando escaneo en ${townId} para la categoría: ${category}`);
        
        // 1. Obtener comercios existentes en ShopDigital para esta zona y categoría
        const q = query(
            collection(db, "comercios"), 
            where("townId", "==", townId),
            where("category", "==", category)
        );
        const querySnapshot = await getDocs(q);
        const existingShops = querySnapshot.docs.map(doc => doc.data().name.toLowerCase().trim());

        // 2. Simulación de búsqueda en Google Places (Mock robusto hasta tener API Key)
        // En una implementación real, aquí se usaría fetch() a un endpoint de Google Places
        const mockResults: Partial<RadarResult>[] = getMockData(townId, category);

        // 3. Cruce de datos
        const finalResults: RadarResult[] = mockResults.map((biz, index) => {
            const isGhost = !existingShops.some(shopName => 
                shopName.includes(biz.name!.toLowerCase().trim()) || 
                biz.name!.toLowerCase().trim().includes(shopName)
            );
            
            return {
                id: `radar-${Date.now()}-${index}`,
                name: biz.name || 'Negocio Desconocido',
                address: biz.address || 'Dirección no disponible',
                phone: biz.phone,
                rating: biz.rating,
                category: category,
                isGhost: isGhost,
                source: 'google_maps'
            };
        });

        return finalResults;
    } catch (error) {
        console.error("Error en Radar scan:", error);
        throw error;
    }
};

// Data de simulación basada en la zona real
const getMockData = (townId: string, category: string) => {
    if (category === 'pizzerias') {
        if (townId === 'esteban-echeverria') {
            return [
                { name: "Pizzería Don Alfredo", address: "Alem 1200, Monte Grande", phone: "4290-1122", rating: 4.5 },
                { name: "La Guitarrita MG", address: "Dardo Rocha 450, Monte Grande", phone: "4290-3344", rating: 4.2 },
                { name: "Pizza Blu", address: "Boulevard Buenos Aires 200", phone: "4296-5566", rating: 4.8 }, // Este debería ser detectado como existente
                { name: "Las Cuartetas EE", address: "Vicente López 150", phone: "4296-1188", rating: 4.0 }
            ];
        }
        if (townId === 'ezeiza') {
            return [
                { name: "Pizzería Los Amigos", address: "Av. Kirchner 400, Ezeiza", phone: "4480-1100", rating: 4.3 },
                { name: "Don Juan Pizza", address: "Paso de la Patria 120", phone: "4480-2200", rating: 4.1 },
                { name: "El Palacio de la Pizza", address: "Ruta 205 km 32", phone: "4480-3300", rating: 4.6 }
            ];
        }
    }
    
    // Default fallback mock
    return [
        { name: `${category.charAt(0).toUpperCase() + category.slice(1)} El Pasaje`, address: "Centro Comercial", phone: "555-0199", rating: 3.9 },
        { name: `Gran ${category.charAt(0).toUpperCase() + category.slice(1)}`, address: "Av. Principal 100", phone: "555-0200", rating: 4.4 }
    ];
};
