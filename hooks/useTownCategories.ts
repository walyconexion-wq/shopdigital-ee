import { useMemo } from 'react';
import { TRASLASIERRA_REGION } from '../data/regionalTemplates/traslasierraConfig';
import { PATAGONIA_7_LAGOS_REGION } from '../data/regionalTemplates/patagonia7LagosConfig';
import { CATEGORIES } from '../constants';
import { Category } from '../types';

export const useTownCategories = (townId: string): Category[] => {
    return useMemo(() => {
        if (!townId) return CATEGORIES;
        const isInTraslasierra = TRASLASIERRA_REGION.towns.some(t => t.id === townId);
        const isInPatagonia = PATAGONIA_7_LAGOS_REGION.towns.some(t => t.id === townId);
        return isInTraslasierra
            ? TRASLASIERRA_REGION.categories as Category[]
            : isInPatagonia
            ? PATAGONIA_7_LAGOS_REGION.categories as Category[]
            : CATEGORIES;
    }, [townId]);
};
