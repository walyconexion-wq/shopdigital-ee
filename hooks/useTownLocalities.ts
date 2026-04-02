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
            const locs = (town && Array.isArray(town.localities) && town.localities.length > 0)
                ? town.localities
                : ['Centro'];
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
