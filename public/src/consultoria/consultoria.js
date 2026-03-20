/**public/src/consultoria/consultoria.js
 * DREAMS PLATFORM | Consultoría Prestige Controller
 * Objetivo: Gestionar la oferta de servicios y la activación del Consultor IA.
 */
import { db, auth, collection, getDocs, query, where, checkAccess, doc, getDoc, setDoc } from '../shared/firebase-config.js';

let SERVICES_CONFIG = [];
let USER_STRATEGIC_CONTEXT = {}; // Trazabilidad: Almacén del ADN empresarial

document.addEventListener('DOMContentLoaded', async () => {
    const productsContainer = document.getElementById('consulting-cards-container');

    /**
     * MOTOR DE CARGA: Sincronización con config_consultoria
     */
    const fetchServices = async () => {
        try {
            // Solo traemos servicios activos para los clientes
            const q = query(collection(db, "config_consultoria"), where("isActive", "==", true));
            const querySnapshot = await getDocs(q);
            
            const rawServices = [];
            querySnapshot.forEach((doc) => {
                rawServices.push({ id: doc.id, ...doc.data() });
            });

            // TRACEABILIDAD: Verificamos acceso para cada servicio (si aplica)
            SERVICES_CONFIG = await Promise.all(rawServices.map(async (service) => {
                const hasAccess = await checkAccess('consultoria', service.id);
                return { ...service, hasAccess };
            }));

            renderServices();
        } catch (error) {
            console.error("🚨 Dreams Cloud Error:", error);
            if (productsContainer) {
                // TRACEABILIDAD: Identificamos si el fallo es por falta de reglas en Firebase
                const isPermissionError = error.code === 'permission-denied';
                productsContainer.innerHTML = `
                    <div style="padding: 20px; border-radius: 12px; background: rgba(149, 124, 61, 0.05); border: 1px dashed var(--accent-gold); text-align: center;">
                        <p style="font-size: 0.8rem; color: #666; margin: 0;">
                            ${isPermissionError 
                                ? "🔒 <strong>Sincronizando seguridad...</strong><br>Estamos configurando el acceso a los servicios de consultoría. Intenta recargar en un momento." 
                                : "⚠️ No pudimos conectar con el catálogo de servicios en este momento."}
                        </p>
                    </div>`;
            }
        }
    };

    /**
     * MOTOR DE RENDERIZADO: Construcción de Tarjetas Staff
     */
    const renderServices = () => {
        if (!productsContainer) return;

        // TRACER: Liberamos el contenedor para que el Bento Grid gestione la expansión
        productsContainer.style.display = "contents";

        // Filtramos solo los que NO son tipo IA para el listado de Staff/Paquetes
        const staffServices = SERVICES_CONFIG.filter(s => s.type !== 'IA');

        if (staffServices.length === 0) {
            productsContainer.innerHTML = "<p style='font-size:0.8rem; color:#999;'>Próximamente nuevos paquetes de staff.</p>";
            return;
        }

        productsContainer.innerHTML = staffServices.map(service => {
            // TRACEABILIDAD: Construcción dinámica del desglose de fases y actividades
            const phasesHtml = (service.phases || []).map((phase, idx) => {
                return `
                <div style="margin-top: 12px; padding-left: 12px; border-left: 2px solid var(--accent-gold);">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: 0.7rem; font-weight: 700; color: var(--primary-midnight); text-transform: uppercase; letter-spacing: 0.5px;">
                            ${idx + 1}. ${phase.title}
                        </span>
                    </div>
                </div>`;
            }).join('');

            return `
            <section class="card-recurso" style="grid-row: span 2; display: flex; flex-direction: column; justify-content: space-between; background: #fff; border: 1px solid rgba(15, 52, 96, 0.08); padding: 25px; border-radius: 16px; position: relative; overflow: hidden; height: 100%; box-sizing: border-box;">
                <div style="position: absolute; top: 0; left: 0; width: 100%; height: 4px; background: var(--primary-midnight); opacity: 0.1;"></div>
                <div style="overflow-y: hidden; display: flex; flex-direction: column; flex-grow: 1;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
                        <div style="flex: 1;">
                            <h4 style="margin: 0; color: var(--primary-midnight); font-size: 1.1rem; font-weight: 700;">${service.title}</h4>
                            <span style="color: var(--accent-gold); font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Servicio Estratégico Especializado</span>
                        </div>
                        <div style="text-align: right; margin-left: 15px;">
                            <span style="display: block; font-size: 0.6rem; color: #999; font-weight: 700; text-transform: uppercase;">Inversión:</span>
                            <span style="font-weight: 800; color: var(--primary-midnight); font-size: 1.25rem;">
                                $${(service.price || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>
                    
                    <div style="flex-grow: 1; margin-bottom: 20px;">
                        <p style="font-size: 0.85rem; color: #666; line-height: 1.6; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis;">
                            ${service.description}
                        </p>
                        <span style="font-size: 0.7rem; color: var(--accent-gold); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-top: 8px;">
                            + Ver detalles y promesa de valor
                        </span>
                    </div>
                    
                    <button class="btn-open-service-modal" 
                            data-id="${service.id}"
                            style="width: 100%; background: rgba(15, 52, 96, 0.03); border: 1px solid var(--accent-gold); padding: 12px; border-radius: 8px; color: var(--primary-midnight); font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; cursor: pointer; margin-bottom: 15px; transition: all 0.3s ease; display: flex; justify-content: center; align-items: center; gap: 8px;">
                        <span>Explorar Roadmap Estratégico</span>
                        <span style="font-size: 1.1rem; line-height: 1;">⊕</span>
                    </button>
                </div>

                <button class="btn-primary" 
                        data-action="request" 
                        data-id="${service.id}"
                        style="width: 100%; margin-top: 10px; padding: 14px; font-size: 0.75rem; font-weight: 700; background: var(--primary-midnight); color: #fff; border-radius: 8px; flex-shrink: 0;">
                    SOLICITAR INTERVENCIÓN
                </button>
            </section>`;
        }).join('');
    };

    // Inicialización del flujo
    fetchServices();

    /**
     * MOTOR DE ACCESO Y NOTIFICACIÓN: Consultor IA
     * Sincroniza el botón y permite solicitar acceso con un solo clic (Protocolo Prestige).
     */
    const syncIAAccess = async () => {
        const btnIA = document.getElementById('btn-ia-consultant');
        if (!btnIA) return;

        const hasIA = await checkAccess('consultor', 'ia-expert');

        if (hasIA) {
            btnIA.innerText = "INICIAR CONVERSACIÓN";
            btnIA.style.opacity = "1";
            btnIA.onclick = () => window.startIAConsultant();
        } else {
            btnIA.innerText = "SOLICITAR ACCESO";
            btnIA.onclick = async (e) => {
                e.preventDefault();
                const user = auth.currentUser;
                if (!user) return;

                const originalText = btnIA.innerText;
                btnIA.disabled = true;
                btnIA.innerText = "ENVIANDO...";

                try {
                    // TRACEABILIDAD: Extracción defensiva del perfil para evitar errores de Firebase (campos undefined)
                    const profileSnap = await getDoc(doc(db, "usuarios", user.uid));
                    const userData = profileSnap.exists() ? profileSnap.data() : {};
                    const nombreUsuario = userData.nombre || "Líder ME Crece";

                    // 1. REGISTRO UNIFICADO (Resiliencia + Panel Admin)
                    const solicitudId = `solicitud_ia_${Date.now()}`;
                    const leadData = {
                        usuarioId: user.uid,
                        email: user.email,
                        nombre: nombreUsuario,
                        interes: "Consultor IA (Acceso Premium)",
                        servicioId: "ia-expert",
                        estado: "pendiente",
                        fechaEnvio: new Date().toISOString(),
                        contexto: "Solicitud Directa IA"
                    };

                    await setDoc(doc(db, "solicitudes_contacto", solicitudId), leadData);

                    // 2. AVISO POR CORREO (Netlify Function - Solo Mensajería)
                    fetch('/.netlify/functions/intervencion-notificacion', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            destinatario: "contacto@miempresacrece.com.mx",
                            cliente: { uid: user.uid, email: user.email, nombre: nombreUsuario },
                            servicio: { id: "ia-expert", titulo: leadData.interes },
                            omitirRegistroFirestore: true // FLAG: Evita duplicados en la función
                        })
                    }).catch(() => console.warn("📧 Aviso por correo pendiente de despliegue en Netlify."));

                    alert("🚀 ¡Solicitud Recibida!\nTu interés ha quedado registrado en mi panel. En breve activaré tu acceso.");
                    btnIA.innerText = "SOLICITUD PENDIENTE";
                    btnIA.style.background = "#666";
                } catch (err) {
                    console.error("🚨 Error en la persistencia de solicitud:", err);
                    btnIA.innerText = originalText;
                    btnIA.disabled = false;
                }
            };
        }
    };

    syncIAAccess();

    /**
     * GESTIÓN DE INTERACCIONES
     */
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;

        const { action, id, target } = btn.dataset;

        // Lógica de la Cápsula Prestige (Modal de Detalle)
        if (btn.classList.contains('btn-open-service-modal')) {
            const service = SERVICES_CONFIG.find(s => s.id === id);
            if (!service) return;

            const modalOverlay = document.getElementById('service-modal-overlay');
            const modalBody = document.getElementById('service-modal-body');
            const btnRequest = document.getElementById('btn-modal-request');

            // 1. Construcción de Fases con Estética Prestige
            const phasesHtml = (service.phases || []).map((phase, idx) => `
                <div style="margin-bottom: 15px; padding-left: 15px; border-left: 3px solid var(--accent-gold);">
                    <span style="font-size: 0.7rem; font-weight: 700; color: var(--primary-midnight); text-transform: uppercase; letter-spacing: 0.5px;">
                        ${idx + 1}. ${phase.title}
                    </span>
                </div>
            `).join('');

            // 2. Inyección Dinámica de Contenido Inmersivo (Arquitectura Hook & Depth)
            modalBody.innerHTML = `
                <h3 style="color: var(--primary-midnight); font-weight: 900; margin-bottom: 5px;">${service.title}</h3>
                <span style="color: var(--accent-gold); font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 2px;">Servicio Estratégico Especializado</span>
                
                ${service.purposeDesc ? `
                    <div style="margin: 30px 0; padding: 30px; background: linear-gradient(135deg, rgba(149, 124, 61, 0.08), rgba(15, 52, 96, 0.02)); border-left: 5px solid var(--accent-gold); border-radius: 0 20px 20px 0; position: relative; overflow: hidden;">
                        <span style="position: absolute; top: -10px; right: 10px; font-size: 6rem; color: var(--accent-gold); opacity: 0.1; font-family: serif; pointer-events: none;">&ldquo;</span>
                        <span style="font-size: 0.65rem; font-weight: 800; color: var(--accent-gold); text-transform: uppercase; letter-spacing: 1.5px; display: block; margin-bottom: 12px;">Nuestra Promesa Prestige:</span>
                        <p style="font-size: 1.15rem; color: var(--primary-midnight); line-height: 1.5; font-style: italic; font-weight: 500; margin: 0; position: relative; z-index: 1;">
                            "${service.purposeDesc}"
                        </p>
                    </div>
                ` : ''}

                <div style="margin-bottom: 30px; line-height: 1.8; color: var(--text-color); font-size: 0.95rem; white-space: pre-wrap;">${service.description}</div>

                <div style="background: rgba(15, 52, 96, 0.03); padding: 25px; border-radius: 16px; border: 1px solid rgba(15, 52, 96, 0.05);">
                    <h4 style="font-size: 0.65rem; color: var(--accent-gold); font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
                        <span style="width: 20px; height: 1px; background: var(--accent-gold);"></span>
                        Roadmap de Intervención
                    </h4>
                    ${phasesHtml || '<p style="font-size: 0.7rem; color: #999; font-style: italic;">Consulte el desglose con su asesor senior.</p>'}
                </div>
            `;

            // 3. Sincronización del Botón de Solicitud (Acción Blindada)
            btnRequest.dataset.id = service.id;
            btnRequest.dataset.action = 'request'; 
            
            // 4. Activación de la Interfaz
            modalOverlay.classList.add('active');
            document.body.style.overflow = 'hidden'; // Bloqueo de scroll de fondo
            return;
        }

        // Lógica de Cierre de la Cápsula (Escape Visual)
        if (btn.id === 'btn-close-service-modal' || (e.target.id === 'service-modal-overlay' && !e.target.closest('.purpose-bubble'))) {
            document.getElementById('service-modal-overlay').classList.remove('active');
            document.body.style.overflow = '';
            return;
        }

        if (action === 'request') {
            const service = SERVICES_CONFIG.find(s => s.id === id);
            const user = auth.currentUser;

            if (!user) {
                alert("Por favor, inicia sesión para solicitar esta intervención.");
                return;
            }

            // MOTOR DE NOTIFICACIÓN PRESTIGE: Registro Directo + Handshake de Resiliencia
            const notificarIntervencion = async () => {
                const btnOriginalText = btn.innerText;
                try {
                    btn.disabled = true;
                    btn.innerText = "PROCESANDO...";

                    // 1. PERSISTENCIA NATIVA (Asegura la trazabilidad en Firestore inmediatamente)
                    const solicitudId = `solicitud_${service.id}_${Date.now()}`;
                    const leadData = {
                        usuarioId: user.uid,
                        email: user.email,
                        nombre: USER_STRATEGIC_CONTEXT.usuario?.nombre || "Líder ME Crece",
                        interes: service.title,
                        servicioId: service.id,
                        estado: "pendiente",
                        fechaEnvio: new Date().toISOString(), // Sincronizado con el estándar del ecosistema
                        canal: "Módulo Consultoría (Registro Directo)"
                    };

                    await setDoc(doc(db, "solicitudes_contacto", solicitudId), leadData);

                    // 2. AVISO POR CORREO (Netlify Function - Ejecución en segundo plano)
                    fetch('/.netlify/functions/intervencion-notificacion', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            destinatario: "contacto@miempresacrece.com.mx",
                            cliente: { uid: user.uid, email: user.email, nombre: leadData.nombre },
                            servicio: { id: service.id, titulo: service.title },
                            omitirRegistroFirestore: true // FLAG: Evita registros duplicados en la función
                        })
                    }).catch(err => console.warn("📧 Aviso por correo pendiente de configuración:", err));

                    alert(`🚀 ¡Solicitud Recibida!\n\nHemos registrado tu interés en "${service.title}" directamente en tu expediente. Un consultor senior revisará tu perfil en breve.`);
                    btn.innerText = "SOLICITUD REGISTRADA";
                } catch (err) {
                    console.error("🚨 Error en la persistencia del lead:", err);
                    alert("Hubo un problema al registrar tu solicitud. Por favor, intenta de nuevo.");
                    btn.disabled = false;
                    btn.innerText = btnOriginalText;
                }
            };

            notificarIntervencion();
        }
    });
});

/**
 * MOTOR DE INTELIGENCIA ESTRATÉGICA (IA PRESTIGE)
 * Objetivo: Orquestar la comunicación entre el expediente del usuario y Gemini.
 */
window.startIAConsultant = async () => {
    const chatContainer = document.getElementById('ai-chat-container');
    const chatMessages = document.getElementById('ai-chat-messages');
    const user = auth.currentUser;
    
    chatContainer.style.display = 'flex';

    if (!user) return;

    try {
        // 1. MOTOR DE EXTRACCIÓN: Recuperamos Perfil y Workbooks
        const loadingMsg = document.createElement('div');
        loadingMsg.id = 'ai-loading-dna';
        loadingMsg.style.cssText = "font-size: 0.7rem; color: var(--accent-gold); font-style: italic; margin-bottom: 15px;";
        loadingMsg.innerText = "Sincronizando expediente estratégico...";
        chatMessages.appendChild(loadingMsg);

        // A. Obtenemos datos de perfil (Nombre, Empresa, Rol)
        const profileSnap = await getDoc(doc(db, "usuarios", user.uid));
        const profileData = profileSnap.exists() ? profileSnap.data() : {};

        // B. Obtenemos todas las respuestas de sus workbooks
        const workbooksSnap = await getDocs(collection(db, "usuarios", user.uid, "progreso_workbooks"));
        const workbookData = {};
        workbooksSnap.forEach(doc => {
            workbookData[doc.id] = doc.data();
        });

        // 2. MOTOR DE IDENTIDAD: Cargamos el ADN institucional (JSON)
        const dnaResponse = await fetch('../shared/cultura-dna.json');
        const dnaData = await dnaResponse.json();

        // 3. CONSOLIDACIÓN DE CONTEXTO: Fusionamos ADN Cultural + ADN Empresarial
        USER_STRATEGIC_CONTEXT = {
            usuario: {
                nombre: profileData.nombre || "Líder ME Crece",
                empresa: profileData.empresa || "Empresa en Crecimiento",
                diagnosticos: workbookData
            },
            culturaInstitucional: dnaData // El Consultor IA ahora "bebe" de tu fuente de verdad
        };

        loadingMsg.innerText = `✅ ADN de ${USER_STRATEGIC_CONTEXT.empresa} sincronizado.`;
        setTimeout(() => loadingMsg.remove(), 2000);

    } catch (error) {
        console.error("🚨 Error al sincronizar contexto IA:", error);
    }
};

// --- ESCUCHADOR DE MENSAJES DEL CHAT ---
document.getElementById('ai-chat-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = document.getElementById('ai-user-input');
    const chatMessages = document.getElementById('ai-chat-messages');
    const userMessage = input.value.trim();

    if (!userMessage) return;

    // A. Renderizado del Mensaje del Usuario (Estilo Fino)
    const userBubble = `
        <div style="align-self: flex-end; background: var(--primary-midnight); color: white; padding: 12px 18px; border-radius: 18px 0 18px 18px; font-size: 0.85rem; max-width: 80%; box-shadow: 0 4px 15px rgba(15, 52, 96, 0.1);">
            ${userMessage}
        </div>
    `;
    chatMessages.insertAdjacentHTML('beforeend', userBubble);
    input.value = '';
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // B. Handshake Seguro con Netlify Function
    try {
        // Indicador de "IA escribiendo..."
        const typingId = 'ai-typing-' + Date.now();
        chatMessages.insertAdjacentHTML('beforeend', `<div id="${typingId}" style="font-size: 0.7rem; color: var(--accent-gold); font-style: italic; margin-bottom: 15px;">El Consultor está analizando...</div>`);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        const response = await fetch('/.netlify/functions/consultor-ia', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt: userMessage,
                userContext: USER_STRATEGIC_CONTEXT
            })
        });

        const data = await response.json();
        document.getElementById(typingId).remove(); // Quitamos el indicador

        // C. Renderizado de la respuesta Prestige
        const aiBubble = `
            <div style="align-self: flex-start; background: rgba(15, 52, 96, 0.05); padding: 15px 20px; border-radius: 0 18px 18px 18px; color: var(--primary-midnight); max-width: 85%; font-size: 0.85rem; border: 0.5px solid rgba(15, 52, 96, 0.1);">
                ${data.text}
            </div>
        `;
        chatMessages.insertAdjacentHTML('beforeend', aiBubble);
        chatMessages.scrollTop = chatMessages.scrollHeight;

    } catch (error) {
        console.error("🚨 Error de conexión IA:", error);
    }
});