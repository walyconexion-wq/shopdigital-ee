import { useState, useEffect } from 'react';
import { getTowns } from '../firebase';

/**
 * Hook que carga las localidades de una zona desde Firebase.
 * Si no hay localidades configuradas, retorna ['Centro'] como fallback.
 * @param townId - ID de la zona activa (ej: 'ezeiza', 'esteban-echeverria')
 */
export const useTownLocalities = (townId: string) => {
    const [localities, setLocalities] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let canceled = false;
        setLoading(true);
        
        getTowns().then((towns: any[]) => {
            if (canceled) return;
            const town = towns.find((t: any) => t.id === townId);
            let locs = (town && Array.isArray(town.localities) && town.localities.length > 0)
                ? town.localities
                : ['Centro'];
                
            // SINTONÍA FINA: Filtro estricto post-base de datos para evitar fantasmas
            if (townId === 'esteban-echeverria') {
                const allowedEE = ['Monte Grande', 'Luis Guillón', 'El Jagüel'];
                locs = locs.filter((l: string) => allowedEE.includes(l));
                if (locs.length === 0) locs = allowedEE;
            } else if (townId === 'ezeiza') {
                const allowedEz = ['Ezeiza', 'La Unión', 'Tristán Suárez', 'Spegazzini'];
                const excludeEz = ['Centro'];
                locs = locs.filter((l: string) => !excludeEz.includes(l));
                // Asegurar que si vaciamos todas, cargue el set por default de ezeiza
                if (locs.length === 0) locs = allowedEz;
            }

            setLocalities(locs);
        }).catch(() => {
            if (!canceled) setLocalities(['Centro']);
        }).finally(() => {
            if (!canceled) setLoading(false);
        });

        return () => { canceled = true; };
    }, [townId]);

    return { localities, loading };
};
