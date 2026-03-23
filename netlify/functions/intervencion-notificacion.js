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
            port: Number(process.env.MAIL_PORT), 
            secure: Number(process.env.MAIL_PORT) === 465, 
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            },
            tls: {
                // Protocolo de Seguridad: Permite la conexión aunque el certificado 
                // del servidor no coincida exactamente con el host (común en cPanel/Webmail)
                rejectUnauthorized: false 
            }
        });

        // 2. MOTOR DE RESPUESTA HÍBRIDA (ME Crece Intelligence Engine)
        const { tipo } = JSON.parse(event.body);
        let emailSubject, emailHtml;

        // Estilos Base Prestige para consistencia de marca
        const headerStyle = "font-family: 'Montserrat', sans-serif; color: #0F3460; padding: 40px; border-top: 6px solid #957C3D; background: #fdfdfd; max-width: 600px; margin: auto;";
        const footerStyle = "font-size: 0.75rem; color: #999; text-align: center; margin-top: 30px; font-family: 'Montserrat', sans-serif;";
        const buttonStyle = "display: inline-block; margin-top: 20px; padding: 15px 30px; background: #0F3460; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 700; letter-spacing: 1px;";

        if (tipo === 'CARRITO_COMPRA') {
            emailSubject = `✨ Todo listo para iniciar el crecimiento de ${cliente.empresa || 'tu negocio'}`;
            emailHtml = `
                <div style="${headerStyle}">
                    <h2 style="font-weight: 900; text-transform: uppercase;">Tu Ruta de Crecimiento</h2>
                    <p>Hola <strong>${cliente.nombre}</strong>, es un gusto saludarte.</p>
                    <p>Nos entusiasma ver que estás listo para dar el siguiente paso estratégico en la <strong>ME Crece Platform</strong>. Hemos preparado tu acceso para que no pierdas el impulso hacia la profesionalización de tu negocio.</p>
                    <div style="text-align: center; margin: 30px 0; background: #f9f9f9; padding: 25px; border-radius: 12px;">
                        <h3 style="color: #957C3D; margin: 0;">${servicio.titulo}</h3>
                        <a href="https://miempresacrece.com.mx/checkout?service=${servicio.id}" style="${buttonStyle}">ACTIVAR MI ACCESO</a>
                    </div>
                    <p style="font-size: 0.85rem; color: #666; text-align: center; font-style: italic;">"El éxito económico es consecuencia de un liderazgo ético."</p>
                    <div style="${footerStyle}">ME Crece Platform | Arquitectos de Legados PyME</div>
                </div>
            `;
        } else if (tipo === 'INTERES_APPS') {
            emailSubject = `🚀 Escalando la operativa de ${cliente.empresa || 'tu empresa'}`;
            emailHtml = `
                <div style="${headerStyle}">
                    <h2 style="font-weight: 900; text-transform: uppercase;">Arquitectura de Procesos</h2>
                    <p>Hola <strong>${cliente.nombre}</strong>,</p>
                    <p>Pasar del caos operativo a una arquitectura de procesos es posible con las herramientas de <strong>ME Crece Platform</strong>. Nuestro CRM, ERP y Process Designer están listos para darte el control total que tu liderazgo requiere.</p>
                    <div style="background: #0F3460; color: #ffffff; padding: 25px; border-radius: 12px; text-align: center; margin: 30px 0;">
                        <p style="margin: 0 0 15px 0;">Queremos que veas el impacto real por ti mismo. Te invitamos a una videollamada para diseñar tu ecosistema digital a medida.</p>
                        <a href="https://zoom.us/j/ME-CRECE-VENTAS" style="display: inline-block; padding: 12px 25px; background: #957C3D; color: #fff; text-decoration: none; border-radius: 6px; font-weight: 700;">AGENDAR SESIÓN POR ZOOM</a>
                    </div>
                    <div style="${footerStyle}">Enviado por ME Crece Platform</div>
                </div>
            `;
        } else if (tipo === 'CONFIRMACION_SOPORTE') {
            const esTecnico = servicio.titulo.includes('Técnica') || servicio.titulo.includes('Soporte');
            emailSubject = esTecnico ? `🛠️ Hemos recibido tu mensaje: Soporte ME Crece` : `💡 Sobre tu consulta estratégica para ${cliente.empresa || 'tu empresa'}`;
            
            const mensajeHtml = esTecnico 
                ? `Confirmamos que tu reporte técnico ya está en nuestras manos. Entendemos que tu tiempo es el recurso más valioso dentro de la <strong>ME Crece Platform</strong>, por lo que nuestro equipo de IT ya está revisando tu acceso para que puedas retomar tus actividades en breve.`
                : `Qué buena pregunta. Validar estos desafíos estratégicos es el primer paso para la trascendencia de tu PyME dentro del ecosistema <strong>ME Crece</strong>. Para darte una respuesta con el rigor que tu empresa merece, te sugiero profundizar en este tema a través de nuestro <strong>Consultor IA</strong> o agendar una intervención directa con nuestro staff senior.`;

            emailHtml = `
                <div style="${headerStyle}">
                    <h2 style="font-weight: 900; text-transform: uppercase;">Atención al Socio</h2>
                    <p>Hola <strong>${cliente.nombre}</strong>,</p>
                    <p>${mensajeHtml}</p>
                    <hr style="border: 0.5px solid #eee; margin: 30px 0;">
                    <div style="${footerStyle}">ME Crece | Soporte Estratégico</div>
                </div>
            `;
        } else {
            // ALERTA PARA JORGE (Administración)
            emailSubject = `🚨 Nueva Intervención: ${servicio.titulo} [${cliente.nombre}]`;
            emailHtml = `<p>Se ha detectado una nueva solicitud de tipo: <strong>${tipo}</strong>.</p><p>Cliente: ${cliente.nombre} (${cliente.email})</p>`;
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