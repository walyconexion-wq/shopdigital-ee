import React, { createContext, useContext, useState } from 'react';

export type Language = 'es' | 'en' | 'pt';

interface LanguageContextProps {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string, variables?: Record<string, string>) => string;
}

const translations: Record<Language, Record<string, string>> = {
    es: {
        "RED COMERCIAL DIGITAL": "RED COMERCIAL DIGITAL",
        "Tu guía de ofertas locales": "Tu guía de ofertas locales",
        "HORA": "HORA",
        "FECHA": "FECHA",
        "VISITAS": "VISITAS",
        "CLIMA": "CLIMA",
        "Suscribir Comercio": "Suscribir Comercio",
        "Asistente IA": "Asistente IA",
        "En línea y lista para guiarte": "En línea y lista para guiarte",
        "Comida Rápida": "Comida Rápida",
        "Ver Catálogo": "Ver Catálogo",
        "Volver": "Volver",
        "Buscar comercios...": "Buscar comercios...",
        "Mi Catálogo": "Mi Catálogo",
        "Escanear QR": "Escanear QR",
        "Contacto": "Contacto",
        "Dirección": "Dirección",
        "Teléfono": "Teléfono",
        "Calificación": "Calificación",
        "Compartir": "Compartir",
        "Llamar": "Llamar",
        "Enviar WhatsApp": "Enviar WhatsApp",
        "Ver Oferta": "Ver Oferta",
        "Válido hasta": "Válido hasta",
        "Redes Sociales": "Redes Sociales",
        "Días y Horarios": "Días y Horarios",
        "Configuración": "Configuración",
        "Modo Noche": "Modo Noche",
        "Modo Día": "Modo Día",
        "Fondo": "Fondo",
        "Disfrutá los catálogos y ofertas locales": "Disfrutá los catálogos y ofertas locales",
        "Categorías": "Categorías",
        "No se encontraron comercios": "No se encontraron comercios en esta categoría",
        "Ofertas Destacadas": "Ofertas Destacadas",
        "Mi Comercio": "Mi Comercio",
        "Panel de Autogestión": "Panel de Autogestión",
        "Validar Cliente": "Validar Cliente",
        "Acerca de Nosotros": "Acerca de Nosotros",
        "Buscar...": "Buscar...",
        "Volver al Inicio": "Volver al Inicio",
        "Cargando bóveda comercial...": "Cargando bóveda comercial...",
        "RED COMERCIAL DIGITAL · ARGENTINA": "RED COMERCIAL DIGITAL · ARGENTINA",
        "Preguntame lo que quieras": "Preguntame lo que quieras",
        
        // Categorías
        "Pizzerías": "Pizzerías",
        "Restaurantes": "Restaurantes",
        "Cervecerías": "Cervecerías",
        "Heladerías": "Heladerías",
        "Gastronomías": "Gastronomías",
        "Mercados": "Mercados",
        "Indumentarias": "Indumentarias",
        "Tecnología": "Tecnología",
        "Hogar": "Hogar",
        "Barberías": "Barberías",
        "Peluquerías": "Peluquerías",
        "Gimnasios": "Gimnasios",
        "Ferreterías": "Ferreterías",
        "Mascotas": "Mascotas",
        "Tatuajes": "Tatuajes",
        "Estéticas": "Estéticas",
        "Inmobiliarias": "Inmobiliarias",
        "Automotor": "Automotor",
        "Regalería": "Regalería",
        "Finanzas": "Finanzas",
        "Servicios y Profesionales": "Servicios y Profesionales",
        "Automotor y Motos": "Automotor y Motos",
        "Farmacias": "Farmacias"
    },
    en: {
        "RED COMERCIAL DIGITAL": "DIGITAL COMMERCIAL NETWORK",
        "Tu guía de ofertas locales": "Your guide to local offers",
        "HORA": "TIME",
        "FECHA": "DATE",
        "VISITAS": "VISITS",
        "CLIMA": "WEATHER",
        "Suscribir Comercio": "Register Business",
        "Asistente IA": "AI Assistant",
        "En línea y lista para guiarte": "Online and ready to guide you",
        "Comida Rápida": "Fast Food",
        "Ver Catálogo": "View Catalog",
        "Volver": "Back",
        "Buscar comercios...": "Search businesses...",
        "Mi Catálogo": "My Catalog",
        "Escanear QR": "Scan QR",
        "Contacto": "Contact",
        "Dirección": "Address",
        "Teléfono": "Phone",
        "Calificación": "Rating",
        "Compartir": "Share",
        "Llamar": "Call",
        "Enviar WhatsApp": "Send WhatsApp",
        "Ver Oferta": "View Offer",
        "Válido hasta": "Valid until",
        "Redes Sociales": "Social Networks",
        "Días y Horarios": "Days & Hours",
        "Configuración": "Settings",
        "Modo Noche": "Night Mode",
        "Modo Día": "Day Mode",
        "Fondo": "Background",
        "Disfrutá los catálogos y ofertas locales": "Enjoy local catalogs & offers",
        "Categorías": "Categories",
        "No se encontraron comercios": "No businesses found in this category",
        "Ofertas Destacadas": "Featured Offers",
        "Mi Comercio": "My Business",
        "Panel de Autogestión": "Self-Management Panel",
        "Validar Cliente": "Validate Client",
        "Acerca de Nosotros": "About Us",
        "Buscar...": "Search...",
        "Volver al Inicio": "Back to Home",
        "Cargando bóveda comercial...": "Loading business vault...",
        "RED COMERCIAL DIGITAL · ARGENTINA": "DIGITAL COMMERCIAL NETWORK · ARGENTINA",
        "Preguntame lo que quieras": "Ask me anything",

        // Categorías
        "Pizzerías": "Pizzerias",
        "Restaurantes": "Restaurants",
        "Cervecerías": "Breweries",
        "Heladerías": "Ice Cream Shops",
        "Gastronomías": "Gastronomy",
        "Mercados": "Markets",
        "Indumentarias": "Clothing",
        "Tecnología": "Technology",
        "Hogar": "Home",
        "Barberías": "Barbershops",
        "Peluquerías": "Hair Salons",
        "Gimnasios": "Gyms",
        "Ferreterías": "Hardware Stores",
        "Mascotas": "Pets",
        "Tatuajes": "Tattoos",
        "Estéticas": "Aesthetics",
        "Inmobiliarias": "Real Estate",
        "Automotor": "Automotive",
        "Regalería": "Gift Shops",
        "Finanzas": "Finance",
        "Servicios y Profesionales": "Services & Professionals",
        "Automotor y Motos": "Automotive & Bikes",
        "Farmacias": "Pharmacies"
    },
    pt: {
        "RED COMERCIAL DIGITAL": "REDE COMERCIAL DIGITAL",
        "Tu guía de ofertas locales": "Seu guia de ofertas locais",
        "HORA": "HORA",
        "FECHA": "DATA",
        "VISITAS": "VISITAS",
        "CLIMA": "CLIMA",
        "Suscribir Comercio": "Cadastrar Comércio",
        "Asistente IA": "Assistente IA",
        "En línea y lista para guiarte": "Online e pronta para guiar você",
        "Comida Rápida": "Fast Food",
        "Ver Catálogo": "Ver Catálogo",
        "Volver": "Voltar",
        "Buscar comercios...": "Buscar comércios...",
        "Mi Catálogo": "Meu Catálogo",
        "Escanear QR": "Escanear QR",
        "Contacto": "Contato",
        "Dirección": "Endereço",
        "Teléfono": "Telefone",
        "Calificación": "Avaliação",
        "Compartir": "Compartilhar",
        "Llamar": "Ligar",
        "Enviar WhatsApp": "Enviar WhatsApp",
        "Ver Oferta": "Ver Oferta",
        "Válido hasta": "Válido até",
        "Redes Sociales": "Redes Sociais",
        "Días y Horarios": "Dias e Horários",
        "Configuración": "Configurações",
        "Modo Noche": "Modo Noite",
        "Modo Día": "Modo Dia",
        "Fondo": "Fundo",
        "Disfrutá los catálogos y ofertas locales": "Aproveite os catálogos e ofertas locais",
        "Categorías": "Categorias",
        "No se encontraron comercios": "Nenhum comércio encontrado nesta categoria",
        "Ofertas Destacadas": "Ofertas em Destaque",
        "Mi Comercio": "Meu Comércio",
        "Panel de Autogestión": "Painel de Autogestão",
        "Validar Cliente": "Validar Cliente",
        "Acerca de Nosotros": "Sobre Nós",
        "Buscar...": "Buscar...",
        "Volver al Inicio": "Voltar ao Início",
        "Cargando bóveda comercial...": "Carregando cofre comercial...",
        "RED COMERCIAL DIGITAL · ARGENTINA": "REDE COMERCIAL DIGITAL · ARGENTINA",
        "Preguntame lo que quieras": "Pergunte-me o que quiser",

        // Categorías
        "Pizzerías": "Pizzarias",
        "Restaurantes": "Restaurantes",
        "Cervecerías": "Cervejarias",
        "Heladerías": "Sorveterias",
        "Gastronomías": "Gastronomia",
        "Mercados": "Mercados",
        "Indumentarias": "Vestuário",
        "Tecnología": "Tecnologia",
        "Hogar": "Lar",
        "Barberías": "Barbearias",
        "Peluquerías": "Salões de Beleza",
        "Gimnasios": "Academias",
        "Ferreterías": "Ferragens",
        "Mascotas": "Mascotes",
        "Tatuajes": "Tatuagens",
        "Estéticas": "Estética",
        "Inmobiliarias": "Imobiliárias",
        "Automotor": "Automotivo",
        "Regalería": "Lojas de Presentes",
        "Finanzas": "Finanças",
        "Servicios y Profesionales": "Serviços e Profissionais",
        "Automotor y Motos": "Automotivo e Motos",
        "Farmacias": "Farmácias"
    }
};

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>(() => {
        // Detect browser language dynamically
        const browserLang = navigator.language || (navigator as any).userLanguage || 'es';
        if (browserLang.toLowerCase().startsWith('pt')) return 'pt';
        if (browserLang.toLowerCase().startsWith('en')) return 'en';
        return 'es';
    });

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
    };

    const t = (key: string, variables?: Record<string, string>): string => {
        let text = translations[language]?.[key] || translations['es']?.[key] || key;
        if (variables) {
            Object.entries(variables).forEach(([k, v]) => {
                text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
            });
        }
        return text;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
