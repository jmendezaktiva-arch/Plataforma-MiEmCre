/**public/src/consultoria/consultoria.js
 * DREAMS PLATFORM | Consultoría Prestige Controller
 * Objetivo: Gestionar la oferta de servicios y la activación del Consultor IA.
 */
import { db, auth, collection, getDocs, query, where, checkAccess, doc, getDoc } from '../shared/firebase-config.js';

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
                // Cálculo de horas por fase para transparencia total
                const phaseHours = (phase.activities || []).reduce((sum, act) => sum + (act.duration || 0), 0);
                
                return `
                <div style="margin-top: 12px; padding-left: 12px; border-left: 2px solid var(--accent-gold);">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: 0.7rem; font-weight: 700; color: var(--primary-midnight); text-transform: uppercase; letter-spacing: 0.5px;">
                            ${idx + 1}. ${phase.title}
                        </span>
                        <span style="font-size: 0.65rem; color: #999; font-weight: 600;">${phaseHours} hrs</span>
                    </div>
                    <ul style="margin: 6px 0 0 0; padding-left: 0; list-style: none;">
                        ${(phase.activities || []).map(act => `
                            <li style="font-size: 0.7rem; color: #777; margin-bottom: 4px; display: flex; justify-content: space-between;">
                                <span>• ${act.title}</span>
                                <span style="color: #bbb; font-style: italic;">${act.duration}h</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>`;
            }).join('');

            return `
            <section class="card-recurso" style="grid-row: span 2; display: flex; flex-direction: column; justify-content: space-between; background: #fff; border: 1px solid rgba(15, 52, 96, 0.08); padding: 25px; border-radius: 16px; position: relative; overflow: hidden; height: 100%; box-sizing: border-box;">
                <div style="position: absolute; top: 0; left: 0; width: 100%; height: 4px; background: var(--primary-midnight); opacity: 0.1;"></div>
                <div style="overflow-y: hidden; display: flex; flex-direction: column; flex-grow: 1;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
                        <div style="flex: 1;">
                            <h4 style="margin: 0; color: var(--primary-midnight); font-size: 1.1rem; font-weight: 700;">${service.title}</h4>
                            <div style="display: flex; gap: 8px; margin-top: 6px; flex-wrap: wrap;">
                                <span style="background: rgba(149, 124, 61, 0.1); color: var(--accent-gold); padding: 3px 10px; border-radius: 6px; font-size: 0.6rem; font-weight: 800; text-transform: uppercase;">
                                    ⏱️ ${service.totalHours || 0} Horas
                                </span>
                                <span style="background: #f4f4f4; color: #888; padding: 3px 10px; border-radius: 6px; font-size: 0.6rem; font-weight: 800; text-transform: uppercase;">
                                    📁 ${(service.phases || []).length} Fases
                                </span>
                            </div>
                        </div>
                        <span style="font-weight: 800; color: var(--primary-midnight); font-size: 1.1rem; margin-left: 10px;">
                            $${(service.price || 0).toLocaleString('es-MX')}
                        </span>
                    </div>
                    
                    <p style="font-size: 0.85rem; color: #666; line-height: 1.5; margin-bottom: 15px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${service.description}</p>
                    
                    <div class="project-roadmap" style="background: rgba(15, 52, 96, 0.02); border-radius: 12px; padding: 15px; border: 1px solid rgba(15, 52, 96, 0.04); flex-grow: 1; overflow-y: auto; margin-bottom: 10px; max-height: 160px;">
                        <span style="font-size: 0.6rem; color: #999; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 5px;">Roadmap de Intervención:</span>
                        ${phasesHtml || '<p style="font-size: 0.7rem; color: #bbb; font-style: italic;">Consultar desglose con el asesor.</p>'}
                    </div>
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
     * GESTIÓN DE INTERACCIONES
     */
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;

        const { action, id } = btn.dataset;

        if (action === 'request') {
            const service = SERVICES_CONFIG.find(s => s.id === id);
            alert(`🚀 Intervención Estratégica:\nHas solicitado información sobre: ${service.title}.\nUn consultor senior se pondrá en contacto contigo.`);
            // Aquí conectarás con tu CRM o sistema de correos
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
                nombre: profileData.nombre || "Líder Dreams",
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