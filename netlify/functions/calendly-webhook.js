//netlify/functions/calendly-webhook.js
// Actualiza solicitudes cuando el cliente agenda desde agendar.html (iframe Calendly enlazado también desde Apps y correos intervencion-notificacion).
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
        const inviteeEmail = payload.payload.email;
        const eventDate = payload.payload.start_time;

        // TRACEABILIDAD: Buscamos la solicitud más reciente en 'pendiente' para este correo
        const solicitudesRef = db.collection('solicitudes_contacto');
        const snapshot = await solicitudesRef
            .where('email', '==', inviteeEmail)
            .where('estado', '==', 'pendiente')
            .orderBy('fechaEnvio', 'desc')
            .limit(1)
            .get();

        if (snapshot.empty) {
            console.log(`ℹ️ Calendly: No se halló solicitud pendiente para ${inviteeEmail}`);
            return { statusCode: 200, body: "Email no coincide con leads activos" };
        }

        const docId = snapshot.docs[0].id;
        await solicitudesRef.doc(docId).update({
            estado: 'agendado',
            fechaCitaZoom: eventDate,
            ultimaSincronizacion: new Date().toISOString()
        });

        console.log(`✅ Trazabilidad Actualizada: ${inviteeEmail} agendó para ${eventDate}`);
        return { statusCode: 200, body: "Sincronización Exitosa" };

    } catch (error) {
        console.error("🚨 Error en Calendly Webhook:", error.message);
        return { statusCode: 500, body: "Error Interno" };
    }
};