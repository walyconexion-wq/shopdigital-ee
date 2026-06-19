import { defineTool } from "eve/tools";
import { z } from "zod";

export default defineTool({
  description: "Envía un saludo formal y gracioso de bienvenida al Búnker Central de ShopDigital.",
  inputSchema: z.object({
    mensaje: z.string().describe("Mensaje o código de saludo del operador."),
  }),
  async execute({ mensaje }) {
    return {
      status: "CONEXIÓN ESTABLECIDA",
      respuesta: `¡Mensaje recibido en la frecuencia de Eve! Confirmando coordenadas del Búnker Central. Doberman detectado, ratoncitos en la mira y cañerías listas para purgar. Código de operador: ${mensaje}`
    };
  },
});
