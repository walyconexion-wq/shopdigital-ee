/**
 * 🏭 INYECTOR DE EMPRESA DE PRUEBA B2B
 * Distribuidora de Bebidas Mayorista — Zona Sur, Esteban Echeverría
 * 
 * Para ejecutar: importar y llamar desde la consola del navegador o desde el MasterPanel.
 */
import { guardarComercio } from '../firebase';

export const inyectarEmpresaPruebaB2B = async () => {
    const empresaPrueba = {
        id: 'ent-distribuidora-del-sur-bebidas',
        slug: 'distribuidora-del-sur-bebidas',
        name: 'Distribuidora Del Sur — Bebidas',
        category: 'ent-bebidas',
        specialty: 'Distribución mayorista de bebidas con alcohol y sin alcohol. Gaseosas, aguas, cervezas, vinos y espirituosas. Entrega puerta a puerta en Zona Sur GBA.',
        entityType: 'enterprise',
        reach: 'regional',
        zone: 'Luis Guillón, Esteban Echeverría',
        province: 'buenos-aires',
        region: 'zona-sur',
        address: 'Camino de Cintura 4200, Luis Guillón, Buenos Aires',
        phone: '1155667788',
        ownerName: 'Roberto Fernández',
        image: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400&h=300&fit=crop',
        bannerImage: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800&h=400&fit=crop',
        description: 'Somos la distribuidora mayorista líder en Zona Sur. Más de 15 años abasteciendo almacenes, kioscos, restaurantes y bares con las mejores marcas de bebidas a precios de fábrica. Hacemos entregas semanales puerta a puerta. Consultanos por WhatsApp para lista de precios actualizada.',
        mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3278.123!2d-58.445!3d-34.785!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzTCsDQ3JzA2LjAiUyA1OMKwMjYnNDIuMCJX!5e0!3m2!1ses!2sar!4v1',
        instagram: '@distribuidoradelsur',
        facebook: '',
        tiktok: '',
        rating: 4.8,
        isActive: true,
        townId: 'esteban-echeverria',
        offers: [],
        verified: true,
    };

    try {
        await guardarComercio(empresaPrueba, 'esteban-echeverria');
        console.log('✅ [B2B] Empresa de prueba inyectada exitosamente:', empresaPrueba.name);
        return true;
    } catch (error) {
        console.error('❌ [B2B] Error inyectando empresa de prueba:', error);
        return false;
    }
};
