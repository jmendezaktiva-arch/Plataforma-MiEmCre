const admin = require('firebase-admin');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
    });
}

const db = admin.firestore();

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

    try {
        const payload = JSON.parse(event.body);
        
        // 1. VALIDACIÓN DE ESTATUS (Según manual de XpertPay)
        if (payload.status_pago !== 'Pagado') {
            return { statusCode: 200, body: 'Estatus no procesable' };
        }

        // 2. RECUPERACIÓN DE TRAZABILIDAD (Búsqueda en registro_pagos)
        // El token_id o token_url identifica la transacción única
        const tokenId = payload.token_url || payload.token_id;
        const registroSnap = await db.collection('registro_pagos').doc(tokenId).get();

        if (!registroSnap.exists) {
            console.error(`🚨 Webhook: No se encontró registro para el token ${tokenId}`);
            return { statusCode: 200, body: 'Transacción no reconocida' };
        }

        const { uid, courseId } = registroSnap.data();

        // 3. ACTUALIZACIÓN DE ACCESOS Y EXPEDIENTE
        const userRef = db.collection('usuarios').doc(uid);
        const hoy = new Date();
        const unAnio = new Date(hoy.setFullYear(hoy.getFullYear() + 1));

        // Usamos FieldValue para asegurar que el ID se agregue al array sin duplicados
        await userRef.update({
            // Nivel 1: Motor de Acceso (Core)
            "accesos.cursos": admin.firestore.FieldValue.arrayUnion(courseId),
            
            // Nivel 2: Trazabilidad Administrativa (Expediente)
            [`expediente.servicios.${courseId}`]: {
                status: 'activo',
                fechaVencimiento: unAnio.toISOString(),
                modality: 'ONLINE',
                metodoAdquisicion: 'XpertPay',
                fechaActivacion: new Date().toISOString()
            }
        });

        // 4. CIERRE DE CICLO: Marcamos el registro de pago como completado
        await registroSnap.ref.update({ status: 'completado', fechaPago: payload.fecha_pago });

        console.log(`✅ Dreams Cloud: Acceso automatizado concedido a ${uid} para ${courseId}`);

        return { statusCode: 200, body: JSON.stringify({ message: "Sincronización exitosa" }) };

    } catch (error) {
        console.error("🚨 Error Crítico en Webhook:", error.message);
        return { statusCode: 200, body: JSON.stringify({ error: error.message }) };
    }
};