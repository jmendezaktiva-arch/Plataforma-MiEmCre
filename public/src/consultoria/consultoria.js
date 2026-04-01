/**public/src/consultoria/consultoria.js
 * Mi Empresa Crece PLATFORM | Consultoría Prestige Controller
 * Objetivo: Gestionar la oferta de servicios y la activación del Consultor IA.
 */
import { db, auth, collection, getDocs, query, where, checkAccess, doc, getDoc, setDoc } from '../shared/firebase-config.js';

let SERVICES_CONFIG = [];
let USER_STRATEGIC_CONTEXT = {}; // Trazabilidad: Almacén del ADN empresarial

document.addEventListener('DOMContentLoaded', async () => {
    const productsContainer = document.getElementById('consulting-cards-container');
    // 1. Referencia al Header Aura (Sincronización Prestige)
    const auraTitle = document.getElementById('header-aura-title');
    // Nota: La identidad visual ya reside de forma estable en el HTML para evitar parpadeos.

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
            <section class="card bento-item glass-card bento-kpi-card animate-fade-in">
                <div class="card-content" style="display: flex; flex-direction: column; height: 100%; width: 100%;">
                    <header class="card-header-app" style="margin-bottom: 20px;">
                        <span class="card-category" style="color: var(--accent-gold); display: block; margin-bottom: 5px; font-size: var(--font-size-label); font-weight: 700;">Servicio Especializado</span>
                        <h3 style="color: var(--primary-midnight); margin: 0; font-size: var(--font-size-h3); font-weight: 700;">${service.title}</h3>
                        <div style="margin-top: 10px;">
                            <span style="font-size: var(--font-size-label); font-weight: 800; color: var(--primary-midnight);">
                                Inversión: $${(service.price || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                            </span>
                        </div>
                    </header>
                    
                    <div class="card-body" style="flex-grow: 1; margin-bottom: 25px;">
                        <p style="font-size: var(--font-size-body); line-height: 1.7; color: var(--text-color); font-weight: 400;">
                            ${service.description}
                        </p>
                        <button class="btn-open-service-modal" data-id="${service.id}" 
                                style="background: none; border: none; color: var(--accent-gold); font-size: var(--font-size-label); font-weight: 700; cursor: pointer; padding: 0; text-transform: uppercase; letter-spacing: 1px;">
                            + Ver Roadmap Estratégico
                        </button>
                    </div>

                    <footer class="card-footer-app" style="margin-top: auto;">
                        <button class="btn-primary" data-action="request" data-id="${service.id}" style="font-size: var(--font-size-button); padding: 16px;">
                            SOLICITAR INTERVENCIÓN
                        </button>
                    </footer>
                </div>
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
        const auraActions = document.getElementById('header-aura-actions'); // Conexión directa con la Zona de Acción del Header Aura
        
        if (!btnIA) return;

        const hasIA = await checkAccess('consultor', 'ia-expert');

        if (hasIA) {
            // 1. Sincronización en el Cuerpo (Tarjeta)
            btnIA.innerText = "INICIAR CONVERSACIÓN";
            btnIA.style.opacity = "1";
            btnIA.onclick = () => window.startIAConsultant();

            // 2. Sincronización en Header Aura (Solo lógica, no HTML)
            const navBtnIA = document.getElementById('btn-nav-ia');
            if (navBtnIA) {
                navBtnIA.onclick = () => window.startIAConsultant();
                navBtnIA.style.borderColor = "var(--secondary-color)"; // Verde de éxito si ya tiene acceso
            }
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
                    // Trazabilidad: Priorizamos nombre real, si no existe usamos el correo, 
                    // evitando sobreescribir con el nombre de la marca.
                    const nombreUsuario = userData.nombre || user.email.split('@')[0];

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

                    // 2. DISPARO DE CARRITO (Protocolo de Conversión Real)
                    fetch('/.netlify/functions/intervencion-notificacion', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            destinatario: user.email, // Respuesta inmediata al cliente
                            cliente: { uid: user.uid, email: user.email, nombre: nombreUsuario },
                            servicio: { id: "ia-expert", titulo: leadData.interes },
                            tipo: 'CARRITO_COMPRA', // Detona el flujo comercial
                            omitirRegistroFirestore: true 
                        })
                    }).catch(err => console.error("🚨 Error en despacho IA:", err));

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
            // TRACEABILIDAD: Normalización de ID (Coacción a String) para evitar fallos por discrepancia de tipos
            const service = SERVICES_CONFIG.find(s => String(s.id).trim() === String(id).trim());
            
            if (!service) {
                console.error(`🚨 Dreams Trace Error: No se encontró el servicio con ID [${id}] en el catálogo activo.`);
                return;
            }

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
            // TRACEABILIDAD: Búsqueda normalizada con soporte para servicios estáticos (Hardcoded)
            let service = SERVICES_CONFIG.find(s => String(s.id).trim() === String(id).trim());

            // Protocolo de Resiliencia: Si el servicio no está en DB (como Proyectos a Medida), creamos un objeto virtual
            if (!service && id === 'proyectos-a-medida') {
                service = { id: 'proyectos-a-medida', title: 'Proyectos a Medida (Cotización Staff)' };
            }

            const user = auth.currentUser;

            if (!service) {
                console.error(`🚨 Dreams Request Error: No se halló el ID [${id}]. La solicitud no puede procesarse.`);
                return;
            }

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
                        // Trazabilidad: Usamos el contexto estratégico del usuario o el prefijo de su email
                        nombre: USER_STRATEGIC_CONTEXT.usuario?.nombre || user.email.split('@')[0],
                        interes: service.title,
                        servicioId: service.id,
                        estado: "pendiente",
                        fechaEnvio: new Date().toISOString(), // Sincronizado con el estándar del ecosistema
                        canal: "Módulo Consultoría (Registro Directo)"
                    };

                    await setDoc(doc(db, "solicitudes_contacto", solicitudId), leadData);

                    // 2. DISPARO AUTOMÁTICO (Superpoder de Respuesta en Tiempo Real)
                    fetch('/.netlify/functions/intervencion-notificacion', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            destinatario: user.email, // El cliente recibe la respuesta de inmediato
                            cliente: { uid: user.uid, email: user.email, nombre: leadData.nombre },
                            servicio: { id: service.id, titulo: service.title },
                            tipo: 'CARRITO_COMPRA', // Identificamos la solicitud como intención de compra
                            omitirRegistroFirestore: true // Mantenemos integridad (ya registrado arriba)
                        })
                    }).catch(err => console.warn("🚨 Fallo en despacho automático:", err));

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

    /**
     * REDIRECCIONAMIENTO DE RESILIENCIA (DREAMS CORE)
     * Detecta si el socio llega desde otro módulo con la intención de consultar a la IA.
     */
    const detectExternalIntent = () => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('action') === 'startIA') {
            setTimeout(() => {
                console.log("🎯 Dreams Resilience: Detectada intención de IA externa. Ejecutando handshake...");
                if (typeof window.startIAConsultant === 'function') {
                    window.startIAConsultant();
                }
            }, 800);
        }
    };

    detectExternalIntent();
});

// TRACEABILIDAD: El motor IA ha sido migrado al SidebarPrestige para permitir consultas cross-module.
// El controlador local ahora solo gestiona la oferta de servicios staff y el estado del acceso.