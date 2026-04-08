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

        // TRACEABILIDAD DINÁMICA: Consultamos el catálogo para heredar la modalidad correcta
        const courseDoc = await db.collection('config_ecosistema').doc(courseId).get();
        const courseData = courseDoc.data() || {};
        const modalityReal = courseData.modality || 'ONLINE';

        await userRef.update({
            "accesos.cursos": admin.firestore.FieldValue.arrayUnion(courseId),
            
            [`expediente.servicios.${courseId}`]: {
                status: 'activo',
                fechaVencimiento: unAnio.toISOString(),
                modality: modalityReal, // Sincronización automática con el catálogo
                metodoAdquisicion: 'XpertPay (Automático)',
                fechaActivacion: new Date().toISOString()
            }
        });

        // 4. CIERRE DE CICLO: Marcamos el registro de pago como completado
        await registroSnap.ref.update({ status: 'completado', fechaPago: payload.fecha_pago });

        // 5. NOTIFICACIÓN AUTOMÁTICA (Handshake de Éxito)
        const axios = require('axios'); // Asegúrate de que axios esté disponible o usa fetch
        const { email, monto } = registroSnap.data();
        const userSnap = await db.collection('usuarios').doc(uid).get();
        const nombreCliente = userSnap.data()?.nombre || "Líder Dreams";
        
        // REUTILIZACIÓN DE TRAZABILIDAD: Usamos courseData definido en el Paso 3
        const tituloCurso = courseData.title || "Programa Estratégico";

        try {
            await axios.post(`${process.env.URL}/.netlify/functions/intervencion-notificacion`, {
                destinatario: email,
                cliente: { nombre: nombreCliente, email: email, uid: uid },
                servicio: { titulo: tituloCurso, id: courseId },
                tipo: 'PAGO_EXITOSO',
                omitirRegistroFirestore: true
            });
            console.log(`✉️ Email de bienvenida enviado a: ${email}`);
        } catch (mailErr) {
            console.error("⚠️ Fallo al disparar email de bienvenida:", mailErr.message);
        }

        console.log(`✅ Dreams Cloud: Acceso automatizado concedido a ${uid} para ${courseId}`);

        return { statusCode: 200, body: JSON.stringify({ message: "Sincronización exitosa" }) };

    } catch (error) {
        console.error("🚨 Error Crítico en Webhook:", error.message);
        return { statusCode: 200, body: JSON.stringify({ error: error.message }) };
    }
};