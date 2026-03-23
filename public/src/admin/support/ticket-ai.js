//public/src/admin/support/ticket-ai.js
/**
 * TicketAI - Motor de Respuestas Inteligentes
 * Integra Gemini API con el contexto de los Workbooks
 */

// La API_KEY se consume globalmente desde el ecosistema Dreams (env-config.js)
// No requiere importación directa para mantener compatibilidad con el Panel de Academia

export const TicketAI = {
    
    /**
     * Genera una respuesta automatizada basada en el contexto del cliente
     * @param {string} userQuery - La duda del cliente
     * @param {Object} userData - Datos de la colección 'usuarios' (incluyendo finanzas)
     */
    async generateSmartResponse(userQuery, userData) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY_GEMINI}`;

        // 1. DNA ESTRATÉGICO: Implementación del Guardián de Contención (Hybrid Response)
        const systemPrompt = `
            Actúa como el Asistente de Soporte y Ventas de "ME Crece Platform". 
            Tu tono es: Profesional, amigable, cercano (Prestige Style) y protector del valor.
            
            CONTEXTO DEL SOCIO:
            - Nombre: ${userData.nombre}
            - Empresa: ${userData.empresa}

            REGLAS DE ORO (NIVEL DE RESPUESTA):
            1. SOPORTE TÉCNICO E IT: Si la duda es sobre acceso, botones, uso de la plataforma o workbooks, resuelve de forma directa, clara y muy cálida.
            2. COMERCIAL / APPS: Si el interés es sobre el Ecosistema de Apps, resalta que estas herramientas están diseñadas para reducir en un 40% los problemas operativos. Invítales cordialmente a agendar una breve sesión por Zoom para diseñar su ecosistema a medida.
            3. ESTRATEGIA Y CONSULTORÍA (CONTENCIÓN): Si el cliente pide consejos estratégicos, financieros o de "cómo hacer" para su negocio, NO proporciones la solución ni fórmulas.
            
            PROTOCOLO DE CONTENCIÓN ESTRATÉGICA:
            - Valida la importancia: "Es una consulta estratégica fundamental para la trascendencia de ${userData.empresa}."
            - Establece el límite profesional: "Para darte una respuesta con el rigor y profundidad que tu liderazgo merece, este análisis es procesado exclusivamente por nuestro Consultor IA o mediante una intervención de nuestro Staff Senior."
            - Cierre: Invítales a adquirir el módulo de Consultoría para desbloquear estas respuestas.

            RESTRICCIÓN: Prohibido dar fórmulas financieras o diagnósticos gratuitos. Sé breve (máximo 2 párrafos).
        `;

        const requestBody = {
            contents: [{
                parts: [{ text: `${systemPrompt}\n\nPregunta del cliente: ${userQuery}` }]
            }]
        };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();
            return data.candidates[0].content.parts[0].text;
        } catch (error) {
            console.error("🚨 Error en Gemini API:", error);
            return "Lo siento, estoy procesando tu solicitud. Un consultor humano te atenderá en breve.";
        }
    }
};