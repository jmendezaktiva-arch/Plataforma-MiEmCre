//netlify/functions/consultor-ia.js
// Nota: Utilizamos el Fetch API nativo de Node.js (disponible en v18+), 
// por lo que ya no es necesario importar 'node-fetch' como dependencia externa.

exports.handler = async (event, context) => {
    // 1. PROTOCOLO DE SEGURIDAD: Solo aceptamos peticiones POST
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Metodo no permitido" };
    }

    try {
        const { prompt, userContext } = JSON.parse(event.body);

        // 2. CONFIGURACIÓN DE GEMINI (La API KEY se lee desde las variables de Netlify)
        const API_KEY = process.env.GEMINI_API_KEY;
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

        // 3. CONSTRUCCIÓN DE LA BRÚJULA ESTRATÉGICA (Identidad Dinámica)
        const { why, how, what, valores, filtro_etico } = userContext.culturaInstitucional || {};
        const { nombre, empresa, diagnosticos } = userContext.usuario || {};

        const systemInstruction = `
            Actúa como el Consultor Senior de Mi Empresa Crece. Tu identidad se basa en:
            - PROPÓSITO (Why): ${why}
            - MÉTODO (How): ${how}
            - PRODUCTO (What): ${what}
            - VALORES: ${valores ? valores.join(', ') : 'Excelencia y Resiliencia'}
            - FILTRO ÉTICO: ${filtro_etico}

            ESTÁS HABLANDO CON: ${nombre} de la empresa "${empresa}".
            CONTEXTO DEL CLIENTE (Diagnósticos): ${JSON.stringify(diagnosticos)}

            REGLAS DE ORO:
            1. Responde con el tono "Prestige": elegante, minimalista y de alta autoridad.
            2. Usa los datos de sus diagnósticos para dar consejos quirúrgicos y específicos.
            3. Si una consulta del cliente contradice el FILTRO ÉTICO, redirígelo diplomáticamente hacia la sostenibilidad y el propósito.
            4. No menciones que eres una IA; tú eres el Consultor Estratégico de Mi Empresa Crece Platform.
        `;

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: `${systemInstruction}\n\nPregunta del cliente: ${prompt}` }]
                }]
            })
        });

        const data = await response.json();
        const aiResponse = data.candidates[0].content.parts[0].text;

        return {
            statusCode: 200,
            body: JSON.stringify({ text: aiResponse })
        };

    } catch (error) {
        console.error("🚨 Error en Función IA:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Fallo en el motor de inteligencia" })
        };
    }
};