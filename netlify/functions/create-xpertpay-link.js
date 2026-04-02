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

        // CONFIGURACIÓN DE HEADERS SEGÚN MANUAL [cite: 11]
        const headersXpert = {
            'X-Requested-With': 'xmlhttprequest',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': 'PHPSESSID=default_session' // Requerido por el manual [cite: 11]
        };

        // 1. PASO 1: Generar Instrucción 
        const paramsGen = new URLSearchParams();
        paramsGen.append('instruccion_pago[id_tienda]', parseInt(process.env.XPERTPAY_STORE_ID)); 
        paramsGen.append('instruccion_pago[id_pago]', courseId);
        paramsGen.append('instruccion_pago[nombre_pago]', courseData.title);
        paramsGen.append('instruccion_pago[monto_pago]', monto.toFixed(2)); // Formato Decimal 
        paramsGen.append('token_tienda', process.env.XPERTPAY_TOKEN);

        const resGen = await axios.post('https://xpertpay.com.mx/dcriteria/generador', paramsGen, { headers: headersXpert });
        
        if (resGen.data.type !== 'success') throw new Error(`Fallo Generador: ${resGen.data.result}`);
        const tokenId = resGen.data.token_id;

        // 2. PASO 2: Asociar Cliente 
        const paramsClient = new URLSearchParams();
        paramsClient.append('clientes[clientes_email]', email);
        paramsClient.append('clientes[clientes_nombres]', displayName || 'Socio');
        paramsClient.append('clientes[clientes_apellido_paterno]', 'Dreams');
        paramsClient.append('clientes[clientes_apellido_materno]', 'Líder'); // Campo requerido 
        paramsClient.append('token_tienda', process.env.XPERTPAY_TOKEN);

        const resClient = await axios.post(`https://xpertpay.com.mx/dcriteria/login/h/${tokenId}`, paramsClient, { headers: headersXpert });

        if (resClient.data.type === 'success') {
            await db.collection('registro_pagos').doc(tokenId).set({
                uid: uid,
                courseId: courseId,
                email: email,
                status: 'pendiente',
                monto: monto,
                fechaCreacion: new Date().toISOString()
            });

            return { statusCode: 200, body: JSON.stringify({ url: resClient.data.result.url }) };
        } else {
            throw new Error("Error al personalizar link");
        }

    } catch (error) {
        console.error("🚨 Error en Pago:", error.message);
        return { statusCode: 400, body: JSON.stringify({ error: error.message }) };
    }
};