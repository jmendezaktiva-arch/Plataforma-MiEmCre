const admin = require('firebase-admin');
const axios = require('axios'); 

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
    });
}

const db = admin.firestore();

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

    try {
        const { courseId, uid, email, displayName } = JSON.parse(event.body);
        const courseDoc = await db.collection('config_ecosistema').doc(courseId).get();
        if (!courseDoc.exists) throw new Error("Producto no encontrado");
        
        const courseData = courseDoc.data();
        const monto = parseFloat(courseData.price) || 0; 

        // --- AJUSTE: Convertimos el ID de texto a un número entero para XpertPay ---
        // Usamos un algoritmo simple para generar un número único basado en el texto del ID
        // Normalizamos el ID (Slug) para garantizar que el hash numérico sea determinístico
const normalizedId = String(courseId).trim().toUpperCase();
const idNumericoSimple = Math.abs(normalizedId.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0)) % 100000;

        // Generamos un ID de sesión compatible con PHP (Alfanumérico sin caracteres especiales)
        const headersXpert = {
            'X-Requested-With': 'xmlhttprequest',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': 'PHPSESSID=dreamsPlatform2026Session' 
        };

        // PASO 1: Generador
        const paramsGen = new URLSearchParams();
        paramsGen.append('instruccion_pago[id_tienda]', parseInt(process.env.XPERTPAY_STORE_ID)); 
        paramsGen.append('instruccion_pago[id_pago]', idNumericoSimple); // Ahora es un Entero 
        paramsGen.append('instruccion_pago[nombre_pago]', courseData.title);
        paramsGen.append('instruccion_pago[monto_pago]', monto.toFixed(2));
        paramsGen.append('token_tienda', process.env.XPERTPAY_TOKEN);

        console.log("📡 Enviando Paso 1 a XpertPay...");
        const resGen = await axios.post('https://xpertpay.com.mx/dcriteria/generador', paramsGen, { headers: headersXpert });
        
        if (resGen.data.type !== 'success') {
            console.error("❌ XpertPay Gen Error:", resGen.data.result);
            throw new Error(`XpertPay: ${resGen.data.result}`);
        }

        // TRACEABILIDAD: Corregimos la ruta del token según el estándar del proveedor (res.data.result.token_id)
        const tokenId = resGen.data.result?.token_id || resGen.data.token_id;

        if (!tokenId) {
            console.error("🚨 Error Crítico: XpertPay no devolvió un token_id válido.", resGen.data);
            throw new Error("No se recibió identificador de pago del proveedor.");
        }

        // PASO 2: Asociación
        const paramsClient = new URLSearchParams();
        paramsClient.append('clientes[clientes_email]', email);
        // Aseguramos nombres y apellidos limpios para cumplir con el validador de XpertPay 
        const nombreLimpio = (displayName || 'Líder').split(' ')[0];
        const apellidoLimpio = (displayName || 'Dreams').split(' ')[1] || 'Socio';

        paramsClient.append('clientes[clientes_nombres]', nombreLimpio);
        paramsClient.append('clientes[clientes_apellido_paterno]', apellidoLimpio);
        paramsClient.append('clientes[clientes_apellido_materno]', 'Dreams Platform');
        paramsClient.append('token_tienda', process.env.XPERTPAY_TOKEN);

        console.log("📡 Enviando Paso 2 a XpertPay...");
        const resClient = await axios.post(`https://xpertpay.com.mx/dcriteria/login/h/${tokenId}`, paramsClient, { headers: headersXpert });

        if (resClient.data.type === 'success') {
            await db.collection('registro_pagos').doc(tokenId).set({
                uid, courseId, email, status: 'pendiente', monto, fechaCreacion: new Date().toISOString()
            });
            return { statusCode: 200, body: JSON.stringify({ url: resClient.data.result.url }) };
        } else {
            throw new Error("Fallo en personalización del link");
        }

    } catch (error) {
        // --- LOG DETALLADO: Esto nos dirá qué campo exacto falta ---
        const errorData = error.response ? JSON.stringify(error.response.data) : error.message;
        console.error("🚨 DETALLE DEL ERROR 400:", errorData);
        
        return { 
            statusCode: 400, 
            body: JSON.stringify({ error: "Error de validación con la pasarela", detalle: errorData }) 
        };
    }
};