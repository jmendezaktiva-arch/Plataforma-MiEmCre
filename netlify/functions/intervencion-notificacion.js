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

    // MONITOREO DE TRAZABILIDAD: Verificación de Variables de Entorno
    const variablesCriticas = ['MAIL_HOST', 'MAIL_USER', 'MAIL_PASS', 'FIREBASE_SERVICE_ACCOUNT'];
    const faltantes = variablesCriticas.filter(v => !process.env[v]);

    if (faltantes.length > 0) {
        console.error(`🚨 ERROR DE CONFIGURACIÓN: Faltan las variables: ${faltantes.join(', ')}`);
        return { 
            statusCode: 500, 
            body: JSON.stringify({ error: `Configuración incompleta en Netlify: ${faltantes.join(', ')}` }) 
        };
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

        // 2. MOTOR DE PLANTILLAS DINÁMICAS (Prestige Email Engine)
        const { tipo } = JSON.parse(event.body);
        let emailSubject, emailHtml;

        if (tipo === 'CARRITO_COMPRA') {
            // Plantilla para el CLIENTE: Invitación al Carrito
            emailSubject = `✨ Todo listo para iniciar: ${servicio.titulo}`;
            emailHtml = `
                <div style="font-family: 'Montserrat', sans-serif; color: #0F3460; padding: 40px; border-top: 6px solid #957C3D; background: #fdfdfd; max-width: 600px; margin: auto;">
                    <h2 style="font-weight: 900; letter-spacing: 1px; text-transform: uppercase;">Tu Ruta de Crecimiento</h2>
                    <p style="font-size: 1.1rem; line-height: 1.6;">Hola <strong>${cliente.nombre}</strong>,</p>
                    <p style="font-size: 1rem; line-height: 1.6;">Es un gusto saludarte. Hemos preparado el acceso para tu siguiente paso estratégico en la <strong>Dreams Platform</strong>:</p>
                    
                    <div style="background: #0F3460; color: #ffffff; padding: 25px; border-radius: 12px; text-align: center; margin: 30px 0;">
                        <h3 style="margin: 0; color: #957C3D; font-size: 1.2rem;">${servicio.titulo}</h3>
                        <p style="font-size: 0.9rem; opacity: 0.8; margin-top: 10px;">Haz clic en el botón de abajo para completar tu registro y activar el servicio.</p>
                        <a href="https://miempresacrece.com.mx/checkout?service=${servicio.id}" 
                           style="display: inline-block; margin-top: 20px; padding: 15px 30px; background: #957C3D; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 700; letter-spacing: 1px;">
                           INGRESAR AL CARRITO
                        </a>
                    </div>

                    <p style="font-size: 0.85rem; color: #666; font-style: italic; text-align: center;">Si tienes alguna duda técnica, recuerda que puedes contactarnos respondiendo a este correo.</p>
                    <hr style="border: 0.5px solid rgba(15, 52, 96, 0.1); margin: 30px 0;">
                    <p style="font-size: 0.75rem; color: #999; text-align: center;">Enviado por Mi Empresa Crece | Dreams Intelligence System</p>
                </div>
            `;
        } else {
            // Plantilla para el ADMIN: Alerta de Intervención (Default)
            emailSubject = `🚀 Nueva Solicitud de Intervención: ${servicio.titulo}`;
            emailHtml = `
                <div style="font-family: 'Montserrat', sans-serif; color: #0F3460; padding: 30px; border-top: 6px solid #957C3D; background: #fdfdfd;">
                    <h2 style="font-weight: 900; letter-spacing: 1px;">ALERTA DE CONSULTORÍA</h2>
                    <p style="font-size: 1rem;">Se ha detectado una nueva solicitud estratégica:</p>
                    <div style="background: #fff; padding: 20px; border-radius: 12px; border: 1px solid #eee; margin: 20px 0;">
                        <p><strong>Líder:</strong> ${cliente.nombre}</p>
                        <p><strong>Email:</strong> ${cliente.email}</p>
                        <p><strong>Servicio:</strong> ${servicio.titulo}</p>
                    </div>
                    <p style="font-size: 0.75rem; color: #999;">Datos disponibles en el Panel Maestro.</p>
                </div>
            `;
        }

        // TRACEABILIDAD DE MARCA: Definición del Remitente Oficial
        const mailOptions = {
            from: `"Mi Empresa Crece" <${process.env.MAIL_USER}>`,
            to: destinatario,
            replyTo: 'contacto@miempresacrece.com.mx', // Asegura que si responden, llegue al lugar correcto
            subject: emailSubject,
            html: emailHtml
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
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                error: 'Fallo en la respuesta del servidor de correos',
                detalles: error.message,
                trazabilidad: "Netlify-Hook-Error"
            })
        };
    }
};