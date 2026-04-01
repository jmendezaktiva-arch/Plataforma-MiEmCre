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

        // 1. OBTENER DATA DEL PRODUCTO
        const courseDoc = await db.collection('config_ecosistema').doc(courseId).get();
        if (!courseDoc.exists) throw new Error("Producto no encontrado");
        
        const courseData = courseDoc.data();
        const monto = courseData.price || 0; 

        // 2. PASO 1 XPERTPAY: Generar Instrucción
        const paramsGen = new URLSearchParams();
        paramsGen.append('instruccion_pago[id_tienda]', process.env.XPERTPAY_STORE_ID);
        paramsGen.append('instruccion_pago[id_pago]', courseId); // ID interno [cite: 14]
        paramsGen.append('instruccion_pago[nombre_pago]', courseData.title);
        paramsGen.append('instruccion_pago[monto_pago]', monto);
        paramsGen.append('token_tienda', process.env.XPERTPAY_TOKEN);

        const resGen = await axios.post('https://xpertpay.com.mx/dcriteria/generador', paramsGen, {
            headers: { 'X-Requested-With': 'xmlhttprequest' } // Header obligatorio [cite: 11]
        });
        
        if (resGen.data.type !== 'success') throw new Error("Fallo en Generador");
        const tokenId = resGen.data.token_id;

        // 3. PASO 2 XPERTPAY: Asociar Cliente y Link Personalizado
        const paramsClient = new URLSearchParams();
        paramsClient.append('clientes[clientes_email]', email);
        paramsClient.append('clientes[clientes_nombres]', displayName || 'Socio');
        paramsClient.append('clientes[clientes_apellido_paterno]', 'Dreams');
        paramsClient.append('token_tienda', process.env.XPERTPAY_TOKEN);

        const resClient = await axios.post(`https://xpertpay.com.mx/dcriteria/login/h/${tokenId}`, paramsClient, {
            headers: { 'X-Requested-With': 'xmlhttprequest' } // [cite: 59]
        });

        if (resClient.data.type === 'success') {
            // --- AJUSTE QUIRÚRGICO: REGISTRO DE TRAZABILIDAD PARA WEBHOOK ---
            await db.collection('registro_pagos').doc(tokenId).set({
                uid: uid,
                courseId: courseId,
                email: email,
                status: 'pendiente',
                monto: monto,
                fechaCreacion: new Date().toISOString()
            });

            return {
                statusCode: 200,
                body: JSON.stringify({ url: resClient.data.result.url })
            };
        } else {
            throw new Error("Error al personalizar link");
        }

    } catch (error) {
        console.error("🚨 Error en Pago:", error.message);
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};