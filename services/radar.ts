import { collection, getDocs, query, where, doc, getDoc, setDoc } from "firebase/firestore";
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
    latitude?: number;
    longitude?: number;
}

/**
 * Radar de Inteligencia Ari
 * Busca negocios en el área utilizando la API de Google Places y los cruza con la base de datos local
 * con caché de consultas y filtro anti-colisión para semillas.
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
        
        // Filtro Anti-Colisión: Ignorar los comercios que son semilla (isSeed: true)
        // de modo que el comercio real de Google Maps siga apareciendo como "Fantasma"
        const existingShops = querySnapshot.docs
            .filter(d => !d.data().isSeed)
            .map(d => d.data().name.toLowerCase().trim());

        // 2. Verificar Caché de Consultas en Firestore (Escudo Financiero)
        const cacheDocRef = doc(db, "radar_cache", `${townId}_${category}`);
        let placesRaw: any[] = [];
        let useCache = false;

        try {
            const cacheSnap = await getDoc(cacheDocRef);
            if (cacheSnap.exists()) {
                const cacheData = cacheSnap.data();
                const updatedAt = new Date(cacheData.updatedAt).getTime();
                const now = Date.now();
                const diffDays = (now - updatedAt) / (1000 * 60 * 60 * 24);

                // Si la caché tiene menos de 7 días, la usamos para no gastar cuota de API
                if (diffDays < 7 && Array.isArray(cacheData.results)) {
                    console.log(`[Ari Radar] Usando datos de caché para ${townId}_${category} (antigüedad: ${diffDays.toFixed(1)} días)`);
                    placesRaw = cacheData.results;
                    useCache = true;
                }
            }
        } catch (cacheErr) {
            console.warn("[Ari Radar] Error leyendo caché, procediendo a consultar API:", cacheErr);
        }

        // 3. Si no hay caché válida, llamar a Google Places API (New) o fallback a Mock
        if (!useCache) {
            const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || import.meta.env.VITE_FIREBASE_API_KEY;
            const townName = townId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

            if (!apiKey) {
                console.warn("[Ari Radar] No API Key found, using mock fallback.");
                placesRaw = getMockData(townId, category);
            } else {
                try {
                    const url = `https://places.googleapis.com/v1/places:searchText`;
                    const response = await fetch(url, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Goog-Api-Key': apiKey,
                            // X-Goog-FieldMask específica para optimizar costos de Google Places API
                            'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.internationalPhoneNumber'
                        },
                        body: JSON.stringify({
                            textQuery: `${category === 'pizzerias' ? 'pizzería' : category === 'barber' ? 'barbería' : category === 'gym' ? 'gimnasio' : category} en ${townName}, Argentina`
                        })
                    });

                    if (response.ok) {
                        const data = await response.json();
                        placesRaw = data.places || [];
                        console.log(`[Ari Radar] API de Google consultada con éxito. Se obtuvieron ${placesRaw.length} resultados.`);

                        // Guardar en Caché de Firestore
                        await setDoc(cacheDocRef, {
                            results: placesRaw,
                            updatedAt: new Date().toISOString()
                        });
                    } else {
                        const errorMsg = await response.text();
                        console.error(`[Ari Radar] Error en respuesta de Google API: ${response.status} - ${errorMsg}`);
                        placesRaw = getMockData(townId, category);
                    }
                } catch (apiErr) {
                    console.error("[Ari Radar] Excepción llamando a la API de Google, usando fallback mock:", apiErr);
                    placesRaw = getMockData(townId, category);
                }
            }
        }

        // 4. Mapear y cruzar contra existentes para determinar Fantasmas
        const finalResults: RadarResult[] = placesRaw.map((place: any, index: number) => {
            const name = place.displayName?.text || place.name || 'Negocio Desconocido';
            const isGhost = !existingShops.some(shopName => 
                shopName.includes(name.toLowerCase().trim()) || 
                name.toLowerCase().trim().includes(shopName)
            );

            return {
                id: place.id || `radar-${Date.now()}-${index}`,
                name: name,
                address: place.formattedAddress || 'Dirección no disponible',
                phone: place.internationalPhoneNumber || place.phone || '',
                rating: place.rating,
                category: category,
                isGhost: isGhost,
                source: 'google_maps',
                // Coordenadas de Ataque 🗺️
                latitude: place.location?.latitude,
                longitude: place.location?.longitude
            };
        });

        return finalResults;
    } catch (error) {
        console.error("Error en Radar scan:", error);
        throw error;
    }
};

// Data de simulación basada en la zona real (Fallback)
const getMockData = (townId: string, category: string) => {
    const defaultLocation = { latitude: -34.8272828, longitude: -58.4682054 }; // Centro de Monte Grande
    
    if (category === 'pizzerias') {
        if (townId === 'esteban-echeverria') {
            return [
                { id: "gplace-pizzadonalfredo", displayName: { text: "Pizzería Don Alfredo" }, formattedAddress: "Alem 1200, Monte Grande", internationalPhoneNumber: "1142901122", rating: 4.5, location: { latitude: -34.829, longitude: -58.472 } },
                { id: "gplace-laguitarrittamg", displayName: { text: "La Guitarrita MG" }, formattedAddress: "Dardo Rocha 450, Monte Grande", internationalPhoneNumber: "1142903344", rating: 4.2, location: { latitude: -34.825, longitude: -58.463 } },
                { id: "gplace-pizzablu", displayName: { text: "Pizza Blu" }, formattedAddress: "Boulevard Buenos Aires 200", internationalPhoneNumber: "1142965566", rating: 4.8, location: { latitude: -34.815, longitude: -58.455 } },
                { id: "gplace-lascuartetas", displayName: { text: "Las Cuartetas EE" }, formattedAddress: "Vicente López 150", internationalPhoneNumber: "1142961188", rating: 4.0, location: { latitude: -34.831, longitude: -58.469 } }
            ];
        }
        if (townId === 'ezeiza') {
            return [
                { id: "gplace-losamigos", displayName: { text: "Pizzería Los Amigos" }, formattedAddress: "Av. Kirchner 400, Ezeiza", internationalPhoneNumber: "1144801100", rating: 4.3, location: { latitude: -34.851, longitude: -58.525 } },
                { id: "gplace-donjuan", displayName: { text: "Don Juan Pizza" }, formattedAddress: "Paso de la Patria 120", internationalPhoneNumber: "1144802200", rating: 4.1, location: { latitude: -34.855, longitude: -58.530 } },
                { id: "gplace-palaciopizza", displayName: { text: "El Palacio de la Pizza" }, formattedAddress: "Ruta 205 km 32", internationalPhoneNumber: "1144803300", rating: 4.6, location: { latitude: -34.860, longitude: -58.540 } }
            ];
        }
    }
    
    // Default fallback mock
    return [
        { id: `gplace-${category}-pasaje`, displayName: { text: `${category.charAt(0).toUpperCase() + category.slice(1)} El Pasaje` }, formattedAddress: "Centro Comercial", internationalPhoneNumber: "115550199", rating: 3.9, location: defaultLocation },
        { id: `gplace-gran-${category}`, displayName: { text: `Gran ${category.charAt(0).toUpperCase() + category.slice(1)}` }, formattedAddress: "Av. Principal 100", internationalPhoneNumber: "115550200", rating: 4.4, location: defaultLocation }
    ];
};
