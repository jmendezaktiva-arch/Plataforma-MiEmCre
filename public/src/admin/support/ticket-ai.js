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

        // Construcción del Contexto Maestro (Prompt Engineering)
        const systemPrompt = `
            Actúa como un Consultor Senior de "Process Designer". 
            Tu tono es: Profesional, exclusivo (estilo Prestige), analítico y motivador.
            Contexto del Cliente:
            - Nombre: ${userData.nombre}
            - Empresa: ${userData.empresa}
            - Datos Financieros: Punto de Equilibrio ${userData.expediente?.pe || 'No calculado'}.
            - Objetivo: Escalar la PyME mediante procesos.

            Instrucción: Responde a la duda del cliente usando la metodología de la plataforma. 
            Si la duda es financiera, usa la fórmula: Ventas = Gastos Fijos / Margen.
            Sé breve (máximo 2 párrafos).
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