//netlify/functions/intervencion-notificacion.js
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

// Inicialización de Firebase Admin (Control de Trazabilidad)
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
    });
}

const db = admin.firestore();

exports.handler = async (event) => {
    // Protocolo de Seguridad: Solo aceptamos peticiones POST
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Método no permitido' };
    }

    try {
        const { destinatario, cliente, servicio } = JSON.parse(event.body);

        // Validación de Integridad: Asegurar que existan los datos mínimos para la trazabilidad
        if (!destinatario || !cliente?.email || !servicio?.id) {
            console.error("🚨 Payload incompleto: Se requiere destinatario, datos de cliente y servicio.");
            return { statusCode: 400, body: JSON.stringify({ error: "Datos de solicitud insuficientes" }) };
        }

        // 1. REGISTRO INTELIGENTE (Prevención de Duplicados y Alineación de Esquema)
        const { omitirRegistroFirestore } = JSON.parse(event.body);
        let solicitudId = "email_only";

        if (!omitirRegistroFirestore) {
            const solicitudRef = db.collection('solicitudes_contacto').doc();
            solicitudId = solicitudRef.id;
            
            // TRACEABILIDAD: Alineamos los campos exactamente con lo que el Admin Panel espera leer
            await solicitudRef.set({
                usuarioId: cliente.uid,
                email: cliente.email,
                nombre: cliente.nombre,
                interes: servicio.titulo,
                servicioId: servicio.id,
                estado: "pendiente",
                fechaEnvio: new Date().toISOString(),
                canal: "Netlify Function (Fallback)"
            });
            console.log(`✅ Registro creado en Firestore: ${solicitudId}`);
        } else {
            console.log("ℹ️ Registro omitido en Cloud: El cliente ya sincronizó localmente.");
        }

        // 2. CONFIGURACIÓN DE AVISO AUTOMÁTICO (Correo Prestige)
        // Se utilizan variables de entorno de Netlify por seguridad
        const transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: process.env.MAIL_PORT,
            secure: true,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            }
        });

        const mailOptions = {
            from: `"Dreams Platform" <${process.env.MAIL_USER}>`,
            to: destinatario,
            subject: `🚀 Nueva Solicitud de Intervención: ${servicio.titulo}`,
            html: `
                <div style="font-family: 'Montserrat', sans-serif; color: #0F3460; padding: 30px; border-top: 6px solid #957C3D; background: #fdfdfd;">
                    <h2 style="font-weight: 900; letter-spacing: 1px;">ALERTA DE CONSULTORÍA</h2>
                    <p style="font-size: 1rem;">Se ha detectado una nueva solicitud estratégica desde la plataforma:</p>
                    <div style="background: #fff; padding: 20px; border-radius: 12px; border: 1px solid #eee; margin: 20px 0;">
                        <p><strong>Líder / Empresa:</strong> ${cliente.nombre}</p>
                        <p><strong>Email de Contacto:</strong> ${cliente.email}</p>
                        <p><strong>Servicio Solicitado:</strong> ${servicio.titulo}</p>
                        <p><strong>Ticket de Rastreo:</strong> <span style="color: #957C3D; font-weight: 700;">${solicitudRef.id}</span></p>
                    </div>
                    <hr style="border: 0.5px solid rgba(15, 52, 96, 0.1); margin: 30px 0;">
                    <p style="font-size: 0.75rem; color: #999; font-style: italic;">Este es un aviso automático generado por Dreams Intelligence. Los datos ya están disponibles en tu Panel Maestro.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Sincronización y notificación completadas' })
        };

    } catch (error) {
        console.error('🚨 Error Crítico en Función de Notificación:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Fallo en la comunicación del servidor' })
        };
    }
};