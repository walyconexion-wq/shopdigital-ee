import { VercelRequest, VercelResponse } from '@vercel/node';

// Configuración de Firestore REST API
const PROJECT_ID = "shopdigital-ee";
const COLLECTION = "comercios";

export default async function (req: VercelRequest, res: VercelResponse) {
    const { category, shop: shopSlug, path } = req.query;

    if (!shopSlug) {
        return res.redirect('/');
    }

    try {
        // Consultar Firestore por slug
        const response = await fetch(`https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery`, {
            method: 'POST',
            body: JSON.stringify({
                structuredQuery: {
                    from: [{ collectionId: COLLECTION }],
                    where: {
                        fieldFilter: {
                            field: { fieldPath: "slug" },
                            op: "EQUAL",
                            value: { stringValue: shopSlug }
                        }
                    },
                    limit: 1
                }
            })
        });

        const data = await response.json();
        const shopDoc = data[0]?.document?.fields;

        if (!shopDoc) {
            return res.redirect('/');
        }

        // Extraer datos (Firestore REST devuelve los campos con tipos anidados: { name: { stringValue: "..." } })
        const name = shopDoc.name?.stringValue || "Comercio";
        const specialty = shopDoc.specialty?.stringValue || "Ofertas increíbles";
        const zone = shopDoc.zone?.stringValue || "nuestra app";
        const bannerImage = shopDoc.bannerImage?.stringValue || shopDoc.image?.stringValue || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200";

        // Determinar URL final de redirección exacta
        const pathPart = path ? `/${path}` : '';
        const destinationUrl = `/${category}/${shopSlug}${pathPart}`;

        // Textos Dinámicos
        const titleText = `${name} - Catálogo`;
        const descriptionText = `Descubrí las mejores ofertas en ${zone}. Pedidos directos por WhatsApp.`;

        // Template HTML con Meta Tags Inyectados
        const html = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- Meta Tags Dinámicos (Marca Blanca) -->
    <title>${titleText}</title>
    <meta name="description" content="${descriptionText}">

    <!-- Open Graph / Facebook / WhatsApp -->
    <meta property="og:type" content="website">
    <meta property="og:title" content="${titleText}">
    <meta property="og:description" content="${descriptionText}">
    <meta property="og:image" content="${bannerImage}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:site_name" content="ShopDigital.ar">

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${titleText}">
    <meta name="twitter:description" content="${descriptionText}">
    <meta name="twitter:image" content="${bannerImage}">

    <meta http-equiv="refresh" content="0;url=${destinationUrl}">
</head>
<body style="background: #000; color: #fff; display: flex; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif;">
    <div style="text-align: center;">
        <h2>Cargando Catálogo de ${name}...</h2>
        <p>Redirigiendo a tu enlace...</p>
    </div>
    <script>
        setTimeout(() => {
            window.location.href = "${destinationUrl}";
        }, 100);
    </script>
</body>
</html>`;

        res.setHeader('Content-Type', 'text/html');
        return res.status(200).send(html);

    } catch (error) {
        console.error("Error in OG Injector:", error);
        return res.redirect('/');
    }
}
