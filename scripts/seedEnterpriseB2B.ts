/**
 * 🏭 INYECTOR DE EMPRESA DE PRUEBA B2B
 * Distribuidora de Bebidas Mayorista — Zona Sur, Esteban Echeverría
 * 
 * Para ejecutar: importar y llamar desde la consola del navegador o desde el MasterPanel.
 */
import { guardarComercio } from '../firebase';

export const inyectarEmpresaPruebaB2B = async () => {
    const empresaPrueba = {
        id: 'ent-embutidos-monte-grande',
        slug: 'embutidos-monte-grande',
        name: 'Embutidos Monte Grande S.R.L.',
        category: 'ent-alimentos',
        specialty: 'Fábrica mayorista de embutidos y chacinados. Venta directa de fábrica a comercios, almacenes, carnicerías y restaurantes.',
        entityType: 'enterprise',
        reach: 'regional',
        zone: 'Monte Grande, Esteban Echeverría',
        province: 'buenos-aires',
        region: 'zona-sur',
        address: 'Av. Enrique Santamarina 440, B1842 Monte Grande, Pcia. de Buenos Aires',
        phone: '1141792134',
        ownerName: 'Embutidos Monte Grande S.R.L.',
        image: 'https://lh3.googleusercontent.com/gps-cs-s/APNQkAFW_DwehRWqr6azXnpgkRWLBOcVKBC_5GNrCSPemAFiDcTlOd6KusGcQ0e0lP61o0wUDcL_lJsju2sMWqTcAMyBW5tb_Zo18tb2yrsbsD58uCr2E-zUcRmajkj2GVyl9GtxQHBETQ=w529-h298-k-no',
        bannerImage: 'https://lh3.googleusercontent.com/gps-cs-s/APNQkAFW_DwehRWqr6azXnpgkRWLBOcVKBC_5GNrCSPemAFiDcTlOd6KusGcQ0e0lP61o0wUDcL_lJsju2sMWqTcAMyBW5tb_Zo18tb2yrsbsD58uCr2E-zUcRmajkj2GVyl9GtxQHBETQ=w529-h298-k-no',
        description: 'Fábrica de embutidos y chacinados con más de 30 años en el mercado. Producción propia de salames, chorizos, morcillas, bondiolas y más. Venta al por mayor directo de fábrica. Atención a comercios, carnicerías, almacenes, restaurantes y distribuidores. Horario: Lun-Vie 7am-2pm · Sáb 7am-12:30pm.',
        mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d64482.02757175802!2d-58.508490385819464!3d-34.82411009566398!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bcd1677fdc2503%3A0xa412974da80b54f3!2sEmbutidos%20Monte%20Grande%20S.R.L.!5e1!3m2!1ses-419!2sar!4v1779232930823!5m2!1ses-419!2sar',
        website: 'http://www.embutidosmontegrande.com.ar/',
        instagram: '',
        facebook: '',
        tiktok: '',
        rating: 4.4,
        isActive: true,
        townId: 'esteban-echeverria',
        offers: [],
        verified: true,
        schedule: 'Lun-Vie 7am-2pm · Sáb 7am-12:30pm · Dom Cerrado',
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
